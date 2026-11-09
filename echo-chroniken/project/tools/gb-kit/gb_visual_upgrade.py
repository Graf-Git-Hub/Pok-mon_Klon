"""Original 16x16 four-shade RPG sprite library, revision 2.

All art is tile based and hand-authored at 1:1 pixel resolution. It replaces the
placeholder geometric symbols without changing 39 atlas slots or game logic.
This is intentionally small-scale Game Boy-like sprite craft, not a rasterized
modern illustration or Nintendo sprite extraction.
"""
from PIL import Image,ImageDraw

WHITE="#f4f4ef"
LIGHT="#c7c8c4"
MID="#777a7b"
INK="#24262b"
P=[WHITE,LIGHT,MID,INK]

def upgrade(name,old,frame=0):
    if name not in {
       "tree","bush","hedge","roof_l","roof_m","roof_r","wall","window",
       "door","fence","sign","grass","flower","room_wall","bookshelf",
       "counter","table","chair","computer","heal_pod","forge","anvil",
       "workbench","crate","barrel","bed","plant","capsule","npc",
       "player","rock","water_a","water_b","water_edge"
    }: return old
    im=Image.new("RGB",(16,16),WHITE)
    d=ImageDraw.Draw(im)
    def b(x,y,w,h,c):
        if w>0 and h>0:d.rectangle((x,y,x+w-1,y+h-1),fill=P[c])
    def ln(coords,c,width=1):
        d.line(coords,fill=P[c],width=width)
    def pol(coords,c):d.polygon(coords,fill=P[c])
    def ell(coords,c):d.ellipse(coords,fill=P[c])
    if name=="tree":
        # Individual broad leafy tree with a crown and tiny trunk, not a box.
        b(6,10,4,6,3);b(7,10,2,5,2)
        pol([(4,2),(6,1),(10,1),(12,3),(14,5),(14,9),(12,11),
             (10,12),(5,12),(2,10),(1,7),(2,4)],3)
        pol([(5,3),(7,2),(10,3),(12,5),(12,9),(9,10),(5,10),
             (3,8),(3,5)],2)
        pol([(5,3),(8,3),(9,4),(7,5),(4,5)],1)
        b(4,6,3,2,1);b(8,7,3,2,1);b(6,9,3,1,1)
        b(10,10,2,1,3);b(2,8,2,2,3)
    elif name in ("bush","hedge"):
        pol([(0,9),(1,5),(3,5),(4,3),(7,4),(9,2),(12,4),
             (14,5),(15,8),(15,13),(13,15),(2,15),(0,13)],3)
        pol([(2,8),(4,6),(6,7),(9,5),(12,7),(13,10),(12,13),
             (3,13),(2,11)],2)
        for x,y in [(3,8),(8,7),(11,9),(6,11)]:
            b(x,y,3,1,1)
        b(1,13,14,2,3)
        if name=="hedge":
            b(1,13,14,2,2)
            for x in (3,9):b(x,12,2,2,3)
    elif name=="grass":
        # Three readable stalks, dark blades and deliberately clear soil.
        for x,y in [(1,6),(6,3),(11,6)]:
            ln([(x,y+3),(x+2,y+6),(x+4,y+1)],3)
            ln([(x+1,y+4),(x+2,y+1),(x+3,y+5)],2)
        b(3,13,2,1,1);b(13,12,1,1,1)
    elif name=="flower":
        for x,y in [(3,5),(10,9)]:
            b(x+1,y,2,5,2);b(x,y+2,4,2,3)
            b(x+1,y+2,2,2,0);b(x+2,y+5,1,3,2)
        b(4,13,2,1,2)
    elif name.startswith("roof_"):
        # Roof eave, clearly recognizable shingle rows and a sloped corner.
        b(0,2,16,14,3)
        b(0,3,16,10,2)
        for y in (3,8):
            b(0,y,16,1,1);b(0,y+4,16,1,3)
            for x in (3 if y==3 else 0, 11 if y==3 else 8):
                if x<16:b(x,y+1,min(5,16-x),1,1)
            for x in (5 if y==3 else 2,13 if y==3 else 10):
                if x<16:b(x,y+2,1,2,3)
        if name=="roof_l":
            pol([(0,0),(3,0),(0,4)],0)
            b(0,2,2,13,3);b(1,3,1,9,1)
        if name=="roof_r":
            pol([(12,0),(15,0),(15,4)],0)
            b(14,2,2,13,3);b(14,3,1,9,1)
        b(0,13,16,3,3);b(2,13,12,1,1)
    elif name in ("wall","window","door"):
        b(0,0,16,16,1)
        b(0,0,16,2,3)
        b(0,3,16,1,2);b(0,7,16,1,2);b(0,12,16,1,2)
        b(2,5,9,1,0);b(7,10,8,1,0)
        b(0,15,16,1,3)
        if name=="window":
            b(2,2,12,12,3);b(4,4,8,8,0)
            b(7,4,2,8,3);b(4,7,8,2,3)
            b(4,4,3,3,1);b(9,9,3,3,1)
            b(1,13,14,2,2);b(2,14,12,1,3)
        elif name=="door":
            b(2,2,12,14,3);b(4,4,8,11,2)
            b(5,5,6,8,1);b(10,10,2,2,0)
            b(2,15,12,1,3)
        else:
            b(1,4,2,1,0);b(11,9,3,1,0)
    elif name=="fence":
        for x in (2,12):
            b(x,1,3,15,3);b(x+1,3,1,10,1)
            b(x-1,3,5,2,3)
        b(0,7,16,3,3);b(0,11,16,2,3)
        b(1,8,14,1,1);b(1,12,14,1,1)
    elif name=="sign":
        b(7,9,2,7,3)
        b(1,2,14,9,3);b(3,4,10,5,1)
        b(4,5,8,1,0);b(5,7,6,1,2)
        b(3,11,10,1,2)
    elif name=="rock":
        pol([(2,10),(4,5),(9,4),(12,6),(14,11),(12,14),(4,14)],3)
        pol([(4,9),(6,6),(10,6),(12,10),(10,12),(5,12)],2)
        b(6,7,3,1,0);b(7,13,4,1,1)
    elif name in ("water_a","water_b","water_edge"):
        b(0,0,16,16,1)
        shift=3 if name=="water_b" else 0
        for y in (3,10):
            x=(2+shift+y)%7
            b(x,y,7,1,3);b((x+6)%10,y+2,5,1,0)
        if name=="water_edge":
            b(0,0,16,4,0);b(0,4,16,1,3)
    elif name=="room_wall":
        b(0,0,16,16,1);b(0,0,16,6,3)
        b(2,2,12,2,2);b(2,7,12,1,0)
        b(0,15,16,1,3);b(3,11,10,1,2)
    elif name=="bookshelf":
        b(0,0,16,16,3)
        b(2,1,12,13,2)
        for y in (2,9):
            for x in (3,6,9,12):
                b(x,y,2,5,0 if x%2 else 3)
                b(x,y+3,1,1,1)
            b(1,y+5,14,2,3)
        b(0,14,16,2,3)
    elif name=="counter":
        b(0,3,16,13,3)
        b(1,4,14,6,1);b(2,5,12,2,0)
        for x in (3,11):
            b(x,11,3,3,2);b(x+1,12,1,1,0)
        b(0,14,16,2,3)
    elif name=="table":
        b(1,3,14,10,3);b(2,4,12,7,1)
        b(3,5,10,2,0)
        b(3,12,3,3,3);b(11,12,3,3,3)
    elif name=="chair":
        b(3,2,10,13,3);b(5,4,6,8,1)
        b(5,5,6,2,2);b(6,10,4,3,2)
    elif name=="computer":
        b(1,1,14,15,3);b(3,3,10,8,2);b(4,4,8,6,0)
        b(5,5,5,1,3);b(6,7,5,1,3)
        b(6,11,4,2,2);b(3,13,10,2,1)
    elif name=="heal_pod":
        b(1,2,14,12,3);b(3,3,10,9,1)
        b(7,4,2,7,3);b(4,7,8,2,3)
        b(4,12,8,2,2);b(0,14,16,2,3)
    elif name=="forge":
        b(1,1,14,15,3);b(3,3,10,3,2)
        b(3,6,10,7,1);b(4,7,8,6,3)
        pol([(5,12),(6,9),(8,11),(9,7),(11,11),(12,12)],0)
        b(3,13,10,2,2);b(1,15,14,1,3)
    elif name=="anvil":
        pol([(0,6),(4,5),(4,4),(14,4),(14,8),
             (12,10),(9,10),(10,13),(13,13),(13,15),
             (3,15),(3,13),(6,13),(6,10),(3,10)],3)
        b(5,5,9,2,1);b(5,10,4,2,2)
    elif name=="workbench":
        b(1,3,14,11,3);b(2,4,12,5,1)
        b(3,5,10,1,0);b(4,8,3,3,2);b(10,7,3,2,3)
        b(4,12,3,3,3);b(10,12,3,3,3)
    elif name=="crate":
        b(1,1,14,14,3);b(3,3,10,10,1)
        ln([(3,3),(12,12)],2,2);ln([(12,3),(3,12)],2,2)
        b(4,4,2,2,0)
    elif name=="barrel":
        b(3,2,10,13,3);b(4,4,8,9,2)
        b(2,5,12,2,1);b(2,11,12,2,1)
        b(5,3,6,1,0)
    elif name=="bed":
        b(1,1,14,14,3);b(3,2,10,12,1)
        b(3,2,10,4,0);b(3,7,10,6,2);b(4,12,8,1,1)
    elif name=="plant":
        b(6,11,5,4,3);b(7,9,3,4,2)
        for x,y in [(3,4),(7,2),(10,5)]:
            pol([(x,y+4),(x,y+1),(x+2,y),(x+5,y+1),(x+4,y+5)],3)
            b(x+1,y+1,2,2,1)
    elif name=="capsule":
        b(2,1,12,14,3);b(4,3,8,9,1)
        b(6,4,4,5,0);b(5,12,6,2,2)
    elif name in ("npc","player"):
        # Consistent 16px humanoids, cap/hair, eyes, torso, gloves, shoes.
        b(4,1,8,5,3);b(5,4,6,4,1)
        b(6,6,2,1,3);b(10,6,1,1,3)
        b(3,8,10,5,3);b(5,9,6,4,2)
        b(2,9,2,4,2);b(12,9,2,4,2)
        b(4,13,4,3,3);b(9,13,4,3,3)
        if name=="player":
            b(3,1,10,3,3);b(2,4,11,2,3);b(7,1,3,1,1)
            b(11,8,2,4,1);b(6,9,3,1,1)
        else:
            b(5,2,6,2,2);b(3,9,2,3,1)
    return im
