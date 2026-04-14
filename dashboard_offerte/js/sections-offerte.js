/* ── Sezioni: Agenti, Categorie, Societa, Trend, Tabella, Alert ── */

function renderAgenti() {
  const el = document.getElementById('sec-agenti');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.agente || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, tot: 0, contr: 0, contrVal: 0, rif: 0, pres: 0 };
    g[k].cnt++; g[k].tot += c.totale;
    if (c.status === 'Offerta Contrattualizzata') { g[k].contr++; g[k].contrVal += c.totale; }
    if (c.status === 'Offerta Rifiutata') g[k].rif++;
    if (c.status === 'Offerta Presentata') g[k].pres++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].tot - a[1].tot);

  let h = '<div class="sec"><h3 class="sec-title">Performance Commerciali</h3>';
  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 per Valore</h4><div class="chart-wrap"><canvas id="chAgVal"></canvas></div></div>';
  h += '<div class="card"><h4>Top 15 per Tasso Conversione</h4><div class="chart-wrap"><canvas id="chAgConv"></canvas></div></div>';
  h += '</div>';
  h += '<div class="card" style="margin-top:14px"><h4>Tutti i Commerciali (' + sorted.length + ')</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Clicca su una riga per il drill-down.</p>';
  h += '<div class="tbl-scroll"><table id="tblAgenti"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.filter(e => e[0] !== 'N/D').slice(0, 15);
  makeBar('chAgVal', top15.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), top15.map(e => e[1].tot), '#3b82f6', true);

  // Conv. rate (min 10 offerte)
  const convSorted = sorted.filter(e => e[0] !== 'N/D' && e[1].cnt >= 10).sort((a, b) => (b[1].contr / b[1].cnt) - (a[1].contr / a[1].cnt)).slice(0, 15);
  makeBarConv('chAgConv', convSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), convSorted.map(e => e[1].contr / e[1].cnt * 100));

  buildTbl('tblAgenti',
    ['Commerciale', 'Offerte', 'Valore', 'Contratt.', 'Val. Contratt.', 'Presentate', 'Rifiutate', 'Conv. %'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.tot), val: v.tot },
      { display: fmt(v.contr), val: v.contr },
      { display: fmtE(v.contrVal), val: v.contrVal },
      { display: fmt(v.pres), val: v.pres },
      { display: fmt(v.rif), val: v.rif },
      { display: v.cnt ? (v.contr / v.cnt * 100).toFixed(1) + '%' : '-', val: v.cnt ? v.contr / v.cnt * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'agente' }
  );
}

/* ── Categorie ── */
function renderCategorie() {
  const el = document.getElementById('sec-categorie');
  const f = filtered;
  const g = {};
  f.forEach(c => {
    const k = c.categoria || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, tot: 0, contr: 0, contrVal: 0, rif: 0, avg: 0 };
    g[k].cnt++; g[k].tot += c.totale;
    if (c.status === 'Offerta Contrattualizzata') { g[k].contr++; g[k].contrVal += c.totale; }
    if (c.status === 'Offerta Rifiutata') g[k].rif++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].tot - a[1].tot);

  let h = '<div class="sec"><h3 class="sec-title">Analisi per Categoria</h3>';
  h += '<div class="card"><h4>Valore per Categoria</h4><div class="chart-wrap"><canvas id="chCatVal"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblCat"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chCatVal', sorted.map(e => e[0]), sorted.map(e => e[1].tot), '#10b981', true);

  buildTbl('tblCat',
    ['Categoria', 'Offerte', 'Valore', 'Contratt.', 'Val. Contratt.', 'Rifiutate', 'Conv. %', 'Val. Medio'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.tot), val: v.tot },
      { display: fmt(v.contr), val: v.contr },
      { display: fmtE(v.contrVal), val: v.contrVal },
      { display: fmt(v.rif), val: v.rif },
      { display: pct(v.contr, v.cnt), val: v.cnt ? v.contr / v.cnt * 100 : 0 },
      { display: fmtE(v.cnt ? v.tot / v.cnt : 0), val: v.cnt ? v.tot / v.cnt : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'categoria' }
  );
}

