/* ── Sezioni: Executive Summary, Ricavi & MOL (core multi-settore) ── */

const STATUS_COLORS_CORE = {
  'Eseguito': '#10b981', 'Concluso': '#10b981',
  'Annullato': '#ef4444',
  'Pianificato': '#3b82f6', 'In corso': '#06b6d4',
  'Da pianificare': '#f59e0b', 'In attesa': '#f59e0b',
  'Sospeso': '#8b5cf6'
};

function _buildMonthlyTrendCore(items) {
  const byMonth = new Map();
  items.forEach(c => {
    const raw = c.dataInizio || c.dataPianInizio;
    const m = String(raw || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return;
    const key = parseInt(m[3]) * 100 + parseInt(m[2]);
    byMonth.set(key, (byMonth.get(key) || 0) + (c.consulenza || 0));
  });
  const sortedKeys = [...byMonth.keys()].sort();
  const last12 = sortedKeys.slice(-12);
  const labels = last12.map(k => String(k % 100).padStart(2, '0') + '/' + String(Math.floor(k / 100)).slice(-2));
  const values = last12.map(k => byMonth.get(k));
  return { labels, values };
}

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  if (!el) return;
  const f = filtered;
  const cnt = f.length;
  const cons = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = f.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = f.reduce((s, c) => s + (c.mol || 0), 0);
  const incassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const residuo = f.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
  const margPct = cons ? (mol / cons * 100) : 0;
  const incPct = cons ? (incassato / cons * 100) : 0;
  const aperte = f.filter(isOpen).length;
  const chiuse = f.filter(isClosed).length;

  // Distribuzioni
  const statusG = {};
  f.forEach(c => { const k = c.status || 'N/D'; statusG[k] = (statusG[k] || 0) + 1; });
  const statoLavG = {};
  f.forEach(c => { if (c.statoLav) { statoLavG[c.statoLav] = (statoLavG[c.statoLav] || 0) + 1; } });

  // Alert
  const molNeg = f.filter(c => (c.mol || 0) < 0 && (c.consulenza || 0) > 0);
  const senzaIncasso = f.filter(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0);

  const trend = _buildMonthlyTrendCore(f);

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       '5 KPI macro + 4 grafici di overview. Per analisi flessibili usa <strong>🔍 Esplora</strong> nella sidebar.</p>';

  /* KPI macro cliccabili: ogni numero apre il modale con il sottoinsieme
     di commesse corrispondente. */
  const clkExec = (title, pred) => 'onclick="drillFiltered(\'' + title.replace(/'/g, "\\'") + "', " + pred + ')" style="cursor:pointer" title="Clicca per vedere le commesse"';
  const pAll   = "c => true";
  const pOpen  = "c => isOpen(c)";
  const pMolNeg = "c => (c.mol||0) < 0 && (c.consulenza||0) > 0";
  const pCredito = "c => (c.consulenza||0) - (c.giaIncassato||0) > 0";
  const pSenzaInc = "c => (c.giaIncassato||0) === 0 && (c.consulenza||0) > 0";

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" ' + clkExec('Commesse · ' + sectorLabel(), pAll) + '><div class="kpi-label">Commesse Totali ›</div><div class="kpi-value">' + fmt(cnt) + '</div><div class="kpi-sub">' + fmt(aperte) + ' aperte · ' + fmt(chiuse) + ' chiuse</div></div>';
  h += '<div class="kpi green" ' + clkExec('Commesse aperte', pOpen) + '><div class="kpi-label">Ricavi Totali ›</div><div class="kpi-value">' + fmtK(cons) + '</div><div class="kpi-sub">' + fmtE(cons) + '</div></div>';
  h += '<div class="kpi cyan" ' + clkExec('Commesse con MOL negativo', pMolNeg) + '><div class="kpi-label">Margine MOL</div><div class="kpi-value">' + margPct.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(mol) + ' su ' + fmtK(cons) + (molNeg.length ? ' · <span style="color:#ef4444">' + molNeg.length + ' negativi ›</span>' : '') + '</div></div>';
  h += '<div class="kpi orange" ' + clkExec('Commesse senza incasso', pSenzaInc) + '><div class="kpi-label">% Incasso</div><div class="kpi-value">' + incPct.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(incassato) + ' incassati · ' + (senzaIncasso.length ? '<span style="color:#f59e0b">' + senzaIncasso.length + ' a 0 ›</span>' : 'tutto incassato') + '</div></div>';
  h += '<div class="kpi pink" ' + clkExec('Credito aperto', pCredito) + '><div class="kpi-label">Esposizione ›</div><div class="kpi-value">' + fmtK(residuo) + '</div><div class="kpi-sub">credito aperto</div></div>';
  h += '</div>';

  /* 4 chart riassuntivi · Trend + Regioni + Status + Stato Lav.
     Niente "Alert prioritari" (sono in /alert) né chart Clienti/Società
     (sono in Esplora coi preset). */
  h += '<div class="row2">';
  h += '<div class="card"><h4>Trend Ricavi mensile (ultimi ' + trend.labels.length + ' mesi)</h4>' +
       '<div class="chart-wrap"><canvas id="chExTrend"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Regione</h4>' +
       '<div class="chart-wrap"><canvas id="chExReg"></canvas></div></div>';
  h += '</div>';

  h += '<div class="row2" style="margin-top:14px">';
  h += '<div class="card"><h4>Distribuzione per Status</h4>' +
       '<div class="chart-wrap"><canvas id="chExStatus"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione per Stato Lavorazione</h4>' +
       '<div class="chart-wrap"><canvas id="chExLav"></canvas></div></div>';
  h += '</div>';

  /* Mini-banner: link rapidi alle sezioni successive */
  h += '<div class="card" style="margin-top:14px;padding:12px 16px;background:rgba(99,102,241,.05)">';
  h += '<h4 style="margin:0 0 8px 0;font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">Continua l\'analisi</h4>';
  h += '<div style="display:flex;gap:10px;flex-wrap:wrap;font-size:12px">';
  h += '<a onclick="showSec(\'explore\')" style="cursor:pointer;color:var(--accent);text-decoration:underline">🔍 Esplora multi-livello</a>';
  h += '<a onclick="showSec(\'econFin\')" style="cursor:pointer;color:var(--accent);text-decoration:underline">📊 Econ. &amp; Finanziario</a>';
  h += '<a onclick="showSec(\'analisiIncassi\')" style="cursor:pointer;color:var(--accent);text-decoration:underline">💵 Incassi &amp; Crediti</a>';
  h += '<a onclick="showSec(\'alert\')" style="cursor:pointer;color:var(--accent);text-decoration:underline">⚠️ Alert &amp; Anomalie</a>';
  if (molNeg.length || senzaIncasso.length) {
    h += '<span style="color:var(--text3)">·</span>';
    if (molNeg.length) h += '<span style="color:#ef4444">' + molNeg.length + ' MOL negativo</span>';
    if (senzaIncasso.length) h += '<span style="color:#f59e0b">' + senzaIncasso.length + ' senza incasso</span>';
  }
  h += '</div></div>';

  h += '</div>';
  el.innerHTML = h;

  makeBar('chExTrend', trend.labels, trend.values, '#6366f1', false);

  const regG = {};
  f.forEach(c => { const k = c.regione || 'N/D'; regG[k] = (regG[k] || 0) + (c.consulenza || 0); });
  const regSorted = Object.entries(regG).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
  makeBar('chExReg', regSorted.map(e => e[0]), regSorted.map(e => e[1]), '#10b981', true);

  makeDonut('chExStatus', Object.keys(statusG), Object.values(statusG),
    Object.keys(statusG).map(k => STATUS_COLORS_CORE[k] || '#64748b'));

  if (Object.keys(statoLavG).length) {
    makeDonut('chExLav', Object.keys(statoLavG), Object.values(statoLavG),
      Object.keys(statoLavG).map((_, i) => ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899'][i % 7]));
  }
}

/* ── Ricavi & MOL ── */
function renderRicavi() {
  const el = document.getElementById('sec-ricavi');
  if (!el) return;
  const f = filtered;

  const socG = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!socG[k]) socG[k] = { cnt: 0, cons: 0, costi: 0, mol: 0 };
    socG[k].cnt++;
    socG[k].cons += (c.consulenza || 0);
    socG[k].costi += (c.costi || 0);
    socG[k].mol += (c.mol || 0);
  });
  const socSorted = Object.entries(socG).sort((a, b) => b[1].cons - a[1].cons);

  const trendRic = _buildMonthlyTrendCore(f);
  const byMonthCM = new Map();
  f.forEach(c => {
    const raw = c.dataInizio || c.dataPianInizio;
    const m = String(raw || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return;
    const key = parseInt(m[3]) * 100 + parseInt(m[2]);
    if (!byMonthCM.has(key)) byMonthCM.set(key, { cos: 0, mol: 0 });
    const o = byMonthCM.get(key);
    o.cos += (c.costi || 0);
    o.mol += (c.mol || 0);
  });
  const ts = [...byMonthCM.keys()].sort().slice(-12);
  const trendCos = trendRic.labels.map((_, i) => byMonthCM.get(ts[i])?.cos || 0);
  const trendMol = trendRic.labels.map((_, i) => byMonthCM.get(ts[i])?.mol || 0);

  let h = '<div class="sec"><h3 class="sec-title">Ricavi & MOL per Societa</h3>';
  h += '<div class="card"><h4>Trend mensile Ricavi · Costi · MOL (ultimi ' + trendRic.labels.length + ' mesi)</h4>';
  h += '<div class="chart-wrap"><canvas id="chRicTrend"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblRicSoc"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  if (typeof Chart !== 'undefined' && trendRic.labels.length) {
    if (_charts['chRicTrend']) _charts['chRicTrend'].destroy();
    _charts['chRicTrend'] = new Chart(document.getElementById('chRicTrend'), {
      data: {
        labels: trendRic.labels,
        datasets: [
          { type: 'bar', label: 'Ricavi', data: trendRic.values, backgroundColor: '#3b82f6cc', borderRadius: 4, order: 2 },
          { type: 'bar', label: 'Costi', data: trendCos, backgroundColor: '#ef4444cc', borderRadius: 4, order: 2 },
          { type: 'line', label: 'MOL', data: trendMol, borderColor: '#10b981', backgroundColor: '#10b98133', borderWidth: 2, tension: .3, order: 1, pointRadius: 3, pointBackgroundColor: '#10b981' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } },
          tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#475569', borderWidth: 1, padding: 10, callbacks: { label: ctx => ctx.dataset.label + ': ' + fmtE(ctx.raw) } }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(71,85,105,.2)' } },
          y: { ticks: { color: '#64748b', font: { size: 9 }, callback: v => fmtK(v) }, grid: { color: 'rgba(71,85,105,.2)' } }
        }
      }
    });
  }

  buildTbl('tblRicSoc',
    ['Societa', 'Comm.', 'Ricavi', 'Costi', 'MOL', 'Margine %'],
    socSorted.map(([k, v]) => [
      { display: k.length > 35 ? k.substring(0, 33) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.costi), val: v.costi },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.cons ? (v.mol / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.mol / v.cons * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'societa' }
  );
}
