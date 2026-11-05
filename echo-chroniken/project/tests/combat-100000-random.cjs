// Exact 100,000 reproducibly random real-engine duels. Both opponents are sampled
// independently and uniformly from all 150 species. Same code runs on PC and GitHub.
// No player saves are loaded, written or changed.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
function ctx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get:(t,k)=>k in t?t[k]:()=>{},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const document={documentElement:{classList:{add(){}}},getElementById(id){return this._els[id]??(this._els[id]=el())},_els:{},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}},timers=[];
let rng=1;const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:math,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js',
 'src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),spot='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(spot),'Engine probe marker must exist');
vm.runInNewContext(source.replace(spot,
 'window.duelProbe={s:gameState,createMonsterInstance,startTrainerBattle,useSelectedAttack,ATTACKS};\n'+spot),env);
const p=window.duelProbe,species=window.ECHO_SPECIES,aff=window.EchoTypes;
assert.equal(species.length,150);
const TOTAL=100000,LEVELS=[5,10,15,20,25,30],TACTICS=['power','element','weak'];
// Independent seeded PRNG for opponent, level and tactic selection; battle uses its own seed.
let selectorState=0x91f00d;
function randomSelection(){selectorState=(selectorState+0x6D2B79F5)>>>0;
 let t=selectorState;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);
 return ((t^t>>>14)>>>0)/4294967296;
}
const pick=n=>Math.floor(randomSelection()*n);
const counts=()=>({fights:0,wins:0,turns:0});
const tactics=Object.fromEntries(TACTICS.map(x=>[x,counts()]));
const levels=Object.fromEntries(LEVELS.map(x=>[x,counts()]));
const stages=Object.fromEntries([1,2,3].map(x=>[x,counts()]));
const attackers=Array.from({length:150},(_,i)=>({...counts(),id:i+1,name:species[i].name,stage:species[i].stage}));
const defenderCounts=Array(150).fill(0);
let equalLevelFights=0;
const types={};
const sameStage=Array.from({length:150},()=>counts());
const digest=crypto.createHash('sha256');
let wins=0,losses=0,timeouts=0,turnSum=0,errors=[],maxTurns=0;
const add=(group,win,turns)=>{group.fights++;group.wins+=win?1:0;group.turns+=turns;};
for(let i=0;i<TOTAL;i++){
 const attacker=1+pick(150);  // independently sampled; no forced rotation
 const defender=1+pick(150);
 const level=LEVELS[pick(LEVELS.length)];
 // Half the duels have equal levels for fairness; the other half draw independently.
 const enemyLevel=i%2===0?level:LEVELS[pick(LEVELS.length)];
 const tactic=TACTICS[pick(TACTICS.length)];
 defenderCounts[defender-1]++;
 if(level===enemyLevel)equalLevelFights++;
 rng=(Math.imul(attacker,9941)+Math.imul(defender,16127)+Math.imul(level,70001)+Math.imul(i+1,131071))>>>0;
 timers.length=0;
 const s=p.s;s.team=[p.createMonsterInstance(attacker,level)];s.hasStarter=true;
 s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';
 s.safeSpawnId='legacy_current_position';s.potions=0;s.battleWins=0;
 p.startTrainerBattle(null,'100k random balance audit',[{id:defender,lv:enemyLevel}]);
 const b=s.battle;
 let rounds=0;
 for(;rounds<75;rounds++){
  if(s.mode!=='BATTLE'||s.team[0].hp<=0)break;
  b.busy=false;
  const moves=(s.team[0].equippedMoves||s.team[0].moves).map((id,index)=>({index,move:p.ATTACKS[id]}))
    .filter(x=>x.move&&x.move.power>0);
  assert(moves.length>0,'No offensive skills '+attacker+' at level '+level);
  const rating=x=>tactic==='element'?
    x.move.power*aff.effectiveness(x.move.type,b.enemy)*aff.stab(x.move.type,s.team[0]):x.move.power;
  const chosen=moves.reduce((a,c)=>{
    return (tactic==='weak'?rating(c)<rating(a):rating(c)>rating(a))?c:a;
  });
  b.attackCursor=chosen.index;p.useSelectedAttack();
  let ticks=0;
  while(timers.length&&ticks++<120)timers.shift()();
  if(ticks>=120)throw new Error('Timer chain stuck '+attacker+' vs '+defender);
 }
 const win=s.battleWins===1;
 if(rounds>=75){timeouts++;if(errors.length<12)errors.push({attacker,defender,level,tactic,why:'75-turn cap'});}
 maxTurns=Math.max(maxTurns,rounds+1);
 wins+=win?1:0;losses+=!win?1:0;turnSum+=rounds+1;
 for(const g of [tactics[tactic],levels[level],stages[species[attacker-1].stage],attackers[attacker-1]])
  add(g,win,rounds+1);
 const key=(species[attacker-1].affinities||[species[attacker-1].type]).join('/');
 add(types[key]??(types[key]=counts()),win,rounds+1);
 if(level===enemyLevel && species[attacker-1].stage===species[defender-1].stage)
   add(sameStage[attacker-1],win,rounds+1);
 digest.update([attacker,defender,level,enemyLevel,tactic,win?1:0,rounds+1].join(',')+'\n');
 if((i+1)%20000===0)console.log('RANDOM_DUEL_PROGRESS',i+1,'/',TOTAL);
}
const pct=x=>x.fights?+(x.wins/x.fights*100).toFixed(2):null;
const format=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,{...v,winPct:pct(v),avgTurns:v.fights?+(v.turns/v.fights).toFixed(2):null}]));
const row=attackers.map((x,i)=>({...x,winPct:pct(x),
 sameStage:{...sameStage[i],winPct:pct(sameStage[i])}}));
