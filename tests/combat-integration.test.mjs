import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import * as story from "../app/story-mode.mjs";
import * as grand from "../app/grand-story.mjs";
import * as ending from "../app/story-ending.mjs";
import * as quiz from "../app/story-quiz.mjs";
import * as music from "../app/soundtrack.mjs";
import * as audio from "../app/combat-audio.mjs";
const compiledModule = async path => {
  const js=ts.transpileModule(await readFile(new URL(path,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
};
const grandFinal=await compiledModule("../app/grand-final.ts");
const amenemope=await compiledModule("../app/amenemope-motion.ts");
const confucius=await compiledModule("../app/confucius-motion.ts");
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
function harness(mode="versus", fighter="plato", opponent="socrates", campaign="disciple", storyIndex=0) {
  let now=0, nextId=0;const phaseSnapshots=[];
  const state=new Map([["storyCampaign",campaign],["storyIndex",storyIndex],["phase","playing"],["gameMode",mode],["selectedFighter",fighter],["selectedOpponent",opponent]]),refs=new Map(),effects=[],listeners=new Map(),raf=new Map(),timers=new Map(),intervals=new Map();
  const context={...grand,...grandFinal,...story,...ending,...quiz,...music,...audio,...controls,...felipe,...kierkegaard,...freudPolish,...amenemope,...confucius,
    __state:(name,initial)=>{if(!state.has(name))state.set(name,typeof initial==="function"?initial():initial);return [state.get(name),v=>{const next=typeof v==="function"?v(state.get(name)):v;if(name==='phase'&&next==='finishing')phaseSnapshots.push({player:state.get('playerCoherence'),enemy:state.get('enemyCoherence'),refPlayer:refs.get('gameRef')?.current.playerCoherence,refEnemy:refs.get('gameRef')?.current.enemyCoherence});state.set(name,next);}];},
    __ref:(name,initial)=>{if(!refs.has(name))refs.set(name,{current:initial});return refs.get(name);},
    useCallback:f=>f,useEffect:f=>effects.push(f),React:{createElement:()=>({})},
    HTMLElement:class{},performance:{now:()=>now},Date,Math:Object.assign(Object.create(Math),{random:()=>.2}),console,
    requestAnimationFrame:f=>{const id=++nextId;raf.set(id,f);return id;},cancelAnimationFrame:id=>raf.delete(id),
    document:{querySelector:()=>({getBoundingClientRect:()=>({width:1000})}),hidden:false,addEventListener(){},removeEventListener(){}},
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
  const tickRoundTimer=()=>{
    for(const [id,value] of intervals)if(value.f.toString().includes('setTime('))intervals.delete(id);
    effects.length=0;vm.runInContext('controller = Home()',context);
    for(const effect of effects)if(effect.toString().includes('const timer = window.setInterval'))effect();
    for(const value of intervals.values())if(value.f.toString().includes('setTime('))value.f();
  };
  return{c,state,step,key,position,synchronize,tickRoundTimer,phaseSnapshots,random:value=>context.Math.random=()=>value,randomSequence:values=>{let i=0;context.Math.random=()=>values[Math.min(i++,values.length-1)];},cpuInterval:()=>[...intervals.values()].find(value=>value.f.toString().includes("enemyAggression.current"))?.delay,cpuStep:()=>{for(const value of intervals.values())if(value.f.toString().includes("enemyAggression.current"))value.f();}};
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

test("Amenemope J advances ten pixels without overlap and hits at 35% greater reach on either side",()=>{
 for(const mode of ["versus","story"]){
  const p=harness(mode,"amenemope","felipe");p.position(20,59);p.c.performMove("dialetica");
  assert.equal(p.state.get("playerPosition"),21);p.step(210);assert.equal(p.state.get("enemyCoherence"),100);
  p.step(20);assert.ok(p.state.get("enemyCoherence")<100);
  const cpu=harness(mode,"felipe","amenemope");cpu.position(20,59);cpu.random(0);cpu.cpuStep();
  assert.equal(cpu.state.get("enemyPosition"),58);cpu.step(230);assert.ok(cpu.state.get("playerCoherence")<100);
 }
});
test("Amenemope's hieroglyph wave reaches medium distance at its visual contact beat and can miss",()=>{
 for(const target of [68,74]){
  const p=harness("versus","amenemope","felipe");p.position(20,target);p.c.performMove("ideias");p.step(500);
  assert.equal(p.state.get("enemyCoherence"),100);p.step(20);
  assert.equal(p.state.get("enemyCoherence")<100,target===68);
 }
});
test("Amenemope L and U spend a full meter and apply damage, knockback and shake on the proper beat",()=>{
 for(const [move,impact] of [["especial",610],["transcender",760]])for(const side of ["player","enemy"]){
  const p=harness("story",side==="player"?"amenemope":"felipe",side==="enemy"?"amenemope":"felipe");
  p.position(30,55);const meter=side==="player"?"logos":"enemyLogos",health=side==="player"?"enemyCoherence":"playerCoherence";
  p.state.set(meter,100);p.synchronize();
  if(side==="player")p.c.performMove(move);else {p.random(move==="transcender"?.6:.1);p.cpuStep();}
  assert.equal(p.state.get(meter),0);p.step(impact-10);assert.equal(p.state.get(health),100);assert.equal(p.state.get("maatImpact"),false);
  p.step(20);assert.ok(p.state.get(health)<100);
  assert.equal(p.state.get("maatImpact"),move==="transcender");
  assert.equal(p.state.get(side==="player"?"enemyPosition":"playerPosition"),side==="player"?60:25);
 }
});

 test("Grande Filósofo starts with Amenemope and uses his upgraded combat controller",()=>{
 assert.equal(grand.GRAND_ENCOUNTERS[0].opponent,"amenemope");
 const h=harness("story","felipe","amenemope","grand");h.position(20,58);h.random(0);h.cpuStep();
 assert.equal(h.state.get("enemyPosition"),57);h.step(230);assert.ok(h.state.get("playerCoherence")<100);
 });

test('Sidarta basic strikes share Felipe reach and contact frames in both game modes',()=>{
 for(const mode of ['versus','story'])for(const [move,impact,damage,distance]of [['dialetica',220,7,35],['caverna',310,11,44],['ideias',620,17,50]]){
  const h=harness(mode,'sidarta','felipe');h.position(20,20+distance);h.c.performMove(move);
  h.step(impact-10);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),100-damage);
 }
});
test('Sidarta specials consume Despertar and the wheel shakes exactly at contact on both sides',()=>{
 for(const side of ['player','enemy'])for(const [move,impact,damage]of [['especial',1180,33],['transcender',1480,43]]){
  const h=harness('versus',side==='player'?'sidarta':'felipe',side==='enemy'?'sidarta':'felipe');h.position(25,50);
  const meter=side==='player'?'logos':'enemyLogos',health=side==='player'?'enemyCoherence':'playerCoherence';
  h.state.set(meter,100);h.synchronize();h.random(move==='transcender'?.6:.3);
  if(side==='player')h.c.performMove(move);else h.cpuStep();
  assert.equal(h.state.get(meter),0);h.step(impact-10);assert.equal(h.state.get(health),100);assert.equal(h.state.get('sidartaImpact'),false);
  h.step(10);assert.equal(h.state.get(health),100-damage);assert.equal(h.state.get('sidartaImpact'),move==='transcender');
  h.step(650);assert.equal(h.state.get('sidartaImpact'),false);
 }
});
test('Sidarta and Felipe use identical held movement, stop and jump duration',()=>{
 const sidarta=harness('versus','sidarta','felipe'),baseline=harness('versus','felipe','sidarta');
 for(const h of [sidarta,baseline]){h.position(25,70);h.key('d');h.step(200);h.key('d','keyup');}
 assert.equal(sidarta.state.get('playerPosition'),baseline.state.get('playerPosition'));
 for(const h of [sidarta,baseline]){h.c.jump();assert.equal(h.state.get('jumpDuration').player,650);h.step(700);assert.equal(h.state.get('playerAction'),'idle');}
});
test('Sidarta stops his walking animation on release, blur and physical limits',()=>{
 const h=harness('versus','sidarta','felipe');h.position(25,70);
 h.key('d');h.step(200);assert.equal(h.state.get('playerAction'),'advance');
 h.key('d','keyup');assert.equal(h.state.get('playerAction'),'idle');
 h.key('a');h.step(50);assert.equal(h.state.get('playerAction'),'retreat');
 h.key('','blur');assert.equal(h.state.get('playerAction'),'idle');
 h.position(13,70);h.key('a');h.step(30);assert.equal(h.state.get('playerAction'),'idle');h.key('a','keyup');
 h.position(25,70);h.c.performMove('dialetica');h.key('a','keyup');assert.equal(h.state.get('playerAction'),'attack-punch');
});
test('CPU Sidarta moves continuously and stops with combat hitstop',()=>{
 const h=harness('story','felipe','sidarta');h.position(18,70);h.random(.5);h.cpuStep();
 assert.equal(h.state.get('enemyAction'),'advance');assert.equal(h.state.get('enemyPosition'),70);
 h.step(200);assert.ok(Math.abs(h.state.get('enemyPosition')-68.4)<1e-8);
 h.c.combatClock.current.freeze(50);h.step(50);assert.ok(Math.abs(h.state.get('enemyPosition')-68.4)<1e-8);
 h.step(200);assert.ok(Math.abs(h.state.get('enemyPosition')-66.8)<1e-8);assert.equal(h.state.get('enemyAction'),'idle');
 h.cpuStep();h.step(100);const x=h.state.get('enemyPosition');h.c.impactFeedback('enemy',false,false);h.step(400);assert.equal(h.state.get('enemyPosition'),x);
 const back=harness('versus','felipe','sidarta');back.position(30,49);back.random(.8);back.cpuStep();
 assert.equal(back.state.get('enemyAction'),'retreat');back.step(200);assert.equal(back.state.get('enemyPosition'),51);back.step(200);assert.equal(back.state.get('enemyPosition'),53);
});

test('Confúcio palm lunges ten pixels, gains 26% reach and works for player and CPU',()=>{
 for(const mode of ['versus','story']){
  const p=harness(mode,'confucius','felipe');p.position(20,58);p.c.performMove('dialetica');assert.equal(p.state.get('playerPosition'),21);p.step(220);assert.ok(p.state.get('enemyCoherence')<100);
  const miss=harness(mode,'confucius','felipe');miss.position(20,60);miss.c.performMove('dialetica');miss.step(220);assert.equal(miss.state.get('enemyCoherence'),100);
  const cpu=harness(mode,'felipe','confucius');cpu.position(20,58);cpu.random(0);cpu.cpuStep();assert.equal(cpu.state.get('enemyPosition'),57);cpu.step(190);assert.ok(cpu.state.get('playerCoherence')<100);
 }
});
test('Confúcio kick reaches a crouching defender, respects guard and adds pushback',()=>{
 assert.equal(controls.attackConnects(20,50,1,28,'caverna',false,{attacker:'confucius',target:'felipe',defenderCrouching:true}),true);
 assert.equal(controls.attackConnects(20,50,1,28,'caverna',true,{attacker:'confucius',target:'felipe'}),false);
 const kick=harness('versus','confucius','felipe');kick.position(20,50);kick.c.performMove('caverna');kick.step(310);assert.equal(kick.state.get('enemyPosition'),53.5);
 const blocked=harness('versus','confucius','felipe');blocked.position(20,45);blocked.c.enemyGuardRef.current=true;blocked.c.performMove('caverna');blocked.step(310);assert.ok(blocked.state.get('enemyCoherence')<100);assert.ok(blocked.state.get('enemyCoherence')>90);
 const cpu=harness('versus','felipe','confucius');cpu.position(25,50);cpu.random(.5);cpu.cpuStep();cpu.step(300);assert.equal(cpu.state.get('playerPosition'),21.7);
});
test('Confúcio combo final hit freezes four frames and enables a special confirm',()=>{
 const h=harness('versus','confucius','felipe');h.position(20,50);h.state.set('logos',66);h.synchronize();h.c.performMove('ideias');h.step(610);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.ok(h.state.get('enemyCoherence')<100);assert.ok(h.c.combatClock.current.stopped>=60);assert.equal(h.c.enemyActionLock.current-h.c.combatClock.current.time,850);assert.equal(h.state.get('logos'),100);
 h.step(150);assert.equal(h.c.performMove('transcender'),true);assert.equal(h.state.get('playerAction'),'special-li');assert.equal(h.state.get('logos'),0);h.step(760);assert.equal(h.state.get('confuciusImpact'),true);
});
test('Confúcio Ren freezes for 300ms and both specials consume Virtude before impact',()=>{
 for(const side of ['player','enemy'])for(const [move,impact] of [['especial',side==='player'?610:640],['transcender',side==='player'?760:780]]){
  const h=harness('versus',side==='player'?'confucius':'felipe',side==='enemy'?'confucius':'felipe');h.position(25,50);const meter=side==='player'?'logos':'enemyLogos',health=side==='player'?'enemyCoherence':'playerCoherence';h.state.set(meter,100);h.synchronize();h.random(move==='transcender'?.6:.3);
  if(side==='player')h.c.performMove(move);else h.cpuStep();assert.equal(h.state.get(meter),0);
  if(move==='especial'){assert.equal(h.c.combatClock.current.stopped,300);h.step(300);assert.equal(h.c.combatClock.current.time,0);}
  h.step(impact-10);assert.equal(h.state.get(health),100);assert.equal(h.state.get('confuciusImpact'),false);h.step(10);assert.ok(h.state.get(health)<100);assert.equal(h.state.get('confuciusImpact'),move==='transcender');
 }
});
test('Confúcio startup invulnerability prevents simultaneous strikes',()=>{
 for(const move of ['especial','transcender']){
  const h=harness('versus','confucius','felipe');h.position(20,54);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove(move);h.step(move==='especial'?490:190);assert.equal(h.state.get('playerCoherence'),100);assert.equal(h.state.get('playerAction'),move==='especial'?'special-ren':'special-li');assert.equal(h.state.get('logos'),0);h.c.resetGame();assert.equal(h.state.get('confuciusImpact'),false);
 }
});

test('CPU Confúcio has the same startup immunity, which expires after 260 combat ms',()=>{
 for(const move of ['especial','transcender']){
  const protectedCpu=harness('versus','felipe','confucius');protectedCpu.position(20,54);protectedCpu.c.performMove('dialetica');protectedCpu.state.set('enemyLogos',100);protectedCpu.synchronize();protectedCpu.randomSequence([0,0,move==='especial'?.3:.6]);protectedCpu.cpuStep();protectedCpu.step(move==='especial'?520:220);assert.equal(protectedCpu.state.get('enemyCoherence'),100);assert.equal(protectedCpu.state.get('enemyAction'),move==='especial'?'special-ren':'special-li');
  const expired=harness('versus','felipe','confucius');expired.position(20,54);expired.state.set('enemyLogos',100);expired.synchronize();expired.randomSequence([0,0,move==='especial'?.3:.6]);expired.cpuStep();if(move==='especial')expired.step(300);expired.step(100);expired.c.performMove('dialetica');expired.step(220);assert.ok(expired.state.get('enemyCoherence')<100);assert.equal(expired.state.get('enemyAction'),'hit');
 }
});

test('Marco Aurélio J and I advance and reach further without overlapping',()=>{
 for(const move of ['dialetica','ideias']){const h=harness('versus','marcus','felipe');h.position(20,57);h.c.performMove(move);assert.ok(Math.abs(h.state.get('playerPosition')-21.2)<.001);h.step(move==='dialetica'?220:410);assert.ok(h.state.get('enemyCoherence')<100);}
 const h=harness('versus','felipe','marcus');h.position(20,56);h.random(0);h.cpuStep();assert.ok(Math.abs(h.state.get('enemyPosition')-54.8)<.001);h.step(190);assert.ok(h.state.get('playerCoherence')<100);
});
test('Marco Aurélio heals 15 with Cidadela and protected startup resists a simultaneous strike',()=>{
 const h=harness('versus','marcus','felipe');h.position(20,54);h.random(0);h.cpuStep();h.state.set('playerCoherence',60);h.state.set('logos',100);h.synchronize();h.c.performMove('especial');h.step(190);assert.equal(h.state.get('playerCoherence'),60);h.step(420);assert.equal(h.state.get('playerCoherence'),75);assert.ok(h.state.get('messages').some(m=>m.text==='+15 COERÊNCIA'));
});
test('Marco Aurélio cosmic special shakes on impact and clears',()=>{
 const h=harness('versus','marcus','felipe');h.position(25,50);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(750);assert.equal(h.state.get('marcusImpact'),false);h.step(10);assert.equal(h.state.get('marcusImpact'),true);h.step(230);assert.equal(h.state.get('marcusImpact'),false);
});

test('Adam Smith punch and kick lunge and reach further for player and CPU',()=>{
 for(const move of ['dialetica','caverna']){
  const p=harness('versus','smith','felipe');p.position(20,55);p.c.performMove(move);assert.ok(p.state.get('playerPosition')>20);p.step(move==='dialetica'?220:310);assert.ok(p.state.get('enemyCoherence')<100);
  const cpu=harness('versus','felipe','smith');cpu.position(20,55);cpu.randomSequence(move==='dialetica'?[0,0,0,0]:[0,0,0,.5]);cpu.cpuStep();assert.ok(cpu.state.get('enemyPosition')<55);cpu.step(move==='dialetica'?190:300);assert.ok(cpu.state.get('playerCoherence')<100);
 }
});
test('Adam Smith specials have startup priority and hand freezes for 250ms',()=>{
 for(const move of ['especial','transcender']){
  const h=harness('versus','smith','felipe');h.position(20,54);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove(move);if(move==='especial')assert.equal(h.c.combatClock.current.stopped,250);h.step(move==='especial'?440:190);assert.equal(h.state.get('playerCoherence'),100);assert.equal(h.state.get('logos'),0);
 }
});
test('Adam Smith wealth deals four synchronized hits for 45 total',()=>{
 const h=harness('versus','smith','felipe');h.position(25,50);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(899);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),89);h.step(220);assert.equal(h.state.get('enemyCoherence'),78);h.step(220);assert.equal(h.state.get('enemyCoherence'),67);h.step(260);assert.equal(h.state.get('enemyCoherence'),55);assert.equal(h.state.get('marcusImpact'),true);
});
test('CPU Adam Smith wealth also lands four times and shakes on the last hit',()=>{
 const h=harness('versus','felipe','smith');h.position(25,50);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,.8]);h.cpuStep();assert.equal(h.state.get('enemyAction'),'special-wealth-of-nations');h.step(900);assert.equal(h.state.get('playerCoherence'),89);h.step(220);assert.equal(h.state.get('playerCoherence'),78);h.step(220);assert.equal(h.state.get('playerCoherence'),67);h.step(260);assert.equal(h.state.get('playerCoherence'),55);assert.equal(h.state.get('marcusImpact'),true);
});
test('Adam Smith hand closes and hits on the clock after its 250ms freeze',()=>{
 const h=harness('versus','smith','felipe');h.position(25,50);h.state.set('logos',100);h.synchronize();h.c.performMove('especial');h.step(250);assert.equal(h.c.combatClock.current.time,0);h.step(1170);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),68);assert.ok(h.state.get('messages').some(m=>m.text==='MÃO INVISÍVEL!'));
});

