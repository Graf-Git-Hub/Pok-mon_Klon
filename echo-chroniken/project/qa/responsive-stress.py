"""Probe compact portrait + landscape touch viewports and real menu tapping."""
import functools,http.server,json,pathlib,threading,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/stress-testing"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
results=[];errors=[]
dims=[(320,480),(320,568),(360,640),(375,667),(390,844),(412,915),(480,320),(640,360),(800,360),(854,480),(1024,600)]
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for w,h in dims:
   browserctx=browser.new_context(viewport={"width":w,"height":h},has_touch=True,is_mobile=True,device_scale_factor=1)
   page=browserctx.new_page()
   problems=[]
   page.on("pageerror",lambda e:problems.append(str(e)))
   try:
    page.goto(f"http://127.0.0.1:{server.server_port}/?touch=1",wait_until="load")
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    report=page.evaluate("""() => {
      const names=['canvas','#touch-toolbar','#touch-dpad','#touch-actions','#touch-hint'],
        b={};
      for(const n of names){const r=document.querySelector(n).getBoundingClientRect();
        b[n]={x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};}
      const buttons=[...document.querySelectorAll('#touch-controls button[data-cmd]')].filter(n=>getComputedStyle(n).display!=='none').map(n=>{
        const r=n.getBoundingClientRect(); return {cmd:n.dataset.cmd,x:r.x,y:r.y,right:r.right,bottom:r.bottom};});
      return {b,buttons,viewport:{w:innerWidth,h:innerHeight},
        scroll:{width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight}};
    }""")
    b=report["b"];canvas=b["canvas"]
    box=lambda name:b[name]
    overlap=lambda a,c:max(0,min(a["right"],c["right"])-max(a["x"],c["x"]))*max(0,min(a["bottom"],c["bottom"])-max(a["y"],c["y"]))
    for n in ("#touch-toolbar","#touch-dpad","#touch-actions"):
     if overlap(canvas,box(n))>0:problems.append(f"canvas overlaps {n} by {int(overlap(canvas,box(n)))} px²")
    if canvas["width"]<140:problems.append("game canvas too small (<140px)")
    for a in report["buttons"]:
     if a["x"]<-1 or a["right"]>w+1 or a["y"]<-1 or a["bottom"]>h+1:
      problems.append(f"{a['cmd']} button offscreen")
    # Exercise start and menu through actual visible buttons.
    page.locator('[data-cmd="A"]').tap()
    mode=page.evaluate("window.echoQASnapshot().mode")
    if mode not in ("HOUSE","DIALOG","OVERWORLD"):problems.append("Start button did not enter game")
    page.locator('[data-cmd="START"]').tap(force=True)
    menu=page.evaluate("window.echoQASnapshot().mode")
    if menu!="MENU":problems.append(f"menu tap failed: {menu}")
    page.locator('[data-cmd="B"]').tap(force=True)
    if page.evaluate("window.echoQASnapshot().mode")=="MENU":problems.append("B did not close menu")
    if (w,h)==(412,915):
     # Live rotation, not a fresh load: controls must reflow without losing
     # the game state or covering the canvas.
     original=page.evaluate("window.echoQASnapshot().introStage")
     page.set_viewport_size({"width":915,"height":412})
     page.wait_for_timeout(100)
     collision=page.evaluate("""() => {
       const r=n=>document.querySelector(n).getBoundingClientRect(),game=r('canvas');
       return ['#touch-toolbar','#touch-dpad','#touch-actions'].filter(n=>{
         const b=r(n);return Math.min(game.right,b.right)>Math.max(game.left,b.left)
           &&Math.min(game.bottom,b.bottom)>Math.max(game.top,b.top);
       });
     }""")
     if collision:problems.append("landscape rotation overlaps "+str(collision))
     page.set_viewport_size({"width":412,"height":915})
     page.wait_for_timeout(100)
     if page.evaluate("window.echoQASnapshot().introStage")!=original:
      problems.append("game state changed during orientation rotation")
    fn=f"{w}x{h}.png"
    page.screenshot(path=str(OUT/fn),full_page=True)
    results.append({"size":f"{w}x{h}","problems":problems,"canvas":canvas,"scroll":report["scroll"],"menu":menu,"screen":fn})
    print("STRESS_SCREEN",w,h,"OK" if not problems else "FAIL",problems,flush=True)
   except Exception as e:
    errors.append({"size":f"{w}x{h}","error":repr(e),"trace":traceback.format_exc()})
    print("STRESS_SCREEN_ERROR",w,h,str(e),flush=True)
   finally:browserctx.close()
  browser.close()
finally:
 server.shutdown()
 (OUT/"responsive-report.json").write_text(json.dumps({"cases":results,"errors":errors},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
if errors:sys.exit(2)
if any(x["problems"] for x in results):sys.exit(1)
