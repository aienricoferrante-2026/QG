"""Single source of truth: dashboard_ADMIN/config.js.
Tutti gli script Python che servono di sapere come tradurre header
italiano → camelCase passano da qui. Niente duplicazione."""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CONFIG_JS = os.path.join(ROOT, 'dashboard_ADMIN', 'config.js')


def load():
    """Ritorna (common, by_bu). Common è dict header→camelCase.
    by_bu è dict bu→dict header→camelCase (override per-BU)."""
    src = open(CONFIG_JS, encoding='utf-8').read()
    common = _parse_block(src, r'columnAliases:\s*\{(.*?)\n  \},\s*\n')
    by_bu = {}
    block = re.search(r'columnAliasesByBu:\s*\{(.*?)\n  \},?\s*\n\};', src, re.S)
    if block:
        for sec in re.finditer(r'\s+(\w+):\s*\{([^}]+)\}', block.group(1)):
            by_bu[sec.group(1)] = _parse_pairs(sec.group(2))
    return common, by_bu


def _parse_block(src, pattern):
    m = re.search(pattern, src, re.S)
    return _parse_pairs(m.group(1)) if m else {}


def _parse_pairs(text):
    """Estrae 'chiave': 'valore' o "chiave": 'valore' da un blocco JS."""
    out = {}
    for line in text.split('\n'):
        m = re.match(r"\s*'([^']+)'\s*:\s*'([^']+)'", line)
        if not m:
            m = re.match(r'\s*"([^"]+)"\s*:\s*\'([^\']+)\'', line)
        if m:
            out[m.group(1)] = m.group(2)
    return out


def apply(rec, bu=None):
    """Applica alias a un record. Per-BU vince sui comuni."""
    common, by_bu = load()
    overrides = by_bu.get(bu, {}) if bu else {}
    out = {}
    for k, v in rec.items():
        if k is None:
            continue
        ks = str(k).strip()
        key = overrides.get(ks) or common.get(ks) or ks
        if key in out and (out[key] not in ('', None)) and (v in ('', None)):
            continue
        out[key] = v
    return out
