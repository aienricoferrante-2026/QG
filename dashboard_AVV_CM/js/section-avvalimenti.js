/* ── Sezione AVV-specifica: Avvalimenti ──
 * Caso 2 governance (fork interno BU): vive in dashboard_AVV_CM/js/.
 * Riusa fmt/fmtE/fmtK/makeBar/makeDonut/buildTbl/qnetBtn/drillDownItems del kit.
 *
 * I metadati avvalimento (Categoria SOA, Tipo, CIG, Anno) sono estratti
 * dal Titolo via tools/avv_parser.py durante la conversione Excel → JSON.
 * Copertura osservata sui 328 record:
 *   - Tipo:        ~95% (Standard / Manifestazione / Pacchetto / RTI)
 *   - Anno:        ~40% (i titoli più vecchi non lo riportano)
 *   - Categoria:   ~18% (60 record, OG/OS dell'Albo SOA)
 *   - CIG:         ~6%  (solo se presente nel Titolo)
 */

const AVV_PALETTE = [
  '#a78bfa', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981',
  '#84cc16', '#fbbf24', '#f59e0b', '#fb7185', '#ec4899'
];
const AVV_TIPO_COLOR = {
  'Standard':       '#a78bfa',
  'Manifestazione': '#06b6d4',
  'Pacchetto':      '#10b981',
  'RTI':            '#fbbf24',
};

function _avvN(v) {
  return (v && String(v).trim()) ? String(v).trim() : 'N/D';
}

