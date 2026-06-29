# 🚦 RUNBOOK — Flip SALES e QCONT su DB unico (procedura supervisionata, ~10-15 min/app)

> Pattern **già provato in produzione su fia + HR**. sales/qcont sono identici nel metodo,
> ma muovono **fatturato/incassi** → si fanno con il CEO che opera l'app e guarda le automazioni.
> `app_sales` (72 tab) e `app_qcont` (79 tab) sono **già costruiti e inerti** in bqyqr.

## Pre-condizioni (verificate)
- [x] `app_sales` / `app_qcont` esposti in PostgREST, grant service_role, letture+scritture testate.
- [x] Meccanismo flip: `@qualifica/auth` `supabaseAdmin()` env-driven (ERP_SUPABASE_URL/KEY/SCHEMA) — già su main.
- [ ] **DECISIONE audit_log** (solo sales): backfill 297k via `pg_dump`/`COPY` PRIMA del flip, **oppure** catena audit fresca su bqyqr (i 3 trigger immutabilità/hash-chain si attivano al flip). → scelta CEO.
- [ ] **Bug 2 fn qcont** (`bu_codice`→`fa_codice`): fix nel sorgente dal team (task aperto) — o accettare che restino rotte come oggi.

## Passi flip (per ciascuna app — esempio SALES, progetto Vercel `qualifica-wea-sales`)
1. **Sync di allineamento** (lo snapshot deriva mentre l'app lavora — il monitor lo conferma):
   re-sync `app_sales` ← sorgente sui dati cambiati, **con trigger disabilitati durante il sync**
   (`alter table … disable trigger all;` upsert; `enable trigger all;`) per non rifirare le automazioni.
   → da fare nella finestra, a ridosso del flip (minimizza la deriva).
2. **Env su Vercel** (progetto dell'app): aggiungi 3 var **Production**
   `ERP_SUPABASE_URL=https://bqyqrqmbekdhejrzasvv.supabase.co`,
   `ERP_SUPABASE_SERVICE_ROLE_KEY=<service_role bqyqr>`,
   `ERP_SUPABASE_SCHEMA=app_sales` (per qcont: `app_qcont`).
   **NON toccare** `NEXT_PUBLIC_SUPABASE_URL` (auth invariata).
3. **Redeploy** (push o `vercel --prod`). Attendi Ready.
4. **TEST AUTOMAZIONI (il CEO opera l'app)** — il pezzo che richiede occhi umani:
   - SALES: crea/avanza un'**opportunità** → deve generare il **deal** (trg `opportunita_crea_deal`);
     marca un'**offerta vinta** → deve creare l'**ordine cliente** (trg `offerta_vinta_crea_oc`);
     controlla che i numeri pipeline/KPI tornino.
   - QCONT: verifica un calcolo (liquidazione IVA / provvigione / ODA) su un caso noto.
   - Audit: una modifica → riga in `audit_log` (catena, se attivata).
5. **Verifica a vista** anche da Hub (le dashboard leggono lo stesso bqyqr).

## Rollback (<2 min, reversibile)
Rimuovi le 3 env `ERP_*` dal progetto Vercel + redeploy → `supabaseAdmin()` torna al DB storico.
(Oppure `vercel rollback`.) `app_sales`/`app_qcont` restano in bqyqr, inerti.

## Ordine consigliato
qcont prima (contabilità, meno scritture interattive di un CRM) **oppure** sales prima (più semplice da testare a vista).
Poi giorni di **doppio-binario verde** (monitor) prima dello **spegnimento DB vecchi** (gate finale irreversibile).
