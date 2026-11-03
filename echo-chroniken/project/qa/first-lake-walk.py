"""Real input smoke: village -> lake -> village with keyboard/touch and save reload."""
import copy, functools, http.server, json, pathlib, threading
from playwright.sync_api import sync_playwright

ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/cloud-walk"
OUT.mkdir(parents=True,exist_ok=True)
base=json.loads((ROOT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),
    functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"checks":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  report["browser"]=browser.version
  for mobile,unlocked in ((False,False),(False,True),(True,True)):
   case=("touch" if mobile else "desktop")+("-unlocked" if unlocked else "-locked")
   save=copy.deepcopy(base)
   save.update(scene="OVERWORLD",currentMapId="legacy_wurzeldorf",
      safeSpawnId="legacy_current_position",hasStarter=True,introStage=4,
      player={"x":24,"y":10,"dir":"up","stepPhase":0},
      ruinsProgress={"bossWon":unlocked})
   context=browser.new_context(viewport={"width":412,"height":915} if mobile
      else {"width":1280,"height":800},is_mobile=mobile,has_touch=mobile)
   page=context.new_page()
   page.on("pageerror",lambda err:report["errors"].append(str(err)))
   context.add_init_script("if(!sessionStorage.getItem('walk-seeded')){"+
       "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+
       json.dumps(save)+"));sessionStorage.setItem('walk-seeded','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
   page.wait_for_function("typeof window.echoQASnapshot==='function'")
   def a():
    if mobile:page.locator('[data-cmd="A"]').tap()
    else:page.keyboard.press("Enter")
   def direction(value):
    if mobile:page.locator('[data-cmd="'+value+'"]').tap()
    else:page.keyboard.press({"UP":"ArrowUp","LEFT":"ArrowLeft"}[value])
   def snap():return page.evaluate("window.echoQASnapshot()")
   a()
   page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
   assert snap()["mapId"]=="legacy_wurzeldorf",(case,snap())
   direction("UP")
   if not unlocked:
    assert snap()["mapId"]=="legacy_wurzeldorf","Unfinished ruins must block lake gate"
    page.screenshot(path=str(OUT/"desktop-locked-gate.png"),full_page=True)
    report["checks"].append({"case":case,"gateBlocked":True})
   else:
    page.wait_for_function("window.echoQASnapshot().mapId==='lake_north_path'")
    page.screenshot(path=str(OUT/(case+"-lake.png")),full_page=True)
    assert snap()["mode"]=="DIALOG",(case,snap())
    a()
    page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
    # The real portal persisted both map ID and safe spawn.
    saved=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
    assert saved["currentMapId"]=="lake_north_path",(case,saved["currentMapId"])
    page.reload()
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    a()
    page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
    assert snap()["mapId"]=="lake_north_path",(case,snap())
    direction("LEFT")
    page.wait_for_function("window.echoQASnapshot().mapId==='legacy_wurzeldorf'")
    a()
    page.wait_for_function("window.echoQASnapshot().mode==='OVERWORLD'")
    assert (snap()["player"]["x"],snap()["player"]["y"])==(24,10),(case,snap())
    page.screenshot(path=str(OUT/(case+"-return.png")),full_page=True)
    report["checks"].append({"case":case,"enteredLake":True,"reloaded":True,
      "returnedToVillage":True})
   context.close()
  assert not report["errors"],report["errors"]
  browser.close()
 (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("CLOUD_WALK_PASS",json.dumps(report,ensure_ascii=False))
finally:
 server.shutdown()
