import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString("base64")}`;
const shared = compile(await readFile(new URL("../app/sprite-frames.ts", import.meta.url), "utf8"));
const animation = (await readFile(new URL("../app/machiavelli-animation.ts", import.meta.url), "utf8")).replace('"./sprite-frames"', JSON.stringify(shared));
const { MACHIAVELLI_SHEET, MACHIAVELLI_FLOOR, MACHIAVELLI_FILTER, machiavelliFrame, machiavelliFrameRect, sharpenMachiavelli, prepareMachiavelliPixels, machiavelliTextureBounds, machiavelliBuffer, paintMachiavelli, machiavelliPosture } = await import(compile(animation));
const controls = await import(compile(await readFile(new URL("../app/combat-controls.ts",import.meta.url),"utf8")));
// Keep the legacy artwork as the regression fixture for matte/shoe protection.
const {data:sheet,info} = await sharp(new URL("../public/game/maquiavel-spritesheet.webp",import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});

test("real unsharp masking sharpens opaque detail without transparent-color contamination",()=>{
  const width=9,height=9,raw=new Uint8ClampedArray(width*height*4);
  const set=(x,y,rgba)=>raw.set(rgba,(y*width+x)*4);
  for(let y=2;y<7;y++)for(let x=2;x<7;x++)set(x,y,[70,45,35,255]);
  set(4,4,[125,80,60,255]);set(1,4,[220,230,5,20]);
  const withMagenta=raw.slice();for(let p=0;p<width*height;p++)if(!withMagenta[p*4+3])withMagenta.set([255,0,255,0],p*4);
  const clean=sharpenMachiavelli(raw.slice(),width,height),other=sharpenMachiavelli(withMagenta,width,height);
  assert.ok(clean[(4*width+4)*4]>125,"fine detail is amplified by actual pixel convolution");
  assert.equal(clean[(4*width+1)*4+3],0,"low-alpha outer matte is choked");
  for(let p=0;p<width*height;p++)if(raw[p*4+3]===255){
    assert.equal(clean[p*4+3],255);assert.deepEqual(clean.slice(p*4,p*4+4),other.slice(p*4,p*4+4));
  }
});
test("outer yellow-green fringe is neutralized while red cap, skin and brown shoe interiors survive",()=>{
  const w=14,h=14,raw=new Uint8ClampedArray(w*h*4),set=(x,y,c)=>raw.set(c,(y*w+x)*4);
  for(let y=3;y<11;y++)for(let x=4;x<11;x++)set(x,y,[35,20,19,255]);
  set(3,7,[180,190,45,180]);set(6,5,[120,22,28,255]);set(6,8,[170,105,65,255]);
  const out=sharpenMachiavelli(raw.slice(),w,h),at=(x,y)=>Array.from(out.slice((y*w+x)*4,(y*w+x)*4+4));
  assert.deepEqual(at(3,7),[35,20,19,180]);
  assert.equal(at(6,5)[3],255);assert.ok(at(6,5)[0]>at(6,5)[1]*3);
  assert.equal(at(6,8)[3],255);assert.ok(at(6,8)[0]>at(6,8)[1]);
});

test("all 36 active HQ poses preserve framing and cache native detail without transparent margins",async()=>{
  const {data:active,info:dimensions}=await sharp(new URL(`../public${MACHIAVELLI_SHEET}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.ok(dimensions.width/6>=768 && dimensions.height/6>=768);
  let cachedPixels=0;
  for(let row=0;row<6;row++)for(let column=0;column<6;column++){
    const[sx,sy,w,h]=machiavelliFrameRect(dimensions.width,dimensions.height,column,row),raw=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++)raw.set(active.subarray(((sy+y)*dimensions.width+sx)*4,((sy+y)*dimensions.width+sx+w)*4),y*w*4);
    const clean=prepareMachiavelliPixels(raw.slice(),w,h);let top=h,bottom=0,opaque=0;
    for(let p=0;p<w*h;p++)if(clean[p*4+3]>100){top=Math.min(top,Math.floor(p/w));bottom=Math.max(bottom,Math.floor(p/w)+1);opaque++;}
    assert.equal(bottom,Math.round(h*MACHIAVELLI_FLOOR),`pose ${row}:${column}`);assert.ok(opaque>1000);
    const[ox,oy,ow,oh]=machiavelliFrameRect(info.width,info.height,column,row);let oldTop=oh,oldBottom=0;
    for(let y=0;y<oh;y++)for(let x=0;x<ow;x++)if(sheet[((oy+y)*info.width+ox+x)*4+3]>100){oldTop=Math.min(oldTop,y);oldBottom=Math.max(oldBottom,y+1);}
    assert.ok(Math.abs((bottom-top)-(oldBottom-oldTop)*h/oh)<=2,`native pose height ${row}:${column}`);
    const bounds=machiavelliTextureBounds(clean,w,h);cachedPixels+=bounds.width*bounds.height;
    assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=w&&bounds.y+bounds.height<=h);
    let footLeft=w,footRight=0;
    for(let y=bottom-Math.max(1,Math.round((bottom-top)*.08));y<bottom;y++)for(let x=0;x<w;x++)if(clean[(y*w+x)*4+3]>100){footLeft=Math.min(footLeft,x);footRight=Math.max(footRight,x+1);}
    assert.ok(Math.abs((footLeft+footRight)/2-w/2)<=3,`stable support-foot anchor ${row}:${column}`);
  }
  assert.ok(cachedPixels<dimensions.width*dimensions.height*.8);
});

