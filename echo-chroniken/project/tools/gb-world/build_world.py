"""Build a walkable GB art adaptation of the 60 existing story maps."""
from pathlib import Path
from compact_layouts import compose
from build_biomes import build as build_biomes
import base64
import hashlib
import json
import re

project = Path(__file__).resolve().parents[2]
docs = project.parent / "docs" / "gb-classic"
source = project / "tools" / "souls-bridge" / "original-maps.json"
build_biomes(project / "assets/gb-classic")
regions = json.loads(source.read_text())["regions"]
symbols = json.loads((project / "assets/gb-classic/scene_maps.json").read_text())["symbols"]
glyph = {value: key for key, value in symbols.items()}
indoor_words = ("floor", "controlroom", "tunnel", "station", "switchyard", "archive",
                "tower", "forge", "library", "research", "cavern", "homes", "mainring",
                "vault", "hall", "telescope", "house", "memory_room", "shaft_level",
                "anchors", "chamber", "core", "reflections", "museum")
titles = [
"Wurzelheim", "Nordufer", "Nebelhafen", "Pumpwerk", "Pumpwerksteuerung",
"Wurzeltunnel", "Bahnhof Wurzelheim", "Weichenhof", "Bahnhof Moorglas",
"Moorglas", "Moorpfad", "Stillwasser", "Stillwasser-Archiv", "Stillwasser-Turm",
"Bahnhof Stillwasser", "Aschenbahn", "Aschenruh", "Glutschmiede", "Glutschlucht",
"Gartenstraße", "Lichterhain", "Namensbibliothek", "Echogarten", "Äußeres Stadttor",
"Kronenstadt", "Zentralarchiv", "Bahnhof Kronenstadt", "Forschungshalle",
"Frostpfad", "Froststation", "Eishöhlen", "Bahnhof Frostgrat", "Unterstadtbahnhof",
"Unterstadthäuser", "Resonanzring", "Kontinuumgewölbe", "Sternengrat",
"Observatorium", "Teleskopraum", "Sternendach", "Marthas Haus", "Erinnerungszimmer",
"Alter Familiengarten", "Schachteingang", "Schacht I", "Schacht II",
"Ankerkammer", "Vaterkammer", "Kernzugang", "Erinnerungsspiegel", "Resonanzkern",
"Wurzelheim – Epilog", "Echogarten-Anbau", "Eisenbahnmuseum",
"Freie Wiese I", "Freie Wiese II", "Freie Wiese III", "Freie Wiese IV",
"Freie Wiese V", "Freie Wiese VI"]
assert len(regions) == len(titles) == 60
scenes = {}
marker_symbols = {"boss": "npc", "npc": "npc", "trainer": "npc", "recording": "sign",
                  "item": "crate", "switch": "computer", "terminal": "computer",
                  "heal": "heal_pod", "stairs": "stairs"}
