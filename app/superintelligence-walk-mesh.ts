export const SUPERINTELLIGENCE_WALK_DURATION = 680;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * A precise mechanical stride. The mask and neural core stay stable while the
 * shoulders, hips, knees and feet transfer weight through a complete step.
 */
export function superintelligenceWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / SUPERINTELLIGENCE_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const cadence = Math.sin(phase * 2);

  const side = smoothstep(.47, .57, x);
  const left = 1 - side;
  const legs = smoothstep(.59, .92, y);
  const feet = smoothstep(.84, .99, y);
  const hips = smoothstep(.53, .61, y) * (1 - smoothstep(.67, .74, y));
  const arms = smoothstep(.20, .34, y) * (1 - smoothstep(.50, .60, y));
  const shoulders = smoothstep(.17, .25, y) * (1 - smoothstep(.31, .40, y));
  const knees = smoothstep(.65, .74, y) * (1 - smoothstep(.84, .91, y));
  const outerArm = smoothstep(.13, .28, Math.abs(x - .5));

  const legSwing = legs * stride * (.0225 * left - .0225 * side);
  const footPlant = feet * stride * (.0045 * side - .0045 * left);
  const lift = legs * Math.abs(stride) * .0085;
  const kneeCompression = knees * Math.max(0, -cadence) * .0032;
  const hipShift = hips * cadence * .003;
  const armCounterSwing = arms * outerArm * stride * (x < .5 ? .0075 : -.0075);
  const shoulderCounter = shoulders * stride * (x < .5 ? -.0028 : .0028);

  return [
    x + legSwing + footPlant + hipShift + armCounterSwing + shoulderCounter,
    y - lift + kneeCompression,
  ];
}
