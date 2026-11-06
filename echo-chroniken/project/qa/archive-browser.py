"""Real Chrome archive integration QA, isolated from the user's original worktree."""
import functools
import http.server
import json
import pathlib
import threading
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
OUT = PROJECT.parent / "docs" / "visual-audit" / "archive-qa"
OUT.mkdir(parents=True, exist_ok=True)
fixture = json.loads((PROJECT / "tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
fixture.update(scene="OVERWORLD", introStage=4, hasStarter=True)
fixture["team"] = [dict(fixture["team"][0], id=i+1, uid=f"qa-{i}", moves=["seelenstups"]) for i in range(6)]
fixture["archive"] = [dict(fixture["team"][0], id=i+7, uid=f"archive-{i}", moves=["seelenstups"]) for i in range(144)]

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(PROJECT))
)
threading.Thread(target=server.serve_forever, daemon=True).start()
errors = []
report = {"browser": None, "checks": [], "errors": errors}

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        report["browser"] = browser.version
        for mobile in (False, True):
            context = browser.new_context(
                viewport={"width": 412, "height": 915} if mobile else {"width": 1280, "height": 800},
                has_touch=mobile, is_mobile=mobile, device_scale_factor=1
            )
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.add_init_script(
                "if(!sessionStorage.getItem('qa-seeded')){"
                "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(" + json.dumps(fixture) + "));"
                "sessionStorage.setItem('qa-seeded','1');}"
            )
            page.goto(f"http://127.0.0.1:{server.server_port}/" + ("?touch" if mobile else ""))
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            def snapshot():
                return page.evaluate("window.echoQASnapshot()")
            def cmd(action):
                if mobile:
                    page.locator('[data-cmd="' + action + '"]').tap()
                else:
                    page.keyboard.press({"A":"Enter","B":"x","START":"m","UP":"ArrowUp","DOWN":"ArrowDown"}.get(action,action))
            def open_archive():
                cmd("START")
                for _ in range(4):
                    cmd("DOWN")
                cmd("A")
                assert snapshot()["mode"] == "ARCHIVE", snapshot()
            cmd("A")
            open_archive()
            page.screenshot(path=str(OUT / ("mobile-full.png" if mobile else "desktop-full.png")))
            if mobile:
                box = page.locator("#screen").bounding_box()
                assert box, "Canvas missing"
                for _ in range(2):
                    page.touchscreen.tap(box["x"]+30/320*box["width"],box["y"]+100/180*box["height"])
                assert snapshot()["team"][0]["id"] == 8, snapshot()
            else:
                cmd("UP")
                page.screenshot(path=str(OUT/"desktop-last-page.png"))
                cmd("A")
                assert snapshot()["team"][0]["id"] == 150, snapshot()
            saved = page.evaluate("JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))")
            assert len(saved["archive"]) == 144
            assert saved["archive"][1 if mobile else 143]["id"] == 1
            page.reload()
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            assert snapshot()["team"][0]["id"] == (8 if mobile else 150)
            assert snapshot()["archiveCount"] == 144
            cmd("A")
            open_archive()
            page.screenshot(path=str(OUT / ("mobile-reloaded.png" if mobile else "desktop-reloaded.png")))
            cmd("B")
            assert snapshot()["mode"] == "MENU"
            cmd("B")
            assert snapshot()["mode"] == "OVERWORLD"
            page.evaluate("""() => {
              const save=JSON.parse(localStorage.getItem('echo_chroniken_tv_save'));
              delete save.archive;
              localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(save));
            }""")
            page.reload()
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            cmd("A")
            open_archive()
            assert snapshot()["archiveCount"] == 0
            cmd("A")
            assert len(snapshot()["team"]) == 6
            page.screenshot(path=str(OUT / ("mobile-empty.png" if mobile else "desktop-empty.png")))
            context.close()
            report["checks"].append(("mobile touch" if mobile else "desktop keyboard") + ": swap, autosave, reload, legacy save")
        assert not errors, errors
        browser.close()
    (OUT / "report.json").write_text(json.dumps(report, indent=2)+"\n", encoding="utf-8")
    print("BROWSER_QA_PASS", json.dumps(report))
finally:
    server.shutdown()
