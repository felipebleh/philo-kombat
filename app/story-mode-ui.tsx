"use client";

import { useMemo, useState } from "react";
import type { StoryScreen } from "./story-mode";

type StorySequenceProps = {
  screens: StoryScreen[];
  progressLabel?: string;
  onComplete: () => void;
};

export function StorySequence({
  screens,
  progressLabel,
  onComplete,
}: StorySequenceProps) {
  const [screenIndex, setScreenIndex] = useState(0);
  const screen = screens[screenIndex];

  const positionLabel = useMemo(() => {
    if (!screens.length) return "";
    return `${screenIndex + 1}/${screens.length}`;
  }, [screenIndex, screens.length]);

  if (!screen) {
    return (
      <button className="story-empty-sequence" type="button" onClick={onComplete}>
        CONTINUAR
      </button>
    );
  }

  const advance = () => {
    if (screenIndex >= screens.length - 1) {
      onComplete();
      return;
    }
    setScreenIndex((current) => current + 1);
  };

  return (
    <button
      type="button"
      className={`story-screen story-screen-${screen.kind}`}
      data-background={screen.background ?? "default"}
      onClick={advance}
      aria-label="Avançar história"
    >
      <span className="story-screen-topline">
        <span>{progressLabel}</span>
        <span>{positionLabel}</span>
      </span>

      <span className="story-screen-content">
        {screen.eyebrow && (
          <span className="story-screen-eyebrow">{screen.eyebrow}</span>
        )}

        {screen.speaker && (
          <strong className="story-screen-speaker">{screen.speaker}</strong>
        )}

        <span className="story-screen-text">{screen.text}</span>
      </span>

      <span className="story-screen-continue">CLIQUE PARA CONTINUAR</span>
    </button>
  );
}
