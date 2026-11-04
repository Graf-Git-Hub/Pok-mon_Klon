"""Simulate Switch-standard Gamepad API buttons in a real Chrome browser."""
import functools,http.server,pathlib,threading,json,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/stress-testing"
OUT.mkdir(parents=True,exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
result={"tests":[],"pageErrors":[],"scope":"Browser Gamepad API emulation: Switch A=1, B=0, Plus=9, Dpad=12-15. Not physical hardware."}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  context=browser.new_context(viewport={"width":1280,"height":720},has_touch=False)
  context.add_init_script("""(function(){
    window.fakePad={connected:true,id:'QA Switch-compatible controller',
     axes:[0,0,0,0],buttons:Array.from({length:18},()=>({pressed:false,value:0}))};
    Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[window.fakePad]});
  })();""")
  page=context.new_page()
  page.on("pageerror",lambda e:result["pageErrors"].append(str(e)))
  page.goto(f"http://127.0.0.1:{srv.server_port}/")
  page.wait_for_function("typeof window.echoQASnapshot==='function'")
  def snap():return page.evaluate("window.echoQASnapshot()")
  def pulse(button):
   page.evaluate("(i)=>window.fakePad.buttons[i].pressed=true",button)
   page.wait_for_timeout(190)
   page.evaluate("(i)=>window.fakePad.buttons[i].pressed=false",button)
   page.wait_for_timeout(40)
  assert snap()["mode"]=="TITLE"
  pulse(1)
  assert snap()["mode"]=="OVERWORLD" and snap()["scene"]=="HOUSE",(snap(),"Switch A didn't start")
  result["tests"].append("Switch A starts from title")
  pulse(9)
  assert snap()["mode"]=="MENU",(snap(),"Plus didn't open menu")
  result["tests"].append("Switch Plus opens menu")
  pulse(0)
  assert snap()["mode"]=="OVERWORLD",(snap(),"Switch B didn't close menu")
  result["tests"].append("Switch B closes menu")
  start=(snap()["player"]["x"],snap()["player"]["y"])
  pulse(13)
  next=(snap()["player"]["x"],snap()["player"]["y"])
  assert next!=start,(start,next,"D-pad down failed")
  result["tests"].append("Switch D-pad down moves player")
  pulse(12)
  back=(snap()["player"]["x"],snap()["player"]["y"])
  assert back[0]==next[0] and back[1]<next[1],(start,next,back,"D-pad up failed")
  result["tests"].append("Switch D-pad up moves player")
  assert page.locator("#touch-controls").evaluate("(e)=>getComputedStyle(e).display")=="none"
  result["tests"].append("TV/desktop gamepad does not display touch overlay")
  page.screenshot(path=str(OUT/"gamepad-test.png"),full_page=True)
  context.close();browser.close()
except Exception as e:
 result["error"]=repr(e);result["trace"]=traceback.format_exc()
finally:
 srv.shutdown()
 (OUT/"gamepad-report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
if "error" in result or result["pageErrors"]:raise AssertionError(result)
print("GAMEPAD_MAPPING_PASS",result["tests"],flush=True)
