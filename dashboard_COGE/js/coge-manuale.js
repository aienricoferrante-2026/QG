/* ── COGE · Sezione Manuale d'Uso ──
 * Card descrittive per ogni sezione della dashboard COGE.
 */

const COGE_MANUALE_AREE = [
  { id: 'sintesi', label: '📊 Sintesi e bilancino',  desc: 'Vista d\'insieme del conto economico cross-BU.' },
  { id: 'analisi', label: '🧮 Analisi imputazioni',  desc: 'Cascata costo dipendente → commessa → BU → generali.' },
  { id: 'dati',    label: '📥 Dati esterni',         desc: 'Caricamenti manuali: Segnatempo, HR, indiretti.' },
];

const COGE_MANUALE_SECTIONS = [
  {
    sec: 'riepilogo', area: 'sintesi', accent: 'blue', icon: '📊', title: 'Bilancino (pivot)',
    desc: 'Conto economico operativo pivotabile per 5 dimensioni: Società × Sede × BU (dettaglio), Sede (per partner), BU verticale, Società (rollup), Regione. Formula: Risultato = Ricavi − Costi diretti − Costo Personale BU − Costi Indiretti − Costi Generali (L3). Quando è selezionato un mese, HR e indiretti sono scalati pro-rata 1/12.',
    bullets: [
      'Inviare report per Sede ai partner (vista "Sede per partner")',
      'Confrontare margine % tra BU diverse',
      'Pivotare anche per Regione geografica',
    ],
  },
  {
    sec: 'imputazioni', area: 'analisi', accent: 'cyan', icon: '🧮', title: 'Imputazione su commesse',
    desc: 'Calcolo cascata L1/L2/L3 alimentato da Segnatempo + HR. L1 ore su IdCommessa specifico → costo commessa diretto. L2 ore su BU senza commessa → spalmato su tutte le commesse della BU. L3 ore senza imputazione → costi generali (overhead). Mostra MOL operativo per commessa, aggregato per BU, top 50 commesse.',
    bullets: [
      'Vedere MOL operativo vero per commessa',
      'Identificare BU con alto pool L2 (servizi trasversali)',
      'Misurare l\'overhead L3 della struttura',
    ],
  },
  {
    sec: 'segnatempo', area: 'dati', accent: 'cyan', icon: '⏱️', title: 'Segnatempo',
    desc: 'Tracking del tempo: ogni riga è una registrazione ore di un dipendente. Schema: Dipendente · Data · Ore · IdCommessa (opzionale) · BU (opzionale) · Descrizione. La cascata di imputazione si applica automaticamente: IdCommessa → L1, BU → L2, niente → L3. Costo orario = costoAnnuo / 1.720 ore (CCNL standard).',
    bullets: [
      'Caricare Excel/CSV con righe ore registrate',
      'Vedere distribuzione ore per livello (L1/L2/L3)',
      'Esportare lo stato attuale come backup',
    ],
  },
  {
    sec: 'hr', area: 'dati', accent: 'emerald', icon: '👥', title: 'Personale (HR)',
    desc: 'Anagrafica dipendenti con imputazione Società/Sede/BU principale e costo annuo. Da caricare via Excel/CSV esportato da WeA HR. I dati vivono in localStorage del browser (NON committati nel repo per privacy stipendi). Validazione automatica: BU deve essere una delle 11 conosciute, dipendente non vuoto.',
    bullets: [
      'Caricare l\'export dipendenti da WeA HR',
      'Vedere costo annuo totale del personale',
      'Scaricare template CSV o stato attuale',
    ],
  },
  {
    sec: 'indiretti', area: 'dati', accent: 'amber', icon: '🏢', title: 'Costi indiretti',
    desc: 'Form editabile per ogni Società × Sede con 10 voci predefinite (Affitti, Utenze, Telefonia, Materiali, Manutenzioni, Software, Pulizie, Trasferte, Servizi professionali, Spese generali). Salvataggio automatico al cambio valore. Supporta anche Import/Export Excel CSV per gestione bulk.',
    bullets: [
      'Inserire affitti e utenze per ogni sede',
      'Esportare Excel per modifica offline',
      'Vedere totale indiretti per anno/mese',
    ],
  },
];