/* ── Societa & Sedi ── */
function renderSocieta() {
  const el = document.getElementById('sec-societa');
  const f = filtered;

  let h = '<div class="sec"><h3 class="sec-title">Societa & Sedi Operative</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Clicca &#9654; per espandere: Societa &rarr; Sede Operativa &rarr; singole offerte.</p>';
  h += '<div class="card"><h4>Top 10 Societa (per valore)</h4><div class="chart-wrap"><canvas id="chSocVal"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblSocTree"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const soG = {};
  f.forEach(c => { const k = c.societa || 'N/D'; soG[k] = (soG[k] || 0) + c.totale; });
  const soSorted = Object.entries(soG).filter(e => e[0] !== 'N/D').sort((a, b) => b[1] - a[1]).slice(0, 10);
  makeBar('chSocVal', soSorted.map(e => e[0].length > 25 ? e[0].substring(0, 23) + '..' : e[0]), soSorted.map(e => e[1]), '#8b5cf6', true);

  buildTreeTbl('tblSocTree', f, {
    primaryField: 'societa',
    primaryLabel: 'Societa',
    subGroupField: 'sede_op',
    subGroupLabel: 'Sede Operativa',
    valueFn: items => [
      { label: 'Offerte', val: fmt(items.length) },
      { label: 'Valore', val: fmtE(items.reduce((s, c) => s + c.totale, 0)) },
      { label: 'Contratt.', val: fmt(items.filter(c => c.status === 'Offerta Contrattualizzata').length) },
      { label: 'Conv.', val: pct(items.filter(c => c.status === 'Offerta Contrattualizzata').length, items.length) }
    ],
    subValueFn: items => [
      { label: 'Offerte', val: fmt(items.length) },
      { label: 'Valore', val: fmtE(items.reduce((s, c) => s + c.totale, 0)) },
      { label: 'Contratt.', val: fmt(items.filter(c => c.status === 'Offerta Contrattualizzata').length) },
      { label: 'Conv.', val: pct(items.filter(c => c.status === 'Offerta Contrattualizzata').length, items.length) }
    ],
    itemColumns: [
      { hdr: 'ID', fn: c => '<strong>#' + c.id + '</strong>' },
      { hdr: 'Cliente', fn: c => (c.cliente || '').substring(0, 30) },
      { hdr: 'Status', fn: c => tagStatus(c.status) }
    ],
    leafValueFn: c => [fmtE(c.totale)]
  });
}

/* ── Trend Temporale ── */
function renderTrend() {
  const el = document.getElementById('sec-trend');
  const f = filtered;

  // Trend mensile
  const monthG = {};
  f.forEach(d => { if (!d.data) return; if (!monthG[d.data]) monthG[d.data] = { tot: 0, cnt: 0, contr: 0 }; monthG[d.data].tot += d.totale; monthG[d.data].cnt++; if (d.status === 'Offerta Contrattualizzata') monthG[d.data].contr++; });
  const months = Object.keys(monthG).sort();

  // Per anno
  const annoG = {};
  f.forEach(c => { const k = c.anno || 'N/D'; if (!annoG[k]) annoG[k] = { cnt: 0, tot: 0, contr: 0, contrVal: 0 }; annoG[k].cnt++; annoG[k].tot += c.totale; if (c.status === 'Offerta Contrattualizzata') { annoG[k].contr++; annoG[k].contrVal += c.totale; } });
  const annoSorted = Object.entries(annoG).sort((a, b) => a[0] - b[0]);

  let h = '<div class="sec"><h3 class="sec-title">Trend Temporale</h3>';
  h += '<div class="card"><h4>Trend Mensile (Valore)</h4><div class="chart-wrap"><canvas id="chTrendVal"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><h4>Trend Mensile (Conteggio)</h4><div class="chart-wrap"><canvas id="chTrendCnt"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo per Anno</h4><div class="tbl-scroll"><table id="tblAnno"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeLine('chTrendVal', months, months.map(m => monthG[m].tot), '#3b82f6');
  makeLine('chTrendCnt', months, months.map(m => monthG[m].cnt), '#10b981');

  buildTbl('tblAnno',
    ['Anno', 'Offerte', 'Valore', 'Contratt.', 'Val. Contratt.', 'Conv. %', 'Val. Medio'],
    annoSorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.tot), val: v.tot },
      { display: fmt(v.contr), val: v.contr },
      { display: fmtE(v.contrVal), val: v.contrVal },
      { display: pct(v.contr, v.cnt), val: v.cnt ? v.contr / v.cnt * 100 : 0 },
      { display: fmtE(v.cnt ? v.tot / v.cnt : 0), val: v.cnt ? v.tot / v.cnt : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'anno' }
  );
}

