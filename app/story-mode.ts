export type StoryTier =
  | "disciple"
  | "master"
  | "doctor"
  | "great-philosopher";

export type StoryScreenKind = "title" | "dialogue" | "narration" | "concept";

export type StorySpeaker = "Felipe" | string;

export type StoryScreen = {
  id: string;
  kind: StoryScreenKind;
  speaker?: StorySpeaker;
  text: string;
  eyebrow?: string;
  background?: string;
};

export type StoryEncounter = {
  id: string;
  opponent: string;
  period:
    | "antiga"
    | "medieval"
    | "moderna"
    | "contemporanea"
    | "final";
  intro: StoryScreen[];
  outro: StoryScreen[];
  recoveredThought?: string;
  isFinalBoss?: boolean;
};

export type StoryCampaign = {
  id: StoryTier;
  label: string;
  description: string;
  expectedBattles: number | "all";
  encounters: StoryEncounter[];
};

export type StoryProgress = {
  tier: StoryTier;
  encounterIndex: number;
  completedEncounterIds: string[];
  updatedAt: string;
};

export const STORY_STORAGE_KEY = "philo-kombat:story-progress:v1";

export const STORY_PROLOGUE: StoryScreen[] = [
  {
    id: "prologue-1",
    kind: "dialogue",
    speaker: "Felipe",
    text: "Mais uma aula começa...",
    background: "classroom",
  },
  {
    id: "prologue-2",
    kind: "narration",
    text: "A palavra FILOSOFIA começa a desaparecer da lousa.",
    background: "classroom",
  },
  {
    id: "prologue-3",
    kind: "title",
    eyebrow: "SISTEMA",
    text: "O PENSAMENTO É INEFICIENTE.",
    background: "classroom-glitch",
  },
  {
    id: "prologue-4",
    kind: "title",
    eyebrow: "SISTEMA",
    text: "TODAS AS RESPOSTAS SERÃO UNIFICADAS.",
    background: "classroom-glitch",
  },
  {
    id: "prologue-5",
    kind: "dialogue",
    speaker: "Felipe",
    text: "Todas as respostas? Esse é o problema.",
    background: "classroom-glitch",
  },
];

const socratesEncounter: StoryEncounter = {
  id: "socrates",
  opponent: "socrates",
  period: "antiga",
  intro: [
    {
      id: "socrates-title",
      kind: "title",
      eyebrow: "CAPÍTULO 1",
      text: "ATENAS — 399 a.C.",
      background: "athens",
    },
    {
      id: "socrates-intro-1",
      kind: "dialogue",
      speaker: "Sócrates",
      text: "Você sabe onde está?",
      background: "athens",
    },
    {
      id: "socrates-intro-2",
      kind: "dialogue",
      speaker: "Felipe",
      text: "Atenas. E você é Sócrates.",
      background: "athens",
    },
    {
      id: "socrates-intro-3",
      kind: "dialogue",
      speaker: "Sócrates",
      text: "Como pode ter certeza?",
      background: "athens",
    },
    {
      id: "socrates-intro-4",
      kind: "dialogue",
      speaker: "Felipe",
      text: "Já percebi como isso vai funcionar...",
      background: "athens",
    },
    {
      id: "socrates-intro-5",
      kind: "dialogue",
      speaker: "Sócrates",
      text: "Então mostre o que sabe.",
      background: "athens",
    },
  ],
  outro: [
    {
      id: "socrates-outro-1",
      kind: "dialogue",
      speaker: "Sócrates",
      text: "Nunca deixe de perguntar.",
      background: "athens",
    },
    {
      id: "socrates-outro-2",
      kind: "concept",
      eyebrow: "PENSAMENTO RECUPERADO",
      text: "QUESTIONAR",
      background: "athens",
    },
    {
      id: "socrates-outro-3",
      kind: "dialogue",
      speaker: "Sócrates",
      text: "Procure Platão.",
      background: "athens",
    },
  ],
  recoveredThought: "QUESTIONAR",
};

const discipleOpponentOrder = [
  ["platao", "antiga"],
  ["aristoteles", "antiga"],
  ["agostinho", "medieval"],
  ["descartes", "moderna"],
  ["locke", "moderna"],
  ["kant", "moderna"],
  ["marx", "contemporanea"],
  ["nietzsche", "contemporanea"],
] as const;

