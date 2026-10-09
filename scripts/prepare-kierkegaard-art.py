"""Deterministic sprite extraction, explicitly approved by the user.

Usage: python3 scripts/prepare-kierkegaard-art.py RAW_DIRECTORY QA_DIRECTORY
Keeps source pixels/identity, separates connected poses, and aligns body scale.
"""
from pathlib import Path
import sys

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

SOURCE = Path(sys.argv[1])
QA = Path(sys.argv[2])
DEST = Path(__file__).resolve().parents[1] / "public" / "game"
QA.mkdir(parents=True, exist_ok=True)
FRAME = (1664, 1536)
BASELINE = 1460
ANCHOR = 832


def cutout(rgb, foreground, green=False):
    # Remove isolated background noise; retain only the connected character.
    labels, _ = ndi.label(foreground)
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    foreground = labels == sizes.argmax()
    distance = ndi.distance_transform_edt(foreground)
    alpha = ndi.gaussian_filter(foreground.astype(float), .45)
    alpha[~foreground] = 0
    # Unmatte the outermost pixel using its nearest uncontaminated interior.
    interior = distance >= 2.2
    _, nearest = ndi.distance_transform_edt(~interior, return_indices=True)
    clean = rgb.astype(float).copy()
    edge = foreground & ~interior
    clean[edge] = rgb[nearest[0][edge], nearest[1][edge]]
    if green:
        clean[:, :, 1] = np.minimum(clean[:, :, 1], np.maximum(clean[:, :, 0], clean[:, :, 2]) + 12)
    clean[~foreground] = 0
    return Image.fromarray(np.rint(np.dstack([clean, alpha * 255])).clip(0, 255).astype("uint8"), "RGBA")


def save_frame(image, name, scale, body_anchor, source_baseline):
    bounds = image.getbbox()
    cropped = image.crop(bounds)
    size = tuple(round(v * scale) for v in cropped.size)
    resized = cropped.resize(size, Image.Resampling.LANCZOS)
    x = round(ANCHOR + (bounds[0] - body_anchor) * scale)
    y = round(BASELINE + (bounds[1] - source_baseline) * scale)
    assert x >= 0 and y >= 0 and x + size[0] <= FRAME[0] and y + size[1] <= FRAME[1], (name, x, y, size)
    frame = Image.new("RGBA", FRAME)
    frame.alpha_composite(resized, (x, y))
    frame.save(DEST / name, optimize=True)
    print(name, FRAME, "bounds", frame.getbbox())
    return frame


guard_rgb = np.asarray(Image.open(SOURCE / "kierkegaard-guard-raw.webp").convert("RGB"))
candidate = (guard_rgb.min(2) > 205) & (np.ptp(guard_rgb.astype(float), axis=2) < 27)
labels, _ = ndi.label(candidate)
background_ids = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
background_ids = background_ids[background_ids != 0]
background = np.isin(labels, background_ids)
guard = cutout(guard_rgb, ~background)
guard.save(DEST / "kierkegaard-fullbody-hq.webp", optimize=True)
frames = [save_frame(guard, "kierkegaard-guard-frame.webp", 1, 546, 1460)]

rgb = np.asarray(Image.open(SOURCE / "kierkegaard-attacks-raw.webp").convert("RGB"))
colors = rgb.astype(float)
green = (colors[:, :, 1] > 90) & (colors[:, :, 1] - np.maximum(colors[:, :, 0], colors[:, :, 2]) > 42)
labels, _ = ndi.label(~green)
sizes = np.bincount(labels.ravel())
pose_ids = [i for i in range(1, len(sizes)) if sizes[i] > 10000]
pose_ids.sort(key=lambda i: np.where(labels == i)[1].min())
assert len(pose_ids) == 3
for pose_id, name, anchor, baseline in zip(pose_ids, ["punch", "kick", "combo"], [326, 790, 1416], [797, 790, 790]):
    pose = cutout(rgb, labels == pose_id, green=True)
    frames.append(save_frame(pose, f"kierkegaard-{name}-hq.webp", 1.925, anchor, baseline))

# A static contact sheet makes alpha, unchanged head size and unclipped props inspectable.
sheet = Image.new("RGB", (4 * 416, 410), "#192937")
draw = ImageDraw.Draw(sheet)
for index, (frame, title) in enumerate(zip(frames, ["GUARDA", "SOCO", "CHUTE", "COMBO"])):
    preview = frame.resize((416, 384), Image.Resampling.LANCZOS)
    sheet.paste(preview, (index * 416, 0), preview)
    draw.text((index * 416 + 14, 390), title, fill="white")
sheet.save(QA / "kierkegaard-cutouts-review.webp")
