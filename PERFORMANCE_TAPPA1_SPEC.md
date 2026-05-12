# Tappa 1 — Sezione "Performance" (Analytics BU)

> Spec definitiva concordata in chat. La prossima chat di Claude Code deve
> leggere questo file + `MULTI_SECTOR_PROMPT.md` e implementare.
> Data spec: 2026-05-13.

## Obiettivo

Una sola nuova sezione `Performance` dentro un nuovo gruppo sidebar **"📊 Analytics BU"**,
applicata a tutte le BU sul kit (SIC, AVV, FIA, IST, SOA). Caso 1 della governance:
il file vive in `shared/dashboard-core/js/section-performance.js`.

Sostituisce concettualmente la vecchia voce "Responsabili" del gruppo Analytics, che
diventa un sotto-caso di Performance (Analizza per: Tecnico, Metrica: Output €).

## Decisioni di design (CONFERMATE — non riaprire)

1. **4 segmenti** nella stessa sezione, swap via dropdown:
   - Tecnico (campo dati: `responsabile`)
   - Commerciale (campo dati: `agente`)
   - Segnalatore (campo dati: `segnalatore`)
   - Totale BU (nessun raggruppamento → linea/barra singola, benchmark)
2. **Naming UI**: usa i nomi di business (Tecnico/Commerciale/Segnalatore), non
   i nomi tecnici dei campi.
3. **N/D**: record con valore vuoto vengono raggruppati come "N/D", non esclusi.
4. **No probabilità di chiusura** — qualunque forecast è deterministico.
5. **"Settore in generale" = dentro la BU corrente** (non cross-settore). Cross-settore
   in futuro sull'hub, fuori da questa tappa.
6. **Preferenze utente in localStorage** (la tua ultima scelta torna al prossimo refresh).
7. **Quick filter "Solo in lavorazione" sticky** (vedi sotto, dettaglio dedicato).

## Controlli inline (4 dropdown sopra al chart)

### Dropdown 1 — "Analizza per"
| Valore | Raggruppa su campo |
|---|---|
| Tecnico (default) | `responsabile` |
| Commerciale | `agente` |
| Segnalatore | `segnalatore` |
| Totale BU | nessuno (singola serie) |

### Dropdown 2 — "Metrica"
| Valore | Calcolo |
|---|---|
| WIP (numero) — default | `count(open commesse)` |
| WIP (valore €) | `Σ consulenza su open` |
| Output (numero) | `count(closed commesse del periodo)` |
| Output (valore €) | `Σ consulenza su closed periodo` |
| Throughput (chiusure/mese) | media mobile 3 mesi sulle chiusure |
| Backlog >60gg | count open con età >60gg dalla `dataAssegnazione` o `dataPianInizio` |
| Margine % | MOL / Ricavi sulle chiuse del periodo |
| % Incasso | Incassato / Ricavi sulle chiuse del periodo |
| Incassato € | `Σ giaIncassato` (utile per vedere quanto le commesse di X hanno incassato) |

### Dropdown 3 — "Aggregazione tempo"
Settimana / Mese (default) / Trimestre / Anno. Cambia il binning del trend chart.

### Dropdown 4 — "Confronto"
| Valore | Comportamento |
|---|---|
| Nessuno (default) | mostra solo il periodo filtrato |
| vs Periodo precedente | A = filtro corrente, B = stesso intervallo subito prima |
| vs Anno precedente | stesso mese/trim/anno dell'anno scorso |
| **Periodo A vs Periodo B (custom)** | due selettori sotto: A=[anno+intervallo], B=[anno+intervallo] |

Nel mode "custom" appaiono due selettori sotto la riga principale:
```
Periodo A: [Anno ▼] [Mese / Trimestre / Anno intero / Range custom ▼]
Periodo B: [Anno ▼] [Mese / Trimestre / Anno intero / Range custom ▼]
```

## Visualizzazione

```
┌─────────────────────────────────────────────────────────────────┐
│ KPI strip: 4 mini-KPI (Top performer, Δ vs precedente, totale)  │
├─────────────────────────────────────────────────────────────────┤
│ [CHART 1] Bar chart top N (default 15) per il segmento scelto   │
│           In mode confronto: barre affiancate A vs B            │
├─────────────────────────────────────────────────────────────────┤
│ [CHART 2] Trend temporale (lineare) — top N + linea "Totale BU" │
│           sempre visibile come benchmark                        │
│           In mode confronto: A linea piena, B linea tratteggiata│
├─────────────────────────────────────────────────────────────────┤
│ [TABELLA scorecard] tutte le persone, sortable, drill-down      │
│  Persona | WIP n | WIP € | Out n | Out € | Velocità | Backlog   │
│         | Incassato | Margine % | % Incasso                     │
│  In mode confronto: aggiunge colonne A, B, Δ assoluto, Δ %      │
└─────────────────────────────────────────────────────────────────┘
```

## Targets (file `data/targets.json` per BU)

Struttura:
```json
{
  "tecnico": { "Mario Rossi": 12000, "Giulia Bianchi": 9500 },
  "commerciale": { "Luigi Verdi": 25000 },
  "segnalatore": { "Studio XYZ": 5000 }
}
```

