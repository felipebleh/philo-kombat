import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString("base64")}`;
const shared = compile(await readFile(new URL("../app/sprite-frames.ts", import.meta.url), "utf8"));
const animation = (await readFile(new URL("../app/thomas-animation.ts", import.meta.url), "utf8")).replace('"./sprite-frames"', JSON.stringify(shared));
const { THOMAS_SHEET, THOMAS_FLOOR, THOMAS_FILTER, thomasFrame, thomasFrameRect, defringeThomasCape, prepareThomasPixels, thomasTextureBounds, thomasBuffer, paintThomas, thomasPosture } = await import(compile(animation));
const controls = await import(compile(await readFile(new URL("../app/combat-controls.ts",import.meta.url),"utf8")));
// Keep the legacy artwork as the regression fixture for matte/shoe protection.
const {data:sheet,info} = await sharp(new URL("../public/game/tomas-spritesheet.webp",import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});

test("all 36 native poses keep their silhouette and shoe pixels at one floor without resampling",()=>{
  let fringeCorrections=0;
  for(let row=0;row<6;row++) for(let column=0;column<6;column++) {
    const [sx,sy,width,height]=thomasFrameRect(info.width,info.height,column,row);
    const original=new Uint8ClampedArray(width*height*4);
    for(let y=0;y<height;y++) original.set(sheet.subarray(((sy+y)*info.width+sx)*4,((sy+y)*info.width+sx+width)*4),y*width*4);
    let bottom=0,opaque=0;
    for(let p=0;p<width*height;p++)if(original[p*4+3]>100){bottom=Math.max(bottom,Math.floor(p/width)+1);opaque++;}
    const floor=Math.round(height*THOMAS_FLOOR),offset=floor-bottom;
    const clean=prepareThomasPixels(original.slice(),width,height);
    let newBottom=0,newOpaque=0;
    for(let p=0;p<width*height;p++)if(clean[p*4+3]>100){newBottom=Math.max(newBottom,Math.floor(p/width)+1);newOpaque++;}
    assert.equal(newBottom,floor,`pose ${row}:${column}`);
    assert.equal(newOpaque,opaque,`no clipped hand, habit or foot in ${row}:${column}`);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const p=(y*width+x)*4,q=((y+offset)*width+x)*4;
      if(!original[p+3])continue;
      assert.equal(clean[q+3],original[p+3]);
      if(y>=bottom-12)assert.deepEqual(clean.subarray(q,q+4),original.subarray(p,p+4),"shoe colors remain intact");
      if(clean[q]!==original[p]||clean[q+1]!==original[p+1]||clean[q+2]!==original[p+2])fringeCorrections++;
    }
  }
  assert.ok(fringeCorrections>0,"the real artwork's neutral cape fringe is corrected");
});

test("cape matte cleanup leaves white habit interiors, skin and alpha unchanged",()=>{
  const width=22,height=20,data=new Uint8ClampedArray(width*height*4);
  const set=(x,y,rgba)=>data.set(rgba,(y*width+x)*4),pixel=(x,y)=>Array.from(data.slice((y*width+x)*4,(y*width+x)*4+4));
  for(let y=4;y<15;y++)for(let x=4;x<11;x++)set(x,y,[35,33,31,255]);
  for(let y=4;y<15;y++)for(let x=14;x<20;x++)set(x,y,[245,238,217,255]);
  set(3,8,[210,210,210,180]);set(3,10,[190,125,75,255]);
  defringeThomasCape(data,width,height);
  assert.deepEqual(pixel(3,8),[35,33,31,180]);
  assert.deepEqual(pixel(3,10),[190,125,75,255]);
  assert.deepEqual(pixel(16,8),[245,238,217,255]);
  assert.deepEqual(pixel(5,8),[35,33,31,255]);
});

test("all 36 active HQ poses preserve framing and cache native detail without transparent margins",async()=>{
  const {data:active,info:dimensions}=await sharp(new URL(`../public${THOMAS_SHEET}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.ok(dimensions.width/6>=768 && dimensions.height/6>=768);
  let cachedPixels=0;
  for(let row=0;row<6;row++)for(let column=0;column<6;column++){
    const[sx,sy,w,h]=thomasFrameRect(dimensions.width,dimensions.height,column,row),raw=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++)raw.set(active.subarray(((sy+y)*dimensions.width+sx)*4,((sy+y)*dimensions.width+sx+w)*4),y*w*4);
    const clean=prepareThomasPixels(raw.slice(),w,h,false);let top=h,bottom=0,opaque=0;
    for(let p=0;p<w*h;p++)if(clean[p*4+3]>100){top=Math.min(top,Math.floor(p/w));bottom=Math.max(bottom,Math.floor(p/w)+1);opaque++;}
    assert.equal(bottom,Math.round(h*THOMAS_FLOOR),`pose ${row}:${column}`);assert.ok(opaque>1000);
    const[ox,oy,ow,oh]=thomasFrameRect(info.width,info.height,column,row);let oldTop=oh,oldBottom=0;
    for(let y=0;y<oh;y++)for(let x=0;x<ow;x++)if(sheet[((oy+y)*info.width+ox+x)*4+3]>100){oldTop=Math.min(oldTop,y);oldBottom=Math.max(oldBottom,y+1);}
    assert.ok(Math.abs((bottom-top)-(oldBottom-oldTop)*h/oh)<=2,`native pose height ${row}:${column}`);
    const bounds=thomasTextureBounds(clean,w,h);cachedPixels+=bounds.width*bounds.height;
    assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=w&&bounds.y+bounds.height<=h);
  }
  assert.ok(cachedPixels<dimensions.width*dimensions.height*.8);
});

