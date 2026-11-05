'use strict';
// Controlled engine comparison: same creature pairs, levels and initial RNG seed.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
function ctx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get:(t,k)=>k in t?t[k]:()=>{},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const document={documentElement:{classList:{add(){}}},getElementById(id){return this._els[id]??(this._els[id]=el())},_els:{},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}},timers=[];
let battleRng=1;const math=Object.create(Math);
math.random=()=>{battleRng=(Math.imul(battleRng,1664525)+1013904223)>>>0;return battleRng/4294967296;};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:math,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js',
 'src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(marker));
vm.runInNewContext(source.replace(marker,
 'window.pairedProbe={s:gameState,createMonsterInstance,startTrainerBattle,useSelectedAttack,ATTACKS};\n'+marker),env);
const p=window.pairedProbe,aff=window.EchoTypes,ST=window.EchoSkillbook.STATUS,species=window.ECHO_SPECIES;
assert.equal(species.length,150);
const COUNT=15000,LEVELS=[5,10,15,20,25,30],POLICIES=['power','element','element_heal','status','tactical'];
let fixtureRng=0x9e3779b9;
function draw(){fixtureRng=(fixtureRng+0x6D2B79F5)>>>0;
 let v=fixtureRng;v=Math.imul(v^v>>>15,v|1);v^=v+Math.imul(v^v>>>7,v|61);
 return ((v^v>>>14)>>>0)/4294967296;}
const pick=n=>Math.floor(draw()*n);
const byStage={1:[],2:[],3:[]};species.forEach(s=>byStage[s.stage].push(s.id));
const results=Object.fromEntries(POLICIES.map(k=>[k,{wins:0,turns:0,heals:0,statusAttacks:0,offensive:0,timeout:0}]));
const matched=Object.fromEntries(['power','element_heal','status','tactical'].map(policy=>[
  'element_vs_'+policy,{otherOnly:0,elementOnly:0,both:0,neither:0}]));
let identicalMoveDecisions=0,nonidenticalMoveDecisions=0,totalMoves=0,equalStageFixtures=0;
function choose(options,policy,ally,enemy,healCount){
 const offensive=options.filter(o=>o.move.power>0);
 assert(offensive.length>0,'no attack moves');
 const raw=o=>o.move.power;
 const effective=o=>o.move.power*aff.effectiveness(o.move.type,enemy)*aff.stab(o.move.type,ally);
 const power=offensive.reduce((a,b)=>raw(b)>raw(a)?b:a);
 const element=offensive.reduce((a,b)=>effective(b)>effective(a)?b:a);
 if(policy==='power')return power;
 if(policy==='element')return element;
 const heal=options.find(o=>o.move.heal);
 if((policy==='element_heal'||policy==='tactical')&&heal&&healCount<2&&ally.hp/ally.maxHp<=.48&&enemy.hp/enemy.maxHp>.23)return heal;
 const value=o=>{
  const rule=ST.rules[o.id],score=effective(o);
  if(!rule)return score;
  if(rule.kind==='burn')return score+rule.chance*13;
  if(rule.kind==='weak')return score+rule.chance*7;
  if(rule.kind==='guard')return score+4;
  if(rule.kind==='regen')return score+5;
  return score;
 };
 return offensive.reduce((a,b)=>value(b)>value(a)?b:a);
}
function simulate(attacker,defender,level,enemyLevel,seed,policy){
 battleRng=seed>>>0;timers.length=0;
 const s=p.s;
 s.team=[p.createMonsterInstance(attacker,level)];s.hasStarter=true;
 s.scene='OVERWORLD';s.mode='OVERWORLD';s.currentMapId='legacy_wurzeldorf';
 s.safeSpawnId='legacy_current_position';s.potions=0;s.battleWins=0;
 p.startTrainerBattle(null,'matched tactical QA',[{id:defender,lv:enemyLevel}]);
 const b=s.battle;
 let rounds=0,heals=0,statusAttacks=0,offensive=0;
 for(;rounds<75;rounds++){
  const ally=s.team[0];
  if(s.mode!=='BATTLE'||ally.hp<=0)break;
  b.busy=false;
  const moves=(ally.equippedMoves||ally.moves).map((id,index)=>({id,index,move:p.ATTACKS[id]})).filter(x=>x.move);
  const choice=choose(moves,policy,ally,b.enemy,heals);
  if(policy==='power'){
   const a=choose(moves,'power',ally,b.enemy,heals);
   const x=choose(moves,'element',ally,b.enemy,heals);
   if(a.id===x.id)identicalMoveDecisions++;else nonidenticalMoveDecisions++;
   totalMoves++;
  }
  if(choice.move.heal)heals++;else offensive++;
  if(ST.rules[choice.id])statusAttacks++;
  b.attackCursor=choice.index;p.useSelectedAttack();
  let ticks=0;while(timers.length&&ticks++<125)timers.shift()();
  assert(ticks<125,'callback queue stuck: '+attacker+'/'+defender);
 }
 const win=s.battleWins===1,timeout=rounds>=75;
 const r=results[policy];
 r.wins+=Number(win);r.turns+=rounds+1;r.heals+=heals;
 r.statusAttacks+=statusAttacks;r.offensive+=offensive;r.timeout+=Number(timeout);
 return win;
}
for(let i=0;i<COUNT;i++){
 const attacker=1+pick(150),stage=species[attacker-1].stage;
 const sameStage=i%2===0,list=byStage[stage];
 const defender=sameStage?list[pick(list.length)]:1+pick(150);
 if(sameStage)equalStageFixtures++;
 const level=LEVELS[pick(LEVELS.length)],enemyLevel=i%3===0?LEVELS[pick(LEVELS.length)]:level;
 const seed=(Math.imul(i+1,131071)+Math.imul(attacker,8111)+Math.imul(defender,17027)+level*13007+enemyLevel*23)>>>0;
 const wins=Object.fromEntries(POLICIES.map(policy=>[policy,simulate(attacker,defender,level,enemyLevel,seed,policy)]));
 for(const policy of ['power','element_heal','status','tactical']){
  const row=matched['element_vs_'+policy];
  if(wins.element&&wins[policy])row.both++;
  else if(wins[policy])row.otherOnly++;
  else if(wins.element)row.elementOnly++;
  else row.neither++;
 }
 if((i+1)%5000===0)console.log('MATCHED_PAIR_PROGRESS',i+1,'/',COUNT);
}
assert(POLICIES.every(k=>results[k].timeout===0),'all battles must end');
for(const row of Object.values(matched))
 assert.equal(Object.values(row).reduce((a,b)=>a+b,0),COUNT);
const report={fixtureCount:COUNT,engineFights:COUNT*POLICIES.length,equalStageFixtures,policies:results,
 winPct:Object.fromEntries(POLICIES.map(k=>[k,+(results[k].wins/COUNT*100).toFixed(2)])),
 matched,moveChoiceCompare:{identicalMoveDecisions,nonidenticalMoveDecisions,totalMoves},
 note:'Same pairs, levels and initial random seeds; RNG consumption diverges after choices differ. Element: effectiveness. Element-heal: same with limited healing. Status: chance-weighted damage. Tactical: both. All use four equipped moves and same enemy AI.'};
const out=path.resolve('../docs/visual-audit/tactical-audit/paired-decisions.json');
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('PAIRED_TACTICAL_AUDIT_RESULT '+JSON.stringify(report));
