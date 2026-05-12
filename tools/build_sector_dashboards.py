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
    "AVV": {"label": "Avvalimenti", "icon": "⚖️", "color": "#a78bfa"},
    "FIA": {"label": "Finanza Agevolata", "icon": "💼", "color": "#fbbf24"},
    "IST": {"label": "Istituti", "icon": "🏛️", "color": "#34d399"},
}

CONFIG_JS = """/* SECTOR_CONFIG — Settore {code} — {label}
 * Dashboard "base" generata dal template multi-settore.
 * Modifiche manuali fatte qui sopravvivono finché non si rigenera.
 */
window.SECTOR_CONFIG = {{
  code: '{code}',
  label: '{label}',
  icon: '{icon}',
  color: '{color}',
  dataFile: 'data/commesse_{code_lower}.json',
  adminEmail: 'formazione@qualificagroup.it',
  defaultSection: 'executive',
  partnersJsonUrl: 'partners_{code_lower}/_links.json',
  partnersBaseUrl: 'partners_{code_lower}/view.html'
}};
"""


def build_index(sector, info, count):
    template_html = TEMPLATE.read_text(encoding="utf-8")
    title = f"Dashboard {info['label']} {info['icon']}"
    brand_sub = f"Dashboard {info['label']} v1"
    out_html = (template_html
                .replace("{{TITLE}}", title)
                .replace("{{BRAND_SUB}}", brand_sub)
                .replace("{{COUNT}}", f"{count:,}".replace(",", ".")))
    out_dir = ROOT / f"dashboard_{sector}_CM"
    out_dir.mkdir(exist_ok=True)
    (out_dir / "index.html").write_text(out_html, encoding="utf-8")
    config_js = CONFIG_JS.format(
        code=sector, code_lower=sector.lower(),
        label=info["label"], icon=info["icon"], color=info["color"]
    )
    (out_dir / "config.js").write_text(config_js, encoding="utf-8")
    print(f"[{sector}] {out_dir.name}/index.html + config.js")


def main():
    counts_file = ROOT / "tools" / "sector_counts.json"
    counts = json.loads(counts_file.read_text()) if counts_file.exists() else {}
    for sector, info in SECTORS.items():
        build_index(sector, info, counts.get(sector, 0))


if __name__ == "__main__":
    main()
