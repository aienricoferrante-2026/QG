/* ── Performance (Analytics BU) — Caso 1 del kit condiviso ──
   Vista comparativa per Tecnico/Commerciale/Segnalatore/Totale BU con
   metriche WIP/Output/Throughput/Margine/Incasso e confronto periodi.
   Stato persistito in localStorage per ogni BU. */

const PERF_SEGMENTS = [
  { id: 'tecnico',     label: 'Tecnico',     field: 'responsabile' },
  { id: 'commerciale', label: 'Commerciale', field: 'agente' },
  { id: 'segnalatore', label: 'Segnalatore', field: 'segnalatore' },
  { id: 'totale',      label: 'Totale BU',   field: null }
];

const PERF_METRICS = [
  { id: 'wipN',       label: 'WIP (numero)' },
  { id: 'wipE',       label: 'WIP (valore €)' },
  { id: 'outN',       label: 'Output (numero)' },
  { id: 'outE',       label: 'Output (valore €)' },
  { id: 'throughput', label: 'Throughput (chiusure/mese)' },
  { id: 'backlog',    label: 'Backlog >60gg' },
  { id: 'margine',    label: 'Margine %' },
  { id: 'pctInc',     label: '% Incasso' },
  { id: 'incE',       label: 'Incassato €' }
];

const PERF_AGG = [
  { id: 'week',    label: 'Settimana' },
  { id: 'month',   label: 'Mese' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year',    label: 'Anno' }
];

const PERF_COMPARE = [
  { id: 'none',   label: 'Nessuno' },
  { id: 'prev',   label: 'vs Periodo precedente' },
  { id: 'year',   label: 'vs Anno precedente' },
  { id: 'custom', label: 'A vs B (custom)' }
];

let _perfTargets = null;

function _perfKey() { return 'qg_perf_' + sectorCode(); }
function _perfDefault() {
  return { segment: 'tecnico', metric: 'wipN', agg: 'month', compare: 'none', topN: 15, aIso: '', bIso: '' };
}
function _perfState() {
  if (!window._perfStateCache) {
    try {
      const raw = localStorage.getItem(_perfKey());
      window._perfStateCache = raw ? Object.assign(_perfDefault(), JSON.parse(raw)) : _perfDefault();
    } catch (e) { window._perfStateCache = _perfDefault(); }
  }
  return window._perfStateCache;
}
function _perfSave() {
  try { localStorage.setItem(_perfKey(), JSON.stringify(_perfState())); } catch (e) {}
}
function _perfSet(k, v) { _perfState()[k] = v; _perfSave(); renderPerformance(); }
function _perfSetSeg(v)  { _perfSet('segment', v); }
function _perfSetMet(v)  { _perfSet('metric', v); }
function _perfSetAgg(v)  { _perfSet('agg', v); }
function _perfSetCmp(v)  { _perfSet('compare', v); }
function _perfSetTopN(v) { _perfSet('topN', parseInt(v) || 15); }
function _perfSetA(v)    { _perfSet('aIso', String(v || '').trim()); }
function _perfSetB(v)    { _perfSet('bIso', String(v || '').trim()); }

/* ── Data helpers ── */
function _perfNorm(v) { return (v && String(v).trim()) ? String(v).trim() : 'N/D'; }
function _perfParseDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  return m ? new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) : null;
}
function _perfStart(c) { return _perfParseDate(c.dataInizio || c.dataPianInizio); }
function _perfAge(c) {
  const d = _perfParseDate(c.dataAssegnazione) || _perfParseDate(c.dataPianInizio) || _perfParseDate(c.dataInizio);
  return d ? Math.floor((new Date() - d) / 86400000) : 0;
}

