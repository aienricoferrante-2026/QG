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
  explore: () => typeof renderExplore === 'function' && renderExplore()
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

const _CORE_DATA_URL = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.dataFile) || 'data/commesse.json';

fetch(window.DATA_URL || _CORE_DATA_URL)
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
  .then(data => {
    D = Array.isArray(data) ? data : [];
    filtered = [...D];
    initFilters();
    if (typeof initQuickFilters === 'function') initQuickFilters();
    renderFilteredKpis();
    const startSection = (window.SECTOR_CONFIG && window.SECTOR_CONFIG.defaultSection) || 'executive';
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
