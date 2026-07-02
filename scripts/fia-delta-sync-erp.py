#!/usr/bin/env python3
"""Delta-sync FIA: standalone(public) → bqyqr (hr.* / app_hr.* / public.*).
Upsert per id (colonne intersecate) + delete righe ERP assenti sullo standalone.
Idempotente: da rilanciare nella finestra di flip per il delta finale.
Esclude audit_log (copiato dal job dedicato f4b)."""
import os, json, urllib.request, urllib.error, time, sys

STD_URL = "https://oawroqmqepwcndcbvnba.supabase.co"
STD_KEY = os.environ["FIA_SERVICE_ROLE_KEY"]
TOKEN = os.environ["ACCESS_TOKEN_ACCOUNT"]
ERP = "bqyqrqmbekdhejrzasvv"

# (tabella standalone, schema target su bqyqr)
CONFLICT_KEY = {"app_plans": ["nome"]}
REPLACE_MODE = {}
TABLES = [
  ("incentivi","fia"),("ai_valutazioni","fia"),("fonti","fia"),("geo_province_istat","fia"),
  ("ai_variazioni","app_fia"),("app_audit_logs","app_fia"),("app_bando_tag_history","app_fia"),
  ("app_bando_tags","app_fia"),("app_organization_invites","app_fia"),("app_organization_members","app_fia"),
  ("app_organizations","app_fia"),("app_plans","app_fia"),("app_user_column_preferences","app_fia"),
  ("scraping_reports","app_fia"),("utenti","app_fia"),
]

def rest_get(table, offset, batch=500, order="id.asc"):
    req = urllib.request.Request(
        f"{STD_URL}/rest/v1/{table}?select=*&order=" + order,
        headers={"apikey": STD_KEY, "Authorization": f"Bearer {STD_KEY}",
                 "User-Agent": "curl/8.4.0", "Range-Unit": "items",
                 "Range": f"{offset}-{offset+batch-1}"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

def lit(v, t=None):
    if v is None: return "NULL"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, (list, dict)) and t == "jsonb":
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    if isinstance(v, list):
        if t == "ARRAY" or all(isinstance(x, (str, int, float, bool, type(None))) for x in v):
            if not all(isinstance(x, (str, int, float, bool, type(None))) for x in v):
                return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
            return "'{}'" if not v else "ARRAY[" + ", ".join(lit(x) for x in v) + "]"
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    if isinstance(v, dict): return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"

def run(sql, timeout=180):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ERP}/database/query", data=body,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json",
                 "User-Agent": "curl/8.4.0"}, method="POST")
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def erp_cols(schema, table):
    rows = run(f"select column_name, is_generated, is_identity, data_type from information_schema.columns where table_schema='{schema}' and table_name='{table}'")
    return {r["column_name"]: r for r in rows}

report = []
for table, schema in TABLES:
    try:
        cols_meta = erp_cols(schema, table)
        if not cols_meta:
            report.append((table, "🔴 MANCA su ERP")); continue
        # colonne aggiornabili (no generated)
        key = CONFLICT_KEY.get(table, ["id"])
        keycsv = ",".join(key)
        if table in REPLACE_MODE:
            trigs = REPLACE_MODE[table]
            for tg in trigs: run(f"ALTER TABLE {schema}.{table} DISABLE TRIGGER {tg};")
            run(f"DELETE FROM {schema}.{table};")
        std_ids, offset, first_cols = [], 0, None
        while True:
            rows = rest_get(table, offset, order=".asc,".join(key)+".asc")
            if not rows and offset == 0:
                break
            if rows:
                if first_cols is None:
                    first_cols = [c for c in rows[0].keys() if c in cols_meta and cols_meta[c]["is_generated"] != "ALWAYS"]
                cols = first_cols
                def ins(rr):
                    if not rr: return
                    vals = ",\n".join("(" + ", ".join(lit(x.get(c), cols_meta.get(c,{}).get("data_type")) for c in cols) + ")" for x in rr)
                    upd = ", ".join(f"{c}=EXCLUDED.{c}" for c in cols if c not in key)
                    s = f'INSERT INTO {schema}.{table} ({", ".join(cols)}) OVERRIDING SYSTEM VALUE VALUES\n{vals}\nON CONFLICT ({keycsv}) DO UPDATE SET {upd};' if cols_meta.get("id",{}).get("is_identity")=="YES" else \
                        f'INSERT INTO {schema}.{table} ({", ".join(cols)}) VALUES\n{vals}\nON CONFLICT ({keycsv}) DO UPDATE SET {upd};'
                    try:
                        run(s)
                    except urllib.error.HTTPError as e:
                        if e.code == 413 and len(rr) > 1:
                            m = len(rr)//2; ins(rr[:m]); ins(rr[m:])
                        else: raise
                ins(rows)
                std_ids += [tuple(r[k] for k in key) for r in rows]
                offset += len(rows)
            if not rows or len(rows) < 500: break
        # delete righe ERP non più presenti sullo standalone
        deleted = 0
        if table in REPLACE_MODE:
            for tg in REPLACE_MODE[table]: run(f"ALTER TABLE {schema}.{table} ENABLE TRIGGER {tg};")
        elif std_ids:
            keytuple = "(" + keycsv + ")"
            idlist = ", ".join("(" + ", ".join(lit(x) for x in tup) + ")" for tup in std_ids)
            d = run(f"with del as (delete from {schema}.{table} where {keytuple} not in ({idlist}) returning 1) select count(*) n from del;")
            deleted = d[0]["n"]
        n_erp = run(f"select count(*) n from {schema}.{table};")[0]["n"]
        ok = "✅" if n_erp == len(std_ids) else "🔴"
        report.append((table, f"{ok} std={len(std_ids)} erp={n_erp} del={deleted}"))
    except Exception as e:
        report.append((table, f"🔴 ERRORE: {str(e)[:120]}"))

print("\n=== DELTA-SYNC REPORT ===")
bad = 0
for t, s in report:
    print(f"  {t:42s} {s}")
    if "🔴" in s: bad += 1
print(f"\nESITO: {'✅ TUTTO ALLINEATO' if bad==0 else f'🔴 {bad} tabelle con problemi'}")
sys.exit(1 if bad else 0)
