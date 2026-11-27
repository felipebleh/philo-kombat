"use client";
import {useEffect,useRef} from "react";
import registration from "./sidarta-frame-data.json";
import hdArt from "./sidarta-hd-art.json";
import {sidartaDensity,sidartaDrawRect,sidartaFrame,sidartaHighResFrame} from "./sidarta-motion";
import {SidartaWalk} from "./sidarta-walk";
type Textures={sheet:HTMLImageElement;standing:HTMLImageElement;guard:HTMLImageElement;walk:HTMLImageElement;lotus:HTMLImageElement};
let texture:Promise<Textures>|undefined;
function loadImage(src:string){return new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error("Arte de Sidarta indisponível"));image.src=src;});}
function loadTexture(){return texture??=Promise.all([loadImage("/game/sidarta-spritesheet-hd-v1.webp"),loadImage("/game/sidarta-fullbody-hq-v2.webp"),loadImage(hdArt.guard.src),loadImage(hdArt.walk[3].src),loadImage(hdArt.lotus.src)]).then(([sheet,standing,guard,walk,lotus])=>({sheet,standing,guard,walk,lotus})).catch(error=>{texture=undefined;throw error;});}
export function SidartaSprite({action,paused=false,clock,sequence=0}:{action:string;paused?:boolean;clock?:{time:number};sequence?:number}){
 const ref=useRef<HTMLCanvasElement>(null),pause=useRef(paused);pause.current=paused;
 useEffect(()=>{
  let disposed=false,frame=0,elapsed=0,previous=0,last=-1;const started=clock?.time??0;
  loadTexture().then(({sheet:image,standing,guard,walk,lotus})=>{
   const node=ref.current;if(disposed||!node)return;const ctx=node.getContext("2d");if(!ctx)return;
   const draw=(now:number)=>{
    if(disposed)return;
    if(clock)elapsed=Math.max(0,clock.time-started);else if(previous&&!pause.current)elapsed+=Math.min(32,now-previous);previous=now;
    const box=node.getBoundingClientRect(),density=sidartaDensity(window.devicePixelRatio),w=Math.max(1,Math.round(box.width*density)),h=Math.max(1,Math.round(box.height*density));
    if(node.width!==w||node.height!==h){node.width=w;node.height=h;last=-1;}
    const {row,column}=sidartaFrame(action,elapsed),index=row*6+column;
    if(last!==index){
     const art=registration[index],high=sidartaHighResFrame(action,elapsed);
     const native=typeof high==="number"?walk:high==="guard"?guard:high==="lotus"?lotus:high==="standing"?standing:null;
     const nativeArt=typeof high==="number"?hdArt.walk[high]:high==="guard"?hdArt.guard:high==="lotus"?hdArt.lotus:null;
     const r=native?sidartaDrawRect(1800,1536,native.naturalWidth,native.naturalHeight,row,column,nativeArt?.anchorX):sidartaDrawRect(1800,1536,art.width,art.height,row,column,art.anchorX);
     ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);ctx.setTransform(w/1800,0,0,h/1536,0,0);
     ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";ctx.filter="contrast(1.16) saturate(1.10)";
     if(native)ctx.drawImage(native,r.x,r.y,r.width,r.height);else ctx.drawImage(image,art.x,art.y,art.width,art.height,r.x,r.y,r.width,r.height);
     node.dataset.ready="true";node.dataset.pose=`${row}:${column}`;node.dataset.texture=high===null?"atlas":typeof high==="number"?`walk-${high}-hd`:high;node.dataset.sourceHeight=String(native?.naturalHeight??art.height);last=index;
    }
    frame=requestAnimationFrame(draw);
   };frame=requestAnimationFrame(draw);
  }).catch(()=>{if(ref.current)ref.current.dataset.error="true";});
  return()=>{disposed=true;cancelAnimationFrame(frame);};
 },[action,clock,sequence]);
 return <><canvas ref={ref} className="sidarta-canvas" width={1800} height={1536} aria-hidden="true"/>{(action==="advance"||action==="retreat")&&<SidartaWalk retreat={action==="retreat"} paused={paused} clock={clock}/>}</>;
}
