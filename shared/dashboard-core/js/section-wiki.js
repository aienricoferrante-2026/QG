/* ── Sezione Wiki / Manuale rapido (core kit) ──
   Infografica del flusso d'uso della dashboard + Q&A "dove trovo X?" +
   glossario dei campi/metriche. Tutto in HTML/CSS, niente immagini esterne. */

/* Step del flusso. Ogni step ha un nome di sezione cliccabile (showSec). */
const WIKI_FLOW = [
  { n: 1, icon: '🔍', sec: 'explore',        title: 'ESPLORA',
    desc: 'Punto di partenza. Scegli 1-3 dimensioni (Società › Regione › Cliente …) e una metrica primaria (Ricavi, MOL, % Inc., WIP, Output …). Vedi top N nel chart, tabella ad albero espandibile, drill-down sulle commesse.' },
  { n: 2, icon: '📊', sec: 'executive',      title: 'EXECUTIVE SUMMARY',
    desc: '5 KPI macro + 4 chart d\'insieme (trend mensile, regioni, status, stato lavorazione). I KPI sono cliccabili: aprono il drill-down sulle commesse corrispondenti.' },
  { n: 3, icon: '💰', sec: 'econFin',        title: 'ECON. & FINANZIARIO',
    desc: '3 box affiancati Consuntivo / Documentale / Cassa con scostamenti chiave. Vede dove la realtà diverge dal budget Qnet. Tabella unificata per Società.' },
  { n: 4, icon: '💵', sec: 'analisiIncassi', title: 'ANALISI INCASSI',
    desc: 'Distribuzione % incasso, commesse al 100% / 0% / con residuo (KPI cliccabili), top clienti per credito aperto.' },
  { n: 5, icon: '⚠️', sec: 'alert',          title: 'ALERT & ANOMALIE',
    desc: 'MOL negativo, stalled (avz < 50% e data fine passata), senza incasso, clienti a rischio (esp > 50K e %inc < 30%).' }
];

/* Q&A: domande tipiche → percorso suggerito. */
const WIKI_QA = [
  { q: 'Voglio vedere solo le commesse in lavorazione',
    a: 'In testa alla pagina, sezione "Vista rapida": chip <strong>⚙️ Solo in lavorazione</strong>. È sticky (resta attivo cambiando sezione).',
    sec: null },
  { q: 'Voglio vedere solo le commesse di quest\'anno (o ultimi 30 giorni / mese scorso / ultimo trimestre)',
    a: 'Quick filter <strong>📅 ' + new Date().getFullYear() + '</strong>, <strong>🗓️ Questo mese</strong>, <strong>⬅️ Mese scorso</strong>, <strong>📈 Ultimo trimestre</strong>. Sono <em>combinabili</em>: puoi mixare es. "In Lavorazione + Ultimo trimestre".',
    sec: null },
  { q: 'Quali commesse compongono il numero N che vedo in un KPI?',
    a: 'Clicca direttamente sul KPI. Esempio: in Analisi Incassi, "Commesse al 100% › 11" apre il modale con quelle 11 commesse.',
    sec: null },
  { q: 'Quali clienti hanno il margine peggiore?',
    a: 'Esplora · L1 = Cliente · Metrica = Margine %. Ordina la tabella per Margine ASC (clicca due volte sull\'intestazione).',
    sec: 'explore' },
  { q: 'Quante commesse ha il commerciale X / il tecnico Y?',
    a: 'Esplora · preset 💼 Commerciale Output € o 🛠️ Tecnico WIP. In alternativa imposta L1 = Commerciale / Tecnico.',
    sec: 'explore' },
  { q: 'Voglio scaricare un Excel/CSV',
    a: 'In Esplora ci sono <strong>CSV aggregato</strong> (vista corrente del tree) e <strong>CSV commesse</strong> (flat, una riga per commessa). Nel modale drill-down trovi un altro CSV col sottoinsieme.',
    sec: 'explore' },
  { q: 'Vedo "N/D" — cosa significa?',
    a: 'Record senza valore valorizzato per quella dimensione. Es. N/D in Tecnico = commessa senza responsabile assegnato. Sono <strong>sempre inclusi</strong> nel totale, mai esclusi.',
    sec: null },
  { q: 'Voglio confrontare due periodi',
    a: 'Esplora · Confronto: scegli "vs Periodo prec.", "vs Anno prec." o "A vs B (custom)". Appaiono 4 colonne extra in tabella + barre affiancate nel chart.',
    sec: 'explore' },
  { q: 'Voglio nascondere filtri / KPI per avere più spazio',
    a: 'Nell\'header in alto a destra: bottoni <strong>▼ Filtri</strong> e <strong>▼ Numeri</strong> (scorciatoie F e K). Stato salvato per BU.',
    sec: null }
];

