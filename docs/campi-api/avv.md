# AVV · Campi disponibili
_File JSON sorgente: `dashboard_AVV_CM/data/commesse_avv.json` · 328 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 246/328 | `"Agnolini Sabrina"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 328/328 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 328/328 | `"0% -"` | Avanzamento numerico raw |
| `avvAnno` | integer | Anno | 128/328 | `"2023"` | Anno avvalimento |
| `avvCIG` | string | CIG | 20/328 | `"98861526B6"` | CIG gara per cui si fornisce avvalimento |
| `avvCategoria` | string | Categoria | 48/328 | `"OS4"` | Categoria avvalimento (singola) |
| `avvCategorie` | array | _(no alias)_ | 328/328 | `[]` | Lista categorie avvalimento |
| `avvClassifica` | string | Classifica | 2/328 | `"IV"` | Classifica SOA avvalimento (singola) |
| `avvClassifiche` | array | _(no alias)_ | 328/328 | `[]` | Lista classifiche SOA |
| `avvTipo` | string | Tipo | 311/328 | `"Pacchetto"` | Tipo avvalimento |
| `citta` | string | Città | 322/328 | `"NONANTOLA"` | Città cliente |
| `cliente` | string | Cliente | 326/328 | `"OLIVA S.R.L."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 328/328 | `900.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/328 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 328/328 | `"AVV_PacchettoAvvalimento"` | Codice contratto |
| `costi` | number | Totale Costi | 328/328 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 328/328 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | number | Da Incassare | 328/328 | `900.0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 301/328 | `"22-02-2023"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 198/328 | `"12-04-2023"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 328/328 | `"22-02-2023"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 328/328 | `"22-02-2023"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 116/328 | `"12-04-2023"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/328 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 328/328 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 328/328 | `900.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 328/328 | `900.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(no alias)_ | 328/328 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 328/328 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 328/328 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 328/328 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 47/328 | `"AVVALIMENTI"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 328/328 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 328/328 | `"2740"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 328/328 | `"2200"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 326/328 | `"VIA PROVINCIALE OVEST, 109/1"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 328/328 | `900.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 328/328 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 10/328 | `"GARA CONCLUSA - NON AGGIUDICATA"` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 71/328 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 6/328 | `1.8` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 62/328 | `180.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 56/328 | `180.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 328/328 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 328/328 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 301/328 | `"Vitagliano Angela"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 328/328 | `900.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 328/328 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(no alias)_ | 328/328 | `"AVV"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 328/328 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 328/328 | `"Nonantola - Via Sepano, lotto 28 -  F..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 328/328 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 3/328 | `"Salvatore  Laura"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 328/328 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 213/328 | `"Chiusura"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 239/328 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 328/328 | `"In Lavorazione"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 328/328 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 328/328 | `"AVV_PacchettoAvvalimento_2023"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/328 | `` | Testo ultima nota |
