import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as story from "../app/story-mode.mjs";
import * as ending from "../app/story-ending.mjs";
import * as quiz from "../app/story-quiz.mjs";
import * as music from "../app/soundtrack.mjs";
import * as audio from "../app/combat-audio.mjs";
const compiledModule = async path => {
  const js=ts.transpileModule(await readFile(new URL(path,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
};
const freudPolish=await compiledModule("../app/freud-motion.ts");
const kierkegaard=await compiledModule("../app/kierkegaard-motion.ts");
const controls=await compiledModule("../app/combat-controls.ts"), felipe=await compiledModule("../app/felipe-animation.ts");
let source=await readFile(new URL("../app/page.tsx",import.meta.url),"utf8");
// Execute the actual controller, replacing React's rendering hooks with a deterministic
// state host. No combat logic is copied into the tests.
const start=source.indexOf('export default function Home()');
const stop=source.indexOf('\n  const opponentFighter = selectedOpponent;', start);
source=source.slice(0,stop)+`\n return {resetGame,performMove,movePlayer,jump,guard,impactFeedback,queueMove,gameRef,combatClock,inputBuffer,keysPressed,playerActionLock,enemyActionLock,enemyGuardRef,roundResolved,pactUntil,bindSovereignPact};\n}\n globalThis.controller = Home();`;
const ast=ts.createSourceFile("page.tsx",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const imports=ast.statements.filter(ts.isImportDeclaration);
for(const node of imports.reverse())source=source.slice(0,node.getFullStart())+source.slice(node.end);
source=source.replace('export default function Home()', 'function Home()');
const instrument=ctx=>root=>ts.visitNode(root,function visit(node){
  if(ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&["useState","useRef"].includes(node.expression.text)) {
    const declaration=node.parent;
    if(ts.isVariableDeclaration(declaration)) {
      const name=ts.isArrayBindingPattern(declaration.name)?declaration.name.elements[0].name.text:declaration.name.text;
      return ts.factory.updateCallExpression(node,ts.factory.createIdentifier(node.expression.text==="useState"?"__state":"__ref"),undefined,[ts.factory.createStringLiteral(name),...node.arguments]);
    }
  }
  return ts.visitEachChild(node,visit,ctx);
});
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.None,jsx:ts.JsxEmit.React},transformers:{before:[instrument]}}).outputText;
function harness(mode="versus", fighter="plato", opponent="socrates") {
  let now=0, nextId=0;
  const state=new Map([["phase","playing"],["gameMode",mode],["selectedFighter",fighter],["selectedOpponent",opponent]]),refs=new Map(),effects=[],listeners=new Map(),raf=new Map(),timers=new Map(),intervals=new Map();
  const context={...story,...ending,...quiz,...music,...audio,...controls,...felipe,...kierkegaard,...freudPolish,
    __state:(name,initial)=>{if(!state.has(name))state.set(name,typeof initial==="function"?initial():initial);return [state.get(name),v=>state.set(name,typeof v==="function"?v(state.get(name)):v)];},
    __ref:(name,initial)=>{if(!refs.has(name))refs.set(name,{current:initial});return refs.get(name);},
    useCallback:f=>f,useEffect:f=>effects.push(f),React:{createElement:()=>({})},
    HTMLElement:class{},performance:{now:()=>now},Date,Math:Object.assign(Object.create(Math),{random:()=>.2}),console,
    requestAnimationFrame:f=>{const id=++nextId;raf.set(id,f);return id;},cancelAnimationFrame:id=>raf.delete(id),
    document:{hidden:false,addEventListener(){},removeEventListener(){}},
    window:{localStorage:{getItem:()=>null},addEventListener:(name,f)=>listeners.set(name,f),removeEventListener(){},setTimeout:(f,delay)=>{const id=++nextId;timers.set(id,{f,at:now+delay});return id;},clearTimeout:id=>timers.delete(id),setInterval:(f,delay)=>{const id=++nextId;intervals.set(id,{f,delay});return id;},clearInterval:id=>intervals.delete(id)},
  };
  vm.createContext(context);vm.runInContext(compiled,context);
  const c=context.controller;
  const synchronize=()=>{
    for(const name of ["phase","playerCoherence","enemyCoherence","logos","enemyLogos","playerPosition","enemyPosition","time"])c.gameRef.current[name]=state.get(name);
  };
  c.resetGame();synchronize();
  for(const effect of effects) {
    const text=effect.toString();
    if(text.includes('const onKeyDown')||text.includes('const dt =')||text.includes('const cpuMoves ='))effect();
  }
  const step=ms=>{for(let remaining=ms;remaining>0;){const dt=Math.min(10,remaining);remaining-=dt;now+=dt;const pending=[...raf.values()];raf.clear();pending.forEach(f=>f(now));for(const[id,t]of timers)if(t.at<=now){timers.delete(id);t.f();}synchronize();}};
  const key=(name,type="keydown",repeat=false)=>listeners.get(type)?.({key:name,repeat,preventDefault(){}});
  const position=(player,enemy)=>{state.set("playerPosition",player);state.set("enemyPosition",enemy);synchronize();};
  return{c,state,step,key,position,synchronize,random:value=>context.Math.random=()=>value,cpuInterval:()=>[...intervals.values()].find(value=>value.f.toString().includes("enemyAggression.current"))?.delay,cpuStep:()=>{for(const value of intervals.values())if(value.f.toString().includes("enemyAggression.current"))value.f();}};
}
test("actual controller handles held movement and stops after keyup, independently of browser repeat",()=>{
  const h=harness();h.key("d");h.step(200);assert.ok(h.state.get("playerPosition")>21);
  h.key("d","keyup");const position=h.state.get("playerPosition");h.step(200);assert.equal(h.state.get("playerPosition"),position);
});
test("buffered next strike runs after recovery in Versus and História",()=>{
  for(const mode of ["versus","story"]) {
    const h=harness(mode);h.position(20,48);
    h.key("j");h.step(380);assert.ok(h.state.get("enemyCoherence")<100);assert.ok(h.state.get("logos")>0);
    h.key("k");h.step(180);assert.equal(h.state.get("playerAction"),"attack-kick");
    h.step(360);assert.ok(h.state.get("logos")>=33);
  }
});
test("special readiness is consumed at startup and cannot fund a second special",()=>{
  const h=harness("story","felipe");h.state.set("logos",100);h.synchronize();
  assert.equal(h.c.performMove("especial"),true);assert.equal(h.state.get("logos"),0);
  h.step(2000);const coherence=h.state.get("enemyCoherence");
  assert.equal(h.c.performMove("transcender"),true); // rejected input is consumed without spending or attacking
  assert.equal(h.state.get("enemyCoherence"),coherence);
  h.step(400);h.c.performMove("transcender");assert.equal(h.state.get("playerAction"),"idle");
});
test("damage interrupts a pending strike, stun prevents action, and guard uses separate feedback",()=>{
  const h=harness();h.position(20,40);h.c.performMove("caverna");h.step(100);
  h.c.impactFeedback("player",false,true);assert.ok(h.state.get("impactFlash").player);assert.equal(h.c.performMove("dialetica"),false);
  h.step(400);assert.equal(h.state.get("enemyCoherence"),100);assert.equal(h.state.get("impactFlash").player,false);
  h.c.guard();h.c.impactFeedback("player",true,false);assert.equal(h.state.get("playerAction"),"guard-hit");
  assert.ok(h.state.get("messages").some(m=>m.text==="DEFESA!"));
});

test("CPU strikes use the same reach; held S reduces damage and charges the resource",()=>{
  const h=harness();h.position(20,49);
  h.key("s");h.step(10);h.cpuStep();h.step(340);
  assert.equal(h.state.get("playerCoherence"),99);
  assert.equal(h.state.get("logos"),22);
  assert.ok(h.state.get("messages").some(m=>m.text==="DEFESA!"));
  assert.equal(h.state.get("impactFlash").player,false);
});
test("Hipátia's player reach, target body and CPU pacing use the real controller in both modes",()=>{
  for (const mode of ["versus","story"]) {
    const outgoing=harness(mode,"hypatia","felipe");outgoing.position(20,55);
    outgoing.c.performMove("dialetica");outgoing.step(300);
    assert.ok(outgoing.state.get("enemyCoherence")<100);
    const incoming=harness(mode,"felipe","hypatia");incoming.position(20,57);
    incoming.c.performMove("dialetica");incoming.step(300);
    assert.ok(incoming.state.get("enemyCoherence")<100);
    assert.equal(incoming.cpuInterval(),1500);
    assert.equal(outgoing.cpuInterval(),1280);
    const original=harness(mode,"felipe","plato");original.position(20,57);
    original.c.performMove("dialetica");original.step(300);
    assert.equal(original.state.get("enemyCoherence"),100);
  }
});
test("Hipátia's CPU hits with the enlarged reach and cannot interrupt her special to chain another attack",()=>{
  const basic=harness("versus","felipe","hypatia");basic.position(20,55);
  basic.cpuStep();basic.step(300);assert.ok(basic.state.get("playerCoherence")<100);
  const special=harness("versus","felipe","hypatia");special.position(20,60);
  special.state.set("enemyLogos",100);special.synchronize();special.cpuStep();
  assert.equal(special.state.get("enemyLogos"),0);
  assert.equal(special.state.get("enemyAction"),"special-astrolabe");
  assert.equal(special.c.enemyActionLock.current,1670);
  special.step(1500);special.cpuStep();
  assert.notEqual(special.state.get("enemyAction"),"attack-punch");
  special.step(1500);special.cpuStep();
  assert.equal(special.state.get("enemyAction"),"attack-punch");
});
test("Averróis's resized body and reach register for player and CPU in both modes",()=>{
  for(const mode of ["versus","story"]) {
    const outgoing=harness(mode,"averroes","felipe");outgoing.position(20,54);
    outgoing.c.performMove("dialetica");outgoing.step(300);
    assert.ok(outgoing.state.get("enemyCoherence")<100);
    const incoming=harness(mode,"felipe","averroes");incoming.position(20,57);
    incoming.c.performMove("dialetica");incoming.step(300);
    assert.ok(incoming.state.get("enemyCoherence")<100);
    const cpu=harness(mode,"felipe","averroes");cpu.position(20,54);cpu.cpuStep();cpu.step(300);
    assert.ok(cpu.state.get("playerCoherence")<100);
    assert.equal(cpu.cpuInterval(),1280);
  }
});
test("Tomás's calibrated body and reach register for player and CPU in both modes",()=>{
  for(const mode of ["versus","story"]) {
    const outgoing=harness(mode,"thomas","felipe");outgoing.position(20,54);
    outgoing.c.performMove("dialetica");outgoing.step(300);
    assert.ok(outgoing.state.get("enemyCoherence")<100);
    const incoming=harness(mode,"felipe","thomas");incoming.position(20,57);
    incoming.c.performMove("dialetica");incoming.step(300);
    assert.ok(incoming.state.get("enemyCoherence")<100);
    const cpu=harness(mode,"felipe","thomas");cpu.position(20,54);cpu.cpuStep();cpu.step(300);
    assert.ok(cpu.state.get("playerCoherence")<100);assert.equal(cpu.cpuInterval(),1280);
  }
});
test("KO resolves only once and a new round clears pending attacks",()=>{
  const h=harness();h.position(20,48);h.state.set("enemyCoherence",1);h.synchronize();
  h.c.performMove("dialetica");h.step(250);
  assert.equal(h.state.get("phase"),"finishing");assert.equal(h.state.get("matchScore").player,1);
  assert.equal(h.c.performMove("caverna"),false);h.step(2500);
  assert.equal(h.state.get("phase"),"round-won");
  h.c.resetGame();h.synchronize();h.step(400);
  assert.equal(h.state.get("enemyCoherence"),100);
});

test("Machiavelli's reach, target body and slower CPU run through the actual controller",()=>{
  for(const mode of ["versus","story"]) {
    const outgoing=harness(mode,"machiavelli","felipe");outgoing.position(20,55);
    outgoing.c.performMove("dialetica");outgoing.step(300);assert.ok(outgoing.state.get("enemyCoherence")<100);
    const incoming=harness(mode,"felipe","machiavelli");incoming.position(20,57);
    incoming.c.performMove("dialetica");incoming.step(300);assert.ok(incoming.state.get("enemyCoherence")<100);
    assert.equal(incoming.cpuInterval(),1540);assert.equal(outgoing.cpuInterval(),1280);
    const cpu=harness(mode,"felipe","machiavelli");cpu.position(20,55);cpu.cpuStep();cpu.step(300);
    assert.ok(cpu.state.get("playerCoherence")<100);
  }
});
test("Machiavelli cannot chain while the mercenary passes or during the counterattack window",()=>{
  const h=harness("versus","felipe","machiavelli");h.position(20,60);
  h.state.set("enemyLogos",100);h.synchronize();h.cpuStep();
  assert.equal(h.state.get("enemyAction"),"special-prince");assert.equal(h.state.get("enemyLogos"),0);
  assert.equal(h.c.enemyActionLock.current,1760);
  h.step(1500);h.cpuStep();assert.notEqual(h.state.get("enemyAction"),"attack-punch");
  h.step(200);h.cpuStep();assert.notEqual(h.state.get("enemyAction"),"attack-punch");
  h.step(200);h.cpuStep();assert.equal(h.state.get("enemyAction"),"attack-punch");
  const fortune=harness("versus","felipe","machiavelli");fortune.position(20,43);fortune.random(.6);
  fortune.state.set("enemyLogos",100);fortune.synchronize();fortune.cpuStep();
  assert.equal(fortune.state.get("enemyAction"),"special-virtu-fortuna");assert.equal(fortune.c.enemyActionLock.current,2160);
  fortune.step(2100);fortune.cpuStep();assert.notEqual(fortune.state.get("enemyAction"),"attack-kick");
  fortune.step(200);fortune.random(.2);fortune.cpuStep();assert.equal(fortune.state.get("enemyAction"),"attack-punch");
  const basic=harness("versus","felipe","machiavelli");basic.position(20,55);basic.cpuStep();
  assert.equal(basic.c.enemyActionLock.current,740);
  basic.step(600);basic.cpuStep();assert.notEqual(basic.state.get("enemyAction"),"attack-punch");
  basic.step(220);basic.cpuStep();assert.equal(basic.state.get("enemyAction"),"attack-punch");
});

test("Galileo's punch reaches 25% farther for player and CPU, retaining its damage and resource gain",()=>{
  const edge=23*1.25*1.3;
  for(const mode of ["versus","story"]){
    const player=harness(mode,"galileo","felipe");player.position(20,20+edge);
    player.c.performMove("dialetica");player.step(300);
    assert.equal(player.state.get("enemyCoherence"),94);assert.equal(player.state.get("logos"),13);
    const miss=harness(mode,"galileo","felipe");miss.position(20,20+edge+.01);
    miss.c.performMove("dialetica");miss.step(300);assert.equal(miss.state.get("enemyCoherence"),100);
    const behind=harness(mode,"galileo","felipe");behind.position(50,40);
    behind.c.performMove("dialetica");behind.step(300);assert.equal(behind.state.get("enemyCoherence"),100);
    const cpu=harness(mode,"felipe","galileo");cpu.position(20,20+edge);cpu.cpuStep();cpu.step(300);
    assert.equal(cpu.state.get("playerCoherence"),94);assert.equal(cpu.cpuInterval(),1280);
    const cpuMiss=harness(mode,"felipe","galileo");cpuMiss.position(20,20+edge+.01);cpuMiss.cpuStep();cpuMiss.step(300);
    assert.equal(cpuMiss.state.get("playerCoherence"),100);
  }
});
test("Galileo's kick, combo, specials and other fighters keep their reach and CPU timing",()=>{
  for(const [move,range,bonus] of [["caverna",29,2],["ideias",32,4]]){
    const edge=(range+bonus)*1.3;
    for(const offset of [0,.01]){
      const h=harness("versus","galileo","felipe");h.position(20,20+edge+offset);
      h.c.performMove(move);h.step(900);
      assert.equal(h.state.get("enemyCoherence")<100,offset===0);
    }
  }
  for(const move of ["especial","transcender"]){
    const h=harness("versus","galileo","felipe");h.position(18,80);h.state.set("logos",100);h.synchronize();
    h.c.performMove(move);h.step(2000);assert.ok(h.state.get("enemyCoherence")<100);assert.equal(h.state.get("logos"),0);
  }
  const other=harness("versus","thomas","felipe");other.position(20,57.375);
  other.c.performMove("dialetica");other.step(300);assert.equal(other.state.get("enemyCoherence"),100);
});


test("Hobbes specials spend Soberania, stay in their casting state and return directly to idle",()=>{
  for (const mode of ["versus","story"]) for (const [move,action,duration] of [["especial","special-wolf",1450],["transcender","special-leviathan",1850]]) {
    const h=harness(mode,"hobbes","felipe");h.position(20,65);h.state.set("logos",100);h.synchronize();
    assert.equal(h.c.performMove(move),true);assert.equal(h.state.get("logos"),0);
    h.step(1100);assert.equal(h.state.get("playerAction"),action);
    if(move==="transcender") { h.step(430);assert.equal(h.state.get("hobbesImpact"),true);h.step(320); }
    else h.step(duration-1100+100);
    h.step(100);assert.equal(h.state.get("playerAction"),"idle");
    assert.ok(h.state.get("enemyCoherence")<100);
    assert.equal(h.state.get("hobbesImpact"),false);
  }
});

test("Hobbes's Pacto contains only a connected, unguarded target, including the CPU",()=>{
  for(const mode of ["versus","story"]) {
    const hit=harness(mode,"hobbes","felipe");hit.position(20,55);hit.c.performMove("ideias");hit.step(700);
    assert.equal(hit.state.get("pactBound").enemy,true);assert.ok(hit.state.get("enemyCoherence")<100);
    assert.ok(hit.state.get("messages").some(m=>m.text==="PACTO SOBERANO!"));
    const before=hit.state.get("enemyPosition");hit.random(.5);hit.cpuStep();
    assert.ok(Math.abs(before-hit.state.get("enemyPosition")-1.6)<1e-9);
    hit.step(400);assert.equal(hit.state.get("pactBound").enemy,false);
    const miss=harness(mode,"hobbes","felipe");miss.position(13,80);miss.c.performMove("ideias");miss.step(700);
    assert.equal(miss.state.get("pactBound").enemy,false);assert.equal(miss.state.get("enemyCoherence"),100);
    const block=harness(mode,"hobbes","felipe");block.position(20,45);block.c.enemyGuardRef.current=true;block.c.performMove("ideias");block.step(700);
    assert.equal(block.state.get("pactBound").enemy,false);
  }
});

test("CPU Hobbes binds the player for 600 combat milliseconds and movement recovers",()=>{
  const h=harness("versus","felipe","hobbes");h.position(30,55);h.random(.8);h.cpuStep();h.step(630);
  assert.equal(h.state.get("pactBound").player,true);assert.ok(h.state.get("playerCoherence")<100);
  const expiry=h.c.pactUntil.current.player;h.step(300);
  const before=h.state.get("playerPosition");h.c.movePlayer(-1,4);
  assert.equal(before-h.state.get("playerPosition"),2);
  h.step(expiry-h.c.combatClock.current.time-10);assert.equal(h.state.get("pactBound").player,true);
  h.step(20);assert.equal(h.state.get("pactBound").player,false);
  const after=h.state.get("playerPosition");h.c.movePlayer(-1,4);assert.equal(after-h.state.get("playerPosition"),4);
});

test("Pacto halves jump speed without blocking jump input, and reset clears containment",()=>{
  const h=harness("versus","felipe","hobbes");h.c.bindSovereignPact("player");h.c.jump();
  assert.equal(h.state.get("playerAction"),"jump");assert.equal(h.state.get("jumpDuration").player,950);
  h.step(650);assert.equal(h.state.get("pactBound").player,false);assert.equal(h.state.get("playerAction"),"jump");
  h.step(310);assert.equal(h.state.get("playerAction"),"idle");h.c.jump();assert.equal(h.state.get("jumpDuration").player,650);
  h.c.bindSovereignPact("enemy");h.c.resetGame();
  assert.equal(h.state.get("pactBound").enemy,false);assert.equal(h.c.pactUntil.current.enemy,0);
  assert.equal(h.state.get("hobbesImpact"),false);
});


test("CPU Leviatã consumes Soberania, hits on the sword beat and recovers standing",()=>{
  const h=harness("versus","felipe","hobbes");h.position(30,55);h.state.set("enemyLogos",100);h.synchronize();h.random(.6);h.cpuStep();
  assert.equal(h.state.get("enemyLogos"),0);assert.equal(h.state.get("enemyAction"),"special-leviathan");
  h.step(1460);assert.equal(h.state.get("playerCoherence"),100);assert.equal(h.state.get("hobbesImpact"),false);
  h.step(70);assert.ok(h.state.get("playerCoherence")<100);assert.equal(h.state.get("hobbesImpact"),true);
  h.step(500);assert.equal(h.state.get("enemyAction"),"idle");assert.equal(h.state.get("hobbesImpact"),false);
});


test("Rousseau's kick spawns broken links only on unguarded contact, at the target's impact position",()=>{
  for(const mode of ["versus","story"]) {
    const hit=harness(mode,"rousseau","felipe");hit.position(20,48);hit.c.performMove("caverna");hit.step(300);
    assert.equal(hit.state.get("chainBursts").length,0);hit.step(30);
    const bursts=hit.state.get("chainBursts");assert.equal(bursts.length,1);assert.equal(bursts[0].side,"enemy");assert.equal(bursts[0].position,48);
    assert.equal(hit.state.get("enemyCoherence"),89);assert.equal(hit.state.get("logos"),20);
    hit.step(800);assert.equal(hit.state.get("chainBursts").length,0);
    const miss=harness(mode,"rousseau","felipe");miss.position(13,80);miss.c.performMove("caverna");miss.step(400);
    assert.equal(miss.state.get("chainBursts").length,0);
    const guarded=harness(mode,"rousseau","felipe");guarded.position(20,48);guarded.c.enemyGuardRef.current=true;guarded.c.performMove("caverna");guarded.step(400);
    assert.equal(guarded.state.get("chainBursts").length,0);
    const other=harness(mode,"rousseau","felipe");other.position(20,48);other.c.performMove("dialetica");other.step(400);
    assert.equal(other.state.get("chainBursts").length,0);
  }
});

test("CPU Rousseau's kick uses the same chain impact and reset clears its particles",()=>{
  const h=harness("versus","felipe","rousseau");h.position(30,55);h.random(.6);h.cpuStep();h.step(330);
  assert.equal(h.state.get("playerCoherence"),89);
  assert.equal(h.state.get("chainBursts").length,1);assert.equal(h.state.get("chainBursts")[0].side,"player");assert.equal(h.state.get("chainBursts")[0].position,30);
  h.c.resetGame();assert.equal(h.state.get("chainBursts").length,0);
});

test("Vontade Geral remains a full-meter special with its original timing and damage",()=>{
  const h=harness("versus","rousseau","felipe");h.position(20,65);h.state.set("logos",99);h.synchronize();h.c.performMove("transcender");
  assert.equal(h.state.get("playerAction"),"idle");h.state.set("logos",100);h.synchronize();h.c.performMove("transcender");
  assert.equal(h.state.get("playerAction"),"special-general-will");assert.equal(h.state.get("logos"),0);
  h.step(1460);assert.equal(h.state.get("enemyCoherence"),100);h.step(70);assert.equal(h.state.get("enemyCoherence"),55);
  h.step(500);assert.equal(h.state.get("playerAction"),"idle");
});

test("Hegel's damage flash lasts 80 real milliseconds on either side, including hitstop",()=>{
  for(const side of ["player","enemy"]) {
    const h=harness("versus",side==="player"?"hegel":"felipe",side==="enemy"?"hegel":"felipe");
    h.c.impactFeedback(side,false,true);
    assert.equal(h.state.get("impactFlash")[side],true);
    h.step(79);assert.equal(h.state.get("impactFlash")[side],true);
    h.step(1);assert.equal(h.state.get("impactFlash")[side],false);
  }
  const other=harness("versus","felipe","hegel");
  other.c.impactFeedback("player",false,true);other.step(80);
  assert.equal(other.state.get("impactFlash").player,true);
  other.step(10);assert.equal(other.state.get("impactFlash").player,false);
});

test("Hegel's Espírito do Tempo consumes the meter and hits with the spectral charge at 1480ms",()=>{
  for(const mode of ["versus","story"]) {
    const h=harness(mode,"hegel","felipe");h.position(25,55);
    h.c.performMove("transcender");assert.equal(h.state.get("playerAction"),"idle");
    h.state.set("logos",100);h.synchronize();h.c.performMove("transcender");
    assert.equal(h.state.get("logos"),0);assert.equal(h.state.get("playerAction"),"special-world-spirit");
    h.step(1470);assert.equal(h.state.get("enemyCoherence"),100);assert.equal(h.state.get("hegelImpact"),null);
    h.step(10);assert.ok(h.state.get("enemyCoherence")<=53);
    assert.equal(h.state.get("hegelImpact").position,55);assert.equal(h.state.get("enemyPosition"),60);
    assert.equal(h.state.get("playerAction"),"special-world-spirit");
    assert.ok(h.state.get("messages").some(m=>m.text==="ESPÍRITO DO TEMPO!"));
    h.step(600);assert.equal(h.state.get("playerAction"),"idle");assert.equal(h.state.get("hegelImpact"),null);
    h.c.resetGame();assert.equal(h.state.get("hegelImpact"),null);
  }
});
test("CPU Hegel charges in the opposite direction with heavy knockback and a standing recovery",()=>{
  const h=harness("versus","felipe","hegel");h.position(30,55);
  h.state.set("enemyLogos",100);h.synchronize();h.random(.6);h.cpuStep();
  assert.equal(h.state.get("enemyLogos"),0);assert.equal(h.state.get("enemyAction"),"special-world-spirit");
  h.step(1470);assert.equal(h.state.get("playerCoherence"),100);
  h.step(10);assert.ok(h.state.get("playerCoherence")<100);
  assert.equal(h.state.get("hegelImpact").position,30);assert.equal(h.state.get("playerPosition"),25);
  h.step(600);assert.equal(h.state.get("enemyAction"),"idle");assert.equal(h.state.get("hegelImpact"),null);
});

test('Schopenhauer J and I connect from body contact and medium range for the real P1 and CPU controller',()=>{
 for(const mode of ['versus','story'])for(const distance of [0,1,22,30])for(const move of ['dialetica','ideias']){
  const h=harness(mode,'schopenhauer','felipe');h.position(20,20+distance);h.c.performMove(move);h.step(move==='dialetica'?240:430);
  assert.ok(h.state.get('enemyCoherence')<100,`${mode} ${move} distance${distance}`);
  assert.ok(h.state.get('enemyPosition')-h.state.get('playerPosition')>=22);
 }
 for(const random of [.2,.8]){
  const h=harness('versus','felipe','schopenhauer');h.position(30,30);h.step(10);h.random(random);h.cpuStep();h.step(670);
  assert.ok(h.state.get('playerCoherence')<100);assert.ok(h.state.get('enemyPosition')-h.state.get('playerPosition')>=22);
 }
});
test('Schopenhauer pendulum requires full Vontade, impacts at1480ms on either side, recovers and resets',()=>{
 for(const mode of ['versus','story']){
  const h=harness(mode,'schopenhauer','felipe');h.position(20,65);h.c.performMove('transcender');h.step(100);assert.equal(h.state.get('enemyCoherence'),100);
  h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');assert.equal(h.state.get('logos'),0);
  h.step(1470);assert.equal(h.state.get('schopenhauerImpact'),null);assert.equal(h.state.get('enemyCoherence'),100);
  h.step(20);assert.equal(h.state.get('enemyCoherence'),52);assert.equal(h.state.get('schopenhauerImpact').position,65);
  h.step(500);assert.equal(h.state.get('playerAction'),'idle');assert.equal(h.state.get('schopenhauerImpact'),null);
  h.c.resetGame();assert.equal(h.state.get('schopenhauerImpact'),null);
 }
 const cpu=harness('versus','felipe','schopenhauer');cpu.position(25,50);cpu.state.set('enemyLogos',100);cpu.synchronize();cpu.random(.7);cpu.cpuStep();
 assert.equal(cpu.state.get('enemyAction'),'special-suffering-pendulum');assert.equal(cpu.state.get('enemyLogos'),0);
 cpu.step(1470);assert.equal(cpu.state.get('playerCoherence'),100);cpu.step(20);assert.equal(cpu.state.get('playerCoherence'),52);assert.equal(cpu.state.get('schopenhauerImpact').position,25);
});
test('Schopenhauer hitflash ends within80ms including hitstop',()=>{
 const h=harness('versus','schopenhauer','felipe');h.c.impactFeedback('player',false,true);assert.ok(h.state.get('impactFlash').player);h.step(80);assert.equal(h.state.get('impactFlash').player,false);
});


test("Kierkegaard faith leap really travels and lands on the damage beat, spending 100 Interioridade",()=>{
 for(const mode of ["versus","story"]){
  const h=harness(mode,"kierkegaard","felipe");h.position(18,70);
  h.c.performMove("transcender");assert.equal(h.state.get("playerAction"),"idle");
  h.state.set("logos",100);h.synchronize();h.c.performMove("transcender");
  assert.equal(h.state.get("logos"),0);assert.equal(h.state.get("playerAction"),"special-faith-leap");
  h.step(190);assert.equal(h.state.get("playerPosition"),18);
  h.step(650);assert.ok(h.state.get("playerPosition")>30&&h.state.get("playerPosition")<52);
  assert.equal(h.state.get("enemyCoherence"),100);
  h.step(630);assert.equal(h.state.get("enemyCoherence"),100);h.step(10);
  assert.equal(h.state.get("playerPosition"),52);assert.equal(h.state.get("enemyCoherence"),51);
  assert.equal(h.state.get("kierkegaardImpact").kind,"faith");assert.equal(h.state.get("kierkegaardImpact").position,70);
  h.step(650);assert.equal(h.state.get("playerPosition"),52);assert.equal(h.state.get("playerAction"),"idle");
  assert.equal(h.state.get("kierkegaardImpact"),null);
 }
});
test("CPU Kierkegaard leaps left, keeps body separation at both walls and resets cleanly",()=>{
 for(const [player,enemy] of [[18,70],[13,31],[57,80]]){
  const h=harness("versus","felipe","kierkegaard");h.position(player,enemy);h.state.set("enemyLogos",100);h.synchronize();
  // .6 picks U; at far distance .2 bypasses approach, so start near enough for CPU's normal decision.
  h.position(player,Math.min(enemy,player+28));h.random(.6);h.cpuStep();
  assert.equal(h.state.get("enemyAction"),"special-faith-leap");assert.equal(h.state.get("enemyLogos"),0);
  const start=h.state.get("enemyPosition");h.step(800);assert.ok(h.state.get("enemyPosition")<=start);
  h.step(680);assert.equal(h.state.get("enemyPosition"),player+18);
  assert.equal(h.state.get("playerCoherence"),51);assert.equal(h.state.get("kierkegaardImpact").position,player);
  h.c.resetGame();assert.equal(h.state.get("kierkegaardImpact"),null);h.step(2000);assert.equal(h.state.get("playerPosition"),18);assert.equal(h.state.get("enemyPosition"),70);
 }
});
test("Kierkegaard leap freezes with hitstop, interruption cancels damage and no teleport returns",()=>{
 const h=harness("versus","kierkegaard","felipe");h.position(18,70);h.state.set("logos",100);h.synchronize();h.c.performMove("transcender");h.step(800);
 const before=h.state.get("playerPosition");h.c.combatClock.current.freeze(50);h.step(50);assert.equal(h.state.get("playerPosition"),before);
 h.c.impactFeedback("player",false,true);h.step(1000);assert.equal(h.state.get("enemyCoherence"),100);assert.equal(h.state.get("playerPosition"),before);
 assert.equal(h.state.get("kierkegaardImpact"),null);
});
test("Angústia causes short disorientation only on unguarded contact and clears after 600 combat ms",()=>{
 const p=harness("versus","kierkegaard","felipe");p.position(20,55);p.state.set("logos",100);p.synchronize();p.c.performMove("especial");
 p.step(1170);assert.equal(p.state.get("disoriented").enemy,false);p.step(10);
 assert.equal(p.state.get("enemyCoherence"),65);assert.equal(p.state.get("disoriented").enemy,true);
 const coherence=p.state.get("playerCoherence");p.cpuStep();p.step(300);assert.equal(p.state.get("playerCoherence"),coherence);
 p.step(400);assert.equal(p.state.get("disoriented").enemy,false);
 const c=harness("versus","felipe","kierkegaard");c.position(25,50);c.state.set("enemyLogos",100);c.synchronize();c.random(.3);c.cpuStep();c.step(1180);
 assert.equal(c.state.get("playerCoherence"),65);assert.equal(c.state.get("disoriented").player,true);
 c.c.resetGame();assert.equal(c.state.get("disoriented").player,false);
 const block=harness("versus","felipe","kierkegaard");block.position(25,50);block.state.set("enemyLogos",100);block.synchronize();block.random(.3);block.cpuStep();block.key("s");block.step(1180);
 assert.equal(block.state.get("disoriented").player,false);assert.ok(block.state.get("playerCoherence")>65);
});


test("Kierkegaard stops his walking pose on key release, blur and physical limits without interrupting attacks",()=>{
 const h=harness("versus","kierkegaard","felipe");h.key("d");h.step(230);
 assert.equal(h.state.get("playerAction"),"advance");
 h.key("d","keyup");assert.equal(h.state.get("playerAction"),"idle");
 const x=h.state.get("playerPosition");h.step(600);assert.equal(h.state.get("playerPosition"),x);assert.equal(h.state.get("playerAction"),"idle");
 h.key("a");h.step(50);assert.equal(h.state.get("playerAction"),"retreat");h.key("","blur");assert.equal(h.state.get("playerAction"),"idle");
 h.position(13,70);h.key("a");h.step(30);assert.equal(h.state.get("playerAction"),"idle");h.key("a","keyup");
 h.position(40,58);h.key("d");h.step(30);assert.equal(h.state.get("playerAction"),"idle");h.key("d","keyup");
 h.c.performMove("dialetica");h.key("a","keyup");assert.equal(h.state.get("playerAction"),"attack-punch");
});
test("CPU Kierkegaard's footstep advances continuously, pauses at hitstop and stops on impact",()=>{
 const h=harness("versus","felipe","kierkegaard");h.position(18,70);h.random(.5);h.cpuStep();
 assert.equal(h.state.get("enemyAction"),"advance");assert.equal(h.state.get("enemyPosition"),70);
 h.step(200);assert.ok(Math.abs(h.state.get("enemyPosition")-68.4)<1e-8);
 h.c.combatClock.current.freeze(50);h.step(50);assert.ok(Math.abs(h.state.get("enemyPosition")-68.4)<1e-8);
 h.step(200);assert.ok(Math.abs(h.state.get("enemyPosition")-66.8)<1e-8);assert.equal(h.state.get("enemyAction"),"idle");
 h.cpuStep();h.step(100);const x=h.state.get("enemyPosition");h.c.impactFeedback("enemy",false,false);h.step(400);assert.equal(h.state.get("enemyPosition"),x);
 const back=harness("versus","felipe","kierkegaard");back.position(30,49);back.random(.8);back.cpuStep();
 assert.equal(back.state.get("enemyAction"),"retreat");back.step(200);assert.equal(back.state.get("enemyPosition"),51);back.step(200);assert.equal(back.state.get("enemyPosition"),53);
});


test("Kierkegaard's articulated umbrella combo preserves its hit timing, damage and resource gain for P1 and CPU",()=>{
 for(const mode of ["versus","story"]){
  const p=harness(mode,"kierkegaard","felipe");p.position(20,55);p.c.performMove("ideias");
  p.step(610);assert.equal(p.state.get("enemyCoherence"),100);assert.equal(p.state.get("playerAction"),"attack-combo");
  p.step(10);assert.equal(p.state.get("enemyCoherence"),82);assert.equal(p.state.get("logos"),37);
  p.step(500);assert.equal(p.state.get("playerAction"),"idle");
  const c=harness(mode,"felipe","kierkegaard");c.position(30,55);c.random(.8);c.cpuStep();
  assert.equal(c.state.get("enemyAction"),"attack-combo");c.step(610);assert.equal(c.state.get("playerCoherence"),100);
  c.step(10);assert.equal(c.state.get("playerCoherence"),82);assert.equal(c.state.get("enemyLogos"),18);
  c.step(500);assert.equal(c.state.get("enemyAction"),"idle");
 }
});


test("Freud dreams apply half-speed torpor on contact for 500 combat ms, then movement recovers",()=>{
 for(const mode of ["versus","story"]){
  const h=harness(mode,"felipe","freud");h.position(30,55);h.state.set("enemyLogos",100);h.synchronize();h.random(.3);h.cpuStep();
  assert.equal(h.state.get("enemyAction"),"special-dream-interpretation");assert.equal(h.state.get("enemyLogos"),0);
  h.step(1170);assert.equal(h.state.get("torporBound").player,false);h.step(10);
  assert.equal(h.state.get("playerCoherence"),65);assert.equal(h.state.get("torporBound").player,true);
  h.step(300);const before=h.state.get("playerPosition");h.c.movePlayer(-1,4);assert.equal(before-h.state.get("playerPosition"),2);
  h.step(240);assert.equal(h.state.get("torporBound").player,true);h.step(20);assert.equal(h.state.get("torporBound").player,false);
  const after=h.state.get("playerPosition");h.c.movePlayer(-1,4);assert.equal(after-h.state.get("playerPosition"),4);
 }
 const p=harness("versus","freud","felipe");p.position(20,55);p.state.set("logos",100);p.synchronize();p.c.performMove("especial");p.step(1180);
 assert.equal(p.state.get("enemyCoherence"),65);assert.equal(p.state.get("torporBound").enemy,true);
 p.step(300);const before=p.state.get("enemyPosition");p.random(.5);p.cpuStep();assert.ok(Math.abs(before-p.state.get("enemyPosition")-1.6)<1e-9);
 p.c.resetGame();assert.equal(p.state.get("torporBound").enemy,false);
});
test("defense resists dream torpor and the slow can affect jumping without adding chains",()=>{
 const block=harness("versus","felipe","freud");block.position(20,45);block.state.set("enemyLogos",100);block.synchronize();block.random(.3);block.cpuStep();block.key("s");block.step(1180);
 assert.equal(block.state.get("torporBound").player,false);assert.ok(block.state.get("playerCoherence")>65);
 const h=harness("versus","felipe","freud");h.position(20,45);h.state.set("enemyLogos",100);h.synchronize();h.random(.3);h.cpuStep();h.step(1480);h.c.jump();
 assert.equal(h.state.get("playerAction"),"jump");assert.ok(h.state.get("jumpDuration").player>650);
 assert.equal(h.state.get("pactBound").player,false);h.step(900);assert.equal(h.state.get("playerAction"),"idle");
});
test("Freud Eros and Thanatos consume 100 Libido and shake only at the actual 1480ms impact on either side",()=>{
 for(const side of ["player","enemy"]){
  const h=harness("versus",side==="player"?"freud":"felipe",side==="enemy"?"freud":"felipe");h.position(25,50);
  const meter=side==="player"?"logos":"enemyLogos",health=side==="player"?"enemyCoherence":"playerCoherence";
  if(side==="player"){h.c.performMove("transcender");assert.equal(h.state.get("playerAction"),"idle");}
  h.state.set(meter,100);h.synchronize();h.random(.6);
  if(side==="player")h.c.performMove("transcender");else h.cpuStep();
  assert.equal(h.state.get(meter),0);h.step(1470);assert.equal(h.state.get(health),100);assert.equal(h.state.get("freudImpact"),null);
  h.step(10);assert.equal(h.state.get(health),51);assert.equal(h.state.get("freudImpact").position,side==="player"?50:25);
  h.step(650);assert.equal(h.state.get(side==="player"?"playerAction":"enemyAction"),"idle");assert.equal(h.state.get("freudImpact"),null);
  h.c.resetGame();assert.equal(h.state.get("freudImpact"),null);
 }
});

test('cyborg specials spend full Controle, hit on the Felipe timing and recover standing for player and CPU',()=>{
 for(const side of ['player','enemy'])for(const move of ['especial','transcender']){
  const h=harness('versus',side==='player'?'felipe-cyborg':'felipe',side==='enemy'?'felipe-cyborg':'felipe');h.position(25,50);
  const meter=side==='player'?'logos':'enemyLogos',action=side==='player'?'playerAction':'enemyAction',health=side==='player'?'enemyCoherence':'playerCoherence';
  if(side==='player'){h.c.performMove(move);assert.equal(h.state.get(action),'idle');}
  h.state.set(meter,100);h.synchronize();h.random(move==='transcender'?.6:.3);if(side==='player')h.c.performMove(move);else h.cpuStep();
  assert.equal(h.state.get(action),move==='especial'?'special-certainty':'special-drone-swarm');assert.equal(h.state.get(meter),0);
  const impact=move==='especial'?1180:1480;h.step(impact-10);assert.equal(h.state.get(health),100);assert.equal(h.state.get('cyborgImpact'),null);
  h.step(10);assert.equal(h.state.get(health),move==='especial'?67:57);assert.equal(h.state.get('cyborgImpact').position,side==='player'?50:25);
  h.step(650);assert.equal(h.state.get(action),'idle');assert.equal(h.state.get('cyborgImpact'),null);
  h.c.resetGame();assert.equal(h.state.get('cyborgImpact'),null);
 }
});
test('cyborg combo connects at620ms and walking stops on key release without cancelling a strike',()=>{
 const h=harness('versus','felipe-cyborg','felipe');h.position(25,50);h.c.performMove('ideias');h.step(610);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),83);h.step(550);
 h.key('a');h.step(180);h.key('a','keyup');assert.equal(h.state.get('playerAction'),'idle');
 h.c.performMove('dialetica');h.key('a','keyup');assert.equal(h.state.get('playerAction'),'attack-punch');
});
