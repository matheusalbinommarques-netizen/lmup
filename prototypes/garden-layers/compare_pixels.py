from PIL import Image
import numpy as np, json, pathlib
root=pathlib.Path(r'D:\Codex-artifacts\garden-layer-proof-20261103')
a=np.asarray(Image.open(root/'captures'/'stage-1-scene.png').convert('RGB'))
b=np.asarray(Image.open(root/'captures'/'stage-4-scene.png').convert('RGB'))
assert a.shape==b.shape, 'Scene dimensions changed'
height,width=a.shape[:2]
changed=np.max(np.abs(a.astype(np.int16)-b.astype(np.int16)),axis=2)>2
x=np.arange(width)[None,:]/width*836
y=np.arange(height)[:,None]/height*470
dynamic=(x>=188)&(x<=681)&(y<=354)
outside=int(np.count_nonzero(changed & ~dynamic))
samples={}
for name,(left,top,right,bottom) in {'waterfall':(690,170,790,300),'ruins':(670,20,810,120),'left_path':(125,260,195,345),'foreground':(0,370,830,465)}.items():
    region=(x>=left)&(x<=right)&(y>=top)&(y<=bottom)
    samples[name]=int(np.count_nonzero(changed&region))
result={'sameDimensions':True,'width':width,'height':height,'changedPixelsOutsideDynamicRegion':outside,'fixedLandmarksChangedPixels':samples,'thresholdPerChannel':2,'dynamicRegionIntrinsic':[188,0,681,354]}
(root/'pixel-comparison.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result))
assert outside==0 and all(value==0 for value in samples.values()), 'Fixed environment changed between stages'
