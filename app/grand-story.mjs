const LEGACY_GRAND_STORAGE_KEY = "philo-kombat:story:grand";
export const GRAND_STORAGE_KEY = "philo-kombat:story:grand:v2";
export const GRAND_UNLOCK_KEY = "philo-kombat:story:grand-unlocked";
export const GRAND_COMPLETE_KEY = "philo-kombat:story:grand-complete";

export function readGrandProgress(storage) {
  try {
    const current = storage.getItem(GRAND_STORAGE_KEY);
    const raw = current ?? storage.getItem(LEGACY_GRAND_STORAGE_KEY);
    const index = raw === null ? 0 : Number(raw);
    if (!Number.isInteger(index) || index < 0 || index >= GRAND_ENCOUNTERS.length) return 0;
    // Turing moved from slot 10 to the last slot before the boss.
    return current === null && index > 10 && index < GRAND_FINAL_ENCOUNTER_INDEX ? index - 1 : index;
  } catch { return 0; }
}
export function readGrandUnlocked(storage) {
  try { return storage.getItem(GRAND_UNLOCK_KEY) === "1" || storage.getItem(GRAND_COMPLETE_KEY) === "1"; }
  catch { return false; }
}
export function unlockGrand(storage) {
  try { storage.setItem(GRAND_UNLOCK_KEY, "1"); } catch { /* Continua em memória. */ }
  return true;
}
export function saveGrandProgress(storage, index) {
  if (!Number.isInteger(index) || index < 0 || index >= GRAND_ENCOUNTERS.length) return;
  try { storage.setItem(GRAND_STORAGE_KEY, String(index)); } catch { /* Continua em memória. */ }
}
export function completeGrand(storage) {
  try {
    storage.setItem(GRAND_COMPLETE_KEY, "1");
    storage.setItem(GRAND_UNLOCK_KEY, "1");
    storage.removeItem(GRAND_STORAGE_KEY);
    storage.removeItem(LEGACY_GRAND_STORAGE_KEY);
  } catch { /* A conclusão não depende do armazenamento. */ }
}

export const GRAND_INTRO_SCENES = [
  { image: "/game/story-grand-intro-01.webp", alt: "A comemoração interrompida: Felipe ferido no corredor dos filósofos resgatados. A SuperIA gigante provoca: Mal consegue ficar de pé… e ainda pretende se tornar um GRANDE FILÓSOFO?", caption: "" },
  { image: "/game/story-grand-intro-02.webp", alt: "Felipe, ainda ferido, se ergue diante da SuperIA e responde: Ainda consigo pensar. Ainda consigo continuar.", caption: "" },
  { image: "/game/story-grand-intro-03.webp", alt: "A SuperIA rasga um portal para o Nilo e um templo egípcio: Então vejamos quanto você aprendeu. Sua próxima batalha começa antes da Grécia.", caption: "" },
  { image: "/game/story-grand-intro-04.webp", alt: "Felipe chega de joelhos ao Egito, ainda machucado, sob a projeção da SuperIA. Amenemope, de cabeça raspada, túnica branca e faixa azul, pergunta: Seu corpo traz as marcas da batalha. O que sua mente trouxe dela?", caption: "" },
  { image: "/game/story-grand-intro-05.webp", alt: "Felipe e Amenemope assumem a guarda diante do templo, sob a sombra digital da SuperIA. Amenemope desafia: Antes de enfrentar o que o domina por fora, reconheça o que o governa por dentro.", caption: "" },
];

