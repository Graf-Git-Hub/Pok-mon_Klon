/* Wurzelheim indoor scenes: controller-first navigation, two useful activities.
   Existing Grandma scene and overworld coordinates are not replaced. */
(() => {
'use strict';
const ROOMS={
  kraeuter:{name:'KRÄUTERHAUS',wall:'#a9c6a1',floor:'#cfb895',wood:'#735848',accent:'#83a17d',title:'DIE DREI LICHTER'},
  werkstatt:{name:'WERKSTATT',wall:'#acb1ac',floor:'#bca788',wood:'#63554c',accent:'#94b5b9',title:'SPHÄREN-KALIBRIERUNG'}
};
const POTIONS=[
 {x:5,y:4,color:'#78cbe0',label:'BLAU'},
 {x:8,y:4,color:'#e9ca77',label:'GOLD'},
 {x:11,y:4,color:'#ed9cb6',label:'ROSA'}
];
const ORDER=[0,1,2];
const movable=(x,y)=>x>=2&&x<=13&&y>=3&&y<=9&&!(x===4&&y===7)&&!((x===5||x===8||x===11)&&y===4)&&!(x>=10&&x<=12&&y===3);
function ensure(s){
 if(!s.indoorProgress||typeof s.indoorProgress!=='object')s.indoorProgress={};
 const p=s.indoorProgress;
 if(!p.kraeuter||typeof p.kraeuter!=='object')p.kraeuter={index:0,solved:false};
 p.kraeuter.index=Math.max(0,Math.min(3,Number(p.kraeuter.index)||0));
 p.kraeuter.solved=!!p.kraeuter.solved;
 if(!p.werkstatt||typeof p.werkstatt!=='object')p.werkstatt={calibrated:false};
 p.werkstatt.calibrated=!!p.werkstatt.calibrated;
 return p;
}
function enter(s,id){
 if(!ROOMS[id])return false;
 ensure(s);
 s.returnToVillage={x:s.player.x,y:s.player.y};
 s.roomId=id;s.scene='BUILDING';
 s.player={x:7,y:8,dir:'up',stepPhase:0};
 s.encounterGrace=Math.max(12,s.encounterGrace||0);
 return true;
}
function exit(s){
 const where=s.returnToVillage||{x:5,y:6};
 s.scene='OVERWORLD';s.roomId=null;
 s.player={x:where.x,y:where.y,dir:'down',stepPhase:0};
 s.encounterGrace=Math.max(12,s.encounterGrace||0);
}
function walk(s,dx,dy,dir,showDialog,sfx){
 const p=s.player;p.dir=dir;
 const x=p.x+dx,y=p.y+dy;
 if(y>=10&&x>=6&&x<=8){exit(s);sfx?.confirm?.();return {exited:true};}
 if(!movable(x,y))return {exited:false};
 p.x=x;p.y=y;p.stepPhase=(p.stepPhase+1)%2;
 sfx?.step?.();return {exited:false};
}
function near(p,x,y){return !!p&&Math.abs(p.x-x)+Math.abs(p.y-y)<=2;}
function interact(s,showDialog,sfx){
 const p=ensure(s),id=s.roomId,pos=s.player;
 if(id==='kraeuter'){
   if(near(pos,4,7)){
     return [
       'Kräuterfrau Fenja: „Die leuchtenden Kräuter geraten durcheinander.“',
       '„Aktiviere die Töpfe von links nach rechts: Blau, Gold, Rosa.“',
       p.kraeuter.solved?'„Du hast mir bereits geholfen. Danke!“':'„Stell dich vor den passenden Topf und drücke A.“'
     ];
   }
   const potIndex=POTIONS.findIndex(t=>near(pos,t.x,t.y)&&Math.abs(pos.x-t.x)+Math.abs(pos.y-t.y)<=1);
   if(potIndex>=0){
     if(p.kraeuter.solved)return ['Die Kräuter leuchten nun ruhig. Fenjas Rätsel ist bereits gelöst.'];
     if(ORDER[p.kraeuter.index]===potIndex){
       p.kraeuter.index++;
       sfx?.confirm?.();
       if(p.kraeuter.index>=ORDER.length){
         p.kraeuter.solved=true;
         s.potions=(Number(s.potions)||0)+2;
         s.orbs=(Number(s.orbs)||0)+3;
         sfx?.evolve?.();
         return ['✨ Blau, Gold und Rosa erstrahlen gemeinsam!',
           'Fenja: „Das hast du wunderbar gemacht!“',
           '🎁 Du bekommst 2 Seelen-Tränke und 3 Seelen-Sphären.'];
       }
       return ['Der '+POTIONS[potIndex].label+'-Topf leuchtet auf! ('+p.kraeuter.index+'/3)',
          'Als Nächstes: '+POTIONS[ORDER[p.kraeuter.index]].label+'.'];
     }
     p.kraeuter.index=0;sfx?.cancel?.();
     return ['Die Kräuter verlieren ihren Glanz. Versuch es erneut:',
       'Blau → Gold → Rosa. Keine Sorge, du verlierst nichts.'];
   }
   return ['Ein gemütliches Kräuterhaus. Fenja steht links, die drei Leuchttöpfe oben.'];
 }
 if(id==='werkstatt'){
   if(near(pos,4,7)){
     return [
       'Mechanikerin Edda: „Ich kann deine Seelen-Sphären kalibrieren.“',
       p.werkstatt.calibrated?'„Dein Fang-Kompass funktioniert bereits perfekt!“':
         '„Geh zum großen Arbeitstisch rechts oben und drücke A. Kostenlos, versprochen!“'
     ];
   }
   if(near(pos,11,4)){
     if(p.werkstatt.calibrated)return ['Die Fang-Linse ist bereits kalibriert. Deine Sphären reagieren nun zuverlässiger.'];
     if(!s.hasStarter)return ['Für die Kalibrierung brauchst du erst dein erstes Seelenwesen.'];
     p.werkstatt.calibrated=true;
     s.orbs=(Number(s.orbs)||0)+2;
     sfx?.evolve?.();
     return ['🔧 Edda hat deine Fang-Linse justiert!',
       'Deine Seelen-Sphären fangen wilde Wesen jetzt etwas zuverlässiger (+8 Prozentpunkte).',
       '🎁 Du bekommst außerdem 2 Seelen-Sphären.'];
   }
   return ['Eine Werkstatt voller Zahnräder, Ersatzteile und leuchtender Fang-Linsen.'];
 }
 return ['Hier ist es angenehm ruhig.'];
}
function captureBonus(s){return ensure(s).werkstatt.calibrated?.08:0;}
function render(ctx,tick,s,drawChar){
 const id=s.roomId,room=ROOMS[id]||ROOMS.kraeuter,p=ensure(s);
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
 const txt=(v,x,y,size=9,c='#fff3c8')=>{ctx.save();ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.fillText(v,x,y);ctx.restore();};
 rect(0,0,320,180,'#1b3538');
 rect(17,5,286,170,'#4a4c43');
 rect(22,9,276,162,room.floor);
 rect(24,10,272,32,room.wall);
 for(let i=0;i<17;i++){rect(25+i*16,12,1,27,'#d4dcc0');rect(25+i*16,48,1,121,'#b3997b');}
 for(let i=0;i<12;i++){rect(24,46+i*10,272,1,'#ae9476');}
 // Wooden beams / windows with garden illumination.
 rect(24,39,272,5,room.wood);
 for(const x of [65,228]){
   rect(x,15,37,25,room.wood);rect(x+3,18,31,18,'#b9e4d8');
   rect(x+17,17,3,22,room.wood);rect(x+3,26,31,2,room.wood);
   rect(x+5,29,8,5,'#9ec08b');rect(x+22,29,8,5,'#9ec08b');
 }
 // Rugs and crates.
 rect(114,106,96,43,room.wood);rect(119,110,86,35,room.accent);
 for(let i=0;i<6;i++){rect(123+i*13,114,4,27,'#ecd5a4');}
 rect(45,66,45,12,room.wood);rect(48,66,39,7,'#d9b486');
 rect(49,77,7,20,room.wood);rect(81,77,7,20,room.wood);
 drawChar(4*16,7*16,id==='kraeuter'?'#bd8294':'#85aeb8',0,id==='kraeuter'?'nemi':'taro','down');
 if(id==='kraeuter'){
   // Three clearly spaced interactable pots, with visible order/progress.
   rect(77,55,128,11,room.wood);
   for(let i=0;i<3;i++){
     const x=POTIONS[i].x*16;
     rect(x,57,15,11,'#735340');rect(x+3,49,9,10,'#a97957');
     rect(x+4,45,7,6,POTIONS[i].color);
     const shimmer=Math.sin(tick*.006+i*2)>0?2:0;
     rect(x+6,42-shimmer,3,4,'#fff5c7');
     if(p.kraeuter.solved||i<p.kraeuter.index)rect(x+5,39,5,3,'#fff5b7');
     txt((i+1)+'.',x+2,77,8,'#5b6547');
   }
   txt(p.kraeuter.solved?'★ RÄTSEL GELÖST':'BLAU > GOLD > ROSA',95,93,9,'#4b6658');
 } else {
   rect(172,48,66,18,'#6c5647');rect(177,45,56,14,'#a8a399');
   rect(180,45,50,6,'#ddd0a8');rect(179,63,8,16,'#6c5647');rect(226,63,8,16,'#6c5647');
   rect(190,42,18,10,'#4b7582');rect(194,38,10,9,p.werkstatt.calibrated?'#b6eed0':'#f6cf8b');
   rect(198,34,3,8,'#fff0b4');rect(213,39,5,10,'#b68b68');
   for(const x of [83,107,124]){rect(x,84,12,11,'#766552');rect(x+3,81,6,5,'#b9a37f');}
   txt(p.werkstatt.calibrated?'★ LINSE FERTIG':'A: ARBEITSTISCH',173,94,8,'#4b6658');
 }
 // Door at bottom, in exactly the same visual/logic position for both buildings.
 rect(128,152,62,25,room.wood);rect(133,155,52,22,'#a17d5e');
 rect(147,157,25,18,'#6a8c83');rect(165,164,3,3,'#ffe3a3');
 rect(120,174,78,4,'#4c423d');
 drawChar(s.player.x*16+8,s.player.y*16, '#e17f74',s.player.stepPhase,'player',s.player.dir);
 rect(23,137,100,20,'#365d55');
 txt(room.name,29,150,9,'#fff1c5');
 if(id==='kraeuter'&&!p.kraeuter.solved)txt('LICHT '+p.kraeuter.index+'/3',209,151,8,'#fff6c7');
 else if(id==='werkstatt'&&!p.werkstatt.calibrated)txt('🔧 KALIBRIERUNG',194,151,8,'#fff6c7');
 txt('A: UNTERSUCHEN    ▼: AUSGANG',43,167,8,'#f5ead2');
}
window.EchoInteriors={ROOMS,POTIONS,ORDER,ensure,enter,exit,walk,interact,captureBonus,render};
})();