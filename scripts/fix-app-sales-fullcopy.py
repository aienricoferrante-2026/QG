#!/usr/bin/env python3
# Sales = ESTENSIONE: app_sales deve avere lo schema PIENO della sorgente, non
# viste sul consolidato (rimodellato). Converte le viste-su-consolidato in
# tabelle copia-piena, poi (ri)crea le viste _vw.
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
ENUMS=[r["t"] for r in q(SRC,"select t.typname t from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'")]
def sd(d):
    if d is None: return None
    if "nextval" in d: return None
    d=d.replace("uuid_generate_v4()","gen_random_uuid()")
    for e in ENUMS: d=d.replace(f"::{e}","")
    return d
def migrate(o, page=2000):
    cols=q(SRC,f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull, pg_get_expr(ad.adbin,ad.adrelid) def, t.typtype
      from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid
      left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum where n.nspname='public' and c.relname='{o}' and a.attnum>0 and not a.attisdropped order by a.attnum""")
    if not cols: return "assente"
    defs=[]
    for c in cols:
        ft="text" if c["typtype"]=="e" else c["ft"]
        ln=f'"{c["attname"]}" {ft}'+(" not null" if c["attnotnull"] else "")
        dd=sd(c["def"]);  ln+=f" default {dd}" if dd else ""
        defs.append(ln)
    pk=q(SRC,f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey) where n.nspname='public' and c.relname='{o}' and i.indisprimary""")
    pkc=pk[0]["k"] if pk and pk[0]["k"] else None
    q(HUB,f"drop view if exists app_sales.{o} cascade")
    q(HUB,f"drop table if exists app_sales.{o} cascade")
    q(HUB,f'create table app_sales.{o} ({", ".join(defs)}'+(f', primary key ({pkc})' if pkc else '')+')')
    q(HUB,f"alter table app_sales.{o} enable row level security")
    sel=",".join(f'"{c["attname"]}"' for c in cols); rec=", ".join(f'"{c["attname"]}" {("text" if c["typtype"]=="e" else c["ft"])}' for c in cols)
    off=0;tot=0
    while True:
        try:
            data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{o} order by ctid limit {page} offset {off}) x")[0]["j"]
            if not data or data=="[]": break
            q(HUB,f"insert into app_sales.{o} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
        except RuntimeError as e:
            if "too large" in str(e).lower() and page>25:
                page=max(25,page//2); continue          # blocco troppo grosso -> dimezza, stesso offset
            raise
        n=len(json.loads(data));tot+=n;off+=page
        if n<page: break
    return f"{tot} righe (blocco {page})"

# 1) le app_sales che sono VISTE ma in sorgente sono TABELLE 'r' -> converti a copia-piena
views=[r["table_name"] for r in q(HUB,"select table_name from information_schema.views where table_schema='app_sales'")]
srckind={r["relname"]:r["relkind"] for r in q(SRC,f"select relname,relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname = any(string_to_array('{','.join(views)}',','))")} if views else {}
tofix=[v for v in views if srckind.get(v)=="r"]
print("converto viste->copia-piena:",tofix)
for o in tofix:
    pg = 250 if o.startswith("qnet") else 2000
    print(f"  {o}: {migrate(o, pg)}")

# 2) ricrea le viste _vw (ora le colonne ci sono) con search_path
VWS=["campagna_kpi_vw","dashboard_kpi_globali_vw","dashboard_kpi_trend_mensile_vw","deal_aggregato_vw","pipeline_funnel_vw","progetto_kpi_vw","vw_tempo_prima_risposta_offerta","budget_aggregato_vw"]
for v in VWS:
    try:
        vd=q(SRC,f"select pg_get_viewdef('public.{v}'::regclass,true) d")[0]["d"]
        q(HUB,f"set search_path to app_sales, public; create or replace view app_sales.{v} as {vd}")
        print(f"  vista {v} OK")
    except RuntimeError as e: print(f"  ✗ {v}: {str(e)[:90]}")
q(HUB,"grant all on all tables in schema app_sales to service_role; notify pgrst, 'reload schema'")
print("FATTO")
