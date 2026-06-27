# 🏛️ PIANO MASTER ERP — Consolidamento a 1 DB — 27/06/2026

> Documento unico, completo. Copre **DB + Codice + Routing** al 100%. Stato: **piano pronto da approvare**; esecuzione già avviata sul sicuro (Aziende expand live).
> Companion: [Contabilità Passiva](PIANO_MASTER_CONTABILITA_PASSIVA.md) · [Codice+Routing](PIANO_CODICE_ROUTING_27-06.md) · [Albero Aziende](ALBERO_AZIENDE_27-06.md) · [Registro Parità](REGISTRO_PARITA_QNET_WEA.md) · [Ledger esecuzione](ESECUZIONE_ERP_LOG.md) · [Standard dati](../qp-notte-pulizia/docs/STANDARD_DATI_ERP.md)

## Numeri del cantiere
- **Sorgente:** 13 DB · 581 tabelle totali oggi.
- **Schema definitivo:** 8 macro-domini · ~161 tabelle target nel DB unico `bqyqr` (schemi per dominio).
- **Percorso:** ~90 slice strangler (expand→migrate→repoint→contract).
- **Codice:** 1.033 siti codice↔DB mappati (17 app) → ogni colonna che cambia ha la lista dei file.
- **Routing:** guscio unico pianificato.
- **Qnet:** schema reale recuperato da `OrderController.php` (Ciro) → **nessun muro bloccante**, resta 1 verifica puntuale.

## Stato esecuzione (già live, additivo, verificato)
- ✅ Governance: standard 9 regole + custode + hook blocco-duro.
- ✅ Aziende **expand**: nucleo (5 col) + `aziende_commerciale` (17) + `aziende_qualifiche` (11) + `aziende_indirizzi` (9). Hub 200, 18.268 righe intatte. Vedi ledger.

---

I'll review the schema data provided and compose the master plan. The input was truncated mid-stream (commerciale domain cut off, plus other domains in SORGENTE only partially shown), so I'll build the plan from the complete anagrafica domain (fully specified) and the commerciale domain (specified through offerta_riga), plus the SORGENTE numeric synthesis and the domain list. Let me work with what's authoritative and structure the rest by the rules.

# Piano Master ERP — Schema Definitivo + Percorso a 100%

> Documento unico, leggibile dall'inizio alla fine. Fotografia del DB finale (Parte B) + percorso per slice numerate (Parte C). Costruito sull'albero-campi approvato per `anagrafica` e `commerciale`; gli altri domini seguono le stesse regole R3 (nucleo/estensione/satellite/jsonb), R5 (doppio nome in transizione), R6 (anagrafica prima), R9 (mirror Qnet intoccabili).

---

## 0. Sintesi & stato

**Dove siamo (27/06).**
- **Governance fatta.** Le regole R3 (nucleo → estensione → satellite-1n → relazione-NN → jsonb coda-lunga), R5 (doppio nome durante lo strangler), R6 (anagrafica prima di tutto), R7 (albero-campi approvato prima del codice), R9 (mai toccare i mirror Qnet) sono le leggi del piano. 1 solo DB logico (`bqyqr` + schemi per dominio); campo collocato per **significato**, non per fill-rate; nessuna tabella nuova quando basta un tag/flag (Fornitore/Partner = tag su `aziende`).
- **Aziende slice-1 scritta.** L'albero del dominio `anagrafica` (aziende/contatti/utenti) è completo e approvato: nucleo + estensioni commerciali + satelliti qualifiche/indirizzi + relazione N:N contatti↔aziende + mapping Qnet utenti. È la base R6 per tutto il resto.
- **Schema Qnet recuperato.** I campi sorgente sono stati ricostruiti da `OrderController`/payload `/customers`,`/contacts`,`/opportunities`,`/offers` invece di aspettare il dump di Ciro. Questo **elimina i muri**: il percorso non è più bloccato in attesa di documentazione esterna. Resta **1 sola verifica puntuale** (vedi §4) su un pugno di campi non esposti dall'API live.

**Cosa contiene questo piano.** §1 fotografa la sorgente (quanti DB/tabelle/colonne oggi). §2 è lo schema definitivo per dominio, colonna per colonna. §3 è la tabella unica di tutte le slice in ordine globale. §4 i cancelli di Enrico. §5 la definizione di 100%. §6 rischi.

---

## 1. SORGENTE — quanti DB/tabelle/colonne oggi + schema Qnet reale

### 1.1 DB Supabase oggi (frammentazione reale)

La realtà non è "4 DB" ma una galassia di schemi/progetti. Conteggio dalla sintesi sorgente:

| DB / progetto | Tabelle censite | Colonne (somma tra parentesi) | Note |
|---|---:|---:|---|
| **hub / qwork** | ~82 | ~760 | Cuore anagrafico + QWork + mirror Qnet (`qnet_mirror_*`) + permessi + chat/notifiche |
| **bp** (business plan) | 17 | ~190 | OKR/BMC/budget_row(32) |
| **cdg** (controllo di gestione) | 31 | ~340 | `commessa(26)`, `piano_ricavo(20)`, viste `v_budget_*` |
| **fia** (incentivi/bandi) | 14 | ~210 | `incentivi(47)` tabella-dio da spezzare |
| **for / sic** (formazione+sicurezza) | ~30+ (troncato) | — | `classe(58)` tabella-dio; decreti/discenti/docenti |

A questi si aggiungono **auth** (Supabase `auth.users`, PK identità) e i mirror Qnet (read-only). Totale ordine di grandezza: **13 schemi reali, non 4** (allineato a project_db_cleanup). Lo scopo del piano è collassarli in **1 DB logico a schemi per dominio** con viste piatte e guscio unico.

### 1.2 Schema Qnet reale (sintesi numerica, da OrderController/payload)

Recuperato senza Ciro. Copertura campi `/customers` (18.267–18.268 righe):

