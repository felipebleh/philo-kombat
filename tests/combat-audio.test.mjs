import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile, stat } from "node:fs/promises";
import { CombatAudio, COMBAT_SOUNDS, MOVE_SOUNDS, defeatSound } from "../app/combat-audio.mjs";
import { soundtrackForPhase, SOUNDTRACK } from "../app/soundtrack.mjs";

class Node {
  gain = { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} };
  frequency = { setValueAtTime() {} };
  connect() {}
  disconnect() {}
  start() { this.started = true; }
  stop() { this.stopped = true; this.onended?.(); }
}
class Context {
  state = "running";
  currentTime = 0;
  destination = {};
  sources = [];
  createGain() { return new Node(); }
  createBufferSource() { const node = new Node(); this.sources.push(node); return node; }
  createOscillator() { return new Node(); }
  decodeAudioData(bytes) { return Promise.resolve({ bytes }); }
  resume() { return Promise.resolve(); }
  close() { return Promise.resolve(); }
}
const readyAudio = async () => {
  const context = new Context();
  const audio = new CombatAudio(() => context, () => Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) }));
  audio.unlock();
  await Promise.all(Object.keys(COMBAT_SOUNDS).map(name => audio.load(name)));
  return { audio, context };
};

test("cinco golpes distintos e oito amostras de efeitos leves existem", async () => {
  assert.equal(Object.keys(COMBAT_SOUNDS).length, 8);
  assert.equal(new Set(Object.values(MOVE_SOUNDS)).size, 5);
  for (const path of Object.values(COMBAT_SOUNDS)) {
    await access(new URL(`../public${path}`, import.meta.url));
    assert.ok((await stat(new URL(`../public${path}`, import.meta.url))).size < 40000);
  }
});

test("derrota respeita todas as lutadoras, lutadores e a Superinteligência", () => {
  for (const fighter of ["hypatia", "olympe", "beauvoir", "arendt", "angela-davis"]) assert.equal(defeatSound(fighter), "defeatFemale");
  for (const fighter of ["felipe", "socrates", "plato", "marx", "kant", "nietzsche"]) assert.equal(defeatSound(fighter), "defeatMale");
  assert.equal(defeatSound("superintelligence"), "defeatComputer");
});

test("aplausos aguardam as artes, param no escurecimento e cedem lugar à trilha sombria", () => {
  const choose = stage => soundtrackForPhase("story-complete", "story", "felipe", "superintelligence", "intro", stage);
  assert.equal(choose("waiting"), null);
  assert.equal(choose("celebration"), SOUNDTRACK.applause);
  assert.equal(SOUNDTRACK.applause.loop, true);
  assert.equal(choose("blackout"), null);
  assert.equal(choose("threat"), SOUNDTRACK.boss);
});

test("efeitos sobrepõem música mas usam um só contexto e respeitam volume e silêncio", async () => {
  const { audio, context } = await readyAudio();
  audio.play("punch");
  audio.play("kick");
  assert.equal(context.sources.length, 2);
  audio.settings(.3, true);
  assert.equal(audio.master.gain.value, .3);
  audio.settings(.3, false);
  assert.ok(context.sources.every(node => node.stopped));
  audio.play("combo");
  assert.equal(context.sources.length, 2);
  audio.settings(0, true);
  audio.play("special2");
  assert.equal(context.sources.length, 2);
  audio.destroy();
});

test("troca de tela cancela os efeitos e a concorrência tem limite", async () => {
  const { audio, context } = await readyAudio();
  for (let i=0; i<12; i++) audio.play("punch");
  assert.equal(audio.active.size, 8);
  audio.stopAll();
  assert.equal(audio.active.size, 0);
  assert.ok(context.sources.every(node => node.stopped));
  audio.visibility(true);
  audio.play("kick");
  assert.equal(context.sources.length, 12);
  audio.destroy();
});

test("um decode pendente não toca depois de sair da tela", async () => {
  let resolve;
  const context = new Context();
  const request = new Promise(done => { resolve=done; });
  const audio = new CombatAudio(() => context, () => request);
  audio.play("defeatFemale");
  audio.stopAll();
  resolve({ ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) });
  await audio.load("defeatFemale");
  await Promise.resolve();
  assert.equal(context.sources.length, 0);
  audio.destroy();
});

test("ausência de suporte e falha de download não interrompem o jogo", async () => {
  const unsupported = new CombatAudio(() => null);
  assert.doesNotThrow(() => unsupported.play("punch"));
  const audio = new CombatAudio(() => new Context(), () => Promise.reject(new Error("offline")));
  audio.play("kick");
  assert.equal(await audio.load("kick"), null);
  audio.destroy();
});

test("ambos os lados disparam som apenas depois da verificação de contato; KO é protegido contra repetição", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const player = page.slice(page.indexOf("const performMove"), page.indexOf("const movePlayer"));
  assert.ok(player.indexOf("if (!landed)") < player.indexOf("effectsAudio.current?.play(MOVE_SOUNDS[moveName]"));
  const cpu = page.slice(page.indexOf("const currentDistance ="), page.indexOf("const opponentFighter = selectedOpponent;", page.indexOf("const currentDistance =")));
  assert.ok(cpu.indexOf("currentDistance > move.range") < cpu.indexOf("effectsAudio.current?.play(MOVE_SOUNDS[moveName]"));
  const finish = page.slice(page.indexOf("const finishByCoherence"), page.indexOf("const performMove"));
  assert.equal((finish.match(/play\(defeatSound/g) ?? []).length, 2);
  assert.ok(finish.indexOf("if (roundResolved.current) return") < finish.indexOf("play(defeatSound"));
});
