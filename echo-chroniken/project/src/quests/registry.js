/* Echo-Chroniken M01-03: Story/quest registry.
 * Existing save flags are canonical. No parallel reward ledger, no ID migration.
 * All read/query functions are pure; claimReward is synchronous and idempotent.
 */
(() => {
'use strict';
const isObj=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const flag=(s,path)=>{
 let v=s;
 for(const key of path.split('.')){
  if(!isObj(v)||!Object.prototype.hasOwnProperty.call(v,key))return undefined;
  v=v[key];
 }
 return v;
};
const truth=(s,path)=>flag(s,path)===true;
const lights=s=>{
 const a=flag(s,'routeQuest.lights');
 return Array.isArray(a)&&['west','mitte','ost'].every(id=>a.includes(id));
};
const seals=s=>{
 const a=flag(s,'ruinsProgress.seals');
 return Array.isArray(a)&&a.length===3&&a.every((id,i)=>id===['wurzel','wasser','stern'][i]);
};
const completedGym=(s,i)=>Array.isArray(s?.gymDefeated)&&s.gymDefeated[i]===true;
const QUESTS=Object.freeze({
 'intro.package':{title:'Omas Paket',ready:s=>Number(s?.introStage)>=1,done:s=>s?.hasStarter===true},
 'intro.exit':{title:'Auf nach Wurzelheim',ready:s=>s?.hasStarter===true,done:s=>Number(s?.introStage)>=4},
 'martha.musicbox':{title:'Omas Spieluhr',ready:s=>truth(s,'foundMusicBox'),done:s=>truth(s,'musicBoxDelivered')},
 'woodland.liora':{title:'Drei Seelenlichter',ready:s=>truth(s,'hasStarter')&&truth(s,'routeQuest.accepted')&&lights(s),done:s=>truth(s,'routeQuest.rewarded')},
 'woodland.piko':{title:'Pikos Prüfung',ready:s=>truth(s,'routeQuest.rewarded'),done:s=>truth(s,'routeQuest.guardianWon')},
 'ruins.guardian':{title:'Erinnerungshüter',ready:s=>truth(s,'routeQuest.rewarded')&&seals(s),done:s=>truth(s,'ruinsProgress.bossWon')},
 'ruins.report':{title:'Berichte Oma',ready:s=>truth(s,'ruinsProgress.bossWon'),done:s=>truth(s,'ruinsProgress.reported')},
 'arena.kael':{title:'Kaels Prüfung',ready:s=>truth(s,'hasStarter'),done:s=>completedGym(s,0)},
 'arena.lyra':{title:'Lyras Prüfung',ready:s=>completedGym(s,0),done:s=>completedGym(s,1)},
 'arena.vex':{title:'Vex Prüfung',ready:s=>completedGym(s,1),done:s=>completedGym(s,2)}
});
const REWARDS=Object.freeze({
 'martha.musicbox':{flag:'musicBoxDelivered',potions:3,orbs:0},
 'woodland.liora':{flag:'routeQuest.rewarded',potions:2,orbs:5},
 'woodland.piko':{flag:'routeQuest.guardianWon',potions:1,orbs:3},
 'ruins.guardian':{flag:'ruinsProgress.bossWon',potions:2,orbs:3}
});
function inspect(s,id){
 if(!isObj(s))return null;
 const q=QUESTS[id];
 if(!q)return null;
 const completed=q.done(s);
 const ready=!completed&&q.ready(s);
 return {id,title:q.title,completed,ready,locked:!completed&&!ready};
}
function check(s,id){
 const q=inspect(s,id);
 return !!q&&q.ready;
}
function claimReward(s,id){
 if(!check(s,id)||!REWARDS[id])return false;
 const r=REWARDS[id],parts=r.flag.split('.');
 let target=s;
 for(const key of parts.slice(0,-1)){
  if(!isObj(target[key]))return false;
  target=target[key];
 }
 const field=parts[parts.length-1];
 if(target[field]===true)return false;
 // Compute before committing. Existing flag is the sole single-use reward marker.
 const oldPotions=Number.isFinite(s.potions)&&s.potions>=0?s.potions:0;
 const oldOrbs=Number.isFinite(s.orbs)&&s.orbs>=0?s.orbs:0;
 const newPotions=oldPotions+r.potions,newOrbs=oldOrbs+r.orbs;
 if(!Number.isSafeInteger(newPotions)||!Number.isSafeInteger(newOrbs))return false;
 target[field]=true;
 s.potions=newPotions;
 s.orbs=newOrbs;
 if(id==='ruins.guardian')s.ruinsProgress.reported=false;
 return true;
}
function snapshot(s){
 const result={};
 for(const id of Object.keys(QUESTS))result[id]=inspect(s,id);
 return result;
}
window.EchoStory=Object.freeze({
 ids:()=>Object.keys(QUESTS),inspect,canClaim:check,claimReward,snapshot
});
})();
