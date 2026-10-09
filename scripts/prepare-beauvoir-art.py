"""Normalize generated Beauvoir cutouts without altering their illustrated identity."""
from pathlib import Path
import sys

from PIL import Image, ImageDraw

SOURCE = Path(sys.argv[1])
QA = Path(sys.argv[2])
DEST = Path(__file__).resolve().parents[1] / "public" / "game"
QA.mkdir(parents=True, exist_ok=True)
FRAME = (2048, 1536)
BASELINE = 1460
ANCHOR = 960


def frame_pose(image, name, scale, source_anchor, source_baseline):
    bounds = image.getbbox()
    crop = image.crop(bounds)
    resized = crop.resize(
        (round(crop.width * scale), round(crop.height * scale)),
        Image.Resampling.LANCZOS,
    )
    x = round(ANCHOR + (bounds[0] - source_anchor) * scale)
    y = round(BASELINE + (bounds[1] - source_baseline) * scale)
    assert x >= 0 and y >= 0
    assert x + resized.width <= FRAME[0] and y + resized.height <= FRAME[1]
    result = Image.new("RGBA", FRAME)
    result.alpha_composite(resized, (x, y))
    result.save(DEST / name, optimize=True)
    print(name, result.getbbox())
    return result


guard = Image.open(SOURCE / "beauvoir-guard-raw.webp").convert("RGBA")
guard.save(DEST / "beauvoir-fullbody-hq.webp", optimize=True)
frames = [frame_pose(guard, "beauvoir-guard-frame.webp", 1.102, 464, 1415)]

strip = Image.open(SOURCE / "beauvoir-attacks-raw.webp").convert("RGBA")
cell_width = strip.width // 3
specs = [
    ("punch", 0, 343, 683),
    ("kick", cell_width, 928 - cell_width, 683),
    ("combo", cell_width * 2, 1672 - cell_width * 2, 683),
]
for name, left, anchor, baseline in specs:
    right = strip.width if name == "combo" else left + cell_width
    pose = strip.crop((left, 0, right, strip.height))
    frames.append(frame_pose(pose, f"beauvoir-{name}-hq.webp", 2.13, anchor, baseline))

sheet = Image.new("RGB", (4 * 512, 410), "#30162b")
draw = ImageDraw.Draw(sheet)
for index, (image, title) in enumerate(zip(frames, ["GUARDA", "SOCO", "CHUTE", "COMBO"])):
    preview = image.resize((512, 384), Image.Resampling.LANCZOS)
    sheet.paste(preview, (index * 512, 0), preview)
    draw.text((index * 512 + 14, 390), title, fill="white")
sheet.save(QA / "beauvoir-cutouts-review.webp")
