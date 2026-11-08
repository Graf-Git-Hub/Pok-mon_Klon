#!/usr/bin/env node
'use strict';
// Safe SOULS 3.46 -> Echo-Chroniken map converter.
// Generates *only diffs*, never replaces quest coordinates, storyline,
// exits, existing saves, or sprites that the game already draws.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ROOT=path.resolve(__dirname,'../..');
const MANIFEST=path.join(__dirname,'original-maps.json');
const SOURCE=path.resolve(ROOT,'../docs/souls-editor/EchoChroniken_SOULS_Alle_60_Maps.json');
const PILOT=path.resolve(ROOT,'../docs/souls-editor/EchoChroniken_SOULS_Pilot_Wurzelheim.json');
const OUTPUT=path.resolve(ROOT,'data/echo-souls-edits.js');
const GROUND={grass:0,grass2:9,darkgrass:2,tallgrass:2,
              dirt:8,path:3,stone:3,water:4,sand:8,flowers:9,
              marsh:2,cave:3,ri_void:1};
const OBJECT_TILE={tree:1,tree_large:1,pine:1,rock:1,boulder:1,
  caveentry:7,sign:6};
const BLOCKED=new Set([1,4,5,7]),DECOR=new Set(['lamp','smallflowers','bushflowers','flowers_box','shrub','stones',
   'barrel','sign','fenceH','fenceV']);
