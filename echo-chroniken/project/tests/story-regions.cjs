const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,c3=window.EchoChapter3,c4=window.EchoChapter4,
 c5=window.EchoChapter5,story=window.EchoStoryRegions,rail=window.EchoRail;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);c3.register(legacy);c4.register();c5.register();
assert.equal(story.register(),true);assert.equal(r.list().length,28,'1+4+5+5+13 maps');
assert.equal(r.validateNetwork(),true);
const s={scene:'OVERWORLD',currentMapId:'station_stillwasser',safeSpawnId:'platform',
 player:{x:11,y:9,dir:'right',stepPhase:0},team:[{id:1,lv:20,hp:80,maxHp:80}],
 chapter3:{completed:true},chapter4:{completed:true,railsReady:true,rail_wurzelheim:true,rail_moorglas:true},
 chapter5:{completed:false},orbs:9,potions:4};
const travel=(exit)=>r.travel(s,exit);
const talk=(type)=>{
 const p=story.markers[s.currentMapId]?.find(v=>v.type===type);
 assert(p,'Missing marker '+type+' on '+s.currentMapId);
 const before=JSON.stringify(s),out=story.interact(s,p.x,p.y);
 assert(Array.isArray(out.lines)&&out.lines.length,'Missing dialog for '+type);
 return out;
};
assert.equal(travel('to_ashroad'),false,'Chapter 6 entrance locked before chapter 5');
s.chapter5.completed=true;
assert.equal(travel('to_ashroad'),true);
assert.equal(s.currentMapId,'ashrail_approach');
assert.equal(travel('to_stillwasser'),true,'Chapter 6 return to chapter 5');
assert.equal(travel('to_ashroad'),true);
assert.equal(travel('to_ash_town'),true);
assert.equal(s.currentMapId,'aschenruh_town');
assert.match(talk('edda').lines.join(' '),/Regler/);
talk('ledger0');talk('ledger1');
assert.equal(travel('to_glut_forge'),true);
assert.match(talk('worker0').lines.join(' '),/Seriennummern/,'No worker before ledgers');
talk('ledger2');talk('worker0');talk('worker1');
assert.equal(travel('to_glut_chasm'),true);
talk('worker2');
assert.equal(s.chapter6.workers.length,3);
assert.equal(travel('to_garden_road'),false,'Chapter 7 gate must remain locked');
assert.match(talk('smelter').lines.join(' '),/Eddas/);
assert.equal(travel('to_glut_forge'),true);
assert.match(talk('valve2').lines.join(' '),/Regler 2/);
talk('valve1');talk('valve3');talk('vent');talk('valve2');
assert.deepEqual(Array.from(s.chapter6.valves).sort(),[1,2,3]);
talk('casing');assert.equal(s.chapter6.casing,true);
assert.equal(travel('to_ash_town'),true);
talk('edda');assert.equal(s.chapter6.eddaConfessed,true);
assert.equal(travel('to_glut_forge'),true);
assert.equal(travel('to_glut_chasm'),true);
assert.equal(talk('smelter').boss,'smelter');
story.victory(s,'smelter');assert.equal(talk('smelter').boss,undefined);
assert.equal(talk('core').boss,'core');
story.victory(s,'core');assert.equal(talk('core').boss,undefined);
const oldOrbs=s.orbs,oldPotions=s.potions;
talk('tool');assert.equal(s.chapter6.completed,true);
assert.equal(s.chapter6.resonance_tool,true);
assert.equal(s.orbs,oldOrbs+3);assert.equal(s.potions,oldPotions+2);
talk('tool');assert.equal(s.orbs,oldOrbs+3,'No repeat Chapter 6 reward');
assert.equal(travel('to_garden_road'),true);
assert.equal(s.currentMapId,'garden_road');
assert.equal(travel('to_glut_chasm'),true,'Chapter 7 safe return');
assert.equal(travel('to_garden_road'),true);
assert.equal(travel('to_grove'),true);
assert.match(talk('nalia').lines.join(' '),/drei/);
talk('ritual0');talk('ritual1');talk('ritual2');talk('nalia');
assert.equal(s.chapter7.naliaTrusted,true);
assert.equal(travel('to_name_library'),true);
talk('story0');talk('story1');talk('story2');
assert.equal(travel('to_grove'),true);
assert.equal(travel('to_echo_garden'),true);
assert.equal(travel('to_capital'),false,'Chapter 8 locked before chapter 7');
assert.equal(talk('hunter').boss,'hunter');
story.victory(s,'hunter');
talk('stoneFLAMME');assert.equal(s.chapter7.stones.length,0,'Wrong order does not corrupt stones');
talk('stoneWASSER');talk('stoneWURZEL');talk('stoneFLAMME');talk('stoneLICHT');
assert.equal(s.chapter7.stones.length,4);
assert.equal(talk('nameShadow').boss,'shadow');
story.victory(s,'shadow');
assert.equal(travel('to_grove'),true);
assert.equal(travel('to_name_library'),true);
talk('fatherMap');assert.equal(s.chapter7.fatherMap,true);
assert.equal(travel('to_grove'),true);
assert.equal(travel('to_echo_garden'),true);
const orbBefore7=s.orbs;
talk('trace');assert.equal(s.chapter7.completed,true);
assert.equal(s.chapter7.capital_archive_key,true);
assert.equal(s.chapter7.echoTrace,true);
talk('trace');assert.equal(s.orbs,orbBefore7+3);
assert.equal(travel('to_capital'),true);
assert.equal(s.currentMapId,'capital_outer_gate');
assert.equal(travel('to_echo_garden'),true,'Chapter 8 safe return');
assert.equal(travel('to_capital'),true);
assert.equal(travel('to_upper'),true);
talk('citizen0');talk('citizen1');
assert.equal(travel('to_archive'),true);
talk('document0');talk('document1');talk('document2');
talk('year2');assert.equal(s.chapter8.years.length,0);
talk('year0');talk('year2');talk('year1');
assert.deepEqual(Array.from(s.chapter8.years),[0,2,1]);
talk('archivist');
assert.equal(travel('to_upper'),true);
assert.equal(travel('to_research'),true);
talk('varek');assert.equal(s.chapter8.varekMet,true);
assert.match(talk('guard').lines.join(' '),/Tonspur/);
assert.equal(travel('to_upper'),true);
assert.equal(travel('to_archive'),true);
talk('recording');assert.equal(s.chapter8.recording,true);
assert.equal(travel('to_upper'),true);
assert.equal(travel('to_research'),true);
assert.equal(talk('guard').boss,'guard');
story.victory(s,'guard');
const orbBefore8=s.orbs,potionBefore8=s.potions;
talk('pass');assert.equal(s.chapter8.completed,true);
assert.equal(s.chapter8.frost_pass,true);
talk('pass');assert.equal(s.orbs,orbBefore8+4);
assert.equal(s.potions,potionBefore8+2);
assert.equal(travel('to_upper'),true);
assert.equal(travel('to_station'),true);
assert.equal(talk('train').rail,true);
assert.deepEqual(Array.from(rail.destinations(s),x=>x.id),
 ['station_stillwasser','station_moorglas','station_wurzelheim']);