test('Olympe jab advances and reaches further for player and CPU',()=>{
 const p=harness('versus','olympe','felipe');p.position(20,58);p.random(0);p.c.performMove('dialetica');assert.equal(p.state.get('playerPosition'),21);p.step(220);assert.ok(p.state.get('enemyCoherence')<100);
 const cpu=harness('versus','felipe','olympe');cpu.position(20,58);cpu.random(0);cpu.cpuStep();assert.equal(cpu.state.get('enemyPosition'),57);cpu.step(190);assert.ok(cpu.state.get('playerCoherence')<100);
});
test('Olympe kick deals 10 base damage and combo earns 24 Citizenship',()=>{
 const p=harness('versus','olympe','felipe');p.position(20,45);p.random(0);p.c.performMove('caverna');p.step(310);assert.equal(p.state.get('enemyCoherence'),90);
 const blocked=harness('versus','olympe','felipe');blocked.position(20,45);blocked.random(0);blocked.c.enemyGuardRef.current=true;blocked.c.performMove('caverna');blocked.step(310);assert.equal(blocked.state.get('enemyCoherence'),97);
 const combo=harness('versus','olympe','felipe');combo.position(20,45);combo.c.performMove('ideias');combo.step(620);assert.equal(combo.state.get('logos'),24);
});