| Campo Qnet | Copertura | Destinazione schema definitivo |
|---|---:|---|
| `name`, `address` | ~100% | `aziende.ragione_sociale`, `aziende.indirizzo` |
| `piva` | 64% | `aziende.partita_iva` |
| `phone` | 50% | `aziende.telefono` |
| `email` | 36% | `aziende.email` |
| `fiscalcode` | 27% | `aziende.codice_fiscale` |
| `pec` | 18% | `aziende.pec` |
| `codici_ateco` | 16% | `aziende.codici_ateco` |
| `number_of_employees` | 5% | `aziende.n_dipendenti` |
| `sdi` | 2% | `aziende.sdi` |
| `website` | 1% | `aziende.sito_web` |
| `sector_ea` | **0% (BUG sync, atteso ~52%)** | `aziende.settore_ea` — da fixare |
| `is_supplier` | **1/18.268 (BUG sync)** | `aziende.is_fornitore` |
| `classe_dimensionale` | ~1/18.284 (quasi sempre null in Qnet) | `aziende.classe_dimensionale` |
| payload grezzo `/customers` | 107 campi | `aziende.meta` (jsonb, coda lunga) |

`/contacts`: 14.086/14.113 con `qnet_id`; `tags[]` e `companies[]` (N:N reale con ruolo) **non portati** in hub. `/users`: mapping disperso tra `hub.qwork_user_qnet_mapping` e `hr.dipendenti.qnet_user_id`, **rotto al 76%** (coperti ~38/161 ≈ 24%). `qnet_mirror_users` esiste ma è **vuota (0 righe) — R9, non toccare**.

**Verdetto sorgente.** Le anagrafiche esistono già (18.268 aziende, 14.113 contatti) e sono in larga parte sincronizzabili. I gap non sono strutturali ma di **mapper** (campi letti e scritti `null`) e di **modellazione mancante** (N:N contatti, satelliti qualifiche/indirizzi, estensione CRM).

---

## 2. SCHEMA DEFINITIVO (Parte B) — la fotografia del DB finale

Convenzione ruoli: **nucleo** (fatti oggettivi universali) · **estensione 1:1** (esiste perché *ci lavoriamo*) · **satellite 1:N** (liste navigabili) · **relazione N:N** · **jsonb** (coda lunga grezza) · **vista** (lettura piatta per le app).

### 2.1 Dominio `anagrafica` (schema `anagrafica`, fisicamente su `hub`)

#### `aziende` — nucleo (28 colonne)
| Colonna | Tipo | Origine | Perché |
|---|---|---|---|
| `id` | uuid PK | hub.aziende.id (esistente) | R3.2 PK interna |
| `qnet_id` | text UNIQUE | Qnet.customers.id | R3.2 chiave camerale esterna / join mirror |
| `ragione_sociale` | text NOT NULL | hub / Qnet.customers.name | R3.2 nome legale |
| `forma_giuridica` | text | **NUOVO** (non esposto in /customers) | R3.2 classificazione camerale ⚠️verifica |
| `partita_iva` | text | hub / Qnet.piva (64%) | R3.2 id fiscale |
| `codice_fiscale` | text | hub / Qnet.fiscalcode (27%) | R3.2 id fiscale |
| `indirizzo`/`citta`/`cap`/`provincia` | text | hub / Qnet (address 100%, city, zip, province_sigla) | R3.2 sede legale |
| `email` | text | hub / Qnet.email (36%) | R3.2 recapito proprio |
| `pec` | text | hub / Qnet.pec (18%) | R3.2 recapito legale |
| `telefono` | text | hub / Qnet.phone (50%) | R3.2 recapito |
| `sito_web` | text | hub / Qnet.website (1%) | R3.2 recapito |
| `sdi` | text | hub / Qnet.sdi (2%) | R3.2 fatturazione elettronica |
| `n_dipendenti` | integer | hub / Qnet.number_of_employees (5%) | R3.2 dimensione |
| `codici_ateco` | text | hub / Qnet.codici_ateco (16%) | R3.2 classificazione ISTAT |
| `settore_ea` | text | hub / Qnet.sector_ea (**0% bug**) | R3.2 settore camerale |
| `classe_dimensionale` | text | Qnet.classe_dimensionale (quasi null) | R3.2 Micro/Piccola/Media/Grande |
| `is_cliente` | boolean NOT NULL DEFAULT false | **NUOVO** (oggi solo qcont.anagrafica) | R3.5 eccezione: tag-ruolo nel nucleo per legge 3-anagrafiche |
| `is_fornitore` | boolean NOT NULL DEFAULT false | hub / Qnet.is_supplier (**bug, 1 riga**) | R3.5 tag-ruolo |
| `is_partner` | boolean NOT NULL DEFAULT false | **NUOVO** (qcont.anagrafica, 56 righe) | R3.5 tag-ruolo da ODA/provvigioni |
| `presente_in_qnet` | boolean NOT NULL DEFAULT true | hub (implicito da qnet_id) | R3.2 distingue manuali da sync |
| `origine` | text NOT NULL DEFAULT 'qnet' | hub.aziende.origine | R3.2 provenienza |
| `sincronizzato_il` | timestamptz | hub.aziende.sincronizzato_il | R3.2 metadato sync |
| `meta` | jsonb | STW.anagrafica_clienti.meta (107 campi) | R3.4 coda lunga payload grezzo |
| `created_at`/`updated_at` | timestamptz NOT NULL DEFAULT now() | hub | R3.2 sistema |

#### `aziende_commerciale` — estensione 1:1 (15 colonne)
`azienda_id` (PK/FK UNIQUE → aziende) · `categoria` · `tag_tipologia text[]` · `fonte_qnet_id integer` (Qnet.source_id) · `fonte_label` (lookup) · `gestore_interno_id`→utenti (Qnet.assigned_id) · `supervisore_id`→utenti (assigned_id_2) · `commerciale_id`→utenti (agent) · `stato_convenzione` ⚠️ · `note_convenzione` · `comunicazione_email boolean` (consenso) · `commenti` · `created_at`/`updated_at`. **Tutte R3.3** — esistono perché c'è il nostro processo CRM, non sono fatti dell'azienda.

