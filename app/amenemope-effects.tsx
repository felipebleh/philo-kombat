"use client";
import {useEffect,useRef} from "react";
import {AMENEMOPE_TIMING, AMENEMOPE_WORD_RANGE} from "./amenemope-motion";
type Clock={time:number};
const gold="#ffdb70", blue="#35dccc";

function feather(ctx:CanvasRenderingContext2D,size:number){
  ctx.save();ctx.rotate(.35);ctx.lineCap="round";
  const g=ctx.createLinearGradient(-size*.2,-size, size*.2,0);g.addColorStop(0,"#fff6be");g.addColorStop(.4,gold);g.addColorStop(.65,blue);g.addColorStop(1,"#a07623");
  ctx.fillStyle=g;ctx.strokeStyle=gold;ctx.lineWidth=Math.max(1,size*.025);
  ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-size*.65,-size*.4,-size*.33,-size*.94,0,-size);ctx.bezierCurveTo(size*.45,-size*.65,size*.35,-size*.2,0,0);ctx.fill();ctx.stroke();
  ctx.strokeStyle="#fff4c1";ctx.beginPath();ctx.moveTo(0,size*.16);ctx.lineTo(0,-size*.95);ctx.stroke();
  for(let i=1;i<12;i++){const y=-size*i/13, span=Math.sin(i/13*Math.PI)*size*.25;ctx.strokeStyle=i%2?gold:blue;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(-span,y-size*.12);ctx.moveTo(0,y);ctx.lineTo(span,y-size*.12);ctx.stroke();}
  ctx.restore();
}
function glyph(ctx:CanvasRenderingContext2D,x:number,y:number,size:number,kind:number){
  ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.lineWidth=.085;ctx.lineCap="round";ctx.strokeStyle=gold;
  ctx.beginPath();
  if(kind%3===0){ // Ankh.
    ctx.ellipse(0,-.25,.19,.25,0,0,Math.PI*2);ctx.moveTo(0,0);ctx.lineTo(0,.6);ctx.moveTo(-.3,.17);ctx.lineTo(.3,.17);
  }else if(kind%3===1){ // Eye of Horus, with the descending mark.
    ctx.moveTo(-.4,0);ctx.quadraticCurveTo(0,-.35,.4,0);ctx.quadraticCurveTo(0,.3,-.4,0);ctx.moveTo(.1,.12);ctx.lineTo(.05,.5);ctx.lineTo(-.18,.35);ctx.moveTo(.12,0);ctx.arc(0,0,.11,0,Math.PI*2);
  }else{ctx.moveTo(-.25,.5);ctx.lineTo(-.1,-.5);ctx.quadraticCurveTo(.4,-.3,-.03,.05);ctx.moveTo(-.05,.1);ctx.lineTo(.3,.45);ctx.moveTo(-.3,.5);ctx.lineTo(.3,.5);}
  ctx.stroke();ctx.restore();
}
function heart(ctx:CanvasRenderingContext2D,size:number){
  ctx.save();ctx.scale(size,size);ctx.fillStyle="#dc5547";ctx.strokeStyle=gold;ctx.lineWidth=.055;
  ctx.beginPath();ctx.moveTo(0,.35);ctx.bezierCurveTo(-.7,-.1,-.35,-.55,0,-.25);ctx.bezierCurveTo(.35,-.55,.7,-.1,0,.35);ctx.fill();ctx.stroke();ctx.restore();
}
export function AmenemopeEffects({origin,target,action,clock,jumpMs=650}:{origin:number;target:number;action:string;clock:Clock;jumpMs?:number}){
 const ref=useRef<HTMLCanvasElement>(null),positions=useRef({origin,target});positions.current={origin,target};
 useEffect(()=>{
  const node=ref.current;if(!node)return;const ctx=node.getContext("2d");if(!ctx)return;
  let frame=0;const started=clock.time;
  const draw=()=>{
   const box=node.getBoundingClientRect(),w=box.width,h=box.height,dpr=Math.min(3,window.devicePixelRatio||1);
   if(node.width!==Math.round(w*dpr)||node.height!==Math.round(h*dpr)){node.width=Math.round(w*dpr);node.height=Math.round(h*dpr);}
   ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
   const t=clock.time-started,{origin,target}=positions.current,facing=target>=origin?1:-1;
   const x=origin*w/100,tx=target*w/100,floor=h*.964,hand=floor-h*.45;
   // Shadow lives in arena coordinates, so it never rises with the jump container.
   const air=action==="jump"?Math.max(0,Math.sin(Math.min(1,t/jumpMs)*Math.PI)):0;
   ctx.fillStyle=`rgba(0,0,0,${.52-air*.3})`;ctx.filter="blur(3px)";
   ctx.beginPath();ctx.ellipse(x,floor,w*.043*(1-air*.48)*(action==="attack-kick"?1.28:1),h*.012*(1-air*.2),0,0,Math.PI*2);ctx.fill();ctx.filter="none";
   ctx.save();ctx.shadowColor=gold;ctx.shadowBlur=12;
   if(action==="attack-punch"||action==="attack-kick"){
    const duration=action==="attack-punch"?520:620,p=t/duration;
    if(p>.12&&p<.85){ctx.globalAlpha=Math.sin((p-.12)/.73*Math.PI);ctx.translate(x,hand);ctx.scale(facing,1);ctx.lineCap="round";
     const radius=h*(action==="attack-kick"?.32:.19),angle=-1.3+p*2.5;
     for(let i=0;i<2;i++){ctx.lineWidth=i?2:7;ctx.strokeStyle=i?gold:blue;ctx.beginPath();ctx.arc(0,action==="attack-kick"?h*.12:0,radius+i*4,angle-.9,angle);ctx.stroke();}
    }
   }else if(action==="attack-combo"){
    const p=Math.max(0,Math.min(1,(t-160)/(AMENEMOPE_TIMING.ideias.impact-160)));
    const end=x+facing*Math.min(Math.abs(tx-x),(AMENEMOPE_WORD_RANGE+4)*1.3*w/100);
    const wave=x+(end-x)*p;
    if(t>=160&&t<740){ctx.globalAlpha=t>510?Math.max(0,1-(t-510)/230):1;ctx.strokeStyle=blue;ctx.lineWidth=3;
     ctx.beginPath();ctx.ellipse(wave,hand,w*.025,h*.16,0,-Math.PI/2,Math.PI/2);ctx.stroke();
     for(let i=0;i<7;i++)glyph(ctx,wave-facing*i*w*.018,hand+Math.sin(i*1.7+t*.009)*h*.1,h*.055,i);
    }
   }else if(action==="special-feather"){
    const p=Math.min(1,t/AMENEMOPE_TIMING.especial.impact),fx=x+(tx-x)*p,fy=h*.08+(hand-h*.08)*p;
    ctx.globalAlpha=t<680?Math.min(1,t/100):Math.max(0,1-(t-680)/420);
    ctx.strokeStyle="#ffe7a66b";ctx.lineWidth=5;
    for(let i=0;i<7;i++){ctx.beginPath();ctx.moveTo(fx-w*.05+(i-3)*30,-20);ctx.lineTo(fx+(i-3)*13,fy);ctx.stroke();}
    ctx.translate(fx,fy);feather(ctx,h*.35);
    if(t>=610){ctx.strokeStyle=blue;ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,h*.25,(t-610)*.22+15,h*.035,0,0,Math.PI*2);ctx.stroke();}
   }else if(action==="special-scale"){
    ctx.globalAlpha=Math.min(1,t/150)*Math.min(1,(1450-t)/240);
    const cy=h*.21,size=Math.min(w*.17,h*.29),tilt=Math.sin(t*.014)*.22*Math.max(0,1-t/760);
    ctx.translate(x,cy);ctx.strokeStyle=gold;ctx.fillStyle=gold;ctx.lineWidth=5;
    ctx.beginPath();ctx.moveTo(0,-size*.35);ctx.lineTo(0,size*.92);ctx.moveTo(-size*.48,size*.92);ctx.lineTo(size*.48,size*.92);ctx.stroke();
    ctx.save();ctx.rotate(tilt);ctx.beginPath();ctx.moveTo(-size,0);ctx.lineTo(size,0);ctx.stroke();
    for(const side of [-1,1]){const px=side*size*.85;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,0);ctx.lineTo(px-size*.3,size*.55);ctx.lineTo(px+size*.3,size*.55);ctx.closePath();ctx.stroke();ctx.fillStyle="#dba33466";ctx.beginPath();ctx.ellipse(px,size*.55,size*.32,size*.1,0,0,Math.PI);ctx.fill();ctx.stroke();ctx.save();ctx.translate(px,size*.38);if(side<0)heart(ctx,size*.38);else feather(ctx,size*.4);ctx.restore();}
    ctx.restore();ctx.setTransform(dpr,0,0,dpr,0,0);
    if(t>=760){ctx.globalAlpha=Math.max(0,1-(t-760)/690);ctx.shadowBlur=25;const beam=ctx.createLinearGradient(0,hand-h*.09,0,hand+h*.09);beam.addColorStop(0,"#ffce4700");beam.addColorStop(.4,gold);beam.addColorStop(.5,"#fffde4");beam.addColorStop(.6,gold);beam.addColorStop(1,"#ffce4700");ctx.fillStyle=beam;ctx.fillRect(Math.min(x,tx),hand-h*.09,Math.abs(tx-x),h*.18);for(let i=0;i<12;i++){const a=i*Math.PI/6,r=(t-760)*.12;ctx.strokeStyle=i%2?gold:blue;ctx.beginPath();ctx.moveTo(tx+Math.cos(a)*r,hand+Math.sin(a)*r);ctx.lineTo(tx+Math.cos(a)*(r+20),hand+Math.sin(a)*(r+20));ctx.stroke();}}
   }
   ctx.restore();frame=requestAnimationFrame(draw);
  };frame=requestAnimationFrame(draw);return()=>cancelAnimationFrame(frame);
 },[action,clock,jumpMs]);
 return <>{action==="special-scale"&&<div className="amenemope-judgment-dim" aria-hidden="true"/>}<canvas ref={ref} className="amenemope-effects" aria-hidden="true"/></>;
}
