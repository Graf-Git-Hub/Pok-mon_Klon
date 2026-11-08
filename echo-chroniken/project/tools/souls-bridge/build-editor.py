"""Make a separate SOULS 3.46 editor preset for Echo's actual 60 maps.
Never touches or overwrites the SOULS default editor/save storage.
"""
from pathlib import Path
import json,re,sys
template=Path(sys.argv[1])
out=Path(sys.argv[2])
project=Path(__file__).resolve().parents[3]/"docs"/"souls-editor"/"EchoChroniken_SOULS_Pilot_Wurzelheim.json"
s=template.read_text(encoding="utf8")
value=json.loads(project.read_text(encoding="utf8"))
marker="const WORLD_PROJECT_PREBUILT="
assert s.count(marker)==1
start=s.index(marker)+len(marker)
old,end=json.JSONDecoder().raw_decode(s[start:])
assert isinstance(old,dict) and old["format"]=="SOULS_PROJECT_V7" and len(old["maps"]) in (27,60)
assert len(value["maps"])==60
s=s[:start]+json.dumps(value,ensure_ascii=False,separators=(',',':'))+s[start+end:]
# Never overwrite or discard an existing editor project; the 08.11 preset uses
# a new namespace. Previous 07.11 saves remain stored under their old key.
keys=["'souls_world_ready_v346'","'echo_chroniken_souls_workshop_20261107'"]
found=[k for k in keys if k in s]
assert len(found)==1,found
s=s.replace(found[0],"'echo_chroniken_souls_workshop_20261108'")
if "<title>SOULS" in s:
 s=s.replace("<title>SOULS","<title>Echo-Chroniken / SOULS",1)
 s=s.replace("</title>"," · 60 echte Spielkarten</title>",1)
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(s,encoding="utf8")
print("ECHO_SOULS_EDITOR_BUILT",out,"bytes",out.stat().st_size,"maps",len(value["maps"]))
