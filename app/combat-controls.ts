export type CombatMove = "dialetica" | "caverna" | "ideias" | "especial" | "transcender";
export const ATTACK_KEYS: Record<string, CombatMove> = { j: "dialetica", k: "caverna", i: "ideias", l: "especial", u: "transcender" };
export const INPUT_BUFFER_MS = 140;
export const FREUD_SCALE = 1.10;
export const HYPATIA_SCALE = 1.19;
export const AVERROES_SCALE = 1.15;
// Native idle: 334/418 of a 78%-high root. At 1.15 it matches 95% of
// Felipe's visible idle height (82% root × .92 body), without oversizing.
export const THOMAS_SCALE = 1.15;
// Native idle is 306/418 of the 78% root: target 92% of Felipe’s visible body.
export const MACHIAVELLI_SCALE = 1.2155;
const cpuBreathingRoom = (fighter: string) => fighter === "hypatia" ? 220 : fighter === "machiavelli" ? 260 : 0;
export const cpuDecisionInterval = (fighter: string) => 1280 + cpuBreathingRoom(fighter);

// Widths use arena percentages; vertical coordinates use normalized body space.
// Existing reach already includes a four-unit forward origin and a ten-unit body.
export function fighterContactGeometry(fighter: string) {
  const scale = fighter === "wittgenstein" ? .92 : fighter === "hypatia" ? HYPATIA_SCALE : fighter === "averroes" ? AVERROES_SCALE : fighter === "thomas" ? THOMAS_SCALE : fighter === "machiavelli" ? MACHIAVELLI_SCALE : fighter === "freud" ? FREUD_SCALE : 1;
  return {
    scale,
    hurtbox: { width: (fighter === "darwin" ? 8 : 10) * scale, height: scale },
    attackOrigin: { x: 4 * scale, y: .65 * scale },
  };
}
export const isSupreme = (move: CombatMove) => move === "especial" || move === "transcender";
// Schopenhauer's cane is a continuous segment from his torso to its tip.
// The opponent's body may intersect that segment even if its center has crossed
// slightly behind the hand. Keep the existing maximum forward reach.
export function caneContactSpan(reach:number, targetWidth:number) {
  return {start:0,end:Math.max(0,reach-targetWidth/2),targetHalfWidth:targetWidth/2};
}
export const minimumFighterGap = (player:string,enemy:string) => player === "schopenhauer" || enemy === "schopenhauer" ? 22 : 18;
export function resolveFighterPushboxes(player:number,enemy:number,playerFighter:string,enemyFighter:string){
  if(playerFighter!=="schopenhauer"&&enemyFighter!=="schopenhauer")return {player,enemy};
  const gap=minimumFighterGap(playerFighter,enemyFighter);
  if(enemy-player>=gap)return {player,enemy};
  const center=(player+enemy)/2;
  const left=Math.max(13,Math.min(57,80-gap,center-gap/2));
  return {player:left,enemy:Math.max(left+gap,Math.min(80,center+gap/2))};
}
// Positions are percentages of the arena. Extend only toward the facing side.
export function attackConnects(origin: number, target: number, facing: 1 | -1, range: number, move: CombatMove, airborne = false, fighters?: { attacker: string; target: string; defenderCrouching?: boolean }) {
  if (isSupreme(move)) return true;
  const forward = (target - origin) * facing;
  const bonus = move === "dialetica" ? 0 : move === "caverna" ? 2 : 4;
  let reach = (range + bonus) * 1.3;
  // Only fighters with calibrated body sizes need adjusted attack/target geometry.
  if (fighters && (fighterContactGeometry(fighters.attacker).scale !== 1 || fighterContactGeometry(fighters.target).scale !== 1 || fighters.target === "darwin")) {
    const attacker = fighterContactGeometry(fighters.attacker);
    const defender = fighterContactGeometry(fighters.target);
    reach = attacker.attackOrigin.x + (reach - 4) * attacker.scale + (defender.hurtbox.width - 10) / 2;
    const attackY = move === "caverna" ? .35 * attacker.hurtbox.height : attacker.attackOrigin.y;
    const halfHeight = .15 * attacker.scale;
    const defenderBottom = airborne ? .55 : 0;
    if (attackY + halfHeight < defenderBottom || attackY - halfHeight > defenderBottom + defender.hurtbox.height) return false;
  }
  // Calibrated targets use the visible body rather than the wide art canvas.
  if (fighters?.attacker === "felipe" && (fighters.target === "darwin" || fighters.target === "wittgenstein")) {
    const visibleReach = move === "dialetica" ? 30 : move === "caverna" ? 36 : 40;
    reach = Math.min(reach, visibleReach);
  }
  // Confúcio's kick overlaps a crouching torso or knee, but not a jump.
  if (fighters?.attacker === "confucius" && move === "caverna") {
    const attackBottom = .20, attackTop = .56;
    const defenderBottom = airborne ? .55 : 0, defenderTop = defenderBottom + (fighters.defenderCrouching ? .58 : 1);
    if (attackTop <= defenderBottom || attackBottom >= defenderTop || airborne) return false;
  }
  if(fighters?.attacker === "deleuze" && move === "caverna") {
    const attackBottom=.18,attackTop=.64,defenderBottom=airborne?.55:0;
    const defenderTop=defenderBottom+(fighters.defenderCrouching?.58:1);
    if(airborne||attackBottom>=defenderTop||attackTop<=defenderBottom)return false;
  }
  if(fighters?.attacker === "schopenhauer" && (move === "dialetica" || move === "ideias")) {
    const span=caneContactSpan(reach,fighterContactGeometry(fighters.target).hurtbox.width);
    return forward+span.targetHalfWidth>=span.start && forward-span.targetHalfWidth<=span.end+1e-9;
  }
  return forward >= 0 && forward <= reach + 1e-9 && !(move === "caverna" && airborne);
}
export const recoveryDuration = (duration: number, impact: number) => Math.max(impact + 80, duration - Math.min(90, (duration - impact) * .2));
export const cpuAttackRecovery = (fighter: string, duration: number, impact: number, special: boolean) =>
  // Machiavelli recovers after the complete pose and the 50ms effect tail.
  (fighter === "machiavelli" ? duration + (special ? 50 : 0) : special ? duration : recoveryDuration(duration, impact)) + cpuBreathingRoom(fighter);

