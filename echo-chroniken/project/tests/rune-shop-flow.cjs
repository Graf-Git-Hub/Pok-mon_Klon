// Genuine game-engine controls/shop/find/quest & save migration.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}})}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}}}
const elements={},stored={};
const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
const M=Object.create(Math);M.random=()=>.5;
const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math:M,console,
 Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
 localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},
 setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
const src=fs.readFileSync('src/game.js','utf8'),marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(src.includes(marker));
vm.runInNewContext(src.replace(marker,'window.shopAudit={s:gameState,createMonsterInstance,skillDamage,runeCombatModifiers,passiveHitHeal,gearLimit,toggleGear,toggleSupportRune,runeReserveXp,interactFront,startTrainerBattle,handleEnemyDefeated,purchaseShopItem,saveGame};\n'+marker),env);
const {s,createMonsterInstance:create,skillDamage,gearLimit,toggleGear,toggleSupportRune,passiveHitHeal,runeCombatModifiers,
 runeReserveXp,interactFront,startTrainerBattle,handleEnemyDefeated,purchaseShopItem,saveGame}=window.shopAudit;
s.team=[create(3,22),create(2,19),create(1,8)];
s.hasStarter=true;s.scene='OVERWORLD';s.currentMapId='legacy_wurzeldorf';s.mode='OVERWORLD';
assert.equal(gearLimit(s.team[0]),3);assert.equal(gearLimit(s.team[1]),2);assert.equal(gearLimit(s.team[2]),1);
const m=s.team[0],enemy=create(27,20),move={type:'NORMAL',power:45};
const base=skillDamage(m,enemy,move);
s.coins=0;
assert.match(purchaseShopItem('rune_kraft'),/Nicht genug/);
assert.equal(s.coins,0);
s.coins=500;
assert.match(purchaseShopItem('rune_kraft'),/Kraft-Rune/);
assert.equal(s.coins,380);
assert.equal(s.gearStock.rune_kraft,1);
assert.match(toggleGear(m,'rune_kraft'),/angelegt/);
assert.equal(s.gearStock.rune_kraft,0);
assert(skillDamage(m,enemy,move)>base,'Attack rune must boost genuine damage');
assert.equal(runeCombatModifiers(m).attack,1.12);
assert.match(purchaseShopItem('rune_schutz'),/Schutz-Rune/);
assert.equal(s.coins,260);
assert.match(toggleGear(enemy,'rune_schutz'),/angelegt/); // Both allies and enemies use identical item logic.
assert.equal(runeCombatModifiers(enemy).defense,.88);
assert.match(toggleGear(enemy,'rune_schutz'),/zurueckgelegt/);
assert.match(toggleGear(m,'rune_schutz'),/angelegt/);
assert.equal(runeCombatModifiers(m).defense,.88);
assert(skillDamage(enemy,m,move)<skillDamage(enemy,create(3,22),move),
  'Defense rune reduces incoming real engine damage');
s.supportRuneUnlocked=true;
assert.match(toggleSupportRune(m),/EP-Teiler/);
assert.equal(m.equipment.length,2);assert.equal(m.heldSupportRune,'ep_teiler');
assert.match(toggleGear(m,'rune_kraft'),/zurueckgelegt/);
assert.match(toggleGear(m,'rune_kraft'),/angelegt/);
assert.equal(m.equipment.length,2);
assert.equal(runeReserveXp(110,true,2),55);
assert.equal(runeReserveXp(110,false,2),22);
assert.equal(runeReserveXp(110,true,0),0);
// A rare rune cannot be purchased from the shop.
const money=s.coins;
assert.match(purchaseShopItem('rune_ahnen'),/Unbekannt/);assert.equal(s.coins,money);
// The actual village merchant is interactable from its door.
s.player={x:22,y:17,dir:'up',stepPhase:0};s.mode='OVERWORLD';
interactFront();
assert.equal(s.mode,'RUNE_SHOP','Village merchant should open a real store');
const beforeCoins=s.coins;
window.tvControllerInput('DOWN');window.tvControllerInput('DOWN');
window.tvControllerInput('A');
assert.equal(s.mode,'DIALOG');
window.tvControllerInput('A');assert.equal(s.mode,'RUNE_SHOP');
assert.equal(s.coins,beforeCoins-30);
window.tvControllerInput('B');assert.equal(s.mode,'OVERWORLD');
// A village one-time hidden collectible (not a repeatable money printer).
s.player={x:16,y:11,dir:'up',stepPhase:0};
const hiddenBefore=s.gearStock.rune_nebel||0;
interactFront();
assert.equal(s.runeFinds.mist,true,'Hidden rune should be discoverable by A');
assert.equal(s.gearStock.rune_nebel,hiddenBefore+1);
s.mode='OVERWORLD';interactFront();
assert.equal(s.gearStock.rune_nebel,hiddenBefore+1,'Hidden rune must not duplicate');
// Ancient keeper quest should grant exactly one non-shop rune.
const original=s.gearStock.rune_ahnen||0;
s.mode='OVERWORLD';
startTrainerBattle(null,'Vergessener Waechter',[{id:7,lv:5}]);
s.battle.ruinBoss=true;
handleEnemyDefeated();
assert.equal(s.gearStock.rune_ahnen,original+1);
assert.equal(s.runeFinds.ancestor,true);
s.mode='OVERWORLD';
startTrainerBattle(null,'Vergessener Waechter',[{id:7,lv:5}]);
s.battle.ruinBoss=true;
handleEnemyDefeated();
assert.equal(s.gearStock.rune_ahnen,original+1,'Quest rune may not be duplicated');
const healer=s.team[0];
assert.match(toggleGear(healer,'rune_kraft'),/zurueckgelegt/);
assert.match(toggleGear(healer,'rune_ahnen'),/angelegt/);
healer.hp=Math.max(1,healer.maxHp-20);
const heal=passiveHitHeal(healer);
assert(heal>=1&&heal<=Math.ceil(healer.maxHp*.03));
assert.equal(runeCombatModifiers(healer).heal,.03);
saveGame(true);
const saved=JSON.parse(stored.echo_chroniken_tv_save);
assert.equal(saved.saveSchemaVersion,2);
assert(saved.shopBought&&saved.runeFinds&&Number.isInteger(saved.coins));
assert.equal(saved.gearStock.rune_ahnen,0);
console.log('RUNE_SHOP_QUEST_PASS coins, merchant, attack/defense, EP triple slots, hidden collectible, one-time quest rune, healing, v2 save');
