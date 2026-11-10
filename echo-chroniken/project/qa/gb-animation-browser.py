"""Behavior test: walk frames must change only during successful movement."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]/'docs'/'gb-classic'
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':390,'height':844})
 page.goto((root/'klassik-demo.html').as_uri())
 page.wait_for_function('atlas.complete && atlas.naturalWidth>0')
 assert page.evaluate("typeof actorPose==='function'"), 'Missing real directional walk animation'
 for dx,dy,direction in [(0,1,'down'),(0,-1,'up'),(-1,0,'left'),(1,0,'right')]:
  page.evaluate('stage("Wurzelheim");px=10;py=8')
  page.evaluate('([dx,dy])=>step(dx,dy)',[dx,dy])
  state=page.evaluate('actorPose(performance.now())')
  assert state['direction']==direction and state['frame'] in (1,2),state
  page.wait_for_timeout(200)
  assert page.evaluate('actorPose(performance.now()).frame')==0
 page.evaluate('stage("Wurzelheim");px=1;py=1;step(-1,0)')
 assert page.evaluate('px===1 && actorPose(performance.now()).frame===0'), 'Blocked steps must stay idle'
 b.close()
 print('GB_ANIMATION_PASS')
