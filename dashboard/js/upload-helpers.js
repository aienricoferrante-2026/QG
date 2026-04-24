/* Helper functions for ISO upload aggregate computation */

function _groupCount(arr, key) {
  const m = {};
  arr.forEach(c => { const v = c[key] || ''; if (v) m[v] = (m[v] || 0) + 1; });
  return m;
}

function _buildTrend(records) {
  const byY = {};
  records.forEach(c => {
    if (!c.an || c.an <= 0) return;
    if (!byY[c.an]) byY[c.an] = { commesse: 0, cli: new Set(), cons: 0, ente: 0, es: 0, an: 0 };
    const y = byY[c.an];
    y.commesse++; y.cli.add(c.cl); y.cons += c.co; y.ente += c.en;
    if (c.st === 'Eseguito') y.es++;
    if (c.st === 'Annullato') y.an++;
  });
  return Object.keys(byY).sort().map(anno => {
    const y = byY[anno]; const tot = y.cons + y.ente;
    return {
      anno: +anno, commesse: y.commesse, clienti: y.cli.size,
      cons: y.cons, ente: y.ente, totale: tot,
      eseguiti: y.es, annullati: y.an,
      tasso_esec: y.commesse ? +((y.es / y.commesse) * 100).toFixed(1) : 0,
      ticket_medio: y.commesse ? +(tot / y.commesse).toFixed(2) : 0
    };
  });
}

function _buildGroup(records, key) {
  const by = {};
  records.forEach(c => {
    const v = c[key] || '(Non Assegnato)';
    if (!by[v]) by[v] = { n: 0, cli: new Set(), cons: 0, ente: 0, es: 0, an: 0 };
    by[v].n++; by[v].cli.add(c.cl); by[v].cons += c.co; by[v].ente += c.en;
    if (c.st === 'Eseguito') by[v].es++;
    if (c.st === 'Annullato') by[v].an++;
  });
  return Object.entries(by)
    .sort((a, b) => (b[1].cons + b[1].ente) - (a[1].cons + a[1].ente))
    .map(([nome, d]) => ({
      nome, commesse: d.n, clienti: d.cli.size,
      cons: d.cons, ente: d.ente, totale: d.cons + d.ente,
      eseguiti: d.es, annullati: d.an,
      tasso_esec: d.n ? +((d.es / d.n) * 100).toFixed(1) : 0,
      ticket_medio: d.n ? +((d.cons + d.ente) / d.n).toFixed(2) : 0
    }));
}

function _buildAgTrend(records) {
  const top5 = {};
  records.forEach(c => {
    if (!c.ag || c.ag === '(Non Assegnato)') return;
    if (!top5[c.ag]) top5[c.ag] = 0;
    top5[c.ag] += c.co + c.en;
  });
  const names = Object.entries(top5).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);
  const result = {};
  names.forEach(ag => {
    result[ag] = {};
    records.filter(c => c.ag === ag).forEach(c => {
      if (c.an > 0) result[ag][c.an] = (result[ag][c.an] || 0) + c.co + c.en;
    });
  });
  return result;
}

function _buildContratti(records) {
  const by = {};
  records.forEach(c => {
    const ct = c.ct || 'N/D';
    if (!by[ct]) by[ct] = { n: 0, cons: 0, ente: 0, es: 0 };
    by[ct].n++; by[ct].cons += c.co; by[ct].ente += c.en;
    if (c.st === 'Eseguito') by[ct].es++;
  });
  const total = records.length || 1;
  return Object.entries(by)
    .sort((a, b) => b[1].n - a[1].n)
    .map(([nome, d]) => ({
      nome, commesse: d.n, pct: +((d.n / total) * 100).toFixed(1),
      cons: d.cons, ente: d.ente, totale: d.cons + d.ente,
      tasso_esec: d.n ? +((d.es / d.n) * 100).toFixed(1) : 0
    }));
}

function _buildCitta(records) {
  const by = {};
  records.forEach(c => {
    const ci = c.ci || 'N/D';
    if (!by[ci]) by[ci] = { n: 0, cons: 0, ente: 0, cli: new Set(), es: 0 };
    by[ci].n++; by[ci].cons += c.co; by[ci].ente += c.en; by[ci].cli.add(c.cl);
    if (c.st === 'Eseguito') by[ci].es++;
  });
  return Object.entries(by)
    .sort((a, b) => b[1].n - a[1].n)
    .map(([nome, d]) => ({
      nome, commesse: d.n, cons: d.cons, ente: d.ente,
      clienti: d.cli.size,
      tasso_esec: d.n ? +((d.es / d.n) * 100).toFixed(1) : 0
    }));
}

