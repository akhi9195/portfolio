import * as THREE from 'three';

const cache = new Map<string, THREE.Texture>();

function canvasTexture(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat = true) {
  const hit = cache.get(key);
  if (hit) return hit;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  cache.set(key, t);
  return t;
}

/** One storey-and-bay of a low-rise facade: plaster wall with a shuttered window. 1 tile = 3 m × 3 m. */
export const facadeTexture = () =>
  canvasTexture('facade', 128, 128, (g) => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 128, 128);
    // floor band
    g.fillStyle = 'rgba(0,0,0,0.07)';
    g.fillRect(0, 118, 128, 10);
    // window recess + glass
    g.fillStyle = 'rgba(120,70,70,0.28)';
    g.fillRect(36, 26, 56, 72);
    g.fillStyle = 'rgba(150,120,150,0.35)';
    g.fillRect(40, 30, 48, 64);
    // sill
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.fillRect(32, 96, 64, 5);
  });

/** Glass office tower: dense panels with mullions. 1 tile = 4 m × 4 m. */
export const glassTexture = () =>
  canvasTexture('glass', 128, 128, (g) => {
    // Continuous glass bands with thin floor slabs and faint mullions.
    const grad = g.createLinearGradient(0, 0, 0, 128);
    grad.addColorStop(0, '#e9eef6');
    grad.addColorStop(1, '#c3cee0');
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(255,255,255,0.9)';
    g.fillRect(0, 0, 128, 6);
    g.fillRect(0, 64, 128, 6);
    // no mullions: reads as smooth glass from a distance
  });

/** Lit windows for glass towers at dusk (used as emissive map). */
export const glassLightsTexture = () =>
  canvasTexture('glass-lights', 128, 128, (g) => {
    g.fillStyle = '#000000';
    g.fillRect(0, 0, 128, 128);
    // A few lit offices
    g.fillStyle = '#ffcf8a';
    g.fillRect(70, 10, 40, 50);
  });

/** Asphalt with a dashed centre line and solid edge lines. u across (0..1), v along (1 tile = 12 m). */
export const roadTexture = () =>
  canvasTexture('road', 256, 256, (g) => {
    g.fillStyle = '#7d6a72';
    g.fillRect(0, 0, 256, 256);
    // grain
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    g.fillStyle = 'rgba(255,240,230,0.85)';
    g.fillRect(124, 0, 8, 150); // dash
    g.fillRect(10, 0, 5, 256); // edges
    g.fillRect(241, 0, 5, 256);
  });

/** Soft round puff for clouds and haze. */
export const puffTexture = () =>
  canvasTexture(
    'puff',
    128,
    128,
    (g) => {
      const grad = g.createRadialGradient(64, 64, 4, 64, 64, 62);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.45, 'rgba(255,255,255,0.75)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, 128, 128);
    },
    false,
  );

/** Text drawn on a canvas, for billboards and labels. Not cached (content varies). */
export function drawTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}
