"use client";
import {useEffect,useRef} from 'react';
export type DeleuzeContact={id:number;side:'player'|'enemy';move:string;origin:number;position:number;at:number;final:boolean};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:DeleuzeContact|null;clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
/** All impact flashes read the combat's committed contact timestamp, including hitstop. */
export function DeleuzeEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext('2d');if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
 const tracks={player:{action:'',seq:-1,start:0},enemy:{action:'',seq:-1,start:0}};
 const text=(word:string,x:number,y:number,size:number)=>{c.save();c.textAlign='center';c.font=`bold ${size}px Georgia`;c.lineWidth=3;c.strokeStyle='#172f35';c.strokeText(word,x,y);c.fillStyle='#fff2cd';c.fillText(word,x,y);c.restore();};
 const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(4,Math.max(2,window.devicePixelRatio||1));
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
  c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';c.lineCap='round';
  for(const side of ['player','enemy'] as const){if(!p[side])continue;
   const action=side==='player'?p.playerAction:p.enemyAction,seq=side==='player'?p.playerSequence:p.enemySequence,tr=tracks[side];
   if(action!==tr.action||seq!==tr.seq){tr.action=action;tr.seq=seq;tr.start=now;}
   const t=Math.max(0,now-tr.start),f=side==='player'?1:-1,origin=(side==='player'?p.playerPosition:p.enemyPosition)*w/100,target=(side==='player'?p.enemyPosition:p.playerPosition)*w/100,y=h*.6;
   if(action==='guard'||action==='guard-hit'){
    c.save();c.translate(origin+f*40,y);c.scale(f,1);c.shadowColor='#9aefff';c.shadowBlur=10;c.lineWidth=action==='guard-hit'?3:1.4;
    const pulse=.6+.2*Math.sin(t/110);c.globalAlpha=pulse;
    for(let i=0;i<7;i++){const a=-Math.PI*.62+i*.24,x=Math.cos(a)*75,yy=Math.sin(a)*h*.23;c.strokeStyle=i%2?'#e6bd69':'#9cecff';c.beginPath();c.moveTo(0,0);c.lineTo(x,yy);c.lineTo(x+18,yy-8);c.moveTo(x*.52,yy*.52);c.lineTo(x*.52+22,yy*.52-14);c.stroke();c.fillStyle=c.strokeStyle;c.beginPath();c.arc(x,yy,3,0,Math.PI*2);c.fill();}c.scale(f,1);c.globalAlpha=1;text('DEFESA',12,8,12);c.restore();
   }
   if(action==='attack-punch'){
    c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=1-clamp((t-220)/230);c.strokeStyle='#b0eaff';c.shadowColor='#a2efff';c.shadowBlur=7;c.lineWidth=1.5;
    for(let i=0;i<3;i++){const x=60+i*21,yy=-8+i*8;c.beginPath();c.moveTo(x-24,yy+7);c.lineTo(x+55,yy);c.lineTo(x+48,yy-5);c.stroke();}c.restore();
   }
   if(action==='attack-combo'){
    c.save();c.translate(origin,y);c.scale(f,1);c.globalAlpha=.45*(1-clamp(t/780));c.strokeStyle='#91e4eb';c.lineWidth=2;c.setLineDash([9,8]);
    for(let i=0;i<4;i++){c.beginPath();c.moveTo(-95-i*11,35+i*12);c.bezierCurveTo(-35,20,35,-35,105,-70+i*12);c.stroke();}c.restore();
   }
   if(action==='special-rhizome'){
    const growth=clamp((t-180)/720),fade=1-clamp((t-1200)/250);c.save();c.globalAlpha=fade;c.shadowColor='#7ee2ac';c.shadowBlur=10;c.lineWidth=3;
    // Several simultaneous origins: no central trunk or hierarchical root.
    for(let i=0;i<9;i++){const base=target+(i-4)*23,top=h*.93-growth*h*(.28+(i%3)*.08),bend=(i-4)*13;c.strokeStyle=i%2?'#efc878':'#82e5b8';c.beginPath();c.moveTo(base,h*.93);c.bezierCurveTo(base+15,h*.8,base-bend,top+35,base+bend,top);c.stroke();
     for(let j=1;j<=3;j++){const yy=h*.93+(top-h*.93)*j/4,xx=base+bend*j/4;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+(j%2?1:-1)*growth*37,yy-growth*32);c.stroke();}
     c.fillStyle='#e8cf84';c.beginPath();c.ellipse(base,h*.93,16*growth,4*growth,0,0,Math.PI*2);c.fill();}c.restore();
   }

  }
  const hit=p.contact;if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,y=h*.6;
   if(age>=0&&age<480){const q=age/480;c.save();c.globalAlpha=1-q;c.shadowColor='#ffda8c';c.shadowBlur=14;c.strokeStyle=hit.move==='especial'?'#8de8bd':'#f6d5a2';c.lineWidth=hit.final?4:2;
    if(hit.move==='especial'||hit.move==='transcender'){const r=15+q*(hit.final?180:95);c.beginPath();c.ellipse(x,y,r,r*.68,0,0,Math.PI*2);c.stroke();if(hit.final&&hit.move==='especial')text('RIZOMA!',w*.5,h*.17,Math.min(32,w*.04));}
    for(let i=0;i<24;i++){const a=i*2.399,r=(25+i%5*17)*q;c.fillStyle=['#f9ce83','#8ce2b9','#b1ebf5'][i%3];c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);c.rotate(a+q);c.fillRect(-2,-2,hit.move==='transcender'?12:5,3);c.restore();}c.restore();
   }
  }frame=requestAnimationFrame(draw);
 };draw();return()=>cancelAnimationFrame(frame);},[]);
 return <canvas className='deleuze-effects-canvas' ref={ref} aria-hidden='true'/>;
}
