/** Small joint motions over the approved HQ art. No resampling into sprite cells. */
export const DARWIN_MOTION_ART = [
  "/game/darwin-fullbody-clean-hq.webp?v=5.3.1",
  "/game/darwin-punch-hq.webp?v=3.8.1",
  "/game/darwin-kick-hq.webp?v=3.8.1",
  "/game/darwin-combo-hq.webp?v=3.8.1",
] as const;
export const darwinMotionActive = (action: string) => ["idle", "guard", "guard-hit", "attack-punch", "attack-kick", "attack-combo", "special-natural-selection", "special-tree-of-life"].includes(action);
export function darwinMotionPose(action: string, elapsed: number) {
  if (action === "attack-punch") return 1;
  if (action === "attack-kick") return 2;
  if (action === "attack-combo") return elapsed < 290 ? 1 : elapsed < 580 ? 2 : 3;
  return 0;
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const windowAt = (a: number, b: number, c: number, d: number, x: number) => smooth(a,b,x)*(1-smooth(c,d,x));
const pulse = (t: number, impact: number, end: number) => t < impact ? smooth(0,impact,t) : 1-smooth(impact,end,t);

export function darwinMotionVertex(x: number, y: number, elapsed: number, action: string): [number,number] {
  if (!darwinMotionActive(action)) return [x,y];
  const phase = elapsed / 3000 * Math.PI * 2;
  const breathe = Math.sin(phase), shift = Math.sin(phase * .5);
  // Entire head shares one translation: no stretching of eyes, nose or beard.
  // Both grounded boots stay fixed, with a smooth knee/hip transition above them.
  const upper = 1-smooth(.48,.88,y);
  const chest = windowAt(.22,.32,.46,.62,y);
  const hand = smooth(.60,.76,x)*windowAt(.02,.27,.40,.53,y);
  const cane = (1-smooth(.24,.34,x))*windowAt(.10,.17,.75,.85,y);
  const coat = smooth(.55,.80,x)*windowAt(.42,.54,.71,.84,y);
  const knee = windowAt(.47,.60,.73,.88,y);
  let dx = upper * shift * .003 + chest * breathe * .0015;
  let dy = upper * breathe * .0015;
  let armAngle = breathe * .025;
  if (action === "guard" || action === "guard-hit") {
    const settle = smooth(0,150,elapsed);
    const brace = action === "guard-hit" ? pulse(elapsed,45,200) : 0;
    dx += upper * (-.012 * settle - .008 * brace) + knee * (x-.5) * .025 * settle;
    dy += upper * (.019 * settle + .006 * brace);
    armAngle = -.36 * settle + breathe * .018;
  } else if (action.startsWith("attack-")) {
    const pose = darwinMotionPose(action,elapsed);
    const local = action === "attack-combo" ? elapsed - (pose === 1 ? 0 : pose === 2 ? 290 : 580) : elapsed;
    const hit = pulse(local,pose === 1 ? 210 : pose === 2 ? 260 : 110,pose === 3 ? 360 : 520);
    dx += upper * hit * .009 + coat * hit * .012;
    armAngle = pose === 1 ? -.055 * hit : pose === 2 ? .08 * hit : -.10 * hit;
    if (pose === 2) {
      // The extended knee/boot follows the hip; the supporting boot remains rigid.
      const raisedLeg = smooth(.58,.72,x)*windowAt(.28,.38,.57,.70,y);
      dy -= raisedLeg * hit * .012;
    }
    if (pose === 3) dy += chest * hit * .003;
  } else if (action.startsWith("special-")) {
    const gesture = pulse(elapsed,action === "special-tree-of-life" ? 700 : 500,1800);
    armAngle = -.24 * gesture;
    dx += chest * gesture * .004;
    dy -= upper * gesture * .003;
  } else {
    dx += coat * Math.sin(phase+.7) * .003;
  }
  const ax = x-.64, ay = y-.25;
  dx += hand * (ax*(Math.cos(armAngle)-1)-ay*Math.sin(armAngle));
  dy += hand * (ax*Math.sin(armAngle)+ay*(Math.cos(armAngle)-1));
  dx += cane * (breathe * .002 + (action === "guard" ? smooth(0,150,elapsed)*.004 : 0));
  return [x+dx,y+dy];
}
