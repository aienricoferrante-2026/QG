# Tappa 2 — Sezione "Esplora" (vista unica multi-livello)

> Spec definitiva concordata in chat. La prossima chat di Claude Code deve
> leggere questo file + `MULTI_SECTOR_PROMPT.md` (per il contesto kit) e
> implementare.
> Data spec: 2026-05-13.

## Obiettivo

Una **sola** nuova sezione `Esplora` per ciascuna BU sul kit, che sostituisce
e assorbe **Sedi**, **Clienti**, **Responsabili** e **Performance (Tappa 1)**.
È il "coltellino svizzero" analitico della BU: l'utente sceglie le dimensioni
e l'ordine, e ottiene un albero multi-livello con KPI in testa, chart, tabella
sortable, drill-down modale sulla foglia ed export Excel.

Pattern di riferimento: `dashboard_FOR_CM/js/section-spec-econ.js` (vedi
screenshot allegato in chat). Caso 1 della governance: il file vive in
`shared/dashboard-core/js/section-explore*.js`.

## Cosa sostituisce nella sidebar

Per OGNI BU sul kit (SIC, AVV, FIA, IST, SOA):

**Prima** (oggi):
```
Anagrafiche · Responsabili · Clienti · Sedi          ← rimossi tutti
📊 Analytics BU · Performance                         ← rimossa
```

**Dopo**:
```
🔍 Esplora · Esplora
```

Le funzioni `renderSedi`, `renderClienti`, `renderResponsabili`,
`renderPerformance` restano nel kit per **retrocompatibilità** del drill-down
(i clickField `sedeNorm`, `cliente`, `responsabile`, `agente`, `segnalatore`
continuano a funzionare) e per **FOR** che non usa il kit.

## Decisioni di design (CONFERMATE — non riaprire)

1. **Una sezione, non quattro**. Esplora include tutto ciò che facevano
   Sedi/Clienti/Responsabili/Performance.
2. **Gerarchia scelta dall'utente**: 3 dropdown "Livello 1 → Livello 2 → Livello 3".
   Il 4° livello implicito è la singola commessa (visibile via drill-down).
3. **Metrica primaria scelta dall'utente**: pilota la colonna evidenziata,
   l'ordinamento di default e la barra chart top N. Le altre metriche
   standard (Ricavi/Costi/MOL/Margine/Incassato/%Inc) sono SEMPRE in tabella.
4. **Confronto periodi** (eredità Tappa 1): Nessuno · vs Periodo prec ·
   vs Anno prec · A vs B custom. Quando attivo, appende 4 colonne (A · B · Δ · Δ%).
5. **N/D**: record con valore vuoto raggruppati come "N/D", mai esclusi.
6. **Preset rapidi**: chip cliccabili che pre-impostano gerarchia+metrica
   per ricreare con un click le vecchie viste.