for (map_id, original), title in zip(regions.items(), titles):
    tiles = original["tiles"]
    width, height = original["w"], original["h"]
    indoor = any(word in map_id for word in indoor_words) and map_id != "shaft_entry"
    if "roof" in map_id:
        indoor = False
    theme = ("ice" if "ice" in map_id or "frost" in map_id else
             "cave" if any(word in map_id for word in ("tunnel", "chasm", "shaft", "core", "vault")) else
             "interior" if indoor else "town" if any(word in map_id for word in ("town", "city", "capital", "wurzel")) else "forest")
    if "roof" in map_id:theme="roof"
    if any(word in map_id for word in ("bog","moor")) and not indoor:theme="marsh"
    rows = []
    for y, row in enumerate(tiles):
        result = []
        for x, tile in enumerate(row):
            names = {0: "room_floor" if indoor else "floor",
                     1: "room_wall" if indoor else "rock" if theme in ("ice", "cave") else "tree",
                     2: "floor_stone" if indoor else "grass",
                     3: "room_floor" if indoor else "path", 4: "water_a",
                     5: "bookshelf" if indoor else "roof_m",
                     6: "sign", 7: "rock", 8: "room_floor" if indoor else "path",
                     9: "room_floor" if indoor else "flower"}
            name = names[tile]
            if tile == 5 and not indoor:
                facade = y + 1 == height or tiles[y + 1][x] != 5
                if facade:
                    name = "window" if x % 3 else "wall"
                elif x == 0 or row[x - 1] != 5:
                    name = "roof_l"
                elif x + 1 == width or row[x + 1] != 5:
                    name = "roof_r"
            result.append(glyph[name])
        rows.append(result)
    for marker in original["markers"]:
        x, y = marker["x"], marker["y"]
        if tiles[y][x] not in (1, 4, 5, 7):
            kind = marker.get("type", "")
            if kind in ("healer", "heal"):
                name = "heal_pod"
            elif any(word in kind.lower() for word in ("boss", "resident", "worker", "guard", "father", "vendor", "master", "martha", "guide")) or kind in ("sera","nalia","edda","piko","lyra","varek","willow","archivist","scientist","courier","citizen0","citizen1"):
                name = "npc"
            elif any(word in kind.lower() for word in ("switch", "dial", "valve", "terminal", "telescope", "power", "rotor")):
                name = "computer"
            else:
                name = marker_symbols.get(kind, "sign")
            rows[y][x] = glyph[name]
    exits = {}
    for link in original["exits"]:
        target = regions[link["toMapId"]]
        spawn = target["spawns"][link["toSpawnId"]]
        exits[f'{link["x"]},{link["y"]}'] = {
            "scene": link["toMapId"], "x": spawn["x"], "y": spawn["y"],
            "exitId": link["exitId"], "requiredFlag": link.get("requiredFlag")}
        rows[link["y"]][link["x"]] = glyph["stairs"]
    start = next(iter(original["spawns"].values()))
    assert tiles[start["y"]][start["x"]] not in (1, 4, 5, 7)
    scenes[map_id] = {
        "title": title, "width": width, "height": height, "indoor": indoor,
        "theme": theme, "rows": ["".join(row) for row in rows], "entry": start,
        "spawns": original["spawns"], "markers": original["markers"], "portals": exits,
        "solids": ["".join("1" if value in (1, 4, 5, 7) else "0" for value in row) for row in tiles]}
scenes=compose(regions,scenes,glyph)
data = {"scenes": scenes, "symbols": symbols}
output = project / "assets/gb-classic/world_maps.json"
output.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
html = (docs / "klassik-demo.html").read_text()
start = html.index("const DATA=")
end = html.index(",MANIFEST=", start)
html = html[:start] + "const DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + html[end:]
html = html.replace('const atlas=new Image();', 'const biome=new Image();\nbiome.src="data:image/png;base64,'+base64.b64encode((project/'assets/gb-classic/world_biomes.png').read_bytes()).decode()+'";\nconst atlas=new Image();')
html = html.replace('[atlas,actors,foreground,houses,edges,rustleSheet]', '[atlas,actors,foreground,houses,edges,rustleSheet,biome]')
html = html.replace("floorIndex=roomFloors.indexOf(scene)", "floorIndex=map.indoor?(scene.includes('house')?0:scene.includes('archive')||scene.includes('library')?1:scene.includes('research')?2:3):-1")
html = html.replace(' function tile(id,x,y){', """ function tile(id,x,y){
  let themed=-1;
  if(map.theme==='cave')themed=id==='rock'||id==='room_wall'?0:['floor','room_floor','path'].includes(id)?1:-1;
  if(map.theme==='ice')themed=id==='rock'||id==='room_wall'?2:['floor','room_floor','path'].includes(id)?3:-1;
  if(id==='roof_m'||id==='roof_l'||id==='roof_r')themed=4;
  if(id==='wall')themed=6;
  if(id==='window')themed=7;
  if(themed>=0){
   ctx.drawImage(biome,themed*16,0,16,16,sx(x),sy(y),16,16);
   return;
  }
""")
html = html.replace("if(id==='room_wall'||(id==='door'&&ground==='room_floor')){",
 "if((id==='room_wall'&&(x===0||y===0||x===map.width-1||y===map.height-1)&&!['cave','ice'].includes(map.theme))||(id==='door'&&ground==='room_floor')){")
html = html.replace("Object.entries(map.doorLinks||{}).map(([key,room])=>{", "Object.entries(map.doorLinks||{}).map(([key,room])=>{")
html = html.replace(" const buildings=Object.entries(map.doorLinks||{}).map(([key,room])=>{", " const buildings=Object.entries(map.doorLinks||{}).map(([key,room])=>{")
html = html.replace(" for(const {left,top,kind} of buildings){", " buildings.push(...(map.buildings||[]));\n for(const {left,top,kind} of buildings){")
html = html.replace('let scene="Wurzelheim"', 'let scene="legacy_wurzeldorf"')
html = html.replace('op.textContent=name;', 'op.textContent=DATA.scenes[name].title;')
html = html.replace('[px,py]=found[0]||[Math.floor(m.width/2),m.height-3];',
                    '[px,py]=m.entry?[m.entry.x,m.entry.y]:found[0]||[Math.floor(m.width/2),m.height-3];')
