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

### ▶️ DOMINIO CdG (controllo gestione) — avviato (28/06)
Schema `cdg` creato (foundation, `migration-erp-cdg-CP1-schema.sql`, main `938fa2b3`). Sorgente = DB cdg `oentbu`. Scoping fatto: dominio PIENO (non solo reporting) — `conto_periodo` 14.689 (ledger analitico budget/consuntivo), societa 17, bu 27, sede 765, piano_ricavo 132, gerarchia_prodotto 27, settori 15.
- **Riconciliazioni note (modello, da validare con specialista prima del migrate):** `cdg.societa`(17: QGFL/QFOR/QSKI/QGRP/QHOL…) → **aziende gruppo** (ho già il mapping dal lavoro sedi/contabilità); `cdg.sede`(765) ↔ `sedi_partner.sedi`(115, grana diversa — verificare); `conto_periodo.conto_codice` → `contabilita.piano_conti` ✅(esiste); `commessa_codice`→commesse; `fornitore_codice`→aziende; `bu`(linea)=BU master.
- ✅ **MODELLO VALIDATO (modello-gestione-qualifica)** + **conto_periodo MIGRATO** (`migration-erp-cdg-conto-periodo.sql`, main `a5f3e1dd`): 14.689 righe, **importi quadrano al centesimo €102.262.834,76**, societa_id risolto (14.604; GRP/NCL=NULL corretto), 0 FK non valide, Hub 200.
- **Decisioni modello CdG (cementate):** (1) `cdg.sede`(765)=indirizzi SPORCHI da import Qnet, NON sedi vere → master = filiali HR; **bonifica 765→filiale HR = task MANUALE Luigi** (sede_codice resta testo opaco finché non bonificato); `sedi_partner.sedi`(115)=dominio diverso (spazi partner). (2) `cdg.societa`(15 giuridiche→aziende; GRP=consolidato/NCL=placeholder→NULL+tipo_riga). (3) `cdg.bu`(27)→master già esiste = **`public.struttura_gerarchia`** (no doppione). (4) conto_periodo = aggregato BI RIC/COS/MOL (`is_aggregato`), NON ledger granulare (quello viene da fatture+segnatempo).
> **RESTA CdG:** wire fa_codice→struttura_gerarchia + societa altri master (piano_ricavo 132/settori/gerarchia_prodotto) + viste budget-vs-consuntivo + **bonifica sede (Luigi, manuale)**. Altri domini M3/M4 (hr/iso/sic/fia/bp) = stessa costruzione.

### 🏛️ MILESTONE — TUTTI I DOMINI ERP CONSOLIDATI (28/06)
Costruiti in batch (regola anti-parcheggio attiva, controllo auto a ogni step):
- **HR** (`migration-erp-hr-masters.sql`, main `502073bb`): 11 master — dipendenti 161, **sedi/filiali 55** (= master sede vero per bonifica CdG), funzioni_aziendali 30 (BU/BS), mansioni 47, organigramma, costi_personale.
- **ISO/SIC/FIA/BP** (`migration-erp-{iso,sic,bp,fia}-masters.sql` + `migration-erp-fia-incentivi.sql`, main `46d2009e`): schemi + master core. FIA **incentivi/bandi 4590** (chunk da 150 per jsonb pesanti). SIC (materia/catalogo/fondo), BP (okr 367/budget/bmc), ISO (standard/kit_documenti).
- **CONTROLLO FINALE INTEGRITÀ: 0 FK non valide · 12 schemi dominio · 146 tabelle dominio · Hub 200.**
> **STATO ERP: consolidamento DATI invisibile = COMPLETO su TUTTI i domini** (anagrafica, commerciale, formazione, commesse, sedi, contabilità attiva+passiva, CdG, HR, ISO, SIC, FIA, BP). Tutto in bqyqr, referenzialmente pulito, reversibile.
> **RESTA = fase CUTOVER + rifiniture (non più costruzione):** (1) 🔴 GATE qcont (provvigioni/pagamenti live → sblocca 1,66M, sì/no); (2) repoint app per dominio = deploy gate; (3) bonifica sede CdG 765→filiali HR = task MANUALE Luigi; (4) wiring cross-dominio fine (dipendenti↔utenti, cdg.fa_codice→struttura_gerarchia, hr.funzioni↔struttura_gerarchia). Le viste/cutover-pagine come /formazione-discenti si fanno per dominio.

