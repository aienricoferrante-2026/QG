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
    for (const f of FILTER_DEFS) {
      if (!MultiSelect.matches(f.id, _norm(c[f.key]))) return false;
    }
    if (_quickFilter && !_quickFilter.predicate(c)) return false;
    return true;
  });
  rebuildFilterCounts();
  renderFilteredKpis();
  renderActiveFilters();
  renderCurrentSection();
}

function resetFilters() {
  MultiSelect.resetAll();
  _quickFilter = null;
  renderQuickFilters();
  applyFilters();
}

function initQuickFilters() {
  renderQuickFilters();
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
