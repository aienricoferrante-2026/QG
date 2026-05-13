/* ── Explore · tree builder, tabella multi-livello, chart, export ──
   Riceve lo stato da section-explore.js e usa _exploreDimGetter/_exploreMetric
   di section-explore-metrics.js. Usa Chart.js (charts.js helpers) e drillDownItems
   (drilldown.js) per le foglie. */

/* Stato espansione per nodo (sticky durante la sessione, reset al render). */
let _exploreExpanded = {};
/* Periods per la sezione, con sub-filtri locali applicati. */
function _explorePeriodsFiltered(s) {
  const raw = _explorePeriods(s);
  return (typeof _exploreApplySubFilters === 'function') ? _exploreApplySubFilters(raw, s) : raw;
}
function _exploreToggleNode(nid) {
  _exploreExpanded[nid] = !_exploreExpanded[nid];
  const wrap = document.getElementById('explore-tbl-wrap');
  if (wrap) wrap.innerHTML = _exploreRenderTable(_exploreState(), _explorePeriodsFiltered(_exploreState()));
}

/* Cache items per leaf-modal (chiavi = nodeId). */
const _exploreLeafCache = {};

function _exploreLeafOpen(nid) {
  const entry = _exploreLeafCache[nid];
  if (!entry || !entry.items || !entry.items.length) return;
  const title = entry.title || ('Nodo · ' + entry.items.length + ' commesse');
  if (typeof drillDownItems === 'function') drillDownItems(title, entry.items);
}

/* ── Tree build ──
   Ritorna un array di nodi { id, label, depth, items, children, parent } a
   profondità variabile. Dimensioni 'none' vengono saltate (compatta i livelli). */
function _exploreBuildTree(items, dims) {
  const active = dims.filter(d => d && d !== 'none');
  if (!active.length) {
    return [{ id: 'all', label: 'Totale', depth: 0, items, children: [], leaf: true }];
  }
  function group(arr, depth, parentId) {
    const getter = _exploreDimGetter(active[depth]);
    const map = new Map();
    arr.forEach(c => {
      const k = getter(c);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c);
    });
    const nodes = [];
    let i = 0;
    for (const [k, sub] of map.entries()) {
      const nid = parentId + '_' + depth + '_' + (i++);
      const node = { id: nid, label: k, depth, items: sub, parent: parentId, dim: active[depth] };
      if (depth + 1 < active.length) {
        node.children = group(sub, depth + 1, nid);
        node.leaf = false;
      } else {
        node.children = [];
        node.leaf = true;
      }
      nodes.push(node);
    }
    return nodes;
  }
  return group(items, 0, 'r');
}

