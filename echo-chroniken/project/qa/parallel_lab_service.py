"""LAN-only dashboard and supervisor for real, isolated Echo Chroniken playthrough tests.
No public upload, no external JS or dependency. Python stdlib HTTP server.
"""
import argparse
import functools
import http.server
import itertools
import json
import os
from pathlib import Path
import queue
import subprocess
import sys
import threading
import time
import traceback
import urllib.parse

ROOT=Path(__file__).resolve().parents[2]
PROJECT=ROOT/"project"
OUT=ROOT/"docs"/"visual-audit"/"parallel-lab"
OUT.mkdir(parents=True, exist_ok=True)
HERE=Path(__file__).parent
DASH=HERE/"parallel_dashboard.html"
PORT=8765
MAX_WORKERS=2
LEVELS=[0,1,2,5,10]
CAPTURE=[0,1,2,3]
HEAL=[0,25,45,65,85]
STAGES=["Start","Omas Haus","Paket & Dorf","Waldlichter","Fangen & Erfahrung","Trainer Piko","Ruinen","Kapitel 3","Kapitel 4","Nächste Stadt"]
LABELS={0:"Ohne Levelpflicht",1:"+1 Level je Wesen",2:"+2 Level je Wesen",5:"+5 Level je Wesen",10:"+10 Level je Wesen"}
KIND={0:"Sofortiger Fangversuch",1:"Erst 1 Wildsieg",2:"Erst 2 Wildsiege",3:"Erst 3 Wildsiege"}
profiles=[]
for idx,(bonus,capture,heal) in enumerate(itertools.product(LEVELS,CAPTURE,HEAL),1):
    mobile=idx%2==0
    profiles.append(dict(
        id=f"RUN-{idx:03}",serial=idx,
        title=f"{LABELS[bonus]} · {KIND[capture]} · Heilung ab {heal}%",
        levelBonus=bonus,captureAfterWins=capture,healAtPct=heal,
        mobile=mobile,device="Touch" if mobile else "Desktop",
        status="queued",stage="Wartet",step=0,progress=0,attempts=0,
        startedAt=None,endedAt=None,exitCode=None,
        checks=[],message="",lastUpdated=None
    ))
assert len(profiles)==100
lock=threading.RLock()
worker_threads={}
logLines=[]
paused=False
running=[]
launch_enabled=True
started=time.time()
def snapshot():
    with lock:
        a=[dict(p) for p in profiles]
        counts={s:sum(p["status"]==s for p in a) for s in ["queued","running","passed","failed","blocked"]}
        done=counts["passed"]+counts["failed"]+counts["blocked"]
        totalPartial=sum(p["progress"] for p in a)/len(a)
        return dict(name="Echo-Chroniken Parallel-Labor",workerLimit=MAX_WORKERS,
          counts=counts,total=len(a),finished=done,progress=round(totalPartial,2),
          active=sum(p["status"]=="running" for p in a),
          startedAt=started,now=time.time(),paused=paused,
          variants=a,log=logLines[-65:])
def addlog(p,msg):
    line={"at":time.time(),"id":p["id"] if p else "SYSTEM","text":str(msg)[:500]}
    with lock:
        logLines.append(line)
        del logLines[:-400]
def update(p,**kwargs):
    with lock:
        p.update(kwargs)
        p["lastUpdated"]=time.time()
def persist():
    """Serialize status writes; retries Windows file-lock collisions without killing tests."""
    with lock:
        target=OUT/"status.json"
        tmp=OUT/f"status-{os.getpid()}-{threading.get_ident()}.tmp"
        payload=json.dumps(snapshot(),ensure_ascii=False,indent=2)+"\n"
        for attempt in range(30):
            try:
                tmp.write_text(payload,encoding="utf-8")
                os.replace(tmp,target)
                return True
            except (PermissionError,OSError):
                # Windows readers/antivirus can temporarily lock the destination.
                time.sleep(min(.2,.025*(attempt+1)))
        try:
            tmp.unlink(missing_ok=True)
        except OSError:
            pass
        print("STATUS_PERSIST_RETRY_EXHAUSTED",threading.current_thread().name,flush=True)
        return False
