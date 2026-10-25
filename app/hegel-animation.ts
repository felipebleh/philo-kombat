import type { HegelPose } from './hegel-pose-data';

// Full-body photographic action frames, staged like Felipe's pose system.
// Each transition changes the complete native artwork, including arms and legs.
export function hegelPose(action:string, elapsed:number):HegelPose {
 const t=Math.max(0,elapsed);
 switch(action){
  case 'advance':case 'retreat':case 'walk': {
   const cycle:HegelPose[]=['walkA','walkPassA','walkB','walkPassB'];
   const step=Math.floor(t%640/160);return cycle[action==='retreat'?3-step:step];
  }
  case 'attack-punch':return t<120?'windup':t<340?'punch':t<450?'windup':'idle';
  case 'attack-kick':return t<140?'windup':t<430?'kick':t<570?'windup':'idle';
  case 'attack-combo':return t<100?'windup':t<280?'punch':t<470?'hook':t<680?'kick':t<760?'windup':'idle';
  case 'special-dialectic':return t<180?'windup':t<600?'summon':t<1280?'cast':t<1400?'windup':'idle';
  case 'special-world-spirit':return t<180?'windup':t<640?'cast':t<1660?'summon':t<1780?'cast':'idle';
  case 'jump':return t<90?'guard':t<500?'jump':t<610?'guard':'idle';
  case 'guard':case 'guard-hit':case 'block':case 'crouch':return t<70?'windup':'guard';
  case 'hit':return t<260?'hit':t<370?'windup':'idle';
  case 'knocked-out':return t<180?'hit':'fallen';
  case 'recover':return t<320?'rise':t<450?'guard':'idle';
  case 'victory':return 'victory';
  default:return 'idle';
 }
}
export type HegelSource={width:number;height:number;anchorX:number;soleY:number;bodyHeight:number};
export function hegelPlacement(width:number,height:number,source:HegelSource){
 // Same94% standing height relative to Felipe. Both axes always share one scale.
 const scale=height*.92*.94*source.bodyHeight/(source.soleY-4);
 const groundY=height*(1-15/1536);
 return {x:width/2-source.anchorX*scale,y:groundY-source.soleY*scale,width:source.width*scale,height:source.height*scale,scale,groundY};
}
export function hegelBuffer(width:number,height:number,ratio:number){
 const dpr=Math.max(2,Number.isFinite(ratio)&&ratio>0?ratio:1);
 return {width:Math.max(1,Math.round(width*dpr)),height:Math.max(1,Math.round(height*dpr)),dpr};
}
export function paintHegel(ctx:CanvasRenderingContext2D,art:CanvasImageSource,source:HegelSource,width:number,height:number,dpr:number,lift=0){
 const p=hegelPlacement(width,height,source);
 ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.globalAlpha=1;ctx.filter='none';
 ctx.drawImage(art,0,0,source.width,source.height,p.x,p.y-lift*height,p.width,p.height);
}
