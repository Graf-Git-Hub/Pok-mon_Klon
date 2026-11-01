/* Sprite-friendly GBA-style hit effects. Generated pixels, no downloads. */
(() => {
'use strict';
function draw(ctx,b,tick){
  if(!b || b.animTimer<=0)return;
  const frame=18-b.animTimer,progress=Math.max(0,Math.min(1,frame/16));
  const allyHit=b.fxTarget==='ally';
  const start=allyHit?{x:244,y:54}:{x:84,y:79};
  const end=allyHit?{x:78,y:79}:{x:243,y:57};
  const color=b.lastAttackColor||'#c69bfa';
  const pix=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  // Pixel projectiles: wind-up from the attacker, then a broad burst at impact.
  const projectileProgress=Math.min(1,progress*1.85);
  const curve=12*Math.sin(Math.PI*projectileProgress);
  const x=start.x+(end.x-start.x)*projectileProgress;
  const y=start.y+(end.y-start.y)*projectileProgress-curve;
  const white='#fff3c9';
  if(progress<.57){
    pix(x-3,y-1,7,3,color);pix(x,y-4,3,9,white);
    for(let i=0;i<5;i++){
      const t=Math.max(0,projectileProgress-(i+1)*.055);
      const tx=start.x+(end.x-start.x)*t;
      const ty=start.y+(end.y-start.y)*t-12*Math.sin(Math.PI*t);
      pix(tx,ty,2,2,i%2?white:color);
    }
  }else{
    const t=(progress-.57)/.43;
    const radius=5+Math.floor(t*24);
    for(let i=0;i<14;i++){
      const a=(Math.PI*2*i/14)+(tick*.0008);
      const px=end.x+Math.cos(a)*radius,py=end.y+Math.sin(a)*radius*.65;
      pix(px,py,i%3===0?4:2,i%2===0?3:2,i%2?color:white);
    }
    for(let k=0;k<4;k++)pix(end.x-8+k*5,end.y-1,3,2,white);
  }
}
window.EchoCombatFX={draw};
})();