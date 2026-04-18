/* ── Export Excel Cessione del Credito ── */

function _mesiTra(dStart, dEnd) {
  if (!dStart || !dEnd) return 0;
  try {
    // Le date nel JSON sono in formato "DD-MM-YYYY"
    const parse = s => {
      const p = String(s).split(/[-\/]/);
      if (p.length !== 3) return null;
      return new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
    };
    const d1 = parse(dStart), d2 = parse(dEnd);
    if (!d1 || !d2 || isNaN(d1) || isNaN(d2)) return 0;
    const mesi = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
    return Math.max(1, mesi);
  } catch (e) { return 0; }
}

function exportExcelCessione() {
  if (typeof XLSX === 'undefined') {
    alert('Libreria Excel non caricata. Ricarica la pagina.');
    return;
  }

  const items = filtered;
  if (!items.length) {
    alert('Nessuna commessa da esportare. Modifica i filtri.');
    return;
  }

  // Costruisci righe con i campi richiesti per la cessione del credito
  const rows = items.map(c => {
    const mesi = _mesiTra(c.dataInizio, c.dataFine);
    const salMedio = mesi > 0 ? (c.consulenza / mesi) : c.consulenza;
    return {
      'Debitore Ceduto': (c.cliente || '').replace(/_FOR/g, '').trim(),
      'Codice fiscale': '',
      'Data inizio contratto': c.dataInizio || '',
      'Data fine contratto': c.dataFine || '',
      'Importo complessivo contratto': c.consulenza || 0,
      'Importo medio SAL (fatturazione mensile)': Math.round(salMedio * 100) / 100,
      "Modalità e termini d'incasso gg": '',
      'DSO tempi di incasso reali (gg)': '',
      'PLAFOND RICHIESTO': c.daIncassare || 0,
      'ID Commessa': c.id,
      'Contratto': c.contratto || '',
      'Corso': c.corso || '',
      'Responsabile': c.responsabile || '',
      'Società Aziendale': c.societa || '',
      'Sede Operativa': c.sedeOp || '',
      'Status': c.status || '',
      'Stato Corso': c.statoCorso || '',
      'Già Incassato': c.giaIncassato || 0,
      'Da Incassare': c.daIncassare || 0
    };
  });

  // Crea il workbook
  const ws = XLSX.utils.json_to_sheet(rows);

  // Imposta larghezza colonne
  const colWidths = [
    { wch: 35 }, // Debitore
    { wch: 18 }, // CF
    { wch: 18 }, // Data inizio
    { wch: 18 }, // Data fine
    { wch: 20 }, // Importo complessivo
    { wch: 22 }, // SAL medio
    { wch: 22 }, // Modalità incasso
    { wch: 20 }, // DSO
    { wch: 18 }, // Plafond
    { wch: 12 }, // ID
    { wch: 20 }, // Contratto
    { wch: 35 }, // Corso
    { wch: 25 }, // Responsabile
    { wch: 30 }, // Societa
    { wch: 30 }, // Sede Op
    { wch: 15 }, // Status
    { wch: 20 }, // Stato Corso
    { wch: 15 }, // Già Incassato
    { wch: 15 }  // Da Incassare
  ];
  ws['!cols'] = colWidths;

  // Formattazione numerica per le colonne importi (E, F, I, R, S = indici 4, 5, 8, 17, 18)
  const numFmt = '#,##0.00 "€"';
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    [4, 5, 8, 17, 18].forEach(c => {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'number') cell.z = numFmt;
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cessione Credito');

  // Nome file con data
  const now = new Date();
  const dStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  XLSX.writeFile(wb, 'Cessione_Credito_Formazione_' + dStr + '.xlsx');
}
