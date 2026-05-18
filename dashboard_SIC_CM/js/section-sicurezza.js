/* ── Sezione SIC-specifica: Sicurezza Lavoro ──
 * Caso 2 governance (fork interno BU): vive in dashboard_SIC_CM/js/.
 *
 * I titoli SIC sono semi-strutturati: "SIC_<TIPOLOGIA>[_N]" con varianti.
 * Esempi: "SIC_DVR", "SIC_AGG RLS", "SIC_1FORM RA", "SIC_AGG.PREPOSTO".
 * Le tipologie e l'eventuale flag "AGG" (aggiornamento periodico) sono
 * estratti CLIENT-SIDE tokenizzando il titolo su [_+\s.,] — più robusto
 * di un regex \b\bSIGLA\b perché in JS "_" è word-character.
 *
 * 13 tipologie riconosciute, raggruppate in 6 macro-aree:
 *   - Documentazione      DVR, POS, RSPP
 *   - Formazione          ART37, FORM, PREP, RLS
 *   - Emergenze           APS, ADE
 *   - Visite Mediche      VISITE
 *   - Specialistico       HACCP, PLE, PIMUS, MULETTO
 *   - Pacchetto           TUTTA, 81/08
 */

const SIC_TIPI = [
  { id: 'DVR',     re: /^DVR$/i,                          area: 'Documentazione' },
  { id: 'POS',     re: /^POS$/i,                          area: 'Documentazione' },
  { id: 'RSPP',    re: /^RSPP$/i,                         area: 'Documentazione' },
  { id: 'ART37',   re: /^ART37$/i,                        area: 'Formazione' },
  { id: 'FORM',    re: /^FORM$/i,                         area: 'Formazione' },
  { id: 'PREP',    re: /^(PREP|PREPOSTO)$/i,              area: 'Formazione' },
  { id: 'RLS',     re: /^RLS$/i,                          area: 'Formazione' },
  { id: 'APS',     re: /^APS$/i,                          area: 'Emergenze' },
  { id: 'ADE',     re: /^ADE$/i,                          area: 'Emergenze' },
  { id: 'VISITE',  re: /^(VISITE|VISITA|MEDICHE)$/i,      area: 'Visite Mediche' },
  { id: 'HACCP',   re: /^HACCP$/i,                        area: 'Specialistico' },
  { id: 'PLE',     re: /^PLE$/i,                          area: 'Specialistico' },
  { id: 'PIMUS',   re: /^PIMUS$/i,                        area: 'Specialistico' },
  { id: 'MULETTO', re: /^MULETTO$/i,                      area: 'Specialistico' },
  { id: 'PES',     re: /^(PES|PAV|PEI)$/i,                area: 'Specialistico' },
  { id: 'GRU',     re: /^GRU$/i,                          area: 'Specialistico' },
  { id: 'DPI',     re: /^DPI$/i,                          area: 'Specialistico' },
  { id: 'SALDATORI', re: /^SALDATOR[IE]$/i,               area: 'Specialistico' },
  { id: 'ALIMENT', re: /^ALIMENTARIST[AI]$/i,             area: 'Specialistico' },
  { id: 'TUTTA',   re: /^TUTTA$/i,                        area: 'Pacchetto' },
  { id: '81/08',   re: /^81\/08$/i,                       area: 'Pacchetto' },
];

const SIC_AREA_COLOR = {
  'Documentazione':  '#3b82f6',
  'Formazione':      '#10b981',
  'Emergenze':       '#dc2626',
  'Visite Mediche':  '#f59e0b',
  'Specialistico':   '#8b5cf6',
  'Pacchetto':       '#06b6d4',
  'Altro':           '#64748b',
};

