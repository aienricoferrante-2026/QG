/* ── Sezione Specifica Economica: tree multi-livello configurabile ── */

// Stato corrente: quale preset è attivo
let _specPreset = 'A_so_re_fa';

// Definizione preset: ogni preset ha label, array di livelli (campi JSON)
const SPEC_PRESETS = {
  A_so_re_fa: { label: 'Società → Regione → Fase → Corso', levels: ['societa', 'cliente', 'status'], dettaglio: true },
  A_so_re_sc: { label: 'A) Società → Regione → Stato Corso → Corso', levels: ['societa', 'cliente', 'statoCorso'], dettaglio: true },
  B_re_so_sc: { label: 'B) Regione → Società → Stato Corso → Corso', levels: ['cliente', 'societa', 'statoCorso'], dettaglio: true },
  C_sc_re_co: { label: 'C) Stato Corso → Regione → Corso', levels: ['statoCorso', 'cliente'], dettaglio: true },
  D_sc_re_so: { label: 'D) Stato Corso → Regione → Società → Corso', levels: ['statoCorso', 'cliente', 'societa'], dettaglio: true }
};

// Mappatura chiave → label nella UI
const FIELD_LABELS = {
  societa: 'Società',
  cliente: 'Regione / Ente',
  statoCorso: 'Stato Corso',
  status: 'Fase',
  corso: 'Corso'
};

// Colori icona per livello
const LEVEL_COLORS = ['var(--accent)', 'var(--green)', 'var(--cyan)', 'var(--pink)'];

function _getKey(c, field) {
  if (field === 'cliente') return ((c.cliente || 'N/D').replace(/_FOR/g, '').trim() || 'N/D');
  const v = c[field];
  if (v === null || v === undefined || String(v).trim() === '') return 'N/D';
  return String(v).trim();
}

function _aggStats(arr) {
  const tot = arr.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = arr.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = arr.reduce((s, c) => s + (c.mol || 0), 0);
  const inc = arr.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const daInc = arr.reduce((s, c) => s + (c.daIncassare || 0), 0);
  let avanzW = 0, pesoW = 0;
  arr.forEach(c => { const p = c.consulenza || 0; if (p > 0) { avanzW += p * (c.avanzamento || 0); pesoW += p; } });
  const avanzMedio = pesoW > 0 ? (avanzW / pesoW) : 0;
  const residuo = arr.reduce((s, c) => s + (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100), 0);
  return { cnt: arr.length, tot, costi, mol, inc, daInc, avanzMedio, residuo };
}

// Raggruppa ricorsivamente
function _groupByLevels(items, levels) {
  if (levels.length === 0) return { _items: items };
  const [first, ...rest] = levels;
  const g = {};
  items.forEach(c => {
    const k = _getKey(c, first);
    if (!g[k]) g[k] = [];
    g[k].push(c);
  });
  const result = {};
  Object.keys(g).forEach(k => { result[k] = _groupByLevels(g[k], rest); });
  return result;
}

