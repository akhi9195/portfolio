import { useMemo } from 'react';
import * as THREE from 'three';
import { LANDMARKS } from '../route';
import { mergeAll } from './Environment';

/* ---------------- Charminar (1591) ----------------
 * Built at ~0.8 scale: 16 m square base with a pointed arch on each face, an arcaded gallery
 * above, and four fluted minarets with balconies and onion domes. */

const W = 16; // base side
const H1 = 13.5; // height of the arch storey

function archWall(width: number, height: number, archW: number, spring: number, rise: number, depth: number) {
  const s = new THREE.Shape();
  const a = archW / 2;
  s.moveTo(-width / 2, 0);
  s.lineTo(-a, 0);
  s.lineTo(-a, spring);
  s.quadraticCurveTo(-a, spring + rise * 0.85, 0, spring + rise);
  s.quadraticCurveTo(a, spring + rise * 0.85, a, spring);
  s.lineTo(a, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height);
  s.lineTo(-width / 2, height);
  s.lineTo(-width / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 10 });
  g.translate(0, 0, -depth);
  return g;
}

function galleryWall(width: number, height: number, count: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height);
  s.lineTo(-width / 2, height);
  s.lineTo(-width / 2, 0);
  const span = width / count;
  for (let i = 0; i < count; i++) {
    const cx = -width / 2 + span * (i + 0.5);
    const a = span * 0.32;
    const h = new THREE.Path();
    h.moveTo(cx - a, 0.5);
    h.lineTo(cx + a, 0.5);
    h.lineTo(cx + a, height * 0.55);
    h.quadraticCurveTo(cx + a, height * 0.78, cx, height * 0.86);
    h.quadraticCurveTo(cx - a, height * 0.78, cx - a, height * 0.55);
    h.lineTo(cx - a, 0.5);
    s.holes.push(h);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -depth);
  return g;
}

/** Four copies of a wall, one per side of a square of the given half-size. */
function fourSides(make: () => THREE.BufferGeometry, half: number, y: number) {
  return [0, 1, 2, 3].map((i) => {
    const g = make();
    g.translate(0, y, half);
    g.rotateY((i * Math.PI) / 2);
    return g;
  });
}

function onionDome(r: number, h: number) {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    // bulb that swells then tapers to a point
    const x = r * Math.sin(Math.PI * Math.min(1, t * 1.15)) * (1 - t * 0.35) + (t < 0.05 ? r * 0.7 : 0);
    pts.push(new THREE.Vector2(Math.max(0.001, x), t * h));
  }
  return new THREE.LatheGeometry(pts, 16);
}

function minaret() {
  const parts: THREE.BufferGeometry[] = [];
  const shaft = new THREE.CylinderGeometry(1.0, 1.35, 38, 12);
  shaft.translate(0, 19, 0);
  parts.push(shaft);
  for (const y of [H1 + 0.6, 21, 27.5, 33.5]) {
    const b = new THREE.CylinderGeometry(1.9, 1.5, 0.6, 16);
    b.translate(0, y, 0);
    parts.push(b);
    const rail = new THREE.CylinderGeometry(1.9, 1.9, 0.5, 16, 1, true);
    rail.translate(0, y + 0.55, 0);
    parts.push(rail);
  }
  const pav = new THREE.CylinderGeometry(0.95, 0.95, 2.4, 8);
  pav.translate(0, 39.2, 0);
  parts.push(pav);
  const cap = new THREE.CylinderGeometry(1.3, 1.3, 0.35, 16);
  cap.translate(0, 40.5, 0);
  parts.push(cap);
  const dome = onionDome(1.15, 3.2);
  dome.translate(0, 40.6, 0);
  parts.push(dome);
  const fin = new THREE.ConeGeometry(0.12, 1.4, 6);
  fin.translate(0, 44.4, 0);
  parts.push(fin);
  return parts;
}

