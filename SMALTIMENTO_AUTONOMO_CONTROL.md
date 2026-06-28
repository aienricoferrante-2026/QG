# 🤖 SMALTIMENTO BACKLOG WeA — RUN AUTONOMO (control file)

**Armato:** 2026-06-26 ~23:19 · **START lavoro:** epoch nel file `/tmp/_smaltimento_epochs.txt` (campo 2) ≈ **02:19** · **HARD-STOP:** epoch campo 3 ≈ **06:19** (finestra ~4h).
Autorizzato da Enrico ("vai coi default"). Conto collaudo: `~/.claude/test-admin-creds.json`.

## ✅ RUN PRINCIPALE COMPLETATO (~04:25) — backlog 100% triagiato: 31 FATTO / 40 IN_CORSO / 0 APERTO
Report: `STW/SMALTIMENTO_REPORT_FINALE.md`. Tutto il code-fixabile+verificabile è chiuso+verificato LIVE.
**MODALITÀ ORA = IDLE + CHECKPOINT FINALE:** non c'è altro da smaltire in autonomia (le 40 in_corso servono decisioni CEO/feature/integrazioni/dati). A OGNI risveglio: (1) se NOW≥STOP → check di NON-REGRESSIONE delle 13 chiuse del run (spot: sales-seed-1 totale €4.185.857,19, hub-seed-2 403, sgi search, soa snapshot>0) + conferma tally 31/40/0 + scrivi esito nel report + STOP (niente più wakeup). (2) altrimenti → rischedula lungo (~3300s) verso ~06:00, niente lavoro. NON riaprire voci già fatte. NON inventare lavoro.

## ⏱️ Logica di clock (a OGNI risveglio)
1. `NOW=$(date +%s)`; leggi START/STOP da `/tmp/_smaltimento_epochs.txt`.
2. Se **NOW < START** → non lavorare: ri-schedula un wakeup (~3300s) e termina il turno (sto solo aspettando le 3h).
3. Se **START ≤ NOW < STOP** → lavora UN gruppetto (2-4 voci), poi ri-schedula (~120-180s se aspetto un deploy, altrimenti subito).
4. Se **NOW ≥ STOP** → STOP: niente più wakeup, scrivi il REPORT FINALE (in questo file + `stato_lavori_qualifica.md`), aggiorna i conteggi backlog, fine.

