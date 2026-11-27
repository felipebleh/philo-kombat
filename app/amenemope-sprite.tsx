"use client";
import { useEffect, useRef } from "react";
import { amenemopeFrame, isolateSilhouette, sheetFrameRect } from "./sprite-frames";

import { AMENEMOPE_IDLE_HEIGHT, amenemopeDensity, amenemopeAnchor, sharpenAmenemope } from "./amenemope-motion";

let frames: Promise<HTMLCanvasElement[]> | undefined;
function loadFrames() {
  if (frames) return frames;
  frames = new Promise<HTMLCanvasElement[]>((resolve, reject) => {
    const sheet = new Image();
    sheet.onload = () => {
      const prepared: HTMLCanvasElement[] = [];
      for (let row = 0; row < 6; row++) for (let column = 0; column < 6; column++) {
        const [sx, sy, width, height] = sheetFrameRect(sheet.naturalWidth, sheet.naturalHeight, column, row);
        // A padded canvas preserves the extended kick. Neighbor silhouettes are masked,
        // rather than widening the CSS background viewport across the sheet.
        const padding = Math.round(width * .3);
        const canvas = document.createElement("canvas");
        canvas.width = width + padding * 2; canvas.height = height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) { reject(new Error("Canvas indisponível")); return; }
        const start = Math.max(0, sx - padding);
        const end = Math.min(sheet.naturalWidth, sx + width + padding);
        ctx.drawImage(sheet, start, sy, end - start, height, start - sx + padding, 0, end - start, height);
        if (row === 2 || row === 3) {
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
          isolateSilhouette(pixels.data, canvas.width, canvas.height);
          ctx.putImageData(pixels, 0, 0);
        } else {
          // Non-attack frames use a strict cell; particle art remains intact.
          ctx.clearRect(0, 0, padding, height);
          ctx.clearRect(width + padding, 0, padding, height);
        }
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        sharpenAmenemope(pixels.data, canvas.width, canvas.height);
        ctx.putImageData(pixels, 0, 0);
        prepared.push(canvas);
      }
      resolve(prepared);
    };
    sheet.onerror = () => { frames = undefined; reject(new Error("Spritesheet indisponível")); };
    sheet.src = "/game/amenemope-spritesheet-v3.webp";
  });
  return frames;
}
// Lazy, bounded offscreen texture cache: no full 4x atlas allocation on mobile.
const hdFrames = new Map<string, HTMLCanvasElement>();
function hiDpiFrame(art: HTMLCanvasElement[], index: number, density: number) {
  const key = `${index}:${density}`;
  const cached = hdFrames.get(key);
  if (cached) { hdFrames.delete(key); hdFrames.set(key, cached); return cached; }
  const source = art[index];
  const anchor = amenemopeAnchor(source.getContext("2d")!.getImageData(0,0,source.width,source.height).data, source.width, source.height);
  const idle = art[0];
  const reference = amenemopeAnchor(idle.getContext("2d")!.getImageData(0,0,idle.width,idle.height).data,idle.width,idle.height);
  const scale = source.height * AMENEMOPE_IDLE_HEIGHT / (reference.floor-reference.top+1);
  const canvas = document.createElement("canvas");
  const outputWidth = Math.round(source.height / 1.5 * 2.2);
  canvas.width = outputWidth*density; canvas.height = source.height*density;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  ctx.filter = "contrast(1.16) saturate(1.12)";
  ctx.drawImage(source, (outputWidth/2-anchor.x*scale)*density,
    (source.height*(1-15/1536)-anchor.floor*scale)*density, source.width*scale*density, source.height*scale*density);
  hdFrames.set(key,canvas);
  while(hdFrames.size>8) hdFrames.delete(hdFrames.keys().next().value!);
  return canvas;
}
export function AmenemopeSprite({ action, paused = false, clock }: { action: string; paused?: boolean; clock?: {time:number} }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused); pausedRef.current = paused;
  useEffect(() => {
    let disposed = false, frame = 0, previous = 0, elapsed = 0, last = -1, lastBlend = -1;
    const started = clock?.time ?? 0;
    loadFrames().then(art => {
      if (disposed || !ref.current) return;
      const canvas = ref.current, ctx = canvas.getContext("2d");
      if (!ctx) return;
      const hadPrevious = canvas.dataset.ready === "true";
      const previousArt = document.createElement("canvas");
      previousArt.width=canvas.width; previousArt.height=canvas.height;
      previousArt.getContext("2d")?.drawImage(canvas,0,0);
      const density = amenemopeDensity(window.devicePixelRatio);
      canvas.width = Math.round(art[0].height / 1.5 * 2.2)*density; canvas.height = art[0].height*density;
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
      const draw = (now: number) => {
        if (disposed) return;
        if (clock) elapsed = Math.max(0,clock.time-started);
        else if (previous && !pausedRef.current) elapsed += Math.min(32, now - previous);
        previous = now;
        const { row, column } = amenemopeFrame(action, elapsed), index = row * 6 + column;
        // Short pose blend softens startup while retaining every actual source frame.
        const blend=hadPrevious?Math.min(1,elapsed/45):1;
        if(last!==index || lastBlend!==blend){
          ctx.clearRect(0,0,canvas.width,canvas.height);
          if(blend<1){ctx.globalAlpha=1-blend;ctx.drawImage(previousArt,0,0);}
          ctx.globalAlpha=blend;ctx.drawImage(hiDpiFrame(art,index,density),0,0);ctx.globalAlpha=1;
          last=index;lastBlend=blend;
        }
        canvas.dataset.ready = "true";
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    }).catch(() => { /* Original sheet remains visible as fallback. */ });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [action,clock]);
  return <canvas ref={ref} className="amenemope-frame-canvas" aria-hidden="true" />;
}
