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
  analisiCliente: renderAnalisiCliente
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

// Load data
fetch('data/commesse_for.json')
  .then(r => r.json())
  .then(data => {
    D = data;
    filtered = [...D];
    initFilters();
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
