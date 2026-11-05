// Real battle-engine regression: late bosses require both waves before story victory.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[];
const document={documentElement:{classList:{add(){}}},getElementById(id){return elements[id]??(elements[id]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const src=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(src.includes(marker),'Game engine injection point');
vm.runInNewContext(src.replace(marker,
 'window.phaseProbe={state:gameState,createMonsterInstance,startTrainerBattle,handleEnemyDefeated,enemyCounterAttack,bossMultipliers,storyBossRoster,scaleBossRoster};\n'+marker),env);
const p=window.phaseProbe,s=p.state,events=[];
window.EchoEndgame={victory:(_s,boss)=>{events.push(boss);return ['Endgame victory'];}};
window.EchoFinale={victory:(_s,boss)=>{events.push(boss);return ['Finale victory'];}};
const cases=[
 {key:'varekFirst',bossId:62,openerId:89,level:47,group:'endgame',chapter:11,channel:'endgameFight'},
 {key:'shaftGuardian',bossId:112,openerId:89,level:55,group:'finale',chapter:13,channel:'finaleFight'},
 {key:'varekFinal',bossId:150,openerId:62,level:60,group:'finale',chapter:14,channel:'finaleFight'}
];
for(const c of cases){
 const roster=p.storyBossRoster(c.key,c.bossId,c.level);
 assert.equal(roster.length,2,'Two stages for '+c.key);
 assert.deepEqual(Array.from(roster.map(x=>x.id)),[c.openerId,c.bossId],'Correct story order');
 assert.equal(roster[0].lv,c.level-4,'Weaker opening level');
 s.team=[p.createMonsterInstance(3,c.level)];
 s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';
 p.startTrainerBattle(null,c.key,roster);
 s.battle[c.channel]=c.key;
 const scale=p.bossMultipliers(c.group,c.chapter);
 const originalHp=s.battle.enemyQueue.map(x=>x.maxHp);
 p.scaleBossRoster(s.battle.enemyQueue,scale);
 const b=s.battle;
 assert.equal(b.enemyQueue.length,2);
 assert.equal(b.enemy.maxHp,Math.round(originalHp[0]*scale.hp*.65));
 assert.equal(b.enemy.encounterScale,scale.attack*.77);
 assert.equal(b.enemyQueue[1].maxHp,Math.round(originalHp[1]*scale.hp));
 assert.equal(b.enemyQueue[1].encounterScale,scale.attack);
 const before=events.length;
 p.handleEnemyDefeated();
 assert.equal(s.mode,'BATTLE','First phase does not end '+c.key);
 assert.equal(events.length,before,'First phase must not award victory');
 assert.equal(b.enemy.id,c.bossId,'Final boss must follow opener');
 assert.equal(b.enemyHealUsed,false,'Healing allowance reset for final enemy');
 p.handleEnemyDefeated();
 assert.equal(s.mode,'DIALOG','Last phase returns to dialogue');
 assert.equal(events.length,before+1,'One story callback only after final phase');
 assert.equal(events.at(-1),c.key,'Correct story event');
}
for(const boss of ['vexFrost','ringGuardian','postgameTrial0','smelter','guard']){
 const roster=p.storyBossRoster(boss,89,25);
 assert.equal(roster.length,1,'Unrelated boss remains single stage');
}
// A defeat in the *second* wave must not accidentally complete the story.
const last=cases[2],beforeLoss=events.length;
s.team=[p.createMonsterInstance(1,3)];s.mode='OVERWORLD';s.scene='OVERWORLD';
s.currentMapId='legacy_wurzeldorf';
p.startTrainerBattle(null,'Finale retry',p.storyBossRoster(last.key,last.bossId,last.level));
s.battle.finaleFight=last.key;
p.handleEnemyDefeated(); // Opener vanquished, boss still active.
assert.equal(s.battle.enemy.id,last.bossId);
s.team[0].hp=1;
p.enemyCounterAttack();
let guard=0;while(timers.length&&guard++<40)timers.shift()();
assert(guard<40,'Defeat queue stalled');
assert.equal(s.mode,'DIALOG','Defeat should show rescue dialogue');
assert.equal(s.scene,'HOUSE','Defeat returns to the safe house in legacy harness');
assert.equal(events.length,beforeLoss,'No story victory on failed final wave');
// A replay must start from the opener again, never from a half-completed boss.
s.mode='OVERWORLD';p.startTrainerBattle(null,'Finale retry',p.storyBossRoster(last.key,last.bossId,last.level));
assert.equal(s.battle.enemyQueue.length,2);
assert.equal(s.battle.enemy.id,last.openerId);
console.log('PASS late boss phases: Varek 11, shaft 13, finale 14; retry after loss, no early reward');
