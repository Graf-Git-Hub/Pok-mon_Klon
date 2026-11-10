"""Second original art pass: clustered pixels, continuous cottage silhouettes.
Reference study: Gen I/II proportions, never reference pixel extraction.
"""
from PIL import Image,ImageDraw
from gb_actors import P

def house(kind=0):
 im=Image.new('RGBA',(80,48));d=ImageDraw.Draw(im)
 def b(x,y,w,h,c):d.rectangle((x,y,x+w-1,y+h-1),fill=P[c])
 # The wall sits back from the roof edge. The door occupies the center tile.
 b(4,24,72,24,3);b(6,25,68,20,1);b(8,27,64,17,0)
 b(6,43,68,3,2)
 for y in (28,33,38):
  for x in range(9+(y%2)*3,70,7):b(x,y,3,1,1)
 for x in (13,55):
  b(x,29,13,10,3);b(x+2,31,9,6,1);b(x+2,31,9,1,0);b(x+6,31,1,6,3)
  b(x-1,39,15,1,2)
 b(32,32,16,16,3);b(34,34,12,11,2);b(35,35,10,4,1)
 b(35,45,10,2,0);b(43,41,1,1,0)
 # Horizontal roof silhouette with a restrained, regular tile rhythm.
 top=(5,2,7,4)[kind]
 b(1,top+2,78,24-top,3);b(3,top,74,23-top,3)
 b(4,top+2,72,20-top,2);b(5,top+2,70,2,1)
 for x in range(6,75,5):
  b(x,top+4,2,16-top,1);b(x+2,top+4,1,16-top,3)
 b(2,21,76,2,1);b(0,24,80,3,3)
 if kind==0:
  b(55,0,8,11,3);b(56,2,5,7,1);b(54,0,10,2,2)
 if kind==1:
  b(55,29,13,11,3);b(60,31,3,7,0);b(58,33,7,3,0)
 if kind==2:
  b(11,0,12,16,3);b(13,2,8,11,1);b(10,0,14,3,2)
  b(55,29,13,11,3);d.line((58,37,65,31),fill=P[1],width=2)
  d.line((60,30,66,35),fill=P[0],width=2)
 if kind==3:
  b(52,27,19,4,3)
  for x in (54,59,64):b(x,28,3,2,0)
 return im

def build(out):
 sheet=Image.new('RGBA',(320,48))
 for i in range(4):sheet.paste(house(i),(80*i,0))
 sheet.save(out/'houses.png')

def tree():
 im=Image.new('RGBA',(16,24));d=ImageDraw.Draw(im)
 d.rectangle((6,16,9,22),fill=P[3]);d.rectangle((7,18,8,21),fill=P[1]);d.line((5,23,7,21,10,23),fill=P[3])
 d.polygon([(6,0),(9,0),(11,2),(11,3),(14,5),(13,7),(15,10),(14,12),(15,15),(12,18),(9,19),(4,18),(1,16),(0,13),(2,10),(1,8),(3,5),(5,4)],fill=P[3])
 d.polygon([(6,2),(9,2),(10,5),(12,6),(11,8),(13,10),(12,12),(13,15),(10,17),(5,16),(3,14),(4,11),(3,8),(6,6)],fill=P[2])
 for points in [[(6,3),(8,2),(9,4),(7,5),(4,7),(4,6)],[(4,8),(7,7),(8,9),(6,10),(3,11)],[(9,7),(11,8),(12,10),(10,11),(9,10)],[(5,12),(7,11),(9,13),(7,14),(4,14)],[(9,14),(12,13),(12,15),(10,16)]]:
  d.polygon(points,fill=P[1])
 for x,y in [(7,3),(4,8),(6,12),(10,14)]:d.point((x,y),fill=P[0])
 for pts in [[(2,14),(4,15),(6,15)],[(8,16),(10,17),(12,16)],[(5,6),(7,6),(8,5)],[(10,11),(12,12),(13,11)]]:d.line(pts,fill=P[3])
 return im

