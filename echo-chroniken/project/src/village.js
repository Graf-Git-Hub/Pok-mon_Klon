/* Wurzelheim 2.0: feste, begehbare Dorfkarte. Alle Koordinaten sind 16px-Weltkacheln. */
(() => {
'use strict';
const W=36,H=28;
const homes=[
  {id:'kraeuter',name:'Kräuterhaus',x:12,y:2,roof:'#699c70',roofShade:'#3c715f',wall:'#e2c6a0',trim:'#8d624b',door:'#734b3c'},
  {id:'fischer',name:'Haus am See',x:25,y:2,roof:'#6498a9',roofShade:'#325b76',wall:'#d7cbac',trim:'#677283',door:'#725244'},
  {id:'werkstatt',name:'Werkstatt',x:4,y:14,roof:'#b57960',roofShade:'#784c52',wall:'#e5bd8d',trim:'#806046',door:'#595c59'},
  {id:'laden',name:'Dorfladen',x:20,y:14,roof:'#ad817c',roofShade:'#694f73',wall:'#edcf9f',trim:'#936c54',door:'#7b6650'}
];
const routes=[
  [[5,5],[6,6],[8,7],[10,8],[12,10],[14,11],[17,11],[21,11],[24,12],[28,12],[32,13],[34,13]],
  [[14,5],[14,7],[14,9],[14,11]],
  [[27,5],[27,8],[26,10],[24,12]],
  [[6,17],[7,15],[9,13],[12,11]],
  [[22,17],[22,15],[21,13],[18,11]],
  [[17,11],[17,13],[18,15],[21,18],[24,21],[29,23],[33,24]],
  [[9,12],[7,10],[5,8]],
  // Longer optional village walk, joining workshop to southern ghost meadows.
  [[6,17],[5,20],[6,23],[10,25],[15,24],[20,23],[25,24],[30,24],[33,23]],
  [[10,25],[10,21],[14,19],[18,18],[21,18]],
  // The eastern lantern path loops back rather than terminating at a wall.
  [[24,12],[29,11],[33,13],[33,17],[31,21],[29,23]]
];
const safePoints=[
 [5,5],[5,6],[5,7],[4,6],[6,6],[14,5],[27,5],[6,17],[22,17],
 [11,12],[16,9],[23,11],[25,13],[24,6],[28,20],[30,21],[31,22],[30,13]
];
const villageNPCs=[
  {id:'dorftilda',name:'Tilda',x:10,y:9,color:'#b46f81',talk:()=>[
    'Tilda: „Willkommen in Wurzelheim! Am Dorfplatz trifft man immer jemanden.“',
    '„Zum Seelen-See führt der Weg im Nordosten. Die kleine Brücke ist hübsch bei Sonnenaufgang.“']},
  {id:'dorfjaro',name:'Jaro',x:19,y:12,color:'#6589a4',talk:()=>[
    'Jaro: „Die Wege hier sind alt. Wir haben sie um die Bäume herum gebaut, nicht andersherum.“',
    '„Hinter den letzten Laternen beginnen die wilden Geisterwiesen.“']},
  {id:'dorfmina',name:'Mina',x:7,y:18,color:'#cc9b6f',talk:()=>[
    'Mina: „Drüben in der Werkstatt werden Fang-Sphären repariert.“',
    '„Wenn du etwas üben willst, such die kleineren Geister hinter dem Dorf.“']}
];
const hash=(x,y,s=0)=>{let n=(x*374761393+y*668265263+s*1274126177)|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
const safeMap=new Set();
function build(map){
  if(!Array.isArray(map)||map.length!==H)throw Error('World size mismatch');
  const set=(x,y,t)=>{if(x>0&&y>0&&x<W-1&&y<H-1)map[y][x]=t};
  // Replace the rigid paths and checkerboard trees, preserve eastern late-game realm.
  for(let y=1;y<=19;y++)for(let x=1;x<=31;x++){
    const edge = Math.pow((x-15)/19,2)+Math.pow((y-10)/13,2);
    if(edge<1.5 || (x>=23&&x<=31&&y<=17))set(x,y,0);
  }
  // Hinterland: uneven forest belts, small meadows, no random impassable wall.
  const trees=[
    [1,10],[2,11],[2,12],[3,11],[1,18],[2,20],[4,21],[7,22],[10,21],
    [11,19],[13,21],[15,20],[17,19],[19,20],[23,19],[26,19],
    [29,4],[30,5],[31,6],[32,8],[32,9],[33,11],[30,17],[31,18],[33,19],
    [2,2],[9,2],[10,3],[18,2],[19,3],[21,2],[33,3],[34,5]
  ];
  trees.forEach(([x,y])=>set(x,y,1));
  // Flourishing, irregular safe grass tufts inside Wurzelheim: tile 9 does not trigger battles.
  const tufts=[
    [[8,5],[9,5],[9,6]],[[17,5],[18,5],[18,6],[17,7]],[[21,8],[22,9]],
    [[2,13],[2,14],[3,13]],[[9,17],[10,17],[10,18],[11,18]],
    [[27,15],[28,15],[28,16]],[[14,18],[15,18],[15,19]],[[29,9],[30,9]]
  ];
  tufts.forEach(a=>a.forEach(([x,y])=>set(x,y,9)));
  // Pond from original story: uneven, lily-dotted shore, connected to music-box objective.
  for(let y=5;y<=8;y++)for(let x=19;x<=23;x++){
    const shore=(x===19&&y===5)||(x===23&&y===8)||(x===19&&y===8);
    if(!shore)set(x,y,4);
  }
  set(20,8,4);set(21,9,4);set(22,9,4);
  // Wild meadows only beyond lanterns / on southeastern route.
  const wild=[
    [[30,15],[31,15],[32,15],[32,16],[31,17]],
    [[29,20],[30,20],[31,20],[31,21],[32,21],[32,22]],
    [[26,23],[27,23],[27,24],[28,24],[29,24]],
    [[13,23],[14,23],[14,24],[15,24]],
    [[22,25],[23,25],[24,25]]
  ];
  wild.forEach(a=>a.forEach(([x,y])=>set(x,y,2)));
  // Organic meandering trails with non-uniform width and alternating cobbles/dirt.
  const nodes=[];
  for(let ri=0;ri<routes.length;ri++){
    const route=routes[ri];
    for(let n=0;n<route.length-1;n++){
      const [ax,ay]=route[n],[bx,by]=route[n+1],steps=Math.max(Math.abs(bx-ax),Math.abs(by-ay))*6;
      for(let i=0;i<=steps;i++){
        const t=i/steps,x=Math.round(ax+(bx-ax)*t+Math.sin(t*Math.PI)*Math.sin((t+ri+n)*4)*.16);
        const y=Math.round(ay+(by-ay)*t+Math.sin(t*Math.PI)*Math.cos((t+ri+n)*5)*.14);
        nodes.push([x,y]);
        set(x,y,(hash(x,y,28)>0.33?8:3));
        if(hash(x,y,ri+2)>.63)set(x+(ri%2?1:-1),y,8);
        if(hash(x,y,ri+9)>.77)set(x,y+1,8);
      }
    }
  }
  // Dorfplatz: rough ellipse, no hard right-angled stone slab.
  for(let y=8;y<=14;y++)for(let x=11;x<=19;x++){
    const d=Math.pow((x-15)/4.3,2)+Math.pow((y-11)/3.0,2);
    if(d<.75+hash(x,y,22)*.4)set(x,y,hash(x,y,5)>.42?3:8);
  }
  // Solid, visually drawn buildings. Do not cover doors or any important quest NPC.
  // Grandma's cottage always has the same coordinates for save compatibility.
  const allHomes=[{id:'oma',x:3,y:2},...homes];
  for(const h of allHomes){
    for(let y=h.y;y<h.y+3;y++)for(let x=h.x;x<h.x+5;x++)set(x,y,5);
    set(h.x+2,h.y+3,8);
    set(h.x+2,h.y+4,8);
  }
  // Ensure the original quest objects, bosses, healing monuments and routes stay reachable.
  const permanent=[[4,6,6],[16,13,6],[30,21,6]];
  safePoints.forEach(([x,y])=>{if(map[y]?.[x]!==6)set(x,y,8);});
  permanent.forEach(([x,y,t])=>set(x,y,t));
  // Keep all NPCs and quest relics accessible; their own tile stays walkable.
  for(const [x,y] of [[11,12],[23,11],[28,20],[24,6],[16,9],[25,13],[31,22],...villageNPCs.map(n=>[n.x,n.y])]){
    if(map[y]?.[x]!==6)set(x,y,8);
    for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){
      if(map[y+dy]?.[x+dx]===1)set(x+dx,y+dy,0);
    }
  }
  // Create accessible circular space around all home doors.
  for(const h of allHomes){
    for(const [dx,dy] of [[0,1],[-1,1],[1,1],[0,2]])set(h.x+2+dx,h.y+3+dy,8);
  }
  // Any remaining tile type 5 outside the new buildings must be removed.
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(map[y][x]===5&&!allHomes.some(h=>x>=h.x&&x<h.x+5&&y>=h.y&&y<h.y+3))set(x,y,0);
  safeMap.clear();
  for(let y=1;y<=18;y++)for(let x=1;x<=28;x++)if(map[y][x]!==1&&map[y][x]!==4&&map[y][x]!==5)safeMap.add(x+','+y);
  return map;
}
function paintTile(tile,ctx,sx,sy,x,y,tick,pix){
  // Loose, naturally eroded paving stones, never a full square tile of uniform bricks.
  if(tile===3){
    paintTile(8,ctx,sx,sy,x,y,tick,pix);
    const tones=['#dec9a1','#edd6b0','#bba98c','#d0b68b'];
    for(let i=0;i<7;i++){
      const u=1+Math.floor(hash(x*17+i*13,y*23+i,17)*12);
      const v=1+Math.floor(hash(x*11+i,y*19+i*9,31)*13);
      const w=2+(i%3);
      pix(sx+u,sy+v,w,2,tones[Math.floor(hash(x+i,y-i,45)*tones.length)]);
      pix(sx+u,sy+v,w,1,'#f0dfb6');
    }
    return true;
  }
  if(tile!==8&&tile!==9)return false;
  const colors=tile===8?['#b99e78','#bca17b','#c1ab83','#b59c76']:['#68ad74','#70b67a','#65a675','#77b57b'];
  pix(sx,sy,16,16,colors[Math.floor(hash(x,y,10)*colors.length)]);
  for(let j=0;j<26;j++){
    const a=Math.floor(hash(x*31+j,y*15+j,24)*16),b=Math.floor(hash(x+j*3,y*19+j,45)*16);
    pix(sx+a,sy+b,1+(j%7===0?2:0),1,tile===8?(j%3?'#d6ba8d':'#8e8068'):(j%2?'#93c98a':'#458d65'));
  }
  if(tile===8){
    for(let i=0;i<5;i++){
      const dx=Math.floor(hash(x*9+i,y*17,2)*13),dy=Math.floor(hash(x,y*11+i,4)*13);
      pix(sx+dx,sy+dy,2+(i%2),1,i%2?'#e1cba2':'#958772');
    }
    // Irregular grass eroding the path edge, based on adjacent non-path tiles.
    for(const [dx,dy,ax,ay,w,h] of [[-1,0,0,3,3,9],[1,0,13,1,3,10],[0,-1,2,0,11,3],[0,1,4,13,9,3]]){
      if(!window.EchoVillage.map?.[y+dy] || ![0,9,2].includes(window.EchoVillage.map[y+dy][x+dx]))continue;
      if(hash(x,y,dx+dy+19)>.3)pix(sx+ax,sy+ay,w,h,'#79ae77');
    }
  }else{
    // Fluttering tall decorative grass, no random encounters in town.
    const sway=Math.sin(tick*.0025+x*2+y)>.2?1:0;
    for(let i=1;i<16;i+=4){
      pix(sx+i,sy+10,2,6,'#3e845b');
      pix(sx+i+sway,sy+4+i%3,2,9,'#63a879');
      pix(sx+i+sway+1,sy+3+i%3,1,2,'#c9dda2');
    }
  }
  return true;
}
function draw(ctx,camX,camY,tick,pix){
  const P=(x,y,w,h,c)=>pix(Math.round(x),Math.round(y),w,h,c);
  const flower=(sx,sy,c='#f4d788')=>{
    P(sx+1,sy,2,2,c);P(sx,sy+1,4,1,'#f5e4b2');P(sx+1,sy+1,2,1,'#eec069');P(sx+2,sy+3,1,2,'#4c9464');
  };
  // Cottage facades in distinct roof palettes: actual buildings, not painted flat tiles.
  for(const h of homes){
    const x=h.x*16-camX,y=h.y*16-camY;
    if(x<-105||x>330||y<-115||y>200)continue;
    P(x-6,y+21,93,44,'#496e55');
    P(x-4,y+20,89,40,h.trim);P(x-1,y+24,83,35,h.wall);
    for(let i=0;i<10;i++)P(x+i*9,y+26,1,31,'#bba284');
    for(const xx of [1,19,61,79])P(x+xx,y+24,3,34,h.trim);
    P(x-6,y+55,93,6,'#735b4c');P(x-5,y+55,90,2,'#e4cfaa');
    // layered shingles with gabled, offset edge
    for(let row=0;row<6;row++){
      const roofY=y-19+row*8,margin=24-row*5;
      P(x+margin-4,roofY+2,89-2*margin,9,'#2c414b');
      P(x+margin-2,roofY,85-2*margin,8,row%2?h.roofShade:h.roof);
      for(let i=margin;i<81-margin;i+=8){
        P(x+i+(row%2?3:0),roofY+2,5,1,'#d2d9b5');
        P(x+i+2,roofY+6,3,1,'#263e4a');
      }
    }
    // chimney, attic pane, windows and shutters
    P(x+63,y-22,11,15,'#8f6252');P(x+61,y-24,15,4,'#be9475');
    P(x+32,y+3,17,18,'#654e49');P(x+35,y+6,11,12,'#acd4bf');
    P(x+39,y+6,2,12,'#7d6655');P(x+35,y+12,11,2,'#7d6655');
    for(const xx of [7,62]){
      P(x+xx-2,y+35,17,16,'#5f4947');P(x+xx,y+37,13,11,'#98c5bd');
      P(x+xx+5,y+37,2,11,'#dec9a2');P(x+xx,y+42,13,2,'#dec9a2');
      P(x+xx-3,y+49,18,4,'#7d5745');
      for(let a=0;a<4;a++)P(x+xx+a*3,y+47+a%2,3,3,a%2?'#d77e9a':'#e8bf73');
    }
    P(x+31,y+40,20,20,'#4b3e3f');P(x+34,y+42,14,18,h.door);
    P(x+43,y+50,2,2,'#f4dc9a');P(x+28,y+59,26,3,'#a88c6f');
    // little shop-specific sign/symbol
    const emblem=h.id==='kraeuter'?'✿':h.id==='fischer'?'~':h.id==='werkstatt'?'⚒':'★';
    P(x+56,y+27,16,12,'#4b625c');P(x+58,y+29,12,8,'#ddcb96');
    ctx.save();ctx.font='bold 9px monospace';ctx.fillStyle='#52725e';ctx.fillText(emblem,x+60,y+36);ctx.restore();
  }
  // Village square with central spring/well, signpost, benches, flower stalls.
  const squareX=15*16-camX,squareY=11*16-camY;
  P(squareX+2,squareY+8,14,7,'#706d60');P(squareX+4,squareY+5,10,8,'#cfbd91');
  P(squareX+5,squareY+5,8,5,'#4a8e97');P(squareX+7,squareY+5,4,3,'#a7e0c8');
  P(squareX+5,squareY+1,8,3,'#5c756e');P(squareX+7,squareY-2,4,6,'#d7be85');
  for(const [tx,ty] of [[12,10],[18,12]]){
    const x=tx*16-camX,y=ty*16-camY;
    P(x+1,y+8,14,3,'#825944');P(x+2,y+6,12,3,'#d6ae78');P(x+4,y+11,2,4,'#7d5949');P(x+12,y+11,2,4,'#7d5949');
  }
  for(const [tx,ty] of [[7,7],[12,6],[22,11],[29,12],[21,18]]){
    const x=tx*16-camX,y=ty*16-camY;
    P(x+7,y+3,3,13,'#6a5a44');P(x+4,y+2,9,7,'#405c57');P(x+6,y+3,5,5,'#f3ce83');
    P(x+7,y+4,3,2,'#fff2b4');
  }
  // Custom gardens, berry bushes, barrel piles and flowers.
  for(const [tx,ty] of [[8,4],[10,5],[18,4],[20,3],[24,10],[27,10],[3,17],[10,16],[24,17],[21,19],[17,6],[4,10],[8,18]]){
    const x=tx*16-camX,y=ty*16-camY;
    if(x<-16||x>330||y<-16||y>195)continue;
    P(x+2,y+10,12,4,'#4d8e62');P(x+4,y+7,9,5,'#69a26b');P(x+6,y+5,5,3,'#9ec683');
    flower(x+5,y+6,hash(tx,ty)>.5?'#d989a5':'#efc579');flower(x+11,y+9,'#f4d2a2');
  }
  // Two short fence segments, never across the footpaths or parcel entrance.
  for(const [tx,ty] of [[2,7],[3,7],[8,7],[9,7],[10,15],[11,15],[24,16],[25,16]]){
    const x=tx*16-camX,y=ty*16-camY;
    P(x+1,y+7,15,2,'#674b3d');P(x+1,y+11,15,2,'#bf9167');
    P(x+2,y+4,4,12,'#76563e');P(x+3,y+3,2,12,'#deb784');
  }
  // Shore reeds and tiny water plants without blocking approach to the story music box.
  for(const [tx,ty] of [[19,8],[20,9],[22,9],[23,8],[24,8]]){
    const x=tx*16-camX,y=ty*16-camY;
    P(x+1,y+11,2,5,'#578b69');P(x+3,y+8,2,7,'#7ead79');P(x+5,y+12,3,2,'#acbd82');
  }
}
function doorAt(x,y){return homes.find(h=>x===h.x+2&&y===h.y+2)||null;}
function getNpcList(){return villageNPCs.map(n=>({...n}));}
function isSafe(x,y){return safeMap.has(x+','+y);}
window.EchoVillage={build,paintTile,draw,doorAt,getNpcList,isSafe,homes,routes,map:null};
})();