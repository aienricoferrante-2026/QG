/* ── COGE · Sezione Riepilogo Generale ──
 * Matrice riepilogativa di tutte le Società × Sede × BU con conto
 * economico calcolato:
 *   Ricavi
 * − Costi diretti commessa (campo costi, popolato solo per FOR)
 * − Costi dipendenti BU/Sede (da HR caricato)
 * ─────────────────────────────────
 * = MOL operativo BU/Sede
 *
 * Aggregato Sede:
 *   Σ MOL operativo BU/Sede
 * − Costi indiretti Sede
 * = Risultato operativo Sede (da inviare ai partner)
 */

function renderCogeRiepilogo() {
  const el = document.getElementById('sec-riepilogo');
  if (!el) return;
  if (!COGE.loaded) {
    el.innerHTML = '<p style="padding:20px;color:var(--text3)">Caricamento dati BU…</p>';
    return;
  }

  const sediConsedi = cogeUniqueSediConsedi();
  const buCodes = Object.keys(window.SECTOR_CONFIG.buMeta);

  // Totali globali per riga "Totale generale"
  let tot = { ricavi: 0, costiComm: 0, costiHr: 0, mol: 0, indir: 0 };

  // Build rows: per ogni (Società, Sede): una riga per BU + una riga totale Sede
  let h = '<div class="sec"><h3 class="sec-title">📊 Riepilogo Conto Economico · ' + COGE.year + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Per ogni <b>Società × Sede × BU</b>: Ricavi (dalle commesse), costi diretti commessa, costi dipendenti BU (HR), ' +
       'MOL operativo BU/Sede. Per ogni <b>Sede</b>: aggregato BU + costi indiretti = risultato operativo. ' +
       'I dati HR e indiretti vivono in <code>localStorage</code> del browser (modifiche locali al PC).</p>';

  // KPI band
  let totRicavi = 0, totMol = 0, totHr = 0, totIndir = 0;
  sediConsedi.forEach(({ societa, sede }) => {
    buCodes.forEach(bu => {
      const k = societa + '|' + sede + '|' + bu;
      const a = COGE.aggSocSedeBu[k];
      if (!a) return;
      totRicavi += a.ricavi;
      totMol += a.mol;
      totHr += cogeHrSumByBuSede(bu, societa, sede);
    });
    totIndir += cogeIndirettiSede(societa, sede);
  });
  const risultato = totMol - totHr - totIndir;
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Sedi attive</div><div class="kpi-value">' + cogeFmt(sediConsedi.length) + '</div><div class="kpi-sub">Società × Sede</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ricavi totali</div><div class="kpi-value">' + cogeFmtE(totRicavi) + '</div><div class="kpi-sub">somma 11 BU · ' + COGE.year + '</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">MOL commesse</div><div class="kpi-value">' + cogeFmtE(totMol) + '</div><div class="kpi-sub">da campo mol Qnet</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costo Personale</div><div class="kpi-value">' + cogeFmtE(totHr) + '</div><div class="kpi-sub">' + cogeFmt(COGE.hr.length) + ' dipendenti HR</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Costi Indiretti</div><div class="kpi-value">' + cogeFmtE(totIndir) + '</div><div class="kpi-sub">affitti, utenze, ecc.</div></div>';
  const cls = risultato >= 0 ? 'green' : 'red';
  h += '<div class="kpi ' + cls + '"><div class="kpi-label">Risultato operativo</div><div class="kpi-value">' + cogeFmtE(risultato) + '</div><div class="kpi-sub">MOL − HR − Indiretti</div></div>';
  h += '</div>';

  // Tabella per ogni Sede
  h += '<div class="tbl-scroll"><table class="coge-tbl"><thead><tr>';
  h += '<th>Società / Sede</th><th>BU</th><th style="text-align:right">Commesse</th>';
  h += '<th style="text-align:right">Ricavi</th><th style="text-align:right">Costi diretti</th>';
  h += '<th style="text-align:right">Costo Pers. BU</th><th style="text-align:right">MOL BU/Sede</th>';
  h += '</tr></thead><tbody>';

  sediConsedi.forEach(({ societa, sede }) => {
    let sedeRicavi = 0, sedeCostiComm = 0, sedeHr = 0, sedeMolBu = 0;
    const buPresenti = buCodes.filter(bu => COGE.aggSocSedeBu[societa + '|' + sede + '|' + bu]);
    if (!buPresenti.length) return;

    // Righe BU
    buPresenti.forEach((bu, idx) => {
      const a = COGE.aggSocSedeBu[societa + '|' + sede + '|' + bu];
      const meta = window.SECTOR_CONFIG.buMeta[bu];
      const costoHr = cogeHrSumByBuSede(bu, societa, sede);
      const molBu = a.ricavi - a.costiCommessa - costoHr;
      sedeRicavi += a.ricavi;
      sedeCostiComm += a.costiCommessa;
      sedeHr += costoHr;
      sedeMolBu += molBu;
      const isFirst = idx === 0;
      h += '<tr>';
      h += '<td>' + (isFirst ? '<b>' + societa.substring(0, 28) + '</b><br><span style="color:var(--text3);font-size:10px">' + sede + '</span>' : '') + '</td>';
      h += '<td><span style="color:' + meta.color + ';font-weight:600">' + meta.icon + ' ' + bu + '</span></td>';
      h += '<td style="text-align:right">' + cogeFmt(a.commesse) + '</td>';
      h += '<td style="text-align:right">' + cogeFmtE(a.ricavi) + '</td>';
      h += '<td style="text-align:right;color:var(--text3)">' + (a.costiCommessa > 0 ? cogeFmtE(a.costiCommessa) : '—') + '</td>';
      h += '<td style="text-align:right;color:var(--text3)">' + (costoHr > 0 ? cogeFmtE(costoHr) : '—') + '</td>';
      h += '<td style="text-align:right;color:' + (molBu >= 0 ? '#10b981' : '#dc2626') + ';font-weight:600">' + cogeFmtE(molBu) + '</td>';
      h += '</tr>';
    });
    // Riga totale Sede: include costi indiretti e Risultato Operativo
    const indir = cogeIndirettiSede(societa, sede);
    const risSede = sedeMolBu - indir;
    h += '<tr style="background:rgba(99,102,241,.06);font-weight:600">';
    h += '<td colspan="2" style="padding-left:18px"><i>Totale Sede</i></td>';
    h += '<td style="text-align:right"><i>—</i></td>';
    h += '<td style="text-align:right">' + cogeFmtE(sedeRicavi) + '</td>';
    h += '<td style="text-align:right">' + (sedeCostiComm > 0 ? cogeFmtE(sedeCostiComm) : '—') + '</td>';
    h += '<td style="text-align:right">' + (sedeHr > 0 ? cogeFmtE(sedeHr) : '—') + '</td>';
    h += '<td style="text-align:right;color:' + (sedeMolBu >= 0 ? '#10b981' : '#dc2626') + '">' + cogeFmtE(sedeMolBu) + '</td>';
    h += '</tr>';
    h += '<tr style="background:rgba(99,102,241,.1)">';
    h += '<td colspan="6" style="padding-left:18px;color:var(--text2);font-size:11px"><i>Costi Indiretti Sede:</i> ' + cogeFmtE(indir) + (indir === 0 ? ' <span style="color:#f59e0b">⚠ da inserire</span>' : '') + '</td>';
    h += '<td style="text-align:right;font-weight:700;color:' + (risSede >= 0 ? '#10b981' : '#dc2626') + ';font-size:14px">' + cogeFmtE(risSede) + '</td>';
    h += '</tr>';
    // Spacer
    h += '<tr><td colspan="7" style="height:6px;border:none"></td></tr>';
  });

  h += '</tbody></table></div>';
  h += '</div>';
  el.innerHTML = h;
}
