"""Actual desktop/touch RuneBook input, passive equipment persistence, screenshots.
The old v2 fixture deliberately has no supportRuneUnlocked field: migration must unlock
the EP rune from the existing gym badge. Uses isolated browser localStorage only.
"""
import functools,http.server,pathlib,threading,json,traceback,sys,copy
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/ep-divider"
OUT.mkdir(parents=True,exist_ok=True)
fixture=json.loads((ROOT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
other=copy.deepcopy(fixture["team"][0])
other.update({"uid":"qa-hasengeist","id":5,"lv":9,"xp":0,"nextXp":162,"hp":70,"maxHp":70,"moves":[]})
fixture["team"].append(other)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for touch in (False,True):
   who="touch" if touch else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if touch else {"width":1280,"height":800},
       has_touch=touch,is_mobile=touch)
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   payload=json.dumps(fixture,ensure_ascii=False)
   ctx.add_init_script("if(!localStorage.getItem('echo_chroniken_tv_save'))localStorage.setItem('echo_chroniken_tv_save',"+json.dumps(payload,ensure_ascii=False)+");")
   case={"view":who,"screens":[]}
   def cmd(k):page.evaluate("(k)=>window.tvControllerInput(k)",k)
   def snap():return page.evaluate("window.echoQASnapshot()")
   def saved():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   def shot(name):
    filename=who+"-"+name+".png"
    page.screenshot(path=str(OUT/filename),full_page=False)
    case["screens"].append(filename)
   def tap(x,y):
    box=page.locator("#screen").bounding_box()
    w=page.locator("#screen").evaluate("e=>e.width")
    h=page.locator("#screen").evaluate("e=>e.height")
    page.mouse.click(box["x"]+x/w*box["width"],box["y"]+y/h*box["height"])
   try:
    page.goto(f"http://127.0.0.1:{server.server_port}/?touch="+("1" if touch else "0"),wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    print('BOOT',who,snap()['mode'],snap()['scene'],flush=True)
    if snap()['mode'] in ('TITLE','DIALOG'):cmd('A')
    assert snap()["mode"]=="OVERWORLD"
    cmd("START")
    for _ in range(3):cmd("DOWN")
    cmd("A")
    assert snap()["mode"]=="RUNEBOOK"
    shot("ep-rune-unlocked")
    original=snap()["team"][0]["moves"].copy()
    if touch:tap(55,60)
    else:cmd("A")
    assert snap()["mode"]=="DIALOG"
    cmd("A")
    assert snap()["mode"]=="RUNEBOOK"
    first=saved()
    assert first["team"][0]["heldSupportRune"]=="ep_teiler",first["team"]
    assert first["supportRuneUnlocked"] is True
    assert first["team"][0]["equippedMoves"]==original
    if touch:tap(250,30)
    else:cmd("RIGHT")
    assert snap()["mode"]=="RUNEBOOK"
    if touch:tap(55,60)
    else:cmd("A")
    assert snap()["mode"]=="DIALOG"
    cmd("A")
    second=saved()
    assert second["team"][0].get("heldSupportRune") is None
    assert second["team"][1]["heldSupportRune"]=="ep_teiler"
    shot("ep-rune-transferred")
    cmd("B");cmd("B")
    assert snap()["mode"]=="OVERWORLD"
    page.reload(wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    final=saved()
    assert final["team"][1]["heldSupportRune"]=="ep_teiler"
    assert len(final["team"][1]["equippedMoves"])<=4
    assert not errors,errors
    case["success"]=True
    case["runeHolder"]=final["team"][1]["id"]
    report["cases"].append(case)
    print("EP_RUNE_BROWSER_PASS",who,case["screens"],flush=True)
   except Exception:
    report["errors"].append({"view":who,"trace":traceback.format_exc()})
    print("EP_RUNE_BROWSER_FAIL",who,report["errors"][-1]["trace"].splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 server.shutdown()
 (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if report["errors"]:sys.exit(1)
