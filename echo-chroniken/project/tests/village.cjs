const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const env={window:{},console,Math,Set};vm.runInNewContext(fs.readFileSync('src/village.js','utf8'),env);
const v=env.window.EchoVillage, W=36,H=28;
const map=Array.from({length:H},(_,y)=>Array.from({length:W},(_,x)=>x===0||y===0||x===W-1||y===H-1?1:0));
map[4][8]=0;map[6][4]=6;map[13][16]=6;map[21][30]=6;
v.map=map;v.build(map);
const homes=[{id:'oma',x:3,y:2},...v.homes];
assert.equal(homes.length,5);
for(const h of homes){
  for(let y=h.y;y<h.y+3;y++)for(let x=h.x;x<h.x+5;x++)assert.equal(map[y][x],5, 'Solid building '+h.id);
  assert.equal(map[h.y+3][h.x+2],8,'Front door accessible '+h.id);
  assert.equal(map[h.y+4][h.x+2],8,'Path outside '+h.id);
  assert.equal(v.doorAt(h.x+2,h.y+2)?.id,h.id==='oma'?undefined:h.id);
}
const walkable=(x,y)=>x>0&&y>0&&x<W-1&&y<H-1&&![1,4,5,7].includes(map[y][x]);
const q=[[5,6]],visited=new Set(['5,6']);
for(let k=0;k<q.length;k++){
 const [x,y]=q[k];
 for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
  const nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(walkable(nx,ny)&&!visited.has(key)){visited.add(key);q.push([nx,ny]);}
 }
}
for(const [x,y,label] of [[11,12,'Diary1'],[23,11,'Diary2'],[28,20,'Diary3'],[24,6,'Musicbox'],[16,9,'Gym1'],[25,13,'Gym2'],[31,22,'Gym3'],[30,21,'Altar'],[34,13,'East exit'],[6,17,'Workshop']]){
 assert(visited.has(x+','+y),'Unreachable quest/destination: '+label+' '+x+','+y);
}
for(const p of v.getNpcList()){assert(walkable(p.x,p.y),'NPC blocked: '+p.name);assert(visited.has(p.x+','+p.y),'NPC not reachable: '+p.name);assert(p.talk().length>0);}
let safeTall=0,wild=0,paths=0;
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
  if(map[y][x]===9)safeTall++;
  if(map[y][x]===2){wild++;assert(!(x<=28&&y<=18),'Wild encounter inside town at '+x+','+y);}
  if(map[y][x]===8)paths++;
}
assert(safeTall>=10);assert(wild>=10);assert(paths>=45);
assert.notEqual(map[13][15],map[13][5],'Old rigid east-west line still dominates');
const ctx={fillStyle:'',font:'',fillRect(){},fillText(){}};
const draw=()=>{};
assert.equal(v.paintTile(8,ctx,0,0,10,8,0,draw),true);
assert.equal(v.paintTile(9,ctx,0,0,8,5,300,draw),true);
assert.equal(v.paintTile(1,ctx,0,0,0,0,0,draw),false);
v.draw(ctx,5,5,200,draw);
console.log('PASS Wurzelheim: 5 buildings, accessible doors, 3 residents, quests/bosses reachable, '+paths+' paths, '+safeTall+' safe grass tufts and '+wild+' wild tiles.');
