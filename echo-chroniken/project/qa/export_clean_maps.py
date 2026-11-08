"""Export the real Echo-Chroniken map registry directly from the game renderer.

Output: every registered map as clean full-resolution PNG, an XXL labelled overview
and a ZIP of individual 2x PNGs. No players, followers, NPCs, interactive markers
or top/bottom HUD, but tile and authored landscape/architecture stay intact.

This script intercepts game scripts in an isolated headless browser; the actual
game repository and save files are NOT modified.
"""
import base64, functools, http.server, io, json, math, os, pathlib, re
import threading, zipfile
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

PROJECT = pathlib.Path(__file__).resolve().parent.parent
OUT = PROJECT.parent / "docs" / "exportierte-spielkarten"
PARTS = OUT / "einzelkarten"
OUT.mkdir(parents=True, exist_ok=True)
PARTS.mkdir(parents=True, exist_ok=True)

def replace_once(text, old, new, expected=1):
    n = text.count(old)
    if n != expected:
        raise AssertionError("Patch not anchored ("+str(n)+", expected "+str(expected)+"): "+repr(old[:115]))
    return text.replace(old, new, expected)

def patch_game(source):
    source=source.replace('\r\n','\n')
    source=replace_once(source,
        "const camX=Math.max(0,Math.min(px*16-CX,map.width*16-PW));",
        "const camX=window.__mapExportMode?window.__mapCamX:Math.max(0,Math.min(px*16-CX,map.width*16-PW));")
    source=replace_once(source,
        "const camY=Math.max(0,Math.min(py*16-CY,map.height*16-PH));",
        "const camY=window.__mapExportMode?window.__mapCamY:Math.max(0,Math.min(py*16-CY,map.height*16-PH));")
    source=replace_once(source,
        "const camX=px*16-CX, camY=py*16-CY;",
        "const camX=window.__mapExportMode?window.__mapCamX:px*16-CX, camY=window.__mapExportMode?window.__mapCamY:py*16-CY;")
    source=replace_once(source,
        "if(gameState.hasStarter&&gameState.team.length){\n       const companion=getMonsterSprite",
        "if(!window.__mapExportMode){\n      if(gameState.hasStarter&&gameState.team.length){\n        const companion=getMonsterSprite")
    # Close the export-only player block before the foreground renderer.
    # Foreground was added after the original exporter anchor.
    source=replace_once(source,
        "     drawChar16(px*16-camX,py*16-camY,'#e06e59',gameState.player.stepPhase,'player',gameState.player.dir);",
        "     drawChar16(px*16-camX,py*16-camY,'#e06e59',gameState.player.stepPhase,'player',gameState.player.dir);\\n     }")
    source=replace_once(source,
        """    npcs.forEach(n=>{
      if(n.id==='oma')return;""",
        """    if(window.__mapExportMode)return;
    npcs.forEach(n=>{
      if(n.id==='oma')return;""")
    marker="  // --- HAUPTSCHLEIFE (GAME LOOP) ---"
    code="""  window.echoExportCleanMap=(id,cameraX,cameraY)=>{
      const map=window.EchoMaps.get(id);
      if(!map)throw new Error('Unknown REAL map: '+id);
      const prev={mapId:gameState.currentMapId,scene:gameState.scene,
        player:gameState.player,export:window.__mapExportMode};
      window.__mapExportMode=true;
      window.__mapCamX=cameraX;window.__mapCamY=cameraY;
      gameState.currentMapId=id;gameState.scene='OVERWORLD';
      gameState.player={x:-999,y:-999,dir:'down',stepPhase:0};
      try{
        ctx.clearRect(0,0,320,180);
        if(id===window.EchoMaps.LEGACY)renderOverworld(1000);
        else renderRegion(1000);
        return canvas.toDataURL('image/png').split(',')[1];
      }finally{
        gameState.currentMapId=prev.mapId;gameState.scene=prev.scene;
        gameState.player=prev.player;window.__mapExportMode=prev.export;
      }
    };
"""
    source=replace_once(source,marker,code+marker)
    return source

