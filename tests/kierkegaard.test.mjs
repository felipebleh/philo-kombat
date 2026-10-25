import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { webpMetadata } from "./webp-metadata.mjs";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/kierkegaard.css", import.meta.url), "utf8");
const assets = await readFile(new URL("../app/fighter-assets.ts", import.meta.url), "utf8");

function pageConstant(name) {
  const ast = ts.createSourceFile("page.tsx", page, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const statement of ast.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name.getText(ast) !== name) continue;
      const js = ts.transpileModule(`const value = ${declaration.initializer.getText(ast)};`, {}).outputText;
      return Function(`${js}; return value;`)();
    }
  }
  throw new Error(`Missing ${name}`);
}

test("Kierkegaard has all five moves, correct special dispatch and a unique roster slot", () => {
  const moves = pageConstant("KIERKEGAARD_MOVES");
  assert.deepEqual(Object.keys(moves), ["dialetica", "caverna", "ideias", "especial", "transcender"]);
  assert.equal(moves.especial.label, "Angústia");
  assert.equal(moves.transcender.label, "Salto da Fé");
  for (const move of Object.values(moves)) assert.ok(move.damage > 0 && move.cooldown > 0);
  const effect = pageConstant("specialEffect");
  assert.equal(effect("kierkegaard", "especial"), "kierkegaard-anxiety");
  assert.equal(effect("kierkegaard", "transcender"), "kierkegaard-faith-leap");
  assert.ok(pageConstant("usesExtendedSpecialTiming")("kierkegaard"));
  const order = pageConstant("FIGHTER_ORDER");
  assert.equal(new Set(order).size, order.length);
  assert.ok(order.includes("kierkegaard"));
  assert.equal(pageConstant("FIGHTER_GRID_COLUMNS"), 7);
});

