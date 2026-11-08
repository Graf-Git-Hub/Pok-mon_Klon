/* Echo-Chroniken: future multi-map registry and additive save migration.
   36x28 legacy game and room scene states are not replaced. */
(() => {
'use strict';
const LEGACY='legacy_wurzeldorf',VERSION=2,
 SAVE_KEY='echo_chroniken_tv_save',BACKUP_KEY='echo_chroniken_tv_save_before_maps_v2';
const maps=new Map(), blocked=new Set([1,4,5,7]);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);

// World layout pass (2026-11-07): every later story region gets a genuine
// walkable extension and meaningful connecting paths, but the initial quest
// structures, actor locations, map IDs and portal identifiers are preserved.
// Wurzelheim is a separately hand-authored map; Chapter-3's lakeside and
// harbor were expanded manually and deliberately remain untouched here.
const MAPS_ALREADY_CURATED=new Set([LEGACY,'lake_north_path','nebelhafen_town']);
const mapHash=(x,y,seed=0)=>{
 let h=Math.imul(x+41,1103515245)^Math.imul(y+97,122949829)^seed;
 h=Math.imul(h^(h>>>15),2246822519);
 return ((h^(h>>>13))>>>0)/4294967296;
};
function mapLayoutKind(id){
 if(/meadow|garden|grove|road|approach|ridge|bog|ashrail|shaft_entry|echo_garden|lake/.test(id))
   return 'nature';
 if(/town|city|capital|homes|epilogue|annex/.test(id))
   return 'town';
 return 'interior';
}
function remapMapPoint(p,sourceWidth,sourceHeight,width,height){
 const dx=width-sourceWidth,dy=height-sourceHeight;
 let x=p.x,y=p.y;
 // Existing left entrances stay where their original roads begin.
 if(y<=3 && x>3 && x<sourceWidth-4)
   x+=Math.floor(dx*.65);
 else if(y>=sourceHeight-4){
   y+=dy;
   if(x>3&&x<sourceWidth-4)x+=Math.floor(dx*.27);
 }else if(x>=sourceWidth-4)
   x+=dx;
 return {...p,x,y};
}
function expandRealRegion(spec){
 if(MAPS_ALREADY_CURATED.has(spec.mapId)||spec.tiles.length<10||spec.tiles[0].length<12)
   return spec; // Small test fixtures and the three hand-curated maps stay exact.
 const sourceHeight=spec.tiles.length,sourceWidth=spec.tiles[0].length;
 const extraWidth=Math.max(22,Math.ceil(sourceWidth*.7));
 const extraHeight=Math.max(13,Math.ceil(sourceHeight*.6));
 const width=sourceWidth+extraWidth,height=sourceHeight+extraHeight;
 const kind=mapLayoutKind(spec.mapId);
 const seed=[...spec.mapId].reduce((n,ch)=>Math.imul(n,31)+ch.charCodeAt(0)|0,17);
 const tiles=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>{
   if(x<sourceWidth&&y<sourceHeight)return spec.tiles[y][x];
   if(x===0||y===0||x===width-1||y===height-1)return 1;
   const a=mapHash(Math.floor(x/4),Math.floor(y/4),seed);
   const detail=mapHash(x,y,seed);
   if(kind==='interior'){
     // The new workshop/rail/ruin wing is divided into corridors and side
     // rooms, not a giant empty rectangle. Opening routes are carved below.
     if(x>=sourceWidth+3&&(x-sourceWidth)%11===0&&y%9<=6)return 1;
     if(y>=sourceHeight+3&&(y-sourceHeight)%9===0&&x%12<=8)return 1;
     if(a<.13 && x%10>=3 && x%10<=5 && y%8>=2 && y%8<=4)return 5;
     return 3;
   }
   if(a<.17 && x%8>=2 && x%8<=5 && y%7>=2 && y%7<=4)return 1;
   if(kind==='nature'&&a>.83&&detail<.65)return 2;
   return detail<.14?2:0;
  }));
  // The old edge is no longer an outer border. Keep a wall with doorways in
  // enclosed buildings, but merge forest/town ground into the new landscape.
  // Without this, every village had an absurd 19-tile vertical wall halfway
  // across the enlarged terrain.
  if(kind!=='interior'){
    for(let y=1;y<sourceHeight-1;y++)
      if(spec.tiles[y][sourceWidth-1]===1)
        tiles[y][sourceWidth-1]=mapHash(1,Math.floor(y/4),seed)<.22?1:
          (kind==='town'&&mapHash(3,Math.floor(y/4),seed)>.53?3:0);
    for(let x=1;x<sourceWidth-1;x++)
      if(spec.tiles[sourceHeight-1][x]===1)
        tiles[sourceHeight-1][x]=mapHash(Math.floor(x/4),1,seed)<.22?1:
          (kind==='town'&&mapHash(Math.floor(x/4),3,seed)>.53?3:0);
  }
  // Only work on newly opened sections or at the original edges, so puzzle
  // walls, existing doors, quest landmarks and decorative houses remain intact.
 const stamp=(x,y,r=1)=>{
   for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){
     if(xx<=0||yy<=0||xx>=width-1||yy>=height-1)continue;
     if(xx>=sourceWidth-3||yy>=sourceHeight-3)
       tiles[yy][xx]=3;
   }
 };
 const path=(a,b,r=1)=>{
   let x=a.x,y=a.y;
   stamp(x,y,r);
   while(x!==b.x){x+=Math.sign(b.x-x);stamp(x,y,r);}
   while(y!==b.y){y+=Math.sign(b.y-y);stamp(x,y,r);}
 };
 const move=p=>remapMapPoint(p,sourceWidth,sourceHeight,width,height);
 const spawns=Object.fromEntries(Object.entries(spec.spawns||{}).map(([key,p])=>[key,move(p)]));
 const exits=(spec.exits||[]).map(e=>move(e));
 const all=[
   ...Object.values(spec.spawns||{}).map((p,i)=>({old:p,next:Object.values(spawns)[i]})),
   ...(spec.exits||[]).map((p,i)=>({old:p,next:exits[i]}))
 ];
 // Every moved entrance/exit gets a winding 3-tile trail. The old game area
 // is retained verbatim except at the doorway/seam where the extension joins.
 for(const {old,next} of all){
   if(old.x===next.x&&old.y===next.y)continue;
   if(old.y<=3 && old.x>3 && old.x<sourceWidth-4){
     path({x:old.x,y:3},{x:next.x,y:3});
     path({x:next.x,y:3},next);
   }else if(old.y>=sourceHeight-4){
     const bend={x:old.x,y:sourceHeight+4};
     path({x:old.x,y:sourceHeight-3},bend);
     path(bend,{x:next.x,y:sourceHeight+4});
     path({x:next.x,y:sourceHeight+4},next);
   }else if(old.x>=sourceWidth-4){
     const junction={x:sourceWidth+5,y:old.y};
     path({x:sourceWidth-3,y:old.y},junction);
     const offset=((seed>>>4)%5)-2;
     const sideways=Math.max(4,Math.min(height-5,old.y+offset+4));
     path(junction,{x:sourceWidth+5,y:sideways});
     path({x:sourceWidth+5,y:sideways},{x:width-6,y:sideways});
     path({x:width-6,y:sideways},next);
   }
   stamp(next.x,next.y,1);
 }
 // A secondary, walkable exploration loop reaches the backwoods / workshop
 // wing and circles back towards the established part of the old map.
 const x0=Math.max(5,Math.floor(sourceWidth*.57));
 const first={x:x0,y:sourceHeight-3};
 const ring=[
   first,{x:x0,y:sourceHeight+4},
   {x:sourceWidth+5,y:sourceHeight+4},
   {x:sourceWidth+5,y:height-5},
   {x:width-5,y:height-5},
   {x:width-5,y:Math.max(5,Math.floor(sourceHeight*.45))}
 ];
 for(let i=1;i<ring.length;i++)path(ring[i-1],ring[i],1);
 const loopX=Math.max(5,Math.floor(sourceWidth*.38));
 path({x:loopX,y:sourceHeight-3},{x:loopX,y:height-5});
 path({x:loopX,y:height-5},{x:width-5,y:height-5});
 // Scenery that reads as purposeful groups rather than random isolated tiles:
 // a narrow waterline for wet biomes, a little plaza in towns, workshop rooms.
 const houses=[];
 if(kind==='town'){
   const px=sourceWidth+7,py=sourceHeight+4;
   for(let y=py-3;y<=py+3;y++)for(let x=px-4;x<=px+4;x++)
     if(x>0&&y>0&&x<width-1&&y<height-1)tiles[y][x]=3;
   // Two readable three-tile building lots with door approaches and streets
   // connecting them to the new plaza. Their solids match the house artwork.
   const sites=[[width-12,4],[sourceWidth+6,sourceHeight+6]];
   for(const [x,y] of sites){
     path({x:x+1,y:y+3},{x:x+1,y:Math.min(height-4,y+5)});
     for(let yy=y;yy<y+3;yy++)for(let xx=x;xx<x+3;xx++)
       if(xx>0&&yy>0&&xx<width-1&&yy<height-1)tiles[yy][xx]=5;
     for(let xx=x;xx<x+3;xx++)for(let yy=y+3;yy<=Math.min(height-2,y+4);yy++)
       tiles[yy][xx]=3;
     houses.push({x,y});
   }
   path({x:width-11,y:9},{x:width-11,y:sourceHeight+4});
   path({x:sourceWidth+7,y:sourceHeight+9},{x:sourceWidth+7,y:sourceHeight+4});
 }else if(kind==='interior'){
   for(const [x,y] of [[sourceWidth+8,sourceHeight+6],[width-11,sourceHeight+6]])
     for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-2;xx<=x+2;xx++)
       if(xx>0&&xx<width-1&&yy>0&&yy<height-1&&
          Math.abs(xx-x)===2)tiles[yy][xx]=5;
   for(let i=0;i<ring.length-1;i++)path(ring[i],ring[i+1],1);
 }
 // Ensure every portal and safe spawn itself remains walkable after scenery.
 for(const p of [...Object.values(spawns),...exits])
   if(p.x>=0&&p.x<width&&p.y>=0&&p.y<height)tiles[p.y][p.x]=3;
 return {...spec,tiles,spawns,exits,
   worldLayout:{sourceWidth,sourceHeight,expanded:true,kind,houses}};
}

