import assert from "node:assert/strict";
import test from "node:test";
import { access } from "node:fs/promises";
import { SOUNDTRACK, soundtrackForPhase, readAudioSettings, SoundtrackPlayer } from "../app/soundtrack.mjs";
import { STORY_ENCOUNTERS } from "../app/story-mode.mjs";

class FakeAudio {
  paused = true;
  currentTime = 0;
  src = "";
  loop = false;
  events = new Map();
  plays = [];
  addEventListener(event, listener) { this.events.set(event, listener); }
  removeEventListener(event) { this.events.delete(event); }
  removeAttribute() { this.src = ""; }
  load() {}
  pause() { this.paused = true; }
  play() { this.paused = false; this.plays.push(this.src); return Promise.resolve(); }
}

test("as dez faixas estão presentes; a vinheta arcade enviada não repete", async () => {
  assert.equal(Object.values(SOUNDTRACK).length, 10);
  assert.equal(SOUNDTRACK.result.src, "/audio/vitoria_arcade.mp3");
  for (const [name, track] of Object.entries(SOUNDTRACK)) {
    await access(new URL(`../public${track.src}`, import.meta.url));
    assert.equal(track.loop, name !== "result");
  }
});

test("os dez encontros usam as eras indicadas e o chefe usa sua própria faixa", () => {
  const expected = ["ancient", "ancient", "ancient", "medieval", "modern", "modern", "modern", "contemporary", "contemporary", "boss"];
  STORY_ENCOUNTERS.forEach(({ opponent }, i) => {
    assert.equal(soundtrackForPhase("playing", "story", "felipe", opponent), SOUNDTRACK[expected[i]]);
  });
  assert.equal(soundtrackForPhase("playing", "versus", "plato", "nietzsche"), SOUNDTRACK.ancient);
  assert.equal(soundtrackForPhase("playing", "versus", "agostinho", "kant"), SOUNDTRACK.medieval);
  assert.equal(soundtrackForPhase("playing", "versus", "kant", "plato"), SOUNDTRACK.modern);
  assert.equal(soundtrackForPhase("playing", "versus", "marx", "plato"), SOUNDTRACK.contemporary);
  assert.equal(soundtrackForPhase("playing", "versus", "plato", "superintelligence"), SOUNDTRACK.boss);
});

test("a vinheta corresponde ao vencedor com frase, não ao KO nem ao intervalo de rounds", () => {
  const choose = (phase, kind) => soundtrackForPhase(phase, "story", "felipe", "socrates", kind);
  for (const phase of ["intro", "mode-select", "story-tier-select"]) assert.equal(choose(phase), SOUNDTRACK.title);
  assert.equal(choose("select"), SOUNDTRACK.selection);
  assert.equal(choose("story-intro"), SOUNDTRACK.preFight);
  assert.equal(choose("story-scene", "intro"), SOUNDTRACK.preFight);
  assert.equal(choose("finishing"), SOUNDTRACK.ancient);
  for (const phase of ["won", "lost"]) assert.equal(choose(phase), SOUNDTRACK.result);
  for (const phase of ["loading", "dialogue", "round-won", "round-lost", "draw", "story-recap", "story-quiz", "story-complete"]) assert.equal(choose(phase), null);
  assert.equal(choose("story-scene", "outro"), null);
});

test("um reprodutor troca imediatamente de faixa e não reinicia por rerender ou volume", () => {
  const audio = new FakeAudio();
  const player = new SoundtrackPlayer(audio);
  player.select(SOUNDTRACK.title, "intro");
  assert.equal(audio.plays.length, 0);
  player.unlock();
  audio.currentTime = 4;
  player.select(SOUNDTRACK.title, "intro");
  player.settings(.2, false);
  assert.equal(audio.currentTime, 4);
  assert.equal(audio.muted, true);
  assert.equal(audio.volume, .2);
  player.select(SOUNDTRACK.selection, "select");
  assert.equal(audio.currentTime, 0);
  assert.equal(audio.src, SOUNDTRACK.selection.src);
  assert.equal(audio.plays.length, 2);
  player.select(null, "loading");
  assert.equal(audio.paused, true);
  assert.equal(audio.src, "");
});

test("a vinheta termina uma vez; gestos, mute e retorno à aba não a repetem", () => {
  const audio = new FakeAudio();
  const player = new SoundtrackPlayer(audio);
  player.unlock();
  player.select(SOUNDTRACK.result, "won");
  audio.paused = true;
  audio.events.get("ended")();
  player.settings(.7, false);
  player.settings(.7, true);
  player.unlock();
  player.visibility(true);
  player.visibility(false);
  player.select(SOUNDTRACK.result, "won");
  assert.equal(audio.plays.length, 1);
  player.select(SOUNDTRACK.ancient, "playing");
  player.select(SOUNDTRACK.result, "won");
  assert.equal(audio.plays.length, 3);
});

test("play rejeitado em uma troca rápida não agenda o áudio anterior", async () => {
  const audio = new FakeAudio();
  let reject;
  audio.play = () => new Promise((_, fail) => { reject = fail; });
  const player = new SoundtrackPlayer(audio);
  player.unlock();
  player.select(SOUNDTRACK.preFight, "story-scene");
  const rejectOldPlay = reject;
  player.select(SOUNDTRACK.boss, "playing");
  rejectOldPlay(new Error("AbortError"));
  await Promise.resolve();
  assert.equal(audio.src, SOUNDTRACK.boss.src);
  player.destroy();
  assert.equal(audio.paused, true);
  assert.equal(audio.src, "");
});

test("preferências sobrevivem a armazenamento bloqueado ou inválido", () => {
  assert.deepEqual(readAudioSettings({ getItem() { throw new Error("blocked"); } }), { volume: .55, soundOn: true });
  assert.deepEqual(readAudioSettings({ getItem: () => '{"volume":0.3,"soundOn":false}' }), { volume: .3, soundOn: false });
  assert.equal(readAudioSettings({ getItem: () => '{"volume":200}' }).volume, 1);
});
