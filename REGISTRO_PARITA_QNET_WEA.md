# Registro Parità Qnet ↔ Workspace — 27/06/2026

> **Nota onesta.** Il dump completo dello schema Qnet (341 tabelle) è **PERSO** (la cartella `~/Desktop/STW/QNET/` contiene solo `.DS_Store`). Questo registro è quindi **PARZIALE**: si basa sull'Archivio-Conoscenza, sugli screenshot delle schede Qnet e sullo schema **live** del Workspace. Le righe marcate **da-verificare** restano aperte e si chiudono **solo** quando Ciro ri-fornisce il dump Qnet.

**Come leggere gli stati:**

- **portato** = il dato c'è in Qnet e arriva nel Workspace.
- **mancante** = il dato esiste in Qnet (o serve) ma nel Workspace non c'è o è vuoto.
- **scartato-apposta** = è una cosa solo-Workspace, in Qnet non esiste e va bene così.
- **divergente-voluto** = il dato c'è in entrambi ma è modellato in modo diverso per scelta.
- **da-verificare** = non confermabile finché il dump Qnet è perso.

---

## 1. Anagrafiche — Aziende, Contatti, Utenti

| Concetto | Qnet | Workspace | DB | Stato | Note |
|---|---|---|---|---|---|
| Azienda — ID Qnet | `/customers → id` | `hub.aziende.qnet_id` (18.267) | Hub | portato | Chiave di join tra i mirror. |
| Azienda — ragione sociale | `/customers → name` | Hub + STW + Sales + Q-CONT `.ragione_sociale` | tutti | portato | 4 copie sincronizzate in modo indipendente. |
| Azienda — P.IVA | `c.piva` | Hub/STW/Sales/Q-CONT | tutti | portato | Nome campo diverge tra tipo TS (`vat_number`) e payload reale (`c.piva`). |
| Azienda — codice fiscale | `c.fiscalcode` | Hub/STW/Sales/Q-CONT | tutti | portato | Stessa divergenza nome campo. |
| Azienda — indirizzo sede | `c.address/city/zip` | Hub + STW | Hub/STW | portato | Q-CONT usa `indirizzo` jsonb (struttura diversa). |
| Azienda — email | `c.email` | Hub/STW/Sales | Hub/STW/Sales | portato | Nomi diversi (`email` vs `email_principale`). |
| Azienda — PEC | `c.pec` | Hub + STW | Hub/STW | portato | Sales e Q-CONT non hanno PEC. |
| Azienda — telefono | `c.phone` | Hub/STW/Sales | Hub/STW/Sales | portato | — |
| Azienda — sito web | `c.website` | `hub.aziende.sito_web` | Hub | portato | Manca in STW, Sales, Q-CONT. |
| Azienda — codice SDI | `c.sdi` | Hub + Q-CONT | Hub/Q-CONT | portato | Due case per lo stesso dato. |
| Azienda — n. dipendenti | `c.number_of_employees` | `hub.aziende.n_dipendenti` | Hub | portato | Manca altrove. |
| Azienda — codici ATECO | `c.codici_ateco` | Hub + Sales (`settore_ateco`) | Hub/Sales | divergente-voluto | Sales usa testo libero, non i codici strutturati. |
| Azienda — settore EA | `c.sector_ea` | `hub.aziende.settore_ea` — **VUOTO** | Hub | **mancante** | Il sync lo legge ma scrive null. Audit 13/06: vuoto al 100%. |
| Azienda — referente | `c.responsible*` | `hub.aziende.referente*` | Hub | portato | Manca in STW, Sales, Q-CONT. |
| Azienda — classe dimensionale | `classe_dimensionale` | — | — | **mancante** | Quasi sempre null in Qnet (1/18.284). Non portata. |
| Azienda — fonte (passaparola/web) | `source_id` | — | — | **mancante** | È un ID numerico non risolto: il valore testo non arriva. |
| Azienda — gestore interno / supervisore | `assigned_id` / `assigned_id_2` | — | — | **mancante** | Campi CRM chiave della Scheda Qnet, non portati. |
| Azienda — commerciale assegnato | `agent` | — | — | **mancante** | Tab Info Qnet ha "Commerciale", non portato. |
| Azienda — stato convenzione | Scheda Tab Info | — | — | **da-verificare** | Visibile a video ma non nei campi API documentati. |
| Azienda — indirizzi aggiuntivi (N) | Sezione "Indirizzi Aggiuntivi" | — | — | **mancante** | Nessuna tabella satellite; portato solo l'indirizzo principale. |
| Azienda — attività legate | Tab Attività | — | — | **mancante** | Q-WORK ha task ma non legati ad `hub.aziende`. |
| Azienda — storico audit | Sezione Storico | `hub.audit_log*` | Hub | **da-verificare** | Tabelle audit esistono ma non è chiaro se tracciano le aziende. |
| Azienda — certificazioni ISO clienti | Sezione ISO | — | — | **mancante** | La WeA ISO gestisce le NOSTRE, non quelle dei clienti. |
| Azienda — attestazioni SOA clienti | Sezione SOA | — | — | **mancante** | Come ISO. |
| Azienda — flag fornitore | `is_supplier` | `hub.aziende.is_fornitore` + Q-CONT | Hub/Q-CONT | divergente-voluto | Il sync NON scrive il flag: 1/18.268 a true. |
| Azienda — flag cliente | — (tutti clienti) | `qcont.anagrafica.is_cliente`; **Hub: colonna assente** | Q-CONT | divergente-voluto | La LEGGE 3-anagrafiche prevede il tag su Hub, non aggiunto. |
| Azienda — flag partner | — | Q-CONT `is_partner` (56); **Hub: assente**; Sales tabella `partner` separata | Q-CONT/Sales | **mancante** | Sales viola la regola no-tabelle-nuove. |
| Mirror 1 — STW `anagrafica_clienti` | `/customers` | 18.310 righe + `meta` jsonb | STW | portato | Sync cron 02:00. Nessun campo CRM strutturato. |
| Mirror 2 — Hub `aziende` | `/customers` | 18.268 righe | Hub | portato | Fonte canonica designata. Manca `is_cliente`, `is_partner`, `settore_ea`. |
| Mirror 3 — Sales `anagrafica_cliente` | `/customers` | 17.621 (513 persone) | Sales | portato | Sync indipendente. Manca SDI, PEC, sito web. |
| Mirror 4 — Q-CONT `anagrafica` | — | 65 righe (2 cli + 64 forn + 56 part) | Q-CONT | divergente-voluto | NON è mirror Qnet: aziende gestite attivamente, campi contabili. |
| Q-CONT → Hub (aggancio) | — | `qcont.anagrafica.azienda_hub_id` — **1/65** | Q-CONT | **mancante** | 64 aziende non agganciate all'Hub. |
| Contatto — ID Qnet | `/contacts → id` | `hub.contatti.qnet_id` (14.086) | Hub | portato | Sales.contatto: solo 4 righe (quasi vuota). |
| Contatto — nome/cognome | `first_name`/`last_name` | `hub.contatti.nome`/`cognome` | Hub | portato | Fallback su email se vuoti. |
| Contatto — ruolo/tipo | `type` | `hub.contatti.ruolo` | Hub | portato | — |
| Contatto — email | `email` | `hub.contatti.email` | Hub | portato | Email `@qualificagroup.*` saltate (sono dipendenti → Utenti). |
| Contatto — telefono/cellulare | `phone`/`mobile` | `hub.contatti.telefono`/`cellulare` | Hub | portato | — |
| Contatto — azienda collegata | `companies[]` (N) | `hub.contatti.azienda_qnet_id` (solo prima, 2.219) | Hub | divergente-voluto | La relazione N:N non è portata, nessuna FK reale. |
| Contatto — principale (flag) | — | `hub.contatti.principale` | Hub | **da-verificare** | Campo esiste ma il sync non lo imposta. |
| Contatto — tags Qnet | `tags[]` | — | — | **mancante** | Classificazioni non portate. |
| Contatto — agente provvigioni | (Contatto Commerciale) | `qcont.agente_commerciale` (55) | Q-CONT | divergente-voluto | Entità parallela a `hub.contatti`, nessuna FK reale tra DB. |
| Utente — ID auth | `/auth/me → user.id` (int) | `hub.utenti.id` (UUID) | Hub | divergente-voluto | Mapping via `hr.dipendenti.qnet_user_id`. |
| Utente — email | `user.email` | Hub + HR | Hub/HR | portato | 176 utenti Hub, 161 dip. HR. |
| Utente — nome/cognome | QnetUserRef | Hub + HR | Hub/HR | portato | — |
| Utente — ruolo sistema | `roles[].name` | Hub + Sales + HR (3 enum diversi) | Hub/Sales/HR | divergente-voluto | Tre sistemi di ruolo non sincronizzati. |
| Utente — BU/funzione | `bu_qnet` (mirror vuoto) | `hub.utenti.fa_codice` + HR | Hub/HR | portato | Collegamento Qnet→BU da verificare (dump perso). |
| Utente — link a Qnet | `user.id` | `hr.dipendenti.qnet_user_id` — **38/161** | HR/Hub | **mancante** | Mappa inversa rotta per il 76% dei dipendenti. |
| Utente — scheda HR completa | `/users` (dump perso) | `hr.dipendenti` (161, 90+ col) | HR | portato | Fonte canonica dati di lavoro. |
| Utente — locali Sales | — | `sales.utenti` (139) | Sales | divergente-voluto | Copia propria per permessi commerciali. |
| Utente — locali Q-CONT | — | `qcont.utenti` (7) | Q-CONT | divergente-voluto | Nessuna FK a Hub, sync per email. |
| Utente — `qnet_mirror_users` | `/users` | **0 righe** | Hub | **mancante** | Mai popolato: impossibile risolvere `qnet_user_id` → persona. |
| Anagrafica — `qnet_mirror_anagrafica` | `/customers` | **0 righe** | Hub | **mancante** | Tabella ridondante e vuota; il dato vive in `hub.aziende`. |
| Contatto — relazione N:N azienda-contatto | `companies[]` con ruolo | solo `companies[0]` testo | Hub | **mancante** | Nessuna tabella di giunzione contatto-azienda. |
| Azienda — relazioni tra aziende | — | `sales.anagrafica_collegata` | Sales | portato | Giunzione capogruppo-controllata, solo Sales. |
| Contatto — link a dipendente HR | — | `sales.contatto.dipendente_hr_id` | Sales | portato | Meccanismo Sales-specifico. |

