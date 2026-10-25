import { isolateSilhouette } from "./sprite-frames";

export const AVERROES_SHEET = "/game/averroes-spritesheet-hq-v3.webp";
export const AVERROES_FILTER = "contrast(1.12) saturate(1.08) drop-shadow(0px 2px 3px rgba(0,0,0,0.45))";
export const AVERROES_FLOOR = 405 / 418;

// Thresholds retain the existing CSS frame order and action durations.
function phase(elapsed: number, duration: number, starts: number[]) {
  const t = Math.max(0, Math.min(1, elapsed / duration));
  let index = 0;
  for (let i = 1; i < starts.length; i++) if (t >= starts[i]) index = i;
  return index;
}

export function averroesFrame(action: string, elapsed: number) {
  if (action === "victory") return { row: 5, column: 4 };
  if (action === "knocked-out") return { row: 5, column: 5 };
  if (action === "guard" || action === "guard-hit") return { row: 4, column: 2 };
  if (action === "jump") return { row: 0, column: 1 };
  if (action === "attack-punch") return { row: 2, column: phase(elapsed, 520, [0, .15, .31, .49, .67, .83]) };
  if (action === "attack-kick") return { row: 3, column: phase(elapsed, 620, [0, .17, .35, .55, .73, .88]) };
  if (action === "attack-combo") {
    return [{row:2,column:0},{row:2,column:2},{row:2,column:4},{row:3,column:0},{row:3,column:2},{row:3,column:3},{row:2,column:5}][phase(elapsed, 780, [0, .13, .26, .39, .53, .69, .87])];
  }
  if (action === "hit") return { row: 3, column: [3, 4, 5][phase(elapsed, 440, [0, .29, .71])] };
  if (action === "special-agent-intellect") return { row: 4, column: [0, 2, 3, 5][phase(elapsed, 1450, [0, .23, .49, .75])] };
  if (action === "special-great-commentator") return { row: 5, column: phase(elapsed, 1850, [0, .23, .48, .74]) };
  const walk = action === "advance" || action === "retreat";
  const duration = walk ? 330 : 900;
  return { row: walk ? 1 : 0, column: Math.min(4, Math.floor((Math.max(0, elapsed) % duration) / (duration / 5))) };
}

/** Prepare once at native resolution; detached kick residue must not set the floor. */
export function prepareAverroesPixels(data: Uint8ClampedArray, width: number, height: number, row: number) {
  if (row === 2 || row === 3) isolateSilhouette(data, width, height);
  let bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 100) bottom = Math.max(bottom, Math.floor(p / width) + 1);
  if (!bottom) return data;
  const offset = Math.round(height * AVERROES_FLOOR) - bottom;
  const registered = new Uint8ClampedArray(data.length);
  const from = Math.max(0, -offset), to = Math.min(height, height - offset);
  registered.set(data.subarray(from * width * 4, to * width * 4), (from + offset) * width * 4);
  return registered;
}

export function averroesFrameRect(width: number, height: number, column: number, row: number) {
  const x = Math.floor(column * width / 6), y = Math.floor(row * height / 6);
  const w = Math.floor((column + 1) * width / 6) - x, h = Math.floor((row + 1) * height / 6) - y;
  const inset = row === 2 || row === 3 ? Math.min(3, Math.floor(Math.min(w, h) / 4)) : 0;
  // Destination inset is identical: trimming must not stretch a frame or move a foot.
  return { sx: x + inset, sy: y + inset, width: w - 2 * inset, height: h - 2 * inset, inset, cellWidth: w, cellHeight: h };
}

export function hidpiBuffer(width: number, height: number, density: number) {
  const dpr = Number.isFinite(density) && density > 0 ? density : 1;
  return { width: Math.max(1, Math.round(width * dpr)), height: Math.max(1, Math.round(height * dpr)), dpr };
}

export function averroesTextureBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = 0, bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 8) {
    const x = p % width, y = Math.floor(p / width);
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
  }
  return { x: Math.min(left, width - 1), y: Math.min(top, height - 1), width: Math.max(1, right - left), height: Math.max(1, bottom - top), cellWidth: width, cellHeight: height };
}

export function paintAverroes(ctx: CanvasRenderingContext2D, frame: CanvasImageSource, width: number, height: number, dpr: number, placement?: ReturnType<typeof averroesTextureBounds>) {
  // Reset, rather than compound, the HiDPI transform on every redraw.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if ("filter" in ctx) ctx.filter = AVERROES_FILTER;
  if (placement) {
    const sx = width / placement.cellWidth, sy = height / placement.cellHeight;
    ctx.drawImage(frame, placement.x * sx, placement.y * sy, placement.width * sx, placement.height * sy);
  } else ctx.drawImage(frame, 0, 0, width, height);
}

const smooth = (t: number) => t * t * (3 - 2 * t);
export function averroesPosture(action: string, elapsed: number) {
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
