export const FANON_WALK_DURATION = 760;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * Restrained marching stride for Frantz Fanon. His face, hands and mask remain
 * rigid while his coat transfers weight and his feet alternate naturally.
 */
export function fanonWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / FANON_WALK_DURATION * Math.PI * 2;
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

  const coatHem = smoothstep(.43, .52, y) * (1 - smoothstep(.66, .73, y));
  const coatSway = coatHem * stride * (x < .5 ? -.0025 : .0025);
  const coatRise = coatHem * Math.abs(weight) * .0012;

  return [
    x + legSwing + footPlant + hipShift + coatSway,
    y - footLift - coatRise,
  ];
}
