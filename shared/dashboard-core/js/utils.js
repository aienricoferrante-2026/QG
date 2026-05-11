/* ── Utility Functions (core multi-settore) ── */

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
    'Eseguito': 'tag-green', 'Concluso': 'tag-green', 'Chiusa': 'tag-green',
    'Annullato': 'tag-red', 'Annullata': 'tag-red',
    'Pianificato': 'tag-blue', 'In corso': 'tag-cyan', 'In Lavorazione': 'tag-cyan',
    'Da pianificare': 'tag-yellow', 'In attesa': 'tag-yellow',
    'Sospeso': 'tag-purple', 'Sospesa': 'tag-purple'
  };
  return '<span class="tag ' + (map[s] || 'tag-gray') + '">' + s + '</span>';
}

const _CLOSED_STATUSES = ['Concluso', 'Eseguito', 'Chiusa'];
const _CANCELLED_STATUSES = ['Annullato', 'Annullata'];
function isClosed(c) { return _CLOSED_STATUSES.includes(c.status); }
function isCancelled(c) { return _CANCELLED_STATUSES.includes(c.status); }
function isOpen(c) { return !isClosed(c) && !isCancelled(c); }

function progressBar(p) {
  const color = p >= 100 ? '#10b981' : p >= 50 ? '#3b82f6' : p > 0 ? '#f59e0b' : '#475569';
  return '<div class="progress"><div class="progress-bar" style="width:' + p + '%;background:' + color + '"></div></div>';
}

function mkpi(val, label) {
  return '<div class="modal-kpi"><div class="v">' + val + '</div><div class="l">' + label + '</div></div>';
}

/* Bottone "Apri in Qnet" — usa qnetLink/erpLink della commessa */
function qnetBtn(c) {
  const link = c && (c.qnetLink || c.erpLink);
  if (link) {
    return '<a class="btn-erp" href="' + link + '" target="_blank" rel="noopener" title="Apri commessa #' + c.id + ' in Qnet" onclick="event.stopPropagation()">Qnet &#8599;</a>';
  }
  return '<button class="btn-erp" disabled title="Link Qnet non disponibile" style="opacity:.4;cursor:not-allowed">Qnet</button>';
}

/* Etichetta del settore corrente (da SECTOR_CONFIG) */
function sectorLabel() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.label) || 'Commesse';
}
function sectorCode() {
  return (window.SECTOR_CONFIG && window.SECTOR_CONFIG.code) || 'GEN';
}
