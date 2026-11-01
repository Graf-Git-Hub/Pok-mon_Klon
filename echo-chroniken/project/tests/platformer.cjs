const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const stageSource=fs.readFileSync('src/platformer.js','utf8');
const context={window:{},console,Math,Set};
vm.runInNewContext(stageSource.replace('window.EchoPlatformer={PORTAL','window.__stageRun=()=>run;window.EchoPlatformer={PORTAL'),context);
const stage=context.window.EchoPlatformer;
assert(stage);
const player={scene:'OVERWORLD',mode:'OVERWORLD',hasStarter:true,player:{x:31,y:24,dir:'right'},potions:2,orbs:4};
assert.equal(stage.nearPortal(player),true);
assert.equal(stage.enter(player),true);
assert.equal(player.mode,'PLATFORM');
const frame=()=>context.window.__stageRun();
stage.update(player,0);
let now=0;
stage.input(player,'RIGHT');
for(let i=0;i<26;i++){now+=16;if(i%10===0)stage.input(player,'RIGHT');stage.update(player,now);}
assert(frame().x>65,'right movement must work');
const initialY=frame().y;
stage.input(player,'A');
for(let i=0;i<6;i++){now+=16;stage.input(player,'RIGHT');stage.update(player,now);}
assert(frame().y<initialY,'A must jump upwards');
stage.input(player,'START');
const frozen=frame().x;
for(let i=0;i<10;i++){now+=16;stage.update(player,now);}
assert.equal(frame().x,frozen,'paused stage must not move');
stage.input(player,'START');
now+=16;stage.update(player,now);
for(const cp of stage.CHECKPOINTS){
 const r=frame();
 r.x=cp.x+2;r.y=132;r.vy=0;r.grounded=true;r.move=0;r.moveUntil=0;
 now+=16;stage.update(player,now);
 assert.equal(frame().checkpointX,cp.x,'checkpoint must activate');
}
const tr=frame();tr.y=245;tr.vx=0;tr.moveUntil=0;now+=16;stage.update(player,now);
assert.equal(frame().x,stage.CHECKPOINTS[1].x,'death returns to latest checkpoint');
assert(frame().hearts>=1,'recoverable lives required');
for(let i=0;i<3;i++){
 const sh=stage.SHARDS[i],r=frame();
 r.x=sh.x-7;r.y=sh.y-8;r.vx=0;r.vy=0;r.moveUntil=0;r.grounded=false;
 now+=16;stage.update(player,now);
 assert.equal(frame().collected[i],true,'shard '+i+' collectible');
}
let r=frame();r.x=stage.LENGTH-79;r.y=132;r.vy=0;r.grounded=true;r.move=1;r.moveUntil=r.elapsed+2;
let result=null;
for(let i=0;i<80;i++){now+=16;result=stage.update(player,now);if(result)break;}
assert(result?.completed,'collecting 3 shards must unlock the exit');
assert(result.first,'first win should be rewarded');
assert.equal(player.mode,'OVERWORLD');assert.equal(player.orbs,9);assert.equal(player.potions,4);
assert.equal(player.platformProgress.cleared,true);
assert(player.platformProgress.bestSeconds>0);
const stash=JSON.parse(JSON.stringify(player));
assert.equal(stage.nearPortal(stash),true);
assert.equal(stage.enter(stash),true);
now=0;stage.update(stash,0);
for(let i=0;i<3;i++){
 const sh=stage.SHARDS[i],state=frame();
 state.x=sh.x-7;state.y=sh.y-8;state.vx=0;state.vy=0;state.moveUntil=0;
 now+=16;stage.update(stash,now);
}
const state=frame();state.x=stage.LENGTH-79;state.y=132;state.move=1;state.moveUntil=state.elapsed+2;
let second;
for(let i=0;i<100;i++){now+=16;second=stage.update(stash,now);if(second)break;}
assert(second?.completed&&!second.first,'replay works, but one-time prize cannot be repeated');
assert.equal(stash.orbs,9);assert.equal(stash.potions,4);
assert.equal(stage.enter(stash),true);
assert(stage.input(stash,'B'));assert.equal(stash.mode,'OVERWORLD');
const draw={fillStyle:'',font:'',save(){},restore(){},fillRect(){},fillText(){}};
const P=()=>{};
stage.enter(stash);
stage.render(draw,650,stash);stage.drawPortal(draw,650,stash,0,0,P);
const flight=2*Math.abs(-323)/800*151;
for(let i=0;i<stage.FLOORS.length-1;i++){
 const gap=stage.FLOORS[i+1][0]-stage.FLOORS[i][1];
 assert(gap<flight*.72,'gap '+i+' exceeds beginner jump length');
}
console.log('PASS: moving/jumping with A, pause, 2 checkpoints, hazard respawn, 3 collectibles, exit, one-time rewards, replay, B exit, pixel renderer, playable jumps');