/* ── Tabella Offerte (full searchable/paginable) ── */
let _tblPage = 0, _tblPerPage = 50, _tblSort = 'id', _tblDir = -1;

function renderTabella() {
  const el = document.getElementById('sec-tabella');
  let h = '<div class="sec"><h3 class="sec-title">Tabella Offerte</h3>';
  h += '<div class="card">';
  h += '<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;flex-wrap:wrap">';
  h += '<input type="text" id="tblSearch" placeholder="Cerca cliente, tipo, agente..." style="flex:1;min-width:200px;background:var(--card2);border:1px solid var(--border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:.85rem" oninput="_tblPage=0;renderTblBody()">';
  h += '<label style="color:var(--text2);font-size:10px;display:flex;align-items:center;gap:4px">Righe <select id="tblPerPage" onchange="_tblPerPage=parseInt(this.value);_tblPage=0;renderTblBody()" class="per-page-select">';
  [25, 50, 100, 200].forEach(n => { h += '<option value="' + n + '"' + (n === _tblPerPage ? ' selected' : '') + '>' + n + '</option>'; });
  h += '<option value="0"' + (_tblPerPage === 0 ? ' selected' : '') + '>Tutte</option></select></label>';
  h += '<span id="tblCount" style="color:var(--text2);font-size:10px"></span>';
  h += '<button class="btn-export" onclick="exportFullCSV()">&#8681; CSV</button>';
  h += '</div>';
  h += '<div class="tbl-scroll"><table id="tblFull"><thead><tr>';
  ['ID', 'Data', 'Cliente', 'Tipo', 'Categoria', 'Totale', 'Status', 'Commerciale', 'Societa', 'Sede Op.'].forEach((hd, i) => {
    const types = ['num', 'str', 'str', 'str', 'str', 'num', 'str', 'str', 'str', 'str'];
    h += '<th onclick="sortFullTbl(' + i + ',\'' + types[i] + '\')">' + hd + '</th>';
  });
  h += '</tr></thead><tbody id="tblFullBody"></tbody></table></div>';
  h += '<div id="tblFullPag" class="modal-pagination"></div>';
  h += '</div></div>';
  el.innerHTML = h;
  renderTblBody();
}

