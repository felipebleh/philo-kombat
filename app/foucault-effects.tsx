"use client";
import {useEffect,useRef} from 'react';
export type FoucaultContact={id:number;side:'player'|'enemy';move:string;origin:number;position:number;at:number;final:boolean};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:FoucaultContact|null;watched:{player:boolean;enemy:boolean};docile:{player:boolean;enemy:boolean};clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function FoucaultEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
 const tracks={player:{action:'',seq:-1,start:0},enemy:{action:'',seq:-1,start:0}};
 const text=(word:string,x:number,y:number,size:number,color='#e8fbff')=>{c.save();c.textAlign='center';c.font=`bold ${size}px Georgia`;c.lineWidth=3;c.strokeStyle='rgba(5,25,38,.95)';c.strokeText(word,x,y);c.fillStyle=color;c.fillText(word,x,y);c.restore();};
 const eye=(x:number,y:number,r:number)=>{c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x,y-r*.65,x+r,y);c.quadraticCurveTo(x,y+r*.65,x-r,y);c.stroke();c.beginPath();c.arc(x,y,r*.26,0,Math.PI*2);c.fill();};
 const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(4,Math.max(2,window.devicePixelRatio||1));
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.lineCap='round';
  for(const side of ['player','enemy'] as const){
   const x=(side==='player'?p.playerPosition:p.enemyPosition)*w/100;
   if(p.watched[side]){c.save();c.shadowColor='#b3f3ff';c.shadowBlur=12;c.strokeStyle='#c1f5ff';c.fillStyle='#c1f5ff';c.lineWidth=2;eye(x,h*.30,22);text('VIGIADO!',x,h*.35,13);c.restore();}
   if(p.docile[side])text('CORPO DÓCIL!',x,h*.36,13);
   if(!p[side])continue;
   const action=side==='player'?p.playerAction:p.enemyAction,seq=side==='player'?p.playerSequence:p.enemySequence,tr=tracks[side];
   if(action!==tr.action||seq!==tr.seq){tr.action=action;tr.seq=seq;tr.start=now;}
   const t=Math.max(0,now-tr.start),f=side==='player'?1:-1,origin=x,target=(side==='player'?p.enemyPosition:p.playerPosition)*w/100,y=h*.59;
   if(action==='guard'||action==='guard-hit'){
    c.save();c.translate(origin+f*55,y);c.scale(f,1);c.shadowColor='#8ad8e9';c.shadowBlur=12;c.strokeStyle='#c0f3ff';c.fillStyle='rgba(105,189,212,.17)';c.lineWidth=action==='guard-hit'?3:1.5;
    c.beginPath();c.moveTo(0,-h*.20);c.lineTo(48,-h*.12);c.lineTo(42,h*.13);c.lineTo(0,h*.23);c.lineTo(-17,h*.09);c.lineTo(-17,-h*.11);c.closePath();c.fill();c.stroke();
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(-10,-h*.10+i*h*.08);c.lineTo(42,-h*.10+i*h*.08);c.stroke();}c.scale(f,1);text('DEFESA',12,4,12);c.restore();
   }
   if(action==='attack-punch'||action==='attack-combo'){
    c.save();c.translate(origin,y-h*.06);c.scale(f,1);c.globalAlpha=1-clamp((t-(action==='attack-combo'?700:220))/270);c.shadowColor='#abebf3';c.shadowBlur=10;c.strokeStyle='#caefff';c.lineWidth=3;c.beginPath();c.moveTo(35,4);c.quadraticCurveTo(85,-18,145,-2);c.stroke();c.restore();
   }
   if(action==='special-panopticon'){
    const fade=1-clamp((t-1180)/270),lock=clamp(t/350);c.save();c.globalAlpha=fade;c.shadowColor='#d3f7ff';c.shadowBlur=14;
    const beam=c.createLinearGradient(w*.5,h*.1,target,y);beam.addColorStop(0,'rgba(248,255,255,.85)');beam.addColorStop(1,'rgba(149,232,255,.05)');c.fillStyle=beam;c.beginPath();c.moveTo(w*.5,h*.1);c.lineTo(target-65*lock,h*.91);c.lineTo(target+65*lock,h*.91);c.closePath();c.fill();
    c.translate(target,y);c.rotate((1-lock)*1.2);c.strokeStyle='#c6f5ff';c.fillStyle='#e3fbff';c.lineWidth=2;
    for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.beginPath();c.moveTo(35,-49);c.lineTo(49,-49);c.lineTo(49,-35);c.stroke();c.restore();}
    eye(0,0,35);c.beginPath();c.arc(0,0,60+Math.sin(t/110)*3,0,Math.PI*2);c.stroke();c.restore();
   }
   if(action==='special-biopower'&&t<1060){
    const fade=clamp(t/260),top=h*.27,bottom=h*.89,left=target-58,right=target+58;c.save();c.globalAlpha=fade;c.shadowColor='#9fe1ff';c.shadowBlur=9;c.strokeStyle='#a6e9fd';c.lineWidth=1.4;
    for(let i=0;i<=6;i++){const xx=left+i*(right-left)/6;c.beginPath();c.moveTo(xx,top);c.lineTo(xx,bottom);c.stroke();}
    for(let i=0;i<=9;i++){const yy=top+i*(bottom-top)/9;c.beginPath();c.moveTo(left,yy);c.lineTo(right,yy);c.stroke();}
    const scan=top+(t%500)/500*(bottom-top);c.fillStyle='rgba(196,242,255,.17)';c.fillRect(left,scan-8,right-left,16);
    c.strokeStyle='#e8fcff';c.lineWidth=2;c.beginPath();c.moveTo(left-14,top);c.lineTo(left-14,bottom);c.moveTo(left-20,top);c.lineTo(left-8,top);c.moveTo(left-20,bottom);c.lineTo(left-8,bottom);c.stroke();
    c.beginPath();for(let i=0;i<50;i++){const xx=right+12+i*1.4,spike=i%16===8?-24:i%16===9?16:Math.sin(i+t/90)*3,yy=y+spike;if(!i)c.moveTo(xx,yy);else c.lineTo(xx,yy);}c.stroke();
    for(let i=0;i<3;i++){c.beginPath();c.ellipse(target,top+(i+1)*(bottom-top)/4,67,13,0,0,Math.PI*2);c.stroke();}c.restore();
   }
  }
  const hit=p.contact;if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,y=h*.59;
   if(age>=0&&age<650){const q=age/650,fade=1-q;c.save();c.globalAlpha=fade;c.shadowColor='#c1f7ff';c.shadowBlur=14;
    if(hit.move==='transcender'){
     const r=20+q*w*.65,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(244,255,255,${fade*.7})`);g.addColorStop(.3,`rgba(125,222,255,${fade*.3})`);g.addColorStop(1,'rgba(194,244,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='#e4fcff';c.lineWidth=6;c.beginPath();c.ellipse(x,y,r,r*.65,0,0,Math.PI*2);c.stroke();text('BIOPODER!',w*.5,h*.16,Math.min(32,w*.04));
    }else if(hit.move==='especial'){
     c.strokeStyle='#f0fdff';c.lineWidth=5;c.beginPath();c.arc(x,y,20+q*130,0,Math.PI*2);c.stroke();text('PANÓPTICO!',w*.5,h*.16,Math.min(30,w*.035));
    }
    for(let i=0;i<26;i++){const a=i*2.399,r=(20+i%6*17)*q;c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);c.rotate(a+q);c.fillStyle=i%2?'#d9f5ff':'#91bfce';c.fillRect(-2,-2,hit.move==='transcender'?12:4,3);c.restore();}c.restore();
   }
  }frame=requestAnimationFrame(draw);
 };draw();return()=>cancelAnimationFrame(frame);},[]);
 return <canvas className='foucault-effects-canvas' ref={ref} aria-hidden='true'/>;
}
