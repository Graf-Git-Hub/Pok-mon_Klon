#!/usr/bin/env python3
"""Echo-Chroniken / Classic GB Kit 1.0
Original reusable 16x16 pixel blocks, four shades, hand-placed map examples.
No third-party copyrighted sprites are copied. Every scene reuses this atlas.
"""
from PIL import Image,ImageDraw
from pathlib import Path
import json,math
from gb_visual_upgrade import upgrade as art_upgrade
from gb_art_v5 import upgrade as v5_upgrade, build_layers
from gb_art_v6 import upgrade as v6_upgrade, build as build_houses
from gb_grass import build_rustle
from gb_interiors import build_boundaries, interior_tile

C=["#f4f4ef","#c7c8c4","#777a7b","#24262b"]
T=16
K={
 "floor":"0","path":"1","grass":"2","bush":"3","tree":"4",
 "fence":"5","water_a":"6","water_b":"7","rock":"8","sign":"9",
 "roof_l":"a","roof_m":"b","roof_r":"c","wall":"d","window":"e","door":"f",
 "room_floor":"g","room_wall":"h","bookshelf":"i","counter":"j",
 "table":"k","chair":"l","computer":"m","heal_pod":"n","forge":"o",
 "anvil":"p","crate":"q","barrel":"r","bed":"s","stairs":"t",
 "workbench":"u","plant":"v","capsule":"w","npc":"x","player":"y",
 "water_edge":"z","hedge":"A","flower":"B","floor_stone":"C"
}
SYMBOL={v:k for k,v in K.items()}
BLOCKED={"bush","tree","fence","rock","water_a","water_b","water_edge","roof_l","roof_m","roof_r","wall","window",
         "room_wall","bookshelf","counter","table","chair","computer","heal_pod",
         "forge","anvil","crate","barrel","bed","workbench","plant","capsule","hedge"}
OUT=Path(__file__).resolve().parents[2]/"assets"/"gb-classic"
PREVIEW=Path(__file__).resolve().parents[3]/"docs"/"gb-classic"
OUT.mkdir(exist_ok=True,parents=True);PREVIEW.mkdir(exist_ok=True,parents=True)

