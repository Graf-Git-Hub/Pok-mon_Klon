const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const file = path.resolve(__dirname, '../../docs/gb-classic/echo-chroniken-nordufer-test.html');
const html = fs.readFileSync(file, 'utf8');
let time = 0;
const elements = new Map();
const listeners = new Map();
const ctx = {fillRect(){}, drawImage(){}};
const pad = ['1,0','-1,0','0,-1','0,1'].map(move => ({
  dataset:{move}, events:new Map(),
  addEventListener(name, handler){this.events.set(name,handler);},
}));
const env = vm.createContext({
  assert,
  performance:{now:()=>time},
  tick:ms=>time+=ms,
  window:{innerWidth:390,innerHeight:844,addEventListener:(name,fn)=>listeners.set(name,fn)},
  document:{
    body:{classList:{toggle(){}}},
    getElementById(id){
      if(!elements.has(id))elements.set(id,{getContext:()=>ctx,appendChild(){},addEventListener(){}});
      return elements.get(id);
    },
    createElement:()=>({}),
    querySelectorAll:()=>pad,
  },
  pad,listeners,
  Image:class{complete=true;naturalWidth=1;decode(){return Promise.resolve();}},
  requestAnimationFrame(){}, setInterval(){return 1;}, clearInterval(){},
  navigator:{getGamepads:()=>[]},
});
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1]+`
const village=DATA.scenes.legacy_wurzeldorf, shore=DATA.scenes.lake_north_path;
stage('legacy_wurzeldorf');
assert.equal(px,23);
assert.equal(py,14);
listeners.get('keydown')({key:'ArrowRight',preventDefault(){}});
const start=actorPose();
assert.equal(start.x,23);
tick(67);
assert.equal(actorPose().x,23.5);
assert.equal(cameraFor(village).x,19);
tick(67);
assert.equal(actorPose().x,24);
listeners.get('keyup')({key:'ArrowRight'});
for(let i=0;i<11;i++){step(1,0);tick(140);}
assert.equal(px,35);
const before=cameraFor(village);
step(1,0);
assert.equal(scene,'lake_north_path');
const after=cameraFor(shore);
assert.equal(before.x,after.x+36,'camera world position must match across the seam');
assert.equal(before.y,after.y);
tick(140);
for(let i=0;i<5;i++){step(1,0);tick(100);if(i===4)assert(grassPose(px,py,performance.now())>=0);tick(40);}
assert.equal(tileAt(shore,px,py),'grass');
stage('lake_north_path');
const tap=pad[0];
tap.events.get('pointerdown')({preventDefault(){}});
tap.events.get('pointerup')();
tick(140);
assert.equal(px,3);
function route(moves,grassExpected){
 let grass=false;
 for(const [dx,dy,count] of moves){
  for(let n=0;n<count;n++){
   const old=[px,py];
   step(dx,dy);tick(140);
   assert(px!==old[0] || py!==old[1]);
   grass ||= tileAt(shore,px,py)==='grass';
  }
 }
 assert.equal(px,14);
 assert.equal(py,14);
 assert.equal(grass,grassExpected);
}
stage('lake_north_path');
route([[1,0,12]],true);
stage('lake_north_path');
route([[1,0,2],[0,1,4],[1,0,10],[0,-1,4]],false);
stage('lake_north_path',false,{x:0,y:14});
step(-1,0);
assert.equal(scene,'legacy_wurzeldorf');
assert.equal(px,35);
window.innerWidth=1280;window.innerHeight=720;
assert.equal(screenTiles().w,10);
assert.equal(screenTiles().h,9);
`,env);
console.log('PASS: keyboard, touch, 10×9 camera, half-step, seamless crossing both ways, grass animation and both routes');