export function Charminar() {
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    parts.push(...fourSides(() => archWall(W, H1, 7, 7.5, 4.2, 2.2), W / 2, 0));
    const slab = new THREE.BoxGeometry(W + 1.6, 0.7, W + 1.6);
    slab.translate(0, H1 + 0.35, 0);
    parts.push(slab);
    parts.push(...fourSides(() => galleryWall(W - 0.6, 4.6, 6, 0.8), W / 2 - 0.3, H1 + 0.7));
    const slab2 = new THREE.BoxGeometry(W + 0.8, 0.5, W + 0.8);
    slab2.translate(0, H1 + 5.55, 0);
    parts.push(slab2);
    parts.push(...fourSides(() => galleryWall(W - 1.6, 2.6, 9, 0.5), W / 2 - 0.8, H1 + 5.8));
    const roof = new THREE.BoxGeometry(W - 1.4, 0.4, W - 1.4);
    roof.translate(0, H1 + 8.6, 0);
    parts.push(roof);
    // the small mosque domes on the roof
    for (const [x, z] of [[-3, -4], [3, -4], [0, -4]]) {
      const d = new THREE.SphereGeometry(x === 0 ? 1.6 : 1.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      d.translate(x, H1 + 8.8, z);
      parts.push(d);
    }
    for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      for (const p of minaret()) {
        p.translate((x * W) / 2, 0, (z * W) / 2);
        parts.push(p);
      }
    }
    const plinth = new THREE.BoxGeometry(W + 6, 0.6, W + 6);
    plinth.translate(0, 0.3, 0);
    parts.push(plinth);
    const g = mergeAll(parts);
    g.computeVertexNormals();
    return g;
  }, []);
  const p = LANDMARKS.charminar;
  return (
    <mesh geometry={geo} position={[p.x, 0, p.z]} rotation={[0, 0.25, 0]} castShadow receiveShadow>
      <meshStandardMaterial color="#efd5bc" roughness={0.85} flatShading />
    </mesh>
  );
}

/* ---------------- Buddha statue, Hussain Sagar (1992) ----------------
 * A standing monolith on a lotus pedestal, on the Rock of Gibraltar island. */
export function Buddha() {
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    const robe = new THREE.LatheGeometry(
      [
        [0, 0], [1.7, 0], [1.75, 1.2], [1.55, 5], [1.45, 8.5], [1.75, 11], [1.95, 12.4], [1.4, 13.1], [0.55, 13.4], [0.5, 13.8], [0, 13.8],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      20,
    );
    parts.push(robe);
    const head = new THREE.SphereGeometry(0.95, 16, 12);
    head.scale(1, 1.12, 1);
    head.translate(0, 14.75, 0);
    parts.push(head);
    const top = new THREE.SphereGeometry(0.45, 12, 8);
    top.translate(0, 15.85, 0);
    parts.push(top);
    // Raised right hand (abhaya mudra)
    const upper = new THREE.CylinderGeometry(0.42, 0.45, 3.2, 10);
    upper.rotateZ(0.25);
    upper.translate(2.1, 10.8, 0.2);
    parts.push(upper);
    const fore = new THREE.CylinderGeometry(0.36, 0.4, 3.0, 10);
    fore.rotateX(-0.25);
    fore.translate(2.5, 11.4, 1.3);
    parts.push(fore);
    const hand = new THREE.BoxGeometry(0.8, 1.2, 0.3);
    hand.translate(2.5, 13.2, 1.7);
    parts.push(hand);
    const g = mergeAll(parts);
    g.translate(0, 5.2, 0);
    // Lotus pedestal
    const lotus = new THREE.LatheGeometry(
      [[0, 0], [3.4, 0], [3.4, 2.2], [2.8, 2.6], [3.1, 3.4], [2.2, 4.4], [2.6, 4.9], [1.9, 5.2], [0, 5.2]].map(([x, y]) => new THREE.Vector2(x, y)),
      16,
    );
    const all = mergeAll([g, lotus]);
    all.computeVertexNormals();
    return all;
  }, []);
  const island = useMemo(() => {
    const g = new THREE.DodecahedronGeometry(11, 1);
    g.scale(1, 0.28, 0.85);
    return g;
  }, []);
  const p = LANDMARKS.buddha;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, Math.PI / 2 + 0.3, 0]}>
      <mesh geometry={island} position={[0, -0.6, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#8f7c80" flatShading roughness={1} />
      </mesh>
      <mesh geometry={geo} position={[0, 1.6, 0]} castShadow>
        <meshStandardMaterial color="#f4efe8" roughness={0.75} />
      </mesh>
    </group>
  );
}

