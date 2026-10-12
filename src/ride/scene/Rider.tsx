import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { HERO_HOLD, ROUTE, TAKEOFF_PROGRESS, progressToU } from '../route';

/** The rider lets go of the bike and flies the rest of the way. */
export const FLY_PROGRESS = 0.935;
import { useRide } from '../store';
import { AIM_CHAIN, POSES } from './poses';
import { riderForward, riderPos } from './shared';

const withMeshopt = (loader: GLTFLoader) => {
  loader.setMeshoptDecoder(MeshoptDecoder);
};

/** Bike model orientation: its length runs along +x with the front wheel at +x. */
const BIKE_YAW = -Math.PI / 2;
const RIDER_HEIGHT = 1.78;
/** Forward tilt of the whole rider while flying (radians). Tuned by eye. */
const FLY_PITCH = 0;
/** Where Remy's root sits when riding, in bike space (metres). Tuned by eye. */
const SEAT = new THREE.Vector3(0, -0.1, -0.36);
/** Where Remy stands next to the parked bike for the hero shot. */
const STAND = new THREE.Vector3(-1.1, 0, 0.45);

type Rig = {
  root: THREE.Object3D;
  bones: Map<string, THREE.Bone>;
  rest: Map<string, THREE.Quaternion>;
};

function makeRig(scene: THREE.Object3D): Rig {
  const bones = new Map<string, THREE.Bone>();
  scene.traverse((o) => {
    if ((o as THREE.Bone).isBone) bones.set(o.name.replace('mixamorig:', '').replace('mixamorig', ''), o as THREE.Bone);
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      (o as THREE.Mesh).frustumCulled = false;
    }
  });
  const rest = new Map<string, THREE.Quaternion>();
  bones.forEach((b, k) => rest.set(k, b.quaternion.clone()));
  return { root: scene, bones, rest };
}

const qWorld = new THREE.Quaternion();
const qParent = new THREE.Quaternion();
const qDelta = new THREE.Quaternion();
const qChar = new THREE.Quaternion();
const pA = new THREE.Vector3();
const pB = new THREE.Vector3();
const dCur = new THREE.Vector3();
const dWant = new THREE.Vector3();
const axis = new THREE.Vector3();

/**
 * Rotate a bone (in world space) so that it points at its child along `dirChar` (character
 * space). `weight` < 1 moves only part of the way, for blending with an animation clip.
 */
function aimBone(bone: THREE.Bone, child: THREE.Object3D, dirChar: THREE.Vector3, weight = 1) {
  bone.updateWorldMatrix(true, false);
  child.updateWorldMatrix(false, false);
  bone.getWorldPosition(pA);
  child.getWorldPosition(pB);
  dCur.subVectors(pB, pA).normalize();
  dWant.copy(dirChar).applyQuaternion(qChar).normalize();
  if (weight < 1) dWant.lerp(dCur, 1 - weight).normalize();
  qDelta.setFromUnitVectors(dCur, dWant);
  rotateWorld(bone, qDelta);
}

function rotateWorld(bone: THREE.Object3D, q: THREE.Quaternion) {
  bone.updateWorldMatrix(true, false);
  bone.getWorldQuaternion(qWorld);
  qWorld.premultiply(q);
  bone.parent!.getWorldQuaternion(qParent);
  bone.quaternion.copy(qParent.invert().multiply(qWorld));
  bone.updateWorldMatrix(false, true);
}

/** Rotate a bone about one of the character's axes (degrees). */
function tilt(rig: Rig, name: string, ax: [number, number, number], deg: number) {
  const b = rig.bones.get(name);
  if (!b || !deg) return;
  axis.set(...ax).applyQuaternion(qChar).normalize();
  qDelta.setFromAxisAngle(axis, deg * DEG);
  rotateWorld(b, qDelta);
}

const DEG = Math.PI / 180;

const CLIP_NAMES = ['idle', 'wave', 'drive', 'fly'] as const;
type ClipName = (typeof CLIP_NAMES)[number];
const ANIM_FILES = ['/models/anim-idle.glb', '/models/anim-waving.glb', '/models/anim-driving.glb', '/models/anim-flying.glb'];

/** Motorbike posture laid over the driving clip: hands on the bars, feet on the pegs, leaning in. */
function bikePosture(rig: Rig, w: number) {
  if (w <= 0.001) return;
  const ride = POSES.ride;
  tilt(rig, 'Spine', [1, 0, 0], ride.lean * 0.5 * w);
  tilt(rig, 'Spine1', [1, 0, 0], ride.lean * 0.5 * w);
  tilt(rig, 'Neck', [1, 0, 0], -ride.lean * 0.45 * w);
  for (const [name, childName] of AIM_CHAIN) {
    const bone = rig.bones.get(name);
    const child = rig.bones.get(childName);
    const d = ride.aim[name];
    if (!bone || !child || !d) continue;
    aimBone(bone, child, new THREE.Vector3(...d).normalize(), w);
  }
}

const up = new THREE.Vector3(0, 1, 0);
const look = new THREE.Vector3();
const m4 = new THREE.Matrix4();
const qTarget = new THREE.Quaternion();
const qRoll = new THREE.Quaternion();
const fwdAxis = new THREE.Vector3(0, 0, 1);

