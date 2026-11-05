'use strict';
// Exhaustively examine all 12x12 type interactions and all 150 species,
// status probabilities, turn duration, type aliases and stacked safeguards.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const window={};const env={window,Math};const root=path.join(__dirname,'..');
for(const name of ['data/species.js','data/affinities.js','data/skills.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,name),'utf8'),env);
const S=window.ECHO_SPECIES,A=window.EchoTypes,K=window.EchoSkillbook,ST=K.STATUS;
const TYPES=Object.keys(A.INFO);
assert.equal(S.length,150);assert.equal(TYPES.length,12);
assert.equal(Object.keys(K.ATTACKS).length,40,'new skillbook holds 40 attacks; game engine merges 26 legacy attacks');
let pairs=0,creatureCells=0,advantages=0,disadvantages=0,dual=0;
for(const attackerType of TYPES)for(const defenderType of TYPES){
 const n=A.effectiveness(attackerType,[defenderType]);
 assert(Number.isFinite(n)&&n>=.45&&n<=2.25,attackerType+' '+defenderType);
 const expected=A.STRONG[attackerType]?.includes(defenderType)?1.5:
   A.WEAK[attackerType]?.includes(defenderType)?.65:1;
 assert.equal(n,expected,attackerType+' vs '+defenderType);
 pairs++;
}
for(const defender of S){
 assert(defender.affinities.length>=1&&defender.affinities.length<=2);
 for(const type of TYPES){
  const eff=A.effectiveness(type,defender);
  assert(Number.isFinite(eff)&&eff>=.45&&eff<=2.25,defender.name);
  creatureCells++;if(eff>1.05)advantages++;if(eff<.95)disadvantages++;
 }
 if(defender.affinities.length===2)dual++;
}
for(const type of TYPES)for(const sub of TYPES){
 if(type===sub)continue;
 const expected=A.effectiveness(type,[type,sub]);
 assert(expected>=.45&&expected<=2.25);
}
assert.equal(A.normalize('FLUT'),'WASSER');
assert.equal(A.normalize('WURZEL'),'NATUR');
assert.equal(A.normalize('AETHER'),'GEIST');
assert(dual>80,'majority of species should have combined types');
const beast=(hp=100)=>({hp,maxHp:100});
let statusChecks=0,statusBoundaryFailures=0;
for(const [id,rule] of Object.entries(ST.rules)){
 const a=beast(),b=beast(),fight={};
 const fails=ST.apply(fight,a,b,id,()=>rule.chance);
 assert.equal(fails,'','probability must exclude exact chance boundary '+id);
 const success=ST.apply(fight,a,b,id,()=>Math.max(0,rule.chance-0.000001));
 assert.equal(success,rule.label,id);
 const recipient=rule.self?a:b;
 const other=rule.self?b:a;
 assert(ST.labels(fight,recipient).length>0,id);
 assert(!ST.labels(fight,other),'status must affect only correct side '+id);
 ST.apply(fight,a,b,id,()=>0);
 assert(ST.state(fight,recipient)[rule.kind]===rule.turns,'no duration stacking '+id);
 assert(!ST.labels({},recipient),'combat state must not leak '+id);
 statusChecks++;
}
{
 const f={},fire=beast(),grass=beast(2);
 ST.apply(f,fire,grass,'kohlenregen',()=>0);
 ST.endAction(f,grass);assert.equal(grass.hp,1,'burn must not kill at 2 HP');
 ST.endAction(f,grass);assert.equal(grass.hp,1);
 ST.endAction(f,grass);assert.equal(ST.labels(f,grass),'');
}
{
 const f={},defender=beast(),attacker=beast();
 ST.apply(f,defender,attacker,'steinmantel',()=>0);
 assert.equal(ST.adjustedDamage(f,attacker,defender,100),65);
 assert.equal(ST.adjustedDamage(f,attacker,defender,100),100,'one-hit shield only');
 ST.apply(f,attacker,defender,'winterkrone',()=>0);
 assert.equal(ST.adjustedDamage(f,defender,attacker,100),80);
 ST.endAction(f,defender);assert.equal(ST.adjustedDamage(f,defender,attacker,100),80);
 ST.endAction(f,defender);assert.equal(ST.adjustedDamage(f,defender,attacker,100),100);
}
{
 const f={},healer=beast(97),other=beast();
 ST.apply(f,healer,other,'waldsegen',()=>0);
 ST.endAction(f,healer);ST.endAction(f,healer);
 assert.equal(healer.hp,100,'regen capped at max HP');
}
let randomState=0x5EEDBEEF,activationSamples=0;
function seededRoll(){randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;}
const activationRates={};
for(const [id,rule] of Object.entries(ST.rules)){
 const fight={},attacker=beast(),defender=beast();let hits=0;
 for(let i=0;i<8000;i++)if(ST.apply(fight,attacker,defender,id,seededRoll))hits++;
 const measured=hits/8000;
 assert(Math.abs(measured-rule.chance)<.02,'activation rate drift '+id);
 activationRates[id]=+(measured*100).toFixed(2);
 activationSamples+=8000;
}
const out={activationSamples,activationRates,typePairCells:pairs,speciesTypeCells:creatureCells,dualTypeSpecies:dual,
 favourableCells:advantages,unfavourableCells:disadvantages,statusRules:statusChecks,
 allStatusThresholdsChecked:true,burnCannotKO:true,shieldOneHit:true,
 weakeningExpires:true,regenMaxHp:true};
console.log('TARGETED_TYPE_STATUS_PASS '+JSON.stringify(out));
