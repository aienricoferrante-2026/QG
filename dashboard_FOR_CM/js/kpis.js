/* ── Filtered KPIs ── */

function renderFilteredKpis() {
  const el = document.getElementById('filteredKpis');
  const f = filtered;
  const cnt = f.length;
  const cons = f.reduce((s, c) => s + c.consulenza, 0);
  const costi = f.reduce((s, c) => s + c.costi, 0);
  const mol = f.reduce((s, c) => s + c.mol, 0);
  const ore = f.reduce((s, c) => s + c.ore, 0);
  const conclusi = f.filter(c => c.statoCorso === 'Concluso').length;
  const inCorso = f.filter(c => c.statoCorso === 'In corso').length;
  const avgAvz = cnt ? (f.reduce((s, c) => s + c.avanzamento, 0) / cnt) : 0;

  el.innerHTML = `
    <div class="kpi blue"><div class="kpi-label">Commesse</div>
      <div class="kpi-value">${fmt(cnt)}</div>
      <div class="kpi-sub">di ${fmt(D.length)} totali</div></div>
    <div class="kpi green"><div class="kpi-label">Ricavi</div>
      <div class="kpi-value">${fmtK(cons)}</div>
      <div class="kpi-sub">${fmtE(cons)}</div></div>
    <div class="kpi orange"><div class="kpi-label">Costi</div>
      <div class="kpi-value">${fmtK(costi)}</div>
      <div class="kpi-sub">MOL: ${fmtK(mol)}</div></div>
    <div class="kpi cyan"><div class="kpi-label">Ore Totali</div>
      <div class="kpi-value">${fmt(ore)}</div>
      <div class="kpi-sub">media ${cnt ? fmt(Math.round(ore / cnt)) : 0}/commessa</div></div>
    <div class="kpi purple"><div class="kpi-label">Conclusi</div>
      <div class="kpi-value">${fmt(conclusi)}</div>
      <div class="kpi-sub">${pct(conclusi, cnt)} del filtrato</div></div>
    <div class="kpi pink"><div class="kpi-label">In Corso</div>
      <div class="kpi-value">${fmt(inCorso)}</div>
      <div class="kpi-sub">Avz. medio: ${avgAvz.toFixed(1)}%</div></div>
  `;
}
