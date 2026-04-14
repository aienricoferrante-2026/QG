/* Sections: Executive, Fatturato, Commerciali, Responsabili */

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Trend Fatturato Annuale</h3><canvas id="chTrend"></canvas></div>
    <div class="chart-box"><h3>Status Commesse</h3><canvas id="chStatus"></canvas></div>
  </div>
  <div class="sec"><div class="sec-title">Trend Annuale <span class="badge">${D.trend.length} anni</span></div>
    <div class="tbl-scroll"><table id="tblTrend"></table></div>
  </div>`;

  lineChart('chTrend', D.trend.map(t => t.anno), [
    { label: 'Consulenza', data: D.trend.map(t => t.cons), borderColor: 'rgb(59,130,246)' },
    { label: 'Ente', data: D.trend.map(t => t.ente), borderColor: 'rgb(139,92,246)' }
  ]);

  donutChart('chStatus', Object.keys(D.status), Object.values(D.status),
    ['#22c55e', '#64748b', '#ef4444', '#3b82f6']);

  buildTbl('tblTrend',
    ['Anno', 'Commesse', 'Clienti', 'Fatt. Cons.', 'Fatt. Ente', 'Totale', 'Eseguiti', 'Annul.', 'Tasso', 'Ticket'],
    D.trend.map(t => [
      t.anno, { display: fmt(t.commesse), val: t.commesse }, { display: fmt(t.clienti), val: t.clienti },
      { display: fmtE(t.cons), val: t.cons }, { display: fmtE(t.ente), val: t.ente },
      { display: fmtE(t.totale), val: t.totale }, { display: fmt(t.eseguiti), val: t.eseguiti },
      { display: fmt(t.annullati), val: t.annullati }, { display: tagEsec(t.tasso_esec), val: t.tasso_esec },
      { display: fmtE(t.ticket_medio), val: t.ticket_medio }
    ]),
    ['num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num']);
}

function renderFatturato() {
  const el = document.getElementById('sec-fatturato');
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Consulenza vs Ente (Stacked)</h3><canvas id="chFattS"></canvas></div>
    <div class="chart-box"><h3>Ticket Medio per Anno</h3><canvas id="chTicket"></canvas></div>
  </div>
  <div class="chart-box"><h3>Top 5 Commerciali - Trend Fatturato</h3><canvas id="chAgTrend"></canvas></div>
  <div class="sec" style="margin-top:16px">
    <div class="sec-title">Mappa Campi Analizzati
      <span class="badge">${EXCEL_FIELDS.filter(f=>f.mapped).length}/${EXCEL_FIELDS.length} utilizzati</span>
    </div>
    <p style="color:var(--text3);font-size:11px;margin-bottom:12px">
      Colonne presenti nel file Excel e relativo utilizzo nella dashboard.
      <span class="tag tag-green">Usato</span> = campo analizzato,
      <span class="tag tag-yellow">Parziale</span> = presente ma non nel dettaglio,
      <span class="tag tag-red">Non usato</span> = campo non ancora importato.
    </p>
    <div class="tbl-scroll"><table id="tblCampi"></table></div>
  </div>`;

  stackedBar('chFattS', D.trend.map(t => t.anno), [
    { label: 'Consulenza', data: D.trend.map(t => t.cons), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: D.trend.map(t => t.ente), backgroundColor: '#8b5cf6' }
  ]);

  simpleBar('chTicket', D.trend.map(t => t.anno), D.trend.map(t => t.ticket_medio), '#10b981');

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
  const agNames = Object.keys(D.ag_trend);
  const years = D.trend.map(t => t.anno);
  makeChart('chAgTrend', {
    type: 'line',
    data: {
      labels: years,
      datasets: agNames.map((ag, i) => ({
        label: ag, data: years.map(y => D.ag_trend[ag][y] || 0),
        borderColor: colors[i], tension: .3, borderWidth: 2
      }))
    },
    options: { responsive: true, scales: { y: { ticks: { callback: v => fmtE(v) } } },
      plugins: { legend: { position: 'bottom' } } }
  });

  buildTbl('tblCampi', ['#', 'Colonna Excel', 'Stato', 'Campo JSON', 'Utilizzo Dashboard'],
    EXCEL_FIELDS.map((f, i) => [
      { display: i + 1, val: i + 1 },
      { display: '<strong>' + f.excel + '</strong>', val: f.excel },
      { display: f.mapped ? (f.partial ? '<span class="tag tag-yellow">Parziale</span>'
        : '<span class="tag tag-green">Usato</span>')
        : '<span class="tag tag-red">Non usato</span>', val: f.mapped ? (f.partial ? 1 : 2) : 0 },
      { display: f.json || '-', val: f.json || '' },
      { display: f.use, val: f.use }
    ]),
    ['num', 'str', 'num', 'str', 'str']);
}

