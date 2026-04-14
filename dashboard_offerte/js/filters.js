/* ── Filter Logic (Multi-Select) ── */

const FILTER_DEFS = [
  { id: 'f-status', key: 'status', ph: 'Tutti' },
  { id: 'f-cat', key: 'categoria', ph: 'Tutte' },
  { id: 'f-agente', key: 'agente', ph: 'Tutti' },
  { id: 'f-societa', key: 'societa', ph: 'Tutte' },
  { id: 'f-sede', key: 'sede_op', ph: 'Tutte' },
  { id: 'f-anno', key: 'anno', ph: 'Tutti', numeric: true }
];

function initFilters() {
  FILTER_DEFS.forEach(f => {
    let vals;
    if (f.numeric) vals = [...new Set(DATA.map(d => d[f.key]).filter(y => y > 0))].sort();
    else vals = [...new Set(DATA.map(d => d[f.key]).filter(v => v && v.trim()))].sort();
    MultiSelect.create(f.id, vals, f.ph, { onChange: applyFilters });
  });

  document.querySelectorAll('.filters input[type=month]')
    .forEach(el => el.addEventListener('change', applyFilters));
}

function applyFilters() {
  const ff = document.getElementById('f-from').value;
  const ft = document.getElementById('f-to').value;

  filtered = DATA.filter(d => {
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, d[f.key])) return false;
    }
    if (ff && d.data < ff) return false;
    if (ft && d.data > ft) return false;
    return true;
  });

  page = 0;
  updateAll();
}

function resetFilters() {
  MultiSelect.resetAll();
  document.querySelectorAll('.filters input[type=month]').forEach(i => i.value = '');
  applyFilters();
}
