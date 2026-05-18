/* ── Helper "Pivot ad albero" del kit condiviso ──────────────────
 * Costruisce una card pivot multi-livello configurabile riusabile
 * da qualsiasi sezione di una BU (Caso 1 o Caso 2).
 *
 * USO (in una sezione BU):
 *   buildPivotCard({
 *     containerId: 'sec-bandi',        // DOM container dove inserire
 *     cardId: 'fiaPivotCard',          // id univoco card (per re-render)
 *     title: '🌳 Pivot Bandi · esplora gerarchico',
 *     description: 'Scegli ordine dimensioni...',
 *     stateNamespace: 'fia',           // per isolare state (window._fiaPivot*)
 *     dims: {                          // dimensioni disponibili
 *       status:    { label: 'Status',  extract: c => c.status || 'N/D' },
 *       bando:     { label: 'Bando',   extract: c => _fiaBando(c) },
 *       ...
 *     },
 *     presets: [
 *       { label: '...', dims: ['status', 'bando', '', ''] },
 *       ...
 *     ],
 *     defaultDims: ['status', 'bando', '', ''],
 *     items: filtered,                 // dati su cui calcolare
 *     onDrill: (path, label, list) => drillDownItems(label, list),
 *   });
 *
 * Il modulo gestisce:
 *   - Preset chips + 4 dropdown
 *   - Render tabella ad albero con metriche complete
 *   - Toggle espansione (▶ / ▼)
 *   - Drill click su riga
 *   - Espandi tutto / Comprimi
 *   - State isolato per BU via stateNamespace
 *
 * Dipendenze: fmt, fmtE (utils), drillDownItems (drilldown).
 */

window._pivotState = window._pivotState || {};

function buildPivotCard(opts) {
  const ns = opts.stateNamespace || 'default';
  if (!window._pivotState[ns]) {
    window._pivotState[ns] = {
      dims: [...(opts.defaultDims || ['', '', '', ''])],
      open: new Set(),
    };
  }
  const state = window._pivotState[ns];
  // Salva config per re-render
  window._pivotState[ns]._opts = opts;

  const root = document.getElementById(opts.containerId);
  if (!root) return;
  const cardId = opts.cardId || (ns + 'PivotCard');
  const old = document.getElementById(cardId);
  if (old) old.remove();

  const card = document.createElement('div');
  card.id = cardId;
  card.className = 'card';
  card.style.cssText = 'margin-top:14px;border-left:3px solid #6366f1';

  let h = '<h4>' + (opts.title || '🌳 Pivot · esplora gerarchico') + '</h4>';
  if (opts.description) {
    h += '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">' + opts.description + '</p>';
  }

  // Preset chips
  if (opts.presets && opts.presets.length) {
    h += '<div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px">';
    h += '<span style="color:var(--text3);font-size:11px;align-self:center;text-transform:uppercase;letter-spacing:.3px;margin-right:6px">⚡ Preset:</span>';
    opts.presets.forEach((p, i) => {
      const active = JSON.stringify(p.dims) === JSON.stringify(state.dims);
      h += '<button onclick="_pivotSetPreset(\'' + ns + '\',' + i + ')" style="padding:5px 10px;border-radius:14px;font-size:10px;cursor:pointer;border:1px solid ' +
        (active ? 'var(--accent)' : 'var(--border)') + ';background:' +
        (active ? 'rgba(99,102,241,.18)' : 'var(--card)') + ';color:var(--text)">' + p.label + '</button>';
    });
    h += '</div>';
  }

  // 4 dropdown livelli
  h += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;padding:10px;background:rgba(99,102,241,.04);border-radius:5px">';
  for (let i = 0; i < 4; i++) {
    h += '<label style="display:flex;flex-direction:column;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.3px">Livello ' + (i + 1) +
      '<select onchange="_pivotSetDim(\'' + ns + '\',' + i + ',this.value)" style="margin-top:4px;padding:5px 8px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);font-size:12px;min-width:160px">';
    h += '<option value=""' + (!state.dims[i] ? ' selected' : '') + '>— Nessuno —</option>';
    Object.entries(opts.dims).forEach(([k, d]) => {
      h += '<option value="' + k + '"' + (state.dims[i] === k ? ' selected' : '') + '>' + d.label + '</option>';
    });
    h += '</select></label>';
  }
  h += '<button onclick="_pivotExpandAll(\'' + ns + '\')" style="margin-left:auto;align-self:flex-end;padding:6px 12px;border-radius:5px;background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);cursor:pointer;font-size:11px">Espandi tutto</button>';
  h += '<button onclick="_pivotCollapseAll(\'' + ns + '\')" style="align-self:flex-end;padding:6px 12px;border-radius:5px;background:var(--card);border:1px solid var(--border);color:var(--text);cursor:pointer;font-size:11px">Comprimi</button>';
  h += '</div>';

  // Tabella ad albero con metriche complete
  const dims = state.dims.filter(Boolean);
  h += '<div class="tbl-scroll"><table class="coge-tbl" style="width:100%;font-size:11px"><thead><tr>';
  h += '<th style="width:32px"></th>';
  dims.forEach((d, i) => h += '<th>' + (i === 0 ? opts.dims[d].label : '↳ ' + opts.dims[d].label) + '</th>');
  h += '<th style="text-align:right">Commesse</th><th style="text-align:right">Ricavi</th><th style="text-align:right">MOL</th>' +
    '<th style="text-align:right">Margine %</th><th style="text-align:right">Incassato</th><th style="text-align:right">% Inc.</th>' +
    '<th style="text-align:right">Da Inc.</th><th style="text-align:right">Clienti</th><th style="text-align:right">Ticket €</th><th style="width:60px"></th>';
  h += '</tr></thead><tbody>' + _pivotRenderRows(ns, opts.items, dims, [], opts) + '</tbody></table></div>';

  card.innerHTML = h;
  root.querySelector('.sec').appendChild(card);
}

