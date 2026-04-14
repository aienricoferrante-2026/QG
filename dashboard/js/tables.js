/* Sortable table builder */
function buildTbl(id, hdrs, rows, types, opts = {}) {
  const el = document.getElementById(id);
  if (!el) return;

  let h = '<thead><tr>';
  hdrs.forEach((hd, i) => {
    h += '<th onclick="sortTbl(\'' + id + '\',' + i + ',\'' + types[i] + '\')">' + hd + '</th>';
  });
  h += '</tr></thead><tbody>';

  rows.forEach(r => {
    const clickAttr = buildClickAttr(r, opts);
    h += '<tr' + clickAttr + '>';
    r.forEach((c, i) => {
      const cls = types[i] === 'num' ? 'text-right' : '';
      const v = typeof c === 'object' ? c.display : c;
      const dv = typeof c === 'object' ? c.val : c;
      h += '<td class="' + cls + '" data-val="' + dv + '">' + v + '</td>';
    });
    h += '</tr>';
  });
  h += '</tbody>';
  el.innerHTML = h;
}

function buildClickAttr(row, opts) {
  if (!opts.clickField) return '';
  const raw = row[0] && row[0].raw !== undefined ? row[0].raw : (typeof row[0] === 'object' ? row[0].val : row[0]);
  const escaped = String(raw).replace(/'/g, "\\'");
  return ' class="clickable" onclick="drillDown(\'' + opts.clickField + '\',\'' + escaped + '\')"';
}

/* Sort table by column */
function sortTbl(id, col, type) {
  const t = document.getElementById(id);
  const tb = t.querySelector('tbody');
  const rows = Array.from(tb.querySelectorAll('tr'));
  const dir = t.dataset.sc == col && t.dataset.sd === 'asc' ? 'desc' : 'asc';
  t.dataset.sc = col;
  t.dataset.sd = dir;

  // Update header indicators
  t.querySelectorAll('th').forEach(th => {
    th.classList.remove('sorted-asc', 'sorted-desc');
  });
  t.querySelectorAll('th')[col].classList.add('sorted-' + dir);

  // Sort rows
  rows.sort((a, b) => {
    let va = a.cells[col].dataset.val || a.cells[col].textContent;
    let vb = b.cells[col].dataset.val || b.cells[col].textContent;
    if (type === 'num') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
    return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
  rows.forEach(r => tb.appendChild(r));
}
