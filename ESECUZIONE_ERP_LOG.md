# 🛠️ Esecuzione ERP — Ledger delle slice applicate

> Registro append-only di OGNI migration applicata in produzione (DB `bqyqr`). Governance: standard R1-R9 + custode + hook. Autorizzazione: VAI additivo standing di Enrico (27/06) — gli apply ADDITIVI (nuove tabelle/colonne, reversibili) si fanno senza OK esplicito; gli IRREVERSIBILI (drop colonne vecchie, migrazione dati condivisi, tabelle login) restano al cenno di Enrico.

| # | Data | Slice | Tipo | Referto custode | Esito | DOWN |
|---|---|---|---|---|---|---|
| 1 | 2026-06-27 | Aziende S1 — nucleo (5 col) + `aziende_commerciale` (17 col) | expand (additivo) | ✅ CONFORME | ✅ applicato + verificato (Hub 200, 18.268 righe intatte) | `migration-erp-aziende-s1-expand-DOWN.sql` |
| 2 | 2026-06-27 | Aziende S2 — `aziende_qualifiche` (11 col) + `aziende_indirizzi` (9 col) | expand satelliti (additivo) | ✅ CONFORME | ✅ applicato + verificato (Hub 200) | `migration-erp-aziende-s2-satelliti-DOWN.sql` |

| 3 | 2026-06-27 | Aziende S3 — migrate referente* → `aziende_commerciale` (9.892 righe) | migrate (doppio-nome, reversibile) | n/a (dati in struttura additiva) | ✅ applicato + verificato (match esatto 9.892, Hub 200, referente* ancora su aziende) | `TRUNCATE aziende_commerciale` |

| 4 | 2026-06-27 | Anagrafica S4 — `contatti`+tags, `contatti_aziende` (N:N), `utenti`+avatar_url, `utenti_qnet_mapping`, vista `v_aziende_full` | expand (additivo) | ✅ CONFORME | ✅ applicato + verificato (vista 18.268 righe, Hub 200) | `migration-erp-anagrafica-s4-...-DOWN.sql` |

> **🎯 ANAGRAFICA MASTER — EXPAND COMPLETO:** Aziende (nucleo+commerciale+qualifiche+indirizzi) · Contatti (+contatti_aziende N:N) · Utenti (+utenti_qnet_mapping) · vista piatta `v_aziende_full`. Tutto live in `bqyqr`, additivo, reversibile, Hub 200.
> **Nota divergenza:** `aziende_commerciale` (S1) ha `referente*` che il piano mette nei Contatti → si sposteranno al migrate Contatti, poi drop. Dato salvo (doppio posto).
| 5 | 2026-06-27 | Anagrafica S5 — migrate referente*→Contatti (dedup email) | migrate (reversibile) | n/a | ✅ applicato + verificato: 9.892 link, 1.500 dedup su esistenti + 8.392 creati, contatti 14.113→22.505, Hub 200 | `migration-erp-anagrafica-s5-...-DOWN.sql` |

> **Anagrafica: expand completo + migrate Aziende(is_cliente, referente) + migrate Contatti (referente→contatti_aziende) fatti.**
> **⚠️ is_partner — BLOCCATO (non forzato):** né qcont (56 partner, ~0 P.IVA) né sales (1 partner) hanno identificativi per un match certo al master. Regola "match certo o non fondo" applicata. Serve slice dedicata di **risoluzione identità partner** (GAP 1 audit: STW/FOR/Q-CONT senza FK comune). NON automatizzabile — probabile match per ragione sociale + conferma, o fix dati sorgente. Stesso problema per is_fornitore (1/18.268).
> **Prossimo (passi pesanti, non backfill):** sync Qnet → `utenti_qnet_mapping` (gestore/commerciale/qnet_user_id) · **repoint** codice (gate deploy) → **contract**.

## Protocollo per ogni apply (rispettato)
1. Referto ✅ custode-modello-dati-erp (regola per regola).
2. Apply in **transazione atomica** (un errore = rollback totale).
3. Verifica: colonne/tabella/FK esistono (information_schema).
4. Health-check delle app sul DB toccato (Hub `bqyqr` → 200).
5. Conteggio righe pre-esistenti intatto.
6. Log qui + DOWN pronta.

## Rollback (se mai servisse)
Per la slice 1: applicare `migration-erp-aziende-s1-expand-DOWN.sql` (DROP tabella + DROP 5 colonne). Reversibile al 100%, additivo = zero dati pre-esistenti persi.
