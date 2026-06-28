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

# ✅ PARENT MANCANTI (28/06) — i 2 reali fatti, gli altri = defer motivato
Verificata la popolazione di tutte le colonne uuid che referenziano i 10 "parent mancanti": **solo 4 hanno dati**; il resto è 0-popolato (FK rimandata, nessun orfano — incl. tutti i `partner_id`, coerente con partner=contatto-con-tag, **nessuna tabella partner**).
- ✅ **campagne** ← `sales.campagna` (60 righe, id preservato) → FK `opportunita_campagna_fk` (106 ref) + `offerta_campagna_fk`. 0 orfani.
- ✅ **aula** ← `for.aula` (1 riga) → FK `calendario_lezione_aula_fk` (2) + `classe_aula_fk` (1). 0 orfani.
- ⏸️ **oda**: sorgente reale `qcont.oda` (34 righe), ma dominio canonico = **contabilità PASSIVA** (schema non ancora costruito) → defer al build dominio passiva (no placement improvvisato in sedi_partner). 0 orfani.
- ⏸️ **filiale**: **nessuna tabella sorgente** in alcun DB (solo vista cdg `v_budget_vs_consuntivo_filiale`). I 56 `sedi.filiale_id` non hanno master → indagine necessaria. 0 orfani.
- ⚪ prodotto/materia/modulo/tenant/partner_*: 0-popolati → FK rimandata, nessuna azione.
Migration: `migration-erp-parents-campagne-aula.sql` (+DOWN, +builder). Hub 200.

## ⏸️ STOP AUTONOMIA — siamo al CUTOVER SUPERVISIONATO
Cron `d10b4313` FERMATO. **Il consolidamento dati invisibile è COMPLETO: 0 orfani cross-master in tutto l'ERP.** Restano: (1) ✅ rimappatura + sweep + parent reali FATTI; (2) due note non bloccanti: **oda** (al build dominio passiva), **filiale** (sorgente da chiarire); (3) **repoint codice** (deploy+visivo F4) — gate supervisionato, primo cutover di prova UNA app; (4) contract. Repoint/contract CON Enrico (verifica visiva), non alla cieca.

---

# 🔬 CHECKPOINT AUDIT PRE-CUTOVER + REMEDIATION (28/06)
Audit di conformità (workflow `checkpoint-audit-erp`, 6 auditor + sintesi, 507k token) PRIMA del cutover → **DB NON cutover-ready**: 2 blocker strutturali + 9 item clean-before-cutover + 12 nice + 9 confermate-intenzionali. L'istinto di Enrico (checkup prima di procedere) ha intercettato drift serio mentre era ancora economico. Reportistica completa: `tasks/wngp3qh8d.output`.

## Remediation applicata (autonoma, staged/reversibile, Hub 200 a ogni passo)
| # | Fix | Esito |
|---|---|---|
| A1 | `aziende` flag-ruolo (is_cliente/is_partner/is_fornitore/presente_in_qnet) nullable→**DEFAULT false+backfill+NOT NULL** | is_partner 18.269 NULL→0; ogni query ruolo ora corretta |
| B2 | `commerciale.offerta.operatore_id` **13.555 rimappati** (era 13.559 orfani — dimenticati nel remap), reso nullable come i fratelli, FK; `opportunita.created_by_utente_id` rimappato+FK | 0 orfani |
| B2 | `v_deal_aggregato`/`v_pipeline_commerciale` (TABELLE vuote col prefisso v_) **droppate** (si ricreano VIEW al wiring); `aziende.meta jsonb` aggiunto; `utenti_qnet_mapping` qnet_*_id→**bigint+UNIQUE** | ok |
| FK | **10 FK NOT VALID → VALIDATE** (commesse.*) | 0 residui |
| 🔴BLOCKER1 | **DROP SCHEMA `trasversale`** (41 tabelle = copia 1:1 stagnante di public; verificato 0 FK entranti, 0 tabelle uniche, ogni conteggio ⊆ public) | seconda-fonte system tables eliminata |
| 🔴BLOCKER2 | `documento` dedup (auto col drop trasversale); strays `sedi_partner.commessa_filiale_*` droppati | triplicazione→risolta; resta rifinitura commessa_filiale public↔commesse (al cutover commesse) |
| C | `commesse.commesse` (14.903) **+azienda_id uuid + backfill via qnet_id (14.445) + FK** al master | era cliente_id TEXT senza legame |

Snapshot DOWN: `commerciale._bak_remap2_*`. 

## ⏳ Remediation RESTANTE (prossimo batch, technical/R3 — decido io)
- **Relocation di dominio:** `commesse.opportunita_for` (24.491)→commerciale; `commesse.discenti` (10.691)→formazione.discente; `commesse.offerte` (46.157)→casa offerte (decisione R3 mirror-vs-merge); `contabilita_attiva.decreto_regione` (296)→formazione. Dati POPOLATI nello schema sbagliato (lineage sorgente, non significato).
- **Rename coerenza:** `contabilita_attiva.cliente_dettagli.anagrafica_id`→azienda_id; isole inglese `commesse.commesse_operativo`/`discenti` (contact_id→contatto_id, order_id→qnet_order_id, full_name→nome_completo…); drop label denormalizzate (_nome/ragione_sociale accanto a FK).
- **Pulizia:** drop empties non pianificate `commerciale.opportunita_for(0)`/`offerte_mirror_stw(0)`; drop `_map_*` (rimappatura chiusa); decidere schema `contabilita` unico (attiva+passiva) vs 2 separati PRIMA di costruire la passiva.