/* ── KPI strip ── */
function _exploreKpis(state, periods) {
  const def = EXPLORE_METRICS.find(m => m.id === state.metric);
  const dim1 = EXPLORE_DIMENSIONS.find(d => d.id === state.l1) || EXPLORE_DIMENSIONS[1];
  const tot = _exploreMetric(periods[0].items, state.metric);
  const tree = _exploreBuildTree(periods[0].items, [state.l1]);
  const sorted = [...tree].sort((a, b) =>
    _exploreMetric(b.items, state.metric) - _exploreMetric(a.items, state.metric));
  const top = sorted[0] || { label: '—', items: [] };
  const topVal = _exploreMetric(top.items, state.metric);
  const nd = tree.find(n => n.label === 'N/D');
  const ndPct = tot && nd ? (_exploreMetric(nd.items, state.metric) / tot * 100) : 0;

  const ii = (typeof kpiInfoBtn === 'function') ? kpiInfoBtn : (() => '');
  /* Mappa metric → id wiki più affine (per il popup ⓘ). */
  const metricInfoId = {
    ricavi: 'ricavi', costi: 'costi', mol: 'mol', margine: 'margine',
    incassato: 'incassato', pctInc: 'pctInc', daIncassare: 'daIncassare',
    count: 'cnt', wipN: 'open', wipE: 'open', outN: 'closed', outE: 'closed',
    backlog: 'backlog'
  };
  const infoId = metricInfoId[state.metric] || 'cnt';
  let h = '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green"><div class="kpi-label">Totale ' + def.short + ' ' + ii(infoId) + '</div>' +
       '<div class="kpi-value">' + _exploreFmt(tot, state.metric) + '</div>' +
       '<div class="kpi-sub">' + fmt(periods[0].items.length) + ' commesse</div></div>';
  h += '<div class="kpi blue"><div class="kpi-label">Top ' + dim1.label + '</div>' +
       '<div class="kpi-value" style="font-size:14px">' +
       (top.label.length > 18 ? top.label.substring(0, 16) + '..' : top.label) + '</div>' +
       '<div class="kpi-sub">' + _exploreFmt(topVal, state.metric) + '</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">% N/D · ' + dim1.label + '</div>' +
       '<div class="kpi-value">' + (state.metric === 'count' || nd ? ndPct.toFixed(1) + '%' : '0%') + '</div>' +
       '<div class="kpi-sub">' + (nd ? fmt(nd.items.length) + ' senza ' + dim1.label.toLowerCase() : 'tutto attribuito') + '</div></div>';
  if (periods.length === 2) {
    const aV = _exploreMetric(periods[0].items, state.metric);
    const bV = _exploreMetric(periods[1].items, state.metric);
    const d = bV ? ((aV - bV) / bV * 100) : 0;
    h += '<div class="kpi ' + (d >= 0 ? 'green' : 'pink') + '"><div class="kpi-label">Δ vs ' + periods[1].label + '</div>' +
         '<div class="kpi-value">' + (d >= 0 ? '+' : '') + d.toFixed(1) + '%</div>' +
         '<div class="kpi-sub">' + _exploreFmt(aV, state.metric) + ' vs ' + _exploreFmt(bV, state.metric) + '</div></div>';
  } else {
    h += '<div class="kpi cyan"><div class="kpi-label">' + dim1.label + ' distinti</div>' +
         '<div class="kpi-value">' + fmt(tree.length) + '</div>' +
         '<div class="kpi-sub">livelli L1</div></div>';
  }
  h += '</div>';
  return h;
}

/* ── Tree table render ── */
function _exploreTableColumns(state, periods) {
  const cols = [
    { key: 'metric',    label: EXPLORE_METRICS.find(m => m.id === state.metric).short + ' ★', primary: true },
    { key: 'ricavi',    label: 'Ricavi' },
    { key: 'costi',     label: 'Costi' },
    { key: 'mol',       label: 'MOL' },
    { key: 'margine',   label: 'Margine %' },
    { key: 'incassato', label: 'Incassato' },
    { key: 'pctInc',    label: '% Inc.' }
  ];
  if (periods.length === 2) {
    cols.push({ key: 'cmpA',    label: periods[0].label });
    cols.push({ key: 'cmpB',    label: periods[1].label });
    cols.push({ key: 'cmpD',    label: 'Δ' });
    cols.push({ key: 'cmpDPct', label: 'Δ%' });
  }
  return cols;
}

function _exploreCellVal(node, key, state, periods, periodB) {
  if (key === 'metric')    return _exploreFmt(_exploreMetric(node.items, state.metric), state.metric);
  if (key === 'ricavi')    return fmtE(_exploreMetric(node.items, 'ricavi'));
  if (key === 'costi')     return fmtE(_exploreMetric(node.items, 'costi'));
  if (key === 'mol')       return fmtE(_exploreMetric(node.items, 'mol'));
  if (key === 'margine')   return _exploreMetric(node.items, 'margine').toFixed(1) + '%';
  if (key === 'incassato') return fmtE(_exploreMetric(node.items, 'incassato'));
  if (key === 'pctInc')    return _exploreMetric(node.items, 'pctInc').toFixed(1) + '%';
  if (key === 'cmpA')      return _exploreFmt(_exploreMetric(node.items, state.metric), state.metric);
  if (key === 'cmpB') {
    const subB = _exploreMatchInB(node, periodB);
    return _exploreFmt(_exploreMetric(subB, state.metric), state.metric);
  }
  if (key === 'cmpD' || key === 'cmpDPct') {
    const aV = _exploreMetric(node.items, state.metric);
    const subB = _exploreMatchInB(node, periodB);
    const bV = _exploreMetric(subB, state.metric);
    const d = aV - bV;
    const col = d >= 0 ? '#10b981' : '#ef4444';
    if (key === 'cmpD') return '<span style="color:' + col + '">' + (d >= 0 ? '+' : '') + _exploreFmt(d, state.metric) + '</span>';
    const dp = bV ? (d / bV * 100) : 0;
    return bV ? '<span style="color:' + col + '">' + (d >= 0 ? '+' : '') + dp.toFixed(1) + '%</span>' : '-';
  }
  return '';
}

