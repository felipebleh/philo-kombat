// Rebuild the walking layers from Sidarta's existing HD walk art.
// The seed regions are restricted to bare feet so the orange robe stays intact.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const game=fileURLToPath(new URL('../public/game/',import.meta.url));
const {data:source,info}=await sharp(game+'sidarta-walk-3-hq-v3.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width:w,height:h}=info;
if(w!==742||h!==1584)throw Error('Unexpected source artwork dimensions');
const selected=new Uint8Array(w*h),queue=new Int32Array(w*h);
function flood(sx,sy,region){
 let first=0,last=0;queue[last++]=sy*w+sx;selected[sy*w+sx]=1;
 while(first<last){
  const i=queue[first++],x=i%w,y=Math.floor(i/w);
  for(const j of [i-1,i+1,i-w,i+w]){
   if(j<0||j>=w*h||selected[j])continue;
   const nx=j%w,ny=Math.floor(j/w);if(Math.abs(nx-x)+Math.abs(ny-y)!==1||!region(nx,ny))continue;
   const p=j*4,r=source[p],g=source[p+1],b=source[p+2];
   if(source[p+3]>2&&r>50&&g>r*.37&&r>g*1.1&&g>b*1.17){selected[j]=1;queue[last++]=j;}
  }
 }
}
flood(50,1400,(x,y)=>x<160&&y>1250+Math.max(0,x-110)*1.95);
flood(600,1530,(x,y)=>x>460&&y>1460-(x-480)*.35);
const mask=selected.slice();
for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
 const i=y*w+x;if(!selected[i])continue;
 for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){
  if(xx*xx+yy*yy>5)continue;
  const j=(y+yy)*w+x+xx,p=j*4,r=source[p],g=source[p+1],b=source[p+2];
  if(source[p+3]>0&&r>35&&g>r*.33&&g>b*1.10)mask[j]=1;
 }
}
const body=Buffer.from(source),foot=Buffer.from(source);
for(let i=0;i<w*h;i++){
 if(mask[i]||Math.floor(i/w)>=1470)body[i*4+3]=0;
 if(!mask[i]||i%w<450)foot[i*4+3]=0;
}
await sharp(body,{raw:info}).webp({quality:96,alphaQuality:100}).toFile(game+'sidarta-walk-body-v4.webp');
await sharp(foot,{raw:info}).extract({left:460,top:1425,width:282,height:159}).webp({quality:96,alphaQuality:100}).toFile(game+'sidarta-walk-foot-v4.webp');
