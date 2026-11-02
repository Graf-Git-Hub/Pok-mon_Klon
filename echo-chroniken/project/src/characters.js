/* Original 16x20 Pixel-Figuren, vier Richtungen und drei Gehphasen. */
(()=>{
'use strict';
const INK='#293b48';
const roles={
 player:['#d76c54','#4e4145','#82706b','#f2c795','short'],
 boy:['#598fb7','#54483d','#9a7655','#e8b48e','messy'],
 girl:['#c178a3','#584b62','#98758f','#f1c6a8','pony'],
 oma:['#a17b99','#bbc7c5','#f7ece0','#e9b69d','bun'],
 edda:['#52958d','#674735','#a17b57','#dfaf90','cap'],
 courier:['#665b78','#3a3448','#797088','#deb297','hood'],
 stationMaster:['#577d9b','#665150','#a17e70','#e7bb9c','cap'],
 sera:['#bc925f','#4f4b48','#8d7967','#e9ba99','bob'],
 jaro:['#668f90','#554639','#8e7866','#d8a480','cap'],
 nemi:['#9378aa','#54475d','#84738f','#e8bc9e','pony'],
 taro:['#b38460','#62483c','#99755c','#deb18e','messy'],
 gym1:['#568e79','#57483c','#867969','#e8bb95','short'],
 gym2:['#6889b4','#6f4c43','#98766b','#e5bb9f','bob'],
 gym3:['#8b75a9','#444051','#72687e','#d9af94','long'],
 merchant:['#bd895c','#6e5447','#a88c72','#e4b28c','cap'],
 citizen:['#6c9a92','#554b46','#8a7968','#e6ba98','short']
};
const alias={witness0:'jaro',witness1:'nemi',witness2:'taro',stationmaster:'stationMaster',
 dorftilda:'girl',dorfjaro:'jaro',dorfmina:'nemi',
 fischer:'jaro',kraeuter:'nemi',werkstatt:'taro'};
const cache=new Map(),directions=['down','up','left','right'];
const tint=(h,n)=>{
 const a=String(h).match(/[a-f0-9]{2}/gi);
 if(!a||a.length!==3)return h;
 return '#'+a.map(v=>Math.max(0,Math.min(255,parseInt(v,16)+n)).toString(16).padStart(2,'0')).join('');
};
function generate(role,dir,step,color){
 const values=roles[role]||roles.citizen;
 const [coat0,hair,shine,skin,style]=values;
 const coat=(role==='citizen' && /^#[0-9a-f]{6}$/i.test(color||''))?color:coat0;
 const side=dir==='left'||dir==='right',back=dir==='up',flip=dir==='left';
 const bounce=step===2?1:0,walk=step!==0;
 const c=document.createElement('canvas');c.width=16;c.height=20;
 const g=c.getContext('2d',{alpha:true});g.imageSmoothingEnabled=false;
 const rect=(x,y,w,h,fill)=>{if(!fill||w<=0||h<=0)return;g.fillStyle=fill;g.fillRect(flip?16-x-w:x,y,w,h);};
 const px=(x,y,fill)=>rect(x,y,1,1,fill);
 const legL=walk?(step===1?0:1):0,legR=walk?(step===1?1:0):0;
 const oy=-bounce;
 // Feet and anchored ground shadow.
 rect(4,19,8,1,'#31495477');
 rect(4,16+legL,4,3,INK);rect(9,16+legR,4,3,INK);
 rect(5,16+legL,3,2,'#4b5d70');rect(9,16+legR,3,2,'#536579');
 rect(4,18+legL,4,1,'#303a50');rect(9,18+legR,4,1,'#303a50');
 px(5,18+legL,'#677586');px(10,18+legR,'#677586');
 // Rounded coat, separated sleeves, one-pixel light accents.
 rect(4,9+oy,9,7,INK);rect(3,10+oy,2,6,INK);rect(12,10+oy,2,6,INK);
 rect(5,10+oy,7,5,coat);rect(4,10+oy,2,4,tint(coat,-18));
 rect(12,10+oy,1,4,tint(coat,-20));
 rect(5,10+oy,2,2,tint(coat,26));
 rect(6,15+oy,5,1,tint(coat,-27));
 rect(3,14+oy+(walk&&step===1?1:0),2,2,skin);
 rect(12,14+oy+(walk&&step===2?1:0),2,2,tint(skin,-18));
 if(role==='oma'){
   rect(6,10+oy,5,6,'#eee0bb');rect(7,11+oy,3,4,'#f9edcf');
   px(9,13+oy,'#b7a68c');
 }else{
   rect(7,10+oy,3,3,role==='courier'?'#ce9ba1':'#efd5a1');
   rect(6,14+oy,5,1,tint(coat,-34));
 }
 if(role==='edda'){rect(12,13+oy,2,3,'#9e7148');px(13,13+oy,'#e5bf77');}
 if(role==='courier'||role==='stationMaster')rect(10,11+oy,2,2,'#efd694');
 if(role==='player')rect(3,11+oy,2,3,'#a37c5a');
 // Head differs substantially between face, side and back.
 if(side){
   rect(4,2+oy,10,9,INK);rect(5,4+oy,8,5,hair);
   rect(6,4+oy,7,6,skin);
   rect(6,4+oy,6,2,hair);rect(7,3+oy,5,2,shine);
   rect(12,6+oy,2,2,skin);px(10,7+oy,INK);
   px(11,9+oy,tint(skin,-23));rect(5,7+oy,1,3,hair);
 }else if(back){
   rect(3,2+oy,11,9,INK);rect(4,3+oy,9,7,hair);
   rect(5,3+oy,7,2,shine);rect(4,9+oy,9,2,tint(hair,-10));
   rect(6,10+oy,5,1,skin);
 }else{
   rect(3,2+oy,11,9,INK);rect(4,3+oy,9,7,hair);
   rect(5,5+oy,7,5,skin);
   rect(5,7+oy,1,2,tint(skin,-23));rect(11,7+oy,1,2,tint(skin,-23));
   px(7,7+oy,INK);px(10,7+oy,INK);px(8,9+oy,tint(skin,-23));
   rect(4,4+oy,9,2,hair);rect(5,3+oy,6,2,shine);
 }
 // Each haircut has its own recognizable silhouette.
 if(style==='messy'){
   px(4,2+oy,hair);rect(7,1+oy,3,2,shine);px(12,2+oy,hair);
 }else if(style==='pony'){
   const x=side?4:12;
   rect(x,5+oy,3,8,INK);rect(x+(side?1:0),6+oy,2,5,hair);
   px(x+1,10+oy,shine);
 }else if(style==='long'){
   rect(3,7+oy,2,6,hair);rect(12,7+oy,2,6,hair);
   px(4,11+oy,shine);
 }else if(style==='bob'){
   rect(3,5+oy,2,6,hair);
   if(!side)rect(12,5+oy,2,6,hair);
 }else if(style==='bun'){
   const x=side?3:11;
   rect(x,1+oy,4,5,INK);rect(x+1,2+oy,2,3,hair);
   px(x+1,2+oy,shine);
   rect(4,2+oy,9,3,hair);rect(5,2+oy,7,2,shine);
   if(!back)rect(5,4+oy,7,1,hair);
 }else if(style==='hood'){
   rect(3,2+oy,11,7,tint(coat,-32));
   rect(4,3+oy,9,2,tint(coat,19));
   rect(4,5+oy,2,5,tint(coat,-28));
   if(!back)rect(5,6+oy,7,1,hair);
 }else if(style==='cap'){
   const cap=role==='stationMaster'?'#52758d':
     role==='edda'?'#b88b55':role==='jaro'?'#537d80':'#9e7956';
   rect(4,1+oy,9,3,INK);rect(5,1+oy,7,2,cap);
   rect(side?9:4,3+oy,side?5:9,2,tint(cap,-19));
   px(8,1+oy,tint(cap,29));
 }
 if(side){
   rect(5,10+oy,3,3,tint(coat,15));
   rect(11,11+oy,2,4,tint(coat,-20));
   if(walk)px(11,14+oy,skin);
 }
 return c;
}
function frame(role='player',dir='down',step=0,color){
 const chosen=alias[role]||((role in roles)?role:'citizen');
 const facing=directions.includes(dir)?dir:'down';
 const phase=step===0?0:(step%2===0?2:1);
 const t=chosen==='citizen'&&/^#[0-9a-f]{6}$/i.test(color||'')?color:'';
 const key=[chosen,facing,phase,t].join('|');
 let sprite=cache.get(key);
 if(!sprite){sprite=generate(chosen,facing,phase,t);cache.set(key,sprite);}
 return sprite;
}
function draw(ctx,x,y,role='player',dir='down',step=0,color){
 const sprite=frame(role,dir,step,color);
 ctx.save();ctx.imageSmoothingEnabled=false;
 ctx.drawImage(sprite,Math.round(x),Math.round(y)-4);ctx.restore();
}
window.EchoCharacters=Object.freeze({
 WIDTH:16,HEIGHT:20,DIRECTIONS:Object.freeze(directions),
 ROLES:Object.freeze(Object.keys(roles)),frame,draw,cacheSize:()=>cache.size
});
})();
