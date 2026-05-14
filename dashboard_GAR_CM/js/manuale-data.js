/* Manuale BU · Gare d'appalto — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'gare', area: 'caso2', accent: 'amber', icon: '🎯', title: 'Gare d\'appalto',
    desc: 'Pipeline gare pubbliche: CIG, Ente Appaltante, Data Scadenza, Importo Gara, Esito. Funnel a 3 stati (Aperta / Esitata / Scaduta) basato su data scadenza vs oggi. Copertura limitata (~9%) sui campi gara: la sezione lo dichiara esplicitamente in banner.',
    bullets: [
      'Vedere gare in scadenza imminente',
      'Analizzare top Enti Appaltanti per importo',
      'Distinguere gare aggiudicate da scadute senza esito',
    ],
  },
];
