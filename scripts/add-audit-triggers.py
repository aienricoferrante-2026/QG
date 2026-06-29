#!/usr/bin/env python3
# Aggiunge i 3 trigger audit_log (immutabilita+hash-chain) a app_<app>. <app> <src_ref>
import json, os, re, sys, urllib.request, urllib.error
APP, SRC = sys.argv[1], sys.argv[2]; S=f"app_{APP}"
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
def q(ref,sql):
    req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
    try:
        with urllib.request.urlopen(req,timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e: raise RuntimeError(e.read().decode()[:200])
trg=q(SRC,"select t.tgname, pg_get_triggerdef(t.oid) d from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='audit_log' and not t.tgisinternal")
for tg in trg:
    d=tg["d"].replace(" ON public.audit_log",f" ON {S}.audit_log").replace("EXECUTE FUNCTION ",f"EXECUTE FUNCTION {S}.").replace("EXECUTE PROCEDURE ",f"EXECUTE PROCEDURE {S}.")
    q(HUB,f"drop trigger if exists {tg['tgname']} on {S}.audit_log")
    q(HUB,d); print(f"  trigger {tg['tgname']} OK")
q(HUB,"notify pgrst, 'reload schema'")
print("FATTO")
