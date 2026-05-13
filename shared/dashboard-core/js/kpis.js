/* ── Filtered KPIs (core multi-settore) ── */

function renderFilteredKpis() {
  const el = document.getElementById('filteredKpis');
  if (!el) return;
  const f = filtered;
  const cnt = f.length;
  const cons = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = f.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = f.reduce((s, c) => s + (c.mol || 0), 0);
  const incassato = f.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const residuo = f.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0);
  const annullate = f.filter(isCancelled).length;
  const eseguite = f.filter(isClosed).length;
  const aperte = f.filter(isOpen).length;
  const margPct = cons ? (mol / cons * 100) : 0;
  const incPct = cons ? (incassato / cons * 100) : 0;

  const ii = (typeof kpiInfoBtn === 'function') ? kpiInfoBtn : (() => '');
  el.innerHTML = `
    <div class="kpi blue"><div class="kpi-label">Commesse ${ii('cnt')}</div>
      <div class="kpi-value">${fmt(cnt)}</div>
      <div class="kpi-sub">di ${fmt(D.length)} totali</div></div>
    <div class="kpi green"><div class="kpi-label">Ricavi ${ii('ricavi')}</div>
      <div class="kpi-value">${fmtK(cons)}</div>
      <div class="kpi-sub">${fmtE(cons)}</div></div>
    <div class="kpi orange"><div class="kpi-label">Costi ${ii('costi')}</div>
      <div class="kpi-value">${fmtK(costi)}</div>
      <div class="kpi-sub">MOL: ${fmtK(mol)} (${margPct.toFixed(1)}%)</div></div>
    <div class="kpi cyan"><div class="kpi-label">Incassato ${ii('incassato')}</div>
      <div class="kpi-value">${fmtK(incassato)}</div>
      <div class="kpi-sub">${incPct.toFixed(1)}% dei ricavi</div></div>
    <div class="kpi pink"><div class="kpi-label">Esposizione ${ii('daIncassare')}</div>
      <div class="kpi-value">${fmtK(residuo)}</div>
      <div class="kpi-sub">credito aperto</div></div>
    <div class="kpi purple"><div class="kpi-label">Aperte / Eseguite ${ii('open')}</div>
      <div class="kpi-value">${fmt(aperte)} / ${fmt(eseguite)}</div>
      <div class="kpi-sub">annullate: ${fmt(annullate)}</div></div>
  `;
}
