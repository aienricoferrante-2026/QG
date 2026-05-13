/* ── Sezione APL_RES-specifica: Ricerca & Selezione ──
 * Caso 2 governance (fork interno BU): vive in dashboard_APL_RES_CM/js/.
 *
 * APL_RES = Ricerca & Selezione personale. Volume modesto (154 commesse).
 * Tipologie ricavate dal titolo:
 *   - RICERCA         pratiche R&S vere (~42%)
 *   - SEGR_DID        Segreterie Didattiche (~12%) — supporto amministrativo
 *   - PROPOSTA        Offerte commerciali da convertire
 *   - TEST            Record di test / PROVA
 *   - Altro           Titoli generici "Ricerca e Selezione", "Direttore Tecnico"
 *
 * Il valore aggiunto è il funnel R&S su statoLav, che è scritto in
 * italiano semantico (non a codici come PAL). Le 6 fasi note:
 *   1. Annuncio pubblicato (Pubblicazione annuncio e avvio ricerca)
 *   2. Screening CV
 *   3. Shortlist (Formazione rosa di N candidati)
 *   4. Colloquio + Feedback
 *   5. Contratto (Accettazione contratto)
 *   6. Conclusa (Conclusione iter / Conclusa / R&S_COMMESSA CONCLUSA)
 */

/* Ordine importante: i pattern più specifici prima.
   SEGR_DID e PROPOSTA hanno prefisso RS_ ma sono semanticamente distinti. */
const RES_TIPI = [
  { id: 'SEGR_DID', label: 'Segreteria Didattica', color: '#10b981',
    test: t => /SEGRET(?:ERIA|ARIA)\s+DIDATTICA/i.test(t) },
  { id: 'PROPOSTA', label: 'Proposte commerciali', color: '#f59e0b',
    test: t => /PROPOSTA/i.test(t) },
  { id: 'TEST',     label: 'Test / Prova',         color: '#64748b',
    test: t => /PROVA|TEST/i.test(t) },
  { id: 'RICERCA',  label: 'Ricerca & Selezione', color: '#3b82f6',
    test: t => /^APL[\s_]R&S/i.test(t) || /^RS[\s_]/i.test(t) ||
               /R&S/.test(t) || /RICERCA\s*[&e]\s*SELEZIONE/i.test(t) },
];

const RES_FUNNEL = [
  { id: 'Annuncio',  re: /pubblicazione\s+annuncio|avvio\s+ricerca/i },
  { id: 'Screening', re: /screening\s+cv/i },
  { id: 'Shortlist', re: /formazione\s+rosa|short\s*list|pianificazione\s+colloquio/i },
  { id: 'Colloquio', re: /colloquio|feedback\s+esito/i },
  { id: 'Contratto', re: /accettazione\s+contratto|firma\s+contratto/i },
  { id: 'Conclusa',  re: /^(conclusa|conclusione\s+iter|r&s_commessa\s+conclusa)$/i },
];

function _resTipo(c) {
  const t = c.titolo || '';
  for (const tp of RES_TIPI) if (tp.test(t)) return tp.id;
  return 'Altro';
}

function _resFase(c) {
  const sl = (c.statoLav || '').trim();
  for (const step of RES_FUNNEL) if (step.re.test(sl)) return step.id;
  return 'Indefinito';
}

