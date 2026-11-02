/* Echo-Chroniken postgame: free exploration, six biodiversity meadows and railway museum. */
(()=>{
'use strict';
const HUB='optional_echo_garden_annex',MUSEUM='rail_heritage_museum';
const meadowIds=Array.from({length:6},(_,i)=>'postgame_meadow_0'+(i+1));
const names={[HUB]:'ECHO-GARTEN: FREIE WEGE',[MUSEUM]:'MUSEUM DER ECHO-BAHN'};
meadowIds.forEach((id,i)=>names[id]='FREIE WIESE '+(i+1)+'/6');
const nodes=new Map(),markers={},blocked=new Set([1,4,5,7]);
function node(id,w,h){nodes.set(id,{mapId:id,w,h,spawns:{},exits:[]});}
node(HUB,28,20);node(MUSEUM,26,19);meadowIds.forEach(id=>node(id,25,19));
function connect(a,ae,ax,ay,as,ap,b,be,bx,by,bs,bp){
 const A=nodes.get(a),B=nodes.get(b);
 A.spawns[as]=ap;B.spawns[bs]=bp;
 A.exits.push({exitId:ae,x:ax,y:ay,toMapId:b,toSpawnId:bs,returnExitId:be});
 B.exits.push({exitId:be,x:bx,y:by,toMapId:a,toSpawnId:as,returnExitId:ae});
}
connect(HUB,'to_museum',26,10,'from_museum',{x:25,y:10},
 MUSEUM,'to_garden',1,9,'from_garden',{x:2,y:9});
meadowIds.forEach((id,i)=>{
 const x=3+i*4;
 connect(HUB,'to_meadow_'+(i+1),x,1,'from_meadow_'+(i+1),{x,y:2},
  id,'to_garden',12,17,'from_garden',{x:12,y:16});
});
nodes.get(HUB).spawns.from_epilogue={x:2,y:10};
nodes.get(HUB).exits.push({exitId:'to_epilogue',x:1,y:10,toMapId:'epilogue_wurzelheim',
 toSpawnId:'from_postgame',returnExitId:'to_postgame'});
markers[HUB]=[
 {type:'nalia',x:6,y:5},{type:'piko',x:14,y:5},{type:'martha',x:21,y:5},
 {type:'trial0',x:6,y:13},{type:'trial1',x:14,y:13},{type:'trial2',x:21,y:13},
 {type:'gardenFest',x:14,y:16},{type:'healer',x:23,y:15}
];
markers[MUSEUM]=[
 {type:'curator',x:6,y:5},{type:'station0',x:6,y:10},
 {type:'station1',x:12,y:10},{type:'station2',x:18,y:10},
 {type:'museumLedger',x:18,y:5},{type:'trainLacquer',x:12,y:14}
];
meadowIds.forEach((id,i)=>markers[id]=[
 {type:'meadowSign',x:6,y:5},{type:'clue'+i,x:18,y:5},
 {type:'healer',x:12,y:13}
]);
function buildTiles(n){
 const t=Array.from({length:n.h},(_,y)=>Array.from({length:n.w},(_,x)=>{
  if(x===0||y===0||x===n.w-1||y===n.h-1)return 1;
  const seed=(x*17+y*11+x*y*7)%29;
  if(n.mapId.startsWith('postgame_meadow_'))return seed<15?2:3;
  return 3;
 }));
 for(const p of [...Object.values(n.spawns),...n.exits,...markers[n.mapId]]){
  for(let y=p.y-1;y<=p.y+1;y++)for(let x=p.x-1;x<=p.x+1;x++)
   if(x>0&&y>0&&x<n.w-1&&y<n.h-1)t[y][x]=3;
 }
 if(n.mapId===HUB){
  for(let x=1;x<n.w-1;x++)t[10][x]=3;
  for(let y=1;y<n.h-1;y++)t[y][14]=3;
 }
 return t;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('epilogue_wurzelheim'))throw Error('Finale required for postgame');
 r.addSpawn('epilogue_wurzelheim','from_postgame',{x:24,y:9});
 r.addExit('epilogue_wurzelheim',{exitId:'to_postgame',x:25,y:9,
  toMapId:HUB,toSpawnId:'from_epilogue',returnExitId:'to_epilogue',
  requiredFlag:'main_story_finished'});
 for(const n of nodes.values())r.register({mapId:n.mapId,tiles:buildTiles(n),spawns:n.spawns,exits:n.exits});
 return r.validateNetwork();
}
function ensure(s){
 if(!s.postgame||typeof s.postgame!=='object'||Array.isArray(s.postgame))s.postgame={};
 const c=s.postgame,defaults={stage:0,visited:[],clues:[],trials:[],museumOrder:[],
  museumSolved:false,museumErrors:0,celebrated:false,completed:false,
  rewardClaimed:false,trainLacquer:false};
 for(const [k,v] of Object.entries(defaults)){
  if(c[k]===undefined||Array.isArray(v)&&!Array.isArray(c[k]))
   c[k]=Array.isArray(v)?[]:v;
 }
 if(c.completed)s.optional_postgame_completed=true;
 return c;
}
function access(s,exitId){
 if(exitId==='to_postgame'&&!s.main_story_finished)
  return ['Erst nach dem Finale oeffnet sich der freie Garten.'];
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
  if(window.EchoMaps.travel(s,e.exitId)){
   const c=ensure(s),idx=meadowIds.indexOf(s.currentMapId);
   if(idx>=0&&!c.visited.includes(idx))c.visited.push(idx);
   return {handled:true,travel:true,lines:[names[s.currentMapId]||'WURZELHEIM']};
  }
  return {handled:true,lines:['Der Weg ist nicht frei.']};
 }
 if(blocked.has(m.tiles[y][x])||markers[m.mapId].some(p=>p.x===x&&p.y===y))
  return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:m.tiles[y][x]===2};
}
const clueLines=[
 'WURZEL: Eine Erinnerung braucht einen offenen Anfang.',
 'WASSER: Ein Weg darf sich veraendern, ohne vergessen zu werden.',
 'STERN: Auch ein Abschied kann Liebe bewahren.',
 'Nalia: Niemand soll seine eigene Stimme verlieren.',
 'Edda: Jede Maschine braucht einen Notausgang.',
 'Lyra: Die Wahrheit ist staerker, wenn alle sie lesen duerfen.'
];
function interact(s,tx,ty){
 const p=markers[s.currentMapId]?.find(p=>p.x===tx&&p.y===ty);
 if(!p)return {lines:['Der Wind traegt ein leises, freies Echo.']};
 const c=ensure(s),out={changed:false,lines:[]},id=p.type;
 const set=(k,v)=>{if(c[k]!==v){c[k]=v;out.changed=true;}};
 const add=(k,v)=>{if(!c[k].includes(v)){c[k].push(v);out.changed=true;}};
 const stage=v=>set('stage',Math.max(c.stage,v));
 if(id==='healer'){
  for(const m of s.team||[])m.hp=m.maxHp;
  out.changed=true;out.lines=['Die Gartenquelle heilt dein ganzes Team.','Alle Wege bleiben offen.'];
 }else if(id==='nalia'){
  out.lines=['Nalia: Nach dem Finale hoert der Wald wieder viele Stimmen.',
   'In sechs Wiesen leben die Grundarten aller 94 Nichtstarter-Familien.',
   'Die drei Gartenpruefungen sind freiwillig.'];
 }else if(id==='piko'){
  out.lines=['Piko: Nicht jede Begegnung muss mit einem Fang enden.',
   'Gehe ins hohe Gras, um die Echos der sechs Wiesen zu treffen.',
   'Jede Wiese hat eine Tafel mit einem anderen Hinweis.'];
 }else if(id==='martha'){
  out.lines=['Martha: Ich bin froh, dass du wieder hier bist.',
   'Elena wollte, dass dein eigenes Notizbuch weiterwaechst.',
   'Die Feier findet am Blumenbogen statt, sobald du bereit bist.'];
 }else if(id==='meadowSign'){
  const i=meadowIds.indexOf(s.currentMapId);
  out.lines=['FREIE WIESE '+(i+1)+': Hier gibt es seltene Grundformen.',
   'Wilde Echos findest du im hohen Gras.','Der Ausgang im Sueden fuehrt sicher zurueck.'];
 }else if(id.startsWith('clue')){
  const i=Number(id.slice(4));add('clues',i);stage(1);
  out.lines=[clueLines[i],'Erinnerungstafeln: '+c.clues.length+'/6.'];
 }else if(id.startsWith('trial')){
  const i=Number(id.slice(5));
  if(c.trials.includes(i))out.lines=['Gartenpruefung '+(i+1)+' bestanden.',
   'Ein Sieg ist kein Besitzrecht.'];
  else if(!c.clues.includes(i*2)||!c.clues.includes(i*2+1))
   out.lines=['Finde zuerst die Erinnerungstafeln in Wiese '+(i*2+1)+' und '+(i*2+2)+'.',
    'Die Pruefung bleibt jederzeit freiwillig.'];
  else{
   out.boss='postgameTrial'+i;
   out.lines=[['Piko: Ich pruefe deine Geduld, nicht deine Macht.',
    'Nalia: Hoere auch im Kampf auf die anderen Stimmen.',
    'Vex: Eine freie Entscheidung braucht Mut.'][i],
    'Gartenpruefung '+(i+1)+': Ein freundschaftlicher Kampf beginnt.'];
  }
 }else if(id==='curator'){
  out.lines=['Museumswaerterin: Die alte Bahn war fuer alle da.',
   'Ordne die drei Stationen nach der ersten Reise:',
   'Wurzelheim, Moorglas, Stillwasser.'];
 }else if(id==='museumLedger'){
  out.lines=['Im Bahnbuch steht: Von Wurzelheim fuhr der erste Zug nach Moorglas.',
   'Stillwasser wurde erst spaeter angeschlossen.'];
 }else if(id.startsWith('station')){
  const i=Number(id.slice(7));
  if(c.museumSolved)out.lines=['Die Museumsstrecke ist richtig geordnet.'];
  else if(i===c.museumOrder.length){
   add('museumOrder',i);
   if(c.museumOrder.length===3){set('museumSolved',true);stage(2);
    out.lines=['WURZELHEIM > MOORGLAS > STILLWASSER.',
     'Der historische Museumszug leuchtet wieder auf!'];}
   else out.lines=['Station '+['Wurzelheim','Moorglas','Stillwasser'][i]+' richtig.',
    'Die alte Strecke hat '+c.museumOrder.length+'/3 Stationen.'];
  }else{
   c.museumOrder=[];set('museumErrors',c.museumErrors+1);
   out.changed=true;out.lines=['Die Reihenfolge stimmt noch nicht. Versuch es erneut.',
    c.museumErrors>=3?'Tipp: Beginne bei Wurzelheim, dann Moorglas.':
     'Lies die Hinweise im Bahnbuch.'];
  }
 }else if(id==='trainLacquer'){
  if(!c.museumSolved)out.lines=['Die Zuglackierung bleibt verschlossen, bis das Raetsel geloest ist.'];
  else{set('trainLacquer',true);out.lines=['Kosmetik freigeschaltet: Freie-Linien-Lackierung.',
   'Die Farbe ist eine Erinnerung, kein spielerischer Vorteil.'];}
 }else if(id==='gardenFest'){
  if(c.trials.length<3||!c.museumSolved)
   out.lines=['Martha: Die Feier kann warten, bis du bereit bist.',
    'Gartenpruefungen '+c.trials.length+'/3, Museumsstrecke '+(c.museumSolved?'fertig':'offen')+'.',
    'Das Lexikon mit 150 Wesen ist ein freiwilliges Extraziel.'];
  else if(!c.completed){
   set('celebrated',true);set('completed',true);stage(7);
   s.optional_postgame_completed=true;out.changed=true;
   if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs=(s.orbs||0)+5;s.potions=(s.potions||0)+3;}
   out.lines=['Alle Freunde feiern im Garten von Oma Martha.',
    'Dein eigenes Erinnerungsbuch beginnt mit einer freien Seite.',
    'POSTGAME GESCHAFFT! +5 Sphaeren und +3 Traenke.'];
  }else out.lines=['Martha: Unsere Erinnerungsfeier darf jederzeit wieder stattfinden.',
   'Das Abenteuer und die freie Erkundung gehen weiter.'];
 }
 if(!out.lines.length)out.lines=['Eine Erinnerung ist fuer alle da.'];
 return out;
}
function victory(s,which){
 const i=Number(String(which).replace('postgameTrial',''));
 if(!/^postgameTrial[012]$/.test(which))return [];
 const c=ensure(s);
 if(!c.trials.includes(i)){c.trials.push(i);c.stage=Math.max(c.stage,3);
  return ['Gartenpruefung '+(i+1)+' bestanden.','Du darfst jederzeit wiederkommen.'];}
 return [];
}
function goal(s){
 const c=ensure(s);
 if(c.completed)return 'POSTGAME GESCHAFFT - FREI ERKUNDEN';
 if(s.currentMapId===MUSEUM)return c.museumSolved?'MUSEUM ERFORSCHT':'ORDNE DREI BAHNSTATIONEN';
 if(meadowIds.includes(s.currentMapId))return 'ENTDECKE DIE ERINNERUNGSTAFEL';
 if(c.clues.length<6)return 'WIESENHINWEISE '+c.clues.length+'/6';
 if(c.trials.length<3)return 'GARTENPRUEFUNGEN '+c.trials.length+'/3';
 if(!c.museumSolved)return 'BESUCHE DAS BAHNMUSEUM';
 return 'FEIERE MIT MARTHA';
}
function drawTile(pix,tile,sx,sy,x,y,tick,id){
 const museum=id===MUSEUM,meadow=meadowIds.includes(id);
 const n=(x*23+y*37+x*y*11)%47;
 if(tile===1||tile===5){
  pix(sx,sy,16,16,museum?'#455569':'#315d4c');
  pix(sx+1,sy+1,14,14,museum?'#69778a':'#527e62');
  pix(sx+2,sy+3,12,3,museum?'#a8a0a4':'#85ad82');
  pix(sx+3,sy+10,10,2,museum?'#38485e':'#386d53');
  return;
 }
 if(museum){
  pix(sx,sy,16,16,(x+y)%2?'#b6a998':'#c5b6a2');
  pix(sx,sy+7,16,1,'#e5d0af');pix(sx,sy+15,16,1,'#8d837b');
  if(y===8||y===12){
   pix(sx,sy+3,16,2,'#54596a');pix(sx,sy+11,16,2,'#54596a');
   pix(sx+4,sy+3,2,10,'#856d5f');pix(sx+12,sy+3,2,10,'#856d5f');
  }else if(n<9){
   pix(sx+3,sy+3,2,2,'#a79584');pix(sx+11,sy+11,2,2,'#d9cbb7');
  }
  return;
 }
 const path=id===HUB&&(y===10||x===14||y===2&&x>=3&&x<=23);
 pix(sx,sy,16,16,path?(x+y)%2?'#d4c59c':'#c3b991':
  meadow?n<12?'#6da987':'#83b895':n<13?'#9dc8a4':'#91b69b');
 if(path){
  pix(sx+2,sy+2,3,2,'#e8d7b0');pix(sx+11,sy+10,3,2,'#a7a17e');
  pix(sx,sy+15,16,1,'#b3a885');return;
 }
 pix(sx,sy,16,1,meadow?'#a2c99d':'#b7d4ac');
 if(tile===2){
  const sway=Math.round(Math.sin(tick*.003+x*.5+y*.3)*1.5);
  for(const [dx,dy] of [[2,4],[7,2],[12,6]]){
   pix(sx+dx+sway,sy+dy,2,11,'#3f7d58');
   pix(sx+dx-1+sway,sy+dy-2,5,5,n%2?'#72a976':'#b0d49b');
   pix(sx+dx+sway,sy+dy-3,2,2,'#c6e4ae');
  }
 }else if(n<11){
  const flower=n%3===0?'#f7d5a9':n%3===1?'#e8b9d9':'#fff0b4';
  pix(sx+7,sy+9,2,5,'#3d7d5a');
  pix(sx+5,sy+6,6,5,flower);pix(sx+7,sy+7,2,2,'#fff1a8');
  pix(sx+3,sy+13,2,2,'#4b8966');
 }else if(n<19){
  pix(sx+5,sy+8,7,5,'#7a9c85');pix(sx+6,sy+7,5,2,'#b7c2a1');
  pix(sx+3,sy+12,3,2,'#588569');
 }else if(n<25){
  pix(sx+3,sy+7,2,6,'#568e62');pix(sx+9,sy+8,2,5,'#528d60');
  pix(sx+2,sy+6,4,3,'#a2d19b');pix(sx+8,sy+7,4,3,'#b3d8a2');
 }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId,m=window.EchoMaps.get(id),at=(x,y)=>[x*16-camX,y*16-camY];
 if(id===MUSEUM){
  // Three historic railway cars on a real display track.
  for(const x of [5,12,19]){
   const [u,v]=at(x,7);
   pix(u-5,v+25,101,3,'#454e62');
   pix(u-5,v+32,101,3,'#454e62');
   pix(u,v,87,26,'#4c6477');pix(u+4,v+4,79,18,'#bd9c82');
   for(let k=0;k<4;k++){
    pix(u+9+k*18,v+6,12,9,'#7ca6b2');
    pix(u+11+k*18,v+7,8,3,'#c4e2dc');
   }
   pix(u+8,v+22,71,3,'#7c4f58');
   for(const k of [12,65]){pix(u+k,v+26,12,8,'#384459');pix(u+k+3,v+28,6,4,'#b6b6a4');}
  }
  const [u,v]=at(12,4);pix(u,v,42,16,'#3c5266');
  pix(u+3,v+3,36,10,'#e1c995');
 }else{
  // Garden lanterns, a flowering arbor and stone seats.
  for(const [x,y] of [[4,4],[19,4],[5,15]]){
   const [u,v]=at(x,y);
   pix(u+7,v+5,7,22,'#526f55');
   pix(u-4,v-8,28,21,'#548a6b');pix(u,v-13,21,11,'#8fc098');
   pix(u+5,v-9,5,5,'#dcb7d4');pix(u+17,v-2,5,5,'#f4d49d');
  }
  if(id===HUB){
   const [u,v]=at(12,8);
   pix(u,v,49,6,'#6b998c');pix(u+3,v+2,43,2,'#d4e2c6');
   for(const dx of [8,20,32]){
    pix(u+dx,v-8,4,11,'#668f88');pix(u+dx+1,v-12,2,6,'#a9d7d1');
   }
   for(const x of [4,20]){const [bx,by]=at(x,11);
    pix(bx,by+5,40,5,'#886c5f');pix(bx+4,by+1,32,5,'#bd9872');
    pix(bx+5,by+10,4,8,'#5a635c');pix(bx+30,by+10,4,8,'#5a635c');
   }
  }
 }
 for(const p of markers[id]){
  const [u,v]=at(p.x,p.y);if(u<-30||u>340||v<-30||v>200)continue;
  if(['nalia','piko','martha','curator'].includes(p.type))
   drawChar(u,v,'#d8b3a2',0,p.type==='martha'?'grandma':'girl','down');
  else if(p.type==='healer'){
   pix(u+3,v+3,10,12,'#477e75');pix(u+6,v+5,4,7,'#b6ebcb');
  }else if(p.type.startsWith('trial')){
   pix(u+2,v+3,12,14,'#4d5075');pix(u+4,v,8,8,'#bfa6e3');
   pix(u+7,v+2,2,5,'#fbe8b7');
  }else{
   pix(u+2,v+3,12,12,id===MUSEUM?'#695e67':'#55795e');
   pix(u+4,v+5,8,7,p.type.startsWith('station')?'#e7d09b':'#d5d3b4');
   pix(u+7,v+6,2,3,'#fff2cf');
  }
 }
 for(const e of m.exits){const [u,v]=at(e.x,e.y);
  if(u<-16||u>320||v<-16||v>180)continue;
  pix(u+3,v+1,10,14,'#38556b');pix(u+5,v+3,6,10,'#f3d8a7');
 }
 pix(5,5,310,19,'#263e4de8');letter(names[id],8,18,10,'#ffecc2');
 pix(5,156,310,19,'#263e4deb');letter(goal(s),8,169,9,'#fff1c9');
}
function drawRegionMap(ctx,s){
 const m=window.EchoMaps.get(s.currentMapId),scale=Math.min(270/m.width,124/m.height,9);
 const left=(320-m.width*scale)/2,top=29;
 ctx.fillStyle='#203a4d';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#ffe9c5';ctx.font='bold 12px monospace';ctx.fillText(names[s.currentMapId],8,19);
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++){
  ctx.fillStyle=m.tiles[y][x]===1?'#416b60':m.tiles[y][x]===2?'#70a875':'#bbcbac';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
 }
 ctx.fillStyle='#ffe9a5';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',10,173);
}
window.EchoPostgame=Object.freeze({HUB,MUSEUM,meadowIds,names,markers,register,ensure,
 access,regionMove,interact,victory,goal,drawTile,draw,drawRegionMap});
})();
