import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import {
  DOCTOR_ENCOUNTERS, DOCTOR_INTRO_SCENES, DOCTOR_OPPONENT_ORDER,
  DOCTOR_POST_FIGHT_SCENES, HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES,
  STORY_ENCOUNTERS, STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES,
  nextDoctorEncounter, storyImagePreloadUrls,
} from "../app/story-mode.mjs";
import { SOUNDTRACK, battleTrack } from "../app/soundtrack.mjs";

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
    FINAL_ENCOUNTER_INDEX: 9,
    storyIntroLocked: { current: false }, storyRecapLocked: { current: false },
    quizPassed: { current: false },
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
    context.activeIntroScenes = context.storyCampaign === "doctor" ? DOCTOR_INTRO_SCENES : STORY_INTRO_SCENES;
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

test("Diógenes tem diálogo de vitória e repetição; o próximo encontro aguarda Hipátia", async () => {
  const { context, calls, entries, callback } = campaignHarness();
  callback("startDoctorCampaign")();
  context.storyIndex = 2;
  context.selectedOpponent = "diogenes";
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "outro");
  assert.equal(context.activeStoryEncounters[2].outro[0].speaker, "DIÓGENES");
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "doctor-checkpoint");
  assert.deepEqual(nextDoctorEncounter(2), { completed: false, pending: true, index: 2, nextOpponent: "hypatia" });
  assert.deepEqual(calls, []);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  await callback("prepareStoryFight")(2);
  assert.deepEqual(calls, [{ fighter: "felipe", opponent: "diogenes", background: "/game/arena-diogenes.webp" }, "combat-engine"]);
  assert.match(page, /onClick=\{\(\) => prepareStoryFight\(storyIndex\)\}/);
  for (const phase of ["playing", "won", "story-recap"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", campaign: "doctor", phase, encounterIndex: 2 }), []);
  }
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
  assert.deepEqual(DOCTOR_OPPONENT_ORDER, ["homero", "tales", "diogenes", "hypatia", "averroes", "thomas", "machiavelli", "galileo", "hobbes", "rousseau", "hegel", "schopenhauer", "kierkegaard", "freud", "superintelligence"]);
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
  assert.deepEqual(DOCTOR_POST_FIGHT_SCENES, [HOMERO_POST_FIGHT_SCENES, TALES_POST_FIGHT_SCENES]);
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
