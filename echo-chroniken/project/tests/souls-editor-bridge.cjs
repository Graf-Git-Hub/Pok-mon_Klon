// Full SOULS 3.46 map-project roundtrip and real Echo map-collision safeguards.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),
      path=require('node:path'),os=require('node:os'),cp=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
const manifest=require('../tools/souls-bridge/original-maps.json');
const workshop=JSON.parse(fs.readFileSync('../docs/souls-editor/EchoChroniken_SOULS_Pilot_Wurzelheim.json','utf8'));
const initial=JSON.parse(fs.readFileSync('../docs/souls-editor/EchoChroniken_SOULS_Alle_60_Maps.json','utf8'));
assert.equal(workshop.format,'SOULS_PROJECT_V7');
assert.equal(workshop.version,8);
assert.equal(Object.keys(workshop.maps).length,60);
assert.equal(Object.keys(initial.maps).length,60);
assert.equal(Object.keys(manifest.regions).length,60);
// New editor houses must be full graphic facades, not 75 brown wall rectangles.
const homeObjects=workshop.maps.legacy_wurzeldorf.objects;
const homes=[{x:3,y:2},{x:12,y:2},{x:25,y:2},{x:4,y:14},{x:20,y:14}];
const houseTiles=homeObjects.filter(o=>o.id.startsWith('bh_'));
assert.equal(houseTiles.length,75,'Each of five 5x3 houses must have exactly 15 art parts');
assert.equal(houseTiles.filter(o=>o.id.includes('_roof')).length,25,'Roof has five visible tiles per house');
assert.equal(houseTiles.filter(o=>o.id.includes('_door_')).length,5,'Each house needs its own visible door');
assert.equal(houseTiles.filter(o=>o.id.includes('_window_')).length,10,'Each facade needs two windows');
assert.equal(houseTiles.filter(o=>o.id==='bh_home_wall_braun').length,0,'No brown placeholder tiles remain');
for(const h of homes)for(let dy=0;dy<3;dy++)for(let dx=0;dx<5;dx++){
 const a=houseTiles.filter(o=>o.x===h.x+dx&&o.y===h.y+dy);
 assert.equal(a.length,1,'Exactly one house art part per building coordinate');
}
for(const [id,source] of Object.entries(manifest.regions)){
 const m=workshop.maps[id];
 assert(m,id+' must exist in the editor');
 assert.equal(m.w,source.w);assert.equal(m.h,source.h);
 assert.equal(m.ground.length,source.h);
 assert(m.ground.every(row=>row.length===source.w));
 assert.equal(m.doorLinks.length,source.exits.length);
}
const editsSandbox={window:{},console};
vm.runInNewContext(fs.readFileSync('data/echo-souls-edits.js','utf8'),editsSandbox);
vm.runInNewContext(fs.readFileSync('src/maps/souls-bridge.js','utf8'),editsSandbox);
const lib=editsSandbox.window.EchoSOULS;
const village=manifest.regions.legacy_wurzeldorf,live=village.tiles.map(r=>r.slice());
const before=JSON.stringify(live),originalSource=village.tiles;
assert.equal(lib.apply('legacy_wurzeldorf',live).applied,editsSandbox.window.EchoSoulsEditedData.regions.legacy_wurzeldorf.changes.length);
assert.equal(live[21][15],3);
assert.equal(live[23][13],2,'Original wild meadow must survive');
assert.equal(live[23][14],2,'Original wild meadow must survive');
assert.equal(live[22][20],9);
assert.equal(lib.apply('legacy_wurzeldorf',live).applied,0,'Must be idempotent');
for(const [x,y] of village.protected)
 assert.equal(live[y][x],originalSource[y][x],'Quest/building/save location changed');
for(const [id,source] of Object.entries(manifest.regions)){
 const current=source.tiles.map(row=>row.slice());
 lib.apply(id,current);
 if(id!=='legacy_wurzeldorf')
  assert.equal(JSON.stringify(current),JSON.stringify(source.tiles),'Other map modified: '+id);
}
const pixels=[];
lib.renderProps('legacy_wurzeldorf',0,270,(...args)=>pixels.push(args));
assert(pixels.length>10,'Decoration sprites not drawn');
const count=pixels.length;
lib.foreground('legacy_wurzeldorf',live,20,22,0,0,(...args)=>pixels.push(args));
assert(pixels.length>count,'Walk-in-grass foreground must render');
lib.foreground('legacy_wurzeldorf',live,13,22,0,0,(...args)=>pixels.push(args));
assert.equal(pixels.length-count,12,'Plain path must not render grass foreground');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'echo-souls-invalid-'));
try{
 const bad=structuredClone(workshop);
 bad.maps.legacy_wurzeldorf.ground[6][5]='water'; // protected save spawn
 const badfile=path.join(tmp,'bad.json');fs.writeFileSync(badfile,JSON.stringify(bad));
 const convert=path.resolve('tools/souls-bridge/convert.cjs');
 let r=cp.spawnSync(process.execPath,[convert,'import',badfile,'legacy_wurzeldorf'],
   {encoding:'utf8'});
 assert.notEqual(r.status,0,'Must reject edits to protected quest/save locations');
 assert.match(r.stderr,/protected/);
 const wrong=structuredClone(workshop);
 wrong.maps.legacy_wurzeldorf.doorLinks.pop();
 fs.writeFileSync(badfile,JSON.stringify(wrong));
 r=cp.spawnSync(process.execPath,[convert,'import',badfile,'legacy_wurzeldorf'],{encoding:'utf8'});
 assert.notEqual(r.status,0,'Must reject deleted story exits');
 assert.match(r.stderr,/door/i);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
assert.notEqual(JSON.stringify(live),before,'Real map must change');
console.log('SOULS_ECHO_BRIDGE_PASS 60 editable maps, verified safe live changes, 2 decorations, overlay, no save/quest edits, invalid maps rejected');