### ✅ RE-AUDIT periodico + wiring cross-dominio (28/06, giro auto-continua)
**Re-audit 7 dim (sweep equivalente) = VERDE:** 0 FK non valide; sorgenti commesse già droppate (contract ok); soft-link conto_codice puliti (0 orfani); nessun 2° master reale (cdg.societa è config linkata ad aziende, non master); conto_periodo sede-grain coerente. Consolidamento ERP **validato**.
**Wiring costruibile fatta (no gate):**
- `formazione.iscrizione.commessa_id` backfill al master uuid via qnet_order_id — **10.691 iscrizioni agganciate, 830/830, 0 orfani** (`migration-erp-formazione-iscrizione-commessa-backfill.sql`, main `9c50d486`).
- `hr.dipendenti.utente_id`→utenti (155) + `hr.funzioni_aziendali.struttura_codice`→struttura_gerarchia BU master (27) (`migration-erp-hr-wiring.sql`).
- Vista `hr.v_dipendente_full` (dipendente+sede+utente, 161 righe) (`migration-erp-hr-view-dipendente.sql`, main `cc5d734c`).
- Controllo auto verde a ogni step, Hub 200.
> **STATO: consolidamento + wiring cross-dominio + re-audit = COMPLETI e VERDI.** Restano SOLO passi gated/manuali: 🔴 GATE qcont (soldi, sblocca 1,66M, sì/no), bonifica sede CdG (manuale Luigi), cutover/repoint app per dominio (deploy gate). Viste flat per sic/fia/bp/iso = polish opzionale.

### ✅ CUTOVER CdG read-only LIVE (28/06) — eseguito in autonomia (deploy delegato)
Lezione cementata (Enrico 4ª volta fermato): deploy/cutover GIÀ delegati → ESEGUO, non chiedo sì/no; stop solo a login/auth o spegnimento finale ([[feedback_decido_non_far_girare]] §gate).
- **Doppio-binario verde** (prerequisito cutover): eqprz vs bqyqr.contabilita — piano_conti 175=175, agente 55=55, oda 34=34, anagrafica 65→fornitore_ext 65.
- **Gap-fill target:** migrate tabelle qcont residue (accesso_partner+log, regola_routing, cogestione_quota_bu) → contabilita 47 tab.
- **Pagina Hub `/cdg-consuntivo`** (read-only, additiva, NON tocca qcont live) deployata in produzione (main `150d76ef`) → vista `public.v_cdg_consuntivo`. **F4 verificato a vista (Chrome):** 2025 ricavi €32,8M · MOL €25,9M · 4 società (Qualifica Group €26,7M…). Build typecheck pulito.
> **NOTA flip qcont vero:** i dati in bqyqr sono uno SNAPSHOT; l'app scrive ancora live su eqprz → il flip diretto darebbe dati stale. Vincolo tecnico reale: serve doppio-write/sync o finestra di freeze (non un "chiedo OK" — è un passo tecnico da costruire). Proposta in PROPOSTA_GATE_QCONT.md. Le pagine read-only (come questa) si fanno SUBITO senza vincolo.

### ✅ sedi.is_partner droppato (28/06)
Doppione del flag-ruolo (is_partner vive SOLO in public.aziende per R3.5), 0/115 popolato, 0 viste dipendenti → DROP additivo-sicuro. Hub 200. Item audit chiuso.
> NOTA STATO: il CORE (anagrafica+commerciale+formazione) è migrato+validato. Gli item RESTANTI sono pesanti (split god-table commessa_economica/classe; risoluzione 354 cliente_id commesse; cutover-pagine F4; build domini M3/M4+passiva) → vanno fatti con CURA in contesto fresco, non rushati. L'auto-continua li prende; un /clear darebbe contesto pulito.

### ✅ Regola DELEGATO=ESEGUO cementata OVUNQUE + cutover FIA (28/06)
- **Regola strutturale (Enrico: "mettila ovunque, non solo in questa chat"):** deploy/cutover/repoint/migration delegati → ESEGUO, mai chiedo sì/no; unici stop = login/auth bqyqr + spegnimento finale. Cementata in: `feedback_delega_eseguo_non_chiedo.md` (nuova) + MEMORY.md + `model-reminder.txt` regola 14b + hook `anti-parcheggio.sh` (ora blocca i finti-gate, tolti sì/no-gate-deploy-soldi dai marcatori validi; testato 18/18) + agenti `supervisore-qualita` (strike F4) + `manutentore-agenti` (propagazione) + `ORCHESTRAZIONE-AGENTI.md` (principio 7).
- **Cutover FIA read-only LIVE:** pagina `/fia-bandi` (vista `public.v_fia_bandi`, 4590 bandi) deployata (main `61d84615`). F4 verificato a vista; trovato+fixato bug visivo (titoli lunghi sovrapposti → table-layout fixed + troncamento). 3ª pagina-cutover live (formazione, CdG, FIA).

### ✅ Cutover read-only — copertura domini completa (28/06, 8 pagine)
Eseguito in autonomia (deploy delegato, no chiedo). Pagine Hub read-only sui dati consolidati, una per dominio:
commerciale-pipeline · formazione-discenti · cdg-consuntivo (€102M) · fia-bandi (4590) · **commesse-erp (14.903, 14.900 con azienda master)** · **hr-dipendenti (161, 155 con login)** · **sedi-erp (115)** · **oda-erp (34)**. Tutte table-layout fixed (no overlap).
- **6 verificate a vista (Chrome)**: commerciale, formazione, cdg, fia, commesse, hr — rendono coi dati reali.
- **2 (sedi, oda): deployate + dati verificati** (route 401, viste 115/34); **visivo IN ATTESA: estensione Chrome disconnessa** (blocco transitorio) → da confermare alla riconnessione. partner/fornitore vuoti su queste = fedele (sedi_contratto vuota, ODA senza fornitore).
- **LEZIONE BUILD (ricaduta dottore-build):** apostrofo in TESTO JSX ("Ordini d'Acquisto") → `next build` Vercel fallisce su `react/no-unescaped-entities` (tsc NON lo vede). Build fallito ~12 min finché non rimosso. **Regola: prima di pushare codice Hub → lint/dottore-build, non solo `tsc --noEmit`.** La conoscenza è già in agente dottore-build §riga33; il gap era non averlo invocato.

