"use client";
import {useEffect,useRef} from 'react';
export type BeauvoirContact={id:number;side:'player'|'enemy';move:string;origin:number;position:number;at:number;final:boolean};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:BeauvoirContact|null;clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** VFX use the same combat clock and committed contact events as damage/HUD. */
export function BeauvoirEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
 const tracks={player:{action:'',seq:-1,start:0},enemy:{action:'',seq:-1,start:0}};
 const page=(x:number,y:number,angle:number,size:number,alpha=1)=>{c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.fillStyle='#fff3cd';c.strokeStyle='#dcb75e';c.lineWidth=1;c.fillRect(-size*.35,-size*.5,size*.7,size);c.strokeRect(-size*.35,-size*.5,size*.7,size);c.strokeStyle='#a76971';for(let i=0;i<4;i++){c.beginPath();c.moveTo(-size*.24,-size*.3+i*size*.16);c.lineTo(size*.22,-size*.3+i*size*.16);c.stroke();}c.restore();};
 const banner=(text:string,w:number,h:number,alpha:number)=>{c.save();c.globalAlpha=alpha;c.font=`bold ${Math.min(32,w*.038)}px Georgia`;c.textAlign='center';c.fillStyle='#fff0c8';c.shadowColor='#c48636';c.shadowBlur=18;c.fillText(text,w*.5,h*.18);c.restore();};
 const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(4,Math.max(2,window.devicePixelRatio||1));
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.lineCap='round';
  for(const side of ['player','enemy'] as const){if(!p[side])continue;
   const action=side==='player'?p.playerAction:p.enemyAction,seq=side==='player'?p.playerSequence:p.enemySequence,tr=tracks[side];
   if(action!==tr.action||seq!==tr.seq){tr.action=action;tr.seq=seq;tr.start=now;}
   const t=Math.max(0,now-tr.start),f=side==='player'?1:-1,origin=(side==='player'?p.playerPosition:p.enemyPosition)*w/100,target=(side==='player'?p.enemyPosition:p.playerPosition)*w/100,y=h*.60;
   if(action==='guard'||action==='guard-hit'){
    c.save();c.translate(origin+f*50,y);c.scale(f,1);c.shadowColor='#91e6ef';c.shadowBlur=12;c.fillStyle='rgba(111,33,69,.17)';c.beginPath();c.ellipse(0,0,45,h*.20,0,-1.5,1.5);c.closePath();c.fill();
    for(let i=0;i<3;i++){c.beginPath();c.ellipse(i*8,0,44,h*(.18+i*.014),0,-1.4,1.4);c.strokeStyle=i%2?'#ab4a6b':'#a2edf0';c.lineWidth=action==='guard-hit'?3:1.5;c.stroke();}
    c.scale(f,1);c.textAlign='center';c.font='bold 12px Georgia';c.fillStyle='#dffaff';c.fillText('DEFESA',0,0);c.restore();
   }
   if(action==='attack-kick'){
    const q=clamp(t/310),fade=1-clamp((t-310)/310);c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=fade;c.shadowColor='#e8bc5d';c.shadowBlur=12;
    for(let i=0;i<2;i++){c.beginPath();c.moveTo(24,38+i*6);c.quadraticCurveTo(80,-90-i*6,24+155*q,-65-i*6);c.strokeStyle=i?'#e9bd64':'#9e3b65';c.lineWidth=i?3:7;c.stroke();}c.restore();
   }
   if(action==='attack-combo'){
    c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=1-clamp((t-720)/220);
    for(let i=0;i<2;i++){c.strokeStyle=i?'#54233e':'#ffefbf';c.shadowColor=i?'#b34c7a':'#fff0ba';c.shadowBlur=15;c.lineWidth=5;c.beginPath();c.moveTo(20,(-1+i*2)*15);c.bezierCurveTo(55,Math.sin(t/160+i)*55,95,-Math.sin(t/160+i)*48,145,(-1+i*2)*20);c.stroke();}c.restore();
   }
   if(action==='special-beauvoir-other'&&t<900){
    const appear=clamp(t/220),hh=h*.48,ww=Math.min(100,w*.10);c.save();c.globalAlpha=appear;c.translate(target,y);c.shadowColor='#b9ecfa';c.shadowBlur=18;c.fillStyle='rgba(176,212,225,.18)';c.strokeStyle='#f1dab2';c.lineWidth=5;c.fillRect(-ww/2,-hh/2,ww,hh);c.strokeRect(-ww/2,-hh/2,ww,hh);
    const crack=clamp((t-540)/360);c.strokeStyle='#effaff';c.lineWidth=1.5;for(let i=0;i<7;i++){const a=i*2.4;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*ww*.5*crack,Math.sin(a)*hh*.5*crack);c.stroke();}c.restore();
   }
   if(action==='special-becoming'){
    const fade=1-clamp((t-1500)/350);c.save();c.globalAlpha=fade;c.shadowColor='#d0a94d';c.shadowBlur=12;
    for(let i=0;i<2;i++){c.strokeStyle=i?'#e6bc61':'#b65073';c.lineWidth=i?3:6;c.beginPath();for(let j=0;j<=60;j++){const a=j/60*Math.PI*5+t*.006+i*Math.PI,x=origin+Math.cos(a)*70,yy=h*.88-j/60*h*.62;if(j===0)c.moveTo(x,yy);else c.lineTo(x,yy);}c.stroke();}
    for(let i=0;i<16;i++){const age=(t+i*105)%1550,progress=age/1550,x=origin+f*progress*w*.8,yy=h*.80-progress*h*.66+Math.sin(age/180+i)*25;page(x,yy,t*.001+i,15+i%4*3,Math.sin(progress*Math.PI));}
    c.font='italic 12px Georgia';c.textAlign='center';c.fillStyle='#fff2ce';c.fillText('O SEGUNDO SEXO',origin,h*.29);c.restore();
   }
  }
  const hit=p.contact;if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,y=h*.60,origin=hit.origin*w/100;
   if(age>=0&&age<650){const q=age/650,fade=1-q;c.save();c.globalAlpha=fade;c.shadowColor='#f5dc9e';c.shadowBlur=12;
    if(hit.move==='especial'){
     for(let i=0;i<32;i++){const a=i*2.399,r=(30+i%8*17)*q;c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);c.rotate(a+q*3);c.fillStyle=i%2?'#d2edf3':'#efcf8a';c.beginPath();c.moveTo(-7,-11);c.lineTo(9,-4);c.lineTo(-2,14);c.closePath();c.fill();c.restore();}banner('O OUTRO!',w,h,fade);
    }else if(hit.move==='transcender'){
     const r=30+q*w*.9;c.strokeStyle='#ffe5a0';c.lineWidth=hit.final?7:3;c.beginPath();c.ellipse(origin,y,r,r*.44,0,0,Math.PI*2);c.stroke();c.fillStyle=`rgba(255,245,211,${fade*.10})`;c.fillRect(0,0,w,h);if(hit.final)banner('TORNAR-SE!',w,h,fade);
    }else{
     for(let i=0;i<10;i++){const a=i*2.399;page(x+Math.cos(a)*q*70,y+Math.sin(a)*q*55,a+q,10+i%3*3);}
     c.strokeStyle='#73243e';c.lineWidth=3;c.beginPath();c.moveTo(x-35*q,y+12);c.quadraticCurveTo(x,y-50*q,x+45*q,y-10);c.stroke();
    }c.restore();
   }
  }frame=requestAnimationFrame(draw);
 };draw();return()=>cancelAnimationFrame(frame);},[]);
 return <canvas className='beauvoir-effects-canvas' ref={ref} aria-hidden='true'/>;
}
