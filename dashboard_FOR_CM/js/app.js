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
// RE-CABLAGGIO 14/07: dati STW migrati in bqyqr.stw (odjw in dismissione).
const _SUPA_URL = 'https://bqyqrqmbekdhejrzasvv.supabase.co';
const _SUPA_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxeXFycW1iZWtkaGVqcnphc3Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTczNzQsImV4cCI6MjA5NDYzMzM3NH0.L2-lpdBku-zbNJlBwfCCxPzkV-i9B7_bFTWdTGiA6RE';
const _SUPA_SCHEMA = 'stw';
function _snakeToCamel(s) { return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); }
function _rowToCommessa(row) {
  const out = {};
  for (const k in row) { if (k === 'meta' || k === 'fa_codice' || k === 'imported_at') continue; out[_snakeToCamel(k)] = row[k]; }
  if (row.meta && typeof row.meta === 'object') Object.assign(out, row.meta);
  return out;
}
async function _loadDataFor() {
  if (!window.DATA_URL) {
    try {
      // Supabase taglia ogni risposta a 1000 righe (cap server, ignora limit=20000).
      // Leggiamo a BLOCCHI di 1000 con header Range finché non finiscono → TUTTE le commesse.
      const PAGE = 1000;
      let from = 0, tutte = [];
      for (let giro = 0; giro < 100; giro++) {   // safety cap: 100.000 righe
        const url = `${_SUPA_URL}/rest/v1/commesse?fa_codice=eq.FOR&select=*`;
        const r = await fetch(url, {
          headers: {
            apikey: _SUPA_ANON, Authorization: `Bearer ${_SUPA_ANON}`,
            'Accept-Profile': _SUPA_SCHEMA,
            Range: `${from}-${from + PAGE - 1}`, 'Range-Unit': 'items',
          },
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const rows = await r.json();
        if (!Array.isArray(rows) || rows.length === 0) break;
        tutte = tutte.concat(rows);
        if (rows.length < PAGE) break;            // ultima pagina raggiunta
        from += PAGE;
      }
      if (tutte.length) { console.info('[FOR] dati LIVE da Supabase (tutte le pagine):', tutte.length); return tutte.map(_rowToCommessa); }
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
