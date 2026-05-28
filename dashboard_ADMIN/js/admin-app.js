/* ── STW Admin · Centralina Import Massivo ────────────────────────────────
 * Workflow a 2 step:
 *   STEP 1 – Drop file (con BU opzionale pre-selezionata o auto-detect)
 *   STEP 2 – Anteprima validazione (righe, warning, prime 5 righe)
 *            → "Conferma e Carica" oppure "Cambia BU" o "Annulla"
 *   STEP 3 – Upload batch su Supabase + log import_log
 */

const SESSION_KEY = 'qg_stw_admin_master';

/* ── Utils base ─────────────────────────────────────────────────────────── */
async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function isAuthed() { return sessionStorage.getItem(SESSION_KEY) === '1'; }
function camelToSnake(s) { return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase(); }

function parseDate(s) {
  if (s === null || s === undefined || s === '') return null;
  const str = String(s).trim();
  if (!str || str === '***' || str === '00-00-0000') return null;
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${String(+m[2]).padStart(2,'0')}-${String(+m[3]).padStart(2,'0')}`;
  m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m) return `${m[3]}-${String(+m[2]).padStart(2,'0')}-${String(+m[1]).padStart(2,'0')}`;
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = parseFloat(str);
    if (n > 25569 && n < 70000) {
      const d = new Date((n - 25569) * 86400 * 1000);
      return d.toISOString().substring(0, 10);
    }
  }
  return null;
}

/* ── Routing: usa (?<![a-zA-Z]) invece di \b per gestire _BU_ con underscore ─ */
function detectFileRoute(filename) {
  const cfg = window.STW_ADMIN;
  for (const r of cfg.fileRouting) {
    if (r.match.test(filename)) return r;
  }
  return null;
}

/* ── Alias chiavi XLSX → camelCase ─────────────────────────────────────── */
function aliasKeys(rec, bu) {
  const cfg = window.STW_ADMIN || {};
  const common = cfg.columnAliases || {};
  const byBu = (cfg.columnAliasesByBu && bu && cfg.columnAliasesByBu[bu]) || {};
  const out = {};
  let mapped = false;
  for (const [k, v] of Object.entries(rec)) {
    const aliased = byBu[k] || byBu[k.trim()] || common[k] || common[k.trim()];
    const key = aliased || k;
    if (aliased) mapped = true;
    // Tieni il primo valore non-vuoto se chiave duplicata
    if (key in out && (out[key] !== '' && out[key] != null) && (v === '' || v == null)) continue;
    out[key] = v;
  }
  return { rec: out, mapped };
}

/* Campi che Qnet esporta come "15% - Descrizione" ma il DB vuole integer.
   Estrae la parte numerica iniziale: "15% - foo" → 15, "0% - " → 0. */
const PERCENT_COLS = new Set(['avanzamento', 'avanzamentoRaw']);

function parsePercent(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).trim();
  if (!s || s === '***') return null;
  const m = s.match(/^(\d+(?:[.,]\d+)?)/);
  if (m) return parseFloat(m[1].replace(',', '.'));
  return null;
}

/* Colonne numeriche che potrebbero avere valori monetari con simboli. */
const NUMERIC_COLS = new Set([
  'consulenza','ricavi','mol','costi','ricaviDocum','costiDocum','molDocum',
  'ecRicaviCons','ecMolCons','ecCostiCons','giaIncassato','daIncassare',
  'finIncassiTot','finUsciteTot','finDeltaTot',
  'garImporto','anticipoImporto','saldoImporto','totale','ente',
]);

function coerceNumeric(v) {
  if (v === null || v === undefined || v === '' || v === '***') return null;
  if (typeof v === 'number') return v;
  const s = String(v).replace(/[€$£\s.]/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function splitRecord(rec, fixedCols, dateCols) {
  const cols = {}; const meta = {};
  const fixedSet = new Set(fixedCols);
  const dateSet  = new Set(dateCols);
  Object.entries(rec).forEach(([k, v]) => {
    if (k === 'id') return;
    if (fixedSet.has(k)) {
      let val = v;
      if (dateSet.has(k)) {
        val = parseDate(v);
      } else if (PERCENT_COLS.has(k)) {
        val = parsePercent(v);
      } else if (NUMERIC_COLS.has(k)) {
        val = coerceNumeric(v);
      } else if (v === '' || v === '***') {
        val = null;
      }
      cols[camelToSnake(k)] = val;
    } else {
      if (v !== '' && v !== null && v !== undefined && v !== 0 && v !== '***') meta[k] = v;
    }
  });
  return { cols, meta };
}

/* ── Supabase ───────────────────────────────────────────────────────────── */
async function upsertBatch(table, records, conflictCols) {
  const cfg = window.STW_ADMIN;
  const url = `${cfg.supabaseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflictCols)}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'apikey': cfg.serviceKey,
      'Authorization': `Bearer ${cfg.serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(records),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`HTTP ${resp.status} · ${txt.substring(0, 200)}`);
  }
}

async function writeImportLog({ bu, tabella, filename, righe, righe_ok, righe_err }) {
  const cfg = window.STW_ADMIN;
  const resp = await fetch(`${cfg.supabaseUrl}/rest/v1/import_log`, {
    method: 'POST',
    headers: {
      'apikey': cfg.serviceKey,
      'Authorization': `Bearer ${cfg.serviceKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ bu, tabella, filename, righe, righe_ok, righe_err }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`HTTP ${resp.status} · ${txt.substring(0, 120)}`);
  }
}

