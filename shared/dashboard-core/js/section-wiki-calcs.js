/* ── Wiki · "Calcoli effettuati" e "Mapping campi JSON" ──
   Estratto da section-wiki.js per rispettare il limite di 300 righe/file.
   Va incluso DOPO section-wiki.js negli HTML. */

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
    { id: 'cnt',         label: 'Commesse Totali',
      descUser: 'Quante pratiche/commesse vedi dopo aver applicato i filtri. È il numero di righe della tabella di partenza, niente di più.',
      formula: 'items.length', src: '(dataset filtrato)', val: len },
    { id: 'inLav',       label: 'Commesse In Lavorazione',
      descUser: 'Pratiche con stato amministrativo "In Lavorazione" (campo Status). Sono attive, qualcuno ci sta lavorando.',
      formula: "count(c.status === 'In Lavorazione')", src: 'c.status', val: cnt(c => /lavorazione/i.test(c.status || '')) },
    { id: 'open',        label: 'Commesse Aperte (WIP n)',
      descUser: 'Pratiche aperte = non Chiuse e non Annullate. WIP sta per "Work In Progress", cioè lavoro in corso.',
      formula: '!isClosed && !isCancelled', src: 'c.status, c.statoCorso', val: cnt(isOpenLocal) },
    { id: 'closed',      label: 'Commesse Chiuse (Out n)',
      descUser: 'Pratiche concluse: Status "Chiusa" (kit) o Stato Corso "Concluso" (per Formazione). Sono l\'output del periodo.',
      formula: 'isClosed', src: "c.status === 'Chiusa' OR c.statoCorso === 'Concluso'", val: cnt(isClosedLocal) },
    { id: 'cancel',      label: 'Annullate',
      descUser: 'Pratiche annullate. Vengono mostrate nei filtri ma escluse dai calcoli "aperte".',
      formula: "c.status === 'Annullato' || 'Annullata'", src: 'c.status', val: cnt(c => c.status === 'Annullato' || c.status === 'Annullata') },
    { id: 'plan',        label: 'Da pianificare',
      descUser: 'Pratiche assegnate ma ancora da iniziare: Status "Da pianificare".',
      formula: "c.status === 'Da pianificare'", src: 'c.status', val: cnt(c => c.status === 'Da pianificare') },
    { id: 'ricavi',      label: 'Ricavi Totali (€)',
      descUser: 'Somma di tutti gli "Importo Consulenza" delle pratiche filtrate. È il fatturato teorico — non quello già incassato.',
      formula: 'Σ c.consulenza', src: 'c.consulenza', val: consTot, eur: true },
    { id: 'costi',       label: 'Costi Totali (€)',
      descUser: 'Somma dei "Totale Costi" registrati nel gestionale per le pratiche filtrate.',
      formula: 'Σ c.costi', src: 'c.costi', val: sum('costi'), eur: true },
    { id: 'mol',         label: 'MOL Totale (€)',
      descUser: 'Margine Operativo Lordo = Ricavi − Costi. Dice "quanto guadagniamo lordo" su queste pratiche. Negativo = stiamo perdendo.',
      formula: 'Σ c.mol = Σ(consulenza − costi)', src: 'c.mol', val: molTot, eur: true },
    { id: 'margine',     label: 'Margine %',
      descUser: 'Quale percentuale dei ricavi rimane come margine. Es. 30% = ogni 100€ fatturati, 30€ sono guadagno e 70€ sono costi.',
      formula: 'MOL ÷ Ricavi × 100', src: 'c.mol / c.consulenza', val: margPct, pct: true },
    { id: 'incassato',   label: 'Già Incassato (€)',
      descUser: 'Soldi davvero entrati in cassa per queste pratiche (campo "Già Incassato" del gestionale).',
      formula: 'Σ c.giaIncassato', src: 'c.giaIncassato', val: incTot, eur: true },
    { id: 'pctInc',      label: '% Incasso',
      descUser: 'Quale percentuale dei ricavi è già stata incassata. Es. 60% = di ogni 100€ fatturati ne abbiamo già ricevuti 60.',
      formula: 'GiàIncassato ÷ Ricavi × 100', src: 'c.giaIncassato / c.consulenza', val: incPct, pct: true },
    { id: 'daIncassare', label: 'Esposizione / Da Inc. (€)',
      descUser: 'Soldi che il cliente ci deve ancora versare: Ricavi meno Già Incassato. Mai negativo (se ha pagato in eccesso conta zero).',
      formula: 'Σ max(0, c.consulenza − c.giaIncassato)', src: 'c.consulenza, c.giaIncassato',
      val: items.reduce((s, c) => s + Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)), 0), eur: true },
    { id: 'molNeg',      label: 'MOL Negativo (n)',
      descUser: 'Quante pratiche stanno andando in perdita: hanno costi maggiori dei ricavi. Da controllare subito.',
      formula: 'count(c.mol < 0 && c.consulenza > 0)', src: 'c.mol, c.consulenza',
      val: cnt(c => (c.mol || 0) < 0 && (c.consulenza || 0) > 0) },
    { id: 'noInc',       label: 'Senza incasso (n)',
      descUser: 'Pratiche con ricavi fatturati ma per cui ancora non è arrivato nessun pagamento. Da sollecitare.',
      formula: 'count(c.giaIncassato === 0 && c.consulenza > 0)', src: 'c.giaIncassato, c.consulenza',
      val: cnt(c => (c.giaIncassato || 0) === 0 && (c.consulenza || 0) > 0) },
    { id: 'inc100',      label: 'Commesse al 100%',
      descUser: 'Pratiche saldate: ricevuto tanto quanto (o più di) quanto fatturato. Sono completamente incassate.',
      formula: 'count(c.giaIncassato >= c.consulenza)', src: 'c.giaIncassato, c.consulenza',
      val: cnt(c => (c.consulenza || 0) > 0 && (c.giaIncassato || 0) >= (c.consulenza || 0)) },
    { id: 'backlog',     label: 'Backlog > 60 gg',
      descUser: 'Pratiche ancora aperte assegnate più di 60 giorni fa. Si stanno accumulando — possibile collo di bottiglia.',
      formula: 'count(isOpen && età > 60 gg)', src: 'c.dataAssegnazione || dataInizio',
      val: cnt(c => {
        if (!isOpenLocal(c)) return false;
        const s = c.dataAssegnazione || c.dataPianInizio || c.dataInizio;
        const m = String(s || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (!m) return false;
        const d = new Date(+m[3], +m[2] - 1, +m[1]);
        return (Date.now() - d.getTime()) / 86400000 > 60;
      }) },
    { id: 'stalled',     label: 'Stalled',
      descUser: 'Pratiche in ritardo: data fine già passata ma avanzamento sotto al 50%. Sono "ferme" — qualcuno deve sbloccarle.',
      formula: 'count(avz < 50% && dataFine < oggi)', src: 'c.avanzamento, c.dataFine',
      val: cnt(c => {
        if ((c.avanzamento || 0) >= 50 || !c.dataFine) return false;
        const m = String(c.dataFine).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (!m) return false;
        return new Date(+m[3], +m[2] - 1, +m[1]) < new Date();
      }) },
    { id: 'ore',         label: 'Ore Totali',
      descUser: 'Somma delle ore di formazione/lavoro registrate (campo Ore). Utile soprattutto su Formazione.',
      formula: 'Σ c.ore', src: 'c.ore', val: oreTot },
    { id: 'discenti',    label: 'Discenti Totali',
      descUser: 'Numero totale di partecipanti ai corsi (campo Discenti). Utile su Formazione.',
      formula: 'Σ c.discenti', src: 'c.discenti', val: sum('discenti') }
  ];
}