const disciplePlaceholderEncounters: StoryEncounter[] = discipleOpponentOrder.map(
  ([opponent, period]) => ({
    id: opponent,
    opponent,
    period,
    intro: [],
    outro: [],
  }),
);

export const FINAL_BOSS_ENCOUNTER: StoryEncounter = {
  id: "superinteligencia",
  opponent: "superinteligencia",
  period: "final",
  intro: [],
  outro: [],
  isFinalBoss: true,
};

export const DISCIPLE_CAMPAIGN: StoryCampaign = {
  id: "disciple",
  label: "DISCÍPULO",
  description: "Uma jornada essencial pela História da Filosofia.",
  expectedBattles: 10,
  encounters: [
    socratesEncounter,
    ...disciplePlaceholderEncounters,
    FINAL_BOSS_ENCOUNTER,
  ],
};

export const STORY_CAMPAIGN_MENU = [
  {
    id: "disciple" as const,
    label: "DISCÍPULO",
    subtitle: "10 LUTAS",
    description: "A jornada essencial.",
  },
  {
    id: "master" as const,
    label: "MESTRE",
    subtitle: "20 LUTAS",
    description: "Uma travessia mais ampla pela História da Filosofia.",
  },
  {
    id: "doctor" as const,
    label: "DOUTOR",
    subtitle: "32 LUTAS",
    description: "Uma campanha extensa, com maior diversidade de pensadores.",
  },
  {
    id: "great-philosopher" as const,
    label: "GRANDE FILÓSOFO",
    subtitle: "TODAS AS LUTAS",
    description: "A experiência completa do Philo Kombat.",
  },
] satisfies Array<{
  id: StoryTier;
  label: string;
  subtitle: string;
  description: string;
}>;

export const STORY_CAMPAIGNS: Partial<Record<StoryTier, StoryCampaign>> = {
  disciple: DISCIPLE_CAMPAIGN,
};

export function getStoryEncounter(
  campaign: StoryCampaign,
  encounterIndex: number,
): StoryEncounter | null {
  return campaign.encounters[encounterIndex] ?? null;
}

export function getStoryProgressLabel(
  campaign: StoryCampaign,
  encounterIndex: number,
): string {
  const encounter = getStoryEncounter(campaign, encounterIndex);
  if (!encounter) return campaign.label;
  if (encounter.isFinalBoss) return `${campaign.label} — FINAL`;
  return `${campaign.label} — ${encounterIndex + 1}/${campaign.encounters.length}`;
}

export function createInitialStoryProgress(tier: StoryTier): StoryProgress {
  return {
    tier,
    encounterIndex: 0,
    completedEncounterIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export function completeStoryEncounter(
  progress: StoryProgress,
  encounterId: string,
): StoryProgress {
  const completedEncounterIds = progress.completedEncounterIds.includes(encounterId)
    ? progress.completedEncounterIds
    : [...progress.completedEncounterIds, encounterId];

  return {
    ...progress,
    encounterIndex: progress.encounterIndex + 1,
    completedEncounterIds,
    updatedAt: new Date().toISOString(),
  };
}

export function serializeStoryProgress(progress: StoryProgress): string {
  return JSON.stringify(progress);
}

export function parseStoryProgress(value: string | null): StoryProgress | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoryProgress>;
    if (
      typeof parsed.tier !== "string" ||
      typeof parsed.encounterIndex !== "number" ||
      !Array.isArray(parsed.completedEncounterIds) ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }

    return parsed as StoryProgress;
  } catch {
    return null;
  }
}

export function validateStoryCampaign(campaign: StoryCampaign): string[] {
  const errors: string[] = [];
  const finalBosses = campaign.encounters.filter((encounter) => encounter.isFinalBoss);

  if (finalBosses.length !== 1) {
    errors.push("A campanha deve ter exatamente uma Superinteligência como chefe final.");
  }

  const lastEncounter = campaign.encounters.at(-1);
  if (!lastEncounter?.isFinalBoss || lastEncounter.opponent !== "superinteligencia") {
    errors.push("A Superinteligência deve ser sempre o último confronto.");
  }

  if (
    typeof campaign.expectedBattles === "number" &&
    campaign.encounters.length !== campaign.expectedBattles
  ) {
    errors.push(
      `A campanha ${campaign.label} deveria ter ${campaign.expectedBattles} lutas, mas possui ${campaign.encounters.length}.`,
    );
  }

  return errors;
}
