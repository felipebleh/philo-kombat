export const ANGELA_DAVIS_WALK_DURATION = 780;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * Articulated forward stride for Angela Davis. The afro, face and central
 * torso stay rigid while the hips transfer weight, the feet alternate their
 * plant and the outside of each arm follows the opposite leg very subtly.
 */
export function angelaDavisWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / ANGELA_DAVIS_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const weight = Math.sin(phase * 2);

  const hips = smoothstep(.53, .62, y) * (1 - smoothstep(.73, .79, y));
  const lowerLegs = smoothstep(.68, .88, y);
  const feet = smoothstep(.84, .96, y);
  const rightSide = smoothstep(.49, .62, x);
  const leftSide = 1 - rightSide;

  const leftLift = Math.max(0, stride) * leftSide;
  const rightLift = Math.max(0, -stride) * rightSide;
  const legSwing = lowerLegs * stride * (.022 * leftSide - .021 * rightSide);
  const footPlant = feet * stride * (.004 * rightSide - .004 * leftSide);
  const footLift = lowerLegs * (leftLift + rightLift) * .012;
  const hipShift = hips * weight * .003;

  // The arms counterbalance the step without bending the face, afro or core.
  const armBand = smoothstep(.24, .31, y) * (1 - smoothstep(.48, .55, y));
  const outerLeftArm = armBand * (1 - smoothstep(.37, .46, x));
  const outerRightArm = armBand * smoothstep(.55, .66, x);
  const armSwing = stride * (.004 * outerRightArm - .004 * outerLeftArm);
  const armRise = Math.abs(stride) * (outerLeftArm + outerRightArm) * .0015;

  return [
    x + legSwing + footPlant + hipShift + armSwing,
    y - footLift - armRise,
  ];
}