export class InputBuffer {
  queue: { move: CombatMove; expires: number }[] = [];
  push(move: CombatMove, now: number) {
    this.queue = this.queue.filter(item => item.expires >= now);
    this.queue.push({ move, expires: now + INPUT_BUFFER_MS });
    this.queue = this.queue.slice(-4);
  }
  consume(now: number, run: (move: CombatMove) => boolean) {
    this.queue = this.queue.filter(item => item.expires >= now);
    if (this.queue.length && run(this.queue[0].move)) this.queue.shift();
  }
  clear() { this.queue = []; }
}

/** Gameplay deadlines and callbacks share a clock that stops at impact. */
export class CombatClock {
  time = 0;
  stopped = 0;
  jobs: { at: number; run: () => void }[] = [];
  schedule(run: () => void, delay: number) { this.jobs.push({ at: this.time + delay, run }); }
  freeze(ms = 50) { this.stopped = Math.max(this.stopped, ms); }
  tick(delta: number) {
    const held = Math.min(this.stopped, delta);
    this.stopped -= held;
    this.time += delta - held;
    // Iterate a snapshot: a callback may reset the round or schedule more work.
    const due = this.jobs.filter(job => job.at <= this.time);
    this.jobs = this.jobs.filter(job => job.at > this.time);
    for (const job of due) { if (this.stopped > 0) { this.jobs.push(job); } else job.run(); }
  }
  reset() { this.time = 0; this.stopped = 0; this.jobs = []; }
}
