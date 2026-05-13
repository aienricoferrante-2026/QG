/* ── Explore · metriche, dimensioni, confronto periodi ──
   Tappa 2: assorbe le funzioni di section-performance.js (porting + estensione).
   Esposto al kit: EXPLORE_DIMENSIONS, EXPLORE_METRICS, EXPLORE_COMPARE,
   EXPLORE_PRESETS, _exploreDimGetter, _exploreMetric, _exploreFmt,
   _explorePeriods. */

const EXPLORE_DIMENSIONS = [
  { id: 'none',        label: '— (nessuno)' },
  { id: 'societa',     label: 'Società' },
  { id: 'regione',     label: 'Regione' },
  { id: 'sedeNorm',    label: 'Sede' },
  { id: 'cliente',     label: 'Cliente' },
  { id: 'responsabile',label: 'Tecnico' },
  { id: 'agente',      label: 'Commerciale' },
  { id: 'segnalatore', label: 'Segnalatore' },
  { id: 'status',      label: 'Status' },
  { id: 'statoLav',    label: 'Stato Lavorazione' },
  { id: 'statusXLav',  label: 'Status × Stato Lav.' },
  { id: 'anno',        label: 'Anno' },
  { id: 'mese',        label: 'Mese' },
  { id: 'funzione',    label: 'Funzione' }
];

/* Campo "drill" associato alla dimensione (per clickField del kit drill-down).
   Le dimensioni virtuali (statusXLav, anno, mese) non hanno drill diretto. */
const EXPLORE_DIM_DRILL = {
  societa: 'societa', regione: 'regione', sedeNorm: 'sedeNorm',
  cliente: 'cliente', responsabile: 'responsabile', agente: 'agente',
  segnalatore: 'segnalatore', status: 'status', statoLav: 'statoLav',
  funzione: 'funzione'
};

const EXPLORE_METRICS = [
  { id: 'ricavi',      label: 'Ricavi (€)',       short: 'Ricavi',      type: 'eur' },
  { id: 'costi',       label: 'Costi (€)',        short: 'Costi',       type: 'eur' },
  { id: 'mol',         label: 'MOL (€)',          short: 'MOL',         type: 'eur' },
  { id: 'margine',     label: 'Margine %',        short: 'Margine %',   type: 'pct' },
  { id: 'incassato',   label: 'Incassato (€)',    short: 'Incassato',   type: 'eur' },
  { id: 'pctInc',      label: '% Incasso',        short: '% Inc.',      type: 'pct' },
  { id: 'daIncassare', label: 'Da Incassare (€)', short: 'Da Inc.',     type: 'eur' },
  { id: 'count',       label: 'Commesse (n.)',    short: 'Comm.',       type: 'num' },
  { id: 'wipN',        label: 'WIP (numero)',     short: 'WIP n',       type: 'num' },
  { id: 'wipE',        label: 'WIP (€)',          short: 'WIP €',       type: 'eur' },
  { id: 'outN',        label: 'Output (numero)',  short: 'Out n',       type: 'num' },
  { id: 'outE',        label: 'Output (€)',       short: 'Out €',       type: 'eur' },
  { id: 'throughput',  label: 'Throughput (chius./mese)', short: 'Thr.', type: 'dec' },
  { id: 'backlog',     label: 'Backlog >60gg',    short: 'Backlog',     type: 'num' },
  { id: 'avanzMedio',  label: 'Avanz. medio %',   short: 'Avz. %',      type: 'pct' }
];

const EXPLORE_COMPARE = [
  { id: 'none',   label: 'Nessuno' },
  { id: 'prev',   label: 'vs Periodo precedente' },
  { id: 'year',   label: 'vs Anno precedente' },
  { id: 'custom', label: 'A vs B (custom)' }
];

