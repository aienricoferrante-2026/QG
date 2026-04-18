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
  const residuo = (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100);
  return {
    'Debitore Ceduto': (c.societa || '').trim(),
    'Società P.IVA': '',
    '€ Corso': Math.round((c.consulenza || 0) * 100) / 100,
    'Corso Data Inizio': c.dataInizio || '',
    'Corso Data Fine': c.dataFine || '',
    'Durata Corso (mesi)': d.mesi,
    'Durata Corso (giorni)': d.giorni,
    'SAL Medio': Math.round(salMedio * 100) / 100,
    '% Avanzamento': c.avanzamento || 0,
    'Valore Residuo': Math.round(residuo * 100) / 100,
    // Colonne di contesto
    'Status': c.status || 'N/D',
    'Stato Corso': c.statoCorso || '',
    'Regione / Ente': (c.cliente || '').replace(/_FOR/g, '').trim(),
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

/* ── Aggregazione flessibile per Società / Regione / Fase ── */
function _aggFlex(items, opts) {
  // opts: { byRegione: bool, byFase: bool }
  const g = {};
  items.forEach(c => {
    const soc = (c.societa || 'N/D').trim();
    const reg = (c.cliente || 'N/D').replace(/_FOR/g, '').trim() || 'N/D';
    const fase = c.status || 'N/D';
    let k = soc;
    if (opts.byRegione) k += '|||' + reg;
    if (opts.byFase) k += '|||' + fase;
    if (!g[k]) g[k] = { soc, reg, fase, items: [] };
    g[k].items.push(c);
  });
  return Object.values(g).map(e => {
    const arr = e.items;
    const tot = arr.reduce((s, c) => s + (c.consulenza || 0), 0);
    const costi = arr.reduce((s, c) => s + (c.costi || 0), 0);
    const mol = arr.reduce((s, c) => s + (c.mol || 0), 0);
    const inc = arr.reduce((s, c) => s + (c.giaIncassato || 0), 0);
    const daInc = arr.reduce((s, c) => s + (c.daIncassare || 0), 0);
    // Avanzamento medio pesato
    let avanzW = 0, pesoW = 0;
    arr.forEach(c => { const p = c.consulenza || 0; if (p > 0) { avanzW += p * (c.avanzamento || 0); pesoW += p; } });
    const avanzMedio = pesoW > 0 ? (avanzW / pesoW) : 0;
    const residuo = arr.reduce((s, c) => s + (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100), 0);
    const row = {
      'Debitore Ceduto': e.soc,
      'Società P.IVA': ''
    };
    if (opts.byRegione) row['Regione / Ente'] = e.reg;
    if (opts.byFase) row['Fase'] = e.fase;
    row['N. Commesse'] = arr.length;
    row['€ Totale Corsi'] = Math.round(tot * 100) / 100;
    row['Costi Totali'] = Math.round(costi * 100) / 100;
    row['MOL'] = Math.round(mol * 100) / 100;
    row['Margine %'] = tot ? Math.round(mol / tot * 10000) / 100 : 0;
    row['% Avanzamento'] = Math.round(avanzMedio * 100) / 100;
    row['Valore Residuo'] = Math.round(residuo * 100) / 100;
    row['Già Incassato'] = Math.round(inc * 100) / 100;
    row['Da Incassare'] = Math.round(daInc * 100) / 100;
    return row;
  }).sort((a, b) => b['€ Totale Corsi'] - a['€ Totale Corsi']);
}

/* ── Aggregazione per Società (con o senza Fase) — legacy ── */
function _aggSocieta(items, splitByFase) {
  const g = {};
  items.forEach(c => {
    const soc = (c.societa || 'N/D').trim();
    const fase = c.status || 'N/D';
    const k = splitByFase ? (soc + '|||' + fase) : soc;
    if (!g[k]) g[k] = { soc, fase, items: [] };
    g[k].items.push(c);
  });
  return Object.values(g).map(e => {
    const arr = e.items;
    const tot = arr.reduce((s, c) => s + (c.consulenza || 0), 0);
    const costi = arr.reduce((s, c) => s + (c.costi || 0), 0);
    const mol = arr.reduce((s, c) => s + (c.mol || 0), 0);
    const inc = arr.reduce((s, c) => s + (c.giaIncassato || 0), 0);
    const daInc = arr.reduce((s, c) => s + (c.daIncassare || 0), 0);
    const dIn = arr.map(c => _parseDate(c.dataInizio)).filter(Boolean).sort((a, b) => a - b);
    const dFi = arr.map(c => _parseDate(c.dataFine)).filter(Boolean).sort((a, b) => b - a);
    const minD = dIn[0], maxD = dFi[0];
    const durata = (minD && maxD) ? Math.max(1, (maxD.getFullYear() - minD.getFullYear()) * 12 + (maxD.getMonth() - minD.getMonth())) : 0;
    const fmtD = d => d ? (String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear()) : '';
    // SAL medio pesato: media dei singoli SAL medi
    let salSum = 0, salCnt = 0;
    arr.forEach(c => {
      const d = _durataCorso(c.dataInizio, c.dataFine);
      if (d.mesi > 0) { salSum += (c.consulenza / d.mesi); salCnt++; }
    });
    const salMedio = salCnt > 0 ? (salSum / salCnt) : 0;
    const row = {
      'Debitore Ceduto': e.soc,
      'Società P.IVA': '',
    };
    if (splitByFase) row['Fase'] = e.fase;
    row['N. Commesse'] = arr.length;
    row['€ Totale Corsi'] = Math.round(tot * 100) / 100;
    row['Data Inizio (prima)'] = fmtD(minD);
    row['Data Fine (ultima)'] = fmtD(maxD);
    row['Durata Totale (mesi)'] = durata;
    row['SAL Medio'] = Math.round(salMedio * 100) / 100;
    row['Costi Totali'] = Math.round(costi * 100) / 100;
    row['MOL Totale'] = Math.round(mol * 100) / 100;
    row['Margine %'] = tot ? Math.round(mol / tot * 10000) / 100 : 0;
    row['Già Incassato'] = Math.round(inc * 100) / 100;
    row['Da Incassare'] = Math.round(daInc * 100) / 100;
    return row;
  }).sort((a, b) => b['€ Totale Corsi'] - a['€ Totale Corsi']);
}

function _applyColWidthsAgg(ws, withFase) {
  const base = [
    { wch: 40 }, // Debitore
    { wch: 16 }, // P.IVA
  ];
  if (withFase) base.push({ wch: 20 }); // Fase
  base.push(
    { wch: 14 }, // N. Commesse
    { wch: 16 }, // € Totale
    { wch: 18 }, // Data Inizio
    { wch: 18 }, // Data Fine
    { wch: 20 }, // Durata
    { wch: 14 }, // SAL Medio
    { wch: 14 }, // Costi
    { wch: 14 }, // MOL
    { wch: 14 }, // Margine %
    { wch: 14 }, // Incassato
    { wch: 14 }  // Da Incassare
  );
  ws['!cols'] = base;
}

function _applyNumFmtAgg(ws, withFase) {
  const euroFmt = '#,##0.00 "€"';
  const pctFmt = '0.00" %"';
  const offset = withFase ? 1 : 0;
  // Colonne € (€ Totale, SAL, Costi, MOL, Incassato, Da Incassare): 4,7,8,9,11,12 (senza fase: 3,6,7,8,10,11)
  const euroCols = withFase ? [4, 7, 8, 9, 11, 12] : [3, 6, 7, 8, 10, 11];
  const pctCol = withFase ? 10 : 9;
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let r = 1; r <= range.e.r; r++) {
    euroCols.forEach(c => {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      if (cell && typeof cell.v === 'number') cell.z = euroFmt;
    });
    const pCell = ws[XLSX.utils.encode_cell({ r, c: pctCol })];
    if (pCell && typeof pCell.v === 'number') pCell.z = pctFmt;
  }
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

  // Funzione helper per formattare un foglio aggregato
  const buildAggSheet = (data, opts) => {
    const ws = XLSX.utils.json_to_sheet(data);
    // Larghezze colonne
    const widths = [{ wch: 38 }, { wch: 16 }];
    if (opts.byRegione) widths.push({ wch: 28 });
    if (opts.byFase) widths.push({ wch: 20 });
    widths.push({ wch: 12 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 14 });
    ws['!cols'] = widths;
    // Formattazione numerica
    const euroFmt = '#,##0.00 "€"';
    const pctFmt = '0.00" %"';
    const keys = Object.keys(data[0] || {});
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let r = 1; r <= range.e.r; r++) {
      keys.forEach((k, ci) => {
        const cell = ws[XLSX.utils.encode_cell({ r, c: ci })];
        if (!cell || typeof cell.v !== 'number') return;
        if (k === 'Margine %' || k === '% Avanzamento') cell.z = pctFmt;
        else if (k.includes('€') || k === 'Costi Totali' || k === 'MOL' || k === 'Valore Residuo' || k === 'Già Incassato' || k === 'Da Incassare') cell.z = euroFmt;
      });
    }
    return ws;
  };

  // Foglio 2: AGGREGATO PER SOCIETÀ
  const aggSoc = _aggFlex(items, { byRegione: false, byFase: false });
  XLSX.utils.book_append_sheet(wb, buildAggSheet(aggSoc, { byRegione: false, byFase: false }), 'Agg. Società');

  // Foglio 3: AGGREGATO PER SOCIETÀ + FASE
  const aggSocFase = _aggFlex(items, { byRegione: false, byFase: true });
  XLSX.utils.book_append_sheet(wb, buildAggSheet(aggSocFase, { byRegione: false, byFase: true }), 'Agg. Società + Fase');

  // Foglio 4: AGGREGATO PER SOCIETÀ + REGIONE
  const aggSocReg = _aggFlex(items, { byRegione: true, byFase: false });
  XLSX.utils.book_append_sheet(wb, buildAggSheet(aggSocReg, { byRegione: true, byFase: false }), 'Agg. Società + Regione');

  // Foglio 5: AGGREGATO PER SOCIETÀ + REGIONE + FASE (dettaglio completo aggregato)
  const aggSocRegFase = _aggFlex(items, { byRegione: true, byFase: true });
  XLSX.utils.book_append_sheet(wb, buildAggSheet(aggSocRegFase, { byRegione: true, byFase: true }), 'Agg. Soc+Reg+Fase');

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
  const finalOrder = ['RIEPILOGO', 'TUTTI', 'Agg. Società', 'Agg. Società + Fase', 'Agg. Società + Regione', 'Agg. Soc+Reg+Fase', ...statusOrder.map(st => _safeSheetName(st + ' (' + byStatus[st].length + ')'))];
  wb.SheetNames = finalOrder.filter(n => wb.Sheets[n]);

  const now = new Date();
  const dStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');
  XLSX.writeFile(wb, 'Cessione_Credito_Formazione_' + dStr + '.xlsx');
}

