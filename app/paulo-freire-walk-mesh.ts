export const PAULO_FREIRE_WALK_DURATION = 780;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * Natural restrained stride for Paulo Freire. His face, glasses, beard and
 * book stay rigid while the hips transfer weight and the feet alternate.
 */
export function pauloFreireWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / PAULO_FREIRE_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const weight = Math.sin(phase * 2);

  const hips = smoothstep(.55, .63, y) * (1 - smoothstep(.72, .79, y));
  const lowerLegs = smoothstep(.69, .88, y);
  const feet = smoothstep(.86, .96, y);
  const rightSide = smoothstep(.49, .62, x);
  const leftSide = 1 - rightSide;

  const leftLift = Math.max(0, stride) * leftSide;
  const rightLift = Math.max(0, -stride) * rightSide;
  const legSwing = lowerLegs * stride * (.022 * leftSide - .021 * rightSide);
  const footPlant = feet * stride * (.004 * rightSide - .004 * leftSide);
  const footLift = lowerLegs * (leftLift + rightLift) * .012;
  const hipShift = hips * weight * .0028;

  // Only the free outside forearm counterbalances the step; the book is rigid.
  const freeArm = smoothstep(.25, .32, y) * (1 - smoothstep(.48, .55, y)) *
    smoothstep(.57, .68, x);
  const armSwing = stride * freeArm * .004;
  const armRise = Math.abs(stride) * freeArm * .0014;

  return [
    x + legSwing + footPlant + hipShift + armSwing,
    y - footLift - armRise,
  ];
}
