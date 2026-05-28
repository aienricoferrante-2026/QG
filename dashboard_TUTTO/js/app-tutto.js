/* ── Dashboard Totale · app-tutto.js ──────────────────────────────────────
 * Sostituisce shared/dashboard-core/js/app.js.
 * Carica in parallelo i JSON di tutte le 11 BU, li unisce aggiungendo
 * il campo _bu a ogni record, poi avvia l'infrastruttura condivisa
 * (filtri, KPI, sezioni) esattamente come farebbe app.js sul singolo file.
 */

const BU_FILES = [
  { code: 'FOR',     file: '../dashboard_FOR_CM/data/commesse_for.json' },
  { code: 'ISO',     file: '../dashboard_ISO_CM/data/commesse_iso.json' },
  { code: 'SIC',     file: '../dashboard_SIC_CM/data/commesse_sic.json' },
  { code: 'APL_PAL', file: '../dashboard_APL_PAL_CM/data/commesse_apl_pal.json' },
  { code: 'GDPR',    file: '../dashboard_GDPR_CM/data/commesse_gdpr.json' },
  { code: 'SOA',     file: '../dashboard_SOA_CM/data/commesse_soa.json' },
  { code: 'AVV',     file: '../dashboard_AVV_CM/data/commesse_avv.json' },
  { code: 'GAR',     file: '../dashboard_GAR_CM/data/commesse_gar.json' },
  { code: 'FIA',     file: '../dashboard_FIA_CM/data/commesse_fia.json' },
  { code: 'APL_RES', file: '../dashboard_APL_RES_CM/data/commesse_apl_res.json' },
  { code: 'IST',     file: '../dashboard_IST_CM/data/commesse_ist.json' },
];

// ── Variabili globali condivise (le stesse di app.js) ──────────────────────
var D = [];
var filtered = [];
var currentSection = 'executive';

// ── Navigazione (copia da shared/app.js) ──────────────────────────────────
const SECTIONS_DEFAULT = {
  executive:      () => typeof renderExecutive      === 'function' && renderExecutive(),
  perBu:          () => typeof renderPerBu          === 'function' && renderPerBu(),
  ricavi:         () => typeof renderRicavi         === 'function' && renderRicavi(),
  econFin:        () => typeof renderEconFin        === 'function' && renderEconFin(),
  analisiIncassi: () => typeof renderAnalisiIncassi === 'function' && renderAnalisiIncassi(),
  responsabili:   () => typeof renderResponsabili   === 'function' && renderResponsabili(),
  clienti:        () => typeof renderClienti        === 'function' && renderClienti(),
  sedi:           () => typeof renderSedi           === 'function' && renderSedi(),
  avanzamento:    () => typeof renderAvanzamento    === 'function' && renderAvanzamento(),
  alert:          () => typeof renderAlert          === 'function' && renderAlert(),
  produttivita:   () => typeof renderProduttivita   === 'function' && renderProduttivita(),
  wiki:           () => typeof renderWiki           === 'function' && renderWiki(),
  explore:        () => typeof renderExplore        === 'function' && renderExplore(),
};

function _sections() {
  const cfg = window.SECTOR_CONFIG || {};
  if (cfg.sections) return cfg.sections;
  if (Array.isArray(cfg.extraSections) && cfg.extraSections.length) {
    const merged = Object.assign({}, SECTIONS_DEFAULT);
    cfg.extraSections.forEach(name => {
      const fnName = 'render' + name.charAt(0).toUpperCase() + name.slice(1);
      merged[name] = () => typeof window[fnName] === 'function' && window[fnName]();
    });
    return merged;
  }
  return SECTIONS_DEFAULT;
}

function showSec(name) {
  currentSection = name;
  Object.keys(_sections()).forEach(k => {
    const el = document.getElementById('sec-' + k);
    if (el) el.classList.add('hidden');
  });
  const el = document.getElementById('sec-' + name);
  if (el) {
    el.classList.remove('hidden');
    const fn = _sections()[name];
    if (typeof fn === 'function') fn();
  }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector('.nav-item[data-sec="' + name + '"]');
  if (active) active.classList.add('active');
}

function renderCurrentSection() {
  const fn = _sections()[currentSection];
  if (typeof fn === 'function') fn();
}

// ── UI Toggle (Filtri / Numeri) — copia da shared/app.js ──────────────────
const _UI_TOGGLE_DEFAULT = { hideFilters: false, hideKpis: false };
function _uiKey() { return 'qg_ui_TUTTO'; }
function _uiState() {
  if (!window._uiStateCache) {
    try {
      const raw = localStorage.getItem(_uiKey());
      window._uiStateCache = raw ? Object.assign({}, _UI_TOGGLE_DEFAULT, JSON.parse(raw)) : Object.assign({}, _UI_TOGGLE_DEFAULT);
    } catch (e) { window._uiStateCache = Object.assign({}, _UI_TOGGLE_DEFAULT); }
  }
  return window._uiStateCache;
}
function _uiSave() { try { localStorage.setItem(_uiKey(), JSON.stringify(_uiState())); } catch (e) {} }

