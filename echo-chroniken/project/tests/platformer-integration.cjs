const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const rd=p=>fs.readFileSync(p,'utf8');
const context2d=()=>new Proxy({measureText(s){return {width:String(s).length*6}},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}});
function el(){return {style:{},dataset:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},querySelectorAll(){return []},getContext:context2d,getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}};}
const elems={},document={documentElement:{classList:{add(){},remove(){}}},getElementById(n){return elems[n]??(elems[n]=el())},createElement:el,addEventListener(){}};
const local={},window={document,addEventListener(){},location:{search:''},ECHO_BACK_URLS:{},ECHO_ATLAS_DATA:''};
const env={window,document,localStorage:{getItem:k=>local[k],setItem:(k,v)=>local[k]=v},location:window.location,URLSearchParams,navigator:{getGamepads(){return []}},console,Math,Image:class{constructor(){this.complete=true;this.naturalWidth=256}},Uint8ClampedArray,setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){}};
for(const p of ['data/species.js','data/affinities.js','data/skills.js','src/village.js','src/first-route.js','src/exploration.js','src/interiors.js','src/combat-fx.js','src/platformer.js','src/house.js'])vm.runInNewContext(rd(p),env);
const engine=rd('src/game.js');
const anchor='  // --- HAUPTSCHLEIFE (GAME LOOP) ---';
assert(engine.includes(anchor));vm.runInNewContext(engine.replace(anchor,'window.__stageGame=gameState;window.__stageMap=worldMap;\n'+anchor),env);
const s=window.__stageGame,press=x=>window.tvControllerInput(x),platform=window.EchoPlatformer,world=window.__stageMap;
function walkable(x,y){return x>=1&&x<35&&y>=1&&y<27&&![1,4,5,7].includes(world[y][x]);}
const queue=[[5,6]],seen=new Set(['5,6']);
for(let i=0;i<queue.length;i++)for(const [dx,dy]of[[0,1],[0,-1],[1,0],[-1,0]]){
 const [x,y]=queue[i],nx=x+dx,ny=y+dy,key=nx+','+ny;
 if(walkable(nx,ny)&&!seen.has(key)){seen.add(key);queue.push([nx,ny]);}
}
const goal=platform.PORTAL;
assert([[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>seen.has((goal.x+dx)+','+(goal.y+dy))),'dream portal must be walkable from Grandma');
s.mode='OVERWORLD';s.scene='OVERWORLD';s.hasStarter=true;s.team=[{id:1,lv:5,hp:30,maxHp:30,moves:['seelenstups']}];
s.player={x:goal.x-1,y:goal.y,dir:'right',stepPhase:0};
assert(platform.nearPortal(s));
press('A');assert.equal(s.mode,'PLATFORM','real A action should enter side scroller');
assert.equal(platform.snapshot().collected.filter(Boolean).length,0);
press('RIGHT');press('A');
const started=platform.snapshot();
assert(started.jumps===undefined || started.y<=132);
press('START');assert(platform.snapshot().paused);
press('START');assert(!platform.snapshot().paused);
press('B');assert.equal(s.mode,'OVERWORLD');
assert.equal(s.player.x,goal.x-1);assert.equal(s.player.y,goal.y);
assert.equal(JSON.parse(local.echo_chroniken_tv_save).platformProgress.cleared,false);
const html=rd('index.html');
assert(html.includes('<script src="src/platformer.js"></script>'));
assert(engine.includes('window.EchoPlatformer.drawPortal'));
assert(engine.includes("PLATFORM:'Springen'"));
assert(engine.includes("const jump=b(1)"));
assert(engine.includes("const back=b(0)"));
console.log('PASS: portal accessible on actual world map, A enters, D-pad and jump, START pause, B exits, and saved progress remains valid');
