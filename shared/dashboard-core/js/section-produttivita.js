/* ── Sezione "Produttività" del kit condiviso (Caso 1 governance) ──
 * Tre tabelle ordinabili: Commerciali (agente) · Tecnici (responsabile)
 * · Rete (segnalatore). Le tabelle calcolano per ogni attore:
 *   - Commesse totali
 *   - Aperte (status != Chiusa & != Annullato)
 *   - Chiuse
 *   - Ricavi cumulati (consulenza)
 *   - MOL totale
 *   - Margine %
 *   - Da Incassare
 *   - Numero clienti distinti
 *   - Ticket medio (ricavi / commesse)
 *
 * Il popolamento del campo varia molto fra BU (es. agente=0% in FOR).
 * La sezione dichiara la copertura con banner colorato e mostra
 * l'avviso "Dato non sufficientemente popolato" sotto il 30%.
 */

function _prodCoverage(items, key) {
  if (!items.length) return 0;
  const pop = items.filter(c => c[key] && String(c[key]).trim() && c[key] !== '***').length;
  return pop / items.length * 100;
}

function _prodAggregate(items, key) {
  /* Aggrega le commesse per il valore di `key` (agente/responsabile/segnalatore). */
  const byActor = {};
  items.forEach(c => {
    const a = (c[key] || '').trim();
    if (!a || a === '***') return;
    if (!byActor[a]) {
      byActor[a] = { cnt: 0, aperte: 0, chiuse: 0, ric: 0, mol: 0, daInc: 0, clienti: new Set() };
    }
    const v = byActor[a];
    v.cnt++;
    if (c.status === 'Chiusa') v.chiuse++;
    else if (c.status !== 'Annullato') v.aperte++;
    v.ric += (c.consulenza || 0);
    v.mol += (c.mol || 0);
    v.daInc += (c.daIncassare || 0);
    if (c.cliente) v.clienti.add(c.cliente);
  });
  return byActor;
}

function _prodRows(byActor) {
  return Object.entries(byActor).map(([nome, v]) => {
    const margPct = v.ric ? (v.mol / v.ric * 100) : 0;
    const ticket = v.cnt ? (v.ric / v.cnt) : 0;
    return [
      { display: nome, val: nome },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.aperte), val: v.aperte },
      { display: fmt(v.chiuse), val: v.chiuse },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.mol), val: v.mol },
      { display: margPct.toFixed(1) + '%', val: margPct },
      { display: fmtE(v.daInc), val: v.daInc },
      { display: fmt(v.clienti.size), val: v.clienti.size },
      { display: fmtE(ticket), val: ticket },
    ];
  });
}

function _prodBlock(items, key, label, icon, clickField) {
  const cov = _prodCoverage(items, key);
  const byActor = _prodAggregate(items, key);
  const distinct = Object.keys(byActor).length;

  let h = '<div class="card" style="margin-top:14px"><h4>' + icon + ' ' + label + '</h4>';

  if (cov < 5) {
    h += '<p style="color:var(--text3);font-size:12px;padding:14px;background:rgba(220,38,38,.08);border-left:3px solid #dc2626;border-radius:4px">' +
         '<b>Dato non disponibile</b>: il campo <code>' + key + '</code> è popolato solo al ' +
         cov.toFixed(1) + '%. Compilare in Qnet per abilitare questa analisi.</p>';
    h += '</div>';
    return h;
  }

  const banner = cov >= 80
    ? 'rgba(16,185,129,.1);border-left:3px solid #10b981'
    : cov >= 30
      ? 'rgba(245,158,11,.1);border-left:3px solid #f59e0b'
      : 'rgba(220,38,38,.1);border-left:3px solid #dc2626';
  h += '<p style="color:var(--text3);font-size:11px;padding:8px 12px;background:' + banner +
       ';border-radius:4px;margin-bottom:14px">' +
       'Popolamento <code>' + key + '</code>: <b>' + cov.toFixed(1) + '%</b> · ' +
       '<b>' + distinct + '</b> ' + label.toLowerCase() + ' distinti su ' + fmt(items.length) + ' commesse filtrate.' +
       (cov < 30 ? ' <b style="color:#dc2626">Dato non sufficientemente popolato — i ranking sono parziali.</b>' : '') +
       '</p>';

  const tblId = 'tblProd_' + key;
  h += '<div class="tbl-scroll"><table id="' + tblId + '"></table></div></div>';
  return h;
}

