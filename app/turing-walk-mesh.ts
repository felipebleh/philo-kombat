export const TURING_WALK_DURATION = 720;

function smoothstep(low: number, high: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - low) / (high - low)));
  return t * t * (3 - 2 * t);
}

/**
 * A quick, grounded stride inspired by Turing's distance running. The face and
 * torso stay stable while the hips, trouser legs and jacket move independently.
 */
export function turingWalkVertex(
  x: number,
  y: number,
  elapsed: number,
  retreat: boolean,
): [number, number] {
  const phase = elapsed / TURING_WALK_DURATION * Math.PI * 2;
  const direction = retreat ? -1 : 1;
  const stride = Math.sin(phase) * direction;
  const cadence = Math.sin(phase * 2);

  const hips = smoothstep(.53, .62, y) * (1 - smoothstep(.69, .76, y));
  const legs = smoothstep(.62, .92, y);
  const feet = smoothstep(.84, .98, y);
  const rightSide = smoothstep(.48, .61, x);
  const leftSide = 1 - rightSide;

  const legSwing = legs * stride * (.019 * leftSide - .019 * rightSide);
  const footPlant = feet * stride * (.0045 * rightSide - .0045 * leftSide);
  const lift = legs * Math.abs(stride) * .0085;
  const hipShift = hips * cadence * .0028;

  const jacket = smoothstep(.25, .38, y) * (1 - smoothstep(.58, .68, y));
  const jacketEdge = smoothstep(.20, .31, Math.abs(x - .5));
  const jacketSway = jacket * jacketEdge * stride * (x < .5 ? -.0028 : .0028);

  return [x + legSwing + footPlant + hipShift + jacketSway, y - lift];
}
