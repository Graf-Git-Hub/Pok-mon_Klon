"""Pack EXACTLY the shared browser-game sources into the Android offline APK assets."""
from pathlib import Path
import shutil
here=Path(__file__).resolve().parent
repo=here.parent
source=repo/'project'
out=here/'app/src/main/assets'
if not source.joinpath('src/game.js').is_file():
    raise RuntimeError('Shared source project is missing; build from repository echo-chroniken/')
if out.exists():shutil.rmtree(out)
out.mkdir(parents=True)
for p in source.rglob('*'):
    if p.is_file() and p.relative_to(source).parts[0] in ['src','styles','data','assets']:
        target=out/p.relative_to(source)
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(p,target)
index=(source/'index.html').read_text(encoding='utf-8')
assert '<script src="src/game.js"></script>' in index
index=index.replace('<script src="src/game.js"></script>', '<script src="src/game.js"></script>\n<script src="platform.js"></script>')
(out/'index.html').write_text(index,encoding='utf-8')
shutil.copy2(here/'platform.js',out/'platform.js')
engine=out/'src/game.js'
js=engine.read_text(encoding='utf-8')
needle='  function pollGamepad(now) {'
assert js.count(needle)==1, 'Game input method changed; reconcile native input before building!'
js=js.replace(needle,needle+'\n    if (window.ECHO_NATIVE_INPUT) return; // Native Android key/axis events prevent duplicate moves')
engine.write_text(js,encoding='utf-8')
assert all((out/p).is_file() for p in ['index.html','platform.js','src/game.js','styles/main.css','data/species.js'])
assert (out/'assets/atlas.js').exists() or (out/'assets/monster-atlas.webp').exists(), 'Monster images missing'
from assets_icons import generate_icons
generate_icons(here/'app/src/main/res/drawable-nodpi')
print('Bundled',sum(1 for _ in out.rglob('*') if _.is_file()),'offline files;',sum(x.stat().st_size for x in out.rglob('*') if x.is_file()),'bytes')