> **🔴 Gap critici del blocco — Anagrafiche**
> 1. **Hub senza flag `is_cliente`/`is_partner`** — la LEGGE 3-anagrafiche li vuole su Hub (fonte unica), ma c'è solo `is_fornitore` e il sync non lo imposta (1/18.268). Sales viola la regola con tabella `partner` separata.
> 2. **Q-CONT scollegato dall'Hub** — `azienda_hub_id` valorizzato su 1/65. L'interconnessione promessa è rotta.
> 3. **`qnet_mirror_users` vuoto** — impossibile collegare automaticamente utente Qnet → persona Hub per il 76% dei dipendenti.
> 4. **`qnet_mirror_anagrafica` vuoto** — tabella ridondante e inutilizzata: decidere se popolarla o eliminarla.
> 5. **Tre mirror indipendenti di `/customers`** (STW + Hub + Sales) con sync separati: viola la regola 1-fonte.
> 6. **`settore_ea` sempre vuoto** in Hub nonostante il codice lo legga: gap di qualità dati.
> 7. **Campi CRM Qnet non portati** (gestore interno, supervisore commerciale, agente, fonte, classe dimensionale) nonostante la LEGGE 100%-Qnet.
> 8. **`agente_commerciale` (55) e `contatti` (14.113) paralleli** senza FK: chi riceve provvigioni vive in due posti.
> 9. **Relazione N:N azienda-contatto con ruolo assente**: Hub porta solo la prima azienda come testo.

---

## 2. Commesse — Qnet `/orders` → `commesse` (STW)

Verificato live 27/06: **14.903 righe**, ultimo sync 26/06 23:01, **95 colonne**. La chiave `bu` del sync diventa `fa_codice` nella PK reale. I campi della "sezione C" del vecchio reference sono stati aggiunti ma molti restano a bassa copertura perché il sync scrive solo se il valore non è null.

