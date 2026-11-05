"""Run 20 x 100k independent random duels locally, tune between rounds.

Safety: isolated worktree only. Never access a user save, remove paths, or update
a release. Conservative per-species clamps and a separate report for each round.
"""
import json
import math
import pathlib
import re
import statistics
import subprocess
import sys

PROJECT = pathlib.Path(__file__).resolve().parents[1]
ROOT = PROJECT.parents[0]
SOURCE = PROJECT / "data/species.js"
OUT = ROOT / "docs/visual-audit/adaptive-balance"
OUT.mkdir(parents=True, exist_ok=True)
STATUS = OUT / "progress.json"
SUMMARY = OUT / "summary.json"
TOTAL_ROUNDS = 20
PROTECTED = {1, 2, 3}  # Story-important starter family
MAX_TUNED_PER_ROUND = 12

def read_species():
    src = SOURCE.read_text(encoding="utf-8")
    assert src.startswith("window.ECHO_SPECIES=")
    return json.loads(src[len("window.ECHO_SPECIES="):].strip().rstrip(";"))

def stage_medians(aggregated, species):
    result = {}
    for stage in (1, 2, 3):
        rates = []
        for item in species:
            w, n = aggregated[item["id"]]
            if item["stage"] == stage and n >= 25:
                rates.append(w / n)
        result[stage] = statistics.median(rates) if rates else .5
    return result

def change_stat(source, id, old, new):
    if old == new:
        return source
    pat = re.compile(r'(\{"id":' + str(id) + r',"name":.*?"hp":)(\d+)(,"atk":)(\d+)(,"spd":\d+,"def":)(\d+)')
    def replace(match):
        previous = (int(match.group(2)), int(match.group(4)), int(match.group(6)))
        assert previous == old, ("unexpected stats", id, previous, old)
        return match.group(1) + str(new[0]) + match.group(3) + str(new[1]) + match.group(5) + str(new[2])
    s, n = pat.subn(replace, source, count=1)
    assert n == 1, ("missing species", id)
    return s

def bounded_step(current, original, direction, hp_step, atk_step, def_step):
    # Cap the effect of all 20 rounds relative to the already-reviewed PR #33.
    caps = [(max(10, math.ceil(original[0] * .88)), math.floor(original[0] * 1.15)),
            (max(1, original[1] - 3), original[1] + 3),
            (max(1, original[2] - 3), original[2] + 3)]
    out = tuple(max(lo, min(hi, v + direction * step))
                for v, step, (lo, hi) in zip(current, [hp_step, atk_step, def_step], caps))
    return out

def save_json(path, payload):
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    tmp.replace(path)