/* ── STEP 1: Parse file (senza caricare) ───────────────────────────────── */
async function parseFileOnly(file, forcedRoute) {
  const route = forcedRoute || detectFileRoute(file.name);

  const buf = await file.arrayBuffer();
  let rows = null;
  const warnings = [];

  // Detect formato
  const head = new TextDecoder('utf-8', { fatal: false }).decode(buf.slice(0, 4));
  if (head.trim().startsWith('[') || head.trim().startsWith('{')) {
    try {
      const txt = new TextDecoder('utf-8').decode(buf);
      const parsed = JSON.parse(txt);
      rows = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) { /* fallback XLSX */ }
  }
  if (!rows) {
    const wb = XLSX.read(buf, { type: 'array' });
    const sheet = wb.Sheets[wb.SheetNames[0]];

    // Controlla colonne duplicate nel foglio
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (raw.length) {
      const headers = raw[0];
      const seen = {};
      headers.forEach(h => {
        if (!h) return;
        if (seen[h]) warnings.push(`Colonna duplicata ignorata: "${h}" (viene usata solo la prima occorrenza)`);
        seen[h] = true;
      });
    }

    rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  }

  if (!rows || !rows.length) return { route, rows: [], records: [], warnings, noId: 0 };

  const cfg = window.STW_ADMIN;
  const bu = route ? route.bu : null;
  const fixed = route ? (cfg.fixedCols[route.table] || []) : [];
  const dates = cfg.dateCols;

  // Controlla header non mappati
  const firstRow = rows[0];
  const common = cfg.columnAliases || {};
  const byBu = (cfg.columnAliasesByBu && bu && cfg.columnAliasesByBu[bu]) || {};
  const unmapped = [];
  Object.keys(firstRow).forEach(k => {
    const kk = k.trim();
    if (!common[kk] && !byBu[kk] && !['id','ID','Id'].includes(kk)) {
      unmapped.push(k);
    }
  });
  if (unmapped.length) {
    warnings.push(`${unmapped.length} colonne non mappate → andranno in meta JSONB: ${unmapped.slice(0,5).map(u => `"${u}"`).join(', ')}${unmapped.length > 5 ? ' …' : ''}`);
  }

  const records = [];
  let noId = 0;
  for (const raw of rows) {
    const { rec } = aliasKeys(raw, bu);
    const idVal = rec.id || rec.ID || rec.Id;
    if (!idVal) { noId++; continue; }
    const { cols, meta } = splitRecord(rec, fixed, dates);
    const r = { id: String(idVal), ...cols, meta };
    if (bu) r.bu = bu;
    records.push(r);
  }

  return { route, rows, records, warnings, noId };
}

/* ── STEP 2: Mostra pannello validazione ───────────────────────────────── */
let _pendingUploads = []; // { file, parsed }

