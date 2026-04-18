/* ── Sezione Specifica Economica: tree a 4 livelli espandibile ── */
/* Livelli: Società → Regione (Cliente/Ente) → Fase (Status) → Corso */

function _aggStats(arr) {
  const tot = arr.reduce((s, c) => s + (c.consulenza || 0), 0);
  const costi = arr.reduce((s, c) => s + (c.costi || 0), 0);
  const mol = arr.reduce((s, c) => s + (c.mol || 0), 0);
  const inc = arr.reduce((s, c) => s + (c.giaIncassato || 0), 0);
  const daInc = arr.reduce((s, c) => s + (c.daIncassare || 0), 0);
  // % Avanzamento media pesata per consulenza
  let avanzW = 0, pesoW = 0;
  arr.forEach(c => {
    const peso = c.consulenza || 0;
    if (peso > 0) { avanzW += peso * (c.avanzamento || 0); pesoW += peso; }
  });
  const avanzMedio = pesoW > 0 ? (avanzW / pesoW) : 0;
  // Valore residuo = somma(consulenza * (1 - avanzamento/100))
  const residuo = arr.reduce((s, c) => s + (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100), 0);
  return { cnt: arr.length, tot, costi, mol, inc, daInc, avanzMedio, residuo };
}

function renderSpecEcon() {
  const el = document.getElementById('sec-specEcon');
  const f = filtered;

  // Struttura gerarchica: soc → regione (cliente) → fase (status) → corso
  const tree = {};
  f.forEach(c => {
    const soc = c.societa || 'N/D';
    const reg = (c.cliente || 'N/D').replace(/_FOR/g, '').trim() || 'N/D';
    const fase = c.status || 'N/D';
    if (!tree[soc]) tree[soc] = { items: [], regioni: {} };
    tree[soc].items.push(c);
    if (!tree[soc].regioni[reg]) tree[soc].regioni[reg] = { items: [], fasi: {} };
    tree[soc].regioni[reg].items.push(c);
    if (!tree[soc].regioni[reg].fasi[fase]) tree[soc].regioni[reg].fasi[fase] = { items: [] };
    tree[soc].regioni[reg].fasi[fase].items.push(c);
  });

  const socKeys = Object.keys(tree).sort((a, b) => {
    return _aggStats(tree[b].items).tot - _aggStats(tree[a].items).tot;
  });

  // Stats globali
  const totStats = _aggStats(f);
  const fmtD = d => d ? d : '-';

  let h = '<div class="sec"><h3 class="sec-title">Specifica Economica &mdash; Aggregazione Multi-Livello</h3>';
  h += '<p style="color:var(--text3);font-size:11px;margin-bottom:14px">Gerarchia: Società &rarr; Regione/Ente &rarr; Fase &rarr; Corso. Clicca &#9654; per espandere. Per gli aggregati vedi <b>% Avanzamento</b> e <b>Valore Residuo</b>; per il singolo corso vedi Data Inizio/Fine, Durata e SAL Medio.</p>';

  // Card riepilogo globale
  h += '<div class="row3" style="margin-bottom:14px">';
  h += '<div class="card"><h4>Totale Ricavi</h4><div style="font-size:26px;font-weight:700">' + fmtK(totStats.tot) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">' + fmt(f.length) + ' commesse, ' + socKeys.length + ' società</div></div>';
  h += '<div class="card"><h4>% Avanzamento Medio</h4><div style="font-size:26px;font-weight:700;color:var(--cyan)">' + totStats.avanzMedio.toFixed(1) + '%</div><div style="color:var(--text2);font-size:11px;margin-top:4px">media pesata sui ricavi</div></div>';
  h += '<div class="card"><h4>Valore Residuo</h4><div style="font-size:26px;font-weight:700;color:var(--orange)">' + fmtK(totStats.residuo) + '</div><div style="color:var(--text2);font-size:11px;margin-top:4px">da completare (1 - avanz.)</div></div>';
  h += '</div>';

  // Tabella tree
  h += '<div class="card"><div class="tbl-scroll"><table id="tblSpec"><thead><tr>';
  h += '<th style="width:30px"></th>';
  h += '<th>Dimensione</th>';
  h += '<th class="text-right">N.</th>';
  h += '<th class="text-right">Ricavi</th>';
  h += '<th class="text-right">Costi</th>';
  h += '<th class="text-right">MOL</th>';
  h += '<th class="text-right">% Avanz.</th>';
  h += '<th class="text-right">Valore Residuo</th>';
  h += '<th class="text-right">Incassato</th>';
  h += '<th class="text-right">Da Incassare</th>';
  h += '<th>Data Inizio</th>';
  h += '<th>Data Fine</th>';
  h += '<th class="text-right">Durata (m)</th>';
  h += '<th class="text-right">SAL Medio</th>';
  h += '</tr></thead><tbody>';

  socKeys.forEach((sk, gi) => {
    const gid = 'spec_g' + gi;
    const socData = tree[sk];
    const socStats = _aggStats(socData.items);

    // L0: Società (aggregata)
    h += '<tr class="tree-row tree-l0" onclick="toggleTree(\'' + gid + '\')">';
    h += '<td class="tree-toggle" id="tog_' + gid + '">&#9654;</td>';
    h += '<td><strong>' + (sk.length > 40 ? sk.substring(0, 38) + '..' : sk) + '</strong> <span style="color:var(--text3);font-size:10px">(' + socStats.cnt + ')</span></td>';
    h += '<td class="text-right">' + fmt(socStats.cnt) + '</td>';
    h += '<td class="text-right"><strong>' + fmtE(socStats.tot) + '</strong></td>';
    h += '<td class="text-right">' + fmtE(socStats.costi) + '</td>';
    h += '<td class="text-right">' + fmtE(socStats.mol) + '</td>';
    h += '<td class="text-right" style="color:var(--cyan);font-weight:600">' + socStats.avanzMedio.toFixed(1) + '%</td>';
    h += '<td class="text-right" style="color:var(--orange);font-weight:600">' + fmtE(socStats.residuo) + '</td>';
    h += '<td class="text-right">' + fmtE(socStats.inc) + '</td>';
    h += '<td class="text-right">' + fmtE(socStats.daInc) + '</td>';
    h += '<td colspan="4" style="color:var(--text3);font-size:10px;font-style:italic">— aggregato —</td>';
    h += '</tr>';

    // L1: Regioni (dentro società)
    const regKeys = Object.keys(socData.regioni).sort((a, b) => {
      return _aggStats(socData.regioni[b].items).tot - _aggStats(socData.regioni[a].items).tot;
    });

    regKeys.forEach((rk, ri) => {
      const rid = gid + '_r' + ri;
      const regData = socData.regioni[rk];
      const regStats = _aggStats(regData.items);

      h += '<tr class="tree-row tree-l1 tree-child-' + gid + '" style="display:none" onclick="toggleTree(\'' + rid + '\')">';
      h += '<td class="tree-toggle" id="tog_' + rid + '">&#9654;</td>';
      h += '<td style="padding-left:24px"><span style="color:var(--accent);font-size:10px;margin-right:4px">▸ Regione:</span>' + (rk.length > 35 ? rk.substring(0, 33) + '..' : rk) + ' <span style="color:var(--text3);font-size:10px">(' + regStats.cnt + ')</span></td>';
      h += '<td class="text-right">' + fmt(regStats.cnt) + '</td>';
      h += '<td class="text-right">' + fmtE(regStats.tot) + '</td>';
      h += '<td class="text-right">' + fmtE(regStats.costi) + '</td>';
      h += '<td class="text-right">' + fmtE(regStats.mol) + '</td>';
      h += '<td class="text-right" style="color:var(--cyan)">' + regStats.avanzMedio.toFixed(1) + '%</td>';
      h += '<td class="text-right" style="color:var(--orange)">' + fmtE(regStats.residuo) + '</td>';
      h += '<td class="text-right">' + fmtE(regStats.inc) + '</td>';
      h += '<td class="text-right">' + fmtE(regStats.daInc) + '</td>';
      h += '<td colspan="4" style="color:var(--text3);font-size:10px;font-style:italic">— aggregato —</td>';
      h += '</tr>';

      // L2: Fasi (dentro regione)
      const faseKeys = Object.keys(regData.fasi).sort((a, b) => {
        return _aggStats(regData.fasi[b].items).tot - _aggStats(regData.fasi[a].items).tot;
      });

      faseKeys.forEach((fk, fi) => {
        const fid = rid + '_f' + fi;
        const faseData = regData.fasi[fk];
        const faseStats = _aggStats(faseData.items);

        h += '<tr class="tree-row tree-l2 tree-child-' + rid + '" style="display:none" onclick="toggleTree(\'' + fid + '\')">';
        h += '<td class="tree-toggle" id="tog_' + fid + '">&#9654;</td>';
        h += '<td style="padding-left:48px"><span style="color:var(--green);font-size:10px;margin-right:4px">▹ Fase:</span>' + tagStatus(fk) + ' <span style="color:var(--text3);font-size:10px">(' + faseStats.cnt + ')</span></td>';
        h += '<td class="text-right">' + fmt(faseStats.cnt) + '</td>';
        h += '<td class="text-right">' + fmtE(faseStats.tot) + '</td>';
        h += '<td class="text-right">' + fmtE(faseStats.costi) + '</td>';
        h += '<td class="text-right">' + fmtE(faseStats.mol) + '</td>';
        h += '<td class="text-right" style="color:var(--cyan)">' + faseStats.avanzMedio.toFixed(1) + '%</td>';
        h += '<td class="text-right" style="color:var(--orange)">' + fmtE(faseStats.residuo) + '</td>';
        h += '<td class="text-right">' + fmtE(faseStats.inc) + '</td>';
        h += '<td class="text-right">' + fmtE(faseStats.daInc) + '</td>';
        h += '<td colspan="4" style="color:var(--text3);font-size:10px;font-style:italic">— aggregato —</td>';
        h += '</tr>';

        // L3: Corsi (dettaglio singolo)
        faseData.items.forEach(c => {
          const d = _durataCorso(c.dataInizio, c.dataFine);
          const salM = d.mesi > 0 ? (c.consulenza / d.mesi) : (c.consulenza || 0);
          const resid = (c.consulenza || 0) * (1 - (c.avanzamento || 0) / 100);
          const nomeCorso = (c.corso || c.titolo || 'N/D');
          h += '<tr class="tree-row tree-l3 tree-child-' + fid + '" style="display:none;font-size:11px">';
          h += '<td></td>';
          h += '<td style="padding-left:72px;font-size:10px;color:var(--text2)"><strong>#' + c.id + '</strong> ' + (nomeCorso.length > 50 ? nomeCorso.substring(0, 48) + '..' : nomeCorso) + '</td>';
          h += '<td class="text-right">1</td>';
          h += '<td class="text-right">' + fmtE(c.consulenza || 0) + '</td>';
          h += '<td class="text-right">' + fmtE(c.costi || 0) + '</td>';
          h += '<td class="text-right">' + fmtE(c.mol || 0) + '</td>';
          h += '<td class="text-right" style="color:var(--cyan)">' + (c.avanzamento || 0) + '%</td>';
          h += '<td class="text-right" style="color:var(--orange)">' + fmtE(resid) + '</td>';
          h += '<td class="text-right">' + fmtE(c.giaIncassato || 0) + '</td>';
          h += '<td class="text-right">' + fmtE(c.daIncassare || 0) + '</td>';
          h += '<td>' + fmtD(c.dataInizio) + '</td>';
          h += '<td>' + fmtD(c.dataFine) + '</td>';
          h += '<td class="text-right">' + d.mesi + '</td>';
          h += '<td class="text-right">' + fmtE(salM) + '</td>';
          h += '</tr>';
        });
      });
    });
  });

  h += '</tbody></table></div></div>';

  // Pulsante esporta
  h += '<div style="margin-top:14px;text-align:center">';
  h += '<button class="filter-reset" style="background:rgba(16,185,129,.12);border-color:#10b981;color:#10b981;padding:10px 24px;font-size:13px" onclick="exportExcelCessione()">&#8681; Esporta Excel completo (con tutti gli aggregati)</button>';
  h += '</div>';

  h += '</div>';
  el.innerHTML = h;
}