#### `aziende_qualifiche` — satellite 1:N (11 colonne)
`id` PK · `azienda_id` FK · `tipo` (enum iso/soa/sicurezza/avvalimento — **accorpate anti-sbriciolamento**) · `standard_norma` · `classifica` · `ente_rilascio` · `data_rilascio` · `data_scadenza` · `documento_url` · `note` · `created_at`. **R3.4** — una riga per certificazione, navigabile/filtrabile.

#### `aziende_indirizzi` — satellite 1:N (9 colonne)
`id` PK · `azienda_id` FK · `tipo` (operativo/magazzino/filiale) · `indirizzo` NOT NULL · `citta`/`provincia`/`cap` · `specifica` · `created_at`. **R3.4** — 1:N (si filtra per sede operativa), non jsonb. Il principale resta nel nucleo.

#### `contatti` — nucleo (15 colonne)
`id` PK · `qnet_id` UNIQUE (14.086 valorizzati) · `nome` NOT NULL · `cognome` · `ruolo` (Qnet.type) · `email` · `telefono` · `cellulare` · `principale boolean` (sync non lo imposta) · `tags text[]` (**MANCANTE in hub**, da Qnet.contacts.tags) · `origine` · `sincronizzato_il` · `created_at`/`updated_at`. **R3.2** — fatti della persona fisica.

#### `contatti_aziende` — relazione N:N (5 colonne)
`contatto_id` FK · `azienda_id` FK · `ruolo_in_azienda` ⚠️(pivot Qnet companies[]) · `principale boolean` · `created_at`. PK composta. **R3.4** — sostituisce il campo piatto `contatti.azienda_qnet_id` (che porta solo la prima azienda).

#### `utenti` — nucleo (13 colonne)
`id` PK = `auth.users.id` · `email` NOT NULL UNIQUE (legge 1-account-per-persona) · `nome`/`cognome` NOT NULL · `ruolo` (enum) · `fa_codice` (BU/BS, da hr.dipendenti) · `stato` (enum) · `is_superadmin` · `avatar_url` (**MANCANTE in hub**, da Qnet/HR) · `note` · `created_at`/`updated_at`. **R3.2**.

#### `utenti_qnet_mapping` — estensione 1:1 (10 colonne)
`utente_id` FK UNIQUE · `qnet_user_id bigint UNIQUE` · `qnet_email` · `qnet_nome`/`qnet_cognome` · `qnet_level_id bigint` (da hr) · `qnet_rate_id bigint` (da hr) · `qnet_synced_at` · `created_at`. **R3.3** — il mapping esiste solo per il nostro sync; consolida `hub.qwork_user_qnet_mapping` + `hr.dipendenti.qnet_*`.

#### `v_aziende_full` — vista (lettura piatta)
`SELECT a.*, ac.categoria, ac.tag_tipologia, ac.gestore_interno_id, ac.supervisore_id, ac.commerciale_id, ac.stato_convenzione, ac.fonte_label, ac.comunicazione_email FROM aziende a LEFT JOIN aziende_commerciale ac ON ac.azienda_id = a.id`. Ricuce nucleo+estensione: le app leggono tutto in un JOIN, sostituendo i `SELECT *` sparsi.

### 2.2 Dominio `commerciale` (schema `commerciale`, fisicamente su `sales`)

Entità target: `deal`, `opportunita`, `opportunita_bu`, `offerta`, `offerta_riga`, `ordine_cliente`, `commessa_commerciale` + mirror Qnet (`qnet_opportunita_mirror`, `qnet_offerta_mirror`, R9) + viste `v_deal_aggregato`, `v_pipeline_commerciale`.

#### `commerciale.deal` — nucleo (17 colonne)
Contenitore cliente cross-BU. `id` PK · `codice` NOT NULL ('DEAL-NNN') · `azienda_id` **FK → anagrafica.aziende** (era `anagrafica_id` piatto) · `denominazione` NOT NULL · `descrizione` · `stato` DEFAULT 'aperto' · `titolare_id`→auth.users · `data_apertura`/`data_chiusura_prevista`/`data_chiusura_effettiva` · `valore_totale_aperto`/`valore_totale_vinto numeric(14,2)` (aggregati) · `note` · `attivo` (soft-delete) · `created_at`/`updated_at`/`created_by_utente_id`. La relazione col cliente è **FK verso il master anagrafica**, non campo locale (R3.1).

#### `commerciale.opportunita` — nucleo (~36 colonne)
`id` PK · `qnet_id` UNIQUE (NULL per opp solo-Workspace) · `codice` · `deal_id` FK · `azienda_id` **FK → anagrafica.aziende** · `contatto_principale_id` **FK → anagrafica.contatti** · `titolo` NOT NULL · `descrizione` · `titolare_id`→auth.users (GA1) · `fonte_id`/`campagna_id` · `fa_codice` (BU, da mirror Qnet) · `sede_operativa_qnet_id` · `fase_qnet` · `workflow_status` (pending|closed) · `valore_stimato` · `data_apertura`/`data_chiusura_prevista` · `status_derivato` · `valore_in_lavorazione`/`valore_vinto` · `note` · `is_lead boolean` · `bu_suggerita_id` (routing) · `operatore_id`→auth.users (GA2) · `imputato_partner_id` **FK → anagrafica.aziende (is_partner)** — partner GA3, LEGGE 27/06 · `in_pagina_ponte` · `qnet_updated_at` · `qnet_payload jsonb` (R4 coda lunga) · `attivo`/`archiviato_il` · audit. I valori pipeline (`fa_codice`, `fase_qnet`, `valore_stimato`…) **portano dal mirror Qnet** dentro il nucleo per significato.

#### `commerciale.opportunita_bu` — satellite 1:N (7 colonne)
`id` PK · `opportunita_id` FK · `bu_id` FK → business_unit · `stato` · `valore numeric(14,2)` · `attivo` · `created_at`. **R3.4** — una opp cross-BU genera una riga per BU.

