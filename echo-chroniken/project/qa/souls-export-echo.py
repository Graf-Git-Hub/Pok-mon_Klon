"""Export the *actual* 60 Echo-Chroniken maps as an editable SOULS V7/8 project.
Includes an independent original-map manifest used for collision-safe reimport.
Does not edit SOULS user projects or existing Echo saves.
"""
import pathlib,functools,http.server,threading,json,copy,os
from playwright.sync_api import sync_playwright
P=pathlib.Path(__file__).resolve().parent.parent
OUT=P.parent/"docs"/"souls-editor"
OUT.mkdir(parents=True,exist_ok=True)
TOOLS=P/"tools"/"souls-bridge"
TOOLS.mkdir(parents=True,exist_ok=True)
TILE_GROUND={0:"grass",1:"grass",2:"tallgrass",3:"path",4:"water",5:"grass",6:"stone",
             7:"stone",8:"dirt",9:"grass2"}
TILE_OBJECTS={1:"tree",5:"bh_home_wall_braun",6:"sign",7:"caveentry"}
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Handler,directory=str(P)))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True)
  page=browser.new_page()
  # Critical: do not treat a previously imported pilot as the ORIGINAL map.
  # Keep the authoritative unmodified source immutable across any re-exports.
  page.route('**/data/echo-souls-edits.js',lambda route:route.fulfill(
    body="window.EchoSoulsEditedData={schema:1,format:'ECHO_SOULS_DIFF_V1',regions:{}};",
    content_type='application/javascript'))
  errors=[]
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.goto("http://127.0.0.1:%d/"%server.server_port,wait_until="load")
  page.wait_for_function("window.EchoMaps?.list().length===60")
  src=page.evaluate("""() => window.EchoMaps.list().map(id=>{
   const m=window.EchoMaps.get(id);
   const modules=[window.EchoChapter3,window.EchoChapter4,window.EchoChapter5,
    window.EchoStoryRegions,window.EchoEndgame,window.EchoFinale,window.EchoPostgame];
   return {id,w:m.width,h:m.height,tiles:m.tiles.map(row=>row.slice()),spawns:m.spawns,
    exits:m.exits,markers:modules.flatMap(x=>x?.markers?.[id]||[]),
    homes:id==='legacy_wurzeldorf'?[{x:3,y:2},...(window.EchoVillage?.homes||[])]:[]};
  })""")
  assert not errors,errors
  browser.close()
finally:server.shutdown()
assert len(src)==60
maps={};base={}
for x in src:
 w,h=x["w"],x["h"];tid=x["id"]
 tiles=x["tiles"]
 assert h==len(tiles) and all(len(row)==w for row in tiles),(tid,w,h)
 ground=[[TILE_GROUND.get(n,"grass") for n in row] for row in tiles]
 objects=[{"id":TILE_OBJECTS[n],"x":px,"y":py} for py,row in enumerate(tiles)
          for px,n in enumerate(row) if n in TILE_OBJECTS]
 rules=[[None for _ in range(w)] for _ in range(h)]
 exits=[]
 for e in x["exits"]:
  target=next((v for v in src if v["id"]==e["toMapId"]),None)
  spawn=target["spawns"].get(e["toSpawnId"]) if target else None
  if not spawn:raise AssertionError("Bad portal "+tid+":"+e["exitId"])
  exits.append({"kind":"built","x":e["x"],"y":e["y"],
     "toMapId":e["toMapId"],"toX":spawn["x"],"toY":spawn["y"],
     "worldRoute":e["exitId"],"echoExitId":e["exitId"],
     "echoReturnExitId":e["returnExitId"],
     **({"requires":e["requiredFlag"]} if e.get("requiredFlag") else {})})
 name=tid.replace("_"," ").title()
 if tid=="legacy_wurzeldorf":name="Wurzelheim · Echo-Chroniken"
 maps[tid]={"name":name,"w":w,"h":h,"ground":ground,"objects":objects,
            "bridges":[],"cellRules":rules,"doorLinks":exits}
 protected=set()
 def protect(x0,y0,r=0):
  for y in range(y0-r,y0+r+1):
   for x2 in range(x0-r,x0+r+1):
    if 0<=x2<w and 0<=y<h:protected.add((x2,y))
 for y in range(h):
  for x2 in range(w):
   if x2==0 or y==0 or x2==w-1 or y==h-1 or tiles[y][x2] in [5,6,7]:
    protect(x2,y)
 for e in x["exits"]:protect(e["x"],e["y"],1)
 for p in x["spawns"].values():protect(p["x"],p["y"],1)
 for m in x["markers"]:protect(m["x"],m["y"],1)
 # These original wild-meadow tiles are explicitly required by the natural
 # story QA. Artwork edits may not turn them into a harmless garden path.
 if tid=="legacy_wurzeldorf":
  protect(13,23);protect(14,23)
 for home in x["homes"]:
  for yy in range(home["y"]-1,home["y"]+5):
   for xx in range(home["x"]-1,home["x"]+6):
    protect(xx,yy)
 base[tid]={"w":w,"h":h,"tiles":tiles,"protected":[[a,b] for a,b in sorted(protected)],
            "ground":ground,"objects":objects,"exits":x["exits"],"spawns":x["spawns"],
            "markers":[{"x":p["x"],"y":p["y"],"type":p.get("type")} for p in x["markers"]]}
# Shared project semantics used by the actual 3.46 SOULS editor.
start="legacy_wurzeldorf"
project={"format":"SOULS_PROJECT_V7","version":8,"activeMapId":start,
         "maps":maps,"mapParents":{k:None for k in maps},"userTemplates":{},
         "passRules":{},"requiredAbilities":{},"showBlocks":False,"graphicRevisions":{},
         "worldData":{"start":start,"towns":[],"routes":[],"regions":[]},
         "worldUnlocks":{}}
project.update({"name":maps[start]["name"],"w":maps[start]["w"],"h":maps[start]["h"],
  "ground":maps[start]["ground"],"objects":maps[start]["objects"],
  "bridges":[],"cellRules":maps[start]["cellRules"],"doorLinks":maps[start]["doorLinks"]})
(TOOLS/"original-maps.json").write_text(json.dumps({"schema":1,"regions":base},separators=(",",":"))+"\n",encoding="utf8")
(OUT/"EchoChroniken_SOULS_Alle_60_Maps.json").write_text(json.dumps(project,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
print("SOULS_ECHO_EXPORT_PASS maps",len(maps),"world",len(str(project)),"objects",sum(len(m["objects"]) for m in maps.values()))
