#!/usr/bin/env python3
"""Aggiorna i JSON delle dashboard direttamente dai file Excel in Downloads.

Replica la logica dell'Admin SPA (alias italiano→camelCase + per-BU override)
ma lavora in locale: niente Supabase, niente attesa del cron GitHub.

USO:
  python3 tools/refresh_dashboards_from_xlsx.py            # cerca latest, mostra preview
  python3 tools/refresh_dashboards_from_xlsx.py --apply    # scrive i JSON
  python3 tools/refresh_dashboards_from_xlsx.py --bu FOR   # solo una BU

Per ogni BU cerca in ~/Downloads il file più recente con nome
`commesse_<BU>*.xlsx` e lo proietta nei JSON delle dashboard locali."""
import os, sys, json, glob, re, argparse
from datetime import datetime
try:
    import openpyxl
except ImportError:
    print('Manca openpyxl. Installa con: pip3 install openpyxl', file=sys.stderr)
    sys.exit(1)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DL = os.path.expanduser('~/Downloads')

# ── Output path per BU ──
BU_OUT = {
    'APL_PAL': 'dashboard_APL_PAL_CM/data/commesse_apl_pal.json',
    'APL_RES': 'dashboard_APL_RES_CM/data/commesse_apl_res.json',
    'AVV':     'dashboard_AVV_CM/data/commesse_avv.json',
    'FIA':     'dashboard_FIA_CM/data/commesse_fia.json',
    'FOR':     'dashboard_FOR_CM/data/commesse_for.json',
    'GAR':     'dashboard_GAR_CM/data/commesse_gar.json',
    'GDPR':    'dashboard_GDPR_CM/data/commesse_gdpr.json',
    'ISO':     'dashboard_ISO_CM/data/commesse_iso.json',
    'IST':     'dashboard_IST_CM/data/commesse_ist.json',
    'SIC':     'dashboard_SIC_CM/data/commesse_sic.json',
    'SOA':     'dashboard_SOA_CM/data/commesse_soa.json',
}

# ── Alias italiano→camelCase (mirror di dashboard_ADMIN/config.js) ──
COMMON_ALIASES = {
    'ID': 'id', 'Titolo': 'titolo', 'Contratto': 'contratto', 'ID Contratto': 'idContratto',
    'Tipo Commessa': 'tipoCommessa', 'Cliente': 'cliente', 'Società / Sedi': 'societa',
    'Società Aziendale': 'societa', 'Sede': 'sede', 'Sede Operativa': 'sedeOp',
    'Città': 'citta', 'Regione': 'regione', 'Indirizzo': 'indirizzo',
    'Funzione aziendale': 'funzione', 'Funzione': 'funzione',
    'Status': 'status', 'Stato Lavorazione': 'statoLav', 'Stato Corso': 'statoCorso',
    'Stato Classe': 'statoClasse', 'Stato Pagamento': 'statoPagamento', 'Avanzamento': 'avanzamento',
    'Importo Consulenza': 'consulenza', 'Totale Ricavi': 'ricavi', 'Totale Ricavo': 'ricavi',
    'Totale Costi': 'costi', 'MOL Effettivo': 'mol',
    'Ricavi Documentali': 'ricaviDocum', 'Costi Documentali': 'costiDocum',
    'MOL Documentale': 'molDocum',
    'Ec. Ricavi Cons.': 'ecRicaviCons', 'Ec. Costi Cons.': 'ecCostiCons', 'Ec. MOL Cons.': 'ecMolCons',
    'Già Incassato': 'giaIncassato', 'Da Incassare': 'daIncassare',
    'Fin. Incassi Tot.': 'finIncassiTot', 'Fin. Uscite Tot.': 'finUsciteTot', 'Fin. Delta Tot.': 'finDeltaTot',
    '% Avanzamento Ec.': 'pctAvanzEc', '% Ricavi Economici': 'pctRicaviEc',
    '% Costi Economici': 'pctCostiEc', '% MOL Economico': 'pctMolEc',
    'Importo Ente': 'ente',
    'Agente': 'agente', 'Responsabile': 'responsabile', 'Segnalatore': 'segnalatore',
    'Contatto': 'contatto',
    'Data Inizio': 'dataInizio', 'Data Pian. Inizio': 'dataPianInizio',
    'Data Fine': 'dataFine', 'Data Assegnazione': 'dataAssegnazione',
    'Data Ultima Nota': 'dataUltimaNota', 'Ultima Nota': 'ultimaNota',
    'Descrizione': 'descrizione', 'Note': 'note', 'Link Commessa': 'qnetLink',
    # FOR
    'Corso': 'corso', 'Codice Classe': 'codClasse', 'Totale Ore': 'ore', 'ED': 'ed',
    'Data Esame': 'dataEsame', 'Euro Residuo Effettivo': 'euroResiduo',
    'Num. Discenti': 'numDiscenti', 'Totale Ricevuto Regione': 'totRicevutoRegione',
    'Anticipo Importo': 'anticipoImporto', 'Anticipo Id. Richiesta': 'anticipoIdRichiesta',
    'Anticipo Data Richiesta': 'anticipoDataRichiesta', 'Anticipo € da Decreto': 'anticipoDecreto',
    'Anticipo Data Accredito': 'anticipoDataAccredito',
    'Anticipo Decreto Numero e Data': 'anticipoDecretoNum',
    'Saldo Importo': 'saldoImporto', 'Saldo Id Richiesta': 'saldoIdRichiesta',
    'Saldo Data Richiesta': 'saldoDataRichiesta', 'Saldo € da Decreto': 'saldoDecreto',
    'Saldo Data Accredito': 'saldoDataAccredito', 'Saldo Decreto Numero e Data': 'saldoDecretoNum',
}

