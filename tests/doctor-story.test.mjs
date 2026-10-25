import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import {
  DOCTOR_ENCOUNTERS, DOCTOR_INTRO_SCENES, DOCTOR_OPPONENT_ORDER,
  DOCTOR_FINAL_ENCOUNTER_INDEX, DOCTOR_FINAL_PRE_FIGHT_SCENES, doctorIntroScenes,
  DOCTOR_POST_FIGHT_SCENES, HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES, DIOGENES_POST_FIGHT_SCENES, HYPATIA_POST_FIGHT_SCENES, AVERROES_POST_FIGHT_SCENES, THOMAS_POST_FIGHT_SCENES, MACHIAVELLI_POST_FIGHT_SCENES, GALILEO_POST_FIGHT_SCENES, HOBBES_POST_FIGHT_SCENES, ROUSSEAU_POST_FIGHT_SCENES, HEGEL_POST_FIGHT_SCENES, SCHOPENHAUER_POST_FIGHT_SCENES, KIERKEGAARD_POST_FIGHT_SCENES, FREUD_POST_FIGHT_SCENES,
  STORY_ENCOUNTERS, STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES,
  nextDoctorEncounter, storyImagePreloadUrls,
} from "../app/story-mode.mjs";
import { SOUNDTRACK, battleTrack } from "../app/soundtrack.mjs";
import { createStoryQuiz, answerStoryQuiz, advanceStoryQuiz, quizRecoveryIndex } from "../app/story-quiz.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

// Run the real campaign callbacks with their state and I/O dependencies supplied.
function campaignHarness(unlocked = true) {
  const calls = [];
  const entries = new Map([["philo-kombat:story:disciple", "4"]]);
  const state = {
    doctorUnlocked: unlocked, storyCampaign: "disciple", storyIndex: 0,
    storySceneKind: "intro", storySceneStep: 0, storyIntroIndex: 0,
    storySavedIndex: 4, quizReturnIndex: null,
  };
  const context = {
    ...state, STORY_ENCOUNTERS, STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES,
    DOCTOR_ENCOUNTERS, DOCTOR_INTRO_SCENES, DOCTOR_POST_FIGHT_SCENES, nextDoctorEncounter,
    DOCTOR_FINAL_ENCOUNTER_INDEX,
    FINAL_ENCOUNTER_INDEX: 9,
    storyIntroLocked: { current: false }, storyRecapLocked: { current: false },
    quizPassed: { current: false }, quizAnswerLocked: { current: false },
    createStoryQuiz, answerStoryQuiz, advanceStoryQuiz, quizRecoveryIndex,
    useCallback: (fn) => fn,
    playTone: () => {},
    openStoryQuiz: () => calls.push("quiz"),
    completeDiscipleCampaign: () => calls.push("disciple-ending"),
    nextEncounterAfterReview: (index) => ({ completed: false, index: index + 1 }),
    window: {
      setTimeout: (fn) => fn(),
      localStorage: {
        getItem: (key) => entries.get(key) ?? null,
        setItem: (key, value) => entries.set(key, value),
        removeItem: (key) => entries.delete(key),
      },
    },
    preloadFightAssets: async (fighter, opponent, progress, background) => {
      calls.push({ fighter, opponent, background }); progress(100);
    },
    resetGame: () => { calls.push("combat-engine"); context.phase = "playing"; },
  };
  for (const setter of [...page.matchAll(/\b(set\w+)\(/g)].map((match) => match[1])) {
    const key = setter.slice(3, 4).toLowerCase() + setter.slice(4);
    context[setter] = (value) => { context[key] = typeof value === "function" ? value(context[key]) : value; };
  }
  function callback(name) {
    context.activeStoryEncounters = context.storyCampaign === "doctor" ? DOCTOR_ENCOUNTERS : STORY_ENCOUNTERS;
    context.activeIntroScenes = context.storyCampaign === "doctor" ? doctorIntroScenes(context.storyIndex) : STORY_INTRO_SCENES;
    context.activeRecapScenes = context.storyCampaign === "doctor" ? DOCTOR_POST_FIGHT_SCENES : STORY_POST_FIGHT_SCENES;
    const start = page.indexOf(`  const ${name} = useCallback(`);
    assert.ok(start >= 0, name);
    const end = page.indexOf("\n  const ", start + 1);
    const code = ts.transpileModule(`(() => {\n${page.slice(start, end)}\nreturn ${name};\n})();`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).outputText;
    return vm.runInNewContext(code, context);
  }
  context.prepareStoryFight = (index) => callback("prepareStoryFight")(index);
  context.openDoctorQuiz = () => callback("openDoctorQuiz")();
  context.completeDoctorCampaign = () => callback("completeDoctorCampaign")();
  return { context, calls, entries, callback };
}

test("Doutor mantém a conquista necessária para entrar", () => {
  const locked = campaignHarness(false);
  locked.callback("startDoctorCampaign")();
  assert.equal(locked.context.storyCampaign, "disciple");
  assert.equal(locked.context.phase, undefined);
});

test("duas artes levam a Felipe contra Homero em Troia pelo motor existente", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  assert.equal(context.phase, "story-intro");
  assert.equal(context.storyCampaign, "doctor");
  assert.equal(context.selectedFighter, "felipe");
  assert.equal(context.selectedOpponent, "homero");
  assert.equal(DOCTOR_INTRO_SCENES[context.storyIntroIndex].image, "/game/story-doctor-intro-01.webp");
  callback("nextStoryIntroScene")();
  assert.equal(DOCTOR_INTRO_SCENES[context.storyIntroIndex].image, "/game/story-doctor-intro-02.webp");
  callback("nextStoryIntroScene")();
  assert.equal(context.phase, "story-scene");
  await callback("advanceStoryScene")();
  assert.equal(context.storySceneStep, 1);
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "homero", background: "/game/arena-troia.webp" }, "combat-engine"]);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  assert.equal(battleTrack("story", "felipe", "homero"), SOUNDTRACK.ancient);
});

