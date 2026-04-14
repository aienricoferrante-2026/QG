/* ── Filter Logic (Multi-Select) ── */

const FILTER_DEFS = [
  { id: 'fStatus', key: 'status', ph: 'Tutti' },
  { id: 'fCat', key: 'categoria', ph: 'Tutte' },
  { id: 'fAgente', key: 'agente', ph: 'Tutti' },
  { id: 'fSocieta', key: 'societa', ph: 'Tutte' },
  { id: 'fSede', key: 'sede_op', ph: 'Tutte' },
  { id: 'fAnno', key: 'anno', ph: 'Tutti' }
];

function _norm(v) { return (v && String(v).trim()) ? String(v) : 'N/D'; }

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
    const others = FILTER_DEFS.filter(f => f.id !== fd.id);
    const base = D.filter(c => { for (const o of others) { if (!MultiSelect.matches(o.id, _norm(c[o.key]))) return false; } return true; });
    const vals = [...new Set(base.map(c => _norm(c[fd.key])))].sort();
    MultiSelect.updateOptions(fd.id, vals, v => base.filter(c => _norm(c[fd.key]) === v).length);
  });
}

function applyFilters() {
  filtered = D.filter(c => {
    for (const f of FILTER_DEFS) { if (!MultiSelect.matches(f.id, _norm(c[f.key]))) return false; }
    return true;
  });
  rebuildFilterCounts();
  renderFilteredKpis();
  renderActiveFilters();
  renderCurrentSection();
}

function resetFilters() { MultiSelect.resetAll(); applyFilters(); }

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  const labels = { fStatus:'Status', fCat:'Categoria', fAgente:'Commerciale', fSocieta:'Societa', fSede:'Sede Op.', fAnno:'Anno' };
  let h = '';
  FILTER_DEFS.forEach(f => {
    const sel = MultiSelect.getSelected(f.id);
    if (sel.size > 0) {
      const txt = sel.size === 1 ? [...sel][0] : sel.size + ' sel.';
      h += '<span class="filter-chip">' + (labels[f.id]||f.id) + ': ' + (txt.length>25?txt.substring(0,23)+'..':txt) + '<span class="chip-x" onclick="MultiSelect.reset(\''+f.id+'\');applyFilters()">×</span></span>';
    }
  });
  el.innerHTML = h;
}
