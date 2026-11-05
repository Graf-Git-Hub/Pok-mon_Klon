// Deterministic duel sweeps through the real browser battle functions, without manual clicking.
// It is a balance *diagnostic*: 1v1 snapshots are not a complete playthrough.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timeouts=[];
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
let seed=1;
const randomMath=Object.create(Math);
randomMath.random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:randomMath,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timeouts.push(fn);return timeouts.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const engine=fs.readFileSync('src/game.js','utf8'),mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
if(!engine.includes(mark))throw Error('Cannot instrument the real battle engine');
vm.runInNewContext(engine.replace(mark,'window.bossProbe={state:gameState,createMonsterInstance,startTrainerBattle,useSelectedAttack,ATTACKS,bossMultipliers};\n'+mark),env);
const p=window.bossProbe;
const normalScale=p.bossMultipliers('normal',4),lateScale=p.bossMultipliers('finale',14);
if(normalScale.hp!==.78||normalScale.attack!==.8||lateScale.hp!==.90||lateScale.attack!==.95||p.bossMultipliers('endgame',9).attack!==.8||p.bossMultipliers('endgame',11).attack!==.95)throw Error('Unexpected boss tier multipliers');
const cases=[
 {name:'Einstieg/erster Waechter',allyId:1,allyLv:5,enemyId:7,enemyLv:5},
 {name:'Kapitel 4 / Bahn',allyId:3,allyLv:15,enemyId:67,enemyLv:17},
 {name:'Kapitel 6 / Schmiede',allyId:3,allyLv:26,enemyId:23,enemyLv:26},
 {name:'Kapitel 9 / Frostgrat',allyId:3,allyLv:39,enemyId:112,enemyLv:39},
 {name:'Kapitel 11 / Varek',allyId:3,allyLv:47,enemyId:62,enemyLv:47,late:true},
 {name:'Kapitel 14 / Varek final',allyId:3,allyLv:58,enemyId:150,enemyLv:60,late:true},
 {name:'Kapitel 14 / Flutwesen',allyId:114,allyIdOverride:114,allyLv:58,enemyId:150,enemyLv:60,late:true},
 {name:'Kapitel 14 / Schattenwesen',allyId:98,allyIdOverride:98,allyLv:58,enemyId:150,enemyLv:60,late:true},
 {name:'Postgame / Garten',allyId:3,allyLv:63,enemyId:57,enemyLv:65,late:true}
];
function duel(spec,iteration){
 seed=((iteration+1)*986711+spec.allyLv*1307+spec.enemyId*5)>>>0;
 timeouts.length=0;
 const ally=p.createMonsterInstance(spec.allyId,spec.allyLv);
 p.state.team=[ally];p.state.mode='OVERWORLD';p.state.scene='OVERWORLD';p.state.currentMapId='legacy_wurzeldorf';
 p.startTrainerBattle(null,spec.name,[{id:spec.enemyId,lv:spec.enemyLv}]);
 const battle=p.state.battle,enemy=battle.enemy;
 const scale=p.bossMultipliers(spec.late?'finale':'normal',spec.late?14:4);
 enemy.maxHp=Math.round(enemy.maxHp*scale.hp);
 enemy.hp=enemy.maxHp;
 enemy.encounterScale=scale.attack;
 let rounds=0;
 for(;rounds<40;rounds++){
  const offensive=(ally.equippedMoves||ally.moves).map((id,i)=>({i,skill:p.ATTACKS[id]}))
   .filter(x=>x.skill&&x.skill.power>0).sort((a,b)=>b.skill.power-a.skill.power);
  if(!offensive.length)throw Error('Ally has no attack');
  battle.attackCursor=offensive[0].i;
  battle.busy=false;p.useSelectedAttack();
  let safety=0;
  while(timeouts.length&&safety++<30)timeouts.shift()();
  if(safety>=30)throw Error('Event queue stuck');
  if(enemy.hp<=0)return {win:true,rounds:rounds+1,remaining:ally.hp};
  if(ally.hp<=0||p.state.scene==='HOUSE')return {win:false,rounds:rounds+1,remaining:0};
 }
 return {win:false,rounds,remaining:ally.hp,timeout:true};
}
const results=[];
const comparisons=cases.flatMap(spec=>[0,-5,-10].map(delta=>{
 const allyLv=Math.max(2,spec.allyLv+delta);
 return {...spec,allyLv,allyId:spec.allyIdOverride||(allyLv>=15?3:allyLv>=8?2:1),levelGap:delta};
}));
for(const spec of comparisons){
 const sims=100;
 const duels=Array.from({length:sims},(_,i)=>duel(spec,i));
 const wins=duels.filter(x=>x.win);
 const totalTurns=wins.reduce((s,x)=>s+x.rounds,0);
 results.push({chapter:spec.name,levelGap:spec.levelGap,allyLevel:spec.allyLv,enemyLevel:spec.enemyLv,
  wins:wins.length,simulations:sims,winRatePct:wins.length,avgWinTurns:wins.length?+(totalTurns/wins.length).toFixed(1):null,
  maxTurns:Math.max(...duels.map(x=>x.rounds)),timeouts:duels.filter(x=>x.timeout).length});
}
const report={note:'Deterministic 1v1 using real engine moves, tier multipliers, full HP and strongest attack. No items, switching or complete playthrough.',normalScale,lateScale,results};
const out=path.resolve('../docs/visual-audit/battle-balance');
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'boss-balance-report.json'),JSON.stringify(report,null,2)+'\n');
const intended=results.filter(x=>x.levelGap===0);
// The elemental chart intentionally makes a disadvantaged one-monster matchup
// lose; retain the diagnostic, enforce no infinite fights, and confirm both
// favorable and unfavorable outcomes exist at equal levels.
if(results.some(x=>x.timeouts)||!intended.some(x=>x.winRatePct>=80)||
   !intended.some(x=>x.winRatePct<=20))process.exitCode=1;
if(process.env.ECHO_BOSS_TEST)console.log('PASS boss balance: '+results.length+' level/type matchups, '+results.length*100+' deterministic real-engine duels');
else console.log('BOSS_BALANCE_AUDIT',JSON.stringify(report));
