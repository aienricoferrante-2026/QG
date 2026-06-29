#!/usr/bin/env python3
# Builder GENERICO v2: app_<app> in bqyqr = copia-piena schema sorgente (estensione).
# Crea enum custom -> migra tabelle (copia-piena, colonne generate, enum-default, chunk adattivo)
# -> crea viste/matview (search_path). Funzioni/trigger: port-logic-v2.py a parte.
# Uso: python3 build-app-v2.py <app> <src_ref> <objs_file>
import json, os, re, sys, time, socket, urllib.request
APP, SRC, OBJF = sys.argv[1], sys.argv[2], sys.argv[3]
S=f"app_{APP}"
ENV=os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK=next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)',l).group(1).strip() for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")),None)
HUB="bqyqrqmbekdhejrzasvv"
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
objs=[o.strip() for o in open(OBJF) if o.strip()]
kind={r["relname"]:r["relkind"] for r in q(SRC,f"select relname,relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname=any(string_to_array('{','.join(objs)}',','))")}
q(HUB,f"create schema if not exists {S}")
# 1) enum custom
enums=q(SRC,"""select t.typname, string_agg(quote_literal(e.enumlabel),',' order by e.enumsortorder) vals from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and not exists (select 1 from pg_depend d where d.objid=t.oid and d.deptype='e') group by 1""")
ENUMS=[e["typname"] for e in enums]
for e in enums:
    try: q(HUB,f"do $$ begin if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='{S}' and t.typname='{e['typname']}') then create type {S}.{e['typname']} as enum ({e['vals']}); end if; end $$;")
    except RuntimeError: pass
print(f"enum: {len(enums)}")
def sd(d):
    if d is None: return None
    if "nextval" in d: return None
    d=d.replace("uuid_generate_v4()","gen_random_uuid()")
    for e in ENUMS: d=re.sub(rf"::(public\.)?{e}\b", f"::{S}.{e}", d)
    return d
# 2) tabelle copia-piena
nt=nv=0; fails=[]; views_pending=[]
for o in objs:
    k=kind.get(o)
    if k in ("v","m"): views_pending.append(o); continue
    if k!="r": continue
    try:
        cols=q(SRC,f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull, pg_get_expr(ad.adbin,ad.adrelid) def, t.typtype, t.typname, a.attgenerated gen
          from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid
          left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum where n.nspname='public' and c.relname='{o}' and a.attnum>0 and not a.attisdropped order by a.attnum""")
        if not cols: continue
        defs=[]
        for c in cols:
            ft=f"{S}.{c['typname']}" if c["typtype"]=="e" else c["ft"]
            ln=f'"{c["attname"]}" {ft}'+(" not null" if c["attnotnull"] else "")
            dd=None if c.get("gen") else sd(c["def"]); ln+=f" default {dd}" if dd else ""
            defs.append(ln)
        pk=q(SRC,f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey) where n.nspname='public' and c.relname='{o}' and i.indisprimary""")
        pkc=pk[0]["k"] if pk and pk[0]["k"] else None
        q(HUB,f"drop view if exists {S}.{o} cascade"); q(HUB,f"drop table if exists {S}.{o} cascade")
        q(HUB,f'create table {S}.{o} ({", ".join(defs)}'+(f', primary key ({pkc})' if pkc else '')+')')
        q(HUB,f"alter table {S}.{o} enable row level security")
        sel=",".join(f'"{c["attname"]}"' for c in cols)
        rec=", ".join(f'"{c["attname"]}" {((S+"."+c["typname"]) if c["typtype"]=="e" else c["ft"])}' for c in cols)
        off=0;P=2000;tot=0
        while True:
            try:
                data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{o} order by ctid limit {P} offset {off}) x")[0]["j"]
                if not data or data=="[]": break
                q(HUB,f"insert into {S}.{o} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
            except RuntimeError as e:
                if "too large" in str(e).lower() and P>25: P=max(25,P//2); continue
                raise
            n=len(json.loads(data));tot+=n;off+=P
            if n<P: break
        nt+=1
    except RuntimeError as e: fails.append((o,str(e)[:90]))
# 3) viste/matview
for o in views_pending:
    try:
        vd=q(SRC,f"select pg_get_viewdef('public.{o}'::regclass,true) d")[0]["d"]
        q(HUB,f"set search_path to {S}, public; create or replace view {S}.{o} as {vd}"); nv+=1
    except RuntimeError as e: fails.append((o,str(e)[:90]))
# grants
q(HUB,f"grant usage on schema {S} to service_role; grant all on all tables in schema {S} to service_role; alter default privileges in schema {S} grant all on tables to service_role")
q(HUB,"notify pgrst, 'reload schema'")
print(f"{S}: {nt} tabelle + {nv} viste; {len(fails)} fallite")
for o,e in fails: print(f"  ✗ {o}: {e}")
