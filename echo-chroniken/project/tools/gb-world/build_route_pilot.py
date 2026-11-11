"""Build the Wurzelheim–Nordufer movement pilot with the V14 art and renderer."""
import json
from pathlib import Path

project = Path(__file__).resolve().parents[2]
docs = project.parent / "docs" / "gb-classic"
village_id, shore_id = "legacy_wurzeldorf", "lake_north_path"
base = json.loads((project / "assets/gb-classic/world_maps.json").read_text())
village = base["scenes"][village_id]
village_rows = [list(row) for row in village["rows"]]

# Keep the V14 houses and square. Lead from the square to a single opening.
for y, edge in ((11, 30), (12, 30), (13, 32), (15, 31)):
    for x in range(edge, village["width"]):
        village_rows[y][x] = "4"
for x in range(23, village["width"]):
    village_rows[14][x] = "1"
for y in range(16, 24):
    for x in range(28, village["width"]):
        village_rows[y][x] = "4"
village_rows[13][26] = "9"
village["entry"] = {"x": 23, "y": 14}
village["markers"] = [{"x": 26, "y": 13, "label": "Nordufer →"}]

# Draw a short grassy crossing and a longer dry path around the same thicket.
width, height = 34, 24
shore_rows = [["4"] * width for _ in range(height)]
for y, left, right in [
    (7, 19, 27), (8, 17, 29), (9, 15, 30), (10, 13, 30), (11, 10, 31),
    (12, 4, 31), (13, 2, 31), (14, 0, 31), (15, 1, 30), (16, 2, 30),
    (17, 3, 29), (18, 3, 28), (19, 5, 25), (20, 9, 21),
]:
    shore_rows[y][left:right+1] = ["0"] * (right-left+1)
for y, left, right in [(7, 21, 26), (8, 19, 28), (9, 18, 28), (10, 20, 27)]:
    shore_rows[y][left:right+1] = ["6"] * (right-left+1)
for y, left, right in [(12, 6, 10), (13, 5, 12), (14, 5, 12), (15, 6, 11)]:
    shore_rows[y][left:right+1] = ["2"] * (right-left+1)
for y, left, right in [(12, 17, 22), (13, 18, 21), (16, 20, 25), (17, 21, 23)]:
    shore_rows[y][left:right+1] = ["2"] * (right-left+1)
for y, left, right in [(14, 0, 4), (14, 13, 20), (18, 4, 14), (13, 23, 26)]:
    shore_rows[y][left:right+1] = ["1"] * (right-left+1)
for y in range(14, 19):
    shore_rows[y][4] = shore_rows[y][14] = "1"
for x,y in [(20, 13), (21, 13), (22, 13), (24, 12), (24, 11)]:
    shore_rows[y][x] = "1"
for x,y in [(8,16), (9,16), (10,16), (16,17), (27,15), (28,15), (29,12), (30,13)]:
    shore_rows[y][x] = "4"
for x,y in [(2,15), (4,13), (13,16), (26,13), (29,14)]:
    shore_rows[y][x] = "B"
shore_rows[13][4] = shore_rows[11][25] = "9"

def set_rows(scene, rows):
    scene["rows"] = ["".join(row) for row in rows]
    scene["solids"] = ["".join("1" if tile in "345678abcdefA" else "0" for tile in row)
                       for row in rows]

set_rows(village, village_rows)
shore = {
    "title": "Nordufer", "width": width, "height": height,
    "indoor": False, "theme": "forest", "entry": {"x": 2, "y": 14},
    "portals": {"0,14": {"scene": village_id, "x": 35, "y": 14, "direction": [-1, 0]}},
    "markers": [
        {"x": 4, "y": 13, "label": "Geradeaus durchs Gras · unten am Gras vorbei"},
        {"x": 25, "y": 11, "label": "Alter Steg · Ende der Teststrecke"},
    ],
}
set_rows(shore, shore_rows)
data = {"scenes": {village_id: village, shore_id: shore}, "symbols": base["symbols"]}

html = (docs / "welt-60-karten.html").read_text()
start = html.index("const DATA=")
end = html.index(",MANIFEST=", start)
html = html[:start] + "const DATA=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + html[end:]
html = html.replace("Game Boy 60 Karten · GB-Welt V14", "Wurzelheim → Nordufer")
html = html.replace("🎮 Echo-Chroniken · Game Boy · 60 Karten · V14", "Echo-Chroniken · Wurzelheim → Nordufer")
start = html.index('<div class="subtitle">')
end = html.index('</div>', start) + len('</div>\n')
html = html[:start] + html[end:]
start = html.index('<label for="mode">')
end = html.index('</select>', start) + len('</select>\n')
html = html[:start] + html[end:]
html = html.replace(',mode=document.getElementById("mode")', '')
html = html.replace('mode.addEventListener("change",draw);\n', '')
start = html.index("function screenTiles()")
end = html.index("function neighbors(", start)
html = html[:start] + "function screenTiles(){return {w:10,h:9};}\n" + html[end:]
html = html.replace('max-width:1160px', 'max-width:540px')
html = html.replace('(orientation:landscape) and (min-width:850px)', '(orientation:landscape) and (min-width:850px) and (pointer:fine)')
html = html.replace('width:100%;height:auto;touch-action:none', 'width:min(100%,480px);height:auto;touch-action:none')
html = html.replace('WALK_MS=150', 'WALK_MS=134')
html = html.replace('step(...d),165', 'step(...d),140').replace('step(...d),160', 'step(...d),140')
html = html.replace('now-gamepadLastMove>=165', 'now-gamepadLastMove>=140')
html = html.replace('const t=motion?Math.max(0,Math.min(1,(now-motion.start)/WALK_MS)):1;', '''
 const elapsed=motion?Math.max(0,now-motion.start):WALK_MS;
 const t=Math.min(8,Math.floor(elapsed*8/WALK_MS))/8;'''.strip())
html = html.replace('frame:t<1?motion.frame:0', 'frame:t>0&&t<1?motion.frame:0')
html = html.replace('return {x:origin(left,right,w,pos.x),y:origin(top,bottom,h,pos.y),w,h};',
                    'return {x:origin(left,right,w,pos.x+0.5),y:origin(top,bottom,h,pos.y),w,h};')
html = html.replace('m.title+" · "+m.width+" × "+m.height+" Felder · Wege führen über den Kartenrand · A: Hinweis ansehen."',
                    'm.title==="Wurzelheim"?"Zum Nordufer führt der Weg rechts aus dem Dorf.":"Am Nordufer führen beide Wege zum alten Steg."')
html = html.replace('hud.textContent=map.title+" · "+(px+1)+"/"+map.width+" × "+(py+1)+"/"+map.height+(paused?" · PAUSE":"");',
                    'if(hud.textContent!==map.title)hud.textContent=map.title;')
html = html.replace('Folge dem Weg über den Kartenrand oder nutze eine Treppe.', 'Mit A oder Enter kannst du Schilder lesen.')
html = html.replace('Folge den Wegen und Treppen oder wähle oben ein Gebiet.', 'Mit dem Steuerkreuz kannst du weiterlaufen.')
html = html.replace('Erkundung mit Touch, Tastatur und Controller · Alle Gebiete direkt auswählbar · Kämpfe und Quests folgen im Hauptspiel.',
                    'Teststrecke für Kamera und Laufgefühl.')
(docs / "echo-chroniken-nordufer-test.html").write_text(html)
