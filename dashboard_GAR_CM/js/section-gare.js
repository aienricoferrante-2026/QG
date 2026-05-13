/* ── Sezione GAR-specifica: Gare d'appalto ──
 * Caso 2 governance (fork interno BU): vive in dashboard_GAR_CM/js/.
 *
 * Copertura osservata sui 325 record (campi garX dell'Excel):
 *   - garCIG, garDataScadenza, garEnte, garImporto, garOggetto: 5%-9%
 *   - garEsito, garCategoria, garNoteEsito:                     2%
 * Quindi la sezione lavora su ~25-28 commesse con dati gara compilati
 * e mostra esplicitamente la % di copertura.
 */

const GAR_FASCIA = [
  { max:    10000, label: '< 10k',     color: '#a78bfa' },
  { max:    50000, label: '10k–50k',   color: '#8b5cf6' },
  { max:   100000, label: '50k–100k',  color: '#6366f1' },
  { max:   500000, label: '100k–500k', color: '#3b82f6' },
  { max:  1000000, label: '500k–1M',   color: '#0ea5e9' },
  { max:       Infinity, label: '> 1M',     color: '#06b6d4' },
];

function _garFascia(v) {
  for (const f of GAR_FASCIA) if (v <= f.max) return f;
  return GAR_FASCIA[GAR_FASCIA.length - 1];
}

