import type { CombatMove } from "./combat-controls";

export const AMENEMOPE_TIMING: Record<CombatMove, {duration: number; impact: number}> = {
  dialetica: { duration: 520, impact: 220 },
  caverna: { duration: 620, impact: 310 },
  ideias: { duration: 780, impact: 510 },
  especial: { duration: 1100, impact: 610 },
  transcender: { duration: 1450, impact: 760 },
};
export const AMENEMOPE_IDLE_HEIGHT = .92 * .92; // 92% of Felipe's .92-body canvas.
export const AMENEMOPE_WORD_RANGE = 35;
export const amenemopeDensity = (dpr: number) => Math.max(2, Math.min(4, Math.ceil(dpr || 1)));
export function amenemopeLunge(origin: number, target: number, facing: 1 | -1, arenaWidth: number, gap: number) {
  const step = 1000 / Math.max(320, arenaWidth); // Ten CSS pixels, converted to arena percent.
  return facing === 1 ? Math.max(origin, Math.min(57, target - gap, origin + step))
    : Math.min(origin, Math.max(13, target + gap, origin - step));
}

/** Alpha-aware high-frequency sharpening. Transparent RGB cannot create dark halos. */
export function sharpenAmenemope(data: Uint8ClampedArray, width: number, height: number) {
  const src = new Uint8ClampedArray(data);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4, alpha = src[i + 3];
    if (alpha < 6) { data[i + 3] = 0; continue; }
    const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
    for (let c = 0; c < 3; c++) {
      let mean = 0, weight = 0;
      for (const [dx,dy] of neighbors) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const n = (ny * width + nx) * 4, w = src[n+3] / 255;
        mean += src[n+c] * w; weight += w;
      }
      data[i+c] = src[i+c] + .34 * (src[i+c] - (weight ? mean / weight : src[i+c]));
    }
    // A soft threshold preserves coverage; a binary cutoff would recreate stair steps.
    if (alpha < 248) {
      const a = Math.max(0, Math.min(1, (alpha - 6) / 242));
      data[i+3] = 255 * a * a * (3 - 2 * a);
    }
  }
}

/** Use the torso, not the extended hand/foot, for horizontal registration. */
export function amenemopeAnchor(data: Uint8ClampedArray, width: number, height: number) {
  const rows: number[] = [], xs: number[] = [];
  for (let y = 0; y < height; y++) {
    let count = 0;
    for (let x = 0; x < width; x++) if (data[(y*width+x)*4+3] > 100) count++;
    if (count >= 8) rows.push(y);
  }
  const top = rows[0] ?? 0, floor = rows.at(-1) ?? height-1;
  const waist = top + (floor-top)*.54;
  for (let y = Math.floor(waist-4); y <= waist+4; y++) for (let x = 0; x < width; x++) {
    if (data[(y*width+x)*4+3] > 160) xs.push(x);
  }
  xs.sort((a,b)=>a-b);
  return { x: xs[Math.floor(xs.length/2)] ?? width/2, floor, top };
}
