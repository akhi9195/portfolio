import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { BILLBOARD_PROGRESS, LANDMARKS, ROAD_CURVE, pointAtProgress } from '../route';
import { mergeAll } from './Environment';
import { seeded } from './shared';
import { facadeTexture, glassLightsTexture, glassTexture } from './textures';

type Zone = 'bund' | 'old' | 'hitec';
const zoneAt = (z: number): Zone => (z > -150 ? 'bund' : z > -300 ? 'old' : 'hitec');

const PALETTE: Record<Zone, string[]> = {
  bund: ['#f1c7b5', '#efd2c2', '#e9b9a7', '#f3dccd', '#e6c0b9'],
  old: ['#e39c7c', '#d98c6f', '#eab08c', '#d7a07e', '#e8bf99'],
  hitec: ['#9fb4d4', '#b3c2dc', '#c9d2e4', '#a7b7d0', '#d6cfe0'],
};

/**
 * A box with UVs in world units (one texture tile = `tile` metres), so windows keep their size
 * whatever the building's dimensions. Roofs sample a plain part of the texture.
 */
function box(w: number, h: number, d: number, tile: number, color: THREE.Color) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i));
    const ny = Math.abs(n.getY(i));
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (ny > 0.5) uv.setXY(i, 0.1, 0.97);
    else if (nx > 0.5) uv.setXY(i, (u * d) / tile, (v * h) / tile);
    else uv.setXY(i, (u * w) / tile, (v * h) / tile);
  }
  const colors = new Float32Array(g.attributes.position.count * 3);
  for (let i = 0; i < colors.length; i += 3) colors.set([color.r, color.g, color.b], i);
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.translate(0, h / 2, 0);
  return g;
}

function placed(g: THREE.BufferGeometry, pos: THREE.Vector3, yaw: number) {
  g.rotateY(yaw);
  g.translate(pos.x, pos.y, pos.z);
  return g;
}

function blocked(p: THREE.Vector3, radius: number) {
  const L = LANDMARKS.lake;
  if (p.x > L.minX - radius && p.x < L.maxX + radius && p.z > L.minZ - radius && p.z < L.maxZ + radius) return true;
  if (p.distanceTo(LANDMARKS.charminar) < 34 + radius) return true;
  if (p.distanceTo(LANDMARKS.cyberTowers) < 26 + radius) return true;
  if (p.distanceTo(LANDMARKS.buddha) < 30 + radius) return true;
  return false;
}

type CityGeo = { facade: THREE.BufferGeometry; glass: THREE.BufferGeometry; domes: THREE.BufferGeometry };

