/* ── Sezione: Analisi Incassi (core) ── */

function renderAnalisiIncassi() {
  const el = document.getElementById('sec-analisiIncassi');
  if (!el) return;
  const f = filtered;

  const totRicavi = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const totIncassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const totResiduo = f.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
  const pctIncassoMedio = totRicavi ? (totIncassato / totRicavi * 100) : 0;
  const pctResiduo = totRicavi ? (totResiduo / totRicavi * 100) : 0;
  const cmConRicavi = f.filter(c => (c.consulenza || 0) > 0).length;
  const residuoMedio = cmConRicavi ? (totResiduo / cmConRicavi) : 0;

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
  let cmAttive = 0;
  f.forEach(c => { const b = bucket(c); if (b !== null) { bins[b]++; cmAttive++; } });
  const cm100 = bins['100%'];
  const cm0 = bins['0%'];
  const pie = {
    'Non incassate (0%)': bins['0%'],
    'Parziali basse (1-50%)': bins['1-25%'] + bins['25-50%'],
    'Parziali alte (50-99%)': bins['50-75%'] + bins['75-99%'],
    'Saldate (100%)': bins['100%']
  };

  let h = '<div class="sec"><h3 class="sec-title">Analisi Incassi & Crediti</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Monitoraggio incassi (= Fin. Incassi Tot. da Qnet), residuo da incassare, distribuzione delle commesse per stato di pagamento.</p>';

  /* Predicati per i KPI cliccabili: ogni KPI ha un sottoinsieme di commesse
     identificabile → click apre il modale drill-down con quelle commesse. */
  const pInc100 = "c => (c.consulenza||0)>0 && (c.giaIncassato||0) >= (c.consulenza||0)";
  const pInc0   = "c => (c.consulenza||0)>0 && (c.giaIncassato||0) === 0";
  const pDaInc  = "c => (c.consulenza||0)>0 && (c.giaIncassato||0) < (c.consulenza||0)";
  const clk = (title, pred) => 'onclick="drillFiltered(\'' + title.replace(/'/g, "\\'") + "', " + pred + ')" style="cursor:pointer" title="Clicca per vedere le commesse"';

  const ii = (typeof kpiInfoBtn === 'function') ? kpiInfoBtn : (() => '');
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green"><div class="kpi-label">% Incasso medio ' + ii('pctInc') + '</div><div class="kpi-value">' + pctIncassoMedio.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(totIncassato) + ' / ' + fmtK(totRicavi) + '</div></div>';
  h += '<div class="kpi blue" ' + clk('Commesse saldate (100%)', pInc100) + '><div class="kpi-label">Commesse al 100% › ' + ii('inc100') + '</div><div class="kpi-value">' + fmt(cm100) + '</div><div class="kpi-sub">' + (cmAttive ? (cm100 / cmAttive * 100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi orange" ' + clk('Commesse senza incasso (0%)', pInc0) + '><div class="kpi-label">Commesse a 0% › ' + ii('noInc') + '</div><div class="kpi-value">' + fmt(cm0) + '</div><div class="kpi-sub">' + (cmAttive ? (cm0 / cmAttive * 100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi pink" ' + clk('Da Incassare (commesse con residuo)', pDaInc) + '><div class="kpi-label">Da Incassare › ' + ii('daIncassare') + '</div><div class="kpi-value">' + fmtK(totResiduo) + '</div><div class="kpi-sub">' + pctResiduo.toFixed(1) + '% · Ricavi − Incassato</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Residuo medio ' + ii('daIncassare') + '</div><div class="kpi-value">' + fmtK(residuoMedio) + '</div><div class="kpi-sub">su ' + fmt(cmConRicavi) + ' comm. con ricavi</div></div>';
  h += '</div>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Stato pagamento (n. commesse)</h4><div class="chart-wrap"><canvas id="chPagPie"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione % incasso</h4><div class="chart-wrap"><canvas id="chPagBins"></canvas></div></div>';
  h += '</div>';

  h += '<div class="card" style="margin-top:14px"><h4>Top 20 commesse per credito aperto</h4>';
  h += '<div class="tbl-scroll"><table id="tblIncTopCm"></table></div></div>';

  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Incassi per Sede</h4>';
  h += '<div class="tbl-scroll"><table id="tblIncSede"></table></div></div>';

  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Incassi per Cliente</h4>';
  h += '<div class="tbl-scroll"><table id="tblIncCli"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeDonut('chPagPie', Object.keys(pie), Object.values(pie),
    ['#ef4444', '#f59e0b', '#3b82f6', '#10b981']);
  makeBar('chPagBins', Object.keys(bins), Object.values(bins), '#6366f1', false);

  const cmRanked = f
    .map(c => ({
      ...c,
      _credito: (c.consulenza || 0) - (c.giaIncassato || 0),
      _pct: c.consulenza ? ((c.giaIncassato || 0) / c.consulenza * 100) : 0
    }))
    .filter(c => c._credito > 0 && (c.consulenza || 0) > 0)
    .sort((a, b) => b._credito - a._credito)
    .slice(0, 20);
  buildTbl('tblIncTopCm',
    ['ID', 'Titolo', 'Cliente', 'Sede', 'Ricavi', 'Incassato', 'Credito', '% Inc.', 'Qnet'],
    cmRanked.map(c => [
      c.id || '',
      { display: ((c.titolo || c.contratto || '') + '').substring(0, 50), val: c.titolo },
      { display: (c.cliente || '').substring(0, 30), val: c.cliente },
      { display: (c.sedeNorm || c.sedeOp || '').split(' - ')[0], val: c.sedeNorm },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      { display: fmtE(c.giaIncassato || 0), val: c.giaIncassato || 0 },
      { display: fmtE(c._credito), val: c._credito },
      { display: c._pct.toFixed(1) + '%', val: c._pct },
      qnetBtn(c)
    ]),
    ['num', 'str', 'str', 'str', 'num', 'num', 'num', 'num', 'str']
  );

  const sedeG = {};
  f.forEach(c => {
    const k = c.sedeNorm || c.sedeOp || 'N/D';
    if (!sedeG[k]) sedeG[k] = { cnt: 0, ric: 0, inc: 0, res: 0 };
    sedeG[k].cnt++;
    sedeG[k].ric += (c.consulenza || 0);
    sedeG[k].inc += (c.giaIncassato || 0);
    sedeG[k].res += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
  });
  const sediSorted = Object.entries(sedeG)
    .map(([k, v]) => ({
      k, ...v,
      pctInc: v.ric ? v.inc / v.ric * 100 : 0,
      pctRes: v.ric ? v.res / v.ric * 100 : 0
    }))
    .sort((a, b) => b.res - a.res);
  buildTbl('tblIncSede',
    ['Sede', 'Comm.', 'Ricavi', 'Incassato', '% Inc.', 'Residuo', '% Res.'],
    sediSorted.map(v => [
      { display: v.k.length > 50 ? v.k.substring(0, 48) + '..' : v.k, val: v.k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.inc), val: v.inc },
      { display: v.pctInc.toFixed(1) + '%', val: v.pctInc },
      { display: fmtE(v.res), val: v.res },
      { display: v.pctRes.toFixed(1) + '%', val: v.pctRes }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'sedeNorm' }
  );

  const cliG = {};
  f.forEach(c => {
    const k = c.cliente || 'N/D';
    if (!cliG[k]) cliG[k] = { cnt: 0, ric: 0, inc: 0, res: 0 };
    cliG[k].cnt++;
    cliG[k].ric += (c.consulenza || 0);
    cliG[k].inc += (c.giaIncassato || 0);
    cliG[k].res += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
  });
  const cliSorted = Object.entries(cliG)
    .map(([k, v]) => ({
      k, ...v,
      pctInc: v.ric ? v.inc / v.ric * 100 : 0,
      pctRes: v.ric ? v.res / v.ric * 100 : 0
    }))
    .sort((a, b) => b.res - a.res);
  buildTbl('tblIncCli',
    ['Cliente', 'Comm.', 'Ricavi', 'Incassato', '% Inc.', 'Residuo', '% Res.'],
    cliSorted.map(v => [
      { display: v.k.length > 45 ? v.k.substring(0, 43) + '..' : v.k, val: v.k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.inc), val: v.inc },
      { display: v.pctInc.toFixed(1) + '%', val: v.pctInc },
      { display: fmtE(v.res), val: v.res },
      { display: v.pctRes.toFixed(1) + '%', val: v.pctRes }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}
