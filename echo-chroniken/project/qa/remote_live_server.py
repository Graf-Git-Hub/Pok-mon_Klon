"""Private remote view of only Echo-Chroniken browser test frames and sanitized progress.
Localhost-only; publish through a Cloudflare Quick Tunnel. No command endpoints, no saves.
"""
import hmac
import http.cookies
import http.server
import json
import re
import secrets
import time
import urllib.parse
from pathlib import Path

QA=Path(__file__).resolve().parent
OUT=QA.parents[1]/"docs"/"visual-audit"/"parallel-lab"
SOURCE=OUT/"status.json"
HTML=QA/"parallel_dashboard.html"
KEYFILE=OUT/"remote_live_access.key"
PORT=8898
OUT.mkdir(parents=True,exist_ok=True)
if KEYFILE.exists():
    KEY=KEYFILE.read_text(encoding="ascii").strip()
else:
    KEY=secrets.token_urlsafe(32)
    KEYFILE.write_text(KEY,encoding="ascii")
assert len(KEY)>32

PROFILE_KEYS=("id","serial","title","levelBonus","captureAfterWins",
    "healAtPct","mobile","device","status","stage","step","progress",
    "startedAt","endedAt","exitCode","lastUpdated")
SAFE_LOG_WORDS=("traceback","c:","file ","error: ","exception","password","token","http:","https:","users\\")
def sanitize():
    current=json.loads(SOURCE.read_text(encoding="utf8"))
    variants=[]
    for p in current["variants"]:
        item={k:p[k] for k in PROFILE_KEYS if k in p}
        name=item["id"]
        assert re.fullmatch(r"RUN-(?:0[0-9]{2}|100)",name)
        preview=OUT/name/"live.jpg"
        if preview.exists() and 0<preview.stat().st_size<500000:
            item["frame"]="frames/"+name+".jpg"
            item["frameUpdated"]=int(preview.stat().st_mtime)
        variants.append(item)
    log=[]
    for v in current.get("log",[])[-50:]:
        msg=str(v.get("text",""))
        if not any(word in msg.lower() for word in SAFE_LOG_WORDS):
            log.append({"at":v.get("at"),"id":v.get("id"),"text":msg[:125]})
    return {"name":"Echo-Chroniken PC Monitor","now":time.time(),
            "startedAt":current.get("startedAt",time.time()),"workerLimit":current.get("workerLimit",0),
            "total":100,"finished":current.get("finished",0),"progress":current.get("progress",0),
            "active":current.get("active",0),"counts":current.get("counts",{}),
            "paused":current.get("paused",False),"variants":variants,"log":log}

class View(http.server.BaseHTTPRequestHandler):
    server_version="EchoGameMonitor/1.0"
    def log_message(self,*args):pass

    def respond(self,code,content,typ="text/plain; charset=utf-8",cookie=None):
        if isinstance(content,str):content=content.encode("utf8")
        self.send_response(code)
        self.send_header("Content-Type",typ)
        self.send_header("Content-Length",str(len(content)))
        self.send_header("Cache-Control","no-store, max-age=0")
        self.send_header("X-Content-Type-Options","nosniff")
        self.send_header("Referrer-Policy","no-referrer")
        self.send_header("X-Frame-Options","DENY")
        self.send_header("Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'")
        if cookie:self.send_header("Set-Cookie",cookie)
        self.end_headers()
        self.wfile.write(content)

    def authorized(self):
        jar=http.cookies.SimpleCookie()
        try:jar.load(self.headers.get("Cookie",""))
        except Exception:return False
        entry=jar.get("echo_lab_access")
        return entry is not None and hmac.compare_digest(entry.value,KEY)

    def do_GET(self):
        target=urllib.parse.urlsplit(self.path)
        if target.path=="/" and "key" in urllib.parse.parse_qs(target.query):
            attempt=urllib.parse.parse_qs(target.query).get("key",[""])[0]
            if hmac.compare_digest(attempt,KEY):
                self.send_response(303)
                self.send_header("Location","/")
                self.send_header("Set-Cookie",
                    "echo_lab_access="+KEY+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400")
                self.send_header("Cache-Control","no-store")
                self.send_header("Referrer-Policy","no-referrer")
                self.send_header("Content-Length","0")
                self.end_headers()
                return
        if not self.authorized():
            return self.respond(403,"Nicht freigegeben. Bitte den privaten Live-Link verwenden.")
        try:
            if target.path in ("/","/index.html"):
                return self.respond(200,HTML.read_bytes(),"text/html; charset=utf-8")
            if target.path=="/api/status":
                return self.respond(200,json.dumps(sanitize(),ensure_ascii=False),"application/json; charset=utf-8")
            if target.path=="/health":
                return self.respond(200,'{"ok":true}',"application/json")
            if target.path.startswith("/api/log/"):
                name=target.path.split("/")[-1]
                if not re.fullmatch(r"RUN-(?:0[0-9]{2}|100)",name):
                    return self.respond(404,"Kein Test")
                state=sanitize()
                p=next((x for x in state["variants"] if x["id"]==name),None)
                if not p:return self.respond(404,"Kein Test")
                lines=[x["text"] for x in state["log"] if x["id"]==name]
                return self.respond(200, "Test: "+name+"\nStatus: "+p["status"]+
                    "\nAbschnitt: "+str(p["stage"])+"\nFortschritt: "+str(p["progress"])+
                    "%\n\n"+"\n".join(lines))
            match=re.fullmatch(r"/frames/(RUN-(?:0[0-9]{2}|100))\.jpg",target.path)
            if match:
                src=OUT/match.group(1)/"live.jpg"
                if not src.exists():return self.respond(404,"Noch kein Bild")
                image=src.read_bytes()
                if not 0<len(image)<500000 or not image.startswith(b"\xff\xd8"):
                    return self.respond(404,"Ungültiges Spielbild")
                return self.respond(200,image,"image/jpeg")
            return self.respond(404,"Nicht gefunden")
        except (OSError,ValueError,KeyError):
            return self.respond(503,"Status vorübergehend nicht verfügbar")

if __name__=="__main__":
    server=http.server.ThreadingHTTPServer(("127.0.0.1",PORT),View)
    print("PRIVATE_GAME_MONITOR_READY port="+str(PORT),flush=True)
    server.serve_forever(poll_interval=.35)
