# `shared/dashboard-core/` — Kit condiviso multi-settore

Il "kit di base" che le dashboard di ogni BU (Business Unit / settore di Qualifica Group)
riusano per non duplicare codice. Le BU "base" che usano solo i 45 campi comuni
(SIC, AVV, FIA, IST oggi) puntano qui via `<script src="../shared/dashboard-core/...">`.

## Cosa contiene

```
shared/dashboard-core/
├── README.md                       (questo file)
├── index-template.html             (template HTML, placeholder {{TITLE}}/{{BRAND_SUB}}/{{COUNT}})
├── css/
│   ├── variables.css               (tema scuro/chiaro)
│   ├── layout.css                  (sidebar, header, period-filter, quick-filters)
│   ├── tables.css                  (tabelle sortable, tag colors)
│   └── modal.css                   (drill-down modal)
└── js/
    ├── theme.js                    (toggle dark/light)
    ├── auth.js                     (login admin, legge SECTOR_CONFIG.adminEmail)
    ├── utils.js                    (fmt, fmtE, fmtK, qnetBtn, isOpen/isClosed/isCancelled)
    ├── tables.js                   (buildTbl con sorting)
    ├── charts.js                   (makeDonut/Bar/Stacked/Line)
    ├── drilldown.js                (modale multi-livello, DRILL_FIELDS da config)
    ├── filters.js                  (FILTER_DEFS + Period + QuickFilters da config)
    ├── kpis.js                     (renderFilteredKpis)
    ├── sections-overview.js        (Executive Summary, Ricavi & MOL)
    ├── sections-finance.js         (Sedi, Clienti, Responsabili, Avanzamento, Alert)
    ├── section-econfin.js          (Budget Commessa Qnet: Consuntivo Ec., Documentale, Finanziario)
    ├── section-analisi-incassi.js  (Analisi Incassi & Crediti)
    ├── section-link-partner.js     (admin only, legge SECTOR_CONFIG.partnersJsonUrl)
    ├── info-tooltip.js             (popover info su KPI)
    └── app.js                      (bootstrap: fetch dati, init filtri, navigazione sezioni)
```

## Come una BU lo usa

Ogni dashboard di settore (es. `dashboard_SIC_CM/`) ha **tre cose proprie**:

1. **`config.js`** — la specificità della BU:
   ```js
   window.SECTOR_CONFIG = {
     code: 'SIC',                              // codice settore
     label: 'Sicurezza Lavoro',                // nome esteso
     icon: '🛡️',                                // emoji per card hub e header
     color: '#06b6d4',                         // colore principale BU
     dataFile: 'data/commesse_sic.json',       // file dati da caricare
     adminEmail: 'formazione@qualificagroup.it',
     defaultSection: 'executive',              // sezione mostrata all'apertura
     partnersJsonUrl: 'partners_sic/_links.json',
     partnersBaseUrl: 'partners_sic/view.html'
     // Override opzionali (lascia vuoto se non serve):
     // filters: [...]                         // sostituisce FILTER_DEFS_DEFAULT
     // quickFilters: [...]                    // sostituisce QUICK_FILTERS_DEFAULT
     // drillFields: [...]                     // sostituisce DRILL_FIELDS_DEFAULT
     // sections: {...}                        // sostituisce SECTIONS_DEFAULT (per nascondere o aggiungere)
   };
   ```

2. **`index.html`** — generato da `tools/build_sector_dashboards.py` dal template.
   Sidebar e link al kit. Lo puoi modificare a mano per nascondere voci o aggiungere sezioni custom.

3. **`data/commesse_<sec>.json`** — generato da `tools/convert_sectors.py` dall'Excel del settore.

Il file `index.html` della BU include il kit così:
```html
<script src="config.js"></script>              <!-- prima il config -->
<script src="../shared/dashboard-core/js/theme.js"></script>
<script src="../shared/dashboard-core/js/auth.js"></script>
<!-- ... etc ... -->
<script src="../shared/dashboard-core/js/app.js"></script>  <!-- per ultimo -->
```

