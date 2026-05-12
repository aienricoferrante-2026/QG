#!/usr/bin/env python3
"""Converte gli Excel dei settori "base" (SIC, AVV, FIA, IST, ISO) in JSON
nello stesso schema della dashboard FOR_CM, mappando i 45 campi comuni.

Per ISO il mapping è esteso con 22 campi specifici (Ente, Scopi, Date Audit,
Stato Certificato, Insoluti, ecc.) + parser del Titolo per estrarre Standard
(9001/14001/45001/...) e Tipo di Audit (IA/RC/1SA/2SA/3SA).

Input: /Users/enricoferrante/Desktop/STW/commesse_<SECTOR>_06-05-26.xlsx
Output: dashboard_<SECTOR>_CM/data/commesse_<sec>.json
"""

import json
import os
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("openpyxl non disponibile. Installa con: pip3 install openpyxl", file=sys.stderr)
    sys.exit(1)

import iso_parser as _iso
from iso_parser import parse_titolo as parse_titolo_iso
ISO_FIELD_MAP_EXTRA = _iso.FIELD_MAP_EXTRA
ISO_DATE_KEYS = _iso.DATE_KEYS

ROOT = Path(__file__).resolve().parent.parent
EXCEL_DIR = Path("/Users/enricoferrante/Desktop/STW")

SECTORS = {
    "SIC": "commesse_SIC_06-05-26.xlsx",
    "AVV": "commesse_AVV_06-05-26.xlsx",
    "FIA": "commesse_FIA_06-05-26.xlsx",
    "IST": "commesse_IST_06-05-26.xlsx",
    "ISO": "commesse_ISO_06-05-26.xlsx",
}

FIELD_MAP = {
    "ID": "id",
    "ID Contratto": "idContratto",
    "Contratto": "contratto",
    "Cliente": "cliente",
    "Contatto": "contatto",
    "Data Pian. Inizio": "dataPianInizio",
    "Data Inizio": "dataInizio",
    "Data Fine": "dataFine",
    "Titolo": "titolo",
    "Descrizione": "descrizione",
    "Indirizzo": "indirizzo",
    "Note": "note",
    "Status": "status",
    "Stato Lavorazione": "statoLav",
    "Data Assegnazione": "dataAssegnazione",
    "Ultima Nota": "ultimaNota",
    "Data Ultima Nota": "dataUltimaNota",
    "Importo Ente": "ente",
    "Importo Consulenza": "consulenza",
    "Agente": "agente",
    "Segnalatore": "segnalatore",
    "Città": "citta",
    "Citta": "citta",
    "€": "statoPagamento",
    "Avanzamento": "avanzamentoRaw",
    "Responsabile": "responsabile",
    "Tipo Commessa": "tipoCommessa",
    "Societa Aziendale": "societa",
    "Società Aziendale": "societa",
    "Societa / Sedi": "sede",
    "Società / Sedi": "sede",
    "Sede Operativa": "sedeOp",
    "Funzione aziendale": "funzione",
    "Regione": "regione",
    "Ec. Ricavi Cons.": "ecRicaviCons",
    "Ec. Costi Cons.": "ecCostiCons",
    "Ec. MOL Cons.": "ecMolCons",
    "Ricavi Documentali": "ricaviDocum",
    "Costi Documentali": "costiDocum",
    "MOL Documentale": "molDocum",
    "% Avanzamento Ec.": "pctAvanzEc",
    "% Ricavi Economici": "pctRicaviEc",
    "% Costi Economici": "pctCostiEc",
    "% MOL Economico": "pctMolEc",
    "Fin. Incassi Tot.": "finIncassiTot",
    "Fin. Uscite Tot.": "finUsciteTot",
    "Fin. Delta Tot.": "finDeltaTot",
    "Link Commessa": "qnetLink",
}

NUMERIC_KEYS = {
    "consulenza", "costi", "mol", "ente", "ricavi",
    "ecRicaviCons", "ecCostiCons", "ecMolCons",
    "ricaviDocum", "costiDocum", "molDocum",
    "pctAvanzEc", "pctRicaviEc", "pctCostiEc", "pctMolEc",
    "finIncassiTot", "finUsciteTot", "finDeltaTot",
    "giaIncassato", "daIncassare", "anticipoImporto", "saldoImporto",
    "totRicevutoRegione", "ore", "discenti", "avanzamento",
    "isoOreLav", "isoInsoluti",
}

# Mapping ISO-specifico (FIELD_MAP_EXTRA, DATE_KEYS) e parser Standard/Audit
# vivono in tools/iso_parser.py (importati come ISO_FIELD_MAP_EXTRA / ISO_DATE_KEYS sopra).


def normalize_sede(sede_op, citta):
    if not sede_op:
        return ""
    txt = str(sede_op).strip()
    cit = (citta or "").strip()
    if not cit:
        m = re.search(r"[-–]\s*([^-–]+?)\s*$", txt)
        if m:
            cit = re.sub(r"^\d+\s*-?\s*", "", m.group(1).strip()).strip()
    if not cit:
        return txt
    if cit == cit.upper() or cit == cit.lower():
        cit = cit.lower().title()
    return cit + " - " + txt


def to_num(v):
    if v is None or v == "":
        return 0
    if isinstance(v, (int, float)):
        return float(v)
    s = str(v).strip().replace("€", "").replace(".", "").replace(",", ".").strip()
    s = re.sub(r"[^0-9.\-]", "", s)
    try:
        return float(s) if s else 0
    except ValueError:
        return 0


