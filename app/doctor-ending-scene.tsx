"use client";

import { useEffect, useRef, useState } from "react";
import { visibleArtBounds } from "./art-bounds.mjs";
import { DOCTOR_ENDING_ASSETS, DOCTOR_ENDING_LINE, DOCTOR_ENDING_TIMING, doctorEndingFrame, endingConfetti, endingViewport } from "./doctor-ending.mjs";
import type { EndingAudioStage } from "./story-ending-scene";

type Stage = "walk" | "honour" | "lightning" | "threat";
export function DoctorEnding({ onReturn, onContinue, onAudioStageChange, onLightning }: {
  onReturn: () => void;
  onContinue: () => void;
  onAudioStageChange: (stage: EndingAudioStage) => void;
  onLightning: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const clock = useRef(0);
  const stageRef = useRef<Stage>("walk");
  const [stage, setStage] = useState<Stage>("walk");
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [letters, setLetters] = useState(0);
  const [replay, setReplay] = useState(0);
  const lightning = useRef(onLightning);
  lightning.current = onLightning;

  useEffect(() => {
    onAudioStageChange(!ready ? "waiting" : stage === "walk" || stage === "honour" ? "celebration" : stage === "lightning" ? "blackout" : "threat");
  }, [onAudioStageChange, ready, stage]);

  useEffect(() => {
    if (stage === "threat") heading.current?.focus();
  }, [stage]);

  useEffect(() => {
    let cancelled = false, raf = 0;
    let previous = 0, painted = 0;
    let width = 1, height = 1, dpr = 1;
    clock.current = 0;
    stageRef.current = "walk";
    setStage("walk"); setReady(false); setFailed(false); setLetters(0);
    const surface = canvas.current;
    if (!surface) return;
    const ctx = surface.getContext("2d");
    if (!ctx) { setFailed(true); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = () => {
      const rect = surface.getBoundingClientRect();
      width = rect.width; height = rect.height;
      dpr = window.devicePixelRatio || 1;
      surface.width = Math.max(1, Math.round(width * dpr));
      surface.height = Math.max(1, Math.round(height * dpr));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(surface); resize();
    const visibility = () => { previous = 0; };
    document.addEventListener("visibilitychange", visibility);
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.decoding = "async";
      img.onload = () => resolve(img); img.onerror = reject; img.src = src;
    });
    Promise.all(DOCTOR_ENDING_ASSETS.map(load)).then(([corridor, ...rest]) => {
      if (cancelled) return;
      const walkers = rest.slice(0, 4), ai = rest[4];
      const buffer = document.createElement("canvas");
      buffer.width = ai.naturalWidth; buffer.height = ai.naturalHeight;
      const scan = buffer.getContext("2d", { willReadFrequently: true });
      scan?.drawImage(ai, 0, 0);
      const bounds = scan && visibleArtBounds(scan.getImageData(0, 0, buffer.width, buffer.height).data, buffer.width, buffer.height);
      setReady(true);
      const render = (now: number) => {
        if (cancelled) return;
        raf = requestAnimationFrame(render);
        if (document.hidden) { previous = 0; return; }
        if (previous) clock.current += Math.min(100, now - previous);
        previous = now;
        if (now - painted < 1000 / 30) return;
        painted = now;
        const f = doctorEndingFrame(clock.current, reduced.matches);
        if (stageRef.current !== f.stage) {
          stageRef.current = f.stage; setStage(f.stage);
          if (f.stage === "lightning") lightning.current();
        }
        const count = reduced.matches ? DOCTOR_ENDING_LINE.length : Math.min(DOCTOR_ENDING_LINE.length, Math.floor(f.threatAge / 32));
        if (f.stage === "threat") setLetters(current => current === count ? current : count);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        const viewport = endingViewport(width, height);
        ctx.save(); ctx.translate(viewport.x, viewport.y); ctx.scale(viewport.scale, viewport.scale);
        ctx.beginPath(); ctx.rect(0, 0, 1672, 941); ctx.clip();
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
        ctx.drawImage(corridor, 0, 0, 1672, 941);
        if (!reduced.matches && (f.stage === "walk" || f.stage === "honour")) {
          // A small cloth ripple on the existing two flag regions, without moving the faces.
          for (const [x, y, w, h] of [[230,20,310,194],[1183,16,325,203]]) {
            for (let stripe = 0; stripe < w; stripe += 4) {
              const displacement = Math.sin(stripe / 65 + now / 650) * 1.1;
              ctx.drawImage(corridor, x + stripe, y, Math.min(4,w-stripe), h, x + stripe, y + displacement, Math.min(4,w-stripe), h);
            }
          }
          for (let i = 0; i < 35; i++) {
            const x = (i * 157.3 + now * .009) % 1672;
            const y = (i * 83.7 - now * .014 + 5000) % 941;
            ctx.fillStyle = `rgba(255,224,155,${.12 + (i % 3) * .08})`;
            ctx.beginPath(); ctx.arc(x, y, 1.2 + i % 2, 0, Math.PI * 2); ctx.fill();
          }
        }
        if (f.stage === "walk" || f.stage === "honour" || f.stage === "lightning") {
          ctx.fillStyle = "rgba(20,12,8,.30)";
          ctx.beginPath(); ctx.ellipse(836, f.feetY - 4, f.height * .17, f.height * .022, 0, 0, Math.PI * 2); ctx.fill();
          const pose = walkers[f.step], w = f.height * pose.naturalWidth / pose.naturalHeight;
          ctx.drawImage(pose, 836 - w / 2, f.feetY - f.height + f.bob, w, f.height);
        }
        if (!reduced.matches && (f.stage === "walk" || f.stage === "honour")) {
          for (let i = 0; i < 80; i++) {
            const paper = endingConfetti(clock.current, i);
            if (!paper.visible || paper.y > 955) continue;
            ctx.save(); ctx.translate(paper.x, paper.y); ctx.rotate(paper.angle);
            ctx.scale(paper.flip, 1); ctx.globalAlpha = .86;
            ctx.fillStyle = paper.color;
            ctx.fillRect(-paper.width / 2, -paper.height / 2, paper.width, paper.height);
            ctx.restore();
          }
        }
        if (f.stage === "lightning" || f.stage === "threat") {
          ctx.fillStyle = `rgba(2,9,24,${f.stage === "threat" ? .76 : .6})`; ctx.fillRect(0,0,1672,941);
          if (f.stage === "threat" && bounds) {
            const appear = reduced.matches ? 1 : Math.min(1, f.threatAge / 1000);
            ctx.save(); ctx.globalAlpha = appear;
            ctx.filter = "drop-shadow(0px 0px 24px rgba(80,194,255,.5))";
            const sourceHeight = bounds.height * .58;
            const w = 820, h = w * sourceHeight / bounds.width;
            ctx.drawImage(ai, bounds.left, bounds.top, bounds.width, sourceHeight, 875, 30 + (1 - appear) * 180, w, h);
            ctx.restore();
          }
          if (f.stage === "lightning" && !reduced.matches) {
            ctx.save(); ctx.globalAlpha = Math.exp(-f.stormAge / 360);
            ctx.strokeStyle = "#d9f6ff"; ctx.lineWidth = 7; ctx.shadowColor = "#5ebeff"; ctx.shadowBlur = 25;
            ctx.beginPath(); ctx.moveTo(1100,0); ctx.lineTo(994,180); ctx.lineTo(1060,170); ctx.lineTo(910,370); ctx.lineTo(985,342); ctx.lineTo(850,610); ctx.stroke();
            ctx.restore();
            ctx.fillStyle = `rgba(221,241,255,${f.flash})`; ctx.fillRect(0,0,1672,941);
          }
        }
        ctx.restore();
        surface.dataset.stage = f.stage;
        surface.dataset.step = String(f.step);
        surface.dataset.ready = "true";
      };
      raf = requestAnimationFrame(render);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true; cancelAnimationFrame(raf); observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [replay]);

  return <section className={`doctor-ending ending-${stage}`} aria-label="Encerramento da campanha Doutor">
    <header className="doctor-ending-heading">
      <span>CAMPANHA DOUTOR CONCLUÍDA</span>
      <h2 ref={heading} tabIndex={-1}>{stage === "threat" ? "NÃO ACABOU!" : "FERIDO. VIVO. LIVRE."}</h2>
    </header>
    <div className="doctor-ending-viewport">
      <div className="doctor-ending-stage">
      <canvas ref={canvas} className="doctor-ending-canvas" role="img" aria-label={stage === "threat" ? "Uma SuperIA gigantesca surge após um raio e interrompe a homenagem a Felipe." : "Felipe caminha de frente, ferido mas vivo, sob papéis picados, por um corredor entre os 14 filósofos resgatados. Hipátia tem a pele morena e os traços de sua personagem no jogo. Há bandeiras FELIPE e placas O conhecimento salva e Ensinar é libertar."} />
      {!ready && <p className="doctor-ending-loading" role="status">{failed ? "A homenagem não carregou. Tente novamente." : "Preparando a homenagem…"}</p>}
      {stage === "threat" && <div className="doctor-ending-threat">
        <span>SUPERINTELIGÊNCIA</span>
        <p aria-label={DOCTOR_ENDING_LINE}><span aria-hidden="true">“{DOCTOR_ENDING_LINE.slice(0, letters)}”</span></p>
        <strong>GRANDE FILÓSOFO</strong>
        <small>O próximo desafio está em preparação.</small>
      </div>}
      </div>
    </div>
    <footer className="doctor-ending-controls">
      <p>{stage === "threat" ? "A jornada continua." : stage === "lightning" ? "Um raio interrompe a homenagem…" : "O conhecimento salva. E ainda há perguntas."}</p>
      <div>
        {stage === "threat" && <button type="button" className="doctor-ending-continue" onClick={onContinue}>MODO GRANDE FILÓSOFO</button>}
        {stage === "threat" || failed ? <button type="button" onClick={() => setReplay(n => n + 1)}>{failed ? "TENTAR NOVAMENTE" : "REVER HOMENAGEM"}</button> : <button type="button" disabled={!ready || stage === "lightning"} onClick={() => { clock.current = DOCTOR_ENDING_TIMING.walk + DOCTOR_ENDING_TIMING.honour; }}>AVANÇAR CENA</button>}
        <button type="button" onClick={onReturn}>VOLTAR AOS NÍVEIS</button>
      </div>
    </footer>
  </section>;
}
