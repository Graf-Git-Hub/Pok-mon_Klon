/* Echo-Chroniken: future multi-map registry and additive save migration.
   36x28 legacy game and room scene states are not replaced. */
(() => {
'use strict';
const LEGACY='legacy_wurzeldorf',VERSION=2,
 SAVE_KEY='echo_chroniken_tv_save',BACKUP_KEY='echo_chroniken_tv_save_before_maps_v2';
const maps=new Map(), blocked=new Set([1,4,5,7]);
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
function register(spec){
 if(!obj(spec)||typeof spec.mapId!=='string'||!/^[a-z][a-z0-9_]{2,63}$/.test(spec.mapId)||maps.has(spec.mapId))
  throw Error('Invalid or duplicate mapId');
 const tiles=spec.tiles;
 if(!Array.isArray(tiles)||!tiles.length||!Array.isArray(tiles[0])||!tiles[0].length||
    tiles.length>512||tiles[0].length>512||!tiles.every(r=>Array.isArray(r)&&r.length===tiles[0].length))
  throw Error('Non-rectangular or oversized map');
 const spawns=spec.spawns||{},exits=spec.exits||[];
 if(!obj(spawns)||!Object.keys(spawns).length||!Array.isArray(exits))throw Error('Missing spawns or exits');
 for(const [id,p] of Object.entries(spawns))
  if(!obj(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||
     p.y<0||p.y>=tiles.length||p.x<0||p.x>=tiles[0].length||blocked.has(tiles[p.y][p.x]))
    throw Error('Invalid safe spawn: '+id);
 const seen=new Set();
 for(const e of exits){
  if(!obj(e)||typeof e.exitId!=='string'||seen.has(e.exitId)||
     typeof e.toMapId!=='string'||typeof e.toSpawnId!=='string'||typeof e.returnExitId!=='string')
   throw Error('Invalid map exit');
  seen.add(e.exitId);
 }
 const map={mapId:spec.mapId,tiles,spawns,exits,width:tiles[0].length,height:tiles.length};
 maps.set(spec.mapId,map);return map;
}
function registerLegacy(tiles){
 if(maps.has(LEGACY))return maps.get(LEGACY);
 return register({mapId:LEGACY,tiles,spawns:{village_safe:{x:5,y:6}},exits:[]});
}
function addSpawn(mapId,id,p){
 const m=maps.get(mapId);
 if(!m||typeof id!=='string'||!id||m.spawns[id]||
   !obj(p)||!Number.isInteger(p.x)||!Number.isInteger(p.y)||
   p.x<0||p.x>=m.width||p.y<0||p.y>=m.height||
   blocked.has(m.tiles[p.y][p.x]))throw Error('Invalid new map spawn');
 m.spawns[id]={x:p.x,y:p.y};return true;
}
function addExit(mapId,e){
 const m=maps.get(mapId);
 if(!m||!obj(e)||typeof e.exitId!=='string'||!e.exitId||
    m.exits.some(x=>x.exitId===e.exitId)||
    !Number.isInteger(e.x)||!Number.isInteger(e.y)||
    e.x<0||e.x>=m.width||e.y<0||e.y>=m.height||
    blocked.has(m.tiles[e.y][e.x])||
    typeof e.toMapId!=='string'||typeof e.toSpawnId!=='string'||
    typeof e.returnExitId!=='string')throw Error('Invalid new exit');
 m.exits.push({...e});return true;
}
function getExitAt(mapId,x,y){
 const m=maps.get(mapId);
 return m?.exits.find(e=>e.x===x&&e.y===y)||null;
}
function validateNetwork(){
 for(const m of maps.values())for(const e of m.exits){
   const to=maps.get(e.toMapId), back=to?.exits.find(b=>
     b.exitId===e.returnExitId&&b.toMapId===m.mapId&&
     b.returnExitId===e.exitId&&m.spawns[b.toSpawnId]);
   if(!to||!to.spawns[e.toSpawnId]||!back||!Number.isInteger(e.x)||
      !Number.isInteger(e.y)||blocked.has(m.tiles[e.y]?.[e.x]))
     throw Error('Disconnected or unsafe portal '+m.mapId+':'+e.exitId);
 }
 return true;
}
function migrateSave(save){
 if(!obj(save))throw Error('Invalid save object');
 if(Number(save.saveSchemaVersion||0)>VERSION)throw Error('Save is newer than this app');
 const next={...save},valid=typeof next.currentMapId==='string'&&maps.has(next.currentMapId);
 if(!valid){
  const unknown=typeof next.currentMapId==='string'&&next.currentMapId!==LEGACY;
  next.currentMapId=LEGACY;
  next.safeSpawnId='legacy_current_position';
  if(unknown){
   next.scene='OVERWORLD';next.player={...(obj(next.player)?next.player:{}),x:5,y:6,dir:'down',stepPhase:0};
   next.roomId=null;
  }
 }else if(typeof next.safeSpawnId!=='string'||!next.safeSpawnId){
  next.safeSpawnId='legacy_current_position';
 }
 next.saveSchemaVersion=VERSION;
 return next;
}
function backupLegacy(storage,raw,parsed){
 if(!storage||!raw||!obj(parsed)||Number(parsed.saveSchemaVersion||0)>=VERSION)return false;
 try{
  if(!storage.getItem(BACKUP_KEY))storage.setItem(BACKUP_KEY,raw);
  return true;
 }catch(e){console.warn('Save backup not possible',e);return false;}
}
function flagEnabled(state,flag){
 if(!flag||flag==='always')return true;
 if(typeof flag!=='string')return false;
 let value=state;
 for(const part of flag.split('.')){
  if(!obj(value)||!Object.prototype.hasOwnProperty.call(value,part))return false;
  value=value[part];
 }
 return value===true;
}
function travel(state,exitId){
 if(!obj(state))return false;
 const from=maps.get(state.currentMapId||LEGACY);
 if(!from)return false;
 const edge=from.exits.find(x=>x.exitId===exitId);
 if(!edge||!flagEnabled(state,edge.requiredFlag))return false;
 const to=maps.get(edge.toMapId);
 if(!to||!obj(to.spawns[edge.toSpawnId]))return false;
 const back=to.exits.find(x=>x.exitId===edge.returnExitId&&x.toMapId===from.mapId&&from.spawns[x.toSpawnId]);
 if(!back)return false;
 const spawn=to.spawns[edge.toSpawnId];
 // Commit only after every precondition, ensuring no partial teleport or softlock.
 state.currentMapId=to.mapId;state.safeSpawnId=edge.toSpawnId;
 state.player={...(obj(state.player)?state.player:{}),x:spawn.x,y:spawn.y,stepPhase:0};
 state.scene='OVERWORLD';return true;
}
window.EchoMaps=Object.freeze({LEGACY,VERSION,SAVE_KEY,BACKUP_KEY,
 register,registerLegacy,addSpawn,addExit,getExitAt,validateNetwork,
 get:id=>maps.get(id)||null,has:id=>maps.has(id),
 migrateSave,backupLegacy,travel,list:()=>Array.from(maps.keys())});
})();
