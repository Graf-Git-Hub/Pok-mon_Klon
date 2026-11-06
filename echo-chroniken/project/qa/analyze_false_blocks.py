"""Find demonstrably false blocked gate outcomes from completed run logs."""
import ast,json,re
from pathlib import Path
root=Path(__file__).resolve().parents[2]
out=root/"docs"/"visual-audit"/"parallel-lab"
species=json.loads((root/"project"/"data"/"species.js").read_text(encoding="utf8").split("=",1)[1].strip().rstrip(";"))
evol={s["id"]:s["evolvesTo"] for s in species}
def lineage(sid):
    ids={int(sid)}
    at=int(sid)
    for _ in range(3):
        at=evol.get(at)
        if not at or at in ids:break
        ids.add(at)
    return ids
status=json.loads((out/"status.json").read_text(encoding="utf8"))
clearly_false=[]
possibly_false=[]
legit=[]
for p in status["variants"]:
    if p["status"]!="blocked":continue
    log=out/p["id"]/"run.log"
    text=log.read_text(encoding="utf8",errors="replace") if log.exists() else ""
    line=next((x for x in reversed(text.splitlines()) if x.startswith("PARALLEL_GATE_BLOCKED ")),None)
    if not line:continue
    m=re.match(r"PARALLEL_GATE_BLOCKED \w+ (\{.*?\}) (\{.*?\})$",line)
    if not m:continue
    wanted={int(k):v for k,v in ast.literal_eval(m.group(1)).items()}
    owned={int(k):v for k,v in ast.literal_eval(m.group(2)).items()}
    stage_ok=all(any(owned.get(k,0)>=target for k in lineage(origin)) for origin,target in wanted.items())
    exact_ok=all(owned.get(origin,0)>=target for origin,target in wanted.items())
    if stage_ok and not exact_ok:clearly_false.append(p["id"])
    elif not exact_ok and any(any(k in owned and k!=origin for k in lineage(origin)) for origin in wanted):possibly_false.append(p["id"])
    else:legit.append(p["id"])
print("FALSE_BLOCKS_FIXABLE",len(clearly_false),clearly_false)
print("EVOLUTION_INVOLVED_BUT_OTHER_LEVEL_TOO_LOW",len(possibly_false),possibly_false)
print("OTHER_BLOCKED",len(legit),legit)
(out/"evolution-false-blocks.json").write_text(json.dumps({"fixable":clearly_false,"involved":possibly_false,"other":legit},indent=2),encoding="utf8")
