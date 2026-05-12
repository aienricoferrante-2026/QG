"""Parser dei campi specifici ISO (Standard e Tipo di Audit) dal Titolo
+ mapping dei 22 campi Excel → JSON specifici del settore ISO.

Schema osservato nel campo "Titolo" dell'Excel ISO:
    ISO_<STANDARD>_<TIPO_AUDIT>_<ANNO>
Esempi:
    ISO_9001_2SA_2022       → standard 9001, audit 2SA
    Iso_14001_IA_2022       → standard 14001, audit IA
    ISO_14_RC_45_2SA_22     → multi-standard: 14001+RC, 45001+2SA
    ISO_37001_1SA_2022      → standard 37001, audit 1SA

Copertura osservata sul dataset 6.185 record: Standard ~93%, Audit ~72%.
Le righe non classificate (es. "EcoVadis", "GMP", titoli di test) finiscono
con il campo `isoStandard`/`isoTipoAudit` vuoto e nei filtri MultiSelect
vengono raggruppate come "N.D.".
"""
import re

# Mapping dei 22 campi Excel ISO → chiavi JSON (prefissate "iso*").
FIELD_MAP_EXTRA = {
    "Scopo proposto":           "isoScopoProposto",
    "Scopo in uscita":          "isoScopoUscita",
    "Stato Pagamento":          "isoStatoPagamentoTxt",
    "Ente di Riferimento":      "isoEnte",
    "Accordo sui Pagamenti":    "isoAccordoPagamenti",
    "Insoluti":                 "isoInsoluti",
    "Documenti già nel Triennio": "isoDocTriennio",
    "Stato del Certificato":    "isoStatoCert",
    "Urgenza emissione":        "isoUrgenza",
    "Data Urgenza Emissione":   "isoDataUrgenza",
    "Settore":                  "isoSettore",
    "Intervista in sede":       "isoIntervistaSede",
    "Ore Lavorazione":          "isoOreLav",
    "Data Inizio Lavorazione":  "isoDataInizioLav",
    "Data Fine Lavorazione":    "isoDataFineLav",
    "Data Verifica":            "isoDataVerifica",
    "Data Verifica Effettiva":  "isoDataVerificaEff",
    "Data Ultimo Audit":        "isoDataUltimoAudit",
    "Data Prossima Consulenza": "isoDataProssimaConsulenza",
    "Data Ultima Chiamata":     "isoDataUltimaChiamata",
    "Data Ultimo Richiamo":     "isoDataUltimoRichiamo",
}

DATE_KEYS = {
    "isoDataUrgenza", "isoDataInizioLav", "isoDataFineLav",
    "isoDataVerifica", "isoDataVerificaEff", "isoDataUltimoAudit",
    "isoDataProssimaConsulenza", "isoDataUltimaChiamata",
    "isoDataUltimoRichiamo",
}

# Codici "corti" usati nei titoli multi-standard (es. "9", "14", "45") che
# vanno espansi alla forma 4-cifre. Solo i codici realmente osservati.
STANDARD_SHORT = {
    "9": "9001",
    "14": "14001",
    "45": "45001",
    "27": "27001",
    "37": "37001",
}

# 2010-2039: range in cui i numeri di 4 cifre sono anni, non standard.
YEAR_RANGE = set(range(2010, 2040))

# Standard non-numerici (sigle/acronimi presenti nei titoli).
TEXT_STANDARDS = {
    "SA8000", "EMAS", "ECOLABEL", "ECOVADIS", "GMP", "GACP",
    "CAM", "MARCATURACE", "MARCATURA", "MARCATURE", "QASER",
    "PDR", "BREVETTO",
}

# Tipi di audit con normalizzazione (es. "SA1" e "1SA" sono equivalenti).
AUDIT_MAP = {
    "IA": "IA", "RC": "RC", "RA": "RA",
    "SA1": "1SA", "1SA": "1SA",
    "SA2": "2SA", "2SA": "2SA",
    "SA3": "3SA", "3SA": "3SA",
    "SA": "SA", "IS": "IS",
}


def parse_titolo(titolo):
    """Estrae (standards, audits) dal Titolo ISO.

    Returns:
        Tuple[list[str], list[str]]: standard e tipi audit, deduplicati e
        preservando l'ordine di prima occorrenza.
    """
    if not titolo:
        return [], []
    raw = str(titolo).upper()
    # Normalizza tutti i separatori a singolo spazio
    s = re.sub(r"[_\s/\-\.:,;]+", " ", raw).strip()
    tokens = [t for t in s.split(" ") if t]

    standards, audits = [], []
    for tk in tokens:
        if "SA8000" in tk:
            standards.append("SA8000")
            continue
        if tk in TEXT_STANDARDS:
            standards.append(tk)
            continue
        if tk.isdigit():
            n = int(tk)
            if n in YEAR_RANGE:
                continue
            if len(tk) >= 4:
                standards.append(tk)
                continue
            if tk in STANDARD_SHORT:
                standards.append(STANDARD_SHORT[tk])
                continue
            continue
        if tk in AUDIT_MAP:
            audits.append(AUDIT_MAP[tk])

    standards = list(dict.fromkeys(standards))
    audits = list(dict.fromkeys(audits))
    return standards, audits