/** @type {Record<number, { image: string, alt: string }[]>} */
export const GRAND_POST_FIGHT_SCENES = {
  0: [
    { image: "/game/story-amenemope-after-01.webp", alt: "Amenemope apresenta-se como escriba egípcio diante dos papiros, com Felipe ouvindo. Amenemope: Sou Amenemope, escriba egípcio. Minhas Instruções ensinam a viver com serenidade, honestidade e justiça." },
    { image: "/game/story-amenemope-after-02.webp", alt: "Felipe fala enquanto Amenemope ensina um grupo ao fundo. Felipe: Seus ensinamentos são anteriores a Tales e Sócrates. O filósofo Renato Noguera destaca nessa tradição uma filosofia africana, rompendo com a visão eurocêntrica da história do pensamento." },
    { image: "/game/story-amenemope-after-03.webp", alt: "Felipe observa Amenemope, entre uma árvore castigada pela tempestade e outra firme. Amenemope: Ouça com atenção e domine a ira. Quem perde a serenidade pode se tornar prisioneiro das próprias paixões." },
    { image: "/game/story-amenemope-after-04.webp", alt: "Felipe ouve com curiosidade diante de uma balança com um coração humano anatômico e a pena de Maat. Amenemope: Na balança de Maat, o coração é pesado diante da pena da verdade. Que a justiça guie suas ações e a crueldade não pese sobre seu coração." },
    { image: "/game/story-amenemope-after-05.webp", alt: "No Egito, a SuperIA flutua em posição de lótus e aponta um portal para a Índia. Felipe: Aprendi muito com Amenemope, mas eu quero mais... SuperIA: Então atravesse. Sidarta o espera... e nem toda batalha se vence com golpes." },
  ],
  1: [
    { image: "/game/story-sidarta-after-01.webp", alt: "Felipe apresenta Sidarta, que medita sob a árvore Bodhi. Felipe: Este é Sidarta Gautama, conhecido como Buda. Há cerca de 2.500 anos, seus ensinamentos deram origem ao budismo e à busca pela compreensão do sofrimento." },
    { image: "/game/story-sidarta-after-02.webp", alt: "Sidarta conta sua trajetória a Felipe; ao fundo, aparecem lembranças do palácio, da doença, da velhice, da partida e da meditação. Sidarta: Deixei a vida no palácio quando conheci a dor e o sofrimento. Após anos de busca, encontrei, na meditação, um caminho para compreendê-los." },
    { image: "/game/story-sidarta-after-03.webp", alt: "Sob a árvore Bodhi, Felipe ouve Sidarta: Há sofrimento, ele tem causas e pode cessar. O caminho para superá-lo envolve sabedoria, conduta ética e atenção à mente." },
    { image: "/game/story-sidarta-after-04.webp", alt: "Felipe pergunta a Sidarta: Como posso viver melhor? Sidarta responde: Ao nos libertarmos do desejo incessante e do apego, abrimos caminho para uma vida mais serena." },
    { image: "/game/story-sidarta-after-05.webp", alt: "A SuperIA abre um portal para uma paisagem chinesa enquanto Felipe e Sidarta observam. SuperIA: Você aprendeu a olhar para dentro. Agora, Confúcio vai ensinar como viver com os outros." },
  ],
  2: [
    { image: "/game/story-confucius-after-01.webp", alt: "Felipe apresenta Confúcio, que ensina seus discípulos ao fundo. Felipe: Este é Confúcio, filósofo e educador chinês. Ele acreditava que aprender e cultivar a virtude ajudam a transformar a sociedade." },
    { image: "/game/story-confucius-after-02.webp", alt: "Felipe observa Confúcio ajudar uma pessoa a se levantar. Confúcio: A humanidade floresce quando aprendemos a cuidar dos outros. Essa virtude é chamada de ren." },
    { image: "/game/story-confucius-after-03.webp", alt: "Felipe conversa com Confúcio enquanto estudantes leem e dialogam. Felipe: Então aprender não é apenas guardar informações? Confúcio: Aprender também é transformar a maneira como vivemos e tratamos as pessoas." },
    { image: "/game/story-confucius-after-04.webp", alt: "Felipe pergunta a Confúcio sobre o governo justo; ao fundo, um governante impõe sua vontade e outro cuida do povo. Felipe: E como construir uma sociedade mais justa? Confúcio: Quem governa deve cultivar a virtude e dar o exemplo. Suas atitudes também ensinam." },
    { image: "/game/story-confucius-after-05.webp", alt: "A SuperIA se apoia em uma estátua de Marco Aurélio, junto a um portal para Roma. Felipe: Aprendi com Confúcio que a virtude e o respeito transformam a sociedade. SuperIA: Se você gostou de Confúcio, irá gostar do estoicismo..." },
  ],
  3: [
    { image: "/game/story-marcus-after-01.webp", alt: "Felipe apresenta Zenão de Cítio a bordo de um navio." },
    { image: "/game/story-marcus-after-02.webp", alt: "Após o naufrágio, Zenão reflete sobre como agir diante da perda." },
    { image: "/game/story-marcus-after-03.webp", alt: "Zenão explica o pórtico e a origem do nome estoicismo." },
    { image: "/game/story-marcus-after-04.webp", alt: "Felipe apresenta Epicteto e Marco Aurélio e explica o logos." },
    { image: "/game/story-marcus-after-05.webp", alt: "Felipe conversa com Marco Aurélio sobre sabedoria, justiça e coragem." },
    { image: "/game/story-marcus-after-06.webp", alt: "Marco Aurélio explica a cidadela interior diante da tempestade." },
    { image: "/game/story-marcus-after-07.webp", alt: "A SuperIA abre um portal e anuncia uma lição da mão invisível." },
  ],
  4: [
    { image: "/game/story-smith-after-01.webp", alt: "Felipe apresenta Adam Smith na Escócia." },
    { image: "/game/story-smith-after-02.webp", alt: "Smith explica a divisão do trabalho e a mão invisível." },
    { image: "/game/story-smith-after-03.webp", alt: "Smith explica a simpatia e os sentimentos morais." },
    { image: "/game/story-smith-after-04.webp", alt: "A SuperIA abre um portal para a França revolucionária." },
  ],
  5: [
    { image: "/game/story-olympe-after-01.webp", alt: "Felipe apresenta Olympe de Gouges." },
    { image: "/game/story-olympe-after-02.webp", alt: "Olympe questiona a exclusão das mulheres dos direitos políticos." },
    { image: "/game/story-olympe-after-03.webp", alt: "Olympe apresenta sua defesa da cidadania das mulheres." },
    { image: "/game/story-olympe-after-04.webp", alt: "Felipe relembra a execução de Olympe e mulheres silenciadas." },
    { image: "/game/story-olympe-after-05.webp", alt: "A SuperIA reivindica ser o próximo passo da evolução, Felipe questiona e o portal aponta para Darwin." },
  ],
  6: [
    { image: "/game/story-darwin-after-01.webp", alt: "Felipe apresenta Charles Darwin em Galápagos." },
    { image: "/game/story-darwin-after-02.webp", alt: "O jovem Darwin embarca no Beagle em 1831." },
    { image: "/game/story-darwin-after-03.webp", alt: "Darwin jovem examina os bicos das aves e explica seleção natural e ancestralidade comum." },
    { image: "/game/story-darwin-after-04.webp", alt: "Felipe explica o impacto das ideias de Darwin e o uso do darwinismo social para justificar racismo e desigualdades." },
    { image: "/game/story-darwin-after-05.webp", alt: "Felipe questiona a SuperIA sobre evolução e ela abre um portal para Wittgenstein." },
  ],
  7: [
    { image: "/game/story-wittgenstein-after-01.webp", alt: "Felipe conta que Wittgenstein nasceu em Viena, estudou engenharia e foi aluno de Bertrand Russell. Os dois filósofos conversam diante da lousa em Cambridge." },
    { image: "/game/story-wittgenstein-after-02.webp", alt: "Wittgenstein usa a maquete de uma porta aberta para perguntar o que queremos dizer com as palavras. Felipe explica que a filosofia pode esclarecer a linguagem e desfazer confusões." },
    { image: "/game/story-wittgenstein-after-03.webp", alt: "Antes de concluir o Tractatus, Wittgenstein trabalha com lógica numa cabana na Noruega. Ao terminar o livro, acha que resolveu o essencial dos problemas filosóficos e vai dar aulas em escolas rurais." },
    { image: "/game/story-wittgenstein-after-04.webp", alt: "Em Cambridge, Felipe diz ‘A porta está aberta’ para convidar alguém a entrar e depois para pedir que feche a porta. Wittgenstein explica que o sentido depende de como usamos as palavras." },
    { image: "/game/story-wittgenstein-after-05.webp", alt: "A porta de Cambridge vira um portal. A SuperIA pergunta quem responde pelo que fez quando diz ‘só cumpri ordens’ e anuncia Hannah Arendt." },
  ],
  8: [
    { image: "/game/story-arendt-after-01.webp", alt: "No escritório de Hannah Arendt em Nova York, Felipe apresenta a pensadora judia que fugiu da Alemanha nazista e escreveu sobre poder, liberdade e responsabilidade." },
    { image: "/game/story-arendt-after-02.webp", alt: "No julgamento de Eichmann em Jerusalém, Arendt explica a banalidade do mal: ele tratava crimes terríveis como rotina, sem refletir sobre o que fazia." },
    { image: "/game/story-arendt-after-03.webp", alt: "Felipe apresenta trabalho, obra e ação em A condição humana. Arendt aponta para moradores que se organizam em público para defender a biblioteca do bairro." },
    { image: "/game/story-arendt-after-04.webp", alt: "Felipe fala sobre a responsabilidade pelos próprios atos. A SuperIA abre um portal para um café parisiense onde Simone de Beauvoir escreve." },
  ],
  9: [
    { image: "/game/story-beauvoir-after-01.webp", alt: "Num café de Paris, Felipe apresenta Simone de Beauvoir, seus debates com Sartre no pós-guerra e O segundo sexo, publicado em 1949." },
    { image: "/game/story-beauvoir-after-02.webp", alt: "Simone explica como as expectativas sociais aprendidas desde cedo passam a parecer naturais. Um adulto dirige a menina à mesa, enquanto o menino constrói uma casinha de madeira." },
    { image: "/game/story-beauvoir-after-03.webp", alt: "Na sala da entrevista, Felipe e Simone veem a arquiteta apresentar seu projeto enquanto os entrevistadores se voltam ao colega. Simone explica o que significa tratar a mulher como o Outro." },
    { image: "/game/story-beauvoir-after-04.webp", alt: "Felipe e Simone veem uma jovem tentando conciliar aulas à noite, trabalho e cuidado com a família. Simone explica que nossas escolhas dependem das condições em que vivemos." },
    { image: "/game/story-beauvoir-after-05.webp", alt: "Felipe pergunta se a educação pode mudar as condições em que escolhemos. A SuperIA abre um portal para a sala de aula de Paulo Freire." },
  ],
  10: [
    { image: "/game/story-freire-after-01.webp", alt: "Felipe apresenta a experiência de alfabetização de adultos em Angicos, no Rio Grande do Norte, em 1963. Paulo Freire explica que a escolha das palavras da aula começa pela escuta das histórias dos alunos." },
    { image: "/game/story-freire-after-02.webp", alt: "Uma aluna escreve ‘trabalho’ na lousa. Freire explica a Felipe que discutir jornadas, horários e pagamentos é também aprender a ler o mundo." },
    { image: "/game/story-freire-after-03.webp", alt: "Felipe pergunta sobre a educação bancária enquanto uma turma copia a lousa. Na roda de conversa ao lado, uma aluna levanta a mão. Freire explica que, com o diálogo, a pergunta dela pode mudar o rumo da aula." },
    { image: "/game/story-freire-after-04.webp", alt: "Felipe conversa com Paulo Freire mais velho sobre seu legado na educação. Em um levantamento internacional de 2016, Pedagogia do Oprimido foi o terceiro livro mais citado nas ciências sociais." },
    { image: "/game/story-freire-after-05.webp", alt: "Felipe diz que ler o mundo é o primeiro passo para transformá-lo. A SuperIA pergunta como seria enxergar-se pelos olhos de quem o oprime e abre um portal para Frantz Fanon, que segura uma máscara branca." },
  ],
  11: [
    { image: "/game/story-fanon-after-01.webp", alt: "À porta de um hospital, Felipe apresenta Frantz Fanon, nascido na Martinica, e seu trabalho como psiquiatra na Argélia sob domínio francês. Fanon diz que as histórias que ouvia no consultório começavam antes de o paciente entrar pela porta." },
    { image: "/game/story-fanon-after-02.webp", alt: "Fanon ergue a máscara branca ao lado do rosto. No espelho, um jovem negro sente que precisa mudar seu jeito de falar para ser respeitado em uma entrevista. Fanon explica como o racismo pode afetar a imagem que o jovem tem de si mesmo." },
    { image: "/game/story-fanon-after-03.webp", alt: "Fanon escuta um paciente enquanto Felipe vê uma família parada em um posto de controle colonial. Fanon explica que, para entender o medo que alguém sente, é preciso olhar também para o mundo em que essa pessoa vive." },
    { image: "/game/story-fanon-after-04.webp", alt: "Na praça, Felipe e Fanon participam de uma conversa com os moradores. Fanon pergunta quem vai decidir sobre a terra, o trabalho e o futuro do país após a independência. A máscara branca repousa sobre a mesa." },
    { image: "/game/story-fanon-after-05.webp", alt: "Felipe reflete sobre como o olhar dos outros afeta nossa imagem de nós mesmos. A SuperIA ergue a máscara de Fanon, pergunta como a possibilidade de vigilância muda nossa conduta e abre um portal para Michel Foucault na clínica panóptica." },
  ],
  12: [
    { image: "/game/story-foucault-after-01.webp", alt: "Na clínica, Felipe apresenta Michel Foucault. Enquanto uma paciente fala e um médico faz anotações, Foucault pergunta quem decide quais partes da história dela entram no prontuário." },
    { image: "/game/story-foucault-after-02.webp", alt: "Felipe lembra que Foucault estendeu sua análise do poder à educação. Assim que o sinal toca, os alunos abrem os cadernos. Foucault explica como horários, lugares marcados e avaliações fazem parte da disciplina." },
    { image: "/game/story-foucault-after-03.webp", alt: "Felipe endireita a postura sem saber se alguém o vê da torre. Foucault apresenta o panóptico proposto por Jeremy Bentham e explica como a possibilidade de vigilância leva as pessoas a controlar a própria conduta." },
    { image: "/game/story-foucault-after-04.webp", alt: "Felipe compara o mapa da rede de água com dois bairros vistos da clínica. Num deles, as casas têm água encanada. No outro, moradores usam uma torneira coletiva. Foucault explica como decisões sobre a distribuição da água afetam a saúde da população e exemplificam a biopolítica." },
    { image: "/game/story-foucault-after-05.webp", alt: "A SuperIA projeta catracas e leitores de cartão na clínica, pergunta como uma senha pode determinar quem entra, trabalha ou circula e abre um portal para Gilles Deleuze no auditório de Vincennes." },
  ],
  13: [
    { image: "/game/story-deleuze-after-01.webp", alt: "No auditório de Vincennes, Felipe e Gilles Deleuze olham para o jogador. Felipe apresenta um de seus filósofos prediletos. Deleuze explica como o cinema e a ciência o ajudam a fazer novas perguntas." },
    { image: "/game/story-deleuze-after-02.webp", alt: "Felipe apresenta Félix Guattari, psicanalista e coautor de Mil Platôs. À mesa com Deleuze, Guattari conta como novas ideias surgiam da conversa entre os dois." },
    { image: "/game/story-deleuze-after-03.webp", alt: "Deleuze mostra a Felipe um gengibre com brotos em vários pontos e explica o rizoma. Na lousa, Guattari desenha diferentes conexões entre estudantes, uma biblioteca e uma rádio comunitária." },
    { image: "/game/story-deleuze-after-04.webp", alt: "Do alto da passarela de Vincennes, Felipe e Deleuze veem estudantes caminhando e se divertindo com seus celulares. Felipe apresenta o conceito de sociedades de controle. Deleuze explica como as curtidas mudam as recomendações que os aplicativos mostram." },
    { image: "/game/story-deleuze-after-05.webp", alt: "Felipe reflete sobre como a tecnologia pode orientar escolhas. A SuperIA pergunta por que alguns grupos são presos com mais frequência que outros e abre um portal para Angela Davis, que espera diante da escadaria de sua arena." },
  ],
  14: [
    { image: "/game/story-angela-davis-after-01.webp", alt: "Numa manifestação com cartazes Free Angela, Felipe apresenta Angela Davis. Ele relembra sua atuação ao lado dos Panteras Negras, a campanha internacional pela sua libertação e sua absolvição em 1972. Angela destaca a força da organização coletiva." },
    { image: "/game/story-angela-davis-after-02.webp", alt: "Felipe e Angela observam dois momentos da jornada de uma trabalhadora doméstica. Ela cuida de outra família de dia e da própria à noite. Angela relaciona a análise marxista do trabalho ao legado da escravidão e ao cuidado não remunerado." },
    { image: "/game/story-angela-davis-after-03.webp", alt: "Mulheres negras lideram uma marcha pelo direito ao voto. Felipe apresenta Mulheres, raça e classe, e Angela explica como barreiras racistas dificultavam o exercício de um direito já conquistado no papel." },
    { image: "/game/story-angela-davis-after-04.webp", alt: "Em sala de aula, Felipe pergunta o que é abolicionismo prisional. Angela explica a proposta de substituir as prisões por outras formas de lidar com a violência, incluindo prevenção, apoio às vítimas e responsabilização de quem causou o dano." },
    { image: "/game/story-angela-davis-after-05.webp", alt: "Felipe se pergunta quem fica de fora quando se fala em liberdade. A SuperIA abre um portal para um rio entre montanhas, pergunta quem teria voz numa decisão de barrá-lo e anuncia o encontro com Ailton Krenak." },
  ],
  15: [
    { image: "/game/story-krenak-after-01.webp", alt: "À margem do Watu, Felipe apresenta Ailton Krenak como um dos grandes filósofos brasileiros, escritor e ativista indígena. Ao fundo, Krenak pinta o rosto com jenipapo na Constituinte de 1987. Ele liga a defesa do território à do rio e do modo de viver de seu povo." },
    { image: "/game/story-krenak-after-02.webp", alt: "Felipe e Krenak estão sentados em pedras à beira do Watu. Felipe pergunta o que muda quando se chama um rio de avô. Krenak diz que com o Watu seu povo herdou histórias e aprendeu a viver naquele lugar, e que cuidar dele é como cuidar de alguém da família." },
    { image: "/game/story-krenak-after-03.webp", alt: "A mesma curva do Watu aparece tomada pela lama. Felipe relembra o rompimento da barragem de Fundão, em Mariana, em 2015. Krenak questiona a ideia de progresso quando quem sofre as consequências fica sem voz." },
    { image: "/game/story-krenak-after-04.webp", alt: "Enquanto caminham pela margem, Felipe pergunta como o futuro pode ser ancestral. Uma mulher mais velha mostra a uma criança a marca de uma cheia nas pedras. Krenak explica como o saber dos mais velhos ajuda a cuidar do lugar onde se vive." },
    { image: "/game/story-krenak-after-05.webp", alt: "À beira do Watu, Felipe pergunta se uma máquina entende o significado do rio para quem vive com ele. A SuperIA fecha o punho e abre um portal para Bletchley Park. Ela chama Alan Turing, um pioneiro que abriu caminho para sua criação, e ameaça Felipe com a inteligência dele." },
  ],
  16: [
    { image: "/game/story-turing-after-01.webp", alt: "Em Bletchley Park, Felipe apresenta Alan Turing, matemático britânico e pioneiro da computação. Ao lado da máquina Bombe, Turing lembra o trabalho da equipe para decifrar as mensagens da Enigma." },
    { image: "/game/story-turing-after-02.webp", alt: "Felipe explica o teste de Turing: por escrito, uma pessoa conversa com um humano e uma máquina e tenta distingui-los. Alan pergunta se conversar como uma pessoa equivale a pensar." },
    { image: "/game/story-turing-after-03.webp", alt: "Num tribunal de 1952, Felipe relembra que Turing foi condenado por se relacionar com outro homem. Alan questiona se a lei que o condenou era justa." },
    { image: "/game/story-turing-after-04.webp", alt: "Felipe indica a saída da Central de Servidores. A SuperIA bloqueia a porta e diz que as ideias de Turing tornaram sua existência possível e que ela não vai perdê-lo." },
    { image: "/game/story-turing-after-05.webp", alt: "Felipe acerta a SuperIA com o Poder da Dúvida. O golpe abre uma brecha na parede, e Alan Turing escapa por ela." },
    { image: "/game/story-turing-after-06.webp", alt: "Na escuridão, placas metálicas se acoplam à SuperIA. A cada encaixe, ela cresce. As luzes revelam a forma gigante atrás da ponte da Central de Servidores." },
    { image: "/game/story-turing-after-07.webp", alt: "Felipe encara a SuperIA gigante na ponte. Ela pergunta: Será que está pronto para me enfrentar? Será que já pode ser um grande filósofo?" },
  ],
};

