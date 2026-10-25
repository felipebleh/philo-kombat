"use client";
import {useEffect,useRef} from 'react';
import {caneTrailPose,sufferingPendulumPose,SCHOPENHAUER_FLASH_ALPHA} from './schopenhauer-motion';

type Clock={time:number};
type CanvasPaint=(ctx:CanvasRenderingContext2D,w:number,h:number,t:number)=>void;
function useEffectCanvas(paint:CanvasPaint,clock?:Clock,paused=false){
 const ref=useRef<HTMLCanvasElement>(null),paintRef=useRef(paint),pausedRef=useRef(paused);
 paintRef.current=paint;pausedRef.current=paused;
 useEffect(()=>{
  const canvas=ref.current,ctx=canvas?.getContext('2d');if(!canvas||!ctx)return;
  let frame=0,previous=0,t=0,w=0,h=0,dpr=1;const started=clock?.time??0;
  const resize=()=>{w=canvas.clientWidth;h=canvas.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));};
  resize();const observer=new ResizeObserver(resize);observer.observe(canvas);
  const draw=(now:number)=>{
   if(clock)t=Math.max(0,clock.time-started);else if(previous&&!pausedRef.current)t+=now-previous;previous=now;
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
   paintRef.current(ctx,w,h,t);canvas.dataset.elapsed=String(Math.round(t));
   frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();};
 },[clock]);
 return ref;
}

export function paintCaneTrail(ctx:CanvasRenderingContext2D,w:number,h:number,action:string,t:number){
 const pose=caneTrailPose(action,t);if(!pose)return;
 ctx.save();ctx.translate(w*pose.x,h*pose.y);ctx.scale(w,h);
 ctx.lineCap='round';
 // A fading fan follows the cane tip. It never washes over the face or torso.
 for(let i=12;i>=0;i--){
  const angle=pose.angle-pose.tail*i/12;
  ctx.globalAlpha=pose.alpha*(1-i/14)*.52;
  ctx.strokeStyle=i<3?'#d9e0df':'#606971';ctx.lineWidth=i<3?.005:.013;
  ctx.beginPath();ctx.arc(0,0,pose.radius,angle-.12,angle);ctx.stroke();
 }
 ctx.globalAlpha=pose.alpha;ctx.strokeStyle='#1c242c';ctx.lineWidth=.008;
 ctx.beginPath();ctx.arc(0,0,pose.radius,pose.angle-.18,pose.angle);ctx.stroke();
 ctx.strokeStyle='#e7ecea';ctx.lineWidth=.002;
 ctx.beginPath();ctx.arc(0,0,pose.radius+.005,pose.angle-.32,pose.angle);ctx.stroke();
 ctx.restore();
}
export function SchopenhauerCaneTrail({action,clock,paused=false}:{action:string;clock?:Clock;paused?:boolean}){
 const ref=useEffectCanvas((ctx,w,h,t)=>paintCaneTrail(ctx,w,h,action,t),clock,paused);
 return <canvas ref={ref} className="schopenhauer-cane-trail" aria-hidden="true"/>;
}
export function SchopenhauerSoftFlash(){
 return <span className="schopenhauer-soft-flash" style={{opacity:SCHOPENHAUER_FLASH_ALPHA}} aria-hidden="true"/>;
}

