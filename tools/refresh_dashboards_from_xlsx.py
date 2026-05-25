#!/usr/bin/env python3
"""Aggiorna i JSON delle dashboard direttamente dai file Excel in Downloads.

Bypassa Supabase + GitHub Action: utile per refresh immediato locale.
Usa la mappa alias canonica letta da `dashboard_ADMIN/config.js`
(via tools/lib/alias_loader.py — niente duplicazione).

USO:
  python3 tools/refresh_dashboards_from_xlsx.py            # preview
  python3 tools/refresh_dashboards_from_xlsx.py --apply    # scrive i JSON
  python3 tools/refresh_dashboards_from_xlsx.py --bu FOR   # solo una BU"""
import os, sys, json, glob, argparse
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import openpyxl
except ImportError:
    sys.exit('Manca openpyxl. Installa con: pip3 install openpyxl')

from lib import alias_loader
from api_docs.config import ROOT, BU_JSON

DL = os.path.expanduser('~/Downloads')


def find_latest(bu):
    """File più recente in Downloads con pattern commesse_<bu>*.xlsx."""
    pats = [os.path.join(DL, f'commesse_{bu}*.xlsx'),
            os.path.join(DL, f'commesse_{bu.lower()}*.xlsx')]
    files = []
    for p in pats: files.extend(glob.glob(p))
    return max(files, key=os.path.getmtime) if files else None


def read_file(path):
    """Excel reale o JSON-mascherato-da-xlsx (caso SIC)."""
    with open(path, 'rb') as f: head = f.read(2)
    if head[:1] in (b'{', b'['):
        data = json.load(open(path, encoding='utf-8'))
        if isinstance(data, dict):
            for k in ('records', 'data', 'commesse', 'rows', 'items'):
                if k in data and isinstance(data[k], list): data = data[k]; break
            else: data = [data]
        return [dict(r) for r in data if isinstance(r, dict)]
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    headers = []; rows = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == 0:
            headers = [str(c).strip() if c is not None else '' for c in row]; continue
        rec = {}
        for h, v in zip(headers, row):
            if not h: continue
            if isinstance(v, datetime): v = v.strftime('%d-%m-%Y')
            rec[h] = v if v is not None else ''
        rows.append(rec)
    return rows


def process(bu, apply=False):
    xlsx = find_latest(bu)
    if not xlsx:
        print(f'  {bu:8s} SKIP (nessun file commesse_{bu}*.xlsx)'); return
    raw = read_file(xlsx)
    records = []
    for r in raw:
        ar = alias_loader.apply(r, bu)
        if not ar.get('id'): continue
        ar['sector'] = bu
        records.append(ar)
    out_path = os.path.join(ROOT, BU_JSON[bu])
    old = 0
    if os.path.exists(out_path):
        try: old = len(json.load(open(out_path)))
        except Exception: pass
    delta = len(records) - old
    sign = '+' if delta >= 0 else ''
    print(f'  {bu:8s} {os.path.basename(xlsx):45s} → {len(records):5d} record ({sign}{delta} vs JSON)')
    if apply:
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=2)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='Scrive davvero (default: preview)')
    ap.add_argument('--bu', help='Solo una BU (es. FOR)')
    a = ap.parse_args()
    bus = [a.bu.upper()] if a.bu else list(BU_JSON)
    print(f'{"APPLY" if a.apply else "PREVIEW"} · {DL}\n' + '=' * 78)
    for bu in bus:
        if bu in BU_JSON: process(bu, a.apply)
    print('=' * 78)
    if not a.apply: print('Preview. Per scrivere: --apply')


if __name__ == '__main__':
    main()
