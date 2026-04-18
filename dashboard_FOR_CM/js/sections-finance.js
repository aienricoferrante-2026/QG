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
      ['ID', 'Titolo del corso', 'Cliente', 'Ricavi', 'Avz.', 'Status', 'Stato Corso', 'ERP'],
      sorted.slice(0, 50).map(c => [
        c.id,
        { display: ((c.titolo || c.corso) || '').substring(0, 50), val: (c.titolo || c.corso) },
        { display: c.cliente.replace(/_FOR/g, ''), val: c.cliente },
        { display: fmtE(c.consulenza), val: c.consulenza },
        { display: c.avanzamento + '%', val: c.avanzamento },
        tagStatus(c.status),
        tagCorso(c.statoCorso),
        '<button class="btn-erp" onclick="openErp(' + c.id + ')">ERP</button>'
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
    const k = c.sedeOp || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, mol: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].mol += c.mol;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Sedi Operative</h3>';
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
      { display: k.length > 50 ? k.substring(0, 48) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.mol), val: v.mol }
    ]),
    ['str', 'num', 'num', 'num'],
    { clickField: 'sedeOp' }
  );
}

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  const f = filtered;

  const alerts = [];

  // 1. Commesse con costi > ricavi (MOL negativo)
  const molNeg = f.filter(c => c.mol < 0 && c.consulenza > 0);
  if (molNeg.length) alerts.push({ tipo: 'MOL Negativo', cnt: molNeg.length, desc: 'Commesse dove i costi superano i ricavi', items: molNeg });

  // 2. Avanzamento 0% con stato non "Da pianificare"
  const noAvz = f.filter(c => c.avanzamento === 0 && c.status !== 'Da pianificare' && c.statoCorso !== 'Concluso');
  if (noAvz.length) alerts.push({ tipo: 'Avz. 0% non pianificati', cnt: noAvz.length, desc: 'Commesse a 0% che non sono in stato "Da pianificare"', items: noAvz });

  // 3. Commesse concluse con MOL = 0
  const zeroMol = f.filter(c => c.statoCorso === 'Concluso' && c.mol === 0 && c.consulenza === 0);
  if (zeroMol.length) alerts.push({ tipo: 'Conclusi senza ricavi', cnt: zeroMol.length, desc: 'Commesse concluse con ricavi e MOL a zero', items: zeroMol });

  // 4. Ore molto alte (outlier)
  const highOre = f.filter(c => c.ore > 500);
  if (highOre.length) alerts.push({ tipo: 'Ore elevate (>500)', cnt: highOre.length, desc: 'Commesse con oltre 500 ore assegnate', items: highOre });

  let h = '<div class="sec"><h3 class="sec-title">Alert & Anomalie</h3>';
  if (alerts.length === 0) {
    h += '<div class="card"><p style="color:var(--green);text-align:center;padding:20px">Nessun alert rilevato</p></div>';
  } else {
    h += '<div class="card"><div class="tbl-scroll"><table id="tblAlert"></table></div></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  if (alerts.length > 0) {
    buildTbl('tblAlert',
      ['Tipo Alert', 'Commesse', 'Descrizione'],
      alerts.map(a => [
        { display: '<span class="tag tag-red">' + a.tipo + '</span>', val: a.tipo },
        { display: '<strong>' + a.cnt + '</strong>', val: a.cnt },
        { display: a.desc, val: a.desc }
      ]),
      ['str', 'num', 'str']
    );

    // Make rows clickable
    const tbl = document.getElementById('tblAlert');
    const rows = tbl.querySelectorAll('tbody tr');
    rows.forEach((row, i) => {
      row.classList.add('clickable');
      row.onclick = () => drillDownItems(alerts[i].tipo, alerts[i].items);
    });
  }
}
