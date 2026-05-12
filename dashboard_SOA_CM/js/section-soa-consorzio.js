/* Sezione SOA-specifica: Consorzio
 * Caso 2 — fork interno alla BU SOA.
 * Mostra appartenenza al Consorzio + ranking dei consorzi.
 * Campi: consorzioFlag ("Appartenenza Consorzio"), consorzio ("Nome del Consorzio").
 */
function renderConsorzio() {
  const el = document.getElementById('sec-consorzio');
  if (!el) return;
  const f = filtered;

  const inCons = f.filter(c => (c.consorzio || '').trim() || /si|sì|yes|true/i.test(String(c.consorzioFlag || '')));
  const noCons = f.length - inCons.length;

  const g = {};
  inCons.forEach(c => {
    const k = (c.consorzio || '').trim() || 'Non specificato';
    if (!g[k]) g[k] = { cnt: 0, ricavi: 0, mol: 0 };
    g[k].cnt++;
    g[k].ricavi += (c.consulenza || 0);
    g[k].mol    += (c.mol || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Consorzio</h3>';
  h += '<div class="kpi-grid" style="margin-bottom:14px">';
  h += mkpi(fmt(inCons.length),         'Commesse in consorzio');
  h += mkpi(fmt(noCons),                'Commesse extra-consorzio');
  h += mkpi(pct(inCons.length, f.length), '% In consorzio');
  h += mkpi(fmt(sorted.length),         'Consorzi distinti');
  h += '</div>';

  if (!inCons.length) {
    h += '<div class="card"><p style="text-align:center;padding:20px;color:var(--text2)">Nessuna commessa marcata come "in consorzio" nei filtri correnti.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  h += '<div class="row2">';
  h += '<div class="card"><h4>In / Fuori Consorzio</h4><div class="chart-wrap"><canvas id="chConsDonut"></canvas></div></div>';
  h += '<div class="card"><h4>Top Consorzi</h4><div class="chart-wrap"><canvas id="chConsTop"></canvas></div></div>';
  h += '</div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblCons"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeDonut('chConsDonut',
    ['In consorzio', 'Fuori consorzio'],
    [inCons.length, noCons],
    ['#8b5cf6', '#475569']);

  const top = sorted.slice(0, 10);
  makeBar('chConsTop',
    top.map(e => e[0].length > 22 ? e[0].slice(0, 20) + '…' : e[0]),
    top.map(e => e[1].cnt),
    '#8b5cf6', true);

  buildTbl('tblCons',
    ['Consorzio', 'Comm.', 'Ricavi', 'MOL'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt),     val: v.cnt },
      { display: fmtE(v.ricavi), val: v.ricavi },
      { display: fmtE(v.mol),    val: v.mol }
    ]),
    ['str', 'num', 'num', 'num'],
    { clickField: 'consorzio' }
  );
}