test('Darwin J/I lunge ten pixels and connect at the extended range on either side',()=>{
 for(const move of ['dialetica','ideias']) {
  const p=harness('versus','darwin','felipe');p.position(move==='dialetica'?20:13,move==='dialetica'?64:78);p.random(0);p.c.performMove(move);
  assert.equal(p.state.get('playerPosition'),move==='dialetica'?21:14);p.step(700);assert.ok(p.state.get('enemyCoherence')<100);
  const cpu=harness('versus','felipe','darwin');cpu.position(move==='dialetica'?20:13,move==='dialetica'?64:78);cpu.randomSequence(move==='dialetica'?[0,0,0,0]:[0,.9]);cpu.cpuStep();
  assert.equal(cpu.state.get('enemyPosition'),move==='dialetica'?63:77);cpu.step(700);assert.ok(cpu.state.get('playerCoherence')<100);
 }
});
test('Felipe normals miss a distant Darwin, and still connect at body contact',()=>{
 assert.equal(controls.fighterContactGeometry('darwin').hurtbox.width,8);
 for(const [move,range,bound] of [['dialetica',40,30],['caverna',40,36],['ideias',50,40]]) {
  assert.equal(controls.attackConnects(20,20+bound+1,1,range,move,false,{attacker:'felipe',target:'darwin'}),false);
  assert.equal(controls.attackConnects(60,60-bound-1,-1,range,move,false,{attacker:'felipe',target:'darwin'}),false);
  assert.equal(controls.attackConnects(20,40,1,range,move,false,{attacker:'felipe',target:'darwin'}),true);
 }
 const h=harness('versus','darwin','felipe');h.position(20,55);h.random(0);h.cpuStep();h.step(220);assert.equal(h.state.get('playerCoherence'),100);
});
test('Darwin specials spend the meter and resist a simultaneous normal during startup',()=>{
 for(const move of ['especial','transcender']) {
  const h=harness('versus','darwin','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove(move);h.step(190);
  assert.equal(h.state.get('playerCoherence'),100);assert.equal(h.state.get('logos'),0);
  assert.equal(h.state.get('playerAction'),move==='especial'?'special-natural-selection':'special-tree-of-life');
 }
});
test('CPU meter grows more slowly against Darwin and full meter waits 300 combat ms',()=>{
 const h=harness('versus','darwin','felipe');h.position(20,48);h.random(0);h.cpuStep();h.step(220);assert.equal(h.state.get('enemyLogos'),14);
 const ready=harness('versus','darwin','felipe');ready.position(20,48);ready.random(0);ready.state.set('enemyLogos',100);ready.synchronize();
 ready.cpuStep();assert.equal(ready.state.get('enemyLogos'),100);ready.step(290);ready.cpuStep();assert.equal(ready.state.get('enemyLogos'),100);
 ready.step(10);ready.cpuStep();assert.equal(ready.state.get('enemyLogos'),0);assert.match(ready.state.get('enemyAction'),/^special/);
 ready.c.resetGame();ready.state.set('enemyLogos',100);ready.synchronize();ready.cpuStep();assert.equal(ready.state.get('enemyLogos'),100);
});


test('round timer pauses for both Darwin specials on either side and resumes afterwards',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-natural-selection','special-tree-of-life']){
  const h=harness('versus',side==='player'?'darwin':'felipe',side==='enemy'?'darwin':'felipe');
  h.tickRoundTimer();assert.equal(h.state.get('time'),59);
  h.state.set(side==='player'?'playerAction':'enemyAction',action);h.tickRoundTimer();assert.equal(h.state.get('time'),59);
  h.state.set(side==='player'?'playerAction':'enemyAction','idle');h.tickRoundTimer();assert.equal(h.state.get('time'),58);
 }
});

