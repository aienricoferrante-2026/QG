/* ── Manuale d'Uso · Hub root ──
 * Pattern "Guida visiva": ogni voce è una card che spiega cosa fa
 * una dashboard/strumento, a chi serve, cosa puoi farci.
 *
 * Schema item:
 *   {
 *     href:      string  // path della dashboard (o '#' per non-link)
 *     title:     string
 *     icon:      string  // emoji
 *     desc:      string  // 2-4 righe discorsive
 *     bullets:   string[] // 3 verbi all'infinito "cosa puoi fare qui"
 *     accent:    'blue'|'emerald'|'amber'|'purple'|'cyan'|'rose'|'slate'
 *     badge:     string? // 'NUOVO' | 'LEGACY' | 'BETA' ecc.
 *     area:      string  // raggruppamento per chip ancore
 *   }
 *
 * Palette accent semantica (vedi MEMORY.md pattern_manuale_uso_dashboard):
 *   blue    = neutro / metriche generali
 *   emerald = completato / positivo
 *   amber   = WIP / warning / in attesa
 *   purple  = financial / costi
 *   cyan    = tempo / ore
 *   rose    = critico / anomalie
 *   slate   = configurazioni / sistema
 */

const MANUALE_AREE = [
  { id: 'core',       label: '🎯 Settori operativi core',  desc: 'Le BU di consulenza che generano ricavi diretti.' },
  { id: 'bandi',      label: '📋 Compliance, bandi e fondi pubblici', desc: 'Aree regolate, finanziamenti pubblici, conformità.' },
  { id: 'lavoro',     label: '🏃 Politiche attive del lavoro',   desc: 'PNRR, GOL, ricerca&selezione, beneficiari.' },
  { id: 'direzione',  label: '📊 Strumenti direzionali',    desc: 'Vista cross-BU per la direzione e i partner di sede.' },
  { id: 'supporto',   label: '🛠 Strumenti di supporto',     desc: 'Pipeline opportunità, offerte, gestione operativa.' },
];

