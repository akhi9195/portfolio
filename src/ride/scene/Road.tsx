import { useMemo } from 'react';
import * as THREE from 'three';
import { ROAD_CURVE, rampHeight, RAMP_START_Z } from '../route';
import { roadTexture } from './textures';

const ROAD_W = 9;
const WALK_W = 3;

/** A flat ribbon following the road curve. `from`/`to` are offsets from the centre line (metres). */
function ribbon(from: number, to: number, y: number, vScale: number) {
  const N = 400;
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  let dist = 0;
  let prev = ROAD_CURVE.getPointAt(0);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = ROAD_CURVE.getPointAt(t);
    dist += p.distanceTo(prev);
    prev = p;
    const tan = ROAD_CURVE.getTangentAt(t);
    const right = new THREE.Vector3().crossVectors(tan, up).normalize();
    const h = rampHeight(p.z) + y;
    const a = p.clone().addScaledVector(right, from);
    const b = p.clone().addScaledVector(right, to);
    pos.push(a.x, h, a.z, b.x, h, b.z);
    uv.push(0, dist / vScale, 1, dist / vScale);
    if (i < N) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export default function Road() {
  const { road, walkL, walkR, tex } = useMemo(() => {
    const tex = roadTexture();
    return {
      road: ribbon(-ROAD_W / 2, ROAD_W / 2, 0.03, 12),
      walkL: ribbon(-ROAD_W / 2 - WALK_W, -ROAD_W / 2, 0.15, 3),
      walkR: ribbon(ROAD_W / 2, ROAD_W / 2 + WALK_W, 0.15, 3),
      tex,
    };
  }, []);
  // Ramp supports under the take-off
  const end = ROAD_CURVE.getPointAt(1);
  return (
    <group>
      <mesh geometry={road} receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
      <mesh geometry={walkL} receiveShadow>
        <meshStandardMaterial color="#e8c3b3" roughness={1} />
      </mesh>
      <mesh geometry={walkR} receiveShadow>
        <meshStandardMaterial color="#e8c3b3" roughness={1} />
      </mesh>
      {/* Ramp side walls */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[end.x + s * (ROAD_W / 2 + 0.3), 0.6, (RAMP_START_Z + end.z) / 2]} castShadow>
          <boxGeometry args={[0.6, 1.2, Math.abs(end.z - RAMP_START_Z)]} />
          <meshStandardMaterial color="#e0b2a2" />
        </mesh>
      ))}
    </group>
  );
}
