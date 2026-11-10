"""Real browser/input/canvas proof. Gamepad is simulated, not a hardware test."""
from pathlib import Path
from datetime import datetime,timedelta,timezone
from playwright.sync_api import sync_playwright
from PIL import Image
import io,json,os
root=Path(__file__).resolve().parents[2]/'docs'/'gb-classic'
out=root/'v5-proof';out.mkdir(exist_ok=True)
url=os.environ.get('ECHO_QA_URL',(root/'klassik-demo.html').as_uri())
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url);page.wait_for_function('actors.complete && foreground.complete && lastCamera.w===10 && hud.textContent.length>0')
 page.clock.install();page.clock.pause_at(datetime.now(timezone.utc)+timedelta(seconds=1))
 def reset(x=10,y=8,scene='Wurzelheim'):
  page.evaluate('([name,x,y])=>{stage(name);px=x;py=y;dir=[0,1];draw()}',[scene,x,y])
 def shot(name):page.screenshot(path=str(out/(name+'.png')),full_page=True)
 reset(9,5);shot('dorf-handy')
 frames=[]
 for key,dx,dy,direction in [('ArrowDown',0,1,'down'),('ArrowUp',0,-1,'up'),('ArrowLeft',-1,0,'left'),('ArrowRight',1,0,'right')]:
  reset(9,8);phases=set()
  page.keyboard.down(key)
  for i in range(8):
   page.clock.run_for(45)
   state=page.evaluate('actorPose(performance.now())');phases.add(state['frame'])
   assert state['direction']==direction
   frames.append(Image.open(io.BytesIO(page.locator('#view').screenshot())).convert('RGB'))
   if key=='ArrowRight' and i==1:
    assert state['frame'] in (1,2);shot('dorf-laufschritt')
  page.keyboard.up(key);page.clock.run_for(200)
  assert {1,2}<=phases,(direction,phases)
  assert page.evaluate('actorPose().frame')==0
 frames[0].save(out/'laufen-im-spiel.gif',save_all=True,append_images=frames[1:],duration=70,loop=0)
 # Held touch really repeats and releases without sticky input.
 reset(9,8)
 page.locator('[data-move="0,1"]').dispatch_event('pointerdown',{'pointerId':1,'pointerType':'touch'})
 page.clock.run_for(340)
 page.locator('[data-move="0,1"]').dispatch_event('pointerup',{'pointerId':1,'pointerType':'touch'})
 assert page.evaluate('py')==11
 page.clock.run_for(400);assert page.evaluate('py')==11
 # A blocked direction turns but cannot animate or move.
 reset(1,1);page.keyboard.press('ArrowLeft');page.clock.run_for(50)
 assert page.evaluate('px===1 && actorPose().frame===0')
 # Pausing or losing focus clears held controls.
 reset();page.keyboard.down('ArrowDown');page.clock.run_for(30);page.keyboard.press('p')
 pos=page.evaluate('[px,py]');page.clock.run_for(400);assert page.evaluate('[px,py]')==pos
 page.keyboard.up('ArrowDown');page.keyboard.press('p')
 page.keyboard.down('ArrowDown');page.evaluate('window.dispatchEvent(new Event("blur"))')
 pos=page.evaluate('[px,py]');page.clock.run_for(400);assert page.evaluate('[px,py]')==pos
 page.keyboard.up('ArrowDown')
 # Foreground pixel test using source-sheet alpha, rather than merely checking code strings.
 reset(1,9)
 tree_test=page.evaluate('''()=>{
  const scratch=document.createElement('canvas');scratch.width=128;scratch.height=32;
  const c=scratch.getContext('2d');c.drawImage(foreground,0,0);
  let checked=0;
  for(let y=2;y<8;y++)for(let x=3;x<13;x++){
   const source=c.getImageData(x,y,1,1).data;
   if(!source[3])continue;
   const target=ctx.getImageData(16+x-Math.round(lastCamera.x*16),160-8+y-Math.round(lastCamera.y*16),1,1).data;
   if(source.join()!==target.join())return false;checked++;
  }return checked>10;
 }''')
 assert tree_test,'Tree crown must cover actor behind it';shot('baum-vordergrund')
 reset(7,15);shot('gras-vordergrund')
 assert page.evaluate('''()=>{
  const c=document.createElement('canvas');c.width=128;c.height=32;const a=c.getContext('2d');a.drawImage(foreground,0,0);
  let n=0;for(let y=10;y<16;y++)for(let x=0;x<16;x++){
   const s=a.getImageData(112+x,y,1,1).data;if(!s[3])continue;
   const t=ctx.getImageData(7*16+x-Math.round(lastCamera.x*16),15*16+y-Math.round(lastCamera.y*16),1,1).data;
   if(s.join()!==t.join())return false;n++;
  }return n>5;
 }'''),'Grass blades must cover feet'
 reset(6,5,'Schmiede');shot('schmiede-handy')
 reset(6,3,'Schmiede');shot('amboss-nah')
 # Water changes while idle, with exactly the fixed four canvas colors.
 reset(15,8)
 def pond():return page.evaluate('''()=>Array.from(ctx.getImageData(16*16-Math.round(lastCamera.x*16),9*16-Math.round(lastCamera.y*16),16,16).data).join()''')
 before=pond();page.clock.run_for(390);assert pond()!=before
 colors=page.evaluate('''()=>{const p=ctx.getImageData(0,0,view.width,view.height).data,s=new Set();for(let i=0;i<p.length;i+=4)s.add('#'+Array.from(p.slice(i,i+3)).map(v=>v.toString(16).padStart(2,'0')).join(''));return [...s].sort()}''')
 assert colors==sorted(['#f4f4ef','#c7c8c4','#777a7b','#24262b']),colors
 # TV controller uses the identical pose machinery, with axes in all directions.
 tv=b.new_page(viewport={'width':1280,'height':720});tv.on('pageerror',lambda e:errors.append(str(e)))
 tv.add_init_script("Object.defineProperty(navigator,'getGamepads',{value:()=>window.pad?[window.pad]:[]})")
 tv.goto(url);tv.wait_for_function('lastCamera.w===16 && actors.complete && hud.textContent.length>0')
 for dx,dy,direction in [(0,1,'down'),(0,-1,'up'),(-1,0,'left'),(1,0,'right')]:
  tv.evaluate('stage("Wurzelheim");px=9;py=8;motion=null')
  tv.evaluate('([x,y])=>{window.pad={connected:true,axes:[x,y],buttons:Array.from({length:17},()=>({pressed:false}))};gamepadLastMove=-Infinity;readGamepad(performance.now())}',[dx,dy])
  state=tv.evaluate('actorPose()');assert state['direction']==direction and state['frame'] in (1,2),state
  tv.evaluate('window.pad.axes=[0,0]');tv.wait_for_timeout(180)
 tv.evaluate('stage("Wurzelheim");px=9;py=6;dir=[0,1];draw()')
 tv.screenshot(path=str(out/'dorf-tv.png'),full_page=True)
 assert tv.evaluate('lastCamera.w===16 && lastCamera.h===9')
 assert not errors,errors
 report={'result':'PASS','browser':b.version,'url':url,'checks':['4 directions x 2 distinct walk phases','idle reset','blocked movement','held touch/release','pause and focus loss','tree crown pixel occlusion','grass blade pixel occlusion','water animation','exact four canvas colors','TV 16x9 + 4 gamepad axes','phone 10x9','zero page errors'],'hardware':'Chrome emulation, synthetic Gamepad API; no physical Android/TV/controller claim'}
 (out/'report.json').write_text(json.dumps(report,indent=2))
 b.close();print('GB_ART_V5_BROWSER_PASS '+json.dumps(report))
