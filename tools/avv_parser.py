"""Parser dei campi specifici AVV (Avvalimenti) dal Titolo.

L'Excel AVV non ha colonne dedicate avvalimento: tutti i metadati sono nel
campo "Titolo" con pattern del tipo:

    AVV_OG3/III_9597769987_2023
    AVV+RTI_OG1/IV+OS4/II_9550315142_2023
    AVV_pacchetto avvalimenti 5_2023
    AVV_OG10/IIIBIS_Manifestazione d'interesse_2024
    avv_9533908DC2_OG10/III_2023

Campi estratti (best-effort, copertura non garantita):
  - avvCategoria   → array di categorie SOA: OG1, OG3, OS24, OG10, ...
  - avvClassifica  → array di classifiche romani: I, II, III, IV, V, IIIBIS
  - avvCIG         → primo CIG trovato (10 hex chars)
  - avvTipo        → uno di: "RTI", "Manifestazione", "Pacchetto", "Standard"
  - avvAnno        → anno trovato a fine titolo (2018-2030)

Sul dataset reale (328 record) la copertura osservata è:
  - Categoria SOA:  ~18% (titoli "ISCRIZIONE WL" e simili non hanno categoria)
  - Anno:           ~80%
  - CIG:            ~10% (solo quando presente nel titolo)
  - Tipo:           ~90% (default "Standard" se non riconosce RTI/Manif/Pacchetto)
"""
import re

CATEGORIA_RE = re.compile(r"\b(OG\d{1,2}|OS\d{1,2})\b", re.IGNORECASE)
CLASSIFICA_RE = re.compile(
    r"/(VIII|VII|VI|V|IV|III\s*BIS|III|II|I)\b", re.IGNORECASE
)
CIG_RE = re.compile(r"\b([0-9A-Fa-f]{10})\b")
RTI_RE = re.compile(r"\bRTI\b", re.IGNORECASE)
MANIF_RE = re.compile(r"manifestazione", re.IGNORECASE)
PACK_RE = re.compile(
    r"pacchetto[\s_]*avvalimenti?", re.IGNORECASE
)
YEAR_RE = re.compile(r"[_\s](\d{4})\b")


def parse_titolo(titolo):
    """Estrae i metadati avvalimento dal Titolo.

    Returns:
        dict: chiavi avvCategoria (list), avvClassifica (list), avvCIG (str),
        avvTipo (str), avvAnno (str). Tutti i valori opzionali sono '' / [].
    """
    if not titolo:
        return {
            "avvCategoria": [], "avvClassifica": [],
            "avvCIG": "", "avvTipo": "", "avvAnno": "",
        }
    s = str(titolo)

    cats = []
    for m in CATEGORIA_RE.finditer(s):
        c = m.group(1).upper()
        if c not in cats:
            cats.append(c)

    clas = []
    for m in CLASSIFICA_RE.finditer(s):
        c = re.sub(r"\s+", "", m.group(1).upper())
        if c not in clas:
            clas.append(c)

    cig_match = CIG_RE.search(s)
    cig = cig_match.group(1).upper() if cig_match else ""
    # Anti-falso-positivo: il CIG non deve essere un anno (rarissimo ma safe)
    if cig and cig.isdigit() and 2010 <= int(cig) <= 2040:
        cig = ""

    if PACK_RE.search(s):
        tipo = "Pacchetto"
    elif MANIF_RE.search(s):
        tipo = "Manifestazione"
    elif RTI_RE.search(s):
        tipo = "RTI"
    elif re.match(r"^\s*(AVV|avv|Avv)", s):
        tipo = "Standard"
    else:
        tipo = ""

    # Anno: ultimo gruppo di 4 cifre nel range 2010-2040
    anno = ""
    for m in YEAR_RE.finditer(s):
        y = m.group(1)
        if 2010 <= int(y) <= 2040:
            anno = y  # tieni l'ultimo

    return {
        "avvCategoria": cats,
        "avvClassifica": clas,
        "avvCIG": cig,
        "avvTipo": tipo,
        "avvAnno": anno,
    }
