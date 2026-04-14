/* ── Sezioni: Corsi, Responsabili, Clienti ── */

function renderCorsi() {
  const el = document.getElementById('sec-corsi');
  const f = filtered;

  // Group by corso
  const g = {};
  f.forEach(c => {
    const k = c.corso || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, ore: 0, conclusi: 0, inCorso: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].ore += c.ore;
    if (c.statoCorso === 'Concluso') g[k].conclusi++;
    if (c.statoCorso === 'In corso') g[k].inCorso++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Analisi Corsi</h3>';

  // Chart top 15
  h += '<div class="row2">';
  h += '<div class="card"><h4>Top 15 Corsi (per numero commesse)</h4><div class="chart-wrap"><canvas id="chCorsiTop"></canvas></div></div>';
  h += '<div class="card"><h4>Top 15 Corsi (per Ricavi)</h4><div class="chart-wrap"><canvas id="chCorsiRic"></canvas></div></div>';
  h += '</div>';

  h += '<div class="card"><h4>Tutti i Corsi (' + sorted.length + ')</h4>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:8px">Clicca &#9654; per espandere e vedere le commesse divise per Stato Corso, poi il dettaglio singolo.</p>';
  h += '<div class="tbl-scroll"><table id="tblCorsi"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  // Charts
  const top15 = sorted.slice(0, 15);
  makeBar('chCorsiTop',
    top15.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    top15.map(e => e[1].cnt), '#3b82f6', true);

  const byRic = [...sorted].sort((a, b) => b[1].cons - a[1].cons).slice(0, 15);
  makeBar('chCorsiRic',
    byRic.map(e => e[0].length > 30 ? e[0].substring(0, 28) + '..' : e[0]),
    byRic.map(e => e[1].cons), '#10b981', true);

  // Tree table: Corso → Stato Corso → commesse
  buildTreeTbl('tblCorsi', f, {
    primaryField: 'corso',
    primaryLabel: 'Corso',
    subGroupField: 'statoCorso',
    subGroupLabel: 'Stato Corso',
    valueFn: (items) => [
      { label: 'Comm.', val: fmt(items.length) },
      { label: 'Ricavi', val: fmtE(items.reduce((s, c) => s + c.consulenza, 0)) },
      { label: 'Costi', val: fmtE(items.reduce((s, c) => s + c.costi, 0)) },
      { label: 'Ore', val: fmt(items.reduce((s, c) => s + c.ore, 0)) }
    ],
    subValueFn: (items) => [
      { label: 'Comm.', val: fmt(items.length) },
      { label: 'Ricavi', val: fmtE(items.reduce((s, c) => s + c.consulenza, 0)) },
      { label: 'Costi', val: fmtE(items.reduce((s, c) => s + c.costi, 0)) },
      { label: 'Ore', val: fmt(items.reduce((s, c) => s + c.ore, 0)) }
    ],
    itemColumns: [
      { hdr: 'ID', fn: c => '<strong>#' + c.id + '</strong>' },
      { hdr: 'Cliente', fn: c => c.cliente.replace(/_FOR/g, '') },
      { hdr: 'Responsabile', fn: c => c.responsabile || '-' }
    ],
    leafValueFn: (c) => [fmtE(c.consulenza), fmtE(c.costi), fmt(c.ore)]
  });
}

/* ── Responsabili ── */
function renderResponsabili() {
  const el = document.getElementById('sec-responsabili');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.responsabile || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, ore: 0, conclusi: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].costi += c.costi;
    g[k].mol += c.mol;
    g[k].ore += c.ore;
    if (c.statoCorso === 'Concluso') g[k].conclusi++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cnt - a[1].cnt);

  let h = '<div class="sec"><h3 class="sec-title">Carico Responsabili</h3>';
  h += '<div class="card"><h4>Top 15 Responsabili (per commesse)</h4><div class="chart-wrap"><canvas id="chResp"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblResp"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  const top15 = sorted.slice(0, 15);
  makeBar('chResp', top15.map(e => e[0]), top15.map(e => e[1].cnt), '#8b5cf6', true);

  buildTbl('tblResp',
    ['Responsabile', 'Comm.', 'Conclusi', 'Ricavi', 'Costi', 'MOL', 'Ore'],
    sorted.map(([k, v]) => [
      { display: k, val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.conclusi), val: v.conclusi },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.costi), val: v.costi },
      { display: fmtE(v.mol), val: v.mol },
      { display: fmt(v.ore), val: v.ore }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'responsabile' }
  );
}