let _cogeManFilter = '';

function _cogeManCardHtml(item) {
  const bullets = (item.bullets || []).map(b => '<li>' + b + '</li>').join('');
  const href = item.sec ? "javascript:cogeShowSec('" + item.sec + "')" : '#';
  return '<a href="' + href + '" class="manu-card manu-card-' + item.accent + '">' +
    '<div class="manu-card-head">' +
      '<div class="manu-icon manu-icon-' + item.accent + '">' + item.icon + '</div>' +
      '<div class="manu-card-titles"><h4>' + item.title + '</h4></div>' +
    '</div>' +
    '<p class="manu-desc">' + item.desc + '</p>' +
    (bullets ? '<ul class="manu-bullets">' + bullets + '</ul>' : '') +
    '<div class="manu-card-foot">' +
      '<code class="manu-path">#' + item.sec + '</code>' +
      '<span class="manu-arrow">Apri →</span>' +
    '</div></a>';
}

function _cogeManMatch(it, q) {
  if (!q) return true;
  return (it.title + ' ' + it.desc + ' ' + (it.bullets || []).join(' ')).toLowerCase().includes(q.toLowerCase());
}

function renderCogeManuale() {
  const el = document.getElementById('sec-manuale');
  if (!el) return;
  const q = _cogeManFilter.trim();
  const all = COGE_MANUALE_SECTIONS.filter(it => _cogeManMatch(it, q));
  const aree = COGE_MANUALE_AREE.filter(a => all.some(it => it.area === a.id));

  let h = '<div class="sec"><h3 class="sec-title">📖 Manuale d\'Uso · Dashboard COGE</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Guida visiva alle 5 sezioni della dashboard COGE. ' +
       'Clicca una card per aprirla.</p>';
  h += '<div class="manu-header">';
  h += '<span class="manu-count">' + all.length + ' sezioni · ' + aree.length + ' aree</span>';
  h += '<input type="search" class="manu-search" placeholder="🔍 Cerca…" value="' + q.replace(/"/g, '&quot;') + '" oninput="cogeManFilter(this.value)" autocomplete="off">';
  h += '</div>';
  h += '<div class="manu-chips">';
  COGE_MANUALE_AREE.forEach(a => {
    const hits = all.filter(it => it.area === a.id).length;
    const enabled = hits > 0;
    h += '<a href="' + (enabled ? '#cogeManArea-' + a.id : '#') + '" class="manu-chip' + (enabled ? '' : ' manu-chip-off') + '"' +
      (enabled ? '' : ' onclick="event.preventDefault();return false"') + '>' +
      a.label + ' <span class="manu-chip-count">' + hits + '</span></a>';
  });
  h += '</div>';
  if (!all.length) {
    h += '<div class="manu-empty"><div style="font-size:48px;margin-bottom:8px">🔍</div>' +
      '<p>Nessuna sezione corrisponde a "<b>' + q + '</b>".</p>' +
      '<button class="manu-clear" onclick="cogeManFilter(\'\')">Pulisci filtro</button></div>';
  } else {
    aree.forEach(a => {
      const items = all.filter(it => it.area === a.id);
      h += '<section class="manu-area" id="cogeManArea-' + a.id + '">' +
        '<header class="manu-area-head"><h3>' + a.label + '</h3>' +
        '<p class="manu-area-desc">' + a.desc + '</p></header>' +
        '<div class="manu-grid">' + items.map(_cogeManCardHtml).join('') + '</div></section>';
    });
  }
  h += '</div>';
  el.innerHTML = h;
}

function cogeManFilter(v) {
  _cogeManFilter = v || '';
  renderCogeManuale();
}
