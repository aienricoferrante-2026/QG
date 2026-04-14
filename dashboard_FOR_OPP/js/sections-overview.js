/* ── Executive Summary & Pipeline ── */

const OPP_EXCEL_FIELDS = [
  { excel: 'ID', json: 'id', mapped: true, use: 'Identificativo' },
  { excel: 'Data', json: 'data', mapped: true, use: 'Data creazione' },
  { excel: 'Titolo', json: 'titolo', mapped: true, use: 'Titolo opportunità' },
  { excel: 'Status', json: 'status', mapped: true, use: 'Filtro, KPI, donut, drill-down' },
  { excel: 'Stato Preventivo', json: 'statoPrev', mapped: true, use: 'Filtro, KPI, donut, pipeline' },
  { excel: 'Stato corso di formazione', json: 'statoCorso', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Corso', json: 'corso', mapped: true, use: 'Filtro, sezione Corsi, drill-down' },
  { excel: 'Corso di interesse', json: 'corsoInteresse', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Tipologia Corso', json: 'tipologiaCorso', mapped: true, use: 'Filtro, sezione Corsi' },
  { excel: 'Operatore', json: 'operatore', mapped: true, use: 'Filtro, sezione Operatori' },
  { excel: 'Assegnato a', json: 'assegnatoA', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'CPI', json: 'cpi', mapped: true, use: 'Filtro, sezione CPI, drill-down' },
  { excel: 'Città', json: 'citta', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Provincia', json: 'provincia', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Società / Sedi', json: 'sede', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Sede Operativa', json: 'sedeOp', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Società Aziendale', json: 'societa', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Rendicontazione', json: 'rendicontazione', mapped: true, use: 'Filtro, sezione Rendicontazione' },
  { excel: 'Fonte', json: 'fonte', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Annualità', json: 'annualita', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Ultima Nota', json: 'ultimaNota', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Ultima Nota', json: 'dataUltimaNota', mapped: true, partial: true, use: 'Presente nel JSON' }
];

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  const f = filtered;
  const cnt = f.length;
  const nuove = f.filter(c => c.status === 'Nuova').length;
  const attesa = f.filter(c => c.status === 'Attesa Pro-forma').length;
  const accettate = f.filter(c => c.status === 'Accettato').length;
  const perse = f.filter(c => c.status === 'Persa').length;

  // Status distribution
  const statusG = {};
  f.forEach(c => { const k = c.status || 'N/D'; statusG[k] = (statusG[k] || 0) + 1; });

  // Stato Preventivo distribution
  const prevG = {};
  f.forEach(c => { const k = c.statoPrev || 'N/D'; prevG[k] = (prevG[k] || 0) + 1; });

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary</h3>';

  // Top KPIs
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Totale Opportunità</h4><div style="font-size:28px;font-weight:700">' + fmt(cnt) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">di ' + fmt(D.length) + ' totali</div></div>';
  h += '<div class="card"><h4>Tasso Accettazione</h4><div style="font-size:28px;font-weight:700;color:var(--green)">' + pct(accettate, cnt) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(accettate) + ' accettate</div></div>';
  h += '<div class="card"><h4>Tasso Perdita</h4><div style="font-size:28px;font-weight:700;color:var(--orange)">' + pct(perse, cnt) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(perse) + ' perse</div></div>';
  h += '</div>';

  // Charts row
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Status</h4><div class="chart-wrap"><canvas id="chExStatus"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione per Stato Preventivo</h4><div class="chart-wrap"><canvas id="chExPrev"></canvas></div></div>';
  h += '</div>';

  // Top corsi & tipologia
  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 Corsi</h4><div class="chart-wrap"><canvas id="chExCorsi"></canvas></div></div>';
  h += '<div class="card"><h4>Per Tipologia Corso</h4><div class="chart-wrap"><canvas id="chExTipo"></canvas></div></div>';
  h += '</div>';

  // Campi Dati
  h += '<div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h += '<h4>Campi Dati Importati</h4>';
  h += '<span class="badge">' + OPP_EXCEL_FIELDS.filter(f2 => f2.mapped).length + '/' + OPP_EXCEL_FIELDS.length + ' utilizzati</span>';
  h += '</div>';
  h += '<div class="tbl-scroll"><table id="tblCampi"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // Charts
  makeDonut('chExStatus', Object.keys(statusG), Object.values(statusG),
    Object.keys(statusG).map(k => STATUS_COLORS[k] || '#64748b'));

  makeDonut('chExPrev', Object.keys(prevG), Object.values(prevG),
    Object.keys(prevG).map(k => PREV_COLORS[k] || '#64748b'));

  // Top corsi
  const corsiG = {};
  f.forEach(c => { const k = c.corso || 'N/D'; corsiG[k] = (corsiG[k] || 0) + 1; });
  const corsiSorted = Object.entries(corsiG).sort((a, b) => b[1] - a[1]).slice(0, 15);
  makeBar('chExCorsi',
    corsiSorted.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    corsiSorted.map(e => e[1]), '#3b82f6', true);

  // Tipologia
  const tipoG = {};
  f.forEach(c => { const k = c.tipologiaCorso || 'N/D'; tipoG[k] = (tipoG[k] || 0) + 1; });
  const tipoSorted = Object.entries(tipoG).sort((a, b) => b[1] - a[1]);
  makeBar('chExTipo', tipoSorted.map(e => e[0]), tipoSorted.map(e => e[1]), '#8b5cf6', true);

  // Campi table
  buildTbl('tblCampi', ['#', 'Colonna Excel', 'Stato', 'Campo JSON', 'Utilizzo Dashboard'],
    OPP_EXCEL_FIELDS.map((f2, i) => [
      { display: i + 1, val: i + 1 },
      { display: '<strong>' + f2.excel + '</strong>', val: f2.excel },
      { display: f2.mapped ? (f2.partial ? '<span class="tag tag-yellow">Parziale</span>'
        : '<span class="tag tag-green">Usato</span>')
        : '<span class="tag tag-red">Non usato</span>', val: f2.mapped ? (f2.partial ? 1 : 2) : 0 },
      { display: '<code>' + f2.json + '</code>', val: f2.json },
      f2.use
    ]),
    ['num', 'str', 'num', 'str', 'str']
  );
}

/* ── Pipeline ── */
function renderPipeline() {
  const el = document.getElementById('sec-pipeline');
  const f = filtered;

  // Cross-tab: Stato Preventivo × Status
  const prevKeys = [...new Set(f.map(c => c.statoPrev || 'N/D'))].sort();
  const statusKeys = [...new Set(f.map(c => c.status || 'N/D'))].sort();
  const colors = ['#3b82f6cc', '#10b981cc', '#f59e0bcc', '#ef4444cc', '#8b5cf6cc', '#06b6d4cc'];

  const datasets = statusKeys.map((sk, i) => ({
    label: sk,
    data: prevKeys.map(pk => f.filter(c => (c.statoPrev || 'N/D') === pk && (c.status || 'N/D') === sk).length),
    backgroundColor: STATUS_COLORS[sk] ? STATUS_COLORS[sk] + 'cc' : colors[i % colors.length],
    borderRadius: 4
  }));

  let h = '<div class="sec"><h3 class="sec-title">Pipeline: Stato Preventivo &times; Status</h3>';
  h += '<div class="card"><h4>Distribuzione</h4><div class="chart-wrap"><canvas id="chPipeline"></canvas></div></div>';

  // Detail table
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio Pipeline</h4><div class="tbl-scroll"><table id="tblPipeline"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBarStacked('chPipeline', prevKeys, datasets);

  // Table: Stato Preventivo rows with status columns
  const hdrs = ['Stato Preventivo', ...statusKeys, 'Totale'];
  const rows = prevKeys.map(pk => {
    const items = f.filter(c => (c.statoPrev || 'N/D') === pk);
    const cells = [{ display: pk, val: pk }];
    statusKeys.forEach(sk => {
      const n = items.filter(c => (c.status || 'N/D') === sk).length;
      cells.push({ display: n ? fmt(n) : '-', val: n });
    });
    cells.push({ display: '<strong>' + fmt(items.length) + '</strong>', val: items.length });
    return cells;
  });
  buildTbl('tblPipeline', hdrs, rows,
    ['str', ...statusKeys.map(() => 'num'), 'num'],
    { clickField: 'statoPrev' });
}