// World-design pass V2: replace the mechanically repeated extension rectangles.
// Keep the original story/puzzle footprint and the original portal IDs intact.
function designExpandedRegion(spec){
 const L=spec.worldLayout;
 if(!L?.expanded)return spec;
 const {sourceWidth:sw,sourceHeight:sh,kind}=L;
 const {width:w,height:h}= {width:spec.tiles[0].length,height:spec.tiles.length};
 const t=spec.tiles, id=spec.mapId;
 const seed=[...id].reduce((v,c)=>(Math.imul(v,37)+c.charCodeAt(0))|0,13);
 const rnd=(x,y,n=0)=>mapHash(x,y,seed+n*313);
 const extra=(x,y)=>x>=sw||y>=sh;
 const allowed=(x,y)=>x>0&&y>0&&x<w-1&&y<h-1&&extra(x,y);
 const mark=(x,y,value)=>{if(allowed(x,y))t[y][x]=value;};
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 // Natural edges, coherent material. No 3-pixel dice speckling.
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(extra(x,y))
  t[y][x]=kind==='interior'?8:kind==='town'?0:0;
 const biome=/frost|ice|ridge|cavern/.test(id)?'frost':
  /moor|bog|lake|water|port|harbor|shaft|pump/.test(id)?'wet':
  /ash|forge|glut|smelt/.test(id)?'ash':
  /garden|grove|meadow|wood|forest/.test(id)?'grove':'open';
 // Clusters represent forest slopes / geological ledges, not accidental debris.
 if(kind==='nature'){
  const centers=[
   [sw+Math.floor((w-sw)*.37),4,5,3],
   [w-8,Math.floor(sh*.55),5,4],
   [Math.floor(sw*.44),h-7,6,3],
   [w-8,h-8,4,4]
  ];
  for(let i=0;i<centers.length;i++){
   const [cx,cy,rx,ry]=centers[i];
   for(let y=cy-ry-2;y<=cy+ry+2;y++)for(let x=cx-rx-2;x<=cx+rx+2;x++){
    if(!allowed(x,y))continue;
    const d=((x-cx)/rx)**2+((y-cy)/ry)**2;
    const wiggle=(rnd(x>>1,y>>1,i)-.5)*.32;
    if(d<.72+wiggle)mark(x,y,1);
    else if(d<1.28+wiggle&&t[y][x]===0)mark(x,y,2);
   }
  }
  if(biome==='wet'){
   const cx=w-11,cy=Math.min(h-10,Math.max(7,Math.floor(sh*.45)));
   for(let y=cy-4;y<=cy+4;y++)for(let x=cx-7;x<=cx+7;x++){
    const d=((x-cx)/7)**2+((y-cy)/4)**2;
    if(d<.72)mark(x,y,4);
    else if(d<1.1)mark(x,y,8);
   }
  }
  if(biome==='grove'){
   for(let cy=sh+5;cy<h-4;cy+=7)for(let cx=5;cx<w-5;cx+=10){
    for(let y=cy-2;y<=cy+1;y++)for(let x=cx-3;x<=cx+2;x++){
     if(allowed(x,y)&&rnd(cx,cy)<.75&&t[y][x]===0)mark(x,y,2);
    }
   }
  }
 }else if(kind==='interior'){
  // Clearly composed connected chambers with pillars, not an endless grid.
  const rooms=[
   {x:sw+3,y:3,w:11,h:8},
   {x:Math.max(sw+5,w-16),y:sh+3,w:12,h:9},
   {x:Math.max(5,Math.floor(sw*.33)),y:sh+4,w:11,h:8}
  ];
  for(const room of rooms){
   const {x:x0,y:y0,w:rw,h:rh}=room;
   for(let y=y0;y<Math.min(h-2,y0+rh);y++)for(let x=x0;x<Math.min(w-2,x0+rw);x++){
    if(!allowed(x,y))continue;
    const edge=x===x0||x===x0+rw-1||y===y0||y===y0+rh-1;
    mark(x,y,edge?1:3);
   }
   const doorX=clamp(x0+Math.floor(rw/2),1,w-2);
   for(let dy=-1;dy<=1;dy++)mark(doorX,y0+rh-1+dy,3);
   // Two fixed feature pedestals either side of the room axis.
   for(const dx of [-3,3])mark(doorX+dx,y0+2,5);
  }
  // An inner court: different large floor materials rather than checkerboards.
  for(let y=sh+2;y<h-4;y++)for(let x=sw+2;x<w-4;x++){
   if(t[y][x]!==8)continue;
   if(x>sw+6&&x<sw+14&&y>sh+5&&y<sh+11)mark(x,y,3);
  }
 }else{
  // Settlements are districts: a plaza, two existing houses and ordered gardens.
  const cx=sw+6,cy=sh+3;
  for(let y=cy-3;y<=cy+3;y++)for(let x=cx-5;x<=cx+5;x++){
   if(!allowed(x,y))continue;
   const d=((x-cx)/6)**2+((y-cy)/4)**2;
   if(d<1.0)mark(x,y,8);
  }
  for(const [cx2,cy2] of [[sw+3,5],[Math.floor(sw*.53),sh+6]]){
   for(let y=cy2;y<cy2+3;y++)for(let x=cx2;x<cx2+7;x++){
    if(allowed(x,y)&&t[y][x]===0)mark(x,y,9);
   }
  }
 }
 // Reconnect preserved original world and all moved exits/spawns.
 // The master route has intentional bends rather than six identical rectangles.
 const nodes=[{x:sw-2,y:Math.floor(sh*.52)},{x:Math.floor(sw*.56),y:sh-2},
  ...Object.values(spec.spawns),...spec.exits].filter(p=>p?.x>=0&&p?.y>=0);
 const hub={x:sw+5,y:sh+4};
 const lay=(x,y,r=1)=>{
  for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
   const xx=x+dx,yy=y+dy;
   if(allowed(xx,yy))t[yy][xx]=3;
  }
 };
 const link=(a,b,r=1)=>{
  // 90-degree bends are broken into short shallow diagonal ramps.
  const mid={x:clamp(Math.floor((a.x+b.x)/2+Math.sin(seed)*2),2,w-3),
             y:clamp(Math.floor((a.y+b.y)/2+Math.cos(seed)*2),2,h-3)};
  const segments=[[a,mid],[mid,b]];
  for(const [p,q] of segments){
   let x=p.x,y=p.y;lay(x,y,r);
   while(x!==q.x||y!==q.y){
    if(x!==q.x)x+=Math.sign(q.x-x);
    if(y!==q.y&&Math.abs(q.y-y)>=Math.abs(q.x-x))y+=Math.sign(q.y-y);
    lay(x,y,r);
   }
  }
 };
 for(const p of nodes)link(p,hub,1);
 // Two sidepaths are purposeful loops, not a repetitive perimeter motorway.
 link(hub,{x:w-7,y:sh+4},1);
 link(hub,{x:sw+6,y:h-6},1);
 link({x:w-7,y:sh+4},{x:w-7,y:h-6},0);
 link({x:sw+6,y:h-6},{x:w-7,y:h-6},0);
 // Original 3x3 shop footprints remain exactly paired with their live artwork.
 if(kind==='town')for(const house of L.houses){
  for(let yy=house.y;yy<house.y+3;yy++)for(let xx=house.x;xx<house.x+3;xx++)
   mark(xx,yy,5);
  for(let dy=0;dy<=2;dy++)for(let dx=-1;dx<=1;dx++)
   mark(house.x+1+dx,house.y+3+dy,3);
 }
 // Avoid disconnected portals/softlocked spawns. Do not move any of them.
 for(const p of nodes)if(allowed(p.x,p.y))t[p.y][p.x]=3;
 L.designVersion=2;L.biome=biome;L.districtHub=hub;
 return spec;
}
function paintWorldSurface(map,x,y,sx,sy,pix){
 const L=map.worldLayout;
 if(!L?.designVersion)return false;
 const tile=map.tiles[y]?.[x];
 if(![0,3,8,9].includes(tile))return false;
 const biome=L.biome,kind=L.kind;
 const sets={
  grove:['#7cab82','#c6b18d','#a98d70','#90b98e'],
  wet:['#75a49b','#c8bc9c','#a8a18a','#84b0a2'],
  frost:['#abcbd1','#d6e5de','#96aebe','#c5dfe1'],
  ash:['#a28a76','#c9a789','#836d68','#b9a18d'],
  open:['#8cb29a','#d0ba94','#aa9984','#a0baa5']
 };
 const a=sets[biome]||sets.open;
 const inner=kind==='interior';
 const city=kind==='town';
 const bg=inner?(tile===3?'#adb1b0':tile===8?'#7e9096':'#9aafb0'):
   city?(tile===3?'#c1b39e':tile===8?'#b7a78f':tile===9?'#789985':'#91ae9b'):
   tile===3?a[1]:tile===8?a[2]:tile===9?a[3]:a[0];
 pix(sx,sy,16,16,bg);
 const varied=mapHash(Math.floor(x/3),Math.floor(y/3),String(map.mapId).length*41);
 if(tile===3){
  // Wide recognizable paving slabs, short joints, no random checkerboard.
  pix(sx+1,sy+2,14,1,inner?'#d4d1c7':'#ead7b6');
  pix(sx+2,sy+12,12,1,inner?'#7c8b90':'#ad9981');
  if((x+y)%3===0)pix(sx+10,sy+3,1,8,inner?'#88999c':'#b49c82');
 }else if(tile===8){
  if(varied>.55)pix(sx+3,sy+7,5,2,inner?'#a4adae':'#c5b296');
 }else if(!inner && !city && varied>.64){
  pix(sx+4,sy+8,2,3,biome==='frost'?'#dceeed':'#659b78');
  pix(sx+9,sy+11,3,1,biome==='frost'?'#d7e9e7':'#afd0a3');
 }
 return true;
}

