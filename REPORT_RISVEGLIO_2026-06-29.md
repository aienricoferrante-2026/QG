# ☀️ REPORT RISVEGLIO — Cutover ERP · 29/06/2026

> Letto questo, in 30 secondi sai cosa è pronto e cosa facciamo insieme in 10 minuti.

## ✅ Quello che PUOI USARE SUBITO, al 100% (verificato a vista stanotte)
Il tuo **controllo via Hub** sui 4 domini che usi è **live sul database unico**, verificato in Chrome:

| Dominio | Pagina Hub | Dato live |
|---|---|---|
| **SALES** | `/commerciale-pipeline` | **15.820** opportunità ⋈ aziende ⋈ operatori |
| **QCONT** | `/provvigioni-partner` + `/oda-erp` | **€1,63M** provvigioni (17 partner) · 34 ODA |
| **COMMESSE** | `/commesse-erp` | **14.903** (14.900 con azienda master) + ricavi/MOL |
| **HR** | `/hr-dipendenti` | **161** dipendenti + sede + login |
| Cruscotto | `/erp-consolidato` | lega tutto + integrità |

→ Apri `app.qualificagroup.com`, queste pagine leggono già dal DB unico. **Per controllare i numeri consolidati non devi fare nulla.**

## ✅ Quello che ho COSTRUITO e MESSO IN SICUREZZA stanotte (reversibile)
- **Monitor doppio-binario continuo** (cron ogni 4h): confronta sorgenti-live vs DB unico su 8 ancore. **Stanotte: VERDE 8/8, 0 drift** (CRM 15.820=15.820, CdG €102M al centesimo). Storico in `public.erp_doppio_binario_log`.
- **Integrità DB unico:** 0 FK non valide, 12 schemi, re-audit verde.
- **Runbook + script** del flip pronti (`RUNBOOK_GATE_CUTOVER_ERP.md`).
- Tutto committato e pushato.

## ⏳ Quello che facciamo INSIEME, 10 minuti (NON l'ho fatto alla cieca, e ti spiego perché)
**Far SCRIVERE le 4 app (sales/qcont) sul DB unico** — il "flip" vero — l'ho lasciato per noi due perché:
1. La verifica è **loggarsi nelle app**: di notte non posso farlo al posto tuo, e su sales/qcont si muovono **fatturato e soldi**. Un errore non visto per 6h = danno agli incassi.
2. Tecnicamente ogni app va ripuntata con il suo **schema dedicato** in bqyqr (le app condividono `public`, si scontrerebbero) → preparato come pattern, si esegue con un occhio umano.

**Le tue app intanto funzionano come sempre sui loro DB: non hai perso nulla.**

### Il piano dei 10 minuti (quando ci sei)
1. Pilota su **fia** (app piccola, 0 soldi) → flip su PREVIEW, tu fai 1 login, benedici il pattern. (2 min)
2. Applico lo stesso pattern a **commesse → hr → sales → qcont**, una alla volta, tu guardi una schermata per ognuna. Rollback <2 min se qualcosa non torna. (8 min)
3. Gate login/auth + spegnimento DB vecchi: **dopo** giorni di monitor verde, da un tuo secondo device.

## In una riga
**Controllo consolidato = 100% tuo adesso. Flip-scrittura delle app = 10 minuti con me, a colpo sicuro, quando vuoi.** Scrivi "facciamo il flip" e partiamo.
