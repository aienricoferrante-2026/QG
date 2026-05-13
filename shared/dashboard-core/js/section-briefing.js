/* ── Mini-briefing filtri attivi (kit condiviso, Caso 1) ──
 * Banner narrativo sotto i filtri che riassume in linguaggio naturale
 * cosa si sta guardando dopo i filtri. Si aggiorna ad ogni applyFilters().
 *
 * Mostra:
 *  - Quante commesse sono filtrate / totali (con %)
 *  - Filtri attivi testuali (max 3 elenchi più rilevanti)
 *  - Ricavi cumulati, margine medio
 *  - Pipeline aperta (commesse non Chiuse + non Annullate)
 *  - Top commerciale (se agente è popolato ≥30%)
 *  - Top cliente
 *  - Anno prevalente
 *  - Concentrazione top 5 clienti
 *
 * UX: bottone "✕" per chiudere; preferenza in localStorage per BU.
 * Si inietta nel DOM dinamicamente prima di #filteredKpis (o subito
 * dopo #activeFilters se filteredKpis non esiste).
 */

function _bfYear(c) {
  const s = c.dataInizio || c.dataPianInizio || '';
  let m = String(s).match(/^(\d{4})-/);
  if (m) return m[1];
  m = String(s).match(/-(\d{4})$/);
  if (m) return m[1];
  return null;
}

