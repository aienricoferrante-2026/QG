/* ── Sezione ISO-specifica: Stato del Certificato ──
 * Mostra la distribuzione della fase del ciclo certificazione: Prima
 * Emissione → I/II/III Sorveglianza → Ricertificazione → IV/V Sorv.
 * Pattern di alto valore operativo (sai dove sta ogni cliente nel ciclo).
 */

const ISO_CERT_ORDER = [
  'Prima Emissione',
  'I Sorveglianza', 'II Sorveglianza', 'III Sorveglianza',
  'IV Sorveglianza', 'V Sorveglianza',
  'Ricertificazione',
];
const ISO_CERT_COLOR = {
  'Prima Emissione':  '#10b981',
  'I Sorveglianza':   '#3b82f6',
  'II Sorveglianza':  '#6366f1',
  'III Sorveglianza': '#8b5cf6',
  'IV Sorveglianza':  '#a78bfa',
  'V Sorveglianza':   '#c084fc',
  'Ricertificazione': '#f59e0b',
  'N/D':              '#64748b',
};

function _isoCertN(v) {
  return (v && String(v).trim()) ? String(v).trim() : 'N/D';
}

function renderCertificati() {
  const el = document.getElementById('sec-certificati');
  if (!el) return;
  const f = filtered;

  // Aggrega per Stato Certificato
  const g = {};
  f.forEach(c => {
    const k = _isoCertN(c.isoStatoCert);
    if (!g[k]) g[k] = { cnt: 0, cons: 0, byEnte: {} };
    g[k].cnt++;
    g[k].cons += (c.consulenza || 0);
    const ente = (c.isoEnte && c.isoEnte.trim()) ? c.isoEnte : 'N/D';
    g[k].byEnte[ente] = (g[k].byEnte[ente] || 0) + 1;
  });

  // Sezione ordinata: prima quelli noti nell'ordine del ciclo, poi gli sconosciuti
  const ordered = ISO_CERT_ORDER.filter(k => g[k]);
  const others = Object.keys(g).filter(k => !ISO_CERT_ORDER.includes(k));
  const all = [...ordered, ...others];
  const primaEm = (g['Prima Emissione'] || {}).cnt || 0;
  const sorv = ['I Sorveglianza','II Sorveglianza','III Sorveglianza','IV Sorveglianza','V Sorveglianza']
    .reduce((s, k) => s + ((g[k] || {}).cnt || 0), 0);
  const ricert = (g['Ricertificazione'] || {}).cnt || 0;
  const noStato = (g['N/D'] || {}).cnt || 0;

  let h = '<div class="sec"><h3 class="sec-title">Stato del Certificato · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Fase del ciclo certificazione per ogni commessa. ' +
       'Aiuta a vedere dove sta ogni cliente nel triennio (Prima Emissione → 2 Sorveglianze → Ricertificazione → 2 Sorveglianze).</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_isoDrillCert(\'Prima Emissione\')"><div class="kpi-label">Prima Emissione</div><div class="kpi-value">' + fmt(primaEm) + '</div><div class="kpi-sub">nuove certificazioni</div></div>';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_isoDrillCert(\'__sorv\')"><div class="kpi-label">In Sorveglianza</div><div class="kpi-value">' + fmt(sorv) + '</div><div class="kpi-sub">I + II + III + IV + V</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_isoDrillCert(\'Ricertificazione\')"><div class="kpi-label">Ricertificazione</div><div class="kpi-value">' + fmt(ricert) + '</div><div class="kpi-sub">fine triennio</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Senza Stato</div><div class="kpi-value">' + fmt(noStato) + '</div><div class="kpi-sub">campo vuoto</div></div>';
  h += '</div>';

  // Donut + bar
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione (donut)</h4><div class="chart-wrap"><canvas id="chCertDonut"></canvas></div></div>';
  h += '<div class="card"><h4>Distribuzione ordinata per fase (bar)</h4><div class="chart-wrap"><canvas id="chCertBar"></canvas></div></div>';
  h += '</div>';

  // Tabella per fase + top ente
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per fase certificazione</h4>';
  h += '<div class="tbl-scroll"><table id="tblCert"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // Charts
  const labels = all;
  const cnts = all.map(k => g[k].cnt);
  const colors = all.map(k => ISO_CERT_COLOR[k] || '#64748b');
  makeDonut('chCertDonut', labels, cnts, colors);
  makeBar('chCertBar', labels, cnts, '#3b82f6', false);

  // Tabella
  buildTbl('tblCert',
    ['Fase', 'Commesse', 'Ricavi', 'Ente prevalente', '% Sul totale'],
    all.map(k => {
      const top = Object.entries(g[k].byEnte).sort((a, b) => b[1] - a[1])[0];
      const totale = f.length;
      const pctVal = totale ? (g[k].cnt / totale * 100) : 0;
      return [
        { display: k, val: ISO_CERT_ORDER.indexOf(k) >= 0 ? ISO_CERT_ORDER.indexOf(k) : 99 },
        { display: fmt(g[k].cnt), val: g[k].cnt },
        { display: fmtE(g[k].cons), val: g[k].cons },
        { display: top ? top[0] + ' (' + top[1] + ')' : '—', val: top ? top[0] : '' },
        { display: pctVal.toFixed(1) + '%', val: pctVal }
      ];
    }),
    ['num', 'num', 'num', 'str', 'num'],
    { clickField: 'isoStatoCert' }
  );
}

function _isoDrillCert(bucket) {
  let list, label;
  if (bucket === '__sorv') {
    list = filtered.filter(c => /^[IV]{1,3} Sorveglianza$/.test(c.isoStatoCert || ''));
    label = 'In Sorveglianza';
  } else {
    list = filtered.filter(c => (c.isoStatoCert || '') === bucket);
    label = bucket;
  }
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
