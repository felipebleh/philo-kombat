import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
const text=await readFile(new URL('../app/darwin-motion.ts',import.meta.url),'utf8');
const js=ts.transpileModule(text,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {darwinMotionVertex:v,darwinMotionPose:pose,darwinMotionActive:active,DARWIN_MOTION_ART:art}=await import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
const actions=['idle','guard','guard-hit','attack-punch','attack-kick','attack-combo','special-natural-selection','special-tree-of-life'];
test('the approved walk is excluded and every new pose keeps its HQ source',()=>{
 assert.equal(active('advance'),false);assert.equal(active('retreat'),false);
 assert.deepEqual(v(.3,.5,300,'advance'),[.3,.5]);
 assert.ok(art.every(src=>src.includes('-hq.webp')));
 assert.equal(pose('attack-combo',289),1);assert.equal(pose('attack-combo',290),2);assert.equal(pose('attack-combo',580),3);
});
test('grounded soles and rigid facial proportions survive every new action',()=>{
 for(const action of actions)for(let t=0;t<=3000;t+=50){
  for(const x of [.16,.24,.75,.84])assert.deepEqual(v(x,.91,t,action),[x,.91]);
  const a=v(.46,.14,t,action),b=v(.58,.20,t,action);
  assert.ok(Math.abs((b[0]-a[0])-.12)<1e-10);assert.ok(Math.abs((b[1]-a[1])-.06)<1e-10);
 }
});
test('guard raises the forward hand while settling the knees, with visible idle and attack motion',()=>{
 const before=v(.80,.32,0,'guard'),guard=v(.80,.32,180,'guard');
 assert.ok(guard[1]<before[1]-.025);
 assert.ok(v(.48,.42,180,'guard')[1]>.42);
 assert.ok(Math.hypot(...v(.78,.32,800,'idle').map((p,i)=>p-[.78,.32][i]))>.001);
 assert.notDeepEqual(v(.85,.32,0,'attack-punch'),v(.85,.32,210,'attack-punch'));
});
test('mesh remains continuous and never folds through guard, attacks or specials',()=>{
 for(const action of actions)for(let t=0;t<=2100;t+=70)for(let r=0;r<60;r++)for(let c=0;c<40;c++){
  const a=v(c/40,r/60,t,action),b=v((c+1)/40,r/60,t,action),d=v(c/40,(r+1)/60,t,action),e=v((c+1)/40,(r+1)/60,t,action);
  const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  assert.ok(area(a,b,d)>0,action+' '+t);assert.ok(area(b,e,d)>0,action+' '+t);
 }
});
