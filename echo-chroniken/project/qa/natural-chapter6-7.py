"""Continue truly naturally-earned Chapter-5 saves through Chapters 6 and 7.

Original team, inventory, XP, encounters and level rules. Real keyboard/touch
movement, puzzle controls, bosses, real potions, reloads and next-chapter gate.
No synthetic saves, artificial wins or modified game-state flags.
"""
import functools,http.server,json,pathlib,threading,sys
from collections import deque
from playwright.sync_api import sync_playwright

PROJECT=pathlib.Path(__file__).resolve().parent.parent
OUT=PROJECT.parent/"docs/visual-audit/natural-chapter6-7"
OUT.mkdir(parents=True,exist_ok=True)
SAVED=PROJECT.parent/"docs/visual-audit/natural-chapter5"
DIRECTIONS={(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
BLOCKED={1,4,5,7}
RESULT={"scope":"Natural earned save from Grandma/parcel after chapter 5; keyboard/touch chapter 6 and 7 with original XP/items","cases":[],"page_errors":[]}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(PROJECT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  RESULT["browser"]=browser.version
  for mobile in ((False,True) if "--both" in sys.argv else (False,)):
   who="touch" if mobile else "desktop"
   path=SAVED/(who+"-chapter5-natural-save.json")
   assert path.exists(),("First generate natural chapter5 save with natural-opening.py and natural-chapter5.py",str(path))
   s=json.loads(path.read_text(encoding="utf-8"))
   assert s["currentMapId"]=="station_stillwasser" and s["chapter5"]["completed"],(who,"chapter5 not naturally completed")
   assert 1<=max(m["lv"] for m in s["team"])<20,(who,"unexpected overleveled QA team")
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page()
   page.on("pageerror",lambda e:RESULT["page_errors"].append(str(e)))
   # Do not disable natural wilderness encounters. We flee using the real UI
   # if an interruption occurs; quest progression and real boss damage stay intact.
   ctx.add_init_script("if(!sessionStorage.getItem('test-chapter67')){"+
     "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+json.dumps(s)+"));" +
     "sessionStorage.setItem('test-chapter67','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
   page.wait_for_function("typeof window.echoQASnapshot === 'function'")
   case={"viewport":who,"steps":0,"dialogs":0,"bosses":[],"attacks":0,"portals":[],"reloads":[],"potions_spent":0,"wild_fled":0,"initial":{"team":[{"id":m["id"],"lv":m["lv"]} for m in s["team"]],"potions":s["potions"],"orbs":s["orbs"]}}
   def snap():return page.evaluate("window.echoQASnapshot()")
   def stored():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   def press(cmd):
    if mobile:page.locator(f'[data-cmd="{cmd}"]').tap()
    else:page.keyboard.press({"UP":"ArrowUp","DOWN":"ArrowDown","LEFT":"ArrowLeft",
                              "RIGHT":"ArrowRight","A":"Enter","B":"Backspace","START":"Escape"}[cmd])
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
   def flee_wild():
    assert snap()["mode"]=="BATTLE",(who,"not in a wild encounter")
    # Actual UI: DOWN + RIGHT reaches battle action 3 = Run.
    press("DOWN");press("RIGHT");press("A")
    assert snap()["mode"]=="OVERWORLD",(who,"failed to flee",snap())
    case["wild_fled"]+=1
   def walk(goal,to=None):
    before=snap()["mapId"]
    for command,xy in route(goal,bool(to)):
     assert snap()["mode"]=="OVERWORLD",(who,"walking in",snap()["mode"])
     press(command)
     if snap()["mode"]=="BATTLE":flee_wild()
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
   def rest_if_needed():
    state=snap()
    assert state["mode"]=="OVERWORLD",(who,"travel healing outside overworld")
    original=stored()
    maxhp={m["id"]:m["maxHp"] for m in original["team"]}
    if original["potions"]==0:return
    if not any(m["hp"]<maxhp.get(m["id"],m["hp"])*.6 for m in state["team"]):return
    press("START")
    assert snap()["mode"]=="MENU",(who,"rest menu could not open")
    press("DOWN");press("A")
    assert snap()["mode"]=="DIALOG",(who,"menu potion not used")
    dismiss()
    assert stored()["potions"]==original["potions"]-1
    case["potions_spent"]+=1
   # Always select an offensive move. Lv11 Miora has healing move in slot 0,
   # so blindly pressing A twice would heal forever and exhaust the team.
   POWERS={"seelenstups":22,"lichtfunke":26,"mondschein":36,"sternenstaub":34,"sternenfall":48,
    "sonnenchor":65,"heilflimmern":0,"schattentipp":26,"nebelbiss":37,"nachthieb":49,
    "finsternis":64,"glutfunken":26,"funkenflug":37,"feuerwirbel":49,"phönixstoß":64,
    "wasserperle":26,"wellenschlag":37,"gezeitenruf":49,"sturmflut":64,
    "blattschnips":26,"rankengriff":37,"waldsegen":0,"mooshammer":49,
    "wurzelsturm":64,"echowelle":44,"astralsturm":58}
   def fight(marker,flag,chapter):
    rest_if_needed()
    initial=approach(marker)
    assert initial["mode"]=="DIALOG",(who,marker,"no battle dialog")
    dismiss()
    page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
    screenshot("boss-"+marker)
    opening=stored()
    case.setdefault("combat_details",[]).append({"boss":marker,"chapter":chapter,
     "before":{"team":[{"id":m["id"],"lv":m["lv"],"hp":m["hp"]} for m in opening["team"]],"potions":opening["potions"]}})
    for turn in range(95):
     state=snap()
     if state["mode"]=="DIALOG":
      dismiss()
      if snap()["chapter"+str(chapter)].get(flag):break
      continue
     if state["mode"]!="BATTLE":
      raise AssertionError((who,marker,"unexpected mode/defeat",state["mode"],state["mapId"],state["team"]))
     page.wait_for_function("window.echoQASnapshot().mode!=='BATTLE'||(window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy)",timeout=12000)
     state=snap()
     if state["mode"]!="BATTLE":continue
     alive=[m for m in state["team"] if m["hp"]>0]
     assert alive,(who,marker,"team wiped",state)
     ally=alive[0]
     maxhp={m["id"]:m["maxHp"] for m in opening["team"]}.get(ally["id"],ally["hp"])
     cursor=state["battle"]["cursor"]
     if ally["hp"]<maxhp*.38 and stored()["potions"]>0:
      if cursor<2:press("DOWN")
      if snap()["battle"]["cursor"]%2:press("LEFT")
      assert snap()["battle"]["cursor"]==2
      press("A");case["potions_spent"]+=1
      page.wait_for_timeout(1650)
      continue
     if cursor>=2:press("UP")
     if snap()["battle"]["cursor"]%2:press("LEFT")
     press("A")
     assert snap()["mode"]=="ATTACKS",(who,marker,"no attack menu")
     power=[POWERS.get(m,0) for m in ally["moves"]]
     index=max(range(len(power)),key=lambda i:power[i])
     assert power[index]>0,(who,"no offensive attacks",ally)
     for i in range(index):press("DOWN")
     press("A");case["attacks"]+=1
     page.wait_for_timeout(1000)
     if snap()["chapter"+str(chapter)].get(flag):break
    assert snap()["chapter"+str(chapter)].get(flag),(who,marker,"boss not defeated after 95 turns")
    dismiss()
    case["bosses"].append(marker)
    case["combat_details"][-1]["after"]={"team":[{"id":m["id"],"lv":m["lv"],"hp":m["hp"]} for m in stored()["team"]],"potions":stored()["potions"]}
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
   case["chapter6_finish"]={"team":[{"id":m["id"],"lv":m["lv"],"hp":m["hp"]} for m in stored()["team"]],"potions":stored()["potions"],"orbs":stored()["orbs"]}
   print("NATURAL_CH6_COMPLETED",who,case["chapter6_finish"],flush=True)
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
   final=stored()
   case["final"]={"map":final["currentMapId"],"team":[{"id":m["id"],"lv":m["lv"],"xp":m["xp"],"maxHp":m["maxHp"],"hp":m["hp"]} for m in final["team"]],"potions":final["potions"],"orbs":final["orbs"],"ch6":final["chapter6"]["completed"],"ch7":final["chapter7"]["completed"]}
   (OUT/(who+"-chapter7-natural-save.json")).write_text(json.dumps(final,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
   print("NATURAL_CH7_COMPLETED",who,case["final"],flush=True)
   RESULT["cases"].append(case)
   ctx.close()
  assert not RESULT["page_errors"],RESULT["page_errors"]
  browser.close()
  print("REAL_CHAPTER6_7_PASS",json.dumps(RESULT,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(RESULT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 server.shutdown()
