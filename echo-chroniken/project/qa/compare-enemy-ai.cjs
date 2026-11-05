'use strict';
// Actual game-engine baseline vs smart-enemy AI, identical starting pairs and seeds.
// The baseline code is read from a fixed, merged GitHub commit, not a reimplementation.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),
  cp=require('node:child_process'),assert=require('node:assert/strict');
const project=path.resolve(__dirname,'..'),root=path.resolve(project,'../..');
const baseSha='8077ce6f64d1ddf847a3678638a9dcd927c21f40';
const baseGame=cp.execFileSync('git',['show',baseSha+':echo-chroniken/project/src/game.js'],
 {cwd:root,encoding:'utf8',maxBuffer:5*1024*1024});
const smartGame=fs.readFileSync(path.join(project,'src/game.js'),'utf8');
const marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(baseGame.includes(marker)&&smartGame.includes(marker));
function engine(source){
 function ctx(){return new Proxy({measureText(t){return {width:String(t).length*5}},
 createLinearGradient(){return {addColorStop(){}}}}, {get:(t,k)=>k in t?t[k]:()=>{},
 set(t,k,v){t[k]=v;return true}});}
 function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},
 getContext(){return ctx()},appendChild(){},querySelectorAll(){return []},
 getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
 const document={documentElement:{classList:{add(){}}},_els:{},
 getElementById(id){return this._els[id]??(this._els[id]=el())},createElement:el,addEventListener(){}};
 const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
 const timers=[];let rng=1;
 const math=Object.create(Math);
 math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
 const env={window,document,navigator:{getGamepads(){return []}},location:window.location,
 URLSearchParams,Math:math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(){return null},setItem(){}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},
 clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
 for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js',
   'src/encounters/registry.js','src/village.js','src/house.js'])
   vm.runInNewContext(fs.readFileSync(path.join(project,file),'utf8'),env);
 vm.runInNewContext(source.replace(marker,
   'window.aiQA={s:gameState,createMonsterInstance,startTrainerBattle,useSelectedAttack,ATTACKS};\n'+marker),env);
 const probe=window.aiQA,species=window.ECHO_SPECIES,aff=window.EchoTypes;
 return {species,simulate(attacker,defender,lv,enemyLv,seed){
   rng=seed>>>0;timers.length=0;
   const s=probe.s;s.team=[probe.createMonsterInstance(attacker,lv)];
   s.hasStarter=true;s.scene='OVERWORLD';s.mode='OVERWORLD';
   s.currentMapId='legacy_wurzeldorf';s.safeSpawnId='legacy_current_position';
   s.potions=0;s.battleWins=0;
   probe.startTrainerBattle(null,'paired enemy AI QA',[{id:defender,lv:enemyLv}]);
   let rounds=0;
   for(;rounds<75;rounds++){
     const ally=s.team[0],b=s.battle;
     if(s.mode!=='BATTLE'||ally.hp<=0)break;
     b.busy=false;
     const moves=(ally.equippedMoves||ally.moves).map((id,index)=>({index,move:probe.ATTACKS[id]}))
       .filter(x=>x.move&&x.move.power>0);
     assert(moves.length>0,'no attacks '+attacker);
     const rating=x=>x.move.power*aff.effectiveness(x.move.type,b.enemy)*
       aff.stab(x.move.type,ally);
     const chosen=moves.reduce((a,b)=>rating(b)>rating(a)?b:a);
     b.attackCursor=chosen.index;probe.useSelectedAttack();
     let ticks=0;while(timers.length&&ticks++<125)timers.shift()();
     assert(ticks<125,'stuck callback '+attacker+'/'+defender);
   }
   return {playerWon:s.battleWins===1,rounds:rounds+1,
     timeout:rounds>=75,playerStage:species[attacker-1].stage,
     enemyStage:species[defender-1].stage,lv,enemyLv};
 }};
}
const old=engine(baseGame),updated=engine(smartGame);
const COUNT=12000,LEVELS=[5,10,15,20,25,30];
let state=0xE7A155F;
function draw(){state=(state+0x6D2B79F5)>>>0;let x=state;
 x=Math.imul(x^x>>>15,x|1);x^=x+Math.imul(x^x>>>7,x|61);return ((x^x>>>14)>>>0)/4294967296;}
const pick=n=>Math.floor(draw()*n);
const groups={all:{n:0,baseline:0,smart:0,baselineTurns:0,smartTurns:0},
  early:{n:0,baseline:0,smart:0},sameStage:{n:0,baseline:0,smart:0},
  late:{n:0,baseline:0,smart:0}};
const paired={oldOnly:0,smartOnly:0,both:0,neither:0};
let timeouts=0;
for(let i=0;i<COUNT;i++){
 const attacker=1+pick(150),defender=1+pick(150);
 const level=LEVELS[pick(LEVELS.length)],enemyLv=i%4?level:LEVELS[pick(LEVELS.length)];
 const seed=(Math.imul(i+1,197531)+Math.imul(attacker,17041)+Math.imul(defender,8099)+level*97+enemyLv*1009)>>>0;
 const before=old.simulate(attacker,defender,level,enemyLv,seed);
 const after=updated.simulate(attacker,defender,level,enemyLv,seed);
 timeouts+=Number(before.timeout)+Number(after.timeout);
 const target=[groups.all];
 if(level<=10&&enemyLv<=10)target.push(groups.early);
 if(before.playerStage===before.enemyStage&&level===enemyLv)target.push(groups.sameStage);
 if(level>=20||enemyLv>=20)target.push(groups.late);
 for(const g of target){
  g.n++;g.baseline+=Number(before.playerWon);g.smart+=Number(after.playerWon);
 }
 groups.all.baselineTurns+=before.rounds;groups.all.smartTurns+=after.rounds;
 if(before.playerWon&&after.playerWon)paired.both++;
 else if(before.playerWon)paired.oldOnly++;
 else if(after.playerWon)paired.smartOnly++;
 else paired.neither++;
 if((i+1)%4000===0)console.log('SMART_AI_MATCHED_PROGRESS',i+1,'/',COUNT);
}
assert.equal(timeouts,0);
const report={baselineCommit:baseSha,fixtures:COUNT,engineFights:COUNT*2,timeouts,
 groups:Object.fromEntries(Object.entries(groups).map(([key,v])=>[key,{...v,
  baselineWinPct:+(v.baseline/v.n*100).toFixed(2),smartWinPct:+(v.smart/v.n*100).toFixed(2),
  deltaPlayerWinPct:+((v.smart-v.baseline)/v.n*100).toFixed(2)}])),
 paired,avgTurns:{baseline:+(groups.all.baselineTurns/COUNT).toFixed(2),
 smart:+(groups.all.smartTurns/COUNT).toFixed(2)},
 caveat:'Player always acts first. Identical starts and initial seeds but different choices consume RNG differently. Players use elemental strategy; no human choice/physical device measured.'};
const file=path.resolve(project,'../docs/visual-audit/enemy-ai/paired-old-vs-smart.json');
fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n');
console.log('SMART_ENEMY_AI_PAIRED_RESULT '+JSON.stringify(report));