function showValidation(parsedList) {
  _pendingUploads = parsedList;

  const panel = document.getElementById('validationPanel');
  const cfg = window.STW_ADMIN;

  let h = '';
  for (const { file, parsed } of parsedList) {
    const { route, rows, records, warnings, noId } = parsed;
    const routeLabel = route
      ? (route.label || route.table + (route.bu ? ` (${route.bu})` : ''))
      : null;

    h += `<div class="val-block" data-file="${file.name}">`;
    h += `<div class="val-header">`;
    h += `<span class="val-filename">📄 ${file.name}</span>`;
    h += `</div>`;

    if (!route) {
      // BU non rilevata: mostra solo selettore forza-BU
      h += `<div class="val-warn val-warn-err">⚠ BU non riconosciuta dal nome file. Seleziona manualmente la BU qui sotto e clicca "Rielabora".</div>`;
      h += `<div style="margin-top:8px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">`;
      h += `<select class="val-force-sel" data-file="${file.name}" style="padding:6px 10px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);font-size:12px">`;
      h += `<option value="">— Seleziona BU —</option>`;
      cfg.manualForceOptions.forEach(o => {
        h += `<option value="${o.table}|${o.bu || ''}">${o.label}</option>`;
      });
      h += `</select>`;
      h += `<button class="btn-rielabora" data-file="${file.name}" onclick="rielaboraFile(this)">🔄 Rielabora</button>`;
      h += `</div>`;
      h += `</div>`;
      continue;
    }

    // BU rilevata
    h += `<div class="val-meta">`;
    h += `<span class="val-tag val-tag-bu">🏷 BU: <strong>${routeLabel}</strong></span>`;
    h += `<span class="val-tag">📊 Righe Excel: <strong>${rows.length}</strong></span>`;
    h += `<span class="val-tag val-tag-ok">✅ Da caricare: <strong>${records.length}</strong></span>`;
    if (noId) h += `<span class="val-tag val-tag-warn">⚠ Senza ID (salte): <strong>${noId}</strong></span>`;
    // Selettore per cambiare BU
    h += `<select class="val-force-sel" data-file="${file.name}" style="padding:5px 8px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);font-size:11px;margin-left:auto">`;
    h += `<option value="${route.table}|${route.bu || ''}">BU attuale: ${routeLabel}</option>`;
    h += `<option value="">— Cambia BU —</option>`;
    cfg.manualForceOptions.forEach(o => {
      const v = o.table + '|' + (o.bu || '');
      if (v !== route.table + '|' + (route.bu || ''))
        h += `<option value="${v}">${o.label}</option>`;
    });
    h += `</select>`;
    h += `<button class="btn-rielabora" data-file="${file.name}" onclick="rielaboraFile(this)" title="Rielabora con la BU selezionata">🔄</button>`;
    h += `</div>`;

    // Warning
    warnings.forEach(w => {
      h += `<div class="val-warn">⚠ ${w}</div>`;
    });

    // Anteprima prime 5 righe
    if (records.length) {
      const sample = records.slice(0, 5);
      const keys = Object.keys(sample[0]).filter(k => k !== 'meta' && k !== 'bu').slice(0, 8);
      h += `<div style="overflow-x:auto;margin-top:8px"><table class="val-table"><thead><tr>`;
      keys.forEach(k => { h += `<th>${k}</th>`; });
      h += `</tr></thead><tbody>`;
      sample.forEach(r => {
        h += '<tr>';
        keys.forEach(k => { h += `<td>${r[k] ?? ''}</td>`; });
        h += '</tr>';
      });
      h += `</tbody></table></div>`;
      if (records.length > 5) h += `<p style="color:var(--text3);font-size:10px;margin-top:4px">… e altre ${records.length - 5} righe</p>`;
    }

    h += `</div>`;
  }

  panel.innerHTML = h;

  // Bottoni conferma / annulla
  document.getElementById('validationActions').style.display = 'flex';
  document.getElementById('dropZone').style.opacity = '.5';
  document.getElementById('dropZone').style.pointerEvents = 'none';

  // Scroll al pannello
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Rielabora con BU diversa ───────────────────────────────────────────── */
async function rielaboraFile(btn) {
  const fileName = btn.dataset.file;
  const block = btn.closest('.val-block');
  const sel = block.querySelector('.val-force-sel');
  const val = sel ? sel.value : '';

  const cfg = window.STW_ADMIN;
  let forcedRoute = null;
  if (val) {
    forcedRoute = cfg.manualForceOptions.find(o => (o.table + '|' + (o.bu || '')) === val) || null;
  }

  const entry = _pendingUploads.find(u => u.file.name === fileName);
  if (!entry) return;

  btn.textContent = '⏳';
  btn.disabled = true;
  try {
    entry.parsed = await parseFileOnly(entry.file, forcedRoute);
  } finally {
    btn.textContent = '🔄';
    btn.disabled = false;
  }
  showValidation(_pendingUploads);
}

/* ── STEP 3: Upload effettivo ───────────────────────────────────────────── */
async function confirmUpload() {
  document.getElementById('validationActions').style.display = 'none';
  const ul = document.getElementById('uploadStatus');
  ul.innerHTML = '';
  const summaryEl = document.getElementById('uploadSummary');
  summaryEl.textContent = 'Caricamento in corso…';
  diagLog(`▶ Avvio upload di ${_pendingUploads.length} file`);

  let totOk = 0, totErr = 0, totSkip = 0;
  for (const { file, parsed } of _pendingUploads) {
    const { route, records, rows, noId } = parsed;
    const li = document.createElement('li');
    li.style.cssText = 'margin-bottom:6px;font-size:12px';
    ul.appendChild(li);

    if (!route || !records.length) {
      li.innerHTML = `<span style="color:#f59e0b">⚠ ${file.name} · saltato (nessun record o BU non definita)</span>`;
      totSkip++;
      continue;
    }

    const routeLabel = route.label || route.table + (route.bu ? ` (${route.bu})` : '');
    const conflict = route.table === 'commesse' ? 'bu,id' : 'id';
    let ok = 0, err = 0;
    const errors = [];

    for (let i = 0; i < records.length; i += 500) {
      const batch = records.slice(i, i + 500);
      li.innerHTML = `<span style="color:#06b6d4">⏳ ${file.name} → ${routeLabel} · ${ok + batch.length}/${records.length} caricati…</span>`;
      try {
        await upsertBatch(route.table, batch, conflict);
        ok += batch.length;
      } catch (e) {
        err += batch.length;
        errors.push(e.message);
        diagLog(`  ERR batch ${i}: ${e.message}`);
      }
    }

    const color = err ? '#f59e0b' : '#10b981';
    let msg = `<span style="color:${color}">${err ? '⚠' : '✓'} <b>${file.name}</b> → ${routeLabel} · ${ok} caricati`;
    if (noId) msg += ` · ${noId} senza id (saltate)`;
    if (err) msg += ` · ${err} errori`;
    msg += '</span>';
    if (errors.length) msg += `<div style="color:#dc2626;font-size:10px;margin-left:14px">${errors[0]}</div>`;
    li.innerHTML = msg;

    totOk += ok; totErr += err;
    diagLog(`◀ ${file.name}: ${ok} ok, ${err} err`);

    try {
      await writeImportLog({
        bu: route.bu || route.table,
        tabella: route.table,
        filename: file.name,
        righe: rows.length,
        righe_ok: ok,
        righe_err: err,
      });
    } catch (e) {
      diagLog(`  ⚠ import_log non scritto: ${e.message}`);
    }
  }

  summaryEl.innerHTML =
    `<b>✅ Caricamento completato.</b> ${totOk.toLocaleString('it-IT')} record su Supabase · ${totErr} errori · ${totSkip} saltati.` +
    `<div style="margin-top:8px;padding:10px;background:rgba(245,158,11,.08);border-left:3px solid #f59e0b;border-radius:4px;color:var(--text2);font-size:11px">` +
    `⚠ <b>Le dashboard leggono i JSON statici committati nel repo.</b> Per aggiornare le dashboard:` +
    `<ol style="margin:6px 0 0 18px;line-height:1.7">` +
    `<li>Esegui <code>python3 tools/regenerate_json_from_supabase.py</code></li>` +
    `<li><code>git add data/ && git commit -m "Update dati" && git push</code></li>` +
    `<li>Aspetta 1-2 min che GitHub Pages aggiorni</li>` +
    `</ol></div>`;

  // Riabilita drop zone
  document.getElementById('dropZone').style.opacity = '';
  document.getElementById('dropZone').style.pointerEvents = '';
  document.getElementById('validationPanel').innerHTML = '';
  _pendingUploads = [];
}

function cancelUpload() {
  _pendingUploads = [];
  document.getElementById('validationPanel').innerHTML = '';
  document.getElementById('validationActions').style.display = 'none';
  document.getElementById('dropZone').style.opacity = '';
  document.getElementById('dropZone').style.pointerEvents = '';
  document.getElementById('uploadStatus').innerHTML = '';
  document.getElementById('uploadSummary').textContent = 'Import annullato.';
}

/* ── Gestione file drop/pick ────────────────────────────────────────────── */
function diagLog(msg) {
  const el = document.getElementById('diagLog');
  if (!el) return;
  const ts = new Date().toLocaleTimeString('it-IT');
  el.textContent += `[${ts}] ${msg}\n`;
  el.scrollTop = el.scrollHeight;
}

function getForcedRoute() {
  const sel = document.getElementById('forceBu');
  if (!sel || !sel.value) return null;
  const cfg = window.STW_ADMIN;
  return cfg.manualForceOptions.find(o => (o.table + '|' + (o.bu || '')) === sel.value) || null;
}

async function handleFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;

  document.getElementById('uploadStatus').innerHTML = '';
  document.getElementById('uploadSummary').textContent = 'Lettura file…';
  document.getElementById('validationPanel').innerHTML = '<p style="color:var(--text3);font-size:12px;padding:12px">⏳ Analisi in corso…</p>';
  document.getElementById('validationActions').style.display = 'none';

  const forced = getForcedRoute();
  diagLog(`▶ Analisi di ${files.length} file · forced=${forced ? forced.label : 'auto-detect'}`);

  const parsedList = [];
  for (const file of files) {
    diagLog(`  parsing: ${file.name}`);
    try {
      const parsed = await parseFileOnly(file, forced);
      parsedList.push({ file, parsed });
      diagLog(`  → route=${parsed.route ? parsed.route.label : 'non rilevata'}, records=${parsed.records.length}, warnings=${parsed.warnings.length}`);
    } catch (e) {
      parsedList.push({
        file,
        parsed: { route: null, rows: [], records: [], warnings: [`Errore lettura: ${e.message}`], noId: 0 }
      });
      diagLog(`  FATAL: ${e.message}`);
    }
  }

  document.getElementById('uploadSummary').textContent = '';
  showValidation(parsedList);
}