`config.js` viene caricato per primo: tutti gli altri file del kit leggono
`window.SECTOR_CONFIG` quando ne hanno bisogno.

## 🛡️ Governance — quando modificare il kit

**Principio**: massima standardizzazione (riuso del kit) + libertà di specificità per ogni BU.

### 3 casi quando arriva una richiesta di modifica

**Caso 1 — Utile a TUTTE le BU base** → si modifica il kit.
*Esempio*: aggiungere un Quick Filter "Insoluti > 90 giorni" che ha senso ovunque.
Tutte le dashboard base ne beneficiano alla prima ricarica.

**Caso 2 — Serve solo a UNA BU** → "fork interno" della BU.
La BU si copia il file dal kit dentro la sua cartella e lo modifica lì.
Le altre BU restano sul kit, intoccate.
*Esempio*: la BU ISO vuole sostituire la donut "Status" con una donut "Ente certificatore"
nell'Executive Summary.
- Copia `shared/dashboard-core/js/sections-overview.js` → `dashboard_ISO_CM/js/sections-overview.js`
- Modifica la funzione `renderExecutive` nel file locale
- In `dashboard_ISO_CM/index.html` cambia l'include:
  ```html
  <!-- vecchio: <script src="../shared/dashboard-core/js/sections-overview.js"></script> -->
  <script src="js/sections-overview.js"></script>
  ```

**Caso 3 — Rompe altre BU** → si rifiuta, si trova un compromesso (Caso 2) o si rifa
il kit in modo non-breaking (es. nuova opzione opzionale via `SECTOR_CONFIG`).

### Regola pratica

Prima di toccare un file in `shared/dashboard-core/`, domanda:

> **"Questa modifica ha senso per TUTTE le BU base che usano il kit?"**

- ✅ Sì → modifica al kit
- ❌ No → fork interno alla BU che la richiede

## Aggiungere una sezione specifica per una BU (senza toccare il kit)

Esempio: la BU ISO ha bisogno di una sezione "Audit & Verifiche" che le altre BU non hanno.

1. Crea `dashboard_ISO_CM/js/section-audit.js`:
   ```js
   function renderAuditISO() {
     const el = document.getElementById('sec-auditISO');
     // ... usa fmt, fmtE, buildTbl, makeBar dal kit ...
   }
   ```

2. In `dashboard_ISO_CM/config.js` aggiungi la sezione:
   ```js
   window.SECTOR_CONFIG = {
     ...
     sections: {
       executive: () => typeof renderExecutive === 'function' && renderExecutive(),
       auditISO:  () => typeof renderAuditISO  === 'function' && renderAuditISO(),
       // ... resto delle sezioni base ...
     }
   };
   ```

3. In `dashboard_ISO_CM/index.html`:
   - Aggiungi la voce sidebar:
     ```html
     <a class="nav-item" data-sec="auditISO" onclick="showSec('auditISO')">Audit</a>
     ```
   - Aggiungi il contenitore:
     ```html
     <div id="sec-auditISO" class="hidden"></div>
     ```
   - Aggiungi lo script dopo i kit JS:
     ```html
     <script src="js/section-audit.js"></script>
     ```

## Versioning

I file del kit hanno `?v=1` negli include per cache-busting. Quando il kit cambia,
bumpa la versione in tutti i template (es. `?v=2`) per forzare il refresh sui browser
degli utenti.

## File NON nel kit (vivono solo in `dashboard_FOR_CM/`)

FOR è "forkata" storicamente. Questi file vivono solo lì e NON vanno mai portati nel kit:
- `sections-corsi.js` — Corsi / Responsabili / Clienti / Avanzamento / Cessione (logica FOR)
- `section-spec-econ.js` — Specifica Economica gerarchica (tree drill-down)
- `section-wiki.js` — Wiki Q&A interattiva (potrebbe essere portata nel kit in futuro)
- `export-cessione.js` — Export per cessione del credito (FOR-only)
- `upload-config.js` — mapping Excel FOR (sarà generalizzato in Chat #3)