test("standing height is 95% of Felipe and both shoe lines coincide with the shadow center",async()=>{
  const css=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");
  const felipe=await readFile(new URL("../app/felipe.css",import.meta.url),"utf8");
  const thomasRoot=css.match(/\.fighter\.fighter-thomas\s*\{([\s\S]*?)\}/)[1];
  const felipeRoot=felipe.match(/\.fighter-felipe\s*\{([\s\S]*?)\}/)[1];
  const height=s=>Number(s.match(/height:\s*([\d.]+)%/)[1])/100;
  const thomasHeight=height(thomasRoot),felipeHeight=height(felipeRoot);
  const {data:idle,info:idleInfo}=await sharp(new URL(`../public${THOMAS_SHEET}`,import.meta.url).pathname).extract({left:0,top:0,width:768,height:768}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let top=idleInfo.height,bottom=0;
  for(let p=0;p<idleInfo.width*idleInfo.height;p++)if(idle[p*4+3]>100){top=Math.min(top,Math.floor(p/idleInfo.width));bottom=Math.max(bottom,Math.floor(p/idleInfo.width)+1);}
  const ratio=thomasHeight*controls.THOMAS_SCALE*(bottom-top)/idleInfo.height/(felipeHeight*.92);
  assert.ok(Math.abs(ratio-.95)<.002);
  assert.equal(thomasRoot.match(/bottom:\s*([\d.]+)%/)[1],felipeRoot.match(/bottom:\s*([\d.]+)%/)[1]);
  const gap=Number(thomasRoot.match(/--thomas-floor-gap:\s*([\d.]+)%/)[1])/100;
  assert.ok(Math.abs(gap*thomasHeight-felipeHeight*15/1536)<1e-9);
  assert.match(css,/bottom: calc\(var\(--thomas-floor-gap\) - 3\.5%\)/);
  for(const name of ["thomas-punch-body","thomas-kick-body","thomas-combo-body","thomas-command-ox","thomas-invoke-mover"]) {
    const keyframes=css.slice(css.indexOf(`@keyframes ${name}`)).split("\n}\n")[0];
    assert.doesNotMatch(keyframes,/translateY/);
  }
});

test("HiDPI buffers and redraws reset transforms and apply the requested high-quality filter",()=>{
  for(const dpr of [1,1.25,2,3]) {
    assert.deepEqual(thomasBuffer(400,500,dpr),{width:Math.round(400*dpr),height:Math.round(500*dpr),dpr});
    const calls=[],ctx={filter:"none",setTransform:(...a)=>calls.push(a),clearRect:(...a)=>calls.push(a),drawImage:(...a)=>calls.push(a)};
    const frame={};paintThomas(ctx,frame,400,500,dpr);paintThomas(ctx,frame,400,500,dpr);
    assert.deepEqual(calls[0],[dpr,0,0,dpr,0,0]);assert.deepEqual(calls[3],calls[0]);
    assert.deepEqual(calls[1],[0,0,400,500]);assert.deepEqual(calls[2],[frame,0,0,400,500]);
    assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,"high");assert.equal(ctx.filter,THOMAS_FILTER);
    assert.match(ctx.filter,/contrast\(1\.14\).*saturate\(1\.06\).*rgba\(0,0,0,0\.65\)/);
  }
  const calls=[],frame={},ctx={filter:"none",setTransform(){},clearRect(){},drawImage:(...a)=>calls.push(a)};
  paintThomas(ctx,frame,400,500,2,{x:100,y:40,width:200,height:300,cellWidth:800,cellHeight:1000});
  assert.deepEqual(calls,[[frame,50,20,100,150]],"texture trimming retains full-cell destination coordinates");
});

test("original action frames and grounded dynamic shadow are preserved",()=>{
  assert.deepEqual(thomasFrame("attack-combo",600),{row:3,column:4});
  assert.deepEqual(thomasFrame("special-dumb-ox",800),{row:4,column:3});
  assert.deepEqual(thomasFrame("special-first-mover",1700),{row:5,column:4});
  assert.deepEqual(thomasFrame("victory",0),{row:5,column:5});
  assert.deepEqual(thomasFrame("knocked-out",0),{row:3,column:4});
  assert.deepEqual(thomasFrame("guard",0),{row:4,column:2});
  assert.deepEqual(thomasFrame("advance",198),{row:1,column:3});
  assert.equal(thomasPosture("attack-kick",300).shadowWidth,1.15);
  const peak=thomasPosture("jump",650*.55),landed=thomasPosture("jump",650);
  assert.equal(peak.lift,.32);assert.equal(peak.shadowWidth,.55);assert.equal(peak.shadowHeight,.65);assert.ok(Math.abs(peak.shadowOpacity-.45)<1e-12);
  assert.equal(landed.lift,0);assert.equal(landed.shadowWidth,1);assert.equal(landed.shadowOpacity,1);
});
