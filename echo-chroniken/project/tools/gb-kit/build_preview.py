#!/usr/bin/env python3
"""Build a self-contained touch-friendly visual walk demo from the *same*
sprite atlas and collision JSON used for the Echo-Chroniken kit.
No API, no CDN, no trademark assets or third-party dependencies.
"""
from pathlib import Path
import base64,json
root=Path(__file__).resolve().parents[2]
out=root.parent/"docs"/"gb-classic"/"klassik-demo.html"
js=json.loads((root/"assets"/"gb-classic"/"scene_maps.json").read_text(encoding="utf-8"))
tile=json.loads((root/"assets"/"gb-classic"/"tile_manifest.json").read_text(encoding="utf-8"))
atlas_data=base64.b64encode((root/"assets"/"gb-classic"/"gb_classic_atlas.png").read_bytes()).decode()
payload=json.dumps(js,ensure_ascii=False,separators=(",",":"))
manifest=json.dumps(tile,ensure_ascii=False,separators=(",",":"))
html="""<!doctype html><html lang="de"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1" />
<title>Echo-Chroniken · Game Boy Klassik Stiltest</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{background:#17191b;color:#e6e6de;font-family:system-ui,sans-serif;max-width:1160px;margin:0 auto;padding:12px}
h1{font-size:20px;margin:5px 0}
.subtitle{font-size:12px;line-height:1.5;color:#acada9;margin-bottom:9px}
.controls{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-bottom:12px}
select,button{border:2px solid #999;background:#303439;color:#f0f0eb;padding:10px 12px;border-radius:7px;font:600 15px system-ui}
button:focus-visible,select:focus-visible{outline:3px solid #f4f4ef;outline-offset:2px}
#game-frame{margin:0 auto;max-width:1100px;display:grid;justify-items:center}
#view{display:block;image-rendering:pixelated;image-rendering:crisp-edges;background:#f4f4ef;border:4px solid #42474b;
  max-width:100%;width:auto;height:auto;touch-action:none}
#hud{font-size:13px;font-weight:600;align-self:start;margin:7px 0;color:#d1d1cc}
#message{font-size:13px;min-height:34px;line-height:1.4;color:#d5d6c9;margin-top:7px;text-align:center}
#controller-state{font-size:12px;color:#babdb7;text-align:center}
.pad{display:grid;grid-template-columns:repeat(3,66px) 82px;grid-template-rows:repeat(2,55px);
 justify-content:center;gap:7px;margin:12px auto}
.pad button{padding:6px;font-size:22px;touch-action:none;user-select:none;-webkit-user-select:none}
.pad .up{grid-column:2;grid-row:1}.pad .left{grid-column:1;grid-row:2}
.pad .down{grid-column:2;grid-row:2}.pad .right{grid-column:3;grid-row:2}
.pad .action{grid-column:4;grid-row:2;border-radius:30px}
footer{font-size:12px;line-height:1.5;color:#b8bbb6;text-align:center;margin:10px auto;max-width:650px}
body.gamepad .pad{display:none}
@media (orientation:landscape) and (min-width:850px){body{padding:10px 24px}#game-frame{width:100%}.pad{display:none}}
@media (max-width:480px){body{padding:9px}.pad{grid-template-columns:repeat(3,58px) 75px;grid-template-rows:repeat(2,53px);gap:5px}
h1{font-size:18px}select,button{padding:9px 10px}}
:fullscreen body{max-width:none;width:100vw;height:100vh}
:fullscreen #view{max-height:76vh}
</style></head><body>
<h1>🎮 Echo-Chroniken · Game Boy Klassik</h1>
<div class="subtitle">Stiltest, noch nicht das Hauptspiel · 4 Graustufen · feste 16px-Grafikbibliothek · Kamera folgt deiner Figur.</div>
<div class="controls">
<label for="scene">Karte:</label><select id="scene"></select>
<label for="mode">Ansicht:</label><select id="mode" aria-label="Bildschirmansicht">
<option value="auto">Automatisch</option><option value="phone">Handy</option><option value="tv">TV</option>
</select>
<button id="fullscreen" type="button">⛶ Vollbild</button>
<button id="reset" type="button">↺ Neustart</button>
</div>
<div id="game-frame">
<canvas id="view" width="160" height="144" aria-label="Ausschnitt der Spielwelt, folgt deiner Figur"></canvas>
<div id="hud" aria-live="polite"></div>
</div>
<div id="message" role="status">Mit Steuerkreuz, Pfeiltasten oder Gamepad bewegen. Mit A oder Enter interagieren.</div>
<div id="controller-state">Handy: Touch · TV: Controller (Steuerkreuz / Stick, A, B, Start) · PC: Pfeiltasten/WASD</div>
<div class="pad" aria-label="Steuerung">
<button class="up" data-move="0,-1" aria-label="Hoch">▲</button>
<button class="left" data-move="-1,0" aria-label="Links">◀</button>
<button class="down" data-move="0,1" aria-label="Runter">▼</button>
<button class="right" data-move="1,0" aria-label="Rechts">▶</button>
<button class="action" id="action" aria-label="Interagieren">A</button>
</div>
<footer>Handy: 10 × 9 Felder · TV: 16 × 9 Felder · Pixel bleiben scharf. Das Bild scrollt mit deiner Spielfigur, Spiellogik und alte Speicherstände werden nicht verändert.</footer>
<script>
'use strict';
const DATA=__PAYLOAD__,MANIFEST=__MANIFEST__;
const atlas=new Image();
atlas.src="data:image/png;base64,__ATLAS__";
const TILE=16,view=document.getElementById("view"),ctx=view.getContext("2d");
const sel=document.getElementById("scene"),mode=document.getElementById("mode");
const msg=document.getElementById("message"),hud=document.getElementById("hud");
const padStatus=document.getElementById("controller-state");
const names=Object.keys(DATA.scenes),glyph=DATA.symbols;
for(const name of names){const op=document.createElement("option");op.value=name;op.textContent=name;sel.appendChild(op);}
let scene="Wurzelheim",px=10,py=15,dir=[0,-1],wave=0,paused=false;
let gamepadLastMove=0,gamepadLastButtons={},lastFrame=0,gamepadConnected=false;
let lastCamera={x:0,y:0,w:10,h:9},lastLayout="";
// This is one fixed tiled world. Only the camera dimensions change.
function screenTiles(){
 const landscape=window.innerWidth>window.innerHeight && window.innerWidth>=650;
 const tv=mode.value==="tv"||(mode.value==="auto"&&landscape&&
                   (window.innerWidth>=950||gamepadConnected));
 const cols=tv?16:landscape?14:10;
 return {w:cols,h:9};
}
function cameraFor(map){
 const tiles=screenTiles(),w=Math.min(map.width,tiles.w),h=Math.min(map.height,tiles.h);
 const x=Math.max(0,Math.min(map.width-w,px-Math.floor(w/2)));
 const y=Math.max(0,Math.min(map.height-h,py-Math.floor(h/2)));
 return {x,y,w,h};
}
function setStatus(message){msg.textContent=message;}
function stage(name,returning=false){
 if(!DATA.scenes[name])return;
 scene=name;sel.value=name;paused=false;
 const m=DATA.scenes[name],found=[];
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++)
  if(glyph[m.rows[y][x]]==="player")found.push([x,y]);
 [px,py]=found[0]||[Math.floor(m.width/2),m.height-3];
 if(returning){px=10;py=15;}
 dir=[0,-1];
 setStatus("Karte: "+name+". "+(name==="Wurzelheim"?"Geh zu einer Haustür und drücke Richtung Tür.":"A oder Enter: Objekte ansehen. Tür unten: zurück ins Dorf."));
 draw();
}
function tileAt(map,x,y){
 return glyph[map.rows[y]?.[x]]||null;
}
function draw(){
 const map=DATA.scenes[scene];
 if(!map||!atlas.complete||!atlas.naturalWidth)return;
 const cam=cameraFor(map);
 const layout=cam.w+"x"+cam.h;
 if(lastLayout!==layout){
  view.width=cam.w*TILE;view.height=cam.h*TILE;lastLayout=layout;
 }
 ctx.imageSmoothingEnabled=false;
 ctx.fillStyle=MANIFEST.palette[0];
 ctx.fillRect(0,0,view.width,view.height);
 for(let y=cam.y;y<cam.y+cam.h;y++)for(let x=cam.x;x<cam.x+cam.w;x++){
  let id=tileAt(map,x,y);
  if(id==="player"||id==="npc")
   id=scene==="Wurzelheim"||scene==="Route"?"floor":"room_floor";
  if(id==="water_a"&&wave%2)id="water_b";
  const idx=MANIFEST.sprites[id]?.atlasIndex;
  if(idx===undefined)continue;
  ctx.drawImage(atlas,(idx%8)*16,Math.floor(idx/8)*16,16,16,
                 (x-cam.x)*16,(y-cam.y)*16,16,16);
 }
 const actor=MANIFEST.sprites.player.atlasIndex;
 ctx.drawImage(atlas,(actor%8)*16,Math.floor(actor/8)*16,16,16,
               (px-cam.x)*16,(py-cam.y)*16,16,16);
 hud.textContent=scene+" · "+(px+1)+"/"+map.width+" × "+(py+1)+"/"+map.height+
                 (paused?" · PAUSE":"");
 lastCamera=cam;
}
function canWalk(m,x,y){
 const id=tileAt(m,x,y);
 return !!id&&!MANIFEST.sprites[id]?.collision;
}
function step(dx,dy){
 if(paused)return;
 dir=[dx,dy];
 const m=DATA.scenes[scene],x=px+dx,y=py+dy;
 if(x<0||y<0||x>=m.width||y>=m.height){
  if(scene==="Wurzelheim"&&(y<0||y>=m.height)){stage("Route");return;}
  if(scene==="Route"&&(y<0||y>=m.height)){stage("Wurzelheim");return;}
  return;
 }
 if(!canWalk(m,x,y))return;
 const id=tileAt(m,x,y);
 if(id==="door"){
  if(scene==="Wurzelheim"){
   const target=x<=6?"Wohnhaus":y<=6?"Laden":"Schmiede";
   stage(target);return;
  }
  stage("Wurzelheim",true);return;
 }
 px=x;py=y;draw();
}
function action(){
 if(paused){paused=false;draw();return;}
 const m=DATA.scenes[scene],target=tileAt(m,px+dir[0],py+dir[1]);
 if(target==="door"){step(...dir);return;}
 const descriptions={sign:"Ein Wegweiser.",npc:"Eine Person grüßt dich.",
  forge:"Eine kleine, heiße Schmiedeesse.",anvil:"Ein Amboss.",
  heal_pod:"Hier kann dein Team geheilt werden.",computer:"Teamverwaltung.",
  counter:"Eine Verkaufstheke.",bookshelf:"Ein Regal voller Gegenstände.",
  bed:"Ein gemütliches Bett.",water_a:"Hier ist Wasser."};
 setStatus(descriptions[target]||"Hier gibt es gerade nichts zu untersuchen.");
}
function pauseToggle(){paused=!paused;setStatus(paused?"Pause. Start/Enter zum Fortsetzen.":"Weiter geht's.");draw();}
function fullscreenToggle(){
 if(document.fullscreenElement){
  if(document.exitFullscreen)document.exitFullscreen();
 }else if(document.documentElement.requestFullscreen){
  document.documentElement.requestFullscreen().catch(()=>setStatus("Dieser Browser bietet hier keinen Vollbildmodus."));
 }else setStatus("Vollbild ist in diesem Browser nicht verfügbar.");
}
const keys={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
 w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
window.addEventListener("keydown",e=>{
 const d=keys[e.key];
 if(d){
  e.preventDefault();
  if(e.repeat)return;
  step(...d);
 }else if(["Enter"," ","z"].includes(e.key)){
  e.preventDefault();if(!e.repeat)action();
 }else if(["Escape","p"].includes(e.key)){
  e.preventDefault();if(!e.repeat)pauseToggle();
 }else if(e.key==="f"&&!e.repeat)fullscreenToggle();
});
let heldTimer=null;
function stopHeld(){if(heldTimer!==null){clearInterval(heldTimer);heldTimer=null;}}
for(const el of document.querySelectorAll("button[data-move]")){
 const d=el.dataset.move.split(",").map(Number);
 el.addEventListener("pointerdown",e=>{
  if(el.setPointerCapture)el.setPointerCapture(e.pointerId);
  e.preventDefault();stopHeld();step(...d);
  heldTimer=setInterval(()=>step(...d),160);
 });
 ["pointerup","pointercancel","lostpointercapture","pointerleave"].forEach(name=>
  el.addEventListener(name,stopHeld));
 // Keyboard activation already moves via the global keyboard listener.
}
window.addEventListener("blur",stopHeld);
document.getElementById("action").addEventListener("click",action);
document.getElementById("fullscreen").addEventListener("click",fullscreenToggle);
document.getElementById("reset").addEventListener("click",()=>stage(scene));
sel.addEventListener("change",()=>stage(sel.value));
mode.addEventListener("change",draw);
window.addEventListener("resize",draw);
window.addEventListener("orientationchange",draw);
function readGamepad(now){
 const pads=typeof navigator.getGamepads==="function"?Array.from(navigator.getGamepads()||[]):[];
 const pad=pads.find(p=>p&&p.connected!==false);
 const connected=!!pad;
 if(connected!==gamepadConnected){
  gamepadConnected=connected;
  document.body.classList.toggle("gamepad",connected);
  padStatus.textContent=connected?"🎮 Controller verbunden · Steuerkreuz/Stick, A: Aktion, B: Zurück, Start: Pause":
   "Handy: Touch · TV: Controller (Steuerkreuz / Stick, A, B, Start) · PC: Pfeiltasten/WASD";
  draw();
 }
 if(!pad)return;
 const pressed=i=>!!pad.buttons?.[i]?.pressed;
 let dx=0,dy=0;
 if(pressed(14))dx=-1;else if(pressed(15))dx=1;
 if(pressed(12))dy=-1;else if(pressed(13))dy=1;
 const axes=pad.axes||[];
 if(!dx&&Math.abs(axes[0]||0)>.5)dx=Math.sign(axes[0]);
 if(!dy&&Math.abs(axes[1]||0)>.5)dy=Math.sign(axes[1]);
 if(dx&&dy){
  if(Math.abs(axes[0]||0)>=Math.abs(axes[1]||0))dy=0;
  else dx=0;
 }
 if((dx||dy)&&now-gamepadLastMove>=165){
  step(dx,dy);gamepadLastMove=now;
 }
 for(const [i,callback] of [[0,action],[1,()=>stage("Wurzelheim",true)],[9,pauseToggle]]){
  const current=pressed(i),was=!!gamepadLastButtons[i];
  if(current&&!was)callback();
  gamepadLastButtons[i]=current;
 }
}
function animate(now){
 if(now-lastFrame>=380){wave++;lastFrame=now;draw();}
 readGamepad(now);
 requestAnimationFrame(animate);
}
atlas.onload=()=>{stage("Wurzelheim");requestAnimationFrame(animate);};
</script></body></html>
"""
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(html.replace("__PAYLOAD__",payload).replace("__MANIFEST__",manifest).replace("__ATLAS__",atlas_data),encoding="utf-8")
print("GB_PLAYABLE_PREVIEW",out,out.stat().st_size)
