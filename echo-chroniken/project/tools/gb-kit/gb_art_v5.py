"""Original, native-resolution revision of the shared 39-tile kit.
No imported reference pixels. Large tree uses 16x24 art and one solid foot cell.
"""
from PIL import Image, ImageDraw, ImageColor
from gb_actors import actor,npc,build as build_actors,P
from gb_art_v6 import tree as tree_v6

def transparent_edge(im):
 im=im.convert('RGBA'); bg=ImageColor.getrgb(P[0])+(255,)
 seen=set();todo=[(x,y) for x in range(im.width) for y in (0,im.height-1)]+[(x,y) for y in range(im.height) for x in (0,im.width-1)]
 while todo:
  x,y=todo.pop()
  if (x,y) in seen or not(0<=x<im.width and 0<=y<im.height):continue
  seen.add((x,y))
  if im.getpixel((x,y))!=bg:continue
  im.putpixel((x,y),(0,0,0,0));todo.extend(((x+1,y),(x-1,y),(x,y+1),(x,y-1)))
 return im

def tree():
 im=Image.new('RGBA',(16,24));d=ImageDraw.Draw(im)
 d.rectangle((6,16,9,22),fill=P[3]);d.rectangle((7,17,8,21),fill=P[1])
 d.line((4,23,7,21,10,23),fill=P[3])
 shape=[(6,0),(10,0),(10,2),(13,3),(14,6),(15,7),(15,15),(13,17),(10,18),(5,18),(2,17),(0,15),(0,8),(2,5),(4,4),(4,2)]
 d.polygon(shape,fill=P[3])
 d.polygon([(6,2),(9,2),(10,4),(12,5),(12,7),(14,9),(13,14),(11,16),(5,16),(2,14),(2,9),(4,7),(4,5),(6,4)],fill=P[2])
 for box in [(6,3,8,4),(4,6,7,7),(9,6,11,8),(3,10,5,12),(7,10,9,11),(10,13,12,14),(5,14,7,14)]:d.rectangle(box,fill=P[1])
 for x,y in [(6,3),(4,6),(9,6),(3,10)]:d.point((x,y),fill=P[0])
 d.line((3,15,5,16,7,15),fill=P[3]);d.line((10,16,12,15),fill=P[3])
 return im