test("vitória em Homero percorre cinco artes e leva à luta de Tales em Jônia", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  assert.equal(context.storySceneKind, "outro");
  for (let step = 0; step < HOMERO_POST_FIGHT_SCENES.length; step++) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    await callback("advanceStoryScene")();
  }
  assert.equal(context.phase, "story-scene");
  assert.match(page, /Avançar cena após \$\{FIGHTERS\[activeStoryEncounters\[storyIndex\]\.opponent/);
  assert.equal(context.storyIndex, 1);
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.selectedOpponent, "tales");
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  assert.deepEqual(nextDoctorEncounter(0), { completed: false, pending: false, index: 1 });
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.equal(context.selectedOpponent, "tales");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "tales", background: "/game/arena-jonia.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "tales"), SOUNDTRACK.ancient);
});

test("vitória em Tales percorre cinco artes e inicia Diógenes", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 1;
  context.selectedOpponent = "tales";
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  assert.equal(context.storySceneKind, "outro");
  for (let step = 0; step < TALES_POST_FIGHT_SCENES.length; step++) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, TALES_POST_FIGHT_SCENES[step].image);
    await callback("advanceStoryScene")();
  }
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 2);
  assert.equal(context.selectedOpponent, "diogenes");
  assert.deepEqual(nextDoctorEncounter(1), { completed: false, pending: false, index: 2 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "diogenes", background: "/game/arena-diogenes.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "diogenes"), SOUNDTRACK.ancient);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 1 }), [TALES_POST_FIGHT_SCENES[0].image]);
  }
});

test("vitória em Diógenes percorre cinco artes e leva à luta de Hipátia", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 2;
  context.selectedOpponent = "diogenes";
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  assert.equal(context.storySceneKind, "outro");
  assert.equal(DIOGENES_POST_FIGHT_SCENES.length, 5);
  const topics = [/cinismo/, /liberdade da simplicidade/, /lanterna.*autenticidade/, /Alexandre.*sol/, /servidores.*Hipátia/];
  let bytes = 0;
  for (const [step, scene] of DIOGENES_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 2, sceneStep: step }),
      DIOGENES_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storyIndex, 3);
  assert.equal(context.selectedOpponent, "hypatia");
  assert.deepEqual(nextDoctorEncounter(2), { completed: false, pending: false, index: 3 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "hypatia", background: "/game/arena-hipatia.webp" }, "combat-engine"]);
  assert.match(page, /onClick=\{\(\) => prepareStoryFight\(storyIndex\)\}/);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 2 }), [DIOGENES_POST_FIGHT_SCENES[0].image]);
  }
});

