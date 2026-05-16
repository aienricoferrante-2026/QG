#!/usr/bin/env python3
"""Audit globale dei campi: per ogni campo nei JSON delle BU, calcola
   popolamento % per BU e dove viene usato nel codice JS.

   Output: data/fields-usage.json (consumato da hub_cross.js).

   Uso:  python3 tools/audit_fields.py
"""
import os, re, glob, json
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)

# Pattern accessi a campi nel codice JS
PATTERNS = [
    re.compile(r'\bc\.(\w+)\b'),
    re.compile(r'\br\.(\w+)\b'),
    re.compile(r'\bitem\.(\w+)\b'),
    re.compile(r"\['(\w+)'\]"),
    re.compile(r'\["(\w+)"\]'),
]

# Parole chiave da escludere (non sono campi dati)
EXCLUDE = {
    'length', 'push', 'pop', 'shift', 'unshift', 'forEach', 'filter', 'map', 'sort',
    'slice', 'find', 'reduce', 'split', 'toString', 'toLowerCase', 'toUpperCase', 'trim',
    'replace', 'indexOf', 'startsWith', 'endsWith', 'includes', 'concat', 'join',
    'val', 'display', 'style', 'value', 'innerHTML', 'outerHTML', 'classList',
    'parentNode', 'children', 'parentElement', 'nodeName', 'addEventListener',
    'removeEventListener', 'remove', 'add', 'toggle', 'contains', 'getTime',
    'href', 'target', 'cssText', 'innerText', 'textContent', 'click', 'type',
    'group', 'tag', 'cols', 'types', 'row', 'rows', 'items', 'key', 'json',
    'querySelector', 'parts', 'from', 'to', 'src', 'pct', 'pctInc',
    'kpi', 'sub', 'lbl', 'icon', 'desc', 'bullets', 'badge', 'accent',
    'sec', 'title', 'label', 'inc', 'esposizione', 'color', 'primary',
    'descUser', 'eur', 'example', 'filled', 'formula',
}

def scan_codebase():
    """Scansiona JS e ritorna { campo: [file_relativi] }."""
    usage = defaultdict(set)
    for path in glob.glob('shared/dashboard-core/js/*.js') + glob.glob('dashboard_*/js/*.js'):
        with open(path) as f:
            content = f.read()
        for pat in PATTERNS:
            for m in pat.finditer(content):
                field = m.group(1)
                if field in EXCLUDE or len(field) < 3 or not field[0].islower():
                    continue
                usage[field].add(path)
    return {k: sorted(list(v)) for k, v in usage.items()}

def scan_json_population():
    """Per ogni BU JSON, ritorna dict { campo: { count, total, pct } }."""
    out = {}
    for jf in glob.glob('dashboard_*_CM/data/commesse_*.json'):
        try:
            data = json.load(open(jf))
        except Exception:
            continue
        bu = jf.split('/')[0].replace('dashboard_', '').replace('_CM', '')
        n = len(data)
        if not n:
            continue
        all_fields = set()
        for r in data[:200]:
            all_fields.update(r.keys())
        bu_fields = {}
        for f in all_fields:
            pop = sum(1 for r in data if r.get(f) not in (None, '', 0, '0', 0.0, '***'))
            bu_fields[f] = {
                'count': pop,
                'total': n,
                'pct': round(pop / n * 100, 1),
            }
        out[bu] = bu_fields
    return out

def main():
    usage = scan_codebase()
    pop_by_bu = scan_json_population()

    # Set globale di tutti i campi (in JSON o nel codice)
    all_fields = set()
    for bu_data in pop_by_bu.values():
        all_fields.update(bu_data.keys())
    all_fields.update(usage.keys())

    # Per ogni campo: quale BU lo ha + popolamento medio + usage
    output = {
        'generatedAt': __import__('datetime').datetime.now().isoformat(timespec='seconds'),
        'fields': [],
    }
    for f in sorted(all_fields):
        bus = {}
        avg_pct = 0
        bu_count = 0
        for bu, fields in pop_by_bu.items():
            if f in fields:
                bus[bu] = fields[f]['pct']
                avg_pct += fields[f]['pct']
                bu_count += 1
        avg = round(avg_pct / bu_count, 1) if bu_count else 0
        files = usage.get(f, [])
        output['fields'].append({
            'name': f,
            'inJson': bu_count > 0,
            'inBus': bu_count,
            'avgPct': avg,
            'usedIn': len(files),
            'files': [p.split('/')[-1] for p in files[:6]],
            'pctByBu': bus,
        })

    out_path = 'data/fields-usage.json'
    os.makedirs('data', exist_ok=True)
    with open(out_path, 'w') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    n_total = len(output['fields'])
    n_unused = sum(1 for x in output['fields'] if x['inJson'] and x['usedIn'] == 0)
    n_used_low = sum(1 for x in output['fields'] if x['usedIn'] > 0 and x['avgPct'] < 30)
    print(f'OK · {n_total} campi totali')
    print(f'  · usati nel codice: {sum(1 for x in output["fields"] if x["usedIn"] > 0)}')
    print(f'  · in JSON ma mai usati: {n_unused}')
    print(f'  · usati ma poco popolati (<30%): {n_used_low}')
    print(f'Output: {out_path}')

if __name__ == '__main__':
    main()
