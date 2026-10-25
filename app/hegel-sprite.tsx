"use client";

import { useEffect, useRef } from "react";
import { hegelBuffer, hegelPose, paintHegel } from './hegel-animation';
import { HEGEL_POSES, type HegelPose } from './hegel-pose-data';
import { hegelPosture } from './hegel-identity';

let artwork:Promise<Map<HegelPose,HTMLImageElement>>|undefined;
export function loadHegelArtwork(){
 return artwork??=Promise.all(Object.entries(HEGEL_POSES).map(([pose,asset])=>new Promise<[HegelPose,HTMLImageElement]>((resolve,reject)=>{
  const image=new Image();image.onload=()=>resolve([pose as HegelPose,image]);image.onerror=reject;image.src=asset.file;
 }))).then(entries=>new Map(entries)).catch(error=>{artwork=undefined;throw error;});
}

/** Complete new photographic poses: face, torso and moving limbs are one image. */
export function HegelSprite({ action, paused = false, jumpMs = 650, clock }: { action: string; paused?: boolean; jumpMs?: number; clock?: {time:number} }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ action, changed: true });
  if (state.current.action !== action) state.current = { action, changed: true };
  const pausedRef = useRef(paused); pausedRef.current = paused;
  const jumpRef=useRef(jumpMs);jumpRef.current=jumpMs;
  useEffect(() => {
    const canvas = ref.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let disposed = false, raf = 0, elapsed = 0, previous = 0, last = "", started=clock?.time??0;
    let width = 0, height = 0, dpr = 1, dirty = true;
    const measure = () => {
      width = canvas.clientWidth; height = canvas.clientHeight;
      const buffer = hegelBuffer(width, height, window.devicePixelRatio || 1);
      dpr = buffer.dpr;
      if (canvas.width !== buffer.width || canvas.height !== buffer.height) {
        canvas.width = buffer.width; canvas.height = buffer.height;
      }
      dirty = true;
    };
    measure();
    const observer = new ResizeObserver(measure); observer.observe(canvas);
    window.addEventListener("resize", measure);
    loadHegelArtwork().then(poses => {
      if (disposed) return;
      const draw = (now: number) => {
        if (disposed) return;
        if (state.current.changed) { elapsed = 0; started=clock?.time??0; state.current.changed = false; dirty = true; }
        else if (clock) elapsed=Math.max(0,clock.time-started);
        else if (previous && !pausedRef.current) elapsed += now - previous;
        previous = now;
        if (Math.max(2, window.devicePixelRatio || 1) !== dpr) measure();
        const pose = hegelPose(state.current.action, state.current.action==="jump" ? elapsed*650/jumpRef.current : elapsed), index = pose;
        if (width && height && (dirty || index !== last || state.current.action==="jump")) {
          const source = HEGEL_POSES[pose];
          const posture=hegelPosture(state.current.action,elapsed,jumpRef.current);
          paintHegel(ctx,poses.get(pose)!,source,width,height,dpr,posture.lift);
          const root=canvas.closest<HTMLElement>(".fighter");
          root?.style.setProperty("--hegel-shadow-width",String(posture.shadowWidth));
          root?.style.setProperty("--hegel-shadow-height",String(posture.shadowHeight));
          root?.style.setProperty("--hegel-shadow-opacity",String(posture.shadowOpacity));
          canvas.dataset.ready = "true";
          canvas.dataset.frame = pose;
          canvas.dataset.action = state.current.action;
          last = index; dirty = false;
        }
        raf = requestAnimationFrame(draw);
      };
      draw(performance.now());
    }).catch(() => { if (!disposed) canvas.dataset.error = "true"; });
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      window.removeEventListener("resize", measure); delete canvas.dataset.ready;
    };
  }, []);
  return <canvas ref={ref} className="hegel-frame-canvas" aria-hidden="true" />;
}
