// Guard rail: stronger two-member late bosses, but real parties with healing
// must still win reliably. Runs 4,800 actual-engine duels under five strategies.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
process.chdir(path.resolve(__dirname,'..'));
execFileSync(process.execPath,[path.resolve('tests/human-battle-stress.cjs')],{stdio:'ignore',timeout:120000});
const report=JSON.parse(fs.readFileSync(path.resolve('../docs/visual-audit/stress-testing/human-battle-report.json'),'utf8'));
assert.equal(report.executed,4800);
function segment(strategy,potions,members){
 const group=report.results.filter(r=>r.policy===strategy&&r.potions===potions&&r.members===members);
 assert.equal(group.length,4);
 return {wins:group.reduce((s,r)=>s+r.wins,0),attempts:group.reduce((s,r)=>s+r.attempts,0),
  pct:+(group.reduce((s,r)=>s+r.wins,0)/group.reduce((s,r)=>s+r.attempts,0)*100).toFixed(2)};
}
const duoNoHeal=segment('best',0,2),duoTwoPotions=segment('best',2,2),duoSix=segment('best',6,2);
const soloNoHeal=segment('best',0,1),duoWeak=segment('weakest',6,2);
assert(duoNoHeal.pct>=35&&duoNoHeal.pct<=85,
 'Two-member late bosses should challenge a resource-starved party, not guarantee a win');
assert(duoTwoPotions.pct>=95&&duoSix.pct>=95,
 'Players with a sensible heal plan must be able to win without extra grinding');
assert(soloNoHeal.pct>=90,
 'Do not punish the solo party for the duo difficulty adjustment');
assert(duoWeak.pct>=80,
 'Six potions and weaker attack choices should still usually finish');
console.log('ADAPTIVE_BOSS_BALANCE_PASS',JSON.stringify({fights:report.executed,duoNoHeal,duoTwoPotions,duoSix,soloNoHeal,duoWeak}));