function _garParseDate(s) {
  /* Excel usa dd-mm-yyyy o yyyy-mm-dd. Restituisce Date o null. */
  if (!s) return null;
  const str = String(s).trim();
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = str.match(/^(\d{2})-(\d{2})-(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

function _garHasGara(c) {
  /* Una commessa è "vera gara" se ha almeno uno dei campi GAR-specifici. */
  return !!(c.garCIG || c.garDataScadenza || c.garEnte || c.garImporto ||
            c.garOggetto || c.garEsito);
}

function _garStatoPipeline(c, today) {
  /* Classifica una gara nel funnel:
     - Esitata: ha garEsito popolato
     - Aperta:  data scadenza ≥ oggi
     - Scaduta: data scadenza < oggi senza esito
     - Indef.:  manca data scadenza e manca esito */
  if (c.garEsito && String(c.garEsito).trim()) return 'Esitata';
  const d = _garParseDate(c.garDataScadenza);
  if (!d) return 'Indef.';
  return d >= today ? 'Aperta' : 'Scaduta';
}

function renderGare() {
  const el = document.getElementById('sec-gare');
  if (!el) return;
  const f = filtered;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const conGara = f.filter(_garHasGara);
  const conCIG = f.filter(c => c.garCIG && String(c.garCIG).trim()).length;
  const conScad = f.filter(c => _garParseDate(c.garDataScadenza)).length;
  const conImp = f.filter(c => c.garImporto > 0).length;
  const conEsito = f.filter(c => c.garEsito && String(c.garEsito).trim()).length;
  const importoTot = f.reduce((s, c) => s + (c.garImporto || 0), 0);

  // Funnel pipeline
  const funnel = { 'Aperta': 0, 'Esitata': 0, 'Scaduta': 0, 'Indef.': 0 };
  conGara.forEach(c => { funnel[_garStatoPipeline(c, today)]++; });

  // Aggrega per Ente Appaltante
  const byEnte = {};
  conGara.forEach(c => {
    const k = (c.garEnte && c.garEnte.trim()) ? c.garEnte.trim() : 'N/D';
    if (!byEnte[k]) byEnte[k] = { cnt: 0, imp: 0 };
    byEnte[k].cnt++;
    byEnte[k].imp += (c.garImporto || 0);
  });

  // Fasce Importo
  const fasce = {};
  GAR_FASCIA.forEach(fa => { fasce[fa.label] = { cnt: 0, color: fa.color }; });
  conGara.filter(c => c.garImporto > 0).forEach(c => {
    const fa = _garFascia(c.garImporto);
    fasce[fa.label].cnt++;
  });

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Gare d\'appalto · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'CIG, Ente Appaltante, Data Scadenza, Importo e Esito sono campi dell\'Excel ' +
       'gare. Sezione attiva solo sulle commesse con almeno un campo GAR popolato.</p>';
  const pctCop = f.length ? (conGara.length / f.length * 100) : 0;
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(245,158,11,.1);border-left:3px solid #f59e0b;border-radius:4px">' +
       '⚠ Copertura: solo <b>' + pctCop.toFixed(1) + '%</b> dei record GAR ha campi gara compilati ' +
       '(' + fmt(conGara.length) + '/' + fmt(f.length) + '). Le rimanenti sono lavorazioni MEPA senza ' +
       'metadati specifici. Popolare regolarmente in Qnet per arricchire la sezione.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse GAR</div><div class="kpi-value">' + fmt(f.length) + '</div><div class="kpi-sub">filtro corrente</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_garDrill(\'gara\')"><div class="kpi-label">Con dati gara</div><div class="kpi-value">' + fmt(conGara.length) + '</div><div class="kpi-sub">almeno 1 campo GAR</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_garDrill(\'cig\')"><div class="kpi-label">Con CIG</div><div class="kpi-value">' + fmt(conCIG) + '</div><div class="kpi-sub">cod. ident. gara</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_garDrill(\'scad\')"><div class="kpi-label">Con Scadenza</div><div class="kpi-value">' + fmt(conScad) + '</div><div class="kpi-sub">data scadenza nota</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Importo cumulato</div><div class="kpi-value">' + fmtE(importoTot) + '</div><div class="kpi-sub">somma garImporto</div></div>';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_garDrill(\'esito\')"><div class="kpi-label">Esitate</div><div class="kpi-value">' + fmt(conEsito) + '</div><div class="kpi-sub">con campo Esito</div></div>';
  h += '</div>';

  // Funnel pipeline + Fasce importo
  h += '<div class="row2">';
  h += '<div class="card"><h4>Pipeline · stato vs oggi</h4><div class="chart-wrap"><canvas id="chGarFunnel"></canvas></div></div>';
  h += '<div class="card"><h4>Fasce di Importo (solo con garImporto > 0)</h4><div class="chart-wrap"><canvas id="chGarFasce"></canvas></div></div>';
  h += '</div>';

  // Top Enti Appaltanti
  h += '<div class="card" style="margin-top:14px"><h4>Top Enti Appaltanti (esclude N/D)</h4>';
  h += '<div class="tbl-scroll"><table id="tblGarEnti"></table></div></div>';

  // Tabella dettaglio commesse con dati gara
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio gare · clicca per aprire in Qnet (max 100)</h4>';
  h += '<div class="tbl-scroll"><table id="tblGarDett"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  const funnelOrder = ['Aperta', 'Esitata', 'Scaduta', 'Indef.'];
  const funnelColors = { 'Aperta': '#10b981', 'Esitata': '#3b82f6', 'Scaduta': '#dc2626', 'Indef.': '#64748b' };
  makeDonut('chGarFunnel',
    funnelOrder,
    funnelOrder.map(k => funnel[k]),
    funnelOrder.map(k => funnelColors[k]));

  const fasceLabels = GAR_FASCIA.map(fa => fa.label);
  const fasceCnts = fasceLabels.map(l => fasce[l].cnt);
  makeBar('chGarFasce', fasceLabels, fasceCnts, '#0ea5e9', false);

  // Tabella Enti
  const enteRows = Object.entries(byEnte)
    .filter(([k]) => k !== 'N/D')
    .sort((a, b) => b[1].cnt - a[1].cnt || b[1].imp - a[1].imp)
    .slice(0, 20)
    .map(([k, v]) => [
      { display: k.length > 55 ? k.substring(0, 53) + '…' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: v.imp > 0 ? fmtE(v.imp) : '—', val: v.imp }
    ]);
  buildTbl('tblGarEnti',
    ['Ente Appaltante', 'Gare', 'Importo totale'],
    enteRows,
    ['str', 'num', 'num'],
    { clickField: 'garEnte' });

  // Tabella dettaglio
  const dettRows = conGara.slice(0, 100).map(c => {
    const stato = _garStatoPipeline(c, today);
    return [
      { display: c.garCIG || '—', val: c.garCIG || '' },
      { display: (c.garEnte || '—').substring(0, 30), val: c.garEnte || '' },
      { display: (c.garOggetto || c.titolo || '—').substring(0, 45), val: c.garOggetto || c.titolo || '' },
      { display: c.garDataScadenza || '—', val: _garParseDate(c.garDataScadenza) ? _garParseDate(c.garDataScadenza).getTime() : 0 },
      { display: c.garImporto > 0 ? fmtE(c.garImporto) : '—', val: c.garImporto || 0 },
      { display: stato, val: stato },
      { display: c.garEsito || '—', val: c.garEsito || '' },
      { display: qnetBtn(c), val: c.id }
    ];
  });
  buildTbl('tblGarDett',
    ['CIG', 'Ente', 'Oggetto / Titolo', 'Scadenza', 'Importo', 'Stato', 'Esito', 'Qnet'],
    dettRows,
    ['str', 'str', 'str', 'num', 'num', 'str', 'str', 'str']);
}

function _garDrill(bucket) {
  let pred, label;
  if (bucket === 'gara')        { pred = _garHasGara;                                          label = 'Con dati gara'; }
  else if (bucket === 'cig')    { pred = c => c.garCIG && String(c.garCIG).trim();             label = 'Con CIG'; }
  else if (bucket === 'scad')   { pred = c => _garParseDate(c.garDataScadenza);                label = 'Con Data Scadenza'; }
  else if (bucket === 'esito')  { pred = c => c.garEsito && String(c.garEsito).trim();         label = 'Gare esitate'; }
  else return;
  const list = filtered.filter(pred);
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