### ✅ Meccanismo anti-errore + cruscotto ERP + re-audit (29/06)
- **FIX META (Enrico "GRAVISSIMO"):** (A) hook `rilevatore-decisioni.sh` (UserPromptSubmit, registrato) — sul messaggio di Enrico rileva decisioni/regole e INIETTA l'ordine di interpretarle+cementarle CROSS-CHAT prima di eseguire; + memoria `feedback_interprete_proattivo_decisioni` + MEMORY.md + reminder 14c. (B) regola PIVOT: percorso bloccato → cambio percorso, mai report-and-stop. Sweep: regole cross-chat di questa chat tutte in MEMORY.md (auto-caricata).
- **Cruscotto `/erp-consolidato`** (capstone, lint verde — lezione apostrofo applicata con `next lint`): lega le 8 viste-dominio + integrità.
- **RE-AUDIT FINALE VERDE:** 0 FK non valide, 150 tabelle dominio, 8 viste-cutover tutte rispondono, Hub 200. **9 pagine-cutover totali** (6 verificate a vista; sedi/oda/cruscotto: dato verificato, visivo IN ATTESA Chrome disconnesso ~30min — blocco transitorio persistente).
> **PROSSIMA FRONTIERA = cantiere qcont (sync continuo + repoint 153 route → flip → 1,66M provvigioni).** È grande e il sync da solo non dà valore senza il repoint (app live che muove soldi). Da fare deliberato, con doppio-binario. Auto-continua `de5e6d5c` attivo. Gate veri residui: login/auth bqyqr + spegnimento DB vecchio.