function register(spec){
 if(!obj(spec)||typeof spec.mapId!=='string'||!/^[a-z][a-z0-9_]{2,63}$/.test(spec.mapId)||maps.has(spec.mapId))
  throw Error('Invalid or duplicate mapId');
 // Validate the source before the layout pass. Otherwise widening the map could
 // accidentally turn an invalid blocked spawn into a valid one.
 const sourceTiles=spec.tiles;
 if(!Array.isArray(sourceTiles)||!sourceTiles.length||!Array.isArray(sourceTiles[0])||
    !sourceTiles[0].length||sourceTiles.length>512||sourceTiles[0].length>512||
    !sourceTiles.every(row=>Array.isArray(row)&&row.length===sourceTiles[0].length))
   throw Error('Non-rectangular or oversized map');
 if(!obj(spec.spawns)||!Object.keys(spec.spawns).length)throw Error('Missing spawns');
 for(const [id,p] of Object.entries(spec.spawns))
   if(!obj(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||
      p.y<0||p.y>=sourceTiles.length||p.x<0||p.x>=sourceTiles[0].length||
      blocked.has(sourceTiles[p.y][p.x]))throw Error('Invalid safe spawn: '+id);
 spec=designExpandedRegion(expandRealRegion(spec));
 const tiles=spec.tiles;
 if(!Array.isArray(tiles)||!tiles.length||!Array.isArray(tiles[0])||!tiles[0].length||
    tiles.length>512||tiles[0].length>512||!tiles.every(r=>Array.isArray(r)&&r.length===tiles[0].length))
  throw Error('Non-rectangular or oversized map');
 const spawns=spec.spawns||{},exits=spec.exits||[];
 if(!obj(spawns)||!Object.keys(spawns).length||!Array.isArray(exits))throw Error('Missing spawns or exits');
 for(const [id,p] of Object.entries(spawns))
  if(!obj(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||
     p.y<0||p.y>=tiles.length||p.x<0||p.x>=tiles[0].length||blocked.has(tiles[p.y][p.x]))
    throw Error('Invalid safe spawn: '+id);
 const seen=new Set();
 for(const e of exits){
  if(!obj(e)||typeof e.exitId!=='string'||seen.has(e.exitId)||
     typeof e.toMapId!=='string'||typeof e.toSpawnId!=='string'||typeof e.returnExitId!=='string')
   throw Error('Invalid map exit');
  seen.add(e.exitId);
 }
 const map={mapId:spec.mapId,tiles,spawns,exits,width:tiles[0].length,height:tiles.length,
   worldLayout:spec.worldLayout||null};
 maps.set(spec.mapId,map);return map;
}
function registerLegacy(tiles){
 if(maps.has(LEGACY))return maps.get(LEGACY);
 return register({mapId:LEGACY,tiles,spawns:{village_safe:{x:5,y:6}},exits:[]});
}
function addSpawn(mapId,id,p){
 const m=maps.get(mapId);
 if(!m||typeof id!=='string'||!id||m.spawns[id]||
   !obj(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||
   p.x<0||p.x>=m.width||p.y<0||p.y>=m.height||
   blocked.has(m.tiles[p.y][p.x]))throw Error('Invalid new map spawn');
 const q=m.worldLayout?remapMapPoint(p,m.worldLayout.sourceWidth,m.worldLayout.sourceHeight,m.width,m.height):p;
 if(blocked.has(m.tiles[q.y]?.[q.x]))m.tiles[q.y][q.x]=3;
 m.spawns[id]={x:q.x,y:q.y};return true;
}
function addExit(mapId,e){
 const m=maps.get(mapId);
 if(!m||!obj(e)||typeof e.exitId!=='string'||!e.exitId||
    m.exits.some(x=>x.exitId===e.exitId)||
    !Number.isInteger(e.x)||!Number.isInteger(e.y)||
    e.x<0||e.x>=m.width||e.y<0||e.y>=m.height||
    blocked.has(m.tiles[e.y][e.x])||
    typeof e.toMapId!=='string'||typeof e.toSpawnId!=='string'||
    typeof e.returnExitId!=='string')throw Error('Invalid new exit');
 const q=m.worldLayout?remapMapPoint(e,m.worldLayout.sourceWidth,m.worldLayout.sourceHeight,m.width,m.height):e;
 if(blocked.has(m.tiles[q.y]?.[q.x]))m.tiles[q.y][q.x]=3;
 m.exits.push({...q});return true;
}
function getExitAt(mapId,x,y){
 const m=maps.get(mapId);
 return m?.exits.find(e=>e.x===x&&e.y===y)||null;
}
function validateNetwork(){
 for(const m of maps.values())for(const e of m.exits){
   const to=maps.get(e.toMapId), back=to?.exits.find(b=>
     b.exitId===e.returnExitId&&b.toMapId===m.mapId&&
     b.returnExitId===e.exitId&&m.spawns[b.toSpawnId]);
   if(!to||!to.spawns[e.toSpawnId]||!back||!Number.isInteger(e.x)||
      !Number.isInteger(e.y)||blocked.has(m.tiles[e.y]?.[e.x]))
     throw Error('Disconnected or unsafe portal '+m.mapId+':'+e.exitId);
 }
 return true;
}
function migrateSave(save){
 if(!obj(save))throw Error('Invalid save object');
 if(Number(save.saveSchemaVersion||0)>VERSION)throw Error('Save is newer than this app');
 const next={...save},valid=typeof next.currentMapId==='string'&&maps.has(next.currentMapId);
 if(!valid){
  const unknown=typeof next.currentMapId==='string'&&next.currentMapId!==LEGACY;
  next.currentMapId=LEGACY;
  next.safeSpawnId='legacy_current_position';
  if(unknown){
   next.scene='OVERWORLD';next.player={...(obj(next.player)?next.player:{}),x:5,y:6,dir:'down',stepPhase:0};
   next.roomId=null;
  }
 }else if(typeof next.safeSpawnId!=='string'||!next.safeSpawnId){
  next.safeSpawnId='legacy_current_position';
 }
 next.saveSchemaVersion=VERSION;
 return next;
}
function backupLegacy(storage,raw,parsed){
 if(!storage||!raw||!obj(parsed)||Number(parsed.saveSchemaVersion||0)>=VERSION)return false;
 try{
  if(!storage.getItem(BACKUP_KEY))storage.setItem(BACKUP_KEY,raw);
  return true;
 }catch(e){console.warn('Save backup not possible',e);return false;}
}
function flagEnabled(state,flag){
 if(!flag||flag==='always')return true;
 if(typeof flag!=='string')return false;
 let value=state;
 for(const part of flag.split('.')){
  if(!obj(value)||!Object.prototype.hasOwnProperty.call(value,part))return false;
  value=value[part];
 }
 return value===true;
}
function travel(state,exitId){
 if(!obj(state))return false;
 const from=maps.get(state.currentMapId||LEGACY);
 if(!from)return false;
 const edge=from.exits.find(x=>x.exitId===exitId);
 if(!edge||!flagEnabled(state,edge.requiredFlag))return false;
 const to=maps.get(edge.toMapId);
 if(!to||!obj(to.spawns[edge.toSpawnId]))return false;
 const back=to.exits.find(x=>x.exitId===edge.returnExitId&&x.toMapId===from.mapId&&from.spawns[x.toSpawnId]);
 if(!back)return false;
 const spawn=to.spawns[edge.toSpawnId];
 // Commit only after every precondition, ensuring no partial teleport or softlock.
 state.currentMapId=to.mapId;state.safeSpawnId=edge.toSpawnId;
 state.player={...(obj(state.player)?state.player:{}),x:spawn.x,y:spawn.y,stepPhase:0};
 state.scene='OVERWORLD';return true;
}
window.EchoMaps=Object.freeze({LEGACY,VERSION,SAVE_KEY,BACKUP_KEY,
 register,registerLegacy,addSpawn,addExit,getExitAt,validateNetwork,
 get:id=>maps.get(id)||null,has:id=>maps.has(id),
 paintWorldSurface,migrateSave,backupLegacy,travel,list:()=>Array.from(maps.keys())});
})();
