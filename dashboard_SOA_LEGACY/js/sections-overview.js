/* ── Sezioni: Executive Summary, Commerciali, Responsabili ── */

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  const f = filtered;
  const cnt = f.length;
  const ente = f.reduce((s, c) => s + c.importoEnte, 0);
  const eseg = f.filter(c => c.status === 'Eseguito').length;

  // Status distribution
  const statusG = {};
  f.forEach(c => { statusG[c.status] = (statusG[c.status] || 0) + 1; });

  // Stato lavorazione (top groups)
  const lavG = {};
  f.forEach(c => {
    const k = c.statoLav || 'N/D';
    lavG[k] = (lavG[k] || 0) + 1;
  });

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary</h3>';

  h += '<div class="row3">';
  h += '<div class="card"><h4>Importo Ente Totale</h4><div style="font-size:28px;font-weight:700">' + fmtK(ente) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmtE(ente) + '</div></div>';
  h += '<div class="card"><h4>Eseguiti</h4><div style="font-size:28px;font-weight:700;color:var(--green)">' + fmt(eseg) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + pct(eseg, cnt) + ' del totale</div></div>';
  h += '<div class="card"><h4>Citta Coperte</h4><div style="font-size:28px;font-weight:700;color:var(--cyan)">' + new Set(f.map(c => c.citta).filter(Boolean)).size + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + cnt + ' commesse totali</div></div>';
  h += '</div>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Status</h4><div class="chart-wrap"><canvas id="chExStatus"></canvas></div></div>';
  h += '<div class="card"><h4>Top SOA Attestanti (per Importo)</h4><div class="chart-wrap"><canvas id="chExSoa"></canvas></div></div>';
  h += '</div>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 Commerciali (per Commesse)</h4><div class="chart-wrap"><canvas id="chExCommerciali"></canvas></div></div>';
  h += '<div class="card"><h4>Stato Lavorazione</h4><div class="chart-wrap"><canvas id="chExLav"></canvas></div></div>';
  h += '</div>';

  h += '<div class="card"><h4>Top 15 Citta per Importo Ente</h4><div class="tbl-scroll"><table id="tblTopCitta"></table></div></div>';

  // Campi Dati
  h += '<div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h += '<h4>Campi Dati Importati</h4>';
  h += '<span class="badge">' + SOA_EXCEL_FIELDS.filter(f2 => f2.mapped).length + '/' + SOA_EXCEL_FIELDS.length + ' utilizzati</span>';
  h += '</div>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">Colonne presenti nel file Excel e relativo utilizzo nella dashboard. <span class="tag tag-green">Usato</span> = campo analizzato, <span class="tag tag-yellow">Parziale</span> = presente ma non nel dettaglio, <span class="tag tag-red">Non usato</span> = campo non ancora importato.</p>';
  h += '<div class="tbl-scroll"><table id="tblCampi"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // Charts
  const STATUS_COLORS = { 'Eseguito': '#10b981', 'Pianificato': '#3b82f6', 'Da pianificare': '#f59e0b', 'Annullato': '#ef4444' };
  makeDonut('chExStatus', Object.keys(statusG), Object.values(statusG),
    Object.keys(statusG).map(k => STATUS_COLORS[k] || '#64748b'));

  // SOA Attestanti
  const soaG = {};
  f.forEach(c => { const k = c.soaAttestante || 'N/D'; soaG[k] = (soaG[k] || 0) + c.importoEnte; });
  const soaSorted = Object.entries(soaG).sort((a, b) => b[1] - a[1]);
  makeBar('chExSoa', soaSorted.map(e => e[0]), soaSorted.map(e => e[1]), '#8b5cf6', true);

  // Commerciali
  const agG = {};
  f.forEach(c => { const k = c.agente || 'N/D'; agG[k] = (agG[k] || 0) + 1; });
  const agSorted = Object.entries(agG).sort((a, b) => b[1] - a[1]).slice(0, 15);
  makeBar('chExCommerciali', agSorted.map(e => e[0]), agSorted.map(e => e[1]), '#3b82f6', true);

  // Stato lavorazione donut
  const lavSorted = Object.entries(lavG).sort((a, b) => b[1] - a[1]).slice(0, 8);
  makeDonut('chExLav', lavSorted.map(e => shortLav(e[0])), lavSorted.map(e => e[1]), CHART_COLORS);

  // Top citta table
  const cittaG = {};
  f.forEach(c => {
    const k = c.citta || 'N/D';
    if (!cittaG[k]) cittaG[k] = { cnt: 0, ente: 0, eseg: 0 };
    cittaG[k].cnt++;
    cittaG[k].ente += c.importoEnte;
    if (c.status === 'Eseguito') cittaG[k].eseg++;
  });
  const cittaSorted = Object.entries(cittaG).sort((a, b) => b[1].ente - a[1].ente).slice(0, 15);
  buildTbl('tblTopCitta',
    ['Citta', 'Comm.', 'Importo Ente', 'Eseguiti'],
    cittaSorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ente), val: v.ente },
      { display: fmt(v.eseg), val: v.eseg }
    ]),
    ['str', 'num', 'num', 'num'],
    { clickField: 'citta' }
  );

  // Campi Dati table
  buildTbl('tblCampi', ['#', 'Colonna Excel', 'Stato', 'Campo JSON', 'Utilizzo Dashboard'],
    SOA_EXCEL_FIELDS.map((f2, i) => [
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

const SOA_EXCEL_FIELDS = [
  { excel: 'ID', json: 'id', mapped: true, use: 'Identificativo in tabelle e drill-down' },
  { excel: 'ID Contratto', json: 'idContratto', mapped: true, use: 'Riferimento contratto' },
  { excel: 'Cliente', json: 'cliente', mapped: true, use: 'Drill-down, tabelle, KPI' },
  { excel: 'Contatto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Titolo', json: 'titolo', mapped: true, use: 'Dettaglio in tabella modale' },
  { excel: 'Descrizione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Indirizzo', json: 'indirizzo', mapped: true, partial: true, use: 'Presente nel JSON, non in dashboard' },
  { excel: 'Status', json: 'status', mapped: true, use: 'Filtro, KPI, donut, drill-down' },
  { excel: 'Stato Lavorazione', json: 'statoLav', mapped: true, use: 'Filtro, tabelle, alert, avanzamento' },
  { excel: 'Note', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Assegnazione', json: 'dataAssegnazione', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Pian. Inizio', json: 'dataPianInizio', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Chiusura Lavorazione', json: 'dataChiusura', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Fine Lavorazione Presunta', json: 'dataFinePres', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Fine', json: 'dataFine', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Ultima Nota', json: '-', mapped: false, use: 'Non importato (numerico)' },
  { excel: 'Ultima Nota.1', json: 'ultimaNota', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Ultima Nota', json: 'dataUltimaNota', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Importo Ente', json: 'importoEnte', mapped: true, use: 'KPI principale, grafici, tabelle, drill-down' },
  { excel: '€', json: '-', mapped: false, use: 'Non importato (stato pagamento testo)' },
  { excel: 'Responsabile', json: 'responsabile', mapped: true, use: 'Filtro, sezione dedicata, drill-down' },
  { excel: 'Importo Consulenza', json: 'consulenza', mapped: true, partial: true, use: 'Valore basso, presente nel JSON' },
  { excel: 'Segnalatore', json: 'segnalatore', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Commerciale', json: 'agente', mapped: true, use: 'Filtro, sezione dedicata, grafici, drill-down' },
  { excel: 'Città', json: 'citta', mapped: true, use: 'Filtro, sezione Citta, grafici, drill-down' },
  { excel: 'Avanzamento', json: 'avanzamento', mapped: true, use: 'KPI, sezione Avanzamento, alert' },
  { excel: 'Ultima Chiamata', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Invio Contratto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Aggiornamento Settimanale', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Data Firma Contratto', json: 'dataFirma', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Appartenenza Consorzio', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Nome del Consorzio', json: 'consorzio', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Soa Attestante', json: 'soaAttestante', mapped: true, use: 'Filtro, sezione dedicata, grafici, drill-down' },
  { excel: "Nome dell'Ente di Cert. 9001", json: 'enteCert9001', mapped: true, use: 'Sezione Enti Cert., drill-down' },
  { excel: 'Scadenza Ente di Cert. 9001', json: 'scadenzaCert', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Contratto', json: 'contratto', mapped: true, use: 'Dettaglio, CSV export' },
  { excel: 'Tipo Commessa', json: '-', mapped: false, use: 'Tutte Lavorazione (costante)' },
  { excel: 'Società Aziendale', json: 'societa', mapped: true, partial: true, use: 'Tutte QUALIFICA GROUP srl' },
  { excel: 'Società / Sedi', json: 'sede', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Sede Operativa', json: 'sedeOp', mapped: true, use: 'Sede operativa nel dettaglio' },
  { excel: 'Funzione aziendale', json: '-', mapped: false, use: 'Non importato (pochi valori)' },
];

/* ── Commerciali ── */
function renderCommerciali() {
  const el = document.getElementById('sec-agenti');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.agente || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ente: 0, eseg: 0, sosp: 0 };
    g[k].cnt++;
    g[k].ente += c.importoEnte;
    if (c.status === 'Eseguito') g[k].eseg++;
    if (c.statoLav.includes('SOSPESO')) g[k].sosp++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Commerciali</h3>';
  h += '<div class="card"><h4>Commesse per Commerciale</h4><div class="chart-wrap"><canvas id="chCommerciali"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><p style="color:var(--text3);font-size:11px;margin-bottom:8px">Clicca &#9654; per espandere e vedere le pratiche divise per Stato, poi clicca ancora per il dettaglio singolo.</p><div class="tbl-scroll"><table id="tblCommerciali"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chCommerciali', sorted.slice(0, 15).map(e => e[0]), sorted.slice(0, 15).map(e => e[1].cnt), '#3b82f6', true);

  buildTreeTbl('tblCommerciali', f, {
    primaryField: 'agente',
    primaryLabel: 'Commerciale',
    subGroupField: 'status',
    subGroupLabel: 'Status',
    valueFn: (items) => [
      { label: 'Comm.', val: fmt(items.length) },
      { label: 'Imp. Ente', val: fmtE(items.reduce((s, c) => s + c.importoEnte, 0)) },
      { label: 'Eseguiti', val: fmt(items.filter(c => c.status === 'Eseguito').length) },
      { label: 'Sospesi', val: fmt(items.filter(c => c.statoLav.includes('SOSPESO')).length) }
    ],
    subValueFn: (items) => [
      { label: 'Comm.', val: fmt(items.length) },
      { label: 'Imp. Ente', val: fmtE(items.reduce((s, c) => s + c.importoEnte, 0)) },
      { label: '', val: '' },
      { label: '', val: '' }
    ],
    itemColumns: [
      { hdr: 'ID', fn: c => '<strong>#' + c.id + '</strong>' },
      { hdr: 'Cliente', fn: c => c.cliente },
      { hdr: 'Citta', fn: c => c.citta || '-' }
    ],
    leafValueFn: (c) => [fmtE(c.importoEnte), '', '']
  });
}

/* ── Responsabili ── */
function renderResponsabili() {
  const el = document.getElementById('sec-responsabili');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.responsabile || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ente: 0, eseg: 0, sosp: 0 };
    g[k].cnt++;
    g[k].ente += c.importoEnte;
    if (c.status === 'Eseguito') g[k].eseg++;
    if (c.statoLav.includes('SOSPESO')) g[k].sosp++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Responsabili</h3>';
  h += '<div class="card"><div class="tbl-scroll"><table id="tblResp"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  buildTbl('tblResp',
    ['Responsabile', 'Comm.', 'Importo Ente', 'Eseguiti', 'Sospesi'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ente), val: v.ente },
      { display: fmt(v.eseg), val: v.eseg },
      { display: fmt(v.sosp), val: v.sosp }
    ]),
    ['str', 'num', 'num', 'num', 'num'],
    { clickField: 'responsabile' }
  );
}
