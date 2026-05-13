/* ── Sezione IST-specifica: Istituti Scolastici ──
 * Caso 2 governance (fork interno BU): vive in dashboard_IST_CM/js/.
 *
 * IST è la BU per servizi a scuole/istituti (volume piccolo: 52 commesse).
 * Tipologie ricavate dal titolo (regex tolleranti a typo: MENTORIGN,
 * MENTORIN, CORRUCULARI, ISTR_, OORIENTAMENTO):
 *   - MENTORING       Mentoring & Orientamento famiglie/studenti (~30)
 *   - SCUOLA_40       PNRR Scuola 4.0 / Forniture digitali / Lab (~5)
 *   - CONSULENZA      Italia Scuola, rendicontazione (~7)
 *   - COMPETENZE      Curriculari, di base, extracurriculari (~3)
 *   - ISCOLA          Progetto regionale Sardegna iScola (~2)
 *   - FORMAZIONE      Corsi ISO 30415, Project Management (~3)
 *
 * Bandi ministeriali estratti dal suffisso "_DM<n>":
 *   DM170, DM19, DM66, DM88 — finanziamenti scuole.
 */

const IST_TIPI = [
  { id: 'MENTORING',  label: 'Mentoring & Orientamento', color: '#3b82f6',
    test: t => /MENTOR(?:ING|IN|INGE|IGN)\s*E?D?\s*O+RIENTAMENTO/i.test(t) ||
               /MENTORING|ORIENTAMENTO/i.test(t) },
  { id: 'SCUOLA_40',  label: 'Scuola 4.0 (PNRR)',        color: '#8b5cf6',
    test: t => /4\.0/i.test(t) || /LABORATORI\s+GREEN/i.test(t) ||
               /DOTAZIONI\s+DIGITALI/i.test(t) },
  { id: 'CONSULENZA', label: 'Consulenza Italia Scuola', color: '#10b981',
    test: t => /CONSULENZA\s+(?:ITALIA\s+)?SCUOLA|RENDICONTAZIONE/i.test(t) ||
               /Italia\s+Scuola/i.test(t) },
  { id: 'COMPETENZE', label: 'Competenze studenti',      color: '#f59e0b',
    test: t => /COMPETENZE\s+(?:DI\s+BASE|CURRICULARI|CORRUCULARI|EXTRA)/i.test(t) ||
               /EXTRA[_ ]CURRICULARI/i.test(t) },
  { id: 'ISCOLA',     label: 'Progetto iScola',          color: '#06b6d4',
    test: t => /ISCOLA/i.test(t) },
  { id: 'FORMAZIONE', label: 'Formazione (ISO/PM)',      color: '#fbbf24',
    test: t => /^FORM_|^FONDI_|^CORSO_|ISO\s*30415|PROJECT\s+MANAGEMENT/i.test(t) },
];

function _istTipo(c) {
  const t = c.titolo || '';
  for (const tp of IST_TIPI) if (tp.test(t)) return tp.id;
  return 'Altro';
}

function _istBando(c) {
  /* Estrae bando ministeriale "DM<n>" dal titolo. */
  const m = (c.titolo || '').match(/DM\s*(\d+)/i);
  return m ? 'DM' + m[1] : 'N/D';
}

