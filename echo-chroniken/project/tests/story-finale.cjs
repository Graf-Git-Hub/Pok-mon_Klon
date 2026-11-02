const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console};
for(const f of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js',
 'src/maps/story-finale.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const r=window.EchoMaps,final=window.EchoFinale;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);window.EchoChapter3.register(legacy);window.EchoChapter4.register();
window.EchoChapter5.register();window.EchoStoryRegions.register();window.EchoEndgame.register();
assert.equal(final.register(),true);assert.equal(r.validateNetwork(),true);
assert.equal(r.list().length,52,'40 old maps + 12 finale maps');
const s={scene:'OVERWORLD',currentMapId:'observatory_roof',safeSpawnId:'from_hall',
 player:{x:23,y:12,dir:'right',stepPhase:0},
 team:[{id:2,lv:45,hp:45,maxHp:100}],orbs:10,potions:6,
 chapter3:{completed:true},chapter4:{completed:true},chapter5:{completed:true},
 chapter6:{completed:true},chapter7:{completed:true},chapter8:{completed:true},
 chapter9:{completed:true,phase_lantern:true},chapter10:{completed:true},
 chapter11:{completed:false},badges:0,main_story_finished:false};
const talk=(id)=>{
 const p=final.markers[s.currentMapId].find(x=>x.type===id);
 assert(p,'Marker missing '+id+' in '+s.currentMapId);
 const out=final.interact(s,p.x,p.y);
 assert(out.lines?.length,'Dialog missing '+id);
 return out;
};
const go=(exit,to)=>{
 assert.equal(r.travel(s,exit),true,'Exit '+exit+' from '+s.currentMapId);
 assert.equal(s.currentMapId,to);
};
assert.equal(r.travel(s,'to_family'),false,'Chapter 11 gate must hold');
s.chapter11.completed=true;go('to_family','martha_house');
assert.equal(r.travel(s,'to_observatory'),true);go('to_family','martha_house');
talk('letter');talk('musicBox');talk('martha');
go('to_memory','memory_room');assert.match(talk('memoryMirror').lines.join(' '),/mindestens/);
talk('picture0');talk('picture1');talk('picture2');
assert.match(talk('memoryMirror').lines.join(' '),/Seelara/);
talk('safetyLatch');assert.equal(s.chapter12.latchOpen,true);
go('to_martha','martha_house');go('to_garden','old_family_garden');
assert.equal(r.travel(s,'to_shaft'),false);
talk('mioraChoice');const before=s.orbs;
talk('shaftKey');talk('shaftKey');assert.equal(s.chapter12.completed,true);
assert.equal(s.orbs,before+4,'Chapter 12 unique reward');
talk('evening');go('to_house','martha_house');go('to_garden','old_family_garden');
go('to_shaft','shaft_entry');talk('shaftGuide');talk('elevator');
go('to_level1','shaft_level1');talk('anchorW');talk('rootMemo');talk('lanternShortcut');
go('to_level2','shaft_level2');talk('anchorA');
assert.equal(talk('shaftGuard').boss,'shaftGuardian');
final.victory(s,'shaftGuardian');assert.equal(s.chapter13.guardianWon,true);
go('to_anchors','shaft_anchors');assert.equal(r.travel(s,'to_father'),false);
talk('anchorS');talk('escapeSwitch');assert.equal(s.chapter13.anchorsDisabled,true);
go('to_father','father_chamber');
assert.match(talk('father').lines.join(' '),/Seelara/);
talk('protectionCode');const p13=s.potions;
talk('finalPreparation');talk('finalPreparation');assert.equal(s.chapter13.completed,true);
assert.equal(s.potions,p13+4,'Chapter 13 unique reward');
go('to_core','core_access');talk('warning');talk('machinePhase');
go('to_reflections','memory_reflections');
assert.equal(r.travel(s,'to_core'),false);
talk('flash2');talk('flash0');talk('flash1');talk('miraLetter');
assert.equal(s.chapter14.memoriesReady,true);
go('to_core','resonance_core');
assert.equal(talk('varekFinal').boss,'varekFinal');
final.victory(s,'varekFinal');assert.equal(s.chapter14.varekWon,true);
talk('free0');talk('free1');talk('free2');
talk('farewell');const o14=s.orbs;
talk('releaseSignal');talk('releaseSignal');
assert.equal(s.chapter14.completed,true);assert.equal(s.main_story_finished,true);
assert.equal(s.orbs,o14+6,'Chapter 14 unique reward');
go('to_epilogue','epilogue_wurzelheim');
talk('marthaEpilogue');talk('friends');talk('credits');talk('journal');
assert.equal(s.chapter14.credits,true);
go('to_family_garden','old_family_garden');go('to_epilogue','epilogue_wurzelheim');
go('to_core','resonance_core');go('to_reflections','memory_reflections');
go('to_access','core_access');go('to_father','father_chamber');
const copy=r.migrateSave(JSON.parse(JSON.stringify(s)));final.ensure(copy);
assert.equal(copy.main_story_finished,true);
for(const n of [12,13,14])assert.equal(copy['chapter'+n].completed,true);
assert.equal(copy.chapter13.anchors.length,3);assert.equal(copy.chapter14.freed.length,3);
assert.equal(copy.chapter12.pictures.length,3);
assert.equal(copy.team[0].id,2,'Miora evolution preserved');
assert.equal(copy.badges,0,'Existing gym flags preserved');
const solid=new Set([1,4,5,7]);
for(const id of Object.keys(final.names)){
 const m=r.get(id),spawn=m.spawns[Object.keys(m.spawns)[0]];
 const queue=[spawn],seen=new Set([spawn.x+','+spawn.y]);
 while(queue.length){
  const p=queue.shift();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=p.x+dx,y=p.y+dy,k=x+','+y;
   if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||
    solid.has(m.tiles[y][x])||final.markers[id].some(t=>t.x===x&&t.y===y))continue;
   seen.add(k);queue.push({x,y});
  }
 }
 for(const e of m.exits)assert(seen.has(e.x+','+e.y),id+' unreachable exit '+e.exitId);
 for(const p of final.markers[id])assert([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>
  seen.has((p.x+dx)+','+(p.y+dy))),id+' unreachable interaction '+p.type);
}
for(const id of [1,2,3]){
 const state={currentMapId:'memory_room',player:{x:12,y:11},team:[{id,lv:20}],
  chapter12:{martha:true,pictures:[0]},chapter11:{completed:true}};
 const out=final.interact(state,12,12);
 assert(out.lines.join(' ').includes(['','Miora','Seelara','Maternalis'][id]),'evolution-safe mother line '+id);
}
console.log('PASS Finale 12-14: 12 maps, chapter gates, 3 puzzles, 2 boss flags, reversible exits, save v2, 3 mother forms, 3 unique rewards, BFS');