const motionSource=await readFile(new URL('../app/kierkegaard-motion.ts',import.meta.url),'utf8');
const motionJs=ts.transpileModule(motionSource,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {kierkegaardMotionPose:pose,faithLeapPose,FAITH_TIMING,eitherSlashPose}=await import(`data:text/javascript;base64,${Buffer.from(motionJs).toString('base64')}`);
test("eight low walking poses cycle continuously in either direction; crouch and jump stay distinct",()=>{
 const frames=Array.from({length:8},(_,i)=>pose('advance',i*110).frame);
 assert.equal(new Set(frames).size,8);
 assert.deepEqual(Array.from({length:8},(_,i)=>pose('retreat',i*110).frame),[frames[0],...frames.slice(1).reverse()]);
 assert.equal(pose('advance',880).frame,frames[0]);
 assert.equal(pose('guard',300).frame,'crouch');
 assert.equal(pose('jump',325).frame,'air');assert.ok(pose('jump',325).lift>.23);
 assert.equal(pose('jump',650).lift,0);
});
test("faith is a symmetric parabola with exact takeoff/apex/landing and no rebound to origin",()=>{
 for(const [origin,landing] of [[18,52],[70,36]]){
  assert.equal(faithLeapPose(200,origin,landing).position,origin);
  const apex=faithLeapPose(840,origin,landing);assert.equal(apex.position,(origin+landing)/2);assert.equal(apex.lift,.34);
  assert.ok(apex.airborne);assert.equal(apex.light,faithLeapPose(840,origin,landing).light);
  assert.equal(faithLeapPose(1480,origin,landing).lift,0);assert.equal(faithLeapPose(1480,origin,landing).airborne,false);
  assert.equal(faithLeapPose(1850,origin,landing).position,landing);
  for(let t=200;t<840;t+=16)assert.ok(Math.abs(faithLeapPose(t,origin,landing).lift-faithLeapPose(1680-t,origin,landing).lift)<1e-10);
 }
 assert.equal(FAITH_TIMING.impact,1480);
});
test("Ou... Ou! emits two separate crossing cuts and fades outside the thrusts",()=>{
 assert.equal(eitherSlashPose(0).alpha,0);assert.equal(eitherSlashPose(940).alpha,0);
 assert.equal(eitherSlashPose(220).index,0);assert.equal(eitherSlashPose(550).index,1);
 assert.ok(eitherSlashPose(220).alpha>.99&&eitherSlashPose(550).alpha>.99);
 assert.equal(pose('attack-combo',220).frame,'combo-thrust');assert.equal(pose('attack-combo',550).frame,'combo-cut');
});
test("crouch and air retain their native transparent cutouts and preloads",async()=>{
 for(const name of ['crouch','air']){
  const file=`/game/kierkegaard-motion-v2/${name}.webp`;
  const image=webpMetadata(await readFile(new URL('../public'+file,import.meta.url)));
  assert.ok(image.hasAlpha);assert.ok(image.height>=480&&image.width>=380);assert.ok(assets.includes(file));
 }
});

test("all combat poses use one transparent canvas size and are preloaded", async () => {
  for (const name of ["guard-frame", "punch-hq", "kick-hq", "combo-hq"]) {
    const path = `kierkegaard-${name}.webp`;
    const webp = await readFile(new URL(`../public/game/${path}`, import.meta.url));
    assert.deepEqual(webpMetadata(webp), { width: 1664, height: 1536, hasAlpha: true });
    assert.ok(assets.includes(`/game/${path}?v=4.0`));
    assert.ok(css.includes(`/game/${path}?v=4.0`));
  }
  assert.match(css, /aspect-ratio: 13 \/ 12/);
  for (const line of css.split("\n").filter(line => /^@keyframes kierkegaard-(idle|jab|kick|combo|umbrella|leap-pose)/.test(line))) {
    assert.ok(!line.includes("scale("), "No pose-dependent growth");
  }
});

test("the new leap renders the actual moving fighter once and never creates a duplicate actor",()=>{
 assert.ok(!page.includes('className="kierkegaard-leap-actor"'));
 assert.ok(!css.includes('visibility: hidden'));
 assert.equal((page.match(/<KierkegaardMotionSprite/g)||[]).length,2);
 assert.equal((page.match(/<KierkegaardSpecial/g)||[]).length,2);
 assert.match(page,/beginFaithLeap\("player",attackToken\)/);
 assert.match(page,/beginFaithLeap\("enemy",attackToken\)/);
});

test("eight native low-step poses are transparent, preloaded and anchored to a common floor",async()=>{
 const dataSource=await readFile(new URL('../app/kierkegaard-walk-poses.ts',import.meta.url),'utf8');
 const js=ts.transpileModule(dataSource,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
 const {KIERKEGAARD_WALK_POSES:art}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
 for(let i=0;i<8;i++){
  const p=art[`walk-${i}`],m=webpMetadata(await readFile(new URL('../public'+p.file,import.meta.url)));
  assert.equal(m.hasAlpha,true);assert.equal(m.width,p.width);assert.equal(m.height,p.height);
  assert.ok(assets.includes(p.file));assert.ok(Math.abs((p.soleY-4)*p.scaleToGuard-1407)<1e-7);
 }
});

test("umbrella combo articulates preparation, thrust, reload, second strike and recovery with transparent preloads",async()=>{
 assert.deepEqual([0,100,220,350,450,620,760,850,940].map(t=>pose('attack-combo',t).frame),['idle','combo-ready','combo-thrust','combo-ready','combo-reload','combo-cut','combo-reload','combo-ready','idle']);
 for(const name of ['combo-ready','combo-thrust','combo-reload','combo-cut']){
  const file='/game/kierkegaard-combo-v3/'+name+'.webp';
  const m=webpMetadata(await readFile(new URL('../public'+file,import.meta.url)));
  assert.ok(m.hasAlpha&&m.height>500);assert.ok(assets.includes(file));
 }
});
