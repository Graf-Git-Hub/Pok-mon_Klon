"""Original Echo wanderer: short swept hair, bright scarf/jacket, dark boots.
Literal native pixels, not traced or extracted. '.' is transparency, 0 is white.
Direction rows: down/up/left/right. Columns: idle/left-foot/right-foot.
"""
from PIL import Image, ImageDraw, ImageColor
P=['#f4f4ef','#c7c8c4','#777a7b','#24262b']
FRONT=[
'................','......333.......','....332223......','...33211233.....',
'...32111123.....','....3131313.....','....3111113.....','.....31113......',
'....3300033.....','...310000013....','...313001313....','....3300233.....',
'.....32223......','.....33.33......','....333.333.....','................']
BACK=[
'................','......333.......','....332223......','...33211233.....',
'...32222223.....','....3222223.....','....3322233.....','.....33333......',
'....3300033.....','...310000013....','...313221313....','....3322233.....',
'.....32223......','.....33.33......','....333.333.....','................']
SIDE=[
'................','......333.......','.....32233......','....3211233.....',
'....3221113.....','....321313......','....3311113.....','.....31113......',
'.....33003......','....321003......','....321313......','....331313......',
'.....32223......','......333.......','.....33333......','................']

def pixels(rows):
 assert len(rows)==16 and all(len(r)==16 for r in rows)
 im=Image.new('RGBA',(16,16))
 for y,r in enumerate(rows):
  for x,c in enumerate(r):
   if c!='.':im.putpixel((x,y),ImageColor.getrgb(P[int(c)])+(255,))
 return im

def actor(direction,frame):
 im=pixels(FRONT if direction=='down' else BACK if direction=='up' else SIDE)
 if frame:
  d=ImageDraw.Draw(im)
  d.rectangle((3,12,12,15),fill=(0,0,0,0))
  if direction in ('down','up'):
   # Arms counter-swing, one sole advances by a pixel; never shift a static sprite.
   a,b=(4,9) if frame==1 else (9,4)
   d.rectangle((5,12,9,12),fill=P[2]);d.rectangle((a,13,a+2,15),fill=P[3])
   d.rectangle((b,13,b+1,14),fill=P[3]);d.point((b,13),fill=P[1])
   d.rectangle((3 if frame==1 else 11,10,4 if frame==1 else 12,11),fill=P[0])
  else:
   d.rectangle((5,12,9,12),fill=P[2])
   if frame==1:
    d.line((6,13,4,14),fill=P[3],width=2);d.line((9,13,11,15),fill=P[3],width=2)
    d.line((7,9,9,11),fill=P[2],width=2);d.point((10,11),fill=P[0])
   else:
    d.line((6,13,4,15),fill=P[3],width=2);d.line((9,13,11,14),fill=P[3],width=2)
    d.line((7,9,5,11),fill=P[2],width=2);d.point((4,11),fill=P[0])
 if direction=='left': im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 return im

def npc(kind):
 im=actor('down',0);d=ImageDraw.Draw(im)
 if kind==0: # elder: broad white hair and long coat
  im=pixels([
   '................','.....333333.....','....30000003....','...3001111003...',
   '...3011111103...','...3013131103...','....31111113....','.....311113.....',
   '....3322233.....','...310222013....','...313222313....','....3322233.....',
   '....3211123.....','....3333333.....','.....33.33......','....333.333.....'])
  d=ImageDraw.Draw(im);d.line((13,9,13,15),fill=P[3])
 else: # artisan: wide shoulders, cropped hair and a bright apron
  d.rectangle((4,2,11,4),fill=P[3]);d.rectangle((5,3,10,3),fill=P[2])
  d.rectangle((2,9,13,11),fill=P[3]);d.rectangle((3,10,4,12),fill=P[1])
  d.rectangle((11,10,12,12),fill=P[1]);d.rectangle((5,9,10,13),fill=P[0])
  d.rectangle((6,11,9,12),fill=P[2])
 return im

def build(out):
 sheet=Image.new('RGBA',(48,80))
 for row,direction in enumerate(('down','up','left','right')):
  for frame in range(3):sheet.paste(actor(direction,frame),(frame*16,row*16))
 for n in range(2):sheet.paste(npc(n),(n*16,64))
 sheet.save(out/'actors.png')
 return sheet
