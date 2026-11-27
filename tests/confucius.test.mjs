import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
import sharp from 'sharp';
const js=ts.transpileModule(await readFile(new URL('../app/confucius-motion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {confuciusFrame,confuciusDrawRect,confuciusDensity,confuciusLunge}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const frames=JSON.parse(await readFile(new URL('../app/confucius-frame-data.json',import.meta.url),'utf8'));
test('all 36 original poses remain reachable and walking plays all six frames',()=>{
 const seen=new Set();for(const [action,duration,count] of [['idle',1000,6],['advance',640,6],['retreat',640,6],['attack-punch',520,6],['attack-kick',620,6],['attack-combo',780,12],['hit',440,6],['special-ren',1100,3],['special-li',1450,3]]){const local=new Set();for(let t=0;t<duration;t++){const f=confuciusFrame(action,t),key=`${f.row}:${f.column}`;seen.add(key);local.add(key);}assert.equal(local.size,count,action);}assert.equal(seen.size,36);
 for(let t=0;t<640;t++)assert.equal(confuciusFrame('retreat',t).column,5-confuciusFrame('advance',t).column);
});
test('every cleaned source frame fits and shares Felipe ground and standing height',async()=>{
 assert.equal(frames.length,36);const meta=await sharp(await readFile(new URL('../public/game/confucio-spritesheet-clean-v2.webp',import.meta.url))).metadata();assert.equal(meta.width,5016);assert.equal(meta.height,5016);assert.equal(meta.hasAlpha,true);
 for(const art of frames){assert.ok(art.width>50&&art.height>100);assert.ok(art.x+art.width<=meta.width&&art.y+art.height<=meta.height);const r=confuciusDrawRect(1800,1536,art,frames[0].height);assert.ok(r.x>=0&&r.y>=0);assert.ok(r.x+r.width<=1800.001);assert.equal(Math.round(r.y+r.height),1521);}
 const standing=confuciusDrawRect(1800,1536,frames[0],frames[0].height);assert.ok(Math.abs(standing.height-1536*.92)<.001);assert.deepEqual([1,2,2.2,5].map(confuciusDensity),[2,2,3,4]);assert.equal(confuciusLunge(20,60,1,1000,18),21);assert.equal(confuciusLunge(60,20,-1,1000,18),59);assert.equal(confuciusLunge(20,38,1,1000,18),20);
});
