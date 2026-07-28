"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Phase =
  | "intro"
  | "select"
  | "dialogue"
  | "playing"
  | "finishing"
  | "round-won"
  | "round-lost"
  | "won"
  | "lost"
  | "draw";
type FighterId = "amenemope" | "homero" | "plato" | "nietzsche";
type MoveName =
  | "dialetica"
  | "caverna"
  | "ideias"
  | "especial"
  | "transcender";
type ArenaEffect =
  | "plato-solid"
  | "plato-good"
  | "nietzsche-hammer"
  | "nietzsche-return"
  | "maat-feather"
  | "maat-scale"
  | "homer-arrow"
  | "homer-wrath"
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
    label: "Eterno Retorno",
    key: "U",
    action: "special-return",
    damage: 38,
    logos: -100,
    range: 100,
    cooldown: 1800,
    concept:
      "O eterno retorno pergunta se você afirmaria esta mesma vida infinitas vezes, transformando a repetição em prova de afirmação.",
    shout: "ETERNO RETORNO",
  },
};

const AMENEMOPE_MOVES: Record<MoveName, Move> = {
  dialetica: {
    label: "Toque do Escriba",
    key: "J",
    action: "attack-punch",
    damage: 5,
    logos: 10,
    range: 22,
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
    range: 30,
    cooldown: 1600,
    concept:
      "A palavra justa não é a mais ruidosa. Três movimentos breves recompensam a disciplina e encerram a agressão.",
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

const FIGHTER_MOVES: Record<FighterId, Record<MoveName, Move>> = {
  amenemope: AMENEMOPE_MOVES,
  homero: HOMERO_MOVES,
  plato: PLATO_MOVES,
  nietzsche: NIETZSCHE_MOVES,
};

const FIGHTERS = {
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
  if (fighter === "plato") {
    return moveName === "transcender" ? "plato-good" : "plato-solid";
  }
  return moveName === "transcender"
    ? "nietzsche-return"
    : "nietzsche-hammer";
};

const FIGHTER_ORDER: FighterId[] = ["amenemope", "homero", "plato", "nietzsche"];

const fighterArt = (fighter: FighterId) =>
  fighter === "amenemope"
    ? "/game/amenemope-v2.png"
    : fighter === "homero"
      ? "/game/homero.png"
    : `/game/${fighter}.png`;

const INITIAL_CONCEPT =
  "Use os golpes para carregar o Logos. Cada habilidade transforma uma ideia filosófica em mecânica de combate.";

const DIALOGUE_LINES: Record<FighterId, string> = {
  amenemope:
    "O homem impetuoso ergue a voz. O sábio ergue o pensamento.",
  homero:
    "Canta, ó Musa, o encontro em que mortais discutem sob os olhos dos deuses.",
  plato: "A verdade está além das aparências.",
  nietzsche: "Meu martelo colocará a sua verdade à prova.",
};

type MatchDialogue = {
  intro: Array<{ speaker: FighterId; line: string }>;
  victory: Partial<Record<FighterId, string>>;
};

const MATCH_DIALOGUES: Record<string, MatchDialogue> = {
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
};

const matchupKey = (first: FighterId, second: FighterId) =>
  [first, second].sort().join(":");

const FINAL_ARGUMENTS = {
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

export default function Home() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedFighter, setSelectedFighter] =
    useState<FighterId>("plato");
  const [selectedOpponent, setSelectedOpponent] =
    useState<FighterId>("nietzsche");
  const [previewFighter, setPreviewFighter] =
    useState<FighterId>("plato");
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
  const [round, setRound] = useState(1);
  const [arenaEffect, setArenaEffect] = useState<ArenaEffect>(null);
  const [playerGuarding, setPlayerGuarding] = useState(false);
  const [enemyGuarding, setEnemyGuarding] = useState(false);
  const [combo, setCombo] = useState(0);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [dialogueReady, setDialogueReady] = useState(false);
  const [finisher, setFinisher] = useState<FighterId | null>(null);
  const cooldowns = useRef<Record<string, number>>({});
  const guardRef = useRef(false);
  const guardStartedAt = useRef(0);
  const enemyGuardRef = useRef(false);
  const playerAirborne = useRef(false);
  const enemyAirborne = useRef(false);
  const playerActionLock = useRef(0);
  const enemyActionLock = useRef(0);
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
    [
      "/game/plato-spritesheet-v2.png",
      "/game/nietzsche-spritesheet-v2.png",
      "/game/amenemope-spritesheet-v3.png",
      "/game/homero-spritesheet.png",
      "/game/amenemope-v2.png",
      "/game/homero.png",
      "/game/arena-egito.webp",
      "/game/arena-troia.webp",
      "/game/arena-sils-maria.webp",
      "/game/victory-spritesheet.png",
      "/game/solido-platonico.png",
    ].forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (phase !== "dialogue") return;
    const hold = window.setTimeout(() => setDialogueReady(true), 3800);
    return () => window.clearTimeout(hold);
  }, [dialogueStep, phase]);

  const playTone = useCallback(
    (frequency: number, duration = 0.08, type: OscillatorType = "sine") => {
      if (!gameRef.current.soundOn || typeof window === "undefined") return;
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }).webkitAudioContext;
        if (!AudioContextClass) return;
        const audio = new AudioContextClass();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
        gain.gain.setValueAtTime(0.06, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          audio.currentTime + duration,
        );
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start();
        oscillator.stop(audio.currentTime + duration);
      } catch {
        // Sound is an optional enhancement; gameplay remains available.
      }
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

  const animate = useCallback(
    (side: "player" | "enemy", action: string, duration = 520) => {
      const setter = side === "player" ? setPlayerAction : setEnemyAction;
      setter(action);
      window.setTimeout(
        () => setter((current) => (current === action ? "idle" : current)),
        duration,
      );
    },
    [],
  );

  const resetGame = useCallback(() => {
    setPlayerCoherence(100);
    setEnemyCoherence(100);
    setLogos(0);
    setEnemyLogos(0);
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
    lastPlayerAttack.current = Date.now();
    enemyAggression.current = 0;
    comboRef.current = { count: 0, lastHit: 0 };
    if (comboTimer.current) window.clearTimeout(comboTimer.current);
    cooldowns.current = {};
    setPhase("playing");
    playTone(196, 0.12, "triangle");
    window.setTimeout(() => playTone(293.7, 0.14, "triangle"), 90);
  }, [playTone, selectedFighter]);

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
    (fighter: FighterId) => {
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
      setMoveTitle("A batalha também ensina");
      setConcept(
        `Use os golpes e a defesa para carregar ${FIGHTERS[selectedFighter].meter}. Cada habilidade transforma uma ideia filosófica em mecânica de combate.`,
      );
      setMatchScore({ player: 0, enemy: 0 });
      setRound(1);
      openDialogue();
    },
    [openDialogue, playTone, selectedFighter, selectionStep],
  );

  const openSelection = useCallback(() => {
    setMatchScore({ player: 0, enemy: 0 });
    setRound(1);
    setMessages([]);
    setArenaEffect(null);
    setFinisher(null);
    setSelectionStep("player");
    setPreviewFighter(selectedFighter);
    setPhase("select");
  }, [selectedFighter]);

  const finishByCoherence = useCallback(
    (nextPlayer: number, nextEnemy: number) => {
      if (roundResolved.current) return;
      const opponentFighter = selectedOpponent;
      if (nextEnemy <= 0) {
        roundResolved.current = true;
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
        playTone(392, 0.18, "triangle");
        window.setTimeout(() => playTone(523.25, 0.3, "triangle"), 160);
        window.setTimeout(() => {
          setPhase(nextPlayerWins >= 2 ? "won" : "round-won");
          setArenaEffect(null);
        }, 2300);
      } else if (nextPlayer <= 0) {
        roundResolved.current = true;
        const nextEnemyWins = gameRef.current.enemyWins + 1;
        setMatchScore((current) => ({
          ...current,
          enemy: nextEnemyWins,
        }));
        setPhase("finishing");
        setFinisher(opponentFighter);
        setPlayerAction("knocked-out");
        setEnemyAction("victory");
        setArenaEffect(specialEffect(opponentFighter, "transcender"));
        setMoveTitle(FIGHTERS[opponentFighter].finisherTitle);
        setConcept(FIGHTERS[opponentFighter].finisherConcept);
        playTone(146.8, 0.28, "sawtooth");
        window.setTimeout(() => {
          setPhase(nextEnemyWins >= 2 ? "lost" : "round-lost");
          setArenaEffect(null);
        }, 2300);
      }
    },
    [playTone, selectedFighter, selectedOpponent],
  );

  const performMove = useCallback(
    (moveName: MoveName) => {
      const game = gameRef.current;
      if (game.phase !== "playing") return;
      const move = FIGHTER_MOVES[selectedFighter][moveName];
      const isSpecial = moveName === "especial" || moveName === "transcender";
      const now = Date.now();
      if (playerActionLock.current > now || playerAirborne.current) return;
      if ((cooldowns.current[moveName] ?? 0) > now) return;
      if (isSpecial && game.logos < 100) {
        addMessage("player", `${FIGHTERS[selectedFighter].meter} INCOMPLETO`, "miss");
        playTone(120, 0.08, "square");
        return;
      }

      cooldowns.current[moveName] = now + move.cooldown;
      lastPlayerAttack.current = now;
      const actionDuration = isSpecial
        ? moveName === "transcender"
          ? 1450
          : 1100
        : moveName === "ideias"
          ? 780
          : moveName === "caverna"
            ? 620
            : 520;
      playerActionLock.current = now + actionDuration;
      setMoveTitle(move.label);
      setConcept(move.concept);
      animate(
        "player",
        move.action,
        actionDuration,
      );

      if (isSpecial) {
        setArenaEffect(specialEffect(selectedFighter, moveName));
        window.setTimeout(() => setArenaEffect(null), 1500);
      }

      const impactDelay =
        moveName === "transcender"
          ? 760
          : moveName === "especial"
            ? 610
            : moveName === "ideias"
              ? 410
              : moveName === "caverna"
                ? 310
                : 220;

      window.setTimeout(() => {
        const current = gameRef.current;
        if (current.phase !== "playing") return;
        const distance = Math.abs(current.enemyPosition - current.playerPosition);
        const reachBonus =
          moveName === "dialetica" ? 0 : moveName === "caverna" ? 2 : 4;
        const bodyContact = distance <= move.range + reachBonus;
        const lowAttackMissed =
          moveName === "caverna" && enemyAirborne.current;
        const landed = isSpecial || (bodyContact && !lowAttackMissed);
        if (!landed) {
          addMessage("enemy", "SEM CONTATO", "miss");
          comboRef.current = { count: 0, lastHit: 0 };
          setCombo(0);
          playTone(180, 0.08, "sine");
          return;
        }

        const impactTime = Date.now();
        const continuedCombo =
          !isSpecial && impactTime - comboRef.current.lastHit <= 1350;
        const nextCombo = isSpecial
          ? 0
          : Math.min(5, continuedCombo ? comboRef.current.count + 1 : 1);
        const comboMultiplier = 1 + Math.max(0, nextCombo - 1) * 0.08;
        const enemyDefended = enemyGuardRef.current && !isSpecial;
        const maatJudgment =
          selectedFighter === "amenemope" && moveName === "transcender"
            ? Math.min(18, enemyAggression.current * 2)
            : 0;
        const rawDamage = Math.round(
          (move.damage + maatJudgment + (isSpecial ? 0 : Math.floor(Math.random() * 3))) *
            comboMultiplier,
        );
        const damage = enemyDefended ? Math.max(1, Math.ceil(rawDamage * 0.3)) : rawDamage;
        const nextEnemy = Math.max(0, current.enemyCoherence - damage);
        setEnemyCoherence(nextEnemy);
        if (isSpecial) {
          setLogos(0);
          comboRef.current = { count: 0, lastHit: 0 };
          setCombo(0);
          addMessage(
            "center",
            move.shout,
            "special",
          );
          playTone(
            selectedFighter === "nietzsche"
              ? moveName === "transcender"
                ? 55
                : 73
              : moveName === "transcender"
                ? 65
                : 98,
            0.4,
            "sawtooth",
          );
          window.setTimeout(
            () => playTone(moveName === "transcender" ? 523.25 : 392, 0.3, "triangle"),
            120,
          );
        } else {
          setLogos(Math.min(100, current.logos + move.logos));
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
          playTone(
            moveName === "caverna" ? 180 : moveName === "ideias" ? 240 : 280,
            moveName === "ideias" ? 0.14 : 0.09,
            "square",
          );
        }
        if (enemyDefended) {
          addMessage("enemy", `BLOQUEIO · −${damage}`, "damage");
          setEnemyAction("guard-hit");
          window.setTimeout(() => setEnemyAction("idle"), 320);
          enemyGuardRef.current = false;
          setEnemyGuarding(false);
        } else {
          animate("enemy", "hit", 480);
        }
        setEnemyPosition((position) =>
          Math.min(80, position + (isSpecial ? 5 : 2.4)),
        );
        finishByCoherence(current.playerCoherence, nextEnemy);
      }, impactDelay);
    },
    [
      addMessage,
      animate,
      finishByCoherence,
      playTone,
      selectedFighter,
      selectedOpponent,
    ],
  );

  const movePlayer = useCallback((direction: -1 | 1) => {
    const game = gameRef.current;
    if (
      game.phase !== "playing" ||
      playerActionLock.current > Date.now() ||
      playerAirborne.current
    ) return;
    setPlayerPosition((position) => {
      const limit =
        direction > 0
          ? Math.min(57, game.enemyPosition - 18)
          : Math.max(13, position - 4);
      return direction > 0 ? Math.min(limit, position + 4) : limit;
    });
    // A complete walk cycle keeps the six-frame animation from snapping back
    // to idle halfway through a step after a single keyboard/touch input.
    animate("player", direction > 0 ? "advance" : "retreat", 330);
  }, [animate]);

  const jump = useCallback(() => {
    const now = Date.now();
    if (
      gameRef.current.phase !== "playing" ||
      playerActionLock.current > now ||
      playerAirborne.current
    ) return;
    playerAirborne.current = true;
    playerActionLock.current = now + 650;
    animate("player", "jump", 650);
    playTone(330, 0.05, "triangle");
    window.setTimeout(() => {
      playerAirborne.current = false;
    }, 650);
  }, [animate, playTone]);

  const guard = useCallback(() => {
    const game = gameRef.current;
    const now = Date.now();
    if (
      game.phase !== "playing" ||
      guardRef.current ||
      playerActionLock.current > now ||
      playerAirborne.current ||
      (cooldowns.current.guard ?? 0) > now
    ) {
      return;
    }
    cooldowns.current.guard = now + 950;
    playerActionLock.current = now + 680;
    guardRef.current = true;
    guardStartedAt.current = now;
    setPlayerGuarding(true);
    setPlayerAction("guard");
    playTone(246.9, 0.06, "triangle");
    window.setTimeout(() => {
      guardRef.current = false;
      setPlayerGuarding(false);
      setPlayerAction((current) => (current === "guard" ? "idle" : current));
    }, 680);
  }, [playTone]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) return;
      const key = event.key.toLowerCase();
      if (phase === "intro" && (key === " " || key === "enter")) {
        event.preventDefault();
        openSelection();
        return;
      }
      if (phase === "select") {
        if (
          key === "arrowleft" ||
          key === "arrowright" ||
          key === "a" ||
          key === "d"
        ) {
          event.preventDefault();
          setPreviewFighter((current) => {
            const index = FIGHTER_ORDER.indexOf(current);
            const direction =
              key === "arrowleft" || key === "a" ? -1 : 1;
            let next = current;
            do {
              next =
                FIGHTER_ORDER[
                  (FIGHTER_ORDER.indexOf(next) +
                    direction +
                    FIGHTER_ORDER.length) %
                    FIGHTER_ORDER.length
                ];
            } while (
              selectionStep === "opponent" &&
              next === selectedFighter &&
              FIGHTER_ORDER.length > 1
            );
            return next;
          });
          return;
        }
        if (key === "enter" || key === " ") {
          event.preventDefault();
          confirmSelection(previewFighter);
          return;
        }
      }
      if (["a", "d", "w", "s", "j", "k", "i", "l", "u"].includes(key)) {
        event.preventDefault();
      }
      if (key === "a") movePlayer(-1);
      if (key === "d") movePlayer(1);
      if (key === "w") jump();
      if (key === "s") guard();
      if (key === "j") performMove("dialetica");
      if (key === "k") performMove("caverna");
      if (key === "i") performMove("ideias");
      if (key === "l") performMove("especial");
      if (key === "u") performMove("transcender");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    confirmSelection,
    guard,
    jump,
    movePlayer,
    openSelection,
    performMove,
    phase,
    previewFighter,
    selectedFighter,
    selectionStep,
  ]);

  useEffect(() => {
    if (phase !== "playing") return;
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
  }, [finishByCoherence, phase]);

  useEffect(() => {
    if (phase !== "playing" || selectedFighter !== "amenemope") return;
    const serenity = window.setInterval(() => {
      if (
        Date.now() - lastPlayerAttack.current >= 2000 &&
        !guardRef.current &&
        playerActionLock.current <= Date.now()
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
      const now = Date.now();
      if (game.phase !== "playing" || enemyActionLock.current > now) return;
      const distance = game.enemyPosition - game.playerPosition;

      if (
        distance < 31 &&
        !enemyGuardRef.current &&
        (playerActionLock.current > now || Math.random() > 0.82)
      ) {
        enemyGuardRef.current = true;
        enemyActionLock.current = now + 560;
        setEnemyGuarding(true);
        setEnemyAction("guard");
        window.setTimeout(() => {
          enemyGuardRef.current = false;
          setEnemyGuarding(false);
          setEnemyAction((action) => (action === "guard" ? "idle" : action));
        }, 560);
        return;
      }

      if (distance > 25 && distance < 36 && Math.random() > 0.84) {
        enemyAirborne.current = true;
        enemyActionLock.current = now + 650;
        animate("enemy", "jump", 650);
        window.setTimeout(() => {
          enemyAirborne.current = false;
        }, 650);
        return;
      }

      if (distance > 28 && Math.random() > 0.24) {
        setEnemyPosition((position) =>
          Math.max(game.playerPosition + 18, position - 3.2),
        );
        animate("enemy", "advance", 260);
        return;
      }
      if (distance < 22 && Math.random() > 0.72) {
        setEnemyPosition((position) => Math.min(80, position + 4));
        animate("enemy", "retreat", 260);
        return;
      }

      const special = game.enemyLogos >= 100;
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
      const damage = move.damage;
      const cpuActionDuration = special
        ? moveName === "transcender" ? 1400 : 1050
        : moveName === "ideias" ? 780
        : moveName === "caverna" ? 650 : 480;
      enemyActionLock.current = now + cpuActionDuration;
      animate(
        "enemy",
        move.action,
        cpuActionDuration,
      );
      if (special) {
        setArenaEffect(specialEffect(opponentFighter, moveName));
        window.setTimeout(() => setArenaEffect(null), 1500);
      }
      setMoveTitle(move.label);
      setConcept(move.concept);

      window.setTimeout(() => {
        const current = gameRef.current;
        if (current.phase !== "playing") return;
        const currentDistance = current.enemyPosition - current.playerPosition;
        const lowAttackMissed =
          moveName === "caverna" && playerAirborne.current;
        if (!special && (currentDistance > move.range || lowAttackMissed)) {
          addMessage("player", "SEM CONTATO", "miss");
          return;
        }
        const defended = guardRef.current;
        const perfectGuard =
          defended && Date.now() - guardStartedAt.current <= 220;
        const guardedDamage = defended
          ? Math.max(1, Math.ceil(damage * (special ? 0.5 : perfectGuard ? 0.1 : 0.25)))
          : damage;
        const nextPlayer = Math.max(
          0,
          current.playerCoherence - guardedDamage,
        );
        setPlayerCoherence(nextPlayer);
        setEnemyLogos(special ? 0 : Math.min(100, current.enemyLogos + 18));
        setPlayerPosition((position) =>
          Math.max(13, position - (defended ? 0.7 : 2.2)),
        );
        if (defended) {
          setLogos(Math.min(100, current.logos + (special ? 8 : perfectGuard ? 22 : 14)));
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
          setPlayerAction("guard-hit");
          window.setTimeout(
            () =>
              setPlayerAction((action) =>
                action === "guard-hit" ? "idle" : action,
              ),
            360,
          );
          guardRef.current = false;
          setPlayerGuarding(false);
          playTone(392, 0.11, "square");
        } else {
          animate("player", "hit", 440);
          playTone(special ? 110 : 165, special ? 0.28 : 0.08, "sawtooth");
        }
        finishByCoherence(nextPlayer, current.enemyCoherence);
      }, special
        ? moveName === "transcender"
          ? 780
          : 640
        : moveName === "caverna"
          ? 300
          : 190);
    }, 1280);
    return () => window.clearInterval(cpu);
  }, [
    addMessage,
    animate,
    finishByCoherence,
    phase,
    playTone,
    selectedFighter,
    selectedOpponent,
  ]);

  const opponentFighter = selectedOpponent;
  const playerMeta = FIGHTERS[selectedFighter];
  const enemyMeta = FIGHTERS[opponentFighter];
  const playerMoves = FIGHTER_MOVES[selectedFighter];
  const matchWinner: FighterId =
    phase === "won" ? selectedFighter : opponentFighter;
  const matchLoser: FighterId =
    matchWinner === selectedFighter ? opponentFighter : selectedFighter;
  const resultLabel =
    phase === "won" || phase === "lost"
      ? `CAMPEÃO: ${FIGHTERS[matchWinner].name}`
      : "APORIA — EMPATE";
  const matchDialogue =
    MATCH_DIALOGUES[matchupKey(selectedFighter, opponentFighter)];
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

  return (
    <main className="game-shell">
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
        <div className="prototype-badge">PROTÓTIPO · DUELO I</div>
        <button
          className="sound-button"
          type="button"
          onClick={() => setSoundOn((current) => !current)}
          aria-pressed={soundOn}
        >
          SOM {soundOn ? "ATIVO" : "DESATIVADO"}
        </button>
      </header>

      <section
        className={`battle-frame ${
          selectedFighter === "amenemope"
            ? "arena-egypt"
            : selectedFighter === "homero"
              ? "arena-troy"
            : selectedFighter === "nietzsche"
              ? "arena-sils"
              : ""
        } ${arenaEffect ? `effect-${arenaEffect}` : ""} ${
          phase === "finishing" ? "is-finishing" : ""
        }`}
        aria-label="Arena de combate filosófico"
      >
        <div className="arena-sky" />
        <div className="special-colorwash" aria-hidden="true" />
        <div className="arena-life" aria-hidden="true">
          <span className="bird bird-one" />
          <span className="bird bird-two" />
          <span className="temple-banner" />
          <span className="torch torch-left" />
          <span className="torch torch-right" />
          <span className="dust dust-one" />
          <span className="dust dust-two" />
          <span className="dust dust-three" />
        </div>
        <div className="arena-vignette" />

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
            <div className="logos-row">
              <span>{playerMeta.meter}</span>
              <div className={`bar logos-bar ${logos >= 100 ? "ready" : ""}`}>
                <span style={{ width: `${logos}%` }} />
              </div>
              <strong>{logos}%</strong>
            </div>
          </div>

          <div className="round-clock">
            <span>LUTA {round} · MELHOR DE 3</span>
            <strong>{String(time).padStart(2, "0")}</strong>
            <div className="score-pips" aria-label="Placar da disputa">
              <span className={matchScore.player >= 1 ? "won" : ""} />
              <span className={matchScore.player >= 2 ? "won" : ""} />
              <b>×</b>
              <span className={matchScore.enemy >= 1 ? "won enemy" : ""} />
              <span className={matchScore.enemy >= 2 ? "won enemy" : ""} />
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
          <div
            className={`fighter fighter-player fighter-${selectedFighter} ${playerAction} ${
              selectedFighter === "amenemope" && logos >= 25
                ? "is-serene"
                : ""
            }`}
            style={{ left: `${playerPosition}%` }}
          >
            <div className="fighter-aura" />
            <div
              className={`fighter-sprite ${
                finisher === selectedFighter &&
                selectedFighter !== "amenemope" &&
                selectedFighter !== "homero"
                  ? `victory-sheet victory-${selectedFighter}-sheet`
                  : `${selectedFighter}-sheet`
              }`}
              role="img"
              aria-label={`${playerMeta.name} em posição de combate`}
            />
            <span className="fighter-shadow" />
          </div>

          <div
            className={`fighter fighter-enemy fighter-${opponentFighter} ${enemyAction} ${enemyGuarding ? "is-guarding" : ""}`}
            style={{ left: `${enemyPosition}%` }}
          >
            <div className="fighter-aura" />
            <div
              className={`fighter-sprite ${
                finisher === opponentFighter &&
                opponentFighter !== "amenemope" &&
                opponentFighter !== "homero"
                  ? `victory-sheet victory-${opponentFighter}-sheet`
                  : `${opponentFighter}-sheet`
              }`}
              role="img"
              aria-label={`${enemyMeta.name} em posição de combate`}
            />
            <span className="fighter-shadow" />
          </div>

          {playerAction === "special-solid" && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="solid-projectile"
              src="/game/solido-platonico.png"
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
              src="/game/solido-platonico.png"
              alt=""
              aria-hidden="true"
              style={{
                left: `${enemyPosition - 8}%`,
                "--solid-travel": `-${Math.max(22, enemyPosition - playerPosition - 8)}vw`,
              } as CSSProperties}
            />
          )}

          {playerAction === "special-hammer" && (
            <div
              className="hammer-shockwave player-shockwave"
              aria-hidden="true"
              style={{ left: `${playerPosition + 4}%` }}
            />
          )}

          {enemyAction === "special-hammer" && (
            <div
              className="hammer-shockwave"
              aria-hidden="true"
              style={{ left: `${enemyPosition - 4}%` }}
            />
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

          {playerAction === "special-return" && (
            <div
              className="return-vortex player-vortex"
              aria-hidden="true"
              style={{ left: `${playerPosition + 5}%` }}
            >
              <span />
              <span />
              <span />
            </div>
          )}

          {enemyAction === "special-return" && (
            <div
              className="return-vortex"
              aria-hidden="true"
              style={{ left: `${enemyPosition - 5}%` }}
            >
              <span />
              <span />
              <span />
            </div>
          )}

          {(playerAction === "special-feather" ||
            enemyAction === "special-feather") && (
            <div className="maat-feather" aria-hidden="true">
              <span>𓆄</span>
            </div>
          )}

          {(playerAction === "special-scale" ||
            enemyAction === "special-scale") && (
            <div className="maat-judgment" aria-hidden="true">
              <span className="maat-heart">♥</span>
              <span className="maat-balance">⚖</span>
              <span className="maat-plume">𓆄</span>
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

          {messages.map((message) => (
            <div
              key={message.id}
              className={`combat-message ${message.side} ${message.kind}`}
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
                      : "SEQUÊNCIA DA VONTADE"}
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
            onClick={openSelection}
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

        {phase === "select" && (
          <div className={`overlay select-overlay select-${previewFighter}`}>
            <div className="character-select">
              <header className="select-heading">
                <span>{selectionStep === "player" ? "PLAYER 1" : "ADVERSÁRIO"}</span>
                <h2>
                  {selectionStep === "player"
                    ? "ESCOLHA SEU FILÓSOFO"
                    : "ESCOLHA SEU ADVERSÁRIO"}
                </h2>
                <p>
                  {selectionStep === "player"
                    ? "Selecione o filósofo que você controlará."
                    : `${FIGHTERS[selectedFighter].name} já foi escolhido. Agora selecione outro filósofo para enfrentá-lo.`}
                </p>
              </header>

              <div className={`select-showcase showcase-${previewFighter}`}>
                <div className="select-era" aria-hidden="true">
                  <span>HISTÓRIA DA FILOSOFIA</span>
                  <strong>
                    {previewFighter === "amenemope"
                      ? "EGITO ANTIGO"
                      : previewFighter === "homero"
                        ? "GRÉCIA HOMÉRICA"
                      : previewFighter === "plato"
                        ? "GRÉCIA ANTIGA"
                        : "FILOSOFIA MODERNA"}
                  </strong>
                </div>

                <div className="selected-fighter-art" aria-live="polite">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={previewFighter}
                    src={fighterArt(previewFighter)}
                    alt={`${FIGHTERS[previewFighter].name}, personagem selecionado`}
                  />
                </div>

                <div className="fighter-biography">
                  <span>{FIGHTERS[previewFighter].school}</span>
                  <h3>{FIGHTERS[previewFighter].name}</h3>
                  <strong>
                    {FIGHTERS[previewFighter].origin} ·{" "}
                    {FIGHTERS[previewFighter].lifespan}
                  </strong>
                  <p>{FIGHTERS[previewFighter].biography}</p>
                </div>
              </div>

              <div className="roster-panel">
                <div className="portrait-grid" role="listbox" aria-label="Filósofos">
                {FIGHTER_ORDER.map((fighter) => {
                  const meta = FIGHTERS[fighter];
                  const unavailable =
                    selectionStep === "opponent" && fighter === selectedFighter;
                  return (
                    <button
                      className={`fighter-portrait portrait-${fighter} ${
                        previewFighter === fighter ? "is-highlighted" : ""
                      } ${unavailable ? "is-unavailable" : ""}`}
                      type="button"
                      key={fighter}
                      role="option"
                      disabled={unavailable}
                      aria-selected={previewFighter === fighter}
                      aria-label={
                        unavailable
                          ? `${meta.name}, já escolhido pelo jogador`
                          : meta.name
                      }
                      onMouseEnter={() => {
                        if (!unavailable) setPreviewFighter(fighter);
                      }}
                      onFocus={() => {
                        if (!unavailable) setPreviewFighter(fighter);
                      }}
                      onClick={() => confirmSelection(fighter)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={fighterArt(fighter)} alt={meta.name} />
                      <span>{meta.name}</span>
                      {(previewFighter === fighter || unavailable) && (
                        <i aria-hidden="true">
                          {unavailable ? "P1" : selectionStep === "player" ? "P1" : "CPU"}
                        </i>
                      )}
                    </button>
                  );
                })}
                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      className="fighter-portrait locked-portrait"
                      key={`locked-${index}`}
                      aria-label="Personagem ainda bloqueado"
                    >
                      <span>?</span>
                    </div>
                  ))}
                </div>
                <div className="select-help">
                  <span>← → MOVER</span>
                  <strong>ENTER SELECIONAR</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === "dialogue" && (
          <div className="overlay dialogue-overlay">
            <div className="dialogue-stage">
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
                <img
                  src={fighterArt(selectedFighter)}
                  alt={playerMeta.name}
                />
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
                <img
                  src={fighterArt(opponentFighter)}
                  alt={enemyMeta.name}
                />
                <span>{enemyMeta.name}</span>
              </div>

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
                  resetGame();
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
              <img
                src={fighterArt(matchWinner)}
                alt={`${FIGHTERS[matchWinner].name} vencedor`}
              />
              <span className="ending-name">
                {FIGHTERS[matchWinner].name}
              </span>
            </div>

            <div className={`ending-fighter ending-${matchLoser} is-loser`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fighterArt(matchLoser)}
                alt={`${FIGHTERS[matchLoser].name} derrotado`}
              />
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
              onClick={openSelection}
            >
              NOVA DISPUTA
            </button>
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

      <section className={`control-deck ${phase === "playing" ? "is-playing" : "is-inactive"}`}>
        <div className="movement-controls" aria-label="Movimentação">
          <span className="control-title">MOVIMENTO</span>
          <div className="button-row">
            <button type="button" onClick={() => movePlayer(-1)}>
              <kbd>A</kbd>
              <span>RECUAR</span>
            </button>
            <button type="button" onClick={jump}>
              <kbd>W</kbd>
              <span>SALTAR</span>
            </button>
            <button
              type="button"
              className={playerGuarding ? "guard-active" : ""}
              onClick={guard}
            >
              <kbd>S</kbd>
              <span>DEFENDER</span>
            </button>
            <button type="button" onClick={() => movePlayer(1)}>
              <kbd>D</kbd>
              <span>AVANÇAR</span>
            </button>
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
              const locked = isSpecial && logos < 100;
              return (
                <button
                  type="button"
                  key={moveName}
                  className={isSpecial ? "special-button" : ""}
                  onClick={() => performMove(moveName)}
                  disabled={phase !== "playing" || locked}
                >
                  <kbd>{move.key}</kbd>
                  <span>{move.label}</span>
                  {isSpecial && (
                    <i>
                      {locked ? `100% ${playerMeta.meter}` : "PRONTO"}
                    </i>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <aside className="concept-panel" aria-live="polite">
        <div className="concept-symbol">Λ</div>
        <div>
          <span>CONCEITO EM COMBATE</span>
          <h3>{moveTitle}</h3>
          <p>{concept}</p>
        </div>
        <div className="prototype-note">
          <strong>PRÓLOGO DO MODO HISTÓRIA</strong>
          <span>Amenemope · Tales · Parmênides · Heráclito · Sócrates</span>
        </div>
      </aside>

      <footer>
        <p>
          Protótipo educacional original · Filosofar é entrar na arena das ideias
        </p>
          <span>VERSÃO 0.8 · AMENEMOPE</span>
      </footer>
    </main>
  );
}
