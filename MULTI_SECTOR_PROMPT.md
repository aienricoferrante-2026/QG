# Piano espansione multi-settore — Dashboard Qualifica Group

> Documento generato il 2026-05-08, aggiornato il 2026-05-12 dopo:
> - Chat #1: scaffolding multi-settore + kit condiviso + 4 BU base
> - Sezione "Governance del kit condiviso" (regola dei 3 casi)
> - Chat #4 ISO: dashboard ISO_CM con 2 sezioni Caso 2 (Enti, Audit)
> - Chat parallela SOA: dashboard SOA_CM con 5 sezioni Caso 2
> - Scaffolding base di GAR, APL_PAL, APL_RES, GDPR (4 nuove BU)
> - Fix terminologia: **AVV = Avvalimenti** (non Avvocati / Legale)
>
> La prossima chat di Claude Code dovrebbe partire da qui.

## Stato attuale del progetto

Repo GitHub: `https://github.com/aienricoferrante-2026/QG.git`
Online: `https://aienricoferrante-2026.github.io/QG/`
Cartella locale: `/Users/enricoferrante/Desktop/STW/`

### Cosa esiste già

**Settore Formazione (`dashboard_FOR_CM/`)** — completo, in produzione, 1.346 commesse (agg. 11-05-26)

**Hub multi-settore (`index.html` root)** — completato in Chat #1, aggiornato:
- Card per **11 settori, tutti ATTIVI** (FOR + ISO + 9 BU base sul kit)
- KPI globali consolidati su 10 settori = ~14.000 commesse, €45M ricavi
- Toggle tema scuro/chiaro
- Vecchia `dashboard/` (ISO legacy) e `dashboard_SOA_LEGACY/` non più linkate (rollback safety)

**Dashboard sul kit condiviso:**
| Settore | Commesse | Cartella | Stato |
|---|---:|---|---|
| **SIC Sicurezza Lavoro** | 2.613 | `dashboard_SIC_CM/` | **+ 1 sezione Caso 2** (Tipologie & Aggiornamenti) |
| **AVV Avvalimenti** | 328 | `dashboard_AVV_CM/` | **+ 1 sezione Caso 2** (Avvalimenti) |
| FIA Finanza Agevolata | 276 | `dashboard_FIA_CM/` | base (no Caso 2) |
| IST Istituti | 52 | `dashboard_IST_CM/` | base (no Caso 2) |
| **ISO Certificazioni** | 6.185 | `dashboard_ISO_CM/` | **+ 2 sezioni Caso 2** (Enti, Audit) |
| **SOA Attestazioni** | 613 | `dashboard_SOA_CM/` | **+ 5 sezioni Caso 2** (chat parallela) |
| **GAR Gare d'appalto** | 325 | `dashboard_GAR_CM/` | **+ 1 sezione Caso 2** (Gare) |
| **APL_PAL Politiche Attive** | 1.415 | `dashboard_APL_PAL_CM/` | **+ 1 sezione Caso 2** (GOL & Politiche Attive) |
| APL_RES PAL Risorse | 154 | `dashboard_APL_RES_CM/` | base (no Caso 2) |
| **GDPR Privacy** | 695 | `dashboard_GDPR_CM/` | **+ 1 sezione Caso 2** (Pagamenti) |

**Kit condiviso (`shared/dashboard-core/`)** — creato in Chat #1:
- 15 file JS + 4 CSS + index-template.html
- Riusato dalle 4 dashboard base via include `../shared/dashboard-core/...`
- Ogni dashboard base ha `config.js` con `window.SECTOR_CONFIG`
- README in `shared/dashboard-core/README.md`

**Tooling (`tools/`)** — creato in Chat #1, esteso in Chat #4 ISO e SOA:
- `convert_sectors.py` — Excel → JSON (45 campi comuni; merge a cascata
  con extra_fields.ALL e iso_parser.FIELD_MAP_EXTRA). `to_date_str`
  normalizza ISO `yyyy-mm-dd` e scarta placeholder `00-00-0000`.
- `extra_fields.py` — campi specifici SOA + GAR + APL_RES + GDPR
  (mapping, DATE_KEYS, NUMERIC_KEYS). Union `ALL` consumata da convert.
- `iso_parser.py` — parser Titolo ISO (Standard/Tipo Audit) + 22 campi
  ISO-specifici (`isoEnte`, `isoDataVerifica`, ecc.).
- `build_sector_dashboards.py` — genera index.html + config.js dal
  template. Supporta `custom_index: True` per BU che vogliono mantenere
  un index.html scritto a mano (ISO).