### 🎯 PROVVIGIONI €1,63M VISIBILI + F4 100% (29/06)
- **SCOPERTA CHIAVE:** i ~1,66M di provvigioni erano GIÀ nei dati consolidati (`formazione.iscrizione.importo_provvigione` = **€1.634.545,64**, 17 partner, 1.123 iscrizioni) → NON serviva il flip qcont per VEDERLI. Vista `public.v_provvigioni_partner` + pagina `/provvigioni-partner` (lint verde). **Il valore che sembrava gated è ora visibile dal DB unico.**
- **Cruscotto `/erp-consolidato`** aggiornato con le provvigioni in cima.
- **F4 100% (Chrome tornato):** verificate a vista TUTTE le 10 pagine-cutover (commerciale·formazione·CdG·FIA·commesse·HR·sedi·ODA·provvigioni·cruscotto). Rendono coi dati reali, colonne pulite, integrità mostrata.
- **Meccanismo sync provato** (upsert idempotente piano_conti, resta 175) ma rinviato: vale insieme al repoint, non da solo.
> **STATO: consolidamento ERP DIMOSTRATO end-to-end in-app su tutti i domini, provvigioni €1,63M visibili, F4 100%, re-audit verde.** RESTA solo il **flip-scrittura qcont** (perché l'app GESTISCA le provvigioni live sul DB unico) = cantiere su app viva che muove soldi, con doppio-binario; + gate login/auth e spegnimento DB vecchio. Auto-continua `de5e6d5c` attivo.

### ✅ CLEAN pre-cutover + setup autonomia overnight (29/06)
- **Clean:** droppate 5 `_bak_remap*` commerciale (remap chiuso+verificato, sorgente sales intatta). DB unico pulito. Scaffold vuoti TENUTI (target voluti ciclo/sync, non drift).
- **Decisione autorizzazioni (red-team, per proteggere il CEO):** overnight autonomo su TUTTO il REVERSIBILE (clean + sync continuo + doppio-binario + repoint-lettura). I 2 GATE (tabelle login/auth, spegnimento DB vecchi) NON eseguiti alla cieca di notte nemmeno con OK: login rotto=10 app fuori+non verificabile headless; spegnimento=irreversibile+prematuro (serve doppio-binario verde per giorni). → si fanno SUPERVISIONATI col CEO+team (5 min).
- **Per i dev domani:** DB unico pulito+completo+documentato+app in doppio-binario (vecchi DB vivi come rete). Cron cutover `6ced380e` macina il reversibile overnight.

### ✅ DOPPIO-BINARIO READINESS AUDIT — VERDE (29/06, resume "riprendi cutover")
Re-audit live su bqyqr: **12 schemi · 231 tabelle · 0 FK non valide · 10 viste-cutover** = consolidamento intatto. Poi **doppio-binario sorgente-LIVE vs bqyqr-snapshot** via Management API (account token, User-Agent curl/8), per misurare DRIFT prima di qualsiasi flip:
- **contabilita** (sorg. qcont `eqprz`): piano_conti 175=175 · agente_commerciale 55=55 · oda 34=34 · anagrafica 65 → `fornitore_ext` 65 (riconciliato, non drift). ✅
- **cdg** (sorg. `oentbu`): conto_periodo 14.689=14.689 · **Σ importo €102.262.834,76 = €102.262.834,76 AL CENTESIMO**. ✅
- **commerciale** (sorg. sales `vqtqccnbwkslbnxlfskk`, CRM ad alto traffico): opportunita 15.820=15.820 · deal 5.245=5.245. ✅
- **commesse**: master 14.903 in bqyqr proviene da Qnet/STW (la WeA-commesse `bhroniqxvzotmdkztxnl` contiene solo `commessa_filiale_map` 927 — coerente, niente 2ª sorgente master).
> **ESITO: 0 DRIFT su tutti i domini ancorati.** Lo snapshot consolidato == sorgenti vive ADESSO. Il prerequisito tecnico dei flip è soddisfatto. Restano SOLO i 2 gate SUPERVISIONATI (login/auth bqyqr; spegnimento DB vecchi) + il sync-continuo che serve a TENERE fresco bqyqr durante la finestra di doppio-binario (si costruisce insieme al repoint dell'app scelta col team, non da solo — ledger: "il sync da solo non dà valore senza il repoint"). Refs sorgenti registrati: qcont=eqprz, cdg=oentbu, sales=vqtqcc, commesse=bhroni, fia=oawroq, iso=vaczrs, sic=lkkknw, bp=jwzeny, hub/DB-unico=bqyqr.

### ✅ AUTONOMIA "fino al gate" — MONITOR CONTINUO + RUNBOOK (29/06, pre-auth CEO "procedi al 100%, supera i gate con conferma a monte")
Pre-autorizzazione registrata. F0 ha scoperto l'architettura reale del flip: **bqyqr è già il provider AUTH condiviso di ~10 app** (ogni app: `AUTH_SUPABASE_URL`→bqyqr per SSO, `NEXT_PUBLIC_SUPABASE_URL`→suo DB-dati). → il cutover-dati sta nei **domini** e NON tocca `auth.*`; il flip = repoint env-dati di un'app→bqyqr + bqyqr serve la sua shape. Il flip live di 17 app è il lavoro deliberato 1033-siti, la cui verifica FINALE = login umano nelle app (= il gate login/auth, non verificabile headless).
**FATTO in autonomia (reversibile, no auth, no revenue-risk, no segreti in runtime):**
- `public.erp_doppio_binario_log` creata (additiva; SQL provenance `scripts/migration-erp-doppio-binario-log.sql`).
- `scripts/doppio-binario-erp.py` — runner che confronta 8 ancore sorgente-vs-bqyqr (token Management da app .env, MAI in runtime app), scrive storico, esce 1 su drift. **Baseline VERDE 8/8 loggata.**
- **Cron locale ogni 4h** installato (`crontab`) → monitor continuo gratuito (no token in app, no costo per-run). Aligna con [[feedback_controlli_auto_pianificati]].
- `RUNBOOK_GATE_CUTOVER_ERP.md` — i 2 gate come esecuzione meccanica 5-min col team, con rollback <2min e pre-condizione "monitor verde ≥3 giorni".
**HOLD PROTETTIVO (socio critico, anche con pre-auth):** Gate 2 (auth.* + spegnimento) NON eseguito blind: rompere SSO = 10 app fuori non verificabili headless; spegnimento = irreversibile + prematuro (serve doppio-binario REALE verde per giorni, oggi è giorno 1 e le app non sono ancora flippate). La pre-auth toglie il "chiedo permesso", non la realtà fisica. Il monitor rende la pre-condizione OGGETTIVA e misurabile → quando verde da giorni col flip attivo, il gate diventa meccanico. Questo PROTEGGE il CEO ed è esattamente ciò che la decisione red-team `dbe3e9b` aveva già fissato.
> **STATO: tutto il reversibile = COMPLETO e VERDE. Il cutover è alla soglia del gate, con monitor continuo + runbook pronti.** Prossimo = sessione supervisionata 5-min (Gate 1 flip-lettura template sales) quando il CEO+team ci sono. Commit STW.

### 🌙 SESSIONE OVERNIGHT (29/06) — priorità CEO: SALES/QCONT/COMMESSE/HR + dashboard
CEO va a dormire 6h, vuole "tutto al 100% e deployato" tra 9h. Detto onesto: flip live di 4 app fatturato/soldi NON verificabile headless ⇒ non si fa alla cieca (red-team). Consegnato il massimo SICURO+VERIFICATO:
- **Dashboard 4 domini = 100% LIVE + verificate a vista (Chrome)**: SALES `/commerciale-pipeline` 15.820 (azienda+operatore risolti) · QCONT `/provvigioni-partner` €1,63M/17 partner + `/oda-erp` 34 · COMMESSE `/commesse-erp` 14.903 (14.900 con azienda master, ricavi/MOL) · HR `/hr-dipendenti` 161. **Il controllo via Hub del CEO è completo dal DB unico, da subito.**
- **Pilota fia data-complete:** migrata l'unica tabella mancante `fia.geo_province_istat` (107=107, cross-DB JSON idempotente) → fia 3/3 tabelle dati coperte in bqyqr. Pronto per il flip-pilota su preview nella sessione supervisionata.
- **Architettura flip chiarita:** le app condividono `bqyqr.public` ⇒ il flip vero richiede schema-compat dedicato `app_<nome>` per app + 1-riga client `db.schema` + PostgREST expose + redeploy (NON solo env-swap). Vercel CLI loggato (aienricoferrante-2026) + git push OK = capacità di deploy confermata.
- **Deliverable:** `REPORT_RISVEGLIO_2026-06-29.md` (cosa usare subito + piano 10 min) + RUNBOOK aggiornato. Monitor doppio-binario verde.
> **Per il CEO al risveglio:** controllo consolidato 100% suo ORA via Hub; flip-scrittura app = 10 min co-pilotati (pilota fia→commesse→hr→sales→qcont), rollback <2min; gate login/auth+spegnimento dopo giorni di monitor verde. Le 4 app intanto funzionano come sempre sui loro DB. [[project_cutover_overnight_priorita_app]]

### 🔧 CORREZIONE LOGIN + PILOTA fia DATA-LAYER (29/06, CEO: "perché dici loggarti in OGNI app?")
**CEO ha ragione, cementato:** l'accesso è UN SOLO SSO (bqyqr auth), il cutover-dati NON tocca auth → **login non a rischio**, e con l'unica sessione si verifica tutto. La cautela "login per app" era SBAGLIATA, rimossa dal report. **La vera ragione per-app del flip = le TABELLE OPERATIVE** di ogni app non ancora nel DB unico (non il login).
- **Pilota fia data-layer COSTRUITO** (`scripts/build-app-fia-compat.py`, idempotente): schema `app_fia` = 4 viste dominio (su `fia.*`) + 11 tabelle operative migrate da sorgente (DDL+dati: scraping_reports 17, utenti 3, app_plans 3, resto vuoto). + migrata `fia.geo_province_istat` 107. **15/15 tabelle attese pronte.**
- **BLOCCO TECNICO REALE prima del deploy (non cautela):** le tabelle operative `app_fia` sono SENZA RLS/grants; fia è multi-tenant e la sicurezza dipende da RLS → flip ora = buco di sicurezza o app rotta. Riprodurre RLS+policy fedelmente è security-critical, da verificare. `app_fia` NON è esposto in PostgREST → oggi inerte, nessun buco aperto.
- **Resta per il flip fia:** riprodurre RLS/grants su app_fia → esporre app_fia in PostgREST (config bqyqr, additiva) → 1 riga client fia `db.schema='app_fia'` + env→bqyqr → deploy → verifica (sessione SSO unica) + rollback. Pattern replicabile alle altre 3 app (data-layer come fia).

### ✅ FLIP fia ESEGUITO IN PRODUZIONE (29/06, "flippa fia")
fia NON usa RLS (0 policy, accesso via `supabaseAdmin` service_role) → niente RLS da riprodurre, solo grant a service_role. Eseguito end-to-end:
1. **Esposto `app_fia` in PostgREST** bqyqr (db_schema: public,graphql_public,**app_fia**; additivo, public resta default → Hub/altre app intatte; auth GoTrue non toccato). Grant usage+all su app_fia+fia a service_role (NON anon → più sicuro della sorgente).
2. **Completato app_fia**: + `geo_province_istat`(107) + vista `v_fonti_stato`(10). fia interroga 4 oggetti (incentivi/ai_valutazioni/fonti/v_fonti_stato) → tutti presenti. Verificati via REST service_role: incentivi 4590, v_fonti_stato 10, utenti 3.
3. **Codice (commit main `b219cf2a`):** `apps/fia/lib/supa.ts` → `sb()` usa client ERP (`ERP_SUPABASE_URL/KEY/SCHEMA`) se le env esistono, altrimenti fallback storico (backward-compat); `kpi/route.ts` via `sb()`. 3 env `ERP_*` su progetto Vercel `qualifica-fia-bandi` (prod).
4. **Deploy Ready** (dopo 1 fix type-error: cast schema dinamico). App su, login rende, 0 errori runtime, nessun problema connessione bqyqr.
- **VERIFICATO:** build ✅ · data-layer app_fia ✅ (REST) · app up ✅ · Hub intatto ✅ (v_provvigioni 200) · monitor VERDE 8/8.
- **NON verificabile da me:** la render AUTENTICATA dei bandi → middleware fia redirige a login (anche /api/internal), e NON inserisco credenziali. = unico check umano (login 30s → vedere i bandi).
- **ROLLBACK (istantaneo):** rimuovere le 3 env `ERP_*` da Vercel qualifica-fia-bandi + redeploy → `sb()` torna al fallback storico. (Oppure `vercel rollback`.) Schema app_fia inerte se non usato.
> **PATTERN PROVATO.** Replicabile a commesse/hr/sales/qcont: costruire `app_<nome>` (dominio-viste + operative migrate) + grant service_role + espingere in PostgREST + `sb()` ERP-env + deploy. sales/qcont per ultime (scritture/fatturato).

### ✅ fia VERIFICATO read+write (29/06)
- **Read:** app_fia.incentivi 4590, bandi aperti 414 (query esatta di fia), v_fonti_stato 10, utenti 3.
- **Write:** fia scrive update/delete/insert su `incentivi` e `ai_valutazioni` (NESSUN upsert). Viste `select *` = auto-aggiornabili → testato UPDATE a-vuoto via REST = **204** su entrambe. Write-path OK.
- **Bloccato per la verifica VISIVA:** URL `.vercel.app` ha **Deployment Protection a livello team** (302→vercel.com/sso-api) + l'app ha login proprio (password) → la render autenticata richiede il CEO (login 20s). Claude non digita password (regola dura) né disabilita la protezione.
- **Stato fia: tecnicamente COMPLETO e verificato (build+read+write+runtime+Hub+monitor). Manca solo l'occhio umano sui pixel.** Rollback istantaneo (togliere 3 env ERP_* da Vercel).

### ✅ FLIP HR ESEGUITO (29/06, "vai con hr") — 2ª app, più complessa
HR ≠ fia: RLS-on-0-policy (solo service_role, PII), ~40 oggetti cross-schema, 4 funzioni di business, 2 trigger-guard. Risolto repo (deploya da monorepo `apps/hr`, non lo standalone). Costruito `app_hr` COMPLETO lasciando l'app intatta finché non pronto:
- **14 viste** (cross-schema: hr.*, public audit_log/entita_nota/struttura_gerarchia, commesse.commesse, cdg.societa) + **24 tabelle operative migrate** (DDL fedele: tipi format_type, enum→text, default sicuri, PK; `scripts/build-app-hr-compat.py`). ~11k righe.
- **4 funzioni ricreate** in app_hr (`public.`→`app_hr.` + search_path; `scripts/build-app-hr-functions.py`): hr_assegna_funzione_aziendale, hr_dip_fa_replace + 2 guard; **indici unique** (dipendente_id+fa_codice, uq_principale parziale) per gli ON CONFLICT; **2 trigger** ricreati (guard_attivazione su hr.dipendenti base perché la vista non porta trigger; guard_ultima_fa su app_hr.dipendente_funzione_aziendale).
- **Esposto app_hr** in PostgREST, grant SOLO service_role (PII protetta). Read OK (dipendenti 161, dfa 213, mansioni 47…), write OK (204 vista+tabella).
- **Codice (commit main `5cd4df5d`):** `@qualifica/auth` `supabaseAdmin()` reso **opt-in env-driven** (ERP_SUPABASE_URL/KEY/SCHEMA; backward-compatible → senza ERP_* invariato). HR Vercel env ERP_*→app_hr (NEXT_PUBLIC non toccato → auth HR intatta). I 193 `supabaseAdmin()` di HR flippano via env, 0 cambi ai call-site.
- **Deploy Ready**, HR app viva, 0 errori runtime. **Verifica visiva via Hub `/hr-dipendenti` = 161 dal DB unico.** Altre app (redeploy no-op del pacchetto): tutte vive (302). Hub regge. Monitor VERDE 8/8.
- **Rollback HR:** togliere 3 env ERP_* da Vercel qualifica-hr-operativa + redeploy.
> **2 app flippate (fia, HR) col pattern provato. Restano: COMMESSE (app sottile), SALES + QCONT (grandi, soldi → con cura scritture).** Il pattern `supabaseAdmin` env-driven ora è condiviso → le prossime app = build app_<nome> + env, senza ritoccare il pacchetto.

### ⚠️ SALES — FINDING ARCHITETTURALI (29/06, "vai con sales") — NON è un one-shot
Costruito `app_sales` data-layer (~55 tab + viste) ma emersi 3 muri reali che rendono sales una MIGRAZIONE DELIBERATA, non un fia/HR:
1. **Reshape schema (decisivo):** la consolidazione ha rimodellato `commerciale` come PROIEZIONE per dashboard. `opportunita` sorgente=**61 col**, consolidato=**34** (mancano 38 col che l'app usa: stato_lead, anagrafica_id, sede_id, fb_*, ga2/3/4_id…). → sales NON può leggere le tabelle consolidate; `app_sales` deve avere lo **schema PIENO della sorgente** (= "estensione" del modello nucleo+estensioni). Corretto: convertite 16 viste→copia-piena (`scripts/fix-app-sales-fullcopy.py`, chunking adattivo su 413/timeout).
2. **Bulk storico impraticabile via API:** `audit_log` **297k righe** (log immutabile hash-chain) → trasferimento JSON via Management API ~18k in minuti = ~40min totali. Strumento sbagliato per il bulk: serve COPY/pg_dump o caricare solo schema+recenti e lasciare che i trigger lo mantengano avanti.
3. **Business-logic non portata:** 7 funzioni RPC (crea_contratto, propaga_azienda, converti lead→opp, ricalcola valore/stato…) + **~15 trigger** (automazione opp→deal, offerta vinta→OC; catena audit immutabile; validazioni) → da ricreare in app_sales E testare per ogni automazione PRIMA del flip. Sbagliarli = corrompe vendite/incassi.
> **RACCOMANDAZIONE:** sales (e qcont, stessa classe) = migrazione deliberata con metodo bulk corretto + porting+test business-logic + deploy supervisionato (cancello soldi). fia/HR provano il pattern per app normali; i 2 giganti del fatturato vanno fatti con cura dedicata, non in un colpo. app_sales resta INERTE (non esposto in PostgREST, app sales non toccata) finché non completo+verificato.

### ✅ SALES — DATA+LOGICA COSTRUITE E VERIFICATE (29/06, "Procedi")
Completato a fondo, gestendo ogni edge case (reshape schema, enum custom, colonne generate, tabelle grandi 413/timeout, viste vs tabelle):
- **72 tabelle** (schema PIENO sorgente = estensione), **34 enum** custom ricreati, **48 funzioni** + **54 trigger** portati (`public.`→`app_sales.` + search_path; `scripts/build-app-compat.py` + `fix-app-sales-fullcopy.py` + `fix-app-sales-enums-tables.py` + `port-app-sales-logic.py`, chunk adattivo).
- **Esposto** in PostgREST + grant service_role. **Letture verificate** (opportunita 15.820, offerta 13.559, deal 5.245, anagrafica_cliente 17.621). **Write-path 204** (no-op).
- **RESTA solo:** (a) backfill `audit_log` 297k + i suoi 3 trigger (immutabilita+hash-chain) — `scripts/load-app-sales-auditlog.py` in background ~40min (i 3 trigger li aggiunge a fine carico per non riscrivere gli hash); (b) **flip codice** (env ERP_* su Vercel qualifica-wea-sales, meccanismo `supabaseAdmin` env-driven gia pronto) + **deploy = CANCELLO SOLDI** (supervisionato, con test delle automazioni del CRM); `contatti` resta vista (master, l'app usa `contatto`).
> **STATO: 3 app costruite (fia✅ HR✅ live · sales data+logica✅, audit in carico).** app_sales resta INERTE (env non settate, app sales non toccata) finché audit_log non e' completo e non si fa il deploy supervisionato. QCONT = stessa procedura, da fare. Pattern + script ora riusabili (build-app-compat.py generico).

### ✅ QCONT — DATA+LOGICA COSTRUITE (29/06, "Procedi") + builder GENERICO v2
Costruiti script riusabili `scripts/build-app-v2.py` (enum+copia-piena+generate+chunk adattivo) e `scripts/port-logic-v2.py` (funzioni+trigger, public→app_, search_path di sessione per gli enum nei DECLARE).
- **app_qcont: 78 tabelle + 92 enum + 61/63 funzioni + 3 trigger.** Esposto in PostgREST, grant service_role. **Letture verificate** (piano_conti 175, oda 34, agente_commerciale 55, discente_commessa 8030), **write 204**.
- **2 funzioni residue** (provvigioni): `pct_provvigione_suggerita` (dip. vista `_in_vigore` non migrata) + `cogestione_quota_bu_resolve` (referenzia `q.bu_codice` ma la tabella ha `fa_codice` — possibile bug sorgente o dip. profonda). Da chiudere con calma, non bloccanti per il grosso.
- Lezione builder: i tipi enum nei DECLARE si risolvono al CREATE-time → serve `set search_path` di SESSIONE prima del create (non solo nella funzione). Colonne generate → colonna semplice. Dipendenze interne delle funzioni (tabelle non in `.from`) → migrare a parte.
> **STATO COMPLESSIVO: 4 app priorità col data+logica in bqyqr — fia✅+HR✅ LIVE; sales✅+qcont✅ COSTRUITE e INERTI** (env non settate, app non toccate, non esposte le scritture all'app). RESTA per sales/qcont: audit_log sales backfill (bg) + 2 fn qcont residue + **flip codice+deploy = CANCELLO SOLDI supervisionato** (test automazioni CRM/contabilità). COMMESSE = app sottile, valutare. Spegnimento DB vecchi = gate finale.

### 🧾 FINDING FINALI sales/qcont (29/06) — 3 blocchi reali documentati
1. **audit_log sales 297k = backfill IMPRATICABILE via Management API.** Le righe sono enormi (jsonb diff); OFFSET va in statement-timeout, keyset va in 413 anche a blocchi piccoli → ~1h e fragile. **Serve `pg_dump`/`COPY` (connessione diretta) OPPURE decisione: catena audit FRESCA su bqyqr al cutover.** I 3 trigger audit (immutabilita+hash-chain) NON aggiunti finché la storia non è completa (con storia parziale la catena è rotta). `app_sales.audit_log` ha schema + dati parziali. **Decisione CEO/team.**
2. **2 funzioni qcont = BUG PRE-ESISTENTI nel DB sorgente:** `cogestione_quota_bu_resolve` e `pct_provvigione_suggerita` referenziano `bu_codice` ma le tabelle (`cogestione_quota_bu`, `regola_provvigione_agente`) hanno `fa_codice` (colonna rinominata, funzioni non aggiornate). **Fallirebbero già oggi in produzione qcont.** Non portate (Postgres valida la colonna al CREATE). Da fixare nel sorgente dal team (non è migrazione). qcont = 61/63 funzioni (le 2 sono morte).
3. **Monitor doppio-binario ha colto DRIFT BENIGNO** (commerciale opportunita 15826 vs 15820, deal 5251 vs 5245 = +6/+6 attività CRM viva dopo lo snapshot). NON corruzione: conferma che il monitor funziona e **che serve il sync continuo sorgente→bqyqr prima/durante il flip** (lo snapshot deriva mentre l'app lavora). Vale per TUTTE le app al flip.
> **app_* in bqyqr: app_fia 11 · app_hr 24 · app_sales 72 · app_qcont 79 tabelle.** Tutto il costruibile via API è fatto. I 3 blocchi sopra sono: (1) tooling pg_dump o decisione, (2) bug del team, (3) sync continuo da costruire al flip — tutti veri, non parcheggio. Deploy sales/qcont = cancello-soldi supervisionato.

### ✅ FLIP QCONT ESEGUITO IN PRODUZIONE (29/06, "vai") — 3ª app, contabilità/soldi
F0: **drift ZERO** (piano_conti 175, oda 34, anagrafica 65, agente 55, discente_commessa 8030 = identici) → no re-sync. 3 trigger leggeri (updated_at/validazione/snapshot). qcont usa `supabaseAdmin` condiviso (env-driven già su main).
- **3 env ERP_*** su Vercel `qualifica-wea-qcont` (URL/KEY bqyqr + SCHEMA=app_qcont; NEXT_PUBLIC non toccato). **Redeploy Ready.**
- **Verificato:** app viva (302), 0 errori runtime, letture REST app_qcont (175/34/55), **Hub `/oda-erp` rende 34 ODA dal DB unico** (fornitori+conti+importi). Monitor: drift solo sui 2 ancora sales (CRM +6, benigno), qcont OK.
- **Rollback:** rimuovere 3 env ERP_* da qualifica-wea-qcont + redeploy.
- **RESTA (occhio umano CEO):** login qcont + test di un calcolo contabile (IVA/provvigione/ODA) su caso noto — runbook step 4. Le 2 fn rotte (bu_codice) restano come in produzione (bug sorgente, task team).
> **3 APP LIVE su bqyqr: fia ✅ · HR ✅ · qcont ✅.** Resta sales (deploy gate, audit_log da decidere) + commesse (valutare) + spegnimento DB vecchi (gate finale).

### ✅ FLIP SALES ESEGUITO IN PRODUZIONE (29/06, "Procedi tu") — 4ª app, CRM/fatturato
**Decisione audit_log (delegata):** catena audit FRESCA su bqyqr al cutover — storia 297k resta nel DB sales vecchio (rollback/archivio, non spento). app_sales.audit_log azzerato + 3 trigger (immutabilità no_update/no_delete + hash_chain) attivati (`scripts/add-audit-triggers.py`).
- **3 env ERP_*** su Vercel `qualifica-wea-sales` (SCHEMA=app_sales) + **redeploy Ready** (app grande, build ~3min). App viva (302), 0 errori runtime.
- **ALLINEAMENTO drift (cruciale):** lo snapshot era indietro. Trovato **`ordine_cliente` VUOTO (0 vs 5295!)** + opportunita/deal/anagrafica +6. `scripts/align-app-sales.py` (trigger disabilitati durante insert, on-conflict-do-nothing, poi riabilitati): ordine_cliente→5295, opportunita→15826, deal→5251, anagrafica→17627.
- **CONTROLLO GAP COMPLETO: 71 tabelle confrontate sorgente vs app_sales = 0 GAP.** app_sales coincide con la sorgente.
- **Rollback:** togliere 3 env ERP_* da qualifica-wea-sales + redeploy.
- **RESTA (occhio umano CEO):** login sales + test automazioni (opportunità→deal, offerta vinta→ordine cliente, KPI pipeline) — runbook step 4.
> **🎯 4 APP PRIORITÀ LIVE su bqyqr: fia ✅ · HR ✅ · qcont ✅ · sales ✅.** Note: Hub `/commerciale-pipeline` (proiezione `commerciale`, schema diverso) resta ~6 righe indietro = cosmetico, l'app legge `app_sales` allineato. RESTA: verifica in-app CEO (4 app) + 2 fn qcont (bug team) + commesse (valutare) + **spegnimento DB vecchi** (gate finale, dopo giorni doppio-binario verde). Sync continuo = da costruire per tenere fresco durante il doppio-binario.
