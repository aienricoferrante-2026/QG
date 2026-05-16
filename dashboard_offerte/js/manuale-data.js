/* Manuale BU · Offerte commerciali — sezioni autonome. */

const OFF_MANUALE_AREE = [
  { id: 'sintesi', label: '🔍 Sintesi',          desc: 'Vista d\'insieme della pipeline offerte.' },
  { id: 'pipeline', label: '💰 Pipeline & Trend', desc: 'Conversioni, tassi, andamento temporale.' },
  { id: 'attori',   label: '📇 Attori & dimensioni', desc: 'Commerciali, categorie, società/sedi.' },
  { id: 'dettaglio', label: '📋 Dettaglio & Alert', desc: 'Tabella completa e anomalie.' },
];

const OFF_MANUALE_SECTIONS = [
  {
    sec: 'executive', area: 'sintesi', accent: 'emerald', icon: '■', title: 'Executive Summary',
    desc: 'Sintesi delle offerte commerciali in pipeline: numero offerte aperte, valore complessivo, tasso di conversione medio, top commerciali. Pensato per la direzione che vuole vedere lo stato della pipeline al mattino.',
    bullets: [
      'Vedere il valore della pipeline aperta',
      'Identificare i commerciali più attivi',
      'Misurare il tasso di conversione globale',
    ],
  },
  {
    sec: 'pipeline', area: 'pipeline', accent: 'cyan', icon: '€', title: 'Pipeline & Conversione',
    desc: 'Funnel commerciale: offerte create → in negoziazione → vinte / perse. Misura il tempo medio di conversione e identifica i colli di bottiglia. Confronto periodi A/B per vedere se le performance migliorano.',
    bullets: [
      'Vedere il funnel di conversione',
      'Misurare lead time dalla creazione alla chiusura',
      'Confrontare performance fra periodi',
    ],
  },
  {
    sec: 'trend', area: 'pipeline', accent: 'blue', icon: '▼', title: 'Trend Temporale',
    desc: 'Andamento delle offerte nel tempo: numero per mese, valore cumulato, tasso conversione mensile. Per spotare la stagionalità e i trend di crescita/calo.',
    bullets: [
      'Vedere offerte create per mese',
      'Identificare picchi stagionali',
      'Tracciare l\'evoluzione del tasso conversione',
    ],
  },
  {
    sec: 'agenti', area: 'attori', accent: 'slate', icon: '⚙', title: 'Commerciali',
    desc: 'Vista per agente commerciale: numero offerte gestite, valore portafoglio, tasso conversione, ricavi vinti. Per la valutazione delle performance del team commerciale.',
    bullets: [
      'Top commerciali per offerte vinte',
      'Confrontare tassi di conversione per agente',
      'Identificare commerciali sopra/sotto media',
    ],
  },
  {
    sec: 'categorie', area: 'attori', accent: 'purple', icon: '▶', title: 'Categorie',
    desc: 'Distribuzione offerte per categoria/tipologia di servizio. Quale categoria converte meglio, quale ha valore medio più alto.',
    bullets: [
      'Vedere quali categorie generano più valore',
      'Confrontare conversioni per categoria',
      'Pianificare focus commerciale',
    ],
  },
  {
    sec: 'societa', area: 'attori', accent: 'blue', icon: '◉', title: 'Società & Sedi',
    desc: 'Distribuzione geografica per società committente e sede operativa Qualifica. Per pianificare risorse territoriali e identificare opportunità per regione.',
    bullets: [
      'Vedere offerte per società cliente',
      'Distribuire per sede Qualifica',
      'Confrontare performance fra sedi',
    ],
  },
  {
    sec: 'tabella', area: 'dettaglio', accent: 'slate', icon: '☰', title: 'Tabella Offerte',
    desc: 'Vista tabellare completa di tutte le offerte con filtri multi-select, ordinamento per colonna, drill-down su singola offerta. Per consultazione operativa e ricerca puntuale.',
    bullets: [
      'Cercare un\'offerta specifica',
      'Filtrare per stato, agente, periodo',
      'Esportare lista per analisi esterne',
    ],
  },
  {
    sec: 'alert', area: 'dettaglio', accent: 'rose', icon: '⚠', title: 'Alert & Anomalie',
    desc: 'Controlli automatici: offerte in stallo da troppo, offerte senza azione recente, valori anomali. Per non perdere opportunità ferme.',
    bullets: [
      'Vedere offerte stalled da > X giorni',
      'Identificare anomalie nei dati',
      'Sbloccare opportunità dimenticate',
    ],
  },
];
