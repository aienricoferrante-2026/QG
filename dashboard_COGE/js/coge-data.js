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
  month: 0,
  pivotDim: 'societa_sede_bu',
  rawByBu: {},
  aggSocSedeBu: {},
  hr: [],
  indiretti: {},
  segnatempo: [],
  /* Cache per ricerca commessa per id (popolata da cogeBuildAggregates). */
  commessaById: new Map(),
  loaded: false,
};

const COGE_HR_KEY = 'qg_coge_hr';
const COGE_IND_KEY = 'qg_coge_indiretti';
const COGE_TT_KEY = 'qg_coge_segnatempo';

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

function _cogeMonthOf(c) {
  /* Mese 1-12 dalla dataInizio (formato dd-mm-yyyy o yyyy-mm-dd). */
  const s = c.dataInizio || c.dataPianInizio || '';
  let m = String(s).match(/^\d{4}-(\d{1,2})-/);
  if (m) return parseInt(m[1]);
  m = String(s).match(/^\d{1,2}-(\d{1,2})-\d{4}/);
  if (m) return parseInt(m[1]);
  return null;
}

function _cogePeriodMatch(c) {
  /* Filtra commessa per anno + (eventuale) mese selezionati. */
  if (_cogeYearOf(c) !== COGE.year) return false;
  if (COGE.month >= 1 && COGE.month <= 12) {
    if (_cogeMonthOf(c) !== COGE.month) return false;
  }
  return true;
}

function cogeProRataFactor() {
  /* Quanta parte del costo annuo HR / indiretti applicare al periodo selezionato.
     1.0 se anno intero, 1/12 se mese specifico. */
  return (COGE.month >= 1 && COGE.month <= 12) ? (1 / 12) : 1;
}

function _cogeNormSede(sedeNorm) {
  /* Estrae solo il nome città dalla sedeNorm "Frattamaggiore 1 (Hq) - Via..." */
  if (!sedeNorm) return '—';
  return String(sedeNorm).split(' - ')[0].trim() || '—';
}

