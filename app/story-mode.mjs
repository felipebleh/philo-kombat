export const STORY_STORAGE_KEY = "philo-kombat:story:disciple";

// The Doutor campaign is being authored one encounter at a time.
export const DOCTOR_OPPONENT_ORDER = [
  "homero", "tales", "diogenes", "hypatia", "averroes", "thomas",
  "machiavelli", "galileo", "hobbes", "rousseau", "hegel",
  "schopenhauer", "kierkegaard", "freud", "superintelligence",
];

export const DOCTOR_INTRO_SCENES = [
  {
    image: "/game/story-doctor-intro-01.webp",
    alt: "A Superinteligência reaparece diante de Felipe: Você resgatou alguns filósofos... mas muitos ainda estão sob meu domínio. Acha mesmo que o pensamento já está livre?",
  },
  {
    image: "/game/story-doctor-intro-02.webp",
    alt: "Em close, Felipe responde: Então voltarei a um tempo anterior à filosofia... Vou resgatar a poesia de Homero!",
  },
];

export const HOMERO_POST_FIGHT_SCENES = [
  {
    image: "/game/story-homero-after-01.webp",
    alt: "Felipe apresenta Homero: poeta grego a quem são atribuídas a Ilíada e a Odisseia. Esses poemas nasceram de uma tradição oral e ajudaram a formar a cultura grega.",
  },
  {
    image: "/game/story-homero-after-02.webp",
    alt: "Felipe explica o pensamento mítico: antes do surgimento da filosofia grega, os mitos já ofereciam explicações sobre o mundo. Suas narrativas transmitiam crenças, valores e ensinamentos entre gerações.",
  },
  {
    image: "/game/story-homero-after-03.webp",
    alt: "Felipe apresenta a Ilíada e a ira de Aquiles: o poema narra episódios da Guerra de Troia e, entre batalhas e perdas, faz pensar sobre orgulho, honra e sofrimento.",
  },
  {
    image: "/game/story-homero-after-04.webp",
    alt: "Felipe apresenta a Odisseia: Odisseu enfrenta os perigos da longa viagem de volta para casa com inteligência, coragem e persistência. Ao fundo, o navio e um mapa da Grécia antiga.",
  },
  {
    image: "/game/story-homero-after-05.webp",
    alt: "Felipe relaciona mitos e filosofia: a filosofia grega trouxe novas formas de investigar o mundo, buscando argumentos e explicações na natureza, enquanto os mitos continuaram presentes. O próximo encontro será com Tales de Mileto.",
  },
];

export const TALES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-tales-after-01.webp",
    alt: "Felipe apresenta Tales no porto de Mileto: Tales viveu em Mileto, no século VI antes de Cristo. É tradicionalmente considerado o primeiro filósofo da tradição ocidental e buscou compreender a natureza por meio de explicações racionais.",
  },
  {
    image: "/game/story-tales-after-02.webp",
    alt: "Felipe, sentado nas escadarias de Mileto, explica a pergunta pela origem: apesar de suas diferenças, todas as coisas poderiam ter uma origem comum? Os primeiros filósofos buscaram um princípio fundamental da natureza: a arché.",
  },
  {
    image: "/game/story-tales-after-03.webp",
    alt: "Felipe explica a água como arché de Tales: para Tales, esse princípio era a água. Sua proposta relacionava a diversidade do mundo a um elemento da própria natureza. Era uma explicação filosófica, que poderia ser discutida e questionada.",
  },
  {
    image: "/game/story-tales-after-04.webp",
    alt: "Tales mede uma pirâmide pelas sombras enquanto Felipe explica: relatos antigos atribuem a Tales a medição de pirâmides por meio de sombras e proporções, além da previsão de um eclipse solar. Sua trajetória aproxima a filosofia da geometria e da astronomia.",
  },
  {
    image: "/game/story-tales-after-05.webp",
    alt: "Diante da Superinteligência, Felipe anuncia: Superinteligência, agora vou avançar no tempo e recuperar Diógenes... o mais cínico dos filósofos! Ao fundo, a passagem para a Grécia antiga.",
  },
];

