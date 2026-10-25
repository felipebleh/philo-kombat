"use client";

import { useEffect, useRef } from "react";
import { FELIPE_ART, type FelipePose, felipeKeyAlpha, felipePose, felipeSourceRect } from "./felipe-animation";

const textures = new Map<string, Promise<HTMLCanvasElement>>();

function texture(file: string, cell?: number): Promise<HTMLCanvasElement> {
  const key = `${file}:${cell ?? "all"}`;
  const cached = textures.get(key);
  if (cached) return cached;
  const pending = new Promise<HTMLCanvasElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const [sx, sy, width, height] = felipeSourceRect(file, cell, image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) { reject(new Error("Canvas indisponível")); return; }
      ctx.drawImage(image, sx, sy, width, height, 0, 0, width, height);
      const pixels = ctx.getImageData(0, 0, width, height);
      let left = width, top = height, right = 0, bottom = 0;
      for (let i = 0; i < pixels.data.length; i += 4) {
        const data = pixels.data;
        const alpha = felipeKeyAlpha(data[i], data[i + 1], data[i + 2]);
        data[i + 3] = Math.min(data[i + 3], alpha);
        if (alpha > 0 && alpha < 255) {
          // Remove colored edge spill without touching opaque subject pixels.
          const spill = Math.max(0, Math.min(data[i], data[i + 2]) - data[i + 1]);
          data[i] -= spill * (1 - alpha / 255);
          data[i + 2] -= spill * (1 - alpha / 255);
        }
        if (data[i + 3] > 100) {
          const x = (i / 4) % width, y = Math.floor(i / 4 / width);
          left = Math.min(left, x); right = Math.max(right, x);
          top = Math.min(top, y); bottom = Math.max(bottom, y);
        }
      }
      ctx.putImageData(pixels, 0, 0);
      const cropped = document.createElement("canvas");
      cropped.width = Math.max(1, right - left + 1); cropped.height = Math.max(1, bottom - top + 1);
      cropped.getContext("2d")?.drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      resolve(cropped);
    };
    image.onerror = () => { textures.delete(key); reject(new Error(`Arte indisponível: ${file}`)); };
    image.src = file === "thumbnail" ? "/game/thumb-felipe.webp" : `/game/felipe-${file}.webp`;
  });
  textures.set(key, pending);
  return pending;
}

export function FelipeSprite({ action = "idle", staticPose, portrait = false, framing = "combat", onReady, paused = false }: {
  action?: string; staticPose?: FelipePose; portrait?: boolean; paused?: boolean;
  framing?: "combat" | "tight"; onReady?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const attacks = useRef(0);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let cancelled = false, frame = 0, reportedReady = false;
    const loaded = new Map<FelipePose, HTMLCanvasElement>();
    let elapsed = 0, previous = 0;
    const variant = action === "attack-punch" ? attacks.current++ : attacks.current;
    const poses = staticPose ? [staticPose] : Object.keys(FELIPE_ART) as FelipePose[];
    const paint = (now: number) => {
      if (cancelled) return;
      if (previous && !pausedRef.current) elapsed += Math.min(32, now - previous);
      previous = now;
      const pose = staticPose ?? felipePose(action, elapsed, variant);
      const source = loaded.get(pose) ?? loaded.get("idle");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (source) {
        if (!portrait && framing === "tight") {
          if (canvas.width !== source.width || canvas.height !== source.height) {
            canvas.width = source.width;
            canvas.height = source.height;
          }
          ctx.drawImage(source, 0, 0);
        } else {
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        if (portrait) {
          const size = Math.min(source.width, source.height * .34);
          ctx.drawImage(source, Math.max(0, (source.width - size) / 2), 0, size, size, 0, 0, canvas.width, canvas.height);
        } else {
          const breathing = !staticPose && action === "idle" ? Math.sin(elapsed / 360) * 3 : 0;
          const walking = action === "advance" || action === "retreat";
          const bounce = walking ? Math.sin(elapsed / 640 * Math.PI * 4) * 5 : breathing;
          const weightShift = walking ? Math.sin(elapsed / 640 * Math.PI * 2) * 7 : 0;
          const height = canvas.height * FELIPE_ART[pose].height;
          const width = source.width / source.height * height;
          const scale = Math.min(1, (canvas.width - 40) / width);
          ctx.drawImage(source, (canvas.width - width * scale) / 2 + weightShift, canvas.height - height * scale - 15 + bounce, width * scale, height * scale);
        }
        ctx.restore();
        }
        canvas.dataset.ready = "true";
        if (!reportedReady) { reportedReady = true; readyCallback.current?.(); }
      }
      if (!staticPose) frame = requestAnimationFrame(paint);
    };
    for (const pose of poses) {
      const art = FELIPE_ART[pose];
      texture(portrait ? "thumbnail" : art.file, "cell" in art ? art.cell : undefined).then(source => {
        if (cancelled) return;
        loaded.set(pose, source);
        if (staticPose) paint(performance.now());
      }).catch(() => { if (!cancelled) canvas.dataset.error = "true"; });
    }
    if (!staticPose) frame = requestAnimationFrame(paint);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [action, staticPose, portrait, framing]);
  return <canvas ref={ref} className={`felipe-canvas${portrait ? " felipe-thumbnail" : ""}`} width={portrait ? 256 : 1800} height={portrait ? 256 : 1536} role={staticPose ? "img" : undefined} aria-label={staticPose ? "Felipe Bleh" : undefined} aria-hidden={staticPose ? undefined : true} />;
}

export function FelipeOwl() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    texture("owl").then(art => {
      const canvas = ref.current;
      if (cancelled || !canvas) return;
      const scale = Math.min(canvas.width / art.width, canvas.height / art.height);
      canvas.getContext("2d")?.drawImage(art, (canvas.width - art.width * scale) / 2, (canvas.height - art.height * scale) / 2, art.width * scale, art.height * scale);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  return <canvas ref={ref} width={640} height={480} aria-hidden="true" />;
}