/* ── Sezione Cessione Credito: tabella pivot per Società con espansione ── */
function renderCessione() {
  const el = document.getElementById('sec-cessione');
  const f = filtered;

  // Aggrega per Società
  const soc = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!soc[k]) soc[k] = [];
    soc[k].push(c);
  });
  const socKeys = Object.keys(soc).sort((a, b) => {
    const sumA = soc[a].reduce((s, c) => s + (c.consulenza || 0), 0);
    const sumB = soc[b].reduce((s, c) => s + (c.consulenza || 0), 0);
    return sumB - sumA;
  });

  let h = '<div class="sec"><h3 class="sec-title">Cessione Credito &mdash; Aggregazione per Società</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Clicca &#9654; per espandere e vedere le singole commesse di ogni Società. Usa il pulsante verde "Esporta Excel Cessione" in alto per scaricare il file completo.</p>';

  // Totali globali
  const tot = f.reduce((s, c) => s + (c.consulenza || 0), 0);
  const minD = f.map(c => _parseDate(c.dataInizio)).filter(Boolean).sort((a, b) => a - b)[0];
  const maxD = f.map(c => _parseDate(c.dataFine)).filter(Boolean).sort((a, b) => b - a)[0];
  const dStr = d => d ? (String(d.getDate()).padStart(2, '0') + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + d.getFullYear()) : '-';
  const durTot = (minD && maxD) ? Math.max(1, (maxD.getFullYear() - minD.getFullYear()) * 12 + (maxD.getMonth() - minD.getMonth())) : 0;

  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Società</h4><div style="font-size:28px;font-weight:700">' + fmt(socKeys.length) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(f.length) + ' commesse totali</div></div>';
  h += '<div class="card"><h4>Totale € Corsi</h4><div style="font-size:28px;font-weight:700;color:var(--green)">' + fmtK(tot) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmtE(tot) + '</div></div>';
  h += '<div class="card"><h4>Periodo</h4><div style="font-size:16px;font-weight:700">' + dStr(minD) + ' &rarr; ' + dStr(maxD) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">Durata: ' + durTot + ' mesi</div></div>';
  h += '</div>';

  // Tabella tree
  h += '<div class="card"><div class="tbl-scroll"><table id="tblCessione"><thead><tr>';
  h += '<th style="width:30px"></th>';
  h += '<th>Debitore Ceduto (Società)</th>';
  h += '<th>P.IVA</th>';
  h += '<th class="text-right">€ Corso</th>';
  h += '<th>Data Inizio</th>';
  h += '<th>Data Fine</th>';
  h += '<th class="text-right">Durata (mesi)</th>';
  h += '<th class="text-right">SAL Medio</th>';
  h += '<th>Corso / ID</th>';
  h += '</tr></thead><tbody>';

  socKeys.forEach((sk, gi) => {
    const gid = 'cess_g' + gi;
    const items = soc[sk];
    const totSoc = items.reduce((s, c) => s + (c.consulenza || 0), 0);
    const datesInizio = items.map(c => _parseDate(c.dataInizio)).filter(Boolean);
    const datesFine = items.map(c => _parseDate(c.dataFine)).filter(Boolean);
    const minDS = datesInizio.length ? datesInizio.sort((a, b) => a - b)[0] : null;
    const maxDS = datesFine.length ? datesFine.sort((a, b) => b - a)[0] : null;
    const durSoc = (minDS && maxDS) ? Math.max(1, (maxDS.getFullYear() - minDS.getFullYear()) * 12 + (maxDS.getMonth() - minDS.getMonth())) : 0;
    // SAL medio pesato: somma (consulenza[i] / mesi[i]) / n
    let salSum = 0, salCnt = 0;
    items.forEach(c => {
      const d = _durataCorso(c.dataInizio, c.dataFine);
      if (d.mesi > 0) { salSum += (c.consulenza / d.mesi); salCnt++; }
    });
    const salMedioSoc = salCnt > 0 ? salSum / salCnt : 0;

    // Riga Società (aggregata)
    h += '<tr class="tree-row tree-l0" onclick="toggleTree(\'' + gid + '\')">';
    h += '<td class="tree-toggle" id="tog_' + gid + '">&#9654;</td>';
    h += '<td><strong>' + (sk.length > 45 ? sk.substring(0, 43) + '..' : sk) + '</strong> <span style="color:var(--text3);font-size:10px">(' + items.length + ')</span></td>';
    h += '<td style="color:var(--text3);font-style:italic">da compilare</td>';
    h += '<td class="text-right"><strong>' + fmtE(totSoc) + '</strong></td>';
    h += '<td>' + dStr(minDS) + '</td>';
    h += '<td>' + dStr(maxDS) + '</td>';
    h += '<td class="text-right">' + durSoc + '</td>';
    h += '<td class="text-right">' + fmtE(salMedioSoc) + '</td>';
    h += '<td style="color:var(--text3);font-size:10px">' + items.length + ' commesse</td>';
    h += '</tr>';

    // Righe foglie (commesse)
    items.forEach(c => {
      const d = _durataCorso(c.dataInizio, c.dataFine);
      const salM = d.mesi > 0 ? c.consulenza / d.mesi : c.consulenza;
      h += '<tr class="tree-row tree-l1 tree-child-' + gid + '" style="display:none">';
      h += '<td></td>';
      h += '<td style="padding-left:24px;font-size:11px;color:var(--text2)">' + (sk.length > 45 ? sk.substring(0, 43) + '..' : sk) + '</td>';
      h += '<td></td>';
      h += '<td class="text-right" style="font-size:11px">' + fmtE(c.consulenza || 0) + '</td>';
      h += '<td style="font-size:11px">' + (c.dataInizio || '-') + '</td>';
      h += '<td style="font-size:11px">' + (c.dataFine || '-') + '</td>';
      h += '<td class="text-right" style="font-size:11px">' + d.mesi + '</td>';
      h += '<td class="text-right" style="font-size:11px">' + fmtE(salM) + '</td>';
      h += '<td style="font-size:10px;color:var(--text3)">' + (c.corso || '').substring(0, 35) + ' <strong>#' + c.id + '</strong></td>';
      h += '</tr>';
    });
  });

  h += '</tbody></table></div></div>';

  // Pulsante di esportazione in fondo
  h += '<div style="margin-top:14px;text-align:center">';
  h += '<button class="filter-reset" style="background:rgba(16,185,129,.12);border-color:#10b981;color:#10b981;padding:10px 24px;font-size:13px" onclick="exportExcelCessione()">&#8681; Esporta Excel Cessione (' + fmt(f.length) + ' commesse)</button>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}
