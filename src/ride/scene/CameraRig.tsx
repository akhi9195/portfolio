import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useRide } from '../store';
import { riderForward, riderPos } from './shared';

/**
 * A cinematic camera that follows the rider. Each key sets the camera offset in the rider's
 * frame for a scroll position; between keys it blends smoothly. The visitor never steers it.
 *   back: metres behind the rider (negative = in front)   side: metres to the right
 *   up: metres above   ahead/lookSide/lookUp: where it looks, relative to the rider
 */
type Key = { p: number; back: number; side: number; up: number; ahead: number; lookSide: number; lookUp: number };

export const CAMERA_KEYS: Key[] = [
  { p: 0.0, back: 5.6, side: 2.6, up: 1.7, ahead: 18, lookSide: -16, lookUp: 3.2 }, // hero: rider, lake, Buddha, sunset
  { p: 0.035, back: 5.8, side: 2.2, up: 1.9, ahead: 16, lookSide: -10, lookUp: 2.6 },
  { p: 0.07, back: 6.2, side: 1.6, up: 2.4, ahead: 10, lookSide: 0, lookUp: 1.3 }, // chase
  { p: 0.12, back: 6.5, side: -2.2, up: 2.6, ahead: 12, lookSide: 3.5, lookUp: 2.2 }, // About letters on the right
  { p: 0.2, back: 6.5, side: -1.5, up: 2.6, ahead: 12, lookSide: 2, lookUp: 2 },
  { p: 0.27, back: 7, side: 3.4, up: 3.0, ahead: 14, lookSide: -7, lookUp: 6 }, // Charminar on the left
  { p: 0.38, back: 7, side: 3.0, up: 2.8, ahead: 12, lookSide: -5, lookUp: 5 },
  { p: 0.45, back: 7, side: 0, up: 2.8, ahead: 12, lookSide: 0, lookUp: 2.5 }, // billboards
  { p: 0.6, back: 7, side: 0.5, up: 2.8, ahead: 12, lookSide: 0, lookUp: 3 },
  { p: 0.65, back: 6, side: 1.2, up: 2.2, ahead: 10, lookSide: 0, lookUp: 3.2 }, // stars, towers
  { p: 0.84, back: 6, side: 1.2, up: 2.2, ahead: 10, lookSide: 0, lookUp: 4 },
  { p: 0.88, back: 8, side: 2.5, up: 3, ahead: 10, lookSide: 0, lookUp: 1.5 }, // take-off
  { p: 0.94, back: 9, side: 5, up: 4, ahead: 8, lookSide: 0, lookUp: 0.5 }, // climbing
  { p: 1.0, back: 0.5, side: 8, up: 1.4, ahead: 3.5, lookSide: -4, lookUp: 1.0 }, // flying above the clouds
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export function cameraKeyAt(p: number): Key {
  const keys = CAMERA_KEYS;
  if (p <= keys[0].p) return keys[0];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (p <= b.p) {
      const t = smooth((p - a.p) / (b.p - a.p));
      const out = { ...a };
      (Object.keys(a) as (keyof Key)[]).forEach((k) => (out[k] = a[k] + (b[k] - a[k]) * t));
      return out;
    }
  }
  return keys[keys.length - 1];
}

const flatF = new THREE.Vector3();
const right = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const wantPos = new THREE.Vector3();
const wantLook = new THREE.Vector3();
const curLook = new THREE.Vector3();
let initialised = false;

export default function CameraRig() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useFrame((_, dt) => {
    const s = useRide.getState();
    const override = (window as unknown as { __cam?: Key }).__cam;
    const base = override ?? cameraKeyAt(s.progress);
    // Portrait phones: pull back and look closer to the rider so they stay in the narrow frame.
    const portrait = size.width < size.height;
    const k = portrait
      ? { ...base, back: base.back * 1.45 + 2, side: base.side * 0.75, up: base.up * 1.2 + 0.6, lookSide: base.lookSide * 0.15, lookUp: base.lookUp + 1.6, ahead: base.back < 2 ? base.ahead * 0.15 : base.ahead }
      : base;
    flatF.set(riderForward.x, 0, riderForward.z).normalize();
    right.crossVectors(flatF, UP).normalize();
    wantPos
      .copy(riderPos)
      .addScaledVector(flatF, -k.back)
      .addScaledVector(right, k.side)
      .addScaledVector(UP, k.up);
    wantLook
      .copy(riderPos)
      .addScaledVector(flatF, k.ahead)
      .addScaledVector(UP, riderForward.y * k.ahead * 0.4)
      .addScaledVector(right, k.lookSide)
      .addScaledVector(UP, k.lookUp);
    if (!initialised || s.reducedMotion) {
      camera.position.copy(wantPos);
      curLook.copy(wantLook);
      initialised = riderPos.lengthSq() > 0;
    } else {
      const a = 1 - Math.exp(-dt * 5);
      camera.position.lerp(wantPos, a);
      curLook.lerp(wantLook, a);
    }
    camera.lookAt(curLook);
  });
  return null;
}
