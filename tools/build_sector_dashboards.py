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

SECTORS = {
    "SIC": {"label": "Sicurezza Lavoro", "icon": "🛡️", "color": "#06b6d4"},
    "AVV": {"label": "Avvalimenti", "icon": "🤝", "color": "#a78bfa"},
    "FIA": {"label": "Finanza Agevolata", "icon": "💼", "color": "#fbbf24"},
    "IST": {"label": "Istituti", "icon": "🏛️", "color": "#34d399"},
    "GAR": {"label": "Gare d'appalto", "icon": "🎯", "color": "#06b6d4"},
    "APL_PAL": {"label": "Politiche Attive", "icon": "💼", "color": "#a78bfa"},
    "APL_RES": {"label": "PAL Risorse", "icon": "👥", "color": "#10b981"},
    "GDPR": {"label": "Privacy / GDPR", "icon": "🔒", "color": "#ec4899"},
    # NB: per GDPR i filtri custom Stato Pagamento / Insoluti vanno aggiunti
    # in una chat Caso 2 dedicata (richiedono index.html custom come ISO).
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
                    {"id": "fIsoStandard",  "key": "isoStandard",  "label": "Standard",          "ph": "Tutti"},
                    {"id": "fIsoTipoAudit", "key": "isoTipoAudit", "label": "Tipo Audit",        "ph": "Tutti"},
                    {"id": "fIsoEnte",      "key": "isoEnte",      "label": "Ente",              "ph": "Tutti"},
                    {"id": "fCliente",      "key": "cliente",      "label": "Cliente",           "ph": "Tutti"},
                    {"id": "fSocieta",      "key": "societa",      "label": "Societa",           "ph": "Tutte"},
                    {"id": "fSede",         "key": "sedeNorm",     "label": "Sede",              "ph": "Tutte"},
                    {"id": "fRegione",      "key": "regione",      "label": "Regione",           "ph": "Tutte"},
                    {"id": "fResp",         "key": "responsabile", "label": "Responsabile",      "ph": "Tutti"},
                    {"id": "fFunzione",     "key": "funzione",     "label": "Funzione",          "ph": "Tutte"},
                ],
                "extraSections": ["enti", "audit"],
            }},
}

CONFIG_JS_HEADER = """/* SECTOR_CONFIG — Settore {code} — {label}
 * Generato da tools/build_sector_dashboards.py.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = """


def build_config(sector, info):
    """Costruisce il dizionario JS-friendly che SECTOR_CONFIG deve contenere."""
    cfg = {
        "code": sector,
        "label": info["label"],
        "icon": info["icon"],
        "color": info["color"],
        "dataFile": f"data/commesse_{sector.lower()}.json",
        "adminEmail": "formazione@qualificagroup.it",
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
