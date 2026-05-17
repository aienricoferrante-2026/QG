#!/usr/bin/env python3
"""Seed iniziale Supabase qualifica-stw: importa i JSON correnti
   delle 11 BU + offerte + opportunita_for in Supabase.

   Idempotente: usa UPSERT con primary key (bu, id) per commesse.

   Uso: python3 tools/seed_to_supabase.py [--clean] [--only BU,BU]
        --clean → TRUNCATE prima del seed
        --only  → solo le BU elencate (es. --only ISO,SOA)
"""
import os, sys, json, re
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)

# Carica .env.supabase
ENV = {}
env_file = '.env.supabase'
if os.path.exists(env_file):
    for line in open(env_file):
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' in line:
            k, v = line.split('=', 1)
            ENV[k.strip()] = v.strip()

SUPABASE_URL = ENV.get('SUPABASE_URL')
SERVICE_KEY = ENV.get('SUPABASE_SERVICE_ROLE_KEY')
if not SUPABASE_URL or not SERVICE_KEY:
    print('ERRORE: SUPABASE_URL o SERVICE_ROLE_KEY mancanti in .env.supabase')
    sys.exit(1)

BU_FILES = {
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

# Colonne fisse della tabella `commesse` (il resto va in meta JSONB)
COMMESSE_FIXED = {
    'cliente','societa','sede','sedeNorm','sedeOp','citta','regione','indirizzo',
    'status','statoLav','avanzamento','avanzamentoRaw','statoPagamento',
    'consulenza','ricavi','mol','costi','ricaviDocum','costiDocum','molDocum',
    'ecRicaviCons','ecMolCons','ecCostiCons','giaIncassato','daIncassare',
    'finIncassiTot','finUsciteTot','finDeltaTot',
    'agente','responsabile','segnalatore','funzione','contatto',
    'dataInizio','dataPianInizio','dataFine','dataAssegnazione','dataUltimaNota',
    'contratto','idContratto','tipoCommessa','titolo','descrizione','note','ultimaNota',
    'erpLink','qnetLink',
}

OFFERTE_FIXED = {'cliente','societa','sede','sede_op','agente','segnalatore',
                 'categoria','tipo','status','funzione','anno','data','data_full','totale'}

OPP_FIXED = {'titolo','cliente','sede','sedeOp','operatore','rendicontazione','corso',
             'corsoInteresse','tipologiaCorso','cpi','provincia','status','statoPrev',
             'fonte','annualita','data','dataUltimaNota','ultimaNota','assegnatoA'}


def parse_date(s):
    """Converte dd-mm-yyyy o yyyy-mm-dd in ISO yyyy-mm-dd, o None."""
    if not s: return None
    s = str(s).strip()
    if not s or s in ('***', '0', '00-00-0000'): return None
    m = re.match(r'^(\d{4})-(\d{1,2})-(\d{1,2})', s)
    if m: return f"{m.group(1)}-{int(m.group(2)):02d}-{int(m.group(3)):02d}"
    m = re.match(r'^(\d{1,2})[-/](\d{1,2})[-/](\d{4})', s)
    if m: return f"{m.group(3)}-{int(m.group(2)):02d}-{int(m.group(1)):02d}"
    return None


def camel_to_snake(name):
    """avanzamentoRaw → avanzamento_raw"""
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', name)
    return s.lower()


def split_record(rec, fixed_cols, date_cols=None):
    """Splitta record in (cols, meta). date_cols → parsate ISO.
       fixed_cols è un set in camelCase (i nomi nei JSON).
       Le chiavi nell'output cols sono in snake_case (i nomi colonna DB)."""
    cols = {}
    meta = {}
    date_cols = date_cols or set()
    for k, v in rec.items():
        if k == 'id': continue
        if k in fixed_cols:
            if k in date_cols: v = parse_date(v)
            elif v in ('', None, '***'): v = None
            cols[camel_to_snake(k)] = v
        else:
            if v not in ('', None, 0, 0.0, '***'):
                meta[k] = v
    return cols, meta


def post_batch(table, records):
    """Upsert batch via PostgREST."""
    if not records: return
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={'bu,id' if table=='commesse' else 'id'}"
    headers = {
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal',
    }
    body = json.dumps(records).encode('utf-8')
    req = Request(url, data=body, headers=headers, method='POST')
    try:
        with urlopen(req, timeout=60) as r:
            return r.status
    except HTTPError as e:
        err = e.read().decode('utf-8', errors='ignore')
        print(f'  ERRORE batch {table}: HTTP {e.code} · {err[:200]}')
        return None


def truncate(table):
    print(f'  TRUNCATE {table}…')
    url = f"https://api.supabase.com/v1/projects/{ENV['SUPABASE_PROJECT_REF']}/database/query"
    body = json.dumps({'query': f'truncate table public.{table};'}).encode()
    req = Request(url, data=body, headers={
        'Authorization': f"Bearer {ENV['ACCESS_TOKEN_ACCOUNT']}",
        'Content-Type': 'application/json',
    }, method='POST')
    try:
        with urlopen(req, timeout=30) as r:
            return r.status
    except HTTPError as e:
        print(f'  truncate error: HTTP {e.code} · {e.read().decode()[:200]}')


DATE_COLS_COMM = {'dataInizio','dataPianInizio','dataFine','dataAssegnazione','dataUltimaNota'}


def seed_commesse(only_bus=None):
    for bu, fp in BU_FILES.items():
        if only_bus and bu not in only_bus: continue
        if not os.path.exists(fp):
            print(f'⚠ {bu}: file {fp} non trovato'); continue
        with open(fp) as f:
            items = json.load(f)
        print(f'\n=== {bu} · {len(items)} record da {fp} ===')
        batch = []
        ok = 0; err = 0
        for c in items:
            cols, meta = split_record(c, COMMESSE_FIXED, DATE_COLS_COMM)
            rec = {'bu': bu, 'id': str(c.get('id', '')), **cols, 'meta': meta}
            batch.append(rec)
            if len(batch) >= 500:
                if post_batch('commesse', batch): ok += len(batch)
                else: err += len(batch)
                batch = []
        if batch:
            if post_batch('commesse', batch): ok += len(batch)
            else: err += len(batch)
        print(f'  ✓ {ok} upsert · ✗ {err} errori')


def seed_offerte():
    fp = 'dashboard_offerte/data/offerte.json'
    if not os.path.exists(fp): return
    with open(fp) as f: items = json.load(f)
    print(f'\n=== Offerte · {len(items)} record ===')
    batch = []; ok = 0; err = 0
    for c in items:
        cols, meta = split_record(c, OFFERTE_FIXED)
        rec = {'id': str(c.get('id', '')), **cols, 'meta': meta}
        batch.append(rec)
        if len(batch) >= 500:
            if post_batch('offerte', batch): ok += len(batch)
            else: err += len(batch)
            batch = []
    if batch:
        if post_batch('offerte', batch): ok += len(batch)
        else: err += len(batch)
    print(f'  ✓ {ok} upsert · ✗ {err} errori')


def seed_opp():
    fp = 'dashboard_FOR_OPP/data/opportunita_for.json'
    if not os.path.exists(fp): return
    with open(fp) as f: items = json.load(f)
    print(f'\n=== Opportunita FOR · {len(items)} record ===')
    batch = []; ok = 0; err = 0
    for c in items:
        cols, meta = split_record(c, OPP_FIXED)
        rec = {'id': str(c.get('id', '')), **cols, 'meta': meta}
        batch.append(rec)
        if len(batch) >= 500:
            if post_batch('opportunita_for', batch): ok += len(batch)
            else: err += len(batch)
            batch = []
    if batch:
        if post_batch('opportunita_for', batch): ok += len(batch)
        else: err += len(batch)
    print(f'  ✓ {ok} upsert · ✗ {err} errori')


def main():
    args = sys.argv[1:]
    clean = '--clean' in args
    only_bus = None
    if '--only' in args:
        i = args.index('--only')
        if i+1 < len(args):
            only_bus = set(args[i+1].split(','))
    if clean:
        print('CLEAN: truncate tabelle…')
        truncate('commesse'); truncate('offerte'); truncate('opportunita_for')
    seed_commesse(only_bus)
    if not only_bus:
        seed_offerte()
        seed_opp()
    print('\n✓ Seed completato.')


if __name__ == '__main__':
    main()
