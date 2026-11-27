export const FANON_MOTION_ART=["/game/fanon-fullbody-hq.webp?v=4.7","/game/fanon-guard-v2.webp","/game/fanon-victory-hq.webp?v=4.7","/game/fanon-release-v2.webp","/game/fanon-combo-hq.webp?v=4.7"] as const;
export const fanonMotionActive=(action:string)=>['guard','guard-hit','special-black-skin-white-masks','special-wretched-earth'].includes(action);
export function fanonMotionPose(action:string,elapsed:number){
 if(action==='special-black-skin-white-masks')return elapsed<900?2:3;
 if(action==='special-wretched-earth')return 4;
 return elapsed>=70?1:0;
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function fanonMotionVertex(x:number,y:number,elapsed:number,action:string):[number,number]{
 const upper=1-smooth(.48,.96,y),breath=Math.sin(elapsed/260),brace=action==='guard-hit'?Math.sin(Math.min(1,elapsed/200)*Math.PI):0;
 let dx=-upper*brace*.007,dy=upper*(breath*.0015+brace*.006);
 if(action==='special-black-skin-white-masks'){
  const gesture=elapsed<900?smooth(100,900,elapsed):1-smooth(900,1450,elapsed);dy-=upper*gesture*.007;
 }else if(action==='special-wretched-earth'){
  const impact=Math.sin(Math.min(1,elapsed/1450)*Math.PI*4);dy+=upper*Math.max(0,impact)*.012;dx+=upper*impact*.004;
 }
 return[x+dx,y+dy];
}
