import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { LANDMARKS } from '../route';
import { useRide } from '../store';
import { riderPos } from './shared';
import { puffTexture } from './textures';

/** Low sun in the west, slightly ahead of the rider: the classic Hussain Sagar sunset. */
export const SUN_DIR = new THREE.Vector3(-1, 0.06, -0.55).normalize();
export const FOG_COLOR = '#efbdaa';

function SkyDome() {
  const sky = useMemo(() => {
    const s = new Sky();
    s.scale.setScalar(4500);
    const u = s.material.uniforms;
    u.turbidity.value = 11;
    u.rayleigh.value = 3.2;
    u.mieCoefficient.value = 0.008;
    u.mieDirectionalG.value = 0.9;
    u.sunPosition.value.copy(SUN_DIR).multiplyScalar(100);
    return s;
  }, []);
  // Keep the sky centred on the camera so it never ends.
  useFrame(({ camera }) => sky.position.copy(camera.position));
  return <primitive object={sky} />;
}

/** Big soft clouds lit pink and orange around the setting sun, like the reference sky. */
function SunsetClouds() {
  const items = useMemo(() => {
    const out: { pos: THREE.Vector3; w: number; h: number; c: string; o: number }[] = [];
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 46; i++) {
      // Spread around the western sky, more of them near the sun.
      const a = Math.atan2(SUN_DIR.z, SUN_DIR.x) + (rnd() - 0.5) * 2.4;
      const d = 900 + rnd() * 600;
      const y = 60 + rnd() * 240;
      const near = 1 - Math.min(1, Math.abs(a - Math.atan2(SUN_DIR.z, SUN_DIR.x)) / 1.2);
      out.push({
        pos: new THREE.Vector3(Math.cos(a) * d, y, Math.sin(a) * d),
        w: 220 + rnd() * 420,
        h: 50 + rnd() * 90,
        c: near > 0.5 ? '#ffb38a' : rnd() > 0.5 ? '#e9a3b4' : '#c993b5',
        o: 0.35 + rnd() * 0.45,
      });
    }
    return out;
  }, []);
  const tex = useMemo(puffTexture, []);
  const group = useRef<THREE.Group>(null);
  // The sky clouds stay put relative to the camera, so they read as far away.
  useFrame(({ camera }) => group.current?.position.set(camera.position.x, 0, camera.position.z));
  return (
    <group ref={group}>
      {items.map((c, i) => (
        <sprite key={i} position={c.pos} scale={[c.w, c.h, 1]} renderOrder={-1}>
          <spriteMaterial map={tex} color={c.c} transparent opacity={c.o} depthWrite={false} fog={false} />
        </sprite>
      ))}
    </group>
  );
}

function SunLight() {
  const light = useRef<THREE.DirectionalLight>(null);
  const lowPower = useRide((s) => s.lowPower);
  const { scene } = useThree();
  useEffect(() => {
    const l = light.current;
    if (!l) return;
    scene.add(l.target);
    const cam = l.shadow.camera as THREE.OrthographicCamera;
    cam.left = -45;
    cam.right = 45;
    cam.top = 45;
    cam.bottom = -45;
    cam.near = 1;
    cam.far = 400;
    l.shadow.bias = -0.0004;
    l.shadow.normalBias = 0.04;
    return () => {
      scene.remove(l.target);
    };
  }, [scene]);
  // The shadow area follows the rider.
  useFrame(() => {
    const l = light.current;
    if (!l) return;
    l.target.position.copy(riderPos);
    l.position.copy(riderPos).addScaledVector(SUN_DIR, 200);
  });
  return (
    <directionalLight
      ref={light}
      color="#ffb37d"
      intensity={3.6}
      castShadow={!lowPower}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
    />
  );
}

type Rect = { minX: number; maxX: number; minZ: number; maxZ: number };

