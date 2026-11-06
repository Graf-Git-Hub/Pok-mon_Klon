const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const fixtures=path.join(__dirname,'fixtures/saves');
const game=fs.readFileSync('src/game.js','utf8');
function makeCtx(){
 return new Proxy({measureText(x){return {width:String(x).length*6}},
   getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},
   createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},
   createLinearGradient(){return {addColorStop(){}}}},
  {get:(o,p)=>p in o?o[p]:()=>{},set:(o,p,v)=>(o[p]=v,true)});
}
function run(raw) {
 const store={};
 if(raw!==null)store.echo_chroniken_tv_save=raw;
 const timers=[],els={},doc={
  documentElement:{classList:{add(){},remove(){}}},
  getElementById(id){return els[id]||(els[id]={dataset:{},style:{},
   value:'',textContent:'',classList:{add(){},remove(){}},
   listeners:{},addEventListener(type,fn){(this.listeners[type]??=[]).push(fn)},querySelectorAll(){return []},appendChild(){},
   getBoundingClientRect(){return {left:0,top:0,width:320,height:180}},
   getContext:makeCtx})},
  createElement(){return {style:{},addEventListener(){},getContext:makeCtx}},addEventListener(){}
 };
 const win={document:doc,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{},ECHO_ATLAS_DATA:''};
 const env={window:win,document:doc,location:win.location,URLSearchParams,
   navigator:{getGamepads(){return []}},Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
   localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v},
   Math:Object.assign(Object.create(Math),{random:()=>0}),console,Uint8ClampedArray,setTimeout(fn){timers.push(fn)},clearTimeout(){},setInterval(){},
   clearInterval(){},requestAnimationFrame(){}};
 for(const file of ['data/species.js','data/affinities.js','data/skills.js','src/village.js','src/first-route.js',
   'src/exploration.js','src/interiors.js','src/combat-fx.js','src/platformer.js',
   'src/ruins.js','src/house.js','src/maps/registry.js','src/quests/registry.js','src/archive.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
 const injected='window.__saveQA={state:gameState,saveGame,loadGame,createMonsterInstance,executeBattleAction};\n';
 vm.runInNewContext(game.replace('  // --- HAUPTSCHLEIFE (GAME LOOP) ---',
   injected+'  // --- HAUPTSCHLEIFE (GAME LOOP) ---'),env);
 return {store,win,els,timers,state:win.__saveQA.state,save:()=>win.__saveQA.saveGame(true)};
}
let count=0;
for(const name of fs.readdirSync(fixtures).filter(f=>f.endsWith('.json'))){
 const raw=fs.readFileSync(path.join(fixtures,name),'utf8'),old=JSON.parse(raw);
 const session=run(raw),s=session.state;
 assert.equal(s.currentMapId,'legacy_wurzeldorf',name);
 assert.equal(s.saveSchemaVersion,2,name);
 assert.equal(s.safeSpawnId,'legacy_current_position',name);
 assert.equal(session.store.echo_chroniken_tv_save,raw,'Loading must not overwrite saved bytes: '+name);
 for(const key of ['hasStarter','badges','potions','orbs']){
  assert.equal(s[key],old[key],name+' '+key);
 }
 assert.equal(s.team.length,old.team.length,name);
 if(old.team.length)assert.equal(s.team[0].id,1,name);
 if(old.routeQuest)assert.equal(s.routeQuest.rewarded,old.routeQuest.rewarded,name);
 if(old.scene&&old.scene!=='BUILDING')assert.equal(s.scene,old.scene,name);
 if(old.roomId==='werkstatt')assert.equal(s.roomId,'werkstatt',name);
 const maps=session.win.EchoMaps;
 if(old.saveSchemaVersion!==2)assert.equal(session.store[maps.BACKUP_KEY],raw,'v1 exact backup '+name);
 else assert.equal(session.store[maps.BACKUP_KEY],undefined,'v2 backup not needed');
 session.save();
 const newSave=JSON.parse(session.store.echo_chroniken_tv_save);
 assert.equal(newSave.saveSchemaVersion,2,name);
 assert.equal(newSave.currentMapId,'legacy_wurzeldorf',name);
 assert.equal(newSave.safeSpawnId,'legacy_current_position',name);
 assert.equal(newSave.team.length,old.team.length,name);
 assert.equal(newSave.badges,old.badges,name);
 if(old.routeQuest)assert.equal(newSave.routeQuest.rewarded,old.routeQuest.rewarded,name);
 if(old.saveSchemaVersion!==2)assert.equal(session.store[maps.BACKUP_KEY],raw,'Backup must survive resave');
 count++;
}
const corrupted=fs.readFileSync(path.join(fixtures,'09-corrupt.json.txt'),'utf8');
const failed=run(corrupted);
assert.equal(failed.state.hasStarter,false);
assert.equal(failed.state.currentMapId,'legacy_wurzeldorf');
assert.equal(failed.store.echo_chroniken_tv_save,corrupted);
assert.equal(failed.store[failed.win.EchoMaps.BACKUP_KEY],undefined);
const archiveSession=run(null);
archiveSession.state.team=Array.from({length:6},(_,i)=>({id:i+1,lv:10,hp:30,maxHp:30,moves:[0]}));
archiveSession.state.archive=[{id:7,lv:18,hp:40,maxHp:40,moves:[0]}];
archiveSession.state.hasStarter=true;
archiveSession.state.mode='OVERWORLD';
archiveSession.win.tvControllerInput('START');
for(let i=0;i<4;i++)archiveSession.win.tvControllerInput('DOWN');
archiveSession.win.tvControllerInput('A');
assert.equal(archiveSession.state.mode,'ARCHIVE','Menu must open archive');
archiveSession.win.tvControllerInput('A');
assert.equal(archiveSession.state.team[0].id,7,'Gamepad A must retrieve archived creature');
assert.equal(archiveSession.state.archive[0].id,1,'Starter must remain in archive');
archiveSession.win.tvControllerInput('B');
assert.equal(archiveSession.state.mode,'MENU','B must return to menu');
archiveSession.save();
const restored=run(archiveSession.store.echo_chroniken_tv_save);
assert.equal(restored.state.saveSchemaVersion,2,'No save schema bump');
assert.equal(restored.state.archive[0].id,1,'Archived starter must survive reload');
assert.equal(restored.state.team[0].id,7,'Swapped team member must survive reload');
console.log('PASS: '+count+' synthetic save fixtures + corrupt save; legacy team, intro, quests, arenas, archive/gamepad swap, raw backup and v2 roundtrips');

// Exercise the real capture callback, input handlers and save/load, not source strings.
const caught=run(null),qa=caught.win.__saveQA;
caught.state.hasStarter=true;
caught.state.team=Array.from({length:6},(_,i)=>qa.createMonsterInstance(i+1,10));
for(let id=7;id<=150;id++){
 const enemy=qa.createMonsterInstance(id,12);
 caught.state.orbs=10;caught.state.mode='BATTLE';
 caught.state.battle={enemy,isTrainer:false,busy:false};
 qa.executeBattleAction(2);
 while(caught.timers.length)caught.timers.shift()();
 assert.equal(caught.state.team.length,6);
 assert.equal(caught.state.archive.length,id-6,'Every full-team capture is retained');
 assert.equal(caught.state.caughtIds[id],true);
}
const reloaded=run(caught.store.echo_chroniken_tv_save);
assert.equal(reloaded.state.archive.length,144,'Capture autosave survives reload');
assert.equal(reloaded.state.archive[143].id,150);
reloaded.state.mode='OVERWORLD';
const command=c=>reloaded.win.tvControllerInput(c);
command('START');for(let i=0;i<4;i++)command('DOWN');command('A');
command('UP');assert.equal(reloaded.state.archiveCursor,143,'Wrap to final archive entry');
command('DOWN');assert.equal(reloaded.state.archiveCursor,0);
command('LEFT');assert.equal(reloaded.state.archiveTeamCursor,5);
command('RIGHT');assert.equal(reloaded.state.archiveTeamCursor,0);
const canvas=Object.values(reloaded.els).find(e=>e.listeners.pointerdown);
assert(canvas,'Canvas pointer handler registered');
const tap=(x,y)=>canvas.listeners.pointerdown.forEach(fn=>fn({clientX:x,clientY:y}));
tap(200,45);assert.equal(reloaded.state.archiveTeamCursor,1);
tap(20,45);assert.equal(reloaded.state.archiveTeamCursor,0);
tap(30,100);assert.equal(reloaded.state.archiveCursor,1);
tap(30,100);assert.equal(reloaded.state.team[0].id,8,'Touch retrieves selected echo');
assert.equal(reloaded.state.archive[1].id,1,'Touch preserves starter');
const touchReload=run(reloaded.store.echo_chroniken_tv_save);
assert.equal(touchReload.state.team[0].id,8);
assert.equal(touchReload.state.archive[1].id,1);
// The fifth visible row includes pixel 150 (baseline 147 + three pixels).
reloaded.state.archiveCursor=0;
tap(30,150);assert.equal(reloaded.state.archiveCursor,4,'Bottom pixel of fifth visible row is tappable');
console.log('PASS: 144 real full-team captures, autosave/reload, cursor wrap, team selection and pointer swaps');

// A lab swap must never replace a real archived creature after restoring the game.
const lab=run(null),lq=lab.win.__saveQA;
lab.state.team=[lq.createMonsterInstance(2,20)];
lab.state.archive=[lq.createMonsterInstance(150,30)];
lab.state.hasStarter=true;lab.state.mode='OVERWORLD';
const original=JSON.stringify({team:lab.state.team,archive:lab.state.archive});
lab.save();const originalSave=lab.store.echo_chroniken_tv_save;
lab.els['lab-start'].listeners.click[0]();
lq.executeBattleAction(2);while(lab.timers.length)lab.timers.shift()();
while(lab.state.mode==='DIALOG')lab.win.tvControllerInput('A');
lab.win.tvControllerInput('START');
for(let i=0;i<4;i++)lab.win.tvControllerInput('DOWN');
lab.win.tvControllerInput('A');lab.win.tvControllerInput('A');
assert.equal(lab.state.team[0].id,150,'Test really retrieves real-looking archived echo into lab');
lab.state.team[0].hp=1;lab.state.team[0].moves.push(99);
assert.equal(lab.store.echo_chroniken_tv_save,originalSave,'Lab must not autosave');
lab.win.echoBattleLab.stop();
assert.equal(JSON.stringify({team:lab.state.team,archive:lab.state.archive}),original,'Lab must restore original collection, including nested moves and HP');
lab.save();const afterLab=run(lab.store.echo_chroniken_tv_save);
assert.equal(afterLab.state.archive[0].id,150,'Original archived monster survives lab, save and reload');
assert.equal(afterLab.state.team[0].id,2);
console.log('PASS: Battle Lab archive isolated, nested monster state preserved, original save/reload safe');
