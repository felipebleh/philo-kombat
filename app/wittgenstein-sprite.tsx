"use client";
import {useEffect,useRef} from "react";
const cache = new Map<string,Promise<HTMLImageElement>>();
function art(src:string){let cached=cache.get(src);if(!cached){cached=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.decoding="async";image.onload=()=>resolve(image);image.onerror=()=>{cache.delete(src);reject(new Error(src));};image.src=src;});cache.set(src,cached);}return cached;}
export function WittgensteinSprite({action,clock}:{action:string;clock:{time:number}}){
 const ref=useRef<HTMLCanvasElement>(null),active=action==="guard"||action==="guard-hit"||action==="special-language-limits";
 useEffect(()=>{
  const canvas=ref.current;if(!canvas||!active)return;const c=canvas.getContext("2d");if(!c)return;
  let disposed=false,frame=0;const started=clock.time;
  art(action==="special-language-limits"?"/game/wittgenstein-silence-v2.webp":"/game/wittgenstein-guard-v2.webp").then(image=>{
   const draw=()=>{if(disposed)return;const box=canvas.getBoundingClientRect(),density=Math.min(4,Math.max(2,window.devicePixelRatio||1)),w=Math.max(image.naturalWidth,Math.round(box.width*density)),h=Math.max(image.naturalHeight,Math.round(box.height*density));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";
    const elapsed=Math.max(0,clock.time-started),brace=action==="guard-hit"?Math.sin(Math.min(1,elapsed/160)*Math.PI):0;
    c.save();c.translate(w*.5,h*.98);c.rotate(-brace*.012);c.scale(1+Math.sin(elapsed/450)*.002,1);c.translate(-w*.5,-h*.98);
    c.drawImage(image,0,0,w,h);c.restore();canvas.dataset.ready="true";frame=requestAnimationFrame(draw);
   };draw();
  }).catch(()=>{});
  return()=>{disposed=true;cancelAnimationFrame(frame);delete canvas.dataset.ready;};
 },[action,active,clock]);
 return active?<canvas className="witt-pose-canvas" ref={ref} aria-hidden="true"/>:null;
}
