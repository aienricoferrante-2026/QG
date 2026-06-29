#!/usr/bin/env python3
# Crea enum custom in app_sales + converte le ultime viste in copia-piena.
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

# 1) enum custom (non da estensione) -> crea in app_sales
enums=q(SRC,"""select t.typname, string_agg(quote_literal(e.enumlabel),',' order by e.enumsortorder) vals
  from pg_type t join pg_enum e on e.enumtypid=t.oid join pg_namespace n on n.oid=t.typnamespace
  where n.nspname='public' and not exists (select 1 from pg_depend d where d.objid=t.oid and d.deptype='e')
  group by 1 order by 1""")
oke=0
for en in enums:
    try:
        q(HUB,f"do $$ begin if not exists (select 1 from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='app_sales' and t.typname='{en['typname']}') then create type app_sales.{en['typname']} as enum ({en['vals']}); end if; end $$;")
        oke+=1
    except RuntimeError as ex: print(f"  ✗ enum {en['typname']}: {str(ex)[:80]}")
print(f"enum app_sales: {oke}/{len(enums)} creati")

# 2) converti le ultime viste in copia-piena
ENUMS=[en["typname"] for en in enums]
def sd(d):
    if d is None: return None
    if "nextval" in d: return None
    d=d.replace("uuid_generate_v4()","gen_random_uuid()")
    for e in ENUMS: d=re.sub(rf"::(public\.)?{e}\b", f"::app_sales.{e}", d)   # qualifica cast enum
    return d
FORCE=["offerta"]   # tabelle gia create ma da ri-migrare (dati incompleti)
views=[r["relname"] for r in q(HUB,"select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='app_sales' and c.relkind='v'")]+FORCE
print("converto:",views)
for o in views:
    kk=q(SRC,f"select relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname='{o}'")
    if not kk or kk[0]["relkind"]!="r":      # in sorgente non e' tabella (es. _vw, contatti) -> lascia vista
        print(f"  skip {o} (non tabella in sorgente)"); continue
    cols=q(SRC,f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull, pg_get_expr(ad.adbin,ad.adrelid) def, t.typtype, t.typname, a.attgenerated gen
      from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace join pg_type t on t.oid=a.atttypid
      left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum where n.nspname='public' and c.relname='{o}' and a.attnum>0 and not a.attisdropped order by a.attnum""")
    defs=[]
    for c in cols:
        ft = f"app_sales.{c['typname']}" if c["typtype"]=="e" else c["ft"]   # usa enum app_sales
        ln=f'"{c["attname"]}" {ft}'+(" not null" if c["attnotnull"] else "")
        dd=None if c.get("gen") else sd(c["def"])   # colonna generata -> colonna semplice (copio valore)
        ln+=f" default {dd}" if dd else ""
        defs.append(ln)
    pk=q(SRC,f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey) where n.nspname='public' and c.relname='{o}' and i.indisprimary""")
    pkc=pk[0]["k"] if pk and pk[0]["k"] else None
    q(HUB,f"drop view if exists app_sales.{o} cascade")
    q(HUB,f"drop table if exists app_sales.{o} cascade")
    q(HUB,f'create table app_sales.{o} ({", ".join(defs)}'+(f', primary key ({pkc})' if pkc else '')+')')
    q(HUB,f"alter table app_sales.{o} enable row level security")
    sel=",".join(f'"{c["attname"]}"' for c in cols)
    rec=", ".join(f'"{c["attname"]}" {(("app_sales."+c["typname"]) if c["typtype"]=="e" else c["ft"])}' for c in cols)
    off=0;P=2000;tot=0
    while True:
        try:
            data=q(SRC,f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{o} order by ctid limit {P} offset {off}) x")[0]["j"]
            if not data or data=="[]": break
            q(HUB,f"insert into app_sales.{o} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
        except RuntimeError as e:
            if "too large" in str(e).lower() and P>25: P=max(25,P//2); continue
            raise
        n=len(json.loads(data));tot+=n;off+=P
        if n<P: break
    print(f"  {o}: {tot} righe")
q(HUB,"grant all on all tables in schema app_sales to service_role; grant usage on schema app_sales to service_role; notify pgrst, 'reload schema'")
print("FATTO")
