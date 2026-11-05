'use strict';
// Check actual production enemy decision helper, with deterministic enemy/player states.
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),ctx={window:{}};
for(const file of ['data/species.js','data/affinities.js','data/skills.js'])
  vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const {window}=ctx,AI=window.EchoSkillbook.ENEMY_AI,ST=window.EchoSkillbook.STATUS;
const AFF=window.EchoTypes,SPECIES=window.ECHO_SPECIES;
assert(AI,'production smart enemy AI must be exported');
const attacks={...window.EchoSkillbook.ATTACKS,
  heilflimmern:{name:'Heilflimmern',power:0,heal:24,type:'LICHT'},
  lichtfunke:{name:'Lichtfunke',power:26,type:'LICHT'},
  feuerwirbel:{name:'Feuerwirbel',power:49,type:'FLAMME'},
  schwung:{name:'Schwung',power:49,type:'FLAMME'},
  wasserstoß:{name:'Wasserstoß',power:41,type:'WASSER'}
};
const beast=(id=1,lv=15,hp=110)=>({id,lv,maxHp:110,hp,equippedMoves:['pfotenstups','kreiswirbel']});
function decide(enemy,ally,prepared,battle={enemyHealUsed:false},random=()=>1){
 return AI.choose({battle,enemy,ally,prepared,attacks,aff:AFF,species:SPECIES,random});
}
{
 const enemy=beast(1,15,22),ally=beast(1,15,110);
 ally.equippedMoves=['pfotenstups','kreiswirbel'];
 assert.equal(decide(enemy,ally,['heilflimmern','lichtfunke']).id,'heilflimmern',
   'when seriously wounded, recover enough HP to survive the next expected hit');
 enemy.hp=enemy.maxHp;
 assert.notEqual(decide(enemy,ally,['heilflimmern','lichtfunke']).id,'heilflimmern',
   'never heal at full HP');
 enemy.hp=22;
 assert.notEqual(decide(enemy,ally,['heilflimmern','lichtfunke'],{enemyHealUsed:true}).id,
   'heilflimmern','never heal twice in the same enemy turn sequence');
 ally.hp=2;
 assert.notEqual(decide(enemy,ally,['heilflimmern','lichtfunke']).id,'heilflimmern',
   'prefer an immediate KO over wasting the turn healing');
}
{
 const enemy=beast(95,15),ally=beast(23,15);
 assert.equal(decide(enemy,ally,['schwung','wasserstoß']).id,'wasserstoß',
   'water vs fire type advantage is better than larger neutral raw power');
}
{
 const enemy=beast(23,15),ally=beast(27,15);
 // Both moves have same power/type; available burn should break the tie.
 assert.equal(decide(enemy,ally,['schwung','feuerwirbel']).id,'feuerwirbel',
   'apply burn when it offers extra future value');
 const battle={effects:[{monster:ally,status:{burn:2}}]};
 assert.equal(decide(enemy,ally,['schwung','feuerwirbel'],battle).id,'schwung',
   'do not waste status bonus when enemy is already burning');
}
{
 const enemy=beast(36,15,45),ally=beast(23,15);
 assert.equal(decide(enemy,ally,['kristallgrat','eisspiegel']).id,'eisspiegel',
   'choose defensive guard when it helps survive the next hit');
 const battle={effects:[{monster:enemy,status:{guard:1}}]};
 assert.equal(decide(enemy,ally,['kristallgrat','eisspiegel'],battle).id,'kristallgrat',
   'do not overvalue guard while it is already active');
}
const rookie=beast(1,5,22),rookieAlly=beast(1,5,110);
assert.notEqual(decide(rookie,rookieAlly,['heilflimmern','lichtfunke'],{enemyHealUsed:false}).id,
  'heilflimmern','intro opponents should use simple attacks rather than recovery tactics');
assert.equal(ST.rules.feuerwirbel.kind,'burn');
assert(AI.estimate(beast(23),beast(27),attacks.feuerwirbel,AFF,SPECIES,{})>0);
console.log('ENEMY_AI_DECISIONS_PASS heal, no-waste, lethal, type, status, guard');
