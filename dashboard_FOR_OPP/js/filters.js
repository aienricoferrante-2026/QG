/* ── Filter Logic (Multi-Select) ── */

const FILTER_DEFS = [
  { id: 'fStatus', key: 'status', ph: 'Tutti' },
  { id: 'fStatoPrev', key: 'statoPrev', ph: 'Tutti' },
  { id: 'fCorso', key: 'corso', ph: 'Tutti' },
  { id: 'fTipo', key: 'tipologiaCorso', ph: 'Tutti' },
  { id: 'fCpi', key: 'cpi', ph: 'Tutti' },
  { id: 'fOp', key: 'operatore', ph: 'Tutti' },
  { id: 'fRend', key: 'rendicontazione', ph: 'Tutti' }
];

function _norm(v) { return (v && v.trim()) ? v : 'N/D'; }

function initFilters() {
  FILTER_DEFS.forEach(f => {
    const vals = [...new Set(D.map(c => _norm(c[f.key])))].sort();
    MultiSelect.create(f.id, vals, f.ph, {
      onChange: applyFilters,
      countFn: v => D.filter(c => _norm(c[f.key]) === v).length
    });
  });
}

function rebuildFilterCounts() {
  FILTER_DEFS.forEach(fd => {
    const otherFilters = FILTER_DEFS.filter(f => f.id !== fd.id);
    const baseItems = D.filter(c => {
      for (const of2 of otherFilters) {
        if (!MultiSelect.matches(of2.id, _norm(c[of2.key]))) return false;
      }
      return true;
    });
    const vals = [...new Set(baseItems.map(c => _norm(c[fd.key])))].sort();
    MultiSelect.updateOptions(fd.id, vals, v => baseItems.filter(c => _norm(c[fd.key]) === v).length);
  });
}

function applyFilters() {
  filtered = D.filter(c => {
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, _norm(c[f.key]))) return false;
    }
    return true;
  });
  rebuildFilterCounts();
  renderFilteredKpis();
  renderActiveFilters();
  renderCurrentSection();
}

function resetFilters() {
  MultiSelect.resetAll();
  applyFilters();
}

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  const labels = {
    fStatus: 'Status', fStatoPrev: 'Stato Prev.', fCorso: 'Corso',
    fTipo: 'Tipologia', fCpi: 'CPI', fOp: 'Operatore', fRend: 'Rendicontazione'
  };
  let h = '';
  FILTER_DEFS.forEach(f => {
    const sel = MultiSelect.getSelected(f.id);
    if (sel.size > 0) {
      const txt = sel.size === 1 ? [...sel][0] : sel.size + ' sel.';
      const short = txt.length > 25 ? txt.substring(0, 23) + '..' : txt;
      h += '<span class="filter-chip">' + (labels[f.id] || f.id) + ': ' + short +
        '<span class="chip-x" onclick="MultiSelect.reset(\'' + f.id + '\');applyFilters()">×</span></span>';
    }
  });
  el.innerHTML = h;
}