| Concetto | Qnet | Workspace | DB | Stato | Note |
|---|---|---|---|---|---|
| ID commessa | `orders.id` | `commesse.id` (text) | STW | portato | PK composta `(fa_codice, id)`. |
| BU / Funzione (partizione) | iniettato dal sync | `commesse.fa_codice` | STW | divergente-voluto | NON arriva da Qnet. `business_unit_id` Qnet NON scritto. |
| Titolo | `title` | `commesse.titolo` | STW | portato | 100%. |
| Stato macro | `status_label` | `status` + `stato_lav` | STW | divergente-voluto | **BUG**: i due campi hanno lo stesso valore. |
| Stato consulenza | `stato_consulenza_label` | `stato_consulenza` | STW | portato | — |
| Tipo commessa | `tipo_commessa` | `tipo_commessa` (14.102) | STW | portato | Era gap critico 19/06, ora risolto. |
| Sede operativa | `sede_operativa` | `sede_op` (14.102) | STW | portato | Era gap 19/06, risolto. Diversa da `sede` e `filiale_nome`. |
| Cliente (testo) | `customer_name` | `cliente` | STW | portato | 100%, solo testo. |
| Cliente ID | `customer_id` | `cliente_id` (14.799) | STW | portato | Era gap 19/06. Non è FK verso anagrafica Workspace. |
| Società fatturante | `societa_aziendale` | `societa` | STW | portato | — |
| Contratto ID | `contratto_id` | `id_contratto` (14.102) | STW | portato | Era gap 19/06. Join con `offerte.id`. |
| Responsabile | `responsabile` | `responsabile` + `_norm` | STW | portato | — |
| Agente | `agent_name` | `agente` + `_norm` | STW | portato | 0% per FOR. |
| Segnalatore | `signaler_name` | `segnalatore` + `_norm` | STW | portato | 0% per FOR. |
| Funzione (label) | `funzione_aziendale` | `funzione` | STW | portato | `fa_codice` è la versione codificata. |
| Regione | `regione` | `regione` | STW | divergente-voluto | **Bug virgola**: per incassi si usa `gia_incassato`. |
| Data inizio | `start_dt` (68%) | `data_inizio` | STW | divergente-voluto | Fallback su `datestart`. |
| Data fine | `end_dt` (68%) | `data_fine` | STW | portato | — |
| Data assegnazione | `date_assigned` | `data_assegnazione` | STW | portato | Era gap 19/06. |
| Data pianificata inizio | — | `data_pian_inizio` — sempre null | STW | **mancante** | Fonte non identificata (dump perso). |
| Avanzamento % | `avanzamento_percentuale` | `avanzamento` (100%) | STW | portato | — |
| Avanzamento testo | `avanzamento_commessa` | `avanzamento_raw` | STW | portato | — |
| Ricavi / Costi / MOL stimati | `ricavi/costi/mol_stimati` | `ricavi`/`costi`/`mol` (100%) | STW | portato | `mol` = 1° CM, ≠ `mol_qualifica`. |
| MOL effettivo | `mol_effettivo` | `mol_effettivo` (116) | STW | portato | Copertura DB molto bassa. |
| Consulenza / Documentale | `importo_consulenza`, `*_documentali` | `consulenza`, `*_docum` | STW | portato | — |
| EC consolidati | — (calcolo) | `ec_ricavi/mol/costi_cons` | STW | divergente-voluto | Calcolati a valle, non dal sync. |
| Già incassato | `gia_incassato` | `gia_incassato` | STW | **mancante** | Sync NON la scrive (rischio sovrascrivere dato manuale). |
| Da incassare | `da_incassare` | `da_incassare` | STW | **mancante** | Stessa precauzione. |
| Totali finanziari | `fin_delta/incassi/uscite_tot` | omonimi | STW | portato | Erano gap 19/06. Copertura quasi nulla. |
| Stato pagamento (semaforo) | `euro_status` (97%) | `euro_status` (116) | STW | portato | Bassa copertura DB. |
| Stato pagamento Qnet | `stato_pagamento` | `stato_pagamento_qnet` (7.561) | STW | **da-verificare** | Natura del campo ignota (dump perso). |
| Stato pagamento (legacy) | — | `stato_pagamento` | STW | **da-verificare** | Non scritto dal sync; forse obsoleto. |
| Link Qnet | `link` | `qnet_link` | STW | portato | Fallback generato se null. |
| Ultima nota / data | `ultima_nota` | omonimi | STW | portato | — |
| Recall date | `recall_date` | `recall_date` (text!) | STW | divergente-voluto | Colonna è text, non date. |
| Ore totali corso | `total_hours` (69%) | `ore_totali` (111) | STW | portato | Copertura DB anomala bassa. |
| Numero discenti | `numero_discenti` (46%) | `numero_discenti` (7) | STW | portato | Copertura DB anomala (7). |
| Classe/edizione | `classe_title` (69%) | `classe_title` (111) | STW | portato | Probabilmente solo FOR/GOL. |
| Codice commessa Regione | `codice` | `codice_commessa` | STW | portato | Copertura non misurata. |
| Stato classe / corso | `stato_classe`/`stato_corso` | omonimi (73/74) | STW | portato | Bassa copertura. |
| Data esame | `data_esame` (15%) | `data_esame` | STW | portato | — |
| Decreti (saldo/anticipo/ente/regione) | vari campi `*_da_decreto` | omonimi | STW | portato | Erano gap 19/06; copertura bassa salvo `importo_ente`. |
| Decreti (ID/date richieste) | 8 campi Qnet | 8 colonne omonime | STW | portato | Blocco aggiunto dopo 19/06. |
| Scheda: Bilancio Preventivato | `offerte.meta` + righe costo (dump perso) | — | STW | **mancante** | Serve tabella `commessa_prodotto`/`commessa_costo` (non create). |
| Scheda: righe costo dettaglio | `/students → dettaglio_costi` | — | STW | **mancante** | Solo totali flat nel DB. |
| Sede aziendale (filiale) | — | `filiale_nome` (13.991) | STW | divergente-voluto | Processo separato. SEDE = FILIALE (57 sedi HR). |
| Linea / Categoria | — | `linea` (80) / `categoria` (1.513) | STW | divergente-voluto | Dimensioni interne, non Qnet. |
| Contatto offerta | `offerte.meta` | `contatto_offerta` + `_norm` | STW | divergente-voluto | Via join offerte, non dal sync orders. |
| GA1-GA4 | `/students → assigned*_to` | `ga1..ga4_nome` | STW | divergente-voluto | Via UI coordinatori, non sync orders. |
| Note interne WeA | — (null per FOR) | `note` (da `commessa_note`) | STW | divergente-voluto | Universi separati. |
| Flag presente in Qnet | — | `presente_in_qnet` | STW | divergente-voluto | Concetto solo-Workspace. |
| Timestamp sync | — | `synced_at` + `imported_at` | STW | divergente-voluto | Metadati operativi. |
| Indirizzo | `site_address` (0.2%) | `indirizzo` — mai popolato | STW | **mancante** | Copertura Qnet quasi nulla. |
| ERP link | — | `erp_link` — mai popolato | STW | scartato-apposta | Legacy. |
| Meta JSONB grezzo | — (tutti i campi) | `commesse.meta` — **vuoto** | STW | **mancante** | Mai scritto: ogni campo non mappato è perso. |
| `business_unit_id` | `business_unit_id` (100%) | — | STW | **mancante** | Nessuna colonna. |
| `edition_id` | `edition_id` (69%) | — | STW | **mancante** | Nessuna colonna. |
| `contact_id` | `contact_id` (0% FOR) | — | STW | scartato-apposta | Sempre null per FOR. |
| Sede grezzo | `orders.sede` (dump perso) | `sede` + `_norm` | STW | **da-verificare** | Colonne esistono ma non scritte dal sync attuale. |

> **🔴 Gap critici del blocco — Commesse**
> 1. **`meta` JSONB mai scritto**: il record grezzo Qnet non viene salvato. Ogni campo non mappato in colonna è perso per sempre.
> 2. **`gia_incassato`/`da_incassare`**: scelta deliberata di non copiarli, ma non è chiara la fonte canonica del "già incassato" (Qnet? manuale? chi vince?).
> 3. **Righe-costo dettagliate assenti**: solo totali flat. Per Prospetto Partner e Bilancio Preventivato serve `commessa_costo` mai creata.
> 4. **`business_unit_id` (100% Qnet) assente**: impedisce join con tabelle BU-master Qnet senza passare per `fa_codice` (codice interno).
> 5. **`edition_id` (69%) assente**: limita il collegamento a edizioni/classi Qnet.
> 6. **`status`/`stato_lav` duplicato**: stesso campo in due colonne, una ridondante.
> 7. **`sede`/`sede_norm`**: colonne presenti ma non scritte; fonte sconosciuta.
> 8. **Copertura anomala campi FOR** (`ore_totali` 111, `numero_discenti` 7…): da verificare che il sync FOR li riceva davvero.
> 9. **`data_pian_inizio` sempre null**: nessuna fonte identificata.
> 10. **Bilancio Preventivato interamente mancante**: richiede endpoint dedicato da Ciro.

