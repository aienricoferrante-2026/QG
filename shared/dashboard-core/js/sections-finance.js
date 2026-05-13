/* ── Sezioni: Sedi, Avanzamento, Alert (core multi-settore) ── */

function toggleSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
  const btn = document.getElementById('sidebarToggle');
  if (btn) btn.innerHTML = document.body.classList.contains('sidebar-collapsed') ? '&#9776;' : '&times;';
  setTimeout(() => { if (typeof renderCurrentSection === 'function') renderCurrentSection(); }, 220);
}

/* ── Sedi ── */
function renderSedi() {
  const el = document.getElementById('sec-sedi');
  if (!el) return;
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.sedeNorm || c.sedeOp || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, mol: 0, inc: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
    g[k].mol += (c.mol || 0);
    g[k].inc += (c.giaIncassato || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Sedi Operative</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:10px">Le sedi sono prefissate dal nome della Città per facilitare ricerca e raggruppamento.</p>';
  h += '<div class="card"><h4>Ricavi per Sede (Top 15)</h4><div class="chart-wrap"><canvas id="chSedi"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblSedi"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chSedi',
    top15.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    top15.map(e => e[1].cons), '#ec4899', true);

  buildTbl('tblSedi',
    ['Sede', 'Comm.', 'Ricavi', 'MOL', 'Incassato', '% Inc.'],
    sorted.map(([k, v]) => [
      { display: k.length > 60 ? k.substring(0, 58) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.mol), val: v.mol },
      { display: fmtE(v.inc), val: v.inc },
      { display: v.cons ? (v.inc / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.inc / v.cons * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'sedeNorm' }
  );
}

/* ── Clienti ── */
function renderClienti() {
  const el = document.getElementById('sec-clienti');
  if (!el) return;
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.cliente || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, inc: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
    g[k].costi += (c.costi || 0);
    g[k].mol += (c.mol || 0);
    g[k].inc += (c.giaIncassato || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Clienti</h3>';
  h += '<div class="card"><h4>Top 20 Clienti per Ricavi</h4><div class="chart-wrap"><canvas id="chCli"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblCli"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top20 = sorted.slice(0, 20);
  makeBar('chCli',
    top20.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    top20.map(e => e[1].cons), '#3b82f6', true);

  buildTbl('tblCli',
    ['Cliente', 'Comm.', 'Ricavi', 'Costi', 'MOL', 'Margine %', 'Incassato', '% Inc.'],
    sorted.map(([k, v]) => [
      { display: k.length > 50 ? k.substring(0, 48) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.costi), val: v.costi },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.cons ? (v.mol / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.mol / v.cons * 100 : 0 },
      { display: fmtE(v.inc), val: v.inc },
      { display: v.cons ? (v.inc / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.inc / v.cons * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}

/* ── Responsabili ── */
function renderResponsabili() {
  const el = document.getElementById('sec-responsabili');
  if (!el) return;
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.responsabile || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, mol: 0, inc: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
    g[k].mol += (c.mol || 0);
    g[k].inc += (c.giaIncassato || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Responsabili</h3>';
  h += '<div class="card"><h4>Ricavi per Responsabile (Top 15)</h4><div class="chart-wrap"><canvas id="chResp"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblResp"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chResp',
    top15.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]),
    top15.map(e => e[1].cons), '#8b5cf6', true);

  buildTbl('tblResp',
    ['Responsabile', 'Comm.', 'Ricavi', 'MOL', 'Margine %', 'Incassato', '% Inc.'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.cons ? (v.mol / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.mol / v.cons * 100 : 0 },
      { display: fmtE(v.inc), val: v.inc },
      { display: v.cons ? (v.inc / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.inc / v.cons * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'responsabile' }
  );
}

/* ── Avanzamento ── */
function renderAvanzamento() {
  const el = document.getElementById('sec-avanzamento');
  if (!el) return;
  const f = filtered;
  const bins = { '0%': 0, '1-25%': 0, '26-50%': 0, '51-75%': 0, '76-99%': 0, '100%': 0 };
  f.forEach(c => {
    const a = c.avanzamento || 0;
    if (a === 0) bins['0%']++;
    else if (a <= 25) bins['1-25%']++;
    else if (a <= 50) bins['26-50%']++;
    else if (a <= 75) bins['51-75%']++;
    else if (a < 100) bins['76-99%']++;
    else bins['100%']++;
  });

  // Cross-tab Status x Stato Lavorazione
  const cross = {};
  const allStatus = new Set();
  const allLav = new Set();
  f.forEach(c => {
    const s = c.status || 'N/D';
    const sl = c.statoLav || 'N/D';
    allStatus.add(s); allLav.add(sl);
    cross[s + '|' + sl] = (cross[s + '|' + sl] || 0) + 1;
  });

  let h = '<div class="sec"><h3 class="sec-title">Avanzamento & Stato</h3>';
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione Avanzamento</h4><div class="chart-wrap"><canvas id="chAvz"></canvas></div></div>';
  h += '<div class="card"><h4>Status vs Stato Lavorazione</h4><div class="tbl-scroll"><table id="tblCross"></table></div></div>';
  h += '</div>';

  const lowAvz = f.filter(c => (c.avanzamento || 0) < 30 && isOpen(c) && (c.consulenza || 0) > 0);
  if (lowAvz.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Commesse con Avanzamento &lt; 30% (aperte, con ricavi) — ' + lowAvz.length + '</h4>';
    h += '<div class="tbl-scroll"><table id="tblLowAvz"></table></div></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  makeBar('chAvz', Object.keys(bins), Object.values(bins), '#3b82f6', false);

  const statusArr = [...allStatus].sort();
  const lavArr = [...allLav].sort();
  const crossHdrs = ['Status \\ Stato Lav.', ...lavArr, 'Totale'];
  const crossTypes = ['str', ...lavArr.map(() => 'num'), 'num'];
  const crossRows = statusArr.map(s => {
    const row = [s];
    let tot = 0;
    lavArr.forEach(sl => {
      const v = cross[s + '|' + sl] || 0;
      tot += v;
      row.push({ display: v || '-', val: v });
    });
    row.push({ display: '<strong>' + tot + '</strong>', val: tot });
    return row;
  });
  buildTbl('tblCross', crossHdrs, crossRows, crossTypes);

  if (lowAvz.length) {
    const sorted = lowAvz.sort((a, b) => (b.consulenza || 0) - (a.consulenza || 0));
    buildTbl('tblLowAvz',
      ['ID', 'Titolo', 'Cliente', 'Sede', 'Ricavi', 'Avz.', 'Status', 'Qnet'],
      sorted.slice(0, 50).map(c => [
        c.id || '',
        { display: ((c.titolo || c.contratto || '') + '').substring(0, 50), val: c.titolo },
        { display: (c.cliente || '').substring(0, 30), val: c.cliente },
        { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
        tagStatus(c.status),
        qnetBtn(c)
      ]),
      ['num', 'str', 'str', 'str', 'num', 'num', 'str', 'str']
    );
  }
}

/* ── Alert (modulare, kit, Caso 1) ──
 * 7 alert condivisi calcolati su `filtered`. Auto-hide se conteggio = 0.
 * Ogni alert dichiara: id, label, icon, color, predicate(c), enrich(c).
 * Le tabelle mostrano max 30 righe ordinate per gravità.
 */
function _alParseDate(s) {
  if (!s) return null;
  let m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  return null;
}

function _alDaysSince(s) {
  const d = _alParseDate(s);
  if (!d) return null;
  return Math.floor((new Date() - d) / 86400000);
}

function _alIsCompleted(c) {
  /* Una commessa è "davvero conclusa" se ha avanzamento ≥ 100% oppure
     uno dei campi BU-specifici di conclusione (FOR statoCorso/Classe). */
  if ((c.avanzamento || 0) >= 100) return true;
  const sc = (c.statoCorso || '') + '|' + (c.statoClasse || '');
  if (/concluso|chiusa/i.test(sc)) return true;
  return false;
}

const ALERT_DEFS = [
  {
    id: 'chiusaNoAvz',
    label: 'Chiuse senza completamento',
    icon: '⚠️', color: '#dc2626',
    desc: 'status = "Chiusa" ma avanzamento < 100% e nessun segnale BU-specifico di conclusione',
    predicate: c => c.status === 'Chiusa' && !_alIsCompleted(c),
    cols: ['ID', 'Titolo', 'Cliente', 'Avz.', 'Ricavi', 'Incassato', 'Qnet'],
    types: ['num', 'str', 'str', 'num', 'num', 'num', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      { display: fmtE(c.giaIncassato || 0), val: c.giaIncassato || 0 },
      qnetBtn(c)
    ],
    sortBy: c => -(c.consulenza || 0),
  },
  {
    id: 'chiusaNoInc',
    label: 'Chiuse senza incasso',
    icon: '💸', color: '#f59e0b',
    desc: 'status = "Chiusa" e ricavi > 0 ma giaIncassato = 0',
    predicate: c => c.status === 'Chiusa' && (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0,
    cols: ['ID', 'Titolo', 'Cliente', 'Data Fine', 'Età (gg)', 'Da Incassare', 'Qnet'],
    types: ['num', 'str', 'str', 'str', 'num', 'num', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      c.dataFine || c.dataInizio || '-',
      { display: '<b>' + fmt(_alDaysSince(c.dataFine || c.dataInizio) || 0) + '</b>', val: _alDaysSince(c.dataFine || c.dataInizio) || 0 },
      { display: '<b style="color:#dc2626">' + fmtE(c.consulenza || 0) + '</b>', val: c.consulenza || 0 },
      qnetBtn(c)
    ],
    sortBy: c => -(c.consulenza || 0),
  },
  {
    id: 'inLavOld',
    label: 'In Lavorazione da >12 mesi',
    icon: '🐢', color: '#8b5cf6',
    desc: 'status = "In Lavorazione" con dataInizio o dataPianInizio anteriore a 365 giorni fa',
    predicate: c => {
      if (c.status !== 'In Lavorazione') return false;
      const eta = _alDaysSince(c.dataInizio || c.dataPianInizio);
      return eta !== null && eta > 365;
    },
    cols: ['ID', 'Titolo', 'Cliente', 'Data Inizio', 'Età (gg)', 'Ricavi', 'Resp.', 'Qnet'],
    types: ['num', 'str', 'str', 'str', 'num', 'num', 'str', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      c.dataInizio || c.dataPianInizio || '-',
      { display: '<b style="color:#8b5cf6">' + fmt(_alDaysSince(c.dataInizio || c.dataPianInizio) || 0) + '</b>', val: _alDaysSince(c.dataInizio || c.dataPianInizio) || 0 },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      { display: (c.responsabile || '—').substring(0, 18), val: c.responsabile || '' },
      qnetBtn(c)
    ],
    sortBy: c => -(_alDaysSince(c.dataInizio || c.dataPianInizio) || 0),
  },
  {
    id: 'pipFerma',
    label: 'Pipeline ferma da >12 mesi',
    icon: '⏳', color: '#06b6d4',
    desc: 'status = "Da pianificare" con dataPianInizio anteriore a 365 giorni fa',
    predicate: c => {
      if (c.status !== 'Da pianificare') return false;
      const eta = _alDaysSince(c.dataPianInizio);
      return eta !== null && eta > 365;
    },
    cols: ['ID', 'Titolo', 'Cliente', 'Data Pian.', 'Età (gg)', 'Ricavi', 'Qnet'],
    types: ['num', 'str', 'str', 'str', 'num', 'num', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      c.dataPianInizio || '-',
      { display: '<b>' + fmt(_alDaysSince(c.dataPianInizio) || 0) + '</b>', val: _alDaysSince(c.dataPianInizio) || 0 },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      qnetBtn(c)
    ],
    sortBy: c => -(_alDaysSince(c.dataPianInizio) || 0),
  },
  {
    id: 'ricZero',
    label: 'Ricavi azzerati su attive',
    icon: '📊', color: '#ec4899',
    desc: 'status = "In Lavorazione" ma consulenza = 0 (commessa senza valorizzazione)',
    predicate: c => c.status === 'In Lavorazione' && (c.consulenza || 0) === 0,
    cols: ['ID', 'Titolo', 'Cliente', 'StatoLav', 'Data Inizio', 'Resp.', 'Qnet'],
    types: ['num', 'str', 'str', 'str', 'str', 'str', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      { display: (c.statoLav || '—').substring(0, 25), val: c.statoLav || '' },
      c.dataInizio || c.dataPianInizio || '-',
      { display: (c.responsabile || '—').substring(0, 18), val: c.responsabile || '' },
      qnetBtn(c)
    ],
    sortBy: c => c.id || 0,
  },
  {
    id: 'dataInv',
    label: 'Date invertite (errore Excel)',
    icon: '🗓', color: '#fb7185',
    desc: 'dataFine anteriore a dataInizio — errore di compilazione',
    predicate: c => {
      const di = _alParseDate(c.dataInizio);
      const df = _alParseDate(c.dataFine);
      return di && df && df < di;
    },
    cols: ['ID', 'Titolo', 'Cliente', 'Data Inizio', 'Data Fine', 'Qnet'],
    types: ['num', 'str', 'str', 'str', 'str', 'str'],
    row: c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 40), val: c.titolo },
      { display: (c.cliente || '').substring(0, 25), val: c.cliente },
      { display: '<b>' + (c.dataInizio || '-') + '</b>', val: c.dataInizio || '' },
      { display: '<b style="color:#dc2626">' + (c.dataFine || '-') + '</b>', val: c.dataFine || '' },
      qnetBtn(c)
    ],
    sortBy: c => c.id || 0,
  },
];

function renderAlert() {
  const el = document.getElementById('sec-alert');
  if (!el) return;
  const f = filtered;

  // Esegui tutti gli alert
  const results = ALERT_DEFS.map(a => {
    const items = f.filter(a.predicate);
    items.sort((x, y) => a.sortBy(x) - a.sortBy(y));
    return { ...a, items };
  });

  // Clienti a rischio (separato, struttura diversa)
  const cliRisk = {};
  f.forEach(c => {
    const k = c.cliente || 'N/D';
    if (!cliRisk[k]) cliRisk[k] = { cnt: 0, ric: 0, inc: 0 };
    cliRisk[k].cnt++;
    cliRisk[k].ric += (c.consulenza || 0);
    cliRisk[k].inc += (c.giaIncassato || 0);
  });
  const cliRiskList = Object.entries(cliRisk)
    .map(([k, v]) => ({
      cliente: k, cnt: v.cnt, ric: v.ric, inc: v.inc,
      esposizione: v.ric - v.inc,
      pctInc: v.ric ? (v.inc / v.ric * 100) : 0
    }))
    .filter(v => v.esposizione > 50000 && v.pctInc < 30)
    .sort((a, b) => b.esposizione - a.esposizione)
    .slice(0, 15);

  let h = '<div class="sec"><h3 class="sec-title">Alert &amp; Anomalie</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Sette controlli automatici sui filtri attuali. Auto-hide degli alert con 0 hit. ' +
       'Clicca sui valori per drill-down. Le commesse "fantasma chiuse" (chiuse senza completamento o senza incasso) ' +
       'sono le anomalie più frequenti — correggere in Qnet.</p>';

  // KPI grid: 1 box per alert + Clienti a rischio
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  results.forEach(r => {
    const cls = r.items.length ? '' : 'style="opacity:.5"';
    h += '<div class="kpi" ' + cls + ' style="border-left:3px solid ' + r.color + ';' + (r.items.length ? 'cursor:pointer' : '') + '"' +
         (r.items.length ? ' onclick="_alScrollTo(\'tblAlert_' + r.id + '\')"' : '') + '>' +
         '<div class="kpi-label">' + r.icon + ' ' + r.label + '</div>' +
         '<div class="kpi-value" style="color:' + (r.items.length ? r.color : 'var(--text3)') + '">' + fmt(r.items.length) + '</div>' +
         '<div class="kpi-sub">' + r.desc.substring(0, 60) + '…</div></div>';
  });
  h += '<div class="kpi" style="border-left:3px solid #10b981;' + (cliRiskList.length ? 'cursor:pointer' : 'opacity:.5') + '"' +
       (cliRiskList.length ? ' onclick="_alScrollTo(\'tblAlertCli\')"' : '') + '>' +
       '<div class="kpi-label">🎯 Clienti a rischio</div>' +
       '<div class="kpi-value" style="color:' + (cliRiskList.length ? '#10b981' : 'var(--text3)') + '">' + fmt(cliRiskList.length) + '</div>' +
       '<div class="kpi-sub">esposiz. &gt; 50K, %inc &lt; 30%</div></div>';
  h += '</div>';

  // Cards per alert non vuoti
  results.forEach(r => {
    if (!r.items.length) return;
    h += '<div class="card" style="margin-top:14px;border-left:3px solid ' + r.color + '">' +
         '<h4 style="color:' + r.color + '">' + r.icon + ' ' + r.label + ' · ' + fmt(r.items.length) + ' commesse</h4>' +
         '<p style="color:var(--text3);font-size:11px;margin-bottom:10px">' + r.desc + '. Mostrate le prime 30.</p>' +
         '<div class="tbl-scroll"><table id="tblAlert_' + r.id + '"></table></div></div>';
  });

  if (cliRiskList.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #10b981">' +
         '<h4 style="color:#10b981">🎯 Clienti a rischio · ' + cliRiskList.length + '</h4>' +
         '<p style="color:var(--text3);font-size:11px;margin-bottom:10px">Clienti con esposizione (Ricavi − Incassato) sopra €50K e percentuale di incasso sotto il 30%.</p>' +
         '<div class="tbl-scroll"><table id="tblAlertCli"></table></div></div>';
  }

  const hasAny = results.some(r => r.items.length) || cliRiskList.length;
  if (!hasAny) {
    h += '<div class="card" style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3)">' +
         '<p style="color:#10b981;text-align:center;padding:20px;font-weight:600">✓ Nessun alert rilevato sui filtri attuali. Dato pulito.</p></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  // Render tables
  results.forEach(r => {
    if (!r.items.length) return;
    buildTbl('tblAlert_' + r.id, r.cols, r.items.slice(0, 30).map(r.row), r.types);
  });

  if (cliRiskList.length) {
    buildTbl('tblAlertCli',
      ['Cliente', 'Comm.', 'Ricavi', 'Incassato', '% Inc.', 'Esposizione'],
      cliRiskList.map(c => [
        { display: c.cliente.length > 50 ? c.cliente.substring(0, 48) + '..' : c.cliente, val: c.cliente },
        { display: fmt(c.cnt), val: c.cnt },
        { display: fmtE(c.ric), val: c.ric },
        { display: fmtE(c.inc), val: c.inc },
        { display: '<b style="color:#dc2626">' + c.pctInc.toFixed(1) + '%</b>', val: c.pctInc },
        { display: '<b>' + fmtE(c.esposizione) + '</b>', val: c.esposizione }
      ]),
      ['str', 'num', 'num', 'num', 'num', 'num'],
      { clickField: 'cliente' }
    );
  }
}

function _alScrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
