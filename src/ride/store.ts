import { create } from 'zustand';

export type RideState = {
  /** Asset loading, 0..100. */
  loaded: number;
  /** The visitor pressed Start. Until then the page doesn't scroll. */
  started: boolean;
  /** Scroll position 0..1 (target) and the smoothed value the scene uses. */
  target: number;
  progress: number;
  reducedMotion: boolean;
  lowPower: boolean;
  /** Project slug open in the full-card modal, or a section opened in full. */
  modal: { kind: 'project'; index: number } | { kind: 'experience' } | { kind: 'skills' } | null;
  setLoaded: (n: number) => void;
  start: () => void;
  setTarget: (t: number) => void;
  setProgress: (p: number) => void;
  setModal: (m: RideState['modal']) => void;
  setEnv: (e: { reducedMotion?: boolean; lowPower?: boolean }) => void;
};

export const useRide = create<RideState>((set) => ({
  loaded: 0,
  started: false,
  target: 0,
  progress: 0,
  reducedMotion: false,
  lowPower: false,
  modal: null,
  setLoaded: (n) => set((s) => ({ loaded: Math.max(s.loaded, Math.round(n)) })),
  start: () => set({ started: true }),
  setTarget: (t) => set({ target: t }),
  setProgress: (p) => set({ progress: p }),
  setModal: (m) => set({ modal: m }),
  setEnv: (e) => set(e),
}));
