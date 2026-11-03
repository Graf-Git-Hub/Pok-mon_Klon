"""Real Chapter 4 cloud playthrough with keyboard and touch.

Every move, interaction, two boss fights and both rail rides use actual
game controls. Map data is read only for collision-safe BFS route planning.
Starts from a completed Chapter 3 save; normal player-level balance and
Chapter 1-3 playthrough are outside this test.
"""
import copy
import functools
import http.server
import json
import pathlib
import threading
from collections import deque

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT.parent / "docs/visual-audit/real-chapter4"
OUT.mkdir(parents=True, exist_ok=True)
BASE = json.loads((ROOT / "tests/fixtures/saves/07-new-schema-v2.json").read_text(encoding="utf-8"))
DIRS = {(-1, 0): "LEFT", (1, 0): "RIGHT", (0, -1): "UP", (0, 1): "DOWN"}
BLOCKED = {1, 4, 5, 7}
report = {"scope": "actual keyboard/touch journey, chapter 4 from completed chapter 3 save",
          "cases": [], "page_errors": []}


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(
    ("127.0.0.1", 0), functools.partial(Handler, directory=str(ROOT))
)
threading.Thread(target=server.serve_forever, daemon=True).start()

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel="chrome", headless=True)
        report["browser"] = browser.version
        for mobile in (False, True):
            name = "touch" if mobile else "desktop"
            fixture = copy.deepcopy(BASE)
            fixture.update(
                scene="OVERWORLD", introStage=4, hasStarter=True,
                currentMapId="root_tunnel", safeSpawnId="from_pump",
                player={"x": 2, "y": 6, "dir": "right", "stepPhase": 0},
                chapter3={"completed": True, "bossWon": True},
                chapter4=None, encounterGrace=999999
            )
            # Strong QA party for testing story progression, NOT normal balance.
            fixture["team"] = [
                dict(fixture["team"][0], id=3, lv=55, xp=0, nextXp=990,
                     hp=280, maxHp=280, moves=["lichtfunke", "seelenstups"])
            ]
            fixture["seenIds"] = {"1": True, "2": True, "3": True}
            fixture["caughtIds"] = {"1": True, "2": True, "3": True}
            original_orbs, original_potions = fixture["orbs"], fixture["potions"]
            context = browser.new_context(
                viewport={"width": 412, "height": 915} if mobile
                else {"width": 1280, "height": 800},
                is_mobile=mobile, has_touch=mobile,
            )
            page = context.new_page()
            page.on("pageerror", lambda err: report["page_errors"].append(str(err)))
            context.add_init_script(
                "if(!sessionStorage.getItem('ch4-seeded')){"
                + "localStorage.setItem('echo_chroniken_tv_save',JSON.stringify("
                + json.dumps(fixture) + "));sessionStorage.setItem('ch4-seeded','1');}"
            )
            page.goto(
                f"http://127.0.0.1:{server.server_port}/"
                + ("?touch" if mobile else "")
            )
            page.wait_for_function("typeof window.echoQASnapshot === 'function'")

            def snap():
                return page.evaluate("window.echoQASnapshot()")

            def push(cmd):
                if mobile:
                    page.locator(f'[data-cmd="{cmd}"]').tap()
                else:
                    page.keyboard.press({
                        "UP": "ArrowUp", "DOWN": "ArrowDown",
                        "LEFT": "ArrowLeft", "RIGHT": "ArrowRight",
                        "A": "Enter", "B": "Backspace",
                    }[cmd])

            def dismiss():
                for _ in range(36):
                    if snap()["mode"] != "DIALOG":
                        return
                    push("A")
                raise AssertionError(name + ": stuck in dialogue")

            def screenshot(part):
                page.screenshot(path=str(OUT / (name + "-" + part + ".png")), full_page=True)

            push("A")
            page.wait_for_function("window.echoQASnapshot().mode === 'OVERWORLD'")
            assert snap()["mapId"] == "root_tunnel"
            case = {"viewport": name, "steps": 0, "dialog_interactions": 0,
                    "fights": [], "boss_attacks": 0, "rail_trips": [],
                    "portals": [], "checkpoints": []}

            def mapdata():
                return page.evaluate("""() => {
                  const m=window.EchoMaps.get(window.echoQASnapshot().mapId);
                  return {id:m.mapId, tiles:m.tiles, exits:m.exits,
                    markers:window.EchoChapter4.markers[m.mapId]||[]};
                }""")

            def route(goal, exit_allowed=False):
                m = mapdata()
                s = snap()
                origin = (s["player"]["x"], s["player"]["y"])
                w, h = len(m["tiles"][0]), len(m["tiles"])
                markers = {(p["x"], p["y"]) for p in m["markers"]}
                exits = {(e["x"], e["y"]) for e in m["exits"]}
                q = deque([origin])
                parent = {origin: None}
                while q and goal not in parent:
                    x, y = q.popleft()
                    for (dx, dy), command in DIRS.items():
                        xy = (x + dx, y + dy)
                        if xy in parent:
                            continue
                        xx, yy = xy
                        if xx < 0 or yy < 0 or xx >= w or yy >= h:
                            continue
                        if m["tiles"][yy][xx] in BLOCKED or xy in markers:
                            continue
                        if xy in exits and not (exit_allowed and xy == goal):
                            continue
                        parent[xy] = ((x, y), command)
                        q.append(xy)
                assert goal in parent, (name, m["id"], origin, goal, "unreachable")
                path = []
                current = goal
                while parent[current] is not None:
                    previous, command = parent[current]
                    path.append((command, current))
                    current = previous
                return list(reversed(path))

            def walk(goal, exit_to=None):
                start_id = snap()["mapId"]
                for command, location in route(goal, bool(exit_to)):
                    before = snap()
                    assert before["mode"] == "OVERWORLD", (name, "walking while", before["mode"])
                    push(command)
                    after = snap()
                    if exit_to and location == goal:
                        assert after["mapId"] == exit_to, (name, start_id, exit_to, after)
                        dismiss()
                        assert snap()["mode"] == "OVERWORLD"
                    else:
                        assert after["mapId"] == start_id, (name, "unexpected exit", after)
                        actual = (after["player"]["x"], after["player"]["y"])
                        assert actual == location, (name, "blocked tile", actual, location)
                    case["steps"] += 1

            def approach(marker_type):
                m = mapdata()
                markers = [p for p in m["markers"] if p["type"] == marker_type]
                assert len(markers) == 1, (name, m["id"], marker_type, markers)
                marker = markers[0]
                best = None
                for (dx, dy), facing in DIRS.items():
                    target = (marker["x"] - dx, marker["y"] - dy)
                    try:
                        path = route(target)
                    except AssertionError:
                        continue
                    if best is None or len(path) < len(best[0]):
                        best = (path, target, facing)
                assert best, (name, m["id"], "marker unreachable", marker_type)
                path, neighbor, facing = best
                walk(neighbor)
                push(facing)
                assert (snap()["player"]["x"], snap()["player"]["y"]) == neighbor
                push("A")
                case["dialog_interactions"] += 1
                return snap()

            def talk(marker_type):
                state = approach(marker_type)
                assert state["mode"] in ("DIALOG", "RAIL"), (name, marker_type, state["mode"])
                if state["mode"] == "DIALOG":
                    dismiss()
                return snap()

            def portal(exit_id, to):
                m = mapdata()
                e = next(e for e in m["exits"] if e["exitId"] == exit_id)
                walk((e["x"], e["y"]), exit_to=to)
                case["portals"].append(m["id"] + " -> " + to)

            def assert_no_train():
                state = talk("train")
                assert state["mode"] == "OVERWORLD"
                assert not state.get("chapter4", {}).get("railsReady", False)

            def use_train(destination):
                state = approach("train")
                assert state["mode"] == "RAIL", (name, "rail menu didn't open", state["mode"])
                available = page.evaluate(
                    "() => window.EchoRail.destinations("
                    "{...JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))})"
                )
                assert [x["id"] for x in available] == [destination], (name, available)
                screenshot("rail-" + str(len(case["rail_trips"]) + 1))
                push("A")
                page.wait_for_function(
                    "(id) => window.echoQASnapshot().mapId === id",
                    arg=destination,
                )
                assert snap()["mode"] == "DIALOG"
                dismiss()
                assert snap()["mode"] == "OVERWORLD"
                case["rail_trips"].append(destination)

            def fight(marker_type, expected_flag):
                state = approach(marker_type)
                assert state["mode"] == "DIALOG"
                dismiss()
                page.wait_for_function("window.echoQASnapshot().mode === 'BATTLE'")
                screenshot("fight-" + marker_type)
                for _ in range(18):
                    state = snap()
                    if state["mode"] == "DIALOG":
                        dismiss()
                        if snap()["chapter4"].get(expected_flag):
                            break
                        continue
                    assert state["mode"] == "BATTLE", (name, marker_type, state["mode"])
                    page.wait_for_function(
                        "window.echoQASnapshot().battle && !window.echoQASnapshot().battle.busy"
                    )
                    push("A")
                    assert snap()["mode"] == "ATTACKS"
                    push("A")
                    case["boss_attacks"] += 1
                    page.wait_for_timeout(1000)
                    if snap()["chapter4"].get(expected_flag):
                        break
                assert snap()["chapter4"].get(expected_flag), (name, marker_type, "not won")
                dismiss()
                case["fights"].append(marker_type)

            def reload_check(expected_map, flag):
                page.reload()
                page.wait_for_function("typeof window.echoQASnapshot === 'function'")
                push("A")
                page.wait_for_function("window.echoQASnapshot().mode === 'OVERWORLD'")
                state = snap()
                assert state["mapId"] == expected_map
                assert state["chapter4"].get(flag), (name, "lost save", flag, state["chapter4"])
                case["checkpoints"].append(flag)

            # Arrive at the station by physical portal, then ask for a train.
            talk("diary")
            portal("to_station", "station_wurzelheim")
            talk("edda")
            assert_no_train()
            portal("to_yard", "rail_switchyard")
            # Wrong order is rejected and must not change quest progress.
            talk("switchB")
            assert not snap()["chapter4"]["switches"]
            talk("switchA")
            assert snap()["chapter4"]["switches"] == ["A"]
            reload_check("rail_switchyard", "switches")
            talk("switchC")
            talk("switchC")  # Repeat must not double-add C.
            assert snap()["chapter4"]["switches"] == ["A", "C"]
            talk("switchB")
            assert snap()["chapter4"]["switches"] == ["A", "C", "B"]
            assert snap()["chapter4"]["railsReady"]
            screenshot("switches")
            portal("to_station", "station_wurzelheim")
            use_train("station_moorglas")
            assert snap()["chapter4"]["firstTrip"]
            reload_check("station_moorglas", "firstTrip")
            portal("to_bog", "moorglas_bog")
            # Root is blocked until the courier victory callback fires in game.
            denied = talk("rootBoss")
            assert not denied["chapter4"]["rootBossWon"]
            fight("courier", "courierWon")
            talk("courier")
            fight("rootBoss", "rootBossWon")
            talk("rootBoss")
            screenshot("bog-cleared")
            portal("to_station", "station_moorglas")
            use_train("station_wurzelheim")
            chapter4 = snap()["chapter4"]
            assert chapter4["completed"] and chapter4["returnTrip"]
            assert chapter4["rewardClaimed"] and chapter4["plans"]
            saved = page.evaluate(
                "JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))"
            )
            assert saved["chapter4"]["completed"]
            assert saved["orbs"] == original_orbs + 6, (name, "orbs", saved["orbs"])
            assert saved["potions"] == original_potions + 3, (name, "potions", saved["potions"])
            screenshot("chapter4-complete")
            reload_check("station_wurzelheim", "completed")
            # Repeated free roundtrip does not farm quest rewards.
            use_train("station_moorglas")
            use_train("station_wurzelheim")
            saved2 = page.evaluate(
                "JSON.parse(localStorage.getItem('echo_chroniken_tv_save'))"
            )
            assert (saved2["orbs"], saved2["potions"]) == (
                original_orbs + 6, original_potions + 3
            ), (name, "duplicate rail reward", saved2)
            report["cases"].append(case)
            context.close()
        assert not report["page_errors"], report["page_errors"]
        browser.close()
        print("REAL_CHAPTER4_PASS", json.dumps(report, ensure_ascii=False))
finally:
    (OUT / "report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    server.shutdown()
