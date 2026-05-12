/* Sezione SOA-specifica: Firma Contratto
 * Caso 2 — fork interno alla BU SOA.
 * Monitora lo stato della firma del contratto (campo dataFirmaContratto)
 * e fornisce alert su commesse aperte senza firma.
 */
function _parseGmY(s) {
  const m = String(s || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function renderFirmaContratto() {
  const el = document.getElementById('sec-firmaContratto');
  if (!el) return;
  const f = filtered;

  const conFirma   = f.filter(c => (c.dataFirmaContratto || '').trim());
  const aperteSenza = f.filter(c => (typeof isOpen === 'function' ? isOpen(c) : true) && !(c.dataFirmaContratto || '').trim());

  // Distribuzione per anno di firma
  const byYear = {};
  conFirma.forEach(c => {
    const d = _parseGmY(c.dataFirmaContratto);
    if (!d) return;
    const y = String(d.getFullYear());
    byYear[y] = (byYear[y] || 0) + 1;
  });
  const years = Object.keys(byYear).sort();

  let h = '<div class="sec"><h3 class="sec-title">Firma Contratto</h3>';
  h += '<div class="kpi-grid" style="margin-bottom:14px">';
  h += mkpi(fmt(conFirma.length),                  'Commesse firmate');
  h += mkpi(fmt(aperteSenza.length),               'Aperte senza firma');
  h += mkpi(pct(conFirma.length, f.length),        '% Firma tracciata');
  h += mkpi(years.length ? years[years.length - 1] : '—', 'Ultimo anno di firma');
  h += '</div>';

  if (!conFirma.length && !aperteSenza.length) {
    h += '<div class="card"><p style="text-align:center;padding:20px;color:var(--text2)">Nessun dato di firma disponibile nei filtri correnti.</p></div>';
    h += '</div>';
    el.innerHTML = h;
    return;
  }

  if (years.length) {
    h += '<div class="card"><h4>Firme per Anno</h4><div class="chart-wrap"><canvas id="chFirmaYr"></canvas></div></div>';
  }
  if (aperteSenza.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Commesse Aperte Senza Firma</h4>';
    h += '<div class="tbl-scroll"><table id="tblNoFirma"></table></div></div>';
  }
  if (conFirma.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Firme Recenti</h4>';
    h += '<div class="tbl-scroll"><table id="tblFirma"></table></div></div>';
  }
  h += '</div>';
  el.innerHTML = h;

  if (years.length) {
    makeBar('chFirmaYr', years, years.map(y => byYear[y]), '#10b981', false);
  }

  if (aperteSenza.length) {
    buildTbl('tblNoFirma',
      ['Cliente', 'Titolo', 'Responsabile', 'Stato Lav.', 'Avz.', 'Data Inizio'],
      aperteSenza.map(c => [
        { display: c.cliente || '—',                              val: c.cliente || '' },
        { display: (c.titolo || '—').slice(0, 40),                val: c.titolo || '' },
        { display: c.responsabile || '—',                         val: c.responsabile || '' },
        { display: (c.statoLav || '—').slice(0, 50),              val: c.statoLav || '' },
        { display: (c.avanzamento || 0) + '%',                    val: c.avanzamento || 0 },
        { display: c.dataInizio || c.dataPianInizio || '—',       val: _parseGmY(c.dataInizio || c.dataPianInizio)?.getTime() || 0 }
      ]),
      ['str', 'str', 'str', 'str', 'num', 'num']
    );
    const rows = document.querySelectorAll('#tblNoFirma tbody tr');
    rows.forEach((row, i) => {
      row.classList.add('clickable');
      row.onclick = () => drillDownItems('Firma mancante — ' + (aperteSenza[i].cliente || '—'), [aperteSenza[i]]);
    });
  }

  if (conFirma.length) {
    const sortByFirma = [...conFirma].sort((a, b) =>
      (_parseGmY(b.dataFirmaContratto)?.getTime() || 0) - (_parseGmY(a.dataFirmaContratto)?.getTime() || 0)
    );
    buildTbl('tblFirma',
      ['Data Firma', 'Cliente', 'Titolo', 'Ricavi', 'Avz.', 'Status'],
      sortByFirma.slice(0, 50).map(c => [
        { display: c.dataFirmaContratto, val: _parseGmY(c.dataFirmaContratto)?.getTime() || 0 },
        { display: c.cliente || '—', val: c.cliente || '' },
        { display: (c.titolo || '—').slice(0, 40), val: c.titolo || '' },
        { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
        { display: (c.avanzamento || 0) + '%', val: c.avanzamento || 0 },
        { display: tagStatus(c.status), val: c.status || '' }
      ]),
      ['num', 'str', 'str', 'num', 'num', 'str']
    );
  }
}