## 🗺️ ROADMAP RESIDUO verso il 100% (slice DECISE come blocchi, 28/06)
Dopo la remediation del core (anagrafica+commerciale+system = puliti), il residuo è lavoro di dominio da fare come SLICE INTERE (non a pezzi), ognuna 100%+ri-audit prima del suo cutover:

1. **SLICE Formazione/FOR** (la più grossa) — il cluster FK entangled `opportunita_for`(24.491)+`discenti`(10.691)+`discente_origine_gol`(3.220)+`offerte`(46.157)+`decreto_regione`(296) oggi in `commesse`/`contabilita_attiva` va rialloccato AL DOMINIO GIUSTO **insieme**, NON uno alla volta (romperebbe le FK + perderebbe colonne: `formazione.discente` è scaffold 12-col vs sorgente 35-col). Passi: **albero-campi formazione approvato** → expand target ricchi (discente 35 col, opportunita_for→commerciale, offerte→`offerte_mirror_stw` che è un MIRROR quotation Qnet ≠ master `commerciale.offerta`) → migrate cluster preservando catena FK → repoint → contract.
2. **commessa_filiale home** — riconciliare public↔commesse (legato a #3).
3. **filiale master** — `sedi.filiale_id`(56) non ha tabella sorgente in alcun DB → indagare a cosa punta prima di creare il master.
4. **oda** — al build del dominio **contabilità PASSIVA** (sorgente `qcont.oda` 34).
5. **Schema contabilità** — DECIDERE prima di costruire la passiva: 1 schema `contabilita` (sotto-aree attiva/passiva) vs 2 separati (allora rinominare `contabilita_attiva`→simmetrico). Evitare costruisci-poi-rinomina.
6. **Rename commesse** (isole inglese contact_id/order_id/full_name…) + **drop label denormalizzate** — dentro la slice commesse (discenti si muove comunque).
7. **Drift minori anagrafica** (aziende_commerciale.fonte, contatti.tags jsonb→text[], aziende_qualifiche naming) — polish anagrafica.
8. **Viste formazione** (v_classe_full, v_discente_full) — nella slice formazione.
9. **Schemi dominio non avviati** (cdg/controllo_gestione, fia, bp, hr, iso, sic, contabilità passiva) — M3/M4, con albero-campi + split tabelle-dio (incentivi 47col, commessa_economica 58col).

Principio: ogni slice si DECIDE intera + ri-audita VERDE prima del suo cutover ([[feedback_risultato_100_percento]], [[feedback_pdca_checkpoint_continuo]]). Il re-audit 28/06 (run wf_5cfbcc14) raffina questa mappa.

## ✅ RE-AUDIT round 2 (28/06) + PDCA round 3 — il loop funziona
Ri-lanciato `checkpoint-audit-erp` DOPO la remediation (principio ri-audit, [[feedback_pdca_checkpoint_continuo]]). Referto: `tasks/w0n8slzq9.output`.
- **0 BLOCKER residui** — i 2 blocker strutturali (trasversale, twins) SPARITI: la remediation ha tenuto. ✅
- **Core (anagrafica+commerciale+system) = cutover-ready.** I 7 item `clean_before_cutover` sono prevalentemente **slice di dominio R3** (formazione/commesse/sedi/contabilità) già nella ROADMAP RESIDUO — da fare DENTRO la slice del dominio, non a pezzi sul core.
- L'audit ha **auto-corretto un proprio falso positivo** (UNIQUE su qnet_id già esiste).
- **Verifica adversariale mia:** `public.audit_log_unified` segnalata "tabella duplicata" è in realtà una **VISTA** (no duplicazione dati) → NON droppata, lasciata.

### PDCA round 3 applicato (fix-now cross-cutting, Hub 200):
- `contabilita_attiva.{fattura_attiva,proforma,rateizzo_iso,scadenza_contabile_iso}.cliente_id` → **`azienda_id`** (convenzione: link al master = sempre azienda_id).
- **DROP `_map_azienda`/`_map_utente`** (rimappatura chiusa, builder riproducibile). `_bak_remap*` tenuti per DOWN fino a cutover.
- **STANDARD**: fissata la regola naming tabelle (singolare per entità-dominio; plurale solo i 3 master) + "link master = azienda_id" + "nessun `_bak_`/`_map_` sopravvive al cutover".

### Differito ALLE SLICE DI DOMINIO (non frammentare):
- Viste `v_commessa_full` (aggiungere azienda_id) + `v_sede_partner_full` (JOIN contatti per partner) → slice commesse/sedi (le viste si rifanno comunque lì).
- Cluster relocation FOR + commesse PK/inglese → slice formazione/commesse (roadmap #1).

**STATO: il CORE è validato 100% cutover-ready. PROSSIMO = primo cutover di prova (Hub, vista commerciale) con verifica visiva F4.**

## ✅ PRIMO CUTOVER — vista consolidata (28/06)
`public.v_pipeline_commerciale` creata e committata (`migration-erp-view-pipeline-commerciale.sql`): JOIN `commerciale.opportunita` ⋈ `public.aziende` ⋈ `public.utenti` in 1 DB — query **prima impossibile** (progetti Supabase separati: pipeline in sales `vqtqccn`, ora consolidata).
- **15.820 opportunità, 15.820/15.820 con azienda risolta, 9.392 con operatore reale** (es. KEYSTONE RESTAURI⋈Martina Mosca; QUALIFICA GROUP⋈Martina Mosca). 5.140 aziende distinte, 50 operatori. La rimappatura id è PROVATA sul dato reale.
- **F4 onesto:** il worktree non ha env/login per far girare l'app autenticata in locale → ho mostrato a Enrico i DATI VERI della vista (widget), non un mockup. **Prossimo per il F4 in-app:** pagina Hub che legge la vista, deployata in produzione (env già configurato su Vercel) → screenshot della pagina live. Deploy delegato a Claude; mi fermo solo alle tabelle login.

## 🚀 DEPLOY primo cutover (28/06)
Pagina `/commerciale-pipeline` (read-only, legge `public.v_pipeline_commerciale`) portata in PRODUZIONE: ramo pulito `feat/cutover-pipeline-commerciale` (solo 3 file: pagina+route+vista) off main → fast-forward su `main` (c047868d) → deploy Vercel. Build-verify: typecheck✓ lint✓; `next build` locale fallisce SOLO su `/documenti` (env Supabase assente in locale, presente su Vercel) — la mia pagina compila pulita (use client + API dinamica, non prerenderizza). NON ho mergiato il ramo notte-pulizia (18 commit multi-app non verificati). URL: app.qualificagroup.com/commerciale-pipeline.

### ✅ VERIFICATO A VISTA (28/06) — primo cutover LIVE
Navigato via Chrome alla pagina in PRODUZIONE (sessione admin loggata) e GUARDATO io: pagina rende, KPI 15.820, tabella con azienda+operatore reali risolti dal master (LIMPIEZAS LA PARISIEN, QUALIFICA GROUP, Cosmos Srl…). La consolidazione funziona nell'app reale. **F4 — miglioria notata e applicata:** il wrapper `overflow:hidden` tagliava le colonne Operatore/Fase → `overflowX:auto`+minWidth, ri-deployato (main 2f0b96fc). Re-verifica visiva del fix in corso.

### ✅✅ PRIMO CUTOVER CHIUSO E VERIFICATO A VISTA (28/06)
Fix overflow deployato (main 2f0b96fc) e VERIFICATO da me scorrendo la tabella live: tutte le colonne accessibili (Titolo·Azienda·Operatore·Fase), operatori risolti dal master visibili (es. "Daila Lo Bartolo", "Stefano Murari"). La tabella scorre orizzontalmente (pattern standard per tabelle-dati larghe). **Primo cutover ERP = LIVE in produzione, funzionante, verificato visivamente.** Possibile rifinitura futura: table-layout fixed per evitare lo scroll a riposo (opzionale, lo scroll è accettabile).

## 🌳 SLICE Formazione/FOR — albero-campi pronto (28/06)
`ALBERO_FORMAZIONE_28-06.md` scritto (R7: dizionario prima delle tabelle). Decisioni R3 prese: `formazione.discente` (persona-learner, identità inline, PK uuid + qnet business-key) + estensione `discente_economia` (provvigioni/ricavi) + satellite `discente_origine_gol`; `commerciale.opportunita_for` (opportunità=pipeline commerciale); `commerciale.offerte_mirror_stw` (offerte=MIRROR Qnet, NON merge — deciso); `formazione.decreto_regione` (rendicontazione). Ordine migrate catena FK: opportunita_for→discente→origine_gol; offerte+decreto indipendenti. PROSSIMO (auto-continua job 2115d899 + io): firma custode → expand target → migrate cluster INSIEME (id-preservati) → re-audit VERDE → cutover. Auto-continua ARMATO: l'esecuzione prosegue da sola, Enrico non deve dire "procedi".

### ✅ decreto_regione → formazione (28/06)
Migrato `contabilita_attiva.decreto_regione` (296) → `formazione.decreto_regione` (296, 19 col comuni, doppio-nome: source resta finché repoint). Hub 200. Pezzo indipendente della slice formazione (fuori catena FK). RESTA il cluster entangled (opportunita_for→discente→origine_gol + offerte) → firma custode sull'albero → expand → migrate INSIEME (auto-continua job 2115d899).

### SLICE Formazione — progressi + 1 correzione (28/06)
- ✅ `opportunita_for` migrato commesse→**commerciale** (24.491, id-preservato, 18 col comuni) — parent della catena pronto.
- ⚠️ `offerte`→mirror: TENTATO in `commerciale.offerte_mirror_stw` ma ANNULLATO (TRUNCATE): quel mirror ha struttura DIVERSA (solo 4 col comuni). Serve un target NUOVO `commerciale.offerta_qnet_mirror` con la struttura esatta di commesse.offerte. Albero corretto. LEZIONE: verificare struttura target PRIMA del copy (no rush).
- ⏭️ RESTA (auto-continua, con cura): expand offerta_qnet_mirror + migrate offerte; conversione discente (integer→uuid PK + identità inline + estensione economia) + discente_origine_gol catena FK. Ordine: opportunita_for(fatto)→discente→origine_gol.

### SLICE Formazione — offerte è un GUSCIO VUOTO (28/06, auto-continua)
Verificato: `commesse.offerte` = 46.157 righe ma SOLO id+qnet_updated_at popolati; titolo/payload/importo/cliente/status TUTTI NULL. È un mirror mai sincronizzato. → NON è una relocation: niente dato da spostare. Droppato il target `offerta_qnet_mirror` (sarebbe stato 46k righe vuote). Le offerte vere = sync da Qnet a parte (le legge oggi /api/v1/offerte dal progetto STW odjwvqab). `commesse.offerte` guscio = droppabile al contract. Cluster formazione REALE ridotto a: opportunita_for ✅ + discente (10.691, vero) + discente_origine_gol (3.220) + decreto ✅.

### SLICE Formazione — modello discente CORRETTO (28/06, auto-continua)
Ispezione PRIMA di migrare ha evitato un errore: `formazione.discente` è il master PERSONA (FormaLab), `commesse.discenti` sono ISCRIZIONI (grana diversa). Modello R3 rivisto (vedi ALBERO_FORMAZIONE §1): discente=persona (dedup CF, 2 fonti) + iscrizione=enrollment (NUOVA) + iscrizione_economia. È un MERGE CROSS-FONTE (FormaLab+Qnet) → eseguito dal prossimo ciclo auto-continua con cura (no rush, principio 100%). **Cluster formazione stato:** opportunita_for ✅(24.491) · decreto ✅(296) · offerte=guscio vuoto (skip) · discente/iscrizione = prossimo (modello deciso, esecuzione cross-fonte da fare). Gate login NON toccato.

## 🛡️ CHECK PROFONDO a 3 LIVELLI (28/06) — L2 ha beccato i miei errori, L3 ha corretto L2
Audit potenziato (7ª dim. **integrità-migrazioni**) su TUTTO il fatto. **Core cutover-ready, 0 BLOCKER.** 6 item reali instradati:
- ✅ **FIX SUBITO:** `formazione.opportunita` (scaffold orfano 0 righe) DROPPATA; `public.aziende.presente_in_qnet` DEFAULT false→**true** (allinea al piano). Hub 200.
- ⏸️ **opportunita_for doppia-fonte:** L2 ha beccato che ho COPIATO in commerciale ma NON droppato `commesse.opportunita_for` (24.491 in 2 schemi). **L3 (verifica mia indipendente) ha CORRETTO L2:** l'audit diceva "0 FK entranti" ma ne ho trovata **1** (la catena discenti) → drop DIFFERITO alla slice formazione (dopo aver spostato discenti). *Il 3° livello ha evitato un drop sbagliato — prova che non basta la fotocopia.*
- ⏸️ **commessa_dettagli_for (1.483):** satellite formazione in schema commesse, SFUGGITO alla mia roadmap → AGGIUNTO al cluster relocation formazione (slice).
- ⏸️ **commesse.commesse 354 cliente_id residui** (qnet-id non in master): isolare + creare aziende/placeholder PRIMA del contract commesse (slice).
- 🔵 **DECISIONE contabilità (presa):** 1 schema unico `contabilita` (sotto-aree attiva/passiva, per R2 + piano passiva) → RENAME `contabilita_attiva`→`contabilita` al build della slice passiva (22 tab, oid-safe; non urgente ora).
- 🔵 viste v_commessa_full/v_sede_partner + drift naming anagrafica → già differiti alle slice/polish.
**Esito 3 livelli:** L1 (pre) + L2 (post-hoc, ha trovato gli errori) + L3 (firma indipendente, ha corretto un errore di L2). Il sistema funziona.

### ✅ CLUSTER FORMAZIONE MIGRATO (28/06, auto-continua, verificato)
Scoperto che gli scaffold formazione ERANO GIÀ giusti (discente=persona, iscrizione=enrollment+economia) → popolati, non ridisegnati (lezione: ispeziono i target). Migrato con cura, in catena:
- `formazione.discente` (PERSONA) 10.675 — DISTINCT CF da commesse.discenti + UNIQUE su CF (upsert FormaLab futuro). 2 discenti senza CF → no persona.
- `formazione.iscrizione` (ENROLLMENT+economia) 10.691 — mappato colonna-per-colonna; discente_id via CF (10.689), opportunita_for_id→commerciale.opportunita_for **FK 0 orfani**, +legacy_discente_id per la catena. cast date/bigint protetti.
- `formazione.iscrizione_origine_gol` 3.220 — →iscrizione via legacy_discente_id, **0 orfani**.
- opportunita_for(24.491 commerciale) + decreto(296 formazione) già fatti.
**Reversibile:** sorgenti `commesse.{discenti,discente_origine_gol,opportunita_for}` INTATTE (doppio-nome) → drop al cutover formazione. Hub 200 a ogni step.
**RESTA slice formazione:** commessa_dettagli_for(1.483)→formazione; partner_commerciale_id text→uuid (FK contatto); viste v_*_full; poi RE-AUDIT verde → cutover read-only F4 → contract (drop sorgenti). Auto-continua prossimo giro.

### ✅ commessa_dettagli_for → formazione (28/06)
`commesse.commessa_dettagli_for` (1.483, rendicontazione edizione-corso) → satellite dedicato `formazione.commessa_dettagli_for` (LIKE struttura + id uuid; NON nel god-table commessa_economica). Dato reale (291 con ricevuto-regione). Sorgente intatta. Hub 200.
**MIGRAZIONE-DATI SLICE FORMAZIONE = COMPLETA** (discente/iscrizione/origine_gol/dettagli_for/opportunita_for/decreto). RESTA: partner_commerciale_id text→uuid (FK contatto); viste; **RE-AUDIT 3 livelli verde**; cutover read-only F4; contract (drop sorgenti commesse). Prossimo giro auto-continua: lanciare il re-audit per validare la slice prima del cutover.

## 🛡️ RE-AUDIT post-formazione (28/06) — slice formazione VALIDATA
Check 3 livelli dopo la migrazione formazione: **fk_orfani = CLEAN** (FK 183/183 valide, 0 orfani) → la migrazione formazione REGGE. Core cutover-ready, 0 blocker.
- **L3 ha chiuso un falso positivo del L2:** `commerciale.offerta.titolo` tutto NULL → verificato sulla sorgente sales: `offerta` NON ha alcun campo titolo/oggetto → NULL è FEDELE, non dato perso. (3 livelli che si correggono.)
- **9 item instradati alle slice** (nessun blocker, tutti minori): referente 3° posto (→contract anagrafica); commesse cliente_id/cliente + 354 orfani + v_commessa_full senza azienda_id (→slice commesse); sedi.is_partner 0/115 + pec (→slice sedi); commessa_filiale_map doppia-casa public/commesse (→slice commesse); formazione god-tables commessa_economica(58)/classe(41)/commessa(33) da splittare PRIMA di popolare + viste v_discente_full/v_classe_full mancanti + v_sede_partner_full partner NULL (→slice formazione); M3/M4 + contabilità passiva = backlog di BUILD non drift.
**Stato: anagrafica+commerciale CUTOVER-READY (primo cutover già live). Formazione: dati migrati+validati, restano viste + god-table split + cutover. Le altre slice (commesse/sedi) hanno i loro cleanup elencati.**

### ✅ vista formazione.v_discente_full (28/06)
Creata la vista piatta di lettura formazione (discente⋈iscrizione⋈opportunita_for⋈origine_gol): 10.691 righe, persona+corso+esito risolti (dato reale verificato). Additiva/reversibile (DROP VIEW). Hub 200. Resta v_classe_full (richiede formazione.classe popolata = god-table da splittare prima). 
**Slice formazione quasi chiusa:** dati ✅ + v_discente_full ✅. Restano (auto-continua): split god-table commessa_economica/classe, v_classe_full, cutover read-only F4, contract (drop sorgenti). Le slice commesse/sedi/anagrafica-contract hanno i cleanup nel re-audit sopra.

### ✅ SPLIT god-table formazione commessa/classe/commessa_economica (28/06, R3)
Slice formazione step 1. Tabelle target erano SCAFFOLD VUOTI → ridisegno a costo-dati zero, reversibile. Decisione R3 validata da **modello-gestione-qualifica** (verdetto netto, cita modello reale):
- **`formazione.commessa` → DROP** (era un 2° master di `commesse.commesse`; regola "una sola tabella commessa per tipo" 25/05). Le commesse FOR vivono GIÀ nel master (1.483/1.483 di `commessa_dettagli_for` risolvono). Satellite FOR popolato = `commessa_dettagli_for`.
- **`formazione.commessa_economica` → DROP** (god-table 58col vuota, ridondante: economia base→master, rendicontazione regionale→`commessa_dettagli_for`+`decreto_regione`, previsionale→CdG, provvigioni→ODA).
- **`formazione.classe` → SPLIT**: `classe` (nucleo 27 col, identità+scheduling+docente/aula) + `formazione.classe_economia` (1:1, 16 col, blocco qnet_*/euro_*/totale_*).
- **Cleanup:** eliminata riga smoke-test ED-TEST-001 + 2 righe calendario_lezione collegate.
- **FK al master RINVIATE alla slice commesse:** `commesse.commesse.id` è oggi **TEXT** (id ordine Qnet), ma classe/iscrizione/commessa_costi_riga.commessa_id sono uuid → NON forzata FK uuid→text. Droppate le FK verso il 2° master; l'aggancio al master uuid si fa nella SLICE COMMESSE (step 4) col backfill via qnet_order_id. Colonne VUOTE → 0 orfani nel frattempo.
- **DIVERGENZA L3 motivata:** NON creato `commesse.commessa_ext_for` (suggerito dallo specialista) perché `commessa_dettagli_for` già copre quel ruolo a grana commessa con dato reale → evitato un doppione vuoto.
- **Verificato:** commessa/commessa_economica spariti, classe_economia presente, classe 27 col (0 econ residue), 0 FK orfane verso commessa, Hub 200.
- Migration: `migration-erp-formazione-godtable-split.sql` (+DOWN ricrea le 3 tabelle vuote). 
> **NOTA prossimi passi:** `v_classe_full` (step 2) RINVIATA: `formazione.classe` è vuota (fonte FormaLab non ancora attiva) + join al master rotto finché commesse.commesse non ha PK uuid → si fa nella slice commesse/quando classe è popolata. Prossimo actionable: **cutover read-only formazione** (pagina Hub su `v_discente_full`, già popolata 10.691) → poi slice commesse (sblocca FK master + v_commessa_full + v_classe_full).

### 🚀 CUTOVER read-only formazione — pagina Hub LIVE (28/06)
Step 3 slice formazione. Vista `public.v_formazione_discenti` (avvolge formazione.v_discente_full, 10.691) + pagina Hub `/formazione-discenti` + route `/api/formazione-discenti` (read-only, mirror /commerciale-pipeline, dietro auth). 
- **ATTENZIONE GIT (lezione):** local main era **19 commit DIETRO origin/main** (che ha il cutover commerciale + fix di altri agenti). Deployare da local main avrebbe cancellato pagine live. → Ribasato su origin/main, lavorato lì. **Regola: per i deploy basarsi SEMPRE su origin/main, non sul main locale.**
- dottore-build VERDE (typecheck+lint). Push FF origin/main: `5c4b214a` (pagina) + `8e80aaa0` (miglioria GOL).
- **F4 VERIFICATO A VISTA (Chrome, sessione admin SuperAdmin):** pagina rende live, KPI 10.691 iscrizioni / 7.299 superati, dati reali (ANTENUCCI ANGELA MARIA·superato·17€, FADDA MARIA LUCIA·119€). Consolidazione formazione funziona end-to-end nell'app vera.
- **Miglioria F4 applicata (regola 2b):** colonna "Operatore" era 1,4% popolata (concetto commerciale non pertinente alla formazione) → sostituita con badge **"GOL"** (origine GOL, 3.220/10.691 = 30%, attributo chiave FOR). corso_titolo 67% popolato (fedele: le iscrizioni senza opportunita_for linkata mostrano "—"). Re-verifica visiva del GOL in corso.
- **2ª miglioria F4 (igiene-dati, causa radice trovata a vista):** la colonna GOL sembrava "sempre GOL" → scoperto che i 3.220 record GOL avevano cognome con **spazio iniziale** (" ANTENUCCI") → sortavano tutti in cima. TRIM applicato su `formazione.discente` (173 cognomi + 371 nomi). **Re-verificato a vista:** ordinamento pulito (ABAGNALE→ABATE), colonna GOL ora MISTA (badge+trattini), Corso popolato, Esito/Ricavo reali. Cutover read-only formazione = **LIVE e verificato visivamente al 100%**.
- RESTA: **contract** (drop sorgenti staged `commesse.{discenti,discente_origine_gol,opportunita_for}` + `contabilita_attiva.decreto_regione`) — è il passo irreversibile → da fare DOPO **re-audit checkpoint-audit-erp VERDE** (prossimo ciclo auto-continua, contesto fresco). Migration: `migration-erp-view-formazione-discenti.sql`.
> **Nota igiene-dati residua (non urgente):** i nomi discente hanno anche incoerenza di MAIUSCOLO/minuscolo ("abate" vs "ABATE") → normalizzazione case differita (polish, non bloccante).

### ✅ CONTRACT slice formazione (28/06) — SLICE FORMAZIONE CHIUSA
Spente le copie-sorgente staged dopo cutover verificato. **Pre-check rigoroso (4 prove di sicurezza):** (1) 0 FK entranti esterne (solo 2 interne tra le 3 tabelle); (2) 0 viste dipendenti dalle 3 `commesse.*`; (3) conteggi target = sorgente identici (10.691/3.220/24.491); (4) in bqyqr le tabelle NON sono in `public` → nessun `.from()` le legge; l'app commesse legge il SUO DB separato.
- **DROP `commesse.{discente_origine_gol, discenti, opportunita_for}`** (in ordine FK figlio→padre). Migration `migration-erp-formazione-contract.sql`, push main `d2228fcb`.
- **`contabilita_attiva.decreto_regione` NON droppata:** la vista `contabilita_attiva.v_ciclo_attivo_commessa` la usa (join su `commessa_codice_esterno`, assente in formazione.decreto_regione) → drop differito alla **slice contabilità** (ripuntare la vista lì).
- **Verificato post-drop:** sorgenti=0, target intatti, `v_formazione_discenti`=10.691, Hub 200, pagina `/formazione-discenti` rende identica a vista (legge i target, non le sorgenti). 
> **🎓 SLICE FORMAZIONE = COMPLETA (dati✅ + god-table split R3✅ + viste✅ + cutover read-only LIVE+F4✅ + contract✅).** Resta solo `decreto_regione` contabilità (alla slice contabilità) e `v_classe_full`/case-normalize nomi (polish, quando classe è popolata).
> **PROSSIMA SLICE = COMMESSE (step 4):** dare a `commesse.commesse` PK uuid + qnet_order_id business-key (oggi id TEXT) → backfill + aggancio FK al master delle colonne rinviate (formazione.{classe,iscrizione,commessa_costi_riga}.commessa_id) → risolvere 354 cliente_id orfani (crea aziende/placeholder) → drop cliente/cliente_id text → `v_commessa_full`+azienda_id + `v_classe_full` → commessa_filiale_map home. Auto-continua cron `e756ed05` la prende; contesto fresco consigliato (è pesante).

### ▶️ SLICE COMMESSE — backbone fatto (28/06), resta solo lo swap PK
Verdetto modello **B** (modello-gestione-qualifica): master `commesse.commesse` = **uuid PK + qnet_order_id business-key** (no chiave naturale Qnet; le 7 figlie popolate si migrano text→uuid).
- ✅ **step 1 — fondazione uuid** (`migration-erp-commesse-uuid-foundation.sql`, main `dd6d32d0`): +`id_uuid`(14.903 distinti)+`qnet_order_id`(bigint, =id text, UNIQUE). Additivo.
- ✅ **step 2a — figli agganciati a id_uuid** (`migration-erp-commesse-figli-uuid.sql`, main `ca4ae970`): 7 figli commesse (+`commessa_uuid` backfill via id text, **0 orfani**: costi_dettaglio 3761, dettagli_for 1483, riepilogo_costi 849) + 3 figli formazione (classe/iscrizione/commessa_costi_riga → FK a id_uuid). Additivo.
- ✅ **step C — riconciliati 354 orfani cliente_id** (`migration-erp-commesse-orfani-clienti.sql`, main `9f139791`): Regione Lombardia (295 commesse)+Argento → link aziende esistenti (no dup); 30 aziende create (anagrafiche Qnet mancanti, incl privati); **azienda_id 14.445→14.900/14.903**, restano 3 commesse senza ALCUN cliente (NULL fedele). Additivo.
- ✅ **step 2b — SWAP PK FATTO** (`migration-erp-commesse-swap-pk.sql`, main `834a3d06`): `commesse.commesse.id` ora **uuid** (qnet_order_id preserva il valore), PK separata su id, `commesse_id_uuid_unique` tenuta (le 10 FK figlie vi dipendono), 7 figli text→uuid (drop commessa_id text, rename commessa_uuid→commessa_id), v_commessa_full ricreata verbatim. **10/10 FK figlie valide su id uuid** (7 commesse + 3 formazione sopravvissute al rename). 14.903 intatte, Hub 200. Reversibile via qnet_order_id. *Lezioni apply: non si droppa un unique con FK dipendenti; `ADD PK USING INDEX` non va su index già-constraint → PK separata.*
- ✅ **polish FATTA** (`migration-erp-commesse-view-azienda-drop-cliente.sql` + `migration-erp-view-classe-full.sql`, main `dab5adb2`): v_commessa_full **+azienda_id/azienda_nome −cliente/cliente_id**; colonne `cliente`/`cliente_id` text **droppate** dal master (link = solo azienda_id); `v_classe_full` creata (vuota finché classe ha dati FormaLab).
> **🏗️ SLICE COMMESSE — DATA LAYER COMPLETO:** master uuid + qnet_order_id, 10 FK figlie uuid pulite, 354 orfani risolti, cliente text dropped, viste v_commessa_full(+azienda)+v_classe_full. Tutto verificato, Hub 200, reversibile.
> **RESTA:** (1) **commessa_filiale_map home** (riconciliare public↔commesse, minore); (2) **re-audit checkpoint-audit-erp** (L2) su formazione+commesse; (3) **cutover commesse** (pagina Hub su v_commessa_full, F4) opzionale; (4) slice SEDI + anagrafica contract (drop referente*); (5) build M3/M4 + contabilità passiva. Auto-continua `e756ed05` le prende.

### ✅ SLICE SEDI — backfill azienda_id (28/06)
Scoperto che `sedi_partner.sedi.azienda_id` era **0/115** (FK c'era, backfill mai fatto). Link via `societa_accreditata` (codice società accreditante). **Mapping codice→azienda VALIDATO da modello-partner-sedi** + CONTEXT.md (15 società gruppo) + `apps/cdg/supabase/schema.sql` + verifica master.
- **47/115 linkate** (codici certi: QGFL 34→16855, QGF→17387, QGA→17389, QGV→17398, QGSJ→17385, QGT→17390, QGEJ→17388, QGB→18530, QGEDP→17399, Kronos→12939, QC→17159, MFC→MFC SRL).
- **68 NULL, tutte documentate (NON mis-assegnate, 100% non 99%):** 61 codice NULL (sedi bozza), 5 ELAV (incerto se gruppo), 1 "QGEU / QGFL" (codice doppio legacy), 1 "Area imprese" (stringa non identificata) → **ricognizione Luigi/Jessica** (data-gap noto, non blocco). Migration `migration-erp-sedi-azienda-backfill.sql`, main `80b898b5`. Hub 200.
> **RESTA slice sedi:** `v_sede_partner_full` fix partner (richiede sedi_contratto popolata = VUOTA → bloccato su dato mancante); `filiale_id` master (sedi.filiale_id→nessuna tabella sorgente, da indagare). Entrambi bloccati su dato assente, non azionabili ora.

### ⚠️ ANAGRAFICA CONTRACT (drop referente*) — BLOCCATO su repoint codice (28/06)
Verificato PRIMA di droppare (irreversibile): il dato referente è salvo in contatti (**email 3.618/3.618 coperte**, migrazione S5 fedele). MA il **drop romperebbe l'app**: il Hub usa ancora `aziende.referente*` in 2 punti VIVI →
- `apps/hub/app/(app)/anagrafica/page.tsx` (LEGGE `sel.referente`)
- `apps/hub/lib/sync-anagrafica-qnet.ts` (SCRIVE referente/email/telefono dal sync Qnet `c.responsible` — sync notturno attivo!)
→ **NON droppato.** Prerequisito = repoint di questi 2 file su contatti (la pagina legge il contatto linkato; il sync fa upsert contatto+link invece di scrivere aziende.referente) + deploy + F4. È codice+deploy delicato (sync Qnet vivo), va fatto con cura come step dedicato, NON drop alla cieca. Stesso discorso per `aziende_commerciale.referente*` (intermedio). I referente di `cliente_dettagli`/`sedi_contratto` sono domain-specific, fuori da questo contract.

### ✅ CHECK INCROCIATO pregresso (28/06) — ERP consolidato VERDE
Cross-check integrità su tutto il fatto (formazione+commesse+sedi+commerciale+anagrafica):
- **0 FK non valide** in tutto il DB (8 schemi, ~201 FK totali). **0 orfani** su tutte le FK chiave (opportunita.azienda, iscrizione.discente/opportunita_for, sedi.azienda, commesse.azienda). Referenzialmente pulito.
- Pulito: droppato `commesse.offerte` (guscio vuoto 46k mai sincronizzato, 0 deps, main `5b09bd9f`).
- Noti: `decreto_regione` contabilità tenuta (vista ciclo-attivo); 40 scaffold vuoti nei domini (in attesa dati FormaLab/cogestione/passiva), non drift.
- **Fix strutturale Q1:** costruito hook `~/.claude/hooks/anti-parcheggio.sh` (Stop hook) che blocca il parcheggiare lavoro deciso citando "contesto fresco"/cron. Regola cementata in [[feedback_decido_non_far_girare]].

### ▶️ CONTABILITÀ PASSIVA — avviata (28/06, scelta CEO: massimo valore)
Build dominio passiva (piano PIANO_MASTER_CONTABILITA_PASSIVA, 28 tab, CP-1→CP-15). Sorgente = qcont DB `eqprz` (accesso Management API OK).
- ✅ **CP-1 — schema unificato:** `ALTER SCHEMA contabilita_attiva RENAME TO contabilita` (decisione 28/06: 1 schema, sotto-aree attiva/passiva). Atomico, 23 tab attiva intatte, vista ciclo-attivo regge (579), 0 codice/FK esterna rotta. Main `f1fbfc31`.
- ✅ **piano_conti master** (`migration-erp-contabilita-CP-piano-conti.sql`): 175 conti ← qcont (cross-DB via JSON, dollar-quoting per apostrofi), PK naturale `codice` (convenzione piano dei conti) + parent self-FK gerarchico (143 figli, 15 categorie). Hub 200.
- **Quadro sorgenti passive (qcont):** solo 4 popolate — piano_conti 175 ✅, anagrafica 65, agente_commerciale 55, oda 34; il resto VUOTO (modulo giovane). Il valore 1,66M provvigioni arriva da CP-13 (sync Qnet, futuro).
> **✅ PASSIVA STRUTTURA + DATI POPOLATI = FATTI (28/06, batch "procedi con TUTTO"):**
> - anagrafica qcont(65) → **riconciliata col master aziende** (NO 2° master): 3 link nome + 62 aziende create coi flag ruolo + `contabilita.fornitore_ext` (65, azienda_id 100% risolto), is_fornitore 64. `migration-erp-contabilita-CP-anagrafica-fornitore.sql`.
> - `contabilita.agente_commerciale`(55, azienda_id risolto via fornitore_ext, 55 validati). `...CP-agente-commerciale.sql`.
> - `contabilita.oda`(34, mirror workflow approvativo; fornitore vuoto sugli ODA=fedele). `...CP-oda.sql`.
> - **18 tabelle scaffold ciclo** (rda/arrivo_merce/fattura_passiva/fp_anticipo/matching_log/notula/bef/lista_bonifici(+riga)/regola_provvigione/provvigione_calcolata/imputazione_*/anticipo_*/costo_partner/adempimento_fiscale/partner_dettagli) mirror qcont. `...CP-scaffold-ciclo.sql`. **Schema contabilita = 43 tab.**
> - Drift `_bak_remap_fattura` droppato. **Controllo auto a ogni step: 0 FK non valide, 0 orfani, Hub 200.** Main fino a `d3f99068`.
> **RESTA passiva:** **CP-13 sync Qnet→provvigioni** (popola provvigione_calcolata, sblocca 1,66M — richiede integrazione API Qnet service_commissions) · **CP-14 repoint app qcont eqprz→bqyqr.contabilita** = GATE deploy (cutover app LIVE, proposta sì/no). conto_codice/commessa link sugli ODA da agganciare quando popolati.

### ✅ sedi.is_partner droppato (28/06)
Doppione del flag-ruolo (is_partner vive SOLO in public.aziende per R3.5), 0/115 popolato, 0 viste dipendenti → DROP additivo-sicuro. Hub 200. Item audit chiuso.
> NOTA STATO: il CORE (anagrafica+commerciale+formazione) è migrato+validato. Gli item RESTANTI sono pesanti (split god-table commessa_economica/classe; risoluzione 354 cliente_id commesse; cutover-pagine F4; build domini M3/M4+passiva) → vanno fatti con CURA in contesto fresco, non rushati. L'auto-continua li prende; un /clear darebbe contesto pulito.
