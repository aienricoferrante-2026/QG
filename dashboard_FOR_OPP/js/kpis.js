/* ── Filtered KPIs ── */

function renderFilteredKpis() {
  const el = document.getElementById('filteredKpis');
  const f = filtered;
  const cnt = f.length;
  const nuove = f.filter(c => c.status === 'Nuova').length;
  const attesa = f.filter(c => c.status === 'Attesa Pro-forma').length;
  const accettate = f.filter(c => c.status === 'Accettato').length;
  const perse = f.filter(c => c.status === 'Persa').length;
  const inviate = f.filter(c => c.status === 'Offerta Inviata').length;
  const conCorso = f.filter(c => c.corso).length;

  el.innerHTML = `
    <div class="kpi blue"><div class="kpi-label">Opportunità</div>
      <div class="kpi-value">${fmt(cnt)}</div>
      <div class="kpi-sub">di ${fmt(D.length)} totali</div></div>
    <div class="kpi cyan"><div class="kpi-label">Nuove</div>
      <div class="kpi-value">${fmt(nuove)}</div>
      <div class="kpi-sub">${pct(nuove, cnt)} del filtrato</div></div>
    <div class="kpi orange"><div class="kpi-label">Attesa Pro-forma</div>
      <div class="kpi-value">${fmt(attesa)}</div>
      <div class="kpi-sub">${pct(attesa, cnt)} del filtrato</div></div>
    <div class="kpi green"><div class="kpi-label">Accettate</div>
      <div class="kpi-value">${fmt(accettate)}</div>
      <div class="kpi-sub">${pct(accettate, cnt)} del filtrato</div></div>
    <div class="kpi pink"><div class="kpi-label">Perse</div>
      <div class="kpi-value">${fmt(perse)}</div>
      <div class="kpi-sub">${pct(perse, cnt)} del filtrato</div></div>
    <div class="kpi purple"><div class="kpi-label">Con Corso</div>
      <div class="kpi-value">${fmt(conCorso)}</div>
      <div class="kpi-sub">${pct(conCorso, cnt)} assegnate</div></div>
  `;
}
