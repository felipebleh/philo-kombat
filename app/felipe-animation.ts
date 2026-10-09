// One animation clock for poses, contact frames and recovery, on either side.
export const FELIPE_WALK_DURATION = 640;
export const FELIPE_TIMING = {
  dialetica: { duration: 560, impact: 220 },
  caverna: { duration: 680, impact: 310 },
  ideias: { duration: 1000, impact: 620 },
  especial: { duration: 1450, impact: 1180 },
  transcender: { duration: 1850, impact: 1480 },
} as const;

export const FELIPE_ART = {
  idle: { file: "idle", height: .92 },
  walkA: { file: "movement", cell: 0, height: .92 },
  walkB: { file: "movement", cell: 1, height: .92 },
  punch: { file: "movement", cell: 2, height: .88 },
  kick: { file: "movement", cell: 3, height: .85 },
  cast: { file: "specials", cell: 0, height: .88 },
  thinker: { file: "specials", cell: 1, height: .66 },
  victory: { file: "specials", cell: 2, height: .97 },
  windup: { file: "specials", cell: 3, height: .90 },
  jump: { file: "jump", height: .76 },
  hit: { file: "hit", height: .90 },
  fallen: { file: "fallen", height: .32 },
  rise: { file: "rise", height: .63 },
  guard: { file: "guard", height: .70 },
  hook: { file: "hook", height: .88 },
} satisfies Record<string, { file: string; cell?: number; height: number }>;
export type FelipePose = keyof typeof FELIPE_ART;
export const felipeAssetUrls = [...new Set(Object.values(FELIPE_ART).map(a => `/game/felipe-${a.file}.webp`)), "/game/felipe-owl.webp"];

// Artwork extends beyond a strict grid at the throwing palm and raised finger.
// These source rectangles preserve each complete silhouette without neighbors.
export function felipeSourceRect(file: string, cell: number | undefined, width: number, height: number): number[] {
  const special = [[0, 0, 555, 702], [560, 0, 464, 705], [0, 700, 512, 836], [512, 768, 512, 768]];
  if (file === "specials" && cell !== undefined) {
    const [x,y,w,h] = special[cell];
    return [x * width / 1024, y * height / 1536, w * width / 1024, h * height / 1536].map(Math.round);
  }
  if (cell === undefined) return [0, 0, width, height];
  return [(cell % 2) * width / 2, Math.floor(cell / 2) * height / 2, width / 2, height / 2].map(Math.round);
}

export function felipePose(action: string, elapsed: number, variant = 0): FelipePose {
  const t = Math.max(0, elapsed);
  switch (action) {
    case "advance": case "retreat": {
      const step = Math.floor((t % FELIPE_WALK_DURATION) / 160);
      return (action === "retreat" ? ["idle", "walkB", "idle", "walkA"] : ["idle", "walkA", "idle", "walkB"])[step] as FelipePose;
    }
    case "attack-punch": return t < 120 ? "windup" : t < 340 ? (variant % 2 ? "hook" : "punch") : t < 450 ? "windup" : "idle";
    case "attack-kick": return t < 140 ? "windup" : t < 430 ? "kick" : t < 570 ? "windup" : "idle";
    case "attack-combo": return t < 100 ? "windup" : t < 280 ? "punch" : t < 470 ? "hook" : t < 730 ? "kick" : t < 880 ? "windup" : "idle";
    case "jump": return t < 90 ? "guard" : t < 500 ? "jump" : t < 610 ? "guard" : "idle";
    case "guard": case "guard-hit": return "guard";
    case "hit": return t < 260 ? "hit" : t < 370 ? "windup" : "idle";
    case "knocked-out": return t < 180 ? "hit" : "fallen";
    case "recover": return t < 420 ? "rise" : "idle";
    case "special-doubt": return t < 240 ? "windup" : t < 1260 ? "cast" : "idle";
    case "special-thinker": return t < 170 ? "guard" : t < 1580 ? "thinker" : t < 1780 ? "rise" : "idle";
    case "victory": return "victory";
    default: return "idle";
  }
}

// Chroma key is applied only to this character's magenta-backed textures.
// Black clothing, the white school emblem and beige trousers remain opaque.
export function felipeKeyAlpha(r: number, g: number, b: number): number {
  const excess = Math.min(r, b) - g;
  return Math.round(255 * (1 - Math.max(0, Math.min(1, (excess - 35) / 65))));
}

export function felipeEffectEndpoints(fromPlayer: boolean, player: number, enemy: number) {
  return { origin: fromPlayer ? player : enemy, target: fromPlayer ? enemy : player, facing: fromPlayer ? 1 : -1 };
}