ALIASES_BY_BU = {
    'ISO': {
        'Ente di Riferimento': 'isoEnte', 'Scopo proposto': 'isoScopoProposto',
        'Scopo in uscita': 'isoScopoUscita', 'Stato del Certificato': 'isoStatoCert',
        'Urgenza emissione': 'isoUrgenza', 'Settore': 'isoSettore',
        'Intervista in sede': 'isoIntervistaSede', 'Ore Lavorazione': 'isoOreLav',
        'Data Inizio Lavorazione': 'isoDataInizioLav', 'Data Fine Lavorazione': 'isoDataFineLav',
        'Data Verifica': 'isoDataVerifica', 'Data Ultima Chiamata': 'isoDataUltimaChiamata',
        'Accordo sui Pagamenti': 'isoAccordoPagamenti',
    },
    'APL_RES': {
        'Data Inizio Lavorazione': 'aplDataInizioLav', 'Data Fine Lavorazione': 'aplDataFineLav',
        'Numero Risorse': 'aplNumeroRisorse', 'Profilo Risorse': 'aplProfilo',
    },
    'SOA': {
        'Soa Attestante': 'soaAttestante', 'SOA Attestante': 'soaAttestante',
        'Appartenenza Consorzio': 'consorzioFlag', 'Nome del Consorzio': 'consorzio',
        "Nome dell'Ente di Certiifcazione 9001": 'enteCert9001',
        'Scadenza Ente di Certiifcazione 9001': 'scadenzaCert',
    },
    'GAR': {
        'Protocollo': 'garProtocollo', 'Data Inserimento': 'garDataInserimento',
        'Importo Gara': 'garImporto', 'CIG': 'garCIG', 'Data scadenza': 'garDataScadenza',
        'Ente Appaltante': 'garEnte', 'Esito': 'garEsito', 'Note Esito': 'garNoteEsito',
        'Oggetto': 'garOggetto', 'Categoria e Classe Servizi': 'garCategoria',
    },
    'FIA': {
        'Protocollo': 'garProtocollo', 'Data Inserimento': 'garDataInserimento',
        'Importo Gara': 'garImporto', 'CIG': 'garCIG', 'Data scadenza': 'garDataScadenza',
        'Ente Appaltante': 'garEnte', 'Esito': 'garEsito', 'Note Esito': 'garNoteEsito',
    },
    'AVV': {
        'CIG': 'avvCIG', 'Categoria': 'avvCategoria', 'Classifica': 'avvClassifica',
        'Tipo': 'avvTipo', 'Anno': 'avvAnno', 'Esito': 'avvEsito',
    },
    'GDPR': {'Accordo sui Pagamenti': 'gdprAccordo', 'Insoluti': 'gdprInsoluti'},
    'SIC':  {'Ente di Riferimento': 'ente'},
}

