"""Open all 60 GB maps and traverse their actual 118 portal entry points."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[2]/'docs'/'gb-classic'
proof=root/'world-60-proof';proof.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto((root/'welt-60-karten.html').as_uri())
    page.wait_for_function('hud.textContent.length>0 && biome.complete')
    maps=page.evaluate('Object.keys(DATA.scenes)')
    assert len(maps)==60 and page.locator('#scene option').count()==60
    portals=0
    for name in maps:
        page.locator('#scene').select_option(name)
        assert page.evaluate('canWalk(DATA.scenes[scene],px,py)')
        assert page.evaluate('lastCamera.w===10 && lastCamera.h===9')
        links=page.evaluate('DATA.scenes[scene].portals')
        for position,target in links.items():
            x,y=map(int,position.split(','))
            result=page.evaluate("""([name,x,y])=>{
              stage(name);
              const m=DATA.scenes[scene];
              const adjacent=[[0,1],[0,-1],[1,0],[-1,0]].find(([dx,dy])=>canWalk(m,x-dx,y-dy));
              if(!adjacent)return null;
              px=x-adjacent[0];py=y-adjacent[1];step(...adjacent);
              return {scene,px,py};
            }""",[name,x,y])
            assert result=={'scene':target['scene'],'px':target['x'],'py':target['y']},(name,position,result,target)
            portals+=1
    views={}
    for name in ['legacy_wurzeldorf','nebelhafen_town','moorglas_bog','glut_forge','ice_caverns','observatory_roof']:
        page.evaluate('(name)=>stage(name)',name)
        views[name]=page.locator('#view').evaluate("c=>c.toDataURL().split(',')[1]")
    (proof/'canvases.json').write_text(json.dumps(views))
    # Natural held-touch movement in the source Wurzelheim starting area.
    page.evaluate("stage('legacy_wurzeldorf')")
    before=page.evaluate('[px,py]')
    direction=page.evaluate("""()=>{
      const m=DATA.scenes[scene];
      return [[1,0],[-1,0],[0,1],[0,-1]].find(([x,y])=>canWalk(m,px+x,py+y)&&!m.portals[(px+x)+','+(py+y)]);
    }""")
    button=page.locator('[data-move="'+','.join(map(str,direction))+'"]')
    button.dispatch_event('pointerdown',{'pointerId':1,'pointerType':'touch'})
    button.dispatch_event('pointerup',{'pointerId':1,'pointerType':'touch'})
    assert page.evaluate('[px,py]')!=before
    page.wait_for_timeout(200)
    page.set_viewport_size({'width':1280,'height':720})
    page.wait_for_function('lastCamera.w===16')
    page.screenshot(path=str(proof/'world-tv.png'),full_page=True)
    assert not errors,errors
    report={'maps':len(maps),'portals':portals,'browser':browser.version,'result':'PASS','errors':errors}
    (proof/'report.json').write_text(json.dumps(report,indent=2))
    print('GB_WORLD_BROWSER_PASS',report)
    browser.close()
