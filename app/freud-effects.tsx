"use client";
import {useEffect,useRef} from 'react';
import {freudCigarTip,freudSmokeParticle,freudDeathWavePose,freudShadowPose,softHitflashMatrix} from './freud-motion';
type Clock={time:number};
type Paint=(ctx:CanvasRenderingContext2D,w:number,h:number,t:number)=>void;
function useClockCanvas(paint:Paint,clock:Clock){
 const ref=useRef<HTMLCanvasElement>(null),latest=useRef(paint);latest.current=paint;
 useEffect(()=>{
  const c=ref.current,ctx=c?.getContext('2d');if(!c||!ctx)return;
  let frame=0,w=0,h=0,dpr=1;const start=clock.time;
  const resize=()=>{w=c.clientWidth;h=c.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);c.width=Math.max(1,Math.round(w*dpr));c.height=Math.max(1,Math.round(h*dpr));};
  resize();const observer=new ResizeObserver(resize);observer.observe(c);
  const draw=()=>{const t=Math.max(0,clock.time-start);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';latest.current(ctx,w,h,t);c.dataset.elapsed=String(Math.round(t));frame=requestAnimationFrame(draw);};draw();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[clock]);return ref;
}
export function FreudSoftHitflashFilter(){
 return <svg width="0" height="0" className="freud-flash-definitions" aria-hidden="true"><defs><filter id="philo-freud-soft-hitflash" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values={softHitflashMatrix()}/></filter></defs></svg>;
}
export function paintFreudSmoke(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,action:string){
 const tip=freudCigarTip(action);if(!tip)return;
 const body=h/1.4,top=h-body;
 ctx.save();ctx.lineCap='round';
 // Fine translucent curls, not a solid plume across his face.
 for(let i=0;i<11;i++){
  const p=freudSmokeParticle(i,t,action)!;
  ctx.globalAlpha=p.alpha;ctx.strokeStyle='#a2b2c9';ctx.lineWidth=Math.max(.6,w*p.radius*.36);
  const x=p.x*w,y=top+p.y*body;
  ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+w*.012,y-body*.014,x-w*.018,y-body*.026,x+w*.004,y-body*.04);ctx.stroke();
 }
 ctx.globalAlpha=.62+.18*Math.sin(t*.004);ctx.fillStyle='#d36a3f';ctx.beginPath();ctx.arc(tip.x*w,top+tip.y*body,Math.max(1,w*.003),0,Math.PI*2);ctx.fill();
 if(action==='attack-punch'&&t>90&&t<390){
  const fade=Math.sin((t-90)/300*Math.PI);
  for(let i=0;i<7;i++){
   const p=((t-90)/300+i*.123)%1;
   ctx.globalAlpha=fade*(1-p)*.48;ctx.fillStyle=i%2?'#b9c0cc':'#de9b60';
   ctx.beginPath();ctx.arc((tip.x-p*.13)*w,top+(tip.y-p*.04+Math.sin(i*4+t*.009)*.007)*body,Math.max(.6,w*.0025*(1-p)),0,Math.PI*2);ctx.fill();
  }
 }
 ctx.restore();
}
export function FreudCigarSmoke({action,clock}:{action:string;clock:Clock}){
 const ref=useClockCanvas((ctx,w,h,t)=>paintFreudSmoke(ctx,w,h,t,action),clock);
 return <canvas ref={ref} className="freud-cigar-smoke" aria-hidden="true"/>;
}
export function FreudGroundShadow({position,action,jumpMs=650,clock}:{position:number;action:string;jumpMs?:number;clock:Clock}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const node=ref.current;if(!node)return;let frame=0;const start=clock.time;
  const draw=()=>{const p=freudShadowPose(action,clock.time-start,jumpMs);node.style.scale=`${p.width} ${p.height}`;node.style.opacity=String(p.opacity);if(action==='jump')frame=requestAnimationFrame(draw);};draw();
  return()=>cancelAnimationFrame(frame);
 },[action,jumpMs,clock]);
 return <span ref={ref} className="freud-ground-shadow" style={{left:`${position}%`}} aria-hidden="true"/>;
}

