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

function tagLav(s) {
  if (!s) return '';
  if (s.includes('Conclusa') || s.includes('OK Incassato')) return '<span class="tag tag-green">' + shortLav(s) + '</span>';
  if (s.includes('SOSPESO') || s.includes('BLOCCATO')) return '<span class="tag tag-red">' + shortLav(s) + '</span>';
  if (s.includes('Invio') || s.includes('Lavorazioni')) return '<span class="tag tag-blue">' + shortLav(s) + '</span>';
  if (s.includes('PAGAMENTI') || s.includes('Pagamento')) return '<span class="tag tag-yellow">' + shortLav(s) + '</span>';
  return '<span class="tag tag-gray">' + shortLav(s) + '</span>';
}

function shortLav(s) {
  if (!s) return '';
  // Shorten long SOA states
  return s.replace(/SOA_\d+\.?\d*_/g, '').replace(/_FASE.*$/g, '').substring(0, 40);
}

function mkpi(val, label) {
  return '<div class="modal-kpi"><div class="v">' + val + '</div><div class="l">' + label + '</div></div>';
}
