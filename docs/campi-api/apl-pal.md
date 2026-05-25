# APL_PAL · Campi disponibili
_File JSON sorgente: `dashboard_APL_PAL_CM/data/commesse_apl_pal.json` · 1415 record._
[← Indice](README.md) · [Alias map](_alias-map.md) · [Endpoint API](_endpoints.md)

| Chiave | Tipo | Header Excel italiano | Coverage | Esempio | Descrizione |
|---|---|---|---|---|---|
| `agente` | string | Agente | 351/1415 | `"D'ambra Elio"` | Commerciale partecipante (referente vendita) |
| `avanzamento` | integer | Avanzamento | 1415/1415 | `0` | % avanzamento dichiarato (0-100) |
| `avanzamentoRaw` | string | _(no alias)_ | 1415/1415 | `"0% -"` | Avanzamento numerico raw |
| `citta` | string | Città | 18/1415 | `"Roma"` | Città cliente |
| `cliente` | string | Cliente | 1415/1415 | `"** QUALIFICA GROUP S.r.l."` | Ragione sociale cliente |
| `consulenza` | number | Importo Consulenza | 1415/1415 | `0.0` | Importo consulenza (€) |
| `contatto` | null | Contatto | 0/1415 | `` | Contatto operativo cliente |
| `contratto` | string | Contratto | 1415/1415 | `"prova pal 04/01"` | Codice contratto |
| `costi` | number | Totale Costi | 1415/1415 | `0.0` | Totale costi (€) |
| `costiDocum` | number | Costi Documentali | 1415/1415 | `0.0` | Costi documentali ricevuti (€) |
| `daIncassare` | integer | Da Incassare | 1415/1415 | `0` | Importo da incassare (€) |
| `dataAssegnazione` | date (dd-mm-yyyy) | Data Assegnazione | 1337/1415 | `"04-01-2024"` | Data assegnazione al tecnico |
| `dataFine` | date (dd-mm-yyyy) | Data Fine | 375/1415 | `"09-01-2024"` | Data fine effettiva |
| `dataInizio` | date (dd-mm-yyyy) | Data Inizio | 1415/1415 | `"05-01-2024"` | Data inizio effettiva (dd-mm-yyyy) |
| `dataPianInizio` | date (dd-mm-yyyy) | Data Pian. Inizio | 1415/1415 | `"05-01-2024"` | Data inizio pianificata |
| `dataUltimaNota` | date (dd-mm-yyyy) | Data Ultima Nota | 350/1415 | `"04-01-2024"` | Data dell'ultima nota inserita |
| `descrizione` | null | Descrizione | 0/1415 | `` | Descrizione estesa |
| `ecCostiCons` | number | Ec. Costi Cons. | 1415/1415 | `0.0` | Costi economici consuntivati (€) |
| `ecMolCons` | number | Ec. MOL Cons. | 1415/1415 | `0.0` | MOL economico consuntivato (€) |
| `ecRicaviCons` | number | Ec. Ricavi Cons. | 1415/1415 | `0.0` | Ricavi economici consuntivati (€) |
| `erpLink` | url | _(no alias)_ | 1415/1415 | `"https://qualificagroup.org/manageorde..."` | URL ERP della commessa |
| `finDeltaTot` | number | Fin. Delta Tot. | 1415/1415 | `0.0` | Delta finanziario (€) |
| `finIncassiTot` | number | Fin. Incassi Tot. | 1415/1415 | `0.0` | Totale incassi finanziari (€) |
| `finUsciteTot` | number | Fin. Uscite Tot. | 1415/1415 | `0.0` | Totale uscite finanziarie (€) |
| `funzione` | string | Funzione aziendale, Funzione | 1334/1415 | `"APL"` | Funzione aziendale (linea di business) |
| `giaIncassato` | number | Già Incassato | 1415/1415 | `0.0` | Importo già incassato (€) |
| `id` | integer | ID | 1415/1415 | `"4739"` | ID univoco Qnet della commessa |
| `idContratto` | integer | ID Contratto | 1415/1415 | `"5161"` | ID Qnet del contratto |
| `indirizzo` | string | Indirizzo | 18/1415 | `"via zoe fontana 220"` | Indirizzo cliente |
| `mol` | number | MOL Effettivo | 1415/1415 | `0.0` | Margine Operativo Lordo (€) |
| `molDocum` | number | MOL Documentale | 1415/1415 | `0.0` | MOL documentale (€) |
| `note` | string | Note | 18/1415 | `"PRIMA FINESTRA DI RENDICONTAZIONE GOL..."` | Note libere |
| `pctAvanzEc` | number | % Avanzamento Ec. | 1124/1415 | `100.0` | % Avanzamento economico |
| `pctCostiEc` | number | % Costi Economici | 1/1415 | `1600.0` | % Costi economici sul totale |
| `pctMolEc` | number | % MOL Economico | 1004/1415 | `1627.0` | % MOL economico sul totale |
| `pctRicaviEc` | number | % Ricavi Economici | 1004/1415 | `1627.0` | % Ricavi economici sul totale |
| `qnetLink` | url | Link Commessa | 1415/1415 | `"https://qualificagroup.org/manageorde..."` | URL Qnet della commessa |
| `regione` | string | Regione | 1414/1415 | `"Campania"` | Regione cliente |
| `responsabile` | string | Responsabile | 1337/1415 | `"Cangiano Flavia"` | Tecnico responsabile esecuzione |
| `ricavi` | number | Totale Ricavi, Totale Ricavo | 1415/1415 | `0.0` | Totale ricavi (€) |
| `ricaviDocum` | number | Ricavi Documentali | 1415/1415 | `0.0` | Ricavi documentali fatturati (€) |
| `sector` | string | _(no alias)_ | 1415/1415 | `"APL_PAL"` | BU di appartenenza (FOR, ISO, SIC, ecc.) |
| `sede` | string | Sede | 1414/1415 | `"Qualifica Group Srl - HQ"` | Sede legale cliente (Excel) |
| `sedeNorm` | string | _(no alias)_ | 1415/1415 | `"Roma - Via Sepano, lotto 28 -  FRATTA..."` | Sede normalizzata (post-elaborazione) |
| `sedeOp` | string | Sede Operativa | 1415/1415 | `"Via Sepano, lotto 28 -  FRATTAMAGGIOR..."` | Sede operativa cliente |
| `segnalatore` | string | Segnalatore | 9/1415 | `"Gallo  Michele"` | Rete segnalatore (chi ha portato il lead) |
| `societa` | string | Società / Sedi, Società Aziendale | 1414/1415 | `"QUALIFICA GROUP srl"` | Società Gruppo Qualifica che eroga (15 società) |
| `statoLav` | string | Stato Lavorazione | 1265/1415 | `"Controllo saldo pagamento"` | Stato lavorazione interno (workflow di dettaglio) |
| `statoPagamento` | string | Stato Pagamento | 424/1415 | `"Proforma emessa"` | Stato pagamento commessa |
| `status` | string | Status, Stato | 1415/1415 | `"Annullato"` | Status macro (In Lavorazione, Concluso, Annullato, ecc.) |
| `tipoCommessa` | string | Tipo Commessa | 1415/1415 | `"Lavorazione"` | Tipologia commessa (es. Lavorazione, Progetto interno) |
| `titolo` | string | Titolo | 1415/1415 | `"p prova pal 04/01"` | Titolo descrittivo della commessa |
| `ultimaNota` | null | Ultima Nota | 0/1415 | `` | Testo ultima nota |
