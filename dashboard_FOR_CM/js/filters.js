/* ── Period Filter (range temporale globale) ──
   Filtra le commesse per c.dataInizio (gg-mm-yyyy / gg/mm/yyyy).
   Predefinito: 'all' (tutto). I preset coprono i casi più comuni;
   'custom' apre due input date da-a. */

let _periodFilter = { kind: 'all', from: null, to: null };

function _parseDDMMYYYY(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}
function _toIso(d) {
  if (!d) return '';
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return yy + '-' + mm + '-' + dd;
}
function _fromIso(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
}

function _periodRange() {
  const today = new Date();
  switch (_periodFilter.kind) {
    case 'all':
      return { from: null, to: null };
    case 'last30': {
      const f = new Date(today); f.setDate(f.getDate() - 30); return { from: f, to: today };
    }
    case 'last90': {
      const f = new Date(today); f.setDate(f.getDate() - 90); return { from: f, to: today };
    }
    case 'last12m': {
      const f = new Date(today); f.setMonth(f.getMonth() - 12); return { from: f, to: today };
    }
    case 'y2026':
      return { from: new Date(2026, 0, 1), to: new Date(2026, 11, 31, 23, 59, 59) };
    case 'y2025':
      return { from: new Date(2025, 0, 1), to: new Date(2025, 11, 31, 23, 59, 59) };
    case 'y2024':
      return { from: new Date(2024, 0, 1), to: new Date(2024, 11, 31, 23, 59, 59) };
    case 'y2023':
      return { from: new Date(2023, 0, 1), to: new Date(2023, 11, 31, 23, 59, 59) };
    case 'custom':
      return { from: _periodFilter.from, to: _periodFilter.to };
    default:
      return { from: null, to: null };
  }
}

function _periodPredicate(c) {
  const r = _periodRange();
  if (!r.from && !r.to) return true;
  const d = _parseDDMMYYYY(c.dataInizio) || _parseDDMMYYYY(c.dataPianInizio);
  if (!d) return false;
  if (r.from && d < r.from) return false;
  if (r.to && d > r.to) return false;
  return true;
}

function setPeriodKind(kind) {
  _periodFilter.kind = kind || 'all';
  if (kind !== 'custom') {
    _periodFilter.from = null;
    _periodFilter.to = null;
  }
  renderPeriodFilter();
  applyFilters();
}

function setPeriodCustom(fromIso, toIso) {
  _periodFilter.kind = 'custom';
  _periodFilter.from = _fromIso(fromIso);
  _periodFilter.to = _fromIso(toIso);
  if (_periodFilter.to) {
    // Includo l'intera giornata "to"
    const t = new Date(_periodFilter.to);
    t.setHours(23, 59, 59, 999);
    _periodFilter.to = t;
  }
  renderPeriodFilter();
  applyFilters();
}

function renderPeriodFilter() {
  const el = document.getElementById('periodFilter');
  if (!el) return;
  const opts = [
    { v: 'all', label: 'Tutto' },
    { v: 'last30', label: 'Ultimi 30 giorni' },
    { v: 'last90', label: 'Ultimi 90 giorni' },
    { v: 'last12m', label: 'Ultimi 12 mesi' },
    { v: 'y2026', label: '2026' },
    { v: 'y2025', label: '2025' },
    { v: 'y2024', label: '2024' },
    { v: 'y2023', label: '2023' },
    { v: 'custom', label: 'Personalizza…' }
  ];
  let h = '<span class="qf-label">Periodo (data inizio):</span>';
  h += '<select id="pf-select" onchange="setPeriodKind(this.value)" class="period-select">';
  opts.forEach(o => {
    h += '<option value="' + o.v + '"' + (_periodFilter.kind === o.v ? ' selected' : '') + '>' + o.label + '</option>';
  });
  h += '</select>';
  if (_periodFilter.kind === 'custom') {
    const fromIso = _toIso(_periodFilter.from);
    const toIso = _toIso(_periodFilter.to);
    h += '<input type="date" id="pf-from" value="' + fromIso + '" class="period-date" onchange="setPeriodCustom(this.value, document.getElementById(\'pf-to\').value)">';
    h += '<span style="color:var(--text2);font-size:11px">→</span>';
    h += '<input type="date" id="pf-to" value="' + toIso + '" class="period-date" onchange="setPeriodCustom(document.getElementById(\'pf-from\').value, this.value)">';
  }
  if (_periodFilter.kind !== 'all') {
    h += '<span class="period-info" id="pf-info"></span>';
  }
  el.innerHTML = h;

  // Aggiorno il counter
  const info = document.getElementById('pf-info');
  if (info && typeof D !== 'undefined' && D) {
    const inRange = D.filter(_periodPredicate).length;
    info.textContent = inRange + ' commesse nel periodo';
  }
}