test("standing height is 92% of Felipe and both shoe lines coincide with the shadow center",async()=>{
  const css=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");
  const felipe=await readFile(new URL("../app/felipe.css",import.meta.url),"utf8");
  const machiavelliRoot=css.match(/\.fighter\.fighter-machiavelli\s*\{([\s\S]*?)\}/)[1];
  const felipeRoot=felipe.match(/\.fighter-felipe\s*\{([\s\S]*?)\}/)[1];
  const height=s=>Number(s.match(/height:\s*([\d.]+)%/)[1])/100;
  const machiavelliHeight=height(machiavelliRoot),felipeHeight=height(felipeRoot);
  const {data:idle,info:idleInfo}=await sharp(new URL(`../public${MACHIAVELLI_SHEET}`,import.meta.url).pathname).extract({left:0,top:0,width:768,height:768}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let top=idleInfo.height,bottom=0;
  for(let p=0;p<idleInfo.width*idleInfo.height;p++)if(idle[p*4+3]>100){top=Math.min(top,Math.floor(p/idleInfo.width));bottom=Math.max(bottom,Math.floor(p/idleInfo.width)+1);}
  const ratio=machiavelliHeight*controls.MACHIAVELLI_SCALE*(bottom-top)/idleInfo.height/(felipeHeight*.92);
  assert.ok(Math.abs(ratio-.92)<.002);
  assert.equal(machiavelliRoot.match(/bottom:\s*([\d.]+)%/)[1],felipeRoot.match(/bottom:\s*([\d.]+)%/)[1]);
  const gap=Number(machiavelliRoot.match(/--machiavelli-floor-gap:\s*([\d.]+)%/)[1])/100;
  assert.ok(Math.abs(gap*machiavelliHeight-felipeHeight*15/1536)<1e-9);
  assert.match(css,/bottom: calc\(var\(--machiavelli-floor-gap\) - 3\.5%\)/);
  for(const name of ["machiavelli-punch-body","machiavelli-kick-body","machiavelli-combo-body","machiavelli-command-prince","machiavelli-seize-fortune"]) {
    const keyframes=css.slice(css.indexOf(`@keyframes ${name}`)).split("\n}\n")[0];
    assert.doesNotMatch(keyframes,/translateY/);
  }
});

test("HiDPI buffers and redraws reset transforms and apply the requested high-quality filter",()=>{
  for(const dpr of [1,1.25,2,3]) {
    const density=Math.max(2,dpr);
    assert.deepEqual(machiavelliBuffer(400,500,dpr),{width:Math.round(400*density),height:Math.round(500*density),dpr:density});
    const calls=[],ctx={filter:"none",setTransform:(...a)=>calls.push(a),clearRect:(...a)=>calls.push(a),drawImage:(...a)=>calls.push(a)};
    const frame={};paintMachiavelli(ctx,frame,400,500,dpr);paintMachiavelli(ctx,frame,400,500,dpr);
    assert.deepEqual(calls[0],[dpr,0,0,dpr,0,0]);assert.deepEqual(calls[3],calls[0]);
    assert.deepEqual(calls[1],[0,0,400,500]);assert.deepEqual(calls[2],[frame,0,0,400,500]);
    assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,"high");assert.equal(ctx.filter,MACHIAVELLI_FILTER);
    assert.match(ctx.filter,/contrast\(1\.16\).*saturate\(1\.10\).*rgba\(0,0,0,0\.75\)/);
  }
  const calls=[],frame={},ctx={filter:"none",setTransform(){},clearRect(){},drawImage:(...a)=>calls.push(a)};
  paintMachiavelli(ctx,frame,400,500,2,{x:100,y:40,width:200,height:300,cellWidth:800,cellHeight:1000});
  assert.deepEqual(calls,[[frame,50,20,100,150]],"texture trimming retains full-cell destination coordinates");
});

