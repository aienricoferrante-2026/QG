/* ── Period Filter (range temporale globale) — versione core multi-settore ──
 * Due filtri paralleli e indipendenti:
 *   _periodFilter      → su `dataInizio` (fallback `dataPianInizio`)
 *   _periodFilterFine  → su `dataFine`   (fallback `dataPianFine`)
 * Entrambi sono combinati in AND in applyFilters(). */

let _periodFilter = { kind: 'all', from: null, to: null };
let _periodFilterFine = { kind: 'all', from: null, to: null };

function _parseDDMMYYYY(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}
function _toIso(d) {
  if (!d) return '';
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
function _fromIso(iso) {
  if (!iso) return null;
  const m = String(iso).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
}

function _periodRangeFrom(state) {
  const today = new Date();
  switch (state.kind) {
    case 'all': return { from: null, to: null };
    case 'last30': { const f = new Date(today); f.setDate(f.getDate() - 30); return { from: f, to: today }; }
    case 'last90': { const f = new Date(today); f.setDate(f.getDate() - 90); return { from: f, to: today }; }
    case 'last12m': { const f = new Date(today); f.setMonth(f.getMonth() - 12); return { from: f, to: today }; }
    case 'y2026': return { from: new Date(2026, 0, 1), to: new Date(2026, 11, 31, 23, 59, 59) };
    case 'y2025': return { from: new Date(2025, 0, 1), to: new Date(2025, 11, 31, 23, 59, 59) };
    case 'y2024': return { from: new Date(2024, 0, 1), to: new Date(2024, 11, 31, 23, 59, 59) };
    case 'y2023': return { from: new Date(2023, 0, 1), to: new Date(2023, 11, 31, 23, 59, 59) };
    case 'custom': return { from: state.from, to: state.to };
    default: return { from: null, to: null };
  }
}

function _periodRange() { return _periodRangeFrom(_periodFilter); }
function _periodRangeFine() { return _periodRangeFrom(_periodFilterFine); }

function _periodPredicate(c) {
  const r = _periodRange();
  if (!r.from && !r.to) return true;
  const d = _parseDDMMYYYY(c.dataInizio) || _parseDDMMYYYY(c.dataPianInizio);
  if (!d) return false;
  if (r.from && d < r.from) return false;
  if (r.to && d > r.to) return false;
  return true;
}

function _periodPredicateFine(c) {
  const r = _periodRangeFine();
  if (!r.from && !r.to) return true;
  const d = _parseDDMMYYYY(c.dataFine) || _parseDDMMYYYY(c.dataPianFine);
  if (!d) return false;
  if (r.from && d < r.from) return false;
  if (r.to && d > r.to) return false;
  return true;
}

function setPeriodKind(kind) {
  _periodFilter.kind = kind || 'all';
  if (kind !== 'custom') { _periodFilter.from = null; _periodFilter.to = null; }
  renderPeriodFilter();
  applyFilters();
}

function setPeriodCustom(fromIso, toIso) {
  _periodFilter.kind = 'custom';
  _periodFilter.from = _fromIso(fromIso);
  _periodFilter.to = _fromIso(toIso);
  if (_periodFilter.to) {
    const t = new Date(_periodFilter.to);
    t.setHours(23, 59, 59, 999);
    _periodFilter.to = t;
  }
  renderPeriodFilter();
  applyFilters();
}

function setPeriodKindFine(kind) {
  _periodFilterFine.kind = kind || 'all';
  if (kind !== 'custom') { _periodFilterFine.from = null; _periodFilterFine.to = null; }
  renderPeriodFilterFine();
  applyFilters();
}

function setPeriodCustomFine(fromIso, toIso) {
  _periodFilterFine.kind = 'custom';
  _periodFilterFine.from = _fromIso(fromIso);
  _periodFilterFine.to = _fromIso(toIso);
  if (_periodFilterFine.to) {
    const t = new Date(_periodFilterFine.to);
    t.setHours(23, 59, 59, 999);
    _periodFilterFine.to = t;
  }
  renderPeriodFilterFine();
  applyFilters();
}

/* Opzioni periodo condivise tra Data Inizio e Data Fine. */
const _PERIOD_OPTS = [
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

function renderPeriodFilter() {
  const el = document.getElementById('periodFilter');
  if (!el) return;
  let h = '<span class="qf-label">Periodo (data inizio):</span>';
  h += '<select id="pf-select" onchange="setPeriodKind(this.value)" class="period-select">';
  _PERIOD_OPTS.forEach(o => {
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
  if (_periodFilter.kind !== 'all') h += '<span class="period-info" id="pf-info"></span>';
  el.innerHTML = h;

  const info = document.getElementById('pf-info');
  if (info && typeof D !== 'undefined' && D) {
    const inRange = D.filter(_periodPredicate).length;
    info.textContent = inRange + ' commesse nel periodo';
  }
}

function renderPeriodFilterFine() {
  const el = document.getElementById('periodFilterFine');
  if (!el) return;
  let h = '<span class="qf-label">Periodo (data fine):</span>';
  h += '<select id="pff-select" onchange="setPeriodKindFine(this.value)" class="period-select">';
  _PERIOD_OPTS.forEach(o => {
    h += '<option value="' + o.v + '"' + (_periodFilterFine.kind === o.v ? ' selected' : '') + '>' + o.label + '</option>';
  });
  h += '</select>';
  if (_periodFilterFine.kind === 'custom') {
    const fromIso = _toIso(_periodFilterFine.from);
    const toIso = _toIso(_periodFilterFine.to);
    h += '<input type="date" id="pff-from" value="' + fromIso + '" class="period-date" onchange="setPeriodCustomFine(this.value, document.getElementById(\'pff-to\').value)">';
    h += '<span style="color:var(--text2);font-size:11px">→</span>';
    h += '<input type="date" id="pff-to" value="' + toIso + '" class="period-date" onchange="setPeriodCustomFine(document.getElementById(\'pff-from\').value, this.value)">';
  }
  if (_periodFilterFine.kind !== 'all') h += '<span class="period-info" id="pff-info"></span>';
  el.innerHTML = h;

  const info = document.getElementById('pff-info');
  if (info && typeof D !== 'undefined' && D) {
    const inRange = D.filter(_periodPredicateFine).length;
    info.textContent = inRange + ' commesse nel periodo';
  }
}

/* ── Quick Filters (multi-select) ──
   `_activeQuickFilters` è un Set<string> di nomi attivi. I filtri si
   combinano in AND: una commessa passa solo se soddisfa TUTTE le predicate.
   Persistenza: array di nomi in localStorage `qg_quickfilter_<BU>`. */
let _activeQuickFilters = new Set();

/* Helper data per i quick filter temporali (questo mese / mese scorso /
   ultimo trimestre). Parsano `c.dataInizio || c.dataPianInizio` con il
   formato dd-mm-yyyy o dd/mm/yyyy del JSON. */
function _qfParseDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  return m ? new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) : null;
}
function _qfStart(c) { return _qfParseDate(c.dataInizio) || _qfParseDate(c.dataPianInizio); }
function _qfInRange(c, from, to) {
  const d = _qfStart(c);
  if (!d) return false;
  return d >= from && d <= to;
}

const QUICK_FILTERS_DEFAULT = [
  { name: 'inLav', label: '⚙️ Solo in lavorazione', title: 'Status contiene "Lavorazione" (case-insensitive). Es. "In Lavorazione".',
    predicate: c => /lavorazione/i.test(c.status || '') },
  { name: 'open', label: '🟢 Solo aperte', title: 'Esclude commesse Annullate o Chiuse',
    predicate: c => typeof isOpen === 'function' ? isOpen(c) : (c.status !== 'Annullato' && c.status !== 'Concluso' && c.status !== 'Chiusa') },
  { name: 'year', label: '📅 ' + new Date().getFullYear(), title: 'Solo commesse iniziate nell\'anno corrente',
    predicate: c => {
      const yy = String(new Date().getFullYear());
      return (c.dataInizio || c.dataPianInizio || '').endsWith('-' + yy)
          || (c.dataInizio || c.dataPianInizio || '').endsWith('/' + yy);
    } },
  { name: 'thisMonth', label: '🗓️ Questo mese', title: 'Data inizio dentro al mese corrente',
    predicate: c => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return _qfInRange(c, from, to);
    } },
  { name: 'lastMonth', label: '⬅️ Mese scorso', title: 'Data inizio dentro al mese precedente',
    predicate: c => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return _qfInRange(c, from, to);
    } },
  { name: 'lastQuarter', label: '📈 Ultimo trimestre', title: 'Data inizio negli ultimi 90 giorni',
    predicate: c => {
      const now = new Date();
      const from = new Date(now); from.setDate(from.getDate() - 90);
      return _qfInRange(c, from, now);
    } },
  { name: 'noincasso', label: '💸 Senza incasso', title: 'Già Incassato a 0 e ricavi > 0',
    predicate: c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0 },
  { name: 'risk', label: '⚠️ Margine basso', title: 'Margine MOL < 5%',
    predicate: c => c.consulenza > 0 && (c.mol / c.consulenza * 100) < 5 },
  { name: 'stalled', label: '🐢 Stalled', title: 'Avz. < 50% e data fine già passata',
    predicate: c => {
      if ((c.avanzamento || 0) >= 50 || !c.dataFine) return false;
      const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (!m) return false;
      const fine = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
      return fine < new Date();
    } }
];

