// One continuous quest state from Chapter 3 through Chapter 14 and postgame.
// Not a controller playthrough: fights are completed through real victory hooks.
// Movement uses real map travel/gates; separate browser tests cover input.
const a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js',
 'src/maps/chapter4.js','src/maps/chapter5.js','src/maps/story-regions.js',
 'src/maps/story-endgame.js','src/maps/story-finale.js','src/maps/postgame.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,c3=window.EchoChapter3,c4=window.EchoChapter4,
 c5=window.EchoChapter5,mid=window.EchoStoryRegions,end=window.EchoEndgame,
 fin=window.EchoFinale,post=window.EchoPostgame,rail=window.EchoRail;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);c3.register(legacy);c4.register();c5.register();
mid.register();end.register();fin.register();post.register();
a.equal(r.validateNetwork(),true);a.equal(r.list().length,60);
let s={scene:'OVERWORLD',currentMapId:'legacy_wurzeldorf',
 safeSpawnId:'legacy_current_position',
 player:{x:24,y:10,dir:'up',stepPhase:0},hasStarter:true,
 ruinsProgress:{bossWon:true},team:[{uid:'mother',id:2,lv:19,hp:75,maxHp:75}],
 archive:[{uid:'archived',id:7,lv:8,hp:36,maxHp:36}],
 orbs:6,potions:3,main_story_finished:false,
 caughtIds:{1:true,2:true,7:true},seenIds:{1:true,2:true,7:true}};
let portals=0,interactions=0,simulatedVictories=0;
const stages=[];
function go(exit,to){
 const from=s.currentMapId;
 a.equal(r.travel(s,exit),true,from+':'+exit+' must work');
 portals++;a.equal(s.currentMapId,to,from+':'+exit+' destination');
 const m=r.get(to);a(m.spawns[s.safeSpawnId],to+': missing safe spawn');
 a.equal(s.player.x,m.spawns[s.safeSpawnId].x);
 a.equal(s.player.y,m.spawns[s.safeSpawnId].y);
 a.equal(s.scene,'OVERWORLD');
}
function locked(exit){
 const before=JSON.stringify(s);
 a.equal(r.travel(s,exit),false,'premature portal '+exit);
 a.equal(JSON.stringify(s),before,'failed travel must never mutate state');
}
function talk(api,type){
 const p=api.markers[s.currentMapId]?.find(x=>x.type===type);
 a(p,'missing '+type+' on '+s.currentMapId);
 const result=api.interact(s,p.x,p.y);interactions++;
 a(result.lines?.length,'missing dialog for '+type);
 return result;
}
function win(api,id){
 api.victory(s,id);simulatedVictories++;
}
function checkpoint(n,map){
 a.equal(s.currentMapId,map,'chapter '+n+' last map');
 a.equal(s['chapter'+n]?.completed,true,'chapter '+n+' incomplete');
 const before=JSON.parse(JSON.stringify(s));
 const reloaded=r.migrateSave(JSON.parse(JSON.stringify(s)));
 a.equal(reloaded.saveSchemaVersion,2);
 for(const k of ['currentMapId','safeSpawnId','orbs','potions'])
  a.equal(reloaded[k],before[k],'save roundtrip '+n+': '+k);
 for(const k of ['team','archive','caughtIds','seenIds','chapter'+n])
  a.deepEqual(JSON.parse(JSON.stringify(reloaded[k])),before[k],
   'save roundtrip '+n+': '+k);
 s=reloaded;stages.push(n);
}
// The prior intro, gym and ruin victory is a documented prerequisite.
go('to_lake','lake_north_path');go('to_harbor','nebelhafen_town');
locked('to_pumpworks');
for(const t of ['sera','witness0','witness1','witness2'])talk(c3,t);
go('to_pumpworks','pumpworks_floor1');locked('to_control');
for(const t of ['power','valve0','valve1','rotor'])talk(c3,t);
go('to_control','pumpworks_controlroom');
a.equal(talk(c3,'boss').boss,true);win(c3);
talk(c3,'recording');checkpoint(3,'pumpworks_controlroom');
// Chapter 4: the exact return rail trip grants completion.
go('to_tunnel','root_tunnel');go('to_station','station_wurzelheim');
go('to_yard','rail_switchyard');
for(const t of ['switchA','switchC','switchB'])talk(c4,t);
go('to_station','station_wurzelheim');
a.equal(rail.depart(s,'station_moorglas'),true);
go('to_bog','moorglas_bog');
a.equal(talk(c4,'courier').boss,'courier');win(c4,'courier');
a.equal(talk(c4,'rootBoss').boss,'root');win(c4,'root');
go('to_station','station_moorglas');
a.equal(rail.depart(s,'station_wurzelheim'),true);
checkpoint(4,'station_wurzelheim');
a.equal(rail.depart(s,'station_moorglas'),true);go('to_bog','moorglas_bog');
// Chapter 5: memories, the archive and the optional Lyra fight.
go('to_stillwater','moor_to_stillwater');go('to_town','stillwasser_town');
for(const t of ['resident0','resident1','resident2']){talk(c5,t);talk(c5,t);}
go('to_archive','stillwater_archive');
for(const t of ['libraryRoute','ledger','portrait','diary','lyra','libraryRoute'])talk(c5,t);
go('to_town','stillwasser_town');go('to_tower','stillwater_tower');
talk(c5,'cable');a.equal(talk(c5,'mirror').boss,'mirror');win(c5,'mirror');
a.equal(talk(c5,'lyraDuel').boss,'lyra');win(c5,'lyra');
talk(c5,'antenna');go('to_town','stillwasser_town');
go('to_station','station_stillwasser');checkpoint(5,'station_stillwasser');
// Chapter 6: three workers, valve ordering, two late forge fights.
go('to_ashroad','ashrail_approach');go('to_ash_town','aschenruh_town');
for(const t of ['ledger0','ledger1'])talk(mid,t);
go('to_glut_forge','glut_forge');
for(const t of ['ledger2','worker0','worker1'])talk(mid,t);
go('to_glut_chasm','glut_chasm');talk(mid,'worker2');
go('to_glut_forge','glut_forge');
for(const t of ['valve1','valve3','vent','valve2','casing'])talk(mid,t);
go('to_ash_town','aschenruh_town');talk(mid,'edda');
go('to_glut_forge','glut_forge');go('to_glut_chasm','glut_chasm');
a.equal(talk(mid,'smelter').boss,'smelter');win(mid,'smelter');
a.equal(talk(mid,'core').boss,'core');win(mid,'core');
talk(mid,'tool');checkpoint(6,'glut_chasm');
// Chapter 7: ritual, hunter, stones, shadow and father evidence.
go('to_garden_road','garden_road');go('to_grove','lichterhain_grove');
for(const t of ['ritual0','ritual1','ritual2','nalia'])talk(mid,t);
go('to_name_library','name_library');
for(const t of ['story0','story1','story2'])talk(mid,t);
go('to_grove','lichterhain_grove');go('to_echo_garden','echo_garden');
locked('to_capital');
a.equal(talk(mid,'hunter').boss,'hunter');win(mid,'hunter');
for(const t of ['stoneWASSER','stoneWURZEL','stoneFLAMME','stoneLICHT'])talk(mid,t);
a.equal(talk(mid,'nameShadow').boss,'shadow');win(mid,'shadow');
go('to_grove','lichterhain_grove');go('to_name_library','name_library');
talk(mid,'fatherMap');go('to_grove','lichterhain_grove');
go('to_echo_garden','echo_garden');talk(mid,'trace');checkpoint(7,'echo_garden');
// Chapter 8: research, city archive, sentry and long rail journey.
go('to_capital','capital_outer_gate');go('to_upper','kronenstadt_upper');
for(const t of ['citizen0','citizen1'])talk(mid,t);
go('to_archive','central_archive');
for(const t of ['document0','document1','document2','year0','year2','year1','archivist'])
 talk(mid,t);