function _bfTopBy(items, key, n) {
  const c = {};
  items.forEach(it => {
    const v = (it[key] || '').trim();
    if (!v || v === '***') return;
    c[v] = (c[v] || 0) + 1;
  });
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function _bfBuStorageKey() {
  return 'qg_briefing_hide_' + (typeof sectorCode === 'function' ? sectorCode() : 'GEN');
}

function _bfIsHidden() {
  try { return localStorage.getItem(_bfBuStorageKey()) === '1'; } catch (e) { return false; }
}

function _bfSetHidden(v) {
  try { localStorage.setItem(_bfBuStorageKey(), v ? '1' : '0'); } catch (e) {}
}

function _bfActiveFiltersText() {
  /* Restituisce un riepilogo conciso dei filtri attivi: periodo, multiselect, quick. */
  const out = [];
  // Periodo
  try {
    if (typeof _periodFilter !== 'undefined' && _periodFilter && _periodFilter.kind !== 'all') {
      const p = _periodFilter;
      let lbl = p.kind;
      if (p.kind === 'custom' && p.from && p.to) lbl = p.from + ' → ' + p.to;
      else if (p.kind === 'year' && p.value) lbl = 'anno ' + p.value;
      else if (p.kind === 'month' && p.value) lbl = p.value;
      out.push('📅 Periodo: <b>' + lbl + '</b>');
    }
  } catch (e) {}
  // Quick filters
  try {
    if (typeof _activeQuickFilters !== 'undefined' && _activeQuickFilters.size) {
      out.push('⚡ Quick: <b>' + [..._activeQuickFilters].join(', ') + '</b>');
    }
  } catch (e) {}
  // Multiselect filters
  try {
    if (typeof _filterDefs === 'function') {
      _filterDefs().forEach(fd => {
        const sel = MultiSelect.getSelected(fd.id);
        if (sel && sel.length) {
          const txt = sel.length <= 2 ? sel.join(', ') : (sel.length + ' valori');
          out.push(fd.label + ': <b>' + txt + '</b>');
        }
      });
    }
  } catch (e) {}
  return out;
}

function _bfEnsureContainer() {
  let el = document.getElementById('sec-briefing');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'sec-briefing';
  el.className = 'briefing';
  const filteredKpis = document.getElementById('filteredKpis');
  const activeF = document.getElementById('activeFilters');
  if (filteredKpis && filteredKpis.parentNode) {
    filteredKpis.parentNode.insertBefore(el, filteredKpis);
  } else if (activeF && activeF.parentNode) {
    activeF.parentNode.insertBefore(el, activeF.nextSibling);
  } else {
    const main = document.querySelector('.main');
    if (main) main.appendChild(el);
  }
  return el;
}

function renderBriefing() {
  /* Chiamata da applyFilters dopo il filtraggio. */
  if (typeof D === 'undefined' || typeof filtered === 'undefined') return;
  const el = _bfEnsureContainer();
  if (!el) return;

  if (_bfIsHidden()) {
    el.innerHTML = '<button class="briefing-show" onclick="_bfToggle(false)" title="Mostra mini-briefing">📋 Mostra briefing</button>';
    return;
  }

  const tot = D.length;
  const n = filtered.length;
  const pctFiltrato = tot ? (n / tot * 100) : 0;
  const ricavi = filtered.reduce((s, c) => s + (c.consulenza || 0), 0);
  const mol = filtered.reduce((s, c) => s + (c.mol || 0), 0);
  const margPct = ricavi ? (mol / ricavi * 100) : 0;
  const incassato = filtered.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const daInc = filtered.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
  const incPct = ricavi ? (incassato / ricavi * 100) : 0;

  // Pipeline = non chiuse + non annullate
  const pipeline = filtered.filter(c => c.status !== 'Chiusa' && c.status !== 'Annullato');
  const pipeRic = pipeline.reduce((s, c) => s + (c.consulenza || 0), 0);

  // Top commerciale/cliente/anno
  const covAgente = filtered.filter(c => c.agente && c.agente !== '***').length / (filtered.length || 1);
  const topComm = covAgente >= 0.3 ? _bfTopBy(filtered, 'agente', 1)[0] : null;
  const topCliente = _bfTopBy(filtered, 'cliente', 1)[0];
  const annoCnt = {}; filtered.forEach(c => { const y = _bfYear(c); if (y) annoCnt[y] = (annoCnt[y] || 0) + 1; });
  const annoTop = Object.entries(annoCnt).sort((a, b) => b[1] - a[1])[0];

  // Concentrazione top 5 clienti
  const ricByCli = {};
  filtered.forEach(c => { const cli = c.cliente || ''; if (cli) ricByCli[cli] = (ricByCli[cli] || 0) + (c.consulenza || 0); });
  const top5Ric = Object.values(ricByCli).sort((a, b) => b - a).slice(0, 5).reduce((s, v) => s + v, 0);
  const conc5 = ricavi ? (top5Ric / ricavi * 100) : 0;

  const activeF = _bfActiveFiltersText();
  const isFiltered = activeF.length > 0;
  const filterHeader = isFiltered
    ? '<b>' + fmt(n) + '</b> commesse filtrate · ' + pctFiltrato.toFixed(1) + '% del totale (' + fmt(tot) + ')'
    : '<b>' + fmt(n) + '</b> commesse · vista completa BU (nessun filtro attivo)';

  let h = '<div class="briefing-head">';
  h += '<span class="briefing-title">📋 Cosa stai vedendo</span>';
  h += '<button class="briefing-x" onclick="_bfToggle(true)" title="Nascondi briefing">✕</button>';
  h += '</div>';

  h += '<div class="briefing-body">';
  h += '<p>' + filterHeader + '. ';
  h += 'Ricavi cumulati <b>' + fmtE(ricavi) + '</b>, MOL <b>' + fmtE(mol) + '</b> (margine ' + margPct.toFixed(1) + '%). ';
  h += '% Incasso <b>' + incPct.toFixed(1) + '%</b>, esposizione residua <b>' + fmtE(daInc) + '</b>.</p>';

  h += '<p>Pipeline aperta: <b>' + fmt(pipeline.length) + '</b> commesse non concluse';
  if (pipeRic > 0) h += ' per un valore di <b>' + fmtE(pipeRic) + '</b>';
  h += '. ';
  if (topComm) {
    h += 'Commerciale top: <b>' + topComm[0] + '</b> (' + fmt(topComm[1]) + ' commesse). ';
  }
  if (topCliente) {
    h += 'Cliente top: <b>' + topCliente[0] + '</b> (' + fmt(topCliente[1]) + ' commesse). ';
  }
  if (annoTop) {
    h += 'Anno prevalente: <b>' + annoTop[0] + '</b> (' + fmt(annoTop[1]) + ' commesse). ';
  }
  h += 'Concentrazione top 5 clienti: <b>' + conc5.toFixed(1) + '%</b> dei ricavi.</p>';

  if (activeF.length) {
    h += '<p class="briefing-filters">Filtri attivi: ' + activeF.join(' · ') + '</p>';
  }
  h += '</div>';

  el.innerHTML = h;
}

function _bfToggle(hide) {
  _bfSetHidden(hide);
  renderBriefing();
}
