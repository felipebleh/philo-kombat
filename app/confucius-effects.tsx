"use client";
import {useEffect,useRef} from "react";
import {confuciusDensity} from "./confucius-motion";
const gold="#f6cf70",blue="#71d5ed",tau=Math.PI*2;
function ritual(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,angle:number){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.lineWidth=2.5;ctx.shadowBlur=16;
 for(const [ratio,color] of [[1,gold],[.82,blue],[.62,gold]] as const){ctx.strokeStyle=color;ctx.shadowColor=color;ctx.beginPath();ctx.arc(0,0,r*ratio,0,tau);ctx.stroke();}
 for(let i=0;i<8;i++){ctx.rotate(tau/8);ctx.beginPath();ctx.moveTo(r*.83,0);ctx.lineTo(r*.98,0);ctx.stroke();ctx.fillStyle=i%2?blue:gold;ctx.beginPath();ctx.arc(r*.72,0,r*.035,0,tau);ctx.fill();}ctx.restore();
}
export function ConfuciusEffects({origin,target,action,clock,jumpMs=650,sequence=0,impact=false}:{origin:number;target:number;action:string;clock:{time:number};jumpMs?:number;sequence?:number;impact?:boolean}){
 const ref=useRef<HTMLCanvasElement>(null),positions=useRef({origin,target,impact});positions.current={origin,target,impact};
 useEffect(()=>{const node=ref.current;if(!node)return;const ctx=node.getContext("2d");if(!ctx)return;const started=clock.time,reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;let frame=0;
  const draw=()=>{const b=node.getBoundingClientRect(),w=b.width,h=b.height,dpr=confuciusDensity(window.devicePixelRatio),bw=Math.max(1,Math.round(w*dpr)),bh=Math.max(1,Math.round(h*dpr));if(node.width!==bw||node.height!==bh){node.width=bw;node.height=bh;}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const t=Math.max(0,clock.time-started),{origin,target,impact}=positions.current,x=origin*w/100,tx=target*w/100,facing=target>=origin?1:-1,floor=h*(1-.028-.82*15/1536),hand=floor-h*.45;
   const air=action==="jump"?Math.max(0,Math.sin(Math.min(1,t/jumpMs)*Math.PI)):0;
   ctx.save();ctx.filter="blur(3px)";ctx.fillStyle=`rgba(0,0,0,${.56-air*.3})`;ctx.beginPath();ctx.ellipse(x,floor,w*.044*(1-air*.5),h*.012,0,0,tau);ctx.fill();ctx.restore();
   ctx.save();ctx.shadowColor=gold;ctx.shadowBlur=16;
   if(action==="attack-punch" && t<520){const p=Math.max(0,Math.min(1,(t-60)/160)),travel=Math.min(Math.max(0,Math.abs(tx-x)-w*.035),w*(.377-.035)),wave=x+facing*(w*.035+p*travel);ctx.globalAlpha=Math.min(1,t/60)*Math.max(0,1-Math.max(0,t-230)/240);ctx.strokeStyle=gold;ctx.lineCap="round";for(let i=0;i<3;i++){ctx.lineWidth=i===0?4:2;ctx.beginPath();ctx.ellipse(wave-facing*i*8,hand,w*.014+i*2,h*(.06+i*.016),0,facing>0?-Math.PI/2:Math.PI/2,facing>0?Math.PI/2:Math.PI*1.5);ctx.stroke();}}
   else if(action==="special-ren") {const p=Math.max(0,Math.min(1,(t-120)/490));ctx.globalAlpha=Math.min(1,t/100)*Math.max(0,(1100-t)/280);ctx.strokeStyle=gold;ctx.lineWidth=2;for(let i=0;i<5;i++){const q=Math.max(0,Math.min(1,p-i*.12)),gx=x+(tx-x)*q,gy=hand-Math.sin(q*Math.PI+i)*h*.06;ctx.font=`bold ${Math.max(18,h*.055)}px serif`;ctx.fillStyle=i%2?"#fff3bf":gold;ctx.fillText(["仁","和","義","禮","仁"][i],gx,gy);ctx.beginPath();ctx.arc(gx,gy,h*(.025+i*.006),-Math.PI*.6,Math.PI*.6);ctx.stroke();}}
   else if(action==="special-li"){ctx.globalAlpha=Math.min(1,t/180)*Math.max(0,(1450-t)/250);const angle=reduced?0:t*.001;ritual(ctx,x,hand,Math.min(w*.15,h*.24),angle);ritual(ctx,tx,hand,Math.min(w*.12,h*.19),-angle);if(impact){const flash=ctx.createRadialGradient(tx,hand,0,tx,hand,h*.3);flash.addColorStop(0,"#fffbe8dd");flash.addColorStop(.35,"#ffe07c88");flash.addColorStop(1,"#72d9ff00");ctx.fillStyle=flash;ctx.fillRect(tx-h*.3,hand-h*.3,h*.6,h*.6);}}
   ctx.restore();frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[action,clock,jumpMs,sequence]);return <canvas ref={ref} className="confucius-effects" aria-hidden="true"/>;
}
