"use client";
import {useEffect,useRef} from 'react';
export type FreireContact={id:number;side:'player'|'enemy';move:string;origin:number;position:number;at:number;final:boolean};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:FreireContact|null;clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const WORDS=['TERRA','TRABALHO','DIÁLOGO','LIBERDADE'];
/** Cinematics share the simulation clock; only committed contacts emit impact VFX. */
export function FreireEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
 const tracks={player:{action:'',seq:-1,start:0},enemy:{action:'',seq:-1,start:0}};
 const banner=(text:string,w:number,h:number,alpha:number)=>{c.save();c.globalAlpha=alpha;c.font=`bold ${Math.min(30,w*.032)}px Georgia`;c.textAlign='center';c.fillStyle='#fff0c0';c.shadowColor='#d3a343';c.shadowBlur=18;c.fillText(text,w*.5,h*.16);c.restore();};
 const coin=(x:number,y:number,r:number,angle:number)=>{c.save();c.translate(x,y);c.scale(Math.max(.16,Math.abs(Math.cos(angle))),1);const g=c.createLinearGradient(-r,0,r,0);g.addColorStop(0,'#7e5420');g.addColorStop(.4,'#fff2ac');g.addColorStop(.7,'#dcae48');g.addColorStop(1,'#96601b');c.fillStyle=g;c.strokeStyle='#fff1ad';c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,r,r,0,0,Math.PI*2);c.fill();c.stroke();c.font=`bold ${r}px Georgia`;c.textAlign='center';c.fillStyle='#8a5a20';c.fillText('$',0,r*.34);c.restore();};
 const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(4,Math.max(2,window.devicePixelRatio||1));
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.lineCap='round';
  for(const side of ['player','enemy'] as const){if(!p[side])continue;
   const action=side==='player'?p.playerAction:p.enemyAction,seq=side==='player'?p.playerSequence:p.enemySequence,tr=tracks[side];
   if(action!==tr.action||seq!==tr.seq){tr.action=action;tr.seq=seq;tr.start=now;}
   const t=Math.max(0,now-tr.start),f=side==='player'?1:-1,origin=(side==='player'?p.playerPosition:p.enemyPosition)*w/100,target=(side==='player'?p.enemyPosition:p.playerPosition)*w/100,y=h*.61;
   if(action==='guard'||action==='guard-hit'){
    c.save();c.translate(origin+f*50,y);c.scale(f,1);c.shadowColor='#92e7ef';c.shadowBlur=12;c.fillStyle='rgba(78,158,183,.15)';c.beginPath();c.ellipse(0,0,47,h*.19,0,-1.4,1.4);c.closePath();c.fill();
    for(let i=0;i<3;i++){c.beginPath();c.ellipse(i*8,0,46,h*(.17+i*.014),0,-1.4,1.4);c.strokeStyle=i%2?'#f1cd75':'#a2edf0';c.lineWidth=action==='guard-hit'?3:1.5;c.stroke();}
    c.scale(f,1);c.textAlign='center';c.font='bold 12px Georgia';c.fillStyle='#fff3c7';c.fillText('DEFESA',0,0);c.restore();
   }
   if(action==='attack-punch'){
    const q=clamp(t/220),fade=1-clamp((t-220)/260);c.save();c.globalAlpha=fade;c.translate(origin,y-h*.1);c.scale(f,1);c.shadowColor='#ffe2a0';c.shadowBlur=14;c.strokeStyle='#ffe9b2';c.lineWidth=3;c.beginPath();c.moveTo(35,0);c.quadraticCurveTo(80,-10,50+105*q,-2);c.stroke();c.restore();
   }
   if(action==='attack-combo'){
    c.save();c.globalAlpha=1-clamp((t-720)/220);c.translate(origin,y);c.scale(f,1);c.strokeStyle='#f1c96e';c.lineWidth=2;c.shadowColor='#e6d496';c.shadowBlur=12;
    c.beginPath();c.moveTo(30,20);c.bezierCurveTo(70,-70,115,60,170,-30);c.stroke();
    for(let i=0;i<3;i++){c.save();c.translate(40+i*42,Math.sin(t/220+i)*25);c.scale(f,1);c.font='bold 10px Georgia';c.textAlign='center';c.fillStyle=i%2?'#b5e7ef':'#ffe9a8';c.fillText(['AÇÃO','REFLEXÃO','AÇÃO'][i],0,0);c.restore();}c.restore();
   }
   if(action==='special-banking-education'&&t<900){
    const drop=clamp((t-180)/720),yy=y-h*.7*(1-drop*drop),bw=Math.min(120,w*.12);c.save();c.translate(target,yy);c.rotate((1-drop)*-.06);c.shadowColor='rgba(0,0,0,.7)';c.shadowBlur=16;
    for(let i=0;i<3;i++){const bx=(i-1)*bw*.55,by=-i*35,g=c.createLinearGradient(bx,by-30,bx,by+20);g.addColorStop(0,'#a3a9ad');g.addColorStop(.5,'#747d83');g.addColorStop(1,'#343c44');c.fillStyle=g;c.strokeStyle='#bec3c8';c.lineWidth=2;c.fillRect(bx-bw*.45,by-35,bw*.9,55);c.strokeRect(bx-bw*.45,by-35,bw*.9,55);}
    c.fillStyle='#d7d9d7';c.textAlign='center';c.font='bold 11px Georgia';c.fillText('DEPÓSITO',0,3);c.restore();
    for(let i=0;i<14;i++){const q=clamp((t-i*26-50)/740);coin(target+Math.sin(i*2.4)*95,h*.1+q*q*h*.58,7+i%4*2,t*.009+i);}
   }
   if(action==='special-liberating-education'){
    const fade=1-clamp((t-1500)/350),cx=origin,cy=h*.39,rx=Math.min(122,w*.14),ry=h*.19;c.save();c.globalAlpha=fade;c.shadowColor='#f3c768';c.shadowBlur=14;
    c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);c.strokeStyle='rgba(255,216,124,.5)';c.lineWidth=2;c.stroke();
    for(let i=0;i<4;i++){const a=i*Math.PI/2+t*.002;c.font=`bold ${Math.min(17,w*.017)}px Georgia`;c.textAlign='center';c.fillStyle=i%2?'#d9f5ff':'#ffe7a2';c.fillText(WORDS[i],cx+Math.cos(a)*rx,cy+Math.sin(a)*ry);}
    // A gathering beam links the raised open book with each forthcoming wave.
    c.strokeStyle='rgba(255,231,161,.6)';c.lineWidth=3;c.beginPath();c.moveTo(origin,h*.26);c.quadraticCurveTo(origin+f*90,h*.33,origin+f*150,h*.57);c.stroke();c.restore();
   }
  }
  const hit=p.contact;if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,y=h*.61,origin=hit.origin*w/100,f=hit.side==='player'?1:-1;
   if(age>=0&&age<650){const q=age/650,fade=1-q;c.save();c.globalAlpha=fade;c.shadowColor='#f5dc9e';c.shadowBlur=12;
    if(hit.move==='especial'){
     // Grey deposits break outward on precisely the committed 32-point impact.
     for(let i=0;i<40;i++){const a=i*2.399,r=(30+i%8*17)*q;c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r+q*q*40);c.rotate(a+q*3);c.fillStyle=i%3?'#b9c1c5':'#e6c574';c.fillRect(-5,-5,8+i%4*3,8+i%3*3);c.restore();}
     c.strokeStyle='#ffdf8b';c.lineWidth=5;c.beginPath();c.moveTo(origin,y);c.lineTo(x,y);c.stroke();banner('EDUCAÇÃO BANCÁRIA!',w,h,fade);
    }else if(hit.move==='transcender'){
     const r=25+q*w*.9;c.strokeStyle='#ffe8a2';c.lineWidth=hit.final?7:3;c.beginPath();c.ellipse(origin,y,r,r*.43,0,0,Math.PI*2);c.stroke();
     for(let i=0;i<4;i++){c.font='bold 16px Georgia';c.textAlign='center';c.fillStyle=i%2?'#e6faff':'#ffe4a2';c.fillText(WORDS[i],origin+f*q*w*.8+(i-1.5)*40,y+Math.sin(q*6+i)*60);}
     c.fillStyle=`rgba(255,241,195,${fade*.10})`;c.fillRect(0,0,w,h);if(hit.final)banner('EDUCAÇÃO LIBERTADORA!',w,h,fade);
    }else{
     for(let i=0;i<13;i++){const a=i*2.399,r=(20+i%5*10)*q;c.fillStyle=i%2?'#fff0bd':'#bdeaf2';c.font=`bold ${12+i%3*3}px Georgia`;c.textAlign='center';c.fillText(hit.move==='caverna'?['A','B','TERRA','DIÁLOGO'][i%4]:'✧',x+Math.cos(a)*r,y+Math.sin(a)*r);}
    }c.restore();
   }
  }frame=requestAnimationFrame(draw);
 };draw();return()=>cancelAnimationFrame(frame);},[]);
 return <canvas className='freire-effects-canvas' ref={ref} aria-hidden='true'/>;
}