def upgrade(name,old):
 im=Image.new('RGB',(16,16),P[0]);d=ImageDraw.Draw(im)
 def b(x,y,w,h,c):d.rectangle((x,y,x+w-1,y+h-1),fill=P[c])
 def line(points,c,width=1):d.line(points,fill=P[c],width=width)
 if name in ('player','npc'):
  a=actor('down',0) if name=='player' else npc(0);im.paste(a,(0,0),a)
 elif name=='tree':
  a=tree();im.paste(a,(0,-8),a)
 elif name.startswith('roof_'):
  b(0,0,16,15,2)
  for y in (1,5,9):
   line([(0,y+2),(3,y+2),(4,y),(10,y),(11,y+2),(15,y+2)],3)
   line([(5,y+1),(9,y+1)],1)
  b(0,13,16,2,3);b(0,13,16,1,1)
  if name=='roof_l':
   d.polygon([(0,0),(5,0),(0,5)],fill=P[0]);line([(5,0),(0,5),(0,14)],3)
  if name=='roof_r':
   d.polygon([(10,0),(15,0),(15,5)],fill=P[0]);line([(10,0),(15,5),(15,14)],3)
 elif name in ('wall','window','door'):
  b(0,0,16,16,1);b(0,0,16,2,3);b(0,14,16,2,3);b(0,13,16,1,2)
  b(1,3,2,10,2);b(13,3,2,10,2)
  if name=='window':
   b(4,3,8,9,3);b(5,4,6,6,0);b(7,4,1,6,2);b(5,7,6,1,2);b(3,11,10,2,3);b(4,11,8,1,0)
  elif name=='door':
   b(3,2,10,14,3);b(4,3,8,12,2);b(5,4,6,4,1);b(7,4,1,4,3);b(10,10,1,1,0);b(4,15,8,1,0)
  else:
   b(4,3,8,1,0);b(5,6,6,1,2);b(6,10,5,1,0)
 elif name=='bush' or name=='hedge':
  d.polygon([(2,5),(5,3),(8,4),(11,3),(14,6),(15,11),(13,14),(2,14),(0,11),(0,8)],fill=P[3])
  d.polygon([(3,6),(6,5),(8,7),(11,5),(13,8),(12,11),(3,12),(2,9)],fill=P[2])
  for x,y in [(3,7),(9,7),(6,10)]:line([(x,y),(x+2,y-1),(x+3,y)],1)
 elif name=='fence':
  b(0,6,16,3,3);b(0,7,16,1,1);b(0,11,16,2,2)
  for x in (3,11):
   d.polygon([(x,2),(x+2,0),(x+4,2),(x+4,15),(x,15)],fill=P[3]);b(x+1,3,2,11,1);b(x+1,3,1,9,0)
 elif name in ('water_a','water_b','water_edge'):
  b(0,0,16,16,1);shift=3 if name=='water_b' else 0
  for x,y in [(1,3),(8,10)]:
   x=(x+shift)%10;line([(x,y),(x+2,y+1),(x+5,y+1),(x+6,y)],2);line([(x+1,y-1),(x+4,y-1)],0)
  if name=='water_edge':b(0,0,16,3,0);b(0,3,16,1,2)
 elif name=='grass':
  for x,y in [(0,4),(5,2),(10,5),(1,10),(7,9)]:
   line([(x,y),(x+2,y+4),(x+4,y)],3);line([(x+2,y+1),(x+2,y+4)],2)
 elif name=='room_floor':
  b(0,7,16,1,1);b(0,15,16,1,1);b(7,0,1,7,1);b(2,8,1,7,1)
 elif name=='room_wall':
  b(0,0,16,16,1);b(0,0,16,3,3);b(0,3,16,2,2);b(0,14,16,2,3)
  b(0,9,16,1,2);b(5,5,1,4,2);b(12,10,1,4,2)
 elif name=='forge':
  b(4,0,8,4,3);b(5,0,6,3,2);b(1,4,14,12,3);b(2,5,12,2,1)
  b(3,8,10,6,2);b(4,8,8,5,3)
  d.polygon([(5,12),(5,10),(7,11),(8,8),(10,11),(11,10),(11,12)],fill=P[0]);b(2,14,12,1,1)
 elif name=='workbench':
  b(1,4,14,8,3);b(2,5,12,5,1);b(3,6,5,1,0)
  line([(9,5),(6,9)],3);b(8,4,4,2,3);b(3,12,2,4,3);b(11,12,2,4,3)
 elif name=='anvil':
  d.polygon([(0,5),(12,5),(14,3),(15,4),(15,8),(10,10),(9,12),(12,13),(12,15),(4,15),(4,13),(7,12),(6,10),(2,9)],fill=P[3])
  line([(2,6),(12,6)],0);b(6,8,6,1,2);b(7,10,2,2,2)
 else:return old
 return im

OBJECTS=['tree','table','counter','bookshelf','workbench','forge','plant',None,'anvil','crate']
def build_layers(out,tiles):
 sheet=Image.new('RGBA',(160,32))
 for i,name in enumerate(OBJECTS):
  if name is None:continue
  obj=tree_v6() if name=='tree' else transparent_edge(tiles[name])
  sheet.paste(obj,(i*16,0))
 # Blade overlay occupies only bottom six pixels, preserving the actor's head.
 grass=tiles['grass'].convert('RGBA')
 for y in range(16):
  for x in range(16):
   if y<10 or grass.getpixel((x,y))[:3]==ImageColor.getrgb(P[0]):grass.putpixel((x,y),(0,0,0,0))
 sheet.paste(grass,(112,0));sheet.save(out/'foreground.png')
 build_actors(out)
