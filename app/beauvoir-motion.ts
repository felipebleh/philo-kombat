import {beauvoirWalkVertex} from './beauvoir-walk-mesh';
export const BEAUVOIR_MOTION_ART=["/game/beauvoir-guard-frame-clean-v2.webp","/game/beauvoir-block-v2.webp"] as const;
export const beauvoirMotionActive=(action:string)=>['advance','retreat','guard','guard-hit','jump'].includes(action);
export function beauvoirMotionPose(action:string,elapsed:number){return (action==='guard'||action==='guard-hit')&&elapsed>=80?1:0;}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function beauvoirMotionVertex(x:number,y:number,elapsed:number,action:string):[number,number]{
 if(action==='advance'||action==='retreat')return beauvoirWalkVertex(x,y,elapsed+75,action==='retreat');
 const upper=1-smooth(.48,.94,y),breath=Math.sin(elapsed/290),legs=smooth(.58,.82,y);
 if(action==='jump'){
  const fold=Math.sin(Math.min(1,elapsed/650)*Math.PI),right=smooth(.49,.67,x);
  return [x+upper*fold*.012+legs*fold*(right?.016:-.018),y-legs*fold*(right?.044:.025)];
 }
 if(action==='guard'||action==='guard-hit'){
  const settle=elapsed<80?smooth(0,80,elapsed):0,brace=action==='guard-hit'?Math.sin(Math.min(1,elapsed/200)*Math.PI):0;
  return [x-upper*(settle*.008+brace*.007),y+upper*(settle*.01+brace*.006+breath*.0015)];
 }
 return[x,y];
}
