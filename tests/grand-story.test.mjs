import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { campaignHarness } from "./story-campaign-harness.mjs";
import { GRAND_ENCOUNTERS, GRAND_INTRO_SCENES, GRAND_POST_FIGHT_SCENES, GRAND_QUIZ_BANK, GRAND_FINAL_ENCOUNTER_INDEX, GRAND_STORAGE_KEY, GRAND_UNLOCK_KEY, GRAND_COMPLETE_KEY, readGrandProgress, readGrandUnlocked, unlockGrand, saveGrandProgress, completeGrand } from "../app/grand-story.mjs";
import { STORY_ENCOUNTERS, DOCTOR_ENCOUNTERS, storyImagePreloadUrls } from "../app/story-mode.mjs";
import { SOUNDTRACK, soundtrackForPhase } from "../app/soundtrack.mjs";

test("a sequência usa os 17 pensadores restantes e termina na SuperIA, com cenários existentes", async () => {
  assert.deepEqual(GRAND_ENCOUNTERS.map(e => e.opponent), ["amenemope", "sidarta", "confucius", "marcus", "smith", "olympe", "darwin", "wittgenstein", "arendt", "beauvoir", "paulo-freire", "fanon", "foucault", "deleuze", "angela-davis", "krenak", "turing", "superintelligence"]);
  const previous = new Set([...STORY_ENCOUNTERS, ...DOCTOR_ENCOUNTERS].map(e => e.opponent));
  for (const encounter of GRAND_ENCOUNTERS.slice(0, -1)) {
    assert.ok(!previous.has(encounter.opponent));
    assert.equal(encounter.outro.length, 3);
  }
  for (const e of [...GRAND_ENCOUNTERS, ...GRAND_INTRO_SCENES]) await access(new URL(`../public${e.background ?? e.image}`, import.meta.url));
  assert.equal(GRAND_QUIZ_BANK.length, 17);
  assert.deepEqual(GRAND_QUIZ_BANK.map(q => q.philosopher), GRAND_ENCOUNTERS.slice(0, -1).map(e => e.opponent));
});

test("Doutor libera Grande Filósofo; bloqueio impede entrar antes da conquista", () => {
  const locked = campaignHarness(false);
  locked.callback("startGrandCampaign")();
  assert.equal(locked.context.storyCampaign, "disciple");
  const { callback, context, entries } = campaignHarness();
  callback("completeDoctorCampaign")();
  assert.equal(context.grandUnlocked, true);
  assert.equal(entries.get(GRAND_UNLOCK_KEY), "1");
  callback("startGrandCampaign")();
  assert.equal(context.phase, "story-intro");
  assert.equal(context.selectedOpponent, "amenemope");
  assert.equal(context.selectedFighter, "felipe");
  callback("nextStoryIntroScene")();
  assert.equal(context.storyIntroIndex, 1);
  callback("previousStoryArt")();
  assert.equal(context.storyIntroIndex, 0);
  for (let i = 0; i < GRAND_INTRO_SCENES.length; i++) callback("nextStoryIntroScene")();
  assert.equal(context.phase, "story-scene");
});

test("Amenemope mostra cinco artes, permite voltar e só depois avança para Sidarta", async () => {
  const scenes = GRAND_POST_FIGHT_SCENES[0];
  assert.equal(scenes.length, 5);
  for (const scene of scenes) await access(new URL(`../public${scene.image}`, import.meta.url));
  const { callback, context, entries } = campaignHarness();
  callback("startGrandCampaign")();
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  callback("nextStoryRecapScene")();
  assert.equal(context.storySceneStep, 1);
  callback("previousStoryArt")();
  assert.equal(context.storySceneStep, 0);
  callback("previousStoryArt")();
  assert.equal(context.storySceneStep, 0);
  for (let step = 0; step < 4; step++) callback("nextStoryRecapScene")();
  assert.equal(context.storySceneStep, 4);
  assert.equal(context.storyIndex, 0);
  assert.notEqual(entries.get(GRAND_STORAGE_KEY), "1");
  callback("nextStoryRecapScene")();
  assert.equal(context.storyIndex, 1);
  assert.equal(context.selectedOpponent, "sidarta");
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storySceneKind, "intro");
  assert.equal(entries.get(GRAND_STORAGE_KEY), "1");
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"playing", campaign:"grand", encounterIndex:0}), [scenes[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"story-recap", campaign:"grand", encounterIndex:0, sceneStep:3}), scenes.slice(3).map(s => s.image));
});

