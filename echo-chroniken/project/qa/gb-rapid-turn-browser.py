"""No accelerated steps or diagonal corner cutting on rapid direction changes."""
from pathlib import Path
from datetime import datetime,timedelta,timezone
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]/'docs/gb-classic'
with sync_playwright() as p:
 b=p.chromium.launch(channel='chrome',headless=True)
 page=b.new_page();page.goto((root/'klassik-demo.html').as_uri());page.wait_for_function('hud.textContent.length>0')
 page.clock.install();page.clock.pause_at(datetime.now(timezone.utc)+timedelta(seconds=1))
 page.evaluate('stage("Wurzelheim");px=9;py=8;step(1,0)')
 page.clock.run_for(30);page.evaluate('step(0,1)')
 assert page.evaluate('px===10 && py===8'),'Rapid second input must not skip unfinished first step'
 page.clock.run_for(70)
 assert page.evaluate('actorPose().y===8'),'First step must remain horizontal'
 page.evaluate('window.dispatchEvent(new Event("resize"))')
 assert page.evaluate('actorPose().frame') in (1,2)
 page.clock.run_for(90)
 assert page.evaluate('actorPose().x===10 && py===9'),'Turn must start only at first tile boundary'
 page.clock.run_for(200);assert page.evaluate('actorPose().frame===0')
 b.close();print('GB_RAPID_TURN_PASS')
