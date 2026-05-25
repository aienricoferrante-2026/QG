# SIC · Campi disponibili
_File JSON sorgente: `dashboard_SIC_CM/data/commesse_sic.json` · 2650 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 2522/2650 | `"Cacciapuoti Leo"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 2650/2650 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 2650/2650 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 2613/2650 | `"Roma"` | Città cliente |
| `cliente` | string | Cliente | 2650/2650 | `"** QUALIFICA GROUP S.r.l."` | Ragione sociale cliente |
| `consulenza` | integer | Importo Consulenza | 2650/2650 | `300` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/2650 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 2647/2650 | `"prova appuntamento sic"` | Codice contratto |
| `costi` | number | Totale Costi | 2613/2650 | `0.0` | Totale costi (€) |
| `costiDocum` | integer | Costi Documentali | 2650/2650 | `0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 2613/2650 | `300.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 2368/2650 | `"04-03-2024"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 2234/2650 | `"06-03-2024"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 2613/2650 | `"16-03-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 2650/2650 | `"16-03-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 2431/2650 | `"01-03-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/2650 | `` | Descrizione estesa |
| `ecCostiCons` | integer | Ec. Costi Cons. | 2650/2650 | `0` | Costi economici consuntivati (€) |
| `ecMolCons` | integer | Ec. MOL Cons. | 2650/2650 | `300` | MOL economico consuntivato (€) |
| `ecRicaviCons` | integer | Ec. Ricavi Cons. | 2650/2650 | `300` | Ricavi economici consuntivati (€) |
| `ente` | integer | Ente di Riferimento | 2650/2650 | `0` | Importo Ente certificatore / pagato all'ente (€) |
| `erpLink` | url | _(no alias)_ | 2650/2650 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | integer | Fin. Delta Tot. | 2650/2650 | `0` | Delta finanziario (€) |
| `finIncassiTot` | integer | Fin. Incassi Tot. | 2650/2650 | `0` | Totale incassi finanziari (€) |
| `finUsciteTot` | integer | Fin. Uscite Tot. | 2650/2650 | `0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 2632/2650 | `"SICUREZZA"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 2613/2650 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 2650/2650 | `"3039"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 2650/2650 | `"2515"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 2641/2650 | `"via zoe fontana 220"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 2613/2650 | `300.0` | Margine Operativo Lordo (€) |
| `molDocum` | integer | MOL Documentale | 2650/2650 | `0` | MOL documentale (€) |
| `note` | string | Note | 372/2650 | `"Antonio Carbone <a.carbone@qualificag..."` | Note libere |
| `pctAvanzEc` | integer | % Avanzamento Ec. | 2650/2650 | `0` | % Avanzamento economico |
| `pctCostiEc` | integer | % Costi Economici | 2650/2650 | `0` | % Costi economici sul totale |
| `pctMolEc` | integer | % MOL Economico | 2650/2650 | `0` | % MOL economico sul totale |
| `pctRicaviEc` | integer | % Ricavi Economici | 2650/2650 | `0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 2650/2650 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 2632/2650 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 2368/2650 | `"Rettori Elio"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 2613/2650 | `300.0` | Totale ricavi (€) |
| `ricaviDocum` | integer | Ricavi Documentali | 2650/2650 | `0` | Ricavi documentali fatturati (€) |
| `sede` | string | Sede | 2632/2650 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 2650/2650 | `"Roma - -"` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 2650/2650 | `"-"` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 115/2650 | `"Salvatore  Laura"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 2632/2650 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 285/2650 | `"Pratica conclusa"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 1937/2650 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 2650/2650 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 2650/2650 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 2650/2650 | `"prova appuntamento sic_1"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/2650 | `` | Testo ultima nota |
