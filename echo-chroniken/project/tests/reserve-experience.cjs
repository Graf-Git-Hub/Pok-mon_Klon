// Real battle reward integration: finite reserve XP pool, normal evolution, and save compatibility.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},stored={};
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},
 setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const engine=fs.readFileSync('src/game.js','utf8');
const mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(engine.includes(mark));
vm.runInNewContext(engine.replace(mark,'window.testRewards={state:gameState,createMonsterInstance,startTrainerBattle,handleEnemyDefeated};\n'+mark),env);
const {state:s,createMonsterInstance:create,startTrainerBattle,handleEnemyDefeated:win}=window.testRewards;
const fresh=(id=4,lv=5)=>create(id,lv);
function battle(lv=4,number=1){
 startTrainerBattle(null,'Trainer-Test',Array.from({length:number},(_,i)=>({id:4+i,lv})));
 for(let i=0;i<number;i++)win();
}
function reset(...team){s.team=team;s.caughtIds={};s.seenIds={};s.mode='OVERWORLD';s.battle=null;}
{
 const active=fresh(),bench=fresh(5);reset(active,bench);
 battle();
 assert.equal(active.xp,62,'Active monster gets original full 62 XP');
 assert.equal(bench.xp,24,'Healthy bench gets 40% pool rounded down');
 assert.equal(active.lv,5);assert.equal(bench.lv,5);
}
{
 const active=fresh(),knocked=fresh(5),healthy=fresh(6);
 knocked.hp=0;reset(active,knocked,healthy);battle();
 assert.equal(active.xp,62);
 assert.equal(knocked.xp,0,'Fainted monsters never gain passive XP');
 assert.equal(healthy.xp,24,'Entire reserve pool goes to one healthy companion');
}
{
 const team=Array.from({length:6},(_,i)=>fresh(i+4));
 reset(...team);battle();
 assert.equal(team[0].xp,62);
 for(const ally of team.slice(1))assert.equal(ally.xp,4,'Small extra pool shared equally');
 assert(team.slice(1).reduce((total,m)=>total+m.xp,0)<=Math.floor(62*.4));
 assert.equal(team.length,6,'Party does not expand or change ordering');
}
{
 const active=fresh(4),reserve=fresh(1,7);
 reserve.xp=125;reserve.nextXp=126;
 const oldMax=reserve.maxHp;
 reset(active,reserve);
 battle();
 assert.equal(active.xp,62);
 assert.equal(reserve.id,2,'Passive XP must trigger normal Miora -> Seelara evolution');
 assert.equal(reserve.lv,8);
 assert.equal(reserve.xp,23,'Threshold XP consumed exactly once');
 assert.equal(reserve.nextXp,144);
 assert.equal(reserve.maxHp,oldMax+20,'Existing evolution and level-up HP rules');
 assert.equal(reserve.hp,reserve.maxHp);
 assert.equal(s.caughtIds[2],true);
 assert.equal(s.seenIds[2],true);
 assert(reserve.moves.includes('mondschein')||reserve.moves.includes('lichtfunke'));
}
{
 const active=fresh(4),reserve=fresh(5);
 reset(active,reserve);
 battle(4,2);
 assert.equal(active.lv,6);
 assert.equal(active.xp,34,'Two enemies grant 2 x 62 XP, with original level-up threshold');
 assert.equal(reserve.xp,48,'Two separate opponents grant 2 x 24 reserve XP');
}
{
 const alone=fresh();reset(alone);battle();
 assert.equal(alone.xp,62,'Solo parties do not lose experience');
 assert(!('reserveXp' in alone),'No save-schema field introduced');
}
console.log('PASS reserve XP: 40% bounded pool, solo, 6 members, KO exclusion, evolution, two-round trainer');
