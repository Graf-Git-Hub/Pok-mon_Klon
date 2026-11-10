"""Second original art pass: clustered pixels, continuous cottage silhouettes.
Reference study: Gen I/II proportions, never reference pixel extraction.
"""
from PIL import Image,ImageDraw
from gb_actors import P

def house(kind=0):
 im=Image.new('RGBA',(48,40));d=ImageDraw.Draw(im)
 def b(x,y,w,h,c):d.rectangle((x,y,x+w-1,y+h-1),fill=P[c])
 # One coherent roof across three logical tiles, with a small vertical overhang.
 d.polygon([(7,1),(39,1),(47,18),(47,22),(0,22),(0,18)],fill=P[3])
 d.polygon([(8,3),(38,3),(45,18),(2,18)],fill=P[2])
 d.line([(8,2),(38,2)],fill=P[1]);b(3,19,42,1,1);b(1,21,46,2,3)
 for y in (5,9,13,17):
  lo=max(3,7-(y-3)//2);hi=47-lo
  d.line((lo,y,hi,y),fill=P[3])
  for x in range(lo+2+(2 if y%8==1 else 0),hi-2,6):
   d.line((x,y-2,x+3,y-2),fill=P[1]);d.point((x+4,y-1),fill=P[3])
 # Recessed plaster, timber frame and stone footing.
 b(2,23,44,16,3);b(3,23,42,14,1);b(4,24,40,1,0);b(3,37,42,2,2)
 for x in (3,15,31,44):b(x,24,1,13,2)
 for x in (7,35):
  b(x-2,27,10,8,3);b(x-1,28,8,5,0);b(x+2,28,1,5,3);b(x-1,30,8,1,2)
  b(x-3,35,12,1,3);b(x-2,34,10,1,0)
 # Door remains centered on the original collision/warp tile x+1.
 b(18,25,12,14,3);b(19,26,10,12,2);b(20,27,8,5,1);b(23,27,1,5,3)
 b(20,33,8,4,2);b(27,34,1,1,0);b(17,38,14,2,0);b(18,39,12,1,2)
 if kind==1: # healing cottage: original four-point light, no franchise emblem
  b(35,26,8,8,3);d.polygon([(39,27),(40,29),(42,30),(40,31),(39,33),(38,31),(36,30),(38,29)],fill=P[0])
 if kind==2: # smith chimney and hammer plaque
  b(33,0,7,8,3);b(34,1,5,6,1);b(33,0,7,2,2)
  b(35,26,8,8,3);d.line((37,32,41,28),fill=P[1],width=2);d.line((38,27,42,30),fill=P[0],width=2)
 if kind==3: # grocer's striped little awning over right window
  b(33,26,11,3,3)
  for x in (34,38,42):b(x,26,2,2,0)
 return im

def build(out):
 sheet=Image.new('RGBA',(192,40))
 for i in range(4):sheet.paste(house(i),(48*i,0))
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
  for x,y in [(2,4),(11,12)]:d.line((x,y,x+1,y-1,x+2,y),fill=P[1])
 elif name=='path':
  b(0,0,16,16,1)
  for x,y in [(3,3),(11,10),(6,14)]:d.line((x,y,x+1,y),fill=P[0])
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
  for box in [(1,1,7,6),(9,1,14,6),(1,8,5,14),(7,8,14,14)]:
   d.rectangle(box,outline=P[1]);d.point((box[0]+1,box[1]+1),fill=P[1])
 elif name=='room_floor':
  b(0,7,16,1,1);b(0,15,16,1,1);b(6,0,1,7,1);b(13,8,1,7,1)
  b(1,3,3,1,1);b(8,11,3,1,1)
 else:return old
 return im
