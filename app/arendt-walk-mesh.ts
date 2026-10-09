export const ARENDT_WALK_DURATION = 720;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * A restrained stride for a single illustrated pose. Head, torso, hands and
 * dossier remain rigid; only the coat hem and lower legs receive a small,
 * continuous deformation so the figure never looks rubbery.
 */
export function arendtWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / ARENDT_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const doubleStep = Math.sin(phase * 2);

  // The approved portrait stays completely untouched through the waist. This
  // avoids shearing the neck, shoulders, hands or leather dossier.
  const coatHem = smoothstep(.52, .64, y) * (1 - smoothstep(.75, .84, y));
  const lowerLegs = smoothstep(.69, .88, y);
  const rightSide = smoothstep(.49, .64, x);
  const leftSide = 1 - rightSide;

  const legSwing = lowerLegs * stride * (.018 * leftSide - .017 * rightSide);
  const coatFollow = coatHem * doubleStep * .0022;
  const dx = legSwing + coatFollow;

  const leftLift = Math.max(0, stride) * leftSide;
  const rightLift = Math.max(0, -stride) * rightSide;
  const footLift = lowerLegs * (leftLift + rightLift) * .010;
  const dy = -footLift;

  return [x + dx, y + dy];
}
