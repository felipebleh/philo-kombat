import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(ts.transpileModule(await readFile(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString('base64'));
const {amenemopeFrame}=await load('../app/sprite-frames.ts');
const {sharpenAmenemope,amenemopeLunge,amenemopeDensity}=await load('../app/amenemope-motion.ts');
test('all original walking and attack cells are visited, including the last column',()=>{
 for(const [action,duration,count] of [['advance',330,6],['retreat',330,6],['attack-punch',520,6],['attack-kick',620,6],['attack-combo',780,12]]){
  const cells=new Set();for(let t=0;t<duration;t++) {const f=amenemopeFrame(action,t);cells.add(`${f.row}:${f.column}`);}
  assert.equal(cells.size,count,action);
 }
});
test('sharpening ignores transparent black and keeps fractional edge coverage',()=>{
 const data=new Uint8ClampedArray(3*3*4);data.set([240,190,90,255],16);data.set([240,190,90,128],12);
 sharpenAmenemope(data,3,3);assert.deepEqual([...data.slice(16,19)],[240,190,90]);assert.ok(data[15]>0&&data[15]<255);assert.equal(data[3],0);
});
test('ten-pixel lunge respects the body gap and HiDPI stays bounded',()=>{
 assert.equal(amenemopeLunge(20,50,1,1000,18),21);assert.equal(amenemopeLunge(50,20,-1,1000,18),49);
 assert.equal(amenemopeLunge(20,38,1,1000,18),20);assert.equal(amenemopeLunge(38,20,-1,1000,18),38);
 for(const [dpr,expected] of [[1,2],[2.2,3],[5,4]])assert.equal(amenemopeDensity(dpr),expected);
});
