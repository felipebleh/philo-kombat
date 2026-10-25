import { sheetFrameRect } from "./sprite-frames";

export const THOMAS_SHEET = "/game/tomas-spritesheet-hq-v2.webp";
export const THOMAS_FILTER = "contrast(1.14) saturate(1.06) drop-shadow(0px 2px 4px rgba(0,0,0,0.65))";
export const THOMAS_FLOOR = 405 / 418;

function phase(elapsed: number, duration: number, starts: number[]) {
  const t = Math.max(0, Math.min(1, elapsed / duration));
  let index = 0;
  for (let i = 1; i < starts.length; i++) if (t >= starts[i]) index = i;
  return index;
}

// Keep the existing CSS pose order and contact/recovery timings.
export function thomasFrame(action: string, elapsed: number) {
  if (action === "victory") return { row: 5, column: 5 };
  if (action === "knocked-out") return { row: 3, column: 4 };
  if (action === "guard" || action === "guard-hit") return { row: 4, column: 2 };
  if (action === "attack-punch") return { row: 2, column: phase(elapsed, 520, [0, .15, .31, .49, .67, .83]) };
  if (action === "attack-kick") return { row: 3, column: phase(elapsed, 620, [0, .17, .35, .55, .73, .88]) };
  if (action === "attack-combo") {
    return [{row:2,column:0},{row:2,column:2},{row:2,column:4},{row:3,column:0},{row:3,column:2},{row:3,column:4},{row:2,column:5}][phase(elapsed, 780, [0, .13, .26, .39, .53, .69, .87])];
  }
  if (action === "hit") return { row: 3, column: [3, 4, 5][phase(elapsed, 440, [0, .29, .71])] };
  if (action === "special-dumb-ox") return { row: 4, column: [0, 1, 3, 5][phase(elapsed, 1450, [0, .23, .46, .73])] };
  if (action === "special-first-mover") return { row: 5, column: phase(elapsed, 1850, [0, .21, .44, .69, .87]) };
  const walk = action === "advance" || action === "retreat";
  const duration = walk ? 330 : 900;
  return { row: walk ? 1 : 0, column: Math.min(4, Math.floor((Math.max(0, elapsed) % duration) / (duration / 5))) };
}

export const thomasFrameRect = (width: number, height: number, column: number, row: number) => sheetFrameRect(width, height, column, row);

/** Remove neutral matte only at the outer edge next to opaque black fabric.
 * White habit interiors, skin, shoes and detached special effects stay intact.
 */
export function defringeThomasCape(data: Uint8ClampedArray, width: number, height: number) {
  const original = data.slice();
  const luma = (p: number) => .2126 * original[p] + .7152 * original[p + 1] + .0722 * original[p + 2];
  let bottom = 0;
  for (let p = 0; p < width * height; p++) if (original[p * 4 + 3] > 100) bottom = Math.max(bottom, Math.floor(p / width) + 1);
  // The lowest band belongs to shoes and the white hem, never the cape edge.
  const capeBottom = Math.min(height - 1, bottom - Math.ceil(height * .08));
  for (let y = 1; y < capeBottom; y++) for (let x = 1; x < width - 1; x++) {
    const p = (y * width + x) * 4, alpha = original[p + 3];
    if (!alpha || Math.max(original[p], original[p + 1], original[p + 2]) - Math.min(original[p], original[p + 1], original[p + 2]) > 45) continue;
    const edge = [-width - 1, -width, -width + 1, -1, 1, width - 1, width, width + 1].some(d => original[p + d * 4 + 3] < 8);
    if (!edge) continue;
    let core = -1, distance = Infinity;
    for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
      const nx = x + dx, ny = y + dy, d = dx * dx + dy * dy;
      if (nx < 1 || nx >= width - 1 || ny < 1 || ny >= height - 1 || d >= distance) continue;
      const q = (ny * width + nx) * 4;
      if (original[q + 3] < 245 || luma(q) > 85 || [-width, -1, 1, width].some(n => original[q + n * 4 + 3] < 200)) continue;
      core = q; distance = d;
    }
    if (core >= 0 && luma(p) > luma(core) + 25) {
      data[p] = original[core]; data[p + 1] = original[core + 1]; data[p + 2] = original[core + 2];
    }
  }
  return data;
}

/** Translation only: preserve pose height/width and register every shoe line. */
export function prepareThomasPixels(data: Uint8ClampedArray, width: number, height: number, legacyMatte = true) {
  if (legacyMatte) defringeThomasCape(data, width, height);
  let bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 100) bottom = Math.max(bottom, Math.floor(p / width) + 1);
  if (!bottom) return data;
  const offset = Math.round(height * THOMAS_FLOOR) - bottom;
  const registered = new Uint8ClampedArray(data.length);
  const from = Math.max(0, -offset), to = Math.min(height, height - offset);
  registered.set(data.subarray(from * width * 4, to * width * 4), (from + offset) * width * 4);
  return registered;
}

export function thomasBuffer(width: number, height: number, density: number) {
  const dpr = Number.isFinite(density) && density > 0 ? density : 1;
  return { width: Math.max(1, Math.round(width * dpr)), height: Math.max(1, Math.round(height * dpr)), dpr };
}

export function thomasTextureBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = 0, bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 8) {
    const x = p % width, y = Math.floor(p / width);
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
  }
  return { x: Math.min(left, width - 1), y: Math.min(top, height - 1), width: Math.max(1, right - left), height: Math.max(1, bottom - top), cellWidth: width, cellHeight: height };
}

export function paintThomas(ctx: CanvasRenderingContext2D, frame: CanvasImageSource, width: number, height: number, dpr: number, placement?: ReturnType<typeof thomasTextureBounds>) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if ("filter" in ctx) ctx.filter = THOMAS_FILTER;
  if (placement) {
    const sx = width / placement.cellWidth, sy = height / placement.cellHeight;
    ctx.drawImage(frame, placement.x * sx, placement.y * sy, placement.width * sx, placement.height * sy);
  } else ctx.drawImage(frame, 0, 0, width, height);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
export function thomasPosture(action: string, elapsed: number) {
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
