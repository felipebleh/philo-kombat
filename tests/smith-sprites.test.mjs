import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import fs from 'node:fs';
test('all Adam Smith animation frames are present, detailed and transparent',async()=>{
 const data=JSON.parse(fs.readFileSync('app/smith-frame-data.json','utf8'));assert.equal(data.length,36);
 for(let i=0;i<36;i++){const file=`public/game/adam-smith-hd-v1/frame-${String(i).padStart(2,'0')}.webp`;const m=await sharp(file).metadata();assert.ok(m.width>500&&m.height>400,`frame ${i} resolution`);assert.ok(m.hasAlpha,`frame ${i} transparency`);const {data:p}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});let magenta=0,visible=0;for(let j=0;j<p.length;j+=4){if(p[j+3]>100){visible++;if(p[j]>150&&p[j+1]<100&&p[j+2]>150)magenta++;}}assert.ok(visible>10000,`frame ${i} must be visible`);assert.ok(magenta/visible<0.001,`frame ${i} halo`);}
 const superImage=await sharp('public/game/adam-smith-hd-v1/super.webp').metadata();assert.ok(superImage.hasAlpha&&superImage.height>1000);
});
