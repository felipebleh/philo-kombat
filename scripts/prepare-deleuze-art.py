#!/usr/bin/env python3
"""Key and normalize the generated Deleuze/Guattari art for combat."""

from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

CANVAS = (1400, 1536)
BASELINE = 1472
TARGET_HEIGHT = 1410
SAFE_MARGIN = 24


def remove_green(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert("RGB"), dtype=np.float32)
    red, green, blue = np.moveaxis(rgb, 2, 0)
    distance = np.sqrt(red * red + (255 - green) ** 2 + blue * blue)
    green_excess = green - np.maximum(red, blue)

    # The generated matte is near #00ff00. A soft threshold preserves hair,
    # glasses and the crutch holes while removing green spill at the edge.
    alpha = np.clip((distance - 16) / 68, 0, 1)
    alpha *= np.clip((120 - green_excess) / 82, 0, 1)
    alpha = np.maximum(alpha, (green_excess < 34).astype(np.float32))
    alpha = ndimage.grey_closing(alpha, size=(3, 3))
    alpha_image = Image.fromarray(np.uint8(alpha * 255), "L")
    alpha_image = alpha_image.filter(ImageFilter.GaussianBlur(.45))
    alpha_array = np.asarray(alpha_image, dtype=np.uint8).copy()
    alpha_array[alpha_array < 3] = 0
    alpha_array[alpha_array > 251] = 255

    output_rgb = rgb.copy()
    edge = alpha_array < 252
    spill = np.maximum(green - np.maximum(red, blue), 0)
    output_rgb[:, :, 1][edge] = np.maximum(
        np.minimum(green[edge] - spill[edge] * .9, np.maximum(red[edge], blue[edge]) * 1.08),
        0,
    )
    rgba = np.dstack((np.uint8(np.clip(output_rgb, 0, 255)), alpha_array))
    return Image.fromarray(rgba, "RGBA")


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    mask = image.getchannel("A").point(lambda value: 255 if value > 12 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("generated pose has no usable foreground")
    return bbox


def normalize(image: Image.Image, *, target_height: int = TARGET_HEIGHT) -> Image.Image:
    keyed = remove_green(image)
    left, top, right, bottom = alpha_bbox(keyed)
    crop = keyed.crop((max(0, left - 5), max(0, top - 5), min(keyed.width, right + 5), min(keyed.height, bottom + 5)))
    scale = min(
        target_height / (bottom - top),
        (CANVAS[0] - SAFE_MARGIN * 2) / crop.width,
    )
    resized = crop.resize(
        (round(crop.width * scale), round(crop.height * scale)),
        Image.Resampling.LANCZOS,
    )
    frame = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - resized.width) // 2
    # The padded crop retains roughly six transparent pixels below the keyed
    # subject. Offset that padding so every visible foot lands on BASELINE.
    y = BASELINE + 6 - resized.height
    if x < SAFE_MARGIN or y < 8 or x + resized.width > CANVAS[0] - SAFE_MARGIN:
        raise ValueError(f"unsafe normalized bounds: {(x, y, x + resized.width, y + resized.height)}")
    frame.alpha_composite(resized, (x, y))
    return frame


def make_thumbnail(image: Image.Image) -> Image.Image:
    left, top, right, bottom = alpha_bbox(image)
    crop = image.crop((left, top, right, bottom))
    # Selection thumbnails favor the face and torso while retaining the crutch.
    upper = crop.crop((0, 0, crop.width, min(crop.height, round(crop.height * .69))))
    scale = min(312 / upper.width, 343 / upper.height)
    resized = upper.resize((round(upper.width * scale), round(upper.height * scale)), Image.Resampling.LANCZOS)
    thumb = Image.new("RGBA", (320, 351), (0, 0, 0, 0))
    thumb.alpha_composite(resized, ((320 - resized.width) // 2, 351 - resized.height))
    return thumb


def save_webp(image: Image.Image, path: Path) -> None:
    image.save(path, "WEBP", quality=88, method=6, exact=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fullbody", type=Path, required=True)
    parser.add_argument("--punch", type=Path, required=True)
    parser.add_argument("--kick", type=Path, required=True)
    parser.add_argument("--combo", type=Path, required=True)
    parser.add_argument("--victory", type=Path, required=True)
    parser.add_argument("--guattari", type=Path, required=True)
    parser.add_argument("--arena", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, default=Path("public/game"))
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    fullbody = normalize(Image.open(args.fullbody))
    outputs = {
        "deleuze-fullbody-hq.webp": fullbody,
        "deleuze-punch-hq.webp": normalize(Image.open(args.punch)),
        "deleuze-kick-hq.webp": normalize(Image.open(args.kick)),
        "deleuze-combo-hq.webp": normalize(Image.open(args.combo)),
        "deleuze-victory-hq.webp": normalize(Image.open(args.victory)),
        "guattari-assist-hq.webp": normalize(Image.open(args.guattari), target_height=1320),
        "thumb-deleuze.webp": make_thumbnail(fullbody),
    }
    for filename, image in outputs.items():
        save_webp(image, args.output_dir / filename)

    arena = Image.open(args.arena).convert("RGB")
    if abs(arena.width / arena.height - 16 / 9) > .02:
        target_height = round(arena.width * 9 / 16)
        top = max(0, (arena.height - target_height) // 2)
        arena = arena.crop((0, top, arena.width, top + target_height))
    if arena.width > 1920:
        arena.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
    arena.save(args.output_dir / "arena-vincennes.webp", "WEBP", quality=82, method=6)


if __name__ == "__main__":
    main()
