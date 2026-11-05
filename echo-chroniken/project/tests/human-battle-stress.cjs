// Multiple human-like tactics against REAL late-story combat engine, not a campaign.
// No source modification. Detect lost fights separately from victory dialogue.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function ctx(){return new Proxy({measureText(x){return {width:String(x).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}})}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}}}
const els={},timers=[],document={documentElement:{classList:{add(){}}},getElementById(id){return els[id]??(els[id]=el())},createElement:el,addEventListener(){}},window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
let seed=1;
const math=Object.create(Math);
math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const f of ['data/species.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),env);
const src=fs.readFileSync('src/game.js','utf8'),point='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(src.includes(point));
vm.runInNewContext(src.replace(point,'window.stress={s:gameState,createMonsterInstance,startTrainerBattle,executeBattleAction,useSelectedAttack,ATTACKS,bossMultipliers,storyBossRoster,scaleBossRoster};\n'+point),env);
const p=window.stress;
const scenarios=[
 {name:'Kap.11 Varek',lv:16,friend:7,friendLv:10,boss:'varekFirst',foe:62,group:'endgame',chapter:11,min:18},
 {name:'Kap.13 Schachtwache',lv:18,friend:8,friendLv:12,boss:'shaftGuardian',foe:112,group:'finale',chapter:13,min:20},
 {name:'Kap.14 Varek',lv:19,friend:8,friendLv:13,boss:'varekFinal',foe:150,group:'finale',chapter:14,min:20},
 {name:'Postgame Garten',lv:22,friend:8,friendLv:14,boss:'gardenTrial',foe:57,group:'postgame',chapter:15,min:12}
];
const policies=['best','first-offensive','weakest','random-offensive','first-slot'];
function simulate(spec,policy,potions,partySize,n){
 seed=(7777+spec.foe*89+potions*659+partySize*41+n*7919)>>>0;
 timers.length=0;
 const s=p.s;
 s.team=[p.createMonsterInstance(3,spec.lv),p.createMonsterInstance(spec.friend,spec.friendLv)].slice(0,partySize);
 s.hasStarter=true;s.potions=potions;s.orbs=10;s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';s.safeSpawnId='legacy_current_position';s.battleWins=0;
 const enemyLv=Math.max(spec.min,Math.min(60,spec.lv+2));
 const roster=p.storyBossRoster(spec.boss,spec.foe,enemyLv);
 p.startTrainerBattle(null,spec.name,roster);
 const b=s.battle;p.scaleBossRoster(b.enemyQueue,p.bossMultipliers(spec.group,spec.chapter));
 let attacks=0,heals=0,rounds=0,firstHealWithoutEffect=0;
 function flush(){
  let count=0;
  while(timers.length&&count++<100)timers.shift()();
  assert(count<100,'Combat timer loop');
 }
 for(;rounds<100;rounds++){
  if(s.mode!=='BATTLE'){
   return {win:s.battleWins===roster.length&&s.mode==='DIALOG',rounds,attacks,heals,loss:s.battleWins<roster.length};
  }
  const ally=s.team.find(m=>m.hp>0);
  if(!ally)break;
  b.busy=false;
  if(s.potions>0&&ally.hp<ally.maxHp*.38&&policy!=='first-slot'){
   const pre=s.potions;
   p.executeBattleAction(2);flush();
   if(s.potions<pre){heals++;continue}
  }
  const opts=ally.moves.map((id,i)=>({id,i,power:p.ATTACKS[id]?.power||0})).filter(x=>policy==='first-slot'||x.power>0);
  assert(opts.length,'No attacks');
  let selected=opts[0];
  if(policy==='best') selected=opts.reduce((a,c)=>c.power>a.power?c:a);
  else if(policy==='weakest') selected=opts.reduce((a,c)=>c.power<a.power?c:a);
  else if(policy==='random-offensive') selected=opts[Math.floor(math.random()*opts.length)];
  if(selected.power===0)firstHealWithoutEffect++;
  b.attackCursor=selected.i;p.useSelectedAttack();attacks++;
  flush();
 }
 return {win:false,rounds,attacks,heals,loss:true,timeout:rounds>=100,firstHealWithoutEffect};
}
const results=[];let executed=0;
for(const spec of scenarios)for(const policy of policies)for(const potions of [0,2,6])for(const members of [1,2]){
 const N=40;
 const draws=Array.from({length:N},(_,i)=>simulate(spec,policy,potions,members,i));
 executed+=N;
 results.push({boss:spec.name,policy,potions,members,attempts:N,
  wins:draws.filter(x=>x.win).length,
  winPct:Math.round(draws.filter(x=>x.win).length/N*100),
  rounds:+(draws.reduce((a,b)=>a+b.rounds,0)/N).toFixed(1),
  heals:+(draws.reduce((a,b)=>a+b.heals,0)/N).toFixed(2),
  timeouts:draws.filter(x=>x.timeout).length});
}
const report={method:'Real game combat engine with naturally observed levels (16/18/19/22), 1 or 2 party members, 0/2/6 potions and five attack-selection tactics. 40 deterministic RNG seeds per combination. Isolated battles, not a natural end-to-end campaign.',executed,scenarios,results};
const out=path.resolve('../docs/visual-audit/stress-testing/human-battle-report.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('HUMAN_STRESS_DUELS',executed);
console.log('SUMMARY BY POLICY',JSON.stringify(Object.fromEntries(policies.map(policy=>[policy,{winPct:+(results.filter(x=>x.policy===policy).reduce((a,b)=>a+b.wins,0)/results.filter(x=>x.policy===policy).reduce((a,b)=>a+b.attempts,0)*100).toFixed(1),timeouts:results.filter(x=>x.policy===policy).reduce((a,b)=>a+b.timeouts,0)}]))));
console.log('NO-POTIONS',JSON.stringify(results.filter(x=>x.potions===0&&x.members===2).map(x=>({boss:x.boss,policy:x.policy,winPct:x.winPct}))));
assert(results.every(x=>x.timeouts===0),'A tactic caused >100-turn combat loop');