test("pós-luta de Sidarta apresenta as cinco artes antes de Confúcio", async () => {
  const scenes = GRAND_POST_FIGHT_SCENES[1];
  assert.equal(scenes.length, 5);
  for (const scene of scenes) await access(new URL(`../public${scene.image}`, import.meta.url));
  const { callback, context, entries } = campaignHarness();
  context.grandSavedIndex = 1;
  callback("startGrandCampaign")("resume");
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  callback("nextStoryRecapScene")();
  callback("previousStoryArt")();
  assert.equal(context.storySceneStep, 0);
  for (let step = 0; step < 4; step++) callback("nextStoryRecapScene")();
  assert.equal(context.storySceneStep, 4);
  assert.equal(context.storyIndex, 1);
  assert.notEqual(entries.get(GRAND_STORAGE_KEY), "2");
  callback("nextStoryRecapScene")();
  assert.equal(context.storyIndex, 2);
  assert.equal(context.selectedOpponent, "confucius");
  assert.equal(context.phase, "story-scene");
  assert.equal(entries.get(GRAND_STORAGE_KEY), "2");
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"playing", campaign:"grand", encounterIndex:1}), [scenes[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"story-recap", campaign:"grand", encounterIndex:1, sceneStep:3}), scenes.slice(3).map(s => s.image));
});

test("pós-luta de Confúcio mostra as cinco artes antes de Marco Aurélio", async () => {
  const scenes = GRAND_POST_FIGHT_SCENES[2];
  assert.equal(scenes.length, 5);
  for (const scene of scenes) await access(new URL(`../public${scene.image}`, import.meta.url));
  const { callback, context, entries } = campaignHarness();
  context.grandSavedIndex = 2;
  callback("startGrandCampaign")("resume");
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  callback("nextStoryRecapScene")();
  callback("previousStoryArt")();
  assert.equal(context.storySceneStep, 0);
  for (let step = 0; step < 4; step++) callback("nextStoryRecapScene")();
  assert.equal(context.storySceneStep, 4);
  assert.equal(context.storyIndex, 2);
  assert.notEqual(entries.get(GRAND_STORAGE_KEY), "3");
  callback("nextStoryRecapScene")();
  assert.equal(context.storyIndex, 3);
  assert.equal(context.selectedOpponent, "marcus");
  assert.equal(context.phase, "story-scene");
  assert.equal(entries.get(GRAND_STORAGE_KEY), "3");
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"playing", campaign:"grand", encounterIndex:2}), [scenes[0].image]);
  assert.deepEqual(storyImagePreloadUrls({mode:"story", phase:"story-recap", campaign:"grand", encounterIndex:2, sceneStep:3}), scenes.slice(3).map(s => s.image));
});

test("as cinco artes de Simone permitem voltar e terminam no encontro com Paulo Freire", async () => {
  const scenes = GRAND_POST_FIGHT_SCENES[9];
  assert.equal(scenes.length, 5);
  for (const scene of scenes) await access(new URL(`../public${scene.image}`, import.meta.url));
  const { callback, context, entries } = campaignHarness();
  context.grandSavedIndex = 9;
  callback("startGrandCampaign")("resume");
  assert.equal(context.selectedOpponent, "beauvoir");
  callback("openStoryOutro")();
  assert.equal(context.phase, "story-recap");
  callback("nextStoryRecapScene")();
  callback("previousStoryArt")();
  assert.equal(context.storySceneStep, 0);
  for (let step = 0; step < scenes.length; step++) {
    assert.equal(context.storySceneStep, step);
    assert.equal(context.storyIndex, 9);
    callback("nextStoryRecapScene")();
  }
  assert.equal(context.selectedOpponent, "paulo-freire");
  assert.equal(entries.get(GRAND_STORAGE_KEY), "10");
});

