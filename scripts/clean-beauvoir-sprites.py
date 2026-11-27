"""Remove only neutral matte connected to alpha, plus verified enclosed arm gaps.
RGB detail, native dimensions, blouse, skin and manuscript are preserved.
"""
from pathlib import Path
import numpy as np
from PIL import Image
from scipy import ndimage as nd
ROOT=Path(__file__).resolve().parents[1]/'public/game'
GAPS={'punch-hq':[(690,450,820,635)],'kick-hq':[(905,480,1010,710)]}
for name in ['guard-frame','fullbody-hq','punch-hq','kick-hq','combo-hq']:
 p=ROOT/f'beauvoir-{name}.webp';a=np.array(Image.open(p).convert('RGBA'));rgb=a[:,:,:3].astype(int)
 neutral=(rgb.min(2)>160)&(rgb.max(2)-rgb.min(2)<38)&(a[:,:,3]>0)
 # Residual checkerboard is at the cutout boundary. Protect real light garments
 # by limiting this pass to the first six pixels from existing transparency.
 distance=nd.distance_transform_edt(a[:,:,3]>0)
 remove=neutral&(distance<=6)
 for x0,y0,x1,y1 in GAPS.get(name,[]):
  region=np.zeros(neutral.shape,bool);region[y0:y1,x0:x1]=True
  # Entire connected light region within this carefully inspected empty gap.
  remove|=neutral&region
 a[remove,3]=0
 # Remove isolated, unattached pale dust without touching the main silhouette.
 labels,n=nd.label(a[:,:,3]>0);counts=np.bincount(labels.ravel());small=counts<80;small[0]=False;a[small[labels],3]=0
 a[a[:,:,3]==0,:3]=0
 Image.fromarray(a).save(ROOT/f'beauvoir-{name}-clean-v2.webp',lossless=True)
 print(name,int(remove.sum()),a.shape[1],a.shape[0])
