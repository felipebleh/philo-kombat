"use client";
import {useEffect,useRef,type CSSProperties} from 'react';

/** Original Deleuze–Guattari assist, with the current combat's impact handling. */
export function DeleuzeGuattari({origin,target,enemy=false,clock}:{origin:number;target:number;enemy?:boolean;clock:{time:number}}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{let frame=0;const started=clock.time;
  const tick=()=>{ref.current?.style.setProperty('--deleuze-assist-time',`-${Math.max(0,clock.time-started)}ms`);frame=requestAnimationFrame(tick);};
  tick();return()=>cancelAnimationFrame(frame);
 },[clock]);
 const assist=enemy?Math.max(8,target-17):Math.min(92,target+17);
 return <div ref={ref} className="deleuze-effect deleuze-mille-plateaux" aria-hidden="true" style={{
  '--deleuze-origin':`${origin}%`,'--deleuze-target':`${target}%`,
  '--deleuze-assist':`${assist}%`,'--deleuze-facing':enemy?-1:1,
 } as CSSProperties}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img className="deleuze-guattari-assist" src="/game/guattari-assist-hq.webp?v=4.12" alt=""/>
  <span className="deleuze-beam beam-origin" style={{left:`${Math.min(origin,target)}%`,width:`${Math.abs(target-origin)}%`}}/>
  <span className="deleuze-beam beam-assist" style={{left:`${Math.min(assist,target)}%`,width:`${Math.abs(target-assist)}%`}}/>
  <span className="deleuze-plateau-impact"><i/><i/><i/><i/><i/></span>
  <b>MIL PLATÔS</b>
 </div>;
}
