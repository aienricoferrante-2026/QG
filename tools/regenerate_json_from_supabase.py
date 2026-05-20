#!/usr/bin/env python3
"""Esporta da Supabase qualifica-stw i dataset attuali nei JSON statici
   usati dalle dashboard. Esegue il giro inverso di seed_to_supabase.py.

   Uso:
     python3 tools/regenerate_json_from_supabase.py           # tutte
     python3 tools/regenerate_json_from_supabase.py --only SIC,ISO

   Mappa:
     commesse(bu=X)        → dashboard_X_CM/data/commesse_x.json
     offerte               → dashboard_offerte/data/offerte.json
     opportunita_for       → dashboard_FOR_OPP/data/opportunita_for.json

   La conversione snake_case → camelCase ricompone i JSON come le
   dashboard si aspettano. Le colonne in `meta` JSONB vengono inlinate
   nel record (così le sezioni Caso 2 continuano a vedere isoEnte,
   garCIG, ecc.).
"""
import os, sys, json, re
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)

ENV = {}
for line in open('.env.supabase'):
    line = line.strip()
    if '=' in line and not line.startswith('#'):
        k, v = line.split('=', 1)
        ENV[k.strip()] = v.strip()

SUPABASE_URL = ENV['SUPABASE_URL'].strip().rstrip('/')
# Defensive: se l'utente incolla la secret senza prefisso https://, lo aggiungiamo.
# Idem se per sbaglio ha lasciato `http://` o slash multipli iniziali.
if not SUPABASE_URL.startswith(('http://', 'https://')):
    SUPABASE_URL = 'https://' + SUPABASE_URL.lstrip('/')
SERVICE_KEY = ENV['SUPABASE_SERVICE_ROLE_KEY'].strip()
print(f'[supabase] URL: {SUPABASE_URL[:35]}... (len={len(SUPABASE_URL)})')

BU_OUTPUT = {
    'FOR':     'dashboard_FOR_CM/data/commesse_for.json',
    'ISO':     'dashboard_ISO_CM/data/commesse_iso.json',
    'SIC':     'dashboard_SIC_CM/data/commesse_sic.json',
    'APL_PAL': 'dashboard_APL_PAL_CM/data/commesse_apl_pal.json',
    'GDPR':    'dashboard_GDPR_CM/data/commesse_gdpr.json',
    'SOA':     'dashboard_SOA_CM/data/commesse_soa.json',
    'AVV':     'dashboard_AVV_CM/data/commesse_avv.json',
    'GAR':     'dashboard_GAR_CM/data/commesse_gar.json',
    'FIA':     'dashboard_FIA_CM/data/commesse_fia.json',
    'APL_RES': 'dashboard_APL_RES_CM/data/commesse_apl_res.json',
    'IST':     'dashboard_IST_CM/data/commesse_ist.json',
}


def snake_to_camel(s):
    """avanzamento_raw → avanzamentoRaw"""
    parts = s.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])


# Eccezioni di mapping: alcune colonne snake_case → camelCase non standard
# che le dashboard si aspettano (es. id_contratto → idContratto · è già ok)
SPECIAL_MAP = {
    'sede_norm': 'sedeNorm',
    'sede_op': 'sedeOp',
    'stato_lav': 'statoLav',
    'avanzamento_raw': 'avanzamentoRaw',
    'stato_pagamento': 'statoPagamento',
    'ricavi_docum': 'ricaviDocum',
    'costi_docum': 'costiDocum',
    'mol_docum': 'molDocum',
    'ec_ricavi_cons': 'ecRicaviCons',
    'ec_mol_cons': 'ecMolCons',
    'ec_costi_cons': 'ecCostiCons',
    'gia_incassato': 'giaIncassato',
    'da_incassare': 'daIncassare',
    'fin_incassi_tot': 'finIncassiTot',
    'fin_uscite_tot': 'finUsciteTot',
    'fin_delta_tot': 'finDeltaTot',
    'data_inizio': 'dataInizio',
    'data_pian_inizio': 'dataPianInizio',
    'data_fine': 'dataFine',
    'data_assegnazione': 'dataAssegnazione',
    'data_ultima_nota': 'dataUltimaNota',
    'id_contratto': 'idContratto',
    'tipo_commessa': 'tipoCommessa',
    'ultima_nota': 'ultimaNota',
    'erp_link': 'erpLink',
    'qnet_link': 'qnetLink',
    'corso_interesse': 'corsoInteresse',
    'tipologia_corso': 'tipologiaCorso',
    'stato_prev': 'statoPrev',
    'assegnato_a': 'assegnatoA',
}

