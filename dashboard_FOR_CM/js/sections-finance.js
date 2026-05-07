/* ── Sezioni: Avanzamento, Sedi, Alert ── */

/* Heatmap matrix: Stato Classe x Stato Corso with clickable cells */
function buildClasseCorsoMatrix(crossCL, allClasse, allCorso2) {
  const classeArr = [...allClasse].sort();
  const corsoArr = [...allCorso2].sort();
  const maxVal = Math.max(1, ...Object.values(crossCL).map(v => v.length));

  function cellColor(n) {
    if (n === 0) return 'background:transparent';
    const intensity = Math.min(n / maxVal, 1);
    const r = Math.round(59 + (16 - 59) * intensity);
    const g = Math.round(130 + (185 - 130) * intensity);
    const b = Math.round(246 + (129 - 246) * intensity);
    return 'background:rgba(' + r + ',' + g + ',' + b + ',' + (0.15 + intensity * 0.55) + ')';
  }

  let h = '<table class="matrix-tbl"><thead><tr><th class="matrix-corner">Classe \\ Corso</th>';
  corsoArr.forEach(sc => {
    h += '<th class="matrix-hdr">' + (sc.length > 20 ? sc.substring(0, 18) + '..' : sc) + '</th>';
  });
  h += '<th class="matrix-hdr matrix-tot">Totale</th></tr></thead><tbody>';

  const colTotals = corsoArr.map(() => 0);
  let grandTotal = 0;

  classeArr.forEach(cl => {
    h += '<tr><td class="matrix-row-hdr">' + tagClasse(cl) + '</td>';
    let rowTotal = 0;
    corsoArr.forEach((sc, ci) => {
      const items = crossCL[cl + '|' + sc] || [];
      const n = items.length;
      rowTotal += n;
      colTotals[ci] += n;
      grandTotal += n;
      if (n > 0) {
        const esc_cl = cl.replace(/'/g, "\\'");
        const esc_sc = sc.replace(/'/g, "\\'");
        h += '<td class="matrix-cell clickable" style="' + cellColor(n) + '" ' +
          'onclick="drillClasseCorso(\'' + esc_cl + '\',\'' + esc_sc + '\')" ' +
          'title="' + cl + ' + ' + sc + ': ' + n + ' commesse">' +
          '<span class="matrix-val">' + n + '</span></td>';
      } else {
        h += '<td class="matrix-cell matrix-zero">-</td>';
      }
    });
    h += '<td class="matrix-cell matrix-tot"><strong>' + rowTotal + '</strong></td></tr>';
  });

  // Totals row
  h += '<tr class="matrix-totals"><td class="matrix-row-hdr"><strong>Totale</strong></td>';
  colTotals.forEach(t => {
    h += '<td class="matrix-cell matrix-tot"><strong>' + t + '</strong></td>';
  });
  h += '<td class="matrix-cell matrix-tot"><strong>' + grandTotal + '</strong></td></tr>';

  h += '</tbody></table>';
  return h;
}

/* Drill-down for Classe x Corso cell */
function drillClasseCorso(classe, corso) {
  const items = filtered.filter(c =>
    (c.statoClasse || 'N/D') === classe && (c.statoCorso || 'N/D') === corso
  );
  drillDownItems('Classe: ' + classe + ' / Corso: ' + corso, items);
}

function renderAvanzamento() {
  const el = document.getElementById('sec-avanzamento');
  const f = filtered;

  // Distribuzione avanzamento
  const bins = { '0%': 0, '1-25%': 0, '26-50%': 0, '51-75%': 0, '76-99%': 0, '100%': 0 };
  f.forEach(c => {
    const a = c.avanzamento;
    if (a === 0) bins['0%']++;
    else if (a <= 25) bins['1-25%']++;
    else if (a <= 50) bins['26-50%']++;
    else if (a <= 75) bins['51-75%']++;
    else if (a < 100) bins['76-99%']++;
    else bins['100%']++;
  });

  // Status x Stato Corso cross-tab
  const cross = {};
  const allStatus = new Set();
  const allCorso = new Set();
  f.forEach(c => {
    const s = c.status || 'N/D';
    const sc = c.statoCorso || 'N/D';
    allStatus.add(s);
    allCorso.add(sc);
    const k = s + '|' + sc;
    cross[k] = (cross[k] || 0) + 1;
  });

  // Stato Classe x Stato Corso cross-tab
  const crossCL = {};
  const allClasse = new Set();
  const allCorso2 = new Set();
  f.forEach(c => {
    const cl = c.statoClasse || 'N/D';
    const sc = c.statoCorso || 'N/D';
    allClasse.add(cl);
    allCorso2.add(sc);
    const k = cl + '|' + sc;
    if (!crossCL[k]) crossCL[k] = [];
    crossCL[k].push(c);
  });

  let h = '<div class="sec"><h3 class="sec-title">Avanzamento & Stato</h3>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione Avanzamento</h4><div class="chart-wrap"><canvas id="chAvz"></canvas></div></div>';
  h += '<div class="card"><h4>Status vs Stato Corso</h4><div class="tbl-scroll"><table id="tblCross"></table></div></div>';
  h += '</div>';

  // Classe x Corso heatmap card
  h += '<div class="card" style="margin-top:14px"><h4>Incrocio Stato Classe &times; Stato Corso</h4>';
  h += '<p style="color:var(--text2);font-size:.78rem;margin-bottom:10px">Clicca su una cella per vedere i corsi di quella combinazione</p>';
  h += buildClasseCorsoMatrix(crossCL, allClasse, allCorso2);
  h += '</div>';

  // Commesse con avanzamento basso e stato corso non concluso
  const lowAvz = f.filter(c => c.avanzamento < 30 && c.statoCorso !== 'Concluso' && c.consulenza > 0);
  if (lowAvz.length > 0) {
    h += '<div class="card"><h4>Commesse con Avanzamento &lt; 30% (non concluse, con ricavi) - ' + lowAvz.length + '</h4>';
    h += '<div class="tbl-scroll"><table id="tblLowAvz"></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  // Chart
  makeBar('chAvz', Object.keys(bins), Object.values(bins), '#3b82f6', false);

  // Cross-tab
  const statusArr = [...allStatus].sort();
  const corsoArr = [...allCorso].sort();
  const crossHdrs = ['Status \\ Corso', ...corsoArr, 'Totale'];
  const crossTypes = ['str', ...corsoArr.map(() => 'num'), 'num'];
  const crossRows = statusArr.map(s => {
    const row = [s];
    let tot = 0;
    corsoArr.forEach(sc => {
      const v = cross[s + '|' + sc] || 0;
      tot += v;
      row.push({ display: v || '-', val: v });
    });
    row.push({ display: '<strong>' + tot + '</strong>', val: tot });
    return row;
  });
  buildTbl('tblCross', crossHdrs, crossRows, crossTypes);

  // Low avanzamento table
  if (lowAvz.length > 0) {
    const sorted = lowAvz.sort((a, b) => b.consulenza - a.consulenza);
    buildTbl('tblLowAvz',
      ['ID', 'Titolo del corso', 'Cliente', 'Ricavi', 'Avz.', 'Status', 'Stato Corso', 'Qnet'],
      sorted.slice(0, 50).map(c => [
        c.id,
        { display: ((c.titolo || c.corso) || '').substring(0, 50), val: (c.titolo || c.corso) },
        { display: c.cliente.replace(/_FOR/g, ''), val: c.cliente },
        { display: fmtE(c.consulenza), val: c.consulenza },
        { display: c.avanzamento + '%', val: c.avanzamento },
        tagStatus(c.status),
        tagCorso(c.statoCorso),
        qnetBtn(c)
      ]),
      ['num', 'str', 'str', 'num', 'num', 'str', 'str', 'str']
    );
  }
}

/* ── Sedi ── */
function renderSedi() {
  const el = document.getElementById('sec-sedi');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.sedeNorm || c.sedeOp || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, mol: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].mol += c.mol;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Sedi Operative</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:10px">Le sedi sono prefissate dal nome della Città per facilitare ricerca e raggruppamento.</p>';
  h += '<div class="card"><h4>Ricavi per Sede</h4><div class="chart-wrap"><canvas id="chSedi"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblSedi"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chSedi',
    top15.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    top15.map(e => e[1].cons), '#ec4899', true);

  buildTbl('tblSedi',
    ['Sede', 'Comm.', 'Ricavi', 'MOL'],
    sorted.map(([k, v]) => [
      { display: k.length > 60 ? k.substring(0, 58) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.mol), val: v.mol }
    ]),
    ['str', 'num', 'num', 'num'],
    { clickField: 'sedeNorm' }
  );
}

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  const f = filtered;

  // Helper: parse data "gg-mm-yyyy" o "gg/mm/yyyy" → Date (null se invalida)
  function _parseDate(s) {
    if (!s) return null;
    const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return null;
    return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
  }
  const today = new Date();

  // ── Calcolo set di alert ──
  const molNeg = f.filter(c => c.mol < 0 && c.consulenza > 0)
    .map(c => ({ ...c, _kpi: c.mol })).sort((a, b) => a._kpi - b._kpi);
  const stalled = f.filter(c => {
    if (c.avanzamento >= 50) return false;
    const fine = _parseDate(c.dataFine);
    return fine && fine < today;
  }).map(c => {
    const fine = _parseDate(c.dataFine);
    const giorniRitardo = fine ? Math.floor((today - fine) / 86400000) : 0;
    return { ...c, _kpi: giorniRitardo };
  }).sort((a, b) => b._kpi - a._kpi);
  const senzaIncasso = f.filter(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0)
    .map(c => {
      const inizio = _parseDate(c.dataInizio);
      const eta = inizio ? Math.floor((today - inizio) / 86400000) : 0;
      return { ...c, _kpi: eta };
    }).sort((a, b) => b._kpi - a._kpi);
  const noAvz = f.filter(c => c.avanzamento === 0 && c.status !== 'Da pianificare' && c.statoCorso !== 'Concluso');
  const highOre = f.filter(c => c.ore > 500);

  // Clienti a rischio: alta esposizione + bassa % incasso
  const cliRisk = {};
  f.forEach(c => {
    const k = (c.cliente || 'N/D').replace(/_FOR/g, '').trim();
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
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Vista prioritizzata di problemi e situazioni a rischio: clicca sui blocchi per il drill-down completo.</p>';

  // Riepilogo conteggi
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi pink"><div class="kpi-label">MOL Negativo</div><div class="kpi-value">' + fmt(molNeg.length) + '</div><div class="kpi-sub">Costi &gt; Ricavi</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Senza incasso</div><div class="kpi-value">' + fmt(senzaIncasso.length) + '</div><div class="kpi-sub">€ 0 incassati</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Stalled</div><div class="kpi-value">' + fmt(stalled.length) + '</div><div class="kpi-sub">avz. &lt; 50% e data passata</div></div>';
  h += '<div class="kpi blue"><div class="kpi-label">Avanzamento 0%</div><div class="kpi-value">' + fmt(noAvz.length) + '</div><div class="kpi-sub">non in "Da pianificare"</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Ore elevate</div><div class="kpi-value">' + fmt(highOre.length) + '</div><div class="kpi-sub">&gt; 500 ore</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Clienti a rischio</div><div class="kpi-value">' + fmt(cliRiskList.length) + '</div><div class="kpi-sub">esposizione &gt; 50K, %inc &lt; 30%</div></div>';
  h += '</div>';

  // ═══ Tabella 1: Top 10 commesse MOL negativo ═══
  if (molNeg.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #ef4444"><h4 style="color:#ef4444">⚠️ Top 10 commesse con MOL negativo (perdita)</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertMolNeg"></table></div></div>';
  }

  // ═══ Tabella 2: Top 10 stalled (più giorni di ritardo prima) ═══
  if (stalled.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #8b5cf6"><h4 style="color:#8b5cf6">🐢 Top 10 commesse stalled (avz &lt; 50% e data fine passata)</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertStalled"></table></div></div>';
  }

  // ═══ Tabella 3: Top 10 senza incasso (più vecchie prima) ═══
  if (senzaIncasso.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #f59e0b"><h4 style="color:#f59e0b">💸 Top 10 commesse senza incasso (più vecchie prima)</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertNoInc"></table></div></div>';
  }

  // ═══ Tabella 4: Clienti a rischio ═══
  if (cliRiskList.length) {
    h += '<div class="card" style="margin-top:14px;border-left:3px solid #10b981"><h4 style="color:#10b981">🎯 Clienti a rischio (alta esposizione + bassa % incasso)</h4>';
    h += '<div class="tbl-scroll"><table id="tblAlertCli"></table></div></div>';
  }

  if (!molNeg.length && !stalled.length && !senzaIncasso.length && !cliRiskList.length) {
    h += '<div class="card"><p style="color:var(--green);text-align:center;padding:20px">Nessun alert rilevato sui filtri attuali</p></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  // ── Render tabelle ──
  const cmCols = ['ID', 'Titolo / Corso', 'Cliente', 'Sede', 'Ricavi', 'Costi', 'MOL', 'Avz.', 'Qnet'];
  const cmTypes = ['num', 'str', 'str', 'str', 'num', 'num', 'num', 'num', 'str'];
  function _cmRow(c) {
    return [
      c.id,
      { display: ((c.titolo || c.corso) || '').substring(0, 50), val: (c.titolo || c.corso) },
      { display: (c.cliente || '').replace(/_FOR/g, '').substring(0, 30), val: c.cliente },
      { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
      { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
      { display: fmtE(c.costi || 0), val: c.costi || 0 },
      { display: fmtE(c.mol || 0), val: c.mol || 0 },
      { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
      qnetBtn(c)
    ];
  }

  if (molNeg.length) {
    buildTbl('tblAlertMolNeg', cmCols, molNeg.slice(0, 10).map(_cmRow), cmTypes);
  }
  if (stalled.length) {
    buildTbl('tblAlertStalled',
      ['ID', 'Titolo / Corso', 'Cliente', 'Sede', 'Avz.', 'Data Fine', 'Giorni ritardo', 'Ricavi', 'Qnet'],
      stalled.slice(0, 10).map(c => [
        c.id,
        { display: ((c.titolo || c.corso) || '').substring(0, 45), val: (c.titolo || c.corso) },
        { display: (c.cliente || '').replace(/_FOR/g, '').substring(0, 30), val: c.cliente },
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
      ['ID', 'Titolo / Corso', 'Cliente', 'Sede', 'Data Inizio', 'Età (gg)', 'Ricavi', 'Qnet'],
      senzaIncasso.slice(0, 10).map(c => [
        c.id,
        { display: ((c.titolo || c.corso) || '').substring(0, 45), val: (c.titolo || c.corso) },
        { display: (c.cliente || '').replace(/_FOR/g, '').substring(0, 30), val: c.cliente },
        { display: ((c.sedeNorm || c.sedeOp || '').split(' - ')[0]).substring(0, 25), val: c.sedeNorm },
        c.dataInizio || '-',
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
