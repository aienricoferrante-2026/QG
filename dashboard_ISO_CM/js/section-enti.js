/* ── Sezione ISO-specifica: Enti di Riferimento ──
 * Caso 2 governance (fork interno BU): vive in dashboard_ISO_CM/js/,
 * riusa fmt/fmtE/fmtK/makeBar/makeDonut/buildTbl/drillDownCustom del kit.
 *
 * Mostra come si distribuiscono le 6.185 commesse ISO tra gli enti
 * certificatori (GC, URSS-UKAS, URSS, CCC, TNV...), con KPI macro,
 * grafici e tabella ordinabile con drill-down.
 */

const ISO_ENTI_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6',
  '#6366f1', '#eab308', '#a78bfa', '#22d3ee', '#fb7185'
];

function _isoNormEnte(v) {
  return (v && String(v).trim()) ? String(v).trim() : 'N/D';
}

function _isoEntiAggr(items) {
  /* Aggrega per Ente: count, ricavi, mol, costi, primary standard. */
  const g = {};
  items.forEach(c => {
    const k = _isoNormEnte(c.isoEnte);
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, inc: 0, std: {}, audit: {} };
    g[k].cnt++;
    g[k].cons  += (c.consulenza   || 0);
    g[k].costi += (c.costi        || 0);
    g[k].mol   += (c.mol          || 0);
    g[k].inc   += (c.giaIncassato || 0);
    const s = c.isoStandard || 'N.D.';
    g[k].std[s] = (g[k].std[s] || 0) + 1;
    const a = c.isoTipoAudit || 'N.D.';
    g[k].audit[a] = (g[k].audit[a] || 0) + 1;
  });
  return g;
}

function _isoTopOf(obj) {
  /* Ritorna la chiave con count massimo, o 'N.D.' se vuoto. */
  const entries = Object.entries(obj);
  if (!entries.length) return 'N.D.';
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function renderEnti() {
  const el = document.getElementById('sec-enti');
  if (!el) return;
  const f = filtered;
  const aggr = _isoEntiAggr(f);

  const enti = Object.entries(aggr).sort((a, b) => b[1].cnt - a[1].cnt);
  const totEnti = enti.length;
  const conAssegnazione = f.filter(c => _isoNormEnte(c.isoEnte) !== 'N/D').length;
  const pctAssegnati = f.length ? (conAssegnazione / f.length * 100) : 0;
  const topEnte = enti[0] || ['—', { cnt: 0, cons: 0 }];
  const ricaviTopEnte = topEnte[1].cons;

  let h = '<div class="sec"><h3 class="sec-title">Enti di Riferimento · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Distribuzione delle commesse ISO per ente certificatore. Le righe senza ente ' +
       'compilato appaiono come <i>N/D</i>.</p>';

  // KPI macro
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Enti Distinti</div><div class="kpi-value">' + fmt(totEnti) + '</div><div class="kpi-sub">incl. N/D</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Con Ente</div><div class="kpi-value">' + pctAssegnati.toFixed(1) + '%</div><div class="kpi-sub">' + fmt(conAssegnazione) + ' di ' + fmt(f.length) + '</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Top Ente</div><div class="kpi-value" style="font-size:18px">' + (topEnte[0].length > 14 ? topEnte[0].substring(0, 12) + '…' : topEnte[0]) + '</div><div class="kpi-sub">' + fmt(topEnte[1].cnt) + ' commesse</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Ricavi Top Ente</div><div class="kpi-value">' + fmtK(ricaviTopEnte) + '</div><div class="kpi-sub">' + topEnte[0] + '</div></div>';
  h += '</div>';

  // Donut + Bar
  h += '<div class="row2">';
  h += '<div class="card"><h4>Commesse per Ente (top 12)</h4><div class="chart-wrap"><canvas id="chEntiDonut"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Ente (top 12)</h4><div class="chart-wrap"><canvas id="chEntiRic"></canvas></div></div>';
  h += '</div>';

  // Tabella ordinabile
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per Ente</h4>';
  h += '<div class="tbl-scroll"><table id="tblEnti"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  // Charts top 12 (gli altri raggruppati come "Altri")
  const top12 = enti.slice(0, 12);
  const altri = enti.slice(12);
  const altriCnt   = altri.reduce((s, e) => s + e[1].cnt,  0);
  const altriRic   = altri.reduce((s, e) => s + e[1].cons, 0);
  const labels = top12.map(e => e[0].length > 18 ? e[0].substring(0, 16) + '…' : e[0]);
  const cnts   = top12.map(e => e[1].cnt);
  const ricavi = top12.map(e => e[1].cons);
  if (altri.length) {
    labels.push('Altri (' + altri.length + ')');
    cnts.push(altriCnt);
    ricavi.push(altriRic);
  }
  const colors = labels.map((_, i) => ISO_ENTI_PALETTE[i % ISO_ENTI_PALETTE.length]);
  makeDonut('chEntiDonut', labels, cnts, colors);
  makeBar('chEntiRic', labels, ricavi, '#3b82f6', true);

  // Tabella ordinabile con drill-down
  buildTbl('tblEnti',
    ['Ente', 'Commesse', 'Ricavi', 'MOL', 'Margine %', '% Incasso', 'Std prevalente', 'Audit prevalente'],
    enti.map(([k, v]) => [
      { display: k.length > 32 ? k.substring(0, 30) + '…' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.mol),  val: v.mol },
      { display: v.cons ? (v.mol / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.mol / v.cons * 100 : 0 },
      { display: v.cons ? (v.inc / v.cons * 100).toFixed(1) + '%' : '-', val: v.cons ? v.inc / v.cons * 100 : 0 },
      { display: _isoTopOf(v.std),   val: _isoTopOf(v.std) },
      { display: _isoTopOf(v.audit), val: _isoTopOf(v.audit) }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'str', 'str'],
    { clickField: 'isoEnte' }
  );
}
