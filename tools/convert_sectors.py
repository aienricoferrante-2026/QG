#!/usr/bin/env python3
"""Converte gli Excel dei settori "base" (SIC, AVV, FIA, IST) in JSON
nello stesso schema della dashboard FOR_CM, mappando solo i 45 campi comuni.

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

ROOT = Path(__file__).resolve().parent.parent
EXCEL_DIR = Path("/Users/enricoferrante/Desktop/STW")

SECTORS = {
    "SIC": "commesse_SIC_06-05-26.xlsx",
    "AVV": "commesse_AVV_06-05-26.xlsx",
    "FIA": "commesse_FIA_06-05-26.xlsx",
    "IST": "commesse_IST_06-05-26.xlsx",
    "SOA": "commesse_SOA_06-05-26.xlsx",
}

# Campi specifici aggiuntivi per BU complesse (es. SOA).
# Vengono mappati solo se presenti nell'Excel di origine, quindi sicuri
# da estendere anche per altre BU senza impatto retrocompatibile.
EXTRA_FIELD_MAP = {
    "Soa Attestante": "soaAttestante",
    "SOA Attestante": "soaAttestante",
    "Nome dell'Ente di Certiifcazione 9001": "enteCert9001",
    "Nome dell'Ente di Certificazione 9001": "enteCert9001",
    "Scadenza Ente di Certiifcazione 9001": "scadenzaCert",
    "Scadenza Ente di Certificazione 9001": "scadenzaCert",
    "Aggiornamento Settimanale": "aggSettimanale",
    "Data Firma Contratto": "dataFirmaContratto",
    "Appartenenza Consorzio": "consorzioFlag",
    "Nome del Consorzio": "consorzio",
    "Ultima Chiamata": "ultimaChiamata",
    "Invio Contratto": "invioContratto",
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
}


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


def to_date_str(v):
    """Excel returns datetime; we want gg-mm-yyyy as the FOR JSON does."""
    if v is None or v == "":
        return ""
    if hasattr(v, "strftime"):
        return v.strftime("%d-%m-%Y")
    s = str(v).strip()
    return s


def parse_row(headers, row, sector):
    rec = {}
    seen_ultima = False
    for i, h in enumerate(headers):
        if h is None:
            continue
        h_str = str(h).strip()
        key = FIELD_MAP.get(h_str) or EXTRA_FIELD_MAP.get(h_str)
        if not key:
            continue
        val = row[i] if i < len(row) else None
        if key == "ultimaNota":
            if seen_ultima:
                continue
            seen_ultima = True
        if key in {"dataInizio", "dataFine", "dataPianInizio", "dataAssegnazione",
                   "dataUltimaNota", "dataFirmaContratto", "scadenzaCert",
                   "ultimaChiamata", "invioContratto", "aggSettimanale"}:
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
