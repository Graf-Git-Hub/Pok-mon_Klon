const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const read=p=>fs.readFileSync(p,'utf8');
const context2d=()=>new Proxy({measureText(s){return {width:String(s).length*6}},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
function element(){return {style:{},dataset:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},onclick:null,querySelectorAll(){return []},appendChild(){},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}},getContext:context2d}}
const els={},doc={documentElement:{classList:{add(){},remove(){}}},getElementById(id){return els[id]??(els[id]=element())},createElement:element,addEventListener(){}};
const store={},win={document:doc,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{},ECHO_ATLAS_DATA:''};
const env={document:doc,window:win,navigator:{getGamepads(){return []}},localStorage:{getItem:k=>store[k],setItem:(k,v)=>store[k]=v},location:win.location,URLSearchParams,Math,console,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){},Uint8ClampedArray};
vm.runInNewContext(read('data/species.js'),env);
vm.runInNewContext(read('data/affinities.js'),env);
vm.runInNewContext(read('data/skills.js'),env);
vm.runInNewContext(read('src/village.js'),env);
vm.runInNewContext(read('src/first-route.js'),env);
vm.runInNewContext(read('src/interiors.js'),env);
vm.runInNewContext(read('src/combat-fx.js'),env);
vm.runInNewContext(read('src/house.js'),env);
vm.runInNewContext(read('src/game.js'),env);
const input=win.tvControllerInput,snap=win.echoQASnapshot;
function press(...cmds){cmds.forEach(input)}
function finish(){let count=0;while(snap().dialogPages&&count++<30)input('A');assert(count<30)}
assert.equal(snap().scene,'HOUSE');assert.equal(snap().introStage,0);assert.equal(snap().mode,'TITLE');
press('A');assert.equal(snap().mode,'OVERWORLD');
// Attempt to exit before the package: Oma stops us.
press('DOWN','DOWN','DOWN');assert.equal(snap().scene,'HOUSE');finish();
press('UP','UP','LEFT','LEFT','LEFT','A');assert.equal(snap().introStage,1);finish();
// Table is reached from the south.
press('UP','RIGHT','RIGHT','RIGHT','RIGHT','RIGHT','RIGHT','UP','UP','A');
assert.equal(snap().introStage,2);assert.equal(snap().starter,true);assert.equal(snap().team.length,1);assert.equal(snap().team[0].id,1);finish();
press('DOWN','LEFT','LEFT','LEFT','LEFT','LEFT','LEFT','DOWN','LEFT','A');
assert.equal(snap().introStage,3);finish();
press('RIGHT','RIGHT','DOWN','DOWN','DOWN');assert.equal(snap().scene,'OVERWORLD');assert.equal(snap().introStage,4);finish();
press('UP','UP');assert.equal(snap().scene,'HOUSE');
press('START','DOWN','DOWN','DOWN','DOWN','DOWN','A');assert.equal(snap().mode,'DIALOG');
const saved=JSON.parse(store.echo_chroniken_tv_save);assert.equal(saved.scene,'HOUSE');assert.equal(saved.introStage,4);
console.log('PASS: Grandma -> parcel -> Miora -> Grandma -> exit -> reentry -> saved stage');
