/** Visible alpha bounds for existing RGBA artwork. */
export function visibleArtBounds(pixels, width, height) {
  let left = width, right = -1, top = height, bottom = -1;
  for (let offset = 3; offset < pixels.length; offset += 4) {
    if (pixels[offset] < 80) continue;
    const pixel = (offset - 3) / 4;
    const x = pixel % width, y = Math.floor(pixel / width);
    left = Math.min(left, x); right = Math.max(right, x);
    top = Math.min(top, y); bottom = Math.max(bottom, y);
  }
  return right < left ? null : { left, top, width: right - left + 1, height: bottom - top + 1 };
}
