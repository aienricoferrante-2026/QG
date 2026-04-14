/* ── Sortable Table Builder ── */

function buildTbl(id, hdrs, rows, types, opts) {
  opts = opts || {};
  const el = document.getElementById(id);
  if (!el) return;
  let h = '<thead><tr>';
  hdrs.forEach((hd, i) => {
    h += '<th onclick="sortTbl(\'' + id + '\',' + i + ',\'' + types[i] + '\')">' + hd + '</th>';
  });
  h += '</tr></thead><tbody>';
  rows.forEach(r => {
    const click = opts.clickField ? buildRowClick(r, opts) : '';
    h += '<tr' + click + '>';
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

function buildRowClick(row, opts) {
  if (!opts.clickField) return '';
  const raw = typeof row[0] === 'object' ? row[0].val : row[0];
  const escaped = String(raw).replace(/'/g, "\\'");
  return ' class="clickable" onclick="drillDown(\'' + opts.clickField + '\',\'' + escaped + '\')"';
}

function buildTreeTbl(id, data, config) {
  const el = document.getElementById(id);
  if (!el) return;
  const groups = {};
  data.forEach(c => {
    const k = c[config.primaryField] || 'N/D';
    if (!groups[k]) groups[k] = [];
    groups[k].push(c);
  });
  const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  const cols = config.valueFn(data);
  let h = '<thead><tr><th style="width:30px"></th><th>' + config.primaryLabel + '</th>';
  cols.forEach(c => { h += '<th class="text-right">' + c.label + '</th>'; });
  h += '</tr></thead><tbody>';
  sorted.forEach(([key, items], gi) => {
    const gid = id + '_g' + gi;
    const vals = config.valueFn(items);
    h += '<tr class="tree-row tree-l0" onclick="toggleTree(\'' + gid + '\')">';
    h += '<td class="tree-toggle" id="tog_' + gid + '">&#9654;</td>';
    h += '<td><strong>' + (key.length > 45 ? key.substring(0, 43) + '..' : key) + '</strong> <span style="color:var(--text3);font-size:10px">(' + items.length + ')</span></td>';
    vals.forEach(v => { h += '<td class="text-right">' + v.val + '</td>'; });
    h += '</tr>';
    if (config.subGroupField) {
      const subG = {};
      items.forEach(c => { const sk = c[config.subGroupField] || 'N/D'; if (!subG[sk]) subG[sk] = []; subG[sk].push(c); });
      Object.entries(subG).sort((a, b) => b[1].length - a[1].length).forEach(([sk, sItems], si) => {
        const sid = gid + '_s' + si;
        const sVals = config.subValueFn ? config.subValueFn(sItems) : config.valueFn(sItems);
        h += '<tr class="tree-row tree-l1 tree-child-' + gid + '" style="display:none" onclick="toggleTree(\'' + sid + '\')">';
        h += '<td class="tree-toggle" id="tog_' + sid + '">&#9654;</td>';
        h += '<td style="padding-left:24px">' + sk + ' <span style="color:var(--text3);font-size:10px">(' + sItems.length + ')</span></td>';
        sVals.forEach(v => { h += '<td class="text-right">' + v.val + '</td>'; });
        h += '</tr>';
        if (config.itemColumns) {
          sItems.forEach(c => {
            h += '<tr class="tree-row tree-l2 tree-child-' + sid + '" style="display:none"><td></td><td style="padding-left:48px;font-size:10px">';
            config.itemColumns.forEach((col, ci) => { if (ci > 0) h += ' &middot; '; h += col.fn(c); });
            h += '</td>';
            const lv = config.leafValueFn ? config.leafValueFn(c) : [];
            lv.forEach(v => { h += '<td class="text-right" style="font-size:10px">' + v + '</td>'; });
            for (let fi = lv.length; fi < cols.length; fi++) h += '<td></td>';
            h += '</tr>';
          });
        }
      });
    }
  });
  h += '</tbody>';
  el.innerHTML = h;
}

function toggleTree(gid) {
  const children = document.querySelectorAll('.tree-child-' + gid);
  const tog = document.getElementById('tog_' + gid);
  const visible = children.length > 0 && children[0].style.display !== 'none';
  if (visible) {
    children.forEach(r => {
      r.style.display = 'none';
      const nestedId = r.querySelector('.tree-toggle')?.id?.replace('tog_', '');
      if (nestedId) {
        document.querySelectorAll('.tree-child-' + nestedId).forEach(nr => nr.style.display = 'none');
        const nt = document.getElementById('tog_' + nestedId);
        if (nt) nt.innerHTML = '&#9654;';
      }
    });
    if (tog) tog.innerHTML = '&#9654;';
  } else {
    children.forEach(r => r.style.display = '');
    if (tog) tog.innerHTML = '&#9660;';
  }
}

function sortTbl(id, col, type) {
  const t = document.getElementById(id);
  const tb = t.querySelector('tbody');
  const rows = Array.from(tb.querySelectorAll('tr'));
  const dir = t.dataset.sc == col && t.dataset.sd === 'asc' ? 'desc' : 'asc';
  t.dataset.sc = col; t.dataset.sd = dir;
  t.querySelectorAll('th').forEach(th => th.classList.remove('sorted-asc', 'sorted-desc'));
  t.querySelectorAll('th')[col].classList.add('sorted-' + dir);
  rows.sort((a, b) => {
    let va = a.cells[col].dataset.val || a.cells[col].textContent;
    let vb = b.cells[col].dataset.val || b.cells[col].textContent;
    if (type === 'num') { va = parseFloat(va) || 0; vb = parseFloat(vb) || 0; }
    return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });
  rows.forEach(r => tb.appendChild(r));
}
