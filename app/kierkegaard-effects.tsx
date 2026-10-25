"use client";
import {useEffect,useRef} from 'react';
import {KIERKEGAARD_COMBO_POSES} from './kierkegaard-combo-poses';
import {kierkegaardMotionPose,faithLeapPose,eitherSlashPose} from './kierkegaard-motion';
type Clock={time:number};
type Paint=(ctx:CanvasRenderingContext2D,w:number,h:number,t:number)=>void;
function useCanvas(paint:Paint,clock:Clock,started?:number){
 const ref=useRef<HTMLCanvasElement>(null),latest=useRef(paint);latest.current=paint;
 useEffect(()=>{
  const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  let raf=0,w=0,h=0,dpr=1;const start=started??clock.time;
  const resize=()=>{w=c.clientWidth;h=c.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));};
  resize();const observer=new ResizeObserver(resize);observer.observe(c);
  const draw=()=>{const t=Math.max(0,clock.time-start);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);latest.current(ctx,w,h,t);c.dataset.elapsed=String(Math.round(t));raf=requestAnimationFrame(draw);};draw();
  return()=>{cancelAnimationFrame(raf);observer.disconnect();};
 },[clock,started]);return ref;
}

export function paintEitherSlash(ctx:CanvasRenderingContext2D,w:number,h:number,t:number){
 const p=eitherSlashPose(t);if(!p.alpha)return;
 ctx.save();ctx.translate(w/1.8*.4,0);w/=1.8;ctx.globalAlpha=p.alpha;ctx.lineCap='round';
 // Both cuts are in sprite-local space, so P2 mirrors with the umbrella.
 const up=p.index===0;
 const pose=kierkegaardMotionPose('attack-combo',t).frame;
 const source=KIERKEGAARD_COMBO_POSES[pose as keyof typeof KIERKEGAARD_COMBO_POSES];
 if(!source){ctx.restore();return;}
 const x=w*source.tipX,y=h*source.tipY;
 const dx=w*.22,dy=h*(up?-.10:.10);
 const g=ctx.createLinearGradient(x-dx,y-dy,x,y);g.addColorStop(0,'#dfcb9700');g.addColorStop(.7,'#d7d1ad');g.addColorStop(1,'#fff7dd');
 ctx.strokeStyle='#625b80';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x-dx,y-dy);ctx.lineTo(x,y);ctx.stroke();
 ctx.strokeStyle=g;ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#fff9df';ctx.lineWidth=1;ctx.stroke();
 ctx.restore();
}
export function KierkegaardEitherCuts({clock}:{clock:Clock}){
 const ref=useCanvas(paintEitherSlash,clock);return <canvas ref={ref} className="kierkegaard-either-cuts" aria-hidden="true"/>;
}

