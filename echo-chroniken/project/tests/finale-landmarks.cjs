const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const window={EchoMaps:{get:()=>({exits:[]})}};
vm.runInNewContext(fs.readFileSync('src/maps/story-finale.js','utf8'),{window,console});
const final=window.EchoFinale;
function paint(mapId,extras={},tick=0){
 const s={currentMapId:mapId,player:{x:12,y:11},team:[],...extras};
 final.ensure(s);
 const before=JSON.stringify(s);
 const ops=[];
 final.draw({},tick,s,0,0,(x,y,w,h,color)=>{
  assert([x,y,w,h].every(Number.isFinite),'finite draw rectangle');
  assert(w>0&&h>0,'positive draw rectangle');
  assert(typeof color==='string'&&color.startsWith('#'),'valid palette entry');
  ops.push({x,y,w,h,color});
 },()=>{},()=>{});
 assert.equal(JSON.stringify(s),before,'drawing cannot mutate quest or save state');
 assert(ops.length<220,'bounded per-frame draw work');
 return ops;
}
const home=paint('martha_house');
const memoryEmpty=paint('memory_room');
const memoryProgress=paint('memory_room',{chapter12:{pictures:[0],martha:true}},0);
const memoryPulseOff=paint('memory_room',{chapter12:{pictures:[0],martha:true}},24);
const coreLocked=paint('resonance_core');
const coreFreed=paint('resonance_core',{chapter14:{varekWon:true,freed:[0,1,2]}},24);
const colors=ops=>new Set(ops.map(x=>x.color));
assert(colors(memoryEmpty).has('#ab8ba7'),'unknown portraits use muted frames');
assert(colors(memoryProgress).has('#e8cf96'),'recovered portraits must glow');
assert(colors(memoryProgress).has('#fff0d6'),'memory pulse visible');
assert(colors(memoryPulseOff).has('#dbcaee'),'memory pulse animates');
assert(colors(coreLocked).has('#df9ec3'),'closed anchors glow purple');
assert(colors(coreFreed).has('#719d95'),'freed anchors turn green');
assert(colors(coreFreed).has('#8bbbaa'),'defeated guardian changes resonance');
assert(!colors(home).has('#e8cf96'),'existing home scenery unaffected');
assert(!colors(home).has('#719d95'),'no core overlays in family home');
console.log('PASS finale landmarks: portraits, freedom state, pulse, safe draws and bounded pixel work');
