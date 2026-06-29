#!/usr/bin/env python3
# Builder GENERICO data-layer app_<app> in bqyqr (riusabile sales/qcont/...).
# Per ogni oggetto referenziato dall'app:
#  - tabella gia in bqyqr (commerciale/public/commesse/cdg/hr) -> VISTA
#  - tabella NON in bqyqr -> migra come tabella operativa (DDL fedele + dati)
#  - vista/matview sorgente -> ricrea come VISTA in app_<app> (search_path)
# Funzioni/trigger: NON toccate qui (porting separato, delicato).
# Uso: python3 build-app-compat.py <app> <source_ref> <objs_file>
import json, os, re, sys, time, socket, urllib.request

APP, SRC, OBJF = sys.argv[1], sys.argv[2], sys.argv[3]
SCHEMA = f"app_{APP}"
ENV = os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK = next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)', l).group(1).strip()
            for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")), None)
HUB = "bqyqrqmbekdhejrzasvv"
SEARCH = ["commerciale","public","commesse","cdg","hr","formazione","contabilita","fia","sedi_partner"]

def q(ref, sql):
    for a in range(5):
        req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",
            data=json.dumps({"query": sql}).encode(),
            headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json", "User-Agent": "curl/8"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)
        except urllib.error.HTTPError as e:
            b = e.read().decode()[:300]
            if e.code in (429,500,502,503,504) and a<4: time.sleep(2+a*2); continue
            raise RuntimeError(b)
        except (urllib.error.URLError, socket.timeout, TimeoutError):
            if a<4: time.sleep(2+a*2); continue
            raise

objs = [o.strip() for o in open(OBJF) if o.strip()]
# relkind nel sorgente
src = {r["relname"]: r["relkind"] for r in q(SRC,
    f"select relname, relkind from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname = any(string_to_array('{','.join(objs)}',','))")}
# dove esistono in bqyqr
inhub = {}
for r in q(HUB, f"select table_schema, table_name from information_schema.tables where table_name = any(string_to_array('{','.join(objs)}',',')) and table_schema = any(array{SEARCH})"):
    inhub.setdefault(r["table_name"], r["table_schema"])

ENUMS = [r["t"] for r in q(SRC, "select t.typname t from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'")]
def safe_def(d):
    if d is None: return None
    if "nextval" in d: return None
    d = d.replace("uuid_generate_v4()", "gen_random_uuid()")
    for e in ENUMS: d = d.replace(f"::{e}", "").replace(f" {e}", " text")
    return d

q(HUB, f"create schema if not exists {SCHEMA}")
nv=nt=nm=skip=0; fails=[]
for o in objs:
    k = src.get(o)
    try:
        if o in inhub:                                   # gia consolidato -> vista
            q(HUB, f"create or replace view {SCHEMA}.{o} as select * from {inhub[o]}.{o}"); nv+=1
        elif k in ("v","m"):                             # vista/matview sorgente -> vista
            vd = q(SRC, f"select pg_get_viewdef('public.{o}'::regclass, true) d")[0]["d"]
            q(HUB, f"create or replace view {SCHEMA}.{o} as {vd}"); nm+=1
        elif k == "r":                                   # tabella operativa -> migra
            cols = q(SRC, f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull,
                pg_get_expr(ad.adbin,ad.adrelid) def, t.typtype from pg_attribute a
                join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace
                join pg_type t on t.oid=a.atttypid left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum
                where n.nspname='public' and c.relname='{o}' and a.attnum>0 and not a.attisdropped order by a.attnum""")
            defs=[]
            for c in cols:
                ft = "text" if c["typtype"]=="e" else c["ft"]
                ln = f'"{c["attname"]}" {ft}' + (" not null" if c["attnotnull"] else "")
                dd = safe_def(c["def"]);  ln += f" default {dd}" if dd else ""
                defs.append(ln)
            pk = q(SRC, f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k
                from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace
                join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey)
                where n.nspname='public' and c.relname='{o}' and i.indisprimary""")
            pkc = pk[0]["k"] if pk and pk[0]["k"] else None
            q(HUB, f"drop table if exists {SCHEMA}.{o} cascade")
            q(HUB, f'create table {SCHEMA}.{o} ({", ".join(defs)}' + (f', primary key ({pkc})' if pkc else '') + ')')
            q(HUB, f"alter table {SCHEMA}.{o} enable row level security")
            sel=",".join(f'"{c["attname"]}"' for c in cols)
            rec=", ".join(f'"{c["attname"]}" {("text" if c["typtype"]=="e" else c["ft"])}' for c in cols)
            off=0; PAGE=2000                              # trasferimento a blocchi (tabelle grandi)
            while True:
                data=q(SRC, f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{o} order by ctid limit {PAGE} offset {off}) x")[0]["j"]
                if not data or data=="[]": break
                q(HUB, f"insert into {SCHEMA}.{o} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({rec})")
                cnt=len(json.loads(data)); off+=PAGE
                if cnt<PAGE: break
            nt+=1
        else:
            skip+=1                                       # funzione o inesistente
    except RuntimeError as e:
        fails.append((o, str(e)[:120]))
q(HUB, f"grant usage on schema {SCHEMA} to service_role; grant all on all tables in schema {SCHEMA} to service_role; alter default privileges in schema {SCHEMA} grant all on tables to service_role")
for s in SEARCH:
    q(HUB, f"grant usage on schema {s} to service_role; grant all on all tables in schema {s} to service_role")
q(HUB, "notify pgrst, 'reload schema'")
print(f"{SCHEMA}: {nv} viste(consolidato) + {nm} viste(da-vista-sorgente) + {nt} tabelle-operative migrate; {skip} skip(funzioni/assenti)")
if fails:
    print("FALLITI:")
    for o,e in fails: print(f"  ✗ {o}: {e}")
