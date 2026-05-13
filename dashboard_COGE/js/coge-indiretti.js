/* ── COGE · Sezione Costi Indiretti (form editabile) ──
 * Per ogni (Società, Sede) presente nei dati: tabella editabile con
 * le voci di costo indiretto definite in config.vociIndirette.
 *
 * Salvataggio: localStorage qg_coge_indiretti.
 * Schema: { "Società|Sede": { "Voce": importo, ... }, ... }
 */

function renderCogeIndiretti() {
  const el = document.getElementById('sec-indiretti');
  if (!el) return;
  const voci = window.SECTOR_CONFIG.vociIndirette;
  const sedi = cogeUniqueSediConsedi();

  let h = '<div class="sec"><h3 class="sec-title">🏢 Costi Indiretti per Sede</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Inserisci a mano i costi indiretti annui per ogni Società × Sede. ' +
       'Salvataggio automatico in <code>localStorage</code> del browser. ' +
       'Le righe Sede sono ricavate dalle commesse caricate (anno ' + COGE.year + ').</p>';

  if (!sedi.length) {
    h += '<div class="card"><p style="text-align:center;padding:20px;color:var(--text3)">Nessuna Sede trovata. Verifica che le BU abbiano commesse nell\'anno selezionato.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  // Riepilogo totali
  let totIndir = 0;
  sedi.forEach(({ societa, sede }) => totIndir += cogeIndirettiSede(societa, sede));
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Sedi censite</div><div class="kpi-value">' + cogeFmt(sedi.length) + '</div><div class="kpi-sub">Società × Sede</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costi indiretti totali</div><div class="kpi-value">' + cogeFmtE(totIndir) + '</div><div class="kpi-sub">somma anno ' + COGE.year + '</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Voci tracciate</div><div class="kpi-value">' + cogeFmt(voci.length) + '</div><div class="kpi-sub">per ogni sede</div></div>';
  h += '</div>';

  // Import / Export Excel
  h += '<div class="card" style="margin-bottom:14px"><h4>📥 Import / Export Excel</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin:8px 0">' +
       'Esporta i costi attuali in Excel, modificali offline e ricarica. Pattern utile se gestisci i costi su un foglio condiviso o vuoi backup.</p>';
  h += '<button onclick="indDownloadExcel()" style="background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📤 Scarica Excel (stato attuale)</button>';
  h += '<button onclick="indDownloadTemplate()" style="margin-left:8px;background:rgba(16,185,129,.1);border:1px solid #10b981;color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📄 Scarica template vuoto</button>';
  h += '<label for="indFile" style="margin-left:8px;display:inline-block;background:rgba(245,158,11,.1);border:1px solid #f59e0b;color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📥 Carica Excel</label>';
  h += '<input type="file" id="indFile" accept=".xlsx,.xls,.csv" style="display:none">';
  h += '<div id="indUploadStatus" style="margin-top:8px;font-size:11px;color:var(--text3)"></div>';
  h += '</div>';

  // Tabs Sede: una card per Sede
  sedi.forEach(({ societa, sede }) => {
    const k = societa + '|' + sede;
    const data = COGE.indiretti[k] || {};
    const totSede = Object.values(data).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    h += '<div class="card" style="margin-bottom:14px">';
    h += '<h4>' + societa + ' · ' + sede + ' <span style="color:var(--text3);font-weight:400;margin-left:10px">Totale: <b style="color:#f59e0b">' + cogeFmtE(totSede) + '</b></span></h4>';
    h += '<table class="coge-tbl coge-edit" style="width:100%;max-width:600px"><thead><tr>';
    h += '<th>Voce</th><th style="text-align:right;width:160px">Importo annuo (€)</th>';
    h += '</tr></thead><tbody>';
    voci.forEach(v => {
      const val = data[v] || '';
      const inputId = 'ind_' + btoa(k + '|' + v).replace(/[^a-zA-Z0-9]/g, '');
      h += '<tr>';
      h += '<td>' + v + '</td>';
      h += '<td><input type="number" min="0" step="100" id="' + inputId + '" value="' + val + '" ' +
           'onchange="indSet(\'' + k.replace(/'/g, "\\'") + '\',\'' + v.replace(/'/g, "\\'") + '\',this.value)" ' +
           'style="width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);text-align:right;font-variant-numeric:tabular-nums" placeholder="0"></td>';
      h += '</tr>';
    });
    h += '</tbody></table>';
    h += '</div>';
  });

  h += '<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.06);border-left:3px solid #6366f1;border-radius:4px;font-size:11px;color:var(--text2)">' +
       '<b>💡 Suggerimenti:</b> Lascia in bianco le voci non applicabili (vengono trattate come 0). ' +
       'Per voci ricorrenti (es. affitto mensile €1000), inserisci il valore annuo (€12.000). ' +
       'Per esportare il backup: <code>localStorage.getItem("qg_coge_indiretti")</code> da console.</div>';

  h += '</div>';
  el.innerHTML = h;

  const inp = document.getElementById('indFile');
  if (inp) inp.addEventListener('change', _indHandleFile);
}

function indDownloadExcel() {
  /* Esporta lo stato attuale in CSV (compatibile Excel). */
  const voci = window.SECTOR_CONFIG.vociIndirette;
  const sedi = cogeUniqueSediConsedi();
  const rows = [['Società', 'Sede', ...voci]];
  sedi.forEach(({ societa, sede }) => {
    const data = COGE.indiretti[societa + '|' + sede] || {};
    const row = [societa, sede];
    voci.forEach(v => row.push(data[v] || 0));
    rows.push(row);
  });
  _indDownloadCsv(rows, 'coge_indiretti_' + COGE.year + '.csv');
}

function indDownloadTemplate() {
  /* Template vuoto con le sedi conosciute, voci come header. */
  const voci = window.SECTOR_CONFIG.vociIndirette;
  const sedi = cogeUniqueSediConsedi();
  const rows = [['Società', 'Sede', ...voci]];
  if (!sedi.length) {
    rows.push(['QUALIFICA GROUP srl', 'Esempio Sede', ...voci.map(() => '')]);
  } else {
    sedi.forEach(({ societa, sede }) => rows.push([societa, sede, ...voci.map(() => '')]));
  }
  _indDownloadCsv(rows, 'coge_indiretti_template.csv');
}

function _indDownloadCsv(rows, filename) {
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell || '');
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function _indHandleFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const status = document.getElementById('indUploadStatus');
  status.textContent = 'Lettura file…';
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { status.innerHTML = '<span style="color:#dc2626">File vuoto</span>'; return; }
      const voci = window.SECTOR_CONFIG.vociIndirette;
      const vociSet = new Set(voci.map(v => v.toLowerCase()));
      let imported = 0; const skipped = [];
      rows.forEach((r, idx) => {
        const soc = String(r['Società'] || r['Societa'] || r['Society'] || '').trim();
        const sede = String(r['Sede'] || '').trim();
        if (!soc || !sede) { skipped.push('Riga ' + (idx + 2) + ': Società o Sede vuota'); return; }
        const k = soc + '|' + sede;
        if (!COGE.indiretti[k]) COGE.indiretti[k] = {};
        voci.forEach(v => {
          const val = parseFloat(r[v]) || 0;
          if (val > 0) COGE.indiretti[k][v] = val;
          else delete COGE.indiretti[k][v];
        });
        if (!Object.keys(COGE.indiretti[k]).length) delete COGE.indiretti[k];
        imported++;
      });
      cogeSaveIndiretti();
      let msg = '<span style="color:#10b981">✓ Importate ' + imported + ' righe Sede.</span>';
      if (skipped.length) msg += '<br><span style="color:#f59e0b">⚠ Saltate ' + skipped.length + ':</span><br>' + skipped.slice(0, 8).join('<br>');
      status.innerHTML = msg;
      setTimeout(() => renderCogeIndiretti(), 1200);
    } catch (err) {
      status.innerHTML = '<span style="color:#dc2626">Errore: ' + err.message + '</span>';
    }
  };
  reader.readAsBinaryString(file);
}

function indSet(sedeKey, voce, value) {
  const v = parseFloat(value) || 0;
  if (!COGE.indiretti[sedeKey]) COGE.indiretti[sedeKey] = {};
  if (v === 0) {
    delete COGE.indiretti[sedeKey][voce];
    if (!Object.keys(COGE.indiretti[sedeKey]).length) delete COGE.indiretti[sedeKey];
  } else {
    COGE.indiretti[sedeKey][voce] = v;
  }
  cogeSaveIndiretti();
  // Soft re-render del totale Sede
  const card = event.target.closest('.card');
  if (card) {
    const totSede = Object.values(COGE.indiretti[sedeKey] || {}).reduce((s, x) => s + (parseFloat(x) || 0), 0);
    const totSpan = card.querySelector('h4 b');
    if (totSpan) totSpan.textContent = cogeFmtE(totSede);
  }
}
