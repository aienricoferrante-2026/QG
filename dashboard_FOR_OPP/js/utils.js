/* ── Utility Functions ── */

function fmt(n) { return Number(n).toLocaleString('it-IT'); }
function fmtE(n) { return '€ ' + Number(n).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtK(n) {
  if (n >= 1e6) return '€ ' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return '€ ' + (n / 1e3).toFixed(1) + 'K';
  return '€ ' + n.toFixed(0);
}
function pct(a, b) { return b ? (a / b * 100).toFixed(1) + '%' : '0%'; }
function csvSafe(v) { return '"' + String(v || '').replace(/"/g, '""') + '"'; }

function tagStatus(s) {
  if (!s) return '';
  const map = {
    'Eseguito': 'tag-green', 'Annullato': 'tag-red',
    'Pianificato': 'tag-blue', 'Da pianificare': 'tag-yellow'
  };
  return '<span class="tag ' + (map[s] || 'tag-gray') + '">' + s + '</span>';
}

function tagCorso(s) {
  if (!s) return '';
  const map = {
    'Concluso': 'tag-green', 'In corso': 'tag-cyan',
    'Fine Corso (Attesa nulla osta)': 'tag-purple', 'In partenza': 'tag-yellow'
  };
  return '<span class="tag ' + (map[s] || 'tag-gray') + '">' + s + '</span>';
}

function tagClasse(s) {
  if (!s) return '';
  return '<span class="tag ' + (s === 'Chiusa' ? 'tag-red' : 'tag-green') + '">' + s + '</span>';
}

function progressBar(pct) {
  const color = pct >= 100 ? '#10b981' : pct >= 50 ? '#3b82f6' : pct > 0 ? '#f59e0b' : '#475569';
  return '<div class="progress"><div class="progress-bar" style="width:' + pct + '%;background:' + color + '"></div></div>';
}

function mkpi(val, label) {
  return '<div class="modal-kpi"><div class="v">' + val + '</div><div class="l">' + label + '</div></div>';
}
