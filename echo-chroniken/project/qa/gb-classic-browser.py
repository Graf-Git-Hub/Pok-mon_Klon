"""Real Chrome regression test for Game Boy camera on phone and TV."""
from pathlib import Path
from playwright.sync_api import sync_playwright

root=Path(__file__).resolve().parents[2]/"docs"/"gb-classic"
url=(root/"klassik-demo.html").as_uri()
with sync_playwright() as p:
    browser=p.chromium.launch(channel="chrome",headless=True)
    phone=browser.new_page(viewport={"width":390,"height":844},device_scale_factor=1,is_mobile=True,has_touch=True)
    errors=[]
    phone.on("pageerror",lambda e:errors.append(str(e)))
    phone.goto(url)
    phone.wait_for_function("document.querySelector('#view').width===160")
    assert phone.locator("#scene option").count()==7
    assert phone.evaluate("scene")=="Wurzelheim"
    assert phone.evaluate("lastCamera.w")==10
    assert phone.evaluate("lastCamera.h")==9
    phone.screenshot(path=str(root/"GB_PHONE_REAL_BROWSER.png"),full_page=True)
    x=phone.evaluate("px")
    phone.locator('button[data-move="1,0"]').dispatch_event("pointerdown",{"pointerId":1,"pointerType":"touch"})
    phone.locator('button[data-move="1,0"]').dispatch_event("pointerup",{"pointerId":1,"pointerType":"touch"})
    assert phone.evaluate("px")==x+1,"Touch arrow should move one grid tile"
    assert phone.evaluate("lastCamera.x")>0,"Camera should scroll after player movement"
    phone.locator("#scene").select_option("Schmiede")
    phone.wait_for_function("document.querySelector('#view').width===160")
    assert phone.evaluate("lastCamera.w")==10,"Smaller interior still cropped to handheld zoom"
    phone.screenshot(path=str(root/"GB_INTERIOR_REAL_BROWSER.png"),full_page=True)
    phone.keyboard.press("ArrowDown")
    assert phone.evaluate("scene")=="Schmiede"
    assert not errors,errors

    tv=browser.new_page(viewport={"width":1280,"height":720},device_scale_factor=1)
    tv_errors=[]
    tv.on("pageerror",lambda e:tv_errors.append(str(e)))
    tv.add_init_script("""Object.defineProperty(navigator,'getGamepads',{
      configurable:true,value:()=>window.mockPad ? [window.mockPad] : []
    });""")
    tv.goto(url)
    tv.wait_for_function("document.querySelector('#view').width===256")
    assert tv.evaluate("lastCamera.w")==16
    assert tv.evaluate("lastCamera.h")==9
    assert tv.locator(".pad").is_hidden(),"Do not draw giant mobile D-pad on TV"
    tv.screenshot(path=str(root/"GB_TV_REAL_BROWSER.png"),full_page=True)
    tv.evaluate("""() => {
      const buttons=Array.from({length:17},()=>({pressed:false}));
      window.mockPad={connected:true,axes:[0,0,0,0],buttons};
    }""")
    tv.wait_for_function("gamepadConnected===true")
    assert "Controller verbunden" in tv.locator("#controller-state").inner_text()
    tv.evaluate("window.mockPad.buttons[15].pressed=true")
    before=tv.evaluate("px")
    tv.wait_for_function("(x)=>px>x",arg=before,timeout=3000)
    tv.evaluate("window.mockPad.buttons[15].pressed=false")
    assert not tv_errors,tv_errors
    tv.locator("#mode").select_option("phone")
    assert tv.evaluate("lastCamera.w")==10
    tv.locator("#mode").select_option("tv")
    assert tv.evaluate("lastCamera.w")==16
    print("GB_CAMERA_TV_PHONE_PASS: viewport clipping 10x9/16x9, camera follow, touch, dpad, auto TV, controller, zero JS errors")
    browser.close()
