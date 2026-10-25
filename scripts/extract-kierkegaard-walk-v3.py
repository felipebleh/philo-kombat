"""Extract native complete low-step walking poses. No repainting or resampling.
Usage: python3 scripts/extract-kierkegaard-walk-v3.py FIRST_ATLAS SECOND_ATLAS
"""
from pathlib import Path
import sys,json,os
from io import BytesIO
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
root=Path(__file__).resolve().parents[1];out=root/'public/game/kierkegaard-walk-v3';out.mkdir(exist_ok=True)
def save_webp(image,path):
 data=BytesIO();image.save(data,format='WEBP',lossless=True,method=6)
 temp=path.with_suffix('.tmp')
 with temp.open('wb') as f:f.write(data.getvalue());f.flush();os.fsync(f.fileno())
 os.replace(temp,path)
 fd=os.open(path.parent,os.O_RDONLY);os.fsync(fd);os.close(fd)
metadata={};previews=[]
for sheet,path in enumerate(sys.argv[1:3]):
 im=Image.open(path).convert('RGBA');pixels=np.array(im);labels,n=ndi.label(pixels[:,:,3]>40);sizes=np.bincount(labels.ravel());ids=np.argsort(sizes[1:])[-4:]+1
 ids=sorted(ids,key=lambda i: (int(np.where(labels==i)[0].min()>im.height*.45),np.where(labels==i)[1].mean()))
 for j,index in enumerate(ids):
  mask=ndi.binary_dilation(labels==index,iterations=3)&(pixels[:,:,3]>0);rgba=pixels.copy();rgba[~mask]=0;isolated=Image.fromarray(rgba,'RGBA');l,t,r,b=isolated.getbbox();bounds=(l-4,t-4,r+4,b+4);cut=isolated.crop(bounds)
  # Align the center of the head, avoiding a left/right wobble between different steps.
  rows=mask[t+round((b-t)*.06):t+round((b-t)*.15)]
  head_x=float(np.where(rows)[1].mean());scale=1407/(b-t)
  name=f'walk-{sheet*4+j}';file='/game/kierkegaard-walk-v3/'+name+'.webp';save_webp(cut,out/(name+'.webp'))
  metadata[name]={'width':cut.width,'height':cut.height,'anchorX':round(head_x-l+4,3),'soleY':b-t+4,'scaleToGuard':scale,'file':file}
  frame=Image.new('RGBA',(1664,1536));res=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS)
  frame.alpha_composite(res,(round(832-metadata[name]['anchorX']*scale),round(1460-metadata[name]['soleY']*scale)))
  previews.append(frame);print(name,cut.size,round(scale,3),metadata[name]['anchorX'])
 save_webp(im,out/f'walk-atlas-{sheet+1}.webp')
(root/'app/kierkegaard-walk-poses.ts').write_text('export const KIERKEGAARD_WALK_POSES = '+json.dumps(metadata,indent=2)+' as const;\n')
contact=Image.new('RGB',(8*200,220),'#182634');d=ImageDraw.Draw(contact)
for i,frame in enumerate(previews):
 small=frame.resize((200,185),Image.Resampling.LANCZOS);contact.paste(small,(i*200,0),small);d.line((i*200,176,(i+1)*200,176),fill='#9e937e');d.text((i*200+70,200),str(i),fill='white')
contact.save('/workspace/scratch/6fb9ed9b9b4d/kierkegaard-low-walk-review.webp')
