/* Sezione SOA-specifica: Aggiornamento Settimanale
 * Caso 2 — fork interno alla BU SOA.
 *
 * Campo dedicato: aggSettimanale (oggi spesso vuoto in Excel).
 * Fallback intelligente: usa dataUltimaNota come surrogato per identificare
 * commesse "ferme" da troppo tempo, in attesa che l'utente popoli il campo
 * dedicato nei prossimi cicli di aggiornamento.
 */
function _parseAgg(s) {
  const m = String(s || '').match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function _lastUpdate(c) {
  // Preferisci campo dedicato, altrimenti fallback su dataUltimaNota
  return _parseAgg(c.aggSettimanale) || _parseAgg(c.dataUltimaNota);
}

function _daysSince(d) {
  if (!d) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function renderAggSettimanale() {
  const el = document.getElementById('sec-aggSettimanale');
  if (!el) return;
  const f = filtered;

  const aperte = f.filter(c => typeof isOpen === 'function' ? isOpen(c) : true);
  const hasDedicato = f.filter(c => (c.aggSettimanale || '').trim()).length;
  const hasFallback = f.filter(c => !(c.aggSettimanale || '').trim() && (c.dataUltimaNota || '').trim()).length;

  // Bins per giorni dall'ultimo aggiornamento (solo aperte)
  const bins = { '0-7gg': [], '8-14gg': [], '15-30gg': [], '31-60gg': [], '>60gg': [], 'mai': [] };
  aperte.forEach(c => {
    const d = _lastUpdate(c);
    const days = _daysSince(d);
    if (days === null)      bins['mai'].push(c);
    else if (days <= 7)     bins['0-7gg'].push(c);
    else if (days <= 14)    bins['8-14gg'].push(c);
    else if (days <= 30)    bins['15-30gg'].push(c);
    else if (days <= 60)    bins['31-60gg'].push(c);
    else                    bins['>60gg'].push(c);
  });

  let h = '<div class="sec"><h3 class="sec-title">Aggiornamento Settimanale</h3>';
  h += '<div class="kpi-grid" style="margin-bottom:14px">';
  h += mkpi(fmt(hasDedicato),                'Con campo dedicato');
  h += mkpi(fmt(hasFallback),                'Solo da Ultima Nota');
  h += mkpi(fmt(bins['>60gg'].length + bins['mai'].length), 'Aperte ferme >60gg');
  h += mkpi(fmt(bins['0-7gg'].length),       'Aperte aggiornate <7gg');
  h += '</div>';

  if (!hasDedicato) {
    h += '<div class="card" style="border-left:3px solid var(--warning);padding:14px;margin-bottom:14px">';
    h += '<p style="color:var(--text2);font-size:13px;line-height:1.5">';
    h += '<strong>Nota:</strong> il campo Excel "Aggiornamento Settimanale" è attualmente vuoto. ';
    h += 'Questa vista usa <code>dataUltimaNota</code> come surrogato finché il campo non viene popolato.';
    h += '</p></div>';
  }

  h += '<div class="card"><h4>Commesse Aperte per "Ferme da"</h4><div class="chart-wrap"><canvas id="chAggBins"></canvas></div></div>';

  const ferme = [...bins['>60gg'], ...bins['31-60gg']].sort((a, b) => {
    const da = _lastUpdate(a)?.getTime() || 0;
    const db = _lastUpdate(b)?.getTime() || 0;
    return da - db;
  });
  if (ferme.length) {
    h += '<div class="card" style="margin-top:14px"><h4>Commesse Aperte da Sollecitare (>30gg)</h4>';
    h += '<div class="tbl-scroll"><table id="tblFerme"></table></div></div>';
  }

  h += '</div>';
  el.innerHTML = h;

  makeBar('chAggBins',
    Object.keys(bins),
    Object.values(bins).map(arr => arr.length),
    '#ef4444', false);

  if (ferme.length) {
    const top = ferme.slice(0, 100);
    buildTbl('tblFerme',
      ['Ultimo agg.', 'Giorni', 'Cliente', 'Responsabile', 'Stato Lav.', 'Avz.'],
      top.map(c => {
        const d = _lastUpdate(c);
        const days = _daysSince(d);
        const dStr = d ? d.toLocaleDateString('it-IT') : 'mai';
        const dTag = days === null ? '<span class="tag tag-red">mai</span>'
                   : days > 60     ? '<span class="tag tag-red">' + days + 'gg</span>'
                   :                  '<span class="tag tag-yellow">' + days + 'gg</span>';
        return [
          { display: dStr, val: d?.getTime() || 0 },
          { display: dTag, val: days === null ? 99999 : days },
          { display: c.cliente || '—',                       val: c.cliente || '' },
          { display: c.responsabile || '—',                  val: c.responsabile || '' },
          { display: (c.statoLav || '—').slice(0, 50),       val: c.statoLav || '' },
          { display: (c.avanzamento || 0) + '%',             val: c.avanzamento || 0 }
        ];
      }),
      ['num', 'num', 'str', 'str', 'str', 'num']
    );
    const rows = document.querySelectorAll('#tblFerme tbody tr');
    rows.forEach((row, i) => {
      row.classList.add('clickable');
      row.onclick = () => drillDownItems('Aggiornamento — ' + (top[i].cliente || '—'), [top[i]]);
    });
  }
}
