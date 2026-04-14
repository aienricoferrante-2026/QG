/* Main app: navigation and initialization */

let currentSec = 'executive';

/* Section router */
const sectionRenderers = {
  executive: renderExecutive,
  fatturato: renderFatturato,
  agenti: renderAgenti,
  responsabili: renderResponsabili,
  carico: renderCarico,
  contratti: renderContratti,
  pagamenti: renderPagamenti,
  crosstab: renderCrosstab,
  funnel: renderFunnel,
  geografia: renderGeografia,
  crosssell: renderCrossSell,
  retention: renderRetention,
  aging: renderAging,
  focus2026: renderFocus2026,
  alert: renderAlert,
};

function showSec(id) {
  document.querySelectorAll('[id^="sec-"]').forEach(el => el.classList.add('hidden'));
  document.getElementById('sec-' + id).classList.remove('hidden');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  event.target.closest('.nav-item').classList.add('active');
  currentSec = id;
  renderCurrentSection();
}

function renderCurrentSection() {
  const renderer = sectionRenderers[currentSec];
  if (renderer) renderer();
}

/* Init on DOM ready */
document.addEventListener('DOMContentLoaded', () => {
  initFilters();
  renderFilteredKpis();
  renderExecutive();
});