test("vitória em Hipátia percorre cinco artes e leva à luta de Averróis em Córdoba", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 3;
  context.selectedOpponent = "hypatia";
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  assert.equal(context.storySceneKind, "outro");
  assert.equal(HYPATIA_POST_FIGHT_SCENES.length, 5);
  const topics = [/Alexandria.*séculos IV e V.*350 e 370.*415/, /matemática e astronomia.*ordem do mundo/, /neoplatonismo.*educar a alma/, /415.*intolerância.*liberdade de ensinar/, /servidores.*Hipátia.*Averróis/];
  let bytes = 0;
  for (const [step, scene] of HYPATIA_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 3, sceneStep: step }),
      HYPATIA_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 3 }), [HYPATIA_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 3 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 4);
  assert.equal(context.selectedOpponent, "averroes");
  assert.deepEqual(nextDoctorEncounter(3), { completed: false, pending: false, index: 4 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "averroes", background: "/game/arena-averroes.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "averroes"), SOUNDTRACK.medieval);
});

test("vitória em Averróis percorre quatro artes e leva à luta de Tomás de Aquino", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 4;
  context.selectedOpponent = "averroes";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(AVERROES_POST_FIGHT_SCENES.length, 4);
  const topics = [/Ibn Rushd.*1126 a 1198.*Córdoba.*Aristóteles/, /razão e a fé.*textos sagrados/, /bandeira de Aristóteles.*hebraico e o latim/, /servidores.*Averróis.*Tomás de Aquino/];
  let bytes = 0;
  for (const [step, scene] of AVERROES_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 4, sceneStep: step }),
      AVERROES_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 4 }), [AVERROES_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 4 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 5);
  assert.equal(context.selectedOpponent, "thomas");
  assert.deepEqual(nextDoctorEncounter(4), { completed: false, pending: false, index: 5 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "thomas", background: "/game/arena-tomas.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "thomas"), SOUNDTRACK.medieval);
});

test("vitória em Tomás percorre quatro artes e leva à luta de Maquiavel em Florença", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 5;
  context.selectedOpponent = "thomas";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(THOMAS_POST_FIGHT_SCENES.length, 4);
  const topics = [/1225 a 1274.*escolástica.*Boi Mudo.*Alberto Magno/, /ponte.*razão e fé.*Aristóteles.*revelação/, /cinco vias.*movimento.*causas eficientes.*contingência.*graus de perfeição.*finalidade/, /trono.*servidores.*O Príncipe.*Maquiavel/];
  let bytes = 0;
  for (const [step, scene] of THOMAS_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 5, sceneStep: step }),
      THOMAS_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 5 }), [THOMAS_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 5 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 6);
  assert.equal(context.selectedOpponent, "machiavelli");
  assert.deepEqual(nextDoctorEncounter(5), { completed: false, pending: false, index: 6 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "machiavelli", background: "/game/arena-maquiavel.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "machiavelli"), SOUNDTRACK.modern);
});

test("vitória em Maquiavel percorre cinco artes e leva à luta de Galileu", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 6;
  context.selectedOpponent = "machiavelli";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(MACHIAVELLI_POST_FIGHT_SCENES.length, 5);
  const topics = [/Maquiavel.*O Príncipe.*conquistar e conservar.*1469–1527/, /amado ou temido.*evitar o ódio/, /leme.*fortuna.*Virtù.*ajusta as velas/, /bastidores.*imagem pública.*parecer justo.*aparência/, /servidores.*coroa.*SuperIA.*Galileu/];
  let bytes = 0;
  for (const [step, scene] of MACHIAVELLI_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 6, sceneStep: step }),
      MACHIAVELLI_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 6 }), [MACHIAVELLI_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 6 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 7);
  assert.equal(context.selectedOpponent, "galileo");
  assert.deepEqual(nextDoctorEncounter(6), { completed: false, pending: false, index: 7 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "galileo", background: "/game/arena-galileu.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "galileo"), SOUNDTRACK.modern);
});

