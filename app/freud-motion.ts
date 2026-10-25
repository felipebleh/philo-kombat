export const FREUD_FLASH_ALPHA = .35;
export const FREUD_DREAM_SLOW_MS = 500;
export const FREUD_SPECIAL_TIMING = {dreamImpact:1180,deathImpact:1480,deathEnd:1850} as const;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));

/** Source-atop white at 35%: alpha stays untouched for every live sprite frame. */
export function softHitflashMatrix(alpha=FREUD_FLASH_ALPHA){
 const a=clamp(alpha),s=1-a;
 return `${s} 0 0 0 ${a} 0 ${s} 0 0 ${a} 0 0 ${s} 0 ${a} 0 0 0 1 0`;
}
export function freudCigarTip(action:string){
 return action==='idle'?{x:.451,y:.252}:action==='attack-punch'?{x:.454,y:.276}:null;
}
export function freudSmokeParticle(index:number,t:number,action:string){
 const age=((t/1700+index*.137)%1+1)%1;
 const tip=freudCigarTip(action);
 if(!tip)return null;
 return {x:tip.x+Math.sin(age*5.8+index*1.7)*.015-age*.012,
  y:tip.y-age*.23,radius:.003+age*.012,alpha:Math.sin(Math.PI*age)*.13,
  ember:action==='attack-punch'&&t>=90&&t<=360};
}
export function freudDeathWavePose(t:number,origin:number,target:number){
 const p=clamp((t-220)/(FREUD_SPECIAL_TIMING.deathImpact-220));
 const travel=p*p*(3-2*p);
 return {position:origin+(target-origin)*travel,progress:p,
  opacity:clamp(t/200)*clamp((FREUD_SPECIAL_TIMING.deathEnd-t)/300),
  facing:target>=origin?1:-1};
}
/** Slow statuses share a cap, rather than multiplying two half-speed effects. */
export function combatMovementRate(now:number,pactUntil:number,torporUntil:number){
 return Math.max(pactUntil,torporUntil)>now?.5:1;
}
export function freudShadowPose(action:string,t:number,jumpMs=650){
 const lift=action==='jump'?Math.sin(Math.PI*clamp(t/jumpMs)):0;
 const open=action.startsWith('attack-')?1.15:1;
 return {width:open*(1-lift*.40),height:1-lift*.35,opacity:.50-lift*.27};
}
