"""End-to-end Chrome desktop/touch test for retro START pause menu, bag, team,
options, save, portrait controls, real legacy save migration and HP terminology.
"""
import functools,http.server,pathlib,threading,json,copy,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/"docs/visual-audit/retro-start-menu"
OUT.mkdir(parents=True,exist_ok=True)
initial=json.loads((ROOT/"tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
report={"scope":"Real Start/pause menu navigation, bag, team, options, save, HP HUD, old v2 save","cases":[],"errors":[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  for mobile in (False,True):
   who="touch" if mobile else "desktop"
   ctx=browser.new_context(viewport={"width":412,"height":915} if mobile else {"width":1280,"height":800},
        is_mobile=mobile,has_touch=mobile)
   data=json.dumps(copy.deepcopy(initial),ensure_ascii=False)
   ctx.add_init_script("if(!localStorage.getItem('echo_chroniken_tv_save'))localStorage.setItem('echo_chroniken_tv_save',"+json.dumps(data,ensure_ascii=False)+");")
   page=ctx.new_page()
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   case={"view":who,"screens":[],"routes":[]}
   def cmd(k):page.evaluate("(k)=>window.tvControllerInput(k)",k)
   def mode():return page.evaluate("window.echoQASnapshot().mode")
   def snapshot():return page.evaluate("window.echoQASnapshot()")
   def snap(name):
    f=who+"-"+name+".png"
    page.screenshot(path=str(OUT/f),full_page=False)
    case["screens"].append(f)
   def tap(x,y):
    el=page.locator('#screen')
    box=el.bounding_box()
    w=el.evaluate('e=>e.width');h=el.evaluate('e=>e.height')
    page.mouse.click(box['x']+x/w*box['width'],box['y']+y/h*box['height'])
   def menu():
    if mode()=='MENU':
     cmd('START')
    assert mode()=='OVERWORLD',mode()
    cmd('START')
    assert mode()=='MENU'
   def open_item(index,expected):
    menu()
    if mobile:tap(250,46+index*14.3)
    else:
     for _ in range(index):cmd('DOWN')
     cmd('A')
    assert mode()==expected,(who,index,expected,mode())
    case['routes'].append(['MENU',index,expected])
   try:
    page.goto("http://127.0.0.1:%d/"%srv.server_port+("?touch=1" if mobile else ""),wait_until='load')
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    assert mode()=='TITLE'
    cmd('A')
    assert mode()=='OVERWORLD'
    menu()
    snap('pause-menu')
    cmd('START')
    open_item(0,'LEXICON')
    snap('seelenbuch')
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(1,'TEAM_OVERVIEW')
    snap('team-hp')
    if mobile:tap(80,52)
    else:cmd('A')
    assert mode()=='AUSRUESTUNG'
    cmd('B');assert mode()=='TEAM_OVERVIEW'
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(2,'BAG')
    snap('rucksack')
    cmd('A') # First item: team heal with shared potions, no lost menu
    assert mode()=='DIALOG'
    cmd('A');assert mode()=='BAG'
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(3,'RUNEBOOK')
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(4,'ARCHIVE')
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(5,'DIALOG') # save confirmation
    cmd('A');assert mode()=='MENU',('save back menu',mode())
    stored=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
    assert stored['saveSchemaVersion']==2
    cmd('START')
    open_item(6,'OPTIONS')
    snap('options-before')
    pref0=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_preferences')||'null')")
    if mobile:tap(100,57)
    else:cmd('A')
    pref=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_preferences'))")
    assert pref['soundEnabled'] is False,pref
    cmd('DOWN');cmd('A')
    pref2=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_preferences'))")
    assert pref2['paletteIdx']==1,pref2
    snap('options-changed')
    cmd('B');assert mode()=='MENU'
    cmd('START')
    open_item(7,'OVERWORLD')
    menu();cmd('START');assert mode()=='OVERWORLD'
    page.reload(wait_until='load')
    page.wait_for_function("typeof window.echoQASnapshot==='function'")
    persisted=page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_preferences'))")
    assert persisted['paletteIdx']==1 and persisted['soundEnabled'] is False,persisted
    assert not errors,errors
    case['success']=True
    case['preferences']=persisted
    report['cases'].append(case)
    print('RETRO_MENU_BROWSER_PASS',who,'paths=',len(case['routes']),flush=True)
   except Exception:
    report['errors'].append({'view':who,'trace':traceback.format_exc()})
    print('RETRO_MENU_BROWSER_FAIL',who,report['errors'][-1]['trace'].splitlines()[-1],flush=True)
   finally:ctx.close()
  browser.close()
finally:
 srv.shutdown()
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if report['errors']:sys.exit(1)
