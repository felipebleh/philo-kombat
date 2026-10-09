#!/usr/bin/env python3
"""Normalize generated Foucault art to one stable combat canvas and scale."""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

CANVAS = (2048, 1536)
BASELINE = 1460
TARGET_HEIGHT = 1400


def clean_alpha(image: Image.Image, *, fade_right: bool = False) -> Image.Image:
    rgba = image.convert("RGBA")
    data = np.asarray(rgba).copy()
    alpha_array = data[:, :, 3].astype(np.float32)
    mask = alpha_array > 16
    distance = ndimage.distance_transform_edt(mask)
    rgb = data[:, :, :3].astype(np.float32)
    maximum = rgb.max(axis=2)
    minimum = rgb.min(axis=2)
    saturation = np.divide(maximum - minimum, np.maximum(maximum, 1))
    extreme_fringe = (
        ((rgb[:, :, 0] > 175) & (rgb[:, :, 1] < 95) & (rgb[:, :, 2] < 115)) |
        ((rgb[:, :, 0] > 180) & (rgb[:, :, 1] > 110) & (rgb[:, :, 2] < 85)) |
        ((rgb[:, :, 2] > 170) & (rgb[:, :, 0] < 85) & (rgb[:, :, 1] < 145))
    ) & (distance < 18)
    alpha_array[extreme_fringe] = 0
    colored_edge = (saturation > .72) & (distance < 12)
    alpha_array[colored_edge] *= np.clip(distance[colored_edge] / 12, 0, 1)
    data[:, :, 3] = alpha_array.astype(np.uint8)
    rgba = Image.fromarray(data, "RGBA")
    alpha = rgba.getchannel("A")
    # Contract the generated edge by one pixel before a very small feather. This
    # removes colored matte halos without cutting fingers, glasses or coat hems.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.45))
    if fade_right:
        width, height = rgba.size
        fade = Image.new("L", (width, height), 255)
        pixels = fade.load()
        for x in range(max(0, width - 28), width):
            value = round(255 * (width - 1 - x) / 27)
            for y in range(height):
                pixels[x, y] = value
        from PIL import ImageChops

        alpha = ImageChops.multiply(alpha, fade)
    rgba.putalpha(alpha)
    return rgba


def split_attack_poses(attacks: Image.Image) -> list[Image.Image]:
    data = np.asarray(attacks.convert("RGBA"))
    labels, count = ndimage.label(data[:, :, 3] > 32)
    objects = ndimage.find_objects(labels)
    components: list[tuple[int, int, int, int, int, int]] = []
    for label, slices in enumerate(objects, 1):
        if slices is None:
            continue
        ys, xs = slices
        area = int(np.count_nonzero(labels[slices] == label))
        components.append((area, xs.start, ys.start, xs.stop, ys.stop, label))
    bodies = sorted((item for item in components if item[0] > 100_000), key=lambda item: item[1])
    if len(bodies) != 3:
        raise ValueError(f"expected three principal attack poses, found {len(bodies)}")

    poses: list[Image.Image] = []
    for index, body in enumerate(bodies):
        keep = labels == body[5]
        if index == 2:
            # Preserve detached broken-chain fragments while excluding the kick
            # that overlaps the third pose's horizontal cell.
            for area, left, _top, _right, _bottom, label in components:
                if left >= 1400 and area >= 30:
                    keep |= labels == label
        pose = data.copy()
        pose[:, :, 3] = np.where(keep, pose[:, :, 3], 0)
        poses.append(Image.fromarray(pose, "RGBA"))
    return poses


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    mask = image.getchannel("A").point(lambda value: 255 if value > 32 else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("generated pose has no usable alpha")
    return bbox


def normalize(image: Image.Image, *, fade_right: bool = False) -> Image.Image:
    cleaned = clean_alpha(image, fade_right=fade_right)
    left, top, right, bottom = alpha_bbox(cleaned)
    crop_box = (
        max(0, left - 8),
        max(0, top - 8),
        min(cleaned.width, right + 8),
        min(cleaned.height, bottom + 8),
    )
    crop = cleaned.crop(crop_box)
    scale = TARGET_HEIGHT / (bottom - top)
    resized = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    if resized.width > CANVAS[0] - 80:
        scale = (CANVAS[0] - 80) / resized.width
        resized = resized.resize((CANVAS[0] - 80, round(resized.height * scale)), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    x = (CANVAS[0] - resized.width) // 2
    content_bottom = round((bottom - crop_box[1]) * scale)
    y = BASELINE - content_bottom
    if x < 20 or y < 20 or x + resized.width > CANVAS[0] - 20:
        raise ValueError(f"unsafe normalized bounds: {(x, y, x + resized.width, y + resized.height)}")
    frame.alpha_composite(resized, (x, y))
    return frame


def selection_portrait(image: Image.Image) -> Image.Image:
    cleaned = clean_alpha(image)
    crop = cleaned.crop(alpha_bbox(cleaned))
    scale = min((1024 - 48) / crop.width, (1536 - 48) / crop.height)
    resized = crop.resize((round(crop.width * scale), round(crop.height * scale)), Image.Resampling.LANCZOS)
    frame = Image.new("RGBA", (1024, 1536), (0, 0, 0, 0))
    frame.alpha_composite(resized, ((1024 - resized.width) // 2, 1512 - resized.height))
    return frame


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_dir", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("public/game"))
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    guard = Image.open(args.input_dir / "foucault-guard-raw.webp").convert("RGBA")
    attacks = Image.open(args.input_dir / "foucault-attacks-raw.webp").convert("RGBA")
    poses = split_attack_poses(attacks)

    guard_frame = normalize(guard)
    outputs = {
        "foucault-fullbody-hq.webp": selection_portrait(guard),
        "foucault-guard-frame.webp": guard_frame,
        "foucault-punch-hq.webp": normalize(poses[0]),
        "foucault-kick-hq.webp": normalize(poses[1]),
        "foucault-combo-hq.webp": normalize(poses[2], fade_right=True),
    }
    for filename, image in outputs.items():
        image.save(args.output_dir / filename, optimize=True)

    shutil.copyfile(
        args.input_dir / "arena-hospital-panoptico-raw.webp",
        args.output_dir / "arena-hospital-panoptico.webp",
    )


if __name__ == "__main__":
    main()
