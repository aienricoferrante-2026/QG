/* ── Esplora · vista unica multi-livello (Tappa 2) ──
   Caso 1 del kit condiviso. Sostituisce Sedi/Clienti/Responsabili/Performance.
   Stato (L1/L2/L3, metrica, confronto, search) persistito in localStorage
   per BU. Render delega a section-explore-tree.js per tabella + chart e a
   section-explore-metrics.js per metriche e confronto periodi. */

function _exploreKey() { return 'qg_explore_' + sectorCode(); }

function _exploreDefault() {
  return {
    l1: 'societa', l2: 'none', l3: 'none',
    metric: 'ricavi', compare: 'none',
    aIso: '', bIso: '',
    search: ''
  };
}

function _exploreState() {
  if (!window._exploreStateCache) {
    try {
      const raw = localStorage.getItem(_exploreKey());
      window._exploreStateCache = raw ? Object.assign(_exploreDefault(), JSON.parse(raw)) : _exploreDefault();
    } catch (e) { window._exploreStateCache = _exploreDefault(); }
  }
  return window._exploreStateCache;
}

function _exploreSave() {
  try { localStorage.setItem(_exploreKey(), JSON.stringify(_exploreState())); } catch (e) {}
}

function _exploreSet(k, v) {
  _exploreState()[k] = v;
  _exploreSave();
  _exploreExpanded = {};
  renderExplore();
}

function _exploreSetL1(v) {
  const s = _exploreState();
  /* Validazione: non permettere la stessa dimensione su livelli diversi. */
  if (v !== 'none') {
    if (s.l2 === v) s.l2 = 'none';
    if (s.l3 === v) s.l3 = 'none';
  }
  _exploreSet('l1', v);
}
function _exploreSetL2(v) {
  const s = _exploreState();
  if (v !== 'none') {
    if (s.l1 === v) { /* invalid */ return; }
    if (s.l3 === v) s.l3 = 'none';
  }
  _exploreSet('l2', v);
}
function _exploreSetL3(v) {
  const s = _exploreState();
  if (v !== 'none') {
    if (s.l1 === v || s.l2 === v) return;
  }
  _exploreSet('l3', v);
}
function _exploreSetMet(v) { _exploreSet('metric', v); }
function _exploreSetCmp(v) { _exploreSet('compare', v); }
function _exploreSetA(v)   { _exploreSet('aIso', String(v || '').trim()); }
function _exploreSetB(v)   { _exploreSet('bIso', String(v || '').trim()); }
function _exploreSetSearch(v) {
  _exploreState().search = String(v || '');
  _exploreSave();
  const wrap = document.getElementById('explore-tbl-wrap');
  if (wrap) wrap.innerHTML = _exploreRenderTable(_exploreState(), _explorePeriods());
}

function _explorePreset(id) {
  const p = EXPLORE_PRESETS.find(x => x.id === id);
  if (!p) return;
  const s = _exploreState();
  s.l1 = p.l1; s.l2 = p.l2; s.l3 = p.l3; s.metric = p.m;
  _exploreSave();
  _exploreExpanded = {};
  renderExplore();
}

function _exploreActivePreset() {
  const s = _exploreState();
  return EXPLORE_PRESETS.find(p => p.l1 === s.l1 && p.l2 === s.l2 && p.l3 === s.l3 && p.m === s.metric);
}

