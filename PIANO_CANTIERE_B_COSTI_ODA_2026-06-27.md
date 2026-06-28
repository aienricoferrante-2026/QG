# 🏗️ PIANO ESECUZIONE — Cantiere B "costi→ODA" (Q-CONT) — avvio ≈ 01:14 CEST 2026-06-27

> Documento di continuità (resiste al riassunto del contesto). Al risveglio 01:14: rileggi QUESTO file + memoria `project_margine_sede_cogestione` (sezioni 26/06) + `stato_lavori_qualifica` (§ "⏰ TASK SCHEDULATO").
> **Principio guida: TUTTO ADDITIVO + parità numeri Grumello come CANCELLO. Stanotte NON si ribalta il motore margine live.**

## COSA chiede il cantiere (da § TASK SCHEDULATO)
1. Costi a mano → **ODA leggero** (fornitore opzionale) + campo/stato.
2. Stato **«Erogato OK - BEF»** sull'ODA (controllo coordinatore ufficio tecnico → pagabile).
3. **Unificare i 2 motori costi** (RPC `incassi_cogestione_sede` migr.044 vs `tesoreria_impegnato_economico` migr.024) su UN binario (ODA), conta dal **bozza**.
4. Casi: **storno** se BEF negato; **pagamento partner 50/50** (conto-sede, NON lista bonifici).
5. UI **occhio del corso = lista ODA con stato**.

## MODELLO (definitivo 26/06)
TUTTI i costi (auto da commessa + manuali da Excel) entrano come **ODA in BOZZA** → contano subito nel margine. L'approvazione/controllo = passaggio **bozza→definitivo**. Sequenza: RDA → ODA bozza (★ qui conta) → ODA definitivo → erogazione + controllo coord. ufficio tecnico → **«Erogato OK - BEF»** → FTP → autorizz. pagamento (lista bonifici doppia firma) → Pagato. Scorciatoia **pagamento a mano** (cogestione): salta BEF; chi paga noi→spesa nostra / partner→credito su conto-sede (entra nel 50/50).

## STATO SISTEMA OGGI (F0 verificato 27/06, via Explore)
- ODA infra ESISTE: tabelle `oda`/`rda`/`arrivo_merce`/`fattura_passiva` (migr.002), `bef`+`lista_bonifici` (migr.003), colonne ODA-definitivo (migr.030). `oda` ha già `commessa_codice_esterno`, `fornitore_id`, `stato` (stato_oda_enum: bozza/emesso/evaso_parziale/evaso/annullato/chiuso).
- `POST /api/oda` = PESANTE: valida qualifica fornitore + analisi mercato >€5k → serve path LEGGERO.
- 2 motori: `incassi_cogestione_sede` (migr.044 — somma costo_sede+costo_docente_corso+costo_dipendente_sede; ALIMENTA il margine sede live) · `tesoreria_impegnato_economico` (migr.024 — competenza, legge ODA).
- Tabelle costi: `costo_sede` HA `stato`; `costo_docente_corso` + `costo_dipendente_sede` **NO stato, NO oda_id, NO commessa_codice_esterno**. NESSUNA ha `oda_id`. `costo_partner_anticipato`/`anticipo_qualifica_a_partner` hanno `commessa_codice_esterno`+`stato`.
- "occhio" = `DialogDettaglioRicavo` in `apps/qcont/app/(app)/sedi/[id]/_tab-rendicontazione.tsx` (righe ~584-630): read-only, mostra costi AGGREGATI, **NON una lista ODA**.
- NESSUNA generazione ODA-da-costi oggi. Pagine ODA: `/rda-oda`, `/ftp`. API: `GET/POST /api/oda`, `/api/oda/[id]/bef`, `/api/rda*`.
- ⚠️ RISCHIO NAMING: esiste `migration-c1-rename-columns-qcont.sql` (bu_codice→fa_codice) MA nota 26/06 dice di aver rinominato fa_codice→bu_codice in prod. **Verificare il nome VIVO della colonna (`cogestione_quota_bu`, `oda`) via information_schema PRIMA di ogni migration.**

