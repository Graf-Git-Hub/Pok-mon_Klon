// Potions need to remain useful at late-game HP without wasting resources.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}},{get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},timers=[],writes=[];
const document={documentElement:{classList:{add(){}}},getElementById(k){return elements[k]??(elements[k]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(){return null},setItem(k,v){writes.push({k,v})}},
 setTimeout(fn){timers.push(fn);return timers.length},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const source=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(source.includes(marker),'Engine injection point missing');
vm.runInNewContext(source.replace(marker,
 'window.potionProbe={s:gameState,createMonsterInstance,startTrainerBattle,executeBattleAction,handleCommand,potionHealAmount};\n'+marker),env);
const p=window.potionProbe,s=p.s;
const weak=p.createMonsterInstance(1,5),strong=p.createMonsterInstance(3,55);
assert.equal(p.potionHealAmount(weak),36,'Early game potion preserves 36 KP baseline');
assert.equal(p.potionHealAmount(strong),Math.max(36,Math.ceil(strong.maxHp*.3)),'Late healing scales');
s.team=[strong];s.potions=4;
p.startTrainerBattle(null,'Trankprobe',[{id:10,lv:7}]);
strong.hp=1;
p.executeBattleAction(2);
assert.equal(strong.hp,Math.min(strong.maxHp,1+p.potionHealAmount(strong)),'Battle restores proportional HP');
assert.equal(s.potions,3,'Battle consumes exactly one potion');
assert.equal(s.battle.busy,true,'Potion consumes a turn');
timers.length=0;s.battle.busy=false;
strong.hp=strong.maxHp;
p.executeBattleAction(2);
assert.equal(s.potions,3,'Full HP cannot waste a battle potion');
assert.equal(s.battle.busy,false,'No lost turn for pointless potion');
s.battle=null;s.team=[weak,strong];s.mode='MENU';s.menuCursor=2;s.potions=2;
weak.hp=weak.maxHp;strong.hp=strong.maxHp;
p.handleCommand('A');
assert.equal(s.mode,'BAG');p.handleCommand('A');
assert.equal(s.potions,2,'Bag does not spend at full HP');
s.mode='BAG';weak.hp=2;strong.hp=strong.maxHp-25;
p.handleCommand('A');
assert.equal(s.potions,1,'Menu heals team for one potion');
assert(s.team.every(m=>m.hp===m.maxHp),'All team members healed');
assert(writes.length>0,'Paid rest persisted to localStorage');
const last=JSON.parse(writes.at(-1).v);
assert.equal(last.potions,1,'Persisted potion count');
assert(last.team.every(m=>m.hp===m.maxHp),'Persisted healed team');
assert.equal(last.saveSchemaVersion,2,'No save schema change');
console.log('PASS battle potions: min36/30% max HP, cost one turn, full-HP protection, menu restoration and persisted save');
