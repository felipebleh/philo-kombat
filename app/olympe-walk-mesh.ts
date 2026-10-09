// Rig fitted to Olympe's existing portrait: boots below the skirt, a quill in
// the rear hand and a scroll in the forward hand. Her face stays rigid.
export const OLYMPE_WALK_DURATION = 660;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

export function olympeWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = (elapsed / OLYMPE_WALK_DURATION) * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const clothSway = Math.sin(phase * 2);
  const legs = smoothstep(.44, .86, y);
  const front = smoothstep(.44, .63, x);
  const rear = 1 - front;
  const skirt = smoothstep(.43, .59, y) * (1 - smoothstep(.79, .89, y));
  const quill = (1 - smoothstep(.30, .35, x)) *
    smoothstep(.10, .14, y) * (1 - smoothstep(.35, .44, y));
  const scroll = smoothstep(.60, .74, x) *
    smoothstep(.22, .30, y) * (1 - smoothstep(.43, .50, y));
  const body = smoothstep(.25, .40, y) * (1 - legs);

  // Rotate each guarded hand and its prop around the corresponding shoulder.
  const rearAngle = stride * .020;
  const frontAngle = -stride * .016;
  const rearX = x - .38;
  const rearY = y - .30;
  const frontX = x - .61;
  const frontY = y - .25;
  const dx = legs * stride * (.047 * rear - .041 * front) +
    skirt * clothSway * .008 * (x - .48) + body * stride * .002 +
    quill * (rearX * (Math.cos(rearAngle) - 1) - rearY * Math.sin(rearAngle)) +
    scroll * (frontX * (Math.cos(frontAngle) - 1) - frontY * Math.sin(frontAngle));
  const dy = -legs * .021 *
    (Math.max(0, stride) * rear + Math.max(0, -stride) * front) +
    quill * (rearX * Math.sin(rearAngle) + rearY * (Math.cos(rearAngle) - 1)) +
    scroll * (frontX * Math.sin(frontAngle) + frontY * (Math.cos(frontAngle) - 1));

  return [x + dx, y + dy];
}
