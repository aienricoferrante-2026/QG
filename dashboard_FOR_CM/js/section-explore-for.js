/* ── Esplora · estensioni FOR-specifiche ──
   Caso 2 della governance del kit: FOR è autonomo (non usa il kit
   condiviso), ma per la sezione "Esplora" includiamo i 3 file del kit
   `shared/dashboard-core/js/section-explore-*.js` e qui aggiungiamo:

   1. Shim per le funzioni isOpen/isClosed/isCancelled (FOR le ha
      implicite, il kit le usa esplicitamente per WIP/Output).
   2. Adapter _activeQuickFilterObjs: il kit usa un Set multi-select di
      quick filter, FOR ha ancora il singolo _quickFilter.
   3. Push di dimensioni FOR-specifiche: Stato Corso, Stato Classe, Corso.
   4. Push di metriche FOR-specifiche: Discenti (Σ), Ore (Σ).
   5. Override di _exploreMetric per supportare discenti/ore.
   6. Push di preset rapidi FOR: 🎓 Corsi, 👥 Corsi · Discenti, 📚 Stato
      Corso, 🎯 Cliente · Corso.

   Questo file va caricato DOPO i 3 file del kit Explore (sennò gli
   array EXPLORE_* non esistono ancora). */

/* ── 1. Shim isOpen / isClosed / isCancelled per FOR ──
   FOR usa `statoCorso === 'Concluso'` come segnale di chiusura corso,
   `status === 'Annullato'` per le annullate. */
if (typeof window.isClosed !== 'function') {
  window.isClosed = function (c) {
    return c && (c.statoCorso === 'Concluso' || c.status === 'Chiusa' || c.status === 'Concluso');
  };
}
if (typeof window.isCancelled !== 'function') {
  window.isCancelled = function (c) {
    return c && (c.status === 'Annullato' || c.status === 'Annullata');
  };
}
if (typeof window.isOpen !== 'function') {
  window.isOpen = function (c) { return c && !isClosed(c) && !isCancelled(c); };
}

/* ── 2. Adapter quick filter: kit usa _activeQuickFilterObjs (Set),
   FOR usa _quickFilter singolo. ── */
if (typeof window._activeQuickFilterObjs !== 'function') {
  window._activeQuickFilterObjs = function () {
    return (typeof _quickFilter !== 'undefined' && _quickFilter) ? [_quickFilter] : [];
  };
}

/* ── 3. Dimensioni FOR-specifiche ── */
if (typeof EXPLORE_DIMENSIONS !== 'undefined') {
  EXPLORE_DIMENSIONS.push(
    { id: 'statoCorso',  label: 'Stato Corso' },
    { id: 'statoClasse', label: 'Stato Classe' },
    { id: 'corso',       label: 'Corso (titolo)' }
  );
  if (typeof EXPLORE_DIM_DRILL !== 'undefined') {
    EXPLORE_DIM_DRILL.statoCorso  = 'statoCorso';
    EXPLORE_DIM_DRILL.statoClasse = 'statoClasse';
    EXPLORE_DIM_DRILL.corso       = 'corso';
  }
}

/* ── 4. Metriche FOR-specifiche ── */
if (typeof EXPLORE_METRICS !== 'undefined') {
  EXPLORE_METRICS.push(
    { id: 'discenti', label: 'Discenti (totali)', short: 'Disc.', type: 'num' },
    { id: 'ore',      label: 'Ore (totali)',      short: 'Ore',   type: 'num' }
  );
}

/* ── 5. Override _exploreMetric per discenti / ore ──
   In browser le `function` global vivono su window: posso riassegnarle. */
if (typeof window._exploreMetric === 'function') {
  const _origExploreMetric = window._exploreMetric;
  window._exploreMetric = function (items, metric) {
    if (!items) return 0;
    if (metric === 'discenti') return items.reduce((s, c) => s + (c.discenti || 0), 0);
    if (metric === 'ore')      return items.reduce((s, c) => s + (c.ore || 0), 0);
    return _origExploreMetric(items, metric);
  };
}

/* ── 6. Preset rapidi FOR ── */
if (typeof EXPLORE_PRESETS !== 'undefined') {
  EXPLORE_PRESETS.push(
    { id: 'corsiRic',   label: '🎓 Corsi (Ricavi)',   l1: 'corso',      l2: 'none',  l3: 'none', m: 'ricavi' },
    { id: 'corsiDisc',  label: '👥 Corsi · Discenti', l1: 'corso',      l2: 'none',  l3: 'none', m: 'discenti' },
    { id: 'statoCorso', label: '📚 Stato Corso',      l1: 'statoCorso', l2: 'none',  l3: 'none', m: 'count' },
    { id: 'cliCorso',   label: '🎯 Cliente · Corso',  l1: 'cliente',    l2: 'corso', l3: 'none', m: 'ricavi' }
  );
}
