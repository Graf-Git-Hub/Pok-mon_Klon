from pathlib import Path
from playwright.sync_api import sync_playwright
URL="https://graf-git-hub.github.io/Pok-mon_Klon/"
OUT=Path(__file__).resolve().parents[2]/"docs"/"visual-audit"/"parallel-lab"/"mobile-public-test.png"
errs=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    context=browser.new_context(viewport={"width":412,"height":915},is_mobile=True,has_touch=True)
    page=context.new_page()
    page.on("pageerror",lambda e:errs.append(str(e)))
    page.goto(URL,wait_until="domcontentloaded",timeout=30000)
    page.wait_for_function("document.querySelectorAll('.case').length===100",timeout=25000)
    assert "RUN-001" in page.locator("#cases").inner_text()
    assert page.locator("#liveText").inner_text() != "Offline"
    assert len(page.locator(".case").all())==100
    page.screenshot(path=str(OUT),full_page=True)
    print("PUBLIC_MOBILE_DASHBOARD_PASS",URL,"cards",len(page.locator(".case").all()),
          "status",page.locator("#liveText").inner_text(),
          "finished",page.locator("#done").inner_text(),"screenshot",str(OUT))
    assert not errs,errs
    context.close()
    browser.close()
