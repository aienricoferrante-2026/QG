/* ── Dashboard Totale · sections-tutto.js ──────────────────────────────────
 * Sezione aggiuntiva specifica della dashboard TUTTO:
 *   renderPerBu()  →  Analisi per BU (breakdown cross-BU con grafici e tabella)
 *
 * Le altre sezioni (Executive, Ricavi, EconFin, Responsabili, Clienti, Sedi,
 * Avanzamento, Alert, Produttivita, Wiki, Explore) sono già fornite dai
 * shared scripts e lavorano su `filtered` che contiene tutti i record cross-BU.
 */

/* ── Helper colori e meta BU ────────────────────────────────────────────── */
function _buColor(code) {
  const m = window.BU_META && window.BU_META[code];
  return m ? m.color : '#94a3b8';
}
function _buLabel(code) {
  const m = window.BU_META && window.BU_META[code];
  return m ? m.label : code;
}
function _buIcon(code) {
  const m = window.BU_META && window.BU_META[code];
  return m ? m.icon : '•';
}

/* ── Chart registry per evitare memory leak ─────────────────────────────── */
const _chartsPerBu = {};
function _destroyBuChart(id) {
  if (_chartsPerBu[id]) { try { _chartsPerBu[id].destroy(); } catch (e) {} delete _chartsPerBu[id]; }
}

