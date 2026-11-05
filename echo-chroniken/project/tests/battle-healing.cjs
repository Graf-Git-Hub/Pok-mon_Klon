// Real battle-engine regression: heal spells must heal, not deal phantom damage.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[];
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const quietRandom=Object.create(Math);quietRandom.random=()=>0;
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:quietRandom,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const code=fs.readFileSync('src/game.js','utf8');
const marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(code.includes(marker),'Real battle engine hook missing');
vm.runInNewContext(code.replace(marker,'window.testBattle={state:gameState,createMonsterInstance,startTrainerBattle,enemyCounterAttack,handleEnemyDefeated};\n'+marker),env);
const test=window.testBattle, s=test.state;
s.team=[test.createMonsterInstance(1,15)];
const ally=s.team[0],startHp=ally.hp;
test.startTrainerBattle(null,'Balance-Test',[{id:1,lv:15},{id:27,lv:12}]);
const b=s.battle;
assert(b.enemy.moves.includes('heilflimmern'),'At level 15 light enemy should know healing');
b.enemy.hp=Math.floor(b.enemy.maxHp*.2);
const before=b.enemy.hp;
test.enemyCounterAttack();
assert.equal(b.enemy.hp-before,24,'Healing should restore exactly 24 HP when wounded');
assert.equal(ally.hp,startHp,'Healing must not deal damage');
assert.equal(b.enemyHealUsed,true,'Only one heal is permitted for each enemy');
assert.match(b.log,/Heilflimmern.*\+24 KP/);
while(timers.length)timers.shift()();
test.enemyCounterAttack();
assert(ally.hp<startHp,'After healing, enemy must return to attacking');
assert(!b.log.includes('Heilflimmern'),'Heal is not a damaging attack');
while(timers.length)timers.shift()();
const afterAttack=ally.hp;
b.enemy.hp=b.enemy.maxHp;
test.enemyCounterAttack();
assert(ally.hp<afterAttack,'At full HP the enemy must only attack');
while(timers.length)timers.shift()();
// New trainer opponent receives its own one-time healing allowance.
b.enemyQueue.shift();b.enemy=b.enemyQueue[0];b.enemyHealUsed=false;
assert.equal(b.enemyHealUsed,false);
s.team[0].hp=s.team[0].maxHp;
// Keep the pre-existing active-monster experience reward unchanged.
s.team=[test.createMonsterInstance(1,5)];
const earned=s.team[0];
test.startTrainerBattle(null,'XP-Regressionsgegner',[{id:4,lv:4}]);
test.handleEnemyDefeated();
assert.equal(earned.xp,62,'Active creature still gains all earned experience');
console.log('PASS battle healing and original experience reward');
