from pathlib import Path
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "game"


class FoucaultArtTests(unittest.TestCase):
    def test_cutouts_are_rgba_with_clear_safe_edges(self):
        for name in ["fullbody-hq", "guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            with self.subTest(pose=name):
                with Image.open(ROOT / f"foucault-{name}.webp") as image:
                    self.assertEqual(image.mode, "RGBA")
                    pixels = np.asarray(image)
                    alpha = pixels[:, :, 3]
                    self.assertTrue((alpha[0] == 0).all() and (alpha[-1] == 0).all())
                    self.assertTrue((alpha[:, 0] == 0).all() and (alpha[:, -1] == 0).all())
                    self.assertGreater((alpha == 0).mean(), .45)
                    self.assertGreater((alpha >= 250).sum(), 100_000)

    def test_combat_frames_have_equal_scale_and_no_clipping(self):
        heights = []
        for name in ["guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            with Image.open(ROOT / f"foucault-{name}.webp") as image:
                self.assertEqual(image.size, (2048, 1536))
                left, top, right, bottom = image.getbbox()
                heights.append(bottom - top)
                self.assertGreaterEqual(left, 20)
                self.assertGreaterEqual(top, 20)
                self.assertLessEqual(right, 2028)
                self.assertLessEqual(abs(bottom - 1460), 12)
        self.assertLessEqual(max(heights) - min(heights), 18)

    def test_hospital_panopticon_is_widescreen_and_bright(self):
        with Image.open(ROOT / "arena-hospital-panoptico.webp").convert("RGB") as image:
            self.assertGreaterEqual(image.width, 1600)
            self.assertAlmostEqual(image.width / image.height, 16 / 9, delta=.015)
            luminance = np.asarray(image).mean(axis=2)
            self.assertGreater(float(luminance.mean()), 205)


if __name__ == "__main__":
    unittest.main()
