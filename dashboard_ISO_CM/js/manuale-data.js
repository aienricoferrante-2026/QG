/* Manuale BU · Certificazioni ISO — sezioni Caso 2 specifiche.
   Le sezioni del kit (Esplora, Executive, ecc.) sono già in section-manuale.js. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'enti', area: 'caso2', accent: 'blue', icon: '🏆', title: 'Enti di Riferimento',
    desc: 'Distribuzione delle certificazioni per Ente certificatore (DNV, RINA, Bureau Veritas, ecc.). Per ogni ente: numero commesse, ricavi, top standard certificati. Utile per pianificare gli affidamenti e negoziare le tariffe.',
    bullets: [
      'Vedere il portafoglio di ogni ente certificatore',
      'Confrontare ricavi per ente',
      'Identificare ente prevalente per standard',
    ],
  },
  {
    sec: 'audit', area: 'caso2', accent: 'amber', icon: '🔍', title: 'Audit & Verifiche',
    desc: 'Pianificazione audit di certificazione, sorveglianze e ricertificazioni. Distingue audit "In Ritardo" (data verifica passata) da audit prossimi (entro 30/60/90 giorni). Confronto data pianificata vs effettiva per misurare la puntualità.',
    bullets: [
      'Vedere audit in ritardo e da pianificare',
      'Tracciare urgenze emissione certificato',
      'Misurare gap data pianificata vs effettiva',
    ],
  },
  {
    sec: 'certificati', area: 'caso2', accent: 'emerald', icon: '📝', title: 'Stato Certificato',
    desc: 'Fase del ciclo certificazione: Prima Emissione → I/II/III Sorveglianza → Ricertificazione → IV/V Sorveglianza. Permette di vedere dove sta ogni cliente nel triennio (utile per il forecast del rinnovo).',
    bullets: [
      'Distinguere prime emissioni da ricertificazioni',
      'Pianificare il triennio dei rinnovi',
      'Vedere ente prevalente per fase',
    ],
  },
  {
    sec: 'pagamenti', area: 'caso2', accent: 'rose', icon: '💰', title: 'Pagamenti & Accordi',
    desc: 'Stato pagamento con codici semaforo: Verde (saldato), Giallo (da iniziare), Blu (accordi rateali), Rosso (insoluto anno precedente), Arancione (acconto). Sezione con alert dedicato per insoluti senza accordo formalizzato.',
    bullets: [
      'Recuperare crediti su insoluti senza accordo',
      'Tracciare accordi di pagamento rateali',
      'Sbloccare le commesse "da iniziare"',
    ],
  },
  {
    sec: 'scopo', area: 'caso2', accent: 'cyan', icon: '📋', title: 'Scopo proposto vs uscita',
    desc: 'Confronto tra "Scopo proposto" iniziale e "Scopo in uscita" effettivamente certificato. Le commesse con scopo differente segnalano ambiti ristretti o estesi durante la lavorazione. Copertura limitata (~1.7% scopo in uscita popolato).',
    bullets: [
      'Identificare scopi ristretti durante l\'audit',
      'Vedere top scopi proposti più frequenti',
      'Trovare mismatch tra proposto e ottenuto',
    ],
  },
];
