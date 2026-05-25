"""Analizza un JSON dashboard: per ogni chiave estrae tipo, coverage, sample."""
import os, re, json
from .config import ROOT, BU_JSON


def detect_type(val):
    """Best-effort: che tipo è questo valore?"""
    if val is None or val == '': return 'null'
    if isinstance(val, bool): return 'boolean'
    if isinstance(val, int): return 'integer'
    if isinstance(val, float): return 'number'
    if isinstance(val, list): return 'array'
    if isinstance(val, dict): return 'object'
    s = str(val).strip()
    if re.match(r'^\d{1,2}[-/]\d{1,2}[-/]\d{4}$', s): return 'date (dd-mm-yyyy)'
    if re.match(r'^https?://', s): return 'url'
    if re.match(r'^-?\d+(\.\d+)?$', s):
        return 'integer' if '.' not in s else 'number'
    return 'string'


def analyze(bu):
    """Per il BU dato, ritorna (fields_dict, total_count) o (None, 0)."""
    full = os.path.join(ROOT, BU_JSON[bu])
    if not os.path.exists(full):
        return None, 0
    with open(full, encoding='utf-8') as f:
        data = json.load(f)
    if not data:
        return {}, 0
    fields = {}  # key → {type, sample, nonnull}
    for rec in data:
        for k, v in rec.items():
            if k not in fields:
                fields[k] = {'type': 'null', 'sample': None, 'nonnull': 0}
            if v not in (None, ''):
                fields[k]['nonnull'] += 1
                if fields[k]['sample'] is None:
                    fields[k]['sample'] = v
                    fields[k]['type'] = detect_type(v)
    return fields, len(data)
