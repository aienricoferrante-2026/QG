/* ── Sezione ISO-specifica: Scopo Proposto vs Scopo in Uscita ──
 * Confronta il testo del campo "Scopo proposto" con "Scopo in uscita".
 *
 * Limitazione nota sui dati: solo ~54% dei record ha Scopo proposto e
 * solo ~1.7% ha Scopo in uscita. Quindi la sezione mostra principalmente
 * le commesse dove entrambi sono compilati (69 record) e i mismatch
 * fra i due (65 record).
 */

function _isoScopoNorm(s) {
  /* Normalizza testo per confronto: spazi multipli → singolo, lowercase,
     elimina punteggiatura ai bordi. Per il display il testo resta com'è. */
  return String(s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[\s.,;:]+$/g, '').trim();
}

function renderScopo() {
  const el = document.getElementById('sec-scopo');
  if (!el) return;
  const f = filtered;

  const conProp = f.filter(c => c.isoScopoProposto && c.isoScopoProposto.trim());
  const conUsc = f.filter(c => c.isoScopoUscita && c.isoScopoUscita.trim());
  const conEntrambi = f.filter(c =>
    c.isoScopoProposto && c.isoScopoProposto.trim() &&
    c.isoScopoUscita && c.isoScopoUscita.trim()
  );
  const differenti = conEntrambi.filter(c =>
    _isoScopoNorm(c.isoScopoProposto) !== _isoScopoNorm(c.isoScopoUscita)
  );

  let h = '<div class="sec"><h3 class="sec-title">Scopo Proposto vs Scopo in Uscita · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Il <i>Scopo proposto</i> è l\'ambito di certificazione richiesto inizialmente; lo <i>Scopo in uscita</i> ' +
       'è quello effettivamente certificato dopo l\'audit. Le righe in cui i due testi differiscono indicano ' +
       'commesse dove l\'ambito è stato ristretto o esteso durante la lavorazione.</p>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(245,158,11,.1);border-left:3px solid #f59e0b;border-radius:4px">' +
       '⚠ Solo ~1.7% delle commesse ISO ha "Scopo in uscita" compilato. La sezione è poco rappresentativa fino a quando il campo non viene popolato sistematicamente.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_isoDrillScopo(\'prop\')"><div class="kpi-label">Con Scopo proposto</div><div class="kpi-value">' + fmt(conProp.length) + '</div><div class="kpi-sub">' + (f.length ? (conProp.length/f.length*100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_isoDrillScopo(\'usc\')"><div class="kpi-label">Con Scopo uscita</div><div class="kpi-value">' + fmt(conUsc.length) + '</div><div class="kpi-sub">' + (f.length ? (conUsc.length/f.length*100).toFixed(1) : 0) + '% del totale</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_isoDrillScopo(\'entrambi\')"><div class="kpi-label">Entrambi compilati</div><div class="kpi-value">' + fmt(conEntrambi.length) + '</div><div class="kpi-sub">coppia confrontabile</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_isoDrillScopo(\'diff\')"><div class="kpi-label">⚠ Differenti</div><div class="kpi-value">' + fmt(differenti.length) + '</div><div class="kpi-sub">proposto ≠ uscita</div></div>';
  h += '</div>';

  // Top scopi proposti (frequenza)
  const topScopi = {};
  conProp.forEach(c => {
    const k = _isoScopoNorm(c.isoScopoProposto).substring(0, 80);
    topScopi[k] = (topScopi[k] || 0) + 1;
  });
  const topSorted = Object.entries(topScopi).sort((a, b) => b[1] - a[1]).slice(0, 15);
  h += '<div class="card"><h4>Top "Scopo proposto" più frequenti (max 15)</h4>';
  h += '<div class="tbl-scroll"><table id="tblTopScopi"></table></div></div>';

  // Tabella mismatch (le 65 commesse con proposto ≠ uscita)
  if (differenti.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Commesse con Scopo proposto diverso dall\'uscita</h4>';
    h += '<div class="tbl-scroll"><table id="tblMismatchScopo"></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  buildTbl('tblTopScopi',
    ['Scopo proposto (testo abbreviato)', 'Occorrenze'],
    topSorted.map(([k, v]) => [
      { display: k.length > 70 ? k.substring(0, 68) + '…' : k, val: k },
      { display: fmt(v), val: v }
    ]),
    ['str', 'num']
  );

  if (differenti.length) {
    buildTbl('tblMismatchScopo',
      ['Cliente', 'Scopo proposto', 'Scopo uscita', 'Standard', 'Qnet'],
      differenti.slice(0, 30).map(c => [
        { display: (c.cliente || '—').substring(0, 30), val: c.cliente || '' },
        { display: String(c.isoScopoProposto).substring(0, 50), val: c.isoScopoProposto },
        { display: String(c.isoScopoUscita).substring(0, 50), val: c.isoScopoUscita },
        { display: c.isoStandard || '—', val: c.isoStandard || '' },
        { display: qnetBtn(c), val: c.id }
      ]),
      ['str', 'str', 'str', 'str', 'str']
    );
  }
}

function _isoDrillScopo(bucket) {
  let pred, label;
  if (bucket === 'prop')        { pred = c => c.isoScopoProposto && c.isoScopoProposto.trim(); label = 'Con Scopo proposto'; }
  else if (bucket === 'usc')    { pred = c => c.isoScopoUscita && c.isoScopoUscita.trim(); label = 'Con Scopo in uscita'; }
  else if (bucket === 'entrambi') {
    pred = c => c.isoScopoProposto && c.isoScopoProposto.trim() && c.isoScopoUscita && c.isoScopoUscita.trim();
    label = 'Entrambi compilati';
  }
  else if (bucket === 'diff') {
    pred = c => c.isoScopoProposto && c.isoScopoUscita
      && _isoScopoNorm(c.isoScopoProposto) !== _isoScopoNorm(c.isoScopoUscita);
    label = 'Scopo proposto ≠ uscita';
  }
  else return;
  const list = filtered.filter(pred);
  if (typeof drillDownItems === 'function') drillDownItems(label + ' (' + list.length + ')', list);
}