function _pivotValAt(c, dim, opts) {
  if (!dim || !opts.dims[dim]) return ['N/D'];
  const v = opts.dims[dim].extract(c);
  return Array.isArray(v) ? (v.length ? v : ['N/D']) : [v == null || v === '' ? 'N/D' : v];
}

function _pivotAggrLevel(items, dim, opts) {
  const g = {};
  items.forEach(c => {
    const vals = _pivotValAt(c, dim, opts);
    vals.forEach(v => {
      if (!g[v]) g[v] = { items: [], ric: 0, mol: 0, inc: 0, daInc: 0, clienti: new Set() };
      g[v].items.push(c);
      g[v].ric += (c.consulenza || 0);
      g[v].mol += (c.mol || 0);
      g[v].inc += (c.giaIncassato || 0);
      g[v].daInc += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
      if (c.cliente) g[v].clienti.add(c.cliente);
    });
  });
  return g;
}

function _pivotPathKey(path) { return path.join('>'); }

function _pivotRenderRows(ns, items, dims, path, opts) {
  if (!dims.length) return '';
  const state = window._pivotState[ns];
  const dim = dims[0];
  const remaining = dims.slice(1);
  const g = _pivotAggrLevel(items, dim, opts);
  const entries = Object.entries(g).sort((a, b) => b[1].ric - a[1].ric);
  let html = '';
  entries.forEach(([val, v]) => {
    const newPath = [...path, val];
    const pathKey = _pivotPathKey(newPath);
    const isOpen = state.open.has(pathKey);
    const isLeaf = remaining.length === 0;
    const safeKey = pathKey.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const arrow = isLeaf ? '·' : (isOpen ? '▼' : '▶');
    const cursor = isLeaf ? '' : 'cursor:pointer;';
    const margPct = v.ric ? (v.mol / v.ric * 100) : 0;
    const incPct = v.ric ? (v.inc / v.ric * 100) : 0;
    const ticket = v.items.length ? (v.ric / v.items.length) : 0;
    const marC = margPct >= 20 ? '#10b981' : margPct >= 5 ? '#f59e0b' : '#dc2626';
    const incC = incPct >= 80 ? '#10b981' : incPct >= 50 ? '#f59e0b' : '#dc2626';
    const cellClick = ' onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')" style="text-align:right;cursor:pointer"';
    html += '<tr style="background:rgba(99,102,241,' + (0.02 * path.length) + ')">';
    html += '<td style="text-align:center;color:var(--accent);' + cursor + '"' +
      (isLeaf ? '' : ' onclick="event.stopPropagation();_pivotToggle(\'' + ns + '\',\'' + safeKey + '\')"') + '>' + arrow + '</td>';
    for (let i = 0; i < dims.length; i++) {
      if (i === path.length) {
        const indent = path.length * 16;
        html += '<td style="padding-left:' + (10 + indent) + 'px;cursor:pointer" onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')" title="Apri elenco commesse"><b>' + val + '</b></td>';
      } else if (i < path.length) html += '<td style="color:var(--text3)"></td>';
      else html += '<td></td>';
    }
    html += '<td' + cellClick + '>' + fmt(v.items.length) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(v.ric) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(v.mol) + '</td>';
    html += '<td style="text-align:right;cursor:pointer;color:' + marC + '" onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')">' + margPct.toFixed(1) + '%</td>';
    html += '<td' + cellClick + '>' + fmtE(v.inc) + '</td>';
    html += '<td style="text-align:right;cursor:pointer;color:' + incC + '" onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')">' + incPct.toFixed(0) + '%</td>';
    html += '<td' + cellClick + '>' + fmtE(v.daInc) + '</td>';
    html += '<td' + cellClick + '>' + fmt(v.clienti.size) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(ticket) + '</td>';
    html += '<td style="text-align:right"><a href="#" onclick="event.preventDefault();_pivotDrill(\'' + ns + '\',\'' + safeKey + '\');return false" style="color:var(--accent);font-size:11px;text-decoration:none">apri →</a></td>';
    html += '</tr>';
    if (isOpen && !isLeaf) html += _pivotRenderRows(ns, v.items, remaining, newPath, opts);
  });
  return html;
}

