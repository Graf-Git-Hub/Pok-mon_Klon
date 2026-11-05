// Deterministic sandbox on real engine functions; comparisons, no changes to story state.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timeouts=[];
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
let seed=1;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn){timeouts.push(fn);return timeouts.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const src=fs.readFileSync('src/game.js','utf8'),mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
vm.runInNewContext(src.replace(mark, 'window.probe={state:gameState,createMonsterInstance,startTrainerBattle,executeBattleAction,useSelectedAttack,ATTACKS,bossMultipliers};\n'+mark),env);
const p=window.probe;
const specs=[
 {name:'Varek chapter 11',lv:43,boss:62,pre:89,cap:47,group:'endgame',ch:11},
 {name:'Shaft guardian chapter 13',lv:50,boss:112,pre:89,cap:55,group:'finale',ch:13},
 {name:'Varek chapter 14',lv:56,boss:150,pre:62,cap:60,group:'finale',ch:14},
 {name:'Garden postgame',lv:60,boss:57,pre:27,cap:65,group:'postgame',ch:15}
];
function run(spec,phase,teamCount,levelDrop,index){
 seed=((index+1)*17117 + spec.boss*103 + teamCount*701+phase*4561+levelDrop*997)>>>0;
 timeouts.length=0;const lv=spec.lv-levelDrop;
 const s=p.state;s.team=[p.createMonsterInstance(3,lv),p.createMonsterInstance(114,lv-1),p.createMonsterInstance(98,lv-2)].slice(0,teamCount);
 s.potions=6;s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';s.safeSpawnId='legacy_current_position';
 const enemyLv=Math.min(spec.cap,lv+2);
 const roster=phase===1?[{id:spec.boss,lv:enemyLv}]:[{id:spec.pre,lv:Math.max(3,enemyLv-4)},{id:spec.boss,lv:enemyLv}];
 p.startTrainerBattle(null,spec.name,roster);
 const b=s.battle;
 const scale=p.bossMultipliers(spec.group,spec.ch);
 b.enemyQueue.forEach((enemy,i)=>{
  enemy.maxHp=Math.round(enemy.maxHp*scale.hp*(i===0&&phase===2?.65:1));
  enemy.hp=enemy.maxHp;enemy.encounterScale=scale.attack*(i===0&&phase===2?.77:1);
 });
 let attacks=0,heals=0,knockouts=0;
 for(let turn=0;turn<95;turn++){
  if(s.mode==='DIALOG')return {win:true,attacks,heals,knockouts,turns:turn,potions:s.potions};
  if(s.mode!=='BATTLE')return {win:false,attacks,heals,knockouts,turns:turn,potions:s.potions};
  const ally=s.team.find(x=>x.hp>0);
  if(!ally)return {win:false,attacks,heals,knockouts:teamCount,turns:turn,potions:s.potions};
  const others=s.team.filter(x=>x.hp<=0).length;knockouts=Math.max(knockouts,others);
  b.busy=false;
  if(s.potions>0 && ally.hp<ally.maxHp*.40){
    const before=s.potions;p.executeBattleAction(2);heals+=before-s.potions;
  }else{
    const move=(ally.equippedMoves||ally.moves).map((id,i)=>({id,i,s:p.ATTACKS[id]})).filter(x=>x.s&&x.s.power>0).sort((a,b)=>b.s.power-a.s.power)[0];
    assert(move,'No damage move');b.attackCursor=move.i;p.useSelectedAttack();attacks++;
  }
  let loops=0;while(timeouts.length&&loops++<80)timeouts.shift()();
  assert(loops<80,'Event loop hung');
 }
 return {win:false,timeout:true,attacks,heals,knockouts,turns:95,potions:s.potions};
}
const results=[];
for(const spec of specs)for(const phase of [1,2])for(const team of [1,3])for(const gap of [0,8]){
 const samples=Array.from({length:30},(_,i)=>run(spec,phase,team,gap,i));
 results.push({chapter:spec.name,phases:phase,teamCount:team,levelGap:gap,winPct:Math.round(samples.filter(x=>x.win).length/30*100),
  potions:+(samples.reduce((s,x)=>s+x.heals,0)/30).toFixed(2),turns:+(samples.reduce((s,x)=>s+x.turns,0)/30).toFixed(1),timeouts:samples.filter(x=>x.timeout).length});
}
const report={method:'Real combat engine: 960 seeded duels. Compare original 1 opponent versus two-stage weaker opener + final enemy, with 1 or 3 party members, on-level or 8 levels below, 6 potions, no grind. This is not a natural campaign.',results};
const fileOut=path.resolve('../docs/visual-audit/battle-balance/late-roster-balance-report.json');
fs.mkdirSync(path.dirname(fileOut),{recursive:true});
fs.writeFileSync(fileOut,JSON.stringify(report,null,2)+'\n');
assert(results.every(r=>r.winPct>=80),'The two-stage boss must not softlock weaker or solo players');
assert(results.every(r=>r.timeouts===0),'No simulation may stall');
assert(results.filter(r=>r.phases===2).every(r=>r.turns<=25),'No excessive boss duration');
console.log('PASS 960 real-engine boss duels: solo/trio, on-level/8 below, one versus two phases');
