"""Sanitized progress mirror to the public GitHub Pages branch.
Contains only game-rule/status metadata, never saves, local paths or user data.
"""
import json
import shutil
import pathlib
import subprocess
import sys
import time
from datetime import datetime

HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SRC=ROOT/"docs"/"visual-audit"/"parallel-lab"/"status.json"
PAGES=pathlib.Path.home()/"Documents"/"GitHub"/"Echo_Live_PublicPages_20261106"
DEST=PAGES/"status.json"
assert (PAGES/".git").exists() or (PAGES/".git").is_file(),PAGES

def cmd(*args):
    result=subprocess.run(args,cwd=PAGES,text=True,capture_output=True)
    if result.returncode:
        print("PUBLIC_SYNC_ERROR",args[1:3],result.stderr[-450:],flush=True)
    return result.returncode==0

def safe_status():
    source=json.loads(SRC.read_text(encoding="utf8"))
    allowed=("id","serial","title","levelBonus","captureAfterWins","healAtPct",
        "mobile","device","status","stage","step","progress","startedAt","endedAt",
        "exitCode","lastUpdated")
    variants=[{k:v[k] for k in allowed if k in v} for v in source["variants"]]
    # Every publicly mirrored frame is a screenshot of the isolated GAME browser page.
    # The source and output filenames are fixed by RUN-001..RUN-100, no untrusted paths.
    frame_root=PAGES/"frames"
    frame_root.mkdir(exist_ok=True)
    for v in variants:
        frame_source=ROOT/"docs"/"visual-audit"/"parallel-lab"/v["id"]/"live.jpg"
        if not frame_source.exists():continue
        if not 0<frame_source.stat().st_size<500_000:continue
        destination=frame_root/(v["id"]+".jpg")
        if not destination.exists() or frame_source.stat().st_mtime>destination.stat().st_mtime:
            shutil.copy2(frame_source,destination)
        v["frame"]="frames/"+v["id"]+".jpg"
        v["frameUpdated"]=int(frame_source.stat().st_mtime)
    log=[]
    for item in source.get("log",[])[-50:]:
        msg=str(item.get("text",""))
        if any(x in msg.lower() for x in ("traceback","c:","file ","error: ","exception","password","token")):
            continue
        log.append({"at":item.get("at"),"id":item.get("id"),"text":msg[:125]})
    return {
       "name":"Echo-Chroniken Parallel-Labor","now":time.time(),
       "startedAt":source.get("startedAt",time.time()),
       "workerLimit":source.get("workerLimit",2),
       "total":100,"finished":source["finished"],"progress":source["progress"],
       "active":source["active"],"counts":source["counts"],
       "paused":source.get("paused",False),"variants":variants,"log":log
    }

def publish():
    payload=safe_status()
    data=json.dumps(payload,ensure_ascii=False,separators=(",",":"))+"\n"
    # Only files in the dedicated public Pages worktree are touched.
    DEST.write_text(data,encoding="utf8")
    if not cmd("git","add","status.json","frames"):return False
    if not cmd("git","commit","-m","live: update game simulation progress"):return False
    if not cmd("git","-c","credential.interactive=never","push","origin","gh-pages"):
        return False
    print("PUBLIC_SYNC_OK",datetime.now().isoformat(timespec="seconds"),
         "done",payload["finished"],"active",payload["active"],flush=True)
    return True

def main():
    once="--once" in sys.argv
    last_missing=False
    while True:
        if SRC.exists():
            try:
                if publish() and once:return
            except Exception as e:
                print("PUBLIC_SYNC_EXCEPTION",type(e).__name__,str(e)[:250],flush=True)
                if once:raise
        elif not last_missing:
            print("PUBLIC_SYNC_WAITING_FOR_TEST_SERVICE",flush=True)
            last_missing=True
        if once:raise SystemExit(3)
        time.sleep(60)

if __name__=="__main__":main()