function renderRecsel() {
  const el = document.getElementById('sec-recsel');
  if (!el) return;
  const f = filtered;

  const byTipo = { 'RICERCA': 0, 'SEGR_DID': 0, 'PROPOSTA': 0, 'TEST': 0, 'Altro': 0 };
  const byFase = {}; RES_FUNNEL.forEach(s => { byFase[s.id] = 0; });
  byFase['Indefinito'] = 0;
  const byStatus = {};
  f.forEach(c => {
    byTipo[_resTipo(c)]++;
    byFase[_resFase(c)]++;
    const s = c.status || 'N/D';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  const totale = f.length;
  const ric = byTipo['RICERCA'];
  const seg = byTipo['SEGR_DID'];
  const concl = byFase['Conclusa'];
  const pipe = byStatus['Da pianificare'] || 0;
  const inLav = byStatus['In Lavorazione'] || 0;
  const annul = byStatus['Annullato'] || 0;
  const classFunnel = totale - byFase['Indefinito'];

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Ricerca &amp; Selezione · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'APL_RES è la BU R&amp;S personale (volume modesto: ' + fmt(totale) + ' commesse). ' +
       'Tipologia ricavata dal titolo; il funnel R&amp;S è derivato da <code>statoLav</code> ' +
       'scritto in italiano semantico (Annuncio → Screening → Shortlist → Colloquio → Contratto → Conclusa).</p>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(245,158,11,.1);border-left:3px solid #f59e0b;border-radius:4px">' +
       '⚠ Funnel classificato solo su <b>' + fmt(classFunnel) + '</b> / ' + fmt(totale) + ' commesse: ' +
       'il campo statoLav è in larga parte "***" o vuoto. Compilare la fase in Qnet per arricchire la vista.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_resDrillT(\'RICERCA\')"><div class="kpi-label">🔍 R&amp;S pratiche</div><div class="kpi-value">' + fmt(ric) + '</div><div class="kpi-sub">commesse ricerca personale</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_resDrillT(\'SEGR_DID\')"><div class="kpi-label">📋 Segreteria Did.</div><div class="kpi-value">' + fmt(seg) + '</div><div class="kpi-sub">supporto amministrativo</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_resDrillS(\'Da pianificare\')"><div class="kpi-label">⏳ Da pianificare</div><div class="kpi-value">' + fmt(pipe) + '</div><div class="kpi-sub">pipeline futura</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_resDrillS(\'In Lavorazione\')"><div class="kpi-label">⚙️ In Lavorazione</div><div class="kpi-value">' + fmt(inLav) + '</div><div class="kpi-sub">attive ora</div></div>';
  h += '<div class="kpi" style="background:linear-gradient(135deg,#10b98120,#10b98140);cursor:pointer" onclick="_resDrillF(\'Conclusa\')"><div class="kpi-label">✅ R&amp;S Concluse</div><div class="kpi-value">' + fmt(concl) + '</div><div class="kpi-sub">iter completato</div></div>';
  h += '<div class="kpi red"><div class="kpi-label">❌ Annullate</div><div class="kpi-value">' + fmt(annul) + '</div><div class="kpi-sub">status Annullato</div></div>';
  h += '</div>';

  // Charts
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Tipologia</h4><div class="chart-wrap"><canvas id="chResTipo"></canvas></div></div>';
  h += '<div class="card"><h4>Funnel R&amp;S (' + fmt(classFunnel) + ' classificate)</h4><div class="chart-wrap"><canvas id="chResFunnel"></canvas></div></div>';
  h += '</div>';

  // Tabella dettaglio
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio commesse R&amp;S · clicca Qnet per aprire (max 80)</h4>';
  h += '<div class="tbl-scroll"><table id="tblResDett"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  const tipiPresenti = ['RICERCA', 'SEGR_DID', 'PROPOSTA', 'TEST', 'Altro'].filter(k => byTipo[k] > 0);
  makeDonut('chResTipo',
    tipiPresenti.map(k => k === 'Altro' ? 'Altro' : (RES_TIPI.find(t => t.id === k)?.label || k)),
    tipiPresenti.map(k => byTipo[k]),
    tipiPresenti.map(k => k === 'Altro' ? '#94a3b8' : (RES_TIPI.find(t => t.id === k)?.color || '#94a3b8')));

  makeBar('chResFunnel',
    RES_FUNNEL.map(s => s.id),
    RES_FUNNEL.map(s => byFase[s.id]),
    '#3b82f6',
    false);

  // Tabella
  const rows = f.slice(0, 80).map(c => [
    { display: (c.titolo || '—').substring(0, 50), val: c.titolo || '' },
    { display: _resTipo(c), val: _resTipo(c) },
    { display: _resFase(c), val: _resFase(c) },
    { display: (c.statoLav || '—').substring(0, 30), val: c.statoLav || '' },
    { display: c.status || '—', val: c.status || '' },
    { display: (c.cliente || '—').substring(0, 25), val: c.cliente || '' },
    { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
    { display: qnetBtn(c), val: c.id }
  ]);
  buildTbl('tblResDett',
    ['Titolo', 'Tipo', 'Fase', 'StatoLav', 'Status', 'Cliente', 'Ricavi', 'Qnet'],
    rows,
    ['str', 'str', 'str', 'str', 'str', 'str', 'num', 'str']);
}

function _resDrillT(tipo) {
  const list = filtered.filter(c => _resTipo(c) === tipo);
  const lbl = RES_TIPI.find(t => t.id === tipo)?.label || tipo;
  if (typeof drillDownItems === 'function') drillDownItems(lbl + ' (' + list.length + ')', list);
}
function _resDrillS(status) {
  const list = filtered.filter(c => c.status === status);
  if (typeof drillDownItems === 'function') drillDownItems(status + ' (' + list.length + ')', list);
}
function _resDrillF(fase) {
  const list = filtered.filter(c => _resFase(c) === fase);
  if (typeof drillDownItems === 'function') drillDownItems('Fase R&S · ' + fase + ' (' + list.length + ')', list);
}
