import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const js=ts.transpileModule(await readFile(new URL('../app/freud-motion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {FREUD_FLASH_ALPHA,softHitflashMatrix,freudCigarTip,freudSmokeParticle,freudDeathWavePose,combatMovementRate,freudShadowPose}=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('white hitflash blends at 35% and preserves the full alpha silhouette and facial contrast',()=>{
 assert.equal(FREUD_FLASH_ALPHA,.35);const m=softHitflashMatrix().split(' ').map(Number);
 for(const rgb of [[0,0,0],[40,50,60],[220,225,230]])for(const alpha of [0,.3,1]){
  const input=[...rgb.map(x=>x/255),alpha,1];const out=Array.from({length:4},(_,i)=>input.reduce((v,x,j)=>v+x*m[i*5+j],0));
  assert.equal(out[3],alpha);for(let i=0;i<3;i++)assert.ok(Math.abs(out[i]-(input[i]*.65+.35))<1e-12);
 }
});
test('smoke stays subtle, rises from the actual cigar and emits short ember trails only on the punch',()=>{
 assert.deepEqual(freudCigarTip('attack-punch'),{x:.454,y:.276});
 const a=freudSmokeParticle(0,200,'idle'),b=freudSmokeParticle(0,900,'idle');assert.ok(b.y<a.y);
 for(let t=0;t<1700;t+=17)for(let i=0;i<11;i++){
  const p=freudSmokeParticle(i,t,'idle');assert.ok(p.alpha>=0&&p.alpha<=.13);assert.equal(p.ember,false);
 }
 assert.ok(freudSmokeParticle(1,220,'attack-punch').ember);assert.equal(freudSmokeParticle(1,500,'attack-punch').ember,false);
 for(const action of ['guard','advance','hit','attack-kick'])assert.equal(freudCigarTip(action),null);
});
test('both energy strands travel to either opponent exactly on the damage beat and fade on recovery',()=>{
 for(const [from,to] of [[20,70],[75,25]]){
  const a=freudDeathWavePose(220,from,to),b=freudDeathWavePose(850,from,to),hit=freudDeathWavePose(1480,from,to);
  assert.equal(a.position,from);assert.ok(Math.abs(b.position-from)>0&&Math.abs(b.position-from)<Math.abs(to-from));
  assert.equal(hit.position,to);assert.equal(freudDeathWavePose(1850,from,to).opacity,0);
 }
});
test('slows do not stack below half speed and the floor shadow contracts during a jump',()=>{
 assert.equal(combatMovementRate(100,500,500),.5);assert.equal(combatMovementRate(500,500,500),1);
 const ground=freudShadowPose('idle',0),air=freudShadowPose('jump',325);assert.ok(air.width<ground.width&&air.opacity<ground.opacity);
 assert.equal(freudShadowPose('attack-punch',220).width,1.15);
});
