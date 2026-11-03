"""Cloud browser smoke: load all registered maps and save chapter screenshots.
This checks map loads only, not a continuous story playthrough.
"""
import copy, functools, http.server, json, os, pathlib, threading
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
OUT = PROJECT.parent / "docs/visual-audit/cloud-map-coverage"
OUT.mkdir(parents=True, exist_ok=True)
BASE = json.loads((PROJECT / "tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
CHAPTERS = {
    "legacy_wurzeldorf": "01-02-village",
    "nebelhafen_town": "03-harbor",
    "station_moorglas": "04-rail",
    "stillwasser_town": "05-memory-town",
    "aschenruh_town": "06-forge-town",
    "lichterhain_grove": "07-grove",
    "kronenstadt_upper": "08-capital",
    "frost_approach": "09-frost",
    "under_city_homes": "10-undercity",
    "observatory_roof": "11-observatory",
    "memory_room": "12-memory",
    "shaft_anchors": "13-shaft",
    "resonance_core": "14-core",
    "optional_echo_garden_annex": "postgame-garden",
}
TOUCH = {"legacy_wurzeldorf", "kronenstadt_upper", "memory_room", "resonance_core"}
class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(PROJECT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
report = {"scope": "map-load smoke, not a full playthrough", "checks": [], "screenshots": [], "errors": []}
try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome", headless=True)
        report["browser"] = browser.version
        for mobile in (False, True):
            context = browser.new_context(viewport={"width": 412, "height": 915} if mobile else
                                          {"width": 1280, "height": 800},
                                          has_touch=mobile, is_mobile=mobile)
            page = context.new_page()
            page.on("pageerror", lambda error: report["errors"].append(str(error)))
            page.goto(f"http://127.0.0.1:{server.server_port}/")
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")
            maps = page.evaluate("""() => window.EchoMaps.list().map(id => {
                const spawn = Object.entries(window.EchoMaps.get(id).spawns)[0];
                return {id, spawnId: spawn[0], xy: spawn[1]};
            })""")
            assert len(maps) >= 62, f"Expected 62+ maps, found {len(maps)}"
            assert set(CHAPTERS).issubset({m["id"] for m in maps})
            chosen = [m for m in maps if m["id"] in TOUCH] if mobile else maps
            for m in chosen:
                save = copy.deepcopy(BASE)
                for n in range(3, 15): save[f"chapter{n}"] = {"completed": True}
                save.update(scene="OVERWORLD", introStage=4, hasStarter=True,
                            main_story_finished=True, currentMapId=m["id"],
                            safeSpawnId=m["spawnId"],
                            player={"x": m["xy"]["x"], "y": m["xy"]["y"],
                                    "dir": "down", "stepPhase": 0})
                page.evaluate("(s) => localStorage.setItem('echo_chroniken_tv_save',JSON.stringify(s))", save)
                page.reload()
                page.wait_for_function("typeof window.echoQASnapshot === 'function'")
                if mobile: page.locator('[data-cmd="A"]').tap()
                else: page.keyboard.press("Enter")
                page.wait_for_function("window.echoQASnapshot().mode === 'OVERWORLD'")
                snap = page.evaluate("window.echoQASnapshot()")
                assert snap["mapId"] == m["id"], (m["id"], snap)
                assert (snap["player"]["x"],snap["player"]["y"]) == (
                    m["xy"]["x"],m["xy"]["y"]), (m["id"],snap["player"])
                report["checks"].append({"id": m["id"], "touch": mobile})
                if m["id"] in CHAPTERS:
                    filename = CHAPTERS[m["id"]] + ("-touch" if mobile else "-desktop") + ".png"
                    page.screenshot(path=str(OUT / filename), full_page=True)
                    report["screenshots"].append(filename)
            context.close()
        assert not report["errors"], report["errors"]
        browser.close()
    print("CLOUD_MAP_QA_PASS", len(report["checks"]), "map loads;",
          len(report["screenshots"]), "screenshots")
finally:
    (OUT / "report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    server.shutdown()
