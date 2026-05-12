/* Sezione SOA-specifica: SOA Attestanti
 * Caso 2 della governance — fork interno alla BU SOA.
 * Analytics: ranking degli enti che attestano + drill-down.
 */
function renderSoaAttestanti() {
  const el = document.getElementById('sec-soaAttestanti');
  if (!el) return;
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = (c.soaAttestante || '').trim() || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ricavi: 0, mol: 0, eseg: 0, attivi: 0 };
    g[k].cnt++;
    g[k].ricavi += (c.consulenza || 0);
    g[k].mol    += (c.mol || 0);
    if (isClosed(c)) g[k].eseg++;
    if (isOpen(c))   g[k].attivi++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].ricavi - a[1].ricavi);

  const top = sorted.slice(0, 15);
  const enti = sorted.filter(e => e[0] !== 'N/D').length;
  const cov  = f.length ? f.filter(c => (c.soaAttestante || '').trim()).length : 0;

  let h = '<div class="sec"><h3 class="sec-title">SOA Attestanti</h3>';
  h += '<div class="kpi-grid" style="margin-bottom:14px">';
  h += mkpi(fmt(enti),                'Enti distinti');
  h += mkpi(fmt(cov) + ' / ' + fmt(f.length), 'Commesse con attestante');
  h += mkpi(pct(cov, f.length),       '% Copertura dato');
  h += '</div>';
  h += '<div class="card"><h4>Top 15 Attestanti per Ricavi</h4><div class="chart-wrap"><canvas id="chSoaAtt"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblSoaAtt"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chSoaAtt',
    top.map(e => e[0].length > 28 ? e[0].slice(0, 26) + '…' : e[0]),
    top.map(e => e[1].ricavi),
    '#f59e0b', true);

  buildTbl('tblSoaAtt',
    ['SOA Attestante', 'Comm.', 'Aperte', 'Eseguite', 'Ricavi', 'MOL'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt),    val: v.cnt },
      { display: fmt(v.attivi), val: v.attivi },
      { display: fmt(v.eseg),   val: v.eseg },
      { display: fmtE(v.ricavi),val: v.ricavi },
      { display: fmtE(v.mol),   val: v.mol }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'soaAttestante' }
  );
}
