/* ── Performance: rendering chart e scorecard ──
   Separato da section-performance.js per rispettare la regola "max 300 righe/file". */

function _perfRenderBar(periods, sorted) {
  const s = _perfState();
  const topN = sorted.slice(0, s.topN);
  const labels = topN.map(x => x.key.length > 25 ? x.key.substring(0, 23) + '..' : x.key);
  if (_charts['chPerfBar']) _charts['chPerfBar'].destroy();

  const baseScales = {
    x: { ticks: { color: _chartTick2(), font: { size: 9 } }, grid: { color: _chartGrid() } },
    y: { ticks: { color: _chartTick(), font: { size: 9 } }, grid: { color: 'transparent' } }
  };

  if (periods.length === 1) {
    _charts['chPerfBar'] = new Chart(document.getElementById('chPerfBar'), {
      type: 'bar',
      data: { labels, datasets: [{ data: topN.map(x => x.val), backgroundColor: '#3b82f6cc', borderRadius: 4 }] },
      options: Object.assign({}, cOpts(), { indexAxis: 'y', scales: baseScales })
    });
    return;
  }

  const keys = topN.map(x => x.key);
  const s2 = _perfState();
  const groupA = _perfGroup(periods[0].items, s2.segment);
  const groupB = _perfGroup(periods[1].items, s2.segment);
  const dsA = keys.map(k => _perfMetric(groupA.get(k) || [], s2.metric));
  const dsB = keys.map(k => _perfMetric(groupB.get(k) || [], s2.metric));

  _charts['chPerfBar'] = new Chart(document.getElementById('chPerfBar'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: periods[0].label, data: dsA, backgroundColor: '#3b82f6cc', borderRadius: 4 },
        { label: periods[1].label, data: dsB, backgroundColor: '#f59e0bcc', borderRadius: 4 }
      ]
    },
    options: Object.assign({}, cOpts(), {
      indexAxis: 'y',
      plugins: { legend: { display: true, position: 'top', labels: { color: _chartTick(), font: { size: 10 }, usePointStyle: true } } },
      scales: baseScales
    })
  });
}

function _perfRenderTrend(periods) {
  const s = _perfState();
  if (_charts['chPerfTrend']) _charts['chPerfTrend'].destroy();

  function bins(items) {
    const map = new Map();
    items.forEach(c => {
      const k = _perfBinKey(_perfStart(c), s.agg);
      if (!k) return;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(c);
    });
    return map;
  }

  const bA = bins(periods[0].items);
  const bB = periods.length > 1 ? bins(periods[1].items) : new Map();
  const allKeys = new Set([...bA.keys(), ...bB.keys()]);
  const labels = [...allKeys].sort();

  const datasets = [{
    label: periods[0].label,
    data: labels.map(k => _perfMetric(bA.get(k) || [], s.metric)),
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f61a',
    fill: false, tension: .3, pointRadius: 3
  }];

  if (periods.length === 1 && s.segment !== 'totale') {
    // Benchmark "Totale BU" sempre visibile in mode non-confronto
    datasets[0].label = 'Totale BU';
    // (l'unica linea già rappresenta il totale del periodo filtrato)
  }

  if (periods.length > 1) {
    datasets.push({
      label: periods[1].label,
      data: labels.map(k => _perfMetric(bB.get(k) || [], s.metric)),
      borderColor: '#f59e0b',
      backgroundColor: '#f59e0b1a',
      fill: false, tension: .3, pointRadius: 3,
      borderDash: [6, 4]
    });
  }

  _charts['chPerfTrend'] = new Chart(document.getElementById('chPerfTrend'), {
    type: 'line',
    data: { labels, datasets },
    options: Object.assign({}, cOpts(), {
      plugins: { legend: { display: true, position: 'top', labels: { color: _chartTick(), font: { size: 10 }, usePointStyle: true } } },
      scales: {
        x: { ticks: { color: _chartTick(), font: { size: 9 }, maxRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: _chartTick2(), font: { size: 9 } }, grid: { color: _chartGrid() } }
      }
    })
  });
}

