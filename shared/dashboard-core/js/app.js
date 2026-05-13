/* ── App Bootstrap & Navigation (core multi-settore) ── */

let D = [];
let filtered = [];
let currentSection = 'executive';

const SECTIONS_DEFAULT = {
  executive: () => typeof renderExecutive === 'function' && renderExecutive(),
  ricavi: () => typeof renderRicavi === 'function' && renderRicavi(),
  econFin: () => typeof renderEconFin === 'function' && renderEconFin(),
  analisiIncassi: () => typeof renderAnalisiIncassi === 'function' && renderAnalisiIncassi(),
  responsabili: () => typeof renderResponsabili === 'function' && renderResponsabili(),
  clienti: () => typeof renderClienti === 'function' && renderClienti(),
  sedi: () => typeof renderSedi === 'function' && renderSedi(),
  avanzamento: () => typeof renderAvanzamento === 'function' && renderAvanzamento(),
  alert: () => typeof renderAlert === 'function' && renderAlert(),
  linkPartner: () => typeof renderLinkPartner === 'function' && renderLinkPartner(),
  explore: () => typeof renderExplore === 'function' && renderExplore(),
  wiki: () => typeof renderWiki === 'function' && renderWiki(),
  produttivita: () => typeof renderProduttivita === 'function' && renderProduttivita()
};

function _sections() {
  const cfg = window.SECTOR_CONFIG || {};
  if (cfg.sections) return cfg.sections;
  // extraSections: lista di nomi sezione (es. ["enti", "audit"]).
  // Per ognuno, il kit cerca window['render' + Capitalized] definito dalla BU.
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

/* ── UI toggles: nasconde/mostra i blocchi Filtri e KPI globali ──
   Preferenza per BU in localStorage (qg_ui_<BU>). Tasti F (toggle filtri),
   K (toggle KPI) attivi se non si sta digitando in un input. */
const _UI_TOGGLE_DEFAULT = { hideFilters: false, hideKpis: false };
function _uiKey() { return 'qg_ui_' + (typeof sectorCode === 'function' ? sectorCode() : 'GEN'); }
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

const _UI_FILTER_TARGETS = ['#periodFilter', '#quickFilters', '.filters', '#activeFilters'];

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
  /* Toolbar Filtri/Numeri dentro #qg-logout-btn (header sticky in alto a dx).
     Fallback: nell'header del settore. */
  const logout = document.getElementById('qg-logout-btn');
  const bar = document.createElement('div');
  bar.id = 'ui-toggle-bar';
  bar.className = 'ui-toggle-bar';
  bar.innerHTML =
    '<button id="ui-toggle-filters" class="ui-toggle-btn" title="Mostra/nascondi filtri (F)" onclick="uiToggleFilters()">&#9660; Filtri</button>' +
    '<button id="ui-toggle-kpis" class="ui-toggle-btn" title="Mostra/nascondi numeri / KPI globali (K)" onclick="uiToggleKpis()">&#9660; Numeri</button>';
  if (logout) {
    /* Toolbar in TESTA al logout-btn, prima dell'avatar utente. */
    logout.insertBefore(bar, logout.firstChild);
    /* Riposiziono il theme toggle (luna/sole) dentro il logout-btn come
       ultimo elemento, se theme.js lo ha appeso al body prima che il
       logout-btn esistesse. Garantisce ordine: [Filtri][Numeri] · email · Esci · 🌙 */
    const themeBtn = document.getElementById('qg-theme-toggle');
    if (themeBtn && themeBtn.parentElement !== logout) logout.appendChild(themeBtn);
  } else {
    const header = document.querySelector('.header');
    if (header) header.appendChild(bar);
    else return;
  }
  document.addEventListener('keydown', e => {
    if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === 'f' || e.key === 'F') { uiToggleFilters(); e.preventDefault(); }
    else if (e.key === 'k' || e.key === 'K') { uiToggleKpis(); e.preventDefault(); }
  });
  _uiApply();
}

const _CORE_DATA_URL = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.dataFile) || 'data/commesse.json';

fetch(window.DATA_URL || _CORE_DATA_URL)
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(data => {
    D = Array.isArray(data) ? data : [];
    filtered = [...D];
    initFilters();
    if (typeof initQuickFilters === 'function') initQuickFilters();
    renderFilteredKpis();
    _uiInitToggles();
    const startSection = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.defaultSection) || 'explore';
    showSec(startSection);

    // Aggiorna count nell'header se presente
    const sub = document.querySelector('.header-sub');
    if (sub) sub.textContent = sub.textContent.replace(/\d[\d.,]*\s*commesse/i, fmt(D.length) + ' commesse');
  })
  .catch(e => {
    const main = document.querySelector('.main');
    if (main) {
      main.innerHTML =
        '<div style="text-align:center;padding:60px">' +
        '<h2 style="color:var(--danger)">Errore caricamento dati</h2>' +
        '<p style="color:var(--text2);margin-top:8px">File: <code>' + (window.DATA_URL || _CORE_DATA_URL) + '</code></p>' +
        '<p style="color:var(--text3);margin-top:8px;font-size:12px">' + (e.message || '') + '</p>' +
        '<p style="color:var(--text2);margin-top:8px">Avvia con un server locale:<br>' +
        '<code style="color:var(--accent)">python3 serve.py</code></p></div>';
    }
  });