test('Wittgenstein combo gives 24 Clareza and his target body scales with the 8% reduction',()=>{
 const h=harness('versus','wittgenstein','felipe');h.position(20,45);h.random(0);h.c.performMove('ideias');h.step(620);assert.equal(h.state.get('logos'),24);
 assert.equal(controls.fighterContactGeometry('wittgenstein').scale,.92);assert.ok(Math.abs(controls.fighterContactGeometry('wittgenstein').hurtbox.width-9.2)<1e-10);
 assert.equal(controls.attackConnects(20,52,1,40,'dialetica',false,{attacker:'felipe',target:'wittgenstein'}),false);
});
test('Wittgenstein specials deal 30/40, pierce guard and resist simultaneous startup damage',()=>{
 for(const [move,damage,impact] of [['especial',30,1180],['transcender',40,1480]]){
  const h=harness('versus','wittgenstein','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove(move);
  assert.equal(h.c.combatClock.current.stopped,250);assert.equal(h.state.get('logos'),0);h.step(440);assert.equal(h.state.get('playerCoherence'),100);
  h.c.enemyGuardRef.current=true;h.step(impact-190);assert.equal(h.state.get('enemyCoherence'),100-damage);
  assert.equal(h.state.get('wittContact').move,move);assert.equal(h.state.get('wittContact').at,impact);
 }
});
test('CPU Wittgenstein uses identical special damage, guard piercing and full-meter costs',()=>{
 for(const [move,damage,impact] of [['especial',30,1180],['transcender',40,1480]]){
  const h=harness('versus','felipe','wittgenstein');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();
  assert.equal(h.state.get('enemyLogos'),0);h.key('s');h.step(250+impact);assert.equal(h.state.get('playerCoherence'),100-damage);
 }
});
test('silence lasts 1500 combat ms, blocks only specials, preserves the meter and resets',()=>{
 const h=harness('versus','felipe','wittgenstein');h.position(20,45);h.state.set('enemyLogos',100);h.state.set('logos',100);h.synchronize();h.randomSequence([0,.8]);h.cpuStep();h.step(1730);
 assert.equal(h.state.get('silenced').player,true);assert.equal(h.state.get('marcusImpact'),true);assert.equal(h.state.get('playerPosition'),13);
 h.step(350);h.c.performMove('especial');assert.equal(h.state.get('logos'),100);
 assert.equal(h.c.performMove('dialetica'),true);assert.equal(h.state.get('playerAction'),'attack-punch');h.step(1200);h.c.performMove('especial');assert.equal(h.state.get('logos'),0);
 h.c.resetGame();assert.equal(h.state.get('silenced').player,false);assert.equal(h.state.get('wittContact'),null);
});
test('silenced CPU retains a full meter and can use normal attacks instead',()=>{
 const h=harness('versus','wittgenstein','felipe');h.position(20,45);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1730);assert.equal(h.state.get('silenced').enemy,true);
 h.step(450);h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.random(0);h.cpuStep();assert.equal(h.state.get('enemyLogos'),100);assert.equal(h.state.get('enemyAction'),'attack-punch');
});
test('both Wittgenstein cinematics pause the round timer for P1 and CPU',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-poker','special-language-limits']){
  const h=harness('versus',side==='player'?'wittgenstein':'felipe',side==='enemy'?'wittgenstein':'felipe');h.tickRoundTimer();assert.equal(h.state.get('time'),59);
  h.state.set(side==='player'?'playerAction':'enemyAction',action);h.tickRoundTimer();assert.equal(h.state.get('time'),59);
  h.state.set(side==='player'?'playerAction':'enemyAction','idle');h.tickRoundTimer();assert.equal(h.state.get('time'),58);
 }
});

