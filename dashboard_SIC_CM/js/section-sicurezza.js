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
       '13 sigle riconosciute (DVR, RSPP, RLS, ART37, POS, PREP, APS, ADE, FORM, VISITE, HACCP, PLE, PIMUS, TUTTA, 81/08), ' +
       'aggregate in 6 macro-aree. Una commessa può rientrare in più tipologie (es. "DVR + RSPP").</p>';
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
  // Macro-aree (donut)
  const areaOrder = ['Documentazione', 'Formazione', 'Emergenze', 'Visite Mediche', 'Specialistico', 'Pacchetto', 'Altro'];
  const areaLabels = areaOrder.filter(a => byArea[a]);
  makeDonut('chSicArea',
    areaLabels,
    areaLabels.map(a => byArea[a].cnt),
    areaLabels.map(a => SIC_AREA_COLOR[a] || '#64748b'));

  // Tipologie (bar, top 12)
  const tipoEntries = Object.entries(byTipo).sort((a, b) => b[1].cnt - a[1].cnt).slice(0, 12);
  makeBar('chSicTipo',
    tipoEntries.map(e => e[0]),
    tipoEntries.map(e => e[1].cnt),
    '#10b981',
    false);

  // Trend anno: nuove vs AGG (stacked-ish: 2 serie sul bar generico). Faccio un solo bar con totali
  // e annoto il tasso AGG nella tabella sotto. Per semplicità, mostro qui solo Nuove (linea base
  // del business: pipeline organica) vs aggiornamenti come segnale di ricorrenza.
  const anniOrder = Object.keys(byAnno).filter(k => k !== 'N/D').sort();
  const ctxAnno = document.getElementById('chSicAnno');
  if (ctxAnno && anniOrder.length) {
    // Uso Chart.js direttamente per stacked
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
        scales: { x: { stacked: true, ticks: { color: 'var(--text3)' } }, y: { stacked: true, ticks: { color: 'var(--text3)' } } },
        plugins: { legend: { position: 'bottom', labels: { color: 'var(--text2)' } } }
      }
    });
  }

  // Ricavi per area (bar)
  makeBar('chSicRic',
    areaLabels,
    areaLabels.map(a => byArea[a].ric),
    '#3b82f6',
    true);

  // Tabella tipologie
  buildTbl('tblSicTipi',
    ['Tipologia', 'Macro-area', 'Commesse', 'Ricavi', 'Aggiornamenti', '% AGG sulla tipologia'],
    Object.entries(byTipo).sort((a, b) => b[1].cnt - a[1].cnt).map(([tipo, v]) => {
      const meta = SIC_TIPI.find(t => t.id === tipo);
      const pctAgg = v.cnt ? (v.agg / v.cnt * 100) : 0;
      return [
        { display: tipo, val: tipo },
        { display: meta ? meta.area : 'Altro', val: meta ? meta.area : 'zz' },
        { display: fmt(v.cnt), val: v.cnt },
        { display: fmtE(v.ric), val: v.ric },
        { display: fmt(v.agg), val: v.agg },
        { display: pctAgg.toFixed(1) + '%', val: pctAgg }
      ];
    }),
    ['str', 'str', 'num', 'num', 'num', 'num']);
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
