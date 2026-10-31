const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{},Math};vm.runInNewContext(fs.readFileSync('src/house.js','utf8'),ctx);
const house=ctx.window.EchoHouse;
let created=0,seen=[];
const showDialog=lines=>{seen=lines;};
const make=(id,lv)=>{created++;return {id,lv,hp:30,maxHp:30};};
const sfx={evolve(){}};
function initial(x,y,dir){return {player:{x,y,dir,stepPhase:0},introStage:1,hasStarter:false,team:[],caughtIds:{},seenIds:{}};}
for(const [x,y,dir] of [[11,5,'down'],[10,5,'left'],[12,5,'right'],[11,6,'down'],[9,4,'down'],[13,4,'up']]){
  const s=initial(x,y,dir);
  assert(house.nearParcel(s.player), 'reachable from '+x+','+y);
  house.talk(s,showDialog,make,sfx);
  assert.equal(s.introStage,2,'quest advances from '+x+','+y);
  assert.equal(s.hasStarter,true);
  assert.equal(s.team.length,1);
  assert.equal(s.caughtIds[1],true);
}
const far=initial(7,7,'up');
house.talk(far,showDialog,make,sfx);
assert.equal(far.introStage,1,'no remote parcel pickup');
assert.equal(far.team.length,0);
const before=initial(11,5,'down');before.introStage=0;
house.talk(before,showDialog,make,sfx);
assert.equal(before.introStage,0,'Oma must speak first');
assert.equal(before.team.length,0);
let prompt='';
const renderCtx={fillStyle:'',font:'',textAlign:'',fillRect(){},fillText(s){prompt+=String(s)+'|'},save(){},restore(){}};
house.render(renderCtx,100,initial(11,5,'down'),()=>{});
assert(prompt.includes('A: PAKET ÖFFNEN'),'visual interaction prompt missing');
console.log('PASS: 6 approach positions including screenshot, facing independent; quest/monster safe, distance and prompt');
