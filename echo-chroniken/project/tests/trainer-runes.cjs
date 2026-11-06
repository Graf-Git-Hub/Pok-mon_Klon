// Trainer rune integration: actual combat engine, 3v3 rosters and legal gear.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function ctx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}})}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}}}
const elements={},document={documentElement:{classList:{add(){}}},getElementById(k){return elements[k]??(elements[k]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const M=Object.create(Math);M.random=()=>.5;
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:M,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
  vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const src=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(src.includes(marker),'Harness insertion point changed');
vm.runInNewContext(src.replace(marker,'window.trainerAudit={s:gameState,createMonsterInstance,startTrainerBattle,storyBossRoster,skillDamage,runeCombatModifiers,gearLimit};\n'+marker),env);
const {s,createMonsterInstance:create,startTrainerBattle:start,storyBossRoster:boss,skillDamage:damage,runeCombatModifiers:mods,gearLimit}=window.trainerAudit;
s.team=[create(3,24),create(2,20),create(1,18)];s.hasStarter=true;
const originalStock=JSON.stringify(s.gearStock);
const lineup=[{id:3,lv:22,runes:['rune_kraft','rune_schutz','rune_nebel']},
 {id:2,lv:19,runes:['rune_schutz','rune_ahnen','rune_kraft']},
 {id:1,lv:17,runes:['rune_nebel','rune_nebel','rucksack','INVALID']}];
start(2,'Runen-Testtrainer',lineup);
assert.equal(s.battle.enemyQueue.length,3,'3v3 roster intact');
assert.deepEqual(Array.from(s.battle.enemyQueue,x=>x.equipment.length),[3,2,1],'Stage-dependent gear slots');
for(const enemy of s.battle.enemyQueue){
 assert(enemy.equipment.length<=gearLimit(enemy),'No slot overflow');
 assert.equal(new Set(enemy.equipment.map(x=>x.id)).size,enemy.equipment.length,'No duplicate passive rune');
}
assert.deepEqual(Array.from(s.battle.enemyQueue[2].equipment,x=>x.id),['rune_nebel'],'Invalid and duplicate gear ignored');
assert.equal(JSON.stringify(s.gearStock),originalStock,'Enemy gear must not spend the player inventory');
const attack={power:45,type:'NORMAL'};
const powered=s.battle.enemyQueue[0],plain=create(3,22),target=create(2,20);
assert(damage(powered,target,attack)>damage(plain,target,attack),'Enemy attack rune changes real damage');
assert(damage(target,powered,attack)<damage(target,plain,attack),'Enemy protection rune changes real incoming damage');
assert.equal(mods(s.battle.enemyQueue[1]).heal,.03,'Enemy ancestral rune heals on hit');
assert.equal(boss('varekFinal',150,38).at(-1).runes,undefined,'Story finale balance stays unchanged');
assert.equal(boss('root',67,12)[0].runes,undefined,'Early bosses stay without runes');
start(0,'Kael',[{id:16,lv:6},{id:29,lv:8}]);
assert(s.battle.enemyQueue.every(x=>x.equipment.length===0),'First gym remains unchanged');
// Exercise 15k seeded cross-team combat calculations using the actual engine.
let seed=20261106;const next=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const pool=['rune_kraft','rune_schutz','rune_nebel','rune_ahnen'];
let cases=0,valid=0;
for(let t=0;t<15000;t++){
 const n=t%2===0?3:1,teamA=[],teamB=[];
 for(let i=0;i<n;i++){
  const idA=1+Math.floor(next()*150),idB=1+Math.floor(next()*150);
  const a=create(idA,5+Math.floor(next()*45)),b=create(idB,5+Math.floor(next()*45));
  a.equipment=[{id:pool[Math.floor(next()*pool.length)]}];
  b.equipment=[{id:pool[Math.floor(next()*pool.length)]}];
  teamA.push(a);teamB.push(b);
 }
 for(let i=0;i<n;i++){
  assert(teamA[i].equipment.length<=gearLimit(teamA[i]));
  assert(teamB[i].equipment.length<=gearLimit(teamB[i]));
  const a=damage(teamA[i],teamB[i],attack),b=damage(teamB[i],teamA[i],attack);
  assert(Number.isSafeInteger(a)&&a>=2&&Number.isSafeInteger(b)&&b>=2);
  valid+=2;
 }
 cases++;
}
console.log('TRAINER_RUNES_PASS 3v3, tiered slots, enemy attack/defense/heal, authored bosses, inventory safety, '+cases+' seeded fixtures, '+valid+' real damage evaluations');
