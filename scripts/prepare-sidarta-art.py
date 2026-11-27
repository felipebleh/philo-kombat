#!/usr/bin/env python3
"""Remove ground residue and keyed edge spill from Sidarta's existing 36 poses."""
from pathlib import Path
import json
import numpy as np
from scipy import ndimage
from PIL import Image, ImageFilter
ROOT=Path(__file__).resolve().parents[1]
GAME=ROOT/'public/game'
def clean(image,particles=False):
 a=np.array(image.convert('RGBA')).copy();alpha=a[...,3].astype(float);solid=alpha>=100
 labels,count=ndimage.label(solid)
 if not count: raise ValueError('Empty Sidarta frame')
 sizes=np.bincount(labels.ravel());sizes[0]=0;body=labels==sizes.argmax()
 if not particles: alpha[ndimage.distance_transform_edt(~body)>2]=0
 alpha[alpha<20]=0
 interior=ndimage.binary_erosion(solid,iterations=2)
 if not interior.any():interior=solid
 _,nearest=ndimage.distance_transform_edt(~interior,return_indices=True)
 edge=(~interior)&(alpha>0);a[edge,:3]=a[nearest[0][edge],nearest[1][edge],:3]
 coverage=np.clip((alpha-20)/235,0,1);a[...,3]=np.round(255*coverage*coverage*(3-2*coverage)).astype('uint8')
 a[...,:3]=np.array(Image.fromarray(a[...,:3]).filter(ImageFilter.UnsharpMask(radius=1,percent=58,threshold=3)))
 a[a[...,3]==0]=0
 return Image.fromarray(a)
def register(im,x=0,y=0):
 a=np.array(im)[...,3];ys,xs=np.nonzero(a>=80);left,top,right,floor=int(xs.min()),int(ys.min()),int(xs.max())+1,int(ys.max())+1
 waist=round(top+(floor-top)*.49);_,torso=np.nonzero(a[max(0,waist-4):waist+5]>=160)
 pivot=float(np.median(torso)) if len(torso) else (left+right)/2
 return dict(x=x+left,y=y+top,width=right-left,height=floor-top,anchorX=round(pivot-left,2))
def main():
 src=Image.open(GAME/'sidarta-spritesheet-clean.webp').convert('RGBA');atlas=Image.new('RGBA',src.size);frames=[]
 for row in range(6):
  for col in range(6):
   frame=clean(src.crop((col*418,row*418,(col+1)*418,(row+1)*418)),particles=row==5)
   atlas.paste(frame,(col*418,row*418));frames.append(register(frame,col*418,row*418))
 atlas.save(GAME/'sidarta-spritesheet-hd-v1.webp',quality=96,method=6)
 (ROOT/'app/sidarta-frame-data.json').write_text(json.dumps(frames,indent=2)+'\n')
 full=clean(Image.open(GAME/'sidarta.webp'));full=full.crop(full.getbbox());full.save(GAME/'sidarta-fullbody-hq-v2.webp',quality=96,method=6)
 size=min(full.width,int(full.height*.28));cx=full.width*.5
 full.crop((int(cx-size/2),0,int(cx+size/2),size)).resize((320,320),Image.Resampling.LANCZOS).save(GAME/'thumb-sidarta-v2.webp',quality=95)
 lotus=atlas.crop((0,2090,418,2508));lotus=lotus.crop(lotus.getbbox());lotus.resize((1024,round(1024*lotus.height/lotus.width)),Image.Resampling.LANCZOS).save(GAME/'sidarta-lotus-victory-hq.webp',quality=96,method=6)
 print('Prepared all 36 original Sidarta poses, full body, portrait and lotus victory.')
if __name__=='__main__':main()
