/* ── Hub · vista Cross-settore ────────────────────────────────────
 * Estende index.html con un consolidato comparativo fra le 10 BU
 * "kit-based" (FOR + ISO + SIC + APL_PAL + GDPR + SOA + AVV + GAR
 * + FIA + APL_RES + IST).
 *
 * Dipendenze: usa i dati caricati da loadGlobalKpis() dell'hub,
 * esposti come window.crossSectorData = { aggr, fetched }.
 * Non aggiunge dipendenze esterne: bar chart in HTML+CSS puro.
 *
 * Renderizza 4 viste:
 *   1. Tabella comparativa ordinabile (10 BU × 7 metriche)
 *   2. Bar chart "Ricavi per BU"   (orizzontale, ordinato)
 *   3. Bar chart "Margine % per BU" (con barre colorate per soglia)
 *   4. Top 15 clienti cross-BU (clienti presenti in più di una BU)
 */

const HUB_BU_META = {
  FOR:     { label: 'Formazione',          color: '#10b981', icon: '🎓' },
  ISO:     { label: 'Certificazioni ISO',  color: '#3b82f6', icon: '📜' },
  SIC:     { label: 'Sicurezza Lavoro',    color: '#06b6d4', icon: '🛡️' },
  APL_PAL: { label: 'Politiche Attive',    color: '#a78bfa', icon: '💼' },
  GDPR:    { label: 'Privacy / GDPR',      color: '#ec4899', icon: '🔒' },
  SOA:     { label: 'Attestazioni SOA',    color: '#f59e0b', icon: '🏗️' },
  AVV:     { label: 'Avvalimenti',         color: '#a78bfa', icon: '🤝' },
  GAR:     { label: "Gare d'appalto",      color: '#06b6d4', icon: '🎯' },
  FIA:     { label: 'Finanza Agevolata',   color: '#fbbf24', icon: '💰' },
  APL_RES: { label: 'PAL Risorse',         color: '#10b981', icon: '👥' },
  IST:     { label: 'Istituti',            color: '#34d399', icon: '🏛️' },
};

