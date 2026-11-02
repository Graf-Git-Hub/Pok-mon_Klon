/* Persistent Echo Archive: every capture remains available after the six-slot team fills.
 * Additive save field only. Existing species IDs and save schema stay unchanged.
 */
(()=>{
'use strict';
function ensure(state){
 if(!Array.isArray(state.archive))state.archive=[];
 return state.archive;
}
function capture(state,monster){
 if(!monster||!Number.isInteger(monster.id)||monster.id<1||monster.id>150)
  throw Error('Invalid captured echo');
 ensure(state);
 if(!Array.isArray(state.team))state.team=[];
 if(state.team.length<6){state.team.push(monster);return true;}
 state.archive.push(monster);
 return false;
}
function exchange(state,archiveIndex,teamIndex){
 const stored=ensure(state);
 if(!Array.isArray(state.team)||!state.team.length||
  !Number.isInteger(archiveIndex)||archiveIndex<0||archiveIndex>=stored.length||
  !Number.isInteger(teamIndex)||teamIndex<0||teamIndex>=state.team.length)
  return false;
 const monster=stored[archiveIndex],active=state.team[teamIndex];
 if(!monster||!active||!Number.isInteger(monster.id)||!Number.isInteger(active.id)||
  monster.id<1||monster.id>150||active.id<1||active.id>150)return false;
 stored[archiveIndex]=active;state.team[teamIndex]=monster;
 return true;
}
window.EchoArchive=Object.freeze({ensure,capture,exchange});
})();
