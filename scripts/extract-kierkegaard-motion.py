"""Extract complete connected motion poses from the two generated transparent atlases.
No repainting, face replacement, sharpening, or resampling of source pixels.
Usage: python3 scripts/extract-kierkegaard-motion.py ATLAS_WALK ATLAS_MOTION
"""
from pathlib import Path
import sys,json
import numpy as np
from PIL import Image,ImageDraw
from scipy import ndimage as ndi
root=Path(__file__).resolve().parents[1]
out=root/'public/game/kierkegaard-motion-v2';out.mkdir(exist_ok=True)
# Anchor = center of the hips in the full atlas; source soles map to the approved 1460/1536 baseline.
settings=[('walk-a',0,(390,300),390,1407/582),('walk-b',0,(950,900),960,1407/583),
 ('pass-a',1,(360,320),350,1407/669),('pass-b',1,(950,320),940,1407/669),
 ('crouch',1,(350,930),330,1407/669),('air',1,(940,920),930,1407/669)]
atlases=[Image.open(p).convert('RGBA') for p in sys.argv[1:3]]
meta={}
for name,index,(px,py),anchor,scale in settings:
 im=atlases[index];a=np.array(im)[:,:,3];labels,n=ndi.label(a>40)
 label=labels[py,px];assert label>0,(name,px,py)
 mask=labels==label
 # Preserve antialiasing within 3px of this character, excluding neighboring poses.
 mask=ndi.binary_dilation(mask,iterations=3)&(a>0)
 rgba=np.array(im).copy();rgba[~mask]=0
 isolated=Image.fromarray(rgba,'RGBA');bounds=isolated.getbbox();l,t,r,b=bounds
 cropped=isolated.crop((max(0,l-4),max(0,t-4),min(im.width,r+4),min(im.height,b+4)))
 cropped.save(out/(name+'.webp'),lossless=True,method=6)
 meta[name]={'width':cropped.width,'height':cropped.height,'anchorX':anchor-l+4,'soleY':b-t+4,'scaleToGuard':scale,'file':'/game/kierkegaard-motion-v2/'+name+'.webp'}
 print(name,bounds,cropped.size)
# Keep both original atlases as reproducible sources; store lossless WebP without resizing.
for im,name in zip(atlases,['walk-atlas','motion-atlas']):im.save(out/(name+'.webp'),lossless=True,method=6)
(root/'app/kierkegaard-pose-data.ts').write_text('export const KIERKEGAARD_NEW_POSES = '+json.dumps(meta,indent=2)+' as const;\n')
# Visual QA: all poses at the same body scale with a common floor line.
preview=Image.new('RGB',(7*220,270),'#182634');draw=ImageDraw.Draw(preview)
original=Image.open(root/'public/game/kierkegaard-guard-frame.webp')
for i,name in enumerate(['idle','walk-a','pass-a','walk-b','pass-b','crouch','air']):
 frame=Image.new('RGBA',(1664,1536))
 if name=='idle':frame=original
 else:
  m=meta[name];im=Image.open(out/(name+'.webp'));sc=m['scaleToGuard'];res=im.resize((round(im.width*sc),round(im.height*sc)),Image.Resampling.LANCZOS)
  frame.alpha_composite(res,(round(832-m['anchorX']*sc),round(1460-m['soleY']*sc)))
 small=frame.resize((220,203),Image.Resampling.LANCZOS);preview.paste(small,(i*220,20),small);draw.line((i*220,213,(i+1)*220,213),fill='#a19578');draw.text((i*220+50,240),name,fill='white')
preview.save('/workspace/scratch/6fb9ed9b9b4d/kierkegaard-motion-review.webp')
