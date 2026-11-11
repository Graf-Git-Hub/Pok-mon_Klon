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
        break;
      case 2: tile = 'grass'; break;
      case 3:
        tile = art.indoor ? 'room_floor' : suggested === 'floor_stone' ? 'floor_stone' : 'path';
        break;
      case 4: tile = Math.floor(tick / 380) % 2 ? 'water_b' : 'water_a'; break;
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
    if (terrain === 4) {
      ctx.fillStyle = '#777a7b';
      if (map.tiles[y-1]?.[x] !== 4) ctx.fillRect(sx,sy,16,1);
      if (map.tiles[y+1]?.[x] !== 4) ctx.fillRect(sx,sy+15,16,1);
      if (map.tiles[y]?.[x-1] !== 4) ctx.fillRect(sx,sy,1,16);
      if (map.tiles[y]?.[x+1] !== 4) ctx.fillRect(sx+15,sy,1,16);
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
