import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import sharp from "sharp";

const compile = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText).toString("base64")}`;
const shared = compile(await readFile(new URL("../app/sprite-frames.ts",import.meta.url),"utf8"));
const animation = (await readFile(new URL("../app/galileo-animation.ts",import.meta.url),"utf8")).replace('"./sprite-frames"',JSON.stringify(shared));
const { GALILEO_SHEET, GALILEO_FILTER, galileoFrame, galileoFrameRect, galileoBuffer, galileoTextureBounds, paintGalileo, prepareGalileoPixels } = await import(compile(animation));

test("Galileo's real unsharp mask strengthens fine detail and excludes transparent background colors",()=>{
  const w=15,h=15,raw=new Uint8ClampedArray(w*h*4),set=(x,y,rgba)=>raw.set(rgba,(y*w+x)*4);
  for(let y=3;y<12;y++)for(let x=3;x<12;x++)set(x,y,[50,35,30,255]);
  set(7,7,[120,95,70,255]);set(2,7,[220,220,220,20]);set(2,8,[150,150,150,80]);
  const colored=raw.slice();for(let p=0;p<w*h;p++)if(!colored[p*4+3])colored.set([255,0,255,0],p*4);
  const clean=prepareGalileoPixels(raw.slice(),w,h),other=prepareGalileoPixels(colored,w,h);
  assert.ok(clean[(7*w+7)*4]>120,"actual convolution sharpens the texture");
  assert.equal(clean[(7*w+2)*4+3],0,"faint exterior matte is removed");
  assert.equal(clean[(8*w+2)*4+3],60,"only faint outer alpha is reduced");
  for(let p=0;p<w*h;p++)if(raw[p*4+3]>100){
    assert.equal(clean[p*4+3],raw[p*4+3]);
    assert.deepEqual(clean.slice(p*4,p*4+4),other.slice(p*4,p*4+4),"hidden magenta must not enter the beard or cloak");
  }
});

test("all 36 native frames retain the exact body mask, feet, full-cell position and dimensions",async()=>{
  const {data:sheet,info}=await sharp(new URL(`../public${GALILEO_SHEET}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let changed=0,cleaned=0,cachedPixels=0;
  for(let row=0;row<6;row++)for(let column=0;column<6;column++){
    const [sx,sy,w,h]=galileoFrameRect(info.width,info.height,column,row),raw=new Uint8ClampedArray(w*h*4);
    for(let y=0;y<h;y++)raw.set(sheet.subarray(((sy+y)*info.width+sx)*4,((sy+y)*info.width+sx+w)*4),y*w*4);
    const clean=prepareGalileoPixels(raw.slice(),w,h);
    assert.equal(clean.length,raw.length);
    let beforeBottom=0,afterBottom=0;
    for(let p=0;p<w*h;p++){
      assert.equal(clean[p*4+3]>100,raw[p*4+3]>100,`silhouette ${row}:${column}:${p}`);
      if(raw[p*4+3]>100)beforeBottom=Math.max(beforeBottom,Math.floor(p/w)+1);
      if(clean[p*4+3]>100)afterBottom=Math.max(afterBottom,Math.floor(p/w)+1);
      if(raw[p*4+3]>100&&clean[p*4]!==raw[p*4])changed++;
      if(clean[p*4+3]<raw[p*4+3])cleaned++;
    }
    assert.equal(afterBottom,beforeBottom,`unchanged shoe line ${row}:${column}`);
    const bounds=galileoTextureBounds(clean,w,h);cachedPixels+=bounds.width*bounds.height;
    assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=w&&bounds.y+bounds.height<=h);
  }
  assert.ok(changed>1000);assert.ok(cleaned>0);
  assert.ok(cachedPixels<info.width*info.height*.7,"cache occupied native texture, not empty margins");
});

test("HiDPI respects display density with a 2x minimum and redraw never accumulates context scaling",()=>{
  for(const density of [1,1.25,2,2.5,3]){
    const dpr=Math.max(2,density),buffer=galileoBuffer(410,432,density);
    assert.deepEqual(buffer,{width:Math.round(410*dpr),height:Math.round(432*dpr),dpr});
    const calls=[],frame={},ctx={filter:"none",setTransform:(...a)=>calls.push(a),clearRect:(...a)=>calls.push(a),drawImage:(...a)=>calls.push(a)};
    const placement={x:100,y:30,width:180,height:370,cellWidth:418,cellHeight:418};
    paintGalileo(ctx,frame,418,418,dpr,placement);paintGalileo(ctx,frame,418,418,dpr,placement);
    assert.deepEqual(calls[0],[dpr,0,0,dpr,0,0]);assert.deepEqual(calls[3],calls[0]);
    assert.deepEqual(calls[2],[frame,100,30,180,370],"texture trim never moves or rescales the body relative to its cell");
    assert.equal(ctx.imageSmoothingEnabled,true);assert.equal(ctx.imageSmoothingQuality,"high");
    assert.equal(ctx.filter,GALILEO_FILTER);assert.match(ctx.filter,/contrast\(1\.15\).*saturate\(1\.08\).*rgba\(0,0,0,0\.70\)/);
  }
});

