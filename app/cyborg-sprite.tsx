"use client";
import {useEffect,useRef} from 'react';
import {cyborgPose,CYBORG_HEIGHT,type CyborgPose} from './cyborg-motion';
const frames=Object.keys(CYBORG_HEIGHT) as CyborgPose[];
let art:Promise<Map<CyborgPose,HTMLImageElement>>|undefined;
function loadArt(){return art??=Promise.all(frames.map(name=>new Promise<[CyborgPose,HTMLImageElement]>((resolve,reject)=>{const im=new Image();im.onload=()=>resolve([name,im]);im.onerror=reject;im.src=`/game/cyborg-v1/${name}.webp`;}))).then(entries=>new Map(entries)).catch(e=>{art=undefined;throw e;});}
export function CyborgSprite({action='idle',sequence=0,clock}:{action?:string;sequence?:number;clock:{time:number}}){
 const ref=useRef<HTMLCanvasElement>(null),state=useRef({action,sequence,changed:true});
 if(state.current.action!==action||state.current.sequence!==sequence)state.current={action,sequence,changed:true};
 useEffect(()=>{
  const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  let disposed=false,raf=0,started=clock.time;
  loadArt().then(images=>{
   if(disposed)return;
   const draw=()=>{
    if(state.current.changed){started=clock.time;state.current.changed=false;}
    const t=Math.max(0,clock.time-started),pose=cyborgPose(state.current.action,t),image=images.get(pose)!;
    ctx.clearRect(0,0,c.width,c.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    const breathing=state.current.action==='idle'?Math.sin(t/440)*2:0;
    const h=c.height*CYBORG_HEIGHT[pose],w=image.width/image.height*h;
    const scale=Math.min(1,(c.width-40)/w);
    ctx.drawImage(image,(c.width-w*scale)/2,c.height-h*scale-15+breathing,w*scale,h*scale);
    c.dataset.ready='true';c.dataset.pose=pose;c.dataset.elapsed=String(Math.round(t));
    raf=requestAnimationFrame(draw);
   };draw();
  }).catch(()=>{if(!disposed)c.dataset.error='true';});
  return()=>{disposed=true;cancelAnimationFrame(raf);};
 },[clock]);
 return <canvas ref={ref} width={1800} height={1536} className="cyborg-canvas" aria-hidden="true"/>;
}