function _perfMetric(items, metric) {
  switch (metric) {
    case 'wipN': return items.filter(isOpen).length;
    case 'wipE': return items.filter(isOpen).reduce((s, c) => s + (c.consulenza || 0), 0);
    case 'outN': return items.filter(isClosed).length;
    case 'outE': return items.filter(isClosed).reduce((s, c) => s + (c.consulenza || 0), 0);
    case 'throughput': {
      const cl = items.filter(isClosed);
      const months = new Set();
      cl.forEach(c => { const d = _perfParseDate(c.dataFine) || _perfStart(c); if (d) months.add(d.getFullYear() + '-' + d.getMonth()); });
      return months.size ? cl.length / months.size : 0;
    }
    case 'backlog': return items.filter(c => isOpen(c) && _perfAge(c) > 60).length;
    case 'margine': {
      const cl = items.filter(isClosed);
      const r = cl.reduce((s, c) => s + (c.consulenza || 0), 0);
      return r ? cl.reduce((s, c) => s + (c.mol || 0), 0) / r * 100 : 0;
    }
    case 'pctInc': {
      const cl = items.filter(isClosed);
      const r = cl.reduce((s, c) => s + (c.consulenza || 0), 0);
      return r ? cl.reduce((s, c) => s + (c.giaIncassato || 0), 0) / r * 100 : 0;
    }
    case 'incE': return items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  }
  return 0;
}

function _perfFmt(v, metric) {
  if (metric === 'wipE' || metric === 'outE' || metric === 'incE') return fmtE(v);
  if (metric === 'margine' || metric === 'pctInc') return v.toFixed(1) + '%';
  if (metric === 'throughput') return v.toFixed(1);
  return fmt(v);
}

function _perfGroup(items, segment) {
  const seg = PERF_SEGMENTS.find(s => s.id === segment);
  const g = new Map();
  if (!seg.field) { g.set(seg.label, items); return g; }
  items.forEach(c => {
    const k = _perfNorm(c[seg.field]);
    if (!g.has(k)) g.set(k, []);
    g.get(k).push(c);
  });
  return g;
}

function _perfBinKey(d, agg) {
  if (!d) return null;
  const y = d.getFullYear(), m = d.getMonth() + 1;
  if (agg === 'year') return String(y);
  if (agg === 'quarter') return y + '-Q' + Math.ceil(m / 3);
  if (agg === 'week') {
    const tmp = new Date(d); tmp.setHours(0, 0, 0, 0);
    tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
    const ys = new Date(tmp.getFullYear(), 0, 1);
    const w = Math.ceil((((tmp - ys) / 86400000) + 1) / 7);
    return tmp.getFullYear() + '-W' + String(w).padStart(2, '0');
  }
  return y + '-' + String(m).padStart(2, '0');
}

/* Dataset base senza il period filter globale (multiselect + quick filter).
   Usato per i confronti A/B/anno precedente che hanno intervalli propri. */
function _perfBase() {
  if (typeof D === 'undefined' || !D) return [];
  const defs = (typeof _filterDefs === 'function') ? _filterDefs() : [];
  return D.filter(c => {
    for (const f of defs) if (typeof _matchFilter === 'function' && !_matchFilter(f, c)) return false;
    if (typeof _quickFilter !== 'undefined' && _quickFilter && !_quickFilter.predicate(c)) return false;
    return true;
  });
}