- `sector_counts.json` — output di convert.

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

dashboard_SIC_CM/  dashboard_AVV_CM/  ← 8 BU "base", usano il kit
dashboard_FIA_CM/  dashboard_IST_CM/
dashboard_GAR_CM/  dashboard_APL_PAL_CM/
dashboard_APL_RES_CM/  dashboard_GDPR_CM/
├── config.js                         (specificità BU: code/label/icon/dataFile)
├── index.html                        (generato dal template, sidebar adattata)
└── data/commesse_<sec>.json          (output di tools/convert_sectors.py)

dashboard_ISO_CM/  dashboard_SOA_CM/  ← 2 BU "Caso 2": kit + fork interni
├── config.js                         (con filters / extraSections custom)
├── index.html                        (SCRITTO A MANO, non rigenerato dal build)
├── js/section-<custom>.js            (sezioni specifiche della BU)
└── data/commesse_<sec>.json

dashboard/                            ISO legacy — non più linkata dall'HUB
dashboard_SOA_LEGACY/                 SOA legacy — non più linkata dall'HUB

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
├── convert_sectors.py                (Excel → JSON, 10 settori SECTORS)
├── extra_fields.py                   (campi SOA + GAR + APL_RES + GDPR)
├── iso_parser.py                     (parser Titolo + 22 campi ISO)
├── build_sector_dashboards.py        (template → index.html + config.js)
└── sector_counts.json
```

## ⛔ REGOLE INVIOLABILI — NON FARE

**La dashboard `dashboard_FOR_CM/` (Formazione) è in produzione.**
L'utente la usa attivamente su https://aienricoferrante-2026.github.io/QG/dashboard_FOR_CM/

REGOLE:
1. ⚠️ `dashboard_FOR_CM/js/auth.js` può essere modificato SOLO per allineare le
   credenziali allo schema Master+Sector delle altre dashboard. Per tutto il resto
   (UI, sezioni, dati) FOR resta intoccato (vedi sotto).
2. ❌ NON modificare gli altri file dentro `dashboard_FOR_CM/`
3. ❌ NON modificare nessun file dentro `partners/` né `partners/_generate.py`
4. ❌ NON modificare i file in `shared/` usati da FOR (`multiselect.js`, `upload.js`, `upload.css`)
5. ❌ NON eseguire `partners/_generate.py` (genererebbe nuovi token, l'utente ha già mandato i link)
6. ❌ NON modificare `.nojekyll` o `index.html` della root SE rompe la dashboard FOR

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

### Chat #2 — Mini-dashboard partner per le BU sul kit

Stato attuale: `partners/` esiste solo per FOR. Ora ci sono **10 BU sul
kit** (era 4 in origine) potenzialmente bisognose di link partner.

Obiettivi:
1. Generalizzare `partners/_generate.py` per accettare `--sector SIC` come parametro
2. Output in `partners_<sec>/` (uno per ogni BU)
3. Aggiornare `section-link-partner.js` del kit per leggere il path corretto via `SECTOR_CONFIG.partnersJsonUrl` (è già pronto, va solo testato)
4. GitHub Action `update-partners.yml` esteso per riconoscere quando cambia un JSON di una BU base
5. Decidere PRIMA con l'utente quali BU hanno davvero senso avere partner-link (probabilmente solo SIC/ISO/SOA dove i responsabili regionali sono distinti — APL_PAL/APL_RES/GDPR forse no)

### Chat #3 — Upload Excel online generalizzato

Stato attuale: `dashboard_FOR_CM/js/upload-config.js` è specifico per FOR.

Obiettivi:
1. `shared/dashboard-core/js/upload-config.js` generico — legge `SECTOR_CONFIG.uploadConfig`
2. Ogni BU dichiara nel suo `config.js` il mapping Excel → JSON specifico
3. Bottone "Carica Excel" nella sidebar di ogni dashboard base

### Chat #4+ — Sezioni Caso 2 per settori complessi (uno per chat)

**Già fatte** (campi mappati nel JSON, sezioni custom rilasciate):
- ✅ **ISO** (6.185): 5 sezioni — Enti, Audit, Stato Certificato,
  Pagamenti & Accordi, Scopo proposto vs uscita.
- ✅ **SOA** (613): 5 sezioni — Attestanti, Enti 9001, Consorzio,
  Firma Contratto, Aggiornamento Settimanale.
- ✅ **AVV Avvalimenti** (328): 1 sezione — Avvalimenti (Categoria
  SOA, Tipo, CIG, Anno estratti dal Titolo via `avv_parser.py`).
- ✅ **GDPR Privacy** (695): 1 sezione — Pagamenti & Accordi (pattern
  ISO Pagamenti riusato sui campi `gdprStatoPag` / `gdprAccordo`).
- ✅ **GAR Gare d'appalto** (325): 1 sezione — Gare (CIG, Ente,
  Data Scadenza, Importo, Esito; pipeline aperte/esitate/scadute).
  Copertura ~9% sui campi GAR (limite Excel, sezione lo dichiara).
- ✅ **SIC Sicurezza Lavoro** (2.613): 1 sezione — Tipologie &
  Aggiornamenti. Parser client-side che estrae 21 sigle dal Titolo
  (DVR, RSPP, RLS, ART37, FORM, PREP, APS, ADE, VISITE, HACCP, PLE,
  PIMUS, MULETTO, PES, GRU, DPI, SALDATORI, ALIMENT, TUTTA, 81/08)
  e il flag AGG (aggiornamento periodico). Aggregazione in 6
  macro-aree. Copertura: **86%** classificate.
- ✅ **APL_PAL Politiche Attive** (1.415): 1 sezione — GOL &
  Politiche Attive. APL_PAL è essenzialmente GOL (94%, 1.328 rec).
  Parser client-side aggrega le 23 fasi distinte di `statoLav`
  (PAL_1.x → 2.x → 3.x → 4.x → TIROCINI) in un funnel a 6 step
  (Avvio / Documenti / Pagamento / Concluso PAL / Tirocinio attivo
  / Tirocinio concluso). Estrazione città+beneficiario dal titolo.
  Copertura funnel: **90%** GOL classificate.

**Da fare** (sezione Caso 2 con grafici/tabelle dedicati):
- **FIA Finanza Agevolata** (276): titoli super strutturati per bando
  (FNC Fondo Nuove Competenze, ISI INAIL, FON, FIN, NEXT PID
  UNIONCAMERE). Buona priorità — pattern simile a SIC.
- **APL_RES** (154, 54 campi): Profilo Risorse, Requisiti, Variazione
  Ricerca, Candidati Selezionati. Riempimento basso → bassa priorità.
- **IST Istituti** (52): titoli con DM170/DM19 e IST_4.0 (PNRR scuola).
  Volume piccolo → bassa priorità.

**Estensione ISO opzionale** (segnalata da utente 2026-05-13):
- "Documenti Triennio" — il campo `isoDocTriennio` è 0% riempito
  nell'Excel. Possibile estensione di `section-certificati.js` con
  calendario triennio derivato da `isoStatoCert` + `isoDataVerifica`
  (Prima Em. → I/II/III Sorv. → Ricert.). Da fare quando l'utente
  conferma il modello desiderato.

**Per ognuno: applicare Caso 2 della governance** → fork interno dei
file dal kit dentro `dashboard_<BU>_CM/js/`, `index.html` scritto a
mano (NON rigenerato dal build), `extraSections` in `config.js`.

## Decisioni di design (NON cambiare)

- **Sidebar e header SEMPRE scuri** (anche in tema chiaro): confermato dall'utente
- **Theme toggle**: solo icona ☀️/🌙 tonda 32px, niente testo
- **Login admin**: barriera client-side
- **Token partner**: formato `REG_CITTA_random` (es. `CAM_AVERSA_YlAX0W1ofxS2`)
- **Email admin**: `formazione@qualificagroup.it` (default, override per BU)
- **"Da Incassare"**: SEMPRE `Math.max(0, Ricavi - GiàIncassato)` (mai dal campo Excel)
- **Quick filter "anno corrente"**: legge `new Date().getFullYear()` dinamicamente

## Terminologia settori — significato degli acronimi

ATTENZIONE: alcune sigle hanno significato non immediato. Verificare PRIMA di
scrivere label o copy:

- **FOR**: Formazione
- **ISO**: Certificazioni ISO (audit, ente, scopo, verifiche)
- **SIC**: Sicurezza Lavoro (RSPP, formazione obbligatoria)
- **AVV**: **Avvalimenti** (impresa ausiliaria per gare d'appalto) — NON "Avvocati"
- **FIA**: Finanza Agevolata (bandi, contributi)
- **IST**: Istituti
- **SOA**: Attestazioni SOA (qualificazione lavori pubblici)
- **GAR**: Gare d'appalto (protocollo, CIG, scadenze)
- **APL_PAL**: Politiche Attive Lavoro — area Pal (GOL, CV, accompagnamento)
- **APL_RES**: Politiche Attive Lavoro — area Risorse (profili, requisiti)
- **GDPR**: Privacy / GDPR (consulenze, audit, accordo pagamenti)

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