function _prodBuildTbl(items, key, clickField) {
  const byActor = _prodAggregate(items, key);
  if (!Object.keys(byActor).length) return;
  const rows = _prodRows(byActor).sort((a, b) => b[4].val - a[4].val).slice(0, 50);
  const tblId = 'tblProd_' + key;
  buildTbl(tblId,
    ['Nome', 'Commesse', 'Aperte', 'Chiuse', 'Ricavi', 'MOL', 'Margine %', 'Da Incassare', 'Clienti', 'Ticket medio'],
    rows,
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: clickField });
}

function renderProduttivita() {
  const el = document.getElementById('sec-produttivita');
  if (!el) return;
  const f = filtered;

  const covA = _prodCoverage(f, 'agente');
  const covR = _prodCoverage(f, 'responsabile');
  const covS = _prodCoverage(f, 'segnalatore');

  let h = '<div class="sec"><h3 class="sec-title">Produttività Collaboratori · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Top commerciali (campo <code>agente</code>), tecnici (campo <code>responsabile</code>) e rete ' +
       '(campo <code>segnalatore</code>). Le commesse aperte escludono Chiuse e Annullate. Il <b>ticket medio</b> ' +
       'è Ricavi / Commesse. Clicca sui nomi per filtrare. Il margine usa MOL precalcolato (campo costi è quasi ' +
       'sempre vuoto a livello commessa).</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">📋 Commesse filtro</div><div class="kpi-value">' + fmt(f.length) + '</div><div class="kpi-sub">campione di analisi</div></div>';
  const _cls = c => c >= 80 ? 'green' : c >= 30 ? 'orange' : 'red';
  h += '<div class="kpi ' + _cls(covA) + '"><div class="kpi-label">Commerciali</div><div class="kpi-value">' + covA.toFixed(0) + '%</div><div class="kpi-sub">copertura <code>agente</code></div></div>';
  h += '<div class="kpi ' + _cls(covR) + '"><div class="kpi-label">Tecnici</div><div class="kpi-value">' + covR.toFixed(0) + '%</div><div class="kpi-sub">copertura <code>responsabile</code></div></div>';
  h += '<div class="kpi ' + _cls(covS) + '"><div class="kpi-label">Rete</div><div class="kpi-value">' + covS.toFixed(0) + '%</div><div class="kpi-sub">copertura <code>segnalatore</code></div></div>';
  h += '</div>';

  h += _prodBlock(f, 'agente',       'Commerciali (agenti)', '💼', 'agente');
  h += _prodBlock(f, 'responsabile', 'Tecnici (responsabili)', '⚙️', 'responsabile');
  h += _prodBlock(f, 'segnalatore',  'Rete (segnalatori)', '🤝', 'segnalatore');

  // Card pivot ad albero (Caso 1, dimensioni collaboratore-centriche)
  h += '<div class="card" id="prodPivotCard" style="margin-top:14px;border-left:3px solid #6366f1">' +
       '<h4>🌳 Pivot Collaboratori · esplora gerarchico</h4>' +
       '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">' +
       'Scegli l\'ordine delle dimensioni nei 4 livelli. La tabella si organizza ad albero: clicca <b>▶</b> per ' +
       'espandere/contrarre, clicca <b>la riga</b> per aprire l\'elenco commesse. Stesse metriche delle tabelle ' +
       'commerciali/tecnici sopra (Commesse, Ricavi, MOL, Margine, Incassato, Clienti, Ticket).</p>' +
       '<div id="prodPivotControls"></div>' +
       '<div id="prodPivotTable"></div>' +
       '</div>';

  h += '</div>';
  el.innerHTML = h;

  _prodBuildTbl(f, 'agente',       'agente');
  _prodBuildTbl(f, 'responsabile', 'responsabile');
  _prodBuildTbl(f, 'segnalatore',  'segnalatore');
  _prodRenderPivot();
}

