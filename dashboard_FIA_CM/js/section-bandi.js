/* ── Sezione FIA-specifica: Bandi & Fondi Pubblici ──
 * Caso 2 governance (fork interno BU): vive in dashboard_FIA_CM/js/.
 *
 * I titoli FIA sono semi-strutturati con prefisso bando.
 * Parser client-side classifica 6 bandi principali (91% copertura):
 *   - FNC      Fondo Nuove Competenze (PNRR) — bando dominante
 *   - FON      Fondi Interprofessionali (Forma.Temp, Fondimpresa, ecc.)
 *   - ISI      INAIL ISI (Investimenti Sicurezza)
 *   - FIN      Incentivi Assunzioni / Finanza generale
 *   - PID      Punti Innovazione Digitale Unioncamere
 *   - INCENT   Incentivi assunzioni (variante testuale)
 *
 * Particolare attenzione al "Da Incassare": per i bandi pubblici la
 * liquidazione avviene a fine progetto, quindi daInc ≈ ricavi.
 * Il KPI Pipeline = somma daInc è la pipeline incassi futura.
 */

const FIA_BANDI = [
  { id: 'FNC',   label: 'Fondo Nuove Competenze', color: '#3b82f6',
    test: t => /^FNC[\s_]/i.test(t) || /FONDO\s+NUOVE\s+COMPETENZE/i.test(t) },
  { id: 'FON',   label: 'Fondi Interprofessionali', color: '#10b981',
    test: t => /^FON[\s_]/i.test(t) },
  { id: 'ISI',   label: 'INAIL ISI',              color: '#f59e0b',
    test: t => /^ISI[\s_]/i.test(t) || /ISI\s+INAIL/i.test(t) },
  { id: 'FIN',   label: 'Finanza / Incentivi',    color: '#a78bfa',
    test: t => /^FIN[\s_]/i.test(t) },
  { id: 'PID',   label: 'PID Unioncamere',        color: '#06b6d4',
    test: t => /NEXT/i.test(t) && /(PID|UNIONCAMERE)/i.test(t) },
  { id: 'INCENT', label: 'Incentivi Assunzioni',  color: '#fb7185',
    test: t => /INCENTIVI/i.test(t) && /ASSUNZ/i.test(t) },
  { id: 'IND40', label: 'Industria 4.0 / Beni Strum.', color: '#8b5cf6',
    test: t => /^I+NDUSTRIA/i.test(t) || /BENI\s+STRUMENTALI/i.test(t) },
];

function _fiaBando(c) {
  const t = c.titolo || '';
  for (const b of FIA_BANDI) if (b.test(t)) return b.id;
  return 'Altro';
}

function _fiaAnno(c) {
  /* Anno bando dal titolo (es. "ISI_INAIL 2024" → 2024) oppure da dataInizio. */
  const t = c.titolo || '';
  let m = t.match(/(20\d{2})/);
  if (m) return m[1];
  const s = c.dataInizio || c.dataPianInizio || '';
  m = String(s).match(/^(\d{4})-/);
  if (m) return m[1];
  m = String(s).match(/-(\d{4})$/);
  if (m) return m[1];
  return 'N/D';
}

