"""Play a real Chapter-3 route with keyboard and touch, using only actual game input.

Navigation uses the map's read-only tiles/markers to find a shortest walking route.
Every step, conversation, portal, boss attack and reload happens through actual controls.
Boss battle is real, unlike the campaign's simulated victory callbacks.
"""
import copy
import functools
import http.server
import json
import pathlib
import threading
from collections import deque
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/real-chapter3"
OUT.mkdir(parents=True,exist_ok=True)
base=json.loads((ROOT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
PORTS={(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
SOLID={1,4,5,7}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

server=http.server.ThreadingHTTPServer(("127.0.0.1",0),
    functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"scope":"real input Chapter 3, starting from an unlocked harbor save, not full game intro",
        "cases":[],"page_errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  report["browser"]=browser.version
  for touch in (False,True):
   name="touch" if touch else "desktop"
   fixture=copy.deepcopy(base)
   fixture.update(scene="OVERWORLD",currentMapId="nebelhafen_town",
      safeSpawnId="west_gate",introStage=4,hasStarter=True,
      player={"x":2,"y":9,"dir":"right","stepPhase":0},
      chapter3=None,encounterGrace=99999)
   fixture["team"]=[dict(fixture["team"][0],id=3,lv=55,
      xp=0,nextXp=990,hp=280,maxHp=280,moves=["lichtfunke","seelenstups"])]
   fixture["caughtIds"]={"1":True,"2":True,"3":True}
   fixture["seenIds"]={"1":True,"2":True,"3":True}
   context=browser.new_context(viewport={"width":412,"height":915} if touch
      else {"width":1280,"height":800},has_touch=touch,is_mobile=touch)
   page=context.new_page()
   page.on("pageerror",lambda err:report["page_errors"].append(str(err)))
   context.add_init_script("if(!sessionStorage.getItem('ch3-seed')){"+
       "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+
       json.dumps(fixture)+"));sessionStorage.setItem('ch3-seed','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if touch else ""))
   page.wait_for_function("typeof window.echoQASnapshot==='function'")
   def snapshot():return page.evaluate("window.echoQASnapshot()")
   def push(command):
    if touch:page.locator(f'[data-cmd="{command}"]').tap()
    else:page.keyboard.press({"UP":"ArrowUp","DOWN":"ArrowDown",
      "LEFT":"ArrowLeft","RIGHT":"ArrowRight","A":"Enter","B":"Backspace"}[command])
   def dismiss():
    for _ in range(35):
     s=snapshot()
     if s["mode"]!="DIALOG":return
     push("A")
    raise AssertionError(name+": dialog cannot close")
   push("A")
   page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
   assert snapshot()["mapId"]=="nebelhafen_town"
   steps=0
   def mapdata():
    return page.evaluate("""() => {
      const id=window.echoQASnapshot().mapId, m=window.EchoMaps.get(id);
      return {id,tiles:m.tiles,exits:m.exits,
       markers:window.EchoChapter3.markers[id]||[]};
    }""")
   def route(goal,allow_exit=False):
    """Read-only BFS: never teleport or bypass a blocker."""
    nonlocal_map=mapdata()
    state=snapshot();src=(state["player"]["x"],state["player"]["y"])
    w=len(nonlocal_map["tiles"][0]);h=len(nonlocal_map["tiles"])
    blocks={(m["x"],m["y"]) for m in nonlocal_map["markers"]}
    exits={(e["x"],e["y"]) for e in nonlocal_map["exits"]}
    q=deque([src]);parent={src:None}
    while q and goal not in parent:
     x,y=q.popleft()
     for dx,dy in PORTS:
      pos=(x+dx,y+dy)
      if pos in parent:continue
      xx,yy=pos
      if xx<0 or yy<0 or xx>=w or yy>=h:continue
      if nonlocal_map["tiles"][yy][xx] in SOLID:continue
      if pos in blocks or (pos in exits and not (allow_exit and pos==goal)):continue
      parent[pos]=((x,y),PORTS[(dx,dy)])
      q.append(pos)
    assert goal in parent,(name,nonlocal_map["id"],src,goal,"unreachable")
    commands=[];at=goal
    while parent[at] is not None:
     prev,cmd=parent[at];commands.append((cmd,at));at=prev
    return list(reversed(commands))
   def walk(goal,exit_expected=None):
    nonlocal_dummy=None
    nonlocal_steps=[0]
    for cmd,pos in route(goal,bool(exit_expected)):
     before=snapshot()
     assert before["mode"]=="OVERWORLD",(name,before["mode"])
     push(cmd)
     after=snapshot()
     if exit_expected and pos==goal:
      assert after["mapId"]==exit_expected,(name,before["mapId"],exit_expected,after["mapId"])
      dismiss()
      assert snapshot()["mode"]=="OVERWORLD"
     else:
      assert after["mapId"]==before["mapId"],(name,"unexpected map",after)
      assert (after["player"]["x"],after["player"]["y"])==pos,(name,"blocked",before,pos,after)
     nonlocal_steps[0]+=1
    return nonlocal_steps[0]
   case={"viewport":name,"steps":0,"dialogs":0,"gates":[],"bossAttacks":0}
   def approach(marker_type):
    data=mapdata()
    found=[p for p in data["markers"] if p["type"]==marker_type]
    assert len(found)==1,(name,data["id"],marker_type)
    marker=found[0];best=None
    for (dx,dy),cmd in PORTS.items():
     neighbor=(marker["x"]-dx,marker["y"]-dy)
     try:path=route(neighbor)
     except AssertionError:continue
     if best is None or len(path)<len(best[0]):
      best=(path,neighbor,cmd)
    assert best,(name,data["id"],"marker unreachable",marker_type)
    path,neighbor,facing=best
    case["steps"]+=walk(neighbor)
    before=snapshot()
    push(facing)  # marker itself is solid; turning is a real keypress
    turned=snapshot()
    assert (turned["player"]["x"],turned["player"]["y"])==neighbor,(name,"marker entered")
    push("A")
    case["dialogs"]+=1
    return snapshot()
   def talk(marker):
    state=approach(marker)
    assert state["mode"] in ("DIALOG","BATTLE"),(name,marker,state["mode"])
    if state["mode"]=="DIALOG":dismiss()
    return snapshot()
   def use_portal(exit_id,to):
    data=mapdata()
    target=next(e for e in data["exits"] if e["exitId"]==exit_id)
    end=(target["x"],target["y"])
    case["steps"]+=walk(end,exit_expected=to)
    case["gates"].append(data["id"]+" -> "+to)
   def locked_portal(exit_id):
    data=mapdata()
    target=next(e for e in data["exits"] if e["exitId"]==exit_id)
    end=(target["x"],target["y"])
    # Do not enter the closed exit; stand next to it and press the direction.
    best=None
    for (dx,dy),cmd in PORTS.items():
     neighbor=(end[0]-dx,end[1]-dy)
     try:way=route(neighbor)
     except AssertionError:continue
     if best is None or len(way)<len(best[0]):best=(way,neighbor,cmd)
    assert best,(name,"closed portal unreachable",exit_id)
    way,neighbor,cmd=best
    case["steps"]+=walk(neighbor)
    old=snapshot()["mapId"]
    push(cmd)
    blocked=snapshot()
    assert blocked["mapId"]==old,(name,exit_id,"gate bypassed")
    assert blocked["mode"]=="DIALOG",(name,exit_id,"missing gate reason",blocked["mode"])
    dismiss();case["dialogs"]+=1
    case["gates"].append(exit_id+" blocked")
   locked_portal("to_pumpworks")
   talk("sera")
   for index,t in enumerate(("witness0","witness1","witness2")):
    result=talk(t)
    assert len(result["chapter3"]["witnesses"])==index+1,(name,t,result["chapter3"])
   assert snapshot()["chapter3"]["witnessesReady"]
   page.screenshot(path=str(OUT/(name+"-harbor-ready.png")),full_page=True)
   use_portal("to_pumpworks","pumpworks_floor1")
   locked_portal("to_control")
   for t in ("power","valve0","valve1","rotor"):
    talk(t)
   assert snapshot()["chapter3"]["waterLowered"],(name,"rotor didn't lower water")
   page.screenshot(path=str(OUT/(name+"-pumpworks.png")),full_page=True)
   use_portal("to_control","pumpworks_controlroom")
   talk("recording") # Locked until genuine victory.
   assert not snapshot()["chapter3"]["completed"]
   started=approach("boss")
   assert started["mode"]=="DIALOG",(name,"boss dialogue missing")
   dismiss()
   page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
   page.screenshot(path=str(OUT/(name+"-boss.png")),full_page=True)
   for _ in range(12):
    state=snapshot()
    if state["mode"]=="DIALOG":
     dismiss()
     if snapshot()["chapter3"]["bossWon"]:break
     continue
    assert state["mode"]=="BATTLE",(name,"unexpected fight mode",state["mode"])
    page.wait_for_function("window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy")
    push("A")
    assert snapshot()["mode"]=="ATTACKS",(name,"attacks not opened")
    push("A")
    case["bossAttacks"]+=1
    page.wait_for_timeout(1000)
    if snapshot()["chapter3"]["bossWon"]:break
   assert snapshot()["chapter3"]["bossWon"],(name,"boss not defeated in 12 turns")
   dismiss()
   talk("recording")
   after=snapshot()
   assert after["chapter3"]["completed"] and after["chapter3"]["maintenance_token"],(name,"recording incomplete")
   saved=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   assert saved["chapter3"]["completed"] and saved["currentMapId"]=="pumpworks_controlroom"
   orbs,potions=saved["orbs"],saved["potions"]
   talk("recording")
   saved2=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   assert (saved2["orbs"],saved2["potions"])==(orbs,potions),(name,"duplicated rewards")
   page.reload();page.wait_for_function("typeof window.echoQASnapshot==='function'")
   push("A");page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
   assert snapshot()["chapter3"]["completed"],(name,"reload lost completion")
   use_portal("to_tunnel","root_tunnel")
   assert snapshot()["chapter3"]["completed"]
   page.screenshot(path=str(OUT/(name+"-chapter4-entry.png")),full_page=True)
   case["chapter3Completed"]=True;case["chapter4Entered"]=True
   report["cases"].append(case)
   context.close()
  assert not report["page_errors"],report["page_errors"]
  browser.close()
 print("CHAPTER3_REAL_INPUT_PASS",json.dumps(report,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 server.shutdown()
