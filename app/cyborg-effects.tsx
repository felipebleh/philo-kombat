"use client";
import {useEffect,useRef} from 'react';
import {cyborgProjectilePose} from './cyborg-motion';
function drone(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,t:number,facing:number){
 ctx.save();ctx.translate(x,y);ctx.scale(facing,1);ctx.rotate(Math.sin(t*.01)*.035);
 ctx.strokeStyle='#8496a2';ctx.lineWidth=s*.055;ctx.fillStyle='#131c28';
 for(const dx of [-.48,.48])for(const dy of [-.19,.19]){
  ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(s*dx,s*dy);ctx.stroke();
  ctx.fillStyle='#34434f';ctx.beginPath();ctx.ellipse(s*dx,s*dy,s*.24,s*.07,Math.sin(t*.09+dx)*.15,0,Math.PI*2);ctx.fill();ctx.stroke();
 }
 const body=ctx.createLinearGradient(0,-s*.14,0,s*.14);body.addColorStop(0,'#8b9eab');body.addColorStop(.4,'#273641');body.addColorStop(1,'#111820');ctx.fillStyle=body;
 ctx.beginPath();ctx.moveTo(-s*.28,-s*.12);ctx.lineTo(s*.28,-s*.11);ctx.lineTo(s*.42,0);ctx.lineTo(s*.22,s*.15);ctx.lineTo(-s*.27,s*.12);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.shadowColor='#f74047';ctx.shadowBlur=8;ctx.fillStyle='#f4585f';ctx.beginPath();ctx.arc(s*.28,s*.02,s*.055,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function CyborgSpecial({kind,origin,target,clock,contact}:{kind:'certainty'|'swarm';origin:number;target:number;clock:{time:number};contact?:number}){
 const droneArt=useRef<HTMLImageElement|null>(null);
 useEffect(()=>{let active=true;const im=new Image();im.onload=()=>{if(active)droneArt.current=im;};im.src='/game/cyborg-drone-v1.webp';return()=>{active=false;};},[]);
 const ref=useRef<HTMLCanvasElement>(null),from=useRef(origin),latest=useRef({target,contact});latest.current={target,contact};
 useEffect(()=>{
  const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  let raf=0,w=0,h=0,dpr=2;const start=clock.time;
  const resize=()=>{w=c.clientWidth;h=c.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);};resize();const observer=new ResizeObserver(resize);observer.observe(c);
  const draw=()=>{
   const t=Math.max(0,clock.time-start),to=latest.current.contact??latest.current.target;
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   for(let i=0;i<(kind==='swarm'?3:1);i++){
    const p=cyborgProjectilePose(kind,t,from.current,to,i),x=p.x*w/100,y=p.y*h,s=Math.min(105,w*.10);
    if(p.visible){
     ctx.save();
     const tail=ctx.createLinearGradient(x-p.facing*s*1.8,y,x,y);tail.addColorStop(0,'#ef3c4500');tail.addColorStop(1,'#ef3c4560');ctx.strokeStyle=tail;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-p.facing*s*1.8,y);ctx.lineTo(x,y);ctx.stroke();
     if(kind==='certainty'){
      ctx.font=`900 ${Math.min(h*.31,w*.15)}px Georgia,serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.shadowColor='#f32641';ctx.shadowBlur=18;ctx.fillStyle='#ff7880';ctx.fillText('!',x,y);
     }else if(droneArt.current){
      ctx.save();ctx.translate(x,y);ctx.scale(p.facing,1);ctx.rotate(Math.sin(t*.009+i)*.035);
      const width=s*1.8,art=droneArt.current;ctx.drawImage(art,-width/2,-width*art.height/art.width/2,width,width*art.height/art.width);ctx.restore();
     }else drone(ctx,x,y,s,t+i*200,p.facing);
     ctx.restore();
    }
    if(p.exploding&&latest.current.contact!==undefined){
     const r=(.2+p.burst)*s*1.1,alpha=1-p.burst;
     ctx.save();ctx.globalAlpha=alpha;const glow=ctx.createRadialGradient(x,y,0,x,y,r);glow.addColorStop(0,'#ffe9ba');glow.addColorStop(.23,'#ff9a4f');glow.addColorStop(.58,'#cf294d80');glow.addColorStop(1,'#56152600');ctx.fillStyle=glow;ctx.fillRect(x-r,y-r,r*2,r*2);
     ctx.strokeStyle='#ffb476';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*.7,0,Math.PI*2);ctx.stroke();
     for(let j=0;j<14;j++){const a=j*Math.PI*2/14+i*.4;ctx.fillStyle=j%2?'#d8a9a3':'#ec773d';ctx.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,2.5,2.5);}ctx.restore();
    }
   }
   c.dataset.elapsed=String(Math.round(t));raf=requestAnimationFrame(draw);
  };draw();return()=>{cancelAnimationFrame(raf);observer.disconnect();};
 },[kind,clock]);
 return <div className={`cyborg-special cyborg-${kind}`} aria-hidden="true"><canvas ref={ref}/><b>{kind==='swarm'?'ENXAME DE CONTROLE':'CERTEZA ABSOLUTA!'}</b></div>;
}

export function CyborgAtmosphere(){
 return <div className="cyborg-atmosphere" aria-hidden="true"><span className="cyborg-floor-mist"/>{Array.from({length:14},(_,i)=><i key={i} style={{left:`${(i*31+7)%100}%`,top:`${(i*23+19)%86}%`,animationDelay:`${-i*.73}s`,animationDuration:`${7+i%5}s`}}/>)}</div>;
}
