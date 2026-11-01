"""Validation for Echo-Chroniken design bible. Run from any directory."""
from pathlib import Path
from collections import Counter
import csv,json,re
R=Path(__file__).resolve().parent
repo=R.parents[2]
species_file=repo/'echo-chroniken/project/data/species.js'
species=json.loads(species_file.read_text(encoding='utf-8').split('=',1)[1].rstrip().rstrip(';'))
assert len(species)==150 and sorted(s['id'] for s in species)==list(range(1,151))
with (R/'MONSTER_DISTRIBUTION.csv').open(encoding='utf-8-sig',newline='') as f:
    records=list(csv.DictReader(f,delimiter=';'))
assert len(records)==150
assert sorted(int(row['id']) for row in records)==list(range(1,151))
for row,src in zip(sorted(records,key=lambda x:int(x['id'])),species):
    assert int(row['id'])==src['id'] and row['name_im_code']==src['name']
    assert row['familie_im_code']==src['family']
    assert int(row['stufe'])==src['stage']
    assert str(row['entwicklung_zu_id'])==str(src['evolvesTo'] or '')
    assert row['primär_region_id']
assert sum(row['name_status'].startswith('OFFEN') for row in records)==50
with (R/'PRODUCTION_TASKS.csv').open(encoding='utf-8-sig',newline='') as f:
    tasks=list(csv.DictReader(f,delimiter=';'))
ids=[x['id'] for x in tasks]
assert len(ids)>=30 and len(ids)==len(set(ids))
assert next(t for t in tasks if t['id']=='M00-01')['status']=='DONE'
assert next(t for t in tasks if t['id']=='M00-02')['status']=='DONE'
assert next(t for t in tasks if t['id']=='M01-03')['status']=='DONE'
for t in tasks:
    for dep in t['dependsOn'].split(','):
        if dep and dep!='-':assert dep in ids,(t['id'],dep)
world=json.loads((R/'WORLD_GRAPH.json').read_text(encoding='utf-8'))
nodes={n['mapId'] for n in world['nodes']}
assert len(nodes)==len(world['nodes'])
assert len(world['stations'])==8 and len(world['railConnections'])==7
assert all(e['fromMapId'] in nodes and e['toMapId'] in nodes and e['safeReturn'] for e in world['edges'])
assert all(n['mapId'] in nodes and n['surfaceMapId'] in nodes for n in world['stations'])
assert all(a['fromMapId']!='resonance_core' or a['toMapId']!='epilogue_wurzelheim' or a['requiredFlag']=='main_story_finished' for a in world['edges'])
assert len(list((R/'CHAPTERS').glob('CH[0-9][0-9].md')))==14
assert (R/'CHAPTERS/POSTGAME.md').exists()
for i in range(1,15):
    content=(R/f'CHAPTERS/CH{i:02d}.md').read_text(encoding='utf-8')
    assert f'CH{i:02d}.S01' in content and 'Definition of Done' in content
for f in R.rglob('*.md'):
    c=f.read_text(encoding='utf-8')
    assert c.strip() and '\x00' not in c
    for link in re.findall(r'\[[^\]]+\]\(([^)]+)\)',c):
        if link.startswith(('https://','http://','#','mailto:')):continue
        dest=(f.parent/link.split('#',1)[0])
        if link and not dest.exists():raise AssertionError(f'Broken link in {f}: {link}')
index=(R/'00_INDEX.md').read_text(encoding='utf-8')
assert 'CONTINUE_HERE.md' in index and 'CHAPTERS/CH14.md' in index
cont=(R/'CONTINUE_HERE.md').read_text(encoding='utf-8')
assert 'M01-04' in cont and 'M01-03' in cont
print(f'PASS story documentation: 150 species, 14+postgame chapters, {len(nodes)} maps, {len(world["edges"])} edges, 8 stations, 7 rail links, {len(tasks)} tasks and all internal links')
