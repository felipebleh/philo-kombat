export const DELEUZE_WALK_DURATION = 760;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * A measured three-point stride: the crutch plants, the hips advance and the
 * legs alternate without resizing or rerasterizing the approved source art.
 */
export function deleuzeWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / DELEUZE_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const cadence = Math.sin(phase * 2);

  const hips = smoothstep(.50, .61, y) * (1 - smoothstep(.70, .78, y));
  const legs = smoothstep(.60, .91, y);
  const feet = smoothstep(.83, .98, y);
  const rightSide = smoothstep(.49, .61, x);
  const leftSide = 1 - rightSide;

  const legSwing = legs * stride * (.016 * leftSide - .016 * rightSide);
  const footPlant = feet * stride * (.004 * rightSide - .004 * leftSide);
  const lift = legs * Math.abs(stride) * .0068;
  const hipShift = hips * cadence * .0024;

  const coat = smoothstep(.24, .38, y) * (1 - smoothstep(.60, .69, y));
  const coatEdge = smoothstep(.18, .30, Math.abs(x - .5));
  const coatSway = coat * coatEdge * stride * (x < .5 ? -.0025 : .0025);

  // The long crutch occupies the far-left strip in the approved art. It moves
  // as one rigid planted object so it never bends, detaches or changes scale.
  const crutch = 1 - smoothstep(.23, .34, x);
  const crutchPlant = crutch * cadence * .0022;
  const upperStability = 1 - smoothstep(.18, .47, y);
  const breath = upperStability * Math.sin(phase * .5) * .0007;

  return [
    x + legSwing + footPlant + hipShift + coatSway + crutchPlant,
    y - lift - breath,
  ];
}
