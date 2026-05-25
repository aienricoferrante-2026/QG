#!/usr/bin/env python3
"""Genera docs/CAMPI_API_REFERENCE.md con TUTTI i campi usati nelle dashboard.

Fonti:
1. dashboard_ADMIN/config.js → mapping alias italiano→camelCase
2. dashboard_*/data/*.json → chiavi effettive + tipo + esempi valori
3. dashboard_*/js/section-*.js → quali campi usa effettivamente ciascuna BU

Output: docs/CAMPI_API_REFERENCE.md (markdown navigabile)."""
import os, re, json, sys
from collections import defaultdict
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JSON_PATHS = {
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
    'OFFERTE': 'dashboard_offerte/data/offerte.json',
    'OPP_FOR': 'dashboard_FOR_OPP/data/opportunita_for.json',
}

# Descrizioni umane per le chiavi più importanti
DESC = {
    'id': 'ID univoco Qnet della commessa',
    'titolo': 'Titolo descrittivo della commessa',
    'contratto': 'Codice contratto',
    'idContratto': 'ID Qnet del contratto',
    'tipoCommessa': 'Tipologia commessa (es. Lavorazione, Progetto interno)',
    'cliente': 'Ragione sociale cliente',
    'societa': 'Società Gruppo Qualifica che eroga (15 società)',
    'sede': 'Sede legale cliente (Excel)',
    'sedeOp': 'Sede operativa cliente',
    'sedeNorm': 'Sede normalizzata (post-elaborazione)',
    'citta': 'Città cliente',
    'regione': 'Regione cliente',
    'indirizzo': 'Indirizzo cliente',
    'funzione': 'Funzione aziendale (linea di business)',
    'status': 'Status macro (In Lavorazione, Concluso, Annullato, ecc.)',
    'statoLav': 'Stato lavorazione interno (workflow di dettaglio)',
    'statoCorso': 'Stato del corso (FOR-specifico)',
    'statoClasse': 'Stato della classe corso (FOR-specifico)',
    'statoPagamento': 'Stato pagamento commessa',
    'avanzamento': '% avanzamento dichiarato (0-100)',
    'avanzamentoRaw': 'Avanzamento numerico raw',
    'consulenza': 'Importo consulenza (€)',
    'ricavi': 'Totale ricavi (€)',
    'costi': 'Totale costi (€)',
    'mol': 'Margine Operativo Lordo (€)',
    'ricaviDocum': 'Ricavi documentali fatturati (€)',
    'costiDocum': 'Costi documentali ricevuti (€)',
    'molDocum': 'MOL documentale (€)',
    'ecRicaviCons': 'Ricavi economici consuntivati (€)',
    'ecCostiCons': 'Costi economici consuntivati (€)',
    'ecMolCons': 'MOL economico consuntivato (€)',
    'giaIncassato': 'Importo già incassato (€)',
    'daIncassare': 'Importo da incassare (€)',
    'finIncassiTot': 'Totale incassi finanziari (€)',
    'finUsciteTot': 'Totale uscite finanziarie (€)',
    'finDeltaTot': 'Delta finanziario (€)',
    'pctAvanzEc': '% Avanzamento economico',
    'pctRicaviEc': '% Ricavi economici sul totale',
    'pctCostiEc': '% Costi economici sul totale',
    'pctMolEc':   '% MOL economico sul totale',
    'ente': 'Importo Ente certificatore / pagato all\'ente (€)',
    'agente': 'Commerciale partecipante (referente vendita)',
    'responsabile': 'Tecnico responsabile esecuzione',
    'segnalatore': 'Rete segnalatore (chi ha portato il lead)',
    'contatto': 'Contatto operativo cliente',
    'dataInizio': 'Data inizio effettiva (dd-mm-yyyy)',
    'dataPianInizio': 'Data inizio pianificata',
    'dataFine': 'Data fine effettiva',
    'dataAssegnazione': 'Data assegnazione al tecnico',
    'dataUltimaNota': 'Data dell\'ultima nota inserita',
    'ultimaNota': 'Testo ultima nota',
    'descrizione': 'Descrizione estesa',
    'note': 'Note libere',
    'qnetLink': 'URL Qnet della commessa',
    'erpLink': 'URL ERP della commessa',
    'sector': 'BU di appartenenza (FOR, ISO, SIC, ecc.)',
    # FOR-specifici
    'corso': 'Nome corso',
    'codClasse': 'Codice classe corso',
    'ore': 'Ore totali corso',
    'ed': 'Edizione corso',
    'dataEsame': 'Data esame corso',
    'euroResiduo': 'Residuo da incassare (€)',
    'numDiscenti': 'Numero discenti corso',
    'totRicavo': 'Totale ricavo aggregato (€)',
    'totRicevutoRegione': 'Totale ricevuto da Regione (€)',
    'anticipoImporto': 'Importo anticipo Regione (€)',
    'anticipoIdRichiesta': 'ID richiesta anticipo',
    'anticipoDataRichiesta': 'Data richiesta anticipo',
    'anticipoDecreto': 'Importo da decreto anticipo (€)',
    'anticipoDataAccredito': 'Data accredito anticipo',
    'anticipoDecretoNum': 'Numero e data decreto anticipo',
    'saldoImporto': 'Importo saldo Regione (€)',
    'saldoIdRichiesta': 'ID richiesta saldo',
    'saldoDataRichiesta': 'Data richiesta saldo',
    'saldoDecreto': 'Importo da decreto saldo (€)',
    'saldoDataAccredito': 'Data accredito saldo',
    'saldoDecretoNum': 'Numero e data decreto saldo',
    # SOA-specifici
    'soaAttestante': 'Nome ente SOA attestante',
    'consorzioFlag': 'Appartiene a un consorzio (sì/no)',
    'consorzio': 'Nome del consorzio',
    'enteCert9001': 'Ente che ha certificato ISO 9001',
    'scadenzaCert': 'Scadenza certificazione ISO 9001',
    # ISO-specifici
    'isoEnte': 'Ente certificatore ISO di riferimento',
    'isoStandard': 'Standard ISO singolo (es. 9001)',
    'isoStandards': 'Lista standard ISO multipli (es. "9001+14001")',
    'isoScopoProposto': 'Scopo proposto alla certificazione',
    'isoScopoUscita': 'Scopo finale rilasciato',
    'isoStatoCert': 'Stato certificato (attivo/sospeso/revocato)',
    'isoUrgenza': 'Urgenza emissione certificato',
    'isoSettore': 'Settore EA della certificazione',
    'isoIntervistaSede': 'Intervista in sede effettuata (sì/no)',
    'isoOreLav': 'Ore lavorazione tecnica',
    'isoDataInizioLav': 'Data inizio lavorazione audit',
    'isoDataFineLav': 'Data fine lavorazione audit',
    'isoDataVerifica': 'Data verifica ispettiva',
    'isoDataUltimaChiamata': 'Data ultima chiamata cliente',
    'isoAccordoPagamenti': 'Accordo pagamenti raggiunto (sì/no)',
    'isoTipoAudit': 'Tipo audit (Stage1, Stage2, Sorveglianza, Rinnovo)',
    'isoStatoPagamentoTxt': 'Stato pagamento testuale (ISO)',
    # APL-specifici
    'aplDataInizioLav': 'Data inizio lavorazione (APL)',
    'aplDataFineLav': 'Data fine lavorazione (APL)',
    'aplNumeroRisorse': 'Numero risorse richieste (APL_RES)',
    'aplProfilo': 'Profilo risorse richieste (APL_RES)',
    # GAR/FIA-specifici
    'garProtocollo': 'Numero protocollo gara',
    'garDataInserimento': 'Data inserimento gara a sistema',
    'garImporto': 'Importo base gara (€)',
    'garCIG': 'Codice Identificativo Gara (CIG)',
    'garDataScadenza': 'Data scadenza presentazione offerta',
    'garEnte': 'Ente appaltante',
    'garEsito': 'Esito gara (Aggiudicata, Non aggiudicata, ecc.)',
    'garNoteEsito': 'Note esito gara',
    'garOggetto': 'Oggetto della gara',
    'garCategoria': 'Categoria e classe servizi',
    # AVV-specifici
    'avvCIG': 'CIG gara per cui si fornisce avvalimento',
    'avvCategoria': 'Categoria avvalimento (singola)',
    'avvCategorie': 'Lista categorie avvalimento',
    'avvClassifica': 'Classifica SOA avvalimento (singola)',
    'avvClassifiche': 'Lista classifiche SOA',
    'avvTipo': 'Tipo avvalimento',
    'avvAnno': 'Anno avvalimento',
    'avvEsito': 'Esito avvalimento',
    # GDPR-specifici
    'gdprAccordo': 'Accordo sui pagamenti GDPR (sì/no)',
    'gdprInsoluti': 'Importo insoluti (€)',
    'gdprStatoPag': 'Stato pagamento GDPR',
    # OFFERTE
    'opportunita': 'ID opportunità collegata all\'offerta',
    'categoria': 'Categoria offerta',
    'tipo': 'Tipo offerta',
    'anno': 'Anno offerta',
    'data': 'Data offerta',
    'dataContratto': 'Data firma contratto (se accettata)',
    'totale': 'Totale offerta (€)',
    'rifiuto': 'Motivazione rifiuto (se rifiutata)',
    'dataFull': 'Data offerta completa',
    # OPP_FOR
    'operatore': 'Operatore CPI di riferimento',
    'cpi': 'Centro per l\'Impiego di pertinenza',
    'provincia': 'Provincia del lead',
    'corsoInteresse': 'Corso di interesse',
    'tipologiaCorso': 'Tipologia corso (IFTS, ITS, ecc.)',
    'fonte': 'Fonte del lead (campagna marketing)',
    'statoPrev': 'Stato preventivo',
    'rendicontazione': 'Stato rendicontazione',
    'annualita': 'Annualità del bando',
    'nome': 'Nome candidato',
    'cognome': 'Cognome candidato',
    'telefono': 'Telefono candidato',
    'email': 'Email candidato',
    'codiceFiscale': 'Codice fiscale candidato',
    'assegnatoA': 'Operatore a cui è assegnato il lead',
}


