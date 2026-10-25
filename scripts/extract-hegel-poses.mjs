// Extract complete connected silhouettes from the generated atlases. No resizing,
// head replacement, color filter or anatomical deformation is applied.
import sharp from 'sharp';
import {mkdir,writeFile} from 'node:fs/promises';
const definitions={
  movement:[['unusedWalkA',280,1],['unusedWalkB',790,1],['punch',210,.95],['kick',645,.95]],
  essentials:[['idle',270,1],['windup',785,.97],['jump',790,.78],['guard',275,.74]],
  specials:[['cast',270,.94],['summon',790,.96],['victory',275,1.12],['hook',745,.94]],
  reactions:[['hit',235,.94],['fallen',745,.27],['unusedPass',805,1],['rise',325,.66]],
  walk:[['walkA',345,1],['walkPassA',790,1],['walkB',345,1],['walkPassB',790,1]],
};
await mkdir('public/game/hegel-poses-v2',{recursive:true});
const manifest={};
for(const [atlas,defs] of Object.entries(definitions)){
 const {data,info}=await sharp(`public/game/hegel-${atlas}-v2.webp`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const {width:w,height:h}=info,seen=new Uint8Array(w*h),components=[];
 for(let p=0;p<seen.length;p++){
  if(seen[p]||data[p*4+3]<100)continue;
  const pixels=[p];let left=w,top=h,right=0,bottom=0;seen[p]=1;
  for(let k=0;k<pixels.length;k++){
   const v=pixels[k],x=v%w,y=Math.floor(v/w);left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
   for(const n of [x?v-1:-1,x+1<w?v+1:-1,v-w,v+w])if(n>=0&&n<seen.length&&!seen[n]&&data[n*4+3]>=100){seen[n]=1;pixels.push(n);}
  }
  if(pixels.length>10000)components.push({pixels,left,top,right,bottom});
 }
 if(components.length!==4)throw new Error(`${atlas}: expected4 silhouettes, got${components.length}`);
 for(let i=0;i<4;i++){
  const [name,anchor,bodyHeight]=defs[i];if(name.startsWith('unused'))continue;
  const c=components[i],l=Math.max(0,c.left-4),t=Math.max(0,c.top-4),r=Math.min(w-1,c.right+4),b=Math.min(h-1,c.bottom+4),cw=r-l+1,ch=b-t+1;
  // Keep the native antialiased perimeter, but never a neighboring figure that
  // happens to extend into the same rectangular cell (fists, raised fingers).
  const mask=new Uint8Array(cw*ch);
  for(const v of c.pixels){const x=v%w-l,y=Math.floor(v/w)-t;for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<cw&&yy>=0&&yy<ch)mask[yy*cw+xx]=1;}}
  const out=Buffer.alloc(cw*ch*4);
  for(let y=0;y<ch;y++)for(let x=0;x<cw;x++)if(mask[y*cw+x])data.copy(out,(y*cw+x)*4,((y+t)*w+x+l)*4,((y+t)*w+x+l)*4+4);
  await sharp(out,{raw:{width:cw,height:ch,channels:4}}).webp({quality:96,alphaQuality:100}).toFile(`public/game/hegel-poses-v2/${name}.webp`);
  manifest[name]={file:`/game/hegel-poses-v2/${name}.webp`,width:cw,height:ch,anchorX:anchor-l,soleY:c.bottom-t,bodyHeight};
 }
}
await writeFile('app/hegel-pose-data.ts',`// Native full-body frames, extracted with scripts/extract-hegel-poses.mjs.\nexport const HEGEL_POSES = ${JSON.stringify(manifest,null,2)} as const;\nexport type HegelPose = keyof typeof HEGEL_POSES;\n`);
console.log(Object.keys(manifest));
