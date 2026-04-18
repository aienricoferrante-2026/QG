/* ── Sidebar Toggle ── */

function toggleSidebar() {
  document.body.classList.toggle('sidebar-collapsed');
  const btn = document.getElementById('sidebarToggle');
  if (btn) btn.innerHTML = document.body.classList.contains('sidebar-collapsed') ? '&#9776;' : '&times;';
  // Ridisegna i grafici dopo il cambio di spazio
  setTimeout(() => {
    if (typeof renderCurrentSection === 'function') renderCurrentSection();
  }, 220);
}

/* ── Sezione Economico & Finanziario ── */

function renderEconFin() {
  const el = document.getElementById('sec-econFin');
  const f = filtered;

  // ── Dati ECONOMICI ──
  const ricavi = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = f.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = f.reduce((s, c) => s + (c.mol || 0), 0);
  const ore = f.reduce((s, c) => s + (c.ore || 0), 0);
  const marginePct = ricavi ? (mol / ricavi * 100) : 0;
  const costoOra = ore ? (costi / ore) : 0;
  const ricavoOra = ore ? (ricavi / ore) : 0;

  // ── Dati FINANZIARI ──
  const incassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const daIncassare = f.reduce((s, c) => s + (c.daIncassare || 0), 0);
  const totRicevutoRegione = f.reduce((s, c) => s + (c.totRicevutoRegione || 0), 0);
  const anticipi = f.reduce((s, c) => s + (c.anticipoImporto || 0), 0);
  const saldi = f.reduce((s, c) => s + (c.saldoImporto || 0), 0);
  const incassatoPct = ricavi ? (incassato / ricavi * 100) : 0;

  let h = '<div class="sec"><h3 class="sec-title">Economico & Finanziario</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Analisi reddituale (Ricavi/Costi/MOL) e finanziaria (Incassato/Da Incassare) per Società, Cliente e Responsabile.</p>';

  // ═══ DATI ECONOMICI ═══
  h += '<h4 style="font-size:13px;font-weight:700;color:var(--accent);margin:8px 0 10px 0;padding-left:2px;border-left:3px solid var(--accent);padding:4px 8px">REDDITUALE (Conto Economico)</h4>';
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Ricavi Totali</div><div class="kpi-value">' + fmtK(ricavi) + '</div><div class="kpi-sub">' + fmtE(ricavi) + '</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costi Totali</div><div class="kpi-value">' + fmtK(costi) + '</div><div class="kpi-sub">' + pct(costi, ricavi) + ' dei ricavi</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">MOL (Margine)</div><div class="kpi-value">' + fmtK(mol) + '</div><div class="kpi-sub">Margine: ' + marginePct.toFixed(1) + '%</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Ore Lavorate</div><div class="kpi-value">' + fmt(ore) + '</div><div class="kpi-sub">media ' + fmt(Math.round(ore / (f.length || 1))) + '/commessa</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Ricavo / Ora</div><div class="kpi-value">' + fmtE(ricavoOra) + '</div><div class="kpi-sub">medio</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Costo / Ora</div><div class="kpi-value">' + fmtE(costoOra) + '</div><div class="kpi-sub">medio</div></div>';
  h += '</div>';

  // Grafico Ricavi vs Costi vs MOL per Società
  h += '<div class="row2">';
  h += '<div class="card"><h4>Ricavi vs Costi vs MOL per Società</h4><div class="chart-wrap"><canvas id="chEconSoc"></canvas></div></div>';
  h += '<div class="card"><h4>Margine % per Società (top 10)</h4><div class="chart-wrap"><canvas id="chEconMarg"></canvas></div></div>';
  h += '</div>';

  // ═══ DATI FINANZIARI ═══
  h += '<h4 style="font-size:13px;font-weight:700;color:var(--green);margin:20px 0 10px 0;padding:4px 8px;border-left:3px solid var(--green)">FINANZIARIO (Cassa)</h4>';
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green"><div class="kpi-label">Già Incassato</div><div class="kpi-value">' + fmtK(incassato) + '</div><div class="kpi-sub">' + incassatoPct.toFixed(1) + '% dei ricavi</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Da Incassare</div><div class="kpi-value">' + fmtK(daIncassare) + '</div><div class="kpi-sub">' + pct(daIncassare, ricavi) + ' dei ricavi</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Anticipi Ricevuti</div><div class="kpi-value">' + fmtK(anticipi) + '</div><div class="kpi-sub">' + pct(anticipi, ricavi) + '</div></div>';
  h += '<div class="kpi purple"><div class="kpi-label">Saldi da Ricevere</div><div class="kpi-value">' + fmtK(saldi) + '</div><div class="kpi-sub">' + pct(saldi, ricavi) + '</div></div>';
  h += '<div class="kpi blue"><div class="kpi-label">Ricevuto da Regione</div><div class="kpi-value">' + fmtK(totRicevutoRegione) + '</div><div class="kpi-sub">contributi pubblici</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Esposizione</div><div class="kpi-value">' + fmtK(ricavi - incassato) + '</div><div class="kpi-sub">credito aperto</div></div>';
  h += '</div>';

  // Grafico Incassato vs Da Incassare per Società
  h += '<div class="row2">';
  h += '<div class="card"><h4>Incassato vs Da Incassare per Società</h4><div class="chart-wrap"><canvas id="chFinSoc"></canvas></div></div>';
  h += '<div class="card"><h4>Top 10 Clienti per Credito Aperto</h4><div class="chart-wrap"><canvas id="chFinCli"></canvas></div></div>';
  h += '</div>';

  // ═══ TABELLA SOCIETÀ COMPLETA ═══
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Economico-Finanziario per Società</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Clicca su una riga per il drill-down della società.</p>';
  h += '<div class="tbl-scroll"><table id="tblEconFin"></table></div></div>';

  // ═══ TABELLA CLIENTI ═══
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo per Cliente / Ente Finanziatore</h4>';
  h += '<div class="tbl-scroll"><table id="tblEconCli"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Aggrega per Società ──
  const socG = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!socG[k]) socG[k] = { cnt: 0, ric: 0, cos: 0, mol: 0, ore: 0, inc: 0, dInc: 0, ant: 0, sal: 0 };
    socG[k].cnt++;
    socG[k].ric += (c.consulenza || 0);
    socG[k].cos += (c.costi || 0);
    socG[k].mol += (c.mol || 0);
    socG[k].ore += (c.ore || 0);
    socG[k].inc += (c.giaIncassato || 0);
    socG[k].dInc += (c.daIncassare || 0);
    socG[k].ant += (c.anticipoImporto || 0);
    socG[k].sal += (c.saldoImporto || 0);
  });
  const socSorted = Object.entries(socG).sort((a, b) => b[1].ric - a[1].ric);

  // Grafico Ricavi/Costi/MOL per Società (top 10)
  const top10 = socSorted.slice(0, 10);
  makeBarStacked('chEconSoc',
    top10.map(e => e[0].length > 20 ? e[0].substring(0, 18) + '..' : e[0]),
    [
      { label: 'Costi', data: top10.map(e => e[1].cos), backgroundColor: '#ef4444cc', borderRadius: 4 },
      { label: 'MOL', data: top10.map(e => e[1].mol), backgroundColor: '#10b981cc', borderRadius: 4 }
    ]
  );

  // Margine % per Società (top 10)
  makeBar('chEconMarg',
    top10.map(e => e[0].length > 20 ? e[0].substring(0, 18) + '..' : e[0]),
    top10.map(e => e[1].ric ? (e[1].mol / e[1].ric * 100) : 0),
    '#10b981', true
  );

  // Incassato vs Da Incassare (top 10 per credito)
  const byCredito = [...socSorted].sort((a, b) => (b[1].ric - b[1].inc) - (a[1].ric - a[1].inc)).slice(0, 10);
  makeBarStacked('chFinSoc',
    byCredito.map(e => e[0].length > 20 ? e[0].substring(0, 18) + '..' : e[0]),
    [
      { label: 'Incassato', data: byCredito.map(e => e[1].inc), backgroundColor: '#10b981cc', borderRadius: 4 },
      { label: 'Da Incassare', data: byCredito.map(e => e[1].dInc), backgroundColor: '#f59e0bcc', borderRadius: 4 }
    ]
  );

  // Top 10 Clienti per credito aperto (ricavi - incassato)
  const cliG = {};
  f.forEach(c => {
    const k = (c.cliente || 'N/D').replace(/_FOR/g, '').trim();
    if (!cliG[k]) cliG[k] = { ric: 0, inc: 0 };
    cliG[k].ric += (c.consulenza || 0);
    cliG[k].inc += (c.giaIncassato || 0);
  });
  const cliSorted = Object.entries(cliG)
    .map(([k, v]) => [k, { ...v, credito: v.ric - v.inc }])
    .filter(e => e[1].credito > 0)
    .sort((a, b) => b[1].credito - a[1].credito)
    .slice(0, 10);
  makeBar('chFinCli',
    cliSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]),
    cliSorted.map(e => e[1].credito),
    '#ef4444', true
  );

  // Tabella Società
  buildTbl('tblEconFin',
    ['Società', 'Comm.', 'Ricavi', 'Costi', 'MOL', 'Margine %', 'Incassato', 'Da Incassare', '% Inc.', 'Ore'],
    socSorted.map(([k, v]) => [
      { display: k.length > 40 ? k.substring(0, 38) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.cos), val: v.cos },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.ric ? (v.mol / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.mol / v.ric * 100 : 0 },
      { display: fmtE(v.inc), val: v.inc },
      { display: fmtE(v.dInc), val: v.dInc },
      { display: v.ric ? (v.inc / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.inc / v.ric * 100 : 0 },
      { display: fmt(v.ore), val: v.ore }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'societa' }
  );

  // Tabella Clienti
  const cliFull = {};
  f.forEach(c => {
    const k = (c.cliente || 'N/D').replace(/_FOR/g, '').trim();
    if (!cliFull[k]) cliFull[k] = { cnt: 0, ric: 0, cos: 0, mol: 0, inc: 0, dInc: 0 };
    cliFull[k].cnt++;
    cliFull[k].ric += (c.consulenza || 0);
    cliFull[k].cos += (c.costi || 0);
    cliFull[k].mol += (c.mol || 0);
    cliFull[k].inc += (c.giaIncassato || 0);
    cliFull[k].dInc += (c.daIncassare || 0);
  });
  const cliFullSorted = Object.entries(cliFull).sort((a, b) => b[1].ric - a[1].ric);
  buildTbl('tblEconCli',
    ['Cliente / Ente', 'Comm.', 'Ricavi', 'MOL', 'Margine %', 'Incassato', 'Da Incassare', 'Credito Aperto'],
    cliFullSorted.map(([k, v]) => [
      { display: k.length > 40 ? k.substring(0, 38) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.ric ? (v.mol / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.mol / v.ric * 100 : 0 },
      { display: fmtE(v.inc), val: v.inc },
      { display: fmtE(v.dInc), val: v.dInc },
      { display: fmtE(v.ric - v.inc), val: v.ric - v.inc }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}
