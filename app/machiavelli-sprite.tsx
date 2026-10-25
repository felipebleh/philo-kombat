"use client";

import { useEffect, useRef } from "react";
import { MACHIAVELLI_FILTER, MACHIAVELLI_SHEET, machiavelliFrame, machiavelliFrameRect, machiavelliPosture, machiavelliTextureBounds, machiavelliBuffer, paintMachiavelli, prepareMachiavelliPixels } from "./machiavelli-animation";

type PreparedFrame = { texture: HTMLCanvasElement; placement: ReturnType<typeof machiavelliTextureBounds> };
let frames: Promise<PreparedFrame[]> | undefined;
function loadFrames() {
  if (frames) return frames;
  frames = new Promise<PreparedFrame[]>((resolve, reject) => {
    const sheet = new Image();
    sheet.onload = () => {
      try {
        const prepared: PreparedFrame[] = [];
        for (let row = 0; row < 6; row++) for (let column = 0; column < 6; column++) {
          const rect = machiavelliFrameRect(sheet.naturalWidth, sheet.naturalHeight, column, row);
          const frame = document.createElement("canvas");
          const [sx, sy, width, height] = rect;
          frame.width = width; frame.height = height;
          const ctx = frame.getContext("2d", { willReadFrequently: true });
          if (!ctx) throw new Error("Canvas indisponível");
          // Integer native crops never sample a neighboring cell.
          ctx.drawImage(sheet, sx, sy, width, height, 0, 0, width, height);
          const pixels = ctx.getImageData(0, 0, frame.width, frame.height);
          // Prepare native HQ pixels once: alpha-safe sharpening and outer-edge cleanup.
          pixels.data.set(prepareMachiavelliPixels(pixels.data, frame.width, frame.height));
          ctx.putImageData(pixels, 0, 0);
          // Keep HQ detail at native resolution without caching empty margins.
          const placement = machiavelliTextureBounds(pixels.data, frame.width, frame.height);
          const texture = document.createElement("canvas");
          texture.width = placement.width; texture.height = placement.height;
          const textureContext = texture.getContext("2d");
          if (!textureContext) throw new Error("Canvas indisponível");
          textureContext.drawImage(frame, placement.x, placement.y, placement.width, placement.height, 0, 0, placement.width, placement.height);
          prepared.push({ texture, placement });
        }
        resolve(prepared);
      } catch (error) { frames = undefined; reject(error); }
    };
    sheet.onerror = () => { frames = undefined; reject(new Error("Arte de Maquiavel indisponível")); };
    sheet.src = MACHIAVELLI_SHEET;
  });
  return frames;
}

export function MachiavelliSprite({ action, paused = false }: { action: string; paused?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused); pausedRef.current = paused;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const fighter = canvas.closest<HTMLElement>(".fighter");
    const ctx = canvas.getContext("2d");
    if (!ctx || !fighter) return;
    let disposed = false, raf = 0, previous = 0, elapsed = 0, last = -1;
    let width = 0, height = 0, fighterHeight = 0, dpr = 1, dirty = true, lastPosture = "";
    const measure = () => {
      width = canvas.clientWidth; height = canvas.clientHeight; fighterHeight = fighter.clientHeight;
      if (!width || !height) return;
      const buffer = machiavelliBuffer(width, height, window.devicePixelRatio || 1);
      dpr = buffer.dpr;
      if (canvas.width !== buffer.width || canvas.height !== buffer.height) {
        canvas.width = buffer.width; canvas.height = buffer.height;
      }
      dirty = true;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    window.addEventListener("resize", measure);
    // CSS fallback for engines without CanvasRenderingContext2D.filter.
    if (!("filter" in ctx)) canvas.style.filter = MACHIAVELLI_FILTER;
    loadFrames().then(art => {
      if (disposed) return;
      const draw = (now: number) => {
        if (disposed) return;
        if (previous && !pausedRef.current) elapsed += Math.min(32, now - previous);
        previous = now;
        if (Math.max(2, window.devicePixelRatio || 1) !== dpr) measure();
        const { row, column } = machiavelliFrame(action, elapsed), index = row * 6 + column;
        if (width && height && (dirty || index !== last)) {
          paintMachiavelli(ctx, art[index].texture, width, height, dpr, art[index].placement);
          last = index; dirty = false;
          canvas.dataset.ready = "true";
        }
        const posture = machiavelliPosture(action, elapsed);
        const postureKey = `${posture.lift * fighterHeight},${posture.squash},${posture.shadowWidth},${posture.shadowHeight},${posture.shadowOpacity}`;
        if (postureKey !== lastPosture) {
          canvas.style.transform = `translateY(${-posture.lift * fighterHeight}px) scaleY(${posture.squash})`;
          fighter.style.setProperty("--machiavelli-shadow-width", String(posture.shadowWidth));
          fighter.style.setProperty("--machiavelli-shadow-height", String(posture.shadowHeight));
          fighter.style.setProperty("--machiavelli-shadow-opacity", String(posture.shadowOpacity));
          lastPosture = postureKey;
        }
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
    }).catch(() => { if (!disposed) canvas.dataset.error = "true"; });
    return () => {
      disposed = true; cancelAnimationFrame(raf); observer.disconnect();
      window.removeEventListener("resize", measure);
      canvas.style.transform = "";
      for (const property of ["width", "height", "opacity"]) fighter.style.removeProperty(`--machiavelli-shadow-${property}`);
    };
  }, [action]);
  return <canvas ref={ref} className="machiavelli-frame-canvas" aria-hidden="true" />;
}
