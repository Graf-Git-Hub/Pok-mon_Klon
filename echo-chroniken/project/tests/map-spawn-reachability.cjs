/* Regression: every nonlegacy spawn can walk to every portal, and portal round-trips preserve a safe position. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
for(const file of ['data/species.js','data/encounters.js','src/encounters/registry.js',
 'src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js',
 'src/maps/story-finale.js','src/maps/postgame.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);
window.EchoChapter3.register(legacy);window.EchoChapter4.register();
window.EchoChapter5.register();window.EchoStoryRegions.register();
window.EchoEndgame.register();window.EchoFinale.register();window.EchoPostgame.register();
assert.equal(r.validateNetwork(),true);
const solid=new Set([1,4,5,7]),steps=[[1,0],[-1,0],[0,1],[0,-1]];
let spawns=0,paths=0,roundTrips=0;
function key(p){return p.x+','+p.y;}
function setFlag(s,flag){
 if(!flag||flag==='always')return;
 const parts=flag.split('.');let t=s;
 for(const k of parts.slice(0,-1))t=t[k]??={};
 t[parts.at(-1)]=true;
}
for(const mapId of r.list()){
 if(mapId===r.LEGACY)continue;
 const m=r.get(mapId),markers=window.EchoPostgame.markers[mapId]||[];
 for(const [spawnId,spawn] of Object.entries(m.spawns)){
  spawns++;
  assert(Number.isInteger(spawn.x)&&Number.isInteger(spawn.y),mapId+': invalid spawn '+spawnId);
  assert(m.tiles[spawn.y]&&!solid.has(m.tiles[spawn.y][spawn.x]),mapId+': blocked spawn '+spawnId);
  const seen=new Set([key(spawn)]),queue=[spawn];
  for(let i=0;i<queue.length;i++){
   for(const [dx,dy] of steps){
    const x=queue[i].x+dx,y=queue[i].y+dy,k=x+','+y;
    if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||
       solid.has(m.tiles[y][x])||markers.some(p=>p.x===x&&p.y===y))continue;
    seen.add(k);queue.push({x,y});
   }
  }
  for(const exit of m.exits){
   paths++;
   assert(seen.has(key(exit)),mapId+': '+spawnId+' cannot reach '+exit.exitId);
  }
 }
 for(const exit of m.exits){
  const target=r.get(exit.toMapId),back=target.exits.find(e=>e.exitId===exit.returnExitId);
  const s={currentMapId:mapId,safeSpawnId:Object.keys(m.spawns)[0],
    player:{x:exit.x,y:exit.y,dir:'up',stepPhase:1},scene:'OVERWORLD',saveSchemaVersion:r.VERSION};
  setFlag(s,exit.requiredFlag);setFlag(s,back.requiredFlag);
  assert.equal(r.travel(s,exit.exitId),true,mapId+': cannot travel '+exit.exitId);
  assert.equal(s.currentMapId,target.mapId);
  assert.equal(s.player.x,target.spawns[exit.toSpawnId].x);
  assert.equal(s.player.y,target.spawns[exit.toSpawnId].y);
  assert.equal(r.travel(s,back.exitId),true,mapId+': cannot return '+exit.exitId);
  assert.equal(s.currentMapId,mapId);
  assert.equal(s.saveSchemaVersion,r.VERSION);
  roundTrips++;
 }
}
assert(r.list().length>=60,'Expected 60+ maps');
console.log('PASS Map spawn reachability: '+r.list().length+' maps, '+spawns+' safe spawns, '+paths+' spawn-to-exit paths, '+roundTrips+' reversible portal trips');