/* Glossario campi e metriche. */
const WIKI_GLOSSARY = [
  { t: 'Tecnico (responsabile)', d: 'Persona che esegue la commessa. JSON: <code>c.responsabile</code>.' },
  { t: 'Commerciale (agente)',   d: 'Persona che ha portato la commessa. JSON: <code>c.agente</code>.' },
  { t: 'Segnalatore',            d: 'Rete commerciale esterna che ha segnalato il cliente. JSON: <code>c.segnalatore</code>.' },
  { t: 'Status',                 d: 'Stato amministrativo macro: In Lavorazione · Chiusa · Da pianificare · Annullato. JSON: <code>c.status</code>.' },
  { t: 'Stato Lavorazione',      d: 'Workflow interno granulare (es. "Richiesta documenti", "SOA_3.1_Conclusa Istruttoria"). JSON: <code>c.statoLav</code>.' },
  { t: 'Ricavi (Consulenza)',    d: 'Importo Consulenza dal contratto. JSON: <code>c.consulenza</code>.' },
  { t: 'MOL',                    d: 'Margine Operativo Lordo = Ricavi − Costi. JSON: <code>c.mol</code>.' },
  { t: 'Margine %',              d: 'MOL ÷ Ricavi × 100. Salute economica della commessa/aggregato.' },
  { t: '% Incasso',              d: 'Già Incassato ÷ Ricavi × 100. Quanto è entrato in cassa.' },
  { t: 'Da Incassare / Esposizione', d: 'Math.max(0, Ricavi − Già Incassato). Credito ancora aperto. Mai dal campo Excel.' },
  { t: 'WIP (Work In Progress)', d: 'Commesse aperte (Status ≠ Chiusa/Annullato). WIP € = somma dei loro Ricavi.' },
  { t: 'Output',                 d: 'Commesse chiuse nel periodo. Output € = somma dei loro Ricavi.' },
  { t: 'Backlog >60gg',          d: 'Commesse aperte con età > 60 giorni dalla data di assegnazione.' },
  { t: 'Cons / Documentale / Cassa', d: '3 viste del Budget Commessa Qnet: <strong>Cons</strong> = stima budget (ec*Cons), <strong>Documentale</strong> = fatturato registrato (*Docum), <strong>Cassa</strong> = incassi/uscite reali (fin*Tot).' }
];

function _wikiFlowHtml() {
  let h = '<div class="wiki-flow">';
  WIKI_FLOW.forEach((s, i) => {
    h += '<div class="wiki-step" onclick="showSec(\'' + s.sec + '\')" title="Vai alla sezione ' + s.title + '">';
    h += '<div class="wiki-step-n">' + s.n + '</div>';
    h += '<div class="wiki-step-icon">' + s.icon + '</div>';
    h += '<div class="wiki-step-body">';
    h += '<h4>' + s.title + '</h4>';
    h += '<p>' + s.desc + '</p>';
    h += '<span class="wiki-step-cta">Apri →</span>';
    h += '</div></div>';
    if (i < WIKI_FLOW.length - 1) h += '<div class="wiki-arrow">↓</div>';
  });
  h += '</div>';
  return h;
}

