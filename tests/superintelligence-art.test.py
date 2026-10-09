from pathlib import Path
import unittest

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1] / "public" / "game"


class SuperintelligenceArtTests(unittest.TestCase):
    def test_robot_cutouts_have_real_alpha_and_no_green_matte(self):
        for pose in ["fullbody", "punch-windup", "punch", "kick", "combo", "special", "victory"]:
            with self.subTest(pose=pose), Image.open(ROOT / f"superintelligence-{pose}-hq.webp") as source:
                image = source.convert("RGBA")
                self.assertEqual(image.size, (1400, 1536))
                pixels = np.asarray(image)
                alpha = pixels[:, :, 3]
                self.assertTrue((alpha[0] == 0).all() and (alpha[-1] == 0).all())
                self.assertTrue((alpha[:, 0] == 0).all() and (alpha[:, -1] == 0).all())
                self.assertGreater((alpha == 0).mean(), .65)
                self.assertGreater((alpha == 255).sum(), 100_000)
                green_excess = pixels[:, :, 1].astype(int) - np.maximum(
                    pixels[:, :, 0], pixels[:, :, 2]
                ).astype(int)
                strong_green = (alpha > 32) & (green_excess > 90)
                self.assertLess(strong_green.mean(), .0005)

    def test_all_robot_poses_land_on_the_same_baseline(self):
        for pose in ["fullbody", "punch-windup", "punch", "kick", "combo", "special", "victory"]:
            with Image.open(ROOT / f"superintelligence-{pose}-hq.webp") as source:
                image = source.convert("RGBA")
                bbox = image.getchannel("A").point(lambda value: 255 if value > 12 else 0).getbbox()
                self.assertIsNotNone(bbox)
                left, top, right, bottom = bbox
                self.assertGreaterEqual(left, 20)
                self.assertGreaterEqual(top, 8)
                self.assertLessEqual(right, 1380)
                self.assertLessEqual(abs(bottom - 1472), 5)

    def test_server_core_arena_is_bright_widescreen_and_detailed(self):
        with Image.open(ROOT / "arena-supercomputer.webp") as image:
            self.assertGreaterEqual(image.width, 1600)
            self.assertAlmostEqual(image.width / image.height, 16 / 9, delta=.015)
            luminance = np.asarray(image.convert("L"), dtype=np.uint8)
            self.assertGreater(float(np.mean(luminance)), 95)
        self.assertGreater((ROOT / "arena-supercomputer.webp").stat().st_size, 150_000)


if __name__ == "__main__":
    unittest.main()
