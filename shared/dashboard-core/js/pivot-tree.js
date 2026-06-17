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

/* ── Colonne metriche del pivot (ordine = colonne tabella) ──────────────────
 * `val(c)` = valore della metrica sulla SINGOLA commessa, usato dal filtro
 * per colonna. Le colonne di CONTEGGIO (Commesse, Clienti) hanno filterable
 * false: su una sola riga varrebbero sempre 1 → filtro ingannevole. */
var PIVOT_COLS = [
  { id: 'commesse', label: 'Commesse', filterable: false },
  { id: 'ric',      label: 'Ricavi',    val: function (c) { return c.consulenza || 0; } },
  { id: 'mol',      label: 'MOL',       val: function (c) { return c.mol || 0; } },
  { id: 'marg',     label: 'Margine %', val: function (c) { var r = c.consulenza || 0; return r ? (c.mol || 0) / r * 100 : 0; } },
  { id: 'inc',      label: 'Incassato', val: function (c) { return c.giaIncassato || 0; } },
  { id: 'incpct',   label: '% Inc.',    val: function (c) { var r = c.consulenza || 0; return r ? (c.giaIncassato || 0) / r * 100 : 0; } },
  { id: 'dainc',    label: 'Da Inc.',   val: function (c) { return Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0)); } },
  { id: 'clienti',  label: 'Clienti',   filterable: false },
  { id: 'ticket',   label: 'Ticket €',  val: function (c) { return c.consulenza || 0; } },
];

/* Icona imbuto (stessa forma di lucide "Filter"). active=true → riempita. */
function _pivotFunnelSvg(active) {
  return '<svg width="11" height="11" viewBox="0 0 24 24" fill="' + (active ? 'currentColor' : 'none') +
    '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle">' +
    '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>';
}

/* Esito di UNA condizione sul valore per-riga. */
function _pivotPassOp(v, f) {
  switch (f.op) {
    case 'gt':  return v > f.a;
    case 'gte': return v >= f.a;
    case 'lt':  return v < f.a;
    case 'lte': return v <= f.a;
    case 'eq':  return v === f.a;
    case 'neq': return v !== f.a;
    case 'between': return v >= f.a && v <= (f.b != null ? f.b : f.a);
    default: return true;
  }
}

/* Filtra le commesse grezze: tiene solo quelle che passano TUTTE le condizioni
 * attive. L'albero e ogni totale si ricalcolano poi su ciò che resta. */
function _pivotApplyFilters(items, state) {
  var fs = (state && state.filters) || [];
  if (!fs.length) return items;
  return items.filter(function (c) {
    return fs.every(function (f) {
      var col = PIVOT_COLS.find(function (x) { return x.id === f.col; });
      if (!col || !col.val) return true;
      return _pivotPassOp(col.val(c), f);
    });
  });
}