def tile(name,frame=0):
    im=Image.new("RGB",(T,T),C[0]);d=ImageDraw.Draw(im)
    def b(x,y,w,h,p):
        d.rectangle((x,y,x+w-1,y+h-1),fill=C[p])
    def ln(coords,p,w=1):
        d.line(coords,fill=C[p],width=w)
    # Important: four shades only, consistent 1px outlines and no gradients.
    if name=="floor": pass
    elif name=="path":
        for x,y in [(3,4),(11,11)]: b(x,y,2,1,1)
    elif name=="grass":
        for x,y in [(1,6),(7,4),(12,8)]:
            b(x+2,y+2,1,5,2);ln([(x,y+2),(x+2,y+4),(x+4,y+1)],3)
    elif name=="bush":
        b(1,5,14,10,3);b(3,3,10,4,3)
        b(2,7,12,6,2);b(5,4,6,3,1)
        for x,y in [(2,7),(9,10),(12,5)]:b(x,y,2,2,3)
    elif name=="tree":
        b(5,10,6,6,3);b(7,11,2,4,2)
        b(2,2,12,11,3);b(1,5,14,6,3)
        b(3,3,10,7,2);b(6,2,5,3,1)
        for x,y in [(3,7),(11,8),(7,5)]:b(x,y,2,2,3)
    elif name=="fence":
        for x in [2,12]:
            b(x,2,3,13,3);b(x+1,3,1,7,1)
        b(1,6,14,3,2);b(1,10,14,2,3)
    elif name in ("water_a","water_b"):
        b(0,0,16,16,1)
        for y in [3,10]:
            q=((1 if name=="water_b" else frame)*4+y*3)%7
            b(q,y,7,1,3);b((q+5)%10,y+2,5,1,0)
    elif name=="water_edge":
        b(0,5,16,11,1);b(0,4,16,1,3)
        for x in [2,8,13]:b(x,7,3,1,0)
    elif name=="rock":
        b(3,10,11,5,3);b(4,5,9,8,3)
        b(5,6,7,5,2);b(6,6,4,2,0)
    elif name=="sign":
        b(7,9,2,7,3);b(2,2,12,8,3);b(3,3,10,6,1)
        b(4,4,8,1,0);b(5,6,5,1,2)
    elif name.startswith("roof_"):
        b(0,0,16,13,2)
        for y in [2,6,10]:
            b(0,y,16,2,3);b(2,y+2,10,1,1)
        if name=="roof_l":b(0,0,2,14,3)
        if name=="roof_r":b(14,0,2,14,3)
        b(0,13,16,3,3)
    elif name=="wall":
        b(0,0,16,16,1);b(0,0,16,2,3)
        for y in [6,12]:
            b(0,y,16,1,2)
        b(0,15,16,1,3)
    elif name=="window":
        b(0,0,16,16,1);b(3,3,10,10,3)
        b(5,5,6,6,0);b(7,5,2,6,2);b(5,8,6,1,2)
        b(0,15,16,1,3)
    elif name=="door":
        b(0,0,16,16,1);b(3,2,10,14,3)
        b(5,4,6,10,2);b(9,10,2,2,0);b(2,15,12,1,3)
    elif name=="room_floor":
        for y in (5,11):b(0,y,16,1,1)
    elif name=="floor_stone":
        for y in (7,15):b(0,y,16,1,1)
        b(8,1,1,6,1);b(4,9,1,6,1)
    elif name=="room_wall":
        b(0,0,16,16,2);b(0,0,16,5,3)
        b(2,6,12,3,1);b(0,15,16,1,3)
    elif name=="bookshelf":
        b(0,1,16,15,3)
        for y in [3,9]:
            for x in [2,6,10]:b(x,y,3,4,1 if x==6 else 0)
            b(1,y+4,14,2,2)
    elif name=="counter":
        b(0,4,16,12,3);b(0,4,16,5,1)
        b(1,5,14,2,0);b(3,11,4,3,2);b(10,11,3,3,2)
    elif name=="table":
        b(1,3,14,10,3);b(2,3,12,6,1)
        b(3,4,10,2,0);b(3,12,3,3,3);b(10,12,3,3,3)
    elif name=="chair":
        b(3,3,10,11,3);b(5,5,6,6,1);b(5,1,6,3,2)
    elif name=="computer":
        b(1,2,14,13,3);b(3,4,10,7,1);b(5,6,6,2,0)
        b(7,11,2,3,2);b(3,14,10,1,2)
    elif name=="heal_pod":
        b(1,3,14,11,3);b(3,4,10,8,1)
        b(7,5,2,6,3);b(5,7,6,2,3);b(4,12,8,2,2)
    elif name=="forge":
        # Two small decorative chimney slots and a stepped four-tone flame.
        b(1,0,14,16,3);b(4,1,8,2,2)
        b(3,4,10,9,2);b(4,5,8,7,0)
        b(5,9,6,3,1);b(6,6,2,5,0);b(8,5,2,6,0)
        b(5,12,7,2,1);b(3,14,10,1,2)
    elif name=="anvil":
        # A distinct projecting horn, narrow stem and sturdy base.
        b(0,6,15,3,3);b(3,4,11,2,1)
        b(1,9,5,1,2);b(6,9,5,4,2);b(4,13,9,2,3)
        b(8,10,2,3,1)
    elif name=="workbench":
        b(1,4,14,10,3);b(2,4,12,4,1)
        b(3,6,10,1,0);b(4,11,4,3,2);b(10,11,3,3,2)
    elif name=="crate":
        b(1,1,14,14,3);b(3,3,10,10,1)
        ln([(3,3),(12,12)],2);ln([(12,3),(3,12)],2)
    elif name=="barrel":
        b(3,2,10,13,3);b(4,4,8,9,2);b(3,6,10,2,1)
        b(3,12,10,2,1)
    elif name=="bed":
        b(1,2,14,13,3);b(3,3,10,4,0);b(3,8,10,5,1)
    elif name=="stairs":
        for y in range(2,15,3):b(2,y,12,2,3);b(3,y,10,1,1)
    elif name=="plant":
        b(6,9,5,6,3);b(7,8,3,6,2)
        for x,y in [(2,4),(7,2),(11,4),(5,7)]:
            b(x,y,5,4,3);b(x+1,y+1,2,2,1)
    elif name=="capsule":
        b(2,1,12,14,3);b(4,3,8,9,1)
        b(6,4,4,5,0);b(6,12,4,2,2)
    elif name=="flower":
        for x,y in [(3,5),(9,4),(7,11)]:
            b(x,y,3,3,3);b(x+1,y+1,1,1,0)
    elif name=="hedge":
        b(0,5,16,10,3);b(1,3,14,10,2)
        for x in [3,9]:b(x,5,3,3,1)
    elif name in ("npc","player"):
        # Readable 16px person: cap, face, two hands, small backpack, boots.
        b(4,2,8,5,3);b(5,4,6,3,1)
        b(3,7,10,6,3);b(5,8,6,5,1)
        b(2,9,2,4,2);b(12,9,2,4,2)
        b(5,12,3,3,3);b(9,12,3,3,3)
        if name=="player":
            b(3,1,10,3,3);b(2,4,8,2,3)
            b(6,5,2,2,0);b(11,8,2,3,2)
        else:
            b(6,2,4,2,2);b(6,5,2,2,3);b(9,5,2,2,3)
    return interior_tile(name,v6_upgrade(name,v5_upgrade(name,art_upgrade(name,im,frame))))

