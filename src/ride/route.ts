import * as THREE from 'three';

/**
 * The ride through Hyderabad. Scrolling moves the rider along this route from 0 (top of the
 * page) to 1 (bottom). Units are metres; forward is roughly -z. Sun sets in the west (-x).
 *
 *   Hussain Sagar (lake on the left, Buddha statue) → About letters → Charminar (Skills)
 *   → city street with four billboards (Experience) → HITEC City towers with four stars
 *   (Projects) → ramp → take off into the clouds (Contact)
 */
const ROAD: [number, number][] = [
  [0, 20],
  [0, 0],
  [0, -40],
  [1, -80],
  [6, -115],
  [16, -145],
  [22, -175],
  [22, -200], // passing Charminar (on the left)
  [16, -228],
  [6, -250],
  [2, -275],
  [0, -310],
  [0, -345],
  [-2, -380],
  [-2, -415],
  [0, -450],
  [0, -478], // end of the ramp
];

/** After the ramp the route climbs into the sky. */
const FLIGHT: [number, number, number][] = [
  [0, 6, -500],
  [0, 20, -530],
  [0, 38, -565],
  [0, 54, -610],
  [0, 74, -670],
  [0, 94, -730],
  [0, 108, -790],
  [0, 112, -840],
];

export const RAMP_START_Z = -462;

export function rampHeight(z: number) {
  if (z > RAMP_START_Z) return 0;
  return Math.min(1, (RAMP_START_Z - z) / (RAMP_START_Z - -478)) * 2.2;
}

export const ROUTE = new THREE.CatmullRomCurve3(
  [
    ...ROAD.map(([x, z]) => new THREE.Vector3(x, rampHeight(z), z)),
    ...FLIGHT.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  ],
  false,
  'centripetal',
);

/** Only the road part, for drawing the road mesh. */
export const ROAD_CURVE = new THREE.CatmullRomCurve3(
  ROAD.map(([x, z]) => new THREE.Vector3(x, 0, z)),
  false,
  'centripetal',
);

export const ROUTE_LENGTH = ROUTE.getLength();

/** Fraction of the route (by distance) at which the road ends and the flight begins. */
export const TAKEOFF_U = (() => {
  // Search for the route position closest to the ramp end.
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i <= 2000; i++) {
    const u = i / 2000;
    const p = ROUTE.getPointAt(u);
    const d = Math.abs(p.z - -478);
    if (d < bestD && p.y < 4) {
      bestD = d;
      best = u;
    }
  }
  return best;
})();

export type SectionId = 'home' | 'about' | 'skills' | 'experience' | 'projects' | 'contact';

export type Section = {
  id: SectionId;
  label: string;
  /** Scroll progress range in which this section's overlay is shown. */
  from: number;
  to: number;
};

/**
 * Sections by scroll progress. Progress maps to route distance through `progressToU`, so
 * "about at 0.12" means the rider is 12% of the way down the page, not 12% along the road.
 */
export const SECTIONS: Section[] = [
  { id: 'home', label: 'Home', from: 0, to: 0.05 },
  { id: 'about', label: 'About me', from: 0.08, to: 0.21 },
  { id: 'skills', label: 'Skills', from: 0.25, to: 0.4 },
  { id: 'experience', label: 'Experience', from: 0.44, to: 0.6 },
  { id: 'projects', label: 'Projects', from: 0.63, to: 0.85 },
  { id: 'contact', label: 'Contact', from: 0.94, to: 1.01 },
];

export const sectionById = (id: SectionId) => SECTIONS.find((s) => s.id === id)!;

/** Where to scroll to show a section (a little inside its range, so its overlay is visible). */
export const sectionAnchor = (id: SectionId) => {
  const s = sectionById(id);
  return id === 'home' ? 0 : id === 'contact' ? 1 : s.from + Math.min(0.03, (s.to - s.from) / 3);
};

export function sectionAt(progress: number): SectionId | null {
  return SECTIONS.find((s) => progress >= s.from && progress < s.to)?.id ?? null;
}

/** 0..1 within a section's range (clamped). */
export function sectionLocal(progress: number, id: SectionId) {
  const s = sectionById(id);
  return THREE.MathUtils.clamp((progress - s.from) / (s.to - s.from), 0, 1);
}

/**
 * Scroll progress → route position. The rider waits at the start for the hero, then rides,
 * reaches the ramp at progress 0.88 and spends the rest flying into the clouds.
 */
export const HERO_HOLD = 0.03;
export const TAKEOFF_PROGRESS = 0.88;

export function progressToU(p: number): number {
  const c = THREE.MathUtils.clamp(p, 0, 1);
  // A small run-up before the hero position: the route starts 20 m behind the bike.
  const startU = 20 / ROUTE_LENGTH;
  if (c <= HERO_HOLD) return startU;
  if (c <= TAKEOFF_PROGRESS) {
    const k = (c - HERO_HOLD) / (TAKEOFF_PROGRESS - HERO_HOLD);
    return startU + k * (TAKEOFF_U - startU);
  }
  const k = (c - TAKEOFF_PROGRESS) / (1 - TAKEOFF_PROGRESS);
  return TAKEOFF_U + k * (1 - TAKEOFF_U);
}

/** Inverse of progressToU, for placing things (stars, billboards) at a given scroll progress. */
export const pointAtProgress = (p: number) => ROUTE.getPointAt(progressToU(p));
export const tangentAtProgress = (p: number) => ROUTE.getTangentAt(progressToU(p));

/** Projects: one star per project, collected as the rider passes it. */
export const STAR_PROGRESS = [0.665, 0.705, 0.745, 0.785];

/** Experience: one billboard per role, oldest first. */
export const BILLBOARD_PROGRESS = [0.47, 0.505, 0.54, 0.575];

export const starsCollected = (progress: number) => STAR_PROGRESS.filter((p) => progress >= p).length;

/** The billboard the rider is closest to (or just passed), for highlighting. */
export function currentBillboard(progress: number): number {
  let idx = -1;
  BILLBOARD_PROGRESS.forEach((p, i) => {
    if (progress >= p - 0.02) idx = i;
  });
  return idx;
}

/** Landmarks, in world coordinates. */
export const LANDMARKS = {
  lake: { minX: -260, maxX: -9, minZ: -150, maxZ: 120 },
  /** Durgam Cheruvu, the lake by HITEC City with the cable bridge. The ramp launches over it. */
  lake2: { minX: -170, maxX: 170, minZ: -880, maxZ: -488 },
  bridgeZ: -640,
  buddha: new THREE.Vector3(-82, 0, -52),
  charminar: new THREE.Vector3(-4, 0, -200),
  cyberTowers: new THREE.Vector3(-34, 0, -405),
};
