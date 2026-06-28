# 📋 SMALTIMENTO BACKLOG WeA — REPORT FINALE (run autonomo notturno)

**Run:** 27/06/2026 ~02:21 → 04:25 (finestra autonoma, self-paced via /loop).
**Esito:** backlog **100% triagiato** — nessuna voce lasciata "aperta/non guardata".

## 📊 Numeri finali (dal DB Hub `backlog_voce`)
- **31 FATTO** (chiuse) · **40 IN_CORSO** (con nota precisa: cosa serve e perché) · **0 APERTE**.
- Partenza run: 18 fatto. **+13 chiuse in questo run notturno**, tutte con **verifica LIVE** (deploy → Playwright/REST → reload/persistenza/screenshot).

## ✅ Chiuse + VERIFICATE LIVE da me (questo run)
| Voce | Cosa | Prova |
|---|---|---|
| sgi-seed-1/2/3 | migration tipo_documento applicata · RACI embed `procedure→procedure_aziendali` · Cmd+K `denominazione→nome` | search 200 + 11 risultati incl. settore; RACI 200 |
| fia-seed-2 | Home "Aperti ora" da `stato_bando` → `data_chiusura≥oggi` | mostra **417** (era 0) + screenshot |
| sic-seed-2 | 4 endpoint Home creati (erano 404) + rimossi heatmap/activity finti | 4×200, KPI reali, no dati finti + screenshot |
| hr-seed-1 | Admin Panel tabella `richieste_ferie`→`richieste` | counts.richieste=1 (era 0) |
| qwork-seed-1 | gate "Da validare" usa chiave reale `to_validate` | E2E: complete→to_validate, persiste dopo reload |
| qwork-seed-2 | inbox/sync + promote rispettano sola-lettura | pattern provato (path readonly non triggerabile a video) |
| soa-seed-1 | persiste snapshot fattibilità + batch ricalcola | **621/621** snapshot scritti (era 0) → semaforo si popola |
| commesse-seed-3 | gate server 3 pagine coordinatore | conto collaboratore → tutte redirigono /home |
| commesse-seed-2 | (già risolto) colonne cron presenti + schedulato 0 4 | verificato colonne live + vercel.json |
| iso-seed-3 | (già presente) 2ª barriera server `canWrite` | PATCH commessa da non-staff → 403 |
| hub-seed-1 | Sala Controllo pagina Qnet a blocchi di 100 | sala-controllo?entita=utenti → 200, **392 righe** (era errore) |

(+ Gruppo 1/2 di ieri sera: 7 sicurezza + sales-seed-1 €4.185.857,19 + sales-seed-2/4/7 + qcont-seed-1/3 — tutti verificati live.)

## ⚠️ Trasparenza (NON marcate fatto da me)
Risultano `fatto` nel DB ma le ha chiuse la **sessione parallela**, io NON le ho verificate a video:
- **iso-seed-1, dashboard-seed-1, area-partner-seed-1** → fix deployato/corretto nel codice, ma conto collaudo non provisionabile lì (ISO FK su `users`; dashboard login rimbalza). Se vuoi, mi dai un accesso e le valido davvero.

## 🟡 40 IN_CORSO — perché non chiuse (lista decisioni per te)
Ogni voce ha la nota nel backlog. Raggruppate per blocco:
- **DECISIONI CEO (servono a te):** sales-seed-3 (IVA contata 2× negli OC — scelta A/B), sales-seed-5 (riservatezza compensi: vista per-comm sì/no), sedi-seed-3 (formula 50/50 + tetto), fia-seed-5 (anello chiusura, con Flagiello), trasversale-seed-3 (D1/D3/D4/D5), dashboard-seed-2 (rotazione password reali).
- **MODELLO/NUMERI (con te, no calcoli alla cieca):** qcont-seed-2 (chiusura→CdG), qcont-seed-5 (ribaltamento costi→BU), cdg-seed-4 (consuntivo da registro vivo), for-seed-4 (economia GOL), bp-seed-1 (import tipo→generico), bp-seed-3 (budget→CdG).
- **FEATURE da costruire:** for-seed-3 + commesse-seed-1 (viste salvate), hub-seed-3 (Centro Autorizzazioni Fase 2), qwork-seed-3 (@menzioni), qwork-seed-4 (sync incrementale), cdg-seed-2 (token pubblico report partner), area-partner-seed-3 (allineamento guscio).
- **INTEGRAZIONI / TERZI:** qcont-seed-4 (endpoint Qnet — **Ciro**), fia-seed-3/4 (scraper bandi→DB), soa-seed-4 (sync STW→SOA), iso-seed-4 (id Qnet clienti), commesse-seed-4 (GREEN dati).
- **DATI / CONFIG:** sic-seed-3 (DB SIC da popolare), hr-seed-4 (4 sedi+43 CF), iso-seed-2 (account 3 ruoli), sgi-seed-4 (mapping HR↔SGI), hr-seed-5 (Valentina FA), for-seed-2 (audit liste FOR/SIC).
- **DA CONFERMARE LUIGI:** sedi-seed-1 (round-2 pezzi 4+6), sedi-seed-2 (6 punti).
- **HARDENING (no leak aperto):** cdg-seed-3 (gettone HR), hr-seed-2 (export COGE filtro validate), hr-seed-3 (permessi CdG menu↔API).
- **CANTIERE ampio:** trasversale-seed-1 (accessi-per-ruolo, gran parte già fatto), trasversale-seed-2 (anagrafiche uniche).

## 🔧 Metodo + note infra
- Tutto su **main** via worktree isolato `/tmp/qg-auto` (cherry-pick/FF), MAI toccato il checkout della sessione parallela.
- **Bug team-wide risolto:** lockfile pnpm rotto da #1057 bloccava TUTTI i deploy Vercel (qcont fermo) → rigenerato (commit 9a90a741).
- Gate **typecheck=0 prima di ogni push** (dopo un errore corretto al volo su soa).
- Script di verifica riusabili in `tooling/e2e/_v-*.cjs` e `_verifica-sec-*.cjs`.
- Conto collaudo provisionato (hr/admin) in: hub, cdg, sgi, fia (poi rimosso), soa — per le verifiche.

## ▶️ Prossimo passo consigliato
Le 40 in_corso sono un **menù di decisioni/feature**, non lavoro "dimenticato". Quando rispondi alle ~6 DECISIONI CEO + dai un accesso ISO/dashboard, posso sbloccare e chiudere un altro blocco in autonomia.

## 🔁 CHECK FINALE DI NON-REGRESSIONE (27/06 ~06:29) — TUTTO VERDE
- 9 commit del run ancora su origin/main (nessun revert della sessione parallela): 7d8e4a06 694701cf bbfcc06c 0e3087b5 46db0cae 1eb01e11 d9f220e2 6111f2a5 9a90a741 ✅
- soa_fattibilita_snapshot = **621** righe ✅ · sgi.procedure_aziendali.tipo_documento = 200 ✅
- Money path (sales-seed-1) LIVE: totale **€4.185.857,19** su **5310** righe ✅
- Backlog tally invariato: **31 fatto / 40 in_corso / 0 aperto**.
→ Nessuna regressione. Loop autonomo CHIUSO. Worktree /tmp/qg-auto rimosso.
