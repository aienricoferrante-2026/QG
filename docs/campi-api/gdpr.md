# GDPR · Campi disponibili
_File JSON sorgente: `dashboard_GDPR_CM/data/commesse_gdpr.json` · 695 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 447/695 | `"Cesarini Giampiero"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 695/695 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 695/695 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 661/695 | `"Roma Rm"` | Città cliente |
| `cliente` | string | Cliente | 695/695 | `"Phonetrend - Societa' Cooperativa Soc..."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 695/695 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/695 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 695/695 | `"Gdpr_2019"` | Codice contratto |
| `costi` | number | Totale Costi | 695/695 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 695/695 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 695/695 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 449/695 | `"10-01-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 327/695 | `"11-04-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 695/695 | `"02-01-2024"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 695/695 | `"02-01-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 448/695 | `"11-04-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/695 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 695/695 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 695/695 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 695/695 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(no alias)_ | 695/695 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 695/695 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 695/695 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 695/695 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 678/695 | `"GDPR"` | Funzione aziendale (linea di business) |
| `gdprAccordo` | string | Accordo sui Pagamenti | 4/695 | `"ACC 50% SALDO 50 %"` | Accordo sui pagamenti GDPR (sì/no) |
| `gdprInsoluti` | string | Insoluti | 695/695 | `"No"` | Importo insoluti (€) |
| `gdprStatoPag` | string | _(no alias)_ | 449/695 | `"Giallo ( Iniziare la lavorazione )"` | Stato pagamento GDPR |
| `giaIncassato` | number | Già Incassato | 695/695 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 695/695 | `"804"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 695/695 | `"526"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 670/695 | `"Via La Spezia 6"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 695/695 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 695/695 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 277/695 | `"Durata: 3 anni"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 53/695 | `5.0` | % Avanzamento economico |
| `pctMolEc` | number | % MOL Economico | 40/695 | `480.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 40/695 | `480.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 695/695 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 695/695 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 449/695 | `"D'aiello Stefano"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 695/695 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 695/695 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(no alias)_ | 695/695 | `"GDPR"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 695/695 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 695/695 | `"Roma Rm - Via Sepano, lotto 28 -  FRA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 695/695 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 35/695 | `"Irrera Lillo"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 695/695 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 276/695 | `"APPLICARE PENALI_FR"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 199/695 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 695/695 | `"Da pianificare"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 695/695 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 695/695 | `"Gdpr_2019_3"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/695 | `` | Testo ultima nota |
