#!/usr/bin/env python3
"""F4b: copia storico audit_log standalone(public) → bqyqr(app_hr.audit_log).
Batch da 500 via REST Range; ON CONFLICT DO NOTHING (riesumabile)."""
import os, json, urllib.request, sys, time

STD_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
STD_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
TOKEN = os.environ["ACCESS_TOKEN_ACCOUNT"]
ERP = "bqyqrqmbekdhejrzasvv"
BATCH = 200

def rest_get(offset):
    req = urllib.request.Request(
        f"{STD_URL}/rest/v1/audit_log?select=*&order=logged_at.asc,id.asc",
        headers={"apikey": STD_KEY, "Authorization": f"Bearer {STD_KEY}",
                 "User-Agent": "curl/8.4.0", "Range-Unit": "items",
                 "Range": f"{offset}-{offset+BATCH-1}"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode())

def sql_lit(v):
    if v is None: return "NULL"
    if isinstance(v, bool): return "true" if v else "false"
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, list):
        if all(isinstance(x, (str, int, float, bool, type(None))) for x in v):
            if not v: return "'{}'"
            return "ARRAY[" + ", ".join(sql_lit(x) for x in v) + "]"
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''").replace("\\u0000","") + "'::jsonb"
    if isinstance(v, dict):
        return "'" + json.dumps(v, ensure_ascii=False).replace("'", "''").replace("\\u0000","") + "'::jsonb"
    return "'" + str(v).replace("'", "''") + "'"

def run_sql(sql):
    body = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ERP}/database/query", data=body,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json",
                 "User-Agent": "curl/8.4.0"}, method="POST")
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.loads(r.read().decode())

COLS = ["id","logged_at","table_name","record_id","operation","actor_email","old_data","new_data","changed_keys"]

# riparti da dove eravamo (conteggio attuale su ERP)
start = run_sql("select count(*) n from app_hr.audit_log where table_name<>'dipendenti' or true;")[0]["n"]
# NB: smoke test era in rollback → count = righe già copiate
offset = start
print(f"riparto da offset={offset}", flush=True)
copied = 0
while True:
    for attempt in range(3):
        try:
            rows = rest_get(offset); break
        except Exception as e:
            if attempt == 2: raise
            time.sleep(3)
    if not rows: break
    values = ",\n".join("(" + ", ".join(sql_lit(r.get(c)) for c in COLS) + ")" for r in rows)
    sql = f'INSERT INTO app_hr.audit_log ({", ".join(COLS)}) VALUES\n{values}\nON CONFLICT (id) DO NOTHING;'
    def insert_rows(rr):
        if not rr: return
        vals = ",\n".join("(" + ", ".join(sql_lit(x.get(c)) for c in COLS) + ")" for x in rr)
        s = f'INSERT INTO app_hr.audit_log ({", ".join(COLS)}) VALUES\n{vals}\nON CONFLICT (id) DO NOTHING;'
        for att in range(3):
            try:
                run_sql(s); return
            except urllib.error.HTTPError as e:
                if e.code == 413 and len(rr) > 1:
                    mid = len(rr)//2
                    insert_rows(rr[:mid]); insert_rows(rr[mid:]); return
                if att == 2: raise
                time.sleep(3)
            except Exception:
                if att == 2: raise
                time.sleep(3)
    try:
        insert_rows(rows)
    except Exception as e:
        print(f"ERRORE batch offset={offset}: {e}", flush=True); sys.exit(1)
    copied += len(rows); offset += len(rows)
    if (offset // BATCH) % 25 == 0:
        print(f"  …{offset} righe", flush=True)
    if len(rows) < BATCH: break

final = run_sql("select count(*) n from app_hr.audit_log;")[0]["n"]
print(f"FINITO: copiate {copied} righe questa run; totale ERP = {final}", flush=True)