test("vitória em Galileu percorre cinco artes e leva à luta de Hobbes", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 7;
  context.selectedOpponent = "galileo";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(GALILEO_POST_FIGHT_SCENES.length, 5);
  const topics = [/luneta.*Galileu.*Revolução Científica.*1564–1642/, /Júpiter.*quatro luas.*Vênus.*heliocentrismo/, /Torre de Pisa.*resistência do ar.*aceleração.*incerta/, /1633.*Inquisição.*prisão domiciliar.*investigação/, /SuperIA.*holograma.*Hobbes.*paz/];
  let bytes = 0;
  for (const [step, scene] of GALILEO_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 7, sceneStep: step }),
      GALILEO_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 7 }), [GALILEO_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 7 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 8);
  assert.equal(context.selectedOpponent, "hobbes");
  assert.deepEqual(nextDoctorEncounter(7), { completed: false, pending: false, index: 8 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "hobbes", background: "/game/arena-hobbes.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "hobbes"), SOUNDTRACK.modern);
});

test("vitória em Hobbes percorre cinco artes e leva à luta de Rousseau", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 8;
  context.selectedOpponent = "hobbes";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(HOBBES_POST_FIGHT_SCENES.length, 5);
  const topics = [/guerras civis inglesas.*1588 a 1679.*1651.*paz/, /ladrão.*sombra.*lobo.*Plauto/, /pacto pela paz.*soberano.*contrato social/, /Felipe.*corpo do Leviatã.*homem artificial/, /SuperIA.*capuz.*lobo.*natureza.*Rousseau/];
  let bytes = 0;
  for (const [step, scene] of HOBBES_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 8, sceneStep: step }),
      HOBBES_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 8 }), [HOBBES_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 8 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(context.storyIndex, 9);
  assert.equal(context.selectedOpponent, "rousseau");
  assert.deepEqual(nextDoctorEncounter(8), { completed: false, pending: false, index: 9 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "rousseau", background: "/game/arena-rousseau.webp" }, "combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "rousseau"), SOUNDTRACK.modern);
});

test("vitória em Rousseau percorre cinco artes e abre a luta de Hegel", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 9;
  context.selectedOpponent = "rousseau";
  callback("openStoryOutro")();
  assert.equal(context.storySceneKind, "outro");
  assert.equal(ROUSSEAU_POST_FIGHT_SCENES.length, 5);
  const topics = [/floresta.*Genebra.*sentimentos.*Romantismo.*1712–1778/, /pomar.*desigualdade social.*propriedade.*privilégios/, /correntes rompidas.*Contrato Social.*povo é soberano.*liberdade civil/, /fonte.*vontade geral.*bem comum.*comunidade/, /SuperIA.*três grandes contratualistas.*Hobbes, Locke e Rousseau.*Hegel.*história em movimento/];
  let bytes = 0;
  for (const [step, scene] of ROUSSEAU_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[context.storyIndex][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 9, sceneStep: step }),
      ROUSSEAU_POST_FIGHT_SCENES.slice(step, step + 2).map(({ image }) => image),
    );
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 9 }), [ROUSSEAU_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "versus", campaign: "doctor", phase: "story-recap", encounterIndex: 9 }), []);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storyIndex, 10);
  assert.equal(context.selectedOpponent, "hegel");
  assert.deepEqual(nextDoctorEncounter(9), { completed: false, pending: false, index: 10 });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("prepareStoryFight")(9);
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "rousseau", background: "/game/arena-rousseau.webp" }, "combat-engine"]);
});

test("retornar ao Discípulo restaura seus dados e seu progresso", () => {
  const { context, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  callback("startDiscipleCampaign")(false);
  assert.equal(context.storyCampaign, "disciple");
  assert.equal(context.storyIndex, 4);
  assert.equal(context.selectedOpponent, "descartes");
  assert.equal(context.phase, "story-scene");
});

test("artes de Doutor são leves, preservam a ordem e não baixam a pós-luta de Sócrates", async () => {
  assert.deepEqual(DOCTOR_OPPONENT_ORDER, ["homero", "tales", "diogenes", "hypatia", "averroes", "thomas", "machiavelli", "galileo", "hobbes", "rousseau", "hegel", "schopenhauer", "kierkegaard", "freud", "felipe-cyborg"]);
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-intro" }), DOCTOR_INTRO_SCENES.map(({ image }) => image));
  for (const phase of ["playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 0 }), [HOMERO_POST_FIGHT_SCENES[0].image]);
  }
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "doctor-checkpoint" }), []);
  for (const scene of DOCTOR_INTRO_SCENES) {
    assert.ok(scene.alt);
    assert.ok((await stat(new URL(`../public${scene.image}`, import.meta.url))).size < 600_000);
  }
  assert.ok((await stat(new URL(`../public${DOCTOR_ENCOUNTERS[0].background}`, import.meta.url))).size > 0);
});

