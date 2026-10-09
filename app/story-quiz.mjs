import { STORY_ENCOUNTERS, nextDiscipleEncounter } from "./story-mode.mjs";

export const QUIZ_RECOVERY_KEY = "philo-kombat-disciple-quiz-recovery-v1";
export const FINAL_ENCOUNTER_INDEX = STORY_ENCOUNTERS.length - 1;

// A primeira alternativa é a correta na base; a apresentação embaralha todas.
export const STORY_QUIZ_BANK = [
  { id: "socrates-dialogue", philosopher: "socrates", prompt: "Como Sócrates ajudava as pessoas a pensar?", options: ["Por meio de perguntas e diálogos.", "Exigindo que decorassem suas respostas.", "Proibindo qualquer dúvida.", "Substituindo argumentos pela força."], explanation: "Sócrates usava perguntas e diálogos para examinar ideias e buscar o autoconhecimento." },
  { id: "plato-cave", philosopher: "plato", prompt: "O que representa a saída da caverna em Platão?", options: ["A passagem das aparências para o conhecimento.", "O abandono de toda busca pela verdade.", "A certeza de que as sombras são a realidade inteira.", "A escolha de nunca questionar o que vemos."], explanation: "Sair da caverna representa superar as aparências e buscar o conhecimento verdadeiro." },
  { id: "aristotle-virtue", philosopher: "aristotle", prompt: "Para Aristóteles, a virtude envolve…", options: ["Praticar hábitos e buscar equilíbrio entre excessos.", "Agir sempre de modo exagerado.", "Evitar qualquer convivência com outras pessoas.", "Esperar que boas intenções substituam nossas ações."], explanation: "A virtude é cultivada pela prática e pela justa medida, evitando o excesso e a falta." },
  { id: "augustine-faith", philosopher: "agostinho", prompt: "Na busca da verdade, como Agostinho relaciona fé e razão?", options: ["Como caminhos que podem se complementar.", "Como inimigas que nunca podem dialogar.", "Como assuntos sem relação com a verdade.", "Como substitutas do autoconhecimento."], explanation: "Em Agostinho, fé e razão se complementam na busca da verdade, junto ao exame interior." },
  { id: "descartes-cogito", philosopher: "descartes", prompt: "Qual certeza Descartes encontra ao duvidar?", options: ["Penso, logo existo.", "Tudo o que vejo é sempre verdadeiro.", "Nunca podemos ter nenhuma certeza.", "Só existo quando alguém me observa."], explanation: "Mesmo duvidando, Descartes reconhece que existe como ser que pensa: penso, logo existo." },
  { id: "locke-experience", philosopher: "locke", prompt: "Segundo Locke, de onde vêm nossas ideias?", options: ["Da experiência, pela sensação e pela reflexão.", "De um conjunto completo de ideias com que nascemos.", "Apenas de ordens dadas pelo governo.", "De conhecimentos que surgem sem contato com o mundo."], explanation: "Para Locke, a mente não nasce com ideias inatas. A experiência fornece ideias pela sensação e pela reflexão." },
  { id: "kant-duty", philosopher: "kant", prompt: "Ao decidir como agir, a ética de Kant nos convida a…", options: ["Pensar se o princípio da ação poderia valer para todos.", "Buscar vantagem pessoal a qualquer custo.", "Cumprir o dever somente quando alguém estiver olhando.", "Trocar nossos princípios sempre que for conveniente."], explanation: "Kant propõe agir por dever, segundo princípios que possam valer para todos, e não apenas por interesse pessoal." },
  { id: "marx-surplus", philosopher: "marx", prompt: "O que Marx chama de mais-valia?", options: ["O valor produzido pelo trabalhador além do que recebe em salário, apropriado pelo capitalista.", "Um prêmio pago ao trabalhador por toda a riqueza que produz.", "A divisão igual de toda a produção entre as pessoas.", "O tempo de descanso do trabalhador fora da fábrica."], explanation: "Na análise de Marx, o trabalhador produz um valor além do que recebe em salário. Esse excedente é apropriado pelo capitalista." },
  { id: "nietzsche-overcoming", philosopher: "nietzsche", prompt: "Em Nietzsche, a autossuperação envolve…", options: ["Superar a si mesmo e criar novos valores e modos de viver.", "Obedecer sem questionar a todos os valores recebidos.", "Dominar outras pessoas para provar superioridade.", "Desistir de fazer escolhas sobre a própria vida."], explanation: "A autossuperação envolve transformar a si mesmo e criar valores, em vez de viver apenas à sombra dos valores recebidos." },
  { id: "nietzsche-return", philosopher: "nietzsche", prompt: "Qual desafio o eterno retorno coloca ao modo como vivemos?", options: ["Viver de modo que possamos afirmar nossa vida e nossas escolhas.", "Esperar que outra pessoa escolha nossa vida por nós.", "Apagar o passado para nunca pensar nas escolhas feitas.", "Rejeitar a vida porque todas as escolhas são inúteis."], explanation: "O eterno retorno desafia a afirmar a vida: você aceitaria viver novamente esta vida, com suas escolhas?" },
];

/** @template T @param {T[]} items @param {() => number} random @returns {T[]} */
function shuffled(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createStoryQuiz(random = Math.random) {
  // Cada tentativa também contempla três filósofos diferentes.
  const philosophers = new Set();
  const questions = shuffled(STORY_QUIZ_BANK, random).filter((question) => {
    if (philosophers.has(question.philosopher)) return false;
    philosophers.add(question.philosopher);
    return true;
  }).slice(0, 3).map((question) => ({
    ...question,
    choices: shuffled(question.options.map((text, id) => ({ id, text })), random),
  }));
  return { questions, index: 0, selected: null, status: "question" };
}

export function answerStoryQuiz(quiz, choiceId) {
  if (quiz.status !== "question" || !quiz.questions[quiz.index].choices.some(({ id }) => id === choiceId)) return quiz;
  return { ...quiz, selected: choiceId, status: choiceId === 0 ? "correct" : "failed" };
}

export function advanceStoryQuiz(quiz) {
  if (quiz.status !== "correct") return quiz;
  return quiz.index === quiz.questions.length - 1
    ? { ...quiz, status: "passed" }
    : { ...quiz, index: quiz.index + 1, selected: null, status: "question" };
}

export function quizRecoveryIndex(quiz) {
  return STORY_ENCOUNTERS.findIndex(({ opponent }) => opponent === quiz.questions[quiz.index].philosopher);
}

/** @param {number} index @param {number | null} recoveryIndex */
export function nextEncounterAfterReview(index, recoveryIndex = null) {
  return index === recoveryIndex
    ? { completed: false, index: FINAL_ENCOUNTER_INDEX }
    : nextDiscipleEncounter(index);
}