test('Arendt J/I advance 10px and connect at extended range for P1 and CPU',()=>{
 for(const move of ['dialetica','ideias']){
  const p=harness('versus','arendt','felipe');p.position(move==='dialetica'?20:13,move==='dialetica'?64:78);p.random(0);p.c.performMove(move);assert.equal(p.state.get('playerPosition'),move==='dialetica'?21:14);p.step(700);assert.ok(p.state.get('enemyCoherence')<100);if(move==='ideias')assert.equal(p.state.get('logos'),24);
  const cpu=harness('versus','felipe','arendt');cpu.position(move==='dialetica'?20:13,move==='dialetica'?64:78);cpu.randomSequence(move==='dialetica'?[0,0,0]:[0,.9]);cpu.cpuStep();assert.equal(cpu.state.get('enemyPosition'),move==='dialetica'?63:77);cpu.step(700);assert.ok(cpu.state.get('playerCoherence')<100);
 }
});
test('Arendt interrupted J/K cancel stale damage and recover into valid next attack states',()=>{
 for(const move of ['dialetica','caverna']){
  const h=harness('versus','arendt','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);assert.equal(h.state.get('playerAction'),'hit');h.step(600);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('playerAction'),'idle');h.c.performMove('ideias');assert.equal(h.state.get('playerAction'),'attack-combo');
 }
});
test('Arendt L has protected startup and deals one 38-point hit exactly with its stamp',()=>{
 const h=harness('versus','arendt','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.c.combatClock.current.stopped,200);assert.equal(h.state.get('logos'),0);
 h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),62);assert.equal(h.state.get('arendtImpact').at,900);assert.equal(h.state.get('marcusImpact'),true);h.step(1000);assert.equal(h.state.get('enemyCoherence'),62);
});
test('Natalidade from 46 HP commits exactly 14 without KO and heals exactly 15 on its dawn beat',()=>{
 for(const health of [60,96]){
  const h=harness('versus','arendt','felipe');h.position(20,45);h.state.set('playerCoherence',health);h.state.set('enemyCoherence',46);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(950);assert.equal(h.state.get('enemyCoherence'),46);assert.equal(h.state.get('playerCoherence'),health);
  h.step(10);assert.equal(h.state.get('enemyCoherence'),14);assert.equal(h.state.get('playerCoherence'),Math.min(100,health+15));assert.equal(h.c.gameRef.current.enemyCoherence,14);assert.equal(h.state.get('phase'),'playing');assert.equal(h.c.roundResolved.current,false);assert.equal(h.state.get('arendtImpact').at,760);assert.equal(h.state.get('enemyPosition'),52);
 }
});
test('fatal Natalidade clamps HUD and simulation to zero and commits healing before finish',()=>{
 const h=harness('versus','arendt','felipe');h.position(20,45);h.state.set('playerCoherence',60);h.state.set('enemyCoherence',24);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(960);
 assert.equal(h.state.get('phase'),'finishing');assert.equal(h.state.get('enemyCoherence'),0);assert.equal(h.c.gameRef.current.enemyCoherence,0);assert.equal(h.state.get('playerCoherence'),75);assert.deepEqual(h.phaseSnapshots,[{player:75,enemy:0,refPlayer:75,refEnemy:0}]);
});
test('CPU Arendt specials have symmetric clean damage, guard handling, healing and valid KO',()=>{
 for(const [move,damage,impact] of [['especial',38,900],['transcender',32,760]]){
  const h=harness('versus','felipe','arendt');h.position(20,45);h.state.set('playerCoherence',46);h.state.set('enemyCoherence',60);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();assert.equal(h.state.get('enemyLogos'),0);h.key('s');h.step(200+impact);
  assert.equal(h.state.get('playerCoherence'),46-damage);assert.equal(h.c.gameRef.current.playerCoherence,46-damage);assert.equal(h.state.get('enemyCoherence'),move==='transcender'?75:60);assert.equal(h.state.get('phase'),'playing');
 }
 const ko=harness('versus','felipe','arendt');ko.position(20,45);ko.state.set('playerCoherence',24);ko.state.set('enemyCoherence',60);ko.state.set('enemyLogos',100);ko.synchronize();ko.randomSequence([0,.8]);ko.cpuStep();ko.step(960);assert.deepEqual(ko.phaseSnapshots,[{player:0,enemy:75,refPlayer:0,refEnemy:75}]);
});
test('Arendt L/U pause even the last clock second for either side and reset their contact',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-banality','special-natality']){
  const h=harness('versus',side==='player'?'arendt':'felipe',side==='enemy'?'arendt':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');h.c.resetGame();assert.equal(h.state.get('arendtImpact'),null);
 }
});

test('Beauvoir J lunges 10px and J/I reach connects at medium distance with I granting 24 meter',()=>{
 for(const move of ['dialetica','ideias']){
  const h=harness('versus','beauvoir','felipe');h.position(13,move==='ideias'?78:61);h.random(0);h.c.performMove(move);
  assert.equal(h.state.get('playerPosition'),move==='dialetica'?14:13);h.step(700);assert.ok(h.state.get('enemyCoherence')<100);if(move==='ideias')assert.equal(h.state.get('logos'),24);
 }
});
test('Beauvoir K commits damage at the boot contact frame and interrupted strikes cannot hit later',()=>{
 const h=harness('versus','beauvoir','felipe');h.position(20,45);h.random(0);h.c.performMove('caverna');h.step(300);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),88);assert.equal(h.state.get('beauvoirImpact').at,310);
 for(const move of ['dialetica','caverna']){const h=harness('versus','beauvoir','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);h.step(600);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('playerAction'),'idle');}
});
test('Beauvoir L protects startup and commits exactly 32 with the mirror shatter',()=>{
 const h=harness('versus','beauvoir','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.state.get('logos'),0);assert.equal(h.c.combatClock.current.stopped,200);
 h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),68);assert.equal(h.state.get('beauvoirImpact').at,900);assert.equal(h.state.get('enemyPosition'),55);h.step(1200);assert.equal(h.state.get('enemyCoherence'),68);
});
test('Beauvoir U commits four exact 10-point hits, spends once and shakes only on final impact',()=>{
 const h=harness('versus','beauvoir','felipe');h.position(20,45);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(890);assert.equal(h.state.get('enemyCoherence'),100);
 for(let i=0;i<4;i++){while(h.c.combatClock.current.time<700+i*250)h.step(10);assert.equal(h.state.get('enemyCoherence'),90-i*10);assert.equal(h.state.get('logos'),0);assert.equal(h.state.get('beauvoirImpact').final,i===3);assert.equal(h.state.get('marcusImpact'),i===3);}
 h.step(1000);assert.equal(h.state.get('enemyCoherence'),60);
});
test('Beauvoir U fatal intermediate hit updates HUD before one KO and cancels the remainder',()=>{
 const h=harness('versus','beauvoir','felipe');h.position(20,45);h.state.set('enemyCoherence',15);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1500);assert.equal(h.state.get('enemyCoherence'),0);assert.deepEqual(h.phaseSnapshots,[{player:100,enemy:0,refPlayer:100,refEnemy:0}]);h.step(2000);assert.equal(h.phaseSnapshots.length,1);
});
test('CPU Beauvoir specials deal symmetric clean damage even through guard',()=>{
 for(const move of ['especial','transcender']){const h=harness('versus','felipe','beauvoir');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();assert.equal(h.state.get('enemyLogos'),0);h.key('s');h.step(2300);assert.equal(h.state.get('playerCoherence'),move==='especial'?68:60);}
});
test('Beauvoir retains half remaining meter only across rounds, for either side',()=>{
 for(const side of ['player','enemy']){const h=harness('versus',side==='player'?'beauvoir':'felipe',side==='enemy'?'beauvoir':'felipe');h.state.set('logos',79);h.state.set('enemyLogos',91);h.synchronize();h.c.resetGame(true);assert.equal(h.state.get('logos'),side==='player'?39:0);assert.equal(h.state.get('enemyLogos'),side==='enemy'?45:0);h.c.resetGame();assert.equal(h.state.get('logos'),0);assert.equal(h.state.get('enemyLogos'),0);}
});
test('Beauvoir special clock pause covers both actors and reset invalidates queued U damage',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-beauvoir-other','special-becoming']){const h=harness('versus',side==='player'?'beauvoir':'felipe',side==='enemy'?'beauvoir':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');}
 const h=harness('versus','beauvoir','felipe');h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(500);h.c.resetGame();h.synchronize();h.step(2200);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('beauvoirImpact'),null);
});

