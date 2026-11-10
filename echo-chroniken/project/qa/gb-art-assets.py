"""Validate actual native PNG pixels, frames and stable atlas schema."""
from pathlib import Path
from PIL import Image,ImageColor
import json
root=Path(__file__).resolve().parents[1]/'assets/gb-classic'
m=json.loads((root/'tile_manifest.json').read_text());colors={ImageColor.getrgb(c) for c in m['palette']}
assert len(m['sprites'])==39 and m['tileSize']==16
for f in ('actors.png','foreground.png','gb_classic_atlas.png','houses.png'):
 im=Image.open(root/f).convert('RGBA')
 assert {p[:3] for p in (im.getpixel((x,y)) for y in range(im.height) for x in range(im.width)) if p[3]}<=colors,f
 assert {p[3] for p in (im.getpixel((x,y)) for y in range(im.height) for x in range(im.width))}<={0,255},f
im=Image.open(root/'actors.png')
for row in range(4):
 frames=[im.crop((i*16,row*16,i*16+16,row*16+16)).tobytes() for i in range(3)]
 assert len(set(frames))==3,'Idle and both feet must be distinct in each direction'
assert im.crop((0,64,16,80)).tobytes()!=im.crop((16,64,32,80)).tobytes()
assert im.getpixel((0,0))[3]==0,'Background must be transparent'
assert any(p[:3]==ImageColor.getrgb(m['palette'][0]) and p[3]==255 for p in (im.getpixel((x,y)) for y in range(im.height) for x in range(im.width))),'White clothing must stay opaque'
print('GB_ART_ASSETS_PASS: 12 distinct directional poses, two NPCs, 39 stable tiles, exact palette and binary alpha')

houses=Image.open(root/'houses.png')
assert houses.size==(192,40)
assert len({houses.crop((i*48,0,(i+1)*48,40)).tobytes() for i in range(4)})==4
print('GB_HOUSES_PASS: four original coherent facades, unchanged footprint')
