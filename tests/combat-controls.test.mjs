import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const load = async file => {
  const js = ts.transpileModule(await readFile(new URL(file, import.meta.url), "utf8"), {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
};
const { attackConnects, InputBuffer, CombatClock, recoveryDuration, HYPATIA_SCALE, AVERROES_SCALE, THOMAS_SCALE, MACHIAVELLI_SCALE, FREUD_SCALE, fighterContactGeometry, cpuDecisionInterval, cpuAttackRecovery } = await load("../app/combat-controls.ts");
const { sheetFrameRect, amenemopeFrame, isolateSilhouette } = await load("../app/sprite-frames.ts");
test("basic strikes reach 30% farther in front on both sides, without rear hits or jumping kick hits", () => {
  for (const [move,range,bonus] of [["dialetica",28,0],["caverna",34,2],["ideias",38,4]]) {
    const reach=(range+bonus)*1.3;
    for (const facing of [1,-1]) {
      assert.ok(attackConnects(50,50+facing*reach,facing,range,move));
      assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move));
      assert.ok(!attackConnects(50,50-facing*10,facing,range,move));
    }
  }
  assert.ok(!attackConnects(20,40,1,34,"caverna",true));
  assert.ok(attackConnects(20,40,1,28,"dialetica",true));
  assert.ok(attackConnects(18,80,1,100,"especial",true));
});
test("Hipátia scales her body, attack origin and melee reach by 19% on either side", () => {
  const base = fighterContactGeometry("felipe"), hypatia = fighterContactGeometry("hypatia");
  assert.equal(HYPATIA_SCALE, 1.19);
  assert.equal(hypatia.hurtbox.width, base.hurtbox.width * HYPATIA_SCALE);
  assert.equal(hypatia.hurtbox.height, base.hurtbox.height * HYPATIA_SCALE);
  assert.equal(hypatia.attackOrigin.x, base.attackOrigin.x * HYPATIA_SCALE);
  assert.equal(hypatia.attackOrigin.y, base.attackOrigin.y * HYPATIA_SCALE);
  for (const [move, range, bonus] of [["dialetica",23,0],["caverna",28,2],["ideias",31,4]]) {
    const reach = (range + bonus) * 1.3 * HYPATIA_SCALE;
    for (const facing of [1,-1]) {
      const fighters = { attacker: "hypatia", target: "felipe" };
      assert.ok(attackConnects(50,50+facing*reach,facing,range,move,false,fighters));
      assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move,false,fighters));
      assert.ok(!attackConnects(50,50-facing*2,facing,range,move,false,fighters));
    }
  }
});
test("an enlarged Hipátia receives edge contacts without changing other matchups or aerial evasion", () => {
  const reach = 28 * 1.3, padding = (10 * HYPATIA_SCALE - 10) / 2;
  const fighters = { attacker: "felipe", target: "hypatia" };
  for (const facing of [1,-1]) {
    assert.ok(attackConnects(50,50+facing*(reach+padding),facing,28,"dialetica",false,fighters));
    assert.ok(!attackConnects(50,50+facing*(reach+padding+.01),facing,28,"dialetica",false,fighters));
  }
  assert.ok(!attackConnects(20,40,1,34,"caverna",true,fighters));
  assert.ok(attackConnects(20,40,1,28,"dialetica",true,fighters));
  for (const attacker of ["felipe","plato","diogenes","superintelligence"]) {
    assert.equal(cpuDecisionInterval(attacker),1280);
    for (const distance of [0,20,reach,reach+.01,60,-2]) {
      assert.equal(attackConnects(20,20+distance,1,28,"dialetica",false,{attacker,target:"tales"}),attackConnects(20,20+distance,1,28,"dialetica"));
    }
  }
  assert.equal(cpuDecisionInterval("hypatia") - cpuDecisionInterval("felipe"),220);
  for (const [duration,impact,special] of [[480,190,false],[1450,1180,true],[1850,1480,true]]) {
    const base = special ? duration : recoveryDuration(duration,impact);
    assert.equal(cpuAttackRecovery("hypatia",duration,impact,special),base+220);
    assert.equal(cpuAttackRecovery("plato",duration,impact,special),base);
  }
});
test("Averróis has 15% proportional reach and hurtbox on both sides without changing CPU timing", () => {
  assert.equal(AVERROES_SCALE, 1.15);
  const body = fighterContactGeometry("averroes");
  assert.equal(body.hurtbox.width, 11.5);
  assert.equal(body.hurtbox.height, 1.15);
  assert.equal(body.attackOrigin.x, 4.6);
  for (const [move, range, bonus] of [["dialetica",23,0],["caverna",28,2],["ideias",31,4]]) {
    const reach = (range + bonus) * 1.3 * 1.15;
    for (const facing of [1,-1]) {
      const fighters = { attacker:"averroes", target:"felipe" };
      assert.ok(attackConnects(50,50+facing*reach,facing,range,move,false,fighters));
      assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move,false,fighters));
      assert.ok(!attackConnects(50,50-facing*2,facing,range,move,false,fighters));
    }
  }
  for (const facing of [1,-1]) {
    const fighters={attacker:"felipe",target:"averroes"};
    const edge=28*1.3+.75;
    assert.ok(attackConnects(50,50+facing*edge,facing,28,"dialetica",false,fighters));
    assert.ok(!attackConnects(50,50+facing*(edge+.01),facing,28,"dialetica",false,fighters));
    assert.ok(!attackConnects(50,50+facing*20,facing,34,"caverna",true,fighters));
  }
  assert.equal(cpuDecisionInterval("averroes"),1280);
  assert.equal(cpuAttackRecovery("averroes",620,310,false),cpuAttackRecovery("felipe",620,310,false));
});
test("Tomás has proportional reach and hurtbox for his calibrated size without changing other fighters", () => {
  const body=fighterContactGeometry("thomas");
  assert.equal(body.hurtbox.width,10*THOMAS_SCALE);assert.equal(body.hurtbox.height,THOMAS_SCALE);
  assert.equal(body.attackOrigin.x,4*THOMAS_SCALE);assert.equal(body.attackOrigin.y,.65*THOMAS_SCALE);
  for(const [move,range,bonus] of [["dialetica",23,0],["caverna",28,2],["ideias",31,4]])for(const facing of [1,-1]){
    const reach=(range+bonus)*1.3*THOMAS_SCALE, fighters={attacker:"thomas",target:"felipe"};
    assert.ok(attackConnects(50,50+facing*reach,facing,range,move,false,fighters));
    assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move,false,fighters));
    assert.ok(!attackConnects(50,50-facing*2,facing,range,move,false,fighters));
  }
  for(const facing of [1,-1]) {
    const edge=28*1.3+(body.hurtbox.width-10)/2,fighters={attacker:"felipe",target:"thomas"};
    assert.ok(attackConnects(50,50+facing*edge,facing,28,"dialetica",false,fighters));
    assert.ok(!attackConnects(50,50+facing*(edge+.01),facing,28,"dialetica",false,fighters));
    assert.ok(!attackConnects(50,50+facing*20,facing,34,"caverna",true,fighters));
  }
  for(const fighter of ["felipe","tales","plato","socrates"])assert.equal(fighterContactGeometry(fighter).scale,1);
  assert.equal(cpuDecisionInterval("thomas"),1280);
  assert.equal(cpuAttackRecovery("thomas",620,310,false),cpuAttackRecovery("felipe",620,310,false));
});
test("a press 120ms before recovery is executed exactly once, an old press expires", () => {
  const buffer = new InputBuffer(), moves=[];
  buffer.push("caverna",1000);
  buffer.consume(1100,()=>false); assert.equal(buffer.queue.length,1);
  buffer.consume(1120,move=>{moves.push(move);return true;});
  buffer.consume(1130,move=>{moves.push(move);return true;});
  assert.deepEqual(moves,["caverna"]);
  buffer.push("ideias",2000); buffer.consume(2141,()=>{throw Error("stale press");});
  buffer.push("especial",3000); buffer.clear(); assert.equal(buffer.queue.length,0);
});
test("queue preserves attack order across a short recovery",()=>{
  const buffer=new InputBuffer(), moves=[];
  buffer.push("dialetica",0);buffer.push("caverna",10);
  buffer.consume(20,move=>{moves.push(move);return true;});
  buffer.consume(30,move=>{moves.push(move);return true;});
  assert.deepEqual(moves,["dialetica","caverna"]);
});
test("hitstop freezes gameplay jobs and both recovery clocks for 50ms",()=>{
  const clock=new CombatClock(),events=[];
  clock.schedule(()=>{events.push("impact");clock.freeze(50);},20);
  clock.schedule(()=>events.push("recover"),40);
  clock.tick(20); assert.deepEqual(events,["impact"]);
  clock.tick(30);assert.equal(clock.time,20); assert.equal(clock.stopped,20);
  clock.tick(20);assert.equal(clock.time,20);
  clock.tick(20);assert.deepEqual(events,["impact","recover"]);
  clock.schedule(()=>events.push("old round"),10);clock.reset();clock.tick(100);
  assert.deepEqual(events,["impact","recover"]);
});
test("recovery ends sooner while leaving at least 80ms after contact",()=>{
  for (const [duration,impact] of [[520,220],[620,310],[780,410],[1000,620]]) {
    const recovery=recoveryDuration(duration,impact);
    assert.ok(recovery<duration && recovery>=impact+80);
    assert.ok(duration-recovery<=90);
  }
});
test("all 36 integer crop rectangles partition the sheet without adjacent-cell overlap",()=>{
  const area=[];
  for (let row=0;row<6;row++)for(let col=0;col<6;col++) {
    const [x,y,w,h]=sheetFrameRect(1800,2700,col,row);
    assert.deepEqual([x,y,w,h],[col*300,row*450,300,450]);area.push(w*h);
  }
  assert.equal(area.reduce((a,b)=>a+b,0),1800*2700);
  for(let ms=0;ms<=1000;ms++) {
    const f=amenemopeFrame("attack-combo",ms);
    assert.ok(Number.isInteger(f.column)&&f.column>=0&&f.column<=5);
    assert.ok(f.row===2||f.row===3);
  }
});
test("sprite isolation retains the complete connected kick and discards floating neighbors",()=>{
  const pixels=new Uint8ClampedArray(12*8*4);
  const fill=(x,y)=>pixels[(y*12+x)*4+3]=255;
  for(let y=1;y<7;y++)for(let x=2;x<5;x++)fill(x,y);
  for(let x=5;x<11;x++)fill(x,4); // extended leg must survive
  fill(0,0);fill(11,0);fill(11,1);
  isolateSilhouette(pixels,12,8);
  assert.equal(pixels[(4*12+10)*4+3],255);
  assert.equal(pixels[(0*12+11)*4+3],0);
  assert.equal(pixels[3],0);
});

