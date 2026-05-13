/* ── Sezione APL_PAL-specifica: GOL & Politiche Attive ──
 * Caso 2 governance (fork interno BU): vive in dashboard_APL_PAL_CM/js/.
 *
 * APL_PAL è essenzialmente GOL (94%, 1328/1415). Il campo `statoLav` è
 * super-strutturato con codici PAL del processo amministrativo (es.
 * "PAL_2.2.1_Controllo Documenti cartacei", "PAL_2.2.5_Conclusa",
 * "TIROCINI_COMMESSA CONCLUSA"). Il titolo segue il pattern
 * "APL_GOL_<Nome Cognome>_<Città>[_N]" dove _N è un duplicato di sistema.
 *
 * Funnel a 6 step (aggregazione delle 23 fasi distinte di statoLav):
 *   1. Avvio              PAL_1.*, PAL_2.1, PAL_2.2 (no .x)
 *   2. Documenti          PAL_2.2.1, PAL_2.2.2, PAL_2.3, PAL_3.3.1, PAL_4.4.1
 *   3. Pagamento richiesto PAL_2.2.3, PAL_2.2.4, PAL_3.3.3
 *   4. PAL Concluso        PAL_2.2.5, PAL_3.3.5, PAL_4.4.6
 *   5. Tirocinio attivo    PAL_4.4.5
 *   6. Tirocinio concluso  TIROCINI_COMMESSA CONCLUSA
 * Il resto (***, vuoto, "Conclusa" senza codice) → "Indefinito".
 */

const GOL_FUNNEL = [
  { id: 'Avvio',        color: '#a78bfa', re: /^PAL_(?:1\.\d|2\.1|2\.2)(?:_|$)/ },
  { id: 'Documenti',    color: '#3b82f6', re: /^PAL_(?:2\.2\.[12]|2\.3|3\.3\.1|4\.4\.1)(?:_|$)/ },
  { id: 'Pagamento',    color: '#06b6d4', re: /^PAL_(?:2\.2\.[34]|3\.3\.3)(?:_|$)/ },
  { id: 'Concluso PAL', color: '#10b981', re: /^PAL_(?:2\.2\.5|3\.3\.5|4\.4\.6)(?:_|$)/ },
  { id: 'Tiroc. attivo',  color: '#f59e0b', re: /^PAL_4\.4\.5(?:_|\s|$)/ },
  { id: 'Tiroc. concluso',color: '#84cc16', re: /^TIROCINI_/ },
];

function _golIsGol(c) {
  return /GOL/i.test(c.titolo || '');
}

function _golFase(c) {
  const sl = (c.statoLav || '').trim();
  for (const step of GOL_FUNNEL) if (step.re.test(sl)) return step.id;
  return 'Indefinito';
}

function _golCity(c) {
  /* Estrae la città dal titolo "APL_GOL_<Nome>_<Città>[_N]" rimuovendo
     un suffisso numerico finale (es. _1) che indica duplicato di sistema.
     Normalizza varianti GRUMELLO/GRUMELLODELMONTE → "Grumello del Monte". */
  const t = c.titolo || '';
  if (!/GOL/i.test(t)) return 'N/D';
  const parts = t.split(/_/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return 'N/D';
  let city = parts[parts.length - 1];
  if (/^\d+$/.test(city)) {
    if (parts.length < 4) return 'N/D';
    city = parts[parts.length - 2];
  }
  city = city.toUpperCase();
  if (/GRUMELLO/.test(city)) return 'Grumello del Monte';
  if (/FRATTAMAGG/.test(city)) return 'Frattamaggiore';
  // Title case generico per le altre
  return city.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase());
}

