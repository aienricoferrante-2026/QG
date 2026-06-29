#!/usr/bin/env python3
# Fix gap build app_sales: viste _vw (search_path) + qnet_* (chunk piccolo).
import json, os, re, time, socket, urllib.request
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
SRC="vqtqccnbwkslbnxlfskk"; HUB="bqyqrqmbekdhejrzasvv"
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

# 1) viste _vw: ricrea con search_path = app_sales, public
VIEWS=["campagna_kpi_vw","dashboard_kpi_globali_vw","dashboard_kpi_trend_mensile_vw","deal_aggregato_vw","pipeline_funnel_vw","progetto_kpi_vw","vw_tempo_prima_risposta_offerta","budget_aggregato_vw"]
for v in VIEWS:
    try:
        vd=q(SRC,f"select pg_get_viewdef('public.{v}'::regclass,true) d")[0]["d"]
        q(HUB,f"set search_path to app_sales, public; create or replace view app_sales.{v} as {vd}")
        print(f"  vista app_sales.{v} OK")
    except RuntimeError as e:
        print(f"  ✗ {v}: {e[:100]}")

# 2) qnet_opportunita / qnet_offerta: chunk piccolo (payload enorme)
for t in ["qnet_opportunita","qnet_offerta"]:
    cols=q(SRC,f"select a.attname, format_type(a.atttypid,a.atttypmod) ft from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='{t}' and a.attnum>0 and not a.attisdropped order by a.attnum")
    sel=",".join(f'"{c["attname"]}"' for c in cols); rec=", ".join(f'"{c["attname"]}" {c["ft"]}' for c in cols)
    q(HUB,f"truncate app_sales.{t}")
    off=0; PAGE=300; tot=0
    while True:
        data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{t} order by ctid limit {PAGE} offset {off}) x")[0]["j"]
        if not data or data=="[]": break
        q(HUB,f"insert into app_sales.{t} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
        n=len(json.loads(data)); tot+=n; off+=PAGE
        if n<PAGE: break
    print(f"  tabella app_sales.{t}: {tot} righe")
q(HUB,"grant all on all tables in schema app_sales to service_role; notify pgrst, 'reload schema'")
print("FATTO")
