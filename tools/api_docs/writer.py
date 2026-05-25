"""Scrive i singoli file markdown (uno per BU + indici/mappe)."""
import os, json
from collections import defaultdict
from datetime import datetime
from .config import ROOT, DOCS_DIR, BU_JSON


def _fmt_sample(s):
    if s is None: return ''
    if isinstance(s, str) and len(s) > 40: s = s[:37] + '...'
    return json.dumps(s, ensure_ascii=False)


def _inverse_alias(common, by_bu):
    """camelCase → list di (bu, header_italiano). Per la colonna 'Header Excel'."""
    inv = defaultdict(list)
    for it, cc in common.items(): inv[cc].append(('*', it))
    for bu, m in by_bu.items():
        for it, cc in m.items(): inv[cc].append((bu, it))
    return inv


def write_bu_page(bu, fields, total, inv, descriptions):
    """Scrive docs/campi-api/<bu>.md (~50-80 righe)."""
    slug = bu.lower().replace('_', '-')
    lines = [
        f'# {bu} · Campi disponibili\n',
        f'_File JSON sorgente: `{BU_JSON[bu]}` · {total} record._\n',
        '[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)\n\n',
        '| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |\n',
        '|---|---|---|---|---|---|\n',
    ]
    for k in sorted(fields):
        f = fields[k]
        cov = f'{f["nonnull"]}/{total}' if total else '–'
        samples = inv.get(k, [])
        bu_alias = [it for b, it in samples if b == bu]
        com_alias = [it for b, it in samples if b == '*']
        ital = ', '.join(bu_alias) if bu_alias else (', '.join(com_alias) or '_(no alias)_')
        sample = _fmt_sample(f['sample'])
        lines.append(f'| `{k}` | {f["type"]} | {ital} | {cov} | `{sample}` | {descriptions.get(k, "")} |\n')
    out = os.path.join(DOCS_DIR, f'{slug}.md')
    open(out, 'w', encoding='utf-8').write(''.join(lines))
    return out


def write_alias_map(common, by_bu):
    """Scrive docs/campi-api/_alias-map.md (~80 righe)."""
    lines = ['# Mappa alias Excel italiano → camelCase\n',
             '[← Indice](README.md)\n\n',
             '_Fonte canonica: `dashboard_ADMIN/config.js`. Questo file è auto-generato._\n\n',
             '## Comuni (applicate a tutte le BU)\n\n',
             '| Header Excel | Chiave camelCase |\n|---|---|\n']
    for it in sorted(common):
        lines.append(f'| `{it}` | `{common[it]}` |\n')
    lines.append('\n## Per-BU (vincono sui comuni)\n')
    for bu in sorted(by_bu):
        lines.append(f'\n### {bu}\n\n| Header Excel | Chiave camelCase |\n|---|---|\n')
        for it in sorted(by_bu[bu]):
            lines.append(f'| `{it}` | `{by_bu[bu][it]}` |\n')
    open(os.path.join(DOCS_DIR, '_alias-map.md'), 'w', encoding='utf-8').write(''.join(lines))


def write_endpoints():
    """Scrive docs/campi-api/_endpoints.md (~30 righe)."""
    lines = ['# Endpoint API suggeriti\n',
             '[← Indice](README.md)\n\n',
             'Base path proposto: `https://api.qualificagroup.org/v1/`\n\n',
             '| Risorsa | Endpoint | Schema campi |\n|---|---|---|\n']
    for bu in BU_JSON:
        slug = bu.lower().replace('_', '-')
        lines.append(f'| Commesse {bu} | `GET /commesse/{slug}` | [{bu}]({slug}.md) |\n')
    lines.append('\n## Filtri standard (query string)\n')
    lines.append('- `?status=In%20Lavorazione`\n')
    lines.append('- `?from=2026-01-01&to=2026-12-31` — range data inizio\n')
    lines.append('- `?fine_from=2026-01-01&fine_to=2026-12-31` — range data fine\n')
    lines.append('- `?cliente=<nome>` `?agente=<nome>`\n')
    lines.append('- `?limit=1000&offset=0` — paginazione\n')
    open(os.path.join(DOCS_DIR, '_endpoints.md'), 'w', encoding='utf-8').write(''.join(lines))


def write_readme(bu_stats):
    """Scrive docs/campi-api/README.md (~30 righe)."""
    lines = ['# Dizionario Campi API · Dashboard STW Qualifica\n',
             f'_Auto-generato il {datetime.now().strftime("%Y-%m-%d %H:%M")} da `tools/api_docs/`._\n\n',
             'Sorgenti di verità: `dashboard_ADMIN/config.js` (alias) + JSON dashboard.\n\n',
             '## BU disponibili\n\n',
             '| BU | Record | Schema campi |\n|---|---:|---|\n']
    for bu, total in bu_stats.items():
        slug = bu.lower().replace('_', '-')
        lines.append(f'| {bu} | {total} | [{slug}.md]({slug}.md) |\n')
    lines.append('\n## Risorse trasversali\n\n')
    lines.append('- [Mappa alias Excel→camelCase](_alias-map.md)\n')
    lines.append('- [Endpoint API suggeriti](_endpoints.md)\n')
    lines.append('- [Descrizioni campi (data)](_descriptions.json)\n\n')
    lines.append('## Rigenerare\n\n```bash\npython3 tools/generate_api_fields_doc.py\n```\n')
    open(os.path.join(DOCS_DIR, 'README.md'), 'w', encoding='utf-8').write(''.join(lines))
