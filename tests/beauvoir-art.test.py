from pathlib import Path
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "game"


class BeauvoirArtTests(unittest.TestCase):
    def test_cutouts_are_rgba_without_visible_matte(self):
        for name in ["fullbody-hq", "guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            with self.subTest(pose=name):
                image = Image.open(ROOT / f"beauvoir-{name}.webp")
                self.assertEqual(image.mode, "RGBA")
                pixels = np.asarray(image)
                alpha = pixels[:, :, 3]
                self.assertTrue((alpha[0] == 0).all() and (alpha[-1] == 0).all())
                self.assertTrue((alpha[:, 0] == 0).all() and (alpha[:, -1] == 0).all())
                self.assertGreater((alpha == 0).mean(), .45)
                self.assertGreater((alpha == 255).sum(), 100_000)

    def test_combat_frames_are_aligned_and_unclipped(self):
        for name in ["guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            image = Image.open(ROOT / f"beauvoir-{name}.webp")
            self.assertEqual(image.size, (2048, 1536))
            left, top, right, bottom = image.getbbox()
            self.assertGreaterEqual(left, 8)
            self.assertGreaterEqual(top, 30)
            self.assertLessEqual(right, 2040)
            self.assertLessEqual(abs(bottom - 1460), 11)

    def test_paris_arena_is_widescreen(self):
        image = Image.open(ROOT / "arena-paris-beauvoir.webp")
        self.assertGreaterEqual(image.width, 1600)
        self.assertAlmostEqual(image.width / image.height, 16 / 9, delta=.015)


if __name__ == "__main__":
    unittest.main()