---

## 3. Discenti — Qnet `/orders/{id}/students` + `/opportunities/formazione` → STW, FOR, Q-CONT, Sales

Righe al 27/06: **STW.discenti = 10.833** · **Q-CONT.discente_commessa = 8.030** · FOR.discente da verificare.

| Concetto | Qnet | Workspace | DB | Stato | Note |
|---|---|---|---|---|---|
| ID discente / Formalab | `discenti[].id = formalab_id` | `STW.discenti.id` · Q-CONT `qnet_studente_id` | STW/Q-CONT | portato | Q-CONT copertura parziale (8.030/10.833). |
| Commessa (order_id) | `discenti[].order_id` | `STW.discenti.order_id` · Q-CONT `commessa_codice_esterno` | STW/Q-CONT | portato | Join cross-DB via `commessa_sync.qnet_order_id`. |
| Codice fiscale | `codice_fiscale` | STW · Q-CONT · FOR | tutti | portato | Chiave di incrocio principale. Spesso null senza iter GOL. |
| Anagrafica (nome) | `cognome/nome/full_name` | STW · Q-CONT `nome_cognome` · FOR | tutti | portato | Tre copie, nessuna FK comune. |
| Email / telefono | `email/telefono` | STW · Q-CONT · FOR | tutti | portato | Tre copie non sincronizzate. |
| Data iscrizione | `data_iscrizione` (spesso null) | STW · Q-CONT · FOR | tutti | portato | Valori possono divergere. |
| Ore previste | `ore_previste` | STW · Q-CONT · FOR (su classe) | tutti | portato | In FOR vive sulla classe. |
| Ore frequentate | `ore_frequentate` + `_decimali` | STW (testo+dec) · Q-CONT (dec) · FOR | tutti | portato | STW tiene entrambe le forme. |
| Ore assenze | `ore_assenze` + `_decimali` | STW · Q-CONT · FOR | tutti | portato | Come sopra. |
| Esito | `esito` + `corso_superato` | STW (testo+bool) · Q-CONT (enum) · FOR (bool) | tutti | divergente-voluto | Tipi diversi per design. |
| Costo discente (ODA) | `importo_oda` | STW · Q-CONT · FOR | tutti | portato | La "notula" del discente. |
| Ricavo orario reale | `ricavo_h_reale` | STW · FOR | STW/FOR | portato | Q-CONT usa nome diverso (`r_h_conoscente`). |
| Ore considerate ricavo | `ricavo_h_considerate` | STW · FOR | STW/FOR | portato | Q-CONT: nome criptico da verificare. |
| Ricavo totale | `ricavo_totale` | STW · Q-CONT `r_tot` · FOR | tutti | portato | Nomi divergono, concetto identico. |
| GA1 (Tutor) | `assigned_to` | STW `ga1_nome` (testo) · Sales `ga1_id` | STW/Sales | portato | ID solo in Sales; STW solo nome (7.025). |
| GA2 (Operatore) | `assigned2_to` | STW `ga2_nome` · Sales `ga2_id` | STW/Sales | portato | Solo nome in STW (5.223). |
| GA3 (Partner) | `assigned3_to` | STW `ga3_nome` (4.836) · Sales `ga3_id` | STW/Sales | portato | **Fonte di verità del partner** (CEO 11/06). |
| GA4 (Segnalatore) | `assigned4_to` | STW `ga4_nome` (1.098) · Sales `ga4_id` | STW/Sales | portato | Bassa copertura. |
| Agente commerciale ID | `discenti[].agente_commerciale_id` | STW (int) · Q-CONT (uuid) | STW/Q-CONT | divergente-voluto | Tipi incompatibili, non la stessa FK. |
| Partner (nome testo) | `partner_commerciale` | STW (5.564) · FOR | STW/FOR | portato | Spesso diverge da GA3. Sync notturno lo sovrascrive. |
| Partner ID (FK) | `opportunita.meta…partner_commerciale_id` | STW (text, 1.100) · FOR (uuid) | STW/FOR | portato | Due anagrafiche diverse, no FK unica. |
| % provvigione partner | `partner_pct_provvigione` | STW · FOR · Q-CONT (suggerita+confermata) | tutti | divergente-voluto | Q-CONT più ricco (doppio step). |
| Importo provvigione | `partner_importo_provvigione` | STW (1.156) · FOR · Q-CONT (1.150) | tutti | portato | Ponte PR #1047: €1.665.539 bridgati. Bridge una-tantum. |
| Notula riferimento | `notula_ref` (spesso null) | FOR `notule_partner` · Q-CONT tabella · STW: assente | FOR/Q-CONT | **mancante** | STW non ha colonna notula. Gap operativo ODA→pagamento. |
| Tot. provvigioni (commessa) | `riepilogo_costi.totale_provvigioni_partner` | STW · FOR (view) | STW/FOR | portato | — |
| MOL Qualifica | `riepilogo_costi.mol_qualifica` | `STW.commessa_riepilogo_costi.mol_qualifica` | STW | portato | Campo sintetico chiave. |
| Valore discente | — | `utile_per_discente` | STW | portato | Formula CEO 12/06 (MOL/superati). Solo STW. |
| N. discenti totali/superati | `num_discenti_totali/superati` | STW | STW | portato | FOR: view solo totali. |
| Tariffa costo/ricavo orario | `riepilogo_costi.tariffa_*` | STW (aggregato) · FOR (per-discente) | STW/FOR | portato | Di solito 1,00 €/h. |
| Ricavi discenti / servizi | `riepilogo_costi.ricavi_*` | STW · FOR | STW/FOR | portato | Nomi divergono. |
| Opportunità ID | `/opportunities/formazione → opportunity_id` | STW `opportunita_id` (7.249) | STW | portato | Backfill per CF. 3.584 non agganciati. |
| Stato opportunità | `opportunita.meta…stato_nome` | STW `stato_opportunita` | STW | portato | ~6.592 "Associato". Non aggiornato dal sync. |
| Fonte preliminary | `opportunita.meta…fonte` | STW `fonte_preliminary` (6.923) | STW | portato | LIVELLO 2 (testo a mano). `fonte` legacy da ignorare. |
| Operatore nome | `opportunita.meta.operatori` | STW `operatore_nome` | STW | portato | Da opportunità, non da `/students`. |
| Segnalatore (Livello 1) | `opportunita.meta.segnalatore` | STW `segnalatore` (162) | STW | portato | Copertura bassissima. |
| Lineage Opp→Formalab→Commessa | catena Qnet | STW + FOR `classe` | STW/FOR | portato | Triangolo chiuso. |
| Mappa sede→partner GOL | — | nessuna tabella dedicata | STW | **mancante** | Vive solo in documentazione (mappa CEO 15/06). |
| Override partner manuale | — | — | — | **mancante** | `discente_origine_gol.partner_manuale` non esiste in nessun DB. |
| Incasso Regione (anticipo+saldo) | `riepilogo_costi.regione.*` (bug virgola) | STW `reg_*` · Q-CONT `decreto_regione` · FOR `classe` | tutti | portato | FASE 1 manuale (Sara). Toggle FASE1/2 non implementato. |
| Decreti Regione (n./data) | `opportunita.meta.discenti[0]` | Q-CONT + FOR `decreto_regione` · STW `reg_*` | Q-CONT/FOR | portato | Due tabelle distinte non sincronizzate. |
| Voucher SILF | da-verificare | FOR `voucher_silf` | FOR | **da-verificare** | Forse solo-Workspace (GOL Campania). |
| Iscrizione classe (FOR) | Formalab (no API diretta) | FOR `classe_iscrizione` | FOR | portato | Modello più completo dei tre DB. |
| Classe (corso-edizione) | commessa + Formalab edition | FOR `classe` · STW (col. orfane) | FOR/STW | divergente-voluto | La classe vive in FOR, STW ha solo la commessa. |
| Dettaglio costi per tipo | `riepilogo_costi.dettaglio_costi[]` | STW (solo aggregato) · FOR `docente_oda` · Q-CONT | tutti | **mancante** | Righe per docente non in STW. Gap riconciliazione costi. |
| Provvigione calcolata (mensile) | — | Q-CONT `provvigione_calcolata` | Q-CONT | portato | Solo Workspace. A 26/06 wallet €0 (campi vuoti). |
| Regole provvigione | — | Q-CONT `regola_provvigione_partner` (0 righe) | Q-CONT | portato | Non ancora caricate. |
| Partner_discente | — | Q-CONT `partner_discente` (0 righe) | Q-CONT | portato | Non in uso. Dato vivo in STW. |
| MOL effettivo Qnet | `/orders → mol_effettivo` (100%) | Q-CONT `commessa_sync.qnet_mol_effettivo` · STW: assente | Q-CONT | **mancante** | STW non sincronizza; cerotto in Q-CONT. |
| Lookup ID→nome GA | `/users/{id}` | Sales `qnet_ga_nome` (140) + `opp_ga_risolto` | Sales | portato | Backfill 12/06. 1 ID utente cancellato. |
| Lead GOL pre-discenti | opportunità pre-"Associato" | — | Sales | **mancante** | `opportunita_for_gol` (13.146) non trovata nel DB. |
| Codice presentazione / CPI | `opportunita.meta.discenti[0]` | STW `opportunita_for.meta` (jsonb) | STW | **mancante** | Non estratto in colonne. Rilevante per rendicontazione. |
| Decreti per-discente (date) | `opportunita.meta.discenti[0]` | jsonb · FOR/Q-CONT (a livello classe) | STW/FOR/Q-CONT | **mancante** | Non estratti per-persona. Gap verifica pagamento individuale. |