test("original action frames and grounded dynamic shadow are preserved",()=>{
  assert.deepEqual(machiavelliFrame("attack-combo",600),{row:3,column:4});
  assert.deepEqual(machiavelliFrame("special-prince",800),{row:5,column:1});
  assert.deepEqual(machiavelliFrame("special-virtu-fortuna",1700),{row:5,column:5});
  assert.deepEqual(machiavelliFrame("victory",0),{row:5,column:5});
  assert.deepEqual(machiavelliFrame("knocked-out",0),{row:4,column:3});
  assert.deepEqual(machiavelliFrame("guard",0),{row:4,column:2});
  assert.deepEqual(machiavelliFrame("advance",198),{row:1,column:3});
  assert.equal(machiavelliPosture("attack-kick",300).shadowWidth,1.15);
  const peak=machiavelliPosture("jump",650*.55),landed=machiavelliPosture("jump",650);
  assert.equal(peak.lift,.32);assert.equal(peak.shadowWidth,.55);assert.equal(peak.shadowHeight,.65);assert.ok(Math.abs(peak.shadowOpacity-.45)<1e-12);
  assert.equal(landed.lift,0);assert.equal(landed.shadowWidth,1);assert.equal(landed.shadowOpacity,1);
});

test("pre-fight, winner and loser presentations use complete art and scoped containment",async()=>{
  const page=await readFile(new URL("../app/page.tsx",import.meta.url),"utf8");
  const css=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");
  const versus=await readFile(new URL("../app/versus-selection.css",import.meta.url),"utf8");
  assert.match(page,/fighter === "machiavelli"\s*\? "\/game\/maquiavel-fullbody-hq-v2.webp"/);
  assert.match(versus,/\.versus-machiavelli \.versus-panel-art.*overflow: visible/);
  const ending=css.match(/\.ending-fighter\.ending-machiavelli\s*\{([\s\S]*?)\}/)[1];
  assert.match(ending,/bottom: 4%/);assert.match(ending,/height: 78%/);assert.match(ending,/overflow: visible/);
  assert.match(css,/\.ending-fighter\.ending-machiavelli img\s*\{[^}]*object-fit: contain/);
  const portrait=await sharp(new URL("../public/game/maquiavel-fullbody-hq-v2.webp",import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const {data,info}=portrait;assert.ok(info.height>info.width);
  let top=info.height,bottom=0,left=info.width,right=0;
  for(let p=0;p<info.width*info.height;p++)if(data[p*4+3]>100){const x=p%info.width,y=Math.floor(p/info.width);top=Math.min(top,y);bottom=Math.max(bottom,y+1);left=Math.min(left,x);right=Math.max(right,x+1);}
  assert.ok(top>=info.height*.02&&bottom<=info.height*.98&&left>0&&right<info.width,"clear cap and shoe padding");
  let redCap=0,brownShoes=0;
  for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){
    const p=(y*info.width+x)*4,r=data[p],g=data[p+1],b=data[p+2];if(data[p+3]<200)continue;
    if(y<top+(bottom-top)*.12&&r>g*1.4&&r>b*1.4)redCap++;
    if(y>bottom-(bottom-top)*.08&&r>g*1.1&&g>b*1.1)brownShoes++;
  }
  assert.ok(redCap>100&&brownShoes>100,"full costume from red cap to brown shoes");
});
