/* ── Multi-level Stack-based Drill-down Navigator ── */

const DRILL_FIELDS = [
  { key: 'corso', label: 'Corso' },
  { key: 'cpi', label: 'CPI' },
  { key: 'operatore', label: 'Operatore' },
  { key: 'status', label: 'Status' },
  { key: 'statoPrev', label: 'Stato Preventivo' },
  { key: 'tipologiaCorso', label: 'Tipologia' },
  { key: 'rendicontazione', label: 'Rendicontazione' }
];

let _mStack = [];
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

/* ── Drill Level 1 ── */
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

/* ── Drill Level 2+ ── */
function drillDown2(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => c[field] === value);
  const items = getFilteredMItems().filter(matchFn);
  _mStack.push({ title: value, items: items, field: field, value: value, page: 0, perPage: _mPerPage, groupField: null });
  renderCurrentLevel();
}

/* ── Navigation ── */
function goBack() {
  if (_mStack.length > 1) { _mStack.pop(); renderCurrentLevel(); }
  else closeModal();
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
  let h = '';
  if (depth > 1) h += buildBreadcrumb();
  h += buildMToolbar();
  h += buildMFilters();
  h += '<div id="modalKpis" class="modal-kpis">' + buildMKpis(getFilteredMItems()) + '</div>';
  h += buildGroupBar();
  h += '<div id="modalTableWrap">';
  if (cur.groupField) h += buildGroupedTable(getFilteredMItems(), cur.groupField);
  else h += buildMTable(getFilteredMItems());
  h += '</div>';
  const backBtn = depth > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : '';
  openModal(backBtn + cur.title + ' (' + getFilteredMItems().length + ' opportunità)', h);
}