test("as cinco artes de Homero seguem a aula e carregam somente o quadro atual e o próximo", async () => {
  assert.equal(HOMERO_POST_FIGHT_SCENES.length, 5);
  assert.deepEqual(DOCTOR_POST_FIGHT_SCENES, [HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES, DIOGENES_POST_FIGHT_SCENES, HYPATIA_POST_FIGHT_SCENES, AVERROES_POST_FIGHT_SCENES, THOMAS_POST_FIGHT_SCENES, MACHIAVELLI_POST_FIGHT_SCENES, GALILEO_POST_FIGHT_SCENES, HOBBES_POST_FIGHT_SCENES, ROUSSEAU_POST_FIGHT_SCENES, HEGEL_POST_FIGHT_SCENES, SCHOPENHAUER_POST_FIGHT_SCENES, KIERKEGAARD_POST_FIGHT_SCENES, FREUD_POST_FIGHT_SCENES]);
  assert.match(HOMERO_POST_FIGHT_SCENES[0].alt, /tradição oral/);
  assert.match(HOMERO_POST_FIGHT_SCENES[1].alt, /pensamento mítico/);
  assert.match(HOMERO_POST_FIGHT_SCENES[2].alt, /Aquiles/);
  assert.match(HOMERO_POST_FIGHT_SCENES[3].alt, /Odisseu/);
  assert.match(HOMERO_POST_FIGHT_SCENES[4].alt, /Tales de Mileto/);
  let bytes = 0;
  for (const [sceneStep, scene] of HOMERO_POST_FIGHT_SCENES.entries()) {
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    const urls = storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", sceneStep });
    assert.deepEqual(urls, HOMERO_POST_FIGHT_SCENES.slice(sceneStep, sceneStep + 2).map(({ image }) => image));
    assert.ok(urls.every((image) => image.includes("homero")));
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
});

test("a aula de Tales preserva a ordem e aquece somente a arte atual e a próxima", async () => {
  assert.equal(TALES_POST_FIGHT_SCENES.length, 5);
  const topics = [/Mileto/, /pergunta pela origem/, /água como arché/, /sombras.*eclipse solar/, /Diógenes/];
  let bytes = 0;
  for (const [sceneStep, scene] of TALES_POST_FIGHT_SCENES.entries()) {
    assert.match(scene.alt, topics[sceneStep]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(
      storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-recap", encounterIndex: 1, sceneStep }),
      TALES_POST_FIGHT_SCENES.slice(sceneStep, sceneStep + 2).map(({ image }) => image),
    );
  }
  assert.ok(bytes < 4 * 1024 * 1024, `artes usam ${bytes} bytes`);
});


test("vitória em Hegel exibe cinco artes completas, permite voltar e abre Schopenhauer", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 10;
  context.selectedOpponent = "hegel";
  await callback("prepareStoryFight")(10);
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "hegel", background: "/game/arena-hegel.webp" }, "combat-engine"]);
  calls.length = 0;
  callback("openStoryOutro")();
  assert.equal(HEGEL_POST_FIGHT_SCENES.length, 5);
  const topics = [/coruja no ombro.*1770–1831.*Berlim.*Minerva/, /semente, flor e fruto.*Tese, antítese e síntese.*Superar também é conservar/, /senhor e escravo.*trabalho.*consciência/, /Espírito do Tempo.*Jena, 1806.*Napoleão.*alma do mundo/, /SuperIA.*Schopenhauer.*vontade, o desejo e o sofrimento/];
  let bytes = 0;
  for (const [step, scene] of HEGEL_POST_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-recap");
    assert.equal(context.storySceneStep, step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[10][step].image, scene.image);
    assert.match(scene.alt, topics[step]);
    bytes += (await stat(new URL(`../public${scene.image}`, import.meta.url))).size;
    assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase:"story-recap",encounterIndex:10,sceneStep:step}),HEGEL_POST_FIGHT_SCENES.slice(step,step+2).map(({image})=>image));
    if (step === 2) {
      callback("previousStoryArt")();
      assert.equal(context.storySceneStep, 1);
      await callback("advanceStoryScene")();
      assert.equal(context.storySceneStep, 2);
    }
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes < 4*1024*1024);
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storyIndex, 11);
  assert.equal(context.selectedOpponent, "schopenhauer");
  assert.deepEqual(nextDoctorEncounter(10), {completed:false,pending:false,index:11});
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  assert.deepEqual(calls, []);
  assert.equal(battleTrack("story","felipe","hegel"),SOUNDTRACK.modern);
  for (const phase of ["playing", "won"]) assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase,encounterIndex:10}),[HEGEL_POST_FIGHT_SCENES[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"story-recap",encounterIndex:10}),[]);
});