function dreamIcon(ctx:CanvasRenderingContext2D,kind:number,size:number,t:number){
 ctx.lineWidth=Math.max(1,size*.04);ctx.strokeStyle='#cdc3e5';ctx.fillStyle='#9281b833';ctx.lineCap='round';
 if(kind===0){
  // A melting clock with an uneven outline and a clock face that slips downward.
  ctx.beginPath();ctx.moveTo(-size*.42,-size*.3);ctx.bezierCurveTo(size*.55,-size*.65,size*.58,size*.18,size*.12,size*.27);ctx.bezierCurveTo(size*.27,size*.75,-size*.28,size*.75,-size*.17,size*.25);ctx.bezierCurveTo(-size*.58,size*.1,-size*.6,-size*.1,-size*.42,-size*.3);ctx.fill();ctx.stroke();
  for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*size*.27,Math.sin(a)*size*.23-size*.1);ctx.lineTo(Math.cos(a)*size*.31,Math.sin(a)*size*.27-size*.1);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(0,-size*.1);ctx.lineTo(Math.cos(t*.002)*size*.20,-size*.1+Math.sin(t*.002)*size*.18);ctx.moveTo(0,-size*.1);ctx.lineTo(-size*.12,-size*.27);ctx.stroke();
 }else if(kind===1){
  ctx.strokeStyle='#d5c093';ctx.beginPath();ctx.arc(-size*.2,0,size*.19,0,Math.PI*2);ctx.moveTo(0,0);ctx.lineTo(size*.49,0);ctx.lineTo(size*.49,size*.14);ctx.moveTo(size*.32,0);ctx.lineTo(size*.32,size*.16);ctx.stroke();
 }else if(kind===2){
  // Side silhouette of the psychoanalytic couch, with back, rolled arm and legs.
  ctx.fillStyle='#a69ab98c';ctx.beginPath();ctx.moveTo(-size*.5,-size*.2);ctx.quadraticCurveTo(-size*.62,-size*.4,-size*.38,-size*.38);ctx.lineTo(-size*.14,-size*.07);ctx.lineTo(size*.38,-size*.07);ctx.quadraticCurveTo(size*.55,-size*.3,size*.57,-size*.03);ctx.lineTo(size*.47,size*.18);ctx.lineTo(-size*.4,size*.18);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-size*.35,size*.18);ctx.lineTo(-size*.39,size*.34);ctx.moveTo(size*.39,size*.18);ctx.lineTo(size*.43,size*.34);ctx.stroke();
 }else{
  ctx.beginPath();ctx.ellipse(0,0,size*.46,size*.23,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,size*.15,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();for(let i=0;i<60;i++){const a=i*.18,r=i/60*size*.09;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
 }
}
export function paintFreudDreams(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,target:number){
 const alpha=Math.min(1,t/250)*Math.max(0,Math.min(1,(1550-t)/350));if(!alpha)return;
 const x=target*w/100,y=h*.52,r=Math.min(w*.23,h*.40);
 ctx.save();
 for(let i=0;i<5;i++){
  const px=x+Math.sin(t*.0012+i*2.1)*r*.35,py=y+Math.cos(t*.001+i)*r*.18;
  const mist=ctx.createRadialGradient(px,py,r*.1,px,py,r);
  mist.addColorStop(0,i%2?'#7c63b84a':'#598fb948');mist.addColorStop(.6,'#505d9636');mist.addColorStop(1,'#2a284d00');
  ctx.globalAlpha=alpha*.5;ctx.fillStyle=mist;ctx.fillRect(px-r,py-r,r*2,r*2);
 }
 for(let i=0;i<7;i++){
  const a=i*Math.PI*2/7+t*.00023;
  ctx.save();ctx.globalAlpha=alpha*(.48+.12*Math.sin(t*.002+i));
  ctx.translate(x+Math.cos(a)*r*.84,y+Math.sin(a)*r*.63);ctx.rotate(Math.sin(t*.001+i)*.16);
  dreamIcon(ctx,i%4,Math.min(56,h*.12),t+i*200);ctx.restore();
 }
 ctx.restore();
}
export function FreudDreamMist({target,clock}:{target:number;clock:Clock}){
 const ref=useClockCanvas((ctx,w,h,t)=>paintFreudDreams(ctx,w,h,t,target),clock);
 return <div className="freud-dream-effect" aria-hidden="true"><canvas ref={ref}/><b>INTERPRETAÇÃO DOS SONHOS</b></div>;
}

export function paintFreudDeathWave(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,origin:number,target:number){
 const p=freudDeathWavePose(t,origin,target);if(!p.opacity)return;
 const from=origin*w/100,to=p.position*w/100,center=h*.51,amp=h*.075;
 ctx.save();ctx.globalAlpha=p.opacity;ctx.lineCap='round';
 const power=Math.min(1,t/240);
 const orb=ctx.createRadialGradient(to,center,0,to,center,h*.115*power+.01);orb.addColorStop(0,'#ef8ca66b');orb.addColorStop(.48,'#7542a450');orb.addColorStop(1,'#150e2400');ctx.fillStyle=orb;ctx.fillRect(to-h*.12,center-h*.12,h*.24,h*.24);
 // Continuous luminous ribbons, with a narrow core and a soft energy halo.
 for(let strand=0;strand<2;strand++){
  const color=strand?'#542178':'#ad2048';
  ctx.beginPath();
  for(let i=0;i<=120;i++){
   const u=i/120,angle=u*Math.abs(to-from)/Math.max(25,h*.17)*Math.PI*2-t*.008+strand*Math.PI;
   const x=from+(to-from)*u,y=center+Math.sin(angle)*amp;
   if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.globalAlpha=p.opacity*.85;ctx.shadowColor=color;ctx.shadowBlur=14;
  ctx.strokeStyle=color;ctx.lineWidth=h*.016;ctx.stroke();
  ctx.shadowBlur=0;ctx.globalAlpha=p.opacity*.72;
  ctx.strokeStyle=strand?'#b78ad7':'#f894a9';ctx.lineWidth=Math.max(1,h*.003);ctx.stroke();
 }
 ctx.globalAlpha=p.opacity*.8;ctx.fillStyle='#a484c2';
 for(let i=0;i<24;i++){const age=(t*.001+i*.113)%1,px=from+(to-from)*age,py=center+Math.sin(i*2.7+t*.003)*h*.12;ctx.beginPath();ctx.arc(px,py,(1-age)*2+.5,0,Math.PI*2);ctx.fill();}
 ctx.restore();
}
export function FreudDeathWave({origin,target,contact,clock}:{origin:number;target:number;contact?:number;clock:Clock}){
 const start=useRef(origin);
 const ref=useClockCanvas((ctx,w,h,t)=>paintFreudDeathWave(ctx,w,h,t,start.current,contact??target),clock);
 return <div className="freud-death-effect" aria-hidden="true"><canvas ref={ref}/><b>EROS &amp; THANATOS</b></div>;
}
export function FreudDeathImpact({position}:{position:number}){
 return <span className="freud-death-impact" style={{left:`${position}%`}} aria-hidden="true"/>;
}