function cogeBuildAggregates() {
  /* Per ogni BU × commessa filtrata sull'anno (+mese): aggrega per
     (Società, Sede, Regione, BU). Conserva tutte le dimensioni per pivot.
     Popola anche commessaById per lookup rapido in Segnatempo. */
  const agg = {};
  COGE.commessaById = new Map();
  Object.entries(COGE.rawByBu).forEach(([bu, items]) => {
    items.forEach(c => {
      if (c.id) COGE.commessaById.set(String(c.id), { ...c, _bu: bu });
      if (!_cogePeriodMatch(c)) return;
      const soc = (c.societa || '—').trim();
      const sede = _cogeNormSede(c.sedeNorm || c.sedeOp);
      const reg = (c.regione || '—').trim();
      const k = soc + '|' + sede + '|' + bu;
      if (!agg[k]) agg[k] = {
        societa: soc, sede: sede, regione: reg, bu: bu,
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

/* ── Parser data Segnatempo (yyyy-mm-dd o dd/mm/yyyy) ── */
function _cogeParseDataTs(s) {
  if (!s) return null;
  let m = String(s).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { y: +m[1], m: +m[2], d: +m[3] };
  m = String(s).match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
  if (m) return { y: +m[3], m: +m[2], d: +m[1] };
  return null;
}

function _cogePeriodMatchDate(dataStr) {
  const d = _cogeParseDataTs(dataStr);
  if (!d) return false;
  if (d.y !== COGE.year) return false;
  if (COGE.month >= 1 && COGE.month <= 12) return d.m === COGE.month;
  return true;
}

/* ── Costo orario per dipendente (mappa nome → €/ora) ── */
function cogeCostiOrari() {
  const oreAnnue = window.SECTOR_CONFIG.oreAnnueLavorative || 1720;
  const out = {};
  COGE.hr.forEach(h => {
    const nome = (h.dipendente || '').trim().toLowerCase();
    if (!nome) return;
    const costoAnnuo = parseFloat(h.costoAnnuo) || 0;
    /* Se il dipendente è imputato a più BU (più righe HR), sommiamo il
       costo annuo totale e dividiamo per le ore annue → costo orario unico. */
    out[nome] = (out[nome] || 0) + (costoAnnuo / oreAnnue);
  });
  return out;
}

/* ── Pivot per dimensione ──────────────────────────────────────
 * Restituisce array di righe aggregate per la dimensione scelta,
 * con: { key, label, ricavi, costiCommessa, mol, costoHr,
 *        costiIndiretti, risultato, commesse, dettagli{...} }.
 * Le dimensioni valide: societa, sede, bu, regione, societa_sede_bu.
 */
function cogePivotAggregato(dim) {
  const rows = Object.values(COGE.aggSocSedeBu);
  const proRata = cogeProRataFactor();

  // Helper: chiave + label per la dimensione
  function keyOf(a) {
    if (dim === 'societa') return { k: a.societa, lbl: a.societa };
    if (dim === 'sede')    return { k: a.societa + '|' + a.sede, lbl: a.societa + ' · ' + a.sede };
    if (dim === 'bu')      return { k: a.bu, lbl: (window.SECTOR_CONFIG.buMeta[a.bu]?.icon || '') + ' ' + a.bu };
    if (dim === 'regione') return { k: a.regione, lbl: a.regione };
    return { k: a.societa + '|' + a.sede + '|' + a.bu, lbl: a.societa + ' · ' + a.sede + ' · ' + a.bu };
  }

  const grouped = {};
  rows.forEach(a => {
    const { k, lbl } = keyOf(a);
    if (!grouped[k]) grouped[k] = {
      key: k, label: lbl,
      ricavi: 0, costiCommessa: 0, mol: 0,
      commesse: 0, costoHr: 0, costiIndiretti: 0,
      sedi: new Set(), societa: new Set(), bu: new Set(),
    };
    const g = grouped[k];
    g.ricavi += a.ricavi;
    g.costiCommessa += a.costiCommessa;
    g.mol += a.mol;
    g.commesse += a.commesse;
    g.costoHr += cogeHrSumByBuSede(a.bu, a.societa, a.sede) * proRata;
    g.sedi.add(a.societa + '|' + a.sede);
    g.societa.add(a.societa);
    g.bu.add(a.bu);
  });

  // Costi indiretti: solo per dimensioni che contengono Sede (sede, societa_sede_bu)
  // Per societa/bu/regione, aggrego i costi indiretti delle sedi appartenenti
  if (dim === 'sede') {
    Object.values(grouped).forEach(g => {
      const [soc, sede] = g.key.split('|');
      g.costiIndiretti = cogeIndirettiSede(soc, sede) * proRata;
    });
  } else if (dim === 'societa_sede_bu') {
    Object.values(grouped).forEach(g => {
      const [soc, sede] = g.key.split('|');
      g.costiIndiretti = cogeIndirettiSede(soc, sede) * proRata;
    });
  } else {
    // Per societa/bu/regione: somma indiretti di tutte le sedi nel gruppo
    Object.values(grouped).forEach(g => {
      g.costiIndiretti = [...g.sedi].reduce((s, sk) => {
        const [soc, sede] = sk.split('|');
        return s + cogeIndirettiSede(soc, sede) * proRata;
      }, 0);
    });
  }

  // Calcola risultato per ogni gruppo
  Object.values(grouped).forEach(g => {
    g.risultato = g.ricavi - g.costiCommessa - g.costoHr - g.costiIndiretti;
    g.nSedi = g.sedi.size;
    g.nSocieta = g.societa.size;
    g.nBu = g.bu.size;
  });

  return Object.values(grouped).sort((a, b) => b.ricavi - a.ricavi);
}

function cogeLoadAll() {
  const cfg = window.SECTOR_CONFIG;
  const entries = Object.entries(cfg.buData);
  return Promise.all(entries.map(([bu, url]) =>
    fetch(url).then(r => r.ok ? r.json() : []).catch(() => [])
      .then(items => ({ bu, items: items || [] }))
  )).then(results => {
    results.forEach(({ bu, items }) => { COGE.rawByBu[bu] = items; });
    try { COGE.hr = JSON.parse(localStorage.getItem(COGE_HR_KEY) || '[]'); } catch (e) { COGE.hr = []; }
    try { COGE.indiretti = JSON.parse(localStorage.getItem(COGE_IND_KEY) || '{}'); } catch (e) { COGE.indiretti = {}; }
    try { COGE.segnatempo = JSON.parse(localStorage.getItem(COGE_TT_KEY) || '[]'); } catch (e) { COGE.segnatempo = []; }
    cogeBuildAggregates();
    COGE.loaded = true;
  });
}

function cogeSaveHr() { try { localStorage.setItem(COGE_HR_KEY, JSON.stringify(COGE.hr)); } catch (e) {} }
function cogeSaveIndiretti() { try { localStorage.setItem(COGE_IND_KEY, JSON.stringify(COGE.indiretti)); } catch (e) {} }
function cogeSaveSegnatempo() { try { localStorage.setItem(COGE_TT_KEY, JSON.stringify(COGE.segnatempo)); } catch (e) {} }

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

/* Imputazione cascata costo dipendente → commessa: vedi
   coge-imputazione-logic.js (cogeImputazioneSegnatempo). */
