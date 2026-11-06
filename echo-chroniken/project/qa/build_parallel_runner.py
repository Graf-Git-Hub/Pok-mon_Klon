"""Creates an isolated, policy-driven copy of the existing real-control browser playthrough.
Does not edit the original QA script, gameplay source, save files or production difficulty.
"""
from pathlib import Path
p=Path(__file__).resolve().parent
original=(p/"natural-opening.py").read_text(encoding="utf8")
s=original
def replace(a,b):
 global s
 assert s.count(a)==1, ("expected exactly one source anchor",a[:110],s.count(a))
 s=s.replace(a,b,1)
replace("import functools,http.server,json,pathlib,threading,heapq,sys,traceback,time",
        "import functools,http.server,json,pathlib,threading,heapq,sys,traceback,time,os")
replace('OUT=PROJECT.parent/"docs/visual-audit/natural-opening"',
        'OUT=PROJECT.parent/"docs/visual-audit/parallel-lab"/os.environ["PARALLEL_RUN_ID"]')
replace("OUT.mkdir(parents=True,exist_ok=True)",
        'OUT.mkdir(parents=True,exist_ok=True)\n'
        'LEVEL_BONUS=int(os.environ["PARALLEL_LEVEL_BONUS"])\n'
        'CAPTURE_AFTER=int(os.environ["PARALLEL_CAPTURE_AFTER"])\n'
        'HEAL_THRESHOLD=int(os.environ["PARALLEL_HEAL_PCT"])/100\n'
        'SEED=int(os.environ["PARALLEL_SEED"])\n'
        'assert LEVEL_BONUS in (0,1,2,5,10)\n'
        'assert CAPTURE_AFTER in (0,1,2,3)\n'
        'assert HEAL_THRESHOLD in (0,.25,.45,.65,.85)\n'
        'print("PARALLEL_START",os.environ["PARALLEL_RUN_ID"],"levels",LEVEL_BONUS,\n'
        '      "captureAfterWins",CAPTURE_AFTER,"healThreshold",HEAL_THRESHOLD,flush=True)')
replace('seed=20261105 if touch else 20261104',
        'seed=SEED+(1 if touch else 0)')
replace('if not attempted_capture and not case["caught"] and saved().get("orbs",12)>0:',
        'if not attempted_capture and not case["caught"] and case["wildWins"]>=CAPTURE_AFTER and saved().get("orbs",12)>0:')
replace('if not any(m["hp"]<max_by_id.get(m["id"],m["hp"])*.75 for m in state["team"]):return',
        'if not any(m["hp"]<max_by_id.get(m["id"],m["hp"])*HEAL_THRESHOLD for m in state["team"]):return')
replace('if active["hp"]<maxhp*.45 and used_potions<before.get("potions",0):',
        'if active["hp"]<maxhp*HEAL_THRESHOLD and used_potions<before.get("potions",0):')
anchor='    # Optional early trainer test. No fake win callback.'
add='''     # Strict player-selected level gate. All currently owned spirits must gain
     # the required bonus through real wild fights BEFORE leaving starting village.
     # No XP editing and no forced wins. A fixed safety limit reports a BLOCKED rule.
     start_team=saved()["team"]
     wanted={str(m["id"]):m["lv"]+LEVEL_BONUS for m in start_team}
     case["levelRule"]={"plus":LEVEL_BONUS,"targets":wanted}
     print("PARALLEL_RULE",who,"level gate +",LEVEL_BONUS,wanted,flush=True)
     if LEVEL_BONUS:
      limit=120+LEVEL_BONUS*35
      for grind in range(limit):
       owned={str(m["id"]):m["lv"] for m in saved()["team"]}
       if all(owned.get(k,0)>=needed for k,needed in wanted.items()):
        print("PARALLEL_GATE_PASSED",who,grind,owned,flush=True)
        case["levelRule"]["grindSteps"]=grind
        break
       player=snap()["player"]
       pos=(player["x"],player["y"])
       if pos not in ((13,23),(14,23)):walk_to((13,23))
       else:
        press("RIGHT" if pos==(13,23) else "LEFT")
        case["steps"]+=1
        if snap()["mode"]=="BATTLE":fight()
        if snap()["mode"]=="DIALOG":dismiss()
       if (grind+1)%50==0:
        print("PARALLEL_GRIND",who,grind+1,owned,flush=True)
      else:
       owned={str(m["id"]):m["lv"] for m in saved()["team"]}
       print("PARALLEL_GATE_BLOCKED",who,wanted,owned,flush=True)
       raise AssertionError(("PARALLEL_GATE_BLOCKED",wanted,owned,"limit",limit))
     stage("level gate passed")
'''
add='\n'.join(line[1:] if line.startswith(' ') else line for line in add.split('\n'))
replace(anchor,add+anchor)
(p/"parallel_natural_run.py").write_text(s,encoding="utf8")
print("RUNNER_BUILT",p/"parallel_natural_run.py","bytes",len(s.encode("utf8")))
