#!/usr/bin/env python3
# GENERICO: porta funzioni custom + trigger di un'app in app_<app>.
# I trigger su audit_log sono deferiti (--audit per aggiungerli a parte).
# Uso: python3 port-logic-v2.py <app> <src_ref> [--audit]
import json, os, re, sys, time, socket, urllib.request
APP, SRC = sys.argv[1], sys.argv[2]
S=f"app_{APP}"; ONLY_AUDIT="--audit" in sys.argv
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(ref,sql):
    for a in range(6):
        req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
        try:
            with urllib.request.urlopen(req,timeout=120) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            b=e.read().decode()[:200]
            if e.code in (429,500,502,503,504) and a<5: time.sleep(2+a*2); continue
            raise RuntimeError(b)
        except (urllib.error.URLError,socket.timeout,TimeoutError):
            if a<5: time.sleep(2+a*2); continue
            raise
have={r["table_name"] for r in q(HUB,f"select table_name from information_schema.tables where table_schema='{S}'")}
if not ONLY_AUDIT:
    fns=q(SRC,"select p.proname, pg_get_functiondef(p.oid) d from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and not exists (select 1 from pg_depend dd where dd.objid=p.oid and dd.deptype='e') order by p.proname")
    okf=0; ff=[]
    for f in fns:
        d=f["d"].replace("public.", f"{S}.")
        if " SET search_path" not in d: d=re.sub(r"\nAS \$", f"\n SET search_path TO {S}, public\nAS $", d, count=1)
        # set di SESSIONE: i tipi (enum) nei DECLARE si risolvono al CREATE time
        d=f"set search_path to {S}, public;\n{d}"
        try: q(HUB,d); okf+=1
        except RuntimeError as e: ff.append((f["proname"],str(e)[:80]))
    print(f"FUNZIONI: {okf} ok, {len(ff)} fallite")
    for n,e in ff: print(f"  ✗ {n}: {e}")
trg=q(SRC,"select c.relname tbl, t.tgname, pg_get_triggerdef(t.oid) d from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal order by 1,2")
okt=0; ft=[]; deferred=0
for tg in trg:
    tbl=tg["tbl"]
    if tbl not in have: continue
    isa=(tbl=="audit_log")
    if isa and not ONLY_AUDIT: deferred+=1; continue
    if not isa and ONLY_AUDIT: continue
    d=tg["d"].replace(" ON public.", f" ON {S}.").replace("EXECUTE FUNCTION ", f"EXECUTE FUNCTION {S}.").replace("EXECUTE PROCEDURE ", f"EXECUTE PROCEDURE {S}.")
    try:
        q(HUB,f"drop trigger if exists {tg['tgname']} on {S}.{tbl}"); q(HUB,d); okt+=1
    except RuntimeError as e: ft.append((f"{tbl}.{tg['tgname']}",str(e)[:80]))
print(f"TRIGGER: {okt} ok, {len(ft)} fallite, {deferred} deferiti(audit_log)")
for n,e in ft: print(f"  ✗ {n}: {e}")
q(HUB,"notify pgrst, 'reload schema'")
print("FATTO")
