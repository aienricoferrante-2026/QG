/* Sections: Cross-Sell, Retention, Aging, Focus 2026, Alert */

function renderCrossSell() {
  const cs = D.cross_sell_stats;
  const el = document.getElementById('sec-crosssell');
  el.innerHTML = `
  <div class="kpi-grid" style="margin-bottom:16px">
    <div class="kpi-card c1 clickable" onclick="drillDownCrossSell('single')"><div class="kpi-val">${fmt(cs.single)}</div><div class="kpi-lbl">Clienti mono-norma</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
    <div class="kpi-card c3 clickable" onclick="drillDownCrossSell('multi')"><div class="kpi-val">${fmt(cs.multi)}</div><div class="kpi-lbl">Clienti multi-norma</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
    <div class="kpi-card c4"><div class="kpi-val">${fmtP(cs.multi / cs.total * 100)}</div><div class="kpi-lbl">% Multi-norma</div></div>
  </div>
  <div class="chart-box" style="margin-bottom:16px"><h3>Norme per Cliente</h3><canvas id="chCS"></canvas></div>
  <div class="sec"><div class="sec-title">Top Clienti Multi-Norma <span class="badge">${D.cross_sell.length}</span></div>
    <div class="tbl-scroll"><table id="tblCS"></table></div></div>`;

  const dist = {}; D.commesse.forEach(c => { if (!dist[c.cl]) dist[c.cl] = new Set(); dist[c.cl].add(c.ct); });
  const nDist = { 1: 0, 2: 0, 3: 0, '4+': 0 };
  Object.values(dist).forEach(s => { const n = s.size; if (n === 1) nDist[1]++; else if (n === 2) nDist[2]++; else if (n === 3) nDist[3]++; else nDist['4+']++; });
  simpleBar('chCS', Object.keys(nDist).map(k => k + ' norm' + (k === '1' ? 'a' : 'e')),
    Object.values(nDist), ['#64748b', '#3b82f6', '#8b5cf6', '#10b981']);

  buildTbl('tblCS', ['Cliente', 'Norme', 'Comm.', 'Tipo Norme', 'Cons.', 'Ente'],
    D.cross_sell.map(c => [
      { display: c.cliente, val: c.cliente, raw: c.cliente },
      { display: c.n_norme, val: c.n_norme }, { display: fmt(c.commesse), val: c.commesse },
      c.norme.map(n => n.replace('ISO_', '')).join(', '),
      { display: fmtE(c.cons), val: c.cons }, { display: fmtE(c.ente), val: c.ente }
    ]),
    ['str', 'num', 'num', 'str', 'num', 'num'], { clickField: 'cl' });
}

/* Cross-sell drill-down: mono vs multi norma clients */
function drillDownCrossSell(type) {
  const dist = {};
  filtered.forEach(c => { if (!dist[c.cl]) dist[c.cl] = new Set(); dist[c.cl].add(c.ct); });
  const clients = type === 'single'
    ? Object.entries(dist).filter(([, s]) => s.size === 1).map(([cl]) => cl)
    : Object.entries(dist).filter(([, s]) => s.size > 1).map(([cl]) => cl);
  const clientSet = new Set(clients);
  const title = type === 'single' ? 'Clienti Mono-Norma' : 'Clienti Multi-Norma';
  drillDownItems(title, filtered.filter(c => clientSet.has(c.cl)));
}

