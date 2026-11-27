"""Remove faint matte fringe without resizing or repainting the approved art."""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
image = Image.open(root / "public/game/darwin-fullbody-hq.webp").convert("RGBA")
# Opaque face, clothing and cane pixels are preserved verbatim. Only the low
# alpha matte is removed; the remaining edge is smoothly remapped, not jagged.
alpha = image.getchannel("A").point(lambda a: 0 if a < 60 else round((a - 60) * 255 / 195))
image.putalpha(alpha)
image.save(root / "public/game/darwin-fullbody-clean-hq.webp", lossless=True)
