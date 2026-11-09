#!/usr/bin/env python3
"""Hand-art-directed forge interior for the REAL Echo-Chroniken glut_forge map.

Pixel dimensions = 45 x 30 tiles of 16 px. The artwork is not a substitute for
the game's tilemap: registry.js still owns collision, portal and quest data.
Run: python tools/create_glut_forge_art.py
"""
from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import random, math

W,H = 720,480
R = random.Random(20261109)
im = Image.new("RGBA",(W,H),(22,21,29,255))
d = ImageDraw.Draw(im)
C = {
 "void":"#1e1c29","black":"#282734","mortar":"#343440",
 "wall":"#655c62","wall2":"#928178","walllight":"#b39a88",
 "floor":"#777179","floor2":"#8b8286","floor3":"#625e6c",
 "sand":"#b59a7c","sand2":"#d3b38d","sandedge":"#785d52",
 "wood":"#795341","woodhi":"#bc875e","wooddeep":"#4e3640",
 "iron":"#414755","ironmid":"#687b86","silver":"#c3d0cf",
 "copper":"#bb734c","ember":"#e56f38","gold":"#f3c378",
 "cream":"#ffe6ad","blue":"#78aaba","red":"#ae5652",
}
def rect(x0,y0,x1,y1,col,outline=None,width=1):
 d.rectangle((round(x0),round(y0),round(x1),round(y1)),fill=col,outline=outline,width=width)
def poly(points,col,outline=None,width=1):
 d.polygon(points,fill=col)
 if outline:d.line(points+[points[0]],fill=outline,width=width,joint="curve")
def line(points,fill,width=1):
 d.line(points,fill=fill,width=width)
def ellipse(box,fill,outline=None,width=1):
 d.ellipse(box,fill=fill,outline=outline,width=width)
def brick(x,y,w=30,h=15,fill=None):
 c=fill or R.choice(["#786b6e","#857677","#6b656b","#8e7b77"])
 rect(x,y,x+w-2,y+h-2,c,"#413b48",2)
 line([(x+2,y+2),(x+w-5,y+2)],"#a08d86",2)
 if R.random()<.26: line([(x+w*.35,y+4),(x+w*.35+4,y+8),(x+w*.35+2,y+11)],"#514957")
def shadow(x0,y0,x1,y1):
 rect(x0+5,y0+5,x1+5,y1+5,"#393340")
def crate(x,y,w=31,h=28):
 shadow(x,y,x+w,y+h)
 rect(x,y,x+w,y+h,"#a37349","#4e3540",3)
 rect(x+4,y+4,x+w-4,y+h-4,"#bb8954","#d3a36c",2)
 line([(x+5,y+5),(x+w-5,y+h-5)],"#7a4a39",3)
 line([(x+w-5,y+5),(x+5,y+h-5)],"#7a4a39",3)
 for xx in [x+3,x+w-3]:
  for yy in [y+3,y+h-3]: rect(xx,yy,xx+2,yy+2,"#dac09a")
def barrel(x,y):
 ellipse((x+2,y+2,x+29,y+32),"#463943")
 rect(x+2,y+8,x+29,y+29,"#95633d","#553c3d",2)
 ellipse((x+2,y,x+29,y+15),"#b4814f","#493743",3)
 ellipse((x+8,y+4,x+23,y+11),"#624b42","#c29561",2)
 rect(x+1,y+19,x+30,y+22,"#4e5157")
def light(x,y):
 # frame + glass, little crossbar
 rect(x-8,y-12,x+8,y+14,"#3d414c","#272939",3)
 rect(x-5,y-8,x+5,y+10,"#f4b456","#ffd98a",2)
 rect(x-3,y-5,x+3,y+7,"#ffe9a6")
 rect(x-10,y-14,x+10,y-11,"#a9aca6")
 rect(x-7,y+12,x+7,y+15,"#b6a188")
def steel(x,y,w,h):
 shadow(x,y,x+w,y+h)
 rect(x,y,x+w,y+h,"#4b5660","#2c303c",3)
 rect(x+3,y+3,x+w-3,y+9,"#9ba8a8")
 rect(x+5,y+11,x+w-5,max(y+11,y+h-6),"#73808a")
def ore(x,y,tone):
 ellipse((x,y+6,x+27,y+25),"#4a414a")
 poly([(x+1,y+15),(x+8,y+5),(x+19,y+3),(x+28,y+14),(x+22,y+25),(x+5,y+24)],tone,"#4b4650",2)
 poly([(x+8,y+8),(x+18,y+5),(x+20,y+11),(x+14,y+15)],"#eee0bf")
