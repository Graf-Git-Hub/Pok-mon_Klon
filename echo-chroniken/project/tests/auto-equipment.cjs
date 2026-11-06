// Real engine integration: passive items never take the player's command turn.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elements={},stored={},document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},
setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const engine=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(engine.includes(marker));
vm.runInNewContext(engine.replace(marker,'window.testGear={state:gameState,createMonsterInstance,startTrainerBattle,gearLimit,toggleGear,autoUseGear,occupiedSlots,saveGame,toggleSupportRune};\n'+marker),env);
const {state:s,createMonsterInstance:create,startTrainerBattle:battle,gearLimit,toggleGear,autoUseGear,occupiedSlots,saveGame,toggleSupportRune}=window.testGear;
const fresh=(id=1)=>create(id,20);
const a=fresh(1),b=fresh(2),c=fresh(3);
assert.equal(gearLimit(a),1);assert.equal(gearLimit(b),2);assert.equal(gearLimit(c),3);
s.team=[a,b,c];s.archive=[];
const stock=s.potions;
assert.match(toggleGear(a,'rucksack'),/Rucksack/);
assert.equal(occupiedSlots(a),1);
assert.match(toggleGear(a,'heiltrank'),/eingepackt/);
assert.match(toggleGear(a,'antidot'),/eingepackt/);
assert.equal(s.potions,stock-1);
assert.equal(a.equipment[0].contents.length,2);
assert.match(toggleGear(a,'schockloeser'),/Keine freien/,'backpack max 2');
assert.match(toggleGear(a,'rucksack'),/Inventar/,'removing backpack returns its contents');
assert.equal(s.potions,stock);
assert.equal(a.equipment.length,0);
assert.match(toggleGear(a,'heiltrank'),/angelegt/);
s.supportRuneUnlocked=true;
assert.match(toggleSupportRune(a),/Kein freier/,'EP rune counts toward the single slot');
assert.match(toggleGear(a,'heiltrank'),/Inventar/);
s.supportRuneUnlocked=true;
assert.match(toggleSupportRune(a),/EP-Teiler/);
assert.equal(occupiedSlots(a),1);
assert.match(toggleGear(a,'heiltrank'),/Keine freien/,'rune occupies the slot');
assert.match(toggleSupportRune(a),/abgelegt/);
assert.match(toggleGear(b,'rucksack'),/Rucksack/);
assert.match(toggleGear(b,'heiltrank'),/Seelen-Trank/);
assert.match(toggleGear(b,'antidot'),/eingepackt/,'full 2-slot evolved creature can use backpack cargo');
assert.equal(occupiedSlots(b),2);
assert.match(toggleGear(b,'antidot'),/Rucksack/);
// Core red-zone auto-heal immediately during battle, without entering action lock.
s.team=[b,a,c];s.battle=null;
battle(null,'Test',[{id:4,lv:4}]);
const active=s.team[0],fight=s.battle;
active.hp=Math.floor(active.maxHp*.28);
const healBefore=active.hp;
const healed=autoUseGear(active);
assert(healed.some(x=>x.includes('Seelen-Trank')));
assert(active.hp>healBefore);
assert.equal(fight.busy,false,'no turn is lost by automatic potion');
assert.equal(s.mode,'BATTLE','player can still choose an action');
assert.equal(active.equipment.some(x=>x.id==='heiltrank'),false);
assert.equal(autoUseGear(active).length,0,'no duplicate usage after healing');
window.tvControllerInput('A');
assert.equal(s.mode,'ATTACKS','player can still attack after automatic healing');
window.tvControllerInput('B');
assert.equal(s.mode,'BATTLE');
// A healthy member with a held potion does not waste it.
const equipped=c; s.team.unshift(equipped);
assert.match(toggleGear(c,'heiltrank'),/angelegt/);
fight.effects=[];
equipped.hp=Math.ceil(equipped.maxHp*.61);
assert.equal(autoUseGear(c).length,0);
equipped.hp=Math.floor(equipped.maxHp*.31);
assert.equal(autoUseGear(c).length,0,'yellow zone retains heal potion');
equipped.hp=Math.floor(equipped.maxHp*.30);
assert.equal(autoUseGear(c).length,1,'red at 30 percent consumes one potion');
assert.equal(fight.busy,false);
const noPotion=autoUseGear(c);assert.equal(noPotion.length,0);
// Status items are used immediately, even at full HP.
assert.match(toggleGear(c,'schockloeser'),/angelegt/);
const fx=env.window.EchoSkillbook.STATUS.state(fight,c);
fx.weak=3;fx.weakLabel='SCHOCK';c.hp=c.maxHp;
const shock=autoUseGear(c);
assert(shock.some(x=>x.includes('Schock')));
assert.equal(fx.weak,0);assert.equal(fx.weakLabel,'');
assert.equal(fight.busy,false);
assert.match(toggleGear(c,'antidot'),/angelegt/);
fx.poison=3;
assert.match(env.window.EchoSkillbook.STATUS.labels(fight,c),/GIFT/);
assert(autoUseGear(c).some(x=>x.includes('Vergiftung')));
assert.equal(fx.poison,0);
assert.match(toggleGear(c,'brandmittel'),/angelegt/);
fx.burn=2;
assert(autoUseGear(c).some(x=>x.includes('Brand')));
assert.equal(fx.burn,0);
saveGame(true);
const saved=JSON.parse(stored.echo_chroniken_tv_save);
assert.equal(saved.saveSchemaVersion,2);
assert(saved.team.every(m=>Array.isArray(m.equipment)));
assert(saved.gearStock);
assert.equal(saved.team[0].id,c.id);
console.log('AUTO_EQUIPMENT_PASS stage 1/2/3, backpack, shared stock, 30% heal, immediate cures, no turn cost, save v2');