/* ── Clienti / Enti Finanziatori ── */
function renderClienti() {
  const el = document.getElementById('sec-clienti');
  const f = filtered;

  const g = {};
  f.forEach(c => {
    const k = c.cliente || 'N/D';
    if (!g[k]) g[k] = { cnt: 0, cons: 0, costi: 0, mol: 0, ore: 0, conclusi: 0, incassato: 0, daIncassare: 0 };
    g[k].cnt++;
    g[k].cons += c.consulenza;
    g[k].costi += c.costi;
    g[k].mol += c.mol;
    g[k].ore += c.ore;
    g[k].incassato += c.giaIncassato;
    g[k].daIncassare += c.daIncassare;
    if (c.statoCorso === 'Concluso') g[k].conclusi++;
  });
  const sorted = Object.entries(g).sort((a, b) => b[1].cons - a[1].cons);

  let h = '<div class="sec"><h3 class="sec-title">Clienti / Enti Finanziatori</h3>';
  h += '<div class="card"><h4>Ricavi per Cliente</h4><div class="chart-wrap"><canvas id="chClienti"></canvas></div></div>';
  h += '<div class="card" style="margin-top:14px"><div class="tbl-scroll"><table id="tblClienti"></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  makeBar('chClienti',
    sorted.map(e => e[0].replace(/_FOR|_/g, ' ').trim()),
    sorted.map(e => e[1].cons), '#06b6d4', true);

  buildTbl('tblClienti',
    ['Cliente', 'Comm.', 'Conclusi', 'Ricavi', 'Costi', 'MOL', 'Incassato'],
    sorted.map(([k, v]) => [
      { display: k.replace(/_FOR/g, ''), val: k },
      { display: fmt(v.cnt), val: v.cnt },
      { display: fmt(v.conclusi), val: v.conclusi },
      { display: fmtE(v.cons), val: v.cons },
      { display: fmtE(v.costi), val: v.costi },
      { display: fmtE(v.mol), val: v.mol },
      { display: fmtE(v.incassato), val: v.incassato }
    ]),
    ['str', 'num', 'num', 'num', 'num', 'num', 'num'],
    { clickField: 'cliente' }
  );
}

