'use strict';
// An intentionally small reusable GB kit, not 60 generated unique graphic styles.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const kit=path.join(root,'assets','gb-classic');
const atlas=fs.readFileSync(path.join(kit,'gb_classic_atlas.png'));
const meta=JSON.parse(fs.readFileSync(path.join(kit,'tile_manifest.json'),'utf8'));
const data=JSON.parse(fs.readFileSync(path.join(kit,'scene_maps.json'),'utf8'));
assert.equal(meta.tileSize,16);
assert.equal(meta.palette.length,4,'Exactly 4 grayscale colors');
assert.deepEqual(meta.palette,['#f4f4ef','#c7c8c4','#777a7b','#24262b']);
assert.equal(Object.keys(meta.sprites).length,39,'Stable tileset, no exploding sprite inventory');
assert.equal(atlas.toString('hex',0,8),'89504e470d0a1a0a');
assert.equal(atlas.readUInt32BE(16),128);assert.equal(atlas.readUInt32BE(20),80);
assert.equal(Object.keys(data.scenes).length,7);
const dims={Wurzelheim:[20,18],Route:[20,18],Laden:[12,9],Heilstation:[14,9],
 Schmiede:[12,9],Teamtausch:[12,9],Wohnhaus:[10,8]};
const required={
 Wurzelheim:['tree','roof_l','roof_r','door','fence'],
 Route:['tree','grass','fence','sign'],
 Laden:['bookshelf','counter','door'],
 Heilstation:['heal_pod','counter','door'],
 Schmiede:['forge','anvil','workbench','door'],
 Teamtausch:['computer','capsule','door'],
 Wohnhaus:['bed','table','door']
};
for(const [name,map] of Object.entries(data.scenes)){
 assert.deepEqual([map.width,map.height],dims[name]);
 assert.equal(map.rows.length,map.height);
 assert(map.rows.every(row=>row.length===map.width));
 const names=map.rows.flatMap(row=>[...row]).map(ch=>data.symbols[ch]);
 assert(names.every(Boolean));
 for(const obj of required[name])assert(names.includes(obj),name+' lacks '+obj);
 assert(names.includes('player'),name+' needs a safe player start');
 const y=map.rows.findIndex(row=>row.includes('y')),x=map.rows[y].indexOf('y');
 const blocked=new Set(map.blocked.map(([a,b])=>a+','+b));
 assert(!blocked.has(x+','+y),'Player starts in a solid: '+name);
 const seen=new Set([x+','+y]),queue=[[x,y]];
 for(let i=0;i<queue.length;i++){
  for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
   const nx=queue[i][0]+dx,ny=queue[i][1]+dy,key=nx+','+ny;
   if(nx<0||ny<0||nx>=map.width||ny>=map.height||
      blocked.has(key)||seen.has(key))continue;
   seen.add(key);queue.push([nx,ny]);
  }
 }
 assert(seen.size>=map.width*map.height*.3,'Too little walkable interior '+name);
 if(name!=='Route'){
  const ds=[];
  for(let iy=0;iy<map.height;iy++)for(let ix=0;ix<map.width;ix++)
   if(data.symbols[map.rows[iy][ix]]==='door')ds.push([ix,iy]);
  assert(ds.length>=1,'Missing service door '+name);
  assert(ds.some(([xx,yy])=>seen.has(xx+','+yy)),'Door unreachable '+name);
 }
}
const html=fs.readFileSync(path.resolve(root,'../docs/gb-classic/klassik-demo.html'),'utf8');
assert(html.includes('data:image/png;base64,')&&html.includes('ArrowUp')&&html.includes('data-move='));
console.log('GB_CLASSIC_KIT_PASS: 39 reusable four-tone tiles, 7 playable layouts, doors, collision and touch preview');