/* Excel fields mapping */
const EXCEL_FIELDS = [
  { excel: 'Tipo Commessa', json: 'ti', mapped: true, use: 'Tipo contratto nel dettaglio' },
  { excel: 'Contratto', json: 'ct', mapped: true, use: 'Filtro, tabelle, drill-down, cross-sell' },
  { excel: 'Cliente', json: 'cl', mapped: true, use: 'Drill-down, tabelle, KPI clienti' },
  { excel: 'Titolo', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Responsabile', json: 'rp', mapped: true, use: 'Filtro, performance, carico lavoro' },
  { excel: 'Citta', json: 'ci', mapped: true, use: 'Filtro, geografia, drill-down' },
  { excel: 'Stato Lavorazione', json: 'sl', mapped: true, use: 'Filtro, funnel, alert, crosstab' },
  { excel: 'Scopo proposto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Commerciale', json: 'ag', mapped: true, use: 'Filtro, performance, trend' },
  { excel: 'Data Assegnazione', json: 'an/me', mapped: true, partial: true, use: 'Solo anno+mese estratti' },
  { excel: 'Status', json: 'st', mapped: true, use: 'Filtro, KPI, crosstab, trend' },
  { excel: 'Ultima Nota', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'ID', json: 'id', mapped: true, use: 'Identificativo in tabelle' },
  { excel: 'ID Contratto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Contatto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Pian. Inizio', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Fine', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Verifica', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Descrizione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Indirizzo', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Ultima Nota (2)', json: '-', mapped: false, use: 'Non importato (duplicato)' },
  { excel: 'Data Ultima Nota', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Stato Pagamento', json: 'sp/sps', mapped: true, use: 'Filtro, tag, crosstab, alert' },
  { excel: 'Importo Ente', json: 'en', mapped: true, use: 'Fatturato ente, KPI, drill-down' },
  { excel: 'Ente di Riferimento', json: '-', mapped: true, partial: true, use: 'Solo aggregato in Pagamenti' },
  { excel: 'Segnalatore', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Note', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Importo Consulenza', json: 'co', mapped: true, use: 'Fatturato consulenza, KPI' },
  { excel: 'Avanzamento', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Accordo sui Pagamenti', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Insoluti', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Documenti Triennio', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Scopo in uscita', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Stato del Certificato', json: 'sc', mapped: true, use: 'Grafici certificati, aging' },
  { excel: 'Urgenza emissione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Urgenza Emissione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Settore', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Intervista in sede', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Ore Lavorazione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Inizio Lavorazione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Fine Lavorazione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Verifica Effettiva', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Ultimo Audit', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Prossima Consulenza', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Note (2)', json: '-', mapped: false, use: 'Non importato (duplicato)' },
  { excel: 'Data Ultima Chiamata', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Ultimo Richiamo', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Importo Consulenza (col 48)', json: 'co', mapped: true, partial: true, use: 'Usata col. 28 (€)' },
  { excel: 'Societa Aziendale', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Societa / Sedi', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Sede Operativa', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Funzione aziendale', json: '-', mapped: false, use: 'Non importato' },
];

function renderCommerciali() {
  const el = document.getElementById('sec-agenti');

  /* KPI calcolati dal dataset filtrato */
  const byAg = {};
  filtered.forEach(c => {
    if (!c.ag || c.ag === '(Non Assegnato)') return;
    if (!byAg[c.ag]) byAg[c.ag] = { n: 0, cli: new Set(), co: 0, en: 0, es: 0, an: 0 };
    byAg[c.ag].n++; byAg[c.ag].cli.add(c.cl);
    byAg[c.ag].co += c.co; byAg[c.ag].en += c.en;
    if (c.st === 'Eseguito') byAg[c.ag].es++;
    if (c.st === 'Annullato') byAg[c.ag].an++;
  });
  const agArr = Object.entries(byAg).sort((a, b) => (b[1].co + b[1].en) - (a[1].co + a[1].en));
  const topAg = agArr[0];
  const avgComm = agArr.length ? Math.round(agArr.reduce((s, a) => s + a[1].n, 0) / agArr.length) : 0;
  const avgFatt = agArr.length ? agArr.reduce((s, a) => s + a[1].co + a[1].en, 0) / agArr.length : 0;

  el.innerHTML = `
  <div class="kpi-grid" style="margin-bottom:16px">
    <div class="kpi-card c1"><div class="kpi-val">${agArr.length}</div><div class="kpi-lbl">Commerciali Attivi</div></div>
    <div class="kpi-card c3"><div class="kpi-val">${topAg ? topAg[0] : '-'}</div><div class="kpi-lbl">Top Commerciale</div><div class="kpi-sub">${topAg ? fmtE(topAg[1].co + topAg[1].en) : ''}</div></div>
    <div class="kpi-card c4"><div class="kpi-val">${fmt(avgComm)}</div><div class="kpi-lbl">Media Comm./Commerciale</div></div>
    <div class="kpi-card c2"><div class="kpi-val">${fmtE(avgFatt)}</div><div class="kpi-lbl">Media Fatt./Commerciale</div></div>
  </div>
  <div class="chart-box" style="margin-bottom:16px"><h3>Top 10 Commerciali - Fatturato</h3><canvas id="chAg"></canvas></div>
  <div class="sec"><div class="sec-title">Performance Commerciali <span class="badge">${D.agenti.length}</span></div>
    <div class="tbl-scroll"><table id="tblAg"></table></div></div>`;

  const t10 = D.agenti.slice(0, 10);
  stackedBar('chAg', t10.map(a => a.nome), [
    { label: 'Consulenza', data: t10.map(a => a.cons), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: t10.map(a => a.ente), backgroundColor: '#8b5cf6' }
  ], true);

  buildTbl('tblAg',
    ['Commerciale', 'Comm.', 'Clienti', 'Cons.', 'Ente', 'Totale', 'Eseg.', 'Ann.', 'Tasso', 'Ticket'],
    D.agenti.map(a => [
      { display: a.nome, val: a.nome, raw: a.nome },
      { display: fmt(a.commesse), val: a.commesse }, { display: fmt(a.clienti), val: a.clienti },
      { display: fmtE(a.cons), val: a.cons }, { display: fmtE(a.ente), val: a.ente },
      { display: fmtE(a.totale), val: a.totale }, { display: fmt(a.eseguiti), val: a.eseguiti },
      { display: fmt(a.annullati), val: a.annullati },
      { display: tagEsec(a.tasso_esec), val: a.tasso_esec },
      { display: fmtE(a.ticket_medio), val: a.ticket_medio }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'ag' });
}

function renderResponsabili() {
  const el = document.getElementById('sec-responsabili');

  /* KPI calcolati dal dataset filtrato */
  const byRp = {};
  filtered.forEach(c => {
    if (!c.rp || c.rp === '(Non Assegnato)') return;
    if (!byRp[c.rp]) byRp[c.rp] = { n: 0, cli: new Set(), co: 0, en: 0, es: 0 };
    byRp[c.rp].n++; byRp[c.rp].cli.add(c.cl);
    byRp[c.rp].co += c.co; byRp[c.rp].en += c.en;
    if (c.st === 'Eseguito') byRp[c.rp].es++;
  });
  const rpArr = Object.entries(byRp).sort((a, b) => b[1].n - a[1].n);
  const topRp = rpArr[0];
  const senzaResp = filtered.filter(c => !c.rp || c.rp === '(Non Assegnato)').length;
  const avgLoad = rpArr.length ? Math.round(rpArr.reduce((s, r) => s + r[1].n, 0) / rpArr.length) : 0;

  el.innerHTML = `
  <div class="kpi-grid" style="margin-bottom:16px">
    <div class="kpi-card c1"><div class="kpi-val">${rpArr.length}</div><div class="kpi-lbl">Responsabili Attivi</div></div>
    <div class="kpi-card c3"><div class="kpi-val">${topRp ? topRp[0] : '-'}</div><div class="kpi-lbl">Piu Commesse</div><div class="kpi-sub">${topRp ? fmt(topRp[1].n) + ' commesse' : ''}</div></div>
    <div class="kpi-card c4"><div class="kpi-val">${fmt(avgLoad)}</div><div class="kpi-lbl">Media Comm./Resp.</div></div>
    <div class="kpi-card c5 clickable" onclick="drillDownCustom('Senza Responsabile',c=>!c.rp||c.rp==='(Non Assegnato)')"><div class="kpi-val">${fmt(senzaResp)}</div><div class="kpi-lbl">Senza Responsabile</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
  </div>
  <div class="grid2" style="margin-bottom:16px">
    <div class="chart-box"><h3>Top 10 Responsabili - Commesse</h3><canvas id="chRp"></canvas></div>
    <div class="chart-box"><h3>Top 10 Responsabili - Fatturato</h3><canvas id="chRpF"></canvas></div>
  </div>
  <div class="sec"><div class="sec-title">Performance Responsabili <span class="badge">${D.responsabili.length}</span></div>
    <div class="tbl-scroll"><table id="tblResp"></table></div></div>`;

  const t10n = rpArr.slice(0, 10);
  simpleBar('chRp', t10n.map(r => r[0]), t10n.map(r => r[1].n));
  const t10f = [...rpArr].sort((a, b) => (b[1].co + b[1].en) - (a[1].co + a[1].en)).slice(0, 10);
  stackedBar('chRpF', t10f.map(r => r[0]), [
    { label: 'Cons.', data: t10f.map(r => r[1].co), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: t10f.map(r => r[1].en), backgroundColor: '#8b5cf6' }
  ]);

  buildTbl('tblResp',
    ['Responsabile', 'Comm.', 'Clienti', 'Cons.', 'Ente', 'Totale', 'Eseg.', 'Ann.', 'Tasso', 'Ticket'],
    D.responsabili.map(r => [
      { display: r.nome, val: r.nome, raw: r.nome },
      { display: fmt(r.commesse), val: r.commesse }, { display: fmt(r.clienti), val: r.clienti },
      { display: fmtE(r.cons), val: r.cons }, { display: fmtE(r.ente), val: r.ente },
      { display: fmtE(r.totale), val: r.totale }, { display: fmt(r.eseguiti), val: r.eseguiti },
      { display: fmt(r.annullati), val: r.annullati },
      { display: tagEsec(r.tasso_esec), val: r.tasso_esec },
      { display: fmtE(r.ticket_medio), val: r.ticket_medio }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'rp' });
}