/* ── Statistiche ────────────────────────────────────────────────────────── */
async function loadStats() {
  const cfg = window.STW_ADMIN;
  const url = `${cfg.supabaseUrl}/rest/v1/`;
  async function count(table) {
    try {
      const r = await fetch(`${url}${table}?select=id`, {
        method: 'HEAD',
        headers: { 'apikey': cfg.anonKey, 'Authorization': `Bearer ${cfg.anonKey}`, 'Prefer': 'count=exact' },
      });
      const cr = r.headers.get('content-range');
      return cr ? parseInt(cr.split('/').pop()) : 0;
    } catch { return 0; }
  }
  const [comm, off, opp] = await Promise.all([count('commesse'), count('offerte'), count('opportunita_for')]);
  document.getElementById('statCommesse').textContent = comm.toLocaleString('it-IT');
  document.getElementById('statOfferte').textContent = off.toLocaleString('it-IT');
  document.getElementById('statOpp').textContent = opp.toLocaleString('it-IT');
}

/* ── Popola selettore BU ────────────────────────────────────────────────── */
function populateForceBu() {
  const sel = document.getElementById('forceBu');
  if (!sel) return;
  const cfg = window.STW_ADMIN;
  cfg.manualForceOptions.forEach(o => {
    const opt = document.createElement('option');
    opt.value = o.table + '|' + (o.bu || '');
    opt.textContent = o.label;
    sel.appendChild(opt);
  });
}