export const DOCTOR_POST_FIGHT_SCENES = [HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES];

export const DOCTOR_ENCOUNTERS = [
  {
    opponent: "homero",
    chapter: "Antes da filosofia, o canto",
    era: "Grécia arcaica · a poesia de Homero",
    background: "/game/arena-troia.webp",
    intro: [
      { speaker: "HOMERO", line: "Se meu canto desaparecer, quem guardará a memória dos deuses e dos heróis?", focus: "opponent" },
      { speaker: "FELIPE", line: "Sua poesia atravessou os séculos. Não deixarei que termine em silêncio!", focus: "felipe" },
    ],
    outro: [
      { speaker: "HOMERO", line: "Meu canto está livre. A Ilíada e a Odisseia poderão voltar a ser contadas.", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei a voz da poesia. Agora seguirei até Tales, que buscou na natureza o princípio de todas as coisas.", focus: "felipe" },
    ],
  },
  {
    opponent: "tales",
    chapter: "A natureza se torna pergunta",
    era: "Mileto · século VI a.C.",
    background: "/game/arena-jonia.webp",
    intro: [
      { speaker: "TALES", line: "A natureza guarda suas próprias causas. Quem apagou minha voz não apagará nossas perguntas!", focus: "opponent" },
      { speaker: "FELIPE", line: "Homero está livre. Agora vou resgatar sua busca pelo princípio de todas as coisas!", focus: "felipe" },
    ],
    outro: [
      { speaker: "TALES", line: "A água volta a correr. Com ela, a pergunta pelo princípio de todas as coisas.", focus: "opponent" },
      { speaker: "FELIPE", line: "O pensamento voltou a investigar a natureza. Agora seguirei até Diógenes, que desafia nossas convenções.", focus: "felipe" },
    ],
  },
  {
    opponent: "diogenes",
    chapter: "A liberdade não está à venda",
    era: "Grécia · século IV a.C.",
    background: "/game/arena-diogenes.webp",
    intro: [
      { speaker: "DIÓGENES", line: "Uma máquina quer decidir o que devemos pensar? Minha lanterna já encontrou vaidades menores!", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Homero e Tales. Agora vou libertar sua voz para que continue desafiando as aparências!", focus: "felipe" },
    ],
    outro: [
      { speaker: "DIÓGENES", line: "A liberdade não cabe nos cálculos dessa máquina. Que minha lanterna volte a incomodar!", focus: "opponent" },
      { speaker: "FELIPE", line: "Sua voz está livre. Agora avançarei até Hipátia, para resgatar seu pensamento e sua coragem de ensinar.", focus: "felipe" },
    ],
  },
];

export function nextDoctorEncounter(index) {
  const nextIndex = index + 1;
  return nextIndex < DOCTOR_ENCOUNTERS.length
    ? { completed: false, pending: false, index: nextIndex }
    : { completed: false, pending: true, index, nextOpponent: DOCTOR_OPPONENT_ORDER[nextIndex] };
}

export const STORY_INTRO_SCENES = [
  {
    image: "/game/story-intro-01.webp",
    alt: "Felipe dá uma aula de Filosofia usando o uniforme verde da escola.",
  },
  {
    image: "/game/story-intro-02.webp",
    alt: "Felipe caminha até o computador para mostrar como a Filosofia surgiu.",
  },
  {
    image: "/game/story-intro-03.webp",
    alt: "Felipe percebe no computador que os filósofos desapareceram da internet.",
  },
  {
    image: "/game/story-intro-04.webp",
    alt: "Um portal noticia que uma inteligência artificial roubou e apagou o pensamento dos filósofos.",
  },
  {
    image: "/game/story-intro-05.webp",
    alt: "Felipe segura um pen drive preto e anuncia seu plano de criar um avatar.",
  },
  {
    image: "/game/story-intro-06.webp",
    alt: "Felipe conecta o pen drive preto ao computador.",
  },
  {
    image: "/game/story-intro-07.webp",
    alt: "Felipe cria no computador o avatar virtual que entrará no mundo digital.",
  },
  {
    image: "/game/story-intro-08.webp",
    alt: "O avatar de Felipe confronta a Superinteligência em um data center futurista.",
  },
];

export const SOCRATES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-socrates-after-01.webp",
    alt: "Depois da luta, Felipe apresenta Sócrates, filósofo de Atenas que viveu de 470 ou 469 a.C. a 399 a.C.",
  },
  {
    image: "/game/story-socrates-after-02.webp",
    alt: "Felipe explica que Sócrates ensinava por meio de diálogos e perguntas, sem deixar escritos.",
  },
  {
    image: "/game/story-socrates-after-03.webp",
    alt: "Felipe reflete sobre o legado de Sócrates: perguntas, autoconhecimento e busca da verdade.",
  },
  {
    image: "/game/story-socrates-after-04.webp",
    alt: "Felipe recupera o pensamento de Sócrates e anuncia que vai à Academia de Platão.",
  },
];

