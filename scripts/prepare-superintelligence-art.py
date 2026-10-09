#!/usr/bin/env python3
"""Extract and normalize the Superintelligence renders for combat."""

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


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    mask = image.getchannel("A").point(lambda value: 255 if value > 12 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("render has no usable foreground")
    return bbox


def remove_generated_checker(image: Image.Image) -> Image.Image:
    """Recover a clean alpha matte from ImageGen's occasional checker preview."""
    rgba = np.asarray(image.convert("RGBA"), dtype=np.uint8).copy()
    rgb_float = rgba[:, :, :3].astype(np.float32)
    red, green, blue = np.moveaxis(rgb_float, 2, 0)
    green_excess = green - np.maximum(red, blue)
    edge_green = np.concatenate(
        (green_excess[:24].ravel(), green_excess[-24:].ravel(), green_excess[:, :24].ravel(), green_excess[:, -24:].ravel())
    )
    if np.mean(rgba[:, :, 3] == 0) > .18:
        alpha = rgba[:, :, 3].copy()
    elif float(np.median(edge_green)) > 90:
        distance = np.sqrt(red * red + (255 - green) ** 2 + blue * blue)
        matte = np.clip((distance - 14) / 68, 0, 1)
        matte *= np.clip((118 - green_excess) / 78, 0, 1)
        matte = ndimage.grey_closing(matte, size=(3, 3))
        alpha_image = Image.fromarray(np.uint8(matte * 255), "L").filter(ImageFilter.GaussianBlur(.45))
        alpha = np.asarray(alpha_image, dtype=np.uint8).copy()

        # Suppress reflected green only at the extracted edge. Cyan electrical
        # energy remains intact because its blue channel dominates the test.
        edge = alpha < 252
        spill = np.maximum(green - np.maximum(red, blue), 0)
        rgb_float[:, :, 1][edge] = np.maximum(
            np.minimum(green[edge] - spill[edge] * .9, np.maximum(red[edge], blue[edge]) * 1.08),
            0,
        )
        rgba[:, :, :3] = np.uint8(np.clip(rgb_float, 0, 255))
    else:
        rgb = rgba[:, :, :3].astype(np.int16)
        maximum = rgb.max(axis=2)
        minimum = rgb.min(axis=2)
        chroma = maximum - minimum
        luminance = rgb.mean(axis=2)

        border = np.concatenate(
            (luminance[:28].ravel(), luminance[-28:].ravel(), luminance[:, :28].ravel(), luminance[:, -28:].ravel())
        )
        # The generated preview uses either a medium-gray or a near-white
        # checker.  Colored circuitry plus the robot's dark articulation form
        # a continuous foreground seed; enclosed white armor is restored below.
        light_checker = float(np.median(border)) > 205
        if light_checker:
            seed = (chroma > 7) | (luminance < 192)
        else:
            seed = (chroma > 7) | (luminance < 112) | (luminance > 224)

        seed = ndimage.binary_closing(seed, structure=np.ones((5, 5), dtype=bool))
        labels, count = ndimage.label(seed)
        sizes = np.bincount(labels.ravel())
        keep = np.zeros(count + 1, dtype=bool)
        keep[np.flatnonzero(sizes >= 500)] = True
        keep[0] = False
        subject = keep[labels]
        subject = ndimage.binary_closing(subject, structure=np.ones((7, 7), dtype=bool))
        # Restore enclosed white armor panels without filling the much larger
        # negative spaces between extended limbs.
        holes, hole_count = ndimage.label(~subject)
        hole_sizes = np.bincount(holes.ravel())
        border_holes = np.unique(
            np.concatenate((holes[0], holes[-1], holes[:, 0], holes[:, -1]))
        )
        fill_hole = np.zeros(hole_count + 1, dtype=bool)
        fill_hole[np.flatnonzero(hole_sizes <= 4_000)] = True
        fill_hole[border_holes] = False
        fill_hole[0] = False
        subject |= fill_hole[holes]
        subject = ndimage.binary_dilation(subject, iterations=1)
        alpha_image = Image.fromarray(np.uint8(subject) * 255, "L").filter(ImageFilter.GaussianBlur(.7))
        alpha = np.asarray(alpha_image, dtype=np.uint8).copy()

    alpha[alpha < 4] = 0
    alpha[alpha > 250] = 255
    output = rgba.copy()
    output[:, :, 3] = alpha
    return Image.fromarray(output, "RGBA")


def normalize(image: Image.Image, *, target_height: int = TARGET_HEIGHT) -> Image.Image:
    cutout = remove_generated_checker(image)
    left, top, right, bottom = alpha_bbox(cutout)
    padding = 5
    crop = cutout.crop(
        (
            max(0, left - padding),
            max(0, top - padding),
            min(cutout.width, right + padding),
            min(cutout.height, bottom + padding),
        )
    )
    scale = min(target_height / (bottom - top), (CANVAS[0] - SAFE_MARGIN * 2) / crop.width)
    resized = crop.resize(
        (round(crop.width * scale), round(crop.height * scale)),
        Image.Resampling.LANCZOS,
    )
    frame = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - resized.width) // 2
    y = BASELINE + 6 - resized.height
    if x < SAFE_MARGIN or y < 8 or x + resized.width > CANVAS[0] - SAFE_MARGIN:
        raise ValueError(f"unsafe normalized bounds: {(x, y, x + resized.width, y + resized.height)}")
    frame.alpha_composite(resized, (x, y))
    return frame