function renderBandi() {
  const el = document.getElementById('sec-bandi');
  if (!el) return;
  const f = filtered;

  // Aggrega per bando
  const byBando = {};
  ['FNC','FON','ISI','FIN','PID','INCENT','IND40','Altro'].forEach(k => {
    byBando[k] = { cnt: 0, ric: 0, daInc: 0, incassato: 0, pipe: 0, chiuse: 0 };
  });
  const byAnno = {}; const statoXBando = {};
  f.forEach(c => {
    const b = _fiaBando(c);
    const v = byBando[b];
    v.cnt++;
    v.ric += (c.consulenza || 0);
    v.daInc += (c.daIncassare || 0);
    v.incassato += (c.giaIncassato || 0);
    if (c.status === 'Da pianificare') v.pipe++;
    if (c.status === 'Chiusa') v.chiuse++;
    const a = _fiaAnno(c);
    if (!byAnno[a]) byAnno[a] = 0;
    byAnno[a]++;
    if (!statoXBando[b]) statoXBando[b] = {};
    const st = c.status || 'N/D';
    statoXBando[b][st] = (statoXBando[b][st] || 0) + 1;
  });

  const totale = f.length;
  const fnc = byBando['FNC'].cnt;
  const fon = byBando['FON'].cnt;
  const isi = byBando['ISI'].cnt;
  const pipeTot = f.filter(c => c.status === 'Da pianificare').length;
  const daIncTot = f.reduce((s, c) => s + (c.daIncassare || 0), 0);
  const classificate = totale - byBando['Altro'].cnt;
  const pctClass = totale ? (classificate / totale * 100) : 0;

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Bandi &amp; Fondi Pubblici · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Bando ricavato dal prefisso del <i>Titolo</i> commessa. ' +
       'I bandi pubblici si liquidano a fine progetto: quindi <b>Da Incassare ≈ Ricavi</b> ' +
       'e il KPI "Pipeline pianificata" indica lavoro futuro da avviare.</p>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,.1);border-left:3px solid #10b981;border-radius:4px">' +
       'Classificate: <b>' + fmt(classificate) + '</b> / ' + fmt(totale) + ' (' + pctClass.toFixed(1) + '%). ' +
       'Le commesse non riconosciute finiscono in "Altro".</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_fiaDrillB(\'FNC\')"><div class="kpi-label">🎯 FNC</div><div class="kpi-value">' + fmt(fnc) + '</div><div class="kpi-sub">Fondo Nuove Competenze</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_fiaDrillB(\'FON\')"><div class="kpi-label">🏛 FON</div><div class="kpi-value">' + fmt(fon) + '</div><div class="kpi-sub">Fondi Interprofessionali</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_fiaDrillB(\'ISI\')"><div class="kpi-label">🛡 ISI INAIL</div><div class="kpi-value">' + fmt(isi) + '</div><div class="kpi-sub">Bando Sicurezza</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_fiaDrillB(\'PID\')"><div class="kpi-label">💡 PID</div><div class="kpi-value">' + fmt(byBando['PID'].cnt) + '</div><div class="kpi-sub">Unioncamere Digitale</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_fiaDrillPipe()"><div class="kpi-label">⏳ Pipeline pianificata</div><div class="kpi-value">' + fmt(pipeTot) + '</div><div class="kpi-sub">status "Da pianificare"</div></div>';
  h += '<div class="kpi red"><div class="kpi-label">💸 Da incassare</div><div class="kpi-value">' + fmtE(daIncTot) + '</div><div class="kpi-sub">somma daIncassare</div></div>';
  h += '</div>';

  // Charts
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Bando</h4><div class="chart-wrap"><canvas id="chFiaBando"></canvas></div></div>';
  h += '<div class="card"><h4>Ricavi per Bando</h4><div class="chart-wrap"><canvas id="chFiaRic"></canvas></div></div>';
  h += '</div>';

  h += '<div class="row2" style="margin-top:14px">';
  h += '<div class="card"><h4>Anno bando / avvio</h4><div class="chart-wrap"><canvas id="chFiaAnno"></canvas></div></div>';
  h += '<div class="card"><h4>Da Incassare per Bando</h4><div class="chart-wrap"><canvas id="chFiaDaInc"></canvas></div></div>';
  h += '</div>';

  // Tabella per bando con status breakdown
  h += '<div class="card" style="margin-top:14px"><h4>Dettaglio per Bando · pipeline e incassi</h4>';
  h += '<div class="tbl-scroll"><table id="tblFiaBandi"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  const order = FIA_BANDI.map(b => b.id).concat(['Altro']);
  const orderPresenti = order.filter(k => byBando[k].cnt > 0);
  const labels = orderPresenti.map(k => k === 'Altro' ? 'Altro' : (FIA_BANDI.find(b => b.id === k)?.label || k));
  const colors = orderPresenti.map(k => k === 'Altro' ? '#64748b' : (FIA_BANDI.find(b => b.id === k)?.color || '#64748b'));
  makeDonut('chFiaBando', labels, orderPresenti.map(k => byBando[k].cnt), colors);
  makeBar('chFiaRic',    labels, orderPresenti.map(k => byBando[k].ric),     '#3b82f6', true);
  makeBar('chFiaDaInc',  labels, orderPresenti.map(k => byBando[k].daInc),   '#dc2626', true);

  const anniOrder = Object.keys(byAnno).filter(k => k !== 'N/D').sort();
  makeBar('chFiaAnno', anniOrder, anniOrder.map(k => byAnno[k]), '#10b981', false);

  // Tabella
  buildTbl('tblFiaBandi',
    ['Bando', 'Commesse', 'Da Pianificare', 'Chiuse', 'Ricavi', 'Da incassare', '% Pipeline'],
    orderPresenti.map(k => {
      const v = byBando[k];
      const lbl = k === 'Altro' ? 'Altro' : (FIA_BANDI.find(b => b.id === k)?.label || k);
      const pctPipe = v.cnt ? (v.pipe / v.cnt * 100) : 0;
      return [
        { display: lbl, val: lbl },
        { display: fmt(v.cnt), val: v.cnt },
        { display: fmt(v.pipe), val: v.pipe },
        { display: fmt(v.chiuse), val: v.chiuse },
        { display: fmtE(v.ric), val: v.ric },
        { display: fmtE(v.daInc), val: v.daInc },
        { display: pctPipe.toFixed(1) + '%', val: pctPipe }
      ];
    }),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num']);
}

function _fiaDrillB(bando) {
  const list = filtered.filter(c => _fiaBando(c) === bando);
  const lbl = FIA_BANDI.find(b => b.id === bando)?.label || bando;
  if (typeof drillDownItems === 'function') drillDownItems(lbl + ' (' + list.length + ')', list);
}

function _fiaDrillPipe() {
  const list = filtered.filter(c => c.status === 'Da pianificare');
  if (typeof drillDownItems === 'function') drillDownItems('Pipeline pianificata (' + list.length + ')', list);
}
