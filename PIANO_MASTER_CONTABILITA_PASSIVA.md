# Piano Master ERP — Dominio: CONTABILITÀ PASSIVA (dettaglio)

> Companion del [PIANO_MASTER_ERP.md](PIANO_MASTER_ERP.md). Schema definitivo + 15 slice strangler (CP-1→CP-15). Tutte le tabelle vivono nel DB unico `bqyqr`, schema `contabilita`. Regola "manuale vince" sui campi di pagamento. Fonte Qnet reale: `OrderController.php` (`amministrazione_pagamenti_*`, `proformforas`).

### Schema definitivo — Contabilità passiva

| Tabella target | Ruolo | Origine |
|---|---|---|
| `contabilita.anagrafica` | nucleo (fornitori/clienti/partner = ruoli, flag is_*) | Q-CONT `anagrafica` (65) → consolida con Hub `aziende` |
| `contabilita.anagrafica_fornitore_ext` | estensione (qualifica fornitore) | `fornitore_dettagli` |
| `contabilita.anagrafica_partner_ext` | estensione (rapporto partner) | `partner_dettagli` |
| `contabilita.rda` | estensione (richiesta acquisto) | `rda` |
| `contabilita.oda` | estensione (ordine acquisto + BEF/PDF) | `oda` · `/invoices/passive` Qnet |
| `contabilita.arrivo_merce` | satellite di oda (1:N) | `arrivo_merce` |
| `contabilita.fattura_passiva` | estensione (FTP / SDI passivo) | `fattura_passiva` · `amministrazione_pagamenti_registraziones` Qnet |
| `contabilita.fp_anticipo` | satellite (anticipo da compensare) | `fp_anticipo` |
| `contabilita.matching_log` | satellite (verifica ODA↔FP) | `matching_log` |
| `contabilita.notula_collaboratore` | estensione (parcella collaboratore) | `notula_collaboratore` |
| `contabilita.richiesta_notula` | satellite (link self-service) | `richiesta_notula` |
| `contabilita.bef` | estensione (autorizzazione a fatturare) | `bef` |
| `contabilita.conto_bancario` | nucleo (conto aziendale) | `conto_bancario` |
| `contabilita.movimento_bancario` | satellite di conto (1:N) | `movimento_bancario` · `amministrazione_pagamenti_registrazione_movimentis` Qnet |
| `contabilita.regola_matching_movimento` | satellite config | `regola_matching_movimento` |
| `contabilita.lista_bonifici` | estensione (distinta pagamenti, doppia firma) | `lista_bonifici` · `bank_slip*` Qnet |
| `contabilita.lista_bonifici_riga` | satellite (1:N) | `lista_bonifici_riga` |
| `contabilita.agente_commerciale` | estensione (rapporto provvigionale; agente = anagrafica is_partner) | `agente_commerciale` (55) |
| `contabilita.regola_provvigione` | satellite (regola % storicizzata) | `regola_provvigione` |
| `contabilita.provvigione_calcolata` | satellite (provvigione per periodo) | `provvigione_calcolata` |
| `contabilita.imputazione_partner` | satellite (riaddebiti partner) | `imputazione_partner` |
| `contabilita.imputazione_interna` | estensione (costo/ricavo manuale → CdG) | `imputazione_interna` |
| `contabilita.anticipo_qualifica_a_partner` | satellite (anticipo a partner) | `anticipo_qualifica_a_partner` |
| `contabilita.costo_partner_anticipato` | satellite (gamba 2 cogestione) | `costo_partner_anticipato` |
| `contabilita.adempimento_fiscale` | estensione (scadenze F24/IVA) | `adempimento_fiscale` |
| `contabilita.piano_conti` | nucleo (master classificazione) | `piano_conti` |
| `contabilita.accesso_partner` + `_log` | satellite (portale partner) | `accesso_partner` |
| `contabilita.quota_cogestione_sede` | satellite (% cogestione per sede) | `quota_cogestione_sede` |

### Slice — Contabilità passiva (CP-1 → CP-15)

| # | Slice | Tipo | Rischio | Gate | Note |
|---|---|---|---|---|---|
| CP-1 | Crea schema `contabilita` | expand | basso | custode✅+OK | schema-cassetto vuoto |
| CP-2 | Aggancio `anagrafica`→Hub `aziende` (match P.IVA/CF) | migrate | medio | — | manuale vince |
| CP-3 | FK anagrafica→aziende (preparatoria) | repoint | basso | — | bloccante successive |
| CP-4 | Tabelle nucleo/estensione anagrafica | expand | basso | custode✅ | additivo |
| CP-5 | Tabelle ciclo RDA/ODA/FTP/BEF | expand | basso | custode✅ | manuale vince su oda.pagato_da, fp.standby |
| CP-6 | Tabelle pagamenti/bancario | expand | basso | custode✅ | manuale vince su lista_bonifici_riga.eseguito |
| CP-7 | Tabelle provvigioni/partner | expand | basso | custode✅ | manuale vince su pagata_il |
| CP-8 | Tabelle ausiliarie (notule, adempimenti, piano conti) | expand | basso | custode✅ | — |
| CP-9 | Travaso anagrafica (65 righe) | migrate | basso | — | idempotente |
| CP-10 | Travaso ciclo RDA/ODA/FTP/BEF | migrate | basso→cresce | — | doppio write |
| CP-11 | Travaso pagamenti + provvigioni | migrate | medio | — | importi reali, reconciliation |
| CP-12 | Travaso ausiliarie | migrate | basso | — | — |
| CP-13 | Sync Qnet→provvigioni (cron, era one-shot) | sync | **alto** | — | sblocca €1,66M; manuale vince |
| CP-14 | Repoint app qcont (eqprz→bqyqr.contabilita) | repoint | **alto** | 🔴 OK deploy | funzione per funzione, doppio write |
| CP-15 | Contract: rename→DEPRECATED→DROP (30gg) | contract | basso | 🔴 OK DROP | mai toccare mirror Qnet |