def detect_type(val):
    """Best-effort type detection per un valore di esempio."""
    if val is None or val == '': return 'null'
    if isinstance(val, bool): return 'boolean'
    if isinstance(val, int): return 'integer'
    if isinstance(val, float): return 'number'
    if isinstance(val, list): return 'array'
    if isinstance(val, dict): return 'object'
    s = str(val).strip()
    if re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{4}$', s): return 'date (dd-mm-yyyy)'
    if re.match(r'^https?://', s): return 'url'
    if re.match(r'^-?\d+(\.\d+)?$', s):
        return 'integer' if '.' not in s else 'number'
    return 'string'


def parse_alias_map():
    """Estrae columnAliases + columnAliasesByBu da config.js."""
    cfg = open(os.path.join(ROOT, 'dashboard_ADMIN/config.js')).read()
    common, by_bu = {}, {}
    # columnAliases (top-level)
    m = re.search(r'columnAliases:\s*\{(.*?)\n  \}', cfg, re.S)
    if m:
        for line in m.group(1).split('\n'):
            mm = re.match(r"\s*'([^']+)':\s*'([^']+)'", line) or re.match(r'\s*"([^"]+)":\s*\'([^\']+)\'', line)
            if mm: common[mm.group(1)] = mm.group(2)
    # columnAliasesByBu
    block = re.search(r'columnAliasesByBu:\s*\{(.*?)\n  \}\s*,?\s*\};', cfg, re.S)
    if block:
        for sec in re.finditer(r'(\w+):\s*\{([^}]+)\}', block.group(1)):
            bu = sec.group(1)
            by_bu[bu] = {}
            for line in sec.group(2).split('\n'):
                mm = re.match(r"\s*'([^']+)':\s*'([^']+)'", line) or re.match(r'\s*"([^"]+)":\s*\'([^\']+)\'', line)
                if mm: by_bu[bu][mm.group(1)] = mm.group(2)
    return common, by_bu


