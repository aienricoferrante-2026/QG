#!/usr/bin/env python3
# Carica TUTTO audit_log (297k) in app_sales (chunk adattivo), poi aggiunge i 3
# trigger (immutabilita + hash-chain) DOPO il carico, per non riscrivere gli hash.
import json, os, re, time, socket, urllib.request
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
SRC="vqtqccnbwkslbnxlfskk"; HUB="bqyqrqmbekdhejrzasvv"
def q(ref,sql):
    for a in range(6):
        req=urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",data=json.dumps({"query":sql}).encode(),headers={"Authorization":f"Bearer {TOK}","Content-Type":"application/json","User-Agent":"curl/8"})
        try:
            with urllib.request.urlopen(req,timeout=180) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            b=e.read().decode()[:200]
            if e.code in (429,500,502,503,504) and a<5: time.sleep(2+a*2); continue
            raise RuntimeError(b)
        except (urllib.error.URLError,socket.timeout,TimeoutError):
            if a<5: time.sleep(2+a*2); continue
            raise
cols=q(SRC,"select a.attname, format_type(a.atttypid,a.atttypmod) ft from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='audit_log' and a.attnum>0 and not a.attisdropped order by a.attnum")
sel=",".join(f'"{c["attname"]}"' for c in cols); rec=", ".join(f'"{c["attname"]}" {c["ft"]}' for c in cols)
q(HUB,"truncate app_sales.audit_log")
off=0;P=2000;tot=0
while True:
    try:
        data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.audit_log order by ctid limit {P} offset {off}) x")[0]["j"]
        if not data or data=="[]": break
        q(HUB,f"insert into app_sales.audit_log ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
    except RuntimeError as e:
        if "too large" in str(e).lower() and P>50: P=max(50,P//2); continue
        raise
    n=len(json.loads(data));tot+=n;off+=P
    if tot % 20000 < P: print(f"  audit_log: {tot}...", flush=True)
    if n<P: break
print(f"audit_log caricato: {tot} righe")
# ora i 3 trigger
trg=q(SRC,"select t.tgname, pg_get_triggerdef(t.oid) d from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='audit_log' and not t.tgisinternal")
for tg in trg:
    d=tg["d"].replace(" ON public.audit_log"," ON app_sales.audit_log").replace("EXECUTE FUNCTION ","EXECUTE FUNCTION app_sales.").replace("EXECUTE PROCEDURE ","EXECUTE PROCEDURE app_sales.")
    q(HUB,f"drop trigger if exists {tg['tgname']} on app_sales.audit_log")
    q(HUB,d); print(f"  trigger {tg['tgname']} OK")
q(HUB,"notify pgrst, 'reload schema'")
print("FATTO audit_log + trigger")