test("a ordem nova recupera a etapa das partidas salvas na ordem anterior", () => {
  const legacyKey = "philo-kombat:story:grand";
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  const savedStages = [[9, "beauvoir"], [10, "paulo-freire"], [11, "paulo-freire"], [12, "fanon"], [16, "krenak"], [17, "superintelligence"]];
  for (const [index, opponent] of savedStages) {
    entries.set(legacyKey, String(index));
    assert.equal(GRAND_ENCOUNTERS[readGrandProgress(storage)].opponent, opponent);
  }
  saveGrandProgress(storage, 16);
  assert.equal(GRAND_ENCOUNTERS[readGrandProgress(storage)].opponent, "turing");
  completeGrand(storage);
  assert.equal(readGrandProgress(storage), 0);
});

test("a campanha inteira usa o motor existente e só libera a luta final após cinco acertos", async () => {
  const { callback, context, entries, calls } = campaignHarness();
  callback("startGrandCampaign")();
  for (let i = 0; i < GRAND_INTRO_SCENES.length; i++) callback("nextStoryIntroScene")();
  for (let i = 0; i < GRAND_FINAL_ENCOUNTER_INDEX; i++) {
    assert.equal(context.storyIndex, i);
    await callback("advanceStoryScene")();
    await callback("advanceStoryScene")();
    assert.equal(context.phase, "playing");
    assert.deepEqual(calls.slice(-2), [{ fighter: "felipe", opponent: GRAND_ENCOUNTERS[i].opponent, background: GRAND_ENCOUNTERS[i].background }, "combat-engine"]);
    callback("openStoryOutro")();
    const recap = GRAND_POST_FIGHT_SCENES[i];
    assert.equal(context.phase, recap ? "story-recap" : "story-scene");
    assert.equal(context.storySceneKind, "outro");
    for (let beat = 0; beat < (recap?.length ?? 3); beat++) await callback("advanceStoryScene")();
    assert.equal(entries.get(GRAND_STORAGE_KEY), String(i + 1));
    assert.equal(entries.get("philo-kombat:story:disciple"), "4");
  }
  assert.equal(context.phase, "story-quiz");
  assert.equal(context.storyQuiz.questions.length, 5);
  const before = [...entries];
  callback("answerQuiz")(1);
  assert.equal(context.storyQuiz.status, "failed");
  assert.deepEqual([...entries], before);
  callback("continueQuiz")();
  assert.equal(context.storyQuiz.status, "question");
  assert.equal(context.quizAnswerLocked.current, false);
  for (let i = 0; i < 5; i++) {
    callback("answerQuiz")(0);
    callback("answerQuiz")(1);
    assert.equal(context.storyQuiz.status, "correct");
    callback("continueQuiz")();
  }
  assert.equal(context.phase, "story-scene");
  assert.equal(context.storyIndex, 17);
  assert.equal(context.quizPassed.current, true);
  await callback("advanceStoryScene")();
  await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.equal(context.selectedOpponent, "superintelligence");
  const finalAssets = {
    fighter: "felipe", opponent: "superintelligence",
    background: "/game/arena-grand-final-servers.webp",
    opponentArt: "/game/superia-grand-final-colossus.webp",
  };
  assert.deepEqual(calls.slice(-2), [finalAssets, "combat-engine"]);
  await access(new URL(`../public${finalAssets.opponentArt}`, import.meta.url));
  assert.equal(STORY_ENCOUNTERS.at(-1).background, "/game/arena-supercomputer.webp");
  await callback("prepareStoryFight")(17); // Uma derrota não exige repetir um teste já vencido nesta sessão.
  assert.equal(context.phase, "playing");
  callback("openStoryOutro")();
  assert.equal(context.phase, "grand-epilogue");
  assert.equal(entries.get(GRAND_COMPLETE_KEY), "1");
  callback("showGrandCredits")();
  assert.equal(context.phase, "grand-complete");
  assert.equal(entries.has(GRAND_STORAGE_KEY), false);
  assert.equal(entries.get("philo-kombat:story:disciple"), "4");
});

