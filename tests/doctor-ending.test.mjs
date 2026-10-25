import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import { DOCTOR_ENDING_LINE, DOCTOR_ENDING_ASSETS, DOCTOR_ENDING_TIMING, doctorEndingFrame, endingViewport } from "../app/doctor-ending.mjs";
import { DOCTOR_FINAL_ENCOUNTER_INDEX, storyImagePreloadUrls } from "../app/story-mode.mjs";
import { SOUNDTRACK, soundtrackForPhase } from "../app/soundtrack.mjs";

test("caminhada troca os quatro quadros reais e termina com os pés apoiados", () => {
  assert.equal(new Set([0,300,600,900].map(t => doctorEndingFrame(t).step)).size, 4);
  assert.equal(doctorEndingFrame(0).feetY, 625);
  const stopped = doctorEndingFrame(DOCTOR_ENDING_TIMING.walk);
  assert.equal(stopped.stage, "honour");
  assert.equal(stopped.feetY, 917);
  assert.equal(stopped.height, 670);
  assert.equal(stopped.bob, 0);
  for (let t=0;t<16000;t+=137) {
    const f=doctorEndingFrame(t);
    assert.ok(f.feetY-f.height>=0);
    assert.ok(f.feetY<941);
  }
});

test("raio só depois da homenagem, seguido da fala exata e SuperIA gigante", () => {
  const storm=DOCTOR_ENDING_TIMING.walk+DOCTOR_ENDING_TIMING.honour;
  assert.equal(doctorEndingFrame(storm-1).stage,"honour");
  assert.equal(doctorEndingFrame(storm).stage,"lightning");
  assert.equal(doctorEndingFrame(storm+DOCTOR_ENDING_TIMING.lightning).stage,"threat");
  assert.equal(doctorEndingFrame(storm+DOCTOR_ENDING_TIMING.lightning+1000).threatAge,1000);
  assert.equal(doctorEndingFrame(storm+2000).flash,0);
  assert.equal(DOCTOR_ENDING_LINE,"Não acabou! Você precisa de muito para se tornar um GRANDE FILÓSOFO!");
});

test("movimento reduzido mantém a cena completa e suprime passos e clarão", () => {
  for(const t of [0,300,900,16000,16100,17000]) {
    const f=doctorEndingFrame(t,true);
    assert.equal(f.step,1);assert.equal(f.bob,0);assert.equal(f.flash,0);
    assert.equal(f.feetY,917);
  }
});

test("enquadramento mantém toda a arte em desktop, celular e paisagem", () => {
  for(const [w,h] of [[1363,760],[390,520],[844,220],[1920,1080]]) {
    const v=endingViewport(w,h);
    assert.ok(v.x>=0 && v.y>=0);
    assert.ok(v.x+1672*v.scale<=w+.001);
    assert.ok(v.y+941*v.scale<=h+.001);
    assert.equal(v.scale,Math.min(w/1672,h/941));
  }
});

test("artes finais leves só são antecipadas durante o último combate do Doutor", async () => {
  let bytes=0;
  for(const src of DOCTOR_ENDING_ASSETS) {
    const file=new URL(`../public${src}`,import.meta.url);
    const data=await readFile(file);
    assert.equal(data.toString("ascii",0,4),"RIFF");
    bytes+=(await stat(file)).size;
  }
  assert.ok(bytes<2*1024*1024);
  for(const phase of ["playing","won"]) {
    assert.deepEqual(storyImagePreloadUrls({mode:"story",campaign:"doctor",phase,encounterIndex:DOCTOR_FINAL_ENCOUNTER_INDEX}),[...DOCTOR_ENDING_ASSETS]);
  }
  assert.deepEqual(storyImagePreloadUrls({mode:"versus",campaign:"doctor",phase:"playing",encounterIndex:14}),[]);
  assert.ok(!storyImagePreloadUrls({mode:"story",campaign:"doctor",phase:"playing",encounterIndex:13}).includes(DOCTOR_ENDING_ASSETS[0]));
});

test("aplausos param no raio e a ameaça assume a trilha do chefe", () => {
  const choose=stage=>soundtrackForPhase("doctor-complete","story","felipe","felipe-cyborg","intro",stage);
  assert.equal(choose("waiting"),null);
  assert.equal(choose("celebration"),SOUNDTRACK.applause);
  assert.equal(choose("blackout"),null);
  assert.equal(choose("threat"),SOUNDTRACK.boss);
});
