const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const project = path.join(__dirname, '..');
const code = fs.readFileSync(path.join(project,'src/back-art.js'),'utf8');
const html = fs.readFileSync(path.join(project,'index.html'),'utf8');
const game = fs.readFileSync(path.join(project,'src/game.js'),'utf8');
const java = fs.readFileSync(path.join(project,'../android/app/src/main/java/de/echochroniken/game/MainActivity.java'),'utf8');
assert.match(html, /src="src\/back-art\.js"/);
assert.match(html, /id="back-art-import"/);
assert.match(game, /window\.EchoBackArt\?\.getSprite\(id\)/);
assert.match(code, /monster-backs-150\.webp/);
assert.ok(fs.statSync(path.join(project,'assets/monster-backs-150.webp')).size > 50000);
assert.match(java, /onShowFileChooser/);
assert.match(java, /PICK_BACK_ART/);
assert.match(java, /setAllowContentAccess\(true\)/);
let listener = null;
const env = {
  window: {}, console,
  document: {addEventListener(event, callback){if(event==='DOMContentLoaded') listener=callback}},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  Image: class {set src(value){if(value.startsWith('assets/')) this.onerror?.()}}
};
vm.runInNewContext(code, env);
const api = env.window.EchoBackArt;
assert.equal(api.count, 0);
assert.equal(api.getSprite(1), null);
assert.equal(api.getSprite(150), null);
assert.equal(typeof listener, 'function');
console.log('PASS: 150 back-art loader; bundled WebP atlas; browser and Android picker wired.');