/* Cache dell'ultimo array di righe calcolate, usato dal popup _wikiCalcInfo. */
let _wikiCalcCache = [];

/* Apre un modale con il dettaglio "intelligibile" di un singolo KPI. */
function _wikiCalcInfo(id) {
  const r = _wikiCalcCache.find(x => x.id === id);
  if (!r || typeof openModal !== 'function') return;
  const valTxt = _wikiFmtVal(r);
  let h = '<div style="padding:8px 4px;font-size:12px;color:var(--text);line-height:1.55">';
  h += '<div style="background:rgba(99,102,241,.08);border-left:3px solid var(--accent);padding:10px 14px;border-radius:4px;margin-bottom:14px">';
  h += '<div style="font-size:10px;color:var(--text2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px">Cosa significa</div>';
  h += '<div style="font-size:13px;line-height:1.5">' + r.descUser + '</div>';
  h += '</div>';
  h += '<div style="display:grid;grid-template-columns:max-content 1fr;gap:6px 16px;font-size:12px">';
  h += '<div style="color:var(--text2)">Valore ora</div><div><strong style="font-size:18px;color:var(--green)">' + valTxt + '</strong></div>';
  h += '<div style="color:var(--text2)">Formula</div><div><code style="background:rgba(99,102,241,.10);color:var(--accent);padding:2px 6px;border-radius:3px;font-size:11px">' + r.formula + '</code></div>';
  h += '<div style="color:var(--text2)">Campo JSON</div><div><code style="background:rgba(99,102,241,.10);color:var(--accent);padding:2px 6px;border-radius:3px;font-size:11px">' + r.src + '</code></div>';
  h += '</div>';
  h += '<p style="margin-top:14px;color:var(--text3);font-size:11px">Il valore cambia quando applichi filtri, quick filter o sub-filtri di Esplora — è sempre calcolato sulle commesse correntemente visibili.</p>';
  h += '</div>';
  openModal('<span style="color:var(--accent);font-size:18px;margin-right:6px">&#9432;</span> ' + r.label, h);
}