build_rustle(OUT, tile("grass"))
build_houses(OUT)
build_boundaries(OUT)
build_layers(OUT,{name:tile(name) for name in K})
ATLAS_NAMES=list(K)
atlas=Image.new("RGB",(8*T,math.ceil(len(ATLAS_NAMES)/8)*T),C[0])
for i,name in enumerate(ATLAS_NAMES):
    x,y=(i%8)*T,(i//8)*T
    atlas.paste(tile(name),(x,y))
atlas.save(OUT/"gb_classic_atlas.png")
manifest={
 "version":"1.0","name":"Echo-Chroniken GB-Klassik",
 "license":"Original artwork, project-owned; inspired by constraints, not copied sprites",
 "palette":C,"tileSize":T,
 "sprites":{name:{"atlasIndex":i,"collision":name in BLOCKED} for i,name in enumerate(ATLAS_NAMES)},
 "sourceReferences":[
 "https://www.peterhajas.com/blog/pokemon_rb_map_parsing/",
 "https://opengameart.org/content/4-colour-interior-tileset",
 "https://opengameart.org/content/4-colour-overworld-tileset"
 ]}

def field(w,h,name):
    grid=[["0" for x in range(w)] for y in range(h)]
    def fill(sym,x,y,ww,hh):
        for yy in range(y,y+hh):
            for xx in range(x,x+ww):
                if 0<=xx<w and 0<=yy<h: grid[yy][xx]=K[sym]
    def stamp(sym,x,y):fill(sym,x,y,1,1)
    def house(door_x,door_y):
        # Five cells wide. The facade and collision footprint share the door anchor.
        fill("wall",door_x-2,door_y,5,1)
        fill("roof_m",door_x-2,door_y-2,5,2)
        for row in (door_y-2,door_y-1):
            stamp("roof_l",door_x-2,row)
            stamp("roof_r",door_x+2,row)
        stamp("window",door_x-1,door_y)
        stamp("window",door_x+1,door_y)
        stamp("door",door_x,door_y)
    if name=="Wurzelheim":
        for x in range(w):
            if x not in (9,10):
                stamp("tree",x,0);stamp("tree",x,h-1)
        for y in range(1,h-1):
            stamp("tree",0,y);stamp("tree",w-1,y)
        for x,y,ww,hh in ((1,2,1,5),(18,1,1,7),(1,10,1,6),
                          (2,12,1,4),(17,13,2,3),(3,16,4,1),(13,16,4,1)):
            fill("tree",x,y,ww,hh)
        for x,y in ((4,4),(14,4),(4,11),(14,11)):house(x,y)
        # One open court between the north houses and the lower lane.
        fill("path",8,0,4,18)
        for y in (0,h-1):
            stamp("tree",8,y);stamp("tree",11,y)
        fill("path",2,5,16,3)
        fill("path",3,12,13,2)
        fill("floor_stone",7,7,6,2)
        stamp("sign",11,8)
        stamp("npc",7,9)
        fill("fence",13,14,3,1)
        for x,y in ((2,8),(3,8),(2,7),(17,7),(18,8),(7,15),(13,15)):
            stamp("grass",x,y)
        for x,y in ((6,5),(7,5),(16,12),(16,13),(5,14),(6,14)):
            stamp("flower",x,y)
        fill("water_a",16,12,2,2)
        stamp("sign",18,12)
        stamp("player",9,9)
    elif name=="Route":
        # A clear trail links both town gates. Openings lead into two forest clearings.
        fill("tree",0,0,2,h)
        fill("tree",w-2,0,2,h)
        for x in range(2,w-2):
            if x not in (9,10):
                stamp("tree",x,0);stamp("tree",x,h-1)
        fill("tree",2,1,5,3)
        fill("tree",13,1,5,4)
        fill("tree",2,10,3,5)
        fill("tree",15,13,3,4)
        fill("tree",3,16,4,1)
        fill("path",9,0,2,h)
        fill("path",6,7,3,2)
        fill("path",11,11,4,2)
        fill("grass",3,5,4,2)
        fill("grass",4,7,2,2)
        fill("grass",6,10,3,3)
        fill("grass",12,6,4,3)
        fill("grass",12,13,3,3)
        fill("grass",7,14,2,2)
        fill("water_a",15,9,3,3)
        fill("fence",14,10,1,3)
        for x,y in ((3,9),(5,4),(7,5),(7,13),(11,16),(16,6)):
            stamp("flower",x,y)
        stamp("sign",7,9)
        stamp("npc",13,9)
        stamp("rock",16,12)
        stamp("player",10,15)
    else:
        fill("room_floor",1,1,w-2,h-2)
        fill("room_wall",0,0,w,1)
        fill("room_wall",0,h-1,w,1)
        fill("room_wall",0,1,1,h-2)
        fill("room_wall",w-1,1,1,h-2)
        stamp("door",w//2,h-1)
        if name=="Laden":
            fill("bookshelf",1,1,3,1)
            fill("counter",5,2,3,1)
            stamp("npc",6,1)
            stamp("bookshelf",1,4)
        elif name=="Heilstation":
            fill("counter",4,2,4,1)
            stamp("heal_pod",5,1)
            stamp("npc",7,1)
            fill("chair",1,3,2,1)
            stamp("plant",8,1)
        elif name=="Schmiede":
            fill("bookshelf",1,1,2,1)
            stamp("workbench",2,2)
            stamp("forge",6,1)
            stamp("crate",6,2)
            stamp("npc",5,2)
            stamp("anvil",5,3)
        elif name=="Teamtausch":
            fill("computer",1,1,2,1)
            fill("capsule",5,1,2,1)
            stamp("npc",5,2)
            stamp("counter",5,3)
        elif name=="Wohnhaus":
            stamp("bed",1,1)
            stamp("bookshelf",5,1)
            stamp("table",3,2)
            stamp("chair",4,2)
            stamp("plant",5,4)
        stamp("player",w//2,h-3)
    return grid

SPECS=[
 ("Wurzelheim",20,18),("Route",20,18),
 ("Laden",9,7),("Heilstation",10,7),
 ("Schmiede",8,6),("Teamtausch",8,6),("Wohnhaus",7,6)
]
scenes={}
for name,w,h in SPECS:
    grid=field(w,h,name)
    result=Image.new("RGB",(w*T,h*T),C[0])
    for y,row in enumerate(grid):
        for x,t in enumerate(row):
            result.paste(tile(SYMBOL[t]),(x*T,y*T))
    result.save(PREVIEW/(name.lower()+".png"),optimize=True)
    # Simple tile collision data, independent of static display image.
    scenes[name]={"width":w,"height":h,
      "rows":["".join(row) for row in grid],
      "blocked":[[x,y] for y,row in enumerate(grid) for x,z in enumerate(row)
                 if SYMBOL[z] in BLOCKED]}
    if name=="Wurzelheim":
        scenes[name]["doorLinks"]={"4,4":"Wohnhaus","14,4":"Heilstation",
                                  "4,11":"Schmiede","14,11":"Laden"}
        scenes[name]["worldExits"]={"north":"Route","south":"Route"}
    print("GB_SCENE",name,w,h,"blocked",len(scenes[name]["blocked"]))
with open(OUT/"scene_maps.json","w",encoding="utf-8") as f:
    json.dump({"version":"1.0","scenes":scenes,"symbols":SYMBOL},f,indent=2,ensure_ascii=False)
with open(OUT/"tile_manifest.json","w",encoding="utf-8") as f:
    json.dump(manifest,f,indent=2,ensure_ascii=False)
# One sheet for evaluating *reuse* across different map types.
cellw,cellh=350,310
montage=Image.new("RGB",(cellw*2,cellh*4),"#dededb")
from PIL import ImageFont
ds=ImageDraw.Draw(montage)
for i,(name,w,h) in enumerate(SPECS):
    px=(i%2)*cellw+12;py=(i//2)*cellh+16
    ds.text((px,py),name,fill=C[3])
    src=Image.open(PREVIEW/(name.lower()+".png"))
    factor=min((cellw-22)/src.width,(cellh-40)/src.height)
    factor=max(1,int(factor))
    montage.paste(src.resize((src.width*factor,src.height*factor),Image.Resampling.NEAREST),
        (px,py+22))
montage.save(PREVIEW/"ALLE_7_REFERENZKARTEN.png",optimize=True)
# Unscaled atlas plus magnified labeled sample for handover.
proof=atlas.resize((atlas.width*3,atlas.height*3),Image.Resampling.NEAREST)
proof.save(PREVIEW/"GB_4_FARBTILES_3X.png",optimize=True)
print("GAMEBOY_KIT_READY",len(ATLAS_NAMES),"unique tiles",len(SPECS),"scenes")
