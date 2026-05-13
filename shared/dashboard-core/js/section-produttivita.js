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

  let h = '<div class="sec"><h3 class="sec-title">Produttività attori · ' + sectorLabel() + '</h3>';
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

  h += '</div>';
  el.innerHTML = h;

  _prodBuildTbl(f, 'agente',       'agente');
  _prodBuildTbl(f, 'responsabile', 'responsabile');
  _prodBuildTbl(f, 'segnalatore',  'segnalatore');
}
