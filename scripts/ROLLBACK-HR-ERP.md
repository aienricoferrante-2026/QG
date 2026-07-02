# ROLLBACK HR ERP → hsoovytrzxcllbawpvwt (02/07/2026)

Motivo: creando una **nuova mansione** (e qualsiasi nuovo record) usciva
`null value in column "id" of relation "mansioni" violates not-null constraint`.

## Causa radice
La HR era flippata sull'ERP dal ~29/06 (env `ERP_*` su Vercel, create 3gg fa).
Il cutover ha copiato i **dati** in `app_hr` ma NON gli oggetti di schema:
le colonne `id` in `app_hr` hanno perso il **DEFAULT** (`uuid_generate_v4()`),
il **PRIMARY KEY** e (già noto) le **FK**. Quindi ogni INSERT senza `id`
esplicito → id null → errore. Le PATCH/UPDATE invece funzionavano (non serve
generare id), per questo il problema si è visto solo alla CREAZIONE.

Ampiezza: 16 tabelle `app_hr` con `id` senza default (mansioni, dipendenti,
funzioni_aziendali, commesse, sedi, organigramma_*, ecc.). Stesso difetto in
`app_fia` e `app_sales`.

## Perché rollback e non fix-in-place
- Il DB standalone HR (`hsoovytrzxcllbawpvwt`, schema public) è SANO: gli INSERT
  funzionano (verificato via REST service_role).
- I due DB erano IDENTICI (conteggi + max(created_at) uguali su mansioni 47,
  dipendenti 161, FA 30, sedi 55, org 165) → il doppio-binario teneva lo
  standalone allineato → **rollback senza perdita dati**.
- `app_hr` è un mirror incompleto (default+PK+FK mancanti): rattopparlo live
  sotto incidente avrebbe solo scoperto il prossimo buco.

## Cosa ho rimosso (Vercel, progetto `qualifica-hr-operativa`, Production)
    ERP_SUPABASE_URL              = https://bqyqrqmbekdhejrzasvv.supabase.co
    ERP_SUPABASE_SCHEMA           = app_hr
    ERP_SUPABASE_SERVICE_ROLE_KEY = <service_role di bqyqr>
Poi redeploy produzione (deployment hny0xr403, ● Ready). AUTH intatta
(`AUTH_SUPABASE_URL`/`HUB_SUPABASE_URL` → bqyqr NON toccate: login unico ok).

## Verifica post-rollback
- https://qualifica-hr-operativa.vercel.app → HTTP 200 (no boot error)
- INSERT mansione (fa_id ACR, no id) sul DB standalone → id generato ✅ (ripulito)

## Architettura VERA scoperta (02/07)
`app_hr` NON è un mirror di tabelle: è una **facciata di VISTE** (mansioni, dipendenti,
funzioni_aziendali, sedi, organigramma_*, commesse, societa…) su schemi NUCLEO
(`hr.*`, `commesse.*`, `cdg.*`, `public.*`) + ~24 tabelle proprie (attivita, mansione
singolare, onboarding_*, presenze, richieste, dipendente_*…). L'INSERT nella vista
(auto-updatable) viene inoltrato alla tabella nucleo. L'errore "null id" veniva da
`hr.mansioni` (nucleo) che aveva perso il DEFAULT.

## FATTO 02/07 (sicuro, applicato a bqyqr — vale anche da rollbackati)
Ripristinati **44 DEFAULT** persi sulle 9 tabelle nucleo write-path
(`hr.mansioni, dipendenti, funzioni_aziendali, sedi, mansioni_dipendente,
organigramma_assegnazione/ruolo/unita, costi_personale_periodo`): id→gen_random_uuid(),
timestamp→now(), enum→text literal, ecc. SQL: `scripts/fix-hr-nucleo-defaults.sql`.
PK/FK erano già intatti sul nucleo. Verificato: INSERT via TUTTE le viste app_hr
(mansioni, dipendenti, funzioni_aziendali, organigramma_unita, sedi) genera l'id — in ROLLBACK.

## PERCHÉ NON HO RI-FLIPPATO (blocco reale, non parcheggio)
`app_hr` è **incompleto**: mancano **16 tabelle** che la HR usa e che NON esistono
proprio su bqyqr → flippare ora darebbe "tabella non trovata" su 16 funzioni:
competenze/competenze_dipendente/competenze_mansione (skill matrix), kpi_compilati,
segnatempo, corsi_assegnati, onboarding_modelli, onboarding_step_completamenti,
contenuti_wiki, voce_extra_mese, voci_extra_mese, sessioni, utenti_cancellati,
mansioni_dipendente_attivita_esclusa, v_costo_totale_mese, v_dipendente_attivita_attive.
(Esistono già su bqyqr: allocazioni_costo→hr, kpi_master→hr, audit_log_unified→public.)
Divergenza dati reale ma minima sulle tabelle presenti: `mansioni_dipendente` Δ1 (una
riga del 30/06 solo su standalone). audit_log/commesse/societa "divergono" ma sono
log / tabelle dove l'ERP è più ricco (non perdita).

## COMPLETARE il cutover HR (cantiere, da fare metodico — NON di fretta)
1. Migrare le 16 tabelle mancanti su nucleo (struttura+dati+PK+FK+default+indici; enum→text).
2. Esporre tutte in `app_hr` come viste (o tabelle) — dipendenze in ordine (competenze
   prima di competenze_dipendente/_mansione; onboarding_modelli prima di step_completamenti).
3. Riconciliare i dati (delta mansioni_dipendente, ecc.) e agganciarle al doppio-binario.
4. Audit VERDE (parità tabelle+colonne+default+FK) + test INSERT per ogni vista.
5. Solo allora: ri-aggiungere env ERP_* + redeploy + verifica feature-per-feature.
Stessa procedura per `app_fia` (10 tabelle id senza default; verificare completezza mirror).
