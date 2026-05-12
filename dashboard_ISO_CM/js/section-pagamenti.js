/* ── Sezione ISO-specifica: Stato Pagamento & Accordi ──
 * Visibilità sui colori "semaforo" del pagamento (Verde/Giallo/Blu/Rosso)
 * e su quante commesse hanno un Accordo di Pagamento esplicito.
 *
 * Nota: il campo "Insoluti" è popolato al 100% ma SEMPRE con valore "No"
 * — quindi inutile farne grafico. La sezione si concentra su Stato
 * Pagamento testuale (7 valori) + Accordo Pagamenti (1.028 valorizzati).
 */

const ISO_PAG_COLOR_RE = [
  { re: /^Verde.*Omaggio/i,    color: '#84cc16', label: 'Verde Omaggio' },
  { re: /^Verde/i,             color: '#10b981', label: 'Verde Saldato' },
  { re: /^Giallo\s*Rosso/i,    color: '#dc2626', label: 'Giallo-Rosso (Insoluto anno prec.)' },
  { re: /^Giallo/i,            color: '#f59e0b', label: 'Giallo (Iniziare lavorazione)' },
  { re: /^Blu/i,               color: '#3b82f6', label: 'Blu (Accordi pagamento)' },
  { re: /^Arancione/i,         color: '#fb923c', label: 'Arancione (Acconto)' },
];

function _isoPagColor(v) {
  for (const m of ISO_PAG_COLOR_RE) {
    if (m.re.test(v || '')) return m;
  }
  return { color: '#64748b', label: v || 'N/D' };
}

function renderPagamenti() {
  const el = document.getElementById('sec-pagamenti');
  if (!el) return;
  const f = filtered;

  // Aggrega per Stato Pagamento (raw + label sintetica)
  const g = {};
  f.forEach(c => {
    const raw = (c.isoStatoPagamentoTxt && c.isoStatoPagamentoTxt.trim()) ? c.isoStatoPagamentoTxt : 'N/D';
    const m = _isoPagColor(raw);
    if (!g[m.label]) g[m.label] = { cnt: 0, cons: 0, raw, color: m.color };
    g[m.label].cnt++;
    g[m.label].cons += (c.consulenza || 0);
  });

  const totale = f.length;
  const conAccordo = f.filter(c => c.isoAccordoPagamenti && String(c.isoAccordoPagamenti).trim()).length;
  const insolutiAnnoPrec = f.filter(c => /Insoluto/i.test(c.isoStatoPagamentoTxt || '')).length;
  const verde = f.filter(c => /^Verde/i.test(c.isoStatoPagamentoTxt || '')).length;
  const giallo = f.filter(c => /^Giallo[^R]/i.test(c.isoStatoPagamentoTxt || '')).length;

  let h = '<div class="sec"><h3 class="sec-title">Stato Pagamento &amp; Accordi · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Codici colore del campo "Stato Pagamento". ' +
       'Verde = saldato, Giallo = da iniziare/incompleto, Blu = accordi in corso, Rosso = insoluti anno precedente. ' +
       'Il campo "Insoluti" dell\'Excel è sempre <i>No</i> e non porta informazione: usiamo questo come segnale.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_isoDrillPag(\'verde\')"><div class="kpi-label">🟢 Saldate</div><div class="kpi-value">' + fmt(verde) + '</div><div class="kpi-sub">' + (totale ? (verde/totale*100).toFixed(0) : 0) + '% del totale</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_isoDrillPag(\'giallo\')"><div class="kpi-label">🟡 Da iniziare</div><div class="kpi-value">' + fmt(giallo) + '</div><div class="kpi-sub">lavorazione bloccata</div></div>';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_isoDrillPag(\'insoluto\')"><div class="kpi-label">🟥 Insoluti anno prec.</div><div class="kpi-value">' + fmt(insolutiAnnoPrec) + '</div><div class="kpi-sub">recupero crediti</div></div>';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_isoDrillPag(\'accordo\')"><div class="kpi-label">🟦 Con Accordo</div><div class="kpi-value">' + fmt(conAccordo) + '</div><div class="kpi-sub">accordo pagamento esplicito</div></div>';
  h += '</div>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione Stato Pagamento</h4><div class="chart-wrap"><canvas id="chPagDonut"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Stato Pagamento</h4><div class="chart-wrap"><canvas id="chPagRic"></canvas></div></div>';
  h += '</div>';

  // Tabella + esempi accordo
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per Stato</h4>';
  h += '<div class="tbl-scroll"><table id="tblPag"></table></div></div>';

  if (conAccordo) {
    h += '<div class="card" style="margin-top:14px"><h4>Esempi di Accordi Pagamento (top 30)</h4>';
    h += '<div class="tbl-scroll"><table id="tblAccordi"></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  // Charts
  const entries = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);
  const labels = entries.map(e => e[0]);
  const cnts = entries.map(e => e[1].cnt);
  const ricavi = entries.map(e => e[1].cons);
  const colors = entries.map(e => e[1].color);
  makeDonut('chPagDonut', labels, cnts, colors);
  makeBar('chPagRic', labels, ricavi, '#3b82f6', true);

  buildTbl('tblPag',
    ['Stato Pagamento', 'Commesse', 'Ricavi', '% Sul totale'],
    entries.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.cons), val: v.cons },
      { display: totale ? (v.cnt / totale * 100).toFixed(1) + '%' : '0%', val: totale ? v.cnt / totale * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num']
  );

  if (conAccordo) {
    const samples = f.filter(c => c.isoAccordoPagamenti && String(c.isoAccordoPagamenti).trim()).slice(0, 30);
    buildTbl('tblAccordi',
      ['Cliente', 'Stato', 'Accordo', 'Ricavi', 'Qnet'],
      samples.map(c => [
        { display: (c.cliente || '—').substring(0, 35), val: c.cliente || '' },
        { display: (c.isoStatoPagamentoTxt || '—').substring(0, 30), val: c.isoStatoPagamentoTxt || '' },
        { display: String(c.isoAccordoPagamenti).substring(0, 60), val: c.isoAccordoPagamenti },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        { display: qnetBtn(c), val: c.id }
      ]),
      ['str', 'str', 'str', 'num', 'str']
    );
  }
}

function _isoDrillPag(bucket) {
  let pred, label;
  if (bucket === 'verde')    { pred = c => /^Verde/i.test(c.isoStatoPagamentoTxt || '');                 label = 'Saldate (Verde)'; }
  else if (bucket === 'giallo') { pred = c => /^Giallo[^R]/i.test(c.isoStatoPagamentoTxt || '');         label = 'Da iniziare (Giallo)'; }
  else if (bucket === 'insoluto') { pred = c => /Insoluto|Giallo.*Rosso/i.test(c.isoStatoPagamentoTxt || ''); label = 'Insoluti anno precedente'; }
  else if (bucket === 'accordo') { pred = c => c.isoAccordoPagamenti && String(c.isoAccordoPagamenti).trim(); label = 'Con Accordo Pagamento'; }
  else return;
  const list = filtered.filter(pred);
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
