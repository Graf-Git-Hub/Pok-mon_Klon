"""Independent seed-21 before/after audit without modifying the live species file."""
import json
import pathlib
import statistics
import subprocess

PROJECT = pathlib.Path(__file__).resolve().parents[1]
WORKTREE = PROJECT.parent.parent
OUT = PROJECT.parent / "docs/visual-audit/adaptive-balance"
SUMMARY = OUT / "summary.json"
assert SUMMARY.exists(), "All 20 rounds must complete before the holdout."

def run_battles(label, species_file=None):
    args = ["node", str(PROJECT / "qa/combat-adaptive-audit-100000.cjs"),
            "--round=21", "--label=" + label]
    if species_file:
        args += ["--species-file=" + str(species_file)]
    print("INDEPENDENT_HOLDOUT_START",label,flush=True)
    proc = subprocess.run(args, cwd=PROJECT, capture_output=True, text=True)
    print(proc.stdout[-3000:],flush=True)
    if proc.returncode:
        print(proc.stderr[-1200:],flush=True)
        raise RuntimeError(label + " holdout test failed")
    return json.loads((OUT / ("holdout-" + label + ".json")).read_text(encoding="utf-8"))

source = subprocess.check_output(
    ["git", "show", "HEAD:echo-chroniken/project/data/species.js"],
    cwd=WORKTREE
)
baseline_path = OUT / "initial-species.js"
baseline_path.write_bytes(source)
before = run_battles("before", baseline_path)
after = run_battles("after")

assert before["count"] == after["count"] == 100000
assert before["timeouts"] == after["timeouts"] == 0
assert before["equalLevelFights"] == after["equalLevelFights"]
assert [x["sameStage"]["fights"] for x in before["species"]] == [
    x["sameStage"]["fights"] for x in after["species"]]
assert len(before["species"]) == len(after["species"]) == 150

def dispersion(report):
    centers = {}
    for stage in (1,2,3):
        rates = [x["sameStage"]["wins"]/x["sameStage"]["fights"]
                 for x in report["species"]
                 if x["stage"] == stage and x["sameStage"]["fights"] >= 25]
        centers[stage] = statistics.median(rates) if rates else .5
    total_dev, weight, outside = 0, 0, 0
    rates_by_stage = {}
    for row in report["species"]:
        n = row["sameStage"]["fights"]
        if n < 25:
            continue
        win_rate = row["sameStage"]["wins"] / n
        gap = abs(win_rate - centers[row["stage"]])
        total_dev += gap * n
        weight += n
        if gap > .18:
            outside += 1
        rates_by_stage[row["id"]] = {"games": n, "rate": round(win_rate * 100,2),
                                    "gapToStageMedian": round(gap * 100,2)}
    return {
        "weightedMeanAbsGapPoints": round(total_dev / weight * 100, 3),
        "speciesMoreThan18PointsFromStageMedian": outside,
        "stageMediansPct": {str(k):round(v*100,2) for k,v in centers.items()},
        "species": rates_by_stage
    }

b = dispersion(before)
a = dispersion(after)
comparison = {
    "label": "100k independently seeded equal-fixture holdout, run 21",
    "fightsEach":100000,
    "beforeWins":before["wins"],"afterWins":after["wins"],
    "beforeTimeouts":before["timeouts"],"afterTimeouts":after["timeouts"],
    "beforeFingerprint":before["fingerprint"],"afterFingerprint":after["fingerprint"],
    "beforeWeightedMeanAbsGapPoints":b["weightedMeanAbsGapPoints"],
    "afterWeightedMeanAbsGapPoints":a["weightedMeanAbsGapPoints"],
    "gapChangePoints":round(a["weightedMeanAbsGapPoints"]-b["weightedMeanAbsGapPoints"],3),
    "beforeOutside18":b["speciesMoreThan18PointsFromStageMedian"],
    "afterOutside18":a["speciesMoreThan18PointsFromStageMedian"],
    "beforeStageMedians":b["stageMediansPct"],
    "afterStageMedians":a["stageMediansPct"],
    "speciesChanges":[{"id":x["id"],"name":x["name"],"stage":x["stage"],
                     "beforePct":round(x["sameStage"]["wins"]/x["sameStage"]["fights"]*100,2) if x["sameStage"]["fights"] else None,
                     "afterPct":round(after["species"][i]["sameStage"]["wins"]/after["species"][i]["sameStage"]["fights"]*100,2) if after["species"][i]["sameStage"]["fights"] else None}
                   for i,x in enumerate(before["species"])]
}
(OUT / "holdout-comparison.json").write_text(json.dumps(comparison,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("INDEPENDENT_HOLDOUT_COMPARISON",json.dumps({k:v for k,v in comparison.items()
    if k not in ("speciesChanges",)},ensure_ascii=False),flush=True)
