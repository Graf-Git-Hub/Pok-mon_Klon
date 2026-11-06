"""Real Chrome desktop/touch QA for 1-slot backpack and zero-turn healing inventory.
No existing player saves are touched. The checked old v2 fixture is copied into
an isolated browser profile to verify gear migration, UI, and reload.
"""
import functools,http.server,pathlib,threading,json,copy,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/auto-equipment"
OUT.mkdir(parents=True,exist_ok=True)
save=json.loads((ROOT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
report={"scope":"old v2 save, equipment menu, touch and desktop bag with potion, reload","cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},
       has_touch=mobile,is_mobile=mobile)
   initial=json.dumps(copy.deepcopy(save),ensure_ascii=False)
   ctx.add_init_script("if(!localStorage.getItem('echo_chroniken_tv_save'))localStorage.setItem('echo_chroniken_tv_save',"+json.dumps(initial,ensure_ascii=False)+");")
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   case={"view":who,"screens":[]}
   def cmd(k):page.evaluate("(k)=>window.tvControllerInput(k)",k)
   def snap():return page.evaluate("window.echoQASnapshot()")
   def saved():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
   def shot(label):
    filename=who+"-"+label+".png"
    page.screenshot(path=str(OUT/filename),full_page=False)
    case["screens"].append(filename)
   def tap(x,y):
    r=page.locator("#screen").bounding_box()
    w=page.locator("#screen").evaluate("e=>e.width")
    h=page.locator("#screen").evaluate("e=>e.height")
    page.mouse.click(r["x"]+x/w*r["width"],r["y"]+y/h*r["height"])
   try:
    page.goto(f"http://127.0.0.1:{srv.server_port}/?touch="+("1" if mobile else "0"),wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    if snap()["mode"]=="TITLE":cmd("A")
    assert snap()["mode"]=="OVERWORLD",snap()
    cmd("START")
    assert snap()["mode"]=="MENU"
    for _ in range(4):cmd("DOWN")
    cmd("A")
    assert snap()["mode"]=="RUNEBOOK"
    if mobile:tap(280,17)
    else:cmd("R")
    assert snap()["mode"]=="AUSRUESTUNG",snap()
    shot("first-gear-menu")
    if mobile:tap(70,141)
    else:
     for _ in range(4):cmd("DOWN")
     cmd("A")
    assert snap()["mode"]=="DIALOG"
    cmd("A")
    assert snap()["mode"]=="AUSRUESTUNG"
    assert saved()["team"][0]["equipment"][0]["id"]=="rucksack"
    if mobile:tap(70,69)
    else:
     for _ in range(4):cmd("UP")
     cmd("A")
    assert snap()["mode"]=="DIALOG"
    cmd("A")
    assert snap()["mode"]=="AUSRUESTUNG"
    state=saved()
    assert state["potions"]==save["potions"]-1
    assert state["team"][0]["equipment"][0]["contents"]==["heiltrank"],state["team"][0]
    assert state["gearStock"]["rucksack"]==0
    shot("potion-in-backpack")
    for _ in range(3):cmd("B")
    assert snap()["mode"]=="OVERWORLD"
    page.reload(wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    after=saved()
    assert after["team"][0]["equipment"][0]["contents"]==["heiltrank"]
    assert after["potions"]==save["potions"]-1
    assert not errors,errors
    case["success"]=True
    case["equipment"]=after["team"][0]["equipment"]
    report["cases"].append(case)
    print("AUTO_EQUIPMENT_BROWSER_PASS",who,flush=True)
   except Exception:
    report["errors"].append({"view":who,"trace":traceback.format_exc()})
    print("AUTO_EQUIPMENT_BROWSER_FAIL",who,report["errors"][-1]["trace"].splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 srv.shutdown()
 (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if report["errors"]:sys.exit(1)
