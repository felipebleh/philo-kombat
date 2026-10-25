"""Extract four complete articulated umbrella-combo poses; preserve native pixels/alpha.
Usage: python3 scripts/extract-kierkegaard-combo-v3.py ATLAS
"""
from pathlib import Path
from io import BytesIO
import sys,json,os
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
root=Path(__file__).resolve().parents[1];out=root/'public/game/kierkegaard-combo-v3';out.mkdir(exist_ok=True)
def save_webp(im,path):
 data=BytesIO();im.save(data,format='WEBP',lossless=True,method=6)
 temp=path.with_suffix('.tmp')
 with temp.open('wb') as f:f.write(data.getvalue());f.flush();os.fsync(f.fileno())
 os.replace(temp,path);fd=os.open(path.parent,os.O_RDONLY);os.fsync(fd);os.close(fd)
im=Image.open(sys.argv[1]).convert('RGBA');pixels=np.array(im);labels,n=ndi.label(pixels[:,:,3]>40);sizes=np.bincount(labels.ravel());ids=np.argsort(sizes[1:])[-4:]+1
ids=sorted(ids,key=lambda i:(int(np.where(labels==i)[0].min()>im.height*.45),np.where(labels==i)[1].mean()))
metadata={};frames=[]
for name,index in zip(['combo-ready','combo-thrust','combo-reload','combo-cut'],ids):
 mask=ndi.binary_dilation(labels==index,iterations=3)&(pixels[:,:,3]>0);rgba=pixels.copy();rgba[~mask]=0;iso=Image.fromarray(rgba,'RGBA');l,t,r,b=iso.getbbox();cut=iso.crop((l-4,t-4,r+4,b+4))
 # Midpoint of the two boots, not the reaching umbrella, fixes the stance to its shadow.
 xs=np.where(mask[b-round((b-t)*.1):b])[1];median=np.median(xs);anchor=(xs[xs<=median].mean()+xs[xs>median].mean())/2
 scale=1407/(b-t);save_webp(cut,out/(name+'.webp'))
 upper=mask[t:t+round((b-t)*.72)];ys,txs=np.where(upper);tip_x=int(txs.max());tip_y=float(ys[txs>=tip_x-3].mean()+t)
 metadata[name]={'tipX':round(.5+(tip_x-anchor)*scale/1664,5),'tipY':round((1460+(tip_y-b)*scale)/1536,5),'width':cut.width,'height':cut.height,'anchorX':round(float(anchor-l+4),3),'soleY':b-t+4,'scaleToGuard':scale,'file':'/game/kierkegaard-combo-v3/'+name+'.webp'}
 m=metadata[name];frame=Image.new('RGBA',(2400,1536));res=cut.resize((round(cut.width*scale),round(cut.height*scale)),Image.Resampling.LANCZOS);frame.alpha_composite(res,(round(1200-m['anchorX']*scale),round(1460-m['soleY']*scale)));frames.append(frame);print(name,cut.size,m['anchorX'])
save_webp(im,out/'combo-atlas.webp');(root/'app/kierkegaard-combo-poses.ts').write_text('export const KIERKEGAARD_COMBO_POSES = '+json.dumps(metadata,indent=2)+' as const;\n')
preview=Image.new('RGB',(1400,250),'#182634');d=ImageDraw.Draw(preview)
for i,frame in enumerate(frames):
 small=frame.resize((350,224),Image.Resampling.LANCZOS);preview.paste(small,(i*350,0),small);d.text((i*350+120,232),str(i),fill='white')
preview.save('/workspace/scratch/6fb9ed9b9b4d/kierkegaard-combo-v3-review.webp')
