/* ── Offerte · Mini-briefing filtri attivi ──
 * Banner narrativo sotto i filtri che si aggiorna a ogni applyFilters().
 * Adattato al dominio Offerte (pipeline commerciale, non commesse):
 *   - Top categoria, top agente, anno prevalente
 *   - Status prevalente (Contrattualizzata vs altre)
 *   - Valore pipeline (somma totale)
 */

function _offTopBy(items, key, n) {
  const c = {};
  items.forEach(it => {
    const v = (it[key] || '').trim();
    if (!v || v === '***') return;
    c[v] = (c[v] || 0) + 1;
  });
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function _offBfFmtE(n) {
  n = Number(n || 0);
  const abs = Math.abs(n), s = n < 0 ? '-' : '';
  if (abs >= 1e6) return s + '€ ' + (abs/1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return s + '€ ' + (abs/1e3).toFixed(1) + 'K';
  return s + '€ ' + abs.toFixed(0);
}

function _offBfFmt(n) { return Number(n||0).toLocaleString('it-IT'); }

function _offBfStorageKey() { return 'qg_briefing_hide_OFFERTE'; }
function _offBfIsHidden() {
  try { return localStorage.getItem(_offBfStorageKey()) === '1'; } catch (e) { return false; }
}
function _offBfSetHidden(v) {
  try { localStorage.setItem(_offBfStorageKey(), v ? '1' : '0'); } catch (e) {}
}

function _offEnsureContainer() {
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

function renderOffBriefing() {
  if (typeof D === 'undefined' || typeof filtered === 'undefined') return;
  const el = _offEnsureContainer();
  if (!el) return;

  if (_offBfIsHidden()) {
    el.innerHTML = '<button class="briefing-show" onclick="_offBfToggle(false)">📋 Mostra briefing</button>';
    return;
  }

  const tot = D.length;
  const n = filtered.length;
  const pctFilt = tot ? (n / tot * 100) : 0;
  const valoreTot = filtered.reduce((s, c) => s + (parseFloat(c.totale) || 0), 0);
  const chiuse = filtered.filter(c => /contrattualizzata|chiusa/i.test(c.status || '')).length;
  const pctConv = n ? (chiuse / n * 100) : 0;
  const topCat = _offTopBy(filtered, 'categoria', 1)[0];
  const topAg = _offTopBy(filtered, 'agente', 1)[0];
  const annoTop = _offTopBy(filtered, 'anno', 1)[0];

  const isFilt = n !== tot;
  const headerLine = isFilt
    ? '<b>' + _offBfFmt(n) + '</b> offerte filtrate · ' + pctFilt.toFixed(1) + '% del totale (' + _offBfFmt(tot) + ')'
    : '<b>' + _offBfFmt(n) + '</b> offerte · vista completa (nessun filtro)';

  let h = '<div class="briefing-head">';
  h += '<span class="briefing-title">📋 Cosa stai vedendo</span>';
  h += '<button class="briefing-x" onclick="_offBfToggle(true)" title="Nascondi briefing">✕</button>';
  h += '</div>';
  h += '<div class="briefing-body">';
  h += '<p>' + headerLine + '. Valore complessivo offerte: <b>' + _offBfFmtE(valoreTot) + '</b>. ';
  h += 'Tasso conversione (contrattualizzate): <b>' + pctConv.toFixed(1) + '%</b>.</p>';
  h += '<p>';
  if (topAg) h += 'Commerciale top: <b>' + topAg[0] + '</b> (' + _offBfFmt(topAg[1]) + ' offerte). ';
  if (topCat) h += 'Categoria prevalente: <b>' + topCat[0] + '</b> (' + _offBfFmt(topCat[1]) + ' offerte). ';
  if (annoTop) h += 'Anno top: <b>' + annoTop[0] + '</b> (' + _offBfFmt(annoTop[1]) + ' offerte).';
  h += '</p>';
  h += '</div>';
  el.innerHTML = h;
}

function _offBfToggle(hide) { _offBfSetHidden(hide); renderOffBriefing(); }