test('Freire J lunges 10px; J/K/I connect with their calibrated reach and combo grants 24 meter',()=>{
 for(const [move,gap] of [['dialetica',49],['caverna',59],['ideias',65]]){
  const h=harness('versus','paulo-freire','felipe');h.position(13,13+gap);h.random(0);h.c.performMove(move);assert.equal(h.state.get('playerPosition'),move==='dialetica'?14:13);h.step(700);assert.ok(h.state.get('enemyCoherence')<100);if(move==='caverna')assert.equal(h.state.get('enemyCoherence'),90);if(move==='ideias')assert.equal(h.state.get('logos'),24);
 }
});
test('Freire K deals base 10 at 310ms; damage cancels pending strikes and restores a visible valid pose',()=>{
 const h=harness('versus','paulo-freire','felipe');h.position(20,45);h.random(0);h.c.performMove('caverna');h.step(300);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),90);assert.equal(h.state.get('freireImpact').at,310);
 for(const move of ['dialetica','caverna']){const h=harness('versus','paulo-freire','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);assert.equal(h.state.get('impactFlash').player,true);h.step(600);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('playerAction'),'idle');}
});
test('Freire L protects startup and commits exactly 32 when the deposit is shattered',()=>{
 const h=harness('versus','paulo-freire','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.state.get('logos'),0);assert.equal(h.c.combatClock.current.stopped,200);assert.equal(h.state.get('playerPosition'),21);
 h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),68);assert.equal(h.state.get('freireImpact').at,900);assert.equal(h.state.get('enemyPosition'),55);h.step(1200);assert.equal(h.state.get('enemyCoherence'),68);
});
test('Freire U spends once and commits four 10-point impacts, shaking on the final word wave',()=>{
 const h=harness('versus','paulo-freire','felipe');h.position(20,45);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(890);assert.equal(h.state.get('enemyCoherence'),100);
 for(let i=0;i<4;i++){while(h.c.combatClock.current.time<700+i*250)h.step(10);assert.equal(h.state.get('enemyCoherence'),90-i*10);assert.equal(h.state.get('logos'),0);assert.equal(h.state.get('freireImpact').final,i===3);assert.equal(h.state.get('marcusImpact'),i===3);}
 h.step(1000);assert.equal(h.state.get('enemyCoherence'),60);
});
test('Freire U fatal intermediate hit commits HUD before one KO; reset cancels remaining word waves',()=>{
 const h=harness('versus','paulo-freire','felipe');h.position(20,45);h.state.set('enemyCoherence',15);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1500);assert.equal(h.state.get('enemyCoherence'),0);assert.deepEqual(h.phaseSnapshots,[{player:100,enemy:0,refPlayer:100,refEnemy:0}]);h.step(2000);assert.equal(h.phaseSnapshots.length,1);
 h.c.resetGame();h.synchronize();h.step(2200);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('freireImpact'),null);
});
test('CPU Freire L/U have symmetric clean damage through guard and CPU combo grants 24',()=>{
 for(const move of ['especial','transcender']){const h=harness('versus','felipe','paulo-freire');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();assert.equal(h.state.get('enemyLogos'),0);h.key('s');h.step(2300);assert.equal(h.state.get('playerCoherence'),move==='especial'?68:60);}
 const h=harness('versus','felipe','paulo-freire');h.position(20,45);h.randomSequence([0,.9]);h.cpuStep();h.step(700);assert.ok(h.state.get('playerCoherence')<100);assert.equal(h.state.get('enemyLogos'),24);
});
test('Both Freire special animations pause the clock on either side, including its last second',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-banking-education','special-liberating-education']){const h=harness('versus',side==='player'?'paulo-freire':'felipe',side==='enemy'?'paulo-freire':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');}
});

test('Fanon J/I advance 10px and connect at extended range; K commits 10 damage and 15 meter',()=>{
 for(const [move,gap] of [['dialetica',49],['caverna',56],['ideias',65]]){
  const h=harness('versus','fanon','felipe');h.position(13,13+gap);h.random(0);h.c.performMove(move);assert.equal(h.state.get('playerPosition'),move==='caverna'?13:14);h.step(700);assert.ok(h.state.get('enemyCoherence')<100);if(move==='caverna'){assert.equal(h.state.get('enemyCoherence'),90);assert.equal(h.state.get('logos'),15);}if(move==='ideias')assert.equal(h.state.get('logos'),24);
 }
});
test('Fanon K activates at 310ms and interrupted attacks never apply stale damage',()=>{
 const h=harness('versus','fanon','felipe');h.position(20,45);h.random(0);h.c.performMove('caverna');h.step(300);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),90);assert.equal(h.state.get('fanonImpact').at,310);
 for(const move of ['dialetica','caverna']){const h=harness('versus','fanon','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);assert.equal(h.state.get('impactFlash').player,true);h.step(600);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('playerAction'),'idle');}
});
test('Fanon L protects startup and shatters its mask on exactly one 36-point impact',()=>{
 const h=harness('versus','fanon','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.state.get('logos'),0);assert.equal(h.c.combatClock.current.stopped,200);
 h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),64);assert.equal(h.state.get('fanonImpact').at,900);assert.equal(h.state.get('enemyPosition'),55);assert.equal(h.state.get('marcusImpact'),true);assert.equal(h.state.get('fanonQuake'),false);h.step(1200);assert.equal(h.state.get('enemyCoherence'),64);
});
test('Fanon U commits four 10-point hits across the arena and shakes 7px only on final impact',()=>{
 const h=harness('versus','fanon','felipe');h.position(13,78);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(890);assert.equal(h.state.get('enemyCoherence'),100);
 for(let i=0;i<4;i++){while(h.c.combatClock.current.time<700+i*250)h.step(10);assert.equal(h.state.get('enemyCoherence'),90-i*10);assert.equal(h.state.get('logos'),0);assert.equal(h.state.get('fanonImpact').final,i===3);assert.equal(h.state.get('fanonQuake'),i===3);}
 h.step(1000);assert.equal(h.state.get('enemyCoherence'),60);
});
test('CPU Fanon U hits a genuinely jumping player at the opposite side for full 40 damage',()=>{
 const h=harness('versus','felipe','fanon');h.position(13,78);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,.8]);h.cpuStep();h.step(700);h.c.jump();assert.equal(h.state.get('playerAction'),'jump');h.step(200);assert.equal(h.state.get('playerCoherence'),90);h.step(1400);assert.equal(h.state.get('playerCoherence'),60);
});
test('Fanon U fatal intermediate impact updates HUD before one KO; reset cancels remaining fissures',()=>{
 const h=harness('versus','fanon','felipe');h.position(20,45);h.state.set('enemyCoherence',15);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1500);assert.equal(h.state.get('enemyCoherence'),0);assert.deepEqual(h.phaseSnapshots,[{player:100,enemy:0,refPlayer:100,refEnemy:0}]);h.step(2000);assert.equal(h.phaseSnapshots.length,1);
 h.c.resetGame();h.synchronize();h.step(2200);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('fanonImpact'),null);assert.equal(h.state.get('fanonQuake'),false);
});
test('CPU Fanon specials apply symmetric full damage through guard and CPU combo grants 24',()=>{
 for(const move of ['especial','transcender']){const h=harness('versus','felipe','fanon');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();assert.equal(h.state.get('enemyLogos'),0);h.key('s');h.step(2300);assert.equal(h.state.get('playerCoherence'),move==='especial'?64:60);}
 const h=harness('versus','felipe','fanon');h.position(20,45);h.randomSequence([0,.9]);h.cpuStep();h.step(700);assert.ok(h.state.get('playerCoherence')<100);assert.equal(h.state.get('enemyLogos'),24);
});
test('Both Fanon specials pause the last clock second for P1 and CPU',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-black-skin-white-masks','special-wretched-earth']){const h=harness('versus',side==='player'?'fanon':'felipe',side==='enemy'?'fanon':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');}
});

