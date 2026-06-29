#!/usr/bin/env python3
# Allinea app_hr <- sorgente sulle tabelle con gap (trigger DISABILITATI durante
# l'insert per non rifirare audit/immutabili/automazioni). on conflict do nothing.
import json, os, re, time, socket, urllib.request, urllib.error
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
SRC="hsoovytrzxcllbawpvwt"; HUB="bqyqrqmbekdhejrzasvv"
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
TABLES=["hr_qnet_sync_log"]
for t in TABLES:
    cols=q(SRC,f"select a.attname, format_type(a.atttypid,a.atttypmod) ft, t.typtype, t.typname from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid where n.nspname='public' and c.relname='{t}' and a.attnum>0 and not a.attisdropped order by a.attnum")
    pk=q(SRC,f"select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey) where n.nspname='public' and c.relname='{t}' and i.indisprimary")[0]["k"]
    sel=",".join(f'"{c["attname"]}"' for c in cols)
    rec=", ".join(f'"{c["attname"]}" {(("app_hr."+c["typname"]) if c["typtype"]=="e" else c["ft"])}' for c in cols)
    q(HUB,f"alter table app_hr.{t} disable trigger all")
    added=0; off=0; P=1000
    try:
        while True:
            try:
                data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{t} order by ctid limit {P} offset {off}) x")[0]["j"]
                if not data or data=="[]": break
                r=q(HUB,f"insert into app_hr.{t} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec}) on conflict ({pk}) do nothing")
            except RuntimeError as e:
                if "too large" in str(e).lower() and P>25: P=max(25,P//2); continue
                raise
            n=len(json.loads(data)); off+=P
            if n<P: break
    finally:
        q(HUB,f"alter table app_hr.{t} enable trigger all")
    cnt=q(HUB,f"select count(*) n from app_hr.{t}")[0]["n"]
    print(f"  {t}: ora {cnt} righe (trigger riabilitati)")
q(HUB,"notify pgrst, 'reload schema'")
print("FATTO allineamento")
