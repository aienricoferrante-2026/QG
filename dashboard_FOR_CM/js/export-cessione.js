/* ── Export Excel Cessione del Credito (multi-sheet per Status) ── */

function _parseDate(s) {
  if (!s) return null;
  const p = String(s).split(/[-\/]/);
  if (p.length !== 3) return null;
  const d = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
  return isNaN(d) ? null : d;
}

function _durataCorso(dStart, dEnd) {
  const d1 = _parseDate(dStart), d2 = _parseDate(dEnd);
  if (!d1 || !d2) return { giorni: 0, mesi: 0, testo: '' };
  const giorni = Math.max(1, Math.round((d2 - d1) / 86400000));
  const mesi = Math.max(1, (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth()));
  const testo = giorni >= 30 ? mesi + ' mesi' : giorni + ' giorni';
  return { giorni, mesi, testo };
}

function _buildRiga(c) {
  const d = _durataCorso(c.dataInizio, c.dataFine);
  const salMedio = d.mesi > 0 ? (c.consulenza / d.mesi) : c.consulenza;
  return {
    'Debitore Ceduto': (c.societa || '').trim(),
    'Società P.IVA': '',
    '€ Corso': Math.round((c.consulenza || 0) * 100) / 100,
    'Corso Data Inizio': c.dataInizio || '',
    'Corso Data Fine': c.dataFine || '',
    'Durata Corso (mesi)': d.mesi,
    'Durata Corso (giorni)': d.giorni,
    'SAL Medio': Math.round(salMedio * 100) / 100,
    // Colonne di contesto
    'Status': c.status || 'N/D',
    'Stato Corso': c.statoCorso || '',
    'Cliente / Ente': (c.cliente || '').replace(/_FOR/g, '').trim(),
    'Corso': c.corso || '',
    'ID Commessa': c.id,
    'Contratto': c.contratto || '',
    'Responsabile': c.responsabile || '',
    'Sede Operativa': c.sedeOp || '',
    'Già Incassato': c.giaIncassato || 0,
    'Da Incassare': c.daIncassare || 0
  };
}

function _applyColWidths(ws) {
  ws['!cols'] = [
    { wch: 40 }, // Debitore
    { wch: 16 }, // P.IVA
    { wch: 14 }, // € Corso
    { wch: 18 }, // Data Inizio
    { wch: 18 }, // Data Fine
    { wch: 16 }, // Durata mesi
    { wch: 18 }, // Durata giorni
    { wch: 14 }, // SAL Medio
    { wch: 16 }, // Status
    { wch: 22 }, // Stato Corso
    { wch: 35 }, // Cliente
    { wch: 45 }, // Corso
    { wch: 12 }, // ID
    { wch: 20 }, // Contratto
    { wch: 25 }, // Responsabile
    { wch: 35 }, // Sede Op
    { wch: 15 }, // Già Incassato
    { wch: 15 }  // Da Incassare
  ];
}

function _applyNumFmt(ws) {
  const numFmt = '#,##0.00 "€"';
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    [2, 7, 16, 17].forEach(c => { // € Corso, SAL Medio, Già Incassato, Da Incassare
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'number') cell.z = numFmt;
    });
  }
}

function _safeSheetName(s) {
  return String(s || 'N_D').replace(/[\\\/\?\*\[\]:]/g, '').substring(0, 31);
}

function exportExcelCessione() {
  if (typeof XLSX === 'undefined') {
    alert('Libreria Excel non caricata. Ricarica la pagina.');
    return;
  }
  const items = filtered;
  if (!items.length) { alert('Nessuna commessa da esportare. Modifica i filtri.'); return; }

  // Raggruppa per Status
  const byStatus = {};
  items.forEach(c => {
    const k = c.status || 'N/D';
    if (!byStatus[k]) byStatus[k] = [];
    byStatus[k].push(c);
  });

  const wb = XLSX.utils.book_new();

  // Foglio 1: TUTTI (tutti gli status in un unico foglio, ordinato per status)
  const allRows = [...items].sort((a, b) => (a.status || '').localeCompare(b.status || '')).map(_buildRiga);
  const wsAll = XLSX.utils.json_to_sheet(allRows);
  _applyColWidths(wsAll);
  _applyNumFmt(wsAll);
  XLSX.utils.book_append_sheet(wb, wsAll, 'TUTTI');

  // Un foglio per ogni Status (in ordine di numerosità decrescente)
  const statusOrder = Object.keys(byStatus).sort((a, b) => byStatus[b].length - byStatus[a].length);
  statusOrder.forEach(st => {
    const rows = byStatus[st].map(_buildRiga);
    const ws = XLSX.utils.json_to_sheet(rows);
    _applyColWidths(ws);
    _applyNumFmt(ws);
    const sheetName = _safeSheetName(st + ' (' + byStatus[st].length + ')');
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  // Foglio RIEPILOGO
  const summary = statusOrder.map(st => {
    const arr = byStatus[st];
    const tot = arr.reduce((s, c) => s + (c.consulenza || 0), 0);
    const inc = arr.reduce((s, c) => s + (c.giaIncassato || 0), 0);
    const daInc = arr.reduce((s, c) => s + (c.daIncassare || 0), 0);
    return {
      'Status': st,
      'N. Commesse': arr.length,
      'Totale € Corsi': Math.round(tot * 100) / 100,
      'Già Incassato': Math.round(inc * 100) / 100,
      'Da Incassare': Math.round(daInc * 100) / 100,
      '% sul totale': (arr.length / items.length * 100).toFixed(1) + '%'
    };
  });
  // Aggiungi riga totale
  summary.push({
    'Status': 'TOTALE',
    'N. Commesse': items.length,
    'Totale € Corsi': Math.round(items.reduce((s, c) => s + (c.consulenza || 0), 0) * 100) / 100,
    'Già Incassato': Math.round(items.reduce((s, c) => s + (c.giaIncassato || 0), 0) * 100) / 100,
    'Da Incassare': Math.round(items.reduce((s, c) => s + (c.daIncassare || 0), 0) * 100) / 100,
    '% sul totale': '100%'
  });
  const wsSummary = XLSX.utils.json_to_sheet(summary);
  wsSummary['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
  const numFmt = '#,##0.00 "€"';
  const range = XLSX.utils.decode_range(wsSummary['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    [2, 3, 4].forEach(c => {
      const cell = wsSummary[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'number') cell.z = numFmt;
    });
  }
  // Sposta il riepilogo in prima posizione
  wb.SheetNames.unshift(wb.SheetNames.pop());
  wb.Sheets['RIEPILOGO'] = wsSummary;
  wb.SheetNames.unshift('RIEPILOGO');
  // Rimuove duplicati se aggiunti due volte
  wb.SheetNames = [...new Set(wb.SheetNames)];
  // Rifaccio l'ordine: RIEPILOGO, TUTTI, poi un foglio per status
  delete wb.Sheets['RIEPILOGO'];
  wb.Sheets['RIEPILOGO'] = wsSummary;
  const finalOrder = ['RIEPILOGO', 'TUTTI', ...statusOrder.map(st => _safeSheetName(st + ' (' + byStatus[st].length + ')'))];
  wb.SheetNames = finalOrder.filter(n => wb.Sheets[n]);

  const now = new Date();
  const dStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  XLSX.writeFile(wb, 'Cessione_Credito_Formazione_' + dStr + '.xlsx');
}