export const PLATO_POST_FIGHT_SCENES = [
  {
    image: "/game/story-plato-after-01.webp",
    alt: "Felipe apresenta Platão, discípulo de Sócrates e fundador da Academia em Atenas.",
  },
  {
    image: "/game/story-plato-after-02.webp",
    alt: "Felipe explica a distinção de Platão entre o mundo sensível e o mundo das Ideias.",
  },
  {
    image: "/game/story-plato-after-03.webp",
    alt: "Felipe apresenta os prisioneiros que veem sombras na Alegoria da Caverna.",
  },
  {
    image: "/game/story-plato-after-04.webp",
    alt: "Felipe explica a saída da caverna como busca do conhecimento verdadeiro.",
  },
  {
    image: "/game/story-plato-after-05.webp",
    alt: "Felipe apresenta o filósofo rei e a ideia platônica de governo dos sábios.",
  },
  {
    image: "/game/story-plato-after-06.webp",
    alt: "Felipe exige da Superinteligência o pensamento de Aristóteles, discípulo de Platão.",
  },
];

export const ARISTOTLE_POST_FIGHT_SCENES = [
  {
    image: "/game/story-aristotle-after-01.webp",
    alt: "Felipe apresenta Aristóteles, amigo e discípulo de Platão, na Academia de Atenas.",
  },
  {
    image: "/game/story-aristotle-after-02.webp",
    alt: "Felipe explica que Aristóteles fundou o Liceu e estudou o mundo concreto.",
  },
  {
    image: "/game/story-aristotle-after-03.webp",
    alt: "Felipe apresenta as áreas estudadas por Aristóteles: lógica, ética, política e natureza.",
  },
  {
    image: "/game/story-aristotle-after-04.webp",
    alt: "Felipe mostra a Ética a Nicômaco e explica a virtude como equilíbrio entre excessos.",
  },
  {
    image: "/game/story-aristotle-after-05.webp",
    alt: "Felipe apresenta a ideia aristotélica de que o ser humano vive em comunidade política.",
  },
  {
    image: "/game/story-aristotle-after-06.webp",
    alt: "No mundo digital, Felipe desafia a Superinteligência a libertar Agostinho.",
  },
];

export const AUGUSTINE_POST_FIGHT_SCENES = [
  {
    image: "/game/story-augustine-after-01.webp",
    alt: "Felipe apresenta Agostinho, filósofo nascido no norte da África e bispo de Hipona.",
  },
  {
    image: "/game/story-augustine-after-02.webp",
    alt: "Felipe explica a busca interior pela verdade e o autoconhecimento em Agostinho.",
  },
  {
    image: "/game/story-augustine-after-03.webp",
    alt: "Felipe apresenta fé e razão como caminhos complementares na busca da verdade.",
  },
  {
    image: "/game/story-augustine-after-04.webp",
    alt: "Felipe explica o mal como privação do bem e a importância do livre-arbítrio.",
  },
  {
    image: "/game/story-augustine-after-05.webp",
    alt: "Felipe enfrenta a Superinteligência para recuperar o pensamento de Descartes.",
  },
];