## 🎯 SCOPE STANOTTE = FONDAZIONE ADDITIVA SICURA (default; vedi FORK per Enrico)
Costruisco il binario ODA ACCANTO a quello esistente, numeri INVARIATI:
- I costi POSSONO diventare ODA (auto su inserimento manuale + backfill Grumello).
- L'occhio mostra la LISTA ODA con stato.
- Esistono e funzionano gli stati nuovi: «Erogato OK - BEF», storno, pagamento-a-mano partner 50/50.
- Il **motore margine live resta `incassi_cogestione_sede`** (legge i costi) → **numeri Grumello garantiti invariati**.
- L'unificazione (pto 3) = scaffolding additivo (link `oda_id` + competenza già legge ODA via migr.024). Il CUT-OVER del motore su ODA = step separato GATED dopo prova di parità. NON stanotte.

---

## CHECKLIST ESECUZIONE (ordine)

### STEP 0 — Pre-flight (read-only, ~5 min)
- [ ] Verifica orario ≥ target; se context summarizzato rileggi questo file.
- [ ] Worktree NUOVO isolato: `cd ~/Desktop/qualifica-platform && git fetch origin && git worktree add -b feat/qcont-costi-oda-cantiere-b ~/Desktop/qp-cantiere-b origin/main` (NON usare qualifica-run = db-cleanup-c2; NON il main repo = feat/formalab-client-sync).
- [ ] Leggi SQL esatto: migr. 002 (oda+enum), 020 (costo_sede), 024, 030, 037 (costo_docente/dipendente), 044, 048 (cogestione bu).
- [ ] Mgmt API (token `ACCESS_TOKEN_ACCOUNT` da `apps/qcont/.env`, ref qcont `eqprzkdehxustaoeeaoy`, header User-Agent browser): conferma nome colonna viva (`oda.fornitore_id` NOT NULL?, `cogestione_quota_bu` bu_codice|fa_codice).
- [ ] **BASELINE PARITÀ**: chiama `incassi_cogestione_sede` per Grumello sede_id `a673c268-a8b9-419a-a83a-d79630d54fb2` + leggi le 4 rendicontazioni. Attesi: Rend1 ric 68.128 / costo rete 89.231 / quota cogest 23.299 / al partner 20.080; Rend2 ric 26.080 / al partner 5.551; Rend3 ric 38.327 / al partner 10.414; Rend4 ric 8.258 / al partner 384. **Salva su `STW/BASELINE_GRUMELLO_pre-cantiere-B.json`.**
- [ ] Collisione: `git log origin/main --oneline | grep -i oda` + controlla se `feat/oda-ricavo-costo-expand` (worktree qp-oda) è già in main e se tocca `oda`/`_tab-rendicontazione.tsx`/occhio → evita doppioni/conflitti.

### STEP 1 — Migration ADDITIVE (Mgmt API, solo colonne nullable)
- [ ] `052_costi_oda_link.sql`: ADD COLUMN `oda_id uuid NULL REFERENCES oda(id) ON DELETE SET NULL` su costo_sede, costo_docente_corso, costo_dipendente_sede; ADD `commessa_codice_esterno text NULL` su costo_docente_corso + costo_dipendente_sede.
- [ ] `053_oda_cogestione_leggero.sql` (tutte colonne NULL, NIENTE chirurgia enum): su `oda` ADD `tipo_oda text NULL DEFAULT 'standard'`, `erogato_ok_bef_il timestamptz NULL`, `erogato_ok_bef_da text NULL`, `stornato_il timestamptz NULL`, `storno_motivo text NULL`, `pagato_da text NULL`, `pagamento_a_mano_il timestamptz NULL`, `prova_pagamento_url text NULL`. Se `oda.fornitore_id` è NOT NULL → `ALTER COLUMN fornitore_id DROP NOT NULL` (additivo).
- [ ] Modella «Erogato OK - BEF» come TIMESTAMP (`erogato_ok_bef_il`), NON come nuovo valore enum (additivo + niente problemi ALTER TYPE in transazione).

