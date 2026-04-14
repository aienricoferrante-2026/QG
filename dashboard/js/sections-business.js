/* Sections: Carico, Contratti, Pagamenti, CrossTab, Funnel, Geografia */

function renderCarico() {
  const actives = filtered.filter(c => c.st !== 'Eseguito' && c.st !== 'Annullato');
  const byResp = {};
  actives.forEach(c => {
    if (!byResp[c.rp]) byResp[c.rp] = { n: 0, cons: 0, ente: 0 };
    byResp[c.rp].n++; byResp[c.rp].cons += c.co; byResp[c.rp].ente += c.en;
  });
  const sorted = Object.entries(byResp).sort((a, b) => b[1].n - a[1].n);
  const max = sorted[0] ? sorted[0][1].n : 1;
  const totCons = actives.reduce((s, c) => s + c.co, 0);
  const totEnte = actives.reduce((s, c) => s + c.en, 0);
  const senzaR = actives.filter(c => !c.rp || c.rp === '(Non Assegnato)').length;

  const el = document.getElementById('sec-carico');
  el.innerHTML = `
  <div class="kpi-grid" style="margin-bottom:16px">
    <div class="kpi-card c1 clickable" onclick="drillDownCustom('Commesse Attive',c=>c.st!=='Eseguito'&&c.st!=='Annullato')"><div class="kpi-val">${fmt(actives.length)}</div><div class="kpi-lbl">Commesse Attive</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
    <div class="kpi-card c3"><div class="kpi-val">${sorted.length}</div><div class="kpi-lbl">Responsabili Coinvolti</div></div>
    <div class="kpi-card c4"><div class="kpi-val">${fmtE(totCons + totEnte)}</div><div class="kpi-lbl">Valore Attivo Totale</div></div>
    <div class="kpi-card c5 clickable" onclick="drillDownCustom('Attive senza Resp.',c=>c.st!=='Eseguito'&&c.st!=='Annullato'&&(!c.rp||c.rp==='(Non Assegnato)'))"><div class="kpi-val">${fmt(senzaR)}</div><div class="kpi-lbl">Attive senza Resp.</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
  </div>
  <div class="sec"><div class="sec-title">Carico di Lavoro - Commesse Attive per Responsabile</div>
    <div class="tbl-scroll"><table id="tblCarico"></table></div></div>`;

  buildTbl('tblCarico', ['Responsabile', 'Attive', 'Carico', 'Fatt. Cons.', 'Fatt. Ente'],
    sorted.map(([nome, d]) => {
      const pct = Math.round(d.n / max * 100);
      const col = pct > 70 ? '#ef4444' : pct > 40 ? '#eab308' : '#22c55e';
      const bar = '<div class="progress-bar" style="width:100px;display:inline-block">' +
        '<div class="progress-fill" style="width:' + pct + '%;background:' + col + '"></div></div> ' + fmtP(pct);
      return [
        { display: nome, val: nome, raw: nome },
        { display: fmt(d.n), val: d.n }, { display: bar, val: d.n },
        { display: fmtE(d.cons), val: d.cons }, { display: fmtE(d.ente), val: d.ente }
      ];
    }),
    ['str', 'num', 'num', 'num', 'num'], { clickField: 'rp' });
}

