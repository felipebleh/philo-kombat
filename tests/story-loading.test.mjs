import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import vm from "node:vm";
import test from "node:test";
import ts from "typescript";
import { STORY_INTRO_SCENES, STORY_POST_FIGHT_SCENES, STORY_ENCOUNTERS, storyImagePreloadUrls } from "../app/story-mode.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const handlerStart = page.indexOf("const onKeyDown = (event: KeyboardEvent) => {");
assert.ok(handlerStart > 0);
const handlerEnd = page.indexOf('window.addEventListener("keydown", onKeyDown)', handlerStart);
const handler = ts.transpileModule(page.slice(handlerStart, handlerEnd) + "onKeyDown;", {}).outputText;

function pressKey(phase, key, repeat = false) {
  const calls = [];
  const context = {
    phase,
    selectionStep: "player",
    nextStoryIntroScene: () => calls.push("intro"),
    nextStoryRecapScene: () => calls.push("recap"),
    openModeMenu: () => calls.push("menu"),
    movePlayer: (direction) => calls.push(["move", direction]),
  };
  vm.runInNewContext(handler, context)({ key, repeat, preventDefault: () => calls.push("prevent") });
  return calls;
}

test("A, Espaço e Enter avançam a arte sem executar movimento de combate", () => {
  for (const key of ["a", "A", " ", "Enter"]) {
    assert.deepEqual(pressKey("story-intro", key), ["prevent", "intro"]);
    assert.deepEqual(pressKey("story-recap", key), ["prevent", "recap"]);
  }
});

test("A continua sendo recuar no combate e repetição não pula várias cenas", () => {
  assert.deepEqual(pressKey("playing", "a"), ["prevent", ["move", -1]]);
  assert.deepEqual(pressKey("story-intro", "a", true), []);
  assert.deepEqual(pressKey("story-recap", "a", true), []);
  assert.deepEqual(pressKey("story-quiz", "a"), []);
});

test("Versus e menus não iniciam downloads das artes narrativas", () => {
  for (const phase of ["intro", "mode-select", "select", "loading", "dialogue", "playing", "won"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "versus", phase }), []);
  }
  for (const phase of ["intro", "mode-select", "story-tier-select", "loading", "story-quiz"]) {
    assert.deepEqual(storyImagePreloadUrls({ mode: "story", phase }), []);
  }
});

test("cada cena aquece somente a imagem atual e a próxima, sem outro capítulo", () => {
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", phase: "story-intro", introIndex: 3 }),
    STORY_INTRO_SCENES.slice(3, 5).map(({ image }) => image));
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", phase: "story-intro", introIndex: 7 }),
    [STORY_INTRO_SCENES[7].image]);
  for (let encounterIndex = 0; encounterIndex < STORY_POST_FIGHT_SCENES.length; encounterIndex++) {
    const scenes = STORY_POST_FIGHT_SCENES[encounterIndex] ?? [];
    for (let sceneStep = 0; sceneStep < scenes.length; sceneStep++) {
      const urls = storyImagePreloadUrls({ mode: "story", phase: "story-recap", encounterIndex, sceneStep });
      assert.deepEqual(urls, scenes.slice(sceneStep, sceneStep + 2).map(({ image }) => image));
      assert.ok(urls.length <= 2);
    }
  }
});

test("luta prepara apenas sua primeira pós-luta e o chefe prepara a comemoração", () => {
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", phase: "playing", encounterIndex: 0 }),
    [STORY_POST_FIGHT_SCENES[0][0].image]);
  assert.deepEqual(storyImagePreloadUrls({ mode: "story", phase: "playing", encounterIndex: STORY_ENCOUNTERS.length - 1 }),
    ["/game/story-ending-philosophers-v1.webp", "/game/story-ending-felipe-toss-v1.webp"]);
});

test("abertura e Sócrates mantêm todas as artes num orçamento abaixo de 6 MB", async () => {
  let bytes = 0;
  const scenes = [...STORY_INTRO_SCENES, ...STORY_POST_FIGHT_SCENES[0]];
  assert.equal(scenes.length, 12);
  for (const { image } of scenes) {
    assert.ok(image.endsWith(".webp"));
    const file = await stat(new URL(`../public${image}`, import.meta.url));
    assert.ok(file.size < 600_000, image);
    bytes += file.size;
  }
  assert.ok(bytes < 6_000_000, `artes usam ${bytes} bytes`);
});
