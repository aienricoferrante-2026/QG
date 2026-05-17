/* ── Centralina Import Excel · Hub root ──
 * Card che lista le 12 dashboard con dato più recente + link diretto
 * alla sezione Upload Excel. NON fa import vero (i JSON sono committati
 * nel repo); è un acceleratore: 1 click → dashboard giusta.
 *
 * Pattern dati: per ogni BU, fetch del suo JSON, calcolo max(dataInizio)
 * come proxy "ultimo dato disponibile" + count totale.
 */

const HUB_IMPORT_TARGETS = [
  { code: 'FOR',     label: 'Formazione',          icon: '🎓', color: '#10b981', url: 'dashboard_FOR_CM/',     dataUrl: 'dashboard_FOR_CM/data/commesse_for.json' },
  { code: 'ISO',     label: 'Certificazioni ISO',  icon: '📜', color: '#3b82f6', url: 'dashboard_ISO_CM/',     dataUrl: 'dashboard_ISO_CM/data/commesse_iso.json' },
  { code: 'SIC',     label: 'Sicurezza Lavoro',    icon: '🛡️', color: '#06b6d4', url: 'dashboard_SIC_CM/',     dataUrl: 'dashboard_SIC_CM/data/commesse_sic.json' },
  { code: 'APL_PAL', label: 'Politiche Attive',    icon: '💼', color: '#a78bfa', url: 'dashboard_APL_PAL_CM/', dataUrl: 'dashboard_APL_PAL_CM/data/commesse_apl_pal.json' },
  { code: 'GDPR',    label: 'Privacy / GDPR',      icon: '🔒', color: '#ec4899', url: 'dashboard_GDPR_CM/',    dataUrl: 'dashboard_GDPR_CM/data/commesse_gdpr.json' },
  { code: 'SOA',     label: 'Attestazioni SOA',    icon: '🏗️', color: '#f59e0b', url: 'dashboard_SOA_CM/',     dataUrl: 'dashboard_SOA_CM/data/commesse_soa.json' },
  { code: 'AVV',     label: 'Avvalimenti',         icon: '🤝', color: '#a78bfa', url: 'dashboard_AVV_CM/',     dataUrl: 'dashboard_AVV_CM/data/commesse_avv.json' },
  { code: 'GAR',     label: "Gare d'appalto",      icon: '🎯', color: '#06b6d4', url: 'dashboard_GAR_CM/',     dataUrl: 'dashboard_GAR_CM/data/commesse_gar.json' },
  { code: 'FIA',     label: 'Finanza Agevolata',   icon: '💰', color: '#fbbf24', url: 'dashboard_FIA_CM/',     dataUrl: 'dashboard_FIA_CM/data/commesse_fia.json' },
  { code: 'APL_RES', label: 'PAL Risorse',         icon: '👥', color: '#10b981', url: 'dashboard_APL_RES_CM/', dataUrl: 'dashboard_APL_RES_CM/data/commesse_apl_res.json' },
  { code: 'IST',     label: 'Istituti',            icon: '🏛️', color: '#34d399', url: 'dashboard_IST_CM/',     dataUrl: 'dashboard_IST_CM/data/commesse_ist.json' },
];

function _hiParseDate(s) {
  if (!s) return null;
  let m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  m = String(s).match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]);
  return null;
}

