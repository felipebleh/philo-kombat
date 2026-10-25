import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import ts from 'typescript';
const code=ts.transpileModule(await readFile(new URL('../app/cyborg-motion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {cyborgPose,cyborgProjectilePose,CYBORG_HEIGHT}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
test('cyborg uses four real step poses and complete attack/defense/air/recovery silhouettes',async()=>{
 assert.equal(new Set([0,160,320,480].map(t=>cyborgPose('advance',t))).size,4);
 assert.equal(cyborgPose('advance',0),cyborgPose('retreat',480));
 assert.equal(cyborgPose('attack-punch',220),'punch');assert.equal(cyborgPose('attack-kick',310),'kick');
 assert.deepEqual([150,350,620].map(t=>cyborgPose('attack-combo',t)),['punch','hook','kick']);
 assert.equal(cyborgPose('guard',300),'guard');assert.equal(cyborgPose('jump',300),'jump');assert.equal(cyborgPose('knocked-out',500),'fallen');
 for(const pose of Object.keys(CYBORG_HEIGHT))await access(new URL(`../public/game/cyborg-v1/${pose}.webp`,import.meta.url));
});
test('the clone stands through casting and returns directly to idle on the original Felipe rhythm',()=>{
 for(const action of ['special-certainty','special-drone-swarm'])for(let t=0;t<1850;t+=10)assert.ok(!['hit','fallen','rise','guard'].includes(cyborgPose(action,t)));
 assert.equal(cyborgPose('special-certainty',1450),'idle');assert.equal(cyborgPose('special-drone-swarm',1850),'idle');
});
test('exclamation and all three drones reach either target on the actual damage beat',()=>{
 for(const [from,to]of [[20,70],[70,20]])for(const kind of ['certainty','swarm'])for(let i=0;i<(kind==='swarm'?3:1);i++){
  const at=kind==='swarm'?1480:1180,before=cyborgProjectilePose(kind,at-10,from,to,i),hit=cyborgProjectilePose(kind,at,from,to,i),after=cyborgProjectilePose(kind,at+301,from,to,i);
  assert.equal(before.exploding,false);assert.equal(before.visible,true);assert.equal(hit.x,to);assert.equal(hit.visible,false);assert.equal(hit.exploding,true);assert.equal(after.exploding,false);
 }
});