> **🔴 Gap critici del blocco — Discenti**
> 1. **Override partner manuale assente**: `discente_origine_gol.partner_manuale` (citato in memoria) non esiste in nessun DB. La mappa SEDE→PARTNER fuori Campania vive solo nella documentazione.
> 2. **Dettaglio costi per tipo**: il `dettaglio_costi[]` Qnet (docenti/piattaforma/commissione per riga) non ha casa in STW. Gap critico per riconciliazione costi docenti vs ODA.
> 3. **`opportunita_for_gol` non trovata** nel DB Sales (query vuota): indagare prima di costruirci sopra.
> 4. **FK anagrafica unica partner mancante**: STW (text), FOR (uuid), Q-CONT (uuid) — tre anagrafiche separate. Il wallet partner non vede le provvigioni STW senza bridge.
> 5. **Bridge provvigioni una-tantum**: manca il cron. I 1.156 discenti non si aggiornano in automatico in Q-CONT.
> 6. **GA1-4 senza ID in STW**: solo nomi testo. La risoluzione inversa per scrittura su Qnet non è possibile.
> 7. **Nessuna colonna notula sul discente STW**: il flusso "discente emette notula → Qualifica paga ODA" non è tracciabile.
> 8. **Codice presentazione / CPI non estratti** da `opportunita_for.meta`: bloccano l'automazione della rendicontazione GOL.

---

## 4. Contabilità Attiva — Q-CONT (proforma, fatture, decreti, incassi)

