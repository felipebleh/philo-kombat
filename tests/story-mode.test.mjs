import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";
import {
  STORY_QUIZ_BANK, createStoryQuiz, answerStoryQuiz, advanceStoryQuiz,
  quizRecoveryIndex, nextEncounterAfterReview, FINAL_ENCOUNTER_INDEX,
} from "../app/story-quiz.mjs";
import { DOCTOR_UNLOCK_KEY, readDoctorUnlocked, unlockDoctor } from "../app/story-ending.mjs";
import { visibleArtBounds } from "../app/art-bounds.mjs";

import {
  ARISTOTLE_POST_FIGHT_SCENES,
  AUGUSTINE_POST_FIGHT_SCENES,
  DESCARTES_POST_FIGHT_SCENES,
  KANT_POST_FIGHT_SCENES,
  LOCKE_POST_FIGHT_SCENES,
  MARX_POST_FIGHT_SCENES,
  NIETZSCHE_POST_FIGHT_SCENES,
  nextDiscipleEncounter,
  PLATO_POST_FIGHT_SCENES,
  STORY_ENCOUNTERS,
  STORY_INTRO_SCENES,
  STORY_POST_FIGHT_SCENES,
} from "../app/story-mode.mjs";

const root = new URL("../", import.meta.url);
const page = await readFile(new URL("app/page.tsx", root), "utf8");
const css = await readFile(new URL("app/globals.css", root), "utf8");

test("enquadramento preserva mãos e pés e remove espaço transparente dos sprites", () => {
  const pixels = new Uint8ClampedArray(10 * 20 * 4);
  for (const [x, y] of [[2, 1], [7, 10], [3, 18]]) pixels[(y * 10 + x) * 4 + 3] = 253;
  pixels[3] = 10; // halo quase transparente não deve reduzir a escala do corpo
  assert.deepEqual(visibleArtBounds(pixels, 10, 20), { left: 2, top: 1, width: 6, height: 18 });
  assert.equal(visibleArtBounds(new Uint8ClampedArray(80), 5, 4), null);
});

test("estilos do final não ocultam o quadro nem reduzem o avatar da vitória", async () => {
  const ending = await readFile(new URL("app/story-ending-scene.tsx", root), "utf8");
  const finaleCss = css.slice(css.indexOf("/* Finale:"), css.indexOf("@keyframes story-cutscene-in"));
  // Regression: the container used the same class as its invisible child layer;
  // the tossed Felipe also shared the post-fight winner's class.
  assert.doesNotMatch(finaleCss, /\.ending-felipe\b|\.ending-celebration\b/);
  assert.match(ending, /finale-stage-\$\{stage\}/);
  assert.match(ending, /const ready = groupReady && felipeReady/);
  assert.match(page, /matchWinner === "felipe" \? <FelipeSprite staticPose="victory" framing="tight"/);
});

test("conquista de Doutor persiste ao reabrir e ao reiniciar Discípulo", () => {
  const entries = new Map();
  const storage = { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) };
  assert.equal(readDoctorUnlocked(storage), false);
  storage.setItem(DOCTOR_UNLOCK_KEY, "invalid");
  assert.equal(readDoctorUnlocked(storage), false);
  assert.equal(unlockDoctor(storage), true);
  assert.equal(readDoctorUnlocked(storage), true);
  entries.delete("philo-kombat:story:disciple");
  assert.equal(readDoctorUnlocked(storage), true);
  const reopened = { getItem: (key) => entries.get(key) ?? null };
  assert.equal(readDoctorUnlocked(reopened), true);
});

test("conquista continua em memória quando armazenamento é bloqueado", () => {
  const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
  assert.equal(readDoctorUnlocked(blocked), false);
  assert.equal(unlockDoctor(blocked), true);
});

test("quiz tem dez questões, quatro alternativas e cobre os nove filósofos", () => {
  assert.equal(STORY_QUIZ_BANK.length, 10);
  assert.equal(new Set(STORY_QUIZ_BANK.map(({ id }) => id)).size, 10);
  assert.deepEqual(new Set(STORY_QUIZ_BANK.map(({ philosopher }) => philosopher)),
    new Set(STORY_ENCOUNTERS.slice(0, -1).map(({ opponent }) => opponent)));
  for (const question of STORY_QUIZ_BANK) {
    assert.equal(question.options.length, 4);
    assert.equal(new Set(question.options).size, 4);
    assert.ok(question.prompt && question.explanation);
  }
});

