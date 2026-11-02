"""Chrome screenshots and reload checks at late-story/postgame save checkpoints."""
import functools
import http.server
import json
import pathlib
import threading
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
OUT = PROJECT.parent / "docs" / "visual-audit" / "quest-checkpoints"
OUT.mkdir(parents=True, exist_ok=True)
base = json.loads((PROJECT / "tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
cases = [
    ("family-memory", "memory_room", "from_martha", (12, 11),
     {"chapter11": {"completed": True}, "chapter12": {"martha": True, "pictures": [0]}}),
    ("shaft-checkpoint", "shaft_anchors", "from_level2", (12, 13),
     {"chapter12": {"completed": True}, "chapter13": {"anchors": ["W", "A"], "guardianWon": True}}),
    ("finale-core", "resonance_core", "from_reflections", (14, 14),
     {"chapter13": {"completed": True}, "chapter14": {"machineReady": True, "memories": [0, 1, 2],
      "memoriesReady": True, "varekWon": True, "freed": [0]}}),
    ("postgame-garden", "optional_echo_garden_annex", "from_epilogue", (14, 10),
     {"main_story_finished": True, "chapter14": {"completed": True},
      "postgame": {"clues": [0, 1, 2], "trials": [0]}}),
    ("postgame-mobile", "postgame_meadow_04", "from_garden", (12, 14),
     {"main_story_finished": True, "chapter14": {"completed": True},
      "postgame": {"clues": [0, 1, 2], "trials": [0]}})
]

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(PROJECT))
)
threading.Thread(target=server.serve_forever, daemon=True).start()
report = {"browser": "", "screenshots": [], "errors": []}
try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        report["browser"] = browser.version
        for name, map_id, spawn_id, xy, extras in cases:
            fixture = dict(base)
            fixture.update(extras)
            fixture.update(currentMapId=map_id, safeSpawnId=spawn_id, scene="OVERWORLD",
                           introStage=4, hasStarter=True, player={"x": xy[0], "y": xy[1],
                           "dir": "down", "stepPhase": 0})
            mobile = name.endswith("mobile")
            context = browser.new_context(viewport={"width": 412, "height": 915} if mobile else
                                          {"width": 1280, "height": 800},
                                          has_touch=mobile, is_mobile=mobile)
            page = context.new_page()
            page.on("pageerror", lambda error: report["errors"].append(str(error)))
            page.add_init_script("if(!sessionStorage.getItem('qa-seeded')){" +
                                 "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(" +
                                 json.dumps(fixture) + "));sessionStorage.setItem('qa-seeded','1');}")
            page.goto(f"http://127.0.0.1:{server.server_port}/" + ("?touch" if mobile else ""))
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            if mobile:
                page.locator('[data-cmd="A"]').tap()
            else:
                page.keyboard.press("Enter")
            page.wait_for_function("window.echoQASnapshot().mode === 'OVERWORLD'")
            snap = page.evaluate("window.echoQASnapshot()")
            assert snap["mapId"] == map_id, (name, snap["mapId"])
            assert snap["scene"] == "OVERWORLD", (name, snap["scene"])
            assert snap["player"]["x"] == xy[0] and snap["player"]["y"] == xy[1], name
            page.screenshot(path=str(OUT / (name + ".png")), full_page=True)
            page.reload()
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            if mobile:
                page.locator('[data-cmd="A"]').tap()
            else:
                page.keyboard.press("Enter")
            page.wait_for_function("window.echoQASnapshot().mode === 'OVERWORLD'")
            reload_snap = page.evaluate("window.echoQASnapshot()")
            assert reload_snap["mapId"] == map_id, name + " reload"
            assert reload_snap["player"]["x"] == xy[0], name + " x reload"
            report["screenshots"].append({"name": name, "map": map_id, "viewport": "touch" if mobile else "desktop"})
            context.close()
        assert not report["errors"], report["errors"]
        browser.close()
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("BROWSER_QA_PASS", json.dumps(report))
finally:
    server.shutdown()