function hcFmt(n) { return Number(n || 0).toLocaleString('it-IT'); }
function hcFmtK(n) {
  n = Number(n || 0);
  if (Math.abs(n) >= 1e6) return '€ ' + (n / 1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return '€ ' + (n / 1e3).toFixed(1) + 'K';
  return '€ ' + n.toFixed(0);
}

function _hcBar(val, max, color, width) {
  /* Genera HTML di una barra orizzontale con larghezza proporzionale. */
  const pct = max > 0 ? (val / max * 100) : 0;
  return '<div style="background:#1e293b22;border-radius:3px;height:10px;width:' + (width || 100) + 'px;position:relative;overflow:hidden">' +
         '<div style="background:' + color + ';height:100%;width:' + pct.toFixed(1) + '%;border-radius:3px"></div></div>';
}

function _hcSort(rows, idx, dir) {
  /* Sort generic: numeric se i val sono numeri, alfabetico altrimenti. */
  const sample = rows[0] && rows[0][idx] && rows[0][idx].val;
  const isNum = typeof sample === 'number';
  return [...rows].sort((a, b) => {
    const va = a[idx].val, vb = b[idx].val;
    if (isNum) return dir === 'asc' ? va - vb : vb - va;
    return dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
}

let _hcCurrentSort = { idx: 2, dir: 'desc' }; // default: per Ricavi desc

function renderCrossSector() {
  const data = window.crossSectorData;
  if (!data || !data.aggr || !data.fetched) return;
  const { aggr, fetched } = data;

  const el = document.getElementById('crossSectorBody');
  if (!el) return;

  // Costruisce righe: solo i settori realmente caricati (escludendo legacy duplicati)
  const codes = Object.keys(HUB_BU_META);
  const rows = codes.filter(c => aggr[c]).map(c => {
    const a = aggr[c];
    const margPct = a.ric ? (a.mol / a.ric * 100) : 0;
    const incPct = a.ric ? (a.inc / a.ric * 100) : 0;
    return [
      { display: HUB_BU_META[c].icon + ' ' + HUB_BU_META[c].label, val: HUB_BU_META[c].label, code: c },
      { display: hcFmt(a.cnt), val: a.cnt },
      { display: hcFmtK(a.ric), val: a.ric },
      { display: hcFmtK(a.mol), val: a.mol },
      { display: margPct.toFixed(1) + '%', val: margPct },
      { display: incPct.toFixed(1) + '%', val: incPct },
      { display: hcFmtK(a.esp), val: a.esp },
      { display: hcFmt(a.clienti), val: a.clienti },
    ];
  });

  // Trova il max Ricavi e Margine per scalare le barre
  const maxRic = Math.max(...rows.map(r => r[2].val), 0);
  const maxMarg = Math.max(...rows.map(r => r[4].val), 0);

  const sorted = _hcSort(rows, _hcCurrentSort.idx, _hcCurrentSort.dir);

  // ── HTML tabella ──
  const cols = ['BU', 'Commesse', 'Ricavi', 'MOL', 'Margine %', '% Incasso', 'Da Incassare', 'Clienti'];
  let h = '<table class="hc-table"><thead><tr>';
  cols.forEach((c, i) => {
    const arrow = _hcCurrentSort.idx === i ? (_hcCurrentSort.dir === 'asc' ? ' ▲' : ' ▼') : '';
    h += '<th onclick="_hcSetSort(' + i + ')" style="cursor:pointer;user-select:none">' + c + arrow + '</th>';
  });
  h += '</tr></thead><tbody>';
  sorted.forEach(r => {
    const code = r[0].code;
    const meta = HUB_BU_META[code];
    const margPct = r[4].val;
    const margCls = margPct >= 20 ? 'pos' : margPct >= 5 ? '' : 'neg';
    const incPct = r[5].val;
    const incCls = incPct >= 80 ? 'pos' : incPct >= 50 ? '' : 'warn';
    h += '<tr>';
    h += '<td><a href="dashboard_' + code + '_CM/" style="color:var(--text);text-decoration:none">' + r[0].display + '</a></td>';
    h += '<td style="text-align:right">' + r[1].display + '</td>';
    h += '<td style="text-align:right"><span style="color:' + meta.color + ';font-weight:600">' + r[2].display + '</span> ' + _hcBar(r[2].val, maxRic, meta.color, 60) + '</td>';
    h += '<td style="text-align:right">' + r[3].display + '</td>';
    h += '<td style="text-align:right"><b class="' + margCls + '">' + r[4].display + '</b></td>';
    h += '<td style="text-align:right"><b class="' + incCls + '">' + r[5].display + '</b></td>';
    h += '<td style="text-align:right">' + r[6].display + '</td>';
    h += '<td style="text-align:right">' + r[7].display + '</td>';
    h += '</tr>';
  });
  h += '</tbody></table>';

  // ── Bar chart Ricavi per BU (orizzontale) ──
  h += '<div class="hc-grid2" style="margin-top:24px">';
  h += '<div class="hc-card"><h4>📊 Ricavi per BU</h4>';
  const ricDesc = [...rows].sort((a, b) => b[2].val - a[2].val);
  ricDesc.forEach(r => {
    const code = r[0].code;
    const meta = HUB_BU_META[code];
    const pct = maxRic > 0 ? (r[2].val / maxRic * 100) : 0;
    h += '<div class="hc-barrow"><span class="hc-barlbl">' + meta.icon + ' ' + code + '</span>';
    h += '<div class="hc-barbg"><div class="hc-barfg" style="background:' + meta.color + ';width:' + pct.toFixed(1) + '%"></div></div>';
    h += '<span class="hc-barval">' + hcFmtK(r[2].val) + '</span></div>';
  });
  h += '</div>';

  // ── Bar chart Margine % per BU ──
  h += '<div class="hc-card"><h4>💹 Margine % per BU</h4>';
  const margDesc = [...rows].sort((a, b) => b[4].val - a[4].val);
  margDesc.forEach(r => {
    const code = r[0].code;
    const meta = HUB_BU_META[code];
    const mg = r[4].val;
    const pct = maxMarg > 0 ? Math.max(0, mg) / maxMarg * 100 : 0;
    const color = mg >= 20 ? '#10b981' : mg >= 5 ? '#f59e0b' : '#dc2626';
    h += '<div class="hc-barrow"><span class="hc-barlbl">' + meta.icon + ' ' + code + '</span>';
    h += '<div class="hc-barbg"><div class="hc-barfg" style="background:' + color + ';width:' + pct.toFixed(1) + '%"></div></div>';
    h += '<span class="hc-barval">' + mg.toFixed(1) + '%</span></div>';
  });
  h += '</div>';
  h += '</div>';

  // ── Top clienti cross-BU ──
  const clienteBU = {};
  fetched.forEach(({ code, items }) => {
    items.forEach(c => {
      const cli = (c.cliente || '').trim();
      if (!cli) return;
      if (!clienteBU[cli]) clienteBU[cli] = { bus: new Set(), cnt: 0, ric: 0 };
      clienteBU[cli].bus.add(code);
      clienteBU[cli].cnt++;
      clienteBU[cli].ric += (c.consulenza || 0);
    });
  });
  const topMulti = Object.entries(clienteBU)
    .filter(([, v]) => v.bus.size >= 2)
    .sort((a, b) => b[1].bus.size - a[1].bus.size || b[1].ric - a[1].ric)
    .slice(0, 15);

  h += '<div class="hc-card" style="margin-top:24px"><h4>👥 Top 15 clienti cross-BU (presenti in 2+ settori)</h4>';
  if (topMulti.length === 0) {
    h += '<p style="color:var(--text3);font-size:12px">Nessun cliente è presente in più di una BU.</p>';
  } else {
    h += '<table class="hc-table"><thead><tr>';
    h += '<th>Cliente</th><th style="text-align:right">N° BU</th>';
    h += '<th>BU coinvolte</th><th style="text-align:right">Commesse tot.</th><th style="text-align:right">Ricavi tot.</th>';
    h += '</tr></thead><tbody>';
    topMulti.forEach(([cli, v]) => {
      const busList = [...v.bus].sort().map(c => '<span class="hc-pill" style="background:' + HUB_BU_META[c].color + '22;color:' + HUB_BU_META[c].color + '">' + c + '</span>').join(' ');
      h += '<tr>';
      h += '<td>' + cli.substring(0, 50) + '</td>';
      h += '<td style="text-align:right"><b>' + v.bus.size + '</b></td>';
      h += '<td>' + busList + '</td>';
      h += '<td style="text-align:right">' + hcFmt(v.cnt) + '</td>';
      h += '<td style="text-align:right">' + hcFmtK(v.ric) + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table>';
  }
  h += '</div>';

  el.innerHTML = h;
}

function _hcSetSort(idx) {
  if (_hcCurrentSort.idx === idx) {
    _hcCurrentSort.dir = _hcCurrentSort.dir === 'asc' ? 'desc' : 'asc';
  } else {
    _hcCurrentSort = { idx, dir: 'desc' };
  }
  renderCrossSector();
}

/* Auto-render quando i dati hub sono pronti */
window.addEventListener('crossSectorDataReady', renderCrossSector);