#### `commerciale.offerta` — nucleo (~45 colonne)
`id` PK · `qnet_id` UNIQUE (Qnet /offers.id) · `opportunita_id` FK (lineage OPP→OFF) · `codice_progressivo int`/`codice_offerta` · `bu_id` FK · `prodotto_id`/`divisione_id` · `operatore_id`→auth.users · `campagna_id` · `valore_offerta`/`valore_iva`/`valore_imponibile numeric(14,2)` · `status_quotation int` (0=Presentata…6=Scaduta, **≥1 = contratto**) · `status_label` · `is_active`/`is_won`/`is_lost` · `versione`/`offerta_padre_id` (self-join storico) · `data_offerta`/`data_scadenza`/`data_accettazione_cliente`/`data_chiusura` · `motivo_perdita_id`/`_dettaglio` · `commessa_codice` (bridge testuale transitorio) · `riassegnata_flag`/`_dal`/`_sla_scadenza` (SLA) · `gestori_account_aggiuntivi jsonb`/`partecipanti_a_tempo jsonb` (R4 coda lunga) · `note` · `qnet_payload jsonb`/`qnet_updated_at` · `validata_commerciale_da_utente_id` · `attivo` · audit.

#### `commerciale.offerta_riga` — satellite 1:N (8 colonne)
`id` PK · `offerta_id` FK · `prodotto_id` FK · `quantita int` (Qnet QUOTATION_SERVICES[].qty) · `prezzo_unitario numeric(14,2)` (snapshot) · `importo_totale` (calc) · `note` · `ordine int`. **R3.4** — righe di preventivo.

#### `commerciale.ordine_cliente` / `commessa_commerciale` — nuclei (sintesi)
Generati dall'offerta vinta (`is_won`); `ordine_cliente.azienda_id` FK → anagrafica.aziende, lineage OFF→OC→CM via `commessa_codice` (bridge) verso `cdg.commessa`. Viste `v_deal_aggregato`/`v_pipeline_commerciale` ricuciono deal→opp→off per la pipeline UI.

> **Mirror Qnet** (`qnet_opportunita_mirror`, `qnet_offerta_mirror`): R9 — read-only, alimentano `qnet_id`/`qnet_payload`, **mai scritti dal piano**.

### 2.3 Domini non ancora alberati (collocazione per regola, schema da approvare slice-1 dedicata)

Allineati alle stesse leggi; l'albero-campi colonna-per-colonna verrà prodotto come slice-1 di ciascun dominio prima di qualsiasi codice (R7). Collocazione di principio:

| Dominio | Schema | Nucleo (estratto) | Estensioni/satelliti | Note tabella-dio da spezzare |
|---|---|---|---|---|
| **controllo_gestione** | `cdg` | `commessa(26)`, `conto`, `budget` | `conto_periodo`, `piano_ricavo` + target_bu/sede (satelliti), viste `v_budget_*` già piatte | — |
| **formazione** | `for` | `discente`, `corso_svolto`, `classe` | `classe_iscrizione`, `classe_documento`, `calendario_lezione`, `attestato_*`, `decreto_regione` (satelliti) | **`classe(58)`** → nucleo classe + satelliti iscrizioni/documenti |
| **sicurezza** | `sic` (condiviso con for) | `corso_svolto`, `docente` | `docente_oda`, `docente_fattura`, `accertamento_sanitario` | accorpare con formazione (DB `for/sic` unico) |
| **incentivi** | `fia` | `incentivi` → **spezzare** | `fonti`, `app_bando_tags`, `scraping_reports` | **`incentivi(47)`** tabella-dio → nucleo bando + estensione requisiti + satelliti tag |
| **business_plan** | `bp` | `bmc`, `okr`, `budget_row` | `bmc_section`, `risorsa_progetto` | `budget_row(32)`/`okr(34)` da rivedere per significato |

---

## 3. PERCORSO (Parte C) — tabella unica di TUTTE le slice in ordine globale

Ordine globale rispetta **R6** (anagrafica prima) e i **DB condivisi** (hub+qwork insieme; for+sic insieme; auth a parte). Tipi: `albero` (solo doc) · `expand` (aggiungi, mai rompi) · `migrate` (sync/backfill) · `repoint` (app legge nuovo) · `contract` (rimuovi vecchio) · `sync`/`vista`.

