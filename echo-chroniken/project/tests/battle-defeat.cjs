// Real battle engine: losing outside Wurzelheim must not erase chapter progress.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[];
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const constantMath=Object.create(Math);constantMath.random=()=>0;
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:constantMath,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const code=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(code.includes(marker));
vm.runInNewContext(code.replace(marker,'window.testBattle={state:gameState,createMonsterInstance,startTrainerBattle,enemyCounterAttack};\n'+marker),env);
const t=window.testBattle,s=t.state;
window.EchoMaps={get(id){return id==='memory_room'?{spawns:{from_martha:{x:2,y:9}}}:null;}};
function loseBattle(where){
 s.scene='OVERWORLD';s.currentMapId=where;
 s.safeSpawnId=where==='memory_room'?'from_martha':'legacy_current_position';
 s.team=[t.createMonsterInstance(1,15)];s.team[0].hp=1;
 t.startTrainerBattle(null,'Wiederholbarer Testboss',[{id:3,lv:80}]);
 t.enemyCounterAttack();
 while(timers.length)timers.shift()();
 assert.equal(s.team[0].hp,s.team[0].maxHp,'Entire party must be healed');
 assert.equal(s.encounterGrace,16,'Encounter protection after defeat');
 assert.equal(s.mode,'DIALOG');
}
loseBattle('memory_room');
assert.equal(s.currentMapId,'memory_room','No forced march from Grandma after late-game wipe');
assert.equal(s.scene,'OVERWORLD');assert.equal(s.player.x,2);assert.equal(s.player.y,9);
loseBattle('legacy_wurzeldorf');
assert.equal(s.currentMapId,'legacy_wurzeldorf');
assert.equal(s.scene,'HOUSE','Early-game Grandma rescue remains');
assert.equal(s.player.x,7);assert.equal(s.player.y,9);
console.log('PASS defeat recovery: safe late-story spawn, full heal, encounter grace, original village rescue');