test("poses follow the original Galileo timelines, including telescope, guard, hit and knockout",()=>{
  for(const [action,duration,starts,poses] of [
    ["attack-punch",520,[0,.15,.31,.49,.67,.83],[[2,0],[2,1],[2,2],[2,3],[2,4],[2,5]]],
    ["attack-kick",620,[0,.17,.35,.55,.73,.88],[[3,0],[3,1],[3,2],[3,3],[3,4],[3,5]]],
    ["attack-combo",780,[0,.13,.26,.39,.53,.69,.87],[[2,0],[2,2],[2,4],[3,0],[3,2],[3,4],[2,5]]],
    ["hit",440,[0,.39],[[5,0],[5,1]]],
    ["special-falling-bodies",1450,[0,.35,.73],[[4,0],[4,1],[4,0]]],
    ["special-sidereal-messenger",1850,[0,.27,.54,.77],[[4,2],[4,3],[4,4],[4,5]]],
  ])for(let i=0;i<starts.length;i++){
    assert.deepEqual(galileoFrame(action,starts[i]*duration+.001),{row:poses[i][0],column:poses[i][1]});
    if(i)assert.deepEqual(galileoFrame(action,starts[i]*duration-.001),{row:poses[i-1][0],column:poses[i-1][1]});
  }
  for(const [action,row,column] of [["guard",4,2],["guard-hit",4,2],["victory",5,5],["knocked-out",5,2],["idle",0,0],["advance",1,0],["retreat",1,0]])assert.deepEqual(galileoFrame(action,0),{row,column});
});

test("arena scale, ground offset, mirroring and existing root animations stay unchanged",async()=>{
  const css=await readFile(new URL("../app/globals.css",import.meta.url),"utf8");
  const root=css.match(/\.fighter-galileo\s*\{([^}]+)\}/)[1];
  assert.match(root,/bottom: 3\.5%/);assert.match(root,/height: 78%/);assert.match(root,/width: clamp\(174px, 22\.5vw, 336px\)/);
  const sprite=css.match(/\.fighter-galileo \.galileo-sheet\s*\{([^}]+)\}/)[1];
  assert.match(sprite,/height: 108%/);assert.match(sprite,/inset: auto auto 0 50%/);assert.match(sprite,/transform: translateX\(-50%\)/);
  assert.match(css,/\.fighter-enemy\.fighter-galileo \.fighter-sprite\s*\{\s*transform: translateX\(-50%\) scaleX\(-1\)/);
  const component=await readFile(new URL("../app/galileo-sprite.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(component,/style\.transform|style\.setProperty/);
  assert.match(component,/pausedRef\.current/);
});

test("restored HQ artwork preserves each legacy pose's height, shoe line and horizontal framing",async()=>{
  const old=await sharp(new URL("../public/game/galileu-spritesheet-hq-v3.webp",import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const active=await sharp(new URL(`../public${GALILEO_SHEET}`,import.meta.url).pathname).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.ok(active.info.width/6>=768&&active.info.height/6>=768);
  const bbox=(image,row,column)=>{
    const [sx,sy,w,h]=galileoFrameRect(image.info.width,image.info.height,column,row);
    let left=w,top=h,right=0,bottom=0;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(image.data[((sy+y)*image.info.width+sx+x)*4+3]>100){
      left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);
    }
    return {left,top,right,bottom,w,h};
  };
  for(let row=0;row<6;row++)for(let column=0;column<6;column++){
    const a=bbox(old,row,column),b=bbox(active,row,column),scale=b.h/a.h;
    assert.ok(Math.abs((b.bottom-b.top)-(a.bottom-a.top)*scale)<=2,`same body height ${row}:${column}`);
    assert.ok(Math.abs(b.bottom-a.bottom*scale)<=2,`same ground line ${row}:${column}`);
    assert.ok(Math.abs((b.left+b.right)/2-(a.left+a.right)/2*scale)<=2,`same horizontal framing ${row}:${column}`);
    assert.ok(b.left>0&&b.right<b.w&&b.top>0&&b.bottom<b.h,`no clipped head, foot or telescope ${row}:${column}`);
  }
});
