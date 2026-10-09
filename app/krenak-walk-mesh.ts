export const KRENAK_WALK_DURATION = 780;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * Grounded stride for Ailton Krenak. The face, glasses, hands, necklaces and
 * torso remain rigid while the legs alternate and the scarf fringe sways.
 */
export function krenakWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / KRENAK_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const weight = Math.sin(phase * 2);

  const hips = smoothstep(.56, .64, y) * (1 - smoothstep(.71, .78, y));
  const lowerLegs = smoothstep(.69, .88, y);
  const feet = smoothstep(.86, .97, y);
  const rightSide = smoothstep(.49, .62, x);
  const leftSide = 1 - rightSide;

  const leftLift = Math.max(0, stride) * leftSide;
  const rightLift = Math.max(0, -stride) * rightSide;
  const legSwing = lowerLegs * stride * (.0215 * leftSide - .021 * rightSide);
  const footPlant = feet * stride * (.004 * rightSide - .004 * leftSide);
  const footLift = lowerLegs * (leftLift + rightLift) * .0115;
  const hipShift = hips * weight * .0026;

  const scarfFringe = smoothstep(.46, .53, y) * (1 - smoothstep(.61, .69, y));
  const scarfEdges = smoothstep(.19, .28, Math.abs(x - .5));
  const scarfSway = scarfFringe * scarfEdges * stride * (x < .5 ? -.0022 : .0022);

  return [
    x + legSwing + footPlant + hipShift + scarfSway,
    y - footLift,
  ];
}
