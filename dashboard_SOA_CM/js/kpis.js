/* ── Filtered KPIs ── */

function renderFilteredKpis() {
  const el = document.getElementById('filteredKpis');
  const f = filtered;
  const cnt = f.length;
  const ente = f.reduce((s, c) => s + c.importoEnte, 0);
  const eseguiti = f.filter(c => c.status === 'Eseguito').length;
  const pianificati = f.filter(c => c.status === 'Pianificato').length;
  const sospesi = f.filter(c => c.statoLav.includes('SOSPESO')).length;
  const conclusi = f.filter(c => c.statoLav.includes('Conclusa') || c.statoLav.includes('OK Incassato')).length;
  const avgAvz = cnt ? (f.reduce((s, c) => s + c.avanzamento, 0) / cnt) : 0;

  el.innerHTML = `
    <div class="kpi blue"><div class="kpi-label">Commesse SOA</div>
      <div class="kpi-value">${fmt(cnt)}</div>
      <div class="kpi-sub">di ${fmt(D.length)} totali</div></div>
    <div class="kpi green"><div class="kpi-label">Importo Ente</div>
      <div class="kpi-value">${fmtK(ente)}</div>
      <div class="kpi-sub">${fmtE(ente)}</div></div>
    <div class="kpi cyan"><div class="kpi-label">Eseguiti</div>
      <div class="kpi-value">${fmt(eseguiti)}</div>
      <div class="kpi-sub">${pct(eseguiti, cnt)}</div></div>
    <div class="kpi orange"><div class="kpi-label">Pianificati</div>
      <div class="kpi-value">${fmt(pianificati)}</div>
      <div class="kpi-sub">${pct(pianificati, cnt)}</div></div>
    <div class="kpi red"><div class="kpi-label">Sospesi</div>
      <div class="kpi-value">${fmt(sospesi)}</div>
      <div class="kpi-sub">${pct(sospesi, cnt)}</div></div>
    <div class="kpi purple"><div class="kpi-label">Avz. Medio</div>
      <div class="kpi-value">${avgAvz.toFixed(1)}%</div>
      <div class="kpi-sub">${fmt(conclusi)} conclusi istruttoria</div></div>
  `;
}
