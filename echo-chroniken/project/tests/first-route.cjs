const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const env={window:{},console,Math,Set};
vm.runInNewContext(fs.readFileSync('src/village.js','utf8'),env);
vm.runInNewContext(fs.readFileSync('src/first-route.js','utf8'),env);
const v=env.window.EchoVillage,r=env.window.EchoRoute;
assert(r&&v);
const W=36,H=28,map=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||x===W-1||y===0||y===H-1?1:0));
map[6][4]=6;map[13][16]=6;map[21][30]=6;v.map=map;v.build(map);r.build(map);
const walkable=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&![1,4,5,7].includes(map[y][x]);
const todo=[[5,6]],seen=new Set(['5,6']);
for(let i=0;i<todo.length;i++)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
 const [x,y]=todo[i],xx=x+dx,yy=y+dy,key=xx+','+yy;
 if(walkable(xx,yy)&&!seen.has(key)){seen.add(key);todo.push([xx,yy]);}
}
for(const pos of [...r.POINTS,r.GUIDE,r.KEEPER]){
 assert(walkable(pos.x,pos.y),'Blocked: '+pos.id);
 assert(seen.has(pos.x+','+pos.y),'Unreachable: '+pos.id);
}
for(const [x,y] of [[11,12],[23,11],[28,20],[24,6],[16,9],[25,13],[31,22]]){
 assert(seen.has(x+','+y),'Existing story quest broken: '+x+','+y);
}
const state={hasStarter:true,player:{x:17,y:17,dir:'down'},potions:1,orbs:2};
const calls={catch:0,evolve:0};
const sfx={catch(){calls.catch++},evolve(){calls.evolve++}};
const q=r.quest(state);
assert.equal(r.progress(state),0);assert.equal(q.accepted,false);
let dialog=r.guideTalk(state,sfx);
assert.equal(q.accepted,true);assert(dialog.join(' ').includes('drei'));
assert.equal(r.collectNear(state,sfx),null,'Do not collect from afar');
for(let i=0;i<r.POINTS.length;i++){
 const point=r.POINTS[i];
 state.player={x:point.x,y:point.y+1,dir:'left'};
 dialog=r.collectNear(state,sfx);
 assert(dialog&&dialog.join(' ').includes(point.name));
 assert.equal(r.progress(state),i+1);
 assert.equal(r.collectNear(state,sfx),null,'Cannot pick up light twice');
}
assert.equal(calls.catch,3);assert.equal(r.progress(state),3);
assert.equal(r.keeperTalk(state).length>0,true,'Keeper gated until quest turn-in');
dialog=r.guideTalk(state,sfx);
assert.equal(q.rewarded,true);assert.equal(state.potions,3);assert.equal(state.orbs,7);
const pot=state.potions,orbs=state.orbs;
r.guideTalk(state,sfx);assert.equal(state.potions,pot);assert.equal(state.orbs,orbs);
assert.equal(r.keeperTalk(state),null,'Optional keeper challenge unlocked');
dialog=r.keeperWin(state,sfx);
assert.equal(q.guardianWon,true);assert.equal(state.potions,4);assert.equal(state.orbs,10);
assert(dialog.join(' ').includes('Waldhüter'));
r.keeperWin(state,sfx);assert.equal(state.potions,4);assert.equal(state.orbs,10);
assert(r.keeperTalk(state).length>0);
const saved=JSON.stringify(state),resumed=JSON.parse(saved);
assert.equal(r.progress(resumed),3);assert.equal(resumed.routeQuest.guardianWon,true);
const ctx={fillStyle:'',font:'',save(){},restore(){},fillText(){},fillRect(){}};
r.draw(ctx,150,{...resumed,player:{x:14,y:19}},0,0,()=>{});
console.log('PASS: woodland route reachable, 3 unique lights, progress/save, one-time reward, optional guardian, '+seen.size+' reachable tiles');