/* Per ogni nodo del periodo A, trova il sotto-insieme di items in periodo B
   che cade negli stessi label di percorso. */
function _exploreMatchInB(node, periodB) {
  if (!periodB || !periodB.items) return [];
  const path = [];
  let cur = node;
  while (cur && cur.dim) { path.unshift({ dim: cur.dim, label: cur.label }); cur = cur._parentRef; }
  return periodB.items.filter(c => path.every(p => _exploreDimGetter(p.dim)(c) === p.label));
}

function _exploreFlatten(nodes, parentRef) {
  const flat = [];
  nodes.forEach(n => {
    n._parentRef = parentRef;
    flat.push(n);
    if (n.children && n.children.length && _exploreExpanded[n.id]) {
      flat.push(..._exploreFlatten(n.children, n));
    }
  });
  return flat;
}

function _exploreRenderTable(state, periods) {
  const cols = _exploreTableColumns(state, periods);
  const periodB = periods[1] || null;
  const dims = [state.l1, state.l2, state.l3];
  const tree = _exploreBuildTree(periods[0].items, dims);
  tree.sort((a, b) => _exploreMetric(b.items, state.metric) - _exploreMetric(a.items, state.metric));
  /* Sort ricorsivo dei children per la metrica primaria. */
  function sortRec(nodes) {
    nodes.forEach(n => { if (n.children && n.children.length) sortRec(n.children); });
    nodes.sort((a, b) => _exploreMetric(b.items, state.metric) - _exploreMetric(a.items, state.metric));
  }
  sortRec(tree);

  const query = (state.search || '').toLowerCase().trim();
  const visible = query
    ? tree.filter(n => n.label.toLowerCase().includes(query))
    : tree;
  const flat = _exploreFlatten(visible, null);

  /* Cache per drill-down leaf. */
  flat.forEach(n => { _exploreLeafCache[n.id] = { items: n.items, title: n.label + ' · ' + n.items.length + ' commesse' }; });

  const dim1 = EXPLORE_DIMENSIONS.find(d => d.id === state.l1);
  let h = '<div class="tbl-scroll"><table id="tblExplore"><thead><tr>';
  h += '<th style="width:30px"></th>';
  h += '<th>' + (dim1 ? dim1.label : 'Dimensione') + '</th>';
  h += '<th class="text-right">N</th>';
  cols.forEach(c => {
    const pri = c.primary ? ' style="background:rgba(59,130,246,.08);font-weight:700"' : '';
    h += '<th class="text-right"' + pri + '>' + c.label + '</th>';
  });
  h += '</tr></thead><tbody>';

  flat.forEach(n => {
    const pad = n.depth * 18;
    const hasChildren = n.children && n.children.length;
    const isOpen = !!_exploreExpanded[n.id];
    const arrow = hasChildren ? (isOpen ? '&#9660;' : '&#9654;') : '&#8226;';
    /* Click sulla riga:
       - parent (hasChildren) → toggle espandi/comprimi
       - foglia → apri drill-down sulle commesse del nodo */
    const rowOnclick = hasChildren
      ? '_exploreToggleNode(\'' + n.id + '\')'
      : '_exploreLeafOpen(\'' + n.id + '\')';
    const rowCls = 'tree-row tree-l' + Math.min(n.depth, 2);
    h += '<tr class="' + rowCls + '" onclick="' + rowOnclick + '" style="cursor:pointer">';
    h += '<td class="tree-toggle">' + arrow + '</td>';
    const label = n.label.length > 50 ? n.label.substring(0, 48) + '..' : n.label;
    const leafBtn = !hasChildren ? ' <button class="btn-export" style="padding:1px 6px;font-size:9px;margin-left:6px" onclick="event.stopPropagation();_exploreLeafOpen(\'' + n.id + '\')">Apri ' + n.items.length + '</button>' : '';
    const parentBtn = hasChildren ? ' <button class="btn-export" style="padding:1px 6px;font-size:9px;margin-left:6px" onclick="event.stopPropagation();_exploreLeafOpen(\'' + n.id + '\')">Apri ' + n.items.length + '</button>' : '';
    h += '<td style="padding-left:' + pad + 'px"><strong>' + label + '</strong>' + leafBtn + parentBtn + '</td>';
    h += '<td class="text-right">' + fmt(n.items.length) + '</td>';
    cols.forEach(c => {
      const pri = c.primary ? ' style="background:rgba(59,130,246,.08);font-weight:700"' : '';
      h += '<td class="text-right"' + pri + '>' + _exploreCellVal(n, c.key, state, periods, periodB) + '</td>';
    });
    h += '</tr>';
  });

  /* Totale generale in tfoot */
  const allItems = periods[0].items;
  const totalNode = { items: allItems };
  h += '</tbody><tfoot><tr class="totals-row"><td></td><td><strong>TOTALE (' + flat.filter(n => n.depth === 0).length + ')</strong></td>';
  h += '<td class="text-right"><strong>' + fmt(allItems.length) + '</strong></td>';
  cols.forEach(c => {
    const pri = c.primary ? ' style="background:rgba(59,130,246,.12);font-weight:700"' : '';
    h += '<td class="text-right"' + pri + '><strong>' + _exploreCellVal(totalNode, c.key, state, periods, periodB) + '</strong></td>';
  });
  h += '</tr></tfoot></table></div>';
  return h;
}

