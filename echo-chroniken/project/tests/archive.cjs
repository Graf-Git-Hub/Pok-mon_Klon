const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={};vm.runInNewContext(fs.readFileSync('src/archive.js','utf8'),{window});
const a=window.EchoArchive;
const old={team:[{id:1,lv:5,hp:20,maxHp:34}],caughtIds:{1:true},saveSchemaVersion:2};
assert.equal(a.ensure(old).length,0,'Legacy saves gain empty archive without losing team');
assert.equal(old.saveSchemaVersion,2);
for(let id=2;id<=10;id++){
 const monster={id,lv:8+id,hp:12,maxHp:25,moves:[0],xp:0};
 old.caughtIds[id]=true;
 a.capture(old,monster);
}
assert.equal(old.team.length,6,'Team must remain capped at six');
assert.equal(old.archive.length,4,'Every extra captured monster must be stored');
assert.deepEqual(Array.from(old.archive,m=>m.id),[7,8,9,10]);
assert.equal(a.exchange(old,2,0),true);
assert.equal(old.team[0].id,9);
assert.equal(old.archive[2].id,1,'Original starter must not be discarded');
assert.equal(a.exchange(old,-1,0),false);
assert.equal(a.exchange(old,999,0),false);
assert.equal(a.exchange(old,0,99),false);
const saved=JSON.parse(JSON.stringify(old));
assert.equal(saved.saveSchemaVersion,2);
assert.equal(saved.archive.length,4);
assert.equal(saved.archive[2].id,1);
assert.equal(saved.team[0].id,9);
assert.equal(Object.keys(saved.caughtIds).length,10);
assert.equal(a.exchange(saved,2,0),true);
assert.equal(saved.team[0].id,1,'Archived starter can return to team');
assert.equal(saved.archive[2].id,9);
const empty={team:[],archive:[]};
assert.equal(a.exchange(empty,0,0),false,'Cannot swap into an empty party');
// Long collection session: duplicate species remain distinct individual monsters.
let collection={team:[],archive:[]};
for(let i=0;i<3000;i++)a.capture(collection,{id:i%150+1,serial:i,hp:i%40+1,lv:20,moves:[0]});
for(let i=0;i<10000;i++){
 assert(a.exchange(collection,i%2994,i%6));
 if(i%100===0)collection=JSON.parse(JSON.stringify(collection));
}
const all=[...collection.team,...collection.archive];
assert.equal(collection.team.length,6);
assert.equal(collection.archive.length,2994);
assert.equal(new Set(all.map(m=>m.serial)).size,3000,'No individual lost or duplicated over 10k swaps and 100 reloads');
for(const m of all)assert.equal(m.hp,m.serial%40+1,'Swaps preserve individual HP');
console.log('PASS Archive: overflow, starter retrieval, invalid indices, 3000 individuals, 10000 swaps and 100 JSON reloads');
