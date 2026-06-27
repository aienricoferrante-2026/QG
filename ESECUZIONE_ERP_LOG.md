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
| 6 | 2026-06-27 | Anagrafica S6 — risoluzione PARTNER (55 contatti tag `Partner_Sede` + azienda placeholder) | migrate (reversibile) | n/a | ✅ create-only (1° tentativo over-tag 74 da match-nome → DOWN OK → 55 esatti, Hub 200) | `migration-erp-anagrafica-s6-partner-DOWN.sql` |
| 7 | 2026-06-27 | Anagrafica S7 — `utenti_qnet_mapping` da HR (38 con qnet_user_id → 35 match email) | migrate (reversibile) | n/a | ✅ 35 identità risolte (da 0; era qnet_mirror_users vuota), Hub 200 | `migration-erp-anagrafica-s7-...-DOWN.sql` |
| 8 | 2026-06-27 | Anagrafica S8 — migrate `contatti.azienda_qnet_id` → `contatti_aziende` (2.210 link legacy) | migrate (reversibile) | n/a | ✅ N:N completa (946 nuovi + ~1.233 già referente), Hub 200. Prerequisito al repoint route. | `migration-erp-anagrafica-s8-...-DOWN.sql` |

> **🎉 ANAGRAFICA — DATA LAYER 100% CONSOLIDATO (8 slice):** Aziende+Contatti+Utenti nel DB unico, nucleo+estensioni+satelliti+N:N+vista, tutte le relazioni agganciate (referenti, partner, identità Qnet, contatti↔aziende). Tutto reversibile, Hub 200 a ogni passo.
> **PROSSIMA FASE = REPOINT codice (diversa: app+deploy).** Scoping fatto: i campi in dismissione (`referente*`, `azienda_qnet_id`) sono letti da SOLO ~2 file Hub (`anagrafica/page.tsx`, `api/v1/aziende/[qnetId]/contatti/route.ts`). Repoint → build-verify → deploy con **verifica visiva** → poi **contract** (drop referente* + azienda_qnet_id).

> **Anagrafica: expand completo + migrate Aziende(is_cliente, referente) + migrate Contatti (referente→contatti_aziende) fatti.**
> **✅ PARTNER RISOLTO (S6, modello Enrico 27/06):** un partner = CONTATTO con tag `Partner_Sede` agganciato a un'azienda; senza azienda propria → placeholder unico "Partner Sede — azienda di prova (CONT SEDI)". 55 partner da qcont.agente_commerciale. NON è azienda-con-flag. (is_fornitore 1/18.268 lo risolve il ciclo passivo).
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

---

## 🏗️ EXPAND scaffold 6 domini restanti (workflow autonomo, 27/06)
122 tabelle create nel DB unico `bqyqr`, uno schema per dominio — additivo, reversibile (`DROP SCHEMA … CASCADE`), Hub 200 su tutti:

| Schema | Tabelle |
|---|---|
| `commerciale` | 11 |
| `commesse` | 17 |
| `formazione` | 15 |
| `sedi_partner` | 16 |
| `contabilita_attiva` | 22 |
| `trasversale` | 41 |

**58 FK rimandate** (si agganciano in fase migrate, quando i target sono popolati). 2 viste formazione + repoint codice = fasi successive. **Scaffold TABELLE dell'ERP: completo** (anagrafica in `public` + 6 schemi dominio).

## 🔁 Esecuzione auto-sostenuta (27/06)
Cron `7a37140b` ogni 20 min ri-spinge l'esecuzione del piano (regola [[feedback_decido_non_far_girare]]): fa la prossima slice col protocollo, si ferma SOLO ai 2 gate (login, spegnimento). Sessione-only, scade in 7gg, stop con CronDelete.