def make_thumbnail(image: Image.Image) -> Image.Image:
    left, top, right, bottom = alpha_bbox(image)
    crop = image.crop((left, top, right, bottom))
    upper = crop.crop((0, 0, crop.width, min(crop.height, round(crop.height * .67))))
    scale = min(312 / upper.width, 343 / upper.height)
    resized = upper.resize((round(upper.width * scale), round(upper.height * scale)), Image.Resampling.LANCZOS)
    thumb = Image.new("RGBA", (320, 351), (0, 0, 0, 0))
    thumb.alpha_composite(resized, ((320 - resized.width) // 2, 351 - resized.height))
    return thumb


def save_webp(image: Image.Image, path: Path) -> None:
    image.save(path, "WEBP", quality=89, method=6, exact=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    for name in ("fullbody", "punch", "kick", "combo", "special", "victory", "arena"):
        parser.add_argument(f"--{name}", type=Path)
    parser.add_argument("--punch-windup", type=Path)
    parser.add_argument("--punch-impact", type=Path)
    parser.add_argument("--punch-only", action="store_true")
    parser.add_argument("--output-dir", type=Path, default=Path("public/game"))
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    if args.punch_only:
        if not args.punch_windup or not args.punch_impact:
            parser.error("--punch-only requires --punch-windup and --punch-impact")
        save_webp(
            normalize(Image.open(args.punch_windup)),
            args.output_dir / "superintelligence-punch-windup-hq.webp",
        )
        save_webp(
            normalize(Image.open(args.punch_impact)),
            args.output_dir / "superintelligence-punch-hq.webp",
        )
        return

    required = ("fullbody", "punch", "kick", "combo", "special", "victory", "arena")
    missing = [name for name in required if getattr(args, name) is None]
    if missing:
        parser.error("missing required arguments: " + ", ".join(f"--{name}" for name in missing))

    fullbody = normalize(Image.open(args.fullbody))
    outputs = {
        "superintelligence-fullbody-hq.webp": fullbody,
        "superintelligence-punch-hq.webp": normalize(Image.open(args.punch)),
        "superintelligence-kick-hq.webp": normalize(Image.open(args.kick)),
        "superintelligence-combo-hq.webp": normalize(Image.open(args.combo)),
        "superintelligence-special-hq.webp": normalize(Image.open(args.special)),
        "superintelligence-victory-hq.webp": normalize(Image.open(args.victory)),
        "thumb-superintelligence.webp": make_thumbnail(fullbody),
    }
    for filename, asset in outputs.items():
        save_webp(asset, args.output_dir / filename)

    arena = Image.open(args.arena).convert("RGB")
    target_height = round(arena.width * 9 / 16)
    if arena.height != target_height:
        top = max(0, (arena.height - target_height) // 2)
        arena = arena.crop((0, top, arena.width, min(arena.height, top + target_height)))
    if arena.width > 1920:
        arena.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
    arena.save(args.output_dir / "arena-supercomputer.webp", "WEBP", quality=82, method=6)


if __name__ == "__main__":
    main()
