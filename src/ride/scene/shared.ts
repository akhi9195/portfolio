import * as THREE from 'three';

/** Rider position/heading, updated every frame by the Rider and read by the camera, sun and stars. */
export const riderPos = new THREE.Vector3();
export const riderForward = new THREE.Vector3(0, 0, -1);

/** Deterministic random numbers, so the city looks the same on every visit. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
