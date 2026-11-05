// Contract tests for all 150 affinity records, type matrix, runes and prepared moves.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const env={window:{},console,Math:Object.assign(Object.create(Math),{random:()=>0.5})};
for(const f of ['data/species.js','data/affinities.js','data/skills.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),env);
const A=env.window.EchoTypes,S=env.window.EchoSkillbook,species=env.window.ECHO_SPECIES;
assert.equal(species.length,150);assert.equal(A.ASSIGNMENTS.length,150);
assert.equal(Object.keys(A.INFO).length,12);
for(const sp of species){
 const t=A.typesFor(sp);
 assert(t.length>=1&&t.length<=2,sp.name);
 assert.equal(new Set(t).size,t.length,sp.name+' repeated type');
 assert(t.every(x=>A.INFO[x]),sp.name+' invalid type');
}
const expect=[
 ['FLAMME',['NATUR'],1.5],['FLAMME',['ERDE'],.65],
 ['WASSER',['FLAMME'],1.5],['WASSER',['NATUR'],.65],
 ['ERDE',['FLAMME'],1.5],['BLITZ',['WASSER'],1.5],
 ['WASSER',['FLAMME','NATUR'],.98],
 ['FLAMME',['NATUR','EIS'],2.25]
];
for(const [move,def,value] of expect)
 assert(Math.abs(A.effectiveness(move,def)-value)<.02,move+' vs '+def);
assert.equal(A.stab('FLAMME',species[50]),1.18);
assert.equal(A.stab('WASSER',species[50]),1);
assert(A.compatible(species[122],'FLAMME'),'Earth/Nature can learn a fire skill');
assert(A.compatible(species[122],'WASSER'),'Earth/Nature can learn a water skill');
const movesByType=Object.keys(S.TYPE_SKILLS);
assert.equal(movesByType.length,12);
assert.equal(S.RUNES.length,12);
assert.equal(new Set(S.RUNE_IDS).size,12);
for(const [id,move] of Object.entries(S.ATTACKS)){
 assert(A.INFO[A.normalize(move.type)],'unknown attack type '+id);
 assert(move.power>0||move.heal>0,id+' no effect');
}
let map={};
function cx(){return new Proxy({measureText(s){return {width:String(s).length*5}},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function element(){return {dataset:{},style:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}},getContext(){return cx()}};}
const document={documentElement:{classList:{add(){}}},getElementById(id){return map[id]??(map[id]=element())},createElement:element,addEventListener(){}},window=env.window;
window.document=document;window.addEventListener=()=>{};window.location={search:''};window.ECHO_BACK_URLS={};window.ECHO_ATLAS_DATA='';
let timers=[],storage={};
Object.assign(env,{
 document,location:window.location,URLSearchParams,navigator:{getGamepads(){return []}},
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(k){return storage[k]||null},setItem(k,v){storage[k]=v}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray
});
for(const f of ['src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(f,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),anchor='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(anchor));
const expose='window.typeQA={s:gameState,ATTACKS,createMonsterInstance,ensureMonsterMoves,addLevelMoves,battleMoves,teachRune,skillDamage,startTrainerBattle,executeBattleAction,toggleEquipped,saveGame};\n';
vm.runInNewContext(source.replace(anchor,expose+anchor),env);
const q=window.typeQA;
const start=q.createMonsterInstance(1,5);
assert.equal(start.moves.length,2);
assert(start.equippedMoves.length<=4);
const fireLearner=q.createMonsterInstance(23,6);
assert(!fireLearner.moves.includes('funkenflug'));
fireLearner.lv=7;
const levelMessages=[];
q.addLevelMoves(fireLearner,6,levelMessages);
assert(fireLearner.moves.includes('funkenflug'),'new attack must enter the permanent book');
assert.equal(fireLearner.moves[0],'funkenflug','newest attack must appear first');
assert(levelMessages.some(m=>m.includes('lernt')&&m.includes(q.ATTACKS.funkenflug.name)),
  'level-up must announce the newly unlocked attack');
assert(fireLearner.equippedMoves.includes('funkenflug'),'auto loadout should offer the new attack');
const higher=q.createMonsterInstance(1,25);
assert(higher.moves.length>4);
assert(higher.equippedMoves.length<=4);
assert(higher.moves.every(id=>q.ATTACKS[id]));
const old={id:27,lv:24,hp:135,maxHp:135,moves:['blattschnips','seelenstups','rankengriff','echowelle','astralsturm']};
q.ensureMonsterMoves(old);
assert.equal(old.equippedMoves.length,4);
assert(old.moves.includes('astralsturm'),'old learned ability preserved');
const beforeLearned=old.moves.length;
q.s.runes={kohlenregen:1,quellschwall:1,kopfkino:1};
q.s.team=[old];
assert(q.teachRune(old,'quellschwall').includes('lernt'));
assert(q.teachRune(old,'kohlenregen').includes('lernt'));
assert.equal(old.runeMoves.length,2);
assert.equal(q.s.runes.kohlenregen,0);
assert.equal(q.s.runes.quellschwall,0);
assert(old.moves.length>=beforeLearned+2);
assert(q.teachRune(old,'kopfkino').includes('zwei'));
assert.equal(q.s.runes.kopfkino,1,'third rune must not get consumed');
const bookLength=old.moves.length;
assert(q.toggleEquipped(old,'quellschwall'));
assert(old.equippedMoves.includes('quellschwall'));
assert.equal(old.moves.length,bookLength);
assert(old.equippedMoves.length<=4);
assert(q.ATTACKS.quellschwall.type==='WASSER');
const earth=q.createMonsterInstance(123,10),fire=q.createMonsterInstance(23,10);
const move=q.ATTACKS.quellschwall;
assert(q.skillDamage(earth,fire,move)>q.skillDamage(earth,earth,move),'Water should beat fire');
q.s.team=[q.createMonsterInstance(1,20),q.createMonsterInstance(65,20)];
q.s.hasStarter=true;q.s.scene='OVERWORLD';q.s.mode='OVERWORLD';
q.startTrainerBattle(null,'Switch Test',[{id:23,lv:4}]);
const active=q.s.team[0].id;
q.executeBattleAction(1);
assert.equal(q.s.mode,'TEAM_SELECT');
assert.equal(q.s.team[0].id,active,'selection must not auto-switch');
window.tvControllerInput('B');assert.equal(q.s.mode,'BATTLE','B cancels without penalty');
q.executeBattleAction(1);assert.equal(q.s.mode,'TEAM_SELECT');
window.tvControllerInput('A');
assert.equal(q.s.team[0].id,65);
assert.equal(q.s.mode,'BATTLE');assert.equal(q.s.battle.busy,true,'switch costs a turn');
for(let i=0;i<60&&timers.length;i++)timers.shift()();
assert.notEqual(q.s.mode,'TEAM_SELECT');
console.log('ELEMENTAL_TYPE_RUNE_PASS',JSON.stringify({species:150,types:12,knownMoves:old.moves.length,preparedMoves:old.equippedMoves.length,scrollsUsed:2}));
