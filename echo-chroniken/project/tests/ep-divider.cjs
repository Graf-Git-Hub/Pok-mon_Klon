// EP sharing regression: real engine rewards, actual team-switch input and save safety.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
function fakeCtx(){return new Proxy({measureText(t){return {width:String(t).length*5}},createLinearGradient(){return {addColorStop(){}}}}, {get(o,k){return k in o?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});}
function el(){return {dataset:{},style:{},value:'',classList:{add(){},remove(){}},addEventListener(){},getContext(){return fakeCtx()},appendChild(){},querySelectorAll(){return []},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
function harness(initialSave){
 const elements={},stored={};
 if(initialSave)stored.echo_chroniken_tv_save=JSON.stringify(initialSave);
 const document={documentElement:{classList:{add(){}}},getElementById(x){return elements[x]??(elements[x]=el())},createElement:el,addEventListener(){}};
 const window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{}};
 const env={window,document,navigator:{getGamepads(){return []}},location:window.location,URLSearchParams,Math,console,
  Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
  localStorage:{getItem(k){return stored[k]||null},setItem(k,v){stored[k]=v}},
  setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
 for(const file of ['data/species.js','data/affinities.js','data/skills.js','data/encounters.js','src/encounters/registry.js','src/village.js','src/house.js'])
  vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
 const engine=fs.readFileSync('src/game.js','utf8');
 const marker='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
 assert(engine.includes(marker));
 vm.runInNewContext(engine.replace(marker,
  'window.testRewards={state:gameState,createMonsterInstance,startTrainerBattle,handleEnemyDefeated,toggleSupportRune,availableRunes,saveGame};\n'+marker),env);
 const api=window.testRewards;
 return {api,window,stored,reset(...team){
   Object.assign(api.state,{team,archive:[],caughtIds:{},seenIds:{},mode:'OVERWORLD',battle:null,
    battleWins:0,supportRuneUnlocked:false,runes:{},runeRewards:{},badges:0});
  },fresh:(id=4,lv=20)=>api.createMonsterInstance(id,lv),
  battle(lv=4,rounds=1){
   api.startTrainerBattle(null,'Trainer-Test',Array.from({length:rounds},(_,i)=>({id:4+i,lv})));
  }, win(){api.handleEnemyDefeated();}};
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5);
 h.reset(a,b);h.battle();h.win();
 assert.equal(a.xp,62);assert.equal(b.xp,24,'baseline 40% reserve XP unchanged');
 assert.equal(h.api.state.supportRuneUnlocked,true,'first win unlocks passive rune');
 assert(h.api.availableRunes().some(r=>r.id==='ep_teiler'&&r.kind==='support'));
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5),c=h.fresh(6);
 h.reset(a,b,c);h.battle();
 const battle=h.api.state.battle;
 battle.cursor=1;
 h.window.tvControllerInput('A');
 assert.equal(h.api.state.mode,'TEAM_SELECT');
 h.api.state.teamCursor=1;
 h.window.tvControllerInput('A');
 assert.equal(h.api.state.team[0],b);
 assert.equal(battle.participants.length,2,'real switch records both fighters');
 h.win();
 assert.equal(a.xp,31,'switched-out fighter keeps 50% of active pool');
 assert.equal(b.xp,31,'new fighter gets 50% active pool');
 assert.equal(c.xp,24,'uninvolved reserve still receives bounded passive XP');
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5),c=h.fresh(6);
 h.reset(a,b,c);h.api.state.supportRuneUnlocked=true;
 const attackSlots=a.equippedMoves.slice();
 assert.match(h.api.toggleSupportRune(a),/EP-Teiler/);
 assert.equal(a.heldSupportRune,'ep_teiler');
 assert.deepEqual(a.equippedMoves,attackSlots,'passive rune uses no attack slots');
 h.battle();
 h.api.state.team.splice(1,1);h.api.state.team.unshift(b);
 h.api.state.battle.participants.push(b);
 h.win();
 assert.equal(a.xp,31);
 assert.equal(b.xp,31);
 assert.equal(c.xp,62,'carrying fighter entered and left: full bonus XP to healthy reserve');
 const save=JSON.parse(h.stored.echo_chroniken_tv_save);
 assert.equal(save.supportRuneUnlocked,true);
 assert(save.team.some(m=>m.heldSupportRune==='ep_teiler'),'equipment persists in regular save');
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5),c=h.fresh(6);
 h.reset(a,b,c);h.api.state.supportRuneUnlocked=true;
 h.api.toggleSupportRune(b);
 h.battle();h.win();
 assert.equal(a.xp,62);
 assert.equal(b.xp,12,'rune on untouched bench does NOT activate');
 assert.equal(c.xp,12);
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5),c=h.fresh(6);
 h.reset(a,b,c);h.api.state.supportRuneUnlocked=true;
 h.api.toggleSupportRune(b);
 h.battle();
 b.hp=0;
 h.api.state.battle.participants.push(b);
 h.win();
 assert.equal(a.xp,62);
 assert.equal(b.xp,0,'KO rune bearer gains no experience');
 assert.equal(c.xp,24,'KO rune bearer cannot enable full reserve XP');
}
{
 const h=harness(),party=Array.from({length:6},(_,i)=>h.fresh(i+4));
 h.reset(...party);h.api.state.supportRuneUnlocked=true;
 h.api.toggleSupportRune(party[0]);h.battle();h.win();
 assert.equal(party[0].xp,62);
 for(const ally of party.slice(1))assert.equal(ally.xp,12,'full shared reserve pool is bounded across 5');
 assert.equal(party.slice(1).reduce((sum,m)=>sum+m.xp,0),60);
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5),c=h.fresh(6);
 h.reset(a,b,c);h.battle(4,2);
 const battle=h.api.state.battle;
 battle.participants.push(b);h.api.state.team=[b,a,c];
 h.win();
 assert.equal(a.xp,31);assert.equal(b.xp,31);assert.equal(c.xp,24);
 assert.equal(battle.participants.length,1,'trainer next enemy resets participant list');
 assert.equal(battle.participants[0],b);
 h.win();
 assert.equal(a.xp,43);assert.equal(b.xp,93);assert.equal(c.xp,36);
}
{
 const h=harness(),a=h.fresh(),b=h.fresh(5);
 h.reset(a,b);h.api.state.supportRuneUnlocked=true;
 const archived=h.fresh(6);h.api.state.archive.push(archived);
 h.api.toggleSupportRune(archived);
 assert.equal(archived.heldSupportRune,'ep_teiler');
 h.api.toggleSupportRune(a);
 assert.equal(archived.heldSupportRune,undefined,'no rune duplicates in archive');
 assert.equal(a.heldSupportRune,'ep_teiler');
 assert.match(h.api.toggleSupportRune(a),/abgelegt/);
 assert.equal(a.heldSupportRune,undefined);
}
{
 const old={saveSchemaVersion:2,team:[{uid:'old',id:4,lv:20,xp:0,nextXp:360,
   hp:99,maxHp:99,moves:['seelenstups'],equippedMoves:['seelenstups']}],
   archive:[],battleWins:2,badges:0,scene:'HOUSE',currentMapId:'legacy_wurzeldorf'};
 const h=harness(old);
 assert.equal(h.api.state.supportRuneUnlocked,true,'legacy wins retroactively unlock rune');
 assert.equal(h.api.state.saveSchemaVersion,2,'no save schema bump');
 assert.equal(h.api.state.team[0].id,4);
 h.api.toggleSupportRune(h.api.state.team[0]);
 const saved=JSON.parse(h.stored.echo_chroniken_tv_save);
 assert.equal(saved.team[0].heldSupportRune,'ep_teiler');
}
console.log('PASS EP-divider: real switch, bench-only, KO, six members, multi-enemy, archive, slot isolation, save migration');
