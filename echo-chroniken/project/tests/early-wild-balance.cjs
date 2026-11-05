// Early-field seeded combat audit: actually attack level 2-5 wild spirits with fresh starters.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[],document={documentElement:{classList:{add(){}}},getElementById(k){return elements[k]??(elements[k]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
let seed=1;
const rnd=Object.create(Math);rnd.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:rnd,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const f of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),env);
const code=fs.readFileSync('src/game.js','utf8'),mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
vm.runInNewContext(code.replace(mark,'window.earlyProbe={s:gameState,createMonsterInstance,startWildBattle,useSelectedAttack,ATTACKS};\n'+mark),env);
const p=window.earlyProbe;
function trial(at,lv,afterWins,i){
 seed=((i+1)*100003+at[0]*7777+at[1]*199+lv*811)>>>0;timers.length=0;
 const s=p.s,starter=p.createMonsterInstance(1,lv);s.team=[starter];s.badges=0;s.battleWins=afterWins;
 s.player={x:at[0],y:at[1],dir:'down',stepPhase:0};
 s.scene='OVERWORLD';s.currentMapId='legacy_wurzeldorf';s.mode='OVERWORLD';s.hasStarter=true;
 p.startWildBattle();
 const foe=s.battle.enemy;
 assert(foe.lv<=lv+1&&foe.lv<=5,'Wild over beginner cap '+foe.lv);
 assert(foe.encounterScale<=.78,'Wild newcomer scaling lost');
 let rounds=0;
 for(;rounds<30;rounds++){
  const b=s.battle;
  if(starter.hp<=0)break;
  const attack=(starter.equippedMoves||starter.moves).map((id,index)=>({index,move:p.ATTACKS[id]}))
   .filter(x=>x.move&&x.move.power>0).sort((a,b)=>b.move.power-a.move.power)[0];
  assert(attack);b.busy=false;b.attackCursor=attack.index;p.useSelectedAttack();
  let guard=0;while(timers.length&&guard++<40)timers.shift()();
  assert(guard<40,'Infinite battle queue');
  if(foe.hp<=0)return {win:true,enemyLevel:foe.lv,rounds:rounds+1,hp:starter.hp};
  if(s.mode==='OVERWORLD'||s.scene==='HOUSE')break;
 }
 return {win:false,enemyLevel:foe.lv,rounds,hp:0};
}
const cases=[
 {label:'Home meadow, Lv3 protected',xy:[5,6],lv:3,wins:0},
 {label:'Early road, Lv3 protected',xy:[13,17],lv:3,wins:0},
 {label:'North edge, Lv5 post-protection',xy:[30,20],lv:5,wins:3},
 {label:'Far field, Lv5 post-protection',xy:[34,24],lv:5,wins:3}
];
const results=[];
for(const c of cases){
 const draw=Array.from({length:100},(_,i)=>trial(c.xy,c.lv,c.wins,i));
 const won=draw.filter(r=>r.win);
 results.push({case:c.label,starterLv:c.lv,duels:100,wins:won.length,losses:100-won.length,
  maxEnemyLv:Math.max(...draw.map(r=>r.enemyLevel)),
  avgRounds:+(draw.reduce((n,r)=>n+r.rounds,0)/100).toFixed(1)});
}
const report={method:'Real wild-battle engine; 400 fixed-seed fights, starter only, full HP every trial, strongest attack, no potions, no grinding; protection at 0 wins vs after 3 wins.',results};
const dest=path.resolve('../docs/visual-audit/battle-balance/early-wild-balance-report.json');
fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log('EARLY_WILD_BALANCE',JSON.stringify(results));
assert(results.every(r=>r.wins>=80),'Beginner wild battles too punishing');
console.log('PASS early wild balance: 400 actual seeded Lv3-5 encounters');
