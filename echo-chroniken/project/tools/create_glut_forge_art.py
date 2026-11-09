#!/usr/bin/env python3
"""Echo-Chroniken: original compact Game Boy-era four-tone forge, 23x17 tiles."""
from PIL import Image,ImageDraw
from pathlib import Path
T=16
W,H=23*T,17*T
K="#28292b"    # pixel ink / darkest shade
D="#606168"    # charcoal
M="#a5a6a7"    # stone gray
L="#e4e4de"    # paper white
im=Image.new("RGB",(W,H),L)
d=ImageDraw.Draw(im)
def box(x,y,w,h,c,edge=None):
    d.rectangle((x,y,x+w-1,y+h-1),fill=c,outline=edge)
def ln(x,y,x2,y2,c,width=1):
    d.line((x,y,x2,y2),fill=c,width=width)
def tile(x,y,w,h,c):
    box(x*T,y*T,w*T,h*T,c,K)
def shelf(x,y,w,h):
    tile(x,y,w,h,M)
    box(x*T+3,y*T+2,w*T-6,4,L)
    box(x*T+3,(y+h)*T-5,w*T-6,3,D)
# restrained wooden-plank interior floor; classic 16px pattern
for y in range(34,256,12):
    ln(16,y,351,y,M)
    ln(16,y+1,351,y+1,M)
for y in range(42,255,24):
    for x in range(30+(y%48)//2,344,64):
        ln(x,y,x,y+6,M)
# dark architectural edge with little repeating stone tiles
box(0,0,W,32,D)
for y in (0,16):
    for x in range(0,W,T):
        box(x,y,16,16,M,K)
        box(x+3,y+2,10,3,L)
for y in range(2,17):
    for x in (0,22):
        box(x*T,y*T,T,T,M,K)
        ln(x*T+3,y*T+3,x*T+12,y*T+3,L)
for x in range(1,22):
    box(x*T,16*T,T,T,M,K)
    ln(x*T+2,16*T+3,x*T+13,16*T+3,L)
box(16,32,336,4,D)
for x in range(25,350,32):
    box(x,38,20,3,M)
# Small ledger counter (x2..5, y2..4) 
shelf(2,2,4,3)
box(35,50,55,10,D,K)
for x in (39,55,71):
    box(x,51,12,8,L,K)
box(37,64,52,10,D)
for x in (42,76):box(x,74,3,4,K)
# Stock shelf (x7..9, y2..4)
shelf(7,2,3,3)
for x in (116,131,146):
    box(x,48,12,9,D,K)
    box(x+2,49,8,3,L)
box(115,65,48,5,K)
# tool cupboard (x12..14, y2..4)
shelf(12,2,3,3)
for x in (197,212,227):
    box(x,45,10,14,K)
    box(x+2,47,6,8,M)
    box(x+3,48,4,3,L)
# back-wall blacksmith's tools
for x in (107,126,160,259):
    box(x,39,3,18,K)
    box(x-3,41,9,4,D)
    box(x-1,42,5,2,L)
# compact hot forge x17..20, y2..5
tile(17,2,4,4,D)
box(279,46,46,46,M,K)
box(283,51,38,36,K)
box(290,62,24,21,D)
box(293,72,18,9,L)
box(297,66,10,13,L)
box(301,62,4,11,L)
box(281,93,42,4,K)
box(287,96,29,4,L)
# original doorway from Aschenruh left (x1,y7)
box(0,107,30,42,K)
box(15,110,16,35,L)
box(19,113,9,29,M)
box(22,115,3,23,D)
# wall tools, no huge shadow/smooth lighting
for x in (45,62):
    box(x,87,3,11,D)
    box(x-2,85,7,4,K)
    box(x-1,87,5,2,L)
# product table x4..7 y8..9
tile(4,8,4,2,D)
box(66,130,59,4,L)
for x in (73,91,109):
    d.ellipse((x,137,x+11,149),fill=L,outline=K,width=2)
box(68,152,56,4,D)
# tiny anvil x10..11 y8..9
tile(10,8,2,2,M)
box(164,135,21,7,K)
box(166,133,19,4,L)
box(172,143,10,8,D)
box(169,152,16,4,K)
# right workbench x14..18 y8..9
shelf(14,8,5,2)
for x in (235,254,273):
    box(x,140,12,10,K)
    box(x+2,141,8,3,L)
# lower shelf x2..6 y13..14
shelf(2,13,5,2)
for x in (42,65,88):
    box(x,219,17,15,D,K)
    box(x+4,222,9,4,L)
# bottom-right ore storage x15..18 y13..14
shelf(15,13,4,2)
for x in (245,265,283):
    d.ellipse((x,219,x+14,233),fill=D,outline=K,width=2)
    box(x+5,220,6,3,L)
for x in (312,329):
    d.ellipse((x,215,x+13,227),fill=M,outline=K,width=2)
    box(x+2,227,10,12,D)
# transition to Glutschacht, exact x21,y13
box(336,208,32,46,K)
box(338,211,16,37,L)
box(340,215,12,29,M)
box(343,218,6,25,D)
# small blacksmith symbol, and two stone/crystal icons
box(45,173,25,18,K)
box(48,176,19,12,L)
box(56,179,3,8,D)
box(52,182,12,3,D)
for x,y in ((290,180),(314,177)):
    box(x+3,y,7,10,K)
    box(x+5,y+2,3,6,L)
    box(x,y+10,14,7,M,K)
# no Pokémon logos, no Pokéballs
out=Path(__file__).resolve().parents[1]/"assets"/"maps"/"glut_forge_v2.png"
out.parent.mkdir(exist_ok=True,parents=True)
im.save(out,optimize=True)
print("RETRO_FORGE",out,im.size,"colors",len(im.getcolors(W*H)))
