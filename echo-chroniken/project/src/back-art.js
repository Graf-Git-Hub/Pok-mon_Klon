/* Optional 135-art back sheet, preserving eight bundled backs and all savegames. */
(() => {
'use strict';
const COUNT=135, KEY='echo_chroniken_back_sheet_v1', cache=Object.create(null);
let source=null,kind='';
const api={
 get count(){return source?COUNT:0},
 getSprite(id){
  if(!source||!Number.isInteger(id)||id<1||id>COUNT)return null;
  if(cache[id])return cache[id];
  const canvas=document.createElement('canvas'); canvas.width=76;canvas.height=76;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const index=id-1;
  if(kind==='atlas'){
   const tile=source.width/10;
   ctx.drawImage(source,(index%10)*tile,Math.floor(index/10)*tile,tile,tile,0,0,76,76);
  }else{
   const panel=Math.floor(index/45),pos=index%45,col=pos%5,row=Math.floor(pos/5);
   const bounds=[[0,524],[528,1031],[1037,1536]][panel],sx=source.width/1536,sy=source.height/1024;
   const x0=(bounds[0]+(bounds[1]-bounds[0])*col/5+3)*sx;
   const x1=(bounds[0]+(bounds[1]-bounds[0])*(col+1)/5-3)*sx;
   const y0=(row*1024/9+3)*sy,y1=((row+1)*1024/9-3)*sy;
   ctx.drawImage(source,x0,y0,x1-x0,y1-y0,2,2,72,72);
   const pixels=ctx.getImageData(0,0,76,76);
   for(let i=0;i<pixels.data.length;i+=4){
    const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];
    if(Math.min(r,g,b)>239&&Math.max(r,g,b)-Math.min(r,g,b)<18)pixels.data[i+3]=0;
   }
   ctx.putImageData(pixels,0,0);
  }
  return cache[id]=canvas;
 },
 async importFile(file){
  if(!file||!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('PNG, JPG oder WebP auswählen.');
  if(file.size>12*1024*1024)throw Error('Datei ist zu groß.');
  const data=await new Promise((ok,fail)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=()=>fail(Error('Bild nicht lesbar.'));reader.readAsDataURL(file)});
  await load(String(data));
  try{localStorage.setItem(KEY,data)}catch(e){console.warn('Bild nicht dauerhaft gespeichert',e)}
  return COUNT;
 }
};
window.EchoBackArt=api;
function load(url){
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>{
   const ratio=img.width/img.height;
   if(img.width>=1000&&ratio>1.25&&ratio<1.75)kind='combined';
   else if(img.width>=200&&Math.abs(ratio-10/14)<.09)kind='atlas';
   else{reject(Error('Erwartet: drei Bildbögen nebeneinander oder ein 10x14 Sprite-Atlas.'));return}
   source=img;Object.keys(cache).forEach(k=>delete cache[k]);resolve();
  };
  img.onerror=()=>reject(Error('Rückansichten konnten nicht geladen werden.'));
  img.src=url;
 });
}
let saved=null;try{saved=localStorage.getItem(KEY)}catch(e){}
load(saved||'assets/monster-backs-135.webp').catch(()=>{});
document.addEventListener('DOMContentLoaded',()=>{
 const button=document.getElementById('back-art-button');
 const input=document.getElementById('back-art-import');
 const status=document.getElementById('back-art-status');
 if(!button||!input)return;
 button.addEventListener('click',()=>input.click());
 input.addEventListener('change',async()=>{
  const file=input.files&&input.files[0]; if(!file)return;
  try{const n=await api.importFile(file);status.textContent=n+' Rückansichten aktiv, 15 fehlen in den Vorlagen.'}
  catch(e){status.textContent=e.message}
  input.value='';
 });
});
})();