function _quickFilters() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.quickFilters) || QUICK_FILTERS_DEFAULT;
}

function _quickFilterStorageKey() {
  const code = (typeof sectorCode === 'function') ? sectorCode() : 'GEN';
  return 'qg_quickfilter_' + code;
}

function _activeQuickFilterObjs() {
  const list = _quickFilters();
  return [..._activeQuickFilters].map(n => list.find(q => q.name === n)).filter(Boolean);
}

/* Toggle: aggiunge/rimuove un quick filter dal Set. `name = null` resetta. */
function setQuickFilter(name) {
  if (!name) {
    _activeQuickFilters.clear();
  } else if (_activeQuickFilters.has(name)) {
    _activeQuickFilters.delete(name);
  } else {
    _activeQuickFilters.add(name);
  }
  try {
    localStorage.setItem(_quickFilterStorageKey(),
      _activeQuickFilters.size ? JSON.stringify([..._activeQuickFilters]) : '');
  } catch (e) {}
  applyFilters();
  renderQuickFilters();
}

function renderQuickFilters() {
  const el = document.getElementById('quickFilters');
  if (!el) return;
  let h = '<span class="qf-label">Vista rapida (combinabili):</span>';
  _quickFilters().forEach(q => {
    const active = _activeQuickFilters.has(q.name) ? ' active' : '';
    /* Conteggio dinamico per ogni quick filter: applica il singolo predicate
       sul dataset filtrato dai multiselect/periodo. Mostrato come badge. */
    let count = -1;
    if (typeof D !== 'undefined' && D) {
      const defs = (typeof _filterDefs === 'function') ? _filterDefs() : [];
      count = D.filter(c => {
        if (typeof _periodPredicate === 'function' && !_periodPredicate(c)) return false;
        if (typeof _periodPredicateFine === 'function' && !_periodPredicateFine(c)) return false;
        for (const f of defs) if (typeof _matchFilter === 'function' && !_matchFilter(f, c)) return false;
        return q.predicate(c);
      }).length;
    }
    const badge = count >= 0
      ? '<span class="qf-count">' + (count >= 1000 ? (count / 1000).toFixed(count >= 10000 ? 0 : 1) + 'k' : count) + '</span>'
      : '';
    h += '<button class="qf-btn' + active + '" title="' + q.title + '" onclick="setQuickFilter(\'' + q.name + '\')">' + q.label + badge + '</button>';
  });
  if (_activeQuickFilters.size) {
    const all = (typeof D !== 'undefined' && D) ? D.length : 0;
    const cur = (typeof filtered !== 'undefined') ? filtered.length : 0;
    h += '<span class="qf-feedback">→ ' + fmt(cur) + ' di ' + fmt(all) + ' commesse · ' +
         _activeQuickFilters.size + ' filtr' + (_activeQuickFilters.size === 1 ? 'o' : 'i') + ' attiv' + (_activeQuickFilters.size === 1 ? 'o' : 'i') + '</span>';
    h += '<button class="qf-btn qf-clear" title="Rimuovi tutti i quick filter attivi" onclick="setQuickFilter(null)">✕ Reset</button>';
  }
  el.innerHTML = h;
}