function _golBeneficiario(c) {
  /* Estrae nome beneficiario: "APL_GOL_<Nome Cognome>_<Città>[_N]" → "Nome Cognome". */
  const t = c.titolo || '';
  if (!/GOL/i.test(t)) return '';
  const parts = t.split(/_/).map(s => s.trim()).filter(Boolean);
  if (parts.length < 3) return '';
  let cityIdx = parts.length - 1;
  if (/^\d+$/.test(parts[cityIdx])) cityIdx--;
  if (cityIdx <= 1) return '';
  return parts.slice(2, cityIdx).join(' ').trim();
}

function _golAnno(c) {
  const s = c.dataInizio || c.dataPianInizio || '';
  let m = String(s).match(/^(\d{4})-/);
  if (m) return m[1];
  m = String(s).match(/-(\d{4})$/);
  if (m) return m[1];
  return 'N/D';
}

function renderGol() {
  const el = document.getElementById('sec-gol');
  if (!el) return;
  const f = filtered;
  const gol = f.filter(_golIsGol);

  // Funnel counts
  const funnel = {}; GOL_FUNNEL.forEach(s => { funnel[s.id] = 0; });
  funnel['Indefinito'] = 0;
  gol.forEach(c => { funnel[_golFase(c)]++; });

  // Città
  const byCity = {};
  gol.forEach(c => {
    const k = _golCity(c);
    if (!byCity[k]) byCity[k] = { cnt: 0, ric: 0 };
    byCity[k].cnt++;
    byCity[k].ric += (c.consulenza || 0);
  });

  // Anno
  const byAnno = {};
  gol.forEach(c => {
    const k = _golAnno(c);
    if (!byAnno[k]) byAnno[k] = 0;
    byAnno[k]++;
  });

  const totale = f.length;
  const totGol = gol.length;
  const docs = funnel['Documenti'];
  const pag = funnel['Pagamento'];
  const concl = funnel['Concluso PAL'];
  const tirAtt = funnel['Tiroc. attivo'];
  const tirCon = funnel['Tiroc. concluso'];
  const indef = funnel['Indefinito'];

  // ── HTML ──
  let h = '<div class="sec"><h3 class="sec-title">GOL &amp; Politiche Attive · ' + sectorLabel() + '</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Il <b>94% di APL_PAL è GOL</b> (Garanzia Occupabilità Lavoratori, PNRR). ' +
       'Il funnel sotto aggrega le 23 fasi distinte di <code>statoLav</code> (PAL_1.x → 2.x → 3.x → 4.x → TIROCINI) in 6 step. ' +
       'Città e beneficiario sono estratti dal titolo "APL_GOL_&lt;Nome&gt;_&lt;Città&gt;".</p>';
  const pctGol = totale ? (totGol / totale * 100) : 0;
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px;padding:8px 12px;background:rgba(16,185,129,.1);border-left:3px solid #10b981;border-radius:4px">' +
       'Coperti: <b>' + fmt(totGol) + '</b> / ' + fmt(totale) + ' (' + pctGol.toFixed(1) + '%). ' +
       'Le commesse non-GOL (' + fmt(totale - totGol) + ': ORIENTAMENTO, ACCOMPAGNAMENTO, altro) restano nelle altre sezioni.</p>';

  h += '<div class="kpi-grid" style="padding:0 0 14px 0">';
  h += '<div class="kpi blue"><div class="kpi-label">Beneficiari GOL</div><div class="kpi-value">' + fmt(totGol) + '</div><div class="kpi-sub">filtro corrente</div></div>';
  h += '<div class="kpi cyan" style="cursor:pointer" onclick="_golDrill(\'Documenti\')"><div class="kpi-label">📂 In documenti</div><div class="kpi-value">' + fmt(docs) + '</div><div class="kpi-sub">fase 2.2.1 / 2.3</div></div>';
  h += '<div class="kpi pink" style="cursor:pointer" onclick="_golDrill(\'Pagamento\')"><div class="kpi-label">💸 Pagamento richiesto</div><div class="kpi-value">' + fmt(pag) + '</div><div class="kpi-sub">fase 2.2.3 / 2.2.4</div></div>';
  h += '<div class="kpi green" style="cursor:pointer" onclick="_golDrill(\'Concluso PAL\')"><div class="kpi-label">✅ PAL Concluso</div><div class="kpi-value">' + fmt(concl) + '</div><div class="kpi-sub">fase x.x.5</div></div>';
  h += '<div class="kpi orange" style="cursor:pointer" onclick="_golDrill(\'Tiroc. attivo\')"><div class="kpi-label">🏃 Tirocinio attivo</div><div class="kpi-value">' + fmt(tirAtt) + '</div><div class="kpi-sub">PAL_4.4.5</div></div>';
  h += '<div class="kpi" style="background:linear-gradient(135deg,#84cc1620,#84cc1640);cursor:pointer" onclick="_golDrill(\'Tiroc. concluso\')"><div class="kpi-label">🎓 Tirocinio concluso</div><div class="kpi-value">' + fmt(tirCon) + '</div><div class="kpi-sub">TIROCINI_*</div></div>';
  h += '</div>';

  // Funnel + Indefinito
  h += '<div class="row2">';
  h += '<div class="card"><h4>Funnel fasi (' + fmt(totGol - indef) + ' classificate / ' + fmt(indef) + ' indef.)</h4><div class="chart-wrap"><canvas id="chGolFunnel"></canvas></div></div>';
  h += '<div class="card"><h4>Anno di avvio commessa</h4><div class="chart-wrap"><canvas id="chGolAnno"></canvas></div></div>';
  h += '</div>';

  // Top città
  h += '<div class="card" style="margin-top:14px"><h4>Top città beneficiari (esclude N/D)</h4>';
  h += '<div class="tbl-scroll"><table id="tblGolCity"></table></div></div>';

  // Tabella beneficiari
  h += '<div class="card" style="margin-top:14px"><h4>Beneficiari (max 100) · clicca Qnet per aprire</h4>';
  h += '<div class="tbl-scroll"><table id="tblGolBenef"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  // ── Charts ──
  const order = GOL_FUNNEL.map(s => s.id);
  makeBar('chGolFunnel',
    order,
    order.map(k => funnel[k]),
    '#3b82f6',
    false);

  const anniOrder = Object.keys(byAnno).filter(k => k !== 'N/D').sort();
  makeBar('chGolAnno',
    anniOrder,
    anniOrder.map(k => byAnno[k]),
    '#10b981',
    false);

  // Top città
  const cityRows = Object.entries(byCity)
    .filter(([k]) => k !== 'N/D')
    .sort((a, b) => b[1].cnt - a[1].cnt || b[1].ric - a[1].ric)
    .slice(0, 15)
    .map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric }
    ]);
  buildTbl('tblGolCity',
    ['Città', 'Beneficiari', 'Ricavi'],
    cityRows,
    ['str', 'num', 'num']);

  // Tabella beneficiari
  const benefRows = gol.slice(0, 100).map(c => [
    { display: _golBeneficiario(c) || '—', val: _golBeneficiario(c) || '' },
    { display: _golCity(c), val: _golCity(c) },
    { display: _golFase(c), val: _golFase(c) },
    { display: (c.statoLav || '—').substring(0, 35), val: c.statoLav || '' },
    { display: c.status || '—', val: c.status || '' },
    { display: fmtE(c.consulenza || 0), val: c.consulenza || 0 },
    { display: qnetBtn(c), val: c.id }
  ]);
  buildTbl('tblGolBenef',
    ['Beneficiario', 'Città', 'Fase', 'StatoLav', 'Status', 'Ricavi', 'Qnet'],
    benefRows,
    ['str', 'str', 'str', 'str', 'str', 'num', 'str']);
}

function _golDrill(fase) {
  const list = filtered.filter(c => _golIsGol(c) && _golFase(c) === fase);
  if (typeof drillDownItems === 'function') drillDownItems('GOL · ' + fase + ' (' + list.length + ')', list);
}
