"""Evolution-aware, per-individual level challenge for real test playthroughs.

A species ID changes after evolution; an individual does not reset its level.
Slots stay stable throughout this early-game gate (no party swaps are allowed).
"""
def make_requirements(initial_team, species, bonus):
    if not isinstance(initial_team,list) or not initial_team:raise ValueError("Missing team")
    if not isinstance(bonus,int) or bonus<0:raise ValueError("Invalid level bonus")
    evolution={int(s["id"]):s.get("evolvesTo") for s in species}
    targets=[]
    for slot,member in enumerate(initial_team):
        original_id=int(member["id"])
        stage_ids=[original_id]
        following=evolution.get(original_id)
        while following and following not in stage_ids:
            if len(stage_ids)>3:raise ValueError("Invalid evolution chain")
            stage_ids.append(int(following))
            following=evolution.get(int(following))
        targets.append({
            "slot":slot,"id":original_id,
            "goal":int(member["lv"])+bonus,
            "lineage":stage_ids
        })
    return targets

def meets_level_gate(team, requirements):
    if not isinstance(team,list) or len(team)<len(requirements):return False
    for rule in requirements:
        slot=rule["slot"]
        member=team[slot]
        if int(member["id"]) not in rule["lineage"]:return False
        if int(member["lv"])<rule["goal"]:return False
    return True

def summary(team):
    return {f'{i}:{member["id"]}':member["lv"] for i,member in enumerate(team)}
