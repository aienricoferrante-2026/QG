#!/usr/bin/env python3
"""Delta-sync HR: standalone(public) → bqyqr (hr.* / app_hr.* / public.*).
Upsert per id (colonne intersecate) + delete righe ERP assenti sullo standalone.
Idempotente: da rilanciare nella finestra di flip per il delta finale.
Esclude audit_log (copiato dal job dedicato f4b)."""
import os, json, urllib.request, urllib.error, time, sys

STD_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
STD_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
TOKEN = os.environ["ACCESS_TOKEN_ACCOUNT"]
ERP = "bqyqrqmbekdhejrzasvv"

# (tabella standalone, schema target su bqyqr)
# chiave di conflitto se non "id"
CONFLICT_KEY = {"configurazioni": ["chiave"], "onboarding_alerts_sent": ["dip_step_key","soglia_giorni"]}
# tabelle da sincronizzare con TRUNCATE+INSERT (id driftati vs unique naturale); trigger sospesi
REPLACE_MODE = {"dipendente_funzione_aziendale": ["trg_guard_ultima_fa","tr_sync_dip_fa_principale"]}
TABLES = [
  # nucleo hr (viste app_hr → hr.*)
  ("societa","hr"),("commesse","hr"),("funzioni_aziendali","hr"),("sedi","hr"),
  ("mansioni","hr"),("dipendenti","hr"),("mansioni_dipendente","hr"),
  ("organigramma_unita","hr"),("organigramma_ruolo","hr"),("organigramma_assegnazione","hr"),
  ("costi_personale_periodo","hr"),("allocazioni_costo","hr"),("kpi_master","hr"),
  # tabelle proprie app_hr
  ("reparti","app_hr"),("mansione","app_hr"),("attivita","app_hr"),("attivita_mansione","app_hr"),
  ("dipendente_funzione_aziendale","app_hr"),("dipendente_mansione","app_hr"),
  ("dipendente_attivita_esclusa","app_hr"),("documenti_master","app_hr"),("documenti_assegnati","app_hr"),
  ("corsi_master","app_hr"),("richieste","app_hr"),("presenze","app_hr"),("notifiche","app_hr"),
  ("configurazioni","app_hr"),("commessa_progetto","app_hr"),("organigramma_audit","app_hr"),
  ("qnet_import_log","app_hr"),("hr_qnet_sync_log","app_hr"),
  ("import_allocazioni_batch","app_hr"),("import_costi_batch","app_hr"),
  ("onboarding_dipendente","app_hr"),("onboarding_dipendente_step","app_hr"),("onboarding_step","app_hr"),
  ("onboarding_alerts_sent","app_hr"),
  # 13 nuove
  ("competenze","app_hr"),("competenze_dipendente","app_hr"),("competenze_mansione","app_hr"),
  ("contenuti_wiki","app_hr"),("corsi_assegnati","app_hr"),("kpi_compilati","app_hr"),
  ("mansioni_dipendente_attivita_esclusa","app_hr"),("onboarding_modelli","app_hr"),
  ("onboarding_step_completamenti","app_hr"),("utenti_cancellati","app_hr"),
  ("voce_extra_mese","app_hr"),("voci_extra_mese","app_hr"),("segnatempo","app_hr"),
  # condivise in public
  ("entita_nota","public"),
]

def rest_get(table, offset, batch=500, order="id.asc"):
    req = urllib.request.Request(
        f"{STD_URL}/rest/v1/{table}?select=*&order=" + order,
        headers={"apikey": STD_KEY, "Authorization": f"Bearer {STD_KEY}",
                 "User-Agent": "curl/8.4.0", "Range-Unit": "items",
                 "Range": f"{offset}-{offset+batch-1}"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

def lit(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int, float, bool, type(None))) for x in v):
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
    rows = run(f"select column_name, is_generated, is_identity from information_schema.columns where table_schema='{schema}' and table_name='{table}'")
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
                    vals = ",\n".join("(" + ", ".join(lit(x.get(c)) for c in cols) + ")" for x in rr)
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