def lamp_glow(cx,cy,r,col):
 glow=Image.new("RGBA",(W,H),(0,0,0,0));g=ImageDraw.Draw(glow)
 g.ellipse((cx-r,cy-r,cx+r,cy+r),fill=col)
 return glow.filter(ImageFilter.GaussianBlur(r//2))

# --- FLOOR: large coherent stone instead of 60,000 confetti pixels
rect(20,40,699,449,"#635c66")
for y in range(43,452,16):
 for x in range(22,701,20):
  j=R.randrange(-3,4)
  col=R.choice(["#7c747b","#82777b","#706d77","#8f8080","#716b73"])
  rect(x,y+1,x+19,y+15,col)
  line([(x+1,y+1),(x+15,y+1)],"#a2948c",1)
  line([(x+18,y+2),(x+18,y+13)],"#504b57",1)
  if R.random()<.23:
   line([(x+3+j,y+8),(x+8+j,y+8),(x+11+j,y+11)],"#655d66",1)
# Two different swept-stone corridors are deliberately connected.
poly([(23,116),(290,116),(290,144),(334,144),(334,436),(384,436),(384,177),(680,177),(680,208),(383,208),(383,158),(275,158),(275,151),(23,151)],"#9e826e","#5a4e56",5)
poly([(35,122),(286,122),(286,149),(343,149),(343,437),(374,437),(374,191),(681,191),(681,200),(373,200),(373,151),(36,142)],"#bda083")
# simple intentionally tiled walkway joints
for x in range(40,685,31):
 if x<285 or x>386:
  line([(x,122 if x<285 else 180),(x,143 if x<285 else 203)],"#967760",1)
for y in range(166,435,28):
 line([(342,y),(375,y)],"#96765e",2)
# Furnace lighting warms floor, not full-screen ambient wash
im = Image.alpha_composite(im,lamp_glow(557,171,140,(238,112,32,38)))
d = ImageDraw.Draw(im)

# --- Heavy architectural perimeter: real thick stone wall with separated doorway
rect(0,0,W,47,"#262733")
rect(0,0,W,26,"#413e4a")
for row,y in enumerate([2,19,34]):
 for x in range((-14 if row%2 else 2),W,32):
  brick(x,y,32,17, R.choice(["#76666b","#7d6b6b","#927d76"]))
rect(0,46,718,51,"#312f3e")
rect(0,48,718,52,"#b49a80")
# strong side and bottom edges
for x in [0,698]:
 rect(x,48,x+21,449,"#4d4650")
 for y in range(50,452,22):brick(x+1,y,21,22)
rect(0,450,719,479,"#2b2b38")
for x in range(0,721,32):
 brick(x,451,31,25,"#73686c")
# narrow gate left at exact portal y=7
rect(0,110,24,149,"#2c2a35")
rect(8,112,28,145,"#443742")
rect(13,113,33,144,"#e4a45f")
rect(18,116,34,142,"#f5d4a0")
rect(19,145,42,150,"#b18a70")
# exit to Glutschacht at x21 y26
rect(320,434,375,480,"#242430")
rect(328,439,366,479,"#453f48")
rect(334,446,360,479,"#e8af70")
rect(340,452,354,479,"#ffe0a2")
rect(314,439,324,479,"#88747c");rect(373,439,384,479,"#88747c")
rect(310,431,391,441,"#3c3540")
rect(316,433,385,437,"#d1ad85")
# Raised masonry pillars to suggest rooms
for x,y in [(286,48),(416,48),(286,216),(416,216),(690,281)]:
 shadow(x-12,y,x+13,y+32)
 rect(x-11,y,x+12,y+30,"#665b62","#342e3c",3)
 rect(x-8,y+2,x+9,y+8,"#a5978b")
 rect(x-9,y+23,x+11,y+28,"#a8927f")

# --- Weapon rack along north-west wall (away from story marker interaction tiles)
rect(42,53,271,76,"#4b3840","#b38b66",4)
rect(46,57,265,69,"#84583f")
for i,x in enumerate(range(64,254,32)):
 rect(x,60,x+8,86,"#46474b","#282d35",2)
 rect(x+2,62,x+6,67,"#dbe3d3")
 if i%2==0:
  poly([(x+4,67),(x-1,82),(x+9,82)],"#b9c6c6","#4e5560",2)
 else:
  rect(x-4,75,x+12,79,"#ced5cc")
 rect(x+2,82,x+5,101,"#77513d")
# Individual furnace bellows and tool cabinets above right side
rect(305,56,410,91,"#4d4648","#c09a71",3)
for i in range(5):
 steel(311+i*19,61,15,25)
 rect(315+i*19,68,325+i*19,73,R.choice(["#c5a6a1","#aa8582","#aebbb5"]))
# right wall glow metal struts
rect(449,52,669,73,"#58474a")
rect(459,58,659,69,"#98715e")
for x in [447,671]:
 rect(x,53,x+12,246,"#48414b")
 for y in range(54,248,20):rect(x+2,y,x+9,y+13,"#8b7574")

# --- Main furnace complex: 200+ px of distinctive stone/steel construction.
shadow(468,80,652,255)
rect(464,79,658,250,"#534148","#272631",6)
rect(473,85,649,243,"#94726a","#bd9780",5)
for y in range(85,237,21):
 for x in range(477,642,31):brick(x,y,31,20,R.choice(["#9d7970","#ad8d78","#856967"]))
# chimney runs into upper wall; 70 px x 70 px
rect(526,22,589,111,"#514249","#2f2d3c",4)
for y in range(30,108,17):
 for x in [528,556]: brick(x,y,30,17,"#96766e")
rect(491,122,635,229,"#37323b","#242630",5)
# Stone arch with highlight rim and inner intense ember gradient
poly([(482,210),(482,147),(493,121),(517,107),(605,107),(626,124),(639,149),(639,224)],"#c2987c","#57404a",5)
poly([(499,218),(499,151),(517,134),(540,127),(592,127),(619,143),(624,163),(624,218)],"#413540","#3a3036",3)
rect(516,164,611,216,"#b84635")
rect(522,170,606,215,"#f28933")
poly([(523,215),(536,180),(548,192),(556,155),(567,184),(583,168),(595,197),(605,185),(607,214)],"#ffd05f")
poly([(534,215),(547,197),(557,204),(563,178),(570,199),(585,181),(600,215)],"#ffe8a2")
for x in range(525,605,9):
 rect(x,219,x+6,224,"#443943")
rect(481,224,644,243,"#47404a")
rect(484,224,638,233,"#aa8570")
rect(493,240,632,253,"#352d38","#191c29",3)
# side furnace ducts, pipes, bellows 
rect(644,104,671,154,"#595760","#2f333d",3)
rect(652,110,663,148,"#80949a")
rect(668,128,691,136,"#b48a6c")
rect(458,144,471,237,"#66727a")
rect(447,150,463,214,"#9ba3a1","#454650",3)
# hot metal crucible lower right
ellipse((620,257,679,299),"#473941","#242631",4)
ellipse((626,259,672,282),"#f0a845","#5e4240",5)
ellipse((637,265,661,276),"#ffe5a0")

# --- Upper-left readable work area: table, steel ingots and woodworking
shadow(52,169,285,225)
rect(49,170,286,220,"#5d3d39","#312e37",5)
rect(54,170,282,204,"#ba8457","#d6a475",3)
for xx in range(57,276,25):line([(xx,176),(xx,201)],"#926545",2)
rect(60,201,72,227,"#6e483e")
rect(261,201,273,227,"#6e483e")
for x,y in [(80,181),(121,182),(166,180),(217,182)]:
 steel(x,y,33,16)
 rect(x+4,y+3,x+27,y+8,"#c5c9c2")
# hammer heads and vice
rect(235,167,256,181,"#4e5964","#222b36",3)
rect(243,179,248,198,"#c69d62")
rect(236,188,257,192,"#b8a39a")
# tool hook board at left central wall
rect(38,235,195,254,"#443c43","#ab8162",4)
for x in [55,84,112,142,169]:
 rect(x,238,x+4,262,"#6a7680")
 rect(x-5,255,x+11,260,"#adb8b9")
 if x%2: rect(x+1,260,x+3,268,"#b98b61")

# --- Central anvil station: signature silhouette and hammer on a stump
ellipse((326,306,440,343),"#39333d")
rect(350,275,416,328,"#6a452f","#3a3035",5)
ellipse((343,267,417,298),"#916f4f","#443c42",4)
for xx in [354,388]:
 rect(xx,286,xx+9,315,"#ad754c")
rect(337,261,417,279,"#454a55","#282d37",4)
poly([(330,257),(345,244),(361,246),(375,257),(413,251),(430,255),(419,268),(382,273),(347,269)],"#a7b7b6","#46525b",3)
rect(352,253,396,258,"#dce0d1")
rect(366,271,388,296,"#616b76")
rect(357,297,397,306,"#49515c")
# small adjacent hammer and cooling trough
rect(436,280,471,297,"#3c424c","#20262e",4)
rect(442,283,464,290,"#a0abb4")
rect(446,292,451,321,"#a27558")
rect(456,289,464,313,"#5b626b")
steel(475,309,530,29)
rect(485,321,520,332,"#407d93")
rect(487,324,511,326,"#a7d1d9")
# ember chips surrounding the station, deliberately sparse
for x,y in [(321,309),(319,321),(431,330),(463,347)]:
 rect(x,y,x+3,y+3,"#a85039");rect(x+1,y,x+2,y+1,"#ffc26a")

# --- Lower left: shopkeeper counter with drawers, a sword display, fabric rug
shadow(60,325,268,415)
rect(72,336,267,401,"#4f3439","#2f2937",4)
rect(79,344,260,392,"#b78b67","#d2a986",3)
for x in range(88,260,36):
 rect(x,355,x+28,373,"#795444","#4c3540",3)
 rect(x+9,362,x+18,366,"#c9a77e")
rect(65,328,273,343,"#b47c57","#442f37",4)
rect(71,330,269,335,"#e4b587")
for x in [100,143,190,226]:
 rect(x,313,x+12,333,"#676875","#373641",3)
 rect(x+4,313,x+8,317,"#d4d6bf")
# rich rust-orange woven rug bottom center-left
rect(77,411,275,437,"#643e46","#a8755b",3)
rect(83,416,269,431,"#924c4c")
for x in range(91,260,14):
 rect(x,424,x+5,426,"#e1ad7a")
# handmade wall-mounted sword showcase
rect(38,278,277,309,"#4d343d","#b18d6e",4)
for x in [72,110,149,188,226]:
 rect(x,283,x+6,302,"#9db6bb","#2f3841",2)
 poly([(x-2,287),(x+3,278),(x+8,287)],"#d8d9c6")
 rect(x-3,296,x+10,298,"#c5a17b")

# --- Lower right: ore shelves, crystals, crates and machinery
rect(548,316,677,407,"#493c44","#2b2934",4)
for y in [331,367,396]:
 rect(556,y,669,y+6,"#c29362","#4e3b43",3)
for i,(x,y,cl) in enumerate([(558,332,"#9eb0be"),(593,332,"#aeb2ad"),(627,332,"#c29a56"),
                            (567,373,"#b2a6c3"),(602,373,"#7da2ae"),(635,374,"#efb65a")]):
 ore(x,y,cl)
# blue crystal cluster on bottom right
for x,y,hh in [(465,365,29),(480,354,37),(499,366,26),(517,357,32)]:
 poly([(x,y+hh),(x-7,y+9),(x,y),(x+9,y+10),(x+8,y+hh)],"#547da3","#33495e",3)
 poly([(x,y+3),(x+5,y+10),(x+4,y+hh-5),(x,y+hh)],"#b4d5da")
 rect(x+1,y+7,x+3,y+12,"#e1fcf6")
crate(466,403,35,29);crate(507,407,33,26)
barrel(573,412);barrel(616,415)

# --- Accents, entrances and UI-free cues
light(44,92);light(303,91);light(418,92);light(675,93)
light(47,290);light(672,282)
# warm floor spotlight strips near the forge; blue cooling water
rect(443,252,603,258,"#a87456")
for xx in range(448,600,20):rect(xx,255,xx+8,258,"#edb36b")
# small decorative painted floor crest, no Poké-ball or brand logo
poly([(299,386),(317,368),(336,386),(317,404)],"#61424b","#c19b74",3)
line([(310,381),(324,395)],"#e5bf80",4)
line([(324,381),(310,395)],"#e5bf80",4)
# inventory piles and coal buckets top right
for x in [647,680]:
 rect(x,296,x+20,316,"#4b464c","#292b35",3)
 for xx in range(x+3,x+16,6):
  ellipse((xx,300,xx+9,309),"#494a51")
# reinforce silhouette bottom exit and left entry to be visible on every zoom
rect(318,442,387,446,"#c5a17c")
rect(21,115,36,149,"#b59a79")
rect(24,120,35,143,"#f4d9a4")

output=Path(__file__).resolve().parents[1]/"assets"/"maps"/"glut_forge_v1.png"
output.parent.mkdir(parents=True,exist_ok=True)
im.convert("RGB").save(output,optimize=True)
print("FORGE_ART_CREATED",output,"pixels",im.size,"bytes",output.stat().st_size)
