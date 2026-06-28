#!/usr/bin/env python3
# ============================================================================
# doppio-binario-erp.py — controllo readiness cutover ERP
# ----------------------------------------------------------------------------
# Confronta le SORGENTI LIVE (DB per-app) vs lo SNAPSHOT consolidato bqyqr su
# metriche-ancora per dominio. 0 drift = VERDE = pronti al flip supervisionato.
# Scrive una riga storica in public.erp_doppio_binario_log e stampa l'esito.
#
# Token: ACCESS_TOKEN_ACCOUNT da apps/hub/.env (Management API, mai in runtime app).
# Uso:   python3 doppio-binario-erp.py            (esegue + logga)
#        python3 doppio-binario-erp.py --no-log   (solo stampa)
# ============================================================================
import json, os, sys, urllib.request, re

HUB = "bqyqrqmbekdhejrzasvv"
ENV = os.path.expanduser("~/Desktop/qualifica-platform/apps/hub/.env")

def token():
    for line in open(ENV):
        m = re.match(r'\s*ACCESS_TOKEN_ACCOUNT\s*=\s*["\']?([^"\'\r\n]+)', line)
        if m: return m.group(1).strip()
    sys.exit("NO ACCESS_TOKEN_ACCOUNT in " + ENV)

TOK = token()

def q(ref, sql):
    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{ref}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={"Authorization": f"Bearer {TOK}", "Content-Type": "application/json", "User-Agent": "curl/8"},
        method="POST")
    with urllib.request.urlopen(req, timeout=30) as r:
        d = json.load(r)
    if isinstance(d, list) and d:
        return list(d[0].values())[0]
    return None

# refs sorgente
QCONT="eqprzkdehxustaoeeaoy"; CDG="oentbubusaihnopbqget"; SALES="vqtqccnbwkslbnxlfskk"

# ancore: (dominio, etichetta, ref_sorgente, sql_sorgente, sql_bqyqr)
ANCHORS = [
 ("contabilita","piano_conti",   QCONT,"select count(*) from public.piano_conti","select count(*) from contabilita.piano_conti"),
 ("contabilita","agente_comm",   QCONT,"select count(*) from public.agente_commerciale","select count(*) from contabilita.agente_commerciale"),
 ("contabilita","oda",           QCONT,"select count(*) from public.oda","select count(*) from contabilita.oda"),
 ("contabilita","fornitore",     QCONT,"select count(*) from public.anagrafica","select count(*) from contabilita.fornitore_ext"),
 ("cdg","conto_periodo",         CDG,  "select count(*) from public.conto_periodo","select count(*) from cdg.conto_periodo"),
 ("cdg","sum_importo",           CDG,  "select round(sum(importo)::numeric,2) from public.conto_periodo","select round(sum(importo)::numeric,2) from cdg.conto_periodo"),
 ("commerciale","opportunita",   SALES,"select count(*) from public.opportunita","select count(*) from commerciale.opportunita"),
 ("commerciale","deal",          SALES,"select count(*) from public.deal","select count(*) from commerciale.deal"),
]

dettaglio, ok_n, drift_n = [], 0, 0
for dom, lab, ref, ssql, hsql in ANCHORS:
    s = q(ref, ssql); h = q(HUB, hsql)
    match = str(s) == str(h)
    ok_n += match; drift_n += (not match)
    dettaglio.append({"dominio": dom, "ancora": lab, "sorgente": str(s), "bqyqr": str(h), "ok": match})
    print(f"  [{'OK ' if match else 'DRIFT'}] {dom}.{lab}: sorgente={s}  bqyqr={h}")

verde = drift_n == 0
print(f"\n  ESITO: {'VERDE (0 drift, pronti al flip)' if verde else f'DRIFT su {drift_n} ancore'}  —  {ok_n}/{len(ANCHORS)} ok")

if "--no-log" not in sys.argv:
    payload = json.dumps(dettaglio).replace("'", "''")
    q(HUB, f"insert into public.erp_doppio_binario_log (verde, domini_ok, domini_drift, dettaglio) values ({str(verde).lower()}, {ok_n}, {drift_n}, '{payload}'::jsonb)")
    print("  → riga storica scritta in public.erp_doppio_binario_log")

sys.exit(0 if verde else 1)