html = html.replace('scene===\'Wurzelheim\'||scene===\'Route\'?\'floor\':\'room_floor\'',
                    "map.indoor?'room_floor':'floor'")
html = html.replace("['Wurzelheim','Route'].includes(scene)?'path':ground", "false?'path':ground")
# Map labels, contextual markers and portals are read from actual source metadata.
a = html.index(' setStatus("Karte: "+name+')
b = html.index('\n draw();', a)
html = html[:a] + ''' setStatus(m.title+" · "+m.width+" × "+m.height+" Felder · Wege führen über den Kartenrand · A: Hinweis ansehen.");''' + html[b:]
a = html.index('function canWalk(')
b = html.index('\nfunction step(', a)
html = html[:a] + '''function canWalk(m,x,y){
 return x>=0&&y>=0&&x<m.width&&y<m.height&&m.solids[y][x]==='0';
}''' + html[b:]
a = html.index(' if(x<0||y<0||x>=m.width||y>=m.height){',html.index('function step('))
b = html.index(' const from=actorPose();',a)
html = html[:a] + """ if(x<0||y<0||x>=m.width||y>=m.height){
  const exit=m.portals[px+','+py];
  if(exit?.direction?.[0]===dx && exit.direction[1]===dy){
   stage(exit.scene,false,{x:exit.x,y:exit.y},[dx,dy]);
  }
  return;
 }
 if(!canWalk(m,x,y)){draw();return;}
 const id=tileAt(m,x,y),portal=m.portals[x+','+y];
 if(portal&&!portal.direction){stage(portal.scene,false,{x:portal.x,y:portal.y});return;}
""" + html[b:]
html = html.replace('function stage(name,returning=false,entry=null){',
                    'function stage(name,returning=false,entry=null,crossing=null){')
html = html.replace('pendingDirection=null;rustles.clear();stopHeld();',
                    'pendingDirection=null;rustles.clear();if(!crossing)stopHeld();')
html = html.replace(' dir=[0,-1];\n setStatus(m.title', """ dir=crossing||[0,-1];
 if(crossing){
  walkFoot=1-walkFoot;
  motion={x:px-dir[0],y:py-dir[1],start:performance.now(),frame:walkFoot+1};
 }
 setStatus(m.title""")
a = html.index('function cameraFor(')
b = html.index('function setStatus(',a)
html = html[:a] + """function neighbors(map){
 return Object.entries(map.portals).filter(([,exit])=>exit.direction).map(([key,exit])=>{
  const [x,y]=key.split(',').map(Number),[dx,dy]=exit.direction;
  return {map:DATA.scenes[exit.scene],ox:x+dx-exit.x,oy:y+dy-exit.y,x,y,dx,dy};
 });
}
function cameraFor(map,pos=actorPose()){
 const {w,h}=screenTiles();
 let left=0,right=map.width,top=0,bottom=map.height;
 for(const n of neighbors(map)){
  if(n.dx && Math.abs(n.y-pos.y)<h/2+1){
   left=Math.min(left,n.ox);right=Math.max(right,n.ox+n.map.width);
  }
  if(n.dy && Math.abs(n.x-pos.x)<w/2+1){
   top=Math.min(top,n.oy);bottom=Math.max(bottom,n.oy+n.map.height);
  }
 }
 const origin=(min,max,span,focus)=>max-min<span?Math.floor((min+max-span)/2):
  Math.max(min,Math.min(max-span,focus-Math.floor(span/2)));
 return {x:origin(left,right,w,pos.x),y:origin(top,bottom,h,pos.y),w,h};
}
""" + html[b:]
# Draw neighboring maps in the same camera coordinate system.
html = html.replace(' const sx=x=>Math.round(x*16)-Math.round(cam.x*16),sy=y=>Math.round(y*16)-Math.round(cam.y*16);',
""" const screenX=x=>Math.round(x*16)-Math.round(cam.x*16),screenY=y=>Math.round(y*16)-Math.round(cam.y*16);
 const depth=[],grass=[];
 function drawMap(map,ox,oy,current){
 const sx=x=>screenX(x+ox),sy=y=>screenY(y+oy);
 const localX=cam.x-ox,localY=cam.y-oy;""")
