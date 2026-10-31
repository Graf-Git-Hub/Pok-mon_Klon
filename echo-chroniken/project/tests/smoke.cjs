const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert');
const path=require('node:path');process.chdir(path.resolve(__dirname,'..'));
const body=fs.readFileSync('src/game.js','utf8'),species=fs.readFileSync('data/species.js','utf8');
function cx(){return new Proxy({measureText(s){return {width:s.length*5}},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4)}},createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4)}},createLinearGradient(){return {addColorStop(){}}}}, {get(t,k){return k in t?t[k]:()=>{}},set(t,k,v){t[k]=v;return true}})}
function el(){return {dataset:{},style:{},value:'',textContent:'',classList:{add(){},remove(){}},addEventListener(){},appendChild(){},querySelectorAll(){return []},getContext(){return cx()},getBoundingClientRect(){return {left:0,top:0,width:320,height:180}}}}
const map={},document={documentElement:{classList:{add(){}}},getElementById(n){return map[n]??(map[n]=el())},createElement:el,addEventListener(){}};
const storage={},window={document,addEventListener(){},location:{search:''}};
const env={window,document,location:window.location,URLSearchParams,navigator:{getGamepads(){return []}},Image:class{constructor(){this.complete=true;this.naturalWidth=256}},localStorage:{getItem(k){return storage[k]},setItem(k,v){storage[k]=v}},Math,console,Uint8ClampedArray,setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},requestAnimationFrame(){}};
vm.runInNewContext(species,env);
const insertion='window.qa={state:gameState,startWildBattle,createMonsterInstance,learnedFor,ensureMonsterMoves,attackReorder,ATTACKS,skillDamage,saveGame};\n';
vm.runInNewContext(body.replace('  // --- HAUPTSCHLEIFE (GAME LOOP) ---',insertion+'  // --- HAUPTSCHLEIFE (GAME LOOP) ---'),env);
const q=window.qa;assert(q);
q.state.player.x=10;q.state.player.y=12;
for(let i=0;i<200;i++){q.startWildBattle();const e=q.state.battle.enemy;assert(e.lv>=2&&e.lv<=4);assert.strictEqual(window.ECHO_SPECIES[e.id-1].stage,1);q.state.mode='OVERWORLD'}
assert.strictEqual(q.createMonsterInstance(1,5).moves.length,2);
const m=q.createMonsterInstance(1,19);assert(m.moves.length>4);
q.state.team=[m];q.state.mode='ATTACKS';q.state.attackOrigin='OVERWORLD';q.state.freeAttackCursor=0;
const old=m.moves.join(',');q.attackReorder(1);assert.notStrictEqual(m.moves.join(','),old);
q.saveGame();assert(storage.echo_chroniken_tv_save.includes('moves'));
assert(q.skillDamage(q.createMonsterInstance(1,5),q.createMonsterInstance(7,3),q.ATTACKS.lichtfunke)<15);
console.log('OK: 200 Starter-Kaempfe, Level, Attackenlernen, Sortierung, Speicherstand und Schaden');
