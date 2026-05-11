/* ── Multi-level Stack-based Drill-down Navigator (core) ── */

const DRILL_FIELDS_DEFAULT = [
  { key: 'sedeNorm', label: 'Sede' },
  { key: 'sedeOp', label: 'Sede Operativa' },
  { key: 'cliente', label: 'Cliente' },
  { key: 'regione', label: 'Regione' },
  { key: 'responsabile', label: 'Responsabile' },
  { key: 'societa', label: 'Societa' },
  { key: 'status', label: 'Status' },
  { key: 'statoLav', label: 'Stato Lavorazione' }
];

function _drillFields() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.drillFields) || DRILL_FIELDS_DEFAULT;
}
const DRILL_FIELDS = new Proxy([], {
  get(_, prop) {
    const arr = _drillFields();
    if (prop === 'find') return arr.find.bind(arr);
    if (prop === 'filter') return arr.filter.bind(arr);
    if (prop === 'forEach') return arr.forEach.bind(arr);
    if (prop === 'map') return arr.map.bind(arr);
    if (prop === 'length') return arr.length;
    return arr[prop];
  }
});

let _mStack = [];
let _mPerPage = 50;

function _cur() { return _mStack[_mStack.length - 1]; }

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
  const m = document.getElementById('modal');
  if (!m) return;
  m.addEventListener('click', e => { if (e.target === m) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

function drillDown(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => c[field] === value);
  _mStack = [{ title: value, items: filtered.filter(matchFn), field, value, page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}
function drillDownItems(title, items) {
  _mStack = [{ title, items, field: '', value: '', page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}
function drillDownCustom(title, filterFn) { drillDownItems(title, filtered.filter(filterFn)); }

function drillDown2(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => c[field] === value);
  const items = getFilteredMItems().filter(matchFn);
  _mStack.push({ title: value, items, field, value, page: 0, perPage: _mPerPage, groupField: null });
  renderCurrentLevel();
}

function goBack() {
  if (_mStack.length > 1) { _mStack.pop(); renderCurrentLevel(); }
  else closeModal();
}
function goToLevel(n) { _mStack = _mStack.slice(0, n + 1); renderCurrentLevel(); }
function setGroupField(field) {
  const cur = _cur();
  cur.groupField = cur.groupField === field ? null : field;
  cur.page = 0;
  renderCurrentLevel();
}

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
  h += cur.groupField ? buildGroupedTable(getFilteredMItems(), cur.groupField) : buildMTable(getFilteredMItems());
  h += '</div>';

  const backBtn = depth > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : '';
  openModal(backBtn + cur.title + ' (' + getFilteredMItems().length + ' commesse)', h);
}

function buildBreadcrumb() {
  const fields = _drillFields();
  let h = '<div class="modal-breadcrumb">';
  _mStack.forEach((lev, i) => {
    const isLast = i === _mStack.length - 1;
    const fdef = lev.field ? fields.find(f => f.key === lev.field) : null;
    const label = fdef ? fdef.label : '';
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

function buildMToolbar() {
  const cur = _cur();
  let h = '<div class="modal-toolbar">';
  h += '<div class="modal-search"><input type="text" id="modalSearch" placeholder="Cerca cliente, titolo, contratto..." oninput="onMSearch()"></div>';
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

function buildGroupBar() {
  const cur = _cur();
  const drilled = _mStack.map(l => l.field).filter(Boolean);
  const available = _drillFields().filter(f => !drilled.includes(f.key));
  if (!available.length) return '';
  let h = '<div class="group-bar"><span style="color:var(--text2);font-size:10px;margin-right:4px">Raggruppa per:</span>';
  available.forEach(f => {
    const active = cur.groupField === f.key ? ' active' : '';
    h += '<button class="group-btn' + active + '" onclick="setGroupField(\'' + f.key + '\')">' + f.label + '</button>';
  });
  h += '</div>';
  return h;
}

function _modalFilterDefs() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.modalFilters) || [
    { id: 'mfStatus', label: 'Status', key: 'status' },
    { id: 'mfStatoLav', label: 'Stato Lavorazione', key: 'statoLav' },
    { id: 'mfResp', label: 'Responsabile', key: 'responsabile' },
    { id: 'mfSede', label: 'Sede', key: 'sedeNorm' },
    { id: 'mfCliM', label: 'Cliente', key: 'cliente' }
  ];
}

function buildMFilters() {
  const cur = _cur();
  const allItems = cur.items;
  const drilled = _mStack.map(l => l.field).filter(Boolean);
  const fields = _modalFilterDefs().filter(f => !drilled.includes(f.key));
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
  const defs = _modalFilterDefs();
  const fv = {};
  defs.forEach(d => { const el = document.getElementById(d.id); if (el) fv[d.key] = el.value; });
  const q = (document.getElementById('modalSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';
  return cur.items.filter(c => {
    for (const [key, val] of Object.entries(fv)) { if (val && c[key] !== val) return false; }
    if (search) {
      const blob = (c.cliente + ' ' + (c.titolo || '') + ' ' + (c.contratto || '') + ' ' + (c.responsabile || '')).toLowerCase();
      if (!blob.includes(search)) return false;
    }
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
  _modalFilterDefs().forEach(d => { const el = document.getElementById(d.id); if (el) el.value = ''; });
  const s = document.getElementById('modalSearch'); if (s) s.value = '';
  applyMFilters();
}

function buildMKpis(items) {
  const cons = items.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = items.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = items.reduce((s, c) => s + (c.mol || 0), 0);
  const inc = items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const cli = new Set(items.map(c => c.cliente)).size;
  let h = mkpi(fmt(items.length), 'Commesse');
  h += mkpi(fmt(cli), 'Clienti');
  h += mkpi(fmtE(cons), 'Ricavi');
  h += mkpi(fmtE(costi), 'Costi');
  h += mkpi(fmtE(mol), 'MOL');
  h += mkpi(fmtE(inc), 'Incassato');
  return h;
}

function buildGroupedTable(items, groupField) {
  const fdef = _drillFields().find(f => f.key === groupField);
  const label = fdef ? fdef.label : groupField;
  const g = {};
  items.forEach(c => {
    const k = c[groupField] || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, inc: 0 };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
    g[k].costi += (c.costi || 0);
    g[k].mol += (c.mol || 0);
    g[k].inc += (c.giaIncassato || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);
  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  h += '<th>' + label + '</th><th>Comm.</th><th>Ricavi</th><th>Costi</th><th>MOL</th><th>Incassato</th></tr></thead><tbody>';
  sorted.forEach(([k, v]) => {
    const escaped = String(k).replace(/'/g, "\\'");
    h += '<tr class="clickable" onclick="drillDown2(\'' + groupField + '\',\'' + escaped + '\')">';
    h += '<td>' + (k.length > 50 ? k.substring(0, 48) + '..' : k) + '</td>';
    h += '<td class="text-right">' + fmt(v.cnt) + '</td>';
    h += '<td class="text-right">' + fmtE(v.cons) + '</td>';
    h += '<td class="text-right">' + fmtE(v.costi) + '</td>';
    h += '<td class="text-right">' + fmtE(v.mol) + '</td>';
    h += '<td class="text-right">' + fmtE(v.inc) + '</td>';
    h += '</tr>';
  });
  const tC = items.reduce((s, c) => s + (c.consulenza || 0), 0);
  const tK = items.reduce((s, c) => s + (c.costi || 0), 0);
  const tM = items.reduce((s, c) => s + (c.mol || 0), 0);
  const tI = items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td><strong>TOTALE (' + sorted.length + ')</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(items.length) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tC) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tK) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tM) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tI) + '</strong></td>';
  h += '</tr></tfoot></table></div>';
  return h;
}

function buildMTable(items) {
  const cur = _cur();
  const hdrs = ['ID', 'Titolo', 'Cliente', 'Status', 'Stato Lav.', 'Ricavi', 'Costi', 'MOL', 'Incassato', 'Avz.', 'Qnet'];
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
    h += '<td>' + (c.id || '') + '</td>';
    h += '<td>' + ((c.titolo || c.contratto || '') + '').substring(0, 60) + '</td>';
    h += '<td>' + (c.cliente || '') + '</td>';
    h += '<td>' + tagStatus(c.status) + '</td>';
    h += '<td>' + (c.statoLav || '') + '</td>';
    h += '<td class="text-right" data-val="' + (c.consulenza || 0) + '">' + fmtE(c.consulenza || 0) + '</td>';
    h += '<td class="text-right" data-val="' + (c.costi || 0) + '">' + fmtE(c.costi || 0) + '</td>';
    h += '<td class="text-right" data-val="' + (c.mol || 0) + '">' + fmtE(c.mol || 0) + '</td>';
    h += '<td class="text-right" data-val="' + (c.giaIncassato || 0) + '">' + fmtE(c.giaIncassato || 0) + '</td>';
    h += '<td data-val="' + (c.avanzamento || 0) + '">' + (c.avanzamento || 0) + '%</td>';
    h += '<td>' + qnetBtn(c) + '</td>';
    h += '</tr>';
  });
  const tC = items.reduce((s, c) => s + (c.consulenza || 0), 0);
  const tK = items.reduce((s, c) => s + (c.costi || 0), 0);
  const tM = items.reduce((s, c) => s + (c.mol || 0), 0);
  const tI = items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td colspan="5" class="text-right"><strong>TOTALE</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tC) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tK) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tM) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tI) + '</strong></td>';
  h += '<td colspan="2"></td></tr></tfoot></table></div>';

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

function exportMCSV() {
  const items = getFilteredMItems();
  const hdrs = ['ID', 'Contratto', 'Titolo', 'Cliente', 'Societa', 'Sede', 'Responsabile', 'Status', 'Stato Lav.', 'Ricavi', 'Costi', 'MOL', 'Incassato', 'Avz.'];
  let csv = '﻿' + hdrs.join(';') + '\n';
  items.forEach(c => {
    csv += [c.id || '', csvSafe(c.contratto), csvSafe(c.titolo), csvSafe(c.cliente), csvSafe(c.societa),
      csvSafe(c.sedeOp), csvSafe(c.responsabile), csvSafe(c.status), csvSafe(c.statoLav),
      c.consulenza || 0, c.costi || 0, c.mol || 0, c.giaIncassato || 0, c.avanzamento || 0].join(';') + '\n';
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const path = _mStack.map(l => l.value).join('_');
  a.download = (path || 'export').replace(/[^a-zA-Z0-9]/g, '_') + '.csv';
  a.click();
}
