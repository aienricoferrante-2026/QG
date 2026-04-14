/* ── KPI Rendering ── */

function updateKPIs() {
  const el = document.getElementById('kpis');
  const tot = filtered.reduce((s, d) => s + d.totale, 0);
  const cnt = filtered.length;
  const avg = cnt ? tot / cnt : 0;
  const contr = filtered.filter(d => d.status === 'Offerta Contrattualizzata');
  const contrVal = contr.reduce((s, d) => s + d.totale, 0);
  const rate = cnt ? (contr.length / cnt * 100) : 0;
  const rif = filtered.filter(d => d.status === 'Offerta Rifiutata').length;
  const pres = filtered.filter(d => d.status === 'Offerta Presentata').length;

  el.innerHTML = `
    <div class="kpi blue">
      <div class="kpi-label">Offerte Totali</div>
      <div class="kpi-value">${cnt.toLocaleString('it-IT')}</div>
      <div class="kpi-sub">record filtrati</div>
    </div>
    <div class="kpi green">
      <div class="kpi-label">Valore Totale</div>
      <div class="kpi-value">&euro; ${fmtK(tot)}</div>
      <div class="kpi-sub">&euro; ${fmt(tot)}</div>
    </div>
    <div class="kpi purple">
      <div class="kpi-label">Valore Medio</div>
      <div class="kpi-value">&euro; ${fmtK(avg)}</div>
      <div class="kpi-sub">per offerta</div>
    </div>
    <div class="kpi cyan">
      <div class="kpi-label">Contrattualizzate</div>
      <div class="kpi-value">${contr.length.toLocaleString('it-IT')}</div>
      <div class="kpi-sub">&euro; ${fmtK(contrVal)} (${rate.toFixed(1)}%)</div>
    </div>
    <div class="kpi orange">
      <div class="kpi-label">Presentate</div>
      <div class="kpi-value">${pres.toLocaleString('it-IT')}</div>
      <div class="kpi-sub">in attesa</div>
    </div>
    <div class="kpi red">
      <div class="kpi-label">Rifiutate</div>
      <div class="kpi-value">${rif.toLocaleString('it-IT')}</div>
      <div class="kpi-sub">${cnt ? (rif / cnt * 100).toFixed(1) : '0'}% del totale</div>
    </div>
  `;
}
