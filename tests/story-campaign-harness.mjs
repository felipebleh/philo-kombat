import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";
import { STORY_ENCOUNTERS, STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES, DOCTOR_ENCOUNTERS, DOCTOR_INTRO_SCENES, DOCTOR_POST_FIGHT_SCENES, DOCTOR_FINAL_ENCOUNTER_INDEX, doctorIntroScenes, nextDoctorEncounter } from "../app/story-mode.mjs";
import { GRAND_ENCOUNTERS, GRAND_INTRO_SCENES, GRAND_POST_FIGHT_SCENES, GRAND_FINAL_ENCOUNTER_INDEX, nextGrandEncounter, saveGrandProgress, completeGrand, unlockGrand } from "../app/grand-story.mjs";
import { createStoryQuiz, answerStoryQuiz, advanceStoryQuiz, quizRecoveryIndex } from "../app/story-quiz.mjs";
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
// Run the real campaign callbacks with their state and I/O dependencies supplied.
export function campaignHarness(unlocked = true) {
  const calls = [];
  const entries = new Map([["philo-kombat:story:disciple", "4"]]);
  const state = {
    doctorUnlocked: unlocked, grandUnlocked: unlocked, grandSavedIndex: 0, storyCampaign: "disciple", storyIndex: 0,
    storySceneKind: "intro", storySceneStep: 0, storyIntroIndex: 0,
    storySavedIndex: 4, quizReturnIndex: null,
  };
  const context = {
    ...state, GRAND_FINAL_SPRITE: "/game/superia-grand-final-colossus.webp", GRAND_ENCOUNTERS, GRAND_INTRO_SCENES, GRAND_FINAL_ENCOUNTER_INDEX, nextGrandEncounter, saveGrandProgress, completeGrand, unlockGrand,
    STORY_ENCOUNTERS, STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES,
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
    preloadFightAssets: async (fighter, opponent, progress, background, opponentArt) => {
      calls.push({ fighter, opponent, background, ...(opponentArt ? { opponentArt } : {}) }); progress(100);
    },
    resetGame: () => { calls.push("combat-engine"); context.phase = "playing"; },
  };
  for (const setter of [...page.matchAll(/\b(set\w+)\(/g)].map((match) => match[1])) {
    const key = setter.slice(3, 4).toLowerCase() + setter.slice(4);
    context[setter] = (value) => { context[key] = typeof value === "function" ? value(context[key]) : value; };
  }
  function callback(name) {
    context.activeStoryEncounters = context.storyCampaign === "grand" ? GRAND_ENCOUNTERS : context.storyCampaign === "doctor" ? DOCTOR_ENCOUNTERS : STORY_ENCOUNTERS;
    context.activeIntroScenes = context.storyCampaign === "grand" ? GRAND_INTRO_SCENES : context.storyCampaign === "doctor" ? doctorIntroScenes(context.storyIndex) : STORY_INTRO_SCENES;
    context.activeRecapScenes = context.storyCampaign === "grand" ? GRAND_POST_FIGHT_SCENES : context.storyCampaign === "doctor" ? DOCTOR_POST_FIGHT_SCENES : STORY_POST_FIGHT_SCENES;
    const start = page.indexOf(`  const ${name} = useCallback(`);
    assert.ok(start >= 0, name);
    const end = page.indexOf("\n  const ", start + 1);
    const code = ts.transpileModule(`(() => {\n${page.slice(start, end)}\nreturn ${name};\n})();`, {
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).outputText;
    return vm.runInNewContext(code, context);
  }
  context.prepareStoryFight = (index) => callback("prepareStoryFight")(index);
  context.advanceStoryScene = () => callback("advanceStoryScene")();
  context.openGrandQuiz = () => callback("openGrandQuiz")();
  context.openGrandEpilogue = () => callback("openGrandEpilogue")();
  context.openDoctorQuiz = () => callback("openDoctorQuiz")();
  context.completeDoctorCampaign = () => callback("completeDoctorCampaign")();
  return { context, calls, entries, callback };
}