### STEP 2 — Backend (path leggero, additivo)
- [ ] `POST /api/oda/cogestione`: crea ODA bozza SENZA gate fornitore/analisi-mercato; `tipo_oda='cogestione'`, `stato='bozza'`, set `commessa_codice_esterno`; ritorna id.
- [ ] "Genera ODA da costo": da una riga costo → crea ODA cogestione bozza + set `costo.oda_id`. **Auto** su inserimento costo manuale (modello: costo manuale → SUBITO ODA bozza). Idempotente (skip se oda_id già valorizzato).
- [ ] BACKFILL Grumello (dati, additivo/reversibile): per i costi esistenti Grumello → genera ODA cogestione bozza + oda_id, così l'occhio mostra qualcosa. Motore legge ancora i costi → numeri invariati.
- [ ] `POST /api/oda/[id]/erogato-ok-bef` (gate ruolo coord. tecnico / hr / direzione): set `erogato_ok_bef_il/_da`.
- [ ] `POST /api/oda/[id]/storno`: set `stornato_il`+`storno_motivo` (caso BEF negato).
- [ ] `POST /api/oda/[id]/pagamento-a-mano`: `pagato_da` noi|partner; se partner → debito su conto-sede (50/50, riusa cogestione settlement), salta BEF.
- [ ] `GET /api/oda?commessa_codice_esterno=:corso` (estendi GET esistente con filtro) per l'occhio.

### STEP 3 — UI (occhio = lista ODA con stato), additivo
- [ ] In `_tab-rendicontazione.tsx` `DialogDettaglioRicavo`: aggiungi sezione "ODA del corso" → lista oda per `commessa_codice_esterno`, badge stato (bozza/emesso/Erogato OK-BEF/stornato/pagato) + chi-paga; se ruolo lo consente, bottoni Erogato-OK / storno / pagamento-a-mano.
- [ ] (opz.) bottone "Genera ODA" sulle righe costo nel sotto-tab Costi.

### STEP 4 — Verifica (CANCELLI DURI)
- [ ] `dottore-build`: typecheck + lint + next build VERDI.
- [ ] **SELF-CHECK PARITÀ**: ri-chiama `incassi_cogestione_sede` Grumello + 4 rendicontazioni → DEVONO uguagliare la baseline. Se UN numero peggiora → **STOP, NON mergiare, riferisci a Enrico**.
- [ ] Video Playwright (conto `test.collaudo.sedi@`, creds `~/.claude/test-admin-creds.json`): login → Grumello → Rendicontazione → occhio mostra lista ODA; crea costo manuale → compare ODA cogestione bozza; set Erogato-OK; numeri a schermo invariati. Screenshot prima/dopo.
- [ ] PR → (se verde + parità + video OK) merge → deploy qcont → verifica prod 200 → **report a Enrico con infografica + domande semplici**.

## ✅ DECISO (Enrico 27/06 00:1x): VAI CON A
**A = fondazione ADDITIVA, motore margine NON ribaltato stanotte → numeri Grumello invariati.**
**⭐ Chiarimento di Enrico (import-phase) — recepito:** in funzionamento normale ogni costo nasce GIÀ come ODA → il disallineamento "costi vs ODA" esiste **SOLO** per i dati del primo import (i costi Grumello caricati a mano, oggi nelle tabelle `costo_*`). Conseguenze sul piano:
- Il **backfill** (costi Grumello esistenti → ODA bozza, **1-a-1 via `oda_id`, idempotente**) NON è solo per l'occhio: è **IL fix del problema import-phase**. Chiude il buco che rendeva B rischioso.
- Il **«visto»** = l'approvazione che fa "entrare il costo in contabilità" = passaggio ODA **bozza → definitivo** (colonne definitivo migr.030). L'ODA in bozza conta già nel margine; il visto lo rende ufficiale/contabile. → STEP 2/3 devono includere un'azione **"Visto/Approva" (bozza→definitivo)**.
- **ANTI-DOPPIONE:** ogni costo esistente → UN solo ODA (linkato via `oda_id`). In A il motore legge ancora `costo_*` (NON ODA) → nessun doppio conteggio. Il futuro cut-over a B sarà sicuro proprio perché dopo il backfill non resta nessun costo "orfano" fuori dagli ODA.
- **B (cut-over del motore su ODA) = RINVIATO**, si farà insieme di giorno.

## NON-GOAL stanotte
- NON ribaltare il motore margine live su ODA (cut-over = step separato gated dopo prova parità).
- NON toccare main repo / qualifica-run / altri worktree. Solo `qp-cantiere-b`.