function renderRetention() {
  const ret = D.retention;
  const el = document.getElementById('sec-retention');
  const fidelizzati = ret['3_anni'] + ret['4_anni'] + ret['5_anni'];
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Clienti per Anni di Presenza</h3><canvas id="chRet"></canvas></div>
    <div class="sec" style="display:flex;flex-direction:column;justify-content:center">
      <div class="kpi-grid" style="grid-template-columns:1fr 1fr">
        <div class="kpi-card c5 clickable" onclick="drillDownRetention(1)"><div class="kpi-val">${fmt(ret['1_anno'])}</div><div class="kpi-lbl">Solo 1 anno</div><div class="kpi-sub">Click &#8594; Rischio churn</div></div>
        <div class="kpi-card c3 clickable" onclick="drillDownRetention(3)"><div class="kpi-val">${fmt(fidelizzati)}</div><div class="kpi-lbl">3+ anni</div><div class="kpi-sub">Click &#8594; Fidelizzati</div></div>
      </div>
      <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-top:8px">
        <div class="kpi-card clickable" onclick="drillDownRetention(2)" style="padding:8px"><div class="kpi-val" style="font-size:18px">${fmt(ret['2_anni'])}</div><div class="kpi-lbl">2 anni</div></div>
        <div class="kpi-card clickable" onclick="drillDownRetention(4)" style="padding:8px"><div class="kpi-val" style="font-size:18px">${fmt(ret['4_anni'])}</div><div class="kpi-lbl">4 anni</div></div>
        <div class="kpi-card clickable" onclick="drillDownRetention(5)" style="padding:8px"><div class="kpi-val" style="font-size:18px">${fmt(ret['5_anni'])}</div><div class="kpi-lbl">5 anni</div></div>
      </div>
    </div>
  </div>
  <div class="sec"><div class="sec-title">Top Clienti Ricorrenti</div>
    <div class="tbl-scroll"><table id="tblRet"></table></div></div>`;

  simpleBar('chRet', ['1 anno', '2 anni', '3 anni', '4 anni', '5 anni'],
    [ret['1_anno'], ret['2_anni'], ret['3_anni'], ret['4_anni'], ret['5_anni']],
    ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#22c55e']);

  buildTbl('tblRet', ['Cliente', 'Anni', 'Comm.', 'Cons.', 'Ente', 'Totale'],
    D.top_returning.map(r => [
      { display: r.cliente, val: r.cliente, raw: r.cliente },
      { display: r.anni, val: r.anni }, { display: fmt(r.commesse), val: r.commesse },
      { display: fmtE(r.cons), val: r.cons }, { display: fmtE(r.ente), val: r.ente },
      { display: fmtE(r.cons + r.ente), val: r.cons + r.ente }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'], { clickField: 'cl' });
}

/* Retention drill-down by years of presence */
function drillDownRetention(minYears) {
  const yearsByClient = {};
  filtered.forEach(c => {
    if (!yearsByClient[c.cl]) yearsByClient[c.cl] = new Set();
    if (c.an > 0) yearsByClient[c.cl].add(c.an);
  });
  let clients;
  if (minYears === 1) {
    clients = Object.entries(yearsByClient).filter(([, s]) => s.size === 1).map(([cl]) => cl);
  } else if (minYears === 3) {
    clients = Object.entries(yearsByClient).filter(([, s]) => s.size >= 3).map(([cl]) => cl);
  } else {
    clients = Object.entries(yearsByClient).filter(([, s]) => s.size === minYears).map(([cl]) => cl);
  }
  const clientSet = new Set(clients);
  const label = minYears === 1 ? 'Clienti 1 solo anno' : minYears === 3 ? 'Clienti 3+ anni' : 'Clienti ' + minYears + ' anni';
  drillDownItems(label, filtered.filter(c => clientSet.has(c.cl)));
}

function renderAging() {
  const ag = D.aging;
  const total = Object.values(ag).reduce((s, v) => s + v, 0);
  const el = document.getElementById('sec-aging');
  el.innerHTML = `
  <div class="grid2">
    <div class="chart-box"><h3>Aging Commesse Aperte (${fmt(total)} totali)</h3><canvas id="chAging"></canvas></div>
    <div class="sec" style="display:flex;flex-direction:column;justify-content:center">
      <div class="kpi-grid" style="grid-template-columns:1fr 1fr">
        <div class="kpi-card c5"><div class="kpi-val">${fmt(ag.oltre_1anno)}</div><div class="kpi-lbl">Oltre 1 anno</div><div class="kpi-sub">Criticita alta</div></div>
        <div class="kpi-card c4"><div class="kpi-val">${fmt(ag['181-365gg'])}</div><div class="kpi-lbl">6-12 mesi</div></div>
        <div class="kpi-card c1"><div class="kpi-val">${fmt(ag['91-180gg'])}</div><div class="kpi-lbl">3-6 mesi</div></div>
        <div class="kpi-card c3"><div class="kpi-val">${fmt(ag['0-30gg'] + ag['31-90gg'])}</div><div class="kpi-lbl">&lt; 3 mesi</div></div>
      </div>
    </div>
  </div>
  <div class="sec"><div class="sec-title">Scadenzario Certificati 2026</div>
    <div class="tbl-scroll"><table id="tblScad"></table></div></div>`;

  donutChart('chAging', ['0-30gg', '31-90gg', '91-180gg', '181-365gg', 'Oltre 1 anno'],
    [ag['0-30gg'], ag['31-90gg'], ag['91-180gg'], ag['181-365gg'], ag.oltre_1anno],
    ['#22c55e', '#10b981', '#3b82f6', '#f59e0b', '#ef4444']);

  buildTbl('tblScad', ['Tipo Certificato', 'Pianificate'],
    Object.entries(D.scadenzario).sort((a, b) => b[1] - a[1]).map(([k, v]) => [
      k, { display: fmt(v), val: v }
    ]), ['str', 'num']);
}

function renderFocus2026() {
  const f = D.focus_2026;
  const el = document.getElementById('sec-focus2026');
  el.innerHTML = `
  <div class="kpi-grid">
    <div class="kpi-card c1 clickable" onclick="drillDownCustom('Commesse 2026',c=>c.an===2026)"><div class="kpi-val">${fmt(f.commesse)}</div><div class="kpi-lbl">Commesse Q1</div><div class="kpi-sub">Click per dettaglio &#8594;</div></div>
    <div class="kpi-card c2"><div class="kpi-val">${fmt(f.clienti)}</div><div class="kpi-lbl">Clienti Q1</div></div>
    <div class="kpi-card c3"><div class="kpi-val">${fmtE(f.totale)}</div><div class="kpi-lbl">Fatt. Q1</div></div>
    <div class="kpi-card c4" style="background:linear-gradient(135deg,var(--card),rgba(245,158,11,.08))">
      <div class="kpi-val">${fmtE(f.proiezione_totale)}</div><div class="kpi-lbl">Proiezione Annua</div><div class="kpi-sub">+78% vs 2025</div></div>
  </div>
  <div class="grid2">
    <div class="chart-box"><h3>Mensile 2026</h3><canvas id="chM26"></canvas></div>
    <div class="chart-box"><h3>Q1 Year-over-Year</h3><canvas id="chYoY"></canvas></div>
  </div>
  <div class="sec"><div class="sec-title">Statistiche Dettagliate 2026</div>
    <div class="tbl-scroll"><table id="tbl2026"></table></div></div>`;

  stackedBar('chM26', D.mesi_2026.map(m => m.mese), [
    { label: 'Consulenza', data: D.mesi_2026.map(m => m.cons), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: D.mesi_2026.map(m => m.ente), backgroundColor: '#8b5cf6' }
  ]);
  stackedBar('chYoY', D.yoy_q1.map(y => y.anno), [
    { label: 'Consulenza', data: D.yoy_q1.map(y => y.cons), backgroundColor: '#3b82f6' },
    { label: 'Ente', data: D.yoy_q1.map(y => y.ente), backgroundColor: '#8b5cf6' }
  ]);

  /* Tabella mensile 2026 cliccabile */
  buildTbl('tbl2026', ['Mese', 'Commesse', 'Consulenza', 'Ente', 'Totale'],
    D.mesi_2026.map(m => {
      const tot = m.cons + m.ente;
      return [
        { display: m.mese, val: m.mese, raw: m.mese },
        { display: fmt(m.commesse || 0), val: m.commesse || 0 },
        { display: fmtE(m.cons), val: m.cons },
        { display: fmtE(m.ente), val: m.ente },
        { display: fmtE(tot), val: tot }
      ];
    }), ['str', 'num', 'num', 'num', 'num']);
}

function renderAlert() {
  const al = D.alert;
  const el = document.getElementById('sec-alert');

  /* Statistiche aggiuntive calcolate live */
  const noAgent = filtered.filter(c => !c.ag || c.ag === '(Non Assegnato)').length;
  const annullate = filtered.filter(c => c.st === 'Annullato').length;
  const annPct = filtered.length ? (annullate / filtered.length * 100) : 0;
  const daPianif = filtered.filter(c => c.st === 'Da pianificare').length;

  el.innerHTML = `
  <div class="sec-title" style="margin-bottom:12px;color:var(--danger)">Alert Critici — Click per vedere le commesse</div>
  <div class="alert-grid">
    <div class="alert-card danger clickable" onclick="alertDrill('penali')"><div class="alert-val">${fmt(al.penali)}</div><div class="alert-lbl">Penali</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card danger clickable" onclick="alertDrill('sospese')"><div class="alert-val">${fmt(al.sospese)}</div><div class="alert-lbl">Sospese/Bloccate</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card warning clickable" onclick="alertDrill('senza_resp')"><div class="alert-val">${fmt(al.senza_responsabile)}</div><div class="alert-lbl">Senza Resp. (${fmtP(al.senza_resp_pct)})</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card warning clickable" onclick="alertDrill('giallo')"><div class="alert-val">${fmt(al.giallo)}</div><div class="alert-lbl">Attesa Lavorazione</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card danger clickable" onclick="alertDrill('insoluto_prec')"><div class="alert-val">${fmt(al.insoluto_prec)}</div><div class="alert-lbl">Insoluto Anno Prec.</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card info clickable" onclick="alertDrill('insoluti')"><div class="alert-val">${fmt(al.insoluti)}</div><div class="alert-lbl">Insoluti Attivi</div><div class="alert-hint">&#8594; dettaglio</div></div>
  </div>
  <div class="sec-title" style="margin:20px 0 12px;color:var(--warning)">Statistiche Aggiuntive</div>
  <div class="alert-grid">
    <div class="alert-card warning clickable" onclick="alertDrill('no_agent')"><div class="alert-val">${fmt(noAgent)}</div><div class="alert-lbl">Senza Commerciale</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card danger clickable" onclick="alertDrill('annullate')"><div class="alert-val">${fmt(annullate)}</div><div class="alert-lbl">Annullate (${fmtP(annPct)})</div><div class="alert-hint">&#8594; dettaglio</div></div>
    <div class="alert-card info clickable" onclick="alertDrill('da_pianif')"><div class="alert-val">${fmt(daPianif)}</div><div class="alert-lbl">Da Pianificare</div><div class="alert-hint">&#8594; dettaglio</div></div>
  </div>
  <div class="sec" style="margin-top:20px">
    <div class="sec-title" style="color:var(--danger)">Riepilogo Azioni Prioritarie</div>
    <div class="tbl-scroll"><table id="tblAlert"></table></div>
  </div>`;

  /* Tabella riepilogo alert con drill-down */
  const alertRows = [
    ['Penali', al.penali, 'penali'],
    ['Sospese/Bloccate', al.sospese, 'sospese'],
    ['Senza Responsabile', al.senza_responsabile, 'senza_resp'],
    ['Attesa Lavorazione', al.giallo, 'giallo'],
    ['Insoluto Anno Prec.', al.insoluto_prec, 'insoluto_prec'],
    ['Insoluti Attivi', al.insoluti, 'insoluti'],
    ['Senza Commerciale', noAgent, 'no_agent'],
    ['Annullate', annullate, 'annullate'],
    ['Da Pianificare', daPianif, 'da_pianif'],
  ].sort((a, b) => b[1] - a[1]);

  buildTbl('tblAlert', ['Tipo Alert', 'Commesse', 'Azione'],
    alertRows.map(([nome, cnt, key]) => [
      { display: nome, val: nome, raw: key },
      { display: fmt(cnt), val: cnt },
      { display: '<span class="tag tag-blue clickable" onclick="alertDrill(\'' + key + '\')">Vedi dettaglio &#8594;</span>', val: 0 }
    ]), ['str', 'num', 'str']);
}

/* Alert drill-down dispatcher */
function alertDrill(type) {
  const filters = {
    penali:       { title: 'Commesse con Penali', fn: c => c.sl && c.sl.includes('PENALI') },
    sospese:      { title: 'Sospese / Bloccate', fn: c => c.sl && (c.sl.includes('SOSPESO') || c.sl.includes('BLOCCATO')) },
    senza_resp:   { title: 'Senza Responsabile', fn: c => !c.rp || c.rp === '(Non Assegnato)' },
    giallo:       { title: 'Attesa Lavorazione', fn: c => c.sp === 'Giallo ( Iniziare la lavorazione )' },
    insoluto_prec:{ title: 'Insoluto Anno Precedente', fn: c => c.sps === 'Insoluto Prec.' },
    insoluti:     { title: 'Insoluti Attivi', fn: c => c.sl === 'X _ BLOCCATO _ INSOLUTO' },
    no_agent:     { title: 'Senza Commerciale', fn: c => !c.ag || c.ag === '(Non Assegnato)' },
    annullate:    { title: 'Commesse Annullate', fn: c => c.st === 'Annullato' },
    da_pianif:    { title: 'Da Pianificare', fn: c => c.st === 'Da pianificare' },
  };
  const f = filters[type];
  if (f) drillDownCustom(f.title, f.fn);
}
