export const BEAUVOIR_WALK_DURATION = 660;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/** Subtle articulated stride that preserves the native-resolution portrait. */
export function beauvoirWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / BEAUVOIR_WALK_DURATION * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const legs = smoothstep(.56, .84, y);
  const rightSide = smoothstep(.5, .68, x);
  const coat = smoothstep(.42, .56, y) * (1 - smoothstep(.70, .81, y));
  const portfolio = (1 - smoothstep(.34, .46, x)) * smoothstep(.31, .43, y) * (1 - smoothstep(.70, .79, y));
  const manuscript = smoothstep(.61, .72, x) * smoothstep(.24, .33, y) * (1 - smoothstep(.49, .59, y));
  const dx = legs * stride * (.044 * (1 - rightSide) - .041 * rightSide) +
    coat * Math.sin(phase * 2) * .0045 +
    portfolio * stride * .008 - manuscript * stride * .006;
  const dy = -legs * .021 * (
    Math.max(0, stride) * (1 - rightSide) +
    Math.max(0, -stride) * rightSide
  ) - portfolio * Math.max(0, stride) * .004;
  return [x + dx, y + dy];
}