test("vitória em Schopenhauer percorre cinco artes, permite voltar e indica Kierkegaard como próximo resgate", async () => {
  const {context,calls,entries,callback}=campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex=11;
  context.selectedOpponent="schopenhauer";
  context.storySceneKind="intro";
  context.storySceneStep=0;
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase,"playing");
  assert.deepEqual(calls,[{fighter:"felipe",opponent:"schopenhauer",background:"/game/arena-schopenhauer.webp"},"combat-engine"]);
  calls.length=0;
  callback("openStoryOutro")();
  assert.equal(SCHOPENHAUER_POST_FIGHT_SCENES.length,5);
  const topics=[/1788–1860.*beira do rio.*Danzig.*Frankfurt.*Nietzsche/,/padaria.*representação.*corpo.*fome.*impulso cego/,/celular.*pêndulo.*satisfação.*tédio/,/compaixão.*base da moral.*vantagem ou recompensa/,/SuperIA.*Kierkegaard.*duas portas.*angústia de escolher/];
  let bytes=0;
  for(const [step,scene] of SCHOPENHAUER_POST_FIGHT_SCENES.entries()){
    assert.equal(context.phase,"story-recap");assert.equal(context.storySceneStep,step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[11][step].image,scene.image);
    assert.match(scene.alt,topics[step]);
    bytes+=(await stat(new URL(`../public${scene.image}`,import.meta.url))).size;
    assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase:"story-recap",encounterIndex:11,sceneStep:step}),SCHOPENHAUER_POST_FIGHT_SCENES.slice(step,step+2).map(({image})=>image));
    if(step===2){callback("previousStoryArt")();assert.equal(context.storySceneStep,1);await callback("advanceStoryScene")();assert.equal(context.storySceneStep,2);}
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes<4*1024*1024);
  assert.equal(context.phase,"story-scene");assert.equal(context.storyIndex,12);
  assert.equal(context.selectedOpponent,"kierkegaard");
  assert.deepEqual(nextDoctorEncounter(11),{completed:false,pending:false,index:12});
  assert.equal(entries.get("philo-kombat:story:disciple"),"4");assert.deepEqual(calls,[]);
  for(const phase of ["playing","won"])assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase,encounterIndex:11}),[SCHOPENHAUER_POST_FIGHT_SCENES[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"story-recap",encounterIndex:11}),[]);
});