function _perfRenderScore(periods, seg) {
  const s = _perfState();
  const targets = (_perfTargets || {})[s.segment] || {};
  const hasTargets = Object.keys(targets).length > 0;

  const hdrs  = [seg.label, 'WIP n', 'WIP €', 'Out n', 'Out €', 'Backlog', 'Incassato', 'Margine %', '% Inc.'];
  const types = ['str',     'num',   'num',   'num',   'num',   'num',     'num',       'num',       'num'];
  if (hasTargets) { hdrs.push('Target', '% Target'); types.push('num', 'num'); }
  if (periods.length === 2) {
    hdrs.push(periods[0].label, periods[1].label, 'Δ', 'Δ%');
    types.push('num', 'num', 'num', 'num');
  }

  const allKeys = new Set();
  periods.forEach(p => _perfGroup(p.items, s.segment).forEach((_, k) => allKeys.add(k)));

  const rows = [...allKeys].map(k => {
    const g0 = _perfGroup(periods[0].items, s.segment);
    const items = g0.get(k) || [];
    const cl = items.filter(isClosed);
    const cR = cl.reduce((s, c) => s + (c.consulenza || 0), 0);
    const wipN = items.filter(isOpen).length;
    const wipE = items.filter(isOpen).reduce((s, c) => s + (c.consulenza || 0), 0);
    const outN = cl.length;
    const outE = cR;
    const backlog = items.filter(c => isOpen(c) && _perfAge(c) > 60).length;
    const incE = items.reduce((s, c) => s + (c.giaIncassato || 0), 0);
    const margine = cR ? cl.reduce((s, c) => s + (c.mol || 0), 0) / cR * 100 : 0;
    const pctInc  = cR ? cl.reduce((s, c) => s + (c.giaIncassato || 0), 0) / cR * 100 : 0;

    const row = [
      { display: k.length > 35 ? k.substring(0, 33) + '..' : k, val: k, raw: k },
      { display: fmt(wipN), val: wipN },
      { display: fmtE(wipE), val: wipE },
      { display: fmt(outN), val: outN },
      { display: fmtE(outE), val: outE },
      { display: fmt(backlog), val: backlog },
      { display: fmtE(incE), val: incE },
      { display: cR ? margine.toFixed(1) + '%' : '-', val: margine },
      { display: cR ? pctInc.toFixed(1) + '%' : '-', val: pctInc }
    ];

    if (hasTargets) {
      const t = targets[k] || 0;
      const cur = _perfMetric(items, s.metric);
      const pct = t ? (cur / t * 100) : 0;
      const css = (t && pct < 100) ? 'color:#ef4444;font-weight:600' : '';
      row.push({ display: t ? fmtE(t) : '-', val: t });
      row.push({ display: t ? '<span style="' + css + '">' + pct.toFixed(0) + '%</span>' : '-', val: pct });
    }

    if (periods.length === 2) {
      const aV = _perfMetric(items, s.metric);
      const bItems = _perfGroup(periods[1].items, s.segment).get(k) || [];
      const bV = _perfMetric(bItems, s.metric);
      const delta = aV - bV;
      const deltaPct = bV ? (delta / bV * 100) : 0;
      const dcol = delta >= 0 ? '#10b981' : '#ef4444';
      row.push({ display: _perfFmt(aV, s.metric), val: aV });
      row.push({ display: _perfFmt(bV, s.metric), val: bV });
      row.push({ display: '<span style="color:' + dcol + '">' + (delta >= 0 ? '+' : '') + _perfFmt(delta, s.metric) + '</span>', val: delta });
      row.push({ display: bV ? '<span style="color:' + dcol + '">' + (delta >= 0 ? '+' : '') + deltaPct.toFixed(1) + '%</span>' : '-', val: deltaPct });
    }
    return row;
  }).sort((a, b) => (b[2].val || 0) - (a[2].val || 0));

  const opts = seg.field ? { clickField: seg.field } : {};
  buildTbl('tblPerf', hdrs, rows, types, opts);
}
