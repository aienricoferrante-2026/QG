# FOR · Campi disponibili
_File JSON sorgente: `dashboard_FOR_CM/data/commesse_for.json` · 1346 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | null | Agente | 0/1346 | `` | Commerciale partecipante (referente vendita) |
| `anticipoDataAccredito` | date (dd-mm-yyyy) | Anticipo Data Accredito | 1/1346 | `"19-11-2025"` | Data accredito anticipo |
| `anticipoDataRichiesta` | date (dd-mm-yyyy) | Anticipo Data Richiesta | 82/1346 | `"23-09-2024"` | Data richiesta anticipo |
| `anticipoDecreto` | integer | Anticipo € da Decreto | 86/1346 | `20325` | Importo da decreto anticipo (€) |
| `anticipoIdRichiesta` | integer | Anticipo Id. Richiesta | 79/1346 | `"5497"` | ID richiesta anticipo |
| `anticipoImporto` | integer | Anticipo Importo | 82/1346 | `20325` | Importo anticipo Regione (€) |
| `avanzamento` | integer | Avanzamento | 1346/1346 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 1346/1346 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 3/1346 | `"frattamaggiore"` | Città cliente |
| `cliente` | string | Cliente | 1346/1346 | `"Prova Qualifica group"` | Ragione sociale cliente |
| `codClasse` | string | Codice Classe | 903/1346 | `"12987_1_ED 8_OPERATORE DELL'INFANZIA_..."` | Codice classe corso |
| `consulenza` | integer | Importo Consulenza | 1346/1346 | `0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/1346 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 1345/1346 | `"Gestione Interna  Qualifica Group"` | Codice contratto |
| `corso` | string | Corso | 903/1346 | `"OPERATORE DELL'INFANZIA"` | Nome corso |
| `costi` | integer | Totale Costi | 1346/1346 | `0` | Totale costi (€) |
| `costiDocum` | integer | Costi Documentali | 1346/1346 | `0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 1346/1346 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 904/1346 | `"31-05-2024"` | Data assegnazione al tecnico |
| `dataEsame` | date (dd-mm-yyyy) | Data Esame | 191/1346 | `"27-05-2024"` | Data esame corso |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 892/1346 | `"22-07-2025"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 896/1346 | `"03-02-2025"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 1346/1346 | `"31-05-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 6/1346 | `"27-06-2025"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/1346 | `` | Descrizione estesa |
| `ecCostiCons` | integer | Ec. Costi Cons. | 1346/1346 | `0` | Costi economici consuntivati (€) |
| `ecMolCons` | integer | Ec. MOL Cons. | 1346/1346 | `0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | integer | Ec. Ricavi Cons. | 1346/1346 | `0` | Ricavi economici consuntivati (€) |
| `ed` | integer | ED | 908/1346 | `896` | Edizione corso |
| `erpLink` | url | _(no alias)_ | 1346/1346 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | integer | Fin. Delta Tot. | 1346/1346 | `0` | Delta finanziario (€) |
| `finIncassiTot` | integer | Fin. Incassi Tot. | 1346/1346 | `0` | Totale incassi finanziari (€) |
| `finUsciteTot` | integer | Fin. Uscite Tot. | 1346/1346 | `0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 1335/1346 | `"SICUREZZA"` | Funzione aziendale (linea di business) |
| `giaIncassato` | integer | Già Incassato | 1346/1346 | `0` | Importo già incassato (€) |
| `id` | integer | ID | 1346/1346 | `"7989"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 1346/1346 | `"6922"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 3/1346 | `"viale delle industrie snc"` | Indirizzo cliente |
| `mol` | integer | MOL Effettivo | 1346/1346 | `0` | Margine Operativo Lordo (€) |
| `molDocum` | integer | MOL Documentale | 1346/1346 | `0` | MOL documentale (€) |
| `note` | null | Note | 0/1346 | `` | Note libere |
| `ore` | integer | Totale Ore | 903/1346 | `300` | Ore totali corso |
| `pctAvanzEc` | integer | % Avanzamento Ec. | 145/1346 | `20` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 144/1346 | `11305.85` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 144/1346 | `30100.15` | % MOL economico sul totale |
| `pctRicaviEc` | integer | % Ricavi Economici | 144/1346 | `41406` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 1346/1346 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 1344/1346 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 904/1346 | `". SOLLECITI"` | Tecnico responsabile esecuzione |
| `ricavi` | integer | Totale Ricavi, Totale Ricavo | 1346/1346 | `0` | Totale ricavi (€) |
| `ricaviDocum` | integer | Ricavi Documentali | 1346/1346 | `0` | Ricavi documentali fatturati (€) |
| `saldoDataAccredito` | date (dd-mm-yyyy) | Saldo Data Accredito | 2/1346 | `"12-03-2024"` | Data accredito saldo |
| `saldoDataRichiesta` | date (dd-mm-yyyy) | Saldo Data Richiesta | 149/1346 | `"29-05-2024"` | Data richiesta saldo |
| `saldoDecreto` | integer | Saldo € da Decreto | 216/1346 | `41280` | Importo da decreto saldo (€) |
| `saldoDecretoNum` | string | Saldo Decreto Numero e Data | 4/1346 | `"2024-03-19"` | Numero e data decreto saldo |
| `saldoIdRichiesta` | integer | Saldo Id Richiesta | 212/1346 | `"3626"` | ID richiesta saldo |
| `saldoImporto` | number | Saldo Importo | 135/1346 | `35743.56` | Importo saldo Regione (€) |
| `sede` | string | Sede | 1344/1346 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 1346/1346 | `"Frattamaggiore - -"` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 1346/1346 | `"-"` | Sede operativa cliente |
| `segnalatore` | null | Segnalatore | 0/1346 | `` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 1344/1346 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoClasse` | string | Stato Classe | 821/1346 | `"Chiusa"` | Stato della classe corso (FOR-specifico) |
| `statoCorso` | string | Stato Corso | 822/1346 | `"Concluso"` | Stato del corso (FOR-specifico) |
| `statoLav` | string | Stato Lavorazione | 1/1346 | `"CONCLUSO_DA RENDICONTARE"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 1335/1346 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 1346/1346 | `"Chiusa"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 1346/1346 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 1346/1346 | `"FOR_OPI_1_GOL_CAM_Fratta 1_1"` | Titolo descrittivo della commessa |
| `totRicavo` | integer | _(no alias)_ | 119/1346 | `40510` | Totale ricavo aggregato (€) |
| `totRicevutoRegione` | integer | Totale Ricevuto Regione | 119/1346 | `40510` | Totale ricevuto da Regione (€) |
| `ultimaNota` | null | Ultima Nota | 0/1346 | `` | Testo ultima nota |