function _perfInRange(c, from, to) {
  const d = _perfStart(c);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function _perfParsePeriod(p) {
  if (!p) return null;
  let m;
  if ((m = p.match(/^(\d{4})$/)))            return { from: new Date(+m[1], 0, 1),       to: new Date(+m[1], 11, 31, 23, 59, 59) };
  if ((m = p.match(/^(\d{4})-M(\d{1,2})$/))) { const i = +m[2] - 1; return { from: new Date(+m[1], i, 1),     to: new Date(+m[1], i + 1, 0, 23, 59, 59) }; }
  if ((m = p.match(/^(\d{4})-Q(\d)$/)))      { const i = +m[2] - 1; return { from: new Date(+m[1], i * 3, 1), to: new Date(+m[1], i * 3 + 3, 0, 23, 59, 59) }; }
  return null;
}

function _perfPeriods() {
  const s = _perfState();
  const cur = (typeof _periodRange === 'function') ? _periodRange() : { from: null, to: null };
  if (s.compare === 'none') return [{ label: 'Periodo', items: filtered }];
  if (s.compare === 'prev') {
    if (!cur.from || !cur.to) return [{ label: 'Periodo', items: filtered }];
    const span = cur.to - cur.from;
    const bTo = new Date(cur.from.getTime() - 1);
    const bFrom = new Date(bTo.getTime() - span);
    return [
      { label: 'Corrente',   items: filtered },
      { label: 'Precedente', items: _perfBase().filter(c => _perfInRange(c, bFrom, bTo)) }
    ];
  }
  if (s.compare === 'year') {
    if (!cur.from || !cur.to) return [{ label: 'Periodo', items: filtered }];
    const bF = new Date(cur.from); bF.setFullYear(bF.getFullYear() - 1);
    const bT = new Date(cur.to);   bT.setFullYear(bT.getFullYear() - 1);
    return [
      { label: 'Corrente',   items: filtered },
      { label: 'Anno prec.', items: _perfBase().filter(c => _perfInRange(c, bF, bT)) }
    ];
  }
  const base = _perfBase();
  const a = _perfParsePeriod(s.aIso), b = _perfParsePeriod(s.bIso);
  return [
    { label: 'A: ' + (s.aIso || '—'), items: a ? base.filter(c => _perfInRange(c, a.from, a.to)) : [] },
    { label: 'B: ' + (s.bIso || '—'), items: b ? base.filter(c => _perfInRange(c, b.from, b.to)) : [] }
  ];
}

function _perfLoadTargets(cb) {
  if (_perfTargets !== null) { cb(_perfTargets); return; }
  const path = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.targetsFile) || 'data/targets.json';
  fetch(path)
    .then(r => r.ok ? r.json() : null)
    .then(d => { _perfTargets = d || { tecnico: {}, commerciale: {}, segnalatore: {} }; cb(_perfTargets); })
    .catch(() => { _perfTargets = { tecnico: {}, commerciale: {}, segnalatore: {} }; cb(_perfTargets); });
}

function _perfCtrl() {
  const s = _perfState();
  function sel(fn, opts, cur) {
    let h = '<select class="period-select" onchange="' + fn + '(this.value)">';
    opts.forEach(o => h += '<option value="' + o.id + '"' + (o.id === cur ? ' selected' : '') + '>' + o.label + '</option>');
    return h + '</select>';
  }
  let h = '<div class="period-filter" style="border:1px solid var(--border);border-radius:8px;margin-bottom:14px;padding:10px 14px">';
  h += '<span class="qf-label">Analizza per:</span>' + sel('_perfSetSeg', PERF_SEGMENTS, s.segment);
  h += '<span class="qf-label">Metrica:</span>'     + sel('_perfSetMet', PERF_METRICS, s.metric);
  h += '<span class="qf-label">Aggregazione:</span>'+ sel('_perfSetAgg', PERF_AGG, s.agg);
  h += '<span class="qf-label">Confronto:</span>'   + sel('_perfSetCmp', PERF_COMPARE, s.compare);
  h += '<span class="qf-label">Top N:</span><select class="period-select" onchange="_perfSetTopN(this.value)">';
  [5, 10, 15, 20, 30, 50].forEach(n => h += '<option value="' + n + '"' + (n === s.topN ? ' selected' : '') + '>' + n + '</option>');
  h += '</select>';
  if (s.compare === 'custom') {
    h += '<div style="flex-basis:100%;height:0"></div>';
    h += '<span class="qf-label">A:</span><input type="text" class="period-date" style="min-width:140px" placeholder="YYYY · YYYY-Qx · YYYY-Mxx" value="' + s.aIso + '" onchange="_perfSetA(this.value)">';
    h += '<span class="qf-label">B:</span><input type="text" class="period-date" style="min-width:140px" placeholder="YYYY · YYYY-Qx · YYYY-Mxx" value="' + s.bIso + '" onchange="_perfSetB(this.value)">';
  }
  return h + '</div>';
}