/* ── Chart top N (bar) o trend (line per anno/mese) ── */
/* Cache dei nodi del chart per il click handler (index → node). */
let _exploreChartNodes = [];

function _exploreChartClick(idx) {
  const n = _exploreChartNodes[idx];
  if (!n) return;
  const state = _exploreState();
  const dimLabel = (EXPLORE_DIMENSIONS.find(d => d.id === state.l1) || {}).label || state.l1;
  const valLabel = (n.label || '').length > 40 ? n.label.substring(0, 38) + '..' : n.label;
  const title = '<span style="color:var(--accent)">&#9632; ' + dimLabel + ':</span> <strong>' + valLabel + '</strong>';
  if (typeof drillDownItems === 'function') drillDownItems(title, n.items);
}

function _exploreRenderChart(state, periods) {
  const canvas = document.getElementById('chExplore');
  if (!canvas) return;
  if (_charts['chExplore']) _charts['chExplore'].destroy();

  const isTime = state.l1 === 'anno' || state.l1 === 'mese';
  const tree = _exploreBuildTree(periods[0].items, [state.l1]);
  tree.sort((a, b) => isTime
    ? (a.label > b.label ? 1 : -1)
    : (_exploreMetric(b.items, state.metric) - _exploreMetric(a.items, state.metric)));

  const top = isTime ? tree : tree.slice(0, 15);
  _exploreChartNodes = top;
  const labels = top.map(n => n.label.length > 22 ? n.label.substring(0, 20) + '..' : n.label);
  const aData  = top.map(n => _exploreMetric(n.items, state.metric));

  const baseScales = {
    x: { ticks: { color: _chartTick2(), font: { size: 9 } }, grid: { color: _chartGrid() } },
    y: { ticks: { color: _chartTick(),  font: { size: 9 } }, grid: { color: 'transparent' } }
  };

  if (isTime) {
    const datasets = [{
      label: periods[0].label,
      data: aData, borderColor: '#3b82f6',
      backgroundColor: '#3b82f61a', fill: false, tension: .3, pointRadius: 3
    }];
    if (periods.length === 2) {
      const treeB = _exploreBuildTree(periods[1].items, [state.l1]);
      const mapB = new Map(treeB.map(n => [n.label, n.items]));
      datasets.push({
        label: periods[1].label,
        data: top.map(n => _exploreMetric(mapB.get(n.label) || [], state.metric)),
        borderColor: '#f59e0b', backgroundColor: '#f59e0b1a',
        fill: false, tension: .3, pointRadius: 3, borderDash: [6, 4]
      });
    }
    _charts['chExplore'] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: Object.assign({}, cOpts(), {
        onClick: (evt, els) => { if (els && els[0]) _exploreChartClick(els[0].index); },
        onHover: (evt, els) => { evt.native && (evt.native.target.style.cursor = els.length ? 'pointer' : 'default'); },
        plugins: { legend: { display: datasets.length > 1, position: 'top', labels: { color: _chartTick(), font: { size: 10 }, usePointStyle: true } } },
        scales: { x: { ticks: { color: _chartTick(), font: { size: 9 } }, grid: { display: false } }, y: baseScales.x }
      })
    });
    return;
  }

  const datasets = [{ label: periods[0].label, data: aData, backgroundColor: '#3b82f6cc', borderRadius: 4 }];
  if (periods.length === 2) {
    const treeB = _exploreBuildTree(periods[1].items, [state.l1]);
    const mapB = new Map(treeB.map(n => [n.label, n.items]));
    datasets.push({
      label: periods[1].label,
      data: top.map(n => _exploreMetric(mapB.get(n.label) || [], state.metric)),
      backgroundColor: '#f59e0bcc', borderRadius: 4
    });
  }
  _charts['chExplore'] = new Chart(canvas, {
    type: 'bar',
    data: { labels, datasets },
    options: Object.assign({}, cOpts(), {
      indexAxis: 'y',
      onClick: (evt, els) => { if (els && els[0]) _exploreChartClick(els[0].index); },
      onHover: (evt, els) => { evt.native && (evt.native.target.style.cursor = els.length ? 'pointer' : 'default'); },
      plugins: { legend: { display: datasets.length > 1, position: 'top', labels: { color: _chartTick(), font: { size: 10 }, usePointStyle: true } } },
      scales: baseScales
    })
  });
}

