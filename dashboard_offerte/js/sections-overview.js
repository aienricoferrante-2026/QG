/* ── Executive Summary & Pipeline ── */

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  const f = filtered;
  const cnt = f.length;
  const tot = f.reduce((s, c) => s + c.totale, 0);
  const contr = f.filter(c => c.status === 'Offerta Contrattualizzata');
  const contrVal = contr.reduce((s, c) => s + c.totale, 0);
  const rif = f.filter(c => c.status === 'Offerta Rifiutata');
  const rifVal = rif.reduce((s, c) => s + c.totale, 0);

  // Status distribution
  const statusG = {};
  f.forEach(c => { const k = c.status || 'N/D'; statusG[k] = (statusG[k] || 0) + 1; });

  // Categoria distribution
  const catG = {};
  f.forEach(c => { const k = c.categoria || 'N/D'; catG[k] = (catG[k] || 0) + c.totale; });

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary</h3>';

  // KPIs
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Valore Totale</h4><div style="font-size:28px;font-weight:700">' + fmtK(tot) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmtE(tot) + '</div></div>';
  h += '<div class="card"><h4>Contrattualizzato</h4><div style="font-size:28px;font-weight:700;color:var(--green)">' + fmtK(contrVal) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">Tasso: ' + pct(contr.length, cnt) + ' (' + fmt(contr.length) + ' offerte)</div></div>';
  h += '<div class="card"><h4>Rifiutato</h4><div style="font-size:28px;font-weight:700;color:var(--orange)">' + fmtK(rifVal) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + pct(rif.length, cnt) + ' (' + fmt(rif.length) + ' offerte)</div></div>';
  h += '</div>';

  // Donut charts
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Status (conteggio)</h4><div class="chart-wrap"><canvas id="chExStatus"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione per Categoria (valore)</h4><div class="chart-wrap"><canvas id="chExCat"></canvas></div></div>';
  h += '</div>';

  // Top agenti & societa
  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 Commerciali (per valore)</h4><div class="chart-wrap"><canvas id="chExAgenti"></canvas></div></div>';
  h += '<div class="card"><h4>Top 10 Societa (per valore)</h4><div class="chart-wrap"><canvas id="chExSocieta"></canvas></div></div>';
  h += '</div>';

  // Conversion + Distribution
  h += '<div class="row2">';
  h += '<div class="card"><h4>Tasso Conversione per Categoria</h4><div class="chart-wrap"><canvas id="chExConv"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione Valori</h4><div class="chart-wrap"><canvas id="chExDistrib"></canvas></div></div>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;

  // Render charts
  makeDonut('chExStatus', Object.keys(statusG), Object.values(statusG),
    Object.keys(statusG).map(k => STATUS_COLORS[k] || '#64748b'));

  const catSorted = Object.entries(catG).sort((a, b) => b[1] - a[1]);
  makeDonut('chExCat', catSorted.map(e => e[0]), catSorted.map(e => e[1]),
    CHART_COLORS.slice(0, catSorted.length));

  // Top agenti
  const agG = {};
  f.forEach(c => { const k = c.agente || 'N/D'; agG[k] = (agG[k] || 0) + c.totale; });
  const agSorted = Object.entries(agG).filter(e => e[0] !== 'N/D').sort((a, b) => b[1] - a[1]).slice(0, 15);
  makeBar('chExAgenti', agSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), agSorted.map(e => e[1]), '#3b82f6', true);

  // Top societa
  const soG = {};
  f.forEach(c => { const k = c.societa || 'N/D'; soG[k] = (soG[k] || 0) + c.totale; });
  const soSorted = Object.entries(soG).filter(e => e[0] !== 'N/D').sort((a, b) => b[1] - a[1]).slice(0, 10);
  makeBar('chExSocieta', soSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), soSorted.map(e => e[1]), '#8b5cf6', true);

  // Conversion by category
  const catConv = {};
  f.forEach(c => { const k = c.categoria || 'N/D'; if (!catConv[k]) catConv[k] = { tot: 0, contr: 0 }; catConv[k].tot++; if (c.status === 'Offerta Contrattualizzata') catConv[k].contr++; });
  const convSorted = Object.entries(catConv).sort((a, b) => b[1].tot - a[1].tot);
  makeBarConv('chExConv', convSorted.map(e => e[0]), convSorted.map(e => e[1].contr / e[1].tot * 100));

  // Distribution histogram
  const ranges = ['0-100', '100-500', '500-1K', '1K-5K', '5K-10K', '10K-50K', '50K+'];
  const bins = [0, 0, 0, 0, 0, 0, 0];
  f.forEach(d => { const v = d.totale; if (v <= 100) bins[0]++; else if (v <= 500) bins[1]++; else if (v <= 1000) bins[2]++; else if (v <= 5000) bins[3]++; else if (v <= 10000) bins[4]++; else if (v <= 50000) bins[5]++; else bins[6]++; });
  makeBar('chExDistrib', ranges, bins, '#06b6d4', false);
}

/* ── Pipeline & Conversione ── */
function renderPipeline() {
  const el = document.getElementById('sec-pipeline');
  const f = filtered;

  const statusKeys = [...new Set(f.map(c => c.status || 'N/D'))].sort();
  const catKeys = [...new Set(f.map(c => c.categoria || 'N/D'))].sort();

  const datasets = statusKeys.map(sk => ({
    label: sk,
    data: catKeys.map(ck => f.filter(c => (c.categoria || 'N/D') === ck && (c.status || 'N/D') === sk).length),
    backgroundColor: (STATUS_COLORS[sk] || '#64748b') + 'cc',
    borderRadius: 4
  }));

  let h = '<div class="sec"><h3 class="sec-title">Pipeline & Conversione per Categoria</h3>';
  h += '<div class="card"><h4>Distribuzione Status per Categoria</h4><div class="chart-wrap"><canvas id="chPipeline"></canvas></div></div>';

  // Detail table
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio Conversione</h4><div class="tbl-scroll"><table id="tblPipeline"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBarStacked('chPipeline', catKeys, datasets);

  // Table
  const hdrs = ['Categoria', 'Totale', 'Valore', 'Contratt.', 'Presentate', 'Rifiutate', 'Conv. %'];
  const rows = catKeys.map(ck => {
    const items = f.filter(c => (c.categoria || 'N/D') === ck);
    const val = items.reduce((s, c) => s + c.totale, 0);
    const co = items.filter(c => c.status === 'Offerta Contrattualizzata').length;
    const pr = items.filter(c => c.status === 'Offerta Presentata').length;
    const ri = items.filter(c => c.status === 'Offerta Rifiutata').length;
    return [
      { display: ck, val: ck },
      { display: fmt(items.length), val: items.length },
      { display: fmtE(val), val: val },
      { display: fmt(co), val: co },
      { display: fmt(pr), val: pr },
      { display: fmt(ri), val: ri },
      { display: pct(co, items.length), val: items.length ? co / items.length * 100 : 0 }
    ];
  });
  buildTbl('tblPipeline', hdrs, rows, ['str', 'num', 'num', 'num', 'num', 'num', 'num'], { clickField: 'categoria' });
}
