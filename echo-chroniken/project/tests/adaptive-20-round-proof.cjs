'use strict';
// Summary-level proof without replaying 2 million simulation rounds on CI.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../../docs/visual-audit/adaptive-balance');
const data=JSON.parse(fs.readFileSync(path.join(root,'summary.json'),'utf8'));
const initial=JSON.parse(fs.readFileSync(path.join(root,'starting-stats.json'),'utf8'));
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/species.js'),'utf8'),ctx);
const species=ctx.window.ECHO_SPECIES;
assert.equal(data.rounds,20);
assert.equal(data.fights,2000000);
assert.equal(data.timeouts,0);
assert.equal(data.wins+data.losses,2000000);
assert.equal(data.roundResults.length,20);
assert.equal(initial.length,150);
assert.equal(species.length,150);
assert.equal(new Set(data.roundResults.map(r=>r.fingerprint)).size,20,'independent seeded rounds');
assert.deepEqual(data.roundResults.map(r=>r.round),Array.from({length:20},(_,i)=>i+1));
let changes=0;
for(const r of data.roundResults){
 assert.equal(r.fights,100000);
 assert.equal(r.timeouts,0);
 assert.equal(r.wins+r.losses,100000);
 assert.match(r.fingerprint,/^[a-f0-9]{64}$/);
 assert(r.adjustments.length<=12);
 changes+=r.adjustments.length;
}
assert.equal(changes,data.adjustmentActions);
let modified=0;
for(let i=0;i<150;i++){
 const s=species[i],x=initial[i];
 assert.equal(s.id,x.id);
 assert.equal(s.name,x.name);
 assert.equal(s.stage,x.stage);
 if([1,2,3].includes(s.id)){
  assert.deepEqual([s.hp,s.atk,s.def],[x.hp,x.atk,x.def],'protected story species unchanged');
 }
 assert(s.hp>=Math.max(10,Math.ceil(x.hp*.88))&&s.hp<=Math.floor(x.hp*1.15),'HP clamp '+s.name);
 assert(s.atk>=x.atk-3&&s.atk<=x.atk+3,'attack clamp '+s.name);
 assert(s.def>=x.def-3&&s.def<=x.def+3,'defense clamp '+s.name);
 if(s.hp!==x.hp||s.atk!==x.atk||s.def!==x.def)modified++;
}
assert.equal(modified,data.speciesAdjusted);
const hold=JSON.parse(fs.readFileSync(path.join(root,'holdout-comparison.json'),'utf8'));
assert.equal(hold.fightsEach,100000);
assert.equal(hold.beforeTimeouts,0);
assert.equal(hold.afterTimeouts,0);
console.log('ADAPTIVE_20_PROOF_PASS',JSON.stringify({rounds:20,fights:2000000,adjustments:changes,speciesChanged:modified,holdoutDelta:hold.gapChangePoints}));
