/* Echo-Chroniken chapters 6-8. Additive maps, quests and saves, no legacy edits. */
(()=>{
'use strict';
const blocked=new Set([1,4,5,7]);
const chapters={
 6:{key:'chapter6',label:'GLUT UNTER DER ASCHE',color:'#c8855e',maps:[
  ['ashrail_approach','ASCHEWEG','ash',25,18],
  ['aschenruh_town','ASCHENRUH','ash',26,19],
  ['glut_forge','ALTE SCHMIEDE','forge',23,17],
  ['glut_chasm','GLUTSCHACHT','forge',25,18]]},
 7:{key:'chapter7',label:'DER GARTEN DER NAMEN',color:'#a2d9b1',maps:[
  ['garden_road','LICHTERPFAD','garden',25,18],
  ['lichterhain_grove','LICHTERHAIN','garden',26,19],
  ['name_library','NAMENSARCHIV','library',23,17],
  ['echo_garden','ECHO-GARTEN','garden',25,18]]},
 8:{key:'chapter8',label:'KRONENSTADT',color:'#c5b5df',maps:[
  ['capital_outer_gate','STADTTOR','capital',25,18],
  ['kronenstadt_upper','KRONENSTADT','capital',26,19],
  ['central_archive','ZENTRALARCHIV','library',23,17],
  ['station_kronenstadt','BAHNHOF KRONENSTADT','station',25,17],
  ['research_hall','FORSCHUNGSHOF','library',23,17]]}
};
const names={},themes={},chapterOf={};const nodes=new Map();
for(const [num,chapter] of Object.entries(chapters)){
 for(const [id,name,theme,w,h] of chapter.maps){
  names[id]=name;themes[id]=theme;chapterOf[id]=Number(num);
  nodes.set(id,{mapId:id,w,h,theme,spawns:{},exits:[]});
 }
}
function connection(a,aid,ax,ay,asp,ap,b,bid,bx,by,bsp,bp,gate){
 const left=nodes.get(a),right=nodes.get(b);
 if(!left||!right)throw Error('Unknown story map connection');
 left.spawns[asp]=ap;right.spawns[bsp]=bp;
 left.exits.push({exitId:aid,x:ax,y:ay,toMapId:b,toSpawnId:bsp,returnExitId:bid,...(gate?{requiredFlag:gate}:{})});
 right.exits.push({exitId:bid,x:bx,y:by,toMapId:a,toSpawnId:asp,returnExitId:aid});
}
connection('ashrail_approach','to_ash_town',23,9,'from_town',{x:22,y:9},
 'aschenruh_town','to_ash_road',1,9,'from_road',{x:2,y:9});
connection('aschenruh_town','to_glut_forge',24,7,'from_forge',{x:23,y:7},
 'glut_forge','to_ash_town',1,7,'from_town',{x:2,y:7});
connection('glut_forge','to_glut_chasm',21,13,'from_chasm',{x:20,y:13},
 'glut_chasm','to_glut_forge',1,8,'from_forge',{x:2,y:8});
connection('garden_road','to_grove',23,9,'from_grove',{x:22,y:9},
 'lichterhain_grove','to_garden_road',1,9,'from_road',{x:2,y:9});
connection('lichterhain_grove','to_name_library',24,6,'from_library',{x:23,y:6},
 'name_library','to_grove',1,7,'from_grove',{x:2,y:7});
connection('lichterhain_grove','to_echo_garden',24,12,'from_garden',{x:23,y:12},
 'echo_garden','to_grove',1,9,'from_grove',{x:2,y:9});
connection('capital_outer_gate','to_upper',23,9,'from_upper',{x:22,y:9},
 'kronenstadt_upper','to_gate',1,9,'from_gate',{x:2,y:9});
connection('kronenstadt_upper','to_archive',24,6,'from_archive',{x:23,y:6},
 'central_archive','to_upper',1,7,'from_upper',{x:2,y:7});
connection('kronenstadt_upper','to_station',24,12,'from_station',{x:23,y:12},
 'station_kronenstadt','to_upper',1,9,'from_upper',{x:2,y:9});
connection('kronenstadt_upper','to_research',12,17,'from_research',{x:12,y:16},
 'research_hall','to_upper',11,1,'from_upper',{x:11,y:2});
connection('glut_chasm','to_garden_road',23,9,'from_garden',{x:22,y:9},
 'garden_road','to_glut_chasm',1,9,'from_chasm',{x:2,y:9},'chapter6.completed');
connection('echo_garden','to_capital',23,9,'from_capital',{x:22,y:9},
 'capital_outer_gate','to_echo_garden',1,9,'from_garden',{x:2,y:9},'chapter7.completed');
nodes.get('ashrail_approach').spawns.from_stillwasser={x:2,y:9};
nodes.get('ashrail_approach').exits.push({exitId:'to_stillwasser',x:1,y:9,
 toMapId:'station_stillwasser',toSpawnId:'from_ashroad',returnExitId:'to_ashroad'});
nodes.get('station_kronenstadt').spawns.platform={x:12,y:12};
const markers={
 ashrail_approach:[['sign',9,6],['cairn',17,12]],
 aschenruh_town:[['edda',8,6],['ledger0',16,6],['ledger1',17,12],['healer',9,12],['apprentice',5,12]],
 glut_forge:[['ledger2',6,5],['worker0',10,5],['worker1',15,5],
  ['valve1',7,10],['valve3',14,10],['vent',17,11],['valve2',11,12],['casing',17,6]],
 glut_chasm:[['worker2',8,6],['foreman',13,6],['smelter',16,10],['core',19,10],['tool',13,12]],
 garden_road:[['sign',9,6],['memory',16,12]],
 lichterhain_grove:[['nalia',8,6],['ritual0',13,5],['ritual1',18,9],['ritual2',12,12],['healer',6,12]],
 name_library:[['story0',6,5],['story1',11,5],['story2',16,5],['fatherMap',16,10],['ancestor',7,11]],
 echo_garden:[['hunter',8,6],['stoneWASSER',7,11],['stoneWURZEL',11,11],
  ['stoneFLAMME',15,11],['stoneLICHT',19,11],['nameShadow',16,5],['trace',20,5]],
 capital_outer_gate:[['sign',9,6],['vendor',15,12]],
 kronenstadt_upper:[['citizen0',7,5],['citizen1',17,5],['archiveSign',20,8],
  ['statue',12,10],['healer',7,13]],
 central_archive:[['document0',6,5],['document1',11,5],['document2',16,5],
  ['archivist',11,10],['recording',17,11],['index',6,11],
  ['year0',6,9],['year2',10,9],['year1',14,9]],
 station_kronenstadt:[['train',12,8],['stationMaster',7,8]],
 research_hall:[['varek',11,5],['guard',16,10],['pass',7,10],['critic',11,12]]
};
for(const [id,arr] of Object.entries(markers))markers[id]=arr.map(([type,x,y])=>({type,x,y}));
function tiles(node){
 const {w,h,theme}=node;
 const inside=['forge','library','station'].includes(theme);
 const t=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
  if(x===0||y===0||x===w-1||y===h-1)return 1;
  const n=(x*13+y*17+x*y*7)%37;
  return !inside&&(theme==='garden'?n%7===3:n===3)?2:3;
 }));
 if(!inside){
  for(const [x0,y0,x1,y1] of [[4,3,6,5],[w-8,3,w-6,5]]){
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)t[y][x]=5;
  }
 }
 for(let y=7;y<=Math.min(13,h-2);y++)for(let x=1;x<w-1;x++)t[y][x]=3;
 for(let x=1;x<w-1;x++)for(let y=1;y<h-1;y++)if(x===Math.floor(w/2))t[y][x]=3;
 for(const p of [...Object.values(node.spawns),...node.exits,...(markers[node.mapId]||[])]){
  for(let yy=p.y-1;yy<=p.y+1;yy++)for(let xx=p.x-1;xx<=p.x+1;xx++)
   if(xx>0&&xx<w-1&&yy>0&&yy<h-1)t[yy][xx]=3;
 }
 return t;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('station_stillwasser'))throw Error('Chapter 5 required before Chapters 6-8');
 r.addSpawn('station_stillwasser','from_ashroad',{x:20,y:9});
 r.addExit('station_stillwasser',{exitId:'to_ashroad',x:21,y:9,
  toMapId:'ashrail_approach',toSpawnId:'from_stillwasser',
  returnExitId:'to_stillwasser',requiredFlag:'chapter5.completed'});
 for(const n of nodes.values())r.register({mapId:n.mapId,tiles:tiles(n),spawns:n.spawns,exits:n.exits});
 return r.validateNetwork();
}
const defaults={
 6:()=>({stage:0,ledgers:[],workers:[],valves:[],vented:false,casing:false,
  eddaConfessed:false,smelterWon:false,coreWon:false,resonance_tool:false,
  completed:false,rewardClaimed:false,apprentice:false,errors:0}),
 7:()=>({stage:0,rituals:[],stories:[],naliaTrusted:false,hunterWon:false,
  stones:[],shadowWon:false,fatherMap:false,echoTrace:false,
  capital_archive_key:false,completed:false,rewardClaimed:false,errors:0}),
 8:()=>({stage:0,documents:[],years:[],varekMet:false,archivistTrusted:false,
  recording:false,guardWon:false,citizens:[],frost_pass:false,
  completed:false,rewardClaimed:false,errors:0})
};
function ensure(s,n){
 for(const number of [6,7,8]){
  const key='chapter'+number,def=defaults[number]();
  if(!s[key]||typeof s[key]!=='object'||Array.isArray(s[key]))s[key]=def;
  const c=s[key];
  for(const [k,v] of Object.entries(def))if(c[k]===undefined)c[k]=Array.isArray(v)?[]:v;
  for(const [k,v] of Object.entries(def))if(Array.isArray(v)&&!Array.isArray(c[k]))c[k]=[];
 }
 return n?s['chapter'+n]:s;
}
function access(s,id){
 if(id==='to_ashroad'&&!s.chapter5?.completed)return ['Der Weg nach Aschenruh ist gesperrt.','Befreie zuerst Stillwasser.'];
 if(id==='to_garden_road'&&!s.chapter6?.completed)return ['Die Glutklamm versperrt den Hain.','Rette die Arbeiter und sichere die Schmiede.'];
 if(id==='to_capital'&&!s.chapter7?.completed)return ['Das Stadttor verlangt den Archivschluessel.','Erforsche den Garten der Namen.'];
 return null;
}
function regionMove(s,dx,dy){
 const m=window.EchoMaps.get(s.currentMapId);
 if(!m||!names[s.currentMapId])return {handled:false};
 const x=s.player.x+dx,y=s.player.y+dy;
 if(x<0||y<0||x>=m.width||y>=m.height)return {handled:true};
 const exit=window.EchoMaps.getExitAt(m.mapId,x,y);
 if(exit){
  const denied=access(s,exit.exitId);
  if(denied)return {handled:true,lines:denied};
  if(window.EchoMaps.travel(s,exit.exitId))return {handled:true,travel:true,lines:[names[s.currentMapId]]};
  return {handled:true,lines:['Dieser Weg ist noch nicht frei.']};
 }
 if(blocked.has(m.tiles[y][x])||(markers[m.mapId]||[]).some(p=>p.x===x&&p.y===y))return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:m.tiles[y][x]===2,
  rare:!!(s.chapter7?.echoTrace&&themes[m.mapId]==='garden'&&m.tiles[y][x]===2&&(x*7+y*11)%9===0)};
}
function interact(s,tx,ty){
 const n=chapterOf[s.currentMapId];if(!n)return {lines:['Hier ist kein Echo zu hoeren.']};
 const c=ensure(s,n),points=markers[s.currentMapId]||[];
 const p=points.find(v=>v.x===tx&&v.y===ty)||points.find(v=>v.x===s.player.x&&v.y===s.player.y);
 if(!p)return {lines:['Ein stiller Ort. Der Weg ist frei.']};
 const out={changed:false,lines:[]},id=p.type;
 const set=(k,v)=>{if(c[k]!==v){c[k]=v;out.changed=true;}};
 const add=(k,v)=>{if(!c[k].includes(v)){c[k].push(v);out.changed=true;}};
 const stage=v=>set('stage',Math.max(c.stage,v));
 const count=(k,total)=>c[k].length+'/'+total;
 const heal=()=>{for(const member of s.team||[])member.hp=member.maxHp;out.changed=true;};
 if(id==='healer'){heal();out.lines=['Die Ruhebank heilt dein gesamtes Team.','Hier darfst du jederzeit ausruhen.'];}
 else if(id==='sign')out.lines=[names[s.currentMapId],n===6?'Vorsicht: Die Schmiede steht unter Druck.':n===7?'Ein Name ist keine Kette.':'Kronenstadt: Wer die Wahrheit sucht, geht ins Archiv.'];
 else if(n===6){
  if(id==='cairn')out.lines=['Die Steine tragen den Stempel von Eddas alter Werkstatt.','Im Aschenruh liegen noch die Lieferbuecher.'];
  else if(id==='edda'){
   if(c.casing){
    set('eddaConfessed',true);stage(5);
    out.lines=['Edda: Ich habe die ersten Kapselgehaeuse geschmiedet.','Der Vater baute eine Tuer, die ein Echo selbst oeffnen kann.','Varek machte daraus ein Schloss. Ich haette frueher reden muessen.'];
   }else{
    stage(1);
    out.lines=['Edda: Das Kontinuum hat meine Werkstatt uebernommen.','Suche drei Seriennummern und rette die drei Arbeiter.','Am Ofen: Regler 1 und 3, Druck ablassen, dann Regler 2.'];
   }
  }else if(id.startsWith('ledger')){
   const i=Number(id.slice(-1));add('ledgers',i);
   const lines=[
    'Lieferbuch 001: Schutzkapseln sollten von innen zu oeffnen sein.',
    'Lieferbuch 019: Varek forderte den Einbau eines Zwangsankers.',
    'Lieferbuch 027: Edda verweigerte die letzte Aenderung.'
   ];
   out.lines=[lines[i],'Seriennummern: '+count('ledgers',3)];
   if(c.ledgers.length===3)stage(2);
  }else if(id.startsWith('worker')){
   const i=Number(id.slice(-1));
   if(c.ledgers.length<3)out.lines=['Der Arbeiter versteckt sich hinter der verschlossenen Schutztuer.','Die drei Seriennummern verraten den Sicherheitscode.'];
   else{
    add('workers',i);stage(3);
    out.lines=[['Nera: Ich dachte, niemand wuerde uns finden.','Bo: Der Ofen singt falsch.','Tamo: Im Schacht lebt ein Echo, das sich nicht loesen kann.'][i],
      'Arbeiter in Sicherheit: '+count('workers',3)];
   }
  }else if(id==='foreman')out.lines=['Vorarbeiter: Erst die Menschen retten, dann die Maschinen.','Der Ofen braucht Regler 1 und 3, danach den Druckablass, zuletzt Regler 2.'];
  else if(id==='valve1'||id==='valve3'){
   const v=Number(id.slice(-1));add('valves',v);
   out.lines=['Hitzeregler '+v+' geoeffnet.','Geoeffnete Vorregler: '+count('valves',2)];
  }else if(id==='vent'){
   if(!c.valves.includes(1)||!c.valves.includes(3))out.lines=['Der Hauptdruck ist zu hoch.','Oeffne zuerst Hitzeregler 1 und 3.'];
   else{set('vented',true);out.lines=['Der Druck entweicht durch das Sicherheitsrohr.','Jetzt kann Regler 2 gefahrlos geoeffnet werden.'];}
  }else if(id==='valve2'){
   if(!c.vented){
    set('errors',c.errors+1);
    out.lines=['Regler 2 wuerde den Ofen zerreissen.','Hinweis: 1 + 3, Druck ablassen, dann 2.'];
   }else{add('valves',2);stage(4);out.lines=['Regler 2 stabilisiert den Ofen.','Die Schmelze ist jetzt gefahrlos zugaenglich.'];}
  }else if(id==='casing'){
   if(c.workers.length<3||!c.valves.includes(2))out.lines=['Das Kapselgehaeuse liegt im heissen Ofen.','Rette alle drei Arbeiter und kuehle den Ofen mit den Reglern.'];
   else{set('casing',true);stage(5);out.lines=['Du sicherst das Resonanzgehaeuse.','Auf der Innenseite steht: FREIWILLIG.','Zeige Edda das Gehaeuse in Aschenruh.'];}
  }else if(id==='smelter'){
   if(c.smelterWon)out.lines=['Schmelzmeister: Die Schmiede gehoert wieder den Arbeitern.'];
   else if(!c.eddaConfessed)out.lines=['Schmelzmeister: Ihr versteht die Technik nicht.','Findet erst die Wahrheit in Eddas Lieferbuechern.'];
   else{out.boss='smelter';out.lines=['Schmelzmeister: Ohne Zwang gibt es keine Sicherheit!','Sein Flammengeist stellt sich dir in den Weg.'];}
  }else if(id==='core'){
   if(c.coreWon)out.lines=['Der Ofenkern pulsiert jetzt ruhig.'];
   else if(!c.smelterWon)out.lines=['Der instabile Kern wird vom Schmelzmeister bewacht.'];
   else{out.boss='core';out.lines=['Der Ofenkern ist ausser Kontrolle!','Eine letzte Resonanzentladung droht.'];}
  }else if(id==='tool'){
   if(c.completed)out.lines=['Das Resonanzwerkzeug kann freiwillige Anker loesen.','Kapitel 6 ist abgeschlossen.'];
   else if(!c.coreWon)out.lines=['Das Werkzeug steckt noch im Resonanzkern.','Besiege zuerst den Schmelzmeister und den Ofenkern.'];
   else{
    set('resonance_tool',true);set('completed',true);stage(7);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+3;s.potions=(s.potions||0)+2;}
    out.lines=['Du erhaeltst Eddas RESONANZWERKZEUG.','Es loest freiwillige Anker, aber keine Storyschloesser.','Kapitel 6 geschafft! +3 Sphaeren, +2 Traenke.'];
   }
  }else if(id==='apprentice'){
   if(!c.apprentice){set('apprentice',true);out.lines=['Lehrling: Mein Opa schrieb auf jede Kapsel einen Namen.','Danke, dass du nicht nur nach Metall gefragt hast.'];}
   else out.lines=['Lehrling: Seine Geschichte bleibt, auch ohne die Maschine.'];
  }
 }else if(n===7){
  if(id==='memory')out.lines=['Im Wind klingt eine Stimme: Erinnere dich an mich, aber halte mich nicht fest.'];
  else if(id==='nalia'){
   if(c.rituals.length<3)out.lines=['Nalia: Beobachte drei freiwillige Erinnerungsrituale.','Kein Echo muss bleiben, um geliebt zu werden.','Rituale: '+count('rituals',3)];
   else{set('naliaTrusted',true);stage(2);out.lines=['Nalia: Du hast gesehen, dass jedes Echo selbst waehlt.','Vergleiche die drei Geschichten im Namensarchiv.'];}
  }else if(id.startsWith('ritual')){
   const i=Number(id.slice(-1));add('rituals',i);stage(1);
   out.lines=[['Ein Echo verabschiedet sich mit einem leisen Lied.','Ein Echo ruht freiwillig im Licht.','Ein Echo zieht weiter, ohne gefangen zu werden.'][i],
    'Beobachtete Rituale: '+count('rituals',3)];
  }else if(id.startsWith('story')){
   const i=Number(id.slice(-1));add('stories',i);stage(3);
   out.lines=[['Eine Mutter hinterliess ihren Kindern ein Lied.','Ein Wanderer gab sein Zuhause auf, um frei zu sein.','Ein Schmied rettete Menschen, nicht Gegenstaende.'][i],
    'Verglichene Geschichten: '+count('stories',3)];
  }else if(id==='ancestor')out.lines=['Ein alter Name ist eingeritzt.','Drei lebende Familien erinnern sich unterschiedlich an ihn.','Keine Erinnerung ist eine Besitzurkunde.'];
  else if(id==='hunter'){
   if(c.hunterWon)out.lines=['Der Kontinuum-Jaeger ist fort. Das Echo bleibt frei.'];
   else if(!c.naliaTrusted||c.stories.length<3)out.lines=['Der Jaeger stellt Fallen im Garten.','Nalia und das Archiv kennen den Weg, sie zu umgehen.'];
   else{out.boss='hunter';out.lines=['Kontinuum-Jaeger: Jedes Echo muss registriert werden!','Du verteidigst ein freies Echo.'];}
  }else if(id.startsWith('stone')){
   const name=id.slice(5),order=['WASSER','WURZEL','FLAMME','LICHT'];
   if(!c.hunterWon)out.lines=['Die Namenssteine reagieren noch auf die Fallen des Jaegers.'];
   else if(c.stones.includes(name))out.lines=['Der Stein '+name+' leuchtet bereits.','Reihenfolge: WASSER, WURZEL, FLAMME, LICHT.'];
   else if(order[c.stones.length]!==name){
    set('errors',c.errors+1);
    out.lines=['Die Steine summen in falscher Reihenfolge.','Hinweis: WASSER, WURZEL, FLAMME, LICHT.','Bereits aktivierte Steine bleiben erhalten.'];
   }else{
    add('stones',name);stage(5);
    out.lines=['Der Namensstein '+name+' erstrahlt.','Namenssteine: '+count('stones',4)];
   }
  }else if(id==='nameShadow'){
   if(c.shadowWon)out.lines=['Der Namensschatten ist verschwunden.'];
   else if(c.stones.length<4)out.lines=['Die Namenstuer ist versiegelt.','Aktiviere vier Steine: WASSER, WURZEL, FLAMME, LICHT.'];
   else{out.boss='shadow';out.lines=['Der Namensschatten bewacht Vaters Karte.','Er prueft, ob du ohne Zwang kaempfen kannst.'];}
  }else if(id==='fatherMap'){
   if(!c.shadowWon)out.lines=['Die Karte liegt hinter dem Namensschatten.'];
   else{set('fatherMap',true);stage(6);out.lines=['Vaters Namenskarte zeigt das Zentralarchiv in Kronenstadt.','Notiz: Nicht jede Seele laesst sich mit einer Zahl beschreiben.'];}
  }else if(id==='trace'){
   if(!c.fatherMap)out.lines=['Die Echo-Spuren bleiben undeutlich.','Finde zuerst Vaters Namenskarte.'];
   else if(c.completed)out.lines=['Echo-Spuren sind aktiv. Seltene Spuren leuchten im Hain.'];
   else{
    set('echoTrace',true);set('capital_archive_key',true);set('completed',true);stage(7);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+3;}
    out.lines=['Nalia lehrt dich, freiwillige Echo-Spuren zu erkennen.','Die Karte markiert nun seltene Spuren im Lichterhain.','Kapitel 7 geschafft! Archivschluessel +3 Sphaeren.'];
   }
  }
 }else if(n===8){
  if(id==='vendor')out.lines=['Haendlerin: Die Bahn bringt viele Besucher.','Aber manche Echos wollen die Stadt lieber verlassen.'];
  else if(id==='archiveSign')out.lines=['ZENTRALARCHIV: Drei Dokumente und ein Registerindex.'];
  else if(id==='statue')out.lines=['Ein Denkmal fuer Projekt Permanenz.','Die Namen der freiwilligen Helfer fehlen.'];
  else if(id.startsWith('document')){
   const i=Number(id.slice(-1));add('documents',i);stage(2);
   out.lines=[['Akte 14: Das erste Netz hatte einen freiwilligen Ausgang.','Akte 21: Varek liess die Ausgaenge verriegeln.','Akte 30: Die fehlende Tonspur wurde absichtlich entfernt.'][i],
    'Dokumente: '+count('documents',3)];
  }else if(id==='index'){
   out.lines=['Archivindex: Ordne die drei Jahrgaenge.','Die Eintraege stehen in der Folge 14, 30, 21.','Bisher: '+(c.years.join(' - ')||'leer')];
  }else if(id.startsWith('year')){
   const year=Number(id.slice(4)),order=[0,2,1];
   if(c.years.length===3)out.lines=['Der Index ist bereits entschluesselt: 14, 30, 21.'];
   else if(year!==order[c.years.length]){
    set('errors',c.errors+1);
    out.lines=['Der Index reagiert nicht.','Die Jahresfolge ist 14, 30, 21.','Vorherige Eintraege bleiben erhalten.'];
   }else{add('years',year);out.lines=['Jahrgang '+[14,21,30][year]+' entschluesselt.','Index: '+count('years',3)];}
  }else if(id==='varek'){
   if(c.documents.length<3||c.years.length<3)out.lines=['Varek: Du hast die halbe Geschichte gelesen.','Suche die drei Akten und ordne die Jahrgaenge im Zentralarchiv.'];
   else{
    set('varekMet',true);stage(4);
    out.lines=['Varek: Ich will, dass niemand je wieder Abschied nehmen muss.','Du kennst Elena. Warum willst du Erinnerungen verlieren?','Miora stellt sich schuetzend vor dich. Du gibst das Buch nicht ab.'];
   }
  }else if(id==='archivist'){
   set('archivistTrusted',true);
   out.lines=['Archivarin: Vareks Rede wurde zusammengeschnitten.','Das fehlende Ende der Tonspur liegt im Archiv.','Nicht jeder, der bleiben kann, will bleiben.'];
  }else if(id==='recording'){
   if(!c.varekMet||!c.archivistTrusted)out.lines=['Die Tonspur ist gesperrt.','Sprich mit Varek und der Archivarin.'];
   else{
    set('recording',true);stage(5);
    out.lines=['Vaters Stimme: Schutz muss jederzeit freiwillig sein.','Jedes Echo darf selbst entscheiden, ob es bleibt.','Die Tonspur entlarvt Vareks unvollstaendige Rede.'];
   }
  }else if(id==='guard'){
   if(c.guardWon)out.lines=['Der Archivwaechter hat die Bahnhalle freigegeben.'];
   else if(!c.recording)out.lines=['Archivwaechter: Ohne die vollstaendige Tonspur bleibt das Tor zu.'];
   else{out.boss='guard';out.lines=['Kontinuum-Archivwaechter: Diese Aufnahme gehoert uns!','Du verteidigst die Beweise.'];}
  }else if(id.startsWith('citizen')){
   const i=Number(id.slice(-1));add('citizens',i);
   out.lines=i===0?['Buergerin: Das Netz hat mir bei meiner Trauer geholfen.','Ich moechte es freiwillig nutzen duerfen.']:
    ['Buerger: Die Maschinen duerfen niemanden festhalten.','Hilfe ist nur Hilfe, wenn man Nein sagen darf.'];
  }else if(id==='critic')out.lines=['Forscherin: Eine Stadt darf sich streiten, ohne jemanden zu bestrafen.','Fuer den Frostgrat brauchen wir eine sichere Phasenlaterne.'];
  else if(id==='pass'){
   if(c.completed)out.lines=['Frostgrat-Pass und Laternenbauplan sind im Reisebuch.','Kapitel 8 ist abgeschlossen.'];
   else if(!c.guardWon||c.citizens.length<2)out.lines=['Der Frostgrat-Pass liegt unter Verschluss.','Vertreibe den Archivwaechter und hoere beide Stimmen am Markt.'];
   else{
    set('frost_pass',true);set('completed',true);stage(8);
    if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+4;s.potions=(s.potions||0)+2;}
    out.lines=['Du erhaeltst den FROSTGRAT-PASS und den PHASENLATERNEN-BAUPLAN.','Die Echo-Bahn nach Kronenstadt ist jetzt offen.','Kapitel 8 geschafft! +4 Sphaeren, +2 Traenke.'];
   }
  }else if(id==='train'){
   if(!c.completed)out.lines=['Die Bahnhalle wartet auf die Freigabe des Archivwaechters.'];
   else{out.rail=true;out.lines=['Willkommen am Bahnknoten Kronenstadt.'];}
  }else if(id==='stationMaster')out.lines=['Stationshueter: Alle freigegebenen Zuege sind kostenlos.','Die Rueckfahrt nach Stillwasser bleibt jederzeit moeglich.'];
 }
 if(!out.lines.length)out.lines=['Die Spuren fuehren dich weiter.'];
 return out;
}
function victory(s,which){
 const num=which==='smelter'||which==='core'?6:which==='hunter'||which==='shadow'?7:which==='guard'?8:0;
 if(!num)return [];
 const c=ensure(s,num);
 if(which==='smelter'&&!c.smelterWon){c.smelterWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Schmelzmeister gibt die Schmiede frei.','Ein instabiler Ofenkern muss noch beruhigt werden.'];}
 if(which==='core'&&!c.coreWon){c.coreWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Ofenkern wird still.','Das Resonanzwerkzeug liegt im Schacht bereit.'];}
 if(which==='hunter'&&!c.hunterWon){c.hunterWon=true;c.stage=Math.max(c.stage,4);
  return ['Der Jaeger laesst das freie Echo ziehen.','Die vier Namenssteine koennen nun aktiviert werden.'];}
 if(which==='shadow'&&!c.shadowWon){c.shadowWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Namensschatten weicht.','Vaters Karte kann im Archiv gelesen werden.'];}
 if(which==='guard'&&!c.guardWon){c.guardWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Archivwaechter gibt den Bahnknoten frei.','Die Stimmen am Markt sollen gehoert werden.'];}
 return [];
}
function goal(s){
 const n=chapterOf[s.currentMapId],c=ensure(s,n);
 if(n===6){
  if(c.completed)return 'KAPITEL 6 GESCHAFFT';
  if(c.ledgers.length<3)return 'SERIENNUMMERN '+c.ledgers.length+'/3';
  if(c.workers.length<3)return 'RETTE ARBEITER '+c.workers.length+'/3';
  if(!c.valves.includes(2))return 'OFEN: 1 + 3, DRUCK, 2';
  if(!c.casing)return 'BERGE DAS KAPSELGEHAEUSE';
  if(!c.eddaConfessed)return 'SPRICH MIT EDDA';
  if(!c.smelterWon)return 'BESIEGE DEN SCHMELZMEISTER';
  if(!c.coreWon)return 'BERUHIGE DEN OFENKERN';
  return 'HOLE DAS RESONANZWERKZEUG';
 }
 if(n===7){
  if(c.completed)return 'KAPITEL 7 GESCHAFFT';
  if(c.rituals.length<3)return 'ERINNERUNGSRITUALE '+c.rituals.length+'/3';
  if(!c.naliaTrusted)return 'SPRICH MIT NALIA';
  if(c.stories.length<3)return 'NAMENSGESCHICHTEN '+c.stories.length+'/3';
  if(!c.hunterWon)return 'SCHUETZE DAS FREIE ECHO';
  if(c.stones.length<4)return 'NAMENSSTEINE '+c.stones.length+'/4';
  if(!c.shadowWon)return 'BESIEGE DEN NAMENSSCHATTEN';
  if(!c.fatherMap)return 'FINDE VATERS NAMENSKARTE';
  return 'ERLERNE DIE ECHO-SPUREN';
 }
 if(c.completed)return 'KAPITEL 8 GESCHAFFT';
 if(c.documents.length<3)return 'ARCHIVAKTEN '+c.documents.length+'/3';
 if(c.years.length<3)return 'ORDNE ARCHIVINDEX 14,30,21';
 if(!c.varekMet)return 'SPRICH MIT VAREK';
 if(!c.archivistTrusted)return 'FRAGE DIE ARCHIVARIN';
 if(!c.recording)return 'FINDE DIE FEHLENDE TONSPUR';
 if(!c.guardWon)return 'VERTREIBE DEN ARCHIVWAECHTER';
 if(c.citizens.length<2)return 'HOERE BEIDE MARKTSTIMMEN';
 return 'HOLE DEN FROSTGRAT-PASS';
}
function drawTile(pix,tile,sx,sy,x,y,tick,id){
 const theme=themes[id],n=(x*17+y*23+x*y)%11,wall=tile===1||tile===5;
 if(wall){
  const palette=theme==='ash'||theme==='forge'?['#493f48','#82645d','#a78467']:
   theme==='garden'?['#284b43','#64896a','#a4b783']:
   theme==='capital'?['#414e64','#8991a4','#b9b0ac']:['#374957','#778b92','#c1b9a4'];
  pix(sx,sy,16,16,palette[0]);pix(sx+1,sy+1,14,12,palette[1]);
  pix(sx+2,sy+2,12,2,palette[2]);pix(sx+1,sy+8,14,1,palette[0]);
  if(tile===5){pix(sx+3,sy+5,10,6,palette[0]);pix(sx+5,sy+6,6,4,'#e2bb8e');}
  return;
 }
 if(theme==='ash'){
  pix(sx,sy,16,16,tile===2?'#69635a':'#9c8874');
  pix(sx+2,sy+3,6,2,'#b39a81');pix(sx+11,sy+11,4,2,'#6e6a68');
  if(n<3){pix(sx+6,sy+7,3,2,'#c0a180');pix(sx+8,sy+5,2,2,'#e7bb82');}
  if(tile===2){pix(sx+5,sy+4,2,8,'#6c6252');pix(sx+8,sy+2,2,9,'#a7795b');}
 }else if(theme==='forge'){
  pix(sx,sy,16,16,'#777b80');pix(sx,sy,16,1,'#aeb0aa');pix(sx,sy,1,16,'#535d65');
  pix(sx+4,sy+4,3,2,'#b5a69c');pix(sx+12,sy+12,3,2,'#4e5864');
  if(n===2)pix(sx+8,sy+7,3,3,'#d58b58');
 }else if(theme==='garden'){
  pix(sx,sy,16,16,tile===2?'#416d56':'#709b7c');
  pix(sx+1,sy+1,14,2,'#8cb68b');pix(sx+3,sy+11,6,2,'#4e7d69');
  if(n<3){
   pix(sx+6,sy+5,2,7,'#396a5d');
   pix(sx+3,sy+3,5,4,n%2?'#e6c5dc':'#f4d8a2');
   pix(sx+8,sy+4,4,4,n%2?'#b5cbe7':'#f2d6a7');
   pix(sx+6,sy+5,2,2,'#fdf1cb');
  }else if(n<7){pix(sx+5,sy+6,2,6,'#4d8465');pix(sx+9,sy+10,4,2,'#9ac79b');}
  if(tile===2){pix(sx+12,sy+3,2,10,'#345a51');pix(sx+10,sy+5,5,3,'#a8c7a2');}
 }else if(theme==='capital'){
  pix(sx,sy,16,16,'#9e9aa4');pix(sx,sy,16,1,'#c2b5b1');
  pix(sx+1,sy+7,14,1,'#6b788c');pix(sx+7,sy+1,1,7,'#7b8493');
  pix(sx+4,sy+12,3,2,'#b7b1a9');
  if(tile===2){pix(sx+6,sy+4,4,9,'#60887b');pix(sx+3,sy+3,9,4,'#a3c4a6');}
 }else{
  pix(sx,sy,16,16,'#858e9c');pix(sx,sy,16,1,'#b7b9b7');
  pix(sx,sy,1,16,'#526b79');pix(sx+13,sy+5,2,2,'#526b79');
  if(n===3)pix(sx+6,sy+8,3,2,'#d0c5a9');
 }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId,n=chapterOf[id],c=ensure(s,n),theme=themes[id];
 const at=(x,y)=>[x*16-camX,y*16-camY];
 const sign=(x,y,color)=>{
  const [u,v]=at(x,y);
  pix(u+2,v+4,12,9,'#374a58');pix(u+4,v+5,8,6,color);
  pix(u+6,v+6,3,2,'#fff0c6');
 };
 if(id==='aschenruh_town'){
  for(const [x,y] of [[4,4],[17,4],[4,14],[18,14]]){
   const [u,v]=at(x,y);
   pix(u-5,v+3,52,41,'#594d50');pix(u,v+8,43,34,'#c3a38d');
   pix(u-8,v+2,58,13,'#624d53');pix(u-4,v-2,50,11,'#8e6562');
   pix(u+7,v+20,9,11,'#7f9a9b');pix(u+29,v+20,8,11,'#7f9a9b');
   pix(u+19,v+29,10,13,'#4e4851');pix(u+21,v+33,3,3,'#e7c18a');
   pix(u+34,v-15,8,18,'#60565b');pix(u+33,v-18,10,4,'#b38e76');
  }
 }
 if(theme==='ash'){
  for(const [x,y] of [[7,4],[18,12],[21,5]]){
   const [u,v]=at(x,y);
   pix(u+7,v+5,2,8,'#55545b');pix(u+4,v+4,7,4,'#a8896d');
   pix(u+7,v+2+Math.sin(tick*.003+x)*2,3,2,'#e5a575');
  }
 }else if(theme==='forge'){
  for(const [x,y] of [[4,5],[15,5]]){
   const [u,v]=at(x,y);
   pix(u,v,38,26,'#364954');pix(u+3,v+3,32,19,'#886f69');
   pix(u+8,v+10,19,10,'#d58c58');pix(u+12,v+12,12,6,'#f5c17c');
   pix(u+16,v-5,5,12,'#53616c');
  }
 }else if(theme==='garden'){
  for(const [x,y] of [[5,6],[18,6],[10,14]]){
   const [u,v]=at(x,y);
   pix(u+4,v-9,9,24,'#416f61');pix(u-2,v-11,22,12,'#4b846a');
   pix(u+2,v-14,16,7,'#9dbb8c');pix(u+5,v-15,4,3,'#e9c8d5');
  }
 }else if(theme==='capital'){
  for(const [x,y] of [[5,5],[18,5],[5,13]]){
   const [u,v]=at(x,y);
   pix(u-3,v-4,51,39,'#44536b');pix(u,v+7,45,29,'#b9acac');
   pix(u-5,v+1,54,11,'#59647d');
   for(let i=0;i<3;i++){pix(u+5+i*13,v+16,9,10,'#718c9b');pix(u+8+i*13,v+17,3,4,'#e2d6aa');}
  }
 }else if(theme==='station'){
  for(let x=2;x<23;x++){const [u,v]=at(x,12);pix(u,v,16,3,'#bcb2a1');pix(u+6,v+3,3,8,'#526775');}
  const [u,v]=at(15,6);pix(u,v,67,33,'#3e5a6d');pix(u+3,v+3,61,27,'#a0a7ad');
  for(let i=0;i<4;i++)pix(u+7+i*14,v+7,10,12,'#a9d1c9');
 }
 if(id==='kronenstadt_upper'){
  for(const [x,y] of [[9,7],[18,13]]){
   const [u,v]=at(x,y);
   pix(u-4,v+1,47,22,'#6d647b');pix(u-2,v+4,43,18,'#e0c9a4');
   pix(u-6,v-5,51,10,'#8e657b');
   for(let i=0;i<3;i++)pix(u+3+i*13,v+8,9,8,i===1?'#d8a47c':'#91aeb1');
  }
  const [u,v]=at(12,9);
  pix(u+1,v+5,26,9,'#5e7082');pix(u+4,v+2,20,10,'#91aab1');
  pix(u+10,v-10,8,17,'#c9b4ad');pix(u+12,v-14,4,6,'#f4d9b3');
 }
 if(id==='name_library'||id==='central_archive'){
  for(const [x,y] of [[4,5],[10,5],[16,5]]){
   const [u,v]=at(x,y);pix(u,v,23,19,'#3c5263');
   pix(u+2,v+2,19,14,'#ab8a70');
   for(let i=0;i<3;i++)pix(u+4,v+3+i*5,14,2,i%2?'#d7c39e':'#687f91');
  }
 }
 const map=window.EchoMaps.get(id);
 if(s.chapter7?.echoTrace&&theme==='garden'){
  for(let y=1;y<map.height-1;y++)for(let x=1;x<map.width-1;x++)
   if(map.tiles[y][x]===2&&(x*7+y*11)%9===0){
    const [u,v]=at(x,y);
    if(u>=-16&&u<=320&&v>=-16&&v<=180){
     pix(u+5,v+5+Math.sin(tick*.005+x)*2,5,6,'#b6f7d5');
     pix(u+7,v+3,2,3,'#fff2c9');
    }
   }
 }
 for(const point of markers[id]||[]){
  const [u,v]=at(point.x,point.y),type=point.type;
  if(u<-35||v<-35||u>325||v>188)continue;
  const person=['edda','apprentice','worker0','worker1','worker2','foreman','nalia',
   'hunter','varek','archivist','guard','citizen0','citizen1','critic','stationMaster','vendor'];
  if(person.includes(type)){
   const role=type==='edda'?'oma':type==='nalia'?'gym2':type==='varek'?'gym3':
    type==='guard'||type==='hunter'?'vex':type==='archivist'?'girl':
    type==='worker0'||type==='citizen0'?'girl':type==='stationMaster'?'stationMaster':'jaro';
   drawChar(u,v,'#89a7a1',0,role,'down');
  }else if(type.startsWith('stone')){
   pix(u+3,v-4,10,23,'#3b5363');pix(u+5,v-1,6,16,c.stones.includes(type.slice(5))?'#d3e9b8':'#8e9eac');
   pix(u+6,v+3,4,4,'#fff0c5');
  }else if(type.startsWith('ritual')){
   pix(u+3,v+4,12,11,'#3b6b67');pix(u+5,v-2,8,12,'#b2e0c4');
   pix(u+7,v-5+Math.sin(tick*.004)*2,4,6,'#f4e1c2');
  }else if(type==='smelter'||type==='core'||type==='nameShadow'){
   pix(u+1,v+1,14,15,'#3a4b5e');pix(u+4,v-3,8,13,type==='core'?'#eeae73':'#ad94bf');
   pix(u+6,v+2,3,3,'#f9e3c4');
  }else if(type==='train'){
   pix(u-5,v+1,27,15,'#3d536b');pix(u-3,v+3,23,10,'#e2c79a');
   pix(u+1,v+4,8,6,'#8eb6b3');
  }else if(type==='valve1'||type==='valve2'||type==='valve3'){
   pix(u+3,v+4,10,10,'#3d515f');pix(u+4,v+1,8,6,'#cf9871');
   pix(u+7,v-1,2,14,'#f2c69a');
  }else sign(point.x,point.y,theme==='forge'?'#d9a16c':theme==='garden'?'#b5d4b2':theme==='capital'?'#c8b8dd':'#c8c2a6');
 }
 for(const exit of map.exits){
  const [u,v]=at(exit.x,exit.y);
  if(u<-18||v<-18||u>320||v>180)continue;
  pix(u+3,v+1,10,14,'#344f62');pix(u+5,v+3,6,10,'#f4d29b');
 }
 pix(5,5,309,19,'#263d4ddc');letter(names[id],10,18,10,'#f8e6c5');
 pix(5,156,310,19,'#263d4de8');letter(goal(s),9,169,9,'#f6e6c0');
}
function drawRegionMap(ctx,s){
 const m=window.EchoMaps.get(s.currentMapId),w=m.width,h=m.height;
 ctx.fillStyle='#1c3142';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#f6e2b4';ctx.font='bold 13px monospace';ctx.fillText(names[s.currentMapId],9,19);
 const scale=Math.min(275/w,124/h,9),left=(320-w*scale)/2,top=29;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const tile=m.tiles[y][x];
  ctx.fillStyle=tile===1?'#455767':tile===5?'#85746b':tile===2?'#639776':'#b8aa9d';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
  if(s.chapter7?.echoTrace&&themes[m.mapId]==='garden'&&tile===2&&(x*7+y*11)%9===0){
   ctx.fillStyle='#e7ffbf';ctx.fillRect(left+x*scale,top+y*scale,Math.max(2,scale/2),Math.max(2,scale/2));
  }
 }
 ctx.fillStyle='#ffed99';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',11,173);
}
window.EchoStoryRegions=Object.freeze({chapters,names,themes,chapterOf,markers,register,
 ensure,access,regionMove,interact,victory,goal,draw,drawTile,drawRegionMap});
})();
