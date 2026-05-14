/* ── Sezione Manuale del kit condiviso (Caso 1) ──
 * Stesso pattern del Manuale Hub root, adattato a una singola BU:
 * card descrittive per ogni sezione interna della dashboard, con
 * descrizione discorsiva, bullets "cosa puoi fare", path footer.
 *
 * Architettura dati:
 *   1. KIT_BASE_SECTIONS · sezioni del kit comuni a tutte le BU
 *      (Esplora, Executive, Ricavi, Econ, Incassi, Anagrafiche,
 *      Stato, Alert, Performance, Wiki).
 *   2. Ogni BU dichiara in `js/manuale-data.js` un array
 *      `MANUALE_BU_SECTIONS` con le sue voci Caso 2 (sezioni custom).
 *   3. Aree raggruppate in MANUALE_BU_AREE (sovrascrivibili dalla BU).
 *
 * Stato filtro in window._manFilter.
 */

const KIT_BASE_AREE = [
  { id: 'esplora',    label: '🔍 Esplora & Sintesi',       desc: 'Vista d\'insieme dei numeri della BU.' },
  { id: 'finanza',    label: '💰 Finanza',                 desc: 'Ricavi, MOL, incassi, esposizione.' },
  { id: 'anagrafica', label: '📇 Anagrafiche',             desc: 'Clienti, sedi, responsabili.' },
  { id: 'stato',      label: '⚙️ Stato lavorazione',        desc: 'Avanzamento, alert, anomalie.' },
  { id: 'caso2',      label: '🎯 Specifiche di settore',   desc: 'Sezioni custom della BU.' },
  { id: 'tools',      label: '🛠 Strumenti',                desc: 'Performance, link partner, manuale.' },
];