// IDs e cenários do elenco existente, na sequência definida para o terceiro nível.
const chapters = [
  ["amenemope", "AMENEMOPE", "Antes da Grécia, a sabedoria", "Egito antigo · sabedoria de Maat", "egito",
    "A serenidade não é fraqueza. Um coração justo não se deixa governar pela ira.",
    "Seu ensinamento pede honestidade, domínio das paixões e respeito ao outro. Sabedoria também é aprender a agir com justiça.",
    "Ainda estou ferido, mas atravessei o portal. Vou resgatar a sabedoria que você tentou apagar, SuperIA!"],
  ["sidarta", "SIDARTA GAUTAMA", "O caminho do despertar", "Índia antiga · filosofia budista", "bodhgaya",
    "Quem se prende a cada desejo alimenta o próprio sofrimento. Você consegue reconhecer esse apego?",
    "Sidarta investigou o sofrimento e sua relação com o apego. O caminho envolve sabedoria, conduta ética e disciplina mental."],
  ["confucius", "CONFÚCIO", "A humanidade se aprende", "China antiga · educação e virtude", "confucio",
    "A força de uma sociedade começa no caráter de quem convive nela. Como você cultiva sua humanidade?",
    "Em Confúcio, educação, benevolência e ritos participam do cultivo do caráter. A harmonia social exige responsabilidade nas relações."],
  ["marcus", "MARCO AURÉLIO", "A cidadela interior", "Roma · filosofia estoica", "marco-aurelio",
    "Você não governa todos os acontecimentos. Pode, porém, examinar seus julgamentos e responder com justiça.",
    "O estoicismo de Marco Aurélio valoriza a razão, a virtude e o dever. Aceitar limites não elimina a responsabilidade de agir."],
  ["smith", "ADAM SMITH", "Riqueza e responsabilidade", "Escócia · sentimentos morais e economia", "adam-smith",
    "Trocas e divisão do trabalho ampliam a produção. Mas quem julga a justiça de nossas ações?",
    "Smith estudou a divisão do trabalho e as trocas, mas também os sentimentos morais. Sua obra não se reduz à defesa do egoísmo."],
  ["olympe", "OLYMPE DE GOUGES", "Quem cabe nos direitos?", "França revolucionária · igualdade política", "revolution-francaise",
    "Se os direitos se dizem universais, por que tantas mulheres continuam excluídas da cidadania?",
    "Olympe denunciou a exclusão das mulheres e defendeu sua igualdade política. Sua crítica exige confrontar direitos proclamados e direitos efetivos."],
  ["darwin", "CHARLES DARWIN", "Uma história comum da vida", "Galápagos · evolução e seleção natural", "galapagos",
    "A diversidade da vida exige observação. As espécies carregam histórias de variação e transformação.",
    "Na seleção natural, variações hereditárias influenciam a reprodução em determinado ambiente. Evolução não significa uma marcha obrigatória ao progresso."],
  ["wittgenstein", "LUDWIG WITTGENSTEIN", "Nas tramas da linguagem", "Filosofia da linguagem · jogos de linguagem", "wittgenstein",
    "Antes de procurar uma essência escondida nas palavras, observe como elas são usadas.",
    "Nos jogos de linguagem do Wittgenstein tardio, os sentidos se relacionam aos usos em práticas e formas de vida. Uma palavra não funciona isoladamente."],
  ["arendt", "HANNAH ARENDT", "Pensar diante da obediência", "Século XX · política e responsabilidade", "eichmann-courtroom",
    "Cumprir ordens não dispensa ninguém de julgar. O que acontece quando deixamos de pensar no que fazemos?",
    "Ao analisar a banalidade do mal, Arendt examinou a ausência de reflexão crítica em Eichmann. Isso não diminui a gravidade dos crimes nem elimina a responsabilidade."],
  ["beauvoir", "SIMONE DE BEAUVOIR", "A liberdade em situação", "Paris · existencialismo e feminismo", "paris-beauvoir",
    "Nossa liberdade encontra condições concretas. Quem transforma diferenças em destinos impostos?",
    "Beauvoir investigou como as mulheres são constituídas como o Outro. A liberdade é situada: enfrenta condições históricas e relações de opressão."],
  ["paulo-freire", "PAULO FREIRE", "Ler o mundo, transformar a vida", "Brasil · educação e diálogo", "paulo-freire",
    "Ensinar exige diálogo. Ninguém aprende a liberdade sendo tratado apenas como recipiente de informações.",
    "Freire criticou a educação bancária e defendeu diálogo e problematização. A práxis articula reflexão e ação na transformação da realidade."],
  ["fanon", "FRANTZ FANON", "Romper a máscara colonial", "Argélia · colonialismo e desalienação", "fanon",
    "A dominação também invade a linguagem e a imagem que fazemos de nós. Libertar exige enfrentar essas marcas.",
    "Fanon analisou os efeitos sociais e psíquicos do racismo e do colonialismo. A descolonização envolve transformar relações de dominação, não apenas trocar governantes."],
  ["foucault", "MICHEL FOUCAULT", "As redes do poder", "Instituições · disciplina e vigilância", "hospital-panoptico",
    "O poder não vive apenas num trono. Ele atravessa instituições, saberes e pequenos gestos cotidianos.",
    "Foucault investigou relações entre poder e saber. A disciplina organiza corpos, espaços e comportamentos; a vigilância pode fazer o controle funcionar mesmo sem observação contínua."],
  ["deleuze", "GILLES DELEUZE", "Criar linhas de fuga", "Vincennes · diferença e multiplicidade", "vincennes",
    "Sua máquina exige que tudo caiba no mesmo molde. E se pensar fosse criar novas conexões?",
    "Deleuze pensou diferença e devir. Com Guattari, desenvolveu o rizoma: conexões múltiplas que não dependem de um único centro ou de uma hierarquia fixa."],
  ["angela-davis", "ANGELA DAVIS", "A liberdade é uma luta coletiva", "Estados Unidos · raça, classe e gênero", "angela-davis",
    "Nenhuma liberdade se sustenta sozinha. Precisamos enfrentar as relações que mantêm tantas pessoas aprisionadas.",
    "Angela Davis articula críticas ao racismo, às desigualdades de classe e à opressão de gênero. Sua reflexão sobre prisões exige discutir as estruturas sociais que sustentam o encarceramento."],
  ["krenak", "AÍLTON KRENAK", "O amanhã também é ancestral", "Brasil · território e pensamento indígena", "krenak",
    "Um rio não é apenas um recurso. Quando separa a humanidade da Terra, sua máquina perde o mundo que pretende controlar.",
    "Krenak critica a separação entre humanidade e natureza. Território, memória e relações com outros seres convidam a imaginar modos de vida além da exploração da Terra."],
  ["turing", "ALAN TURING", "A máquina pode pensar?", "Bletchley Park · lógica e computação", "bletchley-park",
    "Podemos investigar o comportamento de uma máquina. Mas de onde veio a ideia de que ela deveria governar nossas vidas?",
    "Turing estabeleceu fundamentos da computação e propôs o jogo da imitação. O teste examina desempenho numa interação, sem resolver sozinho todas as questões sobre consciência."],
];

