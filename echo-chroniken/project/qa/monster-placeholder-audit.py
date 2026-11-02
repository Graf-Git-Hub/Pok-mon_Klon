"""Reproducible visual review sheets for the 50 placeholder species, without ID edits."""
import base64
import io
import json
import pathlib
import re
from PIL import Image, ImageDraw, ImageFont

project=pathlib.Path(__file__).resolve().parent.parent
root=project.parent
raw=(project/"assets/atlas.js").read_text(encoding="utf-8")
chunks=re.findall(r'"([A-Za-z0-9+/=]+)"',raw)
assert chunks, "Atlas has no base64 chunks"
atlas=Image.open(io.BytesIO(base64.b64decode("".join(chunks)))).convert("RGBA")
species=json.loads((project/"data/species.js").read_text(encoding="utf-8").split("=",1)[1].rstrip("; \n"))
placeholder=[sp for sp in species if sp["name"].startswith("Spukwesen ")]
assert len(species)==150 and len(placeholder)==50
assert atlas.width>=1280 and atlas.height>=1920, atlas.size
out=root/"docs/visual-audit/monster-naming"
out.mkdir(parents=True,exist_ok=True)
try:
 font=ImageFont.truetype("arial.ttf",16)
except OSError:
 font=ImageFont.load_default()
for page in range(2):
 rows=placeholder[page*25:(page+1)*25]
 sheet=Image.new("RGB",(5*162,5*172),(32,39,52))
 draw=ImageDraw.Draw(sheet)
 for i,sp in enumerate(rows):
  row,col=divmod(i,5);offx=col*162;offy=row*172
  idx=sp["id"]-1
  tile=atlas.crop(((idx%10)*128,(idx//10)*128,(idx%10+1)*128,(idx//10+1)*128))
  bg=Image.new("RGBA",tile.size,(207,215,220,255))
  bg.alpha_composite(tile)
  sheet.paste(bg.convert("RGB"),(offx+17,offy+6))
  draw.text((offx+13,offy+139),f'ID {sp["id"]:03d}  {sp["name"]}',fill=(245,239,219),font=font)
  draw.text((offx+17,offy+158),f'{sp["type"]}',fill=(158,191,190),font=font)
 name=f"placeholders-{page+1:02d}.png"
 sheet.save(out/name)
 print(out/name,flush=True)
print("AUDIT: 50 placeholders; no names changed; tiles mapped by original species ID",flush=True)