/* ── Filter Logic with dynamic counts (Multi-Select) ── */

const FILTER_DEFS_DEFAULT = [
  { id: 'fStatus', key: 'status', label: 'Status', ph: 'Tutti' },
  { id: 'fCliente', key: 'cliente', label: 'Cliente', ph: 'Tutti' },
  { id: 'fSocieta', key: 'societa', label: 'Societa', ph: 'Tutte' },
  { id: 'fSede', key: 'sedeNorm', label: 'Sede', ph: 'Tutte' },
  { id: 'fRegione', key: 'regione', label: 'Regione', ph: 'Tutte' },
  { id: 'fResp', key: 'responsabile', label: 'Responsabile', ph: 'Tutti' },
  { id: 'fStatoLav', key: 'statoLav', label: 'Stato Lavorazione', ph: 'Tutti' },
  { id: 'fFunzione', key: 'funzione', label: 'Funzione', ph: 'Tutte' }
];

function _filterDefs() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.filters) || FILTER_DEFS_DEFAULT;
}

function _norm(v) { return (v && String(v).trim()) ? v : 'N/D'; }

/* Per filtri "multi-valore" (es. ISO Standard "9001 + 14001"): se la def
   ha `splitBy`, il valore del record viene esploso in parti, e il filtro
   matcha se almeno una parte è selezionata. Senza splitBy il comportamento
   è invariato (match esatto). */
