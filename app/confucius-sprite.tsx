"use client";
import {useEffect,useRef} from "react";
import registration from "./confucius-frame-data.json";
import {confuciusDensity,confuciusDrawRect,confuciusFrame} from "./confucius-motion";

// Keep the previous atlas as a fallback while individual HD poses are loading.
let atlas: Promise<HTMLImageElement> | undefined;
const poses: (HTMLImageElement | undefined)[] = new Array(36);
const requested = new Set<number>();
function loadAtlas(){return atlas ??= new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Sprites de Confúcio indisponíveis"));image.src="/game/confucio-spritesheet-clean-v2.webp";}).catch(error=>{atlas=undefined;throw error;});}
function requestPose(index:number){
 if(requested.has(index))return;
 requested.add(index);const image=new Image();image.decoding="async";
 image.onload=()=>{poses[index]=image;};image.onerror=()=>{requested.delete(index);};
 image.src=`/game/confucio-hd-v3/frame-${String(index).padStart(2,"0")}.webp`;
}
export function ConfuciusSprite({action,clock,sequence=0}:{action:string;clock:{time:number};sequence?:number}) {
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{let disposed=false,frame=0,last=-1,lastImage:HTMLImageElement|undefined;const started=clock.time;
  for(let i=0;i<registration.length;i++)requestPose(i);
  loadAtlas().then(sheet=>{const node=ref.current;if(disposed||!node)return;const ctx=node.getContext("2d");if(!ctx)return;
   const draw=()=>{if(disposed)return;const box=node.getBoundingClientRect(),density=confuciusDensity(window.devicePixelRatio),w=Math.max(1,Math.round(box.width*density)),h=Math.max(1,Math.round(box.height*density));
    if(node.width!==w||node.height!==h){node.width=w;node.height=h;last=-1;}
    const {row,column}=confuciusFrame(action,Math.max(0,clock.time-started)),index=row*6+column,hd=poses[index],image=hd??sheet;
    if(index!==last||image!==lastImage){const art=registration[index],r=confuciusDrawRect(1800,1536,art,registration[0].height);ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(w/1800,0,0,h/1536,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.filter="contrast(1.14) saturate(1.08)";
     if(hd)ctx.drawImage(hd,r.x,r.y,r.width,r.height);else ctx.drawImage(sheet,art.x,art.y,art.width,art.height,r.x,r.y,r.width,r.height);
     node.dataset.ready="true";node.dataset.pose=`${row}:${column}`;node.dataset.texture=hd?"hd":"atlas";last=index;lastImage=image;
    }frame=requestAnimationFrame(draw);
   };frame=requestAnimationFrame(draw);
  }).catch(()=>{if(ref.current)ref.current.dataset.error="true";});return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[action,clock,sequence]);
 return <canvas ref={ref} className="confucius-canvas" width={1800} height={1536} aria-hidden="true"/>;
}
