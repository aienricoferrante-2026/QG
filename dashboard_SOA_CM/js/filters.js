/* ── Filter Logic with dynamic counts (Multi-Select) ── */

const FILTER_DEFS = [
  { id: 'fStatus', key: 'status', ph: 'Tutti' },
  { id: 'fStatoLav', key: 'statoLav', ph: 'Tutti' },
  { id: 'fAgente', key: 'agente', ph: 'Tutti' },
  { id: 'fResp', key: 'responsabile', ph: 'Tutti' },
  { id: 'fSoa', key: 'soaAttestante', ph: 'Tutti' },
  { id: 'fCitta', key: 'citta', ph: 'Tutte' }
];

function initFilters() {
  FILTER_DEFS.forEach(f => {
    const vals = [...new Set(D.map(c => c[f.key]).filter(v => v && v.trim()))].sort();
    MultiSelect.create(f.id, vals, f.ph, {
      onChange: applyFilters,
      countFn: v => D.filter(c => c[f.key] === v).length
    });
  });
}

function rebuildFilterCounts() {
  FILTER_DEFS.forEach(fd => {
    const otherFilters = FILTER_DEFS.filter(f => f.id !== fd.id);
    const baseItems = D.filter(c => {
      for (const of2 of otherFilters) {
        if (!MultiSelect.matches(of2.id, c[of2.key])) return false;
      }
      return true;
    });
    const vals = [...new Set(baseItems.map(c => c[fd.key]).filter(v => v && v.trim()))].sort();
    MultiSelect.updateOptions(fd.id, vals, v => baseItems.filter(c => c[fd.key] === v).length);
  });
}

function applyFilters() {
  filtered = D.filter(c => {
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, c[f.key])) return false;
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
  let h = '';
  FILTER_DEFS.forEach(f => {
    const sel = MultiSelect.getSelected(f.id);
    if (sel.size > 0) {
      const label = f.id.replace('f', '');
      const txt = sel.size === 1 ? [...sel][0] : sel.size + ' sel.';
      const short = txt.length > 25 ? txt.substring(0, 23) + '..' : txt;
      h += '<span class="filter-chip">' + label + ': ' + short +
        '<span class="chip-x" onclick="MultiSelect.reset(\'' + f.id + '\');applyFilters()">×</span></span>';
    }
  });
  el.innerHTML = h;
}
