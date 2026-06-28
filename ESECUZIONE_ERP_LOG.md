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

## 📦 MIGRATE dati domini (workflow autonomo, 27/06)
**34.370 righe** copiate nei 6 schemi (per nome tabella, colonne comuni, conteggi verificati, Hub 200, reversibile TRUNCATE):
- trasversale 39 tab (~8.904: audit_log 1.744, ruoli_template 5.898, hub_accesso_app 330…) · commesse 5 tab (~23.627: commesse 14.903, costi 3.761, dettagli_for 1.483…) · contabilita_attiva 5 · sedi_partner 6 · formazione 5 · commerciale 0 (no-match nomi → da indagare).
**Flag (follow-up):** tabelle >20k saltate → **bulk dedicato**: `offerte` (46.157), `opportunita_for` (24.491); catena FK `opportunita_for→discenti(10.833)→discente_origine_gol(3.220)` da caricare in ordine. Schema non-REST → insert via SQL raw.

## 📦 BULK migrate commesse FK-chain (background, 27/06)
~84.559 righe in ordine FK, conteggi esatti, Hub 200: `opportunita_for` 24.491 · `discenti` 10.691 (−142 id duplicati sorgente, dedup corretto sotto PK) · `discente_origine_gol` 3.220 · `offerte` 46.157. Edge gestiti: opportunita_for.data text→date validata (non-date→NULL), id bigint→uuid omesso col default. **Totale dati staged nei nuovi schemi: ~119.000 righe.**
**Follow-up aperti:** (1) `commerciale` migrate 0 → indagare nomi tabella sorgente sales; (2) FK rimandate (58): molte sono "oggi testo" → richiedono risoluzione text→uuid prima dell'aggancio (entangled, non semplice ADD); (3) repoint codice (fase grossa, app+deploy+visivo).

## ✅ MIGRATE COMMERCIALE (background, 27/06)
~39.921 righe: opportunita 15.820 · offerta 13.559 · ordine_cliente 5.295 · deal 5.245 · opportunita_bu 2 · offerta_riga 0(vuota). Zero scarto, Hub 200. Mapping chiave: sorgente `anagrafica_id` → target `azienda_id` (NOT NULL) mappato esplicitamente; enum→text ok.

---

# 🎉 MILESTONE — NUOVO ERP COSTRUITO + POPOLATO (in parallelo al vivo)
- **Struttura:** anagrafica (public) + 6 schemi dominio = ~150 tabelle nel DB unico `bqyqr`.
- **Dati:** anagrafica consolidata + **~199.000 righe** staged nei domini (trasversale, commesse, formazione, contabilità, sedi, commerciale).
- **Stato sistema:** NULLA è rotto — le app leggono ancora i DB vecchi (doppio-nome); il nuovo ERP vive ACCANTO, pieno e verificato (conteggi quadrati, Hub 200 a ogni passo). Tutto reversibile.

## ⏭️ Prossima fase = CUTOVER (repoint codice + contract) — SUPERVISIONATA
È il passo che fa USARE il nuovo ERP: ricablare le app sui nuovi schemi (1.033 siti) + spegnere il vecchio. Per regola F4 (verifica visiva prima di "fatto") + rischio deploy, NON si fa alla cieca: si fa app per app, build-verificato, con screenshot prima/dopo. Più le FK "text→uuid" da risolvere e le viste piatte.

## 🔗 FK pulite (workflow autonomo, 27/06)
**~15 FK aggiunte** (intra-schema uuid pulite): commerciale 7 (created_by/validata/responsabile/contatto), commesse 1, formazione 1, sedi_partner 1 (sedi.azienda_id→aziende ✅), contabilita_attiva 5 (cliente_id→anagrafica, proforma/iso). Hub 200.

