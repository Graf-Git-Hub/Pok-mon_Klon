/* Echo-Chroniken SOULS Kartenwerkstatt bridge.
   Applies validated diff-only edits in the same tile/collision arrays the
   game uses. Separate environment/foreground layers keep actors readable.
   The original SOULS editor and all player saves remain untouched. */
(() => {
  'use strict';
  const data=window.EchoSoulsEditedData;
  const regions=data?.format==='ECHO_SOULS_DIFF_V1'&&data.schema===1?
    (data.regions||{}):{};
  const BLOCKED=new Set([1,4,5,7]);
  const drawn=new Set(['lamp','smallflowers','bushflowers','flowers_box',
    'shrub','stones','barrel','sign','fenceH','fenceV']);
  const applied=new Set();
  function apply(mapId,tiles){
    const map=regions[mapId];
    if(!map)return {applied:0,skipped:0};
    if(!Array.isArray(tiles)||tiles.length!==map.h||
       tiles.some(row=>!Array.isArray(row)||row.length!==map.w)){
      console.warn('SOULS: map dimensions changed, ignoring',mapId);
      return {applied:0,skipped:map.changes.length};
    }
    let done=0,skipped=0;
    for(const [x,y,before,after] of map.changes){
      if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||x>=map.w||
         y<0||y>=map.h||!Number.isInteger(after)||after<0||after>9){
        skipped++;continue;
      }
      if(tiles[y][x]===after)continue; // idempotent on reload
      if(tiles[y][x]!==before){
        skipped++;
        console.warn('SOULS: original map changed, protected cell',mapId,x,y);
        continue;
      }
      tiles[y][x]=after;done++;
    }
    if(done)applied.add(mapId);
    return {applied:done,skipped};
  }
  function applyAll(registry){
    let done=0,skipped=0;
    for(const id of Object.keys(regions)){
      const tiles=registry?.get(id)?.tiles;
      if(!tiles)continue;
      const result=apply(id,tiles);
      done+=result.applied;skipped+=result.skipped;
    }
    return {applied:done,skipped};
  }
  function renderProps(mapId,camX,camY,pix){
    const props=regions[mapId]?.props||[];
    for(const {id,x,y} of props){
      if(!drawn.has(id)||!Number.isInteger(x)||!Number.isInteger(y))continue;
      const sx=x*16-camX,sy=y*16-camY;
      if(sx<-20||sy<-20||sx>340||sy>198)continue;
      if(id==='lamp'){
        pix(sx+7,sy+7,2,9,'#554337');
        pix(sx+4,sy+2,9,7,'#4e5152');
        pix(sx+5,sy+3,7,5,'#fbd883');
        pix(sx+7,sy,3,2,'#fff5be');
      }else if(id.includes('flower')){
        for(const [dx,dy] of [[3,10],[11,6],[7,13]]){
          pix(sx+dx,sy+dy,2,3,'#448962');
          pix(sx+dx-1,sy+dy-2,4,3,id==='bushflowers'?'#ffb2a1':'#f1acba');
          pix(sx+dx,sy+dy-2,1,1,'#fff1b9');
        }
      }else if(id==='shrub'){
        pix(sx+1,sy+7,15,8,'#40784e');pix(sx+3,sy+4,11,8,'#659d58');
        pix(sx+6,sy+3,5,2,'#add984');
      }else if(id==='stones'){
        pix(sx+4,sy+9,10,6,'#667781');pix(sx+5,sy+7,7,5,'#91a0a6');
      }else if(id==='sign'){
        pix(sx+7,sy+6,2,10,'#806342');pix(sx+3,sy+3,10,7,'#b79b72');
        pix(sx+4,sy+4,8,4,'#e7d3ab');
      }else if(id==='barrel'){
        pix(sx+3,sy+6,10,10,'#825a3e');pix(sx+4,sy+7,8,2,'#b19066');
      }else if(id.startsWith('fence')){
        const vertical=id==='fenceV';
        pix(sx+(vertical?6:1),sy+(vertical?1:7),vertical?4:14,vertical?14:4,'#8b6c4d');
      }
    }
  }
  function foreground(mapId,tiles,px,py,camX,camY,pix){
    const tile=tiles?.[py]?.[px];
    if(tile!==2&&tile!==9)return;
    const x=px*16-camX,y=py*16-camY;
    // The grass tops are painted AFTER the actor, so the player looks inside
    // the tall grass rather than walking above it like a pasted-on sprite.
    for(let i=2;i<15;i+=4){
      pix(x+i,y+10,2,6,'#367f59');
      pix(x+i+1,y+8,2,5,'#6aaa77');
      pix(x+i+2,y+8,1,2,'#c8d59b');
    }
  }
  window.EchoSOULS=Object.freeze({apply,applyAll,renderProps,foreground,
    regions:Object.freeze(Object.keys(regions)),applied});
})();