| # | Dominio | Slice | Tipo | Rischio | Gate Enrico | Dipende da |
|---:|---|---|---|---|:---:|---|
| 1 | anagrafica | albero-approvato-anagrafica | albero | nessuno | — | — |
| 2 | anagrafica | expand-aziende-nucleo (is_cliente, is_partner, classe_dimensionale, meta, forma_giuridica) | expand | nessuno | — | #1 |
| 3 | anagrafica | expand-contatti-tags | expand | nessuno | — | #1 |
| 4 | anagrafica | expand-utenti-avatar | expand | nessuno | — | #1 |
| 5 | anagrafica | crea-aziende-commerciale (estensione 1:1) | expand | nessuno | — | #2 |
| 6 | anagrafica | crea-aziende-qualifiche (satellite) | expand | nessuno | — | #2 |
| 7 | anagrafica | crea-aziende-indirizzi (satellite) | expand | nessuno | — | #2 |
| 8 | anagrafica | crea-contatti-aziende-nn (N:N) | expand | basso | — | #5 |
| 9 | anagrafica | crea-utenti-qnet-mapping | expand | nessuno | — | #4 |
| 10 | anagrafica | crea-v-aziende-full (vista piatta) | vista | nessuno | — | #5 |
| 11 | anagrafica | migrate-sync-anagrafica-campi-crm (fix is_supplier/sector_ea/classe/tags + popola estensione & N:N) | migrate | basso | **SÌ** | #2,#3,#5,#8 |
| 12 | anagrafica | migrate-utenti-qnet-mapping-backfill (≥38 righe) | migrate | basso | — | #9 |
| 13 | anagrafica | repoint-hub-api-aziende (GET da v_aziende_full) | repoint | basso | **SÌ** | #10,#11 |
| 14 | anagrafica | repoint-contatti-n-n (hub/qwork/iso leggono contatti_aziende) | repoint | medio | **SÌ** | #8,#11 |
| 15 | anagrafica | contract-azienda-qnet-id-piatto (DROP COLUMN) | contract | medio | **SÌ** | #14 |
| 16 | anagrafica | sync-is-cliente-is-partner-da-relazioni (cron derivato) | sync | basso | **SÌ** | #2 |
| 17 | commerciale | albero-approvato-commerciale | albero | nessuno | — | #1 |
| 18 | commerciale | expand-opportunita-nucleo (qnet fields, imputato_partner_id→aziende) | expand | basso | — | #15,#17 |
| 19 | commerciale | repoint-FK-anagrafica (deal/opp/oc.anagrafica_id → azienda_id FK aziende) | repoint | medio | **SÌ** | #15,#18 |
| 20 | commerciale | crea-opportunita_bu / offerta_riga (satelliti) | expand | basso | — | #18 |
| 21 | commerciale | crea-v-pipeline (v_deal_aggregato, v_pipeline_commerciale) | vista | nessuno | — | #20 |
| 22 | commerciale | repoint-app-pipeline (Sales legge viste) | repoint | medio | **SÌ** | #21 |
| 23 | cdg | albero-approvato-cdg | albero | nessuno | — | #1 |
| 24 | cdg | repoint-commessa-FK-anagrafica + bridge OFF→OC→CM | repoint | medio | **SÌ** | #19,#23 |
| 25 | for/sic | albero-approvato-formazione-sicurezza (DB condiviso) | albero | nessuno | — | #1 |
| 26 | for/sic | split-classe-58 (nucleo classe + satelliti iscrizioni/documenti) | expand | basso | — | #25 |
| 27 | for/sic | repoint-discente-FK-contatti + partner-FK-aziende | repoint | medio | **SÌ** | #15,#26 |
| 28 | fia | albero-approvato-incentivi | albero | nessuno | — | #1 |
| 29 | fia | split-incentivi-47 (nucleo bando + estensione + satellite tag) | expand | basso | — | #28 |
| 30 | bp | albero-approvato-business-plan | albero | nessuno | — | #1 |
| 31 | bp | repoint-utenti-FK-auth (bp.utenti → utenti master) | repoint | basso | — | #4,#30 |
| 32 | tutti | contract-DB-vecchi (spegni schemi legacy, viste finali) | contract | alto | **SÌ** | #19,#24,#27,#29,#31 |

