import { GRAND_INTRO_SCENES, GRAND_POST_FIGHT_SCENES } from "./grand-story.mjs";
import { DOCTOR_ENDING_ASSETS } from "./doctor-ending.mjs";

export const STORY_STORAGE_KEY = "philo-kombat:story:disciple";

// The Doutor campaign is being authored one encounter at a time.
export const DOCTOR_OPPONENT_ORDER = [
  "homero", "tales", "diogenes", "hypatia", "averroes", "thomas",
  "machiavelli", "galileo", "hobbes", "rousseau", "hegel",
  "schopenhauer", "kierkegaard", "freud", "felipe-cyborg",
];

export const DOCTOR_FINAL_ENCOUNTER_INDEX = DOCTOR_OPPONENT_ORDER.length - 1;

export const DOCTOR_FINAL_PRE_FIGHT_SCENES = [
  {
    image: "/game/story-doctor-final-before-01.webp",
    alt: "Uma pausa para a leitura. Sentada numa poltrona na sala de servidores, a Superinteligência lê Histórias que Pensam — Filosofando através de contos, de Felipe R. G. Camargo, e diz: Você acertou as quatro questões, professor. Só um instante... esta leitura está ficando interessante.",
  },
  {
    image: "/game/story-doctor-final-before-02.webp",
    alt: "Até a SuperIA recomenda. A Superinteligência apresenta Histórias que Pensam e diz: Preciso admitir: seu livro é muito bom! Até uma superinteligência encontra aqui motivos para continuar pensando. Conheça o livro na Amazon: https://a.co/d/0cXWi78j. A arte inclui um QR Code para a página do livro.",
  },
  {
    image: "/game/story-doctor-final-before-03.webp",
    alt: "Uma nova ameaça. Segurando o livro diante de um holograma do rosto de Felipe, a Superinteligência ameaça: Mas por que ficar apenas com seu livro... se também posso roubar o seu pensamento?",
  },
  {
    image: "/game/story-doctor-final-before-04.webp",
    alt: "O nascimento das trevas. De costas para o jogador, a Superinteligência contempla no monitor Felipe das Trevas, com metade do rosto e um braço robóticos, olhos vermelhos e regata preta, e anuncia: Conheça minha nova criação, professor. Ela pensa como você... e luta por mim. No monitor: Felipe das Trevas — ATIVADO.",
  },
];

export function doctorIntroScenes(encounterIndex = 0) {
  return encounterIndex === DOCTOR_FINAL_ENCOUNTER_INDEX
    ? DOCTOR_FINAL_PRE_FIGHT_SCENES
    : DOCTOR_INTRO_SCENES;
}

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

export const DIOGENES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-diogenes-after-01.webp",
    alt: "Felipe apresenta Diógenes de Sinope no ágora: um dos principais representantes do cinismo, que transformou sua maneira de viver em uma crítica ao luxo, às aparências e às convenções sociais. Simplicidade, autonomia e crítica às convenções.",
  },
  {
    image: "/game/story-diogenes-after-02.webp",
    alt: "Felipe, sentado ao lado de Diógenes, explica a liberdade da simplicidade: para Diógenes, a liberdade exigia reduzir as necessidades artificiais. Quanto mais dependemos de riquezas e da aprovação dos outros, mais difícil pode ser viver com autonomia. De quanto precisamos para viver?",
  },
  {
    image: "/game/story-diogenes-after-03.webp",
    alt: "Diógenes provoca as pessoas da praça com sua lanterna em pleno dia. Felipe explica: um relato antigo conta que Diógenes procurava um ser humano com uma lamparina em pleno dia. A provocação nos convida a perguntar se vivemos com autenticidade ou apenas representamos papéis.",
  },
  {
    image: "/game/story-diogenes-after-04.webp",
    alt: "Felipe observa Diógenes e Alexandre do alto de uma árvore. Segundo uma conhecida história, Alexandre ofereceu a Diógenes o que ele desejasse. O filósofo pediu apenas que saísse da frente do sol. Nem todo poder consegue comprar uma pessoa livre.",
  },
  {
    image: "/game/story-diogenes-after-05.webp",
    alt: "Na sala de servidores, Felipe fala ao telão da Superinteligência: Aprendi muito com Diógenes, Superinteligência! Mas agora preciso libertar o pensamento de uma mulher: Hipátia!",
  },
];

