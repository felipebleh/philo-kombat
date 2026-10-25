// Native full-body frames, extracted with scripts/extract-hegel-poses.mjs.
export const HEGEL_POSES = {
  "punch": {
    "file": "/game/hegel-poses-v2/punch.webp",
    "width": 501,
    "height": 635,
    "anchorX": 194,
    "soleY": 630,
    "bodyHeight": 0.95
  },
  "kick": {
    "file": "/game/hegel-poses-v2/kick.webp",
    "width": 513,
    "height": 648,
    "anchorX": 136,
    "soleY": 643,
    "bodyHeight": 0.95
  },
  "idle": {
    "file": "/game/hegel-poses-v2/idle.webp",
    "width": 482,
    "height": 753,
    "anchorX": 237,
    "soleY": 748,
    "bodyHeight": 1
  },
  "windup": {
    "file": "/game/hegel-poses-v2/windup.webp",
    "width": 500,
    "height": 704,
    "anchorX": 261,
    "soleY": 699,
    "bodyHeight": 0.97
  },
  "jump": {
    "file": "/game/hegel-poses-v2/jump.webp",
    "width": 455,
    "height": 622,
    "anchorX": 255,
    "soleY": 617,
    "bodyHeight": 0.78
  },
  "guard": {
    "file": "/game/hegel-poses-v2/guard.webp",
    "width": 492,
    "height": 590,
    "anchorX": 252,
    "soleY": 585,
    "bodyHeight": 0.74
  },
  "cast": {
    "file": "/game/hegel-poses-v2/cast.webp",
    "width": 540,
    "height": 657,
    "anchorX": 242,
    "soleY": 652,
    "bodyHeight": 0.94
  },
  "summon": {
    "file": "/game/hegel-poses-v2/summon.webp",
    "width": 458,
    "height": 673,
    "anchorX": 228,
    "soleY": 668,
    "bodyHeight": 0.96
  },
  "victory": {
    "file": "/game/hegel-poses-v2/victory.webp",
    "width": 471,
    "height": 780,
    "anchorX": 217,
    "soleY": 775,
    "bodyHeight": 1.12
  },
  "hook": {
    "file": "/game/hegel-poses-v2/hook.webp",
    "width": 490,
    "height": 631,
    "anchorX": 211,
    "soleY": 626,
    "bodyHeight": 0.94
  },
  "hit": {
    "file": "/game/hegel-poses-v2/hit.webp",
    "width": 424,
    "height": 641,
    "anchorX": 204,
    "soleY": 636,
    "bodyHeight": 0.94
  },
  "fallen": {
    "file": "/game/hegel-poses-v2/fallen.webp",
    "width": 578,
    "height": 166,
    "anchorX": 303,
    "soleY": 161,
    "bodyHeight": 0.27
  },
  "rise": {
    "file": "/game/hegel-poses-v2/rise.webp",
    "width": 562,
    "height": 500,
    "anchorX": 310,
    "soleY": 495,
    "bodyHeight": 0.66
  },
  "walkA": {
    "file": "/game/hegel-poses-v2/walkA.webp",
    "width": 545,
    "height": 740,
    "anchorX": 271,
    "soleY": 735,
    "bodyHeight": 1
  },
  "walkPassA": {
    "file": "/game/hegel-poses-v2/walkPassA.webp",
    "width": 375,
    "height": 736,
    "anchorX": 187,
    "soleY": 731,
    "bodyHeight": 1
  },
  "walkB": {
    "file": "/game/hegel-poses-v2/walkB.webp",
    "width": 589,
    "height": 728,
    "anchorX": 296,
    "soleY": 723,
    "bodyHeight": 1
  },
  "walkPassB": {
    "file": "/game/hegel-poses-v2/walkPassB.webp",
    "width": 373,
    "height": 731,
    "anchorX": 155,
    "soleY": 726,
    "bodyHeight": 1
  }
} as const;
export type HegelPose = keyof typeof HEGEL_POSES;
