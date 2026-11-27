export const FOUCAULT_MOTION_ART=["/game/foucault-idle-clean-v2.webp","/game/foucault-guard-v2.webp","/game/foucault-walk-a-v2.webp","/game/foucault-walk-b-v2.webp","/game/foucault-punch-hq.webp?v=4.2","/game/foucault-combo-hq.webp?v=4.2"] as const;
export const foucaultMotionActive=(action:string)=>['advance','retreat','guard','guard-hit','special-panopticon','special-biopower'].includes(action);
export function foucaultMotionPose(action:string,elapsed:number){
 if(action==='advance'||action==='retreat'){
  const stride=action==='retreat'?[3,0,2,0]:[2,0,3,0],i=Math.floor(elapsed/165)%4;return stride[i];
 }
 if(action==='special-panopticon')return 4;
 if(action==='special-biopower')return 5;
 return elapsed>=70?1:0;
}
const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Whole head stays rigid; all distortion is small and varies only with y. */
export function foucaultMotionVertex(x:number,y:number,elapsed:number,action:string):[number,number]{
 const upper=1-smooth(.48,.96,y),breathe=Math.sin(elapsed/270),brace=action==='guard-hit'?Math.sin(Math.min(1,elapsed/200)*Math.PI):0;
 let dx=-upper*brace*.006,dy=upper*(breathe*.0013+brace*.005);
 if(action==='advance'||action==='retreat'){dx+=upper*Math.sin(elapsed/105)*.002;}
 else if(action.startsWith('special-')){dy-=upper*Math.sin(Math.min(1,elapsed/1450)*Math.PI)*.005;}
 return[x+dx,y+dy];
}
