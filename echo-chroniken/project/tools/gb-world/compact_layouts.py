"""Compose connected maps from named regions and their existing world graph."""



def compose(source, scenes, glyph):
    layouts = {}
    directions = ((1, 0), (-1, 0), (0, -1), (0, 1))
    seams = {key: {} for key in source}
    for key, region in source.items():
        if scenes[key]["indoor"] or scenes[key]["theme"] == "roof":
            continue
        for link in region["exits"]:
            target = link["toMapId"]
            if scenes[target]["indoor"] or scenes[target]["theme"] == "roof" or target in seams[key]:
                continue
            reverse = next((exit for exit in source[target]["exits"] if exit["toMapId"] == key), None)
            if reverse is None:
                continue
            horizontal = 2 * link["x"] / (region["w"] - 1) - 1
            vertical = 2 * link["y"] / (region["h"] - 1) - 1
            for dx, dy in sorted(directions, key=lambda d: -(horizontal * d[0] + vertical * d[1])):
                opposite = (-dx, -dy)
                if (dx, dy) not in seams[key].values() and opposite not in seams[target].values():
                    seams[key][target] = (dx, dy)
                    seams[target][key] = opposite
                    break
    for index, (key, original) in enumerate(source.items()):
        meta = scenes[key]
        indoor = meta["indoor"]
        width, height = (12, 9) if indoor else (original["w"], original["h"])
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
        if not indoor:
            # Space out the original composition while keeping buildings at sprite size.
            def position(x,y):
                return round(x*(width-1)/19), round(y*(height-1)/17)

            def place(name,x,y):
                stamp(name,*position(x,y))

            def area(name,x,y,w,h):
                left,top=position(x,y)
                right,bottom=position(x+w-1,y+h-1)
                fill(name,left,top,right-left+1,bottom-top+1)
        authored = key in ("legacy_wurzeldorf", "lake_north_path")
        if authored:
            # Vary the edges of woodland and water while keeping the tile grid.
            def patch(name, cx, cy, rx, ry, trim=0):
                for y in range(max(1,cy-ry),min(height-1,cy+ry+1)):
                    for x in range(max(1,cx-rx),min(width-1,cx+rx+1)):
                        distance = ((x-cx)/rx)**2 + ((y-cy)/ry)**2
                        if distance <= 1 - ((x*3+y*5)%7)*trim:
                            stamp(name,x,y)

            def trail(points):
                for (x,y),(end_x,end_y) in zip(points,points[1:]):
                    left,right=sorted((x,end_x))
                    top,bottom=sorted((y,end_y))
                    if x==end_x:
                        fill("path",x,top,2,bottom-top+1)
                    else:
                        assert y==end_y
                        fill("path",left,y,right-left+1,2)

            if key=="legacy_wurzeldorf":
                for x,y,rx,ry in ((3,5,5,5),(16,2,6,3),(31,5,6,5),(4,22,5,6),
                                  (24,25,6,4),(34,22,4,6),(7,12,3,2)):
                    patch("tree",x,y,rx,ry,.025)
                patch("water_a",8,16,6,5,.015)
                patch("grass",26,20,5,3,.025)
                patch("grass",18,25,4,2,.02)
                patch("flower",10,8,3,2,.045)
                patch("flower",26,10,3,2,.05)
                trail(((16,14),(22,14),(22,12),(30,12),(30,14),(35,14)))
                trail(((16,14),(12,14),(12,9),(9,9)))
                trail(((21,14),(21,20),(16,20),(16,23)))
                trail(((20,14),(20,8),(24,8)))
                patch("floor_stone",18,14,4,3)
                house_sites=((9,6,0),(22,5,1),(12,20,2),(27,17,3))
                trail(((29,20),(29,16),(30,16),(30,14)))
            else:
                for x,y,rx,ry in ((4,6,8,6),(13,3,6,4),(22,24,7,5),
                                  (6,24,8,5),(45,5,5,6),(46,25,7,6)):
                    patch("tree",x,y,rx,ry,.025)
                patch("water_a",28,5,13,8,.015)
                patch("grass",11,18,7,4,.03)
                patch("grass",31,21,8,4,.025)
                patch("grass",38,13,5,3,.04)
                patch("flower",13,7,4,2,.05)
                patch("bush",24,17,4,2,.06)
                trail(((0,14),(6,14),(6,11),(14,11),(14,14),(27,14),
                       (27,16),(37,16),(37,14),(47,14)))
                trail(((14,14),(14,18),(16,18)))
                trail(((32,16),(32,21),(35,21)))
                house_sites=()
            # The route openings are one tile wide at each map boundary.
            stamp(solid,0,15)
            stamp(solid,width-1,15)
            for x,y,kind in house_sites:
                fill("roof_m",x,y,5,2)
                fill("wall",x,y+2,5,1)
                stamp("window",x+1,y+2)
                stamp("window",x+3,y+2)
                stamp("door",x+2,y+2)
                buildings.append({"left":x,"top":y,"kind":kind})
        elif indoor:
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
            area("computer",6,3,2,1)
            area("floor_stone",7,7,6,3)
            area("fence",3,12,5,1)
            place("computer",14,7)
        elif meta["theme"] == "town":
            for x,y,kind in ((2,2,0),(12,2,1),(2,10,2),(12,10,3)):
                x,y=position(x,y)
                fill("roof_m",x,y,5,2)
                fill("wall",x,y+2,5,1)
                stamp("window",x+1,y+2);stamp("window",x+3,y+2)
                stamp("door",x+2,y+2)
                buildings.append({"left":x,"top":y,"kind":kind})
            area("path",8,1,4,16)
            area("path",2,5,15,2)
            area("path",2,13,15,2)
            area("floor_stone",7,7,6,3)
            area("water_a",16,7,2,2)
            area("flower",2,7,3,1)
            area("grass",3,15,4,2)
            area("tree",18,2,1,13)
        else:
            for x,y,w,h in ((1,1,5,3),(14,1,5,3),(1,12,4,5),(15,13,4,4)):
                area(solid,x,y,w,h)
            area("path",9,1,2,16)
            area("path",6,8,9,2)
            if meta["theme"] in ("forest","marsh"):
                area("grass",3+index%2,5,4,3)
                area("grass",12,4+index%2,4,3)
                area("grass",5,11,3,2+index%2)
                area("grass",12,12,3,3)
                area("flower",3,9,3,1)
            else:
                area("rock",4,5,2,3)
                area("rock",13,11,2,3)
                area("floor_stone",6,6,3,3)
            area("water_a",15,9,3,3)
            if meta["theme"]=="marsh":
                area("water_a",2,7,3,3)
                area("grass",5,13,3,3)
            if "garden" in key or "grove" in key or "meadow" in key:
                for fx,fy in ((3,4),(6,4),(13,11),(14,12)):
                    place("flower",fx,fy)
            place("sign",7,9)
        # Every map's exits have a distinct position. Region IDs and graph targets are exact.
        exits = []
        used = set()
        edge_paths = {}
        for target, (dx,dy) in seams[key].items():
            x = (width-1 if dx>0 else 0) if dx else width//2
            y = (height-1 if dy>0 else 0) if dy else height//2
            edge_paths[target] = (x,y)
        reserved = set(edge_paths.values())
        for number, link in enumerate(original["exits"]):
            direction = seams[key].get(link["toMapId"])
            if direction:
                x,y=edge_paths[link["toMapId"]]
            elif indoor:
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
            while (x,y) in used or (not direction and (x,y) in reserved):
                if x in (0,width-1):y+=1
                else:x+=1
            assert 0<=x<width and 0<=y<height,(key,x,y)
            used.add((x,y))
            exits.append({**link,"x":x,"y":y,"sourceX":link["x"],"sourceY":link["y"],"direction":direction})
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
                if rows[yy][xx] in blocked or (
                    rows[yy][xx] == ground and (x,y) in reserved
                ):
                    rows[yy][xx]=ground if indoor else "path"
                point=previous[point]
            rows[start[1]][start[0]]=ground if indoor else "path"

        for exit in exits:
            if not authored or not exit["direction"]:
                path_to(exit["x"],exit["y"])
            stamp("path" if exit["direction"] else "stairs",exit["x"],exit["y"])

        # Place every story landmark on an accessible cell, with a route retained to its neighbours.
        markers=[]
        avoid=set(used)
        positions=[(x,y) for y in range(2,height-2) for x in range(2,width-2)
                   if rows[y][x] not in blocked and (x,y) not in avoid
                   and (x,y)!=(width//2,height//2)
                   and (not authored or rows[y][x] not in ("path","floor_stone"))]
        positions.sort(key=lambda p:(((p[0]*7+p[1]*11+index*3)%17),p[1],p[0]))
        for original_marker in original["markers"]:
            assert positions,key
            x,y=positions.pop(0)
            markers.append({**original_marker,"sourceX":original_marker["x"],
                            "sourceY":original_marker["y"],"x":x,"y":y})
            if not authored:
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
    for key,m in layouts.items():
        for e in m["exits"]:
            if e["direction"]:
                target=layouts[e["toMapId"]]
                reverse=next(link for link in target["exits"] if link["toMapId"]==key)
                target["spawns"][e["toSpawnId"]]={"x":reverse["x"],"y":reverse["y"]}

    solid={"tree","rock","water_a","roof_m","wall","window","room_wall",
           "bookshelf","workbench","forge","bed","table","chair","plant","counter","anvil"}
    for key,m in layouts.items():
        data=scenes[key]
        portals={}
        for e in m["exits"]:
            target=layouts[e["toMapId"]]
            spawn=target["spawns"][e["toSpawnId"]]
            portals[str(e["x"])+","+str(e["y"])]={
                "scene":e["toMapId"],"x":spawn["x"],"y":spawn["y"],"exitId":e["exitId"]}
            if e["direction"]:
                portals[f'{e["x"]},{e["y"]}']["direction"]=e["direction"]
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