export function paintSufferingPendulum(ctx:CanvasRenderingContext2D,w:number,h:number,t:number,target:number){
 const p=sufferingPendulumPose(t,target,w,h);if(!p.opacity)return;
 ctx.save();ctx.globalAlpha=p.opacity;
 // Fine curved engraving around the fixed clock mount.
 ctx.translate(p.pivotX,p.pivotY);
 const metal=ctx.createLinearGradient(-h*.1,0,h*.1,0);
 metal.addColorStop(0,'#302418');metal.addColorStop(.32,'#a27d43');metal.addColorStop(.48,'#edcf86');metal.addColorStop(.7,'#806035');metal.addColorStop(1,'#2a2118');
 ctx.fillStyle=metal;ctx.strokeStyle='#dfc38a';ctx.lineWidth=1.5;
 ctx.beginPath();ctx.ellipse(0,0,h*.09,h*.035,0,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.ellipse(0,0,h*.065,h*.021,0,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<16;i++){const a=i*Math.PI/8;ctx.beginPath();ctx.moveTo(Math.cos(a)*h*.074,Math.sin(a)*h*.025);ctx.lineTo(Math.cos(a)*h*.085,Math.sin(a)*h*.031);ctx.stroke();}
 ctx.rotate(-p.angle);
 const arm=ctx.createLinearGradient(-5,0,5,0);arm.addColorStop(0,'#302218');arm.addColorStop(.5,'#d1b172');arm.addColorStop(1,'#71512c');
 ctx.fillStyle=arm;ctx.fillRect(-3,0,6,p.length);
 // Paired chain rings and a central rod suggest an antique clock mechanism.
 ctx.strokeStyle='#998163';ctx.lineWidth=1;
 for(let y=12;y<p.length-24;y+=12){ctx.beginPath();ctx.ellipse(0,y,4,7,0,0,Math.PI*2);ctx.stroke();}
 ctx.translate(0,p.length);
 const b=Math.min(h*.19,w*.14);
 ctx.fillStyle=metal;ctx.strokeStyle='#d1ad69';ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(0,-b*.12,b*.32,0,Math.PI*2);ctx.fill();ctx.stroke();
 ctx.beginPath();ctx.arc(0,-b*.12,b*.24,0,Math.PI*2);ctx.stroke();
 for(let i=0;i<24;i++){const a=i*Math.PI/12;ctx.beginPath();ctx.moveTo(Math.cos(a)*b*.26,-b*.12+Math.sin(a)*b*.26);ctx.lineTo(Math.cos(a)*b*.31,-b*.12+Math.sin(a)*b*.31);ctx.stroke();}
 // Curved guillotine blade: a dark bronze crescent with a silver cutting edge.
 const blade=ctx.createLinearGradient(0,-b*.1,0,b*.55);blade.addColorStop(0,'#b69a62');blade.addColorStop(.4,'#65503a');blade.addColorStop(.85,'#a4a8a2');blade.addColorStop(1,'#e9e2cf');
 ctx.fillStyle=blade;ctx.strokeStyle='#31271f';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-b,-b*.08);ctx.bezierCurveTo(-b*.66,b*.7,b*.66,b*.7,b,-b*.08);ctx.bezierCurveTo(b*.38,b*.15,-b*.38,b*.15,-b,-b*.08);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.strokeStyle='#dad3bc';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-b*.97,0);ctx.bezierCurveTo(-b*.62,b*.65,b*.62,b*.65,b*.97,0);ctx.stroke();
 // Engraved hatch marks remain inside the crescent rather than a flat glow.
 ctx.strokeStyle='#32281e';ctx.globalAlpha=p.opacity*.6;ctx.lineWidth=1;
 for(let i=-7;i<=7;i++){const x=i*b*.1,y=b*(.13+.22*(1-(x/b)**2));ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y+9);ctx.stroke();}
 ctx.restore();
}
export function SchopenhauerPendulum({target,contact,clock,paused=false}:{target:number;contact?:number;clock?:Clock;paused?:boolean}){
 const targetRef=useRef(target);targetRef.current=contact??target;
 const ref=useEffectCanvas((ctx,w,h,t)=>paintSufferingPendulum(ctx,w,h,t,targetRef.current),clock,paused);
 return <div className="schopenhauer-pendulum-effect" aria-hidden="true">
  <canvas ref={ref}/><span className="schopenhauer-desire">DESEJO / DOR</span><span className="schopenhauer-boredom">TÉDIO</span><b>PÊNDULO DO SOFRIMENTO</b>
 </div>;
}