def run():
    # Restart safely after a completed simulation but interrupted calibration.
    existing = json.loads(STATUS.read_text(encoding='utf-8')) if STATUS.exists() else None
    if SUMMARY.exists() or (existing and not (existing.get('done') == 0 and
                                                   (OUT / 'round-01.json').exists())):
        raise RuntimeError('Completed rounds already present; refusing to overwrite or repeat them.')
    initial_species = read_species()
    assert len(initial_species) == 150 and [x["id"] for x in initial_species] == list(range(1,151))
    starting = {int(m["id"]): (m["hp"], m["atk"], m["def"]) for m in initial_species}
    save_json(OUT / "starting-stats.json", [
        {"id": m["id"], "name": m["name"], "stage": m["stage"],
         "hp": m["hp"], "atk": m["atk"], "def": m["def"]} for m in initial_species
    ])
    records, history, last_change = [], [], {}
    save_json(STATUS, {"state": "running", "done": 0, "total": TOTAL_ROUNDS, "totalFights": 0})
    for round_no in range(1, TOTAL_ROUNDS + 1):
        print(f"=== TRAIN_ROUND {round_no:02d}/{TOTAL_ROUNDS} START ===", flush=True)
        report_path = OUT / f"round-{round_no:02d}.json"
        if report_path.exists():
            print('RESUME_EXISTING_FINISHED_BATTLES',round_no,flush=True)
        else:
            proc = subprocess.Popen(
                ["node", str(PROJECT / "qa/combat-adaptive-100000.cjs"),
                 f"--round={round_no}"], cwd=str(PROJECT), text=True,
                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, encoding="utf-8", errors="replace"
            )
            for line in proc.stdout:
                print(line.rstrip(), flush=True)
            if proc.wait() != 0:
                save_json(STATUS, {"state": "failed", "done": len(records), "failedRound": round_no,
                                   "totalFights": len(records) * 100000})
                raise RuntimeError(f"Node battle engine failed in round {round_no}")
        report = json.loads(report_path.read_text(encoding="utf-8"))
        assert report["round"] == round_no and report["count"] == 100000
        assert report["timeouts"] == 0 and report["wins"] + report["losses"] == 100000
        assert report["attackerMin"] >= 450 and report["defenderMin"] >= 450
        history.append(report)
        rolling = history[-3:]
        aggregated = {}
        for m in initial_species:
            id = m["id"]
            w = sum(x["species"][id - 1]["sameStage"]["wins"] for x in rolling)
            n = sum(x["species"][id - 1]["sameStage"]["fights"] for x in rolling)
            aggregated[id] = (w, n)
        centers = stage_medians(aggregated, initial_species)
        choices = {"buff": [], "nerf": []}
        for m in initial_species:
            id, stage = m["id"], m["stage"]
            if id in PROTECTED or last_change.get(id, -10) >= round_no - 1:
                continue
            wins, fights = aggregated[id]
            if fights < (55 if stage == 3 else 85):
                continue
            center = centers[stage]
            # Bayesian shrinkage to avoid reacting to a few unlucky pairings.
            smoothed = (wins + center * 65) / (fights + 65)
            delta = smoothed - center
            if delta < -.105:
                choices["buff"].append((abs(delta), id, fights, delta))
            elif delta > .105:
                choices["nerf"].append((abs(delta), id, fights, delta))
        for group in choices.values():
            group.sort(reverse=True)
        selected = choices["buff"][:6] + choices["nerf"][:6]
        selected.sort(reverse=True)
        source = SOURCE.read_text(encoding="utf-8")
        live = read_species()
        edits = []
        for severity, id, fights, delta in selected[:MAX_TUNED_PER_ROUND]:
            old = (live[id - 1]["hp"], live[id - 1]["atk"], live[id - 1]["def"])
            direction = 1 if delta < 0 else -1
            hp_step = 2 if severity > .21 else 1
            atk_step = 1 if severity > .15 and round_no % 2 == 0 else 0
            def_step = 1 if severity > .24 and round_no % 3 == 0 else 0
            new = bounded_step(old, starting[id], direction, hp_step, atk_step, def_step)
            if old == new:
                continue
            source = change_stat(source, id, old, new)
            live[id - 1].update(hp=new[0], atk=new[1], **{"def": new[2]})
            last_change[id] = round_no
            edits.append({"id": id, "name": initial_species[id-1]["name"], "stage": initial_species[id-1]["stage"],
                          "old": list(old), "new": list(new),
                          "deltaToStageMedianPoints": round(delta * 100, 2),
                          "equalStageSample": fights})
        # Verify every other creature attribute is preserved, including attacks and evolution IDs.
        parsed = json.loads(source[len("window.ECHO_SPECIES="):].strip().rstrip(";"))
        assert len(parsed) == 150
        for old, new in zip(initial_species, parsed):
            assert {k:v for k,v in old.items() if k not in ("hp", "atk", "def")} == {
                k:v for k,v in new.items() if k not in ("hp", "atk", "def")}
            assert tuple(new[k] for k in ("hp", "atk", "def")) == tuple(live[new["id"] - 1][k] for k in ("hp", "atk", "def"))
        SOURCE.write_text(source, encoding="utf-8")
        record = {"round": round_no, "fights": report["count"], "wins": report["wins"],
                  "winPct": report["winPct"], "losses": report["losses"],
                  "avgTurns": report["avgTurns"], "timeouts": report["timeouts"],
                  "fingerprint": report["fingerprint"],
                  "sameStageMedians": {str(k): round(v*100, 2) for k,v in centers.items()},
                  "adjustments": edits}
        records.append(record)
        save_json(STATUS, {"state": "running" if round_no < TOTAL_ROUNDS else "complete",
                           "done": round_no, "total": TOTAL_ROUNDS,
                           "totalFights": round_no * 100000,
                           "lastWinPct": report["winPct"], "lastAdjustments": len(edits)})
        print(f"TRAIN_ROUND_FINISHED {round_no}/{TOTAL_ROUNDS} 100000 battles "
              f"{report['wins']} wins, {len(edits)} tuned, 0 timeouts", flush=True)
    final_species = read_species()
    changes = [{"id": m["id"], "name": m["name"], "stage": m["stage"],
                "before": list(starting[m["id"]]),
                "after": [m["hp"], m["atk"], m["def"]]}
               for m in final_species
               if tuple([m["hp"],m["atk"],m["def"]]) != starting[m["id"]]]
    summary = {"rounds": TOTAL_ROUNDS, "fights": TOTAL_ROUNDS * 100000,
               "timeouts": sum(r["timeouts"] for r in records),
               "wins": sum(r["wins"] for r in records),
               "losses": sum(r["losses"] for r in records),
               "adjustmentActions": sum(len(r["adjustments"]) for r in records),
               "speciesAdjusted": len(changes),
               "protectedSpeciesIds": sorted(PROTECTED),
               "finalChanges": changes, "roundResults": records,
               "interpretation": "Progressive random samples vary by round, so winPct drift is not a controlled A/B comparison. Strong improvements must be validated on paired seeds."}
    save_json(SUMMARY, summary)
    print("ADAPTIVE_20_ROUNDS_COMPLETE",json.dumps(
        {k:summary[k] for k in ["rounds","fights","timeouts","wins","losses","adjustmentActions","speciesAdjusted"]}),flush=True)

if __name__=="__main__":
    run()
