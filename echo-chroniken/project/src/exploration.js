/* Echo-Chroniken: Entdeckerkarte und einmalige versteckte Vorräte.
 * Läuft offline und reagiert gleichermaßen auf Touch und Controller.
 */
(() => {
'use strict';
const STASHES=[
 {id:'garten',x:9,y:10,name:'Gartenvorrat',potions:2,orbs:0},
 {id:'waldrand',x:20,y:19,name:'Waldversteck',potions:0,orbs:4},
 {id:'lichtung',x:29,y:25,name:'Lichtungstruhe',potions:1,orbs:3}
];
function ensure(state){
 if(!Array.isArray(state.explorationFound))state.explorationFound=[];
 state.explorationFound=[...new Set(state.explorationFound.filter(id=>STASHES.some(s=>s.id===id)))];
 return state.explorationFound;
}
function nearby(state){
 if(!state?.hasStarter||!state.player)return null;
 const found=ensure(state),p=state.player;
 return STASHES.find(s=>!found.includes(s.id)&&Math.abs(s.x-p.x)+Math.abs(s.y-p.y)<=1)||null;
}
function collect(state){
 const stash=nearby(state);if(!stash)return null;
 ensure(state).push(stash.id);
 state.potions=(Number(state.potions)||0)+stash.potions;
 state.orbs=(Number(state.orbs)||0)+stash.orbs;
 const loot=[
   stash.potions?stash.potions+' Seelen-Trank'+(stash.potions===1?'':'e'):'',
   stash.orbs?stash.orbs+' Seelen-Sphären':''
 ].filter(Boolean).join(' und ');
 return ['📦 Du öffnest das '+stash.name+'.','🎁 Gefunden: '+loot+'!',
   'Die alte Truhe ist jetzt leer. Dein Fund wurde gespeichert.'];
}
function drawWorld(ctx,tick,state,camX,camY,pix){
 const found=ensure(state);
 const near=nearby(state);
 for(const stash of STASHES){
   if(found.includes(stash.id))continue;
   const x=Math.round(stash.x*16-camX),y=Math.round(stash.y*16-camY);
   if(x<-20||x>326||y<-26||y>180)continue;
   pix(x+1,y+12,14,2,'#3a6855');pix(x+2,y+6,12,8,'#513e3d');
   pix(x+3,y+7,10,6,'#a9754e');pix(x+4,y+8,8,3,'#ca9b64');
   pix(x+7,y+6,3,8,'#ecd18a');pix(x+2,y+6,12,2,'#6a5350');
   pix(x+8,y+9,2,2,'#fff0b1');
   if(Math.sin(tick*.007+stash.x)>-.2){
     pix(x+12,y+1,2,2,'#ffe0a3');pix(x+13,y-1,1,5,'#fff0bb');
   }
   if(near&&near.id===stash.id){
     pix(x-6,y-13,34,10,'#254941');
     ctx.save();ctx.font='bold 7px monospace';ctx.fillStyle='#fff1bd';
     ctx.fillText('A: ÖFFNEN',x-4,y-6);ctx.restore();
   }
 }
}
function objective(state){
 if(!state.hasStarter)return 'Hol zuerst Miora bei Oma ab';
 const q=state.routeQuest;
 if(!q?.accepted)return 'Liora wartet im Süden beim Waldpfad';
 if((q.lights||[]).length<3)return 'Seelenlichter: '+(q.lights||[]).length+'/3';
 if(!q.rewarded)return 'Zurück zu Liora mit den drei Lichtern';
 return q.guardianWon?'Erkunde Wurzelheim und die Arenen':'Waldhüter Piko wartet am Pfadende';
}
function marker(ctx,x,y,color,w=3,h=3){
 ctx.fillStyle='#20343a';ctx.fillRect(x-1,y-1,w+2,h+2);
 ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
}
function drawMap(ctx,world,state){
 const W=320,H=180,ox=16,oy=25,cell=4;
 ctx.fillStyle='#152d34';ctx.fillRect(0,0,W,H);
 ctx.fillStyle='#e8d2a0';ctx.fillRect(8,8,304,164);
 ctx.fillStyle='#314c4b';ctx.fillRect(10,10,300,160);
 ctx.fillStyle='#f4e3b9';ctx.font='bold 12px monospace';
 ctx.fillText('WURZELHEIM  ·  ENTDECKERKARTE',20,22);
 for(let y=0;y<world.length;y++)for(let x=0;x<world[y].length;x++){
   const tile=world[y][x],colors={0:'#6ba875',1:'#365e4b',2:'#2d7d63',3:'#c5b288',4:'#4b9ab6',5:'#8e6856',6:'#d2c79d',7:'#72553c',8:'#bfa482',9:'#7fc68d'};
   ctx.fillStyle=colors[tile]||'#66a475';
   ctx.fillRect(ox+x*cell,oy+y*cell,cell,cell);
 }
 ctx.strokeStyle='#f2dba9';ctx.lineWidth=1;ctx.strokeRect(ox-1,oy-1,36*cell+2,28*cell+2);
 const pos=(x,y)=>[ox+x*cell+1,oy+y*cell+1];
 // Destinations and non-spoilery quest markers.
 for(const [x,y] of [[5,5],[14,5],[27,5],[6,17],[22,17]]){
   const [px,py]=pos(x,y);marker(ctx,px,py,'#f4ca83');
 }
 for(const st of STASHES){
   if(ensure(state).includes(st.id))continue;
   const [px,py]=pos(st.x,st.y);marker(ctx,px,py,'#ffdc7c',2,2);
 }
 if(state.hasStarter){
   const r=state.routeQuest||{};
   if(!r.accepted){const [x,y]=pos(17,18);marker(ctx,x,y,'#e9a5e9');}
   else if((r.lights||[]).length<3){
     for(const point of window.EchoRoute?.POINTS||[]){
       if((r.lights||[]).includes(point.id))continue;
       const [x,y]=pos(point.x,point.y);marker(ctx,x,y,'#acfcff');
     }
   }else if(!r.rewarded){const [x,y]=pos(17,18);marker(ctx,x,y,'#e9a5e9');}
   else if(!r.guardianWon){const [x,y]=pos(30,23);marker(ctx,x,y,'#e9a5e9');}
 }
 const [px,py]=pos(state.player.x,state.player.y);
 marker(ctx,px-1,py-1,'#fffef0',5,5);
 ctx.fillStyle='#e8d2a0';ctx.font='bold 9px monospace';
 ctx.fillText('DEIN WEG',177,38);
 ctx.fillStyle='#e4efd6';ctx.font='8px monospace';
 const phrase=objective(state).replace(' mit den drei Lichtern','');
 // Wrap text, avoiding overlap with the lower legend.
 const words=phrase.split(/\s+/),lines=[''];
 for(const word of words){
   const i=lines.length-1,proposed=(lines[i]?lines[i]+' ':'')+word;
   if(proposed.length>23){lines.push(word);}else lines[i]=proposed;
 }
 lines.slice(0,4).forEach((line,i)=>ctx.fillText(line,177,52+i*11));
 const remaining=STASHES.length-ensure(state).length;
 ctx.fillStyle='#f4cd84';ctx.font='bold 8px monospace';
 ctx.fillText('Vorräte: '+(STASHES.length-remaining)+'/3',177,106);
 ctx.fillStyle='#d7e6d9';ctx.font='8px monospace';
 ctx.fillText('WEISS  = DU',177,120);
 ctx.fillText('GOLD   = HAEUSER',177,132);
 ctx.fillText('TÜRKIS = QUEST',177,144);
 ctx.fillText('A / B / SELECT: ZURÜCK',171,162);
}
window.EchoExplore={STASHES,ensure,nearby,collect,drawWorld,drawMap,objective};
})();