export const HYPATIA_POST_FIGHT_SCENES = [
  {
    image: "/game/story-hypatia-after-01.webp",
    alt: "Felipe apresenta Hipátia ensinando em Alexandria, no Egito: Hipátia viveu entre os séculos IV e V depois de Cristo. Filósofa, matemática e astrônoma, tornou-se uma professora respeitada, que atraía estudantes de diferentes lugares. Época e lugar: Alexandria, Egito; nascimento entre 350 e 370 d.C.; morte em 415 d.C.",
  },
  {
    image: "/game/story-hypatia-after-02.webp",
    alt: "Felipe observa as estrelas enquanto Hipátia estuda seu astrolábio: Hipátia estudava matemática e astronomia, áreas ligadas à filosofia em sua época. As figuras geométricas e os movimentos dos astros faziam parte da busca por compreender a ordem do mundo. Entre figuras e estrelas: geometria, astronomia e filosofia.",
  },
  {
    image: "/game/story-hypatia-after-03.webp",
    alt: "Felipe acompanha uma aula de neoplatonismo com Hipátia: Hipátia estava ligada ao neoplatonismo, tradição inspirada em Platão. Nessa perspectiva, a filosofia e a matemática contribuíam para educar a alma e orientar a vida para a verdade e o bem. Conhecimento, formação da alma e busca do bem.",
  },
  {
    image: "/game/story-hypatia-after-04.webp",
    alt: "Felipe segura um pergaminho diante do manto e dos instrumentos de Hipátia: Em 415, Hipátia foi assassinada em meio a conflitos políticos e religiosos em Alexandria. Sua história nos convida a refletir sobre a intolerância e a defender a liberdade de ensinar, aprender e pensar. Memória e liberdade: a luz do saber persiste.",
  },
  {
    image: "/game/story-hypatia-after-05.webp",
    alt: "No console dos servidores, Felipe fala ao telão da Superinteligência: Superinteligência, o pensamento de Hipátia está livre! Agora vou atravessar os séculos e resgatar Averróis! Ao fundo, uma passagem para o próximo encontro do modo Doutor.",
  },
];

export const AVERROES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-averroes-after-01.webp?v=20261021",
    alt: "Felipe apresenta Averróis estudando em Córdoba: Averróis, também chamado Ibn Rushd, viveu de 1126 a 1198. Nascido em Córdoba, em Al-Andalus, foi filósofo, médico e jurista. Seus comentários sobre Aristóteles marcaram a história da filosofia.",
  },
  {
    image: "/game/story-averroes-after-02.webp",
    alt: "Felipe acompanha Averróis debatendo com estudiosos em Córdoba: para Averróis, a razão e a fé podiam caminhar juntas. A investigação filosófica ajudava a compreender a religião, e aparentes conflitos exigiam examinar os argumentos e interpretar cuidadosamente os textos sagrados. Investigar, argumentar e interpretar.",
  },
  {
    image: "/game/story-averroes-after-03.webp",
    alt: "Averróis ergue uma bandeira de Aristóteles enquanto Felipe faz sinal de aprovação: um dos grandes legados de Averróis foi manter vivo e renovar o debate sobre Aristóteles. Traduzidos para o hebraico e o latim, seus comentários atravessaram fronteiras e influenciaram gerações de pensadores.",
  },
  {
    image: "/game/story-averroes-after-04.webp",
    alt: "Na sala de servidores, Felipe anuncia ao telão: Superinteligência, resgatei o pensamento de Averróis! Agora vou encontrar Tomás de Aquino e continuar essa jornada entre a razão e a fé! Ao fundo, uma passagem para o próximo resgate do Modo Doutor.",
  },
];

export const THOMAS_POST_FIGHT_SCENES = [
  {
    image: "/game/story-thomas-after-01.webp",
    alt: "Felipe apresenta Tomás de Aquino, que viveu aproximadamente de 1225 a 1274, escrevendo em uma biblioteca: foi um frade dominicano e um dos grandes pensadores da escolástica. Segundo a tradição, seus colegas o chamavam de Boi Mudo por ser muito calado. Mas Alberto Magno, seu mestre, reconheceu o talento daquele aluno: suas ideias ainda fariam muito barulho!",
  },
  {
    image: "/game/story-thomas-after-02.webp",
    alt: "Felipe lê sobre uma ponte entre as torres da Razão e da Fé enquanto Tomás assenta uma pedra: para Tomás de Aquino, razão e fé podem caminhar juntas. Influenciado por Aristóteles, ele usou a filosofia para dialogar com a teologia cristã. A razão pode conhecer certas verdades; outras, como a Trindade, dependem da revelação. Razão e fé: distintas, mas compatíveis.",
  },
  {
    image: "/game/story-thomas-after-03.webp",
    alt: "Felipe e Tomás observam um grande livro com miniaturas das cinco vias: Tomás apresentou cinco vias para defender racionalmente a existência de Deus. Ele partiu do movimento, das causas eficientes, da contingência, dos graus de perfeição e da finalidade na natureza. Em cada via, argumentou em favor de um fundamento que identificava como Deus.",
  },
  {
    image: "/game/story-thomas-after-04.webp",
    alt: "Sentada em um trono na sala de servidores, a SuperIA mostra O Príncipe a Felipe e diz: Resgatou Tomás de Aquino? Muito bem, professor... Agora tenho um príncipe à sua espera. Vamos ver como você se sai diante das ideias de Maquiavel! Próximo resgate: Maquiavel.",
  },
];

