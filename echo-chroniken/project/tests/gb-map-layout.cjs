'use strict';
// Town -> service rooms -> route, no visually misleading or blocked warps.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const project=path.resolve(__dirname,'..');
const {scenes,symbols}=JSON.parse(fs.readFileSync(path.join(project,'assets/gb-classic/scene_maps.json'),'utf8'));
function reach(map,x,y){
 const blocked=new Set(map.blocked.map(v=>v.join(',')));
 const seen=new Set([x+','+y]),q=[[x,y]];
 for(let i=0;i<q.length;i++){
  const [cx,cy]=q[i];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const xx=cx+dx,yy=cy+dy,key=xx+','+yy;
   if(xx<0||yy<0||xx>=map.width||yy>=map.height||blocked.has(key)||seen.has(key))continue;
   seen.add(key);q.push([xx,yy]);
  }
 }
 return seen;
}
const town=scenes.Wurzelheim,route=scenes.Route;
assert.deepEqual(Object.keys(town.doorLinks).sort(),['14,11','14,4','4,11','4,4']);
assert.deepEqual(Object.values(town.doorLinks).sort(),['Heilstation','Laden','Schmiede','Wohnhaus']);
assert.deepEqual(town.worldExits,{north:'Route',south:'Route'});
const get=(m,x,y)=>symbols[m.rows[y][x]];
const seen=reach(town,10,15);
for(const [coord,service] of Object.entries(town.doorLinks)){
 const [x,y]=coord.split(',').map(Number);
 assert.equal(get(town,x,y),'door','Not a visible door for '+service);
 for(let yy=y-2;yy<=y;yy++)for(let xx=x-2;xx<=x+2;xx++){
  assert(['roof_l','roof_m','roof_r','wall','window','door'].includes(get(town,xx,yy)), 'A building covers another tile at '+xx+','+yy);
 }
 assert(seen.has(coord),'Door cannot be reached: '+service);
 assert(seen.has(x+','+(y+1)),'No front step: '+service);
}
for(const [name,m] of [['Wurzelheim',town],['Route',route]]){
 const nav=reach(m,10,15);
 for(const x of [9,10])for(const y of [0,1,m.height-2,m.height-1]){
  assert.notEqual(get(m,x,y),'tree','Exit blocked at '+name+' '+x+','+y);
  assert(nav.has(x+','+y),'North/south passage blocked at '+name+' '+x+','+y);
 }
 const spine=[...Array(m.height)].map((_,y)=>get(m,9,y));
 assert(spine.every(t=>!['tree','fence','bush','water_a','roof_l'].includes(t)),
  'Main north/south line blocked in '+name);
}
assert.equal(get(town,11,8),'sign','Meeting-point sign missing');
assert.equal(get(town,16,12),'water_a','Town side pond missing');
assert.equal(get(route,13,9),'npc','Route NPC missing');
console.log('GB_MAP_LAYOUT_PASS: 4 linked village entrances, yards and aligned north/south world exits');