function renderPerformance() {
  const el = document.getElementById('sec-performance');
  if (!el) return;
  _perfLoadTargets(() => _perfBody(el));
}

function _perfBody(el) {
  const s = _perfState();
  const periods = _perfPeriods();
  const seg = PERF_SEGMENTS.find(x => x.id === s.segment);
  const metDef = PERF_METRICS.find(x => x.id === s.metric);
  const groups = _perfGroup(periods[0].items, s.segment);
  const sorted = [...groups.entries()]
    .map(([k, items]) => ({ key: k, items, val: _perfMetric(items, s.metric) }))
    .sort((a, b) => b.val - a.val);
  const top = sorted[0] || { key: '—', val: 0 };
  const tot = _perfMetric(periods[0].items, s.metric);
  const nd  = sorted.find(x => x.key === 'N/D');

  let h = '<div class="sec"><h3 class="sec-title">Performance · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Vista comparativa per ' +
       seg.label + ' con metrica <strong>' + metDef.label + '</strong>. Le scelte sono memorizzate per ogni BU.</p>';
  h += _perfCtrl();
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Top ' + seg.label + '</div><div class="kpi-value" style="font-size:14px">' +
       (top.key.length > 20 ? top.key.substring(0, 18) + '..' : top.key) + '</div><div class="kpi-sub">' + _perfFmt(top.val, s.metric) + '</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Totale BU</div><div class="kpi-value">' + _perfFmt(tot, s.metric) +
       '</div><div class="kpi-sub">su ' + fmt(periods[0].items.length) + ' commesse</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">' + seg.label + ' attivi</div><div class="kpi-value">' + fmt(sorted.length) +
       '</div><div class="kpi-sub">distinti</div></div>';
  if (periods.length === 2) {
    const aV = _perfMetric(periods[0].items, s.metric), bV = _perfMetric(periods[1].items, s.metric);
    const d = bV ? ((aV - bV) / bV * 100) : 0;
    h += '<div class="kpi ' + (d >= 0 ? 'green' : 'pink') + '"><div class="kpi-label">Δ vs ' + periods[1].label + '</div>' +
         '<div class="kpi-value">' + (d >= 0 ? '+' : '') + d.toFixed(1) + '%</div>' +
         '<div class="kpi-sub">' + _perfFmt(aV, s.metric) + ' vs ' + _perfFmt(bV, s.metric) + '</div></div>';
  } else {
    h += '<div class="kpi orange"><div class="kpi-label">% N/D</div>' +
         '<div class="kpi-value">' + (nd && tot ? (nd.val / tot * 100).toFixed(1) + '%' : '0%') + '</div>' +
         '<div class="kpi-sub">' + (nd ? fmt(nd.items.length) + ' senza ' + seg.label.toLowerCase() : 'tutto attribuito') + '</div></div>';
  }
  h += '</div>';
  h += '<div class="card"><h4>Top ' + s.topN + ' ' + seg.label + ' per ' + metDef.label + '</h4>' +
       '<div class="chart-wrap"><canvas id="chPerfBar"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><h4>Trend nel tempo (' +
       PERF_AGG.find(a => a.id === s.agg).label.toLowerCase() + ')</h4>' +
       '<div class="chart-wrap"><canvas id="chPerfTrend"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><h4>Scorecard ' + seg.label + '</h4>' +
       '<div class="tbl-scroll"><table id="tblPerf"></table></div></div></div>';
  el.innerHTML = h;

  _perfRenderBar(periods, sorted);
  _perfRenderTrend(periods);
  _perfRenderScore(periods, seg);
}
