const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');process.chdir(root);
const window={};
vm.runInNewContext(fs.readFileSync('data/species.js','utf8'),{window});
const species=window.ECHO_SPECIES;
const manifest=JSON.parse(fs.readFileSync('../docs/game-design/MONSTER_NAME_REVIEW.json','utf8'));
const rows=manifest.reviewed;
assert.equal(species.length,150);
assert.equal(rows.length,50,'All 50 placeholders need a sprite review');
assert.equal(new Set(rows.map(r=>r.id)).size,50,'No repeated sprite IDs');
assert.equal(new Set(species.map(s=>s.name)).size,150,'All creatures have unique names');
for(let i=0;i<150;i++)assert.equal(species[i].id,i+1,'Stable original species IDs');
for(const [i,row] of rows.entries()){
 const s=species[row.id-1];
 assert.equal(row.oldName,'Spukwesen '+String(i+1).padStart(2,'0'));
 assert.equal(s.name,row.newName,'Atlas ID '+row.id+' must match reviewed name');
 assert.equal(s.family,row.newName,'No generic family labels remain');
 assert.equal(s.stage,1,'Reviewed single-stage creature remains base');
 assert.equal(s.stageCount,1,'No invented evolution for '+row.id);
 assert.equal(s.evolvesTo,null,'No species evolution changed');
 assert(s.name.length<=18,'Name must fit legacy lexicon font '+s.name);
 assert(row.visual.length>12,'Visual observation required for '+row.id);
}
assert.equal(species.filter(s=>s.name.startsWith('Spukwesen ')).length,0);
assert.equal(species.filter(s=>s.family.startsWith('Geistertier ')).length,0);
const atlasWindow={};
vm.runInNewContext(fs.readFileSync('assets/atlas.js','utf8'),{window:atlasWindow});
const url=atlasWindow.ECHO_ATLAS_DATA;
assert(url.startsWith('data:image/webp;base64,'));
const webp=Buffer.from(url.slice('data:image/webp;base64,'.length),'base64');
assert.equal(webp.toString('ascii',0,4),'RIFF');
assert.equal(webp.toString('ascii',8,12),'WEBP');
assert.equal(webp.toString('ascii',12,16),'VP8X');
const get24=off=>webp[off]|(webp[off+1]<<8)|(webp[off+2]<<16);
assert.equal(get24(24)+1,1280,'Ten columns of 128px sprites');
assert.equal(get24(27)+1,1920,'Fifteen rows of 128px sprites');
for(const page of ['01','02']){
 const file='../docs/visual-audit/monster-naming/placeholders-'+page+'.png';
 const png=fs.readFileSync(file);
 assert(png.length>10000&&png.subarray(1,4).toString()==='PNG','Audited sprite contact sheet');
}
console.log('PASS 50 reviewed monster names, original IDs/evolutions, unique labels, 150 sprite atlas cells');
