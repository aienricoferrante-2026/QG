# Sessione 2026-05-13 · stato finale prima della nuova chat

Branch: `claude/gallant-goldberg-bb8260` · 20 commit sopra `main`.

**Prima di aprire la nuova chat: mergia la PR.** Link compare:
https://github.com/aienricoferrante-2026/QG/compare/main...claude/gallant-goldberg-bb8260?expand=1

## Cosa è stato fatto in questa sessione

### Tappa 2 — Esplora (richiesta originale)
- Nuova sezione **🔍 Esplora** (Caso 1 del kit): vista unica multi-livello
  che assorbe Sedi, Clienti, Responsabili, Performance Tappa 1.
- 3 file kit: `section-explore-metrics.js`, `section-explore-tree.js`,
  `section-explore.js`. 14 dimensioni, 15 metriche, 9 preset, confronto
  periodi A/B, sub-filtri Status/Anno, chart cliccabili, info icon.
- Quick filter ora **combinabili** (Set multi-select) + nuovi temporali
  (Questo mese, Mese scorso, Ultimo trimestre).
- KPI cliccabili in Sintesi (Executive) e Analisi Incassi → drill-down.

### Estensioni successive
- **Wiki / Manuale** con flusso visuale + Q&A + glossario (kit
  `section-wiki.js` + `section-wiki-calcs.js`).
- **Wiki "Calcoli effettuati"**: 20 KPI con formula + **descUser
  intelligibile** + popup ⓘ + valore ricalcolato su `filtered`.
- **Wiki "Mapping campi JSON"**: stato di riempimento dei campi con
  barra fill colorata.
- Helper globale **`kpiInfoBtn(id)`** che produce l'icona ⓘ riusata
  in TUTTE le sezioni. Click → popup descrizione centralizzata.
- **Upload Excel** su tutte le 5 BU sul kit (era solo FOR). Config
  generico `upload-config-common.js` + `SECTOR_CONFIG.uploadExtraFieldMap`
  per estensioni (SOA mappa 11 campi custom).
- **Header sticky** integrato: logout chip + theme + toggle Filtri/Numeri
  dentro `.header` (niente più position:fixed sparsi).
- **Hub `index.html`**: KPI per ogni card settore (Ricavi · Margine % ·
  Incasso % · Da Inc. · Clienti · MOL) + sezione **"🔑 Credenziali
  Coordinatori"** con login Master inline, occhio show/hide password,
  colonna Coordinatore editabile (localStorage), bottone "✉️ invia"
  mailto precompilato.
- **Login try/catch + reset garantito bottone** + messaggi espliciti
  email/password sbagliata. Bottone "🔬 Diagnostica login" in-page.
- **FOR** ha Esplora con dimensioni FOR-specifiche (statoCorso,
  statoClasse, corso) + metriche FOR (discenti, ore) + 4 preset FOR.
  Fork interno in `dashboard_FOR_CM/js/section-explore-for.js`.

### Allineamento finale (commit `76c9db5`)
Le 5 dashboard "indietro" (ISO, GAR, APL_PAL, APL_RES, GDPR) sono
state portate al livello delle altre. **11/11 dashboard** ora hanno
Esplora, Wiki, Wiki Calcoli, Upload Excel, KPI cliccabili.

## Audit feature × dashboard (post-merge)

| FEATURE | FOR | SIC | AVV | FIA | IST | SOA | ISO | GAR | APL_PAL | APL_RES | GDPR |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Esplora + sub-filtri + chart click | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Wiki + Q&A + glossario | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Wiki Calcoli (descUser + ⓘ) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mapping campi JSON | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Upload Excel | ✓¹ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| KPI ⓘ + cliccabili drill-down | n/a² | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Header sticky integrato | n/a² | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Quick filter combinabili + temporali | n/a² | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Default = Esplora | n/a² | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

¹ FOR usa il suo `upload-config.js` locale (autonomo). ² FOR è autonomo:
non condivide kpis/header/filters/sections-overview del kit, quindi ha
solo Esplora + Wiki Calcoli (innesti additivi).

## Cose chiave da ricordare per la prossima chat

- **Pattern KPI centralizzato**: ogni nuovo KPI va dichiarato in
  `_wikiCalcRows` di `shared/dashboard-core/js/section-wiki-calcs.js`
  con `id + label + descUser + formula + src + val`. Poi nelle
  sezioni usa `kpiInfoBtn('id')` per l'icona ⓘ.
- **Regola "in lavorazione"** = `c.status === 'In Lavorazione'`,
  NON `c.statoLav` (workflow interno).
- **Deploy**: sempre via GitHub (push + link compare). Niente preview.
- **dashboard_FOR_CM è in produzione**: gli innesti additivi
  (`section-explore-for.js`, include dal kit di Esplora/Wiki) sono OK,
  ma NON modificare i file esistenti di FOR.
- **Limite 300 righe/file** rispettato: section-wiki.js (152) +
  section-wiki-calcs.js (208).

## Come iniziare la prossima chat

1. Mergia la PR su main (link compare sopra)
2. Apri https://aienricoferrante-2026.github.io/QG/ + ⌘+Shift+R
3. Verifica visivamente che tutto funzioni
4. In Claude Code nella cartella STW:
   > "Leggi MULTI_SECTOR_PROMPT.md e SESSION_STATE_2026_05_13.md.
   > Mi serve <X>."

Possibili lavori successivi (non scope di questa sessione):
- Mini-dashboard partner per le BU sul kit (Chat #2 del prompt master)
- Sezioni Caso 2 per GAR (gare scadenze) / GDPR (insoluti) / AVV (impresa
  ausiliaria) / APL_PAL (Visure-GOL-CV) / APL_RES (Profilo Risorse)
- Forecast / aging credito / DSO
- Vista cross-settore sull'hub
