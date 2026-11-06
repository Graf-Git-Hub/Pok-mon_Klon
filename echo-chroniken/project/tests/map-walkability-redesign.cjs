const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},context={window,console};
for(const filename of ['src/maps/registry.js','src/maps/chapter3.js']){
  vm.runInNewContext(fs.readFileSync(filename,'utf8'),context,{filename});
}
const registry=window.EchoMaps,chapter=window.EchoChapter3;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
registry.registerLegacy(legacy);
chapter.register(legacy);
assert(registry.validateNetwork());
const forbidden=new Set([1,4,5,7]);
function distances(map,from){
  const dist=Array.from({length:map.height},()=>Array(map.width).fill(-1));
  const queue=[from];dist[from.y][from.x]=0;
  for(let head=0;head<queue.length;head++){
    const p=queue[head];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const x=p.x+dx,y=p.y+dy;
      if(x<0||y<0||x>=map.width||y>=map.height||dist[y][x]>=0||
        forbidden.has(map.tiles[y][x]))continue;
      dist[y][x]=dist[p.y][p.x]+1;queue.push({x,y});
    }
  }
  return dist;
}
for(const [id,start,finish,minSteps,minWidth,minHeight] of [
  ['lake_north_path','from_village','to_harbor',42,48,28],
  ['nebelhafen_town','west_gate','to_pumpworks',45,52,30]
]){
  const map=registry.get(id),markers=chapter.markers[id];
  assert(map.width>=minWidth&&map.height>=minHeight,
    id+': must be significantly larger, actual '+map.width+'x'+map.height);
  const from=map.spawns[start],target=map.exits.find(x=>x.exitId===finish);
  const dist=distances(map,from);
  const steps=dist[target.y][target.x];
  assert(steps>=minSteps,id+': route still too short: '+steps+' tiles');
  for(const mark of markers){
    const nearby=[[0,0],[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>
      dist[mark.y+dy]?.[mark.x+dx]>=0);
    assert(nearby,id+' marker inaccessible: '+mark.type);
  }
  const reachable=dist.flat().filter(d=>d>=0).length;
  assert(reachable>=Math.floor(map.width*map.height*.35),id+': too little explorable area');
  for(const e of map.exits)assert(dist[e.y][e.x]>=0,id+': blocked physical exit '+e.exitId);
  console.log('MAP_REDESIGN_PASS',id,map.width+'x'+map.height,
    'shortest_route_steps='+steps,'reachable_cells='+reachable,'markers='+markers.length);
}
console.log('MAP_REDESIGN_PASS total=2 original_spawns_and_story_exits_preserved, long_routes, reachable NPCs');
