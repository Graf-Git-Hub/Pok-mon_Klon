const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
const files=['data/species.js','data/encounters.js','src/encounters/registry.js',
 'src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js',
 'src/maps/story-finale.js','src/maps/postgame.js'];
for(const file of files)vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,p=window.EchoPostgame;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);window.EchoChapter3.register(legacy);window.EchoChapter4.register();
window.EchoChapter5.register();window.EchoStoryRegions.register();window.EchoEndgame.register();
window.EchoFinale.register();assert.equal(p.register(),true);assert.equal(r.validateNetwork(),true);
assert.equal(r.list().length,60,'52 previous maps + 8 postgame maps');
const s={currentMapId:'epilogue_wurzelheim',scene:'OVERWORLD',safeSpawnId:'from_core',
 player:{x:24,y:9,dir:'right',stepPhase:0},team:[{id:3,lv:56,hp:45,maxHp:125}],
 orbs:4,potions:3,main_story_finished:false,optional_postgame_completed:false,
 chapter14:{completed:true}};
assert.equal(r.travel(s,'to_postgame'),false,'Postgame must be story-gated');
s.main_story_finished=true;
assert.equal(r.travel(s,'to_postgame'),true);assert.equal(s.currentMapId,p.HUB);
function talk(type){
 const m=p.markers[s.currentMapId].find(x=>x.type===type);
 assert(m,'Missing '+type+' on '+s.currentMapId);
 const out=p.interact(s,m.x,m.y);
 assert(out.lines?.length,'Missing dialog '+type);
 return out;
}
function go(exit,id){
 assert.equal(r.travel(s,exit),true,'Exit '+exit+' on '+s.currentMapId);
 assert.equal(s.currentMapId,id);
}
talk('nalia');talk('piko');talk('martha');talk('healer');
assert.equal(s.team[0].hp,125);
assert.match(talk('gardenFest').lines.join(' '),/warten/);
for(let i=0;i<6;i++){
 const id=p.meadowIds[i];
 go('to_meadow_'+(i+1),id);
 const c=p.ensure(s);if(!c.visited.includes(i))c.visited.push(i);
 talk('meadowSign');talk('clue'+i);talk('clue'+i);
 assert.equal(p.ensure(s).clues.length,i+1,'Repeated clues do not farm');
 go('to_garden',p.HUB);
 if(i%2===1){
  const t=talk('trial'+Math.floor(i/2));
  assert.equal(t.boss,'postgameTrial'+Math.floor(i/2));
  p.victory(s,t.boss);
  assert.equal(talk('trial'+Math.floor(i/2)).boss,undefined,'Boss cannot repeat');
 }
}
assert.equal(s.postgame.trials.length,3);
go('to_museum',p.MUSEUM);
talk('curator');talk('museumLedger');
talk('station2');assert.equal(s.postgame.museumErrors,1);
talk('station0');talk('station2');talk('station2');talk('station2');
assert.equal(s.postgame.museumErrors,4);
assert.match(talk('station2').lines.join(' '),/Tipp/);
talk('station0');talk('station1');talk('station2');
assert.equal(s.postgame.museumSolved,true);
talk('trainLacquer');assert.equal(s.postgame.trainLacquer,true);
go('to_garden',p.HUB);
const orbs=s.orbs,potions=s.potions;
talk('gardenFest');talk('gardenFest');
assert.equal(s.optional_postgame_completed,true);
assert.equal(s.postgame.completed,true);
assert.equal(s.orbs,orbs+5,'No repeated orb farming');
assert.equal(s.potions,potions+3,'No repeated potion farming');
go('to_epilogue','epilogue_wurzelheim');go('to_postgame',p.HUB);
const copy=r.migrateSave(JSON.parse(JSON.stringify(s)));p.ensure(copy);
assert.equal(copy.postgame.completed,true);
assert.equal(copy.postgame.clues.length,6);
assert.equal(copy.postgame.trials.length,3);
assert.equal(copy.team[0].id,3,'Original species ID preserved');
assert.equal(copy.saveSchemaVersion,2);
const early={main_story_finished:false,postgame:null};
p.ensure(early);assert.equal(early.postgame.completed,false);
const q=window.EchoEncounters,defs=window.ECHO_ENCOUNTER_TABLES;
assert.equal(q.initialize(window.ECHO_SPECIES,defs),21);
const expected=window.ECHO_SPECIES.filter(x=>x.stage===1&&x.id!==1).map(x=>x.id);
assert.equal(expected.length,94,'94 non-starter base forms');
const found=new Set();
for(const id of p.meadowIds){
 const table=q.get(id);assert(table,'Missing meadow table '+id);
 assert.equal(table.entries.reduce((sum,e)=>sum+e.weight,0),100);
 const limits={low:8,cap:65,poolCap:150,stageCap:1,badges:0};
 for(const e of table.entries){
  assert.equal(q.choose(id,limits,25,()=>0)!==null,true);
  assert.equal(found.has(e.id),false,'Species duplicated in meadows');
  found.add(e.id);
 }
}
assert.equal(found.size,94);
for(const id of expected)assert(found.has(id),'Missing base species '+id);
const solid=new Set([1,4,5,7]);
for(const id of Object.keys(p.names)){
 const m=r.get(id),spawn=m.spawns[Object.keys(m.spawns)[0]];
 const queue=[spawn],seen=new Set([spawn.x+','+spawn.y]);
 while(queue.length){
  const v=queue.shift();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=v.x+dx,y=v.y+dy,k=x+','+y;
   if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||
    solid.has(m.tiles[y][x])||p.markers[id].some(a=>a.x===x&&a.y===y))continue;
   seen.add(k);queue.push({x,y});
  }
 }
 for(const e of m.exits)assert(seen.has(e.x+','+e.y),id+' inaccessible exit '+e.exitId);
 for(const marker of p.markers[id])
  assert([[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>
   seen.has((marker.x+dx)+','+(marker.y+dy))),id+' inaccessible '+marker.type);
}
console.log('PASS Postgame: 8 maps, all 94 base forms, 3 optional trials, museum puzzle/hints, rewards once, reversible portals, save v2, BFS');