test("entrar pelo final de Doutor começa em Amenemope mesmo com Hannah Arendt salva", async () => {
  const { callback, context, entries, calls } = campaignHarness(false);
  const savedIndex = GRAND_ENCOUNTERS.findIndex(({ opponent }) => opponent === "arendt");
  context.grandSavedIndex = savedIndex;
  saveGrandProgress(context.window.localStorage, savedIndex);
  callback("completeDoctorCampaign")();
  callback("startGrandCampaign")();
  assert.equal(context.storyIndex, 0);
  assert.equal(context.selectedOpponent, "amenemope");
  assert.equal(context.phase, "story-intro");
  assert.equal(readGrandProgress(context.window.localStorage), 0);
  assert.equal(entries.get(GRAND_UNLOCK_KEY), "1");
  for (const _ of GRAND_INTRO_SCENES) callback("nextStoryIntroScene")();
  for (const _ of GRAND_ENCOUNTERS[0].intro) await callback("advanceStoryScene")();
  assert.equal(context.phase, "playing");
  assert.equal(calls.at(-2).opponent, "amenemope");
});

test("retomar restaura o capítulo e exige novo quiz no chefe", async () => {
  const { callback, context } = campaignHarness();
  context.grandSavedIndex = GRAND_ENCOUNTERS.findIndex(({ opponent }) => opponent === "arendt");
  callback("startGrandCampaign")("resume");
  assert.equal(context.storyIndex, 8);
  assert.equal(context.selectedOpponent, "arendt");
  assert.equal(context.phase, "story-scene");
  context.grandSavedIndex = 17;
  callback("startGrandCampaign")("resume");
  assert.equal(context.phase, "story-quiz");
  context.quizPassed.current = false;
  await callback("prepareStoryFight")(17);
  assert.equal(context.phase, "story-quiz");
});

test("armazenamento inválido ou indisponível não quebra progresso nem desbloqueio em memória", () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) ?? null, setItem: (k, v) => entries.set(k, v), removeItem: k => entries.delete(k) };
  for (const value of ["NaN", "18", "-1", "2.5", "{}", "Infinity"]) {
    entries.set(GRAND_STORAGE_KEY, value);
    assert.equal(readGrandProgress(storage), 0);
  }
  saveGrandProgress(storage, 12);
  assert.equal(readGrandProgress(storage), 12);
  assert.equal(unlockGrand(storage), true);
  assert.equal(readGrandUnlocked(storage), true);
  completeGrand(storage);
  assert.equal(readGrandProgress(storage), 0);
  const blocked = { getItem() { throw Error("blocked"); }, setItem() { throw Error("blocked"); }, removeItem() { throw Error("blocked"); } };
  assert.equal(readGrandProgress(blocked), 0);
  assert.equal(unlockGrand(blocked), true);
  assert.doesNotThrow(() => saveGrandProgress(blocked, 3));
  assert.doesNotThrow(() => completeGrand(blocked));
});

test("abertura preserva a ameaça e a conclusão toca aplausos sem antecipar outras campanhas", () => {
  assert.equal(soundtrackForPhase("story-intro", "story", "felipe", "amenemope", "intro", "waiting", "grand"), SOUNDTRACK.boss);
  assert.equal(soundtrackForPhase("grand-complete", "story", "felipe", "superintelligence"), SOUNDTRACK.applause);
  assert.equal(soundtrackForPhase("story-intro", "story", "felipe", "homero", "intro", "waiting", "doctor"), SOUNDTRACK.preFight);
  assert.deepEqual(storyImagePreloadUrls({mode:"story",phase:"story-intro",campaign:"grand"}), GRAND_INTRO_SCENES.slice(0, 2).map(s => s.image));
  assert.deepEqual(storyImagePreloadUrls({mode:"story",phase:"playing",campaign:"grand",encounterIndex:9}), [GRAND_POST_FIGHT_SCENES[9][0].image]);
});