export const MACHIAVELLI_POST_FIGHT_SCENES = [
  {
    image: "/game/story-machiavelli-after-01.webp",
    alt: "Felipe, coroado e sentado em um trono, apresenta Maquiavel segurando O Príncipe: Nicolau Maquiavel foi um diplomata e pensador político do Renascimento. Em O Príncipe, investigou como conquistar e conservar o poder. Agora o tamanho do desafio: ganhar a coroa foi fácil... quero ver conservar esse poder! 1469–1527; Florença; Renascimento.",
  },
  {
    image: "/game/story-machiavelli-after-02.webp",
    alt: "Felipe recebe flores enquanto Maquiavel observa os guardas: é melhor ser amado ou temido? Para Maquiavel, o ideal seria reunir os dois. Quando isso não é possível, ele considera mais seguro ser temido. Mas há um cuidado essencial: o governante deve evitar o ódio. Como suas ações afetam as pessoas? Amado ou temido: um limite, evitar o ódio.",
  },
  {
    image: "/game/story-machiavelli-after-03.webp",
    alt: "Felipe assume o leme enquanto Maquiavel ajusta as velas de um navio entre a tempestade e o sol: em Maquiavel, fortuna são as circunstâncias e os imprevistos que trazem oportunidades ou dificuldades. Virtù é a capacidade de agir com estratégia, coragem e adaptação. O governante precisa se preparar e aproveitar as oportunidades. Nesta viagem, o vento muda... e a gente ajusta as velas!",
  },
  {
    image: "/game/story-machiavelli-after-04.webp?v=20261021",
    alt: "Felipe revela os bastidores de um retrato enquanto Maquiavel escreve: para Maquiavel, a imagem pública ajuda a sustentar o poder. Em O Príncipe, ele destaca a importância de parecer justo, fiel e piedoso. Também admite agir contra essas virtudes para conservar o Estado. E aí: a aparência conta toda a história? Aparência e poder: o que a imagem revela, o que esconde?",
  },
  {
    image: "/game/story-machiavelli-after-05.webp",
    alt: "Na sala de servidores, Felipe entrega uma coroa à SuperIA sentada em seu trono, diante do portal para Galileu: Pode ficar com a coroa, SuperIA! Aprendi muito com Maquiavel, mas minha jornada vai além desse trono. Agora vou libertar o pensamento de Galileu e olhar o céu com outros olhos! Próximo resgate: Galileu.",
  },
];

export const GALILEO_POST_FIGHT_SCENES = [
  {
    image: "/game/story-galileo-after-01.webp",
    alt: "Felipe segura uma luneta ao lado de Galileu, que escreve sob o céu de Florença: Galileu Galilei foi um dos grandes nomes da Revolução Científica. Ao combinar observações, experimentos e matemática, ajudou a transformar o estudo da natureza. Ele aperfeiçoou a luneta e a apontou para o céu, encontrando novidades que desafiavam antigas certezas. Deixe eu olhar também! 1564–1642; astronomia e física.",
  },
  {
    image: "/game/story-galileo-after-02.webp",
    alt: "Felipe segura um globo terrestre enquanto Galileu apresenta Júpiter e suas quatro luas: com a luneta, Galileu observou quatro luas girando em torno de Júpiter. Isso mostrava que nem tudo orbitava a Terra! Ele também observou as fases de Vênus, incompatíveis com o modelo tradicional de Ptolomeu. Essas descobertas fortaleceram sua defesa do heliocentrismo de Copérnico.",
  },
  {
    image: "/game/story-galileo-after-03.webp",
    alt: "Felipe anota observações ao pé da Torre de Pisa enquanto Galileu aparece no alto: Aristóteles defendia que corpos mais pesados caíam mais depressa. Galileu questionou essa ideia: sem a resistência do ar, corpos de massas diferentes caem com a mesma aceleração. O famoso relato da Torre de Pisa ilustra essa discussão, embora sua realização histórica seja incerta. Na ciência, as ideias precisam ser testadas! Observar, medir e testar.",
  },
  {
    image: "/game/story-galileo-after-04.webp",
    alt: "Felipe lê diante de Galileu e do tribunal: em 1633, Galileu foi julgado pela Inquisição por defender o heliocentrismo. Foi obrigado a se retratar e passou seus últimos anos em prisão domiciliar. O episódio envolveu disputas religiosas, políticas e científicas. Sua história nos faz perguntar: o que acontece com o conhecimento quando a autoridade tenta limitar a investigação? Julgamento em Roma; retratação forçada.",
  },
  {
    image: "/game/story-galileo-after-05.webp",
    alt: "Na sala de servidores, a SuperIA apresenta um holograma da cidade a Felipe e diz: Você aprendeu a observar os astros, professor... Agora quero ver compreender os homens quando o medo toma conta! Felipe responde: Então meu próximo resgate é Hobbes. Vamos descobrir como construir a paz! Próximo resgate: Hobbes.",
  },
];

export const HOBBES_POST_FIGHT_SCENES = [
  {
    image: "/game/story-hobbes-after-01.webp",
    alt: "Felipe apresenta Thomas Hobbes diante das guerras civis inglesas. Hobbes viveu de 1588 a 1679. Em Leviatã, publicado em 1651, investigou como construir a paz e garantir a segurança. Para ele, o medo da morte e o desejo de uma vida melhor ajudam a explicar por que buscamos um poder comum. Como viver sem medo? Inglaterra; Leviatã, 1651.",
  },
  {
    image: "/game/story-hobbes-after-02.webp",
    alt: "Felipe e Hobbes observam um ladrão roubando moedas de uma mulher, enquanto a sombra do ladrão projeta um lobo na parede. Para Hobbes, sem um poder comum que garanta a segurança, a competição e a desconfiança podem levar ao conflito. O estado de natureza é essa condição de insegurança, em que todos podem se tornar uma ameaça para todos. O homem é o lobo do homem: expressão de Plauto, retomada por Hobbes.",
  },
  {
    image: "/game/story-hobbes-after-03.webp",
    alt: "Felipe e Hobbes acompanham a assinatura de um pacto pela paz. Para sair dessa insegurança, os indivíduos firmam um pacto entre si e autorizam um poder soberano a manter a paz. Eles abrem mão de parte de sua liberdade para que um poder comum garanta a proteção e faça cumprir as regras. Esse é o contrato social em Hobbes! Pacto entre indivíduos; autorização do soberano; proteção e paz.",
  },
  {
    image: "/game/story-hobbes-after-04.webp",
    alt: "Felipe aparece entre as pessoas que formam o corpo do Leviatã e explica: Olhe só, eu também faço parte desse corpo! No Leviatã, Hobbes representa o Estado como um homem artificial, formado pela união de muitos indivíduos. O pacto autoriza um poder soberano, responsável por garantir a paz e a proteção. A força desse gigante vem daqueles que o constituem! Muitos indivíduos; um poder soberano; paz e proteção.",
  },
  {
    image: "/game/story-hobbes-after-05.webp",
    alt: "Na sala de servidores, a SuperIA ajusta o capuz de uma fantasia de lobo diante do portal para a natureza e diz: O medo foi só o começo, professor... Pronto para o próximo desafio? Felipe responde: Agora quero enfrentar o último dos grandes contratualistas: Rousseau! Próximo resgate do Modo Doutor: Rousseau.",
  },
];

