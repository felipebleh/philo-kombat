"use client";
import {useEffect,useRef} from 'react';
import {KIERKEGAARD_COMBO_POSES} from './kierkegaard-combo-poses';
import {KIERKEGAARD_WALK_POSES} from './kierkegaard-walk-poses';
import {KIERKEGAARD_NEW_POSES} from './kierkegaard-pose-data';
import {kierkegaardMotionPose} from './kierkegaard-motion';
const articulatedPoses={...KIERKEGAARD_NEW_POSES,...KIERKEGAARD_WALK_POSES,...KIERKEGAARD_COMBO_POSES};
export const KIERKEGAARD_MOTION_ART={
 ...Object.fromEntries(Object.entries(KIERKEGAARD_COMBO_POSES).map(([name,pose])=>[name,pose.file])),
 ...Object.fromEntries(Object.entries(KIERKEGAARD_WALK_POSES).map(([name,pose])=>[name,pose.file])),
 crouch:'/game/kierkegaard-motion-v2/crouch.webp',
 air:'/game/kierkegaard-motion-v2/air.webp',
 idle:'/game/kierkegaard-guard-frame.webp?v=4.0',
};
let artwork:Promise<Map<string,HTMLImageElement>>|undefined;
function loadArtwork(){return artwork??=Promise.all(Object.entries(KIERKEGAARD_MOTION_ART).map(([name,src])=>new Promise<[string,HTMLImageElement]>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve([name,img]);img.onerror=reject;img.src=src;}))).then(entries=>new Map(entries)).catch(e=>{artwork=undefined;throw e;});}

/** Native complete poses; approved idle, J and K remain in the original renderer. */
export function KierkegaardMotionSprite({action,clock,jumpMs=650,faithStarted}:{action:string;clock:{time:number};jumpMs?:number;faithStarted?:number}){
 const ref=useRef<HTMLCanvasElement>(null),state=useRef({action,changed:true}),jump=useRef(jumpMs),faith=useRef(faithStarted);
 if(state.current.action!==action)state.current={action,changed:true};jump.current=jumpMs;faith.current=faithStarted;
 useEffect(()=>{
  const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  let disposed=false,raf=0,w=0,h=0,dpr=1,started=clock.time,last="";
  const resize=()=>{w=c.clientWidth;h=c.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));last="";};
  resize();const observer=new ResizeObserver(resize);observer.observe(c);
  loadArtwork().then(images=>{
   if(disposed)return;
   const draw=()=>{
    if(state.current.changed){started=clock.time;state.current.changed=false;}
    const t=Math.max(0,clock.time-(state.current.action==='special-faith-leap'?(faith.current??started):started));
    const p=kierkegaardMotionPose(state.current.action,t,jump.current),image=images.get(p.frame)!;
    const baseHeight=h/1.7;
    const signature=`${p.frame}:${p.lift.toFixed(4)}`;
    if(signature!==last){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    // Extra transparent buffer above the body keeps the head inside the canvas at the apex.
    if(p.frame==='idle'){
     const baseWidth=baseHeight*1664/1536;ctx.drawImage(image,(w-baseWidth)/2,h-baseHeight,baseWidth,baseHeight);
    }
    else{
     const source=articulatedPoses[p.frame as keyof typeof articulatedPoses],scale=source.scaleToGuard*baseHeight/1536;
     const x=w/2-source.anchorX*scale,y=h-baseHeight+1460*baseHeight/1536-source.soleY*scale-p.lift*baseHeight;
     ctx.drawImage(image,x,y,source.width*scale,source.height*scale);
    }
    last=signature;
    }
    c.dataset.ready='true';c.dataset.frame=p.frame;c.dataset.lift=p.lift.toFixed(4);c.dataset.elapsed=String(Math.round(t));
    c.closest<HTMLElement>('.fighter')?.style.setProperty('--kierkegaard-shadow-scale',String(1-p.lift*1.5));
    raf=requestAnimationFrame(draw);
   };draw();
  }).catch(()=>{if(!disposed)c.dataset.error='true';});
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();};
 },[clock]);
 return <canvas ref={ref} className="kierkegaard-motion-canvas" aria-hidden="true"/>;
}