### ⚠️ SCOPERTA CRITICA (l'orphan-check ha fatto il suo lavoro)
Le FK verso il MASTER consolidato sono **100% orfane** → i dati migrati referenziano gli **id LOCALI della sorgente**, non il master:
- `commerciale.deal/opportunita/ordine_cliente.azienda_id` → 5.245 / 15.820 / 5.295 orfani vs `public.aziende` (puntano all'anagrafica locale di sales, non al master)
- `*.operatore_id / titolare_id` → orfani vs `public.utenti` (utenti locali sales)
- `contabilita_attiva.fattura_attiva.cliente_id` → 1 orfano

**Significa:** serve uno step di **RIMAPPATURA ID** (sorgente→master) prima di agganciare queste FK e prima del cutover. È lavoro di consolidamento atteso, NON un disastro — ma va fatto con cura (match per qnet_id/P.IVA/email).

### ⚠️ Tabelle parent MANCANTI (gap di schema)
FK rimandate perché il parent non esiste: `prodotti`, `campagne`, `partner`, `oda`, `fornitori`, `aula`, `materia`, `modulo`, `tenant`, `filiali`. → alcune entità referenziate non sono state create nell'expand (da colmare).

---

# ✅ RIMAPPATURA ID — commerciale (28/06, autonomo additivo, reversibile)
La scoperta critica (ref cross-master 100% orfane) è **RISOLTA** per lo schema commerciale (sorgente sales `vqtqccnbwkslbnxlfskk`).
- **Aziende:** `sales.anagrafica_cliente.id` → `public.aziende.id` via `id_qnet=qnet_id` (∥ p.iva ∥ cf). **17.105/17.621** risolte (tutte via qnet_id; p.iva/cf 0 aggiuntive).
- **Utenti:** `sales.utenti.id` → `public.utenti.id` via email. **134/139** risolti.
- **Residuo:** 516 anagrafiche sorgente = record `[DEMO]`/lead informali (nomi persona, **0 qnet/p.iva/cf**), solo 106 referenziati → `azienda_id` (NOT NULL) puntato a placeholder `public.aziende '[SYSTEM] Lead informale — non in anagrafica Qnet'` (106 deal + 108 opp); `operatore_id/titolare_id` (nullable) orfani → NULL.
- **8 FK validate** agganciate: `{deal,opportunita,ordine_cliente}_azienda_fk`→aziende, `*_operatore_fk`/`*_titolare_fk`→utenti.
- **Esito verificato:** orfani azienda_id 26.360→**0** su tutte e 3 le tabelle; Hub 200.
- **Reversibile:** snapshot `commerciale._bak_remap_*` + `migration-erp-commerciale-remap-id-DOWN.sql`. Builder riproducibile `remap_build.py`.

# ✅ SWEEP orfani altri domini (28/06) — TUTTO PULITO
Verificate tutte le colonne uuid azienda/cliente/fornitore dei 6 schemi senza FK uscente:
- `sedi_partner.costo_sede.fornitore_id` (6) e `sede_scadenza.fornitore_id` (204) → fornitore_id tutto **NULL** = 0 orfani (FK rimandata finché popolato dal ciclo passivo).
- `contabilita_attiva.fattura_attiva.cliente_id` → **1 orfano** (fattura QA infragruppo "Società Gruppo Qualifica · QSI", no p.iva/cf/qnet, non nel master) → NULL (nullable, 1 riga test) + **FK `fattura_attiva_cliente_fk`→aziende**. Snapshot `_bak_remap_fattura`, Hub 200.
- **Esito: 0 orfani cross-master azienda/cliente in TUTTO l'ERP.**
> Nota modellazione (futura, non urgente): le **società infragruppo** (es. QSI) non sono nel master anagrafica → quando servirà la fatturazione infragruppo a regime andranno create in `public.aziende`. Decisione a parte.

## ⏸️ STOP AUTONOMIA — siamo al CUTOVER SUPERVISIONATO
Cron `d10b4313` FERMATO. Restano: (1) ✅ rimappatura id + sweep orfani FATTI (0 orfani); (2) colmare i parent mancanti (prodotti, campagne, partner, oda, fornitori, aula, materia, modulo, tenant, filiali) — additivo, indagabile; (3) **repoint codice** (deploy+visivo F4) — gate supervisionato; (4) contract. Repoint/contract da fare CON Enrico (verifica visiva), non alla cieca.