def patch_map_module(source):
    source=source.replace('\r\n','\n')
    lines=source.splitlines(keepends=True)
    count_markers=0
    count_huds=0
    for i,line in enumerate(lines):
        if re.search(r'for\s*\(\s*const\s+\w+\s+of\s+(?:points|markers\[id\](?:\|\|\[\])?)\s*\)\s*\{',line):
            lines[i]=re.sub(r'\bfor\s*\(', 'if(!window.__mapExportMode) for(',line,count=1)
            count_markers+=1
        # Module UI captions are two self-contained pix()+letter() calls.
        if 'letter(' in line and re.search(r'^\s*pix\(\d+,\d+,',line):
            lines[i]=line[:len(line)-len(line.lstrip())] + "if(!window.__mapExportMode){"+line.strip()+"}\n"
            count_huds+=1
    # Every game region should have at least a HUD + marker suppression.
    if count_markers==0 or count_huds<1:
        raise AssertionError(f"Incomplete NPC/HUD removal: markers={count_markers} HUD={count_huds}")
    return ''.join(lines)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
server=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(QuietHandler,directory=str(PROJECT)))
threading.Thread(target=server.serve_forever,daemon=True).start()

def get_font(size,bold=False):
    fonts=[
      "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
      "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
      "C:/Windows/Fonts/consola.ttf"
    ]
    for f in fonts:
        if pathlib.Path(f).exists():return ImageFont.truetype(f,size)
    return ImageFont.load_default()

def nice_label(id):
    special={"legacy_wurzeldorf":"Wurzelheim · Startgebiet"}
    return special.get(id,id.replace("_"," ").title())

manifest={"kind":"Echte aus Echo-Chroniken gerenderte Weltkarten, ohne Spielfiguren/NPC/HUD",
          "git_sha":os.environ.get("MAP_SOURCE_SHA","unknown"),
          "tile_size":16,"map_count":0,"maps":[]}
pictures=[]
errors=[]
try:
 with sync_playwright() as pw:
    browser=pw.chromium.launch(channel="chrome",headless=True)
    context=browser.new_context(viewport={"width":900,"height":720},device_scale_factor=1)
    page=context.new_page()
    page.on("pageerror",lambda error:errors.append(str(error)))
    def intercept_game(route):
        original=(PROJECT/'src/game.js').read_text(encoding='utf-8')
        route.fulfill(body=patch_game(original),content_type="application/javascript; charset=utf-8")
    def intercept_region(route):
        name=route.request.url.split('/src/maps/',1)[1].split('?',1)[0]
        original=(PROJECT/'src/maps'/name).read_text(encoding='utf-8')
        route.fulfill(body=patch_map_module(original),content_type="application/javascript; charset=utf-8")
    page.route("**/src/game.js",intercept_game)
    page.route("**/src/maps/chapter3.js",intercept_region)
    page.route("**/src/maps/chapter4.js",intercept_region)
    page.route("**/src/maps/chapter5.js",intercept_region)
    page.route("**/src/maps/story-regions.js",intercept_region)
    page.route("**/src/maps/story-endgame.js",intercept_region)
    page.route("**/src/maps/story-finale.js",intercept_region)
    page.route("**/src/maps/postgame.js",intercept_region)
    page.goto(f"http://127.0.0.1:{server.server_port}/",wait_until="load")
    page.wait_for_function("typeof window.echoExportCleanMap === 'function'")
    maps=page.evaluate("""() => window.EchoMaps.list().map(id=>{
      const m=window.EchoMaps.get(id);
      const named=[window.EchoChapter3,window.EchoChapter4,window.EchoChapter5,
                   window.EchoStoryRegions,window.EchoEndgame,window.EchoFinale,
                   window.EchoPostgame].find(x=>x&&x.names&&x.names[id]);
      return {id,width:m.width,height:m.height,displayName:named?.names[id]||id};
    })""")
    if len(maps)<60:raise AssertionError("Only "+str(len(maps))+" real maps registered")
    limit=int(os.environ.get("EXPORT_MAP_LIMIT","0"))
    if limit:maps=maps[:limit]
    print("REAL_MAP_REGISTRY",len(maps),"largest",max(x["width"] for x in maps),
          max(x["height"] for x in maps),flush=True)
    for i,m in enumerate(maps):
        width,height=m["width"]*16,m["height"]*16
        im=Image.new("RGB",(width,height),"#284d52")
        frames=0
        for sy in range(0,height,180):
            for sx in range(0,width,320):
                encoded=page.evaluate("args=>window.echoExportCleanMap(args.id,args.x,args.y)",
                                      {"id":m["id"],"x":sx,"y":sy})
                image=Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
                im.paste(image.crop((0,0,min(320,width-sx),min(180,height-sy))),(sx,sy))
                frames+=1
        scaled=im.resize((width*2,height*2),Image.Resampling.NEAREST)
        file_name=f"{i+1:02d}_{m['id']}.png"
        scaled.save(PARTS/file_name,optimize=True)
        pictures.append((m,im))
        manifest["maps"].append({**m,"filename":"einzelkarten/"+file_name,
                                  "nativePixels":[width,height],"exportPixels":[width*2,height*2],
                                  "viewportFrames":frames})
        if (i+1)%10==0 or i+1==len(maps):
            print("REAL_MAP_EXPORT_PROGRESS",i+1,"/",len(maps),flush=True)
    if errors:raise RuntimeError("Browser errors: "+str(errors[:7]))
    browser.close()
