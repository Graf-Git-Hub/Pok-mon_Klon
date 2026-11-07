const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},context={window,console};
for(const f of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),context,{filename:f});
const m=window.EchoMaps,c3=window.EchoChapter3,c4=window.EchoChapter4,rail=window.EchoRail;
const world=Array.from({length:28},()=>Array(36).fill(0));
m.registerLegacy(world);c3.register(world);assert.equal(c4.register(),true);
assert.equal(m.list().length,10,'1 legacy + 4 ch3 + 5 ch4');
function state(){return {scene:'OVERWORLD',currentMapId:'pumpworks_controlroom',
 safeSpawnId:'entry',player:{x:11,y:6,dir:'right',stepPhase:0},
 chapter3:{completed:true,maintenance_token:true},
 team:[{id:1,lv:13,hp:64,maxHp:64}],orbs:8,potions:3};}
const s=state();
const tunnelPortal=m.get('pumpworks_controlroom').exits.find(e=>e.exitId==='to_tunnel');
assert.equal(m.getExitAt('pumpworks_controlroom',tunnelPortal.x,tunnelPortal.y).exitId,'to_tunnel');
assert.equal(m.travel(s,'to_tunnel'),true);
assert.equal(s.currentMapId,'root_tunnel');
assert.equal(m.travel(s,'to_pump'),true);
assert.equal(m.travel(s,'to_tunnel'),true);
assert.equal(m.travel(s,'to_station'),true);
assert.equal(s.currentMapId,'station_wurzelheim');
assert.equal(rail.destinations(s).length,0,'No unlocked railway before switches');
assert.equal(m.travel(s,'to_yard'),true);
const talk=type=>{
 const mark=c4.markers[s.currentMapId].find(x=>x.type===type);
 assert(mark,'Missing '+s.currentMapId+':'+type);
 return c4.interact(s,mark.x,mark.y);
};
assert.match(talk('switchB').lines[0],/sperrt/);
talk('switchA');talk('switchC');talk('switchC');talk('switchB');
assert.equal(s.chapter4.switches.join(''), 'ACB','Cannot repeat switches');
assert.equal(s.chapter4.railsReady,true);
assert.equal(s.chapter4.rail_wurzelheim,true);
assert.equal(m.travel(s,'to_station'),true);
assert.equal(talk('train').rail,true);
assert.deepEqual(Array.from(rail.destinations(s),x=>x.id),['station_moorglas']);
assert.equal(rail.depart(s,'not_a_station'),false);
assert.equal(s.currentMapId,'station_wurzelheim');
assert.equal(rail.depart(s,'station_moorglas'),true);
assert.equal(s.chapter4.rail_moorglas,true);
assert.equal(s.currentMapId,'station_moorglas');
assert.equal(rail.destinations(s).length,1,'Return train cannot vanish');
assert.equal(m.travel(s,'to_bog'),true);
assert.equal(s.currentMapId,'moorglas_bog');
assert.equal(talk('rootBoss').boss,undefined,'Locked until courier');
assert.equal(talk('courier').boss,'courier');
c4.victory(s,'courier');
assert.equal(talk('courier').boss,undefined,'No repeated courier fight');
assert.equal(talk('rootBoss').boss,'root');
c4.victory(s,'root');
assert.equal(talk('rootBoss').boss,undefined,'No repeated root fight');
assert.equal(m.travel(s,'to_station'),true);
assert.equal(rail.depart(s,'station_wurzelheim'),true);
assert.equal(s.chapter4.completed,true);
assert.equal(s.chapter4.returnTrip,true);
assert.equal(s.potions,6);
assert.equal(s.orbs,14);
assert.equal(rail.depart(s,'station_moorglas'),true);
assert.equal(rail.depart(s,'station_wurzelheim'),true);
assert.equal(s.potions,6,'Repeat train must not farm');
assert.equal(s.orbs,14,'Repeat train must not farm');
const saved=JSON.parse(JSON.stringify(s));
const loaded=m.migrateSave(saved);c4.ensure(loaded);
assert.equal(loaded.chapter4.completed,true);
assert.equal(loaded.currentMapId,'station_wurzelheim');
assert.equal(loaded.chapter4.switches.join(''),'ACB');
assert.equal(rail.depart({...state(),chapter4:initialSafe()},'station_moorglas'),false);
function initialSafe(){return {railsReady:false,rail_wurzelheim:false,rail_moorglas:false}}
const locked=state();locked.chapter3.completed=false;
assert.equal(m.travel(locked,'to_tunnel'),false,'Cannot bypass Chapter 3 ending');
assert.equal(locked.currentMapId,'pumpworks_controlroom');
const solid=new Set([1,4,5,7]);
for(const id of m.list()){
 if(!c4.names[id])continue;
 const map=m.get(id),spawn=map.spawns[Object.keys(map.spawns)[0]];
 const seen=new Set([spawn.x+','+spawn.y]),queue=[spawn];
 while(queue.length){
  const p=queue.shift();
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
   const x=p.x+dx,y=p.y+dy,key=x+','+y;
   if(x<0||y<0||x>=map.width||y>=map.height||seen.has(key)||solid.has(map.tiles[y][x]))continue;
   seen.add(key);queue.push({x,y});
  }
 }
 for(const edge of map.exits)assert(seen.has(edge.x+','+edge.y),id+' inaccessible exit '+edge.exitId);
 for(const marker of c4.markers[id]){
  const near=[[0,1],[1,0],[0,-1],[-1,0]].some(([dx,dy])=>seen.has((marker.x+dx)+','+(marker.y+dy)));
  assert(near,id+' inaccessible interaction '+marker.type);
 }
}
console.log('PASS: Chapter 4 all 5 maps, reciprocal links, A-C-B puzzle, rail graph, 2 fights, save/reload, unique reward, all exits reachable');
