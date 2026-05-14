/* Manuale BU · Politiche Attive — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'gol', area: 'caso2', accent: 'cyan', icon: '🏃', title: 'GOL & Politiche Attive',
    desc: 'APL_PAL è essenzialmente GOL (94%). Parser che aggrega le 23 fasi distinte di statoLav (PAL_1.x → 2.x → 3.x → 4.x → TIROCINI) in un funnel a 6 step: Avvio → Documenti → Pagamento → Concluso PAL → Tirocinio attivo → Tirocinio concluso. Estrae automaticamente nome beneficiario e città dal titolo.',
    bullets: [
      'Identificare PAL Conclusi non liquidati dalla Regione',
      'Vedere tirocini attivi da > 180 giorni senza chiusura',
      'Distribuire beneficiari per città di erogazione',
    ],
  },
];
