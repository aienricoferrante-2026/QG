/* ── STW Admin · Centralina Import Massivo via Supabase ──
 * Login Master → upload multi-file Excel/CSV → auto-detect BU dal
 * nome file → parse XLSX (sheetjs) → upsert su Supabase REST API.
 *
 * Workflow:
 *   1. Login Master (hash SHA-256, sessionStorage)
 *   2. Drop-zone multi-file (drag&drop o picker)
 *   3. Per ogni file: routing automatico via filename → tabella/BU
 *   4. Parse client-side (XLSX.utils.sheet_to_json)
 *   5. Normalizza: split colonne fisse vs meta JSONB, parse date
 *   6. Upsert batch da 500 record verso Supabase REST API
 *   7. Report: ok/errori per file
 *
 * NON tocca i JSON committati. Per rigenerarli da Supabase usa
 * `python3 tools/regenerate_json_from_supabase.py` (TODO).
 */

const SESSION_KEY = 'qg_stw_admin_master';

async function sha256(text) {
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function isAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

function camelToSnake(s) {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

function parseDate(s) {
  if (s === null || s === undefined || s === '') return null;
  const str = String(s).trim();
  if (!str || str === '***' || str === '00-00-0000') return null;
  let m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${String(+m[2]).padStart(2, '0')}-${String(+m[3]).padStart(2, '0')}`;
  m = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (m) return `${m[3]}-${String(+m[2]).padStart(2, '0')}-${String(+m[1]).padStart(2, '0')}`;
  // Excel serial date
  if (/^\d+(\.\d+)?$/.test(str)) {
    const n = parseFloat(str);
    if (n > 25569 && n < 70000) {
      const d = new Date((n - 25569) * 86400 * 1000);
      return d.toISOString().substring(0, 10);
    }
  }
  return null;
}

function detectFileRoute(filename) {
  const cfg = window.STW_ADMIN;
  for (const r of cfg.fileRouting) {
    if (r.match.test(filename)) return r;
  }
  return null;
}

function splitRecord(rec, fixedCols, dateCols) {
  /* Ritorna { cols, meta }. cols ha chiavi snake_case (= colonne DB).
     meta è oggetto JSON con tutto il resto. */
  const cols = {}; const meta = {};
  const fixedSet = new Set(fixedCols);
  const dateSet = new Set(dateCols);
  Object.entries(rec).forEach(([k, v]) => {
    if (k === 'id') return;
    if (fixedSet.has(k)) {
      let val = v;
      if (dateSet.has(k)) val = parseDate(v);
      else if (v === '' || v === '***') val = null;
      cols[camelToSnake(k)] = val;
    } else {
      if (v !== '' && v !== null && v !== undefined && v !== 0 && v !== '***') {
        meta[k] = v;
      }
    }
  });
  return { cols, meta };
}

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

async function processFile(file, statusEl) {
  const route = detectFileRoute(file.name);
  if (!route) {
    statusEl.innerHTML = `<span style="color:#dc2626">✗ ${file.name} · BU non riconosciuta dal nome file</span>`;
    return { file: file.name, ok: 0, err: 0, skipped: true };
  }
  const cfg = window.STW_ADMIN;
  statusEl.innerHTML = `<span style="color:#06b6d4">⏳ ${file.name} → ${route.table}${route.bu ? ' (' + route.bu + ')' : ''} · lettura…</span>`;

  // Read XLSX/CSV
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  if (!rows.length) {
    statusEl.innerHTML = `<span style="color:#f59e0b">⚠ ${file.name} · file vuoto</span>`;
    return { file: file.name, ok: 0, err: 0, skipped: true };
  }

  statusEl.innerHTML = `<span style="color:#06b6d4">⏳ ${file.name} · ${rows.length} righe · parsing…</span>`;

  const fixed = cfg.fixedCols[route.table];
  const dates = cfg.dateCols;
  const records = [];
  let skipped = 0;
  for (const r of rows) {
    const idVal = r.id || r.ID || r.Id;
    if (!idVal) { skipped++; continue; }
    const { cols, meta } = splitRecord(r, fixed, dates);
    const rec = { id: String(idVal), ...cols, meta };
    if (route.bu) rec.bu = route.bu;
    records.push(rec);
  }

  // Upsert batch da 500
  const conflict = route.table === 'commesse' ? 'bu,id' : 'id';
  let ok = 0; let err = 0; const errors = [];
  for (let i = 0; i < records.length; i += 500) {
    const batch = records.slice(i, i + 500);
    try {
      await upsertBatch(route.table, batch, conflict);
      ok += batch.length;
      statusEl.innerHTML = `<span style="color:#06b6d4">⏳ ${file.name} · ${ok}/${records.length} caricati…</span>`;
    } catch (e) {
      err += batch.length;
      errors.push(e.message);
    }
  }

  const color = err ? '#f59e0b' : '#10b981';
  let msg = `<span style="color:${color}">${err ? '⚠' : '✓'} ${file.name} → ${route.table}${route.bu ? ' (' + route.bu + ')' : ''} · ${ok} caricati`;
  if (skipped) msg += ` · ${skipped} senza id`;
  if (err) msg += ` · ${err} errori`;
  msg += '</span>';
  if (errors.length) msg += '<div style="color:#dc2626;font-size:10px;margin-left:14px">' + errors[0] + '</div>';
  statusEl.innerHTML = msg;
  return { file: file.name, ok, err, skipped };
}

async function handleFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;
  const ul = document.getElementById('uploadStatus');
  ul.innerHTML = '';
  const summaryEl = document.getElementById('uploadSummary');
  summaryEl.textContent = `Inizio elaborazione · ${files.length} file…`;
  const totals = { ok: 0, err: 0, skipped: 0, files: files.length };
  for (const f of files) {
    const li = document.createElement('li');
    li.style.cssText = 'margin-bottom:6px;font-size:12px';
    ul.appendChild(li);
    try {
      const r = await processFile(f, li);
      totals.ok += r.ok; totals.err += r.err;
      if (r.skipped) totals.skipped++;
    } catch (e) {
      li.innerHTML = `<span style="color:#dc2626">✗ ${f.name} · ${e.message}</span>`;
      totals.err++;
    }
  }
  summaryEl.innerHTML = `<b>Fatto.</b> ${totals.ok.toLocaleString('it-IT')} record caricati su Supabase · ${totals.err} errori · ${totals.skipped} file saltati. ` +
    `<br><i>Le dashboard sul sito leggono ancora i JSON committati. Per rigenerarli serve uno script lato server (TODO).</i>`;
}

async function loadStats() {
  const cfg = window.STW_ADMIN;
  const url = `${cfg.supabaseUrl}/rest/v1/`;
  async function count(table) {
    const r = await fetch(`${url}${table}?select=id`, {
      method: 'HEAD',
      headers: { 'apikey': cfg.anonKey, 'Authorization': `Bearer ${cfg.anonKey}`, 'Prefer': 'count=exact' },
    });
    const cr = r.headers.get('content-range');
    return cr ? parseInt(cr.split('/').pop()) : 0;
  }
  const [comm, off, opp] = await Promise.all([count('commesse'), count('offerte'), count('opportunita_for')]);
  document.getElementById('statCommesse').textContent = comm.toLocaleString('it-IT');
  document.getElementById('statOfferte').textContent = off.toLocaleString('it-IT');
  document.getElementById('statOpp').textContent = opp.toLocaleString('it-IT');

  // Counts per BU
  const r = await fetch(`${url}commesse?select=bu&limit=1`, {
    headers: { 'apikey': cfg.anonKey, 'Authorization': `Bearer ${cfg.anonKey}` },
  });
  // Per BU usiamo una query SQL? Non disponibile via REST. Skip per ora,
  // se serve facciamo una RPC server-side.
}

function showApp() {
  document.getElementById('loginBox').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'inline-block';
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

function handleLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  showLogin();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  document.getElementById('fileInput').addEventListener('change', e => handleFiles(e.target.files));

  // Drag & drop
  const dz = document.getElementById('dropZone');
  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.add('dz-over');
  }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => {
    e.preventDefault(); e.stopPropagation(); dz.classList.remove('dz-over');
  }));
  dz.addEventListener('drop', e => handleFiles(e.dataTransfer.files));

  if (isAuthed()) showApp(); else showLogin();
});