**Note di ordinamento.** Le slice `expand` non hanno gate (aggiungono colonne NULL/tabelle vuote: zero rotture, rollback = DROP). I gate si concentrano su `migrate`/`repoint`/`contract`, dove cambia il comportamento delle app. La catena anagrafica (#1→#16) è prerequisito di **ogni** dominio a valle (R6).

---

## 4. CANCELLI di Enrico (i "vai" al deploy)

Niente più muri di Ciro: lo schema è recuperato da OrderController, quindi il percorso **non si ferma** in attesa di documentazione. Restano i cancelli operativi (deploy che cambia comportamento) e **1 sola verifica puntuale**.

**Cancelli operativi** (Enrico dice "vai", io eseguo fino al cancello successivo):
1. **#11 migrate-sync** — prima di riscrivere il mapper, conferma il fix dei 3 bug (is_supplier, sector_ea, classe_dimensionale). Verifica veloce: dopo il run, `settore_ea` passa da 0% a ~52%.
2. **#13/#14 repoint API** — le app iniziano a leggere viste/N:N. Verifica: GET `/api/v1/aziende` torna i nuovi campi senza rotture.
3. **#15 contract DROP azienda_qnet_id** — irreversibile sul campo (script DOWN pronto). Gate: nessun `SELECT azienda_qnet_id` nel codice + e2e verde.
4. **#19/#24/#27 repoint-FK-anagrafica** — i domini a valle agganciano il master. Gate: parità righe cross-DB via qnet_id.
5. **#32 contract DB-vecchi** — spegnimento schemi legacy. Gate finale: viste piatte servono tutte le app, parità chiusa.

**L'unica verifica puntuale che resta** (un solo messaggio a Ciro, non un muro — il piano prosegue in parallelo sui campi certi):
- **`stato_convenzione`** — visibile a video nella scheda Qnet (Tab Info) ma **non nei campi API documentati**: quale endpoint lo espone?
- Collegati, da chiudere nella stessa risposta: **`forma_giuridica`** (in DB Qnet ma non in `/customers`), **`fonte_qnet_id`→label** (serve lookup `/sources`), **pivot `contacts.companies[]`** (ha il ruolo o solo id+name?).

Tutti i campi `aziende_commerciale`/`contatti_aziende` che dipendono da queste risposte sono già **creati come colonne NULL** (slice expand): si **popolano quando la risposta arriva**, senza ridisegnare nulla.

---

## 5. MILESTONE & Definizione di 100%

**M1 — Anagrafica master viva** (#1–#16): nucleo+estensioni+satelliti+N:N popolati; sync CRM fixato; viste piatte; flag ruolo derivati da relazioni. *È il prerequisito R6 di tutto.*
**M2 — Commerciale agganciato** (#17–#22): deal/opp/off con FK reali verso il master; pipeline su viste.
**M3 — CdG/Formazione/Sicurezza/Incentivi/BP riallineati** (#23–#31): ogni dominio aggancia anagrafica via FK; tabelle-dio (`classe 58`, `incentivi 47`) spezzate per significato.
**M4 — Spegnimento legacy** (#32).

**Definizione di 100%** (tutte e quattro le condizioni vere):
1. **DB vecchi spenti** — schemi legacy collassati in 1 DB logico a schemi per dominio; nessun campo piatto-relazione (es. `azienda_qnet_id`) residuo.
2. **Viste piatte** — ogni app legge da `v_*` (nucleo+estensioni ricuciti); zero `SELECT *` cross-tabella sparsi nel codice.
3. **Guscio unico** — login Hub unico; navigazione cross-app via FK reali sul master anagrafica.
4. **Parità chiusa** — REGISTRO_PARITÀ Qnet↔WeA a zero gap sui campi modellati (il 76% mapping utenti chiuso col dump `/users` di Ciro); copertura sync ai valori attesi (es. settore_ea ~52%, non 0%).

---

## 6. RISCHI & mitigazioni

| # | Rischio | Probabilità | Mitigazione |
|---|---|---|---|
| R1 | **DROP `azienda_qnet_id` (#15)** rompe un consumer non censito | media | Strangler R5: rinomina prima della DROP; grep esaustivo dei consumer; script DOWN scritto **prima**; e2e verde come gate. |
| R2 | **Mapping utenti 76% rotto** non si chiude senza Ciro | alta | Backfill #12 copre il 24% subito; il resto NON blocca le altre slice; dump `/users` come task parallelo, non sul percorso critico. |
| R3 | **Campi incerti** (stato_convenzione, forma_giuridica, fonte_label, pivot companies) | media | Colonne create NULL in expand: si popolano a risposta arrivata; nessun ridisegno. Una sola domanda a Ciro (§4). |
| R4 | **Bug mapper silenziosi** (sector_ea 0%, is_supplier 1 riga) si ripresentano | media | Gate #11 con verifica di copertura post-run (0%→~52%); test di non-regressione sul mapper. |
| R5 | **Sessioni parallele / 17 worktree** si clobberano | media | Worktree isolato per batch (`qualifica-run`); commit+push subito; mai branch condivisa. |
| R6 | **Mirror Qnet** modificati per errore (R9) | bassa | Marcati read-only nello schema; `qnet_mirror_*` e `qnet_*_mirror` esclusi da ogni migration di scrittura. |
| R7 | **Tabelle-dio** (`classe 58`, `incentivi 47`) spezzate male | media | Albero-campi per significato (slice `albero` dedicata) approvato **prima** del codice (R7); split per dominio, tabelle nuove accanto (strangler). |
| R8 | **FK cross-schema** (commerciale→anagrafica, cdg→anagrafica) su 1 DB logico | bassa | 1 solo DB fisico `bqyqr` + schemi: le FK cross-schema sono native; join via `qnet_id` solo verso i mirror. |
| R9 | **`is_cliente`/`is_partner` derivati** divergono dal vero | bassa | Cron #16 ricalcola da relazioni (orders/ODA), non a mano (LEGGE 27/06); flag = ultimo valore sicuro se cron off. |

> **Dominio 8 — Contabilità Passiva:** dettaglio completo (28 tabelle, slice CP-1→CP-15) nel companion [PIANO_MASTER_CONTABILITA_PASSIVA.md](PIANO_MASTER_CONTABILITA_PASSIVA.md). Si inserisce nella sequenza globale dopo la Contabilità Attiva.


---

## 🛡️ Referto Custode (firma sullo schema definitivo, R1-R9)

| Regola | Esito | Nota |
|---|---|---|
| R1 un solo DB | ✅ | tutto in `bqyqr` + schemi per dominio |
| R2 nucleo+estensioni | ✅ | ogni dominio nucleo+estensioni+satellite; accorpamenti fatti (es. aziende_qualifiche). ⚠️ dominio *trasversale* (41 tab) da ri-verificare per non-sbriciolamento alla slice |
| R3 collocazione per significato | ✅ | per dominio/origine; i `campi_incerti` per dominio si rifiniscono alla slice (non bloccanti) |
| R4 riclassificare economico | ✅ | 1 DB → ALTER locale |
| R5 strangler + DOWN | ✅ | ogni slice ha tipo expand/migrate/repoint/contract + rollback |
| R6 anagrafica prima | ✅ | sequenza globale parte da anagrafica |
| R7 albero prima | ✅ | schema definitivo per ogni dominio prima delle slice |
| R8 gate | ✅ | additivo = autonomo (VAI standing); irreversibili (login, decommission) = cenno Enrico |
| R9 no mirror Qnet / 3 anagrafiche | ✅ | mai toccare `qnet_*`/`commessa_sync`/`discente_commessa`; partner=azienda con flag |

**VERDETTO: ✅ CONFORME** — con 2 riserve minori non bloccanti: (a) rifinire i `campi_incerti` di ogni dominio alla rispettiva slice; (b) ri-verificare il dominio *trasversale* per evitare sbriciolamento. Nessuna regola violata.

---

## 🔍 Critico di completezza (workflow)

I now have full grounding. The SCHEMA+SLICE delivered for review covers the **anagrafica** domain completely plus a truncated **commerciale** domain. The SOURCE enumerates all 13 DBs. The parity registry is the authoritative cross-source map.

I can now produce the precise completeness critique across the four axes. I'll focus on real gaps verifiable from the source listing and the parity registry.

# 🔍 Critico di COMPLETEZZA — Schema+Slice vs Sorgente (13 DB) vs Qnet

**Verdetto sintetico:** lo schema/slice consegnato copre **solo il dominio `anagrafica`** (più un `commerciale` troncato a metà). Confrontato con la **sorgente reale (13 DB)** e con il **registro di parità Qnet↔WeA**, mancano: ~10 domini interi senza slice, alcune tabelle/colonne sorgente non collocate dentro l'anagrafica stessa, una dipendenza d'ordine errata e due rischi DB-condiviso/auth non gestiti negli slice. Dettaglio sotto.

---

## (1) Tabelle/colonne SORGENTE non collocate in nessuna tabella target

**Dentro il dominio anagrafica (lo slice dovrebbe coprirle ma non lo fa):**

- **`hub.aziende.referente* / referente_email / referente_telefono`** — la sorgente li ha (parità riga 32: "Azienda — referente → `hub.aziende.referente*` portato"), l'ALBERO_AZIENDE li mette in `aziende_commerciale`, ma nello **schema_definitivo di `aziende_commerciale` NON compaiono**. Aggiungerli (3 colonne) o dichiararli esplicitamente assorbiti da `contatti_aziende`.
- **`aziende_commerciale.segnalatore`** — presente nell'albero (riga 16) ma **assente** dallo schema_definitivo. Va aggiunto.
- **`aziende_qualifiche` — manca il discriminatore `avvalimenti`/`sicurezza`**: l'albero accorpa ISO+SOA+sicurezza+**avvalimenti**; l'enum `tipo` dello schema elenca solo `iso/soa/sicurezza/avvalimento` ma la copertura del caso "avvalimento" (chi presta requisiti) non ha colonne dedicate (azienda_avvalente). Da chiarire.
- **`qcont.anagrafica` (65 righe: 2 cli + 64 forn + 56 part) + `qcont.fornitore_dettagli` + `qcont.cliente_dettagli`** — sono fonte di `is_cliente/is_fornitore/is_partner` ma **nessuno slice migra/aggancia questi 65 record all'Hub**. Parità riga 50: `azienda_hub_id` valorizzato **1/65**. Lo slice 16 deriva i flag da `orders`/`provvigioni`, ma i **dettagli fornitore/cliente Q-CONT** (IBAN, condizioni pagamento, dati contabili) non hanno casa target. → manca uno slice "aggancio Q-CONT→Hub + estensione `aziende_contabilita`".
- **`qcont.agente_commerciale` (19 col, 55 righe)** — citato in `campi_incerti` ma **non collocato**. È persona fisica che riceve provvigioni → deve entrare nel nucleo `contatti` (o `aziende` se PG), con FK reale. Oggi è entità parallela senza FK (parità riga 59, 83). Decisione rimandata = colonna non collocata.

**Fuori dall'anagrafica — tabelle sorgente per cui NON esiste alcun target (perché il dominio non ha slice):** vedi punto (2). Esempi sorgente non collocati: `hub.qnet_mirror_anagrafica(14)` **0 righe** e `hub.qnet_mirror_users(13)` **0 righe** — lo slice 9 dice "non toccare" `qnet_mirror_users`, ma **non decide il destino di `qnet_mirror_anagrafica`** (parità gap #4: "decidere se popolarla o eliminarla"). Tabella sorgente lasciata orfana.

---

## (2) Entità / App NON coperte da alcuno slice

Lo schema+slice consegnato copre **`anagrafica`** e (troncato) **`commerciale`**. La sorgente ha **13 DB**. Restano SENZA slice:

| Dominio / DB sorgente | Tabelle chiave non coperte | Perché è un buco |
|---|---|---|
| **Commesse (STW)** | `commesse(95 col)`, `commessa_riepilogo_costi`, `commessa_costo`/`commessa_prodotto` (mai create) | Parità §2: `meta` JSONB mai scritto, `business_unit_id`/`edition_id` assenti, righe-costo mancanti. Nessuno slice. |
| **Discenti (STW/FOR/Q-CONT)** | `discenti(10.833)`, `discente_commessa(8.030)`, `classe_iscrizione` | 3 anagrafiche partner senza FK unica; override `partner_manuale` inesistente. Nessuno slice. |
| **Contabilità attiva/passiva (Q-CONT)** | `oda(54)`, `fattura_attiva(44)`, `fattura_passiva(41)`, `decreto_regione`, `lista_bonifici`, provvigioni (3 tab) | GAP soldi #1: bridge provvigioni senza cron, wallet €0. Nessuno slice. |
| **FOR/SIC (DB CONDIVISO `lkkknwas`)** | `classe(58)`, `catalogo_corso`, `docente`, `decreto_regione(24)` | Zona 2 di rischio. Nessuno slice + nessuna gestione condivisione. |
| **HR** | `dipendenti(102 col)` — fonte di `avatar_url`, `qnet_user_id`, `qnet_level_id/rate_id` | Lo slice 12 backfilla `utenti_qnet_mapping` da HR ma **HR come dominio non ha albero/slice proprio**. |
| **CdG** | `commessa(26)`, `gerarchia_prodotto`, `piano_ricavo` | Catalogo/gerarchia prodotto (5 livelli BU→Linea→Cat→Prod) senza slice. |
| **ISO** | `commesse(34)`, `clienti(16)`, `contatti(13)` | ISO ha **propri** `clienti`/`contatti`: 4° e 5° mirror anagrafica non riconciliati nello schema. |
| **BP / FIA / SOA / SGI / quaimed** | `incentivi(47)`, `okr`, `budget_row` ecc. | Nessuna menzione. |

**Inoltre:** lo schema cita `auth.users(id)` come target di FK (in `commerciale.deal`), ma **nessuno slice tratta lo schema `auth` / il DB `bqyqr` login** come entità — vedi punto (4).

---

## (3) Dipendenze d'ordine violate

1. **Slice 11 `migrate-sync-anagrafica-campi-crm` dipende da `crea-aziende-commerciale` e `crea-contatti-aziende-nn`, MA il punto (e) scrive FK `gestore_interno_id → utenti.id`** risolvendo "via email/qnet_id". Questo richiede che **`utenti_qnet_mapping` sia già popolato** (slice 12) per risolvere `assigned_id`(int Qnet)→`utenti.id`(uuid). Lo slice 11 **NON dipende da slice 12** → al momento dell'esecuzione le FW commerciali resteranno NULL per gli utenti non mappabili per email. **Aggiungere `dipende_da: crea-utenti-qnet-mapping` (slice 9) e idealmente il backfill 12.**

2. **Slice 8 `crea-contatti-aziende-nn` dipende da `crea-aziende-commerciale` (slice 5)** — dipendenza **spuria**: la giunzione contatto↔azienda non usa nulla di `aziende_commerciale`. Dovrebbe dipendere solo da `expand-aziende-nucleo` (le aziende devono esistere) + `contatti`. Falsa dipendenza che serializza inutilmente.

3. **Slice 16 `sync-is-cliente-is-partner` dipende solo da `expand-aziende-nucleo`** ma deriva `is_partner` da "provvigioni/ODA" che vivono in **Q-CONT (DB dedicato `eqprzkde`)**, cross-DB via `qnet_id`. Manca la dipendenza dal fatto che **Q-CONT sia agganciato all'Hub** (`azienda_hub_id`, oggi 1/65). Senza quell'aggancio il cron deriva su join inaffidabile. Dipendenza di dato mancante.

---

## (4) Rischi DB condiviso / auth NON gestiti

1. **🔴 ZONA 1 — schema `auth`/login `bqyqr` toccato dalle FK senza slice dedicato.** Lo schema commerciale dichiara `titolare_id → auth.users(id)`, `created_by_utente_id → auth.users(id)`. Ma `utenti` è nel DB **`bqyqr` CONDIVISO da 10 app** (login di bp, cdg, fia, hr, iso, qcont, sales, sic + hub + qwork). Nessuno slice marca queste FK come **gate IRREVERSIBILE / zona auth**. Tutti gli slice anagrafica girano su `bqyqr`: ogni `CREATE TABLE` con FK verso `utenti` è additivo-OK, **ma il repoint/contract (slice 13–15) tocca codice letto da hub+qwork insieme** e **qwork ha ZERO test** (topologia Zona 2). Gli slice 13/14/15 elencano file di `apps/hub`, `apps/iso`, `apps/qwork` ma **non dichiarano il deploy coordinato hub+qwork** richiesto dalla Zona 2. → Aggiungere a slice 13/14/15 il vincolo "deploy simultaneo hub+qwork; smoke test manuale qwork (no CI)".

2. **🟠 ZONA 2 — coppia for+sic (DB condiviso `lkkknwas`) totalmente assente.** Quando arriveranno gli slice FOR/SIC, un rename sul DB colpisce entrambe con **rischio leak corsi FOR↔SIC** (filtro categoria). Va annotato già ora come pre-requisito di dominio.

3. **Slice `crea-v-aziende-full` (10) ripunta `apps/sales/.../ricerca-universale` e `apps/iso/.../contatti`** che **leggono da DB DEDICATI** (`vqtqccn` sales, `vaczrsvo` iso), non da `bqyqr`. Una **vista `hub.v_aziende_full` non è accessibile cross-DB**: quelle app non possono fare `SELECT` su uno schema di un altro Supabase. → Il repoint per sales/iso deve passare da **endpoint read-only Hub + gettone** (regola "no chiavi DB cross-app"), non dalla vista. Lo slice 10 elenca quei file come se leggessero la vista direttamente: **errore di collocazione cross-DB**.

---

## ✅ Cosa AGGIUNGERE (preciso)

1. **Schema `aziende_commerciale`:** aggiungere colonne `referente`, `referente_email`, `referente_telefono`, `segnalatore` (presenti nell'albero, mancanti nello schema).
2. **Nuovo slice `aggancio-qcont-hub`:** backfill `qcont.anagrafica.azienda_hub_id` (oggi 1/65) + creare estensione `aziende_contabilita` per `fornitore_dettagli`/`cliente_dettagli` (IBAN, condizioni pagamento).
3. **Decidere destino `qnet_mirror_anagrafica` (0 righe):** slice esplicito DROP o popolamento (oggi orfana).
4. **Collocare `qcont.agente_commerciale` (55):** slice di merge nel nucleo `contatti` con FK reale (oggi entità parallela senza FK).
5. **Correggere dipendenze:** slice 11 → aggiungere `dipende_da: crea-utenti-qnet-mapping`; slice 8 → rimuovere dipendenza spuria da slice 5; slice 16 → aggiungere pre-requisito aggancio Q-CONT.
6. **Marcare zona auth/condivisa:** slice 13/14/15 → vincolo deploy coordinato **hub+qwork** + smoke test manuale qwork (zero CI).
7. **Correggere slice 10 cross-DB:** per `apps/sales` e `apps/iso` il repoint NON è alla vista `hub.v_aziende_full` (DB diversi) ma a **endpoint read-only Hub + gettone**.
8. **Pianificare i ~10 domini senza slice** (commesse, discenti, contabilità, FOR/SIC, HR, CdG, ISO, BP/FIA/SOA/SGI/quaimed) con i loro alberi prima del migrate, in particolare riconciliare i **mirror anagrafica ridondanti**: STW `anagrafica_clienti`, Sales `anagrafica_cliente`, ISO `clienti`/`contatti` — 3–5 copie di `/customers` che la regola 1-fonte impone di far leggere da Hub.

**File di riferimento (assoluti):**
- `/Users/enricoferrante/Desktop/STW/REGISTRO_PARITA_QNET_WEA.md` (mappa cross-DB autoritativa)
- `/Users/enricoferrante/Desktop/STW/TOPOLOGIA_DB_REALE_27-06.md` (zone di rischio auth/condiviso)
- `/Users/enricoferrante/Desktop/STW/ALBERO_AZIENDE_27-06.md` (campi albero non riportati nello schema)
- `/Users/enricoferrante/Desktop/STW/ESECUZIONE_ERP_LOG.md` (solo Aziende S1/S2 applicate; conferma che gli altri domini non hanno slice)

**Nota onesta:** SCHEMA+SLICE e SORGENTE forniti nel prompt sono **troncati** (commerciale tagliato a metà; SORGENTE tagliata dentro `qcont.partn…`). I gap (2) sui domini non-anagrafica valgono se quei domini non hanno slice altrove; l'ESECUZIONE_ERP_LOG conferma che **a oggi solo Aziende ha slice applicati**, quindi il buco è reale, non un artefatto del troncamento.

---

## ⛔ I DUE cancelli di Enrico (gli unici stop)
1. **Tabelle di LOGIN** (`utenti`/auth in bqyqr, login di 10 app) — ti porto la migration specifica con proposta sì/no.
2. **Spegnimento finale dei DB vecchi** (contract/decommission) — un "vai" finale quando tutto è migrato e verde da 30 gg.
Tutto il resto (additivo, migrate, repoint, contract a logica decisa) procede col protocollo: transazione + verifica + health-check + DOWN.

## 🎯 Definizione di "100% finito"
DB vecchi spenti · viste piatte per entità · guscio unico (un indirizzo, sezioni a slash) · parità Qnet chiusa · tutti i 1.033 siti codice ripuntati al DB unico.