// Render ricorsivo delle righe (aggregate)
function _renderAggRows(data, levels, labelIcon, parentId, depth) {
  if (!levels.length) return '';
  let h = '';
  const keys = Object.keys(data).sort((a, b) => {
    const statsA = _aggStats(_flatten(data[a]));
    const statsB = _aggStats(_flatten(data[b]));
    return statsB.tot - statsA.tot;
  });
  keys.forEach((k, ki) => {
    const subData = data[k];
    const items = _flatten(subData);
    const stats = _aggStats(items);
    const nodeId = parentId + '_' + depth + ki;
    const hasChildren = levels.length > 1 || items.length > 0;
    const levelColor = LEVEL_COLORS[depth] || 'var(--text2)';
    const labelForLev = labelIcon[depth];
    const padding = 24 * depth;

    // Riga aggregata (espandibile)
    let classes = 'tree-row tree-l' + depth;
    if (parentId) classes += ' tree-child-' + parentId;
    const styleAttr = parentId ? ' style="display:none"' : '';
    h += '<tr class="' + classes + '"' + styleAttr + ' onclick="toggleTree(\'' + nodeId + '\')">';
    h += '<td class="tree-toggle" id="tog_' + nodeId + '">' + (hasChildren ? '&#9654;' : '') + '</td>';
    h += '<td style="padding-left:' + padding + 'px"><span style="color:' + levelColor + ';font-size:10px;margin-right:4px;font-weight:600">' + labelForLev + ':</span><strong>' + (k.length > 45 ? k.substring(0, 43) + '..' : k) + '</strong> <span style="color:var(--text3);font-size:10px">(' + stats.cnt + ')</span></td>';
    h += '<td class="text-right">' + fmt(stats.cnt) + '</td>';
    h += '<td class="text-right"><strong>' + fmtE(stats.tot) + '</strong></td>';
    h += '<td class="text-right">' + fmtE(stats.costi) + '</td>';
    h += '<td class="text-right">' + fmtE(stats.mol) + '</td>';
    h += '<td class="text-right" style="color:var(--cyan);font-weight:600">' + stats.avanzMedio.toFixed(1) + '%</td>';
    h += '<td class="text-right" style="color:var(--orange);font-weight:600">' + fmtE(stats.residuo) + '</td>';
    h += '<td class="text-right">' + fmtE(stats.inc) + '</td>';
    h += '<td class="text-right">' + fmtE(stats.daInc) + '</td>';
    h += '<td colspan="4" style="color:var(--text3);font-size:10px;font-style:italic">— aggregato —</td>';
    h += '</tr>';

    // Ricorsione: se ci sono ancora livelli, richiama per i figli
    if (levels.length > 1) {
      h += _renderAggRows(subData, levels.slice(1), labelIcon, nodeId, depth + 1);
    } else if (subData._items) {
      // Siamo all'ultimo livello: mostra il dettaglio dei corsi
      subData._items.forEach(c => {
        const d = _durataCorso(c.dataInizio, c.dataFine);
        const salM = d.mesi > 0 ? (c.consulenza / d.mesi) : (c.consulenza || 0);
        const resid = (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100);
        const nomeCorso = c.titolo || c.corso || 'N/D';
        h += '<tr class="tree-row tree-l' + (depth + 1) + ' tree-child-' + nodeId + '" style="display:none;font-size:11px">';
        h += '<td></td>';
        h += '<td style="padding-left:' + (padding + 24) + 'px;font-size:10px;color:var(--text2)"><strong>#' + c.id + '</strong> ' + (nomeCorso.length > 60 ? nomeCorso.substring(0, 58) + '..' : nomeCorso) + '</td>';
        h += '<td class="text-right">1</td>';
        h += '<td class="text-right">' + fmtE(c.consulenza || 0) + '</td>';
        h += '<td class="text-right">' + fmtE(c.costi || 0) + '</td>';
        h += '<td class="text-right">' + fmtE(c.mol || 0) + '</td>';
        h += '<td class="text-right" style="color:var(--cyan)">' + (c.avanzamento || 0) + '%</td>';
        h += '<td class="text-right" style="color:var(--orange)">' + fmtE(resid) + '</td>';
        h += '<td class="text-right">' + fmtE(c.giaIncassato || 0) + '</td>';
        h += '<td class="text-right">' + fmtE(c.daIncassare || 0) + '</td>';
        h += '<td>' + (c.dataInizio || '-') + '</td>';
        h += '<td>' + (c.dataFine || '-') + '</td>';
        h += '<td class="text-right">' + d.mesi + '</td>';
        h += '<td class="text-right">' + fmtE(salM) + '</td>';
        h += '</tr>';
      });
    }
  });
  return h;
}

// Appiattisce l'albero per ottenere tutti gli items
function _flatten(node) {
  if (node._items) return node._items;
  const arr = [];
  Object.values(node).forEach(sub => {
    arr.push(..._flatten(sub));
  });
  return arr;
}