function _buildStatiLav(records) {
  const by = _groupCount(records, 'sl');
  const total = records.length || 1;
  return Object.entries(by).sort((a, b) => b[1] - a[1])
    .map(([nome, count]) => ({ nome, count, pct: +((count / total) * 100).toFixed(1) }));
}

function _buildCrossSell(records) {
  const byClient = {};
  records.forEach(c => {
    if (!byClient[c.cl]) byClient[c.cl] = { norme: new Set(), n: 0, cons: 0, ente: 0 };
    byClient[c.cl].norme.add(c.ct); byClient[c.cl].n++;
    byClient[c.cl].cons += c.co; byClient[c.cl].ente += c.en;
  });
  const total = Object.keys(byClient).length;
  const single = Object.values(byClient).filter(v => v.norme.size === 1).length;
  const multi = total - single;
  const list = Object.entries(byClient)
    .filter(([, v]) => v.norme.size > 1)
    .sort((a, b) => b[1].norme.size - a[1].norme.size)
    .map(([cliente, v]) => ({
      cliente, n_norme: v.norme.size, commesse: v.n,
      norme: [...v.norme], cons: v.cons, ente: v.ente
    }));
  return { list, stats: { total, single, multi } };
}

function _buildRetention(records) {
  const byClient = {};
  records.forEach(c => {
    if (!byClient[c.cl]) byClient[c.cl] = new Set();
    if (c.an > 0) byClient[c.cl].add(c.an);
  });
  const counts = { '1_anno': 0, '2_anni': 0, '3_anni': 0, '4_anni': 0, '5_anni': 0 };
  Object.values(byClient).forEach(s => {
    const n = s.size;
    if (n === 1) counts['1_anno']++;
    else if (n === 2) counts['2_anni']++;
    else if (n === 3) counts['3_anni']++;
    else if (n === 4) counts['4_anni']++;
    else if (n >= 5) counts['5_anni']++;
  });
  const top = Object.entries(byClient)
    .map(([cl, anni]) => {
      const cs = records.filter(c => c.cl === cl);
      return { cliente: cl, anni: anni.size, commesse: cs.length,
        cons: cs.reduce((s, c) => s + c.co, 0), ente: cs.reduce((s, c) => s + c.en, 0) };
    })
    .sort((a, b) => b.anni - a.anni || (b.cons + b.ente) - (a.cons + a.ente))
    .slice(0, 30);
  return { counts, top };
}

function _buildFocus2026(records) {
  const y26 = records.filter(c => c.an === 2026);
  const cons = y26.reduce((s, c) => s + c.co, 0);
  const ente = y26.reduce((s, c) => s + c.en, 0);
  const tot = cons + ente;
  const maxMese = Math.max(...y26.map(c => c.me || 0), 1);
  return {
    commesse: y26.length, clienti: new Set(y26.map(c => c.cl)).size,
    cons, ente, totale: tot,
    proiezione_totale: maxMese > 0 ? Math.round(tot / maxMese * 12) : tot
  };
}

function _buildMesi2026(records) {
  const mesi = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const y26 = records.filter(c => c.an === 2026);
  const byM = {};
  y26.forEach(c => {
    const m = c.me || 1;
    if (!byM[m]) byM[m] = { n: 0, cons: 0, ente: 0 };
    byM[m].n++; byM[m].cons += c.co; byM[m].ente += c.en;
  });
  return Object.keys(byM).sort((a, b) => a - b).map(m => ({
    mese: mesi[(+m) - 1] || 'M' + m, commesse: byM[m].n, cons: byM[m].cons, ente: byM[m].ente
  }));
}

function _buildYoyQ1(records) {
  const years = [...new Set(records.filter(c => c.an > 0).map(c => c.an))].sort();
  return years.map(y => {
    const q1 = records.filter(c => c.an === y && c.me >= 1 && c.me <= 3);
    return {
      anno: y, cons: q1.reduce((s, c) => s + c.co, 0), ente: q1.reduce((s, c) => s + c.en, 0)
    };
  });
}

function _buildAlert(records) {
  const penali = records.filter(c => c.sl && c.sl.includes('PENALI')).length;
  const sospese = records.filter(c => c.sl && (c.sl.includes('SOSPESO') || c.sl.includes('BLOCCATO'))).length;
  const senzaR = records.filter(c => !c.rp || c.rp === '(Non Assegnato)').length;
  const giallo = records.filter(c => c.sp && c.sp.includes('Iniziare')).length;
  const insPrec = records.filter(c => c.sps === 'Insoluto Prec.').length;
  const ins = records.filter(c => c.sl === 'X _ BLOCCATO _ INSOLUTO').length;
  return {
    penali, sospese, senza_responsabile: senzaR,
    senza_resp_pct: records.length ? +((senzaR / records.length) * 100).toFixed(1) : 0,
    giallo, insoluto_prec: insPrec, insoluti: ins
  };
}
