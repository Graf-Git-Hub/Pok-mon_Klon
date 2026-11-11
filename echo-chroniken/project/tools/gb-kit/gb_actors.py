"""Original Echo wanderer: short swept hair, bright scarf/jacket, dark boots.
Literal native pixels, not traced or extracted. '.' is transparency, 0 is white.
Direction rows: down/up/left/right. Columns: idle/left-foot/right-foot.
"""
from PIL import Image, ImageDraw, ImageColor
P=['#f4f4ef','#c7c8c4','#777a7b','#24262b']
# Drawn as compact silhouette rows, centered in a 16px logical cell.
def centered(rows):
 assert len(rows)==16 and all(len(r)<=16 for r in rows)
 return [r.center(16,'.') for r in rows]
# Asymmetric fringe, two-pixel eyes, scarf knot and separate sleeves.
FRONT=[
 '................',
 '......3333......',
 '....33222233....',
 '...3332112233...',
 '...3332112233...',
 '...3310111233...',
 '...3103103123...',
 '....30110113....',
 '.....331133.....',
 '....33300333....',
 '...3313323133...',
 '...3013333103...',
 '....33323333....',
 '.....323333.....',
 '.....33.33......',
 '....333.333.....',
]
BACK=[
 '................',
 '......3333......',
 '....33222233....',
 '...3321112223...',
 '...3221122223...',
 '...3222222223...',
 '...3322222233...',
 '....33322333....',
 '.....333333.....',
 '....33000333....',
 '...3313323133...',
 '...3112113103...',
 '....33323333....',
 '.....323333.....',
 '.....33.33......',
 '....333.333.....',
]
SIDE=[
 '................',
 '.....33333......',
 '....32222233....',
 '...3221122223...',
 '...3222222113...',
 '...3233330133...',
 '...3323010313...',
 '....323011113...',
 '.....3331133....',
 '.....330033.....',
 '....3312223.....',
 '....3322313.....',
 '.....322333.....',
 '.....3233.......',
 '.....3333.......',
 '.....33333......',
]

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
  d.rectangle((3,13,12,15),fill=(0,0,0,0))
  if direction in ('down','up'):
   # Arms counter-swing, one sole advances by a pixel; never shift a static sprite.
   a,b=(4,9) if frame==1 else (9,4)
   d.rectangle((5,12,9,12),fill=P[2]);d.rectangle((a,13,a+2,15),fill=P[3])
   d.rectangle((b,13,b+1,14),fill=P[3]);d.point((b,13),fill=P[1])
   d.point((4 if frame==1 else 11,11),fill=P[1])
  else:
   d.rectangle((5,12,9,12),fill=P[2])
   if frame==1:
    d.line((6,13,5,14),fill=P[3],width=2);d.line((9,13,10,15),fill=P[3],width=2)
    d.line((7,9,9,11),fill=P[2],width=2);d.point((10,11),fill=P[0])
   else:
    d.line((6,13,5,15),fill=P[3],width=2);d.line((9,13,10,14),fill=P[3],width=2)
    d.line((7,9,5,11),fill=P[2],width=2);d.point((4,11),fill=P[0])
 if direction=='left': im=im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
 return im

def npc(kind):
 im=actor('down',0);d=ImageDraw.Draw(im)
 if kind==0: # elder: broad white hair and long coat
  im=pixels(centered([
   '','333333','330000033','3001111003',
   '301111111103','301331331103','301001001103','331000000133',
   '333100001333','332222233','31022222013','31322222313',
   '3322222233','3322222233','333..333','333..333']))
  d=ImageDraw.Draw(im);d.line((13,9,13,15),fill=P[3])
 else:
  im=pixels(centered([
   '', '33333','3323333','32222223','332222333',
   '310011103','310310313','331111133','33311333',
   '333323333','331010133','310000013','330000033',
   '332222233','333..333','333..333']))
 return im

def build(out):
 sheet=Image.new('RGBA',(48,80))
 for row,direction in enumerate(('down','up','left','right')):
  for frame in range(3):sheet.paste(actor(direction,frame),(frame*16,row*16))
 for n in range(2):sheet.paste(npc(n),(n*16,64))
 sheet.save(out/'actors.png')
 return sheet
