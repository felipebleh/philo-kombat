import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString("base64")}`;
const shared = compile(await readFile(new URL("../app/sprite-frames.ts", import.meta.url), "utf8"));
const animation = (await readFile(new URL("../app/averroes-animation.ts", import.meta.url), "utf8")).replace('"./sprite-frames"', JSON.stringify(shared));
const { AVERROES_SHEET, AVERROES_FLOOR, averroesFrame, averroesFrameRect, prepareAverroesPixels, averroesPosture, averroesTextureBounds, hidpiBuffer, paintAverroes } = await import(compile(animation));
const {data:sheet,info} = await sharp(new URL("../public/game/averroes-spritesheet-hq.webp", import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
function frame(row,column,source=sheet,dimensions=info) {
  const rect = averroesFrameRect(dimensions.width,dimensions.height,column,row);
  const data = new Uint8ClampedArray(rect.cellWidth*rect.cellHeight*4);
  for(let y=0;y<rect.height;y++) {
    const start=((rect.sy+y)*dimensions.width+rect.sx)*4;
    data.set(source.subarray(start,start+rect.width*4),((y+rect.inset)*rect.cellWidth+rect.inset)*4);
  }
  return {data,width:rect.cellWidth,height:rect.cellHeight};
}

test("real extended kick frames lose the detached line but keep the entire supporting shoe",()=>{
  for(const column of [3,4]) {
    const {data,width,height}=frame(3,column), original=data.slice();
    let nativeBottom=0,shoePixels=0,residuePixels=0;
    for(let y=0;y<380;y++) for(let x=0;x<width;x++) if(original[(y*width+x)*4+3]>100) nativeBottom=Math.max(nativeBottom,y+1);
    for(let y=390;y<405;y++) for(let x=170;x<210;x++) if(original[(y*width+x)*4+3]>8) residuePixels++;
    assert.ok(residuePixels>0,"fixture contains the reported residue");
    const cleaned=prepareAverroesPixels(data,width,height,3), offset=405-nativeBottom;
    for(let y=355;y<nativeBottom;y++) for(let x=0;x<width;x++) {
      const p=(y*width+x)*4;
      if(original[p+3]>200) {
        assert.deepEqual(cleaned.slice(((y+offset)*width+x)*4,((y+offset)*width+x)*4+4),original.slice(p,p+4));
        shoePixels++;
      }
    }
    assert.ok(shoePixels>20);
    for(let y=406;y<height;y++) for(let x=0;x<width;x++) assert.ok(cleaned[(y*width+x)*4+3]<=100,"no line below the planted shoe");
  }
});

test("all 36 active HQ poses share a stable floor and cache only occupied texture pixels",async()=>{
  const {data:active,info:activeInfo}=await sharp(new URL(`../public${AVERROES_SHEET}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.ok(activeInfo.width/6>=768 && activeInfo.height/6>=768);
  let cachedPixels=0;
  for(let row=0;row<6;row++) for(let column=0;column<6;column++) {
    const {data,width,height}=frame(row,column,active,activeInfo),cleaned=prepareAverroesPixels(data,width,height,row);
    let bottom=0,opaque=0;
    for(let p=0;p<width*height;p++) if(cleaned[p*4+3]>100) {bottom=Math.max(bottom,Math.floor(p/width)+1);opaque++;}
    assert.equal(bottom,Math.round(height*AVERROES_FLOOR),`pose ${row}:${column}`);
    assert.ok(opaque>1000);
    const crop=averroesFrameRect(activeInfo.width,activeInfo.height,column,row);
    assert.equal(crop.inset,row===2||row===3?3:0);
    assert.ok(crop.sx+crop.width<=(column+1)*width && crop.sy+crop.height<=(row+1)*height);
    const bounds=averroesTextureBounds(cleaned,width,height);
    assert.ok(bounds.x>=0 && bounds.y>=0 && bounds.x+bounds.width<=width && bounds.y+bounds.height<=height);
    cachedPixels+=bounds.width*bounds.height;
  }
  assert.ok(cachedPixels<activeInfo.width*activeInfo.height*.8,"transparent margins consume no cache texture memory");
});

test("HiDPI redraws use logical CSS coordinates and reset the transform at each DPR",()=>{
  for(const dpr of [1,1.25,2,3]) {
    assert.deepEqual(hidpiBuffer(400,500,dpr),{width:400*dpr,height:500*dpr,dpr});
    const calls=[],frame={};
    const ctx={filter:"none",setTransform:(...args)=>calls.push(["transform",...args]),clearRect:(...args)=>calls.push(["clear",...args]),drawImage:(...args)=>calls.push(["image",...args])};
    paintAverroes(ctx,frame,400,500,dpr);paintAverroes(ctx,frame,400,500,dpr);
    assert.deepEqual(calls.filter(c=>c[0]==="transform"),Array(2).fill(["transform",dpr,0,0,dpr,0,0]));
    assert.deepEqual(calls.find(c=>c[0]==="image"),["image",frame,0,0,400,500]);
    assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,"high");
    assert.match(ctx.filter,/contrast\(1\.12\).*saturate\(1\.08\).*drop-shadow/);
  }
  assert.equal(hidpiBuffer(400,500,NaN).dpr,1);
  const drawCalls=[];
  const ctx={filter:"none",setTransform(){},clearRect(){},drawImage:(...args)=>drawCalls.push(args)};
  const texture={};
  paintAverroes(ctx,texture,400,500,2,{x:100,y:40,width:200,height:300,cellWidth:800,cellHeight:1000});
  assert.deepEqual(drawCalls,[[texture,50,20,100,150]],"cropped texture keeps its full-cell registration at any display size");
});

test("shadow broadens 15% for strikes, shrinks with jump height and returns on landing",()=>{
  const idle=averroesPosture("idle",0),peak=averroesPosture("jump",357.5);
  for(const action of ["attack-punch","attack-kick","attack-combo"]) assert.equal(averroesPosture(action,200).shadowWidth,idle.shadowWidth*1.15);
  assert.equal(peak.lift,.32);
  assert.equal(peak.shadowWidth,.55);assert.equal(peak.shadowHeight,.65);
  assert.ok(Math.abs(peak.shadowOpacity-.45)<1e-9);
  const rising=averroesPosture("jump",200),higher=averroesPosture("jump",300);
  assert.ok(higher.lift>rising.lift && higher.shadowWidth<rising.shadowWidth && higher.shadowOpacity<rising.shadowOpacity);
  assert.deepEqual(averroesPosture("jump",650),idle);
});

test("existing attack, special, victory and walk frame order is preserved",()=>{
  assert.deepEqual(averroesFrame("attack-punch",220),{row:2,column:2});
  assert.deepEqual(averroesFrame("attack-kick",350),{row:3,column:3});
  assert.deepEqual(averroesFrame("attack-combo",560),{row:3,column:3});
  assert.deepEqual(averroesFrame("special-agent-intellect",1180),{row:4,column:5});
  assert.deepEqual(averroesFrame("special-great-commentator",1480),{row:5,column:3});
  assert.deepEqual(averroesFrame("advance",200),{row:1,column:3});
  assert.deepEqual(averroesFrame("victory",0),{row:5,column:4});
  assert.deepEqual(averroesFrame("knocked-out",0),{row:5,column:5});
});