const sorted=row.filter(x=>x.sameStage.fights>=50).sort((a,b)=>a.sameStage.winPct-b.sameStage.winPct);
const report={
 test:'100,000 seed-randomized in-memory engine duels: independent random species at both sides, half equal-level / half independent-level, actual elemental/status rules and enemy AI',
 codeRef:'same branch and HEAD for both PC and GitHub',
 count:TOTAL,wins,losses,winPct:+(wins/TOTAL*100).toFixed(2),timeouts,
 equalLevelFights,defenderMin:Math.min(...defenderCounts),defenderMax:Math.max(...defenderCounts),
 attackerMin:Math.min(...attackers.map(x=>x.fights)),attackerMax:Math.max(...attackers.map(x=>x.fights)),
 avgTurns:+(turnSum/TOTAL).toFixed(2),maxTurns,
 fingerprint:digest.digest('hex'),levels:format(levels),tactics:format(tactics),
 stages:format(stages),typeCombinations:format(types),
 sameStageWeakest:sorted.slice(0,10).map(x=>({id:x.id,name:x.name,stage:x.stage,...x.sameStage})),
 sameStageStrongest:sorted.slice(-10).reverse().map(x=>({id:x.id,name:x.name,stage:x.stage,...x.sameStage})),
 species:row,errors
};
const out=path.resolve('../docs/visual-audit/battle-matrix/duel-100000-random-report.json');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
const summary={count:report.count,wins,losses,winPct:report.winPct,timeouts,avgTurns:report.avgTurns,maxTurns,
 equalLevelFights,attackerMin:report.attackerMin,defenderMin:report.defenderMin,
 fingerprint:report.fingerprint,tactics:report.tactics,stages:report.stages,
 weakest:report.sameStageWeakest.slice(0,5),strongest:report.sameStageStrongest.slice(0,5)};
console.log('DUELS_100000_RANDOM_RESULT '+JSON.stringify(summary));
assert.equal(wins+losses,TOTAL);
assert.equal(Object.values(tactics).reduce((n,x)=>n+x.fights,0),TOTAL);
assert.equal(attackers.length,150);
assert(attackers.every(x=>x.fights>=450),'Random attacker coverage requires >=450 fights per species');
assert(defenderCounts.every(x=>x>=450),'Random defender coverage requires >=450 fights per species');
assert(equalLevelFights>52000&&equalLevelFights<65000,'Expected randomized mixed-level coverage');
assert.equal(timeouts,0,'No duel may remain unresolved after 75 turns');
