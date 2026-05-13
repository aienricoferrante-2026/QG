/* ── COGE · Sezione Segnatempo (time tracking) ──
 * Upload Excel/CSV con righe ore registrate dai dipendenti.
 *
 * Schema (header case-insensitive, ordine libero):
 *   Dipendente · Data · Ore · [IdCommessa] · [BU] · [Descrizione]
 *
 * Cascata di imputazione (vedi coge-imputazione-logic.js):
 *   L1 - IdCommessa popolato → costo va sulla commessa specifica
 *   L2 - BU popolata (senza IdCommessa) → spalmato su commesse BU
 *   L3 - Nessuno dei due → costi generali
 *
 * I dati vivono in localStorage (key: qg_coge_segnatempo).
 */

const TT_COLS = ['Dipendente', 'Data', 'Ore', 'IdCommessa', 'BU', 'Descrizione'];

function renderCogeSegnatempo() {
  const el = document.getElementById('sec-segnatempo');
  if (!el) return;

  const tt = COGE.segnatempo || [];
  const ttPeriodo = tt.filter(s => _cogePeriodMatchDate(s.data));
  const oreTot = ttPeriodo.reduce((s, r) => s + (parseFloat(r.ore) || 0), 0);
  const oreL1 = ttPeriodo.filter(s => s.idCommessa).reduce((s, r) => s + (parseFloat(r.ore) || 0), 0);
  const oreL2 = ttPeriodo.filter(s => !s.idCommessa && s.bu).reduce((s, r) => s + (parseFloat(r.ore) || 0), 0);
  const oreL3 = oreTot - oreL1 - oreL2;
  const dipendentiAttivi = new Set(ttPeriodo.map(s => (s.dipendente || '').toLowerCase()).filter(Boolean));

  const periodLbl = COGE.month >= 1 && COGE.month <= 12
    ? COGE.year + ' · mese ' + String(COGE.month).padStart(2, '0')
    : COGE.year + ' · anno intero';

  let h = '<div class="sec"><h3 class="sec-title">⏱️ Segnatempo · ' + periodLbl + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Tracking del tempo dei dipendenti/collaboratori. Cascata di imputazione: ' +
       '<b style="color:#10b981">L1</b> IdCommessa specifico → commessa diretta. ' +
       '<b style="color:#f59e0b">L2</b> BU senza commessa → spalmato sulle commesse della BU. ' +
       '<b style="color:#dc2626">L3</b> niente → costi generali (overhead). ' +
       'Costo orario dipendente = costoAnnuo / ' + window.SECTOR_CONFIG.oreAnnueLavorative + ' ore.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Righe Segnatempo</div><div class="kpi-value">' + cogeFmt(tt.length) + '</div><div class="kpi-sub">totale · ' + cogeFmt(ttPeriodo.length) + ' nel periodo</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Dipendenti attivi</div><div class="kpi-value">' + cogeFmt(dipendentiAttivi.size) + '</div><div class="kpi-sub">nel periodo</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ore L1 (commessa)</div><div class="kpi-value">' + cogeFmt(Math.round(oreL1)) + '</div><div class="kpi-sub">' + (oreTot ? (oreL1 / oreTot * 100).toFixed(0) : 0) + '% del totale</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Ore L2 (BU)</div><div class="kpi-value">' + cogeFmt(Math.round(oreL2)) + '</div><div class="kpi-sub">' + (oreTot ? (oreL2 / oreTot * 100).toFixed(0) : 0) + '% spalmato</div></div>';
  h += '<div class="kpi red"><div class="kpi-label">Ore L3 (generali)</div><div class="kpi-value">' + cogeFmt(Math.round(oreL3)) + '</div><div class="kpi-sub">' + (oreTot ? (oreL3 / oreTot * 100).toFixed(0) : 0) + '% overhead</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Ore totali</div><div class="kpi-value">' + cogeFmt(Math.round(oreTot)) + '</div><div class="kpi-sub">tracking del periodo</div></div>';
  h += '</div>';

  // Upload + template
  h += '<div class="card" style="margin-bottom:14px"><h4>📥 Carica Segnatempo</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin:8px 0">' +
       'Header attesi: <code>' + TT_COLS.join('</code>, <code>') + '</code>. ' +
       '<b>Data</b> in formato <code>YYYY-MM-DD</code> o <code>DD/MM/YYYY</code>. ' +
       '<b>Ore</b> numerico (anche decimale, es. 4.5). ' +
       '<b>IdCommessa</b> deve corrispondere a un ID Qnet noto (lookup automatico). ' +
       '<b>BU</b> opzionale, valida solo se IdCommessa è vuoto.</p>';
  h += '<input type="file" id="ttFile" accept=".xlsx,.xls,.csv" style="margin:10px 0">';
  h += '<button onclick="ttDownloadTemplate()" style="margin-left:10px;background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📄 Scarica template CSV</button>';
  if (tt.length) h += '<button onclick="ttDownloadExport()" style="margin-left:8px;background:rgba(16,185,129,.1);border:1px solid #10b981;color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📤 Esporta stato attuale</button>';
  if (tt.length) h += '<button onclick="ttClearAll()" style="margin-left:8px;background:rgba(220,38,38,.1);border:1px solid #dc2626;color:#dc2626;padding:6px 12px;border-radius:5px;cursor:pointer">🗑 Svuota</button>';
  h += '<div id="ttUploadStatus" style="margin-top:8px;font-size:11px;color:var(--text3)"></div>';
  h += '</div>';

  // Lista righe periodo (max 200)
  if (ttPeriodo.length) {
    h += '<div class="card"><h4>Righe del periodo (' + cogeFmt(ttPeriodo.length) + ', mostro max 200)</h4>';
    h += '<div class="tbl-scroll" style="max-height:500px"><table class="coge-tbl"><thead><tr>';
    h += '<th>Data</th><th>Dipendente</th><th>Ore</th><th>Liv.</th><th>IdComm.</th><th>BU</th><th>Descrizione</th>';
    h += '</tr></thead><tbody>';
    ttPeriodo.slice(0, 200).forEach(s => {
      let liv = 'L3', col = '#dc2626';
      if (s.idCommessa) { liv = 'L1'; col = '#10b981'; }
      else if (s.bu) { liv = 'L2'; col = '#f59e0b'; }
      h += '<tr>';
      h += '<td>' + (s.data || '—') + '</td>';
      h += '<td>' + (s.dipendente || '—') + '</td>';
      h += '<td style="text-align:right">' + (parseFloat(s.ore) || 0).toFixed(1) + '</td>';
      h += '<td><span style="color:' + col + ';font-weight:600">' + liv + '</span></td>';
      h += '<td style="color:var(--text3);font-size:11px">' + (s.idCommessa || '—') + '</td>';
      h += '<td style="color:var(--text3)">' + (s.bu || '—') + '</td>';
      h += '<td style="color:var(--text3);font-size:11px">' + (s.descrizione || '').substring(0, 50) + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  const inp = document.getElementById('ttFile');
  if (inp) inp.addEventListener('change', _ttHandleFile);
}

function _ttHandleFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const status = document.getElementById('ttUploadStatus');
  status.textContent = 'Lettura file…';
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { status.innerHTML = '<span style="color:#dc2626">File vuoto</span>'; return; }

      const buSet = new Set(Object.keys(window.SECTOR_CONFIG.buMeta));
      const out = []; const skipped = [];
      rows.forEach((r, idx) => {
        const keys = Object.keys(r).reduce((m, k) => { m[k.toLowerCase().replace(/[^a-z]/g, '')] = k; return m; }, {});
        const pick = name => r[keys[name.toLowerCase().replace(/[^a-z]/g, '')]];
        const item = {
          dipendente: String(pick('Dipendente') || '').trim(),
          data:       String(pick('Data') || '').trim(),
          ore:        parseFloat(pick('Ore')) || 0,
          idCommessa: String(pick('IdCommessa') || '').trim(),
          bu:         String(pick('BU') || '').trim().toUpperCase(),
          descrizione: String(pick('Descrizione') || '').trim(),
        };
        if (!item.dipendente) { skipped.push('Riga ' + (idx + 2) + ': dipendente vuoto'); return; }
        if (!_cogeParseDataTs(item.data)) { skipped.push('Riga ' + (idx + 2) + ' (' + item.dipendente + '): data "' + item.data + '" non valida'); return; }
        if (item.ore <= 0) { skipped.push('Riga ' + (idx + 2) + ' (' + item.dipendente + '): ore non valide'); return; }
        if (item.bu && !buSet.has(item.bu)) { skipped.push('Riga ' + (idx + 2) + ' (' + item.dipendente + '): BU "' + item.bu + '" non riconosciuta'); item.bu = ''; }
        out.push(item);
      });

      COGE.segnatempo = out;
      cogeSaveSegnatempo();
      let msg = '<span style="color:#10b981">✓ Caricate ' + out.length + ' righe Segnatempo.</span>';
      if (skipped.length) msg += '<br><span style="color:#f59e0b">⚠ Saltate ' + skipped.length + ':</span><br>' + skipped.slice(0, 10).join('<br>');
      status.innerHTML = msg;
      setTimeout(() => renderCogeSegnatempo(), 1200);
    } catch (err) {
      status.innerHTML = '<span style="color:#dc2626">Errore: ' + err.message + '</span>';
    }
  };
  reader.readAsBinaryString(file);
}

function ttClearAll() {
  if (!confirm('Sicuro di voler eliminare tutte le ' + COGE.segnatempo.length + ' righe Segnatempo?')) return;
  COGE.segnatempo = [];
  cogeSaveSegnatempo();
  renderCogeSegnatempo();
}

function ttDownloadTemplate() {
  const today = new Date().toISOString().substring(0, 10);
  const rows = [TT_COLS,
    ['Mario Rossi', today, '4', '5497', '', 'Audit ISO 9001'],
    ['Anna Bianchi', today, '3', '', 'FOR', 'Coordinamento corsi'],
    ['Luca Verdi', today, '2', '', '', 'Riunione direzionale'],
  ];
  _ttDownloadCsv(rows, 'coge_segnatempo_template.csv');
}

function ttDownloadExport() {
  const rows = [TT_COLS];
  COGE.segnatempo.forEach(s => rows.push([s.dipendente, s.data, s.ore, s.idCommessa, s.bu, s.descrizione]));
  _ttDownloadCsv(rows, 'coge_segnatempo_export_' + COGE.year + '.csv');
}

function _ttDownloadCsv(rows, filename) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell == null ? '' : cell);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