/* ── Analisi Cliente: Cliente → Società → Sede Operativa ── */
function renderAnalisiCliente() {
  const el = document.getElementById('sec-analisiCliente');
  const f = filtered;

  // 3-level grouping: cliente → societa → sedeOp
  const cliG = {};
  f.forEach(c => {
    const cli = c.cliente || 'N/D';
    const soc = c.societa || 'N/D';
    const sede = c.sedeOp || 'N/D';
    if (!cliG[cli]) cliG[cli] = {};
    if (!cliG[cli][soc]) cliG[cli][soc] = {};
    if (!cliG[cli][soc][sede]) cliG[cli][soc][sede] = [];
    cliG[cli][soc][sede].push(c);
  });

  function agg(items) {
    return {
      cnt: items.length,
      cons: items.reduce((s, c) => s + c.consulenza, 0),
      costi: items.reduce((s, c) => s + c.costi, 0),
      mol: items.reduce((s, c) => s + c.mol, 0),
      ore: items.reduce((s, c) => s + c.ore, 0)
    };
  }

  function valCells(a) {
    return '<td class="text-right">' + fmt(a.cnt) + '</td>' +
      '<td class="text-right">' + fmtE(a.cons) + '</td>' +
      '<td class="text-right">' + fmtE(a.costi) + '</td>' +
      '<td class="text-right">' + fmtE(a.mol) + '</td>' +
      '<td class="text-right">' + fmt(a.ore) + '</td>';
  }

  // Sort clients by count desc
  const cliItems = {};
  Object.keys(cliG).forEach(cli => {
    const items = [];
    Object.values(cliG[cli]).forEach(socMap => Object.values(socMap).forEach(arr => items.push(...arr)));
    cliItems[cli] = items;
  });
  const cliSorted = Object.keys(cliG).sort((a, b) => cliItems[b].length - cliItems[a].length);

  let h = '<div class="sec"><h3 class="sec-title">Analisi Cliente &rarr; Societa &rarr; Sede Operativa</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Clicca &#9654; per espandere: Cliente &rarr; Societa &rarr; Sede Operativa. Clicca su una sede per il dettaglio commesse.</p>';

  // Chart top 15
  h += '<div class="card"><h4>Top 15 Clienti (per commesse)</h4><div class="chart-wrap"><canvas id="chAcTop"></canvas></div></div>';

  // Tree table
  h += '<div class="card" style="margin-top:14px"><h4>Tutti i Clienti (' + cliSorted.length + ')</h4>';
  h += '<div class="tbl-scroll"><table id="tblAcTree"><thead><tr>';
  h += '<th style="width:30px"></th><th>Nome</th><th class="text-right">Comm.</th><th class="text-right">Ricavi</th><th class="text-right">Costi</th><th class="text-right">MOL</th><th class="text-right">Ore</th>';
  h += '</tr></thead><tbody>';

  cliSorted.forEach((cli, gi) => {
    const gid = 'ac_g' + gi;
    const cliAgg = agg(cliItems[cli]);
    const cliDisplay = cli.replace(/_FOR/g, '');

    // Level 0: Cliente
    h += '<tr class="tree-row tree-l0" onclick="toggleTree(\'' + gid + '\')">';
    h += '<td class="tree-toggle" id="tog_' + gid + '">&#9654;</td>';
    h += '<td><strong>' + (cliDisplay.length > 50 ? cliDisplay.substring(0, 48) + '..' : cliDisplay) + '</strong> <span style="color:var(--text3);font-size:10px">(' + cliAgg.cnt + ')</span></td>';
    h += valCells(cliAgg);
    h += '</tr>';

    // Level 1: Società
    const socKeys = Object.keys(cliG[cli]).sort((a, b) => {
      const aItems = []; Object.values(cliG[cli][a]).forEach(arr => aItems.push(...arr));
      const bItems = []; Object.values(cliG[cli][b]).forEach(arr => bItems.push(...arr));
      return bItems.length - aItems.length;
    });

    socKeys.forEach((soc, si) => {
      const sid = gid + '_s' + si;
      const socItems = [];
      Object.values(cliG[cli][soc]).forEach(arr => socItems.push(...arr));
      const socAgg = agg(socItems);

      h += '<tr class="tree-row tree-l1 tree-child-' + gid + '" style="display:none" onclick="toggleTree(\'' + sid + '\')">';
      h += '<td class="tree-toggle" id="tog_' + sid + '">&#9654;</td>';
      h += '<td style="padding-left:24px">' + (soc.length > 45 ? soc.substring(0, 43) + '..' : soc) + ' <span style="color:var(--text3);font-size:10px">(' + socAgg.cnt + ')</span></td>';
      h += valCells(socAgg);
      h += '</tr>';

      // Level 2: Sede Operativa
      const sedeKeys = Object.keys(cliG[cli][soc]).sort((a, b) => cliG[cli][soc][b].length - cliG[cli][soc][a].length);

      sedeKeys.forEach((sede, sdi) => {
        const sedeItems = cliG[cli][soc][sede];
        const sedeAgg = agg(sedeItems);
        const escaped = sede.replace(/'/g, "\\'");

        h += '<tr class="tree-row tree-l2 tree-child-' + sid + '" style="display:none; cursor:pointer" onclick="event.stopPropagation();drillDownItems(\'' + escaped + '\', filtered.filter(c=>(c.cliente||\'N/D\')===\'' + cli.replace(/'/g, "\\'") + '\'&&(c.societa||\'N/D\')===\'' + soc.replace(/'/g, "\\'") + '\'&&(c.sedeOp||\'N/D\')===\'' + sede.replace(/'/g, "\\'") + '\'))">';
        h += '<td></td>';
        h += '<td style="padding-left:48px;font-size:11px">' + (sede.length > 45 ? sede.substring(0, 43) + '..' : sede) + ' <span style="color:var(--text3);font-size:10px">(' + sedeAgg.cnt + ')</span></td>';
        h += valCells(sedeAgg);
        h += '</tr>';
      });
    });
  });

  h += '</tbody></table></div></div>';
  h += '</div>';
  el.innerHTML = h;

  // Chart
  const top15 = cliSorted.slice(0, 15);
  makeBar('chAcTop',
    top15.map(k => { const d = k.replace(/_FOR/g, ''); return d.length > 30 ? d.substring(0, 28) + '..' : d; }),
    top15.map(k => cliItems[k].length), '#06b6d4', true);
}