function _wikiFmtVal(r) {
  if (r.eur) return (typeof fmtK === 'function') ? fmtK(r.val) : '€ ' + Math.round(r.val);
  if (r.pct) return r.val.toFixed(1) + '%';
  return (typeof fmt === 'function') ? fmt(r.val) : String(r.val);
}

function _wikiCalcsHtml() {
  const items = (typeof filtered !== 'undefined' && filtered) ? filtered : [];
  const rows = _wikiCalcRows(items);
  _wikiCalcCache = rows;
  let h = '<p style="color:var(--text2);font-size:11px;margin-bottom:8px;line-height:1.5">' +
    'Ogni KPI mostrato nella dashboard parte da queste formule, applicate al <strong>dataset filtrato corrente</strong> (' +
    ((typeof fmt === 'function') ? fmt(items.length) : items.length) + ' commesse). ' +
    'Cambiando filtri / quick filter / periodo i valori qui sotto cambiano di conseguenza. ' +
    'Clicca <strong>ⓘ</strong> per la spiegazione completa in linguaggio semplice.</p>';
  h += '<div class="tbl-scroll"><table class="wiki-calc-tbl"><thead><tr>' +
    '<th style="width:32px"></th>' +
    '<th>KPI</th>' +
    '<th>Cosa significa</th>' +
    '<th>Formula</th>' +
    '<th>Campo JSON</th>' +
    '<th class="text-right">Valore ora</th>' +
    '</tr></thead><tbody>';
  rows.forEach(r => {
    h += '<tr>' +
      '<td><span class="wiki-info-btn" onclick="_wikiCalcInfo(\'' + r.id + '\')" title="Spiegazione dettagliata">&#9432;</span></td>' +
      '<td><strong>' + r.label + '</strong></td>' +
      '<td class="wiki-desc-user">' + r.descUser + '</td>' +
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