test("Amenemope keeps the original guard, victory and knockout poses",()=>{
  assert.deepEqual(amenemopeFrame("guard",500),{row:4,column:2});
  assert.deepEqual(amenemopeFrame("victory",1000),{row:5,column:5});
  assert.deepEqual(amenemopeFrame("knocked-out",1000),{row:4,column:3});
});

test("Machiavelli scales contact geometry and leaves 260ms after complete attacks and mercenary effects",()=>{
  const body=fighterContactGeometry("machiavelli");
  assert.equal(body.scale,MACHIAVELLI_SCALE);
  assert.equal(body.hurtbox.width,10*MACHIAVELLI_SCALE);
  assert.equal(body.attackOrigin.x,4*MACHIAVELLI_SCALE);
  for(const [move,range,bonus] of [["dialetica",23,0],["caverna",29,2],["ideias",32,4]])for(const facing of [1,-1]){
    const reach=(range+bonus)*1.3*MACHIAVELLI_SCALE, fighters={attacker:"machiavelli",target:"felipe"};
    assert.ok(attackConnects(50,50+facing*reach,facing,range,move,false,fighters));
    assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move,false,fighters));
    assert.ok(!attackConnects(50,50-facing*2,facing,range,move,false,fighters));
  }
  const padding=(body.hurtbox.width-10)/2;
  for(const facing of [1,-1]) {
    const f={attacker:"felipe",target:"machiavelli"},edge=28*1.3+padding;
    assert.ok(attackConnects(50,50+facing*edge,facing,28,"dialetica",false,f));
    assert.ok(!attackConnects(50,50+facing*(edge+.01),facing,28,"dialetica",false,f));
    assert.ok(!attackConnects(50,50+facing*20,facing,34,"caverna",true,f));
  }
  assert.equal(cpuDecisionInterval("machiavelli"),1540);
  for(const [duration,impact,special] of [[480,190,false],[780,620,false],[1450,1180,true],[1850,1480,true]])
    assert.equal(cpuAttackRecovery("machiavelli",duration,impact,special),duration+(special?50:0)+260);
});

