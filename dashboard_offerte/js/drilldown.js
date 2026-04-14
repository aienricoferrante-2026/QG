/* ── Drill-down Navigator ── */

const DRILL_FIELDS = [
  { key: 'agente', label: 'Commerciale' },
  { key: 'categoria', label: 'Categoria' },
  { key: 'societa', label: 'Societa' },
  { key: 'sede_op', label: 'Sede Operativa' },
  { key: 'status', label: 'Status' },
  { key: 'anno', label: 'Anno' }
];

let _mStack = [];
let _mPerPage = 50;
function _cur() { return _mStack[_mStack.length - 1]; }

function openModal(title, html) {
  document.getElementById('modalTitle').innerHTML = title;
  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); _mStack = []; }

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal').addEventListener('click', e => { if (e.target === document.getElementById('modal')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
});

function drillDown(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => String(c[field]) === String(value));
  _mStack = [{ title: value, items: filtered.filter(matchFn), field, value, page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}
function drillDownItems(title, items) {
  _mStack = [{ title, items, field: '', value: '', page: 0, perPage: _mPerPage, groupField: null }];
  renderCurrentLevel();
}
function drillDown2(field, value) {
  const matchFn = value === 'N/D' ? (c => !c[field] || c[field] === 'N/D') : (c => String(c[field]) === String(value));
  _mStack.push({ title: value, items: getFilteredMItems().filter(matchFn), field, value, page: 0, perPage: _mPerPage, groupField: null });
  renderCurrentLevel();
}
function goBack() { if (_mStack.length > 1) { _mStack.pop(); renderCurrentLevel(); } else closeModal(); }
function goToLevel(n) { _mStack = _mStack.slice(0, n + 1); renderCurrentLevel(); }
function setGroupField(field) { const c = _cur(); c.groupField = c.groupField === field ? null : field; c.page = 0; renderCurrentLevel(); }

function renderCurrentLevel() {
  const cur = _cur(); const depth = _mStack.length;
  let h = '';
  if (depth > 1) {
    h += '<div class="modal-breadcrumb">';
    _mStack.forEach((lev, i) => {
      const isLast = i === _mStack.length - 1;
      const label = lev.field ? DRILL_FIELDS.find(f => f.key === lev.field)?.label || lev.field : '';
      const short = String(lev.value).length > 30 ? String(lev.value).substring(0, 28) + '..' : lev.value;
      if (isLast) h += '<span class="current">' + (label ? label + ': ' : '') + short + '</span>';
      else { h += '<span onclick="goToLevel(' + i + ')">' + (label ? label + ': ' : '') + short + '</span><span class="sep">&#8250;</span>'; }
    });
    h += '</div>';
  }
  // Toolbar
  h += '<div class="modal-toolbar"><div class="modal-search"><input type="text" id="modalSearch" placeholder="Cerca..." oninput="onMSearch()"></div>';
  h += '<div class="modal-actions"><label style="color:var(--text2);font-size:10px;display:flex;align-items:center;gap:4px">Righe <select id="modalPerPage" onchange="changeMPerPage(this.value)" class="per-page-select">';
  [25,50,100,200].forEach(n => { h += '<option value="'+n+'"'+(n===cur.perPage?' selected':'')+'>'+n+'</option>'; });
  h += '<option value="0"'+(cur.perPage===0?' selected':'')+'>Tutte</option></select></label>';
  h += '<button class="btn-export" onclick="exportMCSV()">&#8681; CSV</button></div></div>';
  // KPIs
  const items = getFilteredMItems();
  const tot = items.reduce((s,c)=>s+c.totale,0);
  const contr = items.filter(c=>c.status==='Offerta Contrattualizzata').length;
  h += '<div id="modalKpis" class="modal-kpis">';
  h += mkpi(fmt(items.length),'Offerte') + mkpi(fmtK(tot),'Valore') + mkpi(fmt(contr),'Contratt.') + mkpi(pct(contr,items.length),'Tasso Conv.');
  h += '</div>';
  // Group bar
  const drilledFields = _mStack.map(l=>l.field).filter(Boolean);
  const available = DRILL_FIELDS.filter(f=>!drilledFields.includes(f.key));
  if (available.length) {
    h += '<div class="group-bar"><span style="color:var(--text2);font-size:10px;margin-right:4px">Raggruppa per:</span>';
    available.forEach(f => { h += '<button class="group-btn'+(cur.groupField===f.key?' active':'')+'" onclick="setGroupField(\''+f.key+'\')">'+f.label+'</button>'; });
    h += '</div>';
  }
  // Table
  h += '<div id="modalTableWrap">';
  h += cur.groupField ? buildGroupedModalTable(items, cur.groupField) : buildDetailModalTable(items);
  h += '</div>';
  const backBtn = depth > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : '';
  openModal(backBtn + cur.title + ' (' + items.length + ' offerte)', h);
}

function onMSearch() { _cur().page = 0; applyMFilters(); }
function changeMPerPage(v) { _cur().perPage = parseInt(v); _cur().page = 0; applyMFilters(); }

function getFilteredMItems() {
  if (!_mStack.length) return [];
  const cur = _cur();
  const q = (document.getElementById('modalSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';
  return cur.items.filter(c => {
    if (search && !(c.cliente+' '+c.tipo+' '+c.agente+' '+c.societa+' '+c.categoria).toLowerCase().includes(search)) return false;
    return true;
  });
}

function applyMFilters() {
  const items = getFilteredMItems();
  const tot = items.reduce((s,c)=>s+c.totale,0);
  const contr = items.filter(c=>c.status==='Offerta Contrattualizzata').length;
  const el = document.getElementById('modalKpis');
  if (el) el.innerHTML = mkpi(fmt(items.length),'Offerte')+mkpi(fmtK(tot),'Valore')+mkpi(fmt(contr),'Contratt.')+mkpi(pct(contr,items.length),'Tasso Conv.');
  const wrap = document.getElementById('modalTableWrap');
  if (wrap) { const cur = _cur(); wrap.innerHTML = cur.groupField ? buildGroupedModalTable(items, cur.groupField) : buildDetailModalTable(items); }
  const titleEl = document.getElementById('modalTitle');
  if (titleEl) { const backBtn = _mStack.length > 1 ? '<button class="btn-back" onclick="goBack()">&#8592; Indietro</button> ' : ''; titleEl.innerHTML = backBtn + _cur().title + ' (' + items.length + ' offerte)'; }
}

function buildGroupedModalTable(items, groupField) {
  const label = DRILL_FIELDS.find(f=>f.key===groupField)?.label || groupField;
  const g = {};
  items.forEach(c => { const k = String(c[groupField] || 'N/D'); if (!g[k]) g[k] = {cnt:0,tot:0,contr:0}; g[k].cnt++; g[k].tot+=c.totale; if(c.status==='Offerta Contrattualizzata') g[k].contr++; });
  const sorted = Object.entries(g).sort((a,b)=>b[1].tot-a[1].tot);
  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr><th>'+label+'</th><th>Offerte</th><th>Valore</th><th>Contratt.</th><th>Conv. %</th></tr></thead><tbody>';
  sorted.forEach(([k,v])=>{
    const esc = k.replace(/'/g,"\\'");
    h+='<tr class="clickable" onclick="drillDown2(\''+groupField+'\',\''+esc+'\')">';
    h+='<td>'+(k.length>50?k.substring(0,48)+'..':k)+'</td><td class="text-right">'+fmt(v.cnt)+'</td><td class="text-right">'+fmtE(v.tot)+'</td><td class="text-right">'+fmt(v.contr)+'</td><td class="text-right">'+pct(v.contr,v.cnt)+'</td></tr>';
  });
  h+='</tbody><tfoot><tr class="totals-row"><td><strong>TOTALE ('+sorted.length+')</strong></td><td class="text-right"><strong>'+fmt(items.length)+'</strong></td>';
  h+='<td class="text-right"><strong>'+fmtE(items.reduce((s,c)=>s+c.totale,0))+'</strong></td>';
  h+='<td class="text-right"><strong>'+fmt(items.filter(c=>c.status==='Offerta Contrattualizzata').length)+'</strong></td><td></td></tr></tfoot></table></div>';
  return h;
}

function buildDetailModalTable(items) {
  const cur = _cur();
  const pp = cur.perPage === 0 ? items.length : cur.perPage;
  const totalPages = Math.max(1, Math.ceil(items.length / pp));
  if (cur.page >= totalPages) cur.page = totalPages - 1;
  const paged = items.slice(cur.page * pp, cur.page * pp + pp);
  let h = '<div class="tbl-scroll"><table id="modalTbl"><thead><tr>';
  ['ID','Data','Cliente','Tipo','Categoria','Totale','Status','Commerciale'].forEach((hd,i)=>{
    h+='<th onclick="sortTbl(\'modalTbl\','+i+',\''+(i===5?'num':'str')+'\')">'+hd+'</th>';
  });
  h+='</tr></thead><tbody>';
  paged.forEach(c=>{
    h+='<tr><td>'+c.id+'</td><td>'+c.data_full+'</td><td>'+(c.cliente||'')+'</td><td>'+(c.tipo||'').substring(0,40)+'</td>';
    h+='<td>'+(c.categoria||'')+'</td><td class="text-right" data-val="'+c.totale+'">'+fmtE(c.totale)+'</td>';
    h+='<td>'+tagStatus(c.status)+'</td><td>'+(c.agente||'-')+'</td></tr>';
  });
  h+='</tbody></table></div>';
  if (totalPages > 1) {
    h+='<div class="modal-pagination">';
    h+='<button onclick="goMPage(0)">&laquo;</button><button onclick="goMPage('+Math.max(0,cur.page-1)+')">&lsaquo;</button>';
    let sp=Math.max(0,cur.page-2),ep=Math.min(totalPages,sp+5); if(ep-sp<5) sp=Math.max(0,ep-5);
    for(let i=sp;i<ep;i++) h+='<button class="'+(i===cur.page?'active':'')+'" onclick="goMPage('+i+')">'+(i+1)+'</button>';
    h+='<button onclick="goMPage('+Math.min(totalPages-1,cur.page+1)+')">&rsaquo;</button>';
    h+='<button onclick="goMPage('+(totalPages-1)+')">&raquo;</button>';
    h+='<span style="margin-left:8px;color:var(--text2);font-size:10px">Pag. '+(cur.page+1)+' di '+totalPages+'</span></div>';
  }
  return h;
}
function goMPage(p) { _cur().page = p; applyMFilters(); }

function exportMCSV() {
  const items = getFilteredMItems();
  let csv = '\uFEFF' + 'ID;Data;Cliente;Tipo;Categoria;Totale;Status;Commerciale;Societa;Sede\n';
  items.forEach(c => { csv += [c.id,csvSafe(c.data_full),csvSafe(c.cliente),csvSafe(c.tipo),csvSafe(c.categoria),c.totale,csvSafe(c.status),csvSafe(c.agente),csvSafe(c.societa),csvSafe(c.sede_op)].join(';')+'\n'; });
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = (_mStack.map(l=>l.value).join('_')||'export').replace(/[^a-zA-Z0-9]/g,'_')+'.csv'; a.click();
}
