/* ── COGE · Sezione Personale (WeA HR) ──
 * Upload Excel/CSV dei dipendenti con imputazione Società/Sede/BU.
 *
 * Schema richiesto del file (header obbligatori, case-insensitive):
 *   Dipendente · Società · Sede · BU · CostoAnnuo · [Ruolo]
 *
 * Esempio:
 *   Mario Rossi, QUALIFICA GROUP srl, Frattamaggiore 1 (Hq), ISO, 45000, Auditor
 *
 * I dati sono salvati in localStorage del browser (key: qg_coge_hr).
 * Non vengono committati nel repo (per privacy stipendi).
 */

const HR_COLS = ['Dipendente', 'Società', 'Sede', 'BU', 'CostoAnnuo', 'Ruolo'];

function _hrNorm(s) { return (s || '').toString().trim(); }

function renderCogeHr() {
  const el = document.getElementById('sec-hr');
  if (!el) return;

  const totDip = COGE.hr.length;
  const totCosto = COGE.hr.reduce((s, h) => s + (parseFloat(h.costoAnnuo) || 0), 0);

  let h = '<div class="sec"><h3 class="sec-title">👥 Personale (WeA HR)</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Lista dipendenti con imputazione Società/Sede/BU e costo annuo. Carica un Excel/CSV ' +
       'esportato da WeA HR. I dati vivono in <code>localStorage</code> del tuo browser e non vengono ' +
       'committati nel repo (privacy stipendi).</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Dipendenti</div><div class="kpi-value">' + cogeFmt(totDip) + '</div><div class="kpi-sub">caricati</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costo annuo totale</div><div class="kpi-value">' + cogeFmtE(totCosto) + '</div><div class="kpi-sub">somma costo annuo</div></div>';
  h += '</div>';

  // Upload zone
  h += '<div class="card" style="margin-bottom:14px">';
  h += '<h4>📥 Carica file HR (Excel .xlsx o CSV)</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin:8px 0">' +
       'Header attesi (in qualsiasi ordine, case-insensitive): <code>' + HR_COLS.join('</code>, <code>') + '</code>. ' +
       '<b>BU</b> deve essere uno tra: ' + Object.keys(window.SECTOR_CONFIG.buMeta).join(', ') + '. ' +
       '<b>CostoAnnuo</b> in euro (numerico). Se un dipendente lavora su più BU, inseriscilo su righe separate (es. ' +
       '50% su ISO + 50% su SIC = 2 righe con costo annuo dimezzato).</p>';
  h += '<input type="file" id="hrFile" accept=".xlsx,.xls,.csv" style="margin:10px 0">';
  h += '<button onclick="hrDownloadTemplate()" style="margin-left:10px;background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);padding:6px 12px;border-radius:5px;cursor:pointer">📄 Scarica template CSV</button>';
  if (totDip) {
    h += '<button onclick="hrClearAll()" style="margin-left:10px;background:rgba(220,38,38,.1);border:1px solid #dc2626;color:#dc2626;padding:6px 12px;border-radius:5px;cursor:pointer">🗑 Svuota lista</button>';
  }
  h += '<div id="hrUploadStatus" style="margin-top:8px;font-size:11px;color:var(--text3)"></div>';
  h += '</div>';

  // Tabella lista dipendenti
  if (totDip) {
    h += '<div class="card"><h4>Lista dipendenti caricati</h4>';
    h += '<div class="tbl-scroll" style="max-height:500px"><table class="coge-tbl"><thead><tr>';
    h += '<th>Dipendente</th><th>Società</th><th>Sede</th><th>BU</th><th>Ruolo</th><th style="text-align:right">Costo Annuo</th>';
    h += '</tr></thead><tbody>';
    COGE.hr.forEach(d => {
      const buMeta = window.SECTOR_CONFIG.buMeta[(d.bu || '').toUpperCase()];
      h += '<tr>';
      h += '<td>' + (d.dipendente || '—') + '</td>';
      h += '<td>' + (d.societa || '—').substring(0, 30) + '</td>';
      h += '<td>' + (d.sede || '—').substring(0, 30) + '</td>';
      h += '<td>' + (buMeta ? '<span style="color:' + buMeta.color + '">' + buMeta.icon + ' ' + (d.bu || '') + '</span>' : (d.bu || '—')) + '</td>';
      h += '<td style="color:var(--text3)">' + (d.ruolo || '—') + '</td>';
      h += '<td style="text-align:right">' + cogeFmtE(parseFloat(d.costoAnnuo) || 0) + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  // Hook upload
  const inp = document.getElementById('hrFile');
  if (inp) inp.addEventListener('change', _hrHandleFile);
}

function _hrHandleFile(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const status = document.getElementById('hrUploadStatus');
  status.textContent = 'Lettura file…';
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!rows.length) { status.innerHTML = '<span style="color:#dc2626">File vuoto</span>'; return; }

      // Normalizza chiavi
      const buSet = new Set(Object.keys(window.SECTOR_CONFIG.buMeta));
      const out = []; const skipped = [];
      rows.forEach((r, idx) => {
        const keys = Object.keys(r).reduce((m, k) => { m[k.toLowerCase().replace(/[^a-z]/g, '')] = k; return m; }, {});
        const pick = name => r[keys[name.toLowerCase().replace(/[^a-z]/g, '')]];
        const bu = _hrNorm(pick('BU')).toUpperCase();
        const item = {
          dipendente: _hrNorm(pick('Dipendente')),
          societa:    _hrNorm(pick('Società') || pick('Societa')),
          sede:       _hrNorm(pick('Sede')),
          bu:         bu,
          costoAnnuo: parseFloat(pick('CostoAnnuo')) || 0,
          ruolo:      _hrNorm(pick('Ruolo')),
        };
        if (!item.dipendente) { skipped.push('Riga ' + (idx + 2) + ': dipendente vuoto'); return; }
        if (!buSet.has(bu)) { skipped.push('Riga ' + (idx + 2) + ' (' + item.dipendente + '): BU "' + bu + '" non riconosciuta'); return; }
        out.push(item);
      });

      COGE.hr = out;
      cogeSaveHr();
      cogeBuildAggregates();
      let msg = '<span style="color:#10b981">✓ Caricati ' + out.length + ' dipendenti.</span>';
      if (skipped.length) msg += '<br><span style="color:#f59e0b">⚠ Saltati ' + skipped.length + ':</span><br>' + skipped.slice(0, 10).join('<br>');
      status.innerHTML = msg;
      setTimeout(() => renderCogeHr(), 1200);
    } catch (err) {
      status.innerHTML = '<span style="color:#dc2626">Errore: ' + err.message + '</span>';
    }
  };
  reader.readAsBinaryString(file);
}

function hrClearAll() {
  if (!confirm('Sicuro di voler eliminare tutti i ' + COGE.hr.length + ' dipendenti caricati?')) return;
  COGE.hr = [];
  cogeSaveHr();
  cogeBuildAggregates();
  renderCogeHr();
}

function hrDownloadTemplate() {
  const buExamples = ['ISO', 'SIC', 'FOR'];
  const rows = [
    HR_COLS.join(','),
    'Mario Rossi,QUALIFICA GROUP srl,Frattamaggiore 1 (Hq),' + buExamples[0] + ',45000,Auditor',
    'Anna Bianchi,QUALIFICA GROUP srl,Frattamaggiore 1 (Hq),' + buExamples[1] + ',38000,RSPP',
    'Luca Verdi,QUALIFICA GROUP srl,Bergamo,' + buExamples[2] + ',42000,Tutor',
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'coge_hr_template.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
