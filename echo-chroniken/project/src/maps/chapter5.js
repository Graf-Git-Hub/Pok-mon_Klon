/* Chapter 5: Stillwasser, the town caught in a recorded memory-loop. */
(()=>{
'use strict';
const names={
 moor_to_stillwater:'NEBELPFAD',stillwasser_town:'STILLWASSER',
 stillwater_archive:'ARCHIV DER ERINNERUNGEN',
 stillwater_tower:'RESONANZTURM',station_stillwasser:'BAHNHOF STILLWASSER'
};
const solid=new Set([1,4,5,7]);
function field(w,h,kind){
 return Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
  if(x===0||y===0||x===w-1||y===h-1)return 1;
  const n=(x*11+y*31+x*y*5)%37;
  if(kind==='moor'&&n%11===0&&y<7)return 4;
  if(kind==='moor'&&n%7===0)return 2;
  if(kind==='town'&&n%13===0)return 2;
  return kind==='moor'?0:3;
 }));
}
function area(t,x0,y0,x1,y1,value=3){
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)t[y][x]=value;
}
function maps(){
 const path=field(24,16,'moor');
 area(path,1,8,22,10);area(path,7,4,17,12);
 const town=field(27,19,'town');
 area(town,1,8,25,11);area(town,10,3,16,17);
 area(town,18,5,25,13);area(town,6,6,12,13);
 // Buildings are solid; paths and all gates stay walkable.
 area(town,4,3,6,5,5);area(town,17,3,19,5,5);
 area(town,4,14,7,16,5);area(town,19,14,22,16,5);
 area(town,11,12,15,17,3);
 const archive=field(20,14,'room');area(archive,1,6,18,8);area(archive,4,3,16,11);
 const tower=field(18,16,'room');area(tower,1,7,16,9);area(tower,4,3,14,12);
 const station=field(23,14,'room');area(station,3,3,19,11);area(station,10,1,12,11);
 return [
 {mapId:'moor_to_stillwater',tiles:path,spawns:{from_moor:{x:2,y:9},from_town:{x:21,y:9}},
  exits:[
   {exitId:'to_moor',x:1,y:9,toMapId:'moorglas_bog',toSpawnId:'stillwater_turn',returnExitId:'to_stillwater'},
   {exitId:'to_town',x:22,y:9,toMapId:'stillwasser_town',toSpawnId:'from_moor',returnExitId:'to_moor_path'}
  ]},
 {mapId:'stillwasser_town',tiles:town,
  spawns:{from_moor:{x:2,y:9},from_archive:{x:24,y:7},
    from_tower:{x:24,y:12},from_station:{x:13,y:16}},
  exits:[
   {exitId:'to_moor_path',x:1,y:9,toMapId:'moor_to_stillwater',toSpawnId:'from_town',returnExitId:'to_town'},
   {exitId:'to_archive',x:25,y:7,toMapId:'stillwater_archive',toSpawnId:'from_town',returnExitId:'to_town'},
   {exitId:'to_tower',x:25,y:12,toMapId:'stillwater_tower',toSpawnId:'from_town',returnExitId:'to_town',requiredFlag:'chapter5.libraryBypass'},
   {exitId:'to_station',x:13,y:17,toMapId:'station_stillwasser',toSpawnId:'from_town',returnExitId:'to_town'}
  ]},
 {mapId:'stillwater_archive',tiles:archive,spawns:{from_town:{x:2,y:7}},
  exits:[{exitId:'to_town',x:1,y:7,toMapId:'stillwasser_town',toSpawnId:'from_archive',returnExitId:'to_archive'}]},
 {mapId:'stillwater_tower',tiles:tower,spawns:{from_town:{x:2,y:8}},
  exits:[{exitId:'to_town',x:1,y:8,toMapId:'stillwasser_town',toSpawnId:'from_tower',returnExitId:'to_tower'}]},
 {mapId:'station_stillwasser',tiles:station,spawns:{from_town:{x:11,y:2},platform:{x:11,y:9}},
  exits:[{exitId:'to_town',x:11,y:1,toMapId:'stillwasser_town',toSpawnId:'from_station',returnExitId:'to_station'}]}
 ];
}
const markers={
 moor_to_stillwater:[{x:8,y:6,type:'sign'},{x:15,y:11,type:'reflection'}],
 stillwasser_town:[
  {x:6,y:9,type:'resident0'},{x:14,y:6,type:'resident1'},
  {x:20,y:10,type:'resident2'},{x:12,y:10,type:'fountain'},
  {x:22,y:7,type:'archiveSign'},{x:22,y:12,type:'towerSign'}
 ],
 stillwater_archive:[
  {x:6,y:5,type:'lyra'},{x:7,y:9,type:'ledger'},
  {x:11,y:5,type:'portrait'},{x:15,y:9,type:'diary'},
  {x:15,y:5,type:'libraryRoute'}
 ],
 stillwater_tower:[
  {x:5,y:5,type:'cable'},{x:9,y:5,type:'mirror'},
  {x:13,y:9,type:'antenna'},{x:9,y:11,type:'lyraDuel'}
 ],
 station_stillwasser:[
  {x:11,y:6,type:'train'},{x:6,y:7,type:'stationMaster'}
 ]
};
const base=()=>({
 stage:0,residents:[0,0,0],contradictions:[],
 evidence:[],truthEvidence3:false,lyraTrusted:false,libraryBypass:false,
 cableDisconnected:false,mirrorWon:false,duelWon:false,
 antennaOff:false,completed:false,rail_stillwasser:false,rewardClaimed:false,
 newMemories:[],hintFailures:0
});
function ensure(s){
 if(!s.chapter5||typeof s.chapter5!=='object'||Array.isArray(s.chapter5))s.chapter5=base();
 const c=s.chapter5;
 for(const [k,v] of Object.entries(base()))if(c[k]===undefined)c[k]=Array.isArray(v)?[]:v;
 for(const k of ['contradictions','evidence','newMemories'])if(!Array.isArray(c[k]))c[k]=[];
 if(!Array.isArray(c.residents)||c.residents.length!==3)c.residents=[0,0,0];
 return c;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('moorglas_bog'))throw Error('Chapter 4 required');
 r.addSpawn('moorglas_bog','stillwater_turn',{x:21,y:9});
 r.addExit('moorglas_bog',{exitId:'to_stillwater',x:22,y:9,
   toMapId:'moor_to_stillwater',toSpawnId:'from_moor',
   returnExitId:'to_moor',requiredFlag:'chapter4.completed'});
 for(const m of maps())r.register(m);
 return r.validateNetwork();
}
function access(s,id){
 const c=ensure(s);
 if(id==='to_stillwater'&&!s.chapter4?.completed)
  return ['Der Nebelpfad fuehrt ins Unbekannte.','Beende zuerst die Rueckfahrt in Kapitel 4.'];
 if(id==='to_tower'&&!c.libraryBypass)
  return ['Der Turm ist versiegelt.','Entlarve drei Erinnerungen und sprich mit Lyra im Archiv.'];
 return null;
}
function regionMove(s,dx,dy){
 const r=window.EchoMaps,m=r.get(s.currentMapId);
 if(!m||!names[s.currentMapId])return {handled:false};
 const x=s.player.x+dx,y=s.player.y+dy;
 if(x<0||y<0||x>=m.width||y>=m.height)return {handled:true};
 const edge=r.getExitAt(m.mapId,x,y);
 if(edge){
  const denied=access(s,edge.exitId);
  if(denied)return {handled:true,lines:denied};
  if(r.travel(s,edge.exitId))return {handled:true,travel:true,lines:[names[s.currentMapId]]};
  return {handled:true,lines:['Dieser Weg ist noch nicht frei.']};
 }
 if(solid.has(m.tiles[y][x])||(markers[m.mapId]||[]).some(p=>p.x===x&&p.y===y))return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:false};
}
function interact(s,tx,ty){
 const c=ensure(s),point=(markers[s.currentMapId]||[]).find(p=>p.x===tx&&p.y===ty)||
  (markers[s.currentMapId]||[]).find(p=>p.x===s.player.x&&p.y===s.player.y);
 if(!point)return {lines:['Hier flimmert eine alte Erinnerung.']};
 const out={lines:[],changed:false};
 const mark=(key,value)=>{if(c[key]!==value){c[key]=value;out.changed=true;}};
 const id=point.type;
 if(id.startsWith('resident')){
  const index=Number(id.slice(-1)),repeat=c.residents[index]||0;
  if(repeat<2){c.residents[index]=repeat+1;out.changed=true;}
  if(repeat===1&&!c.contradictions.includes(index)){c.contradictions.push(index);out.changed=true;}
  const first=[
   'Tilda: Mein Sohn kam gestern aus der Stadt zurueck.',
   'Jaro: Heute ist Montag. Der Marktplatz ist voller Leben.',
   'Mina: Meine Schwester singt jeden Abend am Brunnen.'
  ];
  const second=[
   'Tilda: Mein Sohn kam gestern. Aber sein Zimmer steht seit Jahren leer.',
   'Jaro: Wieder Montag? Der Kalender zeigt schon Donnerstag.',
   'Mina: Meine Schwester kann seit zehn Jahren nicht mehr singen.'
  ];
  out.lines=[repeat===0?first[index]:second[index],
   'Widersprueche im Tagebuch: '+c.contradictions.length+'/3'];
  if(c.contradictions.length===3)mark('stage',Math.max(c.stage,2));
 }else if(id==='fountain'){
  s.team?.forEach(t=>t.hp=t.maxHp);out.changed=true;
  out.lines=['Der Stillwasser-Brunnen heilt dein ganzes Team.',
   'Das Spiegelbild im Wasser hinkt deiner Bewegung hinterher.'];
 }else if(id==='archiveSign'){
  out.lines=['ARCHIV: Niemand darf eine Erinnerung besitzen.'];
 }else if(id==='towerSign'){
  out.lines=[c.libraryBypass?'Der Wartungsgang zum Turm ist offen.':
    'Die Turmtuer ist verschlossen. Das Archiv kennt einen anderen Weg.'];
 }else if(id==='sign'){
  out.lines=['Der Wegweiser sagt STILLWASSER.','Das Datum wurde mehrfach ueberschrieben.'];
 }else if(id==='reflection'){
  out.lines=['Ein Spiegel im Moor zeigt den Dorfplatz.','Darin ist jeder Tag derselbe.'];
 }else if(id==='lyra'){
  if(c.completed)out.lines=['Lyra: Jetzt duerfen neue Geschichten entstehen.',
    'Du hast die Bewohner aus der Schleife befreit.'];
  else if(c.contradictions.length<3||c.evidence.length<3)
   out.lines=['Lyra: Eine perfekte Erinnerung kann trotzdem falsch sein.',
    'Bring mir drei Widersprueche und drei Archivbelege.',
    'Bewohner '+c.contradictions.length+'/3 | Archiv '+c.evidence.length+'/3'];
  else{
   mark('lyraTrusted',true);mark('stage',Math.max(c.stage,3));
   out.lines=['Lyra: Die Aufnahmen widersprechen echten Erlebnissen.',
    'Varek hat die Wiederholungen absichtlich gestartet.',
    'Nimm den oeffentlichen Bibliotheksgang zum Turm.'];
  }
 }else if(['ledger','portrait','diary'].includes(id)){
  const index=['ledger','portrait','diary'].indexOf(id);
  const lines=[
   'Im Kassenbuch fehlen drei Tage. Die Quittungen tragen aber neue Nummern.',
   'Ein Familienportraet zeigt zwei verschiedene Geburtstage am selben Datum.',
   'Das Tagebuch nennt den Tod der Schwester. Der Marktplatz spricht von ihrem Lied.'
  ];
  if(!c.evidence.includes(index)){c.evidence.push(index);out.changed=true;}
  if(c.evidence.length===3){mark('truthEvidence3',true);mark('stage',Math.max(c.stage,3));}
  out.lines=[lines[index],'Archivbelege: '+c.evidence.length+'/3'];
 }else if(id==='libraryRoute'){
  if(!c.lyraTrusted){
   c.hintFailures++;out.changed=true;
   out.lines=['Die Bibliothek ist fuer Wartungsarbeiten gesperrt.',
    c.hintFailures>=3?'Tipp: Befrage die drei Dorfbewohner zweimal und sammle drei Archivbelege.':
     'Lyra muss den Zutritt bestaetigen.'];
  }else{
   mark('libraryBypass',true);mark('stage',Math.max(c.stage,4));
   out.lines=['Lyra entriegelt den oeffentlichen Bibliotheksgang.',
    'Der Resonanz-Turm im Osten ist nun erreichbar.'];
  }
 }else if(id==='cable'){
  if(!c.libraryBypass)out.lines=['Der Schaltkasten ist versiegelt.'];
  else if(c.cableDisconnected)out.lines=['Das Sendekabel ist bereits getrennt.'];
  else{
   mark('cableDisconnected',true);mark('stage',5);
   out.lines=['Das Stromkabel ist getrennt.',
    'Der Gedaechtnisspiegel verliert seine Schutzschicht.'];
  }
 }else if(id==='mirror'){
  if(c.mirrorWon)out.lines=['Der Spiegel ist zerbrochen. Die Stimmen sind wieder ihre eigenen.'];
  else if(!c.cableDisconnected)out.lines=['Der Spiegel ist noch aufgeladen. Trenne zuerst das Stromkabel.'];
  else {out.boss='mirror';out.lines=['Ein falsches Abbild von Elena tritt aus dem Spiegel.',
    'GEDAECHTNISSPIEGEL greift an!'];}
 }else if(id==='lyraDuel'){
  if(!c.mirrorWon)out.lines=['Lyra: Zuerst muessen wir den Spiegel befreien.'];
  else if(c.duelWon)out.lines=['Lyra: Deine Wesen haben die Pruefung bestanden.'];
  else{out.boss='lyra';out.lines=['Lyra: Du hast die Wahrheit gefunden.',
    'Zeig mir, wie stark euer Vertrauen wirklich ist.'];}
 }else if(id==='antenna'){
  if(!c.mirrorWon)out.lines=['Das Hauptsignal laeuft weiter. Besiege den Gedaechtnisspiegel.'];
  else if(c.completed)out.lines=['Der Sender ist aus. Die Dorfbewohner finden neue Worte.'];
  else{
   mark('antennaOff',true);mark('completed',true);mark('rail_stillwasser',true);mark('stage',7);
   if(!c.rewardClaimed){mark('rewardClaimed',true);s.orbs+=5;s.potions+=3;}
   out.lines=['Lyra schaltet den Sender aus. Der Dorfplatz wird endlich still.',
    'Kapitel 5 geschafft! Stillwasser-Archivpass erhalten.',
    'Die Echo-Bahn nach Stillwasser ist frei. 5 Sphaeren und 3 Traenke!'];
  }
 }else if(id==='train'){
  if(!c.completed)out.lines=['Der Bahnhof hoert noch immer dieselbe Durchsage.',
    'Schalte zuerst den Resonanzsender ab.'];
  else{out.rail=true;out.lines=['Willkommen bei der Echo-Bahn!'];}
 }else if(id==='stationMaster'){
  out.lines=['Stationshueter: Der Zug wartet auf neue Geschichten.',
   c.completed?'Die Rueckfahrt nach Moorglas ist frei.':'Unsere Gleise gehoeren noch dem Sender.'];
 }
 if(out.changed&&c.truthEvidence3&&c.contradictions.length===3)c.stage=Math.max(c.stage,3);
 return out;
}
function victory(s,which){
 const c=ensure(s);
 if(which==='mirror'&&!c.mirrorWon){
  c.mirrorWon=true;c.stage=Math.max(c.stage,6);
  return ['Der Gedaechtnisspiegel zerbricht.',
   'Die Antenne kann nun sicher abgeschaltet werden.'];
 }
 if(which==='lyra'&&!c.duelWon){
  c.duelWon=true;
  return ['Lyra: Du kaempfst fuer deine Wesen, nicht ueber sie.',
   'Du hast ihre freiwillige Pruefung bestanden.'];
 }
 return [];
}
function goal(s){
 const c=ensure(s);
 if(c.completed)return 'KAPITEL 5: GESCHAFFT';
 if(s.currentMapId==='moor_to_stillwater')return 'GEHE NACH STILLWASSER';
 if(c.contradictions.length<3)return 'BEFRAGE DIE BEWOHNER 2X: '+c.contradictions.length+'/3';
 if(c.evidence.length<3)return 'ARCHIVBELEGE: '+c.evidence.length+'/3';
 if(!c.lyraTrusted)return 'SPRICH MIT LYRA';
 if(!c.libraryBypass)return 'FINDE DEN BIBLIOTHEKSGANG';
 if(!c.cableDisconnected)return 'TRENNE DAS STROMKABEL';
 if(!c.mirrorWon)return 'GEDAECHTNISSPIEGEL';
 return 'SCHALTE DIE ANTENNE AB';
}
function drawTile(pix,tile,sx,sy,x,y,tick,id){
 const inside=['stillwater_archive','stillwater_tower','station_stillwasser'].includes(id);
 const tower=id==='stillwater_tower',water=id==='moor_to_stillwater';
 if(tile===1||tile===5){
  pix(sx,sy,16,16,tile===5?'#47515c':inside?'#394b5a':'#385461');
  pix(sx+1,sy+1,14,11,tile===5?'#947e74':inside?'#66757b':'#58776a');
  pix(sx+2,sy+12,12,2,'#304b57');
  if(tile===5){pix(sx+3,sy+3,10,3,'#b49b7b');pix(sx+4,sy+7,8,3,'#7c8d91');}
  return;
 }
 if(tile===4){
  pix(sx,sy,16,16,'#3d7890');
  pix(sx+2,sy+4+Math.sin(tick*.002+y)*2,11,2,'#7daab4');
  pix(sx+6,sy+11,7,1,'#b2c9b9');return;
 }
 if(inside){
  pix(sx,sy,16,16,tower?'#7b8d96':'#9e9d98');
  pix(sx,sy,16,1,tower?'#9fb4b5':'#c7bdad');
  pix(sx,sy,1,16,'#627881');
  pix(sx+13,sy+4,2,2,'#536a72');
  if(tower&&((x+y)%8===0))pix(sx+6,sy+5,3,5,'#add4c7');
  return;
 }
 pix(sx,sy,16,16,water?'#648a79':'#83a691');
 pix(sx+2,sy+3,4,2,water?'#8aab92':'#9ab9a0');
 pix(sx+9,sy+12,5,2,'#516c61');
 if(tile===2){pix(sx+4,sy+5,3,8,'#426e53');pix(sx+8,sy+6,3,7,'#b4bb8c');}
 if(tile===3){
  pix(sx,sy,16,16,water?'#a99b86':'#c0ae96');
  pix(sx+2,sy+3,6,2,'#d9c2a5');
  pix(sx+10,sy+10,4,2,'#927f74');
 }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId,c=ensure(s);
 const at=(x,y)=>[x*16-camX,y*16-camY];
 const house=(x,y,roof)=>{
  const [u,v]=at(x,y);
  pix(u-3,v+11,48,36,'#596373');pix(u,v+14,42,30,'#d8bfa9');
  pix(u-5,v+4,52,14,'#394957');pix(u-2,v+7,46,9,roof);
  pix(u+6,v+23,8,9,'#7b9ca0');pix(u+28,v+23,8,9,'#7b9ca0');
  pix(u+19,v+31,9,13,'#64595e');pix(u+21,v+34,3,3,'#d0b786');
 };
 if(id==='stillwasser_town'){
  house(4,3,'#8d738d');house(17,3,'#5d8390');
  house(4,14,'#a67e7b');house(19,14,'#6c728e');
  let [u,v]=at(12,8);
  pix(u+5,v+5,20,12,'#465a66');pix(u+8,v+3,15,12,'#90adb0');
  pix(u+11,v+1,9,7,'#a8d5cf');
  pix(u+14,v-6,2,13,'#5e7683');
  for(const [x,y] of [[8,11],[18,8],[22,10]]){
   [u,v]=at(x,y);pix(u+5,v-5,2,20,'#68766b');pix(u+2,v-7,8,5,'#d6cfaf');
  }
 }else if(id==='stillwater_archive'){
  for(const [x,y] of [[5,3],[10,3],[14,3],[4,9],[15,10]]){
   const [u,v]=at(x,y);
   pix(u+1,v,17,26,'#4a5360');pix(u+3,v+2,13,23,'#a78668');
   for(let n=0;n<4;n++)pix(u+4,v+3+n*5,11,2,n%2?'#d4be95':'#647c84');
  }
 }else if(id==='stillwater_tower'){
  const [u,v]=at(8,3);
  pix(u,v,44,19,'#334f5b');pix(u+4,v+3,36,11,'#75949b');
  for(let n=0;n<3;n++)pix(u+8+n*11,v+5,5,5,n===1?'#dbbdb0':'#8bc7bf');
 }else if(id==='station_stillwasser'){
  for(let x=1;x<22;x++){
   const [u,v]=at(x,11);
   pix(u,v,16,4,'#c1ad8a');pix(u+6,v+4,3,9,'#46535c');
  }
  const [u,v]=at(14,3);
  pix(u,v,55,35,'#455969');pix(u+3,v+3,49,27,'#b1a28f');
  for(let i=0;i<3;i++)pix(u+6+i*15,v+7,10,13,'#9fc0be');
 }
 for(const point of markers[id]||[]){
  const [u,v]=at(point.x,point.y);
  if(u<-25||v<-25||u>329||v>190)continue;
  const type=point.type;
  if(['resident0','resident1','resident2','lyra','stationMaster'].includes(type)){
   const person=type==='lyra'?'gym2':type==='resident0'?'oma':
     type==='resident1'?'jaro':type==='resident2'?'girl':'stationMaster';
   drawChar(u,v,'#7d9b9c',0,person,'down');
  }else if(type==='mirror'){
   pix(u-3,v-4,22,26,'#3f5265');pix(u,v-1,16,20,c.mirrorWon?'#435a62':'#9cc0ca');
   if(!c.mirrorWon){
    pix(u+4,v+3,7,11,'#d6b9d2');pix(u+6,v+1,3,5,'#f0dfed');
    pix(u+5,v+13,5,1,'#536f8b');
   }
  }else{
   const glow=type==='antenna'?'#e5b0b7':type==='train'?'#ebc287':
    ['ledger','portrait','diary'].includes(type)?'#e9d49c':type==='fountain'?'#9ddbc8':'#9ebcbc';
   pix(u+2,v+6,12,9,'#334752');pix(u+4,v+3,8,10,glow);
   pix(u+6,v+4,3,3,'#fff1c9');
  }
 }
 const map=window.EchoMaps.get(id);
 for(const exit of map.exits){
  const [u,v]=at(exit.x,exit.y);
  if(u<-18||u>320||v<-18||v>180)continue;
  pix(u+3,v+1,10,14,'#334c5b');pix(u+5,v+3,6,10,'#f0cf92');
 }
 pix(6,5,275,19,'#283c4ddc');letter(names[id],12,18,10,'#f5e6b8');
 pix(5,157,310,18,'#263a4bdd');letter(goal(s),10,169,9,'#f5e6bd');
}
function drawRegionMap(ctx,s){
 const map=window.EchoMaps.get(s.currentMapId),w=map.width,h=map.height;
 ctx.fillStyle='#1b3341';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#f7dfac';ctx.font='bold 13px monospace';ctx.fillText(names[s.currentMapId],9,20);
 const scale=Math.min(275/w,124/h,9),left=(320-w*scale)/2,top=29;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const tile=map.tiles[y][x];
  ctx.fillStyle=tile===1?'#435c5b':tile===5?'#957b70':tile===4?'#60939b':tile===2?'#7eae89':'#b8ae98';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
 }
 ctx.fillStyle='#ffeba3';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',11,174);
}
window.EchoChapter5=Object.freeze({
 names,markers,register,ensure,access,regionMove,interact,victory,goal,draw,drawTile,drawRegionMap
});
})();