/* ── Login / Logout ─────────────────────────────────────────────────────── */
function showApp() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'inline-block';
  populateForceBu();
  loadStats();
}
function showLogin() {
  document.getElementById('loginBox').style.display = 'block';
  document.getElementById('app').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'none';
}
async function handleLogin(e) {
  e.preventDefault();
  const u = document.getElementById('loginUser').value.trim().toLowerCase();
  const p = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginErr');
  errEl.textContent = '';
  const cfg = window.STW_ADMIN;
  const h = await sha256(p);
  if (u === cfg.masterUser && h === cfg.masterHash) {
    sessionStorage.setItem(SESSION_KEY, '1');
    showApp();
  } else {
    errEl.textContent = 'Credenziali Master errate.';
  }
}
function handleLogout() { sessionStorage.removeItem(SESSION_KEY); showLogin(); }

/* ── Boot ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('fileInput').addEventListener('change', e => handleFiles(e.target.files));
  document.getElementById('btnConferma').addEventListener('click', confirmUpload);
  document.getElementById('btnAnnulla').addEventListener('click', cancelUpload);

  const dz = document.getElementById('dropZone');
  ['dragenter','dragover'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.add('dz-over');
  }));
  ['dragleave','drop'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.remove('dz-over');
  }));
  dz.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

  if (isAuthed()) showApp(); else showLogin();

  // Auto-selezione BU da ?bu=FOR
  const urlBu = new URLSearchParams(location.search).get('bu');
  if (urlBu) {
    setTimeout(() => {
      const sel = document.getElementById('forceBu');
      if (!sel) return;
      for (const opt of sel.options) {
        if (opt.value === `commesse|${urlBu}`) { sel.value = opt.value; break; }
      }
      sel.style.borderColor = '#f59e0b';
      sel.style.boxShadow = '0 0 0 2px rgba(245,158,11,.25)';
      const hint = document.createElement('p');
      hint.style.cssText = 'margin-top:6px;color:#fbbf24;font-size:11px;font-weight:600';
      hint.textContent = `⚡ BU pre-selezionata: ${urlBu} — trascina qui il file Excel.`;
      sel.parentNode.appendChild(hint);
    }, 200);
  }
});
