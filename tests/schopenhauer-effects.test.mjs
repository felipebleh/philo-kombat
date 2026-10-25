import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const js=ts.transpileModule(await readFile(new URL('../app/schopenhauer-motion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {caneTrailPose,sufferingPendulumPose,SCHOPENHAUER_FLASH_ALPHA}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('cane trails move through a curve, fade on recovery and have no idle, kick or hurt artifacts',()=>{
 for(const action of ['attack-punch','attack-combo']){
  const a=caneTrailPose(action,140),b=caneTrailPose(action,210);assert.notEqual(a.angle,b.angle);assert.ok(a.alpha>0&&b.alpha>0);
  assert.equal(caneTrailPose(action,900),null);
 }
 assert.ok(caneTrailPose('attack-combo',580));for(const a of ['idle','hit','attack-kick'])assert.equal(caneTrailPose(a,220),null);
 assert.ok(SCHOPENHAUER_FLASH_ALPHA>0&&SCHOPENHAUER_FLASH_ALPHA<=.3);
});
test('giant pendulum swings both ways then reaches either target on the actual damage beat at different aspect ratios',()=>{
 for(const [w,h]of [[1200,600],[390,520],[760,450]])for(const target of [18,30,55,80]){
  assert.ok(sufferingPendulumPose(0,target,w,h).angle<0);assert.ok(sufferingPendulumPose(380,target,w,h).angle>0);assert.ok(sufferingPendulumPose(800,target,w,h).angle<0);
  const p=sufferingPendulumPose(1480,target,w,h);assert.ok(Math.abs(p.x-w*target/100)<1e-6);assert.ok(p.y>h*.25&&p.y<h*.85);
  assert.equal(sufferingPendulumPose(1850,target,w,h).opacity,0);
 }
});