/* ── renderPerBu ────────────────────────────────────────────────────────── */
function renderPerBu() {
  const el = document.getElementById('sec-perBu');
  if (!el) return;

  const f = filtered;

  /* Raggruppa per BU */
  const buMap = {};
  f.forEach(c => {
    const bu = c._bu || 'N/D';
    if (!buMap[bu]) buMap[bu] = [];
    buMap[bu].push(c);
  });

  /* Ordine: quello definito in BU_META, poi eventuali extra */
  const META_ORDER = window.BU_META ? Object.keys(window.BU_META) : [];
  const buList = [
    ...META_ORDER.filter(k => buMap[k]),
    ...Object.keys(buMap).filter(k => !META_ORDER.includes(k))
  ];

  /* Calcola metriche per ogni BU */
  const buStats = buList.map(bu => {
    const rows = buMap[bu];
    const cnt   = rows.length;
    const cons  = rows.reduce((s, c) => s + (c.consulenza  || 0), 0);
    const mol   = rows.reduce((s, c) => s + (c.mol         || 0), 0);
    const costi = rows.reduce((s, c) => s + (c.costi       || 0), 0);
    const inc   = rows.reduce((s, c) => s + (c.giaIncassato|| 0), 0);
    const res   = rows.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
    const aperte  = rows.filter(c => isOpen(c)).length;
    const chiuse  = rows.filter(c => isClosed(c)).length;
    const molPct  = cons ? mol / cons * 100 : 0;
    const incPct  = cons ? inc / cons * 100 : 0;
    return { bu, cnt, cons, mol, molPct, costi, inc, incPct, res, aperte, chiuse };
  });

  const totCons = buStats.reduce((s, b) => s + b.cons, 0);
  const totMol  = buStats.reduce((s, b) => s + b.mol,  0);
  const totCnt  = buStats.reduce((s, b) => s + b.cnt,  0);
  const totInc  = buStats.reduce((s, b) => s + b.inc,  0);
  const totRes  = buStats.reduce((s, b) => s + b.res,  0);

  /* ── HTML ──────────────────────────────────────────────────────────────── */
  let h = '<div class="sec"><h3 class="sec-title">Analisi per BU · ' + f.length.toLocaleString('it-IT') + ' commesse filtrate</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Confronto diretto tra ' + buList.length + ' Business Unit. Applica i filtri in alto per restringe l\'analisi.</p>';

  /* ── KPI totali riepilogo ───────────────────────────────────────────────── */
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse Totali</div><div class="kpi-value">' + fmt(totCnt) + '</div><div class="kpi-sub">' + buList.length + ' BU selezionate</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ricavi Aggregati</div><div class="kpi-value">' + fmtK(totCons) + '</div><div class="kpi-sub">' + fmtE(totCons) + '</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">MOL Aggregato</div><div class="kpi-value">' + (totCons ? (totMol / totCons * 100).toFixed(1) : '0') + '%</div><div class="kpi-sub">' + fmtK(totMol) + '</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Già Incassato</div><div class="kpi-value">' + fmtK(totInc) + '</div><div class="kpi-sub">' + (totCons ? (totInc / totCons * 100).toFixed(1) : '0') + '% ricavi</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Da Incassare</div><div class="kpi-value">' + fmtK(totRes) + '</div><div class="kpi-sub">esposizione aperta</div></div>';
  h += '</div>';

  /* ── Grafici ─────────────────────────────────────────────────────────────── */
  h += '<div class="row2">';

  /* Grafico 1: Ricavi per BU (bar orizzontale via chart.js) */
  h += '<div class="card"><h4>Ricavi per BU (€)</h4><canvas id="chartBuRicavi" height="220"></canvas></div>';

  /* Grafico 2: MOL% per BU */
  h += '<div class="card"><h4>Margine MOL% per BU</h4><canvas id="chartBuMol" height="220"></canvas></div>';

  h += '</div>';

  /* Secondo row: Commesse per BU + Distribuzione incasso */
  h += '<div class="row2">';
  h += '<div class="card"><h4>Commesse per BU</h4><canvas id="chartBuCnt" height="220"></canvas></div>';
  h += '<div class="card"><h4>Distribuzione Incasso vs Residuo</h4><canvas id="chartBuInc" height="220"></canvas></div>';
  h += '</div>';

  /* ── Tabella comparativa ────────────────────────────────────────────────── */
  h += '<div class="card" style="overflow-x:auto"><h4>Tabella Comparativa BU</h4>';
  h += '<table class="tbl" id="tblPerBu">';
  h += '<thead><tr>';
  h += '<th onclick="sortTbl(\'tblPerBu\',0)" style="cursor:pointer">BU</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',1,true)" style="cursor:pointer;text-align:right">Commesse</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',2,true)" style="cursor:pointer;text-align:right">Ricavi</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',3,true)" style="cursor:pointer;text-align:right">Costi</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',4,true)" style="cursor:pointer;text-align:right">MOL €</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',5,true)" style="cursor:pointer;text-align:right">MOL %</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',6,true)" style="cursor:pointer;text-align:right">Incassato</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',7,true)" style="cursor:pointer;text-align:right">% Inc.</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',8,true)" style="cursor:pointer;text-align:right">Da Incassare</th>';
  h += '<th onclick="sortTbl(\'tblPerBu\',9,true)" style="cursor:pointer;text-align:right">Aperte</th>';
  h += '</tr></thead><tbody>';

  buStats.forEach(b => {
    const molColor = b.molPct >= 30 ? '#10b981' : b.molPct >= 10 ? '#f59e0b' : '#ef4444';
    const incColor = b.incPct >= 80 ? '#10b981' : b.incPct >= 50 ? '#f59e0b' : '#94a3b8';
    const color = _buColor(b.bu);
    h += '<tr>';
    h += '<td><span style="display:inline-flex;align-items:center;gap:6px">'
      + '<span style="width:10px;height:10px;border-radius:50%;background:' + color + ';flex-shrink:0"></span>'
      + '<strong>' + _buIcon(b.bu) + ' ' + b.bu + '</strong>'
      + '<span style="color:var(--text3);font-size:11px">' + _buLabel(b.bu) + '</span>'
      + '</span></td>';
    h += '<td style="text-align:right">' + fmt(b.cnt) + '</td>';
    h += '<td style="text-align:right">' + fmtK(b.cons) + '</td>';
    h += '<td style="text-align:right">' + fmtK(b.costi) + '</td>';
    h += '<td style="text-align:right">' + fmtK(b.mol) + '</td>';
    h += '<td style="text-align:right;color:' + molColor + ';font-weight:600">' + b.molPct.toFixed(1) + '%</td>';
    h += '<td style="text-align:right">' + fmtK(b.inc) + '</td>';
    h += '<td style="text-align:right;color:' + incColor + '">' + b.incPct.toFixed(1) + '%</td>';
    h += '<td style="text-align:right">' + fmtK(b.res) + '</td>';
    h += '<td style="text-align:right">' + fmt(b.aperte) + '</td>';
    h += '</tr>';
  });

  /* Riga totale */
  const totMolPct = totCons ? totMol / totCons * 100 : 0;
  const totIncPct = totCons ? totInc / totCons * 100 : 0;
  const totAperte = buStats.reduce((s, b) => s + b.aperte, 0);
  const totCosti  = buStats.reduce((s, b) => s + b.costi, 0);
  h += '<tr style="font-weight:700;border-top:2px solid var(--border)">';
  h += '<td>TOTALE</td>';
  h += '<td style="text-align:right">' + fmt(totCnt) + '</td>';
  h += '<td style="text-align:right">' + fmtK(totCons) + '</td>';
  h += '<td style="text-align:right">' + fmtK(totCosti) + '</td>';
  h += '<td style="text-align:right">' + fmtK(totMol) + '</td>';
  h += '<td style="text-align:right">' + totMolPct.toFixed(1) + '%</td>';
  h += '<td style="text-align:right">' + fmtK(totInc) + '</td>';
  h += '<td style="text-align:right">' + totIncPct.toFixed(1) + '%</td>';
  h += '<td style="text-align:right">' + fmtK(totRes) + '</td>';
  h += '<td style="text-align:right">' + fmt(totAperte) + '</td>';
  h += '</tr>';

  h += '</tbody></table></div>';

  /* ── Cards per BU ──────────────────────────────────────────────────────── */
  h += '<h4 style="margin:20px 0 10px">Schede per Business Unit</h4>';
  h += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:20px">';

  buStats.forEach(b => {
    const color = _buColor(b.bu);
    const pctOfTot = totCons ? (b.cons / totCons * 100).toFixed(1) : '0';
    const molColor = b.molPct >= 30 ? '#10b981' : b.molPct >= 10 ? '#f59e0b' : '#ef4444';
    h += '<div class="card" style="border-left:4px solid ' + color + ';padding:14px;cursor:pointer" '
      + 'onclick="drillFiltered(\'' + _buIcon(b.bu) + ' ' + b.bu + ' · ' + _buLabel(b.bu).replace(/'/g, "\\'") + '\', c => c._bu === \'' + b.bu + '\')">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">';
    h += '<div><span style="font-size:20px">' + _buIcon(b.bu) + '</span> <strong>' + b.bu + '</strong>';
    h += '<div style="color:var(--text3);font-size:11px;margin-top:2px">' + _buLabel(b.bu) + '</div></div>';
    h += '<span style="background:' + color + '22;color:' + color + ';border-radius:4px;padding:2px 7px;font-size:11px;font-weight:600">'
      + pctOfTot + '% ricavi</span>';
    h += '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">';
    h += '<div><div style="color:var(--text3)">Commesse</div><div style="font-weight:600">' + fmt(b.cnt) + '</div></div>';
    h += '<div><div style="color:var(--text3)">Ricavi</div><div style="font-weight:600">' + fmtK(b.cons) + '</div></div>';
    h += '<div><div style="color:var(--text3)">MOL%</div><div style="font-weight:700;color:' + molColor + '">' + b.molPct.toFixed(1) + '%</div></div>';
    h += '<div><div style="color:var(--text3)">Incasso</div><div style="font-weight:600">' + b.incPct.toFixed(1) + '%</div></div>';
    h += '<div><div style="color:var(--text3)">Aperte</div><div>' + fmt(b.aperte) + '</div></div>';
    h += '<div><div style="color:var(--text3)">Da Incassare</div><div>' + fmtK(b.res) + '</div></div>';
    h += '</div>';
    h += '</div>';
  });

  h += '</div>';
  h += '</div>'; /* end sec */

  el.innerHTML = h;

  /* ── Chart.js ──────────────────────────────────────────────────────────── */
  if (typeof Chart === 'undefined') return;

  const labels   = buList.map(bu => bu);
  const colors   = buList.map(bu => _buColor(bu));
  const colorsA  = buList.map(bu => _buColor(bu) + 'cc');
  const chartCfg = { responsive: true, plugins: { legend: { display: false } }, animation: { duration: 400 } };

  /* Ricavi per BU */
  _destroyBuChart('chartBuRicavi');
  const ctxR = document.getElementById('chartBuRicavi');
  if (ctxR) {
    _chartsPerBu['chartBuRicavi'] = new Chart(ctxR, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Ricavi €', data: buStats.map(b => b.cons), backgroundColor: colorsA, borderColor: colors, borderWidth: 2, borderRadius: 4 }]
      },
      options: { ...chartCfg, scales: { y: { ticks: { callback: v => fmtK(v) } } } }
    });
  }

  /* MOL% per BU */
  _destroyBuChart('chartBuMol');
  const ctxM = document.getElementById('chartBuMol');
  if (ctxM) {
    const molColors = buStats.map(b => b.molPct >= 30 ? '#10b981bb' : b.molPct >= 10 ? '#f59e0bbb' : '#ef4444bb');
    const molBorder = buStats.map(b => b.molPct >= 30 ? '#10b981'   : b.molPct >= 10 ? '#f59e0b'   : '#ef4444');
    _chartsPerBu['chartBuMol'] = new Chart(ctxM, {
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'MOL%', data: buStats.map(b => b.molPct), backgroundColor: molColors, borderColor: molBorder, borderWidth: 2, borderRadius: 4 }]
      },
      options: { ...chartCfg, scales: { y: { ticks: { callback: v => v.toFixed(1) + '%' } } },
        plugins: { ...chartCfg.plugins, annotation: {} } }
    });
  }

  /* Commesse per BU (donut) */
  _destroyBuChart('chartBuCnt');
  const ctxC = document.getElementById('chartBuCnt');
  if (ctxC) {
    _chartsPerBu['chartBuCnt'] = new Chart(ctxC, {
      type: 'doughnut',
      data: {
        labels: buList.map(bu => _buIcon(bu) + ' ' + bu),
        datasets: [{ data: buStats.map(b => b.cnt), backgroundColor: colorsA, borderColor: colors, borderWidth: 2 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 12 } } }, animation: { duration: 400 } }
    });
  }

  /* Incasso vs Residuo per BU (stacked bar) */
  _destroyBuChart('chartBuInc');
  const ctxI = document.getElementById('chartBuInc');
  if (ctxI) {
    _chartsPerBu['chartBuInc'] = new Chart(ctxI, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Incassato', data: buStats.map(b => b.inc), backgroundColor: '#10b98188', borderColor: '#10b981', borderWidth: 1, borderRadius: 4 },
          { label: 'Da Incassare', data: buStats.map(b => b.res), backgroundColor: '#f59e0b55', borderColor: '#f59e0b', borderWidth: 1 }
        ]
      },
      options: {
        ...chartCfg,
        plugins: { legend: { display: true, position: 'top', labels: { font: { size: 11 }, boxWidth: 12 } } },
        scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: v => fmtK(v) } } }
      }
    });
  }
}

