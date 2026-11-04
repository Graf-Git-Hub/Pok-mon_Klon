"""Cloud/local Chapter 6+7 input integration: real walking, gates, fights, reloads.

The synthetic starting save has just completed Chapter 5. A strong test team
isolates quest functionality from combat balance. Movement and all interactions
use keyboard/virtual touch controls; map tiles are read only for pathfinding.
"""
import copy,functools,http.server,json,pathlib,threading
from collections import deque
from playwright.sync_api import sync_playwright

PROJECT=pathlib.Path(__file__).resolve().parent.parent
OUT=PROJECT.parent/"docs/visual-audit/real-chapter6-7"
OUT.mkdir(parents=True,exist_ok=True)
BASE=json.loads((PROJECT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
DIRECTIONS={(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
BLOCKED={1,4,5,7}
RESULT={"scope":"Real-input Chapter 6 and 7, from a completed Chapter 5 save, high-level QA team","cases":[],"page_errors":[]}
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
   s.update(scene="OVERWORLD",introStage=4,hasStarter=True,currentMapId="station_stillwasser",
     safeSpawnId="from_ashroad",player={"x":20,"y":9,"dir":"right","stepPhase":0},
     chapter3={"completed":True},chapter4={"completed":True},chapter5={"completed":True},
     chapter6=None,chapter7=None,encounterGrace=999999)
   s["team"]=[dict(s["team"][0],id=3,lv=55,xp=0,nextXp=990,
                   hp=480,maxHp=480,moves=["lichtfunke","seelenstups"])]
   s["caughtIds"]={"1":True,"2":True,"3":True}
   s["seenIds"]={"1":True,"2":True,"3":True}
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page()
   page.on("pageerror",lambda e:RESULT["page_errors"].append(str(e)))
   # Scripted quest QA suppresses random wilderness interruptions only in OVERWORLD.
   # Battle damage and actual boss attack choices still use genuine randomness.
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
       markers:window.EchoStoryRegions.markers[id]||window.EchoChapter5.markers[id]||[]};
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
   # Chapter 6: entering through a real chapter-five exit.
   portal("to_ashroad","ashrail_approach")
   portal("to_ash_town","aschenruh_town")
   talk("edda")
   talk("ledger0");talk("ledger1")
   checkpoint("ledgers",6)
   portal("to_glut_forge","glut_forge")
   talk("worker0") # explicitly blocked before third ledger
   assert snap()["chapter6"]["workers"]==[],(who,"worker bypass")
   talk("ledger2");talk("worker0");talk("worker1")
   portal("to_glut_chasm","glut_chasm")
   talk("worker2")
   gate_locked("to_garden_road")
   talk("smelter") # must be blocked before Edda's evidence
   assert not snap()["chapter6"]["smelterWon"]
   portal("to_glut_forge","glut_forge")
   talk("valve2") # unsafe order
   assert snap()["chapter6"]["errors"]>=1
   for t in ["valve1","valve3","vent","valve2","casing"]:talk(t)
   assert snap()["chapter6"]["casing"]
   screenshot("forge-ready")
   portal("to_ash_town","aschenruh_town")
   talk("edda")
   assert snap()["chapter6"]["eddaConfessed"]
   portal("to_glut_forge","glut_forge")
   portal("to_glut_chasm","glut_chasm")
   fight("smelter","smelterWon",6)
   fight("core","coreWon",6)
   before=stored()
   talk("tool")
   assert snap()["chapter6"]["completed"]
   assert stored()["orbs"]==before["orbs"]+3
   assert stored()["potions"]==before["potions"]+2
   talk("tool")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+3,before["potions"]+2)
   checkpoint("completed",6)
   screenshot("chapter6-completed")
   # Chapter 7: true input across ritual, library, stones and two bosses.
   portal("to_garden_road","garden_road")
   portal("to_grove","lichterhain_grove")
   talk("nalia")
   talk("ritual0");talk("ritual1")
   checkpoint("rituals",7)
   talk("ritual2");talk("nalia")
   assert snap()["chapter7"]["naliaTrusted"]
   portal("to_name_library","name_library")
   for t in ["story0","story1","story2"]:talk(t)
   portal("to_grove","lichterhain_grove")
   portal("to_echo_garden","echo_garden")
   gate_locked("to_capital")
   fight("hunter","hunterWon",7)
   talk("stoneFLAMME")
   assert not snap()["chapter7"]["stones"],(who,"wrong stone accepted")
   for t in ["stoneWASSER","stoneWURZEL","stoneFLAMME","stoneLICHT"]:talk(t)
   assert len(snap()["chapter7"]["stones"])==4
   screenshot("stones")
   fight("nameShadow","shadowWon",7)
   portal("to_grove","lichterhain_grove")
   portal("to_name_library","name_library")
   talk("fatherMap")
   assert snap()["chapter7"]["fatherMap"]
   portal("to_grove","lichterhain_grove")
   portal("to_echo_garden","echo_garden")
   before=stored()
   talk("trace")
   assert snap()["chapter7"]["completed"]
   assert stored()["orbs"]==before["orbs"]+3
   talk("trace")
   assert stored()["orbs"]==before["orbs"]+3,(who,"duplicate reward")
   checkpoint("completed",7)
   screenshot("chapter7-completed")
   portal("to_capital","capital_outer_gate")
   assert snap()["mapId"]=="capital_outer_gate"
   assert snap()["chapter6"]["completed"] and snap()["chapter7"]["completed"]
   screenshot("chapter8-unlocked")
   RESULT["cases"].append(case)
   ctx.close()
  assert not RESULT["page_errors"],RESULT["page_errors"]
  browser.close()
  print("REAL_CHAPTER6_7_PASS",json.dumps(RESULT,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 server.shutdown()
