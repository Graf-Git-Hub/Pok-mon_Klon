const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{EchoRoute:{POINTS:[{x:14,y:20,id:'west'}]}},Math,Set};
vm.runInNewContext(fs.readFileSync('src/exploration.js','utf8'),ctx);
const x=ctx.window.EchoExplore;
assert.equal(x.STASHES.length,3);
const game={hasStarter:true,player:{x:5,y:6},explorationFound:[],potions:5,orbs:12,routeQuest:{accepted:false}};
const reward={garten:[2,0],waldrand:[0,4],lichtung:[1,3]};
for(const item of x.STASHES){
 game.player={x:item.x,y:item.y+1};
 assert.equal(x.nearby(game).id,item.id,'stash must be reachable from below '+item.id);
 const prevP=game.potions,prevO=game.orbs;
 const lines=x.collect(game);
 assert(lines.length>=2);
 assert.equal(game.potions,prevP+reward[item.id][0]);
 assert.equal(game.orbs,prevO+reward[item.id][1]);
 assert.equal(x.collect(game),null,'cannot collect twice');
}
assert.equal(x.ensure(game).length,3);
assert.equal(x.nearby(game),null);
const saved=JSON.parse(JSON.stringify(game));
assert.equal(x.collect(saved),null,'save retains picked stashes');
assert.equal(saved.potions,8);assert.equal(saved.orbs,19);
game.player={x:5,y:6};game.explorationFound=['bad','garten','garten','lichtung'];
assert.deepEqual([...x.ensure(game)],['garten','lichtung'],'migration must drop invalid or duplicate IDs');
game.hasStarter=false;game.player={x:20,y:19};
assert.equal(x.collect(game),null,'no loot without starter');
const canvas={
  fillStyle:'',strokeStyle:'',lineWidth:1,font:'',
  fillRect(){},strokeRect(){},fillText(){},save(){},restore(){}
};
const map=Array.from({length:28},()=>Array(36).fill(0));
for(let y=0;y<28;y++)for(let xx=0;xx<36;xx++)if(xx===0||y===0||xx===35||y===27)map[y][xx]=1;
x.drawMap(canvas,map,{...saved,player:{x:17,y:17}},);
x.drawWorld(canvas,500,{...saved,player:{x:17,y:17}},0,0,()=>{});
const gameplay=fs.readFileSync('src/game.js','utf8');
assert(gameplay.includes("gameState.mode='MAP'"),'gamepad/map toggle missing');
assert(gameplay.includes('explorationFound: gameState.explorationFound'),'save missing items');
assert(gameplay.includes('saveGame(true);'),'silent save required');
assert(gameplay.includes('Math.random()<0.08'),'fewer encounters required');
const html=fs.readFileSync('index.html','utf8');
assert(html.includes('src/exploration.js')&&html.includes('data-cmd="MAP"'));
console.log('PASS: 3 one-time treasures, migration, map drawing, real input, persistence, calmer wild encounters');
