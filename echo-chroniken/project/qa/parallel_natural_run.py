"""Fresh-save real input: Grandma -> package -> forest -> ruins -> Chapters 3 and 4.
No fixture, save injection, chapter flags, level edits or combat callbacks.
Real random encounters are left enabled, combat uses actual keyboard/touch.
"""
import functools,http.server,json,pathlib,threading,heapq,sys,traceback,time,os,io
from PIL import Image
from playwright.sync_api import sync_playwright

PROJECT=pathlib.Path(__file__).resolve().parent.parent
OUT=PROJECT.parent/"docs/visual-audit/parallel-lab"/os.environ["PARALLEL_RUN_ID"]
OUT.mkdir(parents=True,exist_ok=True)
LEVEL_BONUS=int(os.environ["PARALLEL_LEVEL_BONUS"])
CAPTURE_AFTER=int(os.environ["PARALLEL_CAPTURE_AFTER"])
HEAL_THRESHOLD=int(os.environ["PARALLEL_HEAL_PCT"])/100
SEED=int(os.environ["PARALLEL_SEED"])
assert LEVEL_BONUS in (0,1,2,5,10)
assert CAPTURE_AFTER in (0,1,2,3)
assert HEAL_THRESHOLD in (0,.25,.45,.65,.85)
print("PARALLEL_START",os.environ["PARALLEL_RUN_ID"],"levels",LEVEL_BONUS,
      "captureAfterWins",CAPTURE_AFTER,"healThreshold",HEAL_THRESHOLD,flush=True)
