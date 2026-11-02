/* Echo-Chroniken - Chapter 3: four connected, safely reversible regions.
   Designed to be usable with existing saves, controller and touch. */
(() => {
'use strict';
const LEGACY='legacy_wurzeldorf';
const blocked=new Set([1,4,5,7]);
const named={
  lake_north_path:'NORDUFER',
  nebelhafen_town:'NEBELHAFEN',
  pumpworks_floor1:'ALTES PUMPWERK',
  pumpworks_controlroom:'KONTROLLRAUM'
};
function terrain(w,h,kind){
  const a=Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>{
    if(x===0||y===0||x===w-1||y===h-1)return 1;
    const n=(x*37+y*19+x*y*3)%31;
    return kind==='lake' ? (y<5&&x>5&&x<19?4:n===2?2:0) :
      kind==='harbor' ? (y<6&&x>4&&x<18?4:n===3?2:0) :
      (n===7?1:3);
  }));
  return a;
}
function rect(a,x0,y0,x1,y1,tile){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)
    if(a[y]&&a[y][x]!==undefined)a[y][x]=tile;
}
function makeMaps(){
  const lake=terrain(24,17,'lake');
  rect(lake,1,8,22,10,3);rect(lake,9,6,11,10,3);
  rect(lake,13,10,15,13,2);rect(lake,1,9,2,9,3);
  rect(lake,21,9,22,9,3);
  const harbor=terrain(26,18,'harbor');
  rect(harbor,1,8,23,10,3);
  rect(harbor,10,6,20,14,3);
  rect(harbor,17,6,23,8,3);
  rect(harbor,13,4,15,6,3);
  rect(harbor,6,10,8,12,3);
  // Decorative harbor buildings also occupy solid map tiles.
  rect(harbor,3,12,5,14,5);
  rect(harbor,19,3,21,5,5);
  rect(harbor,2,3,4,5,5);
  const pump=terrain(20,16,'inside');
  rect(pump,1,7,18,9,3);rect(pump,4,4,17,12,3);
  rect(pump,6,11,16,13,4);rect(pump,6,11,8,11,3);rect(pump,12,10,13,10,3);
  rect(pump,1,8,3,8,3);rect(pump,16,7,18,8,3);
  const control=terrain(14,12,'inside');
  rect(control,1,5,12,7,3);rect(control,3,3,11,9,3);
  rect(control,1,6,3,6,3);
  const maps=[
    {mapId:'lake_north_path',tiles:lake,
     spawns:{from_village:{x:2,y:9},from_harbor:{x:21,y:9}},
     exits:[
       {exitId:'to_village',x:1,y:9,toMapId:LEGACY,toSpawnId:'north_shore',returnExitId:'to_lake'},
       {exitId:'to_harbor',x:22,y:9,toMapId:'nebelhafen_town',toSpawnId:'west_gate',returnExitId:'to_lake_path'}
     ]},
    {mapId:'nebelhafen_town',tiles:harbor,
     spawns:{west_gate:{x:2,y:9},pump_approach:{x:21,y:8}},
     exits:[
       {exitId:'to_lake_path',x:1,y:9,toMapId:'lake_north_path',toSpawnId:'from_harbor',returnExitId:'to_harbor'},
       {exitId:'to_pumpworks',x:23,y:8,toMapId:'pumpworks_floor1',toSpawnId:'entry',returnExitId:'to_town',requiredFlag:'chapter3.witnessesReady'}
     ]},
    {mapId:'pumpworks_floor1',tiles:pump,
     spawns:{entry:{x:2,y:8},control_approach:{x:17,y:8}},
     exits:[
       {exitId:'to_town',x:1,y:8,toMapId:'nebelhafen_town',toSpawnId:'pump_approach',returnExitId:'to_pumpworks'},
       {exitId:'to_control',x:18,y:8,toMapId:'pumpworks_controlroom',toSpawnId:'entry',returnExitId:'to_pump',requiredFlag:'chapter3.waterLowered'}
     ]},
    {mapId:'pumpworks_controlroom',tiles:control,
     spawns:{entry:{x:2,y:6}},
     exits:[
       {exitId:'to_pump',x:1,y:6,toMapId:'pumpworks_floor1',toSpawnId:'control_approach',returnExitId:'to_control'}
     ]}
  ];
  return maps;
}
const markers={
  lake_north_path:[
    {x:10,y:7,label:'Alter Steg',type:'note'},
    {x:15,y:12,label:'Uferlicht',type:'note'}
  ],
  nebelhafen_town:[
    {x:10,y:8,label:'Lotsin Sera',type:'sera'},
    {x:7,y:11,label:'Fischer Jaro',type:'witness0'},
    {x:14,y:5,label:'Archivarin Nemi',type:'witness1'},
    {x:18,y:13,label:'Bootsbauer Taro',type:'witness2'},
    {x:20,y:9,label:'Heilbrunnen',type:'heal'}
  ],
  pumpworks_floor1:[
    {x:5,y:5,label:'Strompult',type:'power'},
    {x:8,y:5,label:'Ventil A',type:'valve0'},
    {x:12,y:10,label:'Ventil B',type:'valve1'},
    {x:15,y:7,label:'Pumpenrotor',type:'rotor'}
  ],
  pumpworks_controlroom:[
    {x:9,y:5,label:'Pumpenwaechter',type:'boss'},
    {x:9,y:8,label:'Tonarchiv',type:'recording'}
  ]
};
const emptyProgress=()=>({
  stage:0,witnesses:[],witnessesReady:false,power:false,valves:[],
  waterLowered:false,bossWon:false,recording:false,rewardClaimed:false,
  maintenance_token:false,completed:false
});
function ensure(s){
  if(!s.chapter3||typeof s.chapter3!=='object'||Array.isArray(s.chapter3))s.chapter3=emptyProgress();
  const c=s.chapter3;
  for(const [k,v] of Object.entries(emptyProgress()))
    if(c[k]===undefined)c[k]=Array.isArray(v)?[]:v;
  c.witnesses=Array.isArray(c.witnesses)?c.witnesses.filter(x=>[0,1,2].includes(x)):[];
  c.valves=Array.isArray(c.valves)?c.valves.filter(x=>[0,1].includes(x)):[];
  return c;
}
function register(legacy){
  const registry=window.EchoMaps;
  if(!registry||!registry.get(LEGACY))throw Error('Register legacy map before Chapter 3');
  for(let y=9;y<=13;y++)legacy[y][24]=3;
  // Two adjacent tiles give the player an unobstructed, recognizable northshore gate.
  registry.addSpawn(LEGACY,'north_shore',{x:24,y:10});
  registry.addExit(LEGACY,{exitId:'to_lake',x:24,y:9,toMapId:'lake_north_path',
    toSpawnId:'from_village',returnExitId:'to_village',requiredFlag:'ruinsProgress.bossWon'});
  for(const m of makeMaps())registry.register(m);
  return registry.validateNetwork();
}
function access(s,id){
  if(id==='to_lake'&&!s.ruinsProgress?.bossWon)
    return ['Der Weg zum Nordufer ist noch versiegelt.','Loese zuerst das Raetsel in der Ruine der Echos.'];
  if(id==='to_pumpworks'&&!ensure(s).witnessesReady)
    return ['Die Pumpwerkswache laesst dich noch nicht hinein.','Sprich zuerst mit Sera und drei Zeugen im Hafen.'];
  if(id==='to_control'&&!ensure(s).waterLowered)
    return ['Der Kontrollraum steht noch unter Wasser.','Aktiviere Strom, beide Ventile und den Rotor.'];
  return null;
}
function regionMove(s,dx,dy){
  const registry=window.EchoMaps, map=registry?.get(s.currentMapId);
  if(!map||s.currentMapId===LEGACY)return {handled:false};
  const x=s.player.x+dx,y=s.player.y+dy;
  if(x<0||y<0||x>=map.width||y>=map.height)return {handled:true};
  const exit=registry.getExitAt(s.currentMapId,x,y);
  if(exit){
    const deny=access(s,exit.exitId);
    if(deny)return {handled:true,lines:deny};
    if(registry.travel(s,exit.exitId))return {handled:true,travel:true,
      lines:[named[s.currentMapId]||'Du reist weiter.']};
    return {handled:true,lines:['Dieser Weg ist zurzeit nicht passierbar.']};
  }
  if(blocked.has(map.tiles[y][x])||markers[s.currentMapId]?.some(m=>m.x===x&&m.y===y))
    return {handled:true};
  s.player.x=x;s.player.y=y;
  s.player.stepPhase=s.player.stepPhase===1?2:1;
  return {handled:true,moved:true,grass:map.tiles[y][x]===2};
}
function interact(s,tx,ty){
  const points=markers[s.currentMapId]||[];
  const m=points.find(m=>m.x===tx&&m.y===ty)||
    points.find(m=>m.x===s.player.x&&m.y===s.player.y);
  if(!m)return {lines:[named[s.currentMapId]+' - ein stiller Wind traegt Stimmen ueber das Land.']};
  const c=ensure(s),out={changed:false,lines:[]};
  const set=(k,v)=>{c[k]=v;out.changed=true;};
  switch(m.type){
    case 'note':
      out.lines=m.label==='Alter Steg'?
        ['Auf einem Schild steht: Erinnerung muss frei bleiben.']:
        ['Ein Licht reflektiert im Wasser. Es wirkt wie ein uraltes Echo.'];
      break;
    case 'sera':
      if(!c.stage)set('stage',1);
      out.lines=c.witnessesReady?
        ['Sera: Danke. Der Eingang zum Pumpwerk ist nun offen.']:
        ['Sera: Im Hafen verlieren die Echos ihre Stimmen.',
         'Bitte befrage Jaro, Nemi und Taro. Dann darfst du ins Pumpwerk.'];
      break;
    case 'witness0':case 'witness1':case 'witness2':{
      const i=Number(m.type.slice(-1));
      if(!c.stage){out.lines=['Sprich zuerst mit Lotsin Sera.'];break;}
      if(!c.witnesses.includes(i)){c.witnesses.push(i);out.changed=true;}
      if(c.witnesses.length===3&&!c.witnessesReady){set('witnessesReady',true);set('stage',2);}
      const words=[
        'Jaro: Der See wiederholt seit Tagen die letzte Stimme meines Bruders.',
        'Nemi: Jemand hat den Resonanzkern absichtlich eingeschaltet.',
        'Taro: Unter dem Pumpwerk verlaeuft eine alte Bahnleitung.'
      ];
      out.lines=[words[i],c.witnessesReady?
        'Alle drei Hinweise gefunden. Der Weg ins Pumpwerk ist frei.':
        'Hinweise: '+c.witnesses.length+'/3'];
      break;
    }
    case 'heal':
      s.team?.forEach(t=>t.hp=t.maxHp);out.changed=true;
      out.lines=['Der Hafenbrunnen heilt dein ganzes Team.'];break;
    case 'power':
      if(!c.power)set('power',true);
      out.lines=['Das alte Strompult erwacht. Die Ventile bekommen Energie.'];break;
    case 'valve0':case 'valve1':{
      const i=Number(m.type.slice(-1));
      if(!c.power){out.lines=['Kein Strom! Aktiviere zuerst das Strompult.'];break;}
      if(!c.valves.includes(i)){c.valves.push(i);out.changed=true;}
      out.lines=['Ventil '+(i?'B':'A')+' geoeffnet ('+c.valves.length+'/2).'];
      break;
    }
    case 'rotor':
      if(!c.power||c.valves.length!==2){out.lines=['Der Rotor blockiert. Strom und beide Ventile fehlen.'];break;}
      if(!c.waterLowered){set('waterLowered',true);set('stage',4);}
      out.lines=['Der Rotor dreht. Der Wasserspiegel sinkt!',
        'Der Kontrollraum im Osten ist nun erreichbar.'];break;
    case 'boss':
      if(!c.waterLowered){out.lines=['Der Waechter ist noch hinter einer Flutbarriere.'];break;}
      if(c.bossWon){out.lines=['Der Pumpenwaechter ruht. Das Tonarchiv ist jetzt zugaenglich.'];break;}
      out.boss=true;out.lines=['Der Pumpenwaechter stellt sich dir entgegen!'];break;
    case 'recording':
      if(!c.bossWon){out.lines=['Das Tonarchiv ist vom Waechter versiegelt.'];break;}
      if(!c.recording){
        set('recording',true);set('completed',true);set('maintenance_token',true);set('stage',8);
        if(!c.rewardClaimed){set('rewardClaimed',true);s.orbs+=3;s.potions+=2;}
      }
      out.lines=['Vaters Aufnahme: Jemand hat die Echos des Sees ueberschrieben.',
        'Die Leitung fuehrt unter die Wurzeln. Ich musste sie verriegeln.',
        'Kapitel 3 geschafft! Du erhaeltst die Wartungsmarke.',
        'Belohnung: 3 Seelen-Sphaeren und 2 Traenke (nur einmal).'];
      break;
  }
  return out;
}
function victory(s){
  const c=ensure(s);
  if(c.bossWon)return [];
  c.bossWon=true;c.stage=6;
  return ['Der Pumpenwaechter gibt das Tonarchiv frei.',
    'Untersuche das Aufnahmegeraet im Kontrollraum.'];
}
function goal(s){
  const c=ensure(s);
  if(c.completed)return 'KAPITEL 3: GESCHAFFT';
  if(s.currentMapId==='lake_north_path')return 'FOLGE DEM WEG ZUM HAFEN';
  if(!c.stage)return 'SUCHE LOTSIN SERA';
  if(!c.witnessesReady)return 'ZEUGEN '+c.witnesses.length+'/3';
  if(!c.waterLowered)return 'STROM / VENTILE / ROTOR';
  if(!c.bossWon)return 'KONTROLLRAUM: WAECHTER';
  return 'HOERE VATERS AUFNAHME';
}
function drawScenery(id,tick,camX,camY,pix){
  const cell=(x,y)=>[x*16-camX,y*16-camY];
  const house=(x,y,roof)=>{
    const [sx,sy]=cell(x,y);
    pix(sx,sy+12,48,36,'#c4b18e');
    pix(sx+4,sy+15,40,28,'#e8d1a7');
    pix(sx-3,sy+2,54,16,'#3a4c58');
    pix(sx,sy+5,48,10,roof);
    for(let k=0;k<3;k++)pix(sx+6+k*15,sy+6,8,2,'#c9a97e');
    pix(sx+17,sy+29,14,19,'#4d5d61');
    pix(sx+21,sy+33,6,13,'#95795b');
    pix(sx+5,sy+25,8,10,'#79a8b7');
    pix(sx+35,sy+25,8,10,'#79a8b7');
  };
  if(id==='nebelhafen_town'){
    house(3,12,'#bd705d');house(19,3,'#55768c');house(2,3,'#9279a7');
    let [x,y]=cell(11,3);
    pix(x+7,y,18,79,'#695845');pix(x+9,y,14,79,'#d1ae70');
    for(let n=0;n<5;n++)pix(x+8,y+n*15,16,2,'#f1ca83');
    [x,y]=cell(12,2);
    pix(x,y+8,57,9,'#5d4047');pix(x+7,y+16,43,5,'#dca771');
    pix(x+26,y-7,2,16,'#efe8bf');pix(x+29,y-5,12,10,'#f4e4c0');
    for(const [lx,ly] of [[9,7],[17,11],[22,10]]){
      [x,y]=cell(lx,ly);
      pix(x+7,y-12,2,23,'#5a5a54');pix(x+3,y-16,10,6,'#f0d995');
      pix(x+5,y-14,6,3,'#fff1bc');
    }
  }else if(id==='lake_north_path'){
    let [x,y]=cell(9,4);
    pix(x+4,y,35,63,'#87684f');
    for(let i=0;i<5;i++)pix(x+5,y+3+i*12,33,4,'#d1a36f');
    [x,y]=cell(15,12);
    pix(x+4,y+6,13,8,'#627f81');pix(x+8,y+2,6,7,'#a9d9c8');
  }else if(id==='pumpworks_floor1'){
    let [x,y]=cell(9,3);
    pix(x,y,65,37,'#334c58');pix(x+4,y+4,57,29,'#637f89');
    for(let i=0;i<3;i++){pix(x+8+i*18,y+6,12,17,'#9ab4b3');pix(x+12+i*18,y+10,4,9,'#b9ddcd');}
    [x,y]=cell(13,11);
    pix(x,y,56,8,'#4d6468');pix(x+2,y+2,52,3,'#d0ad65');
  }else if(id==='pumpworks_controlroom'){
    let [x,y]=cell(4,3);
    pix(x,y,51,24,'#354f5d');pix(x+3,y+3,45,18,'#63838b');
    for(let k=0;k<3;k++){pix(x+8+k*13,y+6,6,7,k===1?'#e0bd79':'#86c8c0');}
    [x,y]=cell(10,7);
    pix(x,y,21,25,'#344f57');pix(x+4,y+5,13,9,'#d9bf89');
  }
}
function draw(ctx,tick,s,camX,camY,pix,letter,drawCharacter){
  drawScenery(s.currentMapId,tick,camX,camY,pix);
  const points=markers[s.currentMapId]||[];
  for(const p of points){
    const x=p.x*16-camX,y=p.y*16-camY;
    if(x<-20||y<-22||x>330||y>192)continue;
    if(['sera','witness0','witness1','witness2'].includes(p.type)){
      drawCharacter(x,y,p.type==='sera'?'#e9aa67':'#7ac3b5',0,p.type,'down');
    }else{
      const color=p.type==='boss'?'#ae696f':p.type==='recording'?'#ffd18b':
        p.type==='heal'?'#a0e7cf':p.type==='note'?'#87bed8':'#bda77e';
      pix(x+2,y+5,12,10,'#243d4b');pix(x+4,y+3,8,10,color);
      pix(x+6,y+4,3,2,'#fff5ca');
    }
  }
  const map=window.EchoMaps.get(s.currentMapId);
  for(const e of map.exits){
    const x=e.x*16-camX,y=e.y*16-camY;
    if(x<-17||y<-17||x>325||y>185)continue;
    pix(x+3,y+1,10,14,'#35586e');pix(x+5,y+3,6,10,'#f4c989');
  }
  pix(7,5,151,17,'#263e49da');letter(named[s.currentMapId],13,17,10,'#fff2cc');
  pix(8,158,300,16,'#243f4add');letter(goal(s),14,169,9,'#fff4cd');
}
function drawRegionMap(ctx,s){
  const map=window.EchoMaps.get(s.currentMapId),w=map.width,h=map.height;
  ctx.fillStyle='#1e3744';ctx.fillRect(0,0,320,180);
  ctx.fillStyle='#f4e4b9';ctx.font='bold 13px monospace';ctx.fillText(named[s.currentMapId],12,21);
  const scale=Math.min(270/w,122/h,9),left=(320-w*scale)/2,top=28;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const t=map.tiles[y][x];
    ctx.fillStyle=t===1?'#365e56':t===4?'#5f9db6':t===2?'#78a16b':t===3?'#d1bd8c':'#94b68c';
    ctx.fillRect(left+x*scale,top+y*scale,Math.ceil(scale),Math.ceil(scale));
  }
  ctx.fillStyle='#fff0b0';ctx.fillRect(left+s.player.x*scale,top+s.player.y*scale,Math.max(3,scale),Math.max(3,scale));
  ctx.font='10px monospace';ctx.fillText('A / B: Zurueck',12,174);
}
window.EchoChapter3=Object.freeze({register,ensure,access,regionMove,interact,victory,goal,draw,drawRegionMap,named,markers});
})();