def handle_stdout(p,line):
    t=line.strip()
    if not t:return
    if t.startswith("NATURAL_STAGE"):
        # NATURAL_STAGE desktop forest lights {save summary}
        values=t.split(" ",3)
        stage=values[2] if len(values)>2 else "Spielverlauf"
        old=p["progress"]
        milestones={"intro/parcel":9,"forest":23,"wild":39,"optional":46,"ruins":55,
                    "chapter":65,"rail":85,"root":91}
        prog=max([v for k,v in milestones.items() if k in t.lower()] or [min(96,old+2)])
        update(p,stage=stage[:65],progress=max(old,prog))
        addlog(p,t[:160])
    elif t.startswith("PARALLEL_RULE"):
        update(p,stage="Levelpflicht wird geprüft",progress=max(40,p["progress"]))
        addlog(p,t[:200])
    elif t.startswith("NATURAL_FAILED"):
        addlog(p,t[:300])
    elif t.startswith("NATURAL_OPENING_PASS"):
        addlog(p,"Spielroute vollständig abgeschlossen")
    elif t.startswith("PARALLEL_"):
        addlog(p,t[:220])
def run_one(p):
    cmd=[sys.executable,"-u","-X","utf8",str(HERE/"parallel_natural_run.py"),
         "--seeded","--touch" if p["mobile"] else "--desktop"]
    env=os.environ.copy()
    env.update(PARALLEL_RUN_ID=p["id"],
        PARALLEL_LEVEL_BONUS=str(p["levelBonus"]),
        PARALLEL_CAPTURE_AFTER=str(p["captureAfterWins"]),
        PARALLEL_HEAL_PCT=str(p["healAtPct"]),
        PARALLEL_SEED=str(2026110600+p["serial"]))
    output=OUT/p["id"]
    output.mkdir(exist_ok=True)
    logFile=output/"run.log"
    update(p,status="running",stage="Browser wird gestartet",progress=1,startedAt=time.time())
    addlog(p,"Starte echte Spielroute, eigener Browser-Spielstand")
    persist()
    try:
        with logFile.open("w",encoding="utf8") as log:
            proc=subprocess.Popen(cmd,cwd=PROJECT,stdout=subprocess.PIPE,
               stderr=subprocess.STDOUT,bufsize=1,text=True,encoding="utf8",errors="replace",env=env)
            for line in proc.stdout:
                log.write(line)
                log.flush()
                handle_stdout(p,line)
                persist()
            ret=proc.wait()
        if ret==0:
            update(p,status="passed",stage="Erfolgreich bis nächste Stadt",progress=100,exitCode=0,endedAt=time.time())
            addlog(p,"BESTANDEN: reale Eingaben bis zum Kapitel-4-Ziel")
        else:
            contents=logFile.read_text(encoding="utf8",errors="replace")
            blocked="PARALLEL_GATE_BLOCKED" in contents
            update(p,status="blocked" if blocked else "failed",stage="Levelregel nicht erfüllt" if blocked else "Spieltest fehlgeschlagen",
              exitCode=ret,endedAt=time.time(),message=contents[-650:])
            addlog(p,"GESPERRT: Levelregel" if blocked else f"FEHLER: Prozesscode {ret}")
    except Exception as e:
        update(p,status="failed",stage="Testfehler",message=str(e),endedAt=time.time())
        addlog(p,traceback.format_exc()[-350:])
    finally:
        persist()
