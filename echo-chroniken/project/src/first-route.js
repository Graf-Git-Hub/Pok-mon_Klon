/* Echo-Chroniken: Der Flüsterpfad, first exploration quest.
 * Zero external assets, shared by offline Android TV and phone builds.
 */
(() => {
'use strict';
const POINTS=[
  {id:'west',x:14,y:20,name:'Mooslicht'},
  {id:'mitte',x:21,y:22,name:'Sternenlicht'},
  {id:'ost',x:27,y:24,name:'Mondlicht'}
];
const GUIDE={id:'routeGuide',name:'Liora',x:17,y:18,color:'#b68fc5'};
const KEEPER={id:'routeKeeper',name:'Waldhüter Piko',x:30,y:23,color:'#80a8b1'};
const PATH=[[15,15],[15,18],[14,20],[17,21],[21,22],[24,22],[27,24],[30,23]];
const hash=(x,y,n=0)=>{let a=(x*374761393+y*668265263+n*1442695041)|0;a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;};
function quest(s){
  if(!s.routeQuest||typeof s.routeQuest!=='object')s.routeQuest={accepted:false,lights:[],rewarded:false,guardianWon:false};
  const q=s.routeQuest;
  q.accepted=!!q.accepted;q.rewarded=!!q.rewarded;q.guardianWon=!!q.guardianWon;
  q.lights=Array.isArray(q.lights)?Array.from(new Set(q.lights.filter(id=>POINTS.some(p=>p.id===id)))):[];
  return q;
}
function progress(s){return quest(s).lights.length;}
function objective(s){
  const q=quest(s);
  if(!q.accepted)return 'Sprich mit Liora am südlichen Waldpfad';
  if(q.lights.length<3)return 'Finde die drei Lichter ('+q.lights.length+'/3)';
  if(!q.rewarded)return 'Bring die Lichter zurück zu Liora';
  if(!q.guardianWon)return 'Optional: Fordere Waldhüter Piko heraus';
  return 'Der Flüsterpfad ist gerettet!';
}
function build(map){
  if(!Array.isArray(map)||map.length!==28||map[0].length!==36)throw Error('Unexpected map size for Flüsterpfad');
  const set=(x,y,t)=>{
    if(x<=1||y<=1||x>=35||y>=27)return;
    // Do not overwrite story fountains, houses, lake, or existing diary objects.
    if([4,5,6,7].includes(map[y][x]))return;
    const special=['11,12','23,11','28,20','24,6','16,9','25,13','31,22'];
    if(special.includes(x+','+y))return;
    map[y][x]=t;
  };
  for(let j=0;j<PATH.length-1;j++){
    const [a,b]=[PATH[j],PATH[j+1]];
    const steps=Math.max(Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))*4;
    for(let i=0;i<=steps;i++){
      const t=i/steps,x=Math.round(a[0]+(b[0]-a[0])*t),y=Math.round(a[1]+(b[1]-a[1])*t);
      set(x,y,8);
      if(hash(x,y,j)>.76)set(x+1,y,8);
      if(hash(x,y,j+41)>.83)set(x,y-1,8);
    }
  }
  // Wild flower meadows with short grass around the safe, winding path.
  const flowers=[[13,18],[12,19],[16,20],[18,20],[18,23],[22,21],[23,23],[25,24],[29,24],[31,24]];
  for(const [x,y] of flowers)if(map[y]?.[x]===0||map[y]?.[x]===2)set(x,y,9);
  // The actual search objects and NPCs may never spawn inside a tree or wild encounter tile.
  for(const p of [...POINTS,GUIDE,KEEPER]){
    set(p.x,p.y,8);
    for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]]){
      const x=p.x+dx,y=p.y+dy;
      if(map[y]?.[x]===1||map[y]?.[x]===2)set(x,y,0);
    }
  }
  return map;
}
function guideTalk(state,sfx){
  const q=quest(state);
  if(!state.hasStarter)return ['Liora: „Hol erst dein Paket bei Oma ab, dann zeige ich dir den Waldpfad!“'];
  if(!q.accepted){
    q.accepted=true;
    return ['Liora: „Ich bin froh, dass du da bist! Drei Seelenlichter sind im Wald verstreut.“',
      '„Folge dem geschwungenen Weg nach Süden. Die Lichter glitzern und lassen sich mit A einsammeln.“',
      '„Wenn du alle drei findest, belohne ich dich mit Tränken und Seelen-Sphären.“'];
  }
  if(q.lights.length<3)return [
    'Liora: „Du hast '+q.lights.length+' von 3 Seelenlichtern gefunden.“',
    '„Schau bei den Blumenwiesen südlich des Dorfes. Das letzte Licht liegt nahe dem Waldhüter.“'
  ];
  if(!q.rewarded){
    q.rewarded=true;state.potions=(state.potions||0)+2;state.orbs=(state.orbs||0)+5;
    sfx?.catch?.();
    return ['Liora: „Du hast wirklich alle drei gefunden! Der Flüsterpfad leuchtet wieder.“',
      '🎁 Du erhältst 2 Seelen-Tränke und 5 Seelen-Sphären!',
      '„Waldhüter Piko wartet am Ende des Pfades. Er prüft dich gern in einem freundlichen Kampf.“',
      '„Östlich von Piko glitzert ein Traumtor. Dort wartet ein ganz anderes Abenteuer!“'];
  }
  if(q.guardianWon)return ['Liora: „Sogar Piko hast du überzeugt. Wurzelheim kann stolz auf dich sein!“'];
  return ['Liora: „Danke für die Seelenlichter! Wenn du möchtest, fordere Piko am Ende des Pfades heraus.“',
    '„Und schau dir das Traumtor ganz im Osten des Waldes an!“'];
}
function keeperTalk(state){
  const q=quest(state);
  if(!state.hasStarter)return ['Waldhüter Piko: „Bring erst ein Seelenwesen mit, dann zeige ich dir meinen Prüfkampf.“'];
  if(!q.rewarded)return ['Waldhüter Piko: „Drei Lichter hüten unseren Pfad. Hilf Liora, sie zu sammeln!“'];
  if(q.guardianWon)return ['Waldhüter Piko: „Du hast die Prüfung bestanden. Mögen deine Seelenwesen behütet bleiben!“',
    '„Mein Geheimtipp: Ein paar Schritte östlich liegt der Flüster-Sprung.“'];
  return null; // Start the optional single Lv.4 trainer fight via the existing engine.
}
function collectNear(state,sfx){
  const p=state.player;
  if(!state.hasStarter||!p)return null;
  const q=quest(state);
  const target=POINTS.find(v=>!q.lights.includes(v.id)&&Math.abs(v.x-p.x)+Math.abs(v.y-p.y)<=1);
  if(!target)return null;
  q.lights.push(target.id);sfx?.catch?.();
  const lines=['✨ Du findest das '+target.name+'! ('+q.lights.length+'/3)'];
  if(q.lights.length===3)lines.push('Alle drei Seelenlichter sind beisammen. Bring sie zu Liora zurück!');
  else lines.push('Ein sanfter Lichtfunke weist dir den Weg zum nächsten Fundort.');
  return lines;
}
function keeperWin(state,sfx){
  const q=quest(state);
  if(q.guardianWon)return [];
  q.guardianWon=true;state.orbs=(state.orbs||0)+3;state.potions=(state.potions||0)+1;
  sfx?.evolve?.();
  return ['🏆 Waldhüter Piko: „Du hast den Flüsterpfad gemeistert!“',
    '🎁 Du erhältst 3 Seelen-Sphären und 1 Seelen-Trank.',
    'Das warme Echo der drei Lichter begleitet dich auf deiner Reise.'];
}
function draw(ctx,tick,state,camX,camY,pix){
  const q=quest(state);
  const p=(x,y,w,h,c)=>pix(Math.round(x),Math.round(y),w,h,c);
  // Gold-and-blue signpost at the beginning of the southern woodland route.
  const signX=15*16-camX,signY=16*16-camY;
  p(signX+7,signY+7,3,9,'#754d39');p(signX+1,signY+4,15,6,'#60493b');
  p(signX+2,signY+4,12,4,'#efd49b');p(signX+10,signY+5,3,2,'#729e87');
  for(const [tx,ty] of [[12,21],[19,20],[24,24],[28,22],[30,24]]){
    const sx=tx*16-camX,sy=ty*16-camY;
    if(sx<-16||sy<-16||sx>330||sy>190)continue;
    p(sx+5,sy+10,8,5,'#446b54');p(sx+4,sy+7,10,4,'#568f6b');
    p(sx+8,sy+5,4,5,'#6cac81');p(sx+7,sy+4,2,3,'#c8db9d');
    if(hash(tx,ty)>.45){p(sx+3,sy+7,2,2,'#db98c7');p(sx+11,sy+7,2,2,'#f2d69d');}
  }
  for(const v of POINTS){
    if(q.lights.includes(v.id))continue;
    const sx=v.x*16-camX,sy=v.y*16-camY+Math.sin(tick*.004+v.x)*1.4;
    if(sx<-20||sy<-20||sx>335||sy>200)continue;
    p(sx+2,sy+12,13,2,'#497d6a');
    p(sx+5,sy+4,8,9,'#467986');p(sx+7,sy+1,4,11,'#bdf7e7');
    p(sx+9,sy-2,2,4,'#fff3bf');p(sx+7,sy+4,5,4,'#f7e6a4');
    p(sx+3,sy+5,2,2,'#dff6d4');p(sx+14,sy+2,2,2,'#dff6d4');
    if(state.hasStarter&&Math.abs(state.player.x-v.x)+Math.abs(state.player.y-v.y)<=1){
      p(sx-5,sy-14,28,10,'#294943');
      ctx.save();ctx.fillStyle='#fff0b7';ctx.font='bold 8px monospace';
      ctx.fillText('A: LICHT',sx-4,sy-7);ctx.restore();
    }
  }
}
window.EchoRoute={POINTS,GUIDE,KEEPER,build,quest,progress,objective,guideTalk,keeperTalk,collectNear,keeperWin,draw};
})();