/* ── Pivot Collaboratori (kit Caso 1) ──
 * Stesso pattern di _sicRenderPivot ma con dimensioni focus
 * collaboratore: agente, responsabile, segnalatore + status/anno/cliente. */

const _PROD_PIVOT_DIMS = {
  agente:       { label: 'Commerciale (agente)', extract: c => (c.agente || '').trim() || 'N/D' },
  responsabile: { label: 'Tecnico (responsabile)', extract: c => (c.responsabile || '').trim() || 'N/D' },
  segnalatore:  { label: 'Segnalatore (rete)', extract: c => (c.segnalatore || '').trim() || 'N/D' },
  status:       { label: 'Status', extract: c => c.status || 'N/D' },
  statoLav:     { label: 'Stato Lavorazione', extract: c => (c.statoLav || '').trim() || 'N/D' },
  anno:         { label: 'Anno avvio', extract: c => {
    const s = c.dataInizio || c.dataPianInizio || '';
    let m = String(s).match(/^(\d{4})-/); if (m) return m[1];
    m = String(s).match(/-(\d{4})$/); if (m) return m[1];
    return 'N/D';
  }},
  cliente:      { label: 'Cliente', extract: c => (c.cliente || 'N/D').substring(0, 40) },
  sede:         { label: 'Sede QG', extract: c => (c.sede || '').trim() || 'N/D' },
  funzione:     { label: 'Funzione', extract: c => (c.funzione || '').trim() || 'N/D' },
};

const _PROD_PIVOT_PRESETS = [
  { label: '💼 Commerciale → Status → Anno', dims: ['agente', 'status', 'anno', ''] },
  { label: '⚙️ Tecnico → Status → StatoLav', dims: ['responsabile', 'status', 'statoLav', ''] },
  { label: '💼 Commerciale → Tecnico → Status', dims: ['agente', 'responsabile', 'status', ''] },
  { label: '📅 Anno → Commerciale → Status', dims: ['anno', 'agente', 'status', ''] },
  { label: '👤 Cliente → Commerciale → Status', dims: ['cliente', 'agente', 'status', ''] },
  { label: '🤝 Segnalatore → Commerciale', dims: ['segnalatore', 'agente', 'status', ''] },
];

let _prodPivotDims = ['agente', 'status', 'anno', ''];
let _prodPivotOpen = new Set();

function _prodValAt(c, dim) { return dim && _PROD_PIVOT_DIMS[dim] ? _PROD_PIVOT_DIMS[dim].extract(c) : 'N/D'; }

function _prodAggrLevel(items, dim) {
  const g = {};
  items.forEach(c => {
    const v = _prodValAt(c, dim);
    if (!g[v]) g[v] = { items: [], ric: 0, mol: 0, inc: 0, daInc: 0, clienti: new Set() };
    g[v].items.push(c);
    g[v].ric += (c.consulenza || 0);
    g[v].mol += (c.mol || 0);
    g[v].inc += (c.giaIncassato || 0);
    g[v].daInc += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
    if (c.cliente) g[v].clienti.add(c.cliente);
  });
  return g;
}

function _prodPivotKey(path) { return path.join('>'); }

