/* ── Utility Functions ── */

function fmt(n) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtK(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(0);
}

function groupBy(arr, key) {
  const m = {};
  arr.forEach(d => {
    const k = d[key] || 'N/D';
    if (!m[k]) m[k] = { count: 0, total: 0 };
    m[k].count++;
    m[k].total += d.totale;
  });
  return m;
}

function statusBadge(s) {
  const m = {
    'Offerta Contrattualizzata': ['badge-green', 'Contrattualizzata'],
    'Offerta Accettata':         ['badge-blue', 'Accettata'],
    'Accettata dal Cliente':     ['badge-purple', 'Acc. Cliente'],
    'Offerta Presentata':        ['badge-yellow', 'Presentata'],
    'Offerta Rifiutata':         ['badge-red', 'Rifiutata']
  };
  const [cls, txt] = m[s] || ['', ''];
  return `<span class="badge ${cls}">${txt}</span>`;
}
