"""Small original four-shade cave, ice and roof tiles for the world adapter."""
from PIL import Image, ImageDraw
from pathlib import Path
P = ("#f4f4ef", "#c7c8c4", "#777a7b", "#24262b")
def build(out):
    sheet = Image.new("RGB", (128, 16), P[0])
    for index in range(8):
        im = Image.new("RGB", (16, 16), P[1] if index in (0, 2) else P[0])
        d = ImageDraw.Draw(im)
        if index in (0, 2):
            d.rectangle((0, 0, 15, 15), fill=P[3])
            for x,y,w,h in ((1,1,7,6),(9,1,5,7),(1,9,5,5),(7,9,7,5)):
                d.rectangle((x,y,x+w-1,y+h-1),fill=P[2] if index==0 else P[1])
                d.line((x,y,x+w-2,y),fill=P[1] if index==0 else P[0])
                d.point((x+1,y+2),fill=P[3] if index==0 else P[2])
        elif index in (1, 3):
            for x,y in ((2,3),(10,5),(5,12),(13,14)):
                d.line((x,y,x+1,y),fill=P[1])
            if index==3:
                d.line((0,15,15,0),fill=P[1]);d.line((8,15,15,8),fill=P[1])
        elif index in (4,5):
            d.rectangle((0,0,15,15),fill=P[2])
            for y in (3,7,11,15):d.line((0,y,15,y),fill=P[3])
            for y in (1,5,9,13):
                for x in range(1+(y%3),15,5):d.line((x,y,x+2,y),fill=P[1])
        elif index in (6,7):
            d.rectangle((0,0,15,15),fill=P[1])
            d.line((0,0,15,0),fill=P[3]);d.line((0,15,15,15),fill=P[2])
            if index==7:
                d.rectangle((3,3,12,11),fill=P[3]);d.rectangle((4,4,11,10),fill=P[0])
                d.line((7,4,7,10),fill=P[2]);d.line((4,7,11,7),fill=P[2])
            else:
                for x,y in ((2,4),(10,9),(5,13)):d.line((x,y,x+3,y),fill=P[0])
        sheet.paste(im,(index*16,0))
    sheet.save(out / "world_biomes.png")
