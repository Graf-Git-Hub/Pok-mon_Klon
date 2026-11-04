"""Chapter 8 through 10: real walking, gates, fights, peaceful dialogue, reloads.

The synthetic starting save has just completed Chapter 7. A strong test team
isolates quest functionality from combat balance. Movement and all interactions
use keyboard/virtual touch controls; map tiles are read only for pathfinding.
"""
import copy,functools,http.server,json,pathlib,threading
from collections import deque
from playwright.sync_api import sync_playwright

PROJECT=pathlib.Path(__file__).resolve().parent.parent
OUT=PROJECT.parent/"docs/visual-audit/real-chapter8-10"
OUT.mkdir(parents=True,exist_ok=True)
BASE=json.loads((PROJECT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
DIRECTIONS={(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
BLOCKED={1,4,5,7}
RESULT={"scope":"Real-input Chapters 8-10 from a completed Chapter 7 save, QA team","cases":[],"page_errors":[]}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(PROJECT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  RESULT["browser"]=browser.version
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   s=copy.deepcopy(BASE)
   s.update(scene="OVERWORLD",introStage=4,hasStarter=True,currentMapId="capital_outer_gate",
     safeSpawnId="from_garden",player={"x":2,"y":9,"dir":"right","stepPhase":0},
     chapter3={"completed":True},chapter4={"completed":True},chapter5={"completed":True},
     chapter6={"completed":True},chapter7={"completed":True},chapter8=None,chapter9=None,chapter10=None,encounterGrace=999999)
   s["team"]=[dict(s["team"][0],id=3,lv=55,xp=0,nextXp=990,
                   hp=480,maxHp=480,moves=["lichtfunke","seelenstups"])]
   s["caughtIds"]={"1":True,"2":True,"3":True}
   s["seenIds"]={"1":True,"2":True,"3":True}
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page()
   page.on("pageerror",lambda e:RESULT["page_errors"].append(str(e)))
   # Random wild encounters are out of scope for the scripted chapter route.
   # Keep battle RNG real, so damage and win callbacks remain meaningful.
   ctx.add_init_script("const __qaOriginalRandom=Math.random.bind(Math);Math.random=()=>window.echoQASnapshot?.().mode==='OVERWORLD'?0.999999:__qaOriginalRandom();")
   ctx.add_init_script("if(!sessionStorage.getItem('test-chapter67')){"+
     "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+json.dumps(s)+"));" +
     "sessionStorage.setItem('test-chapter67','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
   page.wait_for_function("typeof window.echoQASnapshot === 'function'")
   case={"viewport":who,"steps":0,"dialogs":0,"bosses":[],"attacks":0,"portals":[],"reloads":[]}
   def snap():return page.evaluate("window.echoQASnapshot()")
   def stored():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   def press(cmd):
    if mobile:page.locator(f'[data-cmd="{cmd}"]').tap()
    else:page.keyboard.press({"UP":"ArrowUp","DOWN":"ArrowDown","LEFT":"ArrowLeft",
                              "RIGHT":"ArrowRight","A":"Enter","B":"Backspace"}[cmd])
   def dismiss():
    for _ in range(45):
     if snap()["mode"]!="DIALOG":return
     press("A")
    raise AssertionError((who,"dialogue stuck"))
   def screenshot(name):
    page.screenshot(path=str(OUT/(who+"-"+name+".png")),full_page=True)
   press("A")
   page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
   def mapdata():
    return page.evaluate("""() => {
     const id=window.echoQASnapshot().mapId,m=window.EchoMaps.get(id);
     return {id,tiles:m.tiles,exits:m.exits,
       markers:window.EchoEndgame.markers[id]||window.EchoStoryRegions.markers[id]||[]};
    }""")
   def route(goal,exit_ok=False):
    m=mapdata();now=snap()["player"];start=(now["x"],now["y"])
    w=len(m["tiles"][0]);h=len(m["tiles"])
    marks={(v["x"],v["y"]) for v in m["markers"]}
    exits={(v["x"],v["y"]) for v in m["exits"]}
    todo=deque([start]);previous={start:None}
    while todo and goal not in previous:
     x,y=todo.popleft()
     for (dx,dy),command in DIRECTIONS.items():
      nxt=(x+dx,y+dy)
      if nxt in previous:continue
      u,v=nxt
      if u<0 or v<0 or u>=w or v>=h or m["tiles"][v][u] in BLOCKED:continue
      if nxt in marks or (nxt in exits and not(exit_ok and nxt==goal)):continue
      previous[nxt]=((x,y),command)
      todo.append(nxt)
    assert goal in previous,(who,m["id"],start,goal,"unreachable")
    steps=[];pos=goal
    while previous[pos] is not None:
     prior,command=previous[pos]
     steps.append((command,pos));pos=prior
    return list(reversed(steps))
   def walk(goal,to=None):
    before=snap()["mapId"]
    for command,xy in route(goal,bool(to)):
     assert snap()["mode"]=="OVERWORLD",(who,"walking in",snap()["mode"])
     press(command)
     if to and xy==goal:
      assert snap()["mapId"]==to,(who,"portal",before,to,snap())
      dismiss()
     else:
      assert snap()["mapId"]==before,(who,"unexpected travel",before,snap())
      assert (snap()["player"]["x"],snap()["player"]["y"])==xy,(who,"blocked",before,xy,snap())
     case["steps"]+=1
   def adjacent(xy):
    best=None
    for (dx,dy),cmd in DIRECTIONS.items():
     near=(xy[0]-dx,xy[1]-dy)
     try:steps=route(near)
     except AssertionError:continue
     if best is None or len(steps)<len(best[0]):best=(steps,near,cmd)
    assert best,(who,mapdata()["id"],xy,"no adjacent access")
    _,near,cmd=best
    walk(near)
    press(cmd)
    assert (snap()["player"]["x"],snap()["player"]["y"])==near
    return cmd
   def approach(marker):
    m=mapdata();pts=[p for p in m["markers"] if p["type"]==marker]
    assert len(pts)==1,(who,m["id"],marker,pts)
    p=pts[0];adjacent((p["x"],p["y"]))
    press("A");case["dialogs"]+=1
    return snap()
   def talk(marker):
    st=approach(marker)
    assert st["mode"]=="DIALOG",(who,marker,st["mode"])
    dismiss()
    return snap()
   def portal(exit_id,to):
    m=mapdata()
    e=next((x for x in m["exits"] if x["exitId"]==exit_id),None)
    assert e,(who,m["id"],exit_id)
    walk((e["x"],e["y"]),to)
    case["portals"].append(m["id"]+" -> "+to)
    assert snap()["mode"]=="OVERWORLD"
   def gate_locked(exit_id):
    m=mapdata();e=next(x for x in m["exits"] if x["exitId"]==exit_id)
    cmd=adjacent((e["x"],e["y"]))
    old=snap()["mapId"]
    press(cmd)
    assert snap()["mapId"]==old,(who,"gate bypass",exit_id)
    assert snap()["mode"]=="DIALOG",(who,"missing gate reason",exit_id)
    dismiss()
   def checkpoint(flag,chapter):
    prev=stored()
    page.reload()
    page.wait_for_function("typeof window.echoQASnapshot === 'function'")
    press("A")
    page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
    assert snap()["mapId"]==prev["currentMapId"],(who,"reload map")
    assert snap()["chapter"+str(chapter)].get(flag),(who,"lost checkpoint",chapter,flag)
    assert stored()["team"]==prev["team"],(who,"team changed",chapter)
    assert stored()["archive"]==prev["archive"],(who,"archive changed",chapter)
    case["reloads"].append(str(chapter)+"."+flag)
   def fight(marker,flag,chapter):
    initial=approach(marker)
    assert initial["mode"]=="DIALOG",(who,marker,"no battle dialog")
    dismiss()
    page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
    screenshot("boss-"+marker)
    for _ in range(25):
     state=snap()
     if state["mode"]=="DIALOG":
      dismiss()
      if snap()["chapter"+str(chapter)].get(flag):break
      continue
     assert state["mode"]=="BATTLE",(who,marker,state["mode"])
     page.wait_for_function("window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy",timeout=9000)
     press("A")
     assert snap()["mode"]=="ATTACKS",(who,"no attack menu",marker)
     press("A")
     case["attacks"]+=1
     page.wait_for_timeout(1000)
     if snap()["chapter"+str(chapter)].get(flag):break
    assert snap()["chapter"+str(chapter)].get(flag),(who,marker,"boss still alive")
    dismiss()
    case["bosses"].append(marker)
   # Chapter 8: two city witnesses, three documents, ordered index and
   # real archive-guardian fight, all while walking the actual city maps.
   gate_locked("to_frost")
   portal("to_upper","kronenstadt_upper")
   talk("citizen0");talk("citizen1")
   assert len(snap()["chapter8"]["citizens"])==2
   screenshot("chapter8-city")
   portal("to_archive","central_archive")
   talk("recording")
   assert not snap()["chapter8"]["recording"],(who,"recording prematurely available")
   for t in ["document0","document1"]:talk(t)
   checkpoint("documents",8)
   talk("document2")
   talk("year2")
   assert not snap()["chapter8"]["years"],(who,"wrong year accepted")
   for t in ["year0","year2","year1"]:talk(t)
   assert snap()["chapter8"]["years"]==[0,2,1],(who,"year index failed")
   talk("archivist")
   screenshot("chapter8-index")
   portal("to_upper","kronenstadt_upper")
   portal("to_research","research_hall")
   talk("guard")  # Gate remains locked without the full recording.
   assert not snap()["chapter8"]["guardWon"]
   talk("varek")
   assert snap()["chapter8"]["varekMet"]
   portal("to_upper","kronenstadt_upper")
   portal("to_archive","central_archive")
   talk("recording")
   assert snap()["chapter8"]["recording"]
   portal("to_upper","kronenstadt_upper")
   portal("to_research","research_hall")
   fight("guard","guardWon",8)
   before=stored()
   talk("pass")
   assert snap()["chapter8"]["completed"]
   assert stored()["orbs"]==before["orbs"]+4
   assert stored()["potions"]==before["potions"]+2
   talk("pass")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+4,before["potions"]+2)
   checkpoint("completed",8)
   screenshot("chapter8-completed")
   portal("to_upper","kronenstadt_upper")
   portal("to_gate","capital_outer_gate")
   portal("to_frost","frost_approach")

   # Chapter 9: assemble the lantern, activate the genuine bridge,
   # defeat Vex with the battle menu, obtain the log and unlock Under-City.
   talk("mapPart");talk("lostLetter")
   portal("to_frost_station","frost_station")
   gate_locked("to_ice_caverns")
   talk("assembler")
   assert not snap()["chapter9"]["phase_lantern"]
   talk("scientist");talk("lensPart")
   checkpoint("parts",9)  # Real reload halfway through assembly.
   talk("batteryPart");talk("assembler")
   assert snap()["chapter9"]["phase_lantern"]
   screenshot("chapter9-lantern")
   portal("to_ice_caverns","ice_caverns")
   talk("bridgeLeft")
   assert snap()["chapter9"]["bridgeActive"]
   screenshot("chapter9-bridge")
   fight("vex","vexWon",9)
   talk("fatherLog")
   assert snap()["chapter9"]["fatherLog"]
   before=stored()
   talk("caveSignal")
   assert snap()["chapter9"]["completed"]
   assert stored()["orbs"]==before["orbs"]+4
   assert stored()["potions"]==before["potions"]+2
   talk("caveSignal")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+4,before["potions"]+2)
   checkpoint("completed",9)
   screenshot("chapter9-completed")
   portal("to_under_city","under_city_station")

   # Chapter 10: the non-violent guardian branch is deliberate.
   # Dialogs and three real anchors/evacuation are still actual inputs.
   talk("guide");talk("map")
   portal("to_under_homes","under_city_homes")
   for t in ["member0","member1","miraDrawing"]:talk(t)
   assert len(snap()["chapter10"]["memberViews"])==2
   assert snap()["chapter10"]["miraDrawing"]
   checkpoint("miraDrawing",10)
   portal("to_mainring","resonance_mainring")
   talk("power")
   assert not snap()["chapter10"]["powerStable"],(who,"power before anchors")
   for t in ["anchorB","anchorA","anchorC"]:talk(t)
   assert len(snap()["chapter10"]["anchors"])==3
   talk("power")
   assert snap()["chapter10"]["powerStable"]
   screenshot("chapter10-ring")
   portal("to_vault","continuum_vault")
   talk("evacuation")
   assert not snap()["chapter10"]["evacuation"],(who,"evacuation prematurely possible")
   talk("testimony")
   assert snap()["chapter10"]["testimony"]
   talk("guardian")
   assert snap()["chapter10"]["peaceful"] and snap()["chapter10"]["guardianWon"],(who,"peaceful branch broken")
   assert "guardian" not in case["bosses"],(who,"dialogue should avoid combat")
   talk("evacuation")
   assert snap()["chapter10"]["central_ring_offline"]
   before=stored()
   talk("signal")
   assert snap()["chapter10"]["completed"]
   assert stored()["orbs"]==before["orbs"]+4
   assert stored()["potions"]==before["potions"]+2
   talk("signal")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+4,before["potions"]+2)
   checkpoint("completed",10)
   screenshot("chapter10-completed")
   portal("to_star_ridge","star_ridge")
   assert snap()["mapId"]=="star_ridge"
   for n in [8,9,10]:assert snap()["chapter"+str(n)]["completed"],(who,"previous chapter lost",n)
   screenshot("chapter11-unlocked")
   RESULT["cases"].append(case)
   ctx.close()
  assert not RESULT["page_errors"],RESULT["page_errors"]
  browser.close()
  print("REAL_CHAPTER8_10_PASS",json.dumps(RESULT,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 server.shutdown()
