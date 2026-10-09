export const KIERKEGAARD_WALK_DURATION = 660;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

export function kierkegaardWalkVertex(x: number, y: number, elapsed: number, retreat: boolean): [number, number] {
  // The combat canvas adds horizontal padding so kicks/umbrella never crop.
  // Rig weights stay anchored to the original 1024px guard, not that padding.
  const bodyX = (x * 1664 - 286) / 1024;
  const phase = elapsed / KIERKEGAARD_WALK_DURATION * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const legs = smoothstep(.49, .83, y);
  const front = smoothstep(.44, .62, bodyX);
  const umbrella = (1 - smoothstep(.25, .34, bodyX)) * smoothstep(.22, .34, y) * (1 - smoothstep(.80, .87, y));
  const hand = smoothstep(.65, .78, bodyX) * smoothstep(.20, .28, y) * (1 - smoothstep(.38, .48, y));
  const coat = smoothstep(.43, .57, y) * (1 - smoothstep(.67, .78, y));
  const dx = legs * stride * (.047 * (1 - front) - .043 * front) +
    umbrella * stride * .010 - hand * stride * .006 +
    coat * Math.sin(phase * 2) * .005;
  const dy = -legs * .022 * (Math.max(0, stride) * (1 - front) + Math.max(0, -stride) * front) -
    umbrella * Math.max(0, stride) * .005;
  return [x + dx * 1024 / 1664, y + dy];
}
