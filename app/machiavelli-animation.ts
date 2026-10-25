import { sheetFrameRect } from "./sprite-frames";

export const MACHIAVELLI_SHEET = "/game/maquiavel-spritesheet-hq-v2.webp";
export const MACHIAVELLI_FILTER = "contrast(1.16) saturate(1.10) drop-shadow(0px 2px 3px rgba(0,0,0,0.75))";
export const MACHIAVELLI_FLOOR = 744 / 768;

function phase(elapsed: number, duration: number, starts: number[]) {
  const t = Math.max(0, Math.min(1, elapsed / duration));
  let index = 0;
  for (let i = 1; i < starts.length; i++) if (t >= starts[i]) index = i;
  return index;
}

// Keep the existing CSS pose order and contact/recovery timings.
export function machiavelliFrame(action: string, elapsed: number) {
  if (action === "victory") return { row: 5, column: 5 };
  if (action === "knocked-out") return { row: 4, column: 3 };
  if (action === "guard" || action === "guard-hit") return { row: 4, column: 2 };
  if (action === "attack-punch") return { row: 2, column: phase(elapsed, 520, [0, .15, .31, .49, .67, .83]) };
  if (action === "attack-kick") return { row: 3, column: phase(elapsed, 620, [0, .17, .35, .55, .73, .88]) };
  if (action === "attack-combo") {
    return [{row:2,column:0},{row:2,column:2},{row:2,column:4},{row:3,column:0},{row:3,column:2},{row:3,column:4},{row:2,column:5}][phase(elapsed, 780, [0, .13, .26, .39, .53, .69, .87])];
  }
  if (action === "hit") return { row: 4, column: [0, 1, 2][phase(elapsed, 440, [0, .29, .71])] };
  if (action === "special-prince") return { row: 5, column: [0, 1, 2][phase(elapsed, 1450, [0, .29, .61])] };
  if (action === "special-virtu-fortuna") return { row: 5, column: [3, 4, 5][phase(elapsed, 1850, [0, .29, .63])] };
  const walk = action === "advance" || action === "retreat";
  const duration = walk ? 330 : 900;
  return { row: walk ? 1 : 0, column: Math.min(4, Math.floor((Math.max(0, elapsed) % duration) / (duration / 5))) };
}

export const machiavelliFrameRect = (width: number, height: number, column: number, row: number) => sheetFrameRect(width, height, column, row);

/** One-pixel outer alpha choke and matte decontamination, followed by a
 * real alpha-weighted unsharp mask. Never mix transparent RGB into the body.
 * Cached once per native frame, not recomputed during animation.
 */
export function sharpenMachiavelli(data: Uint8ClampedArray, width: number, height: number) {
  const source = data.slice();
  const neighbors = [-width, -1, 1, width];
  for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
    const p = (y * width + x) * 4, alpha = source[p + 3];
    if (!alpha) continue;
    const edge = neighbors.some(d => source[p + d * 4 + 3] < 8);
    if (edge && alpha <= 32) { data[p + 3] = 0; continue; }
    if (edge && alpha < 160) data[p + 3] = Math.round(alpha * .8);
    const yellowGreen = source[p + 1] >= source[p] * .9 && source[p + 1] > source[p + 2] * 1.4 && source[p + 1] > 75;
    if (edge && alpha < 240 && yellowGreen) {
      let nearest = -1, distance = Infinity;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx, ny = y + dy, d = dx * dx + dy * dy;
        if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1 || d >= distance) continue;
        const q = (ny * width + nx) * 4;
        if (source[q + 3] < 245 || neighbors.some(n => source[q + n * 4 + 3] < 200)) continue;
        nearest = q; distance = d;
      }
      if (nearest >= 0) {
        data[p] = source[nearest]; data[p + 1] = source[nearest + 1]; data[p + 2] = source[nearest + 2];
        continue;
      }
    }
    for (let channel = 0; channel < 3; channel++) {
      let sum = source[p + channel] * alpha * 4, weight = alpha * 4;
      for (const d of neighbors) { const q = p + d * 4, a = source[q + 3]; sum += source[q + channel] * a; weight += a; }
      const detail = source[p + channel] - sum / weight;
      data[p + channel] = source[p + channel] + Math.max(-16, Math.min(16, detail * .6));
    }
  }
  return data;
}

/** Translation only: preserve pose height/width and register every shoe line. */
export function prepareMachiavelliPixels(data: Uint8ClampedArray, width: number, height: number) {
  sharpenMachiavelli(data, width, height);
  let bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 100) bottom = Math.max(bottom, Math.floor(p / width) + 1);
  if (!bottom) return data;
  const offset = Math.round(height * MACHIAVELLI_FLOOR) - bottom;
  const registered = new Uint8ClampedArray(data.length);
  const from = Math.max(0, -offset), to = Math.min(height, height - offset);
  registered.set(data.subarray(from * width * 4, to * width * 4), (from + offset) * width * 4);
  return registered;
}

export function machiavelliBuffer(width: number, height: number, density: number) {
  const dpr = Math.max(2, Number.isFinite(density) && density > 0 ? density : 1);
  return { width: Math.max(1, Math.round(width * dpr)), height: Math.max(1, Math.round(height * dpr)), dpr };
}

export function machiavelliTextureBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = 0, bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 8) {
    const x = p % width, y = Math.floor(p / width);
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
  }
  return { x: Math.min(left, width - 1), y: Math.min(top, height - 1), width: Math.max(1, right - left), height: Math.max(1, bottom - top), cellWidth: width, cellHeight: height };
}

export function paintMachiavelli(ctx: CanvasRenderingContext2D, frame: CanvasImageSource, width: number, height: number, dpr: number, placement?: ReturnType<typeof machiavelliTextureBounds>) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if ("filter" in ctx) ctx.filter = MACHIAVELLI_FILTER;
  if (placement) {
    const sx = width / placement.cellWidth, sy = height / placement.cellHeight;
    ctx.drawImage(frame, placement.x * sx, placement.y * sy, placement.width * sx, placement.height * sy);
  } else ctx.drawImage(frame, 0, 0, width, height);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
export function machiavelliPosture(action: string, elapsed: number) {
  const t = Math.max(0, Math.min(1, elapsed / 650));
  const airborne = action === "jump" && t > .2 && t < 1;
  const altitude = !airborne ? 0 : t < .55 ? smooth((t - .2) / .35) : 1 - smooth((t - .55) / .45);
  const attack = action === "attack-punch" || action === "attack-kick" || action === "attack-combo";
  return {
    lift: altitude * .32,
    squash: action !== "jump" ? 1 : t <= .2 ? 1 - .08 * smooth(t / .2) : t < .55 ? .92 + .11 * smooth((t - .2) / .35) : 1 + .03 * (1 - smooth((t - .55) / .45)),
    shadowWidth: (attack ? 1.15 : 1) * (1 - altitude * .45),
    shadowHeight: 1 - altitude * .35,
    shadowOpacity: 1 - altitude * .55,
  };
}
