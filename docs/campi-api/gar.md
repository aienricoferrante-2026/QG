# GAR · Campi disponibili
_File JSON sorgente: `dashboard_GAR_CM/data/commesse_gar.json` · 325 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 279/325 | `"Fabozzi Michela"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 325/325 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 325/325 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 317/325 | `"Cardito"` | Città cliente |
| `cliente` | string | Cliente | 325/325 | `"OIKOS COSTRUZIONI s.r.l."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 325/325 | `450.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/325 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 325/325 | `"INFOGARE_ Abbonamento Annuale"` | Codice contratto |
| `costi` | number | Totale Costi | 325/325 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 325/325 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 325/325 | `450.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 269/325 | `"14-02-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 160/325 | `"06-03-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 325/325 | `"14-02-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 325/325 | `"14-02-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 106/325 | `"29-11-2022"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/325 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 325/325 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 325/325 | `450.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 325/325 | `450.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(no alias)_ | 325/325 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 325/325 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 325/325 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 325/325 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 72/325 | `"GARE"` | Funzione aziendale (linea di business) |
| `garAggiudicataria` | string | _(no alias)_ | 1/325 | `"QUALIFICA GROUP SRL"` |  |
| `garAggiudicatariaPunti` | number | _(no alias)_ | 1/325 | `64.0` |  |
| `garAggiudicatariaRibasso` | number | _(no alias)_ | 1/325 | `12999.84` |  |
| `garAggiudicatariaRibassoPct` | number | _(no alias)_ | 1/325 | `11.89` |  |
| `garCIG` | string | CIG | 25/325 | `"B1A7EE8011"` | Codice Identificativo Gara (CIG) |
| `garCategoria` | string | Categoria e Classe Servizi | 6/325 | `"Busta + progetto tecnico + costituzio..."` | Categoria e classe servizi |
| `garDataInserimento` | date (dd-mm-yyyy) | Data Inserimento | 27/325 | `"15-05-2025"` | Data inserimento gara a sistema |
| `garDataScadenza` | date (dd-mm-yyyy) | Data scadenza | 23/325 | `"01-01-2022"` | Data scadenza presentazione offerta |
| `garEnte` | string | Ente Appaltante | 22/325 | `"COMUNE DI MARCIANISE"` | Ente appaltante |
| `garEsito` | integer | Esito | 7/325 | `"12"` | Esito gara (Aggiudicata, Non aggiudicata, ecc.) |
| `garImponibile` | number | _(no alias)_ | 1/325 | `13000.0` |  |
| `garImporto` | number | Importo Gara | 19/325 | `376568.0` | Importo base gara (€) |
| `garNoteEsito` | string | Note Esito | 6/325 | `"ROYALTY QUALIFICA 0,7%"` | Note esito gara |
| `garOggetto` | string | Oggetto | 28/325 | `"Lavori di manutenzione straordinaria ..."` | Oggetto della gara |
| `garOraScadenza` | string | _(no alias)_ | 5/325 | `"10:00:00"` |  |
| `garRibasso` | number | _(no alias)_ | 1/325 | `12999.84` |  |
| `garRibassoPct` | number | _(no alias)_ | 1/325 | `11.89` |  |
| `giaIncassato` | number | Già Incassato | 325/325 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 325/325 | `"2604"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 325/325 | `"2048"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 323/325 | `"Via Parini n.2"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 325/325 | `450.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 325/325 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 7/325 | `"TRASCORSA intera mattinata PER PROCED..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 42/325 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 11/325 | `10.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 36/325 | `90.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 36/325 | `100.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 325/325 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 322/325 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 269/325 | `"Garofalo Anna"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 325/325 | `450.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 325/325 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(no alias)_ | 325/325 | `"GAR"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 325/325 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 325/325 | `"Cardito - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 325/325 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | null | Segnalatore | 0/325 | `` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 325/325 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 116/325 | `"Chiusura"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 179/325 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 325/325 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 325/325 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 325/325 | `"INFOGARE_ Abbonamento Annuale_2023"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/325 | `` | Testo ultima nota |
