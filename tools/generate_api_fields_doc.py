#!/usr/bin/env python3
"""Entry point: rigenera docs/campi-api/ (un file per BU + indici).

Orchestra:
- tools/lib/alias_loader.py    → mappa alias da config.js
- tools/api_docs/analyzer.py   → tipo + coverage + sample per ogni campo
- tools/api_docs/writer.py     → markdown navigabile (max ~80 righe per file)
- docs/campi-api/_descriptions.json → descrizioni umane (dato, non codice)"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lib import alias_loader
from api_docs.config import BU_JSON, load_descriptions, DOCS_DIR
from api_docs import analyzer, writer


def main():
    os.makedirs(DOCS_DIR, exist_ok=True)
    common, by_bu = alias_loader.load()
    descriptions = load_descriptions()
    inv = writer._inverse_alias(common, by_bu)

    bu_stats = {}
    for bu in BU_JSON:
        fields, total = analyzer.analyze(bu)
        if fields is None:
            print(f'  ⚠ {bu}: JSON non trovato'); continue
        writer.write_bu_page(bu, fields, total, inv, descriptions)
        bu_stats[bu] = total
        print(f'  ✓ {bu:8s} {total:5d} record · {len(fields)} campi')

    writer.write_alias_map(common, by_bu)
    writer.write_endpoints()
    writer.write_readme(bu_stats)
    print(f'\nScritto in {DOCS_DIR}/')


if __name__ == '__main__':
    main()
