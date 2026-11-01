// Story chapter 2 full runtime with real controller inputs, no production save touched.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const rd=p=>fs.readFileSync(p,'utf8');
const context2d=()=>new Proxy({measureText(s){return {width:String(s).length*6}},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
function el(){return {style:{},dataset:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},querySelectorAll(){return []},getContext:context2d,getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elems={},document={documentElement:{classList:{add(){},remove(){}}},getElementById(n){return elems[n]??(elems[n]=el())},createElement:el,addEventListener(){}};
const local={},window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{},ECHO_ATLAS_DATA:''};
const env={window,document,localStorage:{getItem:k=>local[k],setItem:(k,v)=>local[k]=v},location:window.location,URLSearchParams,navigator:{getGamepads(){return []}},console,Math,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},Uint8ClampedArray,setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){}};
for(const p of ['data/species.js','src/village.js','src/first-route.js','src/exploration.js','src/interiors.js','src/combat-fx.js','src/platformer.js','src/ruins.js','src/house.js'])
  vm.runInNewContext(rd(p),env);
const engine=rd('src/game.js');
const anchor='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(engine.includes(anchor));
vm.runInNewContext(engine.replace(anchor,'window.__ruinGame=gameState;window.__ruinQA={handleEnemyDefeated};\n'+anchor),env);
const s=window.__ruinGame,press=x=>window.tvControllerInput(x);
function dismiss(max=30){let i=0;while(s.mode==='DIALOG'&&i++<max)press('A');assert(i<max,'Dialog stuck');}
s.scene='OVERWORLD';s.mode='OVERWORLD';s.introStage=4;s.hasStarter=true;
s.team=[{id:1,lv:5,hp:36,maxHp:36,moves:['seelenstups','lichtfunke'],xp:0,nextXp:90}];
s.routeQuest={accepted:true,lights:['west','mitte','ost'],rewarded:false,guardianWon:false};
s.player={x:25,y:21,dir:'up',stepPhase:0};
press('A');assert.equal(s.scene,'OVERWORLD');assert.equal(s.mode,'DIALOG');dismiss();
s.routeQuest.rewarded=true;
press('A');assert.equal(s.scene,'RUINS');assert.equal(s.mode,'DIALOG');dismiss();
assert.equal(s.player.x,10);assert.equal(s.player.y,8);
const stones=[[5,5],[14,5],[11,3]];
for(let i=0;i<stones.length;i++){
 s.player={x:stones[i][0],y:stones[i][1],dir:'left',stepPhase:0};
 press('A');assert.equal(s.ruinsProgress.seals.length,i+1);dismiss();
}
s.player={x:10,y:2,dir:'up',stepPhase:0};
press('A');assert.equal(s.mode,'DIALOG');dismiss();
assert.equal(s.mode,'BATTLE');assert.equal(s.battle.ruinBoss,true);
assert.equal(s.battle.enemyDisplayName,'Erinnerungshüter');
assert(s.battle.enemy.lv<=5);assert(s.battle.enemy.encounterScale<=.65);
s.battle.enemy.hp=0;
const potionBefore=s.potions,orbsBefore=s.orbs;
window.__ruinQA.handleEnemyDefeated();
assert.equal(s.ruinsProgress.bossWon,true);assert.equal(s.potions,potionBefore+2);assert.equal(s.orbs,orbsBefore+3);
dismiss();
const saved=JSON.parse(local.echo_chroniken_tv_save);
assert(saved.ruinsProgress.bossWon);assert.equal(saved.scene,'RUINS');
s.player={x:10,y:9,dir:'down',stepPhase:0};press('DOWN');
assert.equal(s.scene,'OVERWORLD');assert.equal(s.player.x,25);
s.scene='HOUSE';s.player={x:5,y:7,dir:'left',stepPhase:0};press('A');dismiss();
assert(s.ruinsProgress.reported);assert(s.ruinsProgress.bossWon);
const report=JSON.parse(local.echo_chroniken_tv_save);assert(report.ruinsProgress.reported);
s.scene='OVERWORLD';s.player={x:25,y:21,dir:'up',stepPhase:0};s.mode='OVERWORLD';
press('A');dismiss();
assert.equal(s.ruinsProgress.bossWon,true);
assert.equal(s.potions,potionBefore+2);assert.equal(s.orbs,orbsBefore+3);
console.log('PASS: real A/steering controls, story gate, 3 ordered seals, Lv5 boss, victory, exit, Grandma response and save; no duplicate loot');
