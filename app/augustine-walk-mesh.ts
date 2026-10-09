export const AUGUSTINE_WALK_DURATION = 640;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/** Alternate supported steps under the robe, keeping the face and book rigid. */
export function augustineWalkVertex(x: number, y: number, elapsed: number, retreat: boolean): [number, number] {
  const phase = elapsed / AUGUSTINE_WALK_DURATION * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const right = smoothstep(.45, .62, x);
  const left = 1 - right;
  const legs = smoothstep(.64, .91, y);
  const upperBody = 1 - smoothstep(.55, .93, y);
  const hem = smoothstep(.59, .73, y) * (1 - smoothstep(.85, .94, y));

  // One sandal stays on the ground while the other swings and clears the floor.
  // Squared lift eases both takeoff and landing instead of abruptly lifting a foot.
  const swingFoot = stride > 0 ? left : right;
  const footLift = legs * swingFoot * stride * stride * .018;
  const legSwing = legs * stride * (.038 * left - .038 * right);

  // The whole upper body follows the weight transfer without stretching the art.
  const bodyShift = upperBody * stride * .004;
  const bodyRise = upperBody * stride * stride * .0032;
  // The cloth follows a little later than the feet; both cycle ends match idle.
  const clothSway = hem * (Math.sin(phase - .3) + Math.sin(.3)) * .003 * (retreat ? -1 : 1);
  return [x + legSwing + bodyShift + clothSway, y - footLift - bodyRise];
}