function _prodRenderPivot() {
  const ctlEl = document.getElementById('prodPivotControls');
  const tblEl = document.getElementById('prodPivotTable');
  if (!ctlEl || !tblEl) return;

  // Preset chips
  let ch = '<div style="margin-bottom:10px;display:flex;flex-wrap:wrap;gap:6px">';
  ch += '<span style="color:var(--text3);font-size:11px;align-self:center;text-transform:uppercase;letter-spacing:.3px;margin-right:6px">⚡ Preset:</span>';
  _PROD_PIVOT_PRESETS.forEach((p, i) => {
    const active = JSON.stringify(p.dims) === JSON.stringify(_prodPivotDims);
    ch += '<button onclick="_prodPivotSetPreset(' + i + ')" style="padding:5px 10px;border-radius:14px;font-size:10px;cursor:pointer;border:1px solid ' +
          (active ? 'var(--accent)' : 'var(--border)') + ';background:' +
          (active ? 'rgba(99,102,241,.18)' : 'var(--card)') + ';color:var(--text)">' + p.label + '</button>';
  });
  ch += '</div>';
  // Dropdown
  ch += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;padding:10px;background:rgba(99,102,241,.04);border-radius:5px">';
  for (let i = 0; i < 4; i++) {
    ch += '<label style="display:flex;flex-direction:column;font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.3px">Livello ' + (i + 1) +
          '<select onchange="_prodPivotSetDim(' + i + ',this.value)" style="margin-top:4px;padding:5px 8px;border-radius:4px;background:var(--bg);color:var(--text);border:1px solid var(--border);font-size:12px;min-width:160px">';
    ch += '<option value=""' + (!_prodPivotDims[i] ? ' selected' : '') + '>— Nessuno —</option>';
    Object.entries(_PROD_PIVOT_DIMS).forEach(([k, d]) => {
      ch += '<option value="' + k + '"' + (_prodPivotDims[i] === k ? ' selected' : '') + '>' + d.label + '</option>';
    });
    ch += '</select></label>';
  }
  ch += '<button onclick="_prodPivotExpandAll()" style="margin-left:auto;align-self:flex-end;padding:6px 12px;border-radius:5px;background:rgba(99,102,241,.1);border:1px solid var(--accent);color:var(--text);cursor:pointer;font-size:11px">Espandi tutto</button>';
  ch += '<button onclick="_prodPivotCollapseAll()" style="align-self:flex-end;padding:6px 12px;border-radius:5px;background:var(--card);border:1px solid var(--border);color:var(--text);cursor:pointer;font-size:11px">Comprimi</button>';
  ch += '</div>';
  ctlEl.innerHTML = ch;

  // Tabella
  const dims = _prodPivotDims.filter(Boolean);
  let h = '<div class="tbl-scroll"><table class="coge-tbl" style="width:100%;font-size:11px"><thead><tr>';
  h += '<th style="width:32px"></th>';
  dims.forEach((d, i) => h += '<th>' + (i === 0 ? _PROD_PIVOT_DIMS[d].label : '↳ ' + _PROD_PIVOT_DIMS[d].label) + '</th>');
  h += '<th style="text-align:right">Commesse</th><th style="text-align:right">Ricavi</th><th style="text-align:right">MOL</th>' +
       '<th style="text-align:right">Margine %</th><th style="text-align:right">Incassato</th><th style="text-align:right">% Inc.</th>' +
       '<th style="text-align:right">Da Inc.</th><th style="text-align:right">Clienti</th><th style="text-align:right">Ticket €</th><th style="width:60px"></th>';
  h += '</tr></thead><tbody>' + _prodPivotRenderRows(filtered, dims, []) + '</tbody></table></div>';
  tblEl.innerHTML = h;
}

