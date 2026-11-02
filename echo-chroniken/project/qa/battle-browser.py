"""Real Chrome 156 keyboard/touch fight screenshots and enemy-turn QA."""
import functools
import http.server
import json
import pathlib
import threading
from playwright.sync_api import sync_playwright

project=pathlib.Path(__file__).resolve().parent.parent
out=project.parent/"docs/visual-audit/battle-balance"
out.mkdir(parents=True,exist_ok=True)
fixture=json.loads((project/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
fixture.update(scene="OVERWORLD",currentMapId="legacy_wurzeldorf",
               safeSpawnId="legacy_current_position",introStage=4,hasStarter=True,
               badges=0,gymDefeated=[False,False,False],
               player={"x":16,"y":10,"dir":"up","stepPhase":0})
base=fixture["team"][0]
fixture["team"]=[dict(base,lv=9,xp=0,nextXp=162,hp=base["maxHp"],moves=["seelenstups","lichtfunke"])]
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(project)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"browser":None,"checks":[],"errors":[]}
try:
 with sync_playwright() as playwright:
  browser=playwright.chromium.launch(channel="chrome",headless=True)
  report["browser"]=browser.version
  for mobile in (False,True):
   context=browser.new_context(viewport={"width":412,"height":915} if mobile else
                               {"width":1280,"height":800},is_mobile=mobile,has_touch=mobile)
   page=context.new_page()
   page.on("pageerror",lambda error:report["errors"].append(str(error)))
   page.add_init_script("if(!sessionStorage.getItem('qa-seeded')){"+
       "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+json.dumps(fixture)+"));"+
       "sessionStorage.setItem('qa-seeded','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
   page.wait_for_function("typeof window.echoQASnapshot==='function'")
   def press():
    if mobile:page.locator('[data-cmd="A"]').tap()
    else:page.keyboard.press("Enter")
   press() # Title: continue
   page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
   snap=page.evaluate("window.echoQASnapshot()")
   assert (snap["player"]["x"],snap["player"]["y"])==(16,10),snap
   press() # Gym leader ahead
   page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
   case="mobile" if mobile else "desktop"
   page.screenshot(path=str(out/(case+"-battle.png")),full_page=True)
   press() # Attack menu
   page.wait_for_function("window.echoQASnapshot().mode==='ATTACKS'")
   press() # Use first attack, enemy counters
   page.wait_for_function("window.echoQASnapshot().mode==='BATTLE' && !window.echoQASnapshot().battle.busy",timeout=10000)
   snap=page.evaluate("window.echoQASnapshot()")
   assert snap["team"][0]["hp"]>0
   assert snap["battle"]["enemy"] in (16,29)
   page.screenshot(path=str(out/(case+"-after-turn.png")),full_page=True)
   report["checks"].append({"viewport":case,"trainerBattle":True,"attackAndCounter":True,
                            "remainingHp":snap["team"][0]["hp"],"battleMonster":snap["battle"]["enemy"]})
   context.close()
  assert not report["errors"],report["errors"]
  browser.close()
 (out/"browser-report.json").write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
 print("BATTLE_CHROME_PASS",json.dumps(report))
finally:
 server.shutdown()