export const ROUSSEAU_POST_FIGHT_SCENES = [
  {
    image: "/game/story-rousseau-after-01.webp",
    alt: "Felipe apresenta Jean-Jacques Rousseau na floresta, sentado sobre as pedras de um riacho enquanto o filósofo observa uma planta. Resgatamos Jean-Jacques Rousseau, filósofo e escritor de Genebra! Ele valorizou os sentimentos, a compaixão e o contato com a natureza, influenciando o Romantismo. Criticou uma vida guiada pela vaidade, pelas aparências e pela aprovação dos outros. Em suas obras, buscou caminhos para preservar a liberdade e viver com mais autenticidade. 1712–1778; natureza e sociedade.",
  },
  {
    image: "/game/story-rousseau-after-02.webp",
    alt: "Felipe e Rousseau observam um pomar cercado, com uma placa É meu!, enquanto outras pessoas ficam do lado de fora. Para Rousseau, a desigualdade social tem uma história. A propriedade, a dependência e os privilégios foram criando uma distância entre ricos e pobres. Como uma diferença se transforma em poder de uns sobre os outros? Propriedade; dependência; privilégios.",
  },
  {
    image: "/game/story-rousseau-after-03.webp",
    alt: "Felipe exibe correntes rompidas enquanto Rousseau apresenta Do Contrato Social a uma assembleia reunida ao redor de uma mesa. Para Rousseau, um contrato legítimo forma um corpo político em que o próprio povo é soberano. Cada cidadão participa da elaboração das leis e também se submete a elas. A liberdade civil nasce dessa participação: viver sob leis que ajudamos a estabelecer, orientadas pelo bem comum. Soberania popular; liberdade civil; bem comum.",
  },
  {
    image: "/game/story-rousseau-after-04.webp",
    alt: "Felipe e Rousseau mostram uma fonte cujos canais distribuem água à comunidade, enquanto um privilegiado tenta reservar a água para seu jardim. A vontade geral busca o bem comum. Ela não é apenas a soma dos desejos particulares: cada cidadão deve considerar regras que possam valer para todos. No uso desta água, uma lei justa deve atender à comunidade, em vez de favorecer somente o jardim de um privilegiado. Interesse comum; leis para todos; liberdade e igualdade.",
  },
  {
    image: "/game/story-rousseau-after-05.webp",
    alt: "Na sala de servidores, Felipe levanta três dedos diante da SuperIA, que segura uma peça de um quebra-cabeça da história. Felipe anuncia: Resgatei os três grandes contratualistas: Hobbes, Locke e Rousseau! Agora é a vez de Hegel! A SuperIA responde: Muito bem, professor... Vamos ver se você compreende a história em movimento! Próximo resgate do Modo Doutor: Hegel.",
  },
];

export const HEGEL_POST_FIGHT_SCENES = [
  {
    image: "/game/story-hegel-after-01.webp",
    alt: "Felipe, com a coruja no ombro, apresenta Hegel diante de Berlim ao anoitecer. Hegel — 1770–1831; Georg Wilhelm Friedrich Hegel. Felipe explica: Professor em Berlim, Hegel foi um dos grandes filósofos alemães. Suas ideias sobre história, liberdade e dialética influenciaram Marx e gerações de pensadores. Hegel responde: A coruja de Minerva levanta voo ao anoitecer: a filosofia compreende seu tempo quando uma forma de vida já amadureceu.",
  },
  {
    image: "/game/story-hegel-after-02.webp",
    alt: "Hegel — a vida em movimento. Felipe trabalha como jardineiro ao lado de Hegel, mostrando semente, flor e fruto. Da semente à flor e ao fruto, ilustramos a transformação. Tese, antítese e síntese são um esquema didático para compreender esse movimento da dialética. Hegel confirma: Superar também é conservar! A verdade não está num momento isolado, mas no desenvolvimento do todo.",
  },
  {
    image: "/game/story-hegel-after-03.webp",
    alt: "Hegel — senhor e escravo. Felipe e Hegel conversam numa construção acima de um senhor transportado por seus escravos. Felipe explica: Para Hegel, o senhor parece independente, mas depende do escravo. Já o escravo, ao trabalhar e transformar o mundo, desenvolve suas capacidades e a consciência de si. Hegel confirma: Exatamente! Pelo trabalho, a consciência transforma o mundo e também forma a si mesma.",
  },
  {
    image: "/game/story-hegel-after-04.webp",
    alt: "Hegel — o Espírito do Tempo. Em Jena, 1806, Felipe e Hegel observam Napoleão a cavalo. Felipe explica: O espírito do tempo aparece nas ideias, na cultura e nas instituições de uma época. Hegel viu em Napoleão um agente das grandes transformações de seu tempo. Hegel responde: Em 1806, ao vê-lo a cavalo em Jena, chamei-o de alma do mundo!",
  },
  {
    image: "/game/story-hegel-after-05.webp",
    alt: "Na sala de servidores do Modo Doutor, a SuperIA mostra Schopenhauer com sua bengala num holograma e diz: Você resgatou Hegel, professor... Mas o próximo pensador tem uma visão bem menos otimista da existência! Felipe responde: Então chegou a vez de Schopenhauer! Vamos investigar a vontade, o desejo e o sofrimento. Próximo resgate: Schopenhauer.",
  },
];

