from pathlib import Path
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "game"


class DeleuzeArtTests(unittest.TestCase):
    def test_character_cutouts_are_rgba_without_a_green_matte(self):
        names = [
            "deleuze-fullbody-hq.webp",
            "deleuze-punch-hq.webp",
            "deleuze-kick-hq.webp",
            "deleuze-combo-hq.webp",
            "deleuze-victory-hq.webp",
            "guattari-assist-hq.webp",
        ]
        for name in names:
            with self.subTest(asset=name):
                image = Image.open(ROOT / name).convert("RGBA")
                self.assertEqual(image.size, (1400, 1536))
                pixels = np.asarray(image)
                alpha = pixels[:, :, 3]
                self.assertTrue((alpha[0] == 0).all() and (alpha[-1] == 0).all())
                self.assertTrue((alpha[:, 0] == 0).all() and (alpha[:, -1] == 0).all())
                self.assertGreater((alpha == 0).mean(), .38)
                self.assertGreater((alpha == 255).sum(), 100_000)
                edge = (alpha > 8) & (alpha < 248)
                if edge.any():
                    green_excess = pixels[:, :, 1].astype(int) - np.maximum(
                        pixels[:, :, 0], pixels[:, :, 2]
                    ).astype(int)
                    self.assertLess(np.percentile(green_excess[edge], 99), 55)

    def test_all_combat_poses_share_the_same_baseline(self):
        for name in ["fullbody", "punch", "kick", "combo", "victory"]:
            image = Image.open(ROOT / f"deleuze-{name}-hq.webp").convert("RGBA")
            bbox = image.getchannel("A").point(lambda value: 255 if value > 12 else 0).getbbox()
            self.assertIsNotNone(bbox)
            left, top, right, bottom = bbox
            self.assertGreaterEqual(left, 20)
            self.assertGreaterEqual(top, 8)
            self.assertLessEqual(right, 1380)
            self.assertLessEqual(abs(bottom - 1472), 5)

    def test_vincennes_arena_is_widescreen_and_detailed(self):
        with Image.open(ROOT / "arena-vincennes.webp") as image:
            self.assertGreaterEqual(image.width, 1600)
            self.assertAlmostEqual(image.width / image.height, 16 / 9, delta=.015)
        self.assertGreater((ROOT / "arena-vincennes.webp").stat().st_size, 100_000)


if __name__ == "__main__":
    unittest.main()
