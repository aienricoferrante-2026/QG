/* ── App Bootstrap & Navigation ── */

let D = [];
let filtered = [];
let currentSection = 'executive';

const SECTIONS = {
  executive: renderExecutive,
  ricavi: renderRicavi,
  corsi: renderCorsi,
  responsabili: renderResponsabili,
  clienti: renderClienti,
  avanzamento: renderAvanzamento,
  sedi: renderSedi,
  alert: renderAlert,
  analisiCliente: renderAnalisiCliente,
  cessione: renderCessione,
  econFin: renderEconFin,
  /* analisiIncassi è ora un blocco embeddato dentro Econ.&Finanziario */
  specEcon: renderSpecEcon,
  wiki: typeof renderWiki === 'function' ? renderWiki : function(){},
  linkPartner: typeof renderLinkPartner === 'function' ? renderLinkPartner : function(){},
  explore: typeof renderExplore === 'function' ? renderExplore : function(){}
};

function showSec(name) {
  currentSection = name;
  // Hide all
  Object.keys(SECTIONS).forEach(k => {
    const el = document.getElementById('sec-' + k);
    if (el) el.classList.add('hidden');
  });
  // Show selected
  const el = document.getElementById('sec-' + name);
  if (el) {
    el.classList.remove('hidden');
    SECTIONS[name]();
  }
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector('.nav-item[data-sec="' + name + '"]');
  if (active) active.classList.add('active');
}

function renderCurrentSection() {
  if (SECTIONS[currentSection]) {
    SECTIONS[currentSection]();
  }
}

// Lettura LIVE da Supabase (bu=FOR) con fallback al JSON statico.
// Se il DB non risponde o torna vuoto → usa il file, così non si rompe mai.
const _SUPA_URL = 'https://odjwvqabxkkpyblghruv.supabase.co';
const _SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kand2cWFieGtrcHlibGdocnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTg3MzYsImV4cCI6MjA5NDYzNDczNn0.KGLBChnozVzuCSDtPYHVkVk7tPzBwMo6JudKDYxv8Ys';
function _snakeToCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function _rowToCommessa(row) {
  const out = {};
  for (const k in row) { if (k === 'meta' || k === 'bu' || k === 'imported_at') continue; out[_snakeToCamel(k)] = row[k]; }
  if (row.meta && typeof row.meta === 'object') Object.assign(out, row.meta);
  return out;
}
async function _loadDataFor() {
  if (!window.DATA_URL) {
    try {
      const url = `${_SUPA_URL}/rest/v1/commesse?bu=eq.FOR&select=*&limit=20000`;
      const r = await fetch(url, { headers: { apikey: _SUPA_ANON, Authorization: `Bearer ${_SUPA_ANON}` } });
      if (r.ok) {
        const rows = await r.json();
        if (Array.isArray(rows) && rows.length) { console.info('[FOR] dati LIVE da Supabase:', rows.length); return rows.map(_rowToCommessa); }
      }
    } catch (e) { console.warn('[FOR] live Supabase fallito, uso il file:', e.message); }
  }
  const r = await fetch(window.DATA_URL || 'data/commesse_for.json');
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

_loadDataFor()
  .then(data => {
    D = data;
    filtered = [...D];
    initFilters();
    if (typeof initQuickFilters === 'function') initQuickFilters();
    renderFilteredKpis();
    showSec('executive');
  })
  .catch(e => {
    document.querySelector('.main').innerHTML =
      '<div style="text-align:center;padding:60px">' +
      '<h2 style="color:var(--danger)">Errore caricamento dati</h2>' +
      '<p style="color:var(--text2);margin-top:8px">Avvia con un server locale:<br>' +
      '<code style="color:var(--accent)">cd dashboard_FOR_CM && python3 -m http.server 8002</code></p></div>';
  });
