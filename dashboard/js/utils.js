/* Formatting utilities */
const fmt = n => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtE = n => (n || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' \u20ac';
const fmtP = n => (n || 0).toFixed(1) + '%';

/* Tag helpers */
const tagEsec = v => '<span class="tag ' + (v >= 60 ? 'tag-green' : v >= 40 ? 'tag-yellow' : 'tag-red') + '">' + fmtP(v) + '</span>';

function tagPag(s) {
  if (!s) return '';
  if (s.includes('Verde') && s.includes('Saldato')) return '<span class="tag tag-green">Saldato</span>';
  if (s.includes('Giallo Rosso')) return '<span class="tag tag-red">Insoluto</span>';
  if (s.includes('Giallo')) return '<span class="tag tag-yellow">Da lavorare</span>';
  if (s.includes('Blu')) return '<span class="tag tag-blue">Accordi</span>';
  if (s.includes('Arancione')) return '<span class="tag tag-purple">Acconto</span>';
  if (s.includes('Omaggio')) return '<span class="tag tag-pink">Omaggio</span>';
  return '<span class="tag">' + s.substring(0, 20) + '</span>';
}

/* KPI card builder */
function renderKpiGrid(containerId, kpis) {
  document.getElementById(containerId).innerHTML = kpis.map(k =>
    '<div class="kpi-card ' + k.c + '">' +
    '<div class="kpi-val">' + k.v + '</div>' +
    '<div class="kpi-lbl">' + k.l + '</div>' +
    (k.s ? '<div class="kpi-sub">' + k.s + '</div>' : '') +
    '</div>'
  ).join('');
}
