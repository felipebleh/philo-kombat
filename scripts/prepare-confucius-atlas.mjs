// Restore all 36 original poses; repair bleed, detached sprites and exposed feet.
import sharp from 'sharp';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url)),cell=418,size=cell*6;
const {data:source,info}=await sharp(root+'public/game/confucio-spritesheet.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
if(info.width!==size||info.height!==size)throw Error('Unexpected Confúcio spritesheet dimensions');
const atlas=Buffer.alloc(source.length),limits=[361,345,345,345,315,346];
const shoes=[[[126,270,155,296],[242,270,289,296]],[[101,270,160,296],[225,270,277,296]],[[140,270,198,300],[246,270,282,300]],[[95,266,141,300],[220,269,264,300]],[[76,265,132,300],[226,268,264,300]]];
function pixelIndex(row,col,x,y){return ((row*cell+y)*size+col*cell+x)*4;}
for(let row=0;row<6;row++)for(let col=0;col<6;col++){
 for(let y=2;y<limits[row];y++)for(let x=2;x<cell-2;x++){
  let di=pixelIndex(row,col,x,y),si=di,a=source[si+3];
  if(a<8)continue;
  for(let channel=0;channel<4;channel++)atlas[di+channel]=source[si+channel];
  if(row===4&&col<5&&shoes[col].some(([l,t,r,b])=>x>=l&&x<=r&&y>=t&&y<=b)){
   let red=atlas[di],green=atlas[di+1],blue=atlas[di+2];
   if(red>65&&red>green*1.12&&green>blue*1.18&&green>red*.37){const light=(red+green+blue)/3;atlas[di]=18+light*.16;atlas[di+1]=25+light*.18;atlas[di+2]=37+light*.20;}
  }
 }
 if(row===5){for(let y=340;y<=375;y++)for(let x=2;x<cell-2;x++){const si=pixelIndex(4,col,x,y),dy=y-332,di=pixelIndex(5,col,x,dy);if(source[si+3]>=8&&atlas[di+3]<source[si+3])for(let ch=0;ch<4;ch++)atlas[di+ch]=source[si+ch];}}
}
const frames=[];
for(let row=0;row<6;row++)for(let col=0;col<6;col++){
 let left=cell,right=0,top=cell,bottom=0;
 for(let y=0;y<cell;y++)for(let x=0;x<cell;x++)if(atlas[pixelIndex(row,col,x,y)+3]>48){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 if(right<=left||bottom<=top)throw Error(`Empty pose ${row}:${col}`);
 const xs=[];for(let y=Math.round(top+(bottom-top)*.52);y<=Math.round(top+(bottom-top)*.62);y++)for(let x=left;x<=right;x++)if(atlas[pixelIndex(row,col,x,y)+3]>160)xs.push(x);
 xs.sort((a,b)=>a-b);const anchor=xs[Math.floor(xs.length/2)]??(left+right)/2;
 frames.push({x:(col*cell+left)*2,y:(row*cell+top)*2,width:(right-left+1)*2,height:(bottom-top+1)*2,anchorX:(anchor-left)*2,row,column:col});
}
await sharp(atlas,{raw:info}).resize(size*2,size*2,{kernel:'lanczos3'}).sharpen({sigma:.6,m1:.7,m2:1.2}).webp({quality:94,alphaQuality:100,effort:5}).toFile(root+'public/game/confucio-spritesheet-clean-v2.webp');
await writeFile(root+'app/confucius-frame-data.json',JSON.stringify(frames,null,2)+'\n');
console.log(JSON.stringify({frames:frames.length,standing:frames[0],hit:frames[24],scroll:frames[30]}));