export const DESCARTES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-descartes-after-01.webp",
    alt: "Felipe apresenta René Descartes, filósofo e matemático francês da Filosofia moderna.",
  },
  {
    image: "/game/story-descartes-after-02.webp",
    alt: "Felipe explica a dúvida metódica de Descartes e sua busca de uma certeza impossível de negar.",
  },
  {
    image: "/game/story-descartes-after-03.webp",
    alt: "Felipe apresenta a primeira certeza de Descartes: penso, logo existo.",
  },
  {
    image: "/game/story-descartes-after-04.webp",
    alt: "Felipe explica as etapas do método cartesiano: evidência, análise, síntese e revisão.",
  },
  {
    image: "/game/story-descartes-after-05.webp",
    alt: "Felipe apresenta a distinção cartesiana entre mente pensante e corpo material.",
  },
  {
    image: "/game/story-descartes-after-06.webp",
    alt: "Felipe desafia a Superinteligência para resgatar o pensamento de Locke.",
  },
];

export const LOCKE_POST_FIGHT_SCENES = [
  {
    image: "/game/story-locke-after-01.webp",
    alt: "Felipe apresenta John Locke e explica que o conhecimento começa com a experiência.",
  },
  {
    image: "/game/story-locke-after-02.webp",
    alt: "Felipe explica a tábula rasa: a mente não nasce com ideias inatas, mas se forma pela experiência.",
  },
  {
    image: "/game/story-locke-after-03.webp",
    alt: "Felipe mostra como sensação e reflexão contribuem para formar ideias em Locke.",
  },
  {
    image: "/game/story-locke-after-04.webp",
    alt: "Felipe apresenta os direitos naturais de vida, liberdade e propriedade e o consentimento político.",
  },
  {
    image: "/game/story-locke-after-05.webp",
    alt: "Felipe enfrenta a Superinteligência para recuperar o pensamento de Kant.",
  },
];

export const KANT_POST_FIGHT_SCENES = [
  {
    image: "/game/story-kant-after-01.webp",
    alt: "Felipe apresenta Immanuel Kant, filósofo de Königsberg que investigou os limites da razão humana.",
  },
  {
    image: "/game/story-kant-after-02.webp",
    alt: "Felipe explica a revolução copernicana de Kant: o sujeito organiza a experiência por meio das estruturas da razão.",
  },
  {
    image: "/game/story-kant-after-03.webp",
    alt: "Felipe distingue o fenômeno, como as coisas aparecem, do númeno, que não conhecemos diretamente.",
  },
  {
    image: "/game/story-kant-after-04.webp",
    alt: "Felipe apresenta a ética do dever, a autonomia e princípios que possam valer para todos.",
  },
  {
    image: "/game/story-kant-after-05.webp",
    alt: "Felipe e Kant contemplam um céu estrelado para explicar o sublime, a natureza e a força da razão.",
  },
  {
    image: "/game/story-kant-after-06.webp",
    alt: "Felipe desafia a Superinteligência, que anuncia um revolucionário para o próximo encontro: Marx.",
  },
];

export const MARX_POST_FIGHT_SCENES = [
  {
    image: "/game/story-marx-after-01.webp",
    alt: "Felipe apresenta Karl Marx, sua parceria com Friedrich Engels e a análise do capitalismo industrial.",
  },
  {
    image: "/game/story-marx-after-02.webp",
    alt: "Felipe explica a produção da existência material, as classes sociais e os conflitos históricos em Marx.",
  },
  {
    image: "/game/story-marx-after-03.webp",
    alt: "Felipe apresenta o trabalho alienado, no qual o trabalhador perde o controle sobre o produto e sua atividade.",
  },
  {
    image: "/game/story-marx-after-04.webp",
    alt: "Felipe mostra O Capital e explica a mais-valia e a exploração do trabalho na teoria de Marx.",
  },
  {
    image: "/game/story-marx-after-05.webp",
    alt: "Felipe apresenta a práxis e a transformação da realidade diante de Marx, Engels e trabalhadores organizados.",
  },
  {
    image: "/game/story-marx-after-06.webp",
    alt: "Em um núcleo digital desmoronando, Felipe desafia a Superinteligência, que anuncia Nietzsche como o próximo adversário.",
  },
];

