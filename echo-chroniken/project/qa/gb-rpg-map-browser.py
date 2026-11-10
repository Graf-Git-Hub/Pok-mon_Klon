"""Real Chrome checks for classic RPG town maps, doors, return positions and border connections."""
from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]/"docs"/"gb-classic"
url=(root/"klassik-demo.html").as_uri()
with sync_playwright() as p:
    browser=p.chromium.launch(channel="chrome",headless=True)
    page=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1)
    errors=[]
    page.on("pageerror",lambda e:errors.append(str(e)))
    page.goto(url)
    page.wait_for_function("scene==='Wurzelheim' && lastCamera.w===10")
    links={"4,4":"Wohnhaus","14,4":"Heilstation","4,11":"Schmiede","14,11":"Laden"}
    for key,target in links.items():
        x,y=map(int,key.split(","))
        page.evaluate("stage('Wurzelheim')")
        page.evaluate("([x,y])=>{px=x;py=y+1;draw()}",[x,y])
        page.evaluate("step(0,-1)")
        assert page.evaluate("scene")==target,(key,target,page.evaluate("scene"))
        # Walk back through the real interior bottom door.
        page.evaluate("()=>{const m=DATA.scenes[scene];px=Math.floor(m.width/2);py=m.height-2;step(0,1)}")
        assert page.evaluate("scene")=="Wurzelheim",target
        assert page.evaluate("([x,y])=>px===x&&py===y+1",[x,y]),"Door return is not the original outside tile"
    # Walk over north border and back over the same x coordinate.
    page.evaluate("stage('Wurzelheim')")
    page.evaluate("()=>{px=9;py=1;draw();step(0,-1);step(0,-1)}")
    page.wait_for_timeout(200)
    assert page.evaluate("scene")=="Route"
    assert page.evaluate("px===9&&py===16")
    page.evaluate("()=>{py=17;step(0,1)}")
    assert page.evaluate("scene")=="Wurzelheim"
    assert page.evaluate("px===9&&py===1")
    # Second entrance to the route at town south border.
    page.evaluate("()=>{px=10;py=16;step(0,1);step(0,1)}")
    page.wait_for_timeout(200)
    assert page.evaluate("scene")=="Route"
    assert page.evaluate("px===10&&py===1")
    page.evaluate("stage('Wurzelheim')")
    page.evaluate("()=>{px=10;py=9;draw()}")
    page.screenshot(path=str(root/"GB_RPG_DORFPLATZ_HANDY.png"),full_page=True)
    assert not errors,errors
    print("GB_RPG_MAP_BROWSER_PASS 4 door warps and exact returns, aligned north/south exits, camera, no JS errors")
    browser.close()
