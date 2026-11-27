"use client";
import {useEffect, useRef} from "react";
import hdArt from "./sidarta-hd-art.json";
import {sidartaDensity,sidartaDrawRect} from "./sidarta-motion";
import {sidartaWalkFeet,sidartaWalkVertex} from "./sidarta-walk-mesh";

const MASTER=hdArt.walk[3];
const BODY="/game/sidarta-walk-body-v4.webp";
const FOOT="/game/sidarta-walk-foot-v4.webp";
const load=(src:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src;});
let art:Promise<[HTMLImageElement,HTMLImageElement]>|undefined;
function loadWalk(){return art??=Promise.all([load(BODY),load(FOOT)]).catch(error=>{art=undefined;throw error;});}

/** Draw both alternating feet under the robe and a stable high-resolution torso. */
export function SidartaWalk({retreat,paused=false,clock}:{retreat:boolean;paused?:boolean;clock?:{time:number}}){
 const ref=useRef<HTMLCanvasElement>(null),pause=useRef(paused);pause.current=paused;
 useEffect(()=>{
  const canvas=ref.current;if(!canvas)return;
  const fallback=canvas.previousElementSibling as HTMLCanvasElement|null,ctx=canvas.getContext("2d");if(!ctx)return;
  let disposed=false,animation=0,elapsed=0,previous=0,last=-1,lastW=0,lastH=0;
  const started=clock?.time??0;
  loadWalk().then(([body,foot])=>{
   if(disposed)return;
   const rect=sidartaDrawRect(1800,1536,body.naturalWidth,body.naturalHeight,1,3,MASTER.anchorX);
   const cols=12,rows=20,cellW=body.naturalWidth/cols,cellH=body.naturalHeight/rows;
   const draw=(now:number)=>{
    if(disposed)return;
    if(clock)elapsed=Math.max(0,clock.time-started);else if(previous&&!pause.current)elapsed+=Math.min(32,now-previous);previous=now;
    const box=canvas.getBoundingClientRect(),density=sidartaDensity(window.devicePixelRatio),w=Math.max(1,Math.round(box.width*density)),h=Math.max(1,Math.round(box.height*density));
    if(w!==lastW||h!==lastH){canvas.width=w;canvas.height=h;lastW=w;lastH=h;last=-1;}
    if(elapsed!==last){
     ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
     const scaleX=rect.width/body.naturalWidth,scaleY=rect.height/body.naturalHeight,feet=sidartaWalkFeet(elapsed,retreat);
     ctx.setTransform(w/1800,0,0,h/1536,0,0);
     for(const leg of [feet.far,feet.near]){
      const footW=foot.naturalWidth*scaleX*leg.scale,footH=foot.naturalHeight*scaleY*1.35;
      const x=rect.x+(leg.ankleX-20*leg.scale)*scaleX,y=rect.groundY-footH-leg.lift*scaleY;
      ctx.drawImage(foot,x,y,footW,footH);
     }
     for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const x=col/cols,y=row/rows,sx=col*cellW,sy=row*cellH;
      const p=sidartaWalkVertex(x,y,elapsed,retreat),px=sidartaWalkVertex((col+1)/cols,y,elapsed,retreat),py=sidartaWalkVertex(x,(row+1)/rows,elapsed,retreat);
      const a=(px[0]-p[0])*rect.width/cellW,b=(px[1]-p[1])*rect.height/cellW,c=(py[0]-p[0])*rect.width/cellH,d=(py[1]-p[1])*rect.height/cellH;
      const e=rect.x+p[0]*rect.width-a*sx-c*sy,f=rect.y+p[1]*rect.height-b*sx-d*sy;
      ctx.setTransform(w/1800*a,h/1536*b,w/1800*c,h/1536*d,w/1800*e,h/1536*f);
      const left=Math.max(0,sx-1),top=Math.max(0,sy-1),right=Math.min(body.naturalWidth,sx+cellW+1),bottom=Math.min(body.naturalHeight,sy+cellH+1);
      ctx.drawImage(body,left,top,right-left,bottom-top,left,top,right-left,bottom-top);
     }
     canvas.dataset.ready="true";canvas.dataset.phase=String(Math.floor(elapsed%640));if(fallback)fallback.style.visibility="hidden";last=elapsed;
    }
    animation=requestAnimationFrame(draw);
   };animation=requestAnimationFrame(draw);
  }).catch(()=>{/* Keep the original HD pose visible if an asset fails to load. */});
  return()=>{disposed=true;cancelAnimationFrame(animation);if(fallback)fallback.style.visibility="";};
 },[retreat,clock]);
 return <canvas ref={ref} className="sidarta-walk-canvas" aria-hidden="true"/>;
}