test('Foucault J/I lunge exactly 10px and normal strikes grant 14/14/24 meter',()=>{
 for(const [move,gap,meter] of [['dialetica',49,14],['caverna',45,14],['ideias',70,24]]){const h=harness('versus','foucault','felipe');h.position(13,13+gap);h.random(0);h.c.performMove(move);assert.equal(h.state.get('playerPosition'),move==='caverna'?13:14);h.step(700);assert.ok(h.state.get('enemyCoherence')<100);assert.equal(h.state.get('logos'),meter);}
});
test('Foucault interrupted J/K resolve to visible valid idle without stale impacts',()=>{
 for(const move of ['dialetica','caverna']){const h=harness('versus','foucault','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);assert.equal(h.state.get('impactFlash').player,true);h.step(700);assert.equal(h.state.get('playerAction'),'idle');assert.equal(h.state.get('enemyCoherence'),100);}
});
test('Panopticon has protected startup, one synchronized 32 damage impact and 1.5s surveillance',()=>{
 const h=harness('versus','foucault','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.c.combatClock.current.stopped,200);h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),68);assert.equal(h.state.get('foucaultImpact').at,900);assert.equal(h.state.get('foucaultShake'),5);assert.equal(h.state.get('watched').enemy,true);
 while(h.c.combatClock.current.time<1600)h.step(10);h.position(20,45);h.c.enemyGuardRef.current=true;h.c.performMove('dialetica');h.step(230);assert.equal(h.state.get('enemyCoherence'),62,'watched guard takes normal chip plus 3');while(h.c.combatClock.current.time<2400)h.step(10);assert.equal(h.state.get('watched').enemy,false);h.position(20,45);h.c.enemyGuardRef.current=true;h.c.performMove('dialetica');h.step(230);assert.equal(h.state.get('enemyCoherence'),59,'normal guard restored');
});
test('Biopower binds for exactly 800ms then commits 40 damage once with 7px shake',()=>{
 const h=harness('versus','foucault','felipe');h.position(13,78);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(450);assert.equal(h.state.get('docile').enemy,false);h.step(10);assert.equal(h.state.get('docile').enemy,true);assert.equal(h.c.enemyActionLock.current,1060);h.cpuStep();assert.equal(h.state.get('enemyCoherence'),100);h.step(790);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),60);assert.equal(h.state.get('docile').enemy,false);assert.equal(h.state.get('foucaultImpact').at,1060);assert.equal(h.state.get('foucaultShake'),7);h.step(1500);assert.equal(h.state.get('enemyCoherence'),60);
});
test('CPU Foucault specials deal full symmetric damage; Biopower blocks movement/guard/attacks',()=>{
 for(const move of ['especial','transcender']){const h=harness('versus','felipe','foucault');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,move==='especial'?.2:.8]);h.cpuStep();h.step(460);if(move==='transcender'){assert.equal(h.state.get('docile').player,true);const p=h.state.get('playerPosition');h.c.movePlayer(1);h.c.jump();h.c.guard();assert.equal(h.c.performMove('dialetica'),false);assert.equal(h.state.get('playerPosition'),p);assert.equal(h.state.get('playerAction'),'idle');}h.step(1800);assert.equal(h.state.get('playerCoherence'),move==='especial'?68:60);}
});
test('Foucault fatal Biopower commits HP before one KO; reset cancels queued control and damage',()=>{
 const h=harness('versus','foucault','felipe');h.position(20,45);h.state.set('enemyCoherence',30);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1400);assert.deepEqual(h.phaseSnapshots,[{player:100,enemy:0,refPlayer:100,refEnemy:0}]);h.step(1600);assert.equal(h.phaseSnapshots.length,1);h.c.resetGame();h.synchronize();h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(500);h.c.resetGame();h.synchronize();h.step(2500);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('docile').enemy,false);assert.equal(h.state.get('watched').enemy,false);
});
test('Both Foucault cinematic actions pause the last clock second for either fighter',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-panopticon','special-biopower']){const h=harness('versus',side==='player'?'foucault':'felipe',side==='enemy'?'foucault':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');}
});

