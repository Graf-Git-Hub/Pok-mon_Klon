const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const project = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(project, file), 'utf8');
const expected = JSON.parse(read('assets/gb-classic/world_maps.json')).scenes;
const elements = new Map();
const storage = new Map();
let imageDraws = 0;
const paintedRects = [];

const ctx = new Proxy({
  fillRect(...rectangle) {
    if (paintedRects.length < 100) paintedRects.push(rectangle);
  },
  drawImage(image, ...coordinates) {
    assert(image);
    assert(coordinates.every(Number.isFinite));
    imageDraws++;
  },
  measureText(text) { return {width: String(text).length * 5}; },
  createLinearGradient() { return {addColorStop(){}}; },
}, {get: (target, key) => target[key] ?? (() => {})});
function element() {
  return {
    style: {}, dataset: {}, value: '', textContent: '',
    classList: {add(){}, remove(){}, toggle(){}},
    addEventListener(){}, appendChild(){}, querySelectorAll(){return [];},
    getContext(){return ctx;},
  };
}
const document = {
  documentElement: element(), body: element(), createElement: element,
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  },
  addEventListener(){},
};
const window = {document, location: {search: ''}, addEventListener(){}};
const env = vm.createContext({
  window, document, location: window.location, URLSearchParams,
  navigator: {getGamepads: () => []},
  Image: class {complete = true; naturalWidth = 256;},
  performance: {now: () => 200},
  localStorage: {getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value)},
  requestAnimationFrame(){}, setTimeout(){}, clearTimeout(){}, setInterval(){}, clearInterval(){},
  console,
});

const html = read('index.html');
for (const [,file] of html.matchAll(/<script src="([^"]+)"><\/script>/g)) {
  let source = read(file);
  if (file === 'src/game.js') {
    source = source.replace('  // --- HAUPTSCHLEIFE (GAME LOOP) ---',
      '  window.campaignTest={gameState,movePlayer,renderScene,renderTitle,renderBattle,startWildBattle,createMonsterInstance};');
  }
  vm.runInContext(source, env, {filename:file});
}
const {gameState: state, movePlayer, renderScene, renderTitle, renderBattle, startWildBattle, createMonsterInstance} = window.campaignTest;
const art = window.EchoGBCampaign;
const registry = window.EchoMaps;
assert.equal(window.echoQASnapshot().scene, 'HOUSE');
renderTitle(200);
renderScene(200);

let links = 0;
for (const [id, region] of Object.entries(expected)) {
  const map = registry.get(id);
  assert(map && art.hasMap(id), id);
  const spawn = Object.values(map.spawns)[0];
  Object.assign(state, {mode:'OVERWORLD', scene:'OVERWORLD', currentMapId:id,
    player:{...spawn, dir:'down', stepPhase:0}});
  const before = imageDraws;
  renderScene(200);
  assert(imageDraws > before, id + ' did not draw V14 art');
  for (const exit of Object.values(region.portals)) {
    assert.equal(art.isOutdoorLink(id, exit.scene), !!exit.direction);
    links += Number(!!exit.direction);
  }
}
assert.equal(Object.keys(expected).length,60);
assert.equal(links,34);

// A shoreline should only draw a pale rim against the dry neighboring tile.
const shoreline = {mapId:'lake_north_path',width:3,height:3,tiles:[[4,4,4],[0,4,4],[4,4,4]]};
paintedRects.length = 0;
art.drawTile(ctx,shoreline,1,1,16,16,120);
assert(paintedRects.some(([x,y,w,h]) => x===16 && y===16 && w===2 && h===16));
assert(!paintedRects.some(([x,y,w,h]) => x===30 && y===16 && w===2 && h===16));

const village = registry.get('legacy_wurzeldorf');
const gate = village.exits.find(exit => exit.exitId === 'to_lake');
function startAtGate(bossWon) {
  Object.assign(state, {mode:'OVERWORLD', scene:'OVERWORLD', currentMapId:village.mapId,
    ruinsProgress:{...state.ruinsProgress,bossWon},
    player:{x:gate.x,y:gate.y+1,dir:'up',stepPhase:0}});
}
startAtGate(false);
movePlayer(0,-1,'up');
assert.equal(state.currentMapId,village.mapId);
assert.equal(state.mode,'DIALOG');
startAtGate(true);
movePlayer(0,-1,'up');
assert.equal(state.currentMapId,'lake_north_path');
assert.equal(state.mode,'OVERWORLD');
assert.equal(JSON.parse(storage.get('echo_chroniken_tv_save')).currentMapId,'lake_north_path');

const map = registry.get(state.currentMapId);
const grass = map.tiles.flatMap((row, y) => row.map((tile,x) => ({tile,x,y})))
  .find(({tile}) => tile === 2);
art.onStep(map.mapId,grass.x,grass.y,true,200);
assert(art.drawGrass(ctx,map.mapId,grass.x,grass.y,0,0,300));
assert(!art.drawGrass(ctx,map.mapId,grass.x,grass.y,0,0,600));
state.team = [createMonsterInstance(1,5)];
state.hasStarter = true;
startWildBattle();
assert.equal(state.mode,'BATTLE');
assert(state.battle.enemy.id > 0);
renderBattle(200);
state.battle.ruinBoss = true;
renderBattle(350);

console.log('PASS: full campaign loaded, 60 V14 map renders, 34 outdoor links, story gate, autosave, grass and live battle creation');
