/* Manuale BU · Finanza Agevolata — sezioni Caso 2 specifiche. */
const MANUALE_BU_SECTIONS = [
  {
    sec: 'bandi', area: 'caso2', accent: 'purple', icon: '💰', title: 'Bandi & Fondi Pubblici',
    desc: 'Parser intelligente che classifica 7 bandi dal prefisso del titolo: FNC (Fondo Nuove Competenze PNRR), FON (interprofessionali), ISI INAIL, FIN (incentivi), PID Unioncamere, IND40 (Industria 4.0), INCENT (assunzioni). Per FIA il dato chiave è "Da Incassare": i bandi pubblici liquidano a fine progetto, quindi daInc≈Ricavi e rappresenta la pipeline futura.',
    bullets: [
      'Monitorare pipeline pianificata per bando',
      'Vedere "Da Incassare" come pipeline incassi futura',
      'Distinguere bandi PNRR da fondi interprofessionali',
    ],
  },
];
