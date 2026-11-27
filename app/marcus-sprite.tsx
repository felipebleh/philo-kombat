"use client";
import { useEffect, useRef } from "react";
import frames from "./marcus-frame-data.json";

const textures = new Map<number, HTMLImageElement>();
const loading = new Set<number>();
function requestTexture(index: number) {
  if (textures.has(index) || loading.has(index)) return;
  loading.add(index);
  const image = new Image();
  image.onload = () => { textures.set(index, image); loading.delete(index); };
  image.onerror = () => { loading.delete(index); };
  image.src = `/game/marco-aurelio-hd-v2/frame-${String(index).padStart(2, "0")}.webp`;
}
let original: Promise<HTMLImageElement> | undefined;
function loadOriginal() {
  return original ??= new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Sprites de Marco Aurélio indisponíveis"));
    image.src = "/game/marco-aurelio-spritesheet.webp";
  }).catch(error => { original = undefined; throw error; });
}
/** Follow the original CSS animation, retaining its poses and timing. */
export function MarcusSprite() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0, disposed = false, last = "";
    loadOriginal().then(sheet => {
      const node = ref.current, parent = node?.parentElement;
      if (!node || !parent || disposed) return;
      const ctx = node.getContext("2d");
      if (!ctx) return;
      const draw = () => {
        if (disposed) return;
        const rect = node.getBoundingClientRect();
        const dpr = Math.max(2, Math.min(4, Math.ceil(window.devicePixelRatio || 1)));
        const w = Math.max(1, Math.round(rect.width * dpr)), h = Math.max(1, Math.round(rect.height * dpr));
        if (node.width !== w || node.height !== h) { node.width = w; node.height = h; last = ""; }
        const css = getComputedStyle(parent);
        const x = Math.max(0, Math.min(5, Math.round(parseFloat(css.backgroundPositionX || "0") / 20)));
        const y = Math.max(0, Math.min(5, Math.round(parseFloat(css.backgroundPositionY || "0") / 20)));
        const index = y * 6 + x;
        requestTexture(index);
        const texture = textures.get(index), key = `${index}:${w}:${h}:${texture ? "hd" : "original"}`;
        if (key !== last) {
          ctx.clearRect(0, 0, w, h);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.filter = "contrast(1.14) saturate(1.08)";
          if (texture) {
            const box = frames[index];
            ctx.drawImage(texture, box.x / 418 * w, box.y / 418 * h, box.width / 418 * w, box.height / 418 * h);
          } else {
            ctx.drawImage(sheet, x * sheet.naturalWidth / 6, y * sheet.naturalHeight / 6, sheet.naturalWidth / 6, sheet.naturalHeight / 6, 0, 0, w, h);
          }
          node.dataset.ready = "true";
          node.dataset.pose = String(index);
          node.dataset.texture = texture ? "hd" : "original";
          last = key;
        }
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
    }).catch(() => { if (ref.current) ref.current.dataset.error = "true"; });
    return () => { disposed = true; cancelAnimationFrame(frame); };
  }, []);
  return <canvas className="marcus-canvas" ref={ref} aria-hidden="true" />;
}
