/* ── Sezione ISO-specifica: Audit & Verifiche ──
 * Caso 2 governance (fork interno BU): vive in dashboard_ISO_CM/js/.
 * Riusa fmt/fmtE/makeBar/buildTbl/qnetBtn/drillDownItems del kit.
 *
 * Focus: visibilità sulle prossime verifiche di sorveglianza/ricertificazione,
 * scadenze in ritardo, urgenze emissione e mismatch fra data verifica
 * pianificata e data verifica effettiva.
 */

function _isoParseDate(s) {
  if (!s) return null;
  const m = String(s).match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (!m) return null;
  return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]));
}

function _isoDaysFromNow(d) {
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function _isoBucket(days) {
  if (days === null) return null;
  if (days < 0)   return 'overdue';
  if (days <= 30) return 'd30';
  if (days <= 60) return 'd60';
  if (days <= 90) return 'd90';
  return 'oltre';
}

function _isoUpcomingAudits(items, withinDays) {
  /* Filtra commesse con Data Verifica futura entro `withinDays` giorni,
     escludendo quelle già con verifica effettiva (= audit svolto). */
  const out = [];
  items.forEach(c => {
    const d = _isoParseDate(c.isoDataVerifica);
    if (!d) return;
    const days = _isoDaysFromNow(d);
    if (days === null || days < 0 || days > withinDays) return;
    if (c.isoDataVerificaEff) return;  // già svolto
    out.push({ c, days, dateObj: d });
  });
  out.sort((a, b) => a.days - b.days);
  return out;
}

function _isoOverdueAudits(items) {
  /* Verifiche pianificate ma non eseguite con data superata. */
  const out = [];
  items.forEach(c => {
    const d = _isoParseDate(c.isoDataVerifica);
    if (!d) return;
    const days = _isoDaysFromNow(d);
    if (days === null || days >= 0) return;
    if (c.isoDataVerificaEff) return;
    out.push({ c, days: -days, dateObj: d });
  });
  out.sort((a, b) => b.days - a.days);  // più in ritardo prima
  return out;
}

function _isoVerifyMismatch(items, gapDays) {
  /* Commesse con scostamento >= gapDays giorni tra pianificata ed effettiva. */
  const out = [];
  items.forEach(c => {
    const dp = _isoParseDate(c.isoDataVerifica);
    const de = _isoParseDate(c.isoDataVerificaEff);
    if (!dp || !de) return;
    const gap = Math.round((de - dp) / 86400000);
    if (Math.abs(gap) < gapDays) return;
    out.push({ c, gap, dp, de });
  });
  out.sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));
  return out;
}

function _isoMonthKey(d) {
  return d.getFullYear() * 100 + (d.getMonth() + 1);
}

function _isoVerificheByMonth(items) {
  /* Conteggi mensili: pianificate vs effettive (ultimi 12 mesi). */
  const planG = new Map(), effG = new Map();
  items.forEach(c => {
    const dp = _isoParseDate(c.isoDataVerifica);
    if (dp) {
      const k = _isoMonthKey(dp);
      planG.set(k, (planG.get(k) || 0) + 1);
    }
    const de = _isoParseDate(c.isoDataVerificaEff);
    if (de) {
      const k = _isoMonthKey(de);
      effG.set(k, (effG.get(k) || 0) + 1);
    }
  });
  const allKeys = new Set([...planG.keys(), ...effG.keys()]);
  const sorted = [...allKeys].sort();
  const last12 = sorted.slice(-12);
  const labels = last12.map(k => String(k % 100).padStart(2, '0') + '/' + String(Math.floor(k / 100)).slice(-2));
  return {
    labels,
    plan: last12.map(k => planG.get(k) || 0),
    eff:  last12.map(k => effG.get(k)  || 0)
  };
}