const KIT_BASE_SECTIONS = [
  {
    sec: 'explore', area: 'esplora', accent: 'blue', icon: '🔍', title: 'Esplora',
    desc: 'Vista multi-dimensionale dei dati: combina dimensione (sede, cliente, responsabile, ecc.) con metrica (commesse, ricavi, MOL). 14 dimensioni · 15 metriche · 9 preset · confronto periodi A/B. Punto di partenza per qualsiasi analisi ad-hoc.',
    bullets: [
      'Combinare dimensione × metrica per esplorare i numeri',
      'Confrontare due periodi tra loro (A/B)',
      'Salvare preset e applicare sub-filtri rapidi',
    ],
  },
  {
    sec: 'executive', area: 'esplora', accent: 'emerald', icon: '■', title: 'Executive Summary',
    desc: 'Sintesi a colpo d\'occhio dei numeri principali della BU: ricavi, MOL, % incasso, esposizione residua, top clienti, distribuzione per stato. Pensato per la direzione che apre la dashboard 30 secondi al giorno.',
    bullets: [
      'Vedere ricavi e margine in un colpo d\'occhio',
      'Identificare i 5 clienti più importanti',
      'Controllare la pipeline aperta vs chiusa',
    ],
  },
  {
    sec: 'ricavi', area: 'finanza', accent: 'emerald', icon: '€', title: 'Ricavi & MOL',
    desc: 'Andamento temporale di ricavi (Importo Consulenza) e MOL. Trend per mese/anno, confronto periodo precedente, distribuzione per sede. Utile per il forecast e per spiegare gli scostamenti.',
    bullets: [
      'Vedere il trend ricavi mese per mese',
      'Confrontare con periodo precedente',
      'Distribuire ricavi per sede operativa',
    ],
  },
  {
    sec: 'econFin', area: 'finanza', accent: 'purple', icon: '📊', title: 'Econ. & Finanziario',
    desc: 'Vista contabile: Ricavi, Costi, MOL, % margine. Confronti tra Ricavi Consulenza (preconsuntivo) e Ricavi Documentati (effettivi). Per le BU dove il campo costi non è popolato (10/11) il MOL Qnet è precalcolato.',
    bullets: [
      'Confrontare ricavi consuntivo vs documentati',
      'Vedere costi diretti per commessa (se popolati)',
      'Calcolare margine effettivo della BU',
    ],
  },
  {
    sec: 'analisiIncassi', area: 'finanza', accent: 'cyan', icon: '💵', title: 'Analisi Incassi',
    desc: 'Stato incassi: già incassato, da incassare, % di rotazione. Identifica i clienti con esposizione alta + bassa % di incasso (clienti a rischio). KPI cliccabili per drill-down sui dettagli.',
    bullets: [
      'Vedere quanto è già incassato vs ancora da incassare',
      'Identificare clienti con esposizione critica',
      'Tracciare scadenze e ritardi di pagamento',
    ],
  },
  {
    sec: 'responsabili', area: 'anagrafica', accent: 'slate', icon: '⚙', title: 'Responsabili',
    desc: 'Vista per tecnico/responsabile della commessa. Mostra carico di lavoro per persona, ricavi gestiti, status di avanzamento. Il campo `responsabile` è il Tecnico esecutore (non il commerciale).',
    bullets: [
      'Vedere quante commesse gestisce ogni tecnico',
      'Distribuire il carico per persona',
      'Identificare responsabili sotto/sovraccarichi',
    ],
  },
  {
    sec: 'clienti', area: 'anagrafica', accent: 'blue', icon: '◉', title: 'Clienti',
    desc: 'Tabella clienti con numero commesse, ricavi cumulati, % incasso, esposizione. Ordinabile per qualsiasi colonna. Per la fidelizzazione e la priorità commerciale.',
    bullets: [
      'Trovare top clienti per ricavi',
      'Vedere clienti con esposizione alta',
      'Analizzare frequenza ordini (n. commesse)',
    ],
  },
  {
    sec: 'sedi', area: 'anagrafica', accent: 'slate', icon: '▼', title: 'Sedi',
    desc: 'Distribuzione geografica delle commesse per sede operativa e regione. Utile per la pianificazione delle risorse territoriali.',
    bullets: [
      'Vedere ricavi e MOL per sede',
      'Confrontare le performance delle sedi',
      'Distribuire commesse per regione',
    ],
  },
  {
    sec: 'avanzamento', area: 'stato', accent: 'amber', icon: '⏱', title: 'Avanzamento',
    desc: 'Stato di avanzamento delle commesse aperte: % completamento, durata media, commesse in ritardo. Per il monitoraggio operativo del back-office.',
    bullets: [
      'Vedere lavorazioni in corso e % di completamento',
      'Identificare commesse stalled',
      'Tracciare tempi medi di chiusura',
    ],
  },
  {
    sec: 'alert', area: 'stato', accent: 'rose', icon: '⚠', title: 'Alert & Anomalie',
    desc: '7 controlli automatici sui dati: chiuse senza completamento, chiuse senza incasso, in lavorazione >12 mesi, pipeline ferma >12 mesi, ricavi azzerati, date invertite, clienti a rischio. Auto-hide se zero hit.',
    bullets: [
      'Vedere anomalie da risolvere in Qnet',
      'Recuperare crediti su commesse chiuse',
      'Sbloccare lavorazioni dimenticate',
    ],
  },
  {
    sec: 'linkPartner', area: 'tools', accent: 'cyan', icon: '🔗', title: 'Link Partner',
    desc: 'Mini-dashboard pubbliche da inviare ai partner di sede. Ogni partner accede solo ai suoi dati, no login. Token URL personalizzato per sede.',
    bullets: [
      'Generare link mirati per ogni partner',
      'Tracciare quali partner hanno accesso',
      'Inviare report periodici via email',
    ],
  },
  {
    sec: 'produttivita', area: 'tools', accent: 'purple', icon: '📈', title: 'Produttività attori',
    desc: 'Tabelle ordinabili Top Commerciali (`agente`), Tecnici (`responsabile`), Rete (`segnalatore`). Per ogni attore: commesse, ricavi, MOL, margine %, da incassare, clienti distinti, ticket medio. Banner colorato di copertura dato.',
    bullets: [
      'Vedere top commerciali per ricavi',
      'Identificare tecnici più produttivi',
      'Premiare la rete di segnalatori',
    ],
  },
  {
    sec: 'wiki', area: 'tools', accent: 'slate', icon: '📖', title: 'Wiki & Calcoli',
    desc: 'Manuale Q&A con 23 voci cercabili, glossario dei termini chiave, mappa visuale dei flussi. Sezione "Calcoli effettuati" con la formula di ogni KPI ricalcolata sul filtro corrente.',
    bullets: [
      'Cercare la definizione di un KPI',
      'Capire come è calcolato un numero',
      'Vedere il mapping dei campi JSON',
    ],
  },
];

let _manFilter = '';

function _manMatchSec(item, q) {
  if (!q) return true;
  const hay = (item.title + ' ' + item.desc + ' ' + (item.bullets || []).join(' ')).toLowerCase();
  return hay.includes(q.toLowerCase());
}

