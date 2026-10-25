import { sheetFrameRect } from "./sprite-frames";

export const GALILEO_SHEET = "/game/galileu-spritesheet-hq-v4.webp";
export const GALILEO_FILTER = "contrast(1.15) saturate(1.08) drop-shadow(0px 2px 3px rgba(0,0,0,0.70))";

function phase(elapsed: number, duration: number, starts: number[]) {
  const t = Math.max(0, Math.min(1, elapsed / duration));
  let index = 0;
  for (let i = 1; i < starts.length; i++) if (t >= starts[i]) index = i;
  return index;
}

// Keep the existing CSS pose order and contact/recovery timings.
export function galileoFrame(action: string, elapsed: number) {
  if (action === "victory") return { row: 5, column: 5 };
  if (action === "knocked-out") return { row: 5, column: 2 };
  if (action === "guard" || action === "guard-hit") return { row: 4, column: 2 };
  if (action === "attack-punch") return { row: 2, column: phase(elapsed, 520, [0, .15, .31, .49, .67, .83]) };
  if (action === "attack-kick") return { row: 3, column: phase(elapsed, 620, [0, .17, .35, .55, .73, .88]) };
  if (action === "attack-combo") {
    return [{row:2,column:0},{row:2,column:2},{row:2,column:4},{row:3,column:0},{row:3,column:2},{row:3,column:4},{row:2,column:5}][phase(elapsed, 780, [0, .13, .26, .39, .53, .69, .87])];
  }
  if (action === "hit") return { row: 5, column: [0, 1][phase(elapsed, 440, [0, .39])] };
  if (action === "special-falling-bodies") return { row: 4, column: [0, 1, 0][phase(elapsed, 1450, [0, .35, .73])] };
  if (action === "special-sidereal-messenger") return { row: 4, column: [2, 3, 4, 5][phase(elapsed, 1850, [0, .27, .54, .77])] };
  const walk = action === "advance" || action === "retreat";
  const duration = walk ? 330 : 900;
  return { row: walk ? 1 : 0, column: Math.min(4, Math.floor((Math.max(0, elapsed) % duration) / (duration / 5))) };
}

export const galileoFrameRect = (width: number, height: number, column: number, row: number) => sheetFrameRect(width, height, column, row);

/** Native-pixel unsharp mask with an alpha-weighted 5×5 Gaussian blur.
 * Transparent RGB never enters the convolution. Only faint outer alpha is
 * choked; body pixels, frame coordinates, beard, collar and feet stay in place.
 * Run once per cached frame, never once per animation tick.
 */
export function prepareGalileoPixels(data: Uint8ClampedArray, width: number, height: number) {
  const source = data.slice();
  const kernel = [1, 4, 6, 4, 1];
  const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const p = (y * width + x) * 4, alpha = source[p + 3];
    if (!alpha) continue;
    const edge = neighbors.some(([dx,dy]) => {
      const nx = x + dx, ny = y + dy;
      return nx < 0 || nx >= width || ny < 0 || ny >= height || source[(ny * width + nx) * 4 + 3] < 8;
    });
    if (edge && alpha <= 32) { data[p + 3] = 0; continue; }
    if (edge && alpha <= 96) data[p + 3] = Math.round(alpha * .75);
    let red = 0, green = 0, blue = 0, weight = 0;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const q = (ny * width + nx) * 4;
      const w = kernel[dx + 2] * kernel[dy + 2] * source[q + 3];
      weight += w;
      red += source[q] * w; green += source[q + 1] * w; blue += source[q + 2] * w;
    }
    const blurred = [red / weight, green / weight, blue / weight];
    for (let channel = 0; channel < 3; channel++) {
      const detail = source[p + channel] - blurred[channel];
      data[p + channel] = source[p + channel] + Math.max(-18, Math.min(18, detail * .65));
    }
  }
  return data;
}

export function galileoBuffer(width: number, height: number, density: number) {
  const dpr = Math.max(2, Number.isFinite(density) && density > 0 ? density : 1);
  return { width: Math.max(1, Math.round(width * dpr)), height: Math.max(1, Math.round(height * dpr)), dpr };
}

export function galileoTextureBounds(data: Uint8ClampedArray, width: number, height: number) {
  let left = width, top = height, right = 0, bottom = 0;
  for (let p = 0; p < width * height; p++) if (data[p * 4 + 3] > 8) {
    const x = p % width, y = Math.floor(p / width);
    left = Math.min(left, x); top = Math.min(top, y);
    right = Math.max(right, x + 1); bottom = Math.max(bottom, y + 1);
  }
  return { x: Math.min(left, width - 1), y: Math.min(top, height - 1), width: Math.max(1, right - left), height: Math.max(1, bottom - top), cellWidth: width, cellHeight: height };
}

export function paintGalileo(ctx: CanvasRenderingContext2D, frame: CanvasImageSource, width: number, height: number, dpr: number, placement?: ReturnType<typeof galileoTextureBounds>) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if ("filter" in ctx) ctx.filter = GALILEO_FILTER;
  if (placement) {
    const sx = width / placement.cellWidth, sy = height / placement.cellHeight;
    ctx.drawImage(frame, placement.x * sx, placement.y * sy, placement.width * sx, placement.height * sy);
  } else ctx.drawImage(frame, 0, 0, width, height);
}

