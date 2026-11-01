/* Echo-Chroniken: Kapitel 2 / Waldruine.
   Native 320×180 pixel scene. A small story dungeon, not a procedural tile field.
   Entirely original drawing primitives, shared by Android and browser. */
(()=>{
'use strict';
const ENTRY={x:25,y:20};
const WIDTH=20,HEIGHT=11;
const SEALS=[
 {id:'wurzel',x:4,y:5,color:'#9bc987',glow:'#ddf3b5',name:'WURZEL'},
 {id:'wasser',x:15,y:5,color:'#8fc9d3',glow:'#c8f3f2',name:'WASSER'},
 {id:'stern',x:10,y:3,color:'#e7c88c',glow:'#fff0c3',name:'STERN'}
];
const ALTAR={x:10,y:1};
const MURAL={x:9,y:6};
const blockers=new Set(['6,4','13,4','6,6','13,6','3,7','4,7','15,7','16,7','4,5','15,5','10,3','10,1','9,6']);
const hash=(a,b,c=0)=>{let v=(Math.imul(a+113,73856093)^Math.imul(b+97,19349663)^Math.imul(c+17,83492791))>>>0;v=Math.imul(v^(v>>>15),2246822519);return ((v^(v>>>13))>>>0)/4294967295;};
const near=(p,o,dist=1)=>!!p&&(Math.abs(p.x-o.x)+Math.abs(p.y-o.y)<=dist);
function ensure(s){
 if(!s.ruinsProgress||typeof s.ruinsProgress!=='object')s.ruinsProgress={};
 const q=s.ruinsProgress;
 q.seals=Array.isArray(q.seals)?q.seals.filter((v,i,a)=>SEALS.some(t=>t.id===v)&&a.indexOf(v)===i):[];
 // Saved puzzle progress must always be a valid prefix of the intended order.
 if(q.seals.some((v,i)=>SEALS[i].id!==v))q.seals=[];
 q.bossWon=!!q.bossWon;q.clueSeen=!!q.clueSeen;q.reported=!!q.reported;
 return q;
}
function prepareWorld(map){
 // A visible safe stone apron; no random encounters around the entrance.
 for(const [x,y] of [[24,20],[25,20],[26,20],[25,19],[25,21],[24,21]])
   if(map[y]&&![4,5,6,7].includes(map[y][x]))map[y][x]=8;
}
function unlocked(s){return !!(s.hasStarter&&s.routeQuest?.rewarded);}
function nearEntrance(s){
 return s.scene==='OVERWORLD'&&s.player&&near(s.player,ENTRY,1);
}
function entrance(s){
 if(!nearEntrance(s))return null;
 if(!unlocked(s)){
   return {entered:false,lines:[
    'Das steinerne Tor ist mit drei dunklen Vertiefungen versiegelt.',
    'Darunter steht: „Nur wer die drei verlorenen Seelenlichter nach Hause bringt, findet den Weg.“',
    'Vielleicht kann dir Liora am Waldpfad helfen.'
   ]};
 }
 ensure(s);
 s.ruinsReturn={x:s.player.x,y:s.player.y};
 s.scene='RUINS';
 s.player={x:10,y:8,dir:'up',stepPhase:0};
 s.encounterGrace=Math.max(18,s.encounterGrace||0);
 return {entered:true,lines:[
   'Die drei Seelenlichter auf deiner Kapsel beginnen im gleichen Takt zu leuchten.',
   'Hinter dem Steintor liegt ein längst vergessener Erinnerungsanker.',
   'Auf einer zerbrochenen Tafel stehen drei Worte: WURZEL. WASSER. STERN.'
 ]};
}
function canStep(x,y){
 if(x<2||x>17||y<2||y>9)return false;
 return !blockers.has(x+','+y);
}
function walk(s,dx,dy,dir,sfx){
 const p=s.player;p.dir=dir;
 const x=p.x+dx,y=p.y+dy;
 if(y>=10&&x>=9&&x<=11){exit(s);sfx?.confirm?.();return {exited:true};}
 if(!canStep(x,y))return {exited:false};
 p.x=x;p.y=y;p.stepPhase=(p.stepPhase+1)%2;sfx?.step?.();
 return {exited:false};
}
function exit(s){
 const p=s.ruinsReturn||{x:25,y:21};
 s.player={x:p.x,y:p.y,dir:'down',stepPhase:0};
 s.scene='OVERWORLD';s.encounterGrace=Math.max(18,s.encounterGrace||0);
}
function interact(s,sfx){
 const q=ensure(s),p=s.player;
 if(near(p,ALTAR)){
   if(q.bossWon)return {lines:[
    'Der Wächter hat sich in friedliche Lichtfunken aufgelöst.',
    'Auf dem Sockel steht Vaters Handschrift: „Nicht die Wesen sind gefährlich. Jemand benutzt ihre Erinnerungen.“'
   ]};
   if(q.seals.length<3)return {lines:[
    'Eine steinerne Gestalt versperrt den Erinnerungskern.',
    'Drei Symbole sind auf dem Boden eingeritzt: eine Wurzel, eine Welle und ein Stern.',
    'Die Wandinschrift gegenüber verrät dir ihre Reihenfolge.'
   ]};
   return {boss:true,lines:[
    'Die drei Siegel vereinen sich zu einem Lichtstrahl.',
    'Eine verhüllte Erinnerung nimmt die Gestalt eines Wächters an.',
    '„Wer das Echo bewahren will, muss beweisen, dass er es schützen kann.“'
   ]};
 }
 for(let i=0;i<SEALS.length;i++){
   const seal=SEALS[i];
   if(!near(p,seal))continue;
   if(q.bossWon)return {lines:['Das '+seal.name+'-Siegel schimmert ruhig. Der Erinnerungsanker ist wieder stabil.']};
   if(q.seals.includes(seal.id))return {lines:['Das '+seal.name+'-Siegel ist bereits aktiviert. ('+q.seals.length+'/3)']};
   const expected=SEALS[q.seals.length];
   if(expected.id!==seal.id){
     q.seals=[];sfx?.cancel?.();
     return {changed:true,lines:[
       'Die Zeichen verblassen. Die Reihenfolge war nicht richtig.',
       'Die Inschrift lautet: „Was wurzelt, bewahrt das Wasser. Was das Wasser bewahrt, tragen die Sterne.“',
       'Versuche WURZEL → WASSER → STERN. Du kannst nichts verlieren.'
     ]};
   }
   q.seals.push(seal.id);sfx?.confirm?.();
   if(q.seals.length===3){
     sfx?.evolve?.();
     return {changed:true,lines:[
       '✨ Alle drei Erinnerungssiegel beginnen zu leuchten!',
       'Ein Pfad aus Licht führt zum Wächter am nördlichen Altar.',
       'Deine Wesen werden vor dem Kampf vollständig geheilt.'
     ],heal:true};
   }
   return {changed:true,lines:[
     '✨ Das '+seal.name+'-Siegel erwacht. ('+q.seals.length+'/3)',
     'Als Nächstes: '+SEALS[q.seals.length].name+'.'
   ]};
 }
 if(near(p,MURAL,2)){
   q.clueSeen=true;
   return {changed:true,lines:[
     'Eine verwitterte Inschrift ist unter Moos zu erkennen:',
     '„Was wurzelt, bewahrt das Wasser. Was das Wasser bewahrt, tragen die Sterne.“',
     'Unter dem Text: ein kleines Symbol, genau wie auf Vaters Kapsel.',
     'Daneben eine jüngere Notiz: „Die Anker wurden nicht zerstört. Jemand hat sie absichtlich abgeschaltet.“'
   ]};
 }
 return {lines:['Die Ruine ist still. Zwischen den Steinen bewegen sich winzige Lichtfäden.','Unter der südlichen Tür führt der Weg wieder zum Waldpfad.']};
}
function victory(s){
 const q=ensure(s);
 if(q.bossWon)return [];
 q.bossWon=true;q.reported=false;
 s.potions=(Number(s.potions)||0)+2;
 s.orbs=(Number(s.orbs)||0)+3;
 return [
  'Der Wächter senkt seinen Kopf. Sein Schatten zerfällt in goldene Funken.',
  'Eine Aufnahme aus Vaters Kapsel beginnt zu spielen:',
  'Vaters Stimme: „Wenn du das hier hörst, hat jemand die Erinnerungsanker gefunden.“',
  '„Die Wesen sind nicht die Gefahr. Jemand stiehlt das, woran sie sich erinnern.“',
  '„Such den Ursprung des Signals. Und vertraue darauf, dass Miora dich nach Hause führt.“',
  '🏆 WALDRUINE GESCHAFFT! +2 Seelen-Tränke und +3 Seelen-Sphären.',
  'Neue Aufgabe: Berichte Liora und Oma Martha von der Aufnahme.'
 ];
}
function objective(s){
 const q=ensure(s);
 if(!unlocked(s))return 'Hilf Liora mit den drei Seelenlichtern';
 if(q.bossWon)return q.reported?'Kapitel 2 abgeschlossen · neue Spur im Norden':'Die Wahrheit der Erinnerung: Sprich mit Oma';
 if(q.seals.length===3)return 'Stelle dich dem vergessenen Wächter';
 return 'Aktiviere WURZEL → WASSER → STERN ('+q.seals.length+'/3)';
}
// All drawing operations snap to the same deliberately chunky 1-2px grid.
function render(ctx,tick,s,drawChar){
 const q=ensure(s),pix=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
 const tx=(str,x,y,size=9,color='#e9e1bf',align='left')=>{
   ctx.save();ctx.font='bold '+size+'px monospace';ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(str,x,y);ctx.restore();
 };
 const pulse=(Math.sin(tick*.0028)+1)/2;
 // Stone architecture, distinct wall face + carved cap + inset shadow; no repeated grass squares.
 pix(0,0,320,180,'#142932');
 pix(22,14,276,151,'#182f35');pix(26,17,268,144,'#40514d');
 pix(28,19,264,138,'#587067');
 pix(30,21,260,136,'#6e8578');
 pix(30,26,260,130,'#697d6f');
 // Collapsed edges interrupt the old masonry rhythm. The left side is overgrown,
 // the right is cracked and washed out: two distinct, believable histories.
 const brokenLeft=[[31,40,23,6],[31,47,16,11],[31,58,11,10],[44,44,12,4],[51,49,7,5],[33,83,9,20]];
 for(const [x,y,w,h]of brokenLeft)pix(x,y,w,h,'#304d4c');
 const brokenRight=[[270,44,18,8],[280,52,9,13],[268,56,8,6],[275,90,12,7],[282,108,8,23]];
 for(const [x,y,w,h]of brokenRight)pix(x,y,w,h,'#304b50');
 for(let i=0;i<8;i++){
   const x=34+Math.floor(hash(i,17)*245),y=38+Math.floor(hash(i,41)*13);
   pix(x,y,9+i%3,2,i%2?'#a6a891':'#8c9b8a');
 }
 // Receding vaulted wall and fractured lintel.
 pix(28,20,264,27,'#2d454c');pix(30,24,260,21,'#486268');
 for(let i=0;i<7;i++){
   const x=32+i*37;
   pix(x,23,31,18,i%2?'#536d72':'#4c666d');
   pix(x+2,24,27,2,'#7b8b83');
   pix(x+9,32,14,1,'#29464f');pix(x+19,36,1,6,'#263e46');
 }
 // Broken top arch. Distinct overhang and side jambs.
 pix(86,19,148,7,'#223b41');pix(91,25,136,4,'#879389');
 for(const x of [87,106,126,147,169,189,209]){
   pix(x,22,16,4,'#748982');pix(x+3,26,10,2,'#b1a88a');
 }
 pix(96,26,8,25,'#354e55');pix(215,26,8,25,'#354e55');
 pix(110,33,100,22,'#1e3942');pix(116,38,88,19,'#263f46');
 // Four substantial columns, capital highlights and coherent floor occlusion.
 for(const x of [33,269]){
   pix(x,27,15,114,'#2d464b');pix(x+2,28,10,110,'#62786e');
   pix(x-3,27,21,7,'#809084');pix(x-1,32,17,3,'#9eab8f');
   pix(x+2,39,3,88,'#9a9e86');pix(x+11,41,2,86,'#324c50');
   pix(x-4,137,23,10,'#3b5254');pix(x-3,137,19,3,'#9aa48a');
   for(let i=0;i<5;i++)pix(x+4,49+i*17,6,1,'#354f53');
 }
 // Floor: long irregular courses and beveled block cracks, no visible checkerboard.
 pix(29,49,262,107,'#61766a');
 for(let y=50;y<=148;y+=16){
   pix(30,y,260,2,'#425e5c');
   for(let x=36+(y%32?10:0);x<290;x+=34){
     const off=Math.floor(hash(x,y,1)*5);
     pix(x+off,y+2,2,14,'#516a63');
     pix(x+3+off,y+4,20,1,'#829184');
   }
 }
 // Dark carpet/moss walkway to shrine, feathered sides.
 pix(128,45,64,110,'#435b58');
 pix(134,48,52,102,'#567567');
 // A warm ancient signal splits the cool floor into three worn trails.
 for(let j=0;j<7;j++){
   pix(149+j%3*8,61+j*12,3,7,j%2?'#8f9776':'#a4a17b');
 }
 for(let j=0;j<8;j++){
   const x=58+j*11,y=114-Math.floor(j*.83);
   pix(x,y,8,2,j%2?'#7b927e':'#adad8a');
 }
 // Faint vertical shafts from the fractured roof, cut into stepped pixels.
 for(let i=0;i<17;i++){
   const y=42+i*5;
   const x=98+i*3;
   pix(x,y,11,3,'#c8bb8452');
   if(i<10)pix(x+58,y+3,5,4,'#a5d3bf35');
 }
 for(let i=0;i<38;i++){
   const x=128+Math.floor(hash(i,3)*65),y=51+Math.floor(hash(i,9)*99);
   pix(x,y,2+(i%3),2,i%4?'#78927a':'#9eb18e');
 }
 // Shallow pools at corners have wave details and reeds: always collision blocking.
 for(const [x,y] of [[48,113],[241,113]]){
   pix(x,y,33,28,'#345f68');pix(x+2,y+2,29,22,'#427b82');
   for(let i=0;i<5;i++){pix(x+4+(i*7)%22,y+6+(i%3)*6,8,1,'#8dbaac');}
   for(let i=0;i<3;i++){pix(x+i*11,y-4,2,10,'#446b57');pix(x+2+i*11,y-6,3,8,'#7a9e70');}
 }
 // Asymmetric collapsed rubble banks and roots along the borders.
 for(let i=0;i<27;i++){
   const left=i<14,x=left?29+Math.floor(hash(i,15)*34):254+Math.floor(hash(i,22)*32);
   const y=61+Math.floor(hash(i,30)*87);
   pix(x,y,4+i%5,3+i%3,i%3?'#9b9d83':'#415b5a');
   pix(x+1,y+1,2,2,'#b1b29b');
 }
 // Overgrown climbing roots and tiny flowering vegetation.
 for(let i=0;i<10;i++){
   const x=i%2?272:43,y=34+i*11;
   pix(x,y,3,12,'#37584f');pix(x+(i%2?2:-4),y+6,9,2,'#658a68');
   if(i%3===0){pix(x+3,y+3,3,3,'#c5bd87');pix(x+4,y+2,1,1,'#eee3b0');}
 }
 // Three monoliths are hand-sized landmarks visible above floor and never buried under HUD.
 for(let i=0;i<SEALS.length;i++){
   const m=SEALS[i],x=m.x*16,y=m.y*16;
   const on=q.seals.includes(m.id)||q.bossWon;
   pix(x-7,y+9,30,7,'#344d50');pix(x-4,y+8,24,5,'#879383');
   pix(x+1,y-8,15,24,'#2c4147');pix(x+4,y-11,10,25,'#a3a794');
   pix(x+6,y-10,6,19,'#6c7772');pix(x+5,y-9,2,15,'#c5c4a1');
   pix(x+8,y-3,4,9,on?m.glow:m.color);
   pix(x+7,y-2,6,6,on?m.color:m.color);
   // Each rune has an unmistakable glyph even when it has not been activated.
   if(i===0){ // split tree-root shape
     pix(x+8,y-7,2,11,'#2b5551');pix(x+4,y-2,10,2,'#2b5551');
     pix(x+5,y+1,2,4,'#2b5551');pix(x+12,y+1,2,4,'#2b5551');
   }else if(i===1){
     for(let j=0;j<3;j++)pix(x+6+j*3,y-2+j%2*2,3,2,'#2c5862');
   }else{
     pix(x+9,y-7,2,13,'#594e40');pix(x+5,y-2,10,3,'#594e40');
   }
   pix(x+8,y-6,3,3,on?'#fff2ca':'#9d9e91');
   if(on){pix(x+4,y-14,2,3,m.glow);pix(x+15,y-13,2,2,m.color);}
   else if(pulse>.38)pix(x+11,y-14,2,3,'#b7aa7c');
 }
 // Suspended boss mask / memory anchor with distinctive silhouette, not a stock monster stamp.
 const coreX=ALTAR.x*16,coreY=ALTAR.y*16;
 pix(coreX-29,coreY+16,62,7,'#203e46');pix(coreX-24,coreY+12,51,4,'#7b8c7d');
 // A crescent of roots and two broken crest-horns give the guardian a silhouette.
 pix(coreX-21,coreY+7,13,16,'#334a4f');pix(coreX+14,coreY+7,11,14,'#334a4f');
 pix(coreX-20,coreY-8,11,15,'#4b6265');pix(coreX+13,coreY-8,11,15,'#4b6265');
 pix(coreX-18,coreY-12,7,13,'#9ea38b');pix(coreX+15,coreY-12,7,13,'#9ea38b');
 pix(coreX-14,coreY-2,30,31,'#273e4a');pix(coreX-11,coreY-8,24,36,'#566c69');
 pix(coreX-9,coreY-10,20,30,q.bossWon?'#778a7c':'#b2a886');
 pix(coreX-8,coreY-6,7,8,'#35474d');pix(coreX+3,coreY-6,7,8,'#35474d');
 pix(coreX-5,coreY-3,4,5,q.seals.length===3?'#fff0ba':'#739a95');
 pix(coreX+4,coreY-3,4,5,q.seals.length===3?'#fff0ba':'#739a95');
 pix(coreX-2,coreY+6,6,7,'#384950');pix(coreX,coreY+10,2,7,'#ead6a3');
 pix(coreX-8,coreY+19,17,3,'#344e50');
 if(q.seals.length===3&&!q.bossWon){
   pix(coreX-18,coreY-5,3,4,'#ffe8a6');pix(coreX+18,coreY+1,3,4,'#fff6d6');
   pix(coreX-1,coreY-17-pulse*2,4,5,'#f5e3a3');
 }
 // Story mural: legible figure at one position, not hidden among ordinary rocks.
 pix(130,96,37,15,'#334d4e');pix(134,98,30,11,'#a2a48c');
 pix(141,100,3,7,'#4a635e');pix(148,100,3,6,'#4a635e');pix(155,100,4,7,'#4a635e');
 pix(144,102,5,2,'#e5d3a7');
 // Door / exit with bright readable grounding.
 pix(136,152,48,27,'#213a44');pix(141,155,38,22,'#b49e79');
 pix(146,157,28,20,'#2a4e51');pix(152,161,16,15,'#79a9a1');
 pix(162,166,2,2,'#fceac3');
 // The player and companion use the original overworld character scale.
 const px=s.player.x*16,py=s.player.y*16;
 pix(px+2,py+13,15,3,'#334d4d');
 drawChar(px,py,'#da8068',s.player.stepPhase,'player',s.player.dir);
 if(s.hasStarter){pix(px+15,py+6+Math.sin(tick*.004)*2,7,7,'#d7f5de');pix(px+18,py+8,2,2,'#536d7c');}
 // HUD has slim fixed bars, leaving the room visible.
 pix(0,0,320,15,'#182f38');
 tx('RUINE DER ECHOS',8,11,10,'#f1dcaa');
 tx(q.bossWon?'★ GEREINIGT':('SIEGEL '+q.seals.length+'/3'),312,11,9,'#d1dfc2','right');
 pix(0,165,320,15,'#1b373f');
 const nearest=SEALS.find(m=>near(s.player,m));
 const hint=q.bossWon?'ZUM AUSGANG  ▼':
   near(s.player,ALTAR)?(q.seals.length===3?'A: WÄCHTER HERAUSFORDERN':'A: VERSIEGELTER ALTAR'):
   nearest?'A: '+nearest.name+'-SIEGEL AKTIVIEREN':
   near(s.player,MURAL,2)?'A: WANDINSCHRIFT LESEN':
   'A: UNTERSUCHEN · B: RAUS · WURZEL → WASSER → STERN';
 tx(hint,160,176,8,'#f4e6bf','center');
}
function drawBoss(ctx,tick,x,y,pix){
 // Dedicated enemy view: a cracked memory mask with carved roots, not a reused front sprite.
 const b=(dx,dy,w,h,c)=>pix(x+dx,y+dy,w,h,c);
 const bob=Math.round(Math.sin(tick*.004)*2);
 const dy=bob;
 // Shadow and low fog.
 for(let i=0;i<6;i++){
   b(1+i*9,69+(i%2)*2,10,3,i%2?'#668d8e':'#93b4a5');
 }
 // Branching crown: broad shape at the top, unique recognisable silhouette.
 b(21,18+dy,37,52,'#23434d');
 b(13,8+dy,14,35,'#365b60');b(54,9+dy,13,34,'#365b60');
 b(9,4+dy,9,18,'#96a48f');b(13,1+dy,10,9,'#b2b49a');
 b(58,2+dy,9,22,'#a6ad93');b(53,0+dy,11,9,'#c6bc98');
 b(21,3+dy,10,20,'#7f988b');b(49,5+dy,10,17,'#718e83');
 // Shoulder cloak with stepped edges, shadows and fragments.
 b(15,39+dy,54,25,'#274952');b(20,31+dy,43,31,'#4d7170');
 b(22,48+dy,39,21,'#365e63');
 b(26,60+dy,11,9,'#7c9481');b(48,62+dy,8,7,'#698078');
 b(14,52+dy,6,16,'#254853');b(66,53+dy,7,14,'#254853');
 // Cracked ivory front mask, deliberately asymmetric.
 b(29,14+dy,29,35,'#243e48');
 b(27,11+dy,29,37,'#b9b59b');b(31,12+dy,23,35,'#e0c8a2');
 b(29,16+dy,3,24,'#f3dbb1');b(50,17+dy,5,19,'#8e9584');
 b(31,25+dy,9,8,'#36515c');b(45,25+dy,8,8,'#36515c');
 b(33,27+dy,5,4,'#e9c979');b(47,27+dy,4,4,'#f5dca2');
 b(39,34+dy,4,8,'#40555b');b(40,40+dy,9,3,'#7c8a7e');
 b(43,14+dy,2,11,'#68756d');b(45,19+dy,4,2,'#68756d');
 b(51,36+dy,2,6,'#68756d');
 // Three signal sparks float at slightly different depths.
 for(let i=0;i<3;i++){
   const u=11+i*22,yy=19+Math.round(Math.sin(tick*.004+i*2)*4);
   b(u,yy,2,5,i===0?'#b9e9be':i===1?'#8bc9d1':'#efcf85');
   b(u-2,yy+2,6,1,'#fff1c3');
 }
}
function drawEntrance(ctx,tick,s,camX,camY,pix){
 const x=ENTRY.x*16-camX,y=ENTRY.y*16-camY;
 if(x<-35||x>335||y<-40||y>195)return;
 // Ruined freestanding stone arch; matches the room's teal limestone.
 pix(x-7,y+7,33,9,'#334f54');pix(x-5,y+2,29,9,'#849688');
 pix(x-4,y-11,7,21,'#607b74');pix(x+18,y-11,7,21,'#607b74');
 pix(x-5,y-15,31,7,'#334a4f');pix(x-3,y-14,27,4,'#b3ae8a');
 pix(x+2,y-6,16,17,'#1c454d');
 pix(x+6,y-4,8,14,unlocked(s)?'#9ec7b3':'#647a7b');
 pix(x+9,y-4,2,16,unlocked(s)?'#eaf7c8':'#8e9b8c');
 pix(x-8,y+13,35,3,'#a5aa87');
 if(Math.sin(tick*.003)>0.1)pix(x+6,y-22,4,3,'#f1e7ad');
 if(nearEntrance(s)){
   pix(x-24,y-36,79,12,'#294b46');
   ctx.save();ctx.font='bold 8px monospace';ctx.fillStyle='#fff4bf';
   ctx.fillText('A: WALDRUINE',x-18,y-27);ctx.restore();
 }
}
window.EchoRuins={ENTRY,SEALS,ALTAR,MURAL,ensure,unlocked,prepareWorld,nearEntrance,entrance,canStep,walk,exit,interact,victory,objective,render,drawBoss,drawEntrance};
})();