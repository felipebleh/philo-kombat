/** The clone shares Felipe's attack rhythm, with its own complete articulated poses. */
export const CYBORG_WALK_MS = 640;
export const CYBORG_TIMING = { certaintyImpact:1180, swarmImpact:1480, end:1850 } as const;
export type CyborgPose = 'idle'|'walk0'|'walk1'|'walk2'|'walk3'|'windup'|'punch'|'kick'|'hook'|'guard'|'jump'|'cast'|'hit'|'fallen'|'rise'|'victory'|'charge';
export function cyborgPose(action:string,t:number):CyborgPose{
 t=Math.max(0,t);
 if(action==='advance'||action==='retreat'){
  const step=Math.floor(t%CYBORG_WALK_MS/160);
  return `walk${action==='retreat'?3-step:step}` as CyborgPose;
 }
 if(action==='attack-punch')return t<120?'windup':t<340?'punch':t<450?'windup':'idle';
 if(action==='attack-kick')return t<140?'windup':t<430?'kick':t<570?'windup':'idle';
 if(action==='attack-combo')return t<100?'windup':t<280?'punch':t<470?'hook':t<730?'kick':t<880?'windup':'idle';
 if(action==='jump')return t<90?'guard':t<500?'jump':t<610?'guard':'idle';
 if(action==='guard'||action==='guard-hit')return 'guard';
 if(action==='hit')return t<260?'hit':t<370?'windup':'idle';
 if(action==='knocked-out')return t<180?'hit':'fallen';
 if(action==='recover')return t<420?'rise':'idle';
 if(action==='victory')return 'victory';
 if(action==='special-certainty')return t<200?'charge':t<1260?'cast':'idle';
 if(action==='special-drone-swarm')return t<220?'charge':t<1640?'cast':'idle';
 return 'idle';
}
export const CYBORG_HEIGHT:Record<CyborgPose,number>={idle:.92,walk0:.92,walk1:.92,walk2:.92,walk3:.92,windup:.90,punch:.88,kick:.85,hook:.88,guard:.70,jump:.76,cast:.90,hit:.90,fallen:.30,rise:.63,victory:.97,charge:.90};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function cyborgProjectilePose(kind:'certainty'|'swarm',t:number,origin:number,target:number,index=0){
 const impact=kind==='certainty'?CYBORG_TIMING.certaintyImpact:CYBORG_TIMING.swarmImpact;
 const start=kind==='certainty'?220:300+index*105;
 const p=clamp((t-start)/(impact-start));
 return {x:origin+(target-origin)*(p*p*(3-2*p)),y:kind==='certainty'?.43:.36+index*.12-Math.sin(p*Math.PI)*.04,
  facing:target>=origin?1:-1,visible:t>=start&&t<impact,impact,burst:clamp((t-impact)/300),exploding:t>=impact&&t<impact+300};
}
