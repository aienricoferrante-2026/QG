/* Sezione SOA-specifica: Enti Certificazione 9001
 * Caso 2 — fork interno alla BU SOA.
 * Analytics: enti certificatori + scadenze prossime/scadute.
 */

function _parseGgMmYyyy(s) {
  const m = String(s || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function renderEntiCert9001() {
  const el = document.getElementById('sec-entiCert9001');
  if (!el) return;
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = (c.enteCert9001 || '').trim() || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, ricavi: 0 };
    g[k].cnt++;
    g[k].ricavi += (c.consulenza || 0);
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  // Scadenze 9001
  const now = new Date();
  const in90 = new Date(now); in90.setDate(in90.getDate() + 90);
  const scadute  = f.filter(c => { const d = _parseGgMmYyyy(c.scadenzaCert); return d && d < now; });
  const inScad   = f.filter(c => { const d = _parseGgMmYyyy(c.scadenzaCert); return d && d >= now && d <= in90; });
  const conScad  = f.filter(c => _parseGgMmYyyy(c.scadenzaCert));

  let h = '<div class="sec"><h3 class="sec-title">Enti Certificazione 9001</h3>';
  h += '<div class="kpi-grid" style="margin-bottom:14px">';
  h += mkpi(fmt(sorted.filter(e => e[0] !== 'N/D').length), 'Enti distinti');
  h += mkpi(fmt(conScad.length), 'Cert. con scadenza tracciata');
  h += mkpi(fmt(scadute.length), 'Cert. SCADUTE');
  h += mkpi(fmt(inScad.length),  'Scadenza ≤ 90gg');
  h += '</div>';
  h += '<div class="card"><h4>Commesse per Ente</h4><div class="chart-wrap"><canvas id="chEnti"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblEnti"></table></div></div>';
  if (scadute.length || inScad.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Scadenze Critiche</h4>';
    h += '<div class="tbl-scroll"><table id="tblScad"></table></div></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  const top = sorted.slice(0, 12);
  makeBar('chEnti',
    top.map(e => e[0].length > 22 ? e[0].slice(0, 20) + '…' : e[0]),
    top.map(e => e[1].cnt),
    '#06b6d4', true);

  buildTbl('tblEnti',
    ['Ente Certificazione', 'Comm.', 'Ricavi'],
    sorted.map(([k, v]) => [
      { display: k.length > 50 ? k.slice(0, 48) + '…' : k, val: k },
      { display: fmt(v.cnt),     val: v.cnt },
      { display: fmtE(v.ricavi), val: v.ricavi }
    ]),
    ['str', 'num', 'num'],
    { clickField: 'enteCert9001' }
  );

  if (scadute.length || inScad.length) {
    const rows = [];
    scadute.forEach(c => rows.push({ c, tag: '<span class="tag tag-red">SCADUTA</span>' }));
    inScad.forEach(c  => rows.push({ c, tag: '<span class="tag tag-yellow">≤ 90gg</span>' }));
    buildTbl('tblScad',
      ['Stato', 'Cliente', 'Ente 9001', 'Scadenza', 'Responsabile'],
      rows.map(r => [
        { display: r.tag, val: r.tag },
        { display: r.c.cliente || '—', val: r.c.cliente || '' },
        { display: (r.c.enteCert9001 || '—').slice(0, 40), val: r.c.enteCert9001 || '' },
        { display: r.c.scadenzaCert || '—', val: _parseGgMmYyyy(r.c.scadenzaCert)?.getTime() || 0 },
        { display: r.c.responsabile || '—', val: r.c.responsabile || '' }
      ]),
      ['str', 'str', 'str', 'num', 'str']
    );
  }
}
