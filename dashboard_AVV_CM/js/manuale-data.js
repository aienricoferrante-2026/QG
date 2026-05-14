/* Manuale BU · Avvalimenti — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'avvalimenti', area: 'caso2', accent: 'blue', icon: '🤝', title: 'Avvalimenti',
    desc: 'Metadati estratti dal titolo della commessa tramite il parser avv_parser.py: Categoria SOA (OG/OS), Tipo (Standard/RTI/Manifestazione/Pacchetto), CIG di gara, Anno. Copertura: ~95% Tipo, ~40% Anno, ~18% Categoria, ~6% CIG. Utile per analisi delle gare in cui partecipiamo come impresa ausiliaria.',
    bullets: [
      'Filtrare avvalimenti per categoria SOA (OG1, OS4, ecc.)',
      'Distinguere RTI da Manifestazioni e Pacchetti',
      'Trovare avvalimenti con CIG per tracciare gare specifiche',
    ],
  },
];
