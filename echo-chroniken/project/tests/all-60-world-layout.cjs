'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
for(const file of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js',
 'src/maps/chapter5.js','src/maps/story-regions.js','src/maps/story-endgame.js',
 'src/maps/story-finale.js','src/maps/postgame.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx,{filename:file});
const r=window.EchoMaps,modules=[window.EchoChapter3,window.EchoChapter4,window.EchoChapter5,
 window.EchoStoryRegions,window.EchoEndgame,window.EchoFinale,window.EchoPostgame];
const legacy=Array.from({length:28},()=>Array(36).fill(0));
r.registerLegacy(legacy);
modules.forEach(mod=>{assert.equal(mod.register(legacy),true,mod.constructor?.name)});
assert.equal(r.validateNetwork(),true);
assert.equal(r.list().length,60);
const solid=new Set([1,4,5,7]);
let expanded=0,protectedCount=0,regionsChecked=0,exitsChecked=0,spawnsChecked=0,
 markersChecked=0,perimeterLength=0,shortestForward=1e9;
const paths=[];
function walk(m,start){
 const seen=Array.from({length:m.height},()=>Array(m.width).fill(-1));
 if(solid.has(m.tiles[start.y][start.x]))return seen;
 const queue=[start];seen[start.y][start.x]=0;
 for(let h=0;h<queue.length;h++){
  const p=queue[h];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const x=p.x+dx,y=p.y+dy;
   if(x<0||x>=m.width||y<0||y>=m.height||seen[y][x]>=0||solid.has(m.tiles[y][x]))continue;
   seen[y][x]=seen[p.y][p.x]+1;queue.push({x,y});
  }
 }
 return seen;
}
for(const id of r.list()){
 const m=r.get(id),spawns=Object.values(m.spawns);
 assert(spawns.length>0,id+' has no spawns');
 if(id==='legacy_wurzeldorf'||id==='lake_north_path'||id==='nebelhafen_town'){
   assert.equal(m.worldLayout,null,id+' manually-authored region should be protected');
   protectedCount++;
 }else{
   expanded++;
   assert(m.worldLayout?.expanded,id+' was not expanded');
   assert(m.width>=m.worldLayout.sourceWidth+22,id+' too narrow');
   assert(m.height>=m.worldLayout.sourceHeight+13,id+' too short');
 }
 const dist=walk(m,spawns[0]);
 for(const p of spawns){
   assert(dist[p.y]?.[p.x]>=0,id+' disconnected spawn '+JSON.stringify(p));
   spawnsChecked++;
 }
 for(const e of m.exits){
   assert(dist[e.y]?.[e.x]>=0,id+' inaccessible exit '+e.exitId+': '+JSON.stringify(e));
   assert.equal(r.getExitAt(id,e.x,e.y)?.exitId,e.exitId,id+' exit lookup missing');
   exitsChecked++;
 }
 const markers=modules.flatMap(x=>x?.markers?.[id]||[]);
 for(const mark of markers){
   assert(mark.x>=0&&mark.y>=0&&mark.x<m.width&&mark.y<m.height,id+' off-map marker');
   const approachable=[[0,0],[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>
     dist[mark.y+dy]?.[mark.x+dx]>=0);
   assert(approachable,id+' stranded '+mark.type+' '+mark.x+','+mark.y);
   markersChecked++;
 }
 const cells=dist.flat().filter(x=>x>=0).length;
 assert(cells>=Math.floor(m.width*m.height*.22),id+' not enough playable space '+cells);
 const east=m.exits.find(e=>e.x>=m.width-4),west=m.exits.find(e=>e.x<=2);
 if(east&&west){
   const from=walk(m,{x:west.x,y:west.y}),distance=from[east.y][east.x];
   assert(distance>=32,id+' remains a 20-step corridor ('+distance+')');
   shortestForward=Math.min(shortestForward,distance);
   perimeterLength+=distance;
 }
 paths.push({id,width:m.width,height:m.height,reachable:cells,exits:m.exits.length,
   markers:markers.length,expanded:!!m.worldLayout,kind:m.worldLayout?.kind||'manual'});
 regionsChecked++;
}
assert.equal(protectedCount,3);
assert.equal(expanded,57,'Need 57 auto expansions + hand-curated village = 58 remaining');
assert.equal(regionsChecked,60);
const report={registered:regionsChecked,improvedThisPass:expanded+1,
  proceduralExpanded:expanded,villagePathsRevised:true,
  alreadyCompleted:protectedCount-1,exitsChecked,spawnsChecked,markersChecked,
  shortestWestEast:shortestForward,regions:paths};
const out=path.resolve(__dirname,'../../docs/visual-audit/world-redesign/all60-layout-report.json');
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log('ALL_60_MAPS_LAYOUT_PASS '+JSON.stringify({
 total:regionsChecked,improvedThisPass:expanded+1,expanded,protectedCount,
 exitsChecked,spawnsChecked,markersChecked,shortestWestEast:shortestForward
}));
