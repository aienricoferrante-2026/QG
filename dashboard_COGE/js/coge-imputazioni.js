/* ── COGE · Sezione Imputazione costi (cascata L1/L2/L3) ──
 * Mostra il risultato del calcolo cascata di cogeImputazioneSegnatempo:
 *   - KPI L1 / L2 / L3 con costi e ore
 *   - Aggregato per BU (con split L1 diretto + L2 spalmato)
 *   - Top commesse per ricavi con MOL operativo
 *   - Avvisi su Segnatempo mancante o dipendenti non in HR
 */

function renderCogeImputazioni() {
  const el = document.getElementById('sec-imputazioni');
  if (!el) return;
  if (!COGE.loaded) {
    el.innerHTML = '<p style="padding:20px;color:var(--text3)">Caricamento dati BU…</p>';
    return;
  }

  const periodLbl = COGE.month >= 1 && COGE.month <= 12
    ? COGE.year + ' · mese ' + String(COGE.month).padStart(2, '0')
    : COGE.year + ' · anno intero';

  let h = '<div class="sec"><h3 class="sec-title">🧮 Imputazione cascata Segnatempo → commesse · ' + periodLbl + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Cascata in 3 livelli: <b style="color:#10b981">L1</b> ore su IdCommessa → costo commessa diretto · ' +
       '<b style="color:#f59e0b">L2</b> ore su BU → spalmato su commesse della BU · ' +
       '<b style="color:#dc2626">L3</b> ore senza imputazione → costi generali (overhead). ' +
       'Costo orario = costoAnnuo / ' + window.SECTOR_CONFIG.oreAnnueLavorative + ' ore.</p>';

  if (!COGE.hr.length) {
    h += '<div class="card" style="border-left:3px solid #f59e0b;background:rgba(245,158,11,.05)">' +
         '<p style="padding:14px;color:var(--text)"><b>⚠ Nessun dato HR caricato.</b> Vai prima a 👥 <b>Personale (HR)</b> e carica i dipendenti con costoAnnuo.</p></div></div>';
    el.innerHTML = h; return;
  }
  if (!COGE.segnatempo.length) {
    h += '<div class="card" style="border-left:3px solid #f59e0b;background:rgba(245,158,11,.05)">' +
         '<p style="padding:14px;color:var(--text)"><b>⚠ Nessun Segnatempo caricato.</b> Vai a ⏱️ <b>Segnatempo</b> e carica le righe ore (Dipendente · Data · Ore · IdCommessa/BU).</p></div></div>';
    el.innerHTML = h; return;
  }

  const r = cogeImputazioneSegnatempo();
  const items = [...r.perCommessa.values()].sort((a, b) => b.ricavi - a.ricavi);
  const totCommL1 = items.reduce((s, x) => s + x.costoDiretto, 0);
  const totCommL2 = items.reduce((s, x) => s + x.costoBuSpalmato, 0);
  const totRicavi = items.reduce((s, x) => s + x.ricavi, 0);
  const totMol = totRicavi - totCommL1 - totCommL2;

  // KPI band
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse toccate</div><div class="kpi-value">' + cogeFmt(items.length) + '</div><div class="kpi-sub">L1 + L2</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">💚 L1 · Costo diretto</div><div class="kpi-value">' + cogeFmtE(totCommL1) + '</div><div class="kpi-sub">ore su IdCommessa specifico</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">🟧 L2 · Costo BU spalmato</div><div class="kpi-value">' + cogeFmtE(totCommL2) + '</div><div class="kpi-sub">' + Object.keys(r.poolBu).length + ' BU con pool</div></div>';
  h += '<div class="kpi red"><div class="kpi-label">🟥 L3 · Costi generali</div><div class="kpi-value">' + cogeFmtE(r.generali) + '</div><div class="kpi-sub">overhead non imputabile</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">Ore totali</div><div class="kpi-value">' + cogeFmt(Math.round(r.oreTotali)) + '</div><div class="kpi-sub">Segnatempo periodo</div></div>';
  const cls = totMol >= 0 ? 'green' : 'red';
  h += '<div class="kpi ' + cls + '"><div class="kpi-label">MOL operativo commesse</div><div class="kpi-value">' + cogeFmtE(totMol) + '</div><div class="kpi-sub">Ricavi − L1 − L2</div></div>';
  h += '</div>';

  // Avvisi Segnatempo
  if (r.senzaDip.length) {
    const uniq = [...new Set(r.senzaDip)];
    h += '<div class="card" style="margin-bottom:14px;border-left:3px solid #f59e0b;background:rgba(245,158,11,.05)">' +
         '<p style="padding:10px;color:var(--text);font-size:11px">⚠ <b>' + uniq.length + ' nomi dipendenti</b> presenti in Segnatempo non trovati nell\'HR (' + r.senzaDip.length + ' righe escluse): ' +
         uniq.slice(0, 6).map(n => '<code>' + n + '</code>').join(', ') + (uniq.length > 6 ? ' …' : '') +
         '. Aggiungi questi dipendenti all\'HR per includere i loro costi.</p></div>';
  }

  // Pool L2 per BU
  if (Object.keys(r.poolBu).length) {
    h += '<div class="card" style="margin-bottom:14px"><h4>Pool L2 · Costi per BU spalmati sulle commesse</h4>';
    h += '<div class="tbl-scroll"><table class="coge-tbl"><thead><tr>';
    h += '<th>BU</th><th style="text-align:right">Pool costo</th><th style="text-align:right">Commesse BU periodo</th><th style="text-align:right">Quota / commessa</th>';
    h += '</tr></thead><tbody>';
    Object.entries(r.poolBu).sort((a, b) => b[1] - a[1]).forEach(([bu, totBu]) => {
      const meta = window.SECTOR_CONFIG.buMeta[bu];
      const nComm = (COGE.rawByBu[bu] || []).filter(_cogePeriodMatch).length;
      const quota = nComm ? (totBu / nComm) : 0;
      h += '<tr>';
      h += '<td><span style="color:' + (meta?.color || 'inherit') + ';font-weight:600">' + (meta?.icon || '') + ' ' + bu + '</span></td>';
      h += '<td style="text-align:right">' + cogeFmtE(totBu) + '</td>';
      h += '<td style="text-align:right">' + cogeFmt(nComm) + '</td>';
      h += '<td style="text-align:right;color:#f59e0b">' + cogeFmtE(quota) + '</td>';
      h += '</tr>';
    });
    h += '</tbody></table></div></div>';
  }

  // Aggregato per BU (con L1 vs L2 vs MOL)
  const byBu = {};
  items.forEach(x => {
    if (!byBu[x.bu]) byBu[x.bu] = { ricavi: 0, l1: 0, l2: 0, commesse: 0 };
    byBu[x.bu].ricavi += x.ricavi;
    byBu[x.bu].l1 += x.costoDiretto;
    byBu[x.bu].l2 += x.costoBuSpalmato;
    byBu[x.bu].commesse++;
  });

  h += '<div class="card" style="margin-bottom:14px"><h4>Aggregato per BU</h4>';
  h += '<div class="tbl-scroll"><table class="coge-tbl"><thead><tr>';
  h += '<th>BU</th><th style="text-align:right">Commesse</th><th style="text-align:right">Ricavi</th>';
  h += '<th style="text-align:right">L1 diretto</th><th style="text-align:right">L2 spalmato</th>';
  h += '<th style="text-align:right">Costo totale</th><th style="text-align:right">MOL</th><th style="text-align:right">Margine %</th>';
  h += '</tr></thead><tbody>';
  Object.entries(byBu).sort((a, b) => b[1].ricavi - a[1].ricavi).forEach(([bu, v]) => {
    const meta = window.SECTOR_CONFIG.buMeta[bu];
    const cost = v.l1 + v.l2;
    const mol = v.ricavi - cost;
    const margPct = v.ricavi ? (mol / v.ricavi * 100) : 0;
    const col = mol >= 0 ? '#10b981' : '#dc2626';
    h += '<tr>';
    h += '<td><span style="color:' + (meta?.color || 'inherit') + ';font-weight:600">' + (meta?.icon || '') + ' ' + bu + '</span></td>';
    h += '<td style="text-align:right">' + cogeFmt(v.commesse) + '</td>';
    h += '<td style="text-align:right">' + cogeFmtE(v.ricavi) + '</td>';
    h += '<td style="text-align:right;color:#10b981">' + cogeFmtE(v.l1) + '</td>';
    h += '<td style="text-align:right;color:#f59e0b">' + cogeFmtE(v.l2) + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + cogeFmtE(cost) + '</td>';
    h += '<td style="text-align:right;color:' + col + ';font-weight:600">' + cogeFmtE(mol) + '</td>';
    h += '<td style="text-align:right;color:' + col + '">' + margPct.toFixed(1) + '%</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';

  // Top commesse
  h += '<div class="card"><h4>Top commesse per ricavi (max 50)</h4>';
  h += '<div class="tbl-scroll" style="max-height:600px"><table class="coge-tbl"><thead><tr>';
  h += '<th>ID</th><th>BU</th><th>Cliente / Titolo</th>';
  h += '<th style="text-align:right">Ricavi</th><th style="text-align:right">L1</th><th style="text-align:right">L2</th>';
  h += '<th style="text-align:right">MOL</th><th>Dipendenti</th>';
  h += '</tr></thead><tbody>';
  items.slice(0, 50).forEach(x => {
    const meta = window.SECTOR_CONFIG.buMeta[x.bu];
    const cost = x.costoDiretto + x.costoBuSpalmato;
    const mol = x.ricavi - cost;
    const col = mol >= 0 ? '#10b981' : '#dc2626';
    h += '<tr>';
    h += '<td>' + (x.idCommessa || '—') + '</td>';
    h += '<td><span style="color:' + (meta?.color || 'inherit') + '">' + (meta?.icon || '') + ' ' + x.bu + '</span></td>';
    h += '<td><b>' + (x.cliente || '—').substring(0, 30) + '</b><br><span style="color:var(--text3);font-size:10px">' + (x.titolo || '—').substring(0, 50) + '</span></td>';
    h += '<td style="text-align:right">' + cogeFmtE(x.ricavi) + '</td>';
    h += '<td style="text-align:right;color:#10b981">' + (x.costoDiretto > 0 ? cogeFmtE(x.costoDiretto) : '—') + '</td>';
    h += '<td style="text-align:right;color:#f59e0b">' + (x.costoBuSpalmato > 0 ? cogeFmtE(x.costoBuSpalmato) : '—') + '</td>';
    h += '<td style="text-align:right;color:' + col + ';font-weight:600">' + cogeFmtE(mol) + '</td>';
    h += '<td style="color:var(--text3);font-size:10px">' + (x.dipendenti || []).join(', ').substring(0, 60) + '</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';

  h += '</div>';
  el.innerHTML = h;
}
