/* Echo-Chroniken: chapters 12-14, additive maps and persistent story flags. */
(()=>{
'use strict';
const chapters={
 12:{key:'chapter12',maps:[
  ['martha_house','MARTHAS ERINNERUNG','home',25,18],
  ['memory_room','DAS ERINNERUNGSZIMMER','memory',24,18],
  ['old_family_garden','DER ALTE FAMILIENGARTEN','garden',26,19]]},
 13:{key:'chapter13',maps:[
  ['shaft_entry','RESONANZSCHACHT','shaft',25,18],
  ['shaft_level1','SCHACHT: WURZEL','shaft',25,18],
  ['shaft_level2','SCHACHT: WASSER','shaft',25,18],
  ['shaft_anchors','SCHACHT: STERN','shaft',25,18],
  ['father_chamber','VATERS SIGNALKAMMER','memory',25,18]]},
 14:{key:'chapter14',maps:[
  ['core_access','KERNZUGANG','core',25,18],
  ['memory_reflections','DREI ERINNERUNGEN','memory',25,18],
  ['resonance_core','RESONANZKERN','core',26,19],
  ['epilogue_wurzelheim','WURZELHEIM: EIN NEUER MORGEN','garden',27,19]]}
};
const names={},themes={},chapterOf={},nodes=new Map(),blocked=new Set([1,4,5,7]);
for(const [n,c] of Object.entries(chapters))for(const [id,name,theme,w,h] of c.maps){
 names[id]=name;themes[id]=theme;chapterOf[id]=Number(n);
 nodes.set(id,{mapId:id,w,h,spawns:{},exits:[]});
}
function connect(a,ae,ax,ay,as,ap,b,be,bx,by,bs,bp,flag){
 const A=nodes.get(a),B=nodes.get(b);
 if(!A||!B)throw Error('Finale unknown map');
 A.spawns[as]=ap;B.spawns[bs]=bp;
 A.exits.push({exitId:ae,x:ax,y:ay,toMapId:b,toSpawnId:bs,returnExitId:be,...(flag?{requiredFlag:flag}:{})});
 B.exits.push({exitId:be,x:bx,y:by,toMapId:a,toSpawnId:as,returnExitId:ae});
}
connect('martha_house','to_memory',23,9,'from_memory',{x:22,y:9},
 'memory_room','to_martha',1,9,'from_martha',{x:2,y:9});
connect('martha_house','to_garden',13,16,'from_garden',{x:13,y:15},
 'old_family_garden','to_house',13,1,'from_house',{x:13,y:2});
connect('old_family_garden','to_shaft',24,9,'from_shaft',{x:23,y:9},
 'shaft_entry','to_garden',1,9,'from_garden',{x:2,y:9},'chapter12.completed');
connect('shaft_entry','to_level1',23,9,'from_level1',{x:22,y:9},
 'shaft_level1','to_entry',1,9,'from_entry',{x:2,y:9});
connect('shaft_level1','to_level2',23,9,'from_level2',{x:22,y:9},
 'shaft_level2','to_level1',1,9,'from_level1',{x:2,y:9});
connect('shaft_level2','to_anchors',23,9,'from_anchors',{x:22,y:9},
 'shaft_anchors','to_level2',1,9,'from_level2',{x:2,y:9});
connect('shaft_anchors','to_father',23,9,'from_father',{x:22,y:9},
 'father_chamber','to_anchors',1,9,'from_anchors',{x:2,y:9},'chapter13.anchorsDisabled');
connect('father_chamber','to_core',23,9,'from_core',{x:22,y:9},
 'core_access','to_father',1,9,'from_father',{x:2,y:9},'chapter13.completed');
connect('core_access','to_reflections',23,9,'from_reflections',{x:22,y:9},
 'memory_reflections','to_access',1,9,'from_access',{x:2,y:9});
connect('memory_reflections','to_core',23,9,'from_core',{x:22,y:9},
 'resonance_core','to_reflections',1,9,'from_reflections',{x:2,y:9},'chapter14.memoriesReady');
connect('resonance_core','to_epilogue',24,9,'from_epilogue',{x:23,y:9},
 'epilogue_wurzelheim','to_core',1,9,'from_core',{x:2,y:9},'chapter14.completed');
connect('epilogue_wurzelheim','to_family_garden',14,17,'from_family',{x:14,y:16},
 'old_family_garden','to_epilogue',14,17,'from_epilogue',{x:14,y:16},'chapter14.completed');
nodes.get('martha_house').spawns.from_roof={x:2,y:9};
nodes.get('martha_house').exits.push({exitId:'to_observatory',x:1,y:9,toMapId:'observatory_roof',
 toSpawnId:'from_family',returnExitId:'to_family'});
const raw={
 martha_house:[['martha',7,5],['letter',14,5],['musicBox',19,12],['familyPortrait',7,12]],
 memory_room:[['picture0',6,5],['picture1',12,5],['picture2',18,5],['memoryMirror',12,12],['safetyLatch',19,12]],
 old_family_garden:[['mioraChoice',7,5],['shaftKey',17,5],['evening',7,12],['healer',20,12]],
 shaft_entry:[['guardSign',7,5],['shaftGuide',17,5],['healer',7,12],['elevator',17,12]],
 shaft_level1:[['anchorW',7,5],['rootMemo',17,5],['lanternShortcut',12,12]],
 shaft_level2:[['anchorA',7,5],['shaftGuard',17,5],['healer',12,12]],
 shaft_anchors:[['anchorS',7,5],['escapeSwitch',17,5],['fatherDoor',12,12]],
 father_chamber:[['father',7,5],['protectionCode',17,5],['finalPreparation',12,12],['healer',20,12]],
 core_access:[['machinePhase',7,5],['warning',17,5],['healer',12,12]],
 memory_reflections:[['flash0',6,5],['flash1',12,5],['flash2',18,5],['miraLetter',12,12]],
 resonance_core:[['varekFinal',12,5],['free0',6,11],['free1',12,11],['free2',18,11],['farewell',21,5],['releaseSignal',22,14]],
 epilogue_wurzelheim:[['marthaEpilogue',7,5],['friends',18,5],['credits',12,11],['journal',20,12],['healer',6,12]]
};
const markers={};
for(const [id,items] of Object.entries(raw))markers[id]=items.map(([type,x,y])=>({type,x,y}));
function tiles(node){
 const {w,h,mapId}=node,theme=themes[mapId];
 const t=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
  if(x===0||y===0||x===w-1||y===h-1)return 1;
  const n=(x*19+y*11+x*y*3)%53;
  return theme==='garden'&&n===2?2:3;
 }));
 for(const [a,b] of [[4,3],[w-8,3]])for(let y=b;y<b+3;y++)for(let x=a;x<a+3;x++)t[y][x]=5;
 for(let y=7;y<Math.min(15,h-1);y++)for(let x=1;x<w-1;x++)t[y][x]=3;
 for(let y=1;y<h-1;y++)t[y][Math.floor(w/2)]=3;
 for(const p of [...Object.values(node.spawns),...node.exits,...markers[mapId]]){
  for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)
   if(x>0&&x<w-1&&y>0&&y<h-1)t[y][x]=3;
 }
 return t;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('observatory_roof'))throw Error('Chapters 9-11 required');
 r.addSpawn('observatory_roof','from_family',{x:23,y:13});
 r.addExit('observatory_roof',{exitId:'to_family',x:24,y:13,toMapId:'martha_house',
  toSpawnId:'from_roof',returnExitId:'to_observatory',requiredFlag:'chapter11.completed'});
 for(const node of nodes.values())r.register({mapId:node.mapId,tiles:tiles(node),spawns:node.spawns,exits:node.exits});
 return r.validateNetwork();
}
const defaults={
 12:()=>({stage:0,martha:false,pictures:[],mirror:false,latchOpen:false,choice:false,
  shaftKey:false,musicBox:false,evening:false,completed:false,rewardClaimed:false}),
 13:()=>({stage:0,guide:false,anchors:[],anchorsDisabled:false,guardianWon:false,
  escapeOpen:false,fatherMet:false,protectionCode:false,prepared:false,
  completed:false,rewardClaimed:false,optionalShortcut:false}),
 14:()=>({stage:0,machineReady:false,memories:[],memoriesReady:false,miraLetter:false,
  varekWon:false,freed:[],farewell:false,completed:false,rewardClaimed:false,
  credits:false,epilogueVisited:false})
};
function ensure(s,n){
 for(const k of [12,13,14]){
  const key='chapter'+k,def=defaults[k]();
  if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))s[key]=def;
  for(const [field,value] of Object.entries(def)){
   if(s[key][field]===undefined)s[key][field]=Array.isArray(value)?[]:value;
   if(Array.isArray(value)&&!Array.isArray(s[key][field]))s[key][field]=[];
  }
 }
 return n?s['chapter'+n]:s;
}
function access(s,exitId){
 if(exitId==='to_family'&&!s.chapter11?.completed)return ['Vaters Nachricht fehlt.','Beende Kapitel 11.'];
 if(exitId==='to_shaft'&&!s.chapter12?.completed)return ['Ohne Schachtschluessel ist der Weg versiegelt.'];
 if(exitId==='to_father'&&!s.chapter13?.anchorsDisabled)return ['Drei Zwangsanker blockieren die Signalkammer.'];
 if(exitId==='to_core'&&!s.chapter13?.completed)return ['Vaters Schutzcode fehlt.'];
 if(exitId==='to_core'&&s.currentMapId==='memory_reflections'&&!s.chapter14?.memoriesReady)return ['Erinnere dich zuerst an alle drei Stimmen.'];
 if(exitId==='to_epilogue'&&!s.chapter14?.completed)return ['Die Echos sind noch nicht frei.'];
 return null;
}
function regionMove(s,dx,dy){
 const m=window.EchoMaps.get(s.currentMapId);
 if(!m||!names[m.mapId])return {handled:false};
 const x=s.player.x+dx,y=s.player.y+dy;
 if(x<0||y<0||x>=m.width||y>=m.height)return {handled:true};
 const e=window.EchoMaps.getExitAt(m.mapId,x,y);
 if(e){
  const denied=access(s,e.exitId);
  if(denied)return {handled:true,lines:denied};
  if(window.EchoMaps.travel(s,e.exitId))return {handled:true,travel:true,lines:[names[s.currentMapId]]};
  return {handled:true,lines:['Der Durchgang ist noch verschlossen.']};
 }
 if(blocked.has(m.tiles[y][x])||markers[m.mapId].some(p=>p.x===x&&p.y===y))return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:m.tiles[y][x]===2};
}
function interact(s,tx,ty){
 const n=chapterOf[s.currentMapId],c=ensure(s,n),p=markers[s.currentMapId]?.find(p=>p.x===tx&&p.y===ty);
 if(!p)return {lines:['Hier ist nur ein leises Echo.']};
 const id=p.type,out={changed:false,lines:[]};
 const set=(k,v)=>{if(c[k]!==v){c[k]=v;out.changed=true;}};
 const add=(k,v)=>{if(!c[k].includes(v)){c[k].push(v);out.changed=true;}};
 const stage=v=>set('stage',Math.max(c.stage,v));
 const reward=(orbs,potions)=>{if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+orbs;s.potions=(s.potions||0)+potions;}};
 const tally=(k,total)=>c[k].length+'/'+total;
 const form=(()=>{const id=[...(s.team||[]),...(s.archive||[])].find(m=>[1,2,3].includes(m.id))?.id;
  return id===3?'Maternalis':id===2?'Seelara':id===1?'Miora':'dein freiwilliger Echo-Begleiter';})();
 if(id==='healer'){
  for(const m of s.team||[])m.hp=m.maxHp;
  out.changed=true;out.lines=['Die Ruhestation heilt dein ganzes Team.','Du kannst jederzeit zurueckgehen.'];
 }else if(n===12){
  if(id==='martha'){set('martha',true);stage(1);
   out.lines=['Martha: Elena war nicht nur eine Forscherin. Sie war deine Mutter.',
    'Sie wollte, dass du Menschen liebst, ohne sie festzuhalten.',
    'Ich habe dir ihre Briefe viel zu lange verschwiegen.'];}
  else if(id==='letter'){out.lines=['Elena schrieb: Mein Kind soll seine eigenen Wege gehen.',
   'Selbst wenn nur ein Echo von mir bleibt, gehoert es niemandem.'];}
  else if(id==='musicBox'){set('musicBox',true);out.lines=['Eine Spieluhr klingt wie ein vergessener Sommer.',
   'Martha: Elena spielte diese Melodie, wenn du nicht schlafen konntest.'];}
  else if(id==='familyPortrait'){out.lines=['Auf dem Bild lachen Elena, dein Vater und Martha.',
   'Die Erinnerung gehoert euch, nicht der Maschine.'];}
  else if(id.startsWith('picture')){const i=Number(id.slice(-1));add('pictures',i);stage(2);
   out.lines=[['Bild: Elena haelt ein kleines Kind im Arm.',
    'Bild: Vater und Elena bauen eine Kapsel mit offener Tuer.',
    'Bild: Martha bewahrt das versiegelte Paket auf.'][i],
    'Familienbilder '+tally('pictures',3)];}
  else if(id==='memoryMirror'){
   if(!c.martha||!c.pictures.length)out.lines=['Hoere zuerst Martha zu und betrachte mindestens ein Bild.'];
   else{set('mirror',true);stage(3);out.lines=[form+' sieht dich aus dem Spiegel an.',
    'Eine warme Stimme: Ich bin bei dir, weil ich es selbst will.',
    'Kein Wesen muss fuer immer in einer Kapsel bleiben.'];}
  }else if(id==='safetyLatch'){
   if(!c.mirror)out.lines=['Der Verschluss reagiert erst auf die freie Stimme.'];
   else{set('latchOpen',true);stage(4);out.lines=['Du deaktivierst den Zwangsverschluss.',
    form+' bleibt aus eigener Entscheidung bei dir.'];}
  }else if(id==='mioraChoice'){
   if(!c.latchOpen)out.lines=['Der Garten wartet auf eine freie Entscheidung.','Oeffne zuerst den Verschluss im Erinnerungszimmer.'];
   else{set('choice',true);stage(5);out.lines=[form+': Ich bleibe bei dir, solange ich es will.',
    'Martha: Genau so haette Elena es gewollt.'];}
  }else if(id==='shaftKey'){
   if(!c.choice)out.lines=['Martha: Erst die freie Entscheidung, dann der Schachtschluessel.'];
   else if(c.completed)out.lines=['Der Resonanzschacht ist offen.','Du kannst jederzeit zu Martha zurueck.'];
   else{set('shaftKey',true);set('completed',true);stage(7);reward(4,3);
    out.lines=['Martha uebergibt dir den SCHACHTSCHLUESSEL.',
     'Kapitel 12 geschafft! +4 Sphaeren und +3 Traenke.',
     'Die Reise in den Resonanzschacht beginnt.'];}
  }else if(id==='evening'){set('evening',true);out.lines=['Martha: Dein Vater hatte Angst, zu spaet zurueckzukehren.',
   'Doch du hast etwas gelernt, das wir beide vergessen hatten: loslassen.'];}
 }else if(n===13){
  if(id==='guardSign')out.lines=['RESONANZSCHACHT: Rueckaufzug jederzeit erreichbar.',
   'WURZEL, WASSER und STERN sind drei voneinander getrennte Anker.'];
  else if(id==='shaftGuide'){set('guide',true);stage(1);
   out.lines=['Schachtfuehrerin: Niemand muss hier bleiben.',
    'Drei Anker versorgen die Zwangsbindung. Loese jeden einzeln.',
    'Die Aufzuege funktionieren in beide Richtungen.'];}
  else if(id==='elevator')out.lines=['Der Notaufzug fuehrt bis zur Oberflaeche.',
   'Jeder Schachtabschnitt hat einen sicheren Rueckweg.'];
  else if(id.startsWith('anchor')){const symbol=id.slice(-1);
   add('anchors',symbol);stage(2);
   out.lines=['Zwangsanker '+symbol+' geloest.',tally('anchors',3)+' Anker sind getrennt.',
    'Die Notbeleuchtung bleibt an.'];}
  else if(id==='rootMemo')out.lines=['Vater: WURZEL steht fuer den Ursprung.',
   'Ein Anfang ist keine Fessel.'];
  else if(id==='lanternShortcut'){
   if(!s.chapter9?.phase_lantern)out.lines=['Eine Abkuerzung schimmert im Dunkeln.','Die Hauptroute ist auch ohne Laterne offen.'];
   else{set('optionalShortcut',true);out.lines=['Die Phasenlaterne erhellt einen optionalen Ruheplatz.',
    'Die Hauptroute bleibt unveraendert.'];}
  }else if(id==='shaftGuard'){
   if(c.guardianWon)out.lines=['Schachtwache: Ich helfe, die Fluchtschleuse offen zu halten.'];
   else if(c.anchors.length<2)out.lines=['Schachtwache: Erst zwei Anker trennen, dann sprechen wir.'];
   else{out.boss='shaftGuardian';out.lines=['Schachtwache: Varek befahl mir, niemanden durchzulassen.',
    'Du: Eine offene Tuer ist keine Bedrohung.'];}
  }else if(id==='escapeSwitch'){
   if(c.anchors.length<3||!c.guardianWon)out.lines=['Drei Anker und die Schachtwache muessen gesichert sein.',
    'Anker '+tally('anchors',3)+'; Wache '+(c.guardianWon?'bereit':'wartet')];
   else{set('anchorsDisabled',true);set('escapeOpen',true);stage(4);
    out.lines=['Die Fluchtschleuse ist offen. Alle drei Anker bleiben aus.',
     'Der Rueckweg zur Oberflaeche ist gesichert.'];}
  }else if(id==='fatherDoor')out.lines=c.anchorsDisabled?['Die Signalkammer ist frei.','Vater wartet hinter der Tuer.']:
   ['Der Schacht summt noch.','Schalte drei Anker ab und sichere die Fluchtschleuse.'];
  else if(id==='father'){set('fatherMet',true);stage(5);
   out.lines=['Vater: Elena lebt nicht in dieser Maschine weiter.',
    'Ein Teil ihrer Liebe hat in '+form+' eine freiwillige Stimme gefunden.',
    'Ich blieb hier, um die Zwangsanker von innen zu bremsen.'];}
  else if(id==='protectionCode'){
   if(!c.fatherMet)out.lines=['Vaters Schutzcode ist noch verschluesselt.'];
   else{set('protectionCode',true);stage(6);out.lines=['Vater: Dieser Code oeffnet alle freiwilligen Ausgaenge.',
    'Nimm ihn. Ich kann mein Notsignal nicht ewig halten.'];}
  }else if(id==='finalPreparation'){
   if(!c.protectionCode)out.lines=['Lies zuerst Vaters Schutzcode.'];
   else if(c.completed)out.lines=['Der Kernzugang ist frei.','Du kannst dich hier immer wieder heilen.'];
   else{set('prepared',true);set('completed',true);stage(8);reward(5,4);
    out.lines=['Der Kernzugang ist offen. Du speicherst deine Vorbereitungen.',
     'Kapitel 13 geschafft! +5 Sphaeren und +4 Traenke.',
     'Vor dem Finale kannst du jederzeit umkehren.'];}
  }
 }else if(n===14){
  if(id==='machinePhase'){
   if(c.machineReady)out.lines=['Die Bindungsmaschine ist abgeschaltet.'];
   else{set('machineReady',true);stage(1);
    out.lines=['Du liest die Signalfolge: WURZEL, WASSER, STERN.',
     'Du wartest die ruhige Phase ab und unterbrichst die Bindungsmaschine.',
     'Keine Reaktionspruefung: Der Weg bleibt sicher.'];}
  }else if(id==='warning')out.lines=['WARNUNG: Der Kern hat einen sicheren Rueckweg.',
   'Bereite dein Team an der Heilstation vor.'];
  else if(id.startsWith('flash')){
   if(!c.machineReady)out.lines=['Schalte zuerst die Bindungsmaschine aus.'];
   else{const i=Number(id.slice(-1));add('memories',i);stage(2);
    out.lines=[['WURZEL: Martha gab dir ein Zuhause.',
     'WASSER: Freunde hielten die Wege offen.',
     'STERN: Vater zeigte dir, wie man Abschied nimmt.'][i],
     'Erinnerungen '+tally('memories',3)];}
  }else if(id==='miraLetter'){
   out.lines=['Mira: Papa, bitte lass den Himmel offen.',
    'Liebe ist kein Schloss. Ich moechte frei sein.'];
  }else if(id==='varekFinal'){
   if(!c.memoriesReady)out.lines=['Drei Erinnerungen muessen den Kern stabilisieren.'];
   else if(c.varekWon)out.lines=['Varek: Mira wollte frei sein. Ich muss das akzeptieren.'];
   else{out.boss='varekFinal';out.lines=['Varek: Wenn ich sie loslasse, verliere ich sie fuer immer!',
    'Du: Du verlierst sie nicht, wenn du aufhoerst, sie festzuhalten.',
    'Varek tritt mit seinem letzten Echo-Team an.'];}
  }else if(id.startsWith('free')){
   if(!c.varekWon)out.lines=['Erst nach Vareks Niederlage kann die Freigabe beginnen.'];
   else{const i=Number(id.slice(-1));add('freed',i);stage(5);
    out.lines=['Freiwilliger Anker '+(i+1)+' geoeffnet.',
     'Echos duerfen bleiben oder gehen. '+tally('freed',3)];}
  }else if(id==='farewell'){
   if(c.freed.length<3)out.lines=['Vaters Notsignal haelt noch.','Oeffne die drei freiwilligen Anker.'];
   else{set('farewell',true);stage(6);
    out.lines=['Vater: Du hast den Weg gefunden, den ich nicht mehr sah.',
     form+' bleibt an deiner Seite, aus freiem Willen.',
     'Vater: Sag Martha, dass ich endlich nach Hause gefunden habe.'];}
  }else if(id==='releaseSignal'){
   if(!c.farewell)out.lines=['Vaters Abschied und die drei Freigaben fehlen.'];
   else if(c.completed)out.lines=['Alle Echos sind frei. Der Epilog wartet.'];
   else{set('completed',true);stage(8);s.main_story_finished=true;reward(6,4);
    out.lines=['Das Zwangsnetz loest sich auf. Niemand wird mehr festgehalten.',
     'Varek bleibt am Leben und uebernimmt Verantwortung.',
     'HAUPTGESCHICHTE GESCHAFFT! Der Epilog ist offen.'];}
  }else if(id==='marthaEpilogue'){set('epilogueVisited',true);
   out.lines=['Martha: Zu Hause ist, wo man wiederkommen darf.',
    'Elena waere stolz darauf, dass du deine eigenen Wege gehst.'];}
  else if(id==='friends')out.lines=['Liora, Edda, Lyra, Kael und Vex stehen am Gartentor.',
   'Die Echo-Bahn faehrt wieder. Jede Stimme entscheidet selbst.'];
  else if(id==='credits'){set('credits',true);stage(9);
   out.lines=['ECHO-CHRONIKEN - ENDE DER HAUPTGESCHICHTE',
    'Danke fuers Spielen. Deine Reise und dein Spielstand bleiben erhalten.',
    'Freie Erkundung, Monsterfang und Postgame koennen weitergehen.'];}
  else if(id==='journal')out.lines=['Dein Notizbuch enthaelt Erinnerungen, keine Kaefige.',
   'Die Reise geht weiter. 150 Wesen sind ein freiwilliges Sammelziel.'];
 }
 if(n===14&&c.memories.length===3&&!c.memoriesReady){set('memoriesReady',true);stage(3);}
 if(!out.lines.length)out.lines=['Die Erinnerung bleibt frei.'];
 return out;
}
function victory(s,which){
 const c=ensure(s,which==='shaftGuardian'?13:14);
 if(which==='shaftGuardian'&&!c.guardianWon){
  c.guardianWon=true;c.stage=Math.max(c.stage,3);
  return ['Die Schachtwache gibt die Fluchtschleuse frei.','Du kannst jederzeit zurueckkehren.'];
 }
 if(which==='varekFinal'&&!c.varekWon){
  c.varekWon=true;c.stage=Math.max(c.stage,4);
  return ['Varek senkt den Blick. Miras Stimme bleibt frei.',
   'Oeffne nun drei freiwillige Anker, ohne jemanden einzusperren.'];
 }
 return [];
}
function goal(s){
 const n=chapterOf[s.currentMapId],c=ensure(s,n);
 if(n===12){
  if(c.completed)return 'KAPITEL 12 GESCHAFFT';
  if(!c.martha)return 'SPRICH MIT MARTHA';
  if(!c.pictures.length)return 'BETRACHTE DIE FAMILIENBILDER';
  if(!c.mirror)return 'SPRICH MIT DEINEM ECHO';
  if(!c.latchOpen)return 'OEFFNE DEN SICHERHEITSVERSCHLUSS';
  if(!c.choice)return 'TRIFF DIE FREIE ENTSCHEIDUNG';
  return 'HOL DEN SCHACHTSCHLUESSEL';
 }
 if(n===13){
  if(c.completed)return 'KAPITEL 13 GESCHAFFT';
  if(c.anchors.length<3)return 'ANKER WURZEL WASSER STERN '+c.anchors.length+'/3';
  if(!c.guardianWon)return 'SICHERE DIE SCHACHTWACHE';
  if(!c.anchorsDisabled)return 'OEFFNE DIE FLUCHTSCHLEUSE';
  if(!c.fatherMet)return 'SPRICH MIT VATER';
  if(!c.protectionCode)return 'HOL DEN SCHUTZCODE';
  return 'BEREITE DAS FINALE VOR';
 }
 if(c.completed)return 'HAUPTGESCHICHTE GESCHAFFT';
 if(!c.machineReady)return 'SCHALTE DIE BINDUNGSMASCHINE AB';
 if(c.memories.length<3)return 'ERINNERUNGEN '+c.memories.length+'/3';
 if(!c.varekWon)return 'STELLE DICH VAREK';
 if(c.freed.length<3)return 'FREIE ANKER '+c.freed.length+'/3';
 if(!c.farewell)return 'HOERE VATERS ABSCHIED';
 return 'GIB ALLE ECHOS FREI';
}
function drawTile(pix,tile,sx,sy,x,y,tick,id){
 const theme=themes[id],n=(x*13+y*17+x*y)%19;
 const pal=theme==='home'?['#cbb99c','#a99378','#715f58']:
  theme==='garden'?['#85ae8b','#b8c5a1','#476b62']:
  theme==='memory'?['#9a9fbe','#c6b9d2','#5d668c']:
  theme==='shaft'?['#697f85','#9eb2ad','#354e60']:
  ['#776b94','#b7a1bc','#3d365c'];
 if(tile===1||tile===5){
  pix(sx,sy,16,16,pal[2]);pix(sx+1,sy+1,14,13,pal[0]);
  pix(sx+3,sy+3,10,3,pal[1]);pix(sx+2,sy+10,12,2,pal[2]);
  if(tile===5){pix(sx+5,sy+5,6,7,'#e6d5ad');pix(sx+7,sy+6,2,4,'#76658b');}
 }else{
  pix(sx,sy,16,16,pal[0]);pix(sx,sy,16,1,pal[1]);
  if(n<7){pix(sx+4,sy+5,3,2,pal[1]);pix(sx+11,sy+11,2,2,pal[2]);}
  if(tile===2){pix(sx+6,sy+3,4,10,'#4d8c63');pix(sx+8,sy+1,2,5,'#d8e3a9');}
  if(theme==='core'&&n<5){pix(sx+7,sy+3,2,10,'#e6b5e4');}
 }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId,m=window.EchoMaps.get(id),c=ensure(s,chapterOf[id]),theme=themes[id];
 const at=(x,y)=>[x*16-camX,y*16-camY];
 if(theme==='home'||theme==='memory'){
  for(const [x,y] of [[4,3],[18,3]]){const [u,v]=at(x,y);
   pix(u-4,v-6,48,38,'#615b79');pix(u,v+2,40,29,'#bcaeab');
   pix(u+4,v+7,8,9,'#f1d6a5');pix(u+25,v+7,8,9,'#9f7b8f');
   pix(u+16,v+17,8,12,'#6c5872');}
 }else if(theme==='shaft'||theme==='core'){
  for(const [x,y] of [[5,3],[18,3]]){const [u,v]=at(x,y);
   pix(u-5,v-4,44,36,'#344459');pix(u,v+3,35,28,'#7d8c9b');
   pix(u+4,v+8,26,3,'#d0a9a2');pix(u+12,v+14,10,14,'#3b5366');}
 }else{
  for(const [x,y] of [[5,3],[19,3]]){const [u,v]=at(x,y);
   pix(u+6,v+4,7,22,'#6b705c');pix(u,v-8,23,21,'#608d74');
   pix(u+3,v-10,17,8,'#a6c4a3');pix(u+11,v-15,5,6,'#e2dfad');}
 }
 const people=['martha','marthaEpilogue','father','shaftGuide','shaftGuard','varekFinal','friends'];
 for(const p of markers[id]){
  const [u,v]=at(p.x,p.y),type=p.type;
  if(u<-40||v<-40||u>340||v>195)continue;
  if(people.includes(type)){
   const role=type.startsWith('martha')?'grandma':type==='father'?'gym2':
    type==='varekFinal'?'gym3':type==='shaftGuard'?'jaro':'girl';
   drawChar(u,v,'#d7a9b9',0,role,'down');
  }else if(type.startsWith('anchor')||type.startsWith('free')){
   pix(u+3,v-4,10,21,'#394e68');pix(u+5,v-2,6,16,'#c6a8c8');
   pix(u+6,v+3,4,5,'#f7e3b7');
  }else if(type==='healer'){
   pix(u+2,v+2,12,14,'#496c68');pix(u+5,v+4,6,7,'#b2e7c8');
  }else{
   pix(u+2,v+3,12,12,'#534e69');pix(u+4,v+4,8,8,
    theme==='garden'?'#d6cf9c':theme==='core'?'#d7acd8':'#c9c6b8');
   pix(u+6,v+5,4,3,'#fff0c6');
  }
 }
 for(const e of m.exits){const [u,v]=at(e.x,e.y);
  if(u<-16||v<-16||u>320||v>180)continue;
  pix(u+3,v+1,10,14,'#364f63');pix(u+5,v+3,6,10,'#f0d7ac');
 }
 pix(5,5,310,19,'#293a58e8');letter(names[id],9,18,10,'#ffe5c1');
 pix(5,156,310,19,'#293a58ec');letter(goal(s),8,169,9,'#fce8c6');
}
function drawRegionMap(ctx,s){
 const m=window.EchoMaps.get(s.currentMapId),scale=Math.min(275/m.width,124/m.height,9);
 const left=(320-m.width*scale)/2,top=29;
 ctx.fillStyle='#1c304b';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#ffe6c2';ctx.font='bold 12px monospace';ctx.fillText(names[s.currentMapId],9,19);
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){
  ctx.fillStyle=m.tiles[y][x]===1?'#3a5364':m.tiles[y][x]===5?'#6b7d8c':
   m.tiles[y][x]===2?'#6a9d7c':'#b0b6b6';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
 }
 ctx.fillStyle='#ffed9d';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',11,173);
}
window.EchoFinale=Object.freeze({chapters,names,themes,chapterOf,markers,register,
 ensure,access,regionMove,interact,victory,goal,drawTile,draw,drawRegionMap});
})();
