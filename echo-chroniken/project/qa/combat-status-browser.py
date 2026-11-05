"""Desktop/mobile browser smoke: status effects through actual battle attack selection."""
import functools,http.server,json,pathlib,threading,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/combat-status"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--mute-audio"])
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page();errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   try:
    # Deterministic proc chances; production still uses ordinary random rolls.
    page.add_init_script("Math.random=()=>0.001;")
    page.goto(f"http://127.0.0.1:{server.server_port}/")
    page.wait_for_function("typeof window.echoBattleLab==='object' && typeof window.echoQASnapshot==='function'")
    def snap():return page.evaluate("window.echoQASnapshot()")
    def choose_attack(id):
     options=page.evaluate("window.echoQACombatOptions()")
     if not options:print('DEBUG_SNAPSHOT',who,id,json.dumps(snap(),ensure_ascii=False)[:1200],flush=True)
     index=next((o["index"] for o in options if o["id"]==id),None)
     assert index is not None,(who,id,options)
     def click(x,y):
      loc=page.locator("#screen")
      bb=loc.bounding_box();width=loc.evaluate("e=>e.width");height=loc.evaluate("e=>e.height")
      px=x/width*bb["width"];py=y/height*bb["height"]
      if mobile:loc.tap(position={"x":px,"y":py})
      else:page.mouse.click(bb["x"]+px,bb["y"]+py)
     click(181,135)
     assert snap()["mode"]=="ATTACKS",(who,id,snap()["mode"])
     click(175,54+index*18)
     page.wait_for_function("window.echoQASnapshot().mode==='BATTLE'")
    # Natural healing move should set regeneration, not heal above max HP.
    page.evaluate("window.echoBattleLab.start(19,23)")
    choose_attack("waldsegen")
    page.wait_for_function("window.echoQASnapshot().battle?.allyStatus?.includes('REGEN')")
    regen=snap()
    assert "REGEN" in regen["battle"]["allyStatus"],regen
    assert "NACHKLANG" in regen["battle"]["log"],regen
    page.screenshot(path=str(OUT/(who+"-regeneration.png")))
    # Late fire attack inflicts burn, visible beside the enemy HP bar.
    page.evaluate("window.echoBattleLab.start(53,66)")
    choose_attack("feuerwirbel")
    page.wait_for_function("window.echoQASnapshot().battle?.enemyStatus?.includes('BRAND')")
    fire=snap()
    assert "BRAND" in fire["battle"]["enemyStatus"],fire
    assert "BRAND" in fire["battle"]["log"],fire
    page.screenshot(path=str(OUT/(who+"-burn.png")))
    assert not errors,errors
    report["cases"].append({"viewport":who,"regen":True,"burn":True,"pageErrors":errors})
    print("STATUS_BROWSER_PASS",who,flush=True)
   except Exception:
    report["errors"].append({"viewport":who,"trace":traceback.format_exc(),"pageErrors":errors})
    print("STATUS_BROWSER_FAIL",who,traceback.format_exc().splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 server.shutdown()
 (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if report["errors"]:sys.exit(1)