const MANUALE_SECTIONS = [
  /* ── Settori operativi core ── */
  {
    href: 'dashboard_FOR_CM/', title: 'Formazione (FOR)', icon: '🎓', accent: 'emerald', area: 'core',
    desc: 'La BU più grande del Gruppo (1.346 commesse). Gestisce corsi finanziati, formazione obbligatoria, cessione del credito, classi e discenti. Ha una dashboard storica autonoma molto ricca (fork interno) con Stato Corso, Stato Classe, Wiki Q&A e mini-dashboard partner per sede.',
    bullets: [
      'Monitorare ricavi, MOL, incasso per corso e per sede',
      'Vedere stato classi (Da pianificare, In corso, Concluse, Annullate)',
      'Analizzare partner e operatori GOL per regione',
    ],
  },
  {
    href: 'dashboard_ISO_CM/', title: 'Certificazioni ISO (ISO)', icon: '📜', accent: 'blue', area: 'core',
    desc: 'Il settore con il volume di commesse più alto (6.185). Gestisce audit di certificazione, sorveglianze e ricertificazioni triennali per standard 9001/14001/45001 e altri. Cinque sezioni Caso 2 dedicate: Enti certificatori, Audit & verifiche, Stato certificato, Pagamenti & accordi, Scopo proposto vs uscita.',
    bullets: [
      'Pianificare audit di sorveglianza in scadenza',
      'Distinguere Prima Emissione / Sorveglianze / Ricertificazione',
      'Recuperare insoluti anno precedente (semaforo Giallo-Rosso)',
    ],
  },
  {
    href: 'dashboard_SIC_CM/', title: 'Sicurezza Lavoro (SIC)', icon: '🛡️', accent: 'cyan', area: 'core',
    desc: 'Sicurezza sul lavoro D.Lgs. 81/08: RSPP, formazione obbligatoria lavoratori, addetti antincendio e primo soccorso, visite mediche, DVR. 2.613 commesse. Parser intelligente del titolo che classifica 21 sigle (DVR, RSPP, RLS, ART37, APS, ADE, FORM, ecc.) in 6 macro-aree.',
    bullets: [
      'Distinguere prima formazione da aggiornamenti periodici (AGG)',
      'Vedere distribuzione per area (Documentazione, Formazione, Emergenze, Visite)',
      'Tracciare scadenze quinquennali tipiche del settore',
    ],
  },
  {
    href: 'dashboard_SOA_CM/', title: 'Attestazioni SOA (SOA)', icon: '🏗️', accent: 'amber', area: 'core',
    desc: 'Qualificazione SOA per lavori pubblici (OG/OS). 613 commesse con 5 sezioni Caso 2: Attestanti, Enti 9001, Consorzio, Firma contratto, Aggiornamento settimanale. Settore con cadenza triennale per il rinnovo.',
    bullets: [
      'Monitorare attestazioni in scadenza e rinnovi',
      'Aggiornare lo stato settimanale di ogni pratica',
      'Vedere consorzi e enti 9001 collegati',
    ],
  },
  {
    href: 'dashboard_AVV_CM/', title: 'Avvalimenti (AVV)', icon: '🤝', accent: 'blue', area: 'core',
    desc: 'Avvalimenti per gare d\'appalto: l\'impresa ausiliaria mette a disposizione capacità tecnico-economiche dell\'impresa che partecipa al bando. 328 commesse. Parser del titolo estrae Categoria SOA (OG/OS), Tipo (Standard/RTI/Manifestazione/Pacchetto), CIG, Anno.',
    bullets: [
      'Trovare avvalimenti con CIG e tracciare bandi specifici',
      'Vedere distribuzione per categoria SOA e tipo',
      'Analizzare RTI e pacchetti di avvalimento',
    ],
  },
  {
    href: 'dashboard_GAR_CM/', title: 'Gare d\'appalto (GAR)', icon: '🎯', accent: 'amber', area: 'core',
    desc: 'Pipeline gare d\'appalto pubbliche: CIG, Ente Appaltante, Data Scadenza, Importo Gara, Esito (vinto/perso/aggiudicato). 325 commesse, copertura campi gara ~9% (da popolare meglio in Qnet). Funnel pipeline Aperta → Esitata → Scaduta.',
    bullets: [
      'Vedere gare aperte e scadenze imminenti',
      'Analizzare top Enti Appaltanti per importo',
      'Distinguere gare esitate da scadute senza esito',
    ],
  },

  /* ── Compliance, bandi e fondi pubblici ── */
  {
    href: 'dashboard_GDPR_CM/', title: 'Privacy / GDPR', icon: '🔒', accent: 'rose', area: 'bandi',
    desc: 'Consulenze privacy e adempimenti GDPR. 695 commesse. Sezione dedicata Pagamenti & Accordi con stato pagamento semaforo (Verde/Giallo/Blu/Rosso) e accordi di rientro. Alert specifici per insoluti senza accordo formalizzato.',
    bullets: [
      'Recuperare crediti su consulenze privacy non saldate',
      'Tracciare accordi di pagamento rateali',
      'Monitorare ricorrenze (rinnovo DPO, audit periodici)',
    ],
  },
  {
    href: 'dashboard_FIA_CM/', title: 'Finanza Agevolata (FIA)', icon: '💰', accent: 'purple', area: 'bandi',
    desc: 'Bandi pubblici e fondi agevolati: FNC (Fondo Nuove Competenze PNRR), ISI INAIL, Fondi interprofessionali, Incentivi assunzioni, PID Unioncamere, Industria 4.0. 276 commesse, classificate al 94% dal parser del titolo. Focus su pipeline pianificata e Da Incassare (i bandi liquidano a fine progetto).',
    bullets: [
      'Distinguere FNC / ISI / FON / FIN / PID / IND40',
      'Vedere quanto è atteso in incasso per bando',
      'Pianificare nuove pratiche da avviare',
    ],
  },
  {
    href: 'dashboard_IST_CM/', title: 'Istituti scolastici (IST)', icon: '🏛️', accent: 'slate', area: 'bandi',
    desc: 'Servizi a scuole e istituti: Mentoring & Orientamento (DM170/DM19), PNRR Scuola 4.0, Consulenza Italia Scuola, competenze curriculari/extracurriculari, progetto iScola. Volume modesto (52 commesse) ma classificate al 94% con regex tolleranti ai typo (MENTORIGN, CORRUCULARI, ISTR_).',
    bullets: [
      'Vedere bandi ministeriali attivi (DM170, DM19, DM66, DM88)',
      'Distinguere mentoring da forniture digitali Scuola 4.0',
      'Tracciare consulenze di rendicontazione',
    ],
  },

  /* ── Politiche attive del lavoro ── */
  {
    href: 'dashboard_APL_PAL_CM/', title: 'Politiche Attive Lavoro (APL_PAL)', icon: '💼', accent: 'cyan', area: 'lavoro',
    desc: 'Garanzia Occupabilità Lavoratori (PNRR) e politiche attive: il 94% delle 1.415 commesse è GOL con un funnel amministrativo dettagliato in 23 fasi (PAL_1.x → 2.x → 3.x → 4.x → TIROCINI). Estrae automaticamente nome beneficiario e città dal titolo della commessa.',
    bullets: [
      'Vedere il funnel a 6 step (Avvio → Documenti → Pagamento → Concluso → Tirocinio attivo → Concluso)',
      'Identificare PAL Conclusi non liquidati dalla Regione',
      'Tracciare beneficiari per città di erogazione',
    ],
  },
  {
    href: 'dashboard_APL_RES_CM/', title: 'PAL Risorse (APL_RES)', icon: '👥', accent: 'emerald', area: 'lavoro',
    desc: 'Ricerca & Selezione personale + Segreterie didattiche. 154 commesse. Funnel R&S a 6 fasi derivato dal campo statoLav scritto in italiano (Annuncio → Screening → Shortlist → Colloquio → Contratto → Conclusa).',
    bullets: [
      'Vedere ricerche aperte e candidati in shortlist',
      'Tracciare contratti accettati e iter conclusi',
      'Distinguere R&S vere da Segreteria Didattica e proposte',
    ],
  },

  /* ── Strumenti direzionali ── */
  {
    href: 'dashboard_ADMIN/', title: 'STW Admin · Import Massivo', icon: '📥', accent: 'rose', area: 'direzione', badge: 'NUOVO',
    desc: 'Centralina che permette di caricare con drag&drop gli Excel di tutte le 11 BU + Offerte + Opportunità FOR in un colpo solo. Riconosce la BU dal nome file e fa upsert su Supabase (qualifica-stw). Accesso protetto da login Master.',
    bullets: [
      'Caricare più Excel/CSV insieme (auto-detect BU)',
      'Vedere il totale record presenti in Supabase',
      'Sostituire l\'upload manuale dashboard-per-dashboard',
    ],
  },
  {
    href: 'dashboard_COGE/', title: 'COGE — Conto Economico', icon: '📊', accent: 'purple', area: 'direzione', badge: 'NUOVO',
    desc: 'Vista direzionale Società × Sede × BU per il conto economico operativo. Aggrega ricavi dalle 11 BU + costi dipendenti (da WeA HR + Segnatempo cascata L1/L2/L3) + costi indiretti per Sede. Pensata per generare report da inviare ai partner di sede.',
    bullets: [
      'Pivottare bilancino per Sede, BU, Società, Regione',
      'Imputare costi su commessa via Segnatempo (cascata 3 livelli)',
      'Caricare costi indiretti (affitti, utenze) per ogni Sede',
    ],
  },
  {
    href: '#crossSector', title: 'Confronto cross-settore', icon: '📊', accent: 'blue', area: 'direzione',
    desc: 'Tabella comparativa delle 11 BU su 8 metriche (Commesse, Ricavi, MOL, Margine %, % Incasso, Da Incassare, Clienti). Ordinabile per colonna, bar chart ricavi e margine %, top clienti cross-BU (clienti presenti in 2+ settori), audit completezza dati per BU con celle colorate.',
    bullets: [
      'Confrontare ricavi e margini delle 11 BU',
      'Identificare clienti trasversali (presenti in più settori)',
      'Vedere gap di popolamento dati per BU',
    ],
  },

  /* ── Strumenti di supporto ── */
  {
    href: 'dashboard_FOR_OPP/', title: 'Opportunità Formazione GOL', icon: '🎯', accent: 'emerald', area: 'supporto',
    desc: 'Pipeline opportunità di Formazione collegate ai GOL: corsi, CPI di riferimento, operatori autorizzati, beneficiari potenziali. Strumento commerciale per gestire la pre-vendita prima che diventi commessa formativa.',
    bullets: [
      'Vedere opportunità per regione e operatore',
      'Tracciare corsi pianificati e da pianificare',
      'Collegare beneficiari ai CPI di pertinenza',
    ],
  },
  {
    href: 'dashboard_offerte/', title: 'Offerte commerciali', icon: '📋', accent: 'blue', area: 'supporto',
    desc: 'Pipeline offerte commerciali in lavorazione: conversioni preventivi → commesse, analisi del lead time, performance per agente commerciale. Vista trasversale alle BU per la direzione commerciale.',
    bullets: [
      'Monitorare offerte aperte e tassi di conversione',
      'Analizzare performance dei commerciali',
      'Vedere lead time medio dall\'offerta alla commessa',
    ],
  },
  {
    href: 'webapp_formazione/', title: 'Gestione Corsi FOR', icon: '🎓', accent: 'slate', area: 'supporto',
    desc: 'Webapp operativa per la gestione interna dei corsi Formazione: offerte, commesse, discenti, ODA (ordini di acquisto), notule docenti. È lo strumento di data-entry quotidiano del back-office FOR.',
    bullets: [
      'Inserire e modificare anagrafiche discenti',
      'Gestire ODA verso docenti e fornitori',
      'Emettere notule e tracciare pagamenti',
    ],
  },
];
