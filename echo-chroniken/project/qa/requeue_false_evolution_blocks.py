"""Run ONLY after stopping supervisor, to redo tests proved falsely blocked on evolution.
Never overwrites pass/fail results, does not touch other save files.
"""
import json
import shutil
import time
from pathlib import Path
base=Path(__file__).resolve().parents[2]/"docs"/"visual-audit"/"parallel-lab"
status=base/"status.json"
plan=base/"evolution-false-blocks.json"
assert status.exists() and plan.exists()
before=json.loads(status.read_text(encoding="utf8"))
targets=set(json.loads(plan.read_text(encoding="utf8"))["fixable"])
assert len(before["variants"])==100 and before["total"]==100
assert "RUN-041" in targets,targets
actual=[]
for row in before["variants"]:
    if row["id"] not in targets:continue
    if row["status"]!="blocked":continue
    previous=base/row["id"]/"run.log"
    if previous.exists():
        shutil.copy2(previous,previous.with_name("run-before-evolution-fix.log"))
    row.update(status="queued",stage="Neutest mit korrekter Entwicklung",
               progress=0,startedAt=None,endedAt=None,exitCode=None,
               message="",lastUpdated=time.time())
    actual.append(row["id"])
assert "RUN-041" in actual,actual
shutil.copy2(status,base/"status-before-evolution-fix.json")
before["counts"]={key:sum(x["status"]==key for x in before["variants"])
                  for key in ("queued","running","passed","failed","blocked")}
before["finished"]=before["counts"]["passed"]+before["counts"]["failed"]+before["counts"]["blocked"]
before["active"]=before["counts"]["running"]
before["progress"]=round(sum(x["progress"] for x in before["variants"])/100,2)
temp=base/"status-evolution-requeue.tmp"
temp.write_text(json.dumps(before,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
temp.replace(status)
print("EVOLUTION_FALSE_BLOCKS_REQUEUED",len(actual),actual,flush=True)
print("PRESERVED_PASS",before["counts"]["passed"],"OTHER_BLOCKED",before["counts"]["blocked"],flush=True)
