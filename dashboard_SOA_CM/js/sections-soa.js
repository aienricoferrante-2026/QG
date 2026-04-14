/* ── Sezioni: SOA Attestanti, Enti Cert., Citta, Avanzamento, Alert ── */

function renderSoaAttestanti() {
  const el = document.getElementById('sec-soa');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.soaAttestante || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ente: 0, eseg: 0 };
    g[k].cnt++;
    g[k].ente += c.importoEnte;
    if (c.status === 'Eseguito') g[k].eseg++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].ente - a[1].ente);

  let h = '<div class="sec"><h3 class="sec-title">SOA Attestanti</h3>';
  h += '<div class="card"><h4>Importo per SOA Attestante</h4><div class="chart-wrap"><canvas id="chSoa"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblSoa"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chSoa', sorted.map(e => e[0]), sorted.map(e => e[1].ente), '#8b5cf6', true);

  buildTbl('tblSoa',
    ['SOA Attestante', 'Comm.', 'Importo Ente', 'Eseguiti', '% Eseguiti'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ente), val: v.ente },
      { display: fmt(v.eseg), val: v.eseg },
      { display: pct(v.eseg, v.cnt), val: v.cnt ? v.eseg / v.cnt * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num'],
    { clickField: 'soaAttestante' }
  );
}

/* ── Enti Certificazione 9001 ── */
function renderEnti() {
  const el = document.getElementById('sec-enti');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.enteCert9001 || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ente: 0 };
    g[k].cnt++;
    g[k].ente += c.importoEnte;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Enti Certificazione 9001</h3>';
  h += '<div class="card"><h4>Commesse per Ente</h4><div class="chart-wrap"><canvas id="chEnti"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblEnti"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chEnti', top15.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), top15.map(e => e[1].cnt), '#06b6d4', true);

  buildTbl('tblEnti',
    ['Ente Certificazione', 'Comm.', 'Importo Ente'],
    sorted.map(([k, v]) => [
      { display: k.length > 45 ? k.substring(0, 43) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ente), val: v.ente }
    ]),
    ['str', 'num', 'num'],
    { clickField: 'enteCert9001' }
  );
}

/* ── Citta ── */
function renderCitta() {
  const el = document.getElementById('sec-citta');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.citta || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ente: 0 };
    g[k].cnt++;
    g[k].ente += c.importoEnte;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].ente - a[1].ente);

  let h = '<div class="sec"><h3 class="sec-title">Citta (' + sorted.length + ')</h3>';
  h += '<div class="card"><h4>Top 20 Citta per Importo</h4><div class="chart-wrap"><canvas id="chCitta"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblCitta"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chCitta', sorted.slice(0, 20).map(e => e[0]), sorted.slice(0, 20).map(e => e[1].ente), '#ec4899', true);

  buildTbl('tblCitta',
    ['Citta', 'Comm.', 'Importo Ente'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ente), val: v.ente }
    ]),
    ['str', 'num', 'num'],
    { clickField: 'citta' }
  );
}

/* ── Avanzamento ── */
function renderAvanzamento() {
  const el = document.getElementById('sec-avanzamento');
  const f = filtered;
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

  // Cross Status x Stato Lav
  const lavG = {};
  f.forEach(c => { const k = c.statoLav || 'N/D'; lavG[k] = (lavG[k] || 0) + 1; });
  const lavSorted = Object.entries(lavG).sort((a, b) => b[1] - a[1]);

  let h = '<div class="sec"><h3 class="sec-title">Avanzamento & Stato Lavorazione</h3>';
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione Avanzamento</h4><div class="chart-wrap"><canvas id="chAvz"></canvas></div></div>';
  h += '<div class="card"><h4>Stato Lavorazione</h4><div class="tbl-scroll"><table id="tblLav"></table></div></div>';
  h += '</div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chAvz', Object.keys(bins), Object.values(bins), '#3b82f6', false);

  buildTbl('tblLav',
    ['Stato Lavorazione', 'Comm.', '%'],
    lavSorted.map(([k, v]) => [
      { display: tagLav(k), val: k },
      { display: fmt(v), val: v },
      { display: pct(v, f.length), val: v / f.length * 100 }
    ]),
    ['str', 'num', 'num'],
    { clickField: 'statoLav' }
  );
}

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  const f = filtered;
  const alerts = [];

  const sospesi = f.filter(c => c.statoLav.includes('SOSPESO'));
  if (sospesi.length) alerts.push({ tipo: 'Sospesi', cnt: sospesi.length, desc: 'Commesse con stato lavorazione SOSPESO', items: sospesi });

  const bloccati = f.filter(c => c.statoLav.includes('BLOCCATO'));
  if (bloccati.length) alerts.push({ tipo: 'Bloccati', cnt: bloccati.length, desc: 'Commesse con stato BLOCCATO', items: bloccati });

  const noAvz = f.filter(c => c.avanzamento === 0 && c.status === 'Eseguito');
  if (noAvz.length) alerts.push({ tipo: 'Eseguiti 0% avanzamento', cnt: noAvz.length, desc: 'Commesse eseguite ma con avanzamento a 0%', items: noAvz });

  const highEnte = f.filter(c => c.importoEnte > 15000);
  if (highEnte.length) alerts.push({ tipo: 'Importo alto (>15K)', cnt: highEnte.length, desc: 'Commesse con importo ente superiore a €15.000', items: highEnte });

  let h = '<div class="sec"><h3 class="sec-title">Alert & Anomalie</h3>';
  if (alerts.length === 0) {
    h += '<div class="card"><p style="color:var(--green);text-align:center;padding:20px">Nessun alert</p></div>';
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
    const rows = document.querySelectorAll('#tblAlert tbody tr');
    rows.forEach((row, i) => {
      row.classList.add('clickable');
      row.onclick = () => drillDownItems(alerts[i].tipo, alerts[i].items);
    });
  }
}
