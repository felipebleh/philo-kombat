"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export function ModeLauncher() {
  const pathname = usePathname();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  if (pathname !== "/" || dismissed) return null;

  const openVersus = () => {
    setDismissed(true);
    window.setTimeout(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    }, 0);
  };

  return (
    <section className="mode-launcher" aria-label="Escolha o modo de jogo">
      <div className="mode-launcher-atmosphere" aria-hidden="true" />
      <div className="mode-launcher-card">
        <div className="mode-launcher-brand">
          <span className="mode-launcher-symbol">Φ</span>
          <div>
            <strong>PHILO KOMBAT</strong>
            <span>UMA BATALHA DE IDEIAS</span>
          </div>
        </div>

        <div className="mode-launcher-copy">
          <span>ESCOLHA SEU CAMINHO</span>
          <h1>COMO VOCÊ QUER ENTRAR NA ARENA?</h1>
        </div>

        <div className="mode-launcher-options">
          <button type="button" onClick={() => router.push("/story")}>
            <span className="mode-number">01</span>
            <strong>MODO HISTÓRIA</strong>
            <small>Felipe atravessa a História da Filosofia para recuperar o pensamento.</small>
          </button>

          <button type="button" onClick={openVersus}>
            <span className="mode-number">02</span>
            <strong>MODO VERSUS</strong>
            <small>Escolha livremente os pensadores e entre em combate.</small>
          </button>
        </div>

        <p className="mode-launcher-credit">DESENVOLVIDO PELO PROF. FELIPE CAMARGO</p>
      </div>
    </section>
  );
}