function buildCity(): CityGeo {
  const rnd = seeded(42);
  const facade: THREE.BufferGeometry[] = [];
  const glass: THREE.BufferGeometry[] = [];
  const domes: THREE.BufferGeometry[] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const len = ROAD_CURVE.getLength();

  for (const side of [-1, 1]) {
    for (const row of [0, 1, 2]) {
      let s = row * 5;
      while (s < len - 12) {
        const t = Math.min(1, s / len);
        const p = ROAD_CURVE.getPointAt(t);
        const tan = ROAD_CURVE.getTangentAt(t);
        const right = new THREE.Vector3().crossVectors(tan, up).normalize();
        const zone = zoneAt(p.z);
        const hitec = zone === 'hitec';
        const w = hitec ? 16 + rnd() * 12 : 8 + rnd() * 9;
        const d = hitec ? 16 + rnd() * 10 : 10 + rnd() * 6;
        const offset = 11 + row * (hitec ? 30 : 20) + d / 2 + rnd() * 2;
        const c = p.clone().addScaledVector(right, side * offset);
        s += w + (hitec ? 6 + rnd() * 8 : 0.5 + rnd() * 1.5);
        if (blocked(c, Math.max(w, d) / 2)) continue;
        // Leave a gap on the right side at the start, so the hero view looks across the lake.
        if (zone === 'bund' && p.z > -20 && side > 0 && row === 0 && rnd() < 0.5) continue;

        const yaw = Math.atan2(tan.x, tan.z);
        const color = new THREE.Color(PALETTE[zone][Math.floor(rnd() * PALETTE[zone].length)]);
        let h: number;
        if (zone === 'bund') h = 12 + rnd() * 14 + row * 6;
        else if (zone === 'old') h = 6 + rnd() * 7 + row * 4;
        else h = 30 + rnd() * 45 + row * 25;

        if (hitec) {
          glass.push(placed(box(d, h, w, 6, color), c, yaw));
          // Setback crown on some towers
          if (rnd() < 0.5) {
            const top = box(d * 0.65, 6 + rnd() * 10, w * 0.65, 4, color);
            top.translate(0, h, 0);
            glass.push(placed(top, c, yaw));
          }
        } else {
          facade.push(placed(box(d, h, w, 3, color), c, yaw));
          // Old city: occasional small domes and a parapet line, a hint of Deccani architecture.
          if (zone === 'old' && rnd() < 0.35) {
            const dome = new THREE.SphereGeometry(Math.min(w, d) * 0.28, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
            dome.translate(0, h, 0);
            domes.push(placed(dome, c, yaw));
          }
        }
      }
    }
  }
  // HITEC City skyline around Durgam Cheruvu: towers along the far shore and both sides.
  const L2 = LANDMARKS.lake2;
  const ring: [number, number, number][] = [];
  for (let x = L2.minX - 30; x <= L2.maxX + 30; x += 26 + rnd() * 10) ring.push([x, L2.minZ - 22 - rnd() * 20, 0]);
  for (let z = L2.maxZ - 30; z >= L2.minZ; z -= 28 + rnd() * 10) {
    ring.push([L2.minX - 24 - rnd() * 14, z, Math.PI / 2]);
    ring.push([L2.maxX + 24 + rnd() * 14, z, Math.PI / 2]);
  }
  for (const [x, z, yaw] of ring) {
    const w = 16 + rnd() * 12;
    const d = 16 + rnd() * 10;
    const h = 32 + rnd() * 42;
    const color = new THREE.Color(PALETTE.hitec[Math.floor(rnd() * PALETTE.hitec.length)]);
    glass.push(placed(box(d, h, w, 6, color), new THREE.Vector3(x, 0, z), yaw));
  }
  return { facade: mergeAll(facade), glass: mergeAll(glass), domes: mergeAll(domes) };
}

/** Trees along both pavements, and Tank Bund lamp posts and statues on the lake side. */
function useStreetFurniture() {
  return useMemo(() => {
    const rnd = seeded(7);
    const len = ROAD_CURVE.getLength();
    const up = new THREE.Vector3(0, 1, 0);
    const trees: THREE.Matrix4[] = [];
    const lamps: THREE.Matrix4[] = [];
    const statues: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const boards = BILLBOARD_PROGRESS.map((bp) => pointAtProgress(bp));
    for (let s = 6; s < len - 25; s += 7) {
      const t = s / len;
      const p = ROAD_CURVE.getPointAt(t);
      const tan = ROAD_CURVE.getTangentAt(t);
      const right = new THREE.Vector3().crossVectors(tan, up).normalize();
      const zone = zoneAt(p.z);
      for (const side of [-1, 1]) {
        const c = p.clone().addScaledVector(right, side * 7.2);
        c.y = 0.15;
        const lakeSide = zone === 'bund' && side < 0;
        const i = Math.round(s / 7);
        if (lakeSide) {
          if (i % 2 === 0) lamps.push(m.clone().makeTranslation(c.x, c.y, c.z));
          else if (i % 4 === 1) statues.push(m.clone().makeTranslation(c.x, c.y, c.z));
          continue;
        }
        if (c.distanceTo(LANDMARKS.charminar) < 30) continue;
        if (boards.some((b) => b.distanceTo(p) < 16)) continue; // keep billboards in clear view
        if (i % 2 === (side > 0 ? 0 : 1)) {
          const k = 0.8 + rnd() * 0.5;
          trees.push(m.clone().compose(c, new THREE.Quaternion().setFromAxisAngle(up, rnd() * 6), new THREE.Vector3(k, k, k)));
        }
      }
    }
    return { trees, lamps, statues };
  }, []);
}

function Instanced({ matrices, children, castShadow = true }: { matrices: THREE.Matrix4[]; children: ReactNode; castShadow?: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const im = ref.current;
    if (!im) return;
    matrices.forEach((mx, i) => im.setMatrixAt(i, mx));
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]} castShadow={castShadow} receiveShadow>
      {children}
    </instancedMesh>
  );
}

