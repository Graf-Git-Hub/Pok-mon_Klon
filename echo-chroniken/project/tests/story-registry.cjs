const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const sandbox={window:{},console,Math};
for(const src of ['src/quests/registry.js','src/first-route.js','src/ruins.js','src/house.js'])
 vm.runInNewContext(fs.readFileSync(src,'utf8'),sandbox);
const q=sandbox.window.EchoStory,r=sandbox.window.EchoRoute,ruins=sandbox.window.EchoRuins,house=sandbox.window.EchoHouse;
assert(q&&r&&ruins&&house);
assert.equal(q.ids().length,10);
const basic={scene:'OVERWORLD',hasStarter:false,introStage:0,routeQuest:{accepted:false,lights:[],rewarded:false,guardianWon:false},
 ruinsProgress:{seals:[],bossWon:false,reported:false},gymDefeated:[false,false,false],foundMusicBox:false,
 musicBoxDelivered:false,team:[],potions:2,orbs:4};
assert.equal(q.inspect(basic,'intro.package').locked,true);
assert.equal(q.inspect(basic,'intro.package').completed,false);
assert.equal(q.inspect(basic,'unknown'),null);
const virgin=JSON.stringify(basic);
assert.equal(q.claimReward(basic,'woodland.liora'),false);
assert.equal(JSON.stringify(basic),virgin,'Failed claim is side-effect free');
basic.hasStarter=true;basic.introStage=2;
assert.equal(q.inspect(basic,'intro.package').completed,true);
assert.equal(q.inspect(basic,'arena.kael').ready,true);
assert.equal(q.inspect(basic,'arena.lyra').locked,true);
basic.gymDefeated[0]=true;
assert.equal(q.inspect(basic,'arena.lyra').ready,true);
assert.equal(q.inspect(basic,'arena.vex').locked,true);
basic.routeQuest.accepted=true;
const silent={catch(){},evolve(){},heal(){},confirm(){}};
let words=r.guideTalk(basic,silent);
assert.equal(basic.routeQuest.accepted,true);
basic.routeQuest.lights=['west','mitte','ost'];
assert.equal(q.inspect(basic,'woodland.liora').ready,true);
const before={potions:basic.potions,orbs:basic.orbs};
words=r.guideTalk(basic,silent);
assert.equal(basic.routeQuest.rewarded,true);assert.equal(basic.potions,before.potions+2);assert.equal(basic.orbs,before.orbs+5);
r.guideTalk(basic,silent);
assert.equal(basic.potions,before.potions+2);assert.equal(basic.orbs,before.orbs+5);
assert.equal(q.claimReward(basic,'woodland.liora'),false);
assert.equal(q.inspect(basic,'woodland.liora').completed,true);
const pikoBefore={potions:basic.potions,orbs:basic.orbs};
assert.equal(r.keeperWin(basic,silent).length>0,true);
assert.equal(basic.potions,pikoBefore.potions+1);assert.equal(basic.orbs,pikoBefore.orbs+3);
assert.equal(r.keeperWin(basic,silent).length,0);
assert.equal(q.claimReward(basic,'woodland.piko'),false);
basic.ruinsProgress.seals=['wurzel','wasser','stern'];
const ruinBefore={potions:basic.potions,orbs:basic.orbs};
assert.equal(ruins.victory(basic).length>2,true);
assert.equal(basic.ruinsProgress.bossWon,true);
assert.equal(basic.potions,ruinBefore.potions+2);
assert.equal(basic.orbs,ruinBefore.orbs+3);
assert.equal(ruins.victory(basic).length,0);
assert.equal(q.inspect(basic,'ruins.report').ready,true);
basic.ruinsProgress.reported=true;
assert.equal(q.inspect(basic,'ruins.report').completed,true);
const music={...basic,player:{x:5,y:7,dir:'left',stepPhase:0},
 introStage:4,ruinsProgress:{bossWon:false},
 foundMusicBox:true,musicBoxDelivered:false,potions:1,orbs:1};
let talks=[];const dialog=lines=>{talks.push(lines)};
const create=()=>({id:1});
house.talk(music,dialog,create,silent);
assert.equal(music.potions,4);assert.equal(music.musicBoxDelivered,true);
house.talk(music,dialog,create,silent);
assert.equal(music.potions,4);
assert.equal(q.inspect(music,'martha.musicbox').completed,true);
const legacy={routeQuest:{accepted:true,lights:['west','mitte','ost'],rewarded:true,guardianWon:true},
 ruinsProgress:{seals:['wurzel','wasser','stern'],bossWon:true,reported:true},
 foundMusicBox:true,musicBoxDelivered:true,hasStarter:true,team:[{id:1,lv:14}],
 gymDefeated:[true,true,true],potions:11,orbs:12};
const frozen=JSON.stringify(legacy);
const status=q.snapshot(legacy);
assert(Object.values(status).filter(x=>x.completed).length>=7);
for(const id of ['woodland.liora','woodland.piko','ruins.guardian','martha.musicbox'])assert.equal(q.claimReward(legacy,id),false);
assert.equal(JSON.stringify(legacy),frozen,'Old rewarded saves must stay byte-identical');
assert.equal(q.claimReward({...basic,foundMusicBox:true,musicBoxDelivered:false,potions:Number.MAX_SAFE_INTEGER},'martha.musicbox'),false);
console.log('PASS: 10 story quests; gated prereqs; 4 one-time rewards, Liora/Piko/Ruins/Martha integration, read-only legacy state');
