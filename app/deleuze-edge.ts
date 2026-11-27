/** Suppress only red matte contamination adjacent to transparent exterior pixels.
 * Burgundy cloth and opaque interior detail never satisfy the exterior test. */
export function cleanDeleuzeEdge(data:Uint8ClampedArray,width:number,height:number){
 const alpha=new Uint8Array(width*height);for(let i=0;i<alpha.length;i++)alpha[i]=data[i*4+3];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2];
  if(alpha[y*width+x]<8){data[i+3]=0;continue;}
  if(r<140||g>105||b>105||r<g*1.7)continue;
  let exterior=false;
  for(let dy=-3;dy<=3&&!exterior;dy++)for(let dx=-3;dx<=3;dx++){
   const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<width&&yy<height&&alpha[yy*width+xx]<8){exterior=true;break;}
  }
  if(exterior)data[i+3]=0;
 }
 return data;
}
