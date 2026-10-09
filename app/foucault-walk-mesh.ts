export const FOUCAULT_WALK_DURATION = 660;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/** Articulated clinical stride: the face stays rigid while legs, coat and dossier move. */
export function foucaultWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / FOUCAULT_WALK_DURATION * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const legs = smoothstep(.58, .84, y);
  const rightSide = smoothstep(.49, .66, x);
  const coat = smoothstep(.39, .53, y) * (1 - smoothstep(.73, .84, y));
  const dossier = (1 - smoothstep(.43, .57, x)) * smoothstep(.31, .43, y) * (1 - smoothstep(.67, .78, y));
  const dx = legs * stride * (.043 * (1 - rightSide) - .041 * rightSide) +
    coat * Math.sin(phase * 2) * .004 + dossier * stride * .007;
  const dy = -legs * .02 * (
    Math.max(0, stride) * (1 - rightSide) +
    Math.max(0, -stride) * rightSide
  ) - dossier * Math.max(0, stride) * .0035;
  return [x + dx, y + dy];
}
