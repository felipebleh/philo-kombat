import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';
const frames=JSON.parse(await readFile(new URL('../app/confucius-frame-data.json',import.meta.url),'utf8'));
const atlas=new URL('../public/game/confucio-spritesheet-clean-v2.webp',import.meta.url);
test('all 36 high-definition poses retain their registered silhouettes',async()=>{
 const {data:sheet,info}=await sharp(await readFile(atlas)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(const [index,a] of frames.entries()){
  const file=new URL(`../public/game/confucio-hd-v3/frame-${String(index).padStart(2,'0')}.webp`,import.meta.url);
  const image=sharp(await readFile(file)),meta=await image.metadata();
  assert.equal(meta.width,a.width*2,`width ${index}`);assert.equal(meta.height,a.height*2,`height ${index}`);assert.ok(meta.hasAlpha,`transparency ${index}`);
  const before=await sharp(sheet,{raw:info}).extract({left:a.x,top:a.y,width:a.width,height:a.height}).extractChannel(3).raw().toBuffer();
  const after=await image.clone().resize(a.width,a.height).extractChannel(3).raw().toBuffer();
  let difference=0;for(let i=0;i<before.length;i++)difference+=Math.abs(before[i]-after[i]);
  assert.ok(difference/before.length<.3,`pose ${index} has a changed silhouette`);
 }
});
test('the renderer selects separate HD frames and retains the original atlas fallback',async()=>{
 const renderer=await readFile(new URL('../app/confucius-sprite.tsx',import.meta.url),'utf8');
 assert.match(renderer,/confucio-hd-v3\/frame-/);assert.match(renderer,/confucio-spritesheet-clean-v2/);assert.match(renderer,/confuciusFrame\(action/);assert.match(renderer,/hd\?"hd":"atlas"/);
 const preloads=await readFile(new URL('../app/fighter-assets.ts',import.meta.url),'utf8');assert.match(preloads,/Array\.from\(\{length:36\}/);
});
