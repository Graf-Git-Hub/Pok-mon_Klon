/* Render V14 art over the campaign registry. Registry coordinates remain
   authoritative for events, collision, transitions and existing saves. */
(() => {
  'use strict';
  const {maps, symbols, sprites, images} = window.EchoGBCampaignArt;
  const [atlas, actors, rustle, interiors, biomes] = [
    'gb_classic_atlas', 'actors', 'grass_rustle', 'interior_edges', 'world_biomes',
  ].map(key => {
    const image = new Image();
    image.src = images[key];
    return image;
  });
  const ready = image => image.complete && image.naturalWidth > 0;
  const stamp = (ctx, image, ix, iy, sx, sy) =>
    ctx.drawImage(image, ix * 16, iy * 16, 16, 16, sx, sy, 16, 16);
  const directionRow = {down:0, up:1, left:2, right:3};
  let lastStep = null;
  let recentGrass = [];

  const shades = {
    paper:'#f4f4ef', pale:'#c7c8c4', shade:'#777a7b', ink:'#24262b',
  };
  function fill(ctx,x,y,w,h,color) {
    ctx.fillStyle=color;
    ctx.fillRect(x,y,w,h);
  }
  const borders = [
    [-1,0,0,0,2,16], [1,0,14,0,2,16], [0,-1,0,0,16,2], [0,1,0,14,16,2],
  ];

  function drawShore(ctx,map,x,y,sx,sy,tick) {
    fill(ctx,sx,sy,16,16,shades.shade);
    const wave=(Math.floor(tick/260)+x+y)%4;
    fill(ctx,sx+2+wave,sy+4,5,1,shades.pale);
    fill(ctx,sx+8-wave,sy+11,5,1,shades.pale);
    for(const [dx,dy,ox,oy,w,h] of borders){
      if(map.tiles[y+dy]?.[x+dx]===4)continue;
      fill(ctx,sx+ox,sy+oy,w,h,shades.pale);
      const lx=ox===0&&dx<0?0:ox===14?15:ox;
      const ly=oy===0&&dy<0?0:oy===14?15:oy;
      fill(ctx,sx+lx,sy+ly,dx?1:w,dy?1:h,shades.paper);
    }
  }

  function drawGrove(ctx,map,x,y,sx,sy) {
    const variant=(x*7+y*11)%5;
    const north=map.tiles[y-1]?.[x]===1;
    const south=map.tiles[y+1]?.[x]===1;
    fill(ctx,sx,sy,16,16,shades.pale);
    if(north)fill(ctx,sx+1,sy,14,4,shades.shade);
    if(!south){
      fill(ctx,sx+2,sy+14,12,1,shades.shade);
      fill(ctx,sx+7,sy+10,3,5,shades.ink);
    }
    fill(ctx,sx+5,sy+1,7,12,shades.ink);
    fill(ctx,sx+2,sy+4,13,7,shades.ink);
    fill(ctx,sx+3,sy+4,10,4,shades.shade);
    fill(ctx,sx+6,sy+2,5,3,shades.shade);
    fill(ctx,sx+4+variant,sy+5,3,1,shades.pale);
    fill(ctx,sx+4,sy+10,9,2,shades.ink);
  }

  function drawPath(ctx,map,x,y,sx,sy) {
    fill(ctx,sx,sy,16,16,shades.paper);
    for(const [dx,dy,ox,oy,w,h] of borders){
      const other=map.tiles[y+dy]?.[x+dx];
      if(other===3||other===8||other===4)continue;
      fill(ctx,sx+ox,sy+oy,w,h,shades.pale);
    }
    const seed=(x*11+y*7)%9;
    fill(ctx,sx+3+seed,sy+5,2,1,shades.pale);
    fill(ctx,sx+11-seed,sy+11,2,1,shades.pale);
  }

  function drawTile(ctx, map, x, y, sx, sy, tick) {
    const art = maps[map.mapId];
    if (!art || !ready(atlas)) return false;
    const terrain = map.tiles[y][x];
    const row = art.rows[Math.floor(y * art.rows.length / map.height)];
    const suggested = symbols[row[Math.floor(x * row.length / map.width)]];
    const ice = art.theme === 'ice';
    const cave = art.theme === 'cave';
    let tile;
    switch (terrain) {
      case 0:
        // Keep visual hints walkable: only use ground decorations here.
        tile = art.indoor ? 'room_floor' : suggested === 'flower' ? 'flower' : 'floor';
        break;
      case 1:
        tile = art.indoor ? 'room_wall' : 'tree';
        if ((ice || cave) && ready(biomes)) {
          stamp(ctx, biomes, ice ? 2 : 0, 0, sx, sy);
          return true;
        }
        if(!art.indoor){
          drawGrove(ctx,map,x,y,sx,sy);
          return true;
        }
        break;
      case 2: tile = 'grass'; break;
      case 3:
        if(!art.indoor && suggested!=='floor_stone'){
          drawPath(ctx,map,x,y,sx,sy);
          return true;
        }
        tile = art.indoor ? 'room_floor' : 'floor_stone';
        break;
      case 4:
        drawShore(ctx,map,x,y,sx,sy,tick);
        return true;
      case 5:
        if (art.indoor) {
          tile = 'bookshelf';
        } else {
          const left = map.tiles[y]?.[x-1] !== 5;
          const right = map.tiles[y]?.[x+1] !== 5;
          tile = map.tiles[y+1]?.[x] !== 5 ? (left || right ? 'wall' : 'window') :
            left ? 'roof_l' : right ? 'roof_r' : 'roof_m';
        }
        break;
      case 6: tile = 'heal_pod'; break;
      case 7: tile = 'rock'; break;
      case 8: tile = art.indoor ? 'room_floor' : 'path'; break;
      case 9: tile = art.indoor ? 'room_floor' : 'flower'; break;
      default: return false;
    }
    if (tile === 'room_floor' && ready(interiors)) {
      const room = /house|homes|memory_room/.test(map.mapId) ? 0 :
        /archive|library/.test(map.mapId) ? 1 : /research|control/.test(map.mapId) ? 2 : 3;
      stamp(ctx, interiors, 9+room, 0, sx, sy);
    } else {
      const index = sprites[tile];
      stamp(ctx, atlas, index%8, Math.floor(index/8), sx, sy);
    }
    return true;
  }

  function onStep(mapId, x, y, grass, tick) {
    lastStep = {mapId, x, y, tick};
    recentGrass = recentGrass.filter(step =>
      step.mapId === mapId && tick-step.tick < 320 && (step.x !== x || step.y !== y));
    if (grass) recentGrass.push(lastStep);
  }
  function drawPlayer(ctx, sx, sy, dir, phase, tick) {
    if (!ready(actors)) return false;
    const walking = lastStep && tick-lastStep.tick < 150;
    fill(ctx,sx+4,sy+14,8,2,'#24262b44');
    stamp(ctx, actors, walking ? phase%3 : 0, directionRow[dir] ?? 0, sx, sy);
    return true;
  }
  function grassFrame(mapId,x,y,tick) {
    const step = recentGrass.find(entry => entry.mapId === mapId && entry.x === x && entry.y === y);
    if (!step || tick-step.tick >= 320) return -1;
    return tick-step.tick < 145 ? 0 : 1;
  }
  function drawGrass(ctx, mapId,x,y,sx,sy,tick) {
    const frame = grassFrame(mapId,x,y,tick);
    if (frame < 0 || !ready(rustle)) return false;
    stamp(ctx,rustle,frame,0,sx,sy);
    return true;
  }
  function drawGrassFront(ctx, mapId,x,y,sx,sy,tick) {
    const frame = grassFrame(mapId,x,y,tick);
    if (frame < 0 || !ready(rustle)) return false;
    stamp(ctx,rustle,2+frame,0,sx,sy);
    return true;
  }
  window.EchoGBCampaign = Object.freeze({
    hasMap: id => Object.hasOwn(maps,id),
    isOutdoorLink: (from,to) => maps[from]?.outdoorLinks.includes(to) ?? false,
    drawTile, drawPlayer, drawGrass, drawGrassFront, onStep,
  });
})();
