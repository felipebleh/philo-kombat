/** Registration and timing for the original 6×6 animated atlas. */
export const confuciusDensity = (dpr: number) => Math.max(2, Math.min(4, Math.ceil(dpr || 1)));
export function confuciusLunge(origin: number, target: number, facing: 1 | -1, arenaWidth: number, gap: number) {
  const step = 1000 / Math.max(320, arenaWidth); // Ten CSS pixels in arena percentages.
  return facing === 1 ? Math.max(origin, Math.min(57, target - gap, origin + step)) : Math.min(origin, Math.max(13, target + gap, origin - step));
}
export function confuciusFrame(action: string, time: number) {
  const frame = (duration: number, count: number, loop = false) => Math.min(count - 1, Math.floor((loop ? time % duration : Math.min(time, duration - 1)) / duration * count));
  let row = 0, column = 0;
  switch (action) {
    case 'idle': column = frame(1000, 6, true); break;
    case 'advance': row = 1; column = frame(640, 6, true); break;
    case 'retreat': row = 1; column = 5 - frame(640, 6, true); break;
    case 'attack-punch': row = 2; column = frame(520, 6); break;
    case 'attack-kick': row = 3; column = frame(620, 6); break;
    case 'attack-combo': { const i = frame(780, 12); row = i < 6 ? 2 : 3; column = i % 6; break; }
    case 'hit': row = 4; column = frame(440, 6); break;
    case 'guard': case 'guard-hit': row = 4; column = 2; break;
    case 'knocked-out': row = 4; column = 3; break;
    case 'jump': row = 3; column = time < 325 ? 0 : 1; break;
    case 'special-ren': row = 5; column = time < 280 ? 0 : time < 650 ? 1 : 2; break;
    case 'special-li': row = 5; column = time < 390 ? 3 : time < 900 ? 4 : 5; break;
  }
  return {row, column};
}
export function confuciusDrawRect(width: number, height: number, art: {width: number;height: number;anchorX: number}, standingHeight: number) {
  const scale = Math.min(height * .92 / standingHeight, height * .96 / art.height, (width / 2 - 20) / Math.max(art.anchorX, art.width - art.anchorX));
  return {x: width / 2 - art.anchorX * scale, y: height - 15 - art.height * scale, width: art.width * scale, height: art.height * scale};
}
