/* Echo-Chroniken: Flüster-Sprung, an original side-scrolling ghost platformer.
 * Self-contained canvas game. Controlled by the same touch/Gamepad command path.
 * No third-party graphics or runtime dependencies.
 */
(()=>{
'use strict';
const PORTAL={x:32,y:24};
const LENGTH=1270,G=800,JUMP=-323,SPEED=151;
const FLOORS=[[0,218],[268,488],[534,734],[781,1010],[1053,LENGTH]];
const PLATFORMS=[
 {x:119,y:115,w:92},{x:303,y:115,w:90},
 {x:569,y:112,w:120},{x:815,y:110,w:114},
 {x:1104,y:111,w:91}
];
const SHARDS=[{x:164,y:91},{x:626,y:88},{x:872,y:87}];
const TRAPS=[{x:332,y:138,w:20},{x:597,y:138,w:25},{x:850,y:138,w:20},{x:1120,y:138,w:23}];
const CHECKPOINTS=[{x:407,y:128},{x:801,y:128}];
const EXIT_X=1203;
let run=null;
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const solidSurfaces=[...FLOORS.map(([x,end])=>({x,y:150,w:end-x,h:50})),...PLATFORMS.map(p=>({...p,h:12}))];
function ensure(s){
 if(!s.platformProgress||typeof s.platformProgress!=='object')s.platformProgress={cleared:false,bestSeconds:null};
 const p=s.platformProgress;
 p.cleared=!!p.cleared;
 if(!Number.isFinite(p.bestSeconds)||p.bestSeconds<=0)p.bestSeconds=null;
 return p;
}
function nearPortal(s){
 if(!s?.hasStarter||s.scene!=='OVERWORLD'||!s.player)return false;
 return Math.abs(s.player.x-PORTAL.x)+Math.abs(s.player.y-PORTAL.y)<=1;
}
function enter(s){
 if(!nearPortal(s))return false;
 ensure(s);s.mode='PLATFORM';s.platformReturn={x:s.player.x,y:s.player.y};
 run={
   x:37,y:132,vx:0,vy:0,grounded:true,move:0,moveUntil:0,
   jumps:0,hearts:3,checkpointX:37,checkpointIndex:-1,
   collected:[false,false,false],paused:false,finished:false,
   elapsed:0,lastNow:null,invincible:0,feedback:'Sammle 3 Echos und finde das Portal!'
 };
 return true;
}
function exit(s){
 if(s.mode!=='PLATFORM')return false;
 s.mode='OVERWORLD';run=null;
 return true;
}
function input(s,cmd){
 if(s.mode!=='PLATFORM'||!run)return false;
 if(cmd==='START'){run.paused=!run.paused;run.lastNow=null;return true;}
 if(cmd==='B'){exit(s);return true;}
 if(run.paused)return true;
 if(cmd==='LEFT'||cmd==='RIGHT'){
   run.move=cmd==='LEFT'?-1:1;
   run.moveUntil=run.elapsed+.22;
 }else if(cmd==='A'||cmd==='UP'){
   if(run.grounded || run.jumpBuffer>0){
     run.vy=JUMP;run.grounded=false;run.jumps++;run.jumpBuffer=0;
   }
 }
 return true;
}
function respawn(){
 run.hearts--;
 run.x=run.checkpointX;run.y=132;run.vx=0;run.vy=0;
 run.grounded=true;run.invincible=.9;
 run.feedback=run.hearts>0?'Ein Geisterstolperer! Kontrollpunkt aktiv.':'Wiederaufbau am Kontrollpunkt!';
 if(run.hearts<=0)run.hearts=3;
}
function update(s,now){
 if(s.mode!=='PLATFORM'||!run)return null;
 if(run.lastNow===null){run.lastNow=now;return null;}
 const dt=clamp((now-run.lastNow)/1000,0,.034);
 run.lastNow=now;
 if(run.paused||run.finished)return null;
 run.elapsed+=dt;
 run.invincible=Math.max(0,run.invincible-dt);
 const desired=(run.moveUntil>run.elapsed)?run.move:0;
 run.vx=desired*SPEED;
 const oldY=run.y,oldBottom=run.y+18;
 // Semi-implicit integration and grounded check against old / new top surfaces.
 run.vy+=G*dt;
 let nextX=clamp(run.x+run.vx*dt,0,LENGTH-16);
 for(const block of solidSurfaces){
   // Prevent side clipping into ledges without sticking the player forever.
   if(overlap({x:nextX,y:run.y,w:14,h:18},block)&&oldBottom>block.y+4 && run.y<block.y+block.h){
     nextX=run.vx>0?Math.min(nextX,block.x-14):Math.max(nextX,block.x+block.w);
   }
 }
 run.x=nextX;
 const nextY=oldY+run.vy*dt;
 let land=null;
 if(run.vy>=0){
   for(const platform of solidSurfaces){
     if(run.x+13<=platform.x||run.x+1>=platform.x+platform.w)continue;
     if(oldBottom<=platform.y+5&&nextY+18>=platform.y && (!land||platform.y<land.y))land=platform;
   }
 }
 if(land){run.y=land.y-18;run.vy=0;run.grounded=true;}
 else {run.y=nextY;run.grounded=false;}
 // Don't allow standing on thin air when walking off a platform.
 for(let i=0;i<SHARDS.length;i++){
   const item=SHARDS[i];
   if(!run.collected[i]&&Math.hypot(run.x+7-item.x,run.y+8-item.y)<21){
     run.collected[i]=true;
     const count=run.collected.filter(Boolean).length;
     run.feedback='Echo-Funken '+count+'/3 gefunden!';
   }
 }
 for(let i=0;i<CHECKPOINTS.length;i++){
   const cp=CHECKPOINTS[i];
   if(run.x>=cp.x && i>run.checkpointIndex){
     run.checkpointIndex=i;run.checkpointX=cp.x;
     run.feedback='Kontrollpunkt gespeichert!';
   }
 }
 if(run.invincible<=0&&TRAPS.some(t=>overlap({x:run.x+3,y:run.y+5,w:9,h:13},{x:t.x,y:t.y,w:t.w,h:12})))respawn();
 if(run.y>235)respawn();
 if(run.x>=EXIT_X){
   if(run.collected.every(Boolean)){
     run.finished=true;
     const progress=ensure(s),first=!progress.cleared;
     progress.cleared=true;
     const seconds=Math.max(1,Math.round(run.elapsed));
     if(progress.bestSeconds===null||seconds<progress.bestSeconds)progress.bestSeconds=seconds;
     if(first){s.potions=(Number(s.potions)||0)+2;s.orbs=(Number(s.orbs)||0)+5;}
     s.mode='OVERWORLD';run=null;
     return {completed:true,first,seconds,lines:[
       '✨ Du hast den Flüster-Sprung gemeistert!',
       'Die drei Echo-Funken sind wieder vereint.',
       first?'🎁 Du erhältst 2 Seelen-Tränke und 5 Seelen-Sphären!':'Du kennst den Weg bereits. Dein Bestwert wurde gespeichert.',
       'Das Papierreich faltet sich zurück zur normalen Welt.'
     ]};
   }
   run.x=EXIT_X-8;
   run.feedback='Du brauchst erst alle 3 Echo-Funken!';
 }
 return null;
}
const bg=(ctx,x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h));};
function render(ctx,now,s){
 const p=ensure(s);
 const W=320,H=180;
 if(!run){bg(ctx,0,0,W,H,'#1a2933');return;}
 const camera=clamp(run.x-88,0,LENGTH-W);
 const pencil=run.x>720;
 bg(ctx,0,0,W,H,pencil?'#f5efdc':'#769f9c');
 if(pencil){
   for(let gx=-Math.floor(camera/8)*8;gx<LENGTH;gx+=8){
     const screen=gx-camera;if(screen<-8||screen>W+8)continue;
     bg(ctx,screen,0,1,H,(Math.round(gx/8)%4===0)?'#c4c8c7':'#dee1dc');
   }
   for(let y=0;y<H;y+=8)bg(ctx,0,y,W,1,y%32===0?'#bcc6c6':'#dde1db');
   bg(ctx,0,34,W,2,'#dc9e9e');
 }else{
   bg(ctx,0,0,W,52,'#8cc5b7');
   bg(ctx,0,44,W,72,'#c0d6b9');
   for(let i=0;i<19;i++){
     const x=i*27-(camera*.23%27);
     bg(ctx,x,65+(i%3)*4,12,58,'#719d8c');
     bg(ctx,x+3,52+(i%3)*4,7,22,'#527f77');
   }
   for(let i=0;i<10;i++){
     const x=i*44-(camera*.4%44);
     bg(ctx,x,124,28,18,'#6da388');
     bg(ctx,x+5,117,18,9,'#86b897');
   }
 }
 // World ground and raised landings.
 for(const block of solidSurfaces){
   const x=block.x-camera;if(x+block.w<0||x>W)continue;
   bg(ctx,x,block.y,block.w,block.h,pencil?'#393d43':'#3e6656');
   bg(ctx,x,block.y,block.w,4,pencil?'#5d6369':'#9ac88e');
   for(let a=6;a<block.w;a+=17){
     bg(ctx,x+a,block.y+8+(a%3),5,2,pencil?'#999f9e':'#779877');
   }
 }
 // Pencil realm decorations and obstacles.
 for(let i=0;i<11;i++){
   const x=i*123+30-camera;if(x<-12||x>325)continue;
   if(pencil){
     bg(ctx,x,124,20,3,'#898989');
     bg(ctx,x+3,119,14,4,'#b6ada3');
   }else{
     bg(ctx,x,135,5,15,'#4b795c');bg(ctx,x-5,125,15,12,'#6aa286');
     bg(ctx,x-2,119,10,9,'#80ba92');
   }
 }
 // Damage spikes rendered as ghost flames / pencil triangles.
 for(const t of TRAPS){
   const x=t.x-camera;if(x+t.w<0||x>W)continue;
   for(let i=0;i<t.w;i+=7){
     const col=pencil?'#33333b':'#8f537d';
     bg(ctx,x+i,t.y+6,6,6,col);
     bg(ctx,x+i+2,t.y+3,3,5,pencil?'#7f7f86':'#e393c8');
     bg(ctx,x+i+3,t.y,1,4,'#fff6d3');
   }
 }
 // Checkpoints that stay activated after the player crosses them.
 for(let i=0;i<CHECKPOINTS.length;i++){
   const cp=CHECKPOINTS[i],x=cp.x-camera;
   bg(ctx,x,112,3,38,pencil?'#707070':'#5a6b64');
   bg(ctx,x+3,113,14,11,i<=run.checkpointIndex?'#bee7cb':'#eacb95');
   bg(ctx,x+6,116,7,4,'#fff4d0');
 }
 // Collectible levitating ghosts, big enough to find on TV.
 for(let i=0;i<SHARDS.length;i++){
   if(run.collected[i])continue;
   const sh=SHARDS[i],x=sh.x-camera,y=sh.y+Math.sin(now*.006+i)*3;
   bg(ctx,x-6,y+3,13,9,pencil?'#61616a':'#a4f1e6');
   bg(ctx,x-3,y-2,7,13,pencil?'#333842':'#e3ffdf');
   bg(ctx,x-1,y-6,3,7,'#fff6ca');
   bg(ctx,x-11,y,2,2,'#fff1bb');bg(ctx,x+10,y-3,2,2,'#fff1bb');
 }
 // Exit portal; finish only once all spirits were collected.
 const portalX=EXIT_X-camera;
 bg(ctx,portalX-5,92,34,58,pencil?'#373942':'#304c52');
 bg(ctx,portalX,95,24,53,pencil?'#c8c8c8':'#51737a');
 bg(ctx,portalX+4,102,17,42,run.collected.every(Boolean)?'#b8ecd4':'#6e717a');
 bg(ctx,portalX+10,112,5,23,'#fff6c7');
 // Little ghost avatar, inherits the RPG's Miora color language.
 const heroX=run.x-camera,heroY=run.y;
 if(run.invincible<=0||Math.floor(now/70)%2===0){
   bg(ctx,heroX+1,heroY+5,13,12,pencil?'#f0eee7':'#e6f7e8');
   bg(ctx,heroX+3,heroY,4,7,pencil?'#51545d':'#d6f4e8');
   bg(ctx,heroX+9,heroY,4,8,pencil?'#51545d':'#d6f4e8');
   bg(ctx,heroX+3,heroY+9,2,3,'#405a63');bg(ctx,heroX+10,heroY+9,2,3,'#405a63');
   bg(ctx,heroX,heroY+15,5,3,pencil?'#51545d':'#bce7d4');
   bg(ctx,heroX+10,heroY+15,5,3,pencil?'#51545d':'#bce7d4');
 }
 bg(ctx,0,0,320,26,'#203940');
 ctx.fillStyle='#fff0bd';ctx.font='bold 11px monospace';ctx.fillText('FLÜSTER-SPRUNG',7,12);
 ctx.font='bold 9px monospace';
 ctx.fillText('ECHOS '+run.collected.filter(Boolean).length+'/3',7,23);
 ctx.fillText('♥'.repeat(run.hearts),126,23);
 ctx.fillText('ZEIT '+Math.floor(run.elapsed)+'s',204,23);
 bg(ctx,0,157,W,23,'#203940');
 ctx.fillStyle='#fcebc0';ctx.font='bold 8px monospace';
 ctx.fillText(run.paused?'PAUSE  START=WEITER  B=ZURÜCK':(run.feedback||'A=SPRUNG  LINKS/RECHTS  B=ZURÜCK').slice(0,53),5,168);
 if(!run.paused)ctx.fillText('A=SPRINGEN    ◄/►=LAUFEN    B=VERLASSEN',5,177);
 if(run.paused){
   bg(ctx,70,57,180,63,'#273c41');bg(ctx,75,61,170,54,'#e9d6ad');
   ctx.fillStyle='#344d53';ctx.font='bold 13px monospace';ctx.fillText('PAUSE',138,83);
   ctx.font='bold 9px monospace';ctx.fillText('START: WEITER',97,99);ctx.fillText('B: ZUM DORF',97,109);
 }
}
function snapshot(){
 return run?{x:run.x,y:run.y,hearts:run.hearts,collected:[...run.collected],paused:run.paused,checkpointIndex:run.checkpointIndex,elapsed:run.elapsed,grounded:run.grounded}:null;
}
window.EchoPlatformer={PORTAL,LENGTH,FLOORS,PLATFORMS,SHARDS,TRAPS,CHECKPOINTS,ensure,nearPortal,enter,exit,input,update,render,snapshot};
})();