test('Schopenhauer cane covers torso contact through the tip, in either direction, preserving far reach',async()=>{
 const {caneContactSpan}=await load('../app/combat-controls.ts');assert.equal(caneContactSpan(40,10).start,0);
 for(const facing of [1,-1])for(const [move,range,bonus]of [['dialetica',29,0],['ideias',41,4]]){
  const actors={attacker:'schopenhauer',target:'felipe'},reach=(range+bonus)*1.3;
  for(const distance of [-4.9,0,.1,5,18,22,30,reach])assert.ok(attackConnects(50,50+facing*distance,facing,range,move,false,actors),`${move} at${distance}`);
  assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,range,move,false,actors));
  assert.ok(!attackConnects(50,50-facing*5.1,facing,range,move,false,actors));
 }
 assert.ok(!attackConnects(50,49,1,29,'dialetica',false,{attacker:'felipe',target:'schopenhauer'}));
});
test('Schopenhauer pushboxes resolve overlap and crossing at either wall while keeping other matchups unchanged',async()=>{
 const {minimumFighterGap,resolveFighterPushboxes:resolve}=await load('../app/combat-controls.ts');
 assert.equal(minimumFighterGap('schopenhauer','felipe'),22);assert.equal(minimumFighterGap('felipe','plato'),18);
 for(const fighters of [['schopenhauer','felipe'],['felipe','schopenhauer']])for(const [p,e]of [[20,20],[30,31],[48,38],[13,14],[79,80],[18,70]]){
  const r=resolve(p,e,...fighters);assert.ok(r.enemy-r.player>=22);assert.ok(r.player>=13&&r.player<=57&&r.enemy<=80);
  assert.deepEqual(resolve(r.player,r.enemy,...fighters),r);
 }
 assert.deepEqual(resolve(30,31,'felipe','plato'),{player:30,enemy:31});
});

test("Freud has a 10% body and reach calibration, with unchanged CPU timing and rear-hit protection",()=>{
 assert.equal(FREUD_SCALE,1.1);assert.equal(fighterContactGeometry('freud').hurtbox.width,11);
 const reach=29*1.3*FREUD_SCALE;
 for(const facing of [1,-1]){
  const pair={attacker:'freud',target:'felipe'};
  assert.ok(attackConnects(50,50+facing*reach,facing,29,'dialetica',false,pair));
  assert.ok(!attackConnects(50,50+facing*(reach+.01),facing,29,'dialetica',false,pair));
  assert.ok(!attackConnects(50,50-facing*5,facing,29,'dialetica',false,pair));
 }
 assert.equal(cpuDecisionInterval('freud'),1280);
});
