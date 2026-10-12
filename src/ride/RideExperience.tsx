import { Component, useEffect, type ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import World from './scene/World';
import { useRide } from './store';
import Overlays from './ui/Overlays';

/** How many screen-heights of scrolling the whole ride takes. More = slower ride per wheel tick. */
export const RIDE_SCREENS = 11;

class CanvasBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function RideExperience({ onFail }: { onFail: () => void }) {
  const started = useRide((s) => s.started);
  const reduced = useReducedMotion();

  useEffect(() => {
    const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    useRide.getState().setEnv({ reducedMotion: reduced, lowPower: coarse || (navigator.hardwareConcurrency ?? 8) <= 4 });
  }, [reduced]);

  // Scrolling drives the ride. We read the wheel, touch swipes and keys directly instead of
  // scrolling a very tall page, so it behaves the same in every browser and on every device.
  useEffect(() => {
    if (!started) return;
    const length = () => RIDE_SCREENS * window.innerHeight;
    const nudge = (px: number) => {
      const s = useRide.getState();
      if (s.modal) return;
      s.setTarget(Math.min(1, Math.max(0, s.target + px / length())));
    };
    const insideScrollable = (t: EventTarget | null) => t instanceof Element && !!t.closest('[data-own-scroll]');

    const onWheel = (e: WheelEvent) => {
      if (insideScrollable(e.target) || e.ctrlKey) return; // let panels scroll; ctrl+wheel = browser zoom
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      // Horizontal trackpad swipes count too.
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      nudge(d * unit);
    };

    let lastY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      lastY = insideScrollable(e.target) ? null : e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (lastY === null) return;
      const y = e.touches[0].clientY;
      nudge((lastY - y) * 1.6); // swipe up = ride forward
      lastY = y;
    };
    const onTouchEnd = () => {
      lastY = null;
    };

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const page = window.innerHeight * 0.9;
      const step: Record<string, number> = {
        ArrowDown: 120, ArrowUp: -120, PageDown: page, PageUp: -page, ' ': e.shiftKey ? -page : page,
      };
      if (e.key === 'Home' || e.key === 'End') {
        useRide.getState().setTarget(e.key === 'Home' ? 0 : 1);
        e.preventDefault();
      } else if (e.key in step) {
        if (e.key === ' ' && el instanceof HTMLButtonElement) return; // Space on a button presses it
        nudge(step[e.key]);
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [started]);

  // The page itself never scrolls; the ride is driven by the handlers above.
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0">
        <CanvasBoundary onError={onFail}>
          <World />
        </CanvasBoundary>
      </div>
      {started && <Overlays />}
    </>
  );
}
