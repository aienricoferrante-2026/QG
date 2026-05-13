/* ── COGE · Sezione Imputazione costi dipendenti → commesse ──
 * Per ogni commessa del periodo, calcola il costo dipendente imputato
 * usando il campo `responsabile` di Qnet come chiave di matching con
 * il `dipendente` dell'HR caricato.
 *
 * Algoritmo:
 *   1. Per ogni dipendente HR: cerca commesse del periodo dove
 *      responsabile = nome dipendente (case-insensitive, match esatto
 *      o per cognome fallback).
 *   2. Il costo annuo (× pro-rata se mese) si spalma in piatto su tutte
 *      le commesse trovate del dipendente.
 *   3. Output: tabella commessa × costo imputato + MOL "vero" (ricavi −
 *      costo imputato).
 *
 * Limite: questa imputazione assume distribuzione uniforme tra le
 * commesse del dipendente. Per una distribuzione pesata serve un campo
 * ore/% in HR (iterazione successiva).
 */

function renderCogeImputazioni() {
  const el = document.getElementById('sec-imputazioni');
  if (!el) return;
  if (!COGE.loaded) {
    el.innerHTML = '<p style="padding:20px;color:var(--text3)">Caricamento dati BU…</p>';
    return;
  }

  const imp = cogeImputazioneCostiCommessa();
  const items = [...imp.values()].sort((a, b) => b.ricavi - a.ricavi);

  const periodLbl = COGE.month >= 1 && COGE.month <= 12
    ? COGE.year + ' · mese ' + String(COGE.month).padStart(2, '0')
    : COGE.year + ' · anno intero';

  let h = '<div class="sec"><h3 class="sec-title">🧮 Imputazione costi dipendenti → commesse · ' + periodLbl + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Per ogni commessa: costo dipendente imputato derivato dal match Qnet <code>responsabile</code> ↔ HR <code>dipendente</code>. ' +
       'Il costo annuo del dipendente viene spalmato in piatto sulle commesse del periodo a cui risulta responsabile (uniformemente). ' +
       '<b>MOL operativo commessa</b> = Ricavi − Costo imputato. ' +
       'Per imputazione pesata (ore/%) serve aggiungere colonna in HR (iterazione futura).</p>';

  // KPI
  const totRicavi = items.reduce((s, x) => s + x.ricavi, 0);
  const totImp = items.reduce((s, x) => s + x.costoImputato, 0);
  const totMol = totRicavi - totImp;
  const senzaImp = items.filter(x => x.costoImputato === 0).length;

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Commesse imputate</div><div class="kpi-value">' + cogeFmt(items.length) + '</div><div class="kpi-sub">con almeno 1 dipendente</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ricavi imputati</div><div class="kpi-value">' + cogeFmtE(totRicavi) + '</div><div class="kpi-sub">somma commesse imputate</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costo imputato</div><div class="kpi-value">' + cogeFmtE(totImp) + '</div><div class="kpi-sub">dipendenti su commesse</div></div>';
  const cls = totMol >= 0 ? 'green' : 'red';
  h += '<div class="kpi ' + cls + '"><div class="kpi-label">MOL operativo</div><div class="kpi-value">' + cogeFmtE(totMol) + '</div><div class="kpi-sub">Ricavi − Costo imputato</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Senza imputazione</div><div class="kpi-value">' + cogeFmt(senzaImp) + '</div><div class="kpi-sub">match HR mancante</div></div>';
  h += '</div>';

  if (!COGE.hr.length) {
    h += '<div class="card" style="border-left:3px solid #f59e0b;background:rgba(245,158,11,.05)">' +
         '<p style="padding:14px;color:var(--text)"><b>⚠ Nessun dato HR caricato.</b> Per usare l\'imputazione costi su commessa, vai prima alla sezione 👥 <b>Personale (HR)</b> e carica l\'Excel con i dipendenti, le loro società/sedi/BU e i costi annui.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  if (!items.length) {
    h += '<div class="card"><p style="text-align:center;padding:20px;color:var(--text3)">Nessuna commessa imputabile nel periodo selezionato. Verifica i nomi dipendenti HR rispetto al campo <code>responsabile</code> di Qnet.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  // Aggregato per BU
  const byBu = {};
  items.forEach(x => {
    if (!byBu[x.bu]) byBu[x.bu] = { ricavi: 0, costo: 0, commesse: 0 };
    byBu[x.bu].ricavi += x.ricavi;
    byBu[x.bu].costo += x.costoImputato;
    byBu[x.bu].commesse++;
  });

  h += '<div class="card" style="margin-bottom:14px"><h4>Aggregato per BU</h4>';
  h += '<div class="tbl-scroll"><table class="coge-tbl"><thead><tr>';
  h += '<th>BU</th><th style="text-align:right">Commesse</th><th style="text-align:right">Ricavi</th>';
  h += '<th style="text-align:right">Costo imputato</th><th style="text-align:right">MOL operativo</th><th style="text-align:right">Margine %</th>';
  h += '</tr></thead><tbody>';
  Object.entries(byBu).sort((a, b) => b[1].ricavi - a[1].ricavi).forEach(([bu, v]) => {
    const meta = window.SECTOR_CONFIG.buMeta[bu];
    const mol = v.ricavi - v.costo;
    const margPct = v.ricavi ? (mol / v.ricavi * 100) : 0;
    const col = mol >= 0 ? '#10b981' : '#dc2626';
    h += '<tr>';
    h += '<td><span style="color:' + (meta?.color || 'inherit') + ';font-weight:600">' + (meta?.icon || '') + ' ' + bu + '</span></td>';
    h += '<td style="text-align:right">' + cogeFmt(v.commesse) + '</td>';
    h += '<td style="text-align:right">' + cogeFmtE(v.ricavi) + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + cogeFmtE(v.costo) + '</td>';
    h += '<td style="text-align:right;color:' + col + ';font-weight:600">' + cogeFmtE(mol) + '</td>';
    h += '<td style="text-align:right;color:' + col + '">' + margPct.toFixed(1) + '%</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';

  // Top 50 commesse con costo imputato
  h += '<div class="card"><h4>Top commesse per ricavi (max 50)</h4>';
  h += '<div class="tbl-scroll" style="max-height:600px"><table class="coge-tbl"><thead><tr>';
  h += '<th>ID</th><th>BU</th><th>Cliente / Titolo</th><th>Sede</th>';
  h += '<th style="text-align:right">Ricavi</th><th style="text-align:right">Costo imp.</th>';
  h += '<th style="text-align:right">MOL</th><th>Dipendenti</th>';
  h += '</tr></thead><tbody>';
  items.slice(0, 50).forEach(x => {
    const meta = window.SECTOR_CONFIG.buMeta[x.bu];
    const mol = x.ricavi - x.costoImputato;
    const col = mol >= 0 ? '#10b981' : '#dc2626';
    h += '<tr>';
    h += '<td>' + (x.idCommessa || '—') + '</td>';
    h += '<td><span style="color:' + (meta?.color || 'inherit') + '">' + (meta?.icon || '') + ' ' + x.bu + '</span></td>';
    h += '<td><b>' + (x.cliente || '—').substring(0, 30) + '</b><br><span style="color:var(--text3);font-size:10px">' + (x.titolo || '—').substring(0, 50) + '</span></td>';
    h += '<td style="color:var(--text3);font-size:11px">' + (x.sede || '—').substring(0, 20) + '</td>';
    h += '<td style="text-align:right">' + cogeFmtE(x.ricavi) + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + cogeFmtE(x.costoImputato) + '</td>';
    h += '<td style="text-align:right;color:' + col + ';font-weight:600">' + cogeFmtE(mol) + '</td>';
    h += '<td style="color:var(--text3);font-size:10px">' + [...new Set(x.dipendenti)].join(', ') + '</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div></div>';

  h += '</div>';
  el.innerHTML = h;
}
