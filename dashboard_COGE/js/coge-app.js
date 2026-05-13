/* ── COGE · App bootstrap & navigation ──
 * Coordinatore minimo per la dashboard COGE: section routing,
 * year selector, theme toggle. Non riusa app.js del kit perché
 * COGE non ha filtri/sezioni esplora delle BU.
 */

let cogeCurrentSection = 'riepilogo';

const COGE_SECTIONS = {
  riepilogo: renderCogeRiepilogo,
  hr:        renderCogeHr,
  indiretti: renderCogeIndiretti,
};

function cogeShowSec(name) {
  cogeCurrentSection = name;
  Object.keys(COGE_SECTIONS).forEach(k => {
    const el = document.getElementById('sec-' + k);
    if (el) el.classList.add('hidden');
  });
  const el = document.getElementById('sec-' + name);
  if (el) {
    el.classList.remove('hidden');
    const fn = COGE_SECTIONS[name];
    if (fn) fn();
  }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const active = document.querySelector('.nav-item[data-sec="' + name + '"]');
  if (active) active.classList.add('active');
}

function cogeYearChange(y) {
  COGE.year = parseInt(y);
  cogeBuildAggregates();
  // Re-render current section
  const fn = COGE_SECTIONS[cogeCurrentSection];
  if (fn) fn();
}

function cogeToggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('hidden');
  document.querySelector('.main').classList.toggle('full');
}

function cogeToggleTheme() {
  const isLight = document.body.classList.toggle('theme-light');
  localStorage.setItem('qg_theme', isLight ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = isLight ? '☀️' : '🌙';
}

(function initTheme() {
  if (localStorage.getItem('qg_theme') === 'light') {
    document.body.classList.add('theme-light');
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = '☀️';
  }
})();

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  // Popola year selector con anni 2022..2027
  const yearSel = document.getElementById('cogeYear');
  if (yearSel) {
    for (let y = 2022; y <= 2027; y++) {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      if (y === COGE.year) opt.selected = true;
      yearSel.appendChild(opt);
    }
    yearSel.addEventListener('change', e => cogeYearChange(e.target.value));
  }
  cogeLoadAll().then(() => cogeShowSec('riepilogo'));
});
