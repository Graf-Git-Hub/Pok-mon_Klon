"""Verify actual SOULS Editor v3.46 + imported Echo 60-map preset + game pilot.
Real Chromium desktop and phone. Screenshots from real browser, not AI art.
"""
from pathlib import Path
import http.server,functools,threading,json,sys,traceback
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
REPO=ROOT.parent
ART=REPO/"docs"/"visual-audit"/"souls-bridge"
ART.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),
 functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
result={"cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for mobile in (False,True):
   who="phone" if mobile else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1260,"height":835},
     device_scale_factor=1,is_mobile=mobile,has_touch=mobile)
   page=ctx.new_page()
   errors=[]
   page.on("pageerror",lambda e:errors.append(str(e)))
   try:
    uri=(REPO/"docs"/"souls-editor"/"EchoChroniken_Kartenwerkstatt.html").as_uri()
    page.goto(uri,wait_until="load",timeout=120000)
    page.wait_for_function("typeof maps!=='undefined'&&Object.keys(maps).length===60",timeout=120000)
    maps=page.evaluate("({count:Object.keys(maps).length,active:activeMapId,w:W,h:H,hasLegacy:!!maps.legacy_wurzeldorf,found:maps.legacy_wurzeldorf.ground[21][15]})")
    assert maps["count"]==60,maps
    assert maps["active"]=="legacy_wurzeldorf",maps
    assert maps["found"]=="path",maps
    page.screenshot(path=str(ART/(who+"-real-souls-editor.png")),full_page=False)
    # In its own browser tab, validate that the exact pilot data is loaded in Echo.
    game=ctx.new_page();gameErrors=[]
    game.on("pageerror",lambda e:gameErrors.append(str(e)))
    game.goto("http://127.0.0.1:%d/"%server.server_port,wait_until="load")
    game.wait_for_function("typeof window.EchoSOULS!=='undefined'")
    game.wait_for_function("window.EchoVillage?.map?.length===28")
    changes=game.evaluate("""() => ({
      after:window.EchoVillage.map[21][15],
      after2:window.EchoVillage.map[22][15],
      wild:window.EchoVillage.map[23][13],
      applied:[...window.EchoSOULS.applied],
      props:window.EchoSoulsEditedData.regions.legacy_wurzeldorf.props.length,
      registered:window.EchoMaps.get('legacy_wurzeldorf').tiles[21][15]
    })""")
    assert changes["after"]==3 and changes["registered"]==3,changes
    assert changes["after2"]==3 and changes["wild"]==2,changes
    assert changes["props"]==2,changes
    assert not errors and not gameErrors,(errors,gameErrors)
    result["cases"].append({"viewport":who,"souls":maps,"echo":changes,"success":True})
    print("SOULS_ECHO_REAL_BROWSER_PASS",who,maps["count"],"maps",flush=True)
   except Exception:
    result["errors"].append({"viewport":who,"trace":traceback.format_exc(),"console":errors})
    print("SOULS_ECHO_BROWSER_FAIL",who,result["errors"][-1]["trace"].splitlines()[-1],flush=True)
   finally:
    ctx.close()
  browser.close()
finally:
 server.shutdown()
 (ART/"report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
if result["errors"]:sys.exit(1)
