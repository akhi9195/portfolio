import { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { roles } from '../../data/experience';
import { projects } from '../../data/projects';
import { BILLBOARD_PROGRESS, STAR_PROGRESS, pointAtProgress, tangentAtProgress } from '../route';
import { useRide } from '../store';
import { seeded } from './shared';
import { drawTexture, puffTexture } from './textures';

const UP = new THREE.Vector3(0, 1, 0);

/** Position/orientation beside the road at a scroll progress. side: -1 left, +1 right. */
function roadside(progress: number, side: number, offset: number) {
  const p = pointAtProgress(progress);
  const f = tangentAtProgress(progress);
  f.y = 0;
  f.normalize();
  const right = new THREE.Vector3().crossVectors(f, UP).normalize();
  const pos = p.clone().addScaledVector(right, side * offset);
  pos.y = 0;
  // Face back toward the approaching rider, turned a little toward the road.
  const yaw = Math.atan2(-f.x, -f.z) - side * 0.55;
  return { pos, yaw };
}

/* ---------- Giant 3D letters marking each section ---------- */

const LETTERS: { text: string; progress: number; side: number; color: string }[] = [
  { text: 'ABOUT ME', progress: 0.118, side: 1, color: '#f2b8a2' },
  { text: 'SKILLS', progress: 0.262, side: 1, color: '#f0c2a0' },
  { text: 'EXPERIENCE', progress: 0.445, side: -1, color: '#efb4a4' },
  { text: 'PROJECTS', progress: 0.632, side: 1, color: '#c9d3e6' },
];

export function Letters() {
  const font = useLoader(FontLoader, '/models/letters.typeface.json');
  const items = useMemo(
    () =>
      LETTERS.map((l) => {
        const g = new TextGeometry(l.text, {
          font,
          size: 3.4,
          depth: 1.3,
          curveSegments: 4,
          bevelEnabled: true,
          bevelThickness: 0.08,
          bevelSize: 0.06,
          bevelSegments: 2,
        });
        g.computeBoundingBox();
        const bb = g.boundingBox!;
        // Anchor the side nearest the road at the origin, so long words grow away from it.
        g.translate(l.side > 0 ? -bb.min.x : -bb.max.x, 0, -(bb.max.z - bb.min.z) / 2);
        const { pos, yaw } = roadside(l.progress, l.side, 9.5);
        return { g, pos, yaw, color: l.color, key: l.text };
      }),
    [font],
  );
  return (
    <group>
      {items.map((it) => (
        <mesh key={it.key} geometry={it.g} position={it.pos} rotation={[0, it.yaw, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={it.color} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Experience billboards ---------- */

function billboardTexture(i: number) {
  const r = [...roles].reverse()[i]; // oldest first
  return drawTexture(1024, 576, (g) => {
    const grad = g.createLinearGradient(0, 0, 1024, 576);
    grad.addColorStop(0, '#1b2240');
    grad.addColorStop(1, '#3a2a4a');
    g.fillStyle = grad;
    g.fillRect(0, 0, 1024, 576);
    g.fillStyle = '#fbbf24';
    g.fillRect(0, 0, 1024, 14);
    g.fillStyle = '#fbbf24';
    g.font = '700 54px Inter, system-ui, sans-serif';
    g.fillText(`${r.start.slice(-4)} – ${r.end === 'Present' ? 'now' : r.end.slice(-4)}`, 60, 110);
    g.fillStyle = '#ffffff';
    g.font = '800 92px Inter, system-ui, sans-serif';
    g.fillText(r.company.replace(' (via TCS)', ''), 60, 250, 900);
    g.fillStyle = '#d6dbef';
    g.font = '500 50px Inter, system-ui, sans-serif';
    g.fillText(r.title, 60, 340, 900);
    if (r.product) {
      g.fillStyle = '#a5adc8';
      g.font = '400 38px Inter, system-ui, sans-serif';
      g.fillText(r.product.split(':')[0], 60, 420, 900);
    }
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.font = '600 30px Inter, system-ui, sans-serif';
    g.fillText(`${String(i + 1).padStart(2, '0')} / ${String(roles.length).padStart(2, '0')}`, 60, 520);
  });
}

export function Billboards() {
  const boards = useMemo(
    () =>
      BILLBOARD_PROGRESS.map((p, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        return { ...roadside(p, side, 10.5), tex: billboardTexture(i), key: i };
      }),
    [],
  );
  return (
    <group>
      {boards.map((b) => (
        <group key={b.key} position={b.pos} rotation={[0, b.yaw, 0]}>
          {[-2.6, 2.6].map((x) => (
            <mesh key={x} position={[x, 3.4, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.16, 6.8, 8]} />
              <meshStandardMaterial color="#3b3346" metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          <mesh position={[0, 8.2, -0.12]} castShadow>
            <boxGeometry args={[7.6, 4.5, 0.2]} />
            <meshStandardMaterial color="#2a2236" />
          </mesh>
          <mesh position={[0, 8.2, 0]}>
            <planeGeometry args={[7.2, 4.05]} />
            <meshStandardMaterial map={b.tex} emissiveMap={b.tex} emissive="#ffffff" emissiveIntensity={0.55} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- Project stars ---------- */

const starGeo = (() => {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const r = i % 2 === 0 ? 1.0 : 0.42;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 2 });
  g.center();
  return g;
})();

const haloTex = (() => {
  if (typeof document === 'undefined') return null;
  return drawTexture(128, 128, (g) => {
    const grad = g.createRadialGradient(64, 64, 2, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,220,140,0.9)');
    grad.addColorStop(0.4, 'rgba(255,190,90,0.35)');
    grad.addColorStop(1, 'rgba(255,170,60,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
  });
})();

function labelTexture(text: string) {
  return drawTexture(512, 128, (g) => {
    g.fillStyle = 'rgba(15,18,40,0.78)';
    g.beginPath();
    g.roundRect(0, 0, 512, 128, 64);
    g.fill();
    g.fillStyle = '#ffe9b0';
    g.font = '700 54px Inter, system-ui, sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 66, 470);
  });
}

function Star({ index }: { index: number }) {
  const group = useRef<THREE.Group>(null);
  const star = useRef<THREE.Mesh>(null);
  const at = STAR_PROGRESS[index];
  const pos = useMemo(() => pointAtProgress(at).add(new THREE.Vector3(0, 1.9, 0)), [at]);
  const label = useMemo(() => labelTexture(projects[index].name), [index]);
  useFrame(({ clock }) => {
    const g = group.current;
    const s = star.current;
    if (!g || !s) return;
    const p = useRide.getState().progress;
    // Collect animation: over the next 1.5% of scroll the star shrinks and flies up.
    const k = THREE.MathUtils.clamp((p - at) / 0.015, 0, 1);
    g.visible = k < 1;
    g.position.set(pos.x, pos.y + k * 3 + Math.sin(clock.elapsedTime * 2 + index) * 0.15, pos.z);
    const sc = 1 - k;
    g.scale.setScalar(Math.max(0.001, sc));
    s.rotation.y = clock.elapsedTime * 1.6 + k * 12;
  });
  return (
    <group ref={group}>
      <mesh ref={star} geometry={starGeo}>
        <meshStandardMaterial color="#ffd257" emissive="#ff9d00" emissiveIntensity={0.55} metalness={0.7} roughness={0.22} />
      </mesh>
      {haloTex && (
        <sprite scale={[3, 3, 1]}>
          <spriteMaterial map={haloTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      )}
      <sprite position={[0, 1.7, 0]} scale={[2.2, 0.55, 1]}>
        <spriteMaterial map={label} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

export function Stars() {
  return (
    <group>
      {STAR_PROGRESS.map((_, i) => (
        <Star key={i} index={i} />
      ))}
    </group>
  );
}

/* ---------- Clouds for the take-off and contact ---------- */

export function Clouds() {
  const sprites = useMemo(() => {
    const rnd = seeded(99);
    const out: { pos: [number, number, number]; s: number; o: number }[] = [];
    // A sea of clouds the rider climbs through and ends above.
    for (let i = 0; i < 340; i++) {
      out.push({
        pos: [(rnd() - 0.5) * 460, 82 + rnd() * 14, -740 - rnd() * 380],
        s: 22 + rnd() * 34,
        o: 0.55 + rnd() * 0.4,
      });
    }
    // Extra-thick cover right under the final position, so the ending is above a sea of clouds.
    for (let i = 0; i < 70; i++) {
      out.push({ pos: [(rnd() - 0.5) * 120, 86 + rnd() * 10, -770 - rnd() * 130], s: 30 + rnd() * 30, o: 0.7 + rnd() * 0.3 });
    }
    // Wisps along the climb.
    for (let i = 0; i < 18; i++) {
      const x = (rnd() > 0.5 ? 1 : -1) * (8 + rnd() * 30);
      out.push({ pos: [x, 70 + rnd() * 30, -680 - rnd() * 80], s: 8 + rnd() * 10, o: 0.25 + rnd() * 0.25 });
    }
    return out;
  }, []);
  const tex = useMemo(puffTexture, []);
  return (
    <group>
      {sprites.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.s, c.s * 0.6, 1]}>
          <spriteMaterial map={tex} color="#fff6f2" transparent opacity={c.o} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  );
}