def scheduler():
    addlog(None,f"100 Varianten; {MAX_WORKERS} echte Browser-Spieltests parallel")
    persist()
    while True:
        with lock:
            # Recover orphaned active rows from unexpected worker-thread death.
            for entry in profiles:
                if entry["status"]!="running":continue
                worker=worker_threads.get(entry["id"])
                if worker is not None and not worker.is_alive() and time.time()-(entry.get("startedAt") or started)>2:
                    entry["attempts"]=entry.get("attempts",0)+1
                    if entry["attempts"]>=3:
                        entry.update(status="failed",stage="Worker mehrfach abgestürzt",endedAt=time.time(),
                                     message="Der Testprozess wurde unerwartet beendet.")
                    else:
                        entry.update(status="queued",stage="Abgebrochenen Test neu eingeplant",
                                     startedAt=None,progress=0)
                    addlog(entry,"Worker abgestürzt; Test wird erneut gestartet" if entry["status"]=="queued" else "Worker mehrfach abgestürzt")
                    persist()
            remaining=[x for x in profiles if x["status"]=="queued"]
            active=[x for x in profiles if x["status"]=="running"]
            if not remaining and not active:
                addlog(None,"Alle 100 Versuche haben einen endgültigen Status")
                persist()
                return
            if remaining and len(active)<MAX_WORKERS and not paused:
                p=remaining[0]
                # Mark before thread starts to avoid double queueing
                p["status"]="running"
                worker=threading.Thread(target=run_one,args=(p,),daemon=True,name=p["id"])
                worker_threads[p["id"]]=worker
                worker.start()
        time.sleep(0.5)
class Handler(http.server.BaseHTTPRequestHandler):
    server_version="EchoParallelLab/1.0"
    def log_message(self,*args):pass
    def send(self,status,typ,content):
        if isinstance(content,str):content=content.encode("utf8")
        self.send_response(status)
        self.send_header("Content-Type",typ)
        self.send_header("Content-Length",str(len(content)))
        self.send_header("Cache-Control","no-store, max-age=0")
        self.send_header("Access-Control-Allow-Origin","*")
        self.end_headers()
        self.wfile.write(content)
    def do_GET(self):
        u=urllib.parse.urlsplit(self.path)
        if u.path in ("/","/index.html"):
            self.send(200,"text/html; charset=utf-8",DASH.read_bytes())
        elif u.path=="/api/status":
            self.send(200,"application/json; charset=utf-8",json.dumps(snapshot(),ensure_ascii=False).encode("utf8"))
        elif u.path.startswith("/api/log/"):
            slug=u.path[len("/api/log/"):]
            if slug not in {p["id"] for p in profiles}:return self.send(404,"text/plain","Nicht gefunden")
            f=OUT/slug/"run.log"
            self.send(200,"text/plain; charset=utf-8",f.read_text(encoding="utf8",errors="replace")[-15000:] if f.exists() else "Noch kein Testprotokoll.")
        elif u.path=="/health":
            self.send(200,"application/json",json.dumps({"ok":True,"active":snapshot()["active"]}))
        else:
            self.send(404,"text/plain","Nicht gefunden")
def restore_completed_progress():
    """On service restart preserve terminal results; restart only interrupted active cases."""
    global started
    f=OUT/"status.json"
    if not f.exists():return
    try:
        old=json.loads(f.read_text(encoding="utf8"))
        if old.get("total")!=100:return
        lookup={x["id"]:x for x in old.get("variants",[])}
        restored=0
        for item in profiles:
            prior=lookup.get(item["id"],{})
            if prior.get("status") in ("passed","failed","blocked"):
                for key in ("status","stage","progress","startedAt","endedAt","exitCode","lastUpdated","message"):
                    if key in prior:item[key]=prior[key]
                restored+=1
            elif prior.get("status")=="running":
                item["stage"]="Nach Neustart neu eingeplant"
        started=old.get("startedAt",started)
        print("RESTORED_TERMINAL_RUNS",restored,"of 100",flush=True)
    except Exception as ex:
        print("RESTORE_WARNING",type(ex).__name__,str(ex)[:100],flush=True)
def main():
    global MAX_WORKERS
    parser=argparse.ArgumentParser()
    parser.add_argument("--port",type=int,default=PORT)
    parser.add_argument("--workers",type=int,default=4)
    parser.add_argument("--no-start",action="store_true")
    args=parser.parse_args()
    MAX_WORKERS=max(1,min(args.workers,4))
    assert DASH.exists(),DASH
    restore_completed_progress()
    if not args.no_start:
        threading.Thread(target=scheduler,daemon=True,name="parallel-test-scheduler").start()
    server=http.server.ThreadingHTTPServer(("0.0.0.0",args.port),Handler)
    print("ECHO_LIVE_DASHBOARD_READY http://0.0.0.0:"+str(args.port),flush=True)
    server.serve_forever(poll_interval=.4)
if __name__=="__main__":
    main()