def find_latest(bu):
    """Cerca il file più recente in Downloads con pattern commesse_<bu>*.xlsx."""
    patterns = [
        os.path.join(DL, f'commesse_{bu}*.xlsx'),
        os.path.join(DL, f'commesse_{bu.lower()}*.xlsx'),
    ]
    files = []
    for p in patterns: files.extend(glob.glob(p))
    if not files: return None
    return max(files, key=os.path.getmtime)

def alias_record(rec, bu):
    """Applica gli alias (per-BU vince su comune)."""
    by_bu = ALIASES_BY_BU.get(bu, {})
    out = {}
    for k, v in rec.items():
        if k is None: continue
        ks = str(k).strip()
        key = by_bu.get(ks) or COMMON_ALIASES.get(ks) or ks
        if key in out and (out[key] not in ('', None)) and (v in ('', None)): continue
        out[key] = v
    return out

def excel_to_records(xlsx_path):
    """Estrae i record da Excel reale o JSON-mascherato-da-xlsx.
    Qnet a volte esporta JSON salvato con estensione .xlsx (caso SIC).
    Distingue dal magic byte iniziale: zip (Excel) inizia con 'PK',
    JSON inizia con '{' o '['."""
    with open(xlsx_path, 'rb') as f:
        head = f.read(2)
    if head[:1] in (b'{', b'['):
        # JSON travestito
        with open(xlsx_path, encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, dict):
            # Possibili wrapper: {records:[...]}, {data:[...]}, ecc.
            for k in ('records', 'data', 'commesse', 'rows', 'items'):
                if k in data and isinstance(data[k], list):
                    data = data[k]; break
            else:
                data = [data]
        # JSON Qnet ha già le chiavi camelCase → torna grezzo, l'alias non rompe nulla
        return [dict(r) for r in data if isinstance(r, dict)]
    if head != b'PK':
        raise ValueError(f'File non riconosciuto (magic={head!r})')
    wb = openpyxl.load_workbook(xlsx_path, read_only=True, data_only=True)
    ws = wb.active
    headers = []
    rows = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else '' for c in row]
            continue
        rec = {}
        for h, v in zip(headers, row):
            if not h: continue
            if isinstance(v, datetime):
                v = v.strftime('%d-%m-%Y')
            rec[h] = v if v is not None else ''
        rows.append(rec)
    return rows

def process_bu(bu, apply=False):
    xlsx = find_latest(bu)
    if not xlsx:
        print(f'  {bu:8s} SKIP — nessun file commesse_{bu}*.xlsx in Downloads')
        return None
    out_path = os.path.join(ROOT, BU_OUT[bu])
    raw = excel_to_records(xlsx)
    records = []
    for r in raw:
        ar = alias_record(r, bu)
        if not ar.get('id'): continue
        ar['sector'] = bu
        records.append(ar)
    fname = os.path.basename(xlsx)
    old_count = 0
    if os.path.exists(out_path):
        try:
            with open(out_path) as f: old_count = len(json.load(f))
        except Exception: pass
    delta = len(records) - old_count
    sign = '+' if delta >= 0 else ''
    print(f'  {bu:8s} {fname:45s} → {len(records):5d} record ({sign}{delta} vs JSON corrente)')
    if apply:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)
    return records

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='Scrive davvero i JSON (default: solo preview)')
    ap.add_argument('--bu', help='Solo una BU specifica (es. FOR, ISO)')
    args = ap.parse_args()

    bus = [args.bu.upper()] if args.bu else list(BU_OUT.keys())
    print(f'{"APPLY" if args.apply else "PREVIEW"} · refresh JSON dashboard da Excel in {DL}')
    print('=' * 78)
    total = 0
    for bu in bus:
        if bu not in BU_OUT: print(f'  {bu} non riconosciuta'); continue
        r = process_bu(bu, apply=args.apply)
        if r: total += len(r)
    print('=' * 78)
    print(f'Totale record processati: {total}')
    if not args.apply:
        print('\nÈ solo una preview. Per scrivere davvero i JSON: aggiungi --apply')

if __name__ == '__main__':
    main()