function _prodPivotRenderRows(items, dims, path) {
  if (!dims.length) return '';
  const dim = dims[0];
  const remaining = dims.slice(1);
  const g = _prodAggrLevel(items, dim);
  const entries = Object.entries(g).sort((a, b) => b[1].ric - a[1].ric);
  let html = '';
  entries.forEach(([val, v]) => {
    const newPath = [...path, val];
    const pathKey = _prodPivotKey(newPath);
    const isOpen = _prodPivotOpen.has(pathKey);
    const isLeaf = remaining.length === 0;
    const safeKey = pathKey.replace(/'/g, "\\'");
    const arrow = isLeaf ? '·' : (isOpen ? '▼' : '▶');
    const cursor = isLeaf ? '' : 'cursor:pointer;';
    const margPct = v.ric ? (v.mol / v.ric * 100) : 0;
    const incPct = v.ric ? (v.inc / v.ric * 100) : 0;
    const ticket = v.items.length ? (v.ric / v.items.length) : 0;
    const marC = margPct >= 20 ? '#10b981' : margPct >= 5 ? '#f59e0b' : '#dc2626';
    const incC = incPct >= 80 ? '#10b981' : incPct >= 50 ? '#f59e0b' : '#dc2626';
    const cellClick = ' onclick="_prodPivotDrill(\'' + safeKey + '\')" style="text-align:right;cursor:pointer"';
    html += '<tr style="background:rgba(99,102,241,' + (0.02 * path.length) + ')">';
    html += '<td style="text-align:center;color:var(--accent);' + cursor + '"' +
            (isLeaf ? '' : ' onclick="event.stopPropagation();_prodPivotToggle(\'' + safeKey + '\')"') + '>' + arrow + '</td>';
    for (let i = 0; i < dims.length; i++) {
      if (i === path.length) {
        const indent = path.length * 16;
        html += '<td style="padding-left:' + (10 + indent) + 'px;cursor:pointer" onclick="_prodPivotDrill(\'' + safeKey + '\')" title="Apri elenco commesse"><b>' + val + '</b></td>';
      } else if (i < path.length) html += '<td style="color:var(--text3)"></td>';
      else html += '<td></td>';
    }
    html += '<td' + cellClick + '>' + fmt(v.items.length) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(v.ric) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(v.mol) + '</td>';
    html += '<td style="text-align:right;cursor:pointer;color:' + marC + '" onclick="_prodPivotDrill(\'' + safeKey + '\')">' + margPct.toFixed(1) + '%</td>';
    html += '<td' + cellClick + '>' + fmtE(v.inc) + '</td>';
    html += '<td style="text-align:right;cursor:pointer;color:' + incC + '" onclick="_prodPivotDrill(\'' + safeKey + '\')">' + incPct.toFixed(0) + '%</td>';
    html += '<td' + cellClick + '>' + fmtE(v.daInc) + '</td>';
    html += '<td' + cellClick + '>' + fmt(v.clienti.size) + '</td>';
    html += '<td' + cellClick + '>' + fmtE(ticket) + '</td>';
    html += '<td style="text-align:right"><a href="#" onclick="event.preventDefault();_prodPivotDrill(\'' + safeKey + '\');return false" style="color:var(--accent);font-size:11px;text-decoration:none">apri →</a></td>';
    html += '</tr>';
    if (isOpen && !isLeaf) html += _prodPivotRenderRows(v.items, remaining, newPath);
  });
  return html;
}

function _prodPivotToggle(k) { if (_prodPivotOpen.has(k)) _prodPivotOpen.delete(k); else _prodPivotOpen.add(k); _prodRenderPivot(); }
function _prodPivotDrill(pathKey) {
  const path = pathKey.split('>');
  const dims = _prodPivotDims.filter(Boolean).slice(0, path.length);
  const list = filtered.filter(c => {
    for (let i = 0; i < path.length; i++) if (_prodValAt(c, dims[i]) !== path[i]) return false;
    return true;
  });
  const label = dims.map((d, i) => _PROD_PIVOT_DIMS[d].label + '=' + path[i]).join(' · ');
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
function _prodPivotSetDim(lv, dim) { _prodPivotDims[lv] = dim; _prodPivotOpen.clear(); _prodRenderPivot(); }
function _prodPivotSetPreset(idx) { _prodPivotDims = [..._PROD_PIVOT_PRESETS[idx].dims]; _prodPivotOpen.clear(); _prodRenderPivot(); }
function _prodPivotExpandAll() {
  const dims = _prodPivotDims.filter(Boolean);
  if (dims.length <= 1) return;
  function _walk(items, d, path) {
    if (d >= dims.length - 1) return;
    const g = _prodAggrLevel(items, dims[d]);
    Object.entries(g).forEach(([v, vd]) => { const np = [...path, v]; _prodPivotOpen.add(_prodPivotKey(np)); _walk(vd.items, d + 1, np); });
  }
  _walk(filtered, 0, []);
  _prodRenderPivot();
}
function _prodPivotCollapseAll() { _prodPivotOpen.clear(); _prodRenderPivot(); }