go('to_upper','kronenstadt_upper');go('to_research','research_hall');talk(mid,'varek');
go('to_upper','kronenstadt_upper');go('to_archive','central_archive');
talk(mid,'recording');go('to_upper','kronenstadt_upper');
go('to_research','research_hall');
a.equal(talk(mid,'guard').boss,'guard');win(mid,'guard');
talk(mid,'pass');go('to_upper','kronenstadt_upper');go('to_station','station_kronenstadt');
a.equal(rail.depart(s,'station_stillwasser'),true);
a.equal(rail.depart(s,'station_kronenstadt'),true);
go('to_upper','kronenstadt_upper');go('to_gate','capital_outer_gate');
checkpoint(8,'capital_outer_gate');
// Chapter 9: phase lantern and bridge, Vex boss.
go('to_frost','frost_approach');
talk(end,'mapPart');talk(end,'lostLetter');go('to_frost_station','frost_station');
for(const t of ['scientist','lensPart','batteryPart','assembler'])talk(end,t);
a.equal(s.chapter9.phase_lantern,true);
go('to_ice_caverns','ice_caverns');
s.player={x:8,y:7,dir:'up',stepPhase:0};
talk(end,'bridgeLeft');a.equal(s.chapter9.bridgeActive,true);
a.equal(talk(end,'vex').boss,'vexFrost');win(end,'vexFrost');
for(const t of ['fatherLog','caveSignal'])talk(end,t);
checkpoint(9,'ice_caverns');
// Chapter 10: the peaceful alternative is a real branch.
go('to_under_city','under_city_station');talk(end,'guide');talk(end,'map');
go('to_under_homes','under_city_homes');
for(const t of ['member0','member1','miraDrawing'])talk(end,t);
go('to_mainring','resonance_mainring');
for(const t of ['anchorB','anchorA','anchorC','power'])talk(end,t);
go('to_vault','continuum_vault');
a.equal(talk(end,'guardian').boss,'ringGuardian');
talk(end,'testimony');talk(end,'guardian');a.equal(s.chapter10.peaceful,true);
for(const t of ['evacuation','signal'])talk(end,t);
checkpoint(10,'continuum_vault');
// Chapter 11: telescope, Varek and the message from the father.
go('to_star_ridge','star_ridge');talk(end,'stargazer');
go('to_observatory','observatory_hall');
for(const t of ['projection0','projection1','projection2'])talk(end,t);
go('to_telescope','observatory_telescope');
for(const t of ['dialWURZEL','dialWASSER','dialSTERN','telescope'])talk(end,t);
go('to_hall','observatory_hall');go('to_roof','observatory_roof');
a.equal(talk(end,'varek').boss,'varekFirst');win(end,'varekFirst');
for(const t of ['capsule0','capsule1','capsule2','miraLetter'])talk(end,t);
go('to_hall','observatory_hall');talk(end,'fatherMessage');
go('to_roof','observatory_roof');talk(end,'beacon');
checkpoint(11,'observatory_roof');
// Chapter 12: family memories and shaft key.
go('to_family','martha_house');
for(const t of ['letter','musicBox','martha'])talk(fin,t);
go('to_memory','memory_room');
for(const t of ['picture0','picture1','picture2','memoryMirror','safetyLatch'])
 talk(fin,t);
