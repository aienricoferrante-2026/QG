/* ── Chart Section Updates ── */

function updateCharts() {
  // Status donut
  const statusG = groupBy(filtered, 'status');
  updateDonut(
    'chartStatus',
    Object.keys(statusG),
    Object.values(statusG).map(v => v.total),
    Object.keys(statusG).map(k => COLORS[k] || '#64748b')
  );

  // Category donut
  const catG = groupBy(filtered, 'categoria');
  const catSorted = Object.entries(catG).sort((a, b) => b[1].total - a[1].total);
  updateDonut(
    'chartCat',
    catSorted.map(e => e[0]),
    catSorted.map(e => e[1].total),
    CAT_COLORS
  );

  // Trend mensile
  const monthG = {};
  filtered.forEach(d => {
    if (!d.data) return;
    if (!monthG[d.data]) monthG[d.data] = { total: 0, count: 0 };
    monthG[d.data].total += d.totale;
    monthG[d.data].count++;
  });
  const months = Object.keys(monthG).sort();
  updateLine('chartTrend', months, months.map(m => monthG[m].total), months.map(m => monthG[m].count));

  // Top 15 Commerciali
  const agG = groupBy(filtered, 'agente');
  const agSorted = Object.entries(agG)
    .filter(e => e[0] && e[0].trim())
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);
  updateBar('chartAgenti', agSorted.map(e => e[0]), agSorted.map(e => e[1].total), '#3b82f6');

  // Top 10 Societa
  const soG = groupBy(filtered, 'societa');
  const soSorted = Object.entries(soG)
    .filter(e => e[0] && e[0] !== 'N/D')
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);
  updateBar('chartSocieta', soSorted.map(e => e[0]), soSorted.map(e => e[1].total), '#8b5cf6');

  // Conversion by category
  const catConv = {};
  filtered.forEach(d => {
    const c = d.categoria;
    if (!catConv[c]) catConv[c] = { tot: 0, contr: 0 };
    catConv[c].tot++;
    if (d.status === 'Offerta Contrattualizzata') catConv[c].contr++;
  });
  const convSorted = Object.entries(catConv).sort((a, b) => b[1].tot - a[1].tot);
  updateBarConv(
    'chartConversion',
    convSorted.map(e => e[0]),
    convSorted.map(e => (e[1].contr / e[1].tot * 100))
  );

  // Distribution histogram
  updateHistogram();
}