function parse(file){return JSON.parse(fs.readFileSync(file,'utf8'))}
function deepCopy(x){return JSON.parse(JSON.stringify(x))}
function fail(s){throw Error('SOULS Bridge: '+s)}
function createPilot(){
 const project=parse(SOURCE),base=parse(MANIFEST).regions.legacy_wurzeldorf;
 const map=project.maps.legacy_wurzeldorf;
 assert(map&&map.w===36&&map.h===28);
 const protectedTiles=new Set(base.protected.map(x=>x.join(',')));
 const pathCells=[[15,20],[15,21],[16,21],[17,21],[15,22],[17,22]];
 const planted=[[18,23],[19,23],[20,22]];
 for(const [x,y] of pathCells){
   if(protectedTiles.has(x+','+y))fail('Pilot path attempts a quest cell');
   if([1,4,5,6,7].includes(base.tiles[y][x]))fail('Pilot path attempts a solid/quest tile');
   map.ground[y][x]='path';
 }
 for(const [x,y] of planted){
   if(protectedTiles.has(x+','+y))fail('Pilot plants in a quest cell');
   if([1,4,5,6,7].includes(base.tiles[y][x]))fail('Pilot plant attempts a building');
   map.ground[y][x]='grass2';
 }
 // Replace the 75 identical brown rectangles with real 16px house pieces
 // provided by the SOULS 3.46 editor. The existing footprints and entry
 // coordinates are absolutely unchanged: art parts, not new gameplay objects.
 const housePlans=[
   {x:3,y:2,type:'home',roof:'rot',wall:'gelb'},       // Oma
   {x:12,y:2,type:'home',roof:'gruen',wall:'gelb'},    // Kräuterhaus
   {x:25,y:2,type:'home',roof:'blau',wall:'grau'},     // Haus am See
   {x:4,y:14,type:'smith',roof:'rot',wall:'braun'},    // Werkstatt
   {x:20,y:14,type:'shop',roof:'blau',wall:'gelb'}     // Dorfladen
 ];
 for(const h of housePlans)for(let dy=0;dy<3;dy++)for(let dx=0;dx<5;dx++){
   const x=h.x+dx,y=h.y+dy;
   const found=map.objects.filter(o=>o.x===x&&o.y===y&&o.id==='bh_home_wall_braun');
   if(found.length!==1)fail('Expected one original building cell at '+x+','+y);
   let part='wall',color=h.wall;
   if(dy===0){part=dx===0?'roofL':dx===4?'roofR':'roofM';color=h.roof}
   else if(dx===0)part='wallL';
   else if(dx===4)part='wallR';
   else if(dy===2&&dx===2)part='door';
   else if(dy===1&&(dx===1||dx===3))part='window';
   found[0].id='bh_'+h.type+'_'+part+'_'+color;
 }
 // A signpost and small flower patch live *above* the walkable tile.
 for(const entry of [
   {id:'lamp',x:16,y:23},{id:'smallflowers',x:20,y:23}
 ]){
   if(protectedTiles.has(entry.x+','+entry.y))fail('Pilot decoration overlaps protected zone');
   map.objects.push(entry);
 }
 Object.assign(project,{activeMapId:'legacy_wurzeldorf',
   ground:map.ground,objects:map.objects,bridges:map.bridges,
   cellRules:map.cellRules,doorLinks:map.doorLinks});
 fs.writeFileSync(PILOT,JSON.stringify(project));
 console.log('SOULS_PILOT_CREATED '+PILOT+' paths='+pathCells.length+' plants='+planted.length);
 return PILOT;
}
function bfs(tiles,start){
 const w=tiles[0].length,h=tiles.length;
 const visited=new Uint8Array(w*h),queue=[start];
 if(BLOCKED.has(tiles[start.y]?.[start.x]))return visited;
 visited[start.y*w+start.x]=1;
 for(let i=0;i<queue.length;i++){
   const {x,y}=queue[i];
   for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
     const nx=x+dx,ny=y+dy;
     if(nx<0||ny<0||nx>=w||ny>=h||visited[ny*w+nx]||BLOCKED.has(tiles[ny][nx]))continue;
     visited[ny*w+nx]=1;queue.push({x:nx,y:ny});
   }
 }
 return visited;
}
function makeEdits(file,selected=null,outfile=OUTPUT){
 const project=parse(file),bases=parse(MANIFEST).regions;
 if(project.format!=='SOULS_PROJECT_V7'||!project.maps||typeof project.maps!=='object')
   fail('Not a SOULS V7 project');
 const regions={};let totalCells=0,totalProps=0,checked=0;
 for(const [id,edited] of Object.entries(project.maps)){
   if(selected&&id!==selected)continue;
   const original=bases[id];
   if(!original)fail('Unknown Echo map '+id);
   checked++;
   const {w,h}=original;
   if(edited.w!==w||edited.h!==h)fail(id+': map dimensions changed. Resize requires new portal migration.');
   if(!Array.isArray(edited.ground)||edited.ground.length!==h||!edited.ground.every(row=>row.length===w))
     fail(id+': ground dimensions invalid');
   const originalLinks=original.exits;
   if(!Array.isArray(edited.doorLinks)||edited.doorLinks.length!==originalLinks.length)
     fail(id+': missing/extra story doors');
   for(const e of originalLinks){
     const link=edited.doorLinks.find(l=>l.echoExitId===e.exitId||l.worldRoute===e.exitId);
     if(!link||link.x!==e.x||link.y!==e.y||link.toMapId!==e.toMapId)
       fail(id+': story door moved/rewired: '+e.exitId);
   }
   const objects=Array.isArray(edited.objects)?edited.objects:[];
   const baseCounts=new Map();
   function key(o){return o.id+'@'+o.x+','+o.y}
   for(const o of original.objects)baseCounts.set(key(o),(baseCounts.get(key(o))||0)+1);
   const added=[];
   const objectsByCell=new Map();
   for(const o of objects){
     if(!o||typeof o.id!=='string'||!Number.isInteger(o.x)||!Number.isInteger(o.y)||
       o.x<0||o.y<0||o.x>=w||o.y>=h)fail(id+': invalid object');
     const k=key(o),old=baseCounts.get(k)||0;
     if(old)baseCounts.set(k,old-1);
     else if(DECOR.has(o.id))added.push({id:o.id,x:o.x,y:o.y});
     const cell=o.x+','+o.y;
     if(!objectsByCell.has(cell))objectsByCell.set(cell,[]);
     objectsByCell.get(cell).push(o.id);
   }
   const protectedCoords=new Set(original.protected.map(v=>v.join(',')));
   const changes=[];
   const tiles=original.tiles.map(row=>row.slice());
   for(let y=0;y<h;y++)for(let x=0;x<w;x++){
     const g=edited.ground[y][x],base=original.tiles[y][x];
     if(!Object.hasOwn(GROUND,g))fail(id+': unsupported terrain '+g+' at '+x+','+y);
     const ids=objectsByCell.get(x+','+y)||[];
     let next=GROUND[g];
     if(ids.some(v=>v.startsWith('bh_')))
       next=5;
     for(const obj of ids)if(Object.hasOwn(OBJECT_TILE,obj))next=OBJECT_TILE[obj];
     const rule=edited.cellRules?.[y]?.[x];
     if(rule==='x')next=1;
     if(rule==='o'&&BLOCKED.has(next))next=0;
     if(next===base)continue;
     if(protectedCoords.has(x+','+y))
       fail(id+': edit would damage protected quest/door/building at '+x+','+y);
     changes.push([x,y,base,next]);tiles[y][x]=next;
   }
   for(const obj of added){
     if(protectedCoords.has(obj.x+','+obj.y))
       fail(id+': decoration overlaps protected quest/door at '+obj.x+','+obj.y);
   }
   if(changes.length){
     const safe=Object.values(original.spawns)[0];
     const seen=bfs(tiles,safe);
     const destinations=[...Object.values(original.spawns),...original.exits,
       ...original.markers];
     for(const p of destinations)if(!seen[p.y*w+p.x])
       fail(id+': path to quest/portal blocked at '+p.x+','+p.y);
   }
   if(changes.length||added.length){
     regions[id]={w,h,changes,props:added};
     totalCells+=changes.length;totalProps+=added.length;
   }
 }
 if(!checked)fail('Selected map not found in SOULS project: '+selected);
 const data={schema:1,format:'ECHO_SOULS_DIFF_V1',source:'SOULS V7/8 editor',
             regions};
 fs.writeFileSync(outfile,'/* Generated from real SOULS editor; safe tile diffs only. */\n'+
   'window.EchoSoulsEditedData='+JSON.stringify(data)+';\n','utf8');
 console.log('SOULS_ECHO_IMPORT_PASS checked='+checked+' modified='+Object.keys(regions).length+
   ' cells='+totalCells+' decorations='+totalProps);
 return data;
}
const command=process.argv[2];
if(command==='pilot'){const f=createPilot();makeEdits(f,'legacy_wurzeldorf')}
else if(command==='import'){
 const file=process.argv[3];if(!file)fail('Usage: convert.cjs import project.json [mapId]');
 makeEdits(path.resolve(file),process.argv[4]||null);
}else fail('Usage: convert.cjs pilot | import <SOULS-project.json> [mapId]');