finally:
    server.shutdown()

manifest["map_count"]=len(pictures)
# Very large contact sheet, with each original map at proportional scale and clear chapter-style index.
COLS=4
CELL_W=660
CELL_H=570
MARGIN=32
HEADER=108
ROWS=math.ceil(len(pictures)/COLS)
sheet=Image.new("RGB",(MARGIN*2+COLS*CELL_W,HEADER+MARGIN+ROWS*CELL_H),"#101a22")
d=ImageDraw.Draw(sheet)
d.text((MARGIN,22),"ECHO-CHRONIKEN  |  ALLE ORIGINAL-SPIELKARTEN",fill="#f5e8c7",font=get_font(34,True))
d.text((MARGIN,69),f"{len(pictures)} echte Karten   ·   Original-Gelaende & Gebaeude   ·   ohne Spieler, NPCs & HUD",
       fill="#90c8ba",font=get_font(20))
for n,(m,im) in enumerate(pictures):
    cx=n%COLS;cy=n//COLS
    x=MARGIN+cx*CELL_W;y=HEADER+cy*CELL_H
    d.rounded_rectangle((x+5,y+6,x+CELL_W-13,y+CELL_H-7),radius=11,
                        fill="#1b2d36",outline="#42646b",width=2)
    d.text((x+21,y+18),f"{n+1:02d}  {nice_label(m['id'])[:29]}",
           font=get_font(22,True),fill="#f4e7c8")
    d.text((x+21,y+52),f"{m['width']} × {m['height']} Felder  ·  ID: {m['id'][:37]}",
           font=get_font(14),fill="#9ec6bc")
    areaW=CELL_W-42;areaH=CELL_H-111
    factor=min(areaW/im.width,areaH/im.height)
    factor=min(3,factor)
    target=(max(1,int(im.width*factor)),max(1,int(im.height*factor)))
    pic=im.resize(target,Image.Resampling.NEAREST)
    ix=x+int((CELL_W-target[0])/2)-4
    iy=y+80+int((areaH-target[1])/2)
    d.rectangle((ix-3,iy-3,ix+target[0]+3,iy+target[1]+3),fill="#29434b")
    sheet.paste(pic,(ix,iy))
overview=OUT/"Echo-Chroniken_ALLE_MAPS_GROSSES_BILD.png"
sheet.save(overview,optimize=True)
manifest["overview_filename"]=overview.name
manifest["overview_pixels"]=list(sheet.size)
json_path=OUT/"map-verzeichnis.json"
json_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
zip_path=OUT/"Echo-Chroniken_ALLE_MAPS_EINZELN.zip"
with zipfile.ZipFile(zip_path,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=8) as z:
    for png in sorted(PARTS.glob("*.png")):z.write(png,arcname="einzelkarten/"+png.name)
    z.write(json_path,arcname=json_path.name)
print("REAL_MAPS_COMPLETE",json.dumps({
 "count":len(pictures),"overview":str(overview),"size":sheet.size,
 "zip":str(zip_path),"zip_bytes":zip_path.stat().st_size,
 "overview_bytes":overview.stat().st_size,
 "errors":errors
},ensure_ascii=False),flush=True)
