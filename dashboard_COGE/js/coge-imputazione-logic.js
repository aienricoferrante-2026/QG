/* ── COGE · Logica imputazione cascata Segnatempo → Commessa/BU/Generali ──
 *
 * Fonte: Segnatempo (righe ore registrate dai dipendenti/collaboratori).
 * Cascata in 3 livelli:
 *   L1 - Tempo su IdCommessa specifico → costo va su quella commessa
 *   L2 - Tempo su BU (no IdCommessa)   → costo spalmato su tutte le
 *        commesse della BU del periodo (in piatto)
 *   L3 - Tempo né su commessa né BU    → costi GENERALI (overhead)
 *
 * Costo riga = ore × (costoAnnuo dipendente / oreAnnueLavorative).
 *
 * Output cogeImputazioneSegnatempo(): {
 *   perCommessa: Map(idCommessa → { idCommessa, titolo, cliente, bu,
 *                                    societa, sede, ricavi,
 *                                    costoDiretto, costoBuSpalmato,
 *                                    dipendenti[] }),
 *   poolBu:      { bu: importoTotale L2 },
 *   generali:    importoNonImputabile L3,
 *   oreTotali:   somma ore Segnatempo del periodo,
 *   senzaDip:    nomi dipendenti Segnatempo non presenti in HR (esclusi)
 * }
 */

function cogeImputazioneSegnatempo() {
  const costiOra = cogeCostiOrari();
  const perCommessa = new Map();
  const poolBu = {};
  let generali = 0;
  let oreTotali = 0;
  const senzaDip = [];

  function _addCommessa(commessa, bu, costo, dip, kind) {
    const id = String(commessa.id);
    if (!perCommessa.has(id)) {
      perCommessa.set(id, {
        idCommessa: id, titolo: commessa.titolo || commessa.contratto || '',
        cliente: commessa.cliente || '', bu: bu,
        societa: commessa.societa || '',
        sede: _cogeNormSede(commessa.sedeNorm || commessa.sedeOp),
        ricavi: commessa.consulenza || 0,
        costoDiretto: 0, costoBuSpalmato: 0,
        dipendenti: [],
      });
    }
    const item = perCommessa.get(id);
    if (kind === 'L1') item.costoDiretto += costo;
    else if (kind === 'L2') item.costoBuSpalmato += costo;
    if (dip && !item.dipendenti.includes(dip)) item.dipendenti.push(dip);
  }

  // Step 1: processa Segnatempo, smista per livello
  COGE.segnatempo.forEach(s => {
    if (!_cogePeriodMatchDate(s.data)) return;
    const nome = (s.dipendente || '').trim().toLowerCase();
    const co = costiOra[nome];
    if (!co) { senzaDip.push(s.dipendente || '(vuoto)'); return; }
    const ore = parseFloat(s.ore) || 0;
    if (ore <= 0) return;
    oreTotali += ore;
    const costo = ore * co;
    const idC = (s.idCommessa || '').toString().trim();
    if (idC) {
      const c = COGE.commessaById.get(idC);
      if (c) { _addCommessa(c, c._bu, costo, s.dipendente, 'L1'); return; }
      generali += costo;
      return;
    }
    const bu = (s.bu || '').toUpperCase().trim();
    if (bu && window.SECTOR_CONFIG.buMeta[bu]) {
      poolBu[bu] = (poolBu[bu] || 0) + costo;
      return;
    }
    generali += costo;
  });

  // Step 2: spalma poolBu sulle commesse del periodo per ogni BU
  Object.entries(poolBu).forEach(([bu, totBu]) => {
    const commesseBu = (COGE.rawByBu[bu] || []).filter(_cogePeriodMatch);
    if (!commesseBu.length) { generali += totBu; return; }
    const quota = totBu / commesseBu.length;
    commesseBu.forEach(c => _addCommessa(c, bu, quota, null, 'L2'));
  });

  return { perCommessa, poolBu, generali, oreTotali, senzaDip };
}

/* Backward compat: vecchio API usato da coge-imputazioni.js (refactored). */
function cogeImputazioneCostiCommessa() {
  const r = cogeImputazioneSegnatempo();
  const out = new Map();
  r.perCommessa.forEach((v, k) => {
    out.set(k, { ...v, costoImputato: v.costoDiretto + v.costoBuSpalmato });
  });
  return out;
}

/* Helper: totale costo generale (L3) del periodo — usato dal Riepilogo. */
function cogeCostiGenerali() {
  return cogeImputazioneSegnatempo().generali;
}