function _splitVal(val, splitBy) {
  if (!splitBy) return [val];
  const s = String(val);
  if (s === 'N/D' || !s) return ['N/D'];
  return s.split(splitBy).map(x => x.trim()).filter(Boolean);
}

function _matchFilter(f, c) {
  const parts = _splitVal(_norm(c[f.key]), f.splitBy);
  return parts.some(p => MultiSelect.matches(f.id, p));
}

function initFilters() {
  _filterDefs().forEach(f => {
    const all = new Set();
    D.forEach(c => _splitVal(_norm(c[f.key]), f.splitBy).forEach(p => all.add(p)));
    const vals = [...all].sort();
    MultiSelect.create(f.id, vals, f.ph, {
      onChange: applyFilters,
      countFn: v => D.filter(c => _splitVal(_norm(c[f.key]), f.splitBy).includes(v)).length
    });
  });
  _injectDefButtons();
}

function rebuildFilterCounts() {
  const defs = _filterDefs();
  defs.forEach(fd => {
    const otherFilters = defs.filter(f => f.id !== fd.id);
    const baseItems = D.filter(c => {
      for (const of2 of otherFilters) {
        if (!_matchFilter(of2, c)) return false;
      }
      return true;
    });
    const all = new Set();
    baseItems.forEach(c => _splitVal(_norm(c[fd.key]), fd.splitBy).forEach(p => all.add(p)));
    const vals = [...all].sort();
    MultiSelect.updateOptions(fd.id, vals,
      v => baseItems.filter(c => _splitVal(_norm(c[fd.key]), fd.splitBy).includes(v)).length);
  });
}

