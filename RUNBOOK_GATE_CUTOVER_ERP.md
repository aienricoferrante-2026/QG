# 🚦 RUNBOOK — Gate finali del cutover ERP (sessione supervisionata, ~5 min)

> Tutto il **reversibile** è fatto e verde (consolidamento + 0-drift + monitor continuo).
> Restano 2 gate che richiedono **occhi umani** perché toccano login condiviso o sono irreversibili.
> Pre-condizione comune: `public.erp_doppio_binario_log` **VERDE da ≥3 giorni** (cron ogni 4h).

---

## GATE 1 — Flip in lettura di un'app viva (template: sales/commerciale)

**Cos'è:** puntare il path-dati di lettura di UNA app dal suo DB al DB unico `bqyqr`.
**Perché umano:** la verifica finale = **login reale nell'app + click** (non verificabile headless).
**Rischio:** medio (reversibile via revert del deploy in <2 min).

**Pre-check (automatico, lo eseguo io prima della sessione):**
- [ ] `doppio-binario-erp.py` = VERDE 8/8.
- [ ] viste/compat-layer per l'app presenti in bqyqr.

**Passi (5 min, col team davanti allo schermo):**
1. Su Vercel (env dell'app): `NEXT_PUBLIC_SUPABASE_URL` + ANON + SERVICE_ROLE → progetto **bqyqr**. **NON toccare** `AUTH_SUPABASE_URL` (resta bqyqr: il login NON cambia).
2. Redeploy.
3. **Verifica umana:** login nell'app → 2-3 schermate chiave (liste, dettaglio) → i numeri coincidono con prima (doppio-binario verde lo garantisce).

**Rollback (se qualcosa non torna):** ripristina le 3 env var al progetto vecchio → redeploy. <2 min, zero perdita dati (lettura).

---

## GATE 2 — Tabelle login/auth + spegnimento DB vecchi

**Cos'è:** (a) qualsiasi modifica a `auth.*` di bqyqr; (b) decommission dei DB sorgente.
**Perché umano + NON anticipabile:** `bqyqr.auth` serve già il **login di ~10 app** → un errore = 10 app fuori, **non verificabile headless**. Lo spegnimento è **irreversibile**.

**Regola dura (vale anche con pre-autorizzazione):**
- `auth.*` si tocca SOLO con un umano che fa login su tutte le app dopo ogni passo.
- Lo spegnimento si fa SOLO dopo **≥3 giorni** di `erp_doppio_binario_log` verde **con le app già flippate** (doppio-binario reale, non snapshot). Prima è prematuro per definizione, non per permesso.

**Quando i DB vecchi sono spegnibili:** quando nessuna app punta più lì (env tutte su bqyqr) E il monitor è verde da giorni. A quel punto: snapshot finale di backup → pausa progetto (non delete) per 7 giorni → delete.

---

## Stato pre-condizioni (aggiornato 29/06)
- Consolidamento: ✅ 12 schemi · 0 FK non valide · 10 viste-cutover.
- Doppio-binario: ✅ VERDE 8/8 (contabilita, cdg €102M al centesimo, commerciale CRM).
- Monitor continuo: ✅ cron 4h → `erp_doppio_binario_log`.
- Giorni-verdi accumulati: **giorno 1** (serve ≥3 per Gate 2).
