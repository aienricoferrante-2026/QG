# 🧰 Backlog comandi "/" — DA CONFIGURARE *dopo* il completamento ERP

> Lista congelata (27/06). **Non si configura ora** — prima si completa tutto il PIANO_MASTER_ERP. Poi si attivano questi.

## A) Built-in già esistenti — solo da sapere/usare
| Comando | Uso per noi |
|---|---|
| `/schedule` | Routine **cloud** (girano ad app chiusa) → **report ERP mattutino** + stato coordinatori, senza chiedere |
| `/code-review ultra` (ex `/ultrareview`) | Revisione multi-agente cloud di un ramo/PR → **ipercontrollo prima di mandare in main** repoint/contract |
| `/security-review` | Check sicurezza prima dei deploy che toccano auth/route |
| `/verify` · `/run` | **Far girare l'app e vedere** la modifica (regola F4 "verifico io nel PC, screenshot prima/dopo") |
| `/loop` | Task ricorrenti (già usato per l'auto-continua) |
| `/clear` · `/compact` | Azzerare contesto quando si appesantisce → riparte dalla memoria (resume point) |
| `/remember` | Salvare al volo una decisione in memoria |

## B) Comandi CUSTOM da creare (workflow nostro)
| Comando | Cosa fa | Perché |
|---|---|---|
| `/stato-erp` | Legge ESECUZIONE_ERP_LOG.md → slice fatte/restanti, gate pendenti, prossimo passo | Stato in 3 secondi senza chiedere |
| `/riprendi-erp` | Riprende l'esecuzione autonoma del piano (oltre al cron) | Spinta manuale quando vuoi |
| `/gate` | Presenta la prossima decisione di gate come **sì/no** con proposta | I 2 stop (login, spegnimento) arrivano già pronti da decidere |
| `/report-mattutino` | Genera il riepilogo giornaliero (collegato a `/schedule`) | Ti informa senza che chiedi |
| `/custode <area>` | Lancia il referto custode-modello-dati-erp su una migration/area | Firma 9-regole on-demand |
| `/albero <entità>` | Mostra/genera l'albero dei campi (dizionario dati) di un'entità | Vedere dove va ogni campo |
| `/verifica-visiva <url>` | Entro nel PC, screenshot prima/dopo di una pagina | Il tuo F4, automatizzato |

## Quando configurare
Dopo che il PIANO_MASTER_ERP è eseguito al 100% (tutte le entità: expand→migrate→repoint→contract + guscio unico). Allora apriamo questo file e li attiviamo uno per uno.
