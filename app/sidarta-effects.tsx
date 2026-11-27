"use client";
import {useEffect,useRef} from "react";
import {SIDARTA_TIMING,sidartaDensity,sidartaEffectPosition} from "./sidarta-motion";
const gold="#f5cd62";
function lotus(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,rotation=0){
 ctx.save();ctx.translate(x,y);ctx.rotate(rotation);
 for(let i=-2;i<=2;i++){ctx.save();ctx.rotate(i*.42);ctx.beginPath();ctx.moveTo(0,size*.4);ctx.bezierCurveTo(-size*.6,-size*.15,-size*.18,-size*.72,0,-size);ctx.bezierCurveTo(size*.18,-size*.72,size*.6,-size*.15,0,size*.4);ctx.fillStyle=i%2?"#ffedb9":gold;ctx.fill();ctx.restore();}ctx.restore();
}
function wheel(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,angle:number){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 const metal=ctx.createLinearGradient(-r,-r,r,r);for(const [p,c]of [[0,"#fff4be"],[.35,"#f4cf61"],[.55,"#a56b16"],[.8,"#ffe8a0"],[1,"#d39a32"]] as const)metal.addColorStop(p,c);
 ctx.strokeStyle=metal;ctx.shadowColor=gold;ctx.shadowBlur=18;
 for(const ratio of [.96,.83]){ctx.lineWidth=r*.055;ctx.beginPath();ctx.arc(0,0,r*ratio,0,Math.PI*2);ctx.stroke();}
 // Eight separate spokes: no font glyph or low-resolution wheel texture.
 for(let i=0;i<8;i++){ctx.save();ctx.rotate(i*Math.PI/4);ctx.lineCap="round";ctx.lineWidth=r*.06;ctx.beginPath();ctx.moveTo(r*.18,0);ctx.lineTo(r*1.07,0);ctx.stroke();ctx.lineWidth=r*.025;ctx.strokeStyle="#fff2bf";ctx.beginPath();ctx.moveTo(r*.23,-r*.025);ctx.lineTo(r*.78,-r*.025);ctx.stroke();ctx.fillStyle=gold;ctx.beginPath();ctx.arc(r*1.08,0,r*.065,0,Math.PI*2);ctx.fill();ctx.restore();}
 ctx.fillStyle=metal;ctx.lineWidth=r*.035;ctx.beginPath();ctx.arc(0,0,r*.21,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle="#fff5d5";ctx.beginPath();ctx.arc(0,0,r*.075,0,Math.PI*2);ctx.fill();ctx.restore();
}
export function SidartaEffects({origin,target,action,clock,jumpMs=650,sequence=0}:{origin:number;target:number;action:string;clock:{time:number};jumpMs?:number;sequence?:number}){
 const ref=useRef<HTMLCanvasElement>(null),positions=useRef({origin,target});positions.current={origin,target};
 useEffect(()=>{
  const node=ref.current;if(!node)return;const ctx=node.getContext("2d");if(!ctx)return;const started=clock.time,reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let frame=0;
  const draw=()=>{
   const b=node.getBoundingClientRect(),w=b.width,h=b.height,dpr=sidartaDensity(window.devicePixelRatio),bw=Math.max(1,Math.round(w*dpr)),bh=Math.max(1,Math.round(h*dpr));
   if(node.width!==bw||node.height!==bh){node.width=bw;node.height=bh;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const t=Math.max(0,clock.time-started),{origin,target}=positions.current,x=origin*w/100,tx=target*w/100,facing=target>=origin?1:-1,floor=h*(1-.028-.82*15/1536),hand=floor-h*.45;
   const air=action==="jump"?Math.max(0,Math.sin(Math.min(1,t/jumpMs)*Math.PI)):0;
   ctx.save();ctx.filter="blur(3px)";ctx.fillStyle=`rgba(0,0,0,${.56-air*.3})`;ctx.beginPath();ctx.ellipse(x,floor,w*.044*(1-air*.5),h*.012,0,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.save();ctx.shadowColor=gold;ctx.shadowBlur=16;
   if(action==="attack-punch"&&t<SIDARTA_TIMING.dialetica.duration){
    const p=Math.max(0,Math.min(1,(t-90)/(SIDARTA_TIMING.dialetica.impact-90))),wave=sidartaEffectPosition(origin+facing*4,target,p,28*1.3-4)*w/100;
    ctx.globalAlpha=Math.min(1,t/70)*Math.max(0,1-Math.max(0,t-230)/290);ctx.strokeStyle=gold;ctx.lineCap="round";
    for(let i=0;i<3;i++){ctx.lineWidth=i===0?5:2;ctx.beginPath();const start=facing>0?-Math.PI/2:Math.PI/2,end=facing>0?Math.PI/2:Math.PI*1.5;ctx.ellipse(wave-facing*i*8,hand,w*.014+i*2,h*(.09+i*.025),0,start,end);ctx.stroke();}
   }else if(action==="special-awakening"){
    const p=Math.min(1,t/SIDARTA_TIMING.especial.impact),r=h*(.08+p*.3);ctx.globalAlpha=Math.min(1,t/150)*Math.max(0,(SIDARTA_TIMING.especial.duration-t)/300);
    const glow=ctx.createRadialGradient(x,hand,2,x,hand,r);glow.addColorStop(0,"#fff7cf99");glow.addColorStop(.35,"#edbb4055");glow.addColorStop(1,"#edbb4000");ctx.fillStyle=glow;ctx.fillRect(x-r,hand-r,r*2,r*2);lotus(ctx,x,floor-h*.12,h*.07);ctx.strokeStyle=gold;ctx.lineWidth=3;
    for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(x,hand,r*(.5+i*.2),0,Math.PI*2);ctx.stroke();}if(t>=SIDARTA_TIMING.especial.impact)lotus(ctx,tx,hand,h*.1);
   }else if(action==="special-dharma"){
    const impact=SIDARTA_TIMING.transcender.impact,duration=SIDARTA_TIMING.transcender.duration,p=Math.max(0,Math.min(1,(t-180)/(impact-180))),wx=sidartaEffectPosition(origin,target,p)*w/100;
    ctx.globalAlpha=Math.min(1,t/160)*Math.max(0,(duration-t)/300);wheel(ctx,wx,hand,Math.min(h*.20,w*.12),reduced?0:facing*t*.006);
    for(let i=0;i<12;i++){const age=(t+i*103)%850/850,px=wx-facing*age*w*.18,py=hand+Math.sin(i*2.4+t*.003)*h*.16;ctx.save();ctx.globalAlpha*=(1-age)*.8;lotus(ctx,px,py,h*(.012+(i%3)*.004),i*.7);ctx.restore();}
    if(t>=impact){const age=(t-impact)/(duration-impact);ctx.globalAlpha*=1-age;ctx.strokeStyle="#fff2af";ctx.lineWidth=5;ctx.beginPath();ctx.arc(tx,hand,12+age*h*.32,0,Math.PI*2);ctx.stroke();}
   }
   ctx.restore();frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[action,clock,jumpMs,sequence]);
 return <canvas ref={ref} className="sidarta-effects" aria-hidden="true"/>;
}