assert.equal(rail.depart(s,'station_stillwasser'),true);
assert.equal(rail.depart(s,'station_kronenstadt'),true);
assert.equal(s.currentMapId,'station_kronenstadt');
const save=r.migrateSave(JSON.parse(JSON.stringify(s)));story.ensure(save);
for(const n of [6,7,8])assert.equal(save['chapter'+n].completed,true);
assert.equal(save.chapter7.echoTrace,true);
assert.equal(save.currentMapId,'station_kronenstadt');
const solid=new Set([1,4,5,7]);
for(const mapId of Object.keys(story.names)){
 const m=r.get(mapId),spawn=m.spawns[Object.keys(m.spawns)[0]];
 const q=[spawn],seen=new Set([spawn.x+','+spawn.y]);
 while(q.length){
  const p=q.shift();
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=p.x+dx,y=p.y+dy,k=x+','+y;
   if(x<0||y<0||x>=m.width||y>=m.height||seen.has(k)||solid.has(m.tiles[y][x])||
     story.markers[mapId].some(v=>v.x===x&&v.y===y))continue;
   seen.add(k);q.push({x,y});
  }
 }
 for(const e of m.exits)assert(seen.has(e.x+','+e.y),mapId+' inaccessible exit '+e.exitId);
 for(const p of story.markers[mapId])assert([[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>
   seen.has((p.x+dx)+','+(p.y+dy))),mapId+' inaccessible marker '+p.type);
}
console.log('PASS Chapters 6-8: 13 maps, reciprocal routes, 5 bosses, 3 puzzles, story flags, unique rewards, save migration, 4 rail stations and reachable markers');
