// Regression against Lv.13/14 wild monsters attacking a Lv.5 starter outside Grandma's house.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(s){return {width:String(s).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={};const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const save={},window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(k){return save[k]},setItem(k,v){save[k]=v}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
const species=fs.readFileSync('data/species.js','utf8'),engine=fs.readFileSync('src/game.js','utf8');
vm.runInNewContext(species,env);
vm.runInNewContext(fs.readFileSync('src/village.js','utf8'),env);
vm.runInNewContext(fs.readFileSync('src/house.js','utf8'),env);
const mark='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(engine.includes(mark));
vm.runInNewContext(engine.replace(mark,'window.testWild={state:gameState,wildEncounterLimits,startWildBattle,createMonsterInstance};\n'+mark),env);
const q=window.testWild;assert(q&&q.wildEncounterLimits);
q.state.scene='OVERWORLD';q.state.hasStarter=true;q.state.team=[q.createMonsterInstance(1,5)];q.state.badges=0;q.state.battleWins=0;
const locations=[[5,6],[12,14],[13,17],[14,17],[18,20],[30,15],[30,20],[31,22],[34,24],[2,26]];
let count=0;
for(const [x,y] of locations){
  q.state.player={x,y,dir:'down',stepPhase:0};
  const limits=q.wildEncounterLimits();
  assert(limits.cap<=5,'A beginner should never find >Lv5 at '+x+','+y);
  assert.equal(limits.stageCap,1);
  for(let i=0;i<120;i++){
    q.startWildBattle();
    const enemy=q.state.battle.enemy;
    assert(enemy.lv>=2&&enemy.lv<=5,'Lv.'+enemy.lv+' at '+x+','+y);
    assert.equal(window.ECHO_SPECIES[enemy.id-1].stage,1,'Stage mismatch');
    assert(enemy.encounterScale<=.78,'Intro battle too hard');
    q.state.mode='OVERWORLD';
    count++;
  }
}
q.state.player={x:31,y:22,dir:'down'};
for(const badges of [0,1,2,3]){
  q.state.badges=badges;
  for(const level of [5,7,12,18]){
    q.state.team=[q.createMonsterInstance(1,level)];
    const limits=q.wildEncounterLimits();
    assert(limits.cap<=level+1,'wild level higher than starter team');
    assert(limits.low<=limits.cap);
    if(badges===0)assert(limits.cap<=5);
    for(let i=0;i<40;i++){
      q.startWildBattle();
      const e=q.state.battle.enemy;
      assert(e.lv>=limits.low&&e.lv<=limits.cap);
      assert(window.ECHO_SPECIES[e.id-1].stage<=limits.stageCap);
      count++;
    }
  }
}
q.state.badges=0;q.state.team=[q.createMonsterInstance(1,5)];q.state.battleWins=0;
const first=q.wildEncounterLimits();
assert(first.newcomer,'Beginner protection missing');
q.state.battleWins=3;
assert(!q.wildEncounterLimits().newcomer,'Protection should fade after three wins');
console.log('PASS: '+count+' simulated wild encounters across 10 map locations, 4 badges, 4 team levels, no impossible early fights');
