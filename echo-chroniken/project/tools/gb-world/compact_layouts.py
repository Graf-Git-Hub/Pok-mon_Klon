"""Compose compact, connected maps from named regions and their existing world graph."""



def compose(source, scenes, glyph):
    layouts = {}
    for index, (key, original) in enumerate(source.items()):
        meta = scenes[key]
        indoor = meta["indoor"]
        width, height = (12, 9) if indoor else (20, 18)
        ground = "room_floor" if indoor else "floor"
        solid = "room_wall" if indoor else "rock" if meta["theme"] in ("cave", "ice") else "tree"
        rows = [[ground for _ in range(width)] for _ in range(height)]
        for y in range(height):
            for x in range(width):
                if x in (0,width-1) or y in (0,height-1):
                    rows[y][x] = solid

        def stamp(name,x,y):
            if 0 <= x < width and 0 <= y < height:
                rows[y][x] = name

        def fill(name,x,y,w,h):
            for yy in range(y,y+h):
                for xx in range(x,x+w):stamp(name,xx,yy)

        buildings = []
        if indoor:
            if meta["theme"] in ("cave","ice"):
                fill("rock",3,2,2,3)
                fill("rock",8,5,2,3)
                fill("water_a",1,6,2,2)
            else:
                fill("bookshelf",1,1,3,1)
                if any(word in key for word in ("forge","shaft","control","research")):
                    stamp("forge",9,1)
                    stamp("workbench",3,3)
                    stamp("anvil",7,5)
                    stamp("crate",9,6)
                elif any(word in key for word in ("house","homes","memory_room")):
                    stamp("bed",2,2)
                    stamp("table",5,3)
                    stamp("chair",6,3)
                    stamp("plant",9,6)
                elif any(word in key for word in ("station","museum","switchyard")):
                    fill("counter",6,2,4,1)
                    stamp("computer",8,1)
                    fill("chair",2,5,2,1)
                else:
                    stamp("table",4,4)
                    stamp("computer",8,2)
                    stamp("plant",9,6)
        elif meta["theme"] == "roof":
            for x in range(1,width-1):rows[0][x]="wall";rows[height-1][x]="wall"
            for y in range(1,height-1):rows[y][0]="wall";rows[y][width-1]="wall"
            fill("floor_stone",1,1,width-2,height-2)
            fill("computer",6,3,2,1)
            fill("floor_stone",7,7,6,3)
            fill("fence",3,12,5,1)
            stamp("computer",14,7)
        elif meta["theme"] == "town":
            for x,y,kind in ((2,2,0),(12,2,1),(2,10,2),(12,10,3)):
                fill("roof_m",x,y,5,2)
                fill("wall",x,y+2,5,1)
                stamp("window",x+1,y+2);stamp("window",x+3,y+2)
                stamp("door",x+2,y+2)
                buildings.append({"left":x,"top":y,"kind":kind})
            fill("path",8,1,4,16)
            fill("path",2,5,15,2)
            fill("path",2,13,15,2)
            fill("floor_stone",7,7,6,3)
            fill("water_a",16,7,2,2)
            fill("flower",2,7,3,1)
            fill("grass",3,15,4,2)
            fill("tree",18,2,1,13)
        else:
            for x,y,w,h in ((1,1,5,3),(14,1,5,3),(1,12,4,5),(15,13,4,4)):
                fill(solid,x,y,w,h)
            fill("path",9,1,2,16)
            fill("path",6,8,9,2)
            if meta["theme"] in ("forest","marsh"):
                fill("grass",3+index%2,5,4,3)
                fill("grass",12,4+index%2,4,3)
                fill("grass",5,11,3,2+index%2)
                fill("grass",12,12,3,3)
                fill("flower",3,9,3,1)
            else:
                fill("rock",4,5,2,3)
                fill("rock",13,11,2,3)
                fill("floor_stone",6,6,3,3)
            fill("water_a",15,9,3,3)
            if meta["theme"]=="marsh":
                fill("water_a",2,7,3,3)
                fill("grass",5,13,3,3)
            if "garden" in key or "grove" in key or "meadow" in key:
                for fx,fy in ((3,4),(6,4),(13,11),(14,12)):
                    stamp("flower",fx,fy)
            stamp("sign",7,9)
        # Every map's exits have a distinct position. Region IDs and graph targets are exact.
        exits = []
        used = set()
        for number, link in enumerate(original["exits"]):
            if indoor:
                candidates = [(width//2,height-1),(width-1,3),(width//2,0),(0,5)]
                x,y=candidates[number % len(candidates)]
            elif buildings and scenes[link["toMapId"]]["indoor"]:
                b = buildings[number % len(buildings)]
                x,y=b["left"]+2,b["top"]+2
            else:
                # Keep the direction of the original gateway as closely as possible.
                ox,oy=link["x"]/(original["w"]-1),link["y"]/(original["h"]-1)
                edge=min(((ox,"west"),(1-ox,"east"),(oy,"north"),(1-oy,"south")))[1]
                x,y={"west":(0,8+number),"east":(width-1,8+number),
                     "north":(9+number,0),"south":(9+number,height-1)}[edge]
            while (x,y) in used:
                if x in (0,width-1):y+=1
                else:x+=1
            assert 0<=x<width and 0<=y<height,(key,x,y)
            used.add((x,y))
            exits.append({**link,"x":x,"y":y,"sourceX":link["x"],"sourceY":link["y"]})
        # Carve routes to all gateways without overwriting building silhouettes.
        blocked = {"tree","rock","water_a","roof_m","wall","window","room_wall",
                   "bookshelf","workbench","forge","crate","bed","table","chair",
                   "plant","computer","counter","anvil"}
        def path_to(x,y):
            # Find the shortest low-cost connection to the center. A door may be carved into walls.
            import heapq
            start=(width//2,height//2)
            queue=[(0,start)]
            costs={start:0};previous={}
            while queue:
                cost,point=heapq.heappop(queue)
                if point==(x,y):break
                if cost!=costs[point]:continue
                for dx,dy in ((0,1),(0,-1),(1,0),(-1,0)):
                    nx,ny=point[0]+dx,point[1]+dy
                    if not(0<=nx<width and 0<=ny<height):continue
                    if (nx in (0,width-1) or ny in (0,height-1)) and (nx,ny)!=(x,y):continue
                    price=1+(50 if rows[ny][nx] in blocked else 0)
                    next_cost=cost+price
                    if next_cost<costs.get((nx,ny),10**9):
                        costs[nx,ny]=next_cost;previous[nx,ny]=point
                        heapq.heappush(queue,(next_cost,(nx,ny)))
            point=(x,y)
            while point!=start:
                xx,yy=point
                if rows[yy][xx] in blocked:rows[yy][xx]=ground if indoor else "path"
                point=previous[point]
            rows[start[1]][start[0]]=ground if indoor else "path"

        for exit in exits:
            path_to(exit["x"],exit["y"])
            stamp("stairs",exit["x"],exit["y"])

        # Place every story landmark on an accessible cell, with a route retained to its neighbours.
        markers=[]
        avoid=set(used)
        positions=[(x,y) for y in range(2,height-2) for x in range(2,width-2)
                   if rows[y][x] not in blocked and (x,y) not in avoid
                   and (x,y)!=(width//2,height//2)]
        positions.sort(key=lambda p:(((p[0]*7+p[1]*11+index*3)%17),p[1],p[0]))
        for original_marker in original["markers"]:
            assert positions,key
            x,y=positions.pop(0)
            markers.append({**original_marker,"sourceX":original_marker["x"],
                            "sourceY":original_marker["y"],"x":x,"y":y})
            path_to(x,y)
            previous_name=scenes[key]["rows"][original_marker["y"]][original_marker["x"]]
            symbol_name=next((name for name,symbol in glyph.items() if symbol==previous_name),"sign")
            if symbol_name not in ("npc","heal_pod","computer","crate","sign"):
                symbol_name="sign"
            stamp(symbol_name,x,y)
        layouts[key]={"rows":rows,"exits":exits,"markers":markers,"buildings":buildings,
                      "width":width,"height":height,"spawns":{},
                      "entry":{"x":width//2,"y":height//2}}

    for key,m in layouts.items():
        original=source[key]
        for name in original["spawns"]:
            reciprocal=next((e for e in m["exits"] if any(
                l["toMapId"]==key and l["toSpawnId"]==name and e["toMapId"]==other
                for other,s in source.items() for l in s["exits"])),None)
            if reciprocal:
                x,y=reciprocal["x"],reciprocal["y"]
                if x==0:x=1
                elif x==m["width"]-1:x-=1
                elif y==0:y=1
                elif y==m["height"]-1:y-=1
                else:y+=1
                if m["rows"][y][x] in ("tree","rock","water_a","roof_m","wall","window",
                                    "room_wall","bookshelf","workbench","forge","crate",
                                    "bed","table","chair","plant","computer","counter","anvil"):
                    x,y=m["entry"]["x"],m["entry"]["y"]
                m["spawns"][name]={"x":x,"y":y}
            else:m["spawns"][name]=dict(m["entry"])
        m["entry"]=next(iter(m["spawns"].values()))
    solid={"tree","rock","water_a","roof_m","wall","window","room_wall",
           "bookshelf","workbench","forge","bed","table","chair","plant","counter","anvil"}
    for key,m in layouts.items():
        data=scenes[key]
        portals={}
        for e in m["exits"]:
            spawn=layouts[e["toMapId"]]["spawns"][e["toSpawnId"]]
            portals[str(e["x"])+","+str(e["y"])]={
                "scene":e["toMapId"],"x":spawn["x"],"y":spawn["y"],"exitId":e["exitId"]}
        data.update({k:m[k] for k in ("width","height","markers","entry","spawns","buildings")})
        data["portals"]=portals
        data["solids"]=["".join("1" if cell in solid else "0" for cell in row) for row in m["rows"]]
        for marker in data["markers"]:
            kind=marker["type"].lower()
            marker["label"]=("Eine Person wartet hier auf dich." if any(t in kind for t in ("healer","boss","guard","father","resident","worker","vendor","guide")) else
                             "Eine Vorrichtung. Im Hauptspiel kannst du sie bedienen." if any(t in kind for t in ("valve","switch","dial","power","telescope","rotor")) else
                             "Eine Nachricht oder Spur für dieses Gebiet.")
        data["rows"]=["".join(glyph[cell] for cell in row) for row in m["rows"]]
    return scenes