go('to_martha','martha_house');go('to_garden','old_family_garden');
locked('to_shaft');
for(const t of ['mioraChoice','shaftKey'])talk(fin,t);
checkpoint(12,'old_family_garden');
// Chapter 13: three anchors, father and preparation.
go('to_shaft','shaft_entry');talk(fin,'shaftGuide');talk(fin,'elevator');
go('to_level1','shaft_level1');
for(const t of ['anchorW','rootMemo','lanternShortcut'])talk(fin,t);
go('to_level2','shaft_level2');talk(fin,'anchorA');
a.equal(talk(fin,'shaftGuard').boss,'shaftGuardian');win(fin,'shaftGuardian');
go('to_anchors','shaft_anchors');locked('to_father');
for(const t of ['anchorS','escapeSwitch'])talk(fin,t);
go('to_father','father_chamber');
for(const t of ['father','protectionCode','finalPreparation'])talk(fin,t);
checkpoint(13,'father_chamber');
// Chapter 14: final choice, release, credits and epilogue.
go('to_core','core_access');talk(fin,'warning');talk(fin,'machinePhase');
go('to_reflections','memory_reflections');locked('to_core');
for(const t of ['flash2','flash0','flash1','miraLetter'])talk(fin,t);
go('to_core','resonance_core');
a.equal(talk(fin,'varekFinal').boss,'varekFinal');win(fin,'varekFinal');
for(const t of ['free0','free1','free2','farewell','releaseSignal'])
 talk(fin,t);
a.equal(s.main_story_finished,true);
go('to_epilogue','epilogue_wurzelheim');
for(const t of ['marthaEpilogue','friends','credits','journal'])talk(fin,t);
checkpoint(14,'epilogue_wurzelheim');
// Postgame: all six meadows, three trials and the railway museum.
go('to_postgame',post.HUB);
for(const t of ['nalia','piko','martha','healer'])talk(post,t);
for(let i=0;i<6;i++){
 go('to_meadow_'+(i+1),post.meadowIds[i]);
 talk(post,'meadowSign');talk(post,'clue'+i);
 go('to_garden',post.HUB);
 if(i%2===1){
  const boss='postgameTrial'+Math.floor(i/2);
  a.equal(talk(post,'trial'+Math.floor(i/2)).boss,boss);
  win(post,boss);
 }
}
go('to_museum',post.MUSEUM);
for(const t of ['curator','museumLedger','station0','station1','station2','trainLacquer'])
 talk(post,t);
go('to_garden',post.HUB);talk(post,'gardenFest');
a.equal(s.postgame.completed,true);a.equal(s.optional_postgame_completed,true);
a.equal(s.postgame.clues.length,6);a.equal(s.postgame.trials.length,3);
go('to_epilogue','epilogue_wurzelheim');
const saved=r.migrateSave(JSON.parse(JSON.stringify(s)));
a.equal(saved.main_story_finished,true);
a.equal(saved.postgame.completed,true);
a.deepEqual(JSON.parse(JSON.stringify(saved.archive)),[{uid:'archived',id:7,lv:8,hp:36,maxHp:36}]);
a.deepEqual(stages,[3,4,5,6,7,8,9,10,11,12,13,14]);
console.log('PASS continuous campaign from Chapter 3 to postgame: '+portals+
 ' real registry portals, '+interactions+' quest interactions, '+
 simulatedVictories+' simulated victory callbacks, '+stages.length+
 ' chapter save/restore checks, archive preserved, credits and postgame completed');
