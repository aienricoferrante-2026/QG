#!/usr/bin/env python3
"""
Genera mini-dashboard per ogni Sede.
Per ciascuna Sede crea una cartella con token random contenente:
- data.json    → solo i record della sede
- meta.json    → {sede, num, partner}

Aggiorna anche partners/_links.json con la mappa token→sede.

Riesegui questo script ogni volta che ricarichi un nuovo Excel: i token
ESISTENTI vengono mantenuti (i partner conservano i loro link), si
aggiornano solo i dati.
"""
import json
import os
import secrets
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
SOURCE_JSON = os.path.join(ROOT, '..', 'dashboard_FOR_CM', 'data', 'commesse_for.json')
LINKS_PATH = os.path.join(ROOT, '_links.json')

def load_existing_links():
    if os.path.exists(LINKS_PATH):
        with open(LINKS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return {item['sede']: item for item in data.get('partners', [])}
    return {}

def gen_token():
    return secrets.token_urlsafe(9)  # ~12 chars url-safe

def main():
    if not os.path.exists(SOURCE_JSON):
        print(f'❌ File sorgente non trovato: {SOURCE_JSON}')
        sys.exit(1)
    with open(SOURCE_JSON, 'r', encoding='utf-8') as f:
        records = json.load(f)
    print(f'📥 Caricati {len(records)} record da commesse_for.json')

    by_sede = defaultdict(list)
    for r in records:
        sede = r.get('sedeNorm') or r.get('sedeOp') or 'Sede sconosciuta'
        by_sede[sede].append(r)
    print(f'🏢 {len(by_sede)} sedi distinte')

    existing = load_existing_links()
    out = []
    created = updated = 0
    for sede in sorted(by_sede.keys()):
        records_sede = by_sede[sede]
        if sede in existing:
            entry = existing[sede]
            updated += 1
        else:
            entry = {
                'sede': sede,
                'token': gen_token(),
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
                'num': len(records_sede),
                'partner': entry.get('partner', '')
            }, f, ensure_ascii=False, indent=2)
        entry['num'] = len(records_sede)
        out.append(entry)

    out.sort(key=lambda x: x['sede'])
    with open(LINKS_PATH, 'w', encoding='utf-8') as f:
        json.dump({'partners': out, 'count': len(out)}, f, ensure_ascii=False, indent=2)

    print(f'✅ Aggiornato _links.json: {created} nuovi, {updated} aggiornati')
    print(f'📁 Sedi (top 5):')
    for e in out[:5]:
        print(f'   {e["num"]:4d}  {e["token"]}  {e["sede"][:60]}')

if __name__ == '__main__':
    main()
