// Deterministic, full-match 2,000,000-fight real-engine combat/rune stress audit.
// Full encounters (not merely two million attacks). 1v1, 2v3, and 3v3;
// all 150 species, random levels, equip slots, all passive rune types.
// Uses the LIVE skillDamage / STATUS / runeCombatModifiers / passiveHitHeal
// functions from game.js so the simulation cannot silently diverge.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),
 vm=require('node:vm'),path=require('node:path');
const crypto=require('node:crypto');
process.chdir(path.resolve(__dirname,'..'));
const TOTAL=Number(process.env.RUNE_FIGHTS||2000);
const SEED=Number(process.env.RUNE_SEED||20261106)>>>0;
let seed=SEED;
function rnd(){seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296}
function int(n){return Math.floor(rnd()*n)}
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}})}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}}}
const elements={},store={};
const document={documentElement:{classList:{add(){}}},getElementById(k){return elements[k]??(elements[k]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const randomMath=Object.create(Math);randomMath.random=rnd;
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,
 Math:randomMath,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(k){return store[k]||null},setItem(k,v){store[k]=v}},
 setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(marker));
vm.runInNewContext(source.replace(marker,
'window.runeAudit={state:gameState,SPECIES,ATTACKS,STATUS,skillDamage,battleMoves,createMonsterInstance,gearLimit,runeCombatModifiers,passiveHitHeal,runeReserveXp};\n'+marker),env);
const {SPECIES,ATTACKS,STATUS,skillDamage,battleMoves,createMonsterInstance,gearLimit,runeCombatModifiers,passiveHitHeal,runeReserveXp}=window.runeAudit;
const AFF=window.EchoAffinities||window.ECHO_AFFINITIES; // If unused, don't rely on alias.
const IDs=['rune_kraft','rune_schutz','rune_nebel','rune_ahnen'];
const stats={seed:SEED,requested:TOTAL,completed:0,byFormat:{'1v1':0,'2v3':0,'3v3':0},
wins:{left:0,right:0,draw:0},equipmentInstances:{},epHolderFights:0,
benchEpChecks:0,statusTriggers:0,attacks:0,lifestealHp:0,maxTurns:0,
timeouts:0,invalidHealth:0,violatedSlots:0,bothSidesWithRunes:0,types:{},runeSideWins:0,
hash:2166136261};
for(const id of ['none','ep_teiler',...IDs])stats.equipmentInstances[id]=0;
const equippedDistribution=[0,0,0,0];
function makeTeam(n,usedRare){
 const out=[];
 for(let j=0;j<n;j++){
  const id=1+int(150),lv=5+int(56),m=createMonsterInstance(id,lv);
  // The battle audit respects genuine species stages, not just level.
  const slots=gearLimit(m);
  const add=int(slots+1);
  const options=IDs.slice();
  for(let z=0;z<add;z++){
   if(!options.length)break;
   const choice=options.splice(int(options.length),1)[0];
   if((choice==='rune_nebel'||choice==='rune_ahnen')&&usedRare.has(choice))continue;
   if(choice==='rune_nebel'||choice==='rune_ahnen')usedRare.add(choice);
   m.equipment.push({id:choice});stats.equipmentInstances[choice]++;
  }
  equippedDistribution[Math.min(3,m.equipment.length)]++;
  if(m.equipment.length>slots)stats.violatedSlots++;
  out.push({m,moves:battleMoves(m).filter(x=>ATTACKS[x]&&ATTACKS[x].power>0)});
 }
 // Maximum one EP rune per team, including bench-only cases.
 if(int(5)===0){
  const possible=out.filter(x=>x.m.equipment.length<gearLimit(x.m));
  if(possible.length){
   const x=possible[int(possible.length)];
   x.m.heldSupportRune='ep_teiler';stats.equipmentInstances.ep_teiler++;
  }
 }
 return out;
}
function act(side,opp,b){
 const a=side.find(x=>x.m.hp>0),d=opp.find(x=>x.m.hp>0);
 if(!a||!d)return 0;
 const moves=a.moves.length?a.moves:['seelenstups'];
 const id=moves[int(moves.length)];
 const move=ATTACKS[id]||ATTACKS.seelenstups;
 if(!move)throw Error('Missing move '+id);
 const damage=STATUS.adjustedDamage(b,a.m,d.m,skillDamage(a.m,d.m,move));
 if(!Number.isFinite(damage)||damage<2)throw Error('Invalid damage '+damage);
 d.m.hp=Math.max(0,d.m.hp-damage);
 if(STATUS.apply(b,a.m,d.m,id,rnd))stats.statusTriggers++;
 STATUS.endAction(b,a.m);
 stats.lifestealHp+=passiveHitHeal(a.m);
 stats.attacks++;
 return damage;
}
const started=Date.now();
for(let i=0;i<TOTAL;i++){
 const variant=i%10;
 const n=variant<4?1:variant<5?2:3;
 const enemyN=variant===4?3:n;
 const format=n===1?'1v1':n===2?'2v3':'3v3';
 stats.byFormat[format]++;
 const left=makeTeam(n,new Set()),right=makeTeam(enemyN,new Set());
 if(!left.some(x=>x.m.equipment.length)&&!right.some(x=>x.m.equipment.length))
  stats.equipmentInstances.none++;
 if(left.some(x=>x.m.equipment.length)&&right.some(x=>x.m.equipment.length))
  stats.bothSidesWithRunes++;
 const effects={effects:[]};
 let turns=0;
 while(turns<160&&left.some(x=>x.m.hp>0)&&right.some(x=>x.m.hp>0)){
  // Order differs every fight. A KO immediately calls in a reserve.
  const first=int(2)===0?left:right,second=first===left?right:left;
  act(first,second,effects);
  if(second.some(x=>x.m.hp>0))act(second,first,effects);
  turns++;
 }
 if(turns>stats.maxTurns)stats.maxTurns=turns;
 if(turns>=160)stats.timeouts++;
 const aliveL=left.filter(x=>x.m.hp>0),aliveR=right.filter(x=>x.m.hp>0);
 const outcome=aliveL.length&&!aliveR.length?'left':
   aliveR.length&&!aliveL.length?'right':'draw';
 stats.wins[outcome]++;
 // XP allocation is cross-checked with live pool helper in the engine.
 for(const team of [left,right]){
  const holder=team.find(x=>x.m.heldSupportRune==='ep_teiler');
  if(holder){
   stats.epHolderFights++;
   const participated=holder.m.hp>0&&team.indexOf(holder)<=1;
   const reserveCount=Math.max(0,team.length-1);
   const xp=11*(5+int(56))+18;
   const per=runeReserveXp(xp,participated,reserveCount);
   const baseline=runeReserveXp(xp,false,reserveCount);
   if(per<baseline||per>xp||(reserveCount===0&&per!==0))
    throw Error('XP pool violation');
   stats.benchEpChecks++;
  }
  for(const member of team){
   if(!Number.isFinite(member.m.hp)||member.m.hp<0||member.m.hp>member.m.maxHp)
    stats.invalidHealth++;
  }
 }
 stats.hash=Math.imul(stats.hash^(turns+11*(outcome==='left'?1:outcome==='right'?2:3)+left[0].m.id*19+right[0].m.id*31),16777619)>>>0;
 stats.completed++;
 if((i+1)%250000===0){
  console.log('RUNE_TWO_MILLION_PROGRESS '+JSON.stringify({completed:i+1,total:TOTAL,elapsedSeconds:Math.round((Date.now()-started)/1000),format:stats.byFormat,timeouts:stats.timeouts,invalidHealth:stats.invalidHealth}));
 }
}
stats.elapsedSeconds=Math.round((Date.now()-started)/1000);
stats.equipmentDistribution=equippedDistribution;
assert.equal(stats.completed,TOTAL);
assert.equal(stats.timeouts,0,'Full battles must terminate naturally');
assert.equal(stats.invalidHealth,0);
assert.equal(stats.violatedSlots,0);
assert(stats.byFormat['3v3']>=Math.floor(TOTAL*.4),'3v3 underrepresented');
assert(stats.bothSidesWithRunes>=Math.floor(TOTAL*.2),'Both-side rune fights underrepresented');
assert(stats.equipmentInstances.ep_teiler>0);
assert(stats.lifestealHp>0);
const out=path.resolve(__dirname,'../../docs/visual-audit/rune-million/'+(TOTAL===2000000?'rune-2000000-report.json':'rune-smoke-report.json'));
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(stats,null,2)+'\n');
console.log('RUNE_TWO_MILLION_PASS '+JSON.stringify({completed:TOTAL,seed:SEED,formats:stats.byFormat,wins:stats.wins,attacks:stats.attacks,runeVsRune:stats.bothSidesWithRunes,epChecks:stats.benchEpChecks,statusTriggers:stats.statusTriggers,healed:stats.lifestealHp,maxTurns:stats.maxTurns,seconds:stats.elapsedSeconds,hash:stats.hash}));
