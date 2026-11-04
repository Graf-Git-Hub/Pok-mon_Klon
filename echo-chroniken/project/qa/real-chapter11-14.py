"""Real keyboard/touch inputs from chapter 11 through epilogue and postgame.

Starts after chapter 10 with a QA team, NOT a full natural campaign or a balance test.
Uses only game UI for movement, dialogues and real boss battles. Map data is read
solely for path planning, never to teleport or mutate quest progress.
"""
import copy,functools,http.server,json,pathlib,threading
from collections import deque
from playwright.sync_api import sync_playwright

PROJECT=pathlib.Path(__file__).resolve().parent.parent
OUT=PROJECT.parent/"docs/visual-audit/real-chapter11-14"
OUT.mkdir(parents=True,exist_ok=True)
BASE=json.loads((PROJECT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
DIRECTIONS={(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
BLOCKED={1,4,5,7}
RESULT={"scope":"Real-input Chapters 11-14, credits and postgame from completed Chapter 10, QA team","cases":[],"page_errors":[]}
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
   s.update(scene="OVERWORLD",introStage=4,hasStarter=True,currentMapId="star_ridge",
     safeSpawnId="from_vault",player={"x":2,"y":9,"dir":"right","stepPhase":0},
     chapter3={"completed":True},chapter4={"completed":True},chapter5={"completed":True},
     chapter6={"completed":True},chapter7={"completed":True},chapter8={"completed":True},
     chapter9={"completed":True,"phase_lantern":True},chapter10={"completed":True},
     chapter11=None,chapter12=None,chapter13=None,chapter14=None,postgame=None,
     main_story_finished=False,optional_postgame_completed=False,encounterGrace=999999)
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
   ctx.add_init_script("if(!sessionStorage.getItem('test-chapter1114')){"+
     "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+json.dumps(s)+"));" +
     "sessionStorage.setItem('test-chapter1114','1');}")
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
       markers:window.EchoEndgame.markers[id]||window.EchoFinale.markers[id]||window.EchoPostgame.markers[id]||[]};
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
    for _ in range(45):
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

   # Chapter 11: observe, calibrate in order, face Varek, free every capsule.
   talk("stargazer")
   portal("to_observatory","observatory_hall")
   for marker in ("projection0","projection1","projection2"):talk(marker)
   checkpoint("projections",11)
   portal("to_telescope","observatory_telescope")
   talk("dialSTERN")
   assert not snap()["chapter11"]["dial"],(who,"wrong order accepted")
   for marker in ("dialWURZEL","dialWASSER","dialSTERN"):talk(marker)
   talk("telescope")
   assert snap()["chapter11"]["telescope"]
   portal("to_hall","observatory_hall")
   portal("to_roof","observatory_roof")
   fight("varek","varek_first_defeated",11)
   for marker in ("capsule0","capsule1","capsule2","miraLetter"):talk(marker)
   talk("beacon")
   assert not snap()["chapter11"]["completed"],(who,"beacon before father's message")
   portal("to_hall","observatory_hall")
   talk("fatherMessage")
   portal("to_roof","observatory_roof")
   before=stored()
   talk("beacon")
   assert snap()["chapter11"]["completed"]
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+3)
   talk("beacon")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+3)
   checkpoint("completed",11)
   screenshot("chapter11-completed")
   portal("to_family","martha_house")

   # Chapter 12: consent and memory puzzle. Shaft remains closed until key.
   talk("letter");talk("musicBox");talk("martha");talk("familyPortrait")
   portal("to_memory","memory_room")
   talk("memoryMirror")
   assert not snap()["chapter12"]["mirror"],(who,"early mirror")
   for marker in ("picture0","picture1","picture2"):talk(marker)
   talk("memoryMirror");talk("safetyLatch")
   assert snap()["chapter12"]["latchOpen"]
   checkpoint("latchOpen",12)
   portal("to_martha","martha_house")
   portal("to_garden","old_family_garden")
   gate_locked("to_shaft")
   talk("mioraChoice")
   before=stored()
   talk("shaftKey")
   assert snap()["chapter12"]["completed"]
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+4,before["potions"]+3)
   talk("shaftKey")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+4,before["potions"]+3)
   checkpoint("completed",12)
   screenshot("chapter12-completed")
   portal("to_shaft","shaft_entry")

   # Chapter 13: three independent anchors, actual Shaft Guardian battle.
   talk("shaftGuide")
   portal("to_level1","shaft_level1")
   talk("anchorW");talk("rootMemo");talk("lanternShortcut")
   portal("to_level2","shaft_level2")
   talk("anchorA")
   fight("shaftGuard","guardianWon",13)
   checkpoint("guardianWon",13)
   portal("to_anchors","shaft_anchors")
   gate_locked("to_father")
   talk("anchorS");talk("escapeSwitch")
   assert snap()["chapter13"]["anchorsDisabled"]
   portal("to_father","father_chamber")
   talk("father");talk("protectionCode")
   before=stored()
   talk("finalPreparation")
   assert snap()["chapter13"]["completed"]
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+4)
   talk("finalPreparation")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+4)
   checkpoint("completed",13)
   screenshot("chapter13-completed")
   portal("to_core","core_access")

   # Chapter 14: genuine finale boss, free-choice ending, epilogue and credits.
   talk("warning");talk("machinePhase")
   portal("to_reflections","memory_reflections")
   gate_locked("to_core")
   for marker in ("flash2","flash0","flash1","miraLetter"):talk(marker)
   assert snap()["chapter14"]["memoriesReady"]
   portal("to_core","resonance_core")
   fight("varekFinal","varekWon",14)
   checkpoint("varekWon",14)
   for marker in ("free0","free1","free2"):talk(marker)
   talk("farewell")
   before=stored()
   talk("releaseSignal")
   assert snap()["chapter14"]["completed"] and snap()["main_story_finished"]
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+6,before["potions"]+4)
   talk("releaseSignal")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+6,before["potions"]+4)
   checkpoint("completed",14)
   screenshot("chapter14-finale")
   portal("to_epilogue","epilogue_wurzelheim")
   for marker in ("marthaEpilogue","friends","credits","journal"):talk(marker)
   assert snap()["chapter14"]["credits"],(who,"credits not reachable")
   checkpoint("credits",14)
   portal("to_postgame","optional_echo_garden_annex")
   talk("healer") # Explicit recovery after the finale, not a test-side HP mutation.
   screenshot("postgame-open")

   # Postgame: real movement across every meadow, three optional real fights.
   for i in range(6):
    portal("to_meadow_"+str(i+1),"postgame_meadow_0"+str(i+1))
    talk("meadowSign");talk("clue"+str(i))
    portal("to_garden","optional_echo_garden_annex")
    if i%2:
     talk("healer") # Real hub healer before each optional trial.
     # Postgame uses an array for boss victory, not a scalar chapter flag.
     before_trials=len(snap()["postgame"]["trials"])
     approach("trial"+str(i//2));dismiss()
     page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
     for attack in range(50):
      state=snap()
      if state["mode"]=="DIALOG":
       dismiss()
       if len(snap()["postgame"]["trials"])>before_trials:break
       continue
      assert state["mode"]=="BATTLE",(who,"postgame fight",state["mode"])
      page.wait_for_function("window.echoQASnapshot().mode!=='BATTLE' || (window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy)",timeout=9000)
      if snap()["mode"]=="DIALOG":continue
      assert snap()["mode"]=="BATTLE",(who,"postgame ended without win",snap())
      press("A");assert snap()["mode"]=="ATTACKS"
      press("A");case["attacks"]+=1
      page.wait_for_timeout(1000)
      if len(snap()["postgame"]["trials"])>before_trials:break
     assert len(snap()["postgame"]["trials"])==before_trials+1
     dismiss();case["bosses"].append("postgameTrial"+str(i//2))
   portal("to_museum","rail_heritage_museum")
   talk("curator");talk("museumLedger")
   talk("station2")
   for marker in ("station0","station1","station2"):talk(marker)
   assert snap()["postgame"]["museumSolved"],(who,"museum puzzle")
   talk("trainLacquer")
   portal("to_garden","optional_echo_garden_annex")
   before=stored()
   talk("gardenFest")
   assert snap()["postgame"]["completed"] and snap()["optional_postgame_completed"]
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+3)
   talk("gardenFest")
   assert (stored()["orbs"],stored()["potions"])==(before["orbs"]+5,before["potions"]+3)
   # Last reload verifies full campaign flags and both ending states persist.
   checkpoint("completed",14)
   assert snap()["postgame"]["completed"] and snap()["main_story_finished"]
   screenshot("postgame-completed")
   for n in (11,12,13,14):assert snap()["chapter"+str(n)]["completed"]
   RESULT["cases"].append(case)
   ctx.close()
  assert not RESULT["page_errors"],RESULT["page_errors"]
  browser.close()
  print("REAL_CHAPTER11_14_POSTGAME_PASS",json.dumps(RESULT,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 server.shutdown()
