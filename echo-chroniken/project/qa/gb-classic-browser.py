from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[2]/"docs"/"gb-classic"
with sync_playwright() as p:
    browser=p.chromium.launch(channel='chrome',headless=True)
    page=browser.new_page(viewport={"width":420,"height":850},device_scale_factor=1)
    errs=[]
    page.on("pageerror",lambda e:errs.append(str(e)))
    page.goto((root/"klassik-demo.html").as_uri())
    page.wait_for_function("document.querySelector('canvas').width===320")
    assert page.locator("#scene option").count()==7
    assert page.evaluate("scene")=="Wurzelheim"
    page.screenshot(path=str(root/"GB_PHONE_REAL_BROWSER.png"),full_page=True)
    page.locator("#scene").select_option("Schmiede")
    page.wait_for_function("document.querySelector('canvas').width===192")
    assert page.evaluate("scene")=="Schmiede"
    page.screenshot(path=str(root/"GB_INTERIOR_REAL_BROWSER.png"),full_page=True)
    state=page.evaluate("({scene,px,py})")
    page.locator('button[data-move="0,-1"]').click()
    after=page.evaluate("({scene,px,py})")
    assert state!=after,"Touch buttons must actually change position"
    page.keyboard.press("ArrowDown")
    assert page.evaluate("py")==state["py"],"Keyboard moves player back"
    assert not errs,errs
    print("GB_BROWSER_PASS",page.locator("#scene option").count(),"scenes; touch, keyboard, images, no JS errors")
    browser.close()
