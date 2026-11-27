export const FREIRE_MOTION_ART=["/game/paulo-freire-fullbody-hq.webp?v=4.6","/game/paulo-freire-guard-v2.webp","/game/paulo-freire-liberating-v2.webp"] as const;
export const freireMotionActive=(action:string)=>['guard','guard-hit','special-banking-education','special-liberating-education'].includes(action);
export function freireMotionPose(action:string,elapsed:number){return action==='special-liberating-education'?2:elapsed>=70?1:0;}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function freireMotionVertex(x:number,y:number,elapsed:number,action:string):[number,number]{
 const upper=1-smooth(.50,.95,y),breathe=Math.sin(elapsed/260),brace=action==='guard-hit'?Math.sin(Math.min(1,elapsed/200)*Math.PI):0;
 let dx=-upper*brace*.006,dy=upper*(breathe*.0015+brace*.006);
 if(action==='special-banking-education'){
  const thrust=elapsed<900?smooth(500,900,elapsed):1-smooth(900,1300,elapsed);
  // Both forearms and the book move forward as one rigid region; feet stay planted.
  const arms=(1-smooth(.48,.60,y))*smooth(.23,.35,y);
  dx+=arms*thrust*.038;dy-=arms*thrust*.012;
 }else if(action==='special-liberating-education'){
  const hands=1-smooth(.30,.46,y);dy-=hands*Math.sin(elapsed/160)*.002;
 }
 return[x+dx,y+dy];
}