7. **Preferenze utente in localStorage** chiave `qg_explore_<BU>`.
8. **Quick filter "Solo in lavorazione" sticky** introdotto in Tappa 1 RESTA
   invariato (vive in `filters.js`, non c'entra con questa tappa).
9. **Performance Tappa 1 viene assorbita, non buttata**: il codice di
   `section-performance*.js` viene migrato in `section-explore-metrics.js`
   per le funzioni metrica/confronto/format, poi i due file Performance
   vengono **cancellati**.

## Dimensioni disponibili (dropdown gerarchia)

| ID | Label UI | Campo dati / logica |
|---|---|---|
| `(nessuno)` | — | livello disattivato |
| `societa` | Società | `c.societa` |
| `regione` | Regione | `c.regione` |
| `sedeNorm` | Sede | `c.sedeNorm \|\| c.sedeOp` |
| `cliente` | Cliente | `c.cliente` |
| `responsabile` | Tecnico | `c.responsabile` |
| `agente` | Commerciale | `c.agente` |
| `segnalatore` | Segnalatore | `c.segnalatore` |
| `status` | Status | `c.status` |
| `statoLav` | Stato Lavorazione | `c.statoLav` |
| `statusXLav` | Status × Stato Lav. | virtuale: `c.status + ' · ' + c.statoLav` |
| `anno` | Anno | virtuale: anno di `dataInizio \|\| dataPianInizio` |
| `mese` | Mese | virtuale: `YYYY-MM` di `dataInizio \|\| dataPianInizio` |
| `funzione` | Funzione | `c.funzione` |

Default L1 = `societa`, L2 = `(nessuno)`, L3 = `(nessuno)`.
Validazione: la stessa dimensione non può essere scelta su due livelli
(filtra le opzioni dei dropdown successivi).

## Metriche disponibili (dropdown "Metrica primaria")

Tutte ereditate da Performance Tappa 1, più le anagrafiche di Sedi/Clienti/Resp:

| ID | Label | Calcolo |
|---|---|---|
| `ricavi` (default) | Ricavi (€) | `Σ consulenza` |
| `costi` | Costi (€) | `Σ costi` |
| `mol` | MOL (€) | `Σ mol` |
| `margine` | Margine % | `Σmol / Σconsulenza` sul nodo |
| `incassato` | Incassato (€) | `Σ giaIncassato` |
| `pctInc` | % Incasso | `Σincassato / Σconsulenza` sul nodo |
| `daIncassare` | Da Incassare (€) | `max(0, Σconsulenza - Σincassato)` |
| `count` | Commesse (n.) | `items.length` |
| `wipN` | WIP (numero) | `count(open)` |
| `wipE` | WIP (€) | `Σ consulenza su open` |
| `outN` | Output (numero) | `count(closed)` |
| `outE` | Output (€) | `Σ consulenza su closed` |
| `throughput` | Throughput (chiusure/mese) | media mobile come Perf T1 |
| `backlog` | Backlog >60gg | `count(open with age>60gg)` |
| `avanzMedio` | Avanz. medio % | media pesata su consulenza |

## Controlli inline (sopra al chart, in un riquadro)

```
┌─ Esplora · [BU] ─────────────────────────────────────────────────┐
│ [PRESET RAPIDI] (riga di chip cliccabili — vedi sotto)            │
├───────────────────────────────────────────────────────────────────┤
│ Livello 1: [▼ Società]  →  Livello 2: [▼ Regione]  →             │
│ Livello 3: [▼ (nessuno)]                                          │
│ Metrica: [▼ Ricavi (€)]   Confronto: [▼ Nessuno]                  │
│ (in mode "Custom A vs B" appaiono 2 input: A=YYYY/YYYY-Qx/YYYY-Mxx)│
└───────────────────────────────────────────────────────────────────┘
```

## Preset rapidi (chip che pre-impostano dimensioni + metrica)

| Chip | L1 | L2 | L3 | Metrica |
|---|---|---|---|---|
| 📍 Sedi | sedeNorm | — | — | ricavi |
| 👥 Clienti | cliente | — | — | ricavi |
| 🛠️ Tecnico WIP | responsabile | — | — | wipN |
| 💼 Commerciale Output € | agente | — | — | outE |
| 🤝 Segnalatore Incassato | segnalatore | — | — | incassato |
| 🏢 Soc → Reg → Cliente | societa | regione | cliente | ricavi |
| 🌍 Soc → Reg → Sede | societa | regione | sedeNorm | ricavi |
| 🚦 Stato × Lav | statusXLav | — | — | count |
| 📅 Anno → Mese | anno | mese | — | outN |

I preset **scrivono nello stato** e ridisegnano. L'utente può poi affinare i
dropdown manualmente — la chip diventa "non più attiva" se diverge.

## Visualizzazione

```
┌─────────────────────────────────────────────────────────────────┐
│ Titolo: Esplora · [BU]                                           │
│ Subtitle: Vista unica multi-livello.                             │
├─────────────────────────────────────────────────────────────────┤
│ [Preset rapidi]                                                  │
├─────────────────────────────────────────────────────────────────┤
│ [Controlli: L1/L2/L3, Metrica, Confronto]                        │
├─────────────────────────────────────────────────────────────────┤
│ [KPI strip · 4 mini-KPI]                                         │
│  Totale metrica · Top L1 · % N/D L1 · Δ vs confronto (se attivo)│
├─────────────────────────────────────────────────────────────────┤
│ [CHART] Bar top N del Livello 1 sulla metrica primaria.          │
│         In confronto: barre affiancate A vs B.                   │
│         Se L1 = anno/mese: line chart trend.                     │
├─────────────────────────────────────────────────────────────────┤
│ [TREE TABLE multi-livello]                                       │
│  Colonne fisse (ogni nodo):                                      │
│   Dimensione · N · METRICA (bold) · Ricavi · Costi · MOL ·       │
│   Margine % · Incassato · % Inc.                                 │
│  In confronto: + A · B · Δ · Δ%                                  │
│  Comportamento:                                                  │
│   - L1 espandibile a L2 (se L2 ≠ nessuno)                        │
│   - L2 espandibile a L3 (se L3 ≠ nessuno)                        │
│   - L3 espandibile alle singole commesse (riga compatta) OPPURE  │
│     un bottone "Apri n commesse" che lancia il modale drill-down │
│     del kit (più scalabile per nodi grandi)                      │
│   - Totale generale in tfoot                                     │
├─────────────────────────────────────────────────────────────────┤
│ [Bottoni export]                                                 │
│  · Esporta vista (aggregato, .xlsx)                              │
│  · Esporta commesse filtrate (flat, .xlsx) — stile Cessione      │
└─────────────────────────────────────────────────────────────────┘
```

Per Tappa 2 export Excel = **CSV scaricato** (semplice, no librerie). Il
ribbon dice "Esporta CSV" e il file ha BOM UTF-8 + `;` per Excel italiano,
coerente con `exportMCSV` in `drilldown.js`.

## Drill-down sulle foglie

- Riga commessa nella tree table → click → modale standard (riusa
  `drillDownItems(title, items)` di `drilldown.js`).
- Nodo L1/L2/L3 con tasto destro o icona dedicata → "Apri n commesse"
  → modale con il sottoinsieme di quel nodo (= `drillDownItems`).
- Modale standard del kit fornisce già: filtri locali, group-by chips,
  search, KPI strip, Qnet button, CSV export per il sottoinsieme.

## Sort, search, paginazione

- Click su intestazione colonna ordina (riusa `sortTbl` di `tables.js`).
  L'ordinamento avviene **al livello visibile** (es. ordina i nodi L1 per
  Ricavi, gli L2 dentro restano nell'ordine originale fino a espansione).
- Search box sopra la tabella filtra **client-side** sui label dei nodi
  (case-insensitive). Non filtra le commesse — per quello c'è il drill modale.
- Niente paginazione sulla tree table: l'utente vede solo L1 + livelli
  espansi (raramente più di 50 righe visibili contemporaneamente).

## Sidebar (nuova struttura)

```html
<div class="nav-group">
  <div class="nav-group-label">Overview</div>
  <a data-sec="executive">Executive Summary</a>
  <a data-sec="ricavi">Ricavi & MOL</a>
  <a data-sec="econFin">Econ. & Finanziario</a>
  <a data-sec="analisiIncassi">Analisi Incassi</a>
</div>
<div class="nav-group">
  <div class="nav-group-label">🔍 Esplora</div>
  <a data-sec="explore">Esplora</a>
</div>
<div class="nav-group">
  <div class="nav-group-label">Stato</div>
  <a data-sec="avanzamento">Avanzamento</a>
  <a data-sec="alert">Alert</a>
</div>
<div class="nav-group">
  <div class="nav-group-label">Admin</div>
  <a data-sec="linkPartner">Link Partner</a>
</div>
```

Per SOA: aggiungere la voce `explore` mantenendo i gruppi Caso 2
(SOA Attestanti, Enti Cert. 9001, Consorzio, Firma Contratto, Agg. Sett.).
Per AVV: mantenere la voce `avvalimenti`.
Niente più "Anagrafiche", "📊 Analytics BU" come gruppi.

## File da creare / modificare

| File | Azione | Note |
|---|---|---|
| `shared/dashboard-core/js/section-explore.js` | NEW | Stato + controlli + KPI strip + dispatcher. Target ~250 righe. |
| `shared/dashboard-core/js/section-explore-tree.js` | NEW | Tree builder + render + chart. Target ~250 righe. |
| `shared/dashboard-core/js/section-explore-metrics.js` | NEW | Migrato da `section-performance.js`: dimensioni getter, metriche, confronto periodi A/B, format. Target ~200 righe. |
| `shared/dashboard-core/js/section-performance.js` | DELETE | Assorbita. |
| `shared/dashboard-core/js/section-performance-charts.js` | DELETE | Assorbita. |
| `shared/dashboard-core/js/app.js` | EDIT | Rimuovi `performance` da `SECTIONS_DEFAULT`. Aggiungi `explore`. (Le voci `responsabili`/`sedi`/`clienti` restano: drill-down compat.) |
| `shared/dashboard-core/index-template.html` | EDIT | Riformula sidebar come sopra. Rimuovi `sec-performance`. Aggiungi `<div id="sec-explore" class="hidden"></div>`. Aggiorna `<script>` (-2 file performance, +3 file explore). |
| `dashboard_{SIC,AVV,FIA,IST,SOA}_CM/index.html` | EDIT | Stessa cosa del template. Per SOA aggiungere `explore: () => renderExplore()` in `sections` di config.js. |
| `dashboard_{SIC,AVV,FIA,IST,SOA}_CM/data/targets.json` | KEEP | Riusato da Explore quando metrica = `wipN/outE/incassato/ricavi`. |
| `dashboard_{SIC,AVV,FIA,IST,SOA}_CM/config.js` | EDIT (SOA only) | Aggiungere `explore` in `sections`. Le altre 4 BU non hanno override custom di `sections` quindi nessuna modifica. |

NOT TOUCH:
- `dashboard_FOR_CM/` — non usa il kit, mantiene Sedi/Clienti/Responsabili e il suo spec-econ.
- `dashboard/` (ISO legacy) — non tocchiamo.
- `dashboard_*_LEGACY/` — non tocchiamo.
- `filters.js` (quick filter sticky di Tappa 1) — invariato.

## Migrazione da Tappa 1 (Performance) — checklist

1. Sposta in `section-explore-metrics.js`:
   - Costanti `PERF_METRICS`, `PERF_COMPARE` (rinominate `EXPLORE_METRICS`, `EXPLORE_COMPARE` e ampliate)
   - Funzione `_perfMetric(items, metric)` → `_exploreMetric`
   - `_perfPeriods()`, `_perfBase()`, `_perfInRange()`, `_perfParsePeriod()` → `_explorePeriods`, ecc.
   - `_perfParseDate`, `_perfStart`, `_perfAge` → idem
   - `_perfFmt` → `_exploreFmt`
2. Cancella `section-performance.js` e `section-performance-charts.js`.
3. Rimuovi i `<script>` di performance dai 5 index.html e dal template.
4. Rimuovi `performance: () => renderPerformance()` da `app.js` e da
   `dashboard_SOA_CM/config.js`.
5. Rimuovi i `<div id="sec-performance">` dai 6 file HTML.
6. Lascia che le chiavi `localStorage.qg_perf_<BU>` diventino orfane (innocue).

## Test plan

1. Locale via `python3 -m http.server` + curl smoke su tutti gli asset (200).
2. `node --check` su tutti i `.js` modificati.
3. Apri SOA in Chrome (post-merge), ⌘+Shift+R, vai a 🔍 Esplora:
   - Default Soc·—·—·Ricavi: vedi top N per Società, KPI strip, tabella piatta.
   - Espandi un Società → vedi se L2 era selezionata appare.
   - Cambia L2=regione, L3=cliente: 3 livelli, espansione su entrambi.
   - Click su preset "Tecnico WIP" → si trasforma in vista Performance T1.
   - Click su preset "Anno→Mese" + Metrica=outN → line chart.
   - Confronto "Custom A vs B" con A=2026-Q1, B=2025-Q1 → 4 colonne extra.
   - Click su nodo L3 (o foglia) → modale drill-down standard del kit.
   - Esporta CSV vista aggregata e CSV commesse filtrate.
4. Ripeti su SIC (BU base) per confermare cross-BU.
5. Verifica che il drill-down delle alert (es. dal modale Executive) atterri
   ancora sui campi `sedeNorm/cliente/responsabile` correttamente — non
   dovrebbe essere toccato.

## Cosa NON entra in Tappa 2 (scope-creep)

- 4° livello esplicito (più di 3 dimensioni): per ora L4 implicito = commessa.
- Export Excel "vero" (.xlsx via libreria): per Tappa 2 basta CSV.
- Confronto > 2 periodi (A vs B vs C): rimandato.
- Vista cross-settore sull'hub: Tappa successiva.
- Forecast deterministico / aging credito / DSO: tappe successive.
- Cessione-Credito-style export per BU non-FOR: se richiesto, Caso 2 della
  BU (non parte di Esplora).
- Salvataggio "viste preferite" custom (oltre ai preset built-in): Tappa successiva.

## Riferimenti memoria utente

La nuova chat ha automaticamente in memoria:
- Terminologia: `responsabile` = Tecnico, `agente` = Commerciale, `segnalatore` = Segnalatore
- Preferenza deploy: sempre GitHub, niente localhost (push + link compare)
- Regole sviluppo: max 300 righe/file, separazione HTML/CSS/JS/Data, tabelle sortable, drill-down
- Pattern del kit condiviso e regola dei 3 casi

## Come iniziare la prossima chat

Apri Claude Code in `/Users/enricoferrante/Desktop/STW/` e di':

> **"Leggi TAPPA2_EXPLORA_SPEC.md e MULTI_SECTOR_PROMPT.md e iniziamo la Tappa 2."**
