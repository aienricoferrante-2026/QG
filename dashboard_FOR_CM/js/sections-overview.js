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

  // Status distribution
  const statusG = {};
  f.forEach(c => { const k = c.status || 'N/D'; statusG[k] = (statusG[k] || 0) + 1; });

  // Stato corso distribution
  const corsoG = {};
  f.forEach(c => { if (c.statoCorso) { corsoG[c.statoCorso] = (corsoG[c.statoCorso] || 0) + 1; } });

  let h = '<div class="sec"><h3 class="sec-title">Executive Summary</h3>';

  // Top KPIs
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Ricavi Totali</h4><div style="font-size:28px;font-weight:700">' + fmtK(cons) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmtE(cons) + '</div></div>';
  h += '<div class="card"><h4>MOL (Margine Operativo)</h4><div style="font-size:28px;font-weight:700;color:var(--green)">' + fmtK(mol) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">Margine: ' + marginePct.toFixed(1) + '%</div></div>';
  h += '<div class="card"><h4>Costi Totali</h4><div style="font-size:28px;font-weight:700;color:var(--orange)">' + fmtK(costi) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(ore) + ' ore formazione</div></div>';
  h += '</div>';

  // Charts row
  h += '<div class="row2">';
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

  let h = '<div class="sec"><h3 class="sec-title">Ricavi & MOL per Societa</h3>';
  h += '<div class="card"><div class="tbl-scroll"><table id="tblRicSoc"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

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
