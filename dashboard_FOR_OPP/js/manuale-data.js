/* Manuale BU · Opportunità Formazione GOL — sezioni autonome. */

const OPP_MANUALE_AREE = [
  { id: 'sintesi',    label: '🔍 Sintesi',         desc: 'Vista d\'insieme delle opportunità.' },
  { id: 'pipeline',   label: '🎯 Pipeline corsi',  desc: 'Pipeline opportunità e corsi.' },
  { id: 'territorio', label: '🌍 Territorio & rete', desc: 'CPI, operatori, rete autorizzati.' },
  { id: 'gestione',   label: '📋 Gestione',        desc: 'Rendicontazione e alert.' },
];

const OPP_MANUALE_SECTIONS = [
  {
    sec: 'executive', area: 'sintesi', accent: 'emerald', icon: '■', title: 'Executive Summary',
    desc: 'Sintesi delle opportunità GOL: numero opportunità in pipeline, top regioni, conversion rate, valore stimato. Vista direzionale per il responsabile commerciale Formazione.',
    bullets: [
      'Vedere il valore della pipeline opportunità',
      'Identificare regioni con più opportunità',
      'Misurare il tasso di conversione complessivo',
    ],
  },
  {
    sec: 'pipeline', area: 'pipeline', accent: 'cyan', icon: '€', title: 'Pipeline',
    desc: 'Funnel opportunità: lead grezzi → contattati → in valutazione → convertiti in commessa formativa. Tempo medio da opportunità a commessa, identificazione blocchi.',
    bullets: [
      'Vedere il funnel di conversione lead → commessa',
      'Misurare il lead time medio',
      'Identificare opportunità ferme',
    ],
  },
  {
    sec: 'corsi', area: 'pipeline', accent: 'emerald', icon: '▶', title: 'Corsi',
    desc: 'Catalogo corsi GOL associati alle opportunità: quale corso è più richiesto, quale converte meglio, capacità residua per corso. Per pianificare il calendario.',
    bullets: [
      'Vedere top corsi per richieste',
      'Confrontare conversione per corso',
      'Pianificare il calendario corsi',
    ],
  },
  {
    sec: 'cpi', area: 'territorio', accent: 'blue', icon: '◉', title: 'CPI',
    desc: 'Centri per l\'Impiego di riferimento: distribuzione opportunità per CPI, top CPI per volume, performance per area territoriale. Per il rapporto con i CPI partner.',
    bullets: [
      'Vedere top CPI per volume opportunità',
      'Identificare CPI sottoutilizzati',
      'Confrontare performance per area',
    ],
  },
  {
    sec: 'operatori', area: 'territorio', accent: 'slate', icon: '⚙', title: 'Operatori',
    desc: 'Operatori autorizzati GOL che gestiscono le opportunità: numero pratiche per operatore, tasso conversione, valore portafoglio. Per la valutazione della rete autorizzata.',
    bullets: [
      'Vedere top operatori per pratiche gestite',
      'Confrontare tassi di conversione',
      'Identificare operatori più produttivi',
    ],
  },
  {
    sec: 'rendicontazione', area: 'gestione', accent: 'purple', icon: '☰', title: 'Rendicontazione',
    desc: 'Stato delle pratiche di rendicontazione GOL: aperte, completate, importi rendicontati, tempi medi di liquidazione regionale.',
    bullets: [
      'Vedere pratiche da rendicontare',
      'Tracciare importi liquidati',
      'Misurare tempi medi rendicontazione',
    ],
  },
  {
    sec: 'alert', area: 'gestione', accent: 'rose', icon: '⚠', title: 'Alert & Anomalie',
    desc: 'Controlli automatici su opportunità GOL: opportunità in stallo, scadenze imminenti, anomalie nei dati. Per non perdere conversioni.',
    bullets: [
      'Vedere opportunità ferme da troppo',
      'Identificare scadenze imminenti',
      'Sbloccare anomalie operative',
    ],
  },
];
