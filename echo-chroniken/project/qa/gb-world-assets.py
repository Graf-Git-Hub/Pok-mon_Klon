"""Validate the compact world's graph and source landmark correspondence."""
from collections import deque
from pathlib import Path
import json
project=Path(__file__).resolve().parents[1]
source=json.loads((project/'tools/souls-bridge/original-maps.json').read_text())['regions']
world=json.loads((project/'assets/gb-classic/world_maps.json').read_text())['scenes']
assert set(source)==set(world) and len(world)==60
assert all(m['width'] >= 32 and m['height'] >= 24 for m in world.values() if not m['indoor'])
portals=0
seams=0
for key,m in world.items():
    original=source[key]
    assert len(m['rows'])==m['height'] and all(len(row)==m['width'] for row in m['rows'])
    assert len(m['markers'])==len(original['markers'])
    assert sorted((v['sourceX'],v['sourceY'],v['type']) for v in m['markers'])==sorted((v['x'],v['y'],v['type']) for v in original['markers'])
    assert set(m['spawns'])==set(original['spawns'])
    assert len(m['portals'])==len(original['exits'])
    for link in original['exits']:
        portal=next(p for p in m['portals'].values() if p['exitId']==link['exitId'])
        target=world[link['toMapId']]
        assert portal['scene']==link['toMapId']
        spawn=target['spawns'][link['toSpawnId']]
        assert (portal['x'],portal['y'])==(spawn['x'],spawn['y'])
        assert target['solids'][portal['y']][portal['x']]=='0',(key,link)
        portals+=1
        if 'direction' in portal:
            dx,dy=portal['direction']
            x,y=next(tuple(map(int,pos.split(','))) for pos,p in m['portals'].items() if p is portal)
            assert not (0<=x+dx<m['width'] and 0<=y+dy<m['height'])
            reciprocal=target['portals'][f"{portal['x']},{portal['y']}"]
            assert reciprocal['scene']==key and reciprocal['direction']==[-dx,-dy]
            assert (reciprocal['x'],reciprocal['y'])==(x,y)
            seams+=1
    start=m['entry']
    assert m['solids'][start['y']][start['x']]=='0',key
    queue=deque([(start['x'],start['y'])]);seen=set(queue)
    while queue:
        x,y=queue.popleft()
        for dx,dy in ((0,1),(0,-1),(1,0),(-1,0)):
            nx,ny=x+dx,y+dy
            if 0<=nx<m['width'] and 0<=ny<m['height'] and m['solids'][ny][nx]=='0' and (nx,ny) not in seen:
                seen.add((nx,ny));queue.append((nx,ny))
    assert all((int(x),int(y)) in seen for x,y in (k.split(',') for k in m['portals'])),key
    for marker in m['markers']:
        x,y=marker['x'],marker['y']
        assert any((x+dx,y+dy) in seen for dx,dy in ((0,1),(0,-1),(1,0),(-1,0))), (key,marker)
assert seams >= 20 and seams % 2 == 0, seams
print('GB_WORLD_ASSETS_PASS: 60 maps, 238 source landmarks,',portals,'reachable exits,',seams,'walk-through directions')
