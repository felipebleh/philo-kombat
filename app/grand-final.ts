export const GRAND_FINAL_SPRITE = "/game/superia-grand-final-colossus.webp";

const STRIKES = {
  jab: { label: "SOCO DE TITÂNIO", windup: 680, recovery: 670, radius: 8, damage: 14, sound: "punch" },
  hook: { label: "GANCHO HIDRÁULICO", windup: 800, recovery: 750, radius: 11, damage: 17, sound: "combo" },
  slam: { label: "PANCADA DE TITÂNIO", windup: 670, recovery: 690, radius: 12, damage: 15, sound: "kick" },
  debris: { label: "CHUVA DE SUCATA", windup: 900, recovery: 710, radius: 4.5, damage: 13, sound: "combo" },
  laser: { label: "LASER DUPLO", windup: 760, recovery: 740, radius: 5.5, damage: 13, sound: "special1" },
  beam: { label: "RAIO DO NÚCLEO", windup: 850, recovery: 850, radius: 7, damage: 20, sound: "special2" },
} as const;

type StrikeKind = keyof typeof STRIKES;
const STRIKE_PATTERN = ["jab", "laser", "hook", "debris", "slam"] as const;

export type GrandFinalStrike = {
  kind: StrikeKind;
  stage: "warning" | "impact";
  origin: number;
  lanes: number[];
  windup: number;
  recovery: number;
  radius: number;
  damage: number;
  label: string;
  sound: (typeof STRIKES)[StrikeKind]["sound"];
};

export function grandFinalNextStrike(turn: number, processing: number): StrikeKind {
  return processing >= 100 ? "beam" : STRIKE_PATTERN[turn % STRIKE_PATTERN.length];
}

export function grandFinalStrike(kind: StrikeKind, origin: number, target: number, overclocked: boolean): GrandFinalStrike {
  const strike = STRIKES[kind];
  const center = Math.max(13, Math.min(57, target));
  let lanes = [center];
  if (kind === "slam") lanes = [origin - 22];
  if (kind === "jab") lanes = [Math.max(origin - 46, center)];
  if (kind === "hook") lanes = [Math.max(origin - 34, center)];
  if (kind === "debris") lanes = [center - 12, center, center + 12];
  return {
    ...strike,
    kind,
    stage: "warning",
    origin,
    lanes,
    windup: strike.windup - (overclocked ? 130 : 0),
    recovery: strike.recovery - (overclocked ? 90 : 0),
    damage: strike.damage + (overclocked ? 3 : 0),
  };
}

export function grandFinalStrikeHits(strike: GrandFinalStrike, position: number, airborne: boolean) {
  if ((strike.kind === "slam" || strike.kind === "jab") && airborne) return false;
  return strike.lanes.some((center) => Math.abs(center - position) <= strike.radius);
}