D={(1,0):"RIGHT",(-1,0):"LEFT",(0,1):"DOWN",(0,-1):"UP"}
SOLID={1,4,5,7}
RUIN_BLOCK={(6,4),(13,4),(6,6),(13,6),(3,7),(4,7),(15,7),(16,7),(4,5),(15,5),(10,3),(10,1),(9,6)}
REPORT={"scope":"Cold empty browser storage through Chapters 1-4 and a wild capture, ordinary Lv5 starter, natural inventory and actual keyboard/touch inputs","cases":[],"errors":[]}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(PROJECT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  REPORT["browser"]=browser.version
  for touch in ([True] if "--touch" in sys.argv else [False,True] if "--both" in sys.argv else [False]):
   who="touch" if touch else "desktop"
   case={"viewport":who,"steps":0,"dialogActions":0,"wildBattles":0,"caught":[],"wildWins":0,"trainerWins":0,"losses":0,"attacks":0,"potionsSpent":0,"orbsSpent":0,"checkpoints":[],"stage":"title"}
   context=browser.new_context(viewport={"width":412,"height":915} if touch else {"width":1280,"height":800},has_touch=touch,is_mobile=touch)
   if "--seeded" in sys.argv:
    # Reproducible random numbers, but still the exact unmodified encounter rates,
    # damage rules and capture probability. No forced fight, catch or win callback.
    seed=SEED+(1 if touch else 0)
    context.add_init_script("""(function(){let s=SEED;Math.random=function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};})();""".replace("SEED",str(seed)))
   page=context.new_page()
   page.on("pageerror",lambda e:REPORT["errors"].append(str(e)))
   page.goto(f"http://127.0.0.1:{srv.server_port}/"+("?touch" if touch else ""))
   page.wait_for_function("typeof window.echoQASnapshot==='function'")
   def snap():return page.evaluate("window.echoQASnapshot()")
   def saved():
    result=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save')||'null')")
    return result or {}
   last_preview=[0.0]
   def make_preview(force=False):
    if not force and time.monotonic()-last_preview[0]<6:return
    try:
     raw=page.screenshot(type="jpeg",quality=52,timeout=6000)
     image=Image.open(io.BytesIO(raw))
     image.thumbnail((640,500))
     temp=OUT/"preview.tmp"
     image.save(temp,format="JPEG",quality=51,optimize=True)
     temp.replace(OUT/"live.jpg")
     last_preview[0]=time.monotonic()
    except Exception as ex:print("PARALLEL_PREVIEW_WARN",str(ex)[:90],flush=True)
   make_preview(force=True)
   def press(cmd):
    if touch:page.locator(f'[data-cmd="{cmd}"]').tap()
    else:page.keyboard.press({"UP":"ArrowUp","DOWN":"ArrowDown","LEFT":"ArrowLeft","RIGHT":"ArrowRight","A":"Enter","B":"Backspace","START":"Escape"}[cmd])
    make_preview()
   def dismiss():
    for i in range(65):
     if snap()["mode"]!="DIALOG":return
     press("A");case["dialogActions"]+=1
    raise AssertionError((who,"dialog softlock",snap()))
   def shot(name):page.screenshot(path=str(OUT/(who+"-"+name+".png")),full_page=True)
   def reload_checkpoint(name):
    prev=saved()
    assert prev,("missing save",name)
    page.reload()
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    press("A");dismiss()
    again=saved()
    for key in ("introStage","hasStarter","routeQuest","ruinsProgress","chapter3","chapter4","caughtIds","seenIds","potions","orbs","team"):
     assert prev.get(key)==again.get(key),(name,key,prev.get(key),again.get(key))
    case["checkpoints"].append(name)
   def fight():
    start=snap()
    assert start["mode"]=="BATTLE",("not battle",start)
    before=saved()  # Real wild encounter: localStorage is not modified by the harness.
    case["wildBattles"]+=1
    attempted_capture=False
    for turn in range(50):
     mode=snap()["mode"]
     if mode=="DIALOG":dismiss();mode=snap()["mode"]
     if mode!="BATTLE":
      assert mode=="OVERWORLD",(who,"battle end",mode)
      after=saved()
      if after.get("caughtIds",{})!=before.get("caughtIds",{}):
       caught=set(after["caughtIds"])-set(before.get("caughtIds",{}))
       case["caught"].extend(sorted(caught))
      elif snap()["scene"]=="HOUSE":
       case["losses"]+=1
       raise AssertionError((who,"wild encounter defeated the player",snap()))
      else:case["wildWins"]+=1
      case["potionsSpent"]+=max(0,before.get("potions",0)-after.get("potions",0))
      case["orbsSpent"]+=max(0,before.get("orbs",0)-after.get("orbs",0))
      heal_overworld_if_hurt()
      return
     page.wait_for_function("window.echoQASnapshot().mode!=='BATTLE'||(window.echoQASnapshot().battle&&!window.echoQASnapshot().battle.busy)",timeout=13000)
     if snap()["mode"]!="BATTLE":continue
     # A first normal wild encounter is a chance to recruit one real teammate.
     if not attempted_capture and not case["caught"] and case["wildWins"]>=CAPTURE_AFTER and saved().get("orbs",12)>0:
      # Battle action 2 (down from Attack) throws an orb against wild spirits.
      press("DOWN");press("A");attempted_capture=True
      page.wait_for_timeout(800)
      continue
     # A failed capture leaves the battle cursor on slot 1 (orb), not slot 0.
     if snap()["battle"]["cursor"]%2:press("LEFT")
     if snap()["battle"]["cursor"]>=2:press("UP")
     press("A")
     assert snap()["mode"]=="ATTACKS",(who,"attack menu did not open")
     press("A");case["attacks"]+=1
     page.wait_for_timeout(900)
    raise AssertionError((who,"wild battle longer than 50 actions",snap()))
   def heal_overworld_if_hurt():
    state=snap()
    if state["mode"]!="OVERWORLD" or state["scene"]=="HOUSE":return
    inventory=saved()
    if inventory.get("potions",0)<=0:return
    max_by_id={m["id"]:m["maxHp"] for m in inventory.get("team",[])}
    if not any(m["hp"]<max_by_id.get(m["id"],m["hp"])*HEAL_THRESHOLD for m in state["team"]):return
    original=inventory["potions"]
    # Normal travel menu: Start -> Heal (slot 1) -> A; no save edits.
    press("START");assert snap()["mode"]=="MENU",(who,"healing menu inaccessible")
    press("DOWN");press("A");assert snap()["mode"]=="DIALOG"
    dismiss()
    assert saved()["potions"]==original-1,(who,"travel potion did not deduct",original,saved())
    case["potionsSpent"]+=1
   def walk_cmd(cmd,expect=None):
    before=snap();press(cmd)
    if before["scene"]=="OVERWORLD" and snap()["mode"]=="BATTLE":fight()
    if snap()["mode"]=="DIALOG":dismiss()
    after=snap()
    if after["scene"]=="HOUSE" and before["scene"]=="OVERWORLD":return
    case["steps"]+=1
    if expect:
     assert (after["player"]["x"],after["player"]["y"])==expect,(who,"blocked step",expect,after)
   def move(commands):
    for cmd in commands:walk_cmd(cmd)
   def village_data():
    return page.evaluate("""() => ({
      map:window.EchoVillage.map,
      guide:window.EchoRoute.GUIDE,keeper:window.EchoRoute.KEEPER,
      points:window.EchoRoute.POINTS,
      npcs:window.EchoVillage.getNpcList(),
      exits:window.EchoMaps.get('legacy_wurzeldorf').exits
    })""")
   extra_block=set()
   def region_data():
    return page.evaluate("""() => {
      const id=window.echoQASnapshot().mapId,m=window.EchoMaps.get(id);
      return {id,tiles:m.tiles,exits:m.exits,
       markers:[...(window.EchoChapter3?.markers?.[id]||[]),...(window.EchoChapter4?.markers?.[id]||[]),...(window.EchoChapter5?.markers?.[id]||[])]};
    }""")
   def find_path(goal,scene="OVERWORLD",allowed_exit=False):
    start=(snap()["player"]["x"],snap()["player"]["y"])
    if scene=="OVERWORLD":
     data=village_data();tiles=data["map"]
     block={(n["x"],n["y"]) for n in data["npcs"]}
     block|={(data[k]["x"],data[k]["y"]) for k in ("guide","keeper")}
     block|={(x,y) for x,y in [(11,12),(23,11),(28,20),(24,6),(16,9),(25,13),(31,22)]}
     exits={(e["x"],e["y"]) for e in data["exits"]}
    elif scene=="REGION":
     data=region_data();tiles=data["tiles"]
     block={(m["x"],m["y"]) for m in data["markers"]}
     exits={(e["x"],e["y"]) for e in data["exits"]}
    else:
     tiles=[[0 for x in range(20)] for y in range(11)]
     block=RUIN_BLOCK;exits=set()
    block|=extra_block
    def valid(x,y):
     if not 0<=y<len(tiles) or not 0<=x<len(tiles[y]):return False
     if scene=="RUINS" and not(2<=x<=17 and 2<=y<=9):return False
     if tiles[y][x] in SOLID:return False
     if (x,y) in block:return False
     if (x,y) in exits and not(allowed_exit and (x,y)==goal):return False
     return True
    pq=[(0,start)];dist={start:0};prev={start:None}
    while pq:
     cost,point=heapq.heappop(pq)
     if cost!=dist.get(point):continue
     if point==goal:break
     for delta,cmd in D.items():
      nxt=(point[0]+delta[0],point[1]+delta[1])
      if not valid(*nxt):continue
      weight=1+(12 if scene=="OVERWORLD" and tiles[nxt[1]][nxt[0]]==2 else 0)
      new=cost+weight
      if new<dist.get(nxt,float("inf")):
       dist[nxt]=new;prev[nxt]=(point,cmd);heapq.heappush(pq,(new,nxt))
    assert goal in prev,(who,scene,"unreachable",start,goal)
    steps=[];at=goal
    while prev[at]:
     parent,cmd=prev[at];steps.append((cmd,at));at=parent
    return list(reversed(steps))
   def walk_to(goal,scene="OVERWORLD",allowed_exit=False):
    for retries in range(20):
     if (snap()["player"]["x"],snap()["player"]["y"])==goal:return
     plan=find_path(goal,scene,allowed_exit)
     if not plan: return
     blocked=False
     for cmd,target in plan:
      before=snap()
      press(cmd)
      if snap()["mode"]=="BATTLE":fight()
      if snap()["mode"]=="DIALOG":dismiss()
      after=snap()
      case["steps"]+=1
      if after["mapId"]!=before["mapId"]:
       assert allowed_exit,(who,"unexpected portal",before["mapId"],after["mapId"])
       return
      if (after["player"]["x"],after["player"]["y"])!=target:
       if after["scene"]!=before["scene"]:
        assert allowed_exit,(who,"unexpected scene change",before,after)
        return
       extra_block.add(target);blocked=True;break
     if not blocked:return
    raise AssertionError((who,"navigation retries exceeded",goal,snap()))
   def interact_near(target,scene="OVERWORLD",face=True):
    origin=(snap()["player"]["x"],snap()["player"]["y"])
    options=[]
    for (dx,dy),cmd in D.items():
     near=(target[0]-dx,target[1]-dy)
     try:path=find_path(near,scene)
     except AssertionError:continue
     options.append((len(path),near,cmd))
    assert options,(who,"cannot reach interaction",target,origin)
    _,near,cmd=min(options)
    walk_to(near,scene)
    if face:
     press(cmd)
     if snap()["mode"]=="BATTLE":fight()
     if snap()["mode"]=="DIALOG":dismiss()
    press("A")
    return snap()
   def talk_at(target,scene="OVERWORLD",face=True):
    mode=interact_near(target,scene,face)["mode"]
    assert mode in ("DIALOG","BATTLE"),(who,"interaction missing",target,mode)
    if mode=="DIALOG":dismiss()
    return snap()
   def trainer_fight():
    assert snap()["mode"]=="BATTLE"
    before=saved()
    used_potions=0
    for turn in range(70):
     mode=snap()["mode"]
     if mode=="DIALOG":dismiss();mode=snap()["mode"]
     if mode!="BATTLE":
      assert mode=="OVERWORLD",(who,"trainer fight end",snap())
      if snap()["scene"]=="HOUSE":
       case["losses"]+=1
       raise AssertionError((who,"trainer battle lost; recovered at Grandma",case["stage"]))
      case["trainerWins"]+=1
      case["potionsSpent"]+=max(0,before.get("potions",0)-saved().get("potions",0))
      return
     page.wait_for_function("window.echoQASnapshot().mode!=='BATTLE'||(window.echoQASnapshot().battle&&!window.echoQASnapshot().battle.busy)",timeout=12000)
     state=snap()
     if state["mode"]!="BATTLE":continue
     fighters=[m for m in state["team"] if m["hp"]>0]
     assert fighters,(who,"team defeated",case["stage"])
     active=fighters[0]
     maxhp=next((m["maxHp"] for m in before["team"] if m["id"]==active["id"]),active["hp"])
     cursor=state["battle"]["cursor"]
     if active["hp"]<maxhp*HEAL_THRESHOLD and used_potions<before.get("potions",0):
      if cursor<2:press("DOWN")
      if snap()["battle"]["cursor"]%2:press("LEFT")
      assert snap()["battle"]["cursor"]==2
      press("A")
      used_potions+=1
      page.wait_for_timeout(1650)
      continue
     if cursor>=2:press("UP")
     if snap()["battle"]["cursor"]%2:press("LEFT")
     press("A");assert snap()["mode"]=="ATTACKS"
     press("A");case["attacks"]+=1;page.wait_for_timeout(1000)
    raise AssertionError((who,"trainer fight exhausted",snap()))
   def stage(label):
    case["stage"]=label
    make_preview(force=True)
    s=saved()
    case["lastSave"]={"map":s.get("currentMapId"),"lv":[m["lv"] for m in s.get("team",[])],"potions":s.get("potions"),"orbs":s.get("orbs")}
    case.setdefault("milestones",[]).append({"stage":label,"map":s.get("currentMapId"),"team":[{"id":m["id"],"lv":m["lv"],"xp":m.get("xp"),"hp":m["hp"],"maxHp":m["maxHp"]} for m in s.get("team",[])],
      "potions":s.get("potions"),"orbs":s.get("orbs"),"battleWins":s.get("battleWins"),
      "storyComplete":{k:bool((s.get(k) or {}).get("completed")) for k in ("chapter3","chapter4")}})
    print("NATURAL_STAGE",who,label,case["lastSave"],flush=True)
   try:
    # No injected saves and no artificial chapter flags.
    assert page.evaluate("localStorage.getItem('echo_chroniken_tv_save')") is None
    assert snap()["mode"]=="TITLE" and snap()["scene"]=="HOUSE" and snap()["introStage"]==0
    press("A")
    move(["DOWN"]*3);dismiss()
    move(["UP","UP","LEFT","LEFT","LEFT"]);talk_at_dummy=None
    press("A");dismiss();assert snap()["introStage"]==1
    move(["UP"]+["RIGHT"]*6+["UP","UP"]);press("A");dismiss()
    assert snap()["introStage"]==2 and snap()["starter"] and snap()["team"][0]["lv"]==5
    move(["DOWN"]+["LEFT"]*6+["DOWN","LEFT"]);press("A");dismiss()
    assert snap()["introStage"]==3
    move(["RIGHT","RIGHT","DOWN","DOWN","DOWN"]);dismiss()
    assert snap()["scene"]=="OVERWORLD" and snap()["introStage"]==4
    stage("intro/parcel");shot("intro-complete")
    reload_checkpoint("intro")
    data=village_data()
    print("VILLAGE_METADATA",who,"exits",data["exits"],flush=True)
    # Chapter 1, woodland: talk to guide, collect all three lights, return.
    talk_at((17,18));assert snap()["routeQuest"]["accepted"]
    for p in data["points"]:
     before=len(snap()["routeQuest"]["lights"])
     talk_at((p["x"],p["y"]),face=False)
     assert len(snap()["routeQuest"]["lights"])==before+1,(who,"light pickup",p,snap())
    talk_at((17,18));assert snap()["routeQuest"]["rewarded"]
    stage("forest lights");shot("lights-complete")
    reload_checkpoint("lights")
    # Seek authentic random encounters by physically walking between two high-grass tiles.
    # The RNG, wild levels, captures and XP are all the unmodified game rules.
    meadow=village_data()["map"]
    assert meadow[23][13]==2 and meadow[23][14]==2,(who,"wild meadow was removed")
    walk_to((13,23))
    for attempts in range(220):
     if case["wildBattles"]>=2 and case["caught"]:break
     player=snap()["player"]
     pos=(player["x"],player["y"])
     assert pos in ((13,23),(14,23)),(who,"left the meadow",pos)
     cmd="RIGHT" if pos==(13,23) else "LEFT"
     press(cmd);case["steps"]+=1
     if snap()["mode"]=="BATTLE":fight()
     if snap()["mode"]=="DIALOG":dismiss()
     assert snap()["scene"]=="OVERWORLD",(who,"not in forest after wild fight",snap())
    assert case["wildBattles"]>=2,(who,"no natural wild encounters after 220 high-grass steps")
    assert case["caught"],(who,"no wild creature caught with natural orb chance")
    assert case["wildWins"]>=1,(who,"did not gain genuine wild-fight experience")
    stage("wild catch and XP");shot("wild-team")
    reload_checkpoint("captured teammate")
    # Strict player-selected level gate. All currently owned spirits must gain
    # the required bonus through real wild fights BEFORE leaving starting village.
    # No XP editing and no forced wins. A fixed safety limit reports a BLOCKED rule.
    from level_gate import make_requirements,meets_level_gate,summary as level_summary
    start_team=saved()["team"]
    catalog=page.evaluate("window.ECHO_SPECIES.map(s=>({id:s.id,evolvesTo:s.evolvesTo}))")
    requirements=make_requirements(start_team,catalog,LEVEL_BONUS)
    wanted={str(r["slot"])+":"+str(r["id"]):r["goal"] for r in requirements}
    case["levelRule"]={"plus":LEVEL_BONUS,"targets":wanted,
                       "lineage":{str(r["slot"]):r["lineage"] for r in requirements}}
    print("PARALLEL_RULE",who,"level gate +",LEVEL_BONUS,wanted,flush=True)
    if LEVEL_BONUS:
     limit=120+LEVEL_BONUS*35
     for grind in range(limit):
      current_team=saved()["team"]
      owned=level_summary(current_team)
      if meets_level_gate(current_team,requirements):
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
      owned=level_summary(saved()["team"])
      print("PARALLEL_GATE_BLOCKED",who,wanted,owned,flush=True)
      raise AssertionError(("PARALLEL_GATE_BLOCKED",wanted,owned,"limit",limit))
    stage("level gate passed")
    # Optional early trainer test. No fake win callback.
    piko=interact_near((30,23))
    assert piko["mode"]=="BATTLE",(who,"Piko should challenge",piko["mode"])
    trainer_fight()
    assert snap()["routeQuest"]["guardianWon"]
    stage("optional Piko");shot("piko-defeated")
    # Chapter 2, ruins entrance & 3 ordered seals.
    walk_to((25,21))
    press("A");dismiss()
    assert snap()["scene"]=="RUINS",(who,"ruins gate",snap())
    for stone in [(4,5),(15,5),(10,3)]:
     talk_at(stone,scene="RUINS",face=False)
    assert len(snap()["ruinsProgress"]["seals"])==3
    stage("ruins seals");shot("seals")
    test=interact_near((10,1),scene="RUINS")
    assert test["mode"]=="DIALOG",(who,"ruins guardian missing")
    dismiss()
    assert snap()["mode"]=="BATTLE",(who,"ruins boss did not start",snap())
    trainer_fight()
    assert snap()["ruinsProgress"]["bossWon"]
    stage("ruins guardian");shot("ruins-guardian")
    walk_to((10,9),scene="RUINS")
    press("DOWN")
    assert snap()["scene"]=="OVERWORLD"
    walk_to((5,6))
    press("UP");press("UP")
    assert snap()["scene"]=="HOUSE",(who,"grandma house return",snap())
    move(["UP","UP","LEFT","LEFT"]);press("A");dismiss()
    assert snap()["ruinsProgress"]["reported"],(who,"chapter 2 report missing",snap())
    stage("chapter 2 reported");shot("chapter2-done")
    reload_checkpoint("chapter2")
    move(["RIGHT","RIGHT","DOWN","DOWN","DOWN"]);dismiss()
    assert snap()["scene"]=="OVERWORLD"
    # Route from the actual chapter-2 finish into chapter 3.
    exits=village_data()["exits"]
    north=[e for e in exits if e.get("toMapId")=="nebelhafen_town" or e.get("exitId")=="to_lake"]
    print("NORTH_EXIT",north,flush=True)
    # Any verified next-region gate is valid only if the real move changes maps.
    for e in north:
     walk_to((e["x"],e["y"]),allowed_exit=True)
     if snap()["mapId"]!="legacy_wurzeldorf":break
    assert snap()["mapId"]=="lake_north_path",(who,"northern path inaccessible",exits,snap())
    stage("north lake path")
    # Continue via actual region portals, not by changing the save or map id.
    for _ in range(5):
     if snap()["mapId"]=="nebelhafen_town":break
     data=region_data()
     candidates=sorted(data["exits"],key=lambda e: e["toMapId"]!="nebelhafen_town")
     assert candidates,(who,"no onward route",data["id"])
     before=snap()["mapId"]
     for e in candidates:
      walk_to((e["x"],e["y"]),scene="REGION",allowed_exit=True)
      if snap()["mapId"]!=before:break
     assert snap()["mapId"]!=before,(who,"all regional exits blocked",data["id"])
    assert snap()["mapId"]=="nebelhafen_town",(who,"chapter 3 not reached",snap())
    stage("chapter 3 reached");shot("chapter3-entry")
    reload_checkpoint("chapter3 entry")
    # Continue the SAME naturally gained team and inventory through Chapter 3.
    def marker(typ):
     here=region_data()
     found=[x for x in here["markers"] if x["type"]==typ]
     assert len(found)==1,(who,here["id"],"marker not unique",typ,found)
     return found[0]
    def say(typ):
     p=marker(typ)
     return talk_at((p["x"],p["y"]),scene="REGION")
    def leave(exit_id,to):
     here=region_data()
     found=[x for x in here["exits"] if x["exitId"]==exit_id]
     assert len(found)==1,(who,"exit not unique",here["id"],exit_id)
     p=found[0]
     walk_to((p["x"],p["y"]),scene="REGION",allowed_exit=True)
     assert snap()["mapId"]==to,(who,"regional portal failed",exit_id,to,snap())
    say("sera")
    for m in ("witness0","witness1","witness2"):say(m)
    assert snap()["chapter3"]["witnessesReady"],(who,"chapter 3 witnesses incomplete",snap())
    stage("chapter3 witnesses")
    leave("to_pumpworks","pumpworks_floor1")
    for m in ("power","valve0","valve1","rotor"):say(m)
    assert snap()["chapter3"]["waterLowered"],(who,"chapter3 pump puzzle")
    stage("pumpworks puzzle");shot("pumpworks")
    leave("to_control","pumpworks_controlroom")
    say("boss")
    assert snap()["mode"]=="BATTLE",(who,"natural chapter3 boss missing",snap())
    trainer_fight()
    assert snap()["chapter3"]["bossWon"],(who,"natural chapter3 boss not won",snap())
    say("recording")
    assert snap()["chapter3"]["completed"],(who,"chapter3 story not completed",snap())
    stage("chapter 3 complete");shot("chapter3-complete")
    reload_checkpoint("chapter3 completed")
    leave("to_tunnel","root_tunnel")
    stage("chapter 4 reached");shot("chapter4-entry")
    reload_checkpoint("chapter4 entry")
    # Chapter 4: the full switchyard, two bosses and railway are real inputs.
    say("diary")
    leave("to_station","station_wurzelheim")
    say("edda")
    leave("to_yard","rail_switchyard")
    say("switchB")  # Incorrect order must not unlock the train.
    assert not snap()["chapter4"]["switches"]
    for switch in ("switchA","switchC","switchB"):say(switch)
    assert snap()["chapter4"]["railsReady"]
    stage("rail switch puzzle");shot("rail-switches")
    reload_checkpoint("switches")
    leave("to_station","station_wurzelheim")
    def train(destination):
     here=region_data()
     p=marker("train")
     entered=interact_near((p["x"],p["y"]),scene="REGION")
     assert entered["mode"]=="RAIL",(who,"rail menu",entered)
     options=page.evaluate("""() => window.EchoRail.destinations(JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))).map(x=>x.id)""")
     assert destination in options,(who,"rail destination unavailable",destination,options)
     for i in range(8):
      if snap()["railCursor"]==options.index(destination):break
      press("DOWN")
     assert snap()["railCursor"]==options.index(destination),(who,"rail menu did not select",destination,snap())
     press("A");page.wait_for_function("(id)=>window.echoQASnapshot().mapId===id",arg=destination)
     dismiss()
     assert snap()["mode"]=="OVERWORLD"
    train("station_moorglas")
    assert snap()["chapter4"]["firstTrip"]
    leave("to_bog","moorglas_bog")
    say("rootBoss")
    assert not snap()["chapter4"]["rootBossWon"]
    say("courier")
    assert snap()["mode"]=="BATTLE",(who,"courier fight not started",snap())
    trainer_fight()
    assert snap()["chapter4"]["courierWon"],(who,"courier lost")
    stage("courier beaten")
    say("rootBoss")
    assert snap()["mode"]=="BATTLE",(who,"root boss not started",snap())
    trainer_fight()
    assert snap()["chapter4"]["rootBossWon"],(who,"root boss lost")
    stage("root defeated");shot("root-boss")
    leave("to_station","station_moorglas")
    train("station_wurzelheim")
    assert snap()["chapter4"]["completed"] and snap()["chapter4"]["returnTrip"],(who,"chapter4 not completed",snap())
    stage("chapter4 completed");shot("chapter4-complete")
    reload_checkpoint("chapter4 complete")
    (OUT/(who+"-chapter4-natural-save.json")).write_text(json.dumps(saved(),ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    case["success"]=True
   except Exception as e:
    case["success"]=False;case["failure"]=str(e);REPORT["errors"].append({"view":who,"stage":case["stage"],"error":repr(e),"trace":traceback.format_exc()})
    shot("FAILED-"+case["stage"].replace("/","-").replace(" ","-"))
    print("NATURAL_FAILED",who,case["stage"],repr(e),flush=True)
   case["summary"]=case.pop("lastSave",{})
   REPORT["cases"].append(case)
   context.close()
  browser.close()
finally:
 (OUT/"report.json").write_text(json.dumps(REPORT,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 srv.shutdown()
if REPORT["errors"]:raise AssertionError("Natural opening failed, see "+str(OUT/"report.json"))
print("NATURAL_OPENING_PASS",json.dumps(REPORT,ensure_ascii=False),flush=True)