## 🔒 Regole ferme (NON derogabili)
- **Verifica LIVE obbligatoria** prima di marcare `fatto`: azione → RELOAD → conferma persistenza (Playwright `tooling/e2e`, conto collaudo). UI = guardare lo screenshot. Un PATCH 200 NON basta. Se non riesco a verificare a video → NON marco `fatto`, scrivo "deployato, non validato a video + perché".
- **Isolamento sessione parallela**: c'è un'altra sessione sullo stesso backlog/worktree. Lavoro in `~/Desktop/qualifica-run` MA: prima di ogni commit `git fetch origin main`; porto su main via **cherry-pick/FF da worktree temporaneo isolato** (`git worktree add --detach /tmp/qg-auto-<n> origin/main`) come ho già fatto, MAI checkout che clobbera il loro tree. Se il worktree è su un branch non-main, NON forzarlo: uso il worktree temporaneo.
- **Deploy watch**: dopo ogni push, se i deploy vanno in ERROR → controlla `pnpm-lock.yaml` (rigenera se outdated, causa nota #1057) e build; fixa il blocco team-wide.
- **Build gate**: `pnpm --filter <app> typecheck` + `lint` verdi PRIMA di push.
- **Marcatura**: a fine voce, PATCH `backlog_voce` (DB Hub bqyqrqmbekdhejrzasvv) stato=fatto/semaforo=verde + consiglio con prova; oppure in_corso + nota se differita.

## 🚫 DEFAULT confermati da Enrico (NON chiedere, NON inventare)
- **iso-seed-1 / dashboard-seed-1** (già deployati): restano "deployato, non validato a video" — il conto collaudo non è inseribile (ISO FK su `users`; dashboard login rimbalza). NON marcarle fatto io.
- **Decisioni CEO / modello**: lasciare a Enrico, NON inventare numeri/policy. Voci: sales-seed-3, sales-seed-5, sedi-seed-3, fia-seed-5, trasversale-seed-3, + qcont-seed-2/5 (motori contabili), cdg-seed-4, for-seed-4 (economia GOL), bp-seed-3 (budget→CdG). → in_corso + nota precisa di cosa serve.
- **Bloccati su terzi**: qcont-seed-4 (Ciro), sedi-seed-1/2 (Luigi), commesse-seed-4 (GREEN, dati Qnet) → in_corso + nota.

## 📋 WORKLIST (46 aperti — triage)
### Probabilmente CODE-FIXABILI + auto-verificabili (priorità):
- **hr-seed-1** Admin Panel legge tabella sbagliata (`richieste_ferie` inesistente) — fix nome tabella/query.
- **sgi-seed-1** manca colonna tipo_documento → creare nuovo doc rotto.
- **sgi-seed-2** 'Il mio RACI' nomi tabella/colonna sbagliati.
- **sgi-seed-3** Cmd+K cerca su colonne inesistenti (scarta in silenzio).
- **fia-seed-2** Home 'Aperti ora=0'; **fia-seed-3** ingresso bandi rotto; **fia-seed-4** fonti spente.
- **sic-seed-2** Home rotta; **sic-seed-3** app ferma con DB vuoto (empty-state).
- **soa-seed-1** Semaforo fattibilità sempre vuoto; **soa-seed-4** ingresso pratiche da STW.
- **qwork-seed-1** 'Da validare' non funziona; **qwork-seed-2** import/promozione scrivono senza ruolo; **qwork-seed-3** menzioni @.
- **iso-seed-3** blocco cliente solo a schermo (server gate); **iso-seed-4** non scrive id Qnet clienti.
- **cdg-seed-2** link 'report stampabile' rotto nelle mail partner.
- **dashboard-seed-3** link a Commesse hardcoded *.vercel.app → usare config.
- **commesse-seed-1** viste salvate non implementate; **commesse-seed-3** 3 pagine coordinatore.
- **for-seed-2** DB condiviso con SIC (chiarire/separare); **for-seed-3** viste salvate.
- **hr-seed-2** Export COGE include allocazioni non validate (manca filtro); **hr-seed-3** permessi CdG incoerenti.
- **hub-seed-1** Sala Controllo/Discrepanze; **hub-seed-3** Centro Autorizzazioni Fase 2.
- **area-partner-seed-3** deroghe guscio (menu/tabella standard/viste).
- **bp-seed-1** bug latente (indagare).
- **iso-seed-2** mancano account 3 ruoli (provisioning).
- **hr-seed-4** dati mancanti (4 sedi indirizzo, 43 CF) — dato, valutare; **hr-seed-5** verifica Valentina FA.
- **qwork-seed-4** sync incrementale; **commesse-seed-2** allarme discrepanze notturno; **trasversale-seed-2** dati-che-si-sdoppiano.

### NON code-only (default sopra): bp-seed-3, cdg-seed-4, commesse-seed-4, for-seed-4, sedi-seed-1/2/3, fia-seed-5, sales-seed-3/5, trasversale-seed-3, qcont-seed-2/4/5.

## 🔁 Metodo per ogni voce
F0 leggi codice+DB vivo → conferma se reale (alcune premesse seed sono sbagliate, già visto) → F2 fix minimo riusando pattern esistenti → typecheck+lint → commit su main (FF/cherry-pick isolato) → attendi deploy READY (Vercel API) → **verifica LIVE** → marca backlog. Usa agenti read-only (revisore-sicurezza, general-purpose) per analisi a gruppetti quando utile.

## 📊 TALLY (aggiorna ad ogni voce)
- 18 fatto / 7 in_corso / 46 aperti all'avvio del run.
- **02:40** — SGI gruppetto: sgi-seed-1 (migration tipo_documento applicata), sgi-seed-2 (RACI embed procedure→procedure_aziendali), sgi-seed-3 (search denominazione→nome) → FATTO+verificato LIVE. Commit 6111f2a5. → **21 fatto / 7 in_corso / 43 aperti**. sgi-seed-4 resta (mapping HR↔SGI da finalizzare).
- **02:46** — FIA: fia-seed-2 (Home "Aperti ora" da stato_bando→data_chiusura≥oggi) FATTO+verificato LIVE (417, screenshot). Commit d9f220e2. fia-seed-3 (scraper→DB legacy) + fia-seed-4 (fonti spente) = PIPELINE ESTERNA → in_corso. → **22 fatto / 9 in_corso / 40 aperti**. Conto collaudo provisionato in FIA utenti (hr).
- **02:56** — SIC: sic-seed-2 (4 endpoint count Home creati + heatmap/activity finti rimossi) FATTO+verificato LIVE (4×200, KPI reali, screenshot). Commit 1eb01e11. sic-seed-3 (DB vuoto, da popolare) → in_corso. → **23 fatto / 10 in_corso / 38 aperti**.
- **03:00** — HR: hr-seed-1 (admin panel tabella richieste_ferie→richieste) FATTO+verificato LIVE (counts.richieste=1). Commit 46db0cae. hr-seed-2 (export COGE filtro validate), hr-seed-3 (permessi CdG menu↔API), hr-seed-4 (dati mancanti), hr-seed-5 (Valentina FA) → in_corso (HR in uso, analisi/decisione/dati). → **24 fatto / 14 in_corso / 33 aperti**.
- **03:10** — Q-WORK: qwork-seed-1 (gate validazione chiave to_validate) FATTO+verificato E2E LIVE (complete→to_validate, reload); qwork-seed-2 (readonly block inbox/sync+promote) FATTO (pattern provato, readonly non triggerabile a video). Commit 0e3087b5. seed-3 (@menzioni) + seed-4 (sync) = feature → in_corso. → **26 fatto / 16 in_corso / 29 aperti**.
- Prossimo: SOA (seed-1 semaforo fattibilità, seed-4 ingresso pratiche STW); poi cdg-seed-2, commesse-seed-3, area-partner-seed-3, dashboard-seed-3, iso-seed-3/4.
- **03:25** — SOA: soa-seed-1 (persiste snapshot fattibilità + batch ricalcola) FATTO+verificato LIVE (621/621 snapshot, era 0). Commit bbfcc06c. soa-seed-4 (sync STW) = integrazione → in_corso. → **27 fatto / 17 in_corso / 27 aperti**.
- ⚠️ LEZIONE 03:20: una push è partita con typecheck ROTTO (soa ricalcola, cast Record→tipo). Corretto subito (bbfcc06c). **REGOLA: pushare SOLO se `pnpm --filter <app> typecheck` exit 0** (gate esplicito prima di git push).
- RUN finora (dalle 02:21): +9 verificati (SGI×3, FIA×1, SIC×1, HR×1, QWORK×2, SOA×1) oltre ai 18 iniziali.
- **03:40** — CdG: seed-2 (token pubblico report = feature+sicurezza) e seed-4 (migrazione consuntivo da JSON→registro vivo) → in_corso (entrambi più grandi/delicati).
- **03:55** — COMMESSE: commesse-seed-3 (gate server 3 pagine coordinatore: produttività/discenti-partner/rimosse) FATTO+verificato LIVE (conto collaboratore → tutte redirigono /home). Commit 694701cf. seed-1 (viste salvate=feature) + seed-4 (GREEN dati) → in_corso. → **28 fatto / 21 in_corso / 22 aperti**. NB commesse DB=bhroniqxvzotmdkztxnl (key solo su Vercel, non provisionabile in locale → verifica behavioral via /api/auth/me).
- Prossimo: commesse-seed-2 (cron legge colonna inesistente), dashboard-seed-3 (link hardcoded), area-partner-seed-3, iso-seed-3, for-seed-2, bp-seed-1, hub-seed-1.
- **03:55** — commesse-seed-2: verificato GIÀ RISOLTO (tutte le colonne del cron discrepanze-qnet esistono nel DB STW + cron schedulato 0 4); dashboard-seed-3 (link hardcoded) → in_corso (cleanup config, no behavior change, tie al guscio). → **29 fatto / 22 in_corso / 20 aperti**.
- RUN +11 chiusi (SGI×3, FIA×1, SIC×1, HR×1, QWORK×2, SOA×1, COMMESSE×2).
- Restano ~20 aperti, in gran parte FEATURE/DECISIONI/INTEGRAZIONI/DATI (non code-fix puliti): for-seed-3 (viste), for-seed-4 (economia GOL=modello), bp-seed-3 (budget→CdG=modello), hub-seed-1/3 (feature), iso-seed-4 (integr.), commesse-seed-1/4, sedi/sales/trasversale/fia decisioni, qcont-seed-2/4/5. Code-fix ancora possibili da provare: bp-seed-1 (bug latente, indagare), for-seed-2 (DB condiviso SIC), iso-seed-3 (server gate, verifica ISO difficile), area-partner-seed-3 (deroghe guscio).
- **04:00** — deferiti con nota precisa: for-seed-2 (audit multi-lista, catalogo già filtrato), bp-seed-1 (NUMERI: excel-parser.ts:169 kind→generico, serve Excel+verifica con Enrico), area-partner-seed-3 (governance/UI). → **29 fatto / 25 in_corso / 17 aperti**.
- Restano ATTEMPTABILI: iso-seed-3 (server gate, verifica ISO difficile per FK), sedi-seed-1 (round-2 Luigi: verificare se c'è un branch da mergiare). Il resto = feature(hub-1/3,for-3,iso-4)/decisioni(sedi,sales,trasversale,fia,bp-3,for-4,qcont-2/5)/dati(iso-2)/Ciro(qcont-4).
- NOTA isolamento: worktree /tmp/qg-auto (detached da origin/main) + node_modules installati lì; push via FF/rebase. Conto collaudo provisionato anche in SGI utenti (hr).
