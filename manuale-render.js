/* ── Manuale d'Uso · render vanilla JS ──
 * Consuma MANUALE_AREE e MANUALE_SECTIONS da manuale-data.js.
 *
 * UI: header con ricerca + conteggio · chip cliccabili per le aree
 * (scroll smooth ad ancora) · grid responsiva di card per area ·
 * empty state se i filtri svuotano tutto.
 *
 * Filtra full-text su title + desc + bullets. Case-insensitive.
 */

let _manuFilter = '';

function _manuMatch(item, q) {
  if (!q) return true;
  const hay = (item.title + ' ' + item.desc + ' ' + (item.bullets || []).join(' ')).toLowerCase();
  return hay.includes(q.toLowerCase());
}

function _manuCardHtml(item) {
  const bullets = (item.bullets || []).map(b =>
    '<li>' + b + '</li>').join('');
  const badge = item.badge
    ? '<span class="manu-badge manu-badge-' + item.accent + '">' + item.badge + '</span>'
    : '';
  const isExt = item.href && !item.href.startsWith('#') && !item.href.endsWith('/');
  const isAnchor = item.href && item.href.startsWith('#');
  const target = isExt ? ' target="_blank" rel="noopener"' : '';
  return '<a href="' + (item.href || '#') + '" class="manu-card manu-card-' + item.accent + '"' + target + '>' +
    '<div class="manu-card-head">' +
      '<div class="manu-icon manu-icon-' + item.accent + '">' + (item.icon || '•') + '</div>' +
      '<div class="manu-card-titles">' +
        '<h4>' + item.title + ' ' + badge + '</h4>' +
      '</div>' +
    '</div>' +
    '<p class="manu-desc">' + item.desc + '</p>' +
    (bullets ? '<ul class="manu-bullets">' + bullets + '</ul>' : '') +
    '<div class="manu-card-foot">' +
      '<code class="manu-path">' + (item.href || '—') + '</code>' +
      '<span class="manu-arrow">' + (isAnchor ? 'Vai ↓' : 'Apri →') + '</span>' +
    '</div>' +
  '</a>';
}

function renderManuale() {
  const root = document.getElementById('manuale-body');
  if (!root) return;
  const q = _manuFilter.trim();

  // Filtra per query
  const filtered = MANUALE_SECTIONS.filter(it => _manuMatch(it, q));
  const aree = MANUALE_AREE.filter(a => filtered.some(it => it.area === a.id));

  const conteggio = filtered.length + ' sezioni · ' + aree.length + ' aree';
  document.getElementById('manuale-count').textContent = conteggio;

  // Chip indice ancore
  const chipsHost = document.getElementById('manuale-chips');
  chipsHost.innerHTML = MANUALE_AREE.map(a => {
    const hits = filtered.filter(it => it.area === a.id).length;
    const enabled = hits > 0;
    return '<a href="' + (enabled ? '#manuale-area-' + a.id : '#') + '" class="manu-chip' + (enabled ? '' : ' manu-chip-off') + '"' +
      (enabled ? ' onclick="event.stopPropagation()"' : ' onclick="event.preventDefault();return false"') + '>' +
      a.label + ' <span class="manu-chip-count">' + hits + '</span></a>';
  }).join('');

  // Empty state
  if (!filtered.length) {
    root.innerHTML = '<div class="manu-empty">' +
      '<div style="font-size:48px;margin-bottom:8px">🔍</div>' +
      '<p>Nessuna sezione corrisponde a "<b>' + q + '</b>".</p>' +
      '<button class="manu-clear" onclick="manuClearFilter()">Pulisci filtro</button>' +
      '</div>';
    return;
  }

  // Grid per area
  let h = '';
  aree.forEach(a => {
    const items = filtered.filter(it => it.area === a.id);
    h += '<section class="manu-area" id="manuale-area-' + a.id + '">' +
      '<header class="manu-area-head">' +
        '<h3>' + a.label + '</h3>' +
        '<p class="manu-area-desc">' + a.desc + '</p>' +
      '</header>' +
      '<div class="manu-grid">' +
        items.map(_manuCardHtml).join('') +
      '</div>' +
    '</section>';
  });
  root.innerHTML = h;
}

function manuSetFilter(value) {
  _manuFilter = value || '';
  renderManuale();
}

function manuClearFilter() {
  _manuFilter = '';
  const inp = document.getElementById('manuale-search');
  if (inp) inp.value = '';
  renderManuale();
}

document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('manuale-search');
  if (inp) {
    inp.addEventListener('input', e => manuSetFilter(e.target.value));
  }
  renderManuale();
});
