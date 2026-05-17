/* ── FOR_OPP · Mini-briefing filtri attivi ──
 * Banner narrativo per Opportunità GOL: top corso, top CPI, top operatore,
 * status pipeline, conteggio per stato di rendicontazione.
 */

function _oppTopBy(items, key, n) {
  const c = {};
  items.forEach(it => {
    const v = (it[key] || '').trim();
    if (!v || v === '***') return;
    c[v] = (c[v] || 0) + 1;
  });
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function _oppBfFmt(n) { return Number(n||0).toLocaleString('it-IT'); }

function _oppBfStorageKey() { return 'qg_briefing_hide_FOROPP'; }
function _oppBfIsHidden() {
  try { return localStorage.getItem(_oppBfStorageKey()) === '1'; } catch (e) { return false; }
}
function _oppBfSetHidden(v) {
  try { localStorage.setItem(_oppBfStorageKey(), v ? '1' : '0'); } catch (e) {}
}

function _oppEnsureContainer() {
  let el = document.getElementById('sec-briefing');
  if (el) return el;
  el = document.createElement('div');
  el.id = 'sec-briefing';
  el.className = 'briefing';
  const fk = document.getElementById('filteredKpis');
  const af = document.getElementById('activeFilters');
  if (fk && fk.parentNode) fk.parentNode.insertBefore(el, fk);
  else if (af && af.parentNode) af.parentNode.insertBefore(el, af.nextSibling);
  else { const main = document.querySelector('.main'); if (main) main.appendChild(el); }
  return el;
}

function renderOppBriefing() {
  if (typeof D === 'undefined' || typeof filtered === 'undefined') return;
  const el = _oppEnsureContainer();
  if (!el) return;

  if (_oppBfIsHidden()) {
    el.innerHTML = '<button class="briefing-show" onclick="_oppBfToggle(false)">📋 Mostra briefing</button>';
    return;
  }

  const tot = D.length;
  const n = filtered.length;
  const pctFilt = tot ? (n / tot * 100) : 0;
  const topCorso = _oppTopBy(filtered, 'corso', 1)[0];
  const topCpi = _oppTopBy(filtered, 'cpi', 1)[0];
  const topOp = _oppTopBy(filtered, 'operatore', 1)[0];
  const topStatus = _oppTopBy(filtered, 'status', 1)[0];
  const conRend = filtered.filter(c => c.rendicontazione && c.rendicontazione !== '***').length;
  const pctRend = n ? (conRend / n * 100) : 0;

  const isFilt = n !== tot;
  const headerLine = isFilt
    ? '<b>' + _oppBfFmt(n) + '</b> opportunità filtrate · ' + pctFilt.toFixed(1) + '% del totale (' + _oppBfFmt(tot) + ')'
    : '<b>' + _oppBfFmt(n) + '</b> opportunità · vista completa (nessun filtro)';

  let h = '<div class="briefing-head">';
  h += '<span class="briefing-title">📋 Cosa stai vedendo</span>';
  h += '<button class="briefing-x" onclick="_oppBfToggle(true)" title="Nascondi briefing">✕</button>';
  h += '</div>';
  h += '<div class="briefing-body">';
  h += '<p>' + headerLine + '. ';
  if (topStatus) h += 'Status prevalente: <b>' + topStatus[0] + '</b> (' + _oppBfFmt(topStatus[1]) + '). ';
  h += 'Con rendicontazione assegnata: <b>' + _oppBfFmt(conRend) + '</b> (' + pctRend.toFixed(1) + '%).</p>';
  h += '<p>';
  if (topCorso) h += 'Corso più richiesto: <b>' + topCorso[0].substring(0, 50) + '</b> (' + _oppBfFmt(topCorso[1]) + '). ';
  if (topCpi) h += 'CPI top: <b>' + topCpi[0] + '</b> (' + _oppBfFmt(topCpi[1]) + '). ';
  if (topOp) h += 'Operatore top: <b>' + topOp[0] + '</b> (' + _oppBfFmt(topOp[1]) + ').';
  h += '</p></div>';
  el.innerHTML = h;
}

function _oppBfToggle(hide) { _oppBfSetHidden(hide); renderOppBriefing(); }
