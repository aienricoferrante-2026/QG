/* ── Utility Functions ── */

function fmt(n) { return Number(n || 0).toLocaleString('it-IT'); }
function fmtE(n) { return '€ ' + Number(n || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtK(n) { const v = Number(n || 0); if (Math.abs(v) >= 1e6) return '€ ' + (v / 1e6).toFixed(1) + 'M'; if (Math.abs(v) >= 1e3) return '€ ' + (v / 1e3).toFixed(0) + 'K'; return '€ ' + v.toFixed(0); }
function pct(a, b) { return b ? (a / b * 100).toFixed(1) + '%' : '0%'; }
function csvSafe(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }

function tagStatus(s) {
  const c = { 'Offerta Contrattualizzata': 'green', 'Offerta Accettata': 'cyan', 'Accettata dal Cliente': 'blue', 'Offerta Presentata': 'yellow', 'Offerta Rifiutata': 'red' };
  return '<span class="tag tag-' + (c[s] || 'gray') + '">' + (s || 'N/D') + '</span>';
}

function mkpi(val, label) {
  return '<div class="modal-kpi"><div class="modal-kpi-val">' + val + '</div><div class="modal-kpi-label">' + label + '</div></div>';
}
