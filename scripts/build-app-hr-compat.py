#!/usr/bin/env python3
# Costruisce app_hr in bqyqr per il flip dell'app HR (apps/hr).
# - 14 oggetti gia consolidati -> VISTE (cross-schema: hr/public/commesse/cdg)
# - 24 tabelle operative HR -> tabelle reali (DDL fedele: tipi format_type, default sicuri, PK)
# - RLS abilitata 0-policy (come sorgente, PII: solo service_role) + grant service_role
# Additivo/idempotente. NON tocca l'app HR. Le funzioni/trigger si fanno a parte.
import json, os, re, sys, urllib.request

ENV = os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")
TOK = next((re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)', l).group(1).strip()
            for l in open(ENV) if l.startswith("ACCESS_TOKEN_ACCOUNT")), None)
HR, HUB = "hsoovytrzxcllbawpvwt", "bqyqrqmbekdhejrzasvv"

import time
def q(ref, sql):
    for attempt in range(5):
        req = urllib.request.Request(f"https://api.supabase.com/v1/projects/{ref}/database/query",
            data=json.dumps({"query": sql}).encode(),
            headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json", "User-Agent": "curl/8"})
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            body = e.read().decode()[:300]
            if e.code in (429,500,502,503,504) and attempt < 4:
                time.sleep(2 + attempt*2); continue
            raise RuntimeError(body)
        except urllib.error.URLError:
            if attempt < 4: time.sleep(2 + attempt*2); continue
            raise

# 14 viste: oggetto -> schema bqyqr
VIEWS = {
  "costi_personale_periodo":"hr","dipendenti":"hr","funzioni_aziendali":"hr","mansioni":"hr",
  "mansioni_dipendente":"hr","organigramma_assegnazione":"hr","organigramma_ruolo":"hr",
  "organigramma_unita":"hr","sedi":"hr","audit_log":"public","entita_nota":"public",
  "struttura_gerarchia":"public","commesse":"commesse","societa":"cdg",
}
OPERATIVE = ["attivita","attivita_mansione","commessa_progetto","configurazioni","corsi_master",
  "dipendente_attivita_esclusa","dipendente_funzione_aziendale","dipendente_mansione",
  "documenti_assegnati","documenti_master","import_allocazioni_batch","import_costi_batch",
  "mansione","notifiche","onboarding_alerts_sent","onboarding_dipendente","onboarding_dipendente_step",
  "onboarding_step","organigramma_audit","presenze","qnet_import_log","reparti","richieste","hr_qnet_sync_log"]

# nomi dei tipi enum nel DB sorgente (per togliere i cast nei default)
ENUMS = [r["t"] for r in q(HR, "select t.typname t from pg_type t join pg_namespace n on n.oid=t.typnamespace where n.nspname='public' and t.typtype='e'")]

def safe_default(d):
    if d is None: return None
    if "nextval" in d: return None                      # sequence: salta (id passati dai dati)
    d = d.replace("uuid_generate_v4()", "gen_random_uuid()")
    for e in ENUMS:                                      # 'x'::enum -> 'x' (colonna text)
        d = d.replace(f"::{e}", "")
    return d

q(HUB, "create schema if not exists app_hr")
print("schema app_hr ok")

# 1) viste
for obj, sch in VIEWS.items():
    q(HUB, f"create or replace view app_hr.{obj} as select * from {sch}.{obj}")
print(f"  {len(VIEWS)} viste create")

# 2) operative: DDL fedele + dati
for t in OPERATIVE:
    cols = q(HR, f"""select a.attname, format_type(a.atttypid,a.atttypmod) ft, a.attnotnull,
                     pg_get_expr(ad.adbin, ad.adrelid) def, t.typtype
                     from pg_attribute a join pg_class c on c.oid=a.attrelid
                     join pg_namespace n on n.oid=c.relnamespace
                     join pg_type t on t.oid=a.atttypid
                     left join pg_attrdef ad on ad.adrelid=a.attrelid and ad.adnum=a.attnum
                     where n.nspname='public' and c.relname='{t}' and a.attnum>0 and not a.attisdropped
                     order by a.attnum""")
    if not cols:
        print(f"  SKIP {t} (assente)"); continue
    defs = []
    for c in cols:
        ft = c["ft"]
        if c["typtype"] == "e":          # enum sorgente -> text (no dipendenza tipo)
            ft = "text"
        line = f'"{c["attname"]}" {ft}'
        if c["attnotnull"]: line += " not null"
        dd = safe_default(c["def"])
        if dd: line += f" default {dd}"
        defs.append(line)
    pk = q(HR, f"""select string_agg(a.attname,',' order by array_position(i.indkey,a.attnum)) k
                   from pg_index i join pg_class c on c.oid=i.indrelid join pg_namespace n on n.oid=c.relnamespace
                   join pg_attribute a on a.attrelid=c.oid and a.attnum=any(i.indkey)
                   where n.nspname='public' and c.relname='{t}' and i.indisprimary""")
    pkcol = pk[0]["k"] if pk and pk[0]["k"] else None
    ddl = f'create table app_hr.{t} ({", ".join(defs)}' + (f', primary key ({pkcol})' if pkcol else '') + ')'
    try:
        q(HUB, f"drop table if exists app_hr.{t} cascade")
        q(HUB, ddl)
        q(HUB, f"alter table app_hr.{t} enable row level security")   # come sorgente (0 policy = solo service_role)
        colnames = [c["attname"] for c in cols]
        sel = ",".join(f'"{c}"' for c in colnames)
        rows = q(HR, f"select coalesce(jsonb_agg(row_to_json(x)::jsonb),'[]'::jsonb)::text j from (select {sel} from public.{t}) x")
        data = rows[0]["j"]; n = 0
        if data and data != "[]":
            recdef = ", ".join(f'"{c["attname"]}" {("text" if c["typtype"]=="e" else c["ft"])}' for c in cols)
            q(HUB, f"insert into app_hr.{t} ({sel}) select {sel} from jsonb_to_recordset($j${data}$j$::jsonb) as r({recdef})")
            n = len(json.loads(data))
        print(f"  tab app_hr.{t}: {len(cols)} col, pk={pkcol}, {n} righe")
    except RuntimeError as e:
        print(f"  ✗ FALLITA {t}: {e}")
        print(f"     DDL: {ddl[:200]}")

# 3) grant service_role su app_hr + schemi sottostanti
q(HUB, "grant usage on schema app_hr, hr, commesse, cdg to service_role; "
       "grant all on all tables in schema app_hr to service_role; "
       "grant all on all tables in schema hr, commesse, cdg to service_role; "
       "alter default privileges in schema app_hr grant all on tables to service_role")
q(HUB, "notify pgrst, 'reload schema'")
nv = q(HUB, "select count(*) n from information_schema.views where table_schema='app_hr'")[0]["n"]
nt = q(HUB, "select count(*) n from information_schema.tables where table_schema='app_hr' and table_type='BASE TABLE'")[0]["n"]
print(f"\nOK app_hr: {nv} viste + {nt} tabelle operative (funzioni/trigger separati)")
