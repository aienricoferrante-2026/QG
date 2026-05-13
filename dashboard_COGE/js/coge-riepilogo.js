/* ── COGE · Sezione Riepilogo Generale (pivot dimensionale) ──
 * Bilancino conto economico aggregato per la dimensione scelta:
 *   - Società × Sede × BU  (vista classica dettagliata)
 *   - Sede                  (per inviare ai partner)
 *   - BU                    (vista verticale per settore)
 *   - Società               (rollup massimo)
 *   - Regione               (vista geografica)
 *
 * Formula in ogni riga:
 *   Risultato = Ricavi − Costi diretti − Costo Personale BU − Costi Indiretti
 *
 * Granularità: anno + (opzionale) mese. HR e indiretti sono scalati
 * pro-rata 1/12 se mese specifico è selezionato (vedi cogeProRataFactor).
 */

const PIVOT_LABELS = {
  societa_sede_bu: 'Società × Sede × BU (dettaglio)',
  sede:    'Sede (per partner)',
  bu:      'BU',
  societa: 'Società',
  regione: 'Regione',
};

function renderCogeRiepilogo() {
  const el = document.getElementById('sec-riepilogo');
  if (!el) return;
  if (!COGE.loaded) {
    el.innerHTML = '<p style="padding:20px;color:var(--text3)">Caricamento dati BU…</p>';
    return;
  }

  const periodLbl = COGE.month >= 1 && COGE.month <= 12
    ? COGE.year + ' · mese ' + String(COGE.month).padStart(2, '0')
    : COGE.year + ' · anno intero';

  let h = '<div class="sec"><h3 class="sec-title">📊 Bilancino Conto Economico · ' + periodLbl + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Conto economico operativo pivotabile per dimensione. ' +
       '<b>Risultato = Ricavi − Costi diretti − Costo Personale BU − Costi Indiretti</b>. ' +
       'Se è selezionato un mese, HR e indiretti sono scalati pro-rata 1/12.</p>';

  // Selettore dimensione pivot
  h += '<div style="display:flex;gap:10px;align-items:center;margin-bottom:14px;flex-wrap:wrap">';
  h += '<label style="color:var(--text2);font-size:11px;text-transform:uppercase;letter-spacing:.4px;font-weight:600">📐 Vista bilancino:</label>';
  Object.entries(PIVOT_LABELS).forEach(([dim, lbl]) => {
    const active = COGE.pivotDim === dim;
    h += '<button onclick="cogeSetPivot(\'' + dim + '\')" style="padding:6px 12px;border-radius:5px;font-size:11px;cursor:pointer;border:1px solid ' +
         (active ? 'var(--accent)' : 'var(--border)') + ';background:' +
         (active ? 'rgba(99,102,241,.18)' : 'var(--card)') + ';color:' +
         (active ? 'var(--text)' : 'var(--text2)') + ';font-weight:' + (active ? '600' : '400') + '">' + lbl + '</button>';
  });
  h += '</div>';

  const rows = cogePivotAggregato(COGE.pivotDim);

  // KPI band totali
  const tot = rows.reduce((s, r) => ({
    ricavi: s.ricavi + r.ricavi,
    costiCommessa: s.costiCommessa + r.costiCommessa,
    mol: s.mol + r.mol,
    costoHr: s.costoHr + r.costoHr,
    costiIndiretti: s.costiIndiretti + r.costiIndiretti,
    commesse: s.commesse + r.commesse,
  }), { ricavi: 0, costiCommessa: 0, mol: 0, costoHr: 0, costiIndiretti: 0, commesse: 0 });
  let totIndirVero = 0;
  cogeUniqueSediConsedi().forEach(({ societa, sede }) => totIndirVero += cogeIndirettiSede(societa, sede));
  totIndirVero *= cogeProRataFactor();
  // Costi generali da Segnatempo (L3 della cascata) — se Segnatempo è caricato
  const totGenerali = (typeof cogeCostiGenerali === 'function' && COGE.segnatempo.length) ? cogeCostiGenerali() : 0;
  const risultatoTot = tot.ricavi - tot.costiCommessa - tot.costoHr - totIndirVero - totGenerali;

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">' + (COGE.pivotDim === 'societa_sede_bu' ? 'Combinazioni' : 'Gruppi') + '</div><div class="kpi-value">' + cogeFmt(rows.length) + '</div><div class="kpi-sub">in vista corrente</div></div>';
  h += '<div class="kpi green"><div class="kpi-label">Ricavi totali</div><div class="kpi-value">' + cogeFmtE(tot.ricavi) + '</div><div class="kpi-sub">' + cogeFmt(tot.commesse) + ' commesse</div></div>';
  h += '<div class="kpi cyan"><div class="kpi-label">MOL commesse</div><div class="kpi-value">' + cogeFmtE(tot.mol) + '</div><div class="kpi-sub">da Qnet</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costo Personale</div><div class="kpi-value">' + cogeFmtE(tot.costoHr) + '</div><div class="kpi-sub">' + cogeFmt(COGE.hr.length) + ' dipendenti HR</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Costi Indiretti</div><div class="kpi-value">' + cogeFmtE(totIndirVero) + '</div><div class="kpi-sub">affitti, utenze, ecc.</div></div>';
  if (totGenerali > 0) {
    h += '<div class="kpi red"><div class="kpi-label">Costi Generali (L3)</div><div class="kpi-value">' + cogeFmtE(totGenerali) + '</div><div class="kpi-sub">overhead Segnatempo</div></div>';
  }
  const cls = risultatoTot >= 0 ? 'green' : 'red';
  h += '<div class="kpi ' + cls + '"><div class="kpi-label">Risultato operativo</div><div class="kpi-value">' + cogeFmtE(risultatoTot) + '</div><div class="kpi-sub">Ricavi − tutti i costi</div></div>';
  h += '</div>';

  // Tabella pivot
  h += '<div class="tbl-scroll"><table class="coge-tbl"><thead><tr>';
  h += '<th>' + (PIVOT_LABELS[COGE.pivotDim] || COGE.pivotDim) + '</th>';
  h += '<th style="text-align:right">Commesse</th>';
  h += '<th style="text-align:right">Ricavi</th>';
  h += '<th style="text-align:right">Costi diretti</th>';
  h += '<th style="text-align:right">Costo Personale</th>';
  h += '<th style="text-align:right">Costi Indiretti</th>';
  h += '<th style="text-align:right">Risultato</th>';
  h += '<th style="text-align:right">Margine %</th>';
  h += '</tr></thead><tbody>';

  rows.forEach(r => {
    const margPct = r.ricavi ? (r.risultato / r.ricavi * 100) : 0;
    const margCol = r.risultato >= 0 ? '#10b981' : '#dc2626';
    h += '<tr>';
    h += '<td><b>' + r.label + '</b>';
    if (COGE.pivotDim === 'societa') h += '<br><span style="color:var(--text3);font-size:10px">' + r.nSedi + ' sedi · ' + r.nBu + ' BU</span>';
    else if (COGE.pivotDim === 'bu') h += '<br><span style="color:var(--text3);font-size:10px">' + r.nSedi + ' sedi · ' + r.nSocieta + ' società</span>';
    else if (COGE.pivotDim === 'regione') h += '<br><span style="color:var(--text3);font-size:10px">' + r.nSedi + ' sedi · ' + r.nBu + ' BU</span>';
    h += '</td>';
    h += '<td style="text-align:right">' + cogeFmt(r.commesse) + '</td>';
    h += '<td style="text-align:right">' + cogeFmtE(r.ricavi) + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + (r.costiCommessa > 0 ? cogeFmtE(r.costiCommessa) : '—') + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + (r.costoHr > 0 ? cogeFmtE(r.costoHr) : '—') + '</td>';
    h += '<td style="text-align:right;color:var(--text3)">' + (r.costiIndiretti > 0 ? cogeFmtE(r.costiIndiretti) : '—') + '</td>';
    h += '<td style="text-align:right;color:' + margCol + ';font-weight:700">' + cogeFmtE(r.risultato) + '</td>';
    h += '<td style="text-align:right;color:' + margCol + '">' + margPct.toFixed(1) + '%</td>';
    h += '</tr>';
  });
  h += '</tbody></table></div>';

  // Note sulla dimensione
  if (COGE.pivotDim !== 'sede' && COGE.pivotDim !== 'societa_sede_bu') {
    h += '<p style="color:var(--text3);font-size:11px;margin-top:10px;padding:8px 12px;background:rgba(99,102,241,.04);border-left:3px solid #6366f1;border-radius:4px">' +
         '💡 In questa vista i <i>Costi Indiretti</i> sono aggregati sommando le sedi appartenenti al gruppo. Per il report Sede usa la vista <b>Sede (per partner)</b>.</p>';
  }

  h += '</div>';
  el.innerHTML = h;
}

function cogeSetPivot(dim) {
  COGE.pivotDim = dim;
  renderCogeRiepilogo();
}
