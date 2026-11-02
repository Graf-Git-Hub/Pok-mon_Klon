/* Regression: interrupted story/postgame quests resume safely across JSON save reloads. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js',
 'src/maps/story-finale.js','src/maps/postgame.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,f=window.EchoFinale,p=window.EchoPostgame;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);window.EchoChapter3.register(legacy);window.EchoChapter4.register();
window.EchoChapter5.register();window.EchoStoryRegions.register();
window.EchoEndgame.register();f.register();p.register();
assert.equal(r.validateNetwork(),true);
let checkpoints=0,blocked=0,interactions=0;
let s={scene:'OVERWORLD',currentMapId:'observatory_roof',safeSpawnId:'from_hall',
 player:{x:23,y:12,dir:'right',stepPhase:0},team:[{id:7,lv:55,hp:45,maxHp:110}],
 archive:[{id:3,lv:20,hp:18,maxHp:45}],orbs:10,potions:6,
 chapter11:{completed:true},chapter9:{phase_lantern:false},main_story_finished:false};
function save(){
 const original=JSON.stringify(s);
 s=r.migrateSave(JSON.parse(original));
 assert.equal(s.saveSchemaVersion,2);
 assert.equal(s.team[0].id,7);
 assert.equal(s.archive[0].id,3);
 assert.equal(s.archive.length,1);
 checkpoints++;
}
function go(exit,id){
 assert.equal(r.travel(s,exit),true,s.currentMapId+': '+exit+' should be open');
 assert.equal(s.currentMapId,id);save();
}
function deny(exit){
 const before=JSON.stringify(s);
 assert.equal(r.travel(s,exit),false,s.currentMapId+': '+exit+' must remain closed');
 assert.equal(JSON.stringify(s),before,'Denied portal must not mutate save');
 blocked++;
}
function talk(type){
 const region=p.markers[s.currentMapId]?p:f;
 const marker=region.markers[s.currentMapId]?.find(x=>x.type===type);
 assert(marker,'Missing '+type+' in '+s.currentMapId);
 const out=region.interact(s,marker.x,marker.y);
 assert(out.lines?.length,'No dialogue for '+type);
 interactions++;save();return out;
}
function win(region,boss){
 const lines=region.victory(s,boss);
 assert(lines.length,'Expected first victory '+boss);save();
 assert.equal(region.victory(s,boss).length,0,'Boss victory must not be farmable');save();
}
go('to_family','martha_house');
go('to_memory','memory_room');
assert.match(talk('memoryMirror').lines.join(' '),/zuerst/);
assert.equal(s.chapter12.mirror,false);
go('to_martha','martha_house');talk('martha');
go('to_memory','memory_room');
for(const n of [2,0,1])talk('picture'+n);
assert.match(talk('memoryMirror').lines.join(' '),/Maternalis/);
talk('safetyLatch');
go('to_martha','martha_house');go('to_garden','old_family_garden');
deny('to_shaft');talk('mioraChoice');
const orbs12=s.orbs,potions12=s.potions;
talk('shaftKey');talk('shaftKey');
assert.equal(s.orbs,orbs12+4);assert.equal(s.potions,potions12+3);
go('to_shaft','shaft_entry');go('to_level1','shaft_level1');
talk('anchorW');talk('lanternShortcut');
assert.equal(s.chapter13.optionalShortcut,false);
go('to_level2','shaft_level2');talk('anchorA');
assert.equal(talk('shaftGuard').boss,'shaftGuardian');
win(f,'shaftGuardian');
go('to_anchors','shaft_anchors');deny('to_father');
talk('anchorS');talk('escapeSwitch');
go('to_father','father_chamber');
assert.match(talk('father').lines.join(' '),/Maternalis/);
talk('protectionCode');
const orbs13=s.orbs,potions13=s.potions;
talk('finalPreparation');talk('finalPreparation');
assert.equal(s.orbs,orbs13+5);assert.equal(s.potions,potions13+4);
go('to_core','core_access');talk('machinePhase');
go('to_reflections','memory_reflections');deny('to_core');
for(const n of [2,0,1])talk('flash'+n);
assert.equal(s.chapter14.memoriesReady,true);
go('to_core','resonance_core');
assert.equal(talk('varekFinal').boss,'varekFinal');
win(f,'varekFinal');
for(const n of [2,0,1])talk('free'+n);
talk('farewell');
const orbs14=s.orbs,potions14=s.potions;
talk('releaseSignal');talk('releaseSignal');
assert.equal(s.main_story_finished,true);
assert.equal(s.orbs,orbs14+6);assert.equal(s.potions,potions14+4);
go('to_epilogue','epilogue_wurzelheim');
go('to_postgame',p.HUB);
assert.match(talk('gardenFest').lines.join(' '),/warten/);
for(const n of [5,2,1,0,4,3]){
 go('to_meadow_'+(n+1),p.meadowIds[n]);
 talk('clue'+n);talk('clue'+n);
 go('to_garden',p.HUB);
}
assert.equal(s.postgame.clues.length,6);
for(const n of [2,0,1]){
 const out=talk('trial'+n);
 assert.equal(out.boss,'postgameTrial'+n);
 win(p,'postgameTrial'+n);
 assert.equal(talk('trial'+n).boss,undefined);
}
go('to_museum',p.MUSEUM);
talk('station2');talk('station0');talk('station2');
assert.equal(s.postgame.museumSolved,false);
for(const n of [0,1,2])talk('station'+n);
assert.equal(s.postgame.museumSolved,true);
go('to_garden',p.HUB);
const orbsPost=s.orbs,potionsPost=s.potions;
talk('gardenFest');talk('gardenFest');
assert.equal(s.optional_postgame_completed,true);
assert.equal(s.orbs,orbsPost+5);assert.equal(s.potions,potionsPost+3);
go('to_epilogue','epilogue_wurzelheim');
go('to_postgame',p.HUB);
assert.equal(s.postgame.completed,true);
assert.equal(s.postgame.trials.length,3);
assert.equal(s.postgame.clues.length,6);
assert.equal(s.chapter12.completed,true);
assert.equal(s.chapter13.completed,true);
assert.equal(s.chapter14.completed,true);
console.log('PASS Quest save checkpoints: '+checkpoints+' reloads, '+interactions+
 ' interactions, '+blocked+' atomic closed gates, reversed clues/memories, bosses and rewards once, archived Maternalis');
