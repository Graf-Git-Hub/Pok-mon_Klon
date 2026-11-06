"""Real Chrome game-control QA: shop, coins, one-time special scroll, hidden relic.
Uses per-test save snapshots only in isolated browser localStorage.
"""
import pathlib,functools,http.server,threading,json,copy,traceback,sys
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=ROOT.parent/'docs/visual-audit/rune-market'
OUT.mkdir(parents=True,exist_ok=True)
original=json.loads((ROOT/'tests/fixtures/saves/07-new-schema-v2.json').read_text(encoding='utf-8'))
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
report={'scope':'Real gameplay merchant buying, save, rare scroll one-time, hidden village find, desktop/touch','cases':[],'errors':[]}
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel='chrome',headless=True)
  for touch in (False,True):
   who='touch' if touch else 'desktop'
   for scene in ('merchant','hidden'):
    ctx=browser.new_context(viewport={'width':412,'height':915} if touch else {'width':1280,'height':800},
         has_touch=touch,is_mobile=touch)
    save=copy.deepcopy(original)
    save['scene']='OVERWORLD';save['currentMapId']='legacy_wurzeldorf'
    save['hasStarter']=True;save['coins']=500;save['shopBought']={};save['runeFinds']={'mist':False,'ancestor':False}
    save['player']={'x':22,'y':17,'dir':'up','stepPhase':0} if scene=='merchant' else {'x':16,'y':11,'dir':'up','stepPhase':0}
    data=json.dumps(save,ensure_ascii=False)
    ctx.add_init_script("if(!localStorage.getItem('echo_chroniken_tv_save'))localStorage.setItem('echo_chroniken_tv_save',"+json.dumps(data,ensure_ascii=False)+");")
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    case={'viewport':who,'scene':scene,'screens':[]}
    def cmd(k):page.evaluate('(k)=>window.tvControllerInput(k)',k)
    def snap():return page.evaluate('window.echoQASnapshot()')
    def saved():return page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
    def shot(label):
     f=who+'-'+scene+'-'+label+'.png'
     page.screenshot(path=str(OUT/f),full_page=False)
     case['screens'].append(f)
    def tap(x,y):
     el=page.locator('#screen');r=el.bounding_box()
     w=el.evaluate('e=>e.width');h=el.evaluate('e=>e.height')
     page.mouse.click(r['x']+x/w*r['width'],r['y']+y/h*r['height'])
    try:
     page.goto('http://127.0.0.1:%d/'%server.server_port+('?touch=1' if touch else ''),wait_until='load')
     page.wait_for_function("typeof window.echoQASnapshot==='function'")
     assert snap()['mode']=='TITLE'
     cmd('A');assert snap()['mode']=='OVERWORLD',snap()
     if scene=='merchant':
      cmd('A');assert snap()['mode']=='RUNE_SHOP',snap()
      shot('shop-open')
      if touch:tap(80,54)
      else:cmd('A')
      assert snap()['mode']=='DIALOG'
      cmd('A');assert snap()['mode']=='RUNE_SHOP'
      assert saved()['coins']==380
      assert saved()['gearStock']['rune_kraft']==1
      shot('purchase')
      for _ in range(6):cmd('DOWN')
      cmd('A');assert snap()['mode']=='DIALOG'
      cmd('A');assert snap()['mode']=='RUNE_SHOP'
      after=saved()
      assert after['shopBought']['kohlenregen'] is True
      assert after['runes']['kohlenregen']>=1
      # Second purchase of the same rare scroll is forbidden.
      oldcoins=after['coins']
      cmd('A');cmd('A')
      assert saved()['coins']==oldcoins
      shot('sold-out')
      cmd('B');assert snap()['mode']=='OVERWORLD'
      page.reload(wait_until='load')
      assert saved()['coins']==oldcoins
      assert saved()['shopBought']['kohlenregen']
     else:
      shot('hidden-sparkle')
      before=saved().get('gearStock',{}).get('rune_nebel',0)
      cmd('A');assert snap()['mode']=='DIALOG',snap()
      cmd('A')
      after=saved()
      assert after['runeFinds']['mist'] is True
      assert after['gearStock']['rune_nebel']==before+1
      shot('found')
      cmd('A')
      assert saved()['gearStock']['rune_nebel']==before+1
      page.reload(wait_until='load')
      assert saved()['runeFinds']['mist'] is True
     assert not errors,errors
     case['success']=True;report['cases'].append(case)
     print('RUNE_MARKET_BROWSER_PASS',who,scene,flush=True)
    except Exception:
     report['errors'].append({'viewport':who,'scene':scene,'trace':traceback.format_exc()})
     print('RUNE_MARKET_BROWSER_FAIL',who,scene,report['errors'][-1]['trace'].splitlines()[-1],flush=True)
    finally:ctx.close()
  browser.close()
finally:
 server.shutdown()
 (OUT/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if report['errors']:sys.exit(1)
