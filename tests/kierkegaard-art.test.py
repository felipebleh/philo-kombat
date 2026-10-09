"""Pixel-level regression checks for the user-approved technical cutouts."""
from pathlib import Path
import unittest
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "game"


class KierkegaardArtTests(unittest.TestCase):
    def test_alpha_and_no_background_matte(self):
        for name in ["fullbody-hq", "guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            with self.subTest(pose=name):
                image = Image.open(ROOT / f"kierkegaard-{name}.webp")
                self.assertEqual(image.mode, "RGBA")
                pixels = np.array(image).astype(float)
                alpha = pixels[:, :, 3]
                self.assertTrue((alpha[0] == 0).all() and (alpha[-1] == 0).all())
                self.assertTrue((alpha[:, 0] == 0).all() and (alpha[:, -1] == 0).all())
                self.assertGreater((alpha == 0).mean(), .45)
                self.assertGreater((alpha == 255).sum(), 100000)
                green = pixels[:, :, 1] - np.maximum(pixels[:, :, 0], pixels[:, :, 2])
                self.assertEqual(((green > 42) & (alpha > 20)).sum(), 0)

    def test_pose_baselines_and_clipping(self):
        for name in ["guard-frame", "punch-hq", "kick-hq", "combo-hq"]:
            image = Image.open(ROOT / f"kierkegaard-{name}.webp")
            self.assertEqual(image.size, (1664, 1536))
            left, top, right, bottom = image.getbbox()
            self.assertGreaterEqual(left, 30)
            self.assertGreaterEqual(top, 30)
            self.assertLessEqual(right, 1634)
            self.assertLessEqual(abs(bottom - 1460), 5)


if __name__ == "__main__":
    unittest.main()
