const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('src/maps/registry.js','utf8');
const window={},env={window,console};vm.runInNewContext(source,env);
const maps=window.EchoMaps;
assert(maps);assert.equal(maps.VERSION,2);
const legacy=Array.from({length:28},()=>Array(36).fill(0));
legacy[0][0]=1;
const first=maps.registerLegacy(legacy);
assert.equal(first.width,36);assert.equal(first.height,28);
assert.equal(maps.registerLegacy(legacy),first);
assert.deepEqual(Array.from(maps.list()),['legacy_wurzeldorf']);
const original={player:{x:7,y:7,dir:'down'},scene:'HOUSE',introStage:2,
 team:[{id:1,lv:5,hp:47}],orbs:12,potions:7, gymDefeated:[true,false,false],
 routeQuest:{lights:[0,1]},ruinsProgress:{bossWon:false}};
const legacyJson=JSON.stringify(original);
const migrated=maps.migrateSave(original);
assert.equal(JSON.stringify(original),legacyJson,'Migration must not mutate old save');
assert.equal(migrated.currentMapId,maps.LEGACY);assert.equal(migrated.saveSchemaVersion,2);
assert.equal(migrated.safeSpawnId,'legacy_current_position');
assert.equal(migrated.scene,'HOUSE');assert.equal(migrated.player.x,7);
assert.equal(migrated.team[0].hp,47);assert.equal(migrated.routeQuest.lights.length,2);
const storage={};
const localStorage={getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v};
assert.equal(maps.backupLegacy(localStorage,legacyJson,original),true);
assert.equal(storage[maps.BACKUP_KEY],legacyJson);
maps.backupLegacy(localStorage,'NEVER OVERWRITE',original);
assert.equal(storage[maps.BACKUP_KEY],legacyJson);
const already=maps.migrateSave({...migrated,saveSchemaVersion:2});
assert.equal(already.currentMapId,maps.LEGACY);
assert.equal(maps.backupLegacy(localStorage,'v2',already),false);
assert.throws(()=>maps.migrateSave({...original,saveSchemaVersion:99}),/newer/);
const unknown=maps.migrateSave({...original,currentMapId:'chapter03_harbor',safeSpawnId:'harbor_a'});
assert.equal(unknown.currentMapId,maps.LEGACY);
assert.equal(unknown.player.x,5);assert.equal(unknown.player.y,6);
assert.equal(unknown.team[0].hp,47);assert.equal(unknown.orbs,12);
assert.throws(()=>maps.register({mapId:'bad',tiles:[[1]],spawns:{door:{x:0,y:0}}}),/spawn/);
function floor(){return Array.from({length:3},()=>Array(3).fill(0))}
maps.register({mapId:'test_town',tiles:floor(),spawns:{arrival:{x:1,y:1}},
 exits:[{exitId:'east',toMapId:'test_cave',toSpawnId:'entrance',returnExitId:'west',requiredFlag:'opened'}]});
maps.register({mapId:'test_cave',tiles:floor(),spawns:{entrance:{x:1,y:2}},
 exits:[{exitId:'west',toMapId:'test_town',toSpawnId:'arrival',returnExitId:'east',requiredFlag:'always'}]});
const playerState={currentMapId:'test_town',player:{x:0,y:0,dir:'down'},scene:'OVERWORLD',opened:false};
assert.equal(maps.travel(playerState,'east'),false);assert.equal(playerState.player.x,0);
playerState.opened=true;
assert.equal(maps.travel(playerState,'east'),true);
assert.equal(playerState.currentMapId,'test_cave');
assert.equal(playerState.player.y,2);
assert.equal(maps.travel(playerState,'west'),true);assert.equal(playerState.currentMapId,'test_town');
assert.equal(maps.travel(playerState,'no_such_exit'),false);
console.log('PASS: MapRegistry, legacy coordinate preservation, save v2 migration, raw backup, safe two-way exits and failure rollback');
