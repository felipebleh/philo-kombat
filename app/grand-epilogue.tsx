"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EndingAudioStage } from "./story-ending-scene";

type EpilogueScene = {
  art: string;
  description: string;
  clip?: boolean;
  audio?: EndingAudioStage;
  holdMs?: number;
};

const scenes: EpilogueScene[] = [
  { art: "felipe-na-central", description: "Felipe encara a central em chamas. Ele diz: Isso aqui tá desmoronando. Preciso sair!" },
  { art: "pensadores-do-lado-de-fora", description: "Do lado de fora, Turing pergunta o que aconteceu lá dentro. Hannah Arendt pergunta: Onde está o Felipe? Amenemope, Sidarta, Hipátia e Olympe de Gouges observam." },
  { art: "central-desmorona", clip: true, description: "A passarela parte ao meio, as duas torres cedem e a poeira cobre a central de servidores." },
  { art: "chamado-nas-ruinas", description: "Os pensadores procuram por Felipe. Turing grita: Felipe! Responde! Hannah diz: Ele ainda pode estar lá..." },
  { art: "professor", description: "Na sala da abertura, os alunos veem as ruínas no monitor e gritam juntos: Professor!" },
  { art: "socrates", description: "Uma aluna diz ao microfone: Graças ao professor Felipe, descobri que Sócrates preferiu enfrentar a morte a abandonar a filosofia." },
  { art: "descartes", description: "O aluno de óculos diz: Na aula sobre Descartes, eu aprendi que até o que eu vejo com meus próprios olhos pode me enganar." },
  { art: "freire-e-krenak", description: "A aluna de cabelo ondulado diz: Antes das aulas, eu nem sabia que tinha filósofos brasileiros. Aí conheci Paulo Freire e Ailton Krenak." },
  { art: "hipatia", description: "A aluna de cabelo crespo diz: Eu achava que filosofia era só coisa de homem. Hoje, quando me perguntam o nome de um filósofo, eu penso primeiro na Hipátia." },
  { art: "hipatia-pede-silencio", description: "Hipátia ouve uma pedra rolar e ergue a mão para pedir silêncio. Hannah e Turing se voltam para os escombros." },
  { art: "mao-nos-escombros", description: "Uma mão empoeirada agarra o concreto. O relógio é o de Felipe." },
  { art: "felipe-sai-dos-escombros", clip: true, audio: "rescue", description: "A fumaça se dissipa. Felipe atravessa a fresta de pé, diante de Hipátia, Hannah e Turing." },
  { art: "voce-esta-vivo", description: "Hipátia ampara Felipe e pergunta: Você está vivo?" },
  { art: "meus-alunos", description: "Felipe responde: Sim. Preciso voltar para os meus alunos e..." },
  { art: "fazer-a-chamada", description: "Felipe completa: ...fazer a chamada! Os pensadores caem na risada." },
  { art: "volta-a-sala", audio: "celebration", description: "De uniforme verde, Felipe volta à sala da abertura. Os alunos aplaudem e gritam: Você voltou! Você salvou a Filosofia!" },
  { art: "pensamento-filosofico", audio: "celebration", description: "Felipe fala à turma: Por mais que as máquinas possam ser inteligentes, sempre haverá possibilidades para o pensamento filosófico!" },
  { art: "mundo-hoje", audio: "celebration", holdMs: 6500, description: "Manchete do portal Mundo Hoje: Professor salva o pensamento filosófico! Felipe Camargo volta à sala de aula após enfrentar a Superinteligência." },
];

const mediaPath = "/game/grand-epilogue/";

export function GrandEpilogue({ onFinish, onAudioStageChange }: {
  onFinish: () => void;
  onAudioStageChange: (stage: EndingAudioStage) => void;
}) {
  const [index, setIndex] = useState(0);
  const [canAnimate, setCanAnimate] = useState(false);
  const [unavailableClip, setUnavailableClip] = useState<string>();
  const nextButton = useRef<HTMLButtonElement>(null);
  const scene = scenes[index];
  const lastScene = index === scenes.length - 1;
  const imageUrl = `${mediaPath}${scene.art}.webp`;

  const advance = useCallback(() => {
    if (lastScene) onFinish();
    else setIndex((current) => current === index ? current + 1 : current);
  }, [index, lastScene, onFinish]);

  const previous = () => setIndex((current) => Math.max(0, current - 1));

  useEffect(() => {
    nextButton.current?.focus({ preventScroll: true });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setCanAnimate(!preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    onAudioStageChange(scene.audio ?? "waiting");
  }, [onAudioStageChange, scene.audio]);

  useEffect(() => {
    if (!scene.holdMs || !canAnimate) return;
    const timer = window.setTimeout(advance, scene.holdMs);
    return () => window.clearTimeout(timer);
  }, [advance, canAnimate, scene.holdMs]);

  useEffect(() => {
    const nextScene = scenes[index + 1];
    if (!nextScene) return;
    const image = new Image();
    image.src = `${mediaPath}${nextScene.art}.webp`;
  }, [index]);

  const shouldPlay = scene.clip && canAnimate && unavailableClip !== scene.art;
  return (
    <section className="grand-epilogue" aria-label="Epílogo do modo Grande Filósofo" onKeyDown={(event) => {
      if (event.repeat) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        advance();
      }
    }}>
      <button className="grand-epilogue-art" type="button" onClick={advance}
        aria-label={lastScene ? "Ver os créditos" : "Avançar para a próxima cena"}
        aria-describedby="grand-epilogue-description">
        <span className="grand-epilogue-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={scene.art} src={imageUrl} alt="" />
          {shouldPlay && (
            <video key={scene.art} src={`${mediaPath}${scene.art}.mp4`} poster={imageUrl}
              autoPlay muted playsInline aria-hidden="true"
              onEnded={advance} onError={() => setUnavailableClip(scene.art)} />
          )}
        </span>
      </button>
      <p id="grand-epilogue-description" className="grand-epilogue-description" aria-live="polite" aria-atomic="true">{scene.description}</p>
      <nav className="story-art-navigation" aria-label="Navegação do epílogo">
        <button type="button" disabled={index === 0} onClick={previous} aria-keyshortcuts="ArrowLeft">Voltar</button>
        <span className="story-art-count">Cena {index + 1} de {scenes.length}</span>
        <button ref={nextButton} type="button" onClick={advance} aria-keyshortcuts="ArrowRight">
          {lastScene ? "Créditos" : "Avançar"}
        </button>
      </nav>
    </section>
  );
}