test("vitória em Kierkegaard exibe quatro cenas sem repetir as três portas e indica Freud como próximo resgate", async()=>{
  const {context,calls,entries,callback}=campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex=12;context.selectedOpponent="kierkegaard";context.storySceneKind="intro";context.storySceneStep=0;
  await callback("advanceStoryScene")();await callback("advanceStoryScene")();
  assert.equal(context.phase,"playing");
  assert.deepEqual(calls,[{fighter:"felipe",opponent:"kierkegaard",background:"/game/arena-copenhagen.webp"},"combat-engine"]);
  calls.length=0;callback("openStoryOutro")();
  assert.equal(KIERKEGAARD_POST_FIGHT_SCENES.length,4);
  const topics=[/encruzilhada.*angústia.*possibilidades da liberdade.*escolher.*consequências/,/três portas.*Estética.*Ética.*Religiosa.*transformação pessoal.*não acontece automaticamente/,/fé.*livro.*abismo.*relação com Deus.*garantias.*incerteza/,/próximo resgate: Freud.*SuperIA.*divã.*monitor.*inconsciente/];
  let bytes=0;
  for(const [step,scene] of KIERKEGAARD_POST_FIGHT_SCENES.entries()){
    assert.equal(context.phase,"story-recap");assert.equal(context.storySceneStep,step);
    assert.equal(DOCTOR_POST_FIGHT_SCENES[12][step].image,scene.image);assert.match(scene.alt,topics[step]);
    const image=await readFile(new URL(`../public${scene.image}`,import.meta.url));
    assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');
    bytes+=image.length;
    assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase:"story-recap",encounterIndex:12,sceneStep:step}),KIERKEGAARD_POST_FIGHT_SCENES.slice(step,step+2).map(({image})=>image));
    if(step===2){callback("previousStoryArt")();assert.equal(context.storySceneStep,1);await callback("advanceStoryScene")();assert.equal(context.storySceneStep,2);}
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes<3*1024*1024);
  assert.equal(context.phase,"story-scene");assert.equal(context.storyIndex,13);assert.equal(context.selectedOpponent,"freud");
  assert.deepEqual(nextDoctorEncounter(12),{completed:false,pending:false,index:13});
  assert.equal(entries.get("philo-kombat:story:disciple"),"4");assert.deepEqual(calls,[]);
  assert.equal(DOCTOR_ENCOUNTERS.length,15);
  for(const phase of ["playing","won"])assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase,encounterIndex:12}),[KIERKEGAARD_POST_FIGHT_SCENES[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"story-recap",encounterIndex:12}),[]);
});


test("Freud recebe seis artes completas após a vitória e termina no anúncio das quatro questões", async()=>{
  const {context,calls,entries,callback}=campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex=13;context.selectedOpponent="freud";context.storySceneKind="intro";context.storySceneStep=0;
  await callback("advanceStoryScene")();await callback("advanceStoryScene")();
  assert.equal(context.phase,"playing");assert.deepEqual(calls,[{fighter:"felipe",opponent:"freud",background:"/game/arena-freud.webp"},"combat-engine"]);
  calls.length=0;callback("openStoryOutro")();
  assert.equal(FREUD_POST_FIGHT_SCENES.length,6);
  const topics=[/Freud.*1856.*1939.*Viena.*psicanálise.*inconscientes/,/iceberg.*desejos.*conflitos.*Sonhos.*lapsos.*metáfora/,/id, ego e superego.*alteregos.*prazer.*regras.*realidade/,/sonhos.*surrealista.*relógio.*associações.*símbolo/,/Eros e Thanatos.*amor e ódio.*vínculos.*agressividade.*destruição.*coexistir/,/Superinteligência.*Sozinha.*SuperIA.*4 questões/];
  let bytes=0;
  for(const [step,scene]of FREUD_POST_FIGHT_SCENES.entries()){
    assert.equal(context.phase,"story-recap");assert.equal(context.storySceneStep,step);assert.equal(DOCTOR_POST_FIGHT_SCENES[13][step].image,scene.image);assert.match(scene.alt,topics[step]);
    const image=await readFile(new URL(`../public${scene.image}`,import.meta.url));assert.equal(image.toString('ascii',0,4),'RIFF');assert.equal(image.toString('ascii',8,12),'WEBP');bytes+=image.length;
    assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase:"story-recap",encounterIndex:13,sceneStep:step}),FREUD_POST_FIGHT_SCENES.slice(step,step+2).map(({image})=>image));
    if(step===3){callback("previousStoryArt")();assert.equal(context.storySceneStep,2);await callback("advanceStoryScene")();assert.equal(context.storySceneStep,3);}
    await callback("advanceStoryScene")();
  }
  assert.ok(bytes<4*1024*1024);assert.equal(context.phase,"story-quiz");assert.equal(context.storyIndex,13);
  assert.equal(context.storyQuiz.campaign,"doctor");assert.equal(context.storyQuiz.questions.length,4);
  assert.deepEqual(nextDoctorEncounter(13),{completed:false,pending:false,index:14});
  assert.equal(entries.get("philo-kombat:story:disciple"),"4");assert.deepEqual(calls,[]);
  for(const phase of ["playing","won"])assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase,encounterIndex:13}),[FREUD_POST_FIGHT_SCENES[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"story-recap",encounterIndex:13}),[]);
});