function _avvAggrTipo(items) {
  const g = {};
  items.forEach(c => {
    const k = _avvN(c.avvTipo);
    if (!g[k]) g[k] = { cnt: 0, cons: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
  });
  return g;
}

function _avvAggrCategoria(items) {
  /* Aggrega per categoria SOA. Una commessa con multi-categoria
     (es. "OG1 + OS4") conta in entrambi. Le N/D sono escluse dal grafico. */
  const g = {};
  items.forEach(c => {
    const cats = Array.isArray(c.avvCategorie) && c.avvCategorie.length
      ? c.avvCategorie : ['N/D'];
    cats.forEach(k => {
      if (!g[k]) g[k] = { cnt: 0, cons: 0 };
      g[k].cnt++;
      g[k].cons += (c.consulenza || 0);
    });
  });
  return g;
}

function _avvAggrAnno(items) {
  const g = {};
  items.forEach(c => {
    const k = c.avvAnno || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
  });
  return g;
}

function renderAvvalimenti() {
  const el = document.getElementById('sec-avvalimenti');
  if (!el) return;
  const f = filtered;

  const tipoG = _avvAggrTipo(f);
  const catG = _avvAggrCategoria(f);
  const annoG = _avvAggrAnno(f);

  // KPI macro
  const conCIG = f.filter(c => c.avvCIG).length;
  const conCat = f.filter(c => c.avvCategoria).length;
  const conRTI = f.filter(c => c.avvTipo === 'RTI').length;
  const manif = f.filter(c => c.avvTipo === 'Manifestazione').length;
  const pacchetti = f.filter(c => c.avvTipo === 'Pacchetto').length;

  let h = '<div class="sec"><h3 class="sec-title">Avvalimenti · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Metadati estratti dal campo <i>Titolo</i> (parser <code>avv_parser.py</code>): ' +
       'Categoria SOA (OG/OS), Tipo (Standard/RTI/Manifestazione/Pacchetto), CIG, Anno. ' +
       'Copertura limitata sulle categorie (~18%) perché molti titoli non le esplicitano.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse AVV</div><div class="kpi-value">' + fmt(f.length) + '</div><div class="kpi-sub">filtro corrente</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Con Categoria SOA</div><div class="kpi-value">' + fmt(conCat) + '</div><div class="kpi-sub">OG/OS estratta</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Manifestazioni</div><div class="kpi-value">' + fmt(manif) + '</div><div class="kpi-sub">interesse</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Pacchetti</div><div class="kpi-value">' + fmt(pacchetti) + '</div><div class="kpi-sub">avvalimento</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">RTI</div><div class="kpi-value">' + fmt(conRTI) + '</div><div class="kpi-sub">raggruppamenti</div></div>';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_avvDrillCIG()"><div class="kpi-label">Con CIG</div><div class="kpi-value">' + fmt(conCIG) + '</div><div class="kpi-sub">clicca per elenco</div></div>';
  h += '</div>';

  // Trend annuale + Tipo
  h += '<div class="row2">';
  h += '<div class="card"><h4>Trend per Anno</h4><div class="chart-wrap"><canvas id="chAvvAnno"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione per Tipo</h4><div class="chart-wrap"><canvas id="chAvvTipo"></canvas></div></div>';
  h += '</div>';

  // Categorie SOA
  h += '<div class="card" style="margin-top:14px"><h4>Distribuzione per Categoria SOA (esclude N/D)</h4>';
  h += '<div class="chart-wrap"><canvas id="chAvvCat"></canvas></div></div>';

  // Tabella dettaglio (per Categoria)
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio commesse · clicca un titolo per aprire la commessa in Qnet</h4>';
  h += '<div class="tbl-scroll"><table id="tblAvvDettaglio"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // Chart Anno (bar)
  const anni = Object.keys(annoG).filter(k => k !== 'N/D').sort();
  const annoLabels = anni;
  const annoVals = anni.map(k => annoG[k].cnt);
  makeBar('chAvvAnno', annoLabels, annoVals, '#3b82f6', false);

  // Chart Tipo (donut)
  const tipiKnown = ['Standard', 'Manifestazione', 'Pacchetto', 'RTI', 'N/D'];
  const tipiPresenti = tipiKnown.filter(k => tipoG[k] && tipoG[k].cnt > 0);
  makeDonut('chAvvTipo',
    tipiPresenti,
    tipiPresenti.map(k => tipoG[k].cnt),
    tipiPresenti.map(k => AVV_TIPO_COLOR[k] || '#64748b')
  );

  // Chart Categoria (bar — esclude N/D che sarebbe la barra dominante)
  const catEntries = Object.entries(catG).filter(([k]) => k !== 'N/D')
    .sort((a, b) => b[1].cnt - a[1].cnt);
  const catLabels = catEntries.map(e => e[0]);
  const catVals = catEntries.map(e => e[1].cnt);
  makeBar('chAvvCat', catLabels, catVals, '#a78bfa', true);

  // Tabella dettaglio (max 50 righe)
  const rows = f.slice(0, 100).map(c => [
    { display: (c.titolo || '—').length > 55 ? (c.titolo || '').substring(0, 53) + '…' : (c.titolo || '—'), val: c.titolo || '' },
    { display: c.avvCategoria || '—', val: c.avvCategoria || '' },
    { display: c.avvTipo || '—', val: c.avvTipo || '' },
    { display: c.avvCIG || '—', val: c.avvCIG || '' },
    { display: c.avvAnno || '—', val: c.avvAnno || '' },
    { display: (c.cliente || '—').substring(0, 35), val: c.cliente || '' },
    { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
    { display: qnetBtn(c), val: c.id }
  ]);
  buildTbl('tblAvvDettaglio',
    ['Titolo', 'Categoria', 'Tipo', 'CIG', 'Anno', 'Cliente', 'Importo', 'Qnet'],
    rows,
    ['str', 'str', 'str', 'str', 'num', 'str', 'num', 'str']
  );
}

/* Handler drill-down KPI "Con CIG" → modal con elenco. */
function _avvDrillCIG() {
  const list = filtered.filter(c => c.avvCIG);
  if (typeof drillDownItems === 'function') drillDownItems('Avvalimenti con CIG (' + list.length + ')', list);
}
