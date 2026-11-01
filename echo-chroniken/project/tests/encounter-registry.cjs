const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const context={window:{},console,Math};
for(const file of ['data/species.js','data/encounters.js','src/encounters/registry.js'])
 vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
const species=context.window.ECHO_SPECIES,defs=context.window.ECHO_ENCOUNTER_TABLES,q=context.window.EchoEncounters;
assert.equal(species.length,150);
assert.equal(defs.length,3,'Only implemented playable maps may have wild tables');
assert.equal(q.initialize(species,defs),3);
assert.deepEqual(Array.from(q.list()),['legacy_wurzeldorf','lake_north_path','nebelhafen_town']);
assert.equal(q.has('nebelhafen_town'),true);
const harbor={low:3,cap:12,poolCap:150,stageCap:1,badges:0};
assert.deepEqual(Array.from(q.preview('lake_north_path',harbor,6),x=>x.id),[65,95,109,112]);
assert.equal(q.choose('lake_north_path',harbor,6,()=>0),65);
assert.equal(q.choose('lake_north_path',harbor,6,()=>.999),112);
const early={low:2,cap:4,poolCap:48,stageCap:1,badges:0};
const preview=q.preview('legacy_wurzeldorf',early,3);
const expected=Array.from(species.filter(s=>s.id!==1&&s.id<=48&&s.stage===1),s=>s.id);
assert.deepEqual(Array.from(preview,x=>x.id),expected,'Legacy first 48 must match pre-registry behavior exactly');
assert(Math.abs(preview.reduce((s,e)=>s+e.percent,0)-100)<1e-8);
assert.equal(q.choose('legacy_wurzeldorf',early,2,()=>0),expected[0]);
assert.equal(q.choose('legacy_wurzeldorf',early,4,()=>0.9999999),expected.at(-1));
assert.equal(q.choose('nonexistent_map',early,3,()=>0.5),null);
assert.equal(q.choose('legacy_wurzeldorf',early,17,()=>0.5),null);
assert.equal(q.choose('legacy_wurzeldorf',early,3,()=>0.5)===1,false);
assert.throws(()=>q.choose('legacy_wurzeldorf',early,3,()=>1),/RNG/);
assert.throws(()=>q.choose('legacy_wurzeldorf',early,3,()=>-1),/RNG/);
let counts=new Map();
for(let i=0;i<20000;i++){
 const id=q.choose('legacy_wurzeldorf',early,2+i%3,()=>((i*17)%20000)/20000);
 counts.set(id,(counts.get(id)||0)+1);
 assert(expected.includes(id),'No evolved or unregistered species in starter grass: '+id);
}
assert.equal(counts.size,expected.length);
const later={low:8,cap:15,poolCap:150,stageCap:3,badges:3};
const rich=q.preview('legacy_wurzeldorf',later,12);
assert.equal(rich.length,149,'Old badge-progressive roster includes 149 nonstarter species');
const floor=Array.from(species).filter(s=>s.stage===1).map(s=>s.id);
assert.equal(floor.includes(1),true);
assert.throws(()=>q.register({mapId:'bad_pool',mode:'weighted',entries:[{id:1,weight:100,minLevel:1,maxLevel:4}]}),/starter/);
assert.throws(()=>q.register({mapId:'bad_stage',mode:'weighted',entries:[{id:6,weight:100,minLevel:1,maxLevel:4}]}),/evolved/);
assert.throws(()=>q.register({mapId:'bad_weights',mode:'weighted',entries:[{id:5,weight:40,minLevel:2,maxLevel:4}]}),/100/);
assert.throws(()=>q.register({mapId:'bad_repeat',mode:'weighted',entries:[{id:5,weight:40,minLevel:2,maxLevel:4},{id:5,weight:60,minLevel:2,maxLevel:4}]}),/repeated/);
assert.throws(()=>q.register({mapId:'legacy_wurzeldorf',mode:'legacy-progressive'}),/duplicate/);
const weighted={mapId:'future_test_map',mode:'weighted',entries:[
 {id:5,weight:50,minLevel:3,maxLevel:7},
 {id:7,weight:30,minLevel:3,maxLevel:7},
 {id:23,weight:20,minLevel:5,maxLevel:10,minBadges:1}
]};
assert.equal(q.register(weighted),true);
assert.equal(q.has('future_test_map'),true);
assert.equal(q.choose('future_test_map',early,2,()=>0.1),null);
const mid={low:3,cap:8,poolCap:48,stageCap:1,badges:0};
assert.deepEqual(Array.from(q.preview('future_test_map',mid,4),x=>x.id),[5,7]);
assert.equal(q.choose('future_test_map',mid,4,()=>0.1),5);
assert.equal(q.choose('future_test_map',mid,4,()=>0.9),7);
const unlocked={low:3,cap:12,poolCap:150,stageCap:1,badges:1};
assert.deepEqual(Array.from(q.preview('future_test_map',unlocked,6),x=>x.id),[5,7,23]);
assert.equal(q.choose('future_test_map',unlocked,6,()=>0.91),23);
assert.deepEqual(Array.from(q.preview('future_test_map',unlocked,10),x=>x.id),[23]);
assert.equal(q.choose('future_test_map',unlocked,10,()=>0.5),23);
assert.equal(q.choose('future_test_map',unlocked,11,()=>0.5),null);
console.log('PASS: 150 validated species, existing 0-badge ID roster unchanged; unknown maps safe; 20k wild draws; weighted map badge/level gates and strict 100% tables');
