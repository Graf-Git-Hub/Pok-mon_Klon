"""Actual inventory earned through Chapters 1-4; teach runes on desktop and touch.
No synthetic rune rewards: source files are outputs of natural-opening.py --both.
The test opens its own temporary browser and never modifies the saved source files.
"""
import functools,http.server,pathlib,threading,json,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/dual-type"
IN=ROOT.parent/"docs/visual-audit/natural-opening"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"scope":"Learn actual runes earned in natural chapters 1-4 through travel menu; save/reload; desktop/touch", "cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   file=IN/(who+"-chapter4-natural-save.json")
   assert file.exists(),f"Please run natural-opening.py --both --seeded first; missing {file}"
   natural=json.loads(file.read_text(encoding="utf-8"))
   assert natural["chapter4"]["completed"]
   assert natural["runes"].get("kohlenregen",0)>=1
   assert natural["runes"].get("quellschwall",0)>=1
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},
                           has_touch=mobile,is_mobile=mobile)
   payload=json.dumps(natural,ensure_ascii=False)
   ctx.add_init_script("if(!localStorage.getItem('echo_chroniken_tv_save'))localStorage.setItem('echo_chroniken_tv_save',"+json.dumps(payload,ensure_ascii=False)+");")
   page=ctx.new_page()
   page_errors=[]
   page.on("pageerror",lambda e:page_errors.append(str(e)))
   case={"viewport":who,"before":{"team":natural["team"],"runes":natural["runes"]},"screens":[]}
   try:
    page.goto(f"http://127.0.0.1:{server.server_port}/?touch="+("1" if mobile else "0"),wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    def cmd(key):page.evaluate("(key)=>window.tvControllerInput(key)",key)
    def saved():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
    def shot(label):
     name=who+"-rune-"+label+".png"
     page.screenshot(path=str(OUT/name),full_page=False)
     case["screens"].append(name)
    def canvas(x,y):
     r=page.locator("#screen").bounding_box()
     cw=page.locator("#screen").evaluate("e=>e.width")
     ch=page.locator("#screen").evaluate("e=>e.height")
     page.mouse.click(r["x"]+x/cw*r["width"],r["y"]+y/ch*r["height"])
    cmd("A")
    assert page.evaluate("window.echoQASnapshot().mode")=="OVERWORLD"
    cmd("START");assert page.evaluate("window.echoQASnapshot().mode")=="MENU"
    for n in range(3):cmd("DOWN")
    cmd("A");assert page.evaluate("window.echoQASnapshot().mode")=="RUNEBOOK"
    cmd("B");assert page.evaluate("window.echoQASnapshot().mode")=="MENU"
    cmd("A");assert page.evaluate("window.echoQASnapshot().mode")=="RUNEBOOK"
    shot("inventory")
    initialMoves=saved()["team"][0]["moves"]
    canvas(65,76)
    assert page.evaluate("window.echoQASnapshot().mode")=="DIALOG"
    cmd("A")
    assert page.evaluate("window.echoQASnapshot().mode")=="RUNEBOOK"
    after=saved()
    assert after["runes"]["kohlenregen"]==natural["runes"]["kohlenregen"]-1
    assert "kohlenregen" in after["team"][0]["moves"]
    # Learn 2nd rune using same interface; permanent learned book, prepared only 4.
    canvas(60,76)
    assert page.evaluate("window.echoQASnapshot().mode")=="DIALOG"
    cmd("A")
    assert page.evaluate("window.echoQASnapshot().mode")=="RUNEBOOK"
    after=saved()
    assert "quellschwall" in after["team"][0]["moves"]
    assert len(after["team"][0]["runeMoves"])==2
    assert len(after["team"][0]["equippedMoves"])<=4
    assert len(after["team"][0]["moves"])>=len(initialMoves)+2
    assert sum(after["runes"].values())==sum(natural["runes"].values())-2
    shot("both-learned")
    cmd("B");assert page.evaluate("window.echoQASnapshot().mode")=="MENU"
    cmd("B");assert page.evaluate("window.echoQASnapshot().mode")=="OVERWORLD"
    cmd("MOVES");assert page.evaluate("window.echoQASnapshot().mode")=="ATTACKS"
    shot("permanent-moves")
    cmd("B")
    # Reload must not delete runes, learned book or equipped move set.
    page.reload(wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    final=saved()
    assert final["team"][0]["runeMoves"]==after["team"][0]["runeMoves"]
    assert final["team"][0]["moves"]==after["team"][0]["moves"]
    assert final["team"][0]["equippedMoves"]==after["team"][0]["equippedMoves"]
    assert final["runes"]==after["runes"]
    assert not page_errors,page_errors
    case["learned"]=final["team"][0]["runeMoves"]
    case["knownMoves"]=len(final["team"][0]["moves"])
    case["equippedMoves"]=len(final["team"][0]["equippedMoves"])
    case["success"]=True
    report["cases"].append(case)
    print("RUNE_BROWSER_PASS",who,case["learned"],case["knownMoves"],flush=True)
   except Exception:
    report["errors"].append({"view":who,"trace":traceback.format_exc()})
    print("RUNE_BROWSER_ERROR",who,report["errors"][-1]["trace"].splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 server.shutdown()
 (OUT/"rune-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if report["errors"]:sys.exit(1)
