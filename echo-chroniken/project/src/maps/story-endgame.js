/* Echo-Chroniken chapters 9-11. Additive, independently saved story regions. */
(()=>{
'use strict';
const chapters={
 9:{key:'chapter9',title:'FROSTGRAT',maps:[
  ['frost_approach','FROSTGRAT-PASS','frost',26,18],
  ['frost_station','FORSCHUNGSSTATION','icebase',24,18],
  ['ice_caverns','EISHOEHLEN','cavern',27,19],
  ['station_frost','BAHNHOF FROSTGRAT','station',24,17]]},
 10:{key:'chapter10',title:'UNTERSTADT',maps:[
  ['under_city_station','BAHNHOF UNTERSTADT','station',25,18],
  ['under_city_homes','DIE ALTE WOHNSTADT','undercity',26,19],
  ['resonance_mainring','ZENTRALRING','ring',25,18],
  ['continuum_vault','KONTINUUM-ARCHIV','vault',24,18]]},
 11:{key:'chapter11',title:'STERNENOBSERVATORIUM',maps:[
  ['star_ridge','STERNENPFAD','starlight',26,18],
  ['observatory_hall','STERNENHALLE','observatory',25,18],
  ['observatory_telescope','FERNROHR-KUPPEL','observatory',24,18],
  ['observatory_roof','STERNENDACH','starlight',26,18]]}
};
const names={},themes={},chapterOf={},nodes=new Map(),blocked=new Set([1,4,5,7]);
for(const [num,chapter] of Object.entries(chapters))for(const [id,name,theme,w,h] of chapter.maps){
 names[id]=name;themes[id]=theme;chapterOf[id]=Number(num);
 nodes.set(id,{mapId:id,w,h,spawns:{},exits:[]});
}
function connect(a,ae,ax,ay,as,ap,b,be,bx,by,bs,bp,flag){
 const A=nodes.get(a),B=nodes.get(b);
 if(!A||!B)throw Error('Unknown map connection');
 A.spawns[as]=ap;B.spawns[bs]=bp;
 A.exits.push({exitId:ae,x:ax,y:ay,toMapId:b,toSpawnId:bs,returnExitId:be,...(flag?{requiredFlag:flag}:{})});
 B.exits.push({exitId:be,x:bx,y:by,toMapId:a,toSpawnId:as,returnExitId:ae});
}
connect('frost_approach','to_frost_station',24,9,'from_station',{x:23,y:9},
 'frost_station','to_frost_approach',1,9,'from_approach',{x:2,y:9});
connect('frost_station','to_ice_caverns',22,9,'from_caverns',{x:21,y:9},
 'ice_caverns','to_frost_station',1,9,'from_station',{x:2,y:9},'chapter9.phase_lantern');
connect('frost_station','to_station_frost',21,14,'from_train',{x:20,y:14},
 'station_frost','to_frost_station',1,9,'from_base',{x:2,y:9});
connect('under_city_station','to_under_homes',23,9,'from_homes',{x:22,y:9},
 'under_city_homes','to_under_station',1,9,'from_station',{x:2,y:9});
connect('under_city_homes','to_mainring',24,12,'from_ring',{x:23,y:12},
 'resonance_mainring','to_under_homes',1,9,'from_homes',{x:2,y:9});
connect('resonance_mainring','to_vault',23,9,'from_vault',{x:22,y:9},
 'continuum_vault','to_mainring',1,9,'from_ring',{x:2,y:9});
connect('star_ridge','to_observatory',24,9,'from_hall',{x:23,y:9},
 'observatory_hall','to_star_ridge',1,9,'from_ridge',{x:2,y:9});
connect('observatory_hall','to_telescope',23,6,'from_telescope',{x:22,y:6},
 'observatory_telescope','to_hall',1,9,'from_hall',{x:2,y:9});
connect('observatory_hall','to_roof',23,13,'from_roof',{x:22,y:13},
 'observatory_roof','to_hall',1,9,'from_hall',{x:2,y:9});
nodes.get('frost_approach').spawns.from_capital={x:2,y:9};
nodes.get('frost_approach').exits.push({exitId:'to_capital',x:1,y:9,toMapId:'capital_outer_gate',
 toSpawnId:'from_frost',returnExitId:'to_frost'});
nodes.get('ice_caverns').spawns.from_under={x:24,y:9};
nodes.get('ice_caverns').exits.push({exitId:'to_under_city',x:25,y:9,
 toMapId:'under_city_station',toSpawnId:'from_ice',returnExitId:'to_ice','requiredFlag':'chapter9.completed'});
nodes.get('under_city_station').spawns.from_ice={x:2,y:9};
nodes.get('under_city_station').exits.push({exitId:'to_ice',x:1,y:9,
 toMapId:'ice_caverns',toSpawnId:'from_under',returnExitId:'to_under_city'});
nodes.get('continuum_vault').spawns.from_star={x:20,y:13};
nodes.get('continuum_vault').exits.push({exitId:'to_star_ridge',x:21,y:13,
 toMapId:'star_ridge',toSpawnId:'from_vault',returnExitId:'to_vault','requiredFlag':'chapter10.completed'});
nodes.get('star_ridge').spawns.from_vault={x:2,y:9};
nodes.get('star_ridge').exits.push({exitId:'to_vault',x:1,y:9,
 toMapId:'continuum_vault',toSpawnId:'from_star',returnExitId:'to_star_ridge'});
nodes.get('station_frost').spawns.platform={x:11,y:12};
nodes.get('under_city_station').spawns.platform={x:12,y:12};
const raw={
 frost_approach:[['sign',7,5],['mapPart',14,6],['warmFire',8,12],['lostLetter',20,12]],
 frost_station:[['scientist',7,5],['lensPart',12,5],['batteryPart',17,5],['assembler',13,11],['healer',7,12]],
 ice_caverns:[['bridgeLeft',8,6],['bridgeRight',18,6],['vex',20,5],['fatherLog',20,12],['caveSignal',23,13]],
 station_frost:[['train',12,7],['stationMaster',6,7],['warmFire',17,11]],
 under_city_station:[['train',12,7],['guide',7,6],['map',18,6],['healer',7,12]],
 under_city_homes:[['member0',7,5],['member1',17,5],['miraDrawing',12,11],['neighbour',20,12]],
 resonance_mainring:[['anchorA',7,5],['anchorB',16,5],['anchorC',12,12],['power',20,12],['ringSign',5,12]],
 continuum_vault:[['guardian',13,6],['testimony',6,6],['evacuation',18,12],['signal',10,12]],
 star_ridge:[['sign',7,5],['stargazer',17,11]],
 observatory_hall:[['projection0',6,5],['projection1',12,5],['projection2',18,5],['fatherMessage',11,12],['healer',6,12]],
 observatory_telescope:[['dialWURZEL',6,5],['dialWASSER',12,5],['dialSTERN',18,5],['telescope',12,12],['logbook',18,12]],
 observatory_roof:[['varek',13,5],['capsule0',7,11],['capsule1',13,11],['capsule2',19,11],['beacon',22,5],['miraLetter',6,5]]
};
const markers={};
for(const [id,points] of Object.entries(raw))markers[id]=points.map(([type,x,y])=>({type,x,y}));
function tiles(node){
 const {w,h,mapId}=node,theme=themes[mapId];
 const outdoor=['frost','cavern','undercity','starlight'].includes(theme);
 const t=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
  if(!x||!y||x===w-1||y===h-1)return 1;
  const k=(x*19+y*13+x*y*7)%43;
  if(outdoor&&k===3)return 2;
  return 3;
 }));
 if(outdoor)for(const [x0,y0] of [[4,3],[w-7,3]])for(let y=y0;y<y0+3;y++)for(let x=x0;x<x0+3;x++)t[y][x]=5;
 for(let y=7;y<=Math.min(14,h-2);y++)for(let x=1;x<w-1;x++)t[y][x]=3;
 for(let y=1;y<h-1;y++)t[y][Math.floor(w/2)]=3;
 for(const p of [...Object.values(node.spawns),...node.exits,...markers[mapId]]){
  for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)
   if(x>0&&x<w-1&&y>0&&y<h-1)t[y][x]=3;
 }
 // The ice gorge is impassable except at a lantern-activated phase bridge.
 if(mapId==='ice_caverns'){for(let y=1;y<h-1;y++)t[y][12]=4;t[9][12]=3;}
 return t;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('capital_outer_gate'))throw Error('Chapter 8 must be registered first');
 r.addSpawn('capital_outer_gate','from_frost',{x:22,y:14});
 r.addExit('capital_outer_gate',{exitId:'to_frost',x:23,y:14,
  toMapId:'frost_approach',toSpawnId:'from_capital',returnExitId:'to_capital',
  requiredFlag:'chapter8.completed'});
 for(const node of nodes.values())r.register({mapId:node.mapId,tiles:tiles(node),spawns:node.spawns,exits:node.exits});
 return r.validateNetwork();
}
const defaults={
 9:()=>({stage:0,parts:[],scientist:false,phase_lantern:false,bridgeActive:false,
  vexWon:false,fatherLog:false,caveSignal:false,completed:false,rewardClaimed:false,
  lostLetter:false,errors:0}),
 10:()=>({stage:0,guide:false,memberViews:[],miraDrawing:false,anchors:[],
  powerStable:false,testimony:false,guardianWon:false,peaceful:false,
  central_ring_offline:false,evacuation:false,signal:false,completed:false,rewardClaimed:false}),
 11:()=>({stage:0,projections:[],dial:[],telescope:false,varekMet:false,
  varek_first_defeated:false,capsules:[],fatherMessage:false,beacon:false,
  completed:false,rewardClaimed:false,miraLetter:false,errors:0})
};
function ensure(s,n){
 for(const k of [9,10,11]){
  const key='chapter'+k,def=defaults[k]();
  if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))s[key]=def;
  for(const [name,value] of Object.entries(def)){
   if(s[key][name]===undefined)s[key][name]=Array.isArray(value)?[]:value;
   if(Array.isArray(value)&&!Array.isArray(s[key][name]))s[key][name]=[];
  }
 }
 return n?s['chapter'+n]:s;
}
function access(s,exitId){
 if(exitId==='to_frost'&&!s.chapter8?.completed)return ['Der Frostgrat-Pass fehlt.','Schliesse Kapitel 8 ab.'];
 if(exitId==='to_ice_caverns'&&!s.chapter9?.phase_lantern)return ['Ohne Phasenlaterne ist der Eisweg zu gefaehrlich.','Baue sie an der Forschungsstation.'];
 if(exitId==='to_under_city'&&!s.chapter9?.completed)return ['Die Unterstadt ist noch versiegelt.','Finde Vaters Logbuch und das Signal.'];
 if(exitId==='to_star_ridge'&&!s.chapter10?.completed)return ['Die Observatorium-Schleuse braucht einen stillen Zentralring.'];
 return null;
}
function regionMove(s,dx,dy){
 const m=window.EchoMaps.get(s.currentMapId);
 if(!m||!names[m.mapId])return {handled:false};
 const x=s.player.x+dx,y=s.player.y+dy;
 if(x<0||y<0||x>=m.width||y>=m.height)return {handled:true};
 const edge=window.EchoMaps.getExitAt(m.mapId,x,y);
 if(edge){
  const denied=access(s,edge.exitId);
  if(denied)return {handled:true,lines:denied};
  if(window.EchoMaps.travel(s,edge.exitId))return {handled:true,travel:true,lines:[names[s.currentMapId]]};
  return {handled:true,lines:['Die Tuer ist noch verriegelt.']};
 }
 const bridgeTile=m.mapId==='ice_caverns'&&x===12&&y===9;
 if((bridgeTile&&!s.chapter9?.bridgeActive)||blocked.has(m.tiles[y][x])||markers[m.mapId].some(p=>p.x===x&&p.y===y))
  return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:m.tiles[y][x]===2};
}
function interact(s,tx,ty){
 const n=chapterOf[s.currentMapId];
 if(!n)return {lines:['Hier ist kein Echo.']};
 const c=ensure(s,n),points=markers[s.currentMapId];
 const p=points.find(x=>x.x===tx&&x.y===ty)||points.find(x=>x.x===s.player.x&&x.y===s.player.y);
 if(!p)return {lines:['Hier ist nur Stille.']};
 const id=p.type,out={changed:false,lines:[]};
 const set=(key,value)=>{if(c[key]!==value){c[key]=value;out.changed=true;}};
 const add=(key,value)=>{if(!c[key].includes(value)){c[key].push(value);out.changed=true;}};
 const stage=x=>set('stage',Math.max(c.stage,x));
 const count=(key,total)=>c[key].length+'/'+total;
 if(id==='healer'||id==='warmFire'){
  for(const m of s.team||[])m.hp=m.maxHp;
  out.changed=true;out.lines=['Eine warme Ruhebank heilt dein gesamtes Team.','Du kannst jederzeit zurueckkehren.'];
 }else if(id==='sign')out.lines=[names[s.currentMapId],
  n===9?'Die Phasenlaterne zeigt Bruecken, die man nicht sehen kann.':'Erinnerung ist keine Gefangenschaft.'];
 else if(n===9){
  if(id==='mapPart'||id==='lensPart'||id==='batteryPart'){
   add('parts',id);stage(1);
   out.lines=[id==='mapPart'?'Expeditionskarte: Die Eispassage liegt hinter der Station.':
    id==='lensPart'?'Resonanzlinse: Sie zeigt versteckte Lichtbruecken.':
    'Energiezelle: Genug Kraft fuer eine sichere Laterne.',
    'Expeditionsteile: '+count('parts',3)];
  }else if(id==='scientist'){
   set('scientist',true);
   out.lines=['Forscherin: Vex wartet in der Eishoehle.','Die Laterne braucht Karte, Linse und Energiezelle.',
    'Brueckenschalter gibt es auf BEIDEN Seiten der Schlucht.'];
  }else if(id==='assembler'){
   if(c.phase_lantern)out.lines=['Die Phasenlaterne leuchtet ruhig.','Die Eisbruecke kann jederzeit erneut aktiviert werden.'];
   else if(c.parts.length<3)out.lines=['Drei Teile fehlen fuer die Laterne.','Karte, Linse und Energiezelle: '+count('parts',3)];
   else{set('phase_lantern',true);stage(3);
    out.lines=['Du setzt die PHASENLATERNE zusammen!','Unsichtbare Resonanzwege werden nun sichtbar.','Suche die Brueckenschalter in der Eishoehle.'];}
  }else if(id==='bridgeLeft'||id==='bridgeRight'){
   if(!c.phase_lantern)out.lines=['Die Schlucht ist zu tief.','Eine Phasenlaterne koennte den Weg zeigen.'];
   else{set('bridgeActive',true);stage(4);
    out.lines=['Die Phasenbruecke leuchtet auf und bleibt sicher bestehen.',
     'Beide Ufer sind nun dauerhaft verbunden.'];}
  }else if(id==='vex'){
   if(c.vexWon)out.lines=['Vex: Dein Vater wollte, dass jede Stimme frei entscheiden darf.'];
   else if(!c.bridgeActive)out.lines=['Vex: Eine unsichtbare Bruecke ist noch keine sichere Bruecke.','Aktiviere die Laterne.'];
   else{out.boss='vexFrost';
    out.lines=['Vex: Ich bewahre die letzte Spur deines Vaters.','Zeige mir, dass du auch den Rueckweg sicherst!'];}
  }else if(id==='fatherLog'){
   if(!c.vexWon)out.lines=['Das Logbuch ist versiegelt.','Vex prueft, ob du es tragen kannst.'];
   else{set('fatherLog',true);stage(6);
    out.lines=['Vater: Severin, sie muessen waehlen duerfen.','Varek: Du verlangst von mir einen zweiten Abschied.',
     'Die letzte Expedition verlief in die Unterstadt.'];}
  }else if(id==='caveSignal'){
   if(!c.fatherLog)out.lines=['Das Signal rauscht.','Lies zuerst Vaters Logbuch.'];
   else if(c.completed)out.lines=['Die Unterstadt ist freigegeben.','Kapitel 9 ist abgeschlossen.'];
   else{set('caveSignal',true);set('completed',true);stage(8);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+4;s.potions=(s.potions||0)+2;}
    out.lines=['Das Signal zeigt einen sicheren Eingang zur UNTERSTADT.','Die Frostgrat-Bahn wird freigeschaltet.',
     'Kapitel 9 geschafft! +4 Sphaeren, +2 Traenke.'];}
  }else if(id==='lostLetter'){
   set('lostLetter',true);
   out.lines=['Ein eingefrorener Brief: Fuer Mira.','Varek hat ihn nie abgeschickt. Du bewahrst ihn auf.'];
  }else if(id==='train'){
   if(!c.completed)out.lines=['Die Frostgrat-Bahn wartet auf die Freigabe der Eishoehle.'];
   else{out.rail=true;out.lines=['ECHO-BAHN: Ziel waehlen.'];}
  }else if(id==='stationMaster')out.lines=['Die Frostgrat-Bahn faehrt kostenlos nach Kronenstadt.'];
 }
 else if(n===10){
  if(id==='guide'){
   set('guide',true);stage(1);
   out.lines=['Stadtfuehrerin: Unter Kronenstadt wohnten einst Forscherfamilien.',
    'Die Bahn war ein Weg nach Hause, kein Gefaengnis.','Sprich mit beiden Gruppen und finde Miras Wohnung.'];
  }else if(id==='map')out.lines=['Unterstadt: Wohnquartier - Zentralring - Kontinuum-Archiv.',
   'Alle Wege besitzen einen sicheren Rueckweg.'];
  else if(id==='member0'||id==='member1'){
   const i=Number(id.slice(-1));add('memberViews',i);stage(2);
   out.lines=i===0?['Kontinuum-Mitglied: Ich wollte meinen Bruder noch einmal hoeren.',
    'Aber niemand soll deswegen eingesperrt werden.']:
    ['Technikerin: Ein Schutzraum kann helfen.','Er muss aber eine Tuer besitzen, die sich von innen oeffnet.'];
  }else if(id==='miraDrawing'){
   set('miraDrawing',true);stage(3);
   out.lines=['Miras Zeichnung: Ein Schmetterling fliegt AUS dem Glas.',
    'Darunter: Papa, ich will, dass du mich gehen laesst.',
    'Das war Vareks Tochter. Er hat ihren Wunsch nie vergessen.'];
  }else if(id==='neighbour')out.lines=['Nachbar: Mira malte immer Fenster ohne Gitter.',
   'Varek verstand nicht, dass Offenheit Sicherheit bedeuten kann.'];
  else if(id==='ringSign')out.lines=['Zentralring: Drei unabhängige Anker A, B und C.',
   'Die Notstromversorgung muss anbleiben.'];
  else if(id.startsWith('anchor')){
   const name=id.slice(-1);
   if(c.memberViews.length<2||!c.miraDrawing)out.lines=['Der Ring zeigt fremde Namen.',
    'Hoere erst beide Seiten und finde Miras Zeichnung.'];
   else{add('anchors',name);stage(4);
    out.lines=['Ringanker '+name+' entkoppelt.','Unabhaengige Anker: '+count('anchors',3),
     'Die Notbeleuchtung bleibt aktiv.'];}
  }else if(id==='power'){
   if(c.anchors.length<3)out.lines=['Notstrom darf nicht abgeschaltet werden.',
    'Loese alle drei Ringanker, ohne die Stadt zu verdunkeln.'];
   else{set('powerStable',true);stage(5);
    out.lines=['Die Notbeleuchtung ist gesichert.','Der Zentralring kann ohne Zwangssignal abgeschaltet werden.'];}
  }else if(id==='testimony'){
   if(!c.powerStable)out.lines=['Die Aussagen sind noch unter Verschluss.','Sichere zuerst die drei Anker und den Notstrom.'];
   else{set('testimony',true);stage(6);
    out.lines=['Die Forscher bestaetigen: Das Netz hatte freiwillige Ausgaenge.',
     'Varek liess sie nach Miras Tod verriegeln.','Der Ringhueter kann mit diesem Beweis ueberzeugt werden.'];}
  }else if(id==='guardian'){
   if(c.guardianWon)out.lines=['Ringhueter: Der Zentralring haelt niemanden mehr fest.'];
   else if(!c.powerStable)out.lines=['Ringhueter: Ich lasse die Stadt nicht im Dunkeln.','Sichere erst die Notversorgung.'];
   else if(c.testimony){
    set('guardianWon',true);set('peaceful',true);stage(6);
    out.lines=['Du zeigst dem Ringhueter die freiwilligen Ausgaenge.',
     'Ringhueter: Ich dachte, ich wuerde die Menschen schuetzen.',
     'Er legt seinen Schluessel ohne Kampf ab.'];
   }else{out.boss='ringGuardian';out.lines=['Ringhueter: Niemand schaltet unser Netz ab!',
    'Du kannst kaempfen oder im Archiv nach Beweisen suchen.'];}
  }else if(id==='evacuation'){
   if(!c.guardianWon)out.lines=['Die Notausgaenge sind noch verschlossen.','Ueberzeuge den Ringhueter oder besiege ihn.'];
   else{set('evacuation',true);set('central_ring_offline',true);stage(7);
    out.lines=['Drei Notausgaenge werden dauerhaft freigegeben.',
     'Der Zwangsring ist AUS, die Wohnungen bleiben hell.'];}
  }else if(id==='signal'){
   if(!c.central_ring_offline)out.lines=['Das Observatorium-Signal ist gestoert.','Schalte zuerst den Zentralring sicher ab.'];
   else if(c.completed)out.lines=['Der Weg zum Sternenobservatorium ist offen.'];
   else{set('signal',true);set('completed',true);stage(8);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+4;s.potions=(s.potions||0)+2;}
    out.lines=['Die Koordinaten des Sternenobservatoriums erscheinen.',
     'Die Unterstadt-Bahn ist freigegeben.','Kapitel 10 geschafft! +4 Sphaeren, +2 Traenke.'];}
  }else if(id==='train'){
   if(!c.completed)out.lines=['Der Unterstadt-Bahnhof wartet auf den sicheren Zentralring.'];
   else{out.rail=true;out.lines=['ECHO-BAHN: Ziel waehlen.'];}
  }
 }else if(n===11){
  if(id==='stargazer')out.lines=['Sternenforscher: Wir messen Resonanz, nicht fremde Welten.',
   'Die Sterne erinnern uns an die Entfernung zwischen zwei Menschen.'];
  else if(id.startsWith('projection')){
   const i=Number(id.slice(-1));add('projections',i);stage(2);
   out.lines=[['Bild 1: Vater und Varek bauen ein Netz mit offenen Tueren.',
    'Bild 2: Mira fragt, ob sie selbst gehen darf.',
    'Bild 3: Varek schliesst die Tueren nach Miras Abschied.'][i],
    'Historische Bilder: '+count('projections',3)];
  }else if(id.startsWith('dial')){
   const word=id.slice(4),order=['WURZEL','WASSER','STERN'];
   if(c.projections.length<3)out.lines=['Die Fernrohr-Kalibrierung braucht drei historische Bilder.'];
   else if(c.dial.includes(word))out.lines=['Frequenz '+word+' ist bereits eingestellt.'];
   else if(order[c.dial.length]!==word){
    set('errors',c.errors+1);
    out.lines=['Die Resonanzlinien ueberlagern sich.',
     'Hinweis: WURZEL, WASSER, STERN. Vorherige Frequenzen bleiben erhalten.'];
   }else{add('dial',word);stage(3);
    out.lines=['Frequenz '+word+' rastet ein.','Kalibrierung: '+count('dial',3)];}
  }else if(id==='telescope'){
   if(c.dial.length<3)out.lines=['Das Fernrohr ist nicht kalibriert.',
    'Vergleiche WURZEL, WASSER, STERN.'];
   else{set('telescope',true);stage(4);
    out.lines=['Sechs Regionen senden unterschiedliche Resonanzlinien.',
     'Eine Leitung zieht Echos gegen ihren Willen zum Resonanzschacht.',
     'Varek wartet auf dem Sternendach.'];}
  }else if(id==='logbook')out.lines=['Vaters Notiz: Die beste Kapsel ist die, die sich von innen oeffnen laesst.'];
  else if(id==='varek'){
   if(c.varek_first_defeated)out.lines=['Varek: Ich wollte Mira nicht ein zweites Mal verlieren.',
    'Die freien Echos zeigen mir, dass ich falsch lag.'];
   else if(!c.telescope)out.lines=['Varek: Du verstehst die Resonanz noch nicht.','Kalibriere erst das Fernrohr.'];
   else{set('varekMet',true);stage(5);out.boss='varekFirst';
    out.lines=['Varek: Meine Tochter bat mich, den Deckel offen zu lassen.',
     'Ich habe es nicht gekonnt. Ich will keinen zweiten Abschied!',
     'Du antwortest: Erinnern heisst nicht festhalten.'];}
  }else if(id.startsWith('capsule')){
   const i=Number(id.slice(-1));
   if(!c.varek_first_defeated)out.lines=['Die Kapseln sind von Vareks Bindungstechnik verriegelt.'];
   else{add('capsules',i);stage(6);
    out.lines=[['Echo 1: Danke, dass ich selbst entscheiden darf.',
     'Echo 2: Ich werde noch bleiben, aber freiwillig.',
     'Echo 3: Ich gehe jetzt zu den Sternen.'][i],
     'Frei geoeffnete Kapseln: '+count('capsules',3)];}
  }else if(id==='fatherMessage'){
   if(!c.varek_first_defeated)out.lines=['Die Nachricht ist noch verschluesselt.'];
   else{set('fatherMessage',true);stage(7);
    out.lines=['Vater an Oma Martha: Du hast meinem Kind ein Zuhause gegeben.',
     'Sag ihm, dass Elena niemals in einer Maschine gefangen sein sollte.',
     'Ich habe den Resonanzschacht auf der Karte markiert.'];}
  }else if(id==='miraLetter'){
   set('miraLetter',true);
   out.lines=['Miras letzter Brief: Ich habe keine Angst vor dem Gehen.',
    'Bitte hab du keine Angst vor dem Erinnern.'];
  }else if(id==='beacon'){
   if(!c.varek_first_defeated||c.capsules.length<3||!c.fatherMessage)
    out.lines=['Der Sternensender braucht drei freie Echos und Vaters Nachricht.',
     'Freigaben: '+count('capsules',3)+'; Nachricht: '+(c.fatherMessage?'ja':'nein')];
   else if(c.completed)out.lines=['Der Resonanzschacht ist auf deiner Karte markiert.',
    'Kapitel 11 ist abgeschlossen.'];
   else{set('beacon',true);set('completed',true);stage(8);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+5;s.potions=(s.potions||0)+3;}
    out.lines=['Der Sender zeigt den Weg zum Resonanzschacht.',
     'Varek zieht sich zurueck, ohne die Echos erneut einzusperren.',
     'Kapitel 11 geschafft! +5 Sphaeren, +3 Traenke.'];}
  }
 }
 if(!out.lines.length)out.lines=['Die Erinnerungen fuehren weiter.'];
 return out;
}
function victory(s,which){
 const n=which==='vexFrost'?9:which==='ringGuardian'?10:which==='varekFirst'?11:0;
 if(!n)return [];
 const c=ensure(s,n);
 if(which==='vexFrost'&&!c.vexWon){c.vexWon=true;c.stage=Math.max(c.stage,5);
  return ['Vex legt die Waffe nieder.','Vex: Ich habe deinem Vater geholfen. Sein Logbuch gehoert dir.'];}
 if(which==='ringGuardian'&&!c.guardianWon){c.guardianWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Ringhueter gibt den Weg frei.','Die drei Notausgaenge koennen jetzt aktiviert werden.'];}
 if(which==='varekFirst'&&!c.varek_first_defeated){c.varek_first_defeated=true;c.stage=Math.max(c.stage,6);
  return ['Varek sinkt erschöpft zu Boden. Die Anlage ueberlastet!',
   'Oeffne die drei Kapseln freiwillig, statt einen weiteren Kampf zu erzwingen.'];}
 return [];
}
function goal(s){
 const n=chapterOf[s.currentMapId],c=ensure(s,n);
 if(n===9){
  if(c.completed)return 'KAPITEL 9 GESCHAFFT';
  if(c.parts.length<3)return 'EXPEDITIONSTEILE '+c.parts.length+'/3';
  if(!c.phase_lantern)return 'BAUE DIE PHASENLATERNE';
  if(!c.bridgeActive)return 'AKTIVIERE DIE EISBRUECKE';
  if(!c.vexWon)return 'STELLE DICH VEX';
  if(!c.fatherLog)return 'LIES VATERS LOGBUCH';
  return 'FINDE DAS UNTERSTADT-SIGNAL';
 }
 if(n===10){
  if(c.completed)return 'KAPITEL 10 GESCHAFFT';
  if(c.memberViews.length<2)return 'HOERE BEIDE SEITEN '+c.memberViews.length+'/2';
  if(!c.miraDrawing)return 'FINDE MIRAS ZEICHNUNG';
  if(c.anchors.length<3)return 'RINGANKER '+c.anchors.length+'/3';
  if(!c.powerStable)return 'SICHERE DEN NOTSTROM';
  if(!c.guardianWon)return 'RINGHUETER: KAMPF ODER BEWEIS';
  if(!c.central_ring_offline)return 'OEFFNE DIE NOTAUSGAENGE';
  return 'FINDE DAS OBSERVATORIUM-SIGNAL';
 }
 if(c.completed)return 'KAPITEL 11 GESCHAFFT';
 if(c.projections.length<3)return 'PROJEKTIONEN '+c.projections.length+'/3';
 if(c.dial.length<3)return 'FERNROHR: WURZEL WASSER STERN';
 if(!c.telescope)return 'AKTIVIERE DAS FERNROHR';
 if(!c.varek_first_defeated)return 'STELLE DICH VAREK';
 if(c.capsules.length<3)return 'BEFREIE DIE ECHOS '+c.capsules.length+'/3';
 if(!c.fatherMessage)return 'LIES VATERS NACHRICHT';
 return 'AKTIVIERE DEN STERNENSENDER';
}
function drawTile(pix,tile,sx,sy,x,y,tick,id){
 const theme=themes[id],n=(x*17+y*23+x*y*3)%17;
 const palette=theme==='frost'?['#c7e4e6','#d5edf1','#6b9daa']:
  theme==='icebase'?['#829daa','#9fc1ca','#4b7587']:
  theme==='cavern'?['#6598ad','#8dbdc7','#3e667d']:
  theme==='undercity'?['#777c91','#a9a8aa','#4d586f']:
  theme==='ring'?['#596c85','#899baa','#354b66']:
  theme==='vault'?['#697d83','#a6aba1','#465b63']:
  theme==='starlight'?['#364d76','#6379a0','#1b2e53']:
  theme==='observatory'?['#8995b0','#b9b8c4','#4d6189']:
  ['#627f90','#a3b6ba','#42596a'];
 if(tile===4){
  pix(sx,sy,16,16,'#1c344a');pix(sx+2,sy+1,12,13,'#2a5268');
  pix(sx+3,sy+8,10,1,'#80b4c0');return;
 }
 if(tile===1||tile===5){
  pix(sx,sy,16,16,palette[2]);pix(sx+1,sy+1,14,13,palette[0]);
  pix(sx+2,sy+2,12,3,palette[1]);pix(sx+1,sy+9,14,1,palette[2]);
  if(tile===5){
   pix(sx+4,sy+5,9,6,palette[2]);pix(sx+6,sy+6,5,4,'#d9d4b4');
  }
  return;
 }
 pix(sx,sy,16,16,palette[0]);pix(sx,sy,16,1,palette[1]);
 pix(sx+2,sy+9,4,2,palette[1]);pix(sx+10,sy+3,3,2,palette[2]);
 if(theme==='frost'||theme==='cavern'||theme==='icebase'){
  if(n<5){pix(sx+5,sy+3,7,2,'#e5f8f5');pix(sx+8,sy+1,2,6,'#f3f9ee');}
  if(tile===2){pix(sx+4,sy+4,4,8,'#6d9fb2');pix(sx+7,sy+2,4,5,'#c5f5e8');}
 }else if(theme==='starlight'||theme==='observatory'){
  if(n<5){pix(sx+4,sy+5,2,2,'#e9d9aa');pix(sx+12,sy+10,2,2,'#b7c8ec');}
  if(tile===2){pix(sx+5,sy+4,6,7,'#7186ac');pix(sx+7,sy+2,2,2,'#f1d8b3');}
 }else{
  if(n<5)pix(sx+7,sy+7,3,3,'#c6b9a3');
  if(tile===2){pix(sx+5,sy+3,4,9,palette[2]);pix(sx+6,sy+5,2,2,'#e6c58f');}
 }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId,c=ensure(s,chapterOf[id]),theme=themes[id],m=window.EchoMaps.get(id);
 const at=(x,y)=>[x*16-camX,y*16-camY];
 // Local scenery: hand-drawn structures, not repeated generic ground tiles.
 if(theme==='frost'||theme==='cavern'){
  for(const [x,y] of [[5,3],[18,3],[7,14]]){
   const [u,v]=at(x,y);
   pix(u+4,v-9,7,26,'#6c9cac');pix(u,v-6,16,11,'#d1f3ed');
   pix(u+5,v-13,5,7,'#effcf5');pix(u+8,v+3,3,6,'#83c0c8');
  }
 }else if(theme==='undercity'||theme==='ring'||theme==='vault'){
  for(const [x,y] of [[4,4],[18,4],[5,14]]){
   const [u,v]=at(x,y);
   pix(u-3,v-5,46,35,'#3c526a');pix(u,v+4,40,26,'#a0a6a7');
   pix(u+4,v+9,9,10,'#6d8d9c');pix(u+23,v+9,9,10,'#6d8d9c');
   pix(u+15,v+19,10,11,'#4e6279');
  }
 }else if(theme==='starlight'||theme==='observatory'){
  for(const [x,y] of [[4,3],[18,3]]){
   const [u,v]=at(x,y);
   pix(u-4,v+4,43,32,'#2c416b');pix(u,v+10,35,25,'#b0b4c9');
   pix(u+6,v+15,7,7,'#637e9e');pix(u+23,v+15,7,7,'#637e9e');
   pix(u+12,v-8,12,17,'#536c9a');pix(u+15,v-11,6,5,'#e4d9b7');
  }
 }
 if(id==='ice_caverns'){
  for(let y=1;y<m.height-1;y++){
   const [u,v]=at(12,y);
   pix(u+3,v+1,10,14,'#18324d');
   if(y===9&&c.bridgeActive){
    pix(u,v+3,16,10,'#a2e8eb');pix(u+1,v+4,14,2,'#f3f9d5');
    pix(u+5,v+8,7,2,'#e1c0f6');
   }else{pix(u+4,v+3,4,8,'#3b647b');pix(u+10,v+8,2,4,'#639eb2');}
  }
 }
 if(id==='resonance_mainring'){
  const [u,v]=at(12,8);
  pix(u-23,v-11,62,49,'#33495e');pix(u-18,v-6,52,39,'#7891a4');
  pix(u-13,v-2,42,30,c.central_ring_offline?'#9ab9ad':'#bc849c');
  pix(u-7,v+4,30,18,'#304c64');
 }
 if(id==='observatory_telescope'){
  const [u,v]=at(11,9);
  pix(u-13,v+1,54,29,'#354e70');pix(u+5,v-22,15,46,'#b6c1d1');
  pix(u+7,v-26,12,12,'#e8d7a9');pix(u+11,v-17,5,23,'#536d91');
 }
 const people=['scientist','vex','guide','member0','member1','neighbour','guardian',
  'stargazer','varek','stationMaster'];
 for(const p of markers[id]){
  const [u,v]=at(p.x,p.y),type=p.type;
  if(u<-40||v<-40||u>340||v>190)continue;
  if(people.includes(type)){
   const role=type==='varek'?'gym3':type==='vex'?'vex':
    type==='scientist'||type==='member0'?'girl':type==='guardian'?'jaro':
    type==='stationMaster'?'stationMaster':'gym2';
   drawChar(u,v,'#9dc3c3',0,role,'down');
  }else if(type==='train'){
   pix(u-5,v+1,27,16,'#344b6a');pix(u-3,v+3,23,10,'#d9cfad');
   pix(u+1,v+4,8,6,'#a0d8d7');
  }else if(type.startsWith('bridge')){
   pix(u+2,v+2,12,14,'#3c607a');pix(u+5,v-3,6,11,c.bridgeActive?'#b3ffdd':'#9cbed1');
   pix(u+7,v-7,2,5,'#f8e8bc');
  }else if(type.startsWith('anchor')||type.startsWith('dial')){
   pix(u+2,v+2,12,13,'#384b65');pix(u+4,v-2,8,12,'#a7b4c8');
   pix(u+6,v+1,4,4,'#ffe8a9');
  }else if(type.startsWith('capsule')){
   pix(u+2,v-4,12,22,'#344d6d');pix(u+4,v-2,8,17,
    c.capsules.includes(Number(type.slice(-1)))?'#9edfc4':'#c19bc4');
   pix(u+6,v+3,4,4,'#f5e2b6');
  }else{
   pix(u+2,v+3,12,11,'#344a61');
   pix(u+4,v+4,8,8,theme==='frost'||theme==='cavern'?'#b6ebeb':
    theme==='starlight'||theme==='observatory'?'#b4a5e2':'#d4bb96');
   pix(u+6,v+5,4,3,'#fff2c9');
  }
 }
 for(const edge of m.exits){
  const [u,v]=at(edge.x,edge.y);
  if(u<-16||v<-16||u>320||v>180)continue;
  pix(u+3,v+1,10,14,'#304c67');pix(u+5,v+3,6,10,'#f0d9a6');
 }
 pix(5,5,310,19,'#243d55e5');letter(names[id],10,18,10,'#f6e7c5');
 pix(5,156,310,19,'#243d55ec');letter(goal(s),9,169,9,'#f6e8c4');
}
function drawRegionMap(ctx,s){
 const m=window.EchoMaps.get(s.currentMapId),w=m.width,h=m.height;
 ctx.fillStyle='#1b3046';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#f7e3c4';ctx.font='bold 13px monospace';ctx.fillText(names[s.currentMapId],9,19);
 const scale=Math.min(275/w,124/h,9),left=(320-w*scale)/2,top=29;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const tile=m.tiles[y][x];
  ctx.fillStyle=tile===1?'#354c62':tile===4?'#172e43':
   tile===5?'#677f91':tile===2?'#8ac0c4':'#a4b7c3';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
  if(m.mapId==='ice_caverns'&&x===12&&y===9&&s.chapter9?.bridgeActive){
   ctx.fillStyle='#e8f3b8';ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
  }
 }
 ctx.fillStyle='#ffed99';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,
  Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',11,173);
}
window.EchoEndgame=Object.freeze({chapters,names,themes,chapterOf,markers,register,
 ensure,access,regionMove,interact,victory,goal,drawTile,draw,drawRegionMap});
})();