/** Ground with holes where the lakes are, so the water sits lower than the street. */
function Ground() {
  const geo = useMemo(() => {
    const outer = new THREE.Shape();
    outer.moveTo(-1500, -1500);
    outer.lineTo(1500, -1500);
    outer.lineTo(1500, 1500);
    outer.lineTo(-1500, 1500);
    outer.lineTo(-1500, -1500);
    for (const L of [LANDMARKS.lake, LANDMARKS.lake2]) {
      const hole = new THREE.Path();
      // Shape is in XY; we rotate it to XZ with y = -z.
      hole.moveTo(L.minX, -L.maxZ);
      hole.lineTo(L.minX, -L.minZ);
      hole.lineTo(L.maxX, -L.minZ);
      hole.lineTo(L.maxX, -L.maxZ);
      hole.lineTo(L.minX, -L.maxZ);
      outer.holes.push(hole);
    }
    return new THREE.ShapeGeometry(outer);
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <meshStandardMaterial color="#e7b4a0" roughness={0.95} />
    </mesh>
  );
}

/**
 * A lake. The reflective water re-renders the whole scene, so it only runs while the rider is
 * near this lake (`activeWhen`); the rest of the time a cheap flat surface stands in.
 */
function Lake({ rect, wall = 'east', activeWhen }: { rect: Rect; wall?: 'east' | 'none'; activeWhen: (riderZ: number) => boolean }) {
  const normals = useLoader(THREE.TextureLoader, '/textures/waternormals.jpg');
  const lowPower = useRide((s) => s.lowPower);
  const L = rect;
  const w = L.maxX - L.minX;
  const d = L.maxZ - L.minZ;
  const water = useMemo(() => {
    normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
    const geo = new THREE.PlaneGeometry(w, d);
    const wtr = new Water(geo, {
      textureWidth: lowPower ? 256 : 512,
      textureHeight: lowPower ? 256 : 512,
      waterNormals: normals,
      sunDirection: SUN_DIR.clone(),
      sunColor: 0xffc79a,
      waterColor: 0x3d5578,
      distortionScale: 2.2,
      fog: true,
    });
    wtr.rotation.x = -Math.PI / 2;
    wtr.position.set(L.minX + w / 2, -0.6, L.minZ + d / 2);
    return wtr;
  }, [normals, lowPower, w, d, L.minX, L.minZ]);
  const cheap = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    // Light mode (slow machines and phones) skips live reflections altogether.
    const on = !useRide.getState().lowPower && activeWhen(riderPos.z);
    water.visible = on;
    if (cheap.current) cheap.current.visible = !on;
    if (on) water.material.uniforms.time.value += dt * 0.4;
  });
  return (
    <group>
      <primitive object={water} />
      <mesh ref={cheap} rotation={[-Math.PI / 2, 0, 0]} position={[L.minX + w / 2, -0.6, L.minZ + d / 2]} visible={false}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#8c97b4" roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Lake bed and the Tank Bund embankment wall */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[L.minX + w / 2, -2.5, L.minZ + d / 2]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#2b3550" />
      </mesh>
      {wall === 'east' && (
        <mesh position={[L.maxX - 0.4, -0.2, L.minZ + d / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 1.6, d]} />
          <meshStandardMaterial color="#cfa7a0" />
        </mesh>
      )}
    </group>
  );
}

/** Low silhouettes on the far side of the lake, so the horizon isn't empty. */
function FarSkyline() {
  const geo = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    let z = 160;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    while (z > -700) {
      const w = 10 + rnd() * 22;
      const h = 8 + rnd() * 26;
      const b = new THREE.BoxGeometry(14, h, w);
      b.translate(-300 - rnd() * 40, h / 2, z);
      parts.push(b);
      z -= w + rnd() * 6;
    }
    // A few hills behind (Golconda/Banjara Hills direction)
    for (let i = 0; i < 6; i++) {
      const s = new THREE.SphereGeometry(60 + rnd() * 50, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
      s.scale(1, 0.35, 1);
      s.translate(-420 - rnd() * 80, 0, 100 - i * 140);
      parts.push(s);
    }
    return mergeAll(parts);
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#d9a3a0" roughness={1} />
    </mesh>
  );
}

/**
 * A tall soft ring of haze around the camera: hides the edge where the ground plane meets
 * the sky shader, so the horizon melts like real evening haze.
 */
function HorizonHaze() {
  const ref = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 256;
    const g = c.getContext('2d')!;
    const grad = g.createLinearGradient(0, 256, 0, 0);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.62, 'rgba(255,255,255,0.45)');
    grad.addColorStop(0.75, 'rgba(255,255,255,0.1)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 4, 256);
    const alpha = new THREE.CanvasTexture(c);
    return new THREE.MeshBasicMaterial({ color: FOG_COLOR, alphaMap: alpha, transparent: true, side: THREE.BackSide, depthWrite: false, fog: false });
  }, []);
  useFrame(({ camera }) => ref.current?.position.set(camera.position.x, -20, camera.position.z));
  return (
    <mesh ref={ref} material={mat} renderOrder={-2}>
      <cylinderGeometry args={[480, 480, 170, 48, 1, true]} />
    </mesh>
  );
}

export function mergeAll(parts: THREE.BufferGeometry[]) {
  // Minimal merge: convert to non-indexed with the same attributes (position, normal, uv).
  const nonIndexed = parts.map((p) => {
    const g = p.index ? p.toNonIndexed() : p;
    for (const name of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(name)) g.deleteAttribute(name);
    return g;
  });
  const total = nonIndexed.reduce((n, g) => n + g.attributes.position.count, 0);
  const out = new THREE.BufferGeometry();
  const names = ['position', 'normal', 'uv', 'color'].filter((n) => nonIndexed.every((g) => g.attributes[n]));
  for (const name of names) {
    const size = nonIndexed[0].attributes[name].itemSize;
    const arr = new Float32Array(total * size);
    let off = 0;
    for (const g of nonIndexed) {
      arr.set(g.attributes[name].array as Float32Array, off);
      off += g.attributes[name].count * size;
    }
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  }
  out.computeBoundingSphere();
  return out;
}

export default function Environment() {
  const { scene, gl } = useThree();
  useEffect(() => {
    scene.fog = new THREE.Fog(FOG_COLOR, 70, 520);
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.75;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    return () => {
      scene.fog = null;
    };
  }, [scene, gl]);
  return (
    <>
      <SkyDome />
      <hemisphereLight args={['#ffd9c8', '#b07a8a', 2.5]} />
      <SunsetClouds />
      <ambientLight color="#ffc9b3" intensity={0.35} />
      <SunLight />
      <Ground />
      <Lake rect={LANDMARKS.lake} activeWhen={(z) => z > -240} />
      <Lake rect={LANDMARKS.lake2} wall="none" activeWhen={(z) => z < -330} />
      <FarSkyline />
      <HorizonHaze />
    </>
  );
}