Per Tappa 1 ci basta creare il **file vuoto** con scheletro
`{"tecnico":{},"commerciale":{},"segnalatore":{}}` in ogni BU.
L'utente lo popolerà nel tempo. Quando popolato:
- Aggiungi colonna "Target" e "% Target" nella tabella scorecard
- Alert visivo (cella rossa) se sotto-obiettivo

## Quick filter "Solo in lavorazione" sticky

- **Definizione**: `statoLav` contiene letteralmente "Lavorazione" (case-insensitive).
  Non `isOpen` (più stretto della logica attuale).
- **Sticky behavior**:
  - Al PRIMO accesso (nessuna chiave in `localStorage`): ON.
  - Salva la scelta utente in `localStorage` (`qg_quickfilter_<BU>`).
  - Al successivo refresh rispetta la scelta.
- Per le altre quick filter (year, noFirma, ecc.) niente cambio.

## Cambi alla sidebar

Per OGNI BU sul kit (SIC, AVV, FIA, IST, SOA):
```html
<div class="nav-group">
  <div class="nav-group-label">📊 Analytics BU</div>
  <a class="nav-item" data-sec="performance" onclick="showSec('performance')">
    <span class="nav-icon">…</span>Performance
  </a>
  <!-- futuro: Forecast, Funnel -->
</div>
```

Rimuovi la vecchia voce "Responsabili" dalla sidebar (la sostituisce Performance
con `Analizza per: Tecnico`). Mantieni la funzione `renderResponsabili` per
retrocompatibilità del drill-down e per FOR.

## File da creare/modificare

| File | Azione | Note |
|---|---|---|
| `shared/dashboard-core/js/section-performance.js` | NEW | Caso 1, ~280 righe. Tieni il singolo file sotto 300 righe (regola progetto). Se serve più, splitta in `section-performance.js` + `section-performance-charts.js`. |
| `shared/dashboard-core/js/app.js` | EDIT | Aggiungi `performance` in `SECTIONS_DEFAULT`. |
| `shared/dashboard-core/js/filters.js` | EDIT | Sticky quick filter (leggi/scrivi `localStorage`) all'`initQuickFilters`. |
| `shared/dashboard-core/index-template.html` | EDIT | Sidebar: nuovo gruppo "📊 Analytics BU" con voce "Performance". Rimuovi voce "Responsabili". Aggiungi `<div id="sec-performance" class="hidden"></div>`. |
| `dashboard_SIC_CM/index.html` | EDIT | Stessa modifica del template. |
| `dashboard_AVV_CM/index.html` | EDIT | Stessa modifica. |
| `dashboard_FIA_CM/index.html` | EDIT | Stessa modifica. |
| `dashboard_IST_CM/index.html` | EDIT | Stessa modifica. |
| `dashboard_SOA_CM/index.html` | EDIT | Stessa modifica + script include per `section-performance.js`. |
| `dashboard_{SIC,AVV,FIA,IST,SOA}_CM/data/targets.json` | NEW | Scheletro vuoto `{"tecnico":{},"commerciale":{},"segnalatore":{}}` |
| `dashboard_{SIC,AVV,FIA,IST,SOA}_CM/config.js` | EDIT | Aggiungi `targetsFile: 'data/targets.json'` (opzionale, fetchato all'init). |

NOT TOUCH:
- `dashboard_FOR_CM/` — è forkata, non usa il kit. Continua a usare la sua "Responsabili".
- `dashboard/` (ISO legacy) — non tocchiamo.
- `dashboard_*_LEGACY/` — non tocchiamo.

## Test plan

1. Locale via `python3 -m http.server` + curl smoke su tutti gli asset (200).
2. Apri SOA su Chrome (post-merge) e verifica:
   - Vai a 📊 Analytics BU → Performance.
   - Default: Tecnico / WIP n / Mese / Nessuno → vedi top 15 + trend + tabella.
   - Swap dropdown → niente flicker, tutto si aggiorna.
   - Mode "Custom A vs B": A=Q1 2026, B=Q1 2025 → barre affiancate.
   - Quick filter "In lavorazione": ON di default. Disattivalo → al refresh resta off.
3. Ripeti su una BU base (SIC) per confermare che il kit funzioni cross-BU.

## Cosa NON entra in Tappa 1 (per evitare scope-creep)

- Wiki nel kit (Tappa 2)
- Switch chart-type nei chart esistenti (Tappa 3)
- Forecast deterministico run-rate (Tappa successiva)
- Aging credito / DSO (Tappa successiva)
- Funnel statoLav (Tappa successiva)
- Vista cross-settore sull'hub (Tappa successiva)
- Dashboard commerciale separata (futura — i commerciali stanno anche qui per ora)

## Riferimenti memoria utente

La nuova chat ha automaticamente in memoria:
- Terminologia: `responsabile` = Tecnico, `agente` = Commerciale, `segnalatore` = Segnalatore
  (vedi `project_terminologia_commesse.md`)
- Preferenza deploy: sempre GitHub, niente localhost (vedi `feedback_deploy_github.md`)
- AVV = Avvalimenti (vedi `project_avv_avvalimenti.md`)
- Regole sviluppo: max 300 righe/file, separazione HTML/CSS/JS/Data (vedi `dev_rules.md`)
