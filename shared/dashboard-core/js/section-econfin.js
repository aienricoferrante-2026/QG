/* ── Sezione Econ. & Finanziario · 3 viste affiancate ──
   Aggrega i dati di Qnet in 3 box paralleli:
     Consuntivo   (campi ec*Cons)    — stima a budget consuntivata
     Documentale  (*Docum)           — fatturato registrato
     Finanziario  (fin*Tot + cassa)  — incassi/uscite reali

   Sotto: chart scostamento Doc vs Cons per Società, chart cassa per Società,
   tabella unificata per Società con tutte e 3 le viste, tabella per Cliente. */

function _ecAggrega(items) {
  const a = {
    cons:  { r: 0, c: 0, m: 0 },
    doc:   { r: 0, c: 0, m: 0 },
    fin:   { in_: 0, out: 0, delta: 0 },
    cassa: { ricavi: 0, incassato: 0, daInc: 0 },
    avanzEc: { sum: 0, n: 0 }
  };
  items.forEach(c => {
    a.cons.r += (c.ecRicaviCons || 0);
    a.cons.c += (c.ecCostiCons || 0);
    a.cons.m += (c.ecMolCons || 0);
    a.doc.r  += (c.ricaviDocum || 0);
    a.doc.c  += (c.costiDocum || 0);
    a.doc.m  += (c.molDocum || 0);
    a.fin.in_   += (c.finIncassiTot || 0);
    a.fin.out   += (c.finUsciteTot || 0);
    a.fin.delta += (c.finDeltaTot || 0);
    a.cassa.ricavi    += (c.consulenza || 0);
    a.cassa.incassato += (c.giaIncassato || 0);
    a.cassa.daInc     += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
    if (typeof c.pctAvanzEc === 'number') { a.avanzEc.sum += c.pctAvanzEc; a.avanzEc.n++; }
  });
  return a;
}

function _ecBoxHtml(title, color, icon, rows, footer) {
  let h = '<div class="card econ-box" style="border-top:3px solid ' + color + '">';
  h += '<h4 style="color:' + color + ';margin:0 0 10px 0;font-size:13px;display:flex;align-items:center;gap:6px">' +
       '<span style="font-size:16px">' + icon + '</span>' + title + '</h4>';
  h += '<div class="econ-rows">';
  rows.forEach(r => {
    h += '<div class="econ-row"><span class="econ-label">' + r.label + '</span>' +
         '<strong class="econ-val">' + r.val + '</strong>' +
         (r.sub ? '<span class="econ-sub">' + r.sub + '</span>' : '') + '</div>';
  });
  h += '</div>';
  if (footer) h += '<div class="econ-foot">' + footer + '</div>';
  h += '</div>';
  return h;
}