/* ---------------- Cyber Towers, HITEC City (1998) ----------------
 * A curved glass building of stacked floors around a central core. */
export function CyberTowers() {
  const { glass, frame } = useMemo(() => {
    const floors: THREE.BufferGeometry[] = [];
    const frames: THREE.BufferGeometry[] = [];
    const N = 11;
    for (let i = 0; i < N; i++) {
      const r = 17 - i * 0.55;
      const f = new THREE.CylinderGeometry(r, r, 2.7, 48, 1, false, -Math.PI * 0.85, Math.PI * 1.7);
      f.translate(0, 4 + i * 3.2 + 1.35, 0);
      floors.push(f);
      const slab = new THREE.CylinderGeometry(r + 0.5, r + 0.5, 0.5, 48, 1, false, -Math.PI * 0.85, Math.PI * 1.7);
      slab.translate(0, 4 + i * 3.2 + 2.95, 0);
      frames.push(slab);
    }
    const podium = new THREE.CylinderGeometry(20, 20, 4, 48);
    podium.translate(0, 2, 0);
    frames.push(podium);
    const core = new THREE.BoxGeometry(14, 44, 10);
    core.translate(0, 22, -6);
    frames.push(core);
    const mast = new THREE.CylinderGeometry(0.3, 0.3, 14, 6);
    mast.translate(0, 51, -6);
    frames.push(mast);
    return { glass: mergeAll(floors), frame: mergeAll(frames) };
  }, []);
  const p = LANDMARKS.cyberTowers;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, Math.PI / 2, 0]}>
      <mesh geometry={glass} castShadow receiveShadow>
        <meshStandardMaterial color="#7d93b8" metalness={0.6} roughness={0.15} emissive="#ff9a5c" emissiveIntensity={0.08} />
      </mesh>
      <mesh geometry={frame} castShadow receiveShadow>
        <meshStandardMaterial color="#e9e3e0" roughness={0.7} />
      </mesh>
    </group>
  );
}

/* ---------------- Durgam Cheruvu cable bridge (2020) ----------------
 * A cable-stayed bridge across the lake beside HITEC City. The rider flies over it. */
export function CableBridge() {
  const { deck, pylons, cables } = useMemo(() => {
    const L = LANDMARKS.lake2;
    const z = LANDMARKS.bridgeZ;
    const span = L.maxX - L.minX + 20;
    const deckGeo = new THREE.BoxGeometry(span, 1.2, 12);
    deckGeo.translate(0, 7, z);
    const parts: THREE.BufferGeometry[] = [];
    const pts: number[] = [];
    for (const px of [-55, 55]) {
      // A-shaped pylon: two legs leaning together, a cross beam, and footings.
      for (const side of [-1, 1]) {
        const leg = new THREE.BoxGeometry(1.6, 46, 1.6);
        leg.translate(0, 23, 0);
        leg.rotateX(side * 0.13);
        leg.translate(px, 0, z + side * 6.5);
        parts.push(leg);
      }
      const beam = new THREE.BoxGeometry(2, 1.4, 12);
      beam.translate(px, 7.6, z);
      parts.push(beam);
      const foot = new THREE.CylinderGeometry(3, 3.5, 8, 10);
      foot.translate(px, 3, z);
      parts.push(foot);
      // Fan of cables from the top to the deck edges.
      for (let i = 1; i <= 9; i++) {
        for (const dir of [-1, 1]) {
          for (const edge of [-5.5, 5.5]) {
            pts.push(px, 45, z, px + dir * i * 7, 7.6, z + edge);
          }
        }
      }
    }
    const cableGeo = new THREE.BufferGeometry();
    cableGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return { deck: deckGeo, pylons: mergeAll(parts), cables: cableGeo };
  }, []);
  return (
    <group>
      <mesh geometry={deck} castShadow receiveShadow>
        <meshStandardMaterial color="#e8d9d2" roughness={0.6} />
      </mesh>
      <mesh geometry={pylons} castShadow>
        <meshStandardMaterial color="#f2ece8" roughness={0.5} />
      </mesh>
      <lineSegments geometry={cables}>
        <lineBasicMaterial color="#fff5ee" transparent opacity={0.85} />
      </lineSegments>
    </group>
  );
}
