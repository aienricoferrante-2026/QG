/* ── Filtered KPIs ── */

function renderFilteredKpis() {
  const el = document.getElementById('filteredKpis');
  const f = filtered;
  const cnt = f.length;
  const tot = f.reduce((s, c) => s + c.totale, 0);
  const avg = cnt ? tot / cnt : 0;
  const contr = f.filter(c => c.status === 'Offerta Contrattualizzata');
  const contrVal = contr.reduce((s, c) => s + c.totale, 0);
  const pres = f.filter(c => c.status === 'Offerta Presentata').length;
  const rif = f.filter(c => c.status === 'Offerta Rifiutata').length;

  el.innerHTML = `
    <div class="kpi blue"><div class="kpi-label">Offerte</div>
      <div class="kpi-value">${fmt(cnt)}</div>
      <div class="kpi-sub">di ${fmt(D.length)} totali</div></div>
    <div class="kpi green"><div class="kpi-label">Valore Totale</div>
      <div class="kpi-value">${fmtK(tot)}</div>
      <div class="kpi-sub">${fmtE(tot)}</div></div>
    <div class="kpi purple"><div class="kpi-label">Valore Medio</div>
      <div class="kpi-value">${fmtK(avg)}</div>
      <div class="kpi-sub">per offerta</div></div>
    <div class="kpi cyan"><div class="kpi-label">Contrattualizzate</div>
      <div class="kpi-value">${fmt(contr.length)}</div>
      <div class="kpi-sub">${fmtK(contrVal)} (${pct(contr.length, cnt)})</div></div>
    <div class="kpi orange"><div class="kpi-label">Presentate</div>
      <div class="kpi-value">${fmt(pres)}</div>
      <div class="kpi-sub">in attesa</div></div>
    <div class="kpi pink"><div class="kpi-label">Rifiutate</div>
      <div class="kpi-value">${fmt(rif)}</div>
      <div class="kpi-sub">${pct(rif, cnt)} del totale</div></div>
  `;
}
