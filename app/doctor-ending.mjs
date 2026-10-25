export const DOCTOR_ENDING_LINE = "Não acabou! Você precisa de muito para se tornar um GRANDE FILÓSOFO!";
export const DOCTOR_ENDING_TIMING = Object.freeze({ walk: 12000, honour: 4000, lightning: 900 });
export const DOCTOR_ENDING_ASSETS = Object.freeze([
  "/game/doctor-ending-corridor-v2.webp",
  ...Array.from({ length: 4 }, (_, i) => `/game/doctor-ending-walk-0${i}-v1.webp`),
  "/game/superintelligence-fullbody-hq.webp",
]);

const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
export function doctorEndingFrame(elapsed, reducedMotion = false) {
  const t = Math.max(0, elapsed);
  const { walk, honour, lightning } = DOCTOR_ENDING_TIMING;
  const stormAt = walk + honour;
  /** @type {"walk" | "honour" | "lightning" | "threat"} */
  const stage = t < walk ? "walk" : t < stormAt ? "honour" : t < stormAt + lightning ? "lightning" : "threat";
  const progress = reducedMotion ? 1 : clamp(t / walk);
  const step = reducedMotion || t >= walk ? 1 : Math.floor(t / 300) % 4;
  return {
    stage, step, progress,
    feetY: 625 + progress * 292,
    height: 310 + progress * 360,
    bob: reducedMotion || t >= walk ? 0 : Math.sin(t / 300 * Math.PI) * 2.4,
    stormAge: Math.max(0, t - stormAt),
    threatAge: Math.max(0, t - stormAt - lightning),
    // One brief lightning bloom, with no repeated strobing.
    flash: stage === "lightning" && !reducedMotion ? .54 * Math.exp(-Math.max(0, t - stormAt - 65) / 130) : 0,
  };
}

// Lightweight paper pieces fall through the central aisle, in front of Felipe.
export function endingConfetti(elapsed, index) {
  const age = elapsed - (index * 197 % 4800);
  const cycle = Math.max(0, age) % 11000;
  return {
    visible: age >= 0,
    x: 350 + (index * 137 % 1000) + Math.sin(cycle / 800 + index) * 38,
    y: -40 + cycle * (.078 + index % 5 * .009),
    angle: cycle / (450 + index % 4 * 100) + index,
    flip: .2 + .8 * Math.abs(Math.cos(cycle / 350 + index)),
    width: 5 + index % 4 * 2,
    height: 9 + index % 3 * 3,
    color: ["#f5d475", "#fff1d2", "#7196db", "#d69a68", "#f8fbff"][index % 5],
  };
}

/** Letterbox the complete artwork in any viewport; never crop signs or faces. */
export function endingViewport(width, height) {
  const scale = Math.min(width / 1672, height / 941);
  return { scale, x: (width - 1672 * scale) / 2, y: (height - 941 * scale) / 2 };
}
