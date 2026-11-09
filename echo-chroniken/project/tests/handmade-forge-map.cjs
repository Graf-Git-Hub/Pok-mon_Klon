'use strict';
/* First hand-authored RPG map: collidable room art and real chapter-6 narrative. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const context={window:{},Math,console};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
  'src/maps/chapter5.js','src/maps/story-regions.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
const w=context.window,r=w.EchoMaps;
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);
[w.EchoChapter3,w.EchoChapter4,w.EchoChapter5,w.EchoStoryRegions].forEach(m=>m.register(legacy));
assert.equal(r.validateNetwork(),true);
const m=r.get('glut_forge'),solid=new Set([1,4,5,7]);
assert.equal(m.width,45);assert.equal(m.height,30);
assert.equal(m.worldLayout?.handDrawn,true);
assert.equal(m.worldLayout?.artAsset,'assets/maps/glut_forge_v1.png');
const img=path.resolve('assets/maps/glut_forge_v1.png');
assert(fs.existsSync(img),'Forge PNG must be generated and committed');
const bytes=fs.readFileSync(img);assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
assert.equal(bytes.readUInt32BE(16),720);assert.equal(bytes.readUInt32BE(20),480);
for(const [x,y] of [[34,9],[37,12],[23,17],[6,23],[39,22]])
 assert(solid.has(m.tiles[y][x]),'Visible furniture must block character '+x+','+y);
const points=[
 ...Object.entries(m.spawns).map(([name,p])=>({...p,name})),
 ...m.exits.map(p=>({...p,name:p.exitId})),
 ...w.EchoStoryRegions.markers.glut_forge.map(p=>({...p,name:p.type}))
];
const start=m.spawns.from_town,seen=new Set([start.x+','+start.y]),queue=[start];
for(let i=0;i<queue.length;i++){
 const a=queue[i];
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=a.x+dx,y=a.y+dy,key=x+','+y;
  if(x<0||x>=m.width||y<0||y>=m.height||seen.has(key)||solid.has(m.tiles[y][x]))continue;
  seen.add(key);queue.push({x,y});
 }
}
for(const p of points){
 const reachable=[[0,0],[0,1],[1,0],[0,-1],[-1,0]]
  .some(([dx,dy])=>seen.has((p.x+dx)+','+(p.y+dy)));
 assert(reachable,'Forge character cannot approach '+p.name+' at '+p.x+','+p.y);
}
assert(points.length>=12,'Expected 8 story markers, two exits and two spawns');
console.log('FORGE_HANDMADE_PASS',JSON.stringify({
 size:m.width+'x'+m.height,landmarks:m.worldLayout.authoredObjectCount,
 markers:w.EchoStoryRegions.markers.glut_forge.length,
 gates:m.exits.length,reachable:seen.size,pngBytes:bytes.length
}));
