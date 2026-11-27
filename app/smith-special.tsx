"use client";
import {useEffect,useRef} from "react";

/** Cinematic time uses the same clock as the actual damage and hitstop. */
export function SmithSpecial({kind,target,clock}:{kind:"hand"|"wealth";target:number;clock:{time:number}}) {
 const ref=useRef<HTMLCanvasElement>(null), targetRef=useRef(target);targetRef.current=target;
 useEffect(()=>{let raf=0,dead=false;const start=clock.time;
  const draw=()=>{const canvas=ref.current;if(!canvas||dead)return;const c=canvas.getContext("2d");if(!c)return;
   const box=canvas.getBoundingClientRect(),d=Math.max(1,Math.min(3,window.devicePixelRatio||1)),w=Math.max(1,Math.round(box.width*d)),h=Math.max(1,Math.round(box.height*d));
   if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}c.setTransform(d,0,0,d,0,0);const W=w/d,H=h/d,t=Math.max(0,clock.time-start),x=W*targetRef.current/100;c.clearRect(0,0,W,H);
   if(kind==="wealth"){
    const fade=Math.min(1,t/180)*Math.min(1,Math.max(0,(1850-t)/220));c.fillStyle=`rgba(0,0,0,${.37*fade})`;c.fillRect(0,0,W,H);
    for(let k=0;k<6;k++){const lx=W*(.08+k*.17);let grad=c.createLinearGradient(0,0,0,H*.8);grad.addColorStop(0,`rgba(255,231,145,${.25*fade})`);grad.addColorStop(1,"rgba(255,215,95,0)");c.fillStyle=grad;c.beginPath();c.moveTo(lx-16,0);c.lineTo(lx+16,0);c.lineTo(lx+68,H*.8);c.lineTo(lx-60,H*.8);c.fill();}
    for(let i=0;i<32;i++){const phase=((t+i*83)%1450)/1450, px=W*((i*0.61803398875)%1),radius=4+(i%5)*2.2,ground=H*.91;let y=-25+phase*(ground+25);if(phase>.89)y=ground-Math.abs(Math.sin((phase-.89)/.11*Math.PI))*12;const spin=.25+.75*Math.abs(Math.cos((t+i*130)/115));c.save();c.globalAlpha=fade;c.translate(px,y);c.scale(spin,1);c.shadowColor="#ffce57";c.shadowBlur=11;c.fillStyle="#e0a530";c.strokeStyle="#fff3b1";c.lineWidth=1.4;c.beginPath();c.arc(0,0,radius,0,Math.PI*2);c.fill();c.stroke();c.fillStyle="#fff0b4";c.fillRect(-radius*.18,-radius*.68,radius*.28,radius*1.36);c.restore();if(phase>.88){c.fillStyle=`rgba(255,231,135,${fade})`;c.fillRect(px-2,ground-3,4,4);}}
    for(const beat of [900,1080,1260,1480]){const dt=t-beat;if(dt>=0&&dt<150){c.save();c.globalAlpha=1-dt/150;c.strokeStyle="#fff1a2";c.shadowColor="#ffb928";c.shadowBlur=18;c.lineWidth=3;for(let j=0;j<8;j++){let a=j*Math.PI/4;c.beginPath();c.moveTo(x+Math.cos(a)*15,H*.57+Math.sin(a)*15);c.lineTo(x+Math.cos(a)*(30+dt*.2),H*.57+Math.sin(a)*(30+dt*.2));c.stroke();}c.restore();}}
   }else{
    const appear=.45+.55*Math.min(1,t/220),close=Math.max(0,Math.min(1,(t-880)/300)),fade=Math.min(1,Math.max(0,(1450-t)/180));const p=Math.min(1,t/1000),hy=H*(.22+.30*p),hx=x+W*.06*(1-p),size=Math.min(W*.19,H*.38);c.save();c.globalAlpha=.85*appear*fade;c.translate(hx,hy);c.shadowColor="#e7d69d";c.shadowBlur=35;let g=c.createLinearGradient(-size/2,-size/2,size/2,size/2);g.addColorStop(0,"rgba(235,248,255,.95)");g.addColorStop(.45,"rgba(255,219,116,.90)");g.addColorStop(1,"rgba(130,202,224,.75)");c.fillStyle=g;c.strokeStyle="#fff4bc";c.lineWidth=2;c.beginPath();c.ellipse(0,size*.2,size*.34,size*.35,0,0,Math.PI*2);c.fill();c.stroke();for(let i=0;i<4;i++){c.save();c.translate((i-1.5)*size*.15,-size*.03);c.rotate((i-1.5)*.12*(1-close));let length=size*(.48+(.06-Math.abs(i-1.5)*.025))*(1-close*.42);c.beginPath();c.roundRect(-size*.075,-length,size*.14,length+size*.1,size*.07);c.fill();c.stroke();c.restore();}c.save();c.rotate(-.75+close*.42);c.beginPath();c.roundRect(-size*.46,-size*.05,size*.28,size*.15,size*.07);c.fill();c.stroke();c.restore();c.strokeStyle="rgba(255,233,155,.85)";c.lineWidth=3;c.beginPath();c.ellipse(0,0,size*(.55+close*.12),size*.37,t/240,0,Math.PI*2);c.stroke();c.restore();
   }raf=requestAnimationFrame(draw);
  };raf=requestAnimationFrame(draw);return()=>{dead=true;cancelAnimationFrame(raf)};
 },[kind,clock]);return <canvas ref={ref} className="smith-cinematic" aria-hidden="true"/>;
}
