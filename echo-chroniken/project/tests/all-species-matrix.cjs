// Actual in-memory battle engine, every ordered 150x150 match-up.
// Two RNG seeds per pair and three common levels: 135,000 complete fights.
// Never writes a gameplay save. This test detects balance outliers, not player enjoyment.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
function ctx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get:(t,k)=>k in t?t[k]:()=>{},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const document={documentElement:{classList:{add(){}}},getElementById(id){return this._els[id]??(this._els[id]=el())},_els:{},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}},timers=[];
let rng=1;const math=Object.create(Math);math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),spot='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(spot));
vm.runInNewContext(source.replace(spot,'window.duelProbe={s:gameState,createMonsterInstance,startTrainerBattle,useSelectedAttack,ATTACKS};\n'+spot),env);
const p=window.duelProbe;
const species=window.ECHO_SPECIES;assert.equal(species.length,150);
const secondPass=process.argv.includes('--audit-again');
const levels=secondPass?[5,15,25]:[10,20,30],SEEDS=2,SEED_OFFSET=secondPass?2:0,stats=Array.from({length:150},(_,i)=>({id:i+1,name:species[i].name,type:species[i].type,stage:species[i].stage,wins:0,fights:0,rounds:0,losses:0}));
const byLevel=levels.map(lv=>Array.from({length:150},(_,i)=>({id:i+1,wins:0,fights:0})));
const matrix=Array.from({length:150},()=>Array(150).fill(0));
const role=Array.from({length:150},()=>({self:0,vsOthers:0}));
let count=0,timeouts=0,loss=0,turnSum=0,failures=[];
const seedValue=(a,b,lv,n)=>((a*9941+b*16127+lv*70001+n*131071)>>>0);
for(const [li,lv] of levels.entries()){
 for(let attacker=1;attacker<=150;attacker++){
  for(let defender=1;defender<=150;defender++){
   for(let n=0;n<SEEDS;n++){
    rng=seedValue(attacker,defender,lv,n+SEED_OFFSET);timers.length=0;
    const s=p.s;
    s.team=[p.createMonsterInstance(attacker,lv)];s.hasStarter=true;
    s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';
    s.safeSpawnId='legacy_current_position';s.potions=0;s.battleWins=0;
    p.startTrainerBattle(null,'Matrix test',[{id:defender,lv}]);
    const b=s.battle;
    let rounds=0;
    for(;rounds<75;rounds++){
      if(s.mode!=='BATTLE')break;
      if(s.team[0].hp<=0)break;
      b.busy=false;
      const moves=s.team[0].moves.map((id,i)=>({i,move:p.ATTACKS[id]})).filter(x=>x.move&&x.move.power>0);
      const chosen=moves.reduce((a,b)=>a.move.power>=b.move.power?a:b);
      b.attackCursor=chosen.i;p.useSelectedAttack();
      let ticks=0;
      while(timers.length&&ticks++<100)timers.shift()();
      if(ticks>=100){throw new Error('Timeout chain '+attacker+' vs '+defender);}
    }
    const win=s.battleWins===1;
    if(rounds>=75){timeouts++;if(failures.length<12)failures.push({attacker,defender,lv,why:'max turns'});}
    if(!win)loss++;
    stats[attacker-1].wins+=win?1:0;stats[attacker-1].fights++;stats[attacker-1].rounds+=rounds+1;stats[attacker-1].losses+=!win?1:0;
    byLevel[li][attacker-1].wins+=win?1:0;byLevel[li][attacker-1].fights++;
    matrix[attacker-1][defender-1]+=win?1:0;
    if(attacker===defender)role[attacker-1].self+=win?1:0;
    else role[attacker-1].vsOthers+=win?1:0;
    turnSum+=rounds+1;count++;
   }
  }
  if(attacker%50===0)console.log('MATCHUP_PROGRESS',lv,attacker,'battles',count);
 }
}
const rows=stats.map(x=>({...x,winPct:+(x.wins/x.fights*100).toFixed(2),avgTurns:+(x.rounds/x.fights).toFixed(2)}));
const segments={};
for(const x of rows){const key=x.stage+'-'+x.type;const o=segments[key]??(segments[key]={group:key,species:0,wins:0,fights:0});o.species++;o.wins+=x.wins;o.fights+=x.fights;}
for(const x of Object.values(segments))x.winPct=+(x.wins/x.fights*100).toFixed(1);
const stageMatchups=stats.map(x=>{
 let battles=0,wins=0,reciprocalWins=0;
 for(let j=0;j<150;j++){
  if(species[j].stage!==x.stage||j===x.id-1)continue;
  battles+=levels.length*SEEDS;
  wins+=matrix[x.id-1][j];
  reciprocalWins+=matrix[j][x.id-1];
 }
 return {id:x.id,name:x.name,type:x.type,stage:x.stage,
  equalStageOpponents:battles/(levels.length*SEEDS),
  winPct:battles?+(wins/battles*100).toFixed(2):null,
  opponentFirstWinPct:battles?+(reciprocalWins/battles*100).toFixed(2):null};
});
const fairness={
  sameStageAll:stageMatchups,
  sameStageBottom:[...stageMatchups].filter(x=>x.winPct!==null).sort((a,b)=>a.winPct-b.winPct).slice(0,12),
  sameStageTop:[...stageMatchups].filter(x=>x.winPct!==null).sort((a,b)=>b.winPct-a.winPct).slice(0,12),
  starter:stageMatchups[0],
  speciesWithUnder35:rows.filter(x=>x.winPct<35).map(x=>({id:x.id,name:x.name,stage:x.stage,type:x.type,pct:x.winPct})),
  speciesWithOver85:rows.filter(x=>x.winPct>85).map(x=>({id:x.id,name:x.name,stage:x.stage,type:x.type,pct:x.winPct})),
  bottom10:[...rows].sort((a,b)=>a.winPct-b.winPct).slice(0,10).map(x=>({id:x.id,name:x.name,stage:x.stage,pct:x.winPct})),
  top10:[...rows].sort((a,b)=>b.winPct-a.winPct).slice(0,10).map(x=>({id:x.id,name:x.name,stage:x.stage,pct:x.winPct})),
  level:[...levels.map((level,i)=>({level,overallWinPct:+(byLevel[i].reduce((sum,r)=>sum+r.wins,0)/byLevel[i].reduce((sum,r)=>sum+r.fights,0)*100).toFixed(2)}))]
};
const report={test:'Complete real-engine ordered species battle matrix: 150x150; player-controlled attacker always attacks first, opponent uses real engine AI; three levels and two seeded combats for each ordered pairing.',count,levels,seedsPerMatch:SEEDS,losses:loss,timeouts,avgTurns:+(turnSum/count).toFixed(2),fairness,groups:Object.values(segments).sort((a,b)=>a.group.localeCompare(b.group)),species:rows,errors:failures};
const out=path.resolve('../docs/visual-audit/battle-matrix/'+(secondPass?'repeat-matrix-report.json':'all-species-matrix-report.json'));
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('ALL_SPECIES_RESULT',JSON.stringify({count,loss,timeouts,avgTurns:report.avgTurns,segments:report.groups.map(x=>({group:x.group,count:x.species,win:x.winPct})),fairness}));
assert.equal(count,150*150*levels.length*SEEDS);
assert.equal(timeouts,0,'No matchup may run 75+ player turns');
assert.equal(new Set(rows.map(x=>x.id)).size,150,'All distinct species must appear');
for(const id of [1,2,51,121]){
 const entry=stageMatchups[id-1];
 assert(entry.winPct>=65,'Starter/early fire form too weak among equal stages: '+entry.name+' '+entry.winPct);
}
assert(stats.every(x=>x.fights===900),'Each species must meet all 150 opponents at all levels/seeds');