function renderContratti() {
  const el = document.getElementById('sec-contratti');
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Top 10 per Volume</h3><canvas id="chCt1"></canvas></div>
    <div class="chart-box"><h3>Top 10 per Fatturato</h3><canvas id="chCt2"></canvas></div>
  </div>
  <div class="sec"><div class="sec-title">Dettaglio Contratti <span class="badge">${D.contratti.length}</span></div>
    <div class="tbl-scroll"><table id="tblCt"></table></div></div>`;

  const t10 = D.contratti.slice(0, 10);
  simpleBar('chCt1', t10.map(c => c.nome.replace(/ISO_/g, '')), t10.map(c => c.commesse));
  const t10f = [...D.contratti].sort((a, b) => b.totale - a.totale).slice(0, 10);
  stackedBar('chCt2', t10f.map(c => c.nome.replace(/ISO_/g, '')), [
    { label: 'Cons.', data: t10f.map(c => c.cons), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: t10f.map(c => c.ente), backgroundColor: '#8b5cf6' }
  ]);

  buildTbl('tblCt',
    ['Contratto', 'Comm.', '%', 'Cons.', 'Ente', 'Totale', 'Tasso'],
    D.contratti.map(c => [
      { display: c.nome, val: c.nome, raw: c.nome },
      { display: fmt(c.commesse), val: c.commesse }, { display: fmtP(c.pct), val: c.pct },
      { display: fmtE(c.cons), val: c.cons }, { display: fmtE(c.ente), val: c.ente },
      { display: fmtE(c.totale), val: c.totale }, { display: tagEsec(c.tasso_esec), val: c.tasso_esec }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'], { clickField: 'ct' });
}

function renderPagamenti() {
  const spShort = {};
  Object.entries(D.stato_pagamento).forEach(([k, v]) => { spShort[k.replace(/ \(.*\)/, '')] = v; });
  const el = document.getElementById('sec-pagamenti');
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Stato Pagamento</h3><canvas id="chPag"></canvas></div>
    <div class="chart-box"><h3>Stato Certificato</h3><canvas id="chCert"></canvas></div>
  </div>
  <div class="grid2">
    <div class="chart-box"><h3>Enti di Riferimento</h3><canvas id="chEnti"></canvas></div>
    <div class="sec"><div class="sec-title">Top Stati Lavorazione</div>
      <div class="tbl-scroll"><table id="tblStati"></table></div></div>
  </div>`;

  donutChart('chPag', Object.keys(spShort), Object.values(spShort),
    ['#22c55e', '#eab308', '#3b82f6', '#ef4444', '#f97316', '#10b981']);
  donutChart('chCert', Object.keys(D.stato_certificato), Object.values(D.stato_certificato),
    ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']);
  simpleBar('chEnti', Object.keys(D.enti), Object.values(D.enti), '#3b82f6', true);

  buildTbl('tblStati', ['Stato', 'Count', '%'],
    D.stati_lavorazione.map(s => [
      s.nome, { display: fmt(s.count), val: s.count }, { display: fmtP(s.pct), val: s.pct }
    ]), ['str', 'num', 'num']);
}

/* Cross-Tab: Status vs Stato Pagamento */
function renderCrosstab() {
  const el = document.getElementById('sec-crosstab');

  // Build cross-tab from filtered data
  const cross = {};
  const stati = new Set(), pags = new Set();
  filtered.forEach(c => {
    if (!c.st || !c.sps) return;
    const key = c.st + '||' + c.sps;
    if (!cross[key]) cross[key] = { n: 0, cons: 0, ente: 0 };
    cross[key].n++; cross[key].cons += c.co; cross[key].ente += c.en;
    stati.add(c.st); pags.add(c.sps);
  });

  const statiArr = [...stati].sort();
  const pagsArr = [...pags].sort();

  // Anomaly detection
  const anomalies = [];
  Object.entries(cross).forEach(([key, v]) => {
    const [st, pg] = key.split('||');
    const isAnomaly = (st === 'Annullato' && !['Saldato', 'Omaggio'].includes(pg))
      || (st === 'Eseguito' && pg === 'Insoluto Prec.')
      || (st === 'Da pianificare' && pg === 'Saldato');
    if (isAnomaly) anomalies.push({ status: st, pag: pg, n: v.n, cons: v.cons, ente: v.ente });
  });

  el.innerHTML = `
  ${anomalies.length ? '<div class="sec" style="border-color:rgba(239,68,68,.3)"><div class="sec-title" style="color:var(--danger)">Anomalie Rilevate <span class="badge" style="background:rgba(239,68,68,.15);color:var(--danger)">' + anomalies.length + '</span></div><div class="tbl-scroll"><table id="tblAnomalie"></table></div></div>' : ''}
  <div class="sec">
    <div class="sec-title">Matrice Status vs Stato Pagamento</div>
    <div class="tbl-scroll"><table id="tblCross"></table></div>
  </div>
  <div class="chart-box"><h3>Status x Pagamento (Stacked)</h3><canvas id="chCross"></canvas></div>`;

  // Anomaly table
  if (anomalies.length) {
    buildTbl('tblAnomalie', ['Status', 'Stato Pag.', 'Commesse', 'Fatt. Cons.', 'Fatt. Ente'],
      anomalies.sort((a, b) => b.n - a.n).map(a => [
        { display: '<span class="tag tag-red">' + a.status + '</span>', val: a.status },
        { display: '<span class="tag tag-yellow">' + a.pag + '</span>', val: a.pag },
        { display: fmt(a.n), val: a.n },
        { display: fmtE(a.cons), val: a.cons }, { display: fmtE(a.ente), val: a.ente }
      ]), ['str', 'str', 'num', 'num', 'num']);
  }

  // Cross-tab matrix
  const hdrs = ['Status / Pagamento', ...pagsArr, 'TOTALE'];
  const rows = statiArr.map(st => {
    const cells = [st];
    let rowTotal = 0;
    pagsArr.forEach(pg => {
      const v = cross[st + '||' + pg];
      const n = v ? v.n : 0;
      rowTotal += n;
      const isAnom = anomalies.some(a => a.status === st && a.pag === pg);
      const display = n ? (isAnom ? '<span class="tag tag-red">' + fmt(n) + '</span>' : fmt(n)) : '-';
      cells.push({ display, val: n });
    });
    cells.push({ display: '<strong>' + fmt(rowTotal) + '</strong>', val: rowTotal });
    return cells;
  });
  const types = ['str', ...pagsArr.map(() => 'num'), 'num'];
  buildTbl('tblCross', hdrs, rows, types);

  // Stacked bar chart
  const colors = ['#22c55e', '#eab308', '#3b82f6', '#ef4444', '#f97316', '#10b981', '#8b5cf6'];
  stackedBar('chCross', statiArr, pagsArr.map((pg, i) => ({
    label: pg,
    data: statiArr.map(st => { const v = cross[st + '||' + pg]; return v ? v.n : 0; }),
    backgroundColor: colors[i % colors.length]
  })));
}

/* Funnel with clickable items */
function renderFunnel() {
  const el = document.getElementById('sec-funnel');

  // Build funnel from filtered data
  const byStato = {};
  filtered.forEach(c => {
    if (!c.sl) return;
    if (!byStato[c.sl]) byStato[c.sl] = 0;
    byStato[c.sl]++;
  });
  const fd = Object.entries(byStato).sort((a, b) => b[1] - a[1]).slice(0, 20);

  el.innerHTML = `
  <div class="chart-box" style="margin-bottom:16px">
    <h3>Funnel Lavorazione (top 20 stati)</h3><canvas id="chFunnel"></canvas>
  </div>
  <div class="sec"><div class="sec-title">Dettaglio Stati Lavorazione <span class="badge">${fd.length}</span></div>
    <div class="tbl-scroll"><table id="tblFunnel"></table></div></div>`;

  const bgColors = fd.map((_, i) => {
    const h = i / fd.length;
    return h < .3 ? '#3b82f6' : h < .6 ? '#8b5cf6' : h < .8 ? '#10b981' : '#22c55e';
  });
  simpleBar('chFunnel', fd.map(f => f[0].substring(0, 40)), fd.map(f => f[1]), bgColors, true);

  const total = filtered.length || 1;
  buildTbl('tblFunnel', ['Stato Lavorazione', 'Count', '%'],
    fd.map(([nome, cnt]) => [
      { display: nome, val: nome, raw: nome },
      { display: fmt(cnt), val: cnt },
      { display: fmtP(cnt / total * 100), val: cnt / total * 100 }
    ]),
    ['str', 'num', 'num'], { clickField: 'sl' });
}

function renderGeografia() {
  const el = document.getElementById('sec-geografia');
  el.innerHTML = `
  <div class="chart-box" style="margin-bottom:16px"><h3>Top 15 Citta</h3><canvas id="chCi"></canvas></div>
  <div class="sec"><div class="sec-title">Distribuzione Geografica</div>
    <div class="tbl-scroll"><table id="tblCi"></table></div></div>`;

  simpleBar('chCi', D.citta.slice(0, 15).map(c => c.nome), D.citta.slice(0, 15).map(c => c.commesse));

  buildTbl('tblCi',
    ['Citta', 'Comm.', 'Cons.', 'Ente', 'Clienti', 'Tasso'],
    D.citta.map(c => [
      { display: c.nome, val: c.nome, raw: c.nome },
      { display: fmt(c.commesse), val: c.commesse },
      { display: fmtE(c.cons), val: c.cons }, { display: fmtE(c.ente), val: c.ente },
      { display: fmt(c.clienti), val: c.clienti }, { display: tagEsec(c.tasso_esec), val: c.tasso_esec }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'], { clickField: 'ci' });
}
