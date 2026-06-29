# 🔴 RUNBOOK — Spegnimento DB vecchi (gate finale, IRREVERSIBILE)

> NON eseguire prima di **≥3 giorni-verdi consecutivi** in `public.erp_cutover_health`
> (monitor `stato-cutover-erp.py`, giornaliero). Oggi = giorno 1.
> Cancellare un DB è permanente: lo fa il CEO, non Claude (regola). Claude prepara/assiste.

## DB vecchi da spegnere (sorgenti pre-cutover, ora congelate — le app scrivono su bqyqr.app_*)
| App | DB vecchio (ref) | Schema bqyqr che lo sostituisce |
|---|---|---|
| sales | `vqtqccnbwkslbnxlfskk` | app_sales |
| qcont | `eqprzkdehxustaoeeaoy` | app_qcont |
| HR | `hsoovytrzxcllbawpvwt` | app_hr |
| fia | `oawroqmqepwcndcbvnba` | app_fia |
| commesse (sue tabelle) | `bhroniqxvzotmdkztxnl` | app_commesse |
> ⚠️ STW (`odjwvqabxkkpyblghruv`) NON si spegne: è il master read-only di commesse/discenti, ancora letto da commesse + dashboard.

## Procedura STAGED (sicura, reversibile fino all'ultimo passo)
**Pre-condizione:** `select count(*) from (select date_trunc('day',eseguito_at) d, bool_and(tutte_verdi) v from public.erp_cutover_health group by 1) t where v` ≥ 3.

1. **PAUSA (reversibile)** — su Vercel/Supabase, metti il DB vecchio in pausa (Supabase: Project → Pause), NON delete. Le app non lo usano più → nessun impatto. Osserva 1-2 giorni: se qualcosa si rompe, *resume* in 1 click.
2. **BACKUP finale** — scarica un backup completo di ogni DB vecchio (Supabase → Database → Backups → download, oppure `pg_dump` con la connection string) e archivialo. **Questo conserva la storia (es. audit_log 297k di sales).**
3. **DELETE (irreversibile)** — solo dopo pausa-ok + backup salvato: elimina il progetto Supabase vecchio. **Lo fa il CEO** dalla dashboard Supabase.
4. **Pulizia env** — rimuovi le 3 env `ERP_*` NON serve toccarle (restano valide); rimuovi invece le vecchie `NEXT_PUBLIC_SUPABASE_URL`/STW_* obsolete se puntavano ai DB spenti.

## Rollback (se serve tornare indietro PRIMA del delete)
Per ogni app: rimuovi le 3 env `ERP_*` dal progetto Vercel + redeploy → l'app torna a leggere il DB vecchio (se ancora in pausa, fai resume). Reversibile finché il DB vecchio non è cancellato (passo 3).

## Stato
- Giorni-verdi: **1** (serve ≥3). Monitor: `scripts/stato-cutover-erp.py` (cron 08:00).
- Quando arriva a 3: Claude avvisa; pausa+backup li può fare Claude (delegati/reversibili); il **delete finale** lo conferma/esegue il CEO.
