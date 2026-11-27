"use client";
import {useEffect,useRef} from "react";
export type ArendtContact={id:number;side:"player"|"enemy";move:string;origin:number;position:number;at:number};
type Props={finishing:boolean;player:boolean;enemy:boolean;playerAction:string;enemyAction:string;playerPosition:number;enemyPosition:number;playerSequence:number;enemySequence:number;contact:ArendtContact|null;clock:{time:number}};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function ArendtEffects(props:Props){
 const ref=useRef<HTMLCanvasElement>(null),live=useRef(props);live.current=props;
 useEffect(()=>{const canvas=ref.current,c=canvas?.getContext("2d");if(!canvas||!c)return;let frame=0;const tail={id:-1,wall:0};
  const tracks={player:{action:"",seq:-1,start:0},enemy:{action:"",seq:-1,start:0}};
  const gear=(x:number,y:number,r:number,angle:number)=>{c.save();c.translate(x,y);c.rotate(angle);c.beginPath();for(let i=0;i<48;i++){const a=i*Math.PI/24,rr=i%4<2?r+7:r;if(i===0)c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);else c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fillStyle="#626a6f";c.strokeStyle="#b5bbc0";c.lineWidth=2;c.fill();c.stroke();c.beginPath();c.arc(0,0,r*.44,0,Math.PI*2);c.fillStyle="#293138";c.fill();c.stroke();c.restore();};
  const banner=(text:string,w:number,h:number,alpha:number)=>{c.save();c.globalAlpha=alpha;c.textAlign="center";c.font=`bold ${Math.min(30,w*.039)}px Georgia`;c.fillStyle="#fff5ce";c.shadowColor="#e4b54f";c.shadowBlur=18;c.fillText(text,w*.5,h*.16);c.restore();};
  const draw=()=>{const p=live.current,now=p.clock.time,box=canvas.getBoundingClientRect(),w=box.width,h=box.height,d=Math.min(3,Math.max(2,window.devicePixelRatio||1));
   if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);}
   c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);c.lineCap="round";c.lineJoin="round";
   for(const side of ["player","enemy"] as const){if(!p[side])continue;
    const action=side==="player"?p.playerAction:p.enemyAction,seq=side==="player"?p.playerSequence:p.enemySequence,tr=tracks[side];
    if(tr.action!==action||tr.seq!==seq){tr.action=action;tr.seq=seq;tr.start=now;}
    const t=Math.max(0,now-tr.start),f=side==="player"?1:-1,origin=(side==="player"?p.playerPosition:p.enemyPosition)*w/100;
    const hit=p.contact?.side===side&&p.contact.at>=tr.start?p.contact:null;
    const target=(hit?hit.position:side==="player"?p.enemyPosition:p.playerPosition)*w/100,y=h*.62;
    if(action==="guard"||action==="guard-hit"){
     c.save();c.translate(origin+f*58,y-h*.04);c.scale(f,1);c.shadowColor="#b6d6fb";c.shadowBlur=12;
     c.beginPath();c.ellipse(0,0,51,h*.20,0,-1.45,1.45);c.lineTo(0,0);c.closePath();c.fillStyle="rgba(136,186,233,.15)";c.fill();
     for(let i=0;i<3;i++){c.beginPath();c.ellipse(i*10,0,45,h*(.18+i*.014),0,-1.4,1.4);c.strokeStyle=i%2?"#d8b75e":"#c7e9ff";c.lineWidth=action==="guard-hit"?3:1.5;c.stroke();}
     c.scale(f,1);c.font="bold 11px Georgia";c.fillStyle="#fff0bd";c.textAlign="center";c.fillText("ESPAÇO",0,-8);c.fillText("PÚBLICO",0,9);c.restore();
    }
    if(action==="attack-combo"){
     const fade=1-clamp((t-760)/180);c.save();c.globalAlpha=fade;c.translate(origin,y);c.scale(f,1);
     for(let i=0;i<3;i++){const a=t/260+i*1.8,x=40+i*34,yy=Math.sin(a)*30-20;c.strokeStyle=["#e4c066","#c7e4f5","#8cd9ec"][i];c.shadowColor=c.strokeStyle;c.shadowBlur=12;c.lineWidth=3;
      c.beginPath();c.moveTo(x-35,yy+12);c.quadraticCurveTo(x-16,yy-14,x,yy);c.stroke();c.beginPath();c.arc(x,yy,9,0,Math.PI*2);c.fillStyle=c.strokeStyle;c.fill();
      c.save();c.translate(x,yy-18);c.scale(f,1);c.font="bold 10px Georgia";c.textAlign="center";c.fillText(["TRABALHO","OBRA","AÇÃO"][i],0,0);c.restore();}
     c.restore();
    }
    if(action==="special-banality"){
     const fade=1-clamp((t-1220)/230);c.save();c.globalAlpha=fade;
     gear(target-95,y-h*.15,38,t*.0016);gear(target+98,y-h*.11,48,-t*.0012);
     for(let pile=0;pile<3;pile++)for(let n=0;n<5;n++){const x=target-130+pile*80+n*2,yy=y+70-n*8;c.fillStyle=n%2?"#d6d2c8":"#ece7d9";c.strokeStyle="#747b80";c.lineWidth=1;c.fillRect(x,yy,72,10);c.strokeRect(x,yy,72,10);}
     const drop=clamp((t-240)/660),baseY=y-h*.5*(1-drop*drop*drop)-(t>900?Math.sin(clamp((t-900)/330)*Math.PI)*22:0);
     c.save();c.translate(target,baseY);c.rotate((1-drop)*-.10);c.shadowColor="rgba(0,0,0,.7)";c.shadowBlur=16;
     c.fillStyle="#444d55";c.strokeStyle="#c1c7ca";c.lineWidth=3;c.fillRect(-73,-24,146,24);c.strokeRect(-73,-24,146,24);
     const wood=c.createLinearGradient(-20,-130,20,-130);wood.addColorStop(0,"#392a20");wood.addColorStop(.5,"#b37c4e");wood.addColorStop(1,"#50372a");c.fillStyle=wood;c.fillRect(-16,-114,32,90);c.beginPath();c.ellipse(0,-114,38,20,0,0,Math.PI*2);c.fill();c.strokeStyle="#9ca4ab";c.stroke();c.restore();
     if(t>=900){c.save();c.translate(target,y+18);c.rotate(-.08);c.strokeStyle="#b96b57";c.fillStyle="#e0b09b";c.lineWidth=3;c.strokeRect(-94,-18,188,36);c.textAlign="center";c.font="bold 20px Georgia";c.fillText("PROTOCOLADO",0,7);c.restore();}
     c.restore();
    }
    if(action==="special-natality" && t<760){c.save();c.strokeStyle="rgba(255,232,160,.6)";c.shadowColor="#ffe8a1";c.shadowBlur=16;c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(origin,y,22+i*13+Math.sin(t/150)*4,0,Math.PI*2);c.stroke();}c.restore();}
   }
   const hit=p.contact;
   if(hit){if(tail.id!==hit.id){tail.id=hit.id;tail.wall=performance.now();}const age=p.finishing?Math.max(now-hit.at,performance.now()-tail.wall):now-hit.at,x=hit.position*w/100,origin=hit.origin*w/100,y=h*.62;
    if(hit.move==="transcender"&&age>=0&&age<1050){const progress=clamp(age/620),fade=1-clamp((age-600)/450),r=35+progress*w*.95;c.save();
     const dawn=c.createRadialGradient(origin,y,0,origin,y,r);dawn.addColorStop(0,`rgba(255,255,246,${.55*fade})`);dawn.addColorStop(.32,`rgba(255,221,123,${.4*fade})`);dawn.addColorStop(1,"rgba(255,230,165,0)");c.fillStyle=dawn;c.fillRect(0,0,w,h);
     c.strokeStyle=`rgba(255,247,210,${fade})`;c.shadowColor="#ffe3a0";c.shadowBlur=18;c.lineWidth=6;c.beginPath();c.arc(origin,y,r*.8,0,Math.PI*2);c.stroke();
     for(let i=0;i<20;i++){const a=i*Math.PI/10;c.strokeStyle=`rgba(255,235,173,${fade*.55})`;c.lineWidth=i%2?2:5;c.beginPath();c.moveTo(origin+Math.cos(a)*r*.18,y+Math.sin(a)*r*.18);c.lineTo(origin+Math.cos(a)*r,y+Math.sin(a)*r);c.stroke();}
     c.textAlign="center";c.font="bold 20px Georgia";c.fillStyle="#a6f2ac";c.strokeStyle="#765f2c";c.lineWidth=3;c.strokeText("+15 COERÊNCIA",origin,h*.38-progress*32);c.fillText("+15 COERÊNCIA",origin,h*.38-progress*32);c.restore();banner("NATALIDADE!",w,h,fade);
    }
    if(age>=0&&age<420){const progress=age/420;c.save();c.globalAlpha=1-progress;c.shadowColor=hit.move==="especial"?"#b9c1c8":"#ffe9a6";c.shadowBlur=12;c.fillStyle=hit.move==="especial"?"#d0d5d7":"#fff4c4";
     for(let i=0;i<(hit.move==="especial"?44:22);i++){const a=i*2.399,r=(18+i%7*11)*progress;c.save();c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r);c.rotate(a);c.fillRect(-2,-2,hit.move==="especial"?9:4,3);c.restore();}c.restore();
     if(hit.move==="especial")banner("BANALIDADE DO MAL!",w,h,1-progress*.4);
    }
   }
   frame=requestAnimationFrame(draw);
  };draw();return()=>cancelAnimationFrame(frame);
 },[]);
 return <canvas className="arendt-effects-canvas" ref={ref} aria-hidden="true"/>;
}
