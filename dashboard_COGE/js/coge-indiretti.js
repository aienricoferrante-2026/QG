/* ── COGE · Sezione Costi Indiretti (form editabile) ──
 * Per ogni (Società, Sede) presente nei dati: tabella editabile con
 * le voci di costo indiretto definite in config.vociIndirette.
 *
 * Salvataggio: localStorage qg_coge_indiretti.
 * Schema: { "Società|Sede": { "Voce": importo, ... }, ... }
 */

function renderCogeIndiretti() {
  const el = document.getElementById('sec-indiretti');
  if (!el) return;
  const voci = window.SECTOR_CONFIG.vociIndirette;
  const sedi = cogeUniqueSediConsedi();

  let h = '<div class="sec"><h3 class="sec-title">🏢 Costi Indiretti per Sede</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Inserisci a mano i costi indiretti annui per ogni Società × Sede. ' +
       'Salvataggio automatico in <code>localStorage</code> del browser. ' +
       'Le righe Sede sono ricavate dalle commesse caricate (anno ' + COGE.year + ').</p>';

  if (!sedi.length) {
    h += '<div class="card"><p style="text-align:center;padding:20px;color:var(--text3)">Nessuna Sede trovata. Verifica che le BU abbiano commesse nell\'anno selezionato.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  // Riepilogo totali
  let totIndir = 0;
  sedi.forEach(({ societa, sede }) => totIndir += cogeIndirettiSede(societa, sede));
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Sedi censite</div><div class="kpi-value">' + cogeFmt(sedi.length) + '</div><div class="kpi-sub">Società × Sede</div></div>';
  h += '<div class="kpi orange"><div class="kpi-label">Costi indiretti totali</div><div class="kpi-value">' + cogeFmtE(totIndir) + '</div><div class="kpi-sub">somma anno ' + COGE.year + '</div></div>';
  h += '<div class="kpi pink"><div class="kpi-label">Voci tracciate</div><div class="kpi-value">' + cogeFmt(voci.length) + '</div><div class="kpi-sub">per ogni sede</div></div>';
  h += '</div>';

  // Tabs Sede: una card per Sede
  sedi.forEach(({ societa, sede }) => {
    const k = societa + '|' + sede;
    const data = COGE.indiretti[k] || {};
    const totSede = Object.values(data).reduce((s, v) => s + (parseFloat(v) || 0), 0);

    h += '<div class="card" style="margin-bottom:14px">';
    h += '<h4>' + societa + ' · ' + sede + ' <span style="color:var(--text3);font-weight:400;margin-left:10px">Totale: <b style="color:#f59e0b">' + cogeFmtE(totSede) + '</b></span></h4>';
    h += '<table class="coge-tbl coge-edit" style="width:100%;max-width:600px"><thead><tr>';
    h += '<th>Voce</th><th style="text-align:right;width:160px">Importo annuo (€)</th>';
    h += '</tr></thead><tbody>';
    voci.forEach(v => {
      const val = data[v] || '';
      const inputId = 'ind_' + btoa(k + '|' + v).replace(/[^a-zA-Z0-9]/g, '');
      h += '<tr>';
      h += '<td>' + v + '</td>';
      h += '<td><input type="number" min="0" step="100" id="' + inputId + '" value="' + val + '" ' +
           'onchange="indSet(\'' + k.replace(/'/g, "\\'") + '\',\'' + v.replace(/'/g, "\\'") + '\',this.value)" ' +
           'style="width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);text-align:right;font-variant-numeric:tabular-nums" placeholder="0"></td>';
      h += '</tr>';
    });
    h += '</tbody></table>';
    h += '</div>';
  });

  h += '<div style="margin-top:14px;padding:12px;background:rgba(99,102,241,.06);border-left:3px solid #6366f1;border-radius:4px;font-size:11px;color:var(--text2)">' +
       '<b>💡 Suggerimenti:</b> Lascia in bianco le voci non applicabili (vengono trattate come 0). ' +
       'Per voci ricorrenti (es. affitto mensile €1000), inserisci il valore annuo (€12.000). ' +
       'Per esportare il backup: <code>localStorage.getItem("qg_coge_indiretti")</code> da console.</div>';

  h += '</div>';
  el.innerHTML = h;
}

function indSet(sedeKey, voce, value) {
  const v = parseFloat(value) || 0;
  if (!COGE.indiretti[sedeKey]) COGE.indiretti[sedeKey] = {};
  if (v === 0) {
    delete COGE.indiretti[sedeKey][voce];
    if (!Object.keys(COGE.indiretti[sedeKey]).length) delete COGE.indiretti[sedeKey];
  } else {
    COGE.indiretti[sedeKey][voce] = v;
  }
  cogeSaveIndiretti();
  // Soft re-render del totale Sede
  const card = event.target.closest('.card');
  if (card) {
    const totSede = Object.values(COGE.indiretti[sedeKey] || {}).reduce((s, x) => s + (parseFloat(x) || 0), 0);
    const totSpan = card.querySelector('h4 b');
    if (totSpan) totSpan.textContent = cogeFmtE(totSede);
  }
}
