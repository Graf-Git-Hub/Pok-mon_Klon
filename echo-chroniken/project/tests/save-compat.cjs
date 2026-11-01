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
 const els={},doc={
  documentElement:{classList:{add(){},remove(){}}},
  getElementById(id){return els[id]||(els[id]={dataset:{},style:{},
   value:'',textContent:'',classList:{add(){},remove(){}},
   addEventListener(){},querySelectorAll(){return []},appendChild(){},
   getBoundingClientRect(){return {left:0,top:0,width:320,height:180}},
   getContext:makeCtx})},
  createElement(){return {style:{},addEventListener(){},getContext:makeCtx}},addEventListener(){}
 };
 const win={document:doc,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{},ECHO_ATLAS_DATA:''};
 const env={window:win,document:doc,location:win.location,URLSearchParams,
   navigator:{getGamepads(){return []}},Image:class{constructor(){this.complete=true;this.naturalWidth=256}},
   localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=v},
   Math,console,Uint8ClampedArray,setTimeout(){},clearTimeout(){},setInterval(){},
   clearInterval(){},requestAnimationFrame(){}};
 for(const file of ['data/species.js','src/village.js','src/first-route.js',
   'src/exploration.js','src/interiors.js','src/combat-fx.js','src/platformer.js',
   'src/ruins.js','src/house.js','src/maps/registry.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),env);
 const injected='window.__saveQA={state:gameState,saveGame,loadGame};\n';
 vm.runInNewContext(game.replace('  // --- HAUPTSCHLEIFE (GAME LOOP) ---',
   injected+'  // --- HAUPTSCHLEIFE (GAME LOOP) ---'),env);
 return {store,win,state:win.__saveQA.state,save:()=>win.__saveQA.saveGame(true)};
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
console.log('PASS: '+count+' synthetic save fixtures + corrupt save; legacy team, intro, quests, arenas, room state, raw backup and v2 roundtrips');
