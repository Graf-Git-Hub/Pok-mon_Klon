"""Use selected original CC0 sprites from ArMM1998's Gameboy Tileset.
Source: https://opengameart.org/content/gameboy-tileset (CC0 1.0).
The source graphics are authored by ArMM1998, not Nintendo.
Recolor only to the established 4-tone Echo-Chroniken palette.
Kept here as a separate extraction layer so all atlas tiles remain reusable.
"""
from PIL import Image
from pathlib import Path
SOURCE=Path(__file__).resolve().parents[2]/"assets"/"gb-classic"/"cc0-armm1998-original.png"
PALETTE=("#f4f4ef","#c7c8c4","#777a7b","#24262b")

# 3x2 top-down house: top 3 roof tiles / lower left, door, right facade.
# Select one hand-crafted architectural kit and reuse it in every village.
CROPS={
 "roof_l":(160,32,176,48),
 "roof_m":(176,32,192,48),
 "roof_r":(192,32,208,48),
 "window":(160,48,176,64),
 "door":(176,48,192,64),
 "wall":(192,48,208,64),
}

def crop_recolor(box):
    src=Image.open(SOURCE).convert("RGBA")
    img=src.crop(box)
    out=Image.new("RGB",img.size,PALETTE[0])
    pixels=img.load()
    for y in range(img.height):
        for x in range(img.width):
            r,g,b,a=pixels[x,y]
            if a<64: continue
            level=(r+g+b)/3
            idx=min(range(4),key=lambda i:abs(level-(255,168,96,0)[i]))
            out.putpixel((x,y),PALETTE[idx])
    return out

def apply_cc0(name, fallback):
    if not SOURCE.exists():return fallback
    if name in CROPS:
        return crop_recolor(CROPS[name])
    if name=="tree":
        # Trunk-centered 16x32 original tree, reduced to a single legacy
        # collision cell; one atlas slot is retained.
        original=crop_recolor((128,0,144,32))
        return original.resize((16,16),Image.Resampling.NEAREST)
    if name=="rock":
        return crop_recolor((0,144,32,176)).resize((16,16),Image.Resampling.NEAREST)
    if name=="fence":
        return crop_recolor((80,144,96,160))
    return fallback