export const SCHOPENHAUER_POST_FIGHT_SCENES = [
  {
    image: "/game/story-schopenhauer-after-01.webp",
    alt: "Schopenhauer — 1788–1860; Arthur Schopenhauer. Felipe e Schopenhauer conversam num banco à beira do rio em Frankfurt, acompanhados por um cão branco. Felipe apresenta: Arthur Schopenhauer nasceu em Danzig e viveu muitos anos em Frankfurt. Em O mundo como vontade e representação, investigou o desejo e o sofrimento. Seu pensamento influenciou Nietzsche. Schopenhauer responde: A razão nem sempre governa: somos movidos por uma vontade que nunca se satisfaz por completo.",
  },
  {
    image: "/game/story-schopenhauer-after-02.webp",
    alt: "Schopenhauer — vontade e representação. Diante de uma padaria, Felipe aponta para os pães e diz: Para Schopenhauer, conhecemos o mundo como representação. Já a vontade é vivida em nosso próprio corpo: vejo o pão, mas também sinto a fome! Schopenhauer confirma: Isso mesmo! A fome é uma manifestação da vontade, um impulso cego presente em toda a natureza.",
  },
  {
    image: "/game/story-schopenhauer-after-03.webp",
    alt: "Schopenhauer — sofrimento e tédio. Felipe segura um celular ao lado das embalagens abertas, diante de um anúncio Novo modelo e de um relógio de pêndulo. Ele explica: Desejamos algo e sofremos por não ter. Quando conseguimos, a satisfação passa, surge o tédio e logo buscamos outra coisa. O querer recomeça! Schopenhauer responde: É como um pêndulo: a vida oscila entre o sofrimento e o tédio.",
  },
  {
    image: "/game/story-schopenhauer-after-04.webp",
    alt: "Schopenhauer — a compaixão. Em Frankfurt, Felipe e Schopenhauer entregam alimentos a uma mulher sentada na rua. Felipe explica: Para Schopenhauer, a compaixão é a base da moral. Quando o sofrimento do outro nos toca, podemos agir para ajudá-lo, sem buscar vantagem ou recompensa. Schopenhauer confirma: Isso mesmo! Na compaixão, o sofrimento do outro deixa de nos ser indiferente.",
  },
  {
    image: "/game/story-schopenhauer-after-05.webp",
    alt: "Na sala de servidores do Modo Doutor, a SuperIA apresenta Kierkegaard num monitor acima de duas portas, uma azul e outra dourada. Ela desafia: Resgatou Schopenhauer e compreendeu o sofrimento... Agora quero ver enfrentar a angústia de escolher! Felipe responde: Então vamos resgatar Kierkegaard! Quero compreender a existência, a liberdade e as escolhas que nos tornam quem somos. Próximo resgate: Kierkegaard.",
  },
];

export const KIERKEGAARD_POST_FIGHT_SCENES = [
  {
    image: "/game/story-kierkegaard-after-01.webp",
    alt: "Kierkegaard — a vertigem da liberdade. Numa encruzilhada de Copenhague, Felipe segura mapas e explica: Para Kierkegaard, a angústia surge diante das possibilidades da liberdade. Posso seguir caminhos diferentes, mas preciso escolher e assumir as consequências. Kierkegaard confirma: Exatamente! A angústia é a vertigem da liberdade.",
  },
  {
    image: "/game/story-kierkegaard-after-02.webp",
    alt: "Kierkegaard — três maneiras de viver. Felipe e Kierkegaard apresentam três portas: Estética, com festa, música e dança; Ética, com compromissos familiares; e Religiosa, com uma pessoa em oração. Felipe explica: Kierkegaard apresenta três esferas da existência: a estética, voltada às experiências; a ética, aos compromissos; e a religiosa, à relação pessoal com Deus. Kierkegaard confirma: Isso mesmo! Mudar de esfera exige uma transformação pessoal, não acontece automaticamente.",
  },
  {
    image: "/game/story-kierkegaard-after-03.webp",
    alt: "Kierkegaard — entre a incerteza e a fé. Felipe, com um livro junto ao peito, salta sobre um abismo entre montanhas enquanto Kierkegaard observa. O filósofo diz: Você pode compreender todas as possibilidades, professor... mas ainda precisa decidir como viver. Felipe explica: Para Kierkegaard, a fé envolve um salto: assumir uma relação com Deus sem possuir garantias capazes de eliminar toda a incerteza.",
  },
  {
    image: "/game/story-kierkegaard-after-04.webp",
    alt: "Modo Doutor — próximo resgate: Freud. Na sala de servidores, a SuperIA está deitada num divã e Freud aparece num monitor. Ela diz: Você investigou a existência, professor... Agora vamos descobrir o que escapa à consciência! Felipe responde: Então chegou a vez de Freud! Vamos investigar o inconsciente!",
  },
];