| Concetto | Qnet | Workspace | DB | Stato | Note |
|---|---|---|---|---|---|
| Registro richieste proforma | `/listrequestproforma` (dump perso) | — | Q-CONT | **mancante** | La pre-emissione non è modellata. |
| Proforma — testata | `/orders/{id}/proforma` | `qcont.proforma` | Q-CONT | portato | **0 record** al 27/06. **BUG**: codice POST inserisce `bu_codice` inesistente. |
| Proforma — Unità Aziendale | "Unità Aziendale" Qnet (Sede) | `proforma.fa_codice` (BU) | Q-CONT | divergente-voluto | La sede emittente non è catturata. |
| Proforma — pagamento/banca/IBAN | builder Qnet | — | Q-CONT | **mancante** | Non modellati. |
| Proforma — righe servizio | servizi + righe libere | — | Q-CONT | **mancante** | Solo testata (importo aggregato). |
| Proforma — numero/data interna | builder Qnet | `numero`/`numero_visualizzato` | Q-CONT | portato | Via RPC `next_numero_proforma`. |
| Proforma — scadenze (multi-rata) | N scadenze | `data_scadenza` (singola) | Q-CONT | divergente-voluto | Multi-rata solo per ISO. |
| Elenco — Incassato/Residuo | `/listproforma` | — | Q-CONT | **mancante** | L'incassato sulla proforma non è tracciato. |
| Elenco — filtro per BU/Sede | filtri Qnet | `fa_codice` | Q-CONT | portato | Filtro BU sì, Sede no. |
| Fattura Attiva — testata | (dump perso) | `qcont.fattura_attiva` | Q-CONT | portato | **1 record**. **BUG** `bu_codice` come proforma. |
| FA — stato ciclo | (dump perso) | `stato` enum | Q-CONT | **da-verificare** | Incasso parziale gestito. |
| FA — sezionale/registro IVA | (dump perso) | `sezionale_codice` + tabella `sezionale` | Q-CONT | **da-verificare** | Split payment/reverse charge presenti. |
| FA — aliquota IVA / esigibilità | builder Qnet | `iva_categoria` + `esigibilita_differita` | Q-CONT | portato | Una sola IVA per testata (non per riga). |
| FA — verifica corrispondenza | — | campi `verifica_*` | Q-CONT | scartato-apposta | Processo interno. |
| FA — sync verso CdG | — | `sync_cdg_*` | Q-CONT | scartato-apposta | Solo Workspace. |
| Scadenzario | `/scadenze` (multi-scadenza) | `data_scadenza_incasso` + `importo_incassato` | Q-CONT | divergente-voluto | No tabella scadenza separata (solo ISO). |
| Incasso — chiusura scadenza | chiusura Qnet | `movimento_bancario.fa_id` | Q-CONT | portato | **0 movimenti** al 27/06 (FASE 2 non avviata). |
| Incasso — upload EC | — | `qcont.upload_movimenti` | Q-CONT | scartato-apposta | Meccanismo FASE 2. |
| Incasso — regole matching | — | `regola_matching_movimento` | Q-CONT | scartato-apposta | Solo Workspace. |
| Conto bancario | dropdown builder | `qcont.conto_bancario` | Q-CONT | portato | Più ricco (saldi, categorie). |
| Solleciti pagamento | (dump perso) | `qcont.sollecito` + template | Q-CONT | scartato-apposta | **0 solleciti**. Tracciamento M365. |
| Decreto Regione — testata | campi `*_da_decreto` su `/orders` | `qcont.decreto_regione` | Q-CONT | portato | **296 record** (Sara, FASE 1). Modello Campania-centrico. |
| Decreto — tipo evento regionale | `totRicevutoRegione` (LOM)… | `tipologia` enum (no `regione`) | Q-CONT | **mancante** | Mancano specificità LOM/LAZ/ABR. |
| Decreto — FASE 1 vs FASE 2 | `gia_incassato` (manuale) | `importo_accreditato_effettivo` + toggle | Q-CONT | divergente-voluto | Non sovrascrivere nel sync. |
| Decreto — ID richiesta | `anticipo/saldo_id_richiesta` | `id_richiesta` (text) | Q-CONT | portato | Ancora universale CAM. |
| Incasso Fonte Sede (toggle) | — | `qcont.incasso_fonte_sede` | Q-CONT | scartato-apposta | Toggle richiesto da Enrico 08/06. |
| `gia_incassato` su commessa | `/orders → gia_incassato` (23%) | `STW.commesse.gia_incassato` (non scritto) | STW | **mancante** | Fonte canonica = `decreto_regione`. |
| `da_incassare` | `/orders → da_incassare` | non scritto | STW | **mancante** | Stesso gap. |
| `saldo/anticipo_euro_da_decreto` | `/orders` (44%/7%) | — | STW | **mancante** | Nessuna colonna. |
| `totale_ricevuto_regione` | `/orders` (17%) | — | STW | **mancante** | Calcolabile da Q-CONT. |
| `euro_status` | `/orders` (97%) | — | STW | **mancante** | Semaforo non sincronizzato. |
| `fin_*_tot` | `/orders` (4%) | colonne presenti, non scritte | STW | **mancante** | Bassa priorità. |
| Avanzamento commessa | `avanzamento_percentuale` (100%) | STW `avanzamento` · Q-CONT `avanzamento_commessa` (0) | STW/Q-CONT | divergente-voluto | Q-CONT = registro storico mensile (non alimentato). |
| Voce ricavo commessa | — | `qcont.voce_ricavo_commessa` (579) | Q-CONT | scartato-apposta | Solo Workspace. |
| Commessa mirror Q-CONT | `/orders` | `qcont.commessa_sync` (579) | Q-CONT | portato | Cerotto per join locali. Fonte = STW. |
| Anagrafica cliente | `/customers` | `qcont.anagrafica` | Q-CONT | portato | Unificata cliente/partner/fornitore. |
| Notula collaboratore | ciclo passivo (dump perso) | `qcont.notula_collaboratore` + `richiesta_notula` | Q-CONT | portato | **0 record**. Token portale esterno. |
| RDA | area Acquisti Qnet | `qcont.rda` | Q-CONT | **da-verificare** | Workflow approvazione completo. |
| ODA | area Acquisti / `/invoices/passive` | `qcont.oda` | Q-CONT | **da-verificare** | Struttura completa, campi non confrontabili. |
| Fattura Passiva | `/invoices/passive` | `qcont.fattura_passiva` | Q-CONT | **da-verificare** | `fonte_ricezione qnet_bridge` suggerisce integrazione. |
| Anticipo fornitore | (dump perso) | `qcont.fp_anticipo` | Q-CONT | **da-verificare** | Compensazione con FP a saldo. |
| Lista bonifici | — | `qcont.lista_bonifici` + righe | Q-CONT | scartato-apposta | Workflow doppia firma. |
| Discente commessa (mirror) | `/orders/{id}/students` | `qcont.discente_commessa` | Q-CONT | portato | Per calcoli provvigione. Fonte = STW. |
| Ricavo corso rendicontazione | — | `qcont.ricavo_corso_rendicontazione` | Q-CONT | scartato-apposta | Cogestione Campania-centrica. |
| Solleciti ISO | — | `scadenza_contabile_iso` + correlate | Q-CONT | scartato-apposta | Solo-Workspace, BU specifica. |
| Proforma → commessa | collegamento Qnet | `commessa_codice_esterno` (text) | Q-CONT | portato | No FK UUID, rischio orphan. |
| Elenco — tab Proforma/Fattura | unico elenco con tab | tabelle separate | Q-CONT | divergente-voluto | Scelta architetturale. |
| FA — offerta collegata | da commessa/offerta | `offerta_codice_esterno` (text) | Q-CONT | portato | No FK verso STW. |
| FA — data competenza | (dump perso) | `data_competenza` | Q-CONT | scartato-apposta | Contabilità per competenza. |

> **🔴 Gap critici del blocco — Contabilità Attiva**
> 1. **Proforma senza righe servizio**: solo testata. In Qnet le righe esistono. Gap per fatturazione analitica.
> 2. **Proforma senza Incassato/Residuo**: non replicabile l'elenco Qnet.
> 3. **Proforma senza pagamento/banca**.
> 4. **Proforma a 0 record**: l'emissione avviene ancora in Qnet.
> 5. **Scadenzario multi-rata mancante** per la FA generica (solo ISO).
> 6. **BUG codice**: POST fatture/proforma inserisce `bu_codice` inesistente (colonna è `fa_codice`).
> 7. **Decreto senza tipo evento regionale**: modello Campania-centrico, mancano LOM/LAZ/ABR.
> 8. **Campi finanziari Qnet non nel mirror STW** (`gia_incassato`, `da_incassare`, `totale_ricevuto_regione`, `*_da_decreto`): il sync li salta.
> 9. **FASE 2 banca non avviata**: 0 movimenti bancari. Trigger FASE 1→2 non definito.
> 10. **Richiesta proforma (pre-emissione) mancante**.
> 11. **API Qnet mancanti** (`/invoices/active`, `/scadenze`, `/incassi`): il Workspace è fonte primaria per tutto il ciclo attivo.

---

## 5. Contabilità Passiva — Q-CONT (RDA, ODA, fatture passive, bonifici, provvigioni)

