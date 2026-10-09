"use client";

import { useEffect, useRef } from "react";
import { visibleArtBounds } from "./art-bounds.mjs";

// Frame existing transparent artwork by its visible silhouette.
export function TrimmedArt({ src, className, alt, onReady }: {
  src: string; className?: string; alt: string; onReady?: () => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const readyCallback = useRef(onReady);
  readyCallback.current = onReady;
  useEffect(() => {
    let cancelled = false;
    const source = new Image();
    source.onload = () => {
      const canvas = ref.current;
      if (cancelled || !canvas) return;
      const buffer = document.createElement("canvas");
      buffer.width = source.naturalWidth;
      buffer.height = source.naturalHeight;
      const context = buffer.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.drawImage(source, 0, 0);
      const pixels = context.getImageData(0, 0, buffer.width, buffer.height).data;
      const bounds = visibleArtBounds(pixels, buffer.width, buffer.height);
      if (!bounds) return;
      canvas.width = bounds.width;
      canvas.height = bounds.height;
      canvas.getContext("2d")?.drawImage(buffer, bounds.left, bounds.top, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
      canvas.dataset.ready = "true";
      readyCallback.current?.();
    };
    source.onerror = () => { if (!cancelled && ref.current) ref.current.dataset.error = "true"; };
    source.src = src;
    return () => { cancelled = true; };
  }, [src]);
  return <canvas ref={ref} width={1} height={1} className={className} role={alt ? "img" : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true} />;
}
