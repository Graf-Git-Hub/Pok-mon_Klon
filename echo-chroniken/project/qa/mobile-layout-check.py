"""Regression for portrait mobile controls: game canvas stays between toolbar and pad."""
import functools,http.server,json,pathlib,threading
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/mobile-layout"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={"screens":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for w,h in [(360,640),(390,844),(412,915)]:
   context=browser.new_context(viewport={"width":w,"height":h},is_mobile=True,has_touch=True,device_scale_factor=1)
   page=context.new_page()
   page.on("pageerror",lambda e:report["errors"].append(str(e)))
   page.goto(f"http://127.0.0.1:{server.server_port}/?touch=1")
   page.wait_for_function("typeof window.echoQASnapshot === 'function'")
   boxes={k:page.locator(k).bounding_box() for k in
      ("canvas","#touch-toolbar","#touch-hint","#touch-dpad","#touch-actions")}
   game=boxes["canvas"];bar=boxes["#touch-toolbar"];hint=boxes["#touch-hint"];dpad=boxes["#touch-dpad"];actions=boxes["#touch-actions"]
   buttons=page.locator("#touch-toolbar .touch-tool").evaluate_all(
      "(nodes)=>nodes.map(n=>n.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0).map(r=>({x:r.x,y:r.y,right:r.right}))")
   assert len(buttons)==6,(w,h,"toolbar count",buttons)
   assert all(b["x"]>=-0.5 and b["right"]<=w+0.5 for b in buttons),(w,h,"offscreen toolbar",buttons)
   if w<=390:
    assert len({round(b["y"]) for b in buttons})==2,(w,h,"toolbar should wrap",buttons)
   assert game["y"]>bar["y"]+bar["height"]+10,(w,h,"top toolbar overlap",boxes)
   assert game["y"]+game["height"]+15<=hint["y"]+4,(w,h,"hint overlap",boxes)
   bottom=min(dpad["y"],actions["y"])
   assert hint["y"]+hint["height"]+15<bottom,(w,h,"controls overlap",boxes)
   assert game["x"]>=-1 and game["x"]+game["width"]<=w+1,(w,h,"canvas clipped")
   filename=f"{w}x{h}-touch.png"
   page.screenshot(path=str(OUT/filename),full_page=True)
   report["screens"].append({"viewport":f"{w}x{h}","gameTop":round(game["y"]),
     "gameBottom":round(game["y"]+game["height"]),"controlsTop":round(bottom),"screenshot":filename})
   context.close()
  context=browser.new_context(viewport={"width":1280,"height":800},has_touch=False)
  page=context.new_page();page.goto(f"http://127.0.0.1:{server.server_port}/")
  assert page.locator("#touch-controls").evaluate("(e)=>getComputedStyle(e).display")=="none"
  context.close()
  assert not report["errors"],report["errors"]
  browser.close()
  print("MOBILE_LAYOUT_PASS",json.dumps(report,ensure_ascii=False))
finally:
 (OUT/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 server.shutdown()