test("sorteio preserva respostas corretas e traz três filósofos diferentes", () => {
  const selections = new Set();
  let seed = 158;
  const random = () => ((seed = (1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
  for (let attempt = 0; attempt < 100; attempt++) {
    const quiz = createStoryQuiz(random);
    assert.equal(quiz.questions.length, 3);
    assert.equal(new Set(quiz.questions.map(({ philosopher }) => philosopher)).size, 3);
    selections.add(quiz.questions.map(({ id }) => id).join(","));
    for (const question of quiz.questions) {
      assert.equal(question.choices.length, 4);
      assert.equal(question.choices.find(({ id }) => id === 0).text, question.options[0]);
      assert.deepEqual(new Set(question.choices.map(({ text }) => text)), new Set(question.options));
    }
  }
  assert.ok(selections.size > 20);
});

test("somente três acertos liberam o chefe; cliques repetidos não contam duas vezes", () => {
  let quiz = createStoryQuiz(() => .5);
  assert.equal(advanceStoryQuiz(quiz), quiz);
  assert.equal(answerStoryQuiz(quiz, 99), quiz);
  for (let i = 0; i < 3; i++) {
    assert.equal(quiz.status, "question");
    assert.equal(quiz.index, i);
    quiz = answerStoryQuiz(quiz, 0);
    assert.equal(quiz.status, "correct");
    assert.equal(answerStoryQuiz(quiz, 1), quiz);
    quiz = advanceStoryQuiz(quiz);
  }
  assert.equal(quiz.status, "passed");
  assert.equal(answerStoryQuiz(quiz, 1), quiz);
});

test("erro em qualquer pergunta interrompe o quiz e volta ao filósofo certo", () => {
  for (const question of STORY_QUIZ_BANK) {
    for (let slot = 0; slot < 3; slot++) {
      let quiz = createStoryQuiz(() => .5);
      quiz.questions[slot] = { ...question, choices: question.options.map((text, id) => ({ id, text })) };
      for (let i = 0; i < slot; i++) quiz = advanceStoryQuiz(answerStoryQuiz(quiz, 0));
      quiz = answerStoryQuiz(quiz, 2);
      assert.equal(quiz.status, "failed");
      assert.equal(advanceStoryQuiz(quiz), quiz);
      assert.equal(answerStoryQuiz(quiz, 0), quiz);
      const recovery = quizRecoveryIndex(quiz);
      assert.equal(STORY_ENCOUNTERS[recovery].opponent, question.philosopher);
      assert.deepEqual(nextEncounterAfterReview(recovery, recovery), { completed: false, index: FINAL_ENCOUNTER_INDEX });
      const fresh = createStoryQuiz(() => .25);
      assert.equal(fresh.index, 0);
      assert.equal(fresh.status, "question");
      assert.equal(fresh.selected, null);
    }
  }
  assert.deepEqual(nextEncounterAfterReview(0), { completed: false, index: 1 });
  assert.equal(nextEncounterAfterReview(FINAL_ENCOUNTER_INDEX).completed, true);
});

test("campanha Discípulo percorre os dez confrontos na ordem planejada", () => {
  assert.deepEqual(
    STORY_ENCOUNTERS.map(({ opponent }) => opponent),
    [
      "socrates",
      "plato",
      "aristotle",
      "agostinho",
      "descartes",
      "locke",
      "kant",
      "marx",
      "nietzsche",
      "superintelligence",
    ],
  );

  let index = 0;
  const visited = [STORY_ENCOUNTERS[index].opponent];
  while (true) {
    const next = nextDiscipleEncounter(index);
    if (next.completed) break;
    index = next.index;
    visited.push(STORY_ENCOUNTERS[index].opponent);
  }

  assert.equal(index, STORY_ENCOUNTERS.length - 1);
  assert.equal(visited.length, 10);
});

test("introdução usa as oito artes anexadas e todas as arenas existem", async () => {
  assert.equal(STORY_INTRO_SCENES.length, 8);
  assert.deepEqual(
    STORY_INTRO_SCENES.map(({ image }) => image),
    [
      "/game/story-intro-01.webp",
      "/game/story-intro-02.webp",
      "/game/story-intro-03.webp",
      "/game/story-intro-04.webp",
      "/game/story-intro-05.webp",
      "/game/story-intro-06.webp",
      "/game/story-intro-07.webp",
      "/game/story-intro-08.webp",
    ],
  );
  for (const scene of STORY_INTRO_SCENES) {
    await access(new URL(`public${scene.image}`, root));
  }
  for (const encounter of STORY_ENCOUNTERS) {
    const expectedBeats = encounter.opponent === "superintelligence" ? 2 : 1;
    assert.equal(encounter.intro.length, expectedBeats, `${encounter.opponent}: intro`);
    assert.equal(encounter.outro.length, expectedBeats, `${encounter.opponent}: outro`);
    await access(new URL(`public${encounter.background}`, root));
  }
  const finalEncounter = STORY_ENCOUNTERS.at(-1);
  assert.equal(
    finalEncounter.intro[0].line,
    "Já lutei com vários filósofos. Agora quero lutar contra você!",
  );
  assert.equal(
    finalEncounter.outro.at(-1).line,
    "O pensamento não pertence a uma máquina. Ele vive quando é compartilhado.",
  );
  await access(new URL("public/game/story-ending-philosophers-v1.webp", root));
  await access(new URL("public/game/story-ending-felipe-toss-v1.webp", root));
  await access(new URL("public/game/superintelligence-fullbody-hq.webp", root));
});

test("pós-luta de Platão mostra seis artes comprimidas antes de Aristóteles", async () => {
  assert.equal(STORY_ENCOUNTERS[1].opponent, "plato");
  assert.equal(STORY_ENCOUNTERS[2].opponent, "aristotle");
  assert.deepEqual(
    PLATO_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-plato-after-0${i + 1}.webp`),
  );
  for (const scene of PLATO_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
  assert.match(page, /activeRecapScenes\[storyIndex\] \? "story-recap" : "story-scene"/);
  assert.match(page, /const sceneCount = storySceneKind === "outro" && recapScenes[\s\S]*?recapScenes\.length/);
  assert.match(page, /name: "FELIPE BLEH"/);
});

test("pós-luta de Aristóteles mostra seis artes antes de Agostinho", async () => {
  assert.equal(STORY_ENCOUNTERS[2].opponent, "aristotle");
  assert.equal(STORY_ENCOUNTERS[3].opponent, "agostinho");
  assert.equal(STORY_POST_FIGHT_SCENES[2], ARISTOTLE_POST_FIGHT_SCENES);
  assert.deepEqual(
    ARISTOTLE_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-aristotle-after-0${i + 1}.webp`),
  );
  for (const scene of ARISTOTLE_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Agostinho mostra cinco artes antes de Descartes", async () => {
  assert.equal(STORY_ENCOUNTERS[3].opponent, "agostinho");
  assert.equal(STORY_ENCOUNTERS[4].opponent, "descartes");
  assert.equal(STORY_POST_FIGHT_SCENES[3], AUGUSTINE_POST_FIGHT_SCENES);
  assert.deepEqual(
    AUGUSTINE_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 5 }, (_, i) => `/game/story-augustine-after-0${i + 1}.webp`),
  );
  for (const scene of AUGUSTINE_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Descartes mostra seis artes antes de Locke", async () => {
  assert.equal(STORY_ENCOUNTERS[4].opponent, "descartes");
  assert.equal(STORY_ENCOUNTERS[5].opponent, "locke");
  assert.equal(STORY_POST_FIGHT_SCENES[4], DESCARTES_POST_FIGHT_SCENES);
  assert.deepEqual(
    DESCARTES_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-descartes-after-0${i + 1}.webp`),
  );
  for (const scene of DESCARTES_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Locke mostra cinco artes antes de Kant", async () => {
  assert.equal(STORY_ENCOUNTERS[5].opponent, "locke");
  assert.equal(STORY_ENCOUNTERS[6].opponent, "kant");
  assert.equal(STORY_POST_FIGHT_SCENES[5], LOCKE_POST_FIGHT_SCENES);
  assert.deepEqual(
    LOCKE_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 5 }, (_, i) => `/game/story-locke-after-0${i + 1}.webp`),
  );
  for (const scene of LOCKE_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Kant mostra seis artes antes de Marx", async () => {
  assert.equal(STORY_ENCOUNTERS[6].opponent, "kant");
  assert.equal(STORY_ENCOUNTERS[7].opponent, "marx");
  assert.equal(STORY_POST_FIGHT_SCENES[6], KANT_POST_FIGHT_SCENES);
  assert.deepEqual(
    KANT_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-kant-after-0${i + 1}.webp`),
  );
  for (const scene of KANT_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Marx mostra seis artes antes de Nietzsche", async () => {
  assert.equal(STORY_ENCOUNTERS[7].opponent, "marx");
  assert.equal(STORY_ENCOUNTERS[8].opponent, "nietzsche");
  assert.equal(STORY_POST_FIGHT_SCENES[7], MARX_POST_FIGHT_SCENES);
  assert.deepEqual(
    MARX_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-marx-after-0${i + 1}.webp`),
  );
  for (const scene of MARX_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("pós-luta de Nietzsche mostra seis artes antes da Superinteligência", async () => {
  assert.equal(STORY_ENCOUNTERS[8].opponent, "nietzsche");
  assert.equal(STORY_ENCOUNTERS[9].opponent, "superintelligence");
  assert.equal(STORY_POST_FIGHT_SCENES[8], NIETZSCHE_POST_FIGHT_SCENES);
  assert.deepEqual(
    NIETZSCHE_POST_FIGHT_SCENES.map(({ image }) => image),
    Array.from({ length: 6 }, (_, i) => `/game/story-nietzsche-after-0${i + 1}.webp`),
  );
  for (const scene of NIETZSCHE_POST_FIGHT_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`public${scene.image}`, root))).size < 700_000);
  }
});

test("Modo História reutiliza o motor e o acesso ao Versus permanece ligado", () => {
  assert.match(
    page,
    /await preloadFightAssets\(\s*"felipe", opponent, setLoadingProgress,\s*activeStoryEncounters\[encounterIndex\]\.background,[^)]*\);\s+resetGame\(\);/,
  );
  assert.match(page, /onClick=\{openSelection\}[\s\S]*?MODO VERSUS/);
  assert.match(page, /gameMode === "story"[\s\S]*?CONTINUAR HISTÓRIA/);
  assert.match(page, /gameMode === "story" \|\| nextPlayerWins >= 2/);
  assert.match(
    page,
    /nextStoryIntroScene[\s\S]*?setPhase\(storyCampaign !== "disciple" \? "story-scene" : "story-tier-select"\)/,
  );
  assert.match(page, /gameMode === "story" \? "mode-story"/);
  assert.match(page, /Voltar à escolha de modos/);
  assert.match(page, /onClick=\{openStoryIntro\}[\s\S]*?MODO HISTÓRIA/);
  assert.match(page, /story-intro-player/);
  assert.match(page, /const preload = new Image\(\)/);
  assert.match(page, /StoryEnding/);
});

test("seleção da jornada apresenta apenas os três níveis planejados", () => {
  const tierSelection = page.match(
    /phase === "story-tier-select"[\s\S]*?phase === "story-scene"/,
  )?.[0];

  assert.ok(tierSelection);
  assert.match(tierSelection, /NÍVEL 1[\s\S]*?DISCÍPULO/);
  assert.match(tierSelection, /NÍVEL 2[\s\S]*?DOUTOR/);
  assert.match(tierSelection, /NÍVEL 3[\s\S]*?GRANDE FILÓSOFO/);
  assert.doesNotMatch(tierSelection, /MESTRE/);
  assert.match(css, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
});

test("Discípulo começa em Sócrates e a retomada salva é uma escolha separada", () => {
  const tierSelection = page.match(
    /phase === "story-tier-select"[\s\S]*?phase === "story-scene"/,
  )?.[0];
  assert.ok(tierSelection);
  assert.match(tierSelection, /onClick=\{\(\) => startDiscipleCampaign\(true\)\}[\s\S]*?COMEÇAR POR SÓCRATES/);
  assert.match(tierSelection, /onClick=\{\(\) => startDiscipleCampaign\(false\)\}[\s\S]*?RETOMAR PROGRESSO SALVO/);
});
