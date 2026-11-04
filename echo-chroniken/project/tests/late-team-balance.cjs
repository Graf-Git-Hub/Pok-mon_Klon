// Seeded late-game 3-member party / potion economy diagnostic using actual combat engine.
// Starts at fixed chapter levels, not a full campaign or a claim about actual player levels.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[];
const document={documentElement:{classList:{add(){}}},getElementById(k){return elements[k]??(elements[k]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
let seed=1;
const fixedMath=Object.create(Math);
fixedMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:fixedMath,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const f of ['data/species.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),env);
const game=fs.readFileSync('src/game.js','utf8'),mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(game.includes(mark));
vm.runInNewContext(game.replace(mark,
 'window.lateProbe={state:gameState,createMonsterInstance,startTrainerBattle,executeBattleAction,useSelectedAttack,ATTACKS,bossMultipliers,potionHealAmount};\n'+mark),env);
const p=window.lateProbe;
const cases=[
 {chapter:'11 Varek',level:45,enemy:62,group:'endgame',ch:11,cap:47},
 {chapter:'13 Schachtwache',level:50,enemy:112,group:'finale',ch:13,cap:55},
 {chapter:'14 Varek-Finale',level:57,enemy:150,group:'finale',ch:14,cap:60},
 {chapter:'Postgame Garten',level:60,enemy:57,group:'postgame',ch:15,cap:65}
];
function duel(spec,gap,iteration){
 seed=((iteration+1)*100003+spec.enemy*103+gap*997)>>>0;timers.length=0;
 const level=Math.max(5,spec.level+gap);
 const team=[p.createMonsterInstance(3,level),p.createMonsterInstance(114,level-1),p.createMonsterInstance(98,level-2)];
 const s=p.state;s.team=team;s.potions=6;s.orbs=5;s.mode='OVERWORLD';s.scene='OVERWORLD';
 s.currentMapId='legacy_wurzeldorf';s.safeSpawnId='legacy_current_position';
 const foeLv=Math.max(spec.group==='postgame'?12:spec.group==='finale'?20:18,Math.min(spec.cap,level+2));
 p.startTrainerBattle(null,spec.chapter,[{id:spec.enemy,lv:foeLv}]);
 const b=s.battle,foe=b.enemy,scale=p.bossMultipliers(spec.group,spec.ch);
 foe.maxHp=Math.round(foe.maxHp*scale.hp);foe.hp=foe.maxHp;foe.encounterScale=scale.attack;
 let rounds=0,heals=0;
 for(;rounds<65;rounds++){
  const ally=s.team.find(m=>m.hp>0);
  if(!ally)break;
  b.busy=false;
  if(s.potions>0&&ally.hp<ally.maxHp*.35&&ally.hp<foe.hp){
   const before=s.potions;
   p.executeBattleAction(2);
   if(s.potions<before)heals++;
  }else{
   const attack=ally.moves.map((id,i)=>({id,i,move:p.ATTACKS[id]}))
    .filter(x=>x.move&&x.move.power>0).sort((a,b)=>b.move.power-a.move.power)[0];
   assert(attack, 'No offensive move');
   b.attackCursor=attack.i;p.useSelectedAttack();
  }
  let safety=0;
  while(timers.length&&safety++<60)timers.shift()();
  assert(safety<60,'Infinite combat timeout queue');
  if(foe.hp<=0)return {win:true,rounds:rounds+1,heals,remaining:team.reduce((sum,m)=>sum+Math.max(0,m.hp),0)};
  if(s.mode==='OVERWORLD'||s.scene==='HOUSE')return {win:false,rounds:rounds+1,heals,remaining:0};
 }
 return {win:false,rounds,heals,timeout:rounds>=65};
}
const results=[];
for(const spec of cases)for(const gap of [0,-5,-10]){
 const draws=Array.from({length:50},(_,i)=>duel(spec,gap,i));
 const won=draws.filter(r=>r.win);
 const entry={chapter:spec.chapter,teamLevel:spec.level+gap,levelGap:gap,duels:draws.length,wins:won.length,
  winRatePct:won.length*2,avgRounds:+(draws.reduce((n,r)=>n+r.rounds,0)/draws.length).toFixed(1),
  avgPotions:+(draws.reduce((n,r)=>n+r.heals,0)/draws.length).toFixed(1),
  timeouts:draws.filter(r=>r.timeout).length};
 results.push(entry);
}
const report={method:'Real combat engine; seeded 3-person team (3/114/98), 6 potions, strongest offensive skill, heal below 35%, scaled bosses. Fixed chapter start, no overworld grind or story time.',results};
const dest=path.resolve('../docs/visual-audit/battle-balance/late-team-balance-report.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log('LATE_TEAM_BALANCE',JSON.stringify(results));
assert(results.filter(x=>x.levelGap===0).every(x=>x.winRatePct>=80),'On-level team should win at least 80%');
assert(results.every(x=>x.timeouts===0),'No battle may stall after 65 rounds');
console.log('PASS late-team balance: 600 seeded 3-member duels with genuine potions');
