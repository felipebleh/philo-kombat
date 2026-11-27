/** Integer source coordinates avoid interpolation into neighboring sheet cells. */
export function sheetFrameRect(width: number, height: number, column: number, row: number, columns = 6, rows = 6) {
  const sx = Math.floor(column * width / columns), sy = Math.floor(row * height / rows);
  return [sx, sy, Math.floor((column + 1) * width / columns) - sx, Math.floor((row + 1) * height / rows) - sy];
}

/** Keep the connected fighter silhouette; discard detached pieces of adjacent frames.
 * Only used for basic strikes, never for the magic/particle rows.
 */
export function isolateSilhouette(data: Uint8ClampedArray, width: number, height: number, maxGap = 32, minPartPixels = 200) {
  const count = width * height;
  const seen = new Uint8Array(count);
  const stack = new Int32Array(count);
  let largest: number[] = [];
  const components: number[][] = [];
  for (let seed = 0; seed < count; seed++) {
    if (seen[seed] || data[seed * 4 + 3] < 8) continue;
    let length = 1, cursor = 0;
    stack[0] = seed; seen[seed] = 1;
    const component: number[] = [];
    while (cursor < length) {
      const p = stack[cursor++]; component.push(p);
      const x = p % width, y = Math.floor(p / width);
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (!seen[next] && data[next * 4 + 3] >= 8) { seen[next] = 1; stack[length++] = next; }
      }
    }
    components.push(component);
    if (component.length > largest.length) largest = component;
  }
  const keep = new Uint8Array(count);
  for (const p of largest) keep[p] = 1;
  // Some original kicking art has a transparent gap at the ankle. Retain a
  // substantial nearby part, while small slivers and remote neighbors disappear.
  const distance = new Uint8Array(count); distance.fill(255);
  let length = 0, cursor = 0;
  for (const p of largest) { stack[length++] = p; distance[p] = 0; }
  while (cursor < length) {
    const p = stack[cursor++];
    if (distance[p] >= maxGap) continue;
    const x = p % width, y = Math.floor(p / width);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      const next = ny * width + nx;
      if (distance[next] === 255) { distance[next] = distance[p] + 1; stack[length++] = next; }
    }
  }
  for (const part of components) {
    if (part !== largest && part.length >= minPartPixels && part.some(p => distance[p] <= maxGap)) {
      for (const p of part) keep[p] = 1;
    }
  }
  for (let p = 0; p < count; p++) if (!keep[p]) data[p * 4 + 3] = 0;
}

export function amenemopeFrame(action: string, elapsed: number) {
  if (action === "victory") return { row: 5, column: 5 };
  if (action === "knocked-out") return { row: 4, column: 3 };
  if (action === "guard" || action === "guard-hit") return { row: 4, column: 2 };
  const durations: Record<string, number> = { "attack-punch": 520, "attack-kick": 620, hit: 440, "special-feather": 1050, "special-scale": 1050 };
  if (action === "attack-combo") {
    const progress = Math.min(.9999, elapsed / 780);
    const index = Math.min(5, Math.floor((progress < .5 ? progress * 2 : (progress - .5) * 2) * 6));
    return { row: progress < .5 ? 2 : 3, column: index };
  }
  const row = action === "attack-punch" ? 2 : action === "attack-kick" ? 3 : action === "hit" || action === "guard-hit" ? 4 : action.startsWith("special-") ? 5 : action === "advance" || action === "retreat" ? 1 : 0;
  const loop = row < 2;
  const duration = durations[action] ?? (row === 1 ? 330 : 900);
  return { row, column: Math.min(5, Math.floor((loop ? (elapsed % duration) / duration : Math.min(1, elapsed / duration)) * 6)) };
}
