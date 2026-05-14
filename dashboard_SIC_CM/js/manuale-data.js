/* Manuale BU · Sicurezza Lavoro — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'sicurezza', area: 'caso2', accent: 'cyan', icon: '🛡️', title: 'Tipologie & Aggiornamenti',
    desc: 'Parser intelligente che classifica 21 sigle SIC dal titolo della commessa (DVR, RSPP, RLS, ART37, FORM, PREP, APS, ADE, VISITE, HACCP, PLE, PIMUS, MULETTO, PES, GRU, DPI, SALDATORI, ALIMENT, TUTTA, 81/08) in 6 macro-aree. Distingue prima formazione da aggiornamenti periodici (AGG).',
    bullets: [
      'Vedere distribuzione per macro-area (Documentazione, Formazione, Emergenze, Visite, Specialistico, Pacchetto)',
      'Tracciare la ricorrenza tipica del settore (quinquennali, biennali)',
      'Identificare clienti senza aggiornamento dopo il primo corso',
    ],
  },
];