function applyFilters() {
  const defs = _filterDefs();
  const qfObjs = _activeQuickFilterObjs();
  filtered = D.filter(c => {
    if (!_periodPredicate(c)) return false;
    if (!_periodPredicateFine(c)) return false;
    for (const f of defs) {
      if (!_matchFilter(f, c)) return false;
    }
    /* Quick filter multi-select: tutti i predicate devono passare (AND). */
    for (const q of qfObjs) if (!q.predicate(c)) return false;
    return true;
  });
  rebuildFilterCounts();
  renderFilteredKpis();
  renderActiveFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
  if (typeof renderPeriodFilterFine === 'function') renderPeriodFilterFine();
  if (typeof renderBriefing === 'function') renderBriefing();
  renderCurrentSection();
}

function resetFilters() {
  MultiSelect.resetAll();
  _activeQuickFilters.clear();
  _periodFilter = { kind: 'all', from: null, to: null };
  _periodFilterFine = { kind: 'all', from: null, to: null };
  try { localStorage.setItem(_quickFilterStorageKey(), ''); } catch (e) {}
  renderQuickFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
  if (typeof renderPeriodFilterFine === 'function') renderPeriodFilterFine();
  applyFilters();
}

function initQuickFilters() {
  /* Sticky: ripristina i quick filter dalla chiave localStorage.
     Default al primo accesso (chiave assente): "Solo in lavorazione" ON.
     Formato storage:
       - assente   → default (inLav)
       - ''        → nessuno
       - JSON []   → lista di nomi attivi (nuovo formato multi-select)
       - 'inLav'   → singolo nome (vecchio formato, retrocompatibile) */
  let stored = null;
  try { stored = localStorage.getItem(_quickFilterStorageKey()); } catch (e) {}
  _activeQuickFilters = new Set();
  const allNames = new Set(_quickFilters().map(q => q.name));
  if (stored === null) {
    if (allNames.has('inLav')) _activeQuickFilters.add('inLav');
  } else if (stored === '') {
    /* nessun filtro */
  } else if (stored.startsWith('[')) {
    try {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr)) arr.forEach(n => { if (allNames.has(n)) _activeQuickFilters.add(n); });
    } catch (e) {}
  } else if (allNames.has(stored)) {
    _activeQuickFilters.add(stored);
  }
  if (_activeQuickFilters.size) applyFilters();
  renderQuickFilters();
  if (typeof renderPeriodFilter === 'function') renderPeriodFilter();
  if (typeof renderPeriodFilterFine === 'function') renderPeriodFilterFine();
  // Filtri predefiniti salvati dall'utente → applicati per ultimi (vincono sul default inLav)
  if (typeof applyDefaultFilters === 'function') applyDefaultFilters();
}

function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if (!el) return;
  let h = '';
  _filterDefs().forEach(f => {
    const sel = MultiSelect.getSelected(f.id);
    if (sel.size > 0) {
      const txt = sel.size === 1 ? [...sel][0] : sel.size + ' sel.';
      const short = txt.length > 25 ? txt.substring(0, 23) + '..' : txt;
      h += '<span class="filter-chip">' + (f.label || f.id) + ': ' + short +
        '<span class="chip-x" onclick="MultiSelect.reset(\'' + f.id + '\');applyFilters()">×</span></span>';
    }
  });
  el.innerHTML = h;
}

/* ── Filtri PREDEFINITI per postazione ──
   L'utente imposta i filtri che vuole (es. Sede = Latina), clicca
   "★ Salva predefiniti" e da lì in poi la dashboard si riapre sempre con
   quei filtri già applicati. Persistenza per BU in localStorage. */
