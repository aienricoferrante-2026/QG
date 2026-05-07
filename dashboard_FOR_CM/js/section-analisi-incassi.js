/* ── Sezione: Analisi Incassi ── */

function renderAnalisiIncassi() {
  const el = document.getElementById('sec-analisiIncassi');
  if (!el) return;
  const f = filtered;

  // ── Aggregati base ──
  const totRicavi = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const totIncassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const totDaIncassare = f.reduce((s, c) => s + (c.daIncassare || 0), 0);
  const totAnticipi = f.reduce((s, c) => s + (c.anticipoImporto || 0), 0);
  const totResiduo = totRicavi - totIncassato;
  const pctIncassoMedio = totRicavi ? (totIncassato / totRicavi * 100) : 0;

  // ── Bucket per ogni commessa ──
  // pct = giaIncassato / consulenza, escluse commesse senza ricavi
  function bucket(c) {
    if (!c.consulenza || c.consulenza <= 0) return null;
    const p = (c.giaIncassato || 0) / c.consulenza * 100;
    if (p <= 0) return '0%';
    if (p < 25) return '1-25%';
    if (p < 50) return '25-50%';
    if (p < 75) return '50-75%';
    if (p < 100) return '75-99%';
    return '100%';
  }
  const bins = { '0%': 0, '1-25%': 0, '25-50%': 0, '50-75%': 0, '75-99%': 0, '100%': 0 };
  let cmAttive = 0; // commesse con consulenza > 0
  f.forEach(c => {
    const b = bucket(c);
    if (b !== null) { bins[b]++; cmAttive++; }
  });
  const cm100 = bins['100%'];
  const cm0 = bins['0%'];

  // ── Pie "Stato pagamento" 4 fette ──
  const pie = {
    'Non incassate (0%)': bins['0%'],
    'Parziali basse (1-50%)': bins['1-25%'] + bins['25-50%'],
    'Parziali alte (50-99%)': bins['50-75%'] + bins['75-99%'],
    'Saldate (100%)': bins['100%']
  };

  // ── Render HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Analisi Incassi & Crediti</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Monitoraggio incassi, residuo da incassare, distribuzione delle commesse per stato di pagamento.</p>';

  // KPI grid
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green"><div class="kpi-label">% Incasso medio</div><div class="kpi-value">' + pctIncassoMedio.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(totIncassato) + ' / ' + fmtK(totRicavi) + '</div></div>';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse al 100%</div><div class="kpi-value">' + fmt(cm100) + '</div><div class="kpi-sub">' + (cmAttive ? (cm100 / cmAttive * 100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Commesse a 0%</div><div class="kpi-value">' + fmt(cm0) + '</div><div class="kpi-sub">' + (cmAttive ? (cm0 / cmAttive * 100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Esposizione (Residuo)</div><div class="kpi-value">' + fmtK(totResiduo) + '</div><div class="kpi-sub">credito aperto totale</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Anticipi Ricevuti</div><div class="kpi-value">' + fmtK(totAnticipi) + '</div><div class="kpi-sub">' + pct(totAnticipi, totRicavi) + ' dei ricavi</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Da Incassare</div><div class="kpi-value">' + fmtK(totDaIncassare) + '</div><div class="kpi-sub">' + pct(totDaIncassare, totRicavi) + ' dei ricavi</div></div>';
  h += '</div>';

  // Charts row
  h += '<div class="row2">';
  h += '<div class="card"><h4>Stato pagamento (n. commesse)</h4><div class="chart-wrap"><canvas id="chPagPie"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione % incasso (n. commesse)</h4><div class="chart-wrap"><canvas id="chPagBins"></canvas></div></div>';
  h += '</div>';

  // Top 20 commesse per credito aperto
  h += '<div class="card" style="margin-top:14px"><h4>Top 20 commesse per credito aperto</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Commesse con il maggior residuo (Ricavi − Già Incassato).</p>';
  h += '<div class="tbl-scroll"><table id="tblIncTopCm"></table></div></div>';

  // Tabella per Sede
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Incassi per Sede</h4>';
  h += '<div class="tbl-scroll"><table id="tblIncSede"></table></div></div>';

  // Tabella per Cliente / Ente
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Incassi per Cliente / Ente</h4>';
  h += '<div class="tbl-scroll"><table id="tblIncCli"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  makeDonut('chPagPie',
    Object.keys(pie),
    Object.values(pie),
    ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']
  );

  makeBar('chPagBins',
    Object.keys(bins),
    Object.values(bins),
    '#6366f1', false
  );

  // ── Top 20 commesse per credito aperto ──
  const cmRanked = f
    .map(c => ({
      ...c,
      _credito: (c.consulenza || 0) - (c.giaIncassato || 0),
      _pct: c.consulenza ? ((c.giaIncassato || 0) / c.consulenza * 100) : 0
    }))
    .filter(c => c._credito > 0 && c.consulenza > 0)
    .sort((a, b) => b._credito - a._credito)
    .slice(0, 20);
  buildTbl('tblIncTopCm',
    ['ID', 'Titolo / Corso', 'Cliente', 'Sede', 'Ricavi', 'Incassato', 'Credito', '% Inc.', 'Qnet'],
    cmRanked.map(c => [
      c.id,
      { display: ((c.titolo || c.corso) || '').substring(0, 50), val: (c.titolo || c.corso) },
      { display: (c.cliente || '').replace(/_FOR/g, '').substring(0, 30), val: c.cliente },
      { display: (c.sedeNorm || c.sedeOp || '').split(' - ')[0], val: c.sedeNorm },
      { display: fmtE(c.consulenza), val: c.consulenza },
      { display: fmtE(c.giaIncassato || 0), val: c.giaIncassato || 0 },
      { display: fmtE(c._credito), val: c._credito },
      { display: c._pct.toFixed(1) + '%', val: c._pct },
      qnetBtn(c)
    ]),
    ['num', 'str', 'str', 'str', 'num', 'num', 'num', 'num', 'str']
  );

  // ── Aggregato per Sede ──
  const sedeG = {};
  f.forEach(c => {
    const k = c.sedeNorm || c.sedeOp || 'N/D';
    if (!sedeG[k]) sedeG[k] = { cnt: 0, ric: 0, inc: 0, dInc: 0, ant: 0 };
    sedeG[k].cnt++;
    sedeG[k].ric += (c.consulenza || 0);
    sedeG[k].inc += (c.giaIncassato || 0);
    sedeG[k].dInc += (c.daIncassare || 0);
    sedeG[k].ant += (c.anticipoImporto || 0);
  });
  const sediSorted = Object.entries(sedeG)
    .map(([k, v]) => ({ k, ...v, residuo: v.ric - v.inc, pctInc: v.ric ? v.inc / v.ric * 100 : 0 }))
    .sort((a, b) => b.residuo - a.residuo);
  buildTbl('tblIncSede',
    ['Sede', 'Comm.', 'Ricavi', 'Incassato', 'Residuo', '% Inc.', 'Anticipi', 'Da Inc.'],
    sediSorted.map(v => [
      { display: v.k.length > 50 ? v.k.substring(0, 48) + '..' : v.k, val: v.k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.inc), val: v.inc },
      { display: fmtE(v.residuo), val: v.residuo },
      { display: v.pctInc.toFixed(1) + '%', val: v.pctInc },
      { display: fmtE(v.ant), val: v.ant },
      { display: fmtE(v.dInc), val: v.dInc }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'sedeNorm' }
  );

  // ── Aggregato per Cliente / Ente ──
  const cliG = {};
  f.forEach(c => {
    const k = (c.cliente || 'N/D').replace(/_FOR/g, '').trim();
    if (!cliG[k]) cliG[k] = { cnt: 0, ric: 0, inc: 0, dInc: 0, ant: 0 };
    cliG[k].cnt++;
    cliG[k].ric += (c.consulenza || 0);
    cliG[k].inc += (c.giaIncassato || 0);
    cliG[k].dInc += (c.daIncassare || 0);
    cliG[k].ant += (c.anticipoImporto || 0);
  });
  const cliSorted = Object.entries(cliG)
    .map(([k, v]) => ({ k, ...v, residuo: v.ric - v.inc, pctInc: v.ric ? v.inc / v.ric * 100 : 0 }))
    .sort((a, b) => b.residuo - a.residuo);
  buildTbl('tblIncCli',
    ['Cliente / Ente', 'Comm.', 'Ricavi', 'Incassato', 'Residuo', '% Inc.', 'Anticipi', 'Da Inc.'],
    cliSorted.map(v => [
      { display: v.k.length > 45 ? v.k.substring(0, 43) + '..' : v.k, val: v.k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.inc), val: v.inc },
      { display: fmtE(v.residuo), val: v.residuo },
      { display: v.pctInc.toFixed(1) + '%', val: v.pctInc },
      { display: fmtE(v.ant), val: v.ant },
      { display: fmtE(v.dInc), val: v.dInc }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}
