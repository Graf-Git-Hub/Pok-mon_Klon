const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},context={window,console};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js','src/maps/chapter5.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const maps=window.EchoMaps,c3=window.EchoChapter3,c4=window.EchoChapter4,c5=window.EchoChapter5,rail=window.EchoRail;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
maps.registerLegacy(legacy);c3.register(legacy);c4.register();assert.equal(c5.register(),true);
assert.equal(maps.list().length,15,'1 legacy + 4 ch3 + 5 ch4 + 5 ch5');
assert.equal(maps.validateNetwork(),true);
function state(){return {scene:'OVERWORLD',currentMapId:'moorglas_bog',
 safeSpawnId:'from_station',player:{x:21,y:9,dir:'right',stepPhase:0},
 chapter3:{completed:true},chapter4:{completed:false,railsReady:true,rail_wurzelheim:true,
 rail_moorglas:true,firstTrip:true,rootBossWon:true,returnTrip:false},
 team:[{id:1,lv:19,hp:80,maxHp:80}],orbs:9,potions:4};}
const s=state();
assert.equal(maps.travel(s,'to_stillwater'),false);
assert(c5.access(s,'to_stillwater'),'Locked route needs an explanation');
s.chapter4.completed=true;
assert.equal(maps.travel(s,'to_stillwater'),true);
assert.equal(s.currentMapId,'moor_to_stillwater');
assert.equal(maps.travel(s,'to_moor'),true);
assert.equal(maps.travel(s,'to_stillwater'),true);
assert.equal(maps.travel(s,'to_town'),true);
assert.equal(s.currentMapId,'stillwasser_town');
const talk=type=>{
 const point=c5.markers[s.currentMapId].find(m=>m.type===type);
 assert(point,'Missing marker '+type+' in '+s.currentMapId);
 return c5.interact(s,point.x,point.y);
};
assert.equal(talk('resident0').changed,true);
assert.equal(s.chapter5.residents[0],1);
assert.equal(talk('resident0').changed,true);
assert.equal(s.chapter5.contradictions.length,1);
assert.equal(talk('resident0').changed,false,'Repeated dialog must not farm state');
assert.equal(maps.travel(s,'to_tower'),false,'Tower is locked until library bypass');
talk('resident1');talk('resident1');talk('resident2');talk('resident2');
assert.equal(s.chapter5.contradictions.length,3);
assert.equal(maps.travel(s,'to_archive'),true);
assert.equal(s.currentMapId,'stillwater_archive');
assert.match(talk('lyra').lines.join(' '),/drei/i);
assert.equal(talk('libraryRoute').changed,true,'Hint counter persisted');
talk('ledger');talk('portrait');talk('diary');talk('diary');
assert.equal(s.chapter5.truthEvidence3,true);
assert.equal(s.chapter5.evidence.length,3);
assert.equal(talk('lyra').changed,true);
assert.equal(s.chapter5.lyraTrusted,true);
assert.equal(talk('libraryRoute').changed,true);
assert.equal(s.chapter5.libraryBypass,true);
assert.equal(maps.travel(s,'to_town'),true);
assert.equal(maps.travel(s,'to_tower'),true);
assert.equal(s.currentMapId,'stillwater_tower');
assert.equal(talk('mirror').boss,undefined,'Mirror must require power disconnect');
assert.equal(talk('antenna').changed,false);
assert.equal(talk('cable').changed,true);
assert.equal(talk('mirror').boss,'mirror');
assert.equal(c5.victory(s,'mirror').length,2);
assert.equal(talk('mirror').boss,undefined,'Mirror cannot repeat');
assert.equal(talk('lyraDuel').boss,'lyra','Optional challenge becomes available');
assert.equal(c5.victory(s,'lyra').length,2);
assert.equal(talk('lyraDuel').boss,undefined);
const beforeOrbs=s.orbs,beforePotions=s.potions;
assert.equal(talk('antenna').changed,true);
assert.equal(s.chapter5.completed,true);
assert.equal(s.chapter5.rail_stillwasser,true);
assert.equal(s.chapter5.truthEvidence3,true);
assert.equal(s.orbs,beforeOrbs+5);assert.equal(s.potions,beforePotions+3);
assert.equal(talk('antenna').changed,false,'Quest reward once');
assert.equal(s.orbs,beforeOrbs+5);
assert.equal(maps.travel(s,'to_town'),true);
assert.equal(maps.travel(s,'to_station'),true);
assert.equal(s.currentMapId,'station_stillwasser');
assert.equal(talk('train').rail,true);
assert.deepEqual(Array.from(rail.destinations(s),x=>x.id),['station_moorglas','station_wurzelheim']);
assert.equal(rail.depart(s,'station_moorglas'),true);
assert.equal(rail.depart(s,'station_stillwasser'),true);
assert.equal(s.currentMapId,'station_stillwasser');
assert.equal(s.orbs,beforeOrbs+5,'Rail should not grant new rewards');
const loaded=maps.migrateSave(JSON.parse(JSON.stringify(s)));c5.ensure(loaded);
assert.equal(loaded.chapter5.completed,true);
assert.equal(loaded.chapter5.contradictions.length,3);
assert.equal(loaded.chapter5.evidence.length,3);
assert.equal(loaded.currentMapId,'station_stillwasser');
const locked=state();locked.chapter4.completed=true;
locked.currentMapId='station_moorglas';
assert.equal(rail.depart(locked,'station_stillwasser'),false,'Train locked before ending');
const solid=new Set([1,4,5,7]);
for(const mapId of Object.keys(c5.names)){
 const m=maps.get(mapId),sp=m.spawns[Object.keys(m.spawns)[0]];
 const seen=new Set([sp.x+','+sp.y]),queue=[sp];
 while(queue.length){
  const p=queue.shift();
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
   const x=p.x+dx,y=p.y+dy,k=x+','+y;
   if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||solid.has(m.tiles[y][x]))continue;
   seen.add(k);queue.push({x,y});
  }
 }
 for(const e of m.exits)assert(seen.has(e.x+','+e.y),mapId+' inaccessible exit '+e.exitId);
 for(const p of c5.markers[mapId]){
  const adj=[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>seen.has((p.x+dx)+','+(p.y+dy)));
  assert(adj,mapId+' inaccessible interaction '+p.type);
 }
}
console.log('PASS Chapter 5: five maps, two-way portals, repeated residents, three clues, library access, bosses, one-time rewards, rail extension, safe save and all interaction points');