def analyze_bu(bu, fp):
    """Per ogni chiave di un dataset BU: tipo + sample non-null + freq."""
    full = os.path.join(ROOT, fp)
    if not os.path.exists(full): return None, 0
    with open(full) as f:
        data = json.load(f)
    if not data: return {}, 0
    fields = {}  # key -> {type, sample, nonnull_count}
    for rec in data:
        for k, v in rec.items():
            if k not in fields:
                fields[k] = {'type': 'null', 'sample': None, 'nonnull': 0}
            if v not in (None, ''):
                fields[k]['nonnull'] += 1
                if fields[k]['sample'] is None:
                    fields[k]['sample'] = v
                    fields[k]['type'] = detect_type(v)
    return fields, len(data)


def gen_markdown():
    common_alias, by_bu_alias = parse_alias_map()
    # Inverse map: camelCase → list of italian headers
    inv = defaultdict(list)
    for it, cc in common_alias.items(): inv[cc].append(('*', it))
    for bu, m in by_bu_alias.items():
        for it, cc in m.items(): inv[cc].append((bu, it))

    out = []
    out.append('# Dizionario Campi API — Dashboard STW Qualifica\n')
    out.append(f'_Auto-generato da `tools/generate_api_fields_doc.py` il {datetime.now().strftime("%Y-%m-%d %H:%M")}._\n')
    out.append('Fonte: `dashboard_ADMIN/config.js` (alias map) + JSON `dashboard_*/data/*.json` (chiavi reali + sample).\n\n')

    out.append('## Indice\n')
    for bu in JSON_PATHS:
        out.append(f'- [{bu}](#{bu.lower()})\n')
    out.append('- [Header Italiano → camelCase (mappa completa)](#mappa-alias)\n')
    out.append('- [Endpoint API suggeriti](#endpoint-api-suggeriti)\n\n')

    # Per ogni BU
    for bu, fp in JSON_PATHS.items():
        fields, total = analyze_bu(bu, fp)
        if fields is None:
            out.append(f'## {bu}\n_JSON non trovato_\n\n')
            continue
        out.append(f'## {bu}\n')
        out.append(f'**File:** `{fp}` · **Record:** {total}\n\n')
        out.append('| Chiave camelCase | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |\n')
        out.append('|---|---|---|---|---|---|\n')
        for k in sorted(fields):
            f = fields[k]
            cov = f'{f["nonnull"]}/{total}' if total else '–'
            samples = inv.get(k, [])
            # Preferisci alias BU-specifico se esiste, poi comune
            bu_alias = [it for b, it in samples if b == bu]
            com_alias = [it for b, it in samples if b == '*']
            ital = ', '.join(bu_alias) if bu_alias else (', '.join(com_alias) if com_alias else '_(non in mappa)_')
            sample = f['sample']
            if isinstance(sample, str) and len(sample) > 40: sample = sample[:37] + '...'
            sample = json.dumps(sample, ensure_ascii=False) if sample is not None else ''
            desc = DESC.get(k, '')
            out.append(f'| `{k}` | {f["type"]} | {ital} | {cov} | `{sample}` | {desc} |\n')
        out.append('\n')

    # Mappa alias completa
    out.append('## Mappa Alias\n\n')
    out.append('### Comuni (applicate a tutte le BU)\n\n')
    out.append('| Header Excel (italiano) | Chiave camelCase |\n|---|---|\n')
    for it in sorted(common_alias):
        out.append(f'| `{it}` | `{common_alias[it]}` |\n')
    out.append('\n### Per-BU (vincono sui comuni)\n\n')
    for bu in sorted(by_bu_alias):
        out.append(f'#### {bu}\n\n| Header Excel (italiano) | Chiave camelCase |\n|---|---|\n')
        for it in sorted(by_bu_alias[bu]):
            out.append(f'| `{it}` | `{by_bu_alias[bu][it]}` |\n')
        out.append('\n')

    # Endpoint suggeriti
    out.append('## Endpoint API suggeriti\n\n')
    out.append('Base path proposto: `https://api.qualificagroup.org/v1/`\n\n')
    out.append('| Risorsa | Endpoint | Note |\n|---|---|---|\n')
    for bu in JSON_PATHS:
        slug = bu.lower().replace('_', '-')
        out.append(f'| Commesse {bu} | `GET /commesse/{slug}` | Restituisce la lista, paginata. Campi come da sezione [{bu}](#{bu.lower()}) |\n')
    out.append('\n')
    out.append('### Filtri standard supportati (query string)\n')
    out.append('- `?status=In%20Lavorazione` — filtra per status\n')
    out.append('- `?from=2026-01-01&to=2026-12-31` — range data inizio\n')
    out.append('- `?fine_from=2026-01-01&fine_to=2026-12-31` — range data fine\n')
    out.append('- `?cliente=<nome>` — match cliente\n')
    out.append('- `?agente=<nome>` — match commerciale\n')
    out.append('- `?limit=1000&offset=0` — paginazione\n')

    return ''.join(out)


def main():
    md = gen_markdown()
    out_path = os.path.join(ROOT, 'docs', 'CAMPI_API_REFERENCE.md')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        f.write(md)
    print(f'✓ Scritto {out_path}')
    print(f'  {len(md):,} caratteri · {md.count(chr(10))} righe')


if __name__ == '__main__':
    main()