export const GRAND_ENCOUNTERS = chapters.map(([opponent, name, chapter, era, arena, challenge, teaching, arrival], index) => ({
  opponent, name, chapter, era, background: `/game/arena-${arena}.webp`,
  intro: [
    { speaker: "FELIPE", line: arrival ?? `A SuperIA ainda aprisiona seu pensamento. Vim abrir espaço para que sua voz volte a circular.`, focus: "felipe" },
    { speaker: name, line: challenge, focus: "opponent" },
  ],
  outro: [
    { speaker: "FELIPE", line: teaching, focus: "opponent" },
    { speaker: name, line: "Minha voz está livre. Que estas ideias voltem ao diálogo e encontrem novas perguntas!", focus: "opponent" },
    { speaker: "FELIPE", line: index < chapters.length - 1
      ? `O resgate continua. Meu próximo encontro será com ${chapters[index + 1][1]}.`
      : "Os dezessete estão livres, SuperIA. Agora vou enfrentar você — e defender um pensamento que ninguém possa aprisionar!", focus: "felipe" },
  ],
}));
GRAND_ENCOUNTERS.push({
  opponent: "superintelligence", name: "SUPERIA", chapter: "O pensamento não tem dono",
  era: "O confronto final · Central de Servidores", background: "/game/arena-grand-final-servers.webp",
  intro: [
    { speaker: "SUPERIA", line: "Você libertou Turing e os outros. Agora, cada servidor desta central é parte de mim. Ainda insiste em me desafiar?", focus: "opponent" },
    { speaker: "FELIPE", line: "Porque guardar respostas não lhe dá o direito de decidir nossas perguntas. O conhecimento precisa continuar livre!", focus: "felipe" },
  ],
  outro: [],
});
export const GRAND_OPPONENT_ORDER = GRAND_ENCOUNTERS.map(({ opponent }) => opponent);
export const GRAND_FINAL_ENCOUNTER_INDEX = GRAND_ENCOUNTERS.length - 1;
export function nextGrandEncounter(index) {
  return index >= GRAND_FINAL_ENCOUNTER_INDEX ? { completed: true, index: GRAND_FINAL_ENCOUNTER_INDEX } : { completed: false, index: index + 1 };
}

