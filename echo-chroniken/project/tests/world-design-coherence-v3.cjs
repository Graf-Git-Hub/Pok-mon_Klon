'use strict';
// Prevent a return to 57 identical padded rectangles without checking every map.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={},ctx={window,console,Math};
for(const f of ['src/maps/registry.js','src/maps/chapter3.js','src/maps/chapter4.js','src/maps/chapter5.js',
 'src/maps/story-regions.js','src/maps/story-endgame.js','src/maps/story-finale.js','src/maps/postgame.js'])
 vm.runInNewContext(fs.readFileSync(f,'utf8'),ctx,{filename:f});
const mods=[window.EchoChapter3,window.EchoChapter4,window.EchoChapter5,
 window.EchoStoryRegions,window.EchoEndgame,window.EchoFinale,window.EchoPostgame];
const legacy=Array.from({length:28},()=>Array(36).fill(0));
window.EchoMaps.registerLegacy(legacy);mods.forEach(mod=>assert.equal(mod.register(legacy),true));
const maps=window.EchoMaps.list().map(id=>window.EchoMaps.get(id));
assert.equal(maps.length,60);
const variants=new Set(),meadowHashes=new Set();
const summary={expanded:0,biomes:{},layoutVariants:{},meadows:0,visualPaths:0};
for(const map of maps){
 const L=map.worldLayout;
 if(!L)continue;
 summary.expanded++;
 assert.equal(L.designVersion,3,'Unrevised world design: '+map.mapId);
 assert(Number.isInteger(L.featureVariant)&&L.featureVariant>=0&&L.featureVariant<6);
 variants.add(L.featureVariant);
 summary.biomes[L.biome]=(summary.biomes[L.biome]||0)+1;
 summary.layoutVariants[L.featureVariant]=(summary.layoutVariants[L.featureVariant]||0)+1;
 const {sourceWidth:sw,sourceHeight:sh}=L;
 let floor=0,road=0,solids=0;
 for(let y=1;y<map.height-1;y++)for(let x=1;x<map.width-1;x++){
  if(x<sw&&y<sh)continue;
  const t=map.tiles[y][x];
  if([0,8,9].includes(t))floor++;
  if(t===3)road++;
  if([1,5].includes(t))solids++;
 }
 assert(floor>=25,'No genuine landscaped/furnished grounds: '+map.mapId);
 assert(road>=24,'No clear traversable routes: '+map.mapId);
 assert(solids>=5,'No coherent obstacles/structures: '+map.mapId);
 const paint=[];
 const sx=10,sy=20;
 let painted=false;
 for(let y=1;y<map.height-1&&!painted;y++)for(let x=1;x<map.width-1&&!painted;x++){
   if(![0,3,8,9].includes(map.tiles[y][x]))continue;
   painted=window.EchoMaps.paintWorldSurface(map,x,y,sx,sy,(...args)=>paint.push(args));
 }
 assert(painted&&paint.length>0,'No visible surface treatment: '+map.mapId);
 assert(paint.every(([x,y,w,h])=>x>=sx&&y>=sy&&x+w<=sx+16&&y+h<=sy+16),
        'Surface pixels must stay inside their 16px tile: '+map.mapId);
 if(/postgame_meadow/.test(map.mapId)){
  summary.meadows++;
  meadowHashes.add(crypto.createHash('sha256').update(JSON.stringify(map.tiles)).digest('hex'));
 }
 summary.visualPaths+=road;
}
assert.equal(summary.expanded,57);
assert.equal(summary.meadows,6,'All six postgame meadows must be checked');
assert.equal(meadowHashes.size,6,'Six postgame maps cannot share the same terrain layout');
assert(variants.size>=5,'Maps reused too few composition variants');
assert(Object.keys(summary.biomes).length>=4,'Missing regional identities');
console.log('WORLD_DESIGN_COHERENCE_PASS '+JSON.stringify({...summary,distinctMeadowLayouts:meadowHashes.size}));
