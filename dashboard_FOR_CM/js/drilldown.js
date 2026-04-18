/* ── Multi-level Stack-based Drill-down Navigator ── */

const DRILL_FIELDS = [
  { key: 'sedeOp', label: 'Sede Operativa' },
  { key: 'corso', label: 'Corso' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'responsabile', label: 'Responsabile' },
  { key: 'societa', label: 'Societa' },
  { key: 'status', label: 'Status' },
  { key: 'statoCorso', label: 'Stato Corso' }
];

let _mStack = [];       // [{title, items, field, value, page, perPage, groupField}]
let _mPerPage = 50;

function _cur() { return _mStack[_mStack.length - 1]; }

/* ── Open/Close ── */
function openModal(title, html) {
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  _mStack = [];
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

/* ── Drill Level 1: from dashboard sections ── */
function drillDown(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => c[field] === value);
  _mStack = [{ title: value, items: filtered.filter(matchFn), field: field, value: value, page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}

function drillDownItems(title, items) {
  _mStack = [{ title: title, items: items, field: '', value: '', page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}

function drillDownCustom(title, filterFn) {
  drillDownItems(title, filtered.filter(filterFn));
}

/* ── Drill Level 2+: from within modal ── */
function drillDown2(field, value) {
  const parent = _cur();
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => c[field] === value);
  const items = getFilteredMItems().filter(matchFn);
  _mStack.push({ title: value, items: items, field: field, value: value, page: 0, perPage: _mPerPage, groupField: null });
  renderCurrentLevel();
}

/* ── Navigation ── */
function goBack() {
  if (_mStack.length > 1) {
    _mStack.pop();
    renderCurrentLevel();
  } else {
    closeModal();
  }
}

function goToLevel(n) {
  _mStack = _mStack.slice(0, n + 1);
  renderCurrentLevel();
}

/* ── Group toggle ── */
function setGroupField(field) {
  const cur = _cur();
  cur.groupField = cur.groupField === field ? null : field;
  cur.page = 0;
  renderCurrentLevel();
}

/* ── Render current level ── */
function renderCurrentLevel() {
  const cur = _cur();
  const depth = _mStack.length;
  const items = cur.items;

  let h = '';

  // Breadcrumb (if depth > 1)
  if (depth > 1) {
    h += buildBreadcrumb();
  }

  // Toolbar
  h += buildMToolbar();

  // Filters
  h += buildMFilters();

  // KPIs
  h += '<div id="modalKpis" class="modal-kpis">' + buildMKpis(getFilteredMItems()) + '</div>';

  // Group bar (show grouping options, excluding fields already drilled)
  h += buildGroupBar();

  // Table
  h += '<div id="modalTableWrap">';
  if (cur.groupField) {
    h += buildGroupedTable(getFilteredMItems(), cur.groupField);
  } else {
    h += buildMTable(getFilteredMItems());
  }
  h += '</div>';

  // Title with back button
  const backBtn = depth > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : '';
  const titleText = cur.title + ' (' + getFilteredMItems().length + ' commesse)';
  openModal(backBtn + titleText, h);
}

/* ── Breadcrumb ── */
function buildBreadcrumb() {
  let h = '<div class="modal-breadcrumb">';
  _mStack.forEach((lev, i) => {
    const isLast = i === _mStack.length - 1;
    const label = lev.field ? DRILL_FIELDS.find(f => f.key === lev.field)?.label || lev.field : '';
    const short = lev.value.length > 30 ? lev.value.substring(0, 28) + '..' : lev.value;
    if (isLast) {
      h += '<span class="current">' + (label ? label + ': ' : '') + short + '</span>';
    } else {
      h += '<span onclick="goToLevel(' + i + ')">' + (label ? label + ': ' : '') + short + '</span>';
      h += '<span class="sep">&#8250;</span>';
    }
  });
  h += '</div>';
  return h;
}

/* ── Toolbar ── */
function buildMToolbar() {
  const cur = _cur();
  let h = '<div class="modal-toolbar">';
  h += '<div class="modal-search"><input type="text" id="modalSearch" placeholder="Cerca cliente, corso, contratto..." oninput="onMSearch()"></div>';
  h += '<div class="modal-actions">';
  h += '<label style="color:var(--text2);font-size:10px;display:flex;align-items:center;gap:4px">Righe <select id="modalPerPage" onchange="changeMPerPage(this.value)" class="per-page-select">';
  [25, 50, 100, 200].forEach(n => { h += '<option value="' + n + '"' + (n === cur.perPage ? ' selected' : '') + '>' + n + '</option>'; });
  h += '<option value="0"' + (cur.perPage === 0 ? ' selected' : '') + '>Tutte</option></select></label>';
  h += '<button class="btn-export" onclick="exportMCSV()">&#8681; CSV</button>';
  h += '</div></div>';
  return h;
}

function onMSearch() { _cur().page = 0; applyMFilters(); }
function changeMPerPage(v) { _cur().perPage = parseInt(v); _cur().page = 0; applyMFilters(); }

/* ── Group bar ── */
function buildGroupBar() {
  const cur = _cur();
  // Exclude fields already drilled through
  const drilledFields = _mStack.map(l => l.field).filter(Boolean);
  const available = DRILL_FIELDS.filter(f => !drilledFields.includes(f.key));
  if (available.length === 0) return '';

  let h = '<div class="group-bar"><span style="color:var(--text2);font-size:10px;margin-right:4px">Raggruppa per:</span>';
  available.forEach(f => {
    const active = cur.groupField === f.key ? ' active' : '';
    h += '<button class="group-btn' + active + '" onclick="setGroupField(\'' + f.key + '\')">' + f.label + '</button>';
  });
  h += '</div>';
  return h;
}

/* ── Modal filters with counts ── */
function buildMFilters() {
  const cur = _cur();
  const allItems = cur.items;
  const drilledFields = _mStack.map(l => l.field).filter(Boolean);

  const fields = [
    { id: 'mfStatus', label: 'Status', key: 'status' },
    { id: 'mfCorso', label: 'Stato Corso', key: 'statoCorso' },
    { id: 'mfClasse', label: 'Classe', key: 'statoClasse' },
    { id: 'mfResp', label: 'Responsabile', key: 'responsabile' },
    { id: 'mfSede', label: 'Sede Operativa', key: 'sedeOp' },
    { id: 'mfCliM', label: 'Cliente', key: 'cliente' },
  ].filter(f => !drilledFields.includes(f.key));

  let h = '<div class="modal-filters">';
  fields.forEach(f => {
    const vals = [...new Set(allItems.map(c => c[f.key]).filter(Boolean))].sort();
    if (vals.length < 2) return;
    h += '<div class="modal-filter"><label>' + f.label + '</label>';
    h += '<select id="' + f.id + '" onchange="applyMFilters()"><option value="">Tutti (' + vals.length + ')</option>';
    vals.forEach(v => {
      const cnt = allItems.filter(c => c[f.key] === v).length;
      const short = v.length > 25 ? v.substring(0, 23) + '..' : v;
      h += '<option value="' + v.replace(/"/g, '&quot;') + '">' + short + ' (' + cnt + ')</option>';
    });
    h += '</select></div>';
  });
  h += '<button class="modal-filter-reset" onclick="resetMFilters()">Reset</button></div>';
  return h;
}

function getFilteredMItems() {
  if (!_mStack.length) return [];
  const cur = _cur();
  const fIds = ['mfStatus', 'mfCorso', 'mfClasse', 'mfResp', 'mfSede', 'mfCliM'];
  const fKeys = ['status', 'statoCorso', 'statoClasse', 'responsabile', 'sedeOp', 'cliente'];
  const fv = {};
  fIds.forEach((id, i) => { const el = document.getElementById(id); if (el) fv[fKeys[i]] = el.value; });
  const q = (document.getElementById('modalSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';

  return cur.items.filter(c => {
    for (const [key, val] of Object.entries(fv)) { if (val && c[key] !== val) return false; }
    if (search && !(c.cliente + ' ' + c.corso + ' ' + c.titolo + ' ' + c.contratto + ' ' + c.responsabile).toLowerCase().includes(search)) return false;
    return true;
  });
}

function applyMFilters() {
  const items = getFilteredMItems();
  const el = document.getElementById('modalKpis');
  if (el) el.innerHTML = buildMKpis(items);

  const wrap = document.getElementById('modalTableWrap');
  if (wrap) {
    const cur = _cur();
    wrap.innerHTML = cur.groupField ? buildGroupedTable(items, cur.groupField) : buildMTable(items);
  }

  const titleEl = document.getElementById('modalTitle');
  if (titleEl) {
    const depth = _mStack.length;
    const backBtn = depth > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : '';
    titleEl.innerHTML = backBtn + _cur().title + ' (' + items.length + ' commesse)';
  }
}

function resetMFilters() {
  ['mfStatus', 'mfCorso', 'mfClasse', 'mfResp', 'mfSede', 'mfCliM'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const s = document.getElementById('modalSearch'); if (s) s.value = '';
  applyMFilters();
}

/* ── Modal KPIs ── */
function buildMKpis(items) {
  const cons = items.reduce((s, c) => s + c.consulenza, 0);
  const costi = items.reduce((s, c) => s + c.costi, 0);
  const mol = items.reduce((s, c) => s + c.mol, 0);
  const ore = items.reduce((s, c) => s + c.ore, 0);
  const cli = new Set(items.map(c => c.cliente)).size;
  let h = mkpi(fmt(items.length), 'Commesse');
  h += mkpi(fmt(cli), 'Clienti');
  h += mkpi(fmtE(cons), 'Ricavi');
  h += mkpi(fmtE(costi), 'Costi');
  h += mkpi(fmtE(mol), 'MOL');
  h += mkpi(fmt(ore), 'Ore');
  return h;
}

/* ── Grouped table (aggregate view) ── */
function buildGroupedTable(items, groupField) {
  const label = DRILL_FIELDS.find(f => f.key === groupField)?.label || groupField;

  const g = {};
  items.forEach(c => {
    const k = c[groupField] || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, ore: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].costi += c.costi;
    g[k].mol += c.mol;
    g[k].ore += c.ore;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  h += '<th>' + label + '</th><th>Comm.</th><th>Ricavi</th><th>Costi</th><th>MOL</th><th>Ore</th>';
  h += '</tr></thead><tbody>';

  sorted.forEach(([k, v]) => {
    const escaped = k.replace(/'/g, "\\'");
    h += '<tr class="clickable" onclick="drillDown2(\'' + groupField + '\',\'' + escaped + '\')">';
    h += '<td>' + (k.length > 50 ? k.substring(0, 48) + '..' : k) + '</td>';
    h += '<td class="text-right">' + fmt(v.cnt) + '</td>';
    h += '<td class="text-right">' + fmtE(v.cons) + '</td>';
    h += '<td class="text-right">' + fmtE(v.costi) + '</td>';
    h += '<td class="text-right">' + fmtE(v.mol) + '</td>';
    h += '<td class="text-right">' + fmt(v.ore) + '</td>';
    h += '</tr>';
  });

  // Totals
  const tC = items.reduce((s, c) => s + c.consulenza, 0);
  const tK = items.reduce((s, c) => s + c.costi, 0);
  const tM = items.reduce((s, c) => s + c.mol, 0);
  const tO = items.reduce((s, c) => s + c.ore, 0);
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td><strong>TOTALE (' + sorted.length + ')</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.length) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tC) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tK) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tM) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(tO) + '</strong></td>';
  h += '</tr></tfoot></table></div>';
  return h;
}

/* ── Detail table (individual commesse) with pagination and ERP ── */
function buildMTable(items) {
  const cur = _cur();
  const hdrs = ['ID', 'Corso', 'Cliente', 'Status', 'Stato Corso', 'Ricavi', 'Costi', 'MOL', 'Ore', 'Avz.', 'ERP'];
  const types = ['num', 'str', 'str', 'str', 'str', 'num', 'num', 'num', 'num', 'num', 'str'];

  const pp = cur.perPage === 0 ? items.length : cur.perPage;
  const totalPages = Math.max(1, Math.ceil(items.length / pp));
  if (cur.page >= totalPages) cur.page = totalPages - 1;
  const paged = items.slice(cur.page * pp, cur.page * pp + pp);

  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  hdrs.forEach((hd, i) => { h += '<th onclick="sortTbl(\'modalTbl\',' + i + ',\'' + types[i] + '\')">' + hd + '</th>'; });
  h += '</tr></thead><tbody>';

  paged.forEach(c => {
    h += '<tr>';
    h += '<td>' + c.id + '</td>';
    h += '<td>' + (c.titolo || c.corso || '') + '</td>';
    h += '<td>' + c.cliente + '</td>';
    h += '<td>' + tagStatus(c.status) + '</td>';
    h += '<td>' + tagCorso(c.statoCorso) + '</td>';
    h += '<td class="text-right" data-val="' + c.consulenza + '">' + fmtE(c.consulenza) + '</td>';
    h += '<td class="text-right" data-val="' + c.costi + '">' + fmtE(c.costi) + '</td>';
    h += '<td class="text-right" data-val="' + c.mol + '">' + fmtE(c.mol) + '</td>';
    h += '<td class="text-right" data-val="' + c.ore + '">' + fmt(c.ore) + '</td>';
    h += '<td data-val="' + c.avanzamento + '">' + c.avanzamento + '%</td>';
    h += '<td><button class="btn-erp" onclick="openErp(' + c.id + ')">Apri ERP</button></td>';
    h += '</tr>';
  });

  // Totals
  const tC = items.reduce((s, c) => s + c.consulenza, 0);
  const tK = items.reduce((s, c) => s + c.costi, 0);
  const tM = items.reduce((s, c) => s + c.mol, 0);
  const tO = items.reduce((s, c) => s + c.ore, 0);
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td colspan="5" class="text-right"><strong>TOTALE</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tC) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tK) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tM) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(tO) + '</strong></td>';
  h += '<td colspan="2"></td></tr></tfoot></table></div>';

  // Pagination
  if (totalPages > 1) {
    h += '<div class="modal-pagination">';
    h += '<button onclick="goMPage(0)">&laquo;</button>';
    h += '<button onclick="goMPage(' + Math.max(0, cur.page - 1) + ')">&lsaquo;</button>';
    let sp = Math.max(0, cur.page - 2), ep = Math.min(totalPages, sp + 5);
    if (ep - sp < 5) sp = Math.max(0, ep - 5);
    for (let i = sp; i < ep; i++) {
      h += '<button class="' + (i === cur.page ? 'active' : '') + '" onclick="goMPage(' + i + ')">' + (i + 1) + '</button>';
    }
    h += '<button onclick="goMPage(' + Math.min(totalPages - 1, cur.page + 1) + ')">&rsaquo;</button>';
    h += '<button onclick="goMPage(' + (totalPages - 1) + ')">&raquo;</button>';
    h += '<span style="margin-left:8px;color:var(--text2);font-size:10px">Pag. ' + (cur.page + 1) + ' di ' + totalPages + '</span>';
    h += '</div>';
  }
  return h;
}

function goMPage(p) { _cur().page = p; applyMFilters(); }

/* ── ERP Link ── */
function openErp(commessaId) {
  const c = D.find(x => x.id === commessaId);
  if (c && c.erpLink) {
    window.open(c.erpLink, '_blank');
  } else {
    // Save stack, show ERP popup, restore on close
    const savedStack = [..._mStack];
    _mStack = [];
    openModal('Modifica Commessa #' + commessaId,
      '<div style="text-align:center;padding:40px">' +
      '<div style="font-size:40px;margin-bottom:12px">&#9888;</div>' +
      '<h3 style="margin-bottom:8px">Modifica Commessa - Impossibile</h3>' +
      '<p style="color:var(--text2)">Link ERP non presente e non esportato per la commessa <strong>#' + commessaId + '</strong>.</p>' +
      '<p style="color:var(--text3);font-size:11px;margin-top:12px">Per abilitare questa funzione, esportare il campo &quot;Link ERP&quot; dal gestionale.</p>' +
      '<button class="btn-back" style="margin-top:16px" onclick="_mStack=' + JSON.stringify(savedStack).replace(/"/g, '&quot;') + ';renderCurrentLevel()">&#8592; Torna al drill-down</button>' +
      '</div>'
    );
  }
}

/* ── Export CSV ── */
function exportMCSV() {
  const items = getFilteredMItems();
  const hdrs = ['ID', 'Contratto', 'Titolo del corso', 'Corso (tipo)', 'Cliente', 'Societa', 'Sede', 'Responsabile', 'Status', 'Stato Corso', 'Ricavi', 'Costi', 'MOL', 'Ore', 'Avanzamento'];
  let csv = '\uFEFF' + hdrs.join(';') + '\n';
  items.forEach(c => {
    csv += [c.id, csvSafe(c.contratto), csvSafe(c.titolo || c.corso), csvSafe(c.corso), csvSafe(c.cliente), csvSafe(c.societa),
      csvSafe(c.sedeOp), csvSafe(c.responsabile), csvSafe(c.status), csvSafe(c.statoCorso),
      c.consulenza, c.costi, c.mol, c.ore, c.avanzamento].join(';') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const path = _mStack.map(l => l.value).join('_');
  a.download = (path || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.csv';
  a.click();
}
