"""Check that entering tall grass changes real canvas pixels and then settles."""

import base64
import io
from pathlib import Path

from PIL import Image
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[2] / "docs" / "gb-classic"
out = root / "v12-proof"
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome", headless=True)
    page = browser.new_page(viewport={"width":390,"height":844}, is_mobile=True, has_touch=True)
    page.goto((root / "klassik-demo.html").as_uri())
    page.wait_for_function("rustleSheet.complete && hud.textContent.length>0")
    page.clock.install()
    page.evaluate("""()=>{
      stage('Route'); px=9; py=11; dir=[-1,0]; draw();
      if (tileAt(DATA.scenes.Route,8,11)!=='grass') throw new Error('Missing test clearing');
    }""")
    frames = []

    def frame():
        png = page.locator("#view").evaluate("c=>c.toDataURL().split(',')[1]")
        return Image.open(io.BytesIO(base64.b64decode(png))).convert("RGB")

    frames.append(frame())
    page.keyboard.press("ArrowLeft")
    assert page.evaluate("px===8 && py===11")
    page.clock.run_for(95)
    assert page.evaluate("grassPose(8,11,performance.now())") == 0
    frames.append(frame())
    page.clock.run_for(80)
    frames.append(frame())
    page.clock.run_for(50)
    assert page.evaluate("grassPose(8,11,performance.now())") == 1
    frames.append(frame())
    # Same actor position, two visibly different grass poses.
    tiles = page.evaluate("""()=>{
      const x=(8-lastCamera.x)*16, y=(11-lastCamera.y)*16;
      const pixels=()=>Array.from(ctx.getImageData(x,y,16,16).data);
      const start=rustles.get('8,11').start;
      draw(start+100);const first=pixels();
      draw(start+180);const second=pixels();
      draw(start+400);const settled=pixels();
      return [first,second,settled].map(p=>p.join());
    }""")
    assert len(set(tiles)) == 3
    frames.append(frame())
    page.clock.run_for(400)
    assert page.evaluate("rustles.size===0 && actorPose().frame===0")
    page.evaluate("stage('Wurzelheim'); stage('Route')")
    assert page.evaluate("rustles.size===0")
    frames = [im.resize((480,432), Image.Resampling.NEAREST) for im in frames]
    frames[0].save(out / "Waldroute_Gras.gif", save_all=True, append_images=frames[1:],
                   duration=[750,95,80,90,650], loop=0, disposal=2)
    print("GB_GRASS_RUSTLE_PASS: walk, two visible grass poses, settle, map reset")
