/* Manuale BU · Formazione (FOR) — sezioni autonome (FOR non usa il kit).
   Innesto additivo: NON modifica gli altri file FOR. */

const FOR_MANUALE_AREE = [
  { id: 'esplora',    label: '🔍 Esplora & Sintesi',       desc: 'Vista d\'insieme dei numeri Formazione.' },
  { id: 'finanza',    label: '💰 Finanza',                 desc: 'Ricavi, MOL, costi, cessione credito.' },
  { id: 'corsi',      label: '🎓 Corsi & Discenti',        desc: 'Specifiche operative dei corsi.' },
  { id: 'anagrafica', label: '📇 Anagrafiche',             desc: 'Clienti/Enti, sedi, responsabili.' },
  { id: 'stato',      label: '⚙️ Stato lavorazione',       desc: 'Avanzamento e alert.' },
  { id: 'tools',      label: '🛠 Strumenti',               desc: 'Link partner, wiki.' },
];

const FOR_MANUALE_SECTIONS = [
  {
    sec: 'explore', area: 'esplora', accent: 'blue', icon: '🔍', title: 'Esplora',
    desc: 'Vista multi-dimensionale dei dati FOR: combina dimensione (sede, cliente, corso, responsabile, statoCorso) con metrica (commesse, ricavi, discenti, ore). Ha dimensioni FOR-specifiche e 4 preset dedicati alla formazione.',
    bullets: [
      'Combinare statoCorso × statoClasse × cliente',
      'Vedere ore e discenti come metriche',
      'Confrontare due periodi (A/B) per trend',
    ],
  },
  {
    sec: 'executive', area: 'esplora', accent: 'emerald', icon: '■', title: 'Executive Summary',
    desc: 'Sintesi della BU Formazione: ricavi, MOL, % incasso, esposizione residua, top corsi, distribuzione stato. Pensato per la direzione che apre la dashboard al mattino.',
    bullets: [
      'Vedere ricavi e margine in un colpo d\'occhio',
      'Identificare i corsi più redditizi',
      'Controllare classi aperte vs concluse',
    ],
  },
  {
    sec: 'ricavi', area: 'finanza', accent: 'emerald', icon: '€', title: 'Ricavi & MOL',
    desc: 'Andamento temporale di ricavi (Importo Consulenza) e MOL. Trend per mese/anno, distribuzione per sede, top corsi per ricavo.',
    bullets: [
      'Vedere il trend ricavi mese per mese',
      'Identificare picchi stagionali',
      'Distribuire ricavi per sede e regione',
    ],
  },
  {
    sec: 'econFin', area: 'finanza', accent: 'purple', icon: '📊', title: 'Econ. & Finanziario',
    desc: 'Vista contabile FOR: Ricavi, Costi diretti (campo `costi` popolato al 95% per FOR — unica BU), MOL, % margine. Include il blocco "Analisi Incassi" embeddato con esposizione e clienti a rischio.',
    bullets: [
      'Confrontare ricavi consuntivo vs documentati',
      'Vedere costi diretti per corso (FOR è l\'unica BU con costi popolati)',
      'Analizzare incassi e clienti a rischio',
    ],
  },
  {
    sec: 'specEcon', area: 'finanza', accent: 'cyan', icon: '⛵', title: 'Specifica Economica',
    desc: 'Dettaglio economico per commessa: anticipi, saldi, decreti regionali, importi richiesti vs incassati. Vista contabile dettagliata che spiega lo scostamento tra ricavi previsti ed effettivi.',
    bullets: [
      'Vedere anticipi e saldi per commessa',
      'Tracciare decreti di pagamento regionali',
      'Misurare lo scostamento ricavi previsti/effettivi',
    ],
  },
  {
    sec: 'cessione', area: 'finanza', accent: 'amber', icon: '₽', title: 'Cessione Credito',
    desc: 'Pratiche di cessione del credito (formazione finanziata): clienti che cedono il credito a Qualifica per ottenere liquidità immediata. Vista delle pratiche aperte, importi ceduti, tempi medi.',
    bullets: [
      'Vedere pratiche di cessione in corso',
      'Tracciare importi ceduti e netto incassato',
      'Identificare clienti ricorrenti per cessione',
    ],
  },
  {
    sec: 'corsi', area: 'corsi', accent: 'emerald', icon: '▶', title: 'Corsi',
    desc: 'Vista operativa dei corsi: Stato Corso (Pianificato/Avviato/Concluso/Annullato), Stato Classe, numero discenti, ore erogate. Cuore operativo del back-office FOR.',
    bullets: [
      'Filtrare corsi per Stato Corso e Stato Classe',
      'Vedere discenti e ore per ogni corso',
      'Tracciare lo stato delle classi',
    ],
  },
  {
    sec: 'responsabili', area: 'anagrafica', accent: 'slate', icon: '⚙', title: 'Responsabili',
    desc: 'Vista per tutor/responsabile della commessa formativa. Carico per persona, ricavi gestiti, status. Il `responsabile` è il tutor d\'aula (non il commerciale).',
    bullets: [
      'Vedere quante commesse gestisce ogni tutor',
      'Distribuire il carico per persona',
      'Identificare tutor sotto/sovraccarichi',
    ],
  },
  {
    sec: 'clienti', area: 'anagrafica', accent: 'blue', icon: '◉', title: 'Clienti / Enti',
    desc: 'Tabella clienti (aziende) e enti committenti con numero commesse, ricavi cumulati, % incasso, esposizione. Per la fidelizzazione e priorità commerciale.',
    bullets: [
      'Trovare top clienti per ricavi',
      'Vedere enti committenti più frequenti',
      'Analizzare frequenza ordini',
    ],
  },
  {
    sec: 'sedi', area: 'anagrafica', accent: 'slate', icon: '▼', title: 'Sedi',
    desc: 'Distribuzione geografica per sede operativa e regione. Per la pianificazione delle risorse territoriali e la valutazione delle performance per sede.',
    bullets: [
      'Vedere ricavi e MOL per sede',
      'Confrontare performance fra sedi',
      'Distribuire per regione',
    ],
  },
  {
    sec: 'analisiCliente', area: 'anagrafica', accent: 'blue', icon: '☰', title: 'Analisi Cliente',
    desc: 'Drill-down approfondito su un singolo cliente: storia commesse, mix corsi, andamento temporale, stato pagamenti. Utile per la preparazione di incontri commerciali.',
    bullets: [
      'Selezionare un cliente e vedere il suo storico',
      'Analizzare il mix corsi per cliente',
      'Preparare riunioni commerciali',
    ],
  },
  {
    sec: 'avanzamento', area: 'stato', accent: 'amber', icon: '⏱', title: 'Avanzamento',
    desc: 'Stato di avanzamento delle commesse FOR aperte: % completamento, durata, ritardi rispetto alla data fine pianificata.',
    bullets: [
      'Vedere lavorazioni in corso',
      'Identificare commesse stalled',
      'Tracciare tempi medi di chiusura',
    ],
  },
  {
    sec: 'alert', area: 'stato', accent: 'rose', icon: '⚠', title: 'Alert & Anomalie',
    desc: 'Controlli automatici sui dati FOR: anomalie di stato, ritardi, esposizione clienti, MOL negativo. Auto-hide se nessuna anomalia.',
    bullets: [
      'Vedere anomalie da risolvere in Qnet',
      'Recuperare crediti su commesse chiuse',
      'Sbloccare lavorazioni dimenticate',
    ],
  },
  {
    sec: 'linkPartner', area: 'tools', accent: 'cyan', icon: '🔗', title: 'Link Partner',
    desc: 'Mini-dashboard pubbliche da inviare ai partner di sede FOR. Ogni partner accede solo ai suoi dati senza login. Token URL personalizzato.',
    bullets: [
      'Generare link mirati per ogni partner',
      'Inviare report periodici via email',
      'Tracciare quali partner hanno accesso',
    ],
  },
  {
    sec: 'wiki', area: 'tools', accent: 'slate', icon: '?', title: 'Wiki / Guida',
    desc: 'Manuale Q&A con 23 voci cercabili, glossario dei termini chiave FOR, mappa visuale dei flussi formazione, formule dei KPI calcolate sul filtro corrente.',
    bullets: [
      'Cercare la definizione di un KPI',
      'Capire come è calcolato un numero',
      'Vedere il mapping dei campi JSON',
    ],
  },
];
