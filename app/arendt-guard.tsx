"use client";
import {useEffect,useRef} from "react";
const src="/game/arendt-guard-frame.webp?v=4.3";
let pending:Promise<HTMLImageElement>|undefined;
function art(){return pending??=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.decoding="async";image.onload=()=>resolve(image);image.onerror=()=>{pending=undefined;reject(new Error(src));};image.src=src;});}
/** The approved folder/pen artwork settles into guard without touching its face or texture. */
export function ArendtGuard({action,clock}:{action:string;clock:{time:number}}){
 const ref=useRef<HTMLCanvasElement>(null),active=action==="guard"||action==="guard-hit";
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext("2d");if(!canvas||!c||!active)return;
  let frame=0,disposed=false;const start=clock.time;
  art().then(image=>{const draw=()=>{if(disposed)return;const box=canvas.getBoundingClientRect(),density=Math.min(4,Math.max(2,window.devicePixelRatio||1));
   const w=Math.max(image.naturalWidth,Math.round(box.width*density)),h=Math.max(image.naturalHeight,Math.round(box.height*density));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
   const t=Math.max(0,clock.time-start),settle=Math.min(1,t/140),brace=action==="guard-hit"?Math.sin(Math.min(1,t/180)*Math.PI):0;
   c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
   c.save();c.translate(w*.5,h*.95);c.scale(1+Math.sin(t/420)*.0015,1-.025*settle-.007*brace);c.translate(-w*.5,-h*.95);
   c.drawImage(image,0,0,w,h);c.restore();canvas.dataset.ready="true";frame=requestAnimationFrame(draw);
  };draw();}).catch(()=>{});
  return()=>{disposed=true;cancelAnimationFrame(frame);delete canvas.dataset.ready;};
 },[action,active,clock]);
 return active?<canvas ref={ref} className="arendt-guard-canvas" aria-hidden="true"/>:null;
}
