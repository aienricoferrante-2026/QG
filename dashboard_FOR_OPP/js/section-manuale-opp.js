/* ── FOR_OPP · Sezione Manuale d'Uso (autonoma, NON usa il kit) ──
 * Auto-registra in SECTIONS dopo che app.js l'ha dichiarato.
 */

let _oppManFilter = '';

function _oppManMatch(it, q) {
  if (!q) return true;
  return (it.title + ' ' + it.desc + ' ' + (it.bullets || []).join(' ')).toLowerCase().includes(q.toLowerCase());
}

function _oppManCardHtml(item) {
  const bullets = (item.bullets || []).map(b => '<li>' + b + '</li>').join('');
  const href = item.sec ? "javascript:showSec('" + item.sec + "')" : '#';
  return '<a href="' + href + '" class="manu-card manu-card-' + item.accent + '">' +
    '<div class="manu-card-head">' +
      '<div class="manu-icon manu-icon-' + item.accent + '">' + item.icon + '</div>' +
      '<div class="manu-card-titles"><h4>' + item.title + '</h4></div>' +
    '</div>' +
    '<p class="manu-desc">' + item.desc + '</p>' +
    (bullets ? '<ul class="manu-bullets">' + bullets + '</ul>' : '') +
    '<div class="manu-card-foot">' +
      '<code class="manu-path">#' + item.sec + '</code>' +
      '<span class="manu-arrow">Apri →</span>' +
    '</div></a>';
}

function renderOppManuale() {
  const el = document.getElementById('sec-manuale');
  if (!el) return;
  const q = _oppManFilter.trim();
  const all = OPP_MANUALE_SECTIONS.filter(it => _oppManMatch(it, q));
  const aree = OPP_MANUALE_AREE.filter(a => all.some(it => it.area === a.id));

  let h = '<div class="sec"><h3 class="sec-title">📖 Manuale d\'Uso · Opportunità Formazione GOL</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Guida visiva alle 7 sezioni della dashboard Opportunità.</p>';
  h += '<div class="manu-header">';
  h += '<span class="manu-count">' + all.length + ' sezioni · ' + aree.length + ' aree</span>';
  h += '<input type="search" class="manu-search" placeholder="🔍 Cerca…" value="' + q.replace(/"/g, '&quot;') + '" oninput="oppManFilter(this.value)" autocomplete="off">';
  h += '</div>';
  h += '<div class="manu-chips">';
  OPP_MANUALE_AREE.forEach(a => {
    const hits = all.filter(it => it.area === a.id).length;
    const enabled = hits > 0;
    h += '<a href="' + (enabled ? '#oppManArea-' + a.id : '#') + '" class="manu-chip' + (enabled ? '' : ' manu-chip-off') + '"' +
      (enabled ? '' : ' onclick="event.preventDefault();return false"') + '>' +
      a.label + ' <span class="manu-chip-count">' + hits + '</span></a>';
  });
  h += '</div>';
  if (!all.length) {
    h += '<div class="manu-empty"><div style="font-size:48px;margin-bottom:8px">🔍</div>' +
      '<p>Nessuna sezione corrisponde a "<b>' + q + '</b>".</p>' +
      '<button class="manu-clear" onclick="oppManFilter(\'\')">Pulisci filtro</button></div>';
  } else {
    aree.forEach(a => {
      const items = all.filter(it => it.area === a.id);
      h += '<section class="manu-area" id="oppManArea-' + a.id + '">' +
        '<header class="manu-area-head"><h3>' + a.label + '</h3>' +
        '<p class="manu-area-desc">' + a.desc + '</p></header>' +
        '<div class="manu-grid">' + items.map(_oppManCardHtml).join('') + '</div></section>';
    });
  }
  h += '</div>';
  el.innerHTML = h;
}

function oppManFilter(v) { _oppManFilter = v || ''; renderOppManuale(); }

if (typeof SECTIONS !== 'undefined') SECTIONS.manuale = renderOppManuale;
