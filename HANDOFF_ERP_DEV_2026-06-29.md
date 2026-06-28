# 🗂️ HANDOFF ERP — Consolidamento a 1 Database (per i DEV) · 29/06/2026

> Documento da presentare ai dev. Stato reale, verificato. DB unico = Supabase **bqyqr** (`bqyqrqmbekdhejrzasvv`).

## 1. In una frase
Tutti i dati dei **12 domini Qualifica** sono stati consolidati in **un solo database** (`bqyqr`), validati e dimostrati in-app. Resta da **ricablare le app vive** perché LEGGANO/SCRIVANO sul DB unico (cutover), poi spegnere i vecchi DB.

## 2. Cosa è FATTO (consolidamento — validato)
- **12 schemi-dominio, ~150 tabelle** nel DB unico: `public` (anagrafica master: aziende, contatti, utenti, struttura_gerarchia), `commerciale`, `commesse`, `formazione`, `sedi_partner`, `contabilita` (attiva+passiva), `cdg`, `hr`, `iso`, `sic`, `fia`, `bp`.
- **Integrità: 0 FK non valide · 0 orfani cross-master · €102M ledger CdG quadrato al centesimo.**
- **Master unici (no doppioni):** azienda = persona giuridica (ruoli via flag is_cliente/is_fornitore/is_partner); commessa = `commesse.commesse` (PK uuid + qnet_order_id); piano dei conti = `contabilita.piano_conti`; BU = `public.struttura_gerarchia`; dipendente = `hr.dipendenti`; sede-filiale = `hr.sedi`.
- **Wiring cross-dominio:** iscrizione→commessa, dipendente→utente(auth), funzione→BU master, provvigioni→agente, commesse→azienda.
- **Valore visibile:** €1,63M di provvigioni partner già consolidati e mostrati.

## 3. Dimostrazione in-app (10 viste read-only, verificate a vista)
Pagine Hub (`app.qualificagroup.com`), ognuna una vista di lettura sul consolidato — **NON sono ancora le app operative, sono la prova che il dato consolidato è corretto:**
`/erp-consolidato` (cruscotto) · `/commerciale-pipeline` (15.820) · `/formazione-discenti` (10.691) · `/commesse-erp` (14.903) · `/cdg-consuntivo` (€102M) · `/fia-bandi` (4.590) · `/hr-dipendenti` (161) · `/sedi-erp` (115) · `/oda-erp` (34) · `/provvigioni-partner` (€1,63M).

## 4. Cosa RESTA — il CUTOVER (app per app)
Oggi le app operative (qcont, sales, HR, FOR, ISO…) leggono ancora i **loro DB separati**. Il DB unico vive *accanto*, pieno e corretto. Piano cutover, **app per app, col doppio-binario**:
1. **Modello sicurezza cross-DB a runtime** (RLS sulle tabelle esposte; niente token-account in route). ← prima cosa.
2. **Sync continuo** sorgente→bqyqr (upsert idempotente) per evitare dati stale.
3. **Repoint a blocchi:** prima sola-lettura (liste/report), poi scritture, **doppio-binario** (scrive vecchio+nuovo, confronto importi a specchio) + **verifica visiva F4 per blocco**.
4. Primo candidato: **qcont** (provvigioni/pagamenti).

## 5. I 3 passi SUPERVISIONATI (5 min col team — NON automatici)
- **Flip in produzione** della lettura/scrittura di un'app viva (specie qcont=soldi) → verifica a vista.
- **Tabelle login/auth** di bqyqr (rischio chiudere fuori 10 app).
- **Spegnimento DB vecchi** → irreversibile, SOLO dopo giorni di doppio-binario verde.

## 6. Come riprendere (sessione nuova)
Apri una chat e scrivi: **"riprendi il cutover ERP dal ledger"**. Il sistema legge `~/Desktop/STW/ESECUZIONE_ERP_LOG.md` (registro append-only di OGNI migrazione) + memoria `reference_erp_stato_deliverables` e continua da qui. Tutto è committato (STW + qp-notte-pulizia, ramo pulito off origin/main) e su disco.

## 7. Governance / sicurezza già attiva
Protocollo apply (transazione + verifica information_schema + DOWN + Hub 200 + ledger + commit). Pre-push Hub: `next lint` (non solo tsc). Regole CEO cementate cross-chat (memoria + hook): delega=eseguo, controlli auto-pianificati, anti-parcheggio, rilevatore-decisioni, pivot.