| Concetto | Qnet | Workspace | DB | Stato | Note |
|---|---|---|---|---|---|
| RDA — testata | area Acquisti (dump perso) | `qcont.rda` (**0 righe**) | Q-CONT | **da-verificare** | Campi `origine`/`intervento_id` solo-Workspace. |
| ODA — testata | area Acquisti / `/invoices/passive` | `qcont.oda` (**0 righe**) | Q-CONT | **da-verificare** | Workflow multi-stadio (rispondenza→CFO→definitivo). |
| FTP — fattura passiva | `amministrazione_pagamenti*` (dump perso) | `qcont.fattura_passiva` (**1 riga**) | Q-CONT | **da-verificare** | SDI, sync CdG, `bef_id`. |
| Notula collaboratore | `notula_ref` su `/students` | `qcont.notula_collaboratore` (**0**) | Q-CONT | **da-verificare** | Lordo/ritenuta/netto. No FK verso rda/oda. |
| Richiesta notula (self-service) | — | `qcont.richiesta_notula` (**0**) | Q-CONT | portato | Link tokenizzato. Non avviato. |
| Anagrafica fornitori | anagrafica aziende Qnet (dump perso) | `qcont.anagrafica` (65) | Q-CONT | divergente-voluto | `azienda_hub_id` quasi sempre null. Cerotto locale. |
| Fornitore dettagli | (dump perso) | `qcont.fornitore_dettagli` | Q-CONT | **da-verificare** | Non interrogata in dettaglio. |
| Flag `is_fornitore` | campo anagrafica Qnet | `qcont.anagrafica.is_fornitore` | Q-CONT | **da-verificare** | LEGGE 27/06: sarà tag su Azienda master Hub. |
| Lista bonifici | `bank_slip*` (dump perso) | `qcont.lista_bonifici` + righe (**0**) | Q-CONT | **da-verificare** | Doppia firma CFO+DG. ~1.012 bonifici GREEN non importati. |
| Movimento bancario | `amministrazione_movimenti*` (dump perso) | `qcont.movimento_bancario` (**0**) | Q-CONT | **da-verificare** | Matching automatico mai avviato. |
| Pagamento provvigione partner | Prospetto Contabilità Discenti | 3 tabelle Q-CONT (snapshot/regola/calcolata) | Q-CONT | divergente-voluto | Wallet €0: `provvigione_validata`=false per tutti. Bridge PR #1047. |
| Regola provvigione | — (% per discente) | `qcont.regola_provvigione_partner` (**0**) | Q-CONT | portato | Storicizza la regola. Non alimentata. |
| Conto sede — anticipi partner | — | `qcont.costo_partner_anticipato` (**0**) | Q-CONT | portato | Solo-Workspace. Per sede e commessa. |
| Conto sede — anticipo Qualifica | — | `qcont.anticipo_qualifica_a_partner` (**0**) | Q-CONT | portato | Rovescio del precedente. Compensazione 50/50. |
| Provvigioni discenti (per-discente) | `/students → partner_*` | STW `partner_*` + Q-CONT `importo_provvigione` | STW/Q-CONT | divergente-voluto | Manca `partner_id` FK reale. |
| Importo ODA discente | `/students → importo_oda` | STW + Q-CONT `importo_oda` | STW/Q-CONT | portato | ODA reale non ancora generato (oda=0). |
| Dettaglio costi per tipo | `/students → dettaglio_costi[]` | `qcont.costo_docente_corso` (cerotto) | Q-CONT | divergente-voluto | Fonte canonica = Qnet API live. |
| Ciclo passivo decreti | campi `*_da_decreto` su `/orders` | `qcont.decreto_regione` | Q-CONT | **da-verificare** | Non interrogata colonna per colonna. |
| Commessa codice esterno (ponte) | `orders.id` | `commessa_codice_esterno` (text in oda/rda/fp…) | Q-CONT | divergente-voluto | Testo senza FK reale tra DB. |
| Riconciliazione bancaria | `amministrazione_movimenti*` (dump perso) | stack upload/movimento/regole/log (**0**) | Q-CONT | **da-verificare** | Mai avviato. FASE 2. |
| Piano dei conti | piano conti Qnet (dump perso) | `qcont.piano_conti` | Q-CONT | **da-verificare** | Nessun mapping verso Qnet. |
| Pagamenti effettivi GREEN | ~1.012 distinte PDF (non in DB) | `qcont.lista_bonifici` (**0**) | Q-CONT | **mancante** | Gap operativo più critico GAMBA 1. |
| Gamba 2 (partner anticipa) | — | costo/anticipo/`fp_anticipo` (**0**) | Q-CONT | **mancante** | Compensazione mai prodotta dati. |
| Ritenuta acconto / INPS | — | `notula_collaboratore` (lordo/ritenuta/netto) | Q-CONT | portato | Logica coerente col modello. |
| BEF (cedolino/liquidazione) | — | `qcont.bef` | Q-CONT | **da-verificare** | Collegata a fp/notula/bonifici. |

> **🔴 Gap critici del blocco — Contabilità Passiva**
> 1. **GAMBA 1 bonifici GREEN**: ~1.012 distinte solo in scansioni PDF. Impossibile riconciliare senza digitalizzazione.
> 2. **ODA / RDA / Notula a ZERO in produzione**: il ciclo RDA→ODA→FTP esiste solo come schema.
> 3. **Ponte partner→Azienda non costruito**: `provvigione_validata`=false per tutti i 55 partner, `azienda_hub_id`=null. Wallet €0. Bridge senza cron.
> 4. **Dump Qnet perso**: tutte le 28 tabelle Contabilità e 5 Acquisti non confrontabili campo-per-campo.
> 5. **Fattura passiva SDI non in uso**: 1 sola riga.
> 6. **Riconciliazione bancaria mai avviata**: 0 movimenti.
> 7. **`commessa_codice_esterno` come text senza FK**: nessun vincolo di integrità tra STW e Q-CONT.
> 8. **Gamba 2 a ZERO**: la compensazione 50/50 cogestione non ha mai prodotto dati reali.

---

## Conteggio per stato

| Stato | Anagrafiche | Commesse | Discenti | Cont. Attiva | Cont. Passiva | **Totale** |
|---|---:|---:|---:|---:|---:|---:|
| **portato** | 28 | 41 | 27 | 14 | 6 | **116** |
| **mancante** | 10 | 8 | 9 | 9 | 3 | **39** |
| **divergente-voluto** | 9 | 11 | 4 | 7 | 4 | **35** |
| **scartato-apposta** | 0 | 2 | 0 | 9 | 1 | **12** |
| **da-verificare** | 3 | 3 | 1 | 3 | 11 | **21** |
| **Totale righe** | **50** | **65** | **41** | **42** | **25** | **223** |

