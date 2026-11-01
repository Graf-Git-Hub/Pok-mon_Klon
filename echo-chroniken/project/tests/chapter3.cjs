const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},context={window,console};
for(const filename of ['src/maps/registry.js','src/maps/chapter3.js'])
  vm.runInNewContext(fs.readFileSync(filename,'utf8'),context,{filename});
const maps=window.EchoMaps,chapter=window.EchoChapter3;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
maps.registerLegacy(legacy);
assert.equal(chapter.register(legacy),true);
assert.equal(maps.list().length,5,'legacy + four Chapter-3 maps');
assert.equal(legacy[9][24],3,'gate is walkable after map setup');
assert.deepEqual(Array.from(maps.list()).sort(),[
 'legacy_wurzeldorf','lake_north_path','nebelhafen_town','pumpworks_floor1','pumpworks_controlroom'
].sort());
assert.equal(maps.validateNetwork(),true);
function state(){return {
  currentMapId:'legacy_wurzeldorf',scene:'OVERWORLD',
  player:{x:24,y:10,dir:'up',stepPhase:0},
  ruinsProgress:{bossWon:false},
  team:[{id:1,lv:9,hp:44,maxHp:44}],
  potions:2,orbs:3
};}
const s=state();
const gate=maps.getExitAt(s.currentMapId,24,9);
assert.equal(gate.exitId,'to_lake');
assert(chapter.access(s,'to_lake'),'uncompleted ruins must gate lake');
assert.equal(maps.travel(s,'to_lake'),false,'registry prevents bypassing story flag');
s.ruinsProgress.bossWon=true;
assert.equal(chapter.access(s,'to_lake'),null);
assert.equal(maps.travel(s,'to_lake'),true);
assert.equal(s.currentMapId,'lake_north_path');
assert.equal(maps.travel(s,'to_village'),true);
assert.equal(s.currentMapId,'legacy_wurzeldorf');
assert.equal(s.player.x,24);assert.equal(s.player.y,10);
assert.equal(maps.travel(s,'to_lake'),true);
assert.equal(maps.travel(s,'to_harbor'),true);
assert.equal(s.currentMapId,'nebelhafen_town');
assert(chapter.access(s,'to_pumpworks'));
assert.equal(maps.travel(s,'to_pumpworks'),false);
function talk(type){const m=chapter.markers[s.currentMapId].find(p=>p.type===type);assert(m,type);return chapter.interact(s,m.x,m.y);}
assert.match(talk('witness0').lines[0],/Sera/);
talk('sera');
talk('witness0');talk('witness1');talk('witness2');talk('witness2');
assert.equal(s.chapter3.witnesses.length,3,'repeat witness should not duplicate');
assert.equal(s.chapter3.witnessesReady,true);
assert.equal(maps.travel(s,'to_pumpworks'),true);
assert.equal(s.currentMapId,'pumpworks_floor1');
assert.equal(maps.travel(s,'to_control'),false,'water barrier is real');
assert.match(talk('valve0').lines[0],/Strom/);
talk('power');talk('valve0');talk('valve1');
assert.equal(s.chapter3.valves.length,2);
talk('rotor');
assert.equal(s.chapter3.waterLowered,true);
assert.equal(maps.travel(s,'to_control'),true);
assert.equal(s.currentMapId,'pumpworks_controlroom');
assert.equal(talk('recording').changed,false,'audio must be locked before boss victory');
assert.equal(talk('boss').boss,true);
chapter.victory(s);
assert.equal(talk('boss').boss,undefined,'do not replay defeated boss');
const reward=talk('recording');
assert.equal(reward.changed,true);
assert.equal(s.chapter3.completed,true);assert.equal(s.chapter3.maintenance_token,true);
assert.equal(s.potions,4);assert.equal(s.orbs,6);
assert.equal(talk('recording').changed,false);
assert.equal(s.potions,4);assert.equal(s.orbs,6);
const saved=JSON.parse(JSON.stringify(s));
const loaded=maps.migrateSave(saved);chapter.ensure(loaded);
assert.equal(loaded.currentMapId,'pumpworks_controlroom');
assert.equal(loaded.chapter3.completed,true);
assert.equal(maps.travel(s,'to_pump'),true);
assert.equal(maps.travel(s,'to_town'),true);
assert.equal(maps.travel(s,'to_lake_path'),true);
assert.equal(maps.travel(s,'to_village'),true);
assert.equal(s.currentMapId,'legacy_wurzeldorf');
// Check every exit destination, map border and point approach is reachable.
const solid=new Set([1,4,5,7]);
for(const id of maps.list()){
 const map=maps.get(id);
 for(const edge of map.exits){
  assert(map.tiles[edge.y]?.[edge.x]!==undefined,id+': exit out of bounds');
  assert(!solid.has(map.tiles[edge.y][edge.x]),id+': exit blocked');
 }
 if(id==='legacy_wurzeldorf')continue;
 const sp=map.spawns[Object.keys(map.spawns)[0]];
 const reached=new Set([sp.x+','+sp.y]),queue=[sp];
 while(queue.length){
  const cur=queue.shift();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=cur.x+dx,y=cur.y+dy,k=x+','+y;
   if(x<0||y<0||x>=map.width||y>=map.height||reached.has(k)||solid.has(map.tiles[y][x]))continue;
   reached.add(k);queue.push({x,y});
  }
 }
 for(const e of map.exits)assert(reached.has(e.x+','+e.y),id+': unreachable exit '+e.exitId);
 for(const marker of chapter.markers[id]){
  const adjacent=[[0,1],[1,0],[0,-1],[-1,0]].some(([dx,dy])=>reached.has((marker.x+dx)+','+(marker.y+dy)));
  assert(adjacent,id+': inaccessible interaction '+marker.type);
 }
}
console.log('PASS: Chapter 3 four playable maps, 8 reversible exits, gated story, pump puzzle, boss, unique loot, reload, all interaction points reachable');