function _hiFmtDate(d) {
  if (!d) return '—';
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function _hiDaysSince(d) {
  if (!d) return null;
  return Math.floor((new Date() - d) / 86400000);
}

function _hiFreshness(days) {
  if (days === null) return { color: '#64748b', label: '—' };
  if (days <= 30) return { color: '#10b981', label: 'fresco' };
  if (days <= 90) return { color: '#f59e0b', label: 'recente' };
  if (days <= 180) return { color: '#fb923c', label: 'datato' };
  return { color: '#dc2626', label: 'vecchio' };
}

function renderHubImport() {
  const root = document.getElementById('hubImportBody');
  if (!root) return;

  let h = '<p style="color:var(--text3);font-size:11px;margin-bottom:12px">' +
    'Per ogni dashboard: ultimo dato disponibile (data più recente delle commesse) + accesso diretto al pulsante <b>Carica Excel</b>. ' +
    'L\'import vero avviene dentro la dashboard di destinazione. ' +
    '<i>(Per import massivo cross-BU servirà un backend; per ora questo MVP centralizza l\'accesso.)</i></p>';

  h += '<div class="hub-import-grid">';
  // Placeholder cards subito, popolate da fetch
  HUB_IMPORT_TARGETS.forEach(t => {
    h += '<div class="hi-card" id="hi-card-' + t.code + '" style="border-left:3px solid ' + t.color + '">' +
      '<div class="hi-head">' +
        '<span class="hi-icon" style="background:' + t.color + '22;color:' + t.color + '">' + t.icon + '</span>' +
        '<div class="hi-titles">' +
          '<h4>' + t.label + '</h4>' +
          '<span class="hi-code">' + t.code + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="hi-stats" id="hi-stats-' + t.code + '"><span style="color:var(--text3);font-size:11px">…</span></div>' +
      '<div class="hi-actions">' +
        '<a href="' + t.url + '" class="hi-btn hi-btn-primary" target="_blank">📥 Apri & carica</a>' +
        '<a href="' + t.url + '" class="hi-btn hi-btn-secondary" target="_blank">🔗 Vai</a>' +
      '</div>' +
    '</div>';
  });
  // COGE card speciale (no JSON commesse, ma è il direzionale)
  h += '<div class="hi-card" style="border-left:3px solid #6366f1">' +
    '<div class="hi-head">' +
      '<span class="hi-icon" style="background:#6366f122;color:#6366f1">📊</span>' +
      '<div class="hi-titles"><h4>COGE — Conto Economico</h4><span class="hi-code">DIREZIONALE</span></div>' +
    '</div>' +
    '<div class="hi-stats"><span style="color:var(--text3);font-size:11px">Aggregato dalle 11 BU + upload HR/Segnatempo/Indiretti</span></div>' +
    '<div class="hi-actions">' +
      '<a href="dashboard_COGE/" class="hi-btn hi-btn-primary" target="_blank">📥 Carica HR/Segnatempo</a>' +
      '<a href="dashboard_COGE/" class="hi-btn hi-btn-secondary" target="_blank">🔗 Vai</a>' +
    '</div>' +
  '</div>';
  h += '</div>';

  root.innerHTML = h;

  // Popola stats in parallelo
  HUB_IMPORT_TARGETS.forEach(t => {
    fetch(t.dataUrl).then(r => r.ok ? r.json() : []).catch(() => [])
      .then(items => {
        const el = document.getElementById('hi-stats-' + t.code);
        if (!el) return;
        const n = items.length;
        if (!n) { el.innerHTML = '<span style="color:#dc2626;font-size:11px">⚠ JSON vuoto o mancante</span>'; return; }
        // max dataInizio
        let maxDate = null;
        items.forEach(c => {
          const d = _hiParseDate(c.dataInizio || c.dataPianInizio);
          if (d && (!maxDate || d > maxDate)) maxDate = d;
        });
        const days = _hiDaysSince(maxDate);
        const fr = _hiFreshness(days);
        el.innerHTML = '<div class="hi-stat"><b>' + n.toLocaleString('it-IT') + '</b> commesse</div>' +
          '<div class="hi-stat">Ultimo dato: <b>' + _hiFmtDate(maxDate) + '</b></div>' +
          '<div class="hi-stat" style="color:' + fr.color + '"><b>' + (days !== null ? days + 'gg' : '—') + '</b> · ' + fr.label + '</div>';
      });
  });
}

document.addEventListener('DOMContentLoaded', renderHubImport);
