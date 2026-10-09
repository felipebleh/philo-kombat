import { FELIPE_WALK_DURATION } from "./felipe-animation";

const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Opposing legs, foot lift and arm counter-swing at display refresh rate.
// Head/torso scale stays fixed; all vertices meet again after a complete step.
export function felipeWalkVertex(x: number, y: number, elapsed: number, retreat: boolean): [number, number] {
  const phase = elapsed / FELIPE_WALK_DURATION * Math.PI * 2;
  const stride = Math.sin(phase) * (retreat ? -1 : 1);
  const side = smooth(.44, .62, x);
  const legs = smooth(.46, .88, y);
  const feet = smooth(.78, .97, y);
  const arms = smooth(.16, .27, y) * (1 - smooth(.39, .49, y));
  const outer = smooth(.10, .29, Math.abs(x - .51));
  const counter = (1 - side * 2) * stride;
  const footLift = feet * (Math.max(0, stride) * side + Math.max(0, -stride) * (1 - side));
  return [x + legs * counter * .040 - arms * outer * counter * .012, y - footLift * .021];
}