/* ── Render ── */
function renderExplore() {
  const el = document.getElementById('sec-explore');
  if (!el) return;
  const s = _exploreState();
  const periods = _explorePeriods(s);

  let h = '<div class="sec"><h3 class="sec-title">Esplora · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Vista unica multi-livello: scegli le dimensioni, la metrica e il confronto. ' +
       'Le scelte sono memorizzate per BU. Clicca su un nodo per espandere, o sul bottone ' +
       '"Apri n" per il drill-down sulle commesse.</p>';

  h += _explorePresetsHtml();
  h += _exploreControlsHtml();
  h += _exploreKpis(s, periods);

  h += '<div class="card"><h4>Top per ' +
       EXPLORE_METRICS.find(m => m.id === s.metric).short + '</h4>' +
       '<div class="chart-wrap"><canvas id="chExplore"></canvas></div></div>';

  h += '<div class="card" style="margin-top:14px">';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap">';
  h += '<h4 style="margin:0">Albero · ' + _exploreDimsPath(s) + '</h4>';
  h += '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">';
  h += '<input type="search" placeholder="Cerca nei nodi…" value="' + (s.search || '').replace(/"/g, '&quot;') +
       '" oninput="_exploreSetSearch(this.value)" ' +
       'style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:5px 8px;font-size:11px;border-radius:4px;min-width:160px">';
  h += '<button class="btn-export" onclick="_exploreExportAggCSV()">&#8681; CSV aggregato</button>';
  h += '<button class="btn-export" onclick="_exploreExportFlatCSV()">&#8681; CSV commesse</button>';
  h += '</div></div>';
  h += '<div id="explore-tbl-wrap">' + _exploreRenderTable(s, periods) + '</div>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;

  _exploreRenderChart(s, periods);
}

function _exploreDimsPath(s) {
  const lab = id => (EXPLORE_DIMENSIONS.find(d => d.id === id) || { label: '—' }).label;
  const path = [lab(s.l1)];
  if (s.l2 !== 'none') path.push(lab(s.l2));
  if (s.l3 !== 'none') path.push(lab(s.l3));
  return path.join(' › ');
}

function _explorePresetsHtml() {
  const active = _exploreActivePreset();
  let h = '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
  h += '<span class="qf-label">Preset:</span>';
  EXPLORE_PRESETS.forEach(p => {
    const cls = active && active.id === p.id ? 'qf-btn active' : 'qf-btn';
    h += '<button class="' + cls + '" onclick="_explorePreset(\'' + p.id + '\')" title="L1:' + p.l1 + ' · L2:' + p.l2 + ' · L3:' + p.l3 + ' · m:' + p.m + '">' + p.label + '</button>';
  });
  h += '</div>';
  return h;
}

function _exploreSelect(fn, opts, cur, exclude) {
  let h = '<select class="period-select" onchange="' + fn + '(this.value)">';
  opts.forEach(o => {
    if (exclude && exclude.includes(o.id) && o.id !== cur) return;
    h += '<option value="' + o.id + '"' + (o.id === cur ? ' selected' : '') + '>' + o.label + '</option>';
  });
  return h + '</select>';
}

function _exploreControlsHtml() {
  const s = _exploreState();
  const used = [s.l1, s.l2, s.l3];
  let h = '<div class="period-filter" style="border:1px solid var(--border);border-radius:8px;margin-bottom:14px;padding:10px 14px">';
  h += '<span class="qf-label">Livello 1:</span>' +
       _exploreSelect('_exploreSetL1', EXPLORE_DIMENSIONS, s.l1, used.filter((_, i) => i !== 0));
  h += '<span class="qf-label">→ L2:</span>' +
       _exploreSelect('_exploreSetL2', EXPLORE_DIMENSIONS, s.l2, used.filter((_, i) => i !== 1));
  h += '<span class="qf-label">→ L3:</span>' +
       _exploreSelect('_exploreSetL3', EXPLORE_DIMENSIONS, s.l3, used.filter((_, i) => i !== 2));
  h += '<span class="qf-label">Metrica:</span>' +
       _exploreSelect('_exploreSetMet', EXPLORE_METRICS, s.metric);
  h += '<span class="qf-label">Confronto:</span>' +
       _exploreSelect('_exploreSetCmp', EXPLORE_COMPARE, s.compare);
  if (s.compare === 'custom') {
    h += '<div style="flex-basis:100%;height:0"></div>';
    h += '<span class="qf-label">A:</span><input type="text" class="period-date" style="min-width:140px" placeholder="YYYY · YYYY-Qx · YYYY-Mxx" value="' + s.aIso + '" onchange="_exploreSetA(this.value)">';
    h += '<span class="qf-label">B:</span><input type="text" class="period-date" style="min-width:140px" placeholder="YYYY · YYYY-Qx · YYYY-Mxx" value="' + s.bIso + '" onchange="_exploreSetB(this.value)">';
  }
  return h + '</div>';
}