function _manCardHtml(item) {
  const bullets = (item.bullets || []).map(b => '<li>' + b + '</li>').join('');
  const badge = item.badge ? '<span class="manu-badge manu-badge-' + item.accent + '">' + item.badge + '</span>' : '';
  const href = item.sec ? "javascript:showSec('" + item.sec + "')" : (item.href || '#');
  return '<a href="' + href + '" class="manu-card manu-card-' + item.accent + '">' +
    '<div class="manu-card-head">' +
      '<div class="manu-icon manu-icon-' + item.accent + '">' + (item.icon || '•') + '</div>' +
      '<div class="manu-card-titles"><h4>' + item.title + ' ' + badge + '</h4></div>' +
    '</div>' +
    '<p class="manu-desc">' + item.desc + '</p>' +
    (bullets ? '<ul class="manu-bullets">' + bullets + '</ul>' : '') +
    '<div class="manu-card-foot">' +
      '<code class="manu-path">' + (item.sec ? '#' + item.sec : (item.href || '—')) + '</code>' +
      '<span class="manu-arrow">Apri →</span>' +
    '</div>' +
  '</a>';
}

function _manGetAreas() {
  return (typeof MANUALE_BU_AREE !== 'undefined') ? MANUALE_BU_AREE : KIT_BASE_AREE;
}

function _manGetSections() {
  /* Combina KIT_BASE_SECTIONS + sezioni Caso 2 della BU + override.
     L'override per sec (stesso .sec) sostituisce la base. */
  const buExtra = (typeof MANUALE_BU_SECTIONS !== 'undefined') ? MANUALE_BU_SECTIONS : [];
  const cfg = window.SECTOR_CONFIG || {};
  const enabledSecs = new Set();
  // Aggiunge sec del kit che la BU ha effettivamente nel DOM
  KIT_BASE_SECTIONS.forEach(s => {
    if (document.getElementById('sec-' + s.sec)) enabledSecs.add(s.sec);
  });
  const overrides = {};
  buExtra.forEach(s => { if (s.sec) overrides[s.sec] = s; });
  const base = KIT_BASE_SECTIONS.filter(s => enabledSecs.has(s.sec))
    .map(s => overrides[s.sec] || s);
  const extras = buExtra.filter(s => !KIT_BASE_SECTIONS.find(b => b.sec === s.sec));
  return [...base, ...extras];
}

function renderManuale() {
  const root = document.getElementById('sec-manuale');
  if (!root) return;
  const q = _manFilter.trim();
  const aree = _manGetAreas();
  const all = _manGetSections().filter(it => _manMatchSec(it, q));
  const areeAttive = aree.filter(a => all.some(it => it.area === a.id));
  const sectorLabel = (window.SECTOR_CONFIG || {}).label || 'BU';

  let h = '<div class="sec"><h3 class="sec-title">📖 Manuale d\'Uso · ' + sectorLabel + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Guida visiva a tutte le sezioni di questa dashboard. ' +
       'Clicca una card per aprirla, oppure usa la ricerca per trovare una funzionalità.</p>';
  h += '<div class="manu-header">';
  h += '<span class="manu-count">' + all.length + ' sezioni · ' + areeAttive.length + ' aree</span>';
  h += '<input type="search" class="manu-search" placeholder="🔍 Cerca sezione…" value="' + q.replace(/"/g, '&quot;') + '" oninput="manFilterChange(this.value)" autocomplete="off">';
  h += '</div>';
  h += '<div class="manu-chips">';
  aree.forEach(a => {
    const hits = all.filter(it => it.area === a.id).length;
    const enabled = hits > 0;
    h += '<a href="' + (enabled ? '#manu-area-' + a.id : '#') + '" class="manu-chip' + (enabled ? '' : ' manu-chip-off') + '"' +
      (enabled ? '' : ' onclick="event.preventDefault();return false"') + '>' +
      a.label + ' <span class="manu-chip-count">' + hits + '</span></a>';
  });
  h += '</div>';
  if (!all.length) {
    h += '<div class="manu-empty"><div style="font-size:48px;margin-bottom:8px">🔍</div>' +
      '<p>Nessuna sezione corrisponde a "<b>' + q + '</b>".</p>' +
      '<button class="manu-clear" onclick="manFilterChange(\'\')">Pulisci filtro</button></div>';
  } else {
    areeAttive.forEach(a => {
      const items = all.filter(it => it.area === a.id);
      h += '<section class="manu-area" id="manu-area-' + a.id + '">' +
        '<header class="manu-area-head"><h3>' + a.label + '</h3>' +
        '<p class="manu-area-desc">' + a.desc + '</p></header>' +
        '<div class="manu-grid">' + items.map(_manCardHtml).join('') + '</div></section>';
    });
  }
  h += '</div>';
  root.innerHTML = h;
}

function manFilterChange(v) {
  _manFilter = v || '';
  renderManuale();
}