function _sicTokens(titolo) {
  /* Tokenizza il titolo SIC su separatori, rimuove vuoti, normalizza in upper.
     Strip prefisso numerico SOLO se segue una lettera (lookahead) per non
     rovinare codici tipo "81/08". Estrae il flag "AGG" (aggiornamento periodico)
     e collassa coppie consecutive "ART"+"37" → "ART37". */
  const raw = (titolo || '').split(/[_+\s.,]+/).filter(Boolean);
  let hasAgg = false;
  const tokens = [];
  raw.forEach(t => {
    const up = t.toUpperCase();
    const noNum = up.replace(/^\d+(?=[A-Z])/, '');
    if (/^AGG/i.test(noNum) && noNum !== 'AGGIORNAMENTO') {
      hasAgg = true;
      const after = noNum.replace(/^AGG[.\s]*/, '');
      if (after) tokens.push(after);
      return;
    }
    if (noNum === 'AGGIORNAMENTO') { hasAgg = true; return; }
    if (up === 'SIC') return;
    tokens.push(noNum);
  });
  // Normalizzazione coppia: "ART" + "37" → "ART37" (titoli scritti "SIC ART 37")
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] === 'ART' && tokens[i + 1] === '37') { out.push('ART37'); i++; }
    else out.push(tokens[i]);
  }
  return { tokens: out, hasAgg };
}

function _sicClassify(titolo) {
  /* Ritorna { tipi:[<id>], aree:[<area>], hasAgg }.
     Una commessa può avere più tipi (es. "DVR + RSPP"). */
  const tipi = new Set();
  const aree = new Set();
  // Pattern testuali su titolo completo (intercettano i titoli scritti per esteso)
  if (/formazione\s+generale\s+e\s+specifica/i.test(titolo || '')) {
    tipi.add('ART37'); aree.add('Formazione');
  }
  if (/preposti?\s+in\s+azienda/i.test(titolo || '')) {
    tipi.add('PREP'); aree.add('Formazione');
  }
  const { tokens, hasAgg } = _sicTokens(titolo);
  tokens.forEach(tk => {
    for (const t of SIC_TIPI) {
      if (t.re.test(tk)) { tipi.add(t.id); aree.add(t.area); break; }
    }
  });
  if (!tipi.size) aree.add('Altro');
  return { tipi: [...tipi], aree: [...aree], hasAgg };
}

function _sicAnno(c) {
  /* Anno dataInizio (formato dd-mm-yyyy o yyyy-mm-dd). Restituisce N/D se nullo. */
  const s = c.dataInizio || c.dataPianInizio || '';
  let m = String(s).match(/^(\d{4})-/);
  if (m) return m[1];
  m = String(s).match(/-(\d{4})$/);
  if (m) return m[1];
  return 'N/D';
}

