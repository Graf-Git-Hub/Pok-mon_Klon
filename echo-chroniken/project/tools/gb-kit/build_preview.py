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
:root{color-scheme:dark}*{box-sizing:border-box}
body{background:#17191b;color:#e6e6de;font-family:system-ui,sans-serif;max-width:860px;margin:0 auto;padding:12px}
h1{font-size:20px;margin:5px 0}.subtitle{font-size:12px;line-height:1.5;color:#acada9;margin-bottom:9px}
.controls{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-bottom:10px}
select,button{border:2px solid #999;background:#303439;color:#f0f0eb;padding:10px 12px;border-radius:7px;font:600 15px system-ui}
#view{display:block;image-rendering:pixelated;image-rendering:crisp-edges;background:#f4f4ef;margin:auto;border:4px solid #42474b;width:min(100%,720px);height:auto;touch-action:none}
.pad{display:grid;grid-template-columns:repeat(3,60px);grid-template-rows:repeat(2,48px);justify-content:center;gap:6px;margin:12px auto}
.pad button{padding:6px;font-size:21px;touch-action:manipulation}
.pad .up{grid-column:2}.pad .left{grid-column:1;grid-row:2}.pad .down{grid-column:2;grid-row:2}.pad .right{grid-column:3;grid-row:2}
footer{font-size:12px;color:#b8bbb6;text-align:center;margin-top:6px}
#message{font-size:13px;min-height:42px;line-height:1.4;color:#d5d6c9;margin-top:8px}
kbd{border:1px solid #737c80;padding:2px 4px;border-radius:4px}
</style></head><body>
<h1>🎮 Echo-Chroniken · Game Boy Klassik</h1>
<div class="subtitle">Stiltest, kein fertiges Hauptspiel · 4 Graustufen · eine feste Grafikbibliothek · 16px-Felder · keine Pokémon-Grafiken.</div>
<div class="controls"><label for="scene">Karte:</label><select id="scene"></select>
<button id="reset">↺ Neu starten</button></div>
<canvas id="view" width="320" height="288" aria-label="Spielkarte"></canvas>
<div id="message">Mit Steuerkreuz oder Pfeiltasten bewegen. Das Tor eines Hauses führt in ein Innenzimmer.</div>
<div class="pad">
<button class="up" data-move="0,-1" aria-label="Hoch">▲</button>
<button class="left" data-move="-1,0" aria-label="Links">◀</button>
<button class="down" data-move="0,1" aria-label="Runter">▼</button>
<button class="right" data-move="1,0" aria-label="Rechts">▶</button>
</div>
<footer>Grafik-Prototyp aus einem einzigen 39-Kachel-Baukasten. Kollisionen entsprechen den echten Felddaten. Keine Spielstände werden verändert.</footer>
<script>
const DATA=__PAYLOAD__;
const MANIFEST=__MANIFEST__;
const ATLAS="data:image/png;base64,__ATLAS__";
const atlas=new Image();atlas.src=ATLAS;
const tileSize=16,view=document.getElementById("view"),ctx=view.getContext("2d");
ctx.imageSmoothingEnabled=false;
const sel=document.getElementById("scene"),msg=document.getElementById("message");
const names=Object.keys(DATA.scenes),glyph=DATA.symbols;
for(const name of names){let op=document.createElement("option");op.value=name;op.textContent=name;sel.appendChild(op)}
let scene="Wurzelheim",px=9,py=12,prev="Wurzelheim",wave=0;
function stage(name,returning=false){
 scene=name;sel.value=name;
 const m=DATA.scenes[name],found=[];
 for(let y=0;y<m.height;y++)for(let x=0;x<m.width;x++)if(glyph[m.rows[y][x]]==="player")found.push([x,y]);
 [px,py]=found[0]||[Math.floor(m.width/2),m.height-3];
 if(returning){px=9;py=12}
 msg.textContent="Karte: "+name+". "+(name==="Wurzelheim"?"Haus betreten: an die Tür laufen.":"Tür unten führt zurück ins Dorf.");
 draw();
}
function draw(){
 const map=DATA.scenes[scene];
 if(!atlas.complete||!atlas.naturalWidth)return;
 view.width=map.width*16;view.height=map.height*16;
 ctx.imageSmoothingEnabled=false;
 const x0=0,y0=0;
 for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++){
  let id=glyph[map.rows[y][x]];
  if(id==="player"||id==="npc")id=scene==="Wurzelheim"||scene==="Route"?"floor":"room_floor";
  if(id==="water_a"&&wave%2===1)id="water_b";
  const idx=MANIFEST.sprites[id].atlasIndex;
  ctx.drawImage(atlas,(idx%8)*16,Math.floor(idx/8)*16,16,16,x*16,y*16,16,16);
 }
 let actor=MANIFEST.sprites.player.atlasIndex;
 ctx.drawImage(atlas,(actor%8)*16,Math.floor(actor/8)*16,16,16,px*16,py*16,16,16);
}
function step(dx,dy){
 const m=DATA.scenes[scene],x=px+dx,y=py+dy;
 if(x<0||y<0||x>=m.width||y>=m.height){
  if(scene==="Wurzelheim"&&(y<0||y>=m.height)){stage("Route");return}
  if(scene==="Route"&&(y<0||y>=m.height)){stage("Wurzelheim");return}
  return;
 }
 const id=glyph[m.rows[y][x]];
 if(MANIFEST.sprites[id]?.collision)return;
 if(id==="door"){
  if(scene==="Wurzelheim"){
   const target=(x<=6)?"Wohnhaus":(y<=6)?"Laden":"Schmiede";
   stage(target);return;
  }
  stage("Wurzelheim",true);return;
 }
 px=x;py=y;draw();
}
window.addEventListener("keydown",e=>{
 let d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]}[e.key];
 if(d){e.preventDefault();step(...d)}
});
document.querySelectorAll("button[data-move]").forEach(el=>el.addEventListener("click",()=>step(...el.dataset.move.split(",").map(Number))));
sel.addEventListener("change",()=>stage(sel.value));
document.getElementById("reset").addEventListener("click",()=>stage(scene));
atlas.onload=()=>stage("Wurzelheim");
setInterval(()=>{wave++;draw()},500);
</script></body></html>
"""
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(html.replace("__PAYLOAD__",payload).replace("__MANIFEST__",manifest).replace("__ATLAS__",atlas_data),encoding="utf-8")
print("GB_PLAYABLE_PREVIEW",out,out.stat().st_size)
