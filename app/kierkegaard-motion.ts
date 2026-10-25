export const FAITH_TIMING = { launch: 200, impact: 1480, end: 1850 } as const;
export const KIERKEGAARD_STEP_MS = 110;
export const KIERKEGAARD_WALK_DURATION = KIERKEGAARD_STEP_MS * 8;
const clamp = (x:number,a=0,b=1) => Math.max(a,Math.min(b,x));

/** One trajectory drives physics, artwork, abyss and celestial light. */
export function faithLeapPose(elapsed:number,origin:number,landing:number) {
 const t=clamp((elapsed-FAITH_TIMING.launch)/(FAITH_TIMING.impact-FAITH_TIMING.launch));
 return {position:origin+(landing-origin)*t,lift:4*t*(1-t)*.34,
  airborne:elapsed>=FAITH_TIMING.launch&&elapsed<FAITH_TIMING.impact,
  light:Math.sin(Math.PI*clamp((elapsed-450)/850))**2,
  opacity:clamp(elapsed/180)*clamp((FAITH_TIMING.end-elapsed)/250),progress:t};
}
export function faithLanding(origin:number,target:number,side:'player'|'enemy',gap=18) {
 const desired=Number.isFinite(target)?target+(side==='player'?-gap:gap):origin;
 return side==='player'?clamp(desired,13,57):clamp(desired,13+gap,80);
}
export function kierkegaardMotionPose(action:string,t:number,jumpMs=650) {
 if(action==='advance'||action==='retreat'){
  const step=Math.floor(Math.max(0,t)%KIERKEGAARD_WALK_DURATION/KIERKEGAARD_STEP_MS);
  return {frame:`walk-${action==='retreat'?(8-step)%8:step}`,lift:0};
 }
 if(action==='attack-combo'){
  const frame=t<80?'idle':t<160?'combo-ready':t<320?'combo-thrust':t<420?'combo-ready':t<500?'combo-reload':t<700?'combo-cut':t<810?'combo-reload':t<890?'combo-ready':'idle';
  return {frame,lift:0};
 }
 if(action==='guard'||action==='guard-hit'||action==='crouch'||action==='block')return {frame:'crouch',lift:0};
 if(action==='jump'){
  const p=clamp((t/jumpMs-.10)/.80);
  return {frame:t<jumpMs*.12||t>jumpMs*.87?'crouch':'air',lift:4*p*(1-p)*.24};
 }
 if(action==='special-faith-leap'){
  const p=faithLeapPose(t,0,1);
  return {frame:p.airborne?'air':t<FAITH_TIMING.launch||t<1640?'crouch':'idle',lift:p.lift};
 }
 return {frame:'idle',lift:0};
}

/** Two umbrella thrusts; distinct directions embody the fork in the choice. */
export function eitherSlashPose(t:number) {
 const index=t<390?0:1,start=index?430:100,duration=240;
 const p=clamp((t-start)/duration);
 return {index,progress:p,alpha:t<start||t>start+duration?0:Math.sin(Math.PI*p)};
}
