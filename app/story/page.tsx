"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DISCIPLE_CAMPAIGN,
  STORY_CAMPAIGN_MENU,
  STORY_PROLOGUE,
  getStoryProgressLabel,
} from "../story-mode";
import { StorySequence } from "../story-mode-ui";
import "../story-mode.css";

export default function StoryModePage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [stage, setStage] = useState<"menu" | "prologue" | "encounter">("menu");

  const firstEncounter = DISCIPLE_CAMPAIGN.encounters[0];
  const progressLabel = useMemo(
    () => getStoryProgressLabel(DISCIPLE_CAMPAIGN, 0),
    [],
  );

  if (stage === "prologue") {
    return (
      <main className="story-route-shell">
        <StorySequence
          screens={STORY_PROLOGUE}
          progressLabel="DISCÍPULO — PRÓLOGO"
          onComplete={() => setStage("encounter")}
        />
      </main>
    );
  }

  if (stage === "encounter") {
    return (
      <main className="story-route-shell">
        <StorySequence
          screens={firstEncounter.intro}
          progressLabel={progressLabel}
          onComplete={() => setStage("menu")}
        />
        <div className="story-fight-pending" aria-hidden="true">
          <strong>FELIPE VS. SÓCRATES</strong>
          <span>Integração do combate será ativada quando os assets atuais entrarem no repositório.</span>
        </div>
      </main>
    );
  }

  return (
    <main className="story-menu-shell">
      <button className="story-back" type="button" onClick={() => router.push("/")}>
        ← VOLTAR
      </button>

      <header className="story-menu-heading">
        <span>MODO HISTÓRIA</span>
        <h1>ESCOLHA SUA JORNADA</h1>
        <p>Felipe é o protagonista. Quanto maior o nível, mais longa será a travessia pela História da Filosofia.</p>
      </header>

      <section className="story-tier-grid" aria-label="Campanhas">
        {STORY_CAMPAIGN_MENU.map((tier) => {
          const available = tier.id === "disciple";
          const active = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              className={active ? "is-active" : ""}
              onClick={() => {
                setSelectedTier(tier.id);
                if (available) setStage("prologue");
              }}
              disabled={!available}
            >
              <span>{tier.subtitle}</span>
              <strong>{tier.label}</strong>
              <small>{tier.description}</small>
              {!available && <em>EM CONSTRUÇÃO</em>}
            </button>
          );
        })}
      </section>

      <div className="story-route-preview">
        <span>DISCÍPULO</span>
        <strong>Sócrates → Platão → Aristóteles → Agostinho → Descartes → Locke → Kant → Marx → Nietzsche → Superinteligência</strong>
      </div>
    </main>
  );
}
