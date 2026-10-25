"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TrimmedArt } from "./trimmed-art";
import { ENDING_TIMING, SUPERINTELLIGENCE_RETURN_LINE } from "./story-ending.mjs";

export type EndingAudioStage = "waiting" | "celebration" | "blackout" | "threat";
export function StoryEnding({ onReturn, onAudioStageChange }: { onReturn: () => void; onAudioStageChange?: (stage: EndingAudioStage) => void }) {
  const [stage, setStage] = useState<"celebration" | "blackout" | "threat" | "book">("celebration");
  const [groupReady, setGroupReady] = useState(false);
  const [felipeReady, setFelipeReady] = useState(false);
  const ready = groupReady && felipeReady;
  const reportGroupReady = useCallback(() => setGroupReady(true), []);
  const reportFelipeReady = useCallback(() => setFelipeReady(true), []);
  const [letters, setLetters] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const bookPanel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    onAudioStageChange?.(stage === "book" ? "threat" : stage === "threat" || ready ? stage : "waiting");
  }, [onAudioStageChange, ready, stage]);
  useEffect(() => {
    if (!ready || stage === "threat" || stage === "book") return;
    const timer = window.setTimeout(() => setStage(stage === "celebration" ? "blackout" : "threat"),
      stage === "celebration" ? ENDING_TIMING.celebration : ENDING_TIMING.blackout);
    return () => window.clearTimeout(timer);
  }, [ready, stage]);
  useEffect(() => {
    if (stage !== "threat") return;
    heading.current?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setLetters(SUPERINTELLIGENCE_RETURN_LINE.length);
      return;
    }
    const started = performance.now();
    const typing = window.setInterval(() => {
      const count = Math.min(SUPERINTELLIGENCE_RETURN_LINE.length, Math.floor((performance.now() - started) / 36));
      setLetters(count);
      if (count === SUPERINTELLIGENCE_RETURN_LINE.length) window.clearInterval(typing);
    }, 36);
    return () => window.clearInterval(typing);
  }, [stage]);
  useEffect(() => {
    if (stage === "book") bookPanel.current?.focus();
    if (stage !== "threat") return;
    const poster = new Image();
    poster.decoding = "async";
    poster.src = "/game/story-book-promo.webp";
  }, [stage]);

  if (stage === "book") return (
    <section className="overlay story-book-overlay" aria-label="A aventura continua nas páginas: Histórias que pensam">
      <div className="story-book-panel" ref={bookPanel} tabIndex={-1}>
        <img
          className="story-book-art"
          src="/game/story-book-promo.webp"
          width={1672}
          height={941}
          alt="Felipe apresenta Histórias que pensam: Filosofando através de contos. Algumas aventuras continuam nas páginas de um livro. Vamos continuar essa jornada?"
        />
        <div className="story-book-actions">
          <a href="https://a.co/d/0cXWi78j" target="_blank" rel="noopener noreferrer">CONHECER O LIVRO NA AMAZON</a>
          <button type="button" onClick={onReturn}>CONTINUAR A JORNADA</button>
        </div>
      </div>
    </section>
  );

  return (
    <section className={`overlay story-ending-overlay finale-stage-${stage} ${ready ? "finale-assets-ready" : ""}`} aria-label="Final da campanha Discípulo">
      <div className="story-ending-panel">
        <header className="story-ending-heading">
          <span>CAMPANHA DISCÍPULO CONCLUÍDA</span>
          <h2 ref={heading} tabIndex={-1}>{stage === "threat" ? "A GUERRA AINDA NÃO TERMINOU" : "O PENSAMENTO ESTÁ LIVRE"}</h2>
        </header>
        <div className="story-ending-stage">
          <div className="finale-celebration-layer" role="img" aria-label="Sócrates, Platão, Aristóteles, Agostinho, Descartes, Locke, Kant, Marx e Nietzsche comemoram felizes, lançando Felipe para cima." aria-hidden={stage !== "celebration"}>
            <TrimmedArt className="finale-philosophers" src="/game/story-ending-philosophers-v1.webp" alt="" onReady={reportGroupReady} />
            <div className="finale-felipe" aria-hidden="true"><TrimmedArt className="finale-felipe-art" src="/game/story-ending-felipe-toss-v1.webp" alt="" onReady={reportFelipeReady} /></div>
          </div>
          <div className="finale-darkness" aria-hidden="true" />
          {stage === "threat" && <div className="finale-superintelligence">
            <TrimmedArt className="finale-ai-art" src="/game/superintelligence-fullbody-hq.webp" alt="A Superinteligência reaparece na escuridão, com seu núcleo azul brilhando." />
            <div className="finale-ai-dialogue">
              <span>SUPERINTELIGÊNCIA</span>
              <blockquote aria-label={SUPERINTELLIGENCE_RETURN_LINE}><span aria-hidden="true">“{SUPERINTELLIGENCE_RETURN_LINE.slice(0, letters)}”</span></blockquote>
              <strong>MODO DOUTOR DESBLOQUEADO</strong>
            </div>
          </div>}
        </div>
        <footer className="story-ending-controls">
          {stage === "threat" ? <>
            <p>Conquista de Doutor registrada. A próxima campanha está em preparação.</p>
            <button type="button" onClick={() => setStage("book")}>CONTINUAR</button>
          </> : <>
            <p>{stage === "blackout" ? "O sinal está voltando…" : "Os filósofos recuperaram seus pensamentos."}</p>
            <button type="button" onClick={() => setStage("threat")}>AVANÇAR CENA</button>
          </>}
        </footer>
      </div>
    </section>
  );
}
