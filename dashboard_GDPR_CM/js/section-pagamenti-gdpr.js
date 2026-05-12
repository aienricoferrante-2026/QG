/* ── Sezione GDPR-specifica: Pagamenti & Accordi ──
 * Caso 2 governance (fork interno BU): vive in dashboard_GDPR_CM/js/.
 *
 * Pattern identico a ISO/section-pagamenti.js ma sui campi GDPR:
 *   - gdprStatoPag (65% riempimento, 5 valori semaforo)
 *   - gdprAccordo  (1% riempimento, 3 valori — utilità bassa)
 *   - gdprInsoluti (100% riempimento, sempre "No" — inutile come distinct)
 *
 * Sezione di alto valore: 65% delle commesse GDPR ha lo stato pagamento
 * compilato, il che permette analisi dirette di saldate / da iniziare /
 * insoluti anno precedente.
 */

const GDPR_PAG_COLOR_RE = [
  { re: /^Verde.*Omaggio/i,  color: '#84cc16', label: 'Verde Omaggio' },
  { re: /^Verde/i,           color: '#10b981', label: 'Verde Saldato' },
  { re: /^Giallo\s*Rosso/i,  color: '#dc2626', label: 'Giallo-Rosso (Insoluto anno prec.)' },
  { re: /^Giallo/i,          color: '#f59e0b', label: 'Giallo (Iniziare lavorazione)' },
  { re: /^Blu/i,             color: '#3b82f6', label: 'Blu (Accordi pagamento)' },
  { re: /^Arancione/i,       color: '#fb923c', label: 'Arancione (Acconto)' },
];

function _gdprPagColor(v) {
  for (const m of GDPR_PAG_COLOR_RE) {
    if (m.re.test(v || '')) return m;
  }
  return { color: '#64748b', label: v || 'N/D' };
}

function renderPagamentiGdpr() {
  const el = document.getElementById('sec-pagamentiGdpr');
  if (!el) return;
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const raw = (c.gdprStatoPag && c.gdprStatoPag.trim()) ? c.gdprStatoPag : 'N/D';
    const m = _gdprPagColor(raw);
    if (!g[m.label]) g[m.label] = { cnt: 0, cons: 0, color: m.color };
    g[m.label].cnt++;
    g[m.label].cons += (c.consulenza || 0);
  });

  const totale = f.length;
  const conAccordo = f.filter(c => c.gdprAccordo && String(c.gdprAccordo).trim()).length;
  const insolutiAnnoPrec = f.filter(c => /Insoluto|Giallo.*Rosso/i.test(c.gdprStatoPag || '')).length;
  const verde = f.filter(c => /^Verde/i.test(c.gdprStatoPag || '')).length;
  const giallo = f.filter(c => /^Giallo[^R]/i.test(c.gdprStatoPag || '')).length;
  const senzaStato = f.filter(c => !c.gdprStatoPag || !c.gdprStatoPag.trim()).length;

  let h = '<div class="sec"><h3 class="sec-title">Pagamenti &amp; Accordi · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Codici colore del campo "Stato Pagamento" sul 65% delle commesse GDPR. ' +
       'Verde = saldato, Giallo = da iniziare, Blu = accordi, Rosso = insoluti anno prec. ' +
       'Il campo "Insoluti" dell\'Excel è sempre <i>No</i> e non porta informazione: usiamo questo come segnale.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_gdprDrillPag(\'verde\')"><div class="kpi-label">🟢 Saldate</div><div class="kpi-value">' + fmt(verde) + '</div><div class="kpi-sub">' + (totale ? (verde/totale*100).toFixed(0) : 0) + '% del totale</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_gdprDrillPag(\'giallo\')"><div class="kpi-label">🟡 Da iniziare</div><div class="kpi-value">' + fmt(giallo) + '</div><div class="kpi-sub">lavorazione bloccata</div></div>';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_gdprDrillPag(\'insoluto\')"><div class="kpi-label">🟥 Insoluti anno prec.</div><div class="kpi-value">' + fmt(insolutiAnnoPrec) + '</div><div class="kpi-sub">recupero crediti</div></div>';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_gdprDrillPag(\'accordo\')"><div class="kpi-label">🟦 Con Accordo</div><div class="kpi-value">' + fmt(conAccordo) + '</div><div class="kpi-sub">accordo pagamento esplicito</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Senza stato</div><div class="kpi-value">' + fmt(senzaStato) + '</div><div class="kpi-sub">campo da popolare</div></div>';
  h += '</div>';

  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione Stato Pagamento</h4><div class="chart-wrap"><canvas id="chGdprPagDonut"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Stato Pagamento</h4><div class="chart-wrap"><canvas id="chGdprPagRic"></canvas></div></div>';
  h += '</div>';

  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per Stato</h4>';
  h += '<div class="tbl-scroll"><table id="tblGdprPag"></table></div></div>';

  if (conAccordo) {
    h += '<div class="card" style="margin-top:14px"><h4>Esempi di Accordi Pagamento</h4>';
    h += '<div class="tbl-scroll"><table id="tblGdprAccordi"></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  const entries = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);
  const labels = entries.map(e => e[0]);
  const cnts = entries.map(e => e[1].cnt);
  const ricavi = entries.map(e => e[1].cons);
  const colors = entries.map(e => e[1].color);
  makeDonut('chGdprPagDonut', labels, cnts, colors);
  makeBar('chGdprPagRic', labels, ricavi, '#3b82f6', true);

  buildTbl('tblGdprPag',
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
    const samples = f.filter(c => c.gdprAccordo && String(c.gdprAccordo).trim()).slice(0, 30);
    buildTbl('tblGdprAccordi',
      ['Cliente', 'Stato', 'Accordo', 'Ricavi', 'Qnet'],
      samples.map(c => [
        { display: (c.cliente || '—').substring(0, 35), val: c.cliente || '' },
        { display: (c.gdprStatoPag || '—').substring(0, 30), val: c.gdprStatoPag || '' },
        { display: String(c.gdprAccordo).substring(0, 60), val: c.gdprAccordo },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        { display: qnetBtn(c), val: c.id }
      ]),
      ['str', 'str', 'str', 'num', 'str']
    );
  }
}

function _gdprDrillPag(bucket) {
  let pred, label;
  if (bucket === 'verde')      { pred = c => /^Verde/i.test(c.gdprStatoPag || '');                  label = 'Saldate (Verde)'; }
  else if (bucket === 'giallo'){ pred = c => /^Giallo[^R]/i.test(c.gdprStatoPag || '');             label = 'Da iniziare (Giallo)'; }
  else if (bucket === 'insoluto'){ pred = c => /Insoluto|Giallo.*Rosso/i.test(c.gdprStatoPag || ''); label = 'Insoluti anno precedente'; }
  else if (bucket === 'accordo'){ pred = c => c.gdprAccordo && String(c.gdprAccordo).trim();        label = 'Con Accordo Pagamento'; }
  else return;
  const list = filtered.filter(pred);
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