function renderAudit() {
  const el = document.getElementById('sec-audit');
  if (!el) return;
  const f = filtered;

  const upcoming30 = _isoUpcomingAudits(f, 30);
  const upcoming60 = _isoUpcomingAudits(f, 60);
  const upcoming90 = _isoUpcomingAudits(f, 90);
  const overdue    = _isoOverdueAudits(f);
  const urgenze    = f.filter(c => c.isoUrgenza && String(c.isoUrgenza).trim() && c.isoUrgenza !== 'No');
  const mismatch14 = _isoVerifyMismatch(f, 14);

  const trend = _isoVerificheByMonth(f);

  let h = '<div class="sec"><h3 class="sec-title">Audit &amp; Verifiche · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Visibilità sulle verifiche pianificate (Data Verifica) e su quelle già ' +
       'eseguite (Data Verifica Effettiva). Le commesse senza data verifica ' +
       'compilata non compaiono in questa sezione.</p>';

  // KPI macro (clickabili → drill-down)
  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi red" style="cursor:pointer" onclick="_isoDrillUpcoming(\'overdue\')"><div class="kpi-label">⛔ In Ritardo</div><div class="kpi-value">' + fmt(overdue.length) + '</div><div class="kpi-sub">verifica scaduta, non svolta</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_isoDrillUpcoming(\'d30\')"><div class="kpi-label">⚠️ Entro 30 gg</div><div class="kpi-value">' + fmt(upcoming30.length) + '</div><div class="kpi-sub">prossime verifiche</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_isoDrillUpcoming(\'d60\')"><div class="kpi-label">Entro 60 gg</div><div class="kpi-value">' + fmt(upcoming60.length) + '</div><div class="kpi-sub">pianificate</div></div>';
  h += '<div class="kpi blue" style="cursor:pointer" onclick="_isoDrillUpcoming(\'d90\')"><div class="kpi-label">Entro 90 gg</div><div class="kpi-value">' + fmt(upcoming90.length) + '</div><div class="kpi-sub">orizzonte trimestrale</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_isoDrillUrgenze()"><div class="kpi-label">Urgenze Emissione</div><div class="kpi-value">' + fmt(urgenze.length) + '</div><div class="kpi-sub">campo Urgenza valorizzato</div></div>';
  h += '</div>';

  // Trend mensile
  h += '<div class="card"><h4>Verifiche per mese · pianificate vs effettive (ultimi ' + trend.labels.length + ' mesi)</h4>';
  h += '<div class="chart-wrap"><canvas id="chAuditTrend"></canvas></div></div>';

  // Tabella prossime verifiche (entro 90 gg)
  h += '<div class="card" style="margin-top:14px"><h4>Prossime Verifiche (entro 90 gg, max 30 righe)</h4>';
  h += '<div class="tbl-scroll"><table id="tblUpcomingAudit"></table></div></div>';

  // Tabella in ritardo
  h += '<div class="card" style="margin-top:14px"><h4>In Ritardo · verifica pianificata e non svolta</h4>';
  h += '<div class="tbl-scroll"><table id="tblOverdueAudit"></table></div></div>';

  // Tabella mismatch
  h += '<div class="card" style="margin-top:14px"><h4>Scostamenti Verifica Pianificata vs Effettiva (≥ 14 gg)</h4>';
  h += '<div class="tbl-scroll"><table id="tblMismatchAudit"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // Chart trend (line plan vs bar eff)
  if (typeof Chart !== 'undefined' && trend.labels.length && _charts) {
    if (_charts['chAuditTrend']) _charts['chAuditTrend'].destroy();
    _charts['chAuditTrend'] = new Chart(document.getElementById('chAuditTrend'), {
      data: {
        labels: trend.labels,
        datasets: [
          { type: 'bar',  label: 'Pianificate',         data: trend.plan, backgroundColor: '#3b82f6cc', borderRadius: 4 },
          { type: 'line', label: 'Effettivamente svolte', data: trend.eff,  borderColor: '#10b981', backgroundColor: '#10b98133', borderWidth: 2, tension: .3, pointRadius: 3, pointBackgroundColor: '#10b981' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top', labels: { color: '#94a3b8', font: { size: 10 } } },
          tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: '#475569', borderWidth: 1, padding: 10 }
        },
        scales: {
          x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: 'rgba(71,85,105,.2)' } },
          y: { ticks: { color: '#64748b', font: { size: 9 } }, grid: { color: 'rgba(71,85,105,.2)' }, beginAtZero: true }
        }
      }
    });
  }

  buildTbl('tblUpcomingAudit',
    ['Data Verifica', 'Gg', 'Cliente', 'Standard', 'Tipo Audit', 'Ente', 'Responsabile', 'Qnet'],
    upcoming90.slice(0, 30).map(({ c, days, dateObj }) => [
      { display: c.isoDataVerifica, val: dateObj.getTime() },
      { display: '+' + days, val: days },
      { display: (c.cliente || '—').substring(0, 40), val: c.cliente || '' },
      { display: c.isoStandard || '—', val: c.isoStandard || '' },
      { display: c.isoTipoAudit || '—', val: c.isoTipoAudit || '' },
      { display: (c.isoEnte || '—').substring(0, 25), val: c.isoEnte || '' },
      { display: (c.responsabile || '—').substring(0, 25), val: c.responsabile || '' },
      { display: qnetBtn(c), val: c.id }
    ]),
    ['num', 'num', 'str', 'str', 'str', 'str', 'str', 'str']
  );

  buildTbl('tblOverdueAudit',
    ['Data Verifica', 'Gg ritardo', 'Cliente', 'Standard', 'Tipo Audit', 'Ente', 'Responsabile', 'Qnet'],
    overdue.slice(0, 30).map(({ c, days, dateObj }) => [
      { display: c.isoDataVerifica, val: dateObj.getTime() },
      { display: '-' + days, val: days },
      { display: (c.cliente || '—').substring(0, 40), val: c.cliente || '' },
      { display: c.isoStandard || '—', val: c.isoStandard || '' },
      { display: c.isoTipoAudit || '—', val: c.isoTipoAudit || '' },
      { display: (c.isoEnte || '—').substring(0, 25), val: c.isoEnte || '' },
      { display: (c.responsabile || '—').substring(0, 25), val: c.responsabile || '' },
      { display: qnetBtn(c), val: c.id }
    ]),
    ['num', 'num', 'str', 'str', 'str', 'str', 'str', 'str']
  );

  buildTbl('tblMismatchAudit',
    ['Pianificata', 'Effettiva', 'Gap gg', 'Cliente', 'Standard', 'Tipo Audit', 'Qnet'],
    mismatch14.slice(0, 30).map(({ c, gap, dp, de }) => [
      { display: c.isoDataVerifica,    val: dp.getTime() },
      { display: c.isoDataVerificaEff, val: de.getTime() },
      { display: (gap > 0 ? '+' : '') + gap, val: gap },
      { display: (c.cliente || '—').substring(0, 40), val: c.cliente || '' },
      { display: c.isoStandard || '—', val: c.isoStandard || '' },
      { display: c.isoTipoAudit || '—', val: c.isoTipoAudit || '' },
      { display: qnetBtn(c), val: c.id }
    ]),
    ['num', 'num', 'num', 'str', 'str', 'str', 'str']
  );
}

/* Handler per i drill-down dei KPI audit. */
function _isoDrillUpcoming(bucket) {
  const map = { overdue: 'In Ritardo', d30: 'Entro 30 gg', d60: 'Entro 60 gg', d90: 'Entro 90 gg' };
  const list = bucket === 'overdue'
    ? _isoOverdueAudits(filtered).map(x => x.c)
    : _isoUpcomingAudits(filtered, bucket === 'd30' ? 30 : bucket === 'd60' ? 60 : 90).map(x => x.c);
  if (typeof drillDownItems === 'function') drillDownItems(map[bucket] + ' (' + list.length + ')', list);
}
function _isoDrillUrgenze() {
  const list = filtered.filter(c => c.isoUrgenza && String(c.isoUrgenza).trim() && c.isoUrgenza !== 'No');
  if (typeof drillDownItems === 'function') drillDownItems('Urgenze Emissione (' + list.length + ')', list);
}
