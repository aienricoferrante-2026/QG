/* Global filter system with active filter chips (Multi-Select) */
let filtered = [];

const FILTER_DEFS = [
  { id: 'fAnno', key: 'an', ph: 'Tutti', numeric: true },
  { id: 'fStatus', key: 'st', ph: 'Tutti' },
  { id: 'fSpag', key: 'sps', ph: 'Tutti' },
  { id: 'fSlav', key: 'sl', ph: 'Tutti' },
  { id: 'fAgente', key: 'ag', ph: 'Tutti' },
  { id: 'fResp', key: 'rp', ph: 'Tutti' },
  { id: 'fRegione', key: 'rg', ph: 'Tutte' },
  { id: 'fProv', key: 'pv', ph: 'Tutte' },
  { id: 'fCitta', key: 'ci', ph: 'Tutti' },
  { id: 'fContratto', key: 'ct', ph: 'Tutti' }
];

const FILTER_LABELS = {
  fAnno: 'Anno', fStatus: 'Status', fSpag: 'Stato Pag.', fSlav: 'Stato Lav.',
  fAgente: 'Commerciale', fResp: 'Responsabile', fRegione: 'Regione',
  fProv: 'Provincia', fCitta: 'Citta', fContratto: 'Contratto'
};

function initFilters() {
  filtered = D.commesse;
  FILTER_DEFS.forEach(f => {
    let vals;
    if (f.numeric) {
      vals = [...new Set(D.commesse.map(c => c[f.key]).filter(a => a > 0))].sort();
    } else {
      vals = [...new Set(D.commesse.map(c => c[f.key]).filter(Boolean))].sort();
    }
    MultiSelect.create(f.id, vals, f.ph, { onChange: applyFilters });
  });
}

function applyFilters() {
  filtered = D.commesse.filter(c => {
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, c[f.key])) return false;
    }
    return true;
  });
  renderFilterChips();
  renderFilteredKpis();
  renderCurrentSection();
}

function resetFilters() {
  MultiSelect.resetAll();
  filtered = D.commesse;
  renderFilterChips();
  renderFilteredKpis();
  renderCurrentSection();
}

/* Remove single filter via chip X */
function removeFilter(id) {
  MultiSelect.reset(id);
  applyFilters();
}

/* Render active filter chips */
function renderFilterChips() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  let h = '';
  FILTER_DEFS.forEach(f => {
    const sel = MultiSelect.getSelected(f.id);
    if (sel.size > 0) {
      const txt = sel.size === 1 ? String([...sel][0]) : sel.size + ' sel.';
      const short = txt.length > 25 ? txt.substring(0, 23) + '..' : txt;
      h += '<span class="filter-chip">' + FILTER_LABELS[f.id] + ': ' + short +
        ' <span class="chip-x" onclick="removeFilter(\'' + f.id + '\')">&times;</span></span>';
    }
  });
  el.innerHTML = h;
}

/* Filtered KPIs — clickable */
function renderFilteredKpis() {
  const n = filtered.length;
  const cons = filtered.reduce((s, c) => s + c.co, 0);
  const ente = filtered.reduce((s, c) => s + c.en, 0);
  const eseg = filtered.filter(c => c.st === 'Eseguito').length;
  const cli = new Set(filtered.map(c => c.cl)).size;

  const el = document.getElementById('filteredKpis');
  el.innerHTML = [
    kpiCard(fmt(n), 'Commesse', 'c1', "drillDownCustom('Tutte le Commesse',()=>true)"),
    kpiCard(fmt(cli), 'Clienti', 'c2'),
    kpiCard(fmtE(cons), 'Fatt. Consulenza', 'c3'),
    kpiCard(fmtE(ente), 'Fatt. Ente', 'c4'),
    kpiCard(fmtE(cons + ente), 'Fatturato Totale', 'c1'),
    kpiCard(n ? fmtP(eseg / n * 100) : '0%', 'Tasso Esecuzione', 'c3',
      "drillDownCustom('Commesse Eseguite',c=>c.st==='Eseguito')"),
  ].join('');
}

function kpiCard(val, label, cls, onclick) {
  const click = onclick ? ' clickable" onclick="' + onclick : '';
  return '<div class="kpi-card ' + cls + click + '">' +
    '<div class="kpi-val">' + val + '</div>' +
    '<div class="kpi-lbl">' + label + '</div>' +
    (onclick ? '<div class="kpi-sub">Click per dettaglio &#8594;</div>' : '') +
    '</div>';
}
