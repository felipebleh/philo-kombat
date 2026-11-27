import test from 'node:test';import assert from 'node:assert/strict';import{readFile}from'node:fs/promises';import ts from'typescript';
async function load(file){const js=ts.transpileModule(await readFile(new URL(file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));}
const m=await load('../app/deleuze-motion.ts'),e=await load('../app/deleuze-edge.ts'),g=await load('../app/combat-controls.ts');
test('supported walking begins on real lead steps in both directions and alternates poses',()=>{assert.equal(m.deleuzeMotionPose('advance',0),2);assert.equal(m.deleuzeMotionPose('retreat',0),3);assert.equal(m.deleuzeMotionPose('advance',340),3);assert.equal(m.deleuzeMotionPose('retreat',340),2);assert.equal(m.deleuzeMotionPose('guard',60),1);});
test('new Deleuze poses keep soles fixed, the head rigid, and valid art through every sequence',()=>{
 for(const action of ['advance','retreat','guard','guard-hit','special-rhizome','special-mille-plateaux'])for(let t=0;t<2400;t+=47){assert.deepEqual(m.deleuzeMotionVertex(.5,1,t,action),[.5,1]);const a=m.deleuzeMotionVertex(.4,.15,t,action),b=m.deleuzeMotionVertex(.6,.27,t,action);assert.ok(Math.abs(b[0]-a[0]-.2)<1e-9);assert.ok(Math.abs(b[1]-a[1]-.12)<1e-9);assert.ok(m.DELEUZE_MOTION_ART[m.deleuzeMotionPose(action,t)]);}
});
test('matte removal is restricted to red exterior contamination, preserving opaque cloth/crutch detail',()=>{
 const width=11,height=11,data=new Uint8ClampedArray(width*height*4);for(let y=1;y<10;y++)for(let x=1;x<10;x++)data.set([120,80,40,255],(y*width+x)*4);
 data.set([240,20,10,255],(5*width+1)*4);data.set([240,20,10,255],(5*width+5)*4);data.set([110,25,40,255],(3*width+1)*4);e.cleanDeleuzeEdge(data,width,height);
 assert.equal(data[(5*width+1)*4+3],0);assert.equal(data[(5*width+5)*4+3],255);assert.deepEqual([...data.slice((3*width+1)*4,(3*width+1)*4+4)],[110,25,40,255]);assert.deepEqual([...data.slice((7*width+1)*4,(7*width+1)*4+4)],[120,80,40,255]);
});
test('lowered Deleuze kick connects at crouch height within reach, rejects air and distant targets',()=>{
 for(const target of ['felipe','darwin','wittgenstein']){assert.equal(g.attackConnects(20,60,1,38,'caverna',false,{attacker:'deleuze',target,defenderCrouching:true}),true);assert.equal(g.attackConnects(20,75,1,38,'caverna',false,{attacker:'deleuze',target,defenderCrouching:true}),false);assert.equal(g.attackConnects(20,40,1,38,'caverna',true,{attacker:'deleuze',target,defenderCrouching:false}),false);}
});
