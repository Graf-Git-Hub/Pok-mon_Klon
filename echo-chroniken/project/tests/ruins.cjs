const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{},Math,console};
vm.runInNewContext(fs.readFileSync('src/ruins.js','utf8'),sandbox);
const r=sandbox.window.EchoRuins;
assert(r);
const state={hasStarter:true,routeQuest:{accepted:true,rewarded:false,lights:['west','mitte','ost']},
 scene:'OVERWORLD',player:{x:25,y:21,dir:'up',stepPhase:0},potions:4,orbs:7};
assert(r.nearEntrance(state));let gate=r.entrance(state);
assert.equal(gate.entered,false);assert.equal(state.scene,'OVERWORLD');
state.routeQuest.rewarded=true;
gate=r.entrance(state);assert.equal(gate.entered,true);
assert.equal(state.scene,'RUINS');assert.equal(state.player.x,10);assert.equal(state.player.y,8);
const visited=new Set(['10,8']),queue=[[10,8]];
for(let i=0;i<queue.length;i++){
 const [x,y]=queue[i];
 for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(r.canStep(nx,ny)&&!visited.has(key)){visited.add(key);queue.push([nx,ny]);}
 }
}
for(const object of [...r.SEALS,r.ALTAR,r.MURAL]){
 const reach=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>visited.has((object.x+dx)+','+(object.y+dy)));
 assert(reach,'Story object is inaccessible: '+JSON.stringify(object));
}
assert(visited.has('10,9'),'exit corridor must be accessible');
const sfx={confirm(){},cancel(){},evolve(){},step(){}};
state.player={x:9,y:7,dir:'up',stepPhase:0};const mural=r.interact(state,sfx);
assert(mural.lines.join(' ').includes('WURZEL')||mural.lines.join(' ').includes('wurzelt'));
assert.equal(state.ruinsProgress.clueSeen,true);
state.player={x:14,y:5,dir:'right',stepPhase:0}; // wrong water first
let event=r.interact(state,sfx);
assert.equal(state.ruinsProgress.seals.length,0);assert(event.changed);
for(let i=0;i<3;i++){
 const seal=r.SEALS[i];state.player={x:seal.x+1,y:seal.y,dir:'left',stepPhase:0};
 event=r.interact(state,sfx);
 assert(event.changed,'seal '+seal.id+' activates');
 assert.equal(state.ruinsProgress.seals.length,i+1);
}
assert(event.heal);
state.player={x:10,y:2,dir:'up',stepPhase:0};
event=r.interact(state,sfx);assert(event.boss);
assert(event.lines.join(' ').includes('Wächter'));
assert.equal(state.ruinsProgress.bossWon,false);
const win=r.victory(state);
assert.equal(state.ruinsProgress.bossWon,true);
assert.equal(state.potions,6);assert.equal(state.orbs,10);
assert(win.join(' ').includes('Vaters Stimme'));
assert.deepEqual([...r.victory(state)],[],'second victory cannot pay again');
state.ruinsProgress.reported=true;
const persisted=JSON.parse(JSON.stringify(state));r.ensure(persisted);
assert(persisted.ruinsProgress.bossWon&&persisted.ruinsProgress.reported);
const display={fillStyle:'',font:'',textAlign:'',save(){},restore(){},fillRect(){},fillText(){}};
r.render(display,550,persisted,()=>{});
r.drawEntrance(display,550,persisted,400,320,()=>{});
state.player={x:10,y:9,dir:'down',stepPhase:0};
let result=r.walk(state,0,1,'down',sfx);assert(result.exited);
assert.equal(state.scene,'OVERWORLD');assert.equal(state.player.x,25);assert.equal(state.player.y,21);
assert.equal(r.nearEntrance(state),true);
console.log('PASS: gate, reachable story objects, clue, ordered seals, one-time reward, boss victory, save/load, scene rendering and exit');
