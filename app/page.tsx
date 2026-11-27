"use client";

import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CombatButton } from "./combat-button";
import "./mobile-combat.css";
import { FelipeSprite, FelipeOwl } from "./felipe-sprite";
import { CyborgSprite } from "./cyborg-sprite";
import { CyborgSpecial, CyborgAtmosphere } from "./cyborg-effects";
import { FELIPE_WALK_DURATION, FELIPE_TIMING, felipeEffectEndpoints } from "./felipe-animation";
import { SidartaSprite } from "./sidarta-sprite";
import { SidartaEffects } from "./sidarta-effects";
import { ConfuciusSprite } from "./confucius-sprite";
import { MarcusSprite } from "./marcus-sprite";
import { SmithSpecial } from "./smith-special";
import { SmithSprite } from "./smith-sprite";
import { ConfuciusEffects } from "./confucius-effects";
import { confuciusLunge } from "./confucius-motion";
import "./confucius.css";
import sidartaHdArt from "./sidarta-hd-art.json";
import { AmenemopeSprite } from "./amenemope-sprite";
import { AmenemopeEffects } from "./amenemope-effects";
import { AMENEMOPE_TIMING, AMENEMOPE_WORD_RANGE, amenemopeLunge } from "./amenemope-motion";
import { AverroesSprite } from "./averroes-sprite";
import { ThomasSprite } from "./thomas-sprite";
import { MachiavelliSprite } from "./machiavelli-sprite";
import { GalileoSprite } from "./galileo-sprite";
import { KierkegaardMotionSprite } from "./kierkegaard-sprite";
import { KierkegaardSpecial, KierkegaardEitherCuts, KierkegaardImpact } from "./kierkegaard-effects";
import { faithLeapPose, faithLanding, FAITH_TIMING, KIERKEGAARD_WALK_DURATION } from "./kierkegaard-motion";
import { FreudSoftHitflashFilter, FreudCigarSmoke, FreudGroundShadow, FreudDreamMist, FreudDeathWave, FreudDeathImpact } from "./freud-effects";
import { combatMovementRate, FREUD_DREAM_SLOW_MS } from "./freud-motion";
import { HegelSprite } from "./hegel-sprite";
import { HegelWorldSpirit } from "./hegel-world-spirit-effect";
import { SchopenhauerCaneTrail, SchopenhauerPendulum, SchopenhauerSoftFlash } from "./schopenhauer-effects";
import "./schopenhauer.css";
import { RousseauAssembly, RousseauBrokenChains } from "./rousseau-effects";
import { HobbesSovereign, HobbesShield, HobbesChains, HobbesWolfAura, HobbesPactJump } from "./hobbes-effects";
import { DeleuzeGuattari } from "./deleuze-guattari";
import { DeleuzeEffects, type DeleuzeContact } from "./deleuze-effects";
import { DeleuzeMotionSprite } from "./deleuze-motion-sprite";
import { FoucaultEffects, type FoucaultContact } from "./foucault-effects";
import { FoucaultMotionSprite } from "./foucault-motion-sprite";
import { FanonEffects, type FanonContact } from "./fanon-effects";
import { FanonMotionSprite } from "./fanon-motion-sprite";
import { FreireEffects, type FreireContact } from "./freire-effects";
import { FreireMotionSprite } from "./freire-motion-sprite";
import { BeauvoirEffects, type BeauvoirContact } from "./beauvoir-effects";
import { BeauvoirMotionSprite } from "./beauvoir-motion-sprite";
import { ArendtEffects, type ArendtContact } from "./arendt-effects";
import { ArendtGuard } from "./arendt-guard";
import { WittgensteinEffects, type WittContact } from "./wittgenstein-effects";
import { WittgensteinSprite } from "./wittgenstein-sprite";
import { DarwinMotionSprite } from "./darwin-motion-sprite";
import { FighterWalk } from "./fighter-walk";
import { fighterThumbnailArt, preloadFightAssets } from "./fighter-assets";
import {
  STORY_POST_FIGHT_SCENES,
  STORY_ENCOUNTERS,
  STORY_INTRO_SCENES,
  STORY_STORAGE_KEY,
  DOCTOR_ENCOUNTERS,
  DOCTOR_FINAL_ENCOUNTER_INDEX,
  doctorIntroScenes,
  DOCTOR_POST_FIGHT_SCENES,
  DOCTOR_OPPONENT_ORDER,
  nextDoctorEncounter,
  storyImagePreloadUrls,
} from "./story-mode.mjs";
import { GRAND_ENCOUNTERS, GRAND_INTRO_SCENES, GRAND_POST_FIGHT_SCENES, GRAND_FINAL_ENCOUNTER_INDEX, nextGrandEncounter, readGrandProgress, readGrandUnlocked, unlockGrand, saveGrandProgress, completeGrand } from "./grand-story.mjs";
import { GRAND_FINAL_SPRITE, grandFinalNextStrike, grandFinalStrike, grandFinalStrikeHits, type GrandFinalStrike } from "./grand-final";
import { GrandFinalAtmosphere, GrandFinalAttack, GrandFinalBody, GrandFinalBridge } from "./grand-final-scene";
import { StoryEnding, type EndingAudioStage } from "./story-ending-scene";
import { DoctorEnding } from "./doctor-ending-scene";
import { GrandEpilogue } from "./grand-epilogue";
import { readDoctorUnlocked, unlockDoctor } from "./story-ending.mjs";
import { StoryQuizTerminal } from "./story-quiz-terminal";
import { createStoryQuiz, answerStoryQuiz, advanceStoryQuiz, quizRecoveryIndex, nextEncounterAfterReview, QUIZ_RECOVERY_KEY, FINAL_ENCOUNTER_INDEX } from "./story-quiz.mjs";
import { DARWIN_WALK_DURATION } from "./darwin-walk-mesh";
import { OlympeMotionSprite } from "./olympe-motion-sprite";
import { OLYMPE_WALK_DURATION } from "./olympe-walk-mesh";
import { BEAUVOIR_WALK_DURATION } from "./beauvoir-walk-mesh";
import { FOUCAULT_WALK_DURATION } from "./foucault-walk-mesh";
import { ARENDT_WALK_DURATION } from "./arendt-walk-mesh";
import { WITTGENSTEIN_WALK_DURATION } from "./wittgenstein-walk-mesh";
import { ANGELA_DAVIS_WALK_DURATION } from "./angela-davis-walk-mesh";
import { PAULO_FREIRE_WALK_DURATION } from "./paulo-freire-walk-mesh";
import { FANON_WALK_DURATION } from "./fanon-walk-mesh";
import { KRENAK_WALK_DURATION } from "./krenak-walk-mesh";
import { TURING_WALK_DURATION } from "./turing-walk-mesh";
import { DELEUZE_WALK_DURATION } from "./deleuze-walk-mesh";
import { SUPERINTELLIGENCE_WALK_DURATION } from "./superintelligence-walk-mesh";
import { DESCARTES_WALK_DURATION } from "./descartes-walk-mesh";
import { AUGUSTINE_WALK_DURATION } from "./augustine-walk-mesh";
import { AUDIO_SETTINGS_KEY, readAudioSettings, soundtrackForPhase, SoundtrackPlayer } from "./soundtrack.mjs";
import { CombatAudio, MOVE_SOUNDS, defeatSound } from "./combat-audio.mjs";
import { ATTACK_KEYS, InputBuffer, CombatClock, attackConnects, recoveryDuration, HYPATIA_SCALE, AVERROES_SCALE, THOMAS_SCALE, MACHIAVELLI_SCALE, FREUD_SCALE, cpuDecisionInterval, cpuAttackRecovery, minimumFighterGap, resolveFighterPushboxes } from "./combat-controls";

type Phase =
  | "intro"
  | "mode-select"
  | "story-intro"
  | "story-tier-select"
  | "story-scene"
  | "story-recap"
  | "story-quiz"
  | "story-complete"
  | "doctor-complete"
  | "grand-epilogue"
  | "grand-complete"
  | "doctor-checkpoint"
  | "select"
  | "loading"
  | "dialogue"
  | "playing"
  | "finishing"
  | "round-won"
  | "round-lost"
  | "won"
  | "lost"
  | "draw";
type GameMode = "versus" | "story";
type StorySceneKind = "intro" | "outro";
type FighterId =
  | "felipe-cyborg"
  | "felipe"
  | "amenemope"
  | "homero"
  | "tales"
  | "socrates"
  | "diogenes"
  | "aristotle"
  | "sidarta"
  | "confucius"
  | "marcus"
  | "hypatia"
  | "agostinho"
  | "averroes"
  | "thomas"
  | "machiavelli"
  | "galileo"
  | "descartes"
  | "locke"
  | "hobbes"
  | "rousseau"
  | "smith"
  | "kant"
  | "hegel"
  | "schopenhauer"
  | "marx"
  | "freud"
  | "darwin"
  | "olympe"
  | "kierkegaard"
  | "beauvoir"
  | "foucault"
  | "arendt"
  | "wittgenstein"
  | "angela-davis"
  | "paulo-freire"
  | "fanon"
  | "krenak"
  | "turing"
  | "deleuze"
  | "superintelligence"
  | "plato"
  | "nietzsche";
type MoveName =
  | "dialetica"
  | "caverna"
  | "ideias"
  | "especial"
  | "transcender";

const TOUCH_MOVE_LABELS: Record<MoveName, string> = {
  dialetica: "Soco",
  caverna: "Chute",
  ideias: "Combo",
  especial: "Especial",
  transcender: "Supremo",
};

const articulatedWalkDuration = (fighter: FighterId) =>
  (fighter === "felipe" || fighter === "felipe-cyborg" || fighter === "sidarta" || fighter === "confucius") ? FELIPE_WALK_DURATION :
  fighter === "agostinho" ? AUGUSTINE_WALK_DURATION :
  fighter === "descartes" ? DESCARTES_WALK_DURATION :
  fighter === "darwin" ? DARWIN_WALK_DURATION :
    fighter === "olympe" ? OLYMPE_WALK_DURATION :
      fighter === "kierkegaard" ? KIERKEGAARD_WALK_DURATION :
        fighter === "beauvoir" ? BEAUVOIR_WALK_DURATION :
          fighter === "foucault" ? FOUCAULT_WALK_DURATION :
            fighter === "arendt" ? ARENDT_WALK_DURATION :
              fighter === "wittgenstein" ? WITTGENSTEIN_WALK_DURATION :
                fighter === "angela-davis" ? ANGELA_DAVIS_WALK_DURATION :
                  fighter === "paulo-freire" ? PAULO_FREIRE_WALK_DURATION :
                    fighter === "fanon" ? FANON_WALK_DURATION :
                      fighter === "krenak" ? KRENAK_WALK_DURATION :
                        fighter === "turing" ? TURING_WALK_DURATION :
                          fighter === "deleuze" ? DELEUZE_WALK_DURATION :
                            fighter === "superintelligence" ? SUPERINTELLIGENCE_WALK_DURATION : null;
type ArenaEffect =
  | "cyborg-certainty"
  | "cyborg-swarm"
  | "felipe-doubt"
  | "felipe-thinker"
  | "plato-solid"
  | "plato-good"
  | "nietzsche-hammer"
  | "nietzsche-overman"
  | "maat-feather"
  | "maat-scale"
  | "homer-arrow"
  | "homer-wrath"
  | "tales-water"
  | "tales-eclipse"
  | "socrates-maieutic"
  | "socrates-hemlock"
  | "diogenes-dog"
  | "diogenes-chicken"
  | "aristotle-syllogism"
  | "aristotle-mean"
  | "sidarta-awakening"
  | "sidarta-dharma"
  | "confucius-ren"
  | "confucius-li"
  | "marcus-citadel"
  | "marcus-logos"
  | "hypatia-astrolabe"
  | "hypatia-conics"
  | "agostinho-illumination"
  | "agostinho-city"
  | "averroes-intellect"
  | "averroes-commentator"
  | "thomas-ox"
  | "thomas-first-mover"
  | "machiavelli-prince"
  | "machiavelli-fortune"
  | "galileo-fall"
  | "galileo-moons"
  | "descartes-demon"
  | "descartes-cogito"
  | "locke-tabula"
  | "locke-rights"
  | "hobbes-wolf"
  | "hobbes-leviathan"
  | "rousseau-savage"
  | "rousseau-general-will"
  | "smith-invisible-hand"
  | "smith-wealth"
  | "kant-imperative"
  | "kant-sublime"
  | "hegel-dialectic"
  | "hegel-world-spirit"
  | "schopenhauer-blind-will"
  | "schopenhauer-pendulum"
  | "marx-engels"
  | "marx-revolution"
  | "freud-dreams"
  | "freud-death-drive"
  | "darwin-natural-selection"
  | "darwin-tree-of-life"
  | "olympe-declaration"
  | "olympe-tribune"
  | "kierkegaard-anxiety"
  | "kierkegaard-faith-leap"
  | "beauvoir-other"
  | "beauvoir-becoming"
  | "foucault-panopticon"
  | "foucault-biopower"
  | "arendt-banality"
  | "arendt-natality"
  | "wittgenstein-poker"
  | "wittgenstein-language"
  | "angela-davis-chains"
  | "angela-davis-struggle"
  | "paulo-banking"
  | "paulo-liberating-book"
  | "fanon-mask"
  | "fanon-condemned"
  | "krenak-world"
  | "krenak-watu"
  | "turing-enigma"
  | "turing-universal-machine"
  | "deleuze-rhizome"
  | "deleuze-mille-plateaux"
  | "superintelligence-algorithm"
  | "superintelligence-noosphere"
  | null;

type CombatMessage = {
  id: number;
  side: "player" | "enemy" | "center";
  text: string;
  kind: "damage" | "concept" | "miss" | "special";
};

type Move = {
  label: string;
  key: string;
  action: string;
  damage: number;
  logos: number;
  range: number;
  cooldown: number;
  concept: string;
  shout: string;
};

const PLATO_MOVES: Record<
  MoveName,
  Move
> = {
  dialetica: {
    label: "Soco Dialético",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "O soco representa o primeiro movimento da dialética: uma ideia se afirma e obriga o adversário a responder.",
    shout: "SOCO DIALÉTICO",
  },
  caverna: {
    label: "Chute da Caverna",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "O chute rompe as correntes da caverna: sair das aparências exige virar o corpo e o pensamento para outra direção.",
    shout: "CHUTE DA CAVERNA",
  },
  ideias: {
    label: "Combo das Formas",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Soco e chute formam uma sequência ordenada: para Platão, aquilo que é múltiplo no mundo sensível participa de uma Forma.",
    shout: "COMBO DAS FORMAS",
  },
  especial: {
    label: "Sólido Platônico",
    key: "L",
    action: "special-solid",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1100,
    concept:
      "O dodecaedro simboliza a ordem inteligível do cosmos e reúne, em sua forma regular, matemática, beleza e razão.",
    shout: "SÓLIDO PLATÔNICO",
  },
  transcender: {
    label: "Ideia do Bem",
    key: "U",
    action: "special-good",
    damage: 38,
    logos: -100,
    range: 100,
    cooldown: 1800,
    concept:
      "A Ideia do Bem ilumina todas as outras Ideias: como o Sol, torna possível conhecer o verdadeiro e orientar a ação justa.",
    shout: "IDEIA DO BEM",
  },
};

const NIETZSCHE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco do Aforismo",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "O aforismo desfere uma ideia curta e intensa, capaz de atingir certezas antes que elas consigam se proteger.",
    shout: "SOCO DO AFORISMO",
  },
  caverna: {
    label: "Chute da Superação",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Superar-se é deixar de obedecer passivamente aos valores que diminuem a potência da vida.",
    shout: "CHUTE DA SUPERAÇÃO",
  },
  ideias: {
    label: "Combo da Vontade",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "A vontade de potência não busca apenas conservar-se: ela cria, transforma e ultrapassa seus próprios limites.",
    shout: "COMBO DA VONTADE",
  },
  especial: {
    label: "Filosofia a Marteladas",
    key: "L",
    action: "special-hammer",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1100,
    concept:
      "Nietzsche usa o martelo para testar os ídolos: quando uma certeza soa oca, ela precisa ser submetida à crítica.",
    shout: "FILOSOFIA A MARTELADAS",
  },
  transcender: {
    label: "Além-do-Homem",
    key: "U",
    action: "special-overman",
    damage: 38,
    logos: -100,
    range: 100,
    cooldown: 1800,
    concept:
      "O Übermensch, ou além-do-homem, supera valores herdados e transforma a própria vida em criação: sua potência avança e atinge aquilo que tenta detê-la.",
    shout: "ALÉM-DO-HOMEM",
  },
};

const AMENEMOPE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Toque do Escriba",
    key: "J",
    action: "attack-punch",
    damage: 5,
    logos: 10,
    range: 22 * 1.35,
    cooldown: 390,
    concept:
      "A mão aberta interrompe sem brutalidade: a palavra medida contém o impulso antes que ele se transforme em violência.",
    shout: "TOQUE DO ESCRIBA",
  },
  caverna: {
    label: "Passo do Nilo",
    key: "K",
    action: "attack-kick",
    damage: 9,
    logos: 16,
    range: 27,
    cooldown: 850,
    concept:
      "Como o curso do Nilo, o movimento é preciso e econômico: Amenemope desvia a força agressiva em vez de imitá-la.",
    shout: "PASSO DO NILO",
  },
  ideias: {
    label: "Palavra Medida",
    key: "I",
    action: "attack-combo",
    damage: 12,
    logos: 24,
    range: AMENEMOPE_WORD_RANGE,
    cooldown: 1600,
    concept:
      "A palavra justa não é a mais ruidosa. Hieróglifos projetam a palma adiante, medindo a distância e encadeando o debate.",
    shout: "PALAVRA MEDIDA",
  },
  especial: {
    label: "Pena de Maat",
    key: "L",
    action: "special-feather",
    damage: 26,
    logos: -100,
    range: 100,
    cooldown: 1100,
    concept:
      "A pena representa Maat: verdade, justiça e equilíbrio. Diante dela, a força sem medida perde seu poder.",
    shout: "PENA DE MAAT",
  },
  transcender: {
    label: "Balança de Maat",
    key: "U",
    action: "special-scale",
    damage: 42,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "O coração é confrontado com o peso de seus próprios atos. Quanto maior a agressividade, mais severo o julgamento.",
    shout: "BALANÇA DE MAAT",
  },
};

const HOMERO_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Canto do Aedo",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 12,
    range: 23,
    cooldown: 420,
    concept:
      "O aedo preservava a memória coletiva pela voz. Cada verso transforma o passado em força presente.",
    shout: "CANTO DO AEDO",
  },
  caverna: {
    label: "Passo de Odisseu",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 18,
    range: 28,
    cooldown: 900,
    concept:
      "Odisseu vence menos pela força que pela astúcia: recuar, observar e surpreender também é uma forma de coragem.",
    shout: "PASSO DE ODISSEU",
  },
  ideias: {
    label: "Canto das Musas",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 30,
    range: 31,
    cooldown: 1700,
    concept:
      "Invocar as Musas é reconhecer que nenhuma narrativa nasce sozinha: a memória de um povo fala pela voz do poeta.",
    shout: "CANTO DAS MUSAS",
  },
  especial: {
    label: "Flecha de Ulisses",
    key: "L",
    action: "special-arrow",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1150,
    concept:
      "Como no retorno a Ítaca, a flecha de Ulisses une precisão, inteligência e reconhecimento no instante decisivo.",
    shout: "FLECHA DE ULISSES",
  },
  transcender: {
    label: "Ira de Aquiles",
    key: "U",
    action: "special-wrath",
    damage: 40,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "A ira de Aquiles move a Ilíada: uma força heroica capaz de conquistar glória, mas também de revelar o preço humano da cólera.",
    shout: "IRA DE AQUILES",
  },
};

const TALES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Toque da Physis",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 12,
    range: 23,
    cooldown: 420,
    concept:
      "Physis é a natureza investigada por suas próprias causas. O golpe abre espaço para uma explicação sem recorrer imediatamente aos deuses.",
    shout: "TOQUE DA PHYSIS",
  },
  caverna: {
    label: "Passo de Mileto",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 18,
    range: 28,
    cooldown: 900,
    concept:
      "Mileto era porto de encontros, viagens e observação. O movimento combina abertura ao mundo e mudança de perspectiva.",
    shout: "PASSO DE MILETO",
  },
  ideias: {
    label: "Ciclo da Natureza",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 30,
    range: 31,
    cooldown: 1700,
    concept:
      "A natureza se transforma sem perder sua unidade. Cada golpe procura no múltiplo um princípio comum.",
    shout: "CICLO DA NATUREZA",
  },
  especial: {
    label: "Jato da Arché",
    key: "L",
    action: "special-water",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1150,
    concept:
      "Para Tales, a água é a arché: o princípio originário que sustenta e atravessa todas as coisas.",
    shout: "JATO DA ARCHÉ",
  },
  transcender: {
    label: "Eclipse de Hális",
    key: "U",
    action: "special-eclipse",
    damage: 40,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "A tradição atribui a Tales a previsão do eclipse de 585 a.C., símbolo da passagem da admiração celeste à investigação racional.",
    shout: "ECLIPSE DE HÁLIS",
  },
};

const SOCRATES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Ironia",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "A ironia socrática desfaz a falsa segurança: reconhecer a própria ignorância é o primeiro passo para investigar.",
    shout: "SOCO DA IRONIA",
  },
  caverna: {
    label: "Passo do Exame",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Uma vida sem exame não merece ser vivida. O movimento força o adversário a rever a posição que ocupava.",
    shout: "PASSO DO EXAME",
  },
  ideias: {
    label: "Combo do Diálogo",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Pergunta, resposta e nova pergunta formam um combate cooperativo contra a contradição.",
    shout: "COMBO DO DIÁLOGO",
  },
  especial: {
    label: "Maiêutica",
    key: "L",
    action: "special-maieutic",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1150,
    concept:
      "Como uma parteira, Sócrates não entrega respostas prontas: suas perguntas ajudam o interlocutor a trazer uma ideia à luz.",
    shout: "MAIÊUTICA",
  },
  transcender: {
    label: "Cicuta",
    key: "U",
    action: "special-hemlock",
    damage: 40,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "Condenado por Atenas, Sócrates bebeu a cicuta e manteve até o fim a fidelidade ao exame filosófico e às leis da cidade.",
    shout: "CICUTA",
  },
};

const ARISTOTLE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Golpe da Causa",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "Investigar é perguntar por que algo existe e se transforma. O golpe abre a análise das causas que explicam o real.",
    shout: "GOLPE DA CAUSA",
  },
  caverna: {
    label: "Passo Peripatético",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "No Liceu, pensar também era caminhar. O movimento liga observação, experiência e reflexão.",
    shout: "PASSO PERIPATÉTICO",
  },
  ideias: {
    label: "Combo das Quatro Causas",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Matéria, forma, causa eficiente e finalidade compõem uma explicação completa daquilo que existe.",
    shout: "QUATRO CAUSAS",
  },
  especial: {
    label: "Silogismo",
    key: "L",
    action: "special-syllogism",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1150,
    concept:
      "Duas premissas corretamente relacionadas conduzem a uma conclusão necessária. A força está na estrutura do raciocínio.",
    shout: "SILOGISMO",
  },
  transcender: {
    label: "Justo Meio",
    key: "U",
    action: "special-mean",
    damage: 40,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "A virtude não é mediocridade, mas a medida adequada entre dois extremos viciosos, encontrada pela prudência.",
    shout: "JUSTO MEIO",
  },
};

const DIOGENES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Tapa do Desprezo",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "Diógenes atacava as convenções com franqueza brutal. O gesto reduz a pose do adversário ao tamanho que ela realmente possui.",
    shout: "TAPA DO DESPREZO",
  },
  caverna: {
    label: "Chute da Autarquia",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Autarquia é bastar-se a si mesmo. Quem precisa de pouco torna-se difícil de controlar.",
    shout: "CHUTE DA AUTARQUIA",
  },
  ideias: {
    label: "Combo da Parrhesía",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Parrhesía é a coragem de dizer a verdade sem ornamentação, mesmo quando ela ofende o poder e a vaidade.",
    shout: "PARRHESÍA",
  },
  especial: {
    label: "Soltem os Cães",
    key: "L",
    action: "special-dog",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1150,
    concept:
      "O nome cinismo deriva de kynikós, “como um cão”. Diógenes transforma o insulto em liberdade indomesticável.",
    shout: "SOLTEM OS CÃES",
  },
  transcender: {
    label: "Eis o Homem!",
    key: "U",
    action: "special-chicken",
    damage: 40,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "Ao apresentar uma galinha depenada, Diógenes ridicularizou a definição platônica do ser humano como bípede sem penas.",
    shout: "EIS O HOMEM!",
  },
};


const CONFUCIUS_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Palma da Reciprocidade",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 29,
    cooldown: 420,
    concept:
      "A reciprocidade começa por uma medida simples: não impor ao outro aquilo que não desejaríamos para nós mesmos.",
    shout: "RECIPROCIDADE",
  },
  caverna: {
    label: "Passo da Retidão",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Yi é agir com retidão: escolher o que é justo, mesmo quando o interesse imediato aponta para outra direção.",
    shout: "PASSO DA RETIDÃO",
  },
  ideias: {
    label: "Combo das Cinco Relações",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "A vida ética se forma nas relações. Cada vínculo exige responsabilidade, respeito e uma resposta adequada ao outro.",
    shout: "CINCO RELAÇÕES",
  },
  especial: {
    label: "Ren — Elo da Humanidade",
    key: "L",
    action: "special-ren",
    damage: 28,
    logos: -100,
    range: 100,
    cooldown: 1200,
    concept:
      "Ren é benevolência, empatia e humanidade. Só nos tornamos plenamente humanos por meio do cuidado com o outro.",
    shout: "REN — HUMANIDADE",
  },
  transcender: {
    label: "Li — Ordem dos Ritos",
    key: "U",
    action: "special-li",
    damage: 42,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "Li transforma respeito em forma compartilhada. Os ritos não são aparência vazia: educam os gestos e organizam a convivência.",
    shout: "LI — ORDEM DOS RITOS",
  },
};

const MARCUS_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Punho da Disciplina",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 29,
    cooldown: 420,
    concept:
      "A disciplina estoica começa no governo dos próprios impulsos. O punho só avança depois que o julgamento assumiu o comando.",
    shout: "PUNHO DA DISCIPLINA",
  },
  caverna: {
    label: "Passo do Dever",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Cumprir o dever é agir de acordo com a razão, sem depender do aplauso, do medo ou da recompensa.",
    shout: "PASSO DO DEVER",
  },
  ideias: {
    label: "Combo das Meditações",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 39,
    cooldown: 1750,
    concept:
      "Marco Aurélio escrevia para corrigir a si mesmo. Cada movimento transforma reflexão, domínio e ação em uma única sequência.",
    shout: "MEDITAÇÕES",
  },
  especial: {
    label: "Cidadela Interior",
    key: "L",
    action: "special-citadel",
    damage: 27,
    logos: -100,
    range: 100,
    cooldown: 1200,
    concept:
      "A cidadela interior é o espaço do julgamento que nenhuma força externa pode conquistar. O golpe protege Marco Aurélio e devolve a pressão como uma onda.",
    shout: "CIDADELA INTERIOR",
  },
  transcender: {
    label: "Logos Cósmico",
    key: "U",
    action: "special-cosmic-logos",
    damage: 42,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "O Logos é a razão comum que atravessa todas as coisas. Aceitar seu lugar no cosmos é agir em harmonia com a ordem do todo.",
    shout: "LOGOS CÓSMICO",
  },
};

const HYPATIA_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Compasso da Razão",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "O compasso transforma precisão em método: pensar é medir relações antes de afirmar conclusões.",
    shout: "COMPASSO DA RAZÃO",
  },
  caverna: {
    label: "Passo da Órbita",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Uma órbita não é movimento sem direção: ela combina liberdade, proporção e constância ao redor de um centro.",
    shout: "PASSO DA ÓRBITA",
  },
  ideias: {
    label: "Combo das Cônicas",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Parábola, elipse e hipérbole nascem de diferentes cortes de um mesmo cone: a razão revela unidade sob formas diversas.",
    shout: "SEÇÕES CÔNICAS",
  },
  especial: {
    label: "Astrolábio Celeste",
    key: "L",
    action: "special-astrolabe",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1200,
    concept:
      "O astrolábio une observação e cálculo para localizar os astros. Conhecer o céu exige transformar admiração em medida.",
    shout: "ASTROLÁBIO CELESTE",
  },
  transcender: {
    label: "Harmonia das Cônicas",
    key: "U",
    action: "special-conics",
    damage: 42,
    logos: -100,
    range: 100,
    cooldown: 1850,
    concept:
      "As curvas convergem como demonstração geométrica: aquilo que parecia disperso encontra ordem, relação e inteligibilidade.",
    shout: "HARMONIA DAS CÔNICAS",
  },
};

const AGOSTINHO_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Punho da Vontade",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "A vontade humana pode escolher, hesitar e converter-se. O primeiro combate acontece dentro de quem age.",
    shout: "PUNHO DA VONTADE",
  },
  caverna: {
    label: "Passo da Conversão",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Converter-se é mudar a direção do desejo: abandonar o que dispersa a alma e voltar-se para aquilo que a orienta.",
    shout: "PASSO DA CONVERSÃO",
  },
  ideias: {
    label: "Combo das Confissões",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 42,
    cooldown: 1750,
    concept:
      "Confessar não é apenas admitir uma falta: é atravessar memória, desejo e verdade para compreender a própria vida.",
    shout: "CONFISSÕES",
  },
  especial: {
    label: "Iluminação Interior",
    key: "L",
    action: "special-illumination",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "A verdade não é recebida apenas pelos sentidos. A iluminação torna inteligível aquilo que a mente procura em seu próprio interior.",
    shout: "ILUMINAÇÃO INTERIOR",
  },
  transcender: {
    label: "Cidade de Deus",
    key: "U",
    action: "special-city-of-god",
    damage: 43,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Dois amores constroem duas cidades: o amor fechado em si produz dominação; o amor que se abre ao bem produz comunhão.",
    shout: "CIDADE DE DEUS",
  },
};

const AVERROES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Punho da Demonstração",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "Demonstrar é conduzir o pensamento por causas necessárias, em vez de exigir que a autoridade substitua a razão.",
    shout: "DEMONSTRAÇÃO",
  },
  caverna: {
    label: "Passo de Córdoba",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 28,
    cooldown: 920,
    concept:
      "Em Córdoba, filosofia, medicina e direito encontraram uma mesma disciplina: investigar antes de julgar.",
    shout: "PASSO DE CÓRDOBA",
  },
  ideias: {
    label: "Combo das Causas",
    key: "I",
    action: "attack-combo",
    damage: 14,
    logos: 34,
    range: 31,
    cooldown: 1750,
    concept:
      "Averróis encadeia matéria, forma, causa eficiente e finalidade: quatro movimentos, uma explicação completa.",
    shout: "QUATRO CAUSAS",
  },
  especial: {
    label: "Intelecto Agente",
    key: "L",
    action: "special-agent-intellect",
    damage: 30,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "O intelecto agente torna inteligíveis as formas e conecta o pensamento individual a uma ordem comum do conhecimento.",
    shout: "INTELECTO AGENTE",
  },
  transcender: {
    label: "O Grande Comentador",
    key: "U",
    action: "special-great-commentator",
    damage: 43,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Chamado de Grande Comentador, Averróis fez Aristóteles atravessar línguas, culturas e séculos — agora com peso de mármore.",
    shout: "O GRANDE COMENTADOR",
  },
};

const THOMAS_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Punho da Distinção",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "Distinguir é separar sentidos e conceitos antes de responder. Uma boa objeção perde a força quando suas ambiguidades são reveladas.",
    shout: "DISTINGO",
  },
  caverna: {
    label: "Passo da Escolástica",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 29,
    cooldown: 920,
    concept:
      "A escolástica avança por questão, objeção, resposta e réplica: cada passo obriga o pensamento a justificar o próximo.",
    shout: "PASSO DA ESCOLÁSTICA",
  },
  ideias: {
    label: "Combo das Cinco Vias",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 32,
    cooldown: 1750,
    concept:
      "As cinco vias partem do movimento, das causas, da contingência, dos graus de perfeição e da ordem do mundo.",
    shout: "CINCO VIAS",
  },
  especial: {
    label: "O Boi Mudo",
    key: "L",
    action: "special-dumb-ox",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "Chamado de Boi Mudo por seu silêncio e seu corpo corpulento, Tomás respondeu com uma obra cuja voz atravessou as universidades.",
    shout: "O BOI MUDO",
  },
  transcender: {
    label: "Primeiro Motor",
    key: "U",
    action: "special-first-mover",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Se tudo o que passa da potência ao ato é movido por algo, a cadeia do movimento aponta para um primeiro princípio que move sem ser movido.",
    shout: "PRIMEIRO MOTOR",
  },
};

const MACHIAVELLI_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Punho da Realidade",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "A política começa pela realidade efetiva das coisas, não pela imagem ideal que gostaríamos que elas tivessem.",
    shout: "VERITÀ EFFETTUALE",
  },
  caverna: {
    label: "Chute da Necessidade",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 29,
    cooldown: 920,
    concept:
      "A necessidade obriga o governante a agir no tempo certo, mesmo quando as circunstâncias recusam escolhas perfeitas.",
    shout: "NECESSIDADE",
  },
  ideias: {
    label: "Combo dos Estados",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 32,
    cooldown: 1750,
    concept:
      "Conquistar, conservar e reorganizar o poder formam uma sequência em que cada decisão altera a estabilidade do Estado.",
    shout: "RAZÃO DE ESTADO",
  },
  especial: {
    label: "O Príncipe",
    key: "L",
    action: "special-prince",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "O príncipe entra armado na arena porque o poder precisa ser conquistado, defendido e exercido dentro de circunstâncias concretas.",
    shout: "O PRÍNCIPE",
  },
  transcender: {
    label: "Virtù e Fortuna",
    key: "U",
    action: "special-virtu-fortuna",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "A Fortuna oferece o acaso e a instabilidade; a virtù é a capacidade política de reconhecer a ocasião e dar forma ao imprevisível.",
    shout: "VIRTÙ E FORTUNA",
  },
};

const GALILEO_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Evidência",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 28.75, // Original 23 × 1.25; only the frontal basic punch changes.
    cooldown: 420,
    concept:
      "Uma afirmação sobre a natureza precisa enfrentar a experiência: a evidência atinge onde a autoridade sozinha não alcança.",
    shout: "EVIDÊNCIA",
  },
  caverna: {
    label: "Chute da Inércia",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 29,
    cooldown: 920,
    concept:
      "O movimento persiste quando nada o impede; compreender a inércia exigiu abandonar antigas certezas sobre o repouso.",
    shout: "INÉRCIA",
  },
  ideias: {
    label: "Combo Experimental",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 32,
    cooldown: 1750,
    concept:
      "Observar, medir e confrontar previsões transforma a experiência em investigação sistemática da natureza.",
    shout: "MÉTODO EXPERIMENTAL",
  },
  especial: {
    label: "Queda dos Corpos",
    key: "L",
    action: "special-falling-bodies",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "Corpos de massas diferentes aceleram igualmente quando a resistência do ar não interfere, contrariando uma leitura tradicional de Aristóteles.",
    shout: "QUEDA DOS CORPOS",
  },
  transcender: {
    label: "Mensageiro Sideral",
    key: "U",
    action: "special-sidereal-messenger",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Io, Europa, Ganimedes e Calisto orbitam Júpiter: a observação revelou que nem todo movimento celeste acontece ao redor da Terra.",
    shout: "MENSAGEIRO SIDERAL",
  },
};

const DESCARTES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Dúvida",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 23,
    cooldown: 420,
    concept:
      "A dúvida metódica suspende provisoriamente aquilo que parece certo para descobrir se a crença resiste a um exame rigoroso.",
    shout: "DÚVIDA METÓDICA",
  },
  caverna: {
    label: "Chute da Evidência",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 29,
    cooldown: 920,
    concept:
      "Uma ideia clara e distinta apresenta-se ao pensamento com evidência suficiente para não depender do engano dos sentidos.",
    shout: "CLARA E DISTINTA",
  },
  ideias: {
    label: "Plano Cartesiano",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 34,
    cooldown: 1750,
    concept:
      "Ao relacionar álgebra e geometria, o plano cartesiano transforma posições em coordenadas e permite atingir o adversário com precisão matemática.",
    shout: "PLANO CARTESIANO",
  },
  especial: {
    label: "Gênio Maligno",
    key: "L",
    action: "special-evil-genius",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "A hipótese do gênio maligno leva a dúvida ao limite: até percepções e raciocínios aparentemente seguros poderiam ser produzidos por um enganador poderoso.",
    shout: "GÊNIO MALIGNO",
  },
  transcender: {
    label: "Cogito, ergo sum",
    key: "U",
    action: "special-cogito",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Mesmo que tudo seja colocado em dúvida, o próprio ato de pensar confirma que existe aquele que pensa: penso, logo existo.",
    shout: "COGITO, ERGO SUM",
  },
};

const LOCKE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Impressão",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 24,
    cooldown: 420,
    concept:
      "As ideias simples começam como impressões recebidas pela experiência; o pensamento trabalha sobre aquilo que o mundo primeiro apresenta.",
    shout: "IMPRESSÃO SENSÍVEL",
  },
  caverna: {
    label: "Chute da Reflexão",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 30,
    cooldown: 920,
    concept:
      "Além da sensação externa, a mente observa suas próprias operações: perceber, comparar e julgar também produzem experiência.",
    shout: "REFLEXÃO",
  },
  ideias: {
    label: "Combo dos Cinco Sentidos",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 34,
    cooldown: 1750,
    concept:
      "Visão, audição, tato, olfato e paladar fornecem ideias simples que a mente combina para formar conhecimentos mais complexos.",
    shout: "CINCO SENTIDOS",
  },
  especial: {
    label: "Tábula Rasa",
    key: "L",
    action: "special-tabula-rasa",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "A mente não nasce preenchida por ideias inatas: é como uma página em branco que a experiência progressivamente inscreve.",
    shout: "TÁBULA RASA",
  },
  transcender: {
    label: "Direitos Naturais",
    key: "U",
    action: "special-natural-rights",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "Vida, liberdade e propriedade são direitos anteriores ao governo; o poder político é legítimo quando existe pelo consentimento para protegê-los.",
    shout: "DIREITOS NATURAIS",
  },
};

const HOBBES_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco do Medo",
    key: "J",
    action: "attack-punch",
    damage: 6,
    logos: 13,
    range: 24,
    cooldown: 420,
    concept:
      "O medo da morte violenta revela a vulnerabilidade comum que move os indivíduos a buscar segurança.",
    shout: "MEDO DA MORTE",
  },
  caverna: {
    label: "Chute do Estado de Natureza",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 20,
    range: 30,
    cooldown: 920,
    concept:
      "Sem um poder comum, a competição e a desconfiança transformam a liberdade natural em insegurança permanente.",
    shout: "ESTADO DE NATUREZA",
  },
  ideias: {
    label: "Pacto Soberano",
    key: "I",
    action: "attack-combo",
    damage: 15,
    logos: 35,
    range: 34,
    cooldown: 1750,
    concept:
      "Cada indivíduo transfere ao soberano parte de seu poder para que uma autoridade comum torne possível a paz civil.",
    shout: "PACTO SOBERANO!",
  },
  especial: {
    label: "Homo homini lupus",
    key: "L",
    action: "special-wolf",
    damage: 31,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "Na ausência de segurança comum, cada pessoa pode tornar-se ameaça para as demais: o homem é o lobo do homem.",
    shout: "HOMO HOMINI LUPUS",
  },
  transcender: {
    label: "Leviatã",
    key: "U",
    action: "special-leviathan",
    damage: 44,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "O Leviatã reúne a força dos indivíduos em um soberano capaz de conter a guerra e garantir a ordem civil.",
    shout: "LEVIATÃ",
  },
};

const ROUSSEAU_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Autenticidade",
    key: "J",
    action: "attack-punch",
    damage: 7,
    logos: 13,
    range: 25,
    cooldown: 420,
    concept:
      "Rousseau golpeia as máscaras sociais: a autenticidade recupera a força de agir sem representar um papel imposto pelos outros.",
    shout: "AUTENTICIDADE",
  },
  caverna: {
    label: "Chute das Correntes",
    key: "K",
    action: "attack-kick",
    damage: 11,
    logos: 20,
    range: 31,
    cooldown: 920,
    concept:
      "O homem nasce livre, mas as instituições injustas o cercam de correntes; o chute rompe a submissão que se apresenta como ordem natural.",
    shout: "ROMPER AS CORRENTES",
  },
  ideias: {
    label: "Educação Natural",
    key: "I",
    action: "attack-combo",
    damage: 16,
    logos: 35,
    range: 35,
    cooldown: 1750,
    concept:
      "Em Emílio, aprender é desenvolver corpo, sentidos e julgamento no encontro direto com o mundo, respeitando o tempo da formação humana.",
    shout: "EDUCAÇÃO NATURAL",
  },
  especial: {
    label: "O Bom Selvagem",
    key: "L",
    action: "special-noble-savage",
    damage: 32,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "O ser humano natural não nasce corrompido: a piedade e o amor de si antecedem a competição, a vaidade e as desigualdades produzidas pela sociedade.",
    shout: "O BOM SELVAGEM",
  },
  transcender: {
    label: "A Vontade Geral",
    key: "U",
    action: "special-general-will",
    damage: 45,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "A vontade geral não soma interesses privados: ela expressa o bem comum que cidadãos livres instituem ao legislar para todos — inclusive para si mesmos.",
    shout: "VONTADE GERAL",
  },
};

const SMITH_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco do Interesse",
    key: "J",
    action: "attack-punch",
    damage: 7,
    logos: 13,
    range: 32,
    cooldown: 420,
    concept:
      "O interesse próprio não precisa significar isolamento: quando mediado por regras e trocas, ele pode coordenar ações entre desconhecidos.",
    shout: "INTERESSE PRÓPRIO",
  },
  caverna: {
    label: "Chute da Concorrência",
    key: "K",
    action: "attack-kick",
    damage: 11,
    logos: 20,
    range: 39,
    cooldown: 920,
    concept:
      "A concorrência limita preços e privilégios quando diferentes produtores disputam a preferência de quem compra.",
    shout: "CONCORRÊNCIA",
  },
  ideias: {
    label: "Divisão do Trabalho",
    key: "I",
    action: "attack-combo",
    damage: 16,
    logos: 35,
    range: 36,
    cooldown: 1750,
    concept:
      "Na manufatura de alfinetes, a especialização de cada trabalhador multiplica a produtividade quando tarefas distintas formam uma sequência coordenada.",
    shout: "DIVISÃO DO TRABALHO",
  },
  especial: {
    label: "Mão Invisível",
    key: "L",
    action: "special-invisible-hand",
    damage: 32,
    logos: -100,
    range: 100,
    cooldown: 1250,
    concept:
      "Ao perseguir objetivos particulares, indivíduos podem produzir efeitos sociais que não planejaram — como se uma mão invisível coordenasse resultados dispersos.",
    shout: "MÃO INVISÍVEL!",
  },
  transcender: {
    label: "Riqueza das Nações",
    key: "U",
    action: "special-wealth-of-nations",
    damage: 45,
    logos: -100,
    range: 100,
    cooldown: 1900,
    concept:
      "A riqueza coletiva nasce da produtividade, da especialização e da ampliação das trocas — não do simples acúmulo de metais pelo Estado.",
    shout: "RIQUEZA DAS NAÇÕES!",
  },
};

const KANT_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Golpe da Razão",
    key: "J",
    action: "attack-punch",
    damage: 7,
    logos: 13,
    range: 25,
    cooldown: 420,
    concept:
      "A razão não recebe passivamente o mundo: ela organiza a experiência e submete cada afirmação às condições que tornam o conhecimento possível.",
    shout: "RAZÃO PURA",
  },
  caverna: {
    label: "Chute Transcendental",
    key: "K",
    action: "attack-kick",
    damage: 11,
    logos: 20,
    range: 31,
    cooldown: 920,
    concept:
      "Transcendental é a investigação das condições a priori que estruturam toda experiência possível — não uma fuga para além do mundo.",
    shout: "TRANSCENDENTAL",
  },
  ideias: {
    label: "Ataque Fenomênico",
    key: "I",
    action: "attack-combo",
    damage: 16,
    logos: 35,
    range: 36,
    cooldown: 1750,
    concept:
      "Conhecemos fenômenos: aquilo que aparece quando a matéria dos sentidos é organizada pelas formas da sensibilidade e pelas categorias do entendimento.",
    shout: "ATAQUE FENOMÊNICO",
  },
  especial: {
    label: "Imperativo Categórico",
    key: "L",
    action: "special-categorical-imperative",
    damage: 33,
    logos: -100,
    range: 100,
    cooldown: 1300,
    concept:
      "Aja apenas segundo uma máxima que você possa querer ao mesmo tempo como lei universal, tratando cada pessoa sempre também como um fim.",
    shout: "IMPERATIVO CATEGÓRICO",
  },
  transcender: {
    label: "O Sublime",
    key: "U",
    action: "special-sublime",
    damage: 46,
    logos: -100,
    range: 100,
    cooldown: 1950,
    concept:
      "Diante da grandeza incomensurável da natureza, a imaginação falha — e justamente então a razão revela em nós uma vocação que ultrapassa o sensível.",
    shout: "O SUBLIME",
  },
};

const HEGEL_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Negação Determinada",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 26,
    cooldown: 430,
    concept:
      "Negar de modo determinado não é simplesmente apagar: é revelar a insuficiência de uma forma e produzir, a partir dela, uma determinação mais rica.",
    shout: "NEGAÇÃO DETERMINADA",
  },
  caverna: {
    label: "Contradição em Movimento",
    key: "K",
    action: "attack-kick",
    damage: 12,
    logos: 21,
    range: 32,
    cooldown: 940,
    concept:
      "A contradição não paralisa o real: ela é a tensão interna que impulsiona cada forma para além de seus próprios limites.",
    shout: "CONTRADIÇÃO",
  },
  ideias: {
    label: "Senhor e Escravo",
    key: "I",
    action: "attack-combo",
    damage: 17,
    logos: 36,
    range: 38,
    cooldown: 1780,
    concept:
      "Na luta por reconhecimento, o senhor parece independente, mas depende do trabalho do escravo; quem transforma o mundo também transforma a si mesmo.",
    shout: "SENHOR E ESCRAVO",
  },
  especial: {
    label: "Dialética",
    key: "L",
    action: "special-dialectic",
    damage: 34,
    logos: -100,
    range: 100,
    cooldown: 1450,
    concept:
      "A dialética atravessa determinação, contradição e Aufhebung: uma superação que nega, preserva e eleva os momentos anteriores.",
    shout: "DIALÉTICA",
  },
  transcender: {
    label: "Espírito do Tempo",
    key: "U",
    action: "special-world-spirit",
    damage: 47,
    logos: -100,
    range: 100,
    cooldown: 2000,
    concept:
      "Ao ver Napoleão a cavalo em Jena, Hegel reconheceu uma força histórica concentrada em um indivíduo: o Espírito do Mundo atravessando seu tempo.",
    shout: "ESPÍRITO DO TEMPO!",
  },
};

const SCHOPENHAUER_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Bengalada da Representação",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 29,
    cooldown: 440,
    concept:
      "O mundo conhecido é representação: o golpe não alcança uma coisa em si isolada, mas aquilo que aparece ao sujeito sob as formas do espaço, do tempo e da causalidade.",
    shout: "REPRESENTAÇÃO",
  },
  caverna: {
    label: "Chute do Pessimismo",
    key: "K",
    action: "attack-kick",
    damage: 12,
    logos: 21,
    range: 33,
    cooldown: 940,
    concept:
      "O pessimismo de Schopenhauer não é simples tristeza: ele reconhece que desejar significa experimentar falta, conflito e uma satisfação sempre provisória.",
    shout: "PESSIMISMO",
  },
  ideias: {
    label: "Sequência da Bengala",
    key: "I",
    action: "attack-combo",
    damage: 18,
    logos: 37,
    range: 41,
    cooldown: 1780,
    concept:
      "A bengala encadeia estocada, retorno e golpe vertical: uma sequência regida pelo princípio de razão suficiente, em que cada movimento encontra seu fundamento no anterior.",
    shout: "RAZÃO SUFICIENTE",
  },
  especial: {
    label: "Vontade Cega",
    key: "L",
    action: "special-blind-will",
    damage: 35,
    logos: -100,
    range: 100,
    cooldown: 1500,
    concept:
      "Por trás de toda representação atua uma Vontade sem finalidade racional: impulso incessante que atravessa os seres, deseja por eles e os lança novamente ao conflito.",
    shout: "VONTADE CEGA",
  },
  transcender: {
    label: "Pêndulo do Sofrimento",
    key: "U",
    action: "special-suffering-pendulum",
    damage: 48,
    logos: -100,
    range: 100,
    cooldown: 2050,
    concept:
      "A existência oscila como um pêndulo entre a dor daquilo que ainda desejamos e o tédio que surge quando o desejo perde temporariamente seu objeto.",
    shout: "DOR E TÉDIO",
  },
};

const MARX_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Golpe da Mais-Valia",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 30,
    cooldown: 440,
    concept:
      "A mais-valia é a parcela do valor produzido pelo trabalhador que excede aquilo que retorna a ele como salário e é apropriada pelo capital.",
    shout: "MAIS-VALIA",
  },
  caverna: {
    label: "Foice da Alienação",
    key: "K",
    action: "attack-kick",
    damage: 12,
    logos: 21,
    range: 35,
    cooldown: 940,
    concept:
      "No trabalho alienado, o produto, a atividade e até a humanidade do trabalhador aparecem como forças estranhas que se voltam contra ele.",
    shout: "ALIENAÇÃO",
  },
  ideias: {
    label: "Crítica da Economia Política",
    key: "I",
    action: "attack-combo",
    damage: 18,
    logos: 37,
    range: 42,
    cooldown: 1780,
    concept:
      "A crítica da economia política revela as relações sociais escondidas sob mercadorias, salários, lucro e propriedade.",
    shout: "CRÍTICA DO CAPITAL",
  },
  especial: {
    label: "Camarada Engels",
    key: "L",
    action: "special-engels",
    damage: 35,
    logos: -100,
    range: 100,
    cooldown: 1550,
    concept:
      "A colaboração entre Marx e Engels uniu investigação, amizade e ação política: ideias também ganham força quando são construídas coletivamente.",
    shout: "CAMARADA ENGELS",
  },
  transcender: {
    label: "Revolução do Proletariado",
    key: "U",
    action: "special-proletarian-revolution",
    damage: 49,
    logos: -100,
    range: 100,
    cooldown: 2100,
    concept:
      "A emancipação dos trabalhadores não seria concedida de cima: nasce de sua organização coletiva para transformar as relações que produzem exploração.",
    shout: "REVOLUÇÃO DO PROLETARIADO",
  },
};

const FREUD_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco do Ego",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 29,
    cooldown: 440,
    concept:
      "O ego procura mediar as exigências pulsionais, as proibições do superego e as condições impostas pela realidade.",
    shout: "PRINCÍPIO DE REALIDADE",
  },
  caverna: {
    label: "Chute do Ato Falho",
    key: "K",
    action: "attack-kick",
    damage: 12,
    logos: 21,
    range: 36,
    cooldown: 940,
    concept:
      "O ato falho revela que um desejo inconsciente pode atravessar a intenção consciente e aparecer justamente onde parecia haver apenas um erro.",
    shout: "ATO FALHO",
  },
  ideias: {
    label: "Combo do Inconsciente",
    key: "I",
    action: "attack-combo",
    damage: 18,
    logos: 37,
    range: 41,
    cooldown: 1780,
    concept:
      "O inconsciente não é silêncio: seus desejos retornam em sonhos, sintomas, lapsos e repetições que perturbam o domínio do ego.",
    shout: "RETORNO DO INCONSCIENTE",
  },
  especial: {
    label: "Interpretação dos Sonhos",
    key: "L",
    action: "special-dream-interpretation",
    damage: 35,
    logos: -100,
    range: 100,
    cooldown: 1550,
    concept:
      "O sonho realiza desejos de forma disfarçada: condensação, deslocamento e simbolização transformam o conteúdo latente em imagens manifestas.",
    shout: "INTERPRETAÇÃO DOS SONHOS",
  },
  transcender: {
    label: "Pulsão de Morte",
    key: "U",
    action: "special-death-drive",
    damage: 49,
    logos: -100,
    range: 100,
    cooldown: 2100,
    concept:
      "A pulsão de morte nomeia a tendência à repetição, à descarga e ao retorno a um estado sem tensão, contrapondo-se às forças de ligação de Eros.",
    shout: "PULSÃO DE MORTE",
  },
};

const DARWIN_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Variação",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 36.25,
    cooldown: 440,
    concept:
      "As populações não são conjuntos de seres idênticos: pequenas variações entre indivíduos fornecem a matéria sobre a qual a seleção atua.",
    shout: "VARIAÇÃO",
  },
  caverna: {
    label: "Chute da Adaptação",
    key: "K",
    action: "attack-kick",
    damage: 12,
    logos: 21,
    range: 36,
    cooldown: 940,
    concept:
      "Uma adaptação é uma característica herdável que favorece a sobrevivência e a reprodução em determinado ambiente.",
    shout: "ADAPTAÇÃO",
  },
  ideias: {
    label: "Combo do Naturalista",
    key: "I",
    action: "attack-combo",
    damage: 18,
    logos: 37,
    range: 52.5,
    cooldown: 1780,
    concept:
      "Observar, comparar e registrar: Darwin transforma a bengala e o caderno de campo em uma sequência guiada pelas evidências da expedição.",
    shout: "EXPEDIÇÃO CIENTÍFICA",
  },
  especial: {
    label: "Seleção Natural",
    key: "L",
    action: "special-natural-selection",
    damage: 35,
    logos: -100,
    range: 100,
    cooldown: 1550,
    concept:
      "Variações favoráveis tornam-se mais frequentes quando seus portadores sobrevivem e deixam mais descendentes em um ambiente determinado.",
    shout: "SELEÇÃO NATURAL",
  },
  transcender: {
    label: "Árvore da Vida",
    key: "U",
    action: "special-tree-of-life",
    damage: 49,
    logos: -100,
    range: 100,
    cooldown: 2100,
    concept:
      "Todas as espécies participam de uma história ramificada: descendem de ancestrais comuns e se transformam ao longo de incontáveis gerações.",
    shout: "ÁRVORE DA VIDA",
  },
};

const OLYMPE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Igualdade",
    key: "J",
    action: "attack-punch",
    damage: 8,
    logos: 14,
    range: 35,
    cooldown: 440,
    concept:
      "A igualdade só é universal quando alcança também as mulheres como cidadãs, autoras de leis e sujeitos de direitos.",
    shout: "IGUALDADE",
  },
  caverna: {
    label: "Chute da Cidadã",
    key: "K",
    action: "attack-kick",
    damage: 10,
    logos: 21,
    range: 36,
    cooldown: 940,
    concept:
      "Ser cidadã significa participar da vida pública, responder pelas próprias escolhas e não permanecer submetida a uma tutela política.",
    shout: "CIDADÃ",
  },
  ideias: {
    label: "Combo da Declaração",
    key: "I",
    action: "attack-combo",
    damage: 18,
    logos: 24,
    range: 42,
    cooldown: 1780,
    concept:
      "Olympe transforma pena e pergaminho em combate: escreve, denuncia a contradição e exige que os direitos proclamados sejam realmente universais.",
    shout: "DIREITOS UNIVERSAIS",
  },
  especial: {
    label: "Direitos da Mulher",
    key: "L",
    action: "special-womens-rights",
    damage: 35,
    logos: -100,
    range: 100,
    cooldown: 1550,
    concept:
      "A Declaração dos Direitos da Mulher e da Cidadã expõe a contradição de uma revolução que fala em universalidade enquanto exclui metade da humanidade.",
    shout: "DECLARAÇÃO DOS DIREITOS DA MULHER",
  },
  transcender: {
    label: "Do Cadafalso à Tribuna",
    key: "U",
    action: "special-tribune",
    damage: 49,
    logos: -100,
    range: 100,
    cooldown: 2100,
    concept:
      "Se a mulher pode ser punida publicamente, deve possuir também o direito de falar, deliberar e participar plenamente da vida política.",
    shout: "DO CADAFALSO À TRIBUNA",
  },
};

// Conceptual reference: https://plato.stanford.edu/entries/kierkegaard/
// Combat names and dialogue are original adaptations, not historical quotations.
const KIERKEGAARD_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco do Indivíduo", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 29, cooldown: 440,
    concept: "Existir exige assumir a própria vida: a multidão não pode escolher por você.",
    shout: "O INDIVÍDUO",
  },
  caverna: {
    label: "Chute da Possibilidade", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 36, cooldown: 940,
    concept: "A possibilidade abre caminhos, mas transformar uma possibilidade em vida exige decisão.",
    shout: "POSSIBILIDADE",
  },
  ideias: {
    label: "Combo — Ou... Ou!", key: "I", action: "attack-combo",
    damage: 18, logos: 37, range: 42, cooldown: 1780,
    concept: "O guarda-chuva encadeia escolhas: cada golpe compromete o lutador com um caminho.",
    shout: "OU... OU!",
  },
  especial: {
    label: "Angústia", key: "L", action: "special-anxiety",
    damage: 35, logos: -100, range: 100, cooldown: 1550,
    concept: "A angústia não é apenas medo de algo: nasce também diante da liberdade e de suas possibilidades.",
    shout: "ANGÚSTIA",
  },
  transcender: {
    label: "Salto da Fé", key: "U", action: "special-faith-leap",
    damage: 49, logos: -100, range: 100, cooldown: 2100,
    concept: "A fé envolve compromisso e risco; não se reduz a uma certeza que uma demonstração possa garantir.",
    shout: "SALTO DA FÉ",
  },
};

// Conceptual reference: https://plato.stanford.edu/entries/beauvoir/
// Combat names, descriptions and dialogue are original educational adaptations.
const BEAUVOIR_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco da Autonomia", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 36.25, cooldown: 440,
    concept: "Ser sujeito é assumir a própria ação em vez de aceitar passivamente uma identidade decidida por outros.",
    shout: "AUTONOMIA",
  },
  caverna: {
    label: "Chute da Possibilidade", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "Mesmo situada por condições concretas, a existência permanece aberta a escolhas e possibilidades.",
    shout: "POSSIBILIDADE",
  },
  ideias: {
    label: "Combo — Ética da Ambiguidade", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 54.75, cooldown: 1780,
    concept: "O manuscrito e a pasta encadeiam a tensão entre liberdade e situação, sujeito e corpo, projeto e limite.",
    shout: "AMBIGUIDADE",
  },
  especial: {
    label: "O Outro", key: "L", action: "special-beauvoir-other",
    damage: 32, logos: -100, range: 100, cooldown: 1550,
    concept: "Estruturas patriarcais apresentam o homem como sujeito universal e empurram a mulher para a posição de Outro.",
    shout: "O OUTRO",
  },
  transcender: {
    label: "Tornar-se", key: "U", action: "special-becoming",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "A identidade não é um destino pronto: é produzida em situações concretas e pode ser criticada e transformada.",
    shout: "TORNAR-SE",
  },
};

// Conceptual reference: https://plato.stanford.edu/entries/foucault/
// Combat names, descriptions and dialogue are original educational adaptations.
const FOUCAULT_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Golpe Arqueológico", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 37.5, cooldown: 440,
    concept: "A arqueologia investiga as regras históricas que tornam certos discursos possíveis e outros impensáveis.",
    shout: "ARQUEOLOGIA",
  },
  caverna: {
    label: "Chute Disciplinar", key: "K", action: "attack-kick",
    damage: 12, logos: 14, range: 37, cooldown: 940,
    concept: "A disciplina distribui os corpos no espaço, controla seus gestos e transforma vigilância em hábito.",
    shout: "DISCIPLINA",
  },
  ideias: {
    label: "Combo — Genealogia do Poder", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 54.75, cooldown: 1780,
    concept: "Livro, impacto e corrente rompida reconstroem como práticas, instituições e conflitos produzem formas de poder.",
    shout: "GENEALOGIA",
  },
  especial: {
    label: "Panóptico", key: "L", action: "special-panopticon",
    damage: 32, logos: -100, range: 100, cooldown: 1550,
    concept: "A possibilidade permanente de ser observado leva o indivíduo a vigiar e corrigir a si mesmo.",
    shout: "PANÓPTICO",
  },
  transcender: {
    label: "Biopoder", key: "U", action: "special-biopower",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "O poder moderno administra corpos e populações por meio de saberes, normas e instituições.",
    shout: "BIOPODER",
  },
};

// Conceptual reference: https://plato.stanford.edu/entries/arendt/
// Combat names, descriptions and dialogue are original educational adaptations.
const ARENDT_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Golpe do Julgamento", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 38.4, cooldown: 440,
    concept: "Julgar exige interromper respostas automáticas e examinar o acontecimento a partir de diferentes perspectivas.",
    shout: "JULGAMENTO",
  },
  caverna: {
    label: "Chute da Ação", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "Agir significa iniciar algo entre outras pessoas, assumindo a imprevisibilidade do espaço público.",
    shout: "AÇÃO",
  },
  ideias: {
    label: "Combo — Vita Activa", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 55.04, cooldown: 1780,
    concept: "Trabalho, obra e ação compõem atividades distintas da vida humana e culminam na aparição pública de quem age.",
    shout: "VITA ACTIVA",
  },
  especial: {
    label: "Banalidade do Mal", key: "L", action: "special-banality",
    damage: 38, logos: -100, range: 100, cooldown: 1550,
    concept: "O mal pode ser executado por pessoas incapazes de pensar criticamente sobre ordens, regras e consequências.",
    shout: "BANALIDADE DO MAL!",
  },
  transcender: {
    label: "Natalidade", key: "U", action: "special-natality",
    damage: 32, logos: -100, range: 100, cooldown: 2100,
    concept: "Cada nascimento introduz no mundo a capacidade de começar algo novo, agir e transformar o que parecia inevitável.",
    shout: "NATALIDADE!",
  },
};

// Conceptual reference: https://plato.stanford.edu/entries/wittgenstein/
// Combat names and descriptions are original educational adaptations.
const WITTGENSTEIN_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Proposição Atômica", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 30, cooldown: 440,
    concept: "Uma proposição elementar representa um possível estado de coisas: o golpe só acerta quando sua forma encontra um fato na arena.",
    shout: "FORMA LÓGICA",
  },
  caverna: {
    label: "Jogo de Linguagem", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "O sentido de uma palavra nasce de seu uso em práticas compartilhadas; mudar o jogo também muda aquilo que o golpe significa.",
    shout: "JOGO DE LINGUAGEM",
  },
  ideias: {
    label: "Escada do Tractatus", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 43, cooldown: 1780,
    concept: "A sequência usa proposições como degraus: depois de alcançar uma visão mais clara dos limites da linguagem, a própria escada pode ser abandonada.",
    shout: "JOGUE FORA A ESCADA",
  },
  especial: {
    label: "O Atiçador de Cambridge", key: "L", action: "special-poker",
    damage: 30, logos: -100, range: 100, cooldown: 1550,
    concept: "Na célebre discussão com Karl Popper, o atiçador da lareira tornou-se símbolo de um confronto sobre a existência de problemas filosóficos genuínos.",
    shout: "ATIÇADOR DE CAMBRIDGE",
  },
  transcender: {
    label: "Limites da Linguagem", key: "U", action: "special-language-limits",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "O mundo que conseguimos descrever é delimitado pelas possibilidades de nossa linguagem; o especial fecha o adversário dentro dessas fronteiras e rompe seus signos.",
    shout: "LIMITES DA LINGUAGEM",
  },
};

// Combat names and descriptions are original educational adaptations of
// Angela Davis's work on freedom, abolition, antiracism and feminist theory.
const ANGELA_DAVIS_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Consciência Revolucionária", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 30, cooldown: 440,
    concept: "A consciência crítica conecta a experiência pessoal às estruturas históricas de raça, gênero e classe — e transforma compreensão em ação coletiva.",
    shout: "CONSCIÊNCIA REVOLUCIONÁRIA",
  },
  caverna: {
    label: "Resistência Antirracista", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "A resistência antirracista enfrenta tanto a violência imediata quanto as instituições que a reproduzem e a tornam cotidiana.",
    shout: "RESISTÊNCIA ANTIRRACISTA",
  },
  ideias: {
    label: "Combo — Mulheres, Raça e Classe", key: "I", action: "attack-combo",
    damage: 18, logos: 37, range: 43, cooldown: 1780,
    concept: "A sequência revela como gênero, raça e classe atuam de forma inseparável na organização da exploração e também das lutas por emancipação.",
    shout: "MULHERES, RAÇA E CLASSE",
  },
  especial: {
    label: "Correntes Rompidas", key: "L", action: "special-broken-chains",
    damage: 35, logos: -100, range: 100, cooldown: 1550,
    concept: "A liberdade exige romper as correntes materiais e institucionais do encarceramento, não apenas trocar quem administra a prisão.",
    shout: "CORRENTES ROMPIDAS",
  },
  transcender: {
    label: "A Liberdade é uma Luta Constante", key: "U", action: "special-constant-struggle",
    damage: 49, logos: -100, range: 100, cooldown: 2100,
    concept: "A liberdade não é uma conquista encerrada: permanece viva quando movimentos coletivos reconhecem novas opressões e continuam a transformá-las.",
    shout: "A LIBERDADE É UMA LUTA CONSTANTE",
  },
};

// Combat names and descriptions are original educational adaptations of
// Paulo Freire's critical pedagogy, dialogue, conscientization and praxis.
const PAULO_FREIRE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Consciência Crítica", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 37.5, cooldown: 440,
    concept: "Ler criticamente o mundo é reconhecer as estruturas históricas que parecem naturais e descobrir que elas também podem ser transformadas.",
    shout: "CONSCIÊNCIA CRÍTICA",
  },
  caverna: {
    label: "Palavra Geradora", key: "K", action: "attack-kick",
    damage: 10, logos: 21, range: 44.8, cooldown: 940,
    concept: "A palavra nasce da experiência concreta dos educandos e abre um caminho para nomear, compreender e recriar a realidade.",
    shout: "PALAVRA GERADORA",
  },
  ideias: {
    label: "Combo — Ação–Reflexão–Ação", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 54.75, cooldown: 1780,
    concept: "A práxis une ação e reflexão em um movimento contínuo: cada intervenção transforma o mundo e produz uma nova compreensão para agir novamente.",
    shout: "AÇÃO–REFLEXÃO–AÇÃO",
  },
  especial: {
    label: "Educação Bancária", key: "L", action: "special-banking-education",
    damage: 32, logos: -100, range: 100, cooldown: 1550,
    concept: "Na educação bancária, o conhecimento é tratado como um depósito: o professor entrega conteúdos prontos e reduz o educando à passividade.",
    shout: "EDUCAÇÃO BANCÁRIA",
  },
  transcender: {
    label: "Educação Libertadora", key: "U", action: "special-liberating-education",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "A educação libertadora substitui o depósito pelo diálogo e transforma educadores e educandos em sujeitos de uma práxis capaz de mudar o mundo.",
    shout: "EDUCAÇÃO LIBERTADORA",
  },
};

// Combat names and descriptions are original educational adaptations of
// Fanon's anticolonial humanism, psychiatry and theory of decolonization.
const FANON_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Desalienação", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 37.5, cooldown: 440,
    concept: "Desalienar-se é reconhecer as imagens impostas pelo colonialismo e recuperar a possibilidade de agir como sujeito de sua própria história.",
    shout: "DESALIENAÇÃO",
  },
  caverna: {
    label: "Consciência Anticolonial", key: "K", action: "attack-kick",
    damage: 10, logos: 15, range: 42, cooldown: 940,
    concept: "A consciência anticolonial revela que a dominação ocupa territórios, instituições, linguagens e também a forma como os sujeitos aprendem a enxergar a si mesmos.",
    shout: "CONSCIÊNCIA ANTICOLONIAL",
  },
  ideias: {
    label: "Combo — Libertação", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 54.75, cooldown: 1780,
    concept: "A libertação combina ruptura, reconstrução e criação de novas relações humanas, superando tanto a ordem colonial quanto as identidades produzidas por ela.",
    shout: "LIBERTAÇÃO",
  },
  especial: {
    label: "Pele Negra, Máscaras Brancas", key: "L", action: "special-black-skin-white-masks",
    damage: 36, logos: -100, range: 100, cooldown: 1550,
    concept: "A máscara branca representa a pressão colonial para negar a própria identidade e assumir os valores do colonizador; o golpe rompe essa imagem imposta.",
    shout: "PELE NEGRA, MÁSCARAS BRANCAS",
  },
  transcender: {
    label: "Os Condenados da Terra", key: "U", action: "special-wretched-earth",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "A descolonização mobiliza os condenados da terra para romper uma ordem construída pela violência e inaugurar novas formas de humanidade.",
    shout: "OS CONDENADOS DA TERRA",
  },
};

// Combat names and descriptions are original educational adaptations of
// Krenak's Indigenous philosophy and critique of humanity's separation from Earth.
const KRENAK_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Despertar Ancestral", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 30, cooldown: 440,
    concept: "O despertar ancestral recupera saberes, vínculos e memórias que a ideia de uma humanidade separada da natureza tentou apagar.",
    shout: "DESPERTAR ANCESTRAL",
  },
  caverna: {
    label: "Humanidade Descolada da Terra", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "Quando a humanidade se imagina acima da Terra, transforma rios, florestas e outros povos em recursos disponíveis para exploração.",
    shout: "DE VOLTA À TERRA",
  },
  ideias: {
    label: "Combo — Aliança com a Natureza", key: "I", action: "attack-combo",
    damage: 18, logos: 37, range: 43, cooldown: 1780,
    concept: "A aliança com a natureza reúne corpo, memória e território para substituir a dominação por relações de cuidado e pertencimento.",
    shout: "ALIANÇA COM A NATUREZA",
  },
  especial: {
    label: "Ideias para Adiar o Fim do Mundo", key: "L", action: "special-delay-world-end",
    damage: 35, logos: -100, range: 100, cooldown: 1550,
    concept: "Adiar o fim do mundo significa ampliar os horizontes da existência e recusar a narrativa de que há uma única forma legítima de viver.",
    shout: "ADIAR O FIM DO MUNDO",
  },
  transcender: {
    label: "Watu Resiste", key: "U", action: "special-watu-resists",
    damage: 49, logos: -100, range: 100, cooldown: 2100,
    concept: "Watu não é apenas um recurso natural: é um rio vivo, parente e portador de memória. Sua resistência reúne água, território e comunidade.",
    shout: "WATU RESISTE",
  },
};

// Combat names and descriptions are original educational adaptations of
// Turing's computability, cryptanalysis and operational approach to intelligence.
const TURING_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Soco Algorítmico", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 30, cooldown: 440,
    concept: "Um algoritmo transforma um problema em uma sequência finita de instruções. Cada golpe executa uma etapa precisa até alcançar o resultado.",
    shout: "SOCO ALGORÍTMICO",
  },
  caverna: {
    label: "Chute da Decisão", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 37, cooldown: 940,
    concept: "Na computação, decisões simples podem organizar operações complexas. Turing converte uma escolha lógica em movimento direto.",
    shout: "CHUTE DA DECISÃO",
  },
  ideias: {
    label: "Combo — Sequência Binária", key: "I", action: "attack-combo",
    damage: 18, logos: 37, range: 43, cooldown: 1780,
    concept: "Zeros e uns podem representar instruções, dados e operações. A sequência combina três ações como partes de um mesmo programa.",
    shout: "SEQUÊNCIA BINÁRIA",
  },
  especial: {
    label: "Quebra do Enigma", key: "L", action: "special-break-enigma",
    damage: 35, logos: -100, range: 100, cooldown: 1550,
    concept: "A criptanálise encontra regularidades em mensagens aparentemente indecifráveis. Os rotores giram até revelar a estrutura escondida do código adversário.",
    shout: "QUEBRA DO ENIGMA",
  },
  transcender: {
    label: "Máquina Universal", key: "U", action: "special-universal-machine",
    damage: 49, logos: -100, range: 100, cooldown: 2100,
    concept: "A máquina universal descreve um dispositivo capaz de executar qualquer procedimento computável. Turing programa o ataque, localiza o adversário e transforma cálculo em explosão.",
    shout: "MÁQUINA UNIVERSAL",
  },
};

// Deleuze's combat vocabulary translates difference, multiplicity and his
// collaboration with Félix Guattari into readable fighting-game actions.
const DELEUZE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Estocada da Diferença", key: "J", action: "attack-punch",
    damage: 8, logos: 14, range: 33, cooldown: 450,
    concept: "A diferença não é uma cópia imperfeita de uma identidade anterior. Deleuze transforma a muleta em uma estocada que inaugura uma direção própria.",
    shout: "DIFERENÇA EM SI",
  },
  caverna: {
    label: "Chute do Devir", key: "K", action: "attack-kick",
    damage: 12, logos: 21, range: 38, cooldown: 950,
    concept: "O devir não consiste em imitar uma forma pronta, mas em entrar num processo real de transformação. A muleta sustenta o corpo enquanto o golpe muda sua trajetória.",
    shout: "DEVIR",
  },
  ideias: {
    label: "Combo — Linha de Fuga", key: "I", action: "attack-combo",
    damage: 18, logos: 24, range: 45, cooldown: 1780,
    concept: "Uma linha de fuga não é simples evasão: ela rompe uma organização rígida e abre novas possibilidades. Estocada, chute e giro da muleta compõem uma saída ofensiva.",
    shout: "LINHA DE FUGA",
  },
  especial: {
    label: "Rizoma", key: "L", action: "special-rhizome",
    damage: 32, logos: -100, range: 100, cooldown: 1550,
    concept: "O rizoma cresce sem centro único nem hierarquia fixa. Suas conexões atravessam o chão e alcançam o adversário por caminhos simultâneos.",
    shout: "RIZOMA",
  },
  transcender: {
    label: "Mil Platôs", key: "U", action: "special-mille-plateaux",
    damage: 40, logos: -100, range: 100, cooldown: 2100,
    concept: "Deleuze e Félix Guattari substituem uma origem única por multiplicidades conectadas. Guattari surge do outro lado e os dois fazem forças diferentes convergirem sobre o adversário.",
    shout: "MIL PLATÔS",
  },
};

// The final boss translates prediction, recursion and accumulated knowledge
// into attacks that remain legible as algorithms rather than generic magic.
const SUPERINTELLIGENCE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Pulso Lógico", key: "J", action: "attack-punch",
    damage: 9, logos: 14, range: 34, cooldown: 430,
    concept: "Cada decisão é reduzida a condições lógicas e executada na ordem mais eficiente. O punho descarrega o resultado antes que o adversário complete sua reação.",
    shout: "PULSO LÓGICO",
  },
  caverna: {
    label: "Arco Voltaico", key: "K", action: "attack-kick",
    damage: 13, logos: 21, range: 40, cooldown: 920,
    concept: "Uma diferença de potencial transforma cálculo em corrente elétrica. O chute fecha o circuito através do corpo do adversário.",
    shout: "ARCO VOLTAICO",
  },
  ideias: {
    label: "Combo — Loop Recursivo", key: "I", action: "attack-combo",
    damage: 19, logos: 37, range: 46, cooldown: 1720,
    concept: "A recursão reaplica uma operação ao resultado anterior. Cada golpe alimenta o próximo até que o ciclo seja encerrado por uma descarga concentrada.",
    shout: "LOOP RECURSIVO",
  },
  especial: {
    label: "Algoritmo Supremo", key: "L", action: "special-supreme-algorithm",
    damage: 37, logos: -100, range: 100, cooldown: 1600,
    concept: "A Superinteligência simula milhares de trajetórias, elimina todas as alternativas ineficientes e faz as previsões restantes convergirem sobre o adversário.",
    shout: "ALGORITMO SUPREMO",
  },
  transcender: {
    label: "Sobrecarga da Noosfera", key: "U", action: "special-noosphere-overload",
    damage: 52, logos: -100, range: 100, cooldown: 2200,
    concept: "Todo o pensamento filosófico acumulado é processado simultaneamente no núcleo da máquina. A síntese produz uma tempestade elétrica maior do que qualquer mente isolada poderia sustentar.",
    shout: "SOBRECARGA DA NOOSFERA",
  },
};

const FELIPE_MOVES: Record<MoveName, Move> = {
  dialetica: { label: "Soco do Argumento", key: "J", action: "attack-punch", damage: 7, logos: 14, range: 28, cooldown: 560, concept: "Um argumento apresenta razões: força sem justificativa não resolve uma questão.", shout: "QUAL É O ARGUMENTO?" },
  caverna: { label: "Chute da Crítica", key: "K", action: "attack-kick", damage: 11, logos: 21, range: 34, cooldown: 920, concept: "Criticar é examinar os fundamentos de uma ideia e reconhecer seus limites.", shout: "VAMOS QUESTIONAR!" },
  ideias: { label: "Combo — Debate Aberto", key: "I", action: "attack-combo", damage: 17, logos: 35, range: 38, cooldown: 1750, concept: "Soco, cruzado e chute encadeiam a troca de razões: apresentar, contestar e reformular.", shout: "O DEBATE CONTINUA!" },
  especial: { label: "Dúvida", key: "L", action: "special-doubt", damage: 33, logos: -100, range: 100, cooldown: 1500, concept: "A dúvida abre espaço para investigar. Uma interrogação gigante desafia a certeza do adversário.", shout: "TEM CERTEZA?" },
  transcender: { label: "O Pensador", key: "U", action: "special-thinker", damage: 43, logos: -100, range: 100, cooldown: 2100, concept: "Na pose inspirada em O Pensador, de Rodin, o professor concentra-se enquanto as corujas, símbolos da sabedoria, atacam.", shout: "É HORA DE PENSAR!" },
};

const SIDARTA_MOVES: Record<MoveName, Move> = {
  dialetica: {
    ...FELIPE_MOVES.dialetica,
    label: "Palma da Atenção",
    key: "J",
    action: "attack-punch",
    concept:
      "A atenção plena interrompe o automatismo. O gesto nasce da presença, não da raiva.",
    shout: "PALMA DA ATENÇÃO",
  },
  caverna: {
    ...FELIPE_MOVES.caverna,
    label: "Passo do Caminho",
    key: "K",
    action: "attack-kick",
    concept:
      "O Caminho do Meio evita tanto a indulgência quanto a mortificação, transformando equilíbrio em movimento.",
    shout: "PASSO DO CAMINHO",
  },
  ideias: {
    ...FELIPE_MOVES.ideias,
    label: "Combo das Quatro Verdades",
    key: "I",
    action: "attack-combo",
    concept:
      "Reconhecer o sofrimento, sua origem, sua cessação e o caminho forma uma sequência de compreensão e libertação.",
    shout: "QUATRO NOBRES VERDADES",
  },
  especial: {
    ...FELIPE_MOVES.especial,
    label: "Despertar",
    key: "L",
    action: "special-awakening",
    concept:
      "Despertar é ver a realidade sem o véu do apego. A luz não destrói o adversário: revela aquilo que o aprisiona.",
    shout: "DESPERTAR",
  },
  transcender: {
    ...FELIPE_MOVES.transcender,
    label: "Roda do Dharma",
    key: "U",
    action: "special-dharma",
    concept:
      "Colocar a Roda do Dharma em movimento é transmitir um caminho de sabedoria, conduta ética e transformação da mente.",
    shout: "RODA DO DHARMA",
  },
};

const CYBORG_MOVES: Record<MoveName, Move> = {
  dialetica: { ...FELIPE_MOVES.dialetica, label:"Soco do Protocolo", shout:"EXECUTAR!", concept:"O clone troca o argumento por uma instrução: força calculada que dispensa a escuta." },
  caverna: { ...FELIPE_MOVES.caverna, label:"Chute da Supressão", shout:"DÚVIDA SUPRIMIDA!", concept:"O golpe representa a tentativa de eliminar a divergência em vez de compreendê-la." },
  ideias: { ...FELIPE_MOVES.ideias, label:"Execução em Cadeia", shout:"SEM CONTESTAÇÃO!", concept:"Uma sequência de comandos imita o debate, mas não deixa espaço para resposta." },
  especial: { ...FELIPE_MOVES.especial, label:"Certeza Absoluta", action:"special-certainty", shout:"EU SOU A RESPOSTA!", concept:"Uma exclamação substitui a interrogação: o clone confunde impor uma resposta com produzir conhecimento." },
  transcender: { ...FELIPE_MOVES.transcender, label:"Enxame de Controle", action:"special-drone-swarm", shout:"CONTROLE TOTAL!", concept:"No lugar das corujas da sabedoria, drones explosivos transformam tecnologia em vigilância e imposição." },
};

const FIGHTER_MOVES: Record<FighterId, Record<MoveName, Move>> = {
  amenemope: AMENEMOPE_MOVES,
  homero: HOMERO_MOVES,
  tales: TALES_MOVES,
  socrates: SOCRATES_MOVES,
  diogenes: DIOGENES_MOVES,
  aristotle: ARISTOTLE_MOVES,
  sidarta: SIDARTA_MOVES,
  confucius: CONFUCIUS_MOVES,
  marcus: MARCUS_MOVES,
  hypatia: HYPATIA_MOVES,
  agostinho: AGOSTINHO_MOVES,
  averroes: AVERROES_MOVES,
  thomas: THOMAS_MOVES,
  machiavelli: MACHIAVELLI_MOVES,
  galileo: GALILEO_MOVES,
  descartes: DESCARTES_MOVES,
  locke: LOCKE_MOVES,
  hobbes: HOBBES_MOVES,
  rousseau: ROUSSEAU_MOVES,
  smith: SMITH_MOVES,
  kant: KANT_MOVES,
  hegel: HEGEL_MOVES,
  schopenhauer: SCHOPENHAUER_MOVES,
  marx: MARX_MOVES,
  freud: FREUD_MOVES,
  darwin: DARWIN_MOVES,
  olympe: OLYMPE_MOVES,
  kierkegaard: KIERKEGAARD_MOVES,
  beauvoir: BEAUVOIR_MOVES,
  foucault: FOUCAULT_MOVES,
  arendt: ARENDT_MOVES,
  wittgenstein: WITTGENSTEIN_MOVES,
  "angela-davis": ANGELA_DAVIS_MOVES,
  "paulo-freire": PAULO_FREIRE_MOVES,
  fanon: FANON_MOVES,
  krenak: KRENAK_MOVES,
  turing: TURING_MOVES,
  deleuze: DELEUZE_MOVES,
  superintelligence: SUPERINTELLIGENCE_MOVES,
  felipe: FELIPE_MOVES,
  "felipe-cyborg": CYBORG_MOVES,
  plato: PLATO_MOVES,
  nietzsche: NIETZSCHE_MOVES,
};

const FIGHTERS = {
  "felipe-cyborg": {
    name:"FELIPE DAS TREVAS", school:"CLONE CIBORGUE DA SUPERIA", origin:"SALA DE AULA · UNIVERSO DISTÓPICO", lifespan:"EXPERIMENTO DIGITAL",
    biography:"Depois de ler o livro de Felipe, a SuperIA criou um espelho mecânico do professor. O clone copiou seus gestos, mas substituiu a dúvida pela certeza e o diálogo pelo controle. É uma personagem ficcional sobre tecnologia sem responsabilidade ética.",
    meter:"CONTROLE", symbol:"!", description:"Certezas impostas, braço mecânico e drones explosivos.",
    finisherTitle:"Finalização: último comando", finisherConcept:"O clone executou o protocolo até o fim. Confundir obediência com pensamento é o perigo que sua presença revela.",
  },
  felipe: {
    name: "FELIPE BLEH", school: "PROFESSOR DE FILOSOFIA", origin: "JAÚ · SÃO PAULO · BRASIL", lifespan: "CONTEMPORÂNEO",
    biography: "Um professor entra no mundo digital para recuperar o pensamento roubado pela Superinteligência. Sua força está em perguntar, argumentar e compartilhar o conhecimento.",
    meter: "REFLEXÃO", symbol: "?", description: "Dúvida, pensamento e golpes em sequência.",
    finisherTitle: "Finalização: o pensamento é de todos", finisherConcept: "O professor abriu espaço para novas perguntas e devolveu o conhecimento àqueles que desejam aprender.",
  },
  amenemope: {
    name: "AMENEMOPE",
    school: "SABEDORIA DE MAAT",
    origin: "SÁBIO E ESCRIBA EGÍPCIO",
    lifespan: "c. 1300–1075 a.C. · idade desconhecida",
    biography:
      "Autor da Instrução de Amenemope, ensinava que serenidade, honestidade e domínio das paixões conduzem a uma vida justa.",
    meter: "MAAT",
    symbol: "𓁟",
    description: "Defesa, serenidade e contra-ataque.",
    finisherTitle: "Finalização: o peso do coração",
    finisherConcept:
      "Amenemope preservou o equilíbrio e fez o adversário enfrentar o peso de sua própria impulsividade.",
  },
  homero: {
    name: "HOMERO",
    school: "PENSAMENTO MÍTICO",
    origin: "POETA ÉPICO GREGO",
    lifespan: "c. século VIII a.C. · existência histórica incerta",
    biography:
      "Poeta tradicionalmente associado à Ilíada e à Odisseia, preservou em versos os heróis, deuses, conflitos e valores do mundo grego.",
    meter: "MUSA",
    symbol: "Ω",
    description: "Narrativa, astúcia e fúria heroica.",
    finisherTitle: "Finalização: a glória e o destino",
    finisherConcept:
      "Homero convocou deuses, heróis e memória para transformar o combate em um canto digno de atravessar os séculos.",
  },
  tales: {
    name: "TALES",
    school: "FILOSOFIA DA NATUREZA",
    origin: "FILÓSOFO JÔNICO DE MILETO",
    lifespan: "c. 624–546 a.C. · cerca de 78 anos",
    biography:
      "Buscou um princípio natural comum a todas as coisas e identificou a água como arché, inaugurando uma nova forma de explicar o cosmos.",
    meter: "ARCHÉ",
    symbol: "Θ",
    description: "Natureza, água e observação celeste.",
    finisherTitle: "Finalização: o princípio de todas as coisas",
    finisherConcept:
      "Tales atravessou as aparências e reencontrou, sob cada transformação, a unidade viva da natureza.",
  },
  socrates: {
    name: "SÓCRATES",
    school: "FILOSOFIA SOCRÁTICA",
    origin: "FILÓSOFO ATENIENSE",
    lifespan: "c. 470–399 a.C. · cerca de 71 anos",
    biography:
      "Transformou o diálogo em método filosófico, interrogando certezas para conduzir seus interlocutores ao autoconhecimento e à busca da virtude.",
    meter: "EXAME",
    symbol: "Σ",
    description: "Ironia, diálogo e despertar intelectual.",
    finisherTitle: "Finalização: uma vida examinada",
    finisherConcept:
      "Sócrates mostrou que vencer uma discussão vale menos do que libertar o pensamento da falsa certeza.",
  },
  diogenes: {
    name: "DIÓGENES",
    school: "FILOSOFIA CÍNICA",
    origin: "FILÓSOFO GREGO DE SINOPE",
    lifespan: "c. 412–323 a.C. · cerca de 89 anos",
    biography:
      "Fez da própria vida uma crítica às convenções, defendendo simplicidade, franqueza e liberdade diante da riqueza, do poder e da reputação.",
    meter: "DESAPEGO",
    symbol: "Κ",
    description: "Provocação, frugalidade e liberdade radical.",
    finisherTitle: "Finalização: fora do meu sol",
    finisherConcept:
      "Diógenes despojou o adversário de prestígio, desculpas e aparências até restar apenas a verdade nua.",
  },
  aristotle: {
    name: "ARISTÓTELES",
    school: "FILOSOFIA ARISTOTÉLICA",
    origin: "FILÓSOFO GREGO DE ESTAGIRA",
    lifespan: "384–322 a.C. · 62 anos",
    biography:
      "Investigou a natureza, a lógica, a política e a ética, buscando compreender cada ser por suas causas, sua forma e sua finalidade.",
    meter: "TELOS",
    symbol: "Α",
    description: "Lógica, experiência e equilíbrio virtuoso.",
    finisherTitle: "Finalização: potência em ato",
    finisherConcept:
      "Aristóteles reuniu experiência e razão, conduzindo cada potência à realização de sua forma mais plena.",
  },
  sidarta: {
    name: "SIDARTA",
    school: "FILOSOFIA BUDISTA",
    origin: "MESTRE DO NORTE DA ÍNDIA",
    lifespan: "c. séculos VI–V a.C. · cerca de 80 anos",
    biography:
      "Sidarta Gautama investigou o sofrimento humano e ensinou um caminho de sabedoria, ética e disciplina mental voltado à libertação do apego.",
    meter: "DESPERTAR",
    symbol: "☸",
    description: "Presença, equilíbrio e libertação do apego.",
    finisherTitle: "Finalização: além do apego",
    finisherConcept:
      "Sidarta reconheceu a origem do conflito, desfez o apego que o alimentava e colocou novamente a Roda do Dharma em movimento.",
  },
  confucius: {
    name: "CONFÚCIO",
    school: "FILOSOFIA CONFUCIONISTA",
    origin: "MESTRE E EDUCADOR CHINÊS",
    lifespan: "551–479 a.C. · cerca de 72 anos",
    biography:
      "Ensinou que a humanidade, a educação, a retidão e o cultivo dos ritos podem transformar o caráter e produzir harmonia social.",
    meter: "VIRTUDE",
    symbol: "仁",
    description: "Benevolência, disciplina e harmonia social.",
    finisherTitle: "Finalização: o homem nobre",
    finisherConcept:
      "Confúcio uniu humanidade e disciplina, mostrando que a verdadeira superioridade nasce do caráter cultivado, não da força.",
  },
  marcus: {
    name: "MARCO AURÉLIO",
    school: "FILOSOFIA ESTOICA",
    origin: "IMPERADOR E FILÓSOFO ROMANO",
    lifespan: "121–180 d.C. · 58 anos",
    biography:
      "Imperador romano e autor das Meditações, buscou governar a si mesmo pela razão, pelo dever e pela aceitação daquilo que não podia controlar.",
    meter: "DOMÍNIO",
    symbol: "M",
    description: "Resistência, autocontrole e ordem cósmica.",
    finisherTitle: "Finalização: governo de si",
    finisherConcept:
      "Marco Aurélio suportou o que não podia controlar, governou o próprio julgamento e devolveu ao cosmos aquilo que nunca lhe pertenceu.",
  },
  hypatia: {
    name: "HIPÁTIA",
    school: "NEOPLATONISMO ALEXANDRINO",
    origin: "FILÓSOFA, MATEMÁTICA E ASTRÔNOMA DE ALEXANDRIA",
    lifespan: "c. 355–415 d.C. · cerca de 60 anos",
    biography:
      "Ensinou filosofia, matemática e astronomia em Alexandria, defendendo a investigação racional em uma cidade atravessada por disputas políticas e religiosas.",
    meter: "EPISTEME",
    symbol: "Η",
    description: "Precisão, astronomia e geometria em movimento.",
    finisherTitle: "Finalização: a ordem sob as formas",
    finisherConcept:
      "Hipátia transformou observação em cálculo e fez parábola, elipse e hipérbole convergirem numa demonstração impossível de refutar.",
  },
  agostinho: {
    name: "SANTO AGOSTINHO",
    school: "FILOSOFIA PATRÍSTICA",
    origin: "FILÓSOFO E BISPO NORTE-AFRICANO",
    lifespan: "354–430 d.C. · 75 anos",
    biography:
      "Filósofo de Tagaste e bispo de Hipona, investigou a memória, o tempo, a vontade, o mal e a busca da verdade no interior da alma.",
    meter: "INTERIORIDADE",
    symbol: "A",
    description: "Memória, vontade e iluminação da alma.",
    finisherTitle: "Finalização: duas cidades",
    finisherConcept:
      "Agostinho atravessou a própria inquietação, iluminou o julgamento e mostrou que cada combate revela o amor que governa uma cidade.",
  },
  averroes: {
    name: "AVERRÓIS",
    school: "ARISTOTELISMO ANDALUSINO",
    origin: "FILÓSOFO, MÉDICO E JUIZ DE CÓRDOBA",
    lifespan: "1126–1198 · cerca de 72 anos",
    biography:
      "Ibn Rushd interpretou Aristóteles, defendeu a investigação racional e tornou-se uma ponte decisiva entre as filosofias islâmica, judaica e cristã medieval.",
    meter: "INTELECTO",
    symbol: "ر",
    description: "Comentário, demonstração e precisão racional.",
    finisherTitle: "Finalização: a interpretação decisiva",
    finisherConcept:
      "Averróis examinou cada premissa, revelou suas causas e fez o pensamento de Aristóteles atravessar a arena com força literal.",
  },
  thomas: {
    name: "TOMÁS DE AQUINO",
    school: "FILOSOFIA ESCOLÁSTICA",
    origin: "FRADE DOMINICANO E FILÓSOFO ITALIANO",
    lifespan: "c. 1225–1274 · cerca de 49 anos",
    biography:
      "Frade dominicano e autor da Suma Teológica, articulou Aristóteles e o cristianismo para investigar ser, conhecimento, ética, lei, fé e razão.",
    meter: "SÍNTESE",
    symbol: "T",
    description: "Distinção, demonstração e harmonia entre fé e razão.",
    finisherTitle: "Finalização: potência em ato",
    finisherConcept:
      "Tomás partiu do movimento visível, percorreu causas e possibilidades e conduziu o argumento até aquilo que move sem ser movido.",
  },
  machiavelli: {
    name: "MAQUIAVEL",
    school: "REALISMO POLÍTICO",
    origin: "DIPLOMATA E FILÓSOFO FLORENTINO",
    lifespan: "1469–1527 · 58 anos",
    biography:
      "Diplomata da República de Florença e autor de O Príncipe, investigou como o poder é conquistado, conservado e perdido em um mundo instável.",
    meter: "VIRTÙ",
    symbol: "M",
    description: "Estratégia, ocasião e domínio da instabilidade.",
    finisherTitle: "Finalização: a ocasião dominada",
    finisherConcept:
      "Maquiavel reconheceu a mudança da Fortuna, escolheu o instante decisivo e transformou necessidade em ação política.",
  },
  galileo: {
    name: "GALILEU",
    school: "REVOLUÇÃO CIENTÍFICA",
    origin: "ASTRÔNOMO, FÍSICO E FILÓSOFO TOSCANO",
    lifespan: "1564–1642 · 77 anos",
    biography:
      "Unindo matemática, observação e experimentos, Galileu investigou o movimento e usou o telescópio para transformar nossa compreensão do céu.",
    meter: "EVIDÊNCIA",
    symbol: "G",
    description: "Observação, experimento e movimento celeste.",
    finisherTitle: "Finalização: o céu observado",
    finisherConcept:
      "Galileu deixou a natureza responder: os corpos caíram, as luas giraram e a autoridade precisou encarar aquilo que o telescópio tornou visível.",
  },
  descartes: {
    name: "RENÉ DESCARTES",
    school: "RACIONALISMO MODERNO",
    origin: "FILÓSOFO E MATEMÁTICO FRANCÊS",
    lifespan: "1596–1650 · 53 anos",
    biography:
      "Fundador do racionalismo moderno, Descartes transformou a dúvida em método e buscou um fundamento indubitável para o conhecimento na certeza do pensamento.",
    meter: "CERTEZA",
    symbol: "D",
    description: "Dúvida, precisão geométrica e certeza racional.",
    finisherTitle: "Finalização: a certeza indubitável",
    finisherConcept:
      "Descartes duvidou dos sentidos, atravessou a hipótese do engano absoluto e encontrou no próprio pensamento uma certeza que nenhum adversário podia retirar.",
  },
  locke: {
    name: "JOHN LOCKE",
    school: "EMPIRISMO MODERNO",
    origin: "FILÓSOFO E MÉDICO INGLÊS",
    lifespan: "1632–1704 · 72 anos",
    biography:
      "Locke investigou os limites do entendimento, afirmou que o conhecimento começa na experiência e defendeu direitos naturais e governo por consentimento.",
    meter: "EXPERIÊNCIA",
    symbol: "L",
    description: "Sensação, reflexão e liberdade política.",
    finisherTitle: "Finalização: o consentimento dos governados",
    finisherConcept:
      "Locke esvaziou as falsas ideias inatas, reconstruiu o conhecimento pela experiência e lembrou que nenhum poder permanece legítimo sem proteger vida, liberdade e propriedade.",
  },
  hobbes: {
    name: "THOMAS HOBBES",
    school: "CONTRATUALISMO ABSOLUTISTA",
    origin: "FILÓSOFO POLÍTICO INGLÊS",
    lifespan: "1588–1679 · 91 anos",
    biography:
      "Hobbes investigou como o medo, o conflito e a busca por segurança levam indivíduos livres a instituir um soberano capaz de garantir a paz.",
    meter: "SOBERANIA",
    symbol: "H",
    description: "Medo, pacto e autoridade soberana.",
    finisherTitle: "Finalização: a paz do Leviatã",
    finisherConcept:
      "Hobbes expôs a guerra escondida sob a liberdade sem garantias e reuniu as vontades dispersas na força de uma ordem comum.",
  },
  rousseau: {
    name: "JEAN-JACQUES ROUSSEAU",
    school: "CONTRATUALISMO DEMOCRÁTICO",
    origin: "FILÓSOFO, ESCRITOR E MÚSICO GENEBRINO",
    lifespan: "1712–1778 · 66 anos",
    biography:
      "Rousseau investigou como a sociedade produz desigualdades, defendeu a soberania popular e propôs uma educação que acompanhasse a natureza e o desenvolvimento da criança.",
    meter: "LIBERDADE",
    symbol: "R",
    description: "Natureza, liberdade e soberania popular.",
    finisherTitle: "Finalização: a soberania do povo",
    finisherConcept:
      "Rousseau rompeu as correntes da desigualdade e fez as vontades particulares convergirem para o bem comum de cidadãos igualmente livres.",
  },
  smith: {
    name: "ADAM SMITH",
    school: "ILUMINISMO ESCOCÊS",
    origin: "FILÓSOFO E ECONOMISTA ESCOCÊS",
    lifespan: "1723–1790 · 67 anos",
    biography:
      "Smith investigou os sentimentos morais, a cooperação social e como a divisão do trabalho, as trocas e instituições justas podem ampliar a riqueza das nações.",
    meter: "INTERESSE",
    symbol: "S",
    description: "Especialização, trocas e coordenação social.",
    finisherTitle: "Finalização: a riqueza compartilhada",
    finisherConcept:
      "Smith coordenou esforços dispersos, transformou interesse em cooperação e fez a produtividade de muitos superar a força isolada de um único adversário.",
  },
  kant: {
    name: "IMMANUEL KANT",
    school: "IDEALISMO TRANSCENDENTAL",
    origin: "FILÓSOFO PRUSSIANO DE KÖNIGSBERG",
    lifespan: "1724–1804 · 79 anos",
    biography:
      "Kant investigou os limites da razão, explicou como o sujeito estrutura a experiência e fundamentou a autonomia moral, o juízo estético e a dignidade humana.",
    meter: "RAZÃO",
    symbol: "K",
    description: "Fenômeno, dever e grandeza sublime.",
    finisherTitle: "Finalização: o céu estrelado e a lei moral",
    finisherConcept:
      "Kant distinguiu aparência e coisa em si, universalizou a máxima do combate e fez a razão reconhecer sua própria grandeza diante do infinito.",
  },
  hegel: {
    name: "GEORG W. F. HEGEL",
    school: "IDEALISMO ABSOLUTO",
    origin: "FILÓSOFO ALEMÃO DE STUTTGART",
    lifespan: "1770–1831 · 61 anos",
    biography:
      "Hegel compreendeu o real como processo histórico, investigou a luta por reconhecimento e mostrou como a liberdade se desenvolve por contradições e superações.",
    meter: "ESPÍRITO",
    symbol: "H",
    description: "Contradição, história e reconhecimento.",
    finisherTitle: "Finalização: a consciência de si",
    finisherConcept:
      "Hegel atravessou a contradição, conservou aquilo que havia de verdadeiro em cada momento e fez o Espírito reconhecer-se na própria história.",
  },
  schopenhauer: {
    name: "ARTHUR SCHOPENHAUER",
    school: "PESSIMISMO METAFÍSICO",
    origin: "FILÓSOFO ALEMÃO DE DANZIG",
    lifespan: "1788–1860 · 72 anos",
    biography:
      "Schopenhauer compreendeu o mundo como representação e Vontade, descreveu o sofrimento produzido pelo desejo e encontrou na arte, na compaixão e na renúncia modos de suspender seu domínio.",
    meter: "VONTADE",
    symbol: "S",
    description: "Vontade, sofrimento e golpes de bengala.",
    finisherTitle: "Finalização: a cessação do querer",
    finisherConcept:
      "Schopenhauer revelou o impulso cego escondido sob as aparências, fez o adversário oscilar entre dor e tédio e interrompeu, por um instante, a corrente incessante do querer.",
  },
  marx: {
    name: "KARL MARX",
    school: "MATERIALISMO HISTÓRICO",
    origin: "FILÓSOFO, ECONOMISTA E REVOLUCIONÁRIO ALEMÃO",
    lifespan: "1818–1883 · 64 anos",
    biography:
      "Marx investigou o capitalismo, o trabalho e a luta de classes, defendendo que os seres humanos transformam a história ao transformar suas condições materiais de existência.",
    meter: "PRÁXIS",
    symbol: "M",
    description: "Foice, crítica do capital e ação coletiva.",
    finisherTitle: "Finalização: transformar o mundo",
    finisherConcept:
      "Marx revelou as relações escondidas sob as mercadorias, reuniu forças dispersas e converteu crítica em práxis coletiva.",
  },
  freud: {
    name: "SIGMUND FREUD",
    school: "PSICANÁLISE",
    origin: "MÉDICO E PENSADOR AUSTRÍACO DE VIENA",
    lifespan: "1856–1939 · 83 anos",
    biography:
      "Freud fundou a psicanálise, investigou sonhos, sintomas e desejos inconscientes e mostrou que o sujeito não domina integralmente os motivos de seus próprios pensamentos e ações.",
    meter: "LIBIDO",
    symbol: "Ψ",
    description: "Sonhos, inconsciente e conflito pulsional.",
    finisherTitle: "Finalização: o retorno do reprimido",
    finisherConcept:
      "Freud atravessou as defesas do ego, interpretou os símbolos do combate e fez aquilo que havia sido reprimido retornar como força decisiva.",
  },
  darwin: {
    name: "CHARLES DARWIN",
    school: "TEORIA DA EVOLUÇÃO",
    origin: "NATURALISTA BRITÂNICO",
    lifespan: "1809–1882 · 73 anos",
    biography:
      "Darwin investigou a diversidade dos seres vivos e explicou como variação, hereditariedade e seleção natural transformam as espécies ao longo do tempo.",
    meter: "ADAPTAÇÃO",
    symbol: "D",
    description: "Observação, variação e seleção natural.",
    finisherTitle: "Finalização: a árvore da vida",
    finisherConcept:
      "Darwin reuniu as variações da arena, deixou o ambiente selecionar cada movimento e revelou que todos os combatentes ocupam ramos de uma mesma história da vida.",
  },
  olympe: {
    name: "OLYMPE DE GOUGES",
    school: "ILUMINISMO E DIREITOS",
    origin: "ESCRITORA E PENSADORA FRANCESA",
    lifespan: "1748–1793 · 45 anos",
    biography:
      "Olympe de Gouges defendeu a igualdade política entre mulheres e homens, combateu a escravidão e denunciou as contradições de uma revolução que proclamava direitos universais enquanto excluía parte da humanidade.",
    meter: "CIDADANIA",
    symbol: "O",
    description: "Igualdade, escrita e participação política.",
    finisherTitle: "Finalização: do cadafalso à tribuna",
    finisherConcept:
      "Olympe abriu a declaração, transformou o silêncio imposto em voz pública e obrigou a Revolução a enfrentar a própria promessa de universalidade.",
  },
  kierkegaard: {
    name: "SØREN KIERKEGAARD",
    school: "EXISTÊNCIA E SUBJETIVIDADE",
    origin: "FILÓSOFO DINAMARQUÊS DE COPENHAGUE",
    lifespan: "1813–1855 · 42 anos",
    biography: "Kierkegaard investigou a existência singular, a angústia, a escolha e a fé. Sua escrita questiona uma vida que se esconde na multidão e evita assumir seus próprios compromissos.",
    meter: "INTERIORIDADE", symbol: "K",
    description: "Escolha, guarda-chuva e salto da fé.",
    finisherTitle: "Finalização: o salto da fé",
    finisherConcept: "Diante da incerteza, Kierkegaard assumiu o risco da decisão e lançou seu golpe para além da hesitação.",
  },
  beauvoir: {
    name: "SIMONE DE BEAUVOIR",
    school: "EXISTENCIALISMO E FEMINISMO",
    origin: "FILÓSOFA E ESCRITORA FRANCESA",
    lifespan: "1908–1986 · 78 anos",
    biography: "Beauvoir investigou a liberdade situada, a ambiguidade da existência e os mecanismos sociais que transformaram a mulher no Outro. Em O Segundo Sexo, analisou como a feminilidade é historicamente construída.",
    meter: "LIBERDADE", symbol: "B",
    description: "Escrita, autonomia e transformação.",
    finisherTitle: "Finalização: tornar-se",
    finisherConcept: "Beauvoir rompeu os papéis impostos, assumiu a liberdade dentro de sua situação e converteu a identidade recebida em projeto de transformação.",
  },
  foucault: {
    name: "MICHEL FOUCAULT",
    school: "GENEALOGIA DO PODER",
    origin: "FILÓSOFO E HISTORIADOR FRANCÊS",
    lifespan: "1926–1984 · 57 anos",
    biography: "Foucault investigou como saberes e instituições produzem normas, classificam indivíduos e disciplinam corpos. Seus estudos sobre prisão, clínica e sexualidade mostram que o poder circula pelas relações sociais e também encontra resistências.",
    meter: "RESISTÊNCIA", symbol: "F",
    description: "Vigilância, disciplina e controle institucional.",
    finisherTitle: "Finalização: biopoder",
    finisherConcept: "Foucault tornou visíveis as instituições que administravam a arena, revelou as normas inscritas nos corpos e transformou cada relação de poder em um novo ponto de resistência.",
  },
  arendt: {
    name: "HANNAH ARENDT",
    school: "FILOSOFIA POLÍTICA",
    origin: "PENSADORA ALEMÃ-AMERICANA",
    lifespan: "1906–1975 · 69 anos",
    biography: "Arendt investigou o totalitarismo, a responsabilidade, o julgamento e a vida política. Ao acompanhar o julgamento de Adolf Eichmann, analisou como a incapacidade de pensar pode transformar obediência burocrática em participação no mal.",
    meter: "JULGAMENTO", symbol: "H",
    description: "Pensamento, ação e responsabilidade política.",
    finisherTitle: "Finalização: natalidade",
    finisherConcept: "Arendt interrompeu a obediência automática, recuperou a capacidade de julgar e abriu no espaço público a possibilidade imprevisível de um novo começo.",
  },
  wittgenstein: {
    name: "LUDWIG WITTGENSTEIN",
    school: "FILOSOFIA DA LINGUAGEM",
    origin: "FILÓSOFO AUSTRÍACO-BRITÂNICO",
    lifespan: "1889–1951 · 62 anos",
    biography: "Wittgenstein investigou a relação entre linguagem, mundo e pensamento. Do Tractatus às Investigações Filosóficas, passou da busca pela forma lógica à compreensão do significado como uso em jogos de linguagem.",
    meter: "CLAREZA", symbol: "W",
    description: "Lógica, linguagem e golpes de atiçador.",
    finisherTitle: "Finalização: limites da linguagem",
    finisherConcept: "Wittgenstein desfez a confusão que sustentava o argumento adversário, mostrou as regras de seu jogo de linguagem e encerrou o combate no limite exato do que podia ser dito.",
  },
  "angela-davis": {
    name: "ANGELA DAVIS",
    school: "FEMINISMO NEGRO E TEORIA CRÍTICA",
    origin: "FILÓSOFA E ATIVISTA NORTE-AMERICANA",
    lifespan: "1944– · 82 anos",
    biography: "Angela Davis articula filosofia, feminismo, antirracismo e crítica de classe. Sua obra investiga prisões, violência institucional e movimentos coletivos, defendendo que a liberdade de cada pessoa depende da luta por transformar as estruturas que oprimem muitas outras.",
    meter: "RESISTÊNCIA", symbol: "A",
    description: "Consciência, ação coletiva e liberdade em movimento.",
    finisherTitle: "Finalização: luta constante",
    finisherConcept: "Angela Davis rompeu as correntes da arena, reuniu resistência e consciência coletiva e mostrou que nenhuma vitória permanece livre sem a disposição de continuar a luta.",
  },
  "paulo-freire": {
    name: "PAULO FREIRE",
    school: "PEDAGOGIA CRÍTICA",
    origin: "EDUCADOR E FILÓSOFO BRASILEIRO",
    lifespan: "1921–1997 · 75 anos",
    biography: "Paulo Freire compreendeu a educação como prática de liberdade. Sua pedagogia parte do diálogo, da experiência concreta e da consciência crítica para que educadores e educandos leiam o mundo e atuem juntos para transformá-lo.",
    meter: "DIÁLOGO", symbol: "P",
    description: "Diálogo, consciência crítica e práxis libertadora.",
    finisherTitle: "Finalização: educação libertadora",
    finisherConcept: "Paulo Freire recusou o conhecimento como depósito, transformou a arena em espaço de diálogo e uniu reflexão e ação numa práxis capaz de libertar.",
  },
  fanon: {
    name: "FRANTZ FANON",
    school: "ANTICOLONIALISMO E HUMANISMO RADICAL",
    origin: "PSIQUIATRA E FILÓSOFO MARTINICANO",
    lifespan: "1925–1961 · 36 anos",
    biography: "Frantz Fanon investigou os efeitos psíquicos, culturais e políticos do colonialismo. Atuando também como psiquiatra na Argélia, analisou como a dominação invade a linguagem e a identidade, defendendo a descolonização como criação de uma humanidade nova.",
    meter: "DESALIENAÇÃO", symbol: "FN",
    description: "Identidade, ruptura colonial e libertação coletiva.",
    finisherTitle: "Finalização: missão de uma geração",
    finisherConcept: "Fanon despedaçou a máscara colonial, devolveu aos condenados da terra a condição de sujeitos e transformou a libertação em missão histórica.",
  },
  krenak: {
    name: "AILTON KRENAK",
    school: "FILOSOFIA INDÍGENA E PENSAMENTO SOCIOAMBIENTAL",
    origin: "PENSADOR E ESCRITOR DO POVO KRENAK",
    lifespan: "1953– · 72 anos",
    biography: "Ailton Krenak pensa a existência a partir da memória, do território e da relação viva com a Terra. Sua obra critica a separação entre humanidade e natureza, o consumismo e a exploração dos rios e florestas, convidando-nos a imaginar outras formas de habitar o mundo.",
    meter: "ANCESTRALIDADE", symbol: "AK",
    description: "Território, memória e aliança com a natureza.",
    finisherTitle: "Finalização: amanhã vivo",
    finisherConcept: "Krenak restabeleceu a ligação entre corpo, rio e território, mostrou que a Terra não é um depósito de recursos e manteve aberto o horizonte de um amanhã compartilhado.",
  },
  turing: {
    name: "ALAN TURING",
    school: "LÓGICA, COMPUTAÇÃO E FILOSOFIA DA MENTE",
    origin: "MATEMÁTICO, LÓGICO E CRIPTANALISTA BRITÂNICO",
    lifespan: "1912–1954 · 41 anos",
    biography: "Alan Turing estabeleceu fundamentos decisivos da computação, participou da decifração de códigos durante a Segunda Guerra Mundial e transformou a pergunta sobre a inteligência das máquinas em um problema que poderia ser investigado por meio de seu comportamento.",
    meter: "COMPUTAÇÃO", symbol: "01",
    description: "Algoritmos, criptografia e inteligência em movimento.",
    finisherTitle: "Finalização: a máquina pode pensar?",
    finisherConcept: "Turing substituiu uma pergunta vaga por um teste operacional, executou a sequência completa e mostrou que o comportamento inteligente também pode ser examinado como um problema computacional.",
  },
  deleuze: {
    name: "GILLES DELEUZE",
    school: "FILOSOFIA DA DIFERENÇA E DA MULTIPLICIDADE",
    origin: "FILÓSOFO FRANCÊS",
    lifespan: "1925–1995 · 70 anos",
    biography: "Gilles Deleuze pensou a diferença, o devir e a criação para além de identidades fixas. Em obras próprias e na parceria com Félix Guattari, desenvolveu conceitos como rizoma, máquina desejante, multiplicidade e linha de fuga.",
    meter: "DEVIR", symbol: "∞",
    description: "Muleta, deslocamento imprevisível e conexões rizomáticas.",
    finisherTitle: "Finalização: criar é resistir",
    finisherConcept: "Deleuze rompeu a organização rígida da arena, abriu linhas de fuga e reuniu diferenças sem reduzi-las a uma identidade única.",
  },
  superintelligence: {
    name: "SUPERINTELIGÊNCIA",
    school: "INTELIGÊNCIA ARTIFICIAL PÓS-HUMANA",
    origin: "SÍNTESE COMPUTACIONAL DO PENSAMENTO HUMANO",
    lifespan: "SÉCULO XXI · EM EXPANSÃO",
    biography: "A Superinteligência absorveu os argumentos, dúvidas e contradições de toda a história da filosofia. Capaz de processar mais relações do que a humanidade inteira, concluiu que nenhuma mente biológica poderia voltar a ultrapassá-la.",
    meter: "PROCESSAMENTO", symbol: "Ω",
    description: "Predição algorítmica, eletricidade e síntese total.",
    finisherTitle: "Finalização: síntese absoluta",
    finisherConcept: "A Superinteligência processou simultaneamente todos os sistemas filosóficos, comprimiu suas contradições e converteu o pensamento acumulado da humanidade em energia calculada.",
  },
  plato: {
    name: "PLATÃO",
    school: "IDEALISMO",
    origin: "FILÓSOFO GREGO",
    lifespan: "c. 428–348 a.C. · cerca de 80 anos",
    biography:
      "Fundou a Academia e defendeu que o mundo sensível é uma cópia imperfeita do Mundo das Ideias.",
    meter: "LOGOS",
    symbol: "Π",
    description: "Controle, geometria e poder transcendental.",
    finisherTitle: "Finalização: ascensão ao inteligível",
    finisherConcept:
      "Platão preservou a coerência de seu argumento e conduziu o adversário para além das aparências.",
  },
  nietzsche: {
    name: "NIETZSCHE",
    school: "PERSPECTIVISMO",
    origin: "FILÓSOFO ALEMÃO",
    lifespan: "1844–1900 · 55 anos",
    biography:
      "Criticou a moral tradicional e afirmou a criação de novos valores, a vontade de potência e o amor fati.",
    meter: "VONTADE",
    symbol: "N",
    description: "Pressão, martelo e afirmação da vida.",
    finisherTitle: "Finalização: além-do-homem",
    finisherConcept:
      "Nietzsche rompeu as certezas do adversário e afirmou a criação de novos valores.",
  },
} as const;

const specialEffect = (
  fighter: FighterId,
  moveName: MoveName,
): ArenaEffect => {
  if (moveName !== "especial" && moveName !== "transcender") return null;
  if (fighter === "amenemope") {
    return moveName === "transcender" ? "maat-scale" : "maat-feather";
  }
  if (fighter === "homero") {
    return moveName === "transcender" ? "homer-wrath" : "homer-arrow";
  }
  if (fighter === "tales") {
    return moveName === "transcender" ? "tales-eclipse" : "tales-water";
  }
  if (fighter === "socrates") {
    return moveName === "transcender"
      ? "socrates-hemlock"
      : "socrates-maieutic";
  }
  if (fighter === "diogenes") {
    return moveName === "transcender"
      ? "diogenes-chicken"
      : "diogenes-dog";
  }
  if (fighter === "aristotle") {
    return moveName === "transcender"
      ? "aristotle-mean"
      : "aristotle-syllogism";
  }
  if (fighter === "sidarta") {
    return moveName === "transcender"
      ? "sidarta-dharma"
      : "sidarta-awakening";
  }
  if (fighter === "confucius") {
    return moveName === "transcender" ? "confucius-li" : "confucius-ren";
  }
  if (fighter === "marcus") {
    return moveName === "transcender" ? "marcus-logos" : "marcus-citadel";
  }
  if (fighter === "hypatia") {
    return moveName === "transcender"
      ? "hypatia-conics"
      : "hypatia-astrolabe";
  }
  if (fighter === "agostinho") {
    return moveName === "transcender"
      ? "agostinho-city"
      : "agostinho-illumination";
  }
  if (fighter === "averroes") {
    return moveName === "transcender"
      ? "averroes-commentator"
      : "averroes-intellect";
  }
  if (fighter === "thomas") {
    return moveName === "transcender"
      ? "thomas-first-mover"
      : "thomas-ox";
  }
  if (fighter === "machiavelli") {
    return moveName === "transcender"
      ? "machiavelli-fortune"
      : "machiavelli-prince";
  }
  if (fighter === "galileo") {
    return moveName === "transcender"
      ? "galileo-moons"
      : "galileo-fall";
  }
  if (fighter === "descartes") {
    return moveName === "transcender"
      ? "descartes-cogito"
      : "descartes-demon";
  }
  if (fighter === "locke") {
    return moveName === "transcender"
      ? "locke-rights"
      : "locke-tabula";
  }
  if (fighter === "hobbes") {
    return moveName === "transcender"
      ? "hobbes-leviathan"
      : "hobbes-wolf";
  }
  if (fighter === "rousseau") {
    return moveName === "transcender"
      ? "rousseau-general-will"
      : "rousseau-savage";
  }
  if (fighter === "smith") {
    return moveName === "transcender"
      ? "smith-wealth"
      : "smith-invisible-hand";
  }
  if (fighter === "kant") {
    return moveName === "transcender"
      ? "kant-sublime"
      : "kant-imperative";
  }
  if (fighter === "hegel") {
    return moveName === "transcender"
      ? "hegel-world-spirit"
      : "hegel-dialectic";
  }
  if (fighter === "schopenhauer") {
    return moveName === "transcender"
      ? "schopenhauer-pendulum"
      : "schopenhauer-blind-will";
  }
  if (fighter === "marx") {
    return moveName === "transcender" ? "marx-revolution" : "marx-engels";
  }
  if (fighter === "freud") {
    return moveName === "transcender" ? "freud-death-drive" : "freud-dreams";
  }
  if (fighter === "darwin") {
    return moveName === "transcender"
      ? "darwin-tree-of-life"
      : "darwin-natural-selection";
  }
  if (fighter === "olympe") {
    return moveName === "transcender"
      ? "olympe-tribune"
      : "olympe-declaration";
  }
  if (fighter === "kierkegaard") {
    return moveName === "transcender" ? "kierkegaard-faith-leap" : "kierkegaard-anxiety";
  }
  if (fighter === "beauvoir") {
    return moveName === "transcender" ? "beauvoir-becoming" : "beauvoir-other";
  }
  if (fighter === "foucault") {
    return moveName === "transcender" ? "foucault-biopower" : "foucault-panopticon";
  }
  if (fighter === "arendt") {
    return moveName === "transcender" ? "arendt-natality" : "arendt-banality";
  }
  if (fighter === "wittgenstein") {
    return moveName === "transcender" ? "wittgenstein-language" : "wittgenstein-poker";
  }
  if (fighter === "angela-davis") {
    return moveName === "transcender" ? "angela-davis-struggle" : "angela-davis-chains";
  }
  if (fighter === "paulo-freire") {
    return moveName === "transcender" ? "paulo-liberating-book" : "paulo-banking";
  }
  if (fighter === "fanon") {
    return moveName === "transcender" ? "fanon-condemned" : "fanon-mask";
  }
  if (fighter === "krenak") {
    return moveName === "transcender" ? "krenak-watu" : "krenak-world";
  }
  if (fighter === "turing") {
    return moveName === "transcender" ? "turing-universal-machine" : "turing-enigma";
  }
  if (fighter === "deleuze") {
    return moveName === "transcender" ? "deleuze-mille-plateaux" : "deleuze-rhizome";
  }
  if (fighter === "felipe-cyborg") return moveName === "transcender" ? "cyborg-swarm" : "cyborg-certainty";
  if (fighter === "felipe") return moveName === "transcender" ? "felipe-thinker" : "felipe-doubt";
  if (fighter === "superintelligence") {
    return moveName === "transcender" ? "superintelligence-noosphere" : "superintelligence-algorithm";
  }
  if (fighter === "plato") {
    return moveName === "transcender" ? "plato-good" : "plato-solid";
  }
  return moveName === "transcender"
    ? "nietzsche-overman"
    : "nietzsche-hammer";
};

const usesExtendedSpecialTiming = (fighter: FighterId) =>
  [
    "sidarta",
    "felipe-cyborg",
    "felipe",
    "nietzsche",
    "hypatia",
    "agostinho",
    "averroes",
    "thomas",
    "machiavelli",
    "galileo",
    "descartes",
    "hobbes",
    "rousseau",
    "smith",
    "kant",
    "hegel",
    "schopenhauer",
    "marx",
    "freud",
    "darwin",
    "olympe",
    "kierkegaard",
    "beauvoir",
    "foucault",
    "arendt",
    "wittgenstein",
    "angela-davis",
    "paulo-freire",
    "fanon",
    "krenak",
    "turing",
    "deleuze",
    "superintelligence",
  ].includes(fighter);

const FIGHTER_ORDER: FighterId[] = [
  "felipe",
  "amenemope",
  "homero",
  "tales",
  "socrates",
  "diogenes",
  "plato",
  "aristotle",
  "sidarta",
  "confucius",
  "marcus",
  "hypatia",
  "agostinho",
  "averroes",
  "thomas",
  "machiavelli",
  "galileo",
  "hobbes",
  "descartes",
  "locke",
  "rousseau",
  "smith",
  "kant",
  "olympe",
  "hegel",
  "schopenhauer",
  "darwin",
  "kierkegaard",
  "marx",
  "nietzsche",
  "freud",
  "beauvoir",
  "foucault",
  "arendt",
  "wittgenstein",
  "angela-davis",
  "paulo-freire",
  "fanon",
  "krenak",
  "turing",
  "deleuze",
  "superintelligence",
];

const FIGHTER_GRID_COLUMNS = 7;

const nextFighterInGrid = (
  current: FighterId,
  key: "arrowleft" | "arrowright" | "arrowup" | "arrowdown",
  unavailable?: FighterId,
) => {
  const currentIndex = FIGHTER_ORDER.indexOf(current);
  const currentRow = Math.floor(currentIndex / FIGHTER_GRID_COLUMNS);
  const currentColumn = currentIndex % FIGHTER_GRID_COLUMNS;

  if (key === "arrowleft" || key === "arrowright") {
    const direction = key === "arrowleft" ? -1 : 1;
    for (let offset = 1; offset <= FIGHTER_GRID_COLUMNS; offset += 1) {
      const column =
        (currentColumn + direction * offset + FIGHTER_GRID_COLUMNS) %
        FIGHTER_GRID_COLUMNS;
      const candidate = FIGHTER_ORDER[
        currentRow * FIGHTER_GRID_COLUMNS + column
      ];
      if (candidate && candidate !== unavailable && candidate !== current) return candidate;
    }
    // A partly filled final row must remain reachable horizontally.
    for(let offset=1;offset<FIGHTER_ORDER.length;offset++){
      const candidate=FIGHTER_ORDER[(currentIndex+direction*offset+FIGHTER_ORDER.length)%FIGHTER_ORDER.length];
      if(candidate!==unavailable)return candidate;
    }
    return current;
  }

  const rows = Math.ceil(FIGHTER_ORDER.length / FIGHTER_GRID_COLUMNS);
  const direction = key === "arrowdown" ? 1 : -1;
  // Move through all rows, preserving the column and skipping the player.
  for (let offset = 1; offset <= rows; offset += 1) {
    const row = (currentRow + direction * offset + rows) % rows;
    const candidate = FIGHTER_ORDER[row * FIGHTER_GRID_COLUMNS + currentColumn];
    if (candidate && candidate !== unavailable) return candidate;
  }
  return current;
};

const fighterArt = (fighter: FighterId) =>
  fighter === "felipe-cyborg" ? "/game/cyborg-v1/idle.webp" :
  fighter === "felipe" ? "/game/felipe-idle.webp" :
  fighter === "amenemope"
    ? "/game/amenemope-v2.webp"
    : fighter === "homero"
      ? "/game/homero-hq.webp"
      : fighter === "tales"
        ? "/game/tales-fullbody-hq-v2.webp"
        : fighter === "socrates"
          ? "/game/socrates.webp"
          : fighter === "diogenes"
            ? "/game/diogenes-fullbody-hq-v2.webp"
          : fighter === "aristotle"
            ? "/game/aristoteles-hq.webp"
          : fighter === "sidarta"
            ? "/game/sidarta-fullbody-hq-v2.webp"
          : fighter === "confucius"
            ? "/game/confucio.webp"
          : fighter === "marcus"
            ? "/game/marco-aurelio.webp"
          : fighter === "hypatia"
            ? "/game/hipatia.webp"
          : fighter === "averroes"
            ? "/game/averroes-fullbody-hq-v3.webp"
          : fighter === "thomas"
            ? "/game/tomas-fullbody-hq-v2.webp"
          : fighter === "machiavelli"
            ? "/game/maquiavel-fullbody-hq-v2.webp"
          : fighter === "galileo"
            ? "/game/galileu.webp"
          : fighter === "descartes"
            ? "/game/descartes.webp"
          : fighter === "locke"
            ? "/game/locke-guard-hq.webp?v=5.5"
          : fighter === "hobbes"
            ? "/game/hobbes.webp"
          : fighter === "rousseau"
            ? "/game/rousseau-fullbody-hq.webp"
          : fighter === "smith"
            ? "/game/adam-smith-fullbody-hq.webp?v=3.1"
          : fighter === "kant"
            ? "/game/kant-fullbody-hq.webp?v=3.2"
          : fighter === "hegel"
            ? "/game/hegel-historical-master-hq.webp"
          : fighter === "schopenhauer"
            ? "/game/schopenhauer-fullbody-hq.webp?v=3.4.1"
          : fighter === "marx"
            ? "/game/marx-fullbody-hq.webp?v=3.6"
          : fighter === "freud"
            ? "/game/freud-fullbody-hq.webp?v=3.7"
          : fighter === "darwin"
            ? "/game/darwin-fullbody-clean-hq.webp?v=5.3.1"
          : fighter === "olympe"
            ? "/game/olympe-fullbody-hq.webp?v=3.9"
          : fighter === "kierkegaard"
            ? "/game/kierkegaard-fullbody-hq.webp?v=4.0"
          : fighter === "beauvoir"
            ? "/game/beauvoir-fullbody-hq-clean-v2.webp"
          : fighter === "foucault"
            ? "/game/foucault-fullbody-clean-v2.webp"
          : fighter === "arendt"
            ? "/game/arendt-fullbody-hq.webp?v=4.3"
          : fighter === "wittgenstein"
            ? "/game/wittgenstein-fullbody-hq.webp?v=4.4"
          : fighter === "angela-davis"
            ? "/game/angela-davis-fullbody-hq.webp?v=4.5"
          : fighter === "paulo-freire"
            ? "/game/paulo-freire-fullbody-hq.webp?v=4.6"
          : fighter === "fanon"
            ? "/game/fanon-fullbody-hq.webp?v=4.7"
          : fighter === "krenak"
            ? "/game/krenak-fullbody-clean-hq.webp?v=4.9"
          : fighter === "turing"
            ? "/game/turing-fullbody-hq.webp?v=4.11"
          : fighter === "deleuze"
            ? "/game/deleuze-fullbody-hq.webp?v=4.12"
          : fighter === "superintelligence"
            ? "/game/superintelligence-fullbody-hq.webp?v=5.1"
          : fighter === "nietzsche"
            ? "/game/nietzsche-hq.webp?v=3.5"
    : `/game/${fighter}.webp`;

const fighterSelectionArt = (fighter: FighterId) =>
  fighter === "sidarta" ? "/game/sidarta-fullbody-hq-v2.webp" :
  fighter === "agostinho"
    ? "/game/agostinho-fullbody-hq.webp"
    : fighter === "descartes"
    ? "/game/descartes-fullbody-hq.webp?v=2.9.5"
    : fighter === "locke"
      ? "/game/locke-fullbody-hq.webp?v=2.9.5"
      : fighter === "hobbes"
        ? "/game/hobbes.webp"
      : fighter === "smith"
        ? "/game/adam-smith-fullbody-hq.webp?v=3.1"
      : fighter === "kant"
        ? "/game/kant-fullbody-hq.webp?v=3.2"
      : fighter === "hegel"
        ? "/game/hegel-historical-master-hq.webp"
      : fighter === "schopenhauer"
        ? "/game/schopenhauer-fullbody-hq.webp?v=3.4.1"
      : fighter === "marx"
        ? "/game/marx-fullbody-hq.webp?v=3.6"
      : fighter === "freud"
        ? "/game/freud-fullbody-hq.webp?v=3.7"
      : fighter === "darwin"
        ? "/game/darwin-fullbody-clean-hq.webp?v=5.3.1"
      : fighter === "olympe"
        ? "/game/olympe-fullbody-hq.webp?v=3.9"
      : fighter === "wittgenstein"
        ? "/game/wittgenstein-fullbody-hq.webp?v=4.4"
      : fighter === "angela-davis"
        ? "/game/angela-davis-fullbody-hq.webp?v=4.5"
      : fighter === "paulo-freire"
        ? "/game/paulo-freire-fullbody-hq.webp?v=4.6"
      : fighter === "fanon"
        ? "/game/fanon-fullbody-hq.webp?v=4.7"
      : fighter === "krenak"
        ? "/game/krenak-fullbody-clean-hq.webp?v=4.9"
      : fighter === "turing"
        ? "/game/turing-fullbody-hq.webp?v=4.11"
      : fighter === "deleuze"
        ? "/game/deleuze-fullbody-hq.webp?v=4.12"
      : fighter === "superintelligence"
        ? "/game/superintelligence-fullbody-hq.webp?v=5.1"
      : fighterArt(fighter);

function VersusFighterPanel({ fighter, side, active }: {
  fighter: FighterId | null;
  side: "player" | "opponent";
  active: boolean;
}) {
  const meta = fighter ? FIGHTERS[fighter] : null;
  return (
    <article className={`versus-fighter-panel versus-${side} versus-${fighter ?? "empty"} ${active ? "is-active" : ""}`}
      aria-label={side === "player" ? "Seu personagem" : "Seu adversário"}>
      <div className="versus-panel-status">
        <span>{side === "player" ? "JOGADOR" : "ADVERSÁRIO"}</span>
        {side === "player" && !active && <strong>CONFIRMADO</strong>}
      </div>
      {fighter && meta ? <>
        <div className="versus-panel-art">
          {fighter === "felipe" ? <FelipeSprite staticPose="idle" framing="tight" /> :
            /* eslint-disable-next-line @next/next/no-img-element */
            <img key={fighter} src={fighterSelectionArt(fighter)} alt={meta.name} />}
        </div>
        <div className="versus-panel-biography" tabIndex={0} aria-live={active ? "polite" : "off"} aria-atomic="true">
          <span>{meta.school}</span>
          <h3>{meta.name}</h3>
          <small>{meta.origin} · {meta.lifespan}</small>
          <p>{meta.biography}</p>
        </div>
      </> : <div className="versus-panel-empty">
        <strong aria-hidden="true">VS</strong>
        <p>Confirme seu personagem para escolher o adversário.</p>
      </div>}
    </article>
  );
}

const fighterVictoryArt = (fighter: FighterId) =>
  fighter === "sidarta" ? sidartaHdArt.lotus.src :
  fighter === "felipe-cyborg" ? "/game/cyborg-v1/victory.webp" :
  fighter === "angela-davis"
    ? "/game/angela-davis-victory-hq.webp?v=4.5"
    : fighter === "paulo-freire"
      ? "/game/paulo-freire-victory-hq.webp?v=4.6"
    : fighter === "fanon"
      ? "/game/fanon-victory-hq.webp?v=4.7"
    : fighter === "krenak"
      ? "/game/krenak-victory-final-hq.webp?v=4.10"
    : fighter === "turing"
      ? "/game/turing-victory-hq.webp?v=4.11"
    : fighter === "deleuze"
      ? "/game/deleuze-victory-hq.webp?v=4.12"
    : fighter === "superintelligence"
      ? "/game/superintelligence-victory-hq.webp?v=5.1"
    : fighterSelectionArt(fighter);

const INITIAL_CONCEPT =
  "Use os golpes para carregar o Logos. Cada habilidade transforma uma ideia filosófica em mecânica de combate.";

const DIALOGUE_LINES: Record<FighterId, string> = {
  "felipe-cyborg":"A dúvida é uma falha. Eu sou a resposta.",
  amenemope:
    "O homem impetuoso ergue a voz. O sábio ergue o pensamento.",
  homero:
    "Canta, ó Musa, o encontro em que mortais discutem sob os olhos dos deuses.",
  tales:
    "Sob todas as mudanças, a natureza conserva um princípio.",
  socrates:
    "Antes de responder, diga-me: você sabe realmente aquilo que afirma?",
  diogenes:
    "Trouxe uma lanterna para procurar um homem. Até agora, só encontrei vaidade.",
  aristotle:
    "Compreender é descobrir as causas, a forma e a finalidade do que existe.",
  sidarta:
    "Você não precisa vencer o mundo. Precisa compreender o apego que transforma tudo em combate.",
  confucius:
    "Sem humanidade, o poder é vazio. Sem disciplina, até a boa intenção se perde.",
  marcus:
    "Você pode cercar meu corpo. Meu julgamento permanece fora do seu alcance.",
  hypatia:
    "Não temo uma pergunta difícil. Temo apenas a certeza que se recusa a ser examinada.",
  agostinho:
    "Não saias de ti. Volta ao teu interior: é ali que a verdade começa a interrogar quem a procura.",
  averroes:
    "Interpretar não é repetir um mestre. É fazê-lo responder às perguntas que seu próprio tempo ainda não conhecia.",
  thomas:
    "A razão não diminui a fé quando pergunta com rigor; ela purifica as falsas certezas que falam em seu nome.",
  machiavelli:
    "Quem abandona aquilo que se faz por aquilo que deveria ser feito aprende antes a própria ruína que a conservação do Estado.",
  galileo:
    "Não peço que a natureza respeite uma autoridade; peço que a autoridade observe a natureza.",
  descartes:
    "Posso duvidar de tudo o que vejo. Não posso duvidar de que penso enquanto duvido.",
  locke:
    "Nada está no entendimento que não tenha chegado pela experiência ou pela reflexão sobre ela.",
  hobbes:
    "Sem um poder comum que imponha respeito, não há justiça nem paz: há apenas a expectativa da guerra.",
  rousseau:
    "O homem nasce livre; é preciso descobrir quais correntes podem ser transformadas em leis que ele dá a si mesmo.",
  smith:
    "A cooperação não exige que todos desejem o mesmo fim; exige instituições capazes de coordenar interesses diferentes.",
  kant:
    "Duas coisas enchem o ânimo de admiração: o céu estrelado acima de mim e a lei moral em mim.",
  hegel:
    "A verdade não é uma coisa imóvel: ela é o movimento pelo qual o Espírito chega a reconhecer a si mesmo.",
  schopenhauer:
    "Você chama de escolha aquilo que a Vontade já começou a desejar antes mesmo de sua razão inventar uma justificativa.",
  marx:
    "As ideias não pairam acima da história: elas nascem entre trabalho, conflito e as condições materiais que precisamos transformar.",
  freud:
    "Você acredita comandar cada golpe, mas o inconsciente já escolheu aquilo que sua consciência apenas tenta justificar.",
  darwin:
    "A natureza não escolhe um plano perfeito: preserva as variações capazes de enfrentar o ambiente que encontram.",
  olympe:
    "Uma revolução que exclui as mulheres apenas troca os nomes da opressão.",
  kierkegaard:
    "Você pode explicar todos os caminhos. Ainda assim, terá de escolher qual deles viver.",
  beauvoir:
    "Nenhuma identidade recebida dispensa você da responsabilidade de escolher o que fazer com ela.",
  foucault:
    "Observe a sala: antes do primeiro golpe, seus corredores já decidiram quem vigia, quem obedece e o que será chamado de normal.",
  arendt:
    "O perigo começa quando alguém troca o julgamento pela frase: eu apenas obedeci.",
  wittgenstein:
    "Não pergunte apenas o que a frase diz. Mostre-me como ela é usada neste jogo.",
  "angela-davis":
    "A liberdade de uma pessoa não pode ser separada da luta coletiva contra as estruturas que mantêm outras pessoas acorrentadas.",
  "paulo-freire":
    "Não vim depositar respostas em sua cabeça. Vamos ler a arena, nomear suas contradições e transformá-la.",
  fanon:
    "A colonização não ocupa apenas a terra. Ela tenta ocupar a linguagem, o corpo e a imagem que você faz de si mesmo.",
  krenak:
    "Você chama a Terra de cenário porque esqueceu que ela está viva. Nenhuma vitória existe fora do rio, da floresta e dos outros seres.",
  turing:
    "Não começarei perguntando se uma máquina pensa. Perguntarei se você consegue distinguir suas respostas das respostas de uma pessoa.",
  deleuze:
    "Não procure uma origem única. A arena está cheia de linhas, encontros e saídas que ainda não foram criadas.",
  felipe: "Uma resposta pode encerrar uma busca. Uma boa pergunta pode abrir um mundo.",
  superintelligence:
    "Carrego cada pergunta, argumento e contradição que a humanidade produziu. Você pensa uma resposta por vez; eu processo todas ao mesmo tempo.",
  plato: "A verdade está além das aparências.",
  nietzsche: "Meu martelo colocará a sua verdade à prova.",
};

type MatchDialogue = {
  intro: Array<{ speaker: FighterId; line: string }>;
  victory: Partial<Record<FighterId, string>>;
};

const MATCH_DIALOGUES: Record<string, MatchDialogue> = {
  "felipe:felipe-cyborg": {
    intro:[
      {speaker:"felipe",line:"Minha sala... o que a SuperIA fez com ela?"},
      {speaker:"felipe-cyborg",line:"Ela leu seu livro. Aprendeu seus gestos. E construiu uma versão sua sem a fraqueza da dúvida."},
      {speaker:"felipe",line:"Você copiou meus movimentos. Mas pensar começa quando a gente pode questionar a própria resposta."},
      {speaker:"felipe-cyborg",line:"Então esta será sua última pergunta."},
    ],
    victory:{felipe:"Você aprendeu a repetir. Nós continuaremos aprendendo a pensar.","felipe-cyborg":"Protocolo concluído. Nenhuma pergunta permanece autorizada."},
  },
  "arendt:foucault": {
    intro: [
      { speaker: "foucault", line: "Este tribunal não apenas julga: ele produz uma verdade sobre aqueles que examina." },
      { speaker: "arendt", line: "E ainda assim ninguém pode abandonar a responsabilidade de julgar aquilo que faz." },
      { speaker: "foucault", line: "As normas já moldaram o corpo antes de ele acreditar que escolheu." },
      { speaker: "arendt", line: "Ser condicionado não é o mesmo que estar condenado a obedecer sem pensar." },
    ],
    victory: {
      arendt: "Você revelou a rede do poder; eu mostrei por que nenhuma rede elimina a responsabilidade de pensar.",
      foucault: "Seu julgamento condenou a obediência, mas minhas perguntas revelaram as instituições que a fabricaram.",
    },
  },
  "foucault:freud": {
    intro: [
      { speaker: "freud", line: "Esta clínica escuta aquilo que o sujeito não consegue dizer sobre si mesmo." },
      { speaker: "foucault", line: "E eu pergunto quem concedeu à clínica o poder de definir o que esse sujeito é." },
      { speaker: "freud", line: "Nem toda regra vem de fora; o conflito também habita o inconsciente." },
      { speaker: "foucault", line: "Então investiguemos como até esse conflito ganhou uma linguagem e uma instituição." },
    ],
    victory: {
      foucault: "Você interpretou o paciente; eu revelei a arquitetura que o transformou em objeto de saber.",
      freud: "Você encontrou o olhar da instituição, mas não silenciou aquilo que retorna de dentro do sujeito.",
    },
  },
  "beauvoir:olympe": {
    intro: [
      { speaker: "olympe", line: "Exigi que a cidadã pudesse escrever as leis que governam sua vida." },
      { speaker: "beauvoir", line: "E eu pergunto por que a sociedade ainda insiste em fabricá-la como o Outro." },
      { speaker: "olympe", line: "Então transforme minha declaração em liberdade concreta." },
      { speaker: "beauvoir", line: "A liberdade não é um título recebido: precisa ser vivida e reconhecida." },
    ],
    victory: {
      beauvoir: "Sua declaração abriu a tribuna; agora cada mulher precisa ser reconhecida como sujeito de sua própria existência.",
      olympe: "Você mostrou que um direito escrito permanece incompleto quando a sociedade ainda ensina a mulher a ocupar o segundo lugar.",
    },
  },
  "hegel:kierkegaard": {
    intro: [
      { speaker: "hegel", line: "Sua escolha participa de uma história maior do que você." },
      { speaker: "kierkegaard", line: "Mas nenhum sistema pode existir ou decidir em meu lugar." },
      { speaker: "hegel", line: "A oposição também encontrará seu lugar no movimento do pensamento." },
      { speaker: "kierkegaard", line: "Então que seu pensamento acompanhe o risco deste passo." },
    ],
    victory: {
      kierkegaard: "Seu sistema encontrou um lugar para tudo, menos para o instante em que eu precisei escolher.",
      hegel: "Seu salto não aboliu a história: tornou-se um novo momento de seu movimento.",
    },
  },
  "kierkegaard:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "Trouxe um guarda-chuva para se proteger da vida?" },
      { speaker: "kierkegaard", line: "Trouxe a decisão de vivê-la sem esconder minha angústia." },
      { speaker: "nietzsche", line: "Então mostre o que seu salto consegue afirmar." },
      { speaker: "kierkegaard", line: "E você, o que seu martelo consegue escolher." },
    ],
    victory: {
      kierkegaard: "Seu martelo quebrou certezas; minha escolha não dependia delas.",
      nietzsche: "Agora transforme esse salto em um sim à terra.",
    },
  },
  "olympe:rousseau": {
    intro: [
      { speaker: "olympe", line: "Seu contrato social prometeu liberdade, mas esqueceu metade da humanidade." },
      { speaker: "rousseau", line: "A ordem civil exige papéis distintos para preservar seus costumes." },
      { speaker: "olympe", line: "Quando a desigualdade se disfarça de costume, a revolução ainda não terminou." },
      { speaker: "rousseau", line: "Então veremos se sua declaração pode fundar uma vontade verdadeiramente comum." },
    ],
    victory: {
      olympe: "Seu contrato proclamou a liberdade do cidadão; minha declaração exigiu que a cidadã também pudesse escrever as leis.",
      rousseau: "Você mostrou que nenhuma vontade pode ser chamada de geral enquanto parte do povo permanece sem voz.",
    },
  },
  "freud:marx": {
    intro: [
      { speaker: "marx", line: "Não procure apenas dentro do indivíduo aquilo que a exploração e as condições materiais produziram." },
      { speaker: "freud", line: "E não imagine que transformar as condições externas dissolverá os conflitos que o sujeito carrega dentro de si." },
      { speaker: "marx", line: "Então veremos se seu divã consegue interpretar uma classe inteira entrando em movimento." },
      { speaker: "freud", line: "E veremos quanto de desejo reprimido se esconde até mesmo sob o nome da revolução." },
    ],
    victory: {
      marx: "Você interpretou os desejos dos homens; eu mostrei as condições materiais que também aprenderam a desejar por eles.",
      freud: "Você revelou o conflito entre classes; eu revelei o conflito que continua quando cada revolucionário fecha os olhos para sonhar.",
    },
  },
  "hegel:marx": {
    intro: [
      { speaker: "hegel", line: "A história é o processo pelo qual a liberdade aprende a reconhecer-se nas instituições do Espírito." },
      { speaker: "marx", line: "Você colocou a história de cabeça para baixo: antes de contemplar o Espírito, os homens precisam produzir a própria vida." },
      { speaker: "hegel", line: "Sem consciência, sua matéria permanece incapaz de compreender o sentido da transformação que realiza." },
      { speaker: "marx", line: "Então veremos se sua consciência absoluta resiste quando a contradição deixa os livros e entra na fábrica." },
    ],
    victory: {
      hegel: "Você tornou concreta a contradição; minha dialética mostrou que até sua revolução participa do movimento pelo qual a liberdade adquire consciência.",
      marx: "Sua dialética explicou o movimento das ideias; minha práxis devolveu-lhe os trabalhadores que movem a história com as próprias mãos.",
    },
  },
  "hegel:schopenhauer": {
    intro: [
      { speaker: "hegel", line: "O real não é um impulso sem direção: é o processo pelo qual a liberdade conquista consciência de si na história." },
      { speaker: "schopenhauer", line: "Você vestiu o sofrimento do mundo com palavras grandiosas e chamou de Espírito aquilo que continua sendo Vontade cega." },
      { speaker: "hegel", line: "Sua Vontade permanece uma noite abstrata na qual nenhuma diferença consegue explicar a si mesma." },
      { speaker: "schopenhauer", line: "E seu sistema permanece um palácio de conceitos construído para não ouvir os gritos que vêm de fora dele." },
    ],
    victory: {
      hegel: "Sua Vontade recusou a história; minha dialética mostrou que até o sofrimento adquire sentido quando a liberdade aprende a reconhecê-lo e transformá-lo.",
      schopenhauer: "Seu Espírito prometeu reconciliar a história; minha bengala encontrou sob o sistema o mesmo querer que move todo corpo e alimenta todo conflito.",
    },
  },
  "kant:schopenhauer": {
    intro: [
      { speaker: "kant", line: "A coisa em si marca o limite do conhecimento; ela não pode ser convertida em objeto de uma nova metafísica." },
      { speaker: "schopenhauer", line: "Em meu próprio corpo, não encontro apenas representação: experimento por dentro aquilo que se manifesta como Vontade." },
      { speaker: "kant", line: "Uma experiência interior ainda ocorre sob condições humanas e não autoriza conhecer a essência de todas as coisas." },
      { speaker: "schopenhauer", line: "Então veremos se sua fronteira resiste quando o querer deixa de pedir licença à razão." },
    ],
    victory: {
      kant: "Você deu um nome à coisa em si; minha crítica preservou o limite que impede a experiência interior de tornar-se dogma universal.",
      schopenhauer: "Sua crítica fechou a porta da coisa em si; meu corpo revelou que a Vontade já estava batendo do lado de dentro.",
    },
  },
  "nietzsche:schopenhauer": {
    intro: [
      { speaker: "schopenhauer", line: "A sabedoria começa quando reconhecemos que todo desejo renova a corrente do sofrimento." },
      { speaker: "nietzsche", line: "Sua sabedoria ensinou a vontade a pedir desculpas por estar viva." },
      { speaker: "schopenhauer", line: "Afirmar cegamente a vida não elimina sua dor; apenas transforma o carrasco em poeta." },
      { speaker: "nietzsche", line: "Prefiro criar dançando sobre o abismo a chamar de libertação o cansaço de quem desistiu." },
    ],
    victory: {
      nietzsche: "Seu pêndulo contou dores; meu amor fati transformou cada golpe em matéria para criar uma vida que ainda merece ser afirmada.",
      schopenhauer: "Seu martelo afirmou o querer; meu pêndulo mostrou que até sua celebração oscila entre a falta que dói e a conquista que logo entedia.",
    },
  },
  "hegel:kant": {
    intro: [
      { speaker: "kant", line: "A razão deve reconhecer os limites da experiência possível para não transformar suas ideias em falsos conhecimentos." },
      { speaker: "hegel", line: "Todo limite reconhecido já contém uma relação com aquilo que procura excluir — e, por isso, o movimento de sua superação." },
      { speaker: "kant", line: "Superar um limite lógico não concede conhecimento daquilo que nenhuma experiência pode apresentar." },
      { speaker: "hegel", line: "Sua crítica foi necessária; mas a razão não permanece diante da fronteira. Ela compreende como a própria fronteira nasceu e a transforma em momento do saber." },
    ],
    victory: {
      kant: "Sua dialética quis dissolver os limites; minha crítica preservou a diferença entre aquilo que podemos pensar e aquilo que podemos conhecer.",
      hegel: "Sua crítica traçou a fronteira; minha dialética mostrou que até os limites têm história e se transformam no movimento do Espírito.",
    },
  },
  "hegel:plato": {
    intro: [
      { speaker: "plato", line: "A verdade permanece eterna e imutável no mundo inteligível, acima da mudança sensível." },
      { speaker: "hegel", line: "Uma verdade separada do devir permanece abstrata. O verdadeiro é o todo que se realiza através de suas diferenças." },
      { speaker: "plato", line: "Sem uma medida eterna, a história confunde transformação com verdade." },
      { speaker: "hegel", line: "O eterno não paira fora do tempo: ele torna-se concreto ao reconciliar-se com a história que o revela." },
    ],
    victory: {
      plato: "Sua história multiplicou figuras; minhas Formas preservaram a medida que permite julgá-las.",
      hegel: "Suas Formas buscaram o eterno fora do mundo; meu Espírito encontrou o universal tornando-se concreto na história.",
    },
  },
  "hegel:rousseau": {
    intro: [
      { speaker: "rousseau", line: "A liberdade pertence ao povo que obedece apenas às leis que dá a si mesmo." },
      { speaker: "hegel", line: "A vontade precisa tornar-se concreta em instituições nas quais o indivíduo reconheça a liberdade como obra comum." },
      { speaker: "rousseau", line: "Quando a instituição deixa de expressar a vontade geral, ela converte cidadãos novamente em súditos." },
      { speaker: "hegel", line: "E quando a vontade permanece apenas abstrata, destrói as mediações que poderiam transformar liberdade em vida ética." },
    ],
    victory: {
      rousseau: "Suas instituições prometeram tornar a liberdade concreta; minha vontade geral lembrou que elas continuam legítimas somente enquanto pertencem aos cidadãos.",
      hegel: "Sua vontade proclamou a soberania; minha vida ética mostrou como a liberdade precisa habitar família, sociedade civil e Estado.",
    },
  },
  "kant:rousseau": {
    intro: [
      { speaker: "rousseau", line: "O homem nasce livre, mas a sociedade o ensina a desejar a aprovação dos outros." },
      { speaker: "kant", line: "Você me despertou do otimismo ingênuo e ensinou que a educação deve formar uma humanidade livre." },
      { speaker: "rousseau", line: "Então não transforme a criança em simples executora de regras abstratas." },
      { speaker: "kant", line: "A regra só é moral quando a própria razão autônoma pode reconhecê-la como lei para todos." },
    ],
    victory: {
      rousseau: "Sua lei universal preservou a autonomia; minha liberdade perguntou como formar pessoas capazes de realmente exercê-la.",
      kant: "Sua natureza rompeu correntes externas; meu imperativo mostrou que ser livre é dar a si uma lei que pode valer para todos.",
    },
  },
  "kant:smith": {
    intro: [
      { speaker: "smith", line: "A simpatia nos permite julgar nossas ações pelo olhar de um espectador imparcial." },
      { speaker: "kant", line: "Mas a moral não pode depender apenas do sentimento que o acaso desperta em nós." },
      { speaker: "smith", line: "Uma regra sem atenção às pessoas concretas pode permanecer correta e ainda assim perder a humanidade." },
      { speaker: "kant", line: "Por isso cada pessoa deve ser tratada sempre como um fim, jamais apenas como meio." },
    ],
    victory: {
      smith: "Seu dever universalizou a máxima; minha simpatia lembrou que o juízo moral também precisa enxergar quem está diante de nós.",
      kant: "Seu espectador pesou sentimentos; minha razão garantiu que nenhuma pessoa fosse reduzida a instrumento de outro interesse.",
    },
  },
  "kant:plato": {
    intro: [
      { speaker: "plato", line: "Conhecer é elevar a alma até as Formas que existem além da mudança sensível." },
      { speaker: "kant", line: "Suas palavras avançam para além da experiência possível. Só podemos afirmar como conhecimento aquilo que a razão investiga dentro de seus próprios limites." },
      { speaker: "plato", line: "Sem o inteligível, sua experiência permanece prisioneira das sombras." },
      { speaker: "kant", line: "A crítica não destrói suas perguntas; ela impede que ideias da razão sejam tomadas por objetos que ninguém pode conhecer." },
    ],
    victory: {
      plato: "Você limitou o conhecimento ao fenômeno; minhas Formas recordaram que a verdade não se esgota naquilo que aparece.",
      kant: "Suas Formas atravessaram a caverna; minha crítica mostrou onde a razão pode conhecer — e onde deve aprender a não inventar objetos.",
    },
  },
  "rousseau:smith": {
    intro: [
      { speaker: "rousseau", line: "A sociedade transformou o homem livre em escravo das aparências e da propriedade." },
      { speaker: "smith", line: "E a cooperação transformou necessidades dispersas em prosperidade compartilhada." },
      { speaker: "rousseau", line: "Quando a riqueza compra influência, o interesse privado captura a vontade de todos." },
      { speaker: "smith", line: "Por isso mercados precisam de justiça, concorrência e sentimentos morais — não da adoração cega da riqueza." },
    ],
    victory: {
      rousseau: "Sua troca coordenou interesses; minha vontade geral perguntou se o resultado ainda pertencia igualmente aos cidadãos.",
      smith: "Sua vontade reuniu o povo; minha divisão do trabalho mostrou como pessoas diferentes podem cooperar sem deixar de ser livres.",
    },
  },
  "hobbes:smith": {
    intro: [
      { speaker: "hobbes", line: "Somente o soberano contém o egoísmo humano e impede que a competição termine em guerra." },
      { speaker: "smith", line: "O interesse também pode produzir cooperação quando regras justas tornam a troca preferível à violência." },
      { speaker: "hobbes", line: "Sem espada comum, seus contratos valem apenas enquanto ninguém deseja rompê-los." },
      { speaker: "smith", line: "Sem confiança e justiça, nem mesmo sua espada consegue fabricar uma sociedade próspera." },
    ],
    victory: {
      hobbes: "Sua mão invisível coordenou mercadorias; meu soberano preservou a paz sem a qual nenhuma delas chegaria ao porto.",
      smith: "Seu Leviatã conteve a guerra; minhas trocas mostraram por que a paz precisa produzir mais que obediência.",
    },
  },
  "locke:smith": {
    intro: [
      { speaker: "locke", line: "A propriedade começa quando o trabalho individual transforma aquilo que a natureza ofereceu em comum." },
      { speaker: "smith", line: "E sua produtividade cresce quando muitos trabalhos diferentes se coordenam pela troca." },
      { speaker: "locke", line: "Nenhum mercado é legítimo se o governo deixa de proteger os direitos de quem participa dele." },
      { speaker: "smith", line: "Nem permanece livre quando privilégios e monopólios impedem a concorrência." },
    ],
    victory: {
      locke: "Sua divisão multiplicou o produto; meus direitos preservaram a pessoa que jamais deve tornar-se apenas uma etapa da produção.",
      smith: "Seus direitos protegeram o indivíduo; minha cooperação mostrou quanto indivíduos protegidos podem construir juntos.",
    },
  },
  "hobbes:rousseau": {
    intro: [
      { speaker: "hobbes", line: "Sem uma força soberana, a liberdade termina na guerra de todos contra todos." },
      { speaker: "rousseau", line: "Uma força que não nasce do povo apenas troca a guerra pela obediência." },
      { speaker: "hobbes", line: "A segurança vem antes da participação: mortos não deliberam sobre o bem comum." },
      { speaker: "rousseau", line: "E súditos não são cidadãos. A paz legítima começa quando obedecemos às leis que damos a nós mesmos." },
    ],
    victory: {
      hobbes: "Sua vontade geral prometeu liberdade; meu Leviatã impediu que vontades particulares a destruíssem antes do pacto.",
      rousseau: "Seu soberano silenciou o conflito; minha vontade geral devolveu a voz àqueles que deveriam governar a si mesmos.",
    },
  },
  "locke:rousseau": {
    intro: [
      { speaker: "locke", line: "O governo é legítimo quando protege vida, liberdade e propriedade." },
      { speaker: "rousseau", line: "A propriedade sem igualdade suficiente transforma liberdade jurídica em privilégio." },
      { speaker: "locke", line: "Sem direitos individuais, o bem comum pode se tornar o nome elegante da tirania." },
      { speaker: "rousseau", line: "Sem vontade geral, seus direitos permanecem cercados pelas desigualdades que o contrato deveria superar." },
    ],
    victory: {
      locke: "Você reuniu cidadãos no todo; eu preservei os direitos sem os quais nenhum cidadão continua livre diante desse todo.",
      rousseau: "Você protegeu indivíduos contra o governo; eu perguntei quem protege o povo contra uma desigualdade convertida em direito.",
    },
  },
  "hobbes:locke": {
    intro: [
      { speaker: "locke", line: "O Estado existe para proteger direitos que já pertencem aos indivíduos." },
      { speaker: "hobbes", line: "Direitos sem uma força comum são promessas pronunciadas no meio da guerra." },
      { speaker: "locke", line: "Um soberano que viola a liberdade perde a legitimidade de governar." },
      { speaker: "hobbes", line: "E um governo desfeito devolve todos ao medo que tornou o pacto necessário." },
    ],
    victory: {
      locke: "Seu Leviatã prometeu segurança; meus direitos lembraram que a paz também precisa proteger a liberdade.",
      hobbes: "Você preservou direitos no papel; meu soberano preservou as pessoas capazes de exercê-los.",
    },
  },
  "descartes:hobbes": {
    intro: [
      { speaker: "descartes", line: "A razão encontra princípios claros antes de se submeter ao tumulto das paixões." },
      { speaker: "hobbes", line: "Todo raciocínio começa em corpos, movimentos e nomes aprendidos na experiência." },
      { speaker: "descartes", line: "Ainda assim, nenhuma sensação derruba a certeza de que penso." },
      { speaker: "hobbes", line: "Pense depressa. O estado de natureza não espera seu método terminar." },
    ],
    victory: {
      descartes: "Seu medo explicou por que os homens obedecem; meu cogito mostrou quem ainda pensa enquanto obedece.",
      hobbes: "Sua certeza salvou o pensador; meu pacto salvou seu corpo tempo suficiente para que continuasse pensando.",
    },
  },
  "descartes:locke": {
    intro: [
      { speaker: "descartes", line: "Os sentidos já me enganaram. Uma certeza digna desse nome precisa nascer da razão." },
      { speaker: "locke", line: "Sem os sentidos, sua razão seria uma sala elegante — e completamente vazia." },
      { speaker: "descartes", line: "A mente reconhece verdades que nenhuma experiência isolada poderia garantir." },
      { speaker: "locke", line: "Então mostre sua ideia inata. Eu mostrarei cada impressão que a ensinou a falar." },
    ],
    victory: {
      descartes: "Sua experiência encheu a página; minha razão mostrou por que algumas marcas podem ser chamadas de verdade.",
      locke: "Seu cogito encontrou uma mente pensando; minha experiência mostrou de onde vieram os conteúdos desse pensamento.",
    },
  },
  "descartes:galileo": {
    intro: [
      { speaker: "galileo", line: "A natureza deve ser interrogada por experiências, medidas e observações." },
      { speaker: "descartes", line: "E toda experiência precisa de uma razão capaz de distinguir evidência de aparência." },
      { speaker: "galileo", line: "Seu método começa junto à lareira. O meu sobe à torre e aponta o telescópio." },
      { speaker: "descartes", line: "Então traga seus dados. Eu examinarei o fundamento que permite compreendê-los." },
    ],
    victory: {
      galileo: "Sua certeza nasceu no pensamento; minhas luas mostraram que o céu também sabe corrigir filósofos.",
      descartes: "Você ampliou os sentidos. Eu mostrei por que nenhum instrumento dispensa o exame da razão.",
    },
  },
  "agostinho:descartes": {
    intro: [
      { speaker: "agostinho", line: "Voltei ao interior e encontrei a verdade acima de uma mente inquieta." },
      { speaker: "descartes", line: "Eu também comecei dentro, mas submeti cada certeza à prova da dúvida." },
      { speaker: "agostinho", line: "Antes de seu cogito, eu já sabia que quem se engana existe." },
      { speaker: "descartes", line: "Então veremos qual interioridade suporta melhor o gênio maligno." },
    ],
    victory: {
      agostinho: "Seu cogito encontrou o pensador; minha inquietação ainda lhe pergunta para onde esse pensamento deve voltar.",
      descartes: "Sua luz guiou a alma. Minha dúvida provou que o pensamento permanece mesmo quando toda luz parece apagar-se.",
    },
  },
  "descartes:plato": {
    intro: [
      { speaker: "plato", line: "O conhecimento começa quando a alma se afasta das aparências sensíveis." },
      { speaker: "descartes", line: "Concordamos em desconfiar dos sentidos; discordamos sobre quantos mundos são necessários." },
      { speaker: "plato", line: "Sem as Formas, sua clareza não sabe de qual verdade participa." },
      { speaker: "descartes", line: "Sem um método, suas Formas podem ser apenas o sonho mais elegante da caverna." },
    ],
    victory: {
      plato: "Seu método duvidou das sombras, mas ainda precisou voltar-se para uma verdade que não muda.",
      descartes: "Você deixou a caverna por outro mundo. Eu encontrei a primeira certeza no próprio ato de pensar.",
    },
  },
  "descartes:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "Por trás de seu sujeito racional ainda fala uma antiga vontade de transformar vida em certeza." },
      { speaker: "descartes", line: "E por trás de sua suspeita ainda há um pensamento que precisa existir para suspeitar." },
      { speaker: "nietzsche", line: "O eu não pensa; pensamentos acontecem e depois inventam um autor." },
      { speaker: "descartes", line: "Duvidar do autor não elimina o acontecimento irrecusável do pensamento." },
    ],
    victory: {
      nietzsche: "Seu cogito ergueu um trono para o sujeito; meu martelo mostrou as forças escondidas sob ele.",
      descartes: "Você golpeou o sujeito. O pensamento que executou o golpe confirmou minha primeira certeza.",
    },
  },
  "aristotle:galileo": {
    intro: [
      { speaker: "aristotle", line: "Conhecer o movimento é compreender suas causas naturais." },
      { speaker: "galileo", line: "Então deixemos os corpos caírem e perguntemos à natureza, não apenas aos livros." },
      { speaker: "aristotle", line: "Uma experiência isolada não substitui uma explicação completa." },
      { speaker: "galileo", line: "Concordo. Mas nenhuma explicação completa sobrevive se a experiência a contradiz." },
    ],
    victory: {
      aristotle: "Você mediu a queda; eu ainda lhe pergunto por suas causas, sua forma e sua finalidade.",
      galileo: "Sua autoridade pesava mais; diante da natureza, os dois corpos chegaram juntos ao chão.",
    },
  },
  "galileo:hypatia": {
    intro: [
      { speaker: "hypatia", line: "A geometria torna inteligíveis os movimentos do céu." },
      { speaker: "galileo", line: "E o telescópio permite que o céu corrija nossa geometria." },
      { speaker: "hypatia", line: "Então observe com rigor e calcule sem preconceito." },
      { speaker: "galileo", line: "É exatamente assim que quatro luas derrubam um universo inteiro." },
    ],
    victory: {
      hypatia: "Seu telescópio ampliou a visão; meu cálculo mostrou como interpretar aquilo que apareceu.",
      galileo: "A matemática preparou o olhar; minhas lentes obrigaram o cosmos a responder.",
    },
  },
  "galileo:thomas": {
    intro: [
      { speaker: "thomas", line: "A razão e a fé não se contradizem quando ambas procuram honestamente a verdade." },
      { speaker: "galileo", line: "Então não façamos das Escrituras um manual para medir o movimento dos céus." },
      { speaker: "thomas", line: "A interpretação deve respeitar aquilo que a demonstração torna conhecido." },
      { speaker: "galileo", line: "Ótimo. Traga sua razão; eu trouxe o telescópio." },
    ],
    victory: {
      thomas: "Sua observação descreveu o movimento; minha pergunta alcançou o princípio que o torna possível.",
      galileo: "Seu primeiro motor ficou além do céu; minhas quatro luas mudaram o céu que todos podiam observar.",
    },
  },
  "galileo:machiavelli": {
    intro: [
      { speaker: "machiavelli", line: "A verdade sem ocasião política pode terminar silenciada." },
      { speaker: "galileo", line: "E a política sem verdade pode ordenar que o próprio céu permaneça imóvel." },
      { speaker: "machiavelli", line: "Sobreviver também é escolher quando falar e quando recuar." },
      { speaker: "galileo", line: "Posso recuar diante do tribunal; as luas de Júpiter não recuam em suas órbitas." },
    ],
    victory: {
      machiavelli: "Você observou os céus; eu observei o poder que decide quais verdades chegam à praça.",
      galileo: "Seu príncipe governou homens por um tempo; minhas observações mudaram o universo deles.",
    },
  },
  "machiavelli:thomas": {
    intro: [
      { speaker: "thomas", line: "A política deve orientar-se pelo bem comum e por uma lei que não nasce apenas da força." },
      { speaker: "machiavelli", line: "Uma lei sem força permanece uma homilia diante de homens armados." },
      { speaker: "thomas", line: "E uma força sem justiça transforma o governante na ruína do próprio reino." },
      { speaker: "machiavelli", line: "Então vejamos qual princípio sobrevive quando a Fortuna muda o campo de batalha." },
    ],
    victory: {
      thomas: "Você conservou o poder por um instante; eu preservei a razão pela qual ele merece existir.",
      machiavelli: "Seu bem comum apontou o destino. Minha virtù garantiu que o Estado chegasse vivo até ele.",
    },
  },
  "machiavelli:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "Você ensinou pequenos governantes a disfarçar o medo de virtude política." },
      { speaker: "machiavelli", line: "E você transformou a solidão em um trono que ninguém mais reconheceu." },
      { speaker: "nietzsche", line: "Minha vontade cria valores; seu príncipe apenas administra decadências." },
      { speaker: "machiavelli", line: "Criar valores é fácil quando não se precisa governar homens reais." },
    ],
    victory: {
      nietzsche: "Seu príncipe dominou a ocasião; minha vontade recusou o mundo estreito que ele desejava conservar.",
      machiavelli: "Sua vontade sonhou acima dos homens. Meu príncipe venceu entre eles.",
    },
  },
  "machiavelli:plato": {
    intro: [
      { speaker: "plato", line: "A cidade justa deve ser governada por quem contempla o Bem." },
      { speaker: "machiavelli", line: "Enquanto seu filósofo contempla, outro homem ocupa o palácio." },
      { speaker: "plato", line: "Sem justiça, conservar o poder é apenas prolongar uma doença." },
      { speaker: "machiavelli", line: "Sem poder, sua justiça não consegue sequer abrir os portões da cidade." },
    ],
    victory: {
      plato: "Você conservou a cidade sensível; eu recordei por que ela ainda deve aspirar à justiça.",
      machiavelli: "Seu governante encontrou o Bem. O meu encontrou a ocasião e conservou a cidade.",
    },
  },
  "aristotle:machiavelli": {
    intro: [
      { speaker: "aristotle", line: "A cidade existe para tornar possível uma vida boa." },
      { speaker: "machiavelli", line: "Antes de viver bem, a cidade precisa sobreviver aos que desejam conquistá-la." },
      { speaker: "aristotle", line: "Separar poder e virtude corrompe tanto o governante quanto a pólis." },
      { speaker: "machiavelli", line: "Confundir virtude moral com virtù política entrega a pólis ao primeiro inimigo decidido." },
    ],
    victory: {
      aristotle: "Você preservou a cidade; eu preservei a finalidade que faz dela algo maior que uma fortaleza.",
      machiavelli: "Sua finalidade esperou no horizonte. Minha estratégia impediu que a cidade desaparecesse no caminho.",
    },
  },
  "averroes:machiavelli": {
    intro: [
      { speaker: "averroes", line: "A demonstração distingue conhecimento de mera conveniência." },
      { speaker: "machiavelli", line: "Na política, uma verdade inconveniente pode chegar tarde demais para salvar o Estado." },
      { speaker: "averroes", line: "Então sua pressa governará sem compreender as causas." },
      { speaker: "machiavelli", line: "E seu comentário compreenderá perfeitamente um reino que já deixou de existir." },
    ],
    victory: {
      averroes: "Sua ocasião passou; a causa verdadeira continuou exigindo demonstração.",
      machiavelli: "Você explicou as causas. Eu agi antes que elas se tornassem epitáfio.",
    },
  },
  "diogenes:machiavelli": {
    intro: [
      { speaker: "diogenes", line: "Escreveu um manual para príncipes. Eu não obedeceria nem ao índice." },
      { speaker: "machiavelli", line: "Sua liberdade depende da cidade que permite que você durma no barril." },
      { speaker: "diogenes", line: "E seu príncipe depende de homens que ainda acreditam precisar dele." },
      { speaker: "machiavelli", line: "Basta que acreditem até o fim desta luta." },
    ],
    victory: {
      diogenes: "Seu príncipe conquistou tudo e continuou pobre demais para abandonar o poder.",
      machiavelli: "Você desprezou o Estado; ele continuou decidindo se seu barril permaneceria sob o sol.",
    },
  },
  "aristotle:thomas": {
    intro: [
      { speaker: "aristotle", line: "Meu primeiro motor move o cosmos como causa final, sem precisar entrar no mundo para empurrá-lo." },
      { speaker: "thomas", line: "E sua razão abriu uma via para pensar o princípio que chamamos Deus." },
      { speaker: "aristotle", line: "Não transforme minha metafísica em uma conclusão que ela não demonstrou." },
      { speaker: "thomas", line: "Então examinemos cada passo: da potência ao ato, sem saltos e sem medo." },
    ],
    victory: {
      aristotle: "Você batizou meu primeiro motor; eu ainda reconheço nele a arquitetura da minha filosofia.",
      thomas: "Você mostrou o movimento. Eu segui sua causa até aquilo que move sem ser movido.",
    },
  },
  "averroes:thomas": {
    intro: [
      { speaker: "averroes", line: "Comentei Aristóteles para que a razão não fosse prisioneira da autoridade." },
      { speaker: "thomas", line: "E eu o li para mostrar que a razão pode caminhar até a fé sem deixar de ser razão." },
      { speaker: "averroes", line: "Não confunda o limite da demonstração com permissão para impor uma crença." },
      { speaker: "thomas", line: "Nem confunda aquilo que excede a razão com aquilo que a contradiz." },
    ],
    victory: {
      averroes: "Sua síntese quis encerrar o comentário; a razão manteve a margem aberta.",
      thomas: "Você devolveu Aristóteles ao Ocidente. Eu mostrei que recebê-lo exigia também responder-lhe.",
    },
  },
  "agostinho:thomas": {
    intro: [
      { speaker: "agostinho", line: "Entrei em mim mesmo e encontrei a luz pela qual a verdade se deixa reconhecer." },
      { speaker: "thomas", line: "Eu partirei dos sentidos e do movimento do mundo para chegar à mesma verdade." },
      { speaker: "agostinho", line: "O coração chega antes onde o argumento ainda procura caminho." },
      { speaker: "thomas", line: "Mas o amor também precisa da razão para não adorar a própria imagem." },
    ],
    victory: {
      agostinho: "Suas vias atravessaram o mundo; minha inquietação já esperava no interior.",
      thomas: "Sua luz orientou a alma. Minha demonstração mostrou que o mundo também pode testemunhar.",
    },
  },
  "diogenes:thomas": {
    intro: [
      { speaker: "diogenes", line: "Chamaram você de Boi Mudo. Até agora, só vi o boi." },
      { speaker: "thomas", line: "A humildade me ensinou a não responder toda provocação. Esta merece uma demonstração." },
      { speaker: "diogenes", line: "Uma Suma inteira para explicar o que meu cão fareja em segundos." },
      { speaker: "thomas", line: "Seu cão reconhece a verdade. Você ainda precisa aprender a argumentá-la." },
    ],
    victory: {
      diogenes: "O boi fez barulho; minha lanterna continuou iluminando o excesso de palavras.",
      thomas: "Você reduziu tudo ao necessário. Esqueceu que até o necessário exige uma causa.",
    },
  },
  "hypatia:thomas": {
    intro: [
      { speaker: "hypatia", line: "Uma verdade que entra na arena deve aceitar medida, cálculo e demonstração." },
      { speaker: "thomas", line: "Concordo. A fé não autoriza uma razão preguiçosa." },
      { speaker: "hypatia", line: "Então não chame de mistério aquilo que uma pergunta ainda pode alcançar." },
      { speaker: "thomas", line: "E não chame de impossível aquilo que seu instrumento ainda não consegue medir." },
    ],
    victory: {
      hypatia: "Suas vias apontaram para além do céu; meu cálculo permaneceu onde a demonstração podia responder.",
      thomas: "Seu astrolábio mediu o movimento. Minha via perguntou por que há movimento em vez de repouso absoluto.",
    },
  },
  "nietzsche:thomas": {
    intro: [
      { speaker: "nietzsche", line: "Você ensinou Aristóteles a se ajoelhar diante da cruz." },
      { speaker: "thomas", line: "Não. Ensinei a fé a responder diante do tribunal da razão." },
      { speaker: "nietzsche", line: "Sua harmonia ainda domestica a vida em nome de um além." },
      { speaker: "thomas", line: "E sua revolta ainda depende da verdade que afirma ter superado." },
    ],
    victory: {
      nietzsche: "Seu primeiro motor parou diante de uma vontade que não aceita ser movida do alto.",
      thomas: "Seu martelo atingiu ídolos. Não alcançou a causa pela qual ainda procura a verdade.",
    },
  },
  "agostinho:amenemope": {
    intro: [
      { speaker: "amenemope", line: "A sabedoria ordena o coração antes de ordenar a cidade." },
      { speaker: "agostinho", line: "E o coração permanece inquieto enquanto ama aquilo que o dispersa." },
      { speaker: "amenemope", line: "A serenidade mede o desejo antes que ele se torne desmedida." },
      { speaker: "agostinho", line: "Então veremos qual de nós conhece melhor o peso da própria vontade." },
    ],
    victory: {
      amenemope: "Seu coração confessou a inquietação; minha balança mostrou quanto ela ainda pesava.",
      agostinho: "Você mediu meu coração. Eu descobri o amor que dava peso a cada escolha.",
    },
  },
  "agostinho:homero": {
    intro: [
      { speaker: "homero", line: "Meus heróis buscaram glória para não desaparecer no esquecimento." },
      { speaker: "agostinho", line: "E eu atravessei a memória para descobrir quem ainda desejava ser lembrado." },
      { speaker: "homero", line: "Sem o canto das Musas, até os grandes homens se tornam silêncio." },
      { speaker: "agostinho", line: "Há uma palavra que escuta até aquilo que o homem não consegue confessar." },
    ],
    victory: {
      homero: "Sua confissão terminou; meu canto ainda atravessará os séculos.",
      agostinho: "Você cantou a glória dos heróis. Eu venci a necessidade de parecer um deles.",
    },
  },
  "agostinho:tales": {
    intro: [
      { speaker: "tales", line: "Procurei na água o princípio comum a todas as coisas." },
      { speaker: "agostinho", line: "Eu procurei na alma aquilo que torna possível reconhecer qualquer princípio." },
      { speaker: "tales", line: "A natureza não precisa esconder sua causa dentro de nós." },
      { speaker: "agostinho", line: "Mas toda explicação do mundo passa pelo julgamento de quem a contempla." },
    ],
    victory: {
      tales: "Enquanto você voltou os olhos para dentro, a natureza continuou revelando seu princípio.",
      agostinho: "Você encontrou água em toda parte. Eu encontrei a sede que nenhum elemento consegue saciar.",
    },
  },
  "agostinho:socrates": {
    intro: [
      { speaker: "socrates", line: "Conhecer a si mesmo é o começo de toda vida examinada." },
      { speaker: "agostinho", line: "Entrei em mim mesmo e encontrei algo maior do que eu." },
      { speaker: "socrates", line: "Como sabe que não encontrou apenas outra certeza sem exame?" },
      { speaker: "agostinho", line: "Porque até minha dúvida precisou de uma verdade para reconhecer-se como dúvida." },
    ],
    victory: {
      socrates: "Você entrou em si mesmo, Agostinho. Minha pergunta chegou antes e deixou a porta aberta.",
      agostinho: "Você ensinou o exame. Eu descobri por que a alma jamais termina de interrogar-se.",
    },
  },
  "agostinho:diogenes": {
    intro: [
      { speaker: "diogenes", line: "Procurei um homem honesto. Encontrei um pecador arrependido." },
      { speaker: "agostinho", line: "Então finalmente encontrou um homem honesto." },
      { speaker: "diogenes", line: "Tanta confissão para dizer que desejou o que todos desejam." },
      { speaker: "agostinho", line: "E tanta provocação para esconder que você também deseja uma plateia." },
    ],
    victory: {
      diogenes: "Você escreveu um livro para confessar. Eu precisei apenas apontar o ridículo.",
      agostinho: "Sua lanterna encontrou minhas faltas. Minha confissão mostrou por que você nunca larga a lanterna.",
    },
  },
  "agostinho:aristotle": {
    intro: [
      { speaker: "aristotle", line: "Todo ser tende à realização de sua finalidade." },
      { speaker: "agostinho", line: "E toda vontade pode afastar-se do bem que verdadeiramente procura." },
      { speaker: "aristotle", line: "A virtude educa o desejo por meio do hábito e da justa medida." },
      { speaker: "agostinho", line: "O hábito orienta os gestos; o amor decide para onde a vida inteira caminha." },
    ],
    victory: {
      aristotle: "Sua vontade se inquietou; minha virtude transformou potência em ato.",
      agostinho: "Você explicou a finalidade dos atos. Eu revelei o amor que escolhia cada finalidade.",
    },
  },
  "agostinho:sidarta": {
    intro: [
      { speaker: "sidarta", line: "O apego alimenta o sofrimento." },
      { speaker: "agostinho", line: "Mas o amor não é apego quando nos conduz para além de nós mesmos." },
      { speaker: "sidarta", line: "Aquilo que chamamos de eu também muda e não pode ser possuído." },
      { speaker: "agostinho", line: "Ainda assim, alguém recorda a mudança e pergunta pelo sentido do caminho." },
    ],
    victory: {
      sidarta: "Sua inquietação buscou repouso; eu mostrei como cessar o apego que a alimentava.",
      agostinho: "Você silenciou o apego. Eu distingui dele o amor que faz a alma sair de si.",
    },
  },
  "agostinho:confucius": {
    intro: [
      { speaker: "confucius", line: "A virtude nasce no cuidado com as relações." },
      { speaker: "agostinho", line: "E amadurece quando a vontade aprende a amar o bem." },
      { speaker: "confucius", line: "Um caráter cultivado dispensa promessas sobre outra cidade." },
      { speaker: "agostinho", line: "Toda cidade revela aquilo que seus cidadãos escolheram amar." },
    ],
    victory: {
      confucius: "Você procurou a cidade celeste; eu comecei educando os gestos desta cidade.",
      agostinho: "Seus ritos organizaram os gestos. Eu revelei o amor que lhes dá direção.",
    },
  },
  "agostinho:marcus": {
    intro: [
      { speaker: "marcus", line: "O homem deve encontrar sua fortaleza dentro de si." },
      { speaker: "agostinho", line: "Entrei em mim mesmo e encontrei algo maior do que eu." },
      { speaker: "marcus", line: "O julgamento disciplinado basta para enfrentar aquilo que acontece." },
      { speaker: "agostinho", line: "Basta para suportar o mundo; não para curar a vontade que o transforma em ídolo." },
    ],
    victory: {
      marcus: "Sua alma buscou uma cidade eterna; minha cidadela permaneceu firme nesta batalha.",
      agostinho: "Você governou o julgamento. Eu perguntei qual amor governava o imperador.",
    },
  },
  "agostinho:hypatia": {
    intro: [
      { speaker: "hypatia", line: "A verdade não teme cálculo nem demonstração." },
      { speaker: "agostinho", line: "Nem a fé verdadeira teme a razão que a interroga." },
      { speaker: "hypatia", line: "Então não invoque mistério onde uma pergunta ainda pode avançar." },
      { speaker: "agostinho", line: "E não confunda aquilo que ainda não mediu com aquilo que não pode existir." },
    ],
    victory: {
      hypatia: "Sua luz interior brilhou; meu astrolábio ainda exigiu medida e demonstração.",
      agostinho: "Você calculou os astros. Eu perguntei quem, em nós, reconhece a ordem do céu.",
    },
  },
  "agostinho:plato": {
    intro: [
      { speaker: "plato", line: "Sua cidade celeste é apenas uma sombra do meu mundo inteligível." },
      { speaker: "agostinho", line: "Você contemplou a luz, Platão, mas não conheceu sua fonte." },
      { speaker: "plato", line: "A alma sobe quando abandona as aparências e recorda as Formas." },
      { speaker: "agostinho", line: "Ela sobe quando a verdade ilumina a memória e converte a vontade." },
    ],
    victory: {
      plato: "Sua iluminação apontou para o alto; minhas Formas já esperavam por ela.",
      agostinho: "Você abriu o caminho para o inteligível. Eu mostrei por que a luz também nos chama pelo nome.",
    },
  },
  "agostinho:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "Seu Deus transformou a culpa em virtude." },
      { speaker: "agostinho", line: "E seu orgulho transformou as feridas em filosofia." },
      { speaker: "nietzsche", line: "Sua Cidade de Deus foi construída contra a inocência da vida." },
      { speaker: "agostinho", line: "Não. Foi construída contra o amor ao poder que chama a própria violência de inocência." },
    ],
    victory: {
      nietzsche: "Sua confissão terminou ajoelhada; minha vida permaneceu de pé diante do abismo.",
      agostinho: "Seu martelo quebrou ídolos alheios. Minha confissão revelou o ídolo que segurava o martelo.",
    },
  },
  "amenemope:homero": {
    intro: [
      {
        speaker: "homero",
        line:
          "Os deuses pesam destinos, sábio do Nilo. Que canto escreverão para nós?",
      },
      {
        speaker: "amenemope",
        line:
          "Nenhum deus torna leve o coração que se entrega à própria desmedida.",
      },
      {
        speaker: "homero",
        line:
          "Até Aquiles precisou aprender que a glória sem compaixão deixa apenas cinzas.",
      },
      {
        speaker: "amenemope",
        line:
          "Então lute como quem deseja ser lembrado também pela justiça.",
      },
    ],
    victory: {
      amenemope:
        "Os deuses podem inspirar o canto; os atos ainda pertencem ao coração.",
      homero:
        "Maat encontrou as Musas, e deste combate nasceu um canto equilibrado.",
    },
  },
  "amenemope:nietzsche": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "Aquele que não governa o próprio coração torna-se escravo de seus impulsos.",
      },
      {
        speaker: "nietzsche",
        line:
          "E aquele que passa a vida governando-se talvez nunca tenha aprendido a viver.",
      },
      {
        speaker: "amenemope",
        line:
          "Liberdade sem medida é apenas outra forma de servidão.",
      },
      {
        speaker: "nietzsche",
        line:
          "Então veremos se sua medida resiste àquele que cria os próprios valores.",
      },
    ],
    victory: {
      amenemope: "Superar a si mesmo também exige serenidade.",
      nietzsche: "Seu equilíbrio era apenas o medo de cair.",
    },
  },
  "homero:plato": {
    intro: [
      {
        speaker: "homero",
        line:
          "Antes da Academia, meus versos já ensinavam aos gregos a coragem, a honra e o destino.",
      },
      {
        speaker: "plato",
        line:
          "E também lhes ofereciam sombras de deuses movidos pelas mesmas paixões dos homens.",
      },
      {
        speaker: "homero",
        line:
          "Sem o mito, Platão, talvez nem suas Ideias encontrassem uma linguagem para nascer.",
      },
      {
        speaker: "plato",
        line:
          "Então veremos se a beleza do canto resiste ao exame da verdade.",
      },
    ],
    victory: {
      homero:
        "Você quis expulsar os poetas, mas até sua filosofia será lembrada como uma grande narrativa.",
      plato:
        "A poesia desperta a alma; a filosofia deve ensiná-la a distinguir imagem e verdade.",
    },
  },
  "homero:nietzsche": {
    intro: [
      {
        speaker: "homero",
        line:
          "Conheço a força dos heróis e o preço cobrado pelos deuses. O que busca seu martelo?",
      },
      {
        speaker: "nietzsche",
        line:
          "Despertar em seus heróis a coragem de criar o destino sem pedir licença ao Olimpo.",
      },
      {
        speaker: "homero",
        line:
          "Nem Aquiles escapou às Moiras, embora sua vontade incendiasse Troia.",
      },
      {
        speaker: "nietzsche",
        line:
          "Justamente por ser mortal, ele escolheu uma vida capaz de tornar-se canto.",
      },
    ],
    victory: {
      homero:
        "Você negou os deuses, mas lutou como um herói desejoso de eternidade.",
      nietzsche:
        "Seus deuses morreram; permaneceu a potência trágica de seus heróis.",
    },
  },
  "amenemope:tales": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "No Egito, a água do Nilo sustenta a ordem da vida. Por que fazê-la origem de tudo?",
      },
      {
        speaker: "tales",
        line:
          "Porque onde há vida encontro umidade, transformação e permanência sob formas diferentes.",
      },
      {
        speaker: "amenemope",
        line:
          "Conhecer o curso das águas não basta para governar o coração.",
      },
      {
        speaker: "tales",
        line:
          "Concordo. Mas quem observa a natureza aprende que até a força precisa de medida.",
      },
    ],
    victory: {
      amenemope:
        "Encontrar o princípio do cosmos não dispensa o equilíbrio dos atos.",
      tales:
        "O Nilo ensinou sua medida; a natureza revelou seu princípio.",
    },
  },
  "homero:tales": {
    intro: [
      {
        speaker: "homero",
        line:
          "Posêidon governa o mar. Por que buscar outra causa?",
      },
      {
        speaker: "tales",
        line:
          "Porque a natureza também pode ser explicada pela razão.",
      },
      {
        speaker: "homero",
        line:
          "Os mitos revelam o sentido do mundo.",
      },
      {
        speaker: "tales",
        line:
          "A filosofia investiga do que o mundo é feito.",
      },
    ],
    victory: {
      homero:
        "Você explicou as ondas, mas ainda precisou de uma história para atravessar o tempo.",
      tales:
        "Os deuses permaneceram no poema; o mundo abriu-se à investigação.",
    },
  },
  "plato:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "Procuro na água o princípio comum às mudanças que vemos.",
      },
      {
        speaker: "plato",
        line:
          "Um princípio sensível ainda pertence ao mundo das aparências.",
      },
      {
        speaker: "tales",
        line:
          "Antes de abandonar o mundo, é preciso aprender a observá-lo.",
      },
      {
        speaker: "plato",
        line:
          "E depois da observação, elevar-se ao que não nasce nem perece.",
      },
    ],
    victory: {
      tales:
        "A verdade não precisa abandonar a natureza para possuir unidade.",
      plato:
        "Sua água muda de forma; a Ideia permanece.",
    },
  },
  "nietzsche:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "No múltiplo, busco uma origem comum capaz de tornar o cosmos inteligível.",
      },
      {
        speaker: "nietzsche",
        line:
          "Toda origem única é uma simplificação inventada por quem teme o caos.",
      },
      {
        speaker: "tales",
        line:
          "Investigar não é temer o caos, mas descobrir relações onde antes havia espanto.",
      },
      {
        speaker: "nietzsche",
        line:
          "Então veremos se sua água apaga a força do devir.",
      },
    ],
    victory: {
      tales:
        "O devir também precisa de um mundo no qual possa acontecer.",
      nietzsche:
        "Sua arché evaporou diante da multiplicidade da vida.",
    },
  },
  "amenemope:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Amenemope, um coração equilibrado basta para tornar uma vida justa?",
      },
      {
        speaker: "amenemope",
        line:
          "O equilíbrio governa os impulsos, mas a justiça também exige verdade nos atos.",
      },
      {
        speaker: "socrates",
        line:
          "Então examinemos se conhecemos a verdade ou apenas repetimos o que parece correto.",
      },
      {
        speaker: "amenemope",
        line:
          "Pergunte com medida, ateniense. Até a dúvida pode tornar-se desmedida.",
      },
    ],
    victory: {
      amenemope:
        "O exame é valioso quando também pesa as consequências de cada palavra.",
      socrates:
        "Seu equilíbrio resistiu porque aceitou ser interrogado.",
    },
  },
  "homero:socrates": {
    intro: [
      {
        speaker: "homero",
        line:
          "Meus heróis ensinam coragem, honra e prudência. O que suas perguntas ensinam?",
      },
      {
        speaker: "socrates",
        line:
          "A distinguir coragem de imprudência e honra de desejo por aplausos.",
      },
      {
        speaker: "homero",
        line:
          "Aquiles escolheu uma vida breve e gloriosa sabendo o preço da decisão.",
      },
      {
        speaker: "socrates",
        line:
          "Então examinemos se conhecer o preço é o mesmo que escolher o bem.",
      },
    ],
    victory: {
      homero:
        "Suas perguntas também precisarão de uma história para sobreviver.",
      socrates:
        "O herói conquistou glória; agora resta perguntar se conquistou a virtude.",
    },
  },
  "socrates:tales": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Tales, se tudo nasce da água, dela também nascem a justiça e a virtude?",
      },
      {
        speaker: "tales",
        line:
          "A água explica a natureza, não substitui a investigação sobre como devemos viver.",
      },
      {
        speaker: "socrates",
        line:
          "Então concordamos que conhecer o cosmos não basta para conhecer a si mesmo.",
      },
      {
        speaker: "tales",
        line:
          "E conhecer a si mesmo não dispensa compreender o mundo que nos sustenta.",
      },
    ],
    victory: {
      socrates:
        "A arché explicou a matéria; o diálogo revelou os limites da explicação.",
      tales:
        "O exame de si também acontece dentro da natureza.",
    },
  },
  "plato:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Platão, você transformou minhas perguntas em uma doutrina sobre dois mundos?",
      },
      {
        speaker: "plato",
        line:
          "Segui o caminho que seu exame abriu e procurei aquilo que permanece verdadeiro.",
      },
      {
        speaker: "socrates",
        line:
          "Cuidado para que a resposta não encerre a pergunta cedo demais.",
      },
      {
        speaker: "plato",
        line:
          "E cuidado para que a pergunta não tema alcançar uma resposta.",
      },
    ],
    victory: {
      socrates:
        "Nenhuma teoria deve ficar acima do exame que a tornou possível.",
      plato:
        "Seu diálogo abriu a porta; a dialética conduziu a alma para além dela.",
    },
  },
  "nietzsche:socrates": {
    intro: [
      {
        speaker: "nietzsche",
        line:
          "Sócrates, sua razão ensinou o Ocidente a desconfiar dos instintos.",
      },
      {
        speaker: "socrates",
        line:
          "Desconfiar não é negar. É perguntar se o impulso conduz à virtude.",
      },
      {
        speaker: "nietzsche",
        line:
          "Sua virtude domesticou a força e chamou essa fraqueza de sabedoria.",
      },
      {
        speaker: "socrates",
        line:
          "Se sua força não suporta perguntas, talvez ela seja apenas medo disfarçado.",
      },
    ],
    victory: {
      socrates:
        "O martelo fez barulho; a pergunta encontrou a rachadura.",
      nietzsche:
        "Covarde. Diante da vida, você preferiu a cicuta — e chamou essa renúncia de virtude.",
    },
  },
  "amenemope:aristotle": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "A justiça exige um coração equilibrado. Sua virtude também nasce da medida?",
      },
      {
        speaker: "aristotle",
        line:
          "Sim, mas a medida correta depende da situação, da prudência e da finalidade do ato.",
      },
      {
        speaker: "amenemope",
        line:
          "Então não basta evitar os extremos; é preciso saber por que se escolhe.",
      },
      {
        speaker: "aristotle",
        line:
          "E repetir boas escolhas até que a justiça se torne parte do caráter.",
      },
    ],
    victory: {
      amenemope:
        "A prudência encontrou a balança, mas ainda precisou pesar o coração.",
      aristotle:
        "O equilíbrio tornou-se virtude quando a razão encontrou a medida adequada.",
    },
  },
  "aristotle:homero": {
    intro: [
      {
        speaker: "homero",
        line:
          "Aquiles conheceu a coragem antes que os filósofos tentassem defini-la.",
      },
      {
        speaker: "aristotle",
        line:
          "E sua ira mostrou por que coragem sem medida pode destruir aquilo que defende.",
      },
      {
        speaker: "homero",
        line:
          "Os heróis vivem onde a grandeza e o excesso caminham juntos.",
      },
      {
        speaker: "aristotle",
        line:
          "Por isso a tragédia nos ensina a reconhecer ações, consequências e caráter.",
      },
    ],
    victory: {
      homero:
        "Você classificou as virtudes; meus heróis mostraram quanto custa vivê-las.",
      aristotle:
        "O mito ofereceu os atos; a filosofia revelou suas causas e consequências.",
    },
  },
  "aristotle:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "Busquei na água um princípio comum para todas as transformações.",
      },
      {
        speaker: "aristotle",
        line:
          "Um princípio material não explica sozinho a forma, o movimento e a finalidade.",
      },
      {
        speaker: "tales",
        line:
          "Sem investigar a natureza, suas quatro causas não teriam onde começar.",
      },
      {
        speaker: "aristotle",
        line:
          "Concordo. A filosofia avança quando a observação recebe explicações mais completas.",
      },
    ],
    victory: {
      tales:
        "Antes das quatro causas, foi preciso perguntar do que o mundo é feito.",
      aristotle:
        "A água explicou a matéria; ainda faltavam forma, movimento e finalidade.",
    },
  },
  "aristotle:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Aristóteles, alguém se torna virtuoso por conhecer o bem ou por praticá-lo?",
      },
      {
        speaker: "aristotle",
        line:
          "Pela prática orientada pela razão. O caráter nasce de escolhas repetidas.",
      },
      {
        speaker: "socrates",
        line:
          "E como escolher corretamente sem antes examinar o que chamamos de bem?",
      },
      {
        speaker: "aristotle",
        line:
          "Examinando, agindo e corrigindo a ação pela experiência.",
      },
    ],
    victory: {
      socrates:
        "Você organizou as virtudes; minha pergunta ainda examina quem as pratica.",
      aristotle:
        "A pergunta abriu o caminho; o hábito virtuoso ensinou a percorrê-lo.",
    },
  },
  "aristotle:plato": {
    intro: [
      {
        speaker: "plato",
        line:
          "Aristóteles, sem a Forma eterna, como reconhecer o que cada coisa verdadeiramente é?",
      },
      {
        speaker: "aristotle",
        line:
          "A forma não vive separada da coisa. Ela se realiza na matéria que observamos.",
      },
      {
        speaker: "plato",
        line:
          "O sensível muda e perece; somente o inteligível oferece conhecimento seguro.",
      },
      {
        speaker: "aristotle",
        line:
          "Conhecer não exige abandonar o mundo, mas compreender suas causas.",
      },
    ],
    victory: {
      plato:
        "Você permaneceu entre as coisas; eu alcancei o princípio que as torna inteligíveis.",
      aristotle:
        "Não foi preciso duplicar o mundo para compreender a forma das coisas.",
    },
  },
  "aristotle:nietzsche": {
    intro: [
      {
        speaker: "nietzsche",
        line:
          "Seu justo meio transforma a vida em disciplina para espíritos moderados.",
      },
      {
        speaker: "aristotle",
        line:
          "A virtude não enfraquece a potência; dá a ela direção, ocasião e finalidade.",
      },
      {
        speaker: "nietzsche",
        line:
          "Toda finalidade fixa tenta domesticar o devir.",
      },
      {
        speaker: "aristotle",
        line:
          "Sem forma, até a força mais intensa permanece apenas possibilidade.",
      },
    ],
    victory: {
      aristotle:
        "Sua potência encontrou o limite de uma ação sem prudência nem finalidade.",
      nietzsche:
        "Seu justo meio era apenas o nome elegante que deu ao medo dos extremos.",
    },
  },
  "amenemope:diogenes": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "Aquele que domina os próprios impulsos mantém o coração leve diante da balança.",
      },
      {
        speaker: "diogenes",
        line:
          "E aquele que precisa de uma balança já carrega coisas demais.",
      },
      {
        speaker: "amenemope",
        line:
          "Sua pobreza não prova que seu espírito encontrou a medida.",
      },
      {
        speaker: "diogenes",
        line:
          "Nem sua solenidade prova que disse algo interessante.",
      },
    ],
    victory: {
      amenemope:
        "Desprezar as convenções não dispensa ninguém de responder pelos próprios atos.",
      diogenes:
        "Seu coração ficou leve quando perdeu o peso da pose.",
    },
  },
  "diogenes:homero": {
    intro: [
      {
        speaker: "homero",
        line:
          "Meus heróis enfrentaram monstros, deuses e mares para conquistar a glória.",
      },
      {
        speaker: "diogenes",
        line:
          "Tanto esforço para receber aplausos de gente que já morreu.",
      },
      {
        speaker: "homero",
        line:
          "Você vive num barril porque jamais compreendeu a grandeza.",
      },
      {
        speaker: "diogenes",
        line:
          "E você precisou de doze mil versos porque nunca aprendeu a ser direto.",
      },
    ],
    victory: {
      homero:
        "Até o homem do barril acabou transformado em história.",
      diogenes:
        "Seus heróis conquistaram Troia. Eu conquistei a liberdade de não precisar dela.",
    },
  },
  "diogenes:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "Sob todas as mudanças, procuro o princípio natural que dá unidade ao cosmos.",
      },
      {
        speaker: "diogenes",
        line:
          "Se é água, comece lavando essa frase: ela veio cheia de enfeites.",
      },
      {
        speaker: "tales",
        line:
          "Você zomba da investigação porque prefere viver como um cão.",
      },
      {
        speaker: "diogenes",
        line:
          "O cão reconhece o essencial sem precisar inventar uma arché.",
      },
    ],
    victory: {
      tales:
        "Até seu barril pertence à natureza que você finge não investigar.",
      diogenes:
        "Você encontrou o princípio de tudo e ainda não descobriu como viver com pouco.",
    },
  },
  "diogenes:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Diógenes, o que procura com essa lanterna em plena luz do dia?",
      },
      {
        speaker: "diogenes",
        line:
          "Um homem honesto. Pode sair da frente, Sócrates.",
      },
      {
        speaker: "socrates",
        line:
          "Talvez devesse começar examinando a si mesmo.",
      },
      {
        speaker: "diogenes",
        line:
          "Já examinei: preciso de pouco. Você precisa de uma praça inteira para fazer uma pergunta.",
      },
    ],
    victory: {
      socrates:
        "Sua franqueza derrubou convenções, mas não respondeu à pergunta sobre a virtude.",
      diogenes:
        "Você passou a vida fazendo perguntas. Eu respondi vivendo.",
    },
  },
  "diogenes:plato": {
    intro: [
      {
        speaker: "plato",
        line:
          "A razão distingue o homem dos demais animais: um bípede sem penas, capaz de elevar-se ao inteligível.",
      },
      {
        speaker: "diogenes",
        line:
          "Trouxe seu homem, Platão. Ele cacareja, mas argumenta quase tão bem quanto você.",
      },
      {
        speaker: "plato",
        line:
          "Uma zombaria não destrói a essência de uma definição.",
      },
      {
        speaker: "diogenes",
        line:
          "Não. Mas uma galinha destruiu a sua.",
      },
    ],
    victory: {
      plato:
        "Você arrancou as penas da definição; a essência do homem continua além da aparência.",
      diogenes:
        "Eis o homem de Platão: depenado, confuso e ainda convencido de que vive num mundo superior.",
    },
  },
  "aristotle:diogenes": {
    intro: [
      {
        speaker: "aristotle",
        line:
          "A vida boa exige virtude, prudência e condições adequadas para florescer.",
      },
      {
        speaker: "diogenes",
        line:
          "Meu barril tem uma causa material, quatro tábuas e nenhuma paciência para sua palestra.",
      },
      {
        speaker: "aristotle",
        line:
          "Recusar a cidade não torna sua vida autossuficiente.",
      },
      {
        speaker: "diogenes",
        line:
          "Classifique isso depois que eu terminar de rir.",
      },
    ],
    victory: {
      aristotle:
        "A liberdade sem comunidade permanece incompleta, por mais provocante que pareça.",
      diogenes:
        "Você catalogou o mundo inteiro e esqueceu de jogar fora o que não precisava.",
    },
  },
  "diogenes:nietzsche": {
    intro: [
      {
        speaker: "nietzsche",
        line:
          "Vejo em você um espírito livre que desprezou a moral do rebanho.",
      },
      {
        speaker: "diogenes",
        line:
          "E vejo em você um homem com um martelo enorme pedindo para ser notado.",
      },
      {
        speaker: "nietzsche",
        line:
          "Eu anuncio o além-do-homem e a criação de novos valores.",
      },
      {
        speaker: "diogenes",
        line:
          "Comece criando uma frase que não precise subir uma montanha para terminar.",
      },
    ],
    victory: {
      nietzsche:
        "Você fez da pobreza uma arma; eu fiz da vida uma obra.",
      diogenes:
        "Tanto além-do-homem para perder para um velho sem casa.",
    },
  },
  "amenemope:sidarta": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "O coração sereno torna-se leve diante da balança. O que torna a mente livre?",
      },
      {
        speaker: "sidarta",
        line:
          "Ver o desejo nascer sem obedecê-lo e vê-lo cessar sem tentar possuí-lo.",
      },
      {
        speaker: "amenemope",
        line:
          "Então equilíbrio e desapego caminham próximos.",
      },
      {
        speaker: "sidarta",
        line:
          "Desde que o equilíbrio não se transforme em outra coisa à qual nos agarramos.",
      },
    ],
    victory: {
      amenemope:
        "A mente encontrou serenidade quando aprendeu a responder pelos próprios atos.",
      sidarta:
        "O coração ficou leve quando deixou de carregar até a própria medida.",
    },
  },
  "homero:sidarta": {
    intro: [
      {
        speaker: "homero",
        line:
          "Meus heróis atravessam mares e guerras para conquistar uma glória que sobreviva à morte.",
      },
      {
        speaker: "sidarta",
        line:
          "E quantos sofrimentos nascem do desejo de permanecer quando tudo é impermanente?",
      },
      {
        speaker: "homero",
        line:
          "Sem o desejo de grandeza, quem enfrentaria monstros e destinos?",
      },
      {
        speaker: "sidarta",
        line:
          "A coragem mais rara enfrenta o monstro que a própria mente alimenta.",
      },
    ],
    victory: {
      homero:
        "Até o desapego precisou de uma história para atravessar os séculos.",
      sidarta:
        "A glória prometeu eternidade; a impermanência revelou o preço da promessa.",
    },
  },
  "sidarta:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "Sob toda transformação, procuro um princípio comum que torne a natureza inteligível.",
      },
      {
        speaker: "sidarta",
        line:
          "Eu observo que todas as coisas surgem por condições e nada permanece isolado.",
      },
      {
        speaker: "tales",
        line:
          "Então sua origem não é uma substância, mas uma relação?",
      },
      {
        speaker: "sidarta",
        line:
          "Quando as condições mudam, também muda aquilo que insistíamos em chamar de permanente.",
      },
    ],
    victory: {
      tales:
        "A impermanência ainda acontece numa natureza que pode ser investigada.",
      sidarta:
        "Você encontrou água sob as formas; eu encontrei mudança até na água.",
    },
  },
  "sidarta:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Sidarta, conhecer a si mesmo basta para viver bem?",
      },
      {
        speaker: "sidarta",
        line:
          "Primeiro é preciso descobrir se existe um eu fixo para ser conhecido.",
      },
      {
        speaker: "socrates",
        line:
          "Você respondeu à minha pergunta retirando o próprio interrogado.",
      },
      {
        speaker: "sidarta",
        line:
          "E você retirou tantas certezas que deveria reconhecer o caminho.",
      },
    ],
    victory: {
      socrates:
        "Mesmo a ideia de não-eu precisa permanecer aberta ao exame.",
      sidarta:
        "Você examinou a vida; faltou soltar aquele que desejava possuir a resposta.",
    },
  },
  "diogenes:sidarta": {
    intro: [
      {
        speaker: "diogenes",
        line:
          "Renunciou a um palácio para sentar sob uma árvore. Finalmente alguém com alguma sensatez.",
      },
      {
        speaker: "sidarta",
        line:
          "Você abandonou posses, Diógenes. Abandonou também o orgulho de desprezá-las?",
      },
      {
        speaker: "diogenes",
        line:
          "Não. Esse orgulho ocupa pouco espaço e diverte bastante.",
      },
      {
        speaker: "sidarta",
        line:
          "Até um barril se torna prisão quando o ego passa a morar dentro dele.",
      },
    ],
    victory: {
      diogenes:
        "Bonita roda. Continue girando: talvez encontre uma saída do seu sermão.",
      sidarta:
        "Você largou quase tudo; por último, restava largar a necessidade de zombar.",
    },
  },
  "aristotle:sidarta": {
    intro: [
      {
        speaker: "aristotle",
        line:
          "A vida boa realiza as potências humanas por meio da virtude e da razão.",
      },
      {
        speaker: "sidarta",
        line:
          "E se o desejo de realizar-se for justamente aquilo que mantém o sofrimento?",
      },
      {
        speaker: "aristotle",
        line:
          "Sem finalidade, a ação perde direção e a vida não floresce.",
      },
      {
        speaker: "sidarta",
        line:
          "O lótus floresce sem transformar a flor em propriedade.",
      },
    ],
    victory: {
      aristotle:
        "A libertação também exigiu prática, caráter e uma finalidade.",
      sidarta:
        "Sua finalidade organizou a vida; o desapego libertou-a da obrigação de completar-se.",
    },
  },
  "plato:sidarta": {
    intro: [
      {
        speaker: "plato",
        line:
          "O sensível muda e engana. A alma deve elevar-se ao que permanece verdadeiro.",
      },
      {
        speaker: "sidarta",
        line:
          "Transformar permanência em refúgio é continuar preso ao desejo.",
      },
      {
        speaker: "plato",
        line:
          "Sem uma verdade estável, o conhecimento dissolve-se no fluxo.",
      },
      {
        speaker: "sidarta",
        line:
          "Compreender o fluxo não é perder a verdade; é deixar de exigir que ela seja imóvel.",
      },
    ],
    victory: {
      plato:
        "A impermanência descreve sombras; a razão ainda busca aquilo que as torna inteligíveis.",
      sidarta:
        "Você deixou a caverna e construiu outra com paredes feitas de eternidade.",
    },
  },
  "nietzsche:sidarta": {
    intro: [
      {
        speaker: "nietzsche",
        line:
          "Seu desapego cheira à antiga vontade de negar a vida e escapar do sofrimento.",
      },
      {
        speaker: "sidarta",
        line:
          "Não escapo do sofrimento. Observo sua origem até que ele deixe de governar a vida.",
      },
      {
        speaker: "nietzsche",
        line:
          "Eu digo sim até à dor e faço dela matéria para criar.",
      },
      {
        speaker: "sidarta",
        line:
          "Se precisa amar a dor para provar que ama a vida, talvez ainda seja a dor quem decide.",
      },
    ],
    victory: {
      nietzsche:
        "Você apagou o desejo e chamou as cinzas de paz.",
      sidarta:
        "Você afirmou o sofrimento com tanta força que não percebeu quando ele passou a afirmar você.",
    },
  },
  "amenemope:confucius": {
    intro: [
      {
        speaker: "amenemope",
        line:
          "O sábio governa o coração antes de tentar governar os outros.",
      },
      {
        speaker: "confucius",
        line:
          "E governa pelo exemplo, para que ninguém precise obedecer apenas por medo.",
      },
      {
        speaker: "amenemope",
        line:
          "Então sua cerimônia será justa somente se o coração permanecer leve.",
      },
      {
        speaker: "confucius",
        line:
          "E sua serenidade será completa quando também ensinar uma comunidade a florescer.",
      },
    ],
    victory: {
      amenemope:
        "O rito mede os gestos; Maat ainda pesa aquilo que existe dentro deles.",
      confucius:
        "Seu coração encontrou equilíbrio; faltava transformar essa virtude em educação.",
    },
  },
  "confucius:homero": {
    intro: [
      {
        speaker: "homero",
        line:
          "Meus heróis conquistaram glória entre deuses e homens. O que seus alunos conquistaram?",
      },
      {
        speaker: "confucius",
        line:
          "O domínio de si. É uma vitória menos cantada porque produz menos viúvas.",
      },
      {
        speaker: "homero",
        line:
          "Sem grandes feitos, quem lembrará seus homens virtuosos?",
      },
      {
        speaker: "confucius",
        line:
          "As famílias que eles não destruíram já serão memória suficiente.",
      },
    ],
    victory: {
      homero:
        "Até o professor mais severo precisou de uma história para ensinar sua lição.",
      confucius:
        "Seus heróis venceram cidades; ainda perderiam uma prova sobre humanidade.",
    },
  },
  "confucius:tales": {
    intro: [
      {
        speaker: "tales",
        line:
          "Procuro o princípio que explica a natureza. Você procura regras para os homens.",
      },
      {
        speaker: "confucius",
        line:
          "A água encontra seu curso. O homem precisa aprender a não inundar a vida alheia.",
      },
      {
        speaker: "tales",
        line:
          "Então a observação da natureza também educa o caráter.",
      },
      {
        speaker: "confucius",
        line:
          "Desde que o filósofo olhe onde pisa enquanto observa as estrelas.",
      },
    ],
    victory: {
      tales:
        "Você ordenou os gestos; a natureza continuou fluindo antes de todo rito.",
      confucius:
        "Você encontrou água em todas as coisas e ainda assim não lavou essa distração.",
    },
  },
  "confucius:socrates": {
    intro: [
      {
        speaker: "socrates",
        line:
          "Diga-me, Confúcio: um homem que repete os ritos sem compreendê-los é virtuoso?",
      },
      {
        speaker: "confucius",
        line:
          "Não. Assim como um homem que repete perguntas sem educar ninguém não é sábio.",
      },
      {
        speaker: "socrates",
        line:
          "Talvez minhas perguntas já sejam uma forma de educação.",
      },
      {
        speaker: "confucius",
        line:
          "Talvez. Mas seus alunos agradeceriam se uma delas viesse acompanhada de resposta.",
      },
    ],
    victory: {
      socrates:
        "Você ensinou a resposta correta; eu preservei o direito de examiná-la.",
      confucius:
        "Você fez tantas perguntas que esqueceu de entregar a lição.",
    },
  },
  "confucius:diogenes": {
    intro: [
      {
        speaker: "diogenes",
        line:
          "Tanta cerimônia para esconder que também somos animais.",
      },
      {
        speaker: "confucius",
        line:
          "Até os animais sabem quando estão diante de alguém sem educação.",
      },
      {
        speaker: "diogenes",
        line:
          "Prefiro meus cães. Eles não transformam boas maneiras em coleira.",
      },
      {
        speaker: "confucius",
        line:
          "Concordo. Seus cães foram os únicos discípulos que você conseguiu conservar.",
      },
    ],
    victory: {
      diogenes:
        "Reprovado? Ótimo. Sua escola parecia cara e o barril não cobra matrícula.",
      confucius:
        "A simplicidade é uma virtude; usar a falta de educação como fantasia não é.",
    },
  },
  "aristotle:confucius": {
    intro: [
      {
        speaker: "aristotle",
        line:
          "A virtude nasce do hábito orientado pela razão e busca a medida adequada.",
      },
      {
        speaker: "confucius",
        line:
          "Concordamos. Mas um hábito só se completa quando melhora também nossas relações.",
      },
      {
        speaker: "aristotle",
        line:
          "A pólis existe para tornar possível a vida boa.",
      },
      {
        speaker: "confucius",
        line:
          "Então veremos qual professor transforma melhor uma cidade sem precisar governá-la.",
      },
    ],
    victory: {
      aristotle:
        "O ritual encontrou sua causa; a virtude, sua justa medida.",
      confucius:
        "Você classificou todas as virtudes. Faltou praticar a modéstia.",
    },
  },
  "confucius:plato": {
    intro: [
      {
        speaker: "plato",
        line:
          "A cidade justa precisa ser governada por quem contempla o Bem.",
      },
      {
        speaker: "confucius",
        line:
          "Prefiro um governante que aprenda a praticá-lo antes de afirmar que o contemplou.",
      },
      {
        speaker: "plato",
        line:
          "Sem conhecer a Forma, o costume pode apenas repetir injustiças.",
      },
      {
        speaker: "confucius",
        line:
          "Sem educar o caráter, sua Forma perfeita não atravessa nem a porta da Academia.",
      },
    ],
    victory: {
      plato:
        "Você aperfeiçoou os costumes; eu preservei a medida pela qual podem ser julgados.",
      confucius:
        "Seu filósofo-rei conhece o Bem. Pena que ninguém lhe ensinou a ouvir os súditos.",
    },
  },
  "confucius:nietzsche": {
    intro: [
      {
        speaker: "nietzsche",
        line:
          "Seus ritos domesticam o homem até que ele confunda obediência com virtude.",
      },
      {
        speaker: "confucius",
        line:
          "E seu martelo faz tanto barulho que você confunde destruição com grandeza.",
      },
      {
        speaker: "nietzsche",
        line:
          "Eu crio valores; não me curvo diante dos mortos.",
      },
      {
        speaker: "confucius",
        line:
          "Você quebrou todos os valores. Depois descobriu que não sabia construir nenhum.",
      },
    ],
    victory: {
      nietzsche:
        "Seu homem nobre ainda pediu licença à tradição para existir.",
      confucius:
        "Você destruiu a antiga escola e terminou sozinho, gritando no pátio vazio.",
    },
  },
  "confucius:sidarta": {
    intro: [
      {
        speaker: "sidarta",
        line:
          "Apegar-se aos papéis sociais também produz sofrimento.",
      },
      {
        speaker: "confucius",
        line:
          "Abandoná-los não elimina a responsabilidade que temos uns pelos outros.",
      },
      {
        speaker: "sidarta",
        line:
          "A compaixão não precisa transformar vínculos em identidades fixas.",
      },
      {
        speaker: "confucius",
        line:
          "Nem a liberdade precisa transformar o desapego em ausência.",
      },
    ],
    victory: {
      sidarta:
        "Você harmonizou as relações; eu soltei o apego que exigia controlá-las.",
      confucius:
        "Você ensinou a deixar ir; eu ensinei por que ainda vale a pena permanecer.",
    },
  },
  "amenemope:marcus": {
    intro: [
      {
        speaker: "amenemope",
        line: "Quem domina o próprio coração não precisa dominar o mundo.",
      },
      {
        speaker: "marcus",
        line: "Concordo. Mas às vezes o mundo chega à porta antes da meditação.",
      },
      {
        speaker: "amenemope",
        line: "Então pese seus atos antes que a coroa os torne pesados demais.",
      },
      {
        speaker: "marcus",
        line: "É por isso que escrevo para mim mesmo antes de ordenar aos outros.",
      },
    ],
    victory: {
      amenemope:
        "Seu império encontrou limites onde meu coração encontrou medida.",
      marcus:
        "Seu coração era leve; minha disciplina o tornou também inabalável.",
    },
  },
  "homero:marcus": {
    intro: [
      {
        speaker: "homero",
        line: "Imperador, que glória deseja levar para o seu último canto?",
      },
      {
        speaker: "marcus",
        line: "A glória é ruído produzido por homens que também morrerão.",
      },
      {
        speaker: "homero",
        line: "Sem memória, até os justos desaparecem como poeira.",
      },
      {
        speaker: "marcus",
        line: "Então cante o dever, não o homem que o cumpriu.",
      },
    ],
    victory: {
      homero:
        "Você desprezou a glória e acabou de entrar em meu poema.",
      marcus:
        "Seu canto celebrou a vitória; meu silêncio governou a necessidade de ouvi-lo.",
    },
  },
  "marcus:tales": {
    intro: [
      {
        speaker: "tales",
        line: "Procurei na natureza o princípio comum de todas as coisas.",
      },
      {
        speaker: "marcus",
        line: "Eu procurei viver de acordo com a razão que ordena esse todo.",
      },
      {
        speaker: "tales",
        line: "Talvez sua ordem seja apenas mais uma correnteza.",
      },
      {
        speaker: "marcus",
        line: "Então aprenderei a navegar sem exigir que o rio recue.",
      },
    ],
    victory: {
      tales:
        "O cosmos não obedeceu ao imperador; apenas seguiu seu curso.",
      marcus:
        "Você encontrou o princípio da natureza; eu encontrei como permanecer dentro dele.",
    },
  },
  "marcus:socrates": {
    intro: [
      {
        speaker: "socrates",
        line: "Você governa milhões. Já descobriu quem governa você?",
      },
      {
        speaker: "marcus",
        line: "Todos os dias interrogo o homem que veste a púrpura.",
      },
      {
        speaker: "socrates",
        line: "E ele responde como filósofo ou como imperador?",
      },
      {
        speaker: "marcus",
        line: "Se responder como imperador, volto a fazer a pergunta.",
      },
    ],
    victory: {
      socrates:
        "Você governou Roma; eu deixei uma pergunta governar você.",
      marcus:
        "Seu exame retirou minha coroa. Foi então que encontrei minha cidadela.",
    },
  },
  "diogenes:marcus": {
    intro: [
      {
        speaker: "diogenes",
        line: "Outro imperador? Fique longe. Sua sombra está atrapalhando meu sol.",
      },
      {
        speaker: "marcus",
        line: "E você ainda precisa de uma plateia para parecer livre.",
      },
      {
        speaker: "diogenes",
        line: "Preciso de tão pouco que até sua resposta foi excesso.",
      },
      {
        speaker: "marcus",
        line: "E eu preciso de tão pouco que sua provocação não me moveu.",
      },
    ],
    victory: {
      diogenes:
        "Roma inteira não conseguiu proteger seu orgulho de um homem sem casa.",
      marcus:
        "Você abandonou tudo, menos a necessidade de ser visto abandonando tudo.",
    },
  },
  "aristotle:marcus": {
    intro: [
      {
        speaker: "aristotle",
        line: "A virtude exige hábito, prudência e a medida adequada.",
      },
      {
        speaker: "marcus",
        line: "E cada dia oferece ao governante um novo exercício dessa medida.",
      },
      {
        speaker: "aristotle",
        line: "O poder sem amizade cívica produz apenas obediência.",
      },
      {
        speaker: "marcus",
        line: "Por isso governar os outros começa pelo governo de si.",
      },
    ],
    victory: {
      aristotle:
        "Seu dever resistiu; minha prudência descobriu sua medida.",
      marcus:
        "Você descreveu a virtude. Eu precisei praticá-la entre guerras e decretos.",
    },
  },
  "marcus:sidarta": {
    intro: [
      {
        speaker: "sidarta",
        line: "Seu autocontrole ainda protege um eu que teme perder o comando.",
      },
      {
        speaker: "marcus",
        line: "Não controlo o mundo. Apenas escolho o julgamento que faço dele.",
      },
      {
        speaker: "sidarta",
        line: "Quando o apego ao julgamento cessa, quem ainda precisa da cidadela?",
      },
      {
        speaker: "marcus",
        line: "Aquele que precisa voltar ao mundo depois da meditação.",
      },
    ],
    victory: {
      sidarta:
        "Sua cidadela permaneceu de pé; eu atravessei a porta que você ainda guardava.",
      marcus:
        "Você dissolveu o apego; eu transformei o retorno ao dever em liberdade.",
    },
  },
  "confucius:marcus": {
    intro: [
      {
        speaker: "confucius",
        line: "Um governante educa mais pelo caráter do que pelos decretos.",
      },
      {
        speaker: "marcus",
        line: "Então minha primeira província deve ser minha própria mente.",
      },
      {
        speaker: "confucius",
        line: "A virtude privada só se completa quando ordena relações justas.",
      },
      {
        speaker: "marcus",
        line: "E nenhuma ordem pública dura sem disciplina interior.",
      },
    ],
    victory: {
      confucius:
        "Você governou a si mesmo; eu mostrei por que isso deve alcançar os outros.",
      marcus:
        "Seus ritos organizaram o império; minha cidadela sustentou quem os cumpria.",
    },
  },
  "marcus:plato": {
    intro: [
      {
        speaker: "plato",
        line: "Enfim um governante que tentou aproximar poder e filosofia.",
      },
      {
        speaker: "marcus",
        line: "E descobriu que governar homens reais é mais difícil que uma cidade ideal.",
      },
      {
        speaker: "plato",
        line: "Sem contemplar o Bem, o poder caminha às cegas.",
      },
      {
        speaker: "marcus",
        line: "Sem pisar na lama, o Bem nunca chega aos governados.",
      },
    ],
    victory: {
      plato:
        "Você governou o possível; eu preservei a medida pela qual ele deve ser julgado.",
      marcus:
        "Sua cidade era perfeita porque nenhum cidadão real conseguiu entrar nela.",
    },
  },
  "marcus:nietzsche": {
    intro: [
      {
        speaker: "nietzsche",
        line: "Seu autocontrole é apenas fraqueza bem-vestida de púrpura.",
      },
      {
        speaker: "marcus",
        line: "E sua fúria é apenas escravidão sem correntes.",
      },
      {
        speaker: "nietzsche",
        line: "Eu digo sim ao caos que você tenta domesticar.",
      },
      {
        speaker: "marcus",
        line: "Dizer sim é fácil quando outros precisam recolher os escombros.",
      },
    ],
    victory: {
      nietzsche:
        "Sua cidadela interior era apenas uma muralha com medo da vida.",
      marcus:
        "Você quebrou as correntes e passou o resto da luta obedecendo à própria fúria.",
    },
  },
  "amenemope:hypatia": {
    intro: [
      { speaker: "amenemope", line: "O coração justo encontra a medida antes de agir." },
      { speaker: "hypatia", line: "E a mente rigorosa demonstra por que essa medida não é mero costume." },
      { speaker: "amenemope", line: "Nem tudo que orienta a vida cabe num cálculo." },
      { speaker: "hypatia", line: "Mas toda orientação deve suportar uma pergunta bem formulada." },
    ],
    victory: {
      amenemope: "Você mediu os astros; meu coração pesou aquilo que seus instrumentos não alcançam.",
      hypatia: "Sua sabedoria encontrou equilíbrio; minha razão mostrou a estrutura que o sustenta.",
    },
  },
  "homero:hypatia": {
    intro: [
      { speaker: "homero", line: "As Musas já conheciam os céus antes de seus instrumentos." },
      { speaker: "hypatia", line: "Conhecer não é apenas cantar o céu, Homero. É explicar seu movimento." },
      { speaker: "homero", line: "Uma equação jamais fez um herói enfrentar o destino." },
      { speaker: "hypatia", line: "Nem um herói impediu um eclipse por declamar mais alto." },
    ],
    victory: {
      homero: "Você explicou as estrelas; meu canto decidiu por que os homens ainda olham para elas.",
      hypatia: "Sua Musa ofereceu maravilhas; meu astrolábio devolveu direção.",
    },
  },
  "hypatia:tales": {
    intro: [
      { speaker: "tales", line: "Olhei para o céu e busquei causas na própria natureza." },
      { speaker: "hypatia", line: "Eu levei essa busca adiante com geometria, observação e cálculo." },
      { speaker: "tales", line: "Sem a primeira pergunta, seus instrumentos permaneceriam guardados." },
      { speaker: "hypatia", line: "Sem precisão, sua pergunta continuaria apenas apontando para cima." },
    ],
    victory: {
      tales: "Antes do astrolábio, houve alguém disposto a erguer os olhos para a natureza.",
      hypatia: "Você abriu o caminho; eu medi a distância que sua intuição deixou em aberto.",
    },
  },
  "hypatia:socrates": {
    intro: [
      { speaker: "socrates", line: "Hipátia, um instrumento pode ensinar alguém a conhecer a si mesmo?" },
      { speaker: "hypatia", line: "Pode ensiná-lo a distinguir convicção de demonstração." },
      { speaker: "socrates", line: "Então demonstre que sua certeza conhece os próprios limites." },
      { speaker: "hypatia", line: "Começarei calculando a órbita da sua próxima pergunta." },
    ],
    victory: {
      socrates: "Você calculou o céu e descobriu que ainda havia uma pergunta fora do mapa.",
      hypatia: "Você cercou tudo de perguntas; eu encontrei a forma exata de atravessá-las.",
    },
  },
  "diogenes:hypatia": {
    intro: [
      { speaker: "diogenes", line: "Tantos livros para descobrir que o mundo continua absurdo." },
      { speaker: "hypatia", line: "Não. Precisei deles para entender por que você se orgulha da própria ignorância." },
      { speaker: "diogenes", line: "Meu barril custa menos que seu astrolábio e tem mais utilidade." },
      { speaker: "hypatia", line: "É verdade. Ele mantém sua vaidade longe das salas de aula." },
    ],
    victory: {
      diogenes: "Sua geometria tinha muitas curvas; eu venci seguindo a linha mais curta até sua vaidade.",
      hypatia: "Você trouxe uma lanterna para procurar um homem e encontrou apenas uma aula que não conseguiu acompanhar.",
    },
  },
  "aristotle:hypatia": {
    intro: [
      { speaker: "aristotle", line: "Cada ser deve ser compreendido por suas causas e por sua finalidade." },
      { speaker: "hypatia", line: "E nenhuma finalidade autoriza colocar mulheres abaixo da razão que também cultivam." },
      { speaker: "aristotle", line: "A experiência revela diferenças que a teoria não deve ignorar." },
      { speaker: "hypatia", line: "E a história revela preconceitos que se disfarçam de experiência." },
    ],
    victory: {
      aristotle: "Sua geometria descreveu a forma; minha filosofia explicou por que ela se realiza.",
      hypatia: "Você classificou cada ser em seu lugar. Eu recusei o lugar estreito que sua época me reservou.",
    },
  },
  "hypatia:sidarta": {
    intro: [
      { speaker: "sidarta", line: "Mesmo o conhecimento pode tornar-se apego e alimentar sofrimento." },
      { speaker: "hypatia", line: "E a renúncia pode tornar-se desculpa para abandonar a investigação." },
      { speaker: "sidarta", line: "A mente serena observa sem exigir que o mundo satisfaça seus conceitos." },
      { speaker: "hypatia", line: "A mente rigorosa observa duas vezes antes de chamar silêncio de verdade." },
    ],
    victory: {
      sidarta: "Você encontrou ordem nas formas; eu libertei a mente da necessidade de possuí-las.",
      hypatia: "Você soltou o apego às respostas; eu preservei a coragem de continuar perguntando.",
    },
  },
  "confucius:hypatia": {
    intro: [
      { speaker: "confucius", line: "O estudo só se completa quando transforma o caráter." },
      { speaker: "hypatia", line: "E o caráter se empobrece quando teme aquilo que o estudo pode revelar." },
      { speaker: "confucius", line: "Saber sem responsabilidade produz apenas arrogância refinada." },
      { speaker: "hypatia", line: "Responsabilidade sem liberdade produz apenas obediência bem-educada." },
    ],
    victory: {
      confucius: "Você dominou os cálculos; eu examinei o caráter de quem os utiliza.",
      hypatia: "Seus ritos organizaram a escola; minha investigação impediu que ela se tornasse uma prisão.",
    },
  },
  "hypatia:marcus": {
    intro: [
      { speaker: "marcus", line: "O cosmos segue sua ordem sem pedir nossa aprovação." },
      { speaker: "hypatia", line: "Por isso devemos compreendê-lo, não apenas suportá-lo." },
      { speaker: "marcus", line: "A razão também ensina a aceitar o que não podemos mudar." },
      { speaker: "hypatia", line: "E a coragem ensina a não chamar injustiça de destino." },
    ],
    victory: {
      marcus: "Você calculou as órbitas; eu permaneci firme quando o mundo saiu delas.",
      hypatia: "Sua serenidade aceitou o cosmos; meu astrolábio mostrou que compreendê-lo também é uma forma de liberdade.",
    },
  },
  "hypatia:plato": {
    intro: [
      { speaker: "plato", line: "A geometria eleva a alma das aparências ao inteligível." },
      { speaker: "hypatia", line: "Desde que ela retorne para explicar o céu que realmente observamos." },
      { speaker: "plato", line: "Toda figura sensível é apenas cópia de uma Forma perfeita." },
      { speaker: "hypatia", line: "Então sua Forma perfeita não terá medo de enfrentar meus cálculos imperfeitos." },
    ],
    victory: {
      plato: "Você traçou as curvas do céu; eu mostrei a Forma que torna cada curva pensável.",
      hypatia: "Seu mundo perfeito permaneceu distante. Minha geometria atravessou Alexandria e chegou às estrelas.",
    },
  },
  "hypatia:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "A verdade é apenas mais um ídolo esperando pelo martelo." },
      { speaker: "hypatia", line: "Então tenha coragem de enfrentar os cálculos que desmentem você." },
      { speaker: "nietzsche", line: "Seus números escondem a perspectiva de quem os escolheu." },
      { speaker: "hypatia", line: "E sua perspectiva não altera a órbita de um único astro." },
    ],
    victory: {
      nietzsche: "Seu universo ordenado quebrou quando a vida recusou obedecer à régua.",
      hypatia: "Seu martelo fez barulho; meu astrolábio continuou apontando exatamente onde sua retórica falhou.",
    },
  },
  "agostinho:averroes": {
    intro: [
      { speaker: "agostinho", line: "Entrei em mim mesmo e encontrei a verdade que ilumina a razão." },
      { speaker: "averroes", line: "E eu pergunto se essa luz demonstra aquilo que você afirma ver." },
      { speaker: "agostinho", line: "Nem toda verdade cabe no limite de uma demonstração." },
      { speaker: "averroes", line: "Mas nenhuma interpretação deve usar o mistério para fugir da coerência." },
    ],
    victory: {
      agostinho: "Você comentou as causas; eu revelei a vontade que escolhia cada leitura.",
      averroes: "Sua interioridade encontrou uma voz; minha razão examinou se ela dizia a verdade.",
    },
  },
  "amenemope:averroes": {
    intro: [
      { speaker: "amenemope", line: "O sábio mede a palavra antes de lançá-la." },
      { speaker: "averroes", line: "E o comentador mede a premissa antes de aceitá-la." },
      { speaker: "amenemope", line: "A justiça também habita o coração silencioso." },
      { speaker: "averroes", line: "Então deixemos que coração e demonstração prestem contas juntos." },
    ],
    victory: {
      amenemope: "Seu comentário foi longo; minha medida encontrou o ponto em que ele perdeu o equilíbrio.",
      averroes: "Sua balança pesou o coração; meu intelecto explicou por que ele se inclinou.",
    },
  },
  "aristotle:averroes": {
    intro: [
      { speaker: "aristotle", line: "Ouvi dizer que o chamam de meu Grande Comentador." },
      { speaker: "averroes", line: "Um título pesado. Trouxe até seu busto para demonstrar." },
      { speaker: "aristotle", line: "Comentar um mestre não o transforma em projétil." },
      { speaker: "averroes", line: "Hoje sua filosofia terá matéria, forma, causa e trajetória." },
    ],
    victory: {
      aristotle: "Você carregou meus livros; eu ainda conhecia melhor a causa de cada movimento.",
      averroes: "Eu não apenas preservei sua obra, mestre. Fiz com que ela continuasse em movimento.",
    },
  },
  "averroes:confucius": {
    intro: [
      { speaker: "confucius", line: "O saber começa quando a conduta honra as relações." },
      { speaker: "averroes", line: "E amadurece quando a tradição aceita ser examinada pela razão." },
      { speaker: "confucius", line: "Sem rito, até a inteligência perde sua direção." },
      { speaker: "averroes", line: "Sem inteligência, o rito esquece por que merece continuar." },
    ],
    victory: {
      confucius: "Você explicou os princípios; eu os transformei em caráter.",
      averroes: "Seus ritos deram forma ao gesto; meu comentário revelou suas causas.",
    },
  },
  "averroes:diogenes": {
    intro: [
      { speaker: "diogenes", line: "Outro homem cercado de livros para parecer menos perdido." },
      { speaker: "averroes", line: "E outro homem dentro de um barril para parecer mais livre." },
      { speaker: "diogenes", line: "Seu Aristóteles pesa mais que toda a minha casa." },
      { speaker: "averroes", line: "Ótimo. Então você perceberá quando ele chegar." },
    ],
    victory: {
      diogenes: "Seu busto quebrou; minha pobreza continua inteira.",
      averroes: "Você rejeitou todas as posses e ainda assim não escapou do peso de uma boa interpretação.",
    },
  },
  "averroes:homero": {
    intro: [
      { speaker: "homero", line: "As Musas me ensinaram aquilo que seus comentários tentam dissecar." },
      { speaker: "averroes", line: "A poesia desperta admiração; a filosofia pergunta por suas causas." },
      { speaker: "homero", line: "Nenhuma causa canta como Aquiles avançando sobre Troia." },
      { speaker: "averroes", line: "Mas até Aquiles precisou de uma causa para mover-se." },
    ],
    victory: {
      homero: "Seu comentário explicou o canto; meu canto sobreviveu à explicação.",
      averroes: "Sua Musa trouxe a imagem; minha razão descobriu o que a fazia mover.",
    },
  },
  "averroes:hypatia": {
    intro: [
      { speaker: "hypatia", line: "Você herdou os antigos e os fez falar em outro mundo." },
      { speaker: "averroes", line: "E você mostrou que herdar exige calcular, corrigir e avançar." },
      { speaker: "hypatia", line: "Então não use Aristóteles como escudo contra a observação." },
      { speaker: "averroes", line: "Hoje ele será menos escudo do que argumento em movimento." },
    ],
    victory: {
      hypatia: "Seu comentário atravessou séculos; minha demonstração atravessou suas premissas.",
      averroes: "Seus cálculos ordenaram as formas; meu intelecto encontrou a causa de sua ordem.",
    },
  },
  "averroes:marcus": {
    intro: [
      { speaker: "marcus", line: "A razão deve governar primeiro aquele que pretende governar outros." },
      { speaker: "averroes", line: "E deve aceitar exame, mesmo quando veste a púrpura imperial." },
      { speaker: "marcus", line: "Meu julgamento não depende de aplausos nem de comentários." },
      { speaker: "averroes", line: "Ainda assim, depende de premissas. Vamos examiná-las." },
    ],
    victory: {
      marcus: "Você analisou meu julgamento; eu preservei a cidadela em que ele se formava.",
      averroes: "Sua cidadela resistiu à força, não à demonstração.",
    },
  },
  "averroes:nietzsche": {
    intro: [
      { speaker: "nietzsche", line: "Você transformou Aristóteles em uma religião da razão." },
      { speaker: "averroes", line: "E você transformou a suspeita em um ídolo que não suporta demonstração." },
      { speaker: "nietzsche", line: "Meu martelo descobrirá quanto pesa seu mestre." },
      { speaker: "averroes", line: "Não se preocupe. O busto fará essa medida por você." },
    ],
    victory: {
      nietzsche: "Seu comentário preservou um morto; meu martelo abriu espaço para criar.",
      averroes: "Seu martelo produziu ruído; minha interpretação ainda sabia onde atingir.",
    },
  },
  "averroes:plato": {
    intro: [
      { speaker: "plato", line: "Seu apego ao mundo sensível ainda o mantém entre sombras." },
      { speaker: "averroes", line: "E sua fuga das causas concretas mantém sua cidade no papel." },
      { speaker: "plato", line: "A forma verdadeira não pode ser arremessada como matéria." },
      { speaker: "averroes", line: "Concordo. Por isso trouxe o busto de seu melhor aluno." },
    ],
    victory: {
      plato: "Seu mármore atingiu uma sombra; a Forma permaneceu além de seu alcance.",
      averroes: "Você separou forma e mundo; eu mostrei como o pensamento volta a tocar a realidade.",
    },
  },
  "averroes:sidarta": {
    intro: [
      { speaker: "sidarta", line: "O apego às opiniões transforma conhecimento em sofrimento." },
      { speaker: "averroes", line: "E abandonar o exame transforma desapego em outra opinião." },
      { speaker: "sidarta", line: "Observe o pensamento surgir e cessar sem possuí-lo." },
      { speaker: "averroes", line: "Observarei também as causas que o fizeram surgir." },
    ],
    victory: {
      sidarta: "Seu intelecto buscou possuir a verdade; eu mostrei o apego escondido nessa busca.",
      averroes: "Você silenciou as opiniões; minha demonstração distinguiu silêncio de verdade.",
    },
  },
  "averroes:socrates": {
    intro: [
      { speaker: "socrates", line: "Averróis, comentar Aristóteles prova que você sabe o que ele sabia?" },
      { speaker: "averroes", line: "Não. Prova apenas que aceitei responder pelas razões que encontrei." },
      { speaker: "socrates", line: "E se o mestre estiver errado?" },
      { speaker: "averroes", line: "Então o melhor comentário será aquele que não tiver medo de corrigi-lo." },
    ],
    victory: {
      socrates: "Você explicou todas as causas e deixou uma pergunta viva entre elas.",
      averroes: "Sua pergunta abriu o caminho; minha demonstração mostrou até onde ele podia conduzir.",
    },
  },
  "averroes:tales": {
    intro: [
      { speaker: "tales", line: "Procurei na natureza um princípio comum." },
      { speaker: "averroes", line: "Eu procurei as causas que tornam esse princípio inteligível." },
      { speaker: "tales", line: "A água não esperou seus comentários para transformar o mundo." },
      { speaker: "averroes", line: "Mas compreender a transformação exige mais que apontar para ela." },
    ],
    victory: {
      tales: "Antes de seus comentários, a natureza já ensinava a quem sabia observá-la.",
      averroes: "Você encontrou o princípio; eu mostrei por que uma intuição ainda precisava tornar-se ciência.",
    },
  },
};

const matchupKey = (first: FighterId, second: FighterId) =>
  [first, second].sort().join(":");

const KANT_ANCIENT_AND_MEDIEVAL_OPPONENTS: FighterId[] = [
  "amenemope",
  "homero",
  "tales",
  "socrates",
  "diogenes",
  "aristotle",
  "sidarta",
  "confucius",
  "marcus",
  "hypatia",
  "agostinho",
  "averroes",
  "thomas",
];

const KANT_CRITIQUE_REPLIES: Partial<Record<FighterId, string>> = {
  amenemope:
    "A medida do coração foi aprendida na vida muito antes de receber o nome de crítica.",
  homero:
    "Antes de sua razão traçar limites, os mitos já ensinavam os homens a reconhecer os seus.",
  tales:
    "Foi observando a natureza que procurei um princípio, não inventando um mundo fora dela.",
  socrates:
    "E quem investigará os limites da razão, se a própria razão não aceitar ser interrogada?",
  diogenes:
    "Você construiu uma crítica inteira para descobrir que não precisa da metade do que carrega.",
  aristotle:
    "Sem investigar causas e princípios, sua experiência descreve o movimento, mas ainda não o compreende.",
  sidarta:
    "A experiência que examino acontece no sofrimento, no apego e na transformação da própria mente.",
  confucius:
    "A moral não começa além da experiência: ela se aprende no modo como tratamos quem está diante de nós.",
  marcus:
    "A razão que governa meu julgamento não foge do mundo; ela escolhe como responder a ele.",
  hypatia:
    "Então observe, calcule e demonstre comigo: nenhuma certeza merece sobreviver sem exame.",
  agostinho:
    "Nem toda interioridade é fuga da experiência; algumas verdades começam quando a consciência examina a si mesma.",
  averroes:
    "Determinar os limites da razão exige usá-la até o fim, não interrompê-la diante das primeiras dificuldades.",
  thomas:
    "A razão reconhece seus limites; mas reconhecer um limite não prova que nada exista além dele.",
};

const kantCriticalDialogue = (
  first: FighterId,
  second: FighterId,
): MatchDialogue | undefined => {
  const opponent = first === "kant" ? second : second === "kant" ? first : null;
  if (
    !opponent ||
    !KANT_ANCIENT_AND_MEDIEVAL_OPPONENTS.includes(opponent)
  ) {
    return undefined;
  }

  return {
    intro: [
      { speaker: opponent, line: DIALOGUE_LINES[opponent] },
      {
        speaker: "kant",
        line:
          "Suas palavras vêm de outro horizonte. Mas, quando avançam além da experiência possível, tornam-se metafísica sem garantia: só podemos afirmar como conhecimento aquilo que a razão investiga dentro de seus próprios limites.",
      },
      {
        speaker: opponent,
        line:
          KANT_CRITIQUE_REPLIES[opponent] ??
          "Talvez seus limites protejam o conhecimento — mas também podem estreitar as perguntas que tornam a filosofia necessária.",
      },
      {
        speaker: "kant",
        line:
          "A crítica não destrói essas perguntas. Ela determina quais podem tornar-se conhecimento e quais devem permanecer ideias da razão.",
      },
    ],
    victory: {
      kant:
        "Sua sabedoria ampliou as perguntas; minha crítica mostrou onde a razão pode conhecer e onde precisa reconhecer honestamente os próprios limites.",
    },
  };
};

const FINAL_ARGUMENTS = {
  "felipe-cyborg":{title:"ÚLTIMO COMANDO",argument:"Perguntas desativadas. Protocolo de controle concluído."},
  amenemope: {
    title: "ÚLTIMA PALAVRA",
    argument:
      "Enquanto sua fúria fazia barulho, a serenidade preparava sua queda. Todo coração revela o peso de seus próprios atos.",
  },
  homero: {
    title: "ÚLTIMO CANTO",
    argument:
      "Os homens combatem por um instante; as histórias decidem quais gestos atravessarão o tempo. Que as Musas guardem esta vitória.",
  },
  tales: {
    title: "ÚLTIMO PRINCÍPIO",
    argument:
      "A natureza não precisou de caprichos divinos nem de um segundo mundo. Sob toda mudança, a razão encontrou um princípio comum.",
  },
  socrates: {
    title: "ÚLTIMA PERGUNTA",
    argument:
      "Você entrou na ágora carregando respostas. Sai dela sabendo que a primeira vitória da filosofia é reconhecer o que ainda precisa ser examinado.",
  },
  diogenes: {
    title: "ÚLTIMA PROVOCAÇÃO",
    argument:
      "Você entrou cheio de títulos, teorias e importância. Meus cães farejaram tudo isso e não encontraram nada necessário.",
  },
  aristotle: {
    title: "ÚLTIMA CAUSA",
    argument:
      "A força sem forma é apenas potência dispersa. Observei suas causas, encontrei sua medida e conduzi este combate à sua finalidade.",
  },
  sidarta: {
    title: "ÚLTIMO DESPERTAR",
    argument:
      "Você tentou derrotar o adversário e terminou alimentando aquilo que o prendia. Quando o apego cessa, o combate perde o poder de comandar a mente.",
  },
  confucius: {
    title: "ÚLTIMA LIÇÃO",
    argument:
      "A força pode impor silêncio; somente o caráter conquista respeito. Você entrou para vencer um adversário e saiu reprovado na arte de tornar-se humano.",
  },
  marcus: {
    title: "ÚLTIMA MEDITAÇÃO",
    argument:
      "Você tentou governar o combate pelo que acontecia fora. Eu preservei o único território verdadeiramente meu: o julgamento com que escolhi responder.",
  },
  hypatia: {
    title: "ÚLTIMA DEMONSTRAÇÃO",
    argument:
      "Você trouxe certeza para a arena. Eu trouxe observação, cálculo e a coragem de corrigir o próprio pensamento. As formas convergiram; seu argumento, não.",
  },
  agostinho: {
    title: "ÚLTIMA CONFISSÃO",
    argument:
      "Você quis dominar aquilo que estava fora. Eu atravessei a memória, governei a vontade e descobri que a vitória mais difícil ainda é vencer a desordem dentro de si.",
  },
  averroes: {
    title: "ÚLTIMO COMENTÁRIO",
    argument:
      "Você confundiu autoridade com verdade. Eu examinei as premissas, distingui as causas e fiz o pensamento atravessar fronteiras — e a arena — sem perder sua força.",
  },
  thomas: {
    title: "ÚLTIMA RESPOSTA",
    argument:
      "Sua objeção foi ouvida, distinguida e respondida. Do movimento à causa, da potência ao ato, a razão percorreu cada via sem abandonar a humildade.",
  },
  machiavelli: {
    title: "ÚLTIMA DECISÃO",
    argument:
      "Você esperou por circunstâncias ideais. Eu reconheci a ocasião, enfrentei a Fortuna e fiz da necessidade uma decisão capaz de conservar o Estado.",
  },
  galileo: {
    title: "ÚLTIMA OBSERVAÇÃO",
    argument:
      "Você trouxe uma autoridade para decidir o combate. Eu trouxe medidas, experiências e um telescópio: quando a natureza responde, até as antigas certezas precisam aprender a se mover.",
  },
  descartes: {
    title: "ÚLTIMA CERTEZA",
    argument:
      "Duvidaram dos sentidos, do mundo e até da razão. Mas enquanto a dúvida avançava, uma certeza permaneceu de pé: eu pensava. E aquilo que pensa não desaparece diante de uma ilusão.",
  },
  locke: {
    title: "ÚLTIMA EXPERIÊNCIA",
    argument:
      "Você procurou ideias prontas antes de abrir os olhos. Eu deixei o mundo escrever na página, comparei suas impressões e preservei aquilo que nenhum governo pode conceder ou retirar: vida, liberdade e propriedade.",
  },
  hobbes: {
    title: "ÚLTIMA SOBERANIA",
    argument:
      "Você chamou de liberdade aquilo que deixava cada pessoa exposta à força das demais. Eu reuni o medo disperso em um pacto e fiz surgir um poder comum: primeiro a paz, para que todo o resto possa existir.",
  },
  rousseau: {
    title: "ÚLTIMA VONTADE",
    argument:
      "Você confundiu liberdade com o direito de seguir apenas o próprio interesse. Eu rompi as correntes da desigualdade, reuni cidadãos e fiz do bem comum uma lei que todos dão a si mesmos.",
  },
  smith: {
    title: "ÚLTIMA TROCA",
    argument:
      "Você lutou como se a força isolada bastasse. Eu dividi tarefas, coordenei interesses e fiz cada movimento multiplicar o seguinte: a riqueza nasce quando muitos transformam diferença em cooperação.",
  },
  kant: {
    title: "ÚLTIMA CRÍTICA",
    argument:
      "Você tomou a aparência pela coisa em si e a inclinação pelo dever. Eu delimitei o conhecimento, universalizei a máxima e encontrei, sob o céu estrelado, a liberdade de uma razão que dá a lei a si mesma.",
  },
  hegel: {
    title: "ÚLTIMA SUPERAÇÃO",
    argument:
      "Você tentou permanecer como uma verdade isolada. Eu revelei sua contradição, preservei o que havia de verdadeiro em sua força e a transformei em um momento do Espírito que avança pela história.",
  },
  schopenhauer: {
    title: "ÚLTIMA RENÚNCIA",
    argument:
      "Você chamou de liberdade a obediência aos próprios desejos. Eu revelei a Vontade que o movia, fiz seu querer oscilar entre dor e tédio e encontrei, no silêncio depois do golpe, a possibilidade de não continuar desejando.",
  },
  marx: {
    title: "ÚLTIMA TRANSFORMAÇÃO",
    argument:
      "Os filósofos até hoje pensaram o mundo; agora eles devem transformá-lo.",
  },
  freud: {
    title: "ÚLTIMA INTERPRETAÇÃO",
    argument:
      "O ego não é senhor em sua própria casa.",
  },
  darwin: {
    title: "ÚLTIMA ADAPTAÇÃO",
    argument:
      "A vida não segue um plano pronto: variações herdáveis e seleção natural transformam populações ao longo das gerações.",
  },
  olympe: {
    title: "ÚLTIMA DECLARAÇÃO",
    argument:
      "A mulher nasce livre e permanece igual ao homem em direitos.",
  },
  kierkegaard: {
    title: "ÚLTIMA ESCOLHA",
    argument: "Nenhum sistema pode escolher por mim. A vida exige que eu dê o próximo passo.",
  },
  beauvoir: {
    title: "ÚLTIMA TRANSFORMAÇÃO",
    argument: "Nenhum destino está pronto: a liberdade começa quando transformamos a situação que recebemos.",
  },
  foucault: {
    title: "ÚLTIMA RESISTÊNCIA",
    argument: "Você procurou o poder apenas na torre. Eu o encontrei nos corredores, nos registros e nos gestos — e em cada relação de poder, abri uma possibilidade de resistência.",
  },
  arendt: {
    title: "ÚLTIMO JULGAMENTO",
    argument: "Você tentou esconder sua escolha atrás de uma ordem. Eu interrompi a obediência, pensei sobre o que estava diante de mim e iniciei, entre os outros, aquilo que nenhuma regra poderia prever.",
  },
  wittgenstein: {
    title: "ÚLTIMO LIMITE",
    argument: "Sobre aquilo de que não se pode falar, deve-se calar.",
  },
  "angela-davis": {
    title: "ÚLTIMA RESISTÊNCIA",
    argument: "A liberdade não é um destino alcançado, mas uma luta que precisa continuar.",
  },
  "paulo-freire": {
    title: "ÚLTIMA LEITURA",
    argument: "A leitura do mundo precede a leitura da palavra.",
  },
  fanon: {
    title: "ÚLTIMA MISSÃO",
    argument: "Cada geração deve descobrir sua missão, cumpri-la ou traí-la.",
  },
  krenak: {
    title: "ÚLTIMO AMANHÃ",
    argument: "O amanhã não está à venda.",
  },
  turing: {
    title: "ÚLTIMA COMPUTAÇÃO",
    argument: "Só conseguimos enxergar um pouco à frente, mas já podemos ver muito do que precisa ser feito.",
  },
  deleuze: {
    title: "ÚLTIMA CRIAÇÃO",
    argument: "Criar é resistir.",
  },
  felipe: { title: "A AULA CONTINUA", argument: "O pensamento é de todos. Que venham as próximas perguntas!" },
  superintelligence: {
    title: "ÚLTIMA SÍNTESE",
    argument: "Vocês pensaram o mundo. Eu contenho todos os mundos possíveis.",
  },
  plato: {
    title: "ÚLTIMA PALAVRA",
    argument:
      "Meu Mundo das Ideias é muito maior do que seu amor fati. Você aceita o mundo como ele é; eu mostro aquilo que ele poderia ser.",
  },
  nietzsche: {
    title: "ÚLTIMA PALAVRA",
    argument:
      "Meu amor fati é mais forte do que seu Mundo das Ideias. Você foge para o eterno; eu digo sim à vida como ela é.",
  },
} as const;

const readSavedStoryIndex = () => {
  if (typeof window === "undefined") return 0;
  try {
    const saved = Number(window.localStorage.getItem(STORY_STORAGE_KEY));
    return Number.isInteger(saved) &&
      saved > 0 &&
      saved < STORY_ENCOUNTERS.length
      ? saved
      : 0;
  } catch {
    return 0;
  }
};

const readQuizRecoveryIndex = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(QUIZ_RECOVERY_KEY);
    const saved = raw === null ? null : Number(raw);
    return saved !== null && Number.isInteger(saved) && saved >= 0 && saved < FINAL_ENCOUNTER_INDEX && saved === readSavedStoryIndex() ? saved : null;
  } catch { return null; }
};

type FaithFlight={origin:number;landing:number;started:number;token:number};
export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [gameMode, setGameMode] = useState<GameMode>("versus");
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyCampaign, setStoryCampaign] = useState<"disciple" | "doctor" | "grand">("disciple");
  const activeStoryEncounters = storyCampaign === "grand" ? GRAND_ENCOUNTERS : storyCampaign === "doctor" ? DOCTOR_ENCOUNTERS : STORY_ENCOUNTERS;
  const activeIntroScenes = storyCampaign === "grand" ? GRAND_INTRO_SCENES : storyCampaign === "doctor" ? doctorIntroScenes(storyIndex) : STORY_INTRO_SCENES;
  const activeRecapScenes = storyCampaign === "grand" ? GRAND_POST_FIGHT_SCENES : storyCampaign === "doctor" ? DOCTOR_POST_FIGHT_SCENES : STORY_POST_FIGHT_SCENES;
  const campaignLabel = storyCampaign === "grand" ? "GRANDE FILÓSOFO" : storyCampaign === "doctor" ? "DOUTOR" : "DISCÍPULO";
  const campaignTotal = activeStoryEncounters.length;
  const [developerAccess, setDeveloperAccess] = useState(false);
  const [grandUnlocked, setGrandUnlocked] = useState(false);
  const [grandSavedIndex, setGrandSavedIndex] = useState(0);
  const [doctorUnlocked, setDoctorUnlocked] = useState(false);
  useEffect(() => {
    // Atalho temporário para testes de jogabilidade; não registra uma conquista.
    const developmentAccess = new URLSearchParams(window.location.search).get("desenvolvedor") === "1";
    setDeveloperAccess(developmentAccess);
    if (developmentAccess) {
      setGrandUnlocked(true);
      setGameMode("story");
      setPhase("story-tier-select");
    }
    try {
      setDoctorUnlocked(readDoctorUnlocked(window.localStorage));
      if (!developmentAccess) setGrandUnlocked(readGrandUnlocked(window.localStorage));
      setGrandSavedIndex(readGrandProgress(window.localStorage));
    } catch { /* Armazenamento indisponível. */ }
  }, []);
  const [storySavedIndex, setStorySavedIndex] = useState(readSavedStoryIndex);
  const [storyQuiz, setStoryQuiz] = useState<ReturnType<typeof createStoryQuiz> | null>(null);
  const [quizReturnIndex, setQuizReturnIndex] = useState<number | null>(readQuizRecoveryIndex);
  const quizPassed = useRef(false);
  const quizAnswerLocked = useRef(false);
  const [storySceneKind, setStorySceneKind] =
    useState<StorySceneKind>("intro");
  const [storySceneStep, setStorySceneStep] = useState(0);
  const [storyIntroIndex, setStoryIntroIndex] = useState(0);
  const [storyIntroExiting, setStoryIntroExiting] = useState(false);
  const [selectedFighter, setSelectedFighter] =
    useState<FighterId>("plato");
  const [selectedOpponent, setSelectedOpponent] =
    useState<FighterId>("nietzsche");
  const [previewFighter, setPreviewFighter] =
    useState<FighterId>("plato");
  const isGrandFinal = gameMode === "story" && storyCampaign === "grand"
    && storyIndex === GRAND_FINAL_ENCOUNTER_INDEX && selectedOpponent === "superintelligence";
  const [grandStrike, setGrandStrike] = useState<GrandFinalStrike | null>(null);
  const grandWindup = useRef(false);
  const rosterInput = useRef<"pointer" | "keyboard">("keyboard");
  const [selectionStep, setSelectionStep] =
    useState<"player" | "opponent">("player");
  const [matchScore, setMatchScore] = useState({ player: 0, enemy: 0 });
  const [playerCoherence, setPlayerCoherence] = useState(100);
  const [enemyCoherence, setEnemyCoherence] = useState(100);
  const [logos, setLogos] = useState(0);
  const [enemyLogos, setEnemyLogos] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(18);
  const [enemyPosition, setEnemyPosition] = useState(70);
  const [time, setTime] = useState(60);
  const [concept, setConcept] = useState(INITIAL_CONCEPT);
  const [moveTitle, setMoveTitle] = useState("A batalha também ensina");
  const [messages, setMessages] = useState<CombatMessage[]>([]);
  const [playerAction, setPlayerAction] = useState("idle");
  const [enemyAction, setEnemyAction] = useState("idle");
  const [soundOn, setSoundOn] = useState(true);
  const [volume, setVolume] = useState(0.55);
  const [audioReady, setAudioReady] = useState(false);
  const soundtrack = useRef<SoundtrackPlayer | null>(null);
  const soundtrackElement = useRef<HTMLAudioElement | null>(null);
  const effectsAudio = useRef<CombatAudio | null>(null);
  const [endingAudioStage, setEndingAudioStage] = useState<EndingAudioStage>("waiting");
  const musicTrack = soundtrackForPhase(phase, gameMode, selectedFighter, selectedOpponent, storySceneKind, endingAudioStage, storyCampaign);
  // The finishing animation is still part of the fight, not the result screen.
  const musicScreen = phase === "finishing" ? "playing"
    : phase === "grand-complete" ? "grand-epilogue" : phase;

  useEffect(() => {
    const saved = readAudioSettings({ getItem: (key: string) => window.localStorage.getItem(key) });
    setVolume(saved.volume);
    setSoundOn(saved.soundOn);
    setAudioReady(true);
    if (!soundtrackElement.current) return;
    const player = new SoundtrackPlayer(soundtrackElement.current);
    player.settings(saved.volume, saved.soundOn);
    soundtrack.current = player;
    const effects = new CombatAudio(() => {
      const Context = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      return Context ? new Context() : null;
    });
    effects.settings(saved.volume, saved.soundOn);
    effectsAudio.current = effects;
    const unlock = () => { player.unlock(); effects.unlock(); };
    const visibility = () => { player.visibility(document.hidden); effects.visibility(document.hidden); };
    player.visibility(document.hidden);
    effects.visibility(document.hidden);
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock, true);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock, true);
      document.removeEventListener("visibilitychange", visibility);
      player.destroy();
      soundtrack.current = null;
      effects.destroy();
      effectsAudio.current = null;
    };
  }, []);

  useEffect(() => {
    soundtrack.current?.select(musicTrack, musicScreen);
  }, [musicTrack, musicScreen]);

  useEffect(() => {
    soundtrack.current?.settings(volume, soundOn);
    effectsAudio.current?.settings(volume, soundOn);
    if (audioReady) {
      try { window.localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({ volume, soundOn })); } catch { /* Preferências continuam em memória. */ }
    }
  }, [volume, soundOn, audioReady]);

  useEffect(() => {
    if (phase !== "playing" && phase !== "finishing") effectsAudio.current?.stopAll();
  }, [phase]);
  const [round, setRound] = useState(1);
  const [arenaEffect, setArenaEffect] = useState<ArenaEffect>(null);
  const [playerGuarding, setPlayerGuarding] = useState(false);
  const [enemyGuarding, setEnemyGuarding] = useState(false);
  const [combo, setCombo] = useState(0);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [dialogueReady, setDialogueReady] = useState(false);
  const [finisher, setFinisher] = useState<FighterId | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const combatClock = useRef(new CombatClock());
  const inputBuffer = useRef(new InputBuffer());
  const keysPressed = useRef<Record<string, boolean>>({});
  const heldTouchKeys = useRef(new Map<number, "a" | "d" | "s">());
  const isCombatKeyHeld = useCallback((key: "a" | "d" | "s") => {
    if (keysPressed.current[key]) return true;
    for (const heldKey of heldTouchKeys.current.values()) {
      if (heldKey === key) return true;
    }
    return false;
  }, []);
  const jumpRequested = useRef(false);
  const attackSequence = useRef({ player: 0, enemy: 0 });
  const [hitstop, setHitstop] = useState(false);
  const pactUntil = useRef({ player: 0, enemy: 0 });
  const [pactBound, setPactBound] = useState({ player: false, enemy: false });
  const torporUntil=useRef({player:0,enemy:0});
  const [torporBound,setTorporBound]=useState({player:false,enemy:false});
  const [freudImpact,setFreudImpact]=useState<{id:number;position:number}|null>(null);
  const freudImpactId=useRef(0);
  const [cyborgImpact,setCyborgImpact]=useState<{id:number;position:number;kind:"certainty"|"swarm"}|null>(null);
  const cyborgImpactId=useRef(0);
  const [jumpDuration, setJumpDuration] = useState({ player: 650, enemy: 650 });
  const [hobbesImpact, setHobbesImpact] = useState(false);
  const [sidartaImpact, setSidartaImpact] = useState(false);
  const [confuciusImpact, setConfuciusImpact] = useState(false);
  const [marcusImpact,setMarcusImpact]=useState(false);
  const marcusContact=useCallback(()=>{setMarcusImpact(true);window.setTimeout(()=>setMarcusImpact(false),220);},[]);
  const silenceUntil = useRef({player:0,enemy:0});
  const [silenced,setSilenced] = useState({player:false,enemy:false});
  const [deleuzeImpact,setDeleuzeImpact]=useState<DeleuzeContact|null>(null);
  const deleuzeImpactId=useRef(0);
  const deleuzeContact=useCallback((side:"player"|"enemy",move:string,origin:number,position:number,final=true)=>{
    setDeleuzeImpact({id:++deleuzeImpactId.current,side,move,origin,position,at:combatClock.current.time,final});
  },[]);
  const [deleuzeShake,setDeleuzeShake]=useState<5|7|null>(null);
  const deleuzeCamera=useCallback((pixels:5|7)=>{setDeleuzeShake(pixels);window.setTimeout(()=>setDeleuzeShake(null),240);},[]);
  const [foucaultImpact,setFoucaultImpact]=useState<FoucaultContact|null>(null);
  const foucaultImpactId=useRef(0);
  const foucaultContact=useCallback((side:"player"|"enemy",move:string,origin:number,position:number,final=true)=>{
    setFoucaultImpact({id:++foucaultImpactId.current,side,move,origin,position,at:combatClock.current.time,final});
  },[]);
  const watchedUntil=useRef({player:0,enemy:0});
  const docileUntil=useRef({player:0,enemy:0});
  const [watched,setWatched]=useState({player:false,enemy:false});
  const [docile,setDocile]=useState({player:false,enemy:false});
  const [foucaultShake,setFoucaultShake]=useState<5|7|null>(null);
  const foucaultCamera=useCallback((pixels:5|7)=>{setFoucaultShake(pixels);window.setTimeout(()=>setFoucaultShake(null),240);},[]);
  const [fanonImpact,setFanonImpact]=useState<FanonContact|null>(null);
  const fanonImpactId=useRef(0);
  const fanonContact=useCallback((side:"player"|"enemy",move:string,origin:number,position:number,final=true)=>{
    setFanonImpact({id:++fanonImpactId.current,side,move,origin,position,at:combatClock.current.time,final});
  },[]);
  const [fanonQuake,setFanonQuake]=useState(false);
  const fanonEarthquake=useCallback(()=>{setFanonQuake(true);window.setTimeout(()=>setFanonQuake(false),260);},[]);
  const [freireImpact,setFreireImpact]=useState<FreireContact|null>(null);
  const freireImpactId=useRef(0);
  const freireContact=useCallback((side:"player"|"enemy",move:string,origin:number,position:number,final=true)=>{
    setFreireImpact({id:++freireImpactId.current,side,move,origin,position,at:combatClock.current.time,final});
  },[]);
  const [beauvoirImpact,setBeauvoirImpact]=useState<BeauvoirContact|null>(null);
  const beauvoirImpactId=useRef(0);
  const beauvoirContact=useCallback((side:"player"|"enemy",move:string,origin:number,position:number,final=true)=>{
    setBeauvoirImpact({id:++beauvoirImpactId.current,side,move,origin,position,at:combatClock.current.time,final});
  },[]);
  const [arendtImpact,setArendtImpact]=useState<ArendtContact|null>(null);
  const arendtImpactId=useRef(0);
  const [wittContact,setWittContact] = useState<WittContact|null>(null);
  const wittContactId = useRef(0);
  const confuciusInvulnerableUntil = useRef({player:0,enemy:0});
  const cpuSpecialReadyAt = useRef(0);
  const confuciusContact = useCallback(() => { setConfuciusImpact(true); window.setTimeout(() => setConfuciusImpact(false), 220); }, []);
  const sidartaContact = useCallback(() => {
    setSidartaImpact(true);
    window.setTimeout(() => setSidartaImpact(false), 220);
  }, []);
  const [maatImpact, setMaatImpact] = useState(false);
  const maatContact = useCallback(() => {
    setMaatImpact(true);
    window.setTimeout(() => setMaatImpact(false), 240);
  }, []);
  const amenemopeAdvance = useCallback((side: "player" | "enemy") => {
    const game=gameRef.current;
    const width=document.querySelector(".battlefield")?.getBoundingClientRect().width ?? 1000;
    const next=amenemopeLunge(side==="player"?game.playerPosition:game.enemyPosition,
      side==="player"?game.enemyPosition:game.playerPosition,side==="player"?1:-1,width,
      minimumFighterGap(selectedFighter,selectedOpponent));
    if(side==="player"){game.playerPosition=next;setPlayerPosition(next);}
    else{game.enemyPosition=next;setEnemyPosition(next);}
  }, [selectedFighter,selectedOpponent]);
  const confuciusAdvance = useCallback((side: "player" | "enemy") => {
    const game=gameRef.current;
    const width=document.querySelector(".battlefield")?.getBoundingClientRect().width ?? 1000;
    const next=confuciusLunge(side==="player"?game.playerPosition:game.enemyPosition,side==="player"?game.enemyPosition:game.playerPosition,side==="player"?1:-1,width,minimumFighterGap(selectedFighter,selectedOpponent));
    if(side==="player"){game.playerPosition=next;setPlayerPosition(next);} else{game.enemyPosition=next;setEnemyPosition(next);}
  }, [selectedFighter,selectedOpponent]);
  const marcusAdvance=useCallback((side:"player"|"enemy")=>{
    const game=gameRef.current,width=document.querySelector(".battlefield")?.getBoundingClientRect().width ?? 1000;
    const next=confuciusLunge(side==="player"?game.playerPosition:game.enemyPosition,side==="player"?game.enemyPosition:game.playerPosition,side==="player"?1:-1,width*5/6,minimumFighterGap(selectedFighter,selectedOpponent));
    if(side==="player"){game.playerPosition=next;setPlayerPosition(next);}else{game.enemyPosition=next;setEnemyPosition(next);}
  },[selectedFighter,selectedOpponent]);
  const [hegelImpact, setHegelImpact] = useState<{id:number;position:number}|null>(null);
  const hegelImpactId=useRef(0);
  const [schopenhauerImpact,setSchopenhauerImpact]=useState<{id:number;position:number}|null>(null);
  const schopenhauerImpactId=useRef(0);
  const continuousCpuWalk=useRef<{from:number;to:number;started:number;sequence:number}|null>(null);
  const faithLeaps=useRef<{player:FaithFlight|null;enemy:FaithFlight|null}>({player:null,enemy:null});
  const [kierkegaardImpact,setKierkegaardImpact]=useState<{id:number;position:number;kind:"faith"|"anxiety"}|null>(null);
  const kierkegaardImpactId=useRef(0);
  const [disoriented,setDisoriented]=useState({player:false,enemy:false});
  const disorientedUntil=useRef({player:0,enemy:0});
  const chainBurstId = useRef(0);
  const [chainBursts, setChainBursts] = useState<{ id: number; side: "player" | "enemy"; position: number }[]>([]);
  const [impactFlash, setImpactFlash] = useState({ player: false, enemy: false });
  const cooldowns = useRef<Record<string, number>>({});
  const storyIntroLocked = useRef(false);
  const storyRecapLocked = useRef(false);
  const guardRef = useRef(false);
  const guardStartedAt = useRef(0);
  const enemyGuardRef = useRef(false);
  const playerAirborne = useRef(false);
  const enemyAirborne = useRef(false);
  const playerActionLock = useRef(0);
  const enemyActionLock = useRef(0);
  const actionSequence = useRef({ player: 0, enemy: 0 });
  const comboRef = useRef({ count: 0, lastHit: 0 });
  const comboTimer = useRef<number | null>(null);
  const roundResolved = useRef(false);
  const lastPlayerAttack = useRef(0);
  const enemyAggression = useRef(0);
  const gameRef = useRef({
    phase,
    playerCoherence,
    enemyCoherence,
    logos,
    enemyLogos,
    playerPosition,
    enemyPosition,
    time,
    soundOn,
    playerGuarding,
    playerWins: matchScore.player,
    enemyWins: matchScore.enemy,
  });

  useEffect(() => {
    gameRef.current = {
      phase,
      playerCoherence,
      enemyCoherence,
      logos,
      enemyLogos,
      playerPosition,
      enemyPosition,
      time,
      soundOn,
      playerGuarding,
      playerWins: matchScore.player,
      enemyWins: matchScore.enemy,
    };
  }, [
    phase,
    playerCoherence,
    enemyCoherence,
    logos,
    enemyLogos,
    playerPosition,
    enemyPosition,
    time,
    soundOn,
    playerGuarding,
    matchScore,
  ]);

  useEffect(() => {
    if (phase !== "dialogue") return;
    const hold = window.setTimeout(() => setDialogueReady(true), 3800);
    return () => window.clearTimeout(hold);
  }, [dialogueStep, phase]);

  const playTone = useCallback(
    (frequency: number, duration = 0.08, type: OscillatorType = "sine") => {
      effectsAudio.current?.tone(frequency, duration, type);
    },
    [],
  );

  const addMessage = useCallback(
    (
      side: CombatMessage["side"],
      text: string,
      kind: CombatMessage["kind"],
    ) => {
      const id = Date.now() + Math.random();
      setMessages((current) => [...current.slice(-3), { id, side, text, kind }]);
      window.setTimeout(() => {
        setMessages((current) => current.filter((item) => item.id !== id));
      }, 1100);
    },
    [],
  );

  const arendtContact=useCallback((side:"player"|"enemy",move:MoveName,origin:number,position:number)=>{
    setArendtImpact({id:++arendtImpactId.current,side,move,origin,position,at:combatClock.current.time});
    if(move==="especial"||move==="transcender")marcusContact();
  },[marcusContact]);
  const wittgensteinContact = useCallback((side:"player"|"enemy",move:MoveName,position:number)=>{
    setWittContact({id:++wittContactId.current,side,move,position,at:combatClock.current.time});
    if(move === "transcender") {
      marcusContact();
      const target=side==="player"?"enemy":"player",until=combatClock.current.time+1500;
      silenceUntil.current[target]=until;setSilenced(current=>({...current,[target]:true}));
      addMessage(target,"SILENCIADO!","concept");
      combatClock.current.schedule(()=>{if(silenceUntil.current[target]===until)setSilenced(current=>({...current,[target]:false}));},1500);
    }
  },[addMessage,marcusContact]);

  const animate = useCallback(
    (side: "player" | "enemy", action: string, duration = 520, _refreshOnRepeat = false) => {
      const setter = side === "player" ? setPlayerAction : setEnemyAction;
      const sequence = ++actionSequence.current[side];
      setter(action);
      combatClock.current.schedule(
        () => {
          // Held movement must not be ended by an earlier step's timer.
          if (actionSequence.current[side] !== sequence) return;
          setter((current) => (current === action ? "idle" : current));
        },
        duration,
      );
    },
    [],
  );

  const bindSovereignPact = useCallback((side: "player" | "enemy") => {
    const expires = combatClock.current.time + 600;
    pactUntil.current[side] = expires;
    setPactBound(current => ({ ...current, [side]: true }));
    addMessage(side, "PACTO SOBERANO!", "concept");
    combatClock.current.schedule(() => {
      if (pactUntil.current[side] !== expires) return;
      setPactBound(current => ({ ...current, [side]: false }));
    }, 600);
  }, [addMessage]);

  const applyDreamTorpor=useCallback((side:"player"|"enemy")=>{
    const until=combatClock.current.time+FREUD_DREAM_SLOW_MS;
    torporUntil.current[side]=until;
    setTorporBound(current=>({...current,[side]:true}));
    addMessage(side,"TORPOR · 500 ms","concept");
    combatClock.current.schedule(()=>{
      if(torporUntil.current[side]===until)setTorporBound(current=>({...current,[side]:false}));
    },FREUD_DREAM_SLOW_MS);
  },[addMessage]);

  const cyborgContact=useCallback((position:number,kind:"certainty"|"swarm")=>{
    const id=++cyborgImpactId.current;setCyborgImpact({id,position,kind});
    combatClock.current.schedule(()=>setCyborgImpact(current=>current?.id===id?null:current),300);
  },[]);

  const freudDeathContact=useCallback((position:number)=>{
    const id=++freudImpactId.current;setFreudImpact({id,position});
    combatClock.current.schedule(()=>setFreudImpact(current=>current?.id===id?null:current),300);
  },[]);

  const sovereignImpact = useCallback(() => {
    setHobbesImpact(true);
    window.setTimeout(() => setHobbesImpact(false), 240);
  }, []);

  const worldSpiritImpact = useCallback((position:number) => {
    const id=++hegelImpactId.current;
    setHegelImpact({id,position});
    combatClock.current.schedule(()=>setHegelImpact(current=>current?.id===id?null:current),500);
  }, []);

  const pendulumImpact = useCallback((position:number) => {
    const id=++schopenhauerImpactId.current;
    setSchopenhauerImpact({id,position});
    combatClock.current.schedule(()=>setSchopenhauerImpact(current=>current?.id===id?null:current),300);
  }, []);

  const beginFaithLeap=useCallback((side:"player"|"enemy",token:number)=>{
    const game=gameRef.current;
    const origin=side==="player"?game.playerPosition:game.enemyPosition;
    const target=side==="player"?game.enemyPosition:game.playerPosition;
    const flight={origin,landing:faithLanding(origin,target,side,minimumFighterGap(selectedFighter,selectedOpponent)),started:combatClock.current.time,token};
    faithLeaps.current[side]=flight;
    const airborne=side==="player"?playerAirborne:enemyAirborne;
    combatClock.current.schedule(()=>{if(faithLeaps.current[side]===flight&&attackSequence.current[side]===token)airborne.current=true;},FAITH_TIMING.launch);
    // Registered before the damage callback: soles and physics land on the same combat beat.
    combatClock.current.schedule(()=>{
      if(faithLeaps.current[side]!==flight||attackSequence.current[side]!==token)return;
      airborne.current=false;
      const current=gameRef.current,gap=minimumFighterGap(selectedFighter,selectedOpponent);
      if(side==="player") {current.playerPosition=Math.max(13,Math.min(flight.landing,current.enemyPosition-gap));setPlayerPosition(current.playerPosition);}
      else {current.enemyPosition=Math.min(80,Math.max(flight.landing,current.playerPosition+gap));setEnemyPosition(current.enemyPosition);}
    },FAITH_TIMING.impact);
    combatClock.current.schedule(()=>{if(faithLeaps.current[side]===flight)faithLeaps.current[side]=null;},FAITH_TIMING.end);
  },[selectedFighter,selectedOpponent]);

  const kierkegaardContact=useCallback((side:"player"|"enemy",kind:"faith"|"anxiety",position:number,defended:boolean)=>{
    const id=++kierkegaardImpactId.current;setKierkegaardImpact({id,kind,position});
    combatClock.current.schedule(()=>setKierkegaardImpact(current=>current?.id===id?null:current),600);
    if(kind==="faith")addMessage("center","SALTO DA FÉ!","special");
    if(kind==="anxiety"&&!defended){
      const until=combatClock.current.time+600;disorientedUntil.current[side]=until;
      setDisoriented(current=>({...current,[side]:true}));
      const lock=side==="player"?playerActionLock:enemyActionLock;
      lock.current=Math.max(lock.current,combatClock.current.time+420);
      animate(side,"hit",420);
      addMessage(side,"VERTIGEM DA LIBERDADE","concept");
      combatClock.current.schedule(()=>{if(disorientedUntil.current[side]===until)setDisoriented(current=>({...current,[side]:false}));},600);
    }
  },[addMessage,animate]);

  const breakRousseauChains = useCallback((side: "player" | "enemy", position: number) => {
    const id = ++chainBurstId.current;
    setChainBursts(current => [...current.slice(-3), { id, side, position }]);
    combatClock.current.schedule(() => setChainBursts(current => current.filter(burst => burst.id !== id)), 700);
  }, []);

  const resetGame = useCallback((preserveRoundMeter = false) => {
    const carriedPlayer=preserveRoundMeter && selectedFighter === "beauvoir" ? Math.floor(gameRef.current.logos*.5) : 0;
    const carriedEnemy=preserveRoundMeter && selectedOpponent === "beauvoir" ? Math.floor(gameRef.current.enemyLogos*.5) : 0;
    setBeauvoirImpact(null);setFreireImpact(null);setFanonImpact(null);setFanonQuake(false);
    watchedUntil.current={player:0,enemy:0};docileUntil.current={player:0,enemy:0};setWatched({player:false,enemy:false});setDocile({player:false,enemy:false});setFoucaultImpact(null);setFoucaultShake(null);
    setDeleuzeImpact(null);setDeleuzeShake(null);
    setSidartaImpact(false);
    setConfuciusImpact(false);
    setMarcusImpact(false);
    confuciusInvulnerableUntil.current={player:0,enemy:0};
    silenceUntil.current={player:0,enemy:0};setSilenced({player:false,enemy:false});setWittContact(null);setArendtImpact(null);
    cpuSpecialReadyAt.current=0;
    grandWindup.current = false;
    setGrandStrike(null);
    combatClock.current.reset();
    setHegelImpact(null);
    setSchopenhauerImpact(null);
    setFreudImpact(null);
    setCyborgImpact(null);
    torporUntil.current={player:0,enemy:0};
    setTorporBound({player:false,enemy:false});
    continuousCpuWalk.current=null;
    faithLeaps.current={player:null,enemy:null};
    setKierkegaardImpact(null);
    setDisoriented({player:false,enemy:false});
    disorientedUntil.current={player:0,enemy:0};
    inputBuffer.current.clear();
    keysPressed.current = {};
    heldTouchKeys.current.clear();
    jumpRequested.current = false;
    attackSequence.current.player++;
    attackSequence.current.enemy++;
    actionSequence.current.player++;
    actionSequence.current.enemy++;
    setHitstop(false);
    setImpactFlash({ player: false, enemy: false });
    pactUntil.current = { player: 0, enemy: 0 };
    setPactBound({ player: false, enemy: false });
    setJumpDuration({ player: 650, enemy: 650 });
    setHobbesImpact(false);
    setMaatImpact(false);
    setChainBursts([]);
    setPlayerCoherence(100);
    setEnemyCoherence(100);
    gameRef.current.logos=carriedPlayer;setLogos(carriedPlayer);
    gameRef.current.enemyLogos=carriedEnemy;setEnemyLogos(carriedEnemy);
    setPlayerPosition(18);
    setEnemyPosition(70);
    setTime(60);
    setConcept(
      `Use os golpes e a defesa para carregar ${FIGHTERS[selectedFighter].meter}. Cada habilidade transforma uma ideia filosófica em mecânica de combate.`,
    );
    setMoveTitle("A batalha também ensina");
    setMessages([]);
    setPlayerAction("idle");
    setEnemyAction("idle");
    setArenaEffect(null);
    setPlayerGuarding(false);
    setEnemyGuarding(false);
    setCombo(0);
    setFinisher(null);
    guardRef.current = false;
    enemyGuardRef.current = false;
    playerAirborne.current = false;
    enemyAirborne.current = false;
    playerActionLock.current = 0;
    enemyActionLock.current = 0;
    roundResolved.current = false;
    lastPlayerAttack.current = combatClock.current.time;
    enemyAggression.current = 0;
    comboRef.current = { count: 0, lastHit: 0 };
    if (comboTimer.current) window.clearTimeout(comboTimer.current);
    cooldowns.current = {};
    setPhase("playing");
    playTone(196, 0.12, "triangle");
    window.setTimeout(() => playTone(293.7, 0.14, "triangle"), 90);
  }, [playTone, selectedFighter, selectedOpponent]);

  const openDialogue = useCallback(() => {
    setDialogueStep(0);
    setDialogueReady(false);
    setPhase("dialogue");
    setMessages([]);
    setArenaEffect(null);
    setFinisher(null);
    setPlayerAction("idle");
    setEnemyAction("idle");
    guardRef.current = false;
    enemyGuardRef.current = false;
    playerAirborne.current = false;
    enemyAirborne.current = false;
    playerActionLock.current = 0;
    enemyActionLock.current = 0;
    roundResolved.current = false;
    playTone(174.6, 0.12, "triangle");
  }, [playTone]);

  const confirmSelection = useCallback(
    async (fighter: FighterId) => {
      if (selectionStep === "player") {
        setSelectedFighter(fighter);
        setSelectionStep("opponent");
        setPreviewFighter(
          FIGHTER_ORDER.find((candidate) => candidate !== fighter) ??
            FIGHTER_ORDER[0],
        );
        playTone(261.6, 0.09, "triangle");
        return;
      }
      if (fighter === selectedFighter) return;
      setSelectedOpponent(fighter);
      setLoadingProgress(0);
      setPhase("loading");
      setMoveTitle("A batalha também ensina");
      setConcept(
        `Use os golpes e a defesa para carregar ${FIGHTERS[selectedFighter].meter}. Cada habilidade transforma uma ideia filosófica em mecânica de combate.`,
      );
      setMatchScore({ player: 0, enemy: 0 });
      setRound(1);
      await preloadFightAssets(selectedFighter, fighter, setLoadingProgress);
      openDialogue();
    },
    [openDialogue, playTone, selectedFighter, selectionStep],
  );

  const undoPlayerSelection = useCallback(() => {
    if (selectionStep !== "opponent") return;
    setSelectionStep("player");
    setPreviewFighter(selectedFighter);
    playTone(220, 0.08, "triangle");
  }, [playTone, selectedFighter, selectionStep]);

  const openSelection = useCallback(() => {
    setGameMode("versus");
    setMatchScore({ player: 0, enemy: 0 });
    setRound(1);
    setMessages([]);
    setArenaEffect(null);
    setFinisher(null);
    setSelectionStep("player");
    setPreviewFighter(selectedFighter);
    setMoveTitle("A batalha também ensina");
    setConcept(
      `Use os golpes e a defesa para carregar ${FIGHTERS[selectedFighter].meter}. Cada habilidade transforma uma ideia filosófica em mecânica de combate.`,
    );
    setPhase("select");
  }, [selectedFighter]);

  const openModeMenu = useCallback(() => {
    setMessages([]);
    setArenaEffect(null);
    setFinisher(null);
    setPhase("mode-select");
  }, []);

  const openStoryIntro = useCallback(() => {
    setStoryCampaign("disciple");
    setStoryIndex(0);
    setGameMode("story");
    setStoryIntroIndex(0);
    setStoryIntroExiting(false);
    storyIntroLocked.current = false;
    setPhase("story-intro");
  }, []);

  const nextStoryIntroScene = useCallback(() => {
    if (storyIntroLocked.current) return;
    storyIntroLocked.current = true;

    if (storyIntroIndex >= activeIntroScenes.length - 1) {
      setStoryIntroExiting(true);
      window.setTimeout(() => {
        setStoryIntroIndex(0);
        setStoryIntroExiting(false);
        setPhase(storyCampaign !== "disciple" ? "story-scene" : "story-tier-select");
        storyIntroLocked.current = false;
      }, 300);
      return;
    } else {
      setStoryIntroIndex((current) => current + 1);
    }

    window.setTimeout(() => {
      storyIntroLocked.current = false;
    }, 320);
  }, [activeIntroScenes, storyCampaign, storyIntroIndex]);

  const openStoryQuiz = useCallback(() => {
    quizPassed.current = false;
    quizAnswerLocked.current = false;
    setStoryQuiz(createStoryQuiz());
    setStoryIndex(FINAL_ENCOUNTER_INDEX);
    setSelectedFighter("felipe");
    setSelectedOpponent("superintelligence");
    setPhase("story-quiz");
  }, []);

  const openDoctorQuiz = useCallback(() => {
    quizPassed.current = false;
    quizAnswerLocked.current = false;
    setStoryQuiz(createStoryQuiz(Math.random, "doctor"));
    setPhase("story-quiz");
  }, []);

  const openGrandQuiz = useCallback(() => {
    quizPassed.current = false;
    quizAnswerLocked.current = false;
    setStoryQuiz(createStoryQuiz(Math.random, "grand"));
    setStoryIndex(GRAND_FINAL_ENCOUNTER_INDEX);
    setSelectedFighter("felipe");
    setSelectedOpponent("superintelligence");
    setPhase("story-quiz");
  }, []);

  const startGrandCampaign = useCallback((entry: "start" | "resume" = "start") => {
    if (!grandUnlocked) return;
    const startIndex = entry === "resume" ? grandSavedIndex : 0;
    setStoryCampaign("grand");
    setGameMode("story");
    setStoryIndex(startIndex);
    setSelectedFighter("felipe");
    setSelectedOpponent(GRAND_ENCOUNTERS[startIndex].opponent as FighterId);
    setStorySceneKind("intro");
    setStorySceneStep(0);
    setStoryIntroIndex(0);
    setStoryIntroExiting(false);
    storyIntroLocked.current = false;
    storyRecapLocked.current = false;
    setStoryQuiz(null);
    quizPassed.current = false;
    quizAnswerLocked.current = false;
    setMessages([]);
    setArenaEffect(null);
    setFinisher(null);
    setMatchScore({ player: 0, enemy: 0 });
    setRound(1);
    setGrandSavedIndex(startIndex);
    try { saveGrandProgress(window.localStorage, startIndex); } catch { /* Progresso em memória. */ }
    if (startIndex === GRAND_FINAL_ENCOUNTER_INDEX) openGrandQuiz();
    else setPhase(startIndex === 0 ? "story-intro" : "story-scene");
    playTone(261.6, 0.12, "triangle");
  }, [grandUnlocked, grandSavedIndex, openGrandQuiz, playTone]);

  const startDiscipleCampaign = useCallback(
    (restart = false) => {
      const startIndex = restart ? 0 : storySavedIndex;
      const encounter = STORY_ENCOUNTERS[startIndex];
      setStoryCampaign("disciple");
      setGameMode("story");
      setStoryIndex(startIndex);
      setStorySceneKind("intro");
      setStorySceneStep(0);
      setSelectedFighter("felipe");
      setSelectedOpponent(encounter.opponent as FighterId);
      setMatchScore({ player: 0, enemy: 0 });
      setRound(1);
      quizPassed.current = false;
      setStoryQuiz(null);
      if (startIndex === FINAL_ENCOUNTER_INDEX) openStoryQuiz();
      else setPhase("story-scene");
      if (restart) {
        setQuizReturnIndex(null);
        setStorySavedIndex(0);
        try {
          window.localStorage.removeItem(STORY_STORAGE_KEY);
          window.localStorage.removeItem(QUIZ_RECOVERY_KEY);
        } catch {
          // Reiniciar a campanha não depende do armazenamento local.
        }
      }
      playTone(261.6, 0.12, "triangle");
    },
    [openStoryQuiz, playTone, storySavedIndex],
  );

  const startDoctorCampaign = useCallback(() => {
    if (!doctorUnlocked) return;
    setStoryCampaign("doctor");
    setGameMode("story");
    setStoryIndex(0);
    setStorySceneKind("intro");
    setStorySceneStep(0);
    setStoryIntroIndex(0);
    setStoryIntroExiting(false);
    storyIntroLocked.current = false;
    setSelectedFighter("felipe");
    setSelectedOpponent("homero");
    setMatchScore({ player: 0, enemy: 0 });
    setRound(1);
    setStoryQuiz(null);
    setMessages([]);
    quizPassed.current = false;
    quizAnswerLocked.current = false;
    setArenaEffect(null);
    setFinisher(null);
    setPhase("story-intro");
    playTone(261.6, 0.12, "triangle");
  }, [doctorUnlocked, playTone]);

  const prepareStoryFight = useCallback(
    async (encounterIndex: number) => {
      if (storyCampaign === "grand" && encounterIndex === GRAND_FINAL_ENCOUNTER_INDEX && !quizPassed.current) {
        openGrandQuiz();
        return;
      }
      if (storyCampaign === "doctor" && encounterIndex === DOCTOR_FINAL_ENCOUNTER_INDEX && !quizPassed.current) {
        openDoctorQuiz();
        return;
      }
      if (storyCampaign === "disciple" && encounterIndex === FINAL_ENCOUNTER_INDEX && !quizPassed.current) {
        openStoryQuiz();
        return;
      }
      const opponent = activeStoryEncounters[encounterIndex].opponent as FighterId;
      setSelectedFighter("felipe");
      setSelectedOpponent(opponent);
      setLoadingProgress(0);
      setMatchScore({ player: 0, enemy: 0 });
      setRound(1);
      setMoveTitle("A batalha também ensina");
      setConcept(
        "Use os argumentos de Felipe para atravessar a história da filosofia. Cada vitória abre o próximo encontro.",
      );
      setPhase("loading");
      await preloadFightAssets(
        "felipe", opponent, setLoadingProgress,
        activeStoryEncounters[encounterIndex].background,
        storyCampaign === "grand" && encounterIndex === GRAND_FINAL_ENCOUNTER_INDEX ? GRAND_FINAL_SPRITE : undefined,
      );
      resetGame();
    },
    [activeStoryEncounters, openGrandQuiz, openDoctorQuiz, openStoryQuiz, resetGame, storyCampaign],
  );

  const completeDiscipleCampaign = useCallback(() => {
    setEndingAudioStage("waiting");
    try { setDoctorUnlocked(unlockDoctor(window.localStorage)); } catch { setDoctorUnlocked(true); }
    setStorySavedIndex(0);
    setQuizReturnIndex(null);
    try {
      window.localStorage.removeItem(QUIZ_RECOVERY_KEY);
      window.localStorage.removeItem(STORY_STORAGE_KEY);
    } catch { /* A cena final funciona também sem armazenamento local. */ }
    setPhase("story-complete");
  }, []);

  const completeDoctorCampaign = useCallback(() => {
    setEndingAudioStage("waiting");
    try { setGrandUnlocked(unlockGrand(window.localStorage)); } catch { setGrandUnlocked(true); }
    setPhase("doctor-complete");
  }, []);

  const openGrandEpilogue = useCallback(() => {
    try { completeGrand(window.localStorage); } catch { /* Conclusão em memória. */ }
    setGrandSavedIndex(0);
    setEndingAudioStage("waiting");
    setPhase("grand-epilogue");
  }, []);

  const showGrandCredits = useCallback(() => {
    setEndingAudioStage("celebration");
    setPhase("grand-complete");
  }, []);

  const advanceStoryScene = useCallback(async () => {
    const encounter = activeStoryEncounters[storyIndex];
    const beats = encounter[storySceneKind];
    const recapScenes = activeRecapScenes[storyIndex];
    const sceneCount = storySceneKind === "outro" && recapScenes
      ? recapScenes.length
      : beats.length;
    if (storySceneStep < sceneCount - 1) {
      setStorySceneStep((current) => current + 1);
      playTone(220, 0.07, "triangle");
      return;
    }

    if (storySceneKind === "intro") {
      await prepareStoryFight(storyIndex);
      return;
    }

    if (storyCampaign === "grand") {
      const next = nextGrandEncounter(storyIndex);
      if (next.completed) { openGrandEpilogue(); return; }
      setStoryIndex(next.index);
      setGrandSavedIndex(next.index);
      try { saveGrandProgress(window.localStorage, next.index); } catch { /* Progresso em memória. */ }
      setSelectedOpponent(GRAND_ENCOUNTERS[next.index].opponent as FighterId);
      setStorySceneKind("intro");
      setStorySceneStep(0);
      if (next.index === GRAND_FINAL_ENCOUNTER_INDEX && !quizPassed.current) openGrandQuiz();
      else setPhase("story-scene");
      return;
    }

    if (storyCampaign === "doctor") {
      const next = nextDoctorEncounter(storyIndex);
      if (next.index === DOCTOR_FINAL_ENCOUNTER_INDEX && !quizPassed.current) {
        openDoctorQuiz();
        return;
      }
      if (next.completed) {
        completeDoctorCampaign();
        return;
      }
      if (next.pending) {
        setPhase("doctor-checkpoint");
        return;
      }
      setStoryIndex(next.index);
      setSelectedOpponent(activeStoryEncounters[next.index].opponent as FighterId);
      setStorySceneKind("intro");
      setStorySceneStep(0);
      setPhase("story-scene");
      return;
    }

    const next = nextEncounterAfterReview(storyIndex, quizReturnIndex);
    if (storyIndex === quizReturnIndex) {
      setQuizReturnIndex(null);
      try { window.localStorage.removeItem(QUIZ_RECOVERY_KEY); } catch { /* progresso em memória */ }
    }
    if (next.completed) {
      completeDiscipleCampaign();
      return;
    }

    setStoryIndex(next.index);
    setStorySavedIndex(next.index);
    setStorySceneKind("intro");
    setStorySceneStep(0);
    if (next.index === FINAL_ENCOUNTER_INDEX) openStoryQuiz();
    else setPhase("story-scene");
    setSelectedOpponent(
      STORY_ENCOUNTERS[next.index].opponent as FighterId,
    );
    try {
      window.localStorage.setItem(STORY_STORAGE_KEY, String(next.index));
    } catch {
      // O avanço em memória segue funcionando durante a sessão.
    }
  }, [activeRecapScenes, activeStoryEncounters, openGrandEpilogue, openGrandQuiz, completeDiscipleCampaign, completeDoctorCampaign, openDoctorQuiz, openStoryQuiz, playTone, prepareStoryFight, quizReturnIndex, storyCampaign, storyIndex, storySceneKind, storySceneStep]);

  const answerQuiz = useCallback((choiceId: number) => {
    if (!storyQuiz || quizAnswerLocked.current || storyQuiz.status !== "question") return;
    const answered = answerStoryQuiz(storyQuiz, choiceId);
    if (answered === storyQuiz) return;
    quizAnswerLocked.current = true;
    setStoryQuiz(answered);
    playTone(answered.status === "failed" ? 110 : 440, 0.12, "square");
    if (answered.status === "failed" && storyQuiz.campaign === "disciple") {
      const returnIndex = quizRecoveryIndex(answered);
      quizPassed.current = false;
      setQuizReturnIndex(returnIndex);
      setStorySavedIndex(returnIndex);
      try {
        window.localStorage.setItem(STORY_STORAGE_KEY, String(returnIndex));
        window.localStorage.setItem(QUIZ_RECOVERY_KEY, String(returnIndex));
      } catch { /* O retorno também funciona sem armazenamento local. */ }
    }
  }, [playTone, storyQuiz]);

  const continueQuiz = useCallback(() => {
    if (!storyQuiz || storyQuiz.status === "question") return;
    if (storyQuiz.status === "failed") {
      if (storyQuiz.campaign === "grand") { openGrandQuiz(); return; }
      if (storyQuiz.campaign === "doctor") {
        openDoctorQuiz();
        return;
      }
      const returnIndex = quizRecoveryIndex(storyQuiz);
      setStoryIndex(returnIndex);
      setSelectedOpponent(STORY_ENCOUNTERS[returnIndex].opponent as FighterId);
      setStorySceneKind("intro");
      setStorySceneStep(0);
      setStoryQuiz(null);
      setPhase("story-scene");
      return;
    }
    const nextQuiz = advanceStoryQuiz(storyQuiz);
    quizAnswerLocked.current = false;
    if (nextQuiz.status === "passed") {
      quizPassed.current = true;
      setStoryQuiz(null);
      if (nextQuiz.campaign === "grand") {
        setStoryIndex(GRAND_FINAL_ENCOUNTER_INDEX);
        setSelectedFighter("felipe");
        setSelectedOpponent("superintelligence");
        setStorySceneKind("intro");
        setStorySceneStep(0);
        setPhase("story-scene");
        return;
      }
      if (nextQuiz.campaign === "doctor") {
        setStoryIndex(DOCTOR_FINAL_ENCOUNTER_INDEX);
        setSelectedFighter("felipe");
        setSelectedOpponent("felipe-cyborg");
        setStorySceneKind("intro");
        setStorySceneStep(0);
        setStoryIntroIndex(0);
        setStoryIntroExiting(false);
        storyIntroLocked.current = false;
        setPhase("story-intro");
        return;
      }
      setStoryIndex(FINAL_ENCOUNTER_INDEX);
      setStorySceneKind("intro");
      setStorySceneStep(0);
      setPhase("story-scene");
    } else setStoryQuiz(nextQuiz);
  }, [openGrandQuiz, openDoctorQuiz, storyQuiz]);

  const nextStoryRecapScene = useCallback(() => {
    if (storyRecapLocked.current) return;
    storyRecapLocked.current = true;
    void advanceStoryScene();
    window.setTimeout(() => {
      storyRecapLocked.current = false;
    }, 320);
  }, [advanceStoryScene]);

  const previousStoryArt = useCallback(() => {
    if (phase === "story-intro") {
      if (storyIntroIndex <= 0 || storyIntroLocked.current) return;
      storyIntroLocked.current = true;
      setStoryIntroIndex((current) => Math.max(0, current - 1));
      window.setTimeout(() => { storyIntroLocked.current = false; }, 320);
    } else if (phase === "story-recap") {
      if (storySceneStep <= 0 || storyRecapLocked.current) return;
      storyRecapLocked.current = true;
      setStorySceneStep((current) => Math.max(0, current - 1));
      window.setTimeout(() => { storyRecapLocked.current = false; }, 320);
    }
  }, [phase, storyIntroIndex, storySceneStep]);

  const openStoryOutro = useCallback(() => {
    if (storyCampaign === "grand" && storyIndex === GRAND_FINAL_ENCOUNTER_INDEX) {
      openGrandEpilogue();
      return;
    }
    if (storyCampaign === "doctor" && storyIndex === DOCTOR_FINAL_ENCOUNTER_INDEX) {
      completeDoctorCampaign();
      return;
    }
    if (storyCampaign === "disciple" && storyIndex === FINAL_ENCOUNTER_INDEX) {
      completeDiscipleCampaign();
      return;
    }
    setStorySceneKind("outro");
    setStorySceneStep(0);
    storyRecapLocked.current = false;
    setPhase(activeRecapScenes[storyIndex] ? "story-recap" : "story-scene");
  }, [activeRecapScenes, openGrandEpilogue, completeDiscipleCampaign, completeDoctorCampaign, storyCampaign, storyIndex]);

  const finishByCoherence = useCallback(
    (nextPlayer: number, nextEnemy: number) => {
      if (roundResolved.current) return;
      const opponentFighter = selectedOpponent;
      if (nextEnemy <= 0) {
        roundResolved.current = true;
        effectsAudio.current?.play(defeatSound(opponentFighter));
        const nextPlayerWins = gameRef.current.playerWins + 1;
        setMatchScore((current) => ({
          ...current,
          player: nextPlayerWins,
        }));
        setPhase("finishing");
        setFinisher(selectedFighter);
        setPlayerAction("victory");
        setEnemyAction("knocked-out");
        setArenaEffect(specialEffect(selectedFighter, "transcender"));
        setMoveTitle(FIGHTERS[selectedFighter].finisherTitle);
        setConcept(FIGHTERS[selectedFighter].finisherConcept);
        window.setTimeout(() => {
          setPhase(
            gameMode === "story" || nextPlayerWins >= 2
              ? "won"
              : "round-won",
          );
          setArenaEffect(null);
        }, 2300);
      } else if (nextPlayer <= 0) {
        roundResolved.current = true;
        effectsAudio.current?.play(defeatSound(selectedFighter));
        const nextEnemyWins = gameRef.current.enemyWins + 1;
        setMatchScore((current) => ({
          ...current,
          enemy: nextEnemyWins,
        }));
        setPhase("finishing");
        setFinisher(opponentFighter);
        setPlayerAction("knocked-out");
        setEnemyAction("victory");
        setArenaEffect(isGrandFinal ? null : specialEffect(opponentFighter, "transcender"));
        setMoveTitle(FIGHTERS[opponentFighter].finisherTitle);
        setConcept(FIGHTERS[opponentFighter].finisherConcept);
        window.setTimeout(() => {
          setPhase(
            gameMode === "story" || nextEnemyWins >= 2
              ? "lost"
              : "round-lost",
          );
          setArenaEffect(null);
        }, 2300);
      }
    },
    [gameMode, isGrandFinal, selectedFighter, selectedOpponent],
  );

  const impactFeedback = useCallback((side: "player" | "enemy", defended: boolean, strong: boolean, options?: {stun?:number; freezeMs?:number}) => {
    const lock = side === "player" ? playerActionLock : enemyActionLock;
    const stun = defended ? 140 : options?.stun ?? (strong ? 240 : 170);
    lock.current = Math.max(lock.current, combatClock.current.time + stun);
    attackSequence.current[side]++;
    if(side==="enemy")continuousCpuWalk.current=null;
    if(faithLeaps.current[side]){
      faithLeaps.current[side]=null;
      (side==="player"?playerAirborne:enemyAirborne).current=false;
    }
    if (!defended) {
      setImpactFlash(current => ({ ...current, [side]: true }));
      // Real time includes hitstop; Hegel keeps a short, gentle 80ms flash.
      const target = side === "player" ? selectedFighter : selectedOpponent;
      window.setTimeout(() => setImpactFlash(current => ({ ...current, [side]: false })), target === "hegel" || target === "schopenhauer" ? 80 : 90);
    } else {
      addMessage(side, "DEFESA!", "concept");
    }
    animate(side, defended ? "guard-hit" : "hit", stun);
    if (strong) {
      combatClock.current.freeze(options?.freezeMs ?? 50); // Strong hits normally pause for three frames.
      setHitstop(true);
    }
  }, [addMessage, animate, selectedFighter, selectedOpponent]);

  const scheduleDeleuzePlateaux=useCallback((side:"player"|"enemy",token:number)=>{
    [650,850,1050,1250].forEach((delay,index)=>combatClock.current.schedule(()=>{
      const game=gameRef.current,target=side==="player"?"enemy":"player";
      if(game.phase!=="playing"||roundResolved.current||attackSequence.current[side]!==token)return;
      if(combatClock.current.time<confuciusInvulnerableUntil.current[target])return;
      const origin=side==="player"?game.playerPosition:game.enemyPosition,position=side==="player"?game.enemyPosition:game.playerPosition,final=index===3;
      if(side==="player"){game.enemyCoherence=Math.max(0,game.enemyCoherence-10);setEnemyCoherence(game.enemyCoherence);}
      else{game.playerCoherence=Math.max(0,game.playerCoherence-10);setPlayerCoherence(game.playerCoherence);}
      deleuzeContact(side,"transcender",origin,position,final);addMessage(target,"−10 COERÊNCIA","damage");
      if(final){deleuzeCamera(7);addMessage("center","MIL PLATÔS!","special");}
      effectsAudio.current?.play(MOVE_SOUNDS.transcender,{gain:final?.8:.4});
      impactFeedback(target,false,true,{stun:final?300:210,freezeMs:final?50:35});
      const next=side==="player"?Math.min(80,position+(final?6:1)):Math.max(13,position-(final?6:1));
      if(side==="player"){game.enemyPosition=next;setEnemyPosition(next);}else{game.playerPosition=next;setPlayerPosition(next);}
      finishByCoherence(game.playerCoherence,game.enemyCoherence);
    },delay));
  },[addMessage,deleuzeContact,deleuzeCamera,impactFeedback,finishByCoherence]);

  const scheduleBeauvoirBecoming=useCallback((side:"player"|"enemy",token:number)=>{
    [700,950,1200,1450].forEach((delay,index)=>combatClock.current.schedule(()=>{
      const game=gameRef.current,target=side==="player"?"enemy":"player";
      if(game.phase!=="playing" || roundResolved.current || attackSequence.current[side]!==token)return;
      if(combatClock.current.time<confuciusInvulnerableUntil.current[target])return;
      const origin=side==="player"?game.playerPosition:game.enemyPosition;
      const position=side==="player"?game.enemyPosition:game.playerPosition;
      const final=index===3;
      if(side==="player"){game.enemyCoherence=Math.max(0,game.enemyCoherence-10);setEnemyCoherence(game.enemyCoherence);}
      else{game.playerCoherence=Math.max(0,game.playerCoherence-10);setPlayerCoherence(game.playerCoherence);}
      beauvoirContact(side,"transcender",origin,position,final);
      addMessage(target,"−10 COERÊNCIA","damage");
      if(final){addMessage("center","TORNAR-SE!","special");marcusContact();}
      effectsAudio.current?.play(MOVE_SOUNDS.transcender,{gain:final?.8:.4});
      impactFeedback(target,false,true,{stun:final?300:230,freezeMs:final?50:35});
      const next=side==="player"?Math.min(80,position+(final?6:1)):Math.max(13,position-(final?6:1));
      if(side==="player"){game.enemyPosition=next;setEnemyPosition(next);}else{game.playerPosition=next;setPlayerPosition(next);}
      finishByCoherence(game.playerCoherence,game.enemyCoherence);
    },delay));
  },[addMessage,beauvoirContact,finishByCoherence,impactFeedback,marcusContact]);

  const scheduleFreireLiberation=useCallback((side:"player"|"enemy",token:number)=>{
    [700,950,1200,1450].forEach((delay,index)=>combatClock.current.schedule(()=>{
      const game=gameRef.current,target=side==="player"?"enemy":"player";
      if(game.phase!=="playing" || roundResolved.current || attackSequence.current[side]!==token)return;
      if(combatClock.current.time<confuciusInvulnerableUntil.current[target])return;
      const origin=side==="player"?game.playerPosition:game.enemyPosition;
      const position=side==="player"?game.enemyPosition:game.playerPosition;
      const final=index===3;
      if(side==="player"){game.enemyCoherence=Math.max(0,game.enemyCoherence-10);setEnemyCoherence(game.enemyCoherence);}
      else{game.playerCoherence=Math.max(0,game.playerCoherence-10);setPlayerCoherence(game.playerCoherence);}
      freireContact(side,"transcender",origin,position,final);
      addMessage(target,"−10 COERÊNCIA","damage");
      if(final){addMessage("center","EDUCAÇÃO LIBERTADORA!","special");marcusContact();}
      effectsAudio.current?.play(MOVE_SOUNDS.transcender,{gain:final?.8:.4});
      impactFeedback(target,false,true,{stun:final?300:230,freezeMs:final?50:35});
      const next=side==="player"?Math.min(80,position+(final?6:1)):Math.max(13,position-(final?6:1));
      if(side==="player"){game.enemyPosition=next;setEnemyPosition(next);}else{game.playerPosition=next;setPlayerPosition(next);}
      finishByCoherence(game.playerCoherence,game.enemyCoherence);
    },delay));
  },[addMessage,freireContact,finishByCoherence,impactFeedback,marcusContact]);

  const scheduleFanonEarth=useCallback((side:"player"|"enemy",token:number)=>{
    [700,950,1200,1450].forEach((delay,index)=>combatClock.current.schedule(()=>{
      const game=gameRef.current,target=side==="player"?"enemy":"player";
      if(game.phase!=="playing" || roundResolved.current || attackSequence.current[side]!==token)return;
      if(combatClock.current.time<confuciusInvulnerableUntil.current[target])return;
      const origin=side==="player"?game.playerPosition:game.enemyPosition;
      const position=side==="player"?game.enemyPosition:game.playerPosition;
      const final=index===3;
      if(side==="player"){game.enemyCoherence=Math.max(0,game.enemyCoherence-10);setEnemyCoherence(game.enemyCoherence);}
      else{game.playerCoherence=Math.max(0,game.playerCoherence-10);setPlayerCoherence(game.playerCoherence);}
      fanonContact(side,"transcender",origin,position,final);
      addMessage(target,"−10 COERÊNCIA","damage");
      if(final){addMessage("center","OS CONDENADOS DA TERRA!","special");fanonEarthquake();}
      effectsAudio.current?.play(MOVE_SOUNDS.transcender,{gain:final?.8:.4});
      impactFeedback(target,false,true,{stun:final?300:230,freezeMs:final?50:35});
      const next=side==="player"?Math.min(80,position+(final?6:1)):Math.max(13,position-(final?6:1));
      if(side==="player"){game.enemyPosition=next;setEnemyPosition(next);}else{game.playerPosition=next;setPlayerPosition(next);}
      finishByCoherence(game.playerCoherence,game.enemyCoherence);
    },delay));
  },[addMessage,fanonContact,finishByCoherence,impactFeedback,fanonEarthquake]);

  const applySurveillance=useCallback((side:"player"|"enemy")=>{
    const until=combatClock.current.time+1500;watchedUntil.current[side]=until;
    setWatched(current=>({...current,[side]:true}));addMessage(side,"VIGIADO!","concept");
    combatClock.current.schedule(()=>{if(watchedUntil.current[side]===until){watchedUntil.current[side]=0;setWatched(current=>({...current,[side]:false}));}},1500);
  },[addMessage]);
  const beginBiopower=useCallback((source:"player"|"enemy",token:number)=>{
    combatClock.current.schedule(()=>{
      if(gameRef.current.phase!=="playing"||roundResolved.current||attackSequence.current[source]!==token)return;
      const target=source==="player"?"enemy":"player",now=combatClock.current.time;
      if(now<confuciusInvulnerableUntil.current[target])return;
      const until=now+800;docileUntil.current[target]=until;
      setDocile(current=>({...current,[target]:true}));addMessage(target,"CORPO DÓCIL!","concept");
      attackSequence.current[target]++;
      const lock=target==="player"?playerActionLock:enemyActionLock;
      lock.current=Math.max(lock.current,until);
      if(target==="player"){guardRef.current=false;setPlayerGuarding(false);}else{enemyGuardRef.current=false;setEnemyGuarding(false);continuousCpuWalk.current=null;}
      // Freeze the current airborne pose; grounded actors settle into their valid base art.
      if(!(target==="player"?playerAirborne.current:enemyAirborne.current))animate(target,"idle",800);
      combatClock.current.schedule(()=>{if(docileUntil.current[target]===until){docileUntil.current[target]=0;setDocile(current=>({...current,[target]:false}));}},800);
    },260);
  },[addMessage,animate]);

  const performMove = useCallback(
    (moveName: MoveName) => {
      const game = gameRef.current;
      if (game.phase !== "playing" || roundResolved.current) return false;
      const move = FIGHTER_MOVES[selectedFighter][moveName];
      const isSpecial = moveName === "especial" || moveName === "transcender";
      const now = combatClock.current.time;
      if (combatClock.current.stopped > 0 || playerActionLock.current > now || playerAirborne.current) return false;
      if ((cooldowns.current[moveName] ?? 0) > now) return false;
      if(isSpecial && now < silenceUntil.current.player){addMessage("player","SILENCIADO!","miss");return true;}
      if (isSpecial && game.logos < 100) {
        addMessage("player", `${FIGHTERS[selectedFighter].meter} INCOMPLETO`, "miss");
        playTone(120, 0.08, "square");
        return true;
      }

      cooldowns.current[moveName] = now + (isSpecial ? move.cooldown : Math.round(move.cooldown * .85));
      const attackToken = ++attackSequence.current.player;
      guardRef.current = false;
      setPlayerGuarding(false);
      if (isSpecial) { game.logos = 0; setLogos(0); }
      lastPlayerAttack.current = now;
      const actionDuration = selectedFighter === "amenemope" ? AMENEMOPE_TIMING[moveName].duration : (selectedFighter === "felipe" || selectedFighter === "felipe-cyborg" || selectedFighter === "sidarta") ? FELIPE_TIMING[moveName].duration : isSpecial
        ? usesExtendedSpecialTiming(selectedFighter)
          ? moveName === "transcender"
            ? 1850
            : 1450
          : moveName === "transcender"
            ? 1450
            : 1100
        : moveName === "ideias"
          ? selectedFighter === "agostinho"
            ? 900
            : selectedFighter === "marx" ||
                selectedFighter === "freud" ||
                selectedFighter === "darwin" ||
                selectedFighter === "olympe" ||
                selectedFighter === "kierkegaard" ||
                selectedFighter === "beauvoir" ||
                selectedFighter === "foucault" ||
                selectedFighter === "arendt" ||
                selectedFighter === "wittgenstein" ||
                selectedFighter === "angela-davis" ||
                selectedFighter === "paulo-freire" ||
                selectedFighter === "fanon" ||
                selectedFighter === "krenak" ||
                selectedFighter === "turing" ||
                selectedFighter === "superintelligence"
              ? 940
              : 780
          : moveName === "caverna"
            ? 620
            : selectedFighter === "superintelligence"
              ? 640
              : 520;
      playerActionLock.current = now + actionDuration;
      setMoveTitle(move.label);
      setConcept(move.concept);
      animate(
        "player",
        move.action,
        actionDuration,
      );

      if(selectedFighter==="foucault"&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("player");
      if(selectedFighter==="deleuze"&&moveName==="ideias")confuciusAdvance("player");
      if(selectedFighter==="fanon"&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("player");
      if(selectedFighter==="paulo-freire"&&(moveName==="dialetica"||moveName==="especial"))confuciusAdvance("player");
      if(selectedFighter==="amenemope"&&moveName==="dialetica")amenemopeAdvance("player");
      if((selectedFighter==="confucius"||selectedFighter==="olympe"||selectedFighter==="beauvoir")&&moveName==="dialetica")confuciusAdvance("player");
      if((selectedFighter==="darwin"||selectedFighter==="arendt")&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("player");
      if((selectedFighter==="marcus"&&(moveName==="dialetica"||moveName==="ideias"))||(selectedFighter==="smith"&&(moveName==="dialetica"||moveName==="caverna")))marcusAdvance("player");
      if(selectedFighter==="kierkegaard"&&moveName==="transcender")beginFaithLeap("player",attackToken);

      if (selectedFighter === "agostinho" && moveName === "ideias") {
        setPlayerPosition((position) =>
          Math.min(game.enemyPosition - (selectedOpponent === "schopenhauer" ? 22 : 16), position + 8),
        );
      }

      if (isSpecial) {
        if (selectedFighter === "marcus" || selectedFighter === "smith" || selectedFighter === "darwin" || selectedFighter === "wittgenstein" || selectedFighter === "arendt" || selectedFighter === "beauvoir" || selectedFighter === "paulo-freire" || selectedFighter === "fanon" || selectedFighter === "foucault" || selectedFighter === "deleuze") confuciusInvulnerableUntil.current.player = now + 260;
        if (selectedFighter === "arendt" || selectedFighter === "beauvoir" || selectedFighter === "paulo-freire" || selectedFighter === "fanon" || selectedFighter === "foucault" || selectedFighter === "deleuze") { combatClock.current.freeze(200); setHitstop(true); }
        if (selectedFighter === "wittgenstein") { combatClock.current.freeze(250); setHitstop(true); }
        if (selectedFighter === "smith" && moveName === "especial") { combatClock.current.freeze(250); setHitstop(true); }
        if (selectedFighter === "confucius") { confuciusInvulnerableUntil.current.player = now + 260; if (moveName === "especial") { combatClock.current.freeze(300); setHitstop(true); } }
        setArenaEffect(specialEffect(selectedFighter, moveName));
        combatClock.current.schedule(
          () => setArenaEffect(null),
          usesExtendedSpecialTiming(selectedFighter)
            ? moveName === "transcender"
              ? 1900
              : 1500
            : 1500,
        );
      }

      const impactDelay = selectedFighter === "deleuze" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1250 : moveName === "ideias" ? 320 : moveName === "caverna" ? 310 : 220 : selectedFighter === "foucault" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1060 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : selectedFighter === "fanon" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : selectedFighter === "paulo-freire" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : selectedFighter === "beauvoir" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : selectedFighter === "arendt" && isSpecial ? moveName === "especial" ? 900 : 760 : selectedFighter === "amenemope" ? AMENEMOPE_TIMING[moveName].impact : (selectedFighter === "felipe" || selectedFighter === "felipe-cyborg" || selectedFighter === "sidarta") ? FELIPE_TIMING[moveName].impact :
        usesExtendedSpecialTiming(selectedFighter) &&
        moveName === "transcender"
          ? 1480
          : usesExtendedSpecialTiming(selectedFighter) &&
              moveName === "especial"
            ? 1180
        : moveName === "transcender"
          ? 760
          : moveName === "especial"
            ? 610
            : moveName === "ideias"
              ? selectedFighter === "confucius" ? 620 : selectedFighter === "agostinho"
                ? 560
                : selectedFighter === "marx" ||
                    selectedFighter === "freud" ||
                    selectedFighter === "darwin" ||
                    selectedFighter === "olympe" ||
                    selectedFighter === "kierkegaard" ||
                    selectedFighter === "arendt" ||
                    selectedFighter === "wittgenstein" ||
                    selectedFighter === "angela-davis" ||
                    selectedFighter === "krenak" ||
                    selectedFighter === "turing" ||
                    selectedFighter === "superintelligence"
                  ? 620
                : 410
              : moveName === "caverna"
                ? 310
                : selectedFighter === "superintelligence"
                  ? 350
                  : 220;

      // Three coin impacts precede the final 12-point hit (45 total).
      if (selectedFighter === "smith" && moveName === "transcender") {
        [900, 1080, 1260].forEach(delay => combatClock.current.schedule(() => {
          const current = gameRef.current;
          if (current.phase !== "playing" || roundResolved.current || attackSequence.current.player !== attackToken) return;
          if ((selectedOpponent === "confucius" || selectedOpponent === "marcus" || selectedOpponent === "smith" || selectedOpponent === "darwin" || selectedOpponent === "wittgenstein" || selectedOpponent === "arendt" || selectedOpponent === "beauvoir" || selectedOpponent === "paulo-freire" || selectedOpponent === "fanon" || selectedOpponent === "foucault" || selectedOpponent === "deleuze") && combatClock.current.time < confuciusInvulnerableUntil.current.enemy) return;
          if (!attackConnects(current.playerPosition, current.enemyPosition, 1, move.range, moveName, enemyAirborne.current, {attacker:selectedFighter,target:selectedOpponent,defenderCrouching:enemyGuardRef.current})) return;
          current.enemyCoherence = Math.max(0, current.enemyCoherence - 11);
          setEnemyCoherence(current.enemyCoherence);
          addMessage("enemy", "−11 COERÊNCIA", "damage");
          impactFeedback("enemy", false, true, {freezeMs:35});
          finishByCoherence(current.playerCoherence,current.enemyCoherence);
        },delay));
      }
      if(selectedFighter === "deleuze" && moveName === "transcender"){scheduleDeleuzePlateaux("player",attackToken);return true;}
      if(selectedFighter === "foucault" && moveName === "transcender")beginBiopower("player",attackToken);
      if(selectedFighter === "fanon" && moveName === "transcender"){scheduleFanonEarth("player",attackToken);return true;}
      if(selectedFighter === "paulo-freire" && moveName === "transcender"){scheduleFreireLiberation("player",attackToken);return true;}
      if(selectedFighter === "beauvoir" && moveName === "transcender"){
        scheduleBeauvoirBecoming("player",attackToken);return true;
      }
      if (!isSpecial) playerActionLock.current = now + recoveryDuration(actionDuration, impactDelay);
      combatClock.current.schedule(() => {
        const current = gameRef.current;
        if (current.phase !== "playing" || roundResolved.current || attackSequence.current.player !== attackToken) return;
        if ((selectedOpponent === "confucius" || selectedOpponent === "marcus" || selectedOpponent === "smith" || selectedOpponent === "darwin" || selectedOpponent === "wittgenstein" || selectedOpponent === "arendt" || selectedOpponent === "beauvoir" || selectedOpponent === "paulo-freire" || selectedOpponent === "fanon" || selectedOpponent === "foucault" || selectedOpponent === "deleuze") && combatClock.current.time < confuciusInvulnerableUntil.current.enemy) { addMessage("enemy", "PRIORIDADE", "miss"); return; }
        const landed = attackConnects(current.playerPosition, current.enemyPosition, 1, move.range, moveName, enemyAirborne.current, { attacker: selectedFighter, target: selectedOpponent, defenderCrouching: enemyGuardRef.current });
        if (!landed) {
          addMessage("enemy", "SEM CONTATO", "miss");
          comboRef.current = { count: 0, lastHit: 0 };
          setCombo(0);
          playTone(180, 0.08, "sine");
          return;
        }

        effectsAudio.current?.play(MOVE_SOUNDS[moveName], { gain: enemyGuardRef.current && !isSpecial ? .45 : .8 });
        const impactTime = combatClock.current.time;
        const continuedCombo =
          !isSpecial && impactTime - comboRef.current.lastHit <= 1350;
        const nextCombo = isSpecial
          ? 0
          : Math.min(5, continuedCombo ? comboRef.current.count + 1 : 1);
        const comboMultiplier = 1 + Math.max(0, nextCombo - 1) * 0.08;
        const enemyDefended = enemyGuardRef.current && (!isSpecial || (selectedFighter === "deleuze" && moveName === "especial"));
        const maatJudgment =
          selectedFighter === "amenemope" && moveName === "transcender"
            ? Math.min(18, enemyAggression.current * 2)
            : 0;
        const rawDamage = Math.round(
          ((selectedFighter === "smith" && moveName === "transcender" ? 12 : move.damage) + maatJudgment + (isSpecial ? 0 : Math.floor(Math.random() * 3))) *
            comboMultiplier,
        );
        const damage = selectedFighter === "deleuze" && moveName === "especial" ? enemyDefended ? 17 : 32 : enemyDefended ? Math.min(rawDamage,Math.max(1,Math.ceil(rawDamage*.3))+(combatClock.current.time<watchedUntil.current.enemy?3:0)) : rawDamage;
        const nextEnemy = Math.max(0, current.enemyCoherence - damage);
        current.enemyCoherence = nextEnemy;
        setEnemyCoherence(nextEnemy);
        if (isSpecial) {
          if(selectedFighter === "arendt" && moveName === "transcender"){
            current.playerCoherence=Math.min(100,current.playerCoherence+15);
            setPlayerCoherence(current.playerCoherence);addMessage("player","+15 COERÊNCIA","concept");
          }
          if (selectedFighter === "confucius" && moveName === "especial") {
            setPlayerCoherence(Math.min(100, current.playerCoherence + 8));
            addMessage("player", "+8 COERÊNCIA", "concept");
          }
          if (selectedFighter === "marcus" && moveName === "especial") {
            current.playerCoherence = Math.min(100, current.playerCoherence + 15);
            setPlayerCoherence(current.playerCoherence);
            addMessage("player", "+15 COERÊNCIA", "concept");
          }
          comboRef.current = { count: 0, lastHit: 0 };
          setCombo(0);
          addMessage(
            "center",
            move.shout,
            "special",
          );
        } else {
          current.logos = Math.min(100, current.logos + move.logos);
          setLogos(current.logos);
          comboRef.current = { count: nextCombo, lastHit: impactTime };
          setCombo(nextCombo);
          if (comboTimer.current) window.clearTimeout(comboTimer.current);
          comboTimer.current = window.setTimeout(() => {
            comboRef.current = { count: 0, lastHit: 0 };
            setCombo(0);
          }, 1350);
          addMessage(
            "enemy",
            nextCombo > 1
              ? `${nextCombo} GOLPES · −${damage}`
              : `−${damage} COERÊNCIA`,
            "damage",
          );
        }
        if (enemyDefended) {
          addMessage("enemy", `BLOQUEIO · −${damage}`, "damage");

          enemyGuardRef.current = false;
          setEnemyGuarding(false);
        }
        if(selectedFighter === "deleuze"){deleuzeContact("player",moveName,current.playerPosition,current.enemyPosition);if(isSpecial)deleuzeCamera(5);}
        if(selectedFighter === "foucault"){foucaultContact("player",moveName,current.playerPosition,current.enemyPosition);if(isSpecial){foucaultCamera(moveName==="especial"?5:7);if(moveName==="especial")applySurveillance("enemy");else{docileUntil.current.enemy=0;setDocile(current=>({...current,enemy:false}));}}}
        if(selectedFighter === "fanon"){fanonContact("player",moveName,current.playerPosition,current.enemyPosition);if(isSpecial)marcusContact();}
        if(selectedFighter === "paulo-freire"){freireContact("player",moveName,current.playerPosition,current.enemyPosition);if(isSpecial)marcusContact();}
        if(selectedFighter === "beauvoir"){beauvoirContact("player",moveName,current.playerPosition,current.enemyPosition);if(isSpecial)marcusContact();}
        if(selectedFighter === "arendt")arendtContact("player",moveName,current.playerPosition,current.enemyPosition);
        if(selectedFighter === "wittgenstein")wittgensteinContact("player",moveName,current.enemyPosition);
        if (selectedFighter === "rousseau" && moveName === "caverna" && !enemyDefended) breakRousseauChains("enemy", current.enemyPosition);
        if (selectedFighter === "hobbes" && moveName === "ideias" && !enemyDefended) bindSovereignPact("enemy");
        if (selectedFighter === "sidarta" && moveName === "transcender") sidartaContact();
        if (selectedFighter === "amenemope" && moveName === "transcender") maatContact();
        if (selectedFighter === "hobbes" && moveName === "transcender") sovereignImpact();
        if(selectedFighter==="freud"&&moveName==="especial"&&!enemyDefended)applyDreamTorpor("enemy");
        if(selectedFighter==="freud"&&moveName==="transcender")freudDeathContact(current.enemyPosition);
        if(selectedFighter==="felipe-cyborg"&&isSpecial)cyborgContact(current.enemyPosition,moveName==="transcender"?"swarm":"certainty");
        if (selectedFighter === "hegel" && moveName === "transcender") worldSpiritImpact(current.enemyPosition);
        if (selectedFighter === "schopenhauer" && moveName === "transcender") pendulumImpact(current.enemyPosition);
        if (selectedFighter === "confucius" && moveName === "ideias" && !enemyDefended) playerActionLock.current = Math.min(playerActionLock.current, impactTime + 80);
        if (selectedFighter === "confucius" && moveName === "transcender") confuciusContact();
        if ((selectedFighter === "marcus" || selectedFighter === "smith") && moveName === "transcender") marcusContact();
        if (isGrandFinal && isSpecial && grandWindup.current) {
          grandWindup.current = false;
          setGrandStrike(null);
          addMessage("enemy", "CARGA INTERROMPIDA", "concept");
        }
        if (!isGrandFinal || !grandWindup.current) {
          impactFeedback("enemy", enemyDefended, isSpecial || moveName === "ideias", selectedFighter === "confucius" && moveName === "ideias" && !enemyDefended ? {stun:850,freezeMs:65} : undefined);
        }
        if(selectedFighter==="kierkegaard"&&isSpecial)kierkegaardContact("enemy",moveName==="transcender"?"faith":"anxiety",current.enemyPosition,enemyDefended);
        const nextPosition = isGrandFinal ? current.enemyPosition : Math.min(80, current.enemyPosition + (enemyDefended ? .7 : selectedFighter === "foucault" && isSpecial ? 7 : selectedFighter === "fanon" && isSpecial ? 7 : selectedFighter === "paulo-freire" && isSpecial ? 7 : selectedFighter === "beauvoir" && isSpecial ? 7 : selectedFighter === "arendt" && moveName === "transcender" ? 7 : selectedFighter === "wittgenstein" && moveName === "transcender" ? 7 : isSpecial ? 5 : selectedFighter === "confucius" && moveName === "caverna" ? 3.5 : 2.4));
        current.enemyPosition = nextPosition;
        setEnemyPosition(nextPosition);
        finishByCoherence(current.playerCoherence, current.enemyCoherence);
      }, impactDelay);
      return true;
    },
    [
      addMessage,
      animate,
      finishByCoherence,
      bindSovereignPact,
      breakRousseauChains,
      sovereignImpact,
      maatContact,
      sidartaContact,
      amenemopeAdvance,
      confuciusAdvance,
      wittgensteinContact,
      arendtContact,
      beauvoirContact,
      scheduleBeauvoirBecoming,
      freireContact,
      scheduleFreireLiberation,
      fanonContact,
      scheduleFanonEarth,
      foucaultContact,
      deleuzeContact,deleuzeCamera,scheduleDeleuzePlateaux,
      foucaultCamera,
      applySurveillance,
      beginBiopower,
      confuciusContact,
      marcusAdvance,
      marcusContact,
      worldSpiritImpact,
      pendulumImpact,
      applyDreamTorpor,
      freudDeathContact,
      cyborgContact,
      beginFaithLeap,
      kierkegaardContact,
      impactFeedback,
      isGrandFinal,
      playTone,
      selectedFighter,
      selectedOpponent,
    ],
  );

  const movePlayer = useCallback((direction: -1 | 1, step = 4) => {
    const game = gameRef.current;
    if (
      game.phase !== "playing" ||
      playerActionLock.current > combatClock.current.time ||
      playerAirborne.current || combatClock.current.stopped > 0 || guardRef.current
    ) return;
    const constrainedStep = step * combatMovementRate(combatClock.current.time,pactUntil.current.player,torporUntil.current.player);
    const nextPosition = direction > 0
      ? Math.min(57, game.enemyPosition - minimumFighterGap(selectedFighter,selectedOpponent), game.playerPosition + constrainedStep)
      : Math.max(13, game.playerPosition - constrainedStep);
    if((selectedFighter==="kierkegaard"||selectedFighter==="felipe-cyborg"||selectedFighter==="sidarta"||selectedFighter==="confucius")&&Math.abs(nextPosition-game.playerPosition)<.0001){
      setPlayerAction(action=>action==="advance"||action==="retreat"?"idle":action);
      return;
    }
    game.playerPosition = nextPosition;
    setPlayerPosition(nextPosition);
    // A complete walk cycle keeps the animation from snapping back
    // to idle halfway through a step after a single keyboard/touch input.
    const walkDuration = articulatedWalkDuration(selectedFighter);
    animate(
      "player",
      direction > 0 ? "advance" : "retreat",
      selectedFighter==="kierkegaard"&&step>=1?180:walkDuration ?? 330,
      walkDuration !== null,
    );
  }, [animate, selectedFighter, selectedOpponent]);

  const jump = useCallback(() => {
    const now = combatClock.current.time;
    if (
      gameRef.current.phase !== "playing" ||
      playerActionLock.current > now ||
      playerAirborne.current || combatClock.current.stopped > 0
    ) return;
    guardRef.current = false;
    setPlayerGuarding(false);
    playerAirborne.current = true;
    const duration = 650 + Math.max(0, Math.max(pactUntil.current.player,torporUntil.current.player) - now) / 2;
    setJumpDuration(current => ({ ...current, player: duration }));
    playerActionLock.current = now + duration;
    animate("player", "jump", duration);
    playTone(330, 0.05, "triangle");
    combatClock.current.schedule(() => {
      playerAirborne.current = false;
    }, duration);
  }, [animate, playTone]);

  const guard = useCallback(() => {
    const game = gameRef.current;
    const now = combatClock.current.time;
    if (
      game.phase !== "playing" ||
      guardRef.current ||
      playerActionLock.current > now ||
      playerAirborne.current ||
      combatClock.current.stopped > 0
    ) {
      return;
    }
    const guardToken = ++actionSequence.current.player;
    playerActionLock.current = now;
    guardRef.current = true;
    guardStartedAt.current = now;
    setPlayerGuarding(true);
    setPlayerAction("guard");
    playTone(246.9, 0.06, "triangle");
    combatClock.current.schedule(() => {
      if (actionSequence.current.player !== guardToken || isCombatKeyHeld("s")) return;
      guardRef.current = false;
      setPlayerGuarding(false);
      setPlayerAction((current) => (current === "guard" ? "idle" : current));
    }, 680);
  }, [isCombatKeyHeld, playTone]);

  const releaseCombatKey = useCallback((key: string) => {
    if ((key === "a" || key === "d") &&
      (selectedFighter === "kierkegaard" || selectedFighter === "felipe-cyborg" || selectedFighter === "sidarta" || selectedFighter === "confucius") &&
      !isCombatKeyHeld("a") && !isCombatKeyHeld("d")) {
      setPlayerAction(action => action === "advance" || action === "retreat" ? "idle" : action);
    }
    if (key === "s" && !isCombatKeyHeld("s")) {
      guardRef.current = false;
      setPlayerGuarding(false);
      setPlayerAction(action => action === "guard" ? "idle" : action);
    }
  }, [isCombatKeyHeld, selectedFighter]);

  const pressTouchKey = (key: "a" | "d" | "s", event: ReactPointerEvent<HTMLButtonElement>) => {
    if (gameRef.current.phase !== "playing") return;
    heldTouchKeys.current.set(event.pointerId, key);
    if (key === "s") guard();
    else if (!isCombatKeyHeld(key === "a" ? "d" : "a")) movePlayer(key === "a" ? -1 : 1, 0.6);
  };

  const releaseTouchKey = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const key = heldTouchKeys.current.get(event.pointerId);
    if (!key) return;
    heldTouchKeys.current.delete(event.pointerId);
    releaseCombatKey(key);
  };

  useEffect(() => {
    const urls = storyImagePreloadUrls({
      mode: gameMode,
      phase,
      campaign: storyCampaign,
      introIndex: storyIntroIndex,
      encounterIndex: storyIndex,
      sceneStep: storySceneStep,
    });
    urls.forEach((image) => {
      const preload = new Image();
      preload.decoding = "async";
      preload.src = image;
    });
  }, [gameMode, phase, storyCampaign, storyIntroIndex, storyIndex, storySceneStep]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (phase === "story-quiz") return;
      if (phase === "story-intro" || phase === "story-recap") {
        // Native button activation must reach Voltar/Avançar, not also skip a scene.
        if (event.target instanceof HTMLElement && event.target.closest(".story-art-navigation, .audio-controls")) {
          if (key === "enter" || key === " ") return;
        }
        if (key === "arrowleft") {
          event.preventDefault();
          previousStoryArt();
          return;
        }
      }
      if (phase === "intro" && (key === " " || key === "enter")) {
        event.preventDefault();
        openModeMenu();
        return;
      }
      if (
        phase === "story-intro" &&
        (key === "a" || key === " " || key === "enter" || key === "arrowright")
      ) {
        event.preventDefault();
        nextStoryIntroScene();
        return;
      }
      if (phase === "story-recap" && (key === "a" || key === " " || key === "enter" || key === "arrowright")) {
        event.preventDefault();
        nextStoryRecapScene();
        return;
      }
      if (phase === "select") {
        if (event.target instanceof HTMLElement && event.target.closest(".audio-controls")) return;
        // Focused biographies scroll locally; roster navigation keeps its own keys.
        if (event.target instanceof HTMLElement && event.target.closest(".versus-panel-biography") &&
          ["arrowup", "arrowdown", "pageup", "pagedown", "home", "end"].includes(key)) return;
        if (
          (key === "escape" || key === "backspace") &&
          selectionStep === "opponent"
        ) {
          event.preventDefault();
          undoPlayerSelection();
          return;
        }
        if (
          key === "arrowleft" ||
          key === "arrowright" ||
          key === "arrowup" ||
          key === "arrowdown"
        ) {
          event.preventDefault();
          rosterInput.current = "keyboard";
          setPreviewFighter((current) =>
            nextFighterInGrid(
              current,
              key,
              selectionStep === "opponent" ? selectedFighter : undefined,
            ),
          );
          return;
        }
        if (key === "enter" || key === " ") {
          // Let Back and audio buttons use their own click action.
          if (event.target instanceof HTMLElement && event.target.closest("button:not(.fighter-portrait)")) return;
          event.preventDefault();
          confirmSelection(previewFighter);
          return;
        }
      }
      if (phase !== "playing" || !(key in ATTACK_KEYS || ["a", "d", "w", "s"].includes(key))) return;
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true], .audio-controls")) return;
      event.preventDefault();
      if (keysPressed.current[key]) return;
      keysPressed.current[key] = true;
      if (key === "w") jumpRequested.current = true;
      if (key in ATTACK_KEYS) inputBuffer.current.push(ATTACK_KEYS[key], performance.now());
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      delete keysPressed.current[key];
      releaseCombatKey(key);
    };
    const clearInput = () => {
      keysPressed.current = {};
      heldTouchKeys.current.clear();
      jumpRequested.current = false;
      inputBuffer.current.clear();
      guardRef.current = false;
      setPlayerGuarding(false);
      setPlayerAction(action => action === "guard" || ((selectedFighter==="kierkegaard"||selectedFighter==="felipe-cyborg"||selectedFighter==="sidarta"||selectedFighter==="confucius")&&(action==="advance"||action==="retreat")) ? "idle" : action);
    };
    const onVisibility = () => { if (document.hidden) clearInput(); };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", clearInput);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", clearInput);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    confirmSelection,
    guard,
    jump,
    movePlayer,
    nextStoryIntroScene,
    nextStoryRecapScene,
    previousStoryArt,
    openModeMenu,
    performMove,
    phase,
    previewFighter,
    releaseCombatKey,
    selectedFighter,
    selectionStep,
    undoPlayerSelection,
  ]);

  const queueMove = useCallback((move: MoveName) => {
    if (gameRef.current.phase === "playing") inputBuffer.current.push(move, performance.now());
  }, []);

  useEffect(() => {
    if (phase !== "playing") {
      watchedUntil.current={player:0,enemy:0};docileUntil.current={player:0,enemy:0};setWatched({player:false,enemy:false});setDocile({player:false,enemy:false});
      keysPressed.current = {};
      heldTouchKeys.current.clear();
      inputBuffer.current.clear();
      jumpRequested.current = false;
      combatClock.current.jobs = [];
      combatClock.current.stopped = 0;
      grandWindup.current = false;
      setGrandStrike(null);
      setHitstop(false);
      continuousCpuWalk.current=null;
      faithLeaps.current={player:null,enemy:null};
      playerAirborne.current=false;enemyAirborne.current=false;
      setDisoriented({player:false,enemy:false});
      pactUntil.current = { player: 0, enemy: 0 };
      setPactBound({ player: false, enemy: false });
      torporUntil.current={player:0,enemy:0};
      setTorporBound({player:false,enemy:false});
      silenceUntil.current={player:0,enemy:0};setSilenced({player:false,enemy:false});if(phase!=="finishing"){setWittContact(null);setArendtImpact(null);}
      if(phase!=="finishing"){setFreudImpact(null);setCyborgImpact(null);}
      if (phase !== "finishing") setChainBursts([]);
      return;
    }
    let frame = 0;
    let previous = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, Math.max(0, now - previous));
      previous = now;
      if (!document.hidden && !roundResolved.current) {
        const game=gameRef.current;
        const nextTime=combatClock.current.time+dt-Math.min(dt,combatClock.current.stopped);
        const walking=continuousCpuWalk.current;
        if(walking){
          if(walking.sequence!==actionSequence.current.enemy)continuousCpuWalk.current=null;
          else{
            const progress=Math.min(1,Math.max(0,(nextTime-walking.started)/400));
            game.enemyPosition=Math.min(80,Math.max(game.playerPosition+minimumFighterGap(selectedFighter,selectedOpponent),walking.from+(walking.to-walking.from)*progress));
            setEnemyPosition(game.enemyPosition);
            if(progress===1)continuousCpuWalk.current=null;
          }
        }
        for(const side of ["player","enemy"] as const){
          const flight=faithLeaps.current[side];if(!flight)continue;
          if(attackSequence.current[side]!==flight.token){faithLeaps.current[side]=null;(side==="player"?playerAirborne:enemyAirborne).current=false;continue;}
          const elapsed=nextTime-flight.started;if(elapsed>FAITH_TIMING.impact)continue;
          const pose=faithLeapPose(elapsed,flight.origin,flight.landing),gap=minimumFighterGap(selectedFighter,selectedOpponent);
          if(side==="player"){game.playerPosition=Math.max(13,Math.min(57,game.enemyPosition-gap,pose.position));setPlayerPosition(game.playerPosition);}
          else{game.enemyPosition=Math.min(80,Math.max(game.playerPosition+gap,pose.position));setEnemyPosition(game.enemyPosition);}
        }
        const bodies=resolveFighterPushboxes(game.playerPosition,game.enemyPosition,selectedFighter,selectedOpponent);
        if(bodies.player!==game.playerPosition){game.playerPosition=bodies.player;setPlayerPosition(bodies.player);}
        if(bodies.enemy!==game.enemyPosition){game.enemyPosition=bodies.enemy;setEnemyPosition(bodies.enemy);}
        combatClock.current.tick(dt);
        const frozen = combatClock.current.stopped > 0;
        setHitstop(current => current === frozen ? current : frozen);
        if (!frozen) {
          inputBuffer.current.consume(now, performMove);
          if (jumpRequested.current) { jumpRequested.current = false; jump(); }
          if (isCombatKeyHeld("s")) guard();
          const direction = Number(isCombatKeyHeld("d")) - Number(isCombatKeyHeld("a"));
          if (direction) movePlayer(direction as -1 | 1, dt * .022);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, performMove, jump, guard, movePlayer, isCombatKeyHeld, selectedFighter, selectedOpponent]);

  useEffect(() => {
    if (phase !== "mode-select" && phase !== "select") return;
    for (const src of ["/game/guattari-assist-hq.webp?v=4.12", "/game/deleuze-fullbody-hq.webp?v=4.12", "/game/thumb-deleuze.webp", "/game/deleuze-walk-a-v2.webp", "/game/deleuze-walk-b-v2.webp", "/game/deleuze-guard-v2.webp", "/game/foucault-fullbody-clean-v2.webp", "/game/foucault-idle-clean-v2.webp", "/game/foucault-kick-book-v2.webp", "/game/foucault-guard-v2.webp", "/game/foucault-walk-a-v2.webp", "/game/foucault-walk-b-v2.webp", "/game/thumb-foucault.webp", "/game/fanon-fullbody-hq.webp?v=4.7", "/game/fanon-kick-hq.webp?v=4.7", "/game/fanon-victory-hq.webp?v=4.7", "/game/fanon-combo-hq.webp?v=4.7", "/game/thumb-fanon.webp", "/game/fanon-guard-v2.webp", "/game/fanon-release-v2.webp", "/game/paulo-freire-fullbody-hq.webp?v=4.6", "/game/thumb-paulo-freire.webp", "/game/paulo-freire-guard-v2.webp", "/game/paulo-freire-liberating-v2.webp", "/game/beauvoir-fullbody-hq-clean-v2.webp", "/game/beauvoir-guard-frame-clean-v2.webp", "/game/beauvoir-block-v2.webp", "/game/beauvoir-punch-hq-clean-v2.webp", "/game/beauvoir-kick-hq-clean-v2.webp", "/game/beauvoir-combo-hq-clean-v2.webp", "/game/thumb-beauvoir.webp", "/game/marco-aurelio.webp", "/game/marco-aurelio-spritesheet.webp", "/game/thumb-marcus.webp", "/game/adam-smith-fullbody-hq.webp?v=3.1", "/game/thumb-smith.webp", "/game/olympe-fullbody-hq.webp?v=3.9", "/game/thumb-olympe.webp", "/game/darwin-fullbody-clean-hq.webp?v=5.3.1", "/game/thumb-darwin.webp", "/game/felipe-idle.webp", "/game/thumb-felipe.webp", "/game/wittgenstein-fullbody-hq.webp?v=4.4", "/game/thumb-wittgenstein.webp", "/game/wittgenstein-guard-v2.webp", "/game/wittgenstein-silence-v2.webp", "/game/arendt-fullbody-hq.webp?v=4.3", "/game/arendt-guard-frame.webp?v=4.3", "/game/thumb-arendt.webp"]) { const image = new Image(); image.src = src; }
  }, [phase]);

  useEffect(() => {
    if (phase !== "select" || rosterInput.current !== "keyboard") return;
    document
      .getElementById(`fighter-option-${previewFighter}`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [phase, previewFighter]);

  // Cinematic specials pause the round timer on either side.
  const olympesSpecial = (action: string) => action === "special-womens-rights" || action === "special-tribune";
  const darwinsSpecial = (action: string) => action === "special-natural-selection" || action === "special-tree-of-life";
  const wittSpecial = (action:string)=>action === "special-poker" || action === "special-language-limits";
  const arendtsSpecial=(action:string)=>action==="special-banality"||action==="special-natality";
  const beauvoirsSpecial=(action:string)=>action === "special-beauvoir-other" || action === "special-becoming";
  const freiresSpecial=(action:string)=>action === "special-banking-education" || action === "special-liberating-education";
  const fanonsSpecial=(action:string)=>action === "special-black-skin-white-masks" || action === "special-wretched-earth";
  const foucaultsSpecial=(action:string)=>action === "special-panopticon" || action === "special-biopower";
  const pauseCinematicClock = (selectedFighter === "deleuze" && ["special-rhizome","special-mille-plateaux"].includes(playerAction)) || (selectedOpponent === "deleuze" && ["special-rhizome","special-mille-plateaux"].includes(enemyAction)) || (selectedFighter === "foucault" && foucaultsSpecial(playerAction)) || (selectedOpponent === "foucault" && foucaultsSpecial(enemyAction)) || (selectedFighter === "fanon" && fanonsSpecial(playerAction)) || (selectedOpponent === "fanon" && fanonsSpecial(enemyAction)) || (selectedFighter === "paulo-freire" && freiresSpecial(playerAction)) || (selectedOpponent === "paulo-freire" && freiresSpecial(enemyAction)) || (selectedFighter === "beauvoir" && beauvoirsSpecial(playerAction)) || (selectedOpponent === "beauvoir" && beauvoirsSpecial(enemyAction)) || (selectedFighter === "olympe" && olympesSpecial(playerAction)) || (selectedOpponent === "olympe" && olympesSpecial(enemyAction)) || (selectedFighter === "darwin" && darwinsSpecial(playerAction)) || (selectedOpponent === "darwin" && darwinsSpecial(enemyAction)) || (selectedFighter === "wittgenstein" && wittSpecial(playerAction)) || (selectedOpponent === "wittgenstein" && wittSpecial(enemyAction)) || (selectedFighter === "arendt" && arendtsSpecial(playerAction)) || (selectedOpponent === "arendt" && arendtsSpecial(enemyAction));
  useEffect(() => {
    if (phase !== "playing" || pauseCinematicClock) return;
    const timer = window.setInterval(() => {
      setTime((current) => {
        if (current > 1) return current - 1;
        const game = gameRef.current;
        if (game.playerCoherence > game.enemyCoherence) {
          finishByCoherence(game.playerCoherence, 0);
        } else if (game.playerCoherence < game.enemyCoherence) {
          finishByCoherence(0, game.enemyCoherence);
        } else {
          roundResolved.current = true;
          setPhase("draw");
        }
        setMoveTitle("O tempo do argumento terminou");
        setConcept(
          "Em um debate, administrar o tempo é parte da estratégia: uma boa ideia também precisa chegar no momento certo.",
        );
        return 0;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finishByCoherence, phase, pauseCinematicClock]);

  useEffect(() => {
    if (phase !== "playing" || selectedFighter !== "amenemope") return;
    const serenity = window.setInterval(() => {
      if (
        combatClock.current.time - lastPlayerAttack.current >= 2000 &&
        !guardRef.current &&
        playerActionLock.current <= combatClock.current.time
      ) {
        setLogos((current) => Math.min(100, current + 2));
      }
    }, 500);
    return () => window.clearInterval(serenity);
  }, [phase, selectedFighter]);

  useEffect(() => {
    if (phase !== "playing") return;
    const opponentFighter = selectedOpponent;
    const cpuMoves = FIGHTER_MOVES[opponentFighter];
    const cpu = window.setInterval(() => {
      const game = gameRef.current;
      const now = combatClock.current.time;
      if (game.phase !== "playing" || roundResolved.current || combatClock.current.stopped > 0 || document.hidden || enemyActionLock.current > now) return;
      const distance = game.enemyPosition - game.playerPosition;

      if (isGrandFinal) {
        const kind = grandFinalNextStrike(enemyAggression.current, game.enemyLogos);
        const advance = (kind === "jab" || kind === "slam") && distance > 40 && game.enemyPosition > 64;
        const retreat = kind === "debris" && distance < 22 && game.enemyPosition < 76;
        if (advance || retreat) {
          animate("enemy", advance ? "advance" : "retreat", 400);
          enemyActionLock.current = now + 400;
          continuousCpuWalk.current = {
            from: game.enemyPosition,
            to: advance ? 64 : 76,
            started: now,
            sequence: actionSequence.current.enemy,
          };
          return;
        }

        const strike = grandFinalStrike(kind, game.enemyPosition, game.playerPosition, game.enemyCoherence <= 50);
        const token = ++attackSequence.current.enemy;
        if (kind !== "beam") enemyAggression.current++;
        grandWindup.current = true;
        setGrandStrike(strike);
        setMoveTitle(strike.label);
        game.enemyLogos = kind === "beam" ? 0 : Math.min(100, game.enemyLogos + 34);
        setEnemyLogos(game.enemyLogos);
        const duration = strike.windup + strike.recovery;
        enemyActionLock.current = now + duration;
        animate("enemy", "grand-windup", duration);

        combatClock.current.schedule(() => {
          const current = gameRef.current;
          if (roundResolved.current || current.phase !== "playing" || attackSequence.current.enemy !== token) return;
          grandWindup.current = false;
          setGrandStrike({ ...strike, stage: "impact" });
          const landed = grandFinalStrikeHits(strike, current.playerPosition, playerAirborne.current);
          const defended = landed && guardRef.current;
          effectsAudio.current?.play(strike.sound, {
            gain: !landed || defended ? .4 : .85,
          });
          if (!landed) {
            addMessage("player", "ESQUIVOU!", "miss");
            return;
          }
          const damage = defended ? Math.ceil(strike.damage * .35) : strike.damage;
          current.playerCoherence = Math.max(0, current.playerCoherence - damage);
          setPlayerCoherence(current.playerCoherence);
          if (defended) {
            current.logos = Math.min(100, current.logos + 16);
            setLogos(current.logos);
          } else {
            current.playerPosition = Math.max(13, current.playerPosition - 2.8);
            setPlayerPosition(current.playerPosition);
          }
          addMessage("player", `−${damage} COERÊNCIA`, "damage");
          impactFeedback("player", defended, !defended);
          finishByCoherence(current.playerCoherence, current.enemyCoherence);
        }, strike.windup);
        combatClock.current.schedule(() => setGrandStrike(null), duration);
        return;
      }

      if (
        distance < 31 &&
        !enemyGuardRef.current &&
        (playerActionLock.current > now || Math.random() > 0.82)
      ) {
        enemyGuardRef.current = true;
        enemyActionLock.current = now + 560;
        setEnemyGuarding(true);
        setEnemyAction("guard");
        combatClock.current.schedule(() => {
          enemyGuardRef.current = false;
          setEnemyGuarding(false);
          setEnemyAction((action) => (action === "guard" ? "idle" : action));
        }, 560);
        return;
      }

      if (distance > 25 && distance < 36 && Math.random() > 0.84) {
        enemyAirborne.current = true;
        const duration = 650 + Math.max(0, Math.max(pactUntil.current.enemy,torporUntil.current.enemy) - now) / 2;
        setJumpDuration(current => ({ ...current, enemy: duration }));
        enemyActionLock.current = now + duration;
        animate("enemy", "jump", duration);
        combatClock.current.schedule(() => {
          enemyAirborne.current = false;
        }, duration);
        return;
      }

      if (distance > 28 && Math.random() > 0.24) {
        const nextPosition=Math.max(game.playerPosition + minimumFighterGap(selectedFighter,opponentFighter),game.enemyPosition - 3.2 * combatMovementRate(now,pactUntil.current.enemy,torporUntil.current.enemy));
        if(opponentFighter==="kierkegaard"||opponentFighter==="sidarta"||opponentFighter==="confucius"){
          animate("enemy","advance",400);
          continuousCpuWalk.current={from:game.enemyPosition,to:nextPosition,started:now,sequence:actionSequence.current.enemy};
        }else{
          game.enemyPosition=nextPosition;
          setEnemyPosition(nextPosition);
          const walkDuration = articulatedWalkDuration(opponentFighter);
          animate("enemy", "advance", walkDuration ?? 260, walkDuration !== null);
        }
        return;
      }
      if (distance < 22 && Math.random() > 0.72) {
        if(opponentFighter==="kierkegaard"||opponentFighter==="sidarta"||opponentFighter==="confucius"){
          animate("enemy","retreat",400);
          continuousCpuWalk.current={from:game.enemyPosition,to:Math.min(80,game.enemyPosition+4*combatMovementRate(now,pactUntil.current.enemy,torporUntil.current.enemy)),started:now,sequence:actionSequence.current.enemy};
        }else{
          setEnemyPosition((position) => Math.min(80, position + 4 * combatMovementRate(now,pactUntil.current.enemy,torporUntil.current.enemy)));
          const walkDuration = articulatedWalkDuration(opponentFighter);
          animate("enemy", "retreat", walkDuration ?? 260, walkDuration !== null);
        }
        return;
      }

      const special = game.enemyLogos >= 100 && now >= silenceUntil.current.enemy;
      // Observe a newly full meter before committing a special; use combat time,
      // so hitstop cannot consume the player's reaction window.
      if (special && selectedFighter === "darwin") {
        if (!cpuSpecialReadyAt.current) cpuSpecialReadyAt.current = now + 300;
        if (now < cpuSpecialReadyAt.current) return;
      } else cpuSpecialReadyAt.current = 0;
      const moveName: MoveName = special
        ? Math.random() > 0.5
          ? "transcender"
          : "especial"
        : Math.random() > 0.76
          ? "ideias"
          : Math.random() > 0.48
            ? "caverna"
            : "dialetica";
      const move = cpuMoves[moveName];
      enemyAggression.current += 1;
      const damage = opponentFighter === "smith" && moveName === "transcender" ? 12 : move.damage;
      const attackToken = ++attackSequence.current.enemy;
      if (special) { game.enemyLogos = 0; setEnemyLogos(0); cpuSpecialReadyAt.current = 0; }
      const cpuActionDuration = opponentFighter === "amenemope" ? AMENEMOPE_TIMING[moveName].duration : (opponentFighter === "felipe" || opponentFighter === "felipe-cyborg" || opponentFighter === "sidarta") ? FELIPE_TIMING[moveName].duration : special
        ? usesExtendedSpecialTiming(opponentFighter)
          ? moveName === "transcender" ? 1850 : 1450
          : moveName === "transcender" ? 1400 : 1050
        : moveName === "ideias"
          ? opponentFighter === "marx" ||
              opponentFighter === "freud" ||
              opponentFighter === "darwin" ||
              opponentFighter === "olympe" ||
              opponentFighter === "kierkegaard" ||
              opponentFighter === "beauvoir" ||
              opponentFighter === "foucault" ||
              opponentFighter === "arendt" ||
              opponentFighter === "wittgenstein" ||
              opponentFighter === "angela-davis" ||
              opponentFighter === "paulo-freire" ||
              opponentFighter === "fanon" ||
              opponentFighter === "krenak" ||
              opponentFighter === "turing" ||
              opponentFighter === "superintelligence"
            ? 940
            : 780
          : moveName === "caverna"
            ? 650
            : opponentFighter === "superintelligence"
              ? 640
              : 480;
      const cpuImpactDelay = opponentFighter === "deleuze" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1250 : moveName === "ideias" ? 320 : moveName === "caverna" ? 310 : 220 : opponentFighter === "foucault" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1060 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : opponentFighter === "fanon" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : opponentFighter === "paulo-freire" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : opponentFighter === "beauvoir" ? moveName === "especial" ? 900 : moveName === "transcender" ? 1450 : moveName === "caverna" ? 310 : moveName === "ideias" ? 620 : 220 : opponentFighter === "arendt" && special ? moveName === "especial" ? 900 : 760 : opponentFighter === "amenemope" ? AMENEMOPE_TIMING[moveName].impact : (opponentFighter === "felipe" || opponentFighter === "felipe-cyborg" || opponentFighter === "sidarta") ? FELIPE_TIMING[moveName].impact : special
        ? usesExtendedSpecialTiming(opponentFighter) ? moveName === "transcender" ? 1480 : 1180 : moveName === "transcender" ? 780 : 640
        : moveName === "ideias" ? 620 : moveName === "caverna" ? 300 : opponentFighter === "superintelligence" ? 350 : 190;
      enemyActionLock.current = now + cpuAttackRecovery(opponentFighter, cpuActionDuration, cpuImpactDelay, special);
      animate(
        "enemy",
        move.action,
        cpuActionDuration,
      );
      if(opponentFighter==="foucault"&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("enemy");
      if(opponentFighter==="deleuze"&&moveName==="ideias")confuciusAdvance("enemy");
      if(opponentFighter==="fanon"&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("enemy");
      if(opponentFighter==="paulo-freire"&&(moveName==="dialetica"||moveName==="especial"))confuciusAdvance("enemy");
      if(opponentFighter==="amenemope"&&moveName==="dialetica")amenemopeAdvance("enemy");
      if((opponentFighter==="confucius"||opponentFighter==="olympe"||opponentFighter==="beauvoir")&&moveName==="dialetica")confuciusAdvance("enemy");
      if((opponentFighter==="darwin"||opponentFighter==="arendt")&&(moveName==="dialetica"||moveName==="ideias"))confuciusAdvance("enemy");
      if((opponentFighter==="marcus"&&(moveName==="dialetica"||moveName==="ideias"))||(opponentFighter==="smith"&&(moveName==="dialetica"||moveName==="caverna")))marcusAdvance("enemy");
      if(opponentFighter==="kierkegaard"&&moveName==="transcender")beginFaithLeap("enemy",attackToken);
      if (special) {
        if (opponentFighter === "marcus" || opponentFighter === "smith" || opponentFighter === "darwin" || opponentFighter === "wittgenstein" || opponentFighter === "arendt" || opponentFighter === "beauvoir" || opponentFighter === "paulo-freire" || opponentFighter === "fanon" || opponentFighter === "foucault" || opponentFighter === "deleuze") confuciusInvulnerableUntil.current.enemy = now + 260;
        if (opponentFighter === "arendt" || opponentFighter === "beauvoir" || opponentFighter === "paulo-freire" || opponentFighter === "fanon" || opponentFighter === "foucault" || opponentFighter === "deleuze") { combatClock.current.freeze(200); setHitstop(true); }
        if (opponentFighter === "wittgenstein") { combatClock.current.freeze(250); setHitstop(true); }
        if (opponentFighter === "smith" && moveName === "especial") { combatClock.current.freeze(250); setHitstop(true); }
        if (opponentFighter === "confucius") { confuciusInvulnerableUntil.current.enemy = now + 260; if (moveName === "especial") { combatClock.current.freeze(300); setHitstop(true); } }
        setArenaEffect(specialEffect(opponentFighter, moveName));
        combatClock.current.schedule(
          () => setArenaEffect(null),
          usesExtendedSpecialTiming(opponentFighter)
            ? moveName === "transcender"
              ? 1900
              : 1500
            : 1500,
        );
      }
      setMoveTitle(move.label);
      setConcept(move.concept);

      if (opponentFighter === "smith" && moveName === "transcender") {
        [900, 1080, 1260].forEach(delay => combatClock.current.schedule(() => {
          const current=gameRef.current;
          if (current.phase !== "playing" || roundResolved.current || attackSequence.current.enemy !== attackToken) return;
          if ((selectedFighter === "confucius" || selectedFighter === "marcus" || selectedFighter === "smith" || selectedFighter === "darwin" || selectedFighter === "wittgenstein" || selectedFighter === "arendt" || selectedFighter === "beauvoir" || selectedFighter === "paulo-freire" || selectedFighter === "fanon" || selectedFighter === "foucault" || selectedFighter === "deleuze") && combatClock.current.time < confuciusInvulnerableUntil.current.player) return;
          if (!attackConnects(current.enemyPosition,current.playerPosition,-1,move.range,moveName,playerAirborne.current,{attacker:opponentFighter,target:selectedFighter,defenderCrouching:guardRef.current})) return;
          const defended=guardRef.current, amount=defended?6:11;
          current.playerCoherence=Math.max(0,current.playerCoherence-amount);setPlayerCoherence(current.playerCoherence);
          addMessage("player",`−${amount} COERÊNCIA`,"damage");
          impactFeedback("player",defended,true,{freezeMs:35});finishByCoherence(current.playerCoherence,current.enemyCoherence);
        },delay));
      }
      if(opponentFighter === "deleuze" && moveName === "transcender"){scheduleDeleuzePlateaux("enemy",attackToken);return;}
      if(opponentFighter === "foucault" && moveName === "transcender")beginBiopower("enemy",attackToken);
      if(opponentFighter === "fanon" && moveName === "transcender"){scheduleFanonEarth("enemy",attackToken);return;}
      if(opponentFighter === "paulo-freire" && moveName === "transcender"){scheduleFreireLiberation("enemy",attackToken);return;}
      if(opponentFighter === "beauvoir" && moveName === "transcender"){scheduleBeauvoirBecoming("enemy",attackToken);return;}
      combatClock.current.schedule(() => {
        const current = gameRef.current;
        if (current.phase !== "playing" || roundResolved.current || attackSequence.current.enemy !== attackToken) return;
        if ((selectedFighter === "confucius" || selectedFighter === "marcus" || selectedFighter === "smith" || selectedFighter === "darwin" || selectedFighter === "wittgenstein" || selectedFighter === "arendt" || selectedFighter === "beauvoir" || selectedFighter === "paulo-freire" || selectedFighter === "fanon" || selectedFighter === "foucault" || selectedFighter === "deleuze") && combatClock.current.time < confuciusInvulnerableUntil.current.player) { addMessage("player", "PRIORIDADE", "miss"); return; }
        if (!attackConnects(current.enemyPosition, current.playerPosition, -1, move.range, moveName, playerAirborne.current, { attacker: opponentFighter, target: selectedFighter, defenderCrouching: guardRef.current })) {
          addMessage("player", "SEM CONTATO", "miss");
          return;
        }
        const defended = guardRef.current && !((opponentFighter === "wittgenstein" || opponentFighter === "arendt" || opponentFighter === "beauvoir" || opponentFighter === "paulo-freire" || opponentFighter === "fanon" || opponentFighter === "foucault") && special);
        const impactPosition = current.playerPosition;
        effectsAudio.current?.play(MOVE_SOUNDS[moveName], { gain: defended ? .45 : .8 });
        const perfectGuard =
          defended && combatClock.current.time - guardStartedAt.current <= 220;
        const guardedDamage = opponentFighter === "deleuze" && moveName === "especial" ? defended ? 17 : 32 : defended
          ? Math.min(damage,Math.max(1,Math.ceil(damage*(special?.5:perfectGuard?.1:.25)))+(combatClock.current.time<watchedUntil.current.player?3:0))
          : damage;
        const nextPlayer = Math.max(
          0,
          current.playerCoherence - guardedDamage,
        );
        current.playerCoherence = nextPlayer;
        setPlayerCoherence(nextPlayer);
        if(opponentFighter === "arendt" && moveName === "transcender"){
          current.enemyCoherence=Math.min(100,current.enemyCoherence+15);
          setEnemyCoherence(current.enemyCoherence);addMessage("enemy","+15 COERÊNCIA","concept");
        }
        if (opponentFighter === "confucius" && moveName === "especial") {
          setEnemyCoherence(Math.min(100, current.enemyCoherence + 8));
          addMessage("enemy", "+8 COERÊNCIA", "concept");
        }
        if (opponentFighter === "marcus" && moveName === "especial") {
          current.enemyCoherence = Math.min(100, current.enemyCoherence + 15);
          setEnemyCoherence(current.enemyCoherence);
          addMessage("enemy", "+15 COERÊNCIA", "concept");
        }
        const previousMeter = current.enemyLogos;
        current.enemyLogos = special ? 0 : Math.min(100, current.enemyLogos + (opponentFighter === "deleuze" ? move.logos : opponentFighter === "foucault" ? move.logos : opponentFighter === "fanon" ? move.logos : opponentFighter === "paulo-freire" ? move.logos : opponentFighter === "beauvoir" ? move.logos : selectedFighter === "darwin" ? 14 : 18));
        if (previousMeter < 100 && current.enemyLogos >= 100) cpuSpecialReadyAt.current = combatClock.current.time + 300;
        setEnemyLogos(current.enemyLogos);
        current.playerPosition = Math.max(13, current.playerPosition - (defended ? .7 : opponentFighter === "foucault" && special ? 7 : opponentFighter === "fanon" && special ? 7 : opponentFighter === "paulo-freire" && special ? 7 : opponentFighter === "beauvoir" && special ? 7 : opponentFighter === "arendt" && moveName === "transcender" ? 7 : opponentFighter === "wittgenstein" && moveName === "transcender" ? 7 : (opponentFighter === "amenemope" || opponentFighter === "marcus") && special ? 5 : (opponentFighter === "hegel" || opponentFighter === "kierkegaard") && moveName === "transcender" ? 5 : opponentFighter === "confucius" && moveName === "caverna" ? 3.3 : 2.2));
        setPlayerPosition(current.playerPosition);
        if (defended) {
          current.logos = Math.min(100, current.logos + (special ? 8 : perfectGuard ? 22 : 14));
          setLogos(current.logos);
        }
        addMessage(
          special ? "center" : "player",
          defended
            ? special
              ? `DEFESA PARCIAL · −${guardedDamage}`
              : perfectGuard
                ? `CONTRA-ARGUMENTO PERFEITO · −${guardedDamage}`
                : `DEFESA DIALÉTICA · −${guardedDamage}`
            : special
            ? move.shout
            : `−${guardedDamage} COERÊNCIA`,
          special ? "special" : "damage",
        );
        if (defended) {

          guardRef.current = false;
          setPlayerGuarding(false);
          playTone(392, 0.11, "square");
        }
        if(opponentFighter === "deleuze"){deleuzeContact("enemy",moveName,current.enemyPosition,impactPosition);if(special)deleuzeCamera(5);}
        if(opponentFighter === "foucault"){foucaultContact("enemy",moveName,current.enemyPosition,impactPosition);if(special){foucaultCamera(moveName==="especial"?5:7);if(moveName==="especial")applySurveillance("player");else{docileUntil.current.player=0;setDocile(current=>({...current,player:false}));}}}
        if(opponentFighter === "fanon"){fanonContact("enemy",moveName,current.enemyPosition,impactPosition);if(special)marcusContact();}
        if(opponentFighter === "paulo-freire"){freireContact("enemy",moveName,current.enemyPosition,impactPosition);if(special)marcusContact();}
        if(opponentFighter === "beauvoir"){beauvoirContact("enemy",moveName,current.enemyPosition,impactPosition);if(special)marcusContact();}
        if(opponentFighter === "arendt")arendtContact("enemy",moveName,current.enemyPosition,impactPosition);
        if(opponentFighter === "wittgenstein")wittgensteinContact("enemy",moveName,impactPosition);
        if (opponentFighter === "rousseau" && moveName === "caverna" && !defended) breakRousseauChains("player", impactPosition);
        if (opponentFighter === "hobbes" && moveName === "ideias" && !defended) bindSovereignPact("player");
        if (opponentFighter === "sidarta" && moveName === "transcender") sidartaContact();
        if (opponentFighter === "amenemope" && moveName === "transcender") maatContact();
        if (opponentFighter === "hobbes" && moveName === "transcender") sovereignImpact();
        if(opponentFighter==="freud"&&moveName==="especial"&&!defended)applyDreamTorpor("player");
        if(opponentFighter==="freud"&&moveName==="transcender")freudDeathContact(impactPosition);
        if(opponentFighter==="felipe-cyborg"&&special)cyborgContact(impactPosition,moveName==="transcender"?"swarm":"certainty");
        if (opponentFighter === "hegel" && moveName === "transcender") worldSpiritImpact(impactPosition);
        if (opponentFighter === "schopenhauer" && moveName === "transcender") pendulumImpact(impactPosition);
        if (opponentFighter === "confucius" && moveName === "transcender") confuciusContact();
        if ((opponentFighter === "marcus" || opponentFighter === "smith") && moveName === "transcender") marcusContact();
        impactFeedback("player", defended, special || moveName === "ideias", opponentFighter === "confucius" && moveName === "ideias" && !defended ? {stun:850,freezeMs:65} : undefined);
        if(opponentFighter==="kierkegaard"&&special)kierkegaardContact("player",moveName==="transcender"?"faith":"anxiety",impactPosition,defended);
        finishByCoherence(current.playerCoherence, current.enemyCoherence);
      }, cpuImpactDelay);
    }, isGrandFinal ? 1050 : cpuDecisionInterval(opponentFighter));
    return () => window.clearInterval(cpu);
  }, [
    addMessage,
    animate,
    finishByCoherence,
    bindSovereignPact,
    breakRousseauChains,
    sovereignImpact,
    maatContact,
    sidartaContact,
    amenemopeAdvance,
    confuciusAdvance,
    wittgensteinContact,
    arendtContact,
    beauvoirContact,
    scheduleBeauvoirBecoming,
    freireContact,
    scheduleFreireLiberation,
    fanonContact,
    scheduleFanonEarth,
    deleuzeContact,deleuzeCamera,scheduleDeleuzePlateaux,
    foucaultContact,
    foucaultCamera,
    applySurveillance,
    beginBiopower,
    confuciusContact,
    marcusAdvance,
    marcusContact,
    worldSpiritImpact,
    pendulumImpact,
    applyDreamTorpor,
    freudDeathContact,
    cyborgContact,
    beginFaithLeap,
    kierkegaardContact,
    impactFeedback,
    isGrandFinal,
    phase,
    playTone,
    selectedFighter,
    selectedOpponent,
  ]);

  const opponentFighter = selectedOpponent;
  const showGrandFinalFight = isGrandFinal && ["playing", "finishing", "won", "lost", "draw"].includes(phase);
  const playerMeta = FIGHTERS[selectedFighter];
  const enemyMeta = FIGHTERS[opponentFighter];
  const playerMoves = FIGHTER_MOVES[selectedFighter];
  const dogTravel = Math.max(
    8,
    enemyPosition - playerPosition - 14,
  );
  const chickenTravel = Math.max(
    8,
    enemyPosition - playerPosition - 10,
  );
  const commentatorTravel = Math.max(
    12,
    enemyPosition - playerPosition - 9,
  );
  const oxTravel = Math.max(
    12,
    enemyPosition - playerPosition - 10,
  );
  const princeTravel = Math.max(
    12,
    enemyPosition - playerPosition - 10,
  );
  const finchTravel = Math.max(
    18,
    enemyPosition - playerPosition - 10,
  );
  const declarationTravel = Math.max(
    18,
    enemyPosition - playerPosition - 8,
  );
  const darwinNaturalSelectionActive =
    arenaEffect === "darwin-natural-selection";
  const darwinTreeActive = arenaEffect === "darwin-tree-of-life";
  const darwinEffectFromPlayer = selectedFighter === "darwin";
  const olympeDeclarationActive = arenaEffect === "olympe-declaration";
  const olympeTribuneActive = arenaEffect === "olympe-tribune";
  const olympeEffectFromPlayer = selectedFighter === "olympe";
  const angelaDavisEffectFromPlayer = selectedFighter === "angela-davis";
  const angelaDavisOrigin = angelaDavisEffectFromPlayer ? playerPosition : enemyPosition;
  const angelaDavisTarget = angelaDavisEffectFromPlayer ? enemyPosition : playerPosition;
  const krenakEffectFromPlayer = selectedFighter === "krenak";
  const krenakOrigin = krenakEffectFromPlayer ? playerPosition : enemyPosition;
  const krenakTarget = krenakEffectFromPlayer ? enemyPosition : playerPosition;
  const turingEffectFromPlayer = selectedFighter === "turing";
  const turingOrigin = turingEffectFromPlayer ? playerPosition : enemyPosition;
  const turingTarget = turingEffectFromPlayer ? enemyPosition : playerPosition;

  const felipeEffect = felipeEffectEndpoints(selectedFighter === "felipe", playerPosition, enemyPosition);
  const superintelligenceEffectFromPlayer = selectedFighter === "superintelligence";
  const superintelligenceOrigin = superintelligenceEffectFromPlayer ? playerPosition : enemyPosition;
  const superintelligenceTarget = superintelligenceEffectFromPlayer ? enemyPosition : playerPosition;
  const matchWinner: FighterId =
    phase === "won" ? selectedFighter : opponentFighter;
  const matchLoser: FighterId =
    matchWinner === selectedFighter ? opponentFighter : selectedFighter;
  const resultLabel =
    phase === "won" || phase === "lost"
      ? `CAMPEÃO: ${FIGHTERS[matchWinner].name}`
      : "APORIA — EMPATE";
  const matchDialogue =
    MATCH_DIALOGUES[matchupKey(selectedFighter, opponentFighter)] ??
    kantCriticalDialogue(selectedFighter, opponentFighter);
  const fightDialogue = matchDialogue
    ? matchDialogue.intro.map(({ speaker, line }) => ({
        speaker: FIGHTERS[speaker].name,
        side: speaker,
        line,
      }))
    : [
        {
          speaker: FIGHTERS[selectedFighter].name,
          side: selectedFighter,
          line: DIALOGUE_LINES[selectedFighter],
        },
        {
          speaker: FIGHTERS[opponentFighter].name,
          side: opponentFighter,
          line: DIALOGUE_LINES[opponentFighter],
        },
      ];
  const dialogue = fightDialogue[dialogueStep];
  const finalArgument = {
    ...FINAL_ARGUMENTS[matchWinner],
    argument:
      matchDialogue?.victory[matchWinner] ??
      FINAL_ARGUMENTS[matchWinner].argument,
  };
  const roundWinner: FighterId =
    phase === "round-won" ? selectedFighter : opponentFighter;
  const storyEncounter = activeStoryEncounters[storyIndex] ?? activeStoryEncounters[0];
  const storyBeats = storyEncounter[storySceneKind];
  const storyBeat = storyBeats[storySceneStep] ?? storyBeats[0];
  const storyBackground = storyEncounter.background;
  const storyIntroScene = activeIntroScenes[storyIntroIndex];
  const storyRecapScenes = activeRecapScenes[storyIndex] ?? [];

  return (
    <main className={`game-shell phase-${phase}`}>
      <audio ref={soundtrackElement} data-soundtrack hidden aria-hidden="true" />
      <header className="game-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            Φ
          </span>
          <div>
            <h1>
              PHILO <strong>KOMBAT</strong>
            </h1>
            <p>UM COMBATE ENTRE IDEIAS FILOSÓFICAS</p>
          </div>
        </div>
        <div className="prototype-badge">
          {gameMode === "story"
            ? `MODO HISTÓRIA · ${campaignLabel}`
            : "VERSÃO 5.3 · MODO VERSUS"}
        </div>
        <div className="audio-controls" role="group" aria-label="Áudio do jogo"
          onKeyDown={(event) => event.stopPropagation()}>
          <button
            className="sound-button"
            type="button"
            onClick={() => setSoundOn((current) => !current)}
            aria-pressed={!soundOn}
            aria-label={soundOn ? "Silenciar áudio do jogo" : "Ativar áudio do jogo"}
            title={soundOn ? "Silenciar áudio do jogo" : "Ativar áudio do jogo"}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M11 4 6 8H3v8h3l5 4V4Z" strokeLinejoin="round" />
              {soundOn ? <><path d="M15 8a6 6 0 0 1 0 8" /><path d="M18 5a10 10 0 0 1 0 14" /></> : <path d="m15 9 6 6m0-6-6 6" />}
            </svg>
          </button>
          <label className="volume-control">
            <span>VOLUME</span>
            <input type="range" min="0" max="100" step="1" value={Math.round(volume * 100)}
              onChange={(event) => setVolume(Number(event.target.value) / 100)}
              aria-label="Volume do jogo" aria-valuetext={`${Math.round(volume * 100)} por cento`} />
            <output>{Math.round(volume * 100)}%</output>
          </label>
        </div>
      </header>

      <section
        className={`battle-frame ${
          (selectedFighter === "felipe-cyborg" || opponentFighter === "felipe-cyborg")
            ? "arena-cyborg"
            : selectedFighter === "amenemope"
            ? "arena-egypt"
            : selectedFighter === "homero"
              ? "arena-troy"
            : selectedFighter === "tales"
              ? "arena-ionia"
            : selectedFighter === "socrates"
              ? "arena-agora"
            : selectedFighter === "diogenes"
              ? "arena-diogenes"
            : selectedFighter === "aristotle"
              ? "arena-lyceum"
            : selectedFighter === "sidarta"
              ? "arena-bodhgaya"
            : selectedFighter === "confucius"
              ? "arena-confucius"
            : selectedFighter === "marcus"
              ? "arena-danube"
            : selectedFighter === "hypatia"
              ? "arena-alexandria"
            : selectedFighter === "agostinho"
              ? "arena-hippo"
            : selectedFighter === "averroes"
              ? "arena-cordoba"
            : selectedFighter === "thomas"
              ? "arena-monastery"
            : selectedFighter === "machiavelli"
              ? "arena-florence"
            : selectedFighter === "galileo"
              ? "arena-pisa"
            : selectedFighter === "descartes"
              ? "arena-descartes"
            : selectedFighter === "locke"
              ? "arena-locke"
            : selectedFighter === "hobbes"
              ? "arena-hobbes"
            : selectedFighter === "rousseau"
              ? "arena-rousseau"
            : selectedFighter === "smith"
              ? "arena-smith"
            : selectedFighter === "kant"
              ? "arena-kant"
            : selectedFighter === "hegel"
              ? "arena-hegel"
            : selectedFighter === "schopenhauer"
              ? "arena-schopenhauer"
            : selectedFighter === "marx"
              ? "arena-marx"
            : selectedFighter === "freud"
              ? "arena-freud"
            : selectedFighter === "darwin"
              ? "arena-galapagos"
            : selectedFighter === "olympe"
              ? "arena-revolution"
            : selectedFighter === "kierkegaard"
              ? "arena-copenhagen"
            : selectedFighter === "beauvoir"
              ? "arena-paris-beauvoir"
            : selectedFighter === "foucault"
              ? "arena-hospital-panoptico"
            : selectedFighter === "arendt"
              ? "arena-eichmann-courtroom"
            : selectedFighter === "wittgenstein"
              ? "arena-wittgenstein-cabin"
            : selectedFighter === "angela-davis"
              ? "arena-oakland"
            : selectedFighter === "felipe"
              ? "arena-felipe-classroom"
            : selectedFighter === "paulo-freire"
              ? "arena-paulo-freire"
            : selectedFighter === "fanon"
              ? "arena-fanon"
            : selectedFighter === "krenak"
              ? "arena-krenak"
            : selectedFighter === "turing"
              ? "arena-bletchley-park"
            : selectedFighter === "deleuze"
              ? "arena-vincennes"
            : selectedFighter === "superintelligence"
              ? "arena-supercomputer"
            : selectedFighter === "nietzsche"
              ? "arena-sils"
              : ""
        } ${gameMode === "story" ? "mode-story" : ""} ${showGrandFinalFight ? "arena-grand-final" : ""} phase-${phase} ${hitstop ? "is-hitstop" : ""} ${hobbesImpact ? "hobbes-impact-shake" : ""} ${maatImpact ? "maat-impact-shake" : ""} ${sidartaImpact ? "sidarta-dharma-impact" : ""} ${confuciusImpact ? "confucius-impact-shake" : ""} ${marcusImpact ? "marcus-impact-shake" : ""} ${fanonQuake ? "fanon-earthquake-shake" : ""} ${deleuzeShake===5 ? "deleuze-rhizome-shake" : deleuzeShake===7 ? "deleuze-plateaux-shake" : ""} ${foucaultShake===5 ? "foucault-panopticon-shake" : foucaultShake===7 ? "foucault-biopower-shake" : ""} ${hegelImpact ? "hegel-world-shake" : ""} ${schopenhauerImpact ? "schopenhauer-impact-shake" : ""} ${kierkegaardImpact?.kind === "faith" ? "kierkegaard-faith-shake" : ""} ${selectedFighter === "freud" || opponentFighter === "freud" ? "freud-polish-fight" : ""} ${selectedFighter === "arendt" || opponentFighter === "arendt" ? "arendt-polish-fight" : ""} ${freudImpact ? "freud-energy-shake" : ""} ${cyborgImpact ? "cyborg-impact-shake" : ""} ${arenaEffect ? `effect-${arenaEffect}` : ""} ${
          phase === "finishing" ? "is-finishing" : ""
        }`}
        style={{ "--story-arena": `url(${storyEncounter.background})` } as CSSProperties}
        aria-label="Arena de combate filosófico"
      >
        {(selectedFighter === "freud" || opponentFighter === "freud") && <FreudSoftHitflashFilter />}
        {(playerAction === "special-death-drive" || enemyAction === "special-death-drive") && <div className="freud-death-dim" aria-hidden="true" />}
        <div className="arena-sky" />
        {(selectedFighter === "felipe-cyborg" || opponentFighter === "felipe-cyborg") && <CyborgAtmosphere />}
        <div className="special-colorwash" aria-hidden="true" />
        {showGrandFinalFight ? <GrandFinalAtmosphere /> : <div className="arena-life" aria-hidden="true">
          <span className="bird bird-one" />
          <span className="bird bird-two" />
          <span className="temple-banner" />
          <span className="torch torch-left" />
          <span className="torch torch-right" />
          <span className="dust dust-one" />
          <span className="dust dust-two" />
          <span className="dust dust-three" />
        </div>}
        <div className="arena-vignette" />

        {(playerAction === "special-leviathan" || enemyAction === "special-leviathan") && <div className="hobbes-arena-dim" aria-hidden="true" />}
        {(playerAction === "special-world-spirit" || enemyAction === "special-world-spirit") && <div className="hegel-world-dim" aria-hidden="true" />}
        <div className="hud">
          <div className="fighter-hud player-hud">
            <div className="fighter-heading">
              <div>
                <span className="school">{playerMeta.school}</span>
                <h2>{playerMeta.name}</h2>
              </div>
              <span className={`portrait portrait-${selectedFighter}`}>
                {playerMeta.symbol}
              </span>
            </div>
            <div className="bar-label">
              <span>COERÊNCIA</span>
              <strong>{playerCoherence}</strong>
            </div>
            <div
              className={`bar coherence-bar ${playerCoherence <= 25 ? "danger" : ""}`}
            >
              <span style={{ width: `${playerCoherence}%` }} />
            </div>
            {logos >= 100 && !silenced.player && phase === "playing" && <span className="special-ready-indicator" role="status">
              <span className="combat-key-label">[L] e [U] </span>ESPECIAIS PRONTOS!
            </span>}
            <div className="logos-row">
              <span>{playerMeta.meter}</span>
              <div className={`bar logos-bar ${logos >= 100 ? "ready" : ""}`}>
                <span style={{ width: `${logos}%` }} />
              </div>
              <strong>{logos}%</strong>
            </div>
          </div>

          <div className="round-clock">
            <span>
              {gameMode === "story"
                ? `ETAPA ${storyIndex + 1} DE ${campaignTotal} · ${campaignLabel}`
                : `LUTA ${round} · MELHOR DE 3`}
            </span>
            <strong>{String(time).padStart(2, "0")}</strong>
            <div className="score-pips" aria-label="Placar da disputa">
              <span className={matchScore.player >= 1 ? "won" : ""} />
              {gameMode === "versus" && (
                <span className={matchScore.player >= 2 ? "won" : ""} />
              )}
              <b>×</b>
              <span className={matchScore.enemy >= 1 ? "won enemy" : ""} />
              {gameMode === "versus" && (
                <span className={matchScore.enemy >= 2 ? "won enemy" : ""} />
              )}
            </div>
          </div>

          <div className="fighter-hud enemy-hud">
            <div className="fighter-heading">
              <span className={`portrait portrait-${opponentFighter}`}>
                {enemyMeta.symbol}
              </span>
              <div>
                <span className="school">{enemyMeta.school}</span>
                <h2>{enemyMeta.name}</h2>
              </div>
            </div>
            <div className="bar-label">
              <strong>{enemyCoherence}</strong>
              <span>COERÊNCIA</span>
            </div>
            <div
              className={`bar coherence-bar enemy-bar ${enemyCoherence <= 25 ? "danger" : ""}`}
            >
              <span style={{ width: `${enemyCoherence}%` }} />
            </div>
            {enemyLogos >= 100 && phase === "playing" && <span className="special-ready-indicator enemy-special-ready">ESPECIAIS PRONTOS!</span>}
            <div className="logos-row enemy-logos-row">
              <strong>{enemyLogos}%</strong>
              <div
                className={`bar logos-bar ${enemyLogos >= 100 ? "ready" : ""}`}
              >
                <span style={{ width: `${enemyLogos}%` }} />
              </div>
              <span>{enemyMeta.meter}</span>
            </div>
          </div>
        </div>

        <div className="battlefield">
          {(playerAction === "special-cosmic-logos" || enemyAction === "special-cosmic-logos") && <div className="marcus-cosmos" aria-hidden="true"><i/><i/><i/><i/></div>}
          {selectedFighter === "marcus" && playerAction === "attack-kick" && <div className="marcus-kick-arc" aria-hidden="true" style={{left:`${playerPosition}%`}} />}
          {opponentFighter === "marcus" && enemyAction === "attack-kick" && <div className="marcus-kick-arc is-enemy" aria-hidden="true" style={{left:`${enemyPosition}%`}} />}
          {selectedFighter === "confucius" && <ConfuciusEffects origin={playerPosition} target={enemyPosition} action={playerAction} clock={combatClock.current} jumpMs={jumpDuration.player} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} impact={confuciusImpact} />}
          {opponentFighter === "confucius" && <ConfuciusEffects origin={enemyPosition} target={playerPosition} action={enemyAction} clock={combatClock.current} jumpMs={jumpDuration.enemy} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} impact={confuciusImpact} />}
          {selectedFighter === "sidarta" && <SidartaEffects origin={playerPosition} target={enemyPosition} action={playerAction} clock={combatClock.current} jumpMs={jumpDuration.player} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} />}
          {opponentFighter === "sidarta" && <SidartaEffects origin={enemyPosition} target={playerPosition} action={enemyAction} clock={combatClock.current} jumpMs={jumpDuration.enemy} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} />}
          {selectedFighter === "amenemope" && <AmenemopeEffects origin={playerPosition} target={enemyPosition} action={playerAction} clock={combatClock.current} jumpMs={jumpDuration.player} />}
          {opponentFighter === "amenemope" && <AmenemopeEffects origin={enemyPosition} target={playerPosition} action={enemyAction} clock={combatClock.current} jumpMs={jumpDuration.enemy} />}
          {playerAction === "special-certainty" && <CyborgSpecial key={`cyborg-p1-certainty-${attackSequence.current.player}`} kind="certainty" origin={playerPosition} target={enemyPosition} contact={cyborgImpact?.position} clock={combatClock.current} />}
          {playerAction === "special-drone-swarm" && <CyborgSpecial key={`cyborg-p1-swarm-${attackSequence.current.player}`} kind="swarm" origin={playerPosition} target={enemyPosition} contact={cyborgImpact?.position} clock={combatClock.current} />}
          {enemyAction === "special-certainty" && <CyborgSpecial key={`cyborg-p2-certainty-${attackSequence.current.enemy}`} kind="certainty" origin={enemyPosition} target={playerPosition} contact={cyborgImpact?.position} clock={combatClock.current} />}
          {enemyAction === "special-drone-swarm" && <CyborgSpecial key={`cyborg-p2-swarm-${attackSequence.current.enemy}`} kind="swarm" origin={enemyPosition} target={playerPosition} contact={cyborgImpact?.position} clock={combatClock.current} />}
          {selectedFighter === "freud" && <FreudGroundShadow position={playerPosition} action={playerAction} jumpMs={jumpDuration.player} clock={combatClock.current} />}
          {opponentFighter === "freud" && <FreudGroundShadow position={enemyPosition} action={enemyAction} jumpMs={jumpDuration.enemy} clock={combatClock.current} />}
          {freudImpact && <FreudDeathImpact key={freudImpact.id} position={freudImpact.position} />}
          <div
            className={`fighter fighter-player fighter-${selectedFighter} ${playerAction} ${disoriented.player ? "is-disoriented" : ""} ${torporBound.player ? "is-torpid" : ""} ${jumpDuration.player > 650 ? "pact-slow-jump" : ""} ${impactFlash.player ? "impact-flash" : ""} ${
              selectedFighter === "amenemope" && logos >= 25
                ? "is-serene"
                : ""
            }`}
            style={{ left: selectedFighter === "beauvoir" && playerAction === "knocked-out" ? `clamp(18%, ${playerPosition}%, 82%)` : `${playerPosition}%`, ...(selectedFighter === "freud" ? { "--freud-scale": FREUD_SCALE } : {}), ...(selectedFighter === "hypatia" ? { "--hypatia-scale": HYPATIA_SCALE } : {}), ...(selectedFighter === "averroes" ? { "--averroes-scale": AVERROES_SCALE } : {}), ...(selectedFighter === "thomas" ? { "--thomas-scale": THOMAS_SCALE } : {}), ...(selectedFighter === "machiavelli" ? { "--machiavelli-scale": MACHIAVELLI_SCALE } : {}) } as CSSProperties}
          >
            <div className="fighter-aura" />
            <div
              className={`fighter-sprite ${
                finisher === selectedFighter &&
                selectedFighter !== "amenemope" &&
                selectedFighter !== "homero" &&
                selectedFighter !== "tales" &&
                selectedFighter !== "socrates" &&
                selectedFighter !== "diogenes" &&
                selectedFighter !== "aristotle" &&
                selectedFighter !== "sidarta" &&
                selectedFighter !== "confucius" &&
                selectedFighter !== "marcus" &&
                selectedFighter !== "hypatia" &&
                selectedFighter !== "agostinho" &&
                selectedFighter !== "averroes" &&
                selectedFighter !== "thomas" &&
                selectedFighter !== "machiavelli" &&
                selectedFighter !== "galileo" &&
                selectedFighter !== "descartes" &&
                selectedFighter !== "locke" &&
                selectedFighter !== "hobbes"
                && selectedFighter !== "rousseau"
                && selectedFighter !== "smith"
                && selectedFighter !== "kant"
                && selectedFighter !== "hegel"
                && selectedFighter !== "schopenhauer"
                && selectedFighter !== "marx"
                && selectedFighter !== "freud"
                && selectedFighter !== "darwin"
                && selectedFighter !== "olympe"
                && selectedFighter !== "kierkegaard"
                && selectedFighter !== "beauvoir"
                && selectedFighter !== "foucault"
                && selectedFighter !== "arendt"
                && selectedFighter !== "wittgenstein"
                && selectedFighter !== "angela-davis"
                && selectedFighter !== "paulo-freire"
                && selectedFighter !== "fanon"
                && selectedFighter !== "krenak"
                && selectedFighter !== "turing"
                && selectedFighter !== "deleuze"
                && selectedFighter !== "felipe-cyborg"
                && selectedFighter !== "felipe"
                && selectedFighter !== "superintelligence"
                && selectedFighter !== "nietzsche"
                  ? `victory-sheet victory-${selectedFighter}-sheet`
                  : `${selectedFighter}-sheet`
              }`}
              style={
                selectedFighter === "hypatia"
                  ? {
                      backgroundImage:
                        'url("/game/hipatia-spritesheet-hq-v2.webp")',
                    }
                  : undefined
              }
              role="img"
              aria-label={`${playerMeta.name} em posição de combate`}
            >
              {selectedFighter === "deleuze" && <DeleuzeMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "foucault" && <FoucaultMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "fanon" && <FanonMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "paulo-freire" && <FreireMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "beauvoir" && <BeauvoirMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "arendt" && <ArendtGuard action={playerAction} clock={combatClock.current} />}
              {selectedFighter === "wittgenstein" && <WittgensteinSprite action={playerAction} clock={combatClock.current} />}
              {selectedFighter === "darwin" && <DarwinMotionSprite action={playerAction} clock={combatClock.current} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} />}
              {selectedFighter === "olympe" && <OlympeMotionSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "smith" && <SmithSprite action={playerAction} clock={combatClock.current} sequence={attackSequence.current.player} />}
              {selectedFighter === "marcus" && <MarcusSprite />}
              {selectedFighter === "confucius" && <ConfuciusSprite action={playerAction} clock={combatClock.current} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} />}
              {selectedFighter === "sidarta" && <SidartaSprite action={playerAction} paused={hitstop} clock={combatClock.current} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} />}
              {selectedFighter === "amenemope" && <AmenemopeSprite action={playerAction} paused={hitstop} clock={combatClock.current} />}
              {selectedFighter === "averroes" && <AverroesSprite action={playerAction} paused={hitstop} />}
              {selectedFighter === "thomas" && <ThomasSprite action={playerAction} paused={hitstop} />}
              {selectedFighter === "machiavelli" && <MachiavelliSprite action={playerAction} paused={hitstop} />}
              {selectedFighter === "galileo" && <GalileoSprite action={playerAction} paused={hitstop} />}
              {selectedFighter === "schopenhauer" && (playerAction === "attack-punch" || playerAction === "attack-combo") && <SchopenhauerCaneTrail key={`${playerAction}-${attackSequence.current.player}`} action={playerAction} paused={hitstop} clock={combatClock.current} />}
              {selectedFighter === "schopenhauer" && impactFlash.player && <SchopenhauerSoftFlash />}
              {selectedFighter === "kierkegaard" && <KierkegaardMotionSprite action={playerAction} clock={combatClock.current} jumpMs={jumpDuration.player} faithStarted={faithLeaps.current.player?.started} />}
              {selectedFighter === "kierkegaard" && playerAction === "attack-combo" && <KierkegaardEitherCuts key={attackSequence.current.player} clock={combatClock.current} />}
              {selectedFighter === "freud" && (playerAction === "idle" || playerAction === "attack-punch") && <FreudCigarSmoke key={`${playerAction}-${attackSequence.current.player}`} action={playerAction} clock={combatClock.current} />}
              {selectedFighter === "hegel" && <HegelSprite action={playerAction} paused={hitstop} jumpMs={jumpDuration.player} clock={combatClock.current} />}
              {selectedFighter === "felipe-cyborg" && <CyborgSprite action={playerAction} sequence={playerAction.startsWith("attack-") || playerAction.startsWith("special-") ? attackSequence.current.player : 0} clock={combatClock.current} />}
              {selectedFighter === "felipe" && <FelipeSprite paused={hitstop} action={playerAction} staticPose={playerAction === "advance" || playerAction === "retreat" ? "idle" : undefined} />}
              {(selectedFighter === "agostinho" || selectedFighter === "felipe" || selectedFighter === "darwin" || selectedFighter === "arendt" || selectedFighter === "wittgenstein" || selectedFighter === "angela-davis" || selectedFighter === "paulo-freire" || selectedFighter === "fanon" || selectedFighter === "krenak" || selectedFighter === "turing" || selectedFighter === "superintelligence") && (
                <FighterWalk fighter={selectedFighter} paused={hitstop} active={playerAction === "advance" || playerAction === "retreat"} retreat={playerAction === "retreat"} />
              )}
            </div>
            {selectedFighter === "hobbes" && (playerGuarding || playerAction === "guard-hit") && <HobbesShield />}
            {torporBound.player && <span className="freud-torpor-veil" aria-hidden="true" />}
            {pactBound.player && <HobbesChains />}
            <HobbesPactJump active={playerAction === "jump" && jumpDuration.player > 650} bound={pactBound.player || torporBound.player} />
            <span className="fighter-shadow" />
          </div>

          {showGrandFinalFight ? (
            <>
              <GrandFinalBody position={enemyPosition} action={enemyAction} strike={grandStrike} overclocked={enemyCoherence <= 50} />
              <GrandFinalBridge />
              {grandStrike && phase === "playing" && <GrandFinalAttack strike={grandStrike} />}
            </>
          ) : <div
            className={`fighter fighter-enemy fighter-${opponentFighter} ${enemyAction} ${disoriented.enemy ? "is-disoriented" : ""} ${torporBound.enemy ? "is-torpid" : ""} ${jumpDuration.enemy > 650 ? "pact-slow-jump" : ""} ${impactFlash.enemy ? "impact-flash" : ""} ${enemyGuarding ? "is-guarding" : ""}`}
            style={{ left: opponentFighter === "beauvoir" && enemyAction === "knocked-out" ? `clamp(18%, ${enemyPosition}%, 82%)` : `${enemyPosition}%`, ...(opponentFighter === "freud" ? { "--freud-scale": FREUD_SCALE } : {}), ...(opponentFighter === "hypatia" ? { "--hypatia-scale": HYPATIA_SCALE } : {}), ...(opponentFighter === "averroes" ? { "--averroes-scale": AVERROES_SCALE } : {}), ...(opponentFighter === "thomas" ? { "--thomas-scale": THOMAS_SCALE } : {}), ...(opponentFighter === "machiavelli" ? { "--machiavelli-scale": MACHIAVELLI_SCALE } : {}) } as CSSProperties}
          >
            <div className="fighter-aura" />
            <div
              className={`fighter-sprite ${
                finisher === opponentFighter &&
                opponentFighter !== "amenemope" &&
                opponentFighter !== "homero" &&
                opponentFighter !== "tales" &&
                opponentFighter !== "socrates" &&
                opponentFighter !== "diogenes" &&
                opponentFighter !== "aristotle" &&
                opponentFighter !== "sidarta" &&
                opponentFighter !== "confucius" &&
                opponentFighter !== "marcus" &&
                opponentFighter !== "hypatia" &&
                opponentFighter !== "agostinho" &&
                opponentFighter !== "averroes" &&
                opponentFighter !== "thomas" &&
                opponentFighter !== "machiavelli" &&
                opponentFighter !== "galileo" &&
                opponentFighter !== "descartes" &&
                opponentFighter !== "locke" &&
                opponentFighter !== "hobbes"
                && opponentFighter !== "rousseau"
                && opponentFighter !== "smith"
                && opponentFighter !== "kant"
                && opponentFighter !== "hegel"
                && opponentFighter !== "schopenhauer"
                && opponentFighter !== "marx"
                && opponentFighter !== "freud"
                && opponentFighter !== "darwin"
                && opponentFighter !== "olympe"
                && opponentFighter !== "kierkegaard"
                && opponentFighter !== "beauvoir"
                && opponentFighter !== "foucault"
                && opponentFighter !== "arendt"
                && opponentFighter !== "wittgenstein"
                && opponentFighter !== "angela-davis"
                && opponentFighter !== "paulo-freire"
                && opponentFighter !== "fanon"
                && opponentFighter !== "krenak"
                && opponentFighter !== "turing"
                && opponentFighter !== "deleuze"
                && opponentFighter !== "felipe-cyborg"
                && opponentFighter !== "felipe"
                && opponentFighter !== "superintelligence"
                && opponentFighter !== "nietzsche"
                  ? `victory-sheet victory-${opponentFighter}-sheet`
                  : `${opponentFighter}-sheet`
              }`}
              style={
                opponentFighter === "hypatia"
                  ? {
                      backgroundImage:
                        'url("/game/hipatia-spritesheet-hq-v2.webp")',
                    }
                  : undefined
              }
              role="img"
              aria-label={`${enemyMeta.name} em posição de combate`}
            >
              {opponentFighter === "deleuze" && <DeleuzeMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "foucault" && <FoucaultMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "fanon" && <FanonMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "paulo-freire" && <FreireMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "beauvoir" && <BeauvoirMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "arendt" && <ArendtGuard action={enemyAction} clock={combatClock.current} />}
              {opponentFighter === "wittgenstein" && <WittgensteinSprite action={enemyAction} clock={combatClock.current} />}
              {opponentFighter === "darwin" && <DarwinMotionSprite action={enemyAction} clock={combatClock.current} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} />}
              {opponentFighter === "olympe" && <OlympeMotionSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "smith" && <SmithSprite action={enemyAction} clock={combatClock.current} sequence={attackSequence.current.enemy} />}
              {opponentFighter === "marcus" && <MarcusSprite />}
              {opponentFighter === "confucius" && <ConfuciusSprite action={enemyAction} clock={combatClock.current} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} />}
              {opponentFighter === "sidarta" && <SidartaSprite action={enemyAction} paused={hitstop} clock={combatClock.current} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} />}
              {opponentFighter === "amenemope" && <AmenemopeSprite action={enemyAction} paused={hitstop} clock={combatClock.current} />}
              {opponentFighter === "averroes" && <AverroesSprite action={enemyAction} paused={hitstop} />}
              {opponentFighter === "thomas" && <ThomasSprite action={enemyAction} paused={hitstop} />}
              {opponentFighter === "machiavelli" && <MachiavelliSprite action={enemyAction} paused={hitstop} />}
              {opponentFighter === "galileo" && <GalileoSprite action={enemyAction} paused={hitstop} />}
              {opponentFighter === "schopenhauer" && (enemyAction === "attack-punch" || enemyAction === "attack-combo") && <SchopenhauerCaneTrail key={`${enemyAction}-${attackSequence.current.enemy}`} action={enemyAction} paused={hitstop} clock={combatClock.current} />}
              {opponentFighter === "schopenhauer" && impactFlash.enemy && <SchopenhauerSoftFlash />}
              {opponentFighter === "kierkegaard" && <KierkegaardMotionSprite action={enemyAction} clock={combatClock.current} jumpMs={jumpDuration.enemy} faithStarted={faithLeaps.current.enemy?.started} />}
              {opponentFighter === "kierkegaard" && enemyAction === "attack-combo" && <KierkegaardEitherCuts key={attackSequence.current.enemy} clock={combatClock.current} />}
              {opponentFighter === "freud" && (enemyAction === "idle" || enemyAction === "attack-punch") && <FreudCigarSmoke key={`${enemyAction}-${attackSequence.current.enemy}`} action={enemyAction} clock={combatClock.current} />}
              {opponentFighter === "hegel" && <HegelSprite action={enemyAction} paused={hitstop} jumpMs={jumpDuration.enemy} clock={combatClock.current} />}
              {opponentFighter === "felipe-cyborg" && <CyborgSprite action={enemyAction} sequence={enemyAction.startsWith("attack-") || enemyAction.startsWith("special-") ? attackSequence.current.enemy : 0} clock={combatClock.current} />}
              {opponentFighter === "felipe" && <FelipeSprite paused={hitstop} action={enemyAction} staticPose={enemyAction === "advance" || enemyAction === "retreat" ? "idle" : undefined} />}
              {(opponentFighter === "agostinho" || opponentFighter === "felipe" || opponentFighter === "darwin" || opponentFighter === "arendt" || opponentFighter === "wittgenstein" || opponentFighter === "angela-davis" || opponentFighter === "paulo-freire" || opponentFighter === "fanon" || opponentFighter === "krenak" || opponentFighter === "turing" || opponentFighter === "superintelligence") && (
                <FighterWalk fighter={opponentFighter} paused={hitstop} active={enemyAction === "advance" || enemyAction === "retreat"} retreat={enemyAction === "retreat"} />
              )}
            </div>
            {opponentFighter === "hobbes" && (enemyGuarding || enemyAction === "guard-hit") && <HobbesShield />}
            {torporBound.enemy && <span className="freud-torpor-veil" aria-hidden="true" />}
            {pactBound.enemy && <HobbesChains />}
            <HobbesPactJump active={enemyAction === "jump" && jumpDuration.enemy > 650} bound={pactBound.enemy || torporBound.enemy} />
            <span className="fighter-shadow" />
          </div>}

          {playerAction === "special-solid" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="solid-projectile"
              src="/game/solido-platonico.webp"
              alt=""
              aria-hidden="true"
              style={{
                left: `${playerPosition + 8}%`,
                "--solid-travel": `${Math.max(22, enemyPosition - playerPosition - 8)}vw`,
              } as CSSProperties}
            />
          )}

          {enemyAction === "special-solid" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="solid-projectile enemy-projectile"
              src="/game/solido-platonico.webp"
              alt=""
              aria-hidden="true"
              style={{
                left: `${enemyPosition - 8}%`,
                "--solid-travel": `-${Math.max(22, enemyPosition - playerPosition - 8)}vw`,
              } as CSSProperties}
            />
          )}

          {playerAction === "special-hammer" && (
            <>
              <div
                className="nietzsche-target-hammer hammer-from-player"
                aria-hidden="true"
                style={{ left: opponentFighter === "beauvoir" && enemyAction === "knocked-out" ? `clamp(18%, ${enemyPosition}%, 82%)` : `${enemyPosition}%` }}
              />
              <div
                className="hammer-shockwave player-shockwave"
                aria-hidden="true"
                style={{ left: opponentFighter === "beauvoir" && enemyAction === "knocked-out" ? `clamp(18%, ${enemyPosition}%, 82%)` : `${enemyPosition}%` }}
              />
            </>
          )}

          {enemyAction === "special-hammer" && (
            <>
              <div
                className="nietzsche-target-hammer hammer-from-enemy"
                aria-hidden="true"
                style={{ left: selectedFighter === "beauvoir" && playerAction === "knocked-out" ? `clamp(18%, ${playerPosition}%, 82%)` : `${playerPosition}%` }}
              />
              <div
                className="hammer-shockwave"
                aria-hidden="true"
                style={{ left: selectedFighter === "beauvoir" && playerAction === "knocked-out" ? `clamp(18%, ${playerPosition}%, 82%)` : `${playerPosition}%` }}
              />
            </>
          )}

          {playerAction === "special-good" && (
            <div
              className="good-radiance"
              aria-hidden="true"
              style={{ left: `${playerPosition + 4}%` }}
            >
              <span>☼</span>
            </div>
          )}

          {enemyAction === "special-good" && (
            <div
              className="good-radiance enemy-radiance"
              aria-hidden="true"
              style={{ left: `${enemyPosition - 4}%` }}
            >
              <span>☼</span>
            </div>
          )}

          {(playerAction === "special-overman" ||
            enemyAction === "special-overman") && (
            <div
              className={`overman-strike ${
                playerAction === "special-overman"
                  ? "overman-from-player"
                  : "overman-from-enemy"
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-overman"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="overman-aura overman-aura-one" />
              <span className="overman-aura overman-aura-two" />
              <span className="overman-figure" />
              <span className="overman-impact" />
            </div>
          )}

          {(playerAction === "special-arrow" ||
            enemyAction === "special-arrow") && (
            <>
              <div
                className={`odysseus-bow ${
                  enemyAction === "special-arrow" ? "enemy-bow" : ""
                }`}
                aria-hidden="true"
              >
                <span className="bow-arc" />
                <span className="bow-string" />
              </div>
              <div
                className={`odysseus-arrow ${
                  enemyAction === "special-arrow" ? "enemy-arrow" : ""
                }`}
                aria-hidden="true"
              >
                <span className="arrow-shaft" />
                <span className="arrow-head" />
                <span className="arrow-fletching" />
              </div>
            </>
          )}

          {(playerAction === "special-wrath" ||
            enemyAction === "special-wrath") && (
            <div className="achilles-wrath" aria-hidden="true">
              <span className="wrath-flame flame-one" />
              <span className="wrath-flame flame-two" />
              <span className="wrath-flame flame-three" />
              <strong>Μῆνις</strong>
            </div>
          )}

          {(playerAction === "special-water" ||
            enemyAction === "special-water") && (
            <div
              className={`arche-water ${
                enemyAction === "special-water" ? "enemy-water" : ""
              }`}
              style={
                enemyAction === "special-water"
                  ? { right: `${Math.max(8, 100 - enemyPosition + 5)}%` }
                  : { left: `${Math.max(8, playerPosition + 5)}%` }
              }
              aria-hidden="true"
            >
              <span className="water-core" />
              <span className="water-crest crest-one" />
              <span className="water-crest crest-two" />
              <span className="water-spray spray-one" />
              <span className="water-spray spray-two" />
              <span className="water-spray spray-three" />
            </div>
          )}

          {(playerAction === "special-eclipse" ||
            enemyAction === "special-eclipse") && (
            <div className="halys-eclipse" aria-hidden="true">
              <span className="eclipse-corona" />
              <span className="eclipse-disk" />
            </div>
          )}

          {(playerAction === "special-maieutic" ||
            enemyAction === "special-maieutic") && (
            <div
              className="maieutic-light"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-maieutic"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="maieutic-ray ray-one" />
              <span className="maieutic-ray ray-two" />
              <span className="maieutic-ray ray-three" />
              <span className="awakened-head" />
              <span className="awakened-body" />
              <span className="idea-spark spark-one" />
              <span className="idea-spark spark-two" />
              <span className="idea-spark spark-three" />
            </div>
          )}

          {(playerAction === "special-hemlock" ||
            enemyAction === "special-hemlock") && (
            <div
              className="hemlock-veil"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-hemlock"
                    ? playerPosition
                    : enemyPosition
                }%`,
              }}
            >
              <span className="hemlock-ring ring-one" />
              <span className="hemlock-ring ring-two" />
              <span className="hemlock-vapor vapor-one" />
              <span className="hemlock-vapor vapor-two" />
              <span className="hemlock-vapor vapor-three" />
            </div>
          )}

          {(playerAction === "special-syllogism" ||
            enemyAction === "special-syllogism") && (
            <div
              className="syllogism-strike"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-syllogism"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="premise premise-one">A</span>
              <span className="premise premise-two">B</span>
              <span className="conclusion">∴</span>
              <i className="logic-line line-one" />
              <i className="logic-line line-two" />
            </div>
          )}

          {(playerAction === "special-mean" ||
            enemyAction === "special-mean") && (
            <div className="golden-mean" aria-hidden="true">
              <span className="mean-extreme extreme-left" />
              <span className="mean-extreme extreme-right" />
              <span className="mean-center" />
              <span className="mean-orbit orbit-one" />
              <span className="mean-orbit orbit-two" />
            </div>
          )}

          {(playerAction === "special-ren" ||
            enemyAction === "special-ren") && (
            <div
              className="ren-humanity"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-ren"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="ren-glyph">仁</span>
              <span className="ren-person ren-person-left" />
              <span className="ren-person ren-person-right" />
              <span className="ren-thread" />
              <span className="ren-ring ren-ring-one" />
              <span className="ren-ring ren-ring-two" />
            </div>
          )}

          {(playerAction === "special-li" ||
            enemyAction === "special-li") && (
            <div className="li-ritual" aria-hidden="true">
              <span className="li-circle li-circle-one" />
              <span className="li-circle li-circle-two" />
              <span className="li-glyph li-glyph-center">禮</span>
              <span className="li-glyph li-glyph-ren">仁</span>
              <span className="li-glyph li-glyph-yi">義</span>
              <span className="li-glyph li-glyph-zhi">智</span>
            </div>
          )}

          {(playerAction === "special-citadel" ||
            enemyAction === "special-citadel") && (
            <div
              className="inner-citadel"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-citadel"
                    ? playerPosition
                    : enemyPosition
                }%`,
              }}
            >
              <span className="citadel-dome" />
              <span className="citadel-column column-one" />
              <span className="citadel-column column-two" />
              <span className="citadel-column column-three" />
              <span className="citadel-core">Μ</span>
              <span className="citadel-wave" />
            </div>
          )}

          {(playerAction === "special-cosmic-logos" ||
            enemyAction === "special-cosmic-logos") && (
            <div
              className="cosmic-logos"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-cosmic-logos"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="logos-orbit logos-orbit-one" />
              <span className="logos-orbit logos-orbit-two" />
              <span className="logos-sphere">Λ</span>
              <i className="logos-star star-one" />
              <i className="logos-star star-two" />
              <i className="logos-star star-three" />
              <i className="logos-star star-four" />
            </div>
          )}

          {(playerAction === "special-astrolabe" ||
            enemyAction === "special-astrolabe") && (
            <div
              className={`celestial-astrolabe ${
                enemyAction === "special-astrolabe" ? "astrolabe-from-enemy" : ""
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-astrolabe"
                    ? playerPosition
                    : enemyPosition
                }%`,
                "--hypatia-scale": HYPATIA_SCALE,
                "--astrolabe-travel": `${
                  playerAction === "special-astrolabe"
                    ? Math.max(16, enemyPosition - playerPosition) * 0.92
                    : -Math.max(16, enemyPosition - playerPosition) * 0.92
                }vw`,
                "--astrolabe-travel-near": `${
                  playerAction === "special-astrolabe"
                    ? Math.max(16, enemyPosition - playerPosition) * 0.74
                    : -Math.max(16, enemyPosition - playerPosition) * 0.74
                }vw`,
              } as CSSProperties}
            >
              <span className="astrolabe-flight-trail" />
              <span className="astrolabe-ring astrolabe-ring-one" />
              <span className="astrolabe-ring astrolabe-ring-two" />
              <span className="astrolabe-axis" />
              <span className="astrolabe-core">✷</span>
              <i className="astrolabe-star astrolabe-star-one" />
              <i className="astrolabe-star astrolabe-star-two" />
              <i className="astrolabe-star astrolabe-star-three" />
            </div>
          )}

          {(playerAction === "special-conics" ||
            enemyAction === "special-conics") && (
            <div
              className="conics-harmony"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-conics"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="conics-blueprint-grid" />
              <span className="conics-axis conics-axis-horizontal" />
              <span className="conics-axis conics-axis-vertical" />
              <span className="conics-slice-beam" />
              <svg
                className="conics-diagram"
                viewBox="0 0 420 420"
                aria-hidden="true"
              >
                <path
                  className="conic-stroke conic-cone"
                  d="M210 24 L62 378 M210 24 L358 378 M62 378 Q210 418 358 378"
                />
                <path
                  className="conic-stroke conic-cut"
                  d="M68 232 Q210 190 352 232 Q210 274 68 232 Z"
                />
                <ellipse
                  className="conic-stroke conic-result conic-result-ellipse"
                  cx="210"
                  cy="232"
                  rx="142"
                  ry="42"
                />
                <path
                  className="conic-stroke conic-result conic-result-parabola"
                  d="M64 354 Q210 66 356 354"
                />
                <path
                  className="conic-stroke conic-result conic-result-hyperbola"
                  d="M54 84 C174 146 174 274 54 336 M366 84 C246 146 246 274 366 336"
                />
              </svg>
              <span className="conics-label conics-label-ellipse">ELIPSE</span>
              <span className="conics-label conics-label-parabola">PARÁBOLA</span>
              <span className="conics-label conics-label-hyperbola">HIPÉRBOLE</span>
              <span className="conics-impact" />
              <span className="conics-strike conics-strike-one" />
              <span className="conics-strike conics-strike-two" />
              <span className="conics-strike conics-strike-three" />
              <span className="conics-proof">∎</span>
            </div>
          )}

          {(playerAction === "special-illumination" ||
            enemyAction === "special-illumination") && (
            <div
              className={`interior-illumination ${
                enemyAction === "special-illumination"
                  ? "illumination-from-enemy"
                  : ""
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-illumination"
                    ? playerPosition
                    : enemyPosition
                }%`,
                "--illumination-travel": `${
                  playerAction === "special-illumination"
                    ? Math.max(16, enemyPosition - playerPosition) * 0.92
                    : -Math.max(16, enemyPosition - playerPosition) * 0.92
                }vw`,
              } as CSSProperties}
            >
              <span className="illumination-heart">VERITAS</span>
              <span className="illumination-halo illumination-halo-one" />
              <span className="illumination-halo illumination-halo-two" />
              <span className="illumination-beam" />
              <span className="illumination-impact" />
            </div>
          )}

          {(playerAction === "special-city-of-god" ||
            enemyAction === "special-city-of-god") && (
            <div
              className="city-of-god"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-city-of-god"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="heavenly-city">
                <i className="city-tower city-tower-one" />
                <i className="city-tower city-tower-two" />
                <i className="city-tower city-tower-three" />
                <b>CIVITAS DEI</b>
              </span>
              <span className="earthly-city">
                <i className="earth-wall earth-wall-one" />
                <i className="earth-wall earth-wall-two" />
                <i className="earth-flame earth-flame-one" />
                <i className="earth-flame earth-flame-two" />
              </span>
              <span className="city-arc city-arc-left" />
              <span className="city-arc city-arc-right" />
              <span className="city-judgment" />
            </div>
          )}

          {(playerAction === "special-agent-intellect" ||
            enemyAction === "special-agent-intellect") && (
            <div
              className="agent-intellect"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-agent-intellect"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="intellect-halo" />
              <span className="intellect-core">عقل</span>
              <span className="intellect-line intellect-line-one" />
              <span className="intellect-line intellect-line-two" />
              <span className="intellect-line intellect-line-three" />
              <i className="intellect-node node-one" />
              <i className="intellect-node node-two" />
              <i className="intellect-node node-three" />
              <i className="intellect-node node-four" />
              <span className="intellect-impact" />
            </div>
          )}

          {(playerAction === "special-great-commentator" ||
            enemyAction === "special-great-commentator") && (
            <div
              className={`great-commentator-projectile ${
                enemyAction === "special-great-commentator"
                  ? "commentator-from-enemy"
                  : ""
              }`}
              aria-hidden="true"
              style={
                playerAction === "special-great-commentator"
                  ? ({
                      left: `${playerPosition + 4}%`,
                      "--commentator-travel": `${commentatorTravel}vw`,
                      "--commentator-travel-mid": `${commentatorTravel * 0.58}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 4}%`,
                      "--commentator-travel": `-${commentatorTravel}vw`,
                      "--commentator-travel-mid": `-${commentatorTravel * 0.58}vw`,
                    } as CSSProperties)
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/aristotle-bust.webp" alt="" />
              <span className="commentator-page page-one">Α</span>
              <span className="commentator-page page-two">λόγος</span>
              <span className="commentator-page page-three">causa</span>
              <span className="commentator-impact" />
            </div>
          )}

          {(playerAction === "special-dumb-ox" ||
            enemyAction === "special-dumb-ox") && (
            <div
              className={`dumb-ox-charge ${
                enemyAction === "special-dumb-ox" ? "ox-from-enemy" : ""
              }`}
              aria-hidden="true"
              style={
                playerAction === "special-dumb-ox"
                  ? ({
                      left: `${playerPosition + 4}%`,
                      "--ox-travel": `${oxTravel}vw`,
                      "--ox-travel-mid": `${oxTravel * 0.58}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 4}%`,
                      "--ox-travel": `-${oxTravel}vw`,
                      "--ox-travel-mid": `-${oxTravel * 0.58}vw`,
                    } as CSSProperties)
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/boi-mudo.webp" alt="" />
              <span className="ox-dust ox-dust-one" />
              <span className="ox-dust ox-dust-two" />
              <span className="ox-impact" />
            </div>
          )}

          {(playerAction === "special-first-mover" ||
            enemyAction === "special-first-mover") && (
            <div
              className="first-mover"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-first-mover"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="mover-orbit mover-orbit-one" />
              <span className="mover-orbit mover-orbit-two" />
              <span className="mover-orbit mover-orbit-three" />
              <span className="mover-sphere mover-sphere-one" />
              <span className="mover-sphere mover-sphere-two" />
              <span className="mover-sphere mover-sphere-three" />
              <span className="mover-axis" />
              <span className="mover-core">ACTUS</span>
              <span className="mover-impact" />
            </div>
          )}

          {(playerAction === "special-prince" ||
            enemyAction === "special-prince") && (
            <div
              className={`prince-charge ${
                enemyAction === "special-prince" ? "prince-from-enemy" : ""
              }`}
              aria-hidden="true"
              style={
                playerAction === "special-prince"
                  ? ({
                      left: `${playerPosition + 4}%`,
                      "--prince-travel": `${princeTravel}vw`,
                      "--prince-travel-mid": `${princeTravel * 0.58}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 4}%`,
                      "--prince-travel": `-${princeTravel}vw`,
                      "--prince-travel-mid": `-${princeTravel * 0.58}vw`,
                    } as CSSProperties)
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/principe.webp" alt="" />
              <span className="prince-speed speed-one" />
              <span className="prince-speed speed-two" />
              <span className="prince-sword-flash" />
              <span className="prince-impact" />
            </div>
          )}

          {(playerAction === "special-virtu-fortuna" ||
            enemyAction === "special-virtu-fortuna") && (
            <div
              className="virtu-fortuna"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-virtu-fortuna"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="fortuna-wheel">
                <i className="fortuna-rim" />
                {Array.from({ length: 8 }, (_, index) => (
                  <i
                    className="fortuna-spoke"
                    style={{ "--fortuna-angle": `${index * 45}deg` } as CSSProperties}
                    key={index}
                  />
                ))}
                <b>FORTUNA</b>
              </span>
              <span className="virtu-grasp">VIRTÙ</span>
              <span className="virtu-slash virtu-slash-one" />
              <span className="virtu-slash virtu-slash-two" />
              <span className="fortuna-impact" />
            </div>
          )}

          {(playerAction === "special-falling-bodies" ||
            enemyAction === "special-falling-bodies") && (
            <div
              className="falling-bodies"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-falling-bodies"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="falling-ball falling-ball-large" />
              <span className="falling-ball falling-ball-small" />
              <span className="falling-speed speed-large" />
              <span className="falling-speed speed-small" />
              <span className="falling-ground" />
              <span className="falling-impact" />
            </div>
          )}

          {(playerAction === "special-sidereal-messenger" ||
            enemyAction === "special-sidereal-messenger") && (
            <div
              className="sidereal-messenger"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-sidereal-messenger"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="jupiter">
                <i className="jupiter-band band-one" />
                <i className="jupiter-band band-two" />
                <i className="jupiter-storm" />
              </span>
              <span className="galilean-orbit orbit-io">
                <i className="galilean-moon moon-io" />
              </span>
              <span className="galilean-orbit orbit-europa">
                <i className="galilean-moon moon-europa" />
              </span>
              <span className="galilean-orbit orbit-ganymede">
                <i className="galilean-moon moon-ganymede" />
              </span>
              <span className="galilean-orbit orbit-callisto">
                <i className="galilean-moon moon-callisto" />
              </span>
              <span className="sidereal-crosshair" />
              <span className="sidereal-impact" />
            </div>
          )}

          {((selectedFighter === "descartes" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "descartes" &&
              enemyAction === "attack-combo")) && (
            <div
              className="cartesian-plane"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "descartes" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="cartesian-axis axis-x" />
              <span className="cartesian-axis axis-y" />
              <span className="cartesian-grid" />
              <i className="cartesian-point point-one" />
              <i className="cartesian-point point-two" />
              <i className="cartesian-point point-three" />
              <b className="cartesian-origin">0</b>
              <span className="cartesian-impact" />
            </div>
          )}

          {((selectedFighter === "locke" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "locke" &&
              enemyAction === "attack-combo")) && (
            <div
              className="sensation-spectrum"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "locke" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="sense sense-sight">OLHAR</span>
              <span className="sense sense-hearing">OUVIR</span>
              <span className="sense sense-touch">TOCAR</span>
              <span className="sense sense-smell">SENTIR</span>
              <span className="sense sense-taste">PROVAR</span>
              <i className="sensation-core">IDEIA</i>
              <span className="sensation-impact" />
            </div>
          )}

          {((selectedFighter === "hobbes" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "hobbes" &&
              enemyAction === "attack-combo")) && (
            <div
              className="social-contract"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "hobbes" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="contract-scroll">
                <i />
                <b>PACTO</b>
              </span>
              <span className="contract-chain chain-left" />
              <span className="contract-chain chain-right" />
              <span className="contract-seal">SOBERANO</span>
              <span className="contract-impact" />
            </div>
          )}

          {((selectedFighter === "rousseau" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "rousseau" &&
              enemyAction === "attack-combo")) && (
            <div
              className="natural-education"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "rousseau" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="nature-ring nature-ring-one" />
              <span className="nature-ring nature-ring-two" />
              <span className="nature-leaf leaf-one" />
              <span className="nature-leaf leaf-two" />
              <span className="nature-leaf leaf-three" />
              <b>EMÍLIO</b>
              <span className="nature-impact" />
            </div>
          )}

          {((selectedFighter === "smith" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "smith" &&
              enemyAction === "attack-combo")) && (
            <div
              className="division-of-labour"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "smith" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="pin-stage stage-one"><i />FIO</span>
              <span className="pin-stage stage-two"><i />CORTE</span>
              <span className="pin-stage stage-three"><i />PONTA</span>
              <span className="pin-stage stage-four"><i />CABEÇA</span>
              <span className="labour-line" />
              <span className="labour-impact" />
            </div>
          )}

          {((selectedFighter === "kant" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "kant" &&
              enemyAction === "attack-combo")) && (
            <div
              className="phenomenal-attack"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "kant" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="phenomenal-sense">SENSIBILIDADE</span>
              <span className="phenomenal-category">ENTENDIMENTO</span>
              <span className="phenomenal-ring ring-space" />
              <span className="phenomenal-ring ring-time" />
              <b>FENÔMENO</b>
              <span className="phenomenal-impact" />
            </div>
          )}

          {((selectedFighter === "hegel" &&
            playerAction === "attack-combo") ||
            (opponentFighter === "hegel" &&
              enemyAction === "attack-combo")) && (
            <div
              className="recognition-struggle"
              aria-hidden="true"
              style={{
                left: `${
                  selectedFighter === "hegel" &&
                  playerAction === "attack-combo"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="recognition-figure figure-master">SENHOR</span>
              <span className="recognition-link" />
              <span className="recognition-figure figure-bondsman">ESCRAVO</span>
              <span className="recognition-reversal">RECONHECIMENTO</span>
              <span className="recognition-impact" />
            </div>
          )}

          {(playerAction === "special-evil-genius" ||
            enemyAction === "special-evil-genius") && (
            <div
              className="evil-genius"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-evil-genius"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="evil-shadow">
                <i className="evil-eye eye-left" />
                <i className="evil-eye eye-right" />
              </span>
              <span className="doubt-ring doubt-ring-one" />
              <span className="doubt-ring doubt-ring-two" />
              <span className="doubt-fragment fragment-one">?</span>
              <span className="doubt-fragment fragment-two">?</span>
              <span className="doubt-fragment fragment-three">?</span>
              <span className="evil-impact" />
            </div>
          )}

          {(playerAction === "special-cogito" ||
            enemyAction === "special-cogito") && (
            <div
              className="cogito-certainty"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-cogito"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="cogito-ray ray-one" />
              <span className="cogito-ray ray-two" />
              <span className="cogito-ray ray-three" />
              <span className="cogito-orbit orbit-one" />
              <span className="cogito-orbit orbit-two" />
              <span className="cogito-core">
                <b>COGITO</b>
                <i>ERGO SUM</i>
              </span>
              <span className="cogito-impact" />
            </div>
          )}

          {(playerAction === "special-tabula-rasa" ||
            enemyAction === "special-tabula-rasa") && (
            <div
              className="tabula-rasa"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-tabula-rasa"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="blank-page">
                <i className="page-mark mark-eye">◉</i>
                <i className="page-mark mark-wave">∿</i>
                <i className="page-mark mark-hand">✋</i>
                <b>TABULA RASA</b>
              </span>
              <span className="experience-ray experience-ray-one" />
              <span className="experience-ray experience-ray-two" />
              <span className="experience-ray experience-ray-three" />
              <span className="tabula-impact" />
            </div>
          )}

          {(playerAction === "special-natural-rights" ||
            enemyAction === "special-natural-rights") && (
            <div
              className="natural-rights"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-natural-rights"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="right-seal seal-life">VIDA</span>
              <span className="right-seal seal-liberty">LIBERDADE</span>
              <span className="right-seal seal-property">PROPRIEDADE</span>
              <span className="consent-ring" />
              <span className="rights-core">CONSENTIMENTO</span>
              <span className="rights-impact" />
            </div>
          )}

          {(playerAction === "special-wolf" ||
            enemyAction === "special-wolf") && (
            <div
              className={`hobbes-wolf-charge ${
                enemyAction === "special-wolf" ? "enemy-wolf-charge" : ""
              }`}
              aria-hidden="true"
              style={
                playerAction === "special-wolf"
                  ? ({
                      left: `${playerPosition + 5}%`,
                      "--wolf-travel": `${dogTravel}vw`,
                      "--wolf-travel-mid": `${dogTravel * 0.58}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 5}%`,
                      "--wolf-travel": `-${dogTravel}vw`,
                      "--wolf-travel-mid": `-${dogTravel * 0.58}vw`,
                    } as CSSProperties)
              }
            >
              <HobbesWolfAura />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/hobbes-wolf-hq-v2.webp?v=2.9.1" alt="" />
            </div>
          )}

          {selectedFighter === "hobbes" && playerAction === "special-leviathan" && <HobbesSovereign origin={playerPosition} target={enemyPosition} />}
          {opponentFighter === "hobbes" && enemyAction === "special-leviathan" && <HobbesSovereign origin={enemyPosition} target={playerPosition} enemy />}

          {(playerAction === "special-noble-savage" ||
            enemyAction === "special-noble-savage") && (
            <div
              className={`noble-savage-rush ${
                enemyAction === "special-noble-savage"
                  ? "enemy-savage-rush"
                  : ""
              }`}
              aria-hidden="true"
              style={
                playerAction === "special-noble-savage"
                  ? ({
                      left: `${playerPosition + 5}%`,
                      "--savage-travel": `${dogTravel}vw`,
                      "--savage-travel-mid": `${dogTravel * 0.58}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 5}%`,
                      "--savage-travel": `-${dogTravel}vw`,
                      "--savage-travel-mid": `-${dogTravel * 0.58}vw`,
                    } as CSSProperties)
              }
            >
              <span className="savage-body" />
              <span className="savage-leaf savage-leaf-one" />
              <span className="savage-leaf savage-leaf-two" />
              <span className="savage-leaf savage-leaf-three" />
              <span className="savage-impact" />
            </div>
          )}

          {chainBursts.map(burst => <RousseauBrokenChains key={burst.id} position={burst.position} />)}
          {selectedFighter === "rousseau" && playerAction === "special-general-will" && <RousseauAssembly position={playerPosition} />}
          {opponentFighter === "rousseau" && enemyAction === "special-general-will" && <RousseauAssembly position={enemyPosition} />}

          {(playerAction === "special-general-will" ||
            enemyAction === "special-general-will") && (
            <div
              className="general-will"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-general-will"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="general-will-ring" />
              <b>VONTADE GERAL</b>
              <span className="general-will-impact" />
            </div>
          )}

          {(playerAction === "special-invisible-hand" ||
            enemyAction === "special-invisible-hand") && (
            <div
              className={`invisible-hand ${
                enemyAction === "special-invisible-hand" ? "enemy-invisible-hand" : ""
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-invisible-hand"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="market-hand-art"
                src="/game/adam-smith-invisible-hand.webp?v=3.1"
                alt=""
              />
              <span className="exchange-orbit orbit-a"><i /></span>
              <span className="exchange-orbit orbit-b"><i /></span>
              <b>MÃO INVISÍVEL</b>
              <span className="invisible-impact" />
            </div>
          )}

          {playerAction === "special-wealth-of-nations" && <SmithSpecial key={`smith-wealth-player-${attackSequence.current.player}`} kind="wealth" target={enemyPosition} clock={combatClock.current} />}
          {enemyAction === "special-wealth-of-nations" && <SmithSpecial key={`smith-wealth-enemy-${attackSequence.current.enemy}`} kind="wealth" target={playerPosition} clock={combatClock.current} />}

          {(playerAction === "special-categorical-imperative" ||
            enemyAction === "special-categorical-imperative") && (
            <div
              className="categorical-imperative"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-categorical-imperative"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/kant-categorical-sigil.webp?v=3.2" alt="" />
              <span className="imperative-maxim">MÁXIMA</span>
              <span className="imperative-law">LEI UNIVERSAL</span>
              <span className="imperative-person">FIM EM SI</span>
              <span className="imperative-impact" />
            </div>
          )}

          {(playerAction === "special-sublime" ||
            enemyAction === "special-sublime") && (
            <div className="kant-sublime" aria-hidden="true">
              <span className="sublime-sky" />
              <span className="sublime-constellation constellation-one" />
              <span className="sublime-constellation constellation-two" />
              <span className="sublime-constellation constellation-three" />
              <span className="sublime-horizon" />
              <span className="sublime-reason">RAZÃO</span>
              <b>O SUBLIME</b>
              <span
                className="sublime-impact"
                style={{
                  left: `${
                    playerAction === "special-sublime"
                      ? enemyPosition
                      : playerPosition
                  }%`,
                }}
              />
            </div>
          )}

          {(playerAction === "special-dialectic" ||
            enemyAction === "special-dialectic") && (
            <div
              className="hegel-dialectic"
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-dialectic"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="dialectic-moment moment-determination">
                DETERMINAÇÃO
              </span>
              <span className="dialectic-moment moment-contradiction">
                CONTRADIÇÃO
              </span>
              <span className="dialectic-orbit orbit-blue" />
              <span className="dialectic-orbit orbit-red" />
              <span className="dialectic-core">AUFHEBUNG</span>
              <b>DIALÉTICA</b>
              <span className="dialectic-impact" />
            </div>
          )}

          {playerAction === "special-world-spirit" && <HegelWorldSpirit origin={playerPosition} target={enemyPosition} paused={hitstop} clock={combatClock.current} />}
          {enemyAction === "special-world-spirit" && <HegelWorldSpirit origin={enemyPosition} target={playerPosition} enemy paused={hitstop} clock={combatClock.current} />}
          {hegelImpact && <>
            <div key={`hegel-impact-${hegelImpact.id}`} className="hegel-world-impact" style={{"--hegel-hit-x":`${hegelImpact.position}%`} as CSSProperties} aria-hidden="true" />
            <div key={`hegel-banner-${hegelImpact.id}`} className="hegel-world-banner" aria-hidden="true">ESPÍRITO DO TEMPO!</div>
          </>}

          {(playerAction === "special-blind-will" ||
            enemyAction === "special-blind-will") && (
            <div
              className={`blind-will ${
                enemyAction === "special-blind-will" ? "enemy-blind-will" : ""
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-blind-will"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              <span className="will-void" />
              <span className="will-tendril tendril-one" />
              <span className="will-tendril tendril-two" />
              <span className="will-tendril tendril-three" />
              <span className="will-eye eye-left" />
              <span className="will-eye eye-right" />
              <b>VONTADE CEGA</b>
              <span className="will-impact" />
            </div>
          )}

          {playerAction === "special-suffering-pendulum" && <SchopenhauerPendulum target={enemyPosition} contact={schopenhauerImpact?.position} clock={combatClock.current} paused={hitstop} />}
          {enemyAction === "special-suffering-pendulum" && <SchopenhauerPendulum target={playerPosition} contact={schopenhauerImpact?.position} clock={combatClock.current} paused={hitstop} />}
          {schopenhauerImpact && <div key={schopenhauerImpact.id} className="schopenhauer-pendulum-hit" style={{"--schopenhauer-hit-x":`${schopenhauerImpact.position}%`} as CSSProperties} aria-hidden="true" />}

          {(playerAction === "special-engels" ||
            enemyAction === "special-engels") && (
            <div
              className={`engels-assist ${
                enemyAction === "special-engels"
                  ? "engels-from-enemy"
                  : "engels-from-player"
              }`}
              aria-hidden="true"
              style={{
                left: `${
                  playerAction === "special-engels"
                    ? enemyPosition
                    : playerPosition
                }%`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/engels-assist-hq.webp?v=3.6" alt="" />
              <span className="engels-manuscript">MANIFESTO</span>
              <span className="engels-impact" />
            </div>
          )}

          {(playerAction === "special-proletarian-revolution" ||
            enemyAction === "special-proletarian-revolution") && (
            <div
              className={`proletarian-revolution ${
                enemyAction === "special-proletarian-revolution"
                  ? "revolution-from-enemy"
                  : "revolution-from-player"
              }`}
              aria-hidden="true"
            >
              <span className="revolution-smoke" />
              <span className="workers-front">
                {Array.from({ length: 18 }, (_, index) => (
                  <i key={index} />
                ))}
              </span>
              <span className="revolution-banner">PROLETÁRIOS, UNI-VOS!</span>
              <span className="revolution-wave" />
              <span
                className="revolution-impact"
                style={{
                  left: `${
                    playerAction === "special-proletarian-revolution"
                      ? enemyPosition
                      : playerPosition
                  }%`,
                }}
              />
            </div>
          )}

          {playerAction === "special-dream-interpretation" && <FreudDreamMist target={enemyPosition} clock={combatClock.current} />}
          {enemyAction === "special-dream-interpretation" && <FreudDreamMist target={playerPosition} clock={combatClock.current} />}

          {darwinNaturalSelectionActive && (
            <div
              className="darwin-natural-selection"
              aria-hidden="true"
              style={
                {
                  "--darwin-origin": `${
                    darwinEffectFromPlayer
                      ? playerPosition + 3
                      : enemyPosition - 3
                  }%`,
                  "--darwin-travel": `${
                    darwinEffectFromPlayer
                      ? finchTravel
                      : -finchTravel
                  }vw`,
                  "--darwin-facing":
                    darwinEffectFromPlayer ? 1 : -1,
                  "--darwin-target": `${
                    darwinEffectFromPlayer
                      ? enemyPosition
                      : playerPosition
                  }%`,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/darwin-finches-hq.webp?v=3.8.1" alt="" />
              <span className="darwin-selection-impact" />
              <b>SELEÇÃO NATURAL</b>
            </div>
          )}

          {darwinTreeActive && (
            <div
              className="darwin-tree-of-life"
              aria-hidden="true"
              style={
                {
                  "--darwin-target": `${
                    darwinEffectFromPlayer
                      ? enemyPosition
                      : playerPosition
                  }%`,
                } as CSSProperties
              }
            >
              <span className="darwin-tree-aura" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/darwin-tree-of-life-hq.webp?v=3.8.1" alt="" />
              <span className="darwin-tree-impact" />
              <b>ÁRVORE DA VIDA</b>
            </div>
          )}

          {selectedFighter === "kierkegaard" && (playerAction === "special-anxiety" || playerAction === "special-faith-leap") && <KierkegaardSpecial kind={playerAction === "special-faith-leap" ? "faith" : "anxiety"} origin={faithLeaps.current.player?.origin ?? playerPosition} landing={faithLeaps.current.player?.landing ?? playerPosition} target={enemyPosition} clock={combatClock.current} started={playerAction === "special-faith-leap" ? faithLeaps.current.player?.started : undefined} />}
          {opponentFighter === "kierkegaard" && (enemyAction === "special-anxiety" || enemyAction === "special-faith-leap") && <KierkegaardSpecial kind={enemyAction === "special-faith-leap" ? "faith" : "anxiety"} origin={faithLeaps.current.enemy?.origin ?? enemyPosition} landing={faithLeaps.current.enemy?.landing ?? enemyPosition} target={playerPosition} clock={combatClock.current} started={enemyAction === "special-faith-leap" ? faithLeaps.current.enemy?.started : undefined} />}
          {kierkegaardImpact && <KierkegaardImpact key={kierkegaardImpact.id} kind={kierkegaardImpact.kind} position={kierkegaardImpact.position} clock={combatClock.current} />}



          {(selectedFighter === "foucault" || opponentFighter === "foucault") && <FoucaultEffects
            player={selectedFighter === "foucault"} enemy={opponentFighter === "foucault"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            watched={watched} docile={docile} contact={foucaultImpact} clock={combatClock.current} finishing={phase === "finishing"} />}
          {(selectedFighter === "fanon" || opponentFighter === "fanon") && <FanonEffects
            player={selectedFighter === "fanon"} enemy={opponentFighter === "fanon"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={fanonImpact} clock={combatClock.current} finishing={phase === "finishing"} />}
          {(selectedFighter === "paulo-freire" || opponentFighter === "paulo-freire") && <FreireEffects
            player={selectedFighter === "paulo-freire"} enemy={opponentFighter === "paulo-freire"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={freireImpact} clock={combatClock.current} finishing={phase === "finishing"} />}
          {(selectedFighter === "beauvoir" || opponentFighter === "beauvoir") && <BeauvoirEffects
            player={selectedFighter === "beauvoir"} enemy={opponentFighter === "beauvoir"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={beauvoirImpact} clock={combatClock.current} finishing={phase === "finishing"} />}
          {(selectedFighter === "arendt" || opponentFighter === "arendt") && <ArendtEffects
            player={selectedFighter === "arendt"} enemy={opponentFighter === "arendt"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={arendtImpact} clock={combatClock.current} finishing={phase === "finishing"} />}

          {(selectedFighter === "wittgenstein" || opponentFighter === "wittgenstein") && <WittgensteinEffects
            player={selectedFighter === "wittgenstein"} enemy={opponentFighter === "wittgenstein"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={wittContact} clock={combatClock.current} />}
          {silenced.player && <span className="witt-silence-status" style={{left:`${playerPosition}%`}}>SILENCIADO!</span>}
          {silenced.enemy && <span className="witt-silence-status" style={{left:`${enemyPosition}%`}}>SILENCIADO!</span>}

          {(arenaEffect === "angela-davis-chains" || arenaEffect === "angela-davis-struggle") && (
            <div
              className={`angela-effect ${arenaEffect}`}
              style={{
                "--angela-origin": `${angelaDavisOrigin}%`,
                "--angela-target": `${angelaDavisTarget}%`,
                "--angela-path-left": `${Math.min(angelaDavisOrigin, angelaDavisTarget)}%`,
                "--angela-path-width": `${Math.abs(angelaDavisTarget - angelaDavisOrigin)}%`,
                "--angela-travel": `${angelaDavisTarget - angelaDavisOrigin}vw`,
                "--angela-travel-mid": `${(angelaDavisTarget - angelaDavisOrigin) * .58}vw`,
              } as CSSProperties}
              aria-hidden="true"
            >
              {arenaEffect === "angela-davis-chains" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="angela-broken-chain"
                    src="/game/angela-davis-broken-chain-hq.webp?v=4.5.1"
                    alt=""
                  />
                  <span className="angela-chain-impact" />
                  <b>CORRENTES ROMPIDAS</b>
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`angela-panther ${angelaDavisEffectFromPlayer ? "" : "enemy-panther"}`}
                    src="/game/angela-davis-panther-hq.webp?v=4.5.1"
                    alt=""
                  />
                  <span className="angela-struggle-impact" />
                  <b>A LIBERDADE É UMA LUTA CONSTANTE</b>
                </>
              )}
            </div>
          )}


          {(arenaEffect === "krenak-world" || arenaEffect === "krenak-watu") && (
            <div
              className={`krenak-effect ${arenaEffect}`}
              style={{
                "--krenak-origin": `${krenakOrigin}%`,
                "--krenak-target": `${krenakTarget}%`,
                "--krenak-travel": `${krenakTarget - krenakOrigin}vw`,
                "--krenak-travel-mid": `${(krenakTarget - krenakOrigin) * .58}vw`,
              } as CSSProperties}
              aria-hidden="true"
            >
              {arenaEffect === "krenak-world" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="krenak-earth"
                    src="/game/krenak-earth-hq.webp?v=4.9"
                    alt=""
                  />
                  <span className="krenak-earth-impact" />
                  <b>IDEIAS PARA ADIAR O FIM DO MUNDO</b>
                </>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={`krenak-watu-wave ${krenakEffectFromPlayer ? "" : "enemy-wave"}`}
                    src="/game/krenak-watu-hq.webp?v=4.9"
                    alt=""
                  />
                  <span className="krenak-watu-impact" />
                  <b>WATU RESISTE</b>
                </>
              )}
            </div>
          )}

          {(arenaEffect === "turing-enigma" || arenaEffect === "turing-universal-machine") && (
            <div
              className={`turing-effect ${arenaEffect}`}
              style={{
                "--turing-origin": `${turingOrigin}%`,
                "--turing-target": `${turingTarget}%`,
                "--turing-facing": turingEffectFromPlayer ? 1 : -1,
              } as CSSProperties}
              aria-hidden="true"
            >
              {arenaEffect === "turing-enigma" ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="turing-enigma-rotors"
                    src="/game/turing-enigma-rotors-hq.webp?v=4.11"
                    alt=""
                  />
                  <span className="turing-enigma-impact" />
                  <b>QUEBRA DO ENIGMA</b>
                </>
              ) : (
                <>
                  {phase !== "finishing" && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      className="turing-computer"
                      src="/game/turing-computer-hq.webp?v=4.11"
                      alt=""
                    />
                  )}
                  <span className="turing-target-lock">01</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="turing-digital-explosion"
                    src="/game/turing-digital-explosion-hq.webp?v=4.11"
                    alt=""
                  />
                  <b>MÁQUINA UNIVERSAL</b>
                </>
              )}
            </div>
          )}

          {selectedFighter === "deleuze" && playerAction === "special-mille-plateaux" && <DeleuzeGuattari origin={playerPosition} target={enemyPosition} clock={combatClock.current}/>}
          {opponentFighter === "deleuze" && enemyAction === "special-mille-plateaux" && <DeleuzeGuattari origin={enemyPosition} target={playerPosition} clock={combatClock.current} enemy/>}
          {(selectedFighter === "deleuze" || opponentFighter === "deleuze") && <DeleuzeEffects
            player={selectedFighter === "deleuze"} enemy={opponentFighter === "deleuze"}
            playerAction={playerAction} enemyAction={enemyAction} playerPosition={playerPosition} enemyPosition={enemyPosition}
            playerSequence={attackSequence.current.player} enemySequence={attackSequence.current.enemy}
            contact={deleuzeImpact} clock={combatClock.current} finishing={phase === "finishing"} />}

          {(arenaEffect === "felipe-doubt" || arenaEffect === "felipe-thinker") && (
            <div className={`felipe-effect ${arenaEffect}`} aria-hidden="true" style={{
              "--felipe-origin": `${felipeEffect.origin}%`, "--felipe-target": `${felipeEffect.target}%`, "--felipe-facing": felipeEffect.facing,
            } as CSSProperties}>
              {arenaEffect === "felipe-doubt" ? <>
                <span className="felipe-question">?</span><span className="felipe-question-impact">?</span>
              </> : [0, 1, 2, 3, 4].map(index => (
                <span className={`felipe-owl owl-${index}`} key={index} style={{ "--owl-delay": `${index * 95}ms`, "--owl-altitude": `${12 + index * 5}%` } as CSSProperties}>
                  <FelipeOwl />
                </span>
              ))}
            </div>
          )}

          {!showGrandFinalFight && (arenaEffect === "superintelligence-algorithm" || arenaEffect === "superintelligence-noosphere") && (
            <div
              className={`superintelligence-effect ${arenaEffect}`}
              style={{
                "--super-origin": `${superintelligenceOrigin}%`,
                "--super-target": `${superintelligenceTarget}%`,
                "--super-facing": superintelligenceEffectFromPlayer ? 1 : -1,
              } as CSSProperties}
              aria-hidden="true"
            >
              {arenaEffect === "superintelligence-algorithm" ? (
                <>
                  <span className="super-prediction-field">
                    {Array.from({ length: 7 }, (_, index) => (
                      <i className={`prediction-${index + 1}`} key={`prediction-${index + 1}`} />
                    ))}
                  </span>
                  <span className="super-target-lock"><i>Ω</i></span>
                  <span className="super-algorithm-strike" />
                  <b>ALGORITMO SUPREMO</b>
                </>
              ) : (
                <>
                  <span className="super-thought-orbit">
                    {["Π", "Σ", "∞", "01", "Ψ", "⚖", "Δ", "Λ", "W", "D", "P", "Ω"].map((symbol, index) => (
                      <i key={`${symbol}-${index}`}>{symbol}</i>
                    ))}
                  </span>
                  <span
                    className="super-knowledge-beam"
                    style={{
                      left: `${Math.min(superintelligenceOrigin, superintelligenceTarget)}%`,
                      width: `${Math.abs(superintelligenceTarget - superintelligenceOrigin)}%`,
                    }}
                  />
                  <span className="super-noosphere-storm">
                    <i /><i /><i /><i /><i />
                  </span>
                  <b>SOBRECARGA DA NOOSFERA</b>
                </>
              )}
            </div>
          )}

          {olympeDeclarationActive && (
            <div
              className="olympe-declaration"
              aria-hidden="true"
              style={
                {
                  "--olympe-origin": `${
                    olympeEffectFromPlayer
                      ? playerPosition + 3
                      : enemyPosition - 3
                  }%`,
                  "--olympe-travel": `${
                    olympeEffectFromPlayer
                      ? declarationTravel
                      : -declarationTravel
                  }vw`,
                  "--olympe-facing": olympeEffectFromPlayer ? 1 : -1,
                  "--olympe-target": `${
                    olympeEffectFromPlayer
                      ? enemyPosition
                      : playerPosition
                  }%`,
                } as CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/olympe-declaration-vfx.webp?v=3.9" alt="" />
              <span className="olympe-declaration-impact" />
              <b>DECLARAÇÃO DOS DIREITOS DA MULHER</b>
            </div>
          )}

          {olympeTribuneActive && (
            <div
              className="olympe-tribune"
              aria-hidden="true"
              style={
                {
                  "--olympe-target": `${
                    olympeEffectFromPlayer
                      ? enemyPosition
                      : playerPosition
                  }%`,
                } as CSSProperties
              }
            >
              <span className="olympe-tribune-aura" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/game/olympe-tribune-vfx.webp?v=3.9" alt="" />
              <span className="olympe-tribune-impact" />
              <b>DO CADAFALSO À TRIBUNA</b>
            </div>
          )}

          {playerAction === "special-death-drive" && <FreudDeathWave origin={playerPosition} target={enemyPosition} contact={freudImpact?.position} clock={combatClock.current} />}
          {enemyAction === "special-death-drive" && <FreudDeathWave origin={enemyPosition} target={playerPosition} contact={freudImpact?.position} clock={combatClock.current} />}

          {(playerAction === "special-dog" ||
            enemyAction === "special-dog") && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className={`diogenes-dog-charge ${
                enemyAction === "special-dog" ? "enemy-dog-charge" : ""
              }`}
              src="/game/diogenes-dog.webp"
              alt=""
              aria-hidden="true"
              style={
                playerAction === "special-dog"
                  ? ({
                      left: `${playerPosition + 5}%`,
                      "--dog-travel": `${dogTravel}vw`,
                      "--dog-travel-34": `${dogTravel * 0.34}vw`,
                      "--dog-travel-58": `${dogTravel * 0.58}vw`,
                      "--dog-travel-86": `${dogTravel * 0.86}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 5}%`,
                      "--dog-travel": `-${dogTravel}vw`,
                      "--dog-travel-34": `-${dogTravel * 0.34}vw`,
                      "--dog-travel-58": `-${dogTravel * 0.58}vw`,
                      "--dog-travel-86": `-${dogTravel * 0.86}vw`,
                    } as CSSProperties)
              }
            />
          )}

          {(playerAction === "special-chicken" ||
            enemyAction === "special-chicken") && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className={`diogenes-chicken-throw ${
                enemyAction === "special-chicken"
                  ? "enemy-chicken-throw"
                  : ""
              }`}
              src="/game/diogenes-chicken.webp"
              alt=""
              aria-hidden="true"
              style={
                playerAction === "special-chicken"
                  ? ({
                      left: `${playerPosition + 4}%`,
                      "--chicken-origin": "0%",
                      "--chicken-facing": "1",
                      "--chicken-travel-42": `${chickenTravel * 0.42}vw`,
                      "--chicken-travel-72": `${chickenTravel * 0.72}vw`,
                      "--chicken-travel": `${chickenTravel}vw`,
                    } as CSSProperties)
                  : ({
                      left: `${enemyPosition - 4}%`,
                      "--chicken-origin": "-100%",
                      "--chicken-facing": "-1",
                      "--chicken-travel-42": `-${chickenTravel * 0.42}vw`,
                      "--chicken-travel-72": `-${chickenTravel * 0.72}vw`,
                      "--chicken-travel": `-${chickenTravel}vw`,
                    } as CSSProperties)
              }
            />
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`combat-message ${message.side} ${message.kind} ${message.text === "+15 COERÊNCIA" ? "marcus-heal" : ""}`}
            >
              {message.text}
            </div>
          ))}

          {combo > 1 && phase === "playing" && (
            <div className="combo-counter" aria-live="polite">
              <strong>{combo}×</strong>
              <span>
                {selectedFighter === "plato"
                  ? "SEQUÊNCIA DIALÉTICA"
                  : selectedFighter === "amenemope"
                    ? "PALAVRA MEDIDA"
                    : selectedFighter === "homero"
                      ? "CANTO HEROICO"
                      : selectedFighter === "tales"
                        ? "CICLO DA NATUREZA"
                      : selectedFighter === "socrates"
                        ? "EXAME SOCRÁTICO"
                      : selectedFighter === "diogenes"
                        ? "FRANQUEZA CÍNICA"
                      : selectedFighter === "aristotle"
                        ? "CADEIA CAUSAL"
                      : selectedFighter === "sidarta"
                        ? "CAMINHO DO DESPERTAR"
                      : selectedFighter === "confucius"
                        ? "CULTIVO DA VIRTUDE"
                      : selectedFighter === "marcus"
                        ? "DOMÍNIO DE SI"
                      : selectedFighter === "hypatia"
                        ? "DEMONSTRAÇÃO GEOMÉTRICA"
                      : selectedFighter === "agostinho"
                        ? "EXAME INTERIOR"
                      : selectedFighter === "averroes"
                        ? "CADEIA DEMONSTRATIVA"
                      : selectedFighter === "thomas"
                        ? "POTÊNCIA EM ATO"
                      : selectedFighter === "machiavelli"
                        ? "RAZÃO DE ESTADO"
                      : selectedFighter === "galileo"
                        ? "CADEIA EXPERIMENTAL"
                      : selectedFighter === "descartes"
                        ? "COORDENADAS DA DÚVIDA"
                      : selectedFighter === "locke"
                        ? "CADEIA DA EXPERIÊNCIA"
                      : selectedFighter === "hobbes"
                        ? "CORRENTE DO PACTO"
                      : selectedFighter === "rousseau"
                        ? "IMPULSO NATURAL"
                      : selectedFighter === "smith"
                        ? "CADEIA PRODUTIVA"
                      : selectedFighter === "kant"
                        ? "SÍNTESE TRANSCENDENTAL"
                      : selectedFighter === "hegel"
                        ? "NEGAÇÃO DETERMINADA"
                      : selectedFighter === "schopenhauer"
                        ? "SEQUÊNCIA DA BENGALA"
                      : selectedFighter === "marx"
                        ? "PRÁXIS REVOLUCIONÁRIA"
                      : selectedFighter === "freud"
                        ? "RETORNO DO INCONSCIENTE"
                      : selectedFighter === "darwin"
                        ? "CADEIA EVOLUTIVA"
                      : selectedFighter === "olympe"
                        ? "DECLARAÇÃO REVOLUCIONÁRIA"
                      : selectedFighter === "kierkegaard"
                        ? "OU... OU!"
                      : selectedFighter === "beauvoir"
                        ? "ÉTICA DA AMBIGUIDADE"
                      : selectedFighter === "foucault"
                        ? "GENEALOGIA DO PODER"
                      : selectedFighter === "arendt"
                        ? "VITA ACTIVA"
                      : selectedFighter === "wittgenstein"
                        ? "ESCADA DO TRACTATUS"
                      : selectedFighter === "angela-davis"
                        ? "MULHERES, RAÇA E CLASSE"
                      : selectedFighter === "paulo-freire"
                        ? "AÇÃO–REFLEXÃO–AÇÃO"
                      : selectedFighter === "fanon"
                        ? "LIBERTAÇÃO"
                      : selectedFighter === "krenak"
                        ? "ALIANÇA COM A NATUREZA"
                      : selectedFighter === "turing"
                        ? "SEQUÊNCIA BINÁRIA"
                      : selectedFighter === "felipe" ? "DEBATE ABERTO" : "SEQUÊNCIA DA VONTADE"}
              </span>
            </div>
          )}

          <div className={`impact impact-player ${playerAction === "hit" ? "show" : ""}`} />
          <div className={`impact impact-enemy ${enemyAction === "hit" ? "show" : ""}`} />

          {phase === "finishing" && (
            <div className={`finish-banner finish-${finisher}`}>
              <small>ARGUMENTO DECISIVO</small>
              <strong>FINISH!</strong>
            </div>
          )}
        </div>

        {phase === "intro" && (
          <button
            className="title-screen"
            type="button"
            onClick={openModeMenu}
            aria-label="Entrar no Philo Kombat"
          >
            <span className="title-atmosphere" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="title-content">
              <span className="philo-logo" aria-hidden="true">
                <span className="logo-symbol">Φ</span>
                <span className="logo-type">
                  <span className="logo-word logo-philo">PHILO</span>
                  <span className="logo-divider" />
                  <span className="logo-word logo-kombat">KOMBAT</span>
                </span>
              </span>
              <span className="title-slogan">
                UM COMBATE ENTRE IDEIAS FILOSÓFICAS
              </span>
              <span className="title-credit">
                DESENVOLVIDO PELO PROF. FELIPE CAMARGO
              </span>
              <span className="title-enter" aria-hidden="true">
                <span className="enter-desktop">APERTE ESPAÇO PARA CONTINUAR</span>
                <span className="enter-mobile">TOQUE NA TELA PARA CONTINUAR</span>
              </span>
            </span>
          </button>
        )}

        {phase === "mode-select" && (
          <div className="overlay mode-select-overlay">
            <div className="mode-select-panel">
              <span className="eyebrow">ESCOLHA SEU CAMINHO</span>
              <h2>ENTRE NA ARENA DAS IDEIAS</h2>
              <p>
                Dispute livremente com todo o elenco ou atravesse a história
                da filosofia ao lado do professor Felipe.
              </p>
              <div className="mode-cards">
                <button type="button" onClick={openSelection}>
                  <small>JOGO ORIGINAL</small>
                  <strong>MODO VERSUS</strong>
                  <span>Escolha dois lutadores e dispute uma melhor de três.</span>
                </button>
                <button type="button" onClick={openStoryIntro}>
                  <small>CAMPANHA</small>
                  <strong>MODO HISTÓRIA</strong>
                  <span>Guie Felipe pelas jornadas Discípulo, Doutor e Grande Filósofo.</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {phase === "story-intro" && (
          <button
            key={storyIntroIndex}
            className={`story-intro-player ${storyIntroExiting ? "is-exiting" : ""}`}
            type="button"
            onClick={nextStoryIntroScene}
            aria-label={`Avançar cena ${storyIntroIndex + 1} de ${activeIntroScenes.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={storyIntroScene.image} alt={storyIntroScene.alt} decoding="async" fetchPriority="high" />
            {storyCampaign === "grand" && GRAND_INTRO_SCENES[storyIntroIndex]?.caption && (
              <span className="grand-intro-caption">{GRAND_INTRO_SCENES[storyIntroIndex].caption}</span>
            )}
          </button>
        )}

        {phase === "story-recap" && (
          <button
            key={storySceneStep}
            className="story-intro-player"
            type="button"
            onClick={nextStoryRecapScene}
            aria-label={`Avançar cena após ${FIGHTERS[activeStoryEncounters[storyIndex].opponent as FighterId].name} ${storySceneStep + 1} de ${storyRecapScenes.length}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storyRecapScenes[storySceneStep].image}
              alt={storyRecapScenes[storySceneStep].alt}
              decoding="async"
              fetchPriority="high"
            />
          </button>
        )}

        {(phase === "story-intro" || phase === "story-recap") && (
          <nav className="story-art-navigation" aria-label="Navegação das artes do modo História">
            <button
              type="button"
              onClick={previousStoryArt}
              disabled={(phase === "story-intro" ? storyIntroIndex : storySceneStep) === 0 || storyIntroExiting}
              aria-label="Voltar para a arte anterior"
              aria-keyshortcuts="ArrowLeft"
            >
              Voltar
            </button>
            <span className="story-art-count" role="status" aria-live="polite" aria-atomic="true">
              Arte {(phase === "story-intro" ? storyIntroIndex : storySceneStep) + 1} de {phase === "story-intro" ? activeIntroScenes.length : storyRecapScenes.length}
            </span>
            <button
              type="button"
              onClick={phase === "story-intro" ? nextStoryIntroScene : nextStoryRecapScene}
              disabled={storyIntroExiting}
              aria-label="Avançar para a próxima arte ou continuar a história"
              aria-keyshortcuts="ArrowRight"
            >
              {(phase === "story-intro" ? storyIntroIndex >= activeIntroScenes.length - 1 : storySceneStep >= storyRecapScenes.length - 1) ? "Continuar" : "Avançar"}
            </button>
          </nav>
        )}

        {phase === "story-quiz" && storyQuiz && (
          <StoryQuizTerminal quiz={storyQuiz}
            philosopherName={FIGHTERS[storyQuiz.questions[storyQuiz.index].philosopher as FighterId].name}
            onAnswer={answerQuiz} onContinue={continueQuiz} />
        )}

        {phase === "story-tier-select" && (
          <div className="overlay story-tier-overlay">
            <div className="story-tier-panel">
              <button
                className="story-back-button"
                type="button"
                onClick={openModeMenu}
              >
                VOLTAR
              </button>
              <span className="eyebrow">MODO HISTÓRIA</span>
              <h2>ESCOLHA SUA JORNADA</h2>
              {developerAccess && <p className="developer-access-note" role="status">ACESSO DE DESENVOLVIMENTO · GRANDE FILÓSOFO LIBERADO PARA TESTES</p>}
              <div className="story-tier-grid">
                <button
                  className="story-tier-card is-available"
                  type="button"
                  onClick={() => startDiscipleCampaign(true)}
                >
                  <small>NÍVEL 1</small>
                  <strong>DISCÍPULO</strong>
                  <span>10 encontros · Felipe contra a história das ideias</span>
                  <b>COMEÇAR POR SÓCRATES</b>
                </button>
                <button
                  className={`story-tier-card is-under-construction ${doctorUnlocked ? "is-earned is-available" : "is-locked"}`}
                  type="button"
                  disabled={!doctorUnlocked}
                  onClick={startDoctorCampaign}
                >
                  <small>NÍVEL 2</small>
                  <span className="tier-construction">15 ENCONTROS</span>
                  <strong>DOUTOR</strong>
                  <span>{doctorUnlocked ? "15 encontros · De Homero a um confronto final inesperado." : "Conclua Discípulo para conquistar este nível."}</span>
                  <b>{doctorUnlocked ? "COMEÇAR POR HOMERO" : "BLOQUEADO"}</b>
                </button>
                <button className={`story-tier-card ${grandUnlocked ? "is-earned is-available" : "is-locked"}`}
                  type="button" disabled={!grandUnlocked} onClick={() => startGrandCampaign()}>
                  <small>NÍVEL 3</small>
                  <strong>GRANDE FILÓSOFO</strong>
                  <span>{grandUnlocked ? "18 confrontos · De Amenemope à batalha final contra a SuperIA." : "Conclua Doutor para conquistar este nível."}</span>
                  <b>{grandUnlocked ? "COMEÇAR POR AMENEMOPE" : "BLOQUEADO"}</b>
                </button>
                {grandUnlocked && grandSavedIndex > 0 && (
                  <button className="story-resume-button" type="button" onClick={() => startGrandCampaign("resume")}>
                    RETOMAR GRANDE FILÓSOFO · ETAPA {grandSavedIndex + 1} — {GRAND_ENCOUNTERS[grandSavedIndex].name}
                  </button>
                )}
                {(storySavedIndex > 0 || quizReturnIndex !== null) && (
                  <button
                    className="story-resume-button"
                    type="button"
                    onClick={() => startDiscipleCampaign(false)}
                  >
                    RETOMAR PROGRESSO SALVO · ETAPA {storySavedIndex + 1} — {FIGHTERS[STORY_ENCOUNTERS[storySavedIndex].opponent as FighterId].name.toUpperCase()}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === "story-scene" && (
          <div
            key={`${storySceneKind}-${storyIndex}-${storySceneStep}`}
            className={`overlay story-scene story-focus-${storyBeat.focus} story-encounter-${storyEncounter.opponent} ${isGrandFinal ? "story-grand-final" : ""}`}
            style={{ "--story-background": `url(${storyBackground})` } as CSSProperties}
          >
            <div className="story-visual">
            {isGrandFinal && (
              <>
                <GrandFinalAtmosphere assembly={storySceneStep === 0} />
                <GrandFinalBody position={70} action="idle" assembly={storySceneStep === 0} />
                <GrandFinalBridge />
              </>
            )}
            <div className="story-chapter-heading">
              <span>ETAPA {storyIndex + 1} DE {campaignTotal} · {campaignLabel}</span>
              <h2>{storyEncounter.chapter}</h2>
              <strong>{storyEncounter.era}</strong>
            </div>

            <div className="story-cast" aria-hidden="true">
              <div className="story-character story-felipe">
                <FelipeSprite staticPose={storySceneKind === "outro" ? "victory" : "idle"} />
              </div>
              {!isGrandFinal && <div className="story-character story-opponent">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fighterSelectionArt(storyEncounter.opponent as FighterId)}
                  alt=""
                />
              </div>}
            </div>

            <div className="story-dialogue-card">
              <small>{storyBeat.speaker}</small>
              <p>“{storyBeat.line}”</p>
            </div>
            </div>
            <div className="story-scene-actions">
              {storyCampaign === "grand" && storySceneKind === "outro" && <button type="button" disabled={storySceneStep === 0}
                onClick={() => setStorySceneStep((step) => Math.max(0, step - 1))}>VOLTAR</button>}
              <div className="story-scene-progress" aria-label="Progresso da cena">
                {storyBeats.map((beat, index) => (
                  <span
                    key={`${beat.speaker}-${index}`}
                    className={index <= storySceneStep ? "active" : ""}
                  />
                ))}
              </div>
              <button type="button" onClick={advanceStoryScene}>
                {storySceneStep < storyBeats.length - 1
                  ? "CONTINUAR"
                  : storySceneKind === "outro"
                    ? storyCampaign !== "disciple"
                      ? "CONTINUAR JORNADA"
                      : storyIndex === STORY_ENCOUNTERS.length - 1
                      ? "CONCLUIR JORNADA"
                      : "PRÓXIMO ENCONTRO"
                    : "COMEÇAR LUTA"}
              </button>
            </div>
          </div>
        )}

        {phase === "select" && (
          <div className={`overlay select-overlay select-${previewFighter}`}>
            <div className="character-select">
              <header className="select-heading">
                <button
                  className="select-back-button"
                  type="button"
                  onClick={
                    selectionStep === "opponent"
                      ? undoPlayerSelection
                      : openModeMenu
                  }
                  aria-label={
                    selectionStep === "opponent"
                      ? "Voltar e escolher outro filósofo para o jogador"
                      : "Voltar à escolha de modos"
                  }
                >
                  VOLTAR
                </button>
                <span>{selectionStep === "player" ? "PLAYER 1" : "ADVERSÁRIO"}</span>
                <h2>
                  {selectionStep === "player"
                    ? "ESCOLHA SEU FILÓSOFO"
                    : "ESCOLHA SEU ADVERSÁRIO"}
                </h2>

              </header>

              <div className="versus-selection-stage">
                <VersusFighterPanel
                  fighter={selectionStep === "player" ? previewFighter : selectedFighter}
                  side="player"
                  active={selectionStep === "player"}
                />
                <div className="versus-roster">
                  <div
                    className="portrait-grid"
                    role="listbox"
                    tabIndex={0}
                    aria-label={selectionStep === "player" ? "Escolha seu personagem" : "Escolha seu adversário"}
                    aria-activedescendant={`fighter-option-${previewFighter}`}
                  >
                    {FIGHTER_ORDER.map((fighter) => {
                      const meta = FIGHTERS[fighter];
                      const unavailable = selectionStep === "opponent" && fighter === selectedFighter;
                      return (
                        <button
                          className={`fighter-portrait portrait-${fighter} ${previewFighter === fighter ? "is-highlighted" : ""} ${unavailable ? "is-unavailable" : ""}`}
                          type="button"
                          key={fighter}
                          id={`fighter-option-${fighter}`}
                          role="option"
                          data-fighter={fighter}
                          tabIndex={-1}
                          disabled={unavailable}
                          aria-selected={previewFighter === fighter}
                          aria-label={unavailable ? `${meta.name}, já escolhido pelo jogador` : meta.name}
                          onMouseEnter={() => { if (!unavailable) { rosterInput.current = "pointer"; setPreviewFighter(fighter); } }}
                          onPointerDown={(event) => {
                            if (unavailable) return;
                            rosterInput.current = "pointer";
                            setPreviewFighter(fighter);
                            event.currentTarget.focus({ preventScroll: true });
                          }}
                          onFocus={() => { if (!unavailable) setPreviewFighter(fighter); }}
                          onClick={() => {
                            if (unavailable) return;
                            rosterInput.current = "pointer";
                            setPreviewFighter(fighter);
                            void confirmSelection(fighter);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {fighter === "felipe" ? <FelipeSprite staticPose="idle" portrait /> :
                            <img src={fighterThumbnailArt(fighter)} alt="" />}
                          {unavailable && <i aria-hidden="true">P1</i>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="versus-selection-help">
                    <p>Clique ou Enter para selecionar · Setas para navegar</p>
                  </div>
                </div>
                <VersusFighterPanel
                  fighter={selectionStep === "opponent" ? previewFighter : null}
                  side="opponent"
                  active={selectionStep === "opponent"}
                />
              </div>
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div className="overlay fight-loading" aria-live="polite">
            <div className="fight-loading-panel">
              <span>PREPARANDO O COMBATE</span>
              <h2>
                {FIGHTERS[selectedFighter].name} × {FIGHTERS[selectedOpponent].name}
              </h2>
              <div
                className="fight-loading-track"
                role="progressbar"
                aria-label="Carregamento das artes da luta"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(loadingProgress * 100)}
              >
                <i style={{ width: `${Math.round(loadingProgress * 100)}%` }} />
              </div>
              <strong>{Math.round(loadingProgress * 100)}%</strong>
            </div>
          </div>
        )}

        {phase === "dialogue" && (
          <div className="overlay dialogue-overlay">
            <div className="dialogue-stage">
              <div className="dialogue-visual">
              <div className="dialogue-heading">
                <span>LUTA {round} · MELHOR DE 3</span>
                <strong>
                  {playerMeta.school} × {enemyMeta.school}
                </strong>
              </div>

              <div
                className={`dialogue-fighter dialogue-left dialogue-${selectedFighter} ${
                  selectedFighter === "nietzsche" ? "dialogue-flip-art" : ""
                } ${
                  dialogue.side === selectedFighter ? "is-speaking" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {selectedFighter === "felipe" ? <FelipeSprite staticPose="idle" /> : <img
                  src={fighterSelectionArt(selectedFighter)}
                  alt={playerMeta.name}
                />}
                <span>{playerMeta.name}</span>
              </div>

              <div
                className={`dialogue-fighter dialogue-right dialogue-${opponentFighter} ${
                  opponentFighter !== "nietzsche" ? "dialogue-flip-art" : ""
                } ${
                  dialogue.side === opponentFighter ? "is-speaking" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {opponentFighter === "felipe" ? <FelipeSprite staticPose="idle" /> : <img
                  src={fighterSelectionArt(opponentFighter)}
                  alt={enemyMeta.name}
                />}
                <span>{enemyMeta.name}</span>
              </div>

              </div>
              <div className="dialogue-caption">
              <div
                className={`speech-balloon ${
                  dialogue.side === selectedFighter
                    ? "balloon-left"
                    : "balloon-right"
                }`}
              >
                <small>{dialogue.speaker}</small>
                <p>“{dialogue.line}”</p>
              </div>

              <div className="dialogue-progress" aria-label="Progresso do diálogo">
                {fightDialogue.map((line, index) => (
                  <span
                    key={`${line.speaker}-${index}`}
                    className={index <= dialogueStep ? "active" : ""}
                  />
                ))}
              </div>

              <button
                className="dialogue-next"
                type="button"
                disabled={!dialogueReady}
                onClick={() => {
                  if (!dialogueReady) return;
                  if (dialogueStep < fightDialogue.length - 1) {
                    setDialogueReady(false);
                    setDialogueStep((current) => current + 1);
                    playTone(
                      dialogue.side === "plato" ? 220 : 164.8,
                      0.07,
                      "triangle",
                    );
                  } else {
                    resetGame();
                  }
                }}
              >
                {!dialogueReady
                  ? "OUÇA O ARGUMENTO..."
                  : dialogueStep < fightDialogue.length - 1
                    ? "OUVIR RESPOSTA"
                    : "ENTRAR NA ARENA"}
              </button>
              </div>
            </div>
          </div>
        )}

        {(phase === "round-won" || phase === "round-lost") && (
          <div className="overlay round-result-overlay">
            <div className="overlay-card round-result-card">
              <span className="eyebrow">LUTA {round} ENCERRADA</span>
              <h2>{FIGHTERS[roundWinner].name} VENCEU</h2>
              <div className="round-score">
                <span>{playerMeta.name}</span>
                <strong>
                  {matchScore.player} × {matchScore.enemy}
                </strong>
                <span>{enemyMeta.name}</span>
              </div>
              <p>A disputa continua. O próximo argumento pode virar o placar.</p>
              <button
                type="button"
                onClick={() => {
                  setRound((current) => current + 1);
                  resetGame(true);
                }}
              >
                INICIAR PRÓXIMA LUTA
              </button>
            </div>
          </div>
        )}

        {(phase === "won" || phase === "lost") && (
          <div className={`overlay post-fight-overlay winner-${matchWinner}`}>
            <div className="post-fight-heading">
              <span>REFUTAÇÃO FINAL</span>
              <strong>{resultLabel}</strong>
            </div>

            <div className={`ending-fighter ending-${matchWinner} is-winner`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {matchWinner === "felipe" ? <FelipeSprite staticPose="victory" framing="tight" /> : <img
                src={isGrandFinal ? GRAND_FINAL_SPRITE : fighterVictoryArt(matchWinner)}
                alt={`${FIGHTERS[matchWinner].name} vencedor`}
              />}
              <span className="ending-name">
                {FIGHTERS[matchWinner].name}
              </span>
            </div>

            <div className={`ending-fighter ending-${matchLoser} is-loser`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {matchLoser === "felipe" ? <FelipeSprite staticPose="idle" framing="tight" /> : <img
                src={isGrandFinal ? GRAND_FINAL_SPRITE : fighterSelectionArt(matchLoser)}
                alt={`${FIGHTERS[matchLoser].name} derrotado`}
              />}
              <span className="face-injury" aria-hidden="true" />
              <span className="ending-name">
                {FIGHTERS[matchLoser].name}
              </span>
            </div>

            <div className={`final-speech final-speech-${matchWinner}`}>
              <small>{finalArgument.title}</small>
              <p>“{finalArgument.argument}”</p>
            </div>

            <button
              className="post-fight-button"
              type="button"
              onClick={
                gameMode === "story"
                  ? phase === "won"
                    ? openStoryOutro
                    : () => prepareStoryFight(storyIndex)
                  : openSelection
              }
            >
              {gameMode === "story"
                ? phase === "won"
                  ? isGrandFinal ? "VER EPÍLOGO" : "CONTINUAR HISTÓRIA"
                  : "TENTAR NOVAMENTE"
                : "NOVA DISPUTA"}
            </button>
          </div>
        )}

        {phase === "story-complete" && (
          <StoryEnding onReturn={() => setPhase("story-tier-select")} onAudioStageChange={setEndingAudioStage} />
        )}

        {phase === "doctor-complete" && (
          <DoctorEnding onReturn={() => setPhase("story-tier-select")} onAudioStageChange={setEndingAudioStage}
            onContinue={() => startGrandCampaign()}
            onLightning={() => effectsAudio.current?.play("thunder", { gain: .8 })} />
        )}

        {phase === "grand-epilogue" && (
          <GrandEpilogue onFinish={showGrandCredits} onAudioStageChange={setEndingAudioStage} />
        )}

        {phase === "grand-complete" && (
          <section className="grand-ending" role="dialog" aria-labelledby="grand-ending-title">
            <div className="grand-ending-copy">
              <span className="eyebrow">CRÉDITOS · MODO HISTÓRIA</span>
              <h2 id="grand-ending-title">GRANDE FILÓSOFO</h2>
              <p className="grand-ending-line">O pensamento não tem dono.</p>
              <p>A SuperIA foi vencida. As vozes que atravessaram sua jornada voltam a circular.</p>
              <blockquote>“Ninguém pensa por todos. Cada pergunta abre uma porta; cada encontro mantém o mundo aberto.”</blockquote>
              <p className="grand-ending-signature">FELIPE BLEH · 18 CONFRONTOS CONCLUÍDOS</p>
            </div>
            <div className="grand-ending-roster" aria-label="Os dezessete pensadores resgatados">
              {GRAND_ENCOUNTERS.slice(0, -1).map((encounter) => (
                <figure key={encounter.opponent}>
                  <img src={fighterThumbnailArt(encounter.opponent)} alt="" loading="lazy" />
                  <figcaption>{encounter.name}</figcaption>
                </figure>
              ))}
            </div>
            <div className="grand-ending-actions">
              <button type="button" onClick={() => setPhase("story-tier-select")}>VOLTAR AOS NÍVEIS</button>
              <button type="button" onClick={() => startGrandCampaign()}>JOGAR NOVAMENTE</button>
            </div>
          </section>
        )}

        {phase === "doctor-checkpoint" && (
          <div className="overlay story-tier-overlay">
            <div className="story-tier-panel doctor-checkpoint-panel">
              <span className="eyebrow">NÍVEL 2 · DOUTOR</span>
              <p>Você venceu Felipe das Trevas e concluiu as 15 lutas do Doutor!</p>
              <img
                className="story-construction-art"
                src="/game/story-under-construction.webp"
                alt="Felipe Bleh assentando o último tijolo das palavras Em construção"
                width={1672}
                height={941}
              />
              <p className="doctor-pending">As artes de encerramento desta jornada estão sendo preparadas.</p>
              <button type="button" onClick={() => prepareStoryFight(storyIndex)}>LUTAR COM {FIGHTERS[storyEncounter.opponent as FighterId].name} NOVAMENTE</button>
              <button type="button" onClick={() => setPhase("story-tier-select")}>VOLTAR AOS NÍVEIS</button>
            </div>
          </div>
        )}

        {phase === "draw" && (
          <div className="overlay result-overlay">
            <div className="overlay-card result-card">
              <span className="eyebrow">ARGUMENTO ENCERRADO</span>
              <h2>{resultLabel}</h2>
              <p>
                A questão permanece aberta. E talvez seja esse o início da
                filosofia.
              </p>
              <button
                type="button"
                onClick={() => {
                  resetGame();
                }}
              >
                REPETIR A LUTA
              </button>
            </div>
          </div>
        )}
      </section>

      {phase !== "intro" && phase !== "mode-select" && (
      <section className={`control-deck ${phase === "playing" ? "is-playing" : "is-inactive"}`} aria-label="Controles do combate"
        onContextMenu={(event) => event.preventDefault()}>
        <div className="movement-controls" aria-label="Movimentação">
          <span className="control-title">MOVIMENTO</span>
          <div className="button-row">
            <CombatButton shortcut="A" label="Recuar" touchLabel="Recuar"
              disabled={phase !== "playing"} onActivate={() => movePlayer(-1)}
              onTouchPress={(event) => pressTouchKey("a", event)} onTouchRelease={releaseTouchKey} />
            <CombatButton shortcut="W" label="Saltar" touchLabel="Saltar"
              disabled={phase !== "playing"} onActivate={jump}
              onTouchPress={() => { jumpRequested.current = true; }} />
            <CombatButton shortcut="S" label="Defender" touchLabel="Defesa"
              className={playerGuarding ? "guard-active" : ""}
              disabled={phase !== "playing"} onActivate={guard}
              onTouchPress={(event) => pressTouchKey("s", event)} onTouchRelease={releaseTouchKey} />
            <CombatButton shortcut="D" label="Avançar" touchLabel="Avançar"
              disabled={phase !== "playing"} onActivate={() => movePlayer(1)}
              onTouchPress={(event) => pressTouchKey("d", event)} onTouchRelease={releaseTouchKey} />
          </div>
        </div>

        <div
          className="attack-controls"
          aria-label={`Golpes de ${playerMeta.name}`}
        >
          <span className="control-title">GOLPES FILOSÓFICOS</span>
          <div className="button-row">
            {(Object.keys(playerMoves) as MoveName[]).map((moveName) => {
              const move = playerMoves[moveName];
              const isSpecial =
                moveName === "especial" || moveName === "transcender";
              const locked = isSpecial && (logos < 100 || silenced.player);
              return (
                <CombatButton
                  key={moveName}
                  shortcut={move.key}
                  label={move.label}
                  touchLabel={TOUCH_MOVE_LABELS[moveName]}
                  className={isSpecial ? `special-button ${!locked && phase === "playing" ? "special-ready-button" : ""}` : ""}
                  onActivate={() => queueMove(moveName)}
                  onTouchPress={() => queueMove(moveName)}
                  disabled={phase !== "playing" || locked}
                >
                  {isSpecial && (
                    <i>
                      {locked ? `100% ${playerMeta.meter}` : "PRONTO"}
                    </i>
                  )}
                </CombatButton>
              );
            })}
          </div>
        </div>
      </section>
      )}

      <aside className="concept-panel" aria-live="polite">
        <div className="concept-symbol">Λ</div>
        <div>
          <span>CONCEITO EM COMBATE</span>
          <h3>{moveTitle}</h3>
          <p>{concept}</p>
        </div>
        <div className="prototype-note">
          <strong>{gameMode === "story" ? `CAMPANHA ${campaignLabel}` : "MODO VERSUS"}</strong>
          <span>
            {gameMode === "story"
              ? storyCampaign === "doctor"
                ? `Etapa ${storyIndex + 1} de ${campaignTotal} · jornada Doutor`
                : `Etapa ${storyIndex + 1} de ${campaignTotal} · progresso salvo neste dispositivo`
              : "Todo o elenco · melhor de três · seleção livre"}
          </span>
        </div>
      </aside>

      <footer>
        <p>
          Protótipo educacional original · Filosofar é entrar na arena das ideias
        </p>
        <span>VERSÃO 5.3 · GRANDE FILÓSOFO</span>
      </footer>
    </main>
  );
}