test("quatro acertos levam às quatro artes e à luta com o clone; erro não altera o Discípulo", async () => {
  const { context, entries, calls, callback } = campaignHarness();
  context.storyCampaign = "doctor"; context.storyIndex = 13;
  const before = [...entries];
  callback("openDoctorQuiz")();
  callback("answerQuiz")(1);
  assert.equal(context.storyQuiz.status, "failed");
  assert.equal(context.quizReturnIndex, null);
  assert.deepEqual([...entries], before);
  const failed = context.storyQuiz;
  callback("continueQuiz")();
  assert.notEqual(context.storyQuiz, failed);
  assert.equal(context.storyQuiz.status, "question");
  assert.equal(context.quizAnswerLocked.current, false);
  for (let index = 0; index < 4; index++) {
    assert.equal(context.phase, "story-quiz");
    assert.equal(context.storyQuiz.index, index);
    callback("answerQuiz")(0);
    assert.equal(context.storyQuiz.status, "correct");
    callback("answerQuiz")(1); // duplo clique não troca a resposta já registrada
    assert.equal(context.storyQuiz.status, "correct");
    callback("continueQuiz")();
  }
  assert.equal(context.phase, "story-intro");
  assert.equal(context.storyIndex, DOCTOR_FINAL_ENCOUNTER_INDEX);
  assert.equal(context.selectedOpponent, "felipe-cyborg");
  assert.equal(context.storyIntroIndex, 0);
  assert.equal(context.storyQuiz, null);
  assert.equal(context.quizPassed.current, true);
  assert.deepEqual([...entries], before);
  assert.equal(DOCTOR_FINAL_PRE_FIGHT_SCENES.length, 4);
  const topics = [/acertou as quatro.*leitura/, /recomenda.*livro.*QR Code/, /ameaça.*roubar o seu pensamento/, /nascimento das trevas.*metade.*robóticos.*ATIVADO/];
  let totalBytes = 0;
  for (const [index, scene] of DOCTOR_FINAL_PRE_FIGHT_SCENES.entries()) {
    assert.equal(context.phase, "story-intro");
    assert.equal(context.storyIntroIndex, index);
    assert.match(scene.alt, topics[index]);
    const image = await readFile(new URL(`../public${scene.image}`, import.meta.url));
    assert.equal(image.toString("ascii", 0, 4), "RIFF");
    assert.equal(image.toString("ascii", 8, 12), "WEBP");
    totalBytes += image.length;
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase: "story-intro", encounterIndex: 14, introIndex: index }), DOCTOR_FINAL_PRE_FIGHT_SCENES.slice(index,index+2).map(s => s.image));
    if (index === 2) {
      callback("previousStoryArt")();
      assert.equal(context.storyIntroIndex, 1);
      callback("nextStoryIntroScene")();
      assert.equal(context.storyIntroIndex, 2);
    }
    callback("nextStoryIntroScene")();
  }
  assert.ok(totalBytes < 2 * 1024 * 1024);
  assert.equal(context.phase, "story-scene");
  assert.deepEqual(calls, []); // nenhuma luta começa antes de terminar as artes e o diálogo
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.deepEqual(calls, [{fighter:"felipe",opponent:"felipe-cyborg",background:"/game/arena-felipe-dystopia-v1.webp"},"combat-engine"]);
  assert.equal(battleTrack("story", "felipe", "felipe-cyborg"), SOUNDTRACK.boss);
  calls.length = 0;
  await callback("prepareStoryFight")(14); // derrota permite repetir a luta sem novo quiz
  assert.equal(context.phase, "playing");
  assert.equal(context.quizPassed.current, true);
  callback("openStoryOutro")();
  assert.equal(context.phase, "doctor-complete");
  assert.deepEqual(nextDoctorEncounter(14), {completed:true,pending:false,index:14});
  assert.deepEqual([...entries], before);
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"story-intro",encounterIndex:14}), []);
});

test("a luta final do Doutor permanece bloqueada antes dos quatro acertos", async () => {
  const { context, calls, callback } = campaignHarness();
  context.storyCampaign = "doctor"; context.storyIndex = 14;
  await callback("prepareStoryFight")(14);
  assert.equal(context.phase, "story-quiz");
  assert.equal(context.storyQuiz.questions.length, 4);
  assert.deepEqual(calls, []);
});