function renderSicurezza() {
  const el = document.getElementById('sec-sicurezza');
  if (!el) return;
  const f = filtered;

  // Aggrega tipi + aree + AGG counts
  const byTipo = {}; const byArea = {}; const byAnno = {};
  let conAgg = 0; let conTipo = 0; let multiTipo = 0;
  f.forEach(c => {
    const cl = _sicClassify(c.titolo);
    if (cl.hasAgg) conAgg++;
    if (cl.tipi.length) conTipo++;
    if (cl.tipi.length > 1) multiTipo++;
    cl.tipi.forEach(t => {
      if (!byTipo[t]) byTipo[t] = { cnt: 0, ric: 0, agg: 0 };
      byTipo[t].cnt++;
      byTipo[t].ric += (c.consulenza || 0);
      if (cl.hasAgg) byTipo[t].agg++;
    });
    cl.aree.forEach(a => {
      if (!byArea[a]) byArea[a] = { cnt: 0, ric: 0 };
      byArea[a].cnt++;
      byArea[a].ric += (c.consulenza || 0);
    });
    const anno = _sicAnno(c);
    if (!byAnno[anno]) byAnno[anno] = { nuove: 0, agg: 0 };
    if (cl.hasAgg) byAnno[anno].agg++; else byAnno[anno].nuove++;
  });

  const totale = f.length;
  const doc = (byArea['Documentazione'] || {}).cnt || 0;
  const form = (byArea['Formazione'] || {}).cnt || 0;
  const emerg = (byArea['Emergenze'] || {}).cnt || 0;
  const visite = (byArea['Visite Mediche'] || {}).cnt || 0;
  const tutta = (byTipo['TUTTA'] || {}).cnt || 0;

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Sicurezza Lavoro · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Tipologia ricavata dal <i>Titolo</i> commessa (parser client-side). ' +
       '21 sigle riconosciute (DVR, RSPP, RLS, ART37, POS, PREP, APS, ADE, FORM, VISITE, HACCP, PLE, PIMUS, MULETTO, PES, GRU, DPI, SALDATORI, ALIMENT, TUTTA, 81/08), ' +
       'aggregate in 6 macro-aree. Una commessa può rientrare in più tipologie (es. "DVR + RSPP" conta in Documentazione + Documentazione e quindi solo 1 volta nella sua area).</p>';

  // Box "Come escono i numeri"
  h += '<details style="margin-bottom:14px;background:rgba(99,102,241,.05);border-left:3px solid #6366f1;border-radius:4px;padding:10px 14px">' +
       '<summary style="cursor:pointer;font-size:11px;color:var(--text2);font-weight:600">💡 Come escono i numeri (clicca per espandere)</summary>' +
       '<div style="color:var(--text2);font-size:11px;line-height:1.6;margin-top:10px">' +
       '<b>Step 1 · Parsing del titolo</b>: per ogni commessa il <code>titolo</code> viene tokenizzato su separatori ' +
       '(<code>_</code>, <code>+</code>, spazio, <code>.</code>, <code>,</code>). Es. "SIC_AGG.RLS" → tokens ["AGG", "RLS"].' +
       '<br><b>Step 2 · Strip prefisso numerico</b>: "1ADE" → "ADE", "2AGG" → "AGG". Il numero è solo edizione.' +
       '<br><b>Step 3 · Flag AGG</b>: se uno qualsiasi dei token contiene "AGG" la commessa è marcata come <i>Aggiornamento periodico</i>.' +
       '<br><b>Step 4 · Match sigle</b>: ogni token viene confrontato con le 21 sigle. I matching definiscono <b>tipologie</b> e <b>macro-aree</b> della commessa.' +
       '<br><b>Step 5 · Aggregazione</b>:' +
       '<ul style="margin:4px 0 4px 18px">' +
       '<li><b>KPI macro-area</b> = numero di commesse che hanno almeno UNA tipologia in quell\'area (no doppio conteggio se più tipologie nella stessa area).</li>' +
       '<li><b>Top Tipologie</b> = count di commesse per ogni singola sigla (es. quante commesse contengono RLS).</li>' +
       '<li><b>Aggiornamenti</b> = count commesse con flag AGG / totale = % rinnovi periodici.</li>' +
       '<li><b>Pacchetto Completo</b> = count commesse con sigla TUTTA (clienti che fanno "tutta la sicurezza" in un solo contratto).</li>' +
       '</ul>' +
       '<b>Mapping sigle → macro-area</b>:' +
       '<ul style="margin:4px 0 0 18px">' +
       '<li><span style="color:#3b82f6">📄 Documentazione</span>: DVR, POS, RSPP</li>' +
       '<li><span style="color:#10b981">🎓 Formazione</span>: ART37, FORM, PREP, RLS</li>' +
       '<li><span style="color:#dc2626">🆘 Emergenze</span>: APS (Addetto Primo Soccorso), ADE (Addetto Emergenze antincendio)</li>' +
       '<li><span style="color:#f59e0b">🩺 Visite Mediche</span>: VISITE, VISITA, MEDICHE</li>' +
       '<li><span style="color:#8b5cf6">🔧 Specialistico</span>: HACCP, PLE, PIMUS, MULETTO, PES, GRU, DPI, SALDATORI, ALIMENT</li>' +
       '<li><span style="color:#06b6d4">📦 Pacchetto</span>: TUTTA, 81/08</li>' +
       '</ul>' +
       'Clicca su qualsiasi <b>KPI</b>, <b>fetta del donut</b>, <b>barra</b> o <b>riga di tabella</b> per vedere l\'elenco delle commesse.' +
       '</div></details>';

  const pctClass = totale ? (conTipo / totale * 100) : 0;
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,.1);border-left:3px solid #10b981;border-radius:4px">' +
       'Classificate: <b>' + fmt(conTipo) + '</b> / ' + fmt(totale) + ' (' + pctClass.toFixed(1) + '%). ' +
       'Multi-tipologia: ' + fmt(multiTipo) + '. Le commesse non riconosciute finiscono in "Altro".</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_sicDrillArea(\'Documentazione\')"><div class="kpi-label">📄 Documentazione</div><div class="kpi-value">' + fmt(doc) + '</div><div class="kpi-sub">DVR · POS · RSPP</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_sicDrillArea(\'Formazione\')"><div class="kpi-label">🎓 Formazione</div><div class="kpi-value">' + fmt(form) + '</div><div class="kpi-sub">ART37 · FORM · PREP · RLS</div></div>';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_sicDrillArea(\'Emergenze\')"><div class="kpi-label">🆘 Emergenze</div><div class="kpi-value">' + fmt(emerg) + '</div><div class="kpi-sub">APS · ADE</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_sicDrillArea(\'Visite Mediche\')"><div class="kpi-label">🩺 Visite Mediche</div><div class="kpi-value">' + fmt(visite) + '</div><div class="kpi-sub">sorveglianza sanitaria</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_sicDrillTipo(\'TUTTA\')"><div class="kpi-label">📦 Pacchetto completo</div><div class="kpi-value">' + fmt(tutta) + '</div><div class="kpi-sub">"TUTTA" la sicurezza</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_sicDrillAgg()"><div class="kpi-label">🔄 Aggiornamenti</div><div class="kpi-value">' + fmt(conAgg) + '</div><div class="kpi-sub">' + (totale ? (conAgg/totale*100).toFixed(0) : 0) + '% rinnovi periodici</div></div>';
  h += '</div>';

  // Charts row 1
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Macro-area</h4><div class="chart-wrap"><canvas id="chSicArea"></canvas></div></div>';
  h += '<div class="card"><h4>Top Tipologie (count)</h4><div class="chart-wrap"><canvas id="chSicTipo"></canvas></div></div>';
  h += '</div>';

  // Charts row 2
  h += '<div class="row2" style="margin-top:14px">';
  h += '<div class="card"><h4>Anno di inizio: Nuove vs Aggiornamenti</h4><div class="chart-wrap"><canvas id="chSicAnno"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Macro-area</h4><div class="chart-wrap"><canvas id="chSicRic"></canvas></div></div>';
  h += '</div>';

  // Tabella tipologie
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per Tipologia</h4>';
  h += '<div class="tbl-scroll"><table id="tblSicTipi"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  // Macro-aree (donut) — clicca fetta per drill
  const areaOrder = ['Documentazione', 'Formazione', 'Emergenze', 'Visite Mediche', 'Specialistico', 'Pacchetto', 'Altro'];
  const areaLabels = areaOrder.filter(a => byArea[a]);
  makeDonut('chSicArea',
    areaLabels,
    areaLabels.map(a => byArea[a].cnt),
    areaLabels.map(a => SIC_AREA_COLOR[a] || '#64748b'));
  _sicAttachChartClick('chSicArea', i => _sicDrillArea(areaLabels[i]));

  // Tipologie (bar, top 12) — clicca barra per drill tipologia
  const tipoEntries = Object.entries(byTipo).sort((a, b) => b[1].cnt - a[1].cnt).slice(0, 12);
  makeBar('chSicTipo',
    tipoEntries.map(e => e[0]),
    tipoEntries.map(e => e[1].cnt),
    '#10b981',
    false);
  _sicAttachChartClick('chSicTipo', i => _sicDrillTipo(tipoEntries[i][0]));

  // Trend anno: nuove vs AGG (stacked) — clicca barra per drill anno + tipo
  const anniOrder = Object.keys(byAnno).filter(k => k !== 'N/D').sort();
  const ctxAnno = document.getElementById('chSicAnno');
  if (ctxAnno && anniOrder.length) {
    if (window._chSicAnno) window._chSicAnno.destroy();
    window._chSicAnno = new Chart(ctxAnno.getContext('2d'), {
      type: 'bar',
      data: {
        labels: anniOrder,
        datasets: [
          { label: 'Nuove',         data: anniOrder.map(k => byAnno[k].nuove), backgroundColor: '#10b981' },
          { label: 'Aggiornamenti', data: anniOrder.map(k => byAnno[k].agg),   backgroundColor: '#f59e0b' },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        onClick: (ev, elements) => {
          if (!elements.length) return;
          const anno = anniOrder[elements[0].index];
          const isAgg = elements[0].datasetIndex === 1;
          _sicDrillAnno(anno, isAgg);
        },
        scales: { x: { stacked: true, ticks: { color: 'var(--text3)' } }, y: { stacked: true, ticks: { color: 'var(--text3)' } } },
        plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)' } } }
      }
    });
  }

  // Ricavi per area (bar) — clicca barra per drill area
  makeBar('chSicRic',
    areaLabels,
    areaLabels.map(a => byArea[a].ric),
    '#3b82f6',
    true);
  _sicAttachChartClick('chSicRic', i => _sicDrillArea(areaLabels[i]));

  // Tabella tipologie · rendering manuale per onclick per riga (drill tipologia)
  const tblEl = document.getElementById('tblSicTipi');
  if (tblEl) {
    const tipiSorted = Object.entries(byTipo).sort((a, b) => b[1].cnt - a[1].cnt);
    let th = '<thead><tr>' +
      '<th>Tipologia</th><th>Macro-area</th>' +
      '<th style="text-align:right">Commesse</th>' +
      '<th style="text-align:right">Ricavi</th>' +
      '<th style="text-align:right">Aggiornamenti</th>' +
      '<th style="text-align:right">% AGG sulla tipologia</th>' +
      '</tr></thead><tbody>';
    tipiSorted.forEach(([tipo, v]) => {
      const meta = SIC_TIPI.find(t => t.id === tipo);
      const pctAgg = v.cnt ? (v.agg / v.cnt * 100) : 0;
      const safeTipo = tipo.replace(/'/g, "\\'");
      th += '<tr class="clickable" onclick="_sicDrillTipo(\'' + safeTipo + '\')" title="Clicca per vedere le commesse della tipologia ' + tipo + '">' +
        '<td><b>' + tipo + '</b></td>' +
        '<td><span style="color:' + (SIC_AREA_COLOR[meta?.area] || '#64748b') + '">' + (meta ? meta.area : 'Altro') + '</span></td>' +
        '<td style="text-align:right">' + fmt(v.cnt) + '</td>' +
        '<td style="text-align:right">' + fmtE(v.ric) + '</td>' +
        '<td style="text-align:right">' + fmt(v.agg) + '</td>' +
        '<td style="text-align:right">' + pctAgg.toFixed(1) + '%</td>' +
        '</tr>';
    });
    th += '</tbody>';
    tblEl.innerHTML = th;
  }

  _sicRenderPivot();
  _sicRenderAudit();
}

/* Aggancia onClick a un chart già creato da makeDonut/makeBar.
   cb riceve l'indice della fetta/barra cliccata. */
function _sicAttachChartClick(chartId, cb) {
  const c = (typeof _charts !== 'undefined') ? _charts[chartId] : null;
  if (!c) return;
  c.options.onClick = (ev, elements) => {
    if (!elements.length) return;
    cb(elements[0].index);
  };
  c.canvas.style.cursor = 'pointer';
  c.update();
}

/* Pivot Status & Sicurezza · usa helper kit buildPivotCard (pivot-tree.js) */
function _sicRenderPivot() {
  if (typeof buildPivotCard !== 'function') return;
  buildPivotCard({
    containerId: 'sec-sicurezza',
    cardId: 'sicPivotCard',
    stateNamespace: 'sic',
    title: '🌳 Pivot Status &amp; Sicurezza · esplora gerarchico',
    description: 'Scegli l\'ordine delle dimensioni nei 4 livelli. Clicca ▶ per espandere, riga per drill commesse. Macro-area e Tipologia sono multi-valore (una commessa "DVR+RSPP" appare in entrambe).',
    dims: {
      status:    { label: 'Status',           extract: c => c.status || 'N/D' },
      statoLav:  { label: 'Stato Lavorazione', extract: c => (c.statoLav || '').trim() || 'N/D' },
      macroarea: { label: 'Macro-area',        extract: c => _sicClassify(c.titolo).aree },
      tipologia: { label: 'Tipologia',         extract: c => { const t = _sicClassify(c.titolo).tipi; return t.length ? t : ['Altro']; } },
      anno:      { label: 'Anno avvio',        extract: c => _sicAnno(c) },
      cliente:   { label: 'Cliente',           extract: c => (c.cliente || 'N/D').substring(0, 40) },
      agg:       { label: 'Aggiornamento',     extract: c => _sicClassify(c.titolo).hasAgg ? 'Sì (AGG)' : 'No (Nuova)' },
    },
    presets: [
      { label: '🚦 Status → StatoLav',                dims: ['status', 'statoLav', '', ''] },
      { label: '🚦 Status → Macroarea → Tipologia',   dims: ['status', 'macroarea', 'tipologia', ''] },
      { label: '📋 StatoLav → Macroarea',             dims: ['statoLav', 'macroarea', 'tipologia', ''] },
      { label: '📂 Macroarea → Tipologia → Status',   dims: ['macroarea', 'tipologia', 'status', ''] },
      { label: '🔄 Aggiornamento → Macroarea',        dims: ['agg', 'macroarea', 'tipologia', 'status'] },
      { label: '📅 Anno → Status → Macroarea',        dims: ['anno', 'status', 'macroarea', ''] },
    ],
    defaultDims: ['status', 'statoLav', 'macroarea', 'tipologia'],
    items: filtered,
  });
}

function _sicPivotCollapseAll() {
  _sicPivotOpen.clear();
  _sicRenderPivot();
}

/* Audit copertura parser — vedi shared/dashboard-core/js/parser-audit.js */
function _sicRenderAudit() {
  if (typeof buildParserAuditCard !== 'function') return;
  buildParserAuditCard({
    containerId: 'sec-sicurezza',
    classify: c => _sicClassify(c.titolo),
    filtered: filtered,
    buLabel: 'SIC',
    knownSigle: SIC_TIPI.map(t => t.id),
    paramName: 'Tipologia Sicurezza',
    hint: 'Aggiungi la sigla in SIC_TIPI dentro dashboard_SIC_CM/js/section-sicurezza.js con la sua macro-area (Documentazione, Formazione, Emergenze, Visite Mediche, Specialistico, Pacchetto).',
  });
}

function _sicDrillArea(area) {
  const list = filtered.filter(c => _sicClassify(c.titolo).aree.includes(area));
  if (typeof drillDownItems === 'function') drillDownItems(area + ' · SIC (' + list.length + ')', list);
}

function _sicDrillTipo(tipo) {
  const list = filtered.filter(c => _sicClassify(c.titolo).tipi.includes(tipo));
  if (typeof drillDownItems === 'function') drillDownItems('Tipologia ' + tipo + ' (' + list.length + ')', list);
}

function _sicDrillAgg() {
  const list = filtered.filter(c => _sicClassify(c.titolo).hasAgg);
  if (typeof drillDownItems === 'function') drillDownItems('Aggiornamenti periodici (' + list.length + ')', list);
}

function _sicDrillAnno(anno, isAgg) {
  const list = filtered.filter(c => {
    if (_sicAnno(c) !== anno) return false;
    const has = _sicClassify(c.titolo).hasAgg;
    return isAgg ? has : !has;
  });
  const lbl = (isAgg ? 'Aggiornamenti' : 'Nuove') + ' · anno ' + anno;
  if (typeof drillDownItems === 'function') drillDownItems(lbl + ' (' + list.length + ')', list);
}