SKIP_COLS = {'imported_at', 'bu', 'meta'}


def date_back(s):
    """yyyy-mm-dd → dd-mm-yyyy (formato Qnet che le dashboard si aspettano)."""
    if not s: return s
    m = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})', str(s))
    if m: return f"{int(m.group(3)):02d}-{int(m.group(2)):02d}-{m.group(1)}"
    return s


DATE_FIELDS = {'dataInizio', 'dataPianInizio', 'dataFine', 'dataAssegnazione', 'dataUltimaNota'}


def db_to_camel(row, drop_bu=True):
    """Converte una riga DB (snake_case + meta JSONB) in dict camelCase
       compatibile con le dashboard."""
    out = {}
    for k, v in row.items():
        if k in SKIP_COLS:
            if k == 'meta' and isinstance(v, dict):
                # Inline meta keys (sono già in camelCase, come nel JSON originale)
                for mk, mv in v.items(): out[mk] = mv
            continue
        target = SPECIAL_MAP.get(k, snake_to_camel(k))
        if target in DATE_FIELDS:
            v = date_back(v)
        if v is None: v = ''
        out[target] = v
    return out


def fetch_all(table, filters=''):
    """Scarica TUTTE le righe paginando (Supabase max 1000/req)."""
    SERVICE_BASE = f"{SUPABASE_URL}/rest/v1/{table}"
    PAGE = 1000
    offset = 0
    all_rows = []
    while True:
        url = f"{SERVICE_BASE}?{filters}" if filters else SERVICE_BASE + "?select=*"
        if 'select=' not in url: url += '&select=*'
        url += f"&limit={PAGE}&offset={offset}"
        req = Request(url, headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Range-Unit': 'items',
        })
        try:
            with urlopen(req, timeout=60) as r:
                rows = json.loads(r.read())
        except HTTPError as e:
            print(f'  ERROR HTTP {e.code}: {e.read().decode()[:200]}')
            break
        if not rows: break
        all_rows.extend(rows)
        if len(rows) < PAGE: break
        offset += PAGE
    return all_rows


def export_bu(bu):
    fp = BU_OUTPUT[bu]
    rows = fetch_all('commesse', f'bu=eq.{bu}')
    items = [db_to_camel(r) for r in rows]
    os.makedirs(os.path.dirname(fp), exist_ok=True)
    with open(fp, 'w') as f:
        json.dump(items, f, ensure_ascii=False, separators=(',', ':'))
    print(f'  ✓ {bu}: {len(items)} record → {fp}')


def export_offerte():
    rows = fetch_all('offerte')
    items = [db_to_camel(r) for r in rows]
    fp = 'dashboard_offerte/data/offerte.json'
    if os.path.exists(os.path.dirname(fp)):
        with open(fp, 'w') as f:
            json.dump(items, f, ensure_ascii=False, separators=(',', ':'))
        print(f'  ✓ offerte: {len(items)} record → {fp}')


def export_opp_for():
    rows = fetch_all('opportunita_for')
    items = [db_to_camel(r) for r in rows]
    fp = 'dashboard_FOR_OPP/data/opportunita_for.json'
    if os.path.exists(os.path.dirname(fp)):
        with open(fp, 'w') as f:
            json.dump(items, f, ensure_ascii=False, separators=(',', ':'))
        print(f'  ✓ opportunita_for: {len(items)} record → {fp}')


def main():
    args = sys.argv[1:]
    only = None
    if '--only' in args:
        i = args.index('--only')
        only = set(args[i+1].split(','))
    print('Esporto da Supabase qualifica-stw...')
    for bu in BU_OUTPUT:
        if only and bu not in only and 'OFFERTE' not in only and 'OPP' not in only: continue
        if only and bu not in only: continue
        export_bu(bu)
    if not only or 'OFFERTE' in only:
        export_offerte()
    if not only or 'OPP' in only:
        export_opp_for()
    print('\n✓ Rigenerazione completata.')


if __name__ == '__main__':
    main()
