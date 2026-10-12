import * as THREE from 'three';

/**
 * Hand-made poses for the Mixamo rig, used until real Mixamo animation clips are added.
 *
 * Each limb is aimed in a direction given in the character's own space:
 *   +x = the character's left, +y = up, +z = the way the character faces.
 * `lean` tilts the spine forward (degrees). This is much more predictable than per-bone Euler
 * angles, because every Mixamo bone has its own local axes.
 */
export type Vec = [number, number, number];
export type Pose = {
  lean: number;
  /** bone name (without "mixamorig:") → direction its child should point */
  aim: Record<string, Vec>;
};

const stand: Pose = {
  lean: 0,
  aim: {
    LeftArm: [0.18, -1, 0.02],
    LeftForeArm: [0.08, -1, 0.22],
    RightArm: [-0.18, -1, 0.02],
    RightForeArm: [-0.08, -1, 0.22],
    LeftUpLeg: [0.06, -1, 0],
    RightUpLeg: [-0.06, -1, 0],
    LeftLeg: [0.03, -1, -0.03],
    RightLeg: [-0.03, -1, -0.03],
  },
};

const wave: Pose = {
  ...stand,
  aim: {
    ...stand.aim,
    RightArm: [-0.85, 0.45, 0.25],
    RightForeArm: [-0.15, 1, 0.12],
  },
};

const ride: Pose = {
  lean: 30,
  aim: {
    LeftArm: [0.26, -0.32, 0.9],
    LeftForeArm: [0.06, -0.12, 1],
    RightArm: [-0.26, -0.32, 0.9],
    RightForeArm: [-0.06, -0.12, 1],
    LeftUpLeg: [0.3, -0.38, 1],
    RightUpLeg: [-0.3, -0.38, 1],
    LeftLeg: [0.04, -1, -0.32],
    RightLeg: [-0.04, -1, -0.32],
    LeftFoot: [0.05, -0.25, 1],
    RightFoot: [-0.05, -0.25, 1],
  },
};

export const POSES = { stand, wave, ride } as const;
export type PoseName = keyof typeof POSES;

/** Order matters: parents before children. */
export const AIM_CHAIN: [bone: string, child: string][] = [
  ['LeftArm', 'LeftForeArm'],
  ['LeftForeArm', 'LeftHand'],
  ['RightArm', 'RightForeArm'],
  ['RightForeArm', 'RightHand'],
  ['LeftUpLeg', 'LeftLeg'],
  ['LeftLeg', 'LeftFoot'],
  ['LeftFoot', 'LeftToeBase'],
  ['RightUpLeg', 'RightLeg'],
  ['RightLeg', 'RightFoot'],
  ['RightFoot', 'RightToeBase'],
];

const va = new THREE.Vector3();
const vb = new THREE.Vector3();

/** Blend two poses' directions for one bone. */
export function blendAim(a: Pose, b: Pose, bone: string, w: number): THREE.Vector3 | null {
  const da = a.aim[bone];
  const db = b.aim[bone];
  if (!da && !db) return null;
  va.set(...(da ?? db!)).normalize();
  vb.set(...(db ?? da!)).normalize();
  return va.lerp(vb, w).normalize();
}
