import { projects } from '../data/projects';
import { roles } from '../data/experience';
import {
  BILLBOARD_PROGRESS,
  ROUTE,
  SECTIONS,
  STAR_PROGRESS,
  TAKEOFF_PROGRESS,
  currentBillboard,
  progressToU,
  rampHeight,
  sectionAnchor,
  sectionAt,
  starsCollected,
} from './route';
import { CAMERA_KEYS, cameraKeyAt } from './scene/CameraRig';

describe('ride route', () => {
  it('has sections in order without overlaps', () => {
    for (let i = 1; i < SECTIONS.length; i++) {
      expect(SECTIONS[i].from).toBeGreaterThanOrEqual(SECTIONS[i - 1].to);
    }
    expect(SECTIONS.map((s) => s.id)).toEqual(['home', 'about', 'skills', 'experience', 'projects', 'contact']);
  });

  it('every section anchor lands inside its own section', () => {
    for (const s of SECTIONS) expect(sectionAt(sectionAnchor(s.id))).toBe(s.id);
    expect(sectionAt(0.999)).toBe('contact');
  });

  it('maps scroll to the route without going backwards', () => {
    let prev = -1;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const u = progressToU(p);
      expect(u).toBeGreaterThanOrEqual(prev);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThanOrEqual(1);
      prev = u;
    }
  });

  it('stays on the ground until take-off, then climbs into the sky', () => {
    expect(ROUTE.getPointAt(progressToU(0.5)).y).toBeLessThan(0.5);
    expect(ROUTE.getPointAt(progressToU(TAKEOFF_PROGRESS - 0.01)).y).toBeLessThan(3);
    expect(ROUTE.getPointAt(progressToU(1)).y).toBeGreaterThan(90);
  });

  it('has one star per project inside Projects, and one billboard per role inside Experience', () => {
    expect(STAR_PROGRESS).toHaveLength(projects.length);
    STAR_PROGRESS.forEach((p) => expect(sectionAt(p)).toBe('projects'));
    expect(BILLBOARD_PROGRESS).toHaveLength(roles.length);
    BILLBOARD_PROGRESS.forEach((p) => expect(sectionAt(p)).toBe('experience'));
  });

  it('collects stars as the rider passes them', () => {
    expect(starsCollected(0.6)).toBe(0);
    expect(starsCollected(STAR_PROGRESS[1])).toBe(2);
    expect(starsCollected(1)).toBe(projects.length);
  });

  it('highlights the billboard being passed', () => {
    expect(currentBillboard(0.3)).toBe(-1);
    expect(currentBillboard(BILLBOARD_PROGRESS[2])).toBe(2);
  });

  it('ramp rises only at the end of the road', () => {
    expect(rampHeight(-300)).toBe(0);
    expect(rampHeight(-478)).toBeCloseTo(2.2);
  });

  it('camera keys are ordered and blend continuously', () => {
    for (let i = 1; i < CAMERA_KEYS.length; i++) expect(CAMERA_KEYS[i].p).toBeGreaterThan(CAMERA_KEYS[i - 1].p);
    const a = cameraKeyAt(0.3);
    const b = cameraKeyAt(0.3001);
    expect(Math.abs(a.back - b.back)).toBeLessThan(0.05);
    expect(cameraKeyAt(1)).toEqual(CAMERA_KEYS[CAMERA_KEYS.length - 1]);
  });
});
