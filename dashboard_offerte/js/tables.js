/* ── Table Rendering & Export ── */

function updateTable() {
  const q = document.getElementById('tableSearch').value.toLowerCase();
  let rows = filtered;
  if (q) rows = rows.filter(d => (d.cliente + d.tipo + d.agente + d.societa + d.sede_op).toLowerCase().includes(q));

  const showing = perPage === 0 ? rows.length : Math.min(perPage, rows.length);
  document.getElementById('tableCount').textContent =
    rows.length.toLocaleString('it-IT') + ' di ' + filtered.length.toLocaleString('it-IT') + ' offerte';

  // Sort
  rows.sort((a, b) => {
    let va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -sortDir;
    if (va > vb) return sortDir;
    return 0;
  });

  // Sort indicator on headers
  document.querySelectorAll('.table-card th').forEach(th => {
    th.classList.remove('sort-asc', 'sort-desc');
  });
  const thIdx = ['id','data_full','cliente','tipo','categoria','totale','status','agente','societa','sede_op'].indexOf(sortCol);
  if (thIdx >= 0) {
    const th = document.querySelectorAll('.table-card th')[thIdx];
    if (th) th.classList.add(sortDir === 1 ? 'sort-asc' : 'sort-desc');
  }

  // Paginate (perPage=0 means show all)
  const effectivePerPage = perPage === 0 ? rows.length : perPage;
  const totalPages = Math.max(1, Math.ceil(rows.length / effectivePerPage));
  if (page >= totalPages) page = totalPages - 1;
  const start = page * effectivePerPage;
  const paged = rows.slice(start, start + effectivePerPage);

  // Render rows
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = paged.map(d => `<tr>
    <td>${d.id}</td>
    <td>${d.data_full}</td>
    <td>${d.cliente}</td>
    <td>${d.tipo}</td>
    <td>${d.categoria}</td>
    <td style="text-align:right">&euro; ${fmt(d.totale)}</td>
    <td>${statusBadge(d.status)}</td>
    <td>${d.agente || '-'}</td>
    <td>${d.societa}</td>
    <td>${d.sede_op}</td>
  </tr>`).join('');

  // Pagination controls
  const pg = document.getElementById('pagination');
  if (totalPages <= 1) { pg.innerHTML = ''; return; }

  let html = `<button onclick="goPage(0)">&laquo;</button>`;
  html += `<button onclick="goPage(${Math.max(0, page - 1)})">&lsaquo;</button>`;

  let startP = Math.max(0, page - 2);
  let endP = Math.min(totalPages, startP + 5);
  if (endP - startP < 5) startP = Math.max(0, endP - 5);

  for (let i = startP; i < endP; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="goPage(${i})">${i + 1}</button>`;
  }

  html += `<button onclick="goPage(${Math.min(totalPages - 1, page + 1)})">&rsaquo;</button>`;
  html += `<button onclick="goPage(${totalPages - 1})">&raquo;</button>`;
  html += `<span style="margin-left:8px">Pag. ${page + 1} di ${totalPages}</span>`;
  pg.innerHTML = html;
}

function goPage(p) { page = p; updateTable(); }

function sortTable(col) {
  if (sortCol === col) sortDir *= -1;
  else { sortCol = col; sortDir = 1; }
  updateTable();
}

function exportCSV() {
  const q = document.getElementById('tableSearch').value.toLowerCase();
  let rows = filtered;
  if (q) rows = rows.filter(d => (d.cliente + d.tipo + d.agente + d.societa).toLowerCase().includes(q));

  const header = 'ID;Data;Cliente;Tipo;Categoria;Totale;Stato;Agente;Societa;Sede Operativa\n';
  const csv = header + rows.map(d => [
    d.id, d.data_full, '"' + d.cliente + '"', '"' + d.tipo + '"',
    d.categoria, d.totale, d.status, '"' + d.agente + '"',
    '"' + d.societa + '"', '"' + d.sede_op + '"'
  ].join(';')).join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'offerte_export.csv';
  a.click();
}