function _pivotRerender(ns) {
  const opts = window._pivotState[ns]._opts;
  if (opts) buildPivotCard(opts);
}

function _pivotToggle(ns, k) {
  const s = window._pivotState[ns];
  if (s.open.has(k)) s.open.delete(k); else s.open.add(k);
  _pivotRerender(ns);
}

function _pivotDrill(ns, pathKey) {
  const state = window._pivotState[ns];
  const opts = state._opts;
  const path = pathKey.split('>');
  const dims = state.dims.filter(Boolean).slice(0, path.length);
  const list = opts.items.filter(c => {
    for (let i = 0; i < path.length; i++) {
      const vals = _pivotValAt(c, dims[i], opts);
      if (!vals.includes(path[i])) return false;
    }
    return true;
  });
  const label = dims.map((d, i) => opts.dims[d].label + '=' + path[i]).join(' · ');
  if (typeof opts.onDrill === 'function') opts.onDrill(path, label, list);
  else if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}

function _pivotSetDim(ns, lv, dim) {
  const s = window._pivotState[ns];
  s.dims[lv] = dim;
  s.open.clear();
  _pivotRerender(ns);
}

function _pivotSetPreset(ns, idx) {
  const s = window._pivotState[ns];
  s.dims = [...s._opts.presets[idx].dims];
  s.open.clear();
  _pivotRerender(ns);
}

function _pivotExpandAll(ns) {
  const s = window._pivotState[ns];
  const opts = s._opts;
  const dims = s.dims.filter(Boolean);
  if (dims.length <= 1) return;
  function _walk(items, d, path) {
    if (d >= dims.length - 1) return;
    const g = _pivotAggrLevel(items, dims[d], opts);
    Object.entries(g).forEach(([v, vd]) => { const np = [...path, v]; s.open.add(_pivotPathKey(np)); _walk(vd.items, d + 1, np); });
  }
  _walk(opts.items, 0, []);
  _pivotRerender(ns);
}

function _pivotCollapseAll(ns) {
  window._pivotState[ns].open.clear();
  _pivotRerender(ns);
}
