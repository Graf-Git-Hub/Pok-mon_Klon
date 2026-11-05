'use strict';
// Guards deliberately small stat changes against accidental reversion; IDs/save unchanged.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data/species.js'),'utf8'),ctx);
const rows=ctx.window.ECHO_SPECIES;assert.equal(rows.length,150);
const expected=new Map([
 [5,[46,20,19]],[6,[67,27,23]],[11,[47,19,18]],[12,[65,28,24]],
 [31,[76,30,26]],[34,[64,27,23]],[37,[47,20,19]],[56,[56,22,20]],
 [69,[76,32,27]],[136,[47,19,18]],[66,[49,19,17]]
]);
for(const [id,stats] of expected){
 const s=rows[id-1];assert.equal(s.id,id);
 assert.deepEqual([s.hp,s.atk,s.def],stats,'unexpected tuning for '+s.name);
}
assert.deepEqual([rows[0].hp,rows[0].atk,rows[0].def],[39,16,14],
  'Starter remains unchanged');
assert.deepEqual([rows[2].hp,rows[2].atk,rows[2].def],[82,29,27],
  'Story-related final evolution remains unchanged');
assert.equal(new Set(rows.map(s=>s.id)).size,150);
assert(rows.every(s=>s.hp>0&&s.atk>0&&s.def>0));
console.log('BALANCE_PASS_REGRESSION_OK',expected.size,'tuned species, 150 IDs unchanged');
