import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import ts from'typescript';
const js=ts.transpileModule(await readFile(new URL('../app/foucault-motion.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;const m=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
test('Foucault walks start on a real step, alternate poses and retain planted soles',()=>{
 assert.equal(m.foucaultMotionPose('advance',0),2);assert.equal(m.foucaultMotionPose('retreat',0),3);assert.equal(m.foucaultMotionPose('advance',330),3);assert.equal(m.foucaultMotionPose('retreat',330),2);
 for(const action of ['advance','retreat','guard','guard-hit','special-panopticon','special-biopower'])for(let t=0;t<2000;t+=47){assert.deepEqual(m.foucaultMotionVertex(.5,1,t,action),[.5,1]);const index=m.foucaultMotionPose(action,t);assert.ok(index>=0&&index<m.FOUCAULT_MOTION_ART.length);}
});
test('Foucault dedicated guard replaces base art and has a real knee-bent pose',()=>{assert.equal(m.foucaultMotionPose('guard',69),0);assert.equal(m.foucaultMotionPose('guard',70),1);assert.ok(m.FOUCAULT_MOTION_ART[1].includes('guard-v2'));});