function renderTblBody() {
  const q = (document.getElementById('tblSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';
  let rows = filtered;
  if (search) rows = rows.filter(d => (d.cliente + ' ' + d.tipo + ' ' + d.agente + ' ' + d.societa + ' ' + d.sede_op + ' ' + d.categoria).toLowerCase().includes(search));
  document.getElementById('tblCount').textContent = fmt(rows.length) + ' di ' + fmt(filtered.length);
  const pp = _tblPerPage === 0 ? rows.length : _tblPerPage;
  const totalPages = Math.max(1, Math.ceil(rows.length / pp));
  if (_tblPage >= totalPages) _tblPage = totalPages - 1;
  const paged = rows.slice(_tblPage * pp, _tblPage * pp + pp);
  const tbody = document.getElementById('tblFullBody');
  tbody.innerHTML = paged.map(c => '<tr>' +
    '<td>' + c.id + '</td><td>' + c.data_full + '</td><td>' + (c.cliente || '') + '</td>' +
    '<td>' + (c.tipo || '').substring(0, 40) + '</td><td>' + (c.categoria || '') + '</td>' +
    '<td class="text-right" data-val="' + c.totale + '">' + fmtE(c.totale) + '</td>' +
    '<td>' + tagStatus(c.status) + '</td><td>' + (c.agente || '-') + '</td>' +
    '<td>' + (c.societa || '') + '</td><td>' + (c.sede_op || '') + '</td></tr>').join('');
  const pg = document.getElementById('tblFullPag');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }
  let ph = '<button onclick="_tblPage=0;renderTblBody()">&laquo;</button>';
  ph += '<button onclick="_tblPage=Math.max(0,_tblPage-1);renderTblBody()">&lsaquo;</button>';
  let sp = Math.max(0, _tblPage - 2), ep = Math.min(totalPages, sp + 5); if (ep - sp < 5) sp = Math.max(0, ep - 5);
  for (let i = sp; i < ep; i++) ph += '<button class="' + (i === _tblPage ? 'active' : '') + '" onclick="_tblPage=' + i + ';renderTblBody()">' + (i + 1) + '</button>';
  ph += '<button onclick="_tblPage=Math.min(' + (totalPages - 1) + ',_tblPage+1);renderTblBody()">&rsaquo;</button>';
  ph += '<button onclick="_tblPage=' + (totalPages - 1) + ';renderTblBody()">&raquo;</button>';
  ph += '<span style="margin-left:8px;color:var(--text2);font-size:10px">Pag. ' + (_tblPage + 1) + ' di ' + totalPages + '</span>';
  pg.innerHTML = ph;
}

function sortFullTbl(col, type) { sortTbl('tblFull', col, type); }

function exportFullCSV() {
  const q = (document.getElementById('tblSearch') || {}).value;
  const search = q ? q.toLowerCase().trim() : '';
  let rows = filtered;
  if (search) rows = rows.filter(d => (d.cliente + ' ' + d.tipo + ' ' + d.agente + ' ' + d.societa).toLowerCase().includes(search));
  let csv = '\uFEFF' + 'ID;Data;Cliente;Tipo;Categoria;Totale;Status;Commerciale;Societa;Sede Operativa\n';
  rows.forEach(c => { csv += [c.id, csvSafe(c.data_full), csvSafe(c.cliente), csvSafe(c.tipo), csvSafe(c.categoria), c.totale, csvSafe(c.status), csvSafe(c.agente), csvSafe(c.societa), csvSafe(c.sede_op)].join(';') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'offerte_export.csv'; a.click();
}

/* ── Alert ── */
function renderAlert() {
  const el = document.getElementById('sec-alert');
  const f = filtered;
  const rifiutate = f.filter(c => c.status === 'Offerta Rifiutata');
  const highValue = f.filter(c => c.totale > 15000 && c.status === 'Offerta Presentata');
  const senzaAgente = f.filter(c => !c.agente || c.agente.trim() === '' || c.agente === '-');

  let h = '<div class="sec"><h3 class="sec-title">Alert & Anomalie</h3>';

  h += '<div class="card"><h4>&#9888; Offerte Rifiutate (' + fmt(rifiutate.length) + ') - ' + fmtE(rifiutate.reduce((s, c) => s + c.totale, 0)) + '</h4>';
  if (rifiutate.length) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Offerte con status "Rifiutata".</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'Rifiutate\',filtered.filter(c=>c.status===\'Offerta Rifiutata\'))">Vedi tutte &rarr;</button>';
  } else h += '<p style="color:var(--green);font-size:12px">Nessuna offerta rifiutata.</p>';
  h += '</div>';

  h += '<div class="card" style="margin-top:14px"><h4>&#9888; High-Value Presentate &gt; €15K (' + fmt(highValue.length) + ') - ' + fmtE(highValue.reduce((s, c) => s + c.totale, 0)) + '</h4>';
  if (highValue.length) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Offerte di alto valore ancora in attesa di risposta.</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'High-Value Presentate\',filtered.filter(c=>c.totale>15000&&c.status===\'Offerta Presentata\'))">Vedi tutte &rarr;</button>';
  } else h += '<p style="color:var(--green);font-size:12px">Nessuna offerta high-value in attesa.</p>';
  h += '</div>';

  h += '<div class="card" style="margin-top:14px"><h4>&#9888; Senza Commerciale (' + fmt(senzaAgente.length) + ')</h4>';
  if (senzaAgente.length) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Offerte senza commerciale assegnato.</p>';
    h += '<button class="btn-export" onclick="drillDownItems(\'Senza Commerciale\',filtered.filter(c=>!c.agente||c.agente.trim()===\'\'||c.agente===\'-\'))">Vedi tutte &rarr;</button>';
  } else h += '<p style="color:var(--green);font-size:12px">Tutte le offerte hanno un commerciale.</p>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}
