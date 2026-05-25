"""Configurazione: mapping BU → file JSON, percorsi output."""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DOCS_DIR = os.path.join(ROOT, 'docs', 'campi-api')

BU_JSON = {
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


def load_descriptions():
    """Carica le descrizioni umane dal file JSON (data, non codice)."""
    desc_path = os.path.join(DOCS_DIR, '_descriptions.json')
    with open(desc_path, encoding='utf-8') as f:
        groups = json.load(f)
    # Flatten: i gruppi (_anagrafica, FOR, ecc.) sono solo per leggibilità
    flat = {}
    for group, fields in groups.items():
        if group == '_meta' or not isinstance(fields, dict):
            continue
        flat.update(fields)
    return flat
