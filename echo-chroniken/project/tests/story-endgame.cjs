const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console};
for(const f of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const r=window.EchoMaps,rail=window.EchoRail,end=window.EchoEndgame;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);window.EchoChapter3.register(legacy);window.EchoChapter4.register();
window.EchoChapter5.register();window.EchoStoryRegions.register();assert.equal(end.register(),true);
assert.equal(r.validateNetwork(),true);assert.equal(r.list().length,40);
const s={scene:'OVERWORLD',currentMapId:'capital_outer_gate',safeSpawnId:'from_garden',
 player:{x:22,y:9,dir:'right',stepPhase:0},team:[{id:1,lv:28,hp:85,maxHp:100}],
 chapter3:{completed:true},chapter4:{completed:true,railsReady:true,rail_wurzelheim:true,rail_moorglas:true},
 chapter5:{completed:true},chapter6:{completed:true},chapter7:{completed:true},
 chapter8:{completed:false},orbs:20,potions:6};
const talk=type=>{
 const p=end.markers[s.currentMapId]?.find(x=>x.type===type);
 assert(p,'No marker '+type+' on '+s.currentMapId);
 const out=end.interact(s,p.x,p.y);
 assert(out.lines.length,'Missing dialogue '+type);
 return out;
};
const go=(id,map)=>{
 assert.equal(r.travel(s,id),true,'Travel '+id+' from '+s.currentMapId);
 assert.equal(s.currentMapId,map);
};
assert.equal(r.travel(s,'to_frost'),false,'Frost must be story-locked');
s.chapter8.completed=true;
go('to_frost','frost_approach');go('to_capital','capital_outer_gate');
go('to_frost','frost_approach');
talk('mapPart');talk('lostLetter');go('to_frost_station','frost_station');
assert.match(talk('assembler').lines.join(' '),/Drei Teile/);
talk('scientist');talk('lensPart');talk('batteryPart');
assert.equal(s.chapter9.parts.length,3);
talk('assembler');assert.equal(s.chapter9.phase_lantern,true);
go('to_station_frost','station_frost');assert.equal(talk('train').rail,undefined);
go('to_frost_station','frost_station');go('to_ice_caverns','ice_caverns');
s.player={x:11,y:9,dir:'right',stepPhase:0};
assert.equal(end.regionMove(s,1,0).moved,undefined,'Bridge blocked before activation');
s.player={x:8,y:7,dir:'up',stepPhase:0};
talk('bridgeLeft');assert.equal(s.chapter9.bridgeActive,true);
s.player={x:11,y:9,dir:'right',stepPhase:0};
assert.equal(end.regionMove(s,1,0).moved,true,'Bridge traversable');
assert.equal(end.regionMove(s,1,0).moved,true,'Other bank reachable');
assert.equal(talk('vex').boss,'vexFrost');end.victory(s,'vexFrost');
assert.equal(s.chapter9.vexWon,true);
talk('fatherLog');const o9=s.orbs,p9=s.potions;
talk('caveSignal');assert.equal(s.chapter9.completed,true);
assert.equal(s.orbs,o9+4);assert.equal(s.potions,p9+2);
talk('caveSignal');assert.equal(s.orbs,o9+4);
go('to_under_city','under_city_station');go('to_ice','ice_caverns');
go('to_under_city','under_city_station');
talk('guide');talk('map');assert.equal(talk('train').rail,undefined);
go('to_under_homes','under_city_homes');
talk('member0');talk('member1');talk('miraDrawing');
go('to_mainring','resonance_mainring');
talk('anchorB');talk('anchorA');talk('anchorC');
assert.equal(s.chapter10.anchors.length,3);
talk('power');assert.equal(s.chapter10.powerStable,true);
go('to_vault','continuum_vault');
assert.equal(talk('guardian').boss,'ringGuardian','Battle branch exists');
talk('testimony');assert.equal(talk('guardian').boss,undefined,'Peaceful alternative');
assert.equal(s.chapter10.peaceful,true);assert.equal(s.chapter10.guardianWon,true);
talk('evacuation');assert.equal(s.chapter10.central_ring_offline,true);
const o10=s.orbs;
talk('signal');talk('signal');assert.equal(s.chapter10.completed,true);
assert.equal(s.orbs,o10+4);
go('to_star_ridge','star_ridge');go('to_vault','continuum_vault');
go('to_star_ridge','star_ridge');
talk('stargazer');go('to_observatory','observatory_hall');
talk('projection0');talk('projection1');talk('projection2');
assert.equal(s.chapter11.projections.length,3);
go('to_telescope','observatory_telescope');
talk('dialSTERN');assert.equal(s.chapter11.dial.length,0,'Incorrect order must not advance');
talk('dialWURZEL');talk('dialWASSER');talk('dialSTERN');
talk('telescope');assert.equal(s.chapter11.telescope,true);
go('to_hall','observatory_hall');go('to_roof','observatory_roof');
assert.equal(talk('varek').boss,'varekFirst');
end.victory(s,'varekFirst');assert.equal(s.chapter11.varek_first_defeated,true);
talk('capsule0');talk('capsule1');talk('capsule2');talk('miraLetter');
assert.match(talk('beacon').lines.join(' '),/Nachricht/);
go('to_hall','observatory_hall');talk('fatherMessage');
go('to_roof','observatory_roof');
const o11=s.orbs,p11=s.potions;
talk('beacon');talk('beacon');
assert.equal(s.chapter11.completed,true);assert.equal(s.orbs,o11+5);assert.equal(s.potions,p11+3);
const copy=r.migrateSave(JSON.parse(JSON.stringify(s)));end.ensure(copy);
for(const n of [9,10,11])assert.equal(copy['chapter'+n].completed,true);
assert.equal(copy.chapter9.phase_lantern,true);assert.equal(copy.chapter10.central_ring_offline,true);
assert.equal(copy.chapter11.varek_first_defeated,true);
assert.equal(copy.currentMapId,'observatory_roof');
s.currentMapId='station_frost';assert.equal(talk('train').rail,true);
assert(rail.destinations(s).some(x=>x.id==='under_city_station'));
assert.equal(rail.depart(s,'under_city_station'),true);
assert.equal(s.currentMapId,'under_city_station');
assert.equal(rail.depart(s,'station_frost'),true);
assert.equal(rail.depart(s,'station_kronenstadt'),true);
assert.equal(s.currentMapId,'station_kronenstadt');
assert.equal(rail.depart(s,'under_city_station'),true,'Return via railway');
const solid=new Set([1,4,5,7]);
for(const id of Object.keys(end.names)){
 const m=r.get(id),spawn=m.spawns[Object.keys(m.spawns)[0]];
 const q=[spawn],seen=new Set([spawn.x+','+spawn.y]);
 while(q.length){
  const p=q.shift();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=p.x+dx,y=p.y+dy,k=x+','+y;
   if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||
      solid.has(m.tiles[y][x])||end.markers[id].some(t=>t.x===x&&t.y===y))continue;
   seen.add(k);q.push({x,y});
  }
 }
 for(const e of m.exits)assert(seen.has(e.x+','+e.y),id+' inaccessible exit '+e.exitId);
 for(const p of end.markers[id])assert([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>
  seen.has((p.x+dx)+','+(p.y+dy))),id+' inaccessible marker '+p.type);
}
console.log('PASS Chapters 9-11: 12 playable maps, safe exits, phase bridge, peaceful/battle ring, 3 puzzles, Vex/Varek, unique loot, save v2, two new rail links, BFS reachability');
