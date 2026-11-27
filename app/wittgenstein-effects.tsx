"use client";
import {useEffect,useRef} from "react";
export type WittContact={id:number;side:"player"|"enemy";move:string;position:number;at:number};
type Props={player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:WittContact|null;clock:{time:number}};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const signs=["p","q","¬","∧","→","mundo","sentido","⊢"];
export function WittgensteinEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{
  const canvas=ref.current,c=canvas?.getContext("2d");if(!canvas||!c)return;
  let frame=0;const tracks={player:{action:"",seq:-1,start:0},enemy:{action:"",seq:-1,start:0}};
  const draw=()=>{
   const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),density=Math.min(3,Math.max(2,window.devicePixelRatio||1)),w=box.width,h=box.height;
   if(canvas.width!==Math.round(w*density)||canvas.height!==Math.round(h*density)){canvas.width=Math.round(w*density);canvas.height=Math.round(h*density);}
   c.setTransform(density,0,0,density,0,0);c.clearRect(0,0,w,h);c.lineCap="round";c.lineJoin="round";
   for(const side of ["player","enemy"] as const){
    if(!p[side])continue;
    const action=side==="player"?p.playerAction:p.enemyAction,seq=side==="player"?p.playerSequence:p.enemySequence,track=tracks[side];
    if(track.action!==action||track.seq!==seq){track.action=action;track.seq=seq;track.start=now;}
    const t=Math.max(0,now-track.start),f=side==="player"?1:-1,origin=(side==="player"?p.playerPosition:p.enemyPosition)*w/100,target=(p.contact?.side===side && p.contact.at>=track.start ? p.contact.position : side==="player"?p.enemyPosition:p.playerPosition)*w/100,y=h*.63;
    c.save();c.translate(origin,y);c.scale(f,1);c.strokeStyle="#d0edff";c.fillStyle="#e9f6ff";c.shadowColor="#b8dcff";c.shadowBlur=9;
    if(action==="guard"||action==="guard-hit"){
     c.fillStyle="rgba(126,191,232,.12)";c.beginPath();c.ellipse(65,0,55,h*.20,0,-1.5,1.5);c.lineTo(65,0);c.fill();
     c.lineWidth=action==="guard-hit"?4:1.8;
     for(let i=0;i<3;i++){c.beginPath();c.ellipse(48+i*13,0,44,h*(.18+i*.018),0,-1.3,1.3);c.stroke();}
     c.font="14px Georgia";c.fillStyle="#d9f1ff";c.fillText("p → q",55,-24);c.fillText("¬(p ∧ ¬p)",30,22);
    }
    if(action==="attack-combo"){
     const grow=clamp(t/560),dissolve=clamp((t-650)/290);c.globalAlpha=1-dissolve;c.lineWidth=4;
     for(let i=0;i<6;i++)if(grow*6>i){const x=25+i*24,yy=50-i*24;c.beginPath();c.moveTo(x,yy);c.lineTo(x+26,yy);c.lineTo(x+26,yy-24);c.stroke();}
     c.globalAlpha=1; if(dissolve>0)for(let i=0;i<30;i++){const k=i%6,x=25+k*24+(Math.sin(i*11)*36)*dissolve,yy=50-k*24-70*dissolve;c.fillStyle=`rgba(221,246,255,${1-dissolve})`;c.fillRect(x,yy,2,2);}
    }
    if(action==="special-poker"){
     const sprite=canvas.parentElement?.querySelector(`.fighter-${side}.fighter-wittgenstein.special-poker .fighter-sprite`)?.getBoundingClientRect();
     const baseX=sprite?((sprite.left+sprite.width*(f===1?.975:.025)-box.left)-origin)*f:h*.31;
     const baseY=sprite?sprite.top+sprite.height*.96-box.top-y:h*.30;
     const travel=clamp((t-260)/920),distance=Math.abs(target-origin),tip=baseX+(distance-baseX)*travel,tipY=baseY+(16-baseY)*travel;
     c.strokeStyle="#ffac46";c.shadowColor="#ff6b18";c.shadowBlur=20;c.lineWidth=5;
     c.beginPath();c.moveTo(baseX,baseY);c.quadraticCurveTo((baseX+tip)/2,(baseY+tipY)/2-32,tip,tipY);c.stroke();
     c.fillStyle="#fff2a8";c.beginPath();c.arc(baseX,baseY,7,0,Math.PI*2);c.fill();
     for(let i=0;i<24;i++){const a=(i*17+t*.12)%120;c.globalAlpha=1-a/120;c.fillStyle=i%2?"#ffb858":"#79685c";c.fillRect(tip-a,tipY+Math.sin(i*5)*a*.2,3,3);}c.globalAlpha=1;
    }
    if(action==="special-language-limits"){
     c.strokeStyle="#effaff";c.shadowColor="#fff";c.shadowBlur=18;c.lineWidth=3;
     const size=clamp(t/300);c.strokeRect(20,-h*.28*size,85,h*.5*size);
     for(let i=0;i<signs.length;i++){const vanish=clamp((t-300-i*65)/600);c.globalAlpha=1-vanish;c.font=(i<5?22:14)+"px Georgia";c.fillText(signs[i],35+(i%2)*35,-h*.22+(i%5)*h*.09-vanish*15);}
     c.globalAlpha=1;const progress=clamp((t-500)/980),xx=55+(Math.abs(target-origin)-55)*progress+((f===1?w-origin:origin)-Math.abs(target-origin)+100)*clamp((t-1480)/370);
     if(t>=500&&t<1850){c.strokeStyle=`rgba(255,255,255,${1-clamp((t-1680)/170)})`;c.lineWidth=10;c.beginPath();c.ellipse(xx,0,28+progress*38,h*.34,-.05,-1.5,1.5);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(xx-15,0,35,h*.31,0,-1.4,1.4);c.stroke();}
    }
    c.restore();
   }
   const hit=p.contact;
   if(hit){const age=now-hit.at;if(age>=0&&age<420){const progress=age/420,x=hit.position*w/100,y=h*.62,color=hit.move==="especial"?"#ffab40":"#ecfaff";
    c.save();c.globalAlpha=1-progress;c.shadowColor=color;c.shadowBlur=14;c.fillStyle=color;c.strokeStyle=color;
    if(hit.move==="transcender"){c.fillStyle=`rgba(255,255,255,${.23*(1-progress)})`;c.fillRect(0,0,w,h);c.fillStyle=color;}
    const n=hit.move==="especial"?44:hit.move==="transcender"?35:14;
    for(let i=0;i<n;i++){const a=i*2.399,dist=(14+(i%7)*9)*progress,px=x+Math.cos(a)*dist,py=y+Math.sin(a)*dist;
     if(hit.move==="caverna"){c.font="14px Georgia";c.fillText(signs[i%signs.length],px,py);}else{c.save();c.translate(px,py);c.rotate(a+progress);c.fillRect(-2,-2,i%2?3:7,2);c.restore();}}
    c.restore();}}
   frame=requestAnimationFrame(draw);
  };draw();return()=>cancelAnimationFrame(frame);
 },[]);
 return <canvas className="witt-effects-canvas" ref={ref} aria-hidden="true"/>;
}
