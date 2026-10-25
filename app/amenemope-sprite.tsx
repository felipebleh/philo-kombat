"use client";
import { useEffect, useRef } from "react";
import { amenemopeFrame, isolateSilhouette, sheetFrameRect } from "./sprite-frames";

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
        prepared.push(canvas);
      }
      resolve(prepared);
    };
    sheet.onerror = () => { frames = undefined; reject(new Error("Spritesheet indisponível")); };
    sheet.src = "/game/amenemope-spritesheet-v3.webp";
  });
  return frames;
}
export function AmenemopeSprite({ action, paused = false }: { action: string; paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused); pausedRef.current = paused;
  useEffect(() => {
    let disposed = false, frame = 0, previous = 0, elapsed = 0, last = -1;
    loadFrames().then(art => {
      if (disposed || !ref.current) return;
      const canvas = ref.current, ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = art[0].width; canvas.height = art[0].height;
      const draw = (now: number) => {
        if (disposed) return;
        if (previous && !pausedRef.current) elapsed += Math.min(32, now - previous);
        previous = now;
        const { row, column } = amenemopeFrame(action, elapsed), index = row * 6 + column;
        if (last !== index) { ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.drawImage(art[index], 0, 0); last = index; }
        canvas.dataset.ready = "true";
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    }).catch(() => { /* Original sheet remains visible as fallback. */ });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, [action]);
  return <canvas ref={ref} className="amenemope-frame-canvas" aria-hidden="true" />;
}
