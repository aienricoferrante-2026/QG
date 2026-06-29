#!/usr/bin/env python3
# Completa app_sales: migra le dipendenze mancanti delle viste _vw, crea le viste,
# finisce qnet_* a blocchi piccoli.
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
def migrate(o):
    cols=q(SRC,f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull, pg_get_expr(ad.adbin,ad.adrelid) def, t.typtype
      from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid
      left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum where n.nspname='public' and c.relname='{o}' and a.attnum>0 and not a.attisdropped order by a.attnum""")
    if not cols: return f"assente"
    defs=[]
    for c in cols:
        ft="text" if c["typtype"]=="e" else c["ft"]
        ln=f'"{c["attname"]}" {ft}'+(" not null" if c["attnotnull"] else "")
        dd=sd(c["def"]);  ln+=f" default {dd}" if dd else ""
        defs.append(ln)
    pk=q(SRC,f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey) where n.nspname='public' and c.relname='{o}' and i.indisprimary""")
    pkc=pk[0]["k"] if pk and pk[0]["k"] else None
    q(HUB,f"drop table if exists app_sales.{o} cascade")
    q(HUB,f'create table app_sales.{o} ({", ".join(defs)}'+(f', primary key ({pkc})' if pkc else '')+')')
    q(HUB,f"alter table app_sales.{o} enable row level security")
    sel=",".join(f'"{c["attname"]}"' for c in cols); rec=", ".join(f'"{c["attname"]}" {("text" if c["typtype"]=="e" else c["ft"])}' for c in cols)
    off=0;P=2000;tot=0
    while True:
        data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{o} order by ctid limit {P} offset {off}) x")[0]["j"]
        if not data or data=="[]": break
        q(HUB,f"insert into app_sales.{o} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
        n=len(json.loads(data));tot+=n;off+=P
        if n<P: break
    return f"{tot} righe"

VIEWS=["campagna_kpi_vw","dashboard_kpi_globali_vw","dashboard_kpi_trend_mensile_vw","deal_aggregato_vw","pipeline_funnel_vw","progetto_kpi_vw","vw_tempo_prima_risposta_offerta","budget_aggregato_vw"]
# dipendenze (tabelle/viste) di ciascuna vista nel sorgente
deps=set()
for v in VIEWS:
    try:
        for r in q(SRC,f"""select distinct cl.relname, cl.relkind from pg_depend d join pg_rewrite rw on rw.oid=d.objid
          join pg_class vv on vv.oid=rw.ev_class join pg_class cl on cl.oid=d.refobjid and cl.relkind in ('r','v','m')
          join pg_namespace n on n.oid=vv.relnamespace where n.nspname='public' and vv.relname='{v}' and cl.relname<>'{v}'"""):
            deps.add((r["relname"], r["relkind"]))
    except RuntimeError as e: print(f"  dep {v}: {str(e)[:80]}")
# quali mancano in app_sales
have={r["table_name"] for r in q(HUB,"select table_name from information_schema.tables where table_schema='app_sales'")}
missing=[(n,k) for (n,k) in deps if n not in have]
print("dipendenze mancanti:",[n for n,_ in missing])
for n,k in missing:
    if k=="r":
        print(f"  migra {n}: {migrate(n)}")
    else:  # vista dep -> ricrea con search_path
        try:
            vd=q(SRC,f"select pg_get_viewdef('public.{n}'::regclass,true) d")[0]["d"]
            q(HUB,f"set search_path to app_sales, public; create or replace view app_sales.{n} as {vd}")
            print(f"  vista-dep {n} OK")
        except RuntimeError as e: print(f"  ✗ vista-dep {n}: {str(e)[:80]}")
# ora crea le 8 viste target
for v in VIEWS:
    try:
        vd=q(SRC,f"select pg_get_viewdef('public.{v}'::regclass,true) d")[0]["d"]
        q(HUB,f"set search_path to app_sales, public; create or replace view app_sales.{v} as {vd}")
        print(f"  vista app_sales.{v} OK")
    except RuntimeError as e: print(f"  ✗ {v}: {str(e)[:90]}")
# qnet a blocchi piccoli
for t in ["qnet_opportunita","qnet_offerta"]:
    try:
        cols=q(SRC,f"select a.attname, format_type(a.atttypid,a.atttypmod) ft from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relname='{t}' and a.attnum>0 and not a.attisdropped order by a.attnum")
        sel=",".join(f'"{c["attname"]}"' for c in cols); rec=", ".join(f'"{c["attname"]}" {c["ft"]}' for c in cols)
        q(HUB,f"truncate app_sales.{t}")
        off=0;P=250;tot=0
        while True:
            data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{t} order by ctid limit {P} offset {off}) x")[0]["j"]
            if not data or data=="[]": break
            q(HUB,f"insert into app_sales.{t} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
            n=len(json.loads(data));tot+=n;off+=P
            if n<P: break
        print(f"  {t}: {tot} righe")
    except RuntimeError as e: print(f"  ✗ {t}: {str(e)[:90]}")
q(HUB,"grant all on all tables in schema app_sales to service_role; notify pgrst, 'reload schema'")
print("FATTO")
