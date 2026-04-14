/* ── Sezioni: Corsi, CPI, Operatori, Rendicontazione, Alert ── */

function renderCorsi() {
  const el = document.getElementById('sec-corsi');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.corso || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, nuove: 0, accettate: 0, perse: 0 };
    g[k].cnt++;
    if (c.status === 'Nuova') g[k].nuove++;
    if (c.status === 'Accettato') g[k].accettate++;
    if (c.status === 'Persa') g[k].perse++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Analisi Corsi</h3>';
  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 Corsi (per opportunità)</h4><div class="chart-wrap"><canvas id="chCorsiTop"></canvas></div></div>';
  h += '<div class="card"><h4>Per Tipologia Corso</h4><div class="chart-wrap"><canvas id="chCorsiTipo"></canvas></div></div>';
  h += '</div>';
  h += '<div class="card"><h4>Tutti i Corsi (' + sorted.length + ')</h4>';
  h += '<div class="tbl-scroll"><table id="tblCorsi"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chCorsiTop',
    top15.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    top15.map(e => e[1].cnt), '#3b82f6', true);

  // Tipologia
  const tipoG = {};
  f.forEach(c => { const k = c.tipologiaCorso || 'N/D'; tipoG[k] = (tipoG[k] || 0) + 1; });
  const tipoSorted = Object.entries(tipoG).sort((a, b) => b[1] - a[1]);
  makeBar('chCorsiTipo', tipoSorted.map(e => e[0]), tipoSorted.map(e => e[1]), '#8b5cf6', true);

  buildTbl('tblCorsi',
    ['Corso', 'Opp.', 'Nuove', 'Accettate', 'Perse', '% Acc.'],
    sorted.map(([k, v]) => [
      { display: k.length > 45 ? k.substring(0, 43) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.nuove), val: v.nuove },
      { display: fmt(v.accettate), val: v.accettate },
      { display: fmt(v.perse), val: v.perse },
      { display: v.cnt ? (v.accettate / v.cnt * 100).toFixed(1) + '%' : '-', val: v.cnt ? v.accettate / v.cnt * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'corso' }
  );
}

/* ── CPI ── */
function renderCpi() {
  const el = document.getElementById('sec-cpi');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.cpi || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, nuove: 0, accettate: 0, perse: 0, attesa: 0 };
    g[k].cnt++;
    if (c.status === 'Nuova') g[k].nuove++;
    if (c.status === 'Accettato') g[k].accettate++;
    if (c.status === 'Persa') g[k].perse++;
    if (c.status === 'Attesa Pro-forma') g[k].attesa++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Centri Per l\'Impiego (CPI)</h3>';
  h += '<div class="card"><h4>Top 15 CPI</h4><div class="chart-wrap"><canvas id="chCpi"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblCpi"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chCpi', top15.map(e => e[0]), top15.map(e => e[1].cnt), '#06b6d4', true);

  buildTbl('tblCpi',
    ['CPI', 'Opp.', 'Nuove', 'Attesa', 'Accettate', 'Perse'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.nuove), val: v.nuove },
      { display: fmt(v.attesa), val: v.attesa },
      { display: fmt(v.accettate), val: v.accettate },
      { display: fmt(v.perse), val: v.perse }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cpi' }
  );
}

/* ── Operatori ── */
function renderOperatori() {
  const el = document.getElementById('sec-operatori');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.operatore || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, nuove: 0, accettate: 0, perse: 0, attesa: 0 };
    g[k].cnt++;
    if (c.status === 'Nuova') g[k].nuove++;
    if (c.status === 'Accettato') g[k].accettate++;
    if (c.status === 'Persa') g[k].perse++;
    if (c.status === 'Attesa Pro-forma') g[k].attesa++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Carico Operatori</h3>';
  h += '<div class="card"><h4>Top 15 Operatori</h4><div class="chart-wrap"><canvas id="chOp"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblOp"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chOp', top15.map(e => e[0]), top15.map(e => e[1].cnt), '#8b5cf6', true);

  buildTbl('tblOp',
    ['Operatore', 'Opp.', 'Nuove', 'Attesa', 'Accettate', 'Perse', '% Perse'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.nuove), val: v.nuove },
      { display: fmt(v.attesa), val: v.attesa },
      { display: fmt(v.accettate), val: v.accettate },
      { display: fmt(v.perse), val: v.perse },
      { display: v.cnt ? (v.perse / v.cnt * 100).toFixed(1) + '%' : '-', val: v.cnt ? v.perse / v.cnt * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'operatore' }
  );
}

/* ── Rendicontazione ── */
function renderRendicontazione() {
  const el = document.getElementById('sec-rendicontazione');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.rendicontazione || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, nuove: 0, accettate: 0, perse: 0, attesa: 0 };
    g[k].cnt++;
    if (c.status === 'Nuova') g[k].nuove++;
    if (c.status === 'Accettato') g[k].accettate++;
    if (c.status === 'Persa') g[k].perse++;
    if (c.status === 'Attesa Pro-forma') g[k].attesa++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Rendicontazione</h3>';
  h += '<div class="card"><h4>Top 15 Responsabili Rendicontazione</h4><div class="chart-wrap"><canvas id="chRend"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblRend"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chRend', top15.map(e => e[0]), top15.map(e => e[1].cnt), '#10b981', true);

  buildTbl('tblRend',
    ['Responsabile', 'Opp.', 'Nuove', 'Attesa', 'Accettate', 'Perse'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.nuove), val: v.nuove },
      { display: fmt(v.attesa), val: v.attesa },
      { display: fmt(v.accettate), val: v.accettate },
      { display: fmt(v.perse), val: v.perse }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'rendicontazione' }
  );
}

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  const f = filtered;

  const perse = f.filter(c => c.status === 'Persa');
  const senzaOp = f.filter(c => !c.operatore || c.operatore === 'N/D');
  const senzaCorso = f.filter(c => !c.corso);

  let h = '<div class="sec"><h3 class="sec-title">Alert &amp; Anomalie</h3>';

  // Perse
  h += '<div class="card"><h4>&#9888; Opportunità Perse (' + fmt(perse.length) + ')</h4>';
  if (perse.length > 0) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Opportunità con status "Persa". Clicca per dettaglio.</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'Perse\', filtered.filter(c=>c.status===\\\'Persa\\\'))">Vedi tutte &rarr;</button>';
  } else {
    h += '<p style="color:var(--green);font-size:12px">Nessuna opportunità persa nel filtro corrente.</p>';
  }
  h += '</div>';

  // Senza operatore
  h += '<div class="card" style="margin-top:14px"><h4>&#9888; Senza Operatore (' + fmt(senzaOp.length) + ')</h4>';
  if (senzaOp.length > 0) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Opportunità senza operatore assegnato.</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'Senza Operatore\', filtered.filter(c=>!c.operatore))">Vedi tutte &rarr;</button>';
  } else {
    h += '<p style="color:var(--green);font-size:12px">Tutte le opportunità hanno un operatore.</p>';
  }
  h += '</div>';

  // Senza corso
  h += '<div class="card" style="margin-top:14px"><h4>&#9888; Senza Corso Assegnato (' + fmt(senzaCorso.length) + ')</h4>';
  if (senzaCorso.length > 0) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Opportunità senza corso di formazione associato.</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'Senza Corso\', filtered.filter(c=>!c.corso))">Vedi tutte &rarr;</button>';
  } else {
    h += '<p style="color:var(--green);font-size:12px">Tutte le opportunità hanno un corso.</p>';
  }
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}
