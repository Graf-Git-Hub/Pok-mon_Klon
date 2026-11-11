/* Echo-Chroniken: Omas Haus, Introquest und begehbarer Innenraum. */
(() => {
'use strict';
const blocks = new Set();
for(let x=2;x<=4;x++)for(let y=3;y<=5;y++)blocks.add(x+','+y);
for(let x=10;x<=12;x++)for(let y=3;y<=4;y++)blocks.add(x+','+y);
for(let y=3;y<=5;y++)blocks.add('14,'+y);
blocks.add('2,7');blocks.add('3,7');
const objective=s=>['Sprich mit Oma Martha','Hol das Paket vom Tisch','Sprich noch einmal mit Oma','Verlasse Omas Haus','Erkunde Wurzelheim'][Math.min(4,s.introStage||0)];
/* The package occupies several visual pixels above its blocked table.
   Approach from the front or side; facing never matters on touchscreen. */
function nearParcel(p){
  if(!p)return false;
  return (p.x>=9&&p.x<=13&&p.y===5) ||
         (p.x>=10&&p.x<=12&&p.y===6) ||
         ((p.x===9||p.x===13)&&p.y===4) ||
         (p.x>=10&&p.x<=12&&p.y===2);
}
function walk(s,dx,dy,dir,showDialog,stepSound){
  const p=s.player;p.dir=dir;const x=p.x+dx,y=p.y+dy;
  if(y>=10&&(x===7||x===8)){
    if(s.introStage<3){showDialog(['Oma Martha: „Warte kurz, mein Schatz. Das Paket auf dem Tisch ist für dich.“']);return;}
    s.scene='OVERWORLD';s.introStage=4;p.x=5;p.y=6;p.dir='down';p.stepPhase=0;
    s.encounterGrace=Math.max(12,s.encounterGrace||0);
    stepSound();
    showDialog(['Oma ruft dir nach: „Pass gut auf dich und Miora auf!“','Du trittst hinaus ins sonnige Wurzelheim.']);
    return;
  }
  if(x<1||x>=15||y<2||y>=10||blocks.has(x+','+y)||(x===4&&y===7))return;
  p.x=x;p.y=y;p.stepPhase=(p.stepPhase+1)%2;stepSound();
}
function talk(s,showDialog,createMonster,sfx){
  const p=s.player,d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[p.dir]||[0,1];
  const x=p.x+d[0],y=p.y+d[1];
  if(x===4&&y===7){
    if(s.introStage===0){s.introStage=1;showDialog([
      'Oma Martha: „Da bist du ja, mein Schatz.“',
      '„Vorhin wurde ein Paket für dich abgegeben. Es steht auf dem Tisch am Fenster.“',
      '„Dein Vater hat es für dich hinterlassen. Schau es dir in Ruhe an.“'
    ]);return;}
    if(s.introStage===1){showDialog(['Oma Martha: „Das Paket steht dort rechts auf dem Tisch. Es leuchtet ein bisschen, siehst du?“']);return;}
    if(s.introStage===2){s.introStage=3;showDialog([
      'Oma Martha: „Miora ... diese Wärme kenne ich nur zu gut.“',
      '„Dein Vater wusste, dass die Kapsel eines Tages zu dir finden würde.“',
      '„Geh ruhig hinaus und schau dich in Wurzelheim um. Im hohen Gras sei bitte vorsichtig.“'
    ]);return;}
    if(s.foundMusicBox&&!s.musicBoxDelivered){
      if(window.EchoStory){
        if(!window.EchoStory.claimReward(s,'martha.musicbox'))return;
      }else{s.musicBoxDelivered=true;s.potions+=3;}
      sfx.heal();showDialog(['Oma Martha: „Meine Spieluhr! Du hast sie gefunden!“','„Hier, nimm drei Seelen-Tränke als Dankeschön.“']);return;}
    if(s.ruinsProgress?.bossWon&&!s.ruinsProgress.reported){
      s.ruinsProgress.reported=true;
      sfx.heal();
      showDialog([
        'Oma Martha legt die Hand auf die alte Kapsel. Sie wird plötzlich ganz still.',
        '„Diese Stimme ... ja. Dein Vater hat die Erinnerungssignale untersucht.“',
        '„Er sagte immer: Eine Erinnerung kann verschwinden, aber niemals einfach aufhören, wahr zu sein.“',
        '„Die alten Leitungen führen nach Norden. Dort wurde zuletzt ein Signal aufgefangen.“',
        '„Du musst nicht sofort gehen. Aber wenn du gehst, nimm Miora mit.“',
        'KAPITEL 2 ABGESCHLOSSEN · Eine neue Spur führt nach Norden.'
      ]);s.team.forEach(m=>m.hp=m.maxHp);return;
    }
    if(s.ruinsProgress?.reported){
      showDialog(['Oma Martha: „Was dein Vater in der Ruine sagte, lässt mich nicht los.“',
        '„Die Signalspur führt weiter nach Norden. Hier ist immer ein sicherer Ort für euch.“']);
      s.team.forEach(m=>m.hp=m.maxHp);return;
    }
    showDialog(['Oma Martha: „Hier bist du immer willkommen.“','„Wenn deine Wesen müde sind, ruh dich bei mir aus.“']);
    s.team.forEach(m=>m.hp=m.maxHp);return;
  }
  if(nearParcel(p) || (x===11&&y===4)){
    if(s.introStage===0){showDialog(['Ein Paket mit deinem Namen. Vielleicht sollte ich zuerst Oma fragen.']);return;}
    if(s.hasStarter){showDialog(['Der Karton ist leer. Das goldene Siegel glitzert noch immer.']);return;}
    s.team.push(createMonster(1,5));s.hasStarter=true;s.seenIds[1]=true;s.caughtIds[1]=true;s.introStage=2;
    sfx.evolve();showDialog([
      'Du löst das goldene Siegel und öffnest das Paket ...',
      'In weichem Licht schwebt die Relikt-Kapsel empor. Nr. 001 MIORA erscheint!',
      'Miora sieht dich an. Es fühlt sich an, als würde dich jemand Vertrautes umarmen.',
      'Auf dem Brief steht: „Für unser Kind. In Liebe, Elena.“'
    ]);return;
  }
  if(x>=7&&x<=8&&y>=10){if(s.introStage<3)showDialog(['Oma: „Vergiss dein Paket nicht, mein Schatz!“']);else walk(s,0,1,'down',showDialog,sfx.step);return;}
  if(x>=2&&x<=4&&y>=3&&y<=5){showDialog(['Dein Bett. Hier hast du früher immer von Geisterwesen geträumt.']);return;}
  if(x===14&&y>=3&&y<=5){showDialog(['Omas Bücherregal. Zwischen Kochbüchern stehen alte Notizen deines Vaters.']);return;}
  if(x>=2&&x<=3&&y===7){showDialog(['Im Ofen knistert ein kleines Feuer. Es duftet nach frisch gebackenem Brot.']);return;}
}
function render(ctx,tick,s,drawChar){
  const p=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const label=(v,x,y,size=9,c='#fff0c8',align='left')=>{ctx.save();ctx.fillStyle=c;ctx.font='bold '+size+'px monospace';ctx.textAlign=align;ctx.fillText(v,x,y);ctx.restore();};
  // Wide floorboards and a timber dado keep the silhouettes readable.
  p(0,0,320,180,'#24262b');p(20,3,280,174,'#777a7b');
  p(24,7,272,166,'#c7c8c4');p(25,8,270,25,'#f4f4ef');
  p(25,26,270,7,'#777a7b');p(25,31,270,3,'#24262b');
  for(let x=28;x<294;x+=11){
    p(x,27,1,4,'#c7c8c4');
    p(x+3,10,4,1,'#c7c8c4');
  }
  p(25,34,270,138,'#c7c8c4');
  for(let row=0;row<11;row++){
    const y=35+row*12;
    p(25,y,270,1,'#a1a4a0');
    p(25,y+1,270,1,'#dedfda');
    for(let x=29+(row%3)*11;x<290;x+=34)p(x,y+2,1,9,'#a1a4a0');
  }
  // Window light is kept under furniture and actors.
  for(const x of [81,233]){
    p(x+4,34,18,18,'#f4f4ef55');
    p(x+7,52,20,8,'#f4f4ef33');
  }
  for(const x of [82,235]){
    p(x-3,9,32,25,'#674839');p(x,11,26,19,'#9bd0c7');p(x+2,13,22,15,'#bee7d4');
    p(x+12,11,2,19,'#765541');p(x,20,26,2,'#765541');p(x-4,30,34,4,'#8b6047');
    for(const f of [x+5,x+18]){p(f,25,2,5,'#447e52');p(f-3,23,6,4,'#6ca66b');p(f,22,2,2,'#f2d983');}
  }
  // Bett und Kissen.
  p(60,44,49,57,'#493b38');p(64,47,42,51,'#996a53');p(67,49,36,47,'#eed8aa');
  p(68,50,34,15,'#f2e4ce');p(72,51,25,9,'#fff6e1');p(68,65,34,28,'#6e8b80');
  for(let j=0;j<4;j++)p(68,69+j*6,34,2,j%2?'#b0c3ab':'#9baf9e');
  p(66,90,40,5,'#46544b');
  // Woven rug with a quiet center behind the player sprite.
  p(122,90,63,52,'#24262b');p(124,92,59,48,'#777a7b');
  p(127,95,53,42,'#c7c8c4');p(130,98,47,36,'#777a7b');
  p(132,100,43,32,'#b8b9b4');
  for(let x=129;x<177;x+=6){
    p(x,93,3,2,'#f4f4ef');p(x,137,3,2,'#f4f4ef');
  }
  for(const [x,y] of [[137,104],[166,104],[137,123],[166,123]]){
    p(x+2,y,2,6,'#777a7b');p(x,y+2,6,2,'#777a7b');p(x+2,y+2,2,2,'#f4f4ef');
  }
  // Ofen mit Feuer.
  p(64,107,36,40,'#4c4943');p(68,111,28,31,'#786c5d');p(71,114,22,24,'#303537');
  const flame=Math.floor(tick/150)%3;
  p(75,123,14,13,'#777a7b');p(78,120+flame,8,13-flame,'#c7c8c4');
  p(81,125-flame,3,8+flame,'#f4f4ef');p(76+flame,116,1,1,'#f4f4ef');
  p(66,107,32,5,'#a9987a');p(68,103,28,5,'#4c5e5b');
  // Regal.
  p(257,36,28,67,'#4b3a35');p(260,38,22,63,'#95694f');
  for(const y of [56,75,94])p(259,y,24,4,'#513c33');
  const colors=['#658e80','#bd7359','#d8b77b','#647fa0','#aa7b93'];
  for(let i=0;i<12;i++){let x=262+i%4*5,y=42+Math.floor(i/4)*19;p(x,y,4,13,colors[(i*3+1)%5]);p(x+1,y+2,1,8,'#eedab0');}
  // Pakettisch und golden verschnürtes Paket.
  p(191,49,53,10,'#654639');p(193,44,49,10,'#c29363');p(196,45,43,3,'#f0c28a');
  p(194,54,6,23,'#7d533d');p(235,54,6,23,'#7d533d');
  p(209,43,19,14,'#8a6751');p(211,36,19,16,'#a66a47');p(213,35,15,12,'#d8a76c');
  p(218,35,4,17,'#f1d791');p(213,40,15,3,'#efd291');p(218,39,4,5,'#9d7347');p(216,34,9,2,'#fff1b9');
  if(!s.hasStarter){
    const gl=Math.sin(tick*.009);p(213,29+gl*2,3,3,'#fff3bb');p(230,39-gl*2,3,3,'#fff6c4');
    p(222,24-gl*2,2,6,'#ffe29b');p(220,26-gl*2,6,2,'#ffe29b');
    if(s.introStage===1){p(198,16,47,13,'#294d49');label(nearParcel(s.player)?'A: ÖFFNEN':'PAKET!',221,25,8,'#fff1b6','center');}
  }
  // Oma, Spieler und kleiner Begleiter.
  drawChar(96,112,'#ad8193',0,'oma','right');
  drawChar(32+s.player.x*16,s.player.y*16,'#da7965',s.player.stepPhase,'player',s.player.dir);
  if(s.hasStarter&&s.team.length){p(32+s.player.x*16+17,s.player.y*16+1,12,11,'#ffffd1');p(32+s.player.x*16+20,s.player.y*16+4,2,2,'#617c8f');}
  // Ausgang samt Türschwelle.
  p(138,156,35,22,'#6f4738');p(142,158,27,19,'#9f7651');p(146,160,19,17,'#b9b68b');
  p(150,163,11,10,'#66887b');p(157,165,2,2,'#f8df97');p(135,174,42,3,'#4a3833');
  // The location and current objective share one compact header.
  p(25,8,56,14,'#24262b');p(26,9,54,12,'#777a7b');
  label('OMAS HAUS',30,17,7,'#f4f4ef');
  const goal=s.introStage===1&&nearParcel(s.player)?'A: Paket öffnen':objective(s);
  p(119,10,111,12,'#24262b');label(goal,174,18,7,'#f4f4ef','center');

}
window.EchoHouse={walk,talk,render,objective,nearParcel};
})();