const treeCrown = (() => {
  const g = new THREE.IcosahedronGeometry(1.35, 1);
  g.scale(1, 1.15, 1);
  g.translate(0, 4.6, 0);
  return g;
})();
const treeTrunk = (() => {
  const g = new THREE.CylinderGeometry(0.14, 0.2, 4, 6);
  g.translate(0, 2, 0);
  return g;
})();
const lampPost = (() => {
  const post = new THREE.CylinderGeometry(0.09, 0.14, 4.6, 8);
  post.translate(0, 2.3, 0);
  const arm = new THREE.BoxGeometry(0.08, 0.08, 1.1);
  arm.translate(0, 4.5, 0.45);
  const base = new THREE.CylinderGeometry(0.28, 0.32, 0.5, 8);
  base.translate(0, 0.25, 0);
  return mergeAll([post, arm, base]);
})();
const lampHead = (() => {
  const g = new THREE.SphereGeometry(0.28, 12, 8);
  g.translate(0, 4.75, 0.95);
  return g;
})();
const statue = (() => {
  const plinth = new THREE.BoxGeometry(1.4, 1.6, 1.4);
  plinth.translate(0, 0.8, 0);
  const pts = [
    [0, 0], [0.42, 0], [0.38, 0.9], [0.3, 1.5], [0.42, 1.75], [0.18, 1.95], [0.2, 2.15], [0.14, 2.35], [0, 2.38],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const fig = new THREE.LatheGeometry(pts, 10);
  fig.translate(0, 1.6, 0);
  return mergeAll([plinth, fig]);
})();

export default function City() {
  const geo = useMemo(buildCity, []);
  const street = useStreetFurniture();
  const mats = useMemo(() => {
    const facadeMap = facadeTexture();
    const g = glassTexture();
    const gl = glassLightsTexture();
    return {
      facade: new THREE.MeshStandardMaterial({ map: facadeMap, vertexColors: true, roughness: 0.92 }),
      glass: new THREE.MeshStandardMaterial({
        map: g,
        emissiveMap: gl,
        emissive: new THREE.Color('#ffb36b'),
        emissiveIntensity: 0.12,
        vertexColors: true,
        roughness: 0.25,
        metalness: 0.15,
      }),
      dome: new THREE.MeshStandardMaterial({ color: '#f0d6c0', roughness: 0.8 }),
    };
  }, []);
  return (
    <group>
      <mesh geometry={geo.facade} material={mats.facade} castShadow receiveShadow />
      <mesh geometry={geo.glass} material={mats.glass} castShadow receiveShadow />
      <mesh geometry={geo.domes} material={mats.dome} castShadow />
      <Instanced matrices={street.trees}>
        <primitive object={treeTrunk} attach="geometry" />
        <meshStandardMaterial color="#8a6a5a" />
      </Instanced>
      <Instanced matrices={street.trees}>
        <primitive object={treeCrown} attach="geometry" />
        <meshStandardMaterial color="#b8bf74" flatShading roughness={0.9} />
      </Instanced>
      <Instanced matrices={street.lamps}>
        <primitive object={lampPost} attach="geometry" />
        <meshStandardMaterial color="#6e5a6e" metalness={0.3} roughness={0.5} />
      </Instanced>
      <Instanced matrices={street.lamps} castShadow={false}>
        <primitive object={lampHead} attach="geometry" />
        <meshStandardMaterial color="#fff1d6" emissive="#ffd59a" emissiveIntensity={1.2} />
      </Instanced>
      <Instanced matrices={street.statues}>
        <primitive object={statue} attach="geometry" />
        <meshStandardMaterial color="#d8c7bd" roughness={0.85} />
      </Instanced>
    </group>
  );
}