function setSpecPreset(key) {
  _specPreset = key;
  renderSpecEcon();
}

function renderSpecEcon() {
  const el = document.getElementById('sec-specEcon');
  const f = filtered;
  const preset = SPEC_PRESETS[_specPreset] || SPEC_PRESETS.A_so_re_fa;
  const levels = preset.levels;
  const labels = levels.map(l => FIELD_LABELS[l] || l);

  // Stats globali
  const totStats = _aggStats(f);

  let h = '<div class="sec"><h3 class="sec-title">Specifica Economica &mdash; Analisi Multi-Livello</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">Seleziona la gerarchia di raggruppamento. L\'ultimo livello è sempre il <b>singolo corso</b>.</p>';

  // Toolbar preset
  h += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px">';
  Object.entries(SPEC_PRESETS).forEach(([key, p]) => {
    const active = _specPreset === key;
    h += '<button onclick="setSpecPreset(\'' + key + '\')" style="background:' + (active ? 'var(--accent)' : 'var(--card2)') + ';color:' + (active ? '#fff' : 'var(--text2)') + ';border:1px solid ' + (active ? 'var(--accent)' : 'var(--border)') + ';padding:6px 12px;border-radius:6px;font-size:11px;cursor:pointer;font-weight:' + (active ? '700' : '500') + '">' + p.label + '</button>';
  });
  h += '</div>';

  // Card riepilogo
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Totale Ricavi</h4><div style="font-size:26px;font-weight:700">' + fmtK(totStats.tot) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(f.length) + ' commesse</div></div>';
  h += '<div class="card"><h4>% Avanzamento Medio</h4><div style="font-size:26px;font-weight:700;color:var(--cyan)">' + totStats.avanzMedio.toFixed(1) + '%</div><div style="color:var(--text2);font-size:11px;margin-top:4px">media pesata sui ricavi</div></div>';
  h += '<div class="card"><h4>Valore Residuo</h4><div style="font-size:26px;font-weight:700;color:var(--orange)">' + fmtK(totStats.residuo) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">da completare</div></div>';
  h += '</div>';

  // Gerarchia attuale in breadcrumb
  const arrowLabels = [...labels, 'Corso'].join(' → ');
  h += '<div style="background:rgba(59,130,246,.08);padding:8px 12px;border-radius:6px;margin-bottom:12px;font-size:11px;color:var(--accent)"><strong>Gerarchia attiva:</strong> ' + arrowLabels + '</div>';

  // Tabella tree
  h += '<div class="card"><div class="tbl-scroll"><table id="tblSpec"><thead><tr>';
  h += '<th style="width:30px"></th>';
  h += '<th>Dimensione</th>';
  h += '<th class="text-right">N.</th>';
  h += '<th class="text-right">Ricavi</th>';
  h += '<th class="text-right">Costi</th>';
  h += '<th class="text-right">MOL</th>';
  h += '<th class="text-right">% Avanz.</th>';
  h += '<th class="text-right">Val. Residuo</th>';
  h += '<th class="text-right">Incassato</th>';
  h += '<th class="text-right">Da Incassare</th>';
  h += '<th>Data Inizio</th>';
  h += '<th>Data Fine</th>';
  h += '<th class="text-right">Durata (m)</th>';
  h += '<th class="text-right">SAL Medio</th>';
  h += '</tr></thead><tbody>';

  // Build tree data ricorsivamente
  const tree = _groupByLevels(f, levels);
  h += _renderAggRows(tree, levels, labels, '', 0);

  h += '</tbody></table></div></div>';

  // Pulsante esporta
  h += '<div style="margin-top:14px;text-align:center">';
  h += '<button class="filter-reset" style="background:rgba(16,185,129,.12);border-color:#10b981;color:#10b981;padding:10px 24px;font-size:13px" onclick="exportExcelCessione()">&#8681; Esporta Excel completo</button>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}