/* ── Utility sortTbl (se non già definita in shared) ─────────────────────── */
if (typeof sortTbl !== 'function') {
  function sortTbl(tblId, colIdx, numeric) {
    const tbl = document.getElementById(tblId);
    if (!tbl) return;
    const tbody = tbl.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    /* Non toccare l'ultima riga se è il totale (ha font-weight:700) */
    const lastIsTotal = rows.length && rows[rows.length - 1].style.fontWeight === '700';
    const dataRows = lastIsTotal ? rows.slice(0, -1) : rows;
    const totalRow = lastIsTotal ? rows[rows.length - 1] : null;

    let asc = tbl.dataset['sortCol'] == colIdx && tbl.dataset['sortDir'] === 'asc' ? false : true;
    tbl.dataset['sortCol'] = colIdx;
    tbl.dataset['sortDir'] = asc ? 'asc' : 'desc';

    dataRows.sort((a, b) => {
      const va = a.cells[colIdx] ? a.cells[colIdx].textContent.trim() : '';
      const vb = b.cells[colIdx] ? b.cells[colIdx].textContent.trim() : '';
      if (numeric) {
        const na = parseFloat(va.replace(/[^0-9,.\-]/g, '').replace(',', '.')) || 0;
        const nb = parseFloat(vb.replace(/[^0-9,.\-]/g, '').replace(',', '.')) || 0;
        return asc ? na - nb : nb - na;
      }
      return asc ? va.localeCompare(vb, 'it') : vb.localeCompare(va, 'it');
    });

    dataRows.forEach(r => tbody.appendChild(r));
    if (totalRow) tbody.appendChild(totalRow);
  }
}
