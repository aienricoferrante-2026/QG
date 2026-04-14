/* ── App Bootstrap ── */

let DATA = [];
let filtered = [];
let sortCol = 'id', sortDir = -1;
let page = 0, perPage = 50;

function updateAll() {
  updateKPIs();
  updateCharts();
  updateTable();
  renderCampiDati();
}

const OFFERTE_EXCEL_FIELDS = [
  { excel: 'ID', json: 'id', mapped: true, use: 'Identificativo in tabella e ordinamento' },
  { excel: 'Data', json: 'data/data_full', mapped: true, use: 'Filtro periodo, trend mensile, tabella' },
  { excel: 'Anno', json: 'anno', mapped: true, use: 'Filtro anno' },
  { excel: 'Cliente', json: 'cliente', mapped: true, use: 'Tabella dettaglio, ricerca' },
  { excel: 'Commerciale', json: 'agente', mapped: true, use: 'Filtro, grafico Top Agenti, tabella' },
  { excel: 'Tipo', json: 'tipo', mapped: true, use: 'Tabella dettaglio, ricerca' },
  { excel: 'Totale', json: 'totale', mapped: true, use: 'KPI, grafici, tabella, distribuzione' },
  { excel: 'Status', json: 'status', mapped: true, use: 'Filtro, KPI, donut, badge, conversione' },
  { excel: 'Categoria', json: 'categoria', mapped: true, use: 'Filtro, donut, conversione per categoria' },
  { excel: 'Societa Aziendale', json: 'societa', mapped: true, use: 'Filtro, grafico Top Societa, tabella' },
  { excel: 'Sede', json: 'sede', mapped: true, partial: true, use: 'Presente nel JSON (sede legale)' },
  { excel: 'Sede Operativa', json: 'sede_op', mapped: true, use: 'Filtro, colonna tabella dettaglio' },
  { excel: 'Funzione', json: 'funzione', mapped: true, partial: true, use: 'Presente nel JSON' },
  { excel: 'Segnalatore', json: 'segnalatore', mapped: true, partial: true, use: 'Presente nel JSON' },
];

function renderCampiDati() {
  const el = document.getElementById('campiDatiSection');
  if (!el) return;
  const used = OFFERTE_EXCEL_FIELDS.filter(f => f.mapped).length;
  let h = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">';
  h += '<h3 style="font-size:.9rem;font-weight:600">Campi Dati Importati</h3>';
  h += '<span style="background:rgba(59,130,246,.15);color:#60a5fa;padding:3px 10px;border-radius:20px;font-size:.72rem;font-weight:600">' + used + '/' + OFFERTE_EXCEL_FIELDS.length + ' utilizzati</span>';
  h += '</div>';
  h += '<p style="color:var(--text2);font-size:.78rem;margin-bottom:10px">Colonne presenti nel file dati e relativo utilizzo nella dashboard.</p>';
  h += '<div style="overflow-x:auto;max-height:400px;overflow-y:auto"><table style="width:100%;border-collapse:collapse;font-size:.78rem">';
  h += '<thead><tr><th>#</th><th>Colonna</th><th>Stato</th><th>Campo JSON</th><th>Utilizzo</th></tr></thead><tbody>';
  OFFERTE_EXCEL_FIELDS.forEach((f, i) => {
    const tag = f.mapped ? (f.partial
      ? '<span class="badge badge-yellow">Parziale</span>'
      : '<span class="badge badge-green">Usato</span>')
      : '<span class="badge badge-red">Non usato</span>';
    h += '<tr><td>' + (i + 1) + '</td><td><strong>' + f.excel + '</strong></td><td>' + tag + '</td><td><code style="font-size:.72rem">' + f.json + '</code></td><td>' + f.use + '</td></tr>';
  });
  h += '</tbody></table></div>';
  el.innerHTML = h;
}

// Search listener
document.getElementById('tableSearch').addEventListener('input', () => {
  page = 0;
  updateTable();
});

// Per-page selector listener
document.getElementById('perPageSelect').addEventListener('change', (e) => {
  perPage = parseInt(e.target.value);
  page = 0;
  updateTable();
});

// Load data from JSON
fetch('data/offerte.json')
  .then(r => r.json())
  .then(data => {
    DATA = data;
    filtered = [...DATA];
    initFilters();
    updateAll();
  })
  .catch(e => {
    document.querySelector('.container').innerHTML =
      '<div style="text-align:center;padding:60px">' +
      '<h2 style="color:var(--red)">Errore caricamento dati</h2>' +
      '<p style="color:var(--text2);margin-top:8px">Avvia con un server locale:<br>' +
      '<code style="color:var(--accent)">cd dashboard_offerte && python3 -m http.server 8000</code></p></div>';
  });
