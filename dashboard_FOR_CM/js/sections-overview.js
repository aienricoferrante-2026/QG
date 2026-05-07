/* ── Sezioni: Executive Summary, Ricavi & MOL, Societa ── */

function renderExecutive() {
  const el = document.getElementById('sec-executive');
  const f = filtered;
  const cnt = f.length;
  const cons = f.reduce((s, c) => s + c.consulenza, 0);
  const costi = f.reduce((s, c) => s + c.costi, 0);
  const mol = f.reduce((s, c) => s + c.mol, 0);
  const ore = f.reduce((s, c) => s + c.ore, 0);
  const marginePct = cons ? (mol / cons * 100) : 0;
  const incassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const pctIncasso = cons ? (incassato / cons * 100) : 0;
  const residuo = f.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
  const cmAperte = f.filter(c => c.status !== 'Annullato' && c.statoCorso !== 'Concluso').length;
  const cmConcluse = f.filter(c => c.statoCorso === 'Concluso').length;

  // Status distribution
  const statusG = {};
  f.forEach(c => { const k = c.status || 'N/D'; statusG[k] = (statusG[k] || 0) + 1; });

  // Stato corso distribution
  const corsoG = {};
  f.forEach(c => { if (c.statoCorso) { corsoG[c.statoCorso] = (corsoG[c.statoCorso] || 0) + 1; } });

  // ── Alert critici da evidenziare ──
  const molNeg = f.filter(c => c.mol < 0 && c.consulenza > 0);
  const senzaIncasso = f.filter(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0);
  const stalled = f.filter(c => {
    if (c.avanzamento >= 50 || !c.dataFine) return false;
    const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return false;
    const fine = new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
    return fine < new Date();
  });

  // ── Trend mensile ricavi (12 mesi rolling) ──
  const trend = _buildMonthlyTrend(f);

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Vista sintetica con i KPI macro, alert prioritari e trend.</p>';

  // ═══ MACRO KPI (5 grandi) ═══
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse Totali</div><div class="kpi-value">' + fmt(cnt) + '</div><div class="kpi-sub">' + fmt(cmAperte) + ' aperte · ' + fmt(cmConcluse) + ' concluse</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ricavi Totali</div><div class="kpi-value">' + fmtK(cons) + '</div><div class="kpi-sub">' + fmtE(cons) + '</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Margine MOL</div><div class="kpi-value">' + marginePct.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(mol) + ' su ' + fmtK(cons) + '</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">% Incasso</div><div class="kpi-value">' + pctIncasso.toFixed(1) + '%</div><div class="kpi-sub">' + fmtK(incassato) + ' incassati</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Esposizione</div><div class="kpi-value">' + fmtK(residuo) + '</div><div class="kpi-sub">credito aperto · Ricavi − Incassato</div></div>';
  h += '</div>';

  // ═══ ALERT IN EVIDENZA ═══
  h += '<h4 style="font-size:13px;font-weight:700;color:#ef4444;margin:14px 0 10px 0;padding:4px 8px;border-left:3px solid #ef4444">⚠️ ALERT PRIORITARI</h4>';
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card alert-card" onclick="drillDownCustom(\'MOL Negativo\', c=>c.mol<0&&c.consulenza>0)" style="cursor:pointer;border-left:3px solid #ef4444">' +
       '<h4 style="color:#ef4444">MOL Negativo</h4>' +
       '<div style="font-size:24px;font-weight:700">' + fmt(molNeg.length) + '</div>' +
       '<div style="color:var(--text2);font-size:11px;margin-top:4px">Costi &gt; Ricavi · clicca per vedere</div></div>';
  h += '<div class="card alert-card" onclick="setQuickFilter(\'noincasso\');showSec(\'analisiIncassi\')" style="cursor:pointer;border-left:3px solid #f59e0b">' +
       '<h4 style="color:#f59e0b">Senza incasso</h4>' +
       '<div style="font-size:24px;font-weight:700">' + fmt(senzaIncasso.length) + '</div>' +
       '<div style="color:var(--text2);font-size:11px;margin-top:4px">€ 0 incassati su commesse con ricavi</div></div>';
  h += '<div class="card alert-card" onclick="setQuickFilter(\'stalled\')" style="cursor:pointer;border-left:3px solid #8b5cf6">' +
       '<h4 style="color:#8b5cf6">Commesse stalled</h4>' +
       '<div style="font-size:24px;font-weight:700">' + fmt(stalled.length) + '</div>' +
       '<div style="color:var(--text2);font-size:11px;margin-top:4px">Avz. &lt; 50% e data fine passata</div></div>';
  h += '</div>';

  // ═══ TREND + REGIONI ═══
  h += '<div class="row2">';
  h += '<div class="card"><h4>Trend Ricavi mensile (ultimi ' + trend.labels.length + ' mesi)</h4><div class="chart-wrap"><canvas id="chExTrend"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Regione</h4><div class="chart-wrap"><canvas id="chExReg"></canvas></div></div>';
  h += '</div>';

  // ═══ Distribuzioni status ═══
  h += '<div class="row2" style="margin-top:14px">';
  h += '<div class="card"><h4>Distribuzione per Status</h4><div class="chart-wrap"><canvas id="chExStatus"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione per Stato Corso</h4><div class="chart-wrap"><canvas id="chExCorso"></canvas></div></div>';
  h += '</div>';

  // Ricavi per cliente
  h += '<div class="row2">';
  h += '<div class="card"><h4>Ricavi per Cliente / Ente Finanziatore</h4><div class="chart-wrap"><canvas id="chExClienti"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi vs Costi vs MOL per Societa</h4><div class="chart-wrap"><canvas id="chExSocieta"></canvas></div></div>';
  h += '</div>';

  // Table: top corsi per ricavi
  h += '<div class="card"><h4>Top 20 Corsi per Ricavi</h4><div class="tbl-scroll"><table id="tblTopCorsi"></table></div></div>';

  // Campi Dati
  h += '<div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h += '<h4>Campi Dati Importati</h4>';
  h += '<span class="badge">' + FOR_EXCEL_FIELDS.filter(f2 => f2.mapped).length + '/' + FOR_EXCEL_FIELDS.length + ' utilizzati</span>';
  h += '</div>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">Colonne presenti nel file Excel e relativo utilizzo nella dashboard. <span class="tag tag-green">Usato</span> = campo analizzato, <span class="tag tag-yellow">Parziale</span> = presente ma non nel dettaglio, <span class="tag tag-red">Non usato</span> = campo non ancora importato.</p>';
  h += '<div class="tbl-scroll"><table id="tblCampi"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Trend mensile chart ──
  makeBar('chExTrend', trend.labels, trend.values, '#6366f1', false);

  // ── Regioni chart ──
  const regG = {};
  f.forEach(c => {
    const k = c.regione || 'N/D';
    regG[k] = (regG[k] || 0) + (c.consulenza || 0);
  });
  const regSorted = Object.entries(regG).filter(e => e[1] > 0).sort((a, b) => b[1] - a[1]);
  makeBar('chExReg', regSorted.map(e => e[0]), regSorted.map(e => e[1]), '#10b981', true);

  // Render charts
  makeDonut('chExStatus', Object.keys(statusG), Object.values(statusG),
    Object.keys(statusG).map(k => STATUS_COLORS[k] || '#64748b'));

  makeDonut('chExCorso', Object.keys(corsoG), Object.values(corsoG),
    Object.keys(corsoG).map(k => CORSO_COLORS[k] || '#64748b'));

  // Clienti
  const cliG = {};
  f.forEach(c => { const k = c.cliente || 'N/D'; cliG[k] = (cliG[k] || 0) + c.consulenza; });
  const cliSorted = Object.entries(cliG).sort((a, b) => b[1] - a[1]);
  makeBar('chExClienti', cliSorted.map(e => e[0].replace('_FOR', '')), cliSorted.map(e => e[1]), '#3b82f6', true);

  // Societa stacked
  const socG = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!socG[k]) socG[k] = { ricavi: 0, costi: 0, mol: 0 };
    socG[k].ricavi += c.consulenza;
    socG[k].costi += c.costi;
    socG[k].mol += c.mol;
  });
  const socSorted = Object.entries(socG).sort((a, b) => b[1].ricavi - a[1].ricavi).slice(0, 10);
  const socLabels = socSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]);
  makeBarStacked('chExSocieta', socLabels, [
    { label: 'Costi', data: socSorted.map(e => e[1].costi), backgroundColor: '#ef4444aa', borderRadius: 4 },
    { label: 'MOL', data: socSorted.map(e => e[1].mol), backgroundColor: '#10b981aa', borderRadius: 4 }
  ]);

  // Top corsi table
  const corsiG = {};
  f.forEach(c => {
    const k = c.corso || 'N/D';
    if (!corsiG[k]) corsiG[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, ore: 0 };
    corsiG[k].cnt++;
    corsiG[k].cons += c.consulenza;
    corsiG[k].costi += c.costi;
    corsiG[k].mol += c.mol;
    corsiG[k].ore += c.ore;
  });
  const topCorsi = Object.entries(corsiG).sort((a, b) => b[1].cons - a[1].cons).slice(0, 20);
  buildTbl('tblTopCorsi',
    ['Corso', 'Comm.', 'Ricavi', 'Costi', 'MOL', 'Ore'],
    topCorsi.map(([k, v]) => [
      { display: k.length > 40 ? k.substring(0, 38) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.costi), val: v.costi },
      { display: fmtE(v.mol), val: v.mol },
      { display: fmt(v.ore), val: v.ore }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'corso' }
  );

  // Campi Dati table
  buildTbl('tblCampi', ['#', 'Colonna Excel', 'Stato', 'Campo JSON', 'Utilizzo Dashboard'],
    FOR_EXCEL_FIELDS.map((f2, i) => [
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

const FOR_EXCEL_FIELDS = [
  { excel: 'Contratto', json: 'contratto', mapped: true, use: 'Dettaglio, CSV export' },
  { excel: 'Società Aziendale', json: 'societa', mapped: true, use: 'Filtro, sezione Ricavi, drill-down' },
  { excel: 'Società / Sedi', json: 'sede', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Sede Operativa', json: 'sedeOp', mapped: true, use: 'Sezione Sedi, filtro modale, drill-down' },
  { excel: 'Funzione aziendale', json: 'funzione', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Euro Residuo Effettivo', json: 'euroResiduo', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Totale Ricavo', json: 'totRicavo', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Tipo Commessa', json: '-', mapped: false, use: 'Tutte Lavorazione (costante)' },
  { excel: 'Stato Corso', json: 'statoCorso', mapped: true, use: 'Filtro, KPI, donut, drill-down' },
  { excel: 'ID', json: 'id', mapped: true, use: 'Identificativo in tabelle e drill-down' },
  { excel: 'Responsabile', json: 'responsabile', mapped: true, use: 'Filtro, sezione dedicata, drill-down' },
  { excel: 'Titolo', json: 'titolo', mapped: true, partial: true, use: 'Presente nel dettaglio modale' },
  { excel: 'Città', json: 'citta', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Codice Classe', json: 'codClasse', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Stato Classe', json: 'statoClasse', mapped: true, use: 'Filtro, drill-down' },
  { excel: 'Status', json: 'status', mapped: true, use: 'Filtro, KPI, donut, alert, drill-down' },
  { excel: 'Stato Lavorazione', json: 'statoLav', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Corso', json: 'corso', mapped: true, use: 'Filtro, sezione Corsi, grafici, drill-down' },
  { excel: 'Data Inizio', json: 'dataInizio', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Fine', json: 'dataFine', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Pian. Inizio', json: 'dataPianInizio', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Cliente', json: 'cliente', mapped: true, use: 'Filtro, sezione Clienti, KPI, drill-down' },
  { excel: 'Importo Consulenza', json: 'consulenza', mapped: true, use: 'KPI Ricavi, grafici, tabelle, drill-down' },
  { excel: 'Totale Ricavi', json: 'ricavi', mapped: true, use: 'Calcoli finanziari' },
  { excel: 'Totale Costi', json: 'costi', mapped: true, use: 'KPI, MOL, sezione Ricavi, drill-down' },
  { excel: 'MOL Effettivo', json: 'mol', mapped: true, use: 'KPI, sezione Ricavi, drill-down' },
  { excel: 'Totale Ore', json: 'ore', mapped: true, use: 'KPI, tabelle, drill-down' },
  { excel: 'Data Esame', json: 'dataEsame', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Avanzamento', json: 'avanzamento', mapped: true, use: 'KPI, sezione Avanzamento, alert' },
  { excel: 'Data Assegnazione', json: 'dataAssegnazione', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Anticipo Importo', json: 'anticipoImporto', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Saldo Importo', json: 'saldoImporto', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Totale Ricevuto Regione', json: 'totRicevutoRegione', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Già Incassato', json: 'giaIncassato', mapped: true, partial: true, use: 'Sezione Clienti' },
  { excel: 'Da Incassare', json: 'daIncassare', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Importo Ente', json: 'ente', mapped: true, partial: true, use: 'Presente nel JSON (sempre 0)' },
  { excel: 'Ultima Nota.1', json: 'ultimaNota', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Data Ultima Nota', json: 'dataUltimaNota', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Commerciale (Agente)', json: '-', mapped: false, use: 'Non importato (sempre vuoto)' },
  { excel: 'Segnalatore', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Num. Discenti', json: 'discenti', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'ID Contratto', json: 'idContratto', mapped: true, partial: true, use: 'Riferimento contratto' },
  { excel: 'Contatto', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Descrizione', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Indirizzo', json: '-', mapped: false, use: 'Non importato' },
  { excel: 'Note', json: '-', mapped: false, use: 'Non importato' },
];

/* Helper: trend mensile dei ricavi su 12 mesi rolling.
   Usa dataInizio (formato gg-mm-yyyy) per pivotare i ricavi. */
function _buildMonthlyTrend(items) {
  const byMonth = new Map();
  items.forEach(c => {
    const m = String(c.dataInizio || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return;
    const y = parseInt(m[3]);
    const mo = parseInt(m[2]);
    const key = y * 100 + mo;
    byMonth.set(key, (byMonth.get(key) || 0) + (c.consulenza || 0));
  });
  // Prendo gli ultimi 12 mesi che hanno dati
  const sortedKeys = [...byMonth.keys()].sort();
  const last12 = sortedKeys.slice(-12);
  const labels = last12.map(k => {
    const y = Math.floor(k / 100);
    const mo = k % 100;
    return String(mo).padStart(2, '0') + '/' + String(y).slice(-2);
  });
  const values = last12.map(k => byMonth.get(k));
  return { labels, values };
}

/* ── Ricavi & MOL section ── */
function renderRicavi() {
  const el = document.getElementById('sec-ricavi');
  const f = filtered;

  // Per-societa breakdown
  const socG = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!socG[k]) socG[k] = { cnt: 0, cons: 0, costi: 0, mol: 0 };
    socG[k].cnt++;
    socG[k].cons += c.consulenza;
    socG[k].costi += c.costi;
    socG[k].mol += c.mol;
  });
  const socSorted = Object.entries(socG).sort((a, b) => b[1].cons - a[1].cons);

  // Trend mensile Ricavi/Costi/MOL su 12 mesi rolling
  const trendRic = _buildMonthlyTrend(f);
  const byMonthCM = new Map();
  f.forEach(c => {
    const m = String(c.dataInizio || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
    if (!m) return;
    const key = parseInt(m[3]) * 100 + parseInt(m[2]);
    if (!byMonthCM.has(key)) byMonthCM.set(key, { cos: 0, mol: 0 });
    const o = byMonthCM.get(key);
    o.cos += (c.costi || 0);
    o.mol += (c.mol || 0);
  });
  const trendCos = trendRic.labels.map((_, i) => {
    const ts = [...byMonthCM.keys()].sort();
    const last12 = ts.slice(-12);
    const k = last12[i];
    return byMonthCM.get(k)?.cos || 0;
  });
  const trendMol = trendRic.labels.map((_, i) => {
    const ts = [...byMonthCM.keys()].sort();
    const last12 = ts.slice(-12);
    const k = last12[i];
    return byMonthCM.get(k)?.mol || 0;
  });

  let h = '<div class="sec"><h3 class="sec-title">Ricavi & MOL per Societa</h3>';
  h += '<div class="card"><h4>Trend mensile Ricavi · Costi · MOL (ultimi ' + trendRic.labels.length + ' mesi)</h4>';
  h += '<div class="chart-wrap"><canvas id="chRicTrend"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblRicSoc"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  // Render trend stacked bar (Ricavi / Costi sovrapposti, MOL come linea sopra)
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