html = html.replace('const depth=[],grass=[],floorIndex=', 'const floorIndex=')
html = html.replace('Math.floor(cam.y)','Math.floor(localY)').replace('Math.ceil(cam.y+cam.h)','Math.ceil(localY+cam.h)')
html = html.replace('Math.floor(cam.x)','Math.floor(localX)').replace('Math.ceil(cam.x+cam.w)','Math.ceil(localX+cam.w)')
html = html.replace('y:(top+3)*16','y:(top+oy+3)*16').replace('y:y*16+16','y:(y+oy)*16+16')
html = html.replace('const frame=grassPose(x,y,now);','const frame=current?grassPose(x,y,now):-1;')
html = html.replace('grass.push([x,y,frame]);','grass.push([x+ox,y+oy,frame]);')
html = html.replace(' depth.push({y:pose.y*16+16', """ }
 drawMap(map,0,0,true);
 for(const n of neighbors(map)){
  if(n.ox<cam.x+cam.w && n.oy<cam.y+cam.h && n.ox+n.map.width>cam.x && n.oy+n.map.height>cam.y)
   drawMap(n.map,n.ox,n.oy,false);
 }
 const sx=screenX,sy=screenY;
 depth.push({y:pose.y*16+16""")
a = html.index('function action(){')
b = html.index('\nfunction pauseToggle', a)
html = html[:a] + '''function action(){
 if(paused){pauseToggle();return;}
 const m=DATA.scenes[scene];
 const x=px+dir[0],y=py+dir[1],portal=m.portals[x+','+y];
 if(portal){step(...dir);return;}
 const marker=m.markers.find(p=>Math.abs(p.x-px)+Math.abs(p.y-py)<=1);
 setStatus(marker?m.title+" · "+(marker.label||'Hier liegt eine Spur der Geschichte.'):
  m.title+" · Folge dem Weg über den Kartenrand oder nutze eine Treppe.");
}''' + html[b:]
html = html.replace('hud.textContent=scene+" · "', 'hud.textContent=map.title+" · "')
html = html.replace('["Schmiede","Laden"].includes(scene)', "map.indoor")
html = html.replace("['Schmiede','Laden'].includes(scene)", "map.indoor")
html = html.replace('stage("Wurzelheim")', 'stage("legacy_wurzeldorf")')
html = html.replace('if(scene!=="Wurzelheim"&&scene!=="Route")stage("Wurzelheim",true);',
                    'if(false)stage("legacy_wurzeldorf");')
html = html.replace('B: Zurück funktioniert innerhalb eines Hauses.',
                    'Folge den Wegen und Treppen oder wähle oben ein Gebiet.')
html = html.replace('Grafiktest V12', '60 Karten · GB-Welt V15').replace('Grafik V12', '60 Karten · V15')
html = html.replace('Stiltest, noch nicht das Hauptspiel · 4 Graustufen · feste 16px-Grafikbibliothek · Kamera folgt deiner Figur.',
                    'Erkundungsfassung · 60 bestehende Storykarten im GB-Stil · Außenwege gehen über den Kartenrand weiter · Storybedingungen für die Besichtigung geöffnet.')
html = html.replace('Handy: 10 × 9 Felder · TV: 16 × 9 Felder · Pixel bleiben scharf. Das Bild scrollt mit deiner Spielfigur, Spiellogik und alte Speicherstände werden nicht verändert.',
                    'Erkundung mit Touch, Tastatur und Controller · Alle Gebiete direkt auswählbar · Kämpfe und Quests folgen im Hauptspiel.')
html = html.replace('Karte: vier verschiedene Häuser, zwei Verbindungen zur Route.', '')
(docs / "welt-60-karten.html").write_text(html)
report = {"maps": len(scenes), "portals": sum(len(m["portals"]) for m in scenes.values()),
          "markers": sum(len(m["markers"]) for m in scenes.values()),
          "seam_directions": sum("direction" in p for m in scenes.values() for p in m["portals"].values()),
          "source_sha256": hashlib.sha256(source.read_bytes()).hexdigest()}
(docs / "WORLD_60_REPORT.json").write_text(json.dumps(report, indent=2))
print("GB_WORLD_READY", report)