const EXPLORE_PRESETS = [
  { id: 'sedi',     label: '📍 Sedi',                  l1: 'sedeNorm',    l2: 'none', l3: 'none',    m: 'ricavi' },
  { id: 'clienti',  label: '👥 Clienti',               l1: 'cliente',     l2: 'none', l3: 'none',    m: 'ricavi' },
  { id: 'tecWip',   label: '🛠️ Tecnico WIP',           l1: 'responsabile',l2: 'none', l3: 'none',    m: 'wipN'   },
  { id: 'commOut',  label: '💼 Commerciale Output €',  l1: 'agente',      l2: 'none', l3: 'none',    m: 'outE'   },
  { id: 'segInc',   label: '🤝 Segnalatore Incassato', l1: 'segnalatore', l2: 'none', l3: 'none',    m: 'incassato' },
  { id: 'srCli',    label: '🏢 Soc → Reg → Cliente',   l1: 'societa',     l2: 'regione', l3: 'cliente',   m: 'ricavi' },
  { id: 'srSede',   label: '🌍 Soc → Reg → Sede',      l1: 'societa',     l2: 'regione', l3: 'sedeNorm',  m: 'ricavi' },
  { id: 'sxL',      label: '🚦 Stato × Lav',           l1: 'statusXLav',  l2: 'none', l3: 'none',    m: 'count'  },
  { id: 'annoMese', label: '📅 Anno → Mese',           l1: 'anno',        l2: 'mese', l3: 'none',    m: 'outN'   }
];

/* ── Dimension getter ── */
function _exploreNorm(v) {
  return (v && String(v).trim()) ? String(v).trim() : 'N/D';
}
function _exploreParseDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  return m ? new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])) : null;
}
function _exploreStart(c) { return _exploreParseDate(c.dataInizio || c.dataPianInizio); }
function _exploreAge(c) {
  const d = _exploreParseDate(c.dataAssegnazione) || _exploreParseDate(c.dataPianInizio) || _exploreParseDate(c.dataInizio);
  return d ? Math.floor((new Date() - d) / 86400000) : 0;
}

function _exploreDimGetter(dimId) {
  if (dimId === 'statusXLav') {
    return c => _exploreNorm(c.status) + ' · ' + _exploreNorm(c.statoLav);
  }
  if (dimId === 'anno') {
    return c => { const d = _exploreStart(c); return d ? String(d.getFullYear()) : 'N/D'; };
  }
  if (dimId === 'mese') {
    return c => {
      const d = _exploreStart(c);
      return d ? d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') : 'N/D';
    };
  }
  return c => _exploreNorm(c[dimId]);
}

/* ── Metric computation ── */
function _exploreMetric(items, metric) {
  if (!items || !items.length) return 0;
  switch (metric) {
    case 'ricavi':      return items.reduce((s, c) => s + (c.consulenza || 0), 0);
    case 'costi':       return items.reduce((s, c) => s + (c.costi || 0), 0);
    case 'mol':         return items.reduce((s, c) => s + (c.mol || 0), 0);
    case 'margine': {
      const r = items.reduce((s, c) => s + (c.consulenza || 0), 0);
      return r ? items.reduce((s, c) => s + (c.mol || 0), 0) / r * 100 : 0;
    }
    case 'incassato':   return items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
    case 'pctInc': {
      const r = items.reduce((s, c) => s + (c.consulenza || 0), 0);
      return r ? items.reduce((s, c) => s + (c.giaIncassato || 0), 0) / r * 100 : 0;
    }
    case 'daIncassare': {
      const r = items.reduce((s, c) => s + (c.consulenza || 0), 0);
      const i = items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
      return Math.max(0, r - i);
    }
    case 'count':       return items.length;
    case 'wipN':        return items.filter(isOpen).length;
    case 'wipE':        return items.filter(isOpen).reduce((s, c) => s + (c.consulenza || 0), 0);
    case 'outN':        return items.filter(isClosed).length;
    case 'outE':        return items.filter(isClosed).reduce((s, c) => s + (c.consulenza || 0), 0);
    case 'throughput': {
      const cl = items.filter(isClosed);
      const months = new Set();
      cl.forEach(c => {
        const d = _exploreParseDate(c.dataFine) || _exploreStart(c);
        if (d) months.add(d.getFullYear() + '-' + d.getMonth());
      });
      return months.size ? cl.length / months.size : 0;
    }
    case 'backlog':     return items.filter(c => isOpen(c) && _exploreAge(c) > 60).length;
    case 'avanzMedio': {
      const r = items.reduce((s, c) => s + (c.consulenza || 0), 0);
      if (!r) return 0;
      return items.reduce((s, c) => s + ((c.avanzamento || 0) * (c.consulenza || 0)), 0) / r;
    }
  }
  return 0;
}

