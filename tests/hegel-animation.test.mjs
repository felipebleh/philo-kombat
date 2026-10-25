import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';
const module=async name=>{const js=ts.transpileModule(await readFile(new URL(`../app/${name}.ts`,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);};
const h=await module('hegel-animation'),{HEGEL_POSES:poses}=await module('hegel-pose-data');
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} differs from ${b}`);
test('walking changes complete full-body leg poses; retreat reverses the cycle',()=>{
 const forward=[0,160,320,480].map(t=>h.hegelPose('advance',t));
 assert.equal(new Set(forward).size,4);
 assert.deepEqual([0,160,320,480].map(t=>h.hegelPose('retreat',t)),[...forward].reverse());
 assert.equal(h.hegelPose('advance',640),forward[0]);
});
test('strikes show extended limbs at controller contact, then return to guard',()=>{
 for(const [action,t,expected] of [['attack-punch',220,'punch'],['attack-kick',310,'kick'],['attack-combo',410,'hook'],['special-dialectic',1180,'cast'],['special-world-spirit',1480,'summon']]){
  assert.equal(h.hegelPose(action,t),expected);assert.equal(h.hegelPose(action,2000),'idle');
  const frames=new Set();for(let ms=0;ms<1800;ms+=10)frames.add(h.hegelPose(action,ms));assert.ok(frames.size>=3,action);
 }
 for(const a of ['jump','special-world-spirit','special-dialectic'])for(let t=0;t<1850;t+=10)assert.ok(!['fallen','hit','rise'].includes(h.hegelPose(a,t)));
 assert.equal(h.hegelPose('guard',120),'guard');assert.equal(h.hegelPose('jump',300),'jump');
 assert.equal(h.hegelPose('knocked-out',500),'fallen');assert.equal(h.hegelPose('recover',200),'rise');
});
test('every complete pose has native transparent pixels, clean gutters and correct dimensions',async()=>{
 for(const [name,p] of Object.entries(poses)){
  const {data,info}=await sharp(new URL(`../public${p.file}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(info.width,p.width,name);assert.equal(info.height,p.height,name);
  assert.ok(p.anchorX>=0&&p.anchorX<p.width,name);assert.ok(p.soleY<p.height);
  let opaque=0,transparent=0;for(let i=3;i<data.length;i+=4){if(data[i]>200)opaque++;if(data[i]===0)transparent++;}
  assert.ok(opaque>10000&&transparent>1000,name);
  // Extraction preserves all four extrema with safe transparent padding.
  for(let x=0;x<info.width;x++)assert.equal(data[((info.height-1)*info.width+x)*4+3],0,`${name} lower edge`);
 }
});
test('drawImage preserves every aspect ratio and foot anchor at all viewport/DPR sizes',()=>{
 for(const [w,ht,dpr] of [[220,188,1],[553,472,2],[750,640,3]])for(const p of Object.values(poses)){
  const target=h.hegelPlacement(w,ht,p);let draw;const art={};
  const ctx={setTransform(){},clearRect(){},drawImage(...a){draw=a;}};h.paintHegel(ctx,art,p,w,ht,dpr);
  assert.equal(draw[0],art);near(draw[7]/draw[8],p.width/p.height);
  near(draw[6]+p.soleY*target.scale,target.groundY);near(draw[5]+p.anchorX*target.scale,w/2);
  assert.equal(ctx.filter,'none');assert.equal(ctx.imageSmoothingQuality,'high');
  const b=h.hegelBuffer(w,ht,dpr);assert.ok(b.width>=w*dpr&&b.height>=ht*dpr);
 }
});
test('arena renders complete new poses on both sides, without the old head compositor',async()=>{
 const renderer=await readFile(new URL('../app/hegel-sprite.tsx',import.meta.url),'utf8'),page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
 assert.doesNotMatch(renderer,/paintHegelIdentity|hegelNeck|HEGEL_BUST|hegel-spritesheet-hq/);
 assert.match(renderer,/hegelPose\(state.current.action/);
 assert.match(page,/selectedFighter === "hegel" && <HegelSprite action=\{playerAction\}/);
 assert.match(page,/opponentFighter === "hegel" && <HegelSprite action=\{enemyAction\}/);
});
