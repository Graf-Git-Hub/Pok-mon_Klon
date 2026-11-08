// Wurzelheim visual style guard: ensures clean pixel surfaces without touching quests.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{},console,Math,Set};
vm.runInNewContext(fs.readFileSync('src/village.js','utf8'),context);
const village=context.window.EchoVillage;
const map=Array.from({length:28},(_,y)=>Array.from({length:36},(_,x)=>x===0||y===0||x===35||y===27?1:0));
map[6][4]=6;map[13][16]=6;map[21][30]=6;
village.map=map;village.build(map);
const draw=(id,x,y)=>{
 const calls=[];
 const ctx={save(){},restore(){},fillText(){},fillStyle:'',font:''};
 assert.equal(village.paintTile(id,ctx,0,0,x,y,10,(...args)=>calls.push(args)),true);
 assert(calls.every(p=>p[0]>=0&&p[1]>=0&&p[0]+p[2]<=16&&p[1]+p[3]<=16),'Paint outside 16px tile');
 return calls;
};
const grass=draw(9,9,17),dirt=draw(8,14,11),stone=draw(3,14,11);
assert(grass.length<=12,'Grass should be a few clear clumps, not dozens of random flecks');
assert(dirt.length<=10,'Dirt should have a calm surface');
assert(stone.length<=16,'Stone pathway should remain simple and readable');
for(const [x,y] of [[13,23],[14,23]])assert.equal(map[y][x],2,'Chapter 1 wild meadow must remain');
for(const [x,y] of [[5,5],[14,5],[27,5],[6,17],[22,17]])assert.equal(map[y][x],8,'House entrance must remain visible and walkable');
assert.equal(village.paintTile(1,{},0,0,1,1,0,()=>{}),false);
let buildingDraws=0;
village.draw({save(){},restore(){},fillText(){},fillStyle:'',font:''},0,0,0,()=>buildingDraws++);
assert(buildingDraws>100,'House facades, roofs, town decorations must be drawn');
console.log('PASS Wurzelheim visual pixel palette, quiet surfaces, five doors, story grass and built house details');
