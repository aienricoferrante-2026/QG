/* Manuale BU · Attestazioni SOA — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'soaAttestanti', area: 'caso2', accent: 'amber', icon: '🏗️', title: 'Attestanti',
    desc: 'Vista per Ente Attestatore (SOATECH, ConSOA, ecc.) con numero attestazioni emesse, ricavi cumulati, top categorie OG/OS. Distribuzione del portafoglio SOA per ente.',
    bullets: [
      'Vedere ricavi e attestazioni per ente attestatore',
      'Identificare ente attestatore prevalente',
      'Confrontare le tariffe negoziate',
    ],
  },
  {
    sec: 'entiCert9001', area: 'caso2', accent: 'blue', icon: '📜', title: 'Enti 9001',
    desc: 'Ente di certificazione ISO 9001 collegato all\'attestazione SOA (richiesto per OG/OS specifiche). Vista incrociata: per ogni attestazione, ente SOA + ente 9001 di riferimento.',
    bullets: [
      'Vedere accoppiate ente SOA + ente 9001',
      'Identificare le combinazioni più frequenti',
      'Tracciare prerequisiti ISO 9001 in scadenza',
    ],
  },
  {
    sec: 'consorzio', area: 'caso2', accent: 'cyan', icon: '🤝', title: 'Consorzio',
    desc: 'Attestazioni SOA in consorzio: imprese consorziate, capofila, ripartizione categorie. Utile per gestire le pratiche di gruppo.',
    bullets: [
      'Vedere imprese coinvolte in attestazioni consortili',
      'Identificare capofila ricorrenti',
      'Distribuire le categorie tra i consorziati',
    ],
  },
  {
    sec: 'firmaContratto', area: 'caso2', accent: 'emerald', icon: '✍️', title: 'Firma Contratto',
    desc: 'Stato del processo: dalla proposta alla firma contratto SOA. Tracking dei tempi medi di chiusura, contratti non firmati da > X giorni, valore della pipeline in firma.',
    bullets: [
      'Vedere contratti in attesa di firma',
      'Misurare il lead time dalla proposta alla firma',
      'Sbloccare pratiche ferme da troppo tempo',
    ],
  },
  {
    sec: 'aggSettimanale', area: 'caso2', accent: 'rose', icon: '📆', title: 'Aggiornamento Settimanale',
    desc: 'Vista operativa del back-office SOA: cosa è successo ogni settimana, quali pratiche sono passate di fase, quali sono in stallo. Strumento di coordinamento del team.',
    bullets: [
      'Vedere movimenti settimana per settimana',
      'Identificare pratiche stalled',
      'Coordinare il team operativo SOA',
    ],
  },
];
