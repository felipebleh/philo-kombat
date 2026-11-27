"use client";
import {useEffect,useRef} from "react";
const urls=[...Array.from({length:8},(_,i)=>`/game/olympe-motion-v2/pose-${i}.webp`),"/game/olympe-punch-hq.webp?v=3.9","/game/olympe-kick-hq.webp?v=3.9","/game/olympe-combo-hq.webp?v=3.9"];
const images:Record<number,HTMLImageElement>={};const requested=new Set<number>();
export function OlympeMotionSprite({action,clock,sequence}:{action:string;clock:{time:number};sequence:number}){
 const ref=useRef<HTMLCanvasElement>(null);const active=["advance","retreat","jump","guard","guard-hit","attack-punch","attack-kick","attack-combo","special-womens-rights","special-tribune"].includes(action);
 useEffect(()=>{if(!active)return;let raf=0,disposed=false;const started=clock.time;
 for(let i=0;i<urls.length;i++)if(!requested.has(i)){requested.add(i);const image=new Image();image.onload=()=>{images[i]=image};image.src=urls[i];}
 const draw=()=>{const node=ref.current;if(!node||disposed)return;const c=node.getContext("2d");if(!c)return;const box=node.getBoundingClientRect(),d=Math.max(2,Math.min(4,window.devicePixelRatio||1)),w=Math.round(box.width*d),h=Math.round(box.height*d);if(node.width!==w||node.height!==h){node.width=w;node.height=h;}const t=Math.max(0,clock.time-started),walk=action==="advance"||action==="retreat";let index=4;
 if(walk){const step=Math.floor(t/140)%4;index=action==="retreat"?(4-step)%4:step;}else if(action==="jump")index=5;else if(action==="special-womens-rights")index=t<220?4:6;else if(action==="special-tribune")index=t<220?6:7;else if(action==="attack-punch")index=8;else if(action==="attack-kick")index=9;else if(action==="attack-combo")index=t<280?8:t<570?9:10;
 const image=images[index];if(image){c.clearRect(0,0,w,h);c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";c.filter="contrast(1.06) saturate(1.03)";c.save();if(index>=8){const duration=action==="attack-combo"?940:action==="attack-kick"?620:520;const p=Math.min(1,t/duration),pulse=Math.sin(p*Math.PI);c.translate(w*.5,h*.72);c.rotate(-pulse*.025);c.scale(1+pulse*.018,1);c.translate(-w*.5,-h*.72);c.drawImage(image,0,0,w,h);}else{const dh=h*(index===5?.79:.957),dw=dh*image.naturalWidth/image.naturalHeight;const bob=walk?Math.sin(t/140*Math.PI)*h*.003:0;c.drawImage(image,(w-dw)/2,h*.98-dh+bob,dw,dh);}c.restore();node.dataset.ready="true";node.dataset.pose=String(index);}raf=requestAnimationFrame(draw);};draw();return()=>{disposed=true;cancelAnimationFrame(raf);};
 },[action,active,clock,sequence]);return active?<canvas ref={ref} className="olympe-motion-canvas" aria-hidden="true"/>:null;
}
