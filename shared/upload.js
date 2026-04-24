/* ── Excel Upload Component ── */
/* Requires: SheetJS (xlsx.full.min.js) loaded globally */
/* Each dashboard must set window.UPLOAD_CONFIG before this script */

var ExcelUpload = (function() {
  var _file = null;
  var _sourceLabel = 'File JSON originale';

  function _getCfg() { return window.UPLOAD_CONFIG; }
  function _fmt(n) { return (typeof window.fmt === 'function') ? window.fmt(n) : Number(n || 0).toLocaleString('it-IT'); }

  function createButton() {
    var btn = document.createElement('button');
    btn.className = 'upload-btn';
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>' +
      '<polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
      'Carica Excel';
    btn.onclick = open;
    return btn;
  }

  function createModal() {
    var ov = document.createElement('div');
    ov.className = 'upload-overlay';
    ov.id = 'uploadOverlay';
    ov.innerHTML =
      '<div class="upload-modal">' +
        '<h3>Aggiorna Dati da Excel</h3>' +
        '<p class="upload-sub">Carica un file .xlsx per aggiornare i dati della dashboard.<br>' +
          'Le colonne verranno mappate automaticamente ai campi della dashboard.</p>' +
        '<div class="upload-drop" id="uploadDrop">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
            '<path d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>' +
            '<path d="M16 1l4 4-4 4"/><path d="M20 5H9"/>' +
            '<rect x="9" y="13" width="13" height="9" rx="1"/>' +
            '<path d="M13 17h5"/>' +
          '</svg>' +
          '<p>Trascina il file qui oppure <span>sfoglia</span></p>' +
          '<input type="file" accept=".xlsx,.xls,.csv" id="uploadInput"/>' +
        '</div>' +
        '<div class="upload-file-info" id="uploadFileInfo">' +
          '<span class="fname" id="uploadFname"></span>' +
          '<span class="fsize" id="uploadFsize"></span>' +
        '</div>' +
        '<div class="upload-source" id="uploadSource">' +
          '<span class="dot"></span> Origine attuale: <strong id="uploadSourceLabel">' + _sourceLabel + '</strong>' +
        '</div>' +
        '<div class="upload-status" id="uploadStatus"></div>' +
        '<div class="upload-actions">' +
          '<button class="btn-cancel" onclick="ExcelUpload.close()">Annulla</button>' +
          '<button class="btn-upload" id="uploadGo" disabled onclick="ExcelUpload.process()">Aggiorna Dati</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
    setupDragDrop();
  }

  function setupDragDrop() {
    var drop = document.getElementById('uploadDrop');
    var input = document.getElementById('uploadInput');
    ['dragenter','dragover'].forEach(function(e) {
      drop.addEventListener(e, function(ev) { ev.preventDefault(); drop.classList.add('dragover'); });
    });
    ['dragleave','drop'].forEach(function(e) {
      drop.addEventListener(e, function() { drop.classList.remove('dragover'); });
    });
    drop.addEventListener('drop', function(ev) { ev.preventDefault(); handleFile(ev.dataTransfer.files[0]); });
    input.addEventListener('change', function(ev) { if (ev.target.files[0]) handleFile(ev.target.files[0]); });
  }

  function handleFile(file) {
    if (!file) return;
    _file = file;
    document.getElementById('uploadFname').textContent = file.name;
    document.getElementById('uploadFsize').textContent = (file.size / 1024).toFixed(0) + ' KB';
    document.getElementById('uploadFileInfo').classList.add('visible');
    document.getElementById('uploadGo').disabled = false;
    setStatus('', '');
  }

  function open() {
    if (!document.getElementById('uploadOverlay')) createModal();
    document.getElementById('uploadOverlay').classList.add('open');
  }

  function close() {
    document.getElementById('uploadOverlay').classList.remove('open');
    _file = null;
    document.getElementById('uploadFileInfo').classList.remove('visible');
    document.getElementById('uploadGo').disabled = true;
    var inp = document.getElementById('uploadInput');
    if (inp) inp.value = '';
    setStatus('', '');
  }

  function setStatus(msg, cls) {
    var el = document.getElementById('uploadStatus');
    el.textContent = msg;
    el.className = 'upload-status' + (cls ? ' ' + cls : '');
  }

  function process() {
    if (!_file) { setStatus('Nessun file selezionato.', 'error'); return; }
    var cfg = _getCfg();
    if (!cfg) {
      setStatus('Errore: configurazione upload mancante. Ricarica con Cmd+Shift+R.', 'error');
      console.error('[Upload] window.UPLOAD_CONFIG is', window.UPLOAD_CONFIG);
      return;
    }
    if (typeof XLSX === 'undefined') {
      setStatus('Errore: libreria XLSX non caricata. Controlla la connessione.', 'error');
      return;
    }
    setStatus('Elaborazione in corso...', 'loading');

    var reader = new FileReader();
    reader.onerror = function() { setStatus('Errore nella lettura del file.', 'error'); };
    reader.onload = function(e) {
      try {
        var wb = XLSX.read(e.target.result, { type: 'array' });
        var sheet = wb.Sheets[wb.SheetNames[0]];
        var raw = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
        if (!raw.length) { setStatus('Il file non contiene dati.', 'error'); return; }
        console.log('[Upload] Parsed ' + raw.length + ' rows');

        var records = mapRecords(raw, cfg);
        console.log('[Upload] Mapped ' + records.length + ' records');

        applyData(records, cfg);

        _sourceLabel = _file.name;
        var sl = document.getElementById('uploadSourceLabel');
        if (sl) sl.textContent = _sourceLabel;
        // Chiudi popup upload e mostra popup di conferma
        var fName = _file.name;
        var nRec = records.length;
        close();
        showConfirmModal(nRec, fName, cfg);
      } catch (err) {
        setStatus('Errore: ' + err.message, 'error');
        console.error('[Upload] Error:', err, err.stack);
      }
    };
    reader.readAsArrayBuffer(_file);
  }

  function mapRecords(raw, cfg) {
    var fm = cfg.fieldMap;
    var numFields = {};
    (cfg.numericFields || []).forEach(function(f) { numFields[f] = true; });
    var excelCols = Object.keys(raw[0]);
    var mapping = {};
    var mapKeys = Object.keys(fm);
    for (var k = 0; k < mapKeys.length; k++) {
      var excelName = mapKeys[k];
      var jsonKey = fm[excelName];
      for (var j = 0; j < excelCols.length; j++) {
        if (excelCols[j].trim().toLowerCase() === excelName.trim().toLowerCase()) {
          if (!mapping[excelCols[j]]) mapping[excelCols[j]] = jsonKey;
          break;
        }
      }
    }
    console.log('[Upload] Mapping:', JSON.stringify(mapping));

    var mapEntries = Object.keys(mapping);
    var result = [];
    for (var i = 0; i < raw.length; i++) {
      var row = raw[i];
      var rec = {};
      for (var m = 0; m < mapEntries.length; m++) {
        var col = mapEntries[m];
        var key = mapping[col];
        var v = row[col];
        if (numFields[key]) {
          rec[key] = (v != null && v !== '') ? (parseFloat(v) || 0) : 0;
        } else {
          rec[key] = (v != null && v !== '') ? String(v).trim() : '';
        }
      }
      if (!rec.id) rec.id = i + 1;
      else if (typeof rec.id === 'string') rec.id = parseInt(rec.id) || (i + 1);
      result.push(rec);
    }
    return result;
  }

  function applyData(records, cfg) {
    if (cfg.buildData) {
      var newD = cfg.buildData(records);
      if (cfg.dataKey) {
        var keys = Object.keys(newD);
        for (var i = 0; i < keys.length; i++) D[keys[i]] = newD[keys[i]];
      } else {
        D.length = 0;
        for (var j = 0; j < records.length; j++) D.push(records[j]);
      }
    } else if (cfg.dataKey) {
      D[cfg.dataKey] = records;
    } else {
      D.length = 0;
      for (var j = 0; j < records.length; j++) D.push(records[j]);
    }
    /* Destroy existing charts to avoid canvas reuse errors */
    if (typeof Chart !== 'undefined' && Chart.instances) {
      var ckeys = Object.keys(Chart.instances);
      for (var c = 0; c < ckeys.length; c++) {
        try { Chart.instances[ckeys[c]].destroy(); } catch(e) {}
      }
    }
    if (typeof initFilters === 'function') initFilters();
    if (typeof renderFilteredKpis === 'function') renderFilteredKpis();
    if (typeof renderCurrentSection === 'function') renderCurrentSection();
  }

  function init() {
    // Prima scelta: inserire accanto a "Esporta Excel" o Reset, nella barra filtri
    var filters = document.querySelector('.filters');
    if (filters) {
      var btn = createButton();
      btn.classList.add('filter-reset');
      btn.style.cssText = 'background:rgba(59,130,246,.12);border-color:var(--accent);color:var(--accent);display:inline-flex;align-items:center;gap:4px';
      filters.appendChild(btn);
      return;
    }
    // Fallback: nell'header
    var hdr = document.querySelector('.header');
    if (hdr) {
      var wrap = hdr.querySelector('.header-actions');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.className = 'header-actions';
        wrap.style.cssText = 'display:flex;align-items:center;gap:8px';
        hdr.appendChild(wrap);
      }
      wrap.insertBefore(createButton(), wrap.firstChild);
    }
  }

  function showConfirmModal(nRec, fName, cfg) {
    // Rimuovi eventuale precedente
    var prev = document.getElementById('uploadConfirmOverlay');
    if (prev) prev.remove();

    var ghUploadUrl = cfg.githubDataPath
      ? 'https://github.com/aienricoferrante-2026/QG/upload/main/' + cfg.githubDataPath.replace(/\/[^\/]+$/, '')
      : '#';

    var ov = document.createElement('div');
    ov.className = 'upload-overlay open';
    ov.id = 'uploadConfirmOverlay';
    ov.innerHTML =
      '<div class="upload-modal" style="max-width:520px">' +
        '<div style="text-align:center;margin-bottom:16px">' +
          '<div style="width:56px;height:56px;border-radius:50%;background:rgba(16,185,129,.15);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;font-size:30px;color:#10b981">✓</div>' +
          '<h3 style="font-size:17px;margin-bottom:6px">Dati caricati con successo!</h3>' +
          '<p style="color:var(--text2);font-size:13px;margin:0"><strong>' + _fmt(nRec) + '</strong> record da <strong>' + fName + '</strong></p>' +
        '</div>' +
        '<div style="background:rgba(59,130,246,.08);border:1px solid var(--accent);border-radius:8px;padding:12px;margin-bottom:14px;font-size:12px;color:var(--text2)">' +
          '<div style="color:var(--accent);font-weight:700;margin-bottom:6px;font-size:12px">⚠ I dati sono aggiornati SOLO per la tua sessione</div>' +
          'Se ricarichi la pagina torni ai dati precedenti. Per rendere l\'aggiornamento <b>permanente online per tutti</b>, scarica il JSON e caricalo su GitHub.' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
          '<button class="btn-upload" style="background:#10b981;border-color:#10b981;width:100%;padding:12px;font-size:13px" onclick="ExcelUpload.downloadAndOpenGitHub(\'' + ghUploadUrl.replace(/\'/g,'\\\'') + '\')">&#8681; Scarica JSON e apri GitHub (aggiorna online)</button>' +
          '<button class="btn-upload" style="width:100%;padding:10px;font-size:12px;background:var(--card2);border-color:var(--border);color:var(--text2)" onclick="ExcelUpload.downloadJson()">&#8681; Solo scarica JSON (lo caricherò dopo)</button>' +
          '<button class="btn-cancel" style="width:100%;padding:10px;font-size:12px" onclick="ExcelUpload.closeConfirm()">Ok, solo per me (questa sessione)</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(ov);
  }

  function closeConfirm() {
    var ov = document.getElementById('uploadConfirmOverlay');
    if (ov) ov.remove();
  }

  function downloadAndOpenGitHub(ghUrl) {
    downloadJson();
    if (ghUrl && ghUrl !== '#') {
      setTimeout(function() { window.open(ghUrl, '_blank'); }, 300);
    }
    setTimeout(closeConfirm, 500);
  }

  function downloadJson() {
    var cfg = _getCfg();
    if (!cfg) { alert('Configurazione non disponibile'); return; }
    var data = cfg.dataKey ? D[cfg.dataKey] : D;
    if (!data || (Array.isArray(data) && !data.length)) {
      alert('Nessun dato da esportare. Carica prima un Excel.');
      return;
    }
    var json = JSON.stringify(data, null, 0);
    var fileName = cfg.githubDataPath ? cfg.githubDataPath.split('/').pop() : 'dati.json';
    var blob = new Blob([json], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setStatus('JSON scaricato: ' + fileName + ' (' + (blob.size / 1024).toFixed(0) + ' KB). Ora caricalo su GitHub.', 'success');
  }

  return { init: init, open: open, close: close, process: process, downloadJson: downloadJson, closeConfirm: closeConfirm, downloadAndOpenGitHub: downloadAndOpenGitHub };
})();

document.addEventListener('DOMContentLoaded', function() { ExcelUpload.init(); });
