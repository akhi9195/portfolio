import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRide } from '../store';
import CameraRig from './CameraRig';
import City from './City';
import Environment from './Environment';
import { Billboards, Clouds, Letters, Stars } from './Features';
import { Buddha, CableBridge, Charminar, CyberTowers } from './Landmarks';
import Rider from './Rider';
import Road from './Road';

// Report asset loading to the start screen's counter.
THREE.DefaultLoadingManager.onProgress = (_url, loaded, total) => {
  useRide.getState().setLoaded(Math.min(99, (loaded / Math.max(total, 1)) * 100));
};

/** Smooths scroll progress so the ride glides instead of jumping. */
function ScrollSmoother() {
  useFrame((_, dt) => {
    const s = useRide.getState();
    const next = s.reducedMotion ? s.target : THREE.MathUtils.damp(s.progress, s.target, 3.2, Math.min(dt, 0.1));
    if (Math.abs(next - s.progress) > 1e-5) s.setProgress(next);
  });
  return null;
}

/**
 * Watches the frame rate for a few seconds after start. On slow machines it switches to the
 * light mode (no shadows, lower resolution, cheaper water) so scrolling stays responsive.
 */
function QualityGuard() {
  const frames = useRef<number[]>([]);
  const decided = useRef(false);
  useFrame((_, dt) => {
    const s = useRide.getState();
    if (decided.current || !s.started || s.lowPower) return;
    frames.current.push(dt);
    if (frames.current.length < 90) return;
    const avg = frames.current.slice(20).reduce((a, b) => a + b, 0) / (frames.current.length - 20);
    decided.current = true;
    if (avg > 1 / 30) s.setEnv({ lowPower: true });
  });
  return null;
}

/** Mounted only once every model and texture inside the Suspense boundary has loaded. */
function Ready() {
  useEffect(() => {
    useRide.getState().setLoaded(100);
  }, []);
  return null;
}

export default function World() {
  const lowPower = useRide((s) => s.lowPower);
  return (
    <Canvas
      shadows
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: !lowPower, powerPreference: 'high-performance' }}
      camera={{ fov: 50, near: 0.1, far: 6000, position: [6, 2, 2] }}
      aria-hidden
    >
      <ScrollSmoother />
      <QualityGuard />
      <Suspense fallback={null}>
        <Environment />
        <Road />
        <City />
        <Charminar />
        <Buddha />
        <CyberTowers />
        <CableBridge />
        <Letters />
        <Billboards />
        <Stars />
        <Clouds />
        <Rider />
        <CameraRig />
        <Ready />
      </Suspense>
    </Canvas>
  );
}