function _wikiQaHtml() {
  let h = '<div class="wiki-qa">';
  WIKI_QA.forEach(qa => {
    const cta = qa.sec ? '<span class="wiki-qa-cta" onclick="showSec(\'' + qa.sec + '\')">→ apri ' + qa.sec + '</span>' : '';
    h += '<div class="wiki-qa-item">';
    h += '<div class="wiki-qa-q">❓ ' + qa.q + '</div>';
    h += '<div class="wiki-qa-a">' + qa.a + ' ' + cta + '</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}

function _wikiGlossaryHtml() {
  let h = '<div class="wiki-gloss">';
  WIKI_GLOSSARY.forEach(g => {
    h += '<div class="wiki-gloss-item"><strong>' + g.t + '</strong><span>' + g.d + '</span></div>';
  });
  h += '</div>';
  return h;
}

/* ── Calcoli effettuati ──
   Per ogni KPI/metrica della dashboard, mostra formula + sorgente JSON +
   valore calcolato SUL DATASET FILTRATO CORRENTE. I valori si aggiornano
   ad ogni render della Wiki (cioè al cambio filtro chiama renderWiki). */
function _wikiCalcRows(items) {
  const len = items.length;
  const cnt = (pred) => items.filter(pred).length;
  const sum = (key) => items.reduce((s, c) => s + (c[key] || 0), 0);
  const consTot = sum('consulenza');
  const molTot  = sum('mol');
  const incTot  = sum('giaIncassato');
  const oreTot  = sum('ore');
  const margPct = consTot ? (molTot / consTot * 100) : 0;
  const incPct  = consTot ? (incTot / consTot * 100) : 0;
  const isOpenLocal = (typeof isOpen === 'function')
    ? isOpen : (c => c.status !== 'Annullato' && c.status !== 'Chiusa');
  const isClosedLocal = (typeof isClosed === 'function')
    ? isClosed : (c => c.status === 'Chiusa' || c.statoCorso === 'Concluso');
  return [
    { label: 'Commesse Totali',         formula: 'items.length',                                       src: '(dataset filtrato)',        val: len },
    { label: 'Commesse In Lavorazione', formula: "count(c.status === 'In Lavorazione')",               src: 'c.status',                  val: cnt(c => /lavorazione/i.test(c.status || '')) },
    { label: 'Commesse Aperte (WIP n)', formula: '!isClosed && !isCancelled',                          src: 'c.status, c.statoCorso',    val: cnt(isOpenLocal) },
    { label: 'Commesse Chiuse (Out n)', formula: 'isClosed',                                           src: "c.status === 'Chiusa' OR c.statoCorso === 'Concluso'", val: cnt(isClosedLocal) },
    { label: 'Annullate',               formula: "c.status === 'Annullato' || 'Annullata'",           src: 'c.status',                  val: cnt(c => c.status === 'Annullato' || c.status === 'Annullata') },
    { label: 'Da pianificare',          formula: "c.status === 'Da pianificare'",                     src: 'c.status',                  val: cnt(c => c.status === 'Da pianificare') },
    { label: 'Ricavi Totali (€)',       formula: 'Σ c.consulenza',                                    src: 'c.consulenza',              val: consTot, eur: true },
    { label: 'Costi Totali (€)',        formula: 'Σ c.costi',                                         src: 'c.costi',                   val: sum('costi'), eur: true },
    { label: 'MOL Totale (€)',          formula: 'Σ c.mol = Σ(consulenza − costi)',                   src: 'c.mol',                     val: molTot, eur: true },
    { label: 'Margine %',               formula: 'MOL ÷ Ricavi × 100',                                src: 'c.mol / c.consulenza',      val: margPct, pct: true },
    { label: 'Già Incassato (€)',       formula: 'Σ c.giaIncassato',                                  src: 'c.giaIncassato',            val: incTot, eur: true },
    { label: '% Incasso',               formula: 'GiàIncassato ÷ Ricavi × 100',                       src: 'c.giaIncassato / c.consulenza', val: incPct, pct: true },
    { label: 'Esposizione / Da Inc. (€)', formula: 'Σ max(0, c.consulenza − c.giaIncassato)',         src: 'c.consulenza, c.giaIncassato', val: items.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0), eur: true },
    { label: 'MOL Negativo (n)',        formula: 'count(c.mol < 0 && c.consulenza > 0)',              src: 'c.mol, c.consulenza',       val: cnt(c => (c.mol || 0) < 0 && (c.consulenza || 0) > 0) },
    { label: 'Senza incasso (n)',       formula: 'count(c.giaIncassato === 0 && c.consulenza > 0)',   src: 'c.giaIncassato, c.consulenza', val: cnt(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0) },
    { label: 'Commesse al 100%',        formula: 'count(c.giaIncassato >= c.consulenza)',             src: 'c.giaIncassato, c.consulenza', val: cnt(c => (c.consulenza || 0) > 0 && (c.giaIncassato || 0) >= (c.consulenza || 0)) },
    { label: 'Backlog > 60 gg',         formula: 'count(isOpen && età > 60 gg)',                     src: 'c.dataAssegnazione || dataInizio', val: cnt(c => {
      if (!isOpenLocal(c)) return false;
      const s = c.dataAssegnazione || c.dataPianInizio || c.dataInizio;
      const m = String(s || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (!m) return false;
      const d = new Date(+m[3], +m[2] - 1, +m[1]);
      return (Date.now() - d.getTime()) / 86400000 > 60;
    }) },
    { label: 'Stalled',                 formula: 'count(avz < 50% && dataFine < oggi)',              src: 'c.avanzamento, c.dataFine', val: cnt(c => {
      if ((c.avanzamento || 0) >= 50 || !c.dataFine) return false;
      const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
      if (!m) return false;
      return new Date(+m[3], +m[2] - 1, +m[1]) < new Date();
    }) },
    { label: 'Ore Totali',              formula: 'Σ c.ore',                                          src: 'c.ore',                     val: oreTot },
    { label: 'Discenti Totali',         formula: 'Σ c.discenti',                                     src: 'c.discenti',                val: sum('discenti') }
  ];
}

function _wikiFmtVal(r) {
  if (r.eur) return (typeof fmtK === 'function') ? fmtK(r.val) : '€ ' + Math.round(r.val);
  if (r.pct) return r.val.toFixed(1) + '%';
  return (typeof fmt === 'function') ? fmt(r.val) : String(r.val);
}

function _wikiCalcsHtml() {
  const items = (typeof filtered !== 'undefined' && filtered) ? filtered : [];
  const rows = _wikiCalcRows(items);
  let h = '<p style="color:var(--text2);font-size:11px;margin-bottom:8px;line-height:1.5">' +
    'Ogni KPI mostrato nella dashboard parte da queste formule, applicate al <strong>dataset filtrato corrente</strong> (' +
    ((typeof fmt === 'function') ? fmt(items.length) : items.length) + ' commesse). ' +
    'Cambiando filtri / quick filter / periodo i valori qui sotto cambiano di conseguenza.</p>';
  h += '<div class="tbl-scroll"><table class="wiki-calc-tbl"><thead><tr>' +
    '<th>KPI</th><th>Formula</th><th>Campo JSON</th><th class="text-right">Valore ora</th>' +
    '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>' +
      '<td><strong>' + r.label + '</strong></td>' +
      '<td><code>' + r.formula + '</code></td>' +
      '<td><code>' + r.src + '</code></td>' +
      '<td class="text-right wiki-calc-val">' + _wikiFmtVal(r) + '</td>' +
      '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

/* ── Mapping campi JSON · stato di riempimento ──
   Per ogni campo del dataset, calcola quanti record lo hanno valorizzato
   (≠ vuoto e ≠ 0 per i numerici, ≠ '' per le stringhe). Mostra esempio. */
function _wikiFieldsHtml() {
  const D_local = (typeof D !== 'undefined' && D) ? D : [];
  const items = (typeof filtered !== 'undefined' && filtered) ? filtered : D_local;
  const n = items.length;
  if (!n) return '<p style="color:var(--text3);font-size:11px">Nessun dato caricato.</p>';
  /* Raccogli tutte le chiavi distinte (qualche record può avere più campi). */
  const keys = new Set();
  items.slice(0, 200).forEach(c => Object.keys(c).forEach(k => keys.add(k)));
  const allKeys = [...keys].sort();
  const rows = allKeys.map(k => {
    let filled = 0, example = '';
    for (let i = 0; i < items.length; i++) {
      const v = items[i][k];
      if (v !== null && v !== undefined && v !== '' && !(typeof v === 'number' && v === 0)) {
        filled++;
        if (!example) example = String(v).substring(0, 60);
      }
    }
    return { k, filled, pct: filled / n * 100, example };
  }).sort((a, b) => b.filled - a.filled);

  let h = '<p style="color:var(--text2);font-size:11px;margin-bottom:8px;line-height:1.5">' +
    'Tutti i campi presenti nel JSON di settore. Per ogni campo: quanti record lo hanno valorizzato ' +
    '(escluso vuoto e 0 per i numerici), la % di copertura sul filtrato corrente, e un esempio. ' +
    'Calcolato sui ' + ((typeof fmt === 'function') ? fmt(n) : n) + ' record filtrati.</p>';
  h += '<div class="tbl-scroll"><table class="wiki-calc-tbl"><thead><tr>' +
    '<th>Campo JSON</th><th class="text-right">Riempiti</th><th class="text-right">%</th><th>Esempio</th>' +
    '</tr></thead><tbody>';
  rows.forEach(r => {
    const cls = r.pct >= 80 ? 'pos' : r.pct >= 30 ? '' : 'neg';
    const bar = '<div class="wiki-fillbar"><div class="wiki-fillbar-in ' + cls + '" style="width:' + r.pct.toFixed(0) + '%"></div></div>';
    h += '<tr>' +
      '<td><code>' + r.k + '</code></td>' +
      '<td class="text-right">' + ((typeof fmt === 'function') ? fmt(r.filled) : r.filled) + '</td>' +
      '<td class="text-right" style="min-width:90px">' + r.pct.toFixed(1) + '% ' + bar + '</td>' +
      '<td><span style="color:var(--text3);font-size:10px;font-family:monospace">' + (r.example || '—').replace(/</g, '&lt;') + '</span></td>' +
      '</tr>';
  });
  h += '</tbody></table></div>';
  return h;
}

function renderWiki() {
  const el = document.getElementById('sec-wiki');
  if (!el) return;
  let h = '<div class="sec"><h3 class="sec-title">Manuale rapido · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:16px">' +
       'Come orientarsi nella dashboard, dove trovare cosa, glossario dei termini. ' +
       'Tutte le sezioni sono cliccabili.</p>';

  /* Banner di accesso veloce con le 3 azioni più frequenti */
  h += '<div class="wiki-quick">';
  h += '<div class="wiki-quick-card" onclick="showSec(\'explore\')">' +
       '<div class="wiki-quick-icon">🔍</div>' +
       '<div><strong>Esplora</strong><span>Analizza per qualunque dimensione + metrica + confronto</span></div></div>';
  h += '<div class="wiki-quick-card" onclick="setQuickFilter(\'inLav\')">' +
       '<div class="wiki-quick-icon">⚙️</div>' +
       '<div><strong>Solo in lavorazione</strong><span>Attiva il quick filter sticky in un click</span></div></div>';
  h += '<div class="wiki-quick-card" onclick="showSec(\'alert\')">' +
       '<div class="wiki-quick-icon">⚠️</div>' +
       '<div><strong>Alert</strong><span>MOL negativi, stalled, senza incasso, clienti a rischio</span></div></div>';
  h += '</div>';

  h += '<h4 class="wiki-section-h">📋 Flusso d\'uso suggerito</h4>';
  h += _wikiFlowHtml();

  h += '<h4 class="wiki-section-h">❓ Domande frequenti — dove trovo cosa</h4>';
  h += _wikiQaHtml();

  h += '<h4 class="wiki-section-h">📖 Glossario campi e metriche</h4>';
  h += _wikiGlossaryHtml();

  h += '<h4 class="wiki-section-h">📐 Calcoli effettuati · formula → valore sul filtrato</h4>';
  h += _wikiCalcsHtml();

  h += '<h4 class="wiki-section-h">🗂️ Mapping campi JSON · stato di riempimento</h4>';
  h += _wikiFieldsHtml();

  h += '<div class="wiki-footnote">' +
       '<strong>Suggerimento:</strong> il quick filter "⚙️ Solo in lavorazione" è attivo di default al primo accesso. Lo trovi sempre in cima sotto al titolo del settore — è sticky e si combina con gli altri filtri rapidi.' +
       '</div>';

  h += '</div>';
  el.innerHTML = h;
}