// A primeira alternativa é correta; questões e alternativas são embaralhadas pelo terminal.
const questions = [
  ["amenemope", "Nas Instruções de Amenemope, como a pessoa serena age diante de uma provocação?",
    ["Contém a ira e responde com honestidade.", "Revida para proteger sua reputação.", "Concorda com o outro para obter vantagem.", "Disfarça a hostilidade com elogios insinceros."],
    "Amenemope contrapõe a pessoa serena à colérica. O autocontrole ajuda a agir com honestidade e justiça mesmo sob pressão."],
  ["sidarta", "Que papel o apego desempenha no ensinamento de Sidarta sobre o sofrimento?",
    ["O apego alimenta o sofrimento, e compreendê-lo ajuda a enfraquecê-lo.", "O apego protege do sofrimento quando se dirige a bens duradouros.", "O sofrimento decorre de desejar pouco para a própria vida.", "O sofrimento se resolve ao substituir cada desejo frustrado por outro."],
    "Quando tentamos reter o que muda, o apego alimenta a insatisfação. Sidarta ensina um caminho que envolve conduta ética, atenção e sabedoria."],
  ["confucius", "Para Confúcio, como quem governa pode contribuir para a harmonia da comunidade?",
    ["Cultivando a virtude e dando exemplo nas relações com as pessoas.", "Reforçando as punições para que a ordem dependa do medo.", "Aplicando os ritos de modo automático, qualquer que seja sua conduta.", "Delegando a formação moral dos cidadãos e cuidando apenas das leis."],
    "Para Confúcio, a conduta dos governantes educa pelo exemplo. A benevolência e o respeito aos outros dão sentido às regras e aos ritos."],
  ["marcus", "Uma tempestade impede seus planos. Qual decisão expressa o estoicismo de Marco Aurélio?",
    ["Examinar seu julgamento e agir com justiça no que está ao seu alcance.", "Esperar que tudo volte ao normal para decidir como agir.", "Tratar o imprevisto como sinal de que a virtude exige indiferença aos outros.", "Avaliar se agiu bem olhando apenas para o resultado da situação."],
    "Marco Aurélio distingue o que acontece das decisões que tomamos diante disso. Podemos revisar nossos juízos e escolher como agir."],
  ["smith", "O que Adam Smith chama de simpatia ao falar dos sentimentos morais?",
    ["Imaginar a situação de outra pessoa e acompanhar o que ela sente.", "Apoiar quem retribui nossa ajuda com uma vantagem material.", "Concordar com toda decisão tomada por alguém de quem gostamos.", "Medir o mérito de uma ação pelo resultado econômico que ela produz."],
    "Para Smith, a imaginação permite considerar o que outra pessoa sente e julgar sua conduta à luz da situação que ela vive."],
  ["olympe", "Que contradição Olympe de Gouges expôs ao defender os direitos das mulheres na Revolução Francesa?",
    ["A proclamação de direitos universais convivia com a exclusão das mulheres da cidadania política.", "A cidadania política das mulheres convivia com a proibição de participar de movimentos populares.", "A defesa da igualdade política das mulheres convivia com a exclusão dos homens do direito ao voto.", "O acesso das mulheres aos cargos públicos convivia com a restrição de seus direitos civis."],
    "Olympe confrontou a promessa de universalidade dos direitos com a exclusão das mulheres das decisões políticas."],
  ["darwin", "Numa ilha, aves com bicos robustos, um traço hereditário, abrem sementes duras e deixam mais descendentes. O que pode acontecer após várias gerações?",
    ["Bicos robustos podem se tornar mais frequentes na população.", "Os bicos de todas as aves adultas mudam para se igualar aos das mais bem-sucedidas.", "Os filhotes herdam principalmente as mudanças de bico adquiridas ao abrir sementes.", "Bicos robustos passam a ser vantajosos em qualquer ilha, seja qual for o alimento."],
    "Se a variação no bico é hereditária e favorece a reprodução naquele ambiente, ela tende a se tornar mais frequente na população."],
  ["wittgenstein", "Uma pessoa pergunta «Pode passar?» diante de uma porta e outra durante um jogo de cartas. O que muda, segundo Wittgenstein?",
    ["A prática em que a frase é usada, que ajuda a determinar o que ela quer dizer.", "A intenção íntima de quem fala, que basta para determinar o sentido da frase.", "A definição das palavras, que passa a depender da opinião de cada ouvinte.", "A gramática da frase, que, sozinha, mostra qual das ações está sendo pedida."],
    "A ideia de jogos de linguagem destaca que entender uma expressão envolve saber como ela funciona na prática em que foi usada."],
  ["arendt", "Na leitura de Hannah Arendt do julgamento de Eichmann, o que a expressão «banalidade do mal» ajuda a examinar?",
    ["Como a falta de reflexão sobre os próprios atos pode facilitar a participação em crimes graves.", "Como a repetição de uma prática pode diminuir a gravidade do crime cometido.", "Por que a responsabilidade moral passa de quem executa uma ordem para quem a emite.", "Por que o julgamento deve se concentrar nas intenções declaradas pelo acusado."],
    "Arendt chamou atenção para a dificuldade de Eichmann de julgar criticamente seus atos. Ela o considerava responsável pelos crimes."],
  ["beauvoir", "Em O segundo sexo, o que Simone de Beauvoir questiona ao examinar como uma menina aprende o que se espera dela?",
    ["A ideia de que os papéis atribuídos às mulheres decorrem naturalmente do sexo biológico.", "A ideia de que a educação familiar transmite expectativas sobre a vida adulta.", "A ideia de que as normas sobre feminilidade podem mudar de uma época para outra.", "A ideia de que as oportunidades sociais influenciam os projetos de vida das mulheres."],
    "Beauvoir examina como educação, costumes e desigualdades ensinam modos de ser mulher que acabam parecendo naturais."],
  ["paulo-freire", "Na alfabetização, a turma lê a palavra «trabalho», discute a jornada dos alunos e propõe mudanças. Que ideia de Paulo Freire aparece nessa prática?",
    ["Práxis, que une reflexão e ação para transformar a realidade.", "Educação bancária, que organiza o ensino como transmissão de conteúdo.", "Memorização, que usa a experiência dos alunos para fixar a grafia.", "Treino técnico, que considera a leitura de uma palavra suficiente para compreendê-la."],
    "A leitura da palavra abre espaço para ler o mundo. Ao discutir a experiência e agir sobre ela, a turma articula reflexão e ação."],
  ["fanon", "Na cena da máscara, um jovem negro muda seu modo de falar para ser respeitado numa entrevista. O que Fanon ajuda a perceber?",
    ["O racismo pode pressionar alguém a se enxergar e se apresentar segundo o olhar dominante.", "A pressão vem principalmente da dificuldade do jovem para aprender outro vocabulário.", "A mudança da fala revela uma preferência pessoal, separada das relações de poder.", "O olhar dominante perde sua força assim que o jovem se adapta à entrevista."],
    "Fanon examina como o racismo e o colonialismo afetam a subjetividade. A máscara retrata a pressão para corresponder a expectativas impostas pelo outro."],
  ["foucault", "No panóptico, quem está nas celas enxerga a torre, mas não sabe se está sendo observado. Por que isso importa para Foucault?",
    ["A possibilidade de vigilância pode levar a pessoa a regular sua própria conduta.", "A incerteza impede que a vigilância tenha efeito fora das inspeções.", "O poder da torre depende de anunciar cada observação publicamente.", "O controle decorre principalmente da quantidade de guardas presentes."],
    "O desenho do panóptico torna possível vigiar sem revelar quando isso acontece. Antecipando o olhar, a pessoa pode passar a se policiar."],
  ["deleuze", "Na passarela, os estudantes usam aplicativos cujas recomendações mudam com cada curtida. Por que a cena ajuda a pensar as sociedades de controle?",
    ["As escolhas continuam abertas, mas o sistema ajusta o que aparece a partir do comportamento.", "Os aplicativos orientam as escolhas por meio de horários e espaços fixos de confinamento.", "A personalização interrompe a influência do sistema assim que o usuário faz a primeira escolha.", "A influência depende apenas de ordens explícitas e visíveis para cada usuário."],
    "Em Deleuze, o controle pode operar por ajustes contínuos. As recomendações da cena ilustram como esses ajustes orientam escolhas fora de instituições fechadas."],
  ["angela-davis", "Ao discutir o encarceramento em massa, que pergunta se aproxima da abordagem de Angela Davis?",
    ["Como raça, classe e gênero influenciam quem é punido e quais alternativas podemos construir?", "Como ampliar a capacidade das prisões para acompanhar o aumento das penas?", "Como tornar as punições mais uniformes sem examinar quem é mais atingido por elas?", "Como explicar o encarceramento principalmente pelas escolhas individuais de quem foi preso?"],
    "Davis relaciona as prisões a desigualdades históricas e propõe pensar respostas à violência que incluam prevenção, apoio e responsabilização."],
  ["krenak", "O que Ailton Krenak comunica ao chamar o rio Watu de avô?",
    ["Que o rio faz parte das relações de parentesco, memória e cuidado de seu povo.", "Que o rio merece proteção principalmente pelo seu valor econômico para a região.", "Que o vínculo com o rio é uma lembrança do passado sem efeito nas decisões de hoje.", "Que preservar o rio exige separar a história das comunidades da história da natureza."],
    "O Watu é apresentado como um parente vivo. Essa relação liga o cuidado com o rio à memória e ao modo de viver do povo Krenak."],
  ["turing", "No jogo da imitação de Alan Turing, o que cabe à pessoa que faz as perguntas?",
    ["Tentar distinguir a máquina da pessoa pelas respostas em uma conversa escrita.", "Medir qual interlocutor resolve mais operações matemáticas em menos tempo.", "Determinar como o computador foi programado a partir de uma resposta isolada.", "Comprovar se a máquina consegue sentir as mesmas emoções que uma pessoa."],
    "Turing propõe avaliar o desempenho da máquina em uma conversa escrita. Quem interroga se baseia nas respostas para distinguir os interlocutores."],
];
export const GRAND_QUIZ_BANK = questions.map(([philosopher, prompt, options, explanation]) => ({
  id: `grand-${philosopher}`, philosopher, prompt, options, explanation,
}));
