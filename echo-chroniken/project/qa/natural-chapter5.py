"""Continue a naturally earned chapter-4 save through chapter 5 with real input.

No altered level, team, quests or inventory. The save is generated only by the
fresh-start browser playthrough natural-opening.py. The rail journey and all
chapter-5 battles must use actual controls, never quest or victory callbacks.
"""
import copy
import functools
import http.server
import json
import pathlib
import threading
import sys
from collections import deque
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
OUT = PROJECT.parent / "docs/visual-audit/natural-chapter5"
OUT.mkdir(parents=True, exist_ok=True)
NATURAL_SAVES = PROJECT.parent/"docs/visual-audit/natural-opening"
DIRS = {(-1,0):"LEFT",(1,0):"RIGHT",(0,-1):"UP",(0,1):"DOWN"}
BLOCKED = {1,4,5,7}
report = {"scope": "Chapter 5 starting from an actual unmodified save earned from fresh Grandma/package; natural Lv9 team and potions",
          "cases": [], "page_errors": []}

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(PROJECT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
try:
  with sync_playwright() as pw:
    browser = pw.chromium.launch(channel="chrome", headless=True)
    report["chrome"] = browser.version
    for mobile in ((False,True) if '--both' in sys.argv else (False,)):
      name = "touch" if mobile else "desktop"
      natural_file=NATURAL_SAVES/(name+"-chapter4-natural-save.json")
      assert natural_file.exists(),("First run natural-opening.py --both --seeded",natural_file)
      initial=json.loads(natural_file.read_text(encoding="utf-8"))
      assert initial["chapter3"]["completed"] and initial["chapter4"]["completed"]
      assert initial["currentMapId"]=="station_wurzelheim"
      assert max(m["lv"] for m in initial["team"])<20,"Natural team accidentally overleveled"
      initial_orbs,initial_potions=initial["orbs"],initial["potions"]
      context=browser.new_context(viewport={"width":412,"height":915} if mobile
            else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
      page=context.new_page()
      page.on("pageerror",lambda err: report["page_errors"].append(str(err)))
      context.add_init_script(
          "if(!sessionStorage.getItem('ch5-seeded')){"
          + "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("
          + json.dumps(initial) + "));sessionStorage.setItem('ch5-seeded','1');}")
      page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
      page.wait_for_function("typeof window.echoQASnapshot==='function'")
      case={"viewport":name,"steps":0,"interactions":0,"boss_attacks":0,"potions_spent":0,
            "bosses":[],"rail_trips":[],"portals":[],"reloads":[]}
      def snap():return page.evaluate("window.echoQASnapshot()")
      def save():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
      def push(command):
        if mobile:page.locator(f'[data-cmd="{command}"]').tap()
        else:page.keyboard.press({"UP":"ArrowUp","DOWN":"ArrowDown","LEFT":"ArrowLeft",
                                   "RIGHT":"ArrowRight","A":"Enter","B":"Backspace"}[command])
      def dismiss():
        for _ in range(40):
          if snap()["mode"]!="DIALOG":return
          push("A")
        raise AssertionError(name+": dialogue did not close")
      def shot(label):
        page.screenshot(path=str(OUT/(name+"-"+label+".png")),full_page=True)
      push("A")
      page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
      assert snap()["mapId"]=="station_wurzelheim", (name,snap())

      def mapdata():
        return page.evaluate("""() => {
          const id=window.echoQASnapshot().mapId;
          const m=window.EchoMaps.get(id);
          const mod=window.EchoChapter5;
          return {id,tiles:m.tiles,exits:m.exits,markers:mod.markers[id]||window.EchoChapter4.markers[id]||[]};
        }""")
      def route(goal,exit_ok=False):
        m=mapdata()
        state=snap()
        start=(state["player"]["x"],state["player"]["y"])
        tiles=m["tiles"];w=len(tiles[0]);h=len(tiles)
        markers={(v["x"],v["y"]) for v in m["markers"]}
        exits={(v["x"],v["y"]) for v in m["exits"]}
        queue=deque([start]);parent={start:None}
        while queue and goal not in parent:
          x,y=queue.popleft()
          for (dx,dy),cmd in DIRS.items():
            xy=(x+dx,y+dy)
            if xy in parent:continue
            nx,ny=xy
            if nx<0 or ny<0 or nx>=w or ny>=h or tiles[ny][nx] in BLOCKED:continue
            if xy in markers or (xy in exits and not(exit_ok and xy==goal)):continue
            parent[xy]=((x,y),cmd)
            queue.append(xy)
        assert goal in parent,(name,m["id"],start,goal,"path unreachable")
        path=[];at=goal
        while parent[at] is not None:
          previous,cmd=parent[at]
          path.append((cmd,at))
          at=previous
        return list(reversed(path))
      def walk(goal,to=None):
        beginning=snap()["mapId"]
        for cmd,xy in route(goal,exit_ok=bool(to)):
          assert snap()["mode"]=="OVERWORLD",(name,"walk mode",snap()["mode"])
          push(cmd);current=snap()
          if to and xy==goal:
            assert current["mapId"]==to,(name,beginning,to,current)
            dismiss()
            assert snap()["mode"]=="OVERWORLD"
          else:
            assert current["mapId"]==beginning,(name,"unexpected map",current)
            assert (current["player"]["x"],current["player"]["y"])==xy,(name,"blocked tile",xy,current)
          case["steps"]+=1
      def approach_target(xy):
        best=None
        for (dx,dy),facing in DIRS.items():
          neighbor=(xy[0]-dx,xy[1]-dy)
          try:steps=route(neighbor)
          except AssertionError:continue
          if best is None or len(steps)<len(best[0]):
            best=(steps,neighbor,facing)
        assert best,(name,"cannot approach",mapdata()["id"],xy)
        _,neighbor,facing=best
        walk(neighbor);push(facing)
        assert (snap()["player"]["x"],snap()["player"]["y"])==neighbor
      def approach(marker):
        data=mapdata()
        points=[p for p in data["markers"] if p["type"]==marker]
        assert len(points)==1,(name,data["id"],marker)
        p=points[0]
        approach_target((p["x"],p["y"]))
        push("A");case["interactions"]+=1
        return snap()
      def talk(marker):
        state=approach(marker)
        assert state["mode"] in ("DIALOG","RAIL"),(name,marker,state["mode"])
        if state["mode"]=="DIALOG":dismiss()
        return snap()
      def portal(exit_id,destination):
        data=mapdata()
        e=next(x for x in data["exits"] if x["exitId"]==exit_id)
        walk((e["x"],e["y"]),destination)
        case["portals"].append(data["id"]+" -> "+destination)
      def locked(exit_id):
        m=mapdata()
        e=next(x for x in m["exits"] if x["exitId"]==exit_id)
        approach_target((e["x"],e["y"]))
        facing={"up":"UP","down":"DOWN","left":"LEFT","right":"RIGHT"}[snap()["player"]["dir"]]
        old=snap()["mapId"];push(facing)
        assert snap()["mapId"]==old,(name,"gate bypassed",exit_id)
        assert snap()["mode"]=="DIALOG",(name,"missing locked gate reason",exit_id,snap())
        dismiss();case["interactions"]+=1
      def reload_check(map_id,flag):
        old=save()
        page.reload();page.wait_for_function("typeof window.echoQASnapshot==='function'")
        push("A")
        page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
        state=snap()
        assert state["mapId"]==map_id,(name,"reload map",state)
        assert state["chapter5"][flag],(name,"lost quest field",flag,state["chapter5"])
        assert save()["chapter5"]==old["chapter5"],(name,"save changed on reload",flag)
        case["reloads"].append(flag)
      def rest_with_real_potion():
        state=snap()
        assert state["mode"]=="OVERWORLD",(name,"cannot rest outside overworld")
        current=save()
        if current["potions"]<=0:return
        by_id={m["id"]:m["maxHp"] for m in current["team"]}
        if all(m["hp"]>=by_id.get(m["id"],m["hp"]) for m in state["team"]):return
        push("START");assert snap()["mode"]=="MENU"
        push("DOWN");push("A")
        assert snap()["mode"]=="DIALOG",(name,"travel heal failed")
        dismiss()
        assert save()["potions"]==current["potions"]-1,(name,"rest should cost one potion")
        case["potions_spent"]+=1
      def fight(marker,flag):
        before=approach(marker)
        assert before["mode"]=="DIALOG",(name,marker,before["mode"])
        dismiss()
        page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
        shot("fight-"+marker)
        case.setdefault("combat_start",[]).append({"boss":marker,"team":snap()["team"],"potions":save()["potions"]})
        for _ in range(65):
          state=snap()
          if state["mode"]=="DIALOG":
            dismiss()
            if snap()["chapter5"].get(flag):break
            continue
          if state["mode"]!="BATTLE":
            raise AssertionError((name,marker,"combat lost or unexpected game mode",state["mode"],state["scene"],state["team"]))
          page.wait_for_function(
            "window.echoQASnapshot().mode!=='BATTLE'||(window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy)",
            timeout=10000)
          state=snap()
          if state["mode"]!="BATTLE":continue
          alive=[m for m in state["team"] if m["hp"]>0]
          assert alive,(name,marker,"team died")
          active=alive[0]
          by_id={m["id"]:m["maxHp"] for m in save()["team"]}
          limit=by_id.get(active["id"],active["hp"])
          cursor=state["battle"]["cursor"]
          if active["hp"]<limit*.48 and save()["potions"]>0:
            if cursor<2:push("DOWN")
            if snap()["battle"]["cursor"]%2:push("LEFT")
            assert snap()["battle"]["cursor"]==2
            push("A");case["potions_spent"]+=1
            page.wait_for_timeout(1650)
            continue
          if cursor>=2:push("UP")
          if snap()["battle"]["cursor"]%2:push("LEFT")
          push("A")
          assert snap()["mode"]=="ATTACKS"
          push("A")
          case["boss_attacks"]+=1
          page.wait_for_timeout(1000)
          if snap()["chapter5"].get(flag):break
        assert snap()["chapter5"].get(flag),(name,marker,"not won")
        dismiss();case["bosses"].append(marker)

      # Continue from the real Chapter-4 save; take the railway with actual controls.
      entered=approach("train")
      assert entered["mode"]=="RAIL",(name,"natural train locked",entered)
      options=page.evaluate("""() => window.EchoRail.destinations(JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))).map(x=>x.id)""")
      assert "station_moorglas" in options,(name,"Moorglas train locked",options)
      for i in range(8):
        if snap()["railCursor"]==options.index("station_moorglas"):break
        push("DOWN")
      assert snap()["railCursor"]==options.index("station_moorglas")
      push("A")
      page.wait_for_function("window.echoQASnapshot().mapId==='station_moorglas'")
      dismiss()
      portal("to_bog","moorglas_bog")
      # Natural team and items proceed unchanged into the next chapter.
      portal("to_stillwater","moor_to_stillwater")
      portal("to_town","stillwasser_town")
      locked("to_tower")
      for i in range(3):
        talk("resident"+str(i))
        assert snap()["chapter5"]["residents"][i]==1
      for i in range(3):
        talk("resident"+str(i))
        assert i in snap()["chapter5"]["contradictions"]
      assert len(snap()["chapter5"]["contradictions"])==3
      shot("three-residents")
      portal("to_archive","stillwater_archive")
      talk("libraryRoute")
      assert not snap()["chapter5"]["libraryBypass"]
      assert snap()["chapter5"]["hintFailures"]==1
      talk("lyra")
      assert not snap()["chapter5"]["lyraTrusted"]
      talk("ledger");talk("portrait")
      assert len(snap()["chapter5"]["evidence"])==2
      # Reload *during* an unfinished archive puzzle.
      evidence_before=save()["chapter5"]["evidence"]
      page.reload();page.wait_for_function("typeof window.echoQASnapshot==='function'")
      push("A");page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
      assert snap()["mapId"]=="stillwater_archive"
      assert snap()["chapter5"]["evidence"]==evidence_before
      case["reloads"].append("two-archive-clues")
      talk("diary");talk("diary")
      assert len(snap()["chapter5"]["evidence"])==3
      assert snap()["chapter5"]["truthEvidence3"]
      shot("archive-proof")
      talk("lyra")
      assert snap()["chapter5"]["lyraTrusted"]
      talk("libraryRoute")
      assert snap()["chapter5"]["libraryBypass"]
      reload_check("stillwater_archive","libraryBypass")
      portal("to_town","stillwasser_town")
      portal("to_tower","stillwater_tower")
      # The mirror cannot start until the cable was disconnected.
      talk("mirror")
      assert not snap()["chapter5"]["mirrorWon"]
      talk("antenna")
      assert not snap()["chapter5"]["completed"]
      talk("cable")
      assert snap()["chapter5"]["cableDisconnected"]
      fight("mirror","mirrorWon")
      talk("mirror")
      rest_with_real_potion() # Genuine player menu, not free test-side HP edit.
      fight("lyraDuel","duelWon")
      talk("lyraDuel")
      shot("tower-cleared")
      start=save()
      talk("antenna")
      state=snap()["chapter5"]
      assert state["completed"] and state["rail_stillwasser"] and state["rewardClaimed"]
      after=save()
      assert after["orbs"]==start["orbs"]+5
      assert after["potions"]==start["potions"]+3
      talk("antenna")
      assert (save()["orbs"],save()["potions"])==(after["orbs"],after["potions"])
      reload_check("stillwater_tower","completed")
      portal("to_town","stillwasser_town")
      portal("to_station","station_stillwasser")
      def train(dest):
        before=approach("train")
        assert before["mode"]=="RAIL",(name,"train menu",before["mode"])
        destinations=page.evaluate("""() => {
          const state=JSON.parse(localStorage.getItem('echo_chroniken_tv_save'));
          return window.EchoRail.destinations(state).map(x=>x.id);
        }""")
        assert dest in destinations,(name,"rail destination unavailable",dest,destinations)
        target=destinations.index(dest)
        for _ in range(8):
          if snap()["railCursor"]==target:break
          push("DOWN")
        assert snap()["railCursor"]==target,(name,"rail select",dest,snap())
        shot("rail-"+str(len(case["rail_trips"])+1))
        push("A")
        page.wait_for_function("(id) => window.echoQASnapshot().mapId===id",arg=dest)
        dismiss()
        assert snap()["mode"]=="OVERWORLD"
        case["rail_trips"].append(dest)
      train("station_moorglas")
      train("station_stillwasser")
      assert snap()["mapId"]=="station_stillwasser"
      assert save()["orbs"]==initial_orbs+5,(name,"unexpected sphere count",save()["orbs"])
      assert save()["potions"]==initial_potions+3-case["potions_spent"],(name,"unexpected potion economy",save()["potions"],case["potions_spent"])
      reload_check("station_stillwasser","completed")
      shot("chapter5-complete")
      final=save()
      case["final"]={"map":final["currentMapId"],"team":[{"id":m["id"],"lv":m["lv"],"xp":m["xp"],"hp":m["hp"],"maxHp":m["maxHp"]} for m in final["team"]],"potions":final["potions"],"orbs":final["orbs"],"chapter5Completed":final["chapter5"]["completed"]}
      (OUT/(name+"-chapter5-natural-save.json")).write_text(json.dumps(final,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
      report["cases"].append(case)
      context.close()
    assert not report["page_errors"],report["page_errors"]
    browser.close()
    print("REAL_CHAPTER5_PASS",json.dumps(report,ensure_ascii=False))
finally:
  (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
  server.shutdown()
