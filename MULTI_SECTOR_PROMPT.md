# Piano espansione multi-settore — Dashboard Qualifica Group

> Documento generato il 2026-05-08, aggiornato il 2026-05-12 con la sezione
> "Governance del kit condiviso" — l'approccio operativo concordato dopo lo
> scaffolding multi-settore della Chat #1.
> La prossima chat di Claude Code dovrebbe partire da qui.

## Stato attuale del progetto

Repo GitHub: `https://github.com/aienricoferrante-2026/QG.git`
Online: `https://aienricoferrante-2026.github.io/QG/`
Cartella locale: `/Users/enricoferrante/Desktop/STW/`

### Cosa esiste già

**Settore Formazione (`dashboard_FOR_CM/`)** — completo, in produzione, 1.346 commesse (agg. 11-05-26)

**Hub multi-settore (`index.html` root)** — completato in Chat #1:
- Card per gli 11 settori (4 nuovi ATTIVI, FOR/ISO/SOA legacy ATTIVI, 5 IN ARRIVO disabled)
- KPI globali consolidati (Commesse, Ricavi, MOL, Esposizione, % Incasso)
- Toggle tema scuro/chiaro

**4 dashboard "base" — completate in Chat #1:**
| Settore | Commesse | Cartella |
|---|---:|---|
| SIC Sicurezza Lavoro | 2.613 | `dashboard_SIC_CM/` |
| AVV Avvalimenti | 328 | `dashboard_AVV_CM/` |
| FIA Finanza Agevolata | 276 | `dashboard_FIA_CM/` |
| IST Istituti | 52 | `dashboard_IST_CM/` |

**Kit condiviso (`shared/dashboard-core/`)** — creato in Chat #1:
- 15 file JS + 4 CSS + index-template.html
- Riusato dalle 4 dashboard base via include `../shared/dashboard-core/...`
- Ogni dashboard base ha `config.js` con `window.SECTOR_CONFIG`
- README in `shared/dashboard-core/README.md`

**Tooling (`tools/`)** — creato in Chat #1:
- `convert_sectors.py` — Excel → JSON (mapping comune dei 45 campi)
- `build_sector_dashboards.py` — genera index.html + config.js dal template
- `sector_counts.json` — output di convert

**Settori in produzione FOR** continua a usare:
- 8 filtri MultiSelect, Filtro Periodo, Quick Filters
- Sidebar in 5 gruppi task-based (Overview / Finanza / Analytics / Stato / Aiuto)
- Wiki Q&A interattiva (23 voci cercabili)
- Mini-dashboard Partner per Sede (38 partner al 12-05-26)
- GitHub Action `update-partners.yml` (auto-rigenera dati partner)

**Auth**
- Login admin: `formazione@qualificagroup.it` / `qualifica2026!`
- SHA-256 hardcoded (barriera client-side, non sicurezza vera)
- Unificato: `auth.js` del kit condiviso legge `SECTOR_CONFIG.adminEmail`

## Architettura file

```
index.html                            (HUB multi-settore con KPI globali)
.nojekyll                             (serve i file con _ iniziale su Pages)
MULTI_SECTOR_PROMPT.md                (questo file)

dashboard_FOR_CM/                     ★ FORMAZIONE — in produzione, NON toccare
├── index.html, css/, js/, data/      (codice suo, autonomo dal kit)

dashboard_SIC_CM/  dashboard_AVV_CM/  ← BU "base", usano il kit
dashboard_FIA_CM/  dashboard_IST_CM/
├── config.js                         (specificità BU: code/label/icon/dataFile)
├── index.html                        (generato dal template, sidebar adattata)
└── data/commesse_<sec>.json          (output di tools/convert_sectors.py)

shared/dashboard-core/                ☆ KIT CONDIVISO multi-settore
├── README.md                         (cos'è, come si usa, governance)
├── index-template.html               (template HTML)
├── css/   variables, layout, tables, modal
└── js/    theme, auth, utils, tables, charts, drilldown, filters, kpis,
           sections-overview, sections-finance, section-econfin,
           section-analisi-incassi, section-link-partner, info-tooltip, app

shared/                               (file usati anche da FOR — NON cambiare)
├── multiselect.js, upload.js, upload.css

partners/                             (mini-dashboard Sede — solo FOR per ora)

tools/
├── convert_sectors.py                (Excel → JSON)
├── build_sector_dashboards.py        (template → index.html + config.js)
└── sector_counts.json
```

