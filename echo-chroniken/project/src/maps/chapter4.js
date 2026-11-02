/* Echo-Chroniken Chapter 4: safe railway, first stations and Moorglas adventure. */
(()=>{
'use strict';
const names={
 root_tunnel:'WURZELTUNNEL',station_wurzelheim:'BAHNHOF WURZELHEIM',
 rail_switchyard:'WEICHENHOF',station_moorglas:'BAHNHOF MOORGLAS',
 moorglas_bog:'MOORGLAS-SENKE'
};
const blocked=new Set([1,4,5,7]);
function ground(w,h,kind){
 return Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
  if(x===0||y===0||x===w-1||y===h-1)return 1;
  const n=(x*17+y*23+x*y*7)%29;
  if(kind==='bog'&&x>4&&y<7&&n%4===0)return 4;
  if(kind==='bog'&&n===2)return 2;
  if(kind==='tunnel'&&n===4&&y!==6)return 1;
  return 3;
 }));
}
function clear(m,a,b,c,d,t=3){
 for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)m[y][x]=t;
}
function defineMaps(){
 const root=ground(20,14,'tunnel');
 clear(root,1,5,18,8);clear(root,4,4,15,9);
 const w=ground(22,14,'station');clear(w,1,5,20,9);
 const yard=ground(22,16,'station');clear(yard,1,5,20,10);clear(yard,4,4,19,12);
 const bog=ground(24,18,'bog');clear(bog,1,8,22,10);
 clear(bog,6,5,19,13);clear(bog,8,11,20,15);
 const m=ground(22,14,'station');clear(m,1,5,20,9);
 return [
  {mapId:'root_tunnel',tiles:root,spawns:{from_pump:{x:2,y:6},from_station:{x:17,y:6}},
   exits:[
    {exitId:'to_pump',x:1,y:6,toMapId:'pumpworks_controlroom',toSpawnId:'tunnel_door',returnExitId:'to_tunnel'},
    {exitId:'to_station',x:18,y:6,toMapId:'station_wurzelheim',toSpawnId:'from_tunnel',returnExitId:'to_tunnel'}
   ]},
  {mapId:'station_wurzelheim',tiles:w,
   spawns:{from_tunnel:{x:2,y:7},from_yard:{x:19,y:7},platform:{x:11,y:8}},
   exits:[
    {exitId:'to_tunnel',x:1,y:7,toMapId:'root_tunnel',toSpawnId:'from_station',returnExitId:'to_station'},
    {exitId:'to_yard',x:20,y:7,toMapId:'rail_switchyard',toSpawnId:'from_station',returnExitId:'to_station'}
   ]},
  {mapId:'rail_switchyard',tiles:yard,spawns:{from_station:{x:2,y:7}},
   exits:[{exitId:'to_station',x:1,y:7,toMapId:'station_wurzelheim',toSpawnId:'from_yard',returnExitId:'to_yard'}]},
  {mapId:'station_moorglas',tiles:m,
   spawns:{platform:{x:11,y:8},from_bog:{x:19,y:7}},
   exits:[{exitId:'to_bog',x:20,y:7,toMapId:'moorglas_bog',toSpawnId:'from_station',returnExitId:'to_station'}]},
  {mapId:'moorglas_bog',tiles:bog,spawns:{from_station:{x:2,y:9}},
   exits:[{exitId:'to_station',x:1,y:9,toMapId:'station_moorglas',toSpawnId:'from_bog',returnExitId:'to_bog'}]}
 ];
}
const markers={
 root_tunnel:[{x:8,y:6,type:'diary'},{x:13,y:6,type:'lamp'}],
 station_wurzelheim:[{x:7,y:6,type:'edda'},{x:11,y:6,type:'train'}],
 rail_switchyard:[{x:5,y:5,type:'switchA'},{x:11,y:10,type:'switchC'},{x:17,y:5,type:'switchB'}],
 station_moorglas:[{x:11,y:6,type:'train'},{x:6,y:6,type:'stationMaster'}],
 moorglas_bog:[
  {x:7,y:7,type:'courier'},{x:17,y:11,type:'rootBoss'},
  {x:9,y:12,type:'willow'},{x:19,y:14,type:'healer'}
 ]
};
const initial=()=>({
 stage:0, switches:[], railsReady:false,rail_wurzelheim:false,rail_moorglas:false,
 firstTrip:false,courierWon:false,rootBossWon:false,returnTrip:false,
 completed:false,rewardClaimed:false,plans:false
});
function ensure(s){
 if(!s.chapter4||typeof s.chapter4!=='object'||Array.isArray(s.chapter4))s.chapter4=initial();
 const c=s.chapter4;
 for(const [k,v] of Object.entries(initial()))if(c[k]===undefined)c[k]=Array.isArray(v)?[]:v;
 if(!Array.isArray(c.switches))c.switches=[];
 return c;
}
function register(){
 const r=window.EchoMaps;
 if(!r?.get('pumpworks_controlroom'))throw Error('Chapter 3 required before railway');
 r.addSpawn('pumpworks_controlroom','tunnel_door',{x:11,y:6});
 r.addExit('pumpworks_controlroom',{exitId:'to_tunnel',x:12,y:6,toMapId:'root_tunnel',
  toSpawnId:'from_pump',returnExitId:'to_pump',requiredFlag:'chapter3.completed'});
 for(const m of defineMaps())r.register(m);
 return r.validateNetwork();
}
function access(s,id){
 if(id==='to_stillwater'&&!s.chapter4?.completed)
  return ['Der Weg nach Stillwasser ist von Nebel verschlossen.','Beende erst Kapitel 4.'];
 if(id==='to_tunnel'&&!s.chapter3?.completed)
  return ['Das Wartungstor ist verschlossen.','Zuerst Vaters Aufnahme im Kontrollraum finden.'];
 return null;
}
const route=[
 {a:'station_wurzelheim',b:'station_moorglas',flag:'railsReady'},
 {a:'station_moorglas',b:'station_stillwasser',flag:'chapter5.completed'},
 {a:'station_stillwasser',b:'station_kronenstadt',flag:'chapter8.completed'},
 {a:'station_kronenstadt',b:'station_frost',flag:'chapter9.completed'},
 {a:'station_frost',b:'under_city_station',flag:'chapter10.completed'}
];
function unlocked(s,id){
 const c=ensure(s);
 if(id==='station_wurzelheim')return !!c.rail_wurzelheim;
 if(id==='station_moorglas')return !!(c.rail_moorglas||c.railsReady);
 if(id==='station_stillwasser')return !!s.chapter5?.completed;
 if(id==='station_kronenstadt')return !!s.chapter8?.completed;
 if(id==='station_frost')return !!s.chapter9?.completed;
 if(id==='under_city_station')return !!s.chapter10?.completed;
 return false;
}
function destinations(s,from=s.currentMapId){
 if(!unlocked(s,from))return [];
 const reachable=new Set([from]),queue=[from];
 while(queue.length){
  const here=queue.shift();
  for(const edge of route){
   const active=edge.flag==='chapter5.completed'?s.chapter5?.completed:
     edge.flag==='chapter8.completed'?s.chapter8?.completed:
     edge.flag==='chapter9.completed'?s.chapter9?.completed:
     edge.flag==='chapter10.completed'?s.chapter10?.completed:ensure(s)[edge.flag];
   if(!active)continue;
   const next=edge.a===here?edge.b:edge.b===here?edge.a:null;
   if(next&&!reachable.has(next)&&window.EchoMaps.get(next)?.spawns.platform){
    reachable.add(next);queue.push(next);
   }
  }
 }
 reachable.delete(from);
 return Array.from(reachable).filter(id=>unlocked(s,id)).map(id=>({id,name:names[id]||window.EchoChapter5?.names[id]||window.EchoStoryRegions?.names[id]||window.EchoEndgame?.names[id]||id}));
}
function depart(s,targetId){
 const from=s.currentMapId,to=window.EchoMaps.get(targetId),src=window.EchoMaps.get(from);
 if(!src||!to||!src.spawns.platform||!to.spawns.platform||
   !destinations(s,from).some(x=>x.id===targetId))return false;
 const p=to.spawns.platform;
 // All checks complete before mutating the save.
 s.currentMapId=targetId;s.safeSpawnId='platform';s.scene='OVERWORLD';
 s.player={...s.player,x:p.x,y:p.y,dir:'down',stepPhase:0};
 s.encounterGrace=18;
 const c=ensure(s);
 if(targetId==='station_moorglas'){c.firstTrip=true;c.rail_moorglas=true;c.stage=Math.max(c.stage,4);}
 if(from==='station_moorglas'&&targetId==='station_wurzelheim'){
  c.returnTrip=true;
  if(c.rootBossWon&&!c.completed){
   c.completed=true;c.stage=8;c.plans=true;
   if(!c.rewardClaimed){c.rewardClaimed=true;s.orbs+=6;s.potions+=3;}
  }
 }
 return true;
}
function regionMove(s,dx,dy){
 const r=window.EchoMaps,m=r.get(s.currentMapId);
 if(!m||!names[s.currentMapId])return {handled:false};
 const x=s.player.x+dx,y=s.player.y+dy;
 if(x<0||y<0||x>=m.width||y>=m.height)return {handled:true};
 const edge=r.getExitAt(m.mapId,x,y);
 if(edge){
  const denial=access(s,edge.exitId);
  if(denial)return {handled:true,lines:denial};
  if(r.travel(s,edge.exitId))return {handled:true,travel:true,lines:[names[s.currentMapId]]};
  return {handled:true,lines:['Weg derzeit gesperrt.']};
 }
 if(blocked.has(m.tiles[y][x])||markers[m.mapId]?.some(p=>p.x===x&&p.y===y))return {handled:true};
 s.player.x=x;s.player.y=y;s.player.stepPhase=s.player.stepPhase===1?2:1;
 return {handled:true,moved:true,grass:m.tiles[y][x]===2};
}
function interact(s,tx,ty){
 const c=ensure(s);
 const list=markers[s.currentMapId]||[];
 const p=list.find(x=>x.x===tx&&x.y===ty)||
  list.find(x=>x.x===s.player.x&&x.y===s.player.y);
 if(!p)return {lines:[names[s.currentMapId]+'. Hier klingt ein altes Echo nach.']};
 const out={changed:false,lines:[]};
 const change=(k,v)=>{c[k]=v;out.changed=true;};
 switch(p.type){
  case 'diary':
   out.lines=['Vater: Die Schienen verbinden Herzen.','Das Kontinuum benutzt sie als Fesseln.'];break;
  case 'lamp':
   out.lines=['Eine Lampe beleuchtet das alte Schild: WURZELHEIM - MOORGLAS.'];break;
  case 'edda':
   c.stage=Math.max(c.stage,1);
   out.changed=true;
   out.lines=c.railsReady?['Edda: Die sicheren Reiseleitungen laufen!','Die Zuege bringen dich kostenlos nach Moorglas.']:
    ['Edda: Schalte die drei Notweichen in der Reihenfolge A, C, B.',
     'Dann kann der Zug gefahrlos fahren.'];break;
  case 'switchA':case 'switchB':case 'switchC':{
   const correct=['A','C','B'],name=p.type.slice(-1),next=correct[c.switches.length];
   if(c.railsReady){out.lines=['Alle drei Weichen sind bereits sicher verbunden.'];break;}
   if(name!==next){
    out.lines=['Die Weiche '+name+' sperrt das Gleis.','Gesucht: '+next+' (Reihenfolge A, C, B).'];break;
   }
   c.switches=[...c.switches,name];out.changed=true;
   if(c.switches.length===3){
    change('railsReady',true);change('rail_wurzelheim',true);change('stage',3);
    out.lines=['Alle Weichen stehen richtig!','Die Echo-Bahn Wurzelheim - Moorglas ist freigeschaltet.'];
   }else out.lines=['Weiche '+name+' gesichert ('+c.switches.length+'/3).'];
   break;
  }
  case 'train':
   if(!unlocked(s,s.currentMapId)){
    out.lines=['Der Zug bleibt still.','Im Weichenhof muss zuerst die Route A, C, B gestellt werden.'];break;
   }
   out.rail=true;out.lines=['ECHO-BAHN: Ziel waehlen.'];break;
  case 'stationMaster':
   out.lines=['Stationshueterin: Willkommen in Moorglas.','Die Rueckfahrt nach Wurzelheim ist jederzeit kostenlos.'];break;
  case 'willow':
   out.lines=['Die Irrlichter tragen Erinnerungen ueber das Moor.','Zwischen den Wurzeln versteckt sich eine fremde Maschine.'];break;
  case 'healer':
   s.team?.forEach(t=>t.hp=t.maxHp);out.changed=true;
   out.lines=['Der Moorbrunnen heilt alle deine Wesen.'];break;
  case 'courier':
   if(c.courierWon){out.lines=['Der Kurier: Projekt Permanenz ist nicht nur Forschung.','Varek will Erinnerungen gegen ihren Willen festhalten.'];break;}
   out.boss='courier';
   out.lines=['Kontinuum-Kurier: Ihr zerstoert unsere Hoffnung!','Ein Kampf beginnt.'];break;
  case 'rootBoss':
   if(!c.courierWon){out.lines=['Eine Wurzelbarriere versperrt den Kern.','Rede zuerst mit dem Kontinuum-Kurier.'];break;}
   if(c.rootBossWon){out.lines=['Der Schattenkern ist still.','Kehre mit der Bahn nach Wurzelheim zurueck.'];break;}
   out.boss='root';
   out.lines=['Eine riesige Schattenwurzel erhebt sich aus dem Moor!'];break;
 }
 return out;
}
function victory(s,which){
 const c=ensure(s);
 if(which==='courier'&&!c.courierWon){
  c.courierWon=true;c.stage=Math.max(5,c.stage);
  return ['Der Kurier laesst sein Kontinuum-Abzeichen fallen.',
   'Seine Worte deuten auf Vareks Projekt Permanenz.'];
 }
 if(which==='root'&&!c.rootBossWon){
  c.rootBossWon=true;c.stage=7;
  return ['Die Schattenwurzel ist besiegt.','Moorglas ist sicher. Fahre mit der Echo-Bahn zurueck.'];
 }
 return [];
}
function goal(s){
 const c=ensure(s);
 if(c.completed)return 'KAPITEL 4: GESCHAFFT';
 if(!c.railsReady)return 'WEICHEN: A - C - B';
 if(!c.firstTrip)return 'FAHRE MIT DER ECHO-BAHN';
 if(!c.courierWon)return 'FINDE DEN KONTINUUM-KURIER';
 if(!c.rootBossWon)return 'SUCHE DIE SCHATTENWURZEL';
 return 'RUECKFAHRT NACH WURZELHEIM';
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawChar){
 const id=s.currentMapId;
 if(id.startsWith('station_')){
  for(let x=0;x<22;x++){
   const px=x*16-camX,py=3*16-camY;
   pix(px,py,16,16,'#45505c');pix(px,py+6,16,3,'#bca67f');
   pix(px,py+12,16,2,'#9b9c90');
   const ty=10*16-camY;
   pix(px,ty,16,4,'#b6aa88');pix(px+5,ty+2,3,12,'#454d58');
  }
  if(id==='station_wurzelheim'||id==='station_moorglas'){
   let x=14*16-camX,y=4*16-camY;
   pix(x,y,56,32,'#354653');pix(x+3,y+4,50,21,'#a99278');
   for(let k=0;k<3;k++)pix(x+7+k*14,y+7,9,11,'#96b9c2');
   pix(x+6,y+26,47,3,'#d9be80');
  }
 }
 if(id==='moorglas_bog'){
  for(let i=0;i<16;i++){
   const px=(i*7%22+1)*16-camX,py=(i*11%13+2)*16-camY;
   pix(px+4,py+10,3,5,'#51665c');
   pix(px,py+1,12,10,i%2?'#82ac91':'#749f99');
   pix(px+3,py-2,6,6,'#b6c5ad');
  }
 }
 for(const p of markers[id]||[]){
  const x=p.x*16-camX,y=p.y*16-camY;
  if(x<-16||x>320||y<-16||y>180)continue;
  if(['edda','courier','stationMaster'].includes(p.type)){
   drawChar(x,y,p.type==='courier'?'#9d768d':'#c8a46f',0,p.type==='courier'?'courier':p.type==='edda'?'edda':'stationMaster','down');
  }else if(p.type==='rootBoss'){
   pix(x-3,y-3,22,20,'#2e3c4f');pix(x+2,y,13,15,'#775b88');
   pix(x+4,y+3,3,3,'#ebc2d4');pix(x+12,y+3,3,3,'#ebc2d4');
  }else{
   const color=p.type==='train'?'#f2b76b':
    p.type.startsWith('switch')?'#e7c782':p.type==='healer'?'#87d5c0':'#b6c5aa';
   pix(x+2,y+6,12,8,'#283f49');
   pix(x+4,y+2,8,12,color);pix(x+6,y+4,3,3,'#fff5c4');
  }
 }
 const map=window.EchoMaps.get(id);
 for(const e of map.exits){
  const x=e.x*16-camX,y=e.y*16-camY;
  if(x<-16||x>320||y<-16||y>180)continue;
  pix(x+3,y+1,10,14,'#2b4456');pix(x+5,y+3,6,10,'#f1c78b');
 }
 pix(6,5,218,19,'#243843dd');letter(names[id],12,18,10,'#fff0bc');
 pix(6,158,307,17,'#243843dd');letter(goal(s),12,170,9,'#fff0bc');
}
function drawRailMenu(ctx,s,cursor){
 ctx.fillStyle='#142b38';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#f3e0ad';ctx.font='bold 17px monospace';ctx.fillText('ECHO-BAHN',23,30);
 ctx.font='10px monospace';ctx.fillText('KOSTENLOSE FAHRT / RUECKWEG GARANTIERT',19,49);
 const options=destinations(s),rowH=Math.min(25,Math.floor(90/Math.max(1,options.length)));
 for(let i=0;i<options.length;i++){
  const top=59+i*rowH;
  ctx.fillStyle=i===cursor?'#f0d79d':'#607d80';ctx.fillRect(18,top,285,rowH-2);
  ctx.fillStyle=i===cursor?'#263d48':'#fff3cf';
  ctx.font=options.length>=5?'bold 11px monospace':'bold 12px monospace';
  ctx.fillText((i===cursor?'> ':'  ')+options[i].name,28,top+Math.min(17,rowH-3));
 }
 ctx.fillStyle='#e4d4ad';ctx.font='10px monospace';
 ctx.fillText('D-PAD: ZIEL    A: FAHREN    B: ZURUECK',13,168);
}
function drawRegionMap(ctx,s){
 const map=window.EchoMaps.get(s.currentMapId),w=map.width,h=map.height;
 ctx.fillStyle='#1b3240';ctx.fillRect(0,0,320,180);
 ctx.fillStyle='#f6dca4';ctx.font='bold 13px monospace';ctx.fillText(names[s.currentMapId],9,19);
 const scale=Math.min(270/w,125/h,9),left=(320-w*scale)/2,top=30;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const t=map.tiles[y][x];ctx.fillStyle=t===1?'#435965':t===4?'#527e93':t===2?'#779f6e':'#a0a59b';
  ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
 }
 ctx.fillStyle='#fff2a5';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
 ctx.font='10px monospace';ctx.fillText('A / B: ZURUECK',10,174);
}
window.EchoChapter4=Object.freeze({register,ensure,access,regionMove,interact,victory,goal,draw,drawRailMenu,drawRegionMap,names,markers});
window.EchoRail=Object.freeze({route,destinations,depart,unlocked});
})();