function buildPivotCard(opts) {
  const ns = opts.stateNamespace || 'default';
  if (!window._pivotState[ns]) {
    window._pivotState[ns] = {
      dims: [...(opts.defaultDims || ['', '', '', ''])],
      open: new Set(),
    };
  }
  const state = window._pivotState[ns];
  if (!state.filters) state.filters = [];
  // Salva config per re-render
  window._pivotState[ns]._opts = opts;
  // Carica (una volta) le viste salvate dell'utente dall'Hub
  if (!state.savedViewsLoaded && !state._viewsLoading) _pivotLoadViews(ns);

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

  // Riga "Le mie viste" (preferiti salvati sull'Hub, per-utente)
  h += _pivotSavedViewsRowHtml(ns, state, opts);

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
  // Chip "filtri attivi · pulisci" (solo se almeno un filtro colonna è attivo)
  if (state.filters && state.filters.length) {
    h += '<div style="margin-left:auto;align-self:flex-end;display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:5px;background:rgba(99,102,241,.14);border:1px solid var(--accent);color:var(--accent);font-size:11px;cursor:pointer" ' +
      'onclick="_pivotClearAllFilters(\'' + ns + '\')" title="Rimuovi tutti i filtri colonna">' +
      _pivotFunnelSvg(true) + state.filters.length + ' ' + (state.filters.length === 1 ? 'filtro' : 'filtri') + ' ✕</div>';
  }
  h += '<button onclick="_pivotExpandAll(\'' + ns + '\')" style="' + (state.filters && state.filters.length ? '' : 'margin-left:auto;') + 'align-self:flex-end;padding:6px 12px;border-radius:5px;background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);cursor:pointer;font-size:11px">Espandi tutto</button>';
  h += '<button onclick="_pivotCollapseAll(\'' + ns + '\')" style="align-self:flex-end;padding:6px 12px;border-radius:5px;background:var(--card);border:1px solid var(--border);color:var(--text);cursor:pointer;font-size:11px">Comprimi</button>';
  h += '</div>';

  // Tabella ad albero · 1 colonna "Voce" con indentazione progressiva
  // (no più colonne separate per ogni dimensione → niente sfalsamento)
  const dims = state.dims.filter(Boolean);
  // Breadcrumb in cima alla tabella che mostra il percorso completo delle dimensioni
  h += '<div style="margin-bottom:8px;padding:8px 12px;background:rgba(99,102,241,.05);border-radius:5px;font-size:11px;color:var(--text2)">' +
       '<span style="color:var(--text3);text-transform:uppercase;letter-spacing:.4px;font-size:10px">Percorso:</span> ' +
       dims.map((d, i) => '<span style="color:' + ['#3b82f6','#10b981','#f59e0b','#a78bfa'][i] + ';font-weight:600">' +
                          (i + 1) + '. ' + opts.dims[d].label + '</span>').join(' <span style="color:var(--text3)">→</span> ') +
       '</div>';
  // Commesse filtrate (per colonna): l'albero e i totali si ricalcolano su queste
  const items = _pivotApplyFilters(opts.items, state);
  h += '<div class="tbl-scroll"><table class="coge-tbl" style="width:100%;font-size:11px"><thead><tr>';
  h += '<th style="width:32px"></th>';
  h += '<th>Voce</th>';
  PIVOT_COLS.forEach(function (col) {
    if (col.filterable === false) {
      h += '<th style="text-align:right">' + col.label + '</th>';
    } else {
      const fActive = state.filters.some(function (f) { return f.col === col.id; });
      h += '<th style="text-align:right"><span style="display:inline-flex;align-items:center;gap:4px;justify-content:flex-end">' + col.label +
        '<button onclick="event.stopPropagation();_pivotOpenFilter(\'' + ns + '\',\'' + col.id + '\',this)" ' +
        'title="Filtra ' + col.label + '" style="cursor:pointer;border:none;padding:2px;border-radius:3px;line-height:0;' +
        (fActive ? 'background:rgba(99,102,241,.18);color:var(--accent)' : 'background:transparent;color:var(--text3)') + '">' +
        _pivotFunnelSvg(fActive) + '</button></span></th>';
    }
  });
  h += '<th style="width:60px"></th>';
  let rowsHtml = '';
  try {
    rowsHtml = _pivotRenderRows(ns, items, dims, [], opts);
    if (!rowsHtml && dims.length) {
      rowsHtml = '<tr><td colspan="20" style="padding:20px;text-align:center;color:var(--text3)">' +
        (state.filters.length ? 'Nessuna commessa con i filtri attivi.' : 'Nessun dato.') + '</td></tr>';
    }
  } catch (e) {
    console.error('[pivot-tree] errore render ns=' + ns + ':', e);
    rowsHtml = '<tr><td colspan="20" style="padding:20px;text-align:center;color:#dc2626">' +
      '⚠ Errore nel render del pivot: <code>' + _pivotEscHtml(e.message) + '</code><br>' +
      '<span style="color:var(--text3);font-size:11px">Apri console (F12) per stack trace completo. Ricarica la pagina o cambia dimensione.</span></td></tr>';
  }
  h += '</tr></thead><tbody>' + rowsHtml + '</tbody></table></div>';

  card.innerHTML = h;
  const sec = root.querySelector('.sec');
  if (sec) sec.appendChild(card);
  else root.appendChild(card);
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

/* Escape per contenuto HTML (testo dentro <td>, <b>, ecc.) */
function _pivotEscHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* Escape per attributo HTML (es. dentro title="..."). */
function _pivotEscAttr(s) {
  return String(s == null ? '' : s).replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function _pivotRenderRows(ns, items, dims, path, opts) {
  if (!dims.length) return '';
  const state = window._pivotState[ns];
  const dim = dims[0];
  const remaining = dims.slice(1);
  const g = _pivotAggrLevel(items, dim, opts);
  const entries = Object.entries(g).sort((a, b) => b[1].ric - a[1].ric);
  const LEVEL_COLOR = ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa'];
  let html = '';
  entries.forEach(([valRaw, v]) => {
    // Difensivo: val potrebbe non essere stringa (number, null, ecc.)
    const val = String(valRaw == null ? 'N/D' : valRaw);
    const newPath = [...path, val];
    const pathKey = _pivotPathKey(newPath);
    const isOpen = state.open.has(pathKey);
    const isLeaf = remaining.length === 0;
    // safeKey usato in onclick="..._pivotXXX('safeKey')" → escape sia ' che "
    const safeKey = pathKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const arrow = isLeaf ? '·' : (isOpen ? '▼' : '▶');
    const cursor = isLeaf ? '' : 'cursor:pointer;';
    const margPct = v.ric ? (v.mol / v.ric * 100) : 0;
    const incPct = v.ric ? (v.inc / v.ric * 100) : 0;
    const ticket = v.items.length ? (v.ric / v.items.length) : 0;
    const marC = margPct >= 20 ? '#10b981' : margPct >= 5 ? '#f59e0b' : '#dc2626';
    const incC = incPct >= 80 ? '#10b981' : incPct >= 50 ? '#f59e0b' : '#dc2626';
    const cellClick = ' onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')" style="text-align:right;cursor:pointer"';
    const levelColor = LEVEL_COLOR[path.length] || '#64748b';
    const dimLabel = (opts.dims[dim] && opts.dims[dim].label) || dim;
    const indent = path.length * 24;
    const valEscHtml = _pivotEscHtml(val);
    const valEscAttr = _pivotEscAttr(val);
    const dimEscAttr = _pivotEscAttr(dimLabel);
    // Etichetta livello (es. "L2 · Status") in piccolo sopra il valore
    const levelTag = '<span style="color:' + levelColor + ';font-size:9px;font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-right:6px">L' + (path.length + 1) + ' · ' + _pivotEscHtml(dimLabel) + '</span>';
    html += '<tr style="background:rgba(99,102,241,' + (0.03 * path.length) + ')">';
    html += '<td style="text-align:center;color:' + levelColor + ';' + cursor + ';font-size:13px;font-weight:700"' +
      (isLeaf ? '' : ' onclick="event.stopPropagation();_pivotToggle(\'' + ns + '\',\'' + safeKey + '\')"') + '>' + arrow + '</td>';
    // Singola colonna "Voce" con indentazione + level tag + valore in grassetto
    html += '<td style="padding-left:' + (10 + indent) + 'px;cursor:pointer;border-left:3px solid ' + levelColor + '" ' +
            'onclick="_pivotDrill(\'' + ns + '\',\'' + safeKey + '\')" title="Apri elenco commesse · ' + dimEscAttr + ' = ' + valEscAttr + '">' +
            levelTag + '<b style="color:var(--text)">' + valEscHtml + '</b></td>';
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
  const list = _pivotApplyFilters(opts.items, state).filter(c => {
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
  _walk(_pivotApplyFilters(opts.items, s), 0, []);
  _pivotRerender(ns);
}

function _pivotCollapseAll(ns) {
  window._pivotState[ns].open.clear();
  _pivotRerender(ns);
}

/* ── Filtro per colonna · pannello a comparsa (imbuto) ──────────────────────
 * Numeri che si ricalcolano: la condizione si applica alla SINGOLA commessa,
 * poi l'albero e ogni totale ripartono da ciò che resta. */
function _pivotOpenFilter(ns, colId, btn) {
  _pivotCloseFilter();
  const state = window._pivotState[ns];
  const col = PIVOT_COLS.find(function (c) { return c.id === colId; });
  if (!col) return;
  const cur = (state.filters || []).find(function (f) { return f.col === colId; }) || {};
  const r = btn.getBoundingClientRect();
  const pop = document.createElement('div');
  pop.id = '_pivotFilterPop';
  pop.style.cssText = 'position:fixed;z-index:99999;width:232px;background:var(--card);border:1px solid var(--border);' +
    'border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.35);padding:12px;font-size:12px;color:var(--text);' +
    'left:' + Math.max(8, r.right - 232) + 'px;top:' + (r.bottom + 6) + 'px';
  const ops = [['gte', '≥ maggiore o uguale a'], ['gt', '> maggiore di'], ['lte', '≤ minore o uguale a'],
    ['lt', '< minore di'], ['eq', '= uguale a'], ['neq', '≠ diverso da'], ['between', 'tra (intervallo)']];
  const curOp = cur.op || 'gte';
  let oh = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<b>Filtra · ' + col.label + '</b>' +
    '<span onclick="_pivotCloseFilter()" style="cursor:pointer;color:var(--text3);font-size:13px">✕</span></div>';
  oh += '<select id="_pivotFilterOp" onchange="_pivotFilterToggleSecond()" ' +
    'style="width:100%;padding:6px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);margin-bottom:8px">';
  ops.forEach(function (o) { oh += '<option value="' + o[0] + '"' + (curOp === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; });
  oh += '</select>';
  oh += '<div style="display:flex;gap:6px;align-items:center">';
  oh += '<input id="_pivotFilterA" type="number" inputmode="decimal" value="' + (cur.a != null ? cur.a : '') + '" placeholder="valore" ' +
    'style="width:100%;padding:6px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border)">';
  oh += '<span id="_pivotFilterSep" style="color:var(--text3);' + (curOp === 'between' ? '' : 'display:none') + '">e</span>';
  oh += '<input id="_pivotFilterB" type="number" inputmode="decimal" value="' + (cur.b != null ? cur.b : '') + '" placeholder="a" ' +
    'style="width:100%;padding:6px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);' + (curOp === 'between' ? '' : 'display:none') + '">';
  oh += '</div>';
  oh += '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">';
  oh += (cur.op ? '<button onclick="_pivotClearFilter(\'' + ns + '\',\'' + colId + '\')" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px">Azzera</button>' : '<span></span>');
  oh += '<button onclick="_pivotApplyFilter(\'' + ns + '\',\'' + colId + '\')" style="background:var(--accent);color:#fff;border:none;border-radius:4px;padding:6px 14px;cursor:pointer;font-size:11px;font-weight:600">Applica</button>';
  oh += '</div>';
  pop.innerHTML = oh;
  document.body.appendChild(pop);
  pop.addEventListener('keydown', function (e) { if (e.key === 'Enter') _pivotApplyFilter(ns, colId); if (e.key === 'Escape') _pivotCloseFilter(); });
  setTimeout(function () { document.addEventListener('mousedown', _pivotFilterOutside); }, 0);
  const a = document.getElementById('_pivotFilterA'); if (a) a.focus();
}

function _pivotFilterToggleSecond() {
  const op = document.getElementById('_pivotFilterOp').value;
  const sep = document.getElementById('_pivotFilterSep');
  const b = document.getElementById('_pivotFilterB');
  const show = op === 'between';
  if (sep) sep.style.display = show ? '' : 'none';
  if (b) b.style.display = show ? '' : 'none';
}

function _pivotFilterOutside(e) {
  const pop = document.getElementById('_pivotFilterPop');
  if (pop && !pop.contains(e.target)) _pivotCloseFilter();
}

function _pivotCloseFilter() {
  document.removeEventListener('mousedown', _pivotFilterOutside);
  const pop = document.getElementById('_pivotFilterPop');
  if (pop) pop.remove();
}

function _pivotApplyFilter(ns, colId) {
  const op = document.getElementById('_pivotFilterOp').value;
  const a = parseFloat(String(document.getElementById('_pivotFilterA').value).replace(',', '.'));
  const b = parseFloat(String(document.getElementById('_pivotFilterB').value).replace(',', '.'));
  if (!isFinite(a)) return;
  if (op === 'between' && !isFinite(b)) return;
  const s = window._pivotState[ns];
  s.filters = (s.filters || []).filter(function (f) { return f.col !== colId; });
  s.filters.push({ col: colId, op: op, a: a, b: op === 'between' ? b : undefined });
  _pivotCloseFilter();
  _pivotRerender(ns);
}

function _pivotClearFilter(ns, colId) {
  const s = window._pivotState[ns];
  s.filters = (s.filters || []).filter(function (f) { return f.col !== colId; });
  _pivotCloseFilter();
  _pivotRerender(ns);
}

function _pivotClearAllFilters(ns) {
  window._pivotState[ns].filters = [];
  _pivotRerender(ns);
}

/* ════════════════════════════════════════════════════════════════════════════
 *  VISTE SALVATE (preferiti) · centralizzate sull'Hub /api/views, per-utente.
 *  Una vista salva: livelli (dims) + filtri colonna. Si ritrovano su qualsiasi
 *  computer (login unico). Se l'utente non è loggato o l'Hub è giù → ripiego
 *  sulle viste salvate su QUESTO computer (localStorage), senza errori.
 * ══════════════════════════════════════════════════════════════════════════ */

function _pivotHubUrl() {
  return (typeof window !== 'undefined' && window.__QUALIFICA_HUB_URL__) || 'https://qualifica-wea-hub.vercel.app';
}

/* Legge il gettone di login (token Supabase) da cookie o localStorage, come fa
 * il kit tabelle. Login unico Hub → valido anche chiamando l'Hub da qui. */
function _pivotAuthToken() {
  if (typeof window === 'undefined') return null;
  function extract(raw) {
    try { var p = JSON.parse(raw); return p && (p.access_token || (p.currentSession && p.currentSession.access_token) || (Array.isArray(p) ? p[0] : null)) || null; }
    catch (e) { return null; }
  }
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf('sb-') !== 0 || k.indexOf('-auth-token') < 0) continue;
      var t = extract(localStorage.getItem(k) || '');
      if (t) return t;
    }
  } catch (e) { /* localStorage non disponibile */ }
  try {
    var jar = {};
    document.cookie.split(/;\s*/).forEach(function (part) { var eq = part.indexOf('='); if (eq > 0) jar[part.slice(0, eq)] = part.slice(eq + 1); });
    var basi = {};
    Object.keys(jar).forEach(function (k) { var m = k.match(/^(sb-.+-auth-token)(?:\.\d+)?$/); if (m) basi[m[1]] = 1; });
    var keys = Object.keys(basi);
    for (var b = 0; b < keys.length; b++) {
      var base = keys[b];
      var raw = jar[base] || '';
      if (!raw) { for (var n = 0; jar[base + '.' + n] != null; n++) raw += jar[base + '.' + n]; }
      if (!raw) continue;
      var dec; try { dec = decodeURIComponent(raw); } catch (e) { dec = raw; }
      if (dec.indexOf('base64-') === 0) {
        var b64 = dec.slice(7).replace(/-/g, '+').replace(/_/g, '/');
        try { dec = atob(b64 + '==='.slice((b64.length + 3) % 4)); } catch (e) { continue; }
      }
      var tok = extract(dec);
      if (tok) return tok;
    }
  } catch (e) { /* cookie illeggibili */ }
  return null;
}

/* ── Viste salvate solo su QUESTO computer (fallback) ────────────────────────*/
function _pivotLocalKey(ns) { return 'qualifica:pivot-views:' + ns; }
function _pivotLocalList(ns) { try { return JSON.parse(localStorage.getItem(_pivotLocalKey(ns)) || '[]'); } catch (e) { return []; } }
function _pivotLocalWrite(ns, arr) { try { localStorage.setItem(_pivotLocalKey(ns), JSON.stringify(arr)); } catch (e) { /* quota piena */ } }
function _pivotLocalAdd(ns, nome, cfg) {
  var arr = _pivotLocalList(ns);
  var v = { id: 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), nome: nome, dims: cfg.dims, filters: cfg.filters, ordine: cfg.ordine || 0, is_favorite: true, local: true };
  arr.push(v); _pivotLocalWrite(ns, arr); return v;
}
function _pivotLocalUpdate(ns, v) { _pivotLocalWrite(ns, _pivotLocalList(ns).map(function (x) { return x.id === v.id ? v : x; })); return Promise.resolve(); }
function _pivotLocalRemove(ns, id) { _pivotLocalWrite(ns, _pivotLocalList(ns).filter(function (x) { return x.id !== id; })); }

/* ── Chiamate all'Hub (con ripiego locale) ──────────────────────────────────*/
function _pivotViewsGet(ns) {
  var token = _pivotAuthToken();
  var locals = _pivotLocalList(ns).map(function (v) { v.local = true; return v; });
  if (!token) return Promise.resolve(locals);
  return fetch(_pivotHubUrl() + '/api/views?table_id=' + encodeURIComponent('pivot.' + ns), { headers: { Authorization: 'Bearer ' + token }, cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (j) {
      var server = (j.views || []).map(function (v) {
        var f = v.filtri || {};
        return { id: v.id, nome: v.nome, dims: f.dims || [], filters: f.filters || [], ordine: f.ordine || 0, is_favorite: !!v.is_favorite, local: false };
      });
      return locals.concat(server);
    })
    .catch(function () { return locals; });
}
function _pivotViewsCreate(ns, nome, cfg) {
  var token = _pivotAuthToken();
  if (!token) return Promise.resolve(_pivotLocalAdd(ns, nome, cfg));
  return fetch(_pivotHubUrl() + '/api/views', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ table_id: 'pivot.' + ns, nome: nome, filtri: cfg, sort: [], condivisione: 'private', is_favorite: true }),
  }).then(function (r) { if (!r.ok) throw r.status; return r.json(); })
    .catch(function () { return _pivotLocalAdd(ns, nome, cfg); });
}
function _pivotViewsPatch(id, patch) {
  var token = _pivotAuthToken(); if (!token) return Promise.resolve();
  return fetch(_pivotHubUrl() + '/api/views/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(patch) }).catch(function () {});
}
function _pivotViewsDeleteRemote(id) {
  var token = _pivotAuthToken(); if (!token) return Promise.resolve();
  return fetch(_pivotHubUrl() + '/api/views/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } }).catch(function () {});
}
function _pivotViewsUse(id) {
  var token = _pivotAuthToken(); if (!token) return;
  fetch(_pivotHubUrl() + '/api/views/' + id + '?action=use', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(function () {});
}

/* ── Caricamento + re-render ─────────────────────────────────────────────────*/
function _pivotLoadViews(ns) {
  var s = window._pivotState[ns]; if (!s || s._viewsLoading) return;
  s._viewsLoading = true;
  _pivotViewsGet(ns).then(function (list) { s.savedViews = list; s.savedViewsLoaded = true; s._viewsLoading = false; _pivotRerender(ns); });
}
function _pivotReloadViews(ns) {
  var s = window._pivotState[ns];
  return _pivotViewsGet(ns).then(function (list) { s.savedViews = list; s.savedViewsLoaded = true; _pivotRerender(ns); });
}

/* ── Config corrente + confronto ─────────────────────────────────────────────*/
function _pivotCurrentConfig(state) {
  return { dims: state.dims.slice(0, 4), filters: (state.filters || []).map(function (f) { return { col: f.col, op: f.op, a: f.a, b: f.b }; }) };
}
function _pivotConfigEq(a, b) {
  return JSON.stringify({ d: a.dims || [], f: a.filters || [] }) === JSON.stringify({ d: b.dims || [], f: b.filters || [] });
}
/* La combinazione attuale è "nuova" (→ mostra Salva) se non combacia con un
 * preset (solo dims, niente filtri) né con una vista già salvata. */
function _pivotComboIsNew(ns, state, opts) {
  if (!state.dims.some(Boolean)) return false;
  var cur = _pivotCurrentConfig(state);
  var noFilters = !(state.filters && state.filters.length);
  if (noFilters && opts.presets && opts.presets.some(function (p) { return JSON.stringify(p.dims) === JSON.stringify(state.dims); })) return false;
  var views = state.savedViews || [];
  if (views.some(function (v) { return _pivotConfigEq(cur, { dims: v.dims, filters: v.filters }); })) return false;
  return true;
}

function _pivotSaveIconSvg() {
  return '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle">' +
    '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>';
}

/* ── Riga "Le mie viste" ─────────────────────────────────────────────────────*/
function _pivotSavedViewsRowHtml(ns, state, opts) {
  var views = (state.savedViews || []).slice().sort(function (a, b) { return (a.ordine || 0) - (b.ordine || 0); });
  var cur = _pivotCurrentConfig(state);
  var h = '<div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">';
  h += '<span style="color:var(--text3);font-size:11px;text-transform:uppercase;letter-spacing:.3px;margin-right:6px">⭐ Le mie viste:</span>';
  if (!state.savedViewsLoaded) {
    h += '<span style="color:var(--text3);font-size:11px">carico…</span>';
  } else if (!views.length) {
    h += '<span style="color:var(--text3);font-size:11px;font-style:italic">nessuna ancora — scegli una combinazione e premi Salva</span>';
  } else {
    var INLINE = 6;
    views.slice(0, INLINE).forEach(function (v) {
      var active = _pivotConfigEq(cur, { dims: v.dims, filters: v.filters });
      h += '<button onclick="_pivotApplyView(\'' + ns + '\',\'' + v.id + '\')" title="' + _pivotEscAttr(v.nome) + (v.local ? ' (solo su questo computer)' : '') + '" ' +
        'style="padding:5px 10px;border-radius:14px;font-size:10px;cursor:pointer;border:1px solid ' + (active ? 'var(--accent)' : 'var(--border)') + ';background:' + (active ? 'rgba(99,102,241,.18)' : 'var(--card)') + ';color:var(--text)">⭐ ' + _pivotEscHtml(v.nome) + (v.local ? ' •' : '') + '</button>';
    });
    h += '<button id="_pivotManageBtn_' + ns + '" onclick="_pivotOpenManage(\'' + ns + '\',this)" title="Gestisci le viste (riordina, rinomina, elimina)" ' +
      'style="padding:5px 9px;border-radius:14px;font-size:12px;line-height:1;cursor:pointer;border:1px solid var(--border);background:var(--card);color:var(--text)">⋯</button>';
  }
  if (state.savedViewsLoaded && _pivotComboIsNew(ns, state, opts)) {
    h += '<button onclick="_pivotSaveView(\'' + ns + '\',this)" title="Salva questa combinazione tra le tue viste" ' +
      'style="margin-left:6px;padding:5px 12px;border-radius:14px;font-size:10px;cursor:pointer;border:1px solid var(--accent);background:var(--accent);color:#fff;display:inline-flex;align-items:center;gap:4px">' + _pivotSaveIconSvg() + ' Salva vista</button>';
  }
  h += '</div>';
  return h;
}

/* ── Applica / salva / rinomina / elimina / riordina ────────────────────────*/
function _pivotApplyView(ns, id) {
  var s = window._pivotState[ns];
  var v = (s.savedViews || []).find(function (x) { return String(x.id) === String(id); });
  if (!v) return;
  var opts = s._opts;
  var dims = (v.dims || ['', '', '', '']).slice(0, 4);
  while (dims.length < 4) dims.push('');
  s.dims = dims.map(function (d) { return (d && opts.dims[d]) ? d : ''; });
  s.filters = (v.filters || []).map(function (f) { return { col: f.col, op: f.op, a: f.a, b: f.b }; });
  s.open.clear();
  _pivotClosePops();
  _pivotRerender(ns);
  if (!v.local) _pivotViewsUse(v.id);
}
function _pivotSaveView(ns, btn) { _pivotOpenNamePop(ns, btn, 'create', null, ''); }
function _pivotRenameView(ns, id, btn) {
  var s = window._pivotState[ns];
  var v = (s.savedViews || []).find(function (x) { return String(x.id) === String(id); });
  _pivotOpenNamePop(ns, btn, 'rename', id, v ? v.nome : '');
}
function _pivotDoCreate(ns, nome) {
  var s = window._pivotState[ns];
  var cfg = _pivotCurrentConfig(s);
  cfg.ordine = (s.savedViews || []).reduce(function (m, v) { return Math.max(m, v.ordine || 0); }, 0) + 1;
  _pivotViewsCreate(ns, nome, cfg).then(function () { _pivotReloadViews(ns); });
}
function _pivotDoRename(ns, id, nome) {
  var s = window._pivotState[ns];
  var v = (s.savedViews || []).find(function (x) { return String(x.id) === String(id); });
  if (!v) return;
  if (v.local) { v.nome = nome; _pivotLocalUpdate(ns, v); _pivotReloadViews(ns).then(function () { _pivotReopenManage(ns); }); return; }
  _pivotViewsPatch(id, { nome: nome }).then(function () { _pivotReloadViews(ns).then(function () { _pivotReopenManage(ns); }); });
}
function _pivotDeleteView(ns, id) {
  var s = window._pivotState[ns];
  var v = (s.savedViews || []).find(function (x) { return String(x.id) === String(id); });
  if (!window.confirm('Eliminare la vista "' + (v ? v.nome : '') + '"? Non si può annullare.')) return;
  var done = function () { _pivotReloadViews(ns).then(function () { _pivotReopenManage(ns); }); };
  if (v && v.local) { _pivotLocalRemove(ns, id); done(); }
  else _pivotViewsDeleteRemote(id).then(done);
}
function _pivotMoveView(ns, id, dir) {
  var s = window._pivotState[ns];
  var views = (s.savedViews || []).slice().sort(function (a, b) { return (a.ordine || 0) - (b.ordine || 0); });
  var idx = views.findIndex(function (v) { return String(v.id) === String(id); });
  var j = idx + dir;
  if (idx < 0 || j < 0 || j >= views.length) return;
  var a = views[idx], b = views[j], ao = a.ordine || 0, bo = b.ordine || 0;
  a.ordine = bo; b.ordine = ao;
  Promise.all([_pivotViewsSetOrdine(a), _pivotViewsSetOrdine(b)]).then(function () { _pivotRerender(ns); _pivotReopenManage(ns); });
}
function _pivotViewsSetOrdine(v) {
  if (v.local) { var ns = _pivotNsForLocal(v); if (ns) _pivotLocalUpdate(ns, v); return Promise.resolve(); }
  return _pivotViewsPatch(v.id, { filtri: { dims: v.dims, filters: v.filters, ordine: v.ordine } });
}
/* Trova il namespace di una vista locale (per aggiornare il localStorage giusto). */
function _pivotNsForLocal(v) {
  var states = window._pivotState || {};
  var found = null;
  Object.keys(states).forEach(function (ns) { if ((states[ns].savedViews || []).some(function (x) { return x.id === v.id; })) found = ns; });
  return found;
}

/* ── Pannelli a comparsa: nome (salva/rinomina) + gestione ───────────────────*/
function _pivotOpenNamePop(ns, anchorEl, mode, viewId, initial) {
  _pivotClosePops();
  var r = anchorEl.getBoundingClientRect();
  var pop = document.createElement('div'); pop.id = '_pivotNamePop';
  pop.style.cssText = 'position:fixed;z-index:99999;width:264px;background:var(--card);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.35);padding:12px;font-size:12px;color:var(--text);left:' + Math.max(8, r.left) + 'px;top:' + (r.bottom + 6) + 'px';
  pop.innerHTML = '<div style="margin-bottom:8px;font-weight:600">' + (mode === 'rename' ? 'Rinomina vista' : 'Salva vista') + '</div>' +
    '<input id="_pivotNameInput" type="text" value="' + _pivotEscAttr(initial || '') + '" placeholder="Nome (es. Solo non incassate)" ' +
    'style="width:100%;padding:6px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);margin-bottom:10px">' +
    '<div style="display:flex;justify-content:flex-end;gap:8px">' +
    '<button onclick="_pivotClosePops()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px">Annulla</button>' +
    '<button onclick="_pivotConfirmName()" style="background:var(--accent);color:#fff;border:none;border-radius:4px;padding:6px 14px;cursor:pointer;font-size:11px;font-weight:600">' + (mode === 'rename' ? 'Rinomina' : 'Salva') + '</button></div>';
  document.body.appendChild(pop);
  window._pivotPendingName = { ns: ns, mode: mode, viewId: viewId };
  var inp = document.getElementById('_pivotNameInput');
  if (inp) { inp.focus(); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') _pivotConfirmName(); if (e.key === 'Escape') _pivotClosePops(); }); }
}
function _pivotConfirmName() {
  var p = window._pivotPendingName; if (!p) return;
  var inp = document.getElementById('_pivotNameInput');
  var nome = ((inp && inp.value) || '').trim();
  if (!nome) { if (inp) inp.style.borderColor = '#dc2626'; return; }
  _pivotClosePops();
  if (p.mode === 'create') _pivotDoCreate(p.ns, nome);
  else _pivotDoRename(p.ns, p.viewId, nome);
}
function _pivotOpenManage(ns, btn) {
  _pivotClosePops();
  var s = window._pivotState[ns];
  var views = (s.savedViews || []).slice().sort(function (a, b) { return (a.ordine || 0) - (b.ordine || 0); });
  var r = btn.getBoundingClientRect();
  var pop = document.createElement('div'); pop.id = '_pivotManagePop';
  pop.style.cssText = 'position:fixed;z-index:99999;width:320px;max-height:60vh;overflow:auto;background:var(--card);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.35);padding:8px;font-size:12px;color:var(--text);left:' + Math.max(8, r.right - 320) + 'px;top:' + (r.bottom + 6) + 'px';
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 6px 8px"><b>Le mie viste</b><span onclick="_pivotClosePops()" style="cursor:pointer;color:var(--text3)">✕</span></div>';
  if (!views.length) h += '<div style="padding:10px;color:var(--text3);font-style:italic">Nessuna vista salvata.</div>';
  views.forEach(function (v, i) {
    h += '<div style="display:flex;align-items:center;gap:2px;padding:5px 6px;border-top:1px solid var(--border)">';
    h += '<button onclick="_pivotApplyView(\'' + ns + '\',\'' + v.id + '\')" title="Applica questa vista" style="flex:1;text-align:left;background:none;border:none;color:var(--text);cursor:pointer;font-size:12px;padding:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">⭐ ' + _pivotEscHtml(v.nome) + (v.local ? ' <span style="color:var(--text3);font-size:9px">(questo PC)</span>' : '') + '</button>';
    h += '<button onclick="_pivotMoveView(\'' + ns + '\',\'' + v.id + '\',-1)" title="Sposta su" ' + (i === 0 ? 'disabled style="opacity:.3;' : 'style="') + 'background:none;border:none;color:var(--text2);cursor:pointer;padding:2px 4px">▲</button>';
    h += '<button onclick="_pivotMoveView(\'' + ns + '\',\'' + v.id + '\',1)" title="Sposta giù" ' + (i === views.length - 1 ? 'disabled style="opacity:.3;' : 'style="') + 'background:none;border:none;color:var(--text2);cursor:pointer;padding:2px 4px">▼</button>';
    h += '<button onclick="_pivotRenameView(\'' + ns + '\',\'' + v.id + '\',this)" title="Rinomina" style="background:none;border:none;color:var(--text2);cursor:pointer;padding:2px 4px">✎</button>';
    h += '<button onclick="_pivotDeleteView(\'' + ns + '\',\'' + v.id + '\')" title="Elimina" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:2px 4px">🗑</button>';
    h += '</div>';
  });
  pop.innerHTML = h;
  document.body.appendChild(pop);
  setTimeout(function () { document.addEventListener('mousedown', _pivotManageOutside); }, 0);
}
function _pivotManageOutside(e) {
  var p = document.getElementById('_pivotManagePop');
  var np = document.getElementById('_pivotNamePop');
  if (p && !p.contains(e.target) && !(np && np.contains(e.target))) _pivotClosePops();
}
function _pivotReopenManage(ns) { var btn = document.getElementById('_pivotManageBtn_' + ns); if (btn) _pivotOpenManage(ns, btn); }
function _pivotClosePops() {
  document.removeEventListener('mousedown', _pivotManageOutside);
  ['_pivotManagePop', '_pivotNamePop'].forEach(function (id) { var e = document.getElementById(id); if (e) e.remove(); });
}
