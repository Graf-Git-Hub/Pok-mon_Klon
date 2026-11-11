"""Bundle V14 environment graphics for the campaign's existing map registry."""
from pathlib import Path
import base64
import json

project = Path(__file__).resolve().parents[2]
assets = project / 'assets/gb-classic'
world = json.loads((assets / 'world_maps.json').read_text())
manifest = json.loads((assets / 'tile_manifest.json').read_text())
sprites = {key: value['atlasIndex'] for key, value in manifest['sprites'].items()}
maps = {
    key: {
        'theme': region['theme'], 'indoor': region['indoor'],
        'rows': region['rows'],
        'outdoorLinks': [exit['scene'] for exit in region['portals'].values() if 'direction' in exit],
    }
    for key, region in world['scenes'].items()
}
images = {}
for name in ('gb_classic_atlas', 'actors', 'grass_rustle', 'interior_edges', 'world_biomes'):
    png = (assets / f'{name}.png').read_bytes()
    images[name] = 'data:image/png;base64,' + base64.b64encode(png).decode('ascii')

payload = {'maps': maps, 'symbols': world['symbols'], 'sprites': sprites, 'images': images}
target = project / 'data/gb-campaign-art.js'
target.write_text(
    '// Generated from the V14 world by tools/gb-world/build_campaign_art.py.\n'
    'window.EchoGBCampaignArt = ' + json.dumps(payload, separators=(',', ':')) + ';\n'
)
