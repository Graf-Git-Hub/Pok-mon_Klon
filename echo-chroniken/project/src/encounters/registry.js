/* Echo-Chroniken encounter registry; deterministic with injected RNG.
 * IDs, evolution stage and original starter protections come from species.js.
 * Missing maps are NEVER silently treated as Wurzelheim.
 */
(() => {
'use strict';
const maps=new Map();
let catalog=null;
const validId=id=>Number.isInteger(id)&&id>=1&&id<=150;
function initialize(species,definitions) {
 if(maps.size)throw Error('Encounter registry initialized twice');
 if(!Array.isArray(species)||species.length!==150||
    species.some((s,i)=>s?.id!==i+1||!Number.isInteger(s.stage)||s.stage<1||s.stage>3))
   throw Error('Invalid 150-species catalog');
 if(!Array.isArray(definitions)||!definitions.length)throw Error('Missing encounter definitions');
 catalog=species;
 try {definitions.forEach(register);}
 catch(e){maps.clear();catalog=null;throw e;}
 return maps.size;
}
function register(def){
 if(!catalog)throw Error('Initialize encounter catalog first');
 if(!def||typeof def.mapId!=='string'||!/^[a-z][a-z0-9_]{2,63}$/.test(def.mapId)||
   maps.has(def.mapId))throw Error('Invalid or duplicate encounter map');
 if(def.mode==='legacy-progressive'){
   if(def.mapId!=='legacy_wurzeldorf'||def.entries!==undefined)
     throw Error('Legacy encounter mode only applies to existing Wurzelheim');
   maps.set(def.mapId,Object.freeze({mapId:def.mapId,mode:def.mode}));
   return true;
 }
 if(def.mode!=='weighted'||!Array.isArray(def.entries)||!def.entries.length)
   throw Error('Weighted encounter table required');
 const seen=new Set(), rows=[];
 let sum=0;
 for(const e of def.entries){
   if(!e||!validId(e.id)||e.id===1||seen.has(e.id)||!catalog[e.id-1])
     throw Error('Invalid, repeated or starter species ID');
   const sp=catalog[e.id-1];
   if(sp.stage!==1)throw Error('Wild evolved creatures require a separately reviewed late-zone rule');
   if(!Number.isInteger(e.weight)||e.weight<=0||
      !Number.isInteger(e.minLevel)||!Number.isInteger(e.maxLevel)||
      e.minLevel<1||e.maxLevel<e.minLevel||e.maxLevel>100)
     throw Error('Invalid encounter weight or level range');
   if(e.minBadges!==undefined&&(!Number.isInteger(e.minBadges)||e.minBadges<0||e.minBadges>3))
     throw Error('Invalid badge gate');
   sum+=e.weight;seen.add(e.id);
   rows.push(Object.freeze({id:e.id,weight:e.weight,minLevel:e.minLevel,
     maxLevel:e.maxLevel,minBadges:e.minBadges||0}));
 }
 if(sum!==100)throw Error('Encounter weights must total exactly 100');
 maps.set(def.mapId,Object.freeze({mapId:def.mapId,mode:'weighted',entries:Object.freeze(rows)}));
 return true;
}
function candidates(mapId,limits,rolledLevel){
 const map=maps.get(mapId);
 if(!map)return [];
 if(!limits||!Number.isInteger(limits.poolCap)||!Number.isInteger(limits.stageCap)||
    !Number.isInteger(limits.low)||!Number.isInteger(limits.cap)||
    !Number.isInteger(rolledLevel)||rolledLevel<limits.low||rolledLevel>limits.cap)
   return [];
 if(map.mode==='legacy-progressive'){
   // Exact v0.16 ID pool and equal probability, including only base forms for newcomers.
   return catalog.filter(s=>s.id!==1&&s.id<=limits.poolCap&&s.stage<=limits.stageCap)
     .map(s=>({id:s.id,weight:1}));
 }
 const badges=Math.max(0,Math.floor(Number(limits.badges)||0));
 return map.entries.filter(e=>e.minBadges<=badges&&
   rolledLevel>=e.minLevel&&rolledLevel<=e.maxLevel&&
   e.id<=limits.poolCap&&catalog[e.id-1].stage<=limits.stageCap);
}
function choose(mapId,limits,rolledLevel,rng=Math.random){
 const list=candidates(mapId,limits,rolledLevel);
 if(!list.length)return null; // Explicitly no spawn for unknown or inaccessible maps.
 const n=Number(rng());
 if(!Number.isFinite(n)||n<0||n>=1)throw Error('Encounter RNG must be in [0,1)');
 const total=list.reduce((v,e)=>v+e.weight,0);
 let cursor=n*total;
 for(const e of list){cursor-=e.weight;if(cursor<0)return e.id;}
 return list[list.length-1].id;
}
function preview(mapId,limits,rolledLevel){
 const list=candidates(mapId,limits,rolledLevel),total=list.reduce((s,e)=>s+e.weight,0);
 return list.map(e=>({id:e.id,percent:100*e.weight/total}));
}
window.EchoEncounters=Object.freeze({
 initialize,register,choose,preview,
 has:mapId=>maps.has(mapId),list:()=>Array.from(maps.keys()),
 get:mapId=>maps.get(mapId)||null
});
})();