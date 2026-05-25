# IST · Campi disponibili
_File JSON sorgente: `dashboard_IST_CM/data/commesse_ist.json` · 52 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 39/52 | `"Ferrante Enrico"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 52/52 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 52/52 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 36/52 | `"Napoli"` | Città cliente |
| `cliente` | string | Cliente | 52/52 | `"ISTITUTO STATALE DI ISTRUZIONE SUPERI..."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 52/52 | `137704.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/52 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 52/52 | `"Campus didattici e innovativi"` | Codice contratto |
| `costi` | number | Totale Costi | 52/52 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 52/52 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 52/52 | `137704.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 52/52 | `"16-02-2026"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 40/52 | `"13-11-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 52/52 | `"16-02-2026"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 52/52 | `"16-02-2026"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 30/52 | `"13-11-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/52 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 52/52 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 52/52 | `137704.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 52/52 | `137704.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(no alias)_ | 52/52 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 52/52 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 52/52 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 52/52 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 4/52 | `"FORMAZIONE, ISO"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 52/52 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 52/52 | `"16657"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 52/52 | `"100905"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 36/52 | `"Via Miano, 290"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 52/52 | `137704.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 52/52 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 1/52 | `"Durata del Corso:  4 ore 1 Aula - 17 ..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 44/52 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 26/52 | `10800.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 43/52 | `107964.12` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 43/52 | `107964.12` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 52/52 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 52/52 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 52/52 | `"Flagiello Ferdinando"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 52/52 | `137704.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 52/52 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(no alias)_ | 52/52 | `"IST"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 52/52 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 52/52 | `"Napoli - Via Sepano, lotto 28 -  FRAT..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 52/52 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 4/52 | `"Trimarco  Francesca"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 52/52 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 48/52 | `"3.1_Inizio attività a scuola"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 26/52 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 52/52 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 52/52 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 52/52 | `"Campus didattici e innovativi_1"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/52 | `` | Testo ultima nota |
