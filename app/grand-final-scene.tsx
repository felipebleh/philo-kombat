import type { CSSProperties } from "react";
import { GRAND_FINAL_SPRITE, type GrandFinalStrike } from "./grand-final";
import "./grand-final.css";

const SMOKE = [8, 24, 44, 62, 77, 92];
const SPARKS = [7, 15, 28, 42, 56, 68, 80, 92, 97];
const ASSEMBLY = [
  [38, 72, -42], [47, 47, 58], [54, 64, -28], [62, 45, 33],
  [71, 49, -51], [79, 61, 36], [88, 51, -20], [94, 72, 45],
];

export function GrandFinalAtmosphere({ assembly = false }: { assembly?: boolean }) {
  return (
    <div className="grand-final-atmosphere" aria-hidden="true">
      {SMOKE.map((x, index) => (
        <i className="grand-final-smoke" key={x} style={{
          left: `${x}%`,
          "--delay": `${-index * 910}ms`,
          "--drift": `${index % 2 ? 40 : -40}px`,
        } as CSSProperties} />
      ))}
      {SPARKS.map((x, index) => (
        <i className="grand-final-spark" key={x} style={{
          left: `${x}%`, top: `${16 + index * 7}%`,
          "--delay": `${-index * 350}ms`,
          "--drift": `${index % 2 ? -32 : 26}px`,
        } as CSSProperties} />
      ))}
      {assembly && ASSEMBLY.map(([x, y, tilt], index) => (
        <i className="grand-final-assembly-piece" key={x} style={{
          left: `${x}%`, top: `${y}%`,
          "--delay": `${index * 115}ms`,
          "--tilt": `${tilt}deg`,
        } as CSSProperties} />
      ))}
    </div>
  );
}

export function GrandFinalBridge() {
  return <div className="grand-final-bridge" aria-hidden="true" />;
}

// The seams follow the joints and let both arms move around the same torso.
const LEFT_JOINT = [
  [34, 0], [34, 20], [41, 22], [43, 31], [37, 40], [33, 47],
  [35, 56], [30, 66], [26, 74], [25, 100],
];
const RIGHT_JOINT = [
  [65, 0], [65, 22], [64, 33], [66, 45], [70, 53], [72, 60],
  [69, 67], [63, 73], [57, 78], [52, 87], [51, 100],
];

const plate = (points: number[][]) => `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;
const ARMOR = [
  { part: "left", outline: plate([[0, 0], ...LEFT_JOINT, [0, 100]]) },
  {
    part: "trunk",
    outline: plate([
      ...LEFT_JOINT.map(([x, y]) => [x - .7, y]),
      ...RIGHT_JOINT.slice().reverse().map(([x, y]) => [x + .7, y]),
    ]),
  },
  { part: "right", outline: plate([...RIGHT_JOINT, [100, 100], [100, 0]]) },
];

export function GrandFinalBody({ position, action, strike, overclocked = false, assembly = false }: {
  position: number;
  action: string;
  strike?: GrandFinalStrike | null;
  overclocked?: boolean;
  assembly?: boolean;
}) {
  const bodyStyle = {
    left: `${position}%`,
    "--windup": `${strike?.windup ?? 680}ms`,
    "--arm-adjustment": `${strike ? Math.max(-7, Math.min(7, strike.lanes[0] - (position - 32))) : 0}cqw`,
  } as CSSProperties;
  return (
    <div
      className={`grand-final-body ${overclocked ? "is-overclocked" : ""} ${assembly ? "is-assembling" : ""}`}
      data-action={action}
      data-strike={strike?.kind}
      data-stage={strike?.stage}
      style={bodyStyle}
      aria-hidden="true"
    >
      <div className="grand-final-body-motion">
        {ARMOR.map(({ part, outline }) => (
          <div className={`grand-final-armor grand-final-armor--${part}`} key={part} style={{ "--armor-outline": outline } as CSSProperties}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={GRAND_FINAL_SPRITE} alt="" draggable={false} />
          </div>
        ))}
        <span className="grand-final-core" />
        <span className="grand-final-eye grand-final-eye--left" />
        <span className="grand-final-eye grand-final-eye--right" />
      </div>
    </div>
  );
}

const STRIKE_CUES = {
  jab: "Salte ou saia da marca",
  hook: "Recue ou defenda",
  slam: "Salte ou saia da faixa marcada",
  debris: "Saia das marcas",
  laser: "Saia da mira ou defenda",
  beam: "Saia da mira ou defenda",
};

export function GrandFinalAttack({ strike }: { strike: GrandFinalStrike }) {
  const isLaser = strike.kind === "laser" || strike.kind === "beam";
  const punches = strike.kind === "jab" || strike.kind === "hook" || strike.kind === "slam";
  const style = {
    "--origin": `${strike.origin}%`,
    "--target": `${strike.lanes[0]}%`,
    "--windup": `${strike.windup}ms`,
  } as CSSProperties;
  return (
    <div className="grand-final-attack" data-kind={strike.kind} data-stage={strike.stage} style={style}>
      <span className="grand-final-warning" role="status">
        {strike.label}
        {strike.stage === "warning" && <small>{STRIKE_CUES[strike.kind]}</small>}
      </span>
      {strike.lanes.map((center) => (
        <div key={center} className="grand-final-lane" aria-hidden="true" style={{ left: `${center}%`, width: `${strike.radius * 2}%` }}>
          <i className="grand-final-mark" />
          {strike.kind === "debris" && <i className="grand-final-falling-metal" />}
          {punches && strike.stage === "impact" && <i className="grand-final-impact-dust" />}
        </div>
      ))}
      {isLaser && (
        <div className="grand-final-lasers" aria-hidden="true">
          {strike.kind === "beam" ? <i className="grand-final-ray grand-final-ray--core" /> : (
            <>
              <i className="grand-final-ray grand-final-ray--left-eye" />
              <i className="grand-final-ray grand-final-ray--right-eye" />
            </>
          )}
        </div>
      )}
    </div>
  );
}
