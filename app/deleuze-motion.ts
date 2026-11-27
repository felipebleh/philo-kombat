export const DELEUZE_MOTION_ART=['/game/deleuze-fullbody-hq.webp?v=4.12','/game/deleuze-guard-v2.webp','/game/deleuze-walk-a-v2.webp','/game/deleuze-walk-b-v2.webp','/game/deleuze-combo-hq.webp?v=4.12','/game/deleuze-victory-hq.webp?v=4.12'] as const;
export const deleuzeMotionActive=(action:string)=>['advance','retreat','guard','guard-hit','special-rhizome','special-mille-plateaux'].includes(action);
export function deleuzeMotionPose(action:string,elapsed:number){
 if(action==='advance'||action==='retreat')return (action==='advance'?[2,0,3,0]:[3,0,2,0])[Math.floor(elapsed/170)%4];
 if(action==='special-rhizome')return 4;
 if(action==='special-mille-plateaux')return elapsed<650?5:4;
 return elapsed<60?0:1;
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
// Changes depend on y only so Canvas band sampling preserves face/crutch detail.
export function deleuzeMotionVertex(x:number,y:number,elapsed:number,action:string):[number,number]{
 const upper=1-smooth(.48,.96,y),breath=Math.sin(elapsed/280),brace=action==='guard-hit'?Math.sin(Math.min(1,elapsed/200)*Math.PI):0;
 let dx=-upper*brace*.006,dy=upper*(breath*.0012+brace*.005);
 if(action==='advance'||action==='retreat')dx+=upper*Math.sin(elapsed/110)*.002;
 if(action.startsWith('special-'))dy-=upper*Math.sin(Math.min(1,elapsed/1450)*Math.PI)*.006;
 return[x+dx,y+dy];
}
