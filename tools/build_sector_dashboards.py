#!/usr/bin/env python3
"""Genera index.html + config.js per le 4 dashboard "base" (SIC, AVV, FIA, IST)
a partire dal template `shared/dashboard-core/index-template.html`.

Il config.js per ognuna definisce code/label/icon/dataFile/adminEmail e i path
per le mini-dashboard partner (placeholder finché non vengono generate).
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "shared" / "dashboard-core" / "index-template.html"

# Credenziali per settore (email + SHA-256 password). Master sempre valido:
# direzione@qualificagroup.it / Qualifica!26  — vedi auth.js.
# (FOR autonomo ha lo stesso schema in dashboard_FOR_CM/js/auth.js;
# le sue credenziali settoriali sono for@qualificagroup.it / 256FOR913.)
SECTOR_CREDS = {
    "ISO":     ("iso@qualificagroup.it", "82613189a48bbd580f43cda212078e94f328c8970b63bf9d766ff713dc2b6c51"),
    "SIC":     ("sic@qualificagroup.it", "9512ceba12579123a8a2c6dbd0adc70efa01df6316426c1c416f874c716cc183"),
    "AVV":     ("avv@qualificagroup.it", "ef8b41fbadc535e58755bee0db8857c3b35ef898a784065540a0822d906e06a5"),
    "FIA":     ("fia@qualificagroup.it", "082c0e1b841029d4ef449f25e03f719e952368ac422703b3e151aa57df527f26"),
    "IST":     ("ist@qualificagroup.it", "e3b89a8203d60048c394223fad050b0368510d7198c10671b17b249a4369e263"),
    "SOA":     ("soa@qualificagroup.it", "d28673a3e666f6fc7d128e35a08e3395a639e7c7d3263cf7fed1f653850efa91"),
    "GAR":     ("gar@qualificagroup.it", "e900f1030962c2859b291864047c18a77096791e4071685abbac907870417d41"),
    "GDPR":    ("gdp@qualificagroup.it", "f7aea5e2742cf7d20f8065e4b6ddf71fc63903121c2c97dab7fc166b10d52c53"),
    "APL_PAL": ("pal@qualificagroup.it", "6e51265e644d9ed6ee109c245e63db67094312403f0a39ee4402656ec865e043"),
    "APL_RES": ("res@qualificagroup.it", "92deb5cbccacea3c8d61a2bb6cdcdb7d65bca2738f1dc7c4df8e72f3ca008b2f"),
}

SECTORS = {
    "SIC": {"label": "Sicurezza Lavoro", "icon": "🛡️", "color": "#06b6d4"},
    "AVV": {"label": "Avvalimenti", "icon": "🤝", "color": "#a78bfa",
            "custom_index": True,
            "extra_config": {
                "filters": [
                    {"id": "fStatus",        "key": "status",        "label": "Status",            "ph": "Tutti"},
                    {"id": "fStatoLav",      "key": "statoLav",      "label": "Stato Lavorazione", "ph": "Tutti"},
                    {"id": "fAvvCategoria",  "key": "avvCategoria",  "label": "Categoria SOA",     "ph": "Tutte", "splitBy": " + "},
                    {"id": "fAvvTipo",       "key": "avvTipo",       "label": "Tipo Avvalimento",  "ph": "Tutti"},
                    {"id": "fAvvAnno",       "key": "avvAnno",       "label": "Anno",              "ph": "Tutti"},
                    {"id": "fCliente",       "key": "cliente",       "label": "Cliente",           "ph": "Tutti"},
                    {"id": "fSocieta",       "key": "societa",       "label": "Societa",           "ph": "Tutte"},
                    {"id": "fRegione",       "key": "regione",       "label": "Regione",           "ph": "Tutte"},
                    {"id": "fResp",          "key": "responsabile",  "label": "Responsabile",      "ph": "Tutti"},
                ],
                "extraSections": ["avvalimenti"],
            }},
    "FIA": {"label": "Finanza Agevolata", "icon": "💼", "color": "#fbbf24"},
    "IST": {"label": "Istituti", "icon": "🏛️", "color": "#34d399"},
    "GAR": {"label": "Gare d'appalto", "icon": "🎯", "color": "#06b6d4"},
    "APL_PAL": {"label": "Politiche Attive", "icon": "💼", "color": "#a78bfa"},
    "APL_RES": {"label": "PAL Risorse", "icon": "👥", "color": "#10b981"},
    "GDPR": {"label": "Privacy / GDPR", "icon": "🔒", "color": "#ec4899",
             "custom_index": True,
             "extra_config": {
                 "filters": [
                     {"id": "fStatus",          "key": "status",       "label": "Status",            "ph": "Tutti"},
                     {"id": "fStatoLav",        "key": "statoLav",     "label": "Stato Lavorazione", "ph": "Tutti"},
                     {"id": "fGdprStatoPag",    "key": "gdprStatoPag", "label": "Stato Pagamento",   "ph": "Tutti"},
                     {"id": "fCliente",         "key": "cliente",      "label": "Cliente",           "ph": "Tutti"},
                     {"id": "fSocieta",         "key": "societa",      "label": "Societa",           "ph": "Tutte"},
                     {"id": "fSede",            "key": "sedeNorm",     "label": "Sede",              "ph": "Tutte"},
                     {"id": "fRegione",         "key": "regione",      "label": "Regione",           "ph": "Tutte"},
                     {"id": "fResp",            "key": "responsabile", "label": "Responsabile",      "ph": "Tutti"},
                     {"id": "fFunzione",        "key": "funzione",     "label": "Funzione",          "ph": "Tutte"},
                 ],
                 "extraSections": ["pagamentiGdpr"],
             }},
    # ISO usa il kit per i file JS comuni ma ha un proprio index.html
    # scritto a mano (Caso 2 della governance) con filtri Standard / Tipo Audit /
    # Ente e sezioni custom in dashboard_ISO_CM/js/. Per ISO il build genera
    # SOLO il config.js, l'index.html non viene rigenerato.
    "ISO": {"label": "Certificazioni ISO", "icon": "📜", "color": "#3b82f6",
            "custom_index": True,
            "extra_config": {
                "filters": [
                    {"id": "fStatus",       "key": "status",       "label": "Status",            "ph": "Tutti"},
                    {"id": "fStatoLav",     "key": "statoLav",     "label": "Stato Lavorazione", "ph": "Tutti"},
                    {"id": "fIsoStandard",  "key": "isoStandard",  "label": "Standard",          "ph": "Tutti", "splitBy": " + "},
                    {"id": "fIsoTipoAudit", "key": "isoTipoAudit", "label": "Tipo Audit",        "ph": "Tutti", "splitBy": " + "},
                    {"id": "fIsoEnte",       "key": "isoEnte",             "label": "Ente",              "ph": "Tutti"},
                    {"id": "fIsoStatoCert",  "key": "isoStatoCert",        "label": "Stato Certificato", "ph": "Tutti"},
                    {"id": "fIsoStatoPag",   "key": "isoStatoPagamentoTxt","label": "Stato Pagamento",   "ph": "Tutti"},
                    {"id": "fCliente",       "key": "cliente",             "label": "Cliente",           "ph": "Tutti"},
                    {"id": "fSocieta",      "key": "societa",      "label": "Societa",           "ph": "Tutte"},
                    {"id": "fSede",         "key": "sedeNorm",     "label": "Sede",              "ph": "Tutte"},
                    {"id": "fRegione",      "key": "regione",      "label": "Regione",           "ph": "Tutte"},
                    {"id": "fResp",         "key": "responsabile", "label": "Responsabile",      "ph": "Tutti"},
                    {"id": "fFunzione",     "key": "funzione",     "label": "Funzione",          "ph": "Tutte"},
                ],
                "extraSections": ["enti", "audit", "certificati", "pagamenti", "scopo"],
            }},
}

CONFIG_JS_HEADER = """/* SECTOR_CONFIG — Settore {code} — {label}
 * Generato da tools/build_sector_dashboards.py.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = """


def build_config(sector, info):
    """Costruisce il dizionario JS-friendly che SECTOR_CONFIG deve contenere."""
    # Fallback al Master nuovo per eventuali settori non in SECTOR_CREDS.
    creds = SECTOR_CREDS.get(sector, ("direzione@qualificagroup.it",
        "5bb40be187baff36150a637bacf46f1b6c75eb1e51efebf6f71d6ad5c92af43a"))
    cfg = {
        "code": sector,
        "label": info["label"],
        "icon": info["icon"],
        "color": info["color"],
        "dataFile": f"data/commesse_{sector.lower()}.json",
        "adminEmail": creds[0],
        "adminPassHash": creds[1],
        "defaultSection": "executive",
        "partnersJsonUrl": f"partners_{sector.lower()}/_links.json",
        "partnersBaseUrl": f"partners_{sector.lower()}/view.html",
    }
    if info.get("extra_config"):
        cfg.update(info["extra_config"])
    return cfg


def build_index(sector, info, count):
    out_dir = ROOT / f"dashboard_{sector}_CM"
    out_dir.mkdir(exist_ok=True)

    # ISO ha il suo index.html custom — non rigenerare
    if not info.get("custom_index"):
        template_html = TEMPLATE.read_text(encoding="utf-8")
        title = f"Dashboard {info['label']} {info['icon']}"
        brand_sub = f"Dashboard {info['label']} v1"
        out_html = (template_html
                    .replace("{{TITLE}}", title)
                    .replace("{{BRAND_SUB}}", brand_sub)
                    .replace("{{COUNT}}", f"{count:,}".replace(",", ".")))
        (out_dir / "index.html").write_text(out_html, encoding="utf-8")
        action = "index.html + config.js"
    else:
        action = "config.js (index custom)"

    cfg = build_config(sector, info)
    config_js = CONFIG_JS_HEADER.format(code=sector, label=info["label"]) \
        + json.dumps(cfg, ensure_ascii=False, indent=2) + ";\n"
    (out_dir / "config.js").write_text(config_js, encoding="utf-8")
    print(f"[{sector}] {out_dir.name}/ — {action}")


def main():
    counts_file = ROOT / "tools" / "sector_counts.json"
    counts = json.loads(counts_file.read_text()) if counts_file.exists() else {}
    for sector, info in SECTORS.items():
        build_index(sector, info, counts.get(sector, 0))


if __name__ == "__main__":
    main()