function renderEconFin() {
  const el = document.getElementById('sec-econFin');
  if (!el) return;
  const f = filtered;
  const A = _ecAggrega(f);

  const ricTot = A.cassa.ricavi;
  const consMargin = A.cons.r ? (A.cons.m / A.cons.r * 100) : 0;
  const docMargin  = A.doc.r  ? (A.doc.m  / A.doc.r  * 100) : 0;
  const incPct     = ricTot ? (A.cassa.incassato / ricTot * 100) : 0;
  const avzEc = A.avanzEc.n ? (A.avanzEc.sum / A.avanzEc.n) : 0;
  /* Scostamenti chiave Documentale - Consuntivo (gap fatturato vs consuntivato) */
  const dR = A.doc.r - A.cons.r;
  const dC = A.doc.c - A.cons.c;
  const dM = A.doc.m - A.cons.m;
  const sign = v => (v >= 0 ? '+' : '') + fmtK(v);

  let h = '<div class="sec"><h3 class="sec-title">Economico & Finanziario · Budget Commessa Qnet</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">' +
       'Tre viste affiancate sui dati Qnet: <strong>Consuntivo</strong> (stima ec*Cons), ' +
       '<strong>Documentale</strong> (fatturato), <strong>Finanziario</strong> (cassa reale). ' +
       'Sotto trovi gli scostamenti per capire dove la realtà diverge dal budget.</p>';

  const ii = (typeof kpiInfoBtn === 'function') ? kpiInfoBtn : (() => '');
  /* 3 BOX AFFIANCATI */
  h += '<div class="row3 econ-boxes">';
  h += _ecBoxHtml('CONSUNTIVO', '#6366f1', '📐', [
    { label: 'Ricavi ' + ii('ricavi'),       val: fmtK(A.cons.r), sub: 'ec.RicaviCons' },
    { label: 'Costi ' + ii('costi'),         val: fmtK(A.cons.c), sub: 'ec.CostiCons' },
    { label: 'MOL ' + ii('mol'),             val: fmtK(A.cons.m), sub: consMargin.toFixed(1) + '% margine' },
    { label: 'Avanz. medio',                 val: avzEc.toFixed(1) + '%', sub: 'media ' + A.avanzEc.n + ' commesse' }
  ], 'Budget consuntivato a Qnet · stima');

  h += _ecBoxHtml('DOCUMENTALE', '#8b5cf6', '📄', [
    { label: 'Ricavi ' + ii('ricavi'),       val: fmtK(A.doc.r), sub: pct(A.doc.r, A.cons.r) + ' del cons.' },
    { label: 'Costi ' + ii('costi'),         val: fmtK(A.doc.c), sub: pct(A.doc.c, A.cons.c) + ' del cons.' },
    { label: 'MOL ' + ii('mol'),             val: fmtK(A.doc.m), sub: docMargin.toFixed(1) + '% margine' },
    { label: 'Δ vs Cons.',                   val: sign(dM),     sub: 'gap MOL fatt-cons' }
  ], 'Fatture emesse · registrato in contabilità');

  h += _ecBoxHtml('FINANZIARIO (Cassa)', '#10b981', '💸', [
    { label: 'Incassi tot. ' + ii('incassato'), val: fmtK(A.fin.in_), sub: pct(A.cassa.incassato, ricTot) + ' dei ricavi' },
    { label: 'Uscite tot.',                  val: fmtK(A.fin.out), sub: 'cassa uscite' },
    { label: 'Delta cassa',                  val: sign(A.fin.delta), sub: A.fin.delta >= 0 ? 'positivo' : 'negativo' },
    { label: 'Già Incassato ' + ii('incassato'), val: fmtK(A.cassa.incassato), sub: incPct.toFixed(1) + '% dei ricavi' }
  ], 'Movimenti reali di cassa · Qnet');
  h += '</div>';

  /* SCOSTAMENTI CHIAVE — riga compatta che evidenzia i gap */
  h += '<div class="card" style="margin-top:14px;padding:12px 16px">';
  h += '<h4 style="margin:0 0 8px 0;font-size:12px;color:var(--text2);text-transform:uppercase;letter-spacing:.5px">' +
       '🎯 Scostamenti chiave Documentale − Consuntivo</h4>';
  h += '<div style="display:flex;gap:24px;flex-wrap:wrap;font-size:13px">';
  ['Ricavi:' + sign(dR), 'Costi:' + sign(dC), 'MOL:' + sign(dM)].forEach((s, i) => {
    const v = [dR, dC, dM][i];
    const col = i === 1 ? (v <= 0 ? '#10b981' : '#ef4444') : (v >= 0 ? '#10b981' : '#ef4444');
    const label = s.split(':')[0];
    const val = s.split(':')[1];
    h += '<div><span style="color:var(--text2)">' + label + '</span> ' +
         '<strong style="color:' + col + ';font-size:15px;margin-left:4px">' + val + '</strong></div>';
  });
  h += '</div></div>';

  /* CHART comparativi */
  h += '<div class="row2" style="margin-top:14px">';
  h += '<div class="card"><h4>Confronto Ricavi: Cons. vs Documentale vs Cassa · Top 10 Società</h4>' +
       '<div class="chart-wrap"><canvas id="chEconCompara"></canvas></div></div>';
  h += '<div class="card"><h4>Incassato vs Da Incassare · Top 10 Società per credito aperto</h4>' +
       '<div class="chart-wrap"><canvas id="chFinSoc"></canvas></div></div>';
  h += '</div>';

  /* TABELLA unificata per Società con le 3 viste affiancate */
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo per Società · Cons · Documentale · Cassa</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Clicca una riga per il drill-down sulle commesse della società.</p>';
  h += '<div class="tbl-scroll"><table id="tblEconFin"></table></div></div>';

  /* TABELLA Clienti (compatta) */
  h += '<div class="card" style="margin-top:14px"><h4>Riepilogo Clienti · ricavi, MOL, incasso, credito aperto</h4>';
  h += '<div class="tbl-scroll"><table id="tblEconCli"></table></div></div>';

  h += '</div>';
  el.innerHTML = h;

  /* Aggregati per Società */
  const socG = {};
  f.forEach(c => {
    const k = c.societa || 'N/D';
    if (!socG[k]) socG[k] = { cnt: 0, consR: 0, consC: 0, consM: 0, docR: 0, docC: 0, docM: 0, ric: 0, inc: 0, dInc: 0 };
    const g = socG[k];
    g.cnt++;
    g.consR += (c.ecRicaviCons || 0);
    g.consC += (c.ecCostiCons || 0);
    g.consM += (c.ecMolCons || 0);
    g.docR  += (c.ricaviDocum || 0);
    g.docC  += (c.costiDocum || 0);
    g.docM  += (c.molDocum || 0);
    g.ric   += (c.consulenza || 0);
    g.inc   += (c.giaIncassato || 0);
    g.dInc  += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
  });
  const socSorted = Object.entries(socG).sort((a, b) => b[1].ric - a[1].ric);
  const top10 = socSorted.slice(0, 10);
  const lbl = s => s.length > 20 ? s.substring(0, 18) + '..' : s;

  makeBarStacked('chEconCompara',
    top10.map(e => lbl(e[0])),
    [
      { label: 'Consuntivo',   data: top10.map(e => e[1].consR), backgroundColor: '#6366f1cc', borderRadius: 4 },
      { label: 'Documentale',  data: top10.map(e => e[1].docR),  backgroundColor: '#8b5cf6cc', borderRadius: 4 },
      { label: 'Cassa (inc.)', data: top10.map(e => e[1].inc),   backgroundColor: '#10b981cc', borderRadius: 4 }
    ]
  );
  /* Sblocca lo stacking sul confronto: vogliamo 3 barre affiancate, non sovrapposte. */
  if (_charts['chEconCompara'] && _charts['chEconCompara'].options) {
    _charts['chEconCompara'].options.scales.x.stacked = false;
    _charts['chEconCompara'].options.scales.y.stacked = false;
    _charts['chEconCompara'].update();
  }

  const byCredito = [...socSorted].sort((a, b) => b[1].dInc - a[1].dInc).slice(0, 10);
  makeBarStacked('chFinSoc',
    byCredito.map(e => lbl(e[0])),
    [
      { label: 'Incassato',    data: byCredito.map(e => e[1].inc),  backgroundColor: '#10b981cc', borderRadius: 4 },
      { label: 'Da Incassare', data: byCredito.map(e => e[1].dInc), backgroundColor: '#f59e0bcc', borderRadius: 4 }
    ]
  );

  /* Tabella unificata Società */
  buildTbl('tblEconFin',
    ['Società', 'Comm.',
      'Cons. Ric.', 'Cons. MOL',
      'Doc. Ric.', 'Doc. MOL',
      'Cassa Inc.', 'Da Inc.', '% Inc.'],
    socSorted.map(([k, v]) => [
      { display: k.length > 35 ? k.substring(0, 33) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.consR), val: v.consR },
      { display: fmtE(v.consM), val: v.consM },
      { display: fmtE(v.docR),  val: v.docR },
      { display: fmtE(v.docM),  val: v.docM },
      { display: fmtE(v.inc),   val: v.inc },
      { display: fmtE(v.dInc),  val: v.dInc },
      { display: v.ric ? (v.inc / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.inc / v.ric * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'societa' }
  );

  /* Tabella Clienti */
  const cliG = {};
  f.forEach(c => {
    const k = c.cliente || 'N/D';
    if (!cliG[k]) cliG[k] = { cnt: 0, ric: 0, mol: 0, inc: 0, dInc: 0 };
    cliG[k].cnt++;
    cliG[k].ric  += (c.consulenza || 0);
    cliG[k].mol  += (c.mol || 0);
    cliG[k].inc  += (c.giaIncassato || 0);
    cliG[k].dInc += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
  });
  const cliSorted = Object.entries(cliG).sort((a, b) => b[1].ric - a[1].ric);
  buildTbl('tblEconCli',
    ['Cliente', 'Comm.', 'Ricavi', 'MOL', 'Margine %', 'Incassato', 'Da Incassare', '% Inc.'],
    cliSorted.map(([k, v]) => [
      { display: k.length > 45 ? k.substring(0, 43) + '..' : k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmtE(v.ric), val: v.ric },
      { display: fmtE(v.mol), val: v.mol },
      { display: v.ric ? (v.mol / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.mol / v.ric * 100 : 0 },
      { display: fmtE(v.inc), val: v.inc },
      { display: fmtE(v.dInc), val: v.dInc },
      { display: v.ric ? (v.inc / v.ric * 100).toFixed(1) + '%' : '-', val: v.ric ? v.inc / v.ric * 100 : 0 }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}
