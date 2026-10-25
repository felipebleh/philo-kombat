import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import sharp from 'sharp';

const css = await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
const sheet = await sharp(new URL('../public/game/hobbes-spritesheet-hq-v4.webp',import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const cell=sheet.info.width/6;
function visibleHeight(col,row) {
  let top=cell,bottom=0;
  for(let y=0;y<cell;y++) for(let x=0;x<cell;x++) if(sheet.data[((row*cell+y)*sheet.info.width+col*cell+x)*4+3]>128) {top=Math.min(top,y);bottom=Math.max(bottom,y);}
  return bottom-top;
}
test('every Hobbes special frame uses a full-height standing body, never a falling sprite',()=>{
  const idle=visibleHeight(0,0);
  for(const name of ['hobbes-wolf-sprite','hobbes-leviathan-sprite','hobbes-pact-sprite']) {
    const block=css.slice(css.indexOf(`@keyframes ${name}`)).split('\n}\n')[0];
    const positions=[...block.matchAll(/background-position:\s*(\d+)%\s*(\d+)%/g)];
    assert.ok(positions.length>0);
    for(const [,x,y] of positions) assert.ok(visibleHeight(Number(x)/20,Number(y)/20)>=idle*.9,`${name} frame ${x},${y} must stand`);
  }
});
test('Hobbes retains his arena scale and foot baseline and never ships the reference JPG',async()=>{
  const root=css.slice(css.indexOf('.fighter-hobbes {')).split('}')[0];
  assert.match(root,/bottom: 3\.2%/);assert.match(root,/height: 79%/);assert.match(root,/width: clamp\(180px, 23vw, 344px\)/);
  const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
  const effect=await readFile(new URL('../app/hobbes-effects.tsx',import.meta.url),'utf8');
  assert.doesNotMatch(page+css+effect,/leviata\.jpg/i);
  assert.match(page,/<HobbesSovereign origin=\{playerPosition\} target=\{enemyPosition\}/);
  assert.match(page,/<HobbesSovereign origin=\{enemyPosition\} target=\{playerPosition\} enemy/);
});