**Lettura per il CEO:** circa la metà dei concetti (**116/223**) è **già portata** correttamente. Restano **39 buchi veri** (dato che serve e non c'è) e **21 righe sospese** che non si possono chiudere finché manca il dump Qnet — quasi tutte nella Contabilità Passiva, l'area meno avviata.

---

## TOP 5 gap da chiudere per primi

1. **Bonifici GREEN su PDF (GAMBA 1)** — ~1.012 distinte di pagamento ai discenti esistono solo come scansioni cartacee: né Q-CONT, né STW, né Qnet le contengono in modo strutturato. Senza digitalizzazione, l'intero ciclo passivo non si può riconciliare. *È il blocco operativo più grave.*

2. **Ponte Partner → Azienda + cron provvigioni** — il wallet partner mostra €0 perché `azienda_hub_id` è quasi sempre vuoto, `provvigione_validata` è false per tutti i 55 partner e il bridge delle provvigioni (PR #1047) è girato una volta sola. Serve agganciare i partner all'anagrafica master e mettere un cron. *Sblocca €1,66 mln di provvigioni già calcolate.*

3. **Mirror utenti Qnet vuoto (`qnet_mirror_users`)** — 0 righe: non si riesce a dire "questo utente Qnet è questa persona dell'Hub" per il 76% dei dipendenti. *Base dell'identità unica e dell'audit "chi cambia cosa".*

4. **Flag `is_cliente` / `is_partner` su Hub + Q-CONT agganciato** — la LEGGE delle 3 anagrafiche vuole questi tag sull'Hub come fonte unica, ma mancano del tutto; in più Q-CONT è scollegato (1/65 agganciato) e Sales tiene una tabella `partner` separata che viola la regola. *Senza questo, "una sola anagrafica" resta sulla carta.*

5. **`meta` JSONB delle commesse mai scritto + righe-costo dettagliate** — il record grezzo Qnet non viene salvato e il dettaglio costi per docente non ha casa: ogni campo non mappato è perso e il Prospetto Partner / Bilancio Preventivato non è costruibile. *Recuperare il grezzo costa poco e protegge da futuri buchi.*

---

# 🔍 Critico di completezza

Analizzo i blocchi del registro di parità per estrarre le tre liste richieste.

## Registro di completezza — Sintesi parità Workspace ↔ Qnet

### 1. Da richiedere a CIRO (dump Qnet perso → impossibile mappare campo-per-campo)

**Endpoint API che NON esistono in V2 (servono per chiudere il ciclo):**
- `/invoices/active`, `/scadenze`, `/incassi` — tutto il ciclo attivo Qnet non è sincronizzabile.
- Endpoint **righe-costo commessa** (`FOR_Docenti` per docente, `FOR_Piattaforma`, `FOR_Commissione`) → serve per Prospetto Partner, Bilancio Preventivato e riconciliazione costi docenti vs ODA.
- Endpoint `/orders/{id}` dettaglio: campi `data_pian_inizio`, righe Scheda Bilancio Preventivato non arrivano dal list endpoint.
- Pagina `/listrequestproforma` (richieste pre-emissione) e builder proforma (righe servizio, Pagamento, Banca/IBAN, multi-scadenza).

**Schema/contenuto Qnet da farsi mandare (non confrontabili senza dump):**
- 28 tabelle Contabilità + 5 tabelle Acquisti (intero blocco passivo è "da-verificare lato Qnet").
- Campi CRM Scheda Azienda: `assigned_id` (Gestore Interno), `assigned_id_2` (Supervisore), `agent`, `source_id` (Fonte), Classe Dimensionale, tabella **Contatti Collegati** (N:N azienda-contatto con ruolo).
- `business_unit_id` e `edition_id` (mapping master BU/edizioni Qnet).
- Conferma copertura reale campi FOR (`ore_totali`, `numero_discenti`, `classe_title` al 69% atteso).
- `opportunita_for_gol` (13.146 righe lead): **non trovata in Sales** — chiedere se rinominata/eliminata prima di costruirci sopra.

### 2. Divergenze VOLUTE per regola nostra (NON "correggere" durante l'allineamento)

- **`gia_incassato` / `da_incassare` NON copiati da Qnet**: scelta deliberata per non sovrascrivere dati manuali. Fonte canonica dell'incassato resta da fissare, ma il sync che li salta è intenzionale (gap B mapping 19/06). Vale anche per `totale_ricevuto_regione`, `saldo/anticipo_euro_da_decreto`.
- **Workspace = fonte PRIMARIA del ciclo attivo** (proforma, FA, scadenze, incassi): poiché Qnet non espone API, l'emissione resta in Qnet ma il dato master Workspace non va riallineato verso Qnet.
- **Regola 1-fonte via Hub**: STW e Sales NON devono sincronizzare `/customers` da Qnet — devono leggere da Hub. I tre mirror attuali sono una violazione *da risolvere*, non lo stato target.
- **`discente_origine_gol.partner_manuale`** (override SEDE→PARTNER GOL fuori Campania): è un override **nostro** sopra il dato Qnet — non è un disallineamento da "correggere", è la mappa CAM vs fuori-CAM.
- **Modello dati nostro più ricco di Qnet**: tabelle multi-rata ISO dedicate, wallet partner Q-CONT, registro audit — non hanno corrispettivo Qnet e non vanno appiattiti.
- **Settori/flag Hub** (`is_cliente`, `is_partner`, `sector_ea`): la LEGGE 3-anagrafiche impone questi tag su Hub anche se Qnet non li ha così — la divergenza è voluta (Hub arricchisce), il problema è solo che NON sono ancora valorizzati.

### 3. I 3 GAP PIÙ RISCHIOSI se ignorati

**🔴 GAP 1 — SOLDI: provvigioni partner non girano in automatico**
Il bridge `bridge-provvigioni-stw.py` (PR #1047) è **una-tantum, senza cron**. I 1.156 discenti con provvigione in STW non si propagano a `Q-CONT.discente_commessa`. In più: `agente_commerciale.provvigione_validata=false` per tutti i 55 partner, `anagrafica.azienda_hub_id=null`, wallet a €0, e tre anagrafiche partner separate senza FK comune (STW=text, FOR=uuid, Q-CONT=uuid). **Effetto: partner non pagati o pagati a mano, importi non riconciliabili.** Inoltre `oda=0, rda=0, notula=0` in produzione e ~1.012 distinte bonifici GREEN solo su PDF cartacei → ciclo passivo non riconciliabile.

**🔴 GAP 2 — DATI PERSI: `meta` JSONB grezzo mai scritto su `commesse`**
Il record grezzo Qnet NON è salvato in `commesse.meta` (contro il pattern sync). **Ogni campo non mappato in colonna flat è perso per sempre** — e con il dump Qnet andato perso, non è più recuperabile a posteriori. Vale anche per `commessa_riepilogo_costi` che tiene solo il totale aggregato (dettaglio costi per docente perso). Priorità assoluta: attivare la scrittura di `meta` prima del prossimo giro di sync.

**🔴 GAP 3 — LOGIN/IDENTITÀ: `qnet_mirror_users` vuoto (0/176)**
Impossibile risolvere `qnet_user_id → persona Hub` per il **76% dei dipendenti** (161 HR). L'identità Qnet↔Workspace per gli utenti interni è rotta: blocca write-back su Qnet, attribuzione azioni nel registro audit e risoluzione inversa GA1-4 (STW ha solo i nomi testuali, gli ID vivono solo in `Sales.qnet_opportunita`). **Effetto: chi-ha-fatto-cosa non tracciabile e identità non federabile.**

---
**Nota trasversale:** il bug codice in `route.ts` POST `/api/fatture` inserisce `bu_codice` (colonna inesistente; è `fa_codice`) — da correggere subito, indipendentemente dall'allineamento.