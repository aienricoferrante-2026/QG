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

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  if (!el) return;
  const f = filtered;

  function _parseDate(s) {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return null;
    return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  }
  const today = new Date();

  const molNeg = f.filter(c => (c.mol || 0) < 0 && (c.consulenza || 0) > 0)
    .map(c => ({ ...c, _kpi: c.mol })).sort((a, b) => a._kpi - b._kpi);
  const stalled = f.filter(c => {
    if ((c.avanzamento || 0) >= 50) return false;
    const fine = _parseDate(c.dataFine);
    return fine && fine < today;
  }).map(c => {
    const fine = _parseDate(c.dataFine);
    const giorni = fine ? Math.floor((today - fine) / 86400000) : 0;
    return { ...c, _kpi: giorni };
  }).sort((a, b) => b._kpi - a._kpi);
  const senzaIncasso = f.filter(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0)
    .map(c => {
      const inizio = _parseDate(c.dataInizio || c.dataPianInizio);
      const eta = inizio ? Math.floor((today - inizio) / 86400000) : 0;
      return { ...c, _kpi: eta };
    }).sort((a, b) => b._kpi - a._kpi);

  // Clienti a rischio
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
    .slice(0, 10);

  let h = '<div class="sec"><h3 class="sec-title">Alert & Anomalie</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Vista prioritizzata di problemi e situazioni a rischio.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi pink"><div class="kpi-label">MOL Negativo</div><div class="kpi-value">' + fmt(molNeg.length) + '</div><div class="kpi-sub">Costi &gt; Ricavi</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Senza incasso</div><div class="kpi-value">' + fmt(senzaIncasso.length) + '</div><div class="kpi-sub">€ 0 incassati</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Stalled</div><div class="kpi-value">' + fmt(stalled.length) + '</div><div class="kpi-sub">avz. &lt; 50% e data passata</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Clienti a rischio</div><div class="kpi-value">' + fmt(cliRiskList.length) + '</div><div class="kpi-sub">esposiz. &gt; 50K, %inc &lt; 30%</div></div>';
  h += '</div>';

  if (molNeg.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #ef4444"><h4 style="color:#ef4444">⚠️ Top 10 commesse con MOL negativo</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertMolNeg"></table></div></div>';
  }
  if (stalled.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #8b5cf6"><h4 style="color:#8b5cf6">🐢 Top 10 commesse stalled</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertStalled"></table></div></div>';
  }
  if (senzaIncasso.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #f59e0b"><h4 style="color:#f59e0b">💸 Top 10 commesse senza incasso</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertNoInc"></table></div></div>';
  }
  if (cliRiskList.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #10b981"><h4 style="color:#10b981">🎯 Clienti a rischio</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertCli"></table></div></div>';
  }

  if (!molNeg.length && !stalled.length && !senzaIncasso.length && !cliRiskList.length) {
    h += '<div class="card"><p style="color:var(--green);text-align:center;padding:20px">Nessun alert rilevato sui filtri attuali</p></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  const cmCols = ['ID', 'Titolo', 'Cliente', 'Sede', 'Ricavi', 'Costi', 'MOL', 'Avz.', 'Qnet'];
  const cmTypes = ['num', 'str', 'str', 'str', 'num', 'num', 'num', 'num', 'str'];
  function _row(c) {
    return [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 50), val: c.titolo },
      { display: (c.cliente || '').substring(0, 30), val: c.cliente },
      { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      { display: fmtE(c.costi || 0), val: c.costi || 0 },
      { display: fmtE(c.mol || 0), val: c.mol || 0 },
      { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
      qnetBtn(c)
    ];
  }
  if (molNeg.length) buildTbl('tblAlertMolNeg', cmCols, molNeg.slice(0, 10).map(_row), cmTypes);
  if (stalled.length) {
    buildTbl('tblAlertStalled',
      ['ID', 'Titolo', 'Cliente', 'Sede', 'Avz.', 'Data Fine', 'Giorni rit.', 'Ricavi', 'Qnet'],
      stalled.slice(0, 10).map(c => [
        c.id || '',
        { display: ((c.titolo || c.contratto || '') + '').substring(0, 45), val: c.titolo },
        { display: (c.cliente || '').substring(0, 30), val: c.cliente },
        { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
        { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
        c.dataFine || '-',
        { display: '<strong style="color:#ef4444">' + fmt(c._kpi) + ' gg</strong>', val: c._kpi },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        qnetBtn(c)
      ]),
      ['num', 'str', 'str', 'str', 'num', 'str', 'num', 'num', 'str']
    );
  }
  if (senzaIncasso.length) {
    buildTbl('tblAlertNoInc',
      ['ID', 'Titolo', 'Cliente', 'Sede', 'Data Inizio', 'Età (gg)', 'Ricavi', 'Qnet'],
      senzaIncasso.slice(0, 10).map(c => [
        c.id || '',
        { display: ((c.titolo || c.contratto || '') + '').substring(0, 45), val: c.titolo },
        { display: (c.cliente || '').substring(0, 30), val: c.cliente },
        { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
        c.dataInizio || c.dataPianInizio || '-',
        { display: '<strong>' + fmt(c._kpi) + '</strong>', val: c._kpi },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        qnetBtn(c)
      ]),
      ['num', 'str', 'str', 'str', 'str', 'num', 'num', 'str']
    );
  }
  if (cliRiskList.length) {
    buildTbl('tblAlertCli',
      ['Cliente', 'Comm.', 'Ricavi', 'Incassato', '% Inc.', 'Esposizione'],
      cliRiskList.map(c => [
        { display: c.cliente.length > 50 ? c.cliente.substring(0, 48) + '..' : c.cliente, val: c.cliente },
        { display: fmt(c.cnt), val: c.cnt },
        { display: fmtE(c.ric), val: c.ric },
        { display: fmtE(c.inc), val: c.inc },
        { display: '<strong style="color:#ef4444">' + c.pctInc.toFixed(1) + '%</strong>', val: c.pctInc },
        { display: '<strong>' + fmtE(c.esposizione) + '</strong>', val: c.esposizione }
      ]),
      ['str', 'num', 'num', 'num', 'num', 'num'],
      { clickField: 'cliente' }
    );
  }
}