def upgrade(name,old):
 im=Image.new('RGB',(16,16),P[0]);d=ImageDraw.Draw(im)
 def b(x,y,w,h,c):d.rectangle((x,y,x+w-1,y+h-1),fill=P[c])
 if name=='floor':
  b(0,0,16,16,1)
  for x,y in [(1,2),(8,3),(13,7),(4,9),(10,13),(2,15)]:
   d.line((x,y,x+1,y-1,x+2,y),fill=P[0])
   d.point((x+1,y+1),fill=P[2])
 elif name=='path':
  for x,y in [(2,2),(9,5),(13,11),(4,13)]:
   d.point((x,y),fill=P[1]);d.point((x+1,y+1),fill=P[1])
 elif name=='tree':
  a=tree();im.paste(a,(0,-8),a)
 elif name=='grass':
  # Dense low blade clusters, not empty V-shaped wire outlines.
  for x,y in [(0,2),(6,1),(11,4),(1,9),(7,8),(12,10)]:
   d.polygon([(x,y+4),(x,y+1),(x+2,y+3),(x+3,y),(x+4,y+4),(x+5,y+2),(x+5,y+6),(x+1,y+6)],fill=P[2])
   d.line([(x+1,y+4),(x+2,y+5),(x+3,y+2)],fill=P[3]);d.point((x+4,y+4),fill=P[1])
 elif name=='bush' or name=='hedge':
  d.polygon([(1,6),(4,3),(7,4),(10,2),(13,4),(15,8),(14,12),(12,14),(3,14),(0,11)],fill=P[3])
  d.polygon([(3,6),(5,5),(7,7),(10,4),(12,6),(13,10),(11,12),(4,12),(2,10)],fill=P[2])
  for x,y in [(3,7),(8,6),(10,10),(5,10)]:d.line([(x,y+1),(x+1,y),(x+3,y+1)],fill=P[1])
 elif name=='flower':
  for x,y in [(3,3),(10,9)]:
   d.line((x+1,y+3,x+1,y+6),fill=P[2]);d.line((x,y+5,x+2,y+5),fill=P[2])
   d.rectangle((x,y,x+2,y+2),fill=P[3]);d.point((x+1,y+1),fill=P[0])
 elif name=='sign':
  b(6,10,3,5,3);b(7,10,1,4,1);b(1,2,14,9,3);b(2,3,12,6,1);b(3,3,10,1,0)
  b(4,5,7,1,3);b(4,7,5,1,2);b(3,10,10,1,2)
 elif name=='bookshelf':
  b(1,0,14,16,3);b(2,1,12,13,2)
  for y in (2,8):
   for x,h in [(3,3),(6,4),(9,3),(12,4)]:
    b(x,y+4-h,2,h,1);b(x,y+4-h,1,1,0)
   b(2,y+4,12,1,0);b(2,y+5,12,1,3)
  b(2,14,12,1,1)
 elif name=='table':
  d.polygon([(3,2),(12,2),(15,5),(15,10),(12,12),(3,12),(0,10),(0,5)],fill=P[3]);b(2,5,12,5,1)
  b(3,3,10,2,0);b(3,7,10,1,2);b(3,12,2,3,3);b(11,12,2,3,3)
 elif name=='workbench':
  b(1,4,14,8,3);b(2,5,12,5,1);b(3,6,10,1,0);b(3,12,2,4,3);b(11,12,2,4,3)
  d.line((8,8,11,4),fill=P[3]);b(9,3,4,2,3);b(3,8,3,4,2);b(4,9,1,2,0)
 elif name=='forge':
  b(4,0,8,3,3);b(5,0,6,2,2);b(1,3,14,13,3);b(2,4,12,2,1)
  b(2,7,2,6,2);b(12,7,2,6,2);b(4,7,8,6,3)
  d.polygon([(5,12),(5,9),(7,11),(8,7),(10,11),(11,9),(11,12)],fill=P[1]);b(7,11,3,2,0)
  b(2,14,12,1,1);b(1,15,14,1,2)
 elif name=='floor_stone':
  for y in (3,11):
   for x in (2,10):
    offset=2 if y==11 else 0
    d.line((x+offset,y,x+offset+2,y),fill=P[1])
 elif name=='room_floor':
  b(0,0,16,16,1)
  for y in (3,7,11,15):b(0,y,16,1,2)

 else:return old
 return im