export default function Rider() {
  const remy = useLoader(GLTFLoader, '/models/remy.glb', withMeshopt);
  const bike = useLoader(GLTFLoader, '/models/bike.glb', withMeshopt);
  const group = useRef<THREE.Group>(null);
  const riderRef = useRef<THREE.Group>(null);
  const roll = useRef(0);

  const rig = useMemo(() => makeRig(remy.scene), [remy.scene]);
  const bikeRef = useRef<THREE.Group>(null);

  // Mixamo clips: idle, waving, driving (upper body while riding), flying (the ending).
  const anims = useLoader(GLTFLoader, ANIM_FILES, withMeshopt);
  const { mixer, actions } = useMemo(() => {
    const mixer = new THREE.AnimationMixer(remy.scene);
    const actions = {} as Record<ClipName, THREE.AnimationAction>;
    anims.forEach((a, i) => {
      const clip = a.animations[0].clone();
      // Keep rotations only: the rider's position comes from the bike, not from the clip.
      clip.tracks = clip.tracks.filter((t) => t.name.endsWith('.quaternion'));
      clip.name = CLIP_NAMES[i];
      const action = mixer.clipAction(clip);
      action.play();
      action.setEffectiveWeight(0);
      actions[CLIP_NAMES[i]] = action;
    });
    return { mixer, actions };
  }, [anims, remy.scene]);
  const weights = useRef<Record<ClipName, number>>({ idle: 0, wave: 1, drive: 0, fly: 0 });

  // Normalise Remy to a real height and stand him on y = 0.
  const remyScale = useMemo(() => {
    remy.scene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(remy.scene, true);
    const h = box.max.y - box.min.y || 1;
    return { s: RIDER_HEIGHT / h, minY: box.min.y };
  }, [remy.scene]);

  const bikeOffset = useMemo(() => {
    bike.scene.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(bike.scene);
    const c = box.getCenter(new THREE.Vector3());
    return new THREE.Vector3(-c.x, -box.min.y, -c.z);
  }, [bike.scene]);

  // Debug hook for tuning poses from the browser console / tests.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('debug')) {
      (window as unknown as { __rig: Rig }).__rig = rig;
    }
  }, [rig]);

  useFrame((_, dt) => {
    const g = group.current;
    const r = riderRef.current;
    if (!g || !r) return;
    const s = useRide.getState();
    const p = s.progress;
    const u = progressToU(p);
    const pos = ROUTE.getPointAt(u);
    const tan = ROUTE.getTangentAt(u);

    // Bank into curves: compare heading a little ahead.
    const ahead = ROUTE.getTangentAt(Math.min(1, u + 0.004));
    const turn = Math.atan2(tan.x * ahead.z - tan.z * ahead.x, tan.x * ahead.x + tan.z * ahead.z);
    const flying = p > TAKEOFF_PROGRESS;
    const targetRoll = THREE.MathUtils.clamp(-turn * 18, -0.35, 0.35) * (flying ? 0.3 : 1);
    roll.current = THREE.MathUtils.damp(roll.current, targetRoll, 4, dt);

    // Orientation: face along the route (pitching up on the ramp and in the sky).
    look.copy(pos).add(tan);
    m4.lookAt(look, pos, up); // Matrix4.lookAt makes +z point from target to eye; swap to face forward
    qTarget.setFromRotationMatrix(m4);
    qRoll.setFromAxisAngle(fwdAxis, roll.current);
    qTarget.multiply(qRoll);
    g.position.copy(pos);
    if (s.reducedMotion) g.quaternion.copy(qTarget);
    else g.quaternion.slerp(qTarget, Math.min(1, dt * 8));

    riderPos.copy(pos);
    riderForward.copy(tan);

    // Rider: waving at the start, mounts the bike as the ride begins, lets go of it in the sky.
    const mount = THREE.MathUtils.smoothstep(p, HERO_HOLD * 0.4, HERO_HOLD * 1.6);
    const fly = THREE.MathUtils.smoothstep(p, FLY_PROGRESS, FLY_PROGRESS + 0.025);
    r.position.lerpVectors(STAND, SEAT, mount);
    r.position.y += fly * 0.9;
    // Standing: turned toward the camera (behind and to the right). Flying: face-down like a skydiver.
    r.rotation.y = THREE.MathUtils.lerp(-2.45, 0, mount);
    r.rotation.x = fly * FLY_PITCH;

    // Clip weights, eased so changes blend smoothly.
    const target: Record<ClipName, number> = {
      wave: p < 0.004 ? 1 - mount : 0,
      idle: p >= 0.004 ? 1 - mount : 0,
      drive: mount * (1 - fly),
      fly,
    };
    const k = s.reducedMotion ? 1 : 1 - Math.exp(-dt * 6);
    CLIP_NAMES.forEach((n) => {
      weights.current[n] += (target[n] - weights.current[n]) * k;
      actions[n].setEffectiveWeight(weights.current[n]);
    });
    mixer.update(dt);

    // The driving clip is for a car; lay the motorbike posture over it.
    g.updateMatrixWorld(true);
    rig.root.getWorldQuaternion(qChar);
    bikePosture(rig, weights.current.drive);

    // The bike drops away below once the rider lets go.
    const b = bikeRef.current;
    if (b) {
      const fall = Math.max(0, p - FLY_PROGRESS) / (1 - FLY_PROGRESS);
      b.position.set(0, -fall * fall * 60, -fall * 18);
      b.rotation.x = fall * 1.6;
      b.visible = fall < 0.7;
    }
  });

  return (
    <group ref={group}>
      <group ref={bikeRef}>
        <group rotation={[0, BIKE_YAW, 0]}>
          <primitive object={bike.scene} position={bikeOffset} />
        </group>
      </group>
      <group ref={riderRef}>
        <primitive object={remy.scene} scale={remyScale.s} position={[0, -remyScale.minY * remyScale.s, 0]} />
      </group>
    </group>
  );
}