test('Deleuze J keeps its established reach; K hits crouch and I starts at 320ms for 24 meter',()=>{
 const j=harness('versus','deleuze','felipe');j.position(20,62);j.random(0);j.c.performMove('dialetica');j.step(230);assert.equal(j.state.get('enemyCoherence'),92);
 const k=harness('versus','deleuze','felipe');k.position(20,65);k.c.enemyGuardRef.current=true;k.random(0);k.c.performMove('caverna');k.step(320);assert.ok(k.state.get('enemyCoherence')<100);
 const h=harness('versus','deleuze','felipe');h.position(20,45);h.random(0);h.c.performMove('ideias');assert.equal(h.state.get('playerPosition'),21);h.step(310);assert.equal(h.state.get('enemyCoherence'),100);h.step(10);assert.equal(h.state.get('enemyCoherence'),82);assert.equal(h.state.get('logos'),24);assert.equal(h.state.get('deleuzeImpact').at,320);
});
test('Deleuze interrupted J/K/I cancel pending hits and recover to a valid visible base',()=>{
 for(const move of ['dialetica','caverna','ideias']){const h=harness('versus','deleuze','felipe');h.position(20,45);h.c.performMove(move);h.step(100);h.c.impactFeedback('player',false,false);assert.equal(h.state.get('impactFlash').player,true);h.step(800);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('playerAction'),'idle');}
});
test('Rhizome protects startup, spends once, commits 32 open or 17 guarded at its root impact',()=>{
 for(const defended of [false,true]){const h=harness('versus','deleuze','felipe');h.position(20,48);h.random(0);h.cpuStep();h.state.set('logos',100);h.synchronize();h.c.performMove('especial');assert.equal(h.state.get('logos'),0);assert.equal(h.c.combatClock.current.stopped,200);h.step(390);assert.equal(h.state.get('playerCoherence'),100);h.step(700);assert.equal(h.state.get('enemyCoherence'),100);h.c.enemyGuardRef.current=defended;h.step(10);assert.equal(h.state.get('enemyCoherence'),defended?83:68);assert.equal(h.state.get('deleuzeImpact').at,900);assert.equal(h.state.get('deleuzeShake'),5);h.step(1000);assert.equal(h.state.get('enemyCoherence'),defended?83:68);}
});
test('Mil Plateaux spends once and commits four synchronized 10-point hits, shaking only on the last',()=>{
 const h=harness('versus','deleuze','felipe');h.position(13,78);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(840);assert.equal(h.state.get('enemyCoherence'),100);
 for(let i=0;i<4;i++){while(h.c.combatClock.current.time<650+i*200)h.step(10);assert.equal(h.state.get('enemyCoherence'),90-i*10);assert.equal(h.state.get('logos'),0);assert.equal(h.state.get('deleuzeImpact').final,i===3);assert.equal(h.state.get('deleuzeShake'),i===3?7:null);}
 h.step(1600);assert.equal(h.state.get('enemyCoherence'),60);
});
test('CPU Deleuze uses the same Rhizome open/guard damage and four-hit Mil Plateaux',()=>{
 for(const guard of [false,true]){const h=harness('versus','felipe','deleuze');h.position(20,45);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,.2]);h.cpuStep();h.step(500);if(guard)h.key('s');h.step(1000);assert.equal(h.state.get('playerCoherence'),guard?83:68);assert.equal(h.state.get('deleuzeShake'),null);}
 const h=harness('versus','felipe','deleuze');h.position(13,78);h.state.set('enemyLogos',100);h.synchronize();h.randomSequence([0,.8]);h.cpuStep();h.step(700);h.c.jump();h.step(1400);assert.equal(h.state.get('playerCoherence'),60);assert.equal(h.state.get('enemyLogos'),0);
 const combo=harness('versus','felipe','deleuze');combo.position(20,45);combo.randomSequence([0,.9]);combo.cpuStep();combo.step(320);assert.equal(combo.state.get('playerCoherence'),82);assert.equal(combo.state.get('enemyLogos'),24);
});
test('Mil Plateaux fatal hit commits HUD before one KO; reset cancels later layers',()=>{
 const h=harness('versus','deleuze','felipe');h.position(20,45);h.state.set('enemyCoherence',15);h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(1500);assert.deepEqual(h.phaseSnapshots,[{player:100,enemy:0,refPlayer:100,refEnemy:0}]);h.step(1800);assert.equal(h.phaseSnapshots.length,1);h.c.resetGame();h.synchronize();h.state.set('logos',100);h.synchronize();h.c.performMove('transcender');h.step(900);h.c.resetGame();h.synchronize();h.step(1800);assert.equal(h.state.get('enemyCoherence'),100);assert.equal(h.state.get('deleuzeImpact'),null);assert.equal(h.state.get('deleuzeShake'),null);
});
test('Both Deleuze cinematics pause the last clock second for P1 and CPU',()=>{
 for(const side of ['player','enemy'])for(const action of ['special-rhizome','special-mille-plateaux']){const h=harness('versus',side==='player'?'deleuze':'felipe',side==='enemy'?'deleuze':'felipe');h.state.set('time',1);h.state.set(side==='player'?'playerAction':'enemyAction',action);h.synchronize();h.tickRoundTimer();assert.equal(h.state.get('time'),1);assert.equal(h.state.get('phase'),'playing');}
});

test("only the battle after Turing uses the giant SuperIA controller", () => {
  const final = grand.GRAND_FINAL_ENCOUNTER_INDEX;
  for (const [mode, opponent, campaign, stage] of [
    ["versus", "superintelligence", "grand", final],
    ["story", "superintelligence", "disciple", final],
    ["story", "turing", "grand", final - 1],
  ]) {
    const battle = harness(mode, "felipe", opponent, campaign, stage);
    assert.equal(battle.cpuInterval(), 1280);
    assert.equal(battle.state.get("grandStrike"), null);
  }
  const boss = harness("story", "felipe", "superintelligence", "grand", final);
  assert.equal(boss.cpuInterval(), 1050);
  boss.cpuStep();
  boss.step(400);
  assert.equal(boss.state.get("enemyPosition"), 64);
  assert.equal(boss.state.get("grandStrike"), null);
});

test("Felipe can guard or jump over the giant's straight punch", () => {
  const final = grand.GRAND_FINAL_ENCOUNTER_INDEX;
  const guarded = harness("story", "felipe", "superintelligence", "grand", final);
  guarded.position(43, 70);
  guarded.key("s");
  guarded.step(10);
  guarded.cpuStep();
  assert.equal(guarded.state.get("grandStrike").kind, "jab");
  assert.equal(guarded.state.get("grandStrike").stage, "warning");
  guarded.step(690);
  assert.equal(guarded.state.get("playerCoherence"), 95);
  assert.equal(guarded.state.get("logos"), 16);

  const leaping = harness("story", "felipe", "superintelligence", "grand", final);
  leaping.position(43, 70);
  leaping.cpuStep();
  leaping.step(410);
  leaping.key("w");
  leaping.step(280);
  assert.equal(leaping.state.get("grandStrike").stage, "impact");
  assert.equal(leaping.state.get("playerCoherence"), 100);
});

test("punches, twin lasers and core beam use fixed lanes and reset with the round", () => {
  const boss = harness("story", "felipe", "superintelligence", "grand", grand.GRAND_FINAL_ENCOUNTER_INDEX);
  const expected = ["jab", "laser", "hook", "beam", "debris", "slam"];
  for (const kind of expected) {
    boss.position(34, 70);
    boss.cpuStep();
    const strike = boss.state.get("grandStrike");
    assert.equal(strike.kind, kind);
    const dodge = kind === "debris" ? 40 : 18;
    boss.position(dodge, 70);
    boss.step(strike.windup + strike.recovery + 80);
    assert.equal(boss.state.get("playerCoherence"), 100);
    if (kind === "beam") assert.equal(boss.state.get("enemyLogos"), 0);
  }

  boss.position(34, 70);
  boss.state.set("enemyCoherence", 50);
  boss.synchronize();
  boss.cpuStep();
  const next = boss.state.get("grandStrike");
  assert.equal(next.kind, "jab");
  assert.equal(next.windup, 550);
  assert.equal(next.damage, 17);

  boss.c.resetGame();
  boss.synchronize();
  boss.step(900);
  assert.equal(boss.state.get("grandStrike"), null);
  assert.equal(boss.state.get("enemyLogos"), 0);
});