const _UI_FILTER_TARGETS = ['#periodFilter', '#periodFilterFine', '#quickFilters', '.filters', '#activeFilters'];

function _uiApply() {
  const s = _uiState();
  _UI_FILTER_TARGETS.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => { el.style.display = s.hideFilters ? 'none' : ''; });
  });
  const kpis = document.getElementById('filteredKpis');
  if (kpis) kpis.style.display = s.hideKpis ? 'none' : '';
  const tf = document.getElementById('ui-toggle-filters');
  const tk = document.getElementById('ui-toggle-kpis');
  if (tf) { tf.classList.toggle('active', !s.hideFilters); tf.innerHTML = (s.hideFilters ? '&#9654;' : '&#9660;') + ' Filtri'; }
  if (tk) { tk.classList.toggle('active', !s.hideKpis);    tk.innerHTML = (s.hideKpis ? '&#9654;' : '&#9660;') + ' Numeri'; }
}
function uiToggleFilters() { _uiState().hideFilters = !_uiState().hideFilters; _uiSave(); _uiApply(); }
function uiToggleKpis()    { _uiState().hideKpis    = !_uiState().hideKpis;    _uiSave(); _uiApply(); }

function _uiInitToggles() {
  if (document.getElementById('ui-toggle-bar')) return;
  const logout = document.getElementById('qg-logout-btn');
  const bar = document.createElement('div');
  bar.id = 'ui-toggle-bar';
  bar.className = 'ui-toggle-bar';
  bar.innerHTML =
    '<button id="ui-toggle-filters" class="ui-toggle-btn" title="Mostra/nascondi filtri (F)" onclick="uiToggleFilters()">&#9660; Filtri</button>' +
    '<button id="ui-toggle-kpis" class="ui-toggle-btn" title="Mostra/nascondi numeri (K)" onclick="uiToggleKpis()">&#9660; Numeri</button>';
  if (logout) {
    logout.insertBefore(bar, logout.firstChild);
    const themeBtn = document.getElementById('qg-theme-toggle');
    if (themeBtn && themeBtn.parentElement !== logout) logout.appendChild(themeBtn);
  } else {
    const header = document.querySelector('.header');
    if (header) header.appendChild(bar);
  }
  document.addEventListener('keydown', e => {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') { uiToggleFilters(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { uiToggleKpis(); e.preventDefault(); }
  });
  _uiApply();
}

// ── Multi-BU Data Loader ───────────────────────────────────────────────────
async function loadAllBU() {
  const main = document.querySelector('.main');
  // Mostra spinner temporaneo
  const spinner = document.createElement('div');
  spinner.id = '_loading_spinner';
  spinner.style.cssText = 'text-align:center;padding:60px;color:var(--text2)';
  spinner.innerHTML = '<div style="font-size:32px;margin-bottom:12px">⏳</div><p>Caricamento dati da 11 settori…</p>';
  if (main) main.prepend(spinner);

  let loaded = 0;
  const results = await Promise.all(
    BU_FILES.map(async ({ code, file }) => {
      try {
        const r = await fetch(file);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const rows = await r.json();
        loaded++;
        if (spinner) spinner.querySelector('p').textContent =
          'Caricamento… ' + loaded + '/' + BU_FILES.length + ' settori';
        // Aggiungi _bu a ogni record
        return rows.map(row => Object.assign({}, row, { _bu: code }));
      } catch (e) {
        console.warn('[TUTTO] BU ' + code + ' error:', e.message);
        loaded++;
        return [];
      }
    })
  );

  // Rimuovi spinner
  const sp = document.getElementById('_loading_spinner');
  if (sp) sp.remove();

  return results.flat();
}

// ── Boot ───────────────────────────────────────────────────────────────────
(async function init() {
  try {
    const data = await loadAllBU();

    if (!data.length) {
      const main = document.querySelector('.main');
      if (main) main.innerHTML =
        '<div style="text-align:center;padding:60px">' +
        '<h2 style="color:var(--danger)">Nessun dato caricato</h2>' +
        '<p style="color:var(--text2);margin-top:8px">Assicurati di aprire la dashboard da un server locale:</p>' +
        '<p style="margin-top:8px"><code style="color:var(--accent)">cd ~/Desktop/STW && python3 serve.py</code></p>' +
        '</div>';
      return;
    }

    D = data;
    filtered = [...D];

    // Aggiorna header
    const sub = document.getElementById('header-sub');
    if (sub) sub.textContent = 'Qualifica Group · ' + D.length.toLocaleString('it-IT') +
      ' commesse · ' + BU_FILES.length + ' settori';

    // Init infrastruttura condivisa
    if (typeof initFilters === 'function') initFilters();
    if (typeof initQuickFilters === 'function') initQuickFilters();
    if (typeof renderFilteredKpis === 'function') renderFilteredKpis();
    _uiInitToggles();

    const startSection = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.defaultSection) || 'executive';
    showSec(startSection);

  } catch (e) {
    console.error('[TUTTO] init error:', e);
  }
})();
