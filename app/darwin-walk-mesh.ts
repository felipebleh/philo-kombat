// Normalized, continuous deformation of the original HQ cutout. The head is
// rigid; the two legs alternate while the cane follows the rear arm.
export const DARWIN_WALK_DURATION = 660;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

export function darwinWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = (elapsed / DARWIN_WALK_DURATION) * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const settle = Math.sin(phase * 2);
  const legs = smoothstep(.52, .84, y);
  const front = smoothstep(.43, .60, x);
  const rear = 1 - front;
  const cane = (1 - smoothstep(.24, .31, x)) *
    (1 - smoothstep(.68, .73, y)) * smoothstep(.13, .28, y);
  const fist = smoothstep(.65, .80, x) *
    (1 - smoothstep(.39, .51, y)) * smoothstep(.19, .26, y);
  const coat = smoothstep(.54, .78, x) *
    smoothstep(.44, .61, y) * (1 - smoothstep(.69, .78, y));
  const body = smoothstep(.28, .45, y) * (1 - legs);

  const dx = legs * stride * (.054 * rear - .048 * front) +
    cane * stride * .012 - fist * stride * .009 +
    coat * settle * .009 + body * stride * .003;
  const dy = -legs * .023 *
    (Math.max(0, stride) * rear + Math.max(0, -stride) * front) -
    cane * Math.max(0, stride) * .007;
  return [x + dx, y + dy];
}