/* ── Export CSV ── */
function _exploreExportAggCSV() {
  const state = _exploreState();
  const periods = _explorePeriodsFiltered(state);
  const cols = _exploreTableColumns(state, periods);
  const periodB = periods[1] || null;
  const dims = [state.l1, state.l2, state.l3].filter(d => d && d !== 'none');
  const tree = _exploreBuildTree(periods[0].items, dims);
  function flatAll(nodes) {
    const out = [];
    nodes.forEach(n => { out.push(n); if (n.children && n.children.length) out.push(...flatAll(n.children)); });
    return out;
  }
  const rows = flatAll(tree);
  const dimsLabel = dims.map(d => EXPLORE_DIMENSIONS.find(x => x.id === d).label).join(' › ');
  const hdr = ['Livello', dimsLabel || 'Totale', 'N'].concat(cols.map(c => c.label.replace(/\s*★\s*/g, '')));
  let csv = '﻿' + hdr.map(csvSafe).join(';') + '\n';
  rows.forEach(n => {
    const cells = [n.depth + 1, n.label, n.items.length];
    cols.forEach(c => {
      const v = _exploreCellVal({ items: n.items, _parentRef: n._parentRef, dim: n.dim, label: n.label }, c.key, state, periods, periodB);
      cells.push(String(v).replace(/<[^>]+>/g, ''));
    });
    csv += cells.map(csvSafe).join(';') + '\n';
  });
  _exploreDownload(csv, 'explore_aggregato_' + sectorCode() + '.csv');
}

function _exploreExportFlatCSV() {
  const periods = _explorePeriodsFiltered(_exploreState());
  const items = periods[0].items;
  const hdr = ['ID', 'Contratto', 'Titolo', 'Cliente', 'Societa', 'Sede', 'Regione', 'Tecnico', 'Commerciale', 'Segnalatore', 'Status', 'Stato Lav.', 'Funzione', 'Data Inizio', 'Ricavi', 'Costi', 'MOL', 'Incassato', 'Avz.'];
  let csv = '﻿' + hdr.join(';') + '\n';
  items.forEach(c => {
    csv += [c.id || '', csvSafe(c.contratto), csvSafe(c.titolo), csvSafe(c.cliente), csvSafe(c.societa),
      csvSafe(c.sedeOp || c.sedeNorm), csvSafe(c.regione), csvSafe(c.responsabile), csvSafe(c.agente), csvSafe(c.segnalatore),
      csvSafe(c.status), csvSafe(c.statoLav), csvSafe(c.funzione), csvSafe(c.dataInizio || c.dataPianInizio),
      c.consulenza || 0, c.costi || 0, c.mol || 0, c.giaIncassato || 0, c.avanzamento || 0].join(';') + '\n';
  });
  _exploreDownload(csv, 'explore_commesse_' + sectorCode() + '.csv');
}

function _exploreDownload(csv, name) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}
