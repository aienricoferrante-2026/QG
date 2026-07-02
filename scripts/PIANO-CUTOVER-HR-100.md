# PIANO CUTOVER HR → ERP al 100% (02/07/2026)

Approccio deciso col CEO: **pianificazione 100% prima, poi migrazione integrale, flip solo con audit VERDE + co-pilot**.
Contesto: incidente 02/07 (id null su creazione mansioni) → rollback HR+FIA; 44 default nucleo `hr.*` già ripristinati (`fix-hr-nucleo-defaults.sql`). Vedi `ROLLBACK-HR-ERP.md`.

## 0. Architettura target (già in essere per qcont/commesse)
- Entità CONDIVISE → schema nucleo `hr.*` (dipendenti, mansioni, funzioni_aziendali, sedi, mansioni_dipendente, organigramma_*, costi_personale_periodo, allocazioni_costo, kpi_master) esposte in `app_hr` come **viste** updatable.
- Entità PROPRIE dell'app → **tabelle base in `app_hr`** (24 esistenti: attivita, mansione, onboarding_*, presenze, richieste, dipendente_*, corsi_master, notifiche, documenti_*, import_*, qnet_import_log, configurazioni…), RLS ON.
- L'app usa `supabaseAdmin()` con `db.schema=app_hr` → vede SOLO app_hr (tabelle+viste).

## 1. Inventario dal CODICE (fonte vera, grep 02/07)
- **Tabelle usate** (union server `.from()` + client useTable + `/api/db/`): 52 distinte. Tutte già presenti in app_hr TRANNE le 13 sotto.
- **RPC**: `hr_dip_fa_replace` (assegnazione FA), `hr_assegna_funzione_aziendale` (route interna) — ✅ esistono in app_hr ma da **diff-are** col sorgente standalone (F6).
- **Storage**: `qnet-imports` (cron qnet-sync ogni 5′). Bucket `documenti-hr` esiste sullo standalone → verificare route upload documenti (F5).
- **Cron**: onboarding-alerts (lun 7:00), qnet-sync (*/5!), pl-mensile-mail (10 del mese 9:00).
- Scarti motivati: `sessioni` (0 riferimenti nel codice = legacy), `v_costo_totale_mese`/`v_dipendente_attivita_attive`/`audit_log_unified` (0 riferimenti).

## 2. GAP misurato bqyqr (02/07)
| # | Gap | Dettaglio |
|---|-----|-----------|
| G1 | **13 tabelle mancanti** → creare come base in `app_hr` | competenze, competenze_dipendente, competenze_mansione, contenuti_wiki, corsi_assegnati, kpi_compilati, mansioni_dipendente_attivita_esclusa, onboarding_modelli, onboarding_step_completamenti, utenti_cancellati, voce_extra_mese, voci_extra_mese, segnatempo (pagina la legge; 0 righe) |
| G2 | **2 viste mancanti** in app_hr | allocazioni_costo → hr.allocazioni_costo; kpi_master → hr.kpi_master (+ verifica currency dati vs standalone) |
| G3 | **~24 trigger mancanti** | tutti gli `updated_at`, tutti i `trg_audit_*` (REGISTRO AUDIT CEO!), `tr_sync_organigramma_md_*` (sync organigramma), `tr_sync_dip_fa_principale`. Presenti solo 2 (guard_ultima_fa, guard_attivazione_bu_bs) |
| G4 | **~8 funzioni mancanti** | fn_audit_log, fn_sync_dip_fa_principale, fn_sync_organigramma_on_md_{insert,update,delete}, set_updated_at, tipo_oda_da_dipendente, cdg_replace_allocazioni — da portare con **adattamento schema** (public.* → hr.*/app_hr.*), MAI copia cieca |
| G5 | **2 bucket storage mancanti** | qnet-imports, documenti-hr (+ copia oggetti esistenti) |
| G6 | **identity mancante** | hr_qnet_sync_log.id bigint senza default (standalone = identity) → cron qnet-sync romperebbe |
| G7 | Enum→text sul nucleo | validazione persa: valutare CHECK constraints (non bloccante per flip) |
| G8 | Delta dati | mansioni_dipendente Δ1 (riga 30/06 solo standalone) + delta accumulati fino al flip |

Volumi G1: 58 righe totali (wiki 12, attivita_esclusa 42, onb_modelli 1, utenti_cancellati 3, resto 0).

