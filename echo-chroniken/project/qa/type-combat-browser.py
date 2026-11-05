"""Browser/UI regression: dual-element icons, four prepared moves, team choice."""
import functools,http.server,pathlib,threading,json,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/dual-type"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
report={"cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},
        has_touch=mobile,is_mobile=mobile)
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda x:errors.append(str(x)))
   case={"view":who,"screens":[],"pageErrors":errors}
   try:
    page.goto(f"http://127.0.0.1:{srv.server_port}/?touch="+("1" if mobile else "0"),wait_until="load")
    page.wait_for_function("typeof window.echoBattleLab==='object'")
    page.evaluate("window.echoBattleLab.start(123,23,65)")
    assert page.evaluate("window.echoQASnapshot().mode")=="BATTLE"
    snap=page.evaluate("window.echoQASnapshot()")
    assert [x["id"] for x in snap["team"]]==[123,65],(who,snap)
    assert snap["team"][0]["types"]==["ERDE","NATUR"],snap
    def shot(label):
     file=who+"-"+label+".png"
     page.screenshot(path=str(OUT/file),full_page=False)
     case["screens"].append(file)
    def canvas(x,y):
     r=page.locator("#screen").bounding_box()
     w=page.locator("#screen").evaluate("(e)=>e.width")
     h=page.locator("#screen").evaluate("(e)=>e.height")
     page.mouse.click(r["x"]+x/w*r["width"],r["y"]+y/h*r["height"])
    shot("battle-types")
    canvas(183,134)
    assert page.evaluate("window.echoQASnapshot().mode")=="ATTACKS"
    reportData=page.evaluate("window.echoQASnapshot().team[0]")
    assert len(reportData["moves"])<=4,reportData
    shot("four-attacks")
    page.evaluate("window.tvControllerInput('B')")
    assert page.evaluate("window.echoQASnapshot().mode")=="BATTLE"
    canvas(266,134)
    assert page.evaluate("window.echoQASnapshot().mode")=="TEAM_SELECT"
    shot("team-selection")
    canvas(80,73)
    page.wait_for_function("window.echoQASnapshot().team[0].id===65")
    assert page.evaluate("window.echoQASnapshot().mode")=="BATTLE"
    case["switchedTo"]=65
    # Also inspect the element icon configuration directly from loaded runtime.
    icons=page.evaluate("window.EchoTypes.typesFor({id:123})")
    assert icons==["ERDE","NATUR"],icons
    assert errors==[],errors
    print("TYPE_BROWSER_PASS",who,case["screens"],flush=True)
    report["cases"].append(case)
   except Exception:
    report["errors"].append({"view":who,"trace":traceback.format_exc()})
    print("TYPE_BROWSER_ERROR",who,report["errors"][-1]["trace"].splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 srv.shutdown()
 (OUT/"ui-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if report["errors"]:sys.exit(1)
