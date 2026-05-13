/* ── COGE · Caricamento e aggregazione dati ──
 * Scarica tutti i JSON BU, normalizza Società/Sede, costruisce
 * aggregati Società × Sede × BU per ricavi, costi diretti, MOL e
 * incassato. I costi dipendenti (HR) e indiretti vivono in
 * localStorage finché non hanno una loro fonte committata.
 *
 * Tutto è esposto come globale `COGE`:
 *   COGE.year                 anno selezionato
 *   COGE.rawByBu              { BU: [...commesse] }
 *   COGE.aggSocSedeBu         { Società|Sede|BU: aggregato }
 *   COGE.hr                   array dipendenti caricati
 *   COGE.indiretti            { Società|Sede: { voce: importo } }
 */

const COGE = {
  year: window.SECTOR_CONFIG.defaultYear,
  rawByBu: {},
  aggSocSedeBu: {},
  hr: [],
  indiretti: {},
  loaded: false,
};

const COGE_HR_KEY = 'qg_coge_hr';
const COGE_IND_KEY = 'qg_coge_indiretti';

function cogeFmt(n) { return Number(n || 0).toLocaleString('it-IT'); }
function cogeFmtE(n) {
  n = Number(n || 0);
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e6) return sign + '€ ' + (abs / 1e6).toFixed(1) + 'M';
  if (abs >= 1e3) return sign + '€ ' + (abs / 1e3).toFixed(1) + 'K';
  return sign + '€ ' + abs.toFixed(0);
}

function _cogeYearOf(c) {
  const s = c.dataInizio || c.dataPianInizio || '';
  let m = String(s).match(/^(\d{4})-/);
  if (m) return parseInt(m[1]);
  m = String(s).match(/-(\d{4})$/);
  if (m) return parseInt(m[1]);
  return null;
}

function _cogeNormSede(sedeNorm) {
  /* Estrae solo il nome città dalla sedeNorm "Frattamaggiore 1 (Hq) - Via..." */
  if (!sedeNorm) return '—';
  return String(sedeNorm).split(' - ')[0].trim() || '—';
}

function cogeBuildAggregates() {
  /* Per ogni BU × commessa filtrata sull'anno: aggrega per (Società, Sede). */
  const agg = {};
  Object.entries(COGE.rawByBu).forEach(([bu, items]) => {
    items.forEach(c => {
      if (_cogeYearOf(c) !== COGE.year) return;
      const soc = (c.societa || '—').trim();
      const sede = _cogeNormSede(c.sedeNorm || c.sedeOp);
      const k = soc + '|' + sede + '|' + bu;
      if (!agg[k]) agg[k] = {
        societa: soc, sede: sede, bu: bu,
        commesse: 0, ricavi: 0, costiCommessa: 0, mol: 0,
        incassato: 0, daIncassare: 0,
      };
      const a = agg[k];
      a.commesse++;
      a.ricavi += (c.consulenza || 0);
      a.costiCommessa += (c.costi || 0);
      a.mol += (c.mol || 0);
      a.incassato += (c.giaIncassato || 0);
      a.daIncassare += Math.max(0, (c.consulenza || 0) - (c.giaIncassato || 0));
    });
  });
  COGE.aggSocSedeBu = agg;
}

function cogeLoadAll() {
  /* Scarica tutti i JSON BU in parallelo + ripristina HR/indiretti da localStorage. */
  const cfg = window.SECTOR_CONFIG;
  const entries = Object.entries(cfg.buData);
  return Promise.all(entries.map(([bu, url]) =>
    fetch(url).then(r => r.ok ? r.json() : []).catch(() => [])
      .then(items => ({ bu, items: items || [] }))
  )).then(results => {
    results.forEach(({ bu, items }) => { COGE.rawByBu[bu] = items; });
    // HR da localStorage
    try {
      const raw = localStorage.getItem(COGE_HR_KEY);
      COGE.hr = raw ? JSON.parse(raw) : [];
    } catch (e) { COGE.hr = []; }
    // Indiretti da localStorage
    try {
      const raw = localStorage.getItem(COGE_IND_KEY);
      COGE.indiretti = raw ? JSON.parse(raw) : {};
    } catch (e) { COGE.indiretti = {}; }
    cogeBuildAggregates();
    COGE.loaded = true;
  });
}

function cogeSaveHr() {
  try { localStorage.setItem(COGE_HR_KEY, JSON.stringify(COGE.hr)); } catch (e) {}
}
function cogeSaveIndiretti() {
  try { localStorage.setItem(COGE_IND_KEY, JSON.stringify(COGE.indiretti)); } catch (e) {}
}

function cogeHrSumByBuSede(bu, soc, sede) {
  /* Somma costo annuo dipendenti dell'HR caricato che matchano BU+Società+Sede. */
  const buUp = bu.toUpperCase();
  const socMatch = (soc || '').toLowerCase();
  const sedeMatch = (sede || '').toLowerCase();
  return COGE.hr.reduce((s, h) => {
    const hBu = (h.bu || '').toUpperCase();
    const hSoc = (h.societa || '').toLowerCase();
    const hSede = (h.sede || '').toLowerCase();
    if (hBu === buUp && hSoc === socMatch && hSede === sedeMatch) {
      return s + (parseFloat(h.costoAnnuo) || 0);
    }
    return s;
  }, 0);
}

function cogeIndirettiSede(soc, sede) {
  /* Somma costi indiretti registrati per (Società, Sede). */
  const k = (soc || '') + '|' + (sede || '');
  const voci = COGE.indiretti[k] || {};
  return Object.values(voci).reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

function cogeUniqueSediConsedi() {
  /* Ritorna lista unica di (Società, Sede) presenti in aggSocSedeBu. */
  const set = new Set();
  Object.values(COGE.aggSocSedeBu).forEach(a => set.add(a.societa + '|' + a.sede));
  return [...set].map(k => {
    const [societa, sede] = k.split('|');
    return { societa, sede };
  }).sort((a, b) => (a.societa + a.sede).localeCompare(b.societa + b.sede));
}