## ⛔ REGOLE INVIOLABILI — NON FARE

**La dashboard `dashboard_FOR_CM/` (Formazione) è in produzione.**
L'utente la usa attivamente su https://aienricoferrante-2026.github.io/QG/dashboard_FOR_CM/

REGOLE:
1. ❌ NON modificare nessun file dentro `dashboard_FOR_CM/`
2. ❌ NON modificare nessun file dentro `partners/` né `partners/_generate.py`
3. ❌ NON modificare i file in `shared/` usati da FOR (`multiselect.js`, `upload.js`, `upload.css`)
4. ❌ NON eseguire `partners/_generate.py` (genererebbe nuovi token, l'utente ha già mandato i link)
5. ❌ NON modificare `.nojekyll` o `index.html` della root SE rompe la dashboard FOR

**Se rompi FOR, l'utente perde il tool che usa quotidianamente. Sii cauto.**

## 🛡️ Governance del kit condiviso `shared/dashboard-core/`

**Principio**: massima standardizzazione (riuso del kit) + libertà di specificità per ogni BU.

### Cosa fa il kit
- Sezioni "universali" che servono a TUTTE le BU base: Executive Summary, Ricavi & MOL,
  Econ. & Finanziario, Analisi Incassi, Sedi, Clienti, Responsabili, Avanzamento, Alert,
  Link Partner.
- Tema, auth, filtri, KPI, drill-down, charts, tabelle.
- Legge `window.SECTOR_CONFIG` per personalizzare label, file dati, sezioni attive, ecc.

### Cosa NON fa il kit
- Sezioni o campi specifici di una BU (es. "Stato Corso" di FOR, "Ente certificatore" di ISO,
  "CIG" di GAR). Queste vivono nella cartella della BU come file `js/section-<nome>.js`.

### Quando una BU chiede una modifica che impatta il kit — 3 casi

**Caso 1 — La modifica è utile a tutte le BU** → si applica al kit.
Esempio: aggiungere un nuovo Quick Filter "Insoluti > 90 giorni" che ha senso ovunque.
Tutte le 4 dashboard base ne beneficiano automaticamente alla prima ricarica.

**Caso 2 — Serve solo a una BU** → "fork interno" della BU.
La BU si copia il file dal kit dentro la sua cartella (`dashboard_<BU>_CM/js/<file>.js`)
e lo modifica lì. L'`index.html` di quella BU sostituisce l'include del kit con il file locale.
Le altre BU restano sul kit, intoccate.
Esempio: ISO vuole un grafico "Distribuzione audit per Ente" sostituendo la donut Status.

**Caso 3 — La modifica rompe altre BU** → si rifiuta, si trova un compromesso (Caso 2),
o si rifa il kit in modo non-breaking (es. nuova opzione opzionale via `SECTOR_CONFIG`).

### Regola pratica
Prima di toccare un file in `shared/dashboard-core/`:
> "Questa modifica ha senso per **TUTTE** le BU base che usano il kit?"
- Sì → modifica al kit
- No → fork interno alla BU che la richiede

FOR è un caso storico del Caso 2: ha tutti i suoi file in `dashboard_FOR_CM/js/`
(`section-spec-econ.js`, `sections-corsi.js`, `export-cessione.js`, `section-wiki.js`, ecc.)
perché è la BU "ricca" di feature uniche. Non usa il kit, vive di codice suo. Va bene così.

## Da fare nelle prossime chat

### Chat #2 — Mini-dashboard partner per le 4 BU base

Stato attuale: `partners/` esiste solo per FOR.

Obiettivi:
1. Generalizzare `partners/_generate.py` per accettare `--sector SIC` come parametro
2. Output in `partners_<sec>/` (uno per ogni BU)
3. Aggiornare `section-link-partner.js` del kit per leggere il path corretto via `SECTOR_CONFIG.partnersJsonUrl` (è già pronto, va solo testato)
4. GitHub Action `update-partners.yml` esteso per riconoscere quando cambia un JSON di una BU base

### Chat #3 — Upload Excel online generalizzato

Stato attuale: `dashboard_FOR_CM/js/upload-config.js` è specifico per FOR.

Obiettivi:
1. `shared/dashboard-core/js/upload-config.js` generico — legge `SECTOR_CONFIG.uploadConfig`
2. Ogni BU dichiara nel suo `config.js` il mapping Excel → JSON specifico
3. Bottone "Carica Excel" nella sidebar di ogni dashboard base

### Chat #4+ — Settori complessi (uno per chat)

Ognuno ha campi specifici da modellare:
- **ISO** (6.185 commesse, 67 campi): Ente, Scopo proposto/uscita, Data Verifica, Stato Pagamento, Insoluti
- **GAR** (325, 71 campi): Protocollo, CIG, Importo Gara, scadenze, Categoria/Classe Servizi
- **SOA** (613, 57 campi): Consorzio, Firma Contratto, Aggiornamento Settimanale
- **APL_PAL** (1.415, 60 campi): Visure, GOL, CV, Accompagnamento
- **APL_RES** (154, 54 campi): Profilo, Requisiti, Variazione Ricerca
- **GDPR** (695, 50 campi): Stato Pagamento, Insoluti, Accordo Pagamenti

**Per ognuno: applicare Caso 2 della governance** → la BU usa il kit + file
`js/section-<specifico>.js` nella sua cartella per le sezioni uniche.

## Decisioni di design (NON cambiare)

- **Sidebar e header SEMPRE scuri** (anche in tema chiaro): confermato dall'utente
- **Theme toggle**: solo icona ☀️/🌙 tonda 32px, niente testo
- **Login admin**: barriera client-side
- **Token partner**: formato `REG_CITTA_random` (es. `CAM_AVERSA_YlAX0W1ofxS2`)
- **Email admin**: `formazione@qualificagroup.it` (default, override per BU)
- **"Da Incassare"**: SEMPRE `Math.max(0, Ricavi - GiàIncassato)` (mai dal campo Excel)
- **Quick filter "anno corrente"**: legge `new Date().getFullYear()` dinamicamente

## Workflow di pubblicazione

L'utente lavora su Chrome con account `aienricoferrante@gmail.com`. Il push su `main`
è bloccato dal sandbox.

1. Claude lavora nel worktree
2. `git commit` + `git push origin <branch>` dal worktree
3. Claude dà all'utente il link `https://github.com/aienricoferrante-2026/QG/compare/main...<branch>?expand=1`
4. L'utente apre il link nel suo Chrome, crea PR e mergia
5. Verifica online via `curl` (non `open` — apre nel profilo Chrome sbagliato)

## Limitazioni note

- **Sandbox preview server**: il preview integrato di Claude Code non vede i file
  scritti da Claude Code. Usare `python3 -m http.server` + `curl` per verifica.
- **Cache browser**: dopo ogni merge, ⌘+Shift+R per vedere le modifiche.

## Come iniziare la prossima chat

Apri Claude Code in `/Users/enricoferrante/Desktop/STW/` e di':

> **"Leggi MULTI_SECTOR_PROMPT.md e iniziamo la Chat #N."**

(dove N è il numero della chat che vuoi affrontare, vedi "Da fare nelle prossime chat").
