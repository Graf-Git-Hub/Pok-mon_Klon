"""Chrome visual audit for renamed creature labels on PC and a real touch viewport."""
import functools
import http.server
import json
import pathlib
import threading
from playwright.sync_api import sync_playwright

project=pathlib.Path(__file__).resolve().parent.parent
out=project.parent/"docs/visual-audit/monster-naming"
out.mkdir(parents=True,exist_ok=True)
fixture=json.loads((project/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
manifest=json.loads((project.parent/"docs/game-design/MONSTER_NAME_REVIEW.json").read_text(encoding="utf-8"))
reviewed={r["id"]:r["newName"] for r in manifest["reviewed"]}
cases=[("starter-area",4,False),("mid-region",70,False),("postgame-mobile",150,True)]
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(project)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"browser":"","checks":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  report["browser"]=browser.version
  for label,species_id,mobile in cases:
   save=dict(fixture)
   save.update(scene="OVERWORLD",introStage=4,hasStarter=True,
               lexiconCursor=species_id,seenIds={str(species_id):True})
   context=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},has_touch=mobile,is_mobile=mobile)
   page=context.new_page()
   page.on("pageerror",lambda error:report["errors"].append(str(error)))
   page.add_init_script("if(!sessionStorage.getItem('qa-seeded')){"+
     "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("+json.dumps(save)+"));"+
     "sessionStorage.setItem('qa-seeded','1');}")
   page.goto(f"http://127.0.0.1:{server.server_port}/"+("?touch" if mobile else ""))
   try:
    page.wait_for_function("typeof window.echoQASnapshot==='function'",timeout=8000)
   except Exception:
    print("STARTUP DIAGNOSTIC",label,report["errors"],page.url,page.title(),flush=True)
    raise
   if mobile:
    page.locator('[data-cmd="A"]').tap()
    page.locator('[data-cmd="START"]').tap()
    page.locator('[data-cmd="A"]').tap()
   else:
    page.keyboard.press("Enter")
    page.keyboard.press("m")
    page.keyboard.press("Enter")
   page.wait_for_function("window.echoQASnapshot().mode==='LEXICON'")
   name=page.evaluate("(id)=>window.ECHO_SPECIES[id-1].name",species_id)
   assert name==reviewed[species_id],(species_id,name)
   page.screenshot(path=str(out/(label+".png")),full_page=True)
   report["checks"].append({"id":species_id,"name":name,"mobile":mobile})
   context.close()
  assert not report["errors"],report["errors"]
  browser.close()
 (out/"lexicon-report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 print("LEXICON_BROWSER_PASS",json.dumps(report,ensure_ascii=False))
finally:
 server.shutdown()