/* ── Quick Filters (preset cliccabili sopra la barra filtri) ── */

let _quickFilter = null; // {name, label, predicate}

const QUICK_FILTERS = [
  {
    name: 'open',
    label: '🟢 Solo aperte',
    title: 'Esclude commesse Annullate o con corso Concluso',
    predicate: c => c.status !== 'Annullato' && c.statoCorso !== 'Concluso'
  },
  {
    name: 'year',
    label: '📅 ' + new Date().getFullYear(),
    title: 'Solo commesse iniziate nell\'anno corrente',
    predicate: c => {
      const yy = String(new Date().getFullYear());
      return (c.dataInizio || '').endsWith('-' + yy) || (c.dataInizio || '').endsWith('/' + yy);
    }
  },
  {
    name: 'noincasso',
    label: '💸 Senza incasso',
    title: 'Commesse con Già Incassato a 0 e ricavi > 0',
    predicate: c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0
  },
  {
    name: 'risk',
    label: '⚠️ Margine basso',
    title: 'Commesse con margine MOL < 5% (rischio redditività)',
    predicate: c => c.consulenza > 0 && (c.mol / c.consulenza * 100) < 5
  },
  {
    name: 'stalled',
    label: '🐢 Stalled',
    title: 'Avanzamento < 50% e data fine già passata',
    predicate: c => {
      if (c.avanzamento >= 50 || !c.dataFine) return false;
      const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (!m) return false;
      const fine = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
      return fine < new Date();
    }
  }
];

function setQuickFilter(name) {
  if (!name || (_quickFilter && _quickFilter.name === name)) {
    _quickFilter = null;
  } else {
    _quickFilter = QUICK_FILTERS.find(q => q.name === name) || null;
  }
  applyFilters();
  renderQuickFilters();
}

function renderQuickFilters() {
  const el = document.getElementById('quickFilters');
  if (!el) return;
  let h = '<span class="qf-label">Vista rapida:</span>';
  QUICK_FILTERS.forEach(q => {
    const active = _quickFilter && _quickFilter.name === q.name ? ' active' : '';
    h += '<button class="qf-btn' + active + '" title="' + q.title + '" onclick="setQuickFilter(\'' + q.name + '\')">' + q.label + '</button>';
  });
  if (_quickFilter) {
    h += '<button class="qf-btn qf-clear" title="Rimuovi vista rapida" onclick="setQuickFilter(null)">✕</button>';
  }
  el.innerHTML = h;
}

/* ── Filter Logic with dynamic counts (Multi-Select) ── */

const FILTER_DEFS = [
  { id: 'fStatus', key: 'status', ph: 'Tutti' },
  { id: 'fCorso', key: 'statoCorso', ph: 'Tutti' },
  { id: 'fCliente', key: 'cliente', ph: 'Tutti' },
  { id: 'fSocieta', key: 'societa', ph: 'Tutte' },
  { id: 'fSede', key: 'sedeNorm', ph: 'Tutte' },
  { id: 'fRegione', key: 'regione', ph: 'Tutte' },
  { id: 'fResp', key: 'responsabile', ph: 'Tutti' },
  { id: 'fTipoCorso', key: 'corso', ph: 'Tutti' },
  { id: 'fClasse', key: 'statoClasse', ph: 'Tutte' }
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
    if (!_periodPredicate(c)) return false;
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, _norm(c[f.key]))) return false;
    }
    if (_quickFilter && !_quickFilter.predicate(c)) return false;
    return true;
  });
  rebuildFilterCounts();
  renderFilteredKpis();
  renderActiveFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
  renderCurrentSection();
}

function resetFilters() {
  MultiSelect.resetAll();
  _quickFilter = null;
  _periodFilter = { kind: 'all', from: null, to: null };
  renderQuickFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
  applyFilters();
}

function initQuickFilters() {
  renderQuickFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
}

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  const labels = {
    fStatus: 'Status', fCorso: 'Stato Corso', fCliente: 'Cliente',
    fSocieta: 'Societa', fSede: 'Sede', fRegione: 'Regione',
    fResp: 'Responsabile', fTipoCorso: 'Corso', fClasse: 'Classe'
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