_ZERO_DATE_RE = re.compile(r"^0{1,4}[-/]0{1,2}[-/]0{1,4}$")
_ISO_DATE_RE = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$")
_DDMMYYYY_RE = re.compile(r"^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$")


def to_date_str(v):
    """Normalizza qualunque data (Excel datetime, ISO yyyy-mm-dd, gg/mm/yyyy,
    placeholder 00-00-0000) al formato canonico 'gg-mm-yyyy'."""
    if v is None or v == "":
        return ""
    if hasattr(v, "strftime"):
        return v.strftime("%d-%m-%Y")
    s = str(v).strip()
    if not s or _ZERO_DATE_RE.match(s):
        return ""
    m = _ISO_DATE_RE.match(s)
    if m:
        y, mo, d = m.group(1), m.group(2), m.group(3)
        return f"{int(d):02d}-{int(mo):02d}-{int(y):04d}"
    m = _DDMMYYYY_RE.match(s)
    if m:
        d, mo, y = m.group(1), m.group(2), m.group(3)
        return f"{int(d):02d}-{int(mo):02d}-{int(y):04d}"
    return s


def parse_row(headers, row, sector):
    rec = {}
    seen_keys = set()  # gestisce header duplicati (ISO ha "Note" e "Ultima Nota" x2)
    field_map = dict(FIELD_MAP)
    if sector == "ISO":
        field_map.update(ISO_FIELD_MAP_EXTRA)
    date_keys_common = {"dataInizio", "dataFine", "dataPianInizio",
                        "dataAssegnazione", "dataUltimaNota"}

    for i, h in enumerate(headers):
        if h is None:
            continue
        key = field_map.get(str(h).strip())
        if not key:
            continue
        val = row[i] if i < len(row) else None
        # Per chiavi che possono apparire due volte (ultimaNota, note) tengo la prima
        if key in {"ultimaNota", "note"}:
            if key in seen_keys:
                continue
            seen_keys.add(key)
        if key in date_keys_common or key in ISO_DATE_KEYS:
            rec[key] = to_date_str(val)
        elif key in NUMERIC_KEYS:
            rec[key] = to_num(val)
        else:
            rec[key] = "" if val is None else str(val).strip()

    if rec.get("avanzamentoRaw"):
        m = re.match(r"(\d+)%?", str(rec["avanzamentoRaw"]))
        rec["avanzamento"] = int(m.group(1)) if m else 0
    else:
        rec["avanzamento"] = 0

    rec["sedeNorm"] = normalize_sede(rec.get("sedeOp"), rec.get("citta"))

    if "ricavi" not in rec:
        rec["ricavi"] = rec.get("ecRicaviCons") or rec.get("consulenza", 0)
    if "costi" not in rec:
        rec["costi"] = rec.get("ecCostiCons", 0)
    if "mol" not in rec:
        rec["mol"] = rec.get("ecMolCons", 0)
        if not rec["mol"] and rec.get("consulenza") and rec.get("costi") is not None:
            rec["mol"] = rec["consulenza"] - rec["costi"]

    if "giaIncassato" not in rec:
        rec["giaIncassato"] = rec.get("finIncassiTot", 0)
    if "daIncassare" not in rec:
        rec["daIncassare"] = max(0, (rec.get("consulenza") or 0) - (rec.get("giaIncassato") or 0))

    if not rec.get("dataInizio") and rec.get("dataPianInizio"):
        rec["dataInizio"] = rec["dataPianInizio"]

    if rec.get("qnetLink"):
        rec["erpLink"] = rec["qnetLink"]

    rec.setdefault("ore", 0)
    rec.setdefault("discenti", 0)
    rec.setdefault("anticipoImporto", 0)
    rec.setdefault("saldoImporto", 0)
    rec.setdefault("totRicevutoRegione", 0)

    rec.setdefault("statoCorso", "")
    rec.setdefault("statoClasse", "")
    rec.setdefault("corso", "")

    # Campi derivati ISO (parser del Titolo)
    if sector == "ISO":
        standards, audits = parse_titolo_iso(rec.get("titolo", ""))
        rec["isoStandards"]      = standards
        rec["isoTipoAuditList"]  = audits
        # Valori "primary" per filtri MultiSelect (stringa singola)
        rec["isoStandard"]       = " + ".join(standards) if standards else ""
        rec["isoTipoAudit"]      = " + ".join(audits)    if audits    else ""

    rec["sector"] = sector
    return rec


def convert(sector, filename):
    src = EXCEL_DIR / filename
    if not src.exists():
        print(f"[{sector}] File non trovato: {src}", file=sys.stderr)
        return None

    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)
    ws = wb.active
    rows = ws.iter_rows(values_only=True)
    headers = list(next(rows))
    records = []
    for row in rows:
        if all(c is None or c == "" for c in row):
            continue
        records.append(parse_row(headers, row, sector))
    wb.close()

    out_dir = ROOT / f"dashboard_{sector}_CM" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"commesse_{sector.lower()}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, indent=0, separators=(",", ":"))
    print(f"[{sector}] {len(records)} commesse → {out_file.relative_to(ROOT)}")
    return len(records)


def main():
    counts = {}
    for sector, filename in SECTORS.items():
        counts[sector] = convert(sector, filename)

    summary = ROOT / "tools" / "sector_counts.json"
    with open(summary, "w", encoding="utf-8") as f:
        json.dump(counts, f, indent=2)
    print(f"\nRiepilogo scritto in {summary.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
