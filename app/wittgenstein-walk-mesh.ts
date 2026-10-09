export const WITTGENSTEIN_WALK_DURATION = 720;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * A restrained articulated stride built from Wittgenstein's full-resolution
 * guard art. His face, hands, torso and fireplace poker remain rigid while the
 * lower coat and legs move, preserving the same crisp silhouette as Freud.
 */
export function wittgensteinWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / WITTGENSTEIN_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const doubleStep = Math.sin(phase * 2);

  const coatHem = smoothstep(.56, .67, y) * (1 - smoothstep(.76, .84, y));
  const lowerLegs = smoothstep(.69, .89, y);
  const rightSide = smoothstep(.49, .64, x);
  const leftSide = 1 - rightSide;

  const legSwing = lowerLegs * stride * (.02 * leftSide - .019 * rightSide);
  const coatFollow = coatHem * doubleStep * .0024;
  const leftLift = Math.max(0, stride) * leftSide;
  const rightLift = Math.max(0, -stride) * rightSide;
  const footLift = lowerLegs * (leftLift + rightLift) * .011;

  return [x + legSwing + coatFollow, y - footLift];
}