/* ── Breadcrumb ── */
function buildBreadcrumb() {
  let h = '<div class="modal-breadcrumb">';
  _mStack.forEach((lev, i) => {
    const isLast = i === _mStack.length - 1;
    const label = lev.field ? DRILL_FIELDS.find(f => f.key === lev.field)?.label || lev.field : '';
    const short = lev.value.length > 30 ? lev.value.substring(0, 28) + '..' : lev.value;
    if (isLast) h += '<span class="current">' + (label ? label + ': ' : '') + short + '</span>';
    else {
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
  h += '<div class="modal-search"><input type="text" id="modalSearch" placeholder="Cerca corso, operatore, CPI..." oninput="onMSearch()"></div>';
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

/* ── Modal filters ── */
function buildMFilters() {
  const cur = _cur();
  const allItems = cur.items;
  const drilledFields = _mStack.map(l => l.field).filter(Boolean);
  const fields = [
    { id: 'mfStatus', label: 'Status', key: 'status' },
    { id: 'mfPrev', label: 'Stato Prev.', key: 'statoPrev' },
    { id: 'mfCorso', label: 'Corso', key: 'corso' },
    { id: 'mfCpi', label: 'CPI', key: 'cpi' },
    { id: 'mfOp', label: 'Operatore', key: 'operatore' },
    { id: 'mfTipo', label: 'Tipologia', key: 'tipologiaCorso' },
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
  const fIds = ['mfStatus', 'mfPrev', 'mfCorso', 'mfCpi', 'mfOp', 'mfTipo'];
  const fKeys = ['status', 'statoPrev', 'corso', 'cpi', 'operatore', 'tipologiaCorso'];
  const fv = {};
  fIds.forEach((id, i) => { const el = document.getElementById(id); if (el) fv[fKeys[i]] = el.value; });
  const q = (document.getElementById('modalSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';
  return cur.items.filter(c => {
    for (const [key, val] of Object.entries(fv)) { if (val && c[key] !== val) return false; }
    if (search && !(c.corso + ' ' + c.operatore + ' ' + c.cpi + ' ' + c.titolo + ' ' + c.status).toLowerCase().includes(search)) return false;
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
    titleEl.innerHTML = backBtn + _cur().title + ' (' + items.length + ' opportunità)';
  }
}

function resetMFilters() {
  ['mfStatus', 'mfPrev', 'mfCorso', 'mfCpi', 'mfOp', 'mfTipo'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const s = document.getElementById('modalSearch'); if (s) s.value = '';
  applyMFilters();
}

/* ── Modal KPIs ── */
function buildMKpis(items) {
  const nuove = items.filter(c => c.status === 'Nuova').length;
  const accettate = items.filter(c => c.status === 'Accettato').length;
  const perse = items.filter(c => c.status === 'Persa').length;
  const cpi = new Set(items.map(c => c.cpi).filter(Boolean)).size;
  let h = mkpi(fmt(items.length), 'Opportunità');
  h += mkpi(fmt(cpi), 'CPI');
  h += mkpi(fmt(nuove), 'Nuove');
  h += mkpi(fmt(accettate), 'Accettate');
  h += mkpi(fmt(perse), 'Perse');
  return h;
}

/* ── Grouped table ── */
function buildGroupedTable(items, groupField) {
  const label = DRILL_FIELDS.find(f => f.key === groupField)?.label || groupField;
  const g = {};
  items.forEach(c => {
    const k = c[groupField] || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, nuove: 0, accettate: 0, perse: 0 };
    g[k].cnt++;
    if (c.status === 'Nuova') g[k].nuove++;
    if (c.status === 'Accettato') g[k].accettate++;
    if (c.status === 'Persa') g[k].perse++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  h += '<th>' + label + '</th><th>Opp.</th><th>Nuove</th><th>Accettate</th><th>Perse</th>';
  h += '</tr></thead><tbody>';
  sorted.forEach(([k, v]) => {
    const escaped = k.replace(/'/g, "\\'");
    h += '<tr class="clickable" onclick="drillDown2(\'' + groupField + '\',\'' + escaped + '\')">';
    h += '<td>' + (k.length > 50 ? k.substring(0, 48) + '..' : k) + '</td>';
    h += '<td class="text-right">' + fmt(v.cnt) + '</td>';
    h += '<td class="text-right">' + fmt(v.nuove) + '</td>';
    h += '<td class="text-right">' + fmt(v.accettate) + '</td>';
    h += '<td class="text-right">' + fmt(v.perse) + '</td>';
    h += '</tr>';
  });
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td><strong>TOTALE (' + sorted.length + ')</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.length) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.filter(c => c.status === 'Nuova').length) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.filter(c => c.status === 'Accettato').length) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.filter(c => c.status === 'Persa').length) + '</strong></td>';
  h += '</tr></tfoot></table></div>';
  return h;
}

/* ── Detail table ── */
function buildMTable(items) {
  const cur = _cur();
  const hdrs = ['ID', 'Titolo', 'Corso', 'Status', 'St. Prev.', 'CPI', 'Operatore', 'Tipologia'];
  const types = ['num', 'str', 'str', 'str', 'str', 'str', 'str', 'str'];

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
    h += '<td>' + (c.titolo || '').substring(0, 40) + '</td>';
    h += '<td>' + (c.corso || '-') + '</td>';
    h += '<td>' + tagStatus(c.status) + '</td>';
    h += '<td>' + (c.statoPrev || '-') + '</td>';
    h += '<td>' + (c.cpi || '-') + '</td>';
    h += '<td>' + (c.operatore || '-') + '</td>';
    h += '<td>' + (c.tipologiaCorso || '-') + '</td>';
    h += '</tr>';
  });

  h += '</tbody></table></div>';

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

/* ── Export CSV ── */
function exportMCSV() {
  const items = getFilteredMItems();
  const hdrs = ['ID', 'Data', 'Titolo', 'Corso', 'Status', 'Stato Preventivo', 'CPI', 'Operatore', 'Tipologia', 'Rendicontazione'];
  let csv = '\uFEFF' + hdrs.join(';') + '\n';
  items.forEach(c => {
    csv += [c.id, csvSafe(c.data), csvSafe(c.titolo), csvSafe(c.corso), csvSafe(c.status),
      csvSafe(c.statoPrev), csvSafe(c.cpi), csvSafe(c.operatore), csvSafe(c.tipologiaCorso),
      csvSafe(c.rendicontazione)].join(';') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const path = _mStack.map(l => l.value).join('_');
  a.download = (path || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.csv';
  a.click();
}
