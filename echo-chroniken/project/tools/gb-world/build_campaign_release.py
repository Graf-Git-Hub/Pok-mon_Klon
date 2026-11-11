"""Build the hosted campaign page with two cacheable monster atlas scripts."""
from pathlib import Path
import re
import shutil
import sys

project = Path(__file__).resolve().parents[2]
destination = Path(sys.argv[1]).resolve()
assets = destination / 'echo-v14-assets'
assets.mkdir(parents=True, exist_ok=True)
entry = project / 'index.html'
html = entry.read_text(encoding='utf-8')
stylesheet = '<link rel="stylesheet" href="styles/main.css">'
css = (project / 'styles/main.css').read_text(encoding='utf-8')
html = html.replace(stylesheet, f'<style>\n{css}\n</style>')

def package_script(match):
    name = match.group(1)
    if name in ('assets/atlas.js', 'assets/backs.js'):
        source = project / name
        shutil.copyfile(source, assets / source.name)
        return f'<script src="echo-v14-assets/{source.name}"></script>'
    source = (project / name).read_text(encoding='utf-8')
    if re.search(r'</script', source, flags=re.I):
        raise ValueError(f'Unexpected script closing tag in {name}')
    return f'<script>\n{source}\n</script>'

html = re.sub(r'<script src="([^"]+)"></script>', package_script, html)
page = destination / 'echo-chroniken-v14-hauptspiel.html'
page.write_text(html, encoding='utf-8')
print(page, page.stat().st_size)