export const NIETZSCHE_POST_FIGHT_SCENES = [
  {
    image: "/game/story-nietzsche-after-01.webp",
    alt: "Felipe apresenta Friedrich Nietzsche, filósofo que questionou a moral, a religião e os valores de seu tempo.",
  },
  {
    image: "/game/story-nietzsche-after-02.webp",
    alt: "Felipe explica a morte de Deus como crise dos valores absolutos e apresenta o problema do niilismo.",
  },
  {
    image: "/game/story-nietzsche-after-03.webp",
    alt: "Felipe apresenta a Filosofia com o martelo, a crítica e a genealogia dos valores em Nietzsche.",
  },
  {
    image: "/game/story-nietzsche-after-04.webp",
    alt: "Felipe explica o além-do-homem como autossuperação e capacidade de criar novos valores e modos de viver.",
  },
  {
    image: "/game/story-nietzsche-after-05.webp",
    alt: "Felipe apresenta o eterno retorno como desafio de afirmar a própria vida e suas escolhas.",
  },
  {
    image: "/game/story-nietzsche-after-06.webp",
    alt: "A Superinteligência gigante desafia Felipe a provar que recuperou o pensamento dos filósofos antes do confronto final.",
  },
];

export const STORY_POST_FIGHT_SCENES = [
  SOCRATES_POST_FIGHT_SCENES,
  PLATO_POST_FIGHT_SCENES,
  ARISTOTLE_POST_FIGHT_SCENES,
  AUGUSTINE_POST_FIGHT_SCENES,
  DESCARTES_POST_FIGHT_SCENES,
  LOCKE_POST_FIGHT_SCENES,
  KANT_POST_FIGHT_SCENES,
  MARX_POST_FIGHT_SCENES,
  NIETZSCHE_POST_FIGHT_SCENES,
];