export const FREUD_POST_FIGHT_SCENES = [
  {
    image: "/game/story-freud-after-01.webp",
    alt: "Freud — 1856–1939; Sigmund Freud. No consultório em Viena, Felipe apresenta Freud: nasceu em Freiberg e trabalhou por décadas em Viena. Médico neurologista e criador da psicanálise, investigou o papel dos processos inconscientes em nossa vida. Freud explica: Nem tudo o que move nossos pensamentos e ações está acessível à consciência.",
  },
  {
    image: "/game/story-freud-after-02.webp",
    alt: "Freud — o inconsciente. Num barco diante de um iceberg, Felipe explica: Para Freud, desejos e conflitos podem ficar fora da nossa consciência, como a parte escondida deste iceberg. Mesmo sem percebermos, eles influenciam o que sentimos e fazemos. Freud confirma: Sonhos, lapsos de fala e sintomas podem dar pistas do inconsciente. A imagem identifica o iceberg como uma metáfora visual.",
  },
  {
    image: "/game/story-freud-after-03.webp",
    alt: "Freud — id, ego e superego. Felipe aparece com dois alteregos: um instintivo diante de um bolo, representando o id, e outro de terno com uma lista de regras, representando o superego. Ao centro, Felipe está confuso como ego. Freud explica: O id busca prazer e satisfação imediata. O superego cobra regras e ideais que aprendemos. Já o ego tenta conciliar essas exigências com a realidade. A cena é uma encenação do modelo de Freud.",
  },
  {
    image: "/game/story-freud-after-04.webp",
    alt: "Freud — o mundo dos sonhos. Numa aula cósmica surrealista, Felipe e Freud conversam diante de uma lousa flutuante, livros, relógio derretido e uma porta aberta para a sala de aula. Felipe explica que, para Freud, os sonhos podem expressar desejos e conflitos de forma disfarçada, misturando lembranças e experiências. Freud acrescenta: Para interpretá-los, partimos das associações de quem sonha. Um mesmo símbolo não tem significado igual para todos.",
  },
  {
    image: "/game/story-freud-after-05.webp",
    alt: "Freud — Eros e Thanatos: amor e ódio. Entre uma árvore florida e ruínas sombrias, Felipe explica: Na teoria de Freud, Eros aparece no amor, no desejo e nos vínculos. A pulsão de morte, conhecida como Thanatos, pode se manifestar na agressividade e na destruição. Freud confirma: Amor e ódio podem coexistir numa mesma relação. Essas pulsões se misturam e entram em conflito.",
  },
  {
    image: "/game/story-freud-after-06.webp",
    alt: "O último desafio — Superinteligência. Sozinha numa sala de servidores futurista, a SuperIA anuncia: Você chegou longe, professor... Mas, antes de me enfrentar, terá de responder corretamente a 4 questões. Prove que compreendeu as ideias que resgatou!",
  },
];

