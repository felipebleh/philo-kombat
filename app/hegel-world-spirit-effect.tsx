"use client";
import { useEffect,useRef } from "react";
import { HEGEL_HORSE,HEGEL_HORSE_RECTS,HEGEL_WORLD_TIMING,worldSpiritPose } from "./hegel-world-spirit";
let horse:Promise<HTMLImageElement>|undefined;
const loadHorse=()=>horse??=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>{horse=undefined;reject(new Error("Cavaleiro espectral indisponível"));};image.src=HEGEL_HORSE;});

export function HegelWorldSpirit({origin,target,enemy=false,paused=false,clock}:{origin:number;target:number;enemy?:boolean;paused?:boolean;clock?:{time:number}}) {
  const ref=useRef<HTMLCanvasElement>(null), start=useRef(origin), destination=useRef(target);
  destination.current=target;
  const pausedRef=useRef(paused);pausedRef.current=paused;
  useEffect(()=>{
    const canvas=ref.current,ctx=canvas?.getContext("2d");if(!canvas||!ctx)return;
    let disposed=false,raf=0,previous=0,elapsed=0,width=0,height=0,dpr=1;const started=clock?.time??0;
    const measure=()=>{width=canvas.clientWidth;height=canvas.clientHeight;dpr=Math.max(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));};
    measure();const observer=new ResizeObserver(measure);observer.observe(canvas);
    loadHorse().then(image=>{
      if(disposed)return;
      const draw=(now:number)=>{
        if(disposed)return;
        if(clock)elapsed=Math.max(0,clock.time-started);else if(previous&&!pausedRef.current)elapsed+=now-previous;previous=now;
        const facing=enemy?-1:1,pose=worldSpiritPose(elapsed,start.current,destination.current,facing);
        ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
        // Vapor rises from the floor; no rectangular image backdrop is drawn.
        ctx.globalAlpha=Math.min(.26,pose.opacity*.14);
        for(let i=0;i<6;i++){
          const mistX=(i*width/5+elapsed*.035)% (width+100)-50;
          const mist=ctx.createRadialGradient(mistX,height*.87,0,mistX,height*.87,width*.16);
          mist.addColorStop(0,"#bdefff");mist.addColorStop(1,"#a4dcff00");ctx.fillStyle=mist;
          ctx.beginPath();ctx.ellipse(mistX,height*.87,width*.18,height*.11,0,0,Math.PI*2);ctx.fill();
        }
        const [sx,sy,sw,sh]=HEGEL_HORSE_RECTS[pose.frame], scale=height*.94/695;
        const w=sw*scale,h=sh*scale,center=pose.position/100*width,ground=height*.985;
        canvas.style.zIndex=elapsed<HEGEL_WORLD_TIMING.charge?"4":"13";
        // Brief ghost echoes follow the actual galloping frames along the route.
        const echoes=elapsed>=HEGEL_WORLD_TIMING.charge?3:0;
        for(let trail=echoes;trail>=0;trail--){
          ctx.save();ctx.globalAlpha=pose.opacity*(trail? .11/trail:1);
          ctx.translate(center-facing*trail*width*.035,ground);ctx.scale(facing,1);
          ctx.drawImage(image,sx,sy,sw,sh,-w*.52,-h,w,h);ctx.restore();
        }
        if(elapsed>HEGEL_WORLD_TIMING.charge){
          ctx.globalAlpha=pose.opacity*.65;ctx.fillStyle="#c8f4ff";
          for(let i=0;i<24;i++){
            const age=(elapsed*.002+i*.071)%1;
            const px=center-facing*age*width*.27,py=ground-height*(.025+Math.sin(i*1.8+elapsed*.004)*.05+age*.12);
            ctx.beginPath();ctx.arc(px,py,1+age*2,0,Math.PI*2);ctx.fill();
          }
        }
        ctx.globalAlpha=1;canvas.dataset.frame=String(pose.frame);canvas.dataset.position=pose.position.toFixed(2);
        raf=requestAnimationFrame(draw);
      };draw(performance.now());
    }).catch(()=>{if(!disposed)canvas.dataset.error="true";});
    return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();};
  },[enemy]);
  return <canvas ref={ref} className="hegel-world-spirit-canvas" aria-hidden="true"/>;
}