function renderIstituti() {
  const el = document.getElementById('sec-istituti');
  if (!el) return;
  const f = filtered;

  const byTipo = {}; IST_TIPI.forEach(t => { byTipo[t.id] = 0; });
  byTipo['Altro'] = 0;
  const byBando = {};
  const byStatus = {};
  f.forEach(c => {
    byTipo[_istTipo(c)]++;
    const b = _istBando(c);
    byBando[b] = (byBando[b] || 0) + 1;
    const s = c.status || 'N/D';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  const totale = f.length;
  const mentor = byTipo['MENTORING'];
  const scuola40 = byTipo['SCUOLA_40'];
  const consul = byTipo['CONSULENZA'];
  const dm170 = byBando['DM170'] || 0;
  const dm19 = byBando['DM19'] || 0;
  const conBando = totale - (byBando['N/D'] || 0);
  const classificate = totale - byTipo['Altro'];
  const pctClass = totale ? (classificate / totale * 100) : 0;

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">Istituti Scolastici · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'IST gestisce servizi a scuole e istituti (volume piccolo: ' + fmt(totale) + ' commesse). ' +
       'Tipologia e bando ministeriale (DM170, DM19, DM66, DM88) sono estratti dal titolo. ' +
       'Regex tollerante ai typo storici (MENTORIGN, MENTORIN, OORIENTAMENTO).</p>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,.1);border-left:3px solid #10b981;border-radius:4px">' +
       'Classificate: <b>' + fmt(classificate) + '</b> / ' + fmt(totale) + ' (' + pctClass.toFixed(1) + '%). ' +
       'Con bando ministeriale: <b>' + fmt(conBando) + '</b>.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_istDrillT(\'MENTORING\')"><div class="kpi-label">🎓 Mentoring</div><div class="kpi-value">' + fmt(mentor) + '</div><div class="kpi-sub">orientamento studenti/famiglie</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_istDrillT(\'SCUOLA_40\')"><div class="kpi-label">💻 Scuola 4.0</div><div class="kpi-value">' + fmt(scuola40) + '</div><div class="kpi-sub">PNRR forniture digitali</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_istDrillT(\'CONSULENZA\')"><div class="kpi-label">📝 Consulenza</div><div class="kpi-value">' + fmt(consul) + '</div><div class="kpi-sub">Italia Scuola, rendicont.</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_istDrillB(\'DM170\')"><div class="kpi-label">📜 DM170</div><div class="kpi-value">' + fmt(dm170) + '</div><div class="kpi-sub">bando ministeriale</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_istDrillB(\'DM19\')"><div class="kpi-label">📜 DM19</div><div class="kpi-value">' + fmt(dm19) + '</div><div class="kpi-sub">bando ministeriale</div></div>';
  h += '<div class="kpi"><div class="kpi-label">Status</div><div class="kpi-value" style="font-size:13px">' +
       Object.entries(byStatus).map(([k, v]) => k + ': <b>' + v + '</b>').join('<br>') + '</div></div>';
  h += '</div>';

  // Charts
  h += '<div class="row2">';
  h += '<div class="card"><h4>Distribuzione per Tipologia</h4><div class="chart-wrap"><canvas id="chIstTipo"></canvas></div></div>';
  h += '<div class="card"><h4>Bandi Ministeriali</h4><div class="chart-wrap"><canvas id="chIstBando"></canvas></div></div>';
  h += '</div>';

  // Tabella (52 rec → mostro tutto)
  h += '<div class="card" style="margin-top:14px"><h4>Tutte le commesse IST · clicca Qnet per aprire</h4>';
  h += '<div class="tbl-scroll"><table id="tblIstDett"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  const tipiPresenti = IST_TIPI.map(t => t.id).concat(['Altro']).filter(k => byTipo[k] > 0);
  makeDonut('chIstTipo',
    tipiPresenti.map(k => k === 'Altro' ? 'Altro' : (IST_TIPI.find(t => t.id === k)?.label || k)),
    tipiPresenti.map(k => byTipo[k]),
    tipiPresenti.map(k => k === 'Altro' ? '#64748b' : (IST_TIPI.find(t => t.id === k)?.color || '#64748b')));

  const bandiOrder = ['DM170', 'DM19', 'DM66', 'DM88', 'N/D'];
  const bandiPresenti = bandiOrder.filter(k => byBando[k]);
  const bandiColors = { 'DM170': '#f59e0b', 'DM19': '#06b6d4', 'DM66': '#a78bfa', 'DM88': '#10b981', 'N/D': '#64748b' };
  makeDonut('chIstBando',
    bandiPresenti,
    bandiPresenti.map(k => byBando[k]),
    bandiPresenti.map(k => bandiColors[k] || '#64748b'));

  // Tabella (tutte le 52)
  const rows = f.map(c => [
    { display: (c.titolo || '—').substring(0, 55), val: c.titolo || '' },
    { display: _istTipo(c), val: _istTipo(c) },
    { display: _istBando(c), val: _istBando(c) },
    { display: (c.cliente || '—').substring(0, 30), val: c.cliente || '' },
    { display: c.status || '—', val: c.status || '' },
    { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
    { display: qnetBtn(c), val: c.id }
  ]);
  buildTbl('tblIstDett',
    ['Titolo', 'Tipo', 'Bando', 'Cliente', 'Status', 'Ricavi', 'Qnet'],
    rows,
    ['str', 'str', 'str', 'str', 'str', 'num', 'str']);
}

function _istDrillT(tipo) {
  const list = filtered.filter(c => _istTipo(c) === tipo);
  const lbl = IST_TIPI.find(t => t.id === tipo)?.label || tipo;
  if (typeof drillDownItems === 'function') drillDownItems(lbl + ' (' + list.length + ')', list);
}
function _istDrillB(bando) {
  const list = filtered.filter(c => _istBando(c) === bando);
  if (typeof drillDownItems === 'function') drillDownItems('Bando ' + bando + ' (' + list.length + ')', list);
}