export function paintFaithAbyss(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,origin:number,landing:number){
 const p=faithLeapPose(t,origin,landing);if(!p.opacity)return;
 ctx.save();ctx.globalAlpha=p.opacity;
 const left=(Math.min(origin,landing)-5)*w/100,right=(Math.max(origin,landing)+5)*w/100,ground=h*.97;
 const gradient=ctx.createLinearGradient(0,ground-h*.04,0,ground+h*.035);gradient.addColorStop(0,'#5d4c76');gradient.addColorStop(.35,'#0d0817');gradient.addColorStop(1,'#020206');
 ctx.fillStyle=gradient;ctx.strokeStyle='#8d7b9b';ctx.lineWidth=1;
 ctx.beginPath();ctx.moveTo(left,ground);
 for(let i=1;i<=18;i++){const x=left+(right-left)*i/18;ctx.lineTo(x,ground-h*(.01+Math.sin(i*3.7)**2*.025));}
 for(let i=18;i>=0;i--){const x=left+(right-left)*i/18;ctx.lineTo(x,ground+h*(.005+Math.sin(i*2.3)**2*.025));}ctx.closePath();ctx.fill();ctx.stroke();
 // Hairline fissures suggest an abyss without replacing the arena floor.
 ctx.strokeStyle='#24152f';ctx.lineWidth=2;
 for(let i=1;i<8;i++){const x=left+(right-left)*i/8;ctx.beginPath();ctx.moveTo(x,ground);ctx.lineTo(x+7,ground-h*.045);ctx.lineTo(x-5,ground-h*.065);ctx.stroke();}
 if(p.light>0){
  const x=p.position*w/100,beam=ctx.createLinearGradient(x-w*.07,0,x+w*.07,0);
  beam.addColorStop(0,'#ffdf9400');beam.addColorStop(.45,'#ffe3a066');beam.addColorStop(.5,'#fff4cfa8');beam.addColorStop(.55,'#ffe3a066');beam.addColorStop(1,'#ffdf9400');
  ctx.globalAlpha=p.light*.85;ctx.fillStyle=beam;ctx.fillRect(x-w*.09,0,w*.18,ground);
  for(let i=0;i<20;i++){const phase=(t*.0006+i*.17)%1;ctx.globalAlpha=p.light*(1-phase)*.8;ctx.fillStyle='#fff0b7';ctx.beginPath();ctx.arc(x+Math.sin(i*6.1)*w*.05,ground-phase*h*.9,1.1+Math.sin(i)**2,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
}
export function paintAnxiety(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,target:number){
 const opacity=Math.min(1,t/250)*Math.max(0,Math.min(1,(1550-t)/300));if(!opacity)return;
 const x=target*w/100,y=h*.57;
 ctx.save();ctx.globalAlpha=opacity;
 const aura=ctx.createRadialGradient(x,y,0,x,y,h*.38);aura.addColorStop(0,'#29213400');aura.addColorStop(.55,'#4d38673d');aura.addColorStop(1,'#20122500');ctx.fillStyle=aura;ctx.fillRect(x-h*.4,y-h*.4,h*.8,h*.8);
 ctx.translate(x,y);ctx.scale(1,.78);ctx.rotate(t*.003);
 for(let ring=0;ring<5;ring++){
  const radius=h*(.045+ring*.052),offset=t*.002+ring*.9;
  ctx.strokeStyle=ring%2?'#b0a5bb9c':'#89709fcb';ctx.lineWidth=ring%2?1.3:2.5;ctx.beginPath();
  for(let j=0;j<=90;j++){const a=j/90*Math.PI*3+offset,r=radius*(.55+j/180);const px=Math.cos(a)*r,py=Math.sin(a)*r;if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();
 }ctx.restore();
}
export function KierkegaardSpecial({kind,origin,landing,target,clock,started}:{kind:'faith'|'anxiety';origin:number;landing:number;target:number;clock:Clock;started?:number}){
 const ref=useCanvas((ctx,w,h,t)=>kind==='faith'?paintFaithAbyss(ctx,w,h,t,origin,landing):paintAnxiety(ctx,w,h,t,target),clock,started);
 return <canvas ref={ref} className={`kierkegaard-special-canvas kierkegaard-${kind}-canvas`} aria-hidden="true"/>;
}
export function KierkegaardImpact({kind,position,clock}:{kind:'faith'|'anxiety';position:number;clock:Clock}){
 const ref=useCanvas((ctx,w,h,t)=>{
  if(kind!=='faith')return;const p=Math.min(1,t/450),x=position*w/100,y=h*.97;
  ctx.save();ctx.globalAlpha=1-p;ctx.strokeStyle='#ffe9a8';ctx.lineWidth=4*(1-p)+1;
  for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(x,y,w*(.025+p*.19+i*.018),h*(.012+p*.07+i*.009),0,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<22;i++){const a=-Math.PI+i/21*Math.PI;ctx.fillStyle=i%2?'#fff7db':'#deb962';ctx.beginPath();ctx.arc(x+Math.cos(a)*p*w*.18,y+Math.sin(a)*p*h*.35+p*p*h*.14,2*(1-p)+.5,0,Math.PI*2);ctx.fill();}ctx.restore();
 },clock);
 return <div className={`kierkegaard-contact-effect ${kind}`} style={{'--kierkegaard-hit':`${position}%`} as React.CSSProperties} aria-hidden="true"><canvas ref={ref}/><b>{kind==='faith'?'SALTO DA FÉ!':'VERTIGEM DA LIBERDADE'}</b></div>;
}