export const STORY_ENCOUNTERS = [
  {
    opponent: "socrates",
    chapter: "A pergunta que desperta",
    era: "Atenas · 399 a.C.",
    background: "/game/arena-agora.webp",
    intro: [{ speaker: "SÓCRATES", line: "Antes de ensinar, professor, mostre que sabe interrogar a si mesmo.", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "A primeira vitória foi admitir que toda resposta começa com uma pergunta.", focus: "felipe" }],
  },
  {
    opponent: "plato",
    chapter: "Além das aparências",
    era: "Academia de Atenas",
    background: "/game/arena-agora.webp",
    intro: [{ speaker: "PLATÃO", line: "As sombras parecem reais. Você consegue lutar sem confundi-las com a verdade?", focus: "opponent" }],
    outro: [{ speaker: "PLATÃO", line: "Você saiu da caverna sem esquecer quem ainda procura a luz.", focus: "opponent" }],
  },
  {
    opponent: "aristotle",
    chapter: "A medida das coisas",
    era: "Liceu de Atenas",
    background: "/game/arena-liceu.webp",
    intro: [{ speaker: "ARISTÓTELES", line: "Uma boa intenção precisa de hábito, método e justa medida.", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "Pensar também é praticar: argumento sem ação permanece potência.", focus: "felipe" }],
  },
  {
    opponent: "agostinho",
    chapter: "O mestre interior",
    era: "Hipona · século V",
    background: "/game/arena-agostinho.webp",
    intro: [{ speaker: "AGOSTINHO", line: "Não viajes para longe antes de examinar o que habita dentro de ti.", focus: "opponent" }],
    outro: [{ speaker: "AGOSTINHO", line: "Ao duvidar, você encontrou uma certeza: existe alguém procurando a verdade.", focus: "opponent" }],
  },
  {
    opponent: "descartes",
    chapter: "A dúvida como método",
    era: "Europa · século XVII",
    background: "/game/arena-descartes.webp",
    intro: [{ speaker: "DESCARTES", line: "Duvide de tudo o que puder. O que restará de pé na arena?", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "A dúvida não destruiu o caminho; ela retirou o que não podia sustentá-lo.", focus: "felipe" }],
  },
  {
    opponent: "locke",
    chapter: "As marcas da experiência",
    era: "Inglaterra · século XVII",
    background: "/game/arena-locke.webp",
    intro: [{ speaker: "LOCKE", line: "Nenhuma ideia entra pronta na mente. Mostre o que sua experiência ensinou.", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "Cada encontro escreveu uma nova linha onde antes havia apenas uma página em branco.", focus: "felipe" }],
  },
  {
    opponent: "kant",
    chapter: "Os limites da razão",
    era: "Königsberg · século XVIII",
    background: "/game/arena-kant.webp",
    intro: [{ speaker: "KANT", line: "A experiência oferece matéria; a razão lhe dá forma. Una as duas sem ultrapassar seus limites.", focus: "opponent" }],
    outro: [{ speaker: "KANT", line: "Você ousou saber — e reconheceu que a liberdade exige responsabilidade.", focus: "opponent" }],
  },
  {
    opponent: "marx",
    chapter: "Ideias em movimento",
    era: "Londres · século XIX",
    background: "/game/arena-marx.webp",
    intro: [{ speaker: "MARX", line: "Não basta interpretar a arena. É preciso compreender quem a construiu e transformá-la.", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "Toda ideia carrega as condições do mundo — e a possibilidade de mudá-lo.", focus: "felipe" }],
  },
  {
    opponent: "nietzsche",
    chapter: "Criar os próprios valores",
    era: "Sils-Maria · século XIX",
    background: "/game/arena-sils-maria.webp",
    intro: [{ speaker: "NIETZSCHE", line: "Depois de enfrentar tantos mestres, ainda precisa que alguém lhe entregue uma verdade?", focus: "opponent" }],
    outro: [{ speaker: "FELIPE", line: "Aprendi com os mestres sem viver à sombra deles. Agora posso criar e responder por meus valores.", focus: "felipe" }],
  },
  {
    opponent: "superintelligence",
    chapter: "A última pergunta",
    era: "O futuro das ideias",
    background: "/game/arena-supercomputer.webp",
    intro: [
      { speaker: "FELIPE", line: "Já lutei com vários filósofos. Agora quero lutar contra você!", focus: "felipe" },
      { speaker: "SUPERINTELIGÊNCIA", line: "Você recuperou fragmentos do pensamento. Resta provar que sabe usá-los.", focus: "opponent" },
    ],
    outro: [
      { speaker: "SUPERINTELIGÊNCIA", line: "Impossível... as perguntas não deveriam superar meus cálculos.", focus: "opponent" },
      { speaker: "FELIPE", line: "O pensamento não pertence a uma máquina. Ele vive quando é compartilhado.", focus: "felipe" },
    ],
  },
];

export function nextDiscipleEncounter(index) {
  const nextIndex = index + 1;
  return nextIndex >= STORY_ENCOUNTERS.length
    ? { completed: true, index }
    : { completed: false, index: nextIndex };
}

// Warm only the visible art and its next scene, after entering the campaign.
// During a fight, prepare its first reward scene without downloading the chapter.
export function storyImagePreloadUrls({
  mode,
  phase,
  campaign = "disciple",
  introIndex = 0,
  encounterIndex = 0,
  sceneStep = 0,
}) {
  if (mode !== "story") return [];
  if (phase === "story-intro") {
    const intro = campaign === "doctor" ? DOCTOR_INTRO_SCENES : STORY_INTRO_SCENES;
    return intro.slice(introIndex, introIndex + 2).map(({ image }) => image);
  }
  const postFightScenes = campaign === "doctor" ? DOCTOR_POST_FIGHT_SCENES : STORY_POST_FIGHT_SCENES;
  const recap = postFightScenes[encounterIndex] ?? [];
  if (phase === "story-recap") {
    return recap.slice(sceneStep, sceneStep + 2).map(({ image }) => image);
  }
  if (phase !== "playing" && phase !== "won") return [];
  const urls = recap.slice(0, 1).map(({ image }) => image);
  if (campaign !== "doctor" && encounterIndex === STORY_ENCOUNTERS.length - 1) {
    urls.push("/game/story-ending-philosophers-v1.webp", "/game/story-ending-felipe-toss-v1.webp");
  }
  return urls;
}
