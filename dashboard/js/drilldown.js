/* Modal drill-down system with in-modal filtering, search, export */

let _modalItems = [];   // original unfiltered items for current modal
let _modalTitle = '';    // current modal title
let _modalPage = 0;
let _modalPerPage = 50;

function openModal(title, html) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  _modalItems = [];
}

/* Close on overlay click + ESC key */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', e => {
    if (e.target === document.getElementById('modal')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

/* Core: render items list in modal with filters */
function drillDownItems(title, items) {
  _modalItems = items;
  _modalTitle = title;
  _modalPage = 0;
  renderModal(items);
}

/* Render (or re-render) modal content */
function renderModal(items) {
  let h = buildModalToolbar();
  h += buildModalFilters();
  h += '<div id="modalKpis" class="modal-kpis">' + buildModalKpis(items) + '</div>';
  h += '<div id="modalTableWrap">' + buildModalTable(items) + '</div>';
  openModal(_modalTitle + ' (' + items.length + ' commesse)', h);
}

/* Search + Export toolbar */
function buildModalToolbar() {
  let h = '<div class="modal-toolbar">';
  h += '<div class="modal-search">';
  h += '<input type="text" id="modalSearch" placeholder="Cerca cliente..." oninput="_modalPage=0;applyModalFilters()">';
  h += '</div>';
  h += '<div class="modal-actions">';
  h += '<label style="color:var(--text2);font-size:.78rem;display:flex;align-items:center;gap:4px">';
  h += 'Righe <select id="modalPerPage" onchange="changeModalPerPage(this.value)" style="background:var(--card2);border:1px solid var(--border);color:var(--text);padding:3px 6px;border-radius:6px;font-size:.78rem">';
  [25, 50, 100, 200].forEach(n => {
    h += '<option value="' + n + '"' + (n === _modalPerPage ? ' selected' : '') + '>' + n + '</option>';
  });
  h += '<option value="0"' + (_modalPerPage === 0 ? ' selected' : '') + '>Tutte</option>';
  h += '</select></label>';
  h += '<button class="btn-export" onclick="exportModalCSV()">&#8681; Esporta CSV</button>';
  h += '</div></div>';
  return h;
}

function changeModalPerPage(val) {
  _modalPerPage = parseInt(val);
  _modalPage = 0;
  applyModalFilters();
}

/* Build filter bar for modal */
function buildModalFilters() {
  const fields = [
    { id: 'mfStatus', label: 'Status', key: 'st' },
    { id: 'mfSpag', label: 'Stato Pag.', key: 'sps' },
    { id: 'mfSlav', label: 'Stato Lav.', key: 'sl' },
    { id: 'mfContratto', label: 'Contratto', key: 'ct' },
    { id: 'mfAgente', label: 'Commerciale', key: 'ag' },
    { id: 'mfResp', label: 'Responsabile', key: 'rp' },
  ];

  let h = '<div class="modal-filters">';
  fields.forEach(f => {
    const vals = [...new Set(_modalItems.map(c => c[f.key]).filter(Boolean))].sort();
    if (vals.length < 2) return;
    h += '<div class="modal-filter">';
    h += '<label>' + f.label + '</label>';
    h += '<select id="' + f.id + '" onchange="applyModalFilters()">';
    h += '<option value="">Tutti (' + vals.length + ')</option>';
    vals.forEach(v => {
      const cnt = _modalItems.filter(c => c[f.key] === v).length;
      const short = v.length > 30 ? v.substring(0, 28) + '..' : v;
      h += '<option value="' + v.replace(/"/g, '&quot;') + '">' + short + ' (' + cnt + ')</option>';
    });
    h += '</select></div>';
  });
  h += '<button class="modal-filter-reset" onclick="resetModalFilters()">Reset</button>';
  h += '</div>';
  return h;
}

/* Get currently filtered items */
function getFilteredModalItems() {
  const filterIds = [
    { id: 'mfStatus', key: 'st' }, { id: 'mfSpag', key: 'sps' },
    { id: 'mfSlav', key: 'sl' }, { id: 'mfContratto', key: 'ct' },
    { id: 'mfAgente', key: 'ag' }, { id: 'mfResp', key: 'rp' },
  ];
  const fVals = {};
  filterIds.forEach(f => {
    const el = document.getElementById(f.id);
    if (el) fVals[f.key] = el.value;
  });

  const searchEl = document.getElementById('modalSearch');
  const search = searchEl ? searchEl.value.toLowerCase().trim() : '';

  return _modalItems.filter(c => {
    for (const [key, val] of Object.entries(fVals)) {
      if (val && c[key] !== val) return false;
    }
    if (search && !c.cl.toLowerCase().includes(search)) return false;
    return true;
  });
}

/* Apply modal filters */
function applyModalFilters() {
  const items = getFilteredModalItems();
  document.getElementById('modalKpis').innerHTML = buildModalKpis(items);
  document.getElementById('modalTableWrap').innerHTML = buildModalTable(items);
  document.getElementById('modalTitle').textContent =
    _modalTitle + ' (' + items.length + ' commesse)';
}

function goModalPage(p) { _modalPage = p; applyModalFilters(); }

/* Reset modal filters */
function resetModalFilters() {
  ['mfStatus', 'mfSpag', 'mfSlav', 'mfContratto', 'mfAgente', 'mfResp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const s = document.getElementById('modalSearch');
  if (s) s.value = '';
  applyModalFilters();
}

/* Export CSV */
function exportModalCSV() {
  const items = getFilteredModalItems();
  const hdrs = ['ID', 'Cliente', 'Contratto', 'Status', 'Stato Pagamento', 'Stato Lavorazione', 'Consulenza', 'Ente', 'Commerciale', 'Responsabile', 'Citta', 'Provincia', 'Regione', 'Anno'];
  const rows = items.map(c => [
    c.id, csvSafe(c.cl), csvSafe(c.ct), csvSafe(c.st), csvSafe(c.sp),
    csvSafe(c.sl), c.co, c.en, csvSafe(c.ag), csvSafe(c.rp),
    csvSafe(c.ci), csvSafe(c.pv), csvSafe(c.rg), c.an
  ]);
  let csv = '\uFEFF' + hdrs.join(';') + '\n';
  rows.forEach(r => { csv += r.join(';') + '\n'; });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = _modalTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function csvSafe(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }

/* Build KPIs HTML */
function buildModalKpis(items) {
  const cons = items.reduce((s, c) => s + c.co, 0);
  const ente = items.reduce((s, c) => s + c.en, 0);
  const cli = new Set(items.map(c => c.cl)).size;
  let h = mkpi(fmt(items.length), 'Commesse');
  h += mkpi(fmt(cli), 'Clienti');
  h += mkpi(fmtE(cons), 'Consulenza');
  h += mkpi(fmtE(ente), 'Ente');
  h += mkpi(fmtE(cons + ente), 'Totale');
  return h;
}

/* Drill-down by field=value (used by table rows) */
function drillDown(field, value) {
  drillDownItems(value, filtered.filter(c => c[field] === value));
}

/* Drill-down with custom filter function (used by clickable cards) */
function drillDownCustom(title, filterFn) {
  drillDownItems(title, filtered.filter(filterFn));
}

/* Status tag helper */
function tagStatus(s) {
  if (!s) return '';
  const map = {
    'Eseguito': 'tag-green', 'Annullato': 'tag-red',
    'Pianificato': 'tag-blue', 'Da pianificare': 'tag-yellow'
  };
  return '<span class="tag ' + (map[s] || '') + '">' + s + '</span>';
}

/* Build the modal detail table with totals row and pagination */
function buildModalTable(items) {
  const mhdrs = ['ID', 'Cliente', 'Contratto', 'Status', 'Stato Pag.', 'Stato Lav.', 'Cons.', 'Ente', 'Commerciale', 'Resp.'];
  const mtypes = ['num', 'str', 'str', 'str', 'str', 'str', 'num', 'num', 'str', 'str'];

  // Pagination
  const effectivePerPage = _modalPerPage === 0 ? items.length : _modalPerPage;
  const totalPages = Math.max(1, Math.ceil(items.length / effectivePerPage));
  if (_modalPage >= totalPages) _modalPage = totalPages - 1;
  const start = _modalPage * effectivePerPage;
  const paged = items.slice(start, start + effectivePerPage);

  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  mhdrs.forEach((hd, i) => {
    h += '<th onclick="sortTbl(\'modalTbl\',' + i + ',\'' + mtypes[i] + '\')">' + hd + '</th>';
  });
  h += '</tr></thead><tbody>';

  paged.forEach(c => {
    h += '<tr>';
    h += '<td>' + c.id + '</td>';
    h += '<td>' + c.cl + '</td>';
    h += '<td>' + (c.ct || '') + '</td>';
    h += '<td>' + tagStatus(c.st) + '</td>';
    h += '<td>' + tagPag(c.sp) + '</td>';
    h += '<td class="sl-cell">' + (c.sl || '') + '</td>';
    h += '<td class="text-right" data-val="' + c.co + '">' + fmtE(c.co) + '</td>';
    h += '<td class="text-right" data-val="' + c.en + '">' + fmtE(c.en) + '</td>';
    h += '<td>' + (c.ag || '') + '</td>';
    h += '<td>' + (c.rp || '') + '</td>';
    h += '</tr>';
  });

  /* Totals row (always on all items, not just paged) */
  const tCons = items.reduce((s, c) => s + c.co, 0);
  const tEnte = items.reduce((s, c) => s + c.en, 0);
  h += '</tbody><tfoot><tr class="totals-row">';
  h += '<td colspan="6" class="text-right"><strong>TOTALE</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tCons) + '</strong></td>';
  h += '<td class="text-right"><strong>' + fmtE(tEnte) + '</strong></td>';
  h += '<td colspan="2"></td>';
  h += '</tr></tfoot>';
  h += '</table></div>';

  /* Pagination controls */
  if (totalPages > 1) {
    h += '<div class="modal-pagination">';
    h += '<button onclick="goModalPage(0)">&laquo;</button>';
    h += '<button onclick="goModalPage(' + Math.max(0, _modalPage - 1) + ')">&lsaquo;</button>';
    let sp = Math.max(0, _modalPage - 2);
    let ep = Math.min(totalPages, sp + 5);
    if (ep - sp < 5) sp = Math.max(0, ep - 5);
    for (let i = sp; i < ep; i++) {
      h += '<button class="' + (i === _modalPage ? 'active' : '') + '" onclick="goModalPage(' + i + ')">' + (i + 1) + '</button>';
    }
    h += '<button onclick="goModalPage(' + Math.min(totalPages - 1, _modalPage + 1) + ')">&rsaquo;</button>';
    h += '<button onclick="goModalPage(' + (totalPages - 1) + ')">&raquo;</button>';
    h += '<span style="margin-left:8px;color:var(--text2);font-size:.78rem">Pag. ' + (_modalPage + 1) + ' di ' + totalPages + '</span>';
    h += '</div>';
  }

  return h;
}

function mkpi(val, label) {
  return '<div class="modal-kpi"><div class="v">' + val + '</div><div class="l">' + label + '</div></div>';
}