## 3. FASI — STATO ESECUZIONE 02/07 pomeriggio
- **F1 ✅** 13 tabelle create in app_hr (13 CREATE, 44 constraint, 30 indici, RLS 37/37, FK rimappate — le 2 FK a `commesse` corrette sul nucleo). SQL: `f1-app-hr-13-tabelle.sql`.
- **F2 ✅** Viste allocazioni_costo (24=24) + kpi_master (18=18).
- **F3 ✅** 58 righe copiate 1:1 (wiki 12, attivita_esclusa 42, onb_modelli 1, utenti_cancellati 3).
- **F4 ✅** 26 trigger + 6 funzioni portate schema-qualificate; `app_hr.audit_log` ricreata come TABELLA HR-format (la vista puntava al registro HUB, formato sbagliato); UNIQUE (ruolo,dip) su organigramma_assegnazione; identity su hr_qnet_sync_log; **smoke test**: update dipendenti → audit row + updated_at ✓ (rollback). SQL: `f4-hr-funzioni-trigger.sql`.
  - **BUG TROVATO E FIXATO ANCHE SU STANDALONE**: `fn_audit_log` faceva `NEW.id` → esplodeva su configurazioni (PK=chiave). Fix jsonb con fallback id→chiave (`f4c-fix-fn-audit-log.sql`), applicato a ENTRAMBI i DB.
- **F5 ✅** Bucket documenti-hr + qnet-imports creati su bqyqr (config identica), 6/6 file copiati (1.9MB).
- **F6 ✅** RPC diff: hr_dip_fa_replace / hr_assegna_funzione_aziendale / guardie = port corretti (schema-qualify + search_path), non copie stantie.
- **F7 ✅** `hr-delta-sync-erp.py` (upsert+delete, chiavi per-tabella: configurazioni=chiave, onboarding_alerts_sent=composita, dfa=replace-mode con trigger sospesi) → **52/52 TABELLE ALLINEATE**. Ancore HR aggiunte a `doppio-binario-erp.py` (10 ancore).
- **F8 ✅ (salvo coda storico)** 53/53 tabelle richieste dal codice presenti; 0 id senza default nel nucleo; 26 trigger; RLS 0 mancanti; bucket 2+6 file; 12 INSERT di prova via viste tutti ok (rollback). In coda: copia storico audit_log (353k righe, job `hr-audit-history-copy.py` in esecuzione).
- **EXTRA (mine trovate dall'audit, disinnescate)**: `app_hr.societa` e `app_hr.commesse` puntavano alle consolidate ERP con FORMA DIVERSA e righe diverse (0/16 commesse HR contenute!) → create `hr.societa` (8) e `hr.commesse` (16) forma-HR e viste ripuntate (`f8pre-hr-societa-commesse.sql`); FK dipendenti→societa/reparti ripristinate (0 orfani). TODO futuro: consolidamento concettuale con cdg.societa / commesse.commesse (sentinella-cross).

## F9 — RUNBOOK FLIP (GATE: co-pilot Enrico, mai cieco, ~10′)
1. `python3 hr-audit-history-copy.py` fino a "FINITO" + `python3 hr-delta-sync-erp.py` → tutto ✅ (delta finale, ~2′).
2. `python3 doppio-binario-erp.py --no-log` → ancore HR 0 drift.
3. Vercel `qualifica-hr-operativa` (Production): aggiungi `ERP_SUPABASE_URL=https://bqyqrqmbekdhejrzasvv.supabase.co`, `ERP_SUPABASE_SCHEMA=app_hr`, `ERP_SUPABASE_SERVICE_ROLE_KEY=<service bqyqr>` + redeploy.
4. Collaudo live (con Enrico): crea+elimina mansione di prova; scheda dipendente; assegna FA (RPC); organigramma; wiki; upload documento (bucket!); voci extra; audit page; attesa 5′ → cron qnet-sync scrive su hr_qnet_sync_log senza errori.
5. Se qualsiasi cosa storta → rollback 2′: rimuovi le 3 env + redeploy (procedura collaudata 2 volte).

## 4. FIA (cantiere 2, stesso metodo)
app_fia: 10 tabelle base con id senza default + inventario codice/oggetti da fare ex-novo (app esterna importata). Solo dopo HR.

## 5. Rischi principali
1. Trigger portati male → rompono scritture di ALTRE app flippate sul nucleo → mitigo: schema-qualify + test per trigger + F8.
2. Storage dimenticato (upload morti) → F5 esplicita.
3. Drift dati durante il cantiere → F7 doppio-binario + delta al flip.
4. RPC stale in app_hr (copia vecchia) → F6 diff.
