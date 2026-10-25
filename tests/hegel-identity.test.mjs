import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import {readFile} from "node:fs/promises";
const module=async name=>{const js=ts.transpileModule(await readFile(new URL(`../app/${name}.ts`,import.meta.url),"utf8"),{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;return import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);};
const art=await module("hegel-identity"),anim=await module("hegel-animation"),spirit=await module("hegel-world-spirit");
test("jumping changes the sheet poses while the ground shadow shrinks and stays anchored",()=>{
 const ground=art.hegelPosture("idle",0),apex=art.hegelPosture("jump",325),kick=art.hegelPosture("attack-kick",310);
 assert.equal(ground.lift,0);assert.equal(apex.lift,.32);assert.ok(apex.shadowWidth<ground.shadowWidth&&apex.shadowOpacity<ground.shadowOpacity);
 assert.equal(kick.shadowWidth,1.15);assert.equal(kick.lift,0);
 assert.deepEqual(art.hegelPosture("jump",650),art.hegelPosture("jump",950,950));
});
test("horse rears then cycles actual gallop poses; both directions meet the target at the damage beat",()=>{
 assert.equal(spirit.worldSpiritPose(400,20,75,1).frame,0);
 assert.notEqual(spirit.worldSpiritPose(700,20,75,1).frame,spirit.worldSpiritPose(790,20,75,1).frame);
 assert.equal(spirit.worldSpiritPose(1480,20,75,1).position,68);
 assert.equal(spirit.worldSpiritPose(1480,75,20,-1).position,27);
 assert.ok(spirit.worldSpiritPose(1480,20,75,1).impact);assert.equal(spirit.worldSpiritPose(1850,20,75,1).opacity,0);
 for(const facing of [1,-1]){const origin=facing===1?20:75,target=facing===1?75:20;let last=origin-facing*6;for(let t=0;t<=1480;t+=20){const p=spirit.worldSpiritPose(t,origin,target,facing);assert.ok((p.position-last)*facing>=-1e-9);last=p.position;}}
});
