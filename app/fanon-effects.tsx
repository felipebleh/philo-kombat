"use client";
import {useEffect,useRef} from 'react';
export type FanonContact={id:number;side:'player'|'enemy';move:string;origin:number;position:number;at:number;final:boolean};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:FanonContact|null;clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function FanonEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
 const tracks={player:{action:'',seq:-1,start:0},enemy:{action:'',seq:-1,start:0}};
 const banner=(text:string,w:number,h:number,alpha:number)=>{c.save();c.globalAlpha=alpha;c.font=`bold ${Math.min(30,w*.027)}px Georgia`;c.textAlign='center';c.fillStyle='#fff0c0';c.shadowColor='#d38435';c.shadowBlur=18;c.fillText(text,w*.5,h*.16);c.restore();};
 const mask=(x:number,y:number,size:number,alpha:number)=>{c.save();c.translate(x,y);c.globalAlpha=alpha;c.shadowColor='#fff0c8';c.shadowBlur=18;const g=c.createLinearGradient(-size,0,size,0);g.addColorStop(0,'#979b8c');g.addColorStop(.5,'#fffbed');g.addColorStop(1,'#c5c1b1');c.fillStyle=g;c.beginPath();c.moveTo(-size*.7,-size*.8);c.bezierCurveTo(-size,-size*1.7,size,-size*1.7,size*.7,-size*.8);c.bezierCurveTo(size*.8,size*.4,size*.25,size*.9,0,size);c.bezierCurveTo(-size*.25,size*.9,-size*.8,size*.4,-size*.7,-size*.8);c.fill();c.fillStyle='#252925';for(const f of [-1,1]){c.beginPath();c.ellipse(f*size*.3,-size*.32,size*.2,size*.1,f*.2,0,Math.PI*2);c.fill();}c.beginPath();c.ellipse(0,size*.48,size*.22,size*.06,0,0,Math.PI*2);c.fill();c.strokeStyle='#837666';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-size);c.lineTo(-size*.15,-size*.55);c.lineTo(size*.15,0);c.lineTo(-size*.08,size*.48);c.stroke();c.restore();};
 const chain=(x:number,y:number,broken:number)=>{c.save();c.translate(x,y);c.strokeStyle='#d8b477';c.lineWidth=3;c.shadowColor='#d59045';c.shadowBlur=7;for(let i=0;i<6;i++){const f=i<3?-1:1;c.save();c.translate(f*broken*(15+(i%3)*7),-i*13-broken*12);c.rotate((i%2?.55:-.55)+f*broken*.8);c.beginPath();c.ellipse(0,0,8,12,0,0,Math.PI*2);c.stroke();c.restore();}c.restore();};
 const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(4,Math.max(2,window.devicePixelRatio||1));
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.lineCap='round';
  for(const side of ['player','enemy'] as const){if(!p[side])continue;
   const action=side==='player'?p.playerAction:p.enemyAction,seq=side==='player'?p.playerSequence:p.enemySequence,tr=tracks[side];
   if(action!==tr.action||seq!==tr.seq){tr.action=action;tr.seq=seq;tr.start=now;}
   const t=Math.max(0,now-tr.start),f=side==='player'?1:-1,origin=(side==='player'?p.playerPosition:p.enemyPosition)*w/100,y=h*.58;
   if(action==='guard'||action==='guard-hit'){
    c.save();c.translate(origin+f*58,y);c.scale(f,1);c.shadowColor='#9fdce7';c.shadowBlur=12;c.fillStyle='rgba(106,131,84,.18)';c.beginPath();c.ellipse(0,0,48,h*.22,0,-1.4,1.4);c.closePath();c.fill();
    for(let i=0;i<3;i++){c.beginPath();c.ellipse(i*8,0,46,h*(.20+i*.014),0,-1.4,1.4);c.strokeStyle=i%2?'#efd18a':'#b1e6ed';c.lineWidth=action==='guard-hit'?3:1.5;c.stroke();}
    c.scale(f,1);c.textAlign='center';c.font='bold 12px Georgia';c.fillStyle='#fff0ca';c.fillText('DEFESA',0,0);c.restore();
   }
   if(action==='attack-kick'){
    const q=clamp(t/310),fade=1-clamp((t-310)/310);c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=fade;c.shadowColor='#c6a95b';c.shadowBlur=12;for(let i=0;i<2;i++){c.beginPath();c.moveTo(24,38+i*6);c.quadraticCurveTo(80,-95-i*6,24+160*q,-60-i*6);c.strokeStyle=i?'#e9c86e':'#7f9459';c.lineWidth=i?3:7;c.stroke();}c.restore();
   }
   if(action==='attack-punch'||action==='attack-combo'){
    c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=1-clamp((t-(action==='attack-combo'?700:220))/250);c.shadowColor='#d5b16a';c.shadowBlur=12;c.strokeStyle='#e6c886';c.lineWidth=3;c.beginPath();c.moveTo(35,-10);c.quadraticCurveTo(85,-35,145,-5);c.stroke();c.restore();
   }
   if(action==='special-black-skin-white-masks'&&t<900){
    const grow=clamp(t/250);mask(origin+f*85,h*.28,25+grow*8,grow*.8);
    if(t>530){c.save();c.globalAlpha=clamp((t-530)/370);c.strokeStyle='#efb85e';c.lineWidth=2;c.shadowColor='#d85b37';c.shadowBlur=12;c.beginPath();c.ellipse(origin+f*85,h*.28,50+t*.015,75,0,0,Math.PI*2);c.stroke();c.restore();}
   }
   if(action==='special-wretched-earth'){
    const power=t<700?clamp(t/700)*.25:.6+Math.sin(t/60)*.15,fade=1-clamp((t-1500)/350),floor=h*.91;c.save();c.globalAlpha=fade;c.shadowColor='#ec6941';c.shadowBlur=14;
    for(let lane=0;lane<3;lane++){
     c.beginPath();for(let i=0;i<=30;i++){const x=i/30*w,yy=floor-lane*17+Math.sin(i*2.31+lane)*13;if(!i)c.moveTo(x,yy);else c.lineTo(x,yy);}c.strokeStyle=lane%2?'#ffd18a':'#cf5038';c.lineWidth=2+power*4;c.stroke();
    }
    for(let i=0;i<9;i++){const x=(i+.5)/9*w,phase=(t+i*91)%250/250,height=h*(.35+.27*Math.sin(i*2.4)**2)*power;
     const g=c.createLinearGradient(x,floor,x,floor-height);g.addColorStop(0,`rgba(229,89,46,${power})`);g.addColorStop(.4,`rgba(242,173,80,${power*.5})`);g.addColorStop(1,'rgba(255,216,144,0)');c.fillStyle=g;c.beginPath();c.moveTo(x-15,floor);c.lineTo(x-7,floor-height*.45);c.lineTo(x+Math.sin(i)*18,floor-height);c.lineTo(x+9,floor-height*.3);c.lineTo(x+18,floor);c.closePath();c.fill();
     if(i%2===0)chain(x,floor-10,t<700?0:Math.min(1,phase*2));
    }c.restore();
   }
  }
  const hit=p.contact;if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,y=h*.57,origin=hit.origin*w/100,f=hit.side==='player'?1:-1;
   if(age>=0&&age<650){const q=age/650,fade=1-q;c.save();c.globalAlpha=fade;c.shadowColor='#f0ae65';c.shadowBlur=12;
    if(hit.move==='especial'){
     for(let i=0;i<44;i++){const a=i*2.399,r=(30+i%8*15)*q;c.save();c.translate(origin+f*85+Math.cos(a)*r,h*.28+Math.sin(a)*r+q*q*55);c.rotate(a+q*4);c.fillStyle=i%3?'#fff4d9':'#d4a960';c.beginPath();c.moveTo(-5,-8);c.lineTo(8,-3);c.lineTo(-2,10);c.closePath();c.fill();c.restore();}
     c.strokeStyle='#e9b46a';c.lineWidth=7;c.beginPath();c.moveTo(origin,y);c.quadraticCurveTo((origin+x)/2,y-h*.17,x,y);c.stroke();c.strokeStyle='#c64235';c.lineWidth=3;c.stroke();banner('PELE NEGRA, MÁSCARAS BRANCAS!',w,h,fade);
    }else if(hit.move==='transcender'){
     // This column covers the same tall volume as the arena-wide ground/air damage.
     const g=c.createLinearGradient(x,h*.94,x,h*.15);g.addColorStop(0,`rgba(255,146,68,${fade*.7})`);g.addColorStop(.5,`rgba(238,78,44,${fade*.35})`);g.addColorStop(1,'rgba(255,222,170,0)');c.fillStyle=g;c.fillRect(x-40,h*.15,80,h*.79);
     c.strokeStyle='#f7ca83';c.lineWidth=hit.final?6:3;c.beginPath();c.ellipse(x,h*.88,35+q*w*.6,15+q*h*.20,0,0,Math.PI*2);c.stroke();if(hit.final)banner('OS CONDENADOS DA TERRA!',w,h,fade);
    }
    for(let i=0;i<20;i++){const a=i*2.399,r=(20+i%5*13)*q;c.fillStyle=i%2?'#f7d39a':'#adbe79';c.fillRect(x+Math.cos(a)*r,y+Math.sin(a)*r,3+i%3,3);}
    c.restore();
   }
  }frame=requestAnimationFrame(draw);
 };draw();return()=>cancelAnimationFrame(frame);},[]);
 return <canvas className='fanon-effects-canvas' ref={ref} aria-hidden='true'/>;
}