export const DOCTOR_POST_FIGHT_SCENES = [HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES, DIOGENES_POST_FIGHT_SCENES, HYPATIA_POST_FIGHT_SCENES, AVERROES_POST_FIGHT_SCENES, THOMAS_POST_FIGHT_SCENES, MACHIAVELLI_POST_FIGHT_SCENES, GALILEO_POST_FIGHT_SCENES, HOBBES_POST_FIGHT_SCENES, ROUSSEAU_POST_FIGHT_SCENES, HEGEL_POST_FIGHT_SCENES, SCHOPENHAUER_POST_FIGHT_SCENES, KIERKEGAARD_POST_FIGHT_SCENES, FREUD_POST_FIGHT_SCENES];

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
  {
    opponent: "hypatia",
    chapter: "A coragem de investigar",
    era: "Alexandria · séculos IV–V d.C.",
    background: "/game/arena-hipatia.webp",
    intro: [
      { speaker: "HIPÁTIA", line: "Nenhuma máquina pode encerrar nossas perguntas. Observar, calcular e ensinar também são formas de liberdade!", focus: "opponent" },
      { speaker: "FELIPE", line: "Diógenes está livre. Agora vou resgatar sua voz e sua coragem de investigar!", focus: "felipe" },
    ],
    outro: [
      { speaker: "HIPÁTIA", line: "Minha voz está livre. Que a investigação continue, sem medo de perguntar e aprender!", focus: "opponent" },
      { speaker: "FELIPE", line: "Seu pensamento voltou a circular. Agora seguirei até Averróis, para continuar esse resgate!", focus: "felipe" },
    ],
  },
  {
    opponent: "averroes",
    chapter: "O pensamento atravessa fronteiras",
    era: "Córdoba · século XII",
    background: "/game/arena-averroes.webp",
    intro: [
      { speaker: "AVERRÓIS", line: "Meus comentários atravessaram fronteiras. Não deixarei que uma máquina encerre o debate!", focus: "opponent" },
      { speaker: "FELIPE", line: "Hipátia está livre. Agora vou resgatar sua voz e sua defesa da investigação filosófica!", focus: "felipe" },
    ],
    outro: [
      { speaker: "AVERRÓIS", line: "Minha voz está livre. Que os argumentos voltem a circular e o debate continue!", focus: "opponent" },
      { speaker: "FELIPE", line: "Seu pensamento atravessará novas fronteiras. Agora seguirei até Tomás de Aquino!", focus: "felipe" },
    ],
  },
  {
    opponent: "thomas",
    chapter: "A ponte entre razão e fé",
    era: "Europa medieval · século XIII",
    background: "/game/arena-tomas.webp",
    intro: [
      { speaker: "TOMÁS DE AQUINO", line: "O silêncio dessa máquina não encerrará nossas perguntas. A razão ainda tem caminhos para investigar!", focus: "opponent" },
      { speaker: "FELIPE", line: "Averróis está livre. Agora vou resgatar sua voz e essa ponte entre a razão e a fé!", focus: "felipe" },
    ],
    outro: [
      { speaker: "TOMÁS DE AQUINO", line: "Minha voz está livre. Que a investigação continue e os argumentos voltem a ser examinados!", focus: "opponent" },
      { speaker: "FELIPE", line: "O pensamento de Tomás está livre, Superinteligência. Agora seguirei até Maquiavel!", focus: "felipe" },
    ],
  },
  {
    opponent: "machiavelli",
    chapter: "Entre a virtù e a fortuna",
    era: "Florença · Renascimento",
    background: "/game/arena-maquiavel.webp",
    intro: [
      { speaker: "MAQUIAVEL", line: "Conquistar o poder é um desafio. Conservá-lo exige encarar a realidade. Está preparado, professor?", focus: "opponent" },
      { speaker: "FELIPE", line: "Tomás está livre. Agora vou resgatar seu pensamento e enfrentar as reviravoltas da fortuna!", focus: "felipe" },
    ],
    outro: [
      { speaker: "MAQUIAVEL", line: "Minha voz está livre. Que nossas ações voltem a ser examinadas para além das aparências!", focus: "opponent" },
      { speaker: "FELIPE", line: "Aprendi com Maquiavel, SuperIA. Pode ficar com a coroa: agora seguirei até Galileu!", focus: "felipe" },
    ],
  },
  {
    opponent: "galileo",
    chapter: "Observar, medir e testar",
    era: "Itália · Revolução Científica",
    background: "/game/arena-galileu.webp",
    intro: [
      { speaker: "GALILEU", line: "Apontei a luneta para o céu e encontrei novas perguntas. Essa máquina não apagará o que podemos investigar!", focus: "opponent" },
      { speaker: "FELIPE", line: "Maquiavel está livre. Agora vou resgatar sua voz e olhar o céu com outros olhos!", focus: "felipe" },
    ],
    outro: [
      { speaker: "GALILEU", line: "Minha voz está livre. Que as observações e os experimentos continuem desafiando nossas certezas!", focus: "opponent" },
      { speaker: "FELIPE", line: "Aprendi a observar os astros. Agora seguirei até Hobbes para investigar como construir a paz!", focus: "felipe" },
    ],
  },
  {
    opponent: "hobbes",
    chapter: "O pacto pela paz",
    era: "Inglaterra · século XVII",
    background: "/game/arena-hobbes.webp",
    intro: [
      { speaker: "HOBBES", line: "Sem um poder comum, até nossas palavras vivem sob ameaça. Quem garantirá a paz quando o medo governa?", focus: "opponent" },
      { speaker: "FELIPE", line: "Galileu está livre. Agora vou resgatar seu pensamento e investigar o pacto que pode construir a paz!", focus: "felipe" },
    ],
    outro: [
      { speaker: "HOBBES", line: "Minha voz está livre. Que o pacto volte a ser debatido e a paz seja mais que uma promessa!", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Hobbes, SuperIA. Agora quero enfrentar o último dos grandes contratualistas: Rousseau!", focus: "felipe" },
    ],
  },
  {
    opponent: "rousseau",
    chapter: "A liberdade e o bem comum",
    era: "Genebra · século XVIII",
    background: "/game/arena-rousseau.webp",
    intro: [
      { speaker: "ROUSSEAU", line: "Nenhuma máquina pode tomar o lugar da voz dos cidadãos. A liberdade exige que participemos das leis que nos governam!", focus: "opponent" },
      { speaker: "FELIPE", line: "Hobbes está livre. Agora vou resgatar seu pensamento e investigar os caminhos da liberdade e do bem comum!", focus: "felipe" },
    ],
    outro: [
      { speaker: "ROUSSEAU", line: "Minha voz está livre. Que os cidadãos voltem a discutir as leis e a construir o bem comum!", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei os três grandes contratualistas, SuperIA: Hobbes, Locke e Rousseau! Agora é a vez de Hegel!", focus: "felipe" },
    ],
  },
  {
    opponent: "hegel",
    chapter: "A história em movimento",
    era: "Alemanha · idealismo do século XIX",
    background: "/game/arena-hegel.webp",
    intro: [
      { speaker: "HEGEL", line: "A história está em movimento. Nenhuma máquina pode encerrar o caminho pelo qual a consciência aprende a ser livre!", focus: "opponent" },
      { speaker: "FELIPE", line: "Rousseau está livre. Agora vou resgatar seu pensamento e investigar a dialética, a liberdade e as transformações da história!", focus: "felipe" },
    ],
    outro: [
      { speaker: "HEGEL", line: "Minha voz está livre. Que o pensamento volte a compreender seu tempo e as contradições que o transformam!", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Hegel, SuperIA. Agora é a vez de Schopenhauer: vamos investigar a vontade, o desejo e o sofrimento!", focus: "felipe" },
    ],
  },
  {
    opponent: "schopenhauer",
    chapter: "Entre o desejo e o sofrimento",
    era: "Frankfurt · filosofia do século XIX",
    background: "/game/arena-schopenhauer.webp",
    intro: [
      { speaker: "SCHOPENHAUER", line: "Por trás das promessas de progresso, a vontade continua a desejar. Você está pronto para encarar o sofrimento que move os seres?", focus: "opponent" },
      { speaker: "FELIPE", line: "Hegel está livre. Agora vou resgatar seu pensamento e investigar a vontade, o desejo e os caminhos da compaixão!", focus: "felipe" },
    ],
    outro: [
      { speaker: "SCHOPENHAUER", line: "Minha voz está livre. Que compreender o sofrimento também nos torne menos indiferentes à dor dos outros.", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Schopenhauer, SuperIA. Agora vou até Kierkegaard para investigar a existência, a liberdade e a angústia de escolher!", focus: "felipe" },
    ],
  },
  {
    opponent: "kierkegaard",
    chapter: "A vertigem da liberdade",
    era: "Copenhague · filosofia da existência",
    background: "/game/arena-copenhagen.webp",
    intro: [
      { speaker: "KIERKEGAARD", line: "Você pode explicar todos os caminhos. Ainda assim, terá de escolher qual deles viver.", focus: "opponent" },
      { speaker: "FELIPE", line: "Schopenhauer está livre. Agora vou resgatar seu pensamento e investigar a existência, a angústia e o risco de escolher!", focus: "felipe" },
    ],
    outro: [
      { speaker: "KIERKEGAARD", line: "Minha voz está livre. Que cada pessoa possa assumir suas escolhas e a responsabilidade por sua própria existência.", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Kierkegaard, SuperIA. Agora chegou a vez de Freud: vamos investigar o inconsciente!", focus: "felipe" },
    ],
  },
  {
    opponent: "freud",
    chapter: "Para além da consciência",
    era: "Viena · psicanálise",
    background: "/game/arena-freud.webp",
    intro: [
      { speaker: "FREUD", line: "Você acredita comandar cada golpe, mas nem tudo o que o move está acessível à consciência.", focus: "opponent" },
      { speaker: "FELIPE", line: "Kierkegaard está livre. Agora vou resgatar seu pensamento e investigar o inconsciente!", focus: "felipe" },
    ],
    outro: [
      { speaker: "FREUD", line: "Minha voz está livre. Que possamos continuar investigando os desejos e conflitos que atravessam nossa vida.", focus: "opponent" },
      { speaker: "FELIPE", line: "Resgatei Freud, SuperIA. Estou pronto para seu último desafio!", focus: "felipe" },
    ],
  },
  {
    opponent: "felipe-cyborg",
    chapter: "O nascimento das trevas",
    era: "Uma sala de aula em outro universo",
    background: "/game/arena-felipe-dystopia-v1.webp",
    intro: [
      { speaker: "FELIPE DAS TREVAS", line: "A SuperIA leu seu livro. Aprendeu seus gestos. E construiu uma versão sua sem a fraqueza da dúvida.", focus: "opponent" },
      { speaker: "FELIPE", line: "Você copiou meus movimentos. Mas pensar começa quando a gente pode questionar a própria resposta.", focus: "felipe" },
    ],
    // O encerramento animado usa a fase doctor-complete.
    outro: [],
  },
];

export function nextDoctorEncounter(index) {
  const nextIndex = index + 1;
  if (index === DOCTOR_FINAL_ENCOUNTER_INDEX) {
    return { completed: true, pending: false, index };
  }
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
    const intro = campaign === "grand" ? GRAND_INTRO_SCENES : campaign === "doctor" ? doctorIntroScenes(encounterIndex) : STORY_INTRO_SCENES;
    return intro.slice(introIndex, introIndex + 2).map(({ image }) => image);
  }
  const postFightScenes = campaign === "grand" ? GRAND_POST_FIGHT_SCENES : campaign === "doctor" ? DOCTOR_POST_FIGHT_SCENES : STORY_POST_FIGHT_SCENES;
  const recap = postFightScenes[encounterIndex] ?? [];
  if (phase === "story-recap") {
    return recap.slice(sceneStep, sceneStep + 2).map(({ image }) => image);
  }
  if (phase !== "playing" && phase !== "won") return [];
  if (campaign === "doctor" && encounterIndex === DOCTOR_FINAL_ENCOUNTER_INDEX) return [...DOCTOR_ENDING_ASSETS];
  const urls = recap.slice(0, 1).map(({ image }) => image);
  if (campaign === "disciple" && encounterIndex === STORY_ENCOUNTERS.length - 1) {
    urls.push("/game/story-ending-philosophers-v1.webp", "/game/story-ending-felipe-toss-v1.webp");
  }
  return urls;
}