function _defFiltersKey() {
  return 'qg_deffilters_' + ((typeof sectorCode === 'function') ? sectorCode() : 'GEN');
}
function hasDefaultFilters() {
  try { return !!localStorage.getItem(_defFiltersKey()); } catch (e) { return false; }
}
function saveDefaultFilters() {
  const ms = {};
  _filterDefs().forEach(f => {
    const sel = [...MultiSelect.getSelected(f.id)];
    if (sel.length) ms[f.id] = sel;
  });
  const payload = {
    ms,
    period: { kind: _periodFilter.kind, from: _toIso(_periodFilter.from), to: _toIso(_periodFilter.to) },
    periodFine: { kind: _periodFilterFine.kind, from: _toIso(_periodFilterFine.from), to: _toIso(_periodFilterFine.to) },
    quick: [..._activeQuickFilters]
  };
  try { localStorage.setItem(_defFiltersKey(), JSON.stringify(payload)); } catch (e) {}
  _renderDefBtns();
  _flashDef('★ Filtri salvati come predefiniti');
}
function clearDefaultFilters() {
  try { localStorage.removeItem(_defFiltersKey()); } catch (e) {}
  _renderDefBtns();
  _flashDef('Predefiniti rimossi');
  resetFilters();
}
function applyDefaultFilters() {
  let raw = null;
  try { raw = localStorage.getItem(_defFiltersKey()); } catch (e) {}
  if (!raw) return false;
  let p; try { p = JSON.parse(raw); } catch (e) { return false; }
  if (p.ms && MultiSelect.setSelected) {
    Object.keys(p.ms).forEach(id => MultiSelect.setSelected(id, p.ms[id]));
  }
  if (p.period) { _periodFilter = { kind: p.period.kind || 'all', from: _fromIso(p.period.from), to: _fromIso(p.period.to) }; }
  if (p.periodFine) { _periodFilterFine = { kind: p.periodFine.kind || 'all', from: _fromIso(p.periodFine.from), to: _fromIso(p.periodFine.to) }; }
  if (Array.isArray(p.quick)) { _activeQuickFilters = new Set(p.quick); }
  applyFilters();
  if (typeof renderQuickFilters === 'function') renderQuickFilters();
  return true;
}
/* Inietta i pulsanti "Salva/Rimuovi predefiniti" accanto al Reset, su ogni
   dashboard (HTML duplicato per BU → inserimento via JS, una volta sola). */
function _injectDefButtons() {
  document.querySelectorAll('.filters').forEach(box => {
    if (box.querySelector('.filter-savedef')) return;
    const save = document.createElement('button');
    save.className = 'filter-reset filter-savedef';
    save.style.cssText = 'background:rgba(59,130,246,.14);border-color:#3b82f6;color:#3b82f6';
    save.title = 'Salva i filtri attuali come predefiniti: la dashboard si riaprirà sempre così';
    save.onclick = saveDefaultFilters;
    box.appendChild(save);
    const del = document.createElement('button');
    del.className = 'filter-reset filter-deldef';
    del.style.cssText = 'background:rgba(239,68,68,.10);border-color:#ef4444;color:#ef4444';
    del.title = 'Rimuovi i filtri predefiniti salvati';
    del.innerHTML = '&#10005; Rimuovi predefiniti';
    del.onclick = clearDefaultFilters;
    box.appendChild(del);
  });
  _renderDefBtns();
}
function _renderDefBtns() {
  const on = hasDefaultFilters();
  document.querySelectorAll('.filter-savedef').forEach(b => {
    b.innerHTML = on ? '&#9733; Aggiorna predefiniti' : '&#9733; Salva predefiniti';
  });
  document.querySelectorAll('.filter-deldef').forEach(b => { b.style.display = on ? '' : 'none'; });
}
function _flashDef(msg) {
  let t = document.getElementById('def-flash');
  if (!t) {
    t = document.createElement('div');
    t.id = 'def-flash';
    t.style.cssText = 'position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#3b82f6;color:#fff;padding:9px 18px;border-radius:9px;font-size:13px;font-weight:700;z-index:9999;box-shadow:0 8px 30px rgba(0,0,0,.35);transition:opacity .3s';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._tmo);
  t._tmo = setTimeout(() => { t.style.opacity = '0'; }, 2200);
}
