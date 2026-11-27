import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const compile=text=>ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const dataModule=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
const felipe=compile(await readFile(new URL('../app/felipe-animation.ts',import.meta.url),'utf8'));
const motion=compile(await readFile(new URL('../app/sidarta-motion.ts',import.meta.url),'utf8')).replace('"./felipe-animation"',JSON.stringify(dataModule(felipe)));
const {SIDARTA_TIMING,SIDARTA_WALK_DURATION,sidartaFrame,sidartaDrawRect,sidartaDensity,sidartaEffectPosition,sidartaHighResFrame}=await import(dataModule(motion));
const walk=compile(await readFile(new URL('../app/sidarta-walk-mesh.ts',import.meta.url),'utf8')).replace('"./sidarta-motion"',JSON.stringify(dataModule(motion)));
const {sidartaWalkFeet,sidartaWalkVertex}=await import(dataModule(walk));
const {FELIPE_TIMING,FELIPE_WALK_DURATION}=await import(dataModule(felipe));
const frames=JSON.parse(await readFile(new URL('../app/sidarta-frame-data.json',import.meta.url),'utf8'));
const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const ast=ts.createSourceFile('page.tsx',page,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function declaration(name){for(const statement of ast.statements){if(!ts.isVariableStatement(statement))continue;for(const item of statement.declarationList.declarations)if(item.name.getText(ast)===name)return `const ${name}=${item.initializer.getText(ast)};`;}throw Error(name);}
const {baseline,sidarta}=Function(compile(declaration('FELIPE_MOVES')+declaration('SIDARTA_MOVES')+'return {baseline:FELIPE_MOVES,sidarta:SIDARTA_MOVES};'))();
test('Sidarta shares Felipe response, reach, charge, damage and recovery values while keeping his own moves',()=>{
 assert.deepEqual(SIDARTA_TIMING,FELIPE_TIMING);assert.equal(SIDARTA_WALK_DURATION,FELIPE_WALK_DURATION);
 for(const key of Object.keys(baseline)){for(const field of ['damage','logos','range','cooldown'])assert.equal(sidarta[key][field],baseline[key][field],`${key}.${field}`);assert.notEqual(sidarta[key].label,baseline[key].label);}
});
test('legacy animation timing and attack poses remain reachable',()=>{
 const seen=new Set();
 for(const [action,duration,count]of [['idle',900,6],['advance',640,6],['retreat',640,6],['attack-punch',560,6],['attack-kick',680,6],['attack-combo',1000,12],['hit',440,6],['special-awakening',1450,3],['special-dharma',1850,3]]){
  const own=new Set();for(let t=0;t<duration;t++){const f=sidartaFrame(action,t),cell=`${f.row}:${f.column}`;seen.add(cell);own.add(cell);}assert.equal(own.size,count,action);
 }
 assert.equal(seen.size,36);assert.deepEqual(sidartaFrame('victory',3000),{row:5,column:0});
 for(let t=0;t<640;t++)assert.equal(sidartaFrame('retreat',t).column,5-sidartaFrame('advance',t).column);
});
test('each registered pose is complete, grounded and contained at Felipe standing height',()=>{
 assert.equal(frames.length,36);
 for(const [index,art]of frames.entries()){
  assert.ok(art.width>20&&art.height>50);
  const r=sidartaDrawRect(1800,1536,art.width,art.height,Math.floor(index/6),index%6,art.anchorX);
  assert.ok(r.x>=-1e-6&&r.y>=-1e-6);assert.ok(r.x+r.width<=1800+1e-6);assert.equal(Math.round(r.y+r.height),1521);
  if(index<12)assert.ok(Math.abs(r.height-1536*.92)<.001);
 }
 assert.deepEqual([1,2,2.2,5].map(sidartaDensity),[2,2,3,4]);
});
test('the golden effects reach the opposing fighter from either side and basic reach is bounded',()=>{
 assert.equal(sidartaEffectPosition(20,70,0),20);assert.equal(sidartaEffectPosition(20,70,1),70);assert.equal(sidartaEffectPosition(70,20,1),20);
 assert.equal(sidartaEffectPosition(20,70,1,28*1.3),56.4);assert.equal(sidartaEffectPosition(70,20,1,28*1.3),33.6);
});
test('walking, retreating and blocking never select the low-resolution atlas',()=>{
 for(let t=0;t<1280;t++){
  assert.equal(sidartaHighResFrame('advance',t),3);
  assert.equal(sidartaHighResFrame('retreat',t),3);
  for(const action of ['guard','guard-hit'])assert.equal(sidartaHighResFrame(action,t),'guard');
 }
 assert.equal(sidartaHighResFrame('attack-punch',200),null);
 assert.equal(sidartaHighResFrame('attack-punch',1000),'standing');
 assert.equal(sidartaHighResFrame('special-awakening',200),'lotus');
 assert.equal(sidartaHighResFrame('special-awakening',600),null);
});
test('the lotus pose stays sharp through the victory and meditation frames',async()=>{
 const hd=JSON.parse(await readFile(new URL('../app/sidarta-hd-art.json',import.meta.url),'utf8'));
 const {default:sharp}=await import('sharp');
 const file=await readFile(new URL('../public'+hd.lotus.src,import.meta.url));
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(info.width,hd.lotus.width);assert.equal(info.height,hd.lotus.height);
 assert.ok(info.width>=1000&&info.height>=1300);
 for(const y of [0,info.height-1])for(let x=0;x<info.width;x++)assert.ok(data[(y*info.width+x)*4+3]<64,'no opaque pixels at the horizontal edges');
 for(const x of [0,info.width-1])for(let y=0;y<info.height;y++)assert.ok(data[(y*info.width+x)*4+3]<64,'no opaque pixels at the vertical edges');
 for(const t of [0,200,480])assert.equal(sidartaHighResFrame('special-awakening',t),'lotus');
 for(const t of [0,500,3000])assert.equal(sidartaHighResFrame('victory',t),'lotus');
 assert.equal(sidartaHighResFrame('special-awakening',485),null);
 const rect=sidartaDrawRect(1800,1536,info.width,info.height,5,0,hd.lotus.anchorX);
 assert.equal(Math.round(rect.y+rect.height),1521);assert.ok(rect.x>0&&rect.x+rect.width<1800);
 const preloads=await readFile(new URL('../app/fighter-assets.ts',import.meta.url),'utf8');
 assert.match(preloads,/sidartaHdArt\.lotus\.src/);
});
test('the walking body, feet and guard are preloaded and keep their native resolution',async()=>{
 const {default:sharp}=await import('sharp');
 const hd=JSON.parse(await readFile(new URL('../app/sidarta-hd-art.json',import.meta.url),'utf8'));
 const preloads=await readFile(new URL('../app/fighter-assets.ts',import.meta.url),'utf8');
 for(const art of [hd.walk[3],hd.guard]){
  const bytes=await readFile(new URL('../public'+art.src,import.meta.url));
  const meta=await sharp(bytes).metadata();
  assert.equal(meta.height,art.height);assert.equal(meta.width,art.width);assert.equal(meta.hasAlpha,true);
  assert.ok(meta.height>=1390,'requires genuine larger artwork, not another tiny atlas cell');
  const rect=sidartaDrawRect(1800,1536,art.width,art.height,art===hd.guard?4:1,0,art.anchorX);
  assert.equal(Math.round(rect.y+rect.height),1521);assert.ok(preloads.includes(art.src));
 }
 for(const [name,width,height]of [['sidarta-walk-body-v4.webp',742,1584],['sidarta-walk-foot-v4.webp',282,159]]){
  const meta=await sharp(await readFile(new URL('../public/game/'+name,import.meta.url))).metadata();
  assert.equal(meta.width,width);assert.equal(meta.height,height);assert.equal(meta.hasAlpha,true);assert.ok(preloads.includes('/game/'+name));
 }
});
test('walking alternates feet, holds the floor and loops smoothly in either direction',()=>{
 for(const retreat of [false,true]){
  const start=sidartaWalkFeet(0,retreat),half=sidartaWalkFeet(320,retreat),again=sidartaWalkFeet(640,retreat);
  assert.deepEqual(start,again);assert.equal(start.near.ankleX,half.far.ankleX);assert.equal(start.far.ankleX,half.near.ankleX);
  for(let t=0;t<640;t++){
   const pose=sidartaWalkFeet(t,retreat);assert.ok(pose.near.lift>=0&&pose.far.lift>=0);
   assert.ok(pose.near.lift===0||pose.far.lift===0,'at least one foot stays down');
   const next=sidartaWalkFeet(t+1,retreat);assert.ok(Math.abs(next.near.ankleX-pose.near.ankleX)<2);
   assert.deepEqual(sidartaWalkVertex(.5,.1,t,retreat),[.5,.1]);
  }
 }
});
test('both combatants use the clocked sprite and wheel impact; selection and victory use explicit Sidarta art',()=>{
 assert.match(page,/selectedFighter === "sidarta" && <SidartaSprite/);assert.match(page,/opponentFighter === "sidarta" && <SidartaSprite/);
 assert.match(page,/selectedFighter === "sidarta" && moveName === "transcender"\) sidartaContact/);assert.match(page,/opponentFighter === "sidarta" && moveName === "transcender"\) sidartaContact/);
 assert.match(page,/fighter === "sidarta" \? sidartaHdArt\.lotus\.src/);
 assert.match(page,/<img key=\{fighter\} src=\{fighterSelectionArt\(fighter\)\}/);
});
