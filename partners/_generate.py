#!/usr/bin/env python3
"""
Genera mini-dashboard per ogni Sede.
Per ciascuna Sede crea una cartella con token tipo "CAM_AVERSA_abc123def456":
- data.json    → solo i record della sede
- meta.json    → {sede, num, partner}

Aggiorna anche partners/_links.json con la mappa token→sede.

Riesegui questo script ogni volta che ricarichi un nuovo Excel:
- I token ESISTENTI vengono mantenuti (i partner conservano i loro link)
- Si aggiornano solo i dati (data.json e meta.json delle cartelle esistenti)
- Le sedi nuove ricevono un nuovo token nel formato REG_CITTA_random
"""
import json
import os
import re
import secrets
import sys
from collections import defaultdict, Counter

ROOT = os.path.dirname(os.path.abspath(__file__))
SOURCE_JSON = os.path.join(ROOT, '..', 'dashboard_FOR_CM', 'data', 'commesse_for.json')
LINKS_PATH = os.path.join(ROOT, '_links.json')

# Abbreviazione 3 lettere per regione (ufficiali ISTAT-style)
REGION_ABBR = {
    'abruzzo': 'ABR',
    'basilicata': 'BAS',
    'calabria': 'CAL',
    'campania': 'CAM',
    'emilia-romagna': 'EMR', 'emilia romagna': 'EMR',
    'friuli-venezia giulia': 'FVG', 'friuli venezia giulia': 'FVG',
    'lazio': 'LAZ',
    'liguria': 'LIG',
    'lombardia': 'LOM',
    'marche': 'MAR',
    'molise': 'MOL',
    'piemonte': 'PIE',
    'puglia': 'PUG',
    'sardegna': 'SAR',
    'sicilia': 'SIC',
    'toscana': 'TOS',
    'trentino-alto adige': 'TAA', 'trentino alto adige': 'TAA',
    'umbria': 'UMB',
    'valle d\'aosta': 'VDA', 'valle daosta': 'VDA',
    'veneto': 'VEN'
}

def region_code(name):
    if not name:
        return 'ZZZ'
    key = name.strip().lower()
    return REGION_ABBR.get(key, 'ZZZ')

def slug_city(name):
    """Estrae uno slug pulito dal nome città (parte prima di ' - ' del sedeNorm)."""
    if not name:
        return 'XXX'
    s = str(name).split(' - ')[0].strip()
    s = s.upper()
    # Rimuovi accenti / parentesi / numeri / etc → tieni solo A-Z e spazi
    s = re.sub(r'[ÀÁÂÃÄÅ]', 'A', s)
    s = re.sub(r'[ÈÉÊË]', 'E', s)
    s = re.sub(r'[ÌÍÎÏ]', 'I', s)
    s = re.sub(r'[ÒÓÔÕÖ]', 'O', s)
    s = re.sub(r'[ÙÚÛÜ]', 'U', s)
    s = re.sub(r"['’`]", '', s)
    s = re.sub(r'[^A-Z0-9 ]', '', s)
    s = re.sub(r'\s+', '_', s).strip('_')
    if not s:
        return 'XXX'
    # Limita a 24 char per leggibilità
    return s[:24]

def gen_token(reg_code, city_slug):
    rand = secrets.token_urlsafe(9)
    # token_urlsafe usa A-Z a-z 0-9 _ - ; tutto url-safe già
    return f'{reg_code}_{city_slug}_{rand}'

def detect_region_for_sede(records_sede):
    """Trova la regione più comune tra i record di una sede."""
    counter = Counter()
    for r in records_sede:
        reg = (r.get('regione') or '').strip()
        if reg:
            counter[reg] += 1
    if not counter:
        return ''
    return counter.most_common(1)[0][0]

def load_existing_links():
    if os.path.exists(LINKS_PATH):
        with open(LINKS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {item['sede']: item for item in data.get('partners', [])}
    return {}

def main():
    if not os.path.exists(SOURCE_JSON):
        print(f'❌ File sorgente non trovato: {SOURCE_JSON}')
        sys.exit(1)
    with open(SOURCE_JSON, 'r', encoding='utf-8') as f:
        records = json.load(f)
    print(f'📥 Caricati {len(records)} record')

    by_sede = defaultdict(list)
    for r in records:
        sede = r.get('sedeNorm') or r.get('sedeOp') or 'Sede sconosciuta'
        by_sede[sede].append(r)
    print(f'🏢 {len(by_sede)} sedi distinte')

    existing = load_existing_links()
    out = []
    created = updated = renamed = 0

    for sede in sorted(by_sede.keys()):
        records_sede = by_sede[sede]
        regione = detect_region_for_sede(records_sede)
        reg_code = region_code(regione)
        city_slug = slug_city(sede)

        if sede in existing:
            entry = dict(existing[sede])
            old_token = entry['token']
            # Rinomina se token vecchio formato (no underscore prefisso o prefisso ZZZ_XXX)
            looks_legacy = (
                '_' not in old_token
                or not old_token.startswith(reg_code + '_')
                or not old_token[len(reg_code) + 1:].startswith(city_slug + '_')
            )
            if looks_legacy:
                new_token = gen_token(reg_code, city_slug)
                old_folder = os.path.join(ROOT, old_token)
                new_folder = os.path.join(ROOT, new_token)
                if os.path.exists(old_folder):
                    os.rename(old_folder, new_folder)
                entry['token'] = new_token
                entry['regione'] = regione
                renamed += 1
            else:
                updated += 1
                entry['regione'] = regione
        else:
            entry = {
                'sede': sede,
                'regione': regione,
                'token': gen_token(reg_code, city_slug),
                'partner': '',
                'created': None
            }
            created += 1

        token = entry['token']
        folder = os.path.join(ROOT, token)
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, 'data.json'), 'w', encoding='utf-8') as f:
            json.dump(records_sede, f, ensure_ascii=False, indent=2)
        with open(os.path.join(folder, 'meta.json'), 'w', encoding='utf-8') as f:
            json.dump({
                'sede': sede,
                'regione': regione,
                'num': len(records_sede),
                'partner': entry.get('partner', '')
            }, f, ensure_ascii=False, indent=2)
        entry['num'] = len(records_sede)
        out.append(entry)

    # Pulizia cartelle orfane (sedi che non esistono più)
    valid_tokens = {e['token'] for e in out}
    for d in os.listdir(ROOT):
        full = os.path.join(ROOT, d)
        if not os.path.isdir(full):
            continue
        if d.startswith('_') or d.startswith('.'):
            continue
        if d not in valid_tokens:
            print(f'🗑  rimozione cartella orfana: {d}')
            for f in os.listdir(full):
                os.remove(os.path.join(full, f))
            os.rmdir(full)

    out.sort(key=lambda x: x['sede'])
    with open(LINKS_PATH, 'w', encoding='utf-8') as f:
        json.dump({'partners': out, 'count': len(out)}, f, ensure_ascii=False, indent=2)

    print(f'✅ {created} nuovi  ·  {updated} aggiornati  ·  {renamed} rinominati al nuovo formato')
    print(f'📁 Esempi token:')
    for e in out[:6]:
        print(f'   {e["num"]:4d}  {e["token"]}')

if __name__ == '__main__':
    main()
