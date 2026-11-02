"""Apply visually reviewed species names and keep the distribution catalog in sync."""
import json
import pathlib
import sys

project=pathlib.Path(__file__).resolve().parent.parent
doc=project.parent/"docs/game-design"
source=project/"data/species.js"
distribution=doc/"MONSTER_DISTRIBUTION.csv"
rows=json.loads((doc/"MONSTER_NAME_REVIEW.json").read_text(encoding="utf-8"))["reviewed"]
assert len(rows)==50 and len({r["id"] for r in rows})==50
old=source.read_text(encoding="utf-8")
new=old
for row in rows:
 original=f'"id":{row["id"]},"name":"{row["oldName"]}"'
 renamed=f'"id":{row["id"]},"name":"{row["newName"]}"'
 assert new.count(original)+new.count(renamed)==1, row
 new=new.replace(original,renamed,1)
 old_family=f'"family":"Geistertier {row["oldName"].split()[-1]}"'
 new_family=f'"family":"{row["newName"]}"'
 assert new.count(old_family)+new.count(new_family)==1, row
 new=new.replace(old_family,new_family,1)
data=json.loads(new.split("=",1)[1].rstrip(";\n"))
assert len(data)==150 and all(x["id"]==i+1 for i,x in enumerate(data))
assert len({sp["name"] for sp in data})==150, "Names must remain unique"
assert not any(sp["name"].startswith("Spukwesen ") for sp in data)
assert all(data[r["id"]-1]["family"]==r["newName"] for r in rows)

lookup={str(r["id"]):r for r in rows}
with distribution.open(encoding="utf-8-sig",newline="") as f:
 original_csv=f.read()
updated=[]
seen=set()
for line in original_csv.splitlines(keepends=True):
 parts=line.split(";",5)
 if parts[0] not in lookup:
  updated.append(line)
  continue
 row=lookup[parts[0]]
 assert parts[1] in (row["oldName"],row["newName"]),(row,parts)
 assert parts[2] in ("OFFEN: eindeutiger Name","VISUELL GEPRUEFT"),parts
 assert parts[4] in ("Geistertier "+row["oldName"].split()[-1],row["newName"]),parts
 parts[1],parts[2],parts[4]=row["newName"],"VISUELL GEPRUEFT",row["newName"]
 updated.append(";".join(parts));seen.add(row["id"])
assert seen=={r["id"] for r in rows}
new_csv="".join(updated)
if "--apply" in sys.argv:
 if new!=old:source.write_text(new,encoding="utf-8",newline="")
 if new_csv!=original_csv:
  with distribution.open("w",encoding="utf-8-sig",newline="") as f:f.write(new_csv)
 print("APPLIED: 50 names and family labels in species and MONSTER_DISTRIBUTION")
else:
 print("VALID: 50 reviewed species IDs and matching distribution rows; --apply to sync")