function _exploreFmt(v, metric) {
  const def = EXPLORE_METRICS.find(m => m.id === metric);
  const t = def ? def.type : 'num';
  if (t === 'eur') return fmtE(v);
  if (t === 'pct') return v.toFixed(1) + '%';
  if (t === 'dec') return v.toFixed(1);
  return fmt(v);
}

/* ── Period comparison ── */
function _exploreBase() {
  if (typeof D === 'undefined' || !D) return [];
  const defs = (typeof _filterDefs === 'function') ? _filterDefs() : [];
  return D.filter(c => {
    for (const f of defs) if (typeof _matchFilter === 'function' && !_matchFilter(f, c)) return false;
    if (typeof _quickFilter !== 'undefined' && _quickFilter && !_quickFilter.predicate(c)) return false;
    return true;
  });
}

function _exploreInRange(c, from, to) {
  const d = _exploreStart(c);
  if (!d) return false;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function _exploreParsePeriod(p) {
  if (!p) return null;
  let m;
  if ((m = p.match(/^(\d{4})$/)))            return { from: new Date(+m[1], 0, 1),       to: new Date(+m[1], 11, 31, 23, 59, 59) };
  if ((m = p.match(/^(\d{4})-M(\d{1,2})$/))) { const i = +m[2] - 1; return { from: new Date(+m[1], i, 1),     to: new Date(+m[1], i + 1, 0, 23, 59, 59) }; }
  if ((m = p.match(/^(\d{4})-Q(\d)$/)))      { const i = +m[2] - 1; return { from: new Date(+m[1], i * 3, 1), to: new Date(+m[1], i * 3 + 3, 0, 23, 59, 59) }; }
  return null;
}

function _explorePeriods(state) {
  const s = state || _exploreState();
  const cur = (typeof _periodRange === 'function') ? _periodRange() : { from: null, to: null };
  if (s.compare === 'none') return [{ label: 'Periodo', items: filtered }];
  if (s.compare === 'prev') {
    if (!cur.from || !cur.to) return [{ label: 'Periodo', items: filtered }];
    const span = cur.to - cur.from;
    const bTo = new Date(cur.from.getTime() - 1);
    const bFrom = new Date(bTo.getTime() - span);
    return [
      { label: 'Corrente',   items: filtered },
      { label: 'Precedente', items: _exploreBase().filter(c => _exploreInRange(c, bFrom, bTo)) }
    ];
  }
  if (s.compare === 'year') {
    if (!cur.from || !cur.to) return [{ label: 'Periodo', items: filtered }];
    const bF = new Date(cur.from); bF.setFullYear(bF.getFullYear() - 1);
    const bT = new Date(cur.to);   bT.setFullYear(bT.getFullYear() - 1);
    return [
      { label: 'Corrente',   items: filtered },
      { label: 'Anno prec.', items: _exploreBase().filter(c => _exploreInRange(c, bF, bT)) }
    ];
  }
  const base = _exploreBase();
  const a = _exploreParsePeriod(s.aIso), b = _exploreParsePeriod(s.bIso);
  return [
    { label: 'A: ' + (s.aIso || '—'), items: a ? base.filter(c => _exploreInRange(c, a.from, a.to)) : [] },
    { label: 'B: ' + (s.bIso || '—'), items: b ? base.filter(c => _exploreInRange(c, b.from, b.to)) : [] }
  ];